/**
 * Canonical Movement Types, Modes, Paces, and Rules for Tangent SF RP
 * Sourced from Omnicortex Movement Codex & Tactical Combat System
 */

export const MOVEMENT_MODES = {
  ground: {
    id: "ground",
    name: "Ground Movement",
    baseMultiplier: 1.0,
    mediumBaseSpeed: 30,
    description: "The baseline mode of locomotion across terrestrial surfaces.",
    paces: {
      walk: { id: "walk", name: "Walk", multiplier: 1.0, speed: 30, actionMod: 0, checkDC: 0, checkSkill: "None", stealthBonus: 0, description: "Default baseline walking pace." },
      jog: { id: "jog", name: "Jog", multiplier: 2.0, speed: 60, actionMod: -2, checkDC: 0, checkSkill: "None", stealthBonus: 0, description: "Hurried pace with minor subtlety penalty." },
      running: { id: "running", name: "Running", multiplier: 4.0, featureMultiplier: 5.0, speed: 120, actionMod: -4, checkDC: 10, checkSkill: "Athletics", stealthBonus: 0, description: "Fast pace requiring Athletics checks to avoid fatigue." },
      sprinting: { id: "sprinting", name: "Sprinting", multiplier: 6.0, featureMultiplier: 7.0, speed: 180, actionMod: -8, checkDC: 15, checkSkill: "Athletics", stealthBonus: 0, description: "Maximum sprint requiring demanding Athletics checks." },
      crawl: { id: "crawl", name: "Crawl", multiplier: 0.5, speed: 15, actionMod: 0, checkDC: 0, checkSkill: "None", stealthBonus: 2, condition: "Prone", description: "Low-profile crawling with +2 stealth bonus." },
      slow_crawl: { id: "slow_crawl", name: "Slow Crawl", multiplier: 0.25, speed: 7.5, actionMod: 0, checkDC: 0, checkSkill: "None", stealthBonus: 4, condition: "Prone", description: "Very slow crawl with +4 stealth bonus." }
    }
  },
  flying: {
    id: "flying",
    name: "Flying Movement",
    baseMultiplier: 2.0,
    mediumBaseSpeed: 60,
    description: "Three-dimensional aerial locomotion offering variable tactical maneuvers.",
    paces: {
      flight: { id: "flight", name: "Flight", multiplier: 1.0, speed: 60, actionMod: 0, checkDC: 0, checkSkill: "None", description: "Standard flying speed (double walking speed)." },
      sail: { id: "sail", name: "Sail", multiplier: 2.0, speed: 120, actionMod: -2, checkDC: 0, checkSkill: "None", description: "Fast cruising speed for closing distances." },
      surge: { id: "surge", name: "Surge / Soar", multiplier: 4.0, featureMultiplier: 5.0, speed: 240, actionMod: -4, checkDC: 10, checkSkill: "Acrobatics", description: "Rapid chase speed requiring Acrobatics checks." },
      diving: { id: "diving", name: "Diving", multiplier: 2.0, featureMultiplier: 9.0, speed: 480, actionMod: -4, checkDC: 15, checkSkill: "Acrobatics", description: "High-speed descent maneuver for surprise strikes." },
      gliding: { id: "gliding", name: "Gliding", multiplier: 1.0, speed: 60, actionMod: 2, checkDC: 10, checkSkill: "Acrobatics", dropRate: "1ft fall per 5ft horiz", description: "Controlled descent gaining +2 bonus to actions." },
      hover: { id: "hover", name: "Hover / Controlled Descent", multiplier: 0.5, speed: 30, actionMod: 0, checkDC: 15, checkSkill: "Acrobatics", description: "Stationary or slow flight enabling precise observation." }
    }
  },
  swimming: {
    id: "swimming",
    name: "Swimming Movement",
    baseMultiplier: 0.5,
    mediumBaseSpeed: 15,
    description: "Aquatic propulsion through liquid environments.",
    paces: {
      swimming: { id: "swimming", name: "Swimming", multiplier: 1.0, featureMultiplier: 2.0, speed: 15, actionMod: 0, checkDC: 0, checkSkill: "None", description: "Standard swim pace (half walking speed)." },
      glide: { id: "glide", name: "Glide", multiplier: 2.0, featureMultiplier: 4.0, speed: 30, actionMod: -2, checkDC: 10, checkSkill: "Athletics (Swimming)", description: "Hurried swim pace." },
      stroke: { id: "stroke", name: "Stroke", multiplier: 4.0, featureMultiplier: 6.0, speed: 60, actionMod: -4, checkDC: 15, checkSkill: "Athletics (Swimming)", description: "Fast power stroke swim pace." },
      treading: { id: "treading", name: "Treading", multiplier: 0.5, speed: 7.5, actionMod: 2, checkDC: 5, checkSkill: "Athletics (Swimming)", description: "Surface treading conserving energy." }
    }
  },
  climbing: {
    id: "climbing",
    name: "Climbing Movement",
    baseMultiplier: 0.5,
    mediumBaseSpeed: 15,
    description: "Vertical ascent and descent across scalable terrain.",
    paces: {
      easy: { id: "easy", name: "Easy Climb (DC 10+)", multiplier: 0.5, speed: 15, checkDC: 10, checkSkill: "Athletics (Climbing)", description: "Half walking speed." },
      moderate: { id: "moderate", name: "Moderate Climb (DC 15+)", multiplier: 0.25, speed: 7.5, checkDC: 15, checkSkill: "Athletics (Climbing)", description: "Quarter walking speed." },
      difficult: { id: "difficult", name: "Difficult Climb (DC 20+)", multiplier: 0.1, speed: 3, checkDC: 20, checkSkill: "Athletics (Climbing)", description: "Tenth walking speed." },
      scaling: { id: "scaling", name: "Scaling", multiplier: 1.0, featureMultiplier: 2.0, speed: 30, actionMod: -2, checkDC: 5, checkSkill: "Athletics (Climbing)", checkPenalty: -5, description: "Ascending at full base walking speed." },
      fast_ascent: { id: "fast_ascent", name: "Fast Ascent", multiplier: 2.0, featureMultiplier: 3.0, speed: 60, actionMod: -4, checkDC: 10, checkSkill: "Athletics (Climbing)", checkPenalty: -10, description: "Ascending at double speed." },
      fast_descent: { id: "fast_descent", name: "Fast Descent", multiplier: 4.0, featureMultiplier: 6.0, speed: 120, actionMod: -4, checkDC: 20, checkSkill: "Athletics (Climbing)", checkPenalty: -10, description: "Rapid uninjured vertical descent." }
    }
  },
  burrowing: {
    id: "burrowing",
    name: "Burrowing Movement",
    baseMultiplier: 0.25,
    mediumBaseSpeed: 7.5,
    description: "Subterranean displacement through soil, sand, or mineral substrate.",
    paces: {
      burrowing: { id: "burrowing", name: "Burrowing", multiplier: 1.0, speed: 7.5, actionMod: 0, description: "Standard burrowing speed (quarter walking speed)." },
      tunneling: { id: "tunneling", name: "Tunneling", multiplier: 2.0, speed: 15, actionMod: -2, description: "Rapid tunnel excavation." },
      excavation: { id: "excavation", name: "Excavation", multiplier: 0.5, speed: 3.75, actionMod: 0, description: "Creating chambers and reinforced subterranean spaces." }
    }
  }
};

export const MOVEMENT_FATIGUE_CONFIG = {
  combatSprintRoundsTrigger: 5,
  hurriedTravelMinutesTrigger: 10,
  fortitudeCheckDC: 15,
  vitalityDamageOnFailure: 5,
  damagePerMissOfFive: 1,
  exhaustionHealthDamage: 2,
  exhaustionDebuff: {
    checkPenalty: -2,
    speedMultiplier: 0.5,
    recovery: "Light Rest (Nap)"
  }
};

export const FLYING_COMBAT_CONFIG = {
  highGroundStrikeBonus: 2,
  highGroundCritBonus: 2,
  flightStages: ["Flight", "Sail", "Surge", "Dive"],
  ramDicePerStage: 1,
  ramImpactDamagePer10Ft: 1
};

export const SPECIES_MOVEMENT_BASE_MODES = [
  { id: 'normal', name: 'Normal Speed', bp: 0, speed: 30, category: 'Mode', description: 'Base speed of 30 feet. Determines speed of other modes.' },
  { id: 'climber', name: 'Climber', bp: 2, speed: 30, category: 'Mode', description: 'Base Climb Speed 30, and gain the +5 racial bonus on climbing checks.' },
  { id: 'gliding', name: 'Gliding Wings', bp: 1, speed: 30, category: 'Mode', description: 'While in midair, move 5ft horizontal for every 1ft fall. Speed 30ft/rnd (60 diving).' },
  { id: 'swim', name: 'Swim', bp: 2, speed: 30, category: 'Mode', description: 'Swim speed 30 feet. Gain +5 racial bonus on Swim checks.' },
  { id: 'burrow', name: 'Burrow', bp: 2, speed: 20, category: 'Mode', description: 'Base Burrow Speed 20.' },
  { id: 'flight_basic', name: 'Basic Flight', bp: 2, speed: 30, category: 'Mode', description: 'Base Fly Speed 30 (Poor Maneuverability).' }
];

export const SPECIES_MOVEMENT_MODIFICATIONS = [
  { id: 'very_fast', name: 'Very Fast', bp: 4, speed: 50, speedMod: 20, isExclusive: true, category: 'Modification', description: 'Base Speed +20 feet. *' },
  { id: 'fast', name: 'Fast', bp: 2, speed: 40, speedMod: 10, isExclusive: true, category: 'Modification', description: 'Base Speed +10 feet. *' },
  { id: 'slow', name: 'Slow (Disadvantage)', bp: -2, refundBP: 2, speed: 20, speedMod: -10, isExclusive: true, isDisadvantage: true, category: 'Modification', description: 'Base Speed -10 feet. (BP Gain) *' },
  { id: 'ponderous', name: 'Ponderous (Disadvantage)', bp: -4, refundBP: 4, speed: 10, speedMod: -20, isExclusive: true, isDisadvantage: true, category: 'Modification', description: 'Base Speed -20 feet. (BP Gain) *' },
  { id: 'flight_improved', name: 'Improved Flight Speed', bp: 1, speedMod: 10, isRanked: true, category: 'Modification', description: 'Increases base flight speed by 10 feet. Ranked.' },
  { id: 'flight_maneuver', name: 'Improved Maneuverability', bp: 1, isRanked: true, category: 'Modification', description: 'Maneuverability improves by 1 step (Clumsy > Poor > Average > Good > Perfect). Ranked.' },
  { id: 'strong_flyer', name: 'Strong Flyer', bp: 2, category: 'Modification', description: 'Increase the Size category multiplier by 1 for Flying Speed.' },
  { id: 'hauler', name: 'Hauler', bp: 1, category: 'Modification', description: 'Not encumbered by carrying a Heavy Load.' },
  { id: 'marcher', name: 'Marcher', bp: 1, category: 'Modification', description: 'Fatigued ½ when moving at a regular pace.' },
  { id: 'terrain_movement', name: 'Terrain Movement', bp: 1, category: 'Modification', description: 'Move through naturally difficult terrain (specific type) at normal speed.' },
  { id: 'leaper', name: 'Leaper', bp: 1, category: 'Modification', description: 'Always considered to have a running start when making Jump checks.' },
  { id: 'mountaineer', name: 'Mountaineer', bp: 1, category: 'Modification', description: 'Immune to altitude sickness, no defense loss on narrow/slippery surfaces.' },
  { id: 'sprinter', name: 'Sprinter', bp: 1, speedMod: 10, isRanked: true, category: 'Modification', description: 'Gain +10 foot racial bonus to speed when running. Ranked.' }
];

export const SPECIES_MOVEMENT_MODES = [
  ...SPECIES_MOVEMENT_BASE_MODES,
  ...SPECIES_MOVEMENT_MODIFICATIONS
];
