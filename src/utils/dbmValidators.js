import { categoryConfig } from '../components/DBM/categoryConfig.js';

/**
 * Validates a DBM entry payload against structural rules and category definitions.
 *
 * @param {string} categoryKey - The key of the target category or subcategory (e.g. 'equipment', 'compendium', 'species_type').
 * @param {Record<string, any>} entry - The entry data to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDbmEntry(categoryKey, entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { valid: false, errors: ['Entry payload must be a valid object.'] };
  }

  // 1. Mandatory ID check
  if (!entry.id || typeof entry.id !== 'string' || !entry.id.trim()) {
    errors.push('Entry requires a valid string ID.');
  }

  // 2. Mandatory Name / Title check
  const entryName = (entry.name || entry.title || '').toString().trim();
  if (!entryName) {
    errors.push('Entry name is required and cannot be blank.');
  }

  // 3. Mandatory Category check
  if (!categoryKey || typeof categoryKey !== 'string' || !categoryKey.trim()) {
    errors.push('Target category key is required.');
  }

  // 4. Optional CategoryConfig required fields check
  let config = categoryConfig?.[categoryKey];
  if (!config && categoryConfig) {
    for (const parentKey of Object.keys(categoryConfig)) {
      if (categoryConfig[parentKey]?.subcategories?.[categoryKey]) {
        config = categoryConfig[parentKey].subcategories[categoryKey];
        break;
      }
    }
  }

  if (config?.fields) {
    for (const [fieldKey, fieldDef] of Object.entries(config.fields)) {
      if (fieldDef.required) {
        const val = entry[fieldKey];
        const isMissing =
          val === undefined ||
          val === null ||
          (typeof val === 'string' && !val.trim()) ||
          (Array.isArray(val) && val.length === 0);

        if (isMissing) {
          const label = fieldDef.label || fieldKey;
          errors.push(`Field "${label}" is required.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
