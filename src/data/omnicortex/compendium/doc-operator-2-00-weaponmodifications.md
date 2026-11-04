---
id: "doc-operator-2-00-weaponmodifications"
name: "2.00 Weapon Modifications"
fileName: "2.00.WeaponModifications.md"
relPath: "operator/economatrix/2.00.WeaponModifications.md"
isMasterDoc: false
masterDocId: "doc-operator-2-00-economatrix"
category: "operator_rule"
parent: "doc-operator-2-00-economatrix"
order: 233
perspective: "operator"
entry_type: "Economatrix Catalog"
tl: 3
ml: 0
cost: 0
tags: ["operator","core-rules","modular-rule","economatrix","2.00.weaponmodifications","mechanics"]
updatedAt: "2026-11-04T09:33:29.415Z"
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

# **2.00.06 WEAPON MODIFICATIONS**

All weapon upgrades, capacity clips, and downgrades occupy **Tier 1 UDU Sockets** according to weapon size (Tiny = 1 Socket, Small = 2 Sockets, Medium = 4 Sockets, Large = 6 Sockets) and are priced via `Value = 10 * 4 ^ (CR / 5)`.

---

## **1. WEAPON UPGRADES**

| Upgrade Name | Mechanical Function | Restriction | Weaponsmith CR | Market Value |
| :--- | :--- | :--- | :---: | :---: |
| **Accurate (+1 / +2 / +3)** | +1 / +2 / +3 bonus to Attack (Strike) rolls. | None | CR 10 / 20 / 30 | 160 / 2,560 / 40,960 Cr |
| **Automated** | Grants **Auto-Fire** capability to a semi-auto weapon. | Ranged | CR 20 | 2,560 Cr |
| **Collapsible** | Stows one Size Category smaller inside clothing/pack. | None | CR 15 | 640 Cr |
| **Concealed** | Disguised housing (+2 Stealth/Legerdemain to hide). | None | CR 10 | 160 Cr |
| **Electrified** | Adds **+1d6 + 1 Voltic damage** on hit. | Melee | CR 15 | 640 Cr |
| **Improved Damage** | Adds **+2 flat damage** to all hits. | None | CR 20 | 2,560 Cr |
| **Improved Range** | Doubles (**x2**) Base Range increment. | Ranged | CR 15 | 640 Cr |
| **Motion Sensitive** | Automated sentry trigger; fires at moving targets in arc. | TL 3+, Ranged | CR 20 | 2,560 Cr |
| **Nondetection** | Sensor-baffled materials undetectable by standard scans. | TL 4+ | CR 30 | 40,960 Cr |
| **Radar Targeting** | **+2 to Strike** against moving targets. | TL 3+, Ranged | CR 20 | 2,560 Cr |
| **Reconfigurable** | Shifts between two distinct weapon forms (Multi-Form). | TL 4+, Multi-Form | CR 30 | 40,960 Cr |
| **Reduced Weight** | Composite construction reduces weight by **50%**. | None | CR 10 | 160 Cr |
| **Sound Targeting** | **+2 to Strike** against targets making noise. | TL 3+, Ranged | CR 20 | 2,560 Cr |
| **Stick Pad** | Electro-adhesive grip adheres to hand, target, or wall. | TL 3+ | CR 15 | 640 Cr |
| **Subdual Mode** | Selective toggle between Lethal and Non-Lethal damage. | TL 3+ | CR 25 | 10,240 Cr |
| **Thermal Targeting** | **+2 to Strike** against targets with heat signatures. | TL 3+, Ranged | CR 20 | 2,560 Cr |
| **Voice Activated** | Biometric vocal command lock and trigger. | TL 3+ | CR 25 | 10,240 Cr |

---

## **2. CAPACITY (CLIP) UPGRADES**

| Clip Type | Capacity Multiplier | Restriction | Weaponsmith CR | Market Value |
| :--- | :--- | :--- | :---: | :---: |
| **Typical** | x1 Standard Magazine / Cell | — | — | Included |
| **Double** | **x2 Capacity** | Ranged | CR 10 | 160 Cr |
| **Triple** | **x3 Capacity** | Ranged | CR 15 | 640 Cr |
| **Pack** | **x5 Capacity** | Ranged / Heavy | CR 20 | 2,560 Cr |
| **Canister** | **x10 Capacity** | Heavy / Ranged | CR 25 | 10,240 Cr |
| **Hopper** | **x20 Capacity** | Heavy / Emplacement | CR 30 | 40,960 Cr |

---

## **3. WEAPON DOWNGRADES (FLAWS)**

| Downgrade Name | Mechanical Drawback | Restriction | Crafting CR Mod | Value Adjustment |
| :--- | :--- | :--- | :---: | :--- |
| **Decreased Range** | Halves (1/2) Base Range increment. | Ranged Weapons | **-5 CR** | 1/4x Market Value |
| **Disposable** | Single-use, non-reloadable chassis. | Ranged / Launcher | **-5 CR** | 1/4x Market Value |
| **Increased Size** | Counts 1 Size Category larger for bulk and concealment. | None | **-5 CR** *(or -1 CR Flaw = x0.75)* | Reduces Crafting CR |
| **Increased Weight** | +50% weapon weight. | None | **-5 CR** *(or -1 CR Flaw = x0.75)* | Reduces Crafting CR |
| **Reduced Accuracy** | -1 penalty to Attack (Strike) rolls. | None | **-5 CR** *(or -1 CR Flaw = x0.75)* | Reduces Crafting CR |
| **Reduced Damage** | Reduces weapon damage die size by 1 step. | None | **-5 CR** | 1/4x Market Value |

