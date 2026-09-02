---
id: "3-00-06-health-wound-thresholds-mortality"
name: "3.00.06 Hit Locations, Limb Trauma & Mortality State (0 HP)"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 7
perspective: "architect"
entry_type: "Combat Matrix"
tl: 3
ml: 0
cost: 0
tags: ["compendium","combat-matrix"]
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

# 3.00.06 Hit Locations, Limb Trauma & Mortality State (0 HP)

Combat lethality in Tangent tracks targeted body locations, specific trauma saving throws, limb disabling/destruction thresholds, and the **Mortality State (0 HP)**.

---

## 1. Hit Locations & Called Shots (d10 Table)

Roll **1d10** on a critical hit or when random location is required. In Melee and Unarmed combat, roll **1d6** unless a Leg Attack or specific maneuver is declared.

### Called Shot Modifiers
- **Torso or Leg:** **-2 Strike Penalty**
- **Head or Arm:** **-4 Strike Penalty**

### Locations & Trauma Saves Table

| Roll (d10) | Location | Trauma Effect | Save & Failure Severity |
| :---: | :--- | :--- | :--- |
| **1** | **HEAD** | **KO** | **Reason Save** or Stunned for 1+ rounds*; failure by 10+ = **Unconscious**. |
| **2, 3, 4** | **TORSO** | **Winded** | **Fortitude Save** or cumulative -2 on actions for 1+ rounds*; failure by 10+ = **Gasping / Incapacitated**. |
| **5 (R) or 6 (L)** | **ARM** | **Disarmed** | **Reflex Save** or drop held item; failure by 10+ = **Arm Crippled / Non-Functional**. |
| **7, 8 (R) or 9, 0 (L)**| **LEG** | **Hobbled** | **Might Save** or half speed for 1+ rounds*; failure by 10+ = **Leg Crippled / Non-Functional**. |

\* **Duration of Impediment:** 1 round per point rolled under the save CR (where CR is based directly on the damage dealt).

---

## 2. Limb Damage Thresholds: Disabled vs. Destroyed

### Disabled (1/3rd Health in Damage)
- Taking **1/3rd of Health Score** in damage to a limb disables it (or causes Unconsciousness if dealt to the Head).
- **Stamina Check:** Pass a **Stamina Check with CR = 10 + Damage Taken** to keep using the limb.
- **Penalties:**
  - **Head:** **-4 on all actions**.
  - **Arm:** **-4 Strength and Agility** for actions using that arm.
  - **Leg:** **Half Ground Speed** and **no Rush Maneuver**.
- Requires medical attention or Metaphysics to restore.

### Destroyed (2/3rds Health in Damage)
- Taking **2/3rds of Health Score** in damage to an area damages it **beyond ANY further use** (Brain Death** if Head).
- **NO Check:** It is mangled beyond use. Traumatic Damage Control is immediately required for shock, blood loss, and vital collapse.
- \*\* *Brain death is at the GM's discretion. If the character survives, they remain disabled and require intense recovery and surgery.*

---

## 3. Technology Level 3+ Limb Replacements & Cybernetics

- **Surgery & Recovery:** Requires **1 day of surgery and recovery** whether Biological or Synthetic.
  - **Biological Limb:** Must be tissue-matched (**+1 day**) or lab-grown (**+2d4 days**).
  - **Synthetic Cyber-Limb:** Available stock can be prepped for installation during surgery time.
- **Body Replacement:** Tech 4 Tran-Cerebral Venture; Tech 5 Consciousness Transfer.
- **Bio vs. Synthetic Durability:**
  - **Bio / Natural Limbs:** Baseline damage capacity for Disabled and Destroyed.
  - **Synthetic Limbs:** Can take **50% more damage** before reaching Disabled or Destroyed, but **may NOT get the Stamina check** to remain functional once reaching Disabled.

---

## 4. The Mortality State (0 Hit Points)

When a character's Health Points reach 0, they enter the **Mortality State**:
1. **Unconscious and Incapacitated:** The character immediately falls Prone and is Incapacitated.
2. **Bleeding Out:** At the beginning of the character's turn, they suffer **1 point of Stability Damage**.
3. **Stability Threshold:** A character has a Stability Points total equal to their **Constitution Score + 5**.
4. **Death:** If Stability Points reach 0, the character expires.
5. **Stabilization:** First aid via Medicine Check (DC 15) or metaphysical healing stabilizes the character.

## Game Mechanics Rules
```
HitLocation: 1d10 (1 Head, 2-4 Torso, 5-6 Arm, 7-0 Leg; 1d6 melee)
CalledShots: -2 Torso/Leg, -4 Head/Arm
TraumaSaves: Head (Reason), Torso (Fort), Arm (Ref), Leg (Might); duration = points under CR
Disabled: 1/3 Health -> Sta check CR 10+dmg to keep using (-4 actions head, -4 Str/Agi arm, 1/2 speed leg)
Destroyed: 2/3 Health -> Mangled, no check, brain death GM discretion
SynthLimbs: +50% damage threshold before Disabled/Destroyed (no Sta check)
Mortality: 0 HP -> Bleeding out (1 Stability Dmg/rnd), Stability Pool = CON + 5
```

## Gameplay Instructions
Roll 1d10 for critical hit location or declare called shot (-2 or -4). Track limb damage at 1/3 and 2/3 Health thresholds.

## Designer Notes

