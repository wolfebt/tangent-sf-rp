/**
 * @file modifierService.ts
 * @description Service for managing temporary and situational modifiers across the Story Gallery,
 * ADE, and the Tactical VTT Stage. Provides factories, aura resolution, round ticking, and
 * effect aggregation for combat, skill, tech, and metaphysic checks.
 */

import { v4 as uuidv4 } from 'uuid';
import type { StoryModifier, ModifierCategory, ModifierSourceType, ModifierTargetScope, ModifierEffects } from '../types/storyModifier';

export const MODIFIER_PRESETS: Array<Omit<StoryModifier, 'id' | 'isActive'>> = [
  // Metaphysic Presets
  {
    name: 'Ley-Line Confluence',
    category: 'metaphysic' as ModifierCategory,
    sourceType: 'location' as ModifierSourceType,
    description: 'Resonant psychic intersection amplifies Metaphysics invocations while destabilizing tech.',
    isTemporary: false,
    targetScope: 'all' as ModifierTargetScope,
    effects: {
      metaphysicMod: 2,
      techMod: -1,
      customRuleText: 'Invocations gain Advantage or +2 to Attunement checks.'
    }
  },
  {
    name: 'Null-Field Matrix',
    category: 'metaphysic' as ModifierCategory,
    sourceType: 'item' as ModifierSourceType,
    description: 'Electromagnetic suppression field dampens dimensional and psychic resonance.',
    isTemporary: false,
    radiusFt: 30,
    targetScope: 'zone' as ModifierTargetScope,
    effects: {
      metaphysicMod: -4,
      defenseMod: 1,
      customRuleText: 'All Invocations and awakened abilities suffer -4 penalty within 30ft radius.'
    }
  },
  {
    name: 'Warp Flux Static',
    category: 'metaphysic' as ModifierCategory,
    sourceType: 'person' as ModifierSourceType,
    description: 'Psionic entity radiates unstable dimensional noise affecting all adjacent minds.',
    isTemporary: true,
    durationRounds: 3,
    remainingRounds: 3,
    targetScope: 'adversaries' as ModifierTargetScope,
    effects: {
      metaphysicMod: -2,
      skillMods: { 'Perception': -2, 'Willpower': -2 },
      customRuleText: 'Adversaries suffer -2 to mental and metaphysic saves.'
    }
  },

  // Tech Presets
  {
    name: 'EMP Burst Fallout',
    category: 'tech' as ModifierCategory,
    sourceType: 'location' as ModifierSourceType,
    description: 'Ionizing electromagnetic pulse impairs sensors, comms, and active cyberware.',
    isTemporary: true,
    durationRounds: 3,
    remainingRounds: 3,
    targetScope: 'all' as ModifierTargetScope,
    effects: {
      techMod: -3,
      attackMod: -1,
      customRuleText: 'Hacking, drones, and optic targeting suffer -3 penalty. Laser/Plasma sights disabled.'
    }
  },
  {
    name: 'Smart-Link Network Lock',
    category: 'tech' as ModifierCategory,
    sourceType: 'person' as ModifierSourceType,
    description: 'Tactical coordinator feeds real-time ballistics telemetry to allied combatants.',
    isTemporary: false,
    targetScope: 'allies' as ModifierTargetScope,
    effects: {
      attackMod: 2,
      techMod: 1,
      customRuleText: 'Allies gain +2 Strike to ranged attacks with smart-linked weapons.'
    }
  },
  {
    name: 'Overclocked Shield Generator',
    category: 'tech' as ModifierCategory,
    sourceType: 'item' as ModifierSourceType,
    description: 'Supercharged kinetic deflection barrier active for brief combat burst.',
    isTemporary: true,
    durationRounds: 2,
    remainingRounds: 2,
    targetScope: 'token' as ModifierTargetScope,
    effects: {
      defenseMod: 4,
      speedMod: -10,
      customRuleText: '+4 Defense DC against ranged fire; user movement reduced by 10ft.'
    }
  },

  // Environmental & Tactical Presets
  {
    name: 'Zero-G Inertia Drift',
    category: 'environmental' as ModifierCategory,
    sourceType: 'location' as ModifierSourceType,
    description: 'Weightless combat environment. Unanchored kinetic fire causes recoil pushback.',
    isTemporary: false,
    targetScope: 'all' as ModifierTargetScope,
    effects: {
      attackMod: -2,
      speedMod: 10,
      skillMods: { 'Athletics': -2, 'Acrobatics': 2 },
      customRuleText: 'Kinetic projectile attacks suffer -2 without magnetic boot anchor.'
    }
  },
  {
    name: 'Dense Smoke & Toxic Fog',
    category: 'environmental' as ModifierCategory,
    sourceType: 'location' as ModifierSourceType,
    description: 'Heavy chemical aerosol obscures visual targeting and burns respiratory pathways.',
    isTemporary: true,
    durationRounds: 4,
    remainingRounds: 4,
    targetScope: 'all' as ModifierTargetScope,
    effects: {
      attackMod: -3,
      defenseMod: 2,
      skillMods: { 'Perception': -4 },
      inflictsCondition: 'Poisoned',
      customRuleText: 'Grants Concealment (+2 DEF). Ranged attacks suffer -3 unless Thermal Optics equipped.'
    }
  },
  {
    name: "Commander's Tactical Aura",
    category: 'tactical' as ModifierCategory,
    sourceType: 'person' as ModifierSourceType,
    description: 'Veteran operative coordinates allied fire lanes and calls tactical targets.',
    isTemporary: false,
    radiusFt: 40,
    targetScope: 'allies' as ModifierTargetScope,
    effects: {
      attackMod: 1,
      damageMod: 2,
      customRuleText: 'Allies within 40ft gain +1 to attack rolls and +2 damage.'
    }
  }
];

class ModifierManagerService {
  /**
   * Instantiates a fully structured StoryModifier with defaults.
   */
  createModifier(data: Partial<StoryModifier> = {}): StoryModifier {
    const isTemp = data.isTemporary ?? (data.durationRounds ? true : false);
    const duration = data.durationRounds ?? (isTemp ? 3 : null);

    return {
      id: data.id || `mod_${uuidv4().slice(0, 8)}`,
      name: data.name || 'New Situational Modifier',
      category: data.category || 'tactical',
      sourceType: data.sourceType || 'story',
      sourceId: data.sourceId,
      sourceName: data.sourceName,
      description: data.description || 'Active situational modifier from the Story Gallery.',
      isTemporary: isTemp,
      durationRounds: duration,
      remainingRounds: data.remainingRounds ?? duration,
      targetScope: data.targetScope || 'all',
      targetTokenId: data.targetTokenId,
      radiusFt: data.radiusFt,
      isActive: data.isActive ?? true,
      effects: {
        attackMod: data.effects?.attackMod || 0,
        defenseMod: data.effects?.defenseMod || 0,
        damageMod: data.effects?.damageMod || 0,
        speedMod: data.effects?.speedMod || 0,
        metaphysicMod: data.effects?.metaphysicMod || 0,
        techMod: data.effects?.techMod || 0,
        skillMods: data.effects?.skillMods ? { ...data.effects.skillMods } : {},
        inflictsCondition: data.effects?.inflictsCondition || null,
        customRuleText: data.effects?.customRuleText || ''
      }
    };
  }

  /**
   * Derives a situational modifier from a Person in the Gallery (e.g. Commander, Psion, Specialist).
   */
  createModifierFromPerson(persona: any, customProps: Partial<StoryModifier> = {}): StoryModifier {
    const pName = persona.fields?.['char-name'] || persona.title || 'Operative';
    const role = persona.fields?.mcmRole?.toLowerCase() || 'commander';
    const isPsion = persona.fields?.magicLevel > 0 || persona.fields?.invocations;

    let defaultPreset = MODIFIER_PRESETS.find(p => p.name === "Commander's Tactical Aura") || MODIFIER_PRESETS[0];
    if (isPsion) {
      defaultPreset = MODIFIER_PRESETS.find(p => p.name === 'Warp Flux Static') || defaultPreset;
    } else if (role.includes('slicer') || role.includes('tech')) {
      defaultPreset = MODIFIER_PRESETS.find(p => p.name === 'Smart-Link Network Lock') || defaultPreset;
    }

    return this.createModifier({
      ...defaultPreset,
      name: `${pName}'s ${defaultPreset.name}`,
      sourceType: 'person',
      sourceId: persona.id,
      sourceName: pName,
      description: `Situational field generated by ${pName}. ${defaultPreset.description}`,
      ...customProps
    });
  }

  /**
   * Derives a situational modifier from an Item in the Gallery (e.g. Relic, Device, Tech).
   */
  createModifierFromItem(item: any, customProps: Partial<StoryModifier> = {}): StoryModifier {
    const iName = item.title || item.name || 'Artifact Device';
    const isMetaphysic = (item.fields?.properties || '').toLowerCase().includes('magic') || 
                         (item.fields?.tags || '').toLowerCase().includes('psi');

    const defaultPreset = isMetaphysic 
      ? (MODIFIER_PRESETS.find(p => p.name === 'Null-Field Matrix') || MODIFIER_PRESETS[1])
      : (MODIFIER_PRESETS.find(p => p.name === 'Overclocked Shield Generator') || MODIFIER_PRESETS[0]);

    return this.createModifier({
      ...defaultPreset,
      name: `${iName} Active Field`,
      sourceType: 'item',
      sourceId: item.id,
      sourceName: iName,
      description: `Active field emanating from ${iName}. ${defaultPreset.description}`,
      ...customProps
    });
  }

  /**
   * Derives an environmental or situational modifier from a Location / Map in the Gallery.
   */
  createModifierFromLocation(mapOrLocation: any, customProps: Partial<StoryModifier> = {}): StoryModifier {
    const locName = mapOrLocation.title || mapOrLocation.name || 'Tactical Sector';
    const defaultPreset = MODIFIER_PRESETS.find(p => p.name === 'Zero-G Inertia Drift') || MODIFIER_PRESETS[0];

    return this.createModifier({
      ...defaultPreset,
      name: `${locName} Environment`,
      sourceType: 'location',
      sourceId: mapOrLocation.id,
      sourceName: locName,
      description: `Environmental zone condition across ${locName}. ${defaultPreset.description}`,
      ...customProps
    });
  }

  /**
   * Advances combat round by 1, ticking down temporary modifiers.
   */
  tickModifiers(modifiers: StoryModifier[]): {
    updatedModifiers: StoryModifier[];
    expiredModifiers: StoryModifier[];
  } {
    const updatedModifiers: StoryModifier[] = [];
    const expiredModifiers: StoryModifier[] = [];

    modifiers.forEach((mod) => {
      if (!mod.isActive) {
        updatedModifiers.push(mod);
        return;
      }

      if (mod.isTemporary && typeof mod.remainingRounds === 'number') {
        const nextRounds = mod.remainingRounds - 1;
        if (nextRounds <= 0) {
          expiredModifiers.push({ ...mod, remainingRounds: 0, isActive: false });
        } else {
          updatedModifiers.push({ ...mod, remainingRounds: nextRounds });
        }
      } else {
        updatedModifiers.push(mod);
      }
    });

    return { updatedModifiers, expiredModifiers };
  }

  /**
   * Filters modifiers that are currently active for a specific combat check.
   */
  filterActiveModifiers(
    modifiers: StoryModifier[] = [],
    filter?: {
      scope?: ModifierTargetScope;
      category?: ModifierCategory;
      targetTokenId?: string;
    }
  ): StoryModifier[] {
    return (modifiers || []).filter((mod) => {
      if (!mod.isActive) return false;
      if (filter?.category && mod.category !== filter.category) return false;
      if (filter?.scope && mod.targetScope !== 'all' && mod.targetScope !== filter.scope) {
        return false;
      }
      if (filter?.targetTokenId && mod.targetTokenId && mod.targetTokenId !== filter.targetTokenId) {
        return false;
      }
      return true;
    });
  }

  /**
   * Aggregates the net numerical impacts of multiple active modifiers.
   */
  aggregateModifierEffects(modifiers: StoryModifier[]): ModifierEffects & { breakdowns: string[] } {
    const net: ModifierEffects = {
      attackMod: 0,
      defenseMod: 0,
      damageMod: 0,
      speedMod: 0,
      metaphysicMod: 0,
      techMod: 0,
      skillMods: {},
      inflictsCondition: null,
      customRuleText: ''
    };
    const breakdowns: string[] = [];

    modifiers.forEach((mod) => {
      if (!mod.isActive) return;
      const eff = mod.effects || {};

      if (eff.attackMod) {
        net.attackMod = (net.attackMod || 0) + eff.attackMod;
        breakdowns.push(`${mod.name} (${eff.attackMod > 0 ? `+${eff.attackMod}` : eff.attackMod} ATK)`);
      }
      if (eff.defenseMod) {
        net.defenseMod = (net.defenseMod || 0) + eff.defenseMod;
        breakdowns.push(`${mod.name} (${eff.defenseMod > 0 ? `+${eff.defenseMod}` : eff.defenseMod} DEF)`);
      }
      if (eff.damageMod) {
        net.damageMod = (net.damageMod || 0) + eff.damageMod;
        breakdowns.push(`${mod.name} (${eff.damageMod > 0 ? `+${eff.damageMod}` : eff.damageMod} DMG)`);
      }
      if (eff.metaphysicMod) {
        net.metaphysicMod = (net.metaphysicMod || 0) + eff.metaphysicMod;
        breakdowns.push(`${mod.name} (${eff.metaphysicMod > 0 ? `+${eff.metaphysicMod}` : eff.metaphysicMod} METAPHYSIC)`);
      }
      if (eff.techMod) {
        net.techMod = (net.techMod || 0) + eff.techMod;
        breakdowns.push(`${mod.name} (${eff.techMod > 0 ? `+${eff.techMod}` : eff.techMod} TECH)`);
      }
      if (eff.speedMod) {
        net.speedMod = (net.speedMod || 0) + eff.speedMod;
      }
      if (eff.skillMods) {
        Object.entries(eff.skillMods).forEach(([skill, val]) => {
          net.skillMods = net.skillMods || {};
          net.skillMods[skill] = (net.skillMods[skill] || 0) + val;
          breakdowns.push(`${mod.name} (${val > 0 ? `+${val}` : val} ${skill})`);
        });
      }
      if (eff.inflictsCondition && !net.inflictsCondition) {
        net.inflictsCondition = eff.inflictsCondition;
      }
      if (eff.customRuleText) {
        net.customRuleText = net.customRuleText ? `${net.customRuleText} | ${eff.customRuleText}` : eff.customRuleText;
      }
    });

    return {
      ...net,
      breakdowns
    };
  }
}

export const ModifierService = new ModifierManagerService();
export default ModifierService;
