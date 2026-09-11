/**
 * @file cronicleService.js
 * @description CRONICLE State Management & Scratchpad Service for AIME.
 * Implements the architecture defined in docs/- AIME Scratchpad Integration.md:
 * 1. Evolutionary Lore data model (Personas, World Anvil Locations, Story Weaver Timeline, Working Memory)
 * 2. The Working Copy Protocol (Source Element Preservation via story prefixing)
 * 3. Deterministic State Transition Engine: S(t+1) = E(S_t)
 * 4. 3-Tier Context Injection Pipeline with Guidance Gem translation & token budgeting
 * 5. Asynchronous NLP State Delta Extraction via Gemini Flash
 * 6. Human-as-Sculptor oversight protocol (staged pending deltas)
 */

/**
 * Attempts to fetch content from Google Generative AI API with automatic model fallbacks
 */
const GEMINI_FLASH_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest'
];

export async function callGeminiApi(apiKey, requestBody) {
  if (!apiKey) {
    throw new Error('No Gemini API key available.');
  }

  let lastError = null;
  for (const model of GEMINI_FLASH_MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (response.ok) {
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
      const errorMsg = data?.error?.message || `HTTP ${response.status}`;
      if (response.status === 400 || response.status === 403) {
        throw new Error(`Gemini API Key Error (${response.status}): ${errorMsg}`);
      }
      lastError = new Error(errorMsg);
    } catch (err) {
      lastError = err;
      if (err.message && err.message.includes('Gemini API Key Error')) throw err;
    }
  }
  throw lastError || new Error('Failed to reach Gemini API.');
}

/**
 * Sanitizes a string to serve as a clean identifier prefix
 */
export function sanitizePrefix(name) {
  if (!name) return 'story';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Creates a blank, fully structured CRONICLE state container
 */
export function createDefaultCronicleState(projectName = 'Tangent Story') {
  const prefix = sanitizePrefix(projectName);
  return {
    version: 1,
    storyPrefix: prefix,
    updatedAt: new Date().toISOString(),
    workingMemory: {
      activeLocationId: null,
      activePersonaIds: [],
      immediateObjective: 'Establish perimeter and assess primary threat.',
      unresolvedConflicts: 'Tension between rival factions; pending telemetry breach.',
      ephemeralNotes: ''
    },
    personas: {},
    locations: {},
    timeline: [],
    workingCopies: {},
    pendingDeltas: []
  };
}

/**
 * Working Copy Protocol: Clones a source element into a story-prefixed Working Copy.
 * Preserves the original source element in the compendium/catalog while binding the
 * mutable copy to the active narrative.
 */
export function cloneToWorkingCopy(element, storyName = 'story') {
  if (!element || !element.id) return null;
  const prefix = sanitizePrefix(storyName);
  const cleanSourceId = element.id.replace(/^(elem_|persona_|loc_|item_)/, '');
  const workingCopyId = `${prefix}_${cleanSourceId}`;

  const fields = element.fields || {};
  const baseType = (element.type || 'Custom').toLowerCase();

  const workingCopy = {
    id: workingCopyId,
    sourceElementId: element.id,
    storyPrefix: prefix,
    clonedAt: new Date().toISOString(),
    title: element.title || element.name || 'Untitled Working Copy',
    type: element.type || 'Persona',
    fields: { ...fields }
  };

  if (baseType.includes('persona') || baseType.includes('character') || baseType.includes('npc')) {
    workingCopy.personaState = {
      id: workingCopyId,
      name: element.title || element.name || 'Unknown Entity',
      role: fields.role || fields['char-archetype'] || 'Operative',
      current_status: 'active',
      base_physical_stats: {
        str: Number(fields.Strength || fields.STR || 2),
        dex: Number(fields.Agility || fields.DEX || 2),
        int: Number(fields.Intellect || fields.INT || 2),
        hp: Number(fields.hp || 30),
        maxHp: Number(fields.maxHp || 30)
      },
      active_inventory: Array.isArray(fields.inventory) ? [...fields.inventory] : (fields.equipment ? [fields.equipment] : []),
      relationship_matrix: { ...(fields.relationships || {}) },
      dynamic_psychological_traits: Array.isArray(fields.psychological_traits) ? [...fields.psychological_traits] : [],
      acquired_physical_traits: Array.isArray(fields.physical_traits) ? [...fields.physical_traits] : []
    };
  } else if (baseType.includes('location') || baseType.includes('world') || baseType.includes('scene')) {
    workingCopy.locationState = {
      id: workingCopyId,
      name: element.title || element.name || 'Unknown Sector',
      current_geospatial_state: fields.geospatial_state || 'thriving',
      economic_modifiers: Array.isArray(fields.economic_modifiers) ? [...fields.economic_modifiers] : [],
      environmental_hazards: Array.isArray(fields.environmental_hazards) ? [...fields.environmental_hazards] : (fields.hazards ? [fields.hazards] : []),
      occupant_lists: Array.isArray(fields.occupants) ? [...fields.occupants] : [],
      faction_control: fields.faction_control || fields.faction || 'Neutral / Unclaimed'
    };
  }

  return workingCopy;
}

/**
 * Deterministic State Transition Engine: S(t+1) = E(S_t)
 * Applies a single delta event to mutate the CRONICLE state predictably.
 */
export function applyCronicleDelta(currentCronicle, delta) {
  if (!currentCronicle) return currentCronicle;
  if (!delta || !delta.action) return currentCronicle;

  const nextState = {
    ...currentCronicle,
    personas: { ...currentCronicle.personas },
    locations: { ...currentCronicle.locations },
    timeline: [...(currentCronicle.timeline || [])],
    workingMemory: { ...(currentCronicle.workingMemory || {}) },
    pendingDeltas: (currentCronicle.pendingDeltas || []).filter(d => d.id !== delta.id),
    updatedAt: new Date().toISOString()
  };

  const { entityId, action, target, value } = delta;

  switch (action) {
    // ── PERSONA STATE MUTATIONS ──
    case 'update_status': {
      if (entityId && nextState.personas[entityId]) {
        nextState.personas[entityId] = {
          ...nextState.personas[entityId],
          current_status: String(value || target || 'active').toLowerCase()
        };
      }
      break;
    }

    case 'add_trait': {
      if (entityId && nextState.personas[entityId]) {
        const p = nextState.personas[entityId];
        const traitType = (target === 'physical' || target === 'injury') ? 'acquired_physical_traits' : 'dynamic_psychological_traits';
        const existing = p[traitType] || [];
        const traitValue = String(value || '').trim();
        if (traitValue && !existing.includes(traitValue)) {
          nextState.personas[entityId] = {
            ...p,
            [traitType]: [...existing, traitValue]
          };
        }
      }
      break;
    }

    case 'remove_trait': {
      if (entityId && nextState.personas[entityId]) {
        const p = nextState.personas[entityId];
        const traitType = (target === 'physical' || target === 'injury') ? 'acquired_physical_traits' : 'dynamic_psychological_traits';
        const existing = p[traitType] || [];
        const traitValue = String(value || '').trim();
        nextState.personas[entityId] = {
          ...p,
          [traitType]: existing.filter(t => t.toLowerCase() !== traitValue.toLowerCase())
        };
      }
      break;
    }

    case 'add_item': {
      if (entityId && nextState.personas[entityId]) {
        const p = nextState.personas[entityId];
        const inv = p.active_inventory || [];
        const itemVal = String(value || target || '').trim();
        if (itemVal && !inv.includes(itemVal)) {
          nextState.personas[entityId] = {
            ...p,
            active_inventory: [...inv, itemVal]
          };
        }
      }
      break;
    }

    case 'remove_item': {
      if (entityId && nextState.personas[entityId]) {
        const p = nextState.personas[entityId];
        const inv = p.active_inventory || [];
        const itemVal = String(value || target || '').trim();
        nextState.personas[entityId] = {
          ...p,
          active_inventory: inv.filter(i => i.toLowerCase() !== itemVal.toLowerCase())
        };
      }
      break;
    }

    case 'update_relationship': {
      if (entityId && nextState.personas[entityId] && target) {
        const p = nextState.personas[entityId];
        const currentMatrix = p.relationship_matrix || {};
        const currentVal = Number(currentMatrix[target] ?? 0);
        let newVal = currentVal;
        if (typeof value === 'number') {
          newVal = Math.max(-100, Math.min(100, currentVal + value));
        } else if (typeof value === 'string' && !isNaN(Number(value))) {
          newVal = Math.max(-100, Math.min(100, currentVal + Number(value)));
        }
        nextState.personas[entityId] = {
          ...p,
          relationship_matrix: {
            ...currentMatrix,
            [target]: newVal
          }
        };
      }
      break;
    }

    // ── WORLD ANVIL LOCATION MUTATIONS ──
    case 'update_location_state': {
      if (entityId && nextState.locations[entityId]) {
        const loc = nextState.locations[entityId];
        const validStates = ['thriving', 'under_siege', 'ruined', 'rebuilding'];
        const stateVal = String(value || target || '').toLowerCase();
        if (validStates.includes(stateVal)) {
          nextState.locations[entityId] = {
            ...loc,
            current_geospatial_state: stateVal
          };
        }
      }
      break;
    }

    case 'add_hazard': {
      if (entityId && nextState.locations[entityId]) {
        const loc = nextState.locations[entityId];
        const hazards = loc.environmental_hazards || [];
        const hazardVal = String(value || target || '').trim();
        if (hazardVal && !hazards.includes(hazardVal)) {
          nextState.locations[entityId] = {
            ...loc,
            environmental_hazards: [...hazards, hazardVal]
          };
        }
      }
      break;
    }

    case 'remove_hazard': {
      if (entityId && nextState.locations[entityId]) {
        const loc = nextState.locations[entityId];
        const hazards = loc.environmental_hazards || [];
        const hazardVal = String(value || target || '').trim();
        nextState.locations[entityId] = {
          ...loc,
          environmental_hazards: hazards.filter(h => h.toLowerCase() !== hazardVal.toLowerCase())
        };
      }
      break;
    }

    case 'set_occupants': {
      if (entityId && nextState.locations[entityId]) {
        const loc = nextState.locations[entityId];
        const occupantList = Array.isArray(value) ? value : (Array.isArray(target) ? target : [value || target].filter(Boolean));
        nextState.locations[entityId] = {
          ...loc,
          occupant_lists: occupantList
        };
      }
      break;
    }

    // ── STORY WEAVER TIMELINE MUTATIONS ──
    case 'add_timeline_event': {
      const newEvent = {
        id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        sceneTitle: delta.sceneTitle || target || 'Episodic Milestone',
        summary: String(value || delta.explanation || 'Consequential milestone logged.'),
        involved_entities: Array.isArray(delta.involved_entities) ? delta.involved_entities : (entityId ? [entityId] : []),
        consequences: delta.consequences || ''
      };
      nextState.timeline.push(newEvent);
      break;
    }

    // ── WORKING MEMORY / SCENE SCRATCHPAD MUTATIONS ──
    case 'update_working_memory': {
      nextState.workingMemory = {
        ...nextState.workingMemory,
        ...(typeof value === 'object' ? value : { immediateObjective: String(value || '') })
      };
      break;
    }

    default:
      console.warn(`[CronicleService] Unknown delta action: "${action}"`);
  }

  return nextState;
}

/**
 * Applies a batch of deltas in sequence
 */
export function applyBatchDeltas(cronicleState, deltas = []) {
  return deltas.reduce((state, delta) => applyCronicleDelta(state, delta), cronicleState);
}

/**
 * 3-Tier Context Injection Pipeline
 * Translates rigid CRONICLE state into natural-language "Guidance Gems" and Content Restraints
 * with mathematical token budgeting.
 *
 * Tier 1 (Mandatory - 50% budget):
 *   - Active location & current environmental hazards
 *   - Active personas: current physical status, active injuries, equipped gear
 *   - Immediate quest objective
 * Tier 2 (Relevant - 30% budget):
 *   - Relational matrices between currently present characters
 *   - Up to 3 most recent chronological timeline events from Story Weaver
 * Tier 3 (Flavor - 20% budget):
 *   - Broader world state, economic modifiers, distant history summary
 */
export function formatCronicleContextForAIME(cronicle, options = {}) {
  if (!cronicle) return '';

  const { workingMemory, personas = {}, locations = {}, timeline = [] } = cronicle;
  if (!workingMemory) return '';

  const activeLocId = workingMemory.activeLocationId;
  const activePersonaIds = workingMemory.activePersonaIds || [];
  const activeLocation = activeLocId ? locations[activeLocId] : null;
  const activePersonas = activePersonaIds.map(id => personas[id]).filter(Boolean);

  const sections = [];

  // ══════════════════════════════════════════════════════════════════
  // TIER 1: MANDATORY REALITY CONSTRAINTS (50% Token Allocation)
  // ══════════════════════════════════════════════════════════════════
  const tier1Lines = [
    '=== [CRONICLE TIER 1: MANDATORY NARRATIVE CONSTRAINTS] ===',
    `IMMEDIATE OBJECTIVE: "${workingMemory.immediateObjective || 'Engage narrative context.'}"`
  ];

  if (activeLocation) {
    tier1Lines.push(`ACTIVE LOCATION: "${activeLocation.name}" [State: ${activeLocation.current_geospatial_state.toUpperCase()}]`);
    if (activeLocation.environmental_hazards && activeLocation.environmental_hazards.length > 0) {
      tier1Lines.push(`CRITICAL ENVIRONMENTAL HAZARDS: ${activeLocation.environmental_hazards.join(', ')} (Must manifest physically in prose)`);
    }
    if (activeLocation.faction_control) {
      tier1Lines.push(`LOCAL FACTION SOVEREIGNTY: ${activeLocation.faction_control}`);
    }
  }

  if (activePersonas.length > 0) {
    tier1Lines.push('ACTIVE ENTITIES PRESENT:');
    activePersonas.forEach(p => {
      const statusAlert = p.current_status !== 'active' ? ` [CRITICAL STATUS: ${p.current_status.toUpperCase()}]` : '';
      const injuries = p.acquired_physical_traits && p.acquired_physical_traits.length > 0
        ? ` | Physical Injuries/Conditions: [${p.acquired_physical_traits.join(', ')}]`
        : '';
      const psych = p.dynamic_psychological_traits && p.dynamic_psychological_traits.length > 0
        ? ` | Psychological State: [${p.dynamic_psychological_traits.join(', ')}]`
        : '';
      const gear = p.active_inventory && p.active_inventory.length > 0
        ? ` | Carried Items: [${p.active_inventory.join(', ')}]`
        : '';
      tier1Lines.push(`  * ${p.name} (${p.role})${statusAlert}${injuries}${psych}${gear}`);
    });
  }

  if (workingMemory.unresolvedConflicts) {
    tier1Lines.push(`UNRESOLVED IMMEDIATE CONFLICTS: ${workingMemory.unresolvedConflicts}`);
  }

  sections.push(tier1Lines.join('\n'));

  // ══════════════════════════════════════════════════════════════════
  // TIER 2: RELEVANT DYNAMICS & RECENT CAUSALITY (30% Token Allocation)
  // ══════════════════════════════════════════════════════════════════
  const tier2Lines = ['=== [CRONICLE TIER 2: RELATIONAL DYNAMICS & EPISODIC CAUSALITY] ==='];

  // Inter-entity relationship matrices
  if (activePersonas.length > 1) {
    const relLines = [];
    for (let i = 0; i < activePersonas.length; i++) {
      for (let j = 0; j < activePersonas.length; j++) {
        if (i === j) continue;
        const p1 = activePersonas[i];
        const p2 = activePersonas[j];
        const score = p1.relationship_matrix ? p1.relationship_matrix[p2.id] : undefined;
        if (score !== undefined) {
          const disposition = score <= -50 ? 'Lethal Hostility' : score < 0 ? 'Suspicion/Friction' : score >= 50 ? 'Deep Loyalty' : 'Cautious Alliance';
          relLines.push(`  * ${p1.name} -> ${p2.name}: Affinity ${score > 0 ? '+' : ''}${score} (${disposition})`);
        }
      }
    }
    if (relLines.length > 0) {
      tier2Lines.push('INTER-CHARACTER DISPOSITION MATRIX:\n' + relLines.join('\n'));
    }
  }

  // Recent Story Weaver timeline events (last 3)
  if (timeline && timeline.length > 0) {
    const recentEvents = timeline.slice(-3);
    tier2Lines.push('RECENT ESTABLISHED CHRONOLOGICAL ANTECEDENTS:');
    recentEvents.forEach(evt => {
      tier2Lines.push(`  - [${evt.sceneTitle}]: ${evt.summary}`);
    });
  }

  if (tier2Lines.length > 1) {
    sections.push(tier2Lines.join('\n'));
  }

  // ══════════════════════════════════════════════════════════════════
  // TIER 3: WORLD CONTEXT & ATMOSPHERE (20% Token Allocation)
  // ══════════════════════════════════════════════════════════════════
  const tier3Lines = ['=== [CRONICLE TIER 3: MACRO WORLD CONTEXT] ==='];
  if (activeLocation?.economic_modifiers && activeLocation.economic_modifiers.length > 0) {
    tier3Lines.push(`Economic Climate: ${activeLocation.economic_modifiers.join(', ')}`);
  }
  if (timeline.length > 3) {
    const olderEventsCount = timeline.length - 3;
    tier3Lines.push(`Historical Antecedents: ${olderEventsCount} earlier milestone(s) documented in campaign archive.`);
  }

  if (tier3Lines.length > 1) {
    sections.push(tier3Lines.join('\n'));
  }

  return sections.join('\n\n');
}

/**
 * Natural Language Processing (NLP) State Delta Extractor
 * Uses Gemini Flash as a deterministic logic parser to map generated/accepted prose
 * against the current CRONICLE state and extract structured JSON delta events.
 */
export async function extractNarrativeDeltas({
  prose,
  cronicle,
  apiKey = '',
  model = 'gemini-3.6-flash'
}) {
  if (!prose || !prose.trim()) return [];

  const knownPersonas = Object.values(cronicle?.personas || {}).map(p => ({
    id: p.id,
    name: p.name,
    status: p.current_status,
    traits: [...(p.acquired_physical_traits || []), ...(p.dynamic_psychological_traits || [])],
    inventory: p.active_inventory || []
  }));

  const knownLocations = Object.values(cronicle?.locations || {}).map(l => ({
    id: l.id,
    name: l.name,
    state: l.current_geospatial_state,
    hazards: l.environmental_hazards || []
  }));

  const extractionPrompt = `You are the CRONICLE State Delta Logic Parser for the Tangent SF RP Pair-Author RPG Engine.
Your SOLE task is to analyze the provided narrative prose against the established state baseline, and mathematically extract concrete state transitions (Delta Events).

Baseline Entities:
Personas: ${JSON.stringify(knownPersonas)}
Locations: ${JSON.stringify(knownLocations)}

Narrative Prose to Analyze:
"""
${prose.trim()}
"""

INSTRUCTIONS:
1. Identify all concrete changes:
   - Persona physical injury or trait acquired/healed ('add_trait' / 'remove_trait' with target: 'physical')
   - Psychological shift like paranoia, grief, trauma ('add_trait' / 'remove_trait' with target: 'psychological')
   - Items gained, discarded, or transferred ('add_item' / 'remove_item')
   - Vital status changes: active, injured, unconscious, deceased ('update_status')
   - Relationship changes: shifts in trust or hostility (-100 to +100 delta) ('update_relationship')
   - Location state changes: thriving, under_siege, ruined, rebuilding ('update_location_state')
   - Environmental hazards introduced or dispelled ('add_hazard' / 'remove_hazard')
   - Significant narrative milestone reached ('add_timeline_event')
2. Output STRICTLY a JSON array of DeltaEvent objects. No markdown explanations outside the JSON.

JSON Schema format:
[
  {
    "entityId": "string (entity ID or name)",
    "action": "update_status" | "add_trait" | "remove_trait" | "add_item" | "remove_item" | "update_relationship" | "update_location_state" | "add_hazard" | "remove_hazard" | "add_timeline_event",
    "target": "string (trait category, target entity, or item name)",
    "value": "string or number (trait name, new status, or affinity score)",
    "explanation": "concise 1-sentence explanation of why this delta was deduced"
  }
]

If no state transitions occurred, return an empty array: []`;

  try {
    const requestBody = {
      systemInstruction: {
        parts: [{ text: "You are a deterministic entity and state delta parser. Respond ONLY in valid JSON." }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: extractionPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const responseText = await callGeminiApi(apiKey, requestBody);
    if (!responseText) return [];

    const cleanJson = responseText
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim();

    const parsed = JSON.parse(cleanJson);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item, idx) => ({
      id: `delta_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      entityId: item.entityId || 'general',
      action: item.action,
      target: item.target || '',
      value: item.value || '',
      explanation: item.explanation || 'Extracted from recent narrative prose.'
    }));
  } catch (err) {
    console.warn('[CronicleService] State delta extraction fallback triggered:', err.message);
    return [];
  }
}

/**
 * Exports the entire CRONICLE as clean Markdown
 */
export function exportCronicleToMarkdown(cronicle) {
  if (!cronicle) return '# CRONICLE: Empty';

  const { projectName = 'Tangent Universe', storyPrefix, workingMemory, personas = {}, locations = {}, timeline = [] } = cronicle;

  let md = `# CRONICLE: SINGLE SOURCE OF TRUTH\n`;
  md += `**Project:** ${projectName} | **Story Prefix:** \`${storyPrefix}\` | **Updated:** ${cronicle.updatedAt || new Date().toISOString()}\n\n`;

  md += `## 🧠 Working Memory & Active Scene\n`;
  md += `- **Active Location ID:** \`${workingMemory?.activeLocationId || 'None'}\`\n`;
  md += `- **Active Personas:** ${workingMemory?.activePersonaIds?.length ? workingMemory.activePersonaIds.map(id => `\`${id}\``).join(', ') : 'None'}\n`;
  md += `- **Immediate Objective:** ${workingMemory?.immediateObjective || 'None'}\n`;
  md += `- **Unresolved Conflicts:** ${workingMemory?.unresolvedConflicts || 'None'}\n\n`;

  md += `## 👤 Persona Matrix (${Object.keys(personas).length})\n`;
  if (Object.keys(personas).length === 0) {
    md += `*No personas registered in active chronicle.*\n\n`;
  } else {
    Object.values(personas).forEach(p => {
      md += `### ${p.name} (\`${p.id}\`)\n`;
      md += `- **Role:** ${p.role || 'Operative'} | **Status:** \`${p.current_status || 'active'}\`\n`;
      md += `- **Inventory:** ${p.active_inventory?.length ? p.active_inventory.join(', ') : 'None'}\n`;
      md += `- **Physical Traits / Wounds:** ${p.acquired_physical_traits?.length ? p.acquired_physical_traits.join(', ') : 'None'}\n`;
      md += `- **Psychological Traits:** ${p.dynamic_psychological_traits?.length ? p.dynamic_psychological_traits.join(', ') : 'None'}\n`;
      if (p.relationship_matrix && Object.keys(p.relationship_matrix).length > 0) {
        md += `- **Relationships:** ${Object.entries(p.relationship_matrix).map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`).join(', ')}\n`;
      }
      md += `\n`;
    });
  }

  md += `## 🌍 World Anvil & Locations (${Object.keys(locations).length})\n`;
  if (Object.keys(locations).length === 0) {
    md += `*No locations registered in active chronicle.*\n\n`;
  } else {
    Object.values(locations).forEach(l => {
      md += `### ${l.name} (\`${l.id}\`)\n`;
      md += `- **Geospatial State:** \`${l.current_geospatial_state || 'thriving'}\`\n`;
      md += `- **Faction Sovereignty:** ${l.faction_control || 'Neutral'}\n`;
      md += `- **Environmental Hazards:** ${l.environmental_hazards?.length ? l.environmental_hazards.join(', ') : 'None'}\n`;
      md += `- **Current Occupants:** ${l.occupant_lists?.length ? l.occupant_lists.join(', ') : 'None'}\n\n`;
    });
  }

  md += `## 📜 Story Weaver Timeline (${timeline.length} Milestones)\n`;
  if (timeline.length === 0) {
    md += `*Timeline ledger is empty.*\n`;
  } else {
    timeline.forEach((evt, idx) => {
      md += `### ${idx + 1}. ${evt.sceneTitle} (${new Date(evt.timestamp).toLocaleDateString()})\n`;
      md += `${evt.summary}\n`;
      if (evt.involved_entities?.length) {
        md += `- **Entities Involved:** ${evt.involved_entities.join(', ')}\n`;
      }
      md += `\n`;
    });
  }

  return md;
}
