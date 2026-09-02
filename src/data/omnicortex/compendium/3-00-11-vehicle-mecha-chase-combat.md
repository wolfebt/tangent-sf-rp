---
id: "3-00-11-vehicle-mecha-chase-combat"
name: "3.00.11 Vehicular Combat & Mechanical Warfare"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 11
perspective: "both"
entry_type: "Combat Rule"
tl: 3
ml: 0
cost: 0
tags: ["compendium","combat-rule"]
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

# 3.00.11 Vehicular Combat & Mechanical Warfare

In the Tangent universe, vehicular combat is an escalation of core 2d10 mechanics across all scales, from hover-bikes to gargantuan void-cruisers. The operational loop remains: **Action, Reaction, Consequence.**

---

## 1. Operational Fundamentals & The Tactical Round
Vehicular combat operates on the standard 6-second Combat Round:
- **Initiative Formula:**
  $$\text{Vehicle Initiative} = 2\text{d}10 + \text{Agility Mod} + \text{Alertness} + \text{Handling Modifier}$$
  *(Handling Modifier is chassis-intrinsic, e.g. Fighter Jet +4, Capital Ship -4).*
- **The Crew Turn:**
  - **Pilot:** Controls Movement, Evasion (Defense), and Fixed Forward Weapons (45° arc).
  - **Gunner(s):** Control Turrets and Pintle mounts (360° arc); act on Pilot count but track independent actions.
  - **Engineer / System Operator:** Manages Shields, Sensors, EW, and Field Repairs.
- **Scale & Size Modifiers:** Governed by *01.01.09 Scaling*. Small targets shooting Large get to-hit bonuses but struggle to penetrate DR; Large weapons suffer tracking penalties against nimble targets.

---

## 2. Domains of War
- **Land (Terrestrial & Walker):**
  - *Cover:* Terrain provides +4 to +10 Defense. **Hull Down** grants **+4 Defense**.
  - *Ramming:* Pilot melee attack. Damage: **1d10 per 10ft of Speed** to both; heavier vehicle takes half.
  - *Walkers:* Stomp infantry (Standard Melee Attack) and stride over low obstacles.
- **Nautical (Surface & Submerged):**
  - *Sensors:* System Ops (Sensors) checks to acquire **Target Lock**. Without lock, attacks suffer **Disadvantage**.
  - *Depth Bands:* Surface (standard), Periscope Depth (concealment), Deep (breaches are catastrophic).
- **Atmospheric (Aerial):**
  - *Dogfight:* Opposed Pilot checks at start of round. Winner gains **Advantage** on attacks and chooses positioning (Tail/Flank); loser is **Flat-Footed** against winner.
  - *Stalling:* Flying below Stall Speed requires **DC 20 Pilot check** or craft enters terminal fall.
- **Interstellar (Space):**
  - *Newtonian Drift:* Maintains velocity in zero-G; cut engines to drift silently (Stealth).
  - *Heat Signatures:* Firing energy weapons or thrusters flares signature (passive detection). Active ping required for "Cold" ships.
  - *Proximity Damage:* Capital near-misses still inflict concussive shockwave damage to smaller craft.

---

## 3. Combat Interactions & Siege Warfare
- **Pilot vs. Pilot:**
  - *Evasive Maneuvers (Action):* Forfeit attack to impose **Disadvantage on all incoming fire**.
  - *Jinking (Reaction):* Roll Pilot Skill vs Attack Roll to negate hit; costs movement on next turn.
- **Gunner vs. Mecha (Infantry vs. Vehicle):**
  - *Armor Threshold:* If Weapon Damage $\le$ Armor DR, **the shot bounces (ping!)** with zero effect.
  - *Called Shots (Weak Points):* Attack at **-5 Penalty**; on hit, **ignore 50% DR** or disable specific system.
  - *Boarding:* Athletics Check vs Vehicle Speed/Defense to climb aboard and bypass Scale penalties.
- **Gunner vs. Structure (Siege Warfare):**
  - *Static Defense:* Structures have 0 Agility, effective **Defense 5** (auto-hit).
  - *Siege Weapons:* Heavy explosive and energy ordnance deal **Double Damage** to stationary structures.
  - *Breaching:* 0 SP creates an infantry-sized Breach. -50% SP causes catastrophic structural Collapse.

---

## 4. Damage & Catastrophe
- **Glancing Blow:** Damage $\le$ Armor DR. No effect.
- **Penetrating Hit:** Damage $>$ Armor DR. Excess damage subtracted from **Structure Points (SP)**.
- **Critical Hit:** Natural 20 or exceeding Defense by 10+. Roll on **System Failure Table**.

### System Failure Table (d6)
*(Rolled on Critical Hit or when reaching 50% SP)*
1. **Motive System:** Speed reduced by **50%** (treads thrown, wing clipped).
2. **Weapon System:** One random weapon disabled or jammed.
3. **Sensor / Comms:** Blinded or silenced; **Disadvantage on all targeting**.
4. **Crew Compartment:** Cockpit breached; crew takes **half the damage** dealt to vehicle.
5. **Power Plant:** Smoke and internal fire; vehicle takes **1d6 Burn damage/turn**.
6. **Catastrophic Leak:** Fuel/reactor unstable; **explodes in 1d4 rounds** unless repaired.

### Destruction
- **0 SP (Disabled):** Vehicle stops, systems offline, repairable.
- **Negative SP > 50% Max (Destroyed):** Total loss, scrap wreck.
- **Catastrophic Explosion:** Detonates if destroyed by Fire/Explosive damage. Radius: **10ft per Size Category**. Damage: **1d6 per 10 SP of vehicle max structure**.

## Game Mechanics Rules
```
VehicleInitiative = 2d10 + AgilityMod + Alertness + HandlingMod
Ramming = 1d10 / 10ft Speed (heavier takes 1/2)
Dogfight = Opposed Pilot Check (Winner: Advantage + Tail/Flank; Loser: Flat-Footed)
ArmorThreshold = Damage <= DR bounces
InfantryCalledShot = -5 Attack -> Ignore 50% DR or disable system
StructureSiege = Heavy weapons deal 2x damage against Defense 5 structures
CatastrophicExplosion = 10ft/Size Cat radius, 1d6 per 10 max SP
```

## Gameplay Instructions
Track Pilot, Gunner, and Engineer turns independently. Roll on System Failure Table (d6) at 50% SP or on critical hits.

## Designer Notes
Capital ship spinal mounts inflict proximity concussive damage to fighters on near-misses.
