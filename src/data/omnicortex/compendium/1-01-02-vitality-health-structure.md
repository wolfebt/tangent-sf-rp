---
id: "1-01-02-vitality-health-structure"
name: "1.01.02 Vitality, Health, Structure & Toughness"
category: "compendium"
parent: "1.00 CHARACTER CREATION & ECONOMY"
order: 3
perspective: "operator"
entry_type: "Operator Rule"
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

# 1.01.02 Vitality, Health, Structure & Toughness

In Tangent, a character's ability to endure and recover from damage is represented by **Vitality**, **Health**, and **Structure** (for Synthetics and non-biological entities).

---

## 1. Vitality vs. Health Breakdown

- **Vitality (Starting Base: 30):** Represents energy, stamina, physical resilience, and luck. Non-lethal damage, fatigue, and minor scrapes deplete Vitality first.
- **Health (Starting Base: 30):** Represents biological life force and anatomical integrity. Severe weapon trauma, critical hits, and deep wounds damage Health after Vitality is exhausted.
- **Structure (Combined Pool):** For Synthetics, Golems, Mecha, and Undead lacking biological buffers, Vitality and Health are combined into a single unified **Structure** pool.

---

## 2. Increasing Pools with Build Points

- **Cost:** **1 BP = +5 Vitality** or **+5 Health** during character creation.
- **Suggested Soft Cap:** 60 points in each pool at character creation.

---

## 3. Toughness & Damage Reduction

- **Toughness:** A character's Stamina score provides base **Toughness**, reducing incoming kinetic and physical trauma on a point-for-point basis before Armor DR.

---

## 4. Concussive Damage, Explosions & Falls

Concussive and blast damage is dispersed over the entire body:
- If a character attempts a defensive reaction (Reflex save), blast damage is **divided equally between Vitality and Health**.

## Game Mechanics Rules
```
StartingVitality = 30 + (PurchasedBP * 5)
StartingHealth = 30 + (PurchasedBP * 5)
Structure = Vitality + Health (for Synthetics/Objects)
DamageSoak = IncomingDamage - Toughness - ArmorDR
```

## Gameplay Instructions
Deplete Vitality first when taking damage from standard attacks; apply damage to Health once Vitality reaches 0.

## Designer Notes
Critical hits bypass the Vitality buffer and inflict direct Health damage.
