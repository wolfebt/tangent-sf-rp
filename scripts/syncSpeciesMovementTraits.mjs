import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const movementDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_movement');

const speciesMovementItems = [
  // --- BASE MODES ---
  {
    id: 'movement-normal-speed',
    name: 'Normal Speed',
    type: 'Mode',
    bp: 0,
    speed: 30,
    desc: 'Base speed of 30 feet. Determines speed of other modes.',
    mechanics: 'Provides the standard medium humanoid walking baseline (30 ft / round). All secondary modes (fly, swim, climb, burrow) derive base rates from this score.'
  },
  {
    id: 'movement-climber',
    name: 'Climber',
    type: 'Mode',
    bp: 2,
    speed: 30,
    desc: 'Base Climb Speed 30, and gain the +5 racial bonus on climbing checks.',
    mechanics: 'Grants an innate Base Climb Speed of 30 ft per round and a permanent +5 racial bonus on all Athletics (Climbing) checks.'
  },
  {
    id: 'movement-gliding-wings',
    name: 'Gliding Wings',
    type: 'Mode',
    bp: 1,
    speed: 30,
    desc: 'While in midair, move 5ft horizontal for every 1ft fall. Speed 30ft/rnd (60 diving).',
    mechanics: 'While in midair, move 5 feet horizontally for every 1 foot of descent. Standard glide speed 30 ft/round (60 ft/round when diving).'
  },
  {
    id: 'movement-swim-trait',
    name: 'Swim',
    type: 'Mode',
    bp: 2,
    speed: 30,
    desc: 'Swim speed 30 feet. Gain +5 racial bonus on Swim checks.',
    mechanics: 'Grants an innate Swim speed of 30 feet per round and a permanent +5 racial bonus on all Athletics (Swimming) checks.'
  },
  {
    id: 'movement-burrow-trait',
    name: 'Burrow',
    type: 'Mode',
    bp: 2,
    speed: 20,
    desc: 'Base Burrow Speed 20.',
    mechanics: 'Grants an innate Base Burrow Speed of 20 feet per round through loose soil, sand, and unworked earth.'
  },
  {
    id: 'movement-flight-basic',
    name: 'Basic Flight',
    type: 'Mode',
    bp: 2,
    speed: 30,
    desc: 'Base Fly Speed 30 (Poor Maneuverability).',
    mechanics: 'Grants an innate Fly speed of 30 feet per round with Poor maneuverability. Eligible for Improved Flight Speed and Improved Maneuverability.'
  },

  // --- SPECIES MOVEMENT MODIFICATIONS ---
  {
    id: 'movement-very-fast',
    name: 'Very Fast',
    type: 'Modification',
    bp: 4,
    speedMod: 20,
    isExclusive: true,
    desc: 'Base Speed +20 feet. *',
    mechanics: 'Increases Base Speed by +20 feet (to 50 ft for Medium species). Mutually exclusive with other base speed modifier traits (*).'
  },
  {
    id: 'movement-fast',
    name: 'Fast',
    type: 'Modification',
    bp: 2,
    speedMod: 10,
    isExclusive: true,
    desc: 'Base Speed +10 feet. *',
    mechanics: 'Increases Base Speed by +10 feet (to 40 ft for Medium species). Mutually exclusive with other base speed modifier traits (*).'
  },
  {
    id: 'movement-slow',
    name: 'Slow (Disadvantage)',
    type: 'Modification',
    bp: -2,
    speedMod: -10,
    isExclusive: true,
    isDisadvantage: true,
    desc: 'Base Speed -10 feet. (BP Gain) *',
    mechanics: 'Decreases Base Speed by -10 feet (to 20 ft for Medium species) and refunds +2 Build Points (+2 BP Gain). Mutually exclusive with other base speed modifier traits (*).'
  },
  {
    id: 'movement-ponderous',
    name: 'Ponderous (Disadvantage)',
    type: 'Modification',
    bp: -4,
    speedMod: -20,
    isExclusive: true,
    isDisadvantage: true,
    desc: 'Base Speed -20 feet. (BP Gain) *',
    mechanics: 'Decreases Base Speed by -20 feet (to 10 ft for Medium species) and refunds +4 Build Points (+4 BP Gain). Mutually exclusive with other base speed modifier traits (*).'
  },
  {
    id: 'movement-flight-improved',
    name: 'Improved Flight Speed',
    type: 'Modification',
    bp: 1,
    speedMod: 10,
    isRanked: true,
    desc: 'Increases base flight speed by 10 feet. Ranked.',
    mechanics: 'Increases base flight speed by +10 feet per rank taken. May be purchased multiple times.'
  },
  {
    id: 'movement-flight-maneuver',
    name: 'Improved Maneuverability',
    type: 'Modification',
    bp: 1,
    isRanked: true,
    desc: 'Maneuverability improves by 1 step (Clumsy > Poor > Average > Good > Perfect). Ranked.',
    mechanics: 'Improves aerial maneuverability by 1 tier step (Clumsy > Poor > Average > Good > Perfect). May be purchased multiple times.'
  },
  {
    id: 'movement-strong-flyer',
    name: 'Strong Flyer',
    type: 'Modification',
    bp: 2,
    desc: 'Increase the Size category multiplier by 1 for Flying Speed.',
    mechanics: 'Increases the creature size category multiplier by +1 when calculating total aerial flying velocity.'
  },
  {
    id: 'movement-hauler',
    name: 'Hauler',
    type: 'Modification',
    bp: 1,
    desc: 'Not encumbered by carrying a Heavy Load.',
    mechanics: 'The character ignores encumbrance movement speed penalties and Agility check debuffs when carrying a Heavy Load.'
  },
  {
    id: 'movement-marcher',
    name: 'Marcher',
    type: 'Modification',
    bp: 1,
    desc: 'Fatigued ½ when moving at a regular pace.',
    mechanics: 'Reduces fatigue check frequency by half (50%) when traveling at standard overland marching pace.'
  },
  {
    id: 'movement-terrain-movement',
    name: 'Terrain Movement',
    type: 'Modification',
    bp: 1,
    desc: 'Move through naturally difficult terrain (specific type) at normal speed.',
    mechanics: 'Choose one natural terrain type (swamp, arctic, desert, dense forest, rubble). Move through that terrain at full speed without penalty.'
  },
  {
    id: 'movement-leaper',
    name: 'Leaper',
    type: 'Modification',
    bp: 1,
    desc: 'Always considered to have a running start when making Jump checks.',
    mechanics: 'The character is always treated as having a running start for all Athletics Jump checks, even when jumping from a standstill.'
  },
  {
    id: 'movement-mountaineer',
    name: 'Mountaineer',
    type: 'Modification',
    bp: 1,
    desc: 'Immune to altitude sickness, no defense loss on narrow/slippery surfaces.',
    mechanics: 'Complete immunity to high-altitude hypoxia/sickness and suffers no Defense or Reflex penalties when balancing on narrow, icy, or precarious vertical surfaces.'
  },
  {
    id: 'movement-sprinter',
    name: 'Sprinter',
    type: 'Modification',
    bp: 1,
    speedMod: 10,
    isRanked: true,
    desc: 'Gain +10 foot racial bonus to speed when running. Ranked.',
    mechanics: 'Gain a +10 foot racial bonus to movement speed when executing Running or Sprinting paces. May be purchased multiple times (Ranked).'
  }
];

speciesMovementItems.forEach(item => {
  const filePath = path.join(movementDir, `${item.id}.md`);
  const content = `---
id: ${item.id}
name: ${item.name}
category: species_movement
movement_type: ${item.type}
description: "${item.desc}"
costs:
  bp: ${item.bp}
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
speed: ${item.speed || item.speedMod || 0}
is_ranked: ${!!item.isRanked}
is_exclusive: ${!!item.isExclusive}
is_disadvantage: ${!!item.isDisadvantage}
modifiers: []
modifications: []
critical_details:
  score: ''
  effect: []
  success_effect: []
  failure_effect: []
sockets:
  max: 0
  used: 0
  tier: Socket
  allocated: []
---

# ${item.name}

**Category**: Species Movement (${item.type})  
**Cost**: ${item.bp >= 0 ? `${item.bp} BP` : `+${Math.abs(item.bp)} BP Gain (${item.bp} BP)`}  
**Classification**: ${item.type}${item.isExclusive ? ' (* Mutually Exclusive Speed Trait)' : ''}${item.isRanked ? ' (Ranked)' : ''}${item.isDisadvantage ? ' (Disadvantage)' : ''}  

## Effect
${item.desc}

## Mechanics & Rules
${item.mechanics}
`;

  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log('Synchronized:', path.basename(filePath));
});

console.log('All species movement traits synchronized successfully.');
