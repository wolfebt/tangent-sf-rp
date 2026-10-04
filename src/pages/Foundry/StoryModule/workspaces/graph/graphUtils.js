/**
 * @file graphUtils.js
 * @description Pure algorithmic utilities and data transformers for the ADE Visual Story Graph.
 * Supports tree flattening, link extraction, multi-directional auto-layout, grid snapping,
 * continuity and cycle analysis, and Mermaid / JSON export generation.
 */

// ── CANONICAL NODE TYPE STYLING & METADATA ──
export const NODE_TYPE_CONFIG = {
  Act: {
    label: 'Act / Arc Root',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
    borderClass: 'border-purple-500/80',
    selectedBorderClass: 'border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.4)]',
    accentColor: '#a855f7',
    dotColor: '#c084fc',
    icon: '👑'
  },
  Scene: {
    label: 'Narrative Scene',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    borderClass: 'border-cyan-500/70',
    selectedBorderClass: 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.4)]',
    accentColor: '#06b6d4',
    dotColor: '#22d3ee',
    icon: '🎬'
  },
  Encounter: {
    label: 'Tactical Encounter',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    borderClass: 'border-rose-500/80',
    selectedBorderClass: 'border-rose-400 ring-2 ring-rose-400/50 shadow-[0_0_25px_rgba(244,63,94,0.4)]',
    accentColor: '#f43f5e',
    dotColor: '#fb7185',
    icon: '⚔️'
  },
  Choice: {
    label: 'Decision Gate',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    borderClass: 'border-amber-500/80',
    selectedBorderClass: 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.4)]',
    accentColor: '#f59e0b',
    dotColor: '#fbbf24',
    icon: '🔀'
  },
  Climax: {
    label: 'Climax / Boss',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    borderClass: 'border-emerald-500/80',
    selectedBorderClass: 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.4)]',
    accentColor: '#10b981',
    dotColor: '#34d399',
    icon: '💥'
  },
  Resolution: {
    label: 'Resolution / Finale',
    badgeClass: 'bg-teal-950/80 text-teal-300 border-teal-800/80',
    borderClass: 'border-teal-500/80',
    selectedBorderClass: 'border-teal-400 ring-2 ring-teal-400/50 shadow-[0_0_25px_rgba(20,184,166,0.4)]',
    accentColor: '#14b8a6',
    dotColor: '#2dd4bf',
    icon: '🏆'
  },
  Secret: {
    label: 'Secret / Anomaly',
    badgeClass: 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-800/80',
    borderClass: 'border-fuchsia-500/80',
    selectedBorderClass: 'border-fuchsia-400 ring-2 ring-fuchsia-400/50 shadow-[0_0_25px_rgba(236,72,153,0.4)]',
    accentColor: '#ec4899',
    dotColor: '#f472b6',
    icon: '🔮'
  },
  Default: {
    label: 'Story Node',
    badgeClass: 'bg-slate-900 text-slate-300 border-slate-750',
    borderClass: 'border-slate-800 hover:border-slate-600',
    selectedBorderClass: 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    accentColor: '#64748b',
    dotColor: '#94a3b8',
    icon: '📄'
  }
};

export const getNodeTypeConfig = (type) => {
  if (!type) return NODE_TYPE_CONFIG.Default;
  const match = Object.keys(NODE_TYPE_CONFIG).find(
    k => k.toLowerCase() === type.toLowerCase()
  );
  return match ? NODE_TYPE_CONFIG[match] : NODE_TYPE_CONFIG.Default;
};

// ── FLATTEN SCENARIO HIERARCHY ──
export const flattenScenarios = (scenarioList = []) => {
  const nodes = [];
  const hierarchyLinks = [];

  const traverse = (list, parentId = null, depth = 0, path = []) => {
    if (!Array.isArray(list)) return;
    list.forEach((node, idx) => {
      const currentPath = [...path, node.title || 'Untitled'];
      nodes.push({
        ...node,
        depth,
        siblingIndex: idx,
        parentId,
        path: currentPath
      });

      if (parentId) {
        hierarchyLinks.push({
          id: `hlink_${parentId}_${node.id}`,
          sourceId: parentId,
          targetId: node.id,
          type: 'hierarchy',
          label: ''
        });
      }

      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id, depth + 1, currentPath);
      }
    });
  };

  traverse(scenarioList);
  return { flatNodes: nodes, hierarchyLinks };
};

// ── EXTRACT ALL GRAPH CONNECTIONS ──
export const extractAllLinks = (
  flatNodes = [],
  hierarchyLinks = [],
  allMaps = [],
  options = { showHierarchy: true, showWaypoints: true }
) => {
  const customLinks = [];
  const nodeExists = (id) => flatNodes.some(n => n.id === id);

  flatNodes.forEach(node => {
    // 1. Explicit choice connections
    const choices = node.fields?.choices || [];
    if (Array.isArray(choices)) {
      choices.forEach((choice, cIdx) => {
        if (choice.targetScenarioId && nodeExists(choice.targetScenarioId)) {
          customLinks.push({
            id: `choice_${node.id}_${choice.targetScenarioId}_${choice.id || cIdx}`,
            choiceId: choice.id,
            sourceId: node.id,
            targetId: choice.targetScenarioId,
            label: choice.text || choice.label || `Choice #${cIdx + 1}`,
            checkDc: choice.checkDc,
            attribute: choice.attribute,
            condition: choice.condition,
            type: 'choice'
          });
        }
      });
    }

    // 2. Custom node connections array
    const conns = node.fields?.connections || [];
    if (Array.isArray(conns)) {
      conns.forEach((conn, cIdx) => {
        if (conn.targetId && nodeExists(conn.targetId)) {
          customLinks.push({
            id: conn.id || `conn_${node.id}_${conn.targetId}_${cIdx}`,
            sourceId: node.id,
            targetId: conn.targetId,
            label: conn.label || '',
            checkDc: conn.checkDc,
            attribute: conn.attribute,
            condition: conn.condition,
            type: conn.type || 'branch'
          });
        }
      });
    }

    // 3. Tactical waypoint scenario triggers
    if (options.showWaypoints && node.mapId) {
      const linkedMap = allMaps.find(m => m.id === node.mapId);
      if (linkedMap?.waypoints) {
        linkedMap.waypoints.forEach((wp, wIdx) => {
          if (
            wp.triggerAction === 'ADVANCE_SCENARIO' &&
            wp.targetScenarioId &&
            nodeExists(wp.targetScenarioId)
          ) {
            customLinks.push({
              id: `wp_link_${node.id}_${wp.targetScenarioId}_${wIdx}`,
              sourceId: node.id,
              targetId: wp.targetScenarioId,
              label: `🚩 ${wp.name || 'Waypoint Vector'}`,
              type: 'waypoint'
            });
          }
        });
      }
    }
  });

  // Deduplicate and filter by options
  const linkMap = new Map();
  const rawList = options.showHierarchy 
    ? [...hierarchyLinks, ...customLinks] 
    : customLinks;

  rawList.forEach(l => {
    const key = `${l.sourceId}->${l.targetId}`;
    if (!linkMap.has(key) || l.type === 'choice' || l.checkDc) {
      linkMap.set(key, l);
    }
  });

  return Array.from(linkMap.values());
};

// ── SNAP TO GRID ──
export const snapToGrid = (val, gridSize = 20) => {
  return Math.round(val / gridSize) * gridSize;
};

export const snapPosition = (pos, gridSize = 20) => {
  return {
    x: snapToGrid(pos.x, gridSize),
    y: snapToGrid(pos.y, gridSize)
  };
};

// ── AUTO LAYOUT ENGINE ──
export const calculateAutoLayout = (
  flatNodes = [],
  allLinks = [],
  direction = 'horizontal',
  spacing = { col: 380, row: 280, offsetX: 80, offsetY: 80 }
) => {
  const newPositions = {};

  if (direction === 'vertical') {
    // Top-to-Bottom Layout (Y depends on depth, X depends on sibling rank)
    const depthCounts = {};
    flatNodes.forEach(node => {
      const d = node.depth || 0;
      depthCounts[d] = depthCounts[d] || 0;
      const x = spacing.offsetX + depthCounts[d] * spacing.col;
      const y = spacing.offsetY + d * spacing.row;
      depthCounts[d] += 1;
      newPositions[node.id] = { x, y };
    });
  } else {
    // Horizontal Left-to-Right Layout (X depends on depth, Y depends on sibling rank)
    const depthCounts = {};
    flatNodes.forEach(node => {
      const d = node.depth || 0;
      depthCounts[d] = depthCounts[d] || 0;
      const x = spacing.offsetX + d * spacing.col;
      const y = spacing.offsetY + depthCounts[d] * spacing.row;
      depthCounts[d] += 1;
      newPositions[node.id] = { x, y };
    });
  }

  return newPositions;
};

// ── BOUNDING BOX & FIT CALCULATOR ──
export const calculateBoundingBox = (
  flatNodes = [],
  getNodePos,
  nodeWidth = 300,
  nodeHeight = 180,
  padding = 160
) => {
  if (flatNodes.length === 0) {
    return { minX: 0, maxX: 1000, minY: 0, maxY: 600, width: 1000, height: 600, centerX: 500, centerY: 300 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  flatNodes.forEach(n => {
    const pos = getNodePos(n);
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x + nodeWidth);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y + nodeHeight);
  });

  const width = Math.max(maxX - minX + padding * 2, 800);
  const height = Math.max(maxY - minY + padding * 2, 600);

  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
    width,
    height,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
};

// ── GRAPH CONTINUITY & AUDIT ENGINE ──
export const auditGraphContinuity = (flatNodes = [], allLinks = []) => {
  const issues = [];
  const nodeCount = flatNodes.length;
  if (nodeCount === 0) return { score: 100, issues: [], rootCount: 0, deadEndCount: 0, orphanCount: 0 };

  const incomingCounts = {};
  const outgoingCounts = {};

  flatNodes.forEach(n => {
    incomingCounts[n.id] = 0;
    outgoingCounts[n.id] = 0;
  });

  allLinks.forEach(l => {
    if (outgoingCounts[l.sourceId] !== undefined) outgoingCounts[l.sourceId] += 1;
    if (incomingCounts[l.targetId] !== undefined) incomingCounts[l.targetId] += 1;
  });

  let rootCount = 0;
  let deadEndCount = 0;
  let orphanCount = 0;

  flatNodes.forEach(node => {
    const inc = incomingCounts[node.id] || 0;
    const out = outgoingCounts[node.id] || 0;
    const isRoot = (node.depth === 0 || node.depth === undefined) && !node.parentId && flatNodes[0]?.id === node.id;
    const isEnding = ['climax', 'resolution'].includes((node.type || '').toLowerCase());

    if (isRoot) rootCount += 1;

    // Orphan: No incoming links, not the first root node
    if (inc === 0 && !isRoot) {
      orphanCount += 1;
      issues.push({
        id: `orphan_${node.id}`,
        nodeId: node.id,
        nodeTitle: node.title,
        severity: 'warning',
        message: `Orphan Node: "${node.title}" has no incoming narrative branches or parent.`
      });
    }

    // Dead-end: No outgoing links and not marked as Climax or Resolution
    if (out === 0 && !isEnding && nodeCount > 1) {
      deadEndCount += 1;
      issues.push({
        id: `deadend_${node.id}`,
        nodeId: node.id,
        nodeTitle: node.title,
        severity: 'info',
        message: `Dead End: "${node.title}" has no outgoing decisions (consider marking as Climax / Resolution).`
      });
    }
  });

  // Calculate health score (100 down based on issues)
  const score = Math.max(100 - orphanCount * 12 - Math.max(deadEndCount - 1, 0) * 8, 20);

  return {
    score,
    issues,
    rootCount,
    deadEndCount,
    orphanCount,
    nodeCount,
    linkCount: allLinks.length
  };
};

// ── MERMAID DIAGRAM EXPORTER ──
export const exportGraphToMermaid = (
  flatNodes = [],
  allLinks = [],
  direction = 'LR',
  projectName = 'Adventure Narrative Flow'
) => {
  const sanitize = (str = '') => str.replace(/["\n\r\[\]\(\)]/g, ' ').trim();
  
  let lines = [
    `%% Tangent SF RP - ${sanitize(projectName)}`,
    `flowchart ${direction}`,
    '    %% Node Definitions'
  ];

  flatNodes.forEach(node => {
    const label = sanitize(node.title || 'Untitled');
    const type = sanitize(node.type || 'Scene');
    // Styling brackets based on type
    if (type.toLowerCase() === 'act') {
      lines.push(`    node_${node.id}[["👑 ${label} (${type})"]]`);
    } else if (type.toLowerCase() === 'choice') {
      lines.push(`    node_${node.id}{{"🔀 ${label}"}}`);
    } else if (type.toLowerCase() === 'climax' || type.toLowerCase() === 'resolution') {
      lines.push(`    node_${node.id}(["🏆 ${label} (${type})"])`);
    } else {
      lines.push(`    node_${node.id}["🎬 ${label}"]`);
    }
  });

  lines.push('\n    %% Connections & Decisions');
  allLinks.forEach(link => {
    const src = `node_${link.sourceId}`;
    const tgt = `node_${link.targetId}`;
    let label = sanitize(link.label || '');
    if (link.checkDc) {
      const attr = link.attribute ? `${link.attribute.toUpperCase()} ` : '';
      label = label ? `${label} [${attr}CR ${link.checkDc}]` : `CR ${link.checkDc}`;
    }

    if (label) {
      lines.push(`    ${src} -->|"${label}"| ${tgt}`);
    } else {
      lines.push(`    ${src} --> ${tgt}`);
    }
  });

  return lines.join('\n');
};

// ── JSON TOPOLOGY EXPORTER ──
export const exportGraphToJson = (
  flatNodes = [],
  allLinks = [],
  universeState = {}
) => {
  return JSON.stringify({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    campaign: universeState?.projectName || 'Tangent Adventure',
    nodes: flatNodes.map(n => ({
      id: n.id,
      title: n.title,
      type: n.type,
      mapId: n.mapId,
      position: n.fields?.graphPosition || null,
      beats: n.fields?.sceneBeats || '',
      choices: n.fields?.choices || [],
      connections: n.fields?.connections || []
    })),
    links: allLinks.map(l => ({
      id: l.id,
      sourceId: l.sourceId,
      targetId: l.targetId,
      label: l.label,
      type: l.type,
      checkDc: l.checkDc,
      attribute: l.attribute
    }))
  }, null, 2);
};
