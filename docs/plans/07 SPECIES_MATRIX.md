<Agent System Instructions>
<PLAN 23: CODEX SPECIES FORGE>
> Phase 4 | Priority 7/14 | Source: `docs/plans/CODEX/99. SPECIES MATRIX.md`

## Overview
The Species Forge creates playable alien species, genetic mutants, synthetic races, uplifted animals, and meta-human bloodlines. It uses a Build Point (BP) Budget System to ensure balanced creation of species with different traits, disadvantages, sizes, and movement modes.

## Source Document Analysis
- **Build Point (BP) Budget System**: Standard (10-20 BP), Advanced (25-40 BP), Monster (40+ BP).
- **Species Types**: Aberration, Beast, Dragon, Fae, Humanoid, Monstrous Humanoid, Outsider, Plant, Synthetic, Undead, Vermin.
- **Size Categories**: Diminutive, Tiny, Small, Medium, Large, Huge (affects combat/movement modifiers).
- **Movement Modes**: Bipedal Ground, Quadrupedal, Avian/Gliding, Aquatic, Levitation, Serpentine, Burrowing.
- **Attribute Modifiers**: +1 Attribute costs 4 BP.
- **Traits & Disadvantages**: Basic, Advanced, Elite traits cost BP. Disadvantages refund BP.
- **Component Hierarchy**: Type → Size → Attributes → Speed → Traits → Disadvantages.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useSpeciesBPBudget.js`
A custom hook for calculating total BP cost based on size, movement, attributes, traits, and disadvantages.

#### [NEW] `src/pages/Codex/components/SpeciesTraitSelector.jsx`
A custom UI component for browsing, searching, and selecting traits and disadvantages.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Add configuration for the species matrix, incorporating custom fields and budget display.

## Data Model
```typescript
interface SpeciesMatrixData {
  id: string;
  name: string;
  description: string;
  targetCollection: 'species';
  bpBudgetLevel: 'Standard' | 'Advanced' | 'Monster';
  speciesType: 'Aberration' | 'Beast' | 'Dragon' | 'Fae' | 'Humanoid' | 'Monstrous Humanoid' | 'Outsider' | 'Plant' | 'Synthetic' | 'Undead' | 'Vermin';
  sizeCategory: 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge';
  movementModes: Array<{ mode: string; speed: number }>;
  attributeModifiers: Record<string, number>;
  traits: Array<{ id: string; name: string; cost: number }>;
  disadvantages: Array<{ id: string; name: string; refund: number }>;
  _computed: {
    totalBPUsed: number;
    bpRemaining: number;
    sizeModifiers: { attack: number; defense: number; stealth: number };
  };
}
```

## Calculation Engine Integration
- Custom `useSpeciesBPBudget` hook will handle the 1 Attribute = 4 BP and standard trait summation rules.
- Integrate with `tangentConstants.js` for fetching enum arrays of species types, size categories, and movement modes.

## UI Specification
### Form Fields (codexConfig.js Entry)
```javascript
species: {
  label: "Species Forge",
  icon: "Dna",
  targetCollection: "species",
  computeOnSave: true,
  layout: [
    { name: "bpBudgetLevel", type: "select", options: ["Standard", "Advanced", "Monster"], required: true },
    { name: "speciesType", type: "select", options: SPECIES_TYPES, required: true },
    { name: "sizeCategory", type: "select", options: SIZE_CATEGORIES, required: true },
    { name: "movementModes", type: "custom", component: "MovementModeConfigurator" },
    { name: "attributeModifiers", type: "custom", component: "AttributeModifierBuilder" },
    { name: "traits", type: "custom", component: "SpeciesTraitSelector" },
    { name: "disadvantages", type: "custom", component: "SpeciesTraitSelector" }
  ],
  engineHooks: ['useSpeciesBPBudget']
}
```

### Computed Output Panel
- **BP Tracker**: Shows `Total BP Used / Budget Limit`. Warns if exceeded.
- **Combat Modifiers**: Live display of size-based combat modifiers (e.g., +2 Stealth for Small).

### Interactive Features
- **Traits Catalog Browser**: Searchable/filterable pop-out or inline component for selecting traits.
- **Attribute Builder**: +/- stepper for stats that instantly updates BP cost.

## Cross-Matrix References
- Could link to `features` if specific traits are pulled from a shared features collection.
- Uses standard `UnifiedRelationalSelectorModal` if traits refer to existing abilities.

## Firestore Schema
- **Collection**: `species`
- **Document Structure**: Matches `SpeciesMatrixData`. Computed block `_computed` stores pre-calculated totals to avoid client-side recalculation on read.

## Verification
- Select 1 Attribute (+4 BP), 1 Basic Trait (+2 BP), and 1 Disadvantage (-2 BP) and ensure Total BP Used equals 4.
- Verify saving writes `_computed` values to Firestore.
</PLAN 23: CODEX SPECIES FORGE>
