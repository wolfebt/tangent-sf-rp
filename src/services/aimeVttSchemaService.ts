/**
 * @file aimeVttSchemaService.ts
 * @description RAG-augmented generation of canonical .persona and .scene schemas for the VTT.
 * Integrates Omnicortex rules retrieval with Gemini API structured JSON generation,
 * translating user creative mandates into ready-to-deploy Stage tokens and maps.
 */

import { getGeminiApiKey, fetchGeminiContent } from './bastionService.js';
import { queryOmnicortexRAG, formatRagContextForAIME } from './omnicortexVectorRag.ts';
import type { StaticEntity } from '../engine/state/VolatileSharder.ts';

// ── SCHEMA DEFINITIONS ──

export interface AimePersonaSchema {
  id: string;
  type: 'Persona';
  name: string;
  archetype: string;
  oneLinePitch: string;
  physicalDescription: string;
  personalityMannerisms: string;
  backgroundHistory: string;
  goalsMotivations: string;
  strengthsFlaws: string;
  roleInStory: string;
  relationships: string;
  
  // Tactical MCM & Mechanics
  mcmTier: number;
  mcmDesignation: 'Adversary' | 'Ally' | 'Companion' | 'Neutral';
  mcmChassis: 'Combatant' | 'Specialist' | 'Socialite' | 'Balanced';
  mcmRole: 'Bruiser' | 'Commando' | 'Sniper' | 'Guardian' | 'Slicer' | 'Medic' | 'Boss';
  
  // Vitals & Attributes
  health: number;
  vitality: number;
  structure?: number;
  karma: number;
  techLevel: number;
  magicLevel: number;
  armorDr: number;
  speedFt: number;
  
  attacks: Array<{
    name: string;
    damageFormula: string;
    rangeFt: number;
    type: string;
  }>;
  gear: string[];
  features: string[];
}

export interface AimeSceneSchema {
  id: string;
  type: 'Scene';
  sceneName: string;
  location: string;
  sensoryDetails: string;
  moodAtmosphere: string;
  keyObjects: string;
  sceneBeats: string[];
  readAloud: string;
  
  // Tactical Stage Map Specifications
  suggestedLighting: {
    ambientColor: string;
    darkness: number;
    lights: Array<{
      x: number;
      y: number;
      color: string;
      radius: number;
    }>;
  };
  suggestedObjects: Array<{
    id: string;
    name: string;
    type: 'bulkhead' | 'terminal' | 'loot_container' | 'cover';
    x: number;
    y: number;
  }>;
  suggestedTokens: Array<{
    id: string;
    name: string;
    archetype: string;
    designation: 'Adversary' | 'Ally' | 'Neutral';
    x: number;
    y: number;
    hp: number;
    techLevel: number;
  }>;
}

export interface GeneratePersonaOptions {
  prompt: string;
  archetype?: string;
  species?: string;
  techLevel?: number;
  mcmDesignation?: 'Adversary' | 'Ally' | 'Companion' | 'Neutral';
  mcmRole?: 'Bruiser' | 'Commando' | 'Sniper' | 'Guardian' | 'Slicer' | 'Medic' | 'Boss';
  threatTier?: number;
  apiKey?: string;
}

export interface GenerateSceneOptions {
  prompt: string;
  location?: string;
  environmentType?: string;
  techLevel?: number;
  threatTier?: number;
  apiKey?: string;
}

// ── GEMINI JSON SCHEMAS ──

const PERSONA_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    archetype: { type: "STRING" },
    oneLinePitch: { type: "STRING" },
    physicalDescription: { type: "STRING" },
    personalityMannerisms: { type: "STRING" },
    backgroundHistory: { type: "STRING" },
    goalsMotivations: { type: "STRING" },
    strengthsFlaws: { type: "STRING" },
    roleInStory: { type: "STRING" },
    relationships: { type: "STRING" },
    mcmTier: { type: "INTEGER" },
    mcmDesignation: { type: "STRING", enum: ["Adversary", "Ally", "Companion", "Neutral"] },
    mcmChassis: { type: "STRING", enum: ["Combatant", "Specialist", "Socialite", "Balanced"] },
    mcmRole: { type: "STRING", enum: ["Bruiser", "Commando", "Sniper", "Guardian", "Slicer", "Medic", "Boss"] },
    health: { type: "INTEGER" },
    vitality: { type: "INTEGER" },
    karma: { type: "INTEGER" },
    techLevel: { type: "INTEGER" },
    magicLevel: { type: "INTEGER" },
    armorDr: { type: "INTEGER" },
    speedFt: { type: "INTEGER" },
    attacks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          damageFormula: { type: "STRING" },
          rangeFt: { type: "INTEGER" },
          type: { type: "STRING" }
        },
        required: ["name", "damageFormula", "rangeFt", "type"]
      }
    },
    gear: { type: "ARRAY", items: { type: "STRING" } },
    features: { type: "ARRAY", items: { type: "STRING" } }
  },
  required: [
    "name", "archetype", "oneLinePitch", "physicalDescription", "personalityMannerisms",
    "backgroundHistory", "goalsMotivations", "strengthsFlaws", "roleInStory",
    "mcmTier", "mcmDesignation", "mcmChassis", "mcmRole",
    "health", "vitality", "karma", "techLevel", "armorDr", "attacks"
  ]
};

const SCENE_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    sceneName: { type: "STRING" },
    location: { type: "STRING" },
    sensoryDetails: { type: "STRING" },
    moodAtmosphere: { type: "STRING" },
    keyObjects: { type: "STRING" },
    sceneBeats: { type: "ARRAY", items: { type: "STRING" } },
    readAloud: { type: "STRING" },
    suggestedLighting: {
      type: "OBJECT",
      properties: {
        ambientColor: { type: "STRING" },
        darkness: { type: "NUMBER" },
        lights: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              x: { type: "NUMBER" },
              y: { type: "NUMBER" },
              color: { type: "STRING" },
              radius: { type: "NUMBER" }
            },
            required: ["x", "y", "color", "radius"]
          }
        }
      },
      required: ["ambientColor", "darkness", "lights"]
    },
    suggestedObjects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          type: { type: "STRING", enum: ["bulkhead", "terminal", "loot_container", "cover"] },
          x: { type: "NUMBER" },
          y: { type: "NUMBER" }
        },
        required: ["name", "type", "x", "y"]
      }
    },
    suggestedTokens: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          archetype: { type: "STRING" },
          designation: { type: "STRING", enum: ["Adversary", "Ally", "Neutral"] },
          x: { type: "NUMBER" },
          y: { type: "NUMBER" },
          hp: { type: "INTEGER" },
          techLevel: { type: "INTEGER" }
        },
        required: ["name", "archetype", "designation", "x", "y", "hp", "techLevel"]
      }
    }
  },
  required: [
    "sceneName", "location", "sensoryDetails", "moodAtmosphere",
    "keyObjects", "sceneBeats", "readAloud", "suggestedLighting",
    "suggestedObjects", "suggestedTokens"
  ]
};

// ── GENERATION METHODS ──

/**
 * Generates a ready-to-play .persona schema via RAG + Gemini API.
 */
export async function generateAimePersonaSchema(options: GeneratePersonaOptions): Promise<AimePersonaSchema> {
  const activeKey = options.apiKey || getGeminiApiKey();
  const searchTerms = [
    options.prompt,
    options.archetype,
    options.species,
    `TL${options.techLevel ?? 3}`,
    options.mcmRole,
    'character_creation combat species equipment'
  ].filter(Boolean).join(' ');

  const ragChunks = queryOmnicortexRAG(searchTerms, 4);
  const ragContext = formatRagContextForAIME(ragChunks);

  if (!activeKey) {
    return generateDeterministicPersonaFallback(options);
  }

  const systemInstruction = `You are AIME, the Creative & Narrative AI Co-Pilot for the Tangent Science Fantasy Roleplaying Game (SFF RPG).
Your task is to generate a fully realized, canonical .persona schema compliant with Tangent rules.
Rules Constraints:
- Base Vitality: 30 + (5 * STA)
- Base Health: 30 + (5 * STA)
- Base Karma: 3
- Tech Level: 0 to 5
- Armor DR: Period-appropriate (TL 1: 2-4, TL 2-3: 6-12, TL 4-5: 14-25)
- Ground weapon damage in the 2d10 Dual Resolution system (e.g. "2d10 + 6 Kinetic" or "3d10 + 8 Thermal").

OMNICORTEX RETRIEVED RULES CONTEXT:
${ragContext}`;

  const promptText = `Generate a complete .persona schema for the following character mandate:
Prompt: ${options.prompt}
Target Archetype: ${options.archetype || 'Custom Operative'}
Species: ${options.species || 'Human / Alterian'}
Tech Level: ${options.techLevel ?? 3}
Role: ${options.mcmRole || 'Commando'}
Designation: ${options.mcmDesignation || 'Adversary'}
Threat Tier: ${options.threatTier ?? 2}`;

  try {
    const requestBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: PERSONA_JSON_SCHEMA
      }
    };

    const data = await fetchGeminiContent(activeKey, requestBody);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        id: `persona_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'Persona',
        ...parsed
      };
    }
  } catch (err) {
    console.warn('[aimeVttSchemaService] Gemini generation error, using deterministic fallback:', err);
  }

  return generateDeterministicPersonaFallback(options);
}

/**
 * Generates a ready-to-play .scene schema via RAG + Gemini API.
 */
export async function generateAimeSceneSchema(options: GenerateSceneOptions): Promise<AimeSceneSchema> {
  const activeKey = options.apiKey || getGeminiApiKey();
  const searchTerms = [
    options.prompt,
    options.location,
    options.environmentType,
    `TL${options.techLevel ?? 3}`,
    'combat environment planetary cover hazards'
  ].filter(Boolean).join(' ');

  const ragChunks = queryOmnicortexRAG(searchTerms, 4);
  const ragContext = formatRagContextForAIME(ragChunks);

  if (!activeKey) {
    return generateDeterministicSceneFallback(options);
  }

  const systemInstruction = `You are AIME, the Tactical Scenario Architect for the Tangent Science Fantasy Roleplaying Game (SFF RPG).
Your task is to generate a comprehensive, playable .scene schema directly loaded into the VTT Stage.
Include:
- Evocative slugline and sensory room description without prematurely spoiling hidden GM secrets.
- 4-beat sequential narrative outline (Infiltration, Escalation, Climax, Resolution).
- Tactical read-aloud script for the Architect.
- Interactive objects (bulkheads, terminals, loot containers) and tactical tokens placed on a 50px grid.

OMNICORTEX RETRIEVED RULES CONTEXT:
${ragContext}`;

  const promptText = `Generate a tactical .scene schema for the following scenario mandate:
Prompt: ${options.prompt}
Location: ${options.location || 'Abandoned Starbase Airlock'}
Environment: ${options.environmentType || 'Industrial Derelict'}
Tech Level: ${options.techLevel ?? 3}
Threat Tier: ${options.threatTier ?? 2}`;

  try {
    const requestBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: SCENE_JSON_SCHEMA
      }
    };

    const data = await fetchGeminiContent(activeKey, requestBody);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        id: `scene_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'Scene',
        ...parsed
      };
    }
  } catch (err) {
    console.warn('[aimeVttSchemaService] Gemini scene generation error, using deterministic fallback:', err);
  }

  return generateDeterministicSceneFallback(options);
}

// ── VTT CONVERSION HELPERS ──

/**
 * Converts a .persona schema into a Stage StaticEntity token ready for useEngineStore.
 */
export function convertPersonaToVttToken(
  persona: AimePersonaSchema,
  options: { x?: number; y?: number; designation?: string } = {}
): StaticEntity {
  const isHero = persona.mcmDesignation === 'Ally' || options.designation === 'Ally';

  return {
    id: persona.id || `tok_persona_${Date.now()}`,
    name: persona.name,
    base_hp: persona.health || 30,
    base_health: persona.health || 30,
    base_vitality: persona.vitality || 30,
    base_structure: persona.structure || 0,
    is_synthetic: Boolean(persona.structure && persona.structure > 0),
    tech_level: persona.techLevel ?? 3,
    armor_dr: persona.armorDr ?? 4,
    size_modifier: 0,
    speed_ft: persona.speedFt ?? 30,
    species: 'Alterian',
    archetype: persona.archetype,
    is_persona: isHero,
    character_doc_id: persona.id,
    skills: {
      Combat: 10,
      Perception: 10,
      Athletics: 8,
      Reflexes: 10
    },
    attributes: {
      str: 2,
      agi: 3,
      sta: 2,
      int: 2,
      wis: 1,
      cha: 1
    }
  };
}

/**
 * Converts a .scene schema into a playable VTT Map object compatible with universeState.maps.
 */
export function convertSceneToVttMap(
  scene: AimeSceneSchema,
  options: { width?: number; height?: number } = {}
): any {
  const width = options.width || 2000;
  const height = options.height || 1600;

  const tokens = (scene.suggestedTokens || []).map((t, idx) => ({
    id: t.id || `tok_scene_${idx}_${Date.now()}`,
    name: t.name,
    x: t.x || 300 + idx * 100,
    y: t.y || 300 + idx * 80,
    hp: t.hp || 35,
    base_hp: t.hp || 35,
    max_hp: t.hp || 35,
    vitality: 30,
    health: t.hp || 35,
    tech_level: t.techLevel || 3,
    armor_dr: 6,
    is_persona: t.designation === 'Ally',
    archetype: t.archetype || 'Tactical Adversary',
    designation: t.designation || 'Adversary'
  }));

  const objects = (scene.suggestedObjects || []).map((obj, idx) => ({
    id: obj.id || `obj_scene_${idx}_${Date.now()}`,
    name: obj.name,
    type: obj.type,
    x: obj.x || 400 + idx * 120,
    y: obj.y || 350,
    storyElementId: `scene_prop_${idx}`
  }));

  const lights = (scene.suggestedLighting?.lights || []).map((l, idx) => ({
    id: `light_scene_${idx}_${Date.now()}`,
    x: l.x,
    y: l.y,
    color: l.color,
    radius: l.radius,
    intensity: 0.8
  }));

  return {
    id: scene.id || `map_${Date.now()}`,
    title: scene.sceneName || 'AIME Synthesized Tactical Sector',
    name: scene.sceneName || 'AIME Synthesized Tactical Sector',
    description: `${scene.sensoryDetails}\n\n[Architect Script]: ${scene.readAloud}`,
    width,
    height,
    grid_size: 50,
    grid_color: '#334155',
    ambient_color: scene.suggestedLighting?.ambientColor || '#0c1017',
    tokens,
    objects,
    lights,
    walls: [],
    lines: [],
    sceneBeats: scene.sceneBeats || []
  };
}

// ── DETERMINISTIC FALLBACKS ──

function generateDeterministicPersonaFallback(
  options: GeneratePersonaOptions
): AimePersonaSchema {
  const pName = options.prompt
    ? options.prompt.split(' ').slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Operative Strike Unit';
  const tl = options.techLevel ?? 3;
  const desig = options.mcmDesignation || 'Adversary';
  const role = options.mcmRole || 'Commando';
  const chassis = options.mcmRole === 'Bruiser' ? 'Combatant' : 'Specialist';

  return {
    id: `persona_fallback_${Date.now()}`,
    type: 'Persona',
    name: pName,
    archetype: options.archetype || 'Infiltrator Specialist',
    oneLinePitch: `A hardened ${role.toLowerCase()} operating under TL-${tl} parameters in hostile sectors.`,
    physicalDescription: `Equipped with reinforced ceramic ballistic weave, tactical HUD ocular visor, and silenced particle projector.`,
    personalityMannerisms: `Methodical and watchful. Speaks in concise military callsigns.`,
    backgroundHistory: `Veteran operative of regional corporate skirmishes across the outer orbital rim.`,
    goalsMotivations: `Establish sector control and extract tactical data without collateral breach.`,
    strengthsFlaws: `Exceptional reflexes and stealth; susceptible to high-intensity EMP discharge.`,
    roleInStory: desig === 'Ally' ? 'Tethered Allied Specialist' : 'Sector Enforcer',
    relationships: 'Reports directly to regional syndicate commander.',
    mcmTier: options.threatTier ?? 2,
    mcmDesignation: desig,
    mcmChassis: chassis,
    mcmRole: role,
    health: 35,
    vitality: 35,
    karma: 3,
    techLevel: tl,
    magicLevel: 0,
    armorDr: tl >= 3 ? 8 : 4,
    speedFt: 30,
    attacks: [
      {
        name: tl >= 3 ? 'Hyper-Kinetic Carbine' : 'Service Auto-Pistol',
        damageFormula: '2d10 + 6 Kinetic',
        rangeFt: 60,
        type: 'Ranged'
      },
      {
        name: 'Monofilament Tactical Knife',
        damageFormula: '1d10 + 4 Slashing',
        rangeFt: 5,
        type: 'Melee'
      }
    ],
    gear: ['Tactical Combat Harness', 'Med-Patch (x2)', 'Encrypted Comm-Link'],
    features: ['Evasive Stance', 'Called Shot Specialist']
  };
}

function generateDeterministicSceneFallback(
  options: GenerateSceneOptions
): AimeSceneSchema {
  const loc = options.location || 'Derelict Industrial Sector';
  const tl = options.techLevel ?? 3;

  return {
    id: `scene_fallback_${Date.now()}`,
    type: 'Scene',
    sceneName: `INT. ${loc.toUpperCase()} - ZERO HOUR`,
    location: loc,
    sensoryDetails: `Sub-zero coolant mist curls along the titanium floor plating. The rhythmic groan of depressurizing hydraulic valves echoes through the corridor, punctuated by the crimson strobe of an emergency beacon.`,
    moodAtmosphere: 'High tension, industrial dread, claustrophobic.',
    keyObjects: 'Reinforced blast bulkhead, sliced security data-terminal, containment crate with hazard seals.',
    sceneBeats: [
      '1. Perimeter Breach: Operatives approach the outer airlock under low light.',
      '2. Sensor Lockdown: Automated defense grid triggers security alert.',
      '3. Terminal Extraction: Slicer overrides blast doors while fending off enforcers.',
      '4. Evacuation: Extraction shuttle touches down as sector power collapses.'
    ],
    readAloud: `The bulkhead doors hiss open into ${loc}. A wall of chilled vapor rolls across your boots. Overhead conduits spark erratically, and through the gloom, you hear the unmistakable mechanical whine of active security sensors coming online.`,
    suggestedLighting: {
      ambientColor: '#0a0e17',
      darkness: 0.65,
      lights: [
        { x: 400, y: 300, color: '#f87171', radius: 180 },
        { x: 750, y: 450, color: '#38bdf8', radius: 220 }
      ]
    },
    suggestedObjects: [
      { id: 'obj_bulkhead_1', name: 'Reinforced Security Bulkhead', type: 'bulkhead', x: 450, y: 300 },
      { id: 'obj_terminal_1', name: 'Data Conduit Terminal', type: 'terminal', x: 700, y: 320 },
      { id: 'obj_crate_1', name: 'Munitions Cache', type: 'loot_container', x: 300, y: 500 }
    ],
    suggestedTokens: [
      {
        id: 'tok_guard_1',
        name: 'Automated Sentry Unit',
        archetype: 'Combat Drone',
        designation: 'Adversary',
        x: 600,
        y: 400,
        hp: 30,
        techLevel: tl
      },
      {
        id: 'tok_guard_2',
        name: 'Sector Security Enforcer',
        archetype: 'Commando',
        designation: 'Adversary',
        x: 750,
        y: 420,
        hp: 40,
        techLevel: tl
      }
    ]
  };
}

export default {
  generateAimePersonaSchema,
  generateAimeSceneSchema,
  convertPersonaToVttToken,
  convertSceneToVttMap
};
