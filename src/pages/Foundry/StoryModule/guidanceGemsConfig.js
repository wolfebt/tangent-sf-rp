/**
 * @file guidanceGemsConfig.js
 * @description Centralized Guidance Gems taxonomy and presets for the Tangent SF RP
 * Adventure Development Environment (ADE) and AIME Creative Suite.
 * Grounded in "The Art of AI Crafting" Layer 1 (Directorial Guidance).
 */

/**
 * The 6 Canonical AIME Guidance Gems as defined in "The Art of AI Crafting".
 * These gems control the directorial lens (the 'How') independent of subject matter (the 'What').
 */
export const AIME_CANONICAL_GEMS = {
  "Genre": [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Sci-Fi",
    "Horror",
    "Mystery",
    "Romance",
    "Thriller"
  ],
  "Tone": [
    "Serious",
    "Humorous",
    "Formal",
    "Informal",
    "Optimistic",
    "Pessimistic",
    "Joyful",
    "Sad",
    "Hopeful",
    "Cynical"
  ],
  "Pacing": [
    "Fast-paced",
    "Slow-burn",
    "Steady",
    "Urgent",
    "Relaxed",
    "Meditative"
  ],
  "Point of View": [
    "First Person",
    "Third Person Limited",
    "Third Person Omniscient",
    "Second Person"
  ],
  "Literary Devices": [
    "Metaphor",
    "Simile",
    "Personification",
    "Alliteration",
    "Symbolism",
    "Irony",
    "Foreshadowing"
  ],
  "Structure": [
    "Linear",
    "Non-linear",
    "Episodic",
    "In Medias Res",
    "Frame Story"
  ]
};

/**
 * Extended RPG & Worldbuilding Gems for deep Tangent SFF flavor.
 */
export const EXTENDED_GEMS = {
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
  "Setting Style": [
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
 * Combined Guidance Gems taxonomy, with the 6 Canonical AIME Gems positioned first.
 * Aliases "POV" to "Point of View" for backwards compatibility.
 */
export const GUIDANCE_GEMS = {
  ...AIME_CANONICAL_GEMS,
  "POV": AIME_CANONICAL_GEMS["Point of View"],
  ...EXTENDED_GEMS
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
 * Formats active gems array or object into a structured markdown prompt snippet.
 */
export const formatGemsPrompt = (activeGems = []) => {
  if (!activeGems) return 'Standard Tangent Science Fantasy';
  if (typeof activeGems === 'string') return activeGems.trim();
  if (Array.isArray(activeGems)) {
    if (activeGems.length === 0) return 'Standard Tangent Science Fantasy';
    return activeGems.join(', ');
  }
  if (typeof activeGems === 'object') {
    const parts = [];
    for (const [k, v] of Object.entries(activeGems)) {
      if (Array.isArray(v) && v.length > 0) parts.push(`${k}: ${v.join(', ')}`);
      else if (typeof v === 'string' && v.trim()) parts.push(`${k}: ${v.trim()}`);
    }
    return parts.length > 0 ? parts.join(' | ') : 'Standard Tangent Science Fantasy';
  }
  return 'Standard Tangent Science Fantasy';
};

/**
 * Formats canonical 6 AIME gems into an explicit directorial instruction block for LLM prompts.
 */
export const formatAimeGuidanceDirective = (guidance = {}) => {
  if (!guidance || typeof guidance !== 'object') return '';
  const lines = [];

  const genre = guidance.genre || guidance.Genre;
  const tone = guidance.tone || guidance.Tone;
  const pacing = guidance.pacing || guidance.Pacing;
  const pov = guidance.pov || guidance.POV || guidance["Point of View"];
  const devices = guidance.literaryDevices || guidance.devices || guidance["Literary Devices"];
  const structure = guidance.structure || guidance.Structure;

  if (genre) lines.push(`- Genre: ${Array.isArray(genre) ? genre.join(', ') : genre}`);
  if (tone) lines.push(`- Tone: ${Array.isArray(tone) ? tone.join(', ') : tone}`);
  if (pacing) lines.push(`- Pacing: ${Array.isArray(pacing) ? pacing.join(', ') : pacing}`);
  if (pov) lines.push(`- Point of View: ${Array.isArray(pov) ? pov.join(', ') : pov}`);
  if (devices && devices.length > 0) lines.push(`- Literary Devices: ${Array.isArray(devices) ? devices.join(', ') : devices}`);
  if (structure) lines.push(`- Narrative Structure: ${Array.isArray(structure) ? structure.join(', ') : structure}`);

  return lines.length > 0 ? lines.join('\n') : '';
};
