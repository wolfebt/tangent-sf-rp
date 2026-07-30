# Tangent SFF RPG - Usability and Functionality Review Report

## 1. Executive Summary

The **Tangent Science Fantasy Roleplaying Game (SFF RPG)** application is a highly ambitious, multi-tool digital tabletop suite. Built on a modern React 19 and Vite 8 stack, it features an impressive UI with rich, immersive styling (Tailwind CSS 4) tailored for a premium science-fantasy aesthetic. 

The application successfully integrates complex state management and real-time database synchronization across its three primary modules:
1. **OMNICORTEX (Database Manager)**
2. **Persona Folio (Character Management)**
3. **Story Foundry (Campaign & Map Builder)**

Recent updates have significantly enhanced the usability of the platform (e.g., DBM tabbed forms, Canvas Keyboard Shortcuts, Multi-Map tabs, and Persona Folio auto-save functionality). However, as the application scales and prepares for multi-user/production environments, there are critical areas in **data security, state robustness, and UI feedback** that require attention.

---

## 2. Usability Analysis

### 2.1 OMNICORTEX (DBM)
**Strengths:**
- The recent implementation of **Tabbed Sub-Forms** (`General Info`, `Attributes & Mechanics`, `Features & Relational`) in `DBMItemModal.jsx` elegantly solves the previous issue of extreme vertical scrolling density.
- The inline custom entry mode allows for fluid data entry without breaking the user's flow.

**Usability Gaps:**
- **List Scalability:** As the database of species, weapons, and features grows, standard HTML `<select>` dropdowns and unvirtualized lists will become sluggish. 
- **Accidental Submission:** The custom inline entry mode captures the `Enter` key. While convenient, it may cause users to accidentally add incomplete entries if they are used to pressing `Enter` to submit the main form.

### 2.2 Persona Folio
**Strengths:**
- The automated **Derived Stats** (Health, Vitality, Karma) and the comprehensive **CP Economy Breakdown** (automatically tracking points spent across attributes, skills, and features) dramatically reduce the cognitive load on players.
- The real-time auto-save with a debounced local/session storage fallback ensures data resilience.

**Usability Gaps:**
- **Over-Budget Warnings:** While the system calculates `spentCP` and `remainingCP`, there is no aggressive visual feedback (e.g., turning the budget bar red or flashing a warning) when a user exceeds their `starting-cp`.
- **Complex UI Math parsing:** The economy breakdown relies on loose string/object parsing (`getItemCP`). If database schemas change slightly, the math could fail silently, leaving the user confused about their point totals.

### 2.3 Story Foundry
**Strengths:**
- The split-pane workspace and **Konva Canvas Engine** offer a desktop-class map-making experience.
- The addition of **Canvas Hotkeys** and **Multi-Map Campaign Tabs** allows power-users and Game Masters to navigate complex campaigns rapidly.
- The Scenario Outline tree supports intuitive drag-and-drop with clear visual drop-indicators.

**Usability Gaps:**
- **Canvas Memory Management:** Large maps with many high-res textures may cause frame drops during panning/zooming. While basic caching exists, strict React-Konva node memoization and off-screen canvas rendering for static backgrounds are missing.
- **Story Context Overload:** The file menu is slightly overcrowded with overlapping concepts (Cloud Library vs. Local Save vs. Cloud Sync). A consolidated "Project Synchronization" dashboard would be more intuitive than a massive dropdown list.

---

## 3. Functionality & Security Audit

> [!CAUTION]
> **Critical Security Flaw in Firestore Rules**
> The current `firestore.rules` configuration contains a critical vulnerability regarding the shared Story Foundry data:
> ```javascript
> match /universe/{document=**} {
>   allow read: if request.auth != null;
>   allow write: if request.auth != null;
> }
> ```
> **Impact:** Any authenticated user can overwrite, modify, or delete *any other user's* campaign universe data. There is no concept of document ownership or Role-Based Access Control (RBAC) enforced at the database level for campaign files.

**Other Functional Observations:**
- **No Collision Resolution (CRDTs):** The cloud sync relies on a "last-write-wins" full document replacement (`setDoc`). If a GM and a Player both have the Story Foundry open and syncing simultaneously, they will silently overwrite each other's changes.
- **Auth Robustness:** The application relies purely on Google Auth. If a user loses access to their Google account, their local data might become orphaned. There is also no explicit check for `email_verified` to prevent spam accounts from bloating the database.

---

## 4. Comprehensive Recommendations

### High Priority (Immediate Action)
1. **Secure Firestore Rules (Data Ownership):** 
   - Update `firestore.rules` so that `universe` documents require an `ownerId` field matching `request.auth.uid`. 
   - Alternatively, implement a `collaborators` array field to allow GMs to explicitly invite players to view/edit specific maps.
2. **Implement RBAC for OMNICORTEX:**
   - Currently, any logged-in user can edit the global rulebook. Implement Firebase Custom Claims (e.g., `admin: true`) and restrict DBM writes exclusively to administrators.

### Medium Priority (UX & Performance)
3. **Persona Folio CP Budget Constraints:**
   - Add a sticky visual "Budget Status" bar to the top of the Persona Folio. If `remainingCP < 0`, apply a glowing red border (using Tailwind's `ring-red-500` or `border-red-500`) to alert the user that the character is illegal for standard play.
4. **Virtualize Large Lists in DBM:**
   - Integrate a library like `react-window` or `react-virtuoso` for rendering the relational selector lists (`UnifiedRelationalSelectorModal.jsx`) to maintain 60fps performance when the database scales past 500+ items.
5. **Story Foundry Sync Conflict Handling:**
   - Before a cloud push, fetch the current cloud document's `updatedAt` timestamp. If it is newer than the local state's base timestamp, prompt the user with a "Conflict Detected: Overwrite cloud or pull changes?" warning to prevent accidental data loss.

### Low Priority (Polish)
6. **Dashboard Onboarding (Home.jsx):**
   - Add brief, styled tooltips or sub-text under the three main buttons (OMNICORTEX, Story Foundry, Persona Folio) on the Home screen to explain their purpose to first-time users.
7. **Texture Caching in Konva:**
   - For `TexturedTerrainNode` in `MapPane.jsx`, use an offscreen canvas to pre-render static terrain polygons into a single image layer, drastically reducing the number of vector draw calls during map panning.
