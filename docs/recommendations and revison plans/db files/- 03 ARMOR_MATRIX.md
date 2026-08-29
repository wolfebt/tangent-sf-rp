<PLAN 19: ARMOR MATRIX FORGE>
> Phase 2 | Priority 3/14 | Source: `docs/plans/CODEX/99. ARMOR MATRIX.md`

## Overview
The Armor Matrix Forge empowers the creation of defensive gear ranging from concealable civilian meshes to massive military hard suits. The central design philosophy decouples the "Agnostic Chassis" (the mechanical stats) from the "Cultural Skin" (the faction aesthetic), allowing rapid prototyping of diverse gear.

## Source Document Analysis
Key systems extracted:
- **Agnostic Chassis / Skin Split:** Stats are universal; aesthetics are overlaid.
- **Armor Categories:** Civilian (Light), Tactical (Medium), Military (Heavy), Assault (Superheavy), Powered.
- **Exotic Types:** Biotech (Symbiotic), Magi-Tech (Warded), Psi-Tech (Crystalline), Advanced Physics (Polymatter/Hard Light).
- **Body Coverage:** Head, Torso, Arms, Legs, Full. Affects weight and DR scaling.
- **Core Stats:** DR (Damage Resistance), SP (Structure Points), EPR (Env Protection 1-4).
- **TSC Pricing:** Derived directly from the final Crafting DC.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useArmorMatrix.js`
Handles the calculations for DR to DC scaling, coverage weight multipliers, and EPR cost add-ons.
#### [NEW] `src/pages/Codex/components/ArmorCoverageSelector.jsx`
A visual or multi-select component for designating which body parts the armor protects.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Define the 'armoring' target collection with tabbed interfaces separating Chassis mechanics from Exotic properties.

## Data Model
```typescript
interface ArmorData {
  name: string;
  category: 'Civilian' | 'Tactical' | 'Military' | 'Assault' | 'Powered';
  exotic_type: 'None' | 'Biotech' | 'Magi-Tech' | 'Psi-Tech' | 'Adv Physics';
  coverage: ('Head' | 'Torso' | 'Arms' | 'Legs')[];
  tl: number;
  base_dc: number;
  dr_rating: number;
  sp_rating: number;
  epr_rating: 0 | 1 | 2 | 3 | 4;
  movement_penalty: number;
  udu_slots: number;
  faction_skin: string;
  _computed?: ComputedArmorStats;
}

interface ComputedArmorStats {
  final_dc: number;
  credit_value: number;
  total_weight: number;
  crafting_days: number;
}
```

## Calculation Engine Integration
- `tangentEconEngine.js`: Final DC to TSC Credit Value.
- `tangentTechEngine.js`: Modifies costs or penalties if `exotic_type` aligns with specific TL paradigms (e.g. TL5 for Hard Light).

## UI Specification

### Form Fields (codexConfig.js Entry)
```javascript
{
  id: 'armoring',
  name: 'Armor',
  targetCollection: 'armoring',
  icon: 'Shield',
  fields: [
    { name: 'name', type: 'text', label: 'Chassis Name', required: true },
    { name: 'faction_skin', type: 'select', label: 'Cultural Skin / Manufacturer' },
    { name: 'category', type: 'select', label: 'Armor Tier', options: ['Civilian', 'Tactical', 'Military', 'Assault', 'Powered'] },
    { name: 'exotic_type', type: 'select', label: 'Exotic Material', options: ['None', 'Biotech', 'Magi-Tech', 'Psi-Tech', 'Adv Physics'] },
    { name: 'tl', type: 'number', label: 'Tech Level' },
    { name: 'base_dc', type: 'number', label: 'Base DC' },
    { name: 'dr_rating', type: 'number', label: 'Damage Resistance (DR)' },
    { name: 'sp_rating', type: 'number', label: 'Structure Points (SP)' },
    { name: 'epr_rating', type: 'number', label: 'EPR Rating', min: 0, max: 4 }
  ],
  customComponents: ['ArmorCoverageSelector'],
  useCustomHook: 'useArmorMatrix'
}
```

### Computed Output Panel
- **Defense Profile:** Summarizes DR, SP, and active EPR defenses.
- **Economics:** Final calculated cost and required crafting time.
- **Mobility Impact:** Summarizes weight and movement penalties based on tier and coverage.

### Interactive Features
- **Chassis vs. Skin UI:** The form should visually segregate the mechanical "Chassis" inputs from the "Skin" text descriptions to reinforce the system design.
- **Coverage Visualizer:** A silhouette where users can toggle Head/Torso/Arms/Legs, dynamically updating the weight and DR coverage area.

## Cross-Matrix References
- **Factions:** For manufacturer and cultural aesthetics.
- **Augmentations:** Power Armor can hook into cybernetic/mecha UDU slot systems.

## Firestore Schema
**Collection:** `armoring`
Stores `coverage` as an array of strings. `_computed` contains final costs.

## Verification
- Select `Tactical` tier with `Torso` and `Head` coverage. Verify weight multiplier applies correctly vs `Full` coverage.
- Toggle an exotic type (e.g., `Magi-Tech`) and ensure the descriptive panels update to reflect arcane properties.
- Verify TSC calculation accurately reflects Base DC + EPR rating DC adders.
</PLAN 19: ARMOR MATRIX FORGE>
