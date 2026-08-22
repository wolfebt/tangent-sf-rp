# PLAN 16: CODEX REACTIVE FORM INFRASTRUCTURE

> Phase 1 | Prerequisite for all matrix tools | Depends on: PLAN 15 (Foundation Engines)

---

## Overview

Upgrade the existing Codex Suite's UI layer from static form rendering to a reactive, formula-aware system. This plan modifies `CodexMatrixBuilder.jsx` and `codexConfig.js` to support computed fields, reactive cascades, live output panels, capacity meters, and crafting time tables. It also adds the compute-on-save middleware that persists derived values to Firestore.

---

## Proposed Changes

### Modified Files

#### [MODIFY] `src/pages/Codex/codexConfig.js`

Extend the matrix configuration schema to support:

1. **`computedOutputs[]`** — Array of computed value definitions displayed in the output panel
2. **`engineHooks`** — Named callback functions triggered by field changes and on save
3. **`relationalFields[]`** — Cross-matrix reference fields using `UnifiedRelationalSelectorModal`
4. **`budgets[]`** — Capacity/budget tracking configurations (UDU, Node, BP, Socket)
5. **`conditionalFields`** — Field visibility rules based on other field values
6. **`computeOnSave(formState)`** — Function that returns the `_computed` object to store

**Enhanced field properties:**
```javascript
{
  name: 'craft_dc',
  label: 'Crafting DC',
  type: 'number',
  min: 0,
  max: 80,
  // NEW properties:
  computed: false,           // If true, value is auto-calculated (read-only)
  computeFrom: null,         // Source field(s) for auto-calculation
  computeFn: null,           // Engine function name for calculation
  triggers: ['credit_value', 'material_cost', 'crafting_time', 'ws_threshold'], // Fields to recalculate when this changes
  helpText: 'The complexity rating that determines market value via the Tangent Standard Curve',
}
```

**Enhanced matrix entry properties:**
```javascript
{
  id: 'equipment',
  // ...existing properties...

  // NEW: Computed output panel configuration
  computedOutputs: [
    {
      id: 'credit_value',
      label: 'Market Value',
      icon: 'Coins',
      engine: 'econ',
      fn: 'calculateCreditValue',
      inputField: 'craft_dc',
      format: 'credits',       // Format as "2,560 Cr"
      color: '#f59e0b',
    },
    {
      id: 'material_cost',
      label: 'Material Cost (50%)',
      icon: 'Hammer',
      engine: 'econ',
      fn: 'calculateMaterialCost',
      inputField: '_credit_value', // References another computed output
      format: 'credits',
    },
    {
      id: 'crafting_time',
      label: 'Crafting Time',
      icon: 'Clock',
      engine: 'econ',
      fn: 'calculateAllCraftingTiers',
      inputField: '_credit_value',
      format: 'time_table',    // Renders CraftingTimeTable component
    },
    {
      id: 'ws_threshold',
      label: 'Wealth Score Required',
      icon: 'TrendingUp',
      engine: 'econ',
      fn: 'getWSFromDC',
      inputField: 'craft_dc',
      format: 'status_badge',  // Renders financial status badge
    },
    {
      id: 'complexity_tier',
      label: 'Complexity Tier',
      icon: 'Layers',
      engine: 'econ',
      fn: 'getComplexityTier',
      inputField: 'craft_dc',
      format: 'badge',
    },
  ],

  // NEW: Cross-matrix references
  relationalFields: [
    {
      name: 'linked_weapons',
      label: 'Mounted Weapons',
      targetCollection: 'weaponry',
      multiple: true,
      displayField: 'name',
    },
  ],

  // NEW: Budget/capacity tracking
  budgets: [
    {
      id: 'socket_budget',
      label: 'Socket Budget',
      type: 'udu',
      tier: 'Socket',
      maxField: 'component_slots',    // Field name that defines max capacity
      consumedByField: 'modifications', // Field whose items consume capacity
      color: '#06b6d4',
    },
  ],

  // NEW: Compute-on-save function
  computeOnSave: (formState, engines) => {
    const dc = Number(formState.craft_dc) || 0;
    const creditValue = engines.econ.calculateCreditValue(dc);
    return {
      credit_value: creditValue,
      material_cost: engines.econ.calculateMaterialCost(creditValue),
      ws_threshold: dc,
      financial_status: engines.econ.getFinancialStatus(dc)?.name,
      complexity_tier: engines.econ.getComplexityTier(dc),
      crafting_days: engines.econ.calculateAllCraftingTiers(creditValue),
      udu_displacement: { tier: 'Socket', count: 1 },
    };
  },
}
```

---

#### [MODIFY] `src/pages/Codex/CodexMatrixBuilder.jsx`

Major enhancement to support the reactive form system:

1. **Import engine modules** — `tangentEconEngine`, `tangentTechEngine`, `tangentUDUEngine`
2. **useComputedState hook** — Maintains a parallel `computedValues` state that recalculates when trigger fields change
3. **Reactive field rendering** — Fields marked `computed: true` render as read-only with a calculator icon and the auto-calculated value
4. **onChange cascade** — When a field with `triggers` changes, all listed target fields recalculate
5. **ComputedOutputPanel rendering** — When the active matrix has `computedOutputs`, render the side panel
6. **Budget meter rendering** — When the active matrix has `budgets`, render capacity meters inline
7. **Relational field rendering** — When a field is `relationalFields`, render the `UnifiedRelationalSelectorModal` trigger button
8. **Compute-on-save integration** — Before saving to Firestore, call `matrix.computeOnSave(formState, engines)` and merge the `_computed` object into the document

**Layout change:**
```
BEFORE:
┌─────────────────────────────────────┐
│         Matrix Builder Form         │
│  [field] [field] [field] [textarea] │
│  [field] [field] [textarea]         │
│                [Save] [Reset]       │
└─────────────────────────────────────┘

AFTER:
┌──────────────────────────┬──────────────────┐
│    Matrix Builder Form   │ Computed Outputs  │
│  [field] [field]         │ ┌──────────────┐ │
│  [craft_dc: 20]  ──────►│ │ Market: 2560 │ │
│  [field] [field]         │ │ Mat: 1280    │ │
│  [textarea]              │ │ WS: Affluent │ │
│  [textarea]              │ │ ┌──────────┐ │ │
│                          │ │ │Craft Time│ │ │
│  ┌──────────────────┐    │ │ │ Table... │ │ │
│  │ Socket Budget ████░░│ │ │ └──────────┘ │ │
│  │ 3/5 used           │ │ └──────────────┘ │
│  └──────────────────┘    │                  │
│        [Save] [Reset]    │                  │
└──────────────────────────┴──────────────────┘
```

---

#### [MODIFY] `src/pages/Codex/CodexApp.jsx`

Add compute-on-save middleware:

```javascript
const handleSaveItem = async (formState, matrixConfig) => {
  // 1. Run compute-on-save if the matrix defines it
  let computedValues = {};
  if (matrixConfig.computeOnSave) {
    computedValues = matrixConfig.computeOnSave(formState, {
      econ: tangentEconEngine,
      tech: tangentTechEngine,
      udu: tangentUDUEngine,
    });
  }

  // 2. Merge computed values into document
  const document = {
    ...formState,
    _computed: computedValues,
    _computed_override: false,
    _lastComputedAt: new Date().toISOString(),
  };

  // 3. Save to Firestore via existing DBM pipeline
  await saveToCollection(matrixConfig.targetCollection, document);
};
```

---

### New Files

#### [NEW] `src/pages/Codex/components/ComputedOutputPanel.jsx`

Live-updating dashboard panel showing all computed values for the current matrix form.

**Props:**
- `computedOutputs[]` — Configuration from `codexConfig.js`
- `computedValues` — Current calculated values from `useComputedState`
- `isLoading` — Shows shimmer state during recalculation

**Features:**
- Each output renders as a card with icon, label, and formatted value
- Values animate (counter tick-up) when recalculated
- `credits` format: Displays as `2,560 Cr` with cyan color
- `time_table` format: Renders inline `CraftingTimeTable`
- `status_badge` format: Renders financial status with color-coded badge
- `badge` format: Renders complexity tier label
- Responsive: Stacks below form on mobile, side panel on desktop

#### [NEW] `src/pages/Codex/components/UDUCapacityMeter.jsx`

Visual capacity gauge for Node/Socket/Mount/Module budgets.

**Props:**
- `label` — e.g., "Socket Budget"
- `used` — Current consumption
- `max` — Maximum capacity
- `tier` — UDU tier name for icon/color
- `items[]` — Individual items consuming capacity (for breakdown tooltip)

**Visual:**
- Segmented progress bar with fill animation
- Color transitions: Green (0-60%) → Amber (60-80%) → Red (80-100%) → Pulsing Red (over budget)
- Hover tooltip showing per-item breakdown
- Over-budget state shows exclamation icon and warning message

#### [NEW] `src/pages/Codex/components/CraftingTimeTable.jsx`

Auto-generated table showing crafting duration across all Production Tiers.

**Props:**
- `creditValue` — Item's credit value (= Target PP)
- `skillCheck` — Adjustable via slider (default 20)

**Features:**
- 7-row table: Improvised, Basic, Advanced, Industrial, Nanoforge, Bio/Cultivation, Genesis
- Each row shows: Tier name, Multiplier, Daily PP, Days to complete, Human-readable duration
- Skill check slider (range 11–40) with live recalculation
- Duration formatting: "<1 day" → "X days" → "X weeks" → "X months" → "X years"
- Highlight row matching the player's likely production tier

#### [NEW] `src/pages/Codex/hooks/useComputedState.js`

Custom React hook managing reactive computed state.

```javascript
export function useComputedState(matrixConfig, formState) {
  const [computedValues, setComputedValues] = useState({});

  useEffect(() => {
    if (!matrixConfig?.computedOutputs) return;
    
    const newComputed = {};
    for (const output of matrixConfig.computedOutputs) {
      const inputValue = output.inputField.startsWith('_')
        ? newComputed[output.inputField.slice(1)]  // Reference another computed value
        : formState[output.inputField];
      
      const engine = engines[output.engine];
      newComputed[output.id] = engine[output.fn](inputValue);
    }
    setComputedValues(newComputed);
  }, [matrixConfig, formState, /* ...tracked input fields */]);

  return computedValues;
}
```

---

#### [MODIFY] `src/components/DBM/DBMItemModal.jsx`

Add display and override support for `_computed` values:

1. **Computed Values Section** — New collapsible section in the item modal showing all `_computed` fields as read-only badges
2. **Override Toggle** — Architect/Admin-only toggle to enable manual editing of computed values
3. **Recalculate Button** — Re-runs the matrix's `computeOnSave` function and updates the document
4. **Override Flag** — When manually edited, sets `_computed_override: true` to prevent auto-recalculation

---

## Directory Structure After Phase 1

```
src/pages/Codex/
├── CodexApp.jsx                    (modified — compute-on-save middleware)
├── CodexSidebar.jsx                (unchanged)
├── CodexMatrixBuilder.jsx          (modified — reactive form, output panel, capacity meters)
├── CodexAiSynthesizerModal.jsx     (unchanged)
├── codexConfig.js                  (modified — enhanced schema with computed/relational/budget fields)
├── components/
│   ├── ComputedOutputPanel.jsx     (new)
│   ├── UDUCapacityMeter.jsx        (new)
│   └── CraftingTimeTable.jsx       (new)
└── hooks/
    └── useComputedState.js         (new)

src/engines/
├── tangentConstants.js             (from PLAN 15)
├── tangentEconEngine.js            (from PLAN 15)
├── tangentTechEngine.js            (from PLAN 15)
├── tangentUDUEngine.js             (from PLAN 15)
└── __tests__/
    ├── tangentEconEngine.test.mjs  (from PLAN 15)
    ├── tangentTechEngine.test.mjs  (from PLAN 15)
    └── tangentUDUEngine.test.mjs   (from PLAN 15)
```

---

## Verification

### Automated Tests
- Unit tests for `useComputedState` hook with mock matrix configs
- Snapshot tests for `ComputedOutputPanel`, `UDUCapacityMeter`, `CraftingTimeTable`
- Integration test: Change `craft_dc` field → verify all computed outputs update

### Manual Verification
- Open Equipment Matrix → enter DC 20 → verify output panel shows 2,560 Cr, 1,280 Cr material, Affluent WS
- Adjust skill check slider → verify crafting time table recalculates
- Save item → verify `_computed` object in Firestore document
- Open item in Omnicortex DBM → verify computed values displayed
- Toggle override → edit computed value → verify `_computed_override: true` flag

### Build Verification
- `npm run build` passes
- No regressions in existing Codex item creation/editing flow
- BASTION AI synthesizer still generates and populates form fields correctly
