/**
 * @file PCGPromptAnalyzer.ts
 * @description Analyzes high-specificity natural language prompts (e.g. "barricaded blast doors, flickering amber warning lights, carbon scoring on bulkheads")
 * and compiles them into structured LLM PCG script directives for PCGExecutor.
 */

import type { LLMScriptPayload, ScriptDirective, AtmosphereLightingDirective } from './PCGExecutor.ts';

export interface PromptAnalysisResult {
  payload: LLMScriptPayload;
  detectedFeatures: {
    lights: {
      detected: boolean;
      color: string;
      colorName: string;
      animation: 'steady' | 'flicker' | 'pulse';
      radius: number;
      intensity: number;
    };
    doors: {
      detected: boolean;
      doorType: 'blast_door' | 'bulkhead' | 'airlock' | 'security';
      isBarricaded: boolean;
      isLocked: boolean;
    };
    carbonScoring: {
      detected: boolean;
      decalType: 'carbon_scoring' | 'scorch' | 'breach' | 'debris';
      limit: number;
    };
    cover: {
      detected: boolean;
      tags: string[];
      density: number;
      limit: number;
    };
    clutter: {
      detected: boolean;
      tags: string[];
      density: number;
      limit: number;
    };
    hazards: {
      detected: boolean;
      hazardType: string;
      tags: string[];
      limit: number;
    };
    atmosphere: AtmosphereLightingDirective;
  };
  summary: string[];
}

export class PCGPromptAnalyzer {
  /**
   * Compiles any natural language prompt into high-specificity PCG execution directives.
   */
  public static analyze(
    prompt: string,
    zone: [number, number, number, number] = [0, 0, 40, 30]
  ): PromptAnalysisResult {
    const raw = prompt.toLowerCase();
    const summary: string[] = [];
    const execute_scripts: ScriptDirective[] = [];

    // 1. LIGHTING & LUMINARY ANALYSIS
    const lightKeywords = ['light', 'lights', 'lighting', 'luminary', 'luminaries', 'lamp', 'beacon', 'strobe', 'emitter', 'glow', 'illumination', 'lantern', 'led', 'bulb'];
    const hasLights = lightKeywords.some(kw => raw.includes(kw));

    let lightColor = '#f59e0b'; // default amber/warning
    let lightColorName = 'amber';
    if (raw.includes('red') || raw.includes('crimson') || raw.includes('emergency') || raw.includes('alarm') || raw.includes('alert') || raw.includes('danger')) {
      lightColor = '#ef4444';
      lightColorName = 'emergency red';
    } else if (raw.includes('amber') || raw.includes('yellow') || raw.includes('warning') || raw.includes('sodium')) {
      lightColor = '#f59e0b';
      lightColorName = 'amber warning';
    } else if (raw.includes('seafloor') || raw.includes('benthic')) {
      lightColor = '#0d9488';
      lightColorName = 'benthic bioluminescence';
    } else if (raw.includes('arctic') || raw.includes('frost') || raw.includes('sub-zero')) {
      lightColor = '#bae6fd';
      lightColorName = 'arctic pale blue';
    } else if (raw.includes('cyan') || raw.includes('cold blue') || raw.includes('blue') || raw.includes('terminal') || raw.includes('subtle blue')) {
      lightColor = '#38bdf8';
      lightColorName = 'cold cyan';
    } else if (raw.includes('forest') || raw.includes('green') || raw.includes('emerald') || raw.includes('toxic') || raw.includes('acid') || raw.includes('xenomoss')) {
      lightColor = '#10b981';
      lightColorName = 'emerald green';
    } else if (raw.includes('badlands') || raw.includes('canyon')) {
      lightColor = '#ea580c';
      lightColorName = 'terracotta amber';
    } else if (raw.includes('desert') || raw.includes('dune')) {
      lightColor = '#f59e0b';
      lightColorName = 'solar gold';
    } else if (raw.includes('ravine') || raw.includes('chasm') || raw.includes('rift')) {
      lightColor = '#3b82f6';
      lightColorName = 'chasm rift blue';
    } else if (raw.includes('mountain') || raw.includes('alpine')) {
      lightColor = '#cbd5e1';
      lightColorName = 'alpine starlight';
    } else if (raw.includes('purple') || raw.includes('violet') || raw.includes('void') || raw.includes('warp')) {
      lightColor = '#a855f7';
      lightColorName = 'void purple';
    } else if (raw.includes('white') || raw.includes('sterile') || raw.includes('medical') || raw.includes('fluorescent')) {
      lightColor = '#f8fafc';
      lightColorName = 'sterile white';
    }

    let lightAnimation: 'steady' | 'flicker' | 'pulse' = 'steady';
    if (raw.includes('flicker') || raw.includes('flickering') || raw.includes('unstable') || raw.includes('failing') || raw.includes('dying') || raw.includes('glitch') || raw.includes('damaged')) {
      lightAnimation = 'flicker';
    } else if (raw.includes('pulse') || raw.includes('pulsing') || raw.includes('strobe') || raw.includes('beacon') || raw.includes('flashing') || raw.includes('alarm') || raw.includes('siren')) {
      lightAnimation = 'pulse';
    }

    const lightRadius = raw.includes('dim') || raw.includes('faint') ? 2.5 : (raw.includes('bright') || raw.includes('flood') ? 4.5 : 3.5);
    const lightIntensity = raw.includes('dim') ? 0.6 : 0.85;
    const lightLimit = raw.includes('heavy') || raw.includes('dense') ? 8 : (raw.includes('sparse') ? 3 : 5);

    if (hasLights) {
      summary.push(`Detected luminaries: ${lightColorName} (${lightColor}) with ${lightAnimation} animation`);
      execute_scripts.push({
        action: 'inject_lights',
        query_tags: ['light', 'luminary', lightColorName],
        zone,
        color: lightColor,
        animation: lightAnimation,
        radius: lightRadius,
        intensity: lightIntensity,
        limit: lightLimit
      });
    }

    // 2. DOORS & BARRICADES ANALYSIS
    const doorKeywords = ['door', 'doors', 'blast door', 'blast doors', 'bulkhead', 'bulkheads', 'airlock', 'airlocks', 'portal', 'barricade', 'barricaded', 'sealed', 'welded', 'fortified', 'reinforced', 'locked', 'security'];
    const hasDoors = doorKeywords.some(kw => raw.includes(kw));

    let doorType: 'blast_door' | 'bulkhead' | 'airlock' | 'security' = 'blast_door';
    if (raw.includes('airlock')) doorType = 'airlock';
    else if (raw.includes('blast')) doorType = 'blast_door';
    else if (raw.includes('security')) doorType = 'security';
    else if (raw.includes('bulkhead door') || raw.includes('bulkhead')) doorType = 'bulkhead';

    const isBarricaded = raw.includes('barricade') || raw.includes('barricaded') || raw.includes('fortified') || raw.includes('blocked') || raw.includes('reinforced');
    const isLocked = isBarricaded || raw.includes('locked') || raw.includes('sealed') || raw.includes('welded') || raw.includes('security');

    if (hasDoors) {
      summary.push(`Detected portals: ${doorType} (${isBarricaded ? 'BARRICADED & ' : ''}${isLocked ? 'LOCKED' : 'STANDARD'})`);
      execute_scripts.push({
        action: 'barricade_doors',
        query_tags: ['door', doorType, isBarricaded ? 'barricade' : 'bulkhead'],
        zone,
        doorType,
        isBarricaded,
        isLocked,
        limit: 4
      });
    }

    // 3. CARBON SCORING & BULKHEAD DAMAGE ANALYSIS
    const scorchKeywords = ['carbon scoring', 'scorch', 'scorched', 'blast marks', 'burn', 'burns', 'charred', 'breach', 'craters', 'crater', 'bullet holes', 'shrapnel', 'soot', 'impact'];
    const hasCarbonScoring = scorchKeywords.some(kw => raw.includes(kw));

    let decalType: 'carbon_scoring' | 'scorch' | 'breach' | 'debris' = 'carbon_scoring';
    if (raw.includes('carbon scoring') || raw.includes('carbon') || raw.includes('soot')) decalType = 'carbon_scoring';
    else if (raw.includes('scorch') || raw.includes('burn') || raw.includes('charred')) decalType = 'scorch';
    else if (raw.includes('breach') || raw.includes('crater') || raw.includes('blast')) decalType = 'breach';

    const scorchLimit = raw.includes('heavy') || raw.includes('extensive') ? 12 : 8;

    if (hasCarbonScoring) {
      summary.push(`Detected bulkhead weathering: ${decalType} along structural boundaries (${scorchLimit} stamps)`);
      execute_scripts.push({
        action: 'scorch_bulkheads',
        query_tags: ['scorch', 'carbon_scoring', 'decal', 'bulkhead'],
        zone,
        decalType,
        limit: scorchLimit
      });
    }

    // 4. CONTEXTUAL CLUTTER & TACTICAL COVER
    const coverKeywords = [
      'cover', 'tactical cover', 'barricade', 'barricades', 'crate', 'crates', 'cargo',
      'containers', 'sandbags', 'plastisteel', 'defensive', 'boulder', 'boulders', 'rock',
      'rocks', 'rubble', 'coral', 'ice', 'permafrost', 'badlands', 'desert', 'ravine',
      'ravines', 'seafloor', 'arctic', 'forest', 'mountain', 'mountains'
    ];
    const hasCover = coverKeywords.some(kw => raw.includes(kw));

    const coverDensity = raw.includes('heavy') || raw.includes('dense') ? 0.12 : 0.08;
    const coverLimit = raw.includes('heavy') ? 10 : 6;

    let coverTags = ['cover', 'tactical', 'crate', 'barricade'];
    if (raw.includes('boulder') || raw.includes('rock') || raw.includes('mountain') || raw.includes('badlands') || raw.includes('ravine') || raw.includes('desert')) {
      coverTags = ['cover', 'rock', 'boulder', 'terrain'];
    } else if (raw.includes('coral') || raw.includes('seafloor') || raw.includes('benthic')) {
      coverTags = ['cover', 'coral', 'benthic', 'organic'];
    } else if (raw.includes('ice') || raw.includes('arctic') || raw.includes('frost') || raw.includes('permafrost')) {
      coverTags = ['cover', 'ice', 'permafrost', 'crystal'];
    } else if (raw.includes('forest') || raw.includes('tree') || raw.includes('wood') || raw.includes('moss')) {
      coverTags = ['cover', 'tree', 'foliage', 'moss'];
    }

    if (hasCover || raw.includes('derelict') || raw.includes('tactical') || raw.includes('bunker') || raw.includes('outpost') || raw.includes('lab') || raw.includes('badlands') || raw.includes('desert') || raw.includes('ravine') || raw.includes('seafloor') || raw.includes('arctic') || raw.includes('forest') || raw.includes('mountain')) {
      summary.push(`Injecting tactical cover: ${coverTags.join('/')} (density ${Math.round(coverDensity * 100)}%)`);
      execute_scripts.push({
        action: 'scatter_cover',
        query_tags: coverTags,
        zone: [zone[0] + 1, zone[1] + 1, zone[2] - 1, zone[3] - 1],
        density: coverDensity,
        limit: coverLimit,
        clearance: 1
      });
    }

    // 5. CLUTTER, TERMINALS & TECH DOODADS
    const clutterKeywords = ['clutter', 'debris', 'scrap', 'terminal', 'terminals', 'console', 'consoles', 'server', 'mainframe', 'computer', 'lab', 'research', 'medical', 'armory'];
    const hasClutter = clutterKeywords.some(kw => raw.includes(kw));

    let clutterTags = ['terminal', 'crate', 'clutter'];
    if (raw.includes('lab') || raw.includes('research') || raw.includes('medical')) {
      clutterTags = ['terminal', 'electronics', 'tactical'];
      execute_scripts.push({
        action: 'place_central',
        query_tags: ['terminal', 'tactical'],
        zone: [Math.floor(zone[0] + (zone[2] - zone[0]) * 0.25), Math.floor(zone[1] + (zone[3] - zone[1]) * 0.25), Math.floor(zone[0] + (zone[2] - zone[0]) * 0.75), Math.floor(zone[1] + (zone[3] - zone[1]) * 0.75)],
        clearance: 1
      });
    } else if (raw.includes('armory') || raw.includes('weapons')) {
      clutterTags = ['weapons', 'tactical', 'crate'];
    }

    if (hasClutter || execute_scripts.length < 3) {
      execute_scripts.push({
        action: 'scatter_clutter',
        query_tags: clutterTags,
        zone: [zone[0] + 2, zone[1] + 2, zone[2] - 2, zone[3] - 2],
        density: 0.06,
        limit: 5,
        clearance: 1
      });
    }

    // 6. HAZARDS ANALYSIS
    const hazardKeywords = ['plasma', 'acid', 'toxic', 'slime', 'radiation', 'hazard', 'leak', 'magma', 'fire', 'conduit', 'sparks', 'chasm', 'trench', 'crevasse', 'quicksand', 'geyser'];
    const hasHazards = hazardKeywords.some(kw => raw.includes(kw));

    let hazardType = 'plasma';
    if (raw.includes('acid')) hazardType = 'acid';
    else if (raw.includes('toxic') || raw.includes('slime')) hazardType = 'slime';
    else if (raw.includes('radiation')) hazardType = 'radiation';
    else if (raw.includes('fire') || raw.includes('magma')) hazardType = 'fire';
    else if (raw.includes('chasm') || raw.includes('crevasse') || raw.includes('ravine')) hazardType = 'chasm';
    else if (raw.includes('trench') || raw.includes('seafloor') || raw.includes('geyser')) hazardType = 'geyser';

    if (hasHazards) {
      summary.push(`Injecting environmental hazard: ${hazardType} anomaly`);
      execute_scripts.push({
        action: 'place_hazard',
        query_tags: [hazardType, 'hazard'],
        zone: [zone[0] + 3, zone[1] + 3, zone[2] - 3, zone[3] - 3],
        limit: raw.includes('heavy') ? 4 : 2
      });
    }

    // 7. ATMOSPHERE LIGHTING & PARTICLES
    let weather: 'none' | 'sparks' | 'smoke' | 'acid_rain' | 'spores' = 'none';
    if (raw.includes('plasma') || raw.includes('sparks') || raw.includes('electrical') || raw.includes('short-circuit') || lightAnimation === 'flicker') {
      weather = 'sparks';
    } else if (raw.includes('smoke') || raw.includes('fire') || raw.includes('burn') || raw.includes('charred') || raw.includes('desert') || raw.includes('badlands') || hasCarbonScoring) {
      weather = 'smoke';
    } else if (raw.includes('acid') || raw.includes('toxic') || raw.includes('chemical')) {
      weather = 'acid_rain';
    } else if (raw.includes('spores') || raw.includes('alien') || raw.includes('xenomoss') || raw.includes('moss') || raw.includes('seafloor') || raw.includes('benthic') || raw.includes('forest')) {
      weather = 'spores';
    }

    let ambient_color = '#071626';
    if (raw.includes('badlands') || raw.includes('canyon')) ambient_color = '#1a0d06';
    else if (raw.includes('desert') || raw.includes('dune')) ambient_color = '#1c1208';
    else if (raw.includes('ravine') || raw.includes('chasm') || raw.includes('rift')) ambient_color = '#020408';
    else if (raw.includes('seafloor') || raw.includes('benthic') || raw.includes('abyss')) ambient_color = '#021422';
    else if (raw.includes('arctic') || raw.includes('frost') || raw.includes('permafrost')) ambient_color = '#081a28';
    else if (raw.includes('forest') || raw.includes('jungle') || raw.includes('woodland')) ambient_color = '#021a12';
    else if (raw.includes('mountain') || raw.includes('alpine') || raw.includes('granite')) ambient_color = '#090e17';
    else if (lightColorName.includes('red') || raw.includes('emergency')) ambient_color = '#1c0a0a';
    else if (lightColorName.includes('amber')) ambient_color = '#17120a';
    else if (hazardType === 'acid' || raw.includes('toxic')) ambient_color = '#052e16';

    const atmosphere: AtmosphereLightingDirective = {
      ambient_color,
      weather
    };

    summary.push(`Atmosphere: weather=${weather}, ambient=${ambient_color}`);

    return {
      payload: {
        atmosphere_lighting: atmosphere,
        execute_scripts
      },
      detectedFeatures: {
        lights: {
          detected: hasLights,
          color: lightColor,
          colorName: lightColorName,
          animation: lightAnimation,
          radius: lightRadius,
          intensity: lightIntensity
        },
        doors: {
          detected: hasDoors,
          doorType,
          isBarricaded,
          isLocked
        },
        carbonScoring: {
          detected: hasCarbonScoring,
          decalType,
          limit: scorchLimit
        },
        cover: {
          detected: hasCover,
          tags: coverTags,
          density: coverDensity,
          limit: coverLimit
        },
        clutter: {
          detected: hasClutter,
          tags: clutterTags,
          density: 0.06,
          limit: 5
        },
        hazards: {
          detected: hasHazards,
          hazardType,
          tags: [hazardType, 'hazard'],
          limit: 3
        },
        atmosphere
      },
      summary
    };
  }
}
