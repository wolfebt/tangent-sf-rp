# VTT & ADE — Complete Implementation Plan
**Tangent SF RP React Project**
*Generated: September 24, 2026*

> [!IMPORTANT]
> This plan is sequenced so that each phase is self-contained and safe to ship independently. No phase depends on an incomplete later phase. Items within a phase that are independent of each other are tagged **[parallel]** — they can be worked simultaneously.

---

## Phase Overview

| Phase | Name | Effort | Risk | Value |
|---|---|---|---|---|
| **1** | Quick Wins — Dead Code & Store Hygiene | ~2 hrs | 🟢 Low | Removes confusion, stops bad defaults |
| **2** | Beat Persistence — Scenario Drawer State | ~1 hr | 🟢 Low | Fixes lost GM progress |
| **3** | Compiler Loop Close — ADE → VTT Wire-Up | ~4 hrs | 🟡 Medium | Closes the biggest functional gap |
| **4** | NPC Simulation Tick | ~3 hrs | 🟡 Medium | Activates already-written patrol/sentry logic |
| **5** | Event Bus Hardening | ~3 hrs | 🟡 Medium | Type safety, replaces fragile DOM events |
| **6** | `StageView.tsx` Decomposition | ~12–16 hrs | 🔴 High | Critical for long-term maintainability |

---

## Phase 1 — Quick Wins: Dead Code & Store Hygiene

### 1.1 — Remove Dead `ADEScenarioStageDrawer` Overlay Instance

**File:** [`src/components/VTT/TripartiteStageView.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/TripartiteStageView.tsx)

**Problem:** The floating overlay instance of `ADEScenarioStageDrawer` around line 474 has `isOpen={isScenarioDrawerOpen}`, where `isScenarioDrawerOpen` defaults to `false` and nothing in `TripartiteStageView` ever sets it to `true`. It is permanently invisible dead UI.

**Steps:**
1. Open `TripartiteStageView.tsx`.
2. Find the state declaration `const [isScenarioDrawerOpen, setIsScenarioDrawerOpen] = useState(false)`.
3. Find the floating overlay `<ADEScenarioStageDrawer ... isOpen={isScenarioDrawerOpen} ... />` render block (the one that is NOT wrapped in the tab panel, roughly L474–480).
4. Delete the floating overlay render block entirely.
5. Delete the `isScenarioDrawerOpen` state declaration.
6. Delete `setIsScenarioDrawerOpen` from any import or prop chains.
7. Keep the inline version (inside the `activeCategory === 'scenario'` tab panel, `isInline={true}`, `isOpen={true}`) — this is the correct one.

**Verification:** Open VTT, switch left panel to SCENARIO tab, confirm drawer renders. No regressions in other tabs.

---

### 1.2 — Null-Default Hardcoded Token IDs in Store [parallel]

**File:** [`src/components/VTT/store/uiLayoutStore.ts`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/store/uiLayoutStore.ts)

**Problem:** The store initializes `selectedTokenId: 'op-jax'` and `targetTokenId: 'mech-vanguard'`. These are stale demo placeholder strings. When a real campaign loads, every consumer of these values sees garbage IDs until something overwrites them.

**Steps:**
1. Open `uiLayoutStore.ts`.
2. In the initial state object (inside `create(...)`), change:
   ```ts
   // BEFORE
   selectedTokenId: 'op-jax',
   targetTokenId: 'mech-vanguard',

   // AFTER
   selectedTokenId: null,
   targetTokenId: null,
   ```
3. Check the `UILayoutState` TypeScript interface — ensure `selectedTokenId` and `targetTokenId` are typed as `string | null` (not just `string`). Update if needed.
4. Check all consumers of `selectedTokenId` / `targetTokenId` in `StageView.tsx`, `CockpitPanel.tsx`, `GMInspector.tsx`, `TangentActionDeck.tsx`. Any place that does `store.selectedTokenId` without a null guard needs a defensive `?? null` or early return.

**Verification:** Open VTT with an empty universe. No phantom token selection should appear in the cockpit or HUD. Drop a token and confirm it becomes selected.

---

### 1.3 — Consolidate Orphaned `ScratchbookModal` in ADE [parallel]

**File:** [`src/pages/Foundry/StoryModule/StoryModule.jsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/pages/Foundry/StoryModule/StoryModule.jsx)

**Problem:** `StoryModule.jsx` declares `isScratchbookOpen` state and renders a standalone `<ScratchbookModal>`. However, both `ADENavRail` and `ADETopToolbar` route the Scratchbook button to `CronicleDeckModal` with `mode='scratchbook'` — the standalone `ScratchbookModal` is never triggered from any nav path.

**Steps:**
1. Open `StoryModule.jsx`.
2. Locate the `isScratchbookOpen` state declaration and `setIsScratchbookOpen` setter.
3. Locate the `<ScratchbookModal isOpen={isScratchbookOpen} ... />` render.
4. **Confirm** by searching the codebase that nothing else calls `setIsScratchbookOpen(true)` outside of `StoryModule` itself.
5. If confirmed orphaned: delete the `useState(false)` declaration, delete the `<ScratchbookModal>` render, remove the import.
6. In `ADETopToolbar`, confirm the scratchbook button already calls `onToggleScratchbook` which routes to `CronicleDeckModal`. If it does, all Scratchbook access now lives inside Cronicle.
7. If `onOpenScratchbook` still exists as a prop on `ADENavRail`, route it to `setCronicleInitialMode('scratchbook'); setIsCronicleOpen(true)` (confirm this is already the case).

**Verification:** Click the Scratchbook icon in both the NavRail and TopToolbar. Confirm `CronicleDeckModal` opens in scratchbook mode. No `ScratchbookModal` remains.

---

### 1.4 — Resolve the `'bastion'` Cockpit Tab Discrepancy [parallel]

**Files:**
- [`src/components/VTT/store/uiLayoutStore.ts`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/store/uiLayoutStore.ts)
- [`src/components/VTT/cockpit/CockpitPanel.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/cockpit/CockpitPanel.tsx)

**Problem:** `uiLayoutStore.ts` defines `CockpitTab` type including `'bastion'`. The cockpit tab strip in `CockpitPanel.tsx` renders Actions / Mecha & Sockets / Inspector / AIME / Notes — but no Bastion tab.

**Decision point — choose one:**

**Option A (Add the Tab):** Bastion mechanics (Stronghold/Base system) are actively designed. Add the tab now as a placeholder.
1. In `CockpitPanel.tsx`, in the tab strip array, add:
   ```tsx
   { id: 'bastion', label: 'Bastion', icon: <Shield size={13} /> }
   ```
2. In the tab content `switch` or conditional render, add a `'bastion'` case:
   ```tsx
   {activeCockpitTab === 'bastion' && (
     <div className="p-4 text-slate-500 text-xs font-mono text-center">
       <p>Bastion HQ — Command & Logistics</p>
       <p className="text-slate-600 mt-1">Coming soon.</p>
     </div>
   )}
   ```

**Option B (Remove the Type):** Bastion is not in active development. Remove it from the type.
1. In `uiLayoutStore.ts`, remove `'bastion'` from the `CockpitTab` type union.
2. If the persisted `localStorage` value has `activeCockpitTab: 'bastion'`, add a migration guard in the store's `onRehydrateStorage` callback to reset to `'actions'` if the value is `'bastion'`.

**Verification:** Open VTT cockpit. Tab strip renders without errors. No TypeScript complaints about `CockpitTab`.

---

## Phase 2 — Scene Beat Persistence

### 2.1 — Persist `completedBeats` in `ADEScenarioStageDrawer`

**File:** [`src/components/VTT/stage/ADEScenarioStageDrawer.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/stage/ADEScenarioStageDrawer.tsx)

**Problem:** `completedBeats` is a `Set<number>` in local `useState`. When the VTT unmounts, reloads, or switches maps, GM progress on scene beats is silently lost.

**Steps:**

1. Determine the persistence key. The beat set is keyed by scenario, so use:
   ```
   `tangent_vtt_beats_${scenarioId}`
   ```

2. Replace the current `useState` initialization with a lazy initializer that reads from `localStorage`:
   ```tsx
   // BEFORE
   const [completedBeats, setCompletedBeats] = useState<Set<number>>(new Set());

   // AFTER
   const [completedBeats, setCompletedBeats] = useState<Set<number>>(() => {
     if (!scenario?.id) return new Set();
     try {
       const raw = localStorage.getItem(`tangent_vtt_beats_${scenario.id}`);
       const arr: number[] = raw ? JSON.parse(raw) : [];
       return new Set(arr);
     } catch {
       return new Set();
     }
   });
   ```

3. Add a `useEffect` to persist whenever `completedBeats` or `scenario.id` changes:
   ```tsx
   useEffect(() => {
     if (!scenario?.id) return;
     localStorage.setItem(
       `tangent_vtt_beats_${scenario.id}`,
       JSON.stringify(Array.from(completedBeats))
     );
   }, [completedBeats, scenario?.id]);
   ```

4. Add a `useEffect` to re-initialize when the scenario changes (user navigates to a different scenario):
   ```tsx
   useEffect(() => {
     if (!scenario?.id) return;
     try {
       const raw = localStorage.getItem(`tangent_vtt_beats_${scenario.id}`);
       const arr: number[] = raw ? JSON.parse(raw) : [];
       setCompletedBeats(new Set(arr));
     } catch {
       setCompletedBeats(new Set());
     }
   }, [scenario?.id]);
   ```

5. Add a "Reset All Beats" button in the drawer footer:
   ```tsx
   <button
     onClick={() => {
       setCompletedBeats(new Set());
       if (scenario?.id) localStorage.removeItem(`tangent_vtt_beats_${scenario.id}`);
     }}
     className="text-[10px] text-slate-500 hover:text-red-400 font-mono transition-colors"
   >
     Reset Beats
   </button>
   ```

**Verification:** Check two beats → refresh page → beats are still checked. Switch to different scenario → beats clear. Switch back → beats restored.

---

## Phase 3 — Close the Compiler Loop: ADE → VTT Wire-Up

This is the most significant functional gap. The `VttModuleCompilerService` produces a complete `compiledPackage` object but nothing consumes it. This phase wires the compiled output directly into the engine.

### 3.1 — Add `deployCompiledPackage` Action to `uiLayoutStore` or Engine

**File:** [`src/components/VTT/store/uiLayoutStore.ts`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/store/uiLayoutStore.ts)

Add a Zustand action that holds the last compiled package so `StageView` can subscribe to it:

```ts
// In UILayoutState interface, add:
lastCompiledPackage: CompiledVttPackage | null;
setLastCompiledPackage: (pkg: CompiledVttPackage | null) => void;

// In the store create(), add to initial state:
lastCompiledPackage: null,

// And the action:
setLastCompiledPackage: (pkg) => set({ lastCompiledPackage: pkg }),
```

Define `CompiledVttPackage` as a TypeScript interface in a new file:
```
src/types/vttPackage.ts
```
Matching the shape returned by `VttModuleCompilerService.compileScenarioForVtt()`.

---

### 3.2 — Create `deployCompiledPackage()` Utility Function

**New file:** `src/utils/deployVttPackage.ts`

This pure function takes the compiled package and injects it into the engine and campaign map:

```ts
import { useEngineStore } from '../engine/index';
import type { CompiledVttPackage } from '../types/vttPackage';

export function deployCompiledPackage(
  pkg: CompiledVttPackage,
  updateMap: (mapId: string, patch: Partial<any>) => void,
  activeMapId: string
): { tokensDeployed: number; objectsDeployed: number } {
  const engineStore = useEngineStore.getState();

  // 1. Batch-load compiled NPC tokens into the engine
  const tokens = pkg.map?.tokens ?? [];
  tokens.forEach((tok: any) => {
    // Convert compiled token shape → StaticEntity shape
    const staticEntity = {
      id: tok.id,
      name: tok.name || tok.label || 'NPC Operative',
      base_hp: tok.health?.max ?? 30,
      base_vitality: tok.vitality?.max ?? 30,
      base_health: tok.health?.max ?? 30,
      armor_dr: tok.defense ?? 12,
      stamina_dr: 2,
      tech_level: 3,
      speed_ft: 30,
      size_modifier: 0,
      is_persona: false,
      image_url: tok.avatarUrl ?? null,
      character_doc_id: tok.storyElementId ?? null,
    };
    engineStore.loadStaticEntity(staticEntity);
    if (tok.x != null && tok.y != null) {
      engineStore.updatePosition(tok.id, tok.x, tok.y);
    }
  });

  // 2. Merge compiled tokens + objects into the active map record via CampaignContext
  const patchedTokens = [
    ...(tokens.map((t: any) => ({
      ...t,
      x: t.x ?? 400,
      y: t.y ?? 400
    })))
  ];
  const patchedObjects = pkg.map?.objects ?? [];

  updateMap(activeMapId, {
    tokens: patchedTokens,
    objects: patchedObjects,
    walls: pkg.map?.walls ?? undefined,
  });

  return {
    tokensDeployed: tokens.length,
    objectsDeployed: patchedObjects.length,
  };
}
```

> [!NOTE]
> `updateMap` is a shallow merge in `CampaignContext`. If the map already has tokens you don't want to replace, this function needs to merge arrays instead of replace. Consider adding a `mergeMode: 'replace' | 'merge'` param. Default to `'replace'` for now (compiler output is authoritative).

---

### 3.3 — Wire `VttCompilerModal` Deploy Button

**File:** `src/components/StoryFoundry/VttCompilerModal.jsx`

The compiler modal shows compilation results. Add a **"Deploy to Active Stage"** button that:
1. Calls `deployCompiledPackage()` with the current `compiledResult.package`.
2. Navigates to `/stage?mapId=<activeMapId>&scenarioId=<scenarioId>`.
3. Shows a brief success toast with token/object count.

```jsx
import { deployCompiledPackage } from '../../utils/deployVttPackage';
import { useCampaign } from '../../context/CampaignContext';
import { useNavigate } from 'react-router-dom';

// Inside VttCompilerModal, after compilation:
const { updateMap, activeMapId } = useCampaign();
const navigate = useNavigate();

const handleDeployToStage = () => {
  if (!compiledResult?.package) return;
  const { tokensDeployed, objectsDeployed } = deployCompiledPackage(
    compiledResult.package,
    updateMap,
    activeMapId
  );
  AudioService.playCriticalChime(true);
  // Brief status message
  setDeployStatus(`✅ Deployed ${tokensDeployed} tokens + ${objectsDeployed} objects to Stage`);
  // Navigate after short delay
  setTimeout(() => {
    navigate(`/stage?mapId=${activeMapId}&scenarioId=${activeNode?.id || ''}`);
  }, 1200);
};
```

Add a `deployStatus` state (`useState('')`) and render it above the deploy button as a small status line.

Add the button in the modal footer next to the existing "Close" or "Done" button:
```jsx
<button
  onClick={handleDeployToStage}
  disabled={!compiledResult?.diagnostics?.isValid}
  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-mono font-bold text-xs uppercase flex items-center gap-2 disabled:opacity-40 cursor-pointer"
>
  <span>⚔️</span>
  <span>DEPLOY TO STAGE</span>
</button>
```

> [!IMPORTANT]
> Only enable the button when `compiledResult.diagnostics.isValid === true`. If there are errors, show the error list and disable the button. Warnings are non-blocking.

---

### 3.4 — Subscribe to `lastCompiledPackage` in `StageView` (Optional Auto-Deploy)

**File:** [`src/components/VTT/StageView.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/StageView.tsx)

For a seamless flow where navigating to `/stage` after compilation auto-applies the package, add this effect:

```tsx
const lastCompiledPackage = useUILayoutStore(s => s.lastCompiledPackage);
const clearLastCompiledPackage = useUILayoutStore(s => s.setLastCompiledPackage);

useEffect(() => {
  if (!lastCompiledPackage || !activeMapId || !updateMap) return;
  deployCompiledPackage(lastCompiledPackage, updateMap, activeMapId);
  clearLastCompiledPackage(null); // Consume the package — prevent re-applying on re-render
}, [lastCompiledPackage]);
```

Then in `VttCompilerModal`, instead of calling `deployCompiledPackage` directly, set the store:
```js
setLastCompiledPackage(compiledResult.package);
navigate(`/stage?mapId=${activeMapId}`);
```
This gives a clean single-call deploy: modal sets the package → navigation triggers → StageView auto-ingests on mount.

**Verification:**
1. In ADE, author a scenario with 2 Persona elements.
2. Click "PREP VTT MODULE" → compile → validation passes.
3. Click "DEPLOY TO STAGE" → navigate to VTT.
4. Confirm 2 NPC tokens appear on the canvas at their compiled positions.
5. Confirm `engineStore.getState().entities` contains the compiled token IDs.

---

## Phase 4 — NPC Simulation Tick

### 4.1 — Add Game Loop Tick to `StageView.tsx`

**File:** [`src/components/VTT/StageView.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/StageView.tsx)

**Problem:** `stepNpcPatrols()` and `evaluateSentryVision()` are fully written in `reactiveVttService.js` but are never called. There is no game-loop tick.

**Steps:**

1. Import the service functions:
   ```tsx
   import { stepNpcPatrols, evaluateSentryVision, evaluateTrapTriggers } from '../../services/reactiveVttService';
   ```

2. Add a `useRef` for the tick interval:
   ```tsx
   const npcTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
   ```

3. Add a `useEffect` that starts/stops the tick based on `isMultiplayerSimActive`:
   ```tsx
   useEffect(() => {
     if (!isMultiplayerSimActive) {
       if (npcTickRef.current) {
         clearInterval(npcTickRef.current);
         npcTickRef.current = null;
       }
       return;
     }

     npcTickRef.current = setInterval(() => {
       const engineState = useEngineStore.getState();
       const allEntities = Object.values(engineState.entities || {});
       const allTokens = allEntities.map(e => ({
         id: e.id,
         x: engineState.positions[e.id]?.x ?? 0,
         y: engineState.positions[e.id]?.y ?? 0,
         script: e.script,
       }));

       // Step all NPC patrol tokens
       const updatedTokens = stepNpcPatrols(allTokens, 20);
       updatedTokens.forEach(tok => {
         const orig = allTokens.find(t => t.id === tok.id);
         if (orig && (orig.x !== tok.x || orig.y !== tok.y)) {
           engineState.updatePosition(tok.id, tok.x, tok.y);
         }
       });

       // Evaluate sentry vision for each sentry token
       const heroTokens = allTokens.filter(t => {
         const entity = engineState.entities[t.id];
         return entity?.is_persona || entity?.designation === 'Ally';
       });
       updatedTokens.forEach(tok => {
         const entity = engineState.entities[tok.id];
         if (entity?.script?.type === 'sentry') {
           const detection = evaluateSentryVision(
             { ...tok, script: entity.script },
             heroTokens
           );
           if (detection) {
             // Dispatch a sentry alert event for the combat log to consume
             window.dispatchEvent(new CustomEvent('sentry-alert', {
               detail: detection
             }));
           }
         }
       });
     }, 1500); // Tick every 1.5 seconds

     return () => {
       if (npcTickRef.current) clearInterval(npcTickRef.current);
     };
   }, [isMultiplayerSimActive]);
   ```

> [!NOTE]
> The 1500ms tick is intentionally slow. NPC patrols don't need frame-rate precision. This keeps CPU cost negligible. Make it configurable via a `NPC_TICK_MS` constant if you want to tune it.

---

### 4.2 — Add Sentry Alert Combat Log Handler

**File:** [`src/components/VTT/StageView.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/StageView.tsx)

Inside the existing `window.addEventListener` block (around L614–635), add:

```tsx
const handleSentryAlert = (e: CustomEvent) => {
  const { detectedHero, alertBark, facingAngleDeg } = e.detail;
  // Add to combat log (use whatever setCombatLog / addCombatLogEntry pattern already exists)
  addCombatLogEntry({
    type: 'sentry',
    message: alertBark || '🚨 SENTRY ALERT! Intruder detected!',
    tokenId: detectedHero?.id,
    timestamp: Date.now(),
  });
  AudioService.playTerminalBeep(1200, 0.4);
};

window.addEventListener('sentry-alert', handleSentryAlert as EventListener);

// In cleanup return:
window.removeEventListener('sentry-alert', handleSentryAlert as EventListener);
```

---

### 4.3 — Trap Evaluation on Token Move

**File:** [`src/components/VTT/StageView.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/StageView.tsx)

Traps should be checked whenever a token is moved (not on a tick, but on the move event itself). Find the existing `handleTokenDrop` / `handleTokenPointerUp` / move-commit handler and add:

```tsx
// After position is committed:
const movedToken = { id: tokenId, x: newX, y: newY, ...engineStore.entities[tokenId] };
const objectsOnMap = activeMap?.objects ?? [];
const allTokens = Object.values(engineStore.entities).map(e => ({
  ...e,
  x: engineStore.positions[e.id]?.x ?? 0,
  y: engineStore.positions[e.id]?.y ?? 0,
}));

const trapEvents = evaluateTrapTriggers(movedToken, objectsOnMap, allTokens);
trapEvents.forEach(evt => {
  addCombatLogEntry({
    type: evt.isAlarm ? 'alarm' : 'trap',
    message: evt.logMessage,
    tokenId: movedToken.id,
    timestamp: Date.now(),
  });
  if (evt.damage > 0) {
    // Apply damage to token HP via engine store
    engineStore.applyDamage?.(movedToken.id, evt.damage);
  }
});
```

**Verification:**
1. Enable "Multiplayer Sim" toggle in the breadcrumb bar.
2. Place a token with `script: { type: 'patrol', waypoints: [...] }`.
3. Confirm the token moves on the canvas at ~1.5s intervals.
4. Place a sentry token with `script: { type: 'sentry', visionRangePx: 300, facingAngleDeg: 0, visionFovDeg: 90 }`.
5. Move a hero token into the sentry's FOV — confirm combat log shows sentry alert.
6. Place a `proximity_plasma_mine` object and move a token near it — confirm trap triggers and log entry appears.

---

## Phase 5 — Event Bus Hardening

### 5.1 — Create Typed VTT Event Bus

**New file:** `src/utils/vttEventBus.ts`

Replace all `window.dispatchEvent(new CustomEvent(...))` / `window.addEventListener(...)` with a typed event bus:

```ts
// All known VTT custom events with their payload types
export interface VttEventMap {
  'open-landmass-modal': void;
  'open-uvtt-modal': void;
  'open-asset-manager': void;
  'open-layers-panel': void;
  'open-new-map-modal': void;
  'load-preset-starship': void;
  'load-preset-outpost': void;
  'export-stage-png': void;
  'open-tactical-play-modal': void;
  'companion-deploy-toggle': { companionId: string; isDeploying: boolean };
  'sentry-alert': { detectedHero: any; alertBark: string; facingAngleDeg: number };
  'story-foundry-milestone-reached': { milestoneId: string; scenarioId: string };
}

type VttEventCallback<K extends keyof VttEventMap> =
  VttEventMap[K] extends void
    ? () => void
    : (payload: VttEventMap[K]) => void;

export const VttEventBus = {
  emit<K extends keyof VttEventMap>(
    event: K,
    ...args: VttEventMap[K] extends void ? [] : [VttEventMap[K]]
  ): void {
    const detail = args[0] ?? undefined;
    window.dispatchEvent(new CustomEvent(event, { detail }));
  },

  on<K extends keyof VttEventMap>(
    event: K,
    handler: VttEventCallback<K>
  ): () => void {
    const wrapped = (e: Event) => {
      const ce = e as CustomEvent;
      (handler as any)(ce.detail);
    };
    window.addEventListener(event, wrapped);
    return () => window.removeEventListener(event, wrapped);
  },
};
```

### 5.2 — Migrate Emit Sites

Replace all `window.dispatchEvent(new CustomEvent('...'))` calls across the codebase:

| Old | New |
|---|---|
| `window.dispatchEvent(new CustomEvent('open-uvtt-modal'))` | `VttEventBus.emit('open-uvtt-modal')` |
| `window.dispatchEvent(new CustomEvent('open-landmass-modal'))` | `VttEventBus.emit('open-landmass-modal')` |
| `window.dispatchEvent(new CustomEvent('export-stage-png'))` | `VttEventBus.emit('export-stage-png')` |
| `window.dispatchEvent(new CustomEvent('companion-deploy-toggle', { detail: {...} }))` | `VttEventBus.emit('companion-deploy-toggle', { ... })` |
| etc. | |

**Files to update:**
- [`StageBreadcrumbTabs.tsx`](file:///d:/_%20Data/Tangent%20SF%20RP/TANGENT%20SF%20RP%20react%20project/src/components/VTT/stage/StageBreadcrumbTabs.tsx) — `open-uvtt-modal`, `open-landmass-modal`, `export-stage-png`
- `StageView.tsx` — all `window.addEventListener` for modals, companion deploy, sentry alert
- `TripartiteStageView.tsx` — companion deploy listener
- `ADEScenarioStageDrawer.tsx` — `story-foundry-milestone-reached`
- Any `ArchitectConsoleRail` that dispatches `open-asset-manager`, `open-layers-panel`, etc.

### 5.3 — Migrate Listener Sites

Replace all `window.addEventListener('...', handler)` + `window.removeEventListener(...)` patterns with:

```tsx
useEffect(() => {
  const off = VttEventBus.on('open-uvtt-modal', () => setIsUvttModalOpen(true));
  return off; // VttEventBus.on returns its own cleanup function
}, []);
```

**Verification:** All modal triggers still work. TypeScript will catch any typos in event names at compile time.

---

## Phase 6 — `StageView.tsx` Decomposition

> [!WARNING]
> This is the highest-risk phase. `StageView.tsx` is 3,831 lines with deeply intertwined state. Do this incrementally — **one extraction per PR** — not all at once. Each extraction should be fully tested before the next begins.

### Extraction Strategy

The guiding principle: **extract by concern, not by size**. Each extracted unit should be independently testable with clearly defined inputs and outputs.

---

### 6.1 — Extract `useMapIngestion` Hook

**New file:** `src/components/VTT/hooks/useMapIngestion.ts`

**What it contains:** The `useEffect` block (currently around lines 450–565 in `StageView.tsx`) that:
- Reads the active map object
- Calls `BVHBuilder.buildFromWalls()` with map walls
- Calls `loadStaticEntitiesBatch()` for map tokens
- Calls `InteractiveObjMgr.loadObjects()` for map objects
- Calls `LightSourceManager.loadLights()` for map lights

**Interface:**
```ts
function useMapIngestion(options: {
  activeMap: any;
  bvhBuilderRef: React.MutableRefObject<BVHBuilder | null>;
  lightManagerRef: React.MutableRefObject<LightSourceManager | null>;
  interactiveObjMgrRef: React.MutableRefObject<InteractiveObjMgr | null>;
}): void
```

**Steps:**
1. Create `src/components/VTT/hooks/useMapIngestion.ts`.
2. Move the map ingestion `useEffect` into the hook body verbatim.
3. Identify all dependencies that come from `StageView` state/refs — pass them as parameters.
4. In `StageView`, replace the effect with: `useMapIngestion({ activeMap, bvhBuilderRef, lightManagerRef, interactiveObjMgrRef });`
5. TypeScript compile check — resolve any broken refs.

---

### 6.2 — Extract `useCanvasEventListeners` Hook

**New file:** `src/components/VTT/hooks/useCanvasEventListeners.ts`

**What it contains:** All `window.addEventListener` / `window.removeEventListener` calls in `StageView`:
- `companion-deploy-toggle`
- `open-landmass-modal`, `open-uvtt-modal`, `open-asset-manager`, `open-layers-panel`
- `sentry-alert`
- `story-foundry-milestone-reached`
- `export-stage-png`

**Interface:**
```ts
function useCanvasEventListeners(options: {
  setIsUvttModalOpen: (v: boolean) => void;
  setIsLandmassModalOpen: (v: boolean) => void;
  setIsAssetManagerOpen: (v: boolean) => void;
  setIsLayersPanelOpen: (v: boolean) => void;
  onCompanionDeploy: (detail: any) => void;
  addCombatLogEntry: (entry: any) => void;
  onExportPng: () => void;
}): void
```

**Steps:**
1. Create `src/components/VTT/hooks/useCanvasEventListeners.ts`.
2. Move all event listener `useEffect` blocks into this hook.
3. Replace with VttEventBus listeners (Phase 5 migration should happen first).
4. Inject dependencies via the options object.
5. In `StageView`, call: `useCanvasEventListeners({ setIsUvttModalOpen, ... });`

---

### 6.3 — Extract `useDesignModeController` Hook

**New file:** `src/components/VTT/hooks/useDesignModeController.ts`

**What it contains:** All state and effects tied to `isDesignModeActive` and `activeDesignTool`:
- The design tool selection state (wall, terrain, pencil, light, object, hazard, ruler, text)
- Wall segment state arrays (`wallSegments`, `currentWall`)
- Terrain paint state (`terrainBrush`, `terrainCells`)
- Text annotation state
- Effects that sync design mode state to the Pixi canvas layer visibility

**Interface:**
```ts
function useDesignModeController(options: {
  compositorRef: React.MutableRefObject<LayerCompositor | null>;
  activeMap: any;
  updateMap: (id: string, patch: any) => void;
}): {
  isDesignModeActive: boolean;
  activeDesignTool: string;
  setActiveDesignTool: (tool: string) => void;
  wallSegments: WallSegment[];
  setWallSegments: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  // ... all other design state
  onToggleDesignMode: () => void;
}
```

---

### 6.4 — Extract `useCombatController` Hook

**New file:** `src/components/VTT/hooks/useCombatController.ts`

**What it contains:**
- `combatLog` state + `addCombatLogEntry` function
- Turn tracker state (`initiativeOrder`, `currentTurnIndex`, `isCombatActive`)
- `advanceTurn()`, `startCombat()`, `endCombat()` functions
- All `CombatArbitrator` and `DamagePipeline` calls
- Attack flow state (`pendingAttack`, `isAttackModalOpen`)

**Interface:**
```ts
function useCombatController(options: {
  engineStore: EngineStore;
  activeMap: any;
}): {
  combatLog: CombatLogEntry[];
  addCombatLogEntry: (entry: CombatLogEntry) => void;
  isCombatActive: boolean;
  initiativeOrder: string[];
  currentTurnIndex: number;
  startCombat: () => void;
  endCombat: () => void;
  advanceTurn: () => void;
  isAttackModalOpen: boolean;
  pendingAttack: PendingAttack | null;
  openAttackModal: (attacker: string, target: string) => void;
}
```

---

### 6.5 — Extract `MapRenderLayers` Component (or Hooks)

**New file:** `src/components/VTT/stage/MapRenderLayers.tsx`

**What it contains:** All `useEffect` blocks that draw to the Pixi canvas in response to map data changes:
- Wall render effect (draws wall segments to `layer_walls`)
- Terrain render effect (draws terrain cells to `layer_terrain`)
- Line/pencil annotation render effect
- Text annotation render effect

These effects are pure renderers — they read props/state and call Pixi drawing methods. They have no interactive state of their own. They can be extracted to a component or a collection of focused hooks.

**Preferred pattern — render hooks:**
```ts
// src/components/VTT/hooks/useWallRenderer.ts
function useWallRenderer(options: {
  wallSegments: WallSegment[];
  compositorRef: React.MutableRefObject<LayerCompositor | null>;
  isDesignModeActive: boolean;
}): void
```

---

### 6.6 — Token Manager & Radial Menu Extraction

**New file:** `src/components/VTT/stage/TokenRadialMenu.tsx`

The token right-click radial menu is purely presentational and can be lifted out of `StageView`. It renders contextual actions for the selected token (Move, Attack, Status, Inspect, Remove).

**Interface:**
```tsx
interface TokenRadialMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  tokenId: string | null;
  onClose: () => void;
  onAction: (action: string, tokenId: string) => void;
}
```

---

### Phase 6 Extraction Order & Checkpoints

```
6.1 useMapIngestion         ← Start here — most isolated, no UI
6.2 useCanvasEventListeners ← Do after Phase 5 (VttEventBus)
6.3 useDesignModeController ← Medium coupling, do third
6.4 useCombatController     ← Highest internal coupling, do fourth
6.5 MapRenderLayers (hooks) ← After 6.3 (design mode state feeds renderers)
6.6 TokenRadialMenu         ← Final — pure UI, can be done any time
```

**Checkpoint after each extraction:**
- TypeScript compiles with no errors
- VTT loads and the canvas renders correctly
- Design mode tools work
- Token drag, selection, and radial menu work
- Combat log appears on attacks

---

## Cross-Cutting Concerns

### Beat Completion Notification to ADE Cronicle

Currently `ADEScenarioStageDrawer` fires `story-foundry-milestone-reached` but `StoryModule.jsx` / Cronicle has no listener for this event. After Phase 5 (VttEventBus), add a listener in `CronicleDeckModal` or the Cronicle service:

```ts
VttEventBus.on('story-foundry-milestone-reached', ({ milestoneId, scenarioId }) => {
  // Add to Cronicle living timeline as a "Scene Beat Complete" delta
  addCronicleDelta({
    type: 'milestone',
    scenarioId,
    milestoneId,
    timestamp: Date.now(),
    label: 'Scene Beat Completed',
  });
});
```

---

### `isRightPanelOpen` Reactivity Bug

In `uiLayoutStore.ts`, `isRightPanelOpen` is implemented as a **getter property** derived from `isRightCollapsed`, not as reactive Zustand state. This means components that call `useUILayoutStore(s => s.isRightPanelOpen)` may get stale values on re-renders since getter properties don't trigger Zustand subscriptions.

**Fix:** Replace the getter with a proper state field:
```ts
// In UILayoutState, add:
isRightPanelOpen: boolean;
setIsRightPanelOpen: (open: boolean) => void;

// In initial state:
isRightPanelOpen: true,

// Action:
setIsRightPanelOpen: (open) => set(
  produce(state => { state.isRightPanelOpen = open; state.isRightCollapsed = !open; })
),

// Keep isRightCollapsed as the persisted source of truth,
// and derive isRightPanelOpen from it on rehydration:
onRehydrateStorage: () => (state) => {
  if (state) state.isRightPanelOpen = !state.isRightCollapsed;
}
```

---

## Dependency Graph

```
Phase 1 ──────────────────────────────────────────────► Ship immediately
Phase 2 ──────────────────────────────────────────────► Ship immediately
Phase 3 (3.1 → 3.2 → 3.3 → 3.4) ────────────────────► Ship as unit
Phase 4 ──────────────────────────────────────────────► Ship after Phase 3
Phase 5 ──────────────────────────────────────────────► Ship before Phase 6.2
Phase 6 (6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6) ───────► Ship sequentially, one per session
```

---

## File Change Summary

| File | Change Type | Phase |
|---|---|---|
| `TripartiteStageView.tsx` | Remove dead overlay | 1.1 |
| `uiLayoutStore.ts` | Null defaults, `isRightPanelOpen` fix, `lastCompiledPackage` | 1.2, 3.1, CCC |
| `StoryModule.jsx` | Remove orphan ScratchbookModal | 1.3 |
| `CockpitPanel.tsx` | Add/remove bastion tab | 1.4 |
| `ADEScenarioStageDrawer.tsx` | Beat persistence via localStorage | 2.1 |
| `src/types/vttPackage.ts` | **NEW** — CompiledVttPackage type | 3.1 |
| `src/utils/deployVttPackage.ts` | **NEW** — deploy function | 3.2 |
| `VttCompilerModal.jsx` | Add Deploy button | 3.3 |
| `StageView.tsx` | Auto-deploy hook, NPC tick, trap eval, event migration | 3.4, 4.1, 4.2, 4.3, 6.x |
| `src/utils/vttEventBus.ts` | **NEW** — typed event bus | 5.1 |
| `StageBreadcrumbTabs.tsx` | Migrate to VttEventBus | 5.2 |
| `src/components/VTT/hooks/useMapIngestion.ts` | **NEW** | 6.1 |
| `src/components/VTT/hooks/useCanvasEventListeners.ts` | **NEW** | 6.2 |
| `src/components/VTT/hooks/useDesignModeController.ts` | **NEW** | 6.3 |
| `src/components/VTT/hooks/useCombatController.ts` | **NEW** | 6.4 |
| `src/components/VTT/hooks/useWallRenderer.ts` | **NEW** | 6.5 |
| `src/components/VTT/stage/TokenRadialMenu.tsx` | **NEW** | 6.6 |
