import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const sizeDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species_size');
const targetFile = path.join(projectRoot, 'src', 'data', 'speciesSizeData.js');

if (!fs.existsSync(sizeDir)) {
  fs.mkdirSync(sizeDir, { recursive: true });
}

export const CANONICAL_SIZES = [
  {
    id: 'species_size-miniscule',
    name: 'Miniscule',
    category: 'species_size',
    scaling: 0.0833,
    scaling_display: '-5ds (1/12)',
    strength_mod: -32,
    combat_mod: 32,
    stealth_mod: 20,
    height_length_range: '< 1 in',
    weight_range: '< 1 oz',
    reach: '1 in',
    description: 'Extremely microscopic or insect-sized entity. Requires microscopic precision to target.'
  },
  {
    id: 'species_size-fine',
    name: 'Fine',
    category: 'species_size',
    scaling: 0.1667,
    scaling_display: '-4ds (1/6)',
    strength_mod: -16,
    combat_mod: 16,
    stealth_mod: 16,
    height_length_range: '< 6 in',
    weight_range: '< 1/8 lb',
    reach: '6 in',
    description: 'Very small organism or drone, comparable to a small rodent or tiny mechanical scout.'
  },
  {
    id: 'species_size-diminutive',
    name: 'Diminutive',
    category: 'species_size',
    scaling: 0.3333,
    scaling_display: '-3ds (1/3)',
    strength_mod: -8,
    combat_mod: 8,
    stealth_mod: 12,
    height_length_range: '< 1 ft',
    weight_range: '< 1 lb',
    reach: '1 ft',
    description: 'Small avian or domestic animal size. High defense and stealth bonus.'
  },
  {
    id: 'species_size-tiny',
    name: 'Tiny',
    category: 'species_size',
    scaling: 0.5,
    scaling_display: '-2ds (1/2)',
    strength_mod: -4,
    combat_mod: 4,
    stealth_mod: 8,
    height_length_range: '< 2 ft',
    weight_range: '< 8 lbs',
    reach: '2 ft',
    description: 'Lap animal or combat drone chassis. Noticeably harder to hit in tactical combat.'
  },
  {
    id: 'species_size-small',
    name: 'Small',
    category: 'species_size',
    scaling: 0.6667,
    scaling_display: '-1ds (2/3)',
    strength_mod: -2,
    combat_mod: 2,
    stealth_mod: 4,
    height_length_range: '< 4 ft',
    weight_range: '< 60 lbs',
    reach: '3 ft',
    description: 'Diminutive humanoid or juvenile alien form. Slight stealth and evasion benefit.'
  },
  {
    id: 'species_size-medium',
    name: 'Medium',
    category: 'species_size',
    scaling: 1.0,
    scaling_display: 'Base (1.0)',
    strength_mod: 0,
    combat_mod: 0,
    stealth_mod: 0,
    height_length_range: '< 8 ft',
    weight_range: '< 500 lbs',
    reach: '5 ft',
    description: 'Baseline standard humanoid form across galactic species (Humans, Aeld, Aulurans, etc.).'
  },
  {
    id: 'species_size-large',
    name: 'Large',
    category: 'species_size',
    scaling: 2.0,
    scaling_display: 'x2',
    strength_mod: 2,
    combat_mod: -2,
    stealth_mod: -4,
    height_length_range: '< 16 ft',
    weight_range: '< 2 tons',
    reach: '10 ft',
    description: 'Heavy quadruped, large construct, power armor frame, or light walker.'
  },
  {
    id: 'species_size-huge',
    name: 'Huge',
    category: 'species_size',
    scaling: 5.0,
    scaling_display: 'x5',
    strength_mod: 4,
    combat_mod: -4,
    stealth_mod: -8,
    height_length_range: '< 32 ft',
    weight_range: '< 16 tons',
    reach: '15 ft',
    description: 'Tactical combat mech, armored fighting vehicle, or colossal apex alien predator.'
  },
  {
    id: 'species_size-gargantuan',
    name: 'Gargantuan',
    category: 'species_size',
    scaling: 10.0,
    scaling_display: 'x10',
    strength_mod: 8,
    combat_mod: -8,
    stealth_mod: -16,
    height_length_range: '< 64 ft',
    weight_range: '< 125 tons',
    reach: '20 ft',
    description: 'Super-heavy siege walker, space shuttle landing craft, or planetary behemoth.'
  },
  {
    id: 'species_size-colossal',
    name: 'Colossal',
    category: 'species_size',
    scaling: 20.0,
    scaling_display: 'x20',
    strength_mod: 16,
    combat_mod: -16,
    stealth_mod: -32,
    height_length_range: '< 128 ft',
    weight_range: '< 1,000 tons',
    reach: '25 ft',
    description: 'Titan mech, corvette-class starship, or subterranean world-burrower.'
  },
  {
    id: 'species_size-enormous',
    name: 'Enormous',
    category: 'species_size',
    scaling: 40.0,
    scaling_display: 'x40',
    strength_mod: 32,
    combat_mod: -32,
    stealth_mod: 0,
    height_length_range: '< 512 ft',
    weight_range: '< 16,000 tons',
    reach: '50 ft',
    description: 'Frigate-class naval vessel or planetary fortress complex.'
  },
  {
    id: 'species_size-titanic',
    name: 'Titanic',
    category: 'species_size',
    scaling: 80.0,
    scaling_display: 'x80',
    strength_mod: 64,
    combat_mod: -64,
    stealth_mod: 0,
    height_length_range: '< 1,024 ft',
    weight_range: '< 144,000 tons',
    reach: '100 ft',
    description: 'Cruiser-class battleship or orbital defense station.'
  },
  {
    id: 'species_size-super-gargantuan',
    name: 'Super Gargantuan',
    category: 'species_size',
    scaling: 160.0,
    scaling_display: 'x160',
    strength_mod: 128,
    combat_mod: -128,
    stealth_mod: 0,
    height_length_range: '< 5,280 ft (1 Mile)',
    weight_range: '< 50M tons',
    reach: '200 ft',
    description: 'Dreadnought capital ship or planetary colony spire.'
  },
  {
    id: 'species_size-mega-colossal',
    name: 'Mega Colossal',
    category: 'species_size',
    scaling: 320.0,
    scaling_display: 'x320',
    strength_mod: 256,
    combat_mod: -256,
    stealth_mod: 0,
    height_length_range: '1 Mile+',
    weight_range: '50M tons+',
    reach: '500 ft',
    description: 'Super-dreadnought, megastructure arcology, or asteroid-sized orbital habitat.'
  }
];

function buildSizes() {
  console.log(`Generating ${CANONICAL_SIZES.length} Species Size Markdown files in ${sizeDir}...`);

  for (const s of CANONICAL_SIZES) {
    const frontmatter = [
      '---',
      `id: ${s.id}`,
      `name: ${s.name}`,
      `category: species_size`,
      `scaling: ${s.scaling}`,
      `scaling_display: "${s.scaling_display}"`,
      `strength_mod: ${s.strength_mod}`,
      `combat_mod: ${s.combat_mod}`,
      `stealth_mod: ${s.stealth_mod}`,
      `height_length_range: "${s.height_length_range}"`,
      `weight_range: "${s.weight_range}"`,
      `reach: "${s.reach}"`,
      `description: "${s.description}"`,
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
      `# Size Category: ${s.name}`,
      '',
      `**Scaling Multiplier**: ${s.scaling_display}  `,
      `**Height / Length**: ${s.height_length_range}  `,
      `**Weight**: ${s.weight_range}  `,
      `**Standard Reach**: ${s.reach}  `,
      '',
      `## Tactical Modifiers`,
      `- **Strength Modifier**: ${s.strength_mod >= 0 ? '+' : ''}${s.strength_mod}`,
      `- **Combat / Defense Modifier**: ${s.combat_mod >= 0 ? '+' : ''}${s.combat_mod}`,
      `- **Stealth Modifier**: ${s.stealth_mod >= 0 ? '+' : ''}${s.stealth_mod}`,
      '',
      `## Description`,
      s.description,
      ''
    ].join('\n');

    const filePath = path.join(sizeDir, `${s.id}.md`);
    fs.writeFileSync(filePath, frontmatter, 'utf8');
  }

  const outputJs = `/**
 * Canonical Species Sizes & Scaling Multipliers Database for Tangent SF RP
 * Sourced from docs/architect/99. SCALING.md
 * Total Sizes: ${CANONICAL_SIZES.length}
 */

export const DEFAULT_SPECIES_SIZES = ${JSON.stringify(CANONICAL_SIZES, null, 2)};

export const getSizeById = (id) => DEFAULT_SPECIES_SIZES.find(s => s.id === id);
`;

  fs.writeFileSync(targetFile, outputJs, 'utf8');
  console.log(`Generated ${CANONICAL_SIZES.length} sizes in ${targetFile}`);
}

buildSizes();
