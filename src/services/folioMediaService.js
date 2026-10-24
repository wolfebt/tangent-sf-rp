/**
 * @file folioMediaService.js
 * @description Cloud storage upload, caching, and persona synchronization service
 * for Tangent SF RP Character Folios.
 */

import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

/**
 * Uploads an optimized folio image blob to Firebase Storage and syncs the URL into Firestore.
 *
 * @param {Object} params
 * @param {Object} params.user - Current authenticated user (with uid)
 * @param {string} params.personaId - Persona / Character document ID
 * @param {string} params.slotType - 'portrait' | 'token' | 'standee' | 'gallery'
 * @param {Object} params.optimizedResult - Result from processFolioImage
 * @param {Function} [params.onProgress] - Optional progress callback
 * @returns {Promise<{ url: string, storagePath: string, width: number, height: number }>}
 */
export async function uploadFolioSlotImage({
  user,
  personaId,
  slotType = 'portrait',
  optimizedResult,
  galleryIndex = 0
}) {
  if (!personaId) {
    throw new Error('personaId is required to upload folio media.');
  }

  const { blob, width, height, byteSize } = optimizedResult;
  if (!blob) {
    throw new Error('Missing image blob for upload.');
  }

  // Determine file name based on slot
  const fileName = slotType === 'gallery' ? `gallery_${galleryIndex}.webp` : `${slotType}.webp`;

  // Fallback for offline / unauthenticated guest mode
  if (!user || !user.uid) {
    console.warn('[FolioMedia] No authenticated user. Storing image locally.');
    return {
      url: optimizedResult.dataUrl,
      storagePath: `local/${personaId}/${fileName}`,
      width,
      height,
      byteSize,
      updatedAt: new Date().toISOString(),
      isLocal: true
    };
  }

  const storagePath = `users/${user.uid}/personas/${personaId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  // Metadata with immutable caching header
  const metadata = {
    contentType: optimizedResult.mimeType || 'image/webp',
    cacheControl: 'public, max-age=31536000, immutable',
    customMetadata: {
      slotType,
      personaId,
      width: String(width),
      height: String(height),
      uploadedBy: user.uid
    }
  };

  // Upload to Firebase Storage
  await uploadBytes(storageRef, blob, metadata);
  const downloadUrl = await getDownloadURL(storageRef);

  const slotMetadata = {
    url: downloadUrl,
    storagePath,
    width,
    height,
    byteSize,
    updatedAt: new Date().toISOString()
  };

  // Update Firestore persona document
  try {
    const personaRef = doc(db, 'users', user.uid, 'personas', personaId);
    const updatePayload = {
      [`media.${slotType}`]: slotMetadata,
      updatedAt: new Date().toISOString()
    };

    // If uploading the primary portrait, sync legacy avatar field for HUD/Roster/Chat
    if (slotType === 'portrait') {
      updatePayload.avatar = downloadUrl;
    } else if (slotType === 'token') {
      updatePayload.tokenUrl = downloadUrl;
    }

    await setDoc(personaRef, updatePayload, { merge: true });
  } catch (err) {
    console.warn('[FolioMedia] Failed to update persona document in Firestore:', err);
  }

  return slotMetadata;
}

/**
 * Deletes an existing folio image from Cloud Storage and updates the persona document.
 *
 * @param {Object} params
 * @param {Object} params.user
 * @param {string} params.personaId
 * @param {string} params.slotType
 * @param {string} params.storagePath
 */
export async function deleteFolioSlotImage({ user, personaId, slotType, storagePath }) {
  if (user?.uid && storagePath && !storagePath.startsWith('local/')) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('[FolioMedia] Error deleting object from Cloud Storage:', err);
    }
  }

  // Update Firestore
  if (user?.uid && personaId) {
    try {
      const personaRef = doc(db, 'users', user.uid, 'personas', personaId);
      const updatePayload = {
        [`media.${slotType}`]: null,
        updatedAt: new Date().toISOString()
      };
      if (slotType === 'portrait') {
        updatePayload.avatar = null;
      } else if (slotType === 'token') {
        updatePayload.tokenUrl = null;
      }
      await setDoc(personaRef, updatePayload, { merge: true });
    } catch (err) {
      console.warn('[FolioMedia] Error updating persona after delete:', err);
    }
  }
}

/**
 * Helper to extract current slot image URL from characterData.
 * Falls back to characterData.avatar for portrait slot if media is not yet migrated.
 */
export function getFolioSlotImageUrl(characterData, slotType = 'portrait') {
  if (!characterData) return null;
  const mediaSlot = characterData.media?.[slotType];
  if (mediaSlot?.url) return mediaSlot.url;

  if (slotType === 'portrait' && characterData.avatar) {
    return characterData.avatar;
  }
  if (slotType === 'token' && characterData.tokenUrl) {
    return characterData.tokenUrl;
  }

  return null;
}
