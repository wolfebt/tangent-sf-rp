</Agent System Instructions>
<PLAN 21: Mecha Matrix Forge>
> Phase 3 | Priority 5/14 | Source: `docs/plans/CODEX/99. MECHA MATRIX.md`

## Overview
This tool builds a diverse range of vehicles and mecha, from personal mobility devices and civilian vehicles to spacecraft and giant mechs. It handles multi-domain vehicle stats, UDU mount/module tracking, and cross-matrix weapon and armor integration.

## Source Document Analysis
- **Operational Domains (8)**: Personal Mobility, Civilian, Utility, Military Ground, Aircraft, Spacecraft, Watercraft, Power Armor/Mechs.
- **Size Categories**: Fine to Mega Colossal with corresponding stat multipliers.
- **UDU Hierarchy**: 1 Module = 10 Mounts.
- **Defense DC**: `10 + Pilot Agility + Vehicle Mod + Handling Mod`.
- **Variable Form Technology (VFT)**: Allows a chassis to reconfigure between modes.
- **Components**: Propulsion, Armor, Weapons, Sensors, Life Support, Cargo.
- **Pricing**: TSC formula, plus MegaCredits scaling for large vessels.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useMechaCalculator.js`
Hook to compute Defense DC, UDU mount/module capacities, speed metrics, and MegaCredit scaling.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Update the `mecha` target collection with domain tabs, size selectors, and relational links to Weaponry and Armoring collections.

## Data Model
```typescript
interface Mecha {
  id: string;
  name: string;
  domain: string;
  archetype: string;
  frameType: string;
  size: string; // Fine to Mega Colossal
  dc: number;
  tl: number;
  handlingMod: number;
  vehicleMod: number;
  vftCapable: boolean;
  linkedWeapons: string[]; // references weaponry
  linkedArmor: string[]; // references armoring
  _computed: {
    totalMounts: number;
    totalModules: number;
    defenseDcBase: number;
    value: number;
    isMegaCredit: boolean;
  };
}
```

## Calculation Engine Integration
- `tangentEconEngine.js`: Standard TSC pricing, converting to MegaCredits for high-DC large vessels.
- `tangentUDUEngine.js`: Translates Size into UDU Mounts/Modules limits.

## UI Specification
### Form Fields (codexConfig.js Entry)
- **Domain**: 8-domain tabbed selector.
- **Archetype & Frame Type**: Dependent dropdowns based on Domain.
- **Size**: Dropdown (Fine to Mega Colossal).
- **VFT Toggle**: Boolean switch.
- **Performance Mods**: Handling Mod, Vehicle Mod.
- **Components**: Relational selectors for Weapons and Armor.

### Computed Output Panel
- **UDU Allocator**: Visual display of filled vs available Mounts and Modules.
- **Defense DC Calculator**: Base DC preview.
- **Economic Value**: Cost in Credits or MegaCredits, crafting time.

### Interactive Features
- **Cross-Matrix Linking**: `UnifiedRelationalSelectorModal` to browse and attach entries from `weaponry` and `armoring` collections.
- **VFT Configuration**: Secondary form for alternate form stats if VFT is enabled.

## Cross-Matrix References
- Links to `weaponry` (for mounted UDU weapons).
- Links to `armoring` (for chassis defense profiles).

## Firestore Schema
- **Collection**: `mecha`
- **Document Structure**: Stores base stats, linked weapon/armor IDs, and the precomputed UDU usage and pricing.

## Verification
- Verify size changes appropriately scale UDU capacities.
- Verify relational modal can retrieve and attach valid weapon and armor IDs.
- Verify Defense DC formula calculates correctly.
</PLAN 21: Mecha Matrix Forge>
