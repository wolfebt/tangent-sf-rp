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

// 1. Base Movement Modes
const BASE_MOVEMENT_MODES = [
  {
    id: 'species_movement-bipedal',
    name: 'Bipedal Locomotion',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Ground',
    type: 'Ground',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Standard upright two-legged locomotion. Baseline walking speed of 30 ft per combat round (6 seconds).'
  },
  {
    id: 'species_movement-quadruped',
    name: 'Quadrupedal Locomotion',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Ground',
    type: 'Ground',
    base_speed: 40,
    speed: 40,
    bp: 0,
    description: 'Four-legged locomotion providing natural stability (+4 vs trip/knockdown) and enhanced baseline ground speed of 40 ft/round.'
  },
  {
    id: 'species_movement-slithering',
    name: 'Serpentine Slithering',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Ground',
    type: 'Ground',
    base_speed: 25,
    speed: 25,
    bp: 0,
    description: 'Limbless serpentine or slug locomotion. Baseline speed of 25 ft/round; resilient against trip checks and traverses narrow gaps easily.'
  },
  {
    id: 'species_movement-treads',
    name: 'Treads & Tracks',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Ground',
    type: 'Mechanical',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Continuous caterpillar tracks or rolling hub treads for synthetic chassis. Immune to difficult rough terrain; base speed 30 ft/round.'
  },
  {
    id: 'species_movement-flight',
    name: 'True Flight',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Flying',
    type: 'Flying',
    base_speed: 60,
    speed: 60,
    bp: 0,
    description: 'Aerial wings, antigrav impellers, or metaphysical levitation. Base flight speed of 60 ft/round with standard maneuverability.'
  },
  {
    id: 'movement-flight-basic',
    name: 'Basic Flight',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Flying',
    type: 'Flying',
    base_speed: 30,
    speed: 30,
    bp: 2,
    description: 'Rudimentary flight apparatus or heavy wings granting base Fly Speed 30 ft/round (Poor Maneuverability).'
  },
  {
    id: 'species_movement-glide',
    name: 'Gliding',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Flying',
    type: 'Flying',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Patagial membranes or gliding sails. Moves 30 ft/round horizontally while descending 1 ft for every 5 ft traveled.'
  },
  {
    id: 'movement-gliding-wings',
    name: 'Gliding Wings',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Flying',
    type: 'Flying',
    base_speed: 30,
    speed: 30,
    bp: 1,
    description: 'Deployable aerodynamic wing membranes. While airborne, glides at 30 ft/round (60 ft/round when diving).'
  },
  {
    id: 'species_movement-swimming',
    name: 'Aquatic Swimming',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Swimming',
    type: 'Swimming',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Hydrodynamic body form with fins or aquatic propulsion, granting an innate 30 ft swim speed in liquid environments.'
  },
  {
    id: 'movement-swim-trait',
    name: 'Swim (Innate)',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Swimming',
    type: 'Swimming',
    base_speed: 30,
    speed: 30,
    bp: 2,
    description: 'Innate biological swim adaptations granting Swim speed 30 ft and +5 racial bonus on Athletics (Swim) checks.'
  },
  {
    id: 'movement-swimming',
    name: 'Basic Swimming',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Swimming',
    type: 'Swimming',
    base_speed: 15,
    speed: 15,
    bp: 0,
    description: 'Baseline swimming speed for non-aquatic species, moving at 15 ft/round (1/2 ground walking speed).'
  },
  {
    id: 'species_movement-climbing',
    name: 'Innate Climbing',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Climbing',
    type: 'Climbing',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Specialized anatomy (claws, micro-suckers, or prehensile limbs) granting an innate 30 ft climb speed without checks on standard surfaces.'
  },
  {
    id: 'movement-climber',
    name: 'Climber',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Climbing',
    type: 'Climbing',
    base_speed: 30,
    speed: 30,
    bp: 2,
    description: 'Innate climbing adaptations granting Base Climb Speed 30 ft and +5 racial bonus on climbing checks.'
  },
  {
    id: 'movement-climbing',
    name: 'Basic Climbing',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Climbing',
    type: 'Climbing',
    base_speed: 15,
    speed: 15,
    bp: 0,
    description: 'Baseline climbing speed for standard humanoids, ascending at 15 ft/round (1/2 ground walking speed).'
  },
  {
    id: 'movement-burrow-trait',
    name: 'Innate Burrowing',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Burrowing',
    type: 'Burrowing',
    base_speed: 20,
    speed: 20,
    bp: 2,
    description: 'Excavator claws or subterranean body shape granting Base Burrow Speed 20 ft through soil, sand, and unworked earth.'
  },
  {
    id: 'movement-burrowing',
    name: 'Burrowing Movement',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Burrowing',
    type: 'Burrowing',
    base_speed: 20,
    speed: 20,
    bp: 2,
    description: 'Specialized subterranean locomotion displacing soil and sand at 20 ft/round.'
  },
  {
    id: 'movement-normal-speed',
    name: 'Normal Speed (Baseline 30 ft)',
    category: 'species_movement',
    classification: 'mode',
    target_mode: 'Ground',
    type: 'Ground',
    base_speed: 30,
    speed: 30,
    bp: 0,
    description: 'Standard baseline speed of 30 feet. Determines derived speed of all other locomotion modes.'
  }
];

// 2. Additive Speed Adjusters & Mobility Modifications
const SPEED_ADJUSTERS = [
  // --- Ground Adjusters ---
  {
    id: 'movement-fast',
    name: 'Fast (+10 ft Ground)',
    category: 'species_movement',
    classification: 'adjuster',
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
    classification: 'adjuster',
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
    classification: 'adjuster',
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
    classification: 'adjuster',
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
    classification: 'adjuster',
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
    classification: 'adjuster',
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
    classification: 'adjuster',
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
    classification: 'adjuster',
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
    classification: 'adjuster',
    target_mode: 'Ground',
    speed_modifier: 0,
    is_additive: false,
    bp: 1,
    description: 'Move through naturally difficult terrain (rubble, ice, mud, underbrush) at full normal speed without penalty.'
  },

  // --- Flying Adjusters ---
  {
    id: 'movement-flight-improved',
    name: 'Improved Flight Speed (+10 ft Flight)',
    category: 'species_movement',
    classification: 'adjuster',
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
    classification: 'adjuster',
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
    classification: 'adjuster',
    target_mode: 'Flying',
    speed_modifier: 0,
    is_additive: false,
    bp: 2,
    description: 'Increases the Size category multiplier by +1 for Flying Speed and load capacity.'
  },

  // --- Swimming Adjusters ---
  {
    id: 'movement-swim-improved',
    name: 'Enhanced Swim Speed (+10 ft Swim)',
    category: 'species_movement',
    classification: 'adjuster',
    target_mode: 'Swimming',
    speed_modifier: 10,
    is_additive: true,
    is_ranked: true,
    bp: 1,
    description: 'Increases base swimming speed by +10 feet (Additive). Ranked.'
  },

  // --- Climbing Adjusters ---
  {
    id: 'movement-climb-improved',
    name: 'Enhanced Climb Speed (+10 ft Climb)',
    category: 'species_movement',
    classification: 'adjuster',
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
    classification: 'adjuster',
    target_mode: 'Climbing',
    speed_modifier: 0,
    is_additive: false,
    bp: 1,
    description: 'Immune to altitude sickness and suffers no defense penalties on narrow or slippery vertical surfaces.'
  },

  // --- Burrowing Adjusters ---
  {
    id: 'movement-burrow-improved',
    name: 'Enhanced Burrow Speed (+10 ft Burrow)',
    category: 'species_movement',
    classification: 'adjuster',
    target_mode: 'Burrowing',
    speed_modifier: 10,
    is_additive: true,
    is_ranked: true,
    bp: 1,
    description: 'Increases base burrowing speed by +10 feet (Additive). Ranked.'
  }
];

// 3. Derived Tactical Paces (Derived multi-speeds)
const TACTICAL_PACES = [
  // Ground Paces
  { id: 'movement-ground', name: 'Ground Movement (System Rule)', category: 'species_movement', classification: 'pace', target_mode: 'Ground', multiplier: 1.0, speed: 30, bp: 0, description: 'Ground movement rules overview based on base walking speed.' },
  { id: 'movement-walk', name: 'Ground: Walk Pace (1x Base)', category: 'species_movement', classification: 'pace', target_mode: 'Ground', multiplier: 1.0, speed: 30, bp: 0, description: 'Default baseline movement pace for all ground locomotion (1x Base Walk).' },
  { id: 'movement-jog', name: 'Ground: Jog Pace (2x Base)', category: 'species_movement', classification: 'pace', target_mode: 'Ground', multiplier: 2.0, speed: 60, bp: 0, description: 'Hurried pace (2x Base Walk) with a -2 penalty to subtlety, stealth, or precision.' },
  { id: 'movement-running', name: 'Ground: Running Pace (4x Base)', category: 'species_movement', classification: 'pace', target_mode: 'Ground', multiplier: 4.0, speed: 120, bp: 0, description: 'Fast running pace (4x Base Walk) requiring Athletics check (DC 10+) each minute.' },
  { id: 'movement-sprinting', name: 'Ground: Sprinting Pace (6x Base)', category: 'species_movement', classification: 'pace', target_mode: 'Ground', multiplier: 6.0, speed: 180, bp: 0, description: 'Maximum land sprint (6x Base Walk) requiring demanding Athletics check (DC 15+) each minute.' },
  { id: 'movement-crawl', name: 'Ground: Crawl Pace (0.5x Base)', category: 'species_movement', classification: 'pace', target_mode: 'Ground', multiplier: 0.5, speed: 15, bp: 0, description: 'Low-profile crawling pace (1/2 Base Walk). Grants +2 to stealth; inflicts Prone.' },
  { id: 'movement-slow-crawl', name: 'Ground: Slow Crawl Pace (0.25x Base)', category: 'species_movement', classification: 'pace', target_mode: 'Ground', multiplier: 0.25, speed: 7.5, bp: 0, description: 'Deliberate stealth crawl (1/4 Base Walk). Grants +4 to stealth; inflicts Prone.' },

  // Flying Paces
  { id: 'movement-flying', name: 'Flying Movement (System Rule)', category: 'species_movement', classification: 'pace', target_mode: 'Flying', multiplier: 1.0, speed: 60, bp: 0, description: 'Flying movement rules and tactical maneuver overview.' },
  { id: 'movement-flight', name: 'Flying: Flight Pace (1x Fly)', category: 'species_movement', classification: 'pace', target_mode: 'Flying', multiplier: 1.0, speed: 60, bp: 0, description: 'Standard flying cruise pace (1x Fly).' },
  { id: 'movement-sail', name: 'Flying: Sail Pace (2x Fly)', category: 'species_movement', classification: 'pace', target_mode: 'Flying', multiplier: 2.0, speed: 120, bp: 0, description: 'Hurried aerial cruise pace (2x Fly) with a -2 penalty to subtle actions.' },
  { id: 'movement-surge', name: 'Flying: Surge / Soar Pace (4x Fly)', category: 'species_movement', classification: 'pace', target_mode: 'Flying', multiplier: 4.0, speed: 240, bp: 0, description: 'Maximum aerial sprint (4x Fly) requiring Acrobatics check (DC 10+) each minute.' },
  { id: 'movement-diving', name: 'Flying: Diving Pace (8x Fly)', category: 'species_movement', classification: 'pace', target_mode: 'Flying', multiplier: 8.0, speed: 480, bp: 0, description: 'High-speed tactical descent (8x Fly) for precision dive attacks.' },
  { id: 'movement-gliding', name: 'Flying: Gliding Maneuver', category: 'species_movement', classification: 'pace', target_mode: 'Flying', multiplier: 1.0, speed: 60, bp: 0, description: 'Controlled unpowered aerodynamic glide granting +2 bonus to aerial actions.' },
  { id: 'movement-hover-descent', name: 'Flying: Hover & Controlled Descent (0.5x Fly)', category: 'species_movement', classification: 'pace', target_mode: 'Flying', multiplier: 0.5, speed: 30, bp: 0, description: 'Stationary hover or slow vertical descent enabling stable targeting.' },

  // Swimming Paces
  { id: 'movement-swim', name: 'Swimming: Swim Pace (1x Swim)', category: 'species_movement', classification: 'pace', target_mode: 'Swimming', multiplier: 1.0, speed: 30, bp: 0, description: 'Standard aquatic swimming cruise pace.' },
  { id: 'movement-glide-swim', name: 'Swimming: Glide Pace (2x Swim)', category: 'species_movement', classification: 'pace', target_mode: 'Swimming', multiplier: 2.0, speed: 60, bp: 0, description: 'Hurried swim stroke (2x Swim) with -2 penalty to stealth.' },
  { id: 'movement-stroke', name: 'Swimming: Stroke Pace (4x Swim)', category: 'species_movement', classification: 'pace', target_mode: 'Swimming', multiplier: 4.0, speed: 120, bp: 0, description: 'Maximum aquatic power-stroke sprint (4x Swim) requiring Athletics DC 15+.' },
  { id: 'movement-treading', name: 'Swimming: Treading Pace (0.25x Swim)', category: 'species_movement', classification: 'pace', target_mode: 'Swimming', multiplier: 0.25, speed: 7.5, bp: 0, description: 'Stationary or slow treading water to conserve stamina (+2 to concentration).' },

  // Climbing Paces
  { id: 'movement-climb', name: 'Climbing: Standard Climb Pace (0.5x Walk)', category: 'species_movement', classification: 'pace', target_mode: 'Climbing', multiplier: 0.5, speed: 15, bp: 0, description: 'Standard vertical ascent/descent pace (1/2 Base Walk).' },
  { id: 'movement-scaling', name: 'Climbing: Scaling Pace (1x Walk)', category: 'species_movement', classification: 'pace', target_mode: 'Climbing', multiplier: 1.0, speed: 30, bp: 0, description: 'Rapid surface scaling at full walking speed with -5 penalty to check.' },
  { id: 'movement-fast-ascent', name: 'Climbing: Fast Ascent Pace (2x Walk)', category: 'species_movement', classification: 'pace', target_mode: 'Climbing', multiplier: 2.0, speed: 60, bp: 0, description: 'High-speed vertical sprint (2x Walk) with -10 penalty to check.' },
  { id: 'movement-fast-descent', name: 'Climbing: Fast Descent Pace (4x Walk)', category: 'species_movement', classification: 'pace', target_mode: 'Climbing', multiplier: 4.0, speed: 120, bp: 0, description: 'Rapid controlled vertical slide or abseil descent (4x Walk).' },

  // Burrowing Paces
  { id: 'movement-burrow', name: 'Burrowing: Standard Burrow Pace (0.375x Walk)', category: 'species_movement', classification: 'pace', target_mode: 'Burrowing', multiplier: 0.375, speed: 7.5, bp: 0, description: 'Standard subterranean displacement pace through soil or sand.' },
  { id: 'movement-tunneling', name: 'Burrowing: Tunneling Pace (0.75x Walk)', category: 'species_movement', classification: 'pace', target_mode: 'Burrowing', multiplier: 0.75, speed: 15, bp: 0, description: 'Rapid subterranean tunnel excavation (3/4 Base Walk) with -2 penalty to subtlety.' },
  { id: 'movement-excavation', name: 'Burrowing: Excavation Pace (0.1875x Walk)', category: 'species_movement', classification: 'pace', target_mode: 'Burrowing', multiplier: 0.1875, speed: 3.75, bp: 0, description: 'Careful reinforced excavation for permanent subterranean bunkers or fortresses.' }
];

// Combine all 55 entries with standard schema
const ALL_MOVEMENT_ENTRIES = [
  ...BASE_MOVEMENT_MODES,
  ...SPEED_ADJUSTERS,
  ...TACTICAL_PACES
].map(item => ({
  ...item,
  costs: item.costs || {
    bp: item.bp || 0,
    credits: 0,
    nodes: 0,
    sockets: 0,
    strain: 0,
    focus: 0,
    ap: 0
  },
  body: `# ${item.name}\n\n**Category**: Species Movement (${item.classification.toUpperCase()})  \n**Target Mode**: ${item.target_mode}  \n**Cost**: ${item.bp >= 0 ? `+${item.bp}` : item.bp} BP  \n${item.speed_modifier ? `**Speed Modifier**: ${item.speed_modifier > 0 ? `+${item.speed_modifier}` : item.speed_modifier} ft (Additive)  \n` : ''}${item.base_speed ? `**Base Speed**: ${item.base_speed} ft / round  \n` : ''}\n## Description\n${item.description}\n`
}));

// Grouped Dictionary for UI and Engine
const SPECIES_MOVEMENT_GROUPS = {
  Ground: {
    label: 'Ground Locomotion',
    modes: BASE_MOVEMENT_MODES.filter(m => m.target_mode === 'Ground'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Ground')
  },
  Flying: {
    label: 'Flying Locomotion',
    modes: BASE_MOVEMENT_MODES.filter(m => m.target_mode === 'Flying'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Flying')
  },
  Swimming: {
    label: 'Swimming Locomotion',
    modes: BASE_MOVEMENT_MODES.filter(m => m.target_mode === 'Swimming'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Swimming')
  },
  Climbing: {
    label: 'Climbing Locomotion',
    modes: BASE_MOVEMENT_MODES.filter(m => m.target_mode === 'Climbing'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Climbing')
  },
  Burrowing: {
    label: 'Burrowing Locomotion',
    modes: BASE_MOVEMENT_MODES.filter(m => m.target_mode === 'Burrowing'),
    adjusters: SPEED_ADJUSTERS.filter(a => a.target_mode === 'Burrowing')
  }
};

console.log(`Total Movement entries assembled: ${ALL_MOVEMENT_ENTRIES.length}`);
console.log(`- Base Modes: ${BASE_MOVEMENT_MODES.length}`);
console.log(`- Speed Adjusters: ${SPEED_ADJUSTERS.length}`);
console.log(`- Derived Paces: ${TACTICAL_PACES.length}`);

// ============================================================================
// 4. WRITE src/data/speciesMovementData.js
// ============================================================================
const jsContent = `/**
 * Canonical Movement Types, Modes, Adjusters, Paces, and Rules for Tangent SF RP
 * Auto-generated by scripts/rebuildMovementCatalogs.mjs
 */

export const SPECIES_MOVEMENT_BASE_MODES = ${JSON.stringify(BASE_MOVEMENT_MODES, null, 2)};
export const SPECIES_MOVEMENT_ADJUSTERS = ${JSON.stringify(SPEED_ADJUSTERS, null, 2)};
export const SPECIES_MOVEMENT_PACES = ${JSON.stringify(TACTICAL_PACES, null, 2)};
export const SPECIES_MOVEMENT_GROUPS = ${JSON.stringify(SPECIES_MOVEMENT_GROUPS, null, 2)};
export const DEFAULT_SPECIES_MOVEMENT = ${JSON.stringify(ALL_MOVEMENT_ENTRIES, null, 2)};
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
fs.writeFileSync(path.join(jsonBackupDir, 'species_movement_database.json'), JSON.stringify(ALL_MOVEMENT_ENTRIES, null, 2), 'utf8');
console.log('Updated JSON backups in current collection.');

console.log('\n================================================================');
console.log('MOVEMENT REORGANIZATION & CATALOG REBUILD COMPLETE!');
console.log('================================================================');