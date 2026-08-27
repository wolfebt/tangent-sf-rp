import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const movementDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_movement');
const rulesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'rules');

function writeFile(targetPath, content) {
  fs.writeFileSync(targetPath, content.trim() + '\n', 'utf8');
  console.log('Wrote:', path.relative(projectRoot, targetPath));
}

const paces = [
  // Ground paces
  { id: 'movement-walk', name: 'Ground: Walk Pace', mode: 'Ground', mult: '1x Base', speed: 30, desc: 'Default baseline movement pace for all ground locomotion.', pen: 'None', check: 'None' },
  { id: 'movement-jog', name: 'Ground: Jog Pace', mode: 'Ground', mult: '2x Base', speed: 60, desc: 'Hurried pace with a -2 penalty to actions requiring subtlety, stealth, or precision.', pen: '-2 to subtlety/stealth/precision', check: 'None' },
  { id: 'movement-running', name: 'Ground: Running Pace', mode: 'Ground', mult: '4x Base (5x with Runner)', speed: 120, desc: 'Fast running pace requiring Athletics check (DC 10+) each minute to avoid fatigue.', pen: '-4 to subtle actions', check: 'Athletics DC 10+' },
  { id: 'movement-sprinting', name: 'Ground: Sprinting Pace', mode: 'Ground', mult: '6x Base (7x with Runner)', speed: 180, desc: 'Maximum land sprint requiring demanding Athletics check (DC 15+) each minute to avoid fatigue.', pen: '-8 to subtle actions', check: 'Athletics DC 15+' },
  { id: 'movement-crawl', name: 'Ground: Crawl Pace', mode: 'Ground', mult: '1/2x Base', speed: 15, desc: 'Low-profile crawling pace. Grants +2 bonus to stealth and inflicts Prone condition.', pen: 'Prone condition', check: 'None (+2 Stealth)' },
  { id: 'movement-slow-crawl', name: 'Ground: Slow Crawl Pace', mode: 'Ground', mult: '1/4x Base', speed: 7.5, desc: 'Deliberate stealth crawling pace. Grants +4 bonus to stealth and inflicts Prone condition.', pen: 'Prone condition', check: 'None (+4 Stealth)' },

  // Flying paces
  { id: 'movement-flight', name: 'Flying: Flight Pace', mode: 'Flying', mult: '1x Flight (2x Walk)', speed: 60, desc: 'Standard flying speed. Default pace for winged, thruster-equipped, or levitating creatures.', pen: 'None', check: 'None' },
  { id: 'movement-sail', name: 'Flying: Sail Pace', mode: 'Flying', mult: '2x Flight (4x Walk)', speed: 120, desc: 'Hurried aerial cruise pace with a -2 penalty to subtle actions.', pen: '-2 to subtlety/stealth/precision', check: 'None' },
  { id: 'movement-surge', name: 'Flying: Surge / Soar Pace', mode: 'Flying', mult: '4x Flight (8x Walk, 5x with Soar)', speed: 240, desc: 'Maximum aerial surge requiring Acrobatics check (DC 10+) each minute to avoid fatigue.', pen: '-4 to subtle actions', check: 'Acrobatics DC 10+' },
  { id: 'movement-diving', name: 'Flying: Diving Pace', mode: 'Flying', mult: '2x Current Speed (9x with Soar)', speed: 480, desc: 'High-speed descent maneuver for tactical engagement.', pen: '-4 to actions', check: 'Acrobatics DC 15+' },
  { id: 'movement-gliding', name: 'Flying: Gliding Maneuver', mode: 'Flying', mult: '1x Flight (drops 1ft per 5ft horiz)', speed: 60, desc: 'Controlled descent using aerodynamic lift. Grants +2 bonus to actions.', pen: 'None (+2 to actions)', check: 'Acrobatics DC 10+' },
  { id: 'movement-hover-descent', name: 'Flying: Hover & Controlled Descent', mode: 'Flying', mult: '1/2x Flight or less', speed: 30, desc: 'Stationary or slow descent enabling precise observation and stable targeting.', pen: 'None', check: 'Acrobatics DC 15+' },

  // Swimming paces
  { id: 'movement-swim', name: 'Swimming: Swim Pace', mode: 'Swimming', mult: '1x Swim (1/2x Walk)', speed: 15, desc: 'Standard aquatic swimming speed.', pen: 'None', check: 'None' },
  { id: 'movement-glide-swim', name: 'Swimming: Glide Pace', mode: 'Swimming', mult: '2x Swim (1x Walk)', speed: 30, desc: 'Hurried swimming pace with a -2 penalty to subtle actions.', pen: '-2 to subtle actions', check: 'Athletics (Swimming) DC 10+' },
  { id: 'movement-stroke', name: 'Swimming: Stroke Pace', mode: 'Swimming', mult: '4x Swim (2x Walk)', speed: 60, desc: 'Fast power-stroke swimming pace requiring Athletics (Swimming) check (DC 15+) each minute.', pen: '-4 to subtle actions', check: 'Athletics (Swimming) DC 15+' },
  { id: 'movement-treading', name: 'Swimming: Treading Pace', mode: 'Swimming', mult: '1/2x Swim or less', speed: 7.5, desc: 'Stationary or slow treading water to conserve stamina. Possible +2 bonus to actions.', pen: 'None (+2 to actions)', check: 'Athletics (Swimming) DC 5+' },

  // Climbing paces
  { id: 'movement-climb', name: 'Climbing: Standard Climb Pace', mode: 'Climbing', mult: 'Surface Dependent (1/2, 1/4, 1/10 Walk)', speed: 15, desc: 'Standard vertical ascent/descent across Easy (DC 10), Moderate (DC 15), or Difficult (DC 20) surfaces.', pen: 'Risk of falling', check: 'Athletics (Climbing) vs Surface DC' },
  { id: 'movement-scaling', name: 'Climbing: Scaling Pace', mode: 'Climbing', mult: '1x Base Walk', speed: 30, desc: 'Rapid surface scaling at full base walking speed with -5 penalty to check.', pen: '-2 to subtle actions', check: 'Athletics (Climbing) at -5 penalty' },
  { id: 'movement-fast-ascent', name: 'Climbing: Fast Ascent Pace', mode: 'Climbing', mult: '2x Base Walk', speed: 60, desc: 'High-speed vertical ascent at double walking speed with -10 penalty to check.', pen: '-4 to subtle actions', check: 'Athletics (Climbing) at -10 penalty' },
  { id: 'movement-fast-descent', name: 'Climbing: Fast Descent Pace', mode: 'Climbing', mult: '4x Base Walk', speed: 120, desc: 'Rapid controlled vertical descent without injury.', pen: '-4 to actions', check: 'DC 20 Athletics (Climbing) or -10 penalty' },

  // Burrowing paces
  { id: 'movement-burrow', name: 'Burrowing: Standard Burrow Pace', mode: 'Burrowing', mult: '1/4x Base Walk', speed: 7.5, desc: 'Standard subterranean displacement pace through soil or sand.', pen: 'None', check: 'None / Substrate check' },
  { id: 'movement-tunneling', name: 'Burrowing: Tunneling Pace', mode: 'Burrowing', mult: '2x Burrow (1/2x Walk)', speed: 15, desc: 'Rapid tunnel excavation with -2 penalty to subtle actions.', pen: '-2 to subtlety/stealth/precision', check: 'Athletics / Mining check' },
  { id: 'movement-excavation', name: 'Burrowing: Excavation Pace', mode: 'Burrowing', mult: '1/8x Base Walk', speed: 3.75, desc: 'Reinforced excavation for pit traps, underground bunkers, and permanent subterranean structures.', pen: 'Half burrow speed', check: 'Engineering / Mining check' }
];

paces.forEach(p => {
  writeFile(path.join(movementDir, `${p.id}.md`), `---
id: ${p.id}
name: ${p.name}
category: species_movement
description: ${p.desc}
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
speed: ${p.speed}
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

# ${p.name}

**Category**: Movement Modes & Paces  
**Movement Mode**: ${p.mode}  
**Speed Multiplier**: ${p.mult}  
**Medium Speed Baseline**: ${p.speed} ft / round  

## Description
${p.desc}

## Tactical Modifiers & Checks
- **Action Penalty / Modifier**: ${p.pen}
- **Required Check**: ${p.check}
`);
});

// Additional Rules files
writeFile(path.join(rulesDir, 'rule-movement-swimming-paces.md'), `---
id: rule-movement-swimming-paces
name: Swimming Movement Paces & Aquatic Rules
category: rules
description: Rules for aquatic swimming paces (Swim, Glide, Stroke, Treading) and drowning hazards.
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
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

# Swimming Movement Paces & Aquatic Rules

**Category**: Core Movement Rules  

## Swimming Paces
- **Swimming (1x Swim / 1/2 Walk)**: 15 ft/rd. Default pace.
- **Glide (2x Swim / 1x Walk)**: 30 ft/rd. -2 penalty to subtle actions. Athletics (Swimming) DC 10+.
- **Stroke (4x Swim / 2x Walk)**: 60 ft/rd. -4 penalty to subtle actions. Athletics (Swimming) DC 15+.
- **Treading (1/2 Swim or less)**: 7.5 ft/rd. +2 bonus to actions. Athletics (Swimming) DC 5+.
`);

writeFile(path.join(rulesDir, 'rule-movement-climbing-paces.md'), `---
id: rule-movement-climbing-paces
name: Climbing Movement Paces & Vertical Scaling Rules
category: rules
description: Rules for vertical scaling paces (Easy, Moderate, Difficult, Scaling, Fast Ascent, Fast Descent).
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
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

# Climbing Movement Paces & Vertical Scaling Rules

**Category**: Core Movement Rules  

## Surface Difficulties
- **Easy (DC 10+)**: 15 ft / rd (1/2 base walk).
- **Moderate (DC 15+)**: 7.5 ft / rd (1/4 base walk).
- **Difficult (DC 20+)**: 3 ft / rd (1/10 base walk).

## Accelerated Paces
- **Scaling (1x Walk)**: 30 ft/rd. -2 penalty. Athletics (Climbing) at -5 penalty.
- **Fast Ascent (2x Walk)**: 60 ft/rd. -4 penalty. Athletics (Climbing) at -10 penalty.
- **Fast Descent (4x Walk)**: 120 ft/rd. -4 penalty. DC 20 Athletics (Climbing) or -10 penalty.
`);

writeFile(path.join(rulesDir, 'rule-movement-burrowing-paces.md'), `---
id: rule-movement-burrowing-paces
name: Burrowing Movement Paces & Subterranean Rules
category: rules
description: Rules for subterranean traversal (Burrowing, Tunneling, Excavation) and shoring.
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
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

# Burrowing Movement Paces & Subterranean Rules

**Category**: Core Movement Rules  

## Burrowing Paces
- **Burrowing (1/4x Walk)**: 7.5 ft/rd. Standard displacement through soil or sand.
- **Tunneling (2x Burrow / 1/2 Walk)**: 15 ft/rd. -2 penalty to subtle actions.
- **Excavation (1/8x Walk)**: 3.75 ft/rd. Shoring and reinforcement for permanent chambers and pit traps.
`);

console.log('Successfully generated all individual pace files and rule entries!');
