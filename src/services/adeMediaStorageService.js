/**
 * @file adeMediaStorageService.js
 * @description Offloads heavy MapMaker & ADE binary images (backgrounds, custom stamps,
 *   PCG exports, tokens, handouts) into user-scoped Firebase Storage paths allowed by
 *   `storage.rules` (`users/{userId}/ade/{assetCategory}/{fileName}`), preventing
 *   Firestore 1 MiB document overflows while supporting graceful offline fallbacks.
 */

import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage as defaultStorage, auth as defaultAuth } from '../firebase.js';
import {
  sanitizeAndOptimizeImageForUpload,
  isSvgInput,
  containsDangerousSvgConstructs
} from '../utils/safeImageUpload.js';

export const ALLOWED_ADE_MEDIA_CATEGORIES = new Set([
  'story_media',
  'maps',
  'elements',
  'tokens',
  'handouts',
  'audio',
  'video_maps'
]);

const AUDIO_MIME_EXT = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/webm': 'webm'
};

const VIDEO_MIME_EXT = {
  'video/webm': 'webm',
  'video/mp4': 'mp4'
};

export const FIRESTORE_SAFE_INLINE_IMAGE_BYTES = 180 * 1024; // Offload embedded data URLs > 180 KB when online

/**
 * Sanitizes filename and builds a compliant path under storage.rules:
 * users/{userId}/ade/{assetCategory}/{fileName}
 *
 * @param {Object} [options]
 * @param {string | null} [options.userId]
 * @param {string} [options.assetCategory]
 * @param {string} [options.fileName]
 * @param {string} [options.contentType]
 * @returns {string}
 */
export function buildAdeStoragePath({
  userId = undefined,
  assetCategory = 'maps',
  fileName = 'asset.webp',
  contentType = 'image/webp'
} = {}) {
  const cleanUid = String(userId || '').trim().replace(/[^A-Za-z0-9_-]/g, '');
  if (!cleanUid) {
    throw new Error('Authenticated userId is required for Firebase Storage upload path.');
  }
  const safeCat = ALLOWED_ADE_MEDIA_CATEGORIES.has(assetCategory) ? assetCategory : 'maps';

  const extFromMime = contentType === 'image/png'
    ? 'png'
    : (contentType === 'image/jpeg' ? 'jpg' : 'webp');

  const rawBase = String(fileName || 'asset')
    .replace(/\.[^.]+$/, '')
    .replace(/\.\.+/g, '_')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/^[^A-Za-z0-9]+/, '');

  const stem = rawBase || `ade_${Date.now()}`;
  const stamped = `${stem.slice(0, 48)}_${Date.now().toString(36)}.${extFromMime}`;
  return `users/${cleanUid}/ade/${safeCat}/${stamped}`;
}

/**
 * Converts a base64 image data URI into a Blob (works in both browser and Node 18+).
 */
export function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    throw new Error('Expected image data URI.');
  }
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) {
    throw new Error('Malformed data URI missing payload separator.');
  }
  const header = dataUrl.slice(5, commaIdx);
  const mime = header.split(';')[0] || 'image/png';
  const payload = dataUrl.slice(commaIdx + 1);
  const isBase64 = /;base64/i.test(header);

  if (isBase64) {
    let binaryStr;
    if (typeof atob === 'function') {
      binaryStr = atob(payload);
    } else if (typeof globalThis !== 'undefined' && globalThis.Buffer) {
      return new Blob([globalThis.Buffer.from(payload, 'base64')], { type: mime });
    } else {
      throw new Error('Base64 decoder unavailable.');
    }
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  return new Blob([decodeURIComponent(payload)], { type: mime });
}

export async function blobToDataUrl(blob) {
  if (!blob) return '';
  if (typeof FileReader !== 'undefined') {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to encode image Blob as data URL.'));
      reader.readAsDataURL(blob);
    });
  }
  const buf = await blob.arrayBuffer();
  const base64 = globalThis.Buffer
    ? globalThis.Buffer.from(buf).toString('base64')
    : '';
  return `data:${blob.type || 'image/webp'};base64,${base64}`;
}

/**
 * Sanitizes, optimizes, and uploads an ADE/MapMaker image asset to Firebase Storage
 * when authenticated & online; cleanly falls back to an optimized data URL when offline.
 *
 * @param {File | Blob | string} fileOrBlobOrDataUrl
 * @param {Object} [options]
 * @param {string | null} [options.userId]
 * @param {string} [options.assetCategory]
 * @param {string} [options.fileName]
 * @param {number} [options.maxDimension]
 * @param {number} [options.quality]
 * @param {number} [options.maxBytes]
 * @param {any} [options.storage]
 * @param {((path: string, blob: Blob, meta?: { contentType?: string }) => Promise<string>) | null} [options.uploadFn]
 * @returns {Promise<{ url: string, storagePath: string | null, contentType: string | null, width?: number, height?: number, byteLength: number, offloaded: boolean, warning?: string | null }>}
 */
export async function uploadAdeImageAsset(
  fileOrBlobOrDataUrl,
  {
    userId = undefined,
    assetCategory = 'maps',
    fileName = undefined,
    maxDimension = 2048,
    quality = 0.88,
    maxBytes = 5 * 1024 * 1024,
    storage = defaultStorage,
    uploadFn = null
  } = {}
) {
  let inputBlob = fileOrBlobOrDataUrl;
  let inferredName = fileName;

  if (typeof fileOrBlobOrDataUrl === 'string') {
    if (/^https?:\/\//i.test(fileOrBlobOrDataUrl.trim())) {
      return {
        url: fileOrBlobOrDataUrl.trim(),
        storagePath: null,
        contentType: null,
        byteLength: 0,
        offloaded: true
      };
    }
    if (isSvgInput(fileOrBlobOrDataUrl) && containsDangerousSvgConstructs(decodeURIComponent(fileOrBlobOrDataUrl))) {
      throw new Error('Blocked unsafe SVG data URI containing scripts or executable handlers.');
    }
    inputBlob = dataUrlToBlob(fileOrBlobOrDataUrl);
    inferredName = inferredName || 'uploaded_map_asset';
  } else {
    inferredName = inferredName || fileOrBlobOrDataUrl?.name || 'uploaded_map_asset';
  }

  const optimized = await sanitizeAndOptimizeImageForUpload(inputBlob, {
    maxBytes,
    maxDimension,
    preferMimeType: 'image/webp',
    quality,
    allowSvgRasterization: true
  });

  const resolvedUid = userId || defaultAuth?.currentUser?.uid || null;
  const resolvedName = optimized.fileName || `${inferredName}.webp`;

  if (resolvedUid && (typeof uploadFn === 'function' || storage)) {
    const path = buildAdeStoragePath({
      userId: resolvedUid,
      assetCategory,
      fileName: resolvedName,
      contentType: optimized.contentType
    });

    try {
      let url;
      if (typeof uploadFn === 'function') {
        url = await uploadFn(path, optimized.blob, { contentType: optimized.contentType });
      } else {
        const refObj = storageRef(storage, path);
        const snap = await uploadBytes(refObj, optimized.blob, {
          contentType: optimized.contentType,
          cacheControl: 'public, max-age=31536000'
        });
        url = await getDownloadURL(snap.ref);
      }

      if (url) {
        return {
          url,
          storagePath: path,
          contentType: optimized.contentType,
          width: optimized.width,
          height: optimized.height,
          byteLength: optimized.blob.size,
          offloaded: true
        };
      }
    } catch (uploadErr) {
      console.warn('[adeMediaStorageService] Cloud upload failed; falling back to inline optimized asset:', uploadErr?.message || uploadErr);
    }
  }

  const dataUrl = await blobToDataUrl(optimized.blob);
  return {
    url: dataUrl,
    storagePath: null,
    contentType: optimized.contentType,
    width: optimized.width,
    height: optimized.height,
    byteLength: optimized.blob.size,
    offloaded: false,
    warning:
      optimized.blob.size > FIRESTORE_SAFE_INLINE_IMAGE_BYTES
        ? 'Offline image exceeds 180 KB; sign in to offload binaries to Cloud Storage and keep Firestore maps compact.'
        : null
  };
}

/**
 * Offloads large embedded data:image/* binaries across a map payload (backgroundUrl,
 * backgroundImage, underlayUrl, terrains, objects, tokens) before Firestore persistence.
 *
 * @param {any} mapData
 * @param {Object} [options]
 * @param {string | null} [options.userId]
 * @param {any} [options.storage]
 * @param {((path: string, blob: Blob, meta?: { contentType?: string }) => Promise<string>) | null} [options.uploadFn]
 * @param {number} [options.inlineThresholdBytes]
 * @returns {Promise<any>}
 */
export async function offloadMapBinaryFields(
  mapData,
  {
    userId = undefined,
    storage = defaultStorage,
    uploadFn = null,
    inlineThresholdBytes = FIRESTORE_SAFE_INLINE_IMAGE_BYTES
  } = {}
) {
  if (!mapData || typeof mapData !== 'object') return mapData;
  const resolvedUid = userId || defaultAuth?.currentUser?.uid || null;
  if (!resolvedUid || (!storage && typeof uploadFn !== 'function')) {
    return mapData;
  }

  const uploadedCache = new Map();
  const maybeOffloadUrl = async (val, assetCategory = 'maps', hintName = 'map_asset') => {
    if (typeof val !== 'string' || !val.startsWith('data:image/')) return val;
    if (val.length < inlineThresholdBytes) return val;
    if (uploadedCache.has(val)) return uploadedCache.get(val);
    const pendingUpload = (async () => {
      try {
        const res = await uploadAdeImageAsset(val, {
          userId: resolvedUid,
          assetCategory,
          fileName: hintName,
          storage,
          uploadFn
        });
        if (res?.offloaded && res.url) {
          return res.url;
        }
      } catch (err) {
        console.warn(`[adeMediaStorageService] Skipped offloading ${hintName}:`, err?.message || err);
      }
      return val;
    })();
    uploadedCache.set(val, pendingUpload);
    return pendingUpload;
  };

  const nextMap = { ...mapData };
  if (nextMap.backgroundUrl) {
    nextMap.backgroundUrl = await maybeOffloadUrl(nextMap.backgroundUrl, 'maps', `${nextMap.id || 'map'}_bg`);
  }
  if (nextMap.backgroundImage) {
    nextMap.backgroundImage = await maybeOffloadUrl(nextMap.backgroundImage, 'maps', `${nextMap.id || 'map'}_bgimg`);
  }
  if (nextMap.underlayUrl) {
    nextMap.underlayUrl = await maybeOffloadUrl(nextMap.underlayUrl, 'maps', `${nextMap.id || 'map'}_underlay`);
  }

  if (Array.isArray(nextMap.terrains)) {
    nextMap.terrains = await Promise.all(
      nextMap.terrains.map(async (t, idx) => {
        if (!t || (!t.imageUrl && !t.textureUrl)) return t;
        const copy = { ...t };
        if (copy.imageUrl) copy.imageUrl = await maybeOffloadUrl(copy.imageUrl, 'maps', `terrain_${t.id || idx}`);
        if (copy.textureUrl) copy.textureUrl = await maybeOffloadUrl(copy.textureUrl, 'maps', `tex_${t.id || idx}`);
        return copy;
      })
    );
  }

  if (Array.isArray(nextMap.objects)) {
    nextMap.objects = await Promise.all(
      nextMap.objects.map(async (o, idx) => {
        if (!o || !o.imageUrl) return o;
        return {
          ...o,
          imageUrl: await maybeOffloadUrl(o.imageUrl, 'elements', `obj_${o.id || idx}`)
        };
      })
    );
  }

  if (Array.isArray(nextMap.tokens)) {
    nextMap.tokens = await Promise.all(
      nextMap.tokens.map(async (tok, idx) => {
        if (!tok || (!tok.imageUrl && !tok.avatarUrl)) return tok;
        const copy = { ...tok };
        if (copy.imageUrl) copy.imageUrl = await maybeOffloadUrl(copy.imageUrl, 'tokens', `tok_${tok.id || idx}`);
        if (copy.avatarUrl) copy.avatarUrl = await maybeOffloadUrl(copy.avatarUrl, 'tokens', `avatar_${tok.id || idx}`);
        return copy;
      })
    );
  }

  return nextMap;
}

/**
 * Validates and uploads audio soundboard tracks (<= 15 MB) or animated video map backdrops (<= 25 MB)
 * under owner-scoped Firebase Storage paths, with offline ObjectURL fallback.
 *
 * @param {File | Blob | string} fileOrUrl
 * @param {Object} [options]
 * @param {string | null} [options.userId]
 * @param {'audio' | 'video_maps'} [options.category]
 * @param {string} [options.fileName]
 * @param {any} [options.storage]
 * @param {((path: string, blob: Blob, meta?: { contentType?: string }) => Promise<string>) | null} [options.uploadFn]
 */
export async function uploadAdeMediaAsset(
  fileOrUrl,
  {
    userId = undefined,
    category = 'audio',
    fileName = undefined,
    storage = defaultStorage,
    uploadFn = null
  } = {}
) {
  if (typeof fileOrUrl === 'string') {
    const trimmed = fileOrUrl.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      throw new Error('Only HTTP(S) external URLs or binary File/Blob media uploads are permitted.');
    }
    return {
      url: trimmed,
      storagePath: null,
      contentType: null,
      byteLength: 0,
      offloaded: true
    };
  }

  if (!fileOrUrl || typeof fileOrUrl.size !== 'number') {
    throw new Error('Expected File or Blob for media upload.');
  }

  const safeCategory = category === 'video_maps' ? 'video_maps' : 'audio';
  const maxBytes = safeCategory === 'video_maps' ? 25 * 1024 * 1024 : 15 * 1024 * 1024;
  if (fileOrUrl.size > maxBytes) {
    throw new Error(`Media payload exceeds ${Math.round(maxBytes / (1024 * 1024))} MB limit.`);
  }

  const rawType = String(fileOrUrl.type || '').toLowerCase();
  const mimeTable = safeCategory === 'video_maps' ? VIDEO_MIME_EXT : AUDIO_MIME_EXT;
  const resolvedExt = mimeTable[rawType];
  if (!resolvedExt) {
    throw new Error(
      safeCategory === 'video_maps'
        ? 'Unsupported video format. Allowed: video/webm, video/mp4.'
        : 'Unsupported audio format. Allowed: audio/mpeg, audio/ogg, audio/wav, audio/webm.'
    );
  }

  const normalizedMime = rawType === 'audio/mp3'
    ? 'audio/mpeg'
    : rawType === 'audio/x-wav'
      ? 'audio/wav'
      : rawType;

  const rawBase = String(fileName || fileOrUrl.name || `ade_${safeCategory}`)
    .replace(/\.[^.]+$/, '')
    .replace(/\.\.+/g, '_')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/^[^A-Za-z0-9]+/, '');
  const safeStem = rawBase || `ade_${safeCategory}_${Date.now()}`;
  const finalName = `${safeStem.slice(0, 48)}_${Date.now().toString(36)}.${resolvedExt}`;

  const resolvedUid = userId || defaultAuth?.currentUser?.uid || null;
  if (resolvedUid && (typeof uploadFn === 'function' || storage)) {
    const path = `users/${resolvedUid.replace(/[^A-Za-z0-9_-]/g, '')}/ade/${safeCategory}/${finalName}`;
    try {
      let url;
      if (typeof uploadFn === 'function') {
        url = await uploadFn(path, fileOrUrl, { contentType: normalizedMime });
      } else {
        const refObj = storageRef(storage, path);
        const snap = await uploadBytes(refObj, fileOrUrl, {
          contentType: normalizedMime,
          cacheControl: 'public, max-age=31536000'
        });
        url = await getDownloadURL(snap.ref);
      }
      if (url) {
        return {
          url,
          storagePath: path,
          contentType: normalizedMime,
          byteLength: fileOrUrl.size,
          offloaded: true
        };
      }
    } catch (err) {
      console.warn('[adeMediaStorageService] Media cloud upload failed, using local fallback:', err?.message || err);
    }
  }

  const fallbackUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
    ? URL.createObjectURL(fileOrUrl)
    : '';
  return {
    url: fallbackUrl,
    storagePath: null,
    contentType: normalizedMime,
    byteLength: fileOrUrl.size,
    offloaded: false
  };
}
