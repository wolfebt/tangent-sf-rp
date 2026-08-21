/**
 * Utility functions for tagging assets with creator and contributor handles.
 */

/**
 * Resolves the user handle tag from userHandle or currentUser session or localStorage fallback.
 * Formatted as `@handle` (e.g. `@Operator_Zero`).
 * @param {string} [userHandle] - Explicit userHandle from AuthContext or state
 * @param {object} [currentUser] - Firebase auth currentUser object
 * @returns {string} - Formatted handle tag (e.g. `@Operator_Zero`)
 */
export const getCreatorHandleTag = (userHandle, currentUser) => {
  let handle = userHandle || (typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '') || currentUser?.displayName || currentUser?.email || 'Anonymous';
  handle = String(handle || 'Anonymous').trim();
  if (!handle) handle = 'Anonymous';
  return handle.startsWith('@') ? handle : `@${handle}`;
};

/**
 * Extracts creator and contributor information from an asset or character object.
 * @param {object} item - The asset or character object
 * @param {string} [fallbackUserHandle] - Optional fallback handle
 * @param {object} [currentUser] - Optional Firebase auth user
 * @returns {{ creatorTag: string, contributorTags: string[], allTags: string[] }}
 */
export const extractCreatorInfo = (item, fallbackUserHandle, currentUser) => {
  const defaultTag = getCreatorHandleTag(fallbackUserHandle, currentUser);
  if (!item || typeof item !== 'object') {
    return {
      creatorTag: defaultTag,
      contributorTags: [],
      allTags: [defaultTag]
    };
  }

  // 1. Resolve Creator Tag
  let creatorTag = '';
  const rawAuthor = item.authorHandle || item.creatorHandle || item.author || item.creator;
  if (rawAuthor && typeof rawAuthor === 'string' && rawAuthor.trim()) {
    const trimmed = rawAuthor.trim();
    creatorTag = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  }

  // Fallback to finding first @tag in tags array or string
  if (!creatorTag) {
    if (Array.isArray(item.tags)) {
      const found = item.tags.find(t => typeof t === 'string' && t.trim().startsWith('@'));
      if (found) creatorTag = found.trim();
    } else if (typeof item.tags === 'string' && item.tags.trim()) {
      const found = item.tags.split(',').map(t => t.trim()).find(t => t.startsWith('@'));
      if (found) creatorTag = found;
    }
  }

  if (!creatorTag) {
    creatorTag = defaultTag;
  }

  // 2. Resolve Contributor Tags
  const contributorTags = [];
  const rawContribs = item.contributors || item.contributorHandles || [];
  if (Array.isArray(rawContribs)) {
    rawContribs.forEach(c => {
      if (typeof c === 'string' && c.trim()) {
        const tag = c.trim().startsWith('@') ? c.trim() : `@${c.trim()}`;
        if (tag.toLowerCase() !== creatorTag.toLowerCase() && !contributorTags.some(ct => ct.toLowerCase() === tag.toLowerCase())) {
          contributorTags.push(tag);
        }
      }
    });
  }

  // Also check if other @tags exist in tags list
  const extractAllTags = (tagsList) => {
    if (Array.isArray(tagsList)) {
      tagsList.forEach(t => {
        if (typeof t === 'string' && t.trim().startsWith('@')) {
          const formatted = t.trim();
          if (formatted.toLowerCase() !== creatorTag.toLowerCase() && !contributorTags.some(ct => ct.toLowerCase() === formatted.toLowerCase())) {
            contributorTags.push(formatted);
          }
        }
      });
    } else if (typeof tagsList === 'string' && tagsList.trim()) {
      tagsList.split(',').forEach(t => {
        const trimmed = t.trim();
        if (trimmed.startsWith('@')) {
          if (trimmed.toLowerCase() !== creatorTag.toLowerCase() && !contributorTags.some(ct => ct.toLowerCase() === trimmed.toLowerCase())) {
            contributorTags.push(trimmed);
          }
        }
      });
    }
  };

  extractAllTags(item.tags);
  if (item.fields && item.fields.tags) {
    extractAllTags(item.fields.tags);
  }

  const allTags = [creatorTag, ...contributorTags];

  return {
    creatorTag,
    contributorTags,
    allTags
  };
};

/**
 * Backward-compatible helper for extracting single creator tag.
 */
export const extractCreatorTag = (item, fallbackUserHandle, currentUser) => {
  return extractCreatorInfo(item, fallbackUserHandle, currentUser).creatorTag;
};

/**
 * Attaches or appends the current user's handle tag to an asset object's creator / contributor metadata and `tags`.
 * Preserves original author in `authorHandle`, adding new contributors to `contributors`.
 * @param {object} assetData - The asset object or payload to be tagged
 * @param {string} [userHandle] - Optional handle override
 * @param {object} [currentUser] - Optional Firebase auth user
 * @returns {object} - Updated asset object with creator/contributor tags attached
 */
export const attachCreatorTag = (assetData, userHandle, currentUser) => {
  if (!assetData || typeof assetData !== 'object') return assetData;

  const tag = getCreatorHandleTag(userHandle, currentUser);
  if (!tag) return assetData;

  const result = { ...assetData };
  const rawTag = tag.replace(/^@/, '');

  // 1. Author and Contributors Tracking
  if (!result.authorHandle || result.authorHandle === 'Anonymous') {
    result.authorHandle = rawTag;
  } else if (result.authorHandle.toLowerCase() !== rawTag.toLowerCase()) {
    const existingContribs = Array.isArray(result.contributors) ? [...result.contributors] : [];
    const exists = existingContribs.some(c => typeof c === 'string' && (c.toLowerCase() === rawTag.toLowerCase() || c.toLowerCase() === tag.toLowerCase()));
    if (!exists) {
      result.contributors = [...existingContribs, tag];
    }
  }

  // 2. Handle top-level tags
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
    result.tags = [tag];
  }

  // 3. Handle fields.tags (used in Story Foundry elements and custom schemas)
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
