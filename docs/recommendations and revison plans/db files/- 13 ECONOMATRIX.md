> Phase 5 | Priority 13/14 | Source: `docs/plans/CODEX/ECONOMATRIX.md`

## Overview
This tool implements the Economatrix Dashboard, which serves as a master economic reference suite with embedded interactive calculators and simulators for the entire Tangent SF RP game system. Unlike standard Codex matrix item creators, this uses a dashboard view approach.

## Source Document Analysis
- **TSC Formula**: Value (V) = 10 × 4^(DC/5).
- **Crafting**: Material Cost = 50% of V. Crafting Days = V / ((Check - 10) × Mult).
- **Wealth Score (WS)**: Determines purchasing power, Auto-Buy limits, liquidity gaps. Base WS derived from Occupation, Origin, Faction, TL, and Skills.
- **Trade**: Simulates speculative trading based on source/destination trade codes, tonnages, and d6 volatility.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/EconomatrixDashboard.jsx`
Main dashboard component rendering a scrollable suite of interactive calculator widgets and reference tables.

#### [NEW] `src/pages/Codex/components/TSCCalculatorWidget.jsx`
Widget with a 0-80 slider computing Credit Value, Material Cost, WS Threshold, and Tier. Include a visual curve chart.

#### [NEW] `src/pages/Codex/components/WealthCalculatorWidget.jsx`
Widget computing Starting Wealth Score based on dropdown selections (Occupation, Origin, Faction, TL, Skills).

#### [NEW] `src/pages/Codex/components/TradeSimulatorWidget.jsx`
Calculates trade profit/loss including transport overhead and d6 market volatility events.

#### [NEW] `src/pages/Codex/components/CraftingCalculatorWidget.jsx`
Calculates daily PP and required days based on tool tier and skill level.

#### [NEW] `src/pages/Codex/components/GearProcurementWidget.jsx`
List items by DC, calculates Auto-Buy eligibility or Liquidity Gap totals.

#### [NEW] `src/pages/Codex/components/WealthProgressionWidget.jsx`
Tracker widget for current WS vs target WS investment needed.

#### [NEW] `src/pages/Codex/components/FactionIndustrialWidget.jsx`
Planner widget for workforce count, average skill, tool tier, computing completion calendars.

### Modified Files
#### [MODIFY] `src/pages/Codex/CodexApp.jsx`
Update routing logic to render `EconomatrixDashboard` when `viewType === 'dashboard'` and ID is `economatrix`.

#### [MODIFY] `src/pages/Codex/codexConfig.js`
Add `'economatrix'` entry with `viewType: 'dashboard'`, disabling standard form builder UI.

## Data Model
```typescript
interface WealthProfile {
  occupation: string;
  originMod: number;
  factionMod: number;
  tlMod: number;
  skillRanks: number;
  computedWS: number;
}
```

## Calculation Engine Integration
Calls `tangentEconEngine.js` for:
- `calculateTSCValue(dc: number)`
- `calculateCraftingTime(creditValue, check, multiplier)`
- `calculateLiquidityGap(ws, dc)`
- `simulateTradeProfit(source, dest, commodity, tons, check)`

## UI Specification
### Form Fields (codexConfig.js Entry)
```javascript
economatrix: {
  id: 'economatrix',
  name: 'Economatrix Dashboard',
  viewType: 'dashboard',
  // No standard fields; purely dashboard routing
}
```

### Computed Output Panel
Dashboards output inline computation results (e.g., net worth, material cost, trade profit) directly within their widget cards.

### Interactive Features
- Sliders for DC (0-80).
- Dynamic curve charts for TSC Value scaling.
- Interactive tables with highlight-on-hover for Financial Status.

## Cross-Matrix References
Reference Faction entries for Wealth Modifiers. Interacts closely with Equipment/Weapon DC values.

## Firestore Schema
No primary collection storing a single matrix item. Optional user-saved "Wealth Profiles" or "Trade Routes" could be saved under `user_profiles/{userId}/wealth_profiles`.

## Verification
- Slide DC to 0, verify V=10. Slide to 5, verify V=40.
- Check that selecting an Occupation with base WS 10 correctly yields WS 10 + modifiers.
- Test routing via `CodexApp` to ensure it bypasses the Matrix Builder form.
