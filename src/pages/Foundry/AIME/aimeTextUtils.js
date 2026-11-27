/**
 * @file aimeTextUtils.js
 * @description Shared prose formatting utilities for ingesting AIME output into ADE StoryWeaver documents.
 */

const BLOCK_HTML_RE = /<(p|h[1-6]|ul|ol|li|blockquote|pre|div|hr)\b/i;

function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatInlineMarkdown(escapedLine) {
  return escapedLine
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

/**
 * Converts plain or Markdown-formatted AIME output into sanitized HTML blocks
 * suitable for ReactQuill and ADE StoryWeaver documents.
 * Preserves documents that already contain block-level HTML tags without double-escaping.
 * @param {string} rawText
 * @returns {string}
 */
export function formatAimeProseToHtml(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  if (BLOCK_HTML_RE.test(rawText.trim())) {
    return rawText;
  }

  const normalized = rawText.replace(/\r\n/g, '\n');
  const codePlaceholders = [];
  const withCodePlaceholders = normalized.replace(/```[^\n]*\n([\s\S]*?)```/g, (_m, code) => {
    const idx = codePlaceholders.length;
    codePlaceholders.push(`<pre><code>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`);
    return `\n\n@@CODE_BLOCK_${idx}@@\n\n`;
  });

  const blocks = withCodePlaceholders
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const codeTokenMatch = block.match(/^@@CODE_BLOCK_(\d+)@@$/);
      if (codeTokenMatch) {
        return codePlaceholders[Number(codeTokenMatch[1])] || '';
      }

      const lines = block.split('\n');
      const allBullets = lines.every((l) => /^\s*(?:[-*]|\u2022)\s+/.test(l));
      if (allBullets) {
        const items = lines
          .map((l) => l.replace(/^\s*(?:[-*]|\u2022)\s+/, ''))
          .map((item) => `<li>${formatInlineMarkdown(escapeHtml(item))}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }

      const allOrdered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
      if (allOrdered) {
        const items = lines
          .map((l) => l.replace(/^\s*\d+[.)]\s+/, ''))
          .map((item) => `<li>${formatInlineMarkdown(escapeHtml(item))}</li>`)
          .join('');
        return `<ol>${items}</ol>`;
      }

      const allQuotes = lines.every((l) => /^\s*>\s?/.test(l));
      if (allQuotes) {
        const quoteBody = lines
          .map((l) => formatInlineMarkdown(escapeHtml(l.replace(/^\s*>\s?/, ''))))
          .join('<br/>');
        return `<blockquote>${quoteBody}</blockquote>`;
      }

      if (lines.length === 1) {
        const headingMatch = lines[0].match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          return `<h${level}>${formatInlineMarkdown(escapeHtml(headingMatch[2].trim()))}</h${level}>`;
        }
      }

      const formattedLines = lines.map((line) => {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          return `<strong>${formatInlineMarkdown(escapeHtml(headingMatch[2].trim()))}</strong>`;
        }
        return formatInlineMarkdown(escapeHtml(line));
      });
      return `<p>${formattedLines.join('<br/>')}</p>`;
    })
    .join('');
}
