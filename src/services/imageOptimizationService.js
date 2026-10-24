/**
 * @file imageOptimizationService.js
 * @description High-efficiency client-side image processing, cropping, and WebP transcoding
 * for Tangent SF RP Character Folios.
 *
 * Enforces:
 * 1. Resolution clamping to standard folio slots (Portrait, Token, Standee, Gallery).
 * 2. High-performance canvas downsampling with bicubic smoothing.
 * 3. Stripping of camera EXIF / GPS metadata (via canvas redraw).
 * 4. Automatic WebP encoding with fallback to JPEG for legacy platforms.
 * 5. Automatic quality step-down if output exceeds 300 KB budget.
 * 6. VTT circular token pog generation with alpha transparency.
 */

export const FOLIO_IMAGE_SLOTS = {
  portrait: {
    id: 'portrait',
    name: 'Character Portrait',
    maxWidth: 768,
    maxHeight: 1024,
    aspectRatio: 3 / 4,
    quality: 0.82,
    mimeType: 'image/webp',
    hasAlpha: false,
    recommendedDesc: 'Bust or half-body portrait (3:4 ratio, max 768x1024)'
  },
  token: {
    id: 'token',
    name: 'VTT Tactical Token',
    maxWidth: 512,
    maxHeight: 512,
    aspectRatio: 1,
    quality: 0.85,
    mimeType: 'image/webp',
    hasAlpha: true,
    recommendedDesc: 'Circular or cutout tactical token pog (1:1 ratio, max 512x512)'
  },
  standee: {
    id: 'standee',
    name: 'Full-Body Standee',
    maxWidth: 600,
    maxHeight: 1200,
    aspectRatio: 1 / 2,
    quality: 0.82,
    mimeType: 'image/webp',
    hasAlpha: true,
    recommendedDesc: 'Full outfit or gear standee (1:2 ratio, max 600x1200)'
  },
  gallery: {
    id: 'gallery',
    name: 'Reference / Mood Art',
    maxWidth: 1280,
    maxHeight: 720,
    aspectRatio: 16 / 9,
    quality: 0.80,
    mimeType: 'image/webp',
    hasAlpha: false,
    recommendedDesc: 'Equipment, vehicle, cyberware or scene art (16:9 ratio, max 1280x720)'
  }
};

/** Max allowed payload in bytes (350 KB safety limit before cloud upload) */
export const MAX_SAFE_IMAGE_BYTES = 350 * 1024;

/**
 * Checks if browser canvas supports WebP export.
 * @returns {boolean}
 */
export function isWebPSupported() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

/**
 * Loads an image source into an HTMLImageElement or ImageBitmap.
 * @param {File|Blob|string} source
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('loadImageElement requires a browser environment.'));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = null;
    if (typeof source === 'string') {
      img.src = source;
    } else if (source instanceof Blob || source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    } else {
      return reject(new Error('Unsupported image source type.'));
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image element: ' + (err?.message || 'Unknown decode error')));
    };
  });
}

/**
 * Calculates scaled dimensions that fit within maxWidth and maxHeight
 * while strictly maintaining the input aspect ratio.
 */
export function calculateFitDimensions(srcWidth, srcHeight, maxWidth, maxHeight) {
  if (!srcWidth || !srcHeight) {
    return { width: maxWidth || 512, height: maxHeight || 512 };
  }

  let targetWidth = srcWidth;
  let targetHeight = srcHeight;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  return { width: Math.max(1, targetWidth), height: Math.max(1, targetHeight) };
}

/**
 * Converts a Canvas to a Blob using Promise.
 */
export function canvasToBlobAsync(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to encode canvas to ${mimeType}`));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

/**
 * Processes and optimizes a folio image client-side.
 *
 * @param {File|Blob|string} source - Input image file, blob, or URL
 * @param {string} slotType - Slot key: 'portrait' | 'token' | 'standee' | 'gallery'
 * @param {Object|null} cropRect - Optional crop bounds: { x, y, width, height }
 * @param {Object} [options] - Additional processing options
 * @returns {Promise<{
 *   blob: Blob,
 *   dataUrl: string,
 *   width: number,
 *   height: number,
 *   byteSize: number,
 *   mimeType: string,
 *   reductionPercent: number
 * }>}
 */
export async function processFolioImage(source, slotType = 'portrait', cropRect = null, options = {}) {
  const slot = FOLIO_IMAGE_SLOTS[slotType] || FOLIO_IMAGE_SLOTS.portrait;
  const originalByteSize = (source instanceof Blob || source instanceof File) ? source.size : 0;

  // 1. Decode source into image
  const img = await loadImageElement(source);

  // 2. Determine crop region
  const sx = cropRect?.x != null ? Math.max(0, cropRect.x) : 0;
  const sy = cropRect?.y != null ? Math.max(0, cropRect.y) : 0;
  const sw = cropRect?.width ? Math.min(img.width - sx, cropRect.width) : img.width;
  const sh = cropRect?.height ? Math.min(img.height - sy, cropRect.height) : img.height;

  // 3. Compute fit dimensions for the target slot bounds
  const { width: targetWidth, height: targetHeight } = calculateFitDimensions(
    sw,
    sh,
    options.maxWidth || slot.maxWidth,
    options.maxHeight || slot.maxHeight
  );

  // 4. Create downsampling canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: slot.hasAlpha !== false });

  if (!ctx) {
    throw new Error('Unable to acquire 2D canvas context.');
  }

  // Clear background
  ctx.clearRect(0, 0, targetWidth, targetHeight);

  // If slot does not support alpha (e.g. portrait or gallery), paint dark cyberpunk background fallback
  if (!slot.hasAlpha && !options.preserveAlpha) {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Enable high quality bicubic downsampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw scaled image
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

  // 5. Select format (WebP with JPEG fallback if unsupported)
  const supportsWebP = isWebPSupported();
  const targetMime = supportsWebP ? 'image/webp' : (slot.hasAlpha ? 'image/png' : 'image/jpeg');
  let currentQuality = options.quality ?? slot.quality;

  // 6. Encode to Blob
  let blob = await canvasToBlobAsync(canvas, targetMime, currentQuality);

  // 7. Clamp to budget threshold if image is unusually dense/noisy
  if (blob.size > MAX_SAFE_IMAGE_BYTES && targetMime === 'image/webp') {
    const fallbackQualities = [0.72, 0.60, 0.50];
    for (const q of fallbackQualities) {
      const smallerBlob = await canvasToBlobAsync(canvas, targetMime, q);
      if (smallerBlob.size <= MAX_SAFE_IMAGE_BYTES || q === fallbackQualities[fallbackQualities.length - 1]) {
        blob = smallerBlob;
        currentQuality = q;
        break;
      }
    }
  }

  const reductionPercent = originalByteSize > 0
    ? Math.round(((originalByteSize - blob.size) / originalByteSize) * 100)
    : 0;

  // Generate lightweight preview dataUrl
  const dataUrl = canvas.toDataURL(targetMime, currentQuality);

  return {
    blob,
    dataUrl,
    width: targetWidth,
    height: targetHeight,
    byteSize: blob.size,
    mimeType: targetMime,
    reductionPercent: Math.max(0, reductionPercent)
  };
}

/**
 * Creates a circular tactical VTT token pog with a stylized border ring and transparent alpha outside.
 *
 * @param {File|Blob|string} source - Input image source
 * @param {Object} [tokenOptions]
 * @returns {Promise<{ blob: Blob, dataUrl: string, byteSize: number, width: number, height: number }>}
 */
export async function createCircularTokenPog(source, tokenOptions = {}) {
  const size = tokenOptions.size || 512;
  const borderColor = tokenOptions.borderColor || '#00f0ff'; // Tangent Cyan
  const borderWidth = tokenOptions.borderWidth || 16;
  const ringAccentColor = tokenOptions.ringAccentColor || '#ff003c'; // Neon red accent pip

  const img = await loadImageElement(source);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { alpha: true });

  if (!ctx) {
    throw new Error('Unable to acquire 2D canvas context for token.');
  }

  const center = size / 2;
  const radius = center - borderWidth - 4;

  ctx.clearRect(0, 0, size, size);

  // 1. Clip circular viewport
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  // 2. Draw square-cropped center of image into circle
  const minDim = Math.min(img.width, img.height);
  const sx = (img.width - minDim) / 2;
  const sy = (img.height - minDim) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, minDim, minDim, center - radius, center - radius, radius * 2, radius * 2);
  ctx.restore();

  // 3. Draw Tactical Outer Ring & Tech Accents
  ctx.save();
  // Outer glowing ring
  ctx.beginPath();
  ctx.arc(center, center, radius + (borderWidth / 2), 0, Math.PI * 2);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.shadowColor = borderColor;
  ctx.shadowBlur = 10;
  ctx.stroke();

  // Inner subtle border
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#050b14';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 0;
  ctx.stroke();

  // Tactical cardinal ticks
  const tickAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  tickAngles.forEach((angle, idx) => {
    const x1 = center + Math.cos(angle) * (radius - 2);
    const y1 = center + Math.sin(angle) * (radius - 2);
    const x2 = center + Math.cos(angle) * (radius + borderWidth + 2);
    const y2 = center + Math.sin(angle) * (radius + borderWidth + 2);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Top indicator pip
    if (idx === 3) {
      ctx.fillStyle = ringAccentColor;
      ctx.beginPath();
      ctx.arc(x2, y2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();

  const targetMime = isWebPSupported() ? 'image/webp' : 'image/png';
  const blob = await canvasToBlobAsync(canvas, targetMime, 0.88);
  const dataUrl = canvas.toDataURL(targetMime, 0.88);

  return {
    blob,
    dataUrl,
    width: size,
    height: size,
    byteSize: blob.size,
    mimeType: targetMime
  };
}
