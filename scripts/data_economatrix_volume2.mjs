export const economatrixVolume2Articles = [
  {
    id: "2-00-economatrix-system-overview",
    name: "2.00 Economatrix Overview, Wealth Scores & Liquid Credits",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 1,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "economatrix", "core-rule"],
    description: `# 2.00 Economatrix Overview, Wealth Scores & Liquid Credits

The Tangent Economatrix bridges abstract **Wealth Scores (WS)** representing sustained lifestyle and credit lines with liquid **Credits (Cr)** for transactional equipment acquisition.

---

## 1. Wealth Score (WS) Lifestyle Tiers
| Wealth Score | Lifestyle Bracket | Standard Accommodations & Gear Access |
| :---: | :--- | :--- |
| **0 – 9** | **Destitute / Indebted** | Slum cubicles, discarded rations, unmaintained kinetic weapons. |
| **10 – 19** | **Working Class** | Arcology residential tier, standard commercial food, TL3 kinetic firearms. |
| **20 – 39** | **Professional / Operative** | Private modular quarters, advanced medical care, military-grade armor & lasers. |
| **40 – 59** | **Elite / Executive** | Penthouse suites, private sub-orbital transport, custom prototype weaponry. |
| **60 – 79** | **Galactic Oligarch** | Orbital mansions, private security fleet, bespoke augmentations. |
| **80+** | **Sovereign / Hegemon** | Planetary holdings, personal star dreadnoughts, deific relics. |

---

## 2. Liquid Currency & Denominations
- **Credit (Cr):** The universal interstellar fiat currency backed by standard energy and refined mineral reserves.
- **Mega-Credit (MCr):** $1\\text{ MCr} = 1,000,000\\text{ Credits}$. Used for starship hull construction, orbital station leasing, and planetary corporate acquisitions.
- **Crafting DC Formula:** Value $= 10 \\times 4^{(\\text{DC}/5)}$ Credits.`,
    mechanic: `Liquid Credits: Transactional currency for purchasing equipment, bribes, black market mods.
Wealth Score Check: d20 + Wealth Score vs Requisition DC to requisition gear on credit.`,
    guide: `Use Wealth Scores for routine lifestyle purchases; track liquid Credits for black market and tactical purchases.`,
    note: `Crafting items requires materials equal to 50% of the item market value.`
  },
  {
    id: "2-01-tech-levels-and-manufacturing",
    name: "2.01 Tech Levels (TL 0–5) & Manufacturing DC Hierarchy",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 2,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "tech-levels", "core-rule"],
    description: `# 2.01 Tech Levels (TL 0–5) & Manufacturing DC Hierarchy

Technology across the galaxy is categorized into 6 distinct Tech Levels:

| Tech Level | Epoch Name | Defining Technologies & Weaponry |
| :---: | :--- | :--- |
| **TL 0** | **Primitive / Archaic** | Flintlock firearms, forged iron blades, muscle-powered bows, non-powered armor. |
| **TL 1** | **Industrial / Steam** | Rifled black powder guns, steam boilers, telegraph communications, ironclad plating. |
| **TL 2** | **Combustion / Electronic** | Cased kinetic firearms, internal combustion engines, radio, radar, composite flak. |
| **TL 3** | **Interplanetary / Digital** | Solid-state electronics, fusion reactors, magnetic slugthrowers, polymer combat armor. |
| **TL 4** | **Interstellar / Coherent** | Faster-than-light hyper-drives, plasma rifles, coherent laser weapons, neural cybernetics. |
| **TL 5** | **Post-Scarcity / Singularity**| Hard-light constructs, quantum teleportation, antimatter arrays, dark-energy shielding. |`,
    mechanic: `Tech Level Compatibility:
- Equipment above campaign TL incurs +5 DC to repair, modify, or reload.
- Cross-TL modifications require specialized adapter sockets.`,
    guide: `Verify campaign Tech Level before purchasing or fielding advanced hardware.`,
    note: `TL5 artifacts are generally unique relics or requires Architect authorization.`
  },
  {
    id: "2-02-weaponry-master-catalog",
    name: "2.02 Weaponry Catalog, Damage Classifications & Sockets",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 3,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "weaponry", "core-rule"],
    description: `# 2.02 Weaponry Catalog, Damage Classifications & Sockets

Weapon systems in Tangent are categorized by damage type, range profile, wielding configuration, and modular socket capacity.

---

## 1. Damage Classifications
- **Kinetic (Ballistic/Piercing):** High velocity magnetic slugs and bullets. Vulnerable to kinetic composite DR.
- **Energy (Laser/Coherent Light):** High precision, pinpoint armor ablation. Penetrates light shielding.
- **Thermal (Plasma/Fire):** Extreme heat causing ongoing burn damage and melting armor DR.
- **Cryo (Sub-Zero/Endothermic):** Freezes actuators and organic tissue, imposing movement penalties.
- **Disruption (Sonic/Vibrational):** Bypasses physical armor DR to damage internal structures and organs directly.

---

## 2. Weapon Modding & Sockets
Every weapon possesses between 0 and 4 **Sockets** allowing Operators to mount scopes, smart-links, recoil compensators, extended magazines, and elemental conversion matrices.`,
    mechanic: `Damage Roll: Base Weapon Dice (e.g. 2d8) + Skill Rank Modifier + Critical Burst.
Armor Piercing (AP X): Ignores X points of target Armor DR before applying damage to Vitality.`,
    guide: `Equip weapons in the Folio inventory to automatically calculate strike and damage bonuses.`,
    note: `Reloading a weapon takes 1 Standard Action.`
  },
  {
    id: "2-03-armoring-and-defenses",
    name: "2.03 Armoring, Damage Reduction (DR) & Powered Suits",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "2.00 ECONOMATRIX & TECHNOLOGY",
    order: 4,
    perspective: "both",
    tl: 3,
    ml: 0,
    cost: 0,
    tags: ["compendium", "volume-2", "armoring", "core-rule"],
    description: `# 2.03 Armoring, Damage Reduction (DR) & Powered Suits

Armor provides passive **Damage Reduction (DR)** that subtracts a flat value from incoming attacks before damage is applied to Vitality or Health.

---

## Armor Classifications
| Armor Class | Typical DR (Kin / Eng) | Coverage Zones | Agility / Encumbrance Penalty | Power Requirement |
| :--- | :---: | :--- | :---: | :--- |
| **Light Armor** | DR 2 / 2 | Torso, Arms | None | None |
| **Medium Tactical** | DR 5 / 4 | Head, Torso, Arms, Legs | -1 Reflex | None |
| **Heavy Combat Suit** | DR 8 / 7 | Full Body (Sealed) | -2 Reflex, -5 ft Pace | None |
| **Powered Assault Armor**| DR 12 / 10 | Full Sealed Frame | None (Servo-assisted +2 STR) | 1 Micro-Fusion Cell / 24 hrs |
| **Aegis Shield** | DR +4 / +4 | Directional Forward Arc | 1-Hand Wielded | None |`,
    mechanic: `Effective Damage = Incoming Attack Damage - Armor DR (Kinetic or Energy based on damage type).
Minimum Damage: Attacks that hit always deal at least 1 point of damage unless target has Complete Immunity.`,
    guide: `Slotted armor reduces incoming damage before it touches your Vitality buffer.`,
    note: `Powered armor requires active battery cells; unpowered suits impose -4 to Agility checks.`
  }
];
