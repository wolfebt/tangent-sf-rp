import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { ALL_CANONICAL_TRAITS } from '../src/data/speciesTraitsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const speciesDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'species');

const validTraits = new Set((ALL_CANONICAL_TRAITS || []).map(t => t.id));

const DROP_SLUGS = new Set([
  'trait-large-size',
  'trait-large-size-10ft',
  'trait-large-size-8-10ft-reach-10ft',
  'trait-large-size-12-18ft-serpentine-body-reach-10ft',
  'trait-small-size',
  'trait-small-size-brae-bonus',
  'trait-small-medium-size-shift',
  'trait-small-size-2-defense-2-stealth',
  'trait-tiny-size',
  'trait-tiny-size-4-defense-4-stealth',
  'trait-diminutive-size',
  'trait-diminutive-size-4-stealth-4-might',
  'trait-fine-size-6-stealth-passes-through-keyholes',
  'trait-fine-medium-alter-form',
  'trait-armless-quadruped-form',
  'trait-armless-4-penalty-to-manipulation'
]);

const REMAP_MAP = {
  // Fast heal
  'trait-fast-healing': 'trait-fast-heal',
  'trait-swarm-fast-heal-regeneration': 'trait-fast-heal',
  'trait-regenerative-sap': 'trait-fast-heal',
  'trait-field-self-repair-protocol': 'trait-fast-heal',
  'trait-self-healing-bio-circuits': 'trait-fast-heal',

  // Digitigrade / Ungulate
  'trait-digitigrade': 'trait-digitigrade-ungulated',
  'trait-digitigrade-legs': 'trait-digitigrade-ungulated',
  'trait-ungulate-legs-10ft-speed': 'trait-digitigrade-ungulated',
  'trait-ungulate-legs-sure-footed-on-cliffs': 'trait-digitigrade-ungulated',

  // Longevity / Sleep
  'trait-long-lived-600-years': 'trait-longevity',
  'trait-extended-lifespan-200-years': 'trait-longevity',
  'trait-sleepless-immune-to-sleep-effects': 'trait-sleepless',
  'trait-immune-to-sleep': 'trait-sleepless',

  // Natural weapons / Brutal
  'trait-natural-weapon-claws-bite': 'trait-natural-weapons',
  'trait-retractable-claws': 'trait-natural-weapons',
  'trait-horn-strike-melee-1d6': 'trait-natural-weapons',
  'trait-brutal-2-melee-damage': 'trait-brutal',
  'trait-brutal-3-melee-damage': 'trait-brutal',
  'trait-heavy-strike-2-damage': 'trait-brutal',

  // Prehensile Tail / Limbs / Climber
  'trait-long-prehensile-tail': 'trait-prehensile-tail',
  'trait-long-prehensile-tail-trip-hold': 'trait-prehensile-tail',
  'trait-prehensile-tail-feet': 'trait-prehensile-limbs',
  'trait-tentacles-4-prehensile-grasping-limbs': 'trait-prehensile-limbs',
  'trait-climbing': 'trait-climber',
  'trait-climb-speed-30ft': 'trait-climber',
  'trait-climbing-speed-30ft': 'trait-climber',

  // Multidextrous
  'trait-multidextrous': 'trait-additional-limbs',

  // Flight
  'trait-flight-winged-speed-50ft': 'trait-flight',
  'trait-flight-winged-40ft': 'trait-flight',
  'trait-flight-gossamer-wings-30ft': 'trait-flight',
  'trait-telekinetic-flight': 'trait-flight',
  'trait-flight-telekinetic-levitation-30ft': 'trait-flight',
  'trait-nano-flight-30ft': 'trait-flight',
  'trait-flight-in-wisp-form': 'trait-flight',

  // Senses
  'trait-acute-scent': 'trait-scent',
  'trait-uncanny-senses-acute-scent': 'trait-scent',
  'trait-uncanny-senses-acute-scent-hearing-4': 'trait-scent',
  'trait-uncanny-senses-scent-hearing-8': 'trait-scent',
  'trait-uncanny-senses-acute-hearing-sight': 'trait-all-around-vision',
  'trait-uncanny-senses-360-degree-vision-hearing': 'trait-all-around-vision',
  'trait-uncanny-senses-telescopic-vision-4': 'trait-all-around-vision',
  'trait-uncanny-sense-underwater-vision': 'trait-low-light-vision',
  'trait-echolocation-sonar': 'trait-blind-sense',
  'trait-echolocation-60ft-sonar': 'trait-blind-sense',
  'trait-specialized-senses-sonar': 'trait-blind-sense',
  'trait-specialized-senses-underwater-vision-sonar': 'trait-blind-sense',
  'trait-echo-sensitivity': 'trait-blind-sense',

  // Adapted / Aquatic
  'trait-adapted-arboreal': 'trait-adapted',
  'trait-adapted-aquatic': 'trait-adapted',
  'trait-adapted-deep-sea-pelagic': 'trait-adapted',
  'trait-adapted-cold-tundra': 'trait-adapted',
  'trait-adapted-cold-environments': 'trait-adapted',
  'trait-adapted-deep-ocean': 'trait-adapted',
  'trait-adapted-aquatic-deep-water': 'trait-adapted',
  'trait-radiation-tolerance': 'trait-adapted',
  'trait-atmosphere-variant-breathes-co2-toxics': 'trait-adapted',
  'trait-natural-swimming-speed': 'trait-aquatic',
  'trait-natural-swim-speed-30ft': 'trait-aquatic',
  'trait-natural-swim-speed-40ft': 'trait-aquatic',
  'trait-swim-speed-30ft': 'trait-aquatic',
  'trait-swim-glide-speed-40ft': 'trait-aquatic',
  'trait-swimmer': 'trait-aquatic',
  'trait-swimmer-bonus': 'trait-aquatic',
  'trait-hydrodynamic-skin': 'trait-aquatic',
  'trait-amphibious-gills-lungs': 'trait-amphibious',
  'trait-aquatic-strength-2-in-water': 'trait-aquatic-strength',

  // Armor & Exoskeleton
  'trait-exoskeleton-light-chitin-dr-3': 'trait-exoskeleton-light',
  'trait-exoskeleton-light-scales-dr-2': 'trait-exoskeleton-light',
  'trait-exoskeleton-light-plating-dr-3': 'trait-exoskeleton-light',
  'trait-exoskeleton-dr-3': 'trait-exoskeleton-light',
  'trait-exoskeleton-partial-chitinous-plates-dr-2': 'trait-exoskeleton-partial',
  'trait-exoskeleton-partial-sub-dermal-plates-dr-3': 'trait-exoskeleton-partial',
  'trait-stone-metal-alloy-body-dr-8': 'trait-exoskeleton-heavy',
  'trait-scrap-plating-dr-6': 'trait-exoskeleton-heavy',
  'trait-reinforced-chassis-dr-6': 'trait-exoskeleton-heavy',
  'trait-massive-bulk-dr-3': 'trait-natural-armor',
  'trait-dense-skeletal-structure': 'trait-natural-armor',
  'trait-resilient-design': 'trait-natural-armor',

  // Regeneration
  'trait-regeneration-2-hp-rnd': 'trait-regeneration',
  'trait-regeneration-3-hp-rnd': 'trait-regeneration',
  'trait-regeneration-3-hp-rnd-regrows-limbs': 'trait-regeneration',

  // Movement & Reactions
  'trait-quick-5ft-movement': 'trait-quick',
  'trait-quick-movement': 'trait-quick',
  'trait-quick-speed': 'trait-quick',
  'trait-fast-10ft-movement': 'trait-quick',
  'trait-fast-move-10ft': 'trait-quick',
  'trait-high-metabolism': 'trait-quick',
  'trait-hollow-bone-agility': 'trait-quick',
  'trait-fast-runner-10ft': 'trait-runner',
  'trait-jumper-spring-stride': 'trait-leaper',
  'trait-jumper-5ft-vertical': 'trait-leaper',
  'trait-patagia-glide-30ft': 'trait-patagia',
  'trait-thermal-current-riding': 'trait-patagia',
  'trait-quick-reactions-bonus': 'trait-quick-reactions',
  'trait-quick-reflexes': 'trait-quick-reactions',
  'trait-quadruped-speed-40ft': 'trait-quadruped',
  'trait-silent-step': 'trait-silent-hunter',
  'trait-silent-stride': 'trait-silent-hunter',
  'trait-stable-stance': 'trait-stable-footed',

  // Telepathy / Mind speech
  'trait-telepathic-100ft': 'trait-mind-speech',
  'trait-telepathic-150ft': 'trait-mind-speech',
  'trait-telepathy-100ft': 'trait-mind-speech',
  'trait-telepathy-special-ability': 'trait-mind-speech',
  'trait-telepathic-technopathic-network': 'trait-mind-speech',
  'trait-consensus-mesh-telepathy': 'trait-mind-speech',
  'trait-vocal-synthesizer-telepathic-collar': 'trait-mind-speech',
  'trait-psychic-aura': 'trait-mind-speech',

  // Alter Form
  'trait-alter-form-humanoid': 'trait-alter-form-basic',
  'trait-alter-form-humanoid-special-ability': 'trait-alter-form-basic',
  'trait-alter-form-minor-facial-skin-hair-shift': 'trait-alter-form-basic',
  'trait-thermal-simulation': 'trait-alter-form-basic',
  'trait-alter-self-advanced-cellular-surface': 'trait-alter-form-adv',
  'trait-alter-form-advanced': 'trait-alter-form-adv',
  'trait-alter-form-adv-animal': 'trait-alter-form-adv',
  'trait-alter-form-animal': 'trait-alter-form-adv',
  'trait-alter-form-animal-advanced': 'trait-alter-form-adv',
  'trait-alter-form-wisp-special-ability': 'trait-alter-form-adv',
  'trait-alter-form-wisp-orb-form-special-ability': 'trait-alter-form-adv',
  'trait-alter-form-amorphous-slime-pseudo-humanoid': 'trait-alter-form-adv',
  'trait-alter-form-root-vine-morph': 'trait-alter-form-adv',
  'trait-alter-form-void-wisp-shadow-special-ability': 'trait-alter-form-adv',
  'trait-synthetic-flesh-shroud-indistinguishable-from-organic-to-casual-scans': 'trait-alter-form-adv',
  'trait-alternate-form-manta-ray-flight-form': 'trait-alternate-form',
  'trait-alternate-form-humanoid-beast-form': 'trait-alternate-form',

  // Chameleon / Stealth
  'trait-chameleon-skin-4-stealth': 'trait-chameleon',
  'trait-chameleon-3-stealth-in-natural-environments': 'trait-chameleon',
  'trait-bioluminescent-body-glow': 'trait-shadow-blending',

  // Chloroplast
  'trait-chloroplast-cells-sustained-by-sunlight-2-sta-in-sun': 'trait-chloroplast',
  'trait-chloroplast-energy-photosynthesis': 'trait-chloroplast',
  'trait-photonic-bleed-energy-sustenance': 'trait-chloroplast',

  // Surge / Rage
  'trait-mighty-surge-resolve': 'trait-mighty-surge',
  'trait-mighty-surge-1-encounter-bonus-to-str-sta-checks': 'trait-mighty-surge',
  'trait-mighty-surge-bonus-str-athletics': 'trait-mighty-surge',
  'trait-rage-4-str-2-defense-in-combat-1-enc': 'trait-frenzy',
  'trait-combat-rage-1-encounter': 'trait-frenzy',
  'trait-feral-combat-rage': 'trait-frenzy',

  // Constriction & Venom
  'trait-constriction-deals-double-damage-on-successful-grapple-hold': 'trait-constriction',
  'trait-venomous-fangs-paralytic-poison-dc-15': 'trait-venom',

  // Semi-corporeal / Non-living / Immortality
  'trait-semi-corporeal-pass-through-walls': 'trait-semi-corporeal',
  'trait-corporeal-as-desired': 'trait-semi-corporeal',
  'trait-dispersal-defense-immune-to-single-target-physical-attacks': 'trait-semi-corporeal',
  'trait-non-living-energy-entity': 'trait-non-living',
  'trait-ghost-in-the-machine-resilience': 'trait-self-revivifying',

  // Dragonkin & Lineages
  'trait-dragonkin-lineage-traits': 'trait-dragonkin-traits',
  'trait-dragonkin-heritage-scales-dr-2': 'trait-dragonkin-traits',
  'trait-dragonkin-traits-partial-scales-dr-1-heat-resistance': 'trait-dragonkin-traits',
  'trait-auluran-heritage-traits': 'trait-auluran-base-traits',
  'trait-auluran-base-traits-biotechnology-low-light-vision-prehensile-feet-tail-scent-nat-weapons': 'trait-auluran-base-traits',
  'trait-asi-base-traits-ageless-obfuscate-sleepless': 'trait-asi-base-traits',
  'trait-progenitor-traits-awakened-x6-telepathy-telekinesis-fast-heal-regeneration-ageless-immortal': 'trait-progenitor-heritage-base',

  // Synthetics
  'trait-digitized-mind': 'trait-resistant',
  'trait-robotic-strength': 'trait-powerful-charge',
  'trait-heavy-industrial-motors': 'trait-powerful-charge',
  'trait-colossal-carrying-capacity': 'trait-powerful-charge',
  'trait-double-adaptive-aspects': 'trait-adaptive-features',
  'trait-adaptive-aspects': 'trait-adaptive-features',
  'trait-adaptive-task-aspects': 'trait-adaptive-features',
  'trait-adaptive-aspects-rapid-evolutionary-resistance': 'trait-adaptive-features',
  'trait-adaptive-aspects-acid-thermal-immunity': 'trait-adaptive-features',
  'trait-non-typical-anatomy': 'trait-adaptive-features',
  'trait-non-typical-anatomy-no-vital-organs': 'trait-adaptive-features',
  'trait-tech-assimilation-integrates-alien-gear-instantly': 'trait-synthetic-tech-assim',
  'trait-tech-assimilation-rapid-tool-swap': 'trait-synthetic-tech-assim',
  'trait-technokinesis-special-ability': 'trait-synthetic-tech-assim',
  'trait-matter-reshaping-special-ability': 'trait-synthetic-tech-assim',
  'trait-heavy-augmentation-slots-3-free-cyber-slots': 'trait-synthetic-armor-opts',
  'trait-augmented-chassis-body-comp-picosurgeons-smart-link': 'trait-synthetic-armor-opts',
  'trait-augmented-sub-dermal-body-comp-pico-surgeons-smart-link': 'trait-synthetic-armor-opts',
  'trait-augmented-sub-dermal-targeter-adrenal-regulator': 'trait-synthetic-armor-opts',
  'trait-augmented-military-frame': 'trait-natural-armor',
  'trait-direct-usb-data-jack': 'trait-master-tinker',
  'trait-neural-stack-integration-organic-consciousness-housing': 'trait-synthetic-aux-core',
  'trait-hive-mind-protocol': 'trait-hive-connection',
  'trait-magic-core-power': 'trait-energy-absorption',
  'trait-spell-resistance-4-vs-magic': 'trait-resistant',
  'trait-comms-array-mastery-instant-holo-link': 'trait-mind-speech',
  'trait-hyper-threading-logic-engine': 'trait-quick-reactions',
  'trait-tech-level-5-meta-level-5-relic-matrix': 'trait-synthetic-exotic-opt',
  'trait-crystalline-photonic-physiology': 'trait-energy-immunity',
  'trait-flawless-etiquette-calculation': 'trait-emissary',

  // Awakened mappings
  'trait-awakened-mental-psychic': 'trait-awakened-mental',
  'trait-awakened-psychic-discipline': 'trait-awakened-psychic',
  'trait-awakened-psychic-telepathy': 'trait-awakened-psychic',
  'trait-awakened-psionic': 'trait-awakened-psychic',
  'trait-awakened-nature-psychic': 'trait-awakened-nature',
  'trait-awakened-natural-wisdom': 'trait-awakened-nature',
  'trait-awakened-serpentine-metaphysics': 'trait-awakened-nature',
  'trait-awakened-dimension-psychic': 'trait-awakened-dimension',
  'trait-flicker-movement-teleport-60ft-as-move-action': 'trait-awakened-dimension',
  'trait-teleportal-special-ability-short-jump': 'trait-awakened-dimension',
  'trait-homing-beacon-spatial-anchor': 'trait-awakened-dimension',
  'trait-homing-special-ability-spatial-recall': 'trait-awakened-dimension',
  'trait-telekinesis-special-ability': 'trait-awakened-arcane',
  'trait-arcane-affinity': 'trait-awakened-arcane',
  'trait-corrupted-void-traits': 'trait-awakened-void',
  'trait-void-resonance': 'trait-awakened-void',

  // Biological / Specific
  'trait-reach-5ft-melee-reach-with-tongue-limbs': 'trait-reach',
  'trait-verdant-flesh-plant-entity': 'trait-autotroph',
  'trait-hybrid-metabolism-fuel-or-food': 'trait-autotroph',
  'trait-bodyform-adaptation-squeeze-through-any-opening': 'trait-bodyform-adaptation',
  'trait-bodyform-acclimation-0-cyber-strain': 'trait-bodyform-adaptation',
  'trait-vampiric-4-essence-drain-need': 'trait-vampiric-power',
  'trait-fey-animal-affinity': 'trait-fey-affinity',
  'trait-animal-affinity': 'trait-fey-affinity',
  'trait-silver-tongue': 'trait-silver-tongued',
  'trait-pack-tactics-2-to-hit-when-flanking': 'trait-swarming',
  'trait-dense-musculature': 'trait-natural-armor',
  'trait-giant-stature-resilience': 'trait-natural-armor',
  'trait-poison-resistance': 'trait-hardy',
  'trait-pain-tolerance': 'trait-hardy',
  'trait-great-fortitude-improved': 'trait-healthy',
  'trait-improved-great-fortitude': 'trait-healthy',
  'trait-improved-great-fortitude-bonus': 'trait-healthy',
  'trait-improved-great-fortitude-4-vs-poison-disease': 'trait-healthy',
  'trait-genetic-optimization-disease-immunity-retinal-filter': 'trait-healthy',
  'trait-indomitable-will': 'trait-resistant',
  'trait-absolute-mental-fortitude': 'trait-resistant',
  'trait-mind-wipe-resistance': 'trait-resistant',
  'trait-conditioned-mind-4-vs-fear': 'trait-resistant',
  'trait-martial-arts': 'trait-bonus-feature',
  'trait-biotechnology-affinity': 'trait-enhanced-biotechnology',
  'trait-biotech-affinity': 'trait-enhanced-biotechnology',
  'trait-biotech-adaptation': 'trait-enhanced-biotechnology',
  'trait-biotechnology-integration': 'trait-enhanced-biotechnology',
  'trait-biotech-synergy': 'trait-enhanced-biotechnology',
  'trait-biotechnology-2-crafting': 'trait-master-tinker',
  'trait-biotechnology-mastery': 'trait-master-tinker',
  'trait-hive-connection-low-band-telepathy': 'trait-hive-connection',
  'trait-hive-connection-shared-telepathic-mesh': 'trait-hive-connection',
  'trait-davae-mind-link': 'trait-hive-connection',
  'trait-cold-discipline': 'trait-energy-resist',
  'trait-fiery-resolve': 'trait-energy-resist',
  'trait-aberrant-mutations-tentacles-eyes-claws': 'trait-bodyform-mutation',
  'trait-animalistic-mutation': 'trait-bodyform-mutation',
  'trait-radical-mutation': 'trait-bodyform-mutation',
  'trait-2-splice-mutations-natural-weapons-chitin-fur-tail': 'trait-bodyform-mutation',
  'trait-mutation-power-special-perk': 'trait-bodyform-mutation',
  'trait-perfect-memory': 'trait-shards-of-the-past',
  'trait-sense-alignment-intent': 'trait-emissary',
  'trait-intuitive-empathy': 'trait-emissary',
  'trait-status-dynasty-heritage': 'trait-sociable',
  'trait-status-dynasty-ties': 'trait-sociable',
  'trait-status-high-nobility': 'trait-sociable',
  'trait-status-impyrium-privilege': 'trait-sociable',
  'trait-status-impyrium-authority': 'trait-sociable',
  'trait-aristocratic-immunity': 'trait-sociable',
  'trait-status-imperial-nobility': 'trait-sociable',
  'trait-syndicate-network': 'trait-integrated',
  'trait-calculating-mind': 'trait-focused-study',
  'trait-combat-doctrine-specialization': 'trait-focused-study',
  'trait-combat-specialization': 'trait-focused-study',
  'trait-awakened-consciousness-human-level-sentience': 'trait-focused-study',
  'trait-broad-horizons-1-feature-at-creation': 'trait-bonus-feature',
  'trait-bonus-human-feature': 'trait-bonus-feature',
  'trait-adaptive-enhancement-slot': 'trait-bonus-feature',
  'trait-chimeric-species-features': 'trait-bonus-feature',
  'trait-ai-companion-interface': 'trait-bonus-feature',
  'trait-companion-integrated-sub-ai-assistant': 'trait-bonus-feature',
  'trait-companion-remotes-commands-2-drone-units': 'trait-bonus-feature',
  'trait-custom-gene-blueprint-1-free-feature': 'trait-bonus-feature',
  'trait-animal-physiology-natural-weapons-scent-low-light': 'trait-natural-weapons'
};

function remapSpeciesFiles() {
  const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Processing ${files.length} species markdown files...`);

  let modifiedFiles = 0;
  let remappedTraitsCount = 0;
  let droppedSlugsCount = 0;

  files.forEach(file => {
    const fullPath = path.join(speciesDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};

    const rawTraits = Array.isArray(data.traits) ? data.traits : [];
    const newTraits = [];
    let fileChanged = false;

    rawTraits.forEach(t => {
      if (DROP_SLUGS.has(t)) {
        droppedSlugsCount++;
        fileChanged = true;
        // If it was armless, ensure species disadvantage is recorded
        if (t.includes('armless')) {
          if (!Array.isArray(data.disadvantages)) data.disadvantages = [];
          if (!data.disadvantages.includes('disadvantage-species-armless')) {
            data.disadvantages.push('disadvantage-species-armless');
          }
        }
        return;
      }

      if (REMAP_MAP[t]) {
        const canonical = REMAP_MAP[t];
        remappedTraitsCount++;
        fileChanged = true;
        if (canonical && !newTraits.includes(canonical)) {
          newTraits.push(canonical);
        }
        return;
      }

      if (validTraits.has(t)) {
        if (!newTraits.includes(t)) {
          newTraits.push(t);
        }
        return;
      }

      console.warn(`[WARN] File ${file} has unmapped trait: ${t}`);
      newTraits.push(t);
    });

    if (fileChanged) {
      data.traits = newTraits;
      data.species_traits = newTraits;
      modifiedFiles++;

      const newContent = matter.stringify(parsed.content, data);
      fs.writeFileSync(fullPath, newContent, 'utf8');
    }
  });

  console.log(`\n=== REMAPPING SUMMARY ===`);
  console.log(`Modified Species Files: ${modifiedFiles} / ${files.length}`);
  console.log(`Remapped Trait Slugs: ${remappedTraitsCount}`);
  console.log(`Dropped Dimensional/Redundant Slugs: ${droppedSlugsCount}`);
}

remapSpeciesFiles();
