/**
 * @file defaultMaps.ts
 * @description Built-in starter battlemaps and blank canvas generators for the Stage VTT.
 * Guarantees that users always have immediate access to functional tactical maps,
 * customizable blank canvases, and pre-populated sci-fi encounter scenarios.
 */

import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_LAYERS } from '../../../pages/Foundry/MapMaker/map/MapConstants';

export interface CreateBlankCanvasOptions {
  id?: string;
  title?: string;
  gridType?: 'hex' | 'square';
  gridSize?: number;
  width?: number;
  height?: number;
  scaleTier?: string;
  backgroundUrl?: string;
}

/**
 * Creates a fresh, crisp blank tactical canvas map.
 */
export function createBlankCanvas(options: CreateBlankCanvasOptions = {}) {
  const id = options.id || uuidv4();
  const title = options.title || 'Blank Tactical Canvas';
  const gridType = options.gridType || 'hex';
  const gridSize = options.gridSize || 70;
  const width = options.width || 2800;
  const height = options.height || 2100;
  const scaleTier = options.scaleTier || 'Encounter';

  return {
    id,
    name: title,
    title,
    type: scaleTier,
    scale: scaleTier,
    scaleTier,
    gridType,
    gridMode: gridType,
    gridSize,
    width,
    height,
    background_url: options.backgroundUrl || '',
    underlayConfig: options.backgroundUrl
      ? {
          url: options.backgroundUrl,
          opacity: 0.85,
          scale: 1.0,
          offsetX: 0,
          offsetY: 0,
          visible: true
        }
      : null,
    tokens: [] as any[],
    walls: [] as any[],
    objects: [] as any[],
    terrains: [] as any[],
    lines: [] as any[],
    texts: [
      {
        id: `text-${Date.now()}-1`,
        text: 'TACTICAL SECTOR // GRID MAT READY',
        fill: '#22d3ee',
        fontSize: 16,
        x: 60,
        y: 60
      }
    ] as any[],
    lights: [] as any[],
    fog: [] as any[],
    layers: DEFAULT_LAYERS.map(l => ({ ...l }))
  };
}

/**
 * Pre-built starter encounter: Derelict Starship Corridor
 * Features bulkheads, airlock doors, warning lights, control consoles, and crates.
 */
export function createDerelictStarshipMap(): any {
  const id = uuidv4();
  return {
    id,
    name: 'Derelict Starship Corridor',
    title: 'Derelict Starship Corridor',
    type: 'Interior',
    scale: 'Encounter',
    scaleTier: 'Encounter',
    gridType: 'square',
    gridMode: 'square',
    gridSize: 70,
    width: 2800,
    height: 2100,
    background_url: '',
    tokens: [
      {
        id: `token-operative-${Date.now()}`,
        name: 'Vanguard Operative',
        character_doc_id: 'char-hero-1',
        x: 420,
        y: 420,
        base_hp: 35,
        base_vitality: 30,
        base_health: 35,
        base_structure: 50,
        tech_level: 3,
        armor_dr: 8,
        stamina_dr: 3,
        speed_ft: 30,
        is_persona: true,
        species: 'Human',
        archetype: 'Vanguard'
      },
      {
        id: `token-sentry-${Date.now()}`,
        name: 'Automated Sentry Bot',
        x: 1050,
        y: 420,
        base_hp: 20,
        base_vitality: 15,
        base_health: 20,
        base_structure: 30,
        tech_level: 2,
        armor_dr: 6,
        stamina_dr: 2,
        speed_ft: 25,
        is_persona: false,
        is_synthetic: true,
        species: 'Synthetic Drone',
        archetype: 'Automaton'
      }
    ],
    walls: [
      // Main Corridor North Wall
      { id: 'w1', p1: { x: 210, y: 280 }, p2: { x: 770, y: 280 }, isDynamic: false, isOpen: false, isTransparent: false },
      // Airlock Door
      { id: 'w2-door', p1: { x: 770, y: 280 }, p2: { x: 910, y: 280 }, isDynamic: true, isOpen: false, isTransparent: false, isDoor: true },
      // North Wall Continued
      { id: 'w3', p1: { x: 910, y: 280 }, p2: { x: 1470, y: 280 }, isDynamic: false, isOpen: false, isTransparent: false },
      // Main Corridor South Wall
      { id: 'w4', p1: { x: 210, y: 560 }, p2: { x: 1470, y: 560 }, isDynamic: false, isOpen: false, isTransparent: false },
      // West Bulkhead
      { id: 'w5', p1: { x: 210, y: 280 }, p2: { x: 210, y: 560 }, isDynamic: false, isOpen: false, isTransparent: false },
      // East Bulkhead with Security Window
      { id: 'w6', p1: { x: 1470, y: 280 }, p2: { x: 1470, y: 560 }, isDynamic: false, isOpen: false, isTransparent: true }
    ],
    objects: [
      {
        id: 'obj-console-1',
        name: 'Bridge Access Terminal',
        type: 'terminal',
        x: 350,
        y: 350,
        storyElementId: 'elem-console-1'
      },
      {
        id: 'obj-crate-1',
        name: 'Pressurized Cargo Crate',
        type: 'crate',
        x: 630,
        y: 490,
        storyElementId: 'elem-crate-1'
      },
      {
        id: 'obj-crate-2',
        name: 'Munitions Container',
        type: 'crate',
        x: 700,
        y: 490,
        storyElementId: 'elem-crate-2'
      },
      {
        id: 'obj-generator-1',
        name: 'Auxiliary Fusion Reactor',
        type: 'generator',
        x: 1260,
        y: 420,
        storyElementId: 'elem-gen-1'
      }
    ],
    terrains: [
      {
        id: 'terrain-deck-1',
        points: [210, 280, 1470, 280, 1470, 560, 210, 560],
        color: '#1e293b',
        strokeWidth: 2,
        renderType: 'polygon',
        closed: true,
        biomeType: 'metalDecking',
        terrainTypeId: 'metalDecking',
        label: 'Reinforced Decking'
      }
    ],
    lines: [],
    texts: [
      { id: 't1', text: 'DECK 04 // CORRIDOR ALPHA', fill: '#38bdf8', fontSize: 18, x: 250, y: 240 },
      { id: 't2', text: 'SECURITY AIRLOCK', fill: '#f59e0b', fontSize: 12, x: 780, y: 255 }
    ],
    lights: [
      {
        id: 'light-amb-1',
        x: 420,
        y: 420,
        radius: 260,
        color: '#38bdf8',
        intensity: 0.9,
        falloff: 'smooth',
        animation: 'pulse',
        castShadows: true,
        label: 'Corridor Glow'
      },
      {
        id: 'light-alert-1',
        x: 840,
        y: 280,
        radius: 200,
        color: '#f59e0b',
        intensity: 1.0,
        falloff: 'smooth',
        animation: 'flicker',
        castShadows: true,
        label: 'Airlock Warning Light'
      },
      {
        id: 'light-reactor-1',
        x: 1260,
        y: 420,
        radius: 240,
        color: '#10b981',
        intensity: 0.85,
        falloff: 'smooth',
        animation: 'none',
        castShadows: true,
        label: 'Reactor Core Aura'
      }
    ],
    fog: [],
    layers: DEFAULT_LAYERS.map(l => ({ ...l }))
  };
}

/**
 * Pre-built starter encounter: Research Outpost Beta
 */
export function createResearchOutpostMap(): any {
  const id = uuidv4();
  return {
    id,
    name: 'Research Outpost Beta',
    title: 'Research Outpost Beta',
    type: 'Interior',
    scale: 'Encounter',
    scaleTier: 'Encounter',
    gridType: 'hex',
    gridMode: 'hex',
    gridSize: 70,
    width: 2800,
    height: 2100,
    background_url: '',
    tokens: [
      {
        id: `token-scientist-${Date.now()}`,
        name: 'Chief Science Officer',
        character_doc_id: 'char-sci-1',
        x: 500,
        y: 450,
        base_hp: 25,
        base_vitality: 30,
        base_health: 25,
        base_structure: 40,
        tech_level: 4,
        armor_dr: 4,
        stamina_dr: 2,
        speed_ft: 30,
        is_persona: true,
        species: 'Human',
        archetype: 'Scholar'
      }
    ],
    walls: [
      { id: 'w1', p1: { x: 300, y: 300 }, p2: { x: 900, y: 300 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w2', p1: { x: 900, y: 300 }, p2: { x: 900, y: 700 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w3', p1: { x: 900, y: 700 }, p2: { x: 300, y: 700 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w4', p1: { x: 300, y: 700 }, p2: { x: 300, y: 300 }, isDynamic: false, isOpen: false, isTransparent: false },
      // Interior partition with glass window
      { id: 'w5', p1: { x: 600, y: 300 }, p2: { x: 600, y: 500 }, isDynamic: false, isOpen: false, isTransparent: true }
    ],
    objects: [
      {
        id: 'obj-cryo-1',
        name: 'Cryo-Stasis Chamber',
        type: 'stasis',
        x: 420,
        y: 380,
        storyElementId: 'elem-cryo-1'
      },
      {
        id: 'obj-server-1',
        name: 'Mainframe Server Stack',
        type: 'terminal',
        x: 750,
        y: 380,
        storyElementId: 'elem-server-1'
      },
      {
        id: 'obj-turret-1',
        name: 'Automated Ceiling Turret',
        type: 'turret',
        x: 600,
        y: 600,
        storyElementId: 'elem-turret-1'
      }
    ],
    terrains: [
      {
        id: 'terrain-lab-1',
        points: [300, 300, 900, 300, 900, 700, 300, 700],
        color: '#0f172a',
        strokeWidth: 2,
        renderType: 'polygon',
        closed: true,
        biomeType: 'metalDecking',
        terrainTypeId: 'metalDecking',
        label: 'Bio-Lab Cleanroom'
      }
    ],
    lines: [],
    texts: [
      { id: 't1', text: 'BIO-RESEARCH SECTOR BETA', fill: '#10b981', fontSize: 16, x: 340, y: 260 }
    ],
    lights: [
      {
        id: 'light-cleanroom',
        x: 600,
        y: 500,
        radius: 300,
        color: '#10b981',
        intensity: 0.9,
        falloff: 'smooth',
        animation: 'none',
        castShadows: true,
        label: 'Cleanroom Luminescence'
      }
    ],
    fog: [],
    layers: DEFAULT_LAYERS.map(l => ({ ...l }))
  };
}

/**
 * Pre-built starter encounter: Planetary Landing Zone
 */
export function createPlanetaryLandingZoneMap(): any {
  const id = uuidv4();
  return {
    id,
    name: 'Planetary Landing Zone',
    title: 'Planetary Landing Zone',
    type: 'Exterior',
    scale: 'Overland',
    scaleTier: 'Overland',
    gridType: 'hex',
    gridMode: 'hex',
    gridSize: 70,
    width: 2800,
    height: 2100,
    background_url: '',
    tokens: [],
    walls: [],
    objects: [
      {
        id: 'obj-beacon-1',
        name: 'Navigation Beacon Mast',
        type: 'beacon',
        x: 700,
        y: 700,
        storyElementId: 'elem-beacon-1'
      },
      {
        id: 'obj-fuel-1',
        name: 'Volatile Fuel Tank',
        type: 'generator',
        x: 950,
        y: 650,
        storyElementId: 'elem-fuel-1'
      }
    ],
    terrains: [
      {
        id: 'terrain-ground-1',
        points: [150, 150, 1500, 150, 1500, 1100, 150, 1100],
        color: '#332211',
        strokeWidth: 2,
        renderType: 'polygon',
        closed: true,
        biomeType: 'aridSavannaDesert',
        terrainTypeId: 'aridSavannaDesert',
        label: 'Scorched Basalt Surface'
      }
    ],
    lines: [],
    texts: [
      { id: 't1', text: 'SURFACE EXTRACTION SITE // QUADRANT 7', fill: '#f59e0b', fontSize: 18, x: 200, y: 120 }
    ],
    lights: [
      {
        id: 'light-beacon-1',
        x: 700,
        y: 700,
        radius: 280,
        color: '#f59e0b',
        intensity: 1.0,
        falloff: 'smooth',
        animation: 'pulse',
        castShadows: true,
        label: 'Beacon Strobe'
      }
    ],
    fog: [],
    layers: DEFAULT_LAYERS.map(l => ({ ...l }))
  };
}

/**
 * Returns a complete initial starter collection of tactical maps.
 */
export function getStarterMapsCollection(): any[] {
  return [
    createBlankCanvas({ title: 'Tactical Blank Canvas' }),
    createDerelictStarshipMap(),
    createResearchOutpostMap(),
    createPlanetaryLandingZoneMap()
  ];
}
