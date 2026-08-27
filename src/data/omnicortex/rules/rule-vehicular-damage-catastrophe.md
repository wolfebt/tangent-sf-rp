---
id: rule-vehicular-damage-catastrophe
name: 'Vehicular Damage, System Failures & Catastrophe'
category: rules
description: >-
  Glancing vs penetrating hits, d6 System Failure Table, 0 SP disabled, -50%
  destroyed, and catastrophic explosion radius & damage.
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
# Vehicular Damage, System Failures & Catastrophe

**Category**: Core Combat Rules & Tables

Vehicles do not simply lose hit points; they degrade, catch fire, suffer critical system outages, and catastrophically explode.

---

## 1. Damage Thresholds
- **Glancing Blow**: Damage $\le$ Armor DR. No effect (shots ricochet).
- **Penetrating Hit**: Damage $>$ Armor DR. Subtract Armor DR from incoming damage, and apply the remaining damage to **Structure Points (SP)**.
- **Critical Hit**: Triggered on a **Natural 20** or when an attack roll exceeds target Defense by **10+**. Roll immediately on the **System Failure Table**.

---

## 2. System Failure Table (d6)
Rolled when a vehicle suffers a Critical Hit or reaches **50% max SP**:

| Roll (d6) | System Failure | Mechanical Effect |
| :---: | :--- | :--- |
| **1** | **Motive System** | Speed reduced by **50%** (thrown tread, clipped wing, blown repulsor). |
| **2** | **Weapon System** | One random weapon system disabled or jammed. |
| **3** | **Sensor / Comms** | Blinded or silenced. All targeting rolls suffer **Disadvantage**. |
| **4** | **Crew Compartment**| Cockpit breached. Pilot and crew take **half the damage** dealt to the vehicle. |
| **5** | **Power Plant** | Internal fire and smoke. Vehicle suffers **1d6 Burn damage per turn**. |
| **6** | **Catastrophic Leak**| Fuel line or reactor unstable. **Explodes in 1d4 rounds** unless repaired. |

---

## 3. Vehicle Destruction
- **0 SP (Disabled)**: The vehicle stops moving. All main engines and primary weapons go offline. Can be salvaged and repaired.
- **Negative SP $>$ 50% Max (Destroyed)**: The chassis is a shattered wreck with scrap value only.
- **Catastrophic Explosion**: If a vehicle is destroyed by **Fire or Explosive damage**, it detonates:
  - *Explosion Radius*: **10 feet per Size Category**.
  - *Explosion Damage*: **1d6 per 10 SP** of the vehicle's maximum Structure Points.
