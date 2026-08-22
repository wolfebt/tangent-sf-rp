# PLAN 15: CODEX FOUNDATION ENGINES

> Phase 0 | Prerequisite for all matrix tools | No source matrix — derived from `ECONOMATRIX.md` + `TECHNOLOGY.md`

---

## Overview

Build the shared calculation engine library that powers all 14 matrix tools. These pure-function modules encapsulate every formula, lookup table, enum, and constant defined in the ECONOMATRIX and TECHNOLOGY documents. They have zero React dependencies and can be unit-tested independently.

---

## Proposed Changes

### New Files

#### [NEW] `src/engines/tangentConstants.js`

Central repository for all enums, lookup tables, and static reference data. This is the single source of truth for game system constants.

**Contents:**

```javascript
// ═══════════════════════════════════════════════════════════
// TECH LEVELS
// ═══════════════════════════════════════════════════════════

export const TECH_LEVELS = {
  0: { id: 0, name: 'TL 0', era: 'Stone Age', subtitle: 'Primitive / Pre-Industrial', wealthMod: -4,
       powerSources: ['Muscle', 'Fire', 'Wind', 'Water'],
       species: ['Fae', 'Koban', 'Thorns'],
       educationBonus: { type: 'skills', value: '+2 Alertness, +2 Survival, 1 Skill +2' },
       restrictedSkills: ['Piloting', 'Engineering', 'Computer'] },
  1: { id: 1, name: 'TL 1', era: 'Metal Age', subtitle: 'Industrial / Mechanical', wealthMod: -2,
       powerSources: ['Coal', 'Steam', 'Early Fossil Fuel'],
       species: ['Caprians', 'Orlls', 'Truldan', 'Vassoth', 'Weti'],
       educationBonus: { type: 'skills', value: '2 Vocation Skills +2, 4 Skills +2' },
       restrictedSkills: ['Piloting', 'Computer'] },
  2: { id: 2, name: 'TL 2', era: 'Data Age', subtitle: 'Digital / Information', wealthMod: 0,
       powerSources: ['Hydrocarbons', 'Fission', 'Renewables'],
       species: ['Brei', 'Dwergs', 'Prokoss', 'Qerics', 'Terran Humans'],
       educationBonus: { type: 'skillPoints', value: 20 } },
  3: { id: 3, name: 'TL 3', era: 'Space Age', subtitle: 'Stellar / The Gate Era', wealthMod: 2,
       powerSources: ['Thorium', 'Hydrogen Fuel Cells', 'Ionic', 'Fusion'],
       species: ['Alterians', 'Dynasty', 'Outworlds', 'Independent Factions'],
       educationBonus: { type: 'skillPoints', value: 30 } },
  4: { id: 4, name: 'TL 4', era: 'Stellar Age', subtitle: 'Galactic / The Warp Era', wealthMod: 4,
       powerSources: ['Antimatter', 'Cold Fusion', 'Aetherium', 'Kinetic Reactors'],
       species: ['Impyrium', 'Aulurans', 'Manelli', 'Davae', 'Sefalin', 'Syndicate'],
       educationBonus: { type: 'skillPoints', value: 40 } },
  5: { id: 5, name: 'TL 5', era: 'Galactic Age', subtitle: 'Cosmic / The Singularity', wealthMod: 8,
       powerSources: ['Dimensional Siphons', 'Matter-Energy Conversion', 'ZPE', 'Dark Energy'],
       species: ['Mekan', 'Mondi', "Sha'Nor"],
       educationBonus: { type: 'skillPoints', value: 50 } },
};

export const SUB_STRATA = ['Nascent', 'Standard', 'Advanced']; // TL-, TL, TL+

// ═══════════════════════════════════════════════════════════
// UDU HIERARCHY
// ═══════════════════════════════════════════════════════════

export const UDU_TIERS = {
  Node:   { id: 0, name: 'Node',   label: 'Tier 0', maxWeight: '10g',   ratio: 10, description: 'Micro-unit, cybernetics, options' },
  Socket: { id: 1, name: 'Socket', label: 'Tier 1', maxWeight: '1kg',   ratio: 10, description: 'Personal item, gun, computer, cyberware' },
  Mount:  { id: 2, name: 'Mount',  label: 'Tier 2', maxWeight: '100kg', ratio: 10, description: 'Mecha/Vehicle scale component' },
  Module: { id: 3, name: 'Module', label: 'Tier 3', maxWeight: '10t',   ratio: null, description: 'Architecture/Starship scale' },
};

// ═══════════════════════════════════════════════════════════
// TOOL / PRODUCTION TIER MULTIPLIERS
// ═══════════════════════════════════════════════════════════

export const TOOL_TIERS = [
  { id: 'improvised',    name: 'Tier 0 — Improvised',      multiplier: 1,    description: 'Bare hands, stone tools' },
  { id: 'basic',         name: 'Tier 1 — Basic',           multiplier: 10,   description: 'Handheld tools, garage kit' },
  { id: 'advanced',      name: 'Tier 2 — Advanced',        multiplier: 50,   description: 'Professional shop, alchemist lab' },
  { id: 'industrial',    name: 'Tier 3 — Industrial',      multiplier: 200,  description: 'Automated factory, magical circle' },
  { id: 'nanoforge',     name: 'Tier 4 — Nanoforge',       multiplier: 1000, description: 'Molecular assemblers, swarm fab' },
  { id: 'bioCultivation',name: 'Bio — Cultivation',        multiplier: 1000, description: 'Hyper-growth vats (Medicine + Eng)' },
  { id: 'genesis',       name: 'Tier 5 — Genesis',         multiplier: 5000, description: 'Polymatter loom, holophotonics' },
];

// ═══════════════════════════════════════════════════════════
// FINANCIAL STATUS HIERARCHY
// ═══════════════════════════════════════════════════════════

export const FINANCIAL_STATUS_TABLE = [
  { name: 'Indebted',      wsMin: 0,  wsMax: 0,  bpCost: -5,  autoBuyCr: 0,          netWorth: 'Negative',      lifestyle: 'Debt slavery / prison' },
  { name: 'Impoverished',  wsMin: 1,  wsMax: 4,  bpCost: 0,   autoBuyCr: 30,         netWorth: '<500 Cr',       lifestyle: 'Homeless / squatter' },
  { name: 'Struggling',    wsMin: 5,  wsMax: 9,  bpCost: 2,   autoBuyCr: 150,        netWorth: '~2k Cr',        lifestyle: 'Shared slum room' },
  { name: 'Middle Class',  wsMin: 10, wsMax: 14, bpCost: 5,   autoBuyCr: 600,        netWorth: '~25k Cr',       lifestyle: 'Private apartment' },
  { name: 'Affluent',      wsMin: 15, wsMax: 19, bpCost: 10,  autoBuyCr: 2500,       netWorth: '~200k Cr',      lifestyle: 'High-end condo' },
  { name: 'Wealthy',       wsMin: 20, wsMax: 29, bpCost: 20,  autoBuyCr: 40000,      netWorth: '~5M Cr',        lifestyle: 'Large estate, servants' },
  { name: 'Hegemon',       wsMin: 30, wsMax: 39, bpCost: 35,  autoBuyCr: 650000,     netWorth: '~100M Cr',      lifestyle: 'Penthouse, small corp' },
  { name: 'Industrialist', wsMin: 40, wsMax: 49, bpCost: 50,  autoBuyCr: 10000000,   netWorth: '~2B Cr',        lifestyle: 'Megacorp exec' },
  { name: 'Dynastic',      wsMin: 50, wsMax: 59, bpCost: 70,  autoBuyCr: 167000000,  netWorth: '~50B Cr',       lifestyle: 'CEO / Nobility' },
  { name: 'System Lord',   wsMin: 60, wsMax: 69, bpCost: 95,  autoBuyCr: 2600000000, netWorth: '~500B Cr',      lifestyle: 'Rules solar system' },
  { name: 'Sector Ruler',  wsMin: 70, wsMax: 79, bpCost: 125, autoBuyCr: 42000000000,netWorth: '~10T Cr',       lifestyle: 'Rules star cluster' },
  { name: 'Faction Ruler', wsMin: 80, wsMax: 999,bpCost: 160, autoBuyCr: 600000000000,netWorth:'~1 Quad Cr',    lifestyle: 'Emperor / god-king' },
];

// ═══════════════════════════════════════════════════════════
// WORLD TRADE CODES
// ═══════════════════════════════════════════════════════════

export const WORLD_TRADE_CODES = {
  Ag: { name: 'Agricultural',    modifiers: { Foodstuffs: -30, Textiles: -20, Biologics: -20, Water: -10 } },
  As: { name: 'Asteroid',        modifiers: { 'Metals-Common': -30, 'Metals-Rare': -20, Chemicals: -10, Polymers: 20 } },
  Ba: { name: 'Barren',          modifiers: { Foodstuffs: 30, Water: 40, Textiles: 20 } },
  De: { name: 'Desert',          modifiers: { Water: 50, Foodstuffs: 20, Biologics: 30 } },
  Fl: { name: 'Fluid Oceans',    modifiers: { Chemicals: -30, Biologics: -20, Water: -40 } },
  Ga: { name: 'Garden',          modifiers: { Foodstuffs: -20, Biologics: -30, Water: -20, Luxuries: -10 } },
  Hi: { name: 'High Population', modifiers: { Foodstuffs: 20, Electronics: -10, 'High Tech': -10 } },
  Ht: { name: 'High Tech',       modifiers: { Electronics: -30, 'High Tech': -40, Machinery: -20 } },
  Ic: { name: 'Ice-Capped',      modifiers: { Water: -30, Chemicals: -10, Foodstuffs: 30 } },
  In: { name: 'Industrial',      modifiers: { Machinery: -30, Polymers: -20, 'Metals-Common': -10, Chemicals: -10 } },
  Lo: { name: 'Low Population',  modifiers: { Luxuries: 30, 'High Tech': 20, Electronics: 20 } },
  Lt: { name: 'Low Tech',        modifiers: { 'High Tech': 40, Electronics: 30, Machinery: 20, Weaponry: 20 } },
  Na: { name: 'Non-Agricultural',modifiers: { Foodstuffs: 30, Textiles: 20, Biologics: 20 } },
  Ni: { name: 'Non-Industrial',  modifiers: { Machinery: 20, Polymers: 20, Electronics: 10 } },
  Po: { name: 'Poor',            modifiers: { Luxuries: 30, 'High Tech': 30, Electronics: 20 } },
  Ri: { name: 'Rich/Mining',     modifiers: { 'Metals-Common': -20, 'Metals-Rare': -30, Luxuries: -20 } },
  Va: { name: 'Vacuum',          modifiers: { Foodstuffs: 30, Water: 40, Biologics: 30 } },
  Wa: { name: 'Water World',     modifiers: { Water: -40, Biologics: -20, Foodstuffs: -10 } },
};

// ═══════════════════════════════════════════════════════════
// TRADE COMMODITIES
// ═══════════════════════════════════════════════════════════

export const COMMODITIES = [
  { id: 'foodstuffs',    name: 'Foodstuffs',     category: 'Essential',   baseCostPerTon: 500 },
  { id: 'water',         name: 'Water/Ice',      category: 'Essential',   baseCostPerTon: 250 },
  { id: 'textiles',      name: 'Textiles',       category: 'Essential',   baseCostPerTon: 1000 },
  { id: 'polymers',      name: 'Polymers',       category: 'Industrial',  baseCostPerTon: 4000 },
  { id: 'chemicals',     name: 'Chemicals',      category: 'Industrial',  baseCostPerTon: 5000 },
  { id: 'metals_common', name: 'Metals-Common',  category: 'Industrial',  baseCostPerTon: 7000 },
  { id: 'metals_rare',   name: 'Metals-Rare',    category: 'Industrial',  baseCostPerTon: 25000 },
  { id: 'machinery',     name: 'Machinery',      category: 'Tech',        baseCostPerTon: 15000 },
  { id: 'electronics',   name: 'Electronics',    category: 'Tech',        baseCostPerTon: 30000 },
  { id: 'high_tech',     name: 'High Tech',      category: 'Tech',        baseCostPerTon: 50000 },
  { id: 'luxuries',      name: 'Luxuries',       category: 'Luxury',      baseCostPerTon: 100000 },
  { id: 'biologics',     name: 'Biologics',      category: 'Luxury',      baseCostPerTon: 75000 },
  { id: 'weaponry_cargo',name: 'Weaponry',       category: 'Restricted',  baseCostPerTon: 40000 },
  { id: 'armor_cargo',   name: 'Armor',          category: 'Restricted',  baseCostPerTon: 35000 },
];

// ═══════════════════════════════════════════════════════════
// FACTION WEALTH MODIFIERS
// ═══════════════════════════════════════════════════════════

export const FACTION_WEALTH_MODS = {
  'Alterian Enclave': 3,
  'Auluran / Kitin':  2,
  'Ascendancy':       4,
  'Coalition':        0,
  'Dynasty':          2,
  'Entari':           3,
  'Impyrium':         3,
  'Mekan':            6,
  'Syndicate':        4,
  'Outworlds':        0,
};

// ═══════════════════════════════════════════════════════════
// BODY SLOT NODE CAPACITIES (Augmentations)
// ═══════════════════════════════════════════════════════════

export const BODY_SLOT_NODES = {
  Head:     10,
  Torso:    50,
  LeftArm:  30,
  RightArm: 30,
  LeftLeg:  40,
  RightLeg: 40,
};
export const TOTAL_BODY_NODES = 200;

// ═══════════════════════════════════════════════════════════
// STIGMA THRESHOLDS
// ═══════════════════════════════════════════════════════════

export const STIGMA_THRESHOLDS = [
  { name: 'None',     minMods: 0, maxMods: 0, socialPenalty: 0,  description: 'No visible modification' },
  { name: 'Minor',    minMods: 1, maxMods: 3, socialPenalty: -2, description: 'Noticeable but tolerated' },
  { name: 'Moderate', minMods: 4, maxMods: 6, socialPenalty: -4, description: 'Clearly augmented' },
  { name: 'Severe',   minMods: 7, maxMods: 999,socialPenalty: -8,description: 'Treated as xeno/object' },
];

// ═══════════════════════════════════════════════════════════
// FENCE / RESALE RATES
// ═══════════════════════════════════════════════════════════

export const FENCE_RATES = {
  legal:       0.50,
  blackMarket: 0.225, // avg of 20-25%
  scrap:       0.10,
};

// ═══════════════════════════════════════════════════════════
// CIVILIZATION DOMAINS (16)
// ═══════════════════════════════════════════════════════════

export const CIVILIZATION_DOMAINS = [
  'Agriculture', 'Architecture', 'Biotechnology', 'Commerce', 'Communication',
  'Devices', 'Energy', 'Manufacturing', 'Materials', 'Medicine',
  'Meta Sciences', 'Science', 'Society', 'Synthetic Intelligence', 'Transportation', 'Weaponry',
];

// ═══════════════════════════════════════════════════════════
// TECHNOLOGIST FIELDS OF STUDY (17)
// ═══════════════════════════════════════════════════════════

export const TECHNOLOGIST_FIELDS = [
  ...CIVILIZATION_DOMAINS, 'Education',
];

// ═══════════════════════════════════════════════════════════
// ADAPTIVE TECHNOLOGY TYPES
// ═══════════════════════════════════════════════════════════

export const ADAPTIVE_TECH_TYPES = [
  { id: 'nanotech',     name: 'Nanotechnology',                tl: 3, reconfigTime: 'Minutes (10 Rounds)',    trigger: 'Move Action' },
  { id: 'biotech',      name: 'Biotechnology',                 tl: 3, reconfigTime: 'Minutes (10 Rounds)',    trigger: 'Move Action' },
  { id: 'picotech',     name: 'Programmable Matter (Picotech)',tl: 4, reconfigTime: '1 Full Round',           trigger: 'Move Action' },
  { id: 'polymatter',   name: 'Polymatter (Femtotech)',        tl: 5, reconfigTime: '1 Round',                trigger: 'Move Action' },
  { id: 'holophotonic', name: 'Holophotonics (Solid Energy)',  tl: 5, reconfigTime: 'Instant (same round)',   trigger: 'Move Action' },
];

// ═══════════════════════════════════════════════════════════
// SCHEMATIC RARITY COST MULTIPLIERS
// ═══════════════════════════════════════════════════════════

export const SCHEMATIC_RARITY = {
  Common:          { multiplier: 5,  integrationDC: 20 },
  Uncommon:        { multiplier: 10, integrationDC: 20 },
  'Rare/Restricted':{ multiplier: 20, integrationDC: 20 },
};

// ═══════════════════════════════════════════════════════════
// COMPLEXITY TIER LABELS
// ═══════════════════════════════════════════════════════════

export const COMPLEXITY_TIERS = [
  { dc: 0,  label: 'Scrap' },
  { dc: 5,  label: 'Simple' },
  { dc: 10, label: 'Standard' },
  { dc: 15, label: 'Expert' },
  { dc: 20, label: 'Advanced' },
  { dc: 25, label: 'Master' },
  { dc: 30, label: 'Grandmaster' },
  { dc: 35, label: 'Heroic' },
  { dc: 40, label: 'Legendary' },
  { dc: 45, label: 'Mythic' },
  { dc: 50, label: 'Transcendent' },
  { dc: 60, label: 'Precursor Artifact' },
  { dc: 80, label: 'Faction / Megastructure' },
];
```

---

#### [NEW] `src/engines/tangentEconEngine.js`

Pure calculation functions implementing every economic formula from ECONOMATRIX.

**Functions:**

| Function | Signature | Formula |
|:---|:---|:---|
| `calculateCreditValue` | `(dc: number) → number` | `Math.round(10 * Math.pow(4, dc / 5))` |
| `calculateMaterialCost` | `(creditValue: number) → number` | `creditValue * 0.5` |
| `calculateCraftingDays` | `(creditValue: number, skillCheck: number, tierMultiplier: number) → number` | `creditValue / Math.max(1, (skillCheck - 10) * tierMultiplier)` |
| `calculateAllCraftingTiers` | `(creditValue: number, skillCheck?: number) → object` | Runs `calculateCraftingDays` for all 7 tool tiers |
| `calculateLiquidityGap` | `(itemDC: number, playerWS: number) → number` | `max(0, creditValue(itemDC) - creditValue(playerWS))` |
| `calculateSellPrice` | `(creditValue: number, fenceType: string) → number` | `creditValue * FENCE_RATES[fenceType]` |
| `getFinancialStatus` | `(ws: number) → object` | Lookup in FINANCIAL_STATUS_TABLE |
| `getWSFromDC` | `(dc: number) → number` | Reverse lookup: DC that equals the Auto-Buy threshold |
| `getComplexityTier` | `(dc: number) → string` | Label lookup from COMPLEXITY_TIERS |
| `calculateStartingWealth` | `(params: object) → object` | Occupation Base + Origin + Faction + TL + Skill mods |
| `calculateTradeProfit` | `(params: object) → object` | Full speculative cargo pipeline |
| `calculateCooperativeCrafting` | `(workers, avgCheck, tierMult) → object` | Industrial/faction crafting timeline |
| `calculateWealthGrowthCost` | `(currentWS, targetWS) → number` | Investment for gold-sink growth |

---

#### [NEW] `src/engines/tangentTechEngine.js`

Tech Level logic, domain progression, adaptive technology, and education bonuses.

**Functions:**

| Function | Signature | Purpose |
|:---|:---|:---|
| `getTechLevelDef` | `(tl: number) → object` | Full TL metadata from TECH_LEVELS |
| `getSubStrataDetails` | `(tl: number, modifier: string) → object` | Nascent/Standard/Advanced details |
| `getDomainCapability` | `(domain: string, tl: number) → string` | Description of domain at that TL |
| `calculateTechPenalty` | `(deviceTL, charTL, isWeapon?) → number` | `-5` or `-1` per TL gap |
| `calculateEducationBonus` | `(tl: number) → object` | Skill points or skill bonuses by origin TL |
| `getSchematicCost` | `(baseCost, rarity) → object` | Cost × rarity multiplier + integration DC |
| `getReconfigTime` | `(techType: string) → object` | Action economy for adaptive devices |
| `getAvailableTechAtTL` | `(tl: number) → string[]` | What technologies exist at a given TL |

---

#### [NEW] `src/engines/tangentUDUEngine.js`

Universal Displacement Unit hierarchy calculations.

**Functions:**

| Function | Signature | Purpose |
|:---|:---|:---|
| `getNodeCapacity` | `(bodySlot: string) → number` | Body slot node budget |
| `getTotalBodyNodes` | `() → number` | Returns 200 |
| `validateNodeAllocation` | `(slot, items[]) → { valid, used, max, remaining }` | Check if items fit |
| `convertUDUScale` | `(fromTier, toTier, count) → number` | 10 Nodes = 1 Socket, etc. |
| `calculateSocketBudget` | `(maxSlots, usedSlots) → object` | Socket utilization for items |
| `calculateMountBudget` | `(maxMounts, usedMounts) → object` | Mecha/vehicle mount tracking |
| `calculateModuleBudget` | `(maxModules, usedModules) → object` | Architecture module tracking |
| `getExternalSocketMax` | `(bodySlot) → number` | ≤ ½ × base node capacity |

---

#### [NEW] `src/engines/__tests__/tangentEconEngine.test.mjs`

Unit tests validating all economic calculations against known ECONOMATRIX examples:

```javascript
// Known values from ECONOMATRIX Table 6.1
test('DC 0 = 10 Cr (Scrap)', () => expect(calculateCreditValue(0)).toBe(10));
test('DC 5 = 40 Cr (Simple)', () => expect(calculateCreditValue(5)).toBe(40));
test('DC 10 = 160 Cr (Standard)', () => expect(calculateCreditValue(10)).toBe(160));
test('DC 15 = 640 Cr (Expert)', () => expect(calculateCreditValue(15)).toBe(640));
test('DC 20 = 2560 Cr (Advanced)', () => expect(calculateCreditValue(20)).toBe(2560));
test('DC 25 = 10240 Cr (Master)', () => expect(calculateCreditValue(25)).toBe(10240));
test('DC 30 = 40960 Cr (Grandmaster)', () => expect(calculateCreditValue(30)).toBe(40960));
test('DC 50 = ~10.5M Cr (Transcendent)', () => expect(calculateCreditValue(50)).toBeCloseTo(10485760, -2));
// Interpolation: DC 18 ≈ 1470 Cr
test('DC 18 interpolation', () => expect(calculateCreditValue(18)).toBeCloseTo(1470, -1));
// Material cost = 50%
test('Material cost = 50%', () => expect(calculateMaterialCost(2560)).toBe(1280));
// Crafting time: DC 40 item (655,360 Cr) with skill check 30 at Nanoforge (x1000)
test('Titan Mech at Nanoforge', () => {
  const days = calculateCraftingDays(655360, 30, 1000);
  expect(days).toBeCloseTo(32.77, 1);
});
```

#### [NEW] `src/engines/__tests__/tangentTechEngine.test.mjs`

Unit tests for tech level functions:
- Tech penalty: Device TL 4, Character TL 2 → `-10` penalty
- Weapon penalty: Device TL 4, Character TL 2 → `-2` penalty
- Schematic cost: 2560 Cr base × Common (5×) = 12,800 Cr
- Education bonus: TL 3 → +30 skill points

#### [NEW] `src/engines/__tests__/tangentUDUEngine.test.mjs`

Unit tests for displacement calculations:
- Head node capacity = 10
- Total body nodes = 200
- 10 Nodes converts to 1 Socket
- Allocation exceeding max → `{ valid: false }`

---

## Verification

### Automated Tests
```bash
node --experimental-vm-modules node_modules/.bin/vitest run src/engines/__tests__/
```

### Manual Verification
- Import each engine into a scratch React component and verify calculated outputs against ECONOMATRIX reference tables
- TSC curve produces correct values at every DC 0–50 in increments of 5
- All tool tier crafting times match ECONOMATRIX Table 5.1 examples
- Financial status lookup returns correct tier for boundary WS values (0, 4, 5, 9, 10, 14, etc.)

### Build Verification
- `npm run build` passes with new `src/engines/` directory
- No circular dependencies between engine modules
- All exports resolve correctly
