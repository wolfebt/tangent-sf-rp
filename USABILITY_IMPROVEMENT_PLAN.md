# Tangent SF RP — Usability Improvement Plan

> Generated: 2026-09-25  
> Scope: All 9 issues identified in usability review  
> Status: **Ready for execution**

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [WS2 — Dialog System (Do First)](#2-ws2--dialog-system-do-first)
3. [WS1 — GlobalHUD Decomposition](#3-ws1--globalhud-decomposition)
4. [WS3 — Onboarding / First-Run](#4-ws3--onboarding--first-run)
5. [WS4 — Mobile Navigation](#5-ws4--mobile-navigation)
6. [WS5 — Quick Fixes](#6-ws5--quick-fixes)
7. [Execution Order & Checklist](#7-execution-order--checklist)
8. [Verification Plan](#8-verification-plan)

---

## 1. Overview & Architecture

### Issues Being Fixed

| ID | Severity | Issue |
|----|----------|-------|
| C1 | 🔴 Critical | No onboarding / first-run guidance for new users |
| C2 | 🔴 Critical | `GlobalHUD.jsx` is 1,356-line god component |
| C3 | 🔴 Critical | 10+ duplicate route aliases rendering same components |
| S1 | 🟡 Significant | `useEffect` join-code timing bug in `Home.jsx` |
| S2 | 🟡 Significant | ~45 `window.confirm/alert/prompt` calls throughout codebase |
| S3 | 🟡 Significant | No mobile navigation on sub-pages (side rail hidden `< 640px`) |
| M1 | 🟢 Minor | Tooltip color dot in `GuidanceRail` renders invalid CSS value |
| M2 | 🟢 Minor | Audio mute state desyncs between HUB, SideRail, HUD |
| M3 | 🟢 Minor | Mixed emoji + Lucide icons (inconsistent sizing/theming) |
| M4 | 🟢 Minor | `firebase-admin` (server SDK) in frontend dependencies |
| S5 | 🟡 Significant | `package.json` still named `vite-project`, version `0.0.0` |

### Workstream Dependency Order

```
WS2 (Dialog System)  ──┬──► WS1 (GlobalHUD Decomposition)
                        ├──► WS3 (Onboarding)
                        └──► WS4 (Mobile Navigation)
WS5 (Quick Fixes)  ────────► independent, any order
```

WS2 must land first because WS1/WS3/WS4 all emit notifications and confirmations.

### Files Created (New)

```
src/
  context/
    ConfirmContext.jsx          # async confirm() hook + ConfirmModal
    ToastContext.jsx            # global toast queue + useToast() hook
    AudioContext.jsx            # shared audio mute state
  components/
    Layout/
      MobileBottomNav.jsx       # bottom nav bar for mobile sub-pages
      hud/
        FolioHUDBar.jsx         # Folio contextual toolbar
        DBMHUDBar.jsx           # Omnicortex contextual toolbar
        CompendiumHUDBar.jsx    # Compendium contextual toolbar
        ADEHUDBar.jsx           # ADE/Foundry contextual toolbar
        CodexHUDBar.jsx         # Codex contextual toolbar
        CommsHUDBar.jsx         # Comms contextual toolbar
    Hub/
      WelcomeBriefing.jsx       # first-run onboarding banner
```

### Files Modified

```
src/
  App.jsx                       # providers, routes, mobile nav, Navigate redirects
  pages/Home.jsx                # WelcomeBriefing integration, join-code fix
  context/AuthContext.jsx       # confirmLogout → useConfirm
  utils/confirmationUtils.js    # sync → async, uses ConfirmContext
  components/
    Layout/
      GlobalHUD.jsx             # extracted to hud/ sub-components, ~250 lines
      GlobalSideRail.jsx        # uses useAudio() instead of local state
    UI/
      GuidanceRail.jsx          # tooltip dotColor fix
  pages/
    Foundry/...                 # alert() → toast(), window.confirm → useConfirm
  package.json                  # name, version, firebase-admin moved
```

---

## 2. WS2 — Dialog System (Do First)

### Problem

The audit found **~45 call sites** across the codebase using browser native dialogs:

| Type | Count | Problem |
|------|-------|---------|
| `alert(message)` | ~30 | Blocks main thread, unstyled, jarring |
| `window.confirm(...)` | ~12 | Same, plus unreliable on some mobile browsers |
| `window.prompt(...)` | ~3 | Same, plus used in destructive delete flows |

Key files with the most occurrences:
- `AIME.jsx` — 8× alert for AI errors
- `TeamsPage.jsx` — 4× alert/confirm for squad operations
- `GlobalHUD.jsx` — 3× confirm/alert
- `AuthContext.jsx` — 1× confirm for logout
- `confirmationUtils.js` — entire utility based on `window.prompt` (used everywhere)
- `MapCombatTracker.jsx`, `MapMaker.jsx`, `ArchitectAssetCockpit.jsx` — multiple each

### Solution

Three new primitives:

1. **`ToastContext`** — global toast queue for one-way informational messages (replaces all `alert()`)
2. **`ConfirmContext`** — async modal dialog for confirmations and typed-deletion prompts (replaces all `window.confirm` and `window.prompt`)
3. **`ConfirmModal`** — the themed sci-fi UI component used by `ConfirmContext`

---

### 2.1 `src/context/ToastContext.jsx` [NEW]

```jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

let _toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ type = 'info', title, text, autoDismissMs = 4000 }) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, type, title, text, autoDismissMs }]);
    if (autoDismissMs > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), autoDismissMs);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-6 right-6 z-[99998] flex flex-col gap-3 pointer-events-none">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-300 shrink-0 mt-0.5" />,
  error:   <AlertOctagon size={18} className="text-rose-300 shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={18} className="text-amber-300 shrink-0 mt-0.5" />,
  info:    <Info size={18} className="text-cyan-300 shrink-0 mt-0.5" />,
};

const STYLES = {
  success: 'bg-emerald-950/90 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
  error:   'bg-rose-950/90 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]',
  warning: 'bg-amber-950/90 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
  info:    'bg-[#0f172a]/90 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.25)]',
};

const DEFAULT_TITLES = { success: 'SUCCESS', error: 'ERROR', warning: 'WARNING', info: 'SYSTEM' };

const ToastItem = ({ toast, onDismiss }) => (
  <div
    role="status"
    aria-live="polite"
    className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl font-sans text-sm min-w-[300px] max-w-[440px] animate-in slide-in-from-bottom-2 fade-in duration-200 ${STYLES[toast.type] || STYLES.info}`}
  >
    {ICONS[toast.type] || ICONS.info}
    <div className="flex-1 flex flex-col gap-0.5">
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/90">
        {toast.title || DEFAULT_TITLES[toast.type]}
      </span>
      <span className="text-xs text-white/80 leading-relaxed">{toast.text}</span>
    </div>
    <button
      type="button"
      onClick={onDismiss}
      className="text-white/40 hover:text-white/80 transition-colors mt-0.5 shrink-0"
      aria-label="Dismiss"
    >
      <X size={15} />
    </button>
  </div>
);
```

**Usage pattern:**
```js
const { toast } = useToast();
toast({ type: 'error', text: err.message });
toast({ type: 'success', title: 'SAVED', text: 'Dossier synced to cloud.' });
toast({ type: 'warning', text: 'No tokens in blast radius.' });
```

---

### 2.2 `src/context/ConfirmContext.jsx` [NEW]

```jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx.confirm;
};

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ isOpen: false, config: {} });
  const resolveRef = useRef(null);
  const [typed, setTyped] = useState('');

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setTyped('');
      setState({ isOpen: true, config });
    });
  }, []);

  const handleConfirm = () => {
    setState(s => ({ ...s, isOpen: false }));
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setState(s => ({ ...s, isOpen: false }));
    resolveRef.current?.(false);
  };

  const { config } = state;
  const canConfirm = config.requireTyped
    ? typed.trim().toLowerCase() === (config.typedTarget || '').toLowerCase()
    : true;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <div
            className="bg-[#0c1018] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(34,211,238,0.12)] font-sans"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              {config.danger
                ? <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                : <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              }
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-100">
                  {config.title || 'Confirm Action'}
                </h2>
                {config.message && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{config.message}</p>
                )}
              </div>
            </div>

            {/* Typed confirmation input */}
            {config.requireTyped && (
              <div className="mb-4">
                <p className="text-[11px] font-mono text-amber-400 mb-2 uppercase tracking-wider">
                  Type <span className="text-amber-300 font-bold">"{config.typedTarget}"</span> to confirm:
                </p>
                <input
                  autoFocus
                  type="text"
                  value={typed}
                  onChange={e => setTyped(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canConfirm && handleConfirm()}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-lg text-sm font-mono text-slate-100 outline-none transition-colors"
                  placeholder={config.typedTarget}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <X size={13} />
                {config.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  config.danger
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                }`}
              >
                {config.danger ? <Trash2 size={13} /> : <Check size={13} />}
                {config.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
```

**Usage pattern:**
```js
const confirm = useConfirm();

// Simple confirm
const ok = await confirm({
  title: 'Clear Cache',
  message: 'This will reload the page.',
  confirmLabel: 'Clear',
});
if (ok) { localStorage.removeItem('tangent_dbm_cache'); window.location.reload(); }

// Dangerous confirm
const ok = await confirm({
  title: 'Disband Squad',
  message: `"${activeGroup.name}" will be permanently deleted.`,
  danger: true,
  confirmLabel: 'Disband',
});

// Typed deletion
const ok = await confirm({
  title: `Delete "${itemName}"`,
  message: 'Type the name below to permanently delete this entry.',
  requireTyped: true,
  typedTarget: itemName,
  danger: true,
  confirmLabel: 'Delete',
});
```

---

### 2.3 Updated `src/utils/confirmationUtils.js` [MODIFY]

```js
/**
 * Async typed-deletion confirmation using ConfirmContext.
 * Replaces the synchronous window.prompt-based version.
 *
 * @param {Function} confirmFn  - The confirm() function from useConfirm()
 * @param {string}   itemName   - Name of item being deleted (used for typed match)
 * @param {string}   itemType   - Human label e.g. 'entry', 'operative', 'article'
 * @returns {Promise<boolean>}
 */
export const confirmTypedDeletion = async (confirmFn, itemName, itemType = 'entry') => {
  return confirmFn({
    title: `Delete ${itemType}`,
    message: itemName
      ? `This action cannot be undone.`
      : `Are you sure you want to delete this ${itemType}? This cannot be undone.`,
    requireTyped: !!itemName?.trim(),
    typedTarget: itemName?.trim() || '',
    danger: true,
    confirmLabel: 'Delete',
  });
};
```

All callers currently do:
```js
// OLD (sync, blocking)
if (confirmTypedDeletion(name, 'skill')) { deleteIt(); }
```
Must be updated to:
```js
// NEW (async, non-blocking)
const confirm = useConfirm();
const ok = await confirmTypedDeletion(confirm, name, 'skill');
if (ok) { deleteIt(); }
```

### 2.4 `src/App.jsx` — Add Providers [MODIFY]

```diff
 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
+import { ToastProvider } from './context/ToastContext';
+import { ConfirmProvider } from './context/ConfirmContext';
+import { AudioProvider } from './context/AudioContext';

 export function App() {
   return (
     <Router>
-      <CampaignProvider>
+      <ToastProvider>
+      <ConfirmProvider>
+      <AudioProvider>
+        <CampaignProvider>
           ...
+        </CampaignProvider>
+      </AudioProvider>
+      </ConfirmProvider>
+      </ToastProvider>
     </Router>
   );
 }
```

### 2.5 Dialog Call-Site Replacements [MODIFY ~20 files]

#### Strategy A — `alert(message)` → `toast()`
All `alert()` calls that display informational or error messages:

```js
// BEFORE
alert(`Concept generation failed: ${err.message}`);

// AFTER
const { toast } = useToast();
toast({ type: 'error', text: err.message });
```

```js
// BEFORE
alert('Squad settings updated successfully.');

// AFTER
toast({ type: 'success', text: 'Squad settings updated.' });
```

#### Strategy B — `window.confirm(...)` → `await confirm()`
All synchronous confirmation dialogs:

```js
// BEFORE (GlobalHUD.jsx)
if (window.confirm('Are you sure you want to clear your local Omnicortex temporary cache...?')) {
  localStorage.removeItem('tangent_dbm_cache');
  window.location.reload();
}

// AFTER
const ok = await confirm({
  title: 'Clear Omnicortex Cache',
  message: 'This will clear local search filters and reload the page.',
  confirmLabel: 'Clear Cache',
});
if (ok) { localStorage.removeItem('tangent_dbm_cache'); window.location.reload(); }
```

```js
// BEFORE (AuthContext.jsx — confirmLogout)
const confirmed = window.confirm('Are you sure you want to log out?');
if (confirmed) { await logout(); navigate('/'); }

// AFTER
const ok = await confirm({
  title: 'Log Out',
  message: 'You will be returned to the login screen.',
  confirmLabel: 'Log Out',
});
if (ok) { await logout(); navigate('/'); }
```

#### Strategy C — VTT Override `prompt()` → `ConfirmModal` with text input
The player override prompt in `GlobalHUD.jsx` is a special case (needs text input):

```js
// BEFORE
const reason = prompt("Enter player reason/note for this sheet modification...");
if (reason !== null && unlockPersona) { unlockPersona(reason); }

// AFTER — ConfirmContext supports an optional `inputLabel` field
const result = await confirm({
  title: 'Player Override Request',
  message: 'This will be logged for GM review.',
  inputLabel: 'Reason (optional)',
  confirmLabel: 'Request Override',
});
if (result.confirmed) { unlockPersona(result.inputValue || ''); }
```

> Add `inputLabel` + `inputValue` to `ConfirmContext` config shape to support this.

#### Full File List for Dialog Replacement

| File | alert | confirm | prompt | Strategy |
|------|-------|---------|--------|----------|
| `AIME.jsx` | 8 | — | — | A |
| `AIMEChatBox.jsx` | — | 1 | — | B |
| `AuthContext.jsx` | — | 1 | — | B |
| `GlobalHUD.jsx` | 1 | 2 | 1 | A+B+C |
| `ArchitectAssetCockpit.jsx` | — | 2 | — | B |
| `AssetDrawingStudio.jsx` | — | 1 | — | B |
| `EditElementModal.jsx` | 2 | — | — | A |
| `ElementForge.jsx` | 2 | — | — | A |
| `AoEResolutionModal.jsx` | 1 | — | — | A |
| `FolioHeroTokenDrawer.jsx` | 2 | — | — | A |
| `HazmatVolumeManagerModal.jsx` | 1 | — | — | A |
| `MapAssetManagerModal.jsx` | 3 | — | — | A |
| `MapCombatTracker.jsx` | 4 | — | — | A |
| `MapMaker.jsx` | 3 | — | — | A |
| `ReactionPromptModal.jsx` | 1 | — | — | A |
| `ScenarioPane.jsx` | 2 | — | — | A |
| `StoryElementExtractorModal.jsx` | 1 | — | — | A |
| `TeamsPage.jsx` | 3 | 3 | — | A+B |
| `GuidanceGemsModal.jsx` | — | 1 | — | B |
| `exportUtils.js` | 1 | 1 | — | A+B |
| `confirmationUtils.js` | 1 | 1 | 1 | Rewrite (§2.3) |

---

## 3. WS1 — GlobalHUD Decomposition

### Problem

[`GlobalHUD.jsx`](src/components/Layout/GlobalHUD.jsx) is **1,356 lines / 70KB**. It handles:
- Route detection (`isFolio`, `isDBM`, `isCompendium`, `isFoundry`, `isCodex`, `isComms`)
- 8 context subscriptions (`useAuth`, `useChat`, `useDBM`, `useFolio`, etc.)
- 7 dropdown menus with inline state
- All center-bar contextual controls for every module
- Mobile navigation drawer (full nav for all routes)
- User account + cloud sync status
- Guide modal, settings modal, team modal
- Audio management
- Click-outside handlers for 4 separate menus

### Solution

Extract contextual center controls into a `hud/` subfolder. `GlobalHUD.jsx` becomes a **~250-line shell** that:
1. Detects the current route
2. Renders the correct HUD bar sub-component in the center slot
3. Keeps the header frame, right-side account, and mobile drawer

```
src/components/Layout/
  GlobalHUD.jsx              ← shell, ~250 lines
  hud/
    FolioHUDBar.jsx           ← ~280 lines
    DBMHUDBar.jsx             ← ~200 lines
    CompendiumHUDBar.jsx      ← ~80 lines
    ADEHUDBar.jsx             ← ~80 lines
    CodexHUDBar.jsx           ← ~50 lines
    CommsHUDBar.jsx           ← ~80 lines
    HubIdleIndicator.jsx      ← ~20 lines
```

### 3.1 Each HUD Bar Component

#### `hud/FolioHUDBar.jsx` [NEW]
Extracts lines 244–554 of GlobalHUD.jsx.

Receives props:
```js
// From GlobalHUD which still holds the context subscriptions
<FolioHUDBar
  isCharacterSelected={isCharacterSelected}
  characterData={characterData}
  computeSpentCP={computeSpentCP}
  cloudSaveStatus={cloudSaveStatus}
  lastSavedTime={lastSavedTime}
  isLocked={isLocked}
  isPlayerOverride={isPlayerOverride}
  allowPlayerOverride={allowPlayerOverride}
  isInActiveGame={isInActiveGame}
  lockPersona={lockPersona}
  unlockPersona={unlockPersona}
  clonePersonaVariant={clonePersonaVariant}
  handleSaveLocal={handleSaveLocal}
  handleExportAsStoryElement={handleExportAsStoryElement}
  onOpenGuide={handleOpenGuide}
/>
```

Internally manages `isFolioMenuOpen` state (moved from GlobalHUD).

#### `hud/DBMHUDBar.jsx` [NEW]
Extracts lines 556–801 of GlobalHUD.jsx.

Props include `history`, `historyIndex`, `handleBack`, `handleForward`, `isSidebarOpen`, `setIsSidebarOpen`, `isBastionOpen`, `setIsBastionOpen`, `activeCategory`, `isAdmin`, `adminOverride`, `toggleAdminOverride`, `syncMasterSpeciesMatrix`, `syncCanonicalCompendium`, `handleExportMasterJSON`, `handleImportMasterJSON`, `onOpenGuide`.

Internally manages `isDbmMenuOpen` state.  
Uses `useConfirm` + `useToast` for cache-clear action (replaces `window.confirm`).

#### `hud/CompendiumHUDBar.jsx` [NEW]
Extracts lines 804–880.

Props: `isAdmin`, `syncCanonicalCompendium`.  
Uses `useNavigate` internally.

#### `hud/ADEHUDBar.jsx` [NEW]
Extracts lines 882–911.

Props: `isStage`.  
Uses `useNavigate`, `useLocation` internally.

#### `hud/CodexHUDBar.jsx` [NEW]
Extracts lines 913–931.

No props needed — uses `useNavigate` internally.

#### `hud/CommsHUDBar.jsx` [NEW]
Extracts lines 934–984.

Props: `onToggleCommsDock`, `onToggleDiceDock`.  
Manages `isCommsMenuOpen` + team modal open state (moved from GlobalHUD).

### 3.2 Updated `GlobalHUD.jsx` [MODIFY]

Center section becomes clean:

```jsx
{/* Center Section: Dynamic Contextual Controls */}
<div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 min-w-0 px-2 overflow-visible relative">
  {isFolio      && <FolioHUDBar {...folioProps} onOpenGuide={handleOpenGuide} />}
  {isDBM        && <DBMHUDBar {...dbmProps} onOpenGuide={handleOpenGuide} />}
  {isCompendium && <CompendiumHUDBar isAdmin={isAdmin} syncCanonicalCompendium={syncCanonicalCompendium} />}
  {isFoundry    && <ADEHUDBar isStage={isStage} />}
  {isCodex      && <CodexHUDBar />}
  {isComms      && <CommsHUDBar onToggleCommsDock={onToggleCommsDock} onToggleDiceDock={onToggleDiceDock} />}
  {/* Idle: no specific module active */}
  {!isFolio && !isDBM && !isCompendium && !isFoundry && !isCodex && !isComms && (
    <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-xs">
      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      <span>OPERATIONS HUB</span>
    </div>
  )}
</div>
```

### 3.3 Emoji → Lucide Replacements [MODIFY during WS1]

During extraction, replace all emoji in the HUD bars with Lucide icons:

| Emoji | Replace With | Import |
|-------|-------------|--------|
| 🤖 | `Bot` | `lucide-react` |
| 👑 | `Crown` | `lucide-react` |
| 🧬 | `Dna` | `lucide-react` |
| 📚 | `Library` | `lucide-react` |
| 💾 | `HardDrive` | `lucide-react` |
| 📂 | `FolderOpen` | `lucide-react` |
| 🌐 | `Globe` | `lucide-react` |
| ⚔️ | `Swords` | `lucide-react` |
| ☁️ | `Cloud` | `lucide-react` |
| 🧹 | `Trash2` | `lucide-react` |
| 📖 | `BookOpen` | already imported |
| ⚙️ | `Settings` | already imported |

---

## 4. WS3 — Onboarding / First-Run

### Problem

New/unauthenticated users land on the HUB with an opaque idle screen. There is no explanation of what the app is or how to get started.

### Trigger Strategy

Show the welcome briefing **in the HUB idle area** when:
- `activeDrawer === null`
- `localStorage.getItem('tangent_welcome_dismissed')` is falsy

Dismissed permanently by clicking "ENTER SYSTEM". No Firebase required.

### 4.1 `src/components/Hub/WelcomeBriefing.jsx` [NEW]

```jsx
const MODULES = [
  {
    id: 'folio',
    label: 'PERSONA FOLIO',
    desc: 'Build operatives: attributes, skills, augmentations, gear.',
    color: 'cyan',
    path: '/folio',
    icon: Users,
  },
  {
    id: 'rules',
    label: 'COMPENDIUM',
    desc: 'Game rules, lore articles, and mechanical reference.',
    color: 'sky',
    path: '/compendium',
    icon: BookOpen,
  },
  {
    id: 'cortex',
    label: 'OMNICORTEX',
    desc: 'Master database: species, gear, NPCs, factions, locations.',
    color: 'amber',
    path: '/dbm',
    icon: Database,
  },
  {
    id: 'ade',
    label: 'ADE STUDIO',
    desc: 'Build scenarios, story modules, and custom elements.',
    color: 'purple',
    path: '/foundry',
    icon: Layers,
  },
  {
    id: 'vtt',
    label: 'THE STAGE VTT',
    desc: 'Tactical maps, token management, and live combat.',
    color: 'amber',
    path: '/stage',
    icon: MapPin,
  },
  {
    id: 'comms',
    label: 'COMMLINK',
    desc: 'Team channels, voice relay, and session coordination.',
    color: 'emerald',
    path: '/comms',
    icon: Radio,
  },
];

export const WelcomeBriefing = ({ onDismiss, onNavigate }) => (
  <div className="flex-1 flex flex-col items-center justify-start pt-8 sm:pt-12 p-4 sm:p-8 animate-in fade-in duration-500 overflow-y-auto">
    {/* Header */}
    <div className="text-center mb-6 space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        WELCOME BRIEFING
      </div>
      <h1 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-widest text-cyan-300 shifting-wb-text-shadow">
        TANGENT SCIENCE FANTASY RPG
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
        A full-stack tabletop roleplaying engine. Select a module below to get started,
        or use the guidance rail on the left to navigate.
      </p>
    </div>

    {/* Module Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-2xl mb-6">
      {MODULES.map(mod => {
        const Icon = mod.icon;
        const colorMap = {
          cyan:    'border-cyan-500/30 hover:border-cyan-400 text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10',
          sky:     'border-sky-500/30 hover:border-sky-400 text-sky-300 bg-sky-500/5 hover:bg-sky-500/10',
          amber:   'border-amber-500/30 hover:border-amber-400 text-amber-300 bg-amber-500/5 hover:bg-amber-500/10',
          purple:  'border-purple-500/30 hover:border-purple-400 text-purple-300 bg-purple-500/5 hover:bg-purple-500/10',
          emerald: 'border-emerald-500/30 hover:border-emerald-400 text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10',
        };
        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onNavigate(mod.path)}
            className={`p-3 sm:p-4 rounded-xl border transition-all text-left group ${colorMap[mod.color]}`}
          >
            <Icon size={18} className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-1">
              {mod.label}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">
              {mod.desc}
            </div>
          </button>
        );
      })}
    </div>

    {/* Dismiss */}
    <button
      type="button"
      onClick={onDismiss}
      className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
    >
      ENTER SYSTEM
    </button>
  </div>
);
```

### 4.2 `src/pages/Home.jsx` [MODIFY]

```diff
+ import { WelcomeBriefing } from '../components/Hub/WelcomeBriefing';

  // Inside center drawer area, idle state branch:
- {/* Idle state — guidance prompt */}
- <div className="flex-1 flex flex-col items-center justify-start pt-12 ...">
-   ...
- </div>
+ {!localStorage.getItem('tangent_welcome_dismissed') ? (
+   <WelcomeBriefing
+     onDismiss={() => {
+       localStorage.setItem('tangent_welcome_dismissed', '1');
+       // Force re-render:
+       setWelcomeDismissed(true);
+     }}
+     onNavigate={(path) => navigate(path)}
+   />
+ ) : (
+   <div className="flex-1 flex flex-col items-center justify-start pt-12 ...">
+     {/* existing idle prompt */}
+   </div>
+ )}
```

Add state: `const [welcomeDismissed, setWelcomeDismissed] = useState(() => !!localStorage.getItem('tangent_welcome_dismissed'));`

---

## 5. WS4 — Mobile Navigation

### Problem

`GlobalSideRail` is `hidden sm:flex` — on screens narrower than 640px (all phones), it simply disappears. Sub-pages like `/folio`, `/dbm`, `/compendium`, `/foundry`, `/comms`, `/teams` render with no navigation at all. The only escape is the browser back button.

The HUB has its own mobile slide-out drawer, but it only works on the home page.

### Solution

A **fixed bottom navigation bar** for `< sm` (< 640px) screens, always present on all sub-pages.

### 5.1 `src/components/Layout/MobileBottomNav.jsx` [NEW]

```jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Users, BookOpen, Database, Layers, MapPin, Radio } from 'lucide-react';
import { useFolio } from '../../context/FolioContext';
import { useDBM } from '../../context/DBMContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';

const NAV_ITEMS = [
  { id: 'hub',   icon: Compass,  label: 'HUB',   path: '/',          color: 'cyan'    },
  { id: 'folio', icon: Users,    label: 'FOLIO',  path: '/folio',     color: 'cyan'    },
  { id: 'rules', icon: BookOpen, label: 'RULES',  path: '/compendium',color: 'sky'     },
  { id: 'cortex',icon: Database, label: 'CORTEX', path: '/dbm',       color: 'amber'   },
  { id: 'ade',   icon: Layers,   label: 'ADE',    path: '/foundry',   color: 'purple'  },
  { id: 'vtt',   icon: MapPin,   label: 'VTT',    path: '/stage',     color: 'amber'   },
  { id: 'comms', icon: Radio,    label: 'COMMS',  path: '/comms',     color: 'emerald' },
];

const COLOR_ACTIVE = {
  cyan:    'text-cyan-300 bg-cyan-500/20 border-cyan-400/60',
  sky:     'text-sky-300 bg-sky-500/20 border-sky-400/60',
  amber:   'text-amber-300 bg-amber-500/20 border-amber-400/60',
  purple:  'text-purple-300 bg-purple-500/20 border-purple-400/60',
  emerald: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/60',
};

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on spectator / projector routes
  if (
    location.pathname.includes('/spectator') ||
    location.pathname.startsWith('/foundry/view/')
  ) return null;

  // Badge data (lightweight, same as GuidanceRail)
  const { personaRoster = [] } = useFolio() || {};
  const { totalUnreadCount = 0 } = useChat() || {};
  const { pendingInvites = [] } = useGroup() || {};

  const getActiveId = () => {
    const p = location.pathname;
    if (p === '/' || p === '/dashboard') return 'hub';
    if (p.startsWith('/folio') || p.startsWith('/roster')) return 'folio';
    if (p.startsWith('/compendium')) return 'rules';
    if (p.startsWith('/dbm') || p.startsWith('/codex')) return 'cortex';
    if (p.startsWith('/foundry') || p.startsWith('/ade')) return 'ade';
    if (p.startsWith('/stage') || p === '/vtt' || p.startsWith('/vtt-ops')) return 'vtt';
    if (p.startsWith('/comms') || p.startsWith('/chat')) return 'comms';
    return null;
  };

  const activeId = getActiveId();

  const getBadge = (id) => {
    if (id === 'folio')  return personaRoster.length > 0 ? personaRoster.length : null;
    if (id === 'comms')  return totalUnreadCount > 0 ? totalUnreadCount : null;
    if (id === 'hub')    return pendingInvites.length > 0 ? pendingInvites.length : null;
    return null;
  };

  return (
    // Only visible on < sm screens (hidden sm:hidden means always hidden on desktop)
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-[90] bg-[#070a12]/97 backdrop-blur-md border-t border-slate-800/90 flex items-center justify-around px-1 py-1 safe-area-bottom select-none"
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeId === item.id;
        const badge = getBadge(item.id);
        const Icon = item.icon;
        const activeStyle = COLOR_ACTIVE[item.color];

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              navigate(item.path);
            }}
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl border transition-all flex-1 mx-0.5 ${
              isActive
                ? `${activeStyle} shadow-sm`
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {/* Active top indicator bar */}
            {isActive && (
              <span className="absolute -top-px left-3 right-3 h-0.5 rounded-b-full bg-current opacity-80" />
            )}

            {/* Icon + Badge */}
            <div className="relative">
              <Icon size={16} />
              {badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-cyan-500 text-black text-[8px] font-bold font-mono flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider leading-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
```

### 5.2 `src/App.jsx` — Mount MobileBottomNav [MODIFY]

```diff
+import { MobileBottomNav } from './components/Layout/MobileBottomNav';

 {/* Global Live Team Voice Comms Bar */}
 <VoiceCommsBar />

+{/* Mobile Bottom Navigation (< sm screens only) */}
+<MobileBottomNav />

 {/* Persistent Overlay Docks */}
 <DiceRollerDock />
```

### 5.3 Account for Bottom Nav Height on Mobile

Sub-pages that have `h-full` or `overflow-hidden` content areas need padding at the bottom to avoid content being hidden behind the 56px nav bar.

Add `pb-14 sm:pb-0` (or `mb-14 sm:mb-0`) to the main content wrapper on mobile. Since the nav is `sm:hidden`, this padding only applies on mobile.

In `App.jsx` main content area:
```diff
- <main className="flex-1 min-w-0 h-full overflow-hidden relative">
+ <main className="flex-1 min-w-0 h-full overflow-hidden relative pb-14 sm:pb-0">
```

---

## 6. WS5 — Quick Fixes

### 6.1 Route Alias Consolidation — `src/App.jsx` [MODIFY]

Import `Navigate`:
```diff
-import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
+import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
```

Replace duplicate route entries:
```diff
-<Route path="/dashboard"     element={<Dashboard />} />
+<Route path="/dashboard"     element={<Navigate to="/" replace />} />
-<Route path="/chat"          element={<CommsPage />} />
+<Route path="/chat"          element={<Navigate to="/comms" replace />} />
-<Route path="/groups"        element={<TeamsPage />} />
+<Route path="/groups"        element={<Navigate to="/teams" replace />} />
-<Route path="/squads"        element={<TeamsPage />} />
+<Route path="/squads"        element={<Navigate to="/teams" replace />} />
-<Route path="/roster"        element={<Folio />} />
+<Route path="/roster"        element={<Navigate to="/folio" replace />} />
-<Route path="/ade"           element={<FoundryApp />} />
+<Route path="/ade"           element={<Navigate to="/foundry" replace />} />
-<Route path="/ade/*"         element={<FoundryApp />} />
+<Route path="/ade/*"         element={<Navigate to="/foundry" replace />} />
-<Route path="/ade-studio"    element={<FoundryApp />} />
+<Route path="/ade-studio"    element={<Navigate to="/foundry" replace />} />
-<Route path="/ade-studio/*"  element={<FoundryApp />} />
+<Route path="/ade-studio/*"  element={<Navigate to="/foundry" replace />} />
-<Route path="/story-foundry" element={<FoundryApp />} />
+<Route path="/story-foundry" element={<Navigate to="/foundry" replace />} />
-<Route path="/campaign-builder" element={<FoundryApp />} />
+<Route path="/campaign-builder" element={<Navigate to="/foundry" replace />} />
```

> **NOTE:** `/vtt` is **kept** — it intentionally passes `defaultRole="operative"` to `StageView`, which is functionally different from `/stage` (`defaultRole="architect"`). This is not a true alias.

Also update `GlobalSideRail.getActiveId()` and `GlobalHUD.getRouteGuideTab()` to remove alias branches that are now handled by redirects.

---

### 6.2 Tooltip Color Dot Fix — `GuidanceRail.jsx` [MODIFY]

```diff
 const THEMES = {
   cyan: {
+    dotColor: '#22d3ee',
     iconBox: 'bg-cyan-500/10 border-cyan-500/30 ...',
   },
   blue: {
+    dotColor: '#3b82f6',
     ...
   },
   amber: {
+    dotColor: '#f59e0b',
     ...
   },
   purple: {
+    dotColor: '#a855f7',
     ...
   },
   emerald: {
+    dotColor: '#10b981',
     ...
   },
 };
```

```diff
-<span className="w-1.5 h-1.5 rounded-full inline-block"
-  style={{ backgroundColor: hoveredItem.theme.bar.split(' ')[0].replace('bg-', '') }} />
+<span className="w-1.5 h-1.5 rounded-full inline-block"
+  style={{ backgroundColor: hoveredItem.theme.dotColor }} />
```

---

### 6.3 Audio Mute State Sync — `src/context/AudioContext.jsx` [NEW]

```jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AudioService } from '../services/audioService';

const AudioContext = createContext(null);

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>');
  return ctx;
};

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => AudioService.muted);

  const toggleMute = useCallback(() => {
    const next = AudioService.toggleMute();
    setIsMuted(next);
    if (!next) AudioService.playTerminalBeep(1100, 0.04);
  }, []);

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
};
```

**Update all components** that currently have:
```js
const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);
const toggleAudio = () => { const next = AudioService.toggleMute(); setIsAudioMuted(next); ... };
```

Replace with:
```js
const { isMuted: isAudioMuted, toggleMute: toggleAudio } = useAudio();
```

Files to update:
- `src/components/Layout/GlobalSideRail.jsx`
- `src/components/Layout/GlobalHUD.jsx`
- `src/pages/Home.jsx`

---

### 6.4 `package.json` [MODIFY]

```diff
-  "name": "vite-project",
+  "name": "tangent-sfr",
-  "version": "0.0.0",
+  "version": "1.0.0",
```

Move `firebase-admin` from `dependencies` to `devDependencies` (it's only used by scripts):
```diff
   "dependencies": {
-    "firebase-admin": "^14.2.0",
   "devDependencies": {
+    "firebase-admin": "^14.2.0",
```

First verify it's not imported in any browser source file:
```powershell
Get-ChildItem src -Recurse -Include *.jsx,*.tsx,*.js | Select-String "firebase-admin"
# Should return nothing. If it does, address those imports first.
```

---

### 6.5 `useEffect` Join-Code Fix — `src/pages/Home.jsx` [MODIFY]

```diff
+import { useRef } from 'react';

 const Home = () => {
+  const joinCodeHandled = useRef(false);
   ...

   useEffect(() => {
+    if (joinCodeHandled.current) return;
     const params = new URLSearchParams(window.location.search);
     const joinCode = params.get('join');
     if (joinCode) {
+      joinCodeHandled.current = true;
       setActiveDrawer('game-groups');
     }
   }, []);
```

---

## 7. Execution Order & Checklist

Execute in this order to maintain a working app at every step:

### Phase 1 — Foundation (WS2)
- [ ] Create `src/context/ToastContext.jsx`
- [ ] Create `src/context/ConfirmContext.jsx`
- [ ] Add both providers to `src/App.jsx`
- [ ] Rewrite `src/utils/confirmationUtils.js` (async)
- [ ] Replace all `alert()` calls with `toast()` (~25 files, Strategy A)
- [ ] Replace all `window.confirm()` calls with `await confirm()` (~12 sites, Strategy B)
- [ ] Replace VTT override `window.prompt()` with `ConfirmModal` + input (Strategy C)
- [ ] Update all callers of `confirmTypedDeletion()` to async pattern
- [ ] **Test:** Trigger each replaced interaction. Confirm no native dialogs appear.

### Phase 2 — HUD Decomposition (WS1)
- [ ] Create `src/components/Layout/hud/` directory
- [ ] Extract `FolioHUDBar.jsx` (lines 244–554)
- [ ] Extract `DBMHUDBar.jsx` (lines 556–801)
- [ ] Extract `CompendiumHUDBar.jsx` (lines 804–880)
- [ ] Extract `ADEHUDBar.jsx` (lines 882–911)
- [ ] Extract `CodexHUDBar.jsx` (lines 913–931)
- [ ] Extract `CommsHUDBar.jsx` (lines 934–984)
- [ ] Replace emoji with Lucide icons in all extracted components
- [ ] Update `GlobalHUD.jsx` to use sub-components (~250 lines)
- [ ] **Test:** Navigate to `/folio`, `/dbm`, `/compendium`, `/foundry`, `/codex`, `/comms`. Confirm each bar appears and all actions work.

### Phase 3 — Onboarding (WS3)
- [ ] Create `src/components/Hub/WelcomeBriefing.jsx`
- [ ] Integrate into `src/pages/Home.jsx` idle state
- [ ] Add `welcomeDismissed` state
- [ ] **Test:** Clear localStorage, load app as guest. Confirm briefing appears. Click modules. Dismiss. Confirm it stays dismissed.

### Phase 4 — Mobile Navigation (WS4)
- [ ] Create `src/components/Layout/MobileBottomNav.jsx`
- [ ] Mount in `src/App.jsx`
- [ ] Add `pb-14 sm:pb-0` to `main` content area
- [ ] **Test:** At 390px wide, navigate to `/folio`, `/dbm`, `/compendium`. Confirm bottom nav shows. Confirm active highlighting. Confirm badges appear. Confirm it hides on spectator routes.

### Phase 5 — Quick Fixes (WS5)
- [ ] Add `Navigate` to `src/App.jsx`, convert all duplicate routes
- [ ] Fix `GlobalSideRail.getActiveId()` and `GlobalHUD.getRouteGuideTab()` to use canonical paths
- [ ] Fix `GuidanceRail.jsx` tooltip dot
- [ ] Create `src/context/AudioContext.jsx`
- [ ] Add `<AudioProvider>` to `src/App.jsx`
- [ ] Update `GlobalSideRail`, `GlobalHUD`, `Home` to use `useAudio()`
- [ ] Fix join-code `useEffect` in `Home.jsx`
- [ ] Update `package.json` name/version
- [ ] Verify `firebase-admin` not imported in browser code, move to devDependencies
- [ ] **Test:** Verify all nav aliases redirect correctly. Mute from side rail, confirm all mute indicators sync. Hover GuidanceRail items, check tooltip color dots. Run `npm run build` to confirm TypeScript and bundle pass.

---

## 8. Verification Plan

### Build & Type Check
```bash
npm run build         # TypeScript compile + Vite bundle — must pass with 0 errors
```

### Engine Tests
```bash
npm run test:engine   # Game mechanics integrity — must all pass unchanged
npm run test:data     # Data bundle validation — must all pass unchanged
```

### Manual Test Matrix

| Feature | Test | Expected |
|---------|------|----------|
| Toast (error) | Trigger AI generation error in AIME | Themed error toast appears bottom-right, auto-dismisses |
| Toast (success) | Save squad settings in TeamsPage | Themed success toast appears |
| ConfirmModal (simple) | Click "Clear Cache" in Omnicortex tools | Sci-fi confirm modal appears, no browser dialog |
| ConfirmModal (danger) | Disband a squad in TeamsPage | Red danger modal, must click "Disband" |
| ConfirmModal (typed) | Delete a database entry | Modal with typed-name input, confirm disabled until correct |
| ConfirmModal (logout) | Click logout button | Confirm modal instead of browser alert |
| ConfirmModal (override) | Player override VTT unlock | Modal with optional text input for reason |
| HUD — Folio | Navigate to `/folio` | CP budget bar, Operative Catalog, BASTION, File Menu all present |
| HUD — DBM | Navigate to `/dbm` | Undo/redo, category pill, admin toggle, Tools dropdown all present |
| HUD — Compendium | Navigate to `/compendium` | Tab switcher (Rules/Omnicortex/Split), Guide button present |
| HUD — ADE | Navigate to `/foundry` | Stage VTT + Story Foundry buttons present |
| HUD — Codex | Navigate to `/codex` | RULES CODEX label, Omnicortex DB button present |
| HUD — Comms | Navigate to `/comms` | Teams, Comms Tray, Dice Tray buttons present |
| Onboarding | Clear localStorage → visit `/` | WelcomeBriefing shows. Click FOLIO card → navigates to /folio |
| Onboarding dismiss | Click "ENTER SYSTEM" → refresh | Briefing no longer shows |
| Mobile nav | Resize to 390px → visit `/dbm` | Bottom nav bar visible with 7 items |
| Mobile nav active | While on `/dbm` | CORTEX item highlighted |
| Mobile nav badge | Send an unread message | COMMS badge count shows |
| Mobile nav hidden | Navigate to `/spectator/:id` | Bottom nav not rendered |
| Route redirect | Navigate to `/roster` | Redirected to `/folio` |
| Route redirect | Navigate to `/groups` | Redirected to `/teams` |
| Route redirect | Navigate to `/story-foundry` | Redirected to `/foundry` |
| Audio sync | Mute from GlobalSideRail | HUB page mute button reflects muted state |
| Audio sync | Unmute from HUB page | SideRail audio icon updates |
| Tooltip dot | Hover FOLIO in GuidanceRail | Tooltip shows cyan dot (correct color) |
| Tooltip dot | Hover CORTEX | Tooltip shows amber dot |

---

*End of Plan — Tangent SF RP Usability Improvements*
