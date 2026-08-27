import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('.');
const rulesDir = path.join(projectRoot, 'src/data/omnicortex/rules');
const disciplinesDir = path.join(projectRoot, 'src/data/omnicortex/disciplines');
const skillsDir = path.join(projectRoot, 'src/data/omnicortex/skills');

const standardCostsAndSockets = `costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
modifiers: []
modifications: []
critical_details:
  score: ''
  effect: []
  success_effect: []
  failure_effect: []
sockets:
  max: 0
  used: 0
  tier: Socket
  allocated: []`;

// ─────────────────────────────────────────────────────────────────────────────
// 1. RULE: rule-metafocus-levels.md
// ─────────────────────────────────────────────────────────────────────────────
const ruleMetafocusLevels = `---
id: rule-metafocus-levels
name: 'Metafocus Level (ML 0–6) & Skill Caps'
category: rules
description: >-
  Prevalence of Metaphysics in civilizations, starting maximum discipline skill rank calculation (ML * 2), and Attune exemption.
${standardCostsAndSockets}
---

# Metafocus Level (ML 0–6) & Skill Caps

**Category**: Core Metaphysics & Civilization Rules  

Comparable to the Technological Level (TL) of a society, the **Metafocus Level (ML)** determines the prominence, legality, and cultural saturation of Metaphysics within a civilization or demographic.

---

## 1. Metafocus Level Classifications

| ML | Classification | Description | Typical Examples | Max Discipline Rank |
| :---: | :--- | :--- | :--- | :---: |
| **0** | **Null** | No native Meta users. Physical laws strictly rigid. | None | **Rank 0** |
| **1** | **Rare** | Negligible ratio of Meta Users; likely to be harshly judged, feared, or highly expected of. | Skeptical societies / Most frontier races | **Rank 2** |
| **2** | **Selective** | More ‘in tune’ people but in minorities or reclusive. Early stage of Enlightenment. | Special Ops, Esoteric Cults, Enclaves | **Rank 4** |
| **3** | **Cultured** | Uncommon but accepted Meta Usage (Adepts of various types). Awakened as a recommended feature of the species. | Aulurans, Dracon Dynasty, Impyrium | **Rank 6** |
| **4** | **Standardized** | Common Meta Usage; used by many and evident in daily society. Awakened as a granted feature of the species. | Alterians, Impyrium Regi, Psion | **Rank 8** |
| **5** | **Advanced** | Very Common Meta Usage; prominent usage by everyone in communication and infrastructure. | Mondi, Shar Knor | **Rank 10** |
| **6** | **Deific** | Transcended; casually affecting reality. **NOT AVAILABLE TO PCs**. | Progenitor types / Cosmic Architects | **Unlimited (NPC Only)** |

---

## 2. Starting Skill Cap Formula

Double the planetary or background ML to determine a starting character’s maximum level in Metafocus Discipline Skills:

$$\\text{Max Starting Discipline Rank} = \\text{ML} \\times 2$$

> [!IMPORTANT]
> **Attune Exemption**: The **Attune** skill is the conduit through which all metaphysics flows and is **not limited by ML**. A character from an ML 1 society may cultivate a high Attune rank even while their specific Discipline ranks remain capped at 2.
`;

// ─────────────────────────────────────────────────────────────────────────────
// 2. RULE: rule-metaphysics-essence-economy.md
// ─────────────────────────────────────────────────────────────────────────────
const ruleEssenceEconomy = `---
id: rule-metaphysics-essence-economy
name: 'Essence Pool Economy, Costs & The Burn'
category: rules
description: >-
  The comprehensive Essence Pool calculation (Substrate + Conduit + Breadth),
  Base DC cost scale, Sanctum bonus, Combat tax, and The Burn life-force channeling.
${standardCostsAndSockets}
---

# Essence Pool Economy, Costs & The Burn

**Category**: Core Metaphysics & Resource Management Rules  

A character’s total Essence capacity represents their comprehensive "lodestar"—the intersection of biological/synthetic substrate, channeling precision, and breadth of metaphysical study.

---

## 1. The Essence Pool Calculation Formula

$$\\text{Essence Pool} = (\\text{Sum of all 6 Ability Scores}) + (\\text{Attune Skill Rank}) + (\\text{Total Ranks in all known Discipline Skills})$$

### Components of the Pool:
1. **The Ability Substrate (Sum of all 6 Ability Scores)**:
   - Since the average human ability score is zero, the pool begins with the character's natural or engineered aptitudes.
   - Physical attributes (*Strength, Agility, Stamina*) contribute to the physical "containment" and grounding of raw energy.
   - Mental attributes (*Intellect, Wisdom, Charisma*) determine the "flavor," depth, and resonance of the source.
   - *Permanent modifications* (augmentations, permanent injury, experience advances) adjust the Essence total, but temporary adjustments do not.
2. **The Conduit (Attune Skill Rank)**:
   - Adding the Attune rank ensures that as a character becomes more precise in opening conduits to their power source, their capacity to hold and regulate that energy expands.
   - Only permanent modifications to Attune adjust the Essence score.
3. **The Breadth (Total Ranks in all known Discipline Skills)**:
   - Total ranks from skills in all known Disciplines (*e.g., Energy, Matter, Entropy*) represent the character's cumulative understanding of reality's "Code."
   - **Ranks in Invocations do NOT count towards the Essence total**; only the ranks from the 12 core skills listed under each discipline are counted (*such as Elemental and Force under Energy, but not specific Invocations like Plasma Blast or Kinetic Barrier*).

---

## 2. The Essence Cost Scale

The metabolic or spiritual cost of an invocation is determined by the **Base DC** required to activate the effect based on the current environment and stress levels:

| Difficulty | Base DC | Essence Cost | Environmental Context |
| :--- | :---: | :---: | :--- |
| **Very Easy** | **DC 5** | **0 Essence** | Safe areas, Sanctums, Libraries, Laboratories. |
| **Easy** | **DC 10** | **0 Essence** | Casual travel, walking, non-hostile environments. |
| **Average** | **DC 15** | **1 Essence** | Combat, vigorous movement, active hostility. |
| **Difficult** | **DC 20** | **2 Essence** | Extreme activity, uncontrolled falls, crashing. |
| **Very Difficult** | **DC 25** | **3 Essence** | High-intensity chaos, environmental catastrophes. |
| **Nearly Impossible** | **DC 30** | **4 Essence** | Legendary feats, global reality shifts. |
| **Miraculous** | **DC 35** | **5 Essence** | Progenitor-tier interactions (rarely for PCs). |

---

## 3. Strategic Economy & Volatility

### Operational Safety (Codified Invocations)
- **The "Sanctum" Bonus**: Performing a learned ritual in a laboratory or sanctum (DC 5) costs **0 Essence**, as familiarity and environmental stability minimize the toll on internal reserves.
- **The Combat Tax**: Using the exact same invocation in a firefight (DC 15) imposes an immediate **1 Essence** cost to stabilize the conduit amidst battlefield chaos.

### Free-Casting & Volatility
- Free-Casting (spontaneous metaphysics) remains high-risk: attempting a spontaneous effect in a Difficult environment (DC 20) consumes **2 Essence upfront**.
- **Failure and Feedback**: If the check fails, the Essence is consumed, and the caster suffers **Internalized Strain** (1 point of Non-Lethal damage per 5 points of failure; 1d6 per 5 points under high volatility).
- **Energy Surges**: If an Attune result is **0 or less**, the Essence cost for that increment is **doubled** as the reservoir leaks uncontrollably into the local environment.

### Scaling for Higher Tiers
- Extreme ranges (Miles+) or large area geometries (Cones, Lines) push the casting DC into the 25–30+ bracket, requiring a well-developed Essence pool.

---

## 4. Essence Recovery & The Burn

- **Light Rest**: Recovers Essence equal to the character's **Key Ability Modifier (minimum 1)** per hour of downtime.
- **Full Rest (6–8 Hours)**: Fully restores the entire Essence Pool as body and mind realign with the universal constant.
- **The Burn (Life-Force Channeling)**: If an operative's Essence Pool is empty, they may choose to "burn" their own life force to power an invocation. Each point of Essence needed deals **2 points of direct Health damage** (cannot be absorbed by Armor DR or Stamina), representing physical cellular breakdown as the body acts as an unshielded conduit.
`;

// ─────────────────────────────────────────────────────────────────────────────
// 3. RULE: rule-metaphysics-casting-checks.md
// ─────────────────────────────────────────────────────────────────────────────
const ruleCastingChecks = `---
id: rule-metaphysics-casting-checks
name: 'Metaphysic Checks, Difficulty & Critical Outcomes'
category: rules
description: >-
  Base DCs (5–35), Free-Casting vs Codified Invocations, Take 10 operational safety,
  Critical Success (+30), Critical Mistake (-10), Energy Surge, Fizzle, and Strain.
${standardCostsAndSockets}
---

# Metaphysic Checks, Difficulty & Critical Outcomes

**Category**: Core Metaphysics & Adjudication Rules  

Metaphysical actions are resolved through the distinct interplay of the **Attune Check** (drawing and targeting energy) and the **Discipline Check** (shaping severity, magnitude, and damage).

---

## 1. Free-Casting vs. Codified Invocations

### Free-Casting (Spontaneous)
- Involves narrating an improvised effect within the thematic sphere of the character's active Discipline.
- **Process**:
  1. Make an **Attune check** to draw and channel energy (sets resistance DC or attack roll).
  2. Make a **Discipline check** to determine severity, magnitude, and area.
- **Risks**: High volatility; Essence is consumed upfront, and failures inflict Internalized Strain.

### Invocations (Codified)
- Represents perfected, rote muscle memory etched into neural pathways.
- **Bonus**: Invocation Levels are added directly to the Discipline Skill checks they are based on *(Invocations are considered Discipline Specializations)*.
- **Operational Safety**: The user effectively **"Takes 10"** by default on the Discipline check:
  $$\\text{Default Potency} = \\text{Key Ability Mod} + \\text{Discipline Skill Level} + \\text{Invocation Level} + 10$$
- A roll (using $d20$ instead of 10) may still be voluntarily attempted if a higher result is desired.

---

## 2. Metaphysic Checks & Difficulty Scale

Base DC for activating a Metafocus Discipline or Invocation:
- **Very Easy (DC 5)**: Safe Quiet Area, Sanctum, Laboratory, Library. (0 Essence)
- **Easy (DC 10)**: Casual, Non-Hostile Environment, Walking, Passenger in Vehicle. (0 Essence)
- **Average (DC 15)**: Very Active or Hostile Environment, Vigorous Movement, Combat. (1 Essence)
- **Difficult (DC 20)**: Extreme Activity, Crashing, Uncontrolled Fall. (2 Essence)
- **Very Difficult (DC 25)**: High-Intensity Chaos, Environmental Catastrophes. (3 Essence)
- **Nearly Impossible (DC 30)**: Legendary Feats, Global Reality Shifts. (4 Essence)
- **Miraculous (DC 35)**: Progenitor-tier interactions (rarely for PCs). (5 Essence)

---

## 3. Criticals, Surges & Failures

| Outcome | Trigger / Condition | Mechanical Effect |
| :--- | :--- | :--- |
| **Critical Success** | Natural 20 / Double 10s | **+30 bonus to the check** and a dramatic, transcendent improvement of the effect. |
| **Critical Mistake** | Natural 1 / Double 1s | **-10 penalty to the check** and a disastrous metaphysical backfire (GM's call). |
| **Energy Surge** | Attune Check $\\le 0$ | Uncontrolled energy surge (wrong target, collateral area, unintended consequence); **Essence cost is doubled**. |
| **Fizzle / Transposition** | Discipline Check $\\le 0$ | Effect produces unintended results, ranging from a dramatic fizzle to transposed energy states. |
| **Internalized Strain** | Check Failure | Inflicts **1 point of Non-Lethal Damage per 5 points of failure** (1d6 per 5 in free-casting). Cannot be soaked by Armor DR or Stamina. |
| **Fumble** | Severe Fumble | Requires an immediate check to see if the caster suffers the full effect themselves. |
`;

// ─────────────────────────────────────────────────────────────────────────────
// 4. RULE: rule-metaphysics-ranges-areas.md
// ─────────────────────────────────────────────────────────────────────────────
const ruleRangesAreas = `---
id: rule-metaphysics-ranges-areas
name: 'Metaphysic Ranges, Modifiers & Area Geometry'
category: rules
description: >-
  Range brackets and check modifiers (Melee to Extended), multiple targeting penalties,
  and Area of Effect geometries (Blast, Line, Cone).
${standardCostsAndSockets}
---

# Metaphysic Ranges, Modifiers & Area Geometry

**Category**: Core Metaphysics & Tactical Combat Rules  

Manifesting metaphysical phenomena over greater distances or across broader spatial volumes increases cognitive strain and requires check adjustments.

---

## 1. Ranges & Check Modifiers

| Range Bracket | Distance Bracket | Check Modifier | Operational Notes |
| :--- | :--- | :---: | :--- |
| **Melee / Point Blank** | 5 ft (Small/Medium reach) | **+5 to Check** | Intimate conduit connection provides maximum stability. |
| **Close** | Up to 100 ft | **None (0)** | Standard engagement distance. |
| **Medium** | Up to 500 ft | **-5 to Check** | Requires focused line-of-sight. |
| **Long** | Up to 2,500 ft | **-10 to Check** | Atmospheric dissipation and sensory refraction apply. |
| **Extended** | Miles+ | **-15 to Check** | Target or location must be accurately detected, mapped, or known well. |

---

## 2. Targeting & Area Effects

### Multiple Targets
- **Separate Targets**: Imposes a **-5 penalty to the Attune check per additional target**, granting full effect and damage to each target.
- **Split Effect**: If the penalty is not applied, total damage and effects must be divided equally among all targets.

### Area Effects (AoE Penalties to Focus Skill Check)
- **Blast (10 ft radius sphere)**: **-5 to Focus Skill check**. Detonates at target point, bypassing directional cover.
- **Line (5 ft wide x 60 ft long)**: **-10 to Focus Skill check**. Pierces along an unwavering straight trajectory.
- **Cone (90 ft long x 45 ft wide)**: **-15 to Focus Skill check**. Expanding wave originating from the caster.
`;

// ─────────────────────────────────────────────────────────────────────────────
// 5. RULE: rule-meta-combat-countering.md
// ─────────────────────────────────────────────────────────────────────────────
const ruleMetaCombatCountering = `---
id: rule-meta-combat-countering
name: 'Meta Combat & Counter Effects'
category: rules
description: >-
  Attune attack rolls vs defense, and the two-step Opposed Counter Effect resolution.
${standardCostsAndSockets}
---

# Meta Combat & Counter Effects

**Category**: Core Metaphysics & Combat Rules  

Combat involving metaphysical manifestations follows precise attack and counter-nullification protocols.

---

## 1. The Attack Roll
- **Attack Check**: **Attune** is used for the Attack Roll:
  $$\\text{Meta Attack Roll} = d20 + \\text{Attune Rank} + \\text{Key Ability Mod} + \\text{Situational Modifiers}$$
- **Target Defense**: The defender opposes the attack using standard combat defenses (Reflex / Evasion / Will / Fortitude depending on whether the effect is a projectile, psychic blast, or bio-curse).
- **Potency Resolution**: Damage, range, and secondary conditions are determined by the active Metafocus Skill and Invocation.

---

## 2. Counter Effect (Nullifying Incoming Invocations)
A defender with metaphysical awareness may actively attempt to unravel and counter an incoming effect before it manifests:

\`\`\`
+-------------------------------------------------------------------------+
|                       TWO-STEP COUNTER EFFECT FLOW                      |
+-------------------------------------------------------------------------+
| STEP 1: OPPOSED ATTUNE CHECK                                            |
| Both Attacker and Defender make an Attune check.                         |
| -> Defender must exceed the Attacker's result to seize the conduit.     |
+-------------------------------------------------------------------------+
| STEP 2: OPPOSED METAFOCUS SKILL CHECK                                   |
| If Defender succeeds in Step 1, both roll their relevant Discipline.    |
| -> Attacker Wins: Effect resolves normally.                             |
| -> Defender Wins: Effect is completely countered and nullified.         |
+-------------------------------------------------------------------------+
\`\`\`

### Resolution Rules:
- **Defender Wins Opposed Skill Check**: The incoming invocation collapses into harmonic static; zero damage or effects occur.
- **Attacker Wins Opposed Skill Check**: The counter attempt fails to disrupt the weave; the invocation resolves with full potency.
`;

// ─────────────────────────────────────────────────────────────────────────────
// 6. RULE: rule-composite-invocations.md
// ─────────────────────────────────────────────────────────────────────────────
const ruleCompositeInvocations = `---
id: rule-composite-invocations
name: 'Composite Invocations: The Synthesis of Disciplines'
category: rules
description: >-
  Rules for multi-discipline synthesized invocations, lowest skill ranking rule,
  and the five canonical composite archetypes.
${standardCostsAndSockets}
---

# Composite Invocations: The Synthesis of Disciplines

**Category**: Advanced Metaphysics Rules  

Composite Invocations represent advanced metaphysical synthesis where two or more fundamental spheres of reality manipulation are interwoven into a singular, cohesive phenomenon.

---

## 1. The Synthesis Rule

Composite Invocations require ranks in multiple Disciplines.

> [!IMPORTANT]
> **The Lowest Skill Rule**: The **Invocation Level is added to the *lowest* of the requisite Discipline Skills used**.  
> *For example, an Arcanist casting Machine Spirit with Mental 8 and Energy 4 adds their Invocation Level to their Energy skill (4).*

---

## 2. Canonical Synthesis Archetypes

| Synthesis School | Disciplines Combined | Canonical Invocations | Manifestation Description |
| :--- | :---: | :--- | :--- |
| **Magitech & Cybermancy** | **Mental + Energy** | *Machine Spirit* (Interface), *Construct Intelligence* (AI) | Direct neural bridging into silicon matrices, manipulating machine spirits and electric computing fields. |
| **Biostasis & Time Warping**| **Entropy + Dimension**| *Temporal Stasis* (Freeze time), *Accelerated Decay* (Rapid aging) | Interweaving spatial anchors with entropic decay vectors to freeze local chronometers or accelerate biological aging. |
| **Elemental Constructs** | **Matter + Energy** | *Living Spell* (Minion), *Plasma Forging* (Energy weapons) | Binding thermodynamic plasma into solid crystal lattice structures or animated autonomous entities. |
| **Spatial Illusions** | **Illusion + Dimension**| *Labyrinth* (Infinite maze), *Shadow Step Assault* (Teleport attacks) | Bending light and space simultaneously to create non-Euclidean infinite mazes and phase-stepping strikes. |
| **Biomancy** | **Matter + Entropy** | *Life Transfer* (Drain/Heal), *Flesh Crafting* (Reshaping) | Restructuring organic cellular matter, reshaping bone and tissue, and siphoning biological life force. |
`;

// ─────────────────────────────────────────────────────────────────────────────
// 7. RULE: rule-meta-sensory-manifestations.md
// ─────────────────────────────────────────────────────────────────────────────
const ruleSensoryManifestations = `---
id: rule-meta-sensory-manifestations
name: 'Codex: Meta-Sensory Manifestations & Colorations'
category: rules
description: >-
  Visuals, audio, texture guidelines for Psychic (Mind), Magic (Weave), and Divine (Will)
  manifestations, and the full Discipline-Specific Colorations table.
${standardCostsAndSockets}
---

# Codex: Meta-Sensory Manifestations & Colorations

**Category**: Metaphysics Aesthetics & Visual Semiotics  

In the Tangent Universe, the "Meta" is not a single uniform force. It is shaped by the mind, philosophy, and culture of the wielder. A *Thermal Lance* cast by a Mekan logic-priest looks fundamentally different from one cast by a Draconian Sorcerer.

---

## I. Psychic Manifestations (The Mind)
*Root Disciplines: Mental, Dimension, Energy (Force)*  
Psychic power is the imposition of Will upon Reality, rewriting local probability without relying on external ritual.

### A. Controlled (Logic / Telekinetic)
- **Archetypes**: The Mekan, The Analyst, The Tactician.
- **Concept**: The mind as a computer or architect. Energy is perfectly efficient, wasted on nothing.
- **Visuals**: Defined geometrics (hexagons, fractals, grids); hard-light shields looking like laser-cut crystal.
- **Palette**: Electric Cyan (raw data), Circuitry Black (printed line negative space), Neon Orange (combat mode).
- **Sensory**: High-pitched electronic whines, server hums, glass snapping; smooth, frictionless, cold static texture.

### B. Focused (Discipline / Telepathic)
- **Archetypes**: The Impyrium Centurion, The Monk, The Judge.
- **Concept**: The mind as a lens. Power gathered and projected in a singular, overwhelming vector.
- **Visuals**: Dense, opaque lines and beams of unwavering solid color; flat planes of light.
- **Palette**: Solar White (pure), Royal Purple (gravity manipulation), Gold (auras and defensive wards).
- **Sensory**: Deep resonating thrum (like a massive bell), absolute silence; heavy, oppressive, warm texture.

### C. Wild (Empathic / Raw)
- **Archetypes**: The Wild Talent, The Mondi, The Feral Psychic.
- **Concept**: The mind as a storm. Power leaks, bleeds, and reacts to raw emotion.
- **Visuals**: Smoky transitions (watercolor bleeding into water); rapidly melting colors; heat hazes and oil-slick rainbows.
- **Palette**: Bruised Violet (raw psychic force), Magenta (intense emotional output), Pearlescent (shifting hues).
- **Sensory**: Whispering voices, static white noise, heartbeat rhythm; viscous, humid, "pins and needles" texture.

---

## II. Magic Manifestations (The Weave)
*Root Disciplines: Energy (Elemental), Matter, Illusion*  
Magic is the hacking of the universe's source code using ancient formulas, equations, or somatic rituals.

### A. Arcane (High Magic / Tech-Magic)
- **Archetypes**: The Alterian Arcanist, The Scholar, The Artificer.
- **Concept**: Magic as Science. Complex, formulaic, elegant.
- **Visuals**: Glowing equations, floating runes, silver/gold wireframe filigrees, constellation lines.
- **Palette**: Platinum Silver (neutral arcane), Sapphire Blue (information/transport), Starlight White.
- **Sensory**: Crystalline chimes, turning pages sound, resonant harmonics; sharp, metallic, ozone lightning texture.

### B. Nature (Primal / Verdant)
- **Archetypes**: The Thorn, The Auluran Shaman, The Druid.
- **Concept**: Magic as Life. It grows, consumes, and cycles.
- **Visuals**: Motes and spores of glowing pollen; bioluminescent mists; rapid spectral roots and vines.
- **Palette**: Toxic Green (acids/poisons), Amber (preservation/shielding), Sickly Yellow (decay).
- **Sensory**: Rustling leaves, snapping branches, chittering insects; humid, sticky, organic, loam smell.

### C. Void (Entropic / Eldritch)
- **Archetypes**: The Sha'Nor, The Necromancer, The Warlock.
- **Concept**: Magic as Absence. It deletes reality.
- **Visuals**: Negative space "holes" where light cannot exist; reality cracking like glass; fluid shadow smoke.
- **Palette**: Vantablack (absolute absence), Cold Grey (ash), Invisible Distortion (bending light).
- **Sensory**: Ice cracking, vacuum sucking in air, unnerving silence; freezing cold, numbing, "wrongness."

---

## III. Divine Manifestations (The Will)
*Root Disciplines: Entropy (Order/Chaos), Energy (Radiant)*  
Divine power is about commanding reality through absolute conviction and spiritual authority.

### A. Celestial (The Light / Order)
- **Archetypes**: The Ascendancy Judge, The Paladin, The Healer.
- **Concept**: Authority. The power is undeniable and overwhelming.
- **Visuals**: Descending ethereal rays; halos behind the head/hands; weightless floating debris.
- **Palette**: Burnished Gold (metallic, heavy), Blinding White, Sky Blue (restorative).
- **Sensory**: Choir-like harmonics, clear trumpet note, thunder; warm, solid, comforting texture.

### B. Infernal (The Flame / Chaos)
- **Archetypes**: The Cultist, The Destroyer, The Anarchist.
- **Concept**: Corruption. The power burns, rusts, and taints what it touches.
- **Visuals**: Shadow flame producing darkness; erratic jagged arcs; instant surface corrosion and rot.
- **Palette**: Blood Red (visceral crimson), Sulfur Yellow, Charcoal Ash.
- **Sensory**: Screaming metal, roaring fire, discordant screeching; burning heat, gritty ash, nauseating.

---

## IV. Discipline-Specific Colorations Reference Table

| Discipline | Primary Color | Secondary Color | Texture / Form |
| :--- | :--- | :--- | :--- |
| **Dimension** | Deep Indigo | Void Black | Warping, folding, portals, rifts. |
| **Energy (Fire)** | Orange/Red | White Hot | Flickering, consuming, plasma-like. |
| **Energy (Force)** | Transparent | Pale Blue | Distortion waves, solid impact walls. |
| **Energy (Elec)** | Blue/White | Violet | Jagged arcs, stroboscopic flashes. |
| **Energy (Cold)** | Glacial Blue | Frost White | Crystalline growth, mist, brittle snapping. |
| **Energy (Sonic)** | Transparent | Silver Ripples | Distortion waves, vibration blur, shattering glass. |
| **Energy (Corrosive)**| Sickly Yellow | Smoking Grey | Bubbling liquid, dissolving matter, toxic fumes. |
| **Entropy (Chaos)** | Sickly Green | Grey/Black | Rusting, decaying, mist, smoke. |
| **Entropy (Order)** | Geometric Gold | Crystal White | Perfect lattices, interlocking shields. |
| **Entropy (Healing)**| Vibrant Life Green | Soft Gold | Rapid cell growth, knitting flesh, warm pulse. |
| **Illusion** | Shimmering | Oil-Slick | Mirrored surfaces, haze, glitches. |
| **Matter** | Earth Tones | Metallic Sheen | Solidification, density, transmutation. |
| **Mental** | Pink/Magenta | Cyan | Ripples, pulses, glowing eyes. |
`;

// Write all rules
fs.writeFileSync(path.join(rulesDir, 'rule-metafocus-levels.md'), ruleMetafocusLevels, 'utf8');
fs.writeFileSync(path.join(rulesDir, 'rule-metaphysics-essence-economy.md'), ruleEssenceEconomy, 'utf8');
fs.writeFileSync(path.join(rulesDir, 'rule-metaphysics-casting-checks.md'), ruleCastingChecks, 'utf8');
fs.writeFileSync(path.join(rulesDir, 'rule-metaphysics-ranges-areas.md'), ruleRangesAreas, 'utf8');
fs.writeFileSync(path.join(rulesDir, 'rule-meta-combat-countering.md'), ruleMetaCombatCountering, 'utf8');
fs.writeFileSync(path.join(rulesDir, 'rule-composite-invocations.md'), ruleCompositeInvocations, 'utf8');
fs.writeFileSync(path.join(rulesDir, 'rule-meta-sensory-manifestations.md'), ruleSensoryManifestations, 'utf8');

console.log('Successfully wrote 7 new rule files to src/data/omnicortex/rules/');

// ─────────────────────────────────────────────────────────────────────────────
// 8. UPDATE DISCIPLINES IN src/data/omnicortex/disciplines/
// ─────────────────────────────────────────────────────────────────────────────

const disciplinesData = [
  {
    file: 'metafocus-dimension.md',
    id: 'metafocus-dimension',
    name: 'Dimension Discipline',
    skills: ['Summoning', 'Teleport'],
    primaryColor: 'Deep Indigo',
    secondaryColor: 'Void Black',
    texture: 'Warping, folding, portals, rifts.',
    desc: 'Manipulating spatial coordinates, folding space, opening wormholes, and conjuring objects or entities across dimensional boundaries.'
  },
  {
    file: 'metafocus-energy.md',
    id: 'metafocus-energy',
    name: 'Energy Discipline',
    skills: ['Elemental', 'Force'],
    primaryColor: 'Orange/Red (Fire), Transparent (Force/Sonic), Blue/White (Elec), Glacial Blue (Cold)',
    secondaryColor: 'White Hot, Pale Blue, Violet, Silver Ripples',
    texture: 'Plasma flickering, distortion waves, solid impact walls, crystalline frost, and ionized arcs.',
    desc: 'Harnessing kinetic vectors, telekinesis, hard-light force barriers, thermodynamics (pyro/cryo), electricity, and sound.'
  },
  {
    file: 'metafocus-entropy.md',
    id: 'metafocus-entropy',
    name: 'Entropy Discipline',
    skills: ['Chaos', 'Order'],
    primaryColor: 'Sickly Green (Chaos), Geometric Gold (Order), Vibrant Life Green (Healing)',
    secondaryColor: 'Grey/Black, Crystal White, Soft Gold',
    texture: 'Rusting, decaying, mist, smoke; or perfect crystal lattices and knitting cellular flesh.',
    desc: 'Governing the acceleration of decay, molecular breakdown, probability shifts, and harmonic biological restoration.'
  },
  {
    file: 'metafocus-illusion.md',
    id: 'metafocus-illusion',
    name: 'Illusion Discipline',
    skills: ['Phantasm', 'Shadow'],
    primaryColor: 'Shimmering',
    secondaryColor: 'Oil-Slick',
    texture: 'Mirrored surfaces, chromatic haze, sensor glitches, and light-bending refractive weaves.',
    desc: 'Manipulating photon refraction, sensory deception, holographic phantasms, mental glamours, and shadow weaving.'
  },
  {
    file: 'metafocus-matter.md',
    id: 'metafocus-matter',
    name: 'Matter Discipline',
    skills: ['Enhancement', 'Transmutation'],
    primaryColor: 'Earth Tones',
    secondaryColor: 'Metallic Sheen',
    texture: 'Solidification, density shifting, transmutation, and diamond lattice reinforcement.',
    desc: 'Controlling physical density, atomic crystalline bonds, elemental transmutation, and structural reinforcement.'
  },
  {
    file: 'metafocus-mental.md',
    id: 'metafocus-mental',
    name: 'Mental Discipline',
    skills: ['Projection', 'Sense'],
    primaryColor: 'Pink/Magenta',
    secondaryColor: 'Cyan',
    texture: 'Cognitive ripples, psionic pulses, telepathic threads, and glowing eyes.',
    desc: 'Direct neural interfacing, telepathic communication, remote sensory clairvoyance, and psychic will projection.'
  }
];

disciplinesData.forEach(d => {
  const content = `---
id: ${d.id}
name: ${d.name}
category: disciplines
metafocus_skills:
${d.skills.map(s => `  - ${s}`).join('\n')}
primary_color: '${d.primaryColor}'
secondary_color: '${d.secondaryColor}'
texture_form: '${d.texture}'
description: >-
  ${d.desc}
${standardCostsAndSockets}
---

# ${d.name}

**Category**: Metafocus Disciplines  
**Associated Skills**: ${d.skills.join(', ')}  
**Sensory Signature**: Primary: ${d.primaryColor} | Secondary: ${d.secondaryColor}  
**Texture & Form**: ${d.texture}  

## Description
${d.desc}

## Core Mechanics
- **Governing Attribute**: Selected at Awakening (Intellect for Arcane/Logic, Wisdom for Faith/Intuition, Charisma for Inherent/Dominance).
- **Damage Scaling**: Standard 1d6 per Stage achieved (Force Focus utilizes d8s as specific exception).
- **Conduit & Breadth**: Ranks in ${d.skills.join(' and ')} contribute directly to the character's **Essence Pool**.
`;
  fs.writeFileSync(path.join(disciplinesDir, d.file), content, 'utf8');
});

console.log('Successfully updated 6 discipline files in src/data/omnicortex/disciplines/');

// ─────────────────────────────────────────────────────────────────────────────
// 9. UPDATE SKILLS IN src/data/omnicortex/skills/
// ─────────────────────────────────────────────────────────────────────────────

// Update meta-attune.md
const metaAttuneContent = `---
id: meta-attune
name: Attune
type: meta
subtype: metafocus
category: skills
governing_attributes:
  - Intellect
  - Wisdom
  - Charisma
description: >-
  The universal conduit skill for drawing and channeling energy. Required for all Disciplines.
  Sets Resistance/Evasion DC, resolves Attack Rolls and Opposed Countering, and expands Essence capacity.
trained_only: true
specialties:
  - Channeling & Conduit Regulation
  - Setting Resistance & Evasion DCs
  - Meta Combat Attack Rolls
  - Counter Effect Nullification
  - Concentration & Sustained Focus
synergy_links:
  - mental-metaphysics
  - meta-dimension
  - meta-energy
  - meta-entropy
  - meta-illusion
  - meta-matter
  - meta-mental
${standardCostsAndSockets}
---

# Attune

The universal master conduit skill for drawing, regulating, and channeling metaphysical energy from the Quantum Field, the Weave, or the Void. Required for all Disciplines.

### Core Rules & Mechanics
- **Exempt from ML Cap**: The Attune skill is **not limited by planetary Metafocus Level (ML)**.
- **Conduit of Essence**: Your character's permanent Attune rank is added directly to their **Essence Pool**.
- **Resistance & Evasion DC**: Sets the difficulty for targets resisting or evading your metaphysical effects:
  $$\\text{Target DC} = 10 + \\text{Attune Check Modifier} + \\text{Key Ability Mod}$$
- **Meta Combat Attack Rolls**: Used for all metaphysical Strike and Attack rolls.
- **Counter Effect**: Used in Step 1 of opposed Counter Effect checks to seize control of an incoming conduit.
- **Concentration**: Tested when taking damage to avoid losing sustained invocations.
`;

fs.writeFileSync(path.join(skillsDir, 'meta-attune.md'), metaAttuneContent, 'utf8');
console.log('Successfully updated meta-attune.md');

console.log('ALL METAPHYSICS OMNICORTEX FILES GENERATED SUCCESSFULLY!');
