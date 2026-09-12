/**
 * @file compileMechanicsDataset.mjs
 * @description Compiles the 100% CANONICAL Tangent SF RP MECHANICS rules dataset for BASTION.
 * Strictly grounded in: docs/game rules/operator/ (3.00 COMBAT.md, 1.00, 1.01, 1.10, 2.00, 4.00)
 * and docs/game rules/architect/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_JS_PATH = path.resolve(__dirname, '../src/data/mechanicsData.js');
const JSON_OUTPUT_PATH = path.resolve(__dirname, '../src/data/omnicortex/mechanicsRules.json');

const mechanics = [];

function addMechanic({
  id,
  title,
  category,
  citation,
  summary,
  mechanic_formula = '',
  rules_text,
  examples = [],
  tags = [],
  status = 'pending_approval'
}) {
  mechanics.push({
    id,
    title,
    category,
    citation,
    summary: summary.trim(),
    mechanic_formula: mechanic_formula.trim(),
    rules_text: rules_text.trim(),
    examples,
    tags: Array.from(new Set([...tags, category, 'rules', 'mechanics', 'bastion'])).map(t => t.toLowerCase()),
    status,
    updatedAt: new Date().toISOString()
  });
}

/* =========================================================================
   1. COMBAT: CORE RESOLUTION & ACTIONS PER TURN (3.00 COMBAT.MD)
   ========================================================================= */

addMechanic({
  id: 'mech-combat-core-resolution',
  title: '2d10 Dual Resolution & Target Defense',
  category: 'combat',
  citation: 'docs/game rules/operator/3.00 COMBAT.md § Core Mechanics',
  summary: 'The Attack Roll is 2d10 + Skill Rank + Attribute Mod + Situational Modifiers vs. Target Defense (DC).',
  mechanic_formula: 'Attack Roll = 2d10 + Skill Rank + Attribute Mod + Situational Modifiers vs Target Defense (DC)',
  rules_text: `TANGENT uses a 2d10 dice system for all tactical combat:
- Opposed Roll: Defender's Agility + Defense Skill (or relevant melee skill) vs. Attacker's Ability + Combat Skill.
  * Attacker wins: Strike / hit.
  * Defender wins: Attacker misses or unsuccessful action.
  * DEFENDER WINS ALL TIES.
- Unopposed Roll (Target unaware, surprised, or stationary):
  * Attacker rolls Ability + Combat Skill vs. CR 15 (Average baseline for medium target within short range).
  * CR 15 is modified by target Size, Range, and Movement.`,
  examples: [
    'Opposed combat roll: Attacker rolls 18, Defender rolls 18. Result: Defender wins the tie; attack misses.',
    'Attacking stationary turret at short range: Attacker rolls vs baseline CR 15.'
  ],
  tags: ['dual resolution', 'dice', '2d10', 'attack roll', 'opposed roll', 'unopposed', 'cr 15', 'defender wins ties']
});

addMechanic({
  id: 'mech-combat-actions-by-skill-tier',
  title: 'Combat Actions & Iterative Penalty by Skill Tier',
  category: 'combat',
  citation: 'docs/game rules/operator/3.00 COMBAT.md § Skill Focus & Actions',
  summary: 'Combat actions per turn are unlocked by Skill Rank. Iterative attacks suffer sequential -5 penalties.',
  mechanic_formula: 'Rank 1-5: 1 action | Rank 6-10: 2nd action (-5) | Rank 11-15: 3rd action (-10) | Rank 16-20: 4th (-15) | Rank 21-25: 5th (-20) | Rank 26-30: 6th (-25)',
  rules_text: `Combat capability is defined by Skill Tier. As a character gains Ranks, they unlock additional actions:
- Rank 0 (Untrained): Full Round action required for a single strike.
- Rank 1–5 (Novice / Studied): 1st action at base score (Focus Bonus +2).
- Rank 6–10 (Professional / Trained): 2nd action at base score -5 (Focus Bonus +3).
- Rank 11–15 (Expert): 3rd action at base score -10 (Focus Bonus +4).
- Rank 16–20 (Master): 4th action at base score -15 (Focus Bonus +5).
- Rank 21–25 (Grand Master): 5th action at base score -20 (Focus Bonus +6).
- Rank 26–30 (Pinnacle): 6th action at base score -25 (Focus Bonus +7).
- Active Defense: Characters may make as many Active Defense checks as allowed by their Defense Skill Rank, with a cumulative -5 penalty after the first reaction.`,
  examples: [
    'An Expert swordsman (Rank 12) attacks 3 times in a turn: 1st attack at base score, 2nd attack at base -5, 3rd attack at base -10.',
    'A Trained defender makes a 2nd Active Defense reaction in the same round at a -5 penalty.'
  ],
  tags: ['actions', 'skill tier', 'iterative penalty', '-5 penalty', 'focus bonus', 'active defense', 'rank']
});

addMechanic({
  id: 'mech-combat-initiative',
  title: 'Initiative Reflex Check',
  category: 'combat',
  citation: 'docs/game rules/operator/3.00 COMBAT.md § Initiative',
  summary: 'Initiative is determined by rolling 2d10 + Reflex Save + Agility Mod. High roll goes first.',
  mechanic_formula: 'Initiative = 2d10 + Reflex Save + Agility Mod',
  rules_text: `Initiative determines the turn order in tactical encounters:
- Each combatant rolls 2d10 + Reflex Save + Agility Modifier.
- Highest roll acts first. Ties broken by raw Agility score.
- Situational modifiers apply for Ambush, Surprised status, or advancing/retreating targets.`,
  examples: [
    'Operative with Agility +3 and Reflex Save +4 rolls 2d10 (13) + 7 = 20 Initiative.'
  ],
  tags: ['initiative', 'reflex check', 'turn order', 'agility']
});

addMechanic({
  id: 'mech-combat-edge-system',
  title: 'EDGE Tactical Advantage System',
  category: 'combat',
  citation: 'docs/game rules/operator/3.00 COMBAT.md § Edge',
  summary: 'Edge represents situational and tactical advantages gained through movement, positioning, and environment.',
  mechanic_formula: 'Edge Modifiers: Aiming (+2/rnd), Flanking (+2), High Ground (+2 Strike, +2 Crit), Evasive (+1 Def + 1/10ft)',
  rules_text: `Edge modifiers govern tactical positioning in Tangent:
- Aiming: Sights locked onto target. Gain +2 Strike per round of Aiming (up to 1/2 attacker Skill Level or AGIx2 + 2). Attacker cannot move before shooting.
- Flanking: Allies positioned on multiple sides of a target grant +2 bonus to hit.
- Advancing Target: Target approaching without Cover or Evasion grants an Extra Attack at -5 Strike and rerolls Initiative if moved into Melee.
- Retreating Target: Target fleeing at Jog/Run/Sprint speed forgoing evasion grants an Extra Attack at -5 Strike and rerolls Initiative.
- High Ground: +2 to Strike and +2 to Critical Damage Range.
- Prone: vs Melee/Point Blank grants High Ground bonus to attacker; vs Ranged receives +2 Defense bonus for each Range category after Point Blank.
- Braced: Set to receive a Charge or stay in place. Block usable as counter-attack; negates heavy weapon recoil.
- Charge: Move straight at least 10ft. Add +1d to Attack Damage and -1 to strike per stage of speed, plus +1 Point of Impact Damage per 10ft of speed (up to max +100% damage).
- Close In: Guarded approach at base speed. No modifiers; not an Advancing Target.
- Withdraw: Defensive retreat at base speed. No modifiers; not a Retreating Target.
- Evasive Movement: Fully defensive while moving quickly. Gain +1 Defense base, plus +1 Defense per 10ft of movement speed used.
- Subtle: Quiet, sneaky movement required for stealth skill actions.
- Feint: Bluff check vs Sense Motive -> Sneak Attack at -5 Strike with Target having NO Defense.
- Surprise / Sneak Attack: Caught unaware with NO Defense allowed from target. Attack made at -5 to hit, and Damage is rolled with Advantage (roll twice, take highest).`,
  examples: [
    'Operative snipes from a catwalk (+2 High Ground strike and crit). Target is advancing in the open: operative gets an extra shot at -5.',
    'Point-blank sneak attack: target has no defense, damage is rolled with Advantage.'
  ],
  tags: ['edge', 'aiming', 'flanking', 'advancing target', 'retreating target', 'high ground', 'prone', 'braced', 'charge', 'evasive', 'feint', 'sneak attack']
});

addMechanic({
  id: 'mech-combat-damage-calculation',
  title: 'Combat Damage & Armor DR Absorption',
  category: 'combat',
  citation: 'docs/game rules/operator/3.00 COMBAT.md § Damage & Health',
  summary: 'Total Damage = (Weapon Dice + Ability Mod + Precision/Skill) - (Target Armor DR + Target CON Mod). Force damage ignores half DR.',
  mechanic_formula: 'Total Damage = (Weapon Dice + Ability Mod + Precision/Skill Bonuses) - (Target Armor DR + Target CON Mod)',
  rules_text: `Damage calculation in Tangent sums weapon impact, ability, and skill, mitigated by armor and constitution:
- Components:
  * Weapon Dice: Inherent damage capability of weapon.
  * Relevant Ability: STR for melee/heavy thrown; AGI for light/ranged weapons; INT/WIS/CHA for metaphysical invocations.
  * Precision Damage: Direct bonus from Combat or Focus Skill Rank, Sneak Attacks, or Vital Strikes.
  * Target Armor DR: Flat Damage Resistance of worn protective gear.
  * Target CON Mod: Target natural physical constitution reduces damage taken.
- Force Damage Subtype: Kinetic force energy that completely ignores 1/2 of Target Armor DR.
- Critical Hit (Natural 20): Doubles weapon damage dice and adds +30 to base attack score.
- Fumble (Natural 1): Subtracts 10 from base attack score; potential fumble consequences.`,
  examples: [
    'Attacker with STR +3 and Heavy Blades Rank 4 hits with a 2d8 sword. Raw damage = 2d8 (11) + 3 + 4 = 18. Target has DR 4 armor and CON +2. Total damage = 18 - (4 + 2) = 12.'
  ],
  tags: ['damage', 'armor dr', 'con mod', 'precision damage', 'force damage', 'critical hit', 'natural 20', 'fumble']
});

addMechanic({
  id: 'mech-combat-called-shots-locations',
  title: 'Called Shots & Hit Location Saving Throws',
  category: 'combat',
  citation: 'docs/game rules/operator/3.00 COMBAT.md § Locations & Called Shots',
  summary: 'Called shots target body anatomy at attack penalties. Hits force location-specific saving throws with impediment durations.',
  mechanic_formula: 'Called Shots: Torso -1, Head/Arm/Leg -2, Neck/Groin/Hand/Foot -4, Digits/Eyes -5',
  rules_text: `Called shots allow deliberate targeting of vulnerable anatomy (or roll 1d10 on critical hit):
- Head: Called Shot -2 (Neck -4, Specific eyes/ears/nose -5).
  * Location Effect: KO -> Reason Save vs Damage done. Failure = Stunned for 1+ rounds; failure by 10+ = Unconscious.
- Torso: Called Shot -1 (Chest -2, Abdomen -2, Groin/Pelvis -4).
  * Location Effect: Winded -> Fortitude Save vs Damage done. Failure = cumulative -2 on actions for 1+ rounds; failure by 10+ = Gasping / Incapacitated.
- Arms: Called Shot -2 (Upper Arm -3, Forearm -3, Hand -4, Digits -5).
  * Location Effect: Disarmed -> Reflex Save vs Damage done. Failure = drop held item; failure by 10+ = Arm Crippled / Non-Functional.
- Legs: Called Shot -2 (Thigh -3, Shin -3, Foot -4, Digits -5).
  * Location Effect: Hobbled -> Might Save vs Damage done. Failure = 1/2 speed for 1+ rounds; failure by 10+ = Leg Crippled / Non-Functional.
- Specialized (Tentacles / Wings / Fins): Called Shot -2 (full size), -3 (half size), -4 (hand size).
- Duration of Impediment: Exactly 1 round per point under the save CR (based directly on the damage done).`,
  examples: [
    'A called shot to the Head deals 14 damage. Target must make a Reason Save vs CR 14. If target rolls 11 (3 under), target is Stunned for 3 rounds.'
  ],
  tags: ['called shots', 'head', 'torso', 'arms', 'legs', 'hit location', 'reason save', 'fortitude save', 'reflex save', 'might save', 'stunned', 'winded', 'disarmed', 'hobbled']
});

addMechanic({
  id: 'mech-combat-disabled-destroyed-thresholds',
  title: 'Limb Damage: Disabled (1/3 Health) & Destroyed (2/3 Health)',
  category: 'combat',
  citation: 'docs/game rules/operator/3.00 COMBAT.md § Limb Damage & Critical Injuries',
  summary: 'Taking 1/3 of Health in damage disables a limb (or causes unconsciousness if Head). Taking 2/3 of Health destroys it.',
  mechanic_formula: 'Disabled = Damage >= 1/3 Health (Sta Check DC 10 + damage to use) | Destroyed = Damage >= 2/3 Health',
  rules_text: `Specific body locations have distinct structural thresholds:
- Disabled (1/3rd Health):
  * Taking 1/3rd of the Health score in damage to a limb disables it (or Unconsciousness if Head).
  * Stamina Check with CR of 10 + damage taken to keep using it.
  * Penalties: -4 on all actions for Head, -4 STR and Agility for Arm, Half Ground Speed and no Rush maneuver for Leg.
  * Medical attention or metaphysics required to heal properly.
- Destroyed (2/3rds Health):
  * Taking 2/3rds of Health to an area mangles or severs it beyond ANY further use (Brain Death if Head).
- Synthetic Limbs:
  * Synthetic limbs take 50% more damage before being Disabled or Destroyed compared to biological limbs, but do not receive a Stamina check to stay functional once Disabled.`,
  examples: [
    'A character with 30 Health takes 10 damage to an arm (1/3 of 30). The arm is Disabled (-4 STR/AGI) unless a Stamina check vs CR 20 (10 + 10) succeeds.',
    'A synthetic arm with 15 damage threshold withstands 15 damage (50% more than biological 10).'
  ],
  tags: ['disabled', 'destroyed', '1/3 health', '2/3 health', 'limb damage', 'synthetic limbs', 'brain death']
});

addMechanic({
  id: 'mech-combat-mortality-state',
  title: 'The Mortality State (0 HP) & Stability Points',
  category: 'combat',
  citation: 'docs/game rules/operator/3.00 COMBAT.md § The Mortality State',
  summary: 'At 0 HP, characters become Incapacitated and suffer 1 Stability Damage per turn (Bleeding Out). Death occurs when Stability Points (CON + 5) reach 0.',
  mechanic_formula: 'Stability Points = CON Score + 5 | Bleedout Rate = 1 Stability Damage/turn | Stabilization = Medicine DC 15',
  rules_text: `When Health Points reach 0, characters enter the Mortality State:
- Unconscious and Incapacitated: Character falls Prone and is Incapacitated immediately.
- Bleeding Out: At the beginning of their turn, the character suffers 1 point of Stability Damage.
- Stability Threshold: Character has Stability Points equal to Constitution Score + 5.
- Death: When Stability Points reach 0, the character is clinically dead.
- Stabilization: Character stops Bleeding Out if they receive metaphysical healing or a successful Medicine Check (DC 15).`,
  examples: [
    'An operative with CON +3 drops to 0 HP. They have 8 Stability Points (3 + 5). Each round they lose 1 point. After 8 rounds without medical aid (DC 15), death occurs.'
  ],
  tags: ['mortality state', '0 hp', 'incapacitated', 'bleeding out', 'stability points', 'con + 5', 'stabilization', 'medicine dc 15']
});

/* =========================================================================
   2. SCALING SYSTEM (1.10 SCALING.MD)
   ========================================================================= */

addMechanic({
  id: 'mech-scaling-14-tiers',
  title: '14 Size Categories & Scaling Multipliers',
  category: 'scaling',
  citation: 'docs/game rules/operator/1.10 SCALING.md § Size Categories',
  summary: 'Objects and creatures scale across 14 size tiers (Miniscule to Mega Colossal) multiplying weapon dice, SP, speed, range, and starship blast radius.',
  mechanic_formula: 'Multiplier applies to Weapon Dice, Structure Points, Speed, and Ranges (Miniscule -5ds to Mega Colossal x320)',
  rules_text: `Size categories dramatically alter physical impact, damage capacity, and dimensional ranges:
- Size Hierarchy:
  1. Miniscule (< 1 in, < 1 oz): Scaling -5ds (1/12), STR -32, Combat +32, Stealth +20, Reach 1 in.
  2. Fine (< 6 in, < 1/8 lb): Scaling -4ds (1/6), STR -16, Combat +16, Stealth +16, Reach 6 in.
  3. Diminutive (< 1 ft, < 1 lb): Scaling -3ds (1/3), STR -8, Combat +8, Stealth +12, Reach 1 ft.
  4. Tiny (< 2 ft, < 8 lbs): Scaling -2ds (1/2), STR -4, Combat +4, Stealth +8, Reach 2 ft.
  5. Small (< 4 ft, < 60 lbs): Scaling -1ds (2/3), STR -2, Combat +2, Stealth +4, Reach 3 ft.
  6. Medium (< 8 ft, < 500 lbs): Scaling Base (x1), STR +/-0, Combat +/-0, Stealth +/-0, Reach 5 ft.
  7. Large (< 16 ft, < 2 tons): Scaling x2, STR +2, Combat -2, Stealth -4, Reach 10 ft.
  8. Huge (< 32 ft, < 16 tons): Scaling x5, STR +4, Combat -4, Stealth -8, Reach 15 ft.
  9. Gargantuan (< 64 ft, < 125 tons): Scaling x10, STR +8, Combat -8, Stealth -16, Reach 20 ft.
  10. Colossal (< 128 ft, < 1K tons): Scaling x20, STR +16, Combat -16, Stealth -32, Reach 25 ft.
  11. Enormous (< 512 ft, < 16K tons): Scaling x40, STR +32, Combat -32, Stealth NO.
  12. Titanic (< 1,024 ft, < 144K tons): Scaling x80, STR +64, Combat -64, Stealth NO.
  13. Super Gargantuan (< 5,280 ft, < 50M tons): Scaling x160, STR +128, Combat -128, Stealth NO.
  14. Mega Colossal (1 Mile+, 50M+ tons): Scaling x320, STR +256, Combat -256, Stealth NO.
- Multiplier Scope: Multipliers apply to Weapon Dice, Structure Points (SP), Movement Speed, and Ranges.
- Starship Proximity Damage (Enormous+): Overwhelming attacks vaporize direct targets and deal 1/10 Indirect Damage to targets within half the attacker STR Modifier in feet.
- Meta-Tech Chassis Multiplier: Final Invocation Dice = Base Damage Dice * Chassis Scale Multiplier.`,
  examples: [
    'A Huge mech (x5 Scaling) with a 2d10 cannon deals 10d10 base weapon damage with 5x speed and range.',
    'A Titanic capital ship (STR +64) firing deals 1/10 indirect damage to a 32ft blast radius.'
  ],
  tags: ['scaling', 'size categories', 'miniscule', 'mega colossal', 'multipliers', 'proximity damage', 'meta-tech scaling']
});

/* =========================================================================
   3. ECONOMATRIX: TANGENT STANDARD CURVE (2.00 ECONOMATRIX.MD)
   ========================================================================= */

addMechanic({
  id: 'mech-economatrix-standard-curve',
  title: 'Tangent Standard Curve (TSC) & Wealth Score',
  category: 'economatrix',
  citation: 'docs/game rules/operator/2.00 ECONOMATRIX.md § Theoretical Framework',
  summary: 'Item value quadruples every +5 DC increment: Value = 10 * 4^(DC / 5). Purchase DC equals Crafting DC.',
  mechanic_formula: 'Value = 10 * 4^(DC / 5) | Purchase DC = Crafting DC <= Wealth Score',
  rules_text: `The Tangent Economic Matrix establishes that Complexity Determines Value:
- Tangent Standard Curve (TSC): Value = 10 * 4^(DC / 5).
  * Base good at DC 0 costs 10 Credits.
  * DC 5: 40 Credits.
  * DC 10: 160 Credits.
  * DC 15 (Standard Ballistic Rifle): 640 Credits.
  * DC 20 (Plasma Rifle): 2,560 Credits.
  * DC 25: 10,240 Credits.
- The Golden Rule of Tangent Wealth: Purchase DC = Crafting DC.
  * A character may automatically purchase any item with a Crafting DC equal to or less than their Wealth Score without depleting liquid credits or reducing their Wealth Score.
- 7 Crafting Timetable Tiers: Tier 1 (1 hr), Tier 2 (8 hrs), Tier 3 (1-3 days), Tier 4 (1-2 wks), Tier 5 (1 mo), Tier 6 (6 mos), Tier 7 (Years/Megastructure).`,
  examples: [
    'An operative with Wealth Score 16 can automatically requisition any standard gear with Crafting DC 16 or below without spending cash.'
  ],
  tags: ['economatrix', 'tsc', 'tangent standard curve', 'crafting dc', 'wealth score', 'value', 'credits']
});

/* =========================================================================
   4. METAPHYSICS: TRIAD & CASTING FORMULA (4.00 METAPHYSICS.MD)
   ========================================================================= */

addMechanic({
  id: 'mech-metaphysics-triad-casting',
  title: 'Metaphysics Triad & Take-10 Invocation Casting',
  category: 'metaphysics',
  citation: 'docs/game rules/operator/4.00 METAPHYSICS.md § Core Mechanics',
  summary: 'Metaphysics operates on Attune, Discipline, and Invocation. Potency = Key Ability + Discipline Skill + Invocation Level + 10 (or d20).',
  mechanic_formula: 'Potency = Key Ability + Discipline Skill Level + Invocation Level + 10 (or d20) | Strain = 1 Non-Lethal / 5 pts under DC',
  rules_text: `Reality manipulation operates on a distinct mechanical triad:
- Attune Skill: General energy channeling skill. Sets the Difficulty Class of Resistance or Attack check.
- Discipline Skill: Manipulates patterns; sets Severity and Damage.
- Invocations: Codified muscle memory. Users "Take 10" by default on Discipline checks for operational safety.
- Source Key Ability:
  * Intelligence: Psychic, Arcane, Akashic.
  * Wisdom: Divine, Nature, Cosmic.
  * Charisma: Bardic, Hereditary, Granted.
- Metafocus Levels (ML): ML 0 Null to ML 6 Deific (ML 6 NPC only). Starting character max Discipline skill = 2 * ML.
- Internalized Strain: Failing a casting check deals 1 point of Non-Lethal Damage per 5 points of failure (bypasses Stamina and Armor).`,
  examples: [
    'An arcanist with INT +3, Telekinesis Skill 4, and Kinetic Lance Level 2 casts with Take 10 default: Potency = 3 + 4 + 2 + 10 = 19.'
  ],
  tags: ['metaphysics', 'attune', 'discipline', 'invocation', 'take 10', 'internalized strain', 'ml', 'key ability']
});

/* =========================================================================
   5. CHARACTER CREATION: 150 CP BUDGET & ATTRIBUTES (1.01)
   ========================================================================= */

addMechanic({
  id: 'mech-character-150cp-creation',
  title: '150 Character Points & Foundational Backgrounds',
  category: 'character_creation',
  citation: 'docs/game rules/operator/1.01 CHARACTER CREATION.md § Character Points',
  summary: 'Characters start with 150 CP (Character Points). Faction, Origin, and Occupation grant 60 skill ranks, 4 features, and 4 traits for free.',
  mechanic_formula: 'Total Budget = 150 CP | Attributes: 5 CP per +1 (Soft cap +4) | Skills: 1 CP/rank | Features: 3 CP base',
  rules_text: `Operative creation is governed by strict mathematical allocation:
- 150 Character Points (CP) starting budget.
- 6 Core Attributes: STR, AGI, STA, INT, WIS, CHA. Starting base 0, cost 5 CP per +1, soft cap +4 at creation.
- Skills: Cost 1 CP per rank at creation.
- Features: Base cost 3 CP (minimum 1 CP).
- Foundational Backgrounds (Faction, Origin, Occupation): Free (0 CP). In total, they grant 60 skill ranks (20 Faction + 20 Origin + 20 Occupation), 4 features, and 4 traits.
- Award Points (AP): Experience points awarded during play, spent 1-for-1 like CP ($1\\text{ AP} = 1\\text{ CP}$) to advance the character.`,
  examples: [
    'Operative invests 45 CP into attributes (+3 STR, +3 AGI, +3 STA), 20 CP into extra skills, 12 CP into 4 features, and spends 60 background skill ranks from Faction, Origin, and Career.'
  ],
  tags: ['150 cp', 'character creation', 'character points', 'award points', 'attributes', 'skills', 'features', 'backgrounds']
});

/* =========================================================================
   6. MODULAR COMPANIONS: COMPANION FEATURE UNLOCK & 40 CP ARCHITECTURE
   ========================================================================= */

addMechanic({
  id: 'mech-companion-40cp-formula',
  title: 'Companion Feature Unlock & Modular 40 CP Architecture',
  category: 'companions',
  citation: 'docs/game rules/architect/99. MODULAR COMPANION MATRIX.md § Acquisition & Construction',
  summary: 'Companions must be unlocked by purchasing the COMPANION feature (3 CP, Cha 1). May purchase multiple times for additional cohorts or +10 CP build budget.',
  mechanic_formula: 'Companion Feature = 3 CP (Cha 1) | Cohort Budget = Form (15 CP) + Function (25 CP) = 40 CP Base | +10 CP per Rank above Rank 1',
  rules_text: `Access and construction of loyal cohorts follow strict modular rules:
- Unlocking the Companion Feature:
  * Just as Metaphysics requires the Awakened feature and Augmentations require the Augmented feature, access to Companions must be unlocked by purchasing the Companion feature (3 CP, Prerequisite: Charisma 1).
  * Ranked & Multiple: Taking this feature again allows either purchasing an additional 40 CP companion OR granting +10 CP to an existing companion's build budget (Rank 1: 40 CP, Rank 2: 50 CP, Rank 3: 60 CP, etc.).
- Modular Construction Matrix:
  * Form Package: 15 CP (Anatomy, size, speed, base vitals).
  * Function Package: 25 CP (Role, attribute bonuses, skills, protocols).
  * Base Companion: 40 CP total at Rank 1.
- Chassis Typologies:
  * Biological: Uses Vitality + Health. Recovers via natural sleep and Medicine.
  * Synthetic: Uses Structure Points (SP = VP + HP). Zero Vitality. Immune to non-lethal damage, poison, disease, fatigue. Requires Engineering repair.
  * Metaphysical: Uses Essence as health. Grappling immunity if incorporeal. Attunement recovery.`,
  examples: [
    'Operative purchases Companion feature (3 CP), assembling a 40 CP Biological War Hound: Predator Form (15 CP) + Guardian Function (25 CP).',
    'Operative purchases Companion feature a 2nd time: chooses to unlock a 2nd companion (a 40 CP Sky-Eye Recon Drone) or upgrade the War Hound to Rank 2 (50 CP budget).'
  ],
  tags: ['companions', 'companion feature', 'unlock', '40 cp', 'form package', 'function package', 'chassis', 'biological', 'synthetic', 'metaphysical']
});

/* =========================================================================
   OUTPUT GENERATION
   ========================================================================= */

console.log(`Compiled ${mechanics.length} authoritative Tangent SF RP BASTION Mechanics rules.`);

// Ensure directories exist
const dataDir = path.dirname(DATA_JS_PATH);
const jsonDir = path.dirname(JSON_OUTPUT_PATH);

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });

// Write JSON Seed file for Codex / Firestore ingestion
fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(mechanics, null, 2), 'utf-8');
console.log(`Saved JSON mechanics rules to: ${JSON_OUTPUT_PATH}`);

// Write JavaScript ESM export
const jsContent = `/**
 * @file mechanicsData.js
 * @description 100% CANONICAL Tangent SF RP BASTION Mechanics Rules Dataset
 * Strictly grounded in: docs/game rules/operator/ (3.00 COMBAT.md, 1.00, 1.01, 1.10, 2.00, 4.00)
 * and docs/game rules/architect/
 * Total Rules: ${mechanics.length}
 */

export const BASTION_MECHANICS_DATASET = ${JSON.stringify(mechanics, null, 2)};

export default BASTION_MECHANICS_DATASET;
`;

fs.writeFileSync(DATA_JS_PATH, jsContent, 'utf-8');
console.log(`Saved ESM mechanics bundle to: ${DATA_JS_PATH}`);
