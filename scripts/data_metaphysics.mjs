/**
 * Canonical Tangent SF RP Metaphysics Compendium Dataset
 * Fully integrated Omni-Codex of Metaphysic Invocations, Reality Manipulation, and Sensory Manifestations.
 */

export const metaphysicsArticles = [
  {
    id: "4-01-omni-codex-metaphysics-overview",
    name: "4.01 The Omni-Codex of Metaphysics Overview",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 1,
    description: `# 4.01 The Omni-Codex of Metaphysics Overview

The manipulation of reality within the Tangent framework is not merely the recitation of arcane words, but the deliberate restructuring of universal constants through the application of will. 

This system operates on a distinct triad of mechanics—**Attune**, **Discipline**, and **Invocation**—which collectively allow for the harnessing of powers that defy standard physics. 

Unlike "Vancian" magic systems where spells are distinct, immutable memory packets that vanish upon use, the Metaphysic system implies a fluid, skill-based manipulation of energy sources, whether they be the **Void**, the **Weave**, or the **Quantum Field**.

---

## The Metaphysic Triad Framework

1. **Attune (The Conduit)**: The universal master skill for drawing, channeling, and regulating raw metaphysical energy from the universal substrate. It sets target saving throw DCs, evasion DCs, and attack rolls.
2. **Discipline (The Shape)**: The 6 fundamental spheres of reality manipulation (*Dimension, Energy, Entropy, Illusion, Matter, Mental*), each split into 2 dedicated Metafocus skills. Ranks determine the efficiency, severity, and magnitude of effects.
3. **Invocation (The Codified Effect)**: Specific rote formulas and muscle-memory techniques etched into neural pathways. Invocations provide operational safety ("Take 10" reliability) and stack directly onto Discipline checks.

---

## Metascience Across the Cosmos

Whether practiced as high-tech Arcanism by the Alterian Enclave, transcendental psionics by the Mondi, divine miracles by the Ascendancy, or void corruption by the Sha'Nor, all reality manipulation shares a singular mathematical foundation rooted in the Triad.`,
    mechanic: `Metaphysic Triad = { Attune, Discipline, Invocation }
Potency = Key Ability Mod + Discipline Skill Level + Invocation Level + 10 (or d20 roll)`,
    guide: `Awaken a discipline feature during character creation to unlock access to Attune and its associated Metafocus skills.`,
    note: `Metaphysical phenomena interact with technological sensors, manifesting as localized tachyon spikes and quantum flux.`
  },
  {
    id: "4-02-metafocus-levels",
    name: "4.02 Metafocus Levels (ML 0 to ML 6)",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 2,
    description: `# 4.02 Metafocus Levels (ML 0 to ML 6)

Comparable to the Technological Level (TL) of a society, the **Metafocus Level (ML)** determines the prominence, societal integration, and legal standing of Metaphysics within a civilization or demographic.

---

## Metafocus Level Classification Table

| ML | Classification | Description | Typical Examples | Max Discipline Rank |
| :---: | :--- | :--- | :--- | :---: |
| **0** | **Null** | No native Meta users. Physical laws strictly rigid. | None | **Rank 0** |
| **1** | **Rare** | Negligible ratio of Meta Users; likely to be harshly judged or highly expected of. | Skeptical societies / Most races | **Rank 2** |
| **2** | **Selective** | More ‘in tune’ people but in minorities or reclusive. Early stage of Enlightenment. | Special Ops, Esoteric Cults, Enclaves | **Rank 4** |
| **3** | **Cultured** | Uncommon but accepted Meta Usage (Adepts of various types). Awakened as a recommended feature of the species. | Aulurans, Dracon Dynasty, Impyrium | **Rank 6** |
| **4** | **Standardized** | Common Meta Usage; used by many and evident in daily society. Awakened as a granted feature of the species. | Alterians, Impyrium Regi, Psion | **Rank 8** |
| **5** | **Advanced** | Very Common Meta Usage; prominent usage by everyone in infrastructure and communication. | Mondi, Shar Knor | **Rank 10** |
| **6** | **Deific** | Transcended; casually affecting reality. **NOT AVAILABLE TO PCs**. | Progenitor types / Cosmic Architects | **Unlimited (NPC Only)** |

---

## Starting Character Skill Limit Formula

Double the planetary or demographic ML to determine a starting character’s maximum level in Metafocus Discipline Skills:

$$\\text{Max Starting Discipline Rank} = \\text{ML} \\times 2$$

> [!IMPORTANT]
> **Attune Skill Exemption**: The **Attune** skill is the conduit through which all metaphysics flows and is **not limited by ML**. A character from an ML 1 world may train Attune beyond Rank 2 even while their specific Discipline skills remain capped at Rank 2.`,
    mechanic: `MaxStartingDisciplineRank = ML * 2 (Attune is exempt from ML cap)`,
    guide: `Check the planetary ML of your campaign world to verify starting discipline skill caps during character generation.`,
    note: `Civilizations with ML 4+ regularly integrate metaphysical anti-tampering runes into currency, architecture, and legal oaths.`
  },
  {
    id: "4-03-triad-mechanics-attune-discipline-invocation",
    name: "4.03 The Triad Mechanics: Attune, Discipline, Invocation",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 3,
    description: `# 4.03 The Triad Mechanics: Attune, Discipline, Invocation

Metafocus Disciplines represent the knowledge and ability to consciously alter reality. This covers all metaphysical powers including Studied Arcanists, Transcendental Psychics, Devout Priests, Akashic Channelers, and Latent Abilities.

---

## 1. Awakening & Acquisition

- **Acquisition**: Characters must attain Disciplines through **Awakening**. Skill points must be allotted to **Attune** and each Discipline’s **2 Metafocus Skills**.
- **Expansion**: Additional purchases of Awakening are required to attain other Disciplines (gaining access to the 2 skills from each). *(Note: Attune is learned with the initial Awakening and applies to all).*
- **Schools of Thought**: Many Schools teaching various disciplines will be limited in teaching others of a like school (*e.g., Magic & Magic, Psychic & Psychic*). Studying from a different School of Thought may be possible but will be more complicated depending on the severity of the difference.

---

## 2. Skills Breakdown

### The Attune Skill
- A general multi-purpose skill for drawing, channeling, and regulating energy.
- Required for all Disciplines.
- Attune Abilities listed under each Discipline require no check to use.
- Sets target Resistance and Evasion DCs.

### Metafocus Skills
- The specific skills of manipulating patterns (determines efficiency and severity).
- Each Discipline possesses exactly 2 Metafocus Skills.
- **Minor Abilities**: Cantrips and basic tricks listed for each skill require no roll to use; benefits are based on the skill stage.
- **Sensing**: Used to sense controlled forces at work and identify effects/sources.
- **Learning**: Skill checked to learn Invocations and other codified patterns.

### Invocations
- Codified, rote muscle memory formulas.
- Adds Invocation Level directly to the Discipline check as a specialization bonus.
- Provides default **Operational Safety ("Take 10")** to eliminate volatile backlash in standard conditions.`,
    mechanic: `Awakening = Grants 1 Discipline + 2 Metafocus Skills + unlocks Attune
Attune Check = Resistance DC / Evasion DC / Meta Attack Roll
Discipline Check = Severity, Duration, AoE, and Damage Resolution`,
    guide: `When casting, roll Attune to establish the target difficulty or attack accuracy, then resolve Discipline potency.`,
    note: `Minor abilities and cantrips require zero Essence expenditure and resolve automatically without a roll.`
  },
  {
    id: "4-04-key-abilities-awakening-sources",
    name: "4.04 Key Abilities & Awakening Sources",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 4,
    description: `# 4.04 Key Abilities & Awakening Sources

The **Key Ability** is chosen at Awakening and determines the "flavor," cosmological paradigm, and philosophical origin of the wielder's power source.

---

## The Three Source Paradigms

### 1. Intelligence Based (Reason and Logic)
- **Traditions**: Psychic, Arcane, Akashic, Technomantic.
- **Philosophy**: Magic and psionics as pure science. Universal constants are treated as editable computer code, algebraic geometry, and quantum wave equations.
- **Manifestation**: Hexagonal matrices, floating glowing equations, crystalline wireframes, holographic runic circles.
- **Key Attribute**: **Intellect (INT)**.

### 2. Wisdom Based (Willpower and Intuition)
- **Traditions**: Divine, Nature, Cosmic, Shamanic.
- **Philosophy**: Reality manipulation through spiritual communion, instinctive harmony with the cosmos, or unwavering devotion to higher pantheons.
- **Manifestation**: Bioluminescent pollen spores, radiant halos, whispering wind, living vines, solar golden beams.
- **Key Attribute**: **Wisdom (WIS)**.

### 3. Charisma Based (Confidence and Dominance)
- **Traditions**: Bardic, Hereditary Bloodlines, Granted Boons, Demonic Pacts.
- **Philosophy**: Reality bending through raw force of personality, regal majesty, emotional projection, or ancient genetic heritage.
- **Manifestation**: Overwhelming vocal harmonics, roaring aura of majesty, prismatic emotional flares, bleeding watercolor transitions.
- **Key Attribute**: **Charisma (CHA)**.`,
    mechanic: `SourceMod = KeyAbilityMod (INT, WIS, or CHA chosen at Awakening)
Potency = SourceMod + DisciplineSkillRank + InvocationLevel + 10 (or d20)`,
    guide: `Select your Key Ability upon taking the Awakened Feature. All your invocation formulas and save DCs will utilize this modifier.`,
    note: `A character's Key Ability modifier also determines their hourly Essence recovery rate during Light Rest.`
  },
  {
    id: "4-05-free-casting-vs-codified-invocations",
    name: "4.05 Free-Casting vs. Codified Invocations",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 5,
    description: `# 4.05 Free-Casting vs. Codified Invocations

Adepts can manifest metaphysical phenomena through two fundamentally distinct methodologies: **Spontaneous Free-Casting** and **Codified Invocations**.

---

## Comparison Matrix

| Feature | Codified Invocations | Spontaneous Free-Casting |
| :--- | :--- | :--- |
| **Preparation** | Rote muscle memory etched into neural pathways | Improvised on the fly in real-time narrative |
| **Operational Safety** | **Takes 10 by default** on Discipline check | Must roll $d20$ for every step |
| **Potency Bonus** | **+ Invocation Level added to Discipline check** | No Invocation Level bonus added |
| **Essence Cost** | Scaled strictly to environmental Base DC (0 to 5) | Paid upfront; cost doubled on Attune $\\le 0$ |
| **Volatility / Risk** | Highly reliable; minimal backfire risk | **High volatility; failure inflicts Internalized Strain** |
| **Tactical Role** | Battle-tested combat strikes, shields, and teleports | Creative problem-solving and narrative utility |

---

## The Potency Calculation Formula

$$\\text{Potency Score} = [\\text{Key Ability} + \\text{Discipline Skill Level} + \\text{Invocation Level} + 10 \\text{ (or } d20 \\text{)}]$$

- **Attune Check**: Used to determine the Difficulty of the Resistance of an Effect or the Evasion of an Attack.
- **Discipline Check**: Used to determine the severity of Effects and/or Damage.

---

## Metaphysic Checks & Environmental Difficulty

The Base DC for activating an Invocation or Discipline depends on the local operational stress:
- **Very Easy (DC 5)**: Safe Quiet Area, Sanctum, Laboratory, Library. (0 Essence)
- **Easy (DC 10)**: Casual, Non-Hostile Environment, Walking, Passenger in Vehicle. (0 Essence)
- **Average (DC 15)**: Very Active or Hostile Environment, Vigorous Movement, Combat. (1 Essence)
- **Difficult (DC 20)**: Extreme Activity, Crashing, Uncontrolled Fall. (2 Essence)
- **Very Difficult (DC 25)**: High-Intensity Chaos, Environmental Catastrophes. (3 Essence)
- **Nearly Impossible (DC 30)**: Legendary Feats, Global Reality Shifts. (4 Essence)
- **Miraculous (DC 35)**: Progenitor-tier interactions (rarely for PCs). (5 Essence)

---

## Criticals, Surges & Failure Table

- **Critical Success (Natural 20 / Double 10s)**: **+30 bonus to the check** and a dramatic, miraculous improvement of the effect.
- **Critical Mistake (Natural 1 / Double 1s)**: **-10 penalty to the check** and a disastrous backfire (Architect's call).
- **Energy Surge (Attune Check $\\le 0$)**: An Attune check resulting in 0 or less becomes an uncontrolled energy surge (wrong target, area effect, collateral damage); **Essence cost for that increment is doubled**.
- **Fizzle / Transposition (Discipline Check $\\le 0$)**: Causes an unintended effect, from a dramatic fizzle to transposed elemental energy.
- **Internalized Strain (Failure)**: Failing a check deals **1 point of Non-Lethal Damage per 5 points of failure** (1d6 per 5 in free-casting). This is painful strain from Channeling and cannot be absorbed by Stamina or Armor.
- **Fumble**: Requires a check to see if the caster suffers the effect themselves.`,
    mechanic: `CodifiedPotency = KeyMod + DisciplineRank + InvocationLevel + 10 (or d20)
InternalizedStrain = floor(FailureMargin / 5) * 1 NonLethal HP
EnergySurge = Attune <= 0 -> EssenceCost * 2`,
    guide: `Use codified invocations with Take 10 during chaotic gunfights; save spontaneous free-casting for out-of-combat problem solving.`,
    note: `Internalized Strain damages biological or synthetic vitality directly and bypasses all Armor DR.`
  },
  {
    id: "4-06-essence-pool-surge-strain",
    name: "4.06 Essence Pool Economy, Costs & The Burn",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 6,
    description: `# 4.06 Essence Pool Economy, Costs & The Burn

Your character’s total **Essence Pool** represents their comprehensive "lodestar"—the intersection of biological/synthetic substrate, channeling precision, and breadth of metaphysical study.

---

## 1. The Essence Pool Calculation Formula

$$\\text{Essence Pool} = (\\text{Sum of all 6 Ability Scores}) + (\\text{Attune Skill Rank}) + (\\text{Total Ranks in all known Discipline Skills})$$

### The Triad Components of the Pool:
1. **The Ability Substrate (Sum of all 6 Ability Scores)**:
   - Since the average human ability score is zero, the pool begins with the character's natural or engineered aptitudes.
   - Physical attributes (*Strength, Agility, Stamina*) contribute to the physical containment and grounding of raw power.
   - Mental attributes (*Intellect, Wisdom, Charisma*) determine the depth, flavor, and spiritual reserve of the source.
   - Permanent modifications (*augmentations, permanent injuries, experience advances*) affect the Essence score, but temporary adjustments do not.
2. **The Conduit (Attune Skill Rank)**:
   - Adding the Attune rank ensures that as a character becomes more precise in opening conduits to their power source, their capacity to hold and regulate energy expands.
   - Only permanent modifications to Attune adjust the Essence total.
3. **The Breadth (Total Ranks in all known Discipline Skills)**:
   - Cumulative ranks from the 12 core skills across all known Disciplines (*e.g., Chaos, Order, Elemental, Force, etc.*) represent the character's holistic mastery of reality's "Code."
   - **Ranks in Invocations do NOT count towards the Essence total**; only the base Discipline skills are counted.

---

## 2. The Essence Cost Scale by Base DC

The metabolic or spiritual cost of an invocation is determined by the **Base DC** required to activate the effect based on the environment and stress:

| Difficulty | Base DC | Essence Cost | Environmental Context |
| :--- | :---: | :---: | :--- |
| **Very Easy** | **DC 5** | **0** | Safe areas, Sanctums, Libraries, Laboratories. |
| **Easy** | **DC 10** | **0** | Casual travel, walking, non-hostile environments. |
| **Average** | **DC 15** | **1** | Combat, vigorous movement, active hostility. |
| **Difficult** | **DC 20** | **2** | Extreme activity, uncontrolled falls, crashing. |
| **Very Difficult** | **DC 25** | **3** | High-intensity chaos, environmental catastrophes. |
| **Nearly Impossible** | **DC 30** | **4** | Legendary feats, global reality shifts. |
| **Miraculous** | **DC 35** | **5** | Progenitor-tier interactions (rarely for PCs). |

---

## 3. Strategic Implications for Invocations

### Operational Safety (Codified Invocations)
- **The "Sanctum" Bonus**: Performing a learned ritual in a laboratory or sanctuary (DC 5) costs **0 Essence**, as familiarity and environmental peace minimize the toll on internal reserves.
- **The Combat Tax**: Using the exact same invocation in a firefight (DC 15) imposes an immediate **1 Essence** cost to stabilize the conduit amidst battlefield chaos.

### Free-Casting & Volatility
- Free-Casting in a Difficult environment (DC 20) requires spending **2 Essence upfront**.
- **Failure Feedback**: If the check fails, the Essence is consumed, and the caster suffers **Internalized Strain** (1 point of Non-Lethal damage per 5 points of failure; 1d6 per 5 in free-casting).
- **Energy Surges**: If an Attune result is **0 or less**, the Essence cost for that increment is **doubled**.

---

## 4. Essence Recovery & The Burn

- **Light Rest**: Recovers Essence equal to the character's **Key Ability Modifier (minimum 1)** per hour of downtime.
- **Full Rest (6–8 Hours)**: Fully restores the entire Essence Pool as body and mind realign with the universal constant.
- **The Burn (Life-Force Channeling)**: If an operative's Essence Pool is empty, they may "burn" their own life force to power an invocation. Each point of Essence needed deals **2 points of direct Health damage** (cannot be absorbed by Armor DR or Stamina), representing physical cellular destruction as the body acts as an unshielded conduit.`,
    mechanic: `EssencePool = Sum(6 Abilities) + AttuneRank + Sum(DisciplineSkillRanks)
TheBurn = 1 Essence : 2 Direct Health Damage (Bypasses DR & Stamina)
LightRestRecovery = max(1, KeyAbilityMod) per hour`,
    guide: `Track your current Essence pool on your Folio. When running low, retreat to a secure sanctum or seek cover for Light Rest.`,
    note: `The Burn inflicts permanent scarring or cybernetic circuit burn if used repeatedly without medical stabilization.`
  },
  {
    id: "4-07-discipline-dimension",
    name: "4.07 Discipline Guide: Dimension (Spatial Folding)",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "4.00 METAPHYSICS",
    order: 7,
    description: `# 4.07 Discipline Guide: Dimension (Spatial Folding)

The **Discipline of Dimension** governs the manipulation of spatial coordinates, distance dilation, gravitational vectors, pocket dimensions, teleportation, and planar rifts.

---

## Associated Metafocus Skills
1. **Summoning**: Drawing matter, energy, and entities across planar boundaries.
2. **Teleport**: Instantaneous spatial relocation, folding space, and anchoring portals.

---

## Sensory Manifestation & Aesthetics
- **Primary Color**: Deep Indigo
- **Secondary Color**: Void Black
- **Texture & Form**: Warping, folding, spatial distortions, planar rifts, and horizon shimmer.
- **Audio Profile**: Atmospheric decompression pop, sub-bass vacuum hum, spatial shearing chime.

---

## Core Capabilities by Skill Tier
- **Novice (Rank 1–5)**: *Spatial Cache* (micro-singularity storage), *Blink* (15-ft line-of-sight shift), *Distort Range* (+50% weapon range).
- **Trained (Rank 6–10)**: *Phase Step* (pass through 5-ft solid wall), *Wormhole Gateway* (stationary two-way portal for allies).
- **Expert (Rank 11–15)**: *Group Teleport* (relocate entire squad 500 meters), *Dimensional Banishment* (shunt foe into void pocket for 1d4 rounds).
- **Master (Rank 16–20)**: *Planetary Rift* (open orbital gateway to surface), *Spacetime Stasis* (freeze enemy velocity).`,
    mechanic: `Damage = 1d6 per Stage achieved with check
Teleport DC = 10 + AttuneRank vs target Will (if unwilling)`,
    guide: `Use Dimension invocations to reposition squad members instantaneously and bypass heavily fortified chokepoints.`,
    note: `Teleporting into solid matter is prevented by the quantum field, shunting the traveler to the nearest open space.`
  },
  {
    id: "4-08-discipline-energy",
    name: "4.08 Discipline Guide: Energy (Force & Plasma)",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "4.00 METAPHYSICS",
    order: 8,
    description: `# 4.08 Discipline Guide: Energy (Force & Plasma)

The **Discipline of Energy** governs the manipulation of raw energy states, thermodynamics, electrical potential, coherent radiation, and kinetic forcefields.

---

## Associated Metafocus Skills
1. **Elemental**: Thermal, electrical, fire, frost, sonic, and plasma projection.
2. **Force**: Kinetic barriers, gravimetric pulses, concussive waves, and telekinesis.

---

## Sensory Manifestation & Aesthetics
- **Primary Colors**: Orange/Red (Fire), Transparent (Force/Sonic), Blue/White (Elec), Glacial Blue (Cold), Sickly Yellow (Corrosive).
- **Secondary Colors**: White Hot, Pale Blue, Violet, Frost White, Silver Ripples, Smoking Grey.
- **Texture & Form**: Plasma flickering, distortion waves, solid glass-like impact walls, crystalline frost, and ionized arcs.

---

## Damage Resolution & Discipline Exceptions
- **Standard Elemental Damage**: **1d6 per Stage achieved** (plus Invocation level).
- **Force Damage Exception**: Specific Invocations using the **Force Focus** utilize **d8s** instead of d6s (1d8 per Stage achieved).`,
    mechanic: `ElementalDamage = 1d6 per Stage + Invocation Level
ForceDamage = 1d8 per Stage + Invocation Level (Specific Exception)`,
    guide: `Energy adepts provide high-intensity direct fire, barrier protection, and battlefield crowd control.`,
    note: `Thermal energy ignites flammable atmospheric gases and rapidly boils liquid oxygen reserves.`
  },
  {
    id: "4-09-discipline-entropy",
    name: "4.09 Discipline Guide: Entropy (Decay & Probability)",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "4.00 METAPHYSICS",
    order: 9,
    description: `# 4.09 Discipline Guide: Entropy (Decay & Probability)

The **Discipline of Entropy** governs the breakdown of complex systems, molecular decay, biological necrosis, probability distortion, cellular regeneration, and life-force transfer.

---

## Associated Metafocus Skills
1. **Chaos**: Accelerating decay, breaking molecular bonds, curses, and destructive negative energy.
2. **Order**: Probability stabilization, cellular regeneration, biological healing, and preservation.

---

## Sensory Manifestation & Aesthetics
- **Chaos Manifestations**: Sickly Green primary, Grey/Black secondary; rusting, decaying, mist, acidic smoke.
- **Order Manifestations**: Geometric Gold primary, Crystal White secondary; perfect lattices, interlocking shields.
- **Healing Manifestations**: Vibrant Life Green primary, Soft Gold secondary; rapid cell growth, knitting flesh, warm pulse.`,
    mechanic: `Damage = 1d6 per Stage achieved with check (Necrotic/Acid)
Healing = 1d6 per Stage achieved with check (Restores Health directly)`,
    guide: `Deploy Chaos to dissolve enemy armor DR, and use Order to stabilize dying squad operatives in combat.`,
    note: `Entropy invocations ignore physical kinetic shields and degrade mechanical armor DR permanently.`
  },
  {
    id: "4-10-discipline-illusion",
    name: "4.10 Discipline Guide: Illusion (Sensory & Holography)",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "4.00 METAPHYSICS",
    order: 10,
    description: `# 4.10 Discipline Guide: Illusion (Sensory & Holography)

The **Discipline of Illusion** governs photon refraction, auditory deception, holographic phantasms, mental glamours, and shadow weaving.

---

## Associated Metafocus Skills
1. **Phantasm**: Sensory phantasms, holographic weaves, auditory deception, and environmental mirages.
2. **Shadow**: Weaving darkness, shadow-stuff, optical refraction, and umbral constructs.

---

## Sensory Manifestation & Aesthetics
- **Primary Color**: Shimmering
- **Secondary Color**: Oil-Slick
- **Texture & Form**: Mirrored surfaces, chromatic haze, sensor glitches, and light-bending refractive cloaks.
- **Audio Profile**: Crystalline chimes, whisper echoes, reversed harmonics, eerie silence.`,
    mechanic: `DisbeliefDC = 10 + AttuneRank + KeyAbilityMod vs Alertness/Will
DeceptionPotency = 1d6 per Stage achieved with check`,
    guide: `Use Illusion for covert infiltration, electronic deception, diverting enemy sniper fire, and cloaking squad vehicles.`,
    note: `Tactile physical contact with an illusion permits an immediate Disbelief saving throw with Advantage.`
  },
  {
    id: "4-11-discipline-matter",
    name: "4.11 Discipline Guide: Matter (Transmutation & Telekinesis)",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "4.00 METAPHYSICS",
    order: 11,
    description: `# 4.11 Discipline Guide: Matter (Transmutation & Telekinesis)

The **Discipline of Matter** controls physical density, atomic crystalline bonds, elemental transmutation, and structural reinforcement.

---

## Associated Metafocus Skills
1. **Enhancement**: Strengthening material bonds, hardening objects, and physical armor reinforcement.
2. **Transmutation**: Reshaping physical matter, molecular conversion, and phase state changes.

---

## Sensory Manifestation & Aesthetics
- **Primary Color**: Earth Tones
- **Secondary Color**: Metallic Sheen
- **Texture & Form**: Solidification, density shifting, stone shaping, transmutation, and diamond lattice sheen.`,
    mechanic: `Damage = 1d6 per Stage achieved with check (Kinetic/Crushing)
Reinforcement = +1 Armor DR per Stage achieved with check`,
    guide: `Shape stone and metal bulkheads into defensive blast barricades or transmute hazardous liquid toxins into neutral water.`,
    note: `Enhancement invocations can reinforce damaged starship hulls during catastrophic hull breaches.`
  },
  {
    id: "4-12-discipline-mental",
    name: "4.12 Discipline Guide: Mental (Telepathy & Domination)",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "4.00 METAPHYSICS",
    order: 12,
    description: `# 4.12 Discipline Guide: Mental (Telepathy & Domination)

The **Discipline of Mental** interfaces directly with sentient neural pathways, telepathic communication, memory extraction, and cognitive will projection.

---

## Associated Metafocus Skills
1. **Projection**: Psionic thrusts, telekinesis, telepathic speech, and cognitive thrusts.
2. **Sense**: Remote viewing, psionic detection, empathy, telepathic probing, and clairvoyance.

---

## Sensory Manifestation & Aesthetics
- **Primary Color**: Pink/Magenta
- **Secondary Color**: Cyan
- **Texture & Form**: Cognitive ripples, psionic pulses, telepathic threads, and glowing eyes.
- **Audio Profile**: Subconscious whispers, cerebral static, electronic humming, heartbeat reverberations.`,
    mechanic: `Damage = 1d6 per Stage achieved with check (Bypasses Physical Armor DR)
MindControlDC = 10 + AttuneRank + KeyAbilityMod vs Will Save`,
    guide: `Maintain encrypted telepathic links across your operative squad for completely silent coordination.`,
    note: `Interfacing with synthetic AI matrices requires specialized cyber-psionic training or composite invocations.`
  },
  {
    id: "4-13-metaphysic-ranges-area-geometry",
    name: "4.13 Metaphysic Ranges, Modifiers & Area Geometry",
    category: "compendium",
    entry_type: "Game Mechanic",
    parent: "4.00 METAPHYSICS",
    order: 13,
    description: `# 4.13 Metaphysic Ranges, Modifiers & Area Geometry

Metaphysical invocations manifest in distinct geometrical forms across tactical grid battle maps. Greater distances and broader shapes impose mechanical modifiers.

---

## 1. Ranges & Check Modifiers

| Range Bracket | Distance Bracket | Check Modifier | Operational Notes |
| :--- | :--- | :---: | :--- |
| **Melee / Point Blank** | 5 ft (Small/Medium reach) | **+5 to Check** | Intimate conduit connection provides maximum stability. |
| **Close** | Up to 100 ft | **None (0)** | Standard tactical engagement distance. |
| **Medium** | Up to 500 ft | **-5 to Check** | Requires clear line-of-sight and focused tracking. |
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

---

## 3. Damage Calculation Summary
- **Standard**: **1d6 per Stage achieved** with the check (after all modifiers).
- **Force Exception**: Some specific Disciplines, like **Force**, utilize **d8s** as a specific exception.`,
    mechanic: `MultipleTargetsPenalty = -5 per additional target to Attune
BlastPenalty = -5 to Focus Skill | LinePenalty = -10 | ConePenalty = -15
Damage = 1d6 per Stage (Force: 1d8 per Stage)`,
    guide: `Apply range and area modifiers to checks before calculating the final potency stage.`,
    note: `Extended range invocations targeting locations across planetary distances require telemetry triangulation.`
  },
  {
    id: "4-14-composite-invocations-synthesis",
    name: "4.14 Composite Invocations: The Synthesis of Disciplines",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 14,
    description: `# 4.14 Composite Invocations: The Synthesis of Disciplines

Composite Invocations require ranks in multiple Disciplines and represent the pinnacle of reality-weaving synergy.

---

## The Core Synthesis Rule

> [!IMPORTANT]
> **Lowest Requisite Skill Rule**: **Invocation Level is added to the *lowest* of the requisite Discipline Skills used.**  
> *For example, an Adept casting Machine Spirit with Mental 8 and Energy 4 adds their Invocation Level to their Energy skill (4).*

---

## The Five Canonical Synthesis Archetypes

### 1. Magitech & Cybermancy (Mental + Energy)
- **Concept**: Interfacing consciousness directly with electrical currents and silicon computing networks.
- **Canonical Invocations**:
  - *Machine Spirit (Interface)*: Direct neural bridging into starship computers, hacking firewalls at thought-speed.
  - *Construct Intelligence (AI)*: Breathing temporary sentient psionic awareness into automated defense turrets and drones.

### 2. Biostasis & Time Warping (Entropy + Dimension)
- **Concept**: Interweaving spatial dimensional anchors with entropic decay vectors to alter local chronometry.
- **Canonical Invocations**:
  - *Temporal Stasis (Freeze Time)*: Anchors a target in an immovable, indestructible time-lock for 1d4 rounds.
  - *Accelerated Decay (Rapid Aging)*: Accelerates cellular entropy, aging materials or organic tissue by decades in seconds.

### 3. Elemental Constructs (Matter + Energy)
- **Concept**: Binding volatile thermodynamic plasma into solid matter lattice structures.
- **Canonical Invocations**:
  - *Living Spell (Minion)*: Animates a roving sphere of autonomous fire or lightning with tactical instinct.
  - *Plasma Forging (Energy Weapons)*: Forges solid melee blades or armor composed of contained superheated plasma.

### 4. Spatial Illusions (Illusion + Dimension)
- **Concept**: Bending photon reflection and spacetime coordinates simultaneously.
- **Canonical Invocations**:
  - *Labyrinth (Infinite Maze)*: Traps foes in an endless non-Euclidean spatial maze of mirrored corridors.
  - *Shadow Step Assault (Teleport Attacks)*: Teleports instantaneously through an enemy's shadow while executing a strike.

### 5. Biomancy (Matter + Entropy)
- **Concept**: Restructuring physical cellular matter while manipulating life-force energy.
- **Canonical Invocations**:
  - *Life Transfer (Drain/Heal)*: Drains physical vitality from an enemy to instantly knit flesh on an ally.
  - *Flesh Crafting (Reshaping)*: Physically reshapes muscle, bone, and skin to grant natural weapons, gills, or new facial identities.`,
    mechanic: `CompositePotency = KeyAbilityMod + LowestRequisiteSkillRank + InvocationLevel + 10 (or d20)`,
    guide: `Train multiple disciplines to qualify for composite invocations that combine the capabilities of both spheres.`,
    note: `Composite Invocations count as known Invocations for both disciplines, but require both Awakened features.`
  },
  {
    id: "4-15-meta-combat-counter-effects",
    name: "4.15 Meta Combat & Counter Effects",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 15,
    description: `# 4.15 Meta Combat & Counter Effects

Combat involving metaphysical manifestations follows precise attack rolls, defense ratings, and counter-nullification protocols.

---

## 1. The Metaphysic Attack Roll
- **Attack Roll**: **Attune** is used for the Attack Roll:
  $$\\text{Meta Attack Roll} = d20 + \\text{Attune Rank} + \\text{Key Ability Mod} + \\text{Situational Modifiers}$$
- **Target Defense**: Target defense is treated similarly to conventional physical or ranged attacks (opposed by Reflex Evasion, Fortitude, or Willpower).
- **Potency Resolution**: Damage, range, and secondary conditions are determined by the active Metafocus Skill and Invocation.

---

## 2. Counter Effect (Nullification of Incoming Magic)
A defender who detects an incoming invocation may attempt to seize the conduit and unravel the effect:

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
| -> Attacker Wins: Effect resolves normally with full potency.           |
| -> Defender Wins: Effect is completely countered and nullified.         |
+-------------------------------------------------------------------------+
\`\`\`

### Strategic Resolution:
- Countering an invocation requires spending a Reaction action during combat.
- If nullified, the incoming energy safely dissipates as harmless static hum or soft sparks.`,
    mechanic: `Step1 = Opposed Attune Roll (Defender > Attacker required)
Step2 = Opposed Metafocus Skill Roll (Defender > Attacker nullifies effect)`,
    guide: `Hold a Reaction action to counter devastating incoming area-of-effect spells during boss encounters.`,
    note: `Countering does not consume the defender's Essence unless the counter attempt itself utilizes a specialized ward.`
  },
  {
    id: "4-16-codex-meta-sensory-manifestations",
    name: "4.16 Codex: Meta-Sensory Manifestations & Colorations",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "4.00 METAPHYSICS",
    order: 16,
    description: `# 4.16 Codex: Meta-Sensory Manifestations & Colorations

In the Tangent Universe, the "Meta" is not a single uniform force. It is shaped by the mind, philosophy, and culture of the wielder. A *Thermal Lance* cast by a Mekan logic-priest looks fundamentally different from one cast by a Draconian Sorcerer.

---

## I. Psychic Manifestations (The Mind)
*Root Disciplines: Mental, Dimension, Energy (Force)*  
Psychic power is the imposition of Will upon Reality, rewriting local probability without relying on external ritual.

### A. Controlled (Logic / Telekinetic)
- **Archetypes**: The Mekan, The Analyst, The Tactician.
- **Concept**: The mind as a computer or architect. Energy is efficient, wasted on nothing.
- **Visuals**: Defined geometrics (hexagons, fractals, grids); hard-light shields looking like laser-cut crystal. No smoke, no trail.
- **Palette**: Electric Cyan (raw data), Circuitry Black (negative space printed lines), Neon Orange (combat mode).
- **Sensory**: High-pitched electronic whines, server hums, glass snapping; smooth, frictionless, cold static texture.

### B. Focused (Discipline / Telepathic)
- **Archetypes**: The Impyrium Centurion, The Monk, The Judge.
- **Concept**: The mind as a lens. Power gathered and projected in a singular, overwhelming vector.
- **Visuals**: Dense, opaque lines and beams of unwavering solid color; flat planes of light passing over objects.
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
| **Mental** | Pink/Magenta | Cyan | Ripples, pulses, glowing eyes. |`,
    mechanic: `SensoryManifestation = ArchetypeTradition + RootDisciplineSignature`,
    guide: `Describe the visual, audio, and tactile texture of invocations based on the caster's cultural origin and discipline.`,
    note: `Sensory signatures allow observers with Alertness or Attune to identify the school and source of an incoming spell.`
  }
];
