import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const OP_DIR = path.join(projectRoot, 'docs', 'game rules', 'operator');
const ARCH_DIR = path.join(projectRoot, 'docs', 'game rules', 'architect');
const SEED_OUTPUT = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');
const MD_OUTPUT_DIR = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');

if (!fs.existsSync(MD_OUTPUT_DIR)) {
  fs.mkdirSync(MD_OUTPUT_DIR, { recursive: true });
}

function readDoc(dir, filename) {
  const p = path.join(dir, filename);
  if (!fs.existsSync(p)) {
    throw new Error(`Critical source document missing: ${p}`);
  }
  return fs.readFileSync(p, 'utf-8');
}

const articles = [];

function addArticle({
  id,
  name,
  category = 'compendium',
  parent = '0.00 SYSTEM & USER MANUALS',
  order = 1,
  perspective = 'both',
  entry_type = 'Core Rule',
  tl = 3,
  ml = 0,
  cost = 0,
  tags = [],
  description = '',
  mechanic = '',
  guide = '',
  note = ''
}) {
  const article = {
    id,
    name,
    category,
    parent,
    order,
    perspective,
    entry_type,
    tl,
    ml,
    cost,
    tags: Array.isArray(tags) && tags.length > 0 ? tags : [category, (entry_type || 'core-rule').toLowerCase().replace(/\s+/g, '-')],
    description: (description || '').trim(),
    mechanic: (mechanic || '').trim(),
    guide: (guide || '').trim(),
    note: (note || '').trim(),
    updatedAt: new Date().toISOString()
  };
  articles.push(article);

  // Write markdown artifact
  const mdFile = path.join(MD_OUTPUT_DIR, `${id}.md`);
  const mdContent = `---
id: "${id}"
name: "${name.replace(/"/g, '\\"')}"
category: "${category}"
parent: "${parent.replace(/"/g, '\\"')}"
order: ${order}
perspective: "${perspective}"
entry_type: "${entry_type}"
tl: ${tl}
ml: ${ml}
cost: ${cost}
tags: ${JSON.stringify(article.tags)}
---

${article.description}

${article.mechanic ? `\n\n## Canonical Mechanics\n${article.mechanic}` : ''}
${article.guide ? `\n\n## Tactical Guide\n${article.guide}` : ''}
${article.note ? `\n\n## Architect Notes\n${article.note}` : ''}
`;
  fs.writeFileSync(mdFile, mdContent, 'utf-8');
}

console.log('--- Ingesting Canonical Operator Documents ---');

// 1.00 INTRODUCTION
const introRaw = readDoc(OP_DIR, '1.00 INTRODUCTION.md');
addArticle({
  id: '0-00-introduction-and-glossary',
  name: '1.00 INTRODUCTION & CORE GLOSSARY',
  parent: '0.00 SYSTEM & USER MANUALS',
  order: 1,
  perspective: 'both',
  entry_type: 'System Overview',
  description: introRaw,
  mechanic: 'UDU Hierarchy: 1 Module = 10 Mounts = 100 Sockets = 1,000 Nodes.\nStandard 150 BP starting pool, 1-for-1 AP progression.\nEconomic Curve: Value = 10 * 4^(CR / 5).\nSurvival: Base 30 Vitality, Base 30 Health, Structure = Vitality + Health.',
  guide: 'Read this first to understand the core physics, capacity metrics, and mathematical philosophy of Tangent.',
  note: 'Source of Truth: docs/game rules/operator/1.00 INTRODUCTION.md'
});

// 1.01 CHARACTER CREATION
const charCreationRaw = readDoc(OP_DIR, '1.01 CHARACTER CREATION.md');
addArticle({
  id: '1-01-character-creation-master',
  name: '1.01 CHARACTER CREATION SYSTEM (COMPLETE MANUAL)',
  parent: '1.00 CHARACTER CREATION & PROFILES',
  order: 1,
  perspective: 'operator',
  entry_type: 'Core Rule',
  description: charCreationRaw,
  mechanic: 'Starting Build Points: 150 BP.\nAttributes: STR, AGI, STA, INT, WIS, CHA. Starting max +4 (paragon +5).\nAttribute Check Formula: Base = 2 + (Attribute * 2).\nPerception: INT + WIS (default Alertness; Attune for Meta; Insight for Social; Tech for Technical).\nVitality & Health: Base 30 each, +5 per 1 BP, max 60 each.\nKarma: Base 3, reset per session.',
  guide: 'Follow step-by-step pipeline: Concept -> Ability Scores -> Species -> Faction -> Origin -> Occupation -> Technology -> Hindrances -> Features -> Skills -> Augmentations -> Property -> Derived Stats.',
  note: 'Source of Truth: docs/game rules/operator/1.01 CHARACTER CREATION.md'
});

// Splitting 1.01 sub-articles for direct granular access
function extractSection(content, startHeading, endHeading) {
  const startIdx = content.indexOf(startHeading);
  if (startIdx === -1) return '';
  const endIdx = endHeading ? content.indexOf(endHeading, startIdx + startHeading.length) : content.length;
  if (endIdx === -1) return content.slice(startIdx);
  return content.slice(startIdx, endIdx).trim();
}

addArticle({
  id: '1-01-01-core-attributes-checks',
  name: '1.01.01 Core Attributes, Sub-Attributes & Attribute Checks',
  parent: '1.00 CHARACTER CREATION & PROFILES',
  order: 2,
  perspective: 'operator',
  entry_type: 'Core Rule',
  description: extractSection(charCreationRaw, '# **ATTRIBUTES**', '# **PERCEPTION**') || extractSection(charCreationRaw, '# **ABILITY SCORES**', '# **SPECIES**'),
  mechanic: 'Attribute Checks: 2 + (Attribute * 2) + 2d10 vs Challenge Rating (CR).\nStrength (Might), Agility (Reflex), Stamina (Fortitude), Intellect (Reason), Wisdom (Willpower), Charisma (Etiquette).\nCost: 5 BP per +1 score (max +4 starting). Increases check base by +2. Separate check increase costs 1 BP per +1.',
  guide: 'Attribute checks act as saves and fallbacks when a specific skill check is not applicable. Do not substitute attribute checks for trained skills.'
});

addArticle({
  id: '1-01-02-vitality-health-structure',
  name: '1.01.02 Vitality, Health, Structure & Concussive Trauma',
  parent: '1.00 CHARACTER CREATION & PROFILES',
  order: 3,
  perspective: 'operator',
  entry_type: 'Game Mechanic',
  description: extractSection(charCreationRaw, '# **VITALITY / HEALTH / STRUCTURE**', '# **KARMA**'),
  mechanic: 'Base 30 Vitality, Base 30 Health (+5 per 1 BP, suggested max 60 each).\nStructure = Vitality + Health combined (for Synthetics, Constructs, Oozes).\nStamina: Does not add direct points; each point reduces damage taken from wounds point for point (Base Toughness).\nConcussive Damage (falls, explosions, crashes): Divided equally between Vitality and Health if character attempts to reduce damage.',
  guide: 'Vitality absorbs non-lethal damage and fatigue. Health takes lethal damage. When Health reaches 0, character is incapacitated.'
});

addArticle({
  id: '1-01-03-karma-fate-economy',
  name: '1.01.03 Karma Economy, Rerolls & Negative Debt',
  parent: '1.00 CHARACTER CREATION & PROFILES',
  order: 4,
  perspective: 'operator',
  entry_type: 'Game Mechanic',
  description: extractSection(charCreationRaw, '# **KARMA**', '# **MOVEMENT**'),
  mechanic: 'Default: 3 Karma Points. Resets to max at start of every session (does not regenerate via rest).\nUses: "I Got This" (Roll with Advantage), "Not What I Meant" (Reroll ability/non-combat check), "Shake it Off" (Reduce condition severity by 1 stage), "Second Wind" (1 min focus replaces Light Rest), "So Mote it Be" (Boost metaphysical check / activate Karma feat), "By Will Alone" (Narrative agency push, GM discretion).\nNegative Karma: Incur debt up to Charisma score + 1. GM imposes disadvantage or forced rerolls.',
  guide: 'Use Karma strategically to prevent critical mission failure or trigger decisive heroic moments.'
});

addArticle({
  id: '1-01-04-movement-locomotion-fatigue',
  name: '1.01.04 Movement Modes, Paces & Sprinting Fatigue',
  parent: '1.00 CHARACTER CREATION & PROFILES',
  order: 5,
  perspective: 'operator',
  entry_type: 'Game Mechanic',
  description: extractSection(charCreationRaw, '# **MOVEMENT**', '# **REST**'),
  mechanic: 'Ground Paces: Walk (Base 30ft/rnd), Jog (2x speed, -2 subtlety), Run (4x speed, -4 subtlety, CR 10+ Athletics check), Sprint (6x speed, -8 subtlety, CR 15+ Athletics check), Crawl (1/2 speed, +2 stealth, Prone), Slow Crawl (1/4 speed, +4 stealth, Prone).\nFlying: Flight (2x walk speed), Sail (2x flight, -2 subtlety), Surge (4x flight, CR 10+ Acrobatics), Dive (2x speed, CR 15+ Acrobatics), Glide (+2 bonus, CR 10+ Acrobatics), Hover (1/2 speed, CR 15+ Acrobatics).\nSwimming: Swim (1/2 walk speed), Glide (2x swim, CR 10+ Athletics), Stroke (4x swim, CR 15+ Athletics), Treading (1/2 swim, CR 5+ Athletics).\nClimbing: Easy (1/2 walk, CR 10+), Moderate (1/4 walk, CR 15+), Difficult (1/10 walk, CR 20+).\nBurrowing: Burrow (1/4 walk), Tunnel (2x burrow), Excavation (1/8 walk).\nFatigue Trigger: CR 15 Fortitude check after sprinting 5 consecutive rounds or 10 min hurried travel. Failure = 5 non-lethal Vitality damage; if depleted, 2 Health damage + Exhausted condition.',
  guide: 'Ensure players account for movement mode penalties when performing stealth or precision actions while moving.'
});

addArticle({
  id: '1-01-05-rest-recovery-cycles',
  name: '1.01.05 Rest Cycles, Sleep & Respite',
  parent: '1.00 CHARACTER CREATION & PROFILES',
  order: 6,
  perspective: 'operator',
  entry_type: 'Game Mechanic',
  description: extractSection(charCreationRaw, '# **REST**', '# **DEATH & DYING**'),
  mechanic: 'Full Rest: 6 to 8 hours sleep (Synthetics, Fae, Insects require minimal rest; Alterians/Mondi meditate).\nLight Rest: Up to 4 times per day. Resets traits/features.\n- Nap or Meditation: 1 hour (complete rest).\n- Lounging: 2 hours (casual observation/light recreation).\n- Light Duty: 3 hours (minimal labor/casual work).\nStrenuous activity worsens rest category (Nap -> Lounging -> Light Duty -> Not Rested).',
  guide: 'Manage respite cycles to recover abilities and recharge features before undertaking new incursions.'
});

addArticle({
  id: '1-01-06-death-dying-revivification',
  name: '1.01.06 Death, Dying, Mortal Wounds & Revivification',
  parent: '1.00 CHARACTER CREATION & PROFILES',
  order: 7,
  perspective: 'operator',
  entry_type: 'Core Rule',
  description: extractSection(charCreationRaw, '# **DEATH & DYING**', '# **EXPERIENCE**'),
  mechanic: '0 Health: Incapacitated immediately, drop items, fall Prone.\nDeath\'s Door (0 Health & 0 Vitality): Character is Comatose. Clock = Stamina score rounds (min 1 round) to receive medical aid.\nStabilization: CR 15 Medicine check or healing magic/tech stops clock.\nDeath: Permanent if clock runs out.\nMassive Damage: Taking single hit >= STA while at Death\'s Door causes instant permanent death.\nRevivification (The High Cost of Dying): Requires rare TL5 tech or high Metaphysics. Penalty: Lose ALL remaining Karma Points and suffer -5 Experience Debt (reduction in traits or future experience).',
  guide: 'Field medics must act before the dying character\'s Stamina clock expires.'
});

addArticle({
  id: '1-01-07-experience-advancement-ap',
  name: '1.01.07 Experience, Award Points (AP) & Story Rewards',
  parent: '1.00 CHARACTER CREATION & PROFILES',
  order: 8,
  perspective: 'operator',
  entry_type: 'Operator Rule',
  description: extractSection(charCreationRaw, '# **EXPERIENCE**', null),
  mechanic: 'Exchange Rate: 1 Award Point (AP) = 1 Build Point (BP).\nCRITICAL Increment Rule: Abilities, Skills, or Traits may ONLY be increased by 1 point increment per experience award. Dumping multi-points into a single stat instantly is prohibited.\nStandard Awards: 1-3 AP per session.\nChapter Completion: 5-10 AP.\nOvercoming Goal/Villain: 1-3 AP.\nEpic Actions & Stumping Architect: 1-5 AP.',
  guide: 'Players spend AP during narrative downtime between chapters or after sessions.'
});

// 1.02 ARCHETYPES
const archRaw = readDoc(OP_DIR, '1.02 ARCHETYPES.md');
addArticle({
  id: '1-02-archetypes-codex',
  name: '1.02 ARCHETYPES & MECHANICAL GRAVITY CODEX',
  parent: '1.02 ARCHETYPES CODEX',
  order: 1,
  perspective: 'operator',
  entry_type: 'Archetype Codex',
  description: archRaw,
  mechanic: '80-BP Chassis Allocation Formula:\n+3 Primary Attribute (15 BP)\n+2 Secondary Attribute (10 BP)\n4 Skills @ Trained Tier (Rank 6 = 24 BP) & 6 Skills @ Novice Tier (Rank 3 = 18 BP) [Total 42 BP]\n2 Recommended Signature Features (2 BP each = 4 BP) + 3 Relative Features (3 BP each = 9 BP) [Total 13 BP]\nRemaining 70 BP spent on Species, Saves, Vitality/Health, Faction/Origin/Occupation, and fine-tuning skills.',
  guide: 'Select an Archetype chassis to establish immediate mechanical viability and narrative momentum, then customize the remaining 70 BP.',
  note: 'Source of Truth: docs/game rules/operator/1.02 ARCHETYPES.md'
});

// 1.03 SPECIES
const speciesRaw = readDoc(OP_DIR, '1.03 SPECIES (work).md');
addArticle({
  id: '1-03-species-master-catalog',
  name: '1.03 SPECIES MASTER CATALOG & BP BREAKDOWN',
  parent: '1.03 SPECIES & LINEAGES',
  order: 1,
  perspective: 'operator',
  entry_type: 'Species Codex',
  description: speciesRaw,
  mechanic: 'Positive Ability Scores cost 5 BP per +1.\nSkill Points cost 5 BP per 5 ranks (1 BP/rank).\nTraits: Basic [1 BP], Advanced [2 BP], Elite [4 BP].\nSpecies Recommended Features receive 1 BP discount (min 1 BP).\nMaster Breakdown covers Aeld, Asi, Aulurans, Humans, Kitin, Synthetics, Progenitors, and rare lineages with exact stigmas and stat adjustments.',
  guide: 'Consult the master table to calculate species package costs before spending remaining BP.',
  note: 'Source of Truth: docs/game rules/operator/1.03 SPECIES (work).md'
});

// 1.04 FACTIONS
const factionsRaw = readDoc(OP_DIR, '1.04 FACTIONS.md');
addArticle({
  id: '1-04-factions-master-codex',
  name: '1.04 FACTIONS & GALACTIC POLITIES CODEX',
  parent: '1.04 FACTIONS & GALACTIC POLITIES',
  order: 1,
  perspective: 'both',
  entry_type: 'Faction Codex',
  description: factionsRaw,
  mechanic: 'Faction Stage grants 20 Faction Skill Points and 2 Bonus Features (with 1 BP discount).\nSpecifies Tech Level (TL), Meta Level (ML), social structure, ideological mandates, military doctrine, and diplomatic relationships for all galactic factions.',
  guide: 'Aligning with a faction grants resources and training but introduces political rivals and obligations.',
  note: 'Source of Truth: docs/game rules/operator/1.04 FACTIONS.md'
});

// 1.05 ORIGINS
const originsRaw = readDoc(OP_DIR, '1.05 ORIGINS.md');
addArticle({
  id: '1-05-origins-habitats-codex',
  name: '1.05 ORIGINS & HABITATS MASTER CODEX',
  parent: '1.05 ORIGINS & HABITATS',
  order: 1,
  perspective: 'operator',
  entry_type: 'Origin Codex',
  description: originsRaw,
  mechanic: 'Origin Stage grants 20 Origin Skill Points and 2 Origin Traits.\nAdditional traits cost 1 BP each.\nSecondary Origin may be selected to expand available trait/skill choices without granting extra points.\nHabitats include Agri-Worlds, Arcologies/Megacities, Asteroid Belts, Death Worlds, High/Low-G, Toxic Wastelands, Colony, Spacer, Enlightened, Leisure, Militant.',
  guide: 'Origins reflect environmental upbringing and early life survival skills.',
  note: 'Source of Truth: docs/game rules/operator/1.05 ORIGINS.md'
});

// 1.06 OCCUPATIONS
const occupationsRaw = readDoc(OP_DIR, '1.06 OCCUPATIONS.md');
addArticle({
  id: '1-06-occupations-careers-codex',
  name: '1.06 OCCUPATIONS & CAREERS MASTER CODEX',
  parent: '1.06 OCCUPATIONS & CAREERS',
  order: 1,
  perspective: 'operator',
  entry_type: 'Occupation Codex',
  description: occupationsRaw,
  mechanic: 'Occupation Stage grants 20 Professional Skill Points (Rank 6 recommended, Rank 11 creation cap).\nRecommended Features receive 1 BP discount (cost 2 BP instead of 3 BP).\nPlayers choose 2 Occupational Traits (additional traits cost 2 BP each).\nCommon Traits: Background (access secondary occupation trait), Trade Tools (+2 Equipment), High Pay (+2 Wealth), Professionalism (+2 Reputation).',
  guide: 'Choose an occupation to reflect your formal training, trade, or role in galactic society.',
  note: 'Source of Truth: docs/game rules/operator/1.06 OCCUPATIONS.md'
});

// 1.07 SKILLS
const skillsRaw = readDoc(OP_DIR, '1.07 SKILLS.md');
addArticle({
  id: '1-07-master-skills-codex',
  name: '1.07 MASTER SKILLS CODEX (COMPLETE RULES & BENCHMARKS)',
  parent: '1.07 MASTER SKILLS CODEX',
  order: 1,
  perspective: 'both',
  entry_type: 'Skills Codex',
  description: skillsRaw,
  mechanic: 'All skills cost 1 BP per rank.\nSkill Tiers: 0 Untrained, 1-5 Novice, 6-10 Professional/Trained, 11-15 Expert, 16-20 Master, 21-25 Grand Master, 26-30 Pinnacle.\nCategories: Physical, Mental (Knowledges & Vocations), Social (Manipulation & Expression), Metafocus (Attune & Disciplines), Combat (Archaic, Modern, Advanced).\nFull CR benchmarks, synergistic bonuses, and specialization rules.',
  guide: 'Consult specific skill entries for Challenge Ratings, roll mechanics, and required tools.',
  note: 'Source of Truth: docs/game rules/operator/1.07 SKILLS.md'
});

// 1.08 FEATURES
const featuresRaw = readDoc(OP_DIR, '1.08 FEATURES.md');
addArticle({
  id: '1-08-features-perks-codex',
  name: '1.08 FEATURES & PERKS MASTER CODEX',
  parent: '1.08 FEATURES & PERKS CODEX',
  order: 1,
  perspective: 'operator',
  entry_type: 'Features Codex',
  description: featuresRaw,
  mechanic: 'Base Cost: 3 BP. Recommended Features cost 2 BP (1 BP discount, minimum 1 BP).\nRanked Features: Effects stack (limited by Ability Score or Skill Tier: Novice 1+, Trained 6+, Expert 11+, Master 16+, Pinnacle 20).\nMultiple Features: Can be purchased multiple times for different options/skills.\nSpecial Features: Require GM approval and storyline justification.\nMaster tables for Ability, Combat, Meta/Psionic, Social/General/Karma, and Technologist Features.',
  guide: 'Select features that synergize with your archetype chassis and occupational specialties.',
  note: 'Source of Truth: docs/game rules/operator/1.08 FEATURES.md'
});

// 1.09 HINDRANCES
const hindrancesRaw = readDoc(OP_DIR, '1.09 HINDRANCES.md');
addArticle({
  id: '1-09-hindrances-flaws-codex',
  name: '1.09 HINDRANCES & KARMIC DEBT CODEX',
  parent: '1.09 HINDRANCES & FLAWS CODEX',
  order: 1,
  perspective: 'operator',
  entry_type: 'Hindrance Codex',
  description: hindrancesRaw,
  mechanic: 'Hindrances grant bonus BP during character creation (Minor 3 BP, Moderate 6 BP, Major 9 BP; Disability 3/6/9/18 BP; Age 5/10 BP; Tech Impairment 10/20/30 BP).\nRecommended Cap: 15 BP maximum from Hindrances.\nDistinction: Hindrances (Character Flaws) grant BP; Rolling with Hindrance is the situational mechanic (roll 2d10 with Disadvantage, taking lowest).',
  guide: 'Use hindrances to add narrative depth and character flaws while funding advanced skills and features.',
  note: 'Source of Truth: docs/game rules/operator/1.09 HINDRANCES.md'
});

// 1.10 SCALING
const scalingRaw = readDoc(OP_DIR, '1.10 SCALING.md');
addArticle({
  id: '1-10-scaling-matrix-codex',
  name: '1.10 SCALING MATRIX, SIZE CATEGORIES & PROXIMITY DAMAGE',
  parent: '1.10 SCALING & SIZE CODEX',
  order: 1,
  perspective: 'both',
  entry_type: 'Core Rule',
  description: scalingRaw,
  mechanic: 'Size Categories: Miniscule, Fine, Diminutive, Tiny, Small, Medium (Base), Large, Huge, Gargantuan, Colossal, Enormous, Titanic, Super Gargantuan, Mega Colossal.\nScaling Multipliers apply to Weapon Dice, SP, Speed, Area, Ranges, and Carrying Capacity.\nCombat Modifiers adjust Defense and Agility relative to opponent size.\nAttacker vs Defender: If target is smaller than medium, subtract target combat mod from attacker combat mod; if larger than medium, divide or subtract per formula.\nStarship Proximity Damage: Overwhelming capital blast vaporizes small targets and deals 1/10 indirect damage to splash radius (half Strength mod in feet).\nMeta-Tech Scaling: (Base Damage Dice) * (Chassis Scale Multiplier) = Final Damage Dice.',
  guide: 'Essential for resolving vehicular combat, mecha engagements, giant alien xenofauna, and starship orbital strikes.',
  note: 'Source of Truth: docs/game rules/operator/1.10 SCALING.md'
});

// 2.00 ECONOMATRIX
const economatrixRaw = readDoc(OP_DIR, '2.00 ECONOMATRIX.md');
addArticle({
  id: '2-00-economatrix-unified-theory',
  name: '2.00 ECONOMATRIX & ECONOMIC UNIFIED THEORY (TSC)',
  parent: '2.00 ECONOMATRIX & CRAFTING',
  order: 1,
  perspective: 'both',
  entry_type: 'Core Rule',
  description: economatrixRaw,
  mechanic: 'Tangent Standard Curve (TSC): Value (Credits) = 10 * 4^(CR / 5).\nGolden Rule of Tangent Wealth: A character may automatically purchase any item with a Crafting CR <= Wealth Score without depleting liquid Credits or reducing Wealth Score (Purchase CR = Crafting CR).\nLiquid Credits for transactions exceeding Wealth limits.\n1 MCr (Mega-Credit) = 1,000,000 Credits.\nCrafting CR is the Prime Mover of value, time, and fabrication tiers.',
  guide: 'Use the TSC curve to value any item, weapon, augmentation, or starship in credits based on crafting difficulty.',
  note: 'Source of Truth: docs/game rules/operator/2.00 ECONOMATRIX.md'
});

// 3.00 COMBAT
const combatRaw = readDoc(OP_DIR, '3.00 COMBAT.md');
addArticle({
  id: '3-00-tactical-combat-master',
  name: '3.00 TACTICAL COMBAT SYSTEM (COMPLETE RULES)',
  parent: '3.00 TACTICAL COMBAT CODEX',
  order: 1,
  perspective: 'both',
  entry_type: 'Core Rule',
  description: combatRaw,
  mechanic: 'Core Resolution: 2d10 + Skill Rank + Attribute Mod + Situational Modifiers vs Target Defense.\nAction Economy by Skill Tier:\n- Rank 0: Full Round action\n- Rank 1-5: 1st action at base score (+2 focus bonus)\n- Rank 6-10: 2nd action at base score -5 (+3 focus bonus)\n- Rank 11-15: 3rd action at base score -10 (+4 focus bonus)\n- Rank 16-20: 4th action at base score -15 (+5 focus bonus)\n- Rank 21-25: 5th action at base score -20 (+6 focus bonus)\n- Rank 26-30: 6th action at base score -25 (+7 focus bonus)\nInitiative: Reflex Check (2d10 + Reflex Save + AGI mod).\nOpposed Roll: Defender wins all ties.\nUnopposed Roll: Base CR 15 (Average medium target at short range).\nRange Brackets: Point Blank (+5 Strike, Advantage on damage dice), Short (0), Medium (-5), Long (-10), Extreme (-15).\nMovement Defenses: Moving 20+ ft = +2 DEF; 40+ ft = +4 DEF; Total Defense/Dodge = +4 DEF.\nAutomatic Weapons: Burst (+1 Strike); Full Auto (-1 recoil/10 rounds; hits = points over DEF; +1d damage per extra hit); Suppression blasting.\nDamage: (Weapon Dice + Ability + Precision) - (Armor DR + CON/STA Mod).\nCritical: Nat 20 (Double 10s) = x2 Damage Dice; Critical Failure = Double 1s.',
  guide: 'Consult this master combat reference for initiative, range penalties, multi-actions, called shots, and burst fire.',
  note: 'Source of Truth: docs/game rules/operator/3.00 COMBAT.md'
});

// 4.00 METAPHYSICS
const metaphysicsRaw = readDoc(OP_DIR, '4.00 METAPHYSICS.md');
addArticle({
  id: '4-00-metaphysics-omni-codex',
  name: '4.00 METAPHYSICS & REALITY MANIPULATION (OMNI-CODEX)',
  parent: '4.00 METAPHYSICS & REALITY MANIPULATION',
  order: 1,
  perspective: 'both',
  entry_type: 'Core Rule',
  description: metaphysicsRaw,
  mechanic: 'Triad: Attune (Accuracy/Resistance CR), Discipline (Severity/Damage), Invocation (Specialization technique).\nMetafocus Levels: ML 0 (Null), ML 1 (Rare), ML 2 (Selective), ML 3 (Cultured), ML 4 (Standardized), ML 5 (Advanced), ML 6 (Deific).\nKey Ability Sources: INT (Psychic, Arcane, Akashic); WIS (Divine, Nature, Cosmic); CHA (Bardic, Hereditary, Granted).\nPotency Calculation: [Key Ability + Discipline Skill Level + Invocation Level + 10 (or 2d10)].\nFree-Casting (Spontaneous roll) vs Codified Invocations (Takes 10 by default).\nEssence Pool Formula: Sum of ALL Attributes (STR+AGI+STA+INT+WIS+CHA) + Attune Rank.\n6 Disciplines: Dimension, Energy, Entropy, Illusion, Matter, Mental.',
  guide: 'Requires Awakened feature. Invocations scale across Novice, Trained, Expert, Master, and Pinnacle stages.',
  note: 'Source of Truth: docs/game rules/operator/4.00 METAPHYSICS.md'
});

console.log('--- Ingesting Canonical Architect Matrices (16 Documents) ---');

const architectFiles = [
  { file: '99. .ARCHETYPES.md', id: 'doc-architect-99-archetypes', name: '99. ARCHETYPES MASTER COMPENDIUM (253 PROFILES)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 1, perspective: 'architect', entry_type: 'Master Archetype Catalog', desc: 'Master architectural compendium of 253 complete archetypes in alphabetical order with skills, features, and mechanical roles.' },
  { file: '99. METAPHYSICS (1).md', id: 'doc-architect-99-metaphysics', name: '99. METAPHYSICS FRAMEWORK & TRANSCENDENCE', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 2, perspective: 'architect', entry_type: 'Metaphysics Matrix', desc: 'Classification of Metafocus Levels (ML 0-6), societal integration, and metaphysical independence from technology.' },
  { file: '99. METAPHYSICS, INVOCATION MATRIX (1).md', id: 'doc-architect-99-metaphysics-invocation-matrix', name: '99. INVOCATION MATRIX & DATA BLOCK ARCHITECTURE', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 3, perspective: 'architect', entry_type: 'Invocation Matrix', desc: 'The 4 pillars (Root, Threshold, Parameters, Scaling Function) and standardized Invocation Stat Block schema.' },
  { file: '99. METAPHYSICS, META-TECH MATRIX (1).md', id: 'doc-architect-99-metaphysics-meta-tech-matrix', name: '99. META-TECH MATRIX (CONVERSION & CAPACITY)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 4, perspective: 'architect', entry_type: 'Meta-Tech Matrix', desc: 'Integration of magic and tech: Enhancement (Passive), Imbuement (Active), Interface (Symbiotic). UDU capacity: 1 Socket = Rank 10, Mount = Rank 20/30, Module = Rank 30.' },
  { file: '99. MODULAR CHARACTER MATRIX.md', id: 'doc-architect-99-modular-character-matrix', name: '99. MODULAR CHARACTER MATRIX (MCM & NPC PROTOCOLS)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 5, perspective: 'architect', entry_type: 'Modular Character Matrix', desc: 'MCM construction protocols: Stack approach (Tier Chassis 0-20 + Designation [Adversary, Ally, Companion, Neutral] + Components + Narrative).' },
  { file: '99. MODULAR COMPANION MATRIX.md', id: 'doc-architect-99-modular-companion-matrix', name: '99. MODULAR COMPANION MATRIX (COHORTS & DRONES)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 6, perspective: 'architect', entry_type: 'Companion Matrix', desc: 'Biological, synthetic, and metaphysical cohorts. 40 BP budget, +10 BP/rank, Familiar, Mind Link, Shared Senses, Loyal Protector.' },
  { file: '99. MODULAR FACTION MATRIX.md', id: 'doc-architect-99-modular-faction-matrix', name: '99. MODULAR FACTION MATRIX (SOCIOLOGICAL CHASSIS)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 7, perspective: 'architect', entry_type: 'Faction Matrix', desc: '4-phase faction construction: Archetype selection, Mechanical skeleton (TL, ML, Wealth), Sociological profile, and Visual semiotics.' },
  { file: '99. MODULAR PLANETARY MATRIX.md', id: 'doc-architect-99-modular-planetary-matrix', name: '99. MODULAR PLANETARY MATRIX (WORLD-BUILDING CODEX)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 8, perspective: 'architect', entry_type: 'Planetary Matrix', desc: 'Ontological engineering: Morgan-Keenan stellar classes (O, B, A, F, G, K, M, D), geophysical chassis, atmospheric types, biomes, law levels, government codes.' },
  { file: '99. MODULAR SPECIES MATRIX.md', id: 'doc-architect-99-modular-species-matrix', name: '99. MODULAR SPECIES MATRIX (XENOLOGICAL BLUEPRINT)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 9, perspective: 'architect', entry_type: 'Species Matrix', desc: 'Standardized species entry template: Overview, biology, psychology, culture, technology/meta integration, trait costs (Basic 1, Adv 2, Elite 4).' },
  { file: '99. TECHNOLOGY, ARCHITECTURAL MATRIX.md', id: 'doc-architect-99-technology-architectural-matrix', name: '99. ARCHITECTURAL MATRIX (TAXONOMY & CONSTRUCTION)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 10, perspective: 'architect', entry_type: 'Architectural Matrix', desc: 'Macro-structural engineering: 1 Module = 10 Mounts (400 sq ft / 10 tons). Tangent Standard Curve pricing Value = 10 * 4^(CR / 5).' },
  { file: '99. TECHNOLOGY, ARMOR MATRIX.md', id: 'doc-architect-99-technology-armor-matrix', name: '99. ARMOR MATRIX (MATERIAL MITIGATION OF TRAUMA)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 11, perspective: 'architect', entry_type: 'Armor Matrix', desc: 'Agnostic chassis vs cultural skin. DR, SP, mobility penalties, size scaling (Diminutive to Colossal), and secondary layering protocols.' },
  { file: '99. TECHNOLOGY, AUGMENTATIONS MATRIX.md', id: 'doc-architect-99-technology-augmentations-matrix', name: '99. AUGMENTATIONS MATRIX (PHYSICAL FORM & NODES)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 12, perspective: 'architect', entry_type: 'Augmentations Matrix', desc: 'Economy of self: BP, Nodes (1-to-1 SP), Sockets (10 nodes/socket). Standard (L1, 6 BP credit), Heavy (L2, +6 BP credit), Extreme (L3, +6 BP credit).' },
  { file: '99. TECHNOLOGY, EQUIPMENT MATRIX.md', id: 'doc-architect-99-technology-equipment-matrix', name: '99. EQUIPMENT MATRIX (MATERIAL FOUNDATION & UDU)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 13, perspective: 'architect', entry_type: 'Equipment Matrix', desc: 'UDU hierarchy: Tier 0 Nodes (<10g), Tier 1 Socket (<1kg), Tier 2 Mount (<100kg), Tier 3 Module (<10t). 10:1 ratio across all tiers.' },
  { file: '99. TECHNOLOGY, MECHA MATRIX.md', id: 'doc-architect-99-technology-mecha-matrix', name: '99. MECHA MATRIX (STRUCTURE OF MOBILITY & VEHICLES)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 14, perspective: 'architect', entry_type: 'Mecha Matrix', desc: 'Universal mobility umbrella: all vehicles, drones, rovers, walkers, starships. Automata distinction vs Synthetic sapience; Eras and sub-strata.' },
  { file: '99. TECHNOLOGY, WEAPONRY MATRIX.md', id: 'doc-architect-99-technology-weaponry-matrix', name: '99. WEAPONRY MATRIX (KINETIC APPLICATION & DNA)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 15, perspective: 'architect', entry_type: 'Weaponry Matrix', desc: 'Weapon anatomy stat blocks: damage types (Kinetic, Force, Thermal, Voltic, Sonic, Corrosive, Psychic), range in feet, critical x2 dice, AP, supply dice, sockets.' },
  { file: '99. TECHNOLOGY.md', id: 'doc-architect-99-technology', name: '99. TECHNOLOGY LEVELS & ADVANCEMENTS (TL 0 TO 5 & X)', parent: '99.00 ARCHITECT MATRICES & WORLDBUILDING', order: 16, perspective: 'architect', entry_type: 'Technology Codex', desc: 'Master Tech Levels (TL 0 Stone to TL 5 Galactic & TL X Transgalactic). Education bonuses, adaptive/morphic technologies, pricing multipliers.' }
];

for (const arch of architectFiles) {
  const raw = readDoc(ARCH_DIR, arch.file);
  addArticle({
    id: arch.id,
    name: arch.name,
    parent: arch.parent,
    order: arch.order,
    perspective: arch.perspective,
    entry_type: arch.entry_type,
    description: raw,
    mechanic: arch.desc,
    guide: 'Consult this Architect matrix when designing game assets, calculating build budgets, adjudicating scale, or world-building.',
    note: `Source of Truth: docs/game rules/architect/${arch.file}`
  });
}

// Write out consolidated compendiumSeed.json
fs.writeFileSync(SEED_OUTPUT, JSON.stringify(articles, null, 2), 'utf-8');

console.log(`\nSUCCESS! Compiled ${articles.length} canonical compendium articles.`);
console.log(`Saved seed to: ${SEED_OUTPUT}`);
console.log(`Wrote markdown articles to: ${MD_OUTPUT_DIR}`);
