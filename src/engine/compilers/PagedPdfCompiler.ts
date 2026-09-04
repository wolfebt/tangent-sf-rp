/**
 * @file PagedPdfCompiler.ts
 * @description Stage 9 Paged.js Print Compilation Engine.
 * Ingests scenario nodes, maps, and statblocks into print-ready HTML
 * with CSS Paged Media standards (@page, counters, two-column spreads, orphan control).
 */

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
  pageSize?: 'letter' | 'a4';
}

export class PagedPdfCompilerService {
  /**
   * Compiles an array of scenario nodes into print-ready Paged.js HTML.
   */
  public compileToPagedHtml(
    nodes: ScenarioExportNode[],
    options: CompileOptions = {}
  ): { html: string; pageCountEstimate: number } {
    const title = options.adventureTitle || 'Tangent SF RP Adventure Module';
    const author = options.authorName || 'Architect';
    const pageSize = options.pageSize || 'letter';

    const pagedStyles = `
      <style>
        @page {
          size: ${pageSize};
          margin: 18mm 15mm 20mm 15mm;
          @bottom-left {
            content: "${title}";
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

        .sensory-box {
          background-color: #f8fafc;
          border-left: 3px solid #f59e0b;
          padding: 8px 12px;
          margin: 10px 0;
          font-style: italic;
          break-inside: avoid;
        }

        .threat-card {
          background-color: #fef2f2;
          border: 1px solid #f87171;
          border-radius: 4px;
          padding: 8px 10px;
          margin: 8px 0;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 9pt;
          break-inside: avoid;
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

    let bodyHtml = `
      <div class="cover-section">
        <h1>${title}</h1>
        <p style="font-style: italic; color: #475569;">Written by ${author} &bull; Tangent SF RP Master Module</p>
      </div>
    `;

    for (const node of nodes) {
      bodyHtml += `
        <div class="scenario-section">
          <h2>${node.title}</h2>
          <div class="two-columns">
            ${node.summary ? `<p><strong>Overview:</strong> ${node.summary}</p>` : ''}
            
            ${node.fields?.readAloud ? `
              <div class="sensory-box">
                "${node.fields.readAloud}"
              </div>
            ` : ''}

            ${node.content ? `<div>${node.content}</div>` : ''}

            ${node.fields?.bulletPoints && node.fields.bulletPoints.length > 0 ? `
              <ul class="bullet-list">
                ${node.fields.bulletPoints.map(b => `<li>${b}</li>`).join('')}
              </ul>
            ` : ''}

            ${node.fields?.threats && node.fields.threats.length > 0 ? `
              <div class="threat-matrix">
                ${node.fields.threats.map(t => `
                  <div class="threat-card">
                    <div class="threat-title"><span>${t.name}</span> <span>[${t.tier}]</span></div>
                    <div>HP: ${t.hp} &bull; DR: ${t.dr} &bull; Attack: ${t.attack}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
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
