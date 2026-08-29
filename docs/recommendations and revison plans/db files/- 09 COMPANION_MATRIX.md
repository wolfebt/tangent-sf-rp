<Agent System Instructions>
<PLAN 25: CODEX COMPANION FORGE>
> Phase 4 | Priority 9/14 | Source: `docs/plans/CODEX/99. COMPANION MATRIX.md`

## Overview
The Companion Forge creates loyal pets, combat drones, familiars, AI sub-minds, and robotic guardians bound to PCs. It scales with the owner's tier and uses a specialized BP budget system based on physical and functional packages.

## Source Document Analysis
- **BP System**: 40 BP Starting Budget.
- **Companion Types**: Biological, Synthetic, Metaphysical.
- **Form Packages**: Canine, Feline, Avian, Reptilian, Insectoid, Drone, Hovering, Humanoid.
- **Function Packages**: Attack, Defense, Scout, Medical, Hacking, Stealth, Transport, Support.
- **Scaling**: Power scales with owner's character tier.
- **Stat Block**: Outputs Vitality, Health, Defense, Attack, Speed, Special Abilities.
- **Control Interfaces**: Neural Link, Voice Command, Autonomous AI, Telepathic Bond.
- **Target Collection**: `features` with altCollection `compendium`.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useCompanionGenerator.js`
Computes BP usage from packages and calculates final stat block based on base values + owner tier scaling.

#### [NEW] `src/pages/Codex/components/CompanionPackageSelector.jsx`
Component with visual cards for selecting Form and Function packages.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Add configuration for Companion Forge to route data appropriately.

## Data Model
```typescript
interface CompanionData {
  id: string;
  name: string;
  ownerTier: number;
  companionType: 'Biological' | 'Synthetic' | 'Metaphysical';
  formPackage: string;
  functionPackages: string[];
  controlInterfaces: string[];
  specialAbilities: string[];
  _computed: {
    totalBPUsed: number;
    bpRemaining: number;
    vitality: number;
    health: number;
    defense: number;
    attack: number;
    speed: number;
  };
}
```

## Calculation Engine Integration
- Foundation relies on BP rules established in the Species Matrix (`useSpeciesBPBudget` patterns).
- Stat scaling uses an owner tier multiplier applied to the base package stats.

## UI Specification
### Form Fields (codexConfig.js Entry)
```javascript
companion: {
  label: "Companion Forge",
  icon: "Cat",
  targetCollection: "features",
  altCollection: "compendium",
  computeOnSave: true,
  layout: [
    { name: "ownerTier", type: "number", min: 1, max: 20, required: true, label: "Owner's Tier" },
    { name: "companionType", type: "select", options: ["Biological", "Synthetic", "Metaphysical"] },
    { name: "formPackage", type: "custom", component: "CompanionPackageSelector", filter: "form" },
    { name: "functionPackages", type: "custom", component: "CompanionPackageSelector", filter: "function" },
    { name: "controlInterfaces", type: "multiselect", options: CONTROL_INTERFACES },
    { name: "specialAbilities", type: "list" }
  ],
  engineHooks: ['useCompanionGenerator']
}
```

### Computed Output Panel
- **40 BP Budget Counter**: Shows remaining points as packages are selected.
- **Tier Scaling Indicator**: Shows how stats improve at the current `ownerTier`.
- **Full Stat Block Output**: Generates final combat stats.

### Interactive Features
- **Companion Designation Tabs**: Switch between viewing form specs and function specs.
- **Package Selector**: Visual cards for packages (e.g. clicking "Canine" shows base stats/abilities granted).

## Cross-Matrix References
- Associates with `Species Matrix` trait definitions for shared biological advantages.
- Cross-references equipment using standard component linkers if drones need custom weaponry.

## Firestore Schema
- **Collection**: `features` (as per targetCollection setup).
- **Document Structure**: Matches `CompanionData`.

## Verification
- Set owner tier to 1. Select a Canine Form and Attack Function. Ensure total BP does not exceed 40.
- Increment owner tier to 5 and observe the stats automatically scaling in the output panel.
</PLAN 25: CODEX COMPANION FORGE>
