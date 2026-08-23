import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { creationArticles } from './vol1_creation.mjs';
import { resolutionArticles } from './vol2_resolution.mjs';
import { combatArticles } from './vol3_combat.mjs';
import { metaphysicsArticles } from './vol4_metaphysics.mjs';
import { technologyArticles } from './vol5_technology.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const compendiumDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');
const seedJsonPath = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');

if (!fs.existsSync(compendiumDir)) {
  fs.mkdirSync(compendiumDir, { recursive: true });
}

// Clean old files
const oldFiles = fs.readdirSync(compendiumDir);
for (const f of oldFiles) {
  if (f.endsWith('.md')) {
    fs.unlinkSync(path.join(compendiumDir, f));
  }
}

// Volume 0
const rolesArticles = [
  {
    id: '0-01-operator-reference-manual',
    name: '0.01 OPERATOR Reference Manual (Player Guide)',
    category: 'compendium',
    entry_type: 'Role Reference',
    parent: '0.00 SYSTEM ROLES & ARCHITECTURE',
    order: 1,
    description: [
      '# 0.01 OPERATOR Reference Manual (Player Guide)',
      '',
      'The **OPERATOR** is the player who commands and embodies a Hero or Persona in the Tangent Science Fantasy Roleplay universe. As an Operator, you navigate perilous star-systems, ancient alien ruins, neon arcologies, and high-stakes metaphysical confrontations.',
      '',
      '---',
      '',
      '## The Persona Folio: Core Attributes & Derivations',
      '',
      'Every character in Tangent is built upon **6 Core Attributes**, each coupled with a specialized **Sub-Attribute**:',
      '',
      '| Primary Attribute | Core Application | Sub-Attribute | Saving Throw / Check |',
      '| :--- | :--- | :--- | :--- |',
      '| **Strength (STR)** | Physical power, carrying capacity, melee force | **Might** | Raw muscular lift, break DC, grapple power |',
      '| **Agility (AGI)** | Dexterity, fine motor control, balance | **Reflex** | Initiative, dodge DC, acrobatics, evasion |',
      '| **Stamina (STA)** | Physical endurance, cardio, cellular resilience | **Fortitude** | Disease, poison, wound stabilization, shock |',
      '| **Intellect (INT)** | Deductive logic, technical aptitude, memory | **Logic** | Hacking, investigation, physics, computation |',
      '| **Wisdom (WIS)** | Intuition, spatial awareness, perception | **Will** | Mental defense, fear resistance, psychic grit |',
      '| **Charisma (CHA)** | Social magnetism, leadership, command presence | **Etiquette** | Diplomacy, deceit, negotiation, morale |',
      '',
      '---',
      '',
      '## The Operator\'s Three 20-Point Skill Allotments',
      '',
      'During character creation, an Operator receives three distinct, dedicated pools of **20 Skill Points (SP)**:',
      '',
      '1. **Faction Skill Pool (20 SP):** Allocated among skills taught by your chosen faction or galactic polity.',
      '2. **Origin Skill Pool (20 SP):** Allocated among survival and environmental skills granted by your birthworld or native habitat.',
      '3. **Occupation Skill Pool (20 SP):** Allocated among professional skills defining your training, career, and role.',
      '',
      '> [!IMPORTANT]',
      '> **Skill Rank Caps at Creation:**',
      '> - Recommended starting limit: **Rank 6 (Trained / Professional)**.',
      '> - Maximum hard cap during creation: **Rank 11 (Expert)** (reserved for specialized backstory concepts).',
      '> - Cost: **1 SP = 1 Skill Rank**.',
      '',
      '---',
      '',
      '## Features, Feats & Perks',
      '',
      '- Standard Features cost **3 Build Points (BP)** each.',
      '- **Recommended Features** listed under your Occupation or Faction receive a **1 BP Discount** (costing **2 BP**).',
      '- Ranked Features may be purchased multiple times, stacking bonuses up to your attribute or skill tier limits.',
      '',
      '---',
      '',
      '## Action Economy in Tactical Combat',
      '',
      'Your number of attacks and actions per round is governed directly by your **Combat Skill Rank**:',
      '',
      '| Skill Rank | Title / Benchmark | Actions per Round | Focus Strike Bonus |',
      '| :--- | :--- | :--- | :---: |',
      '| **Rank 0** | Untrained | Full Round (1 basic action) | — |',
      '| **Rank 1 – 5** | Novice / Studied | **1st Action** at base score | +2 |',
      '| **Rank 6 – 10** | Trained / Professional | **2nd Action** at base -5 | +3 |',
      '| **Rank 11 – 15** | Expert | **3rd Action** at base -10 | +4 |',
      '| **Rank 16 – 20** | Master | **4th Action** at base -15 | +5 |',
      '| **Rank 21 – 25** | Grand Master | **5th Action** at base -20 | +6 |',
      '| **Rank 26 – 30** | Pinnacle | **6th Action** at base -25 | +7 |',
      '',
      '---',
      '',
      '## Metaphysics & Reality Manipulation',
      '',
      'If your character possesses an **Awakened Discipline**:',
      '- **Attune Check:** Determines the resistance DC of your spell or the evasion DC for targets.',
      '- **Discipline Check:** Determines the intensity, duration, damage, or magnitude of the effect.',
      '- **Essence Pool:** Manage your daily Essence reserves to power Invocations and avoid Strain.'
    ].join('\n'),
    mechanic: 'Attack Check = d20 + Combat Skill Rank + Ability Mod + Weapon Modifiers\nActive Defense = d20 + Defense Skill + Agility Mod (each successive defense at cumulative -5)\nSpell Resistance DC = 10 + Key Ability Mod + Attune Rank + Invocation Level',
    guide: '1. Check your Persona Folio for current HP, Armor DR, and Essence Pool.\n2. On your turn in combat, declare actions up to your Skill Stage limit.\n3. Roll d20 + Skill Rank + Attribute Mod vs target DC or Opposed Defense.',
    note: 'Operators should balance offensive actions with defensive reserves, as reactive defenses suffer cumulative penalties.'
  },
  {
    id: '0-02-architect-reference-manual',
    name: '0.02 ARCHITECT Reference Manual (Game Master Guide)',
    category: 'compendium',
    entry_type: 'Role Reference',
    parent: '0.00 SYSTEM ROLES & ARCHITECTURE',
    order: 2,
    description: [
      '# 0.02 ARCHITECT Reference Manual (Game Master Guide)',
      '',
      'The **ARCHITECT** is the Game Master, universe designer, referee, and lead storyteller of the Tangent SFF RPG framework. The Architect sets the parameters of worlds, crafts adversaries and factions, adjudicates rules, and maintains dramatic momentum.',
      '',
      '---',
      '',
      '## 1. Setting the Stage: World & Civilization Metrics',
      '',
      'When establishing star-systems or planetary sectors, assign two fundamental ratings:',
      '',
      '### Technology Level (TL 0 to TL 5)',
      '- **TL 0 (Primitive):** Stone, bronze, early combustion, archaic blades.',
      '- **TL 1 (Industrial):** Fossil fuels, early rocketry, ballistic firearms, radio.',
      '- **TL 2 (Atomic / Digital):** Micro-circuitry, fission power, orbital shuttles, lasers.',
      '- **TL 3 (Interstellar / Standard):** Fusion reactors, FTL hyper-lanes, plasma ballistics, cybernetics.',
      '- **TL 4 (Advanced / Cybernetic):** Antimatter power, neural stacks, graviton plating, hard-light.',
      '- **TL 5 (Hyper-Tech / Exotic):** Singularity drives, zero-point energy, reality-warp lattices.',
      '',
      '### Metafocus Level (ML 0 to ML 6)',
      '- **ML 0 (Null):** No native meta users or reality warping.',
      '- **ML 1 (Rare):** Negligible population ratio; meta users are feared, revered, or hunted.',
      '- **ML 2 (Selective):** Specialized cults, psionic black-ops, monastery enclaves.',
      '- **ML 3 (Cultured):** Common acceptance; Adepts operate in hospitals, courts, and armies.',
      '- **ML 4 (Standardized):** Integrated into daily life, legal codes, and infrastructure.',
      '- **ML 5 (Advanced):** High-density psionic society; telepathic networks and matter-shaping.',
      '- **ML 6 (Deific):** Transcended civilization (Progenitors / Architects); Non-Player Characters only.',
      '',
      '---',
      '',
      '## 2. Difficulty Classes (DC) & Adjudication',
      '',
      '| Difficulty Level | Target DC | Typical Task Example |',
      '| :--- | :---: | :--- |',
      '| **Very Easy / Routine** | **5** | Driving on an open highway, noticing a loud noise |',
      '| **Easy / Standard** | **10** | Picking a simple lock, climbing a ladder in rain |',
      '| **Moderate / Challenging** | **15** | Bypassing an electronic security door, first aid in combat |',
      '| **Hard / Professional** | **20** | Hacking an encrypted corp server, landing in a storm |',
      '| **Very Hard / Master** | **25** | Disarming an active antimatter warhead, tracking in vacuum |',
      '| **Extreme / Heroic** | **30** | Out-piloting a smart missile swarm, subverting an AI core |',
      '| **Near Impossible / Deific**| **35+** | Reshaping tectonic plates with pure metaphysical will |',
      '',
      '---',
      '',
      '## 3. Adjudicating Opposed vs. Unopposed Rolls',
      '',
      '- **Opposed Rolls:** Attacker check vs. Defender check.',
      '  - *Golden Rule:* **DEFENDER WINS ALL TIES**.',
      '- **Unopposed Rolls:** Attacker check vs. Static DC (Base 15 modified for Size, Range, and Movement).',
      '',
      '---',
      '',
      '## 4. Encounter Balancing & NPC Architecture',
      '',
      'Architects can quickly assemble adversary statblocks using the **3-Tier Threat Matrix**:',
      '- **Minions / Grunts:** Fixed 10 HP, No Armor DR, +2 to +4 on attack rolls, 1 action per round.',
      '- **Elites / Enforcers:** 30–50 HP, Armor DR 5–10, +6 to +10 attack roll, 2–3 actions per round.',
      '- **Bosses / Arch-Villains:** 100+ HP, Armor DR 15+, Legendary Reactions, Focus Strike +5, full Metaphysic suites.'
    ].join('\n'),
    mechanic: 'Unopposed DC = 15 + Size Modifier + Range Penalty + Movement Modifier\nDesign DC = (TL * 2) + (ML * 3) + Base Component Difficulty',
    guide: '1. Establish the planetary TL and ML before designing scenes.\n2. Use Base DC 15 for average tasks under pressure; adjust by +/- 5 increments.\n3. When resolving opposed checks, award ties to the defending party.',
    note: 'Keep the story moving: if a roll fails by 1-2 points, offer a Success at a Cost rather than a hard roadblock.'
  },
  {
    id: '0-03-bastion-tactical-assistant-manual',
    name: '0.03 BASTION Tactical Assistant & Engine Manual',
    category: 'compendium',
    entry_type: 'Role Reference',
    parent: '0.00 SYSTEM ROLES & ARCHITECTURE',
    order: 3,
    description: [
      '# 0.03 BASTION Tactical Assistant & Engine Manual',
      '',
      '**BASTION** is the integrated Tactical AI Assistant, rules adjudication engine, and combat computation system for the Tangent Science Fantasy Roleplay suite.',
      '',
      '---',
      '',
      '## 1. System Architecture & Command Syntax',
      '',
      'BASTION processes user directives, parses tactical encounters, calculates odds, and resolves dice commands:',
      '',
      '### Dice Rolling Engine Syntax',
      '- /roll [count]d[sides]+[mod]',
      '- Examples:',
      '  - /roll d20+6 — Standard attack or skill check.',
      '  - /roll 2d10+4 — Heavy energy blaster damage roll.',
      '  - /roll 3d6+2 — Kinetic slug thrower burst roll.',
      '',
      '---',
      '',
      '## 2. Core Resolution Formulas',
      '',
      'BASTION evaluates mathematical equations across the three modules (**Omnicortex**, **Story Foundry**, and **Persona Folio**):',
      '',
      '### Attack & Strike Calculation',
      '\\text{Total Strike} = d20 + \\text{Skill Rank} + \\text{Attribute Mod} + \\text{Weapon Mod} + \\text{Situational Mod}',
      '',
      '### Armor Penetration & Effective Damage',
      '\\text{Effective Damage} = \\text{Incoming Damage} - \\max(0, \\text{Armor DR} - \\text{Armor Piercing (AP)})',
      '',
      '### Metaphysic Potency',
      '\\text{Potency Score} = \\text{Key Ability} + \\text{Discipline Skill Level} + \\text{Invocation Level} + 10 \\text{ (or } d20 \\text{)}',
      '',
      '---',
      '',
      '## 3. Database Schemas & Relational Integrity',
      '',
      'BASTION enforces strict data validation across all DBM collections:',
      '- **Relational Linking:** Items link to prerequisites, species link to inherent traits, and features link to skill requirements.',
      '- **Bi-directional Sync:** Folio character sheets dynamically query Omnicortex DBM entries in real time.'
    ].join('\n'),
    mechanic: 'Input: /roll 2d20kh1+5 -> Roll 2d20, Keep Highest 1, Add 5 (Advantage Check)\nDamage Soak: EffectiveHP_Loss = max(1, RawDamage - max(0, TargetDR - WeaponAP))',
    guide: 'Type /roll in the BASTION chat bar to execute instant dice operations.\nAsk BASTION for rule lookups, NPC generation, and combat odds analysis.',
    note: 'BASTION is strictly attuned to the Tangent SFF RPG rulebook and prioritizes mathematical precision.'
  }
];

const allArticles = [
  ...rolesArticles,
  ...creationArticles,
  ...resolutionArticles,
  ...combatArticles,
  ...metaphysicsArticles,
  ...technologyArticles
];

console.log("\n======================================================");
console.log(`  COMPILING CANONICAL COMPENDIUM (${allArticles.length} ARTICLES)`);
console.log("======================================================\n");

const volumeCounts = {};

for (const article of allArticles) {
  const frontmatter = [
    '---',
    `id: "${article.id}"`,
    `name: "${article.name}"`,
    `category: "${article.category || 'compendium'}"`,
    `entry_type: "${article.entry_type || 'Core Rule'}"`,
    `parent: "${article.parent || ''}"`,
    `order: ${article.order || 0}`,
    '---',
    ''
  ].join('\n');

  const fileContent = frontmatter + (article.description ? article.description.trim() : '') + '\n';
  const filePath = path.join(compendiumDir, `${article.id}.md`);
  fs.writeFileSync(filePath, fileContent, 'utf8');

  const vol = article.parent || 'Standalone';
  volumeCounts[vol] = (volumeCounts[vol] || 0) + 1;
}

// Save complete seed JSON
fs.writeFileSync(seedJsonPath, JSON.stringify(allArticles, null, 2), 'utf8');

console.log('Generated Articles by Volume:');
for (const [vol, count] of Object.entries(volumeCounts)) {
  console.log(`  - [${vol}]: ${count} full articles`);
}

console.log(`\nTotal Compendium Articles: ${allArticles.length}`);
console.log(`Generated JSON Seed: ${seedJsonPath}`);
console.log(`Generated Markdown Files in: ${compendiumDir}\n`);
