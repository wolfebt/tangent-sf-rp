/**
 * @file guidanceGemsConfig.js
 * @description Centralized Guidance Gems taxonomy and presets for the Tangent SF RP
 * Adventure Development Environment (ADE) and AIME Creative Suite.
 */

export const GUIDANCE_GEMS = {
  "Mood": [
    "Gritty & Bleak",
    "Tense & Suspenseful",
    "Atmospheric & Immersive",
    "Eerie & Uncanny",
    "Epic & Heroic",
    "Melancholy & Somber",
    "High-Octane & Kinetic",
    "Surreal & Dreamlike",
    "Paranoiac & Claustrophobic",
    "Wonder & Exploration",
    "Cyber-Noir"
  ],
  "Genre": [
    "Cyberpunk",
    "Space Opera",
    "Science Fantasy",
    "Hard Sci-Fi",
    "Techno-Thriller",
    "Cosmic Horror",
    "Post-Apocalyptic",
    "Dark Fantasy",
    "Espionage / Heist",
    "Military Sci-Fi",
    "Solarpunk",
    "Retro-Futuristic"
  ],
  "Tone": [
    "Serious",
    "Sardonic & Dry",
    "Humorous",
    "Poetic & Lyrical",
    "Clinical & Analytical",
    "Formal & Dignified",
    "Cynical",
    "Optimistic & Hopeful",
    "Grimdark",
    "Laconic & Terse",
    "Mythic"
  ],
  "Pacing": [
    "Fast-paced",
    "Slow-burn",
    "Steady",
    "Urgent & Relentless",
    "Relaxed & Exploratory",
    "Meditative",
    "Action-Packed",
    "Rollercoaster Beats",
    "Episodic"
  ],
  "POV": [
    "First Person (\"I\")",
    "Third Person Limited (\"He/She/They\")",
    "Third Person Omniscient",
    "Second Person (\"You\")",
    "Alternating POV",
    "Epistolary / Mission Logs",
    "Stream of Consciousness"
  ],
  "Theme": [
    "Redemption",
    "Betrayal",
    "Survival & Resilience",
    "Transhumanism & Machine Soul",
    "Power & Corruption",
    "Identity & Memory",
    "Freedom vs Control",
    "Found Family",
    "Cosmic Entropy",
    "Discovery & Wonder",
    "Duty vs Conscience"
  ],
  "Conflict": [
    "Man vs Machine",
    "Faction Warfare",
    "Metaphysical / Psychic Rift",
    "Environmental Hostility",
    "Internal Moral Crisis",
    "Covert Espionage & Infiltration",
    "Resource Scarcity",
    "Ancient Precursor Awakening",
    "Cybernetic Alienation"
  ],
  "Setting": [
    "Neon Megacity Sprawl",
    "Deep Space Void Station",
    "Derelict Starship Bulkheads",
    "Alien Planetary Frontier",
    "Subterranean Bio-Lab",
    "High-Orbit Orbital Citadel",
    "Wasteland Barrens",
    "Arcane Relic Vault",
    "Virtual Matrix Grid"
  ]
};

/**
 * Returns merged dictionary of presets and user-created custom gems
 */
export const getMergedGems = (customGems = {}) => {
  const merged = {};
  for (const [cat, presets] of Object.entries(GUIDANCE_GEMS)) {
    const userGems = Array.isArray(customGems[cat]) ? customGems[cat] : [];
    merged[cat] = [...presets, ...userGems.filter(g => !presets.includes(g))];
  }
  // Include any entirely new categories defined by the user
  for (const [cat, gems] of Object.entries(customGems)) {
    if (!merged[cat] && Array.isArray(gems)) {
      merged[cat] = gems;
    }
  }
  return merged;
};

/**
 * Formats active gems array into a structured markdown prompt snippet
 */
export const formatGemsPrompt = (activeGems = []) => {
  if (!activeGems || activeGems.length === 0) return 'Standard Tangent Science Fantasy';
  return activeGems.join(', ');
};
