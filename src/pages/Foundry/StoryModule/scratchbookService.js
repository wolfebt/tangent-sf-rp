/**
 * @file scratchbookService.js
 * @description Compiles the comprehensive Per-Project Scratchbook (.md) for the Tangent SF RP
 * Adventure Development Environment (ADE), acting as the single source of truth for ongoing stories.
 * Catalogs all worldbuilding elements used, active guidance gems, scenario hierarchy,
 * OSR Control Panel scripts, threat matrices, interactive beats ledger, and manuscript prose.
 */

/**
 * Strips HTML tags for clean markdown representation
 */
const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();
};

/**
 * Recursively traverses scenario nodes
 */
const traverseNodes = (nodes, callback, depth = 0) => {
  if (!Array.isArray(nodes)) return;
  for (const node of nodes) {
    callback(node, depth);
    if (node.children && node.children.length > 0) {
      traverseNodes(node.children, callback, depth + 1);
    }
  }
};

/**
 * Finds all elements used or referenced in the project
 */
export const findElementsUsed = (universeState, elementsCatalog = []) => {
  const elementsMap = new Map();
  const scenarios = universeState?.scenarios || [];

  // Register elements linked in scenarios
  traverseNodes(scenarios, (node) => {
    const linkedIds = Array.isArray(node.linkedElements) ? node.linkedElements : [];
    for (const id of linkedIds) {
      const match = elementsCatalog.find(e => e.id === id);
      if (match) {
        if (!elementsMap.has(id)) {
          elementsMap.set(id, {
            ...match,
            usedIn: [node.title || 'Untitled Scenario']
          });
        } else {
          const entry = elementsMap.get(id);
          if (!entry.usedIn.includes(node.title)) {
            entry.usedIn.push(node.title || 'Untitled Scenario');
          }
        }
      }
    }

    // Check if the node itself is a specific typed element
    if (node.type && node.type !== 'Scenario' && node.type !== 'Folder') {
      if (!elementsMap.has(node.id)) {
        elementsMap.set(node.id, {
          id: node.id,
          title: node.title,
          type: node.type,
          summary: node.fields?.summary || stripHtml(node.content).slice(0, 150),
          fields: node.fields || {},
          usedIn: ['Scenario Hierarchy']
        });
      }
    }
  });

  return Array.from(elementsMap.values());
};

/**
 * Compiles the complete Markdown Scratchbook for a story project
 */
export const generateStoryScratchbook = ({
  universeState,
  elementsCatalog = [],
  customNotes = '',
  beatsLedger = []
}) => {
  const projectName = universeState?.projectName || 'Untitled Story Project';
  const author = universeState?.authorHandle || universeState?.authorEmail || 'Architect';
  const scenarios = universeState?.scenarios || [];
  const creativeState = universeState?.creativeState || {};
  const activeGems = creativeState?.gems || [];
  const maps = universeState?.maps || [];

  const elementsUsed = findElementsUsed(universeState, elementsCatalog);

  // Compute total word count
  let totalWords = 0;
  traverseNodes(scenarios, (node) => {
    const plain = stripHtml(node.content);
    if (plain) {
      totalWords += plain.split(/\s+/).filter(Boolean).length;
    }
  });

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let md = `# 📓 ${projectName.toUpperCase()} — PROJECT SCRATCHBOOK\n\n`;
  md += `> **Source of Truth & Development Reference Document**  \n`;
  md += `> *Author/Architect*: \`${author}\` | *Compiled*: \`${now}\` | *Total Words*: \`${totalWords}\` | *Elements Used*: \`${elementsUsed.length}\`\n\n`;
  md += `---\n\n`;

  // SECTION 1: NARRATIVE VISION & GUIDANCE GEMS
  md += `## 💎 1. NARRATIVE VISION & GUIDANCE GEMS\n\n`;
  if (activeGems.length > 0) {
    md += `**Active Directives & Modifiers**:  \n`;
    md += activeGems.map(g => `- \`${g}\``).join('\n') + '\n\n';
  } else {
    md += `*No guidance gems currently active. Using standard Tangent SFF RPG high-tech/psionic baseline.*\n\n`;
  }

  if (creativeState?.storyOutline) {
    md += `### High-Level Story Outline\n\n`;
    md += stripHtml(creativeState.storyOutline) + '\n\n';
  }

  md += `---\n\n`;

  // SECTION 2: CATALOG OF ALL ELEMENTS USED
  md += `## 🧩 2. COMPLETE CATALOG OF ALL ELEMENTS USED (${elementsUsed.length})\n\n`;
  if (elementsUsed.length === 0) {
    md += `*No external worldbuilding elements linked yet. Mention or link Personas, Factions, Species, Locations, or Weapons in your scenarios to catalog them here.*\n\n`;
  } else {
    // Group by element type
    const byType = {};
    for (const elem of elementsUsed) {
      const t = elem.type || 'Custom';
      if (!byType[t]) byType[t] = [];
      byType[t].push(elem);
    }

    for (const [type, items] of Object.entries(byType)) {
      md += `### ${type} (${items.length})\n\n`;
      for (const item of items) {
        md += `#### **${item.title || item.name || 'Untitled'}**\n`;
        if (item.summary || item.description) {
          md += `> ${item.summary || item.description}\n\n`;
        }
        if (item.usedIn && item.usedIn.length > 0) {
          md += `*Referenced In*: ${item.usedIn.join(', ')}  \n`;
        }
        if (item.fields && Object.keys(item.fields).length > 0) {
          const fieldEntries = Object.entries(item.fields)
            .filter(([k, v]) => v && typeof v === 'string' && v.trim())
            .map(([k, v]) => `**${k}**: ${v}`);
          if (fieldEntries.length > 0) {
            md += `*Key Attributes*: ${fieldEntries.slice(0, 4).join(' | ')}  \n`;
          }
        }
        md += '\n';
      }
    }
  }

  md += `---\n\n`;

  // SECTION 3: SCENARIOS & CHAPTER HIERARCHY
  md += `## 📖 3. SCENARIOS & CHAPTER HIERARCHY\n\n`;
  if (scenarios.length === 0) {
    md += `*No scenario elements authored yet.*\n\n`;
  } else {
    traverseNodes(scenarios, (node, depth) => {
      const indent = '  '.repeat(depth);
      const headingPrefix = '#'.repeat(Math.min(depth + 3, 6));
      md += `${headingPrefix} [${node.type || 'Scene'}] ${node.title || 'Untitled'}\n\n`;

      // Linked map
      if (node.mapId) {
        const linkedMap = maps.find(m => m.id === node.mapId);
        if (linkedMap) {
          md += `> 🗺️ **Connected Tactical Map**: *${linkedMap.title}* (${linkedMap.gridMode || 'Square'} grid)\n\n`;
        }
      }

      // Plain content summary
      const plain = stripHtml(node.content);
      if (plain) {
        md += `${plain}\n\n`;
      }

      // OSR Control Panel components if present
      const fields = node.fields || {};
      if (fields.readAloud) {
        md += `> 🎙️ **Sensory Read-Aloud (GM Script)**:  \n> *"${fields.readAloud}"*\n\n`;
      }

      if (Array.isArray(fields.bulletPoints) && fields.bulletPoints.length > 0) {
        md += `**Tactical Interaction Points & DCs**:\n`;
        for (const bp of fields.bulletPoints) {
          md += `- ${bp}\n`;
        }
        md += '\n';
      }

      if (Array.isArray(fields.threats) && fields.threats.length > 0) {
        md += `**Threat Matrix**:\n`;
        for (const th of fields.threats) {
          md += `- **${th.name}** [${th.tier || 'Tier 1'}]: HP ${th.hp || 10}, DR ${th.dr || 0}, Attack: ${th.attack || 'Kinetic'}\n`;
        }
        md += '\n';
      }

      if (fields.gmSecrets) {
        md += `> 🔒 **Classified GM Secret / Discovery**:  \n> ${fields.gmSecrets}\n\n`;
      }
    });
  }

  md += `---\n\n`;

  // SECTION 4: INTERACTIVE STORY BEATS & DECISION GATE TIMELINE
  if (Array.isArray(beatsLedger) && beatsLedger.length > 0) {
    md += `## ⚡ 4. INTERACTIVE STORY BEATS & DECISION GATE LEDGER (${beatsLedger.length} Beats)\n\n`;
    for (const beat of beatsLedger) {
      md += `### Beat #${beat.beatIndex || '1'}\n\n`;
      md += `${beat.content}\n\n`;
      if (beat.gate?.chosenOption) {
        md += `> 🎯 **Player Action**: *"${beat.gate.chosenOption}"*  \n`;
        if (beat.gate.checkResult) {
          md += `> 🎲 **Check Outcome**: \`${beat.gate.checkResult}\`  \n`;
        }
        md += '\n';
      }
    }
    md += `---\n\n`;
  }

  // SECTION 5: ONGOING GM DEVELOPMENT NOTES & REVISION LEDGER
  md += `## 📝 5. ONGOING GM DEVELOPMENT NOTES & REVISION LOG\n\n`;
  if (customNotes && customNotes.trim()) {
    md += `${customNotes.trim()}\n\n`;
  } else {
    md += `*Use this section to record ongoing campaign notes, open plot hooks, unresolved player decisions, and explicit instructions to ground future AI co-pilot sessions.*\n\n`;
  }

  return md;
};

/**
 * Convenient wrapper accepting positional arguments
 */
export const generateScratchbookMarkdown = (universeState, elementsCatalog = [], customNotes = '', beatsLedger = []) => {
  return generateStoryScratchbook({
    universeState,
    elementsCatalog,
    customNotes,
    beatsLedger
  });
};

/**
 * Downloads the scratchbook markdown file
 */
export const downloadScratchbookFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

