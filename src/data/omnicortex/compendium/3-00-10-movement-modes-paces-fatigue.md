---
id: "3-00-10-movement-modes-paces-fatigue"
name: "3.00.10 Movement Modes, Tactical Paces & Fatigue Rules"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 10
perspective: "both"
entry_type: "Core Rule"
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

# 3.00.10 Movement Modes, Tactical Paces & Fatigue Rules

Locomotion across planetary battlefields, void stations, and alien biospheres is categorized into **5 Primary Movement Modes**: Ground, Flying, Swimming, Climbing, and Burrowing.

---

## 1. Ground Movement Matrix

| Pace | Speed Multiplier | Medium Speed (30 ft base) | Action Modifiers (Stealth/Subtlety/Precision) | Fatigue & Skill Check |
| :--- | :---: | :---: | :---: | :--- |
| **Walk** | **1x (Base)** | 30 ft / 6s (6 kph) | Standard baseline | None |
| **Jog** | **2x** | 60 ft / 6s | **-2 penalty** | None |
| **Running** | **4x** *(5x with Runner)* | 120 ft *(150 ft)* | **-4 penalty** | **Athletics DC 10+** (every min, cum. -1) |
| **Sprinting** | **6x** *(7x with Runner)* | 180 ft *(210 ft)* | **-8 penalty** | **Athletics DC 15+** (every min, cum. -1) |
| **Crawl** | **1/2x** | 15 ft / 6s | **+2 stealth**; gains **Prone** | None |
| **Slow Crawl** | **1/4x** | 7.5 ft / 6s | **+4 stealth**; gains **Prone** | None |

---

## 2. Flying Movement Matrix

| Maneuver | Speed Multiplier | Medium Speed (60 ft fly) | Action Modifiers | Skill Check / Maneuver DC |
| :--- | :---: | :---: | :---: | :--- |
| **Flight** | **1x Fly (2x Walk)** | 60 ft / 6s | Standard flyer baseline | None |
| **Sail** | **2x Fly (4x Walk)** | 120 ft / 6s | **-2 penalty** | None |
| **Surge / Soar** | **4x Fly (8x Walk)** *(5x with Soar)* | 240 ft *(300 ft)* | **-4 penalty** | **Acrobatics DC 10+** (every min, cum. -1) |
| **Diving** | **2x Current Speed** *(9x with Soar)* | Up to 480+ ft | **-4 penalty** | **Acrobatics DC 15+** |
| **Gliding** | Maintains speed, drops 1ft per 5ft horiz | 60 ft horiz / 12 ft fall | **+2 bonus** | **Acrobatics DC 10+** |
| **Hover / Controlled Descent** | **1/2 Fly or less** | 30 ft or static | Observation ready | **Acrobatics DC 15+** |

### Aerial Combat Rules
- **High Ground Bonus**: Airborne combatants above grounded foes gain **+2 Strike** and **+2 Critical Threat Range**.
- **Aerial Ram Formula**: $\text{Ram Damage} = +1d \text{ per Stage} + 1 \text{ Impact Damage per 10 ft Speed}$ to all involved parties.

---

## 3. Swimming Movement Matrix

| Pace | Speed Multiplier | Medium Speed (15 ft base) | Action Modifiers | Skill Check |
| :--- | :---: | :---: | :---: | :--- |
| **Swimming** | **1x Swim (1/2 Walk)** | 15 ft / 6s (3 kph) | Standard swim | None |
| **Glide** | **2x Swim (1x Walk)** | 30 ft / 6s | **-2 penalty** | **Athletics (Swim) DC 10+** |
| **Stroke** | **4x Swim (2x Walk)** | 60 ft / 6s | **-4 penalty** | **Athletics (Swim) DC 15+** |
| **Treading** | **1/2 Swim or less** | 7.5 ft / 6s | **+2 bonus** | **Athletics (Swim) DC 5+** |
*(Swimming Feature elevates rates to: 1x Walk [30 ft] Swim, 2x Walk [60 ft] Glide, 3x Walk [90 ft] Stroke).*

---

## 4. Climbing Movement Matrix

| Pace | Base Speed Ratio | Medium Speed | Action Modifiers | Skill Check |
| :--- | :---: | :---: | :---: | :--- |
| **Easy Climb (DC 10+)** | **1/2 Walk** | 15 ft / 6s | Standard climb | **Athletics (Climb)** vs DC 10 |
| **Moderate Climb (DC 15+)**| **1/4 Walk** | 7.5 ft / 6s | Challenging surface | **Athletics (Climb)** vs DC 15 |
| **Difficult Climb (DC 20+)** | **1/10 Walk** | 3 ft / 6s | Sheer wall / ice | **Athletics (Climb)** vs DC 20 |
| **Scaling** | **1x Walk** | 30 ft / 6s | **-2 penalty** | Athletics (Climb) at **-5** |
| **Fast Ascent** | **2x Walk** | 60 ft / 6s | **-4 penalty** | Athletics (Climb) at **-10** |
| **Fast Descent** | **4x Walk** | 120 ft / 6s | **-4 penalty** | **DC 20** or Athletics at **-10** |
*(Climbing Feature elevates rates to: 1x Walk Climb, 2x Scale, 3x Fast Ascent, 6x Fast Descent).*

---

## 5. Burrowing Movement Matrix

| Pace | Speed Ratio | Medium Speed | Action Modifiers | Practical Application |
| :--- | :---: | :---: | :---: | :--- |
| **Burrowing** | **1/4x Walk** | 7.5 ft / 6s | Displaces earth/sand | Standard underground movement |
| **Tunneling** | **2x Burrow (1/2 Walk)** | 15 ft / 6s | **-2 penalty** | Escape tunnels, offensive breaching |
| **Excavation** | **1/8x Walk** | 3.75 ft / 6s | Shoring & reinforcement | Pit traps, bunker construction |

---

## 6. Movement Fatigue & Exhaustion Rules

- **Trigger**: Sprinting for **5 consecutive combat rounds** or **10 minutes of hurried travel** triggers a **Stamina-based Fortitude Check (DC 15)**.
- **Check Progression**: Checked every minute with a **cumulative -1 penalty** per successive roll.
- **Failure Penalty**: On failure, take **1 point of non-lethal damage per 5 points missed** below the DC (or 5 flat points on standard failure).
- **Exhaustion State**: If Vitality is reduced to 0, take **2 physical Health damage** and gain the **Exhausted** condition (**-2 to all active checks and half movement speed**) until taking a **Light Rest (Nap)**.

## Game Mechanics Rules
```
GroundPaces: Walk(1x), Jog(2x), Run(4x/5x), Sprint(6x/7x)
AerialRam: +1d per FlightStage + 1 Impact per 10ft Speed
Exhausted: -2 to all checks, Movement Speed halved
```

## Gameplay Instructions
Track pace multiples during movement actions and prompt Fortitude DC 15 checks upon sustained sprint triggers.

## Designer Notes
Running, Swimming, Climbing, and Soar features augment speed multiples without increasing subtlety penalties.
