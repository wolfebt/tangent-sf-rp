import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('.');
const skillsDir = path.join(projectRoot, 'src/data/omnicortex/skills');

const standardCostsAndSockets = `costs:
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
  allocated: []`;

const skillsData = [
  {
    file: 'meta-dimension.md',
    id: 'meta-dimension',
    name: 'Dimension',
    desc: 'The metaphysical discipline governing spatial distortion, planar rifting, object/creature summoning, tactical teleportation, and gateway creation.',
    focuses: ['Summoning Focus (Conjuring creatures and matter across boundaries)', 'Teleport Focus (Blinking, portals, spatial transit)'],
    colors: 'Deep Indigo (Primary) / Void Black (Secondary)',
    texture: 'Warping, folding, portals, rifts',
    damage: '1d6 per Stage achieved with check'
  },
  {
    file: 'meta-energy.md',
    id: 'meta-energy',
    name: 'Energy',
    desc: 'The metaphysical discipline governing the manipulation of raw energy states, kinetic force, elemental plasma, electricity, acoustic waves, and telekinesis.',
    focuses: ['Elemental Focus (Pyro, Cryo, Voltic, Sonic, Corrosive)', 'Force Focus (Kinetic telekinesis, force barriers, gravimetric pulses)'],
    colors: 'Orange/Red, Transparent, Blue/White, Glacial Blue / White Hot, Pale Blue, Violet, Silver Ripples',
    texture: 'Plasma flickering, distortion waves, solid impact walls, crystalline growth, and ionized arcs',
    damage: '1d6 per Stage (Elemental); 1d8 per Stage (Force specific exception)'
  },
  {
    file: 'meta-entropy.md',
    id: 'meta-entropy',
    name: 'Entropy',
    desc: 'The metaphysical discipline governing decay, dissolution, probability manipulation, molecular breakdown, cellular regeneration, and life restoration.',
    focuses: ['Chaos Focus (Accelerating decay, unmaking bonds, curses)', 'Order Focus (Harmonic stabilization, cellular regeneration, healing)'],
    colors: 'Sickly Green (Chaos), Geometric Gold (Order), Vibrant Life Green (Healing) / Grey/Black, Crystal White, Soft Gold',
    texture: 'Rusting, decaying, mist, smoke; or perfect crystal lattices and knitting flesh',
    damage: '1d6 per Stage achieved with check (Necrotic, Acid, or Healing dice)'
  },
  {
    file: 'meta-illusion.md',
    id: 'meta-illusion',
    name: 'Illusion',
    desc: 'The metaphysical discipline governing photon refraction, sensory deception, holographic phantasms, mental glamours, and shadow weaving.',
    focuses: ['Phantasm Focus (Sensory phantasms, holographic weaves, mirages)', 'Shadow Focus (Weaving darkness, shadow-stuff, optical refraction)'],
    colors: 'Shimmering (Primary) / Oil-Slick (Secondary)',
    texture: 'Mirrored surfaces, chromatic haze, sensor glitches, and light-bending refractive weaves',
    damage: '1d6 per Stage achieved with check (Psychic/Cold or Deception Potency)'
  },
  {
    file: 'meta-matter.md',
    id: 'meta-matter',
    name: 'Matter',
    desc: 'The metaphysical discipline governing molecular alteration, density shifting, material reinforcement, telekinetic manipulation, and matter transmutation.',
    focuses: ['Enhancement Focus (Strengthening material bonds, hardening objects)', 'Transmutation Focus (Reshaping physical matter, molecular conversion)'],
    colors: 'Earth Tones (Primary) / Metallic Sheen (Secondary)',
    texture: 'Solidification, density shifting, transmutation, and diamond lattice reinforcement',
    damage: '1d6 per Stage achieved with check (Kinetic/Crushing or DR reinforcement)'
  },
  {
    file: 'meta-mental.md',
    id: 'meta-mental',
    name: 'Mental',
    desc: 'The metaphysical discipline governing telepathy, psionic force, neural influence, clairvoyant sensing, and cognitive will projection.',
    focuses: ['Projection Focus (Psionic thrusts, telekinesis, telepathic speech)', 'Sense Focus (Remote viewing, psionic detection, empathy, clairvoyance)'],
    colors: 'Pink/Magenta (Primary) / Cyan (Secondary)',
    texture: 'Cognitive ripples, psionic pulses, telepathic threads, and glowing eyes',
    damage: '1d6 per Stage achieved with check (Psionic damage bypassing physical armor DR)'
  }
];

skillsData.forEach(s => {
  const content = `---
id: ${s.id}
name: ${s.name}
type: meta
subtype: discipline
category: skills
governing_attributes:
  - Intellect
  - Wisdom
  - Charisma
description: >-
  ${s.desc}
trained_only: true
specialties:
${s.focuses.map(f => `  - '${f}'`).join('\n')}
synergy_links:
  - meta-attune
  - mental-metaphysics
${standardCostsAndSockets}
---

# ${s.name}

${s.desc}

### Core Rules & Mechanics
- **Governing Attribute**: Selected at Awakening (Intellect for Reason/Arcane, Wisdom for Intuition/Faith, Charisma for Dominance/Inherent).
- **Potency Formula**:
  $$\\text{Potency} = [\\text{Key Ability Mod} + \\text{Discipline Skill Level} + \\text{Invocation Level} + 10 \\text{ (or } d20 \\text{)}]$$
- **Damage & Scaling**: ${s.damage}.
- **Essence Pool Contribution**: Ranks in this discipline's focus skills contribute directly to the character's **Essence Pool** (Breadth component).
- **Sensory Manifestation**:
  - *Colors*: ${s.colors}
  - *Texture & Form*: ${s.texture}

### Focuses
${s.focuses.map(f => `- **${f.split(' (')[0]}**: ${f.split(' (')[1] ? f.split(' (')[1].replace(')', '') : ''}`).join('\n')}
`;
  fs.writeFileSync(path.join(skillsDir, s.file), content, 'utf8');
});

console.log('Successfully updated 6 meta discipline skills in src/data/omnicortex/skills/');
