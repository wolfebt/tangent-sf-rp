# TANGENT SF RP — Comprehensive Project Review
**Date:** August 11, 2026 · **Reviewer:** Antigravity Deep Audit · **Codebase:** React 2.0 + Firebase

---

## Executive Summary

The Tangent Science Fantasy Roleplay platform is an ambitious, well-structured web application comprising three major modules (**Omnicortex/DBM**, **Story Foundry**, **Persona Folio**) plus two AI agents (**BASTION** and **AIME**). The codebase demonstrates strong domain knowledge and a cohesive sci-fi aesthetic. This review identifies **47 prioritized findings** across four phases, organized from critical to refinement.

---

## Phase 1: Fields and Workflows

> *Audit of database schemas, form fields, data validation, and workflow lifecycle.*

---

### 🔴 HIGH PRIORITY

#### 1.1 — Firestore Security Rules: Overly Permissive Catch-All
**File:** [firestore.rules](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/firestore.rules#L52-L62)

The wildcard rule at line 52 (`match /{collection}/{document=**}`) grants **public read to ALL Firestore collections** (`allow read: if true`). While intentional for DBM reference data, this catch-all also exposes any unprotected collection (e.g. `story_elements`, `story_maps`, `users`) that isn't caught by a more specific rule above it.

> [!CAUTION]
> Collections `story_elements` and `story_maps` (written by CampaignContext) have **no dedicated rule** — they fall through to the catch-all, meaning **any unauthenticated user can read all story elements and maps**, and anyone with `admin`/`GM` claims can overwrite them.

**Recommendation:**
- Add explicit rules for `story_elements/{docId}` and `story_maps/{docId}` with owner-scoped write and authenticated read.
- Consider restructuring to `users/{userId}/story_elements/{docId}` for proper ownership isolation.
- Add a final deny-all catch block to prevent new collections from being accidentally exposed.

---

#### 1.2 — Admin Override Bypass in AuthContext
**File:** [AuthContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/AuthContext.jsx#L91)

```javascript
const isAdmin = hasAdminClaim || adminOverride;
```

The `adminOverride` flag is stored in `localStorage` (line 16) and can be toggled by **any authenticated user** via the settings UI. This means any logged-in user can grant themselves admin-level UI access by setting `omnicortex_admin_override` in localStorage. While Firestore rules still enforce write claims server-side, the client UI will display admin controls (edit, delete) creating a confusing mismatch and potential for error-inducing clicks.

**Recommendation:**
- Remove `adminOverride` from public AuthContext, or gate it behind an actual admin claim check (e.g., only allow override if `hasAdminClaim` is already true — useful for temporarily reverting to a contributor view for testing).

---

#### 1.3 — DBMContext: Stale Closure in `saveEntry` and `deleteEntry`
**File:** [DBMContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/DBMContext.jsx#L61-L84)

Both `saveEntry` and `deleteEntry` include `dbData` in their `useCallback` dependency array and capture `{ ...dbData }` as a rollback snapshot. Because `dbData` is a large object containing **all collections** and changes on every `onSnapshot` event, this causes:
1. **Stale closure risk** — The backup snapshot (`previousState`) may be outdated by the time a Firestore error triggers rollback.
2. **Unnecessary re-creation** — Every `dbData` update re-creates both callbacks, which propagates to every consumer.

**Recommendation:**
- Use `useRef` to hold the latest `dbData` for rollback instead of a closure capture.
- Remove `dbData` from the dependency arrays; use the ref pattern for optimistic rollback.

---

#### 1.4 — No Client-Side Validation in DBM Save Flow
**File:** [DBMContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/DBMContext.jsx#L61-L83)

The `saveEntry` function writes payloads directly to Firestore without any schema validation. Unlike FolioContext (which uses Zod via `characterSchema.parse()`), DBM entries have no runtime validation. A malformed or missing `name` field can be saved to Firestore.

**Recommendation:**
- Add a lightweight validation step (at minimum, `name` required check) before the `setDoc` call.
- Consider a `validateEntry(payload, categoryKey)` utility that checks field types against `categoryConfig[key].fields`.

---

#### 1.5 — CampaignContext: Auto-Save on Every State Change Creates Write Storm
**File:** [CampaignContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/CampaignContext.jsx#L460-L526)

The `useEffect` at line 460 triggers on every `universeState` change and writes to **three Firestore documents** (`user_stories`, `universe/main`) plus runs `saveAllElementsIndependently` (batch writes all scenario nodes) and `saveAllMapsIndependently`. Every keystroke in a text field that updates `universeState` triggers this cascade.

> [!WARNING]
> This creates an excessive Firestore write volume. A single editing session typing into a story element field could generate hundreds of writes per minute, rapidly consuming Firestore write quotas.

**Recommendation:**
- The `triggerStorySave` (line 528) debounce pattern exists but is not connected to the auto-save effect. Wire the auto-save effect through the debounced trigger instead of firing immediately.
- Batch `saveAllElementsIndependently` to run only on explicit save, not on every state mutation.

---

#### 1.6 — `saveAllElementsIndependently` Unbounded Batch Size
**File:** [CampaignContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/CampaignContext.jsx#L164-L215)

The function extracts all scenario tree nodes and writes them all in a single Firestore `writeBatch`. Firestore batches are limited to 500 operations. A large campaign with >500 elements will fail silently (the error is caught and `console.warn`'d).

**Recommendation:**
- Chunk the batch writes (similar to the DBMContext `importJSON` which already chunks at 450). Apply the same pattern here.

---

### 🟡 MEDIUM PRIORITY

#### 1.7 — Inconsistent Field Naming: `rules_codex` vs `compendium`
**Files:** [categoryConfig.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/DBM/categoryConfig.js#L1) vs [OMNICORTEX WORKFLOW.md](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/OMNICORTEX WORKFLOW.md#L117)

The OmniCortex workflow documentation references `rules_codex` as the Firestore collection name, but `categoryConfig.js` uses `compendium` as the key (line 2). The Firestore `onSnapshot` listeners in DBMContext will create a collection called `compendium`, not `rules_codex`. This likely means the wiki data is stored in a different collection than what older code or documentation expects.

**Recommendation:**
- Audit which Firestore collection name is actually in production use and standardize across codebase and documentation.

---

#### 1.8 — localStorage Quota Risk from Large State Caching
**Files:** [CampaignContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/CampaignContext.jsx#L59-L101) · [FolioContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/FolioContext.jsx#L60-L87)

Both contexts cache large state objects (universe state, story catalog, elements catalog, maps catalog, persona roster) to localStorage. The combined size could exceed the 5–10MB localStorage quota on some browsers, especially with rich text content and large map data.

**Recommendation:**
- Add `try/catch` guards (partially done) and implement a graceful degradation strategy.
- Consider IndexedDB for large datasets (elements catalog, maps catalog).
- Track total localStorage usage and warn the user when approaching limits.

---

#### 1.9 — Missing Error Surfacing to Users in DBMContext
**File:** [DBMContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/DBMContext.jsx#L45-L47)

The `onSnapshot` error handler (line 45–47) silently swallows errors with an empty catch block. If a Firestore permission error occurs, the user has no indication that data failed to load.

**Recommendation:**
- Add a `loadError` state to DBMContext and surface it via a toast or banner notification.

---

#### 1.10 — Folio: Character Schema Missing Attribute Fields
**File:** [schema.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/Folio/schema.js#L63-L134)

The `characterSchema` uses `.catchall(z.any())` (line 134) to pass through dynamically added keys like `attr-strength`, `attr-agility`, `skill-*-rank`, etc. While functional, this means:
- No validation on attribute values (could be strings, NaN, negative numbers).
- The derived stats calculation in FolioContext (line 234) depends on `parseInt` of potentially undefined values.

**Recommendation:**
- Define the 12 core attribute fields explicitly in the schema with numeric transforms (similar to `starting-cp`).

---

#### 1.11 — Persona Folio: No Unsaved Changes Warning
**File:** [FolioContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/FolioContext.jsx#L157-L211)

The Folio uses a 1-second debounced auto-save (`triggerSave`). However, if a user switches roster characters (`switchRosterCharacter`, line 353), there's no check for pending unsaved data — the current character data is simply overwritten. This could lose in-flight changes if the debounce hasn't fired yet.

**Recommendation:**
- Call `triggerSave(true)` (immediate) before any roster switch operation.

---

### 🟢 LOW PRIORITY

#### 1.12 — `creatorUtils.js`: Tag Appended on Every Save
**File:** [creatorUtils.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/utils/creatorUtils.js#L26-L78)

The `attachCreatorTag` function checks for duplicate tags, but the check is case-sensitive for Array tags and case-insensitive for string tags. Mixed formats could result in duplicate tags in edge cases (e.g., `@Operator_Zero` and `@operator_zero`).

#### 1.13 — ID Generation Uses `Date.now()` Without Collision Guard
**Files:** Multiple contexts

Entry IDs are generated as `entry_${Date.now()}_${random}` or `char_${Date.now()}`. While `Date.now()` plus random suffix is generally adequate, two rapid-fire creations in the same millisecond could theoretically collide. Consider using `crypto.randomUUID()` for guaranteed uniqueness.

---

## Phase 2: Style, UXD, and UI Consistency

> *Evaluation of the live deployment, CSS architecture, responsive design, and accessibility.*

---

### 🔴 HIGH PRIORITY

#### 2.1 — Dual Styling Systems Create Inconsistency
**Files:** [index.css](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/index.css) · [dbm-style.css](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/css/dbm-style.css) · Component JSX files

The project uses **Tailwind CSS** (imported at line 1 of index.css via `@import "tailwindcss"`) alongside **extensive vanilla CSS** (`dbm-style.css` at 987 lines, `aid-style.css`, `mmstyle.css`). Components like `AppShell.jsx` and `Home.jsx` use Tailwind utility classes inline, while DBM components reference vanilla CSS classes. This creates:
- Duplicate `:root` variable declarations (index.css line 38 vs dbm-style.css line 5).
- Conflicting scrollbar styles (both files define `::-webkit-scrollbar`).
- Unclear source-of-truth for design tokens.

**Recommendation:**
- Consolidate `:root` CSS custom properties into a single `design-tokens.css` file imported once.
- Migrate the legacy `dbm-style.css` patterns into the unified design system progressively.

---

#### 2.2 — No Responsive Breakpoints for Core Application Views
**Files:** [dbm-style.css](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/css/dbm-style.css#L52-L54) · Component JSX

The DBM stylesheet has only one media query (`@media (max-width: 768px)` at line 52 for container padding). The sidebar, table views, item modals, and wiki panels have no responsive adaptation. On mobile devices, the 280px fixed sidebar (`#app-sidebar`, line 134) plus content area will overflow.

The Home page uses responsive Tailwind classes (`md:text-8xl`) but the core modules (DBM, Folio, Foundry) do not.

**Recommendation:**
- Add responsive breakpoints for the sidebar (collapsible on mobile).
- Stack the DBM table/wiki views vertically on narrow screens.
- Add a viewport meta tag check (confirmed present in `index.html`).

---

#### 2.3 — Missing Accessibility (ARIA) Infrastructure
**Files:** All component JSX files

Across the entire component library:
- No `aria-label` attributes on icon-only buttons (e.g., settings gear, close buttons).
- No `aria-live` regions for dynamic content updates (chat messages, save status).
- No keyboard navigation support for custom modals (no focus trap, no Escape key handler).
- Color contrast: The `--text-muted` (`#484f58`) against `--bg-primary` (`#0d1117`) has a contrast ratio of approximately 2.8:1, failing WCAG AA requirements (minimum 4.5:1).

**Recommendation:**
- Add `aria-label` to all icon-only buttons.
- Implement focus trap in modal components.
- Increase `--text-muted` to at least `#7d8590` for WCAG AA compliance.

---

### 🟡 MEDIUM PRIORITY

#### 2.4 — Inconsistent Inline Styles vs CSS Classes
**File:** [Home.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Home.jsx#L82-L91)

The Home page uses JavaScript `onMouseEnter`/`onMouseLeave` handlers to manipulate `boxShadow` directly (lines 86–91), mixing imperative DOM style manipulation with declarative Tailwind classes. This pattern is repeated for each navigation button.

**Recommendation:**
- Replace with CSS `:hover` pseudo-class or Tailwind `hover:shadow-*` utilities for consistency and performance.

---

#### 2.5 — Font Import Duplication
**Files:** [index.css](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/index.css#L2) · [dbm-style.css](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/css/dbm-style.css#L2)

Both files import Google Fonts:
- `index.css` imports Inter + Outfit
- `dbm-style.css` imports Inter only

This triggers duplicate network requests. Additionally, the Outfit font is referenced in CSS (`font-family: 'Outfit'`, index.css line 87) but never used in Tailwind configuration.

**Recommendation:**
- Consolidate font imports into a single location (`index.html` or `index.css` only).

---

#### 2.6 — `no-scrollbar` Utility Defined Three Times
**File:** [index.css](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/index.css#L4-L29)

The `no-scrollbar` utility is defined three separate times in index.css: once in a `@layer utilities` block (line 4), once as a `@utility` directive (line 14), and once as a raw CSS rule (line 22). Only one is needed.

---

#### 2.7 — Missing Page Metadata and SEO
**File:** [index.html](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/index.html)

The HTML shell is minimal — missing:
- `<meta name="description">` tag
- Open Graph / social media meta tags
- Favicon link
- Theme color meta tag for mobile browsers

---

### 🟢 LOW PRIORITY

#### 2.8 — Animation Performance: `gradient-animation` Uses `background-position`
Animating `background-position` triggers paint on every frame. For the title text, this is acceptable, but consider using `transform`-based animations for any elements that are animated frequently.

#### 2.9 — `AppShell.jsx` Settings Button is Non-Functional
**File:** [AppShell.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/Layout/AppShell.jsx#L19-L21)

The Settings button renders but has no `onClick` handler — it's a dead UI element.

---

## Phase 3: Interconnections and Versatility

> *Data flow architecture, module coupling, scalability, and code duplication.*

---

### 🔴 HIGH PRIORITY

#### 3.1 — CampaignContext is a God Object (1,520 Lines)
**File:** [CampaignContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/CampaignContext.jsx)

At 1,520 lines, `CampaignContext` manages **all** Story Foundry state: universe state, story catalog, maps catalog, elements catalog, cloud sync, conflict resolution, local/cloud save/load, scenario CRUD, map CRUD, element CRUD, export/import, and creative state. Any update to any of these triggers a full context value change, causing re-renders across all Story Foundry consumers.

**Recommendation:**
- Extract into focused contexts:
  - `StoryCatalogContext` — catalog browsing, CRUD
  - `UniverseStateContext` — active project state, scenarios
  - `MapContext` — map state management
  - `CloudSyncContext` — sync status, conflict resolution
  - `ExportContext` — save/load file operations

---

#### 3.2 — FolioContext is Also Oversized (1,170 Lines)
**File:** [FolioContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/FolioContext.jsx)

Similar to CampaignContext, FolioContext handles character data, roster management, cloud save, public catalog, derived stats, CP calculations, attribute management, and all field update handlers in a single context.

**Recommendation:**
- Extract `DerivedStatsContext`, `RosterContext`, and `CharacterCloudSyncContext`.

---

#### 3.3 — Three Separate Apps with Divergent Architectures
**Directories:** `TANGENT SF RP react project/` · `AIME-main/` · `story-foundry-app/`

The workspace contains three separate Vite applications:
1. **Main app** (React + Tailwind + Firebase) — the deployed production app
2. **AIME standalone** (React + Flask backend) — a separate creative writing tool
3. **story-foundry-app** (React) — appears to be an earlier standalone version of Story Foundry

`story-foundry-app` shares conceptual overlap with the main app's StoryFoundry components but uses different file structures and patterns. This creates maintenance confusion.

**Recommendation:**
- If `story-foundry-app` is deprecated (its features are now in the main app), archive it clearly.
- If AIME functionality needs to be maintained, plan its integration into the main app's service layer (partially done with `aimeService.js`).

---

#### 3.4 — Schema Drift Between categoryConfig, elementSchemas, and Folio schema
**Files:** [categoryConfig.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/DBM/categoryConfig.js) · [elementSchemas.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/StoryFoundry/elementSchemas.js) · [schema.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/Folio/schema.js)

Three separate schema definitions exist with overlapping but divergent field names:

| Concept | DBM (categoryConfig) | Foundry (elementSchemas) | Folio (schema.js) |
|---------|---------------------|-------------------------|-------------------|
| Character name | `name` | `char-name` | `char-name` |
| Species | `species` collection | `char-species` (relational) | `char-species` (string) |
| Occupation | `occupations` collection | `char-occu` (relational) | `char-occu` (string) |
| Features | Object with full fields | JSON textarea | Array of `traitItemSchema` |

The Persona type in `elementSchemas.js` maps fields to the Folio schema format (e.g., `char-name`, `char-motive`), but these don't align with DBM's `name`/`description` pattern. This drift means data from one module can't be seamlessly consumed by another without transformation.

**Recommendation:**
- Create a shared `sharedSchemas.ts` module that defines canonical field names.
- Add adapter functions to convert between module-specific formats.

---

#### 3.5 — DBMContext Pre-Fetches ALL Collections Globally
**File:** [DBMContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/DBMContext.jsx#L24-L59)

The `DBMProvider` wraps the entire app (in `App.jsx` line 23) and immediately subscribes to **every** Firestore collection defined in `categoryConfig` (20+ categories with subcategories = 40+ listeners). This happens even when the user is on the Home page and hasn't navigated to DBM.

**Recommendation:**
- Lazy-load DBM data. Only subscribe to collections when the user navigates to `/dbm`.
- Alternatively, make `DBMProvider` wrap only the `/dbm` route, not the entire app.

---

### 🟡 MEDIUM PRIORITY

#### 3.6 — Duplicate Auth Listener Pattern Across Contexts
**Files:** [AuthContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/AuthContext.jsx#L28-L89) · [DBMContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/DBMContext.jsx#L16-L21) · [FolioContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/FolioContext.jsx#L119-L155) · [CampaignContext.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/context/CampaignContext.jsx#L141-L147)

All four contexts independently call `onAuthStateChanged(auth, ...)`, creating **four separate auth state listeners**. Each maintains its own `currentUser` state.

**Recommendation:**
- Use `AuthContext` as the single source of truth. Have other contexts consume `useAuth()` instead of creating their own `onAuthStateChanged` listeners.

---

#### 3.7 — StoryFoundry ELEMENT_TYPES Divergence
**Files:** [elementSchemas.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/StoryFoundry/elementSchemas.js#L6-L10) · [BastionDrawer.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/StoryFoundry/BastionDrawer.jsx#L14-L17)

`elementSchemas.js` defines 16 element types (including `Persona`, `Universe`, `World`, `Philosophy`, `Technology`, `Species`), but `BastionDrawer.jsx` defines its own `ELEMENT_TYPES` array with only 11 types (using `Character` instead of `Persona`, and missing `Universe`, `World`, `Philosophy`, `Technology`, `Species`). This means the BASTION generator in Story Foundry can't generate content for the newer element types.

**Recommendation:**
- Import `ELEMENT_TYPES` from `elementSchemas.js` in `BastionDrawer.jsx` instead of maintaining a separate list.

---

#### 3.8 — No Shared Component Library
The project has a `components/UI/` folder with only 4 files (ChatParser, ErrorBoundary, ReferenceTooltip, and 2 CSS files). Common patterns like buttons, modals, inputs, and toasts are implemented ad-hoc across modules with different styling approaches.

**Recommendation:**
- Build a shared `components/UI/` library with: `Button`, `Modal`, `Input`, `Select`, `Toast`, `Badge`, `Card` components.

---

### 🟢 LOW PRIORITY

#### 3.9 — VOID CRASH Expansion Readiness
The architecture supports new campaigns via the Story Foundry's project/story system. However, the single `universe/main` Firestore document approach (CampaignContext line 312, 512) creates a bottleneck — all users share one universe document. For VOID CRASH or other expansive modules, consider per-user or per-campaign universe documents.

#### 3.10 — `exportUtils.js` Not Used by All Modules
**File:** [exportUtils.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/StoryFoundry/exportUtils.js)

Export utilities are scoped to Story Foundry. DBM and Folio have their own export patterns inline. Consider unifying export logic.

---

## Phase 4: AI Agent Workflow Analysis (BASTION & AIME)

> *Backend integration, prompt engineering, context management, and reliability.*

---

### 🔴 HIGH PRIORITY

#### 4.1 — API Key Exposed in Client-Side URL
**File:** [bastionService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/bastionService.js#L75)

```javascript
await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, ...);
```

The Gemini API key is passed as a URL query parameter. While stored in localStorage and not hardcoded, URL-embedded API keys can be:
- Logged by intermediate proxies, CDNs, or browser extensions.
- Visible in browser history and developer tools Network tab.
- Captured by any `beforeunload` or network monitoring scripts.

**Recommendation:**
- Route API calls through a Firebase Cloud Function or Cloud Run proxy. The proxy holds the API key server-side and the client authenticates via Firebase Auth token.
- The AIME standalone app already implements this pattern correctly via its Flask `/api/proxy` endpoint.

---

#### 4.2 — System Prompt Injected as User Message (Not System Instruction)
**Files:** [bastionService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/bastionService.js#L146-L152) · [aimeService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/aimeService.js#L19-L21)

Both BASTION and AIME concatenate the system prompt into the user message:
```javascript
parts: [{ text: `${systemPromptContent}\n\nUser Query: ${prompt}` }]
```

The Gemini API supports `systemInstruction` as a top-level field in the request body, which is the intended mechanism for system prompts. Embedding system instructions in user messages:
- Wastes context window tokens on every turn.
- Makes the system prompt vulnerable to user injection/override.
- Reduces model adherence to system instructions.

**Recommendation:**
```javascript
const requestBody = {
  systemInstruction: { parts: [{ text: BASTION_SYSTEM_PROMPT }] },
  contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }]
};
```

---

#### 4.3 — No Context Window Management / History Truncation
**File:** [bastionService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/bastionService.js#L126-L168)

`sendBastionChatMessage` accepts the full conversation `history` array and forwards it to the API without any truncation or token counting. As conversations grow long, this will:
- Exceed model context limits (causing API errors).
- Increase latency and cost linearly with conversation length.
- Include irrelevant early messages that reduce response quality.

**Recommendation:**
- Implement a sliding window strategy: keep the last N messages (e.g., 20) plus a condensed summary of earlier messages.
- Add approximate token counting (character-based estimation) and truncate when approaching the context limit.

---

#### 4.4 — AIME Standalone: Image Generation Returns Placeholder
**File:** [app.py](file:///d:/_Data/Tangent SF RP/AIME-main/server/app.py#L142-L166)

The `/api/image` endpoint doesn't actually call any image generation API. It returns a random `picsum.photos` placeholder URL:
```python
"imageUrl": f"https://picsum.photos/seed/{abs(hash(superprompt)) % 10000}/1024/768"
```

**Recommendation:**
- Integrate with the Imagen API (Google's image generation model) or clearly mark this endpoint as a stub in the UI.

---

#### 4.5 — No Rate Limiting or Request Throttling
**Files:** [bastionService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/bastionService.js) · [aimeService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/aimeService.js)

Neither service implements any form of rate limiting. A user rapidly clicking "Generate" or "Send" can fire dozens of simultaneous API requests, consuming the Gemini API quota quickly and potentially causing 429 errors.

**Recommendation:**
- Add a request semaphore (maximum concurrent requests: 1-2).
- Disable the send/generate button while a request is in flight (partially implemented in UI but not in the service layer).
- Add exponential backoff on 429 responses.

---

### 🟡 MEDIUM PRIORITY

#### 4.6 — BASTION Model Fallback Chain May Be Outdated
**File:** [bastionService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/bastionService.js#L55-L61)

```javascript
const GEMINI_FLASH_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest'
];
```

The model list is hardcoded. As Google deprecates older models, the first entries may fail, adding latency from fallback attempts. `gemini-flash-latest` should be **first** since it automatically resolves to the latest stable model.

**Recommendation:**
- Reorder to put `gemini-flash-latest` first.
- Remove deprecated model strings.
- Consider making this configurable via Settings.

---

#### 4.7 — AIME Service: `streamContent` Bypasses Model Fallback
**File:** [aimeService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/aimeService.js#L29-L91)

`streamContent` and `streamChatContent` hardcode the model name in the streaming URL and don't use `fetchGeminiContent` (which has fallback logic). If the default model (`gemini-3.6-flash`) is deprecated, streaming will break while non-streaming still works via fallback.

**Recommendation:**
- Add the same fallback chain to streaming requests, or use the `gemini-flash-latest` alias.

---

#### 4.8 — BASTION Selective Field Generator: Loose JSON Parsing
**File:** [bastionService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/bastionService.js#L280-L307)

The JSON extraction from AI responses uses regex (`cleanJsonStr.match(/\{[\s\S]*\}/)`) which will match the **first** `{` to the **last** `}`, potentially capturing extraneous text. The secondary sanitization (replacing `\n` with `\\n`) is fragile and could corrupt legitimate content.

**Recommendation:**
- Use `responseMimeType: "application/json"` (already done at line 274) which should guarantee valid JSON from Gemini. The fallback parsing should only be needed for edge cases.
- Add structured error reporting when JSON parsing fails, including the raw response for debugging.

---

#### 4.9 — No AI Response Validation Before DB Write
**Files:** [BastionDrawer.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/StoryFoundry/BastionDrawer.jsx) · [BastionChatModal.jsx](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/components/DBM/BastionChatModal.jsx)

When BASTION generates content for fields, the results are applied directly to form data without any validation:
- Generated HTML content could include `<script>` tags (XSS risk).
- Generated values could be the wrong type (e.g., string instead of number).
- Generated text could exceed expected field lengths.

**Recommendation:**
- Sanitize HTML output (use DOMPurify or similar).
- Validate generated values against the field schema before applying.

---

#### 4.10 — AIME Standalone: CORS Wildcard in Production
**File:** [app.py](file:///d:/_Data/Tangent SF RP/AIME-main/server/app.py#L12)

```python
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

The Flask server allows requests from any origin. If deployed, this allows any website to proxy requests through the AIME server.

**Recommendation:**
- Restrict CORS origins to the known frontend domains.

---

#### 4.11 — Discord Architecture Not Present in Codebase
The mission brief mentions BASTION's "Discord architecture," but no Discord bot code, webhook handlers, or Discord SDK imports exist in any of the three projects. This feature appears to be planned but not yet implemented.

**Recommendation:**
- If Discord integration is planned, design the BASTION service layer to be transport-agnostic (accept messages from HTTP or Discord webhook payloads identically).

---

### 🟢 LOW PRIORITY

#### 4.12 — BASTION Fallback "Local Cognition" is Static
**File:** [bastionService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/bastionService.js#L130-L133)

When no API key is available, BASTION returns a canned response. The `generateSelectiveFields` fallback (lines 206-241) generates template-based content. This is a nice touch but could be enhanced with more variety.

#### 4.13 — Dice Roller Has No Advanced Features
**File:** [bastionService.js](file:///d:/_Data/Tangent SF RP/TANGENT SF RP react project/src/services/bastionService.js#L24-L53)

`parseRollCommand` handles `NdM+/-X` format but doesn't support:
- Advantage/disadvantage rolls
- Exploding dice
- Keep highest/lowest N
- The Tangent RPG system's specific roll mechanics (if any)

---

## Summary Priority Matrix

| Priority | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|----------|---------|---------|---------|---------|
| 🔴 HIGH | 1.1, 1.2, 1.3, 1.4, 1.5, 1.6 | 2.1, 2.2, 2.3 | 3.1, 3.2, 3.3, 3.4, 3.5 | 4.1, 4.2, 4.3, 4.4, 4.5 |
| 🟡 MEDIUM | 1.7, 1.8, 1.9, 1.10, 1.11 | 2.4, 2.5, 2.6, 2.7 | 3.6, 3.7, 3.8 | 4.6, 4.7, 4.8, 4.9, 4.10, 4.11 |
| 🟢 LOW | 1.12, 1.13 | 2.8, 2.9 | 3.9, 3.10 | 4.12, 4.13 |

---

## Recommended Execution Order

> [!IMPORTANT]
> The following is the suggested triage order for maximum impact with minimum risk.

### Sprint 1: Critical Security & Stability
1. **4.1** — Move API key to server-side proxy
2. **1.1** — Fix Firestore security rules
3. **1.2** — Remove admin override bypass
4. **4.2** — Use `systemInstruction` field for AI prompts

### Sprint 2: Performance & Data Integrity
5. **1.5** — Debounce CampaignContext auto-save
6. **3.5** — Lazy-load DBMContext collections
7. **1.3** — Fix stale closure in DBMContext
8. **1.4** — Add client-side validation for DBM saves
9. **1.6** — Chunk `saveAllElementsIndependently` batches

### Sprint 3: Architecture Modernization
10. **3.1** — Split CampaignContext
11. **3.2** — Split FolioContext
12. **3.6** — Unify auth listener pattern
13. **3.4** — Create shared schema module
14. **3.3** — Archive deprecated story-foundry-app

### Sprint 4: AI Agent Hardening
15. **4.3** — Add context window management
16. **4.5** — Add rate limiting
17. **4.9** — Validate AI output before DB write
18. **4.7** — Add fallback chain to streaming endpoints
19. **4.6** — Reorder model fallback list

### Sprint 5: UX Polish
20. **2.1** — Consolidate CSS design system
21. **2.2** — Add responsive breakpoints
22. **2.3** — Add accessibility infrastructure
23. **2.7** — Add page metadata / SEO
24. **2.4** — Clean up inline style handlers
