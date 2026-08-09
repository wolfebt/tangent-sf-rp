/**
 * Utility functions for tagging assets with the current creator's handle.
 */

/**
 * Resolves the creator handle tag from userHandle or currentUser session or localStorage fallback.
 * Formatted as `@handle` (e.g. `@Operator_Zero`).
 * @param {string} [userHandle] - Explicit userHandle from AuthContext or state
 * @param {object} [currentUser] - Firebase auth currentUser object
 * @returns {string} - Formatted handle tag (e.g. `@Operator_Zero`)
 */
export const getCreatorHandleTag = (userHandle, currentUser) => {
  let handle = userHandle || (typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '') || currentUser?.displayName || currentUser?.email || 'Anonymous';
  handle = (handle || 'Anonymous').trim();
  return handle.startsWith('@') ? handle : `@${handle}`;
};

/**
 * Attaches or appends the creator's handle tag to an asset object's `tags` (and `fields.tags` if present).
 * Handles both Array tags and comma-separated String tags cleanly without duplicates.
 * @param {object} assetData - The asset object or payload to be tagged
 * @param {string} [userHandle] - Optional handle override
 * @param {object} [currentUser] - Optional Firebase auth user
 * @returns {object} - Updated asset object with creator tag attached
 */
export const attachCreatorTag = (assetData, userHandle, currentUser) => {
  if (!assetData || typeof assetData !== 'object') return assetData;

  const tag = getCreatorHandleTag(userHandle, currentUser);
  if (!tag) return assetData;

  const result = { ...assetData };
  const rawTag = tag.replace(/^@/, '');

  // Handle top-level tags
  if (Array.isArray(result.tags)) {
    const exists = result.tags.some(
      t => typeof t === 'string' && (t.toLowerCase() === tag.toLowerCase() || t.toLowerCase() === rawTag.toLowerCase())
    );
    if (!exists) {
      result.tags = [...result.tags, tag];
    }
  } else if (typeof result.tags === 'string') {
    const lower = result.tags.toLowerCase();
    if (!lower.includes(tag.toLowerCase()) && !lower.includes(rawTag.toLowerCase())) {
      result.tags = result.tags.trim() ? `${result.tags.trim()}, ${tag}` : tag;
    }
  } else {
    // If tags doesn't exist or is empty, initialize as an array with the tag
    result.tags = [tag];
  }

  // Handle fields.tags (used in Story Foundry elements and custom schemas)
  if (result.fields && typeof result.fields === 'object') {
    let fieldTags = result.fields.tags;
    if (Array.isArray(fieldTags)) {
      const exists = fieldTags.some(
        t => typeof t === 'string' && (t.toLowerCase() === tag.toLowerCase() || t.toLowerCase() === rawTag.toLowerCase())
      );
      if (!exists) {
        fieldTags = [...fieldTags, tag];
      }
    } else if (typeof fieldTags === 'string') {
      const lower = fieldTags.toLowerCase();
      if (!lower.includes(tag.toLowerCase()) && !lower.includes(rawTag.toLowerCase())) {
        fieldTags = fieldTags.trim() ? `${fieldTags.trim()}, ${tag}` : tag;
      }
    } else {
      fieldTags = typeof result.tags === 'string' ? result.tags : (Array.isArray(result.tags) ? result.tags.join(', ') : tag);
    }
    result.fields = {
      ...result.fields,
      tags: fieldTags
    };
  }

  return result;
};
