/**
 * @file assetGraphUtils.js
 * @description Connection-first graph synthesis, smart lore discovery, ego-network filtering,
 * and non-overlapping topological layout engine for the Weaver Asset Interconnection Graph.
 */

export const CARD_WIDTH = 208;
export const CARD_HEIGHT = 76;

export const RELATIONSHIP_TYPES = {
  allied: {
    id: 'allied',
    label: 'Allied / Cooperative',
    shortLabel: 'Allied',
    color: '#10b981',
    dashed: false
  },
  hostile: {
    id: 'hostile',
    label: 'Hostile / Rivalry',
    shortLabel: 'Hostile',
    color: '#ef4444',
    dashed: false
  },
  located_in: {
    id: 'located_in',
    label: 'Located In / Orbiting',
    shortLabel: 'Located In',
    color: '#38bdf8',
    dashed: false
  },
  member_of: {
    id: 'member_of',
    label: 'Member Of / Affiliate',
    shortLabel: 'Member Of',
    color: '#a855f7',
    dashed: false
  },
  custodian_of: {
    id: 'custodian_of',
    label: 'Custodian Of / Controls',
    shortLabel: 'Controls',
    color: '#f59e0b',
    dashed: false
  },
  patron_of: {
    id: 'patron_of',
    label: 'Patron / Command',
    shortLabel: 'Patron',
    color: '#06b6d4',
    dashed: false
  },
  secret: {
    id: 'secret',
    label: 'Secret Link / Hidden Motive',
    shortLabel: 'Secret',
    color: '#ec4899',
    dashed: true
  },
  asset_hub: {
    id: 'asset_hub',
    label: 'AIME Asset Hub Link',
    shortLabel: 'Asset Hub',
    color: '#818cf8',
    dashed: false
  },
  mentioned: {
    id: 'mentioned',
    label: 'Referenced in Story Prose',
    shortLabel: 'In Prose',
    color: '#2dd4bf',
    dashed: true
  },
  sector_map: {
    id: 'sector_map',
    label: 'Linked Tactical Sector',
    shortLabel: 'Sector Map',
    color: '#38bdf8',
    dashed: false
  }
};

export const MANUAL_RELATIONSHIP_OPTIONS = [
  RELATIONSHIP_TYPES.allied,
  RELATIONSHIP_TYPES.hostile,
  RELATIONSHIP_TYPES.located_in,
  RELATIONSHIP_TYPES.member_of,
  RELATIONSHIP_TYPES.custodian_of,
  RELATIONSHIP_TYPES.patron_of,
  RELATIONSHIP_TYPES.secret
];

export function getRelationshipMeta(type) {
  return (
    RELATIONSHIP_TYPES[type] || {
      id: type || 'linked',
      label: type || 'Connected',
      shortLabel: type || 'Linked',
      color: '#94a3b8',
      dashed: false
    }
  );
}

export const CATEGORY_META = {
  Scenario: { label: 'Scenario', accent: '#06b6d4', badge: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40' },
  Persona: { label: 'Persona', accent: '#a855f7', badge: 'bg-purple-950/90 text-purple-300 border-purple-500/40' },
  Faction: { label: 'Faction', accent: '#6366f1', badge: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40' },
  Location: { label: 'Location', accent: '#38bdf8', badge: 'bg-sky-950/90 text-sky-300 border-sky-500/40' },
  Item: { label: 'Tech & Item', accent: '#f59e0b', badge: 'bg-amber-950/90 text-amber-300 border-amber-500/40' },
  Lore: { label: 'Lore & Codex', accent: '#10b981', badge: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' }
};

export function classifyAssetCategory(type = '', isScenario = false) {
  if (isScenario) return 'Scenario';
  const norm = String(type).toLowerCase();
  if (norm.includes('persona') || norm.includes('character') || norm.includes('species')) {
    return 'Persona';
  }
  if (norm.includes('faction') || norm.includes('philosophy')) {
    return 'Faction';
  }
  if (
    norm.includes('location') ||
    norm.includes('setting') ||
    norm.includes('world') ||
    norm.includes('universe') ||
    norm.includes('map')
  ) {
    return 'Location';
  }
  if (
    norm.includes('item') ||
    norm.includes('tech') ||
    norm.includes('object') ||
    norm.includes('clue') ||
    norm.includes('handout')
  ) {
    return 'Item';
  }
  return 'Lore';
}

export function flattenScenariosList(nodes = []) {
  if (!Array.isArray(nodes)) return [];
  const out = [];
  const walk = (list) => {
    for (const item of list) {
      if (!item || !item.id) continue;
      out.push(item);
      if (Array.isArray(item.children) && item.children.length > 0) {
        walk(item.children);
      }
    }
  };
  walk(nodes);
  return out;
}

function cleanTextSnippet(raw = '') {
  if (!raw) return '';
  return String(raw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Builds a clean, deduplicated catalog of scenarios (from the current story),
 * world elements (excluding foreign story scenario clones unless explicitly linked),
 * and tactical maps.
 */
export function buildCatalogAssets({
  scenariosTree = [],
  elementsCatalog = [],
  mapsCatalog = [],
  universeMaps = [],
  rawLinks = [],
  activeNode = null
}) {
  const seenIds = new Set();
  const catalog = [];
  const explicitlyLinkedIds = new Set();

  for (const l of rawLinks || []) {
    if (l?.source) explicitlyLinkedIds.add(l.source);
    if (l?.target) explicitlyLinkedIds.add(l.target);
  }

  const scenariosFlat = flattenScenariosList(scenariosTree);
  if (activeNode?.id && !scenariosFlat.some((s) => s.id === activeNode.id)) {
    scenariosFlat.unshift(activeNode);
  }

  for (const sc of scenariosFlat) {
    if (!sc?.id || seenIds.has(sc.id)) continue;
    seenIds.add(sc.id);
    const pitch =
      cleanTextSnippet(sc.fields?.oneLinePitch || sc.fields?.summary || sc.content).slice(0, 140) ||
      'Story Scenario Node';
    catalog.push({
      id: sc.id,
      title: (sc.title || 'Untitled Scenario').trim(),
      type: sc.type || 'Scenario',
      category: 'Scenario',
      isScenario: true,
      isMap: false,
      description: pitch,
      fields: sc.fields || {},
      raw: sc
    });
  }

  for (const elem of elementsCatalog || []) {
    if (!elem?.id || seenIds.has(elem.id)) continue;
    const rawType = String(elem.type || '').trim();
    const lowerType = rawType.toLowerCase();

    // Skip scenario records saved from other story projects unless explicitly linked
    if ((lowerType === 'scenario' || lowerType === 'story module') && !explicitlyLinkedIds.has(elem.id)) {
      continue;
    }

    seenIds.add(elem.id);
    const title = (elem.title || elem.name || 'Untitled Asset').trim();
    const category = classifyAssetCategory(rawType, false);
    const pitch =
      cleanTextSnippet(
        elem.fields?.oneLinePitch ||
          elem.fields?.description ||
          elem.fields?.corePremise ||
          elem.fields?.coreIdentity ||
          elem.fields?.summary ||
          elem.content
      ).slice(0, 160) || '';

    catalog.push({
      id: elem.id,
      title,
      type: rawType || 'Element',
      category,
      isScenario: false,
      isMap: lowerType === 'map',
      description: pitch,
      fields: elem.fields || {},
      raw: elem
    });
  }

  const combinedMaps = [...(universeMaps || []), ...(mapsCatalog || [])];
  for (const m of combinedMaps) {
    if (!m?.id || seenIds.has(m.id)) continue;
    seenIds.add(m.id);
    catalog.push({
      id: m.id,
      title: (m.title || m.name || 'Tactical Sector').trim(),
      type: 'Map',
      category: 'Location',
      isScenario: false,
      isMap: true,
      description: cleanTextSnippet(m.description || 'Tactical Sector Map').slice(0, 140),
      fields: m.fields || {},
      raw: m
    });
  }

  return { catalogAssets: catalog, scenariosFlat };
}

function makeUndirectedPairKey(a, b) {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

/**
 * Extracts all confirmed cross-asset connections:
 *   1. Manual links in universeState.assetLinks (editable, supports custom relationship + notes)
 *   2. Layer 3 AIME Asset Hub links (assetHub / linkedElements)
 *   3. Current story prose [[Wiki]] mentions
 *   4. Structured relational fields (parentWorld, linkedFaction, vipTarget, rivalTarget, mapId)
 */
export function extractConfirmedConnections({ catalogAssets = [], rawLinks = [], scenariosFlat = [] }) {
  const byId = new Map();
  const byLowerTitle = new Map();

  for (const asset of catalogAssets) {
    byId.set(asset.id, asset);
    const key = asset.title.toLowerCase();
    // Prefer non-duplicate canonical element or scenario
    if (!byLowerTitle.has(key)) {
      byLowerTitle.set(key, asset);
    }
  }

  const resolveRef = (val) => {
    if (!val || typeof val !== 'string') return null;
    const trimmed = val.trim();
    if (!trimmed) return null;
    if (byId.has(trimmed)) return byId.get(trimmed);
    return byLowerTitle.get(trimmed.toLowerCase()) || null;
  };

  const connections = [];
  const seenPairs = new Set();

  // 1. Explicit Manual Graph Links (highest priority; multiple distinct types between A & B allowed if manual)
  for (const link of rawLinks || []) {
    if (!link?.source || !link?.target || link.source === link.target) continue;
    if (!byId.has(link.source) || !byId.has(link.target)) continue;
    seenPairs.add(makeUndirectedPairKey(link.source, link.target));
    connections.push({
      id: link.id || `manual_${link.source}_${link.target}`,
      source: link.source,
      target: link.target,
      type: link.type || 'allied',
      note: link.note || '',
      origin: 'manual',
      isManual: true,
      createdAt: link.createdAt
    });
  }

  const addAutoLink = (sourceId, targetId, type, origin, note = '', extra = {}) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    if (!byId.has(sourceId) || !byId.has(targetId)) return;
    const pKey = makeUndirectedPairKey(sourceId, targetId);
    if (seenPairs.has(pKey)) return;
    seenPairs.add(pKey);
    connections.push({
      id: `auto_${origin}_${sourceId}_${targetId}`,
      source: sourceId,
      target: targetId,
      type,
      note,
      origin,
      isManual: false,
      ...extra
    });
  };

  // 2. AIME Layer 3 Asset Hub Links
  for (const asset of catalogAssets) {
    const rawHub = asset.raw?.assetHub || asset.raw?.linkedElements;
    if (!Array.isArray(rawHub) || rawHub.length === 0) continue;
    for (const entry of rawHub) {
      const targetId = typeof entry === 'string' ? entry : entry?.assetId || entry?.id;
      const resolved = resolveRef(targetId) || (entry?.assetTitle ? resolveRef(entry.assetTitle) : null);
      if (!resolved) continue;
      const annotation = typeof entry === 'object' ? (entry.annotation || '').trim() : '';
      const importance = typeof entry === 'object' ? entry.importance : undefined;
      addAutoLink(
        asset.id,
        resolved.id,
        'asset_hub',
        'asset_hub',
        annotation,
        { importance }
      );
    }
  }

  // 3. Story Prose [[Wiki]] Mentions (across scenarios of the active story project)
  const wikiRegex = /\[\[(?:Chapter:\s*)?([^\]]+)\]\]/gi;
  for (const sc of scenariosFlat || []) {
    if (!sc?.id || !byId.has(sc.id)) continue;
    const combinedText = [sc.content, sc.fields?.readAloud, sc.fields?.sceneBeats]
      .filter(Boolean)
      .join(' ');
    if (!combinedText) continue;

    wikiRegex.lastIndex = 0;
    let match;
    while ((match = wikiRegex.exec(combinedText)) !== null) {
      const target = resolveRef(match[1]);
      if (target && target.id !== sc.id) {
        addAutoLink(sc.id, target.id, 'mentioned', 'prose', `Mentioned as [[${target.title}]] in scenario`);
      }
    }
  }

  // 4. Explicit Relational Schema Fields
  for (const asset of catalogAssets) {
    const f = asset.fields || {};
    if (asset.raw?.mapId) {
      const mapTarget = resolveRef(asset.raw.mapId);
      if (mapTarget) addAutoLink(asset.id, mapTarget.id, 'sector_map', 'schema', 'Bound tactical sector map');
    }
    if (f.parentWorld) {
      const worldTarget = resolveRef(f.parentWorld);
      if (worldTarget) addAutoLink(asset.id, worldTarget.id, 'located_in', 'schema', `Parent World: ${worldTarget.title}`);
    }
    if (f.linkedFaction || f.dbmFactionRef) {
      const facTarget = resolveRef(f.linkedFaction || f.dbmFactionRef);
      if (facTarget) addAutoLink(asset.id, facTarget.id, 'member_of', 'schema', `Linked Faction: ${facTarget.title}`);
    }
    if (f.vipTarget) {
      const vip = resolveRef(f.vipTarget);
      if (vip) addAutoLink(asset.id, vip.id, 'allied', 'schema', 'Protected VIP / Tethered Ally');
    }
    if (f.rivalTarget) {
      const rival = resolveRef(f.rivalTarget);
      if (rival) addAutoLink(asset.id, rival.id, 'hostile', 'schema', 'Marked Rival / Priority Target');
    }
  }

  return connections;
}

const IGNORED_GENERIC_TITLES = new Set([
  'universe overview',
  'test overview',
  'new story module',
  'new story element',
  'new element',
  'untitled handout',
  'untitled element',
  'scene 1',
  'scene 2',
  'colony fleet',
  'worldships'
]);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scans structured worldbuilding fields for high-confidence cross-references
 * between catalog assets that are not yet connected, returning optional suggestions
 * the Architect can confirm with one click.
 */
export function discoverSmartLoreSuggestions({ catalogAssets = [], confirmedConnections = [] }) {
  const existingPairs = new Set(
    confirmedConnections.map((c) => makeUndirectedPairKey(c.source, c.target))
  );

  // Build candidate match targets with distinctive titles (>= 5 chars)
  const matchTargets = [];
  const seenLowerTitles = new Set();

  for (const asset of catalogAssets) {
    if (asset.isScenario) continue;
    // Strip parenthetical disambiguators like "Mekan (Mekan)" -> also check canonical title
    const baseTitle = asset.title.replace(/\s*\([^)]*\)\s*$/g, '').trim();
    const candidateName = baseTitle.length >= 5 ? baseTitle : asset.title.trim();
    const lower = candidateName.toLowerCase();

    if (candidateName.length < 5 || IGNORED_GENERIC_TITLES.has(lower)) continue;
    if (seenLowerTitles.has(lower)) continue;
    seenLowerTitles.add(lower);

    matchTargets.push({
      asset,
      matchName: candidateName,
      regex: new RegExp(`\\b${escapeRegExp(candidateName)}\\b`, 'i')
    });
  }

  const suggestions = [];
  const suggestedPairs = new Set();

  for (const source of catalogAssets) {
    const f = source.fields || {};
    const fieldProbes = [
      { label: 'Title Context', text: (source.title.match(/\(([^)]+)\)/) || [])[1] || '' },
      { label: 'Parent World / Homeworld', text: [f.parentWorld, f.habitatOrigin, f.homeworld, f.capital_world].filter(Boolean).join(' ') },
      { label: 'Factions & Territory', text: [f.majorFactions, f.territory, f.antagonist].filter(Boolean).join(' ') },
      { label: 'Relationships', text: [f.relationships, f.keyRelationships, f.locationFound].filter(Boolean).join(' ') },
      { label: 'Summary / Lore', text: [f.oneLinePitch, f.corePremise, f.coreIdentity, f.description].filter(Boolean).join(' ') }
    ];

    for (const targetEntry of matchTargets) {
      const target = targetEntry.asset;
      if (target.id === source.id) continue;

      const pKey = makeUndirectedPairKey(source.id, target.id);
      if (existingPairs.has(pKey) || suggestedPairs.has(pKey)) continue;

      // Avoid matching identical base names like duplicate catalog entries
      if (source.title.toLowerCase() === target.title.toLowerCase()) continue;

      let matchedFieldLabel = null;
      for (const probe of fieldProbes) {
        if (probe.text && targetEntry.regex.test(probe.text)) {
          matchedFieldLabel = probe.label;
          break;
        }
      }

      if (!matchedFieldLabel) continue;

      suggestedPairs.add(pKey);

      let inferredType = 'allied';
      if (target.category === 'Location') inferredType = 'located_in';
      else if (target.category === 'Faction') inferredType = 'member_of';
      else if (source.category === 'Faction' && target.category === 'Location') inferredType = 'custodian_of';

      suggestions.push({
        id: `suggest_${source.id}_${target.id}`,
        source: source.id,
        target: target.id,
        sourceAsset: source,
        targetAsset: target,
        type: inferredType,
        reason: `${matchedFieldLabel} references "${targetEntry.matchName}"`
      });

      if (suggestions.length >= 24) return suggestions;
    }
  }

  return suggestions;
}

/**
 * Filters the graph to strictly connection-first nodes (never dumping unconnected orphans).
 */
export function filterVisibleGraph({
  catalogAssets = [],
  confirmedConnections = [],
  scopeMode = 'connected', // 'connected' | 'focus'
  focusNodeId = null,
  hopDepth = 2,
  selectedCategory = 'All',
  searchQuery = '',
  pinnedNodeIds = []
}) {
  const byId = new Map(catalogAssets.map((a) => [a.id, a]));

  // Build adjacency list & degree map across all confirmed connections
  const adjacency = new Map();
  const totalDegreeMap = new Map();

  for (const conn of confirmedConnections) {
    if (!adjacency.has(conn.source)) adjacency.set(conn.source, new Set());
    if (!adjacency.has(conn.target)) adjacency.set(conn.target, new Set());
    adjacency.get(conn.source).add(conn.target);
    adjacency.get(conn.target).add(conn.source);

    totalDegreeMap.set(conn.source, (totalDegreeMap.get(conn.source) || 0) + 1);
    totalDegreeMap.set(conn.target, (totalDegreeMap.get(conn.target) || 0) + 1);
  }

  const candidateNodeIds = new Set();

  if (scopeMode === 'focus' && focusNodeId && byId.has(focusNodeId)) {
    // Ego-network BFS up to hopDepth around focusNodeId
    candidateNodeIds.add(focusNodeId);
    const queue = [{ id: focusNodeId, depth: 0 }];
    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (depth >= hopDepth) continue;
      const neighbors = adjacency.get(id);
      if (!neighbors) continue;
      for (const nId of neighbors) {
        if (!candidateNodeIds.has(nId)) {
          candidateNodeIds.add(nId);
          queue.push({ id: nId, depth: depth + 1 });
        }
      }
    }
  } else {
    // 'connected' mode: ONLY nodes participating in at least one connection
    for (const conn of confirmedConnections) {
      candidateNodeIds.add(conn.source);
      candidateNodeIds.add(conn.target);
    }
  }

  // Always include any node the user explicitly pinned onto the board to wire up
  for (const pinId of pinnedNodeIds || []) {
    if (byId.has(pinId)) candidateNodeIds.add(pinId);
  }

  // Filter by category / search while preserving 1-hop connected partners for context
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const hasFilter = selectedCategory !== 'All' || trimmedQuery.length > 0;

  let activeNodeIds = candidateNodeIds;
  const matchedPrimaryIds = new Set();

  if (hasFilter) {
    const filteredWithContext = new Set();
    for (const id of candidateNodeIds) {
      const node = byId.get(id);
      if (!node) continue;
      const catOk = selectedCategory === 'All' || node.category === selectedCategory;
      const searchOk =
        !trimmedQuery ||
        node.title.toLowerCase().includes(trimmedQuery) ||
        node.type.toLowerCase().includes(trimmedQuery) ||
        (node.description || '').toLowerCase().includes(trimmedQuery);

      if (catOk && searchOk) {
        matchedPrimaryIds.add(id);
        filteredWithContext.add(id);
        // Keep immediate 1-hop connected endpoints within candidate set so wires stay meaningful
        const neighbors = adjacency.get(id);
        if (neighbors) {
          for (const nId of neighbors) {
            if (candidateNodeIds.has(nId)) filteredWithContext.add(nId);
          }
        }
      }
    }
    activeNodeIds = filteredWithContext;
  }

  const visibleLinks = confirmedConnections.filter(
    (c) => activeNodeIds.has(c.source) && activeNodeIds.has(c.target)
  );

  // Compute parallel-edge index for multi-edges between the same pair
  const pairGroups = new Map();
  for (const link of visibleLinks) {
    const key = makeUndirectedPairKey(link.source, link.target);
    if (!pairGroups.has(key)) pairGroups.set(key, []);
    pairGroups.get(key).push(link);
  }

  const enrichedLinks = visibleLinks.map((link) => {
    const group = pairGroups.get(makeUndirectedPairKey(link.source, link.target)) || [link];
    const idx = group.indexOf(link);
    const curveOffset = group.length === 1 ? 0 : (idx - (group.length - 1) / 2) * 44;
    return {
      ...link,
      curveOffset
    };
  });

  const visibleNodes = [];
  for (const id of activeNodeIds) {
    const asset = byId.get(id);
    if (!asset) continue;
    visibleNodes.push({
      ...asset,
      degree: totalDegreeMap.get(id) || 0,
      isDimmed: hasFilter && !matchedPrimaryIds.has(id)
    });
  }

  return {
    visibleNodes,
    visibleLinks: enrichedLinks,
    totalDegreeMap
  };
}

/**
 * Computes an intelligent multi-island hub-and-spoke layout with non-overlap relaxation.
 * Honors saved manual positions when provided.
 */
export function computeIntelligentAssetLayout({
  nodes = [],
  links = [],
  focalNodeId = null,
  savedPositions = {}
}) {
  const positions = {};
  if (nodes.length === 0) return positions;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adj = new Map(nodes.map((n) => [n.id, []]));

  for (const l of links) {
    if (adj.has(l.source) && adj.has(l.target)) {
      adj.get(l.source).push(l.target);
      adj.get(l.target).push(l.source);
    }
  }

  // 1. Identify connected components
  const visited = new Set();
  const components = [];

  for (const node of nodes) {
    if (visited.has(node.id)) continue;
    const comp = [];
    const q = [node.id];
    visited.add(node.id);
    while (q.length > 0) {
      const curr = q.shift();
      comp.push(curr);
      for (const nxt of adj.get(curr) || []) {
        if (!visited.has(nxt)) {
          visited.add(nxt);
          q.push(nxt);
        }
      }
    }
    components.push(comp);
  }

  // Sort components: focal component first, then largest components first
  components.sort((a, b) => {
    const aFocal = focalNodeId && a.includes(focalNodeId) ? 1 : 0;
    const bFocal = focalNodeId && b.includes(focalNodeId) ? 1 : 0;
    if (aFocal !== bFocal) return bFocal - aFocal;
    return b.length - a.length;
  });

  const categoryOrder = { Scenario: 0, Persona: 1, Faction: 2, Location: 3, Item: 4, Lore: 5 };

  // Layout each component in local coordinates around (0, 0)
  const laidOutIslands = components.map((compIds) => {
    const localPos = {};

    if (compIds.length === 1) {
      localPos[compIds[0]] = { x: 0, y: 0 };
      return { ids: compIds, localPos };
    }

    if (compIds.length === 2) {
      localPos[compIds[0]] = { x: -200, y: 0 };
      localPos[compIds[1]] = { x: 200, y: 0 };
      return { ids: compIds, localPos };
    }

    // Pick Hub: focalNodeId if inside this component, else scenario node, else highest-degree node
    let hubId = compIds[0];
    if (focalNodeId && compIds.includes(focalNodeId)) {
      hubId = focalNodeId;
    } else {
      let bestScore = -1;
      for (const id of compIds) {
        const deg = (adj.get(id) || []).length;
        const bonus = nodeMap.get(id)?.isScenario ? 2.5 : 0;
        if (deg + bonus > bestScore) {
          bestScore = deg + bonus;
          hubId = id;
        }
      }
    }

    // BFS layers from hubId
    const depthMap = new Map([[hubId, 0]]);
    const parentMap = new Map();
    const layers = [[hubId]];
    const q = [hubId];

    while (q.length > 0) {
      const curr = q.shift();
      const d = depthMap.get(curr);
      for (const nxt of adj.get(curr) || []) {
        if (!depthMap.has(nxt)) {
          depthMap.set(nxt, d + 1);
          parentMap.set(nxt, curr);
          if (!layers[d + 1]) layers[d + 1] = [];
          layers[d + 1].push(nxt);
          q.push(nxt);
        }
      }
    }

    localPos[hubId] = { x: 0, y: 0 };
    const angleMap = new Map([[hubId, 0]]);

    // Ring 1 around hub sorted by category so similar assets cluster cleanly
    const ring1 = (layers[1] || []).slice().sort((a, b) => {
      const ca = categoryOrder[nodeMap.get(a)?.category] ?? 9;
      const cb = categoryOrder[nodeMap.get(b)?.category] ?? 9;
      return ca - cb;
    });

    const r1Radius = Math.max(270, ring1.length * 64);
    ring1.forEach((id, idx) => {
      const angle = -Math.PI / 2 + (idx / Math.max(1, ring1.length)) * Math.PI * 2;
      angleMap.set(id, angle);
      localPos[id] = {
        x: Math.round(Math.cos(angle) * r1Radius),
        y: Math.round(Math.sin(angle) * r1Radius * 0.84)
      };
    });

    // Outer rings fan out from parent angle
    for (let d = 2; d < layers.length; d++) {
      const layerIds = layers[d] || [];
      const radius = r1Radius + (d - 1) * 255;

      // Group by parent to fan siblings cleanly
      const byParent = new Map();
      for (const id of layerIds) {
        const p = parentMap.get(id) || hubId;
        if (!byParent.has(p)) byParent.set(p, []);
        byParent.get(p).push(id);
      }

      for (const [pId, children] of byParent.entries()) {
        const baseAngle = angleMap.get(pId) ?? 0;
        const spread = Math.min(Math.PI * 0.45, Math.max(0.28, children.length * 0.24));
        children.forEach((cid, idx) => {
          const offset =
            children.length === 1
              ? 0
              : (idx / (children.length - 1) - 0.5) * spread;
          const angle = baseAngle + offset;
          angleMap.set(cid, angle);
          localPos[cid] = {
            x: Math.round(Math.cos(angle) * radius),
            y: Math.round(Math.sin(angle) * radius * 0.86)
          };
        });
      }
    }

    // Local bounding-box overlap repulsion pass
    const minDX = CARD_WIDTH + 44;
    const minDY = CARD_HEIGHT + 40;
    for (let iter = 0; iter < 32; iter++) {
      let moved = false;
      for (let i = 0; i < compIds.length; i++) {
        for (let j = i + 1; j < compIds.length; j++) {
          const idA = compIds[i];
          const idB = compIds[j];
          const pA = localPos[idA];
          const pB = localPos[idB];
          const dx = pB.x - pA.x;
          const dy = pB.y - pA.y;
          const overlapX = minDX - Math.abs(dx);
          const overlapY = minDY - Math.abs(dy);

          if (overlapX > 0 && overlapY > 0) {
            moved = true;
            if (overlapX < overlapY) {
              const push = (overlapX / 2 + 2) * (dx >= 0 ? 1 : -1);
              if (idA !== hubId) pA.x -= push;
              if (idB !== hubId) pB.x += push;
            } else {
              const push = (overlapY / 2 + 2) * (dy >= 0 ? 1 : -1);
              if (idA !== hubId) pA.y -= push;
              if (idB !== hubId) pB.y += push;
            }
          }
        }
      }
      if (!moved) break;
    }

    return { ids: compIds, localPos };
  });

  // 2. Pack multiple islands cleanly in rows
  const MAX_ROW_WIDTH = 1500;
  const ISLAND_GUTTER_X = 180;
  const ISLAND_GUTTER_Y = 150;

  let cursorX = 0;
  let cursorY = 0;
  let currentRowHeight = 0;

  for (const island of laidOutIslands) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const id of island.ids) {
      const p = island.localPos[id];
      minX = Math.min(minX, p.x - CARD_WIDTH / 2);
      maxX = Math.max(maxX, p.x + CARD_WIDTH / 2);
      minY = Math.min(minY, p.y - CARD_HEIGHT / 2);
      maxY = Math.max(maxY, p.y + CARD_HEIGHT / 2);
    }

    const width = maxX - minX;
    const height = maxY - minY;

    if (cursorX > 0 && cursorX + width > MAX_ROW_WIDTH) {
      cursorX = 0;
      cursorY += currentRowHeight + ISLAND_GUTTER_Y;
      currentRowHeight = 0;
    }

    const shiftX = cursorX - minX + 120;
    const shiftY = cursorY - minY + 120;

    for (const id of island.ids) {
      if (savedPositions && savedPositions[id] && typeof savedPositions[id].x === 'number') {
        positions[id] = { x: savedPositions[id].x, y: savedPositions[id].y };
      } else {
        positions[id] = {
          x: Math.round(island.localPos[id].x + shiftX),
          y: Math.round(island.localPos[id].y + shiftY)
        };
      }
    }

    cursorX += width + ISLAND_GUTTER_X;
    currentRowHeight = Math.max(currentRowHeight, height);
  }

  return positions;
}

/**
 * Computes bounding box around positioned Asset Cards for Fit-to-View.
 */
export function computeAssetGraphBounds(nodes = [], positions = {}, padding = 90) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, width: 800, height: 500, centerX: 400, centerY: 250 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    const p = positions[n.id];
    if (!p) continue;
    minX = Math.min(minX, p.x - CARD_WIDTH / 2);
    maxX = Math.max(maxX, p.x + CARD_WIDTH / 2);
    minY = Math.min(minY, p.y - CARD_HEIGHT / 2);
    maxY = Math.max(maxY, p.y + CARD_HEIGHT / 2);
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, width: 800, height: 500, centerX: 400, centerY: 250 };
  }

  const width = Math.max(480, maxX - minX + padding * 2);
  const height = Math.max(340, maxY - minY + padding * 2);

  return {
    minX: minX - padding,
    minY: minY - padding,
    width,
    height,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}
