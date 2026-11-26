/**
 * @file PagedPdfCompiler.ts
 * @description Stage 9 Paged.js Print Compilation Engine.
 * Ingests scenario nodes, maps, and statblocks into print-ready HTML
 * with CSS Paged Media standards (@page, counters, two-column spreads, orphan control).
 */

import DOMPurify from 'dompurify';
import { stripGmSecretHtmlBlocks } from '../../utils/gmSecretSanitizer.js';

export interface ScenarioExportNode {
  id: string;
  title: string;
  content: string;
  summary?: string;
  fields?: {
    readAloud?: string;
    bulletPoints?: string[];
    threats?: Array<{ name: string; tier: string; hp: number; dr: string; attack: string }>;
  };
  children?: ScenarioExportNode[];
}

export interface CompileOptions {
  adventureTitle?: string;
  authorName?: string;
  includeCoverPage?: boolean;
  includeToc?: boolean;
  includeGmSecrets?: boolean;
  includeSynopsis?: boolean;
  includeBeats?: boolean;
  includeProse?: boolean;
  includeMapKeys?: boolean;
  includeWaypoints?: boolean;
  includeReadAloud?: boolean;
  includeStatBlocks?: boolean;
  includeHandouts?: boolean;
  includeProps?: boolean;
  includeOsrSpread?: boolean;
  printLayout?: 'osr_module' | 'novel' | 'cards';
  pageSize?: 'letter' | 'a4';
  mapImages?: Array<{ title: string; dataUrl: string }>;
  waypoints?: Array<{ label?: string; name?: string; triggerAction?: string; x?: number; y?: number }>;
  handouts?: Array<{ title?: string; name?: string; content?: string; summary?: string }>;
  props?: Array<{ name?: string; label?: string; type?: string; description?: string }>;
  personas?: Array<{ title?: string; name?: string; archetype?: string; fields?: Record<string, any> }>;
}

function escapeHtml(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCssString(val: unknown): string {
  return String(val ?? '')
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/</g, '\\3c ')
    .replace(/>/g, '\\3e ');
}

function sanitizeRichHtml(rawHtml: unknown): string {
  const str = String(rawHtml ?? '');
  if (!str) return '';
  if (typeof window !== 'undefined' && typeof DOMPurify?.sanitize === 'function') {
    return DOMPurify.sanitize(str);
  }
  // Hardened Node/SSR fallback: iteratively strip dangerous tags, event handlers, and active URIs
  let clean = str;
  let prev = '';
  const pairedDangerous = /<(script|style|iframe|object|embed|svg|form|base|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi;
  const unclosedOrVoidDangerous = /<\/?(script|style|iframe|object|embed|svg|form|base|link|meta|img)\b[^>]*>/gi;
  while (clean !== prev) {
    prev = clean;
    clean = clean
      .replace(pairedDangerous, '')
      .replace(unclosedOrVoidDangerous, '')
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(?:javascript|vbscript)\s*:/gi, '')
      .replace(/data\s*:\s*text\/html/gi, '');
  }
  return clean;
}

function stripGmSecretMarkup(rawHtml: string): string {
  return stripGmSecretHtmlBlocks(rawHtml);
}

export class PagedPdfCompilerService {
  /**
   * Compiles an array of scenario nodes into print-ready Paged.js HTML.
   */
  public compileToPagedHtml(
    nodes: ScenarioExportNode[],
    options: CompileOptions = {}
  ): { html: string; pageCountEstimate: number } {
    const rawTitle = options.adventureTitle || 'Tangent SF RP Adventure Module';
    const rawAuthor = options.authorName || 'Architect';
    const title = escapeHtml(rawTitle);
    const author = escapeHtml(rawAuthor);
    const pageSize = options.pageSize === 'a4' ? 'a4' : 'letter';
    const includeGmSecrets = options.includeGmSecrets !== false;
    const includeToc = Boolean(options.includeToc);
    const includeSynopsis = options.includeSynopsis !== false;
    const includeBeats = options.includeBeats !== false;
    const includeProse = options.includeProse !== false;
    const includeReadAloud = options.includeReadAloud !== false;
    const includeStatBlocks = options.includeStatBlocks !== false;
    const includeMapKeys = options.includeMapKeys !== false;
    const includeWaypoints = options.includeWaypoints !== false;
    const includeHandouts = options.includeHandouts !== false;
    const includeProps = options.includeProps !== false;
    const includeOsrSpread = options.includeOsrSpread !== false;
    const layoutClass =
      options.printLayout === 'novel'
        ? 'single-column'
        : options.printLayout === 'cards'
          ? 'cards-grid'
          : 'two-columns';

    const pagedStyles = `
      <style>
        @page {
          size: ${pageSize};
          margin: 18mm 15mm 20mm 15mm;
          @bottom-left {
            content: "${escapeCssString(rawTitle)}";
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8pt;
            color: #64748b;
          }
          @bottom-right {
            content: "Page " counter(page);
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8pt;
            color: #64748b;
          }
        }

        body {
          font-family: 'Georgia', serif;
          font-size: 10pt;
          line-height: 1.5;
          color: #1e293b;
          background: #ffffff;
          margin: 0;
          padding: 0;
        }

        h1, h2, h3, h4 {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          break-after: avoid;
        }

        h1 { font-size: 18pt; border-bottom: 2px solid #0284c7; padding-bottom: 4px; color: #0f172a; }
        h2 { font-size: 13pt; color: #0369a1; }
        h3 { font-size: 11pt; color: #334155; }

        .two-columns {
          columns: 2;
          column-gap: 8mm;
        }

        .single-column {
          max-width: 160mm;
          margin: 0 auto;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6mm;
        }

        .cards-grid > * {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 10px;
          break-inside: avoid;
          background: #ffffff;
        }

        .sensory-box, blockquote.ade-read-aloud {
          background-color: #f8fafc;
          border-left: 3px solid #f59e0b;
          padding: 8px 12px;
          margin: 10px 0;
          font-style: italic;
          break-inside: avoid;
        }

        .ade-gm-secret {
          background-color: #fff7ed;
          border: 1px dashed #ea580c;
          border-radius: 4px;
          padding: 8px 10px;
          margin: 8px 0;
          font-size: 9pt;
          break-inside: avoid;
        }

        .threat-card, .ade-statblock-card {
          background-color: #fef2f2;
          border: 1px solid #f87171;
          border-radius: 4px;
          padding: 8px 10px;
          margin: 8px 0;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 9pt;
          break-inside: avoid;
        }

        .ade-skill-check {
          font-family: 'Helvetica Neue', sans-serif;
          font-weight: bold;
          background: #e0f2fe;
          color: #0369a1;
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 9pt;
        }

        .toc-section {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          padding: 10px 14px;
          margin: 14px 0;
          break-inside: avoid;
        }

        .toc-section ul {
          margin: 6px 0 0 16px;
          padding: 0;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 9.5pt;
        }

        .map-plate {
          margin: 14px 0;
          text-align: center;
          break-inside: avoid;
        }

        .map-plate img {
          max-width: 100%;
          border: 1px solid #94a3b8;
        }

        .threat-title {
          font-weight: bold;
          color: #991b1b;
          display: flex;
          justify-content: space-between;
        }

        .bullet-list {
          margin: 8px 0 8px 16px;
          padding: 0;
        }

        .bullet-list li {
          margin-bottom: 4px;
        }

        .page-break {
          break-before: page;
        }
      </style>
    `;

    let bodyHtml = '';
    if (options.includeCoverPage !== false) {
      bodyHtml += `
        <div class="cover-section">
          <h1>${title}</h1>
          <p style="font-style: italic; color: #475569;">Written by ${author} &bull; Tangent SF RP Master Module</p>
        </div>
      `;
    }

    const collectTocEntries = (list: ScenarioExportNode[], depth = 0): Array<{ id: string; title: string; depth: number }> => {
      const items: Array<{ id: string; title: string; depth: number }> = [];
      for (const n of list || []) {
        if (!includeGmSecrets && ((n as { isHidden?: boolean; isGmOnly?: boolean }).isHidden || (n as { isGmOnly?: boolean }).isGmOnly)) {
          continue;
        }
        const anchorId = `sec_${String(n.id || items.length).replace(/[^A-Za-z0-9_-]/g, '_')}`;
        items.push({ id: anchorId, title: n.title || 'Untitled Section', depth });
        if (Array.isArray(n.children) && n.children.length > 0) {
          items.push(...collectTocEntries(n.children, depth + 1));
        }
      }
      return items;
    };

    if (includeToc && Array.isArray(nodes) && nodes.length > 0) {
      const entries = collectTocEntries(nodes);
      bodyHtml += `
        <nav class="toc-section">
          <h3>Table of Contents</h3>
          <ul>
            ${entries.map((e) => `<li style="margin-left:${e.depth * 12}px"><a href="#${escapeHtml(e.id)}">${escapeHtml(e.title)}</a></li>`).join('')}
          </ul>
        </nav>
      `;
    }

    const renderNodeHtml = (node: ScenarioExportNode & Record<string, any>, depth: number = 2): string => {
      if (!includeGmSecrets && (node.isHidden || node.isGmOnly)) return '';
      const headingTag = `h${Math.min(6, Math.max(2, depth))}`;
      const anchorId = `sec_${String(node.id || 'node').replace(/[^A-Za-z0-9_-]/g, '_')}`;
      const rawContent = includeGmSecrets ? node.content : stripGmSecretMarkup(node.content || '');
      const rawSummary = includeGmSecrets ? node.summary : stripGmSecretMarkup(node.summary || '');
      const childrenHtml = Array.isArray(node.children) && node.children.length > 0
        ? node.children.map(child => renderNodeHtml(child as any, depth + 1)).join('')
        : '';

      return `
        <div class="scenario-section" id="${escapeHtml(anchorId)}">
          <${headingTag}>${escapeHtml(node.title)}</${headingTag}>
          <div class="${layoutClass}">
            ${includeSynopsis && rawSummary ? `<p><strong>Overview:</strong> ${escapeHtml(rawSummary)}</p>` : ''}
            
            ${includeReadAloud && node.fields?.readAloud ? `
              <div class="sensory-box">
                "${escapeHtml(node.fields.readAloud)}"
              </div>
            ` : ''}

            ${includeProse && rawContent ? `<div>${sanitizeRichHtml(rawContent)}</div>` : ''}

            ${includeBeats && node.fields?.bulletPoints && node.fields.bulletPoints.length > 0 ? `
              <ul class="bullet-list">
                ${node.fields.bulletPoints.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            ` : ''}

            ${includeGmSecrets && includeStatBlocks && node.fields?.threats && node.fields.threats.length > 0 ? `
              <div class="threat-matrix">
                ${node.fields.threats.map(t => `
                  <div class="threat-card">
                    <div class="threat-title"><span>${escapeHtml(t.name)}</span> <span>[${escapeHtml(t.tier)}]</span></div>
                    <div>HP: ${escapeHtml(t.hp)} &bull; DR: ${escapeHtml(t.dr)} &bull; Attack: ${escapeHtml(t.attack)}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          ${childrenHtml}
        </div>
      `;
    };

    for (const node of nodes || []) {
      bodyHtml += renderNodeHtml(node, 2);
    }

    if (includeOsrSpread && includeStatBlocks && Array.isArray(options.personas) && options.personas.length > 0) {
      bodyHtml += `<section class="osr-spread-section"><h2>Operative &amp; Threat Reference Cards</h2><div class="${layoutClass}">`;
      for (const p of options.personas) {
        const pTitle = escapeHtml(p.title || p.name || 'Operative');
        const pHp = escapeHtml(p.fields?.health ?? p.fields?.hp ?? '30');
        const pDef = escapeHtml(p.fields?.defense_dc ?? p.fields?.defense ?? '15');
        bodyHtml += `<div class="threat-card"><div class="threat-title"><span>${pTitle}</span><span>${escapeHtml(p.archetype || p.fields?.mcmRole || 'Persona')}</span></div><div>HP: ${pHp} &bull; Defense DC: ${pDef}</div></div>`;
      }
      bodyHtml += `</div></section>`;
    }

    if (includeWaypoints && Array.isArray(options.waypoints) && options.waypoints.length > 0) {
      bodyHtml += `<section class="waypoints-section"><h2>Tactical Map Waypoints</h2><ul class="bullet-list">`;
      for (const wp of options.waypoints) {
        bodyHtml += `<li><strong>${escapeHtml(wp.label || wp.name || 'Waypoint')}</strong> (${escapeHtml(wp.triggerAction || 'REVEAL_BEAT')})</li>`;
      }
      bodyHtml += `</ul></section>`;
    }

    if (includeProps && Array.isArray(options.props) && options.props.length > 0) {
      bodyHtml += `<section class="props-section"><h2>Interactive Props &amp; Terminals</h2><ul class="bullet-list">`;
      for (const pr of options.props) {
        bodyHtml += `<li><strong>${escapeHtml(pr.name || pr.label || 'Prop')}</strong> [${escapeHtml(pr.type || 'Object')}]${pr.description ? ` &mdash; ${escapeHtml(pr.description)}` : ''}</li>`;
      }
      bodyHtml += `</ul></section>`;
    }

    if (includeHandouts && Array.isArray(options.handouts) && options.handouts.length > 0) {
      bodyHtml += `<section class="handouts-section"><h2>Player Handouts &amp; Clues</h2><div class="${layoutClass}">`;
      for (const h of options.handouts) {
        const rawHandout = h.content || h.summary || '';
        const cleanedHandout = includeGmSecrets ? rawHandout : stripGmSecretMarkup(rawHandout);
        bodyHtml += `<div class="sensory-box"><strong>${escapeHtml(h.title || h.name || 'Handout')}</strong><div>${sanitizeRichHtml(cleanedHandout)}</div></div>`;
      }
      bodyHtml += `</div></section>`;
    }

    if (includeMapKeys && Array.isArray(options.mapImages) && options.mapImages.length > 0) {
      for (const mapImg of options.mapImages) {
        if (!mapImg?.dataUrl) continue;
        bodyHtml += `
          <div class="map-plate">
            <h3>Tactical Plate: ${escapeHtml(mapImg.title)}</h3>
            <img src="${escapeHtml(mapImg.dataUrl)}" alt="${escapeHtml(mapImg.title)}" />
          </div>
        `;
      }
    }

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  ${pagedStyles}
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

    // Estimate page count: ~500 words per page in 2-column spread
    const totalWords = bodyHtml.split(/\s+/).length;
    const pageCountEstimate = Math.max(1, Math.ceil(totalWords / 450));

    return {
      html: fullHtml,
      pageCountEstimate
    };
  }
}

export const PagedPdfCompiler = new PagedPdfCompilerService();
export default PagedPdfCompiler;
