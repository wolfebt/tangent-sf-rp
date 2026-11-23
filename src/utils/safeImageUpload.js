/**
 * @file safeImageUpload.js
 * @description Sanitizes and optimizes user-supplied images before Storage upload or state persistence.
 * Rejects or rasterizes SVG payloads via Canvas into PNG/WebP so SVG scripts/event-handlers cannot
 * execute if served directly, and enforces strict MIME & size bounds.
 */

export const ALLOWED_RASTER_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export const DEFAULT_MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MiB
export const DEFAULT_MAX_DIMENSION = 4096;

/**
 * Checks whether a Blob/File or data URI represents an SVG image.
 */
export function isSvgInput(fileOrDataUri) {
  if (!fileOrDataUri) return false;
  if (typeof fileOrDataUri === 'string') {
    return /^data:image\/svg\+xml/i.test(fileOrDataUri.trim()) || /\.svg(\?.*)?$/i.test(fileOrDataUri.trim());
  }
  const type = String(fileOrDataUri.type || '').toLowerCase();
  const name = String(fileOrDataUri.name || '').toLowerCase();
  return type === 'image/svg+xml' || name.endsWith('.svg');
}

/**
 * Checks whether a raw SVG text payload contains active scripting constructs.
 */
export function containsDangerousSvgConstructs(svgText = '') {
  return /<script|\bon[a-z]+\s*=|javascript\s*:|vbscript\s*:|<foreignObject|<iframe|<object|<embed/i.test(
    String(svgText || '')
  );
}

/**
 * Loads an image element safely in browser contexts.
 */
function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    if (typeof Image === 'undefined') {
      reject(new Error('Image API unavailable outside browser'));
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to decode uploaded image'));
    img.src = src;
  });
}

/**
 * Validates and converts an uploaded image File/Blob or safe SVG into a raster Blob
 * (WebP by default with PNG fallback), enforcing size and dimension limits.
 * Throws if an SVG contains dangerous constructs or if MIME/size checks fail.
 */
export async function sanitizeAndOptimizeImageForUpload(
  fileOrBlob,
  {
    maxBytes = DEFAULT_MAX_UPLOAD_BYTES,
    maxDimension = DEFAULT_MAX_DIMENSION,
    preferMimeType = 'image/webp',
    quality = 0.9,
    allowSvgRasterization = true,
  } = {}
) {
  if (!fileOrBlob) {
    throw new Error('No image file provided.');
  }

  const size = Number(fileOrBlob.size || 0);
  if (size <= 0) {
    throw new Error('Uploaded image file is empty.');
  }
  if (size > maxBytes) {
    throw new Error(`Uploaded image exceeds maximum size of ${Math.round(maxBytes / (1024 * 1024))} MiB.`);
  }

  const mime = String(fileOrBlob.type || '').toLowerCase();
  const isSvg = isSvgInput(fileOrBlob);

  if (isSvg) {
    if (!allowSvgRasterization) {
      throw new Error('SVG uploads are disallowed. Please upload PNG, JPEG, or WebP.');
    }
    const svgText = typeof fileOrBlob.text === 'function' ? await fileOrBlob.text() : '';
    if (containsDangerousSvgConstructs(svgText)) {
      throw new Error('Blocked unsafe SVG containing scripts or executable handlers.');
    }
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
      throw new Error('SVG rasterization requires a browser canvas environment.');
    }
    const blobUrl = URL.createObjectURL(fileOrBlob);
    try {
      const img = await loadImageElement(blobUrl);
      const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
      const width = Math.max(1, Math.round((img.width || 512) * scale));
      const height = Math.max(1, Math.round((img.height || 512) * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable for SVG rasterization.');
      ctx.drawImage(img, 0, 0, width, height);
      const outputMime = preferMimeType === 'image/png' ? 'image/png' : 'image/webp';
      const rasterBlob = await new Promise((resolve) => canvas.toBlob(resolve, outputMime, quality));
      if (!rasterBlob) throw new Error('Failed to rasterize SVG image.');
      const ext = outputMime === 'image/png' ? 'png' : 'webp';
      const baseName = String(fileOrBlob.name || 'asset').replace(/\.[^.]+$/, '');
      return {
        blob: rasterBlob,
        contentType: outputMime,
        fileName: `${baseName}.${ext}`,
        wasRasterizedFromSvg: true,
        width,
        height,
      };
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  if (mime && !ALLOWED_RASTER_MIME_TYPES.has(mime)) {
    throw new Error(`Unsupported image type "${mime}". Allowed: PNG, JPEG, WebP, GIF.`);
  }

  // Re-encode JPEG/PNG through canvas when large or WebP conversion requested in browser
  if (
    typeof document !== 'undefined' &&
    typeof URL !== 'undefined' &&
    mime !== 'image/gif' &&
    (preferMimeType === 'image/webp' || mime === 'image/png' || mime === 'image/jpeg')
  ) {
    const objectUrl = URL.createObjectURL(fileOrBlob);
    try {
      const img = await loadImageElement(objectUrl);
      const naturalW = img.width || 0;
      const naturalH = img.height || 0;
      const needsResize = naturalW > maxDimension || naturalH > maxDimension;
      const wantsWebp = preferMimeType === 'image/webp' && mime !== 'image/webp';
      if (needsResize || wantsWebp) {
        const scale = needsResize ? Math.min(1, maxDimension / Math.max(naturalW || 1, naturalH || 1)) : 1;
        const width = Math.max(1, Math.round(naturalW * scale));
        const height = Math.max(1, Math.round(naturalH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const targetMime = preferMimeType === 'image/webp' ? 'image/webp' : mime || 'image/png';
          const outBlob = await new Promise((resolve) => canvas.toBlob(resolve, targetMime, quality));
          if (outBlob && outBlob.size > 0 && outBlob.size <= maxBytes) {
            const ext = targetMime.split('/')[1] || 'webp';
            const baseName = String(fileOrBlob.name || 'asset').replace(/\.[^.]+$/, '');
            return {
              blob: outBlob,
              contentType: targetMime,
              fileName: `${baseName}.${ext}`,
              wasRasterizedFromSvg: false,
              width,
              height,
            };
          }
        }
      }
    } catch {
      // Fallback to original validated raster blob if canvas decode is unavailable (e.g. jsdom)
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  return {
    blob: fileOrBlob,
    contentType: mime || 'image/png',
    fileName: String(fileOrBlob.name || 'asset.png'),
    wasRasterizedFromSvg: false,
  };
}
