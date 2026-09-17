import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const omnicortexRoot = path.join(projectRoot, 'src', 'data', 'omnicortex');
const movementDir = path.join(omnicortexRoot, 'species_movement');
const movementJsPath = path.join(projectRoot, 'src', 'data', 'speciesMovementData.js');
const jsonBackupDir = path.join(projectRoot, 'docs', 'recommendations and revison plans', 'omnicortex json', 'current collection');

console.log('================================================================');
console.log('STARTING MOVEMENT REORGANIZATION & ADDITIVE SPEED ADJUSTER SETUP');
console.log('================================================================');

// Embedded Movement Stages Descriptions
const STAGES_DOC = {
  Ground: `\n\n### Tactical Movement Stages (Ground)\n- **Walk**: 1x Base (30 ft/rd). Default baseline movement pace for all ground locomotion.\n- **Jog**: 2x Base (60 ft/rd). Hurried pace with a -2 penalty to subtlety, stealth, or precision.\n- **Running**: 4x Base (120 ft/rd). Fast running pace with a -4 penalty to subtle actions; requires Athletics check (CR 10+) each minute.\n- **Sprinting**: 6x Base (180 ft/rd). Maximum land sprint with a -8 penalty to subtle actions; requires Athletics check (CR 15+) each minute.\n- **Crawl**: 1/2x Base (15 ft/rd). Low-profile crawl; grants +2 bonus to stealth; inflicts Prone condition.\n- **Slow Crawl**: 1/4x Base (7.5 ft/rd). Deliberate stealth crawl; grants +4 bonus to stealth; inflicts Prone condition.`,
  Flying: `\n\n### Tactical Movement Stages (Flying)\n- **Flight**: 1x Fly (60 ft/rd). Standard aerial cruise pace.\n- **Sail**: 2x Fly (120 ft/rd). Hurried cruise pace with a -2 penalty to subtle actions.\n- **Surge / Soar**: 4x Fly (240 ft/rd). Maximum aerial sprint with a -4 penalty; requires Acrobatics check (CR 10+) each minute.\n- **Diving**: 2x Current Speed (up to 480+ ft). High-speed tactical descent with a -4 penalty; requires Acrobatics check (CR 15+).\n- **Gliding**: 1x Fly (60 ft horiz, drops 1 ft per 5 ft traveled). Unpowered aerodynamic glide; grants +2 bonus to aerial actions; Acrobatics check (CR 10+).\n- **Hover / Controlled Descent**: 1/2 Fly or less (30 ft or static). Stationary hover or slow descent enabling stable observation; Acrobatics check (CR 15+).`,
  Swimming: `\n\n### Tactical Movement Stages (Swimming)\n- **Swimming**: 1x Swim (15 ft/rd baseline, 30 ft aquatic). Standard cruise swim pace.\n- **Glide**: 2x Swim (30 ft/rd baseline, 60 ft aquatic). Hurried swim stroke with a -2 penalty to stealth; Athletics (Swim) CR 10+.\n- **Stroke**: 4x Swim (60 ft/rd baseline, 120 ft aquatic). Maximum power stroke sprint with a -4 penalty; Athletics (Swim) CR 15+.\n- **Treading**: 1/2 Swim or less (7.5 ft/rd). Conserves stamina; grants +2 bonus to concentration; Athletics (Swim) CR 5+.`,
  Climbing: `\n\n### Tactical Movement Stages (Climbing)\n- **Climbing**: 1/2 Walk (15 ft/rd baseline, 30 ft innate). Standard vertical ascent/descent pace. Easy (CR 10+), Moderate (CR 15+), Difficult (CR 20+).\n- **Scaling**: 1x Walk (30 ft/rd). Rapid surface scaling with a -2 penalty to actions; Athletics (Climb) at -5 penalty.\n- **Fast Ascent**: 2x Walk (60 ft/rd). Vertical sprint with a -4 penalty; Athletics (Climb) at -10 penalty.\n- **Fast Descent**: 4x Walk (120 ft/rd). Rapid controlled vertical slide or abseil descent with a -4 penalty; CR 20 Athletics (Climb) or -10 penalty.`,
  Burrowing: `\n\n### Tactical Movement Stages (Burrowing)\n- **Burrowing**: 1/4 Walk (7.5 ft/rd baseline, 20 ft innate). Standard subterranean displacement through soil, sand, or loose substrate.\n- **Tunneling**: 2x Burrow (15 ft/rd baseline, 40 ft innate). Rapid subterranean tunnel excavation with a -2 penalty to subtlety.\n- **Excavation**: 1/8 Walk (3.75 ft/rd baseline, 10 ft innate). Reinforced excavation for subterranean bunkers, chambers, or fortifications.`,
  Flicker: `\n\n### Tactical Movement Stages (Flicker)\n- **Flicker**: 1x Base (30 ft/rd). Instant line-of-sight quantum phase step without traversing physical intervening space or provoking opportunity attacks.\n- **Rush**: Up to 2x Base (60 ft/rd). Extended emergency phase surge; requires an Endurance / Stamina check (CR 15+) to avoid fatigue.`
};

// 1. Basic Movement Abilities (granting a movement mode: walking, gliding, basic swimming, basic climbing, etc.)
const BASIC_MOVEMENT_MODES = [
  {
    id: 'species_movement-bipedal',
    name: 'Bipedal Locomotion',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Ground',
    type: 'Ground',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Standard upright two-legged locomotion. Baseline walking speed of 30 ft per combat round (6 seconds).' + STAGES_DOC.Ground
  },
  {
    id: 'species_movement-quadruped',
    name: 'Quadrupedal Locomotion',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Ground',
    type: 'Ground',
    base_speed: 40,
    speed: 40,
    bp: 0,
    description: 'Four-legged locomotion providing natural stability (+4 vs trip/knockdown) and enhanced baseline ground speed of 40 ft/round.' + STAGES_DOC.Ground
  },
  {
    id: 'species_movement-slithering',
    name: 'Serpentine Slithering',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Ground',
    type: 'Ground',
    base_speed: 25,
    speed: 25,
    bp: 0,
    description: 'Limbless serpentine or slug locomotion. Baseline speed of 25 ft/round; resilient against trip checks and traverses narrow gaps easily.' + STAGES_DOC.Ground
  },
  {
    id: 'species_movement-treads',
    name: 'Treads & Tracks',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Ground',
    type: 'Mechanical',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Continuous caterpillar tracks or rolling hub treads for synthetic chassis. Immune to difficult rough terrain; base speed 30 ft/round.' + STAGES_DOC.Ground
  },
  {
    id: 'movement-normal-speed',
    name: 'Normal Speed (Baseline 30 ft)',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Ground',
    type: 'Ground',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Standard baseline speed of 30 feet. Determines derived speed of all other locomotion modes.' + STAGES_DOC.Ground
  },
  {
    id: 'species_movement-glide',
    name: 'Gliding',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Flying',
    type: 'Flying',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Patagial membranes or gliding sails. Moves 30 ft/round horizontally while descending 1 ft for every 5 ft traveled.' + STAGES_DOC.Flying
  },
  {
    id: 'movement-gliding-wings',
    name: 'Gliding Wings',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Flying',
    type: 'Flying',
    base_speed: 30,
    speed: 30,
    bp: 1,
    description: 'Deployable aerodynamic wing membranes. While airborne, glides at 30 ft/round (60 ft/round when diving).' + STAGES_DOC.Flying
  },
  {
    id: 'movement-swimming',
    name: 'Basic Swimming',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Swimming',
    type: 'Swimming',
    base_speed: 15,
    speed: 15,
    bp: 0,
    description: 'Baseline swimming speed for non-aquatic species, moving at 15 ft/round (1/2 ground walking speed).' + STAGES_DOC.Swimming
  },
  {
    id: 'movement-climbing',
    name: 'Basic Climbing',
    category: 'species_movement',
    classification: 'basic',
    movement_tier: 'basic',
    target_mode: 'Climbing',
    type: 'Climbing',
    base_speed: 15,
    speed: 15,
    bp: 0,
    description: 'Baseline climbing speed for standard humanoids, ascending at 15 ft/round (1/2 ground walking speed).' + STAGES_DOC.Climbing
  }
];

// 2. Advanced Movement Abilities (full capability of flying, innate adaptation such as climbing, swimming, true flight, burrowing, flicker, etc.)
const ADVANCED_MOVEMENT_MODES = [
  {
    id: 'species_movement-flight',
    name: 'True Flight',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Flying',
    type: 'Flying',
    base_speed: 60,
    speed: 60,
    bp: 0,
    description: 'Aerial wings, antigrav impellers, or metaphysical levitation. Base flight speed of 60 ft/round with standard maneuverability.' + STAGES_DOC.Flying
  },
  {
    id: 'movement-flight-basic',
    name: 'Basic Flight',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Flying',
    type: 'Flying',
    base_speed: 30,
    speed: 30,
    bp: 2,
    description: 'Rudimentary flight apparatus or heavy wings granting base Fly Speed 30 ft/round (Poor Maneuverability).' + STAGES_DOC.Flying
  },
  {
    id: 'species_movement-swimming',
    name: 'Aquatic Swimming',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Swimming',
    type: 'Swimming',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Hydrodynamic body form with fins or aquatic propulsion, granting an innate 30 ft swim speed in liquid environments.' + STAGES_DOC.Swimming
  },
  {
    id: 'movement-swim-trait',
    name: 'Swim (Innate)',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Swimming',
    type: 'Swimming',
    base_speed: 30,
    speed: 30,
    bp: 2,
    description: 'Innate biological swim adaptations granting Swim speed 30 ft and +5 racial bonus on Athletics (Swim) checks.' + STAGES_DOC.Swimming
  },
  {
    id: 'species_movement-climbing',
    name: 'Innate Climbing',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Climbing',
    type: 'Climbing',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Specialized anatomy (claws, micro-suckers, or prehensile limbs) granting an innate 30 ft climb speed without checks on standard surfaces.' + STAGES_DOC.Climbing
  },
  {
    id: 'movement-climber',
    name: 'Climber',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Climbing',
    type: 'Climbing',
    base_speed: 30,
    speed: 30,
    bp: 2,
    description: 'Innate climbing adaptations granting Base Climb Speed 30 ft and +5 racial bonus on climbing checks.' + STAGES_DOC.Climbing
  },
  {
    id: 'movement-burrow-trait',
    name: 'Innate Burrowing',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Burrowing',
    type: 'Burrowing',
    base_speed: 20,
    speed: 20,
    bp: 2,
    description: 'Excavator claws or subterranean body shape granting Base Burrow Speed 20 ft through soil, sand, and unworked earth.' + STAGES_DOC.Burrowing
  },
  {
    id: 'movement-burrowing',
    name: 'Burrowing Movement',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Burrowing',
    type: 'Burrowing',
    base_speed: 20,
    speed: 20,
    bp: 2,
    description: 'Specialized subterranean locomotion displacing soil and sand at 20 ft/round.' + STAGES_DOC.Burrowing
  },
  {
    id: 'species_movement-flicker',
    name: 'Flicker Movement',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Flicker',
    type: 'Metaphysical',
    base_speed: 30,
    speed: 30,
    bp: 3,
    description: 'Short-range quantum phase displacement or micro-teleportation. Instantly traverse up to 30 ft line-of-sight without triggering opportunity attacks or traversing intervening physical hazards.' + STAGES_DOC.Flicker
  },
  {
    id: 'movement-flicker',
    name: 'Flicker (Innate Phase Step)',
    category: 'species_movement',
    classification: 'advanced',
    movement_tier: 'advanced',
    target_mode: 'Flicker',
    type: 'Metaphysical',
    base_speed: 30,
    speed: 30,
    bp: 3,
    description: 'Innate metaphysical or cybernetic flicker teleportation granting instant 30 ft phase displacement per round.' + STAGES_DOC.Flicker
  }
];

// 3. Movement Modifier Options (enhanced options, improved options, or other modifiers)
const SPEED_ADJUSTERS = [
  // Ground Modifiers
  {
    id: 'movement-fast',
    name: 'Fast (+10 ft Ground)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: 10,
    is_additive: true,
    is_exclusive: true,
    bp: 2,
    description: 'Increases base Ground locomotion speed by +10 feet (Additive). Mutually exclusive with other ground speed adjusters.'
  },
  {
    id: 'movement-very-fast',
    name: 'Very Fast (+20 ft Ground)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: 20,
    is_additive: true,
    is_exclusive: true,
    bp: 4,
    description: 'Increases base Ground locomotion speed by +20 feet (Additive). Mutually exclusive with other ground speed adjusters.'
  },
  {
    id: 'movement-slow',
    name: 'Slow (-10 ft Ground)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: -10,
    is_additive: true,
    is_exclusive: true,
    is_disadvantage: true,
    bp: -2,
    refundBP: 2,
    description: 'Reduces base Ground locomotion speed by -10 feet (Additive). Grants +2 BP refund. Mutually exclusive with other ground speed adjusters.'
  },
  {
    id: 'movement-ponderous',
    name: 'Ponderous (-20 ft Ground)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: -20,
    is_additive: true,
    is_exclusive: true,
    is_disadvantage: true,
    bp: -4,
    refundBP: 4,
    description: 'Reduces base Ground locomotion speed by -20 feet (Additive). Grants +4 BP refund. Mutually exclusive with other ground speed adjusters.'
  },
  {
    id: 'movement-sprinter',
    name: 'Sprinter (+10 ft Run Speed)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: 10,
    is_additive: true,
    is_ranked: true,
    bp: 1,
    description: 'Gains a +10 foot bonus to speed when executing running or sprinting actions. Ranked.'
  },
  {
    id: 'movement-hauler',
    name: 'Hauler (Heavy Load Mobility)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: 0,
    is_additive: false,
    bp: 1,
    description: 'Not encumbered or slowed by carrying a Heavy Load.'
  },
  {
    id: 'movement-marcher',
    name: 'Marcher (Long-Distance Efficiency)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: 0,
    is_additive: false,
    bp: 1,
    description: 'Fatigued at 1/2 normal rate when moving at a regular travel pace over overland distances.'
  },
  {
    id: 'movement-leaper',
    name: 'Leaper (Jump Mastery)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: 0,
    is_additive: false,
    bp: 1,
    description: 'Always considered to have a running start when making Jump and Athletics checks.'
  },
  {
    id: 'movement-terrain-movement',
    name: 'Terrain Movement (Difficult Terrain)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Ground',
    speed_modifier: 0,
    is_additive: false,
    bp: 1,
    description: 'Move through naturally difficult terrain (rubble, ice, mud, underbrush) at full normal speed without penalty.'
  },

  // Flying Modifiers
  {
    id: 'movement-flight-improved',
    name: 'Improved Flight Speed (+10 ft Flight)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Flying',
    speed_modifier: 10,
    is_additive: true,
    is_ranked: true,
    bp: 1,
    description: 'Increases base flight speed by +10 feet (Additive). Ranked.'
  },
  {
    id: 'movement-flight-maneuver',
    name: 'Improved Maneuverability',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Flying',
    speed_modifier: 0,
    is_additive: false,
    is_ranked: true,
    bp: 1,
    description: 'Flight maneuverability improves by 1 step (Clumsy > Poor > Average > Good > Perfect). Ranked.'
  },
  {
    id: 'movement-strong-flyer',
    name: 'Strong Flyer',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Flying',
    speed_modifier: 0,
    is_additive: false,
    bp: 2,
    description: 'Increases the Size category multiplier by +1 for Flying Speed and load capacity.'
  },

  // Swimming Modifiers
  {
    id: 'movement-swim-improved',
    name: 'Enhanced Swim Speed (+10 ft Swim)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Swimming',
    speed_modifier: 10,
    is_additive: true,
    is_ranked: true,
    bp: 1,
    description: 'Increases base swimming speed by +10 feet (Additive). Ranked.'
  },

  // Climbing Modifiers
  {
    id: 'movement-climb-improved',
    name: 'Enhanced Climb Speed (+10 ft Climb)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Climbing',
    speed_modifier: 10,
    is_additive: true,
    is_ranked: true,
    bp: 1,
    description: 'Increases base climbing speed by +10 feet (Additive). Ranked.'
  },
  {
    id: 'movement-mountaineer',
    name: 'Mountaineer (Slope Stability)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Climbing',
    speed_modifier: 0,
    is_additive: false,
    bp: 1,
    description: 'Immune to altitude sickness and suffers no defense penalties on narrow or slippery vertical surfaces.'
  },

  // Burrowing Modifiers
  {
    id: 'movement-burrow-improved',
    name: 'Enhanced Burrow Speed (+10 ft Burrow)',
    category: 'species_movement',
    classification: 'modifier',
    movement_tier: 'modifier',
    target_mode: 'Burrowing',
    speed_modifier: 10,
    is_additive: true,
    is_ranked: true,
    bp: 1,
    description: 'Increases base burrowing speed by +10 feet (Additive). Ranked.'
  }
];

// 4. Movement Stages (Tactical Paces within enabled movement modes)
const TACTICAL_PACES = [
  // Ground Stages
  { id: 'movement-ground', name: 'Ground Movement (System Rule)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Ground', multiplier: 1.0, speed: 30, bp: 0, description: 'Ground movement rules overview based on base walking speed.' },
  { id: 'movement-walk', name: 'Ground: Walk Pace (1x Base)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Ground', multiplier: 1.0, speed: 30, bp: 0, description: 'Default baseline movement pace for all ground locomotion (1x Base Walk).' },
  { id: 'movement-jog', name: 'Ground: Jog Pace (2x Base)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Ground', multiplier: 2.0, speed: 60, bp: 0, description: 'Hurried pace (2x Base Walk) with a -2 penalty to subtlety, stealth, or precision.' },
  { id: 'movement-running', name: 'Ground: Running Pace (4x Base)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Ground', multiplier: 4.0, speed: 120, bp: 0, description: 'Fast running pace (4x Base Walk) requiring Athletics check (CR 10+) each minute.' },
  { id: 'movement-sprinting', name: 'Ground: Sprinting Pace (6x Base)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Ground', multiplier: 6.0, speed: 180, bp: 0, description: 'Maximum land sprint (6x Base Walk) requiring demanding Athletics check (CR 15+) each minute.' },
  { id: 'movement-crawl', name: 'Ground: Crawl Pace (0.5x Base)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Ground', multiplier: 0.5, speed: 15, bp: 0, description: 'Low-profile crawling pace (1/2 Base Walk). Grants +2 to stealth; inflicts Prone.' },
  { id: 'movement-slow-crawl', name: 'Ground: Slow Crawl Pace (0.25x Base)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Ground', multiplier: 0.25, speed: 7.5, bp: 0, description: 'Deliberate stealth crawl (1/4 Base Walk). Grants +4 to stealth; inflicts Prone.' },

  // Flying Stages
  { id: 'movement-flying', name: 'Flying Movement (System Rule)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flying', multiplier: 1.0, speed: 60, bp: 0, description: 'Flying movement rules and tactical maneuver overview.' },
  { id: 'movement-flight', name: 'Flying: Flight Pace (1x Fly)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flying', multiplier: 1.0, speed: 60, bp: 0, description: 'Standard flying cruise pace (1x Fly).' },
  { id: 'movement-sail', name: 'Flying: Sail Pace (2x Fly)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flying', multiplier: 2.0, speed: 120, bp: 0, description: 'Hurried aerial cruise pace (2x Fly) with a -2 penalty to subtle actions.' },
  { id: 'movement-surge', name: 'Flying: Surge / Soar Pace (4x Fly)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flying', multiplier: 4.0, speed: 240, bp: 0, description: 'Maximum aerial sprint (4x Fly) requiring Acrobatics check (CR 10+) each minute.' },
  { id: 'movement-diving', name: 'Flying: Diving Pace (8x Fly)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flying', multiplier: 8.0, speed: 480, bp: 0, description: 'High-speed tactical descent (8x Fly) for precision dive attacks.' },
  { id: 'movement-gliding', name: 'Flying: Gliding Maneuver', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flying', multiplier: 1.0, speed: 60, bp: 0, description: 'Controlled unpowered aerodynamic glide granting +2 bonus to aerial actions.' },
  { id: 'movement-hover-descent', name: 'Flying: Hover & Controlled Descent (0.5x Fly)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flying', multiplier: 0.5, speed: 30, bp: 0, description: 'Stationary hover or slow vertical descent enabling stable targeting.' },

  // Swimming Stages
  { id: 'movement-swim', name: 'Swimming: Swim Pace (1x Swim)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Swimming', multiplier: 1.0, speed: 30, bp: 0, description: 'Standard aquatic swimming cruise pace.' },
  { id: 'movement-glide-swim', name: 'Swimming: Glide Pace (2x Swim)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Swimming', multiplier: 2.0, speed: 60, bp: 0, description: 'Hurried swim stroke (2x Swim) with -2 penalty to stealth.' },
  { id: 'movement-stroke', name: 'Swimming: Stroke Pace (4x Swim)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Swimming', multiplier: 4.0, speed: 120, bp: 0, description: 'Maximum aquatic power-stroke sprint (4x Swim) requiring Athletics CR 15+.' },
  { id: 'movement-treading', name: 'Swimming: Treading Pace (0.25x Swim)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Swimming', multiplier: 0.25, speed: 7.5, bp: 0, description: 'Stationary or slow treading water to conserve stamina (+2 to concentration).' },

  // Climbing Stages
  { id: 'movement-climb', name: 'Climbing: Standard Climb Pace (0.5x Walk)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Climbing', multiplier: 0.5, speed: 15, bp: 0, description: 'Standard vertical ascent/descent pace (1/2 Base Walk).' },
  { id: 'movement-scaling', name: 'Climbing: Scaling Pace (1x Walk)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Climbing', multiplier: 1.0, speed: 30, bp: 0, description: 'Rapid surface scaling at full walking speed with -5 penalty to check.' },
  { id: 'movement-fast-ascent', name: 'Climbing: Fast Ascent Pace (2x Walk)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Climbing', multiplier: 2.0, speed: 60, bp: 0, description: 'High-speed vertical sprint (2x Walk) with -10 penalty to check.' },
  { id: 'movement-fast-descent', name: 'Climbing: Fast Descent Pace (4x Walk)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Climbing', multiplier: 4.0, speed: 120, bp: 0, description: 'Rapid controlled vertical slide or abseil descent (4x Walk).' },

  // Burrowing Stages
  { id: 'movement-burrow', name: 'Burrowing: Standard Burrow Pace (0.375x Walk)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Burrowing', multiplier: 0.375, speed: 7.5, bp: 0, description: 'Standard subterranean displacement pace through soil or sand.' },
  { id: 'movement-tunneling', name: 'Burrowing: Tunneling Pace (0.75x Walk)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Burrowing', multiplier: 0.75, speed: 15, bp: 0, description: 'Rapid subterranean tunnel excavation (3/4 Base Walk) with -2 penalty to subtlety.' },
  { id: 'movement-excavation', name: 'Burrowing: Excavation Pace (0.1875x Walk)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Burrowing', multiplier: 0.1875, speed: 3.75, bp: 0, description: 'Careful reinforced excavation for permanent subterranean bunkers or fortresses.' },

  // Flicker Stages
  { id: 'movement-flicker-pace', name: 'Flicker: Phase Step Pace (1x Base)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flicker', multiplier: 1.0, speed: 30, bp: 0, description: 'Standard quantum phase displacement pace up to 30 ft per round without physical traversal.' },
  { id: 'movement-flicker-rush', name: 'Flicker: Rush Pace (Up to 2x Base)', category: 'species_movement', classification: 'stage', movement_tier: 'stage', target_mode: 'Flicker', multiplier: 2.0, speed: 60, bp: 0, description: 'Extended emergency quantum phase surge up to 60 ft; requires Endurance / Stamina check (CR 15+) to avoid fatigue.' }
];

// Combine all entries in explicit canonical order: Basic -> Advanced -> Modifiers -> Stages
const ALL_MOVEMENT_ENTRIES = [
  ...BASIC_MOVEMENT_MODES,
  ...ADVANCED_MOVEMENT_MODES,
  ...SPEED_ADJUSTERS,
  ...TACTICAL_PACES
].map(item => ({
  ...item,
  costs: {
    bp: item.bp || 0
  },
  modifiers: item.modifiers || [],
  body: `# ${item.name}\n\n**Category**: Species Movement (${item.classification.toUpperCase()})  \n**Classification**: ${item.classification}  \n**Target Mode**: ${item.target_mode}  \n**Cost**: ${item.bp >= 0 ? `+${item.bp}` : item.bp} BP  \n${item.speed_modifier !== undefined ? `**Speed Modifier**: ${item.speed_modifier > 0 ? `+${item.speed_modifier}` : item.speed_modifier} ft (Additive)  \n` : ''}${item.base_speed ? `**Base Speed**: ${item.base_speed} ft / round  \n` : ''}\n## Description\n${item.description}\n`
}));

// Grouped Dictionary for UI and Engine
const SPECIES_MOVEMENT_GROUPS = {
  Basic: {
    label: 'Basic Movement Abilities',
    items: BASIC_MOVEMENT_MODES
  },
  Advanced: {
    label: 'Advanced Movement Abilities',
    items: ADVANCED_MOVEMENT_MODES
  },
  Modifiers: {
    label: 'Movement Modifier Options',
    items: SPEED_ADJUSTERS
  },
  Stages: {
    label: 'Movement Stages (Tactical Paces)',
    items: TACTICAL_PACES
  },
  Ground: {
    label: 'Ground Locomotion',
    modes: [...BASIC_MOVEMENT_MODES, ...ADVANCED_MOVEMENT_MODES].filter(m => m.target_mode === 'Ground'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Ground')
  },
  Flying: {
    label: 'Flying Locomotion',
    modes: [...BASIC_MOVEMENT_MODES, ...ADVANCED_MOVEMENT_MODES].filter(m => m.target_mode === 'Flying'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Flying')
  },
  Swimming: {
    label: 'Swimming Locomotion',
    modes: [...BASIC_MOVEMENT_MODES, ...ADVANCED_MOVEMENT_MODES].filter(m => m.target_mode === 'Swimming'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Swimming')
  },
  Climbing: {
    label: 'Climbing Locomotion',
    modes: [...BASIC_MOVEMENT_MODES, ...ADVANCED_MOVEMENT_MODES].filter(m => m.target_mode === 'Climbing'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Climbing')
  },
  Burrowing: {
    label: 'Burrowing Locomotion',
    modes: [...BASIC_MOVEMENT_MODES, ...ADVANCED_MOVEMENT_MODES].filter(m => m.target_mode === 'Burrowing'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Burrowing')
  },
  Flicker: {
    label: 'Flicker Phase Displacement',
    modes: [...BASIC_MOVEMENT_MODES, ...ADVANCED_MOVEMENT_MODES].filter(m => m.target_mode === 'Flicker'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Flicker')
  }
};

console.log(`Total Movement entries assembled: ${ALL_MOVEMENT_ENTRIES.length}`);
console.log(`- Basic Modes: ${BASIC_MOVEMENT_MODES.length}`);
console.log(`- Advanced Modes: ${ADVANCED_MOVEMENT_MODES.length}`);
console.log(`- Speed Adjusters (Modifiers): ${SPEED_ADJUSTERS.length}`);
console.log(`- Tactical Stages (Paces): ${TACTICAL_PACES.length}`);

// ============================================================================
// 4. WRITE src/data/speciesMovementData.js
// ============================================================================
const jsContent = `/**
 * Canonical Movement Types, Modes, Adjusters, Paces, and Rules for Tangent SF RP
 * Auto-generated by scripts/rebuildMovementCatalogs.mjs
 */

export const MOVEMENT_CLASSIFICATION_ORDER = ['basic', 'advanced', 'modifier', 'stage'];

export const BASIC_MOVEMENT_MODES = ${JSON.stringify(BASIC_MOVEMENT_MODES, null, 2)};
export const ADVANCED_MOVEMENT_MODES = ${JSON.stringify(ADVANCED_MOVEMENT_MODES, null, 2)};
export const MOVEMENT_MODIFIERS = ${JSON.stringify(SPEED_ADJUSTERS, null, 2)};
export const MOVEMENT_STAGES = ${JSON.stringify(TACTICAL_PACES, null, 2)};

// Backward compatibility exports
export const SPECIES_MOVEMENT_BASE_MODES = [...BASIC_MOVEMENT_MODES, ...ADVANCED_MOVEMENT_MODES];
export const SPECIES_MOVEMENT_ADJUSTERS = MOVEMENT_MODIFIERS;
export const SPECIES_MOVEMENT_PACES = MOVEMENT_STAGES;
export const SPECIES_MOVEMENT_GROUPS = ${JSON.stringify(SPECIES_MOVEMENT_GROUPS, null, 2)};
export const DEFAULT_SPECIES_MOVEMENT = ${JSON.stringify(ALL_MOVEMENT_ENTRIES, null, 2)};
export const SPECIES_MOVEMENT_MODES = DEFAULT_SPECIES_MOVEMENT;

export const getMovementById = (id) => DEFAULT_SPECIES_MOVEMENT.find(m => m.id === id);

export const getMovementClassification = (itemOrId) => {
  if (!itemOrId) return 'basic';
  const id = typeof itemOrId === 'string' ? itemOrId : (itemOrId.id || '');
  const item = typeof itemOrId === 'object' ? itemOrId : DEFAULT_SPECIES_MOVEMENT.find(m => m.id === id);
  if (item?.movement_tier) return item.movement_tier;
  if (item?.classification) {
    if (item.classification === 'basic') return 'basic';
    if (item.classification === 'advanced') return 'advanced';
    if (item.classification === 'adjuster' || item.classification === 'modifier') return 'modifier';
    if (item.classification === 'pace' || item.classification === 'stage') return 'stage';
  }
  if (['species_movement-bipedal', 'species_movement-quadruped', 'species_movement-slithering', 'species_movement-treads', 'movement-normal-speed', 'species_movement-glide', 'movement-gliding-wings', 'movement-swimming', 'movement-climbing'].includes(id)) {
    return 'basic';
  }
  if (['species_movement-flight', 'movement-flight-basic', 'species_movement-swimming', 'movement-swim-trait', 'species_movement-climbing', 'movement-climber', 'movement-burrow-trait', 'movement-burrowing', 'species_movement-flicker', 'movement-flicker'].includes(id)) {
    return 'advanced';
  }
  if (id.startsWith('movement-') && (id.includes('fast') || id.includes('slow') || id.includes('ponderous') || id.includes('sprinter') || id.includes('hauler') || id.includes('marcher') || id.includes('leaper') || id.includes('terrain') || id.includes('improved') || id.includes('maneuver') || id.includes('strong') || id.includes('mountaineer'))) {
    return 'modifier';
  }
  if (id.includes('pace') || id.includes('walk') || id.includes('jog') || id.includes('running') || id.includes('sprinting') || id.includes('crawl') || id.includes('sail') || id.includes('surge') || id.includes('diving') || id.includes('hover') || id.includes('stroke') || id.includes('treading') || id.includes('scaling') || id.includes('ascent') || id.includes('descent') || id.includes('tunneling') || id.includes('excavation') || id.includes('flicker-rush')) {
    return 'stage';
  }
  return 'basic';
};

export const getMovementClassificationOrderIndex = (itemOrId) => {
  const cls = getMovementClassification(itemOrId);
  const idx = MOVEMENT_CLASSIFICATION_ORDER.indexOf(cls);
  return idx === -1 ? 99 : idx;
};
`;

fs.writeFileSync(movementJsPath, jsContent, 'utf8');
console.log(`Updated ${movementJsPath}`);

// ============================================================================
// 5. WRITE omnicortex/species_movement MARKDOWN FILES
// ============================================================================
if (fs.existsSync(movementDir)) {
  const existingFiles = fs.readdirSync(movementDir);
  existingFiles.forEach(f => fs.unlinkSync(path.join(movementDir, f)));
} else {
  fs.mkdirSync(movementDir, { recursive: true });
}

ALL_MOVEMENT_ENTRIES.forEach(item => {
  const filePath = path.join(movementDir, `${item.id}.md`);
  const frontmatter = { ...item };
  delete frontmatter.body;
  const fullContent = matter.stringify(item.body, frontmatter);
  fs.writeFileSync(filePath, fullContent, 'utf8');
});
console.log(`Wrote ${ALL_MOVEMENT_ENTRIES.length} Markdown files to omnicortex/species_movement`);

// ============================================================================
// 6. UPDATE JSON BACKUPS
// ============================================================================
if (!fs.existsSync(jsonBackupDir)) {
  fs.mkdirSync(jsonBackupDir, { recursive: true });
}
fs.writeFileSync(path.join(jsonBackupDir, 'species_movement_database.json'), JSON.stringify(ALL_MOVEMENT_ENTRIES, null, 2), 'utf8');
console.log('Updated JSON backups in current collection.');

console.log('\n================================================================');
console.log('MOVEMENT REORGANIZATION & CATALOG REBUILD COMPLETE!');
console.log('================================================================');