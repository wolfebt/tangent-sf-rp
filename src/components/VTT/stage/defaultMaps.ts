/**
 * @file defaultMaps.ts
 * @description Built-in starter battlemaps and blank canvas generators for the Stage VTT.
 * Guarantees that users always have immediate access to functional tactical maps,
 * customizable blank canvases, and pre-populated sci-fi encounter scenarios.
 */

import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_LAYERS } from '../../../pages/Foundry/MapMaker/map/MapConstants.js';

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
 * Pre-built starter encounter: Orbital Command CIC Bridge
 */
export function createOrbitalBridgeMap(): any {
  const id = uuidv4();
  return {
    id,
    name: 'Orbital Command CIC Bridge',
    title: 'Orbital Command CIC Bridge',
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
        id: `token-commander-${Date.now()}`,
        name: 'Fleet Commander Voss',
        character_doc_id: 'char-voss-1',
        x: 630,
        y: 420,
        base_hp: 35,
        base_vitality: 40,
        base_health: 35,
        base_structure: 50,
        tech_level: 4,
        armor_dr: 5,
        stamina_dr: 3,
        speed_ft: 30,
        is_persona: true,
        species: 'Human',
        archetype: 'Commander'
      },
      {
        id: `token-officer-${Date.now()}`,
        name: 'Tactical Officer Ren',
        x: 840,
        y: 420,
        base_hp: 20,
        base_vitality: 25,
        tech_level: 4,
        armor_dr: 3,
        stamina_dr: 2,
        speed_ft: 30,
        is_persona: false,
        color: '#06b6d4'
      }
    ],
    walls: [
      // Outer bridge bulkhead hull
      { id: 'w-cic-1', p1: { x: 280, y: 210 }, p2: { x: 980, y: 210 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-cic-2', p1: { x: 980, y: 210 }, p2: { x: 1120, y: 490 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-cic-3', p1: { x: 1120, y: 490 }, p2: { x: 980, y: 770 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-cic-4', p1: { x: 980, y: 770 }, p2: { x: 280, y: 770 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-cic-5', p1: { x: 280, y: 770 }, p2: { x: 140, y: 490 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-cic-6', p1: { x: 140, y: 490 }, p2: { x: 280, y: 210 }, isDynamic: false, isOpen: false, isTransparent: false },
      // Forward Viewport Glass (Transparent)
      { id: 'w-cic-glass', p1: { x: 980, y: 350 }, p2: { x: 980, y: 630 }, isDynamic: false, isOpen: false, isTransparent: true },
      // Blast Doors to Hangar Transit
      { id: 'w-cic-door-1', p1: { x: 280, y: 420 }, p2: { x: 280, y: 560 }, isDynamic: true, isOpen: false, isTransparent: false }
    ],
    objects: [
      {
        id: 'obj-holotable-1',
        name: 'Central Strategic Holotable',
        type: 'terminal',
        x: 630,
        y: 490,
        storyElementId: 'elem-holotable-1'
      },
      {
        id: 'obj-helm-1',
        name: 'Navigation & Helm Console',
        type: 'terminal',
        x: 840,
        y: 350,
        storyElementId: 'elem-helm-1'
      },
      {
        id: 'obj-tactical-1',
        name: 'Weapons Array Control Dais',
        type: 'terminal',
        x: 840,
        y: 630,
        storyElementId: 'elem-tactical-1'
      }
    ],
    terrains: [
      {
        id: 'terrain-bridge-deck',
        points: [280, 210, 980, 210, 1120, 490, 980, 770, 280, 770, 140, 490],
        color: '#090d16',
        strokeWidth: 2,
        renderType: 'polygon',
        closed: true,
        biomeType: 'metalDecking',
        terrainTypeId: 'metalDecking',
        label: 'Reinforced Plasteel Bridge Deck'
      }
    ],
    lines: [],
    texts: [
      { id: 't-cic', text: 'ORBITAL CIC BRIDGE // HIGH SECURITY ALERT', fill: '#06b6d4', fontSize: 18, x: 300, y: 160 }
    ],
    lights: [
      {
        id: 'light-holotable',
        x: 630,
        y: 490,
        radius: 350,
        color: '#06b6d4',
        intensity: 0.95,
        falloff: 'smooth',
        animation: 'pulse',
        castShadows: true,
        label: 'Holographic Strategic Sphere'
      },
      {
        id: 'light-alert-cic',
        x: 980,
        y: 210,
        radius: 220,
        color: '#ef4444',
        intensity: 1.0,
        falloff: 'smooth',
        animation: 'flicker',
        castShadows: true,
        label: 'Red Alert Warning Strobe'
      },
      {
        id: 'light-captain-dais',
        x: 350,
        y: 490,
        radius: 260,
        color: '#38bdf8',
        intensity: 0.85,
        falloff: 'smooth',
        animation: 'none',
        castShadows: true,
        label: 'Command Dais Accent Luminary'
      }
    ],
    fog: [],
    layers: DEFAULT_LAYERS.map(l => ({ ...l }))
  };
}

/**
 * Pre-built starter encounter: Xenobiology Bioluminescent Caverns
 */
export function createXenobiologyCavernMap(): any {
  const id = uuidv4();
  return {
    id,
    name: 'Xenobiology Bioluminescent Caverns',
    title: 'Xenobiology Bioluminescent Caverns',
    type: 'Subterranean',
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
        id: `token-xeno-${Date.now()}`,
        name: 'Chitinous Brood Queen',
        x: 840,
        y: 560,
        base_hp: 45,
        base_vitality: 50,
        base_health: 45,
        base_structure: 35,
        tech_level: 2,
        armor_dr: 6,
        stamina_dr: 3,
        speed_ft: 40,
        role: 'boss',
        color: '#a855f7'
      }
    ],
    walls: [
      // Natural cavern rock perimeter
      { id: 'w-xeno-1', p1: { x: 210, y: 210 }, p2: { x: 1050, y: 140 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-xeno-2', p1: { x: 1050, y: 140 }, p2: { x: 1260, y: 700 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-xeno-3', p1: { x: 1260, y: 700 }, p2: { x: 910, y: 980 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-xeno-4', p1: { x: 910, y: 980 }, p2: { x: 280, y: 910 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-xeno-5', p1: { x: 280, y: 910 }, p2: { x: 140, y: 560 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-xeno-6', p1: { x: 140, y: 560 }, p2: { x: 210, y: 210 }, isDynamic: false, isOpen: false, isTransparent: false },
      // Crystal Pillar (Natural Obstacle)
      { id: 'w-xeno-pillar', p1: { x: 560, y: 490 }, p2: { x: 630, y: 560 }, isDynamic: false, isOpen: false, isTransparent: true }
    ],
    objects: [
      {
        id: 'obj-crystal-pylon',
        name: 'Resonating Resonance Crystal',
        type: 'generator',
        x: 560,
        y: 490,
        storyElementId: 'elem-crystal-pylon'
      },
      {
        id: 'obj-chrysalis-nest',
        name: 'Dormant Xenobiotic Chrysalis',
        type: 'stasis',
        x: 980,
        y: 350,
        storyElementId: 'elem-chrysalis'
      }
    ],
    terrains: [
      {
        id: 'terrain-slime-pool',
        points: [700, 420, 980, 420, 910, 630, 630, 630],
        color: '#14532d',
        strokeWidth: 2,
        renderType: 'polygon',
        closed: true,
        biomeType: 'toxicChemicalWasteland',
        terrainTypeId: 'toxicChemicalWasteland',
        label: 'Caustic Acidic Pool'
      }
    ],
    lines: [],
    texts: [
      { id: 't-xeno', text: 'DEEP SUBSURFACE BIO-ZONE // EXTREME BIOHAZARD', fill: '#10b981', fontSize: 18, x: 240, y: 160 }
    ],
    lights: [
      {
        id: 'light-flora-emerald',
        x: 420,
        y: 350,
        radius: 300,
        color: '#10b981',
        intensity: 0.9,
        falloff: 'smooth',
        animation: 'pulse',
        castShadows: true,
        label: 'Bioluminescent Fungus Glade'
      },
      {
        id: 'light-flora-violet',
        x: 840,
        y: 560,
        radius: 340,
        color: '#a855f7',
        intensity: 0.95,
        falloff: 'smooth',
        animation: 'none',
        castShadows: true,
        label: 'Void Spore Luminescence'
      }
    ],
    fog: [],
    layers: DEFAULT_LAYERS.map(l => ({ ...l }))
  };
}

/**
 * Pre-built starter encounter: Neon Black Market Alleyway
 */
export function createNeonBlackMarketMap(): any {
  const id = uuidv4();
  return {
    id,
    name: 'Neon Black Market Alleyway',
    title: 'Neon Black Market Alleyway',
    type: 'Urban',
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
        id: `token-vendor-${Date.now()}`,
        name: 'Kira the Ripperdoc',
        x: 490,
        y: 420,
        base_hp: 25,
        base_vitality: 30,
        tech_level: 4,
        is_persona: true,
        species: 'Cyborg',
        archetype: 'Doctor'
      }
    ],
    walls: [
      // Street building walls
      { id: 'w-street-n', p1: { x: 210, y: 280 }, p2: { x: 1190, y: 280 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-street-s', p1: { x: 210, y: 700 }, p2: { x: 1190, y: 700 }, isDynamic: false, isOpen: false, isTransparent: false },
      // Clinic security shutter
      { id: 'w-shutter', p1: { x: 420, y: 280 }, p2: { x: 560, y: 280 }, isDynamic: true, isOpen: true, isTransparent: false },
      // Dumpster barrier alley choke
      { id: 'w-alley-barrier', p1: { x: 770, y: 280 }, p2: { x: 770, y: 490 }, isDynamic: false, isOpen: false, isTransparent: false }
    ],
    objects: [
      {
        id: 'obj-atm-1',
        name: 'Syndicate Cyber-ATM Node',
        type: 'terminal',
        x: 350,
        y: 350,
        storyElementId: 'elem-atm-1'
      },
      {
        id: 'obj-ripper-chair',
        name: 'Surgical Cyber-Implant Bed',
        type: 'stasis',
        x: 490,
        y: 350,
        storyElementId: 'elem-ripper-chair'
      },
      {
        id: 'obj-crate-weapons',
        name: 'Black-Market Arms Cache',
        type: 'crate',
        x: 770,
        y: 560,
        storyElementId: 'elem-arms-cache'
      }
    ],
    terrains: [
      {
        id: 'terrain-wet-asphalt',
        points: [210, 280, 1190, 280, 1190, 700, 210, 700],
        color: '#0b0f19',
        strokeWidth: 2,
        renderType: 'polygon',
        closed: true,
        biomeType: 'metalDecking',
        terrainTypeId: 'metalDecking',
        label: 'Wet Cyberpunk Asphalt'
      }
    ],
    lines: [],
    texts: [
      { id: 't-neon', text: 'NEON SECTOR 4 // BLACK ALLEY SYNDICATE ROW', fill: '#ec4899', fontSize: 18, x: 240, y: 220 }
    ],
    lights: [
      {
        id: 'light-neon-pink',
        x: 420,
        y: 350,
        radius: 280,
        color: '#ec4899',
        intensity: 0.95,
        falloff: 'smooth',
        animation: 'flicker',
        castShadows: true,
        label: 'Neon Noodle Sign Strobe'
      },
      {
        id: 'light-neon-cyan',
        x: 770,
        y: 560,
        radius: 280,
        color: '#38bdf8',
        intensity: 0.9,
        falloff: 'smooth',
        animation: 'pulse',
        castShadows: true,
        label: 'Clinic Holo-Sign Glow'
      }
    ],
    fog: [],
    layers: DEFAULT_LAYERS.map(l => ({ ...l }))
  };
}

/**
 * Pre-built starter encounter: Heavy Mag-Lev Cargo Depot
 */
export function createMagLevDepotMap(): any {
  const id = uuidv4();
  return {
    id,
    name: 'Heavy Mag-Lev Cargo Depot',
    title: 'Heavy Mag-Lev Cargo Depot',
    type: 'Industrial',
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
        id: `token-turret-${Date.now()}`,
        name: 'Automated Defense Sentry',
        x: 910,
        y: 420,
        base_hp: 30,
        base_vitality: 30,
        tech_level: 4,
        armor_dr: 6,
        is_persona: false,
        color: '#ef4444'
      }
    ],
    walls: [
      // Perimeter security fences & rail walls
      { id: 'w-depot-1', p1: { x: 210, y: 210 }, p2: { x: 1260, y: 210 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-depot-2', p1: { x: 1260, y: 210 }, p2: { x: 1260, y: 840 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-depot-3', p1: { x: 1260, y: 840 }, p2: { x: 210, y: 840 }, isDynamic: false, isOpen: false, isTransparent: false },
      { id: 'w-depot-4', p1: { x: 210, y: 840 }, p2: { x: 210, y: 210 }, isDynamic: false, isOpen: false, isTransparent: false },
      // Rail airlock gate
      { id: 'w-depot-gate', p1: { x: 1260, y: 490 }, p2: { x: 1260, y: 630 }, isDynamic: true, isOpen: false, isTransparent: false }
    ],
    objects: [
      {
        id: 'obj-train-console',
        name: 'Mag-Lev Switchboard Console',
        type: 'terminal',
        x: 420,
        y: 350,
        storyElementId: 'elem-switchboard'
      },
      {
        id: 'obj-crane-controls',
        name: 'Gantry Crane Override',
        type: 'terminal',
        x: 980,
        y: 350,
        storyElementId: 'elem-gantry'
      },
      {
        id: 'obj-cargo-container-1',
        name: 'Sealed Isotopes Container',
        type: 'crate',
        x: 700,
        y: 490,
        storyElementId: 'elem-container'
      }
    ],
    terrains: [
      {
        id: 'terrain-depot-concrete',
        points: [210, 210, 1260, 210, 1260, 840, 210, 840],
        color: '#1e293b',
        strokeWidth: 2,
        renderType: 'polygon',
        closed: true,
        biomeType: 'metalDecking',
        terrainTypeId: 'metalDecking',
        label: 'Industrial Reinforced Pad'
      }
    ],
    lines: [],
    texts: [
      { id: 't-depot', text: 'MAG-LEV LOGISTICS DEPOT // TRACK 09 GATES', fill: '#f59e0b', fontSize: 18, x: 260, y: 160 }
    ],
    lights: [
      {
        id: 'light-sodium-depot-1',
        x: 420,
        y: 350,
        radius: 320,
        color: '#f59e0b',
        intensity: 0.95,
        falloff: 'smooth',
        animation: 'none',
        castShadows: true,
        label: 'High-Pressure Sodium Lamp'
      },
      {
        id: 'light-sodium-depot-2',
        x: 980,
        y: 350,
        radius: 320,
        color: '#f59e0b',
        intensity: 0.95,
        falloff: 'smooth',
        animation: 'none',
        castShadows: true,
        label: 'Gantry Warning Lamp'
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
    createPlanetaryLandingZoneMap(),
    createOrbitalBridgeMap(),
    createXenobiologyCavernMap(),
    createNeonBlackMarketMap(),
    createMagLevDepotMap()
  ];
}

