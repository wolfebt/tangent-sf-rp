import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invocationsDir = path.resolve(__dirname, '../src/data/omnicortex/invocations');

export const DISCIPLINE_PRESETS = {
  Mental: {
    species: ['Celestine (Alterian)', 'Whisper', 'Impyrium Psion (Gen-E)', 'Ila (Progenitor Archon)', 'Nocturne (Kovian)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Incorporated Planetary Syndication (The Syndicate)', 'Corporate Faction Template'],
    origins: ['Enlightened', 'Research', 'Urban', 'Spacer'],
    occupations: ['Adept', 'Scholar', 'Specialist', 'Agent', 'Representative'],
    keywords: 'telepathy, mind probe, cognitive manipulation, psychic suggestion, sensory attunement, mental barrier, consciousness focus, psionic perception',
    negative_keywords: 'kinetic brute force, heavy weaponry, mindless automaton, physical armor plate, crude mechanical tools'
  },
  Entropy: {
    species: ['Whisper', 'Tenen (Sha’nor Spectral)', 'Eakren (Corrupted Aberration)', 'Rautha Human', "Sha'nor"],
    factions: ['The Ascendancy', 'Dracon Dynasty', 'Kovian Tribunal', 'Supernatural Faction Template', 'The Outworlds'],
    origins: ['Hostile', 'Enlightened', 'Spacer', 'Colony'],
    occupations: ['Adept', 'Scholar', 'Specialist', 'Criminal', 'Soldier'],
    keywords: 'entropy, decay, chaos, breakdown, dissolution, void rot, entropic degradation, unmaking, destabilization, necrosis',
    negative_keywords: 'healing, creation, technological construction, cybernetic repair, preservation, rigid order'
  },
  Energy: {
    species: ['Draconian (Scaled Aeld)', 'Draconic Human', 'Impyrium Psion (Gen-E)', 'Impyrium Regi (Gen-E)', 'Fey (Base)'],
    factions: ['Dracon Dynasty', 'Radiant Impyrium', 'The Alterian Enclave', 'Military Faction Template'],
    origins: ['Militaristic', 'Industrial', 'Enlightened', 'Colony'],
    occupations: ['Soldier', 'Adept', 'Specialist', 'Scout', 'Builder'],
    keywords: 'energy, plasma, arc bolt, kinetic force, thermal blast, electromagnetic, radiant, ignition, shockwave, beam, solar flare',
    negative_keywords: 'subtle infiltration, quiet stealth, silence, cold nullification, emotional psionics'
  },
  Illusion: {
    species: ['Whisper', 'Doppelganger (Shifter)', 'Changeling (Doppelganger Hybrid)', 'Celestine (Alterian)', 'Fey (Base)', 'Skin (Infiltrator Synthetic)'],
    factions: ['The Alterian Enclave', 'Kovian Tribunal', 'Elven Providence', 'Criminal Faction Template', 'Supernatural Faction Template'],
    origins: ['Enlightened', 'Urban', 'Leisure', 'Spacer'],
    occupations: ['Agent', 'Entertainer', 'Adept', 'Criminal', 'Specialist'],
    keywords: 'illusion, phantasm, sensory deceit, glamour, mirage, disguise, optical warp, misdirection, holographic shroud, phantom echo, invisibility',
    negative_keywords: 'blunt force, pure kinetic damage, heavy mechanical armor, industrial manufacturing, truth verification'
  },
  Matter: {
    species: ['Golem (Arcane Construct)', 'Risakin (Giant Folk)', 'Dwerg Human', 'Mekan (Assimilation Unit)', 'Cyberform Human'],
    factions: ['The Mekan Collective', 'Technological Faction Template', 'Dracon Dynasty', 'The Entari Combine'],
    origins: ['Industrial', 'Colony', 'Hostile', 'Agricultural'],
    occupations: ['Builder', 'Specialist', 'Adept', 'Soldier', 'Scholar'],
    keywords: 'transmutation, molecular reshaping, physical shielding, stoneskin, matter creation, density manipulation, graft, structural alteration',
    negative_keywords: 'ethereal projection, pure light, telepathic influence, illusion, weightless spirit'
  },
  Dimension: {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Whisper', 'Varen (Gatekeeper)', 'Ila (Progenitor Archon)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Space Exploration Faction Template', 'Interstellar Diplomats Faction Template'],
    origins: ['Spacer', 'Enlightened', 'Research', 'Colony'],
    occupations: ['Scout', 'Adept', 'Specialist', 'Drifter', 'Agent'],
    keywords: 'dimensional, spatial rift, teleportation, warp, fold space, pocket dimension, wormhole, phasing, spatial anchor, blink, transit',
    negative_keywords: 'anchored mass, physical barrier, heavy armor, localized gravity, dense matter, physical blunt force'
  }
};

// Composite Disciplines
const COMPOSITE_PRESETS = {
  'Entropy + Dimension': {
    species: ['Whisper', 'Tenen (Sha’nor Spectral)', 'Celestine (Alterian)', 'Varen (Gatekeeper)'],
    factions: ['The Ascendancy', 'Dracon Dynasty', 'Kovian Tribunal', 'The Outworlds'],
    origins: ['Spacer', 'Hostile', 'Enlightened'],
    occupations: ['Adept', 'Scout', 'Specialist', 'Criminal'],
    keywords: 'entropic fold, spatial decay, void transit, dimensional corruption, shadow rift, accelerated decay, warp dissolution',
    negative_keywords: 'radiant light, life preservation, mechanical structure, heavy artillery'
  },
  'Mental + Energy': {
    species: ['Celestine (Alterian)', 'Impyrium Psion (Gen-E)', 'Ila (Progenitor Archon)', 'Draconian (Scaled Aeld)'],
    factions: ['The Alterian Enclave', 'Radiant Impyrium', 'The Ascendancy', 'Military Faction Template'],
    origins: ['Research', 'Enlightened', 'Urban', 'Militaristic'],
    occupations: ['Adept', 'Soldier', 'Specialist', 'Scholar'],
    keywords: 'psionic force, psychokinetic energy, neural surge, thought beam, mental ignition, kinetic thought, consciousness spark',
    negative_keywords: 'crude physical strike, mindless brute, anti-magic'
  },
  'Matter + Entropy': {
    species: ['Eakren (Corrupted Aberration)', 'Tenen (Sha’nor Spectral)', 'Risakin (Giant Folk)', 'Golem (Arcane Construct)'],
    factions: ['The Ascendancy', 'Dracon Dynasty', 'Supernatural Faction Template', 'The Mekan Collective'],
    origins: ['Hostile', 'Industrial', 'Enlightened'],
    occupations: ['Adept', 'Builder', 'Scholar', 'Specialist'],
    keywords: 'biomorphic decay, necrotic restructuring, flesh reshaping, toxic transmutation, entropic corruption of matter, living spell',
    negative_keywords: 'pure mechanical clockwork, clean digital data, radiant healing'
  },
  'Illusion + Dimension': {
    species: ['Whisper', 'Celestine (Alterian)', 'Doppelganger (Shifter)', 'Eidolon (Aetherion Specialist)'],
    factions: ['The Alterian Enclave', 'Kovian Tribunal', 'Elven Providence', 'Space Exploration Faction Template'],
    origins: ['Spacer', 'Enlightened', 'Leisure'],
    occupations: ['Agent', 'Scout', 'Adept', 'Entertainer'],
    keywords: 'dimensional maze, folded perception, phantom corridor, endless spatial loop, perceptual disorientation, spatial mirror, labyrinth',
    negative_keywords: 'straightforward kinetic impact, open warfare, brute assault'
  },
  'Matter + Energy': {
    species: ['Golem (Arcane Construct)', 'Cyberform Human', 'Draconian (Scaled Aeld)', 'Mekan (Assimilation Unit)'],
    factions: ['The Mekan Collective', 'Radiant Impyrium', 'Dracon Dynasty', 'Technological Faction Template'],
    origins: ['Industrial', 'Militaristic', 'Research'],
    occupations: ['Builder', 'Soldier', 'Adept', 'Specialist'],
    keywords: 'plasma forging, energized matter, thermic hardening, elemental shaping, superheated alloy manipulation, machine spirit',
    negative_keywords: 'subtle telepathy, stealth infiltration, cold nullification'
  }
};

export function getRecommendationsForInvocation(id, name, discipline, description) {
  const normDisc = (discipline || '').trim();
  
  // Check composites first
  if (COMPOSITE_PRESETS[normDisc]) {
    const comp = COMPOSITE_PRESETS[normDisc];
    const specificKeyword = name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
    return {
      recommended_species: [...comp.species],
      recommended_factions: [...comp.factions],
      recommended_origins: [...comp.origins],
      recommended_occupations: [...comp.occupations],
      keywords: `${specificKeyword}, ${comp.keywords}`,
      negative_keywords: comp.negative_keywords
    };
  }

  // Check standard single discipline
  const base = DISCIPLINE_PRESETS[normDisc] || DISCIPLINE_PRESETS['Mental'];
  const specificNameKeywords = name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();

  // Fine-tune by specific thematic categories
  const nameLower = name.toLowerCase();
  let extraKeywords = '';
  let extraSpecies = [];
  let extraFactions = [];
  let extraOrigins = [];
  let extraOccupations = [];

  if (nameLower.includes('teleport') || nameLower.includes('gate') || nameLower.includes('plane shift') || nameLower.includes('step')) {
    extraKeywords = 'spatial displacement, instant blink, transit, portal nexus, coordinate hop';
    extraOccupations = ['Scout', 'Drifter'];
  } else if (nameLower.includes('cure') || nameLower.includes('heal') || nameLower.includes('regenerate') || nameLower.includes('restoration') || nameLower.includes('revivify')) {
    extraKeywords = 'cellular knitting, biological restoration, life surge, vital stabilization, purge tox';
    extraOccupations = ['Scholar', 'Adept', 'Specialist'];
    extraFactions = ['Elven Providence', 'The Alterian Enclave'];
  } else if (nameLower.includes('fire') || nameLower.includes('flame') || nameLower.includes('plasma') || nameLower.includes('sunburst') || nameLower.includes('bolt') || nameLower.includes('blast')) {
    extraKeywords = 'pyrokinesis, incendiary, thermal eruption, explosive plasma, radiant discharge';
    extraOccupations = ['Soldier', 'Specialist'];
  } else if (nameLower.includes('invisib') || nameLower.includes('obscure') || nameLower.includes('shadow') || nameLower.includes('blur') || nameLower.includes('darkness')) {
    extraKeywords = 'stealth attunement, cloaking, light bending, shadowy shroud, optical camouflage';
    extraOccupations = ['Agent', 'Scout', 'Criminal'];
    extraSpecies = ['Whisper', 'Doppelganger (Shifter)'];
  } else if (nameLower.includes('shield') || nameLower.includes('barrier') || nameLower.includes('armor') || nameLower.includes('stoneskin') || nameLower.includes('force field')) {
    extraKeywords = 'protective aegis, deflection lattice, hardened barrier, kinetic ward, impact dampener';
    extraOccupations = ['Soldier', 'Builder', 'Specialist'];
  } else if (nameLower.includes('telekinesis') || nameLower.includes('nudge') || nameLower.includes('crush') || nameLower.includes('fly')) {
    extraKeywords = 'psychokinesis, gravity negation, vector manipulation, levitation, force wave';
    extraOccupations = ['Adept', 'Specialist'];
  } else if (nameLower.includes('mind') || nameLower.includes('telepathy') || nameLower.includes('thought') || nameLower.includes('probe') || nameLower.includes('suggest') || nameLower.includes('charm')) {
    extraKeywords = 'neural link, cognitive intrusion, psyche weave, mental domination, thought broadcast';
    extraOccupations = ['Adept', 'Agent', 'Representative'];
  }

  const combinedSpecies = Array.from(new Set([...extraSpecies, ...base.species]));
  const combinedFactions = Array.from(new Set([...extraFactions, ...base.factions]));
  const combinedOrigins = Array.from(new Set([...extraOrigins, ...base.origins]));
  const combinedOccupations = Array.from(new Set([...extraOccupations, ...base.occupations]));
  const combinedKeywords = [specificNameKeywords, extraKeywords, base.keywords].filter(Boolean).join(', ');

  return {
    recommended_species: combinedSpecies,
    recommended_factions: combinedFactions,
    recommended_origins: combinedOrigins,
    recommended_occupations: combinedOccupations,
    keywords: combinedKeywords,
    negative_keywords: base.negative_keywords
  };
}

export function applyInvocationRecommendations() {
  if (!fs.existsSync(invocationsDir)) {
    console.error(`Invocations directory not found at: ${invocationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(invocationsDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Applying recommendations across ${files.length} invocation files in ${invocationsDir}...`);

  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(invocationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const id = data.id || file.replace(/\.md$/, '');
    const name = data.name || id;
    const discipline = data.discipline || data.requisite_disciplines || 'Mental';
    const description = data.description || '';

    const recs = getRecommendationsForInvocation(id, name, discipline, description);

    data.recommended_species = recs.recommended_species;
    data.recommended_factions = recs.recommended_factions;
    data.recommended_origins = recs.recommended_origins;
    data.recommended_occupations = recs.recommended_occupations;
    data.keywords = recs.keywords;
    data.negative_keywords = recs.negative_keywords;

    const newContent = matter.stringify(parsed.content, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
    updatedCount++;
  }

  console.log(`\nUpdated ${updatedCount} invocation markdown files successfully.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyInvocationRecommendations();
}
