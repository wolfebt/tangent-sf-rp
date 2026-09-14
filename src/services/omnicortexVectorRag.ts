/**
 * @file omnicortexVectorRag.ts
 * @description Canonical Omnicortex Vector RAG (Retrieval-Augmented Generation) Engine.
 * Provides high-speed semantic vector embeddings, cosine similarity search,
 * keyword/tag boosting, and canonical rules/lore context injection for BASTION and AIME.
 */

import compendiumSeed from '../data/compendiumSeed.json';
import { BASTION_MECHANICS_DATASET } from '../data/mechanicsData.js';
import specializedRules from '../data/omnicortexSpecializedRules.json';
import catalogChunks from '../data/bastionCatalogChunks.json';

export interface RuleChunk {
  id: string;
  category: 'combat' | 'economatrix' | 'udu' | 'metaphysics' | 'character_creation' | 'planetary' | 'bestiary' | 'factions' | 'species' | 'lore' | 'vitals_integrity' | 'scaling' | 'technology' | 'companions' | string;
  title: string;
  citation: string;
  text: string;
  tags: string[];
  embedding?: number[];
  formula?: string;
  status?: string;
}

/**
 * High-priority foundational rules compendium chunks for Tangent SFF RP
 */
export const CANONICAL_FOUNDATIONAL_CHUNKS: RuleChunk[] = [
  {
    id: 'rule-combat-dual-resolution',
    category: 'combat',
    title: 'Dual Resolution & Target Number Architecture',
    citation: 'Omnicortex 3.00 Combat Matrix',
    tags: ['combat', 'dice', 'target number', '2d10', 'resolution', 'margin of success', 'attack', 'defense'],
    text: `TANGENT uses a Dual-Resolution mechanic:
- Core Action Checks: 2d10 + Attribute Modifier + Skill Rank vs. Target Number (TN / DC).
- Target Number formula: Baseline TN = 11 + Secondary Defense / Resistance Rating.
- Margin of Success: Net result above TN determines effectiveness (+5 = Superior, +10 = Masterful).
- Critical Success: Rolling Double 10s (natural 20) triggers maximum strike damage + automatic bonus tactical action.
- Critical Fumble: Rolling Double 1s (natural 2) triggers weapon jam, stance break, or environmental hazard check.`
  },
  {
    id: 'rule-combat-called-shots',
    category: 'combat',
    title: 'Called Shots & 33.3% Major Wound Trauma',
    citation: 'Omnicortex 3.02 Damage & Wound Pipeline',
    tags: ['called shot', 'limb targeting', 'trauma', 'major wound', 'head', 'arms', 'legs', 'optics', 'injury'],
    text: `Called Shots allow operators to target specific anatomy with specialized modifiers and trauma outcomes:
- Torso (Center Mass): +0 modifier, standard damage.
- Head (Disorient): -2 to hit. If net damage >= 33.3% max HP, inflicts Disoriented (-2 to all mental/action rolls).
- Arms (Disarm / Sever): -2 to hit. If net damage >= 33.3% max HP, forces immediate weapon drop and applies Disabled Arm (-4 attack).
- Legs (Mobility Kill): -1 to hit. If net damage >= 33.3% max HP, inflicts Crippled Leg (halves base movement speed immediately).
- Optics / Sensors: -3 to hit. If net damage >= 33.3% max HP, inflicts Blind / Sensor Jam (-4 to all ranged checks).`
  },
  {
    id: 'rule-combat-stances',
    category: 'combat',
    title: 'Tactical Combat Stances',
    citation: 'Omnicortex 3.05 Tactical Movement & Stances',
    tags: ['stances', 'guard', 'aim', 'overcharge', 'defense', 'tactics'],
    text: `Operators can assume tactical stances at the start of their turn:
- 🛡️ GUARD (+2 Armor DR): Focus on defensive posture, increasing armor absorption DR by +2 until start of next turn.
- 🎯 AIM (+2 To-Hit): Sights locked onto target, granting +2 bonus to the next attack roll this round.
- ⚡ OVERCHARGE (+6 DMG / +2 Heat): Overclocks weapon capacitor, adding +6 energy damage but generating thermal/vitality fatigue.`
  },
  {
    id: 'rule-economatrix-pricing',
    category: 'economatrix',
    title: 'Economatrix Unified Cost Equation',
    citation: 'Codex 2.00 Economatrix Matrix',
    tags: ['economatrix', 'pricing', 'cost', 'tech level', 'meta level', 'crafting', 'credits', 'value'],
    text: `The Universal Economic Unified Theory (EUT) determines item value using the dual-exponential equation:
Cost (Credits) = Base_Cost * (2^TL) * (1.5^ML)
- TL: Tech Level (0 to 5+). Every +1 TL doubles manufacturing baseline value.
- ML: Metaphysics Level (0 to 5). Every +1 ML increases value by 50% due to exotic psi/aether containment materials.
- 7-Tier Crafting Timetable: Tier 1 (1 hour) up to Tier 7 (Megastructure / Months).`
  },
  {
    id: 'rule-tech-levels-spectrum',
    category: 'economatrix',
    title: 'Tech Level (TL 0–5) Classifications & Aesthetics',
    citation: 'Omnicortex 2.01 Technology Spectrum',
    tags: ['tech level', 'tl', 'hard-light', 'nanotech', 'cybernetics', 'slug-throwers', 'energy'],
    text: `Tech Levels (TL 0–5) define equipment sophistication and visual/sound aesthetics:
- TL 0 (Primitive / Archaic): Forged metals, ballistic gunpowder, mechanical springs, raw ceramics.
- TL 1 (Industrial / Mechanical): Combustion engines, standard rifling, heavy hydraulic plating.
- TL 2 (Advanced Electronic): Micro-circuitry, early railguns, optical HUDs, Kevlar/Titanium weaves.
- TL 3 (Interstellar / Cybernetic): Standard galactic baseline. Plasma accelerators, cyber-implants, shields, neural jacks.
- TL 4 (Nanotech / Hard-Light): Photonic mandalas, shape-memory smart-matter, quantum repeaters, cold fusion cells.
- TL 5 (Progenitor / Precursor): Dimensional folding, dark energy manipulation, self-repairing monoliths.`
  },
  {
    id: 'rule-metaphysics-levels',
    category: 'metaphysics',
    title: 'Meta Level (ML 0–5) Reality Manipulation',
    citation: 'Omnicortex 4.01 Metaphysics & Psionics',
    tags: ['meta level', 'ml', 'sorcery', 'psionics', 'magic', 'essence', 'aether', 'powers'],
    text: `Meta Levels (ML 0–5) quantify psionic, arcane, and reality-altering frequency:
- ML 0 (Mundane / Inert): Zero metaphysical sensitivity or aether resonance.
- ML 1 (Latent / Awakened): Minor telekinesis, sensory empathy, instinctual premonitions.
- ML 2 (Adept / Discipline): Active bio-kinetic shielding, thermal channeling, telepathic speech.
- ML 3 (Master / Sorcerer): Gravimetric pulses, illusions, temporal dilation, essence-woven barriers.
- ML 4 (High Sorcery / Metamagic): Continental warp fields, molecular transmutation, hard-light spellweaves.
- ML 5 (Cosmic / Divine): Planetary reality shifts, chronometer resets, planar convergence.`
  },
  {
    id: 'rule-udu-engine',
    category: 'udu',
    title: 'Unified Difficulty Units (UDU) & Volumetric Scaling',
    citation: 'Codex 5.00 UDU Matrix',
    tags: ['udu', 'difficulty units', 'scaling', 'size tier', 'volumetric', 'hardness', 'threshold'],
    text: `Unified Difficulty Units (UDU) standardize physical tasks and craft complexity:
- Size Tiers: Fine (1), Diminutive (2), Tiny (3), Small (4), Medium (5), Large (6), Huge (7), Gargantuan (8), Colossal (9).
- Structural Integrity = Volume * Material Density Multiplier.
- Hardness & Damage Threshold: Attacks dealing less than target Hardness are completely deflected (0 net damage).`
  },
  {
    id: 'rule-character-creation-150cp',
    category: 'character_creation',
    title: '150 Character Point (CP) Operative Creation Economy',
    citation: 'Operator Guide 1.01 Character Creation',
    tags: ['150 cp', 'character points', '150 bp', 'build points', 'character creation', 'skill pools', 'attributes'],
    text: `Operatives in Tangent SFF RP are created using a strict 150 Character Point (CP) budget:
- Attributes: 5 CP per +1 attribute rank above base 0.
- Check Bonuses: 1 CP per +1 sub-attribute check score.
- Three 20-Point Background Skill Pools:
  1. Faction Skill Pool (20 SP)
  2. Origin Skill Pool (20 SP)
  3. Occupation Skill Pool (20 SP)
- Hindrances & Flaws: Grant point rebates up to -20 CP back into the character pool.
- Increment Rule: Advancement is restricted to +1 point per attribute or skill rank per milestone award.`
  },
  {
    id: 'rule-planetary-uwp',
    category: 'planetary',
    title: 'Universal World Profiles (UWP) & 16-Domain Radar',
    citation: 'Architect Guide 99. Planetary Design Matrix',
    tags: ['planetary', 'uwp', 'civilization', 'radar', 'gravity', 'atmosphere', 'astrogation', 'world'],
    text: `Planetary systems are codified using Universal World Profiles:
- Code: Star Type - Planet Class - Size - Atmosphere - Hydrographics - Population - Tech Level - Law Level.
- Locomotion Hazards: Zero-G environments require Reflex checks (DC 14) during sudden directional thruster bursts.
- Inertia Drift: Uncontrolled vacuum movement continues at current vector until reverse thrust or physical impact occurs.`
  },
  {
    id: 'rule-vitals-30-30-60',
    category: 'vitals_integrity',
    title: 'Vitals & Structure Pools: 30 VP / 30 HP / 60 SP Base',
    citation: 'Operator Guide 1.01 Character Creation & 3.00 Combat',
    tags: ['vitals', 'vitality', 'health', 'structure', '30 base', '60 base', 'stamina', 'toughness', 'synthetics'],
    text: `Canonical Vitals and Structure Architecture:
- Biological Entities: 30 pt base Vitality (VP) and 30 pt base Health (HP).
- No Stamina-based bonus on Vitality or Health directly. Stamina functions as natural Damage Reduction (Toughness), absorbing penetrating damage point-for-point (minimum 1 damage taken).
- Pools increase strictly through Size categories, Traits, Features, or Character Point (CP) purchases (1 CP = +2 points).
- Synthetics, Constructs & Mecha: 60 pt base Structure Points (SP) for Medium size (adjusted by size tier multiplier). Zero Vitality, complete immunity to non-lethal damage, fatigue, and biological hazards.`
  },
  {
    id: 'rule-karma-spending-actions',
    category: 'combat',
    title: 'Karma Points Economy & The 6 Canonical Spending Actions',
    citation: 'Operator Guide 2.04 Karma Points & Fate Modification',
    tags: ['karma', 'karma points', 'plot points', 'fate', 'advantage', 'reroll', 'shake it off', 'second wind', 'karmic debt'],
    text: `Karma Points provide narrative and tactical agency:
- Default Pool: Characters have 3 Karma Points. Resets at the start of each session; does NOT recover via rest.
- Pool Expansion: Increased via the Karmic Blessing feature (+1 per rank) or GM milestones.
- The 6 Canonical Karma Spending Actions (1 KP each):
  1. "I Got This": Declare before rolling -> Advantage on any single roll (attacks, saves, skills, damage).
  2. "Not What I Meant": Declare immediately after roll -> Discard and reroll ability or non-combat check (accept 2nd roll; no combat attacks).
  3. "Shake it Off": Declare anytime afflicted -> Reduce condition severity by 1 stage (e.g. Major to Minor for Poisoned, Stunned, Blinded).
  4. "Second Wind": 1 full minute of focus -> Replaces Light Rest; instantly refreshes daily limited-use abilities, special attacks, and traits.
  5. "So Mote it Be": Declare simultaneously with metaphysical skill/feat -> Boosts potency (range, duration, magnitude) or activates a discipline Karma Feat.
  6. "By Will Alone": Declare with GM approval -> Push limits / narrative agency (attempt unlisted/impossible action, emulate a feature for a scene).
- Karmic Debt: May spend into negative karma up to Charisma score + 1 (triggering GM-imposed disadvantages or NPC luck).`
  },
  {
    id: 'rule-augmentation-tiers',
    category: 'technology',
    title: 'Augmentation System: Body Alteration Tiers (No Max Strain)',
    citation: 'Architect Guide 99. Technology, Augmentations Matrix',
    tags: ['augmentations', 'cybernetics', 'bioware', 'body alteration', 'heavy augmentations', 'severe augmentations', 'full body conversion'],
    text: `The Augmentation system has NO max strain:
- Progression is governed by percentage of physical body alteration:
  1. Augmentation (Tier 1): < 20% body alterations. Standard cybernetic/biological improvements, prosthetics, and minor neural links.
  2. Heavy Augmentation (Tier 2): < 50% body alterations. Significant industrial/military replacements, heavy plating, and dense internal hardware.
  3. Severe Augmentation (Tier 3): > 50% body alterations up to Full Body Conversion (FBC). More machine or bio-construct than original being; allows chassis structural reconfigurations.
- Negligible Fashionware (< 5%): Subdermal chips, cosmetic bioware, and skinwatches require no augmentation feature.`
  },
  {
    id: 'rule-mecha-vehicles-spectrum',
    category: 'technology',
    title: 'Mecha Taxonomy: Universal Spectrum of Vehicles',
    citation: 'Architect Guide 99. Technology, Mecha Matrix',
    tags: ['mecha', 'vehicles', 'power armor', 'walkers', 'hoverboards', 'motorcycles', 'fighter jets', 'starships', 'chassis'],
    text: `In the Tangent system, Mecha encompasses vehicles of all sorts across the entire technological spectrum:
- Spans: Hoverboards, motorcycles, ground cars, powered exoskeletons, power armor, bipedal/multipedal walkers, atmospheric fighter jets, shuttles, and starships.
- All vehicle chassis use Structure Points (SP) with a Medium baseline of 60 SP, multiplied across the 14 volumetric size categories.
- Incorporates modular socketing for weapon hardpoints, sensor suites, shield generators, and meta-tech invocation emitters.`
  }
];

/**
 * Builds dynamic compendium chunks from compendiumSeed.json
 */
function buildCompendiumChunks(): RuleChunk[] {
  if (!Array.isArray(compendiumSeed)) return [];

  return compendiumSeed.map((item: any) => {
    let cat: RuleChunk['category'] = 'lore';
    const p = (item.parent || '').toLowerCase();
    const t = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';

    if (p.includes('combat') || t.includes('combat')) cat = 'combat';
    else if (p.includes('metaphysics') || t.includes('metaphysics')) cat = 'metaphysics';
    else if (p.includes('economatrix') || t.includes('economatrix')) cat = 'economatrix';
    else if (p.includes('faction') || t.includes('faction')) cat = 'factions';
    else if (p.includes('origin') || p.includes('occupation') || p.includes('skill') || p.includes('character')) cat = 'character_creation';
    else if (p.includes('world') || p.includes('bestiary')) cat = 'planetary';

    // Strip markdown formatting for cleaner vector indexing
    const cleanDesc = (item.description || '').replace(/[#*_`~\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanMech = (item.mechanic || '').replace(/[#*_`~\[\]]/g, ' ').replace(/\s+/g, ' ').trim();

    let text = `${item.name}\n`;
    if (cleanMech) text += `Rules Mechanics: ${cleanMech}\n`;
    if (cleanDesc) text += `Description & Lore: ${cleanDesc.slice(0, 450)}\n`;
    if (item.tl !== undefined && item.tl !== null) text += `Tech Level: TL ${item.tl} | `;
    if (item.ml !== undefined && item.ml !== null) text += `Meta Level: ML ${item.ml}`;

    return {
      id: `compendium-${item.id || item.name}`,
      category: cat,
      title: item.name || 'Untitled Article',
      citation: item.parent || 'Omnicortex Compendium',
      text: text.trim(),
      tags: [...(Array.isArray(item.tags) ? item.tags : []), item.name, item.parent || '', cat].filter(Boolean)
    };
  });
}

/**
 * Builds high-priority rule chunks directly from BASTION_MECHANICS_DATASET
 */
function buildMechanicsChunks(): RuleChunk[] {
  if (!Array.isArray(BASTION_MECHANICS_DATASET)) return [];

  return BASTION_MECHANICS_DATASET.map(m => {
    let text = `${m.title} (${m.citation})\n`;
    if (m.summary) text += `Summary: ${m.summary}\n`;
    if (m.mechanic_formula) text += `Formula: ${m.mechanic_formula}\n`;
    text += `Rules Text: ${m.rules_text}\n`;
    if (Array.isArray(m.examples) && m.examples.length > 0) {
      text += `Examples: ${m.examples.join(' | ')}\n`;
    }

    return {
      id: `mech-${m.id}`,
      category: (m.category || 'combat') as RuleChunk['category'],
      title: m.title,
      citation: m.citation,
      text: text.trim(),
      tags: [...(Array.isArray(m.tags) ? m.tags : []), m.title.toLowerCase(), 'mechanics', 'rule', m.category],
      formula: m.mechanic_formula || '',
      status: m.status || 'approved'
    };
  });
}

function buildSpecializedRuleChunks(): RuleChunk[] {
  if (!Array.isArray(specializedRules)) return [];

  return specializedRules.map((r: any) => ({
    id: `specialized-${r.id}`,
    category: (r.category || 'combat') as RuleChunk['category'],
    title: r.name || r.id,
    citation: `Omnicortex Rule: ${r.id}`,
    text: `${r.name}\n${r.description || ''}\n${r.body || ''}`.trim(),
    tags: [...(Array.isArray(r.tags) ? r.tags : []), (r.name || '').toLowerCase(), 'rule', 'tactical']
  }));
}

function buildCatalogChunks(): RuleChunk[] {
  if (!Array.isArray(catalogChunks)) return [];

  return catalogChunks.map((c: any) => ({
    id: `catalog-${c.id}`,
    category: (c.domain || 'combat') as RuleChunk['category'],
    title: c.title,
    citation: c.citation || 'BASTION Canonical Ruleset Master Catalog',
    text: c.text,
    tags: [...(Array.isArray(c.tags) ? c.tags : []), 'catalog', 'canonical', 'ruleset'],
    formula: c.formula || ''
  }));
}

// Combine Foundational Rules, Mechanics Dataset, Catalog Chunks, Specialized Rules, and Compendium Articles
export const CANONICAL_RULES_COMPENDIUM: RuleChunk[] = [
  ...buildMechanicsChunks(),
  ...buildCatalogChunks(),
  ...CANONICAL_FOUNDATIONAL_CHUNKS,
  ...buildSpecializedRuleChunks(),
  ...buildCompendiumChunks()
];

/**
 * Computes a fast normalized pseudo-embedding term frequency vector for text similarity
 */
function computeTermVector(text: string, vocabulary: string[]): number[] {
  const words = text.toLowerCase().replace(/[^a-z0-9_\-\s]/g, ' ').split(/\s+/).filter(Boolean);
  const vector = new Array(vocabulary.length).fill(0);
  const wordFreq: Record<string, number> = {};

  for (const w of words) {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }

  for (let i = 0; i < vocabulary.length; i++) {
    const term = vocabulary[i];
    if (wordFreq[term]) {
      vector[i] = wordFreq[term] / words.length;
    }
  }

  return vector;
}

/**
 * Computes Cosine Similarity between two numeric vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Build Global Vocabulary across all chunks
const ALL_TEXT = CANONICAL_RULES_COMPENDIUM.map(c => `${c.title} ${c.tags.join(' ')} ${c.text}`).join(' ');
const VOCABULARY = Array.from(new Set(
  ALL_TEXT.toLowerCase().replace(/[^a-z0-9_\-\s]/g, ' ').split(/\s+/).filter(w => w.length > 2)
));

// Pre-embed all chunks on startup
for (const chunk of CANONICAL_RULES_COMPENDIUM) {
  const fullText = `${chunk.title} ${chunk.tags.join(' ')} ${chunk.text}`;
  chunk.embedding = computeTermVector(fullText, VOCABULARY);
}

export interface RagSearchResult {
  chunk: RuleChunk;
  score: number;
}

/**
 * Detects domain intent keywords to intelligently boost related categories
 */
function detectIntentCategories(query: string): string[] {
  const q = query.toLowerCase();
  const categories: string[] = [];

  if (q.match(/\b(combat|fight|shot|shoot|attack|damage|wound|called shot|weapon|armor|strike|defense|ap|reaction|stance|map)\b/)) {
    categories.push('combat');
  }
  if (q.match(/\b(health|vitality|structure|sp|vp|hp|wound|bleedout|healing|repair|non-lethal|lethal|death|mortality)\b/)) {
    categories.push('vitals_integrity');
    categories.push('combat');
  }
  if (q.match(/\b(scale|scaling|size|gargantuan|huge|colossal|titanic|enormous|multiplier|dimensions|reach|proximity)\b/)) {
    categories.push('scaling');
  }
  if (q.match(/\b(companion|drone|cohort|familiar|mount|chassis|form package|function package)\b/)) {
    categories.push('companions');
  }
  if (q.match(/\b(psi|sorcery|magic|metaphysic|spell|invocation|essence|aether|psionic|strain|cantrip)\b/)) {
    categories.push('metaphysics');
  }
  if (q.match(/\b(faction|polity|enclave|syndicate|diplomacy|politic|treaty|war|alliance|empire)\b/)) {
    categories.push('factions');
  }
  if (q.match(/\b(cost|price|craft|economatrix|credit|market|buy|sell|tech level|eut)\b/)) {
    categories.push('economatrix');
  }
  if (q.match(/\b(species|alien|synthetic|lineage|heritage|trait|stigma)\b/)) {
    categories.push('species');
  }
  if (q.match(/\b(attribute|sub-attribute|strength|agility|stamina|intellect|wisdom|charisma|toughness|reflexes|fortitude|150 bp|bp|creation)\b/)) {
    categories.push('character_creation');
  }

  return categories;
}

/**
 * Queries the Omnicortex Vector RAG index for the top most relevant rule and lore chunks
 */
export function queryOmnicortexRAG(query: string, topK: number = 4, categoryFilter?: string): RagSearchResult[] {
  if (!query || !query.trim()) {
    return [];
  }

  const queryVector = computeTermVector(query, VOCABULARY);
  const detectedCategories = detectIntentCategories(query);
  const lowerQuery = query.toLowerCase();
  const results: RagSearchResult[] = [];

  for (const chunk of CANONICAL_RULES_COMPENDIUM) {
    if (!chunk.embedding) continue;
    if (categoryFilter && chunk.category !== categoryFilter) continue;

    // Base vector cosine similarity
    let score = cosineSimilarity(queryVector, chunk.embedding);

    // Boost score if keyword tags match query directly
    for (const tag of chunk.tags) {
      if (lowerQuery.includes(tag.toLowerCase())) {
        score += 0.22;
      }
    }

    // Boost if title words match query
    const titleWords = chunk.title.toLowerCase().split(/\s+/);
    for (const tw of titleWords) {
      if (tw.length > 3 && lowerQuery.includes(tw)) {
        score += 0.15;
      }
    }

    // Domain intent category boost
    if (detectedCategories.includes(chunk.category)) {
      score += 0.15;
    }

    // Direct boost for canonical BASTION mechanics rules
    if (chunk.id.startsWith('mech-')) {
      score += 0.25;
      if (chunk.formula && (lowerQuery.includes('how') || lowerQuery.includes('rule') || lowerQuery.includes('calculate') || lowerQuery.includes('damage') || lowerQuery.includes('formula'))) {
        score += 0.20;
      }
    }

    if (score > 0.05) {
      results.push({ chunk, score });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

/**
 * Formats retrieved RAG chunks into a structured system context for BASTION
 */
export function formatRagContextForBastion(ragResults: RagSearchResult[]): string {
  if (ragResults.length === 0) return '';

  let context = 'CANONICAL OMNICORTEX RULES & BASTION MECHANICS CITATIONS:\n';
  for (const { chunk, score } of ragResults) {
    const isApproved = chunk.status === 'approved' || chunk.id.startsWith('mech-');
    const statusBadge = isApproved ? '[APPROVED CANON MECHANIC]' : '[COMPENDIUM LORE]';
    context += `\n--- ${statusBadge} [${chunk.citation}] ${chunk.title} (Relevance: ${(score * 100).toFixed(0)}%) ---\n`;
    if (chunk.formula) {
      context += `CANONICAL FORMULA: ${chunk.formula}\n`;
    }
    context += `${chunk.text}\n`;
  }
  return context;
}

/**
 * Formats retrieved RAG chunks into a sensory narrative guidance block for AIME
 */
export function formatRagContextForAIME(ragResults: RagSearchResult[]): string {
  if (!ragResults || ragResults.length === 0) return '';

  let context = '[CANONICAL OMNICORTEX RULES & WORLD LAWS]:\n';
  for (const { chunk } of ragResults) {
    context += `• ${chunk.title} (${chunk.citation}):\n  ${chunk.text.replace(/\n/g, '\n  ')}\n`;
  }

  context += `\n[NARRATIVE TRANSMUTATION DIRECTIVE]:\nDo not recite dice formulas or dry numerical mechanics. Transmute these canonical rules, Tech Levels (TL), Meta Levels (ML), called shots, and trauma thresholds into visceral sights, sounds, tactile resistance, and tactical decisions.`;

  return context;
}

export default {
  CANONICAL_RULES_COMPENDIUM,
  queryOmnicortexRAG,
  formatRagContextForBastion,
  formatRagContextForAIME
};
