import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const movementDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_movement');
const targetFile = path.join(projectRoot, 'src', 'data', 'speciesMovementData.js');

if (!fs.existsSync(movementDir)) {
  fs.mkdirSync(movementDir, { recursive: true });
}

// 1. Ensure the 8 standard species movement types exist in Omnicortex
const SPECIES_MOVEMENT_DEFINITIONS = [
  {
    id: 'species_movement-bipedal',
    name: 'Bipedal Locomotion',
    category: 'species_movement',
    speed: 30,
    type: 'Ground',
    description: 'Standard upright two-legged locomotion. Baseline walking speed of 30 ft per combat round (6 seconds).'
  },
  {
    id: 'species_movement-quadruped',
    name: 'Quadrupedal Locomotion',
    category: 'species_movement',
    speed: 40,
    type: 'Ground',
    description: 'Four-legged locomotion providing stability and enhanced ground speed (+10 ft bonus over humanoid baseline).'
  },
  {
    id: 'species_movement-climbing',
    name: 'Innate Climbing',
    category: 'species_movement',
    speed: 30,
    type: 'Climb',
    description: 'Specialized anatomy (claws, micro-suckers, or prehensile limbs) granting an innate 30 ft climb speed without check penalties on standard surfaces.'
  },
  {
    id: 'species_movement-flight',
    name: 'True Flight',
    category: 'species_movement',
    speed: 60,
    type: 'Flying',
    description: 'Aerial wings, antigrav impellers, or metaphysical levitation. Base flight speed 60 ft/round (double walking speed).'
  },
  {
    id: 'species_movement-swimming',
    name: 'Aquatic Swimming',
    category: 'species_movement',
    speed: 30,
    type: 'Swimming',
    description: 'Hydrodynamic body form with fins or aquatic propulsion, granting an innate 30 ft swim speed in liquid environments.'
  },
  {
    id: 'species_movement-slithering',
    name: 'Serpentine Slithering',
    category: 'species_movement',
    speed: 25,
    type: 'Ground',
    description: 'Limbless serpentine or slug locomotion. Resilient against trip checks and traverses difficult rubble at normal speed.'
  },
  {
    id: 'species_movement-glide',
    name: 'Gliding',
    category: 'species_movement',
    speed: 60,
    type: 'Flying',
    description: 'Patagial membranes or gliding sails. Moves 5 ft horizontally for every 1 ft of descent.'
  },
  {
    id: 'species_movement-treads',
    name: 'Treads & Tracks',
    category: 'species_movement',
    speed: 30,
    type: 'Mechanical',
    description: 'Continuous caterpillar tracks or rolling hub treads for synthetic chassis. Immune to standard knockdowns.'
  }
];

for (const sm of SPECIES_MOVEMENT_DEFINITIONS) {
  const filePath = path.join(movementDir, `${sm.id}.md`);
  if (!fs.existsSync(filePath)) {
    const frontmatter = [
      '---',
      `id: ${sm.id}`,
      `name: "${sm.name}"`,
      `category: species_movement`,
      `type: "${sm.type}"`,
      `speed: ${sm.speed}`,
      `description: "${sm.description}"`,
      'costs:',
      '  bp: 0',
      '  credits: 0',
      '  nodes: 0',
      '  sockets: 0',
      '  strain: 0',
      '  focus: 0',
      '  ap: 0',
      'modifiers: []',
      'modifications: []',
      'critical_details:',
      '  score: \'\'',
      '  effect: []',
      '  success_effect: []',
      '  failure_effect: []',
      'sockets:',
      '  max: 0',
      '  used: 0',
      '  tier: Socket',
      '  allocated: []',
      '---',
      '',
      `# ${sm.name}`,
      '',
      `**Mode Type**: ${sm.type}  `,
      `**Base Speed**: ${sm.speed} ft / round  `,
      '',
      `## Description`,
      sm.description,
      ''
    ].join('\n');
    fs.writeFileSync(filePath, frontmatter, 'utf8');
    console.log(`Created movement bridge file: ${path.basename(filePath)}`);
  }
}

// 2. Parse all files in omnicortex/species_movement
const files = fs.readdirSync(movementDir).filter(f => f.endsWith('.md')).sort();
console.log(`Found ${files.length} movement files in ${movementDir}`);

const movementList = [];

for (const file of files) {
  const fullPath = path.join(movementDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const parsed = matter(content);
  const data = parsed.data || {};
  const body = (parsed.content || '').trim();

  const id = data.id || file.replace(/\.md$/, '');
  const name = data.name || data.title || id;
  const speed = typeof data.speed === 'number' ? data.speed : 30;
  const bp = typeof data.costs?.bp === 'number' ? data.costs.bp : (typeof data.bp === 'number' ? data.bp : 0);

  const movObj = {
    id,
    name,
    category: 'species_movement',
    type: data.type || 'Mode',
    speed,
    bp,
    costs: data.costs || { bp, credits: 0, nodes: 0, sockets: 0, strain: 0, focus: 0, ap: 0 },
    description: data.description || '',
    modifiers: Array.isArray(data.modifiers) ? data.modifiers : [],
    body
  };

  movementList.push(movObj);
}

movementList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

// 3. Generate updated speciesMovementData.js
const outputCode = `/**
 * Canonical Movement Types, Modes, Paces, and Rules for Tangent SF RP
 * Auto-generated and consolidated from src/data/omnicortex/species_movement/
 * Total Movements: ${movementList.length}
 */

export const DEFAULT_SPECIES_MOVEMENT = ${JSON.stringify(movementList, null, 2)};

export const SPECIES_MOVEMENT_MODES = DEFAULT_SPECIES_MOVEMENT;

export const getMovementById = (id) => DEFAULT_SPECIES_MOVEMENT.find(m => m.id === id);
`;

fs.writeFileSync(targetFile, outputCode, 'utf8');
console.log(`Successfully synced ${movementList.length} movement modes to: ${targetFile}`);
