# TANGENT SF RP — ADVENTURE DEVELOPMENT ENVIRONMENT (ADE)
## Master Architectural Specification & Source-of-Truth Reference

---

### Document Overview
- **Document ID**: `ADE-SPEC-2026-V1`
- **System**: Tangent SF RP Tabletop Role-Playing Framework
- **Environment**: Adventure Development Environment (ADE) & AIME Creative Suite
- **Last Updated**: 2026-09-05
- **Status**: Production Reference Specification

---

## 1. Executive Summary & Architectural Vision

The **Adventure Development Environment (ADE)** is the unified, next-generation authoring, scenario design, and game master operating platform for the **Tangent SF RP** game engine. It merges open-ended worldbuilding compendiums, structured narrative trees, Old-School Renaissance (OSR) tactical control panels, distraction-free fiction manuscript writing, and granular AI co-authoring into a single cohesive creative studio.

Historically, narrative tools were fragmented across disconnected modules:
1. **Scenario Pane**: Hierarchical tree outlining and rich-text note taking.
2. **AIME**: Separate 4-stage narrative weaver (Brainstorm, Outline, Beats, Draft).
3. **Control Panel**: Detached 2-page OSR spread format.
4. **Manuscript Studio**: Isolated fiction drafting page.

The ADE unifies these components into an integrated pipeline with zero context switching:
```
                                 ┌────────────────────────────────────────────────────────┐
                                 │       ADVENTURE DEVELOPMENT ENVIRONMENT (ADE)         │
                                 └──────────────────────────┬─────────────────────────────┘
                                                            │
                 ┌───────────────────────────┬──────────────┴───────────────┬────────────────────────────┐
                 ▼                           ▼                              ▼                            ▼
      ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────┐   ┌─────────────────────┐
      │      SCENARIOS        │   │ AIME CREATIVE STUDIO  │   │     INTERACTIVE STORY     │   │   ELEMENT FORGE     │
      │ ┌───────────────────┐ │   │ ┌───────────────────┐ │   │ ┌───────────────────────┐ │   │ ┌─────────────────┐ │
      │ │ Scenario Canvas   │ │   │ │ Stage 1:Brainstorm│ │   │ │ Gated 1-2 Para Beats  │ │   │ │ Personas        │ │
      │ ├───────────────────┤ │   │ ├───────────────────┤ │   │ ├───────────────────────┤ │   │ ├─────────────────┤ │
      │ │ OSR Control Panel │ │   │ │ Stage 2:Outline   │ │   │ │ Decision Gate Choices │ │   │ │ Factions        │ │
      │ ├───────────────────┤ │   │ ├───────────────────┤ │   │ ├───────────────────────┤ │   │ ├─────────────────┤ │
      │ │ Manuscript Studio │ │   │ │ Stage 3:Beats     │ │   │ │ Skill Checks & DC     │ │   │ │ Gear / Items    │ │
      │ └───────────────────┘ │   │ ├───────────────────┤ │   │ ├───────────────────────┤ │   │ ├─────────────────┤ │
      │                       │   │ │ Stage 4:Draft     │ │   │ │ Living Beats Ledger   │ │   │ │ Locations & Lore│ │
      │                       │   │ └───────────────────┘ │   │ └───────────────────────┘ │   │ └─────────────────┘ │
      └──────────┬────────────┘   └───────────┬───────────┘   └─────────────┬─────────────┘   └──────────┬──────────┘
                 │                            │                             │                            │
                 └────────────────────────────┼─────────────────────────────┴────────────────────────────┘
                                              ▼
                              ┌───────────────────────────────┐
                              │     PROJECT SCRATCHBOOK       │
                              │   [Title]_SCRATCHBOOK.md      │
                              │  - Catalog of Elements Used   │
                              │  - Active Guidance Gems       │
                              │  - Scenario Hierarchy & OSR   │
                              │  - Decision Gate Log          │
                              │  - Ongoing GM Notes           │
                              └───────────────────────────────┘
```

---

## 2. The Project Scratchbook (`[StoryTitle]_SCRATCHBOOK.md`)

### 2.1 Purpose & Role as Ground Truth
Each story project in the ADE maintains a living Markdown reference document titled the **Scratchbook**. The Scratchbook acts as the **single source of truth** for human creators and AI co-pilots alike. Whenever an AI interaction takes place (in AIME, in the In-Situ Co-Pilot, or in the Interactive Story Studio), the Scratchbook provides the context window with immediate, structured awareness of the entire narrative universe.

### 2.2 Scratchbook Structure & Schema
The Scratchbook is compiled automatically by `scratchbookService.js` and contains five distinct sections:

1. **Header & Metadata**:
   - Project Name, Author/Architect, Timestamp, Total Word Count, and count of Elements Used.
2. **Section 1: Narrative Vision & Guidance Gems**:
   - List of all active guidance gems (Mood, Genre, Tone, Pacing, POV, Theme, Conflict, Setting).
   - High-level plot outline or premise.
3. **Section 2: Complete Catalog of All Elements Used**:
   - Rigorous, automated cataloging of **every** worldbuilding element referenced in the scenario hierarchy, element mentions, or relational links (`findElementsUsed`).
   - Grouped by element type: **Personas & NPCs**, **Factions & Groups**, **Locations & Zones**, **Items & Relics**, **Lore & Intel**.
   - Lists each element's title, type, summary/description, and exact scenario locations where it is used.
4. **Section 3: Scenario Hierarchy & OSR Control Panel Elements**:
   - Indented outline of chapters, encounters, and scenes.
   - For nodes with OSR data: Sensory Read-Aloud scripts, Scannable Bullets with bracketed DCs, 3-Tier Threat Matrix, and Classified GM Secrets.
5. **Section 4: Interactive Story Beats & Decision Gate Ledger**:
   - Chronological record of all interactive beats played.
   - Selected options, custom player inputs, and dice check outcomes.
6. **Section 5: Ongoing GM Development Notes & Revision Log**:
   - Editable GM scratchpad for open plot hooks, unresolved player choices, rule reminders, and explicit directives for AI co-pilots.

### 2.3 User Operations
- **Inspect**: Open the Scratchbook modal directly from the ADE navigation bar or scenario header.
- **Copy**: One-click copy of the entire compiled Markdown document to the clipboard.
- **Download**: Download as a standalone `[StoryTitle]_SCRATCHBOOK.md` file.
- **Search Elements**: Filter and audit elements used directly inside the Scratchbook inspector tab.
- **Save Notes**: Persist custom GM notes directly into `CampaignContext.creativeState.scratchbookNotes`.

---

## 3. Guidance Gems Engine

### 3.1 Eight-Category Taxonomy
Guidance Gems serve as high-priority behavioral and stylistic directives for all generative AI features. The taxonomy is centralized in `src/pages/Foundry/StoryModule/guidanceGemsConfig.js`:

| Category | Description | Sample Presets |
| :--- | :--- | :--- |
| **Mood** | Atmospheric & emotional resonance | *Grimdark, Hopeful, Ominous, Paranoid, Wonder, Bleak, Whimsical, Eerie, Melancholic, Heroic* |
| **Genre** | Literary / cinematic framework | *Hard Sci-Fi, Space Opera, Cyberpunk, Cosmic Horror, Biopunk, Post-Apocalyptic, Military SF, Tech-Noir* |
| **Tone** | Authorial voice & diction | *Gritty, Cerebral, Cinematic, Satirical, Deadpan, Poetic, Pulpy, Clinical, Sardonic, Epic* |
| **Pacing** | Narrative tempo & tension curve | *Urgent, Slow-burn, Breakneck, Methodical, Rollercoaster, Measured, Episodic, Relentless* |
| **POV** | Narrative point of view | *First Person Limited, Third Person Limited, Third Person Objective, Second Person, Omniscient* |
| **Theme** | Core philosophical conflicts | *Entropy, Synthetic Identity, Cost of Transcendence, Duty vs Survival, Technological Hubris, Memory Alteration* |
| **Conflict**| Primary engine of opposition | *Man vs Machine, Corporate Hegemony, Alien Infection, Internal Madness, Resource Scarcity, Class Rebellion* |
| **Setting** | Environmental backdrop & scale | *Derelict Starship, Neon Megacity, Subterranean Bunker, Gas Giant Station, Dying Orbital Habitat, Oceanic Moon* |

### 3.2 Custom Gems & Persistence
Users can define custom gems within any of the 8 categories. Custom gems are automatically merged with presets and saved to `CampaignContext.creativeState.customGems[category]`. Active selections are stored in `creativeState.gems` as an array of unique strings.

### 3.3 Prompt Ingestion
When prompting any AI service (`generateContent`, `streamContent`, or `AIMEChatBox`), the helper function `formatGemsForPrompt(activeGems)` formats the active directives into a standardized directive block:
```
GUIDANCE GEMS DIRECTIVES:
- Mood: Paranoid
- Genre: Hard Sci-Fi
- Tone: Clinical
- Pacing: Slow-burn
- POV: Third Person Limited
- Theme: Synthetic Identity
- Conflict: Man vs Machine
- Setting: Derelict Starship
(Adhere strictly to these narrative and stylistic parameters in all generated prose, dialogue, and beats.)
```

---

## 4. OSR Two-Page Control Panel Integration

### 4.1 In-Situ Scenario Architecture
In earlier iterations, the OSR Control Panel existed as a detached page. In the unified ADE, the Control Panel components are embedded directly into the **Scenarios** view (`ScenarioPane.jsx`) as the **OSR Control Panel Deck** (`OsrControlPanelDeck.jsx`).

Game Masters no longer need to navigate away from their scenario outline to access run-time GM tools:
- **Sensory Read-Aloud GM Script**:
  - Atmospheric boxed text designed to be read directly to players. Includes a **Copy Read-Aloud** button and an AI generation prompt.
- **Scannable Bullets & Bracketed DCs**:
  - High-density bullet points featuring bold keywords and bracketed checks (e.g. `[Logic DC 14]`, `[Perception DC 12]`).
  - Interactive **🎲 Roll** buttons that immediately simulate a `2d6 + Stat` dice check with instant outcome banners.
- **3-Tier Threat Matrix**:
  - Tiered opposition breakdowns (**Low / Medium / High**) detailing enemy types, counts, tactics, and trigger conditions.
  - Quick **Trigger Combat** action buttons.
- **Classified GM Secrets & Revelations**:
  - Hidden truths, GM-only lore, hidden traps, and plot twists color-coded in amber and red.
- **AI OSR Co-Pilot Deck**:
  - Quick buttons to generate complete OSR packages, standalone read-alouds, threat matrices, or GM secrets with active Guidance Gems injected.

---

## 5. Connected Manuscript Studio

### 5.1 Tabbed Integration
Accessible directly from the **Scenarios** workspace header via the `[✍️ Manuscript Studio]` tab:
- **Telemetry Bar**:
  - Live **Word Count**, **Character Count**, and estimated **Reading Time** (calculated at 220 words per minute).
- **Active POV Character Lock**:
  - Dropdown populated with all Persona and NPC elements from the project.
  - Locking a character automatically sets their name in the status bar and informs all subsequent AI authoring prompts.
- **Distraction-Free Canvas**:
  - High-contrast dark typography optimized for extended fiction writing.
- **AI Pair Authoring Toolbar**:
  - **Continue Scene**: Automatically writes the next 2-3 paragraphs picking up from the current cursor position.
  - **Expand Description**: Infuses the current draft with sensory details and atmospheric tension.
  - **Polish Prose**: Refines rhythm, sentence variation, and gem adherence.
  - **Export Markdown**: Downloads the current manuscript prose as a standalone `.md` file.

---

## 6. Granular Interactive Story Studio & Decision Gate

### 6.1 Interactive Loop
The **Interactive Story Studio** allows authors to playtest their scenarios beat-by-beat:
1. **1-2 Paragraph AI Prose Beat**: Concise, high-stakes narrative generation.
2. **Decision Gate**: 3 contextual options generated by the AI, plus a **Custom Action** input field.
3. **Skill Checks**: Optional attribute checks (e.g., `[Agility DC 12]`) with integrated dice rolls.
4. **Beat Ledger**: Every action, check, and prose outcome is permanently recorded in the scenario's interactive beats timeline and compiled into the Scratchbook.

### 6.2 Bug Fix: Decision Gate Initial Freeze
In previous versions, starting an interactive story with an empty beats array (`beats = []`) caused an unhandled JavaScript exception:
```javascript
// Error: Cannot read properties of undefined (reading 'gate')
const currentGate = beats[beats.length - 1].gate;
```
Because the exception occurred outside a guarded try block, React threw an uncaught error and left `isGenerating: true` perpetually, freezing all Decision Gate buttons and inputs.

**Resolution Implemented**:
```javascript
const currentBeat = beats.length > 0 ? beats[beats.length - 1] : null;
const currentGate = currentBeat ? currentBeat.gate : null;
```
Safe optional chaining and guarded array index lookups now ensure that starting a fresh chapter or advancing from zero beats operates reliably.

---

## 7. Mandatory AI Status Notifications & Spinners

Every interaction that calls Gemini API endpoints (`generateContent` or `streamContent`) is bound to visual feedback states:

1. **Top In-Process Banners**:
   - Bright cyan pulsing status banner: *"AIME is thinking... (Generating creative content...)"* with a revolving SVG spinner.
2. **Button-Level Spinners**:
   - Generation buttons display inline spinners and the label *"Thinking..."*, with `disabled={true}` set to prevent double-clicks or duplicate API requests.
3. **Decision Gate Advance Spinner**:
   - The *"Advance Story Beat"* button displays an animated spinner and disables input while processing.
4. **Streaming Placeholder Cards**:
   - While awaiting the first token of a streaming response, a pulsing placeholder card confirms network activity.

---

## 8. Resilient AI Model Cascading & API Fallbacks

To prevent outages caused by endpoint deprecations, model quotas, or 404 responses (e.g., the deprecation of `gemini-2.5-flash`), both `bastionService.js` and `aimeService.js` utilize candidate model fallbacks:

```javascript
const GEMINI_STREAM_MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest'
];
```

If the primary model returns HTTP 404 or 429, the streaming engine catches the error, logs a diagnostic warning, and retries with the next candidate in the pool before failing.

---

## 9. Verification & Quality Assurance Protocols

All components within the ADE are subject to automated verification:
1. **Engine Test Suite**:
   ```bash
   cmd /c "npm test"
   ```
   Validates 39 core engine specifications, including coordinate math, dice AST parsing, damage pipelines, and CRDT synchronization.
2. **Data Integrity Test**:
   ```bash
   node scripts/validateDataIntegrity.mjs
   ```
   Verifies 25 relational integrity checks across species, archetypes, traits, weapons, invocations, and compendium records (100% pass requirement).
3. **Vite Production Build**:
   ```bash
   cmd /c "npm run build"
   ```
   Ensures TypeScript typing, module exports, Rolldown bundling, and PWA service worker generation succeed with zero warnings or errors.

---

*End of ADE Master Specification.*
