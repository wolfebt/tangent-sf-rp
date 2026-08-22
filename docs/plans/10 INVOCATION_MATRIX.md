<PLAN 26: INVOCATION FORGE>
> Phase 4 | Priority 10/14 | Source: `docs/plans/CODEX/99. INVOCATION MATRIX.md`

## Overview
The Invocation Forge tool creates and manages supernatural effects, including psionic powers, meta-abilities, spell effects, and dimensional anomalies. It handles complex calculation of casting difficulty based on modular modifiers (time, range, area, duration) and integrates deeply with character progression via Skill Stages.

## Source Document Analysis
- **Base Difficulty**: Determines the starting DC based on effect category and magnitude.
- **DC Adjustments**: 
  - Time (shorter cast times increase DC)
  - Range (longer range increases DC)
  - Area (larger affected area increases DC)
  - Duration (longer duration increases DC)
- **Final Cast DC**: Calculated as `Base Difficulty + Time Adj + Range Adj + Area Adj + Duration Adj`.
- **Essence Cost**: Calculated when attempting to push a power beyond the caster's current Skill Stage threshold.
- **Skill Stages**: Thresholds for proficiency — Novice (ranks 1-5), Trained (6-10), Expert (11-15), Master (16-19), Pinnacle (20).
- **Discipline Types**: Telekinesis, Telepathy, Clairvoyance, Pyrokinesis, Chronos-Distortion, Biometabolism, Void-Attunement.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/engines/tangentInvocationEngine.js`
Handles calculation of Final Cast DC based on all modifiers, determines Essence Costs based on ranks and skill stage thresholds.

#### [NEW] `src/pages/Codex/components/InvocationForge/InvocationForgeOutput.jsx`
A custom computed output panel to show the Final Cast DC, active modifiers, Essence Cost thresholds, and Skill Stage indicator.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Add configuration for the `invocations` targetCollection, including field definitions for base difficulty, adjustment sliders, and computed outputs.

## Data Model
```typescript
interface InvocationEntry {
  id: string;
  name: string;
  discipline: 'Telekinesis' | 'Telepathy' | 'Clairvoyance' | 'Pyrokinesis' | 'Chronos-Distortion' | 'Biometabolism' | 'Void-Attunement';
  description: string;
  baseDifficulty: number;
  modifiers: {
    timeAdjustment: number;
    rangeAdjustment: number;
    areaAdjustment: number;
    durationAdjustment: number;
  };
  rankRequired: number;
  _computed: {
    finalCastDC: number;
    essenceCostThresholds: Record<string, number>;
  };
}
```

## Calculation Engine Integration
- `tangentInvocationEngine.js` will export `calculateFinalDC(base, modifiers)` and `calculateEssenceCost(rank, stage)`.
- The existing TSC formula engine might be loosely referenced if invocations can be inscribed into schematics/items, but mainly relies on custom DC math.

## UI Specification
### Form Fields (codexConfig.js Entry)
- `discipline`: Select dropdown.
- `baseDifficulty`: Number input.
- `timeAdjustment`, `rangeAdjustment`, `areaAdjustment`, `durationAdjustment`: Range sliders (-10 to +20).
- `rankRequired`: Number input (1-20).

### Computed Output Panel
- Large display of **Final Cast DC**.
- Visual indicator showing how the Final Cast DC correlates to **Skill Stages**.
- Table or list of **Essence Costs** when pushed beyond thresholds.

### Interactive Features
- Interactive breakdown of DC adjusters showing exactly how much each parameter adds to the DC.

## Cross-Matrix References
- Meta-Tech entries will reference these Invocations to create Active Imbuement weapons or Consumables.

## Firestore Schema
- **Collection**: `invocations`
- Stores all base inputs and the `_computed` object containing Final Cast DC and essence data.

## Verification
1. Create a base Telepathy effect with DC 15.
2. Add Range (+5 DC) and Duration (+2 DC) adjustments.
3. Verify Final Cast DC equals 22 in real-time output panel.
4. Verify saved document in `invocations` matches the correct payload.
</PLAN 26: INVOCATION FORGE>
