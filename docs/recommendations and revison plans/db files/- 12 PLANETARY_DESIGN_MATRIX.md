<PLAN 28: PLANETARY DESIGN FORGE>
> Phase 5 | Priority 12/14 | Source: `docs/plans/CODEX/99. PLANETARY DESIGN MATRIX.md`

## Overview
The Planetary Design Forge creates complete planetary profiles, encompassing stellar context, geophysics, biospheres, and civilizational structures. It serves as both a world-building tool and a mechanical hub for economic and adventure generation systems.

## Source Document Analysis
- **Stellar Context**: Star classes, habitable zones.
- **Geophysical Chassis**: 
  - Atmosphere types (0-12)
  - Gravity tiers
  - Hydrographics (0-10)
  - Temperature bands
- **Biosphere Layer**: Flora/fauna danger ratings, niches.
- **Civilizational Skin**: 
  - Tech Level (0-5)
  - Government Type (14+ types)
  - Law Level (0-8+)
- **Trade Codes**: 18 standard codes (Ag, As, Ba, etc.) auto-assigned based on size, atmosphere, hydrographics, and population.
- **Economic Framework**: Commodity price modifiers driven by Trade Codes.
- **Civilization Domain Ratings**: 16 specific domains (Agriculture, Architecture, etc.) each with an independent TL.
- **Metafocus Levels (0-6)**: Prevalence of metaphysical/psionic phenomena.
- **Adventure Hooks**: Random encounter generation and hazard rules based on planetary profile.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/engines/tangentPlanetaryEngine.js`
Handles automatic trade code assignment based on geophysical and demographic inputs, commodity price modifier calculation, and adventure hazard DC adjustments.

#### [NEW] `src/pages/Codex/components/PlanetaryForge/PlanetaryRadarChart.jsx`
A visual spider diagram displaying the 16 Civilization Domain ratings.

#### [NEW] `src/pages/Codex/components/PlanetaryForge/TradeCodePanel.jsx`
Auto-displays assigned trade codes and ensuing economic modifiers.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Configure a highly complex entry for `compendium` (or `planets` if separate), handling dozens of parameters and linking custom components.

## Data Model
```typescript
interface PlanetaryProfile {
  id: string;
  name: string;
  stellarContext: { starClass: string; habitableZone: boolean };
  geophysics: { size: number; atmosphere: number; gravity: string; hydrographics: number; temperature: string };
  biosphere: { dangerRating: number; sentientSpecies: string[] };
  civilization: { 
    baseTL: number; 
    government: string; 
    lawLevel: number;
    metafocus: number;
    domainRatings: Record<string, number>; // 16 domains
  };
  _computed: {
    tradeCodes: string[];
    commodityModifiers: Record<string, number>;
    hazardDCModifiers: number;
  };
}
```

## Calculation Engine Integration
- **`tangentTechEngine.js`**: Reused for domain capabilities based on independent domain TLs.
- **`tangentEconEngine.js`**: Trade codes heavily impact market liquidity, trade profit margins, and speculative trading rules defined here.

## UI Specification
### Form Fields (codexConfig.js Entry)
- Tabbed interface (Geophysics, Biosphere, Civilization, Economy).
- Number inputs / Selects for Atmosphere (0-12), Hydrographics (0-10), TL, Law Level.
- 16 Domain Rating sliders (0-5).

### Computed Output Panel
- Auto-Trade-Code badge list (e.g., [Ag] [Ri] [Wa]).
- Commodity price table generator displaying local speculative market shifts.
- Adventure hook randomizer button that pulls local context to suggest scenarios.

### Interactive Features
- **Civilization Radar Chart (Spider Diagram)**: Real-time update as the 16 domain sliders are adjusted.
- Instant Trade Code assignment updating immediately when Atmosphere/Hydrographics cross specific thresholds.

## Cross-Matrix References
- Sentient Species might link to `Species` or `Factions` in the Compendium.
- Starports might link to `Architecture` matrices.

## Firestore Schema
- **Collection**: `compendium` (Sub-type: Planet) or custom `planets` collection.
- Large JSON document containing deep nested structures and significant pre-computed arrays for fast querying.

## Verification
1. Create an Earth-like planet (Size 8, Atm 6, Hydro 7).
2. Set Population to high values. Verify it auto-assigns the Rich (Ri) or Agricultural (Ag) trade codes based on exact rules.
3. Adjust Agriculture TL slider. Verify the Radar Chart visually reflects the change.
4. Check the Commodity modifiers panel to ensure Agricultural exports are appropriately discounted.
</PLAN 28: PLANETARY DESIGN FORGE>
