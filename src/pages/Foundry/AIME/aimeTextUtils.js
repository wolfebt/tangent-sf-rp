/**
 * @file aimeTextUtils.js
 * @description Shared prose formatting utilities for ingesting AIME output into ADE StoryWeaver documents.
 */

/**
 * Converts plain or lightly Markdown-formatted AIME output into sanitized HTML paragraph blocks.
 * @param {string} rawText
 * @returns {string}
 */
export function formatAimeProseToHtml(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  const escaped = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const blocks = escaped
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const formatted = block
        .replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
      return `<p>${formatted}</p>`;
    })
    .join('');
}
