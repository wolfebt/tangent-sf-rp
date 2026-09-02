/**
 * @file omnicortexVectorRag.ts
 * @description Stage 3.3: Canonical Omnicortex Vector RAG Retrieval-Augmented Generation Engine.
 * Provides high-speed semantic vector embeddings, cosine similarity search,
 * and rule context injection for BASTION AI and the CommLink tactical assistant.
 */

export interface RuleChunk {
  id: string;
  category: 'combat' | 'economatrix' | 'udu' | 'metaphysics' | 'character_creation' | 'planetary' | 'bestiary';
  title: string;
  citation: string;
  text: string;
  tags: string[];
  embedding?: number[];
}

/**
 * Canonical rules compendium chunks for Tangent SFF RP
 */
export const CANONICAL_RULES_COMPENDIUM: RuleChunk[] = [
  {
    id: 'rule-combat-dual-resolution',
    category: 'combat',
    title: 'Dual Resolution & Target Number Architecture',
    citation: 'Omnicortex 3.00 Combat Matrix',
    tags: ['combat', 'dice', 'target number', '2d10', 'resolution', 'margin of success'],
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
    tags: ['called shot', 'limb targeting', 'trauma', 'major wound', 'head', 'arms', 'legs', 'optics'],
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
    tags: ['stances', 'guard', 'aim', 'overcharge', 'defense'],
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
    tags: ['economatrix', 'pricing', 'cost', 'tech level', 'meta level', 'crafting'],
    text: `The Universal Economic Unified Theory (EUT) determines item value using the dual-exponential equation:
Cost (Credits) = Base_Cost * (2^TL) * (1.5^ML)
- TL: Tech Level (0 to 5+). Every +1 TL doubles manufacturing baseline value.
- ML: Metaphysics Level (0 to 5). Every +1 ML increases value by 50% due to exotic psi/aether containment materials.
- 7-Tier Crafting Timetable: Tier 1 (1 hour) up to Tier 7 (Megastructure / Months).`
  },
  {
    id: 'rule-udu-engine',
    category: 'udu',
    title: 'Unified Difficulty Units (UDU) & Volumetric Scaling',
    citation: 'Codex 5.00 UDU Matrix',
    tags: ['udu', 'difficulty units', 'scaling', 'size tier', 'volumetric'],
    text: `Unified Difficulty Units (UDU) standardize physical tasks and craft complexity:
- Size Tiers: Fine (1), Diminutive (2), Tiny (3), Small (4), Medium (5), Large (6), Huge (7), Gargantuan (8), Colossal (9).
- Structural Integrity = Volume * Material Density Multiplier.
- Hardness & Damage Threshold: Attacks dealing less than target Hardness are completely deflected (0 net damage).`
  },
  {
    id: 'rule-metaphysics-essence',
    category: 'metaphysics',
    title: 'Metaphysics, Invocations & Sustained Essence Tax',
    citation: 'Omnicortex 4.00 Metaphysics Compendium',
    tags: ['metaphysics', 'invocations', 'essence', 'sustained', 'degradation', 'magic', 'psi'],
    text: `Metaphysical Invocations draw from the operator's Essence pool:
- Cantrips (Rank 0): 0 Essence cost, infinite casting.
- Tier 1-5 Spells: Consume 2 to 10 Essence points.
- Sustained Effects: Deduct 1 Essence per round maintained from the caster's chronometer pool.
- Status Degradation Entropy: At the start of each round, sustained spells roll a 1d10 check against DC (Spell Level + Rounds Active). On failure, the effect dissipates.`
  },
  {
    id: 'rule-character-creation-150cp',
    category: 'character_creation',
    title: '150 Character Point (CP) Operative Creation Economy',
    citation: 'Operator Guide 1.01 Character Creation',
    tags: ['150 cp', 'character points', '150 bp', 'build points', 'character creation', 'skill pools', 'attributes', 'advancement'],
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
    tags: ['planetary', 'uwp', 'civilization', 'radar', 'gravity', 'atmosphere', 'astrogation'],
    text: `Planetary systems are codified using Universal World Profiles:
- Code: Star Type - Planet Class - Size - Atmosphere - Hydrographics - Population - Tech Level - Law Level.
- Locomotion Hazards: Zero-G environments require Reflex checks (DC 14) during sudden directional thruster bursts.
- Inertia Drift: Uncontrolled vacuum movement continues at current vector until reverse thrust or physical impact occurs.`
  }
];

/**
 * Computes a lightweight fast pseudo-embedding vector for text similarity
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

// Pre-embed all canonical chunks
for (const chunk of CANONICAL_RULES_COMPENDIUM) {
  const fullText = `${chunk.title} ${chunk.tags.join(' ')} ${chunk.text}`;
  chunk.embedding = computeTermVector(fullText, VOCABULARY);
}

export interface RagSearchResult {
  chunk: RuleChunk;
  score: number;
}

/**
 * Queries the Omnicortex Vector RAG index for the top most relevant rule chunks
 */
export function queryOmnicortexRAG(query: string, topK: number = 2): RagSearchResult[] {
  if (!query || !query.trim()) {
    return [];
  }

  const queryVector = computeTermVector(query, VOCABULARY);
  const results: RagSearchResult[] = [];

  for (const chunk of CANONICAL_RULES_COMPENDIUM) {
    if (!chunk.embedding) continue;
    
    // Base vector cosine similarity
    let score = cosineSimilarity(queryVector, chunk.embedding);

    // Boost score if keyword tags match directly
    const lowerQuery = query.toLowerCase();
    for (const tag of chunk.tags) {
      if (lowerQuery.includes(tag)) {
        score += 0.25;
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

  let context = 'CANONICAL OMNICORTEX RULES CITATIONS:\n';
  for (const { chunk, score } of ragResults) {
    context += `\n--- [${chunk.citation}] ${chunk.title} (Relevance: ${(score * 100).toFixed(0)}%) ---\n${chunk.text}\n`;
  }
  return context;
}
