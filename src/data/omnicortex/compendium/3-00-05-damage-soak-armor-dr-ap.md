---
id: "3-00-05-damage-soak-armor-dr-ap"
name: "3.00.05 Master Damage Resolution, Metafocus & Damage Types Directory"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 6
perspective: "both"
entry_type: "Core Engine Manual"
tl: 3
ml: 0
cost: 0
tags: ["compendium","core-engine-manual"]
updatedAt: "2026-09-02T09:16:58.894Z"
costs:
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
  allocated: []
---

# 3.00.05 Master Damage Resolution, Metafocus & Damage Types Directory

Tangent calculates damage by resolving weapon energy, relevant abilities, precision bonuses, target armor protection, and natural physical resilience.

---

## 1. The Master Damage Calculation Formula

$$\text{Total Damage} = (\text{Weapon Dice} + \text{Relevant Ability Mod} + \text{Precision Damage}) - (\text{Target Armor DR} + \text{Target CON Mod})$$

### Core Mechanics
- **Weapon Die Damage:** Rolled from weapon profile or invocation tier.
- **Relevant Ability:** Applied based on attack nature:
  - **Strength:** Most melee attacks, brawling strikes, and throwing heavy objects.
  - **Agility:** Finesse of light or natural weapons and most ranged physical attacks.
  - **Intelligence:** Directly weaving and calculating magical and technological effects.
  - **Charisma:** Subtle, emotional, and controlling metaphysical factors.
  - **Stamina & Wisdom (Defensive):** Guard the body (**Fortitude**) and mind (**Willpower**) defensively. *Wisdom may substitute for Int/Cha in Metaphysic Skill checks for faith-based casters.*
- **Precision Damage:** Bonus directly from the attacker's skill level (relative Combat or Focus Skill Rank).
  - *Active Defense Counter:* A defender actively defending reduces incoming damage by their **Defense score** (directly countering Precision Damage).
- **Target's Armor DR:** Subtracted based on armor resistance against the specific damage type.
- **Target's CON Mod:** Innate physiological resilience mitigating harm.
- **Sneak Attack Activation:** Sneak attack bonus damage is added **only if at least 1 point of damage penetrates target Armor DR** (determined after Armor DR but before Stamina/CON modifier).

---

## 2. Metafocus (Metaphysical Combat)
- **Invocation as Weapon:** An Invocation is treated as the weapon with damage dice and type determined accordingly.
- **Attack Roll:** Rolled with the **Attune Skill** (Strike roll, opposed by target Defense score or setting the saving throw CR).
- **Damage & Effect:** Potency is determined by the **Invocation Tier and Discipline Skill Level**.
- **Spontaneous Casting:** Supported using the relevant **Discipline's Skill Rank**.

---

## 3. Concussive & Impact Damage
Traumatic physical impact from vectors generally larger than the target's body (smashing, crashing, crushing, falls, explosions).
- **Whole-Body Dispersion:** Traumatic energy is dispersed across the entire target.
- **Vitality / Health Split:** Damage can be **divided equally between Vitality and Health** if the character attempts an active defense or soak.
- **Crashing & Siege:** Half DR if Hard Armor (without Crash Suit); Force Field DR is half effective.
- **Falling Damage:** **Ignores DR of physical protection and force fields**.
- **Explosives:** Half DR of Hard Armor (without Blast Suit); Force Field DR is half effective.

---

## 4. Master Damage Types Directory

### Kinetic Damage Types
- **Blunt (Crushing):** Impact force; excels against rigid armor plates and machinery.
- **Slashing (Cutting):** Razor blades tearing tissue; crits inflict the **Bleeding** status effect (1d4/turn, ignores DR).
- **Piercing (Puncturing):** Needle/bullet penetration exploiting seams; crits inflict **Bleeding**.
- **Force:** Kinetic subtype consisting of concentrated kinetic fields that **ignores 1/2 of Target Armor DR**.
- **Concussive / Impact:** Traumatic whole-body damage split equally between Vitality and Health; halves or ignores DR.

### Energy Damage Types
- **Pyro / Fire:** Burns and incinerates; crits inflict the **Burning** status effect (1d6 Fire/round + Will DC 12 panic).
- **Cryo / Cold:** Endothermic chill slowing movement; crits inflict the **Freeze** status effect (Speed 0, vulnerable).
- **Spectral / Phase:** Incorporeal energy that **ignores physical Armor DR entirely** to disrupt life essence.
- **Sonic / Sound:** Vibrational acoustic resonance that **ignores most physical armor** and deafens foes.
- **Voltic / Electrical:** High-voltage arcs stunning nervous systems and overloading robotics/electronics.
- **Corrosive / Disintegration:** Caustic acid that permanently degrades Armor DR and dissolves materials.
- **Ra-D / Radiation:** Ionizing gamma rays inducing radiation sickness, cellular necrosis, and mutation.
- **Force Pulse / Disruption:** Destabilizes molecular bonds, crumbling targets and disintegrating matter on crits.

### Variative & Elemental Damage Types
- **Air Elemental:** Concussive atmospheric gales knocking foes **Prone** and disrupting flight.
- **Fire Elemental:** Primal volcanic flame scorching terrain and applying Burning.
- **Earth Elemental:** Massive lithic crushing weight and seismic tremors knocking foes Prone.
- **Water Elemental:** High-pressure hydraulic torrents causing concussive trauma and drowning.
- **Radiant / Light:** Pure solar photons blinding darkness entities with the **Blinded** condition (-5 Attack/Defense).
- **Umbral / Shadow:** Primal void darkness leeching vitality and inflicting Exhaustion.
- **Celestial:** Sacred transcendent power smiting fiends and undead with radiant fury.
- **Infernal:** Corrupting hellfire and Stygian damnation eroding mind and soul.
- **Dimensional:** Spacetime tearing and spatial shearing that **completely bypasses Armor DR**.
- **Psyche / Mental:** Direct psionic and neural trauma **ignoring physical armor entirely**; resisted by Willpower.

## Game Mechanics Rules
```
TotalDamage = (WeaponDice + AbilityMod + PrecisionDamage) - (ArmorDR + TargetCONMod)
ActiveDefense: Reduces incoming damage by Defender Defense Score (countering Precision)
SneakAttack: Adds bonus only if >= 1 pt penetrates Armor DR (evaluated before CON Mod)
Concussive: Split 50/50 between Vitality and Health on attempted reduction; 1/2 Hard Armor DR
Force: Ignores 1/2 Armor DR; Phase & Mental: Ignore physical Armor DR
```

## Gameplay Instructions
Calculate base strike with 2d10 + Ability + Skill. If hit, resolve damage formula. Deduct active defense score from precision damage if defending.

## Designer Notes
Dual 10s (Natural 20) doubles weapon damage dice and adds +30 to base attack score. Dual 1s (Natural 2) subtracts 10 from attack score.
