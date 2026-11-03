---
id: "doc-operator-1-01-vitalityhealthstructure"
name: "1.01 Vitality, Health & Structure"
fileName: "1.01.VitalityHealthStructure.md"
relPath: "operator/character_creation/1.01.VitalityHealthStructure.md"
isMasterDoc: false
masterDocId: "doc-operator-1-01-character-creation"
category: "operator_rule"
parent: "doc-operator-1-01-character-creation"
order: 9
perspective: "operator"
entry_type: "Character Creation Rule"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","character_creation","1.01.vitalityhealthstructure","mechanics"]
updatedAt: "2026-11-02T22:49:18.477Z"
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

# **1.01.06 VITALITY, HEALTH & STRUCTURE**

In Tangent, a character's ability to endure and recover from damage is represented by **Vitality** and **Health** (or **Structure Points [SP]** for Synthetics, constructs, and beings with non-typical physiology). Each of these pools plays a distinct role in determining how much trauma a character can sustain and how they recover from injuries.

---

## **1. STARTING VALUES, CP PROGRESSION & ZERO STAMINA SCALING**

* **Baseline Pools (`0 CP`):** Every biological character begins with a flat base of **30 points in Vitality** and **30 points in Health**.
* **Character Point (CP) Increases (`+5` per `1 CP`):** Vitality and Health are increased strictly by spending Character Points (CP) during character creation or advancement at a rate of **+5 points in either Vitality or Health for 1 CP** (`+5 Vitality = 1 CP`; `+5 Health = 1 CP`), with a suggested starting maximum of **60 points each** (6 CP invested in Vitality and 6 CP in Health).
* **Structure Points (`SP` — Synthetics & Constructs):** Structure is calculated by combining the character's Vitality and Health pools (`Base 60 Structure Points [SP]`, increased by **+5 SP per 1 CP**, with a suggested starting maximum of **120 SP**).
* **Zero Stamina Scaling:** The **Stamina (STA)** attribute **never** grants extra Vitality, Health, or Structure points under any circumstance.

| Pool Type | Starting Base (`0 CP`) | CP Purchase Rate | Suggested Starting Maximum |
| :--- | :---: | :---: | :---: |
| **Vitality** *(Non-Lethal / Fatigue & Grazing Buffer)* | **30** | `+5 Vitality` per `1 CP` | **60** *(+30 for 6 CP)* |
| **Health** *(Lethal / Physical Body & Life Force)* | **30** | `+5 Health` per `1 CP` | **60** *(+30 for 6 CP)* |
| **Structure (`SP`)** *(Synthetics, Constructs, Oozes, Undead)* | **60 SP** *(Vit + Hea)* | `+5 SP` per `1 CP` | **120 SP** *(+60 SP for 12 CP)* |

---

## **2. THE ROLE OF THE STAMINA SCORE (BASE TOUGHNESS)**

While the **Stamina (STA)** Ability Score does not increase Vitality or Health pool totals, it determines the character's **Base Toughness**—reducing the damage taken from wounds on a **point-for-point basis** (subtracted after Armor Damage Resistance [DR]). This makes high-Stamina characters significantly more resilient against every incoming strike without inflating hit-point bloat. Stamina also governs **Fortitude Saving Throws** and sets the character's **Stability Points (`Stamina Score + 5`)** / negative Health **Threshold of Death (`-Stamina Score`)**.

---

## **3. POOL DEFINITIONS**

### **A. Vitality**

**Vitality** represents a character's overall physical endurance, luck, reflexes, and ability to withstand non-lethal damage. It acts as a primary buffer, absorbing damage from pummeling, grazing strikes, falls, environmental hazards, and other forms of harm that are not immediately life-threatening. Vitality is also depleted by exhaustion, movement fatigue, and physical stress. Only when a character's **Vitality is completely depleted (`0`)** does subsequent damage overflow into their **Health** (except on Critical Hits or effects that explicitly bypass Vitality).
* **Starting Score:** **30 Vitality**, increased by **+5 points per 1 CP**.

### **B. Health**

**Health** represents a character's physical body, structural tissues, and life force against lethal attacks. Damage to Health comes from overflow trauma after Vitality reaches 0, Critical Hits (`Natural 20`), bleeding, and severe localized injuries that directly threaten a character's life. When a character's **Health reaches `0`**, they fall unconscious and enter the **Mortality State** (`1.01.RestAndDying.md`).
* **Starting Score:** **30 Health**, increased by **+5 points per 1 CP**.

### **C. Structure (`SP`)**

**Structure** applies to inanimate objects, vehicles, mecha, constructs, and creatures with non-standard anatomies—such as **Synthetics, Full Body Conversions (FBCs), Elementals, Golems, Oozes, and Undead**. It measures their physical integrity and functions like Health, but without a separate Vitality buffer. Damage to Structure can impair subsystems, trigger system failures at 50% SP, or lead to total destruction at 0 / negative SP.
* **Calculation:** Calculate the character's Vitality and Health scores and combine them for their **Structure Points (`SP = Vitality + Health`)**—starting at **Base 60 SP** and increasing by **+5 SP per 1 CP** (`150 CP Construct Parity Rule`).

---

## **4. FALLING DAMAGE, EXPLOSIONS & CRASHES (CONCUSSIVE DAMAGE)**

**Concussive Damage** (from high falls, explosive blast overpressure, and vehicular crashes) is unique in that it is heavily traumatic yet dispersed across the entire body:

* **The 50/50 Concussive Split:** Whenever a character actively attempts to reduce or evade Concussive damage (such as rolling a Reflex Save, Piloting check, or Acrobatics check), the resulting net Concussive damage is **divided equally (50/50) between Vitality and Health**, regardless of whether the save or check succeeded or failed. This reflects the simultaneous combination of non-lethal shock/bruising and lethal internal trauma caused by high-energy impacts.
* **Localized Secondary Hazards:** This 50/50 split applies only to the concussive force itself; it does **not** include additional localized damage from hazards at the point of impact (such as falling onto impaling spikes, jagged debris, acid vats, or molten lava), which are resolved normally.

