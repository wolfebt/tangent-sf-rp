---
id: "3-00-06-health-wound-thresholds-mortality"
name: "3.00.06 Health, Wound Thresholds, Hit Locations & Mortality (0 HP)"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 7
perspective: "architect"
entry_type: "Combat Matrix"
---

# 3.00.06 Health, Wound Thresholds, Hit Locations & Mortality (0 HP)

Combat lethality in Tangent tracks physical Hit Points, critical wound thresholds, hit locations, and the critical **Mortality State (0 HP)**.

---

## 1. Hit Locations & Called Shots (d100 / d20 Table)

| d20 Roll | Hit Location | Target DC Modifier | Damage & Trauma Effect |
| :---: | :--- | :---: | :--- |
| **1 – 4** | **Legs** | -2 to hit | Movement speed halved; Fortitude save to avoid falling Prone. |
| **5 – 8** | **Arms / Hands** | -2 to hit | Target drops held weapon; -2 penalty on attack rolls. |
| **9 – 16** | **Torso (Center Mass)** | **0 (Base)** | Standard full damage to Armor DR and HP. |
| **17 – 19** | **Sensory / Vitals** | +4 to hit | Target Blinded / Stunned for 1 round; +1d6 bonus damage. |
| **20** | **Head / Core** | +6 to hit | **Critical Headshot:** Double damage; immediate Fortitude save or unconscious. |

---

## 2. The Mortality State (0 HP)
- When a character reaches **0 Hit Points**, they immediately collapse and enter the **Bleeding Out** state.
- **Bleeding Out Mechanics:**
  - Character is unconscious and incapacitated.
  - At the start of each combat turn, roll a **Fortitude Save (DC 15)**:
    - *Success:* Character stabilizes at 0 HP.
    - *Failure:* Character gains 1 Death Mark. (3 Death Marks = **Permanent Death**).
    - *Natural 20:* Character regains consciousness at 1 HP.
- **Medical Trauma Intervention:** An ally with a Medkit can stabilize a bleeding character with a **Medicine check (DC 15)**.

## Game Mechanics Rules
```
Mortality: 0 HP -> Bleeding Out -> Fortitude Save DC 15 each turn
3 Failed Saves = Death | Medicine DC 15 = Stabilized
```

## Gameplay Instructions
When a character hits 0 HP, initiate death saving throws on their turn until stabilized or medically treated.

## Designer Notes
Called shots allow precision snipers to disable enemy limbs or destroy sensory visors.
