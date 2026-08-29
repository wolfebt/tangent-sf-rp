</Agent System Instructions>
<PLAN 22: Architectural Matrix Forge>
> Phase 3 | Priority 6/14 | Source: `docs/plans/CODEX/99. ARCHITECTURAL MATRIX.md`

## Overview
This tool allows the creation and management of architectural structures ranging from tiny residential habs to gargantuan megastructures. It calculates material costs, modular capacities, and cooperative crafting timelines using the workforce PP calculator.

## Source Document Analysis
- **Categories**: Residential, Commercial, Industrial, Military, Scientific, Infrastructure, Exotic.
- **Footprint**: Tiny to Gargantuan with Module multipliers.
- **Height Scaling**: 1-story to 50+ Spire, with SP multipliers.
- **Structure Points (SP)**: `SP_base × Height_Mult × Material_Mult + Bulwark Bonus`.
- **UDU Modules**: Base Modules × Module Multiplier. Specialized catalog (Med-Bay, Hangar, etc.).
- **Damage Resistance (DR)**: Based on material grade.
- **Crafting**: Industrial/cooperative timeline scaling based on workforce pool.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useArchitectureCalculator.js`
Handles SP formulas, Module limits, and the cooperative crafting time reductions.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Expand the `architecture` configuration with footprint/height grids, module allocators, and material selectors.

## Data Model
```typescript
interface Architecture {
  id: string;
  name: string;
  category: string;
  footprint: string;
  heightLevel: number;
  materialGrade: string;
  baseSp: number;
  bulwarkBonus: number;
  dc: number;
  modules: {
    type: string;
    count: number;
  }[];
  _computed: {
    totalSp: number;
    dr: number;
    totalModules: number;
    usedModules: number;
    value: number;
    baseCraftingDays: number;
  };
}
```

## Calculation Engine Integration
- `tangentEconEngine.js`: Calculates raw TSC module/structure costs and base crafting time.
- `tangentUDUEngine.js`: Maps modules into Tier 3 UDU displacement limits.

## UI Specification
### Form Fields (codexConfig.js Entry)
- **Category**: Select
- **Footprint & Height**: Selectors (Tiny-Gargantuan, 1-50+).
- **Material Grade**: Select (affects DR and SP mult).
- **Base SP & Bulwark Bonus**: Number inputs.
- **Specialized Modules**: Dynamic list/allocator.

### Computed Output Panel
- **SP Formula Calculator**: Live display of `SP_base × Height_Mult × Material_Mult + Bulwark Bonus`.
- **Module Slot Allocator**: Tracks filled vs available UDU modules.
- **Cooperative Crafting Timeline**: A slider or input for Workforce PP to dynamically reduce the base crafting days.
- **Cost**: Total economic cost based on size and modules.

### Interactive Features
- **Workforce Adjuster**: Interactive slider to simulate how many workers/drones are applied, showing reduced construction time.

## Cross-Matrix References
None inherently required, though could link to `factions` for ownership.

## Firestore Schema
- **Collection**: `architecture`
- **Document Structure**: Includes layout metrics, modules array, and computed `totalSp` and crafting metrics.

## Verification
- Verify SP multiplier correctly stacks height and material grade.
- Verify module allocator enforces the `Base Modules × Module Multiplier` ceiling.
- Verify cooperative crafting timeline accurately reduces the standard TSC crafting days.
</PLAN 22: Architectural Matrix Forge>
