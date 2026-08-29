<PLAN 17: EQUIPMENT MATRIX FORGE>
> Phase 2 | Priority 1/14 | Source: `docs/plans/CODEX/99. EQUIPMENT MATRIX.md`

## Overview
The Equipment Matrix Forge is a tool that standardizes the creation of field gear, medical tech, comms, scanners, computers, and survival equipment. By unifying disparate sub-systems (like Computer PR ratings and Vocation Workspaces) under the TSC pricing and UDU displacement systems, this tool ensures balanced costs, sizes, and crafting times for all miscellaneous gear.

## Source Document Analysis
Key systems extracted:
- **UDU Hierarchy:** All items take up displacement (Sockets). 
- **Computer Framework:** PR (Processor Rating) 0-4 defines computing power. Software grants +1 to +5 bonuses and "Take 10" capabilities.
- **Medical Framework:** Ranks from consumables to full Facilities.
- **Vocation Workspaces:** Scaling from Belt (+0), Pack (+2), Case (+4), Room (+6), Campus (+8).
- **Supply Die:** Abstract consumable tracking using d10, d8, d6, d4.
- **EPR (Environmental Protection Rating):** Scales 1-4.
- **TSC Pricing:** Value (Credits) = 10 × 4^(DC/5).

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useEquipmentMatrix.js`
A custom hook specifically for Equipment calculations, such as summing Workspace Scale DC adjustments, computing EPR costs, and calculating final TSC values based on Computer PR or Software levels.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Update the existing 'gear' matrix configuration to include dynamic UI schemas, computed panels, and equipment sub-categories.

## Data Model
```typescript
interface EquipmentData {
  name: string;
  category: 'Electronics' | 'Medical' | 'Surveillance' | 'Survival' | 'Tactical' | 'Data' | 'Tools';
  tl: number;
  ml: number;
  base_dc: number;
  workspace_scale?: 'Belt' | 'Pack' | 'Case' | 'Room' | 'Campus';
  computer_pr?: 0 | 1 | 2 | 3 | 4;
  installed_software: string[];
  supply_die?: 'd4' | 'd6' | 'd8' | 'd10';
  epr_rating?: 0 | 1 | 2 | 3 | 4;
  udu_sockets: number;
  description: string;
  mechanic: string;
  note: string;
  _computed?: ComputedEquipmentStats;
}

interface ComputedEquipmentStats {
  final_dc: number;
  credit_value: number;
  material_cost: number;
  crafting_days_standard: number;
  crafting_days_advanced: number;
}
```

## Calculation Engine Integration
- `tangentEconEngine.js`: `calculateTSCValue(finalDC)` for the credit price and `calculateCraftingTime(creditValue, skillCheck, toolTier)` for build times.
- `tangentTechEngine.js`: Validates TL limitations on PR ratings and Software.
- `tangentUDUEngine.js`: Calculates physical size (Sockets) based on Workspace Scale.

## UI Specification

### Form Fields (codexConfig.js Entry)
```javascript
{
  id: 'gear',
  name: 'Equipment',
  targetCollection: 'gear',
  icon: 'Tool',
  fields: [
    { name: 'name', type: 'text', label: 'Item Name', required: true },
    { name: 'category', type: 'select', label: 'Sub-Category', options: ['Electronics', 'Medical', 'Surveillance', 'Survival', 'Tactical', 'Data', 'Tools'] },
    { name: 'tl', type: 'number', label: 'Tech Level (TL)' },
    { name: 'base_dc', type: 'number', label: 'Base Crafting DC' },
    // Conditional fields based on category
    { name: 'workspace_scale', type: 'select', label: 'Scale', options: ['Belt', 'Pack', 'Case', 'Room', 'Campus'], condition: (data) => data.category === 'Tools' },
    { name: 'computer_pr', type: 'select', label: 'Processor Rating (PR)', options: [0,1,2,3,4], condition: (data) => data.category === 'Electronics' || data.category === 'Data' },
    { name: 'supply_die', type: 'select', label: 'Supply Die', options: ['None', 'd4', 'd6', 'd8', 'd10'] },
    { name: 'epr_rating', type: 'number', label: 'EPR', min: 0, max: 4, condition: (data) => data.category === 'Survival' },
    { name: 'udu_sockets', type: 'number', label: 'UDU Sockets' },
    { name: 'description', type: 'textarea', label: 'Description' }
  ],
  useCustomHook: 'useEquipmentMatrix'
}
```

### Computed Output Panel
- **Economics:** Final DC, Credit Value, Material Cost, Base Crafting Time.
- **Physical Footprint:** Number of UDU Sockets visualized as a meter.
- **Mechanics:** Summary of workspace bonuses (+0 to +8) or Software "Take 10" availability.

### Interactive Features
- **Scale Visualizer:** When selecting Workspace Scale, a visual indicator shows the physical requirements (Belt to Campus).
- **Sub-category Tabs:** Forms conditionally render their fields based on the selected Equipment category to avoid clutter.

## Cross-Matrix References
- Software items can reference the **Data** matrix for schematics.
- Can link to **Cybernetics/Biotech** for organic equivalents of survival gear.

## Firestore Schema
**Collection:** `gear`
Documents map 1:1 with `EquipmentData`. The `_computed` map ensures rapid querying for market value and socket size.

## Verification
- Select `Tools` -> `Campus` scale. Ensure DC modifier applies and UDU requirement displays accurately.
- Set Base DC to 15, verify output Credit Value is 10 * 4^(15/5) = 10 * 64 = 640 Credits.
- Verify conditional fields (e.g. Computer PR) only show when relevant categories are selected.
</PLAN 17: EQUIPMENT MATRIX FORGE>
