import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const speciesDir = path.join(rootDir, 'src', 'data', 'omnicortex', 'species');

async function runAlignment() {
  const eMod = await import('../src/engines/tangentEntityEngines.js');
  const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.md')).sort();

  console.log(`Starting canonical species alignment for ${files.length} species files...\n`);

  let modifiedCount = 0;

  for (const file of files) {
    const fullPath = path.join(speciesDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const fm = parsed.data;

    let changed = false;

    // 1. Specific lineage refinements:
    // Aeld Alterian: simplify traits to Aeld Lineage Traits
    if (fm.id === 'species-aeld-alterian') {
      fm.traits = ['trait-aeld-lineage-traits'];
      fm.species_traits = ['trait-aeld-lineage-traits'];
      changed = true;
    }

    // Aeld Doppelganger
    if (fm.id === 'species-aeld-doppelganger') {
      fm.traits = ['trait-aeld-lineage-traits', 'trait-alter-form-basic', 'trait-wyrm-senses'];
      fm.species_traits = ['trait-aeld-lineage-traits', 'trait-alter-form-basic', 'trait-wyrm-senses'];
      changed = true;
    }

    // Aeld Draconian
    if (fm.id === 'species-aeld-draconian') {
      fm.traits = ['trait-aeld-lineage-traits', 'trait-dragonkin-traits', 'trait-natural-weapons'];
      fm.species_traits = ['trait-aeld-lineage-traits', 'trait-dragonkin-traits', 'trait-natural-weapons'];
      changed = true;
    }

    // Aeld Kovian
    if (fm.id === 'species-aeld-kovian') {
      fm.traits = ['trait-aeld-lineage-traits'];
      fm.species_traits = ['trait-aeld-lineage-traits'];
      if (!fm.inherent_attribute_modifiers.some(a => a.attribute === 'Stamina')) {
        fm.inherent_attribute_modifiers.push({ attribute: 'Stamina', bonus: 1 });
      }
      changed = true;
    }

    // Aeld Vajar
    if (fm.id === 'species-aeld-vajar') {
      if (!fm.inherent_attribute_modifiers.some(a => a.attribute === 'Agility')) {
        fm.inherent_attribute_modifiers.push({ attribute: 'Agility', bonus: 2 });
      }
      changed = true;
    }

    // Asi Lineages: deduplicate ageless & immortal since trait-asi-base-traits provides Ageless
    if (fm.id.startsWith('species-asi-') && Array.isArray(fm.traits)) {
      if (fm.traits.includes('trait-asi-base-traits')) {
        const cleaned = fm.traits.filter(t => t !== 'trait-ageless' && t !== 'trait-immortal');
        // also remove duplicate flight/diminutive if represented in size/movement
        if (fm.id === 'species-asi-fey-base') {
          fm.traits = ['trait-asi-base-traits', 'trait-awakened-nature'];
          fm.species_traits = ['trait-asi-base-traits', 'trait-awakened-nature'];
          changed = true;
        } else if (fm.id === 'species-asi-frellin') {
          fm.traits = ['trait-asi-base-traits', 'trait-awakened-arcane', 'trait-dark-sight', 'trait-mind-speech'];
          fm.species_traits = ['trait-asi-base-traits', 'trait-awakened-arcane', 'trait-dark-sight', 'trait-mind-speech'];
          changed = true;
        } else if (fm.id === 'species-asi-koban') {
          if (!fm.inherent_attribute_modifiers || fm.inherent_attribute_modifiers.length === 0) {
            fm.inherent_attribute_modifiers = [{ attribute: 'Agility', bonus: 1 }];
          }
          fm.traits = ['trait-asi-base-traits', 'trait-climber', 'trait-alter-form-basic', 'trait-awakened-nature'];
          fm.species_traits = ['trait-asi-base-traits', 'trait-climber', 'trait-alter-form-basic', 'trait-awakened-nature'];
          changed = true;
        } else if (fm.id === 'species-asi-wildling') {
          if (!fm.inherent_attribute_modifiers || fm.inherent_attribute_modifiers.length === 0) {
            fm.inherent_attribute_modifiers = [{ attribute: 'Agility', bonus: 1 }];
          }
          fm.traits = ['trait-asi-base-traits', 'trait-fey-affinity', 'trait-climber', 'trait-alter-form-adv', 'trait-awakened-nature'];
          fm.species_traits = ['trait-asi-base-traits', 'trait-fey-affinity', 'trait-climber', 'trait-alter-form-adv', 'trait-awakened-nature'];
          changed = true;
        } else if (fm.id === 'species-asi-ferren') {
          fm.traits = ['trait-adapted', 'trait-asi-base-traits', 'trait-climber', 'trait-prehensile-tail', 'trait-quick'];
          fm.species_traits = ['trait-adapted', 'trait-asi-base-traits', 'trait-climber', 'trait-prehensile-tail', 'trait-quick'];
          changed = true;
        } else {
          fm.traits = cleaned;
          fm.species_traits = cleaned;
          changed = true;
        }
      }
    }

    // Auluran Dar: add missing +1 Ability modifier to reach canon +2
    if (fm.id === 'species-auluran-dar') {
      if (!fm.inherent_attribute_modifiers.some(a => a.attribute === 'Stamina')) {
        fm.inherent_attribute_modifiers.push({ attribute: 'Stamina', bonus: 1 });
        changed = true;
      }
    }

    // Kitin Manelli: remove kitin base traits since it lists all individual traits
    if (fm.id === 'species-kitin-manelli') {
      fm.traits = fm.traits.filter(t => t !== 'trait-kitin-base-traits');
      fm.species_traits = fm.traits;
      changed = true;
    }

    // Compute canonical component sum with tangentEntityEngines
    const mockSpecies = {
      ...fm,
      costs: { bp: 0 } // neutral so it doesn't short-circuit
    };
    const bpData = eMod.calculateSpeciesBP(mockSpecies);
    const canonicalBP = bpData.totalBPUsed;

    const previousDeclared = fm.costs?.bp;
    if (previousDeclared !== canonicalBP) {
      if (!fm.costs) fm.costs = {};
      fm.costs.bp = canonicalBP;
      fm.cp_cost = canonicalBP;
      fm.cp = canonicalBP;
      fm.bp = canonicalBP;
      changed = true;
      console.log(`[ALIGNED] ${fm.name} (${fm.id}): ${previousDeclared} BP -> ${canonicalBP} BP`);
    }

    if (changed) {
      modifiedCount++;
      const updatedYaml = matter.stringify(parsed.content, fm);
      fs.writeFileSync(fullPath, updatedYaml, 'utf8');
    }
  }

  console.log(`\nUpdated ${modifiedCount} species markdown files.`);

  // Now sync species data into speciesData.js
  console.log('\nRunning syncOmnicortexSpecies.mjs...');
  const { execSync } = await import('child_process');
  execSync('node scripts/syncOmnicortexSpecies.mjs', { cwd: rootDir, stdio: 'inherit' });

  console.log('\nAlignment completed successfully.');
}

runAlignment();
