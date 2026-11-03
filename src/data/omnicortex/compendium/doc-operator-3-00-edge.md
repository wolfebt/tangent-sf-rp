---
id: "doc-operator-3-00-edge"
name: "3.00 Edge"
fileName: "3.00.Edge.md"
relPath: "operator/combat/3.00.Edge.md"
isMasterDoc: false
masterDocId: "doc-operator-3-00-combat"
category: "operator_rule"
parent: "doc-operator-3-00-combat"
order: 234
perspective: "operator"
entry_type: "Combat Module"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","combat","3.00.edge","mechanics"]
updatedAt: "2026-11-03T10:29:35.932Z"
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

# **3.00.01 EDGE & TACTICAL MANEUVERS**

**Edge** refers to tactical advantage modifiers that characters can gain or lose based on their movements, elevation, positioning, cover, and deception during combat. These modifiers significantly influence the outcome of attack and defense rolls, making positioning and action economy central to tactical combat.

---

## **1. POSITIONAL & MOVEMENT EDGE**

### **Aiming**

Having the target in sights and taking time to steady and lead the shot grants **+2 to Strike per round/action of Aiming**, up to a maximum bonus equal to **1/2 the attacker's Combat Skill Rank** (or `[Agility * 2] + 2`). Requires an Aim action; the attacker cannot move prior to firing the aimed shot.

### **Flanking**

Tactical advantage gained when an attacker and at least one conscious ally are positioned on opposite sides or angles of the same target. This positioning forces the defender to divide their attention, granting a **+2 bonus to Melee Strike rolls** to each flanking attacker.

### **Advancing Target (Reckless Approach)**

When an opponent approaches directly toward you without utilizing Cover or Evasive Movement, you may make an **Extra Reaction Attack against the target at `-5` to Strike**, and **re-roll Initiative** for the next round if they successfully move into Melee reach.

### **Retreating Target (Unprotected Flight)**

When an opponent quickly leaves a threatened area at Jog, Run, or Sprint speed while forgoing Evasion or Cover, threatened defenders may make an **Extra Reaction Attack against the target at `-5` to Strike** and **re-roll Initiative**.

### **High Ground**

Attacking from superior elevation (rooftops, ledges, stairs, flying, or standing over a Prone opponent) grants **+2 to Strike** and **+2 to Critical Threat / Damage Range**.

### **Prone**

Lying flat on the ground:
* **Against Melee / Point Blank Opponents:** Opponents within Melee or Point Blank range gain the **High Ground Bonus (`+2` to Strike and `+2` to Critical Range)** against the Prone combatant, while the Prone combatant suffers `-2` on Melee strikes.
* **Against Ranged Opponents (Beyond Point Blank):** The Prone combatant receives a **+2 Defense Bonus for each Range Category beyond Point Blank** due to ground profile cover *(an opponent with High Ground at range reduces this bonus according to their line of effect)*.
* **Taking Full Cover:** With a successful active **Defense check**, a Prone combatant behind low cover may claim **Full Cover** from ranged attacks.
* **Standing Up:** Requires a **Move Action**.

### **Braced**

Planting one's stance to receive a Charge, hold a line, or fire heavy weaponry:
* Negates heavy weapon recoil penalties and grants **Advantage** on Might/Stability saves against being tripped, shoved, or overrun.
* Allows a **Block or readied weapon strike** to be used as an immediate counter-attack upon being hit or approached by an **Advancing / Charging Target**.

### **Charge**

Rushing at least 10 feet in a straight line into melee:
* On a successful strike, add **+1d bonus Weapon Damage** plus **+1 point of Impact Damage per 10 feet of Speed** (up to a maximum of **+100% increase** in the attack's base damage), while taking **`-1` to Strike per stage of speed** (*Walk `-1`, Jog `-2`, Run `-3`, Sprint `-4`*) and `-2` to Defense until the start of the attacker's next turn.

### **Close In (Guarded Approach)**

Advancing defensively toward an opponent at base Walk speed with guard raised. Incurs **NO Modifiers** and is **not** counted as an *Advancing Target* (does not provoke the `-5` reaction attack).

### **Withdraw (Guarded Retreat)**

Pulling back defensively from melee at base Walk speed. Incurs **NO Modifiers** and is **not** counted as a *Retreating Target* (does not provoke Opportunity or Retreating Target attacks).

### **Evasive Movement**

Moving quickly while weaving fully defensively. Grants **+1 Defense base, plus an additional +1 Defense per 10 feet of Movement Speed** expended during the turn.

### **Subtle**

A movement and action mode for quiet, sneaky, or low-profile actions intended not to draw attention. Used alongside movement paces and required to maintain or initiate **Stealth**-based skill actions during an encounter.

---

## **2. DECEPTION & AMBUSH EDGE**

### **Feint (False Defense)**

An Attacker can make an opposed **Bluff Check vs. the Target's Insight Check** to lead the target into a **False Defense**, forcing an opening for a follow-up **Sneak Attack** made at **`-5` to Strike**—against which the target has **NO Active/Agility Defense** (base passive armor/size defense only).

### **Surprise / Sneak Attack ("Getting the Drop")**

When the Target is completely unaware of an incoming attack, they are unable to make any Active Defense check to evade the strike or reduce incoming Precision Damage. If an Attacker catches a target unaware, they also have the opportunity to inflict massive bonus damage or debilitating effects if trained:

* **Narrative Triggers:** "Getting the drop on 'em"—whether from a literal backstab, a sniper's long-range shot, waiting in ambush, firing a concealed pistol through a coat pocket, or striking mid-conversation—occurs whenever the attack goes unnoticed until impact, typically resolved via **Stealth vs. Alertness** or **Bluff vs. Insight** alongside environmental factors.
* **Called Ambush (`-5` Strike Option):** Executed at **`-5` to Hit**, but with **NO DEFENSE** from the unaware target; **Weapon Damage is rolled with Advantage** (roll damage dice twice and keep highest) in addition to **Sneak Attack bonus dice** (`+1d6` per rank + Intellect Mod, applied if at least 1 point of damage penetrates Armor DR).
* **Danger Sense Counter:** The **Danger Sense** Feature (`1.08.GeneralFeatures.md`) allows the defender to roll an **Advantageous Alertness check** to become aware of an impending attack regardless of the source.

