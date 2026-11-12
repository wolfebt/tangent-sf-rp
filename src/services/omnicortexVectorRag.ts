/**
 * @file omnicortexVectorRag.ts
 * @description Canonical Omnicortex Vector RAG (Retrieval-Augmented Generation) Engine.
 * Provides high-speed semantic vector embeddings, cosine similarity search,
 * keyword/tag boosting, and canonical rules/lore context injection for BASTION and AIME.
 */

import { BASTION_MECHANICS_DATASET } from '../data/mechanicsData.js';
import specializedRules from '../data/omnicortexSpecializedRules.json' with { type: 'json' };
import catalogChunks from '../data/bastionCatalogChunks.json' with { type: 'json' };
import { getOpfsWorkerManager } from './opfsWorkerManager.ts';

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
  visibility?: 'public' | 'architect';
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
    tags: ['combat', 'dice', 'target number', '2d10', 'resolution', 'margin of success', 'attack', 'defense', 'cr 15'],
    text: `TANGENT uses a 2d10 Dual-Resolution mechanic:
- Core Action Checks: 2d10 + Attribute Modifier + Skill Rank vs. Target Defense or Challenge Rating (CR). Advantage/Disadvantage adds +1d10 keeping highest/lowest 2 (3d10kh2 / 3d10kl2), cancelling 1-for-1.
- Opposed Combat Rolls: Attacker rolls 2d10 + Combat Skill + Attribute Mod vs. Defender's Defense Check (2d10 + Defense Skill + Agility Mod). DEFENDER WINS ALL TIES.
- Unopposed Baseline: Static difficulty baseline is CR 15 (Average difficulty for a Medium target at Short range, modified by Size, Range, and Movement).
- Margin of Success: Net result above Target Defense / CR determines effectiveness (+5 = Superior, +10 = Masterful).
- Critical Success: Rolling Double 10s (natural 20, or expanded threat range 19, 18...) adds +10 in addition to the rolled dice value (e.g., 20 -> 30, 19 -> 29) and doubles weapon damage dice.
- Critical Fumble: Rolling Double 1s (natural 2, or expanded fumble range 3, 4...) replaces the rolled dice value with a flat -10 (subtracting 10 from the base score regardless of whether rolled on 2, 3, 4...) and triggers a tactical complication.`
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
    title: 'Economatrix Tangent Standard Curve (TSC) & Golden Rule of Wealth',
    citation: 'Codex 2.00 Economatrix Matrix',
    tags: ['economatrix', 'pricing', 'cost', 'tech level', 'meta level', 'crafting', 'credits', 'value', 'wealth score', 'liquidity gap'],
    text: `The Tangent Economic Unified Field Theory (EUFT) determines item value using the Tangent Standard Curve (TSC) and Linear Micro-Modifiers:
Base Value (Credits) = 10 * 4^(floor(CR / 5)) * Micro-Modifier (+0 CR = x1.00, +1 = x1.30, +2 = x1.75, +3 = x2.30, +4 = x3.00; -1 Flaw = x0.75; e.g., CR 18 = 1,472 Cr, CR 32 = 71,680 Cr).
- The Golden Rule of Tangent Wealth: Purchase CR = Crafting CR = Cost CR (legacy alias DC).
- Auto-Buy Threshold: Any item with Cost CR <= Character Wealth Score (WS) is acquired automatically without depleting liquid Credits.
- Liquidity Gap: When Item Cost CR > Character WS, Liquid Cost = Value(Item CR) - Value(Character WS).
- Materials & Scrap: Pristine materials cost 50% of final Market Value; Fence liquidation yields 10% base; salvaging requires 5x Credit Value in Unrefined Scrap Mass.
- 7-Tier Crafting Productivity Engine: Daily PP = (Craft Check - 10) * Tool Tier Multiplier (x1 Improvised to x5,000 Genesis) * Crew Size.`
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
    title: 'Universal Displacement Units (UDU) & 10:1 Socket Hierarchy',
    citation: 'Codex 5.00 UDU Matrix & 5.04 Mecha',
    tags: ['udu', 'displacement units', 'sockets', 'nodes', 'mounts', 'modules', 'garaging', 'meta-tech'],
    text: `Universal Displacement Units (UDU) standardize physical chassis volume and modular engineering across a strict 10:1 hierarchy:
- 10 Nodes = 1 Socket | 10 Sockets = 1 Mount | 10 Mounts = 1 Module.
- Biological & Cybernetic Anatomy: Medium humanoid chassis contains 200 total Body Nodes across Head, Torso, and Limbs.
- Mecha Garaging (Hangar Modules): Medium = 0.1 Mod, Large = 0.2 Mod, Huge = 0.5 Mod, Gargantuan = 1.0 Mod, Colossal = 2.0 Mod.
- Meta-Tech Invocation Capacity: 1 Socket supports max Rank 10 Invocations; 2 Sockets support max Rank 20; 3+ Sockets, 1 Mount, or 1 Module support max Rank 30.`
  },
  {
    id: 'rule-character-creation-150cp',
    category: 'character_creation',
    title: '150 Character Point (CP) Operator Creation Economy',
    citation: 'Operator Guide 1.01 Character Creation',
    tags: ['150 cp', 'character points', '150 bp', 'build points', 'character creation', 'skill pools', 'attributes'],
    text: `Operators in Tangent SFF RP are created using a strict 150 Character Point (CP) budget (80 CP Archetype package + 70 CP Customization):
- Attributes: 5 CP per +1 attribute rank above base 0 (soft cap +4 at creation).
- Check Bonuses: 1 CP per +1 sub-attribute check score.
- Skills & Specializations: Base Skill Ranks span 0–20 at 1 SP/CP per rank (Creation cap is Rank 11 [Expert Stage 3]; Base Skill max is Rank 20 [Master Stage 4]). Specializations do NOT grant a flat +2; they are built-up sub-skills (Rank 1–10 at 1 SP/CP per rank, Prerequisite Base Rank 6+, max 1 viable per check) adding directly to Base Skill to unlock the 21–30 range (Grand Master 21–25 & Pinnacle 26–30).
- Three 20-Point Background Skill Pools (0 CP): Faction (20 SP), Origin (20 SP), and Occupation (20 SP) = 60 free skill ranks.
- Personal Hindrances & Flaws: Grant up to +10 CP maximum rebate at creation (Social Stigmas and innate Species flaws are exempt from this cap).
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
- Locomotion Hazards: Zero-G environments require Reflex checks (CR 14) during sudden directional thruster bursts.
- Inertia Drift: Uncontrolled vacuum movement continues at current vector until reverse thrust or physical impact occurs.`
  },
  {
    id: 'rule-vitals-30-30-60',
    category: 'vitals_integrity',
    title: 'Vitals & Structure Pools: 30 VP / 30 HP / 60 SP Base',
    citation: 'Operator Guide 1.01 Character Creation & 3.00 Combat',
    tags: ['vitals', 'vitality', 'health', 'structure', '30 base', '60 base', 'stamina', 'toughness', 'synthetics'],
    text: `Canonical Vitals and Structure Architecture:
- Biological Entities: 30 pt base Vitality (VP) and 30 pt base Health (HP). Standard physical/energy damage depletes Vitality FIRST, spilling excess into Health (Bleed and Overchannel Burn bypass directly to Health).
- Zero Stamina Pool Scaling: No Stamina-based bonus on Vitality or Health directly. Stamina functions as natural Damage Reduction (Toughness), absorbing penetrating damage point-for-point down to a minimum of 0 damage taken. Armor Layering Cap: only the highest single Armor DR domain applies (never summed).
- Pools increase strictly through Size categories, Traits, Features, or Character Point (CP) purchases (1 CP = +5 points, no Stamina cap).
- Synthetics, Constructs & Mecha: 60 pt base Structure Points (SP) for Medium size (adjusted by size tier multiplier; pre-calculated Mecha table SP 200-3,200 is not double-multiplied). Zero Vitality, complete immunity to non-lethal damage, fatigue, and biological hazards.`
  },
  {
    id: 'rule-karma-spending-actions',
    category: 'combat',
    title: 'Karma Points Economy & The 6 Canonical Spending Actions',
    citation: 'Operator Guide 2.04 Karma Points & Fate Modification',
    tags: ['karma', 'karma points', 'plot points', 'fate', 'advantage', 'reroll', 'shake it off', 'second wind', 'karmic debt'],
    text: `Karma Points provide narrative and tactical agency:
- Default Pool: Characters have 3 Karma Points. Resets at the start of each session; does NOT recover via rest.
- Pool Expansion: Increased via the Karmic Blessing feature (+1 per rank) or Architect milestones.
- The 6 Canonical Karma Spending Actions (1 KP each):
  1. "I Got This": Declare before rolling -> Advantage on any single roll (attacks, saves, skills, damage).
  2. "Not What I Meant": Declare immediately after roll -> Discard and reroll ability or non-combat check (accept 2nd roll; no combat attacks).
  3. "Shake it Off": Declare anytime afflicted -> Reduce condition severity by 1 stage (e.g. Major to Minor for Poisoned, Stunned, Blinded).
  4. "Second Wind": 1 full minute of focus -> Replaces Light Rest; instantly refreshes daily limited-use abilities, special attacks, and traits.
  5. "So Mote it Be": Declare simultaneously with metaphysical skill/feature -> Boosts potency (range, duration, magnitude) or activates a discipline Karma Feature.
  6. "By Will Alone": Declare with Architect approval -> Push limits / narrative agency (attempt unlisted/impossible action, emulate a feature for a scene).
- Karmic Debt: May spend into negative karma up to Charisma score + 1 (triggering Architect-imposed disadvantages or NPC luck).`
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
  },
  {
    id: 'rule-architect-directives-keywords',
    category: 'directives',
    visibility: 'architect',
    title: 'Architect Directives & Thematic Guidance Keywords (+Weight)',
    citation: 'Codex 1.00 AI Guidance & Architect Directives',
    tags: ['directives', 'keywords', 'guidance', 'positive keywords', 'thematic weight', 'synergy', 'ai guidance', 'cybernetic', 'high-tech'],
    text: `Architect Directives and Thematic Guidance Keywords establish positive AI reference and synthesis weighting across Tangent SFF RP entities:
- Species, Factions, Origins, Occupations, Skills, Features, and Equipment specify positive keywords (Directives).
- When synthesizing or recommending character concepts, entities matching positive directive keywords receive significant synergy weight (+0.25 to +0.30 boost).
- Directives guide natural thematic cohesion without rigid class lockouts, encouraging harmonious cross-pillar combinations.`
  },
  {
    id: 'rule-architect-railguards-exclusions',
    category: 'railguards',
    visibility: 'architect',
    title: 'Architect Railguards & Boundary Exclusions (-Weight / Exclusions)',
    citation: 'Codex 1.00 AI Railguards & Boundary Exclusions',
    tags: ['railguards', 'negative keywords', 'exclusions', 'boundary', 'restrictions', 'penalties', 'contraindications', 'synthetic exclusions'],
    text: `Architect Railguards and Negative Boundary Exclusion Keywords enforce narrative integrity and prevent incongruous combinations in Tangent SFF RP:
- Entities define negative keywords (Railguards) representing boundaries, thematic clashes, or physical incompatibilities.
- When evaluating candidates, any entity triggering an active railguard keyword is heavily penalized (-0.50 score reduction) or excluded from recommendations.
- Railguards ensure synthetic entities avoid biological sickness traits, primitive cultures avoid hyper-advanced cyberware defaults, and spiritual factions avoid incompatible dogma.`
  }
];

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'when', 'where',
  'which', 'while', 'into', 'onto', 'upon', 'over', 'under', 'about', 'after',
  'before', 'between', 'through', 'during', 'without', 'within', 'their', 'there',
  'these', 'those', 'have', 'has', 'had', 'were', 'was', 'are', 'been', 'being',
  'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'must',
  'does', 'did', 'not', 'only', 'also', 'than', 'then', 'very', 'some', 'such',
  'each', 'every', 'any', 'all', 'both', 'more', 'most', 'other', 'into', 'your'
]);

interface MarkdownSection {
  heading: string;
  content: string;
}

/**
 * Splits arbitrarily long Markdown prose into coherent heading-aware sections
 * with zero character loss or truncation. Small adjacent subsections are grouped
 * up to targetChars (~2,000), and oversized blocks are split cleanly on paragraph/line boundaries.
 */
export function splitMarkdownIntoSections(
  rawMarkdown: string,
  targetChars = 2000,
  maxChars = 2800
): MarkdownSection[] {
  const normalized = String(rawMarkdown || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const rawBlocks: MarkdownSection[] = [];
  let currentHeading = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+?)\s*$/);
    if (headingMatch) {
      const content = currentLines.join('\n').trim();
      if (content || currentHeading) {
        rawBlocks.push({ heading: currentHeading, content });
      }
      currentHeading = headingMatch[2].replace(/[#*_`~]/g, '').trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }
  const trailing = currentLines.join('\n').trim();
  if (trailing || currentHeading) {
    rawBlocks.push({ heading: currentHeading, content: trailing });
  }

  // Split any single oversized block on paragraph / line boundaries so no chunk is truncated
  const boundedBlocks: MarkdownSection[] = [];
  for (const block of rawBlocks) {
    if (block.content.length <= maxChars) {
      boundedBlocks.push(block);
      continue;
    }
    const paragraphs = block.content.split(/\n{2,}/);
    let acc = '';
    let partIdx = 1;
    for (const para of paragraphs) {
      if (para.length > maxChars) {
        if (acc.trim()) {
          boundedBlocks.push({
            heading: partIdx === 1 ? block.heading : `${block.heading || 'Section'} (Part ${partIdx})`,
            content: acc.trim()
          });
          partIdx++;
          acc = '';
        }
        // Split huge single paragraph/table on single newlines
        const subLines = para.split('\n');
        let lineAcc = '';
        for (const sl of subLines) {
          if (lineAcc && lineAcc.length + sl.length + 1 > maxChars) {
            boundedBlocks.push({
              heading: partIdx === 1 ? block.heading : `${block.heading || 'Section'} (Part ${partIdx})`,
              content: lineAcc.trim()
            });
            partIdx++;
            lineAcc = sl;
          } else {
            lineAcc = lineAcc ? `${lineAcc}\n${sl}` : sl;
          }
        }
        if (lineAcc.trim()) {
          acc = lineAcc;
        }
      } else if (acc && acc.length + para.length + 2 > targetChars) {
        boundedBlocks.push({
          heading: partIdx === 1 ? block.heading : `${block.heading || 'Section'} (Part ${partIdx})`,
          content: acc.trim()
        });
        partIdx++;
        acc = para;
      } else {
        acc = acc ? `${acc}\n\n${para}` : para;
      }
    }
    if (acc.trim()) {
      boundedBlocks.push({
        heading: partIdx === 1 ? block.heading : `${block.heading || 'Section'} (Part ${partIdx})`,
        content: acc.trim()
      });
    }
  }

  // Merge small adjacent blocks up to targetChars
  const merged: MarkdownSection[] = [];
  for (const block of boundedBlocks) {
    if (!block.content.trim()) continue;
    const prev = merged[merged.length - 1];
    if (prev && prev.content.length + block.content.length + 2 <= targetChars) {
      prev.content = `${prev.content}\n\n${block.content}`;
      if (!prev.heading && block.heading) {
        prev.heading = block.heading;
      }
    } else {
      merged.push({ heading: block.heading, content: block.content });
    }
  }

  return merged;
}

/**
 * Builds dynamic compendium chunks from seed array.
 * Deconstructs 202 master articles into complete, zero-truncation multi-section chunks
 * across full Markdown sections, mechanics, tactical guides, and architect notes.
 */
function buildCompendiumChunks(seedList: any[] = []): RuleChunk[] {
  if (!Array.isArray(seedList)) return [];

  const chunks: RuleChunk[] = [];

  for (const item of seedList) {
    let cat: RuleChunk['category'] = 'lore';
    const p = (item.parent || '').toLowerCase();
    const t = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';

    if (p.includes('combat') || t.includes('combat')) cat = 'combat';
    else if (p.includes('metaphysics') || t.includes('metaphysics')) cat = 'metaphysics';
    else if (p.includes('economatrix') || t.includes('economatrix')) cat = 'economatrix';
    else if (p.includes('faction') || t.includes('faction')) cat = 'factions';
    else if (p.includes('species') || t.includes('species')) cat = 'species';
    else if (p.includes('origin') || p.includes('occupation') || p.includes('skill') || p.includes('character')) cat = 'character_creation';
    else if (p.includes('world') || p.includes('bestiary')) cat = 'planetary';

    const rawDesc = String(item.description || '').trim();
    const cleanMech = (item.mechanic || '').replace(/[#*_`~\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanGuide = (item.guide || '').replace(/[#*_`~\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanNote = (item.note || '').replace(/[#*_`~\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
    const baseId = `compendium-${item.id || item.name}`;
    const baseTags = [...(Array.isArray(item.tags) ? item.tags : []), item.name, item.parent || '', cat].filter(Boolean);
    const itemSourceLower = String(item.sourcePath || item.path || '').toLowerCase();
    const isArchitectSource =
      String(item.perspective || '').toLowerCase() === 'architect' ||
      itemSourceLower.startsWith('architect/') ||
      itemSourceLower.includes('/architect/') ||
      p.includes('gm guidelines') ||
      p.includes('architect guide');
    const articleVisibility: 'public' | 'architect' = isArchitectSource ? 'architect' : 'public';

    let levelMeta = '';
    if (item.tl !== undefined && item.tl !== null) levelMeta += `Tech Level: TL ${item.tl} | `;
    if (item.ml !== undefined && item.ml !== null) levelMeta += `Meta Level: ML ${item.ml}`;

    // 1. Complete Multi-Section Article Chunks (Zero Truncation)
    const sections = splitMarkdownIntoSections(rawDesc, 2000, 2800);
    if (sections.length === 0) {
      chunks.push({
        id: baseId,
        category: cat,
        visibility: articleVisibility,
        title: item.name || 'Untitled Article',
        citation: item.parent || 'Omnicortex Compendium',
        text: `${item.name || 'Untitled Article'}\n${levelMeta}`.trim(),
        tags: baseTags
      });
    } else {
      sections.forEach((sec, idx) => {
        const cleanSecText = sec.content.replace(/\s+\n/g, '\n').trim();
        const secTitle = idx === 0
          ? (item.name || 'Untitled Article')
          : `${item.name || 'Untitled Article'} — ${sec.heading || `Section ${idx + 1}`}`;
        const secCitation = sec.heading && sec.heading.toLowerCase() !== String(item.name || '').toLowerCase()
          ? `${item.parent || 'Omnicortex Compendium'} > ${sec.heading}`
          : (item.parent || 'Omnicortex Compendium');
        const headerPrefix = idx === 0 && levelMeta ? `${item.name}\n${levelMeta}\n` : `${secTitle}\n`;

        chunks.push({
          id: idx === 0 ? baseId : `${baseId}-sec-${idx}`,
          category: cat,
          visibility: articleVisibility,
          title: secTitle,
          citation: secCitation,
          text: `${headerPrefix}${cleanSecText}`.trim(),
          tags: sec.heading ? [...baseTags, sec.heading] : baseTags
        });
      });
    }

    // 2. Specialized Mechanics Chunk
    if (cleanMech) {
      chunks.push({
        id: `compendium-${item.id || item.name}-mech`,
        category: cat === 'lore' ? 'combat' : cat,
        title: `${item.name} [Rules Mechanics]`,
        citation: `${item.parent || 'Omnicortex'} > Mechanics`,
        text: `Canonical Mechanics for ${item.name}:\n${cleanMech}`,
        tags: [...(Array.isArray(item.tags) ? item.tags : []), item.name, 'mechanics', 'formula', cat].filter(Boolean)
      });
    }

    // 3. Tactical Player/Operator Guide Chunk
    if (cleanGuide) {
      chunks.push({
        id: `compendium-${item.id || item.name}-guide`,
        category: cat,
        title: `${item.name} [Tactical Guide]`,
        citation: `${item.parent || 'Omnicortex'} > Tactical Guide`,
        text: `Operational Tactical Guide for ${item.name}:\n${cleanGuide}`,
        tags: [...(Array.isArray(item.tags) ? item.tags : []), item.name, 'guide', 'tactics', cat].filter(Boolean)
      });
    }

    // 4. Architect Confidential Notes & Guidance Chunk
    const recSpecies = Array.isArray(item.recommended_species) && item.recommended_species.length > 0 ? item.recommended_species.join(', ') : '';
    const recFactions = Array.isArray(item.recommended_factions) && item.recommended_factions.length > 0 ? item.recommended_factions.join(', ') : '';
    const recOrigins = Array.isArray(item.recommended_origins) && item.recommended_origins.length > 0 ? item.recommended_origins.join(', ') : '';
    const recOccupations = Array.isArray(item.recommended_occupations) && item.recommended_occupations.length > 0 ? item.recommended_occupations.join(', ') : '';
    const recSkills = Array.isArray(item.recommended_skills) && item.recommended_skills.length > 0 ? item.recommended_skills.join(', ') : '';
    const recFeatures = Array.isArray(item.recommended_features) && item.recommended_features.length > 0 ? item.recommended_features.join(', ') : '';
    const recTl = Array.isArray(item.recommended_tl) && item.recommended_tl.length > 0 ? item.recommended_tl.join(', ') : '';
    const recMl = Array.isArray(item.recommended_ml) && item.recommended_ml.length > 0 ? item.recommended_ml.join(', ') : '';
    const guidanceKeywords = item.keywords ? String(item.keywords).trim() : '';
    const negativeKeywords = item.negative_keywords ? String(item.negative_keywords).trim() : '';

    if (cleanNote || recSpecies || recFactions || recOrigins || recOccupations || recSkills || recFeatures || recTl || recMl || guidanceKeywords || negativeKeywords) {
      let architectText = `Architect Worldbuilding & Adjudication Notes for ${item.name}:\n`;
      if (cleanNote) architectText += `${cleanNote}\n`;
      if (recSpecies) architectText += `Recommended Species: ${recSpecies}\n`;
      if (recFactions) architectText += `Recommended Factions: ${recFactions}\n`;
      if (recOrigins) architectText += `Recommended Origins: ${recOrigins}\n`;
      if (recOccupations) architectText += `Recommended Occupations: ${recOccupations}\n`;
      if (recSkills) architectText += `Recommended Skills: ${recSkills}\n`;
      if (recFeatures) architectText += `Recommended Features: ${recFeatures}\n`;
      if (recTl) architectText += `Recommended Tech Level (TL): ${recTl}\n`;
      if (recMl) architectText += `Recommended Meta Level (ML): ${recMl}\n`;
      if (guidanceKeywords) architectText += `Directives & Keywords: ${guidanceKeywords}\n`;
      if (negativeKeywords) architectText += `Negative Directives & Railguards (NOT recommended): ${negativeKeywords}\n`;

      const extraTags: string[] = [];
      if (Array.isArray(item.recommended_species)) extraTags.push(...item.recommended_species);
      if (Array.isArray(item.recommended_factions)) extraTags.push(...item.recommended_factions);
      if (Array.isArray(item.recommended_origins)) extraTags.push(...item.recommended_origins);
      if (Array.isArray(item.recommended_occupations)) extraTags.push(...item.recommended_occupations);
      if (Array.isArray(item.recommended_skills)) extraTags.push(...item.recommended_skills);
      if (Array.isArray(item.recommended_features)) extraTags.push(...item.recommended_features);
      if (Array.isArray(item.recommended_tl)) extraTags.push(...item.recommended_tl);
      if (Array.isArray(item.recommended_ml)) extraTags.push(...item.recommended_ml);
      if (guidanceKeywords) {
        extraTags.push(...guidanceKeywords.split(/[,;\s]+/).filter(Boolean));
      }
      if (negativeKeywords) {
        const negTokens = negativeKeywords.split(/[,;\s]+/).filter(Boolean);
        extraTags.push(...negTokens.map(t => `railguard-${t}`), ...negTokens, 'railguard', 'negative-keywords');
      }

      chunks.push({
        id: `compendium-${item.id || item.name}-note`,
        category: cat,
        visibility: 'architect',
        title: `${item.name} [Architect Notes & Railguards]`,
        citation: `${item.parent || 'Omnicortex'} > Architect Notes`,
        text: architectText.trim(),
        tags: [...(Array.isArray(item.tags) ? item.tags : []), item.name, 'architect', 'notes', cat, ...extraTags].filter(Boolean)
      });
    }
  }

  return chunks;
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

interface EntityDatasetGroup {
  prefix: string;
  category: RuleChunk['category'];
  citationPrefix: string;
  items: any[];
}

/**
 * Builds complete, zero-truncation RAG chunks across all structured Omnicortex entity catalogs,
 * indexing full Markdown body/lore, mechanics, directives (+KW), and railguards (-KW).
 */
export function buildOmnicortexEntityChunks(groups: EntityDatasetGroup[] = []): RuleChunk[] {
  const chunks: RuleChunk[] = [];
  const seenIds = new Set<string>();

  for (const group of groups) {
    if (!Array.isArray(group.items)) continue;
    for (const item of group.items) {
      if (!item || typeof item !== 'object') continue;
      const rawName = String(item.name || item.title || item.id || '').trim();
      if (!rawName) continue;
      const rawId = String(item.id || rawName).toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
      const baseChunkId = `entity-${group.prefix}-${rawId}`;
      if (seenIds.has(baseChunkId)) continue;
      seenIds.add(baseChunkId);

      const desc = String(item.description || item.desc || '').trim();
      const mech = String(item.mechanic || item.mechanics || '').trim();
      const rawBody = String(item.body || item.full_text || '').trim();
      const kw = item.keywords
        ? (Array.isArray(item.keywords) ? item.keywords.join(', ') : String(item.keywords).trim())
        : '';
      const negKw = item.negative_keywords
        ? (Array.isArray(item.negative_keywords) ? item.negative_keywords.join(', ') : String(item.negative_keywords).trim())
        : '';

      const extraTags: string[] = [rawName, group.prefix, group.category];
      if (item.category) extraTags.push(String(item.category));
      if (item.type && typeof item.type === 'string') extraTags.push(item.type);
      if (item.sphere) extraTags.push(String(item.sphere));
      if (item.discipline) extraTags.push(String(item.discipline));
      if (kw) {
        extraTags.push(...kw.split(/[,;\s]+/).filter(Boolean), 'directive');
      }
      if (negKw) {
        const negTokens = negKw.split(/[,;\s]+/).filter(Boolean);
        extraTags.push(...negTokens.map((t: string) => `railguard-${t}`), ...negTokens, 'railguard', 'negative-keywords');
      }
      const cleanTags = Array.from(new Set(extraTags.filter(Boolean)));

      let metaHeader = `${rawName} [${group.citationPrefix}]`;
      if (item.tech_level !== undefined || item.tl !== undefined) {
        metaHeader += ` | TL ${item.tech_level ?? item.tl}`;
      }
      if (item.meta_level !== undefined || item.ml !== undefined) {
        metaHeader += ` | ML ${item.meta_level ?? item.ml}`;
      }
      if (desc) metaHeader += `\nSummary: ${desc}`;
      if (mech && !rawBody.includes(mech)) metaHeader += `\nMechanics: ${mech}`;
      if (kw) metaHeader += `\nDirectives: ${kw}`;
      if (negKw) metaHeader += `\nRailguards (Avoid): ${negKw}`;

      if (!rawBody || rawBody === desc) {
        chunks.push({
          id: baseChunkId,
          category: group.category,
          title: `${rawName} (${group.citationPrefix})`,
          citation: `Omnicortex ${group.citationPrefix}`,
          text: metaHeader.trim(),
          tags: cleanTags
        });
        continue;
      }

      const bodySections = splitMarkdownIntoSections(rawBody, 2000, 2800);
      if (bodySections.length <= 1) {
        chunks.push({
          id: baseChunkId,
          category: group.category,
          title: `${rawName} (${group.citationPrefix})`,
          citation: `Omnicortex ${group.citationPrefix}`,
          text: `${metaHeader}\n\n${rawBody}`.trim(),
          tags: cleanTags
        });
      } else {
        bodySections.forEach((sec, idx) => {
          const secTitle = idx === 0
            ? `${rawName} (${group.citationPrefix})`
            : `${rawName} (${group.citationPrefix}) — ${sec.heading || `Part ${idx + 1}`}`;
          const secHeader = idx === 0 ? `${metaHeader}\n\n` : `${secTitle}\n`;
          chunks.push({
            id: idx === 0 ? baseChunkId : `${baseChunkId}-sec-${idx}`,
            category: group.category,
            title: secTitle,
            citation: sec.heading ? `Omnicortex ${group.citationPrefix} > ${sec.heading}` : `Omnicortex ${group.citationPrefix}`,
            text: `${secHeader}${sec.content}`.trim(),
            tags: sec.heading ? [...cleanTags, sec.heading] : cleanTags
          });
        });
      }
    }
  }

  return chunks;
}

// Combine Foundational Rules, Mechanics Dataset, Catalog Chunks, and Specialized Rules
export const CANONICAL_RULES_COMPENDIUM: RuleChunk[] = [
  ...buildMechanicsChunks(),
  ...buildCatalogChunks(),
  ...CANONICAL_FOUNDATIONAL_CHUNKS,
  ...buildSpecializedRuleChunks()
];

// Build Global Vocabulary across all chunks with O(1) term-to-index map and cached vector norms
const MAX_VOCABULARY_DIM = 6000;
let VOCABULARY: string[] = [];
let VOCABULARY_INDEX: Map<string, number> = new Map();
const CHUNK_NORMS = new WeakMap<RuleChunk, number>();
const CHUNK_LOWER_CACHE = new WeakMap<RuleChunk, string>();

/**
 * Computes a fast normalized pseudo-embedding term frequency vector for text similarity
 */
function computeTermVector(text: string, vocabulary: string[]): { vector: number[]; norm: number } {
  const words = text.toLowerCase().replace(/[^a-z0-9_\-\s]/g, ' ').split(/\s+/).filter(Boolean);
  const vector = new Array(vocabulary.length).fill(0);
  if (words.length === 0) return { vector, norm: 0 };

  const wordFreq = new Map<string, number>();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  }

  let normSq = 0;
  const invLen = 1 / words.length;

  if (vocabulary === VOCABULARY && VOCABULARY_INDEX.size === vocabulary.length) {
    for (const [term, count] of wordFreq) {
      const idx = VOCABULARY_INDEX.get(term);
      if (idx !== undefined) {
        const val = count * invLen;
        vector[idx] = val;
        normSq += val * val;
      }
    }
  } else {
    for (let i = 0; i < vocabulary.length; i++) {
      const count = wordFreq.get(vocabulary[i]);
      if (count) {
        const val = count * invLen;
        vector[i] = val;
        normSq += val * val;
      }
    }
  }

  return { vector, norm: Math.sqrt(normSq) };
}

/**
 * Fast sparse-query Cosine Similarity using non-zero query indices
 */
function cosineSimilaritySparse(
  nonZeroIdx: number[],
  nonZeroVal: number[],
  queryNorm: number,
  chunkVec: number[],
  chunkNorm: number
): number {
  if (queryNorm === 0 || chunkNorm === 0 || nonZeroIdx.length === 0) return 0;
  let dotProduct = 0;
  const vecLen = chunkVec.length;
  for (let i = 0; i < nonZeroIdx.length; i++) {
    const idx = nonZeroIdx[i];
    if (idx < vecLen) {
      dotProduct += nonZeroVal[i] * chunkVec[idx];
    }
  }
  if (dotProduct === 0) return 0;
  return dotProduct / (queryNorm * chunkNorm);
}

function recomputeEmbeddings() {
  const existingSet = new Set<string>(VOCABULARY);
  const candidateCounts = new Map<string, number>();

  for (const chunk of CANONICAL_RULES_COMPENDIUM) {
    if (chunk.embedding && VOCABULARY.length > 0) continue;
    const sampleText = `${chunk.title} ${chunk.tags.join(' ')} ${chunk.text}`.toLowerCase();
    const tokens = sampleText.replace(/[^a-z0-9_\-\s]/g, ' ').split(/\s+/);
    for (let i = 0; i < tokens.length; i++) {
      const w = tokens[i];
      if (w.length > 2 && !STOPWORDS.has(w) && !existingSet.has(w) && !/^\d{3,}$/.test(w)) {
        candidateCounts.set(w, (candidateCounts.get(w) || 0) + 1);
      }
    }
  }

  if (VOCABULARY.length === 0) {
    // Initial foundational build: include all foundational/mechanics vocabulary
    for (const term of candidateCounts.keys()) {
      VOCABULARY.push(term);
    }
  } else if (candidateCounts.size > 0 && VOCABULARY.length < MAX_VOCABULARY_DIM) {
    // Prefix-aligned expansion: keep existing indices intact and append highest-frequency terms
    const remainingBudget = MAX_VOCABULARY_DIM - VOCABULARY.length;
    const sortedCandidates = Array.from(candidateCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, remainingBudget);
    for (const [term] of sortedCandidates) {
      VOCABULARY.push(term);
    }
  }

  VOCABULARY_INDEX = new Map(VOCABULARY.map((term, idx) => [term, idx]));

  for (const chunk of CANONICAL_RULES_COMPENDIUM) {
    if (!CHUNK_LOWER_CACHE.has(chunk)) {
      CHUNK_LOWER_CACHE.set(chunk, `${chunk.title} ${chunk.tags.join(' ')} ${chunk.text}`.toLowerCase());
    }
    if (!chunk.embedding) {
      const fullText = CHUNK_LOWER_CACHE.get(chunk)!;
      const { vector, norm } = computeTermVector(fullText, VOCABULARY);
      chunk.embedding = vector;
      CHUNK_NORMS.set(chunk, norm);
    } else if (chunk.embedding.length < VOCABULARY.length) {
      // Pad existing prefix-aligned embedding vector to match expanded VOCABULARY dimension
      const prevLen = chunk.embedding.length;
      chunk.embedding.length = VOCABULARY.length;
      chunk.embedding.fill(0, prevLen);
      if (!CHUNK_NORMS.has(chunk)) {
        let sq = 0;
        for (let i = 0; i < prevLen; i++) sq += chunk.embedding[i] * chunk.embedding[i];
        CHUNK_NORMS.set(chunk, Math.sqrt(sq));
      }
    } else if (chunk.embedding.length !== VOCABULARY.length) {
      const fullText = CHUNK_LOWER_CACHE.get(chunk)!;
      const { vector, norm } = computeTermVector(fullText, VOCABULARY);
      chunk.embedding = vector;
      CHUNK_NORMS.set(chunk, norm);
    }
  }
}

// Pre-embed initial canonical rules
recomputeEmbeddings();

// Dynamic Compendium & Omnicortex Entity Seed Loader (fine-grained async code-splitting)
let compendiumSeedPromise: Promise<void> | null = null;
let isCompendiumSeedLoaded = false;

export async function loadCompendiumSeedDataset(): Promise<void> {
  if (isCompendiumSeedLoaded) return;
  if (!compendiumSeedPromise) {
    const loadSeedModule = () => {
      if (!(import.meta as any).env) {
        const jsonSpecifier = '../data/compendiumSeed.json';
        return import(/* @vite-ignore */ jsonSpecifier, { with: { type: 'json' } });
      }
      return import('../data/compendiumSeed.json');
    };
    compendiumSeedPromise = Promise.all([
      loadSeedModule(),
      import('../data/speciesData.js'),
      import('../data/factionsData.js'),
      import('../data/originsData.js'),
      import('../data/occupationsData.js'),
      import('../data/archetypesData.js'),
      import('../data/skillsData.js'),
      import('../data/featuresData.js'),
      import('../data/speciesTraitsData.js'),
      import('../data/speciesDisadvantagesData.js'),
      import('../data/weaponryData.js'),
      import('../data/armoringData.js'),
      import('../data/gearData.js'),
      import('../data/augmentationsData.js'),
      import('../data/invocationsData.js'),
      import('../data/mechaData.js'),
      import('../data/architectureData.js'),
      import('../data/otherPropertyData.js'),
      import('../data/synthesisData.js')
    ])
      .then(async ([
        compMod,
        speciesMod,
        factionsMod,
        originsMod,
        occupationsMod,
        archetypesMod,
        skillsMod,
        featuresMod,
        traitsMod,
        disadvMod,
        weaponryMod,
        armoringMod,
        gearMod,
        augMod,
        invocMod,
        mechaMod,
        archMod,
        otherPropMod,
        synthMod
      ]) => {
        const seedData = ((compMod as any).default || compMod) as any[];
        const compendiumChunks = buildCompendiumChunks(seedData);
        const entityChunks = buildOmnicortexEntityChunks([
          { prefix: 'species', category: 'species', citationPrefix: 'Species', items: (speciesMod as any).DEFAULT_SPECIES || [] },
          { prefix: 'factions', category: 'factions', citationPrefix: 'Faction', items: (factionsMod as any).DEFAULT_FACTIONS || [] },
          { prefix: 'origins', category: 'character_creation', citationPrefix: 'Origin', items: (originsMod as any).DEFAULT_ORIGINS || [] },
          { prefix: 'occupations', category: 'character_creation', citationPrefix: 'Occupation', items: (occupationsMod as any).DEFAULT_OCCUPATIONS || [] },
          { prefix: 'archetypes', category: 'character_creation', citationPrefix: 'Archetype', items: (archetypesMod as any).DEFAULT_ARCHETYPES || [] },
          { prefix: 'skills', category: 'character_creation', citationPrefix: 'Skill', items: (skillsMod as any).ALL_CANONICAL_SKILLS || [] },
          { prefix: 'features', category: 'character_creation', citationPrefix: 'Feature', items: (featuresMod as any).DEFAULT_FEATURES || [] },
          { prefix: 'traits', category: 'species', citationPrefix: 'Trait', items: (traitsMod as any).ALL_CANONICAL_TRAITS || [] },
          { prefix: 'disadvantages', category: 'species', citationPrefix: 'Disadvantage', items: (disadvMod as any).DEFAULT_SPECIES_DISADVANTAGES || [] },
          { prefix: 'weaponry', category: 'combat', citationPrefix: 'Weaponry', items: (weaponryMod as any).DEFAULT_WEAPONRY || [] },
          { prefix: 'armoring', category: 'combat', citationPrefix: 'Armoring', items: (armoringMod as any).DEFAULT_ARMORING || [] },
          { prefix: 'gear', category: 'technology', citationPrefix: 'Gear', items: (gearMod as any).DEFAULT_GEAR || [] },
          { prefix: 'augmentations', category: 'technology', citationPrefix: 'Augmentation', items: (augMod as any).DEFAULT_AUGMENTATIONS || [] },
          { prefix: 'invocations', category: 'metaphysics', citationPrefix: 'Invocation', items: (invocMod as any).DEFAULT_INVOCATIONS || [] },
          { prefix: 'mecha', category: 'technology', citationPrefix: 'Mecha', items: (mechaMod as any).DEFAULT_MECHA || [] },
          { prefix: 'architecture', category: 'economatrix', citationPrefix: 'Architecture', items: (archMod as any).DEFAULT_ARCHITECTURE || [] },
          { prefix: 'other_property', category: 'economatrix', citationPrefix: 'Property', items: (otherPropMod as any).DEFAULT_OTHER_PROPERTY || [] },
          { prefix: 'synthesis', category: 'economatrix', citationPrefix: 'Synthesis', items: (synthMod as any).DEFAULT_SYNTHESIS || [] }
        ]);

        const allNewChunks = [...compendiumChunks, ...entityChunks];
        const existingChunkIds = new Set(CANONICAL_RULES_COMPENDIUM.map(c => c.id));
        const dedupedNewChunks: RuleChunk[] = [];
        for (const chunk of allNewChunks) {
          if (!existingChunkIds.has(chunk.id)) {
            existingChunkIds.add(chunk.id);
            CANONICAL_RULES_COMPENDIUM.push(chunk);
            dedupedNewChunks.push(chunk);
          }
        }
        recomputeEmbeddings();

        // Offload insertion and SQLite WASM FTS5 indexing of complete Compendium + Entity vault to the Web Worker
        const workerChunks = dedupedNewChunks.map(c => ({
          id: c.id,
          title: c.title,
          category: c.category,
          content: `${c.citation}\n${c.text}`
        }));

        try {
          const workerManager = getOpfsWorkerManager();
          await workerManager.indexCompendiumChunks(workerChunks);
        } catch (workerErr) {
          console.warn('[OmnicortexVectorRAG] Worker compendium indexing fallback:', workerErr);
        }

        isCompendiumSeedLoaded = true;
      })
      .catch((err) => {
        console.warn('[OmnicortexVectorRAG] Dynamic compendium seed load error:', err);
        compendiumSeedPromise = null;
      });
  }
  return compendiumSeedPromise;
}

export interface RagSearchResult {
  chunk: RuleChunk;
  score: number;
}

/**
 * Detects domain intent keywords to intelligently boost related categories
 */
export function detectIntentCategories(query: string): string[] {
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
  if (q.match(/\b(cost|price|craft|economatrix|credit|market|buy|sell|tech level|eut|euft|tsc|cr)\b/)) {
    categories.push('economatrix');
  }
  if (q.match(/\b(udu|socket|sockets|node|nodes|mount|mounts|module|modules|garaging)\b/)) {
    categories.push('udu');
  }
  if (q.match(/\b(species|alien|synthetic|lineage|heritage|trait|stigma)\b/)) {
    categories.push('species');
  }
  if (q.match(/\b(attribute|sub-attribute|strength|agility|stamina|intellect|wisdom|charisma|toughness|reflexes|fortitude|150 cp|cp|150 bp|bp|creation)\b/)) {
    categories.push('character_creation');
  }
  if (q.match(/\b(directive|directives|positive keyword|positive keywords|pos keyword|pos keywords|thematic weight|thematic weights|guidance)\b/)) {
    categories.push('directives');
  }
  if (q.match(/\b(railguard|railguards|negative keyword|negative keywords|neg keyword|neg keywords|boundary|boundaries|exclusion|contraindication|incompatible)\b/)) {
    categories.push('railguards');
  }

  return categories;
}

/**
 * Queries the Omnicortex Vector RAG index for the top most relevant rule and lore chunks
 */
export interface RagSearchOptions {
  topK?: number;
  categoryFilter?: string;
  role?: 'operator' | 'architect' | string;
  positiveKeywords?: string[] | string;
  negativeKeywords?: string[] | string;
  directiveKeywords?: string[] | string;
  railguardKeywords?: string[] | string;
  directiveCategories?: string[] | string;
  railguardCategories?: string[] | string;
}

/**
 * Determine whether a RAG chunk is restricted to Architects (Game Masters) only.
 */
export function isArchitectRestrictedChunk(chunk: RuleChunk): boolean {
  if (!chunk) return false;
  if (chunk.visibility === 'architect') return true;
  if (chunk.id && chunk.id.endsWith('-note')) return true;
  if (chunk.title && chunk.title.includes('[Architect Notes & Railguards]')) return true;
  const citLower = String(chunk.citation || '').toLowerCase();
  if (citLower.includes('> architect notes') || citLower.startsWith('architect/')) return true;
  return false;
}

/**
 * Queries the Omnicortex Vector RAG index for the top most relevant rule and lore chunks.
 * Evaluates semantic vector similarity, adds weight for positive guidance keywords,
 * reduces weight for negative keywords and railguards, and enforces epistemic role filtering.
 */
export function queryOmnicortexRAG(
  query: string, 
  topKOrOptions: number | RagSearchOptions = 4, 
  categoryFilter?: string | RagSearchOptions
): RagSearchResult[] {
  if (!query || !query.trim()) {
    return [];
  }

  let topK = 4;
  let activeCatFilter = typeof categoryFilter === 'string' ? categoryFilter : undefined;
  let activeRole: string | undefined = undefined;
  let posKeywords: string[] = [];
  let negKeywords: string[] = [];

  const mergedOptions: RagSearchOptions | null =
    typeof topKOrOptions === 'object' && topKOrOptions !== null
      ? topKOrOptions
      : typeof categoryFilter === 'object' && categoryFilter !== null
        ? categoryFilter
        : null;

  if (typeof topKOrOptions === 'number') {
    topK = topKOrOptions;
  }

  if (mergedOptions) {
    if (mergedOptions.topK !== undefined) {
      topK = mergedOptions.topK;
    }
    activeCatFilter = mergedOptions.categoryFilter || activeCatFilter;
    activeRole = mergedOptions.role ? String(mergedOptions.role).trim().toLowerCase() : undefined;
    const rawPos = mergedOptions.positiveKeywords || mergedOptions.directiveKeywords;
    if (rawPos) {
      posKeywords = (Array.isArray(rawPos) 
        ? rawPos 
        : String(rawPos).split(/[,;\n]+/)
      ).map(k => k.trim().toLowerCase()).filter(Boolean);
    }
    const rawNeg = mergedOptions.negativeKeywords || mergedOptions.railguardKeywords;
    if (rawNeg) {
      negKeywords = (Array.isArray(rawNeg) 
        ? rawNeg 
        : String(rawNeg).split(/[,;\n]+/)
      ).map(k => k.trim().toLowerCase()).filter(Boolean);
    }
  }

  // Trigger lazy loading of compendium seed in background if not yet loaded
  if (!isCompendiumSeedLoaded && !compendiumSeedPromise) {
    loadCompendiumSeedDataset().catch(() => {});
  }

  const { vector: queryVector, norm: queryNorm } = computeTermVector(query, VOCABULARY);
  const nonZeroIdx: number[] = [];
  const nonZeroVal: number[] = [];
  for (let i = 0; i < queryVector.length; i++) {
    if (queryVector[i] !== 0) {
      nonZeroIdx.push(i);
      nonZeroVal.push(queryVector[i]);
    }
  }

  const detectedCategories = detectIntentCategories(query);
  const lowerQuery = query.toLowerCase();
  const queryContentTokens = Array.from(new Set(
    lowerQuery
      .replace(/[^a-z0-9_\-\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOPWORDS.has(w))
  ));
  const isQuerySpecificallyAboutRailguards = lowerQuery.includes('railguard') || lowerQuery.includes('avoid') || lowerQuery.includes('not recommended');
  const results: RagSearchResult[] = [];

  const restrictOperator = activeRole === 'operator' || activeRole === 'operative' || activeRole === 'player';

  for (const chunk of CANONICAL_RULES_COMPENDIUM) {
    if (!chunk.embedding) continue;
    if (restrictOperator && isArchitectRestrictedChunk(chunk)) continue;

    let chunkContentLower = CHUNK_LOWER_CACHE.get(chunk);
    if (!chunkContentLower) {
      chunkContentLower = `${chunk.title} ${chunk.tags.join(' ')} ${chunk.text}`.toLowerCase();
      CHUNK_LOWER_CACHE.set(chunk, chunkContentLower);
    }

    // Category filtering with explicit directive and railguard category handling
    if (activeCatFilter) {
      if (activeCatFilter === 'directives' || activeCatFilter === 'positive_keywords') {
        const isDirectiveChunk = chunk.category === 'directives' || 
          chunk.tags.some(t => t.toLowerCase().includes('directive') || t.toLowerCase().includes('keyword')) ||
          chunkContentLower.includes('directive') ||
          posKeywords.some(p => chunkContentLower!.includes(p));
        if (!isDirectiveChunk) continue;
      } else if (activeCatFilter === 'railguards' || activeCatFilter === 'negative_keywords') {
        const isRailguardChunk = chunk.category === 'railguards' || 
          chunk.tags.some(t => t.toLowerCase().startsWith('railguard-') || t.toLowerCase() === 'negative-keywords' || t.toLowerCase().includes('railguard')) ||
          chunkContentLower.includes('railguard') ||
          negKeywords.some(n => chunkContentLower!.includes(n));
        if (!isRailguardChunk) continue;
      } else if (chunk.category !== activeCatFilter) {
        continue;
      }
    }

    // Base vector cosine similarity (sparse O(k) dot product)
    let chunkNorm = CHUNK_NORMS.get(chunk);
    if (chunkNorm === undefined) {
      let sq = 0;
      for (let i = 0; i < chunk.embedding.length; i++) sq += chunk.embedding[i] * chunk.embedding[i];
      chunkNorm = Math.sqrt(sq);
      CHUNK_NORMS.set(chunk, chunkNorm);
    }
    let score = cosineSimilaritySparse(nonZeroIdx, nonZeroVal, queryNorm, chunk.embedding, chunkNorm);

    // Direct lexical token coverage across complete unredacted chunk prose (zero loss for rare/hapax lore words)
    for (let i = 0; i < queryContentTokens.length; i++) {
      const qt = queryContentTokens[i];
      if (chunkContentLower.includes(qt)) {
        score += qt.length >= 5 ? 0.12 : 0.07;
      }
    }

    // Positive Keywords: ADD WEIGHT
    for (const tag of chunk.tags) {
      const tagLower = tag.toLowerCase();
      if (lowerQuery.includes(tagLower)) {
        if (tagLower.startsWith('railguard-') || tagLower === 'negative-keywords') {
          // Railguard tag matches query
          if (!isQuerySpecificallyAboutRailguards) {
            score -= 0.30; // Reduce weight for railguard aspects in general queries
          }
        } else {
          score += 0.22;
        }
      }
    }

    // Explicit Positive Context Directives: ADD WEIGHT (+0.25)
    for (const pKw of posKeywords) {
      if (chunkContentLower.includes(pKw)) {
        score += 0.25;
      }
    }

    // Explicit Negative Context Railguards: REDUCE WEIGHT (-0.50)
    for (const nKw of negKeywords) {
      if (chunkContentLower.includes(nKw)) {
        score -= 0.50;
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

    // Direct boost for canonical BASTION mechanics & foundational rules
    if (chunk.id.startsWith('mech-')) {
      score += 0.25;
      if (chunk.formula && (lowerQuery.includes('how') || lowerQuery.includes('rule') || lowerQuery.includes('calculate') || lowerQuery.includes('damage') || lowerQuery.includes('formula'))) {
        score += 0.20;
      }
    } else if (chunk.id.startsWith('rule-')) {
      score += 0.22;
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
export function formatRagContextForBastion(
  ragResults: RagSearchResult[],
  role?: 'operator' | 'architect' | string
): string {
  const restrictOperator =
    role && ['operator', 'operative', 'player'].includes(String(role).trim().toLowerCase());
  const visibleResults = restrictOperator
    ? ragResults.filter(({ chunk }) => !isArchitectRestrictedChunk(chunk))
    : ragResults;
  if (visibleResults.length === 0) return '';

  let context = 'CANONICAL OMNICORTEX RULES & BASTION MECHANICS CITATIONS:\n';
  for (const { chunk, score } of visibleResults) {
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

export interface StudioStepRagRequest {
  query: string;
  domainKey?: string;
  tags?: string[];
  dbData?: Record<string, any[]>;
  topK?: number;
}

/**
 * Retrieves step-scoped canonical rules citations + matching live Omnicortex entity summaries
 * for the Guided Asset Studio with zero network latency.
 */
export function queryStudioStepContext(req: StudioStepRagRequest): {
  ruleCitations: RagSearchResult[];
  entityCitations: Array<{ id: string; name: string; collection: string; summary: string; score: number }>;
} {
  const combinedQuery = [req.query || '', ...(req.tags || []), req.domainKey || '']
    .filter(Boolean)
    .join(' ')
    .trim();

  const ruleCitations = combinedQuery
    ? queryOmnicortexRAG(combinedQuery, { topK: req.topK || 3, positiveKeywords: req.tags || [] })
    : [];

  const entityCitations: Array<{ id: string; name: string; collection: string; summary: string; score: number }> = [];
  if (req.dbData && req.domainKey) {
    const candidates = req.dbData[req.domainKey] || [];
    const tokens = combinedQuery
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 4);

    if (Array.isArray(candidates) && candidates.length > 0) {
      for (const item of candidates.slice(0, 120)) {
        if (!item || typeof item !== 'object') continue;
        const name = String(item.name || item.title || item.id || '').trim();
        const desc = String(item.mechanic || item.description || '').trim();
        if (!name) continue;
        const hay = `${name} ${desc}`.toLowerCase();
        let s = 1;
        for (const t of tokens) {
          if (hay.includes(t)) s += 2;
        }
        entityCitations.push({
          id: String(item.id || name),
          name,
          collection: req.domainKey,
          summary: desc.slice(0, 180),
          score: s
        });
      }
      entityCitations.sort((a, b) => b.score - a.score);
    }
  }

  return {
    ruleCitations,
    entityCitations: entityCitations.slice(0, 4)
  };
}

export default {
  CANONICAL_RULES_COMPENDIUM,
  loadCompendiumSeedDataset,
  queryOmnicortexRAG,
  queryStudioStepContext,
  formatRagContextForBastion,
  formatRagContextForAIME
};
