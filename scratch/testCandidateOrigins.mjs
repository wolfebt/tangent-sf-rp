import { DEFAULT_SPECIES } from '../src/data/speciesData.js';
import { DEFAULT_FACTIONS } from '../src/data/factionsData.js';
import { DEFAULT_OCCUPATIONS } from '../src/data/occupationsData.js';

const spSet = new Set((DEFAULT_SPECIES || []).map(s => s.name));
const facSet = new Set((DEFAULT_FACTIONS || []).map(f => f.name));
const occSet = new Set((DEFAULT_OCCUPATIONS || []).map(o => o.name));

const CANDIDATE_ORIGINS = {
  'origin-agricultural': {
    recommended_species: ['Lin Human', 'Rautha Human', 'Human (Base)', 'Tozen', 'Ferren', 'Koban', 'Kannid', 'Koda (Auluran Worker)', 'Awakened Animal', 'Thorn'],
    recommended_factions: ['Auluran Clans', 'Environmental Faction Template', 'Planetary Faction Template', 'Impyrium Dominion', 'The Outworlds', 'Coalition of Independent Worlds'],
    recommended_occupations: ['Builder', 'Citizen', 'Scout', 'Specialist', 'Drifter', 'Merchant']
  },
  'origin-aquatic': {
    recommended_species: ['Aquarian Human', 'Aquatican (Gen-E)', 'Mobula', 'Sefalin', 'Truldan', 'Praeti', 'Plasm', 'Caprian'],
    recommended_factions: ['Environmental Faction Template', 'Coalition of Independent Worlds', 'Auluran Clans', 'The Entari Combine', 'Incorporated Planetary Syndication (The Syndicate)', 'The Alterian Enclave'],
    recommended_occupations: ['Scout', 'Specialist', 'Builder', 'Drifter', 'Merchant', 'Agent']
  },
  'origin-colony': {
    recommended_species: ['Human (Base)', 'Lin Human', 'Premian Human', 'Dwerg Human', 'Cyberform Human', 'Wildling', 'Kheen Human', 'Frellin', 'Jorni', 'Mondi', 'Sentient Machine (Free Droid)'],
    recommended_factions: ['The Outworlds', 'Coalition of Independent Worlds', 'Planetary Faction Template', 'Space Exploration Faction Template', 'Impyrium Dominion', 'Rebel Faction Template'],
    recommended_occupations: ['Builder', 'Scout', 'Citizen', 'Soldier', 'Specialist', 'Drifter']
  },
  'origin-enlightened': {
    recommended_species: ['Celestine (Alterian)', 'Whisper', 'Fey (Base)', 'Sigal', 'Draconian (Scaled Aeld)', 'Ila (Progenitor Archon)', 'U’Nonn (Progenitor Sovereign)', 'Tenen (Sha’nor Spectral)', 'Golem (Arcane Construct)', 'Eidolon (Aetherion Specialist)'],
    recommended_factions: ['The Alterian Enclave', 'The Ascendancy', 'Elven Providence', 'Dracon Dynasty', 'Supernatural Faction Template', 'Religious Cult Faction Template', 'Space Religion Faction Template'],
    recommended_occupations: ['Adept', 'Scholar', 'Representative', 'Specialist', 'Agent', 'Entertainer']
  },
  'origin-hostile': {
    recommended_species: ['Rautha Human', 'B’Dren Human', 'Vajar (Wilder)', 'Nocturne (Kovian)', 'Graa (Auluran Heavy)', "Gra'or", 'Vassoth', 'Rakne (Kitin Stalker)', 'Eakren (Corrupted Aberration)', 'Risakin (Giant Folk)', 'Scrap (Junkframe Synthetic)'],
    recommended_factions: ['The Outworlds', 'Post-apocalyptic Faction Template', 'Mutant Faction Template', 'Vajar Tribes', 'Kovian Tribunal', 'Mercenary Faction Template', 'Alien Faction Template'],
    recommended_occupations: ['Soldier', 'Scout', 'Specialist', 'Drifter', 'Criminal', 'Builder']
  },
  'origin-industrial': {
    recommended_species: ['Dwerg Human', 'Cyberform Human', 'Koda (Auluran Worker)', 'Mekan (Assimilation Unit)', 'Protocol (Task Automaton)', 'Scrap (Junkframe Synthetic)', 'Biomechanical Synthetic', 'Human (Base)', 'Digon (Gen-E)', 'Orll'],
    recommended_factions: ['The Mekan Collective', 'Incorporated Planetary Syndication (The Syndicate)', 'Technological Faction Template', 'Coalition of Independent Worlds', 'Corporate Faction Template', 'Impyrium Dominion'],
    recommended_occupations: ['Builder', 'Specialist', 'Citizen', 'Soldier', 'Merchant', 'Agent']
  },
  'origin-leisure': {
    recommended_species: ['Celestine (Alterian)', 'Fey (Base)', 'Argynt Human', 'Brae Human', 'Davae (Gen-E)', 'Danai (Davae Hybrid)', 'Kizin', 'Kongi', 'Skin (Infiltrator Synthetic)', 'Changeling (Doppelganger Hybrid)'],
    recommended_factions: ['Space Tourism Faction Template', 'Incorporated Planetary Syndication (The Syndicate)', 'The Alterian Enclave', 'Dracon Dynasty', 'Corporate Faction Template', 'The Silvermoon Vanguard'],
    recommended_occupations: ['Entertainer', 'Representative', 'Merchant', 'Citizen', 'Agent', 'Criminal']
  },
  'origin-militaristic': {
    recommended_species: ['Draconian (Scaled Aeld)', 'Janissary (Gen-E)', 'Impyrium Regi (Gen-E)', 'Rautha Human', 'Dar (Auluran Hunter)', 'Graa (Auluran Heavy)', 'Maantene (Kitin Leaper)', 'Qeric', 'Weti', 'Sentient Machine (Free Droid)'],
    recommended_factions: ['Military Faction Template', 'Impyrium Dominion', 'Dracon Dynasty', 'Mercenary Faction Template', 'Radiant Impyrium', 'Cosmic Justice Faction Template'],
    recommended_occupations: ['Soldier', 'Specialist', 'Scout', 'Agent', 'Builder', 'Representative']
  },
  'origin-research': {
    recommended_species: ['Sigal', 'Celestine (Alterian)', 'Nian Human', 'Intellect Construct (Pure AI)', 'Android', 'Manelli (Kitin Diplomat)', 'Prokos (Auluran Biform)', 'Impyrium Psion (Gen-E)', 'Gen-E (Base Engineered Human)', 'Swarm (Micro-Drone Synthetic)'],
    recommended_factions: ['The Ascendancy', 'Technological Faction Template', 'The Mekan Collective', 'Sentient Intelligence Faction Template', 'Genetic Engineering Faction Template', 'The Alterian Enclave'],
    recommended_occupations: ['Scholar', 'Specialist', 'Builder', 'Agent', 'Scout', 'Representative']
  },
  'origin-spacer': {
    recommended_species: ['Varen (Gatekeeper)', 'Cyberform Human', 'Human (Base)', 'Frellin', 'Jorni', 'Mobula', 'Sentient Machine (Free Droid)', 'Shell (Transferred Organic)', 'Chimera (Gen-E)', 'Scrap (Junkframe Synthetic)'],
    recommended_factions: ['The Outworlds', 'Coalition of Independent Worlds', 'The Entari Combine', 'Space Exploration Faction Template', 'Space Pirate Faction Template', 'Mercenary Faction Template'],
    recommended_occupations: ['Drifter', 'Scout', 'Merchant', 'Builder', 'Agent', 'Soldier']
  },
  'origin-urban': {
    recommended_species: ['Human (Base)', 'Doppelganger (Shifter)', 'Changeling (Doppelganger Hybrid)', 'Cyberform Human', 'Skin (Infiltrator Synthetic)', 'Android', 'Kannid', 'Kizin', 'Danai (Davae Hybrid)', 'Nocturne (Kovian)'],
    recommended_factions: ['Incorporated Planetary Syndication (The Syndicate)', 'Coalition of Independent Worlds', 'Corporate Faction Template', 'Criminal Faction Template', 'Impyrium Dominion', 'Political Faction Template', 'Interstellar Diplomats Faction Template'],
    recommended_occupations: ['Criminal', 'Agent', 'Citizen', 'Entertainer', 'Specialist', 'Merchant']
  }
};

let errors = 0;
for (const [origId, data] of Object.entries(CANDIDATE_ORIGINS)) {
  for (const sp of data.recommended_species) {
    if (!spSet.has(sp)) {
      console.error('Unknown species:', sp, 'in', origId);
      errors++;
    }
  }
  for (const fac of data.recommended_factions) {
    if (!facSet.has(fac)) {
      console.error('Unknown faction:', fac, 'in', origId);
      errors++;
    }
  }
  for (const occ of data.recommended_occupations) {
    if (!occSet.has(occ)) {
      console.error('Unknown occupation:', occ, 'in', origId);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log('SUCCESS: All 11 candidate origin recommendations match canonical datasets 100%!');
} else {
  console.log('FAILED with', errors, 'errors.');
}
