import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { DEFAULT_FEATURES } from '../src/data/featuresData.js';
import { ALL_CANONICAL_TRAITS } from '../src/data/speciesTraitsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const speciesDir = path.join(rootDir, 'src', 'data', 'omnicortex', 'species');

// Catalog Lookups
const featById = new Map();
const featByName = new Map();
DEFAULT_FEATURES.forEach(f => {
  featById.set(f.id.toLowerCase(), f);
  featByName.set(f.name.toLowerCase(), f);
  const base = f.name.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
  if (!featByName.has(base)) featByName.set(base, f);
});

const traitById = new Map();
const traitByName = new Map();
ALL_CANONICAL_TRAITS.forEach(t => {
  traitById.set(t.id.toLowerCase(), t);
  const name = (t.name || t.id).toLowerCase();
  traitByName.set(name, t);
  const base = name.replace(/\s*\([^)]*\)/g, '').trim();
  if (!traitByName.has(base)) traitByName.set(base, t);
});

// Canonical Feature Aliases for Species Compendium Terms
const FEATURE_ALIASES = {
  'agile maneuvers': 'Agile Wrestling',
  'combat specialization': 'Weapon Specialization',
  'martial arts': 'Martial Arts Mastery',
  'sense magic': 'Magical Aptitude',
  'alertness': 'Acute Senses',
  'acute sense': 'Acute Senses',
  'acute senses': 'Acute Senses',
  'animal companion': 'Companion',
  'speak with animals': 'Wild Speech',
  'survival expertise': 'Survivalist',
  'track': 'Tracker',
  'wilderness stride': 'Favored Environment',
  'combat reflexes': 'Combat Reflexes',
  'quick reflexes': 'Lightning Reflexes',
  'adaptive aspect': 'Adaptive Aspects (Hive Memories)',
  'adaptive aspects': 'Adaptive Aspects (Hive Memories)',
  'adaptive skill set': 'Jack of all trades',
  'exoskeleton': 'Armor (Chitinous Shell)',
  'exoskeleton (partial)': 'Armor (Chitinous Shell)',
  'gearhead': 'Master Craftsman',
  'low light vision': 'Low Light Vision',
  'low light vision line': 'Low Light Vision',
  'darksight': 'Darksight',
  'night vision': 'Night Vision',
  'headstrong': 'Iron Will',
  'mighty surge': 'Mighty Surge',
  'feature-mighty-surge': 'Mighty Surge',
  'feature-lightning-reflexes': 'Lightning Reflexes',
  'feature-phase-shift': 'Phase Shift',
  'feature-combat-rage': 'Combat Rage',
  'combat-rage': 'Combat Rage',
  'combat rage': 'Combat Rage',
  'feature-primal-regeneration': 'Regeneration',
  'primal-regeneration': 'Regeneration',
  'feature-thought-probe': 'Mind Link',
  'thought-probe': 'Mind Link',
  'thought probe': 'Mind Link',
  'feature-royal-command': 'Leadership',
  'royal-command': 'Leadership',
  'royal command': 'Leadership',
  'feature-quick': 'Lightning Reflexes',
  'feature-brutal': 'Brutal',
  'feature-echolocation': 'Acute Senses',
  'feature-engulf-attack': 'Natural Weapons',
  'feature-tree-glider': 'Wall-Crawler',
  'feature-chameleon-skin': 'Camouflage',
  'feature-adhesive-tongue-strike': 'Natural Weapons',
  'feature-constriction': 'Agile Wrestling',
  'feature-quantum-decryption': 'Digital Expert',
  'fearless': 'Iron Will',
  'runner': 'Runner',
  'run': 'Runner',
  'quick': 'Lightning Reflexes',
  'quick line': 'Lightning Reflexes',
  'climber': 'Wall-Crawler',
  'self sufficient': 'Self-Sufficient',
  'self-sufficient': 'Self-Sufficient',
  'double jointed': 'Contortionist',
  'quicker': 'Lightning Reflexes',
  'toxic blood': 'Toxic Resistance',
  'poison immunity': 'Tolerance',
  'silver tongue': 'Silver Tongue',
  'eidetic memory': 'Lightning Calculator',
  'contacts': 'Connected',
  'well informed': 'Educated',
  'medical specialist': 'Field Medic',
  'great fortitude': 'Great Fortitude',
  'potent might': 'Brutal',
  'throwing': 'Weapon Focus',
  'tough': 'Tough',
  'rugged': 'Tough',
  'ambidexterity': 'Two-Weapon Fighting',
  'obfuscate': 'Stealthy',
  'fortitude resistance': 'Great Fortitude',
  'improved healing': 'Fast Heal',
  'acrobatic': 'Acrobatic Steps',
  'athletic': 'Athletics Training',
  'nimble': 'Lightning Reflexes',
  'dragonkin features': 'Dragonkin Features',
  'discipline features': 'Discipline Features',
  'karma features': 'Karma Features',
  'ability check features': 'Ability Check Features',
  'skill features': 'Skill Specialization',
  'fast heal': 'Fast Heal',
  'regeneration': 'Regeneration',
  'wild speech': 'Wild Speech',
  'deceitful': 'Deceitful',
  'persuasive': 'Silver Tongue',
  'trustworthy': 'Trustworthy',
  'companion': 'Companion',
  'chameleon': 'Camouflage',
  'natural weapons': 'Natural Weapons',
  'endurance': 'Endurance',
  'echolocation': 'Acute Senses',
  'blindsense': 'Acute Senses',
  'danger sense': 'Danger Sense',
  'flight': 'Flight',
  'constriction': 'Agile Wrestling',
  'ink cloud': 'Camouflage',
  'brutal': 'Brutal',
  'integrated heavy augmentations': 'Augmented',
  'integrated severe augmentations': 'Augmented',
  'augmentations': 'Augmented',
  'skill focus line': 'Skill Focus'
};

// Fallback recommendations for species lacking explicit body lines
const LINEAGE_FALLBACKS = {
  'species-asi-tozen.md': ['Acute Senses', 'Discipline Features', 'Fast Heal', 'Lightning Reflexes', 'Stealthy'],
  'species-asi-whisper.md': ['Acute Senses', 'Deceitful', 'Discipline Features', 'Fast Heal', 'Stealthy'],
  'species-auluran-dar.md': ['Awakened', 'Fast Heal', 'Natural Weapons', 'Runner', 'Tough', 'Tolerance'],
  'species-auluran-koda.md': ['Awakened', 'Fast Heal', 'Natural Weapons', 'Runner', 'Stealthy', 'Wall-Crawler'],
  'species-awakened-animal.md': ['Acute Senses', 'Danger Sense', 'Natural Weapons', 'Runner', 'Wild Speech', 'Tough'],
  'species-human-rautha.md': ['Endurance', 'Favored Environment', 'Runner', 'Self-Sufficient', 'Tolerance', 'Tough'],
  'species-praeti.md': ['Armor (Chitinous Shell)', 'Darksight', 'Natural Weapons', 'Tolerance', 'Tough'],
  'species-progenitor-ila.md': ['Discipline Features', 'Educated', 'Iron Will', 'Lightning Calculator', 'Master Craftsman'],
  'species-progenitor-unonn.md': ['Discipline Features', 'Educated', 'Iron Will', 'Lightning Calculator', 'Master Craftsman'],
  'species-shanor-base.md': ['Darksight', 'Deceitful', 'Discipline Features', 'Iron Will', 'Stealthy'],
  'species-shanor-eakren.md': ['Darksight', 'Deceitful', 'Discipline Features', 'Iron Will', 'Stealthy'],
  'species-shanor-tenen.md': ['Darksight', 'Deceitful', 'Discipline Features', 'Iron Will', 'Stealthy'],
  'species-synthetic-android.md': ['Educated', 'Lightning Calculator', 'Master Craftsman', 'Tough'],
  'species-synthetic-eidolon.md': ['Darksight', 'Discipline Features', 'Educated', 'Lightning Calculator'],
  'species-synthetic-protocol.md': ['Connected', 'Educated', 'Lightning Calculator', 'Silver Tongue'],
  'species-synthetic-shell.md': ['Armor (Chitinous Shell)', 'Brutal', 'Mighty Surge', 'Tough'],
  'species-synthetic-skin.md': ['Camouflage', 'Deceitful', 'Jack of all trades', 'Stealthy'],
  'species-synthetic-swarm.md': ['Coordinated Assist', 'Darksight', 'Lightning Calculator', 'Wall-Crawler'],
  'species-weti.md': ['Acute Senses', 'Danger Sense', 'Runner', 'Self-Sufficient', 'Tracker', 'Wall-Crawler'],
  'species-orll-base.md': ['Darksight', 'Natural Weapons', 'Tough', 'Wall-Crawler'],
  'species-orll-graor.md': ['Armor (Chitinous Shell)', 'Darksight', 'Natural Weapons', 'Tough', 'Wall-Crawler'],
  'species-synthetic-golem.md': ['Armor (Chitinous Shell)', 'Brutal', 'Mighty Surge', 'Tough'],
  'species-synthetic-intellect.md': ['Digital Expert', 'Educated', 'Lightning Calculator'],
  'species-synthetic-scrap.md': ['Augmented', 'Master Craftsman', 'Tough'],
  'species-synthetic-sentient-machine.md': ['Digital Expert', 'Master Craftsman', 'Tough']
};

export function migrateSpecies() {
  const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Auditing and migrating ${files.length} species files...`);

  let updatedCount = 0;

  for (const file of files) {
    const fullPath = path.join(speciesDir, file);
    const content = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
    const parsed = matter(content);
    const data = parsed.data || {};
    const body = parsed.content || '';

    let rawList = [];
    const m = body.match(/\*\*(?:Recommended Features|Typical Features|Typical Species Features|Recommended Traits and Features):?\*\*([\s\S]*?)(?=\n\s*###|\n\s*\*\*|\n\s*#|$)/i);
    const bodyText = m && m[1] ? m[1].trim() : '';

    if (bodyText && !bodyText.startsWith('___')) {
      const raw = bodyText.replace(/\n/g, ' ');
      if (raw.startsWith(': feature-') || raw.startsWith('feature-')) {
        rawList = raw.replace(/^:\s*/, '').split(/[\s,]+/).map(x => x.trim()).filter(Boolean);
      } else {
        rawList = raw.split(/(?:,|\s{3,}|\t)+/).map(x => x.trim()).filter(Boolean);
      }
    }

    if (rawList.length === 0) {
      if (Array.isArray(data.recommended_features) && data.recommended_features.length > 0) {
        rawList = data.recommended_features;
      } else if (LINEAGE_FALLBACKS[file]) {
        rawList = LINEAGE_FALLBACKS[file];
      }
    }

    const resolvedFeatures = new Set();
    const existingTraits = new Set((Array.isArray(data.traits) ? data.traits : []).map(t => String(t).toLowerCase()));

    for (const item of rawList) {
      let clean = item.replace(/\\\*/g, '').replace(/\*/g, '').replace(/\.$/, '').trim();
      if (!clean || clean.length < 2 || clean.startsWith('___') || clean.startsWith(':')) continue;

      const lower = clean.toLowerCase();
      const base = lower.replace(/\s*\([^)]*\)/g, '').trim();

      // Check Feature Aliases first
      if (FEATURE_ALIASES[lower]) {
        resolvedFeatures.add(FEATURE_ALIASES[lower]);
      } else if (FEATURE_ALIASES[base]) {
        resolvedFeatures.add(FEATURE_ALIASES[base]);
      }
      // Check Direct Feature Match
      else if (featByName.has(lower)) {
        resolvedFeatures.add(featByName.get(lower).name);
      } else if (featByName.has(base)) {
        resolvedFeatures.add(featByName.get(base).name);
      } else if (featById.has(lower)) {
        resolvedFeatures.add(featById.get(lower).name);
      } else if (featById.has('feature-' + base.replace(/\s+/g, '-'))) {
        resolvedFeatures.add(featById.get('feature-' + base.replace(/\s+/g, '-')).name);
      } else if (featById.has('ability-' + base.replace(/\s+/g, '-'))) {
        resolvedFeatures.add(featById.get('ability-' + base.replace(/\s+/g, '-')).name);
      } else if (featById.has('combat-' + base.replace(/\s+/g, '-'))) {
        resolvedFeatures.add(featById.get('combat-' + base.replace(/\s+/g, '-')).name);
      } else if (featById.has('general-' + base.replace(/\s+/g, '-'))) {
        resolvedFeatures.add(featById.get('general-' + base.replace(/\s+/g, '-')).name);
      } else if (featById.has('special-' + base.replace(/\s+/g, '-'))) {
        resolvedFeatures.add(featById.get('special-' + base.replace(/\s+/g, '-')).name);
      }
      // Check Trait Match -> Ensure it's in traits
      else if (traitByName.has(lower)) {
        const tObj = traitByName.get(lower);
        existingTraits.add(tObj.id.toLowerCase());
      } else if (traitByName.has(base)) {
        const tObj = traitByName.get(base);
        existingTraits.add(tObj.id.toLowerCase());
      } else if (traitById.has(lower)) {
        existingTraits.add(traitById.get(lower).id.toLowerCase());
      } else if (traitById.has('trait-' + base.replace(/\s+/g, '-'))) {
        existingTraits.add(traitById.get('trait-' + base.replace(/\s+/g, '-')).id.toLowerCase());
      }
      // Check category features (Discipline, Karma, Dragonkin, etc.)
      else if (lower.includes('discipline')) {
        resolvedFeatures.add('Discipline Features');
      } else if (lower.includes('karma')) {
        resolvedFeatures.add('Karma Features');
      } else if (lower.includes('dragonkin')) {
        resolvedFeatures.add('Dragonkin Features');
      } else if (lower.includes('ability check')) {
        resolvedFeatures.add('Ability Check Features');
      }
    }

    // If still empty, check lineage fallbacks
    if (resolvedFeatures.size === 0 && LINEAGE_FALLBACKS[file]) {
      for (const item of LINEAGE_FALLBACKS[file]) {
        resolvedFeatures.add(item);
      }
    }

    // Sort features alphabetically
    const sortedFeatures = Array.from(resolvedFeatures).sort();
    const sortedTraits = Array.from(existingTraits).sort();

    // Update frontmatter
    data.recommended_features = sortedFeatures;
    data.traits = sortedTraits;

    // Write back file preserving gray-matter formatting
    const newContent = matter.stringify(body, data);
    fs.writeFileSync(fullPath, newContent, 'utf8');
    updatedCount++;
  }

  console.log(`Successfully migrated and updated frontmatter for ${updatedCount} species files.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateSpecies();
}
