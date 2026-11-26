/**
 * @file gmSecretSanitizer.js
 * @description Shared Operator-Safe sanitization helpers used across Publishing compilers,
 *   Print/Export previews, and Module Package builders.
 */

const NAMED_ENTITIES = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  mdash: '\u2014',
  ndash: '\u2013',
  hellip: '\u2026',
  bull: '\u2022',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201c',
  rdquo: '\u201d'
};

/**
 * Decodes common named and numeric HTML/XML entities to plain Unicode characters.
 * @param {unknown} raw
 * @returns {string}
 */
export function decodeHtmlEntities(raw) {
  return String(raw ?? '')
    .replace(/&#(\d+);/g, (_m, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : _m;
    })
    .replace(/&#x([0-9a-fA-F]+);/gi, (_m, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : _m;
    })
    .replace(/&([a-zA-Z]+);/g, (m, name) => {
      const key = String(name).toLowerCase();
      return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key] : m;
    });
}

/**
 * Iteratively strips GM-only spoiler blocks (`ade-gm-secret`, `data-gm-secret="true"`) from rich HTML.
 * @param {unknown} rawHtml
 * @returns {string}
 */
export function stripGmSecretHtmlBlocks(rawHtml) {
  let clean = String(rawHtml ?? '');
  if (!clean) return '';
  let prev = '';
  while (clean !== prev) {
    prev = clean;
    clean = clean
      .replace(/<(div|section|aside|p|span|blockquote)[^>]*\bclass\s*=\s*["'][^"']*\bade-gm-secret\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<(div|section|aside|p|span|blockquote)[^>]*\bdata-gm-secret\s*=\s*["']true["'][^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<!--\s*GM_SECRET\s*-->[\s\S]*?<!--\s*\/GM_SECRET\s*-->/gi, '')
      .replace(/\[GM_?SECRET\][\s\S]*?\[\/GM_?SECRET\]/gi, '');
  }
  return clean;
}

/**
 * Recursively strips GM-only fields, secret HTML blocks, and hidden children from a Scenario node.
 * @param {Record<string, any>} node
 * @returns {Record<string, any>}
 */
export function sanitizeScenarioForOperator(node) {
  if (!node || typeof node !== 'object') return node;
  const fields = { ...(node.fields || {}) };
  delete fields.secrets;
  delete fields.gmNotes;
  delete fields.gmSecrets;
  delete fields.gmSecretNotes;
  delete fields.architectNotes;
  delete fields.threats;
  delete fields.threatMatrix;
  delete fields.trapsSummary;
  delete fields.complications;
  delete fields.hiddenNotes;

  const copy = {
    ...node,
    ...(typeof node.content === 'string' ? { content: stripGmSecretHtmlBlocks(node.content) } : {}),
    ...(Array.isArray(node.customFields)
      ? { customFields: node.customFields.filter((cf) => cf && !cf.isGmOnly && !cf.isHidden) }
      : {}),
    fields
  };
  delete copy.gmNotes;
  delete copy.gmSecrets;
  delete copy.gmSecretNotes;
  delete copy.architectNotes;
  delete copy.secrets;
  delete copy.hiddenNotes;
  delete copy.threats;

  if (Array.isArray(node.children)) {
    copy.children = node.children
      .filter((c) => c && !c.isHidden && !c.isGmOnly)
      .map(sanitizeScenarioForOperator);
  }
  return copy;
}
