/**
 * @file tangentSchemaAdapters.js
 * @description Stage 8 Data Ingestion & Schema Normalization Adapters.
 * Enforces strict integer typing (Attributes, TL0-5, ML0-6, HP, DR),
 * sanitizes legacy rich text / HTML tags, and maps legacy Folio/DBM structures
 * into canonical Tangent SF RP schema models.
 */

/**
 * Sanitizes rich text / HTML strings by stripping script tags and unsafe elements.
 * @param {string} input - Raw HTML or text from legacy editors
 * @returns {string} Clean plain text or sanitized markdown
 */
export function sanitizeRichText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '') // Strip remaining HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Enforces integer boundaries within min and max constraints.
 * @param {any} val - Input value
 * @param {number} fallback - Default fallback if invalid
 * @param {number} min - Minimum allowable integer
 * @param {number} max - Maximum allowable integer
 * @returns {number}
 */
export function enforceInteger(val, fallback = 0, min = -Infinity, max = Infinity) {
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Normalizes legacy element data into canonical Tangent SF RP structure.
 * @param {object} legacyItem - Raw element from Omnicortex, DBM, or Folio
 * @returns {object} Normalized schema object
 */
export function adaptLegacyElement(legacyItem) {
  if (!legacyItem || typeof legacyItem !== 'object') {
    throw new Error('Invalid legacy item: expected an object.');
  }

  const id = legacyItem.id || legacyItem._id || `elem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const title = legacyItem.title || legacyItem.name || 'Untitled Element';
  const category = legacyItem.category || legacyItem.type || 'Custom';
  const schemaType = legacyItem.schemaType || legacyItem.element_type || 'Entity';

  // Strict integer normalization for core mechanics
  const techLevel = enforceInteger(legacyItem.techLevel ?? legacyItem.tl ?? legacyItem.fields?.tl, 3, 0, 5);
  const magicLevel = enforceInteger(legacyItem.magicLevel ?? legacyItem.ml ?? legacyItem.fields?.ml, 0, 0, 6);
  const hpMax = enforceInteger(legacyItem.hp ?? legacyItem['hit-points']?.max ?? legacyItem.fields?.hp, 20, 1, 9999);
  const kineticDr = enforceInteger(legacyItem.dr ?? legacyItem['armor-dr']?.kinetic ?? legacyItem.fields?.kineticDr, 4, 0, 999);
  const energyDr = enforceInteger(legacyItem.energyDr ?? legacyItem['armor-dr']?.energy ?? legacyItem.fields?.energyDr, 2, 0, 999);
  const ap = enforceInteger(legacyItem.ap ?? legacyItem.fields?.ap, 4, 1, 10);

  // Sanitized text fields
  const summary = sanitizeRichText(legacyItem.summary || legacyItem.description || '');
  const content = sanitizeRichText(legacyItem.content || legacyItem.notes || '');

  // Normalized Attributes
  const rawAttrs = legacyItem.attributes || legacyItem.fields?.attributes || {};
  const attributes = {
    strength: enforceInteger(rawAttrs.strength, 10, 1, 30),
    agility: enforceInteger(rawAttrs.agility, 10, 1, 30),
    intellect: enforceInteger(rawAttrs.intellect, 10, 1, 30),
    perception: enforceInteger(rawAttrs.perception, 10, 1, 30),
    willpower: enforceInteger(rawAttrs.willpower, 10, 1, 30),
    tech: enforceInteger(rawAttrs.tech, 10, 1, 30)
  };

  return {
    id,
    title,
    category,
    schemaType,
    summary,
    content,
    fields: {
      tl: techLevel,
      ml: magicLevel,
      hp: hpMax,
      kineticDr,
      energyDr,
      ap,
      attributes,
      skills: legacyItem.skills || legacyItem.fields?.skills || {},
      tags: Array.isArray(legacyItem.tags) ? legacyItem.tags : []
    },
    schemaVersion: '3.0.0',
    normalizedAt: Date.now()
  };
}

/**
 * Validates whether an adapted element conforms to canonical schema rules.
 * @param {object} item - Adapted element
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateAdaptedElement(item) {
  const errors = [];
  if (!item.id) errors.push('Missing ID');
  if (!item.title) errors.push('Missing Title');
  if (item.fields?.tl < 0 || item.fields?.tl > 5) errors.push('Tech Level must be between 0 and 5');
  if (item.fields?.ml < 0 || item.fields?.ml > 6) errors.push('Magic/Essence Level must be between 0 and 6');
  if (item.fields?.hp <= 0) errors.push('Hit Points must be greater than 0');

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  sanitizeRichText,
  enforceInteger,
  adaptLegacyElement,
  validateAdaptedElement
};
