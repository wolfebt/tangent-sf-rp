import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const augDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'augmentations');

// Canonical mapping from 99 - AUGMENTATIONS MATRIX
const CANONICAL_STAGES = {
  // 3. Civilian Standard (Fashionware & Utilities) - all Negligible
  'id-chip': 'Negligible',
  'skinwatch': 'Negligible',
  'shift-tacts': 'Negligible',
  'light-tattoo': 'Negligible',
  'contraceptive-implant': 'Negligible',
  'magnetic-piercings': 'Negligible',
  'cyber-vox': 'Negligible',
  'biomonitor': 'Negligible',
  'chemskins': 'Negligible',
  'tech-hair': 'Negligible',
  'turn-on-nails': 'Negligible',
  'endocrine-tuner': 'Negligible',
  'subdermal-pocket': 'Negligible',
  'diagnostic-scanner': 'Negligible',
  'holo-tattoos': 'Negligible',
  'nu-tek-tvskin': 'Negligible',
  'nano-groomers': 'Negligible',

  // 4.1 Synth Limbs
  'hand': 'Negligible',
  'forearm': 'Negligible',
  'upper-arm': 'Negligible',
  'full-arm-assembly': 'Negligible',
  'foot': 'Negligible',
  'lower-leg': 'Negligible',
  'upper-leg-thigh': 'Negligible',
  'full-leg-assembly': 'Negligible',
  'synth-organ': 'Negligible',
  'prosthetic-skull': 'Heavy',
  'prosthetic-torso': 'Heavy',

  // 4.2 Hand & Foot Options
  'hammer-fist': 'Standard',
  'blade-fist-claws': 'Standard',
  'blade-fist': 'Standard',
  'claws': 'Standard',
  'spike-fist-needle': 'Standard',
  'spike-fist': 'Standard',
  'shock-knuckles': 'Standard',
  'tool-hand': 'Heavy',
  'weapon-hand': 'Heavy',
  'climbing-claws': 'Standard',
  'grappler-hand': 'Heavy',
  'cybersnake-whip': 'Standard',
  'cybersnake': 'Standard',
  'gripper-foot': 'Standard',
  'prehensile-foot': 'Standard',
  'skate-foot': 'Standard',
  'web-foot': 'Standard',

  // 4.3 Limb Upgrades
  'armor-plating': 'Standard',
  'hydraulic-rams': 'Standard',
  'forearm-shield': 'Heavy',
  'forearm-weapon': 'Heavy',
  'magnetic-grip': 'Standard',
  'quick-change-mount': 'Heavy',
  'smuggling-compartment': 'Standard',
  'reinforced-frame': 'Heavy',
  'shielding': 'Standard',
  'sectional-joint': 'Standard',
  'telescoping-limb': 'Heavy',
  'micro-missile-launcher': 'Heavy',
  'skinlike-synthskin': 'Standard',
  'skinlike': 'Standard',
  'synthskin': 'Standard',
  'jump-boost-legs': 'Heavy',
  'jump-boost': 'Heavy',
  'speed-boost-legs': 'Standard',
  'speed-boost': 'Standard',

  // 4.4 Exotic Limbs
  'synth-tentacle': 'Negligible',
  'digitigrade-leg': 'Negligible',
  'insectoid-limb': 'Negligible',
  'synth-wing': 'Negligible',

  // 5.1 Integrated Cybernetic Armor
  'integrated-cybernetic-armor': 'Standard',
  'integrated-armor-light': 'Standard',
  'integrated-armor-medium': 'Standard',
  'integrated-armor-heavy': 'Heavy',
  'integrated-armor-superheavy': 'Extreme',
  'integrated-armor-powered': 'Extreme',

  // 5. Body Modifications
  'air-supply': 'Standard',
  'anti-shock': 'Standard',
  'bionic-enhancement': 'Standard',
  'body-weapons': 'Standard',
  'hollow-fangs': 'Standard',
  'breathing-filter': 'Standard',
  'comm-implant': 'Standard',
  'dermal-armor': 'Standard',
  'disguise-system': 'Standard',
  'enhanced-antibody': 'Standard',
  'extra-shoulders': 'Heavy',
  'fortified-skeleton': 'Heavy',
  'frictionless-skin': 'Standard',
  'gills': 'Standard',
  'injector-unit': 'Standard',
  'internal-gyroscope': 'Standard',
  'muscle-bone-weave': 'Standard',
  'muscle-weave': 'Standard',
  'nutrient-processor': 'Standard',
  'poison-gland-sac': 'Standard',
  'poison-gland': 'Standard',
  'radiation-shielding': 'Standard',
  'redundant-organs': 'Standard',
  'reinforced-chassis': 'Heavy',
  'skull-plating': 'Heavy',
  'stabilizer': 'Standard',
  'tail': 'Standard',
  'trauma-response': 'Standard',
  'water-refiltration': 'Standard',

  // 6. Sensory Modifications - all Standard
  'nightvision': 'Standard',
  'ocular-drone': 'Standard',
  'targeting': 'Standard',
  'thermograph': 'Standard',
  'radar-sonar': 'Standard',
  'radar': 'Standard',
  'sonar': 'Standard',
  'sensory-recorder': 'Standard',
  'anti-flare': 'Standard',
  'flash-comp': 'Standard',
  'image-enhance': 'Standard',
  'micro-optics': 'Standard',
  'teleoptic': 'Standard',
  'tracking-scanner': 'Standard',
  'amplified-hearing': 'Standard',
  'bug-detector': 'Standard',
  'frequency-scanner': 'Standard',
  'scrambler': 'Standard',
  'sound-damper': 'Standard',
  'voice-disguiser': 'Standard',

  // 7. Brain Modifications
  'neural-processor': 'Standard',
  'ghost-jack': 'Standard',
  'mech-link': 'Standard',
  'nerve-hardwire': 'Standard',
  'reflex-co-proc': 'Standard',
  'digital-encephalon': 'Standard',
  'skill-circuitry': 'Standard',
  'behavioral-inhibitor': 'Negligible',
  'control-chips': 'Negligible',
  'data-bank': 'Standard',
  'deadman-s-switch': 'Negligible',
  'pain-filter': 'Standard',
  'sensory-shunt': 'Standard',
  'translator-implant': 'Standard',

  // 8. TL4 Enhanced Augmentations
  'body-conversion': 'Extreme',
  'trans-cerebral': 'Extreme',
  'chameleon-skin': 'Standard',
  'dermal-weave': 'Standard',
  'kinetic-shield': 'Standard',
  'adrenaline-shield': 'Standard',
  'alterable-bioform': 'Standard',
  'bodyform-nodes': 'Standard',
  'inertial-nullifier': 'Standard',
  'myomer-weave': 'Standard',
  'nerve-splicing': 'Standard',
  'pheromone-emitters': 'Standard',
  'picosurgeons': 'Standard',
  'nugenic-nodes': 'Standard',
  'accelerator': 'Standard',
  'data-archive': 'Standard',
  'ego-overlay': 'Standard',
  'synaptic-accelerator': 'Standard',
  'xr-imager': 'Standard',
  'anti-stun-implant': 'Standard',
  'biotech-emulator': 'Standard',
  'body-computer': 'Standard',
  'empathic-attune': 'Standard',
  'feature-circuit': 'Standard',
  'nootropic-enhancer': 'Standard',
  'psychotropic-act': 'Standard',
  'rage-implant': 'Standard',
  'smart-link': 'Standard',
  'cyber-jack': 'Standard',
  'surrogate-uplink': 'Standard',
  'skill-plexus': 'Standard',
  'synaptic-mask': 'Standard',
  'laser-eye': 'Standard',
  'optical-camo': 'Standard',

  // 9. TL5 Advanced Augmentations
  'matter-recon-forge': 'Extreme',
  'phase-shift-gen': 'Extreme',
  'aether-node': 'Standard',
  'digitized-consc': 'Extreme',
  'psi-implant': 'Standard',
  'temporal-stutter': 'Extreme',
  'gravity-attenuator': 'Standard',
  'quantum-storage': 'Standard',
  'programmable-bio': 'Standard',
  'distortion-field': 'Standard',
  'holophotonic-gear': 'Standard',
  'feat-plexus': 'Standard',
  'interface-sliver': 'Standard',
  'polymatter-struct': 'Heavy',
  'polymatter-surg': 'Heavy',

  // 10. FBC Packages
  'civilian-shell-light': 'Heavy',
  'civilian-shell': 'Heavy',
  'industrial-combat-heavy': 'Heavy',
  'industrial-combat': 'Heavy',
  'mekan-apex-tl-5-powered': 'Heavy',
  'mekan-apex': 'Heavy',

  // 12. Pseudo-Cybernetics
  'exo-harness': 'Negligible',
  'battle-gauntlet': 'Negligible',
  'sabatons': 'Negligible',
  'weapon-servo-rig': 'Negligible',
  'smart-goggles': 'Negligible',
  'load-lifter-rig': 'Negligible',
  'servo-arm': 'Negligible',
  'cyber-mecha-shell': 'Heavy'
};

const files = fs.readdirSync(augDir).filter(f => f.endsWith('.md'));
console.log(`Processing ${files.length} augmentation files in ${augDir}...`);

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(augDir, file);
  const fileId = file.replace(/\.md$/, '');
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(rawContent);
  const data = parsed.data || {};

  // Match stage
  let stage = 'Standard';
  if (CANONICAL_STAGES[fileId]) {
    stage = CANONICAL_STAGES[fileId];
  } else {
    // Check normalized name
    const cleanName = (data.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    if (CANONICAL_STAGES[cleanName]) {
      stage = CANONICAL_STAGES[cleanName];
    } else if (fileId.includes('skull') || fileId.includes('torso') || fileId.includes('heavy') || fileId.includes('reinforced')) {
      stage = 'Heavy';
    } else if (fileId.includes('conversion') || fileId.includes('extreme')) {
      stage = 'Extreme';
    }
  }

  data.stage = stage;
  const newContent = matter.stringify(parsed.content, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
  updatedCount++;
}

console.log(`Updated frontmatter with stage on ${updatedCount} files.`);
