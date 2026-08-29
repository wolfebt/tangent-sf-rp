> Phase 5 | Priority 14/14 | Source: `docs/plans/CODEX/TECHNOLOGY.md`

## Overview
This tool implements the Technology Codex Dashboard, acting as both an encyclopedia for tech levels (TL 0-5, X) and a suite of interactive profilers and calculators for evaluating civilizations, adaptive devices, and character tech competencies.

## Source Document Analysis
- **Tech Levels**: 0 (Primitive) to 5 (God-like), plus X (Anomalous).
- **Domains**: 16 specific fields (Agriculture, Architecture, etc.) evaluating civilization capabilities.
- **Adaptive Devices**: Memory capacity limits schematics. Rarity multipliers (Common 5x, Uncommon 10x, Rare 20x).
- **Tech Penalties**: General devices (-5 per TL gap), Weapons (-1 per TL gap).

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/TechnologyCodex.jsx`
Main technology reference dashboard displaying the TL browser, radar charts, and calculators.

#### [NEW] `src/pages/Codex/components/TLReferenceBrowser.jsx`
Expandable cards detailing TL 0-5 and X rules, power sources, limitations, and progression tracks.

#### [NEW] `src/pages/Codex/components/CivDomainProfiler.jsx`
Renders a 16-axis radar chart with sliders (0-5) for each domain. Auto-generates archetype tags based on profile shape.

#### [NEW] `src/pages/Codex/components/AdaptiveDeviceConfigurator.jsx`
Manages schematic design libraries, calculates costs (base x rarity), and active states for Nanotech/Picotech/etc.

#### [NEW] `src/pages/Codex/components/TechnologistTracker.jsx`
17-field grid tracking field advancements, calculating penalties, and progress toward next TL access.

#### [NEW] `src/pages/Codex/components/TechPenaltyCalculator.jsx`
Simple input widget to calculate flat penalty values based on TL gaps.

### Modified Files
#### [MODIFY] `src/pages/Codex/CodexApp.jsx`
Add routing for `TechnologyCodex` when selected, matching `viewType: 'dashboard'`.

#### [MODIFY] `src/pages/Codex/codexConfig.js`
Add `'technology'` entry with `viewType: 'dashboard'`.

## Data Model
```typescript
interface CivProfile {
  name: string;
  domains: Record<string, number>; // 16 domains, 0-5
  archetype: string;
}

interface TechnologistProgress {
  fieldsAdvanced: string[];
  currentTL: number;
}
```

## Calculation Engine Integration
Calls `tangentTechEngine.js` for:
- `getTechPenalty(itemTL, charTL, isWeapon)`
- `calculateSchematicCost(baseCost, rarity)`
- `getCivArchetype(domainScores)`

## UI Specification
### Form Fields (codexConfig.js Entry)
```javascript
technology: {
  id: 'technology',
  name: 'Technology Codex',
  viewType: 'dashboard',
  // Interactive tools handled inside specific dashboard view
}
```

### Computed Output Panel
Computed results appear in widget-specific panels (e.g., penalty output, radar chart visualizations, archetype labels).

### Interactive Features
- 16-axis Radar/Spider chart (using Recharts or Chart.js).
- Expandable accordions for TL descriptions.
- Dynamic schematic library list with memory bar filling up.

## Cross-Matrix References
Links to Planet and Faction entries (to attach Civ Profiles). Links to Equipment (Adaptive Devices).

## Firestore Schema
Civilization profiles can be optionally stored in a `civ_profiles` subcollection under a specific Planet or Faction document.

## Verification
- Test 16-axis sliders to ensure radar chart morphs correctly.
- Ensure penalty calculator outputs -5 for TL gap of 1 on general devices and -1 for weapons.
- Confirm routing opens the dashboard view instead of the form view.
