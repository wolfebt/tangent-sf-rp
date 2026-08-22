<PLAN 27: META-TECH FORGE>
> Phase 4 | Priority 11/14 | Source: `docs/plans/CODEX/99. META-TECH MATRIX.md`

## Overview
The Meta-Tech Forge acts as the bridge between science and sorcery. It handles the creation of enchanted/imbued items, passive enhancements, active spell-infused weapons, consumables, and symbiotic interfaces.

## Source Document Analysis
- **Enhancement Types**: Passive (always-on), Active (triggered invocation), Consumable (single-use).
- **Capacity System**: Items use a socket-based limit. 1 Socket can hold up to Rank 10.
- **Scale Amplification**: Vehicle or architecture-mounted meta-tech gain multipliers.
- **DC Formulas**:
  - Passive Enhancement DC = Base Item DC + (Sockets Used × 5)
  - Active Imbuement DC = 15 + Invocation Rank + TL Mod
  - Consumable DC = Standard DC - 10
- **Fabrication Economics**: TSC pricing based on Final DC.
- **Base Item Selection**: Links to Equipment, Weaponry, or Armor.
- **Invocation Effect**: Links to Invocation Matrix.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/engines/tangentMetaTechEngine.js`
Calculates sockets used, applies scale multipliers, calculates DCs for the three enhancement types, and outputs TSC costs.

#### [NEW] `src/pages/Codex/components/MetaTechForge/MetaTechForgePanel.jsx`
Custom UI panel for displaying capacity tracker, active vs passive DC, and TSC values.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Update config to support the `gear` collection or `compendium` (as specified) with cross-matrix links to weapons/armor and invocations.

## Data Model
```typescript
interface MetaTechEntry {
  id: string;
  name: string;
  enhancementType: 'Passive' | 'Active' | 'Consumable';
  baseItemId: string; // Relational link
  invocationId?: string; // Relational link
  socketsUsed: number;
  scaleAmplification: number;
  attunementRequired: boolean;
  _computed: {
    finalDC: number;
    tscValue: number;
    capacityStatus: 'Valid' | 'Overloaded';
  };
}
```

## Calculation Engine Integration
- **`tangentUDUEngine.js`**: Used to validate Socket limits and capacity limits (1 Socket = Rank 10).
- **`tangentEconEngine.js`**: Will calculate final TSC Value, Material Cost, and Crafting Days based on the Final DC calculated here.

## UI Specification
### Form Fields (codexConfig.js Entry)
- `baseItem`: UnifiedRelationalSelectorModal linking to Weaponry/Armor/Equipment.
- `enhancementType`: Radio group / Tabs (Passive, Active, Consumable).
- `invocationEffect`: UnifiedRelationalSelectorModal linking to Invocations (visible for Active/Consumable).
- `scaleAmplification`: Toggle/Dropdown for Chassis scale multipliers.
- `attunementRequired`: Boolean toggle.

### Computed Output Panel
- Capacity System Tracker (Sockets Used vs Available).
- DC Calculators showing math breakdown for the chosen enhancement type.
- Fabrication Economics panel (TSC Value, Material Cost, Crafting Time).

### Interactive Features
- Enhancement Type tabs dynamically hide/show the Invocation selector.
- Visual warning if `socketsUsed` exceeds capacity bounds.

## Cross-Matrix References
- References `Weaponry`, `Armor`, `Equipment` (Base Items).
- References `Invocations` (Effects).

## Firestore Schema
- **Collection**: `gear` / `compendium`
- Computed object stores Final DC, TSC Value, and capacity validation state.

## Verification
1. Select an existing sword (Weaponry) as base item.
2. Set Enhancement Type to 'Active'.
3. Select a Rank 5 Pyrokinesis invocation.
4. Verify DC calculates correctly (15 + 5 + TL Mod).
5. Verify TSC Value generates using `V = 10 × 4^(DC/5)`.
6. Save and verify relational fields store IDs correctly.
</PLAN 27: META-TECH FORGE>
