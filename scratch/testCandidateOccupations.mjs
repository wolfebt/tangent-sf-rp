import { DEFAULT_SPECIES } from '../src/data/speciesData.js';
import { DEFAULT_FACTIONS } from '../src/data/factionsData.js';
import { DEFAULT_ORIGINS } from '../src/data/originsData.js';

const spSet = new Set((DEFAULT_SPECIES || []).map(s => s.name));
const facSet = new Set((DEFAULT_FACTIONS || []).map(f => f.name));
const origSet = new Set((DEFAULT_ORIGINS || []).map(o => o.name));

const CANDIDATE_OCCUPATIONS = {
  'occupation-adept': {
    recommended_species: ['Celestine (Alterian)', 'Whisper', 'Fey (Base)', 'Sigal', 'Draconian (Scaled Aeld)', 'Impyrium Psion (Gen-E)', 'Ila (Progenitor Archon)', 'Eidolon (Aetherion Specialist)', 'Tenen (Sha’nor Spectral)', 'Golem (Arcane Construct)'],
    recommended_factions: ['The Alterian Enclave', 'The Ascendancy', 'Elven Providence', 'Dracon Dynasty', 'Supernatural Faction Template', 'Space Religion Faction Template', 'Religious Cult Faction Template'],
    recommended_origins: ['Enlightened', 'Research', 'Hostile', 'Urban']
  },
  'occupation-agent': {
    recommended_species: ['Doppelganger (Shifter)', 'Changeling (Doppelganger Hybrid)', 'Skin (Infiltrator Synthetic)', 'Nocturne (Kovian)', 'Android', 'Cyberform Human', 'Danai (Davae Hybrid)', 'Kannid', 'Human (Base)', 'Whisper'],
    recommended_factions: ['Incorporated Planetary Syndication (The Syndicate)', 'Kovian Tribunal', 'Corporate Faction Template', 'Criminal Faction Template', 'Interstellar Diplomats Faction Template', 'Political Faction Template', 'The Alterian Enclave'],
    recommended_origins: ['Urban', 'Spacer', 'Hostile', 'Research']
  },
  'occupation-builder': {
    recommended_species: ['Dwerg Human', 'Cyberform Human', 'Koda (Auluran Worker)', 'Protocol (Task Automaton)', 'Scrap (Junkframe Synthetic)', 'Biomechanical Synthetic', 'Human (Base)', 'Mekan (Assimilation Unit)', 'Digon (Gen-E)', 'Orll'],
    recommended_factions: ['The Mekan Collective', 'Coalition of Independent Worlds', 'Incorporated Planetary Syndication (The Syndicate)', 'Technological Faction Template', 'Corporate Faction Template', 'Planetary Faction Template'],
    recommended_origins: ['Industrial', 'Colony', 'Spacer', 'Agricultural']
  },
  'occupation-citizen': {
    recommended_species: ['Human (Base)', 'Lin Human', 'Premian Human', 'Argynt Human', 'Nian Human', 'Dwerg Human', 'Kheen Human', 'Kannid', 'Android', 'Awakened Animal'],
    recommended_factions: ['Planetary Faction Template', 'Coalition of Independent Worlds', 'Impyrium Dominion', 'Political Faction Template', 'The Entari Combine', 'Corporate Faction Template'],
    recommended_origins: ['Urban', 'Agricultural', 'Colony', 'Industrial']
  },
  'occupation-criminal': {
    recommended_species: ['Doppelganger (Shifter)', 'Changeling (Doppelganger Hybrid)', 'Scrap (Junkframe Synthetic)', 'Nocturne (Kovian)', 'Cyberform Human', 'Danai (Davae Hybrid)', 'Kizin', 'B’Dren Human', 'Human (Base)', 'Skin (Infiltrator Synthetic)'],
    recommended_factions: ['Criminal Faction Template', 'Space Pirate Faction Template', 'Incorporated Planetary Syndication (The Syndicate)', 'The Outworlds', 'Kovian Tribunal', 'Rebel Faction Template'],
    recommended_origins: ['Urban', 'Hostile', 'Spacer', 'Leisure']
  },
  'occupation-drifter': {
    recommended_species: ['Vajar (Wilder)', 'Wildling', 'Ferren', 'Scrap (Junkframe Synthetic)', 'Rautha Human', 'Frellin', 'Kheen Human', 'Jorni', 'Human (Base)', 'Sentient Machine (Free Droid)'],
    recommended_factions: ['The Outworlds', 'Coalition of Independent Worlds', 'Vajar Tribes', 'Post-apocalyptic Faction Template', 'Space Exploration Faction Template', 'Rebel Faction Template'],
    recommended_origins: ['Spacer', 'Hostile', 'Colony', 'Agricultural']
  },
  'occupation-entertainer': {
    recommended_species: ['Celestine (Alterian)', 'Fey (Base)', 'Ferren', 'Argynt Human', 'Brae Human', 'Davae (Gen-E)', 'Danai (Davae Hybrid)', 'Kongi', 'Human (Base)', 'Changeling (Doppelganger Hybrid)'],
    recommended_factions: ['Space Tourism Faction Template', 'The Entari Combine', 'Incorporated Planetary Syndication (The Syndicate)', 'Elven Providence', 'The Alterian Enclave', 'Corporate Faction Template'],
    recommended_origins: ['Leisure', 'Urban', 'Enlightened']
  },
  'occupation-merchant': {
    recommended_species: ['Human (Base)', 'Dwerg Human', 'Argynt Human', 'Kannid', 'Lin Human', 'Varen (Gatekeeper)', 'Changeling (Doppelganger Hybrid)', 'Mekan (Assimilation Unit)'],
    recommended_factions: ['Incorporated Planetary Syndication (The Syndicate)', 'The Entari Combine', 'Coalition of Independent Worlds', 'Corporate Faction Template', 'The Outworlds', 'Planetary Faction Template'],
    recommended_origins: ['Urban', 'Spacer', 'Leisure', 'Agricultural']
  },
  'occupation-representative': {
    recommended_species: ['Celestine (Alterian)', 'Manelli (Kitin Diplomat)', 'Human (Base)', 'Argynt Human', 'Draconian (Scaled Aeld)', 'Frellin', 'Ila (Progenitor Archon)', 'U’Nonn (Progenitor Sovereign)', 'Changeling (Doppelganger Hybrid)'],
    recommended_factions: ['Interstellar Diplomats Faction Template', 'Political Faction Template', 'The Entari Combine', 'The Alterian Enclave', 'The Ascendancy', 'Dracon Dynasty', 'Impyrium Dominion'],
    recommended_origins: ['Urban', 'Enlightened', 'Leisure', 'Research']
  },
  'occupation-scholar': {
    recommended_species: ['Sigal', 'Celestine (Alterian)', 'Nian Human', 'Intellect Construct (Pure AI)', 'Android', 'Tozen', 'Human (Base)', 'Eidolon (Aetherion Specialist)', 'Manelli (Kitin Diplomat)'],
    recommended_factions: ['The Ascendancy', 'Technological Faction Template', 'The Alterian Enclave', 'Elven Providence', 'Sentient Intelligence Faction Template', 'The Mekan Collective'],
    recommended_origins: ['Research', 'Enlightened', 'Urban']
  },
  'occupation-scout': {
    recommended_species: ['Vajar (Wilder)', 'Ferren', 'Koban', 'Dar (Auluran Hunter)', 'Tozen', 'Frellin', 'Rakne (Kitin Stalker)', 'Maantene (Kitin Leaper)', 'Wildling', 'Human (Base)'],
    recommended_factions: ['The Outworlds', 'Space Exploration Faction Template', 'Coalition of Independent Worlds', 'Auluran Clans', 'Elven Providence', 'Vajar Tribes'],
    recommended_origins: ['Hostile', 'Colony', 'Spacer', 'Agricultural', 'Aquatic']
  },
  'occupation-soldier': {
    recommended_species: ['Draconian (Scaled Aeld)', 'Janissary (Gen-E)', 'Impyrium Regi (Gen-E)', 'Rautha Human', 'Graa (Auluran Heavy)', 'Dar (Auluran Hunter)', 'Maantene (Kitin Leaper)', 'Qeric', 'Weti', 'Sentient Machine (Free Droid)'],
    recommended_factions: ['Military Faction Template', 'Impyrium Dominion', 'Dracon Dynasty', 'Mercenary Faction Template', 'Radiant Impyrium', 'The Silvermoon Vanguard'],
    recommended_origins: ['Militaristic', 'Hostile', 'Colony', 'Industrial', 'Spacer']
  },
  'occupation-specialist': {
    recommended_species: ['Sigal', 'Cyberform Human', 'Nian Human', 'Intellect Construct (Pure AI)', 'Android', 'Dwerg Human', 'Prokos (Auluran Biform)', 'Skin (Infiltrator Synthetic)', 'Swarm (Micro-Drone Synthetic)', 'Human (Base)'],
    recommended_factions: ['Technological Faction Template', 'The Ascendancy', 'The Mekan Collective', 'Genetic Engineering Faction Template', 'Incorporated Planetary Syndication (The Syndicate)', 'The Alterian Enclave'],
    recommended_origins: ['Research', 'Industrial', 'Urban', 'Spacer', 'Hostile']
  }
};

let errors = 0;
for (const [occId, data] of Object.entries(CANDIDATE_OCCUPATIONS)) {
  for (const sp of data.recommended_species) {
    if (!spSet.has(sp)) {
      console.error('Unknown species:', sp, 'in', occId);
      errors++;
    }
  }
  for (const fac of data.recommended_factions) {
    if (!facSet.has(fac)) {
      console.error('Unknown faction:', fac, 'in', occId);
      errors++;
    }
  }
  for (const orig of data.recommended_origins) {
    if (!origSet.has(orig)) {
      console.error('Unknown origin:', orig, 'in', occId);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log('SUCCESS: All 13 candidate occupation recommendations match canonical datasets 100%!');
} else {
  console.log('FAILED with', errors, 'errors.');
}
