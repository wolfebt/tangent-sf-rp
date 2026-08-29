</Agent System Instructions>
<PLAN 20: Augmentations Matrix Forge>
> Phase 3 | Priority 4/14 | Source: `docs/plans/CODEX/99. AUGMENTATIONS MATRIX.md`

## Overview
This tool provides an interface to create and manage cybernetic implants, prosthetics, neural interfaces, sensory/brain mods, and full body conversions (FBC) in the Tangent SF RP system. It tracks the anatomical node budget and BP (Build Point) biological tolerance costs, while automatically determining social stigma thresholds.

## Source Document Analysis
- **Anatomical Node Budget**: Head (10), Torso (50), Arms (30 each), Legs (40 each) = 200 total nodes.
- **Build Points (BP)**: Biological tolerance cost for augmentations.
- **Stigma Thresholds**: 
  - None: 0 mods
  - Minor: 1-3 mods (-2 social)
  - Moderate: 4-6 mods (-4 social)
  - Severe: 7+ mods or FBC (-8 social)
- **Categories**: Fashionware (0 BP), Synth Limbs (TL3), External Sockets (1 BP, max 1/2 base node capacity, 1 per 10 nodes), Hand/Foot Options (1 BP), Limb Upgrades (1 BP), Exotic Limbs (TL4), Body Mods (2 BP), Sensory Mods (2 BP), Brain Mods (2 BP), TL4 Enhanced (2 BP), TL5 Advanced (1 BP), Full Body Conversion (FBC - 200 Nodes, 260 SP), Pseudo-Cybernetics (wearables, half node capacity, requires Neural Interface Port).
- **Structure Points (SP)**: 1 × Nodes (Cranium/Torso get x2 Hardening).

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useAugmentationCalculator.js`
A custom hook for computing Node consumption, BP totals, SP totals, and Stigma thresholds based on selected augmentations.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Update the `augmentations` configuration with detailed relational fields, target collection mapping, and `engineHooks` for real-time calculations.

## Data Model
```typescript
interface Augmentation {
  id: string;
  name: string;
  category: 'fashionware' | 'synth_limb' | 'external_socket' | 'hand_foot' | 'limb_upgrade' | 'exotic_limb' | 'body_mod' | 'sensory' | 'brain' | 'tl4' | 'tl5' | 'fbc' | 'pseudo';
  tl: number;
  dc: number;
  nodeLocation: 'head' | 'torso' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'systemic';
  nodeCost: number;
  bpCost: number;
  description: string;
  _computed: {
    sp: number;
    value: number;
    craftingDays: number;
    stigmaImpact: number;
  };
}
```

## Calculation Engine Integration
- `tangentEconEngine.js`: Used to compute TSC Value (`V = 10 × 4^(DC/5)`), material cost (50%), and crafting time.
- `tangentUDUEngine.js`: Used for anatomical node budget validation and UDU alignment if needed.

## UI Specification
### Form Fields (codexConfig.js Entry)
- **Name**: String
- **Category**: Select
- **Tech Level**: Number
- **Design Complexity (DC)**: Number
- **Node Location**: Select (Head, Torso, Left Arm, Right Arm, Left Leg, Right Leg, Systemic)
- **Node Cost**: Number
- **BP Cost**: Number
- **Effect/Description**: Rich Text

### Computed Output Panel
- **Node Budget Tracker**: Visual bars for Head, Torso, Arms, Legs.
- **BP Budget**: Total Build Points consumed.
- **Stigma Level**: Computed from the number of installed mods.
- **SP (Structure Points)**: Total SP per location (Cranium/Torso x2).
- **Economic Value**: Computed TSC price, material cost, crafting days.

### Interactive Features
- **Category Tabs**: Filter view by augmentation category.
- **External Socket Calculator**: Validates socket rules (≤ ½ base node capacity, max 1 per 10 Nodes).
- **FBC Toggle**: Overrides standard rules, setting nodes to 200 and SP to 260.

## Cross-Matrix References
None explicitly required for base augmentations, though NPC Loadouts will link back to these records via `UnifiedRelationalSelectorModal`.

## Firestore Schema
- **Collection**: `augmentations`
- **Document Structure**: Matches the Data Model interface. Includes the `_computed` object generated on save.

## Verification
- Verify node validation restricts over-allocation per limb/location.
- Verify FBC toggle applies correct stats.
- Verify Stigma threshold updates dynamically based on total mod count.
</PLAN 20: Augmentations Matrix Forge>
