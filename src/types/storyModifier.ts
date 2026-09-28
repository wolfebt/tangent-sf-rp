/**
 * @file storyModifier.ts
 * @description Type definitions for Story Gallery Temporary & Situational Modifiers.
 * Modifiers can be derived from Persons, Items, or Locations/Maps within the story gallery,
 * applying metaphysic, tech, environmental, tactical, or status adjustments to rules and combat.
 */

export type ModifierCategory = 'metaphysic' | 'tech' | 'environmental' | 'tactical' | 'status';
export type ModifierSourceType = 'person' | 'item' | 'location' | 'story' | 'custom';
export type ModifierTargetScope = 'all' | 'allies' | 'adversaries' | 'zone' | 'token';

export interface ModifierEffects {
  attackMod?: number;       // e.g. +2 Strike, -5 Ranged
  defenseMod?: number;      // e.g. +2 Cover, -4 Stunned
  damageMod?: number;       // flat damage bonus/penalty
  speedMod?: number;        // movement speed change in ft
  metaphysicMod?: number;   // bonus/penalty to Metaphysics / Invocations checks
  techMod?: number;         // bonus/penalty to Hacking, Cybernetics & Tech checks
  skillMods?: Record<string, number>; // e.g. { "Perception": -2, "Stealth": +3 }
  inflictsCondition?: string | null;  // e.g. "Bleeding", "Burning", "Stunned"
  customRuleText?: string;  // descriptive rule text
}

export interface StoryModifier {
  id: string;
  name: string;
  category: ModifierCategory;
  sourceType: ModifierSourceType;
  sourceId?: string;      // ID of the Persona, Item, Map, or Scene in the Gallery
  sourceName?: string;    // Display name of the source entity
  description: string;
  isTemporary: boolean;   // true = tick down each combat round; false = situational/persistent
  durationRounds?: number | null;
  remainingRounds?: number | null;
  targetScope: ModifierTargetScope;
  targetTokenId?: string; // Optional: bound to specific token
  radiusFt?: number;      // Optional: spatial aura in feet (e.g. 30ft aura)
  isActive: boolean;      // Toggle state: whether modifier is currently active on the stage
  effects: ModifierEffects;
}
