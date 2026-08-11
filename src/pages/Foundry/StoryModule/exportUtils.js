import { formatExportFilename } from '../../../context/CampaignContext';
import { ELEMENT_SCHEMAS } from '../ElementForge/elementSchemas';

// Helper to get breadcrumb location path for an element
export const getBreadcrumbPath = (nodes, targetId, currentPath = []) => {
  for (let n of nodes) {
    const newPath = [...currentPath, n.title || 'Untitled'];
    if (n.id === targetId) return newPath;
    if (n.children && n.children.length > 0) {
      const found = getBreadcrumbPath(n.children, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
};

// Helper to convert HTML string to Markdown text
export const htmlToMarkdown = (htmlStr) => {
  if (!htmlStr) return '';
  return htmlStr
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<ul>(.*?)<\/ul>/gi, (m, p1) => p1.replace(/<li>(.*?)<\/li>/gi, '- $1\n') + '\n')
    .replace(/<ol>(.*?)<\/ol>/gi, (m, p1) => {
      let idx = 1;
      return p1.replace(/<li>(.*?)<\/li>/gi, () => `${idx++}. $1\n`) + '\n';
    })
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Export Element as JSON
export const exportElementJSON = (targetNode, universeState) => {
  if (!targetNode) return;
  const linkedMapObj = targetNode.mapId ? universeState.maps.find(m => m.id === targetNode.mapId) : null;

  const exportPayload = {
    type: "TangentStoryElement",
    version: "2.0",
    element: targetNode,
    linkedMap: linkedMapObj || null
  };

  const dataStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = formatExportFilename(targetNode.title, targetNode.type, 'json');
  a.click();
  URL.revokeObjectURL(url);
};

// Export Element as Markdown (.md)
export const exportElementMarkdown = (targetNode, universeState) => {
  if (!targetNode) return;

  const buildNodeMD = (node, depth = 1) => {
    const headingPrefix = '#'.repeat(Math.min(depth, 6));
    let md = `${headingPrefix} [${node.type || 'Element'}] ${node.title || 'Untitled'}\n\n`;

    if (node.imageUrl) {
      md += `![${node.title || 'Element Image'}](${node.imageUrl})\n\n`;
    }

    const schema = ELEMENT_SCHEMAS[node.type];
    if ((schema && node.fields) || (node.customFields && node.customFields.length > 0)) {
      let fieldsMd = '';
      if (schema && node.fields) {
        schema.forEach(fieldDef => {
          const val = node.fields[fieldDef.key];
          if (val && val.trim()) {
            fieldsMd += `- **${fieldDef.label}:** ${val.trim()}\n`;
          }
        });
      }
      if (node.customFields && Array.isArray(node.customFields)) {
        node.customFields.forEach(cf => {
          if (cf.label && cf.value && cf.value.trim()) {
            fieldsMd += `- **${cf.label}:** ${cf.value.trim()}\n`;
          }
        });
      }
      if (fieldsMd) {
        md += `${fieldsMd}\n`;
      }
    }

    if (node.content) {
      md += `${htmlToMarkdown(node.content)}\n\n`;
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        md += buildNodeMD(child, depth + 1);
      });
    }
    return md;
  };

  const fullMD = `# TANGENT SFF RPG — Story Module: ${universeState.projectName || 'Campaign'}\n\n` + buildNodeMD(targetNode, 2);

  const blob = new Blob([fullMD], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = formatExportFilename(targetNode.title || 'story', targetNode.type || 'module', 'md');
  a.click();
  URL.revokeObjectURL(url);
};

// Helper to check if an element type uses half-page image sizing
export const HALF_PAGE_ELEMENT_TYPES = ['Map', 'Clue', 'Handout'];
export const isHalfPageElement = (type) => HALF_PAGE_ELEMENT_TYPES.includes(type);

// Export Element as Printable PDF
export const exportElementPDF = (targetNode, universeState) => {
  if (!targetNode) return;
  const locationPath = getBreadcrumbPath(universeState.scenarios, targetNode.id);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert("Please allow popups to export printable PDF.");

  const buildNodeHTML = (node, depth = 2) => {
    const headingTag = `h${Math.min(depth, 6)}`;
    let html = `<div style="margin-bottom: 24px; page-break-inside: avoid;">`;
    html += `<${headingTag} style="color: #0284c7; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">`;
    html += `<span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-right: 8px;">${node.type || 'Element'}</span>`;
    html += `${node.title || 'Untitled'}</${headingTag}>`;

    if (node.imageUrl) {
      const isHalfPage = isHalfPageElement(node.type);
      const imgStyle = isHalfPage
        ? 'width: 80%; max-width: 80%; height: auto; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.12); margin: 12px 0; display: block;'
        : 'width: 40%; max-width: 40%; height: auto; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin: 12px 0; display: block;';
      html += `<div style="margin-bottom: 12px;"><img src="${node.imageUrl}" alt="${node.title || 'Element Image'}" style="${imgStyle}" /></div>`;
    }

    const schema = ELEMENT_SCHEMAS[node.type];
    if ((schema && node.fields) || (node.customFields && node.customFields.length > 0)) {
      let fieldsHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 12px; font-size: 12px;">';
      let hasFields = false;
      if (schema && node.fields) {
        schema.forEach(fieldDef => {
          const val = node.fields[fieldDef.key];
          if (val && val.trim()) {
            hasFields = true;
            fieldsHTML += `<div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 4px;">`;
            fieldsHTML += `<strong style="color: #0369a1; display: block; font-size: 10px; text-transform: uppercase;">${fieldDef.label}</strong>`;
            fieldsHTML += `<span style="color: #0f172a;">${val.trim()}</span></div>`;
          }
        });
      }
      if (node.customFields && Array.isArray(node.customFields)) {
        node.customFields.forEach(cf => {
          if (cf.label && cf.value && cf.value.trim()) {
            hasFields = true;
            fieldsHTML += `<div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 4px;">`;
            fieldsHTML += `<strong style="color: #0369a1; display: block; font-size: 10px; text-transform: uppercase;">${cf.label}</strong>`;
            fieldsHTML += `<span style="color: #0f172a;">${cf.value.trim()}</span></div>`;
          }
        });
      }
      fieldsHTML += '</div>';
      if (hasFields) html += fieldsHTML;
    }

    if (node.content) {
      html += `<div style="font-family: inherit; font-size: 14px; line-height: 1.6; color: #334155;">${node.content}</div>`;
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        html += buildNodeHTML(child, depth + 1);
      });
    }
    html += `</div>`;
    return html;
  };

  const fullHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tangent SFF RPG - ${targetNode.title}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; background: #fff; }
          .header { border-bottom: 3px solid #0284c7; padding-bottom: 12px; margin-bottom: 24px; }
          .title { font-size: 26px; font-weight: bold; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; }
          .subtitle { font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; }
          .path { font-size: 11px; font-family: monospace; color: #475569; margin-top: 6px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="subtitle">Tangent Science Fantasy Roleplay — Story Module</div>
          <div class="title">${targetNode.title}</div>
          <div class="path">Location Path: ${locationPath ? locationPath.join(' ❯ ') : 'Root'}</div>
        </div>
        ${buildNodeHTML(targetNode)}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(fullHTML);
  printWindow.document.close();
};

// Delete Element
export const deleteElementConfirm = (targetNode, deleteStory) => {
  if (!targetNode) return;
  const name = targetNode.title ? `"${targetNode.title}"` : 'this element';
  if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    deleteStory(targetNode.id);
  }
};

