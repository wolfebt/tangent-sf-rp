/**
 * @file DocumentExporters.ts
 * @description Zero-dependency Publishing Compilers for EPUB 3 (.epub via pure-JS PKZIP builder),
 *   Word-compatible HTML (.doc), and Rich Text Format (.rtf).
 */

import { PagedPdfCompiler, type CompileOptions, type ScenarioExportNode } from './PagedPdfCompiler.ts';
import { decodeHtmlEntities, stripGmSecretHtmlBlocks } from '../../utils/gmSecretSanitizer.js';

function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function escapeXml(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtmlToPlain(rawHtml: unknown): string {
  const plain = String(rawHtml ?? '')
    .replace(/<\/(p|div|blockquote|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decodeHtmlEntities(plain).trim();
}

function stripGmSecretBlocks(rawHtml: unknown): string {
  return stripGmSecretHtmlBlocks(rawHtml);
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = (CRC32_TABLE[(c ^ (bytes[i] ?? 0)) & 0xff] ?? 0) ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export interface ZipEntryInput {
  path: string;
  data: Uint8Array | string;
}

/**
 * Pure-JS uncompressed Store-mode PKZIP archive builder (Zero external deps).
 */
export function buildZipBytes(entries: ZipEntryInput[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encodeUtf8(entry.path.replace(/^\/+/, ''));
    const dataBytes = typeof entry.data === 'string' ? encodeUtf8(entry.data) : entry.data;
    const sum = crc32(dataBytes);
    const size = dataBytes.length;

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Local file header signature
    lv.setUint16(4, 20, true); // Version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
    lv.setUint16(8, 0, true); // Compression method 0 (Store)
    lv.setUint16(10, 0, true); // Mod time
    lv.setUint16(12, 0x5421, true); // Mod date
    lv.setUint32(14, sum, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Central directory signature
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true); // Store
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x5421, true);
    cv.setUint32(16, sum, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + size;
  }

  let centralSize = 0;
  for (const part of centralParts) centralSize += part.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLength = offset + centralSize + eocd.length;
  const archive = new Uint8Array(totalLength);
  let cursor = 0;
  for (const p of localParts) {
    archive.set(p, cursor);
    cursor += p.length;
  }
  for (const p of centralParts) {
    archive.set(p, cursor);
    cursor += p.length;
  }
  archive.set(eocd, cursor);
  return archive;
}

function flattenNodesForChapters(nodes: ScenarioExportNode[]): ScenarioExportNode[] {
  const flat: ScenarioExportNode[] = [];
  const walk = (list: ScenarioExportNode[]) => {
    for (const n of list || []) {
      flat.push(n);
      if (Array.isArray(n.children) && n.children.length > 0) {
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return flat.length > 0
    ? flat
    : [{ id: 'ch_empty', title: 'Introduction', content: '<p>No manuscript chapters authored yet.</p>' }];
}

export function compileToEpubBytes(
  nodes: ScenarioExportNode[],
  options: CompileOptions = {}
): Uint8Array {
  const title = options.adventureTitle || 'Tangent SF RP Adventure Module';
  const author = options.authorName || 'ADE Architect';
  const includeGmSecrets = options.includeGmSecrets !== false;
  const chapters = flattenNodesForChapters(nodes);
  const bookId = `urn:uuid:tangent-ade-${Date.now()}`;
  const modifiedIso = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  const manifestItems: string[] = [
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="css" href="style.css" media-type="text/css"/>'
  ];
  const spineItems: string[] = [];
  const navLinks: string[] = [];
  const entries: ZipEntryInput[] = [
    // EPUB 3 specification requires mimetype FIRST and uncompressed
    { path: 'mimetype', data: 'application/epub+zip' },
    {
      path: 'META-INF/container.xml',
      data: `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/xhtml+xml"/>
  </rootfiles>
</container>`
    }
  ];

  // Correct media-type for OPF in container.xml
  entries[1] = {
    path: 'META-INF/container.xml',
    data: `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  };

  entries.push({
    path: 'OEBPS/style.css',
    data: `body { font-family: Georgia, serif; line-height: 1.55; margin: 1.5em; color: #1e293b; }
h1, h2 { font-family: sans-serif; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
blockquote.ade-read-aloud { background: #f8fafc; border-left: 3px solid #f59e0b; padding: 8px 12px; font-style: italic; }
.ade-gm-secret { background: #fff7ed; border: 1px dashed #ea580c; padding: 8px 12px; }`
  });

  chapters.forEach((ch, idx) => {
    const fileName = `chapter_${idx + 1}.xhtml`;
    const itemId = `chap_${idx + 1}`;
    const safeTitle = escapeXml(ch.title || `Chapter ${idx + 1}`);
    const contentSource = includeGmSecrets ? ch.content : stripGmSecretBlocks(ch.content || '');
    const paragraphs = stripHtmlToPlain(contentSource)
      .split(/\n+/)
      .filter(Boolean)
      .map((p) => `<p>${escapeXml(p)}</p>`)
      .join('\n    ');

    const readAloudHtml = ch.fields?.readAloud
      ? `<blockquote class="ade-read-aloud">${escapeXml(ch.fields.readAloud)}</blockquote>`
      : '';

    const threatsHtml =
      includeGmSecrets && Array.isArray(ch.fields?.threats) && ch.fields.threats.length > 0
        ? ch.fields.threats
            .map(
              (t) =>
                `<p><strong>${escapeXml(t.name)}</strong> [${escapeXml(t.tier)}] &#8212; HP ${escapeXml(t.hp)}, DR ${escapeXml(t.dr)}, Attack ${escapeXml(t.attack)}</p>`
            )
            .join('\n    ')
        : '';

    const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
  <section id="${escapeXml(itemId)}">
    <h1>${safeTitle}</h1>
    ${ch.summary ? `<p><em>${escapeXml(ch.summary)}</em></p>` : ''}
    ${readAloudHtml}
    ${paragraphs}
    ${threatsHtml}
  </section>
</body>
</html>`;

    entries.push({ path: `OEBPS/${fileName}`, data: xhtml });
    manifestItems.push(`<item id="${itemId}" href="${fileName}" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="${itemId}"/>`);
    navLinks.push(`<li><a href="${fileName}">${safeTitle}</a></li>`);
  });

  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeXml(title)} — Table of Contents</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Contents</h1>
    <ol>
      ${navLinks.join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;

  const opfXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${escapeXml(bookId)}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${modifiedIso}</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`;

  entries.push({ path: 'OEBPS/nav.xhtml', data: navXhtml });
  entries.push({ path: 'OEBPS/content.opf', data: opfXml });

  return buildZipBytes(entries);
}

export function compileToEpubBlob(
  nodes: ScenarioExportNode[],
  options: CompileOptions = {}
): Blob {
  const bytes = compileToEpubBytes(nodes, options);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([buffer], { type: 'application/epub+zip' });
}

export function compileToWordHtmlString(
  nodes: ScenarioExportNode[],
  options: CompileOptions = {}
): string {
  const { html } = PagedPdfCompiler.compileToPagedHtml(nodes, {
    ...options,
    includeToc: options.includeToc ?? true
  });
  return html.replace(
    '<html>',
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
  );
}

export function compileToWordHtmlBlob(
  nodes: ScenarioExportNode[],
  options: CompileOptions = {}
): Blob {
  const docHtml = compileToWordHtmlString(nodes, options);
  return new Blob(['\ufeff', docHtml], { type: 'application/msword' });
}

function escapeRtf(str: string): string {
  const raw = String(str || '');
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    const code = raw.charCodeAt(i);
    if (ch === '\\') out += '\\\\';
    else if (ch === '{') out += '\\{';
    else if (ch === '}') out += '\\}';
    else if (ch === '\r') continue;
    else if (ch === '\n') out += '\\par\n';
    else if (code > 127) {
      const signed = code > 32767 ? code - 65536 : code;
      out += `\\u${signed}?`;
    } else {
      out += ch;
    }
  }
  return out;
}

export function compileToRtfBlob(
  nodes: ScenarioExportNode[],
  options: CompileOptions = {}
): Blob {
  const rtf = compileToRtfString(nodes, options);
  return new Blob([rtf], { type: 'application/rtf;charset=utf-8' });
}

export function compileToRtfString(
  nodes: ScenarioExportNode[],
  options: CompileOptions = {}
): string {
  const title = options.adventureTitle || 'Tangent SF RP Adventure Module';
  const author = options.authorName || 'Architect';
  const includeGmSecrets = options.includeGmSecrets !== false;
  const chapters = flattenNodesForChapters(nodes);

  const lines: string[] = [
    '{\\rtf1\\ansi\\deff0',
    `{\\info{\\title ${escapeRtf(title)}}{\\author ${escapeRtf(author)}}}`,
    `\\fs36\\b ${escapeRtf(title)}\\b0\\fs22\\par`,
    `\\i Written by ${escapeRtf(author)} \\i0\\par\\par`
  ];

  for (const ch of chapters) {
    lines.push(`\\fs28\\b ${escapeRtf(ch.title || 'Section')}\\b0\\fs22\\par`);
    if (ch.summary) {
      lines.push(`\\i ${escapeRtf(ch.summary)}\\i0\\par`);
    }
    if (ch.fields?.readAloud) {
      lines.push(`\\li360 "${escapeRtf(ch.fields.readAloud)}"\\li0\\par`);
    }
    const contentSource = includeGmSecrets ? ch.content : stripGmSecretBlocks(ch.content || '');
    const plain = stripHtmlToPlain(contentSource);
    if (plain) {
      lines.push(`${escapeRtf(plain)}\\par\\par`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}
