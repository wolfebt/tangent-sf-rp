---
id: "0-04-codex-simulation-and-ingestion-manual"
name: "0.04 CODEX Simulation & Ingestion Manual (Asset Forge & Matrix Guide)"
category: "compendium"
parent: "0.00 SYSTEM & USER MANUALS"
order: 4
perspective: "both"
entry_type: "Core Engine Manual"
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
modifiers: []
modifications: []
critical_details:
  score: ''
  effect: []
  success_effect: []
  failure_effect: []
sockets:
  max: 0
  used: 0
  tier: Socket
  allocated: []
---

# 0.04 CODEX Simulation & Ingestion Manual (Asset Forge & Matrix Guide)

The **CODEX (/codex)** is the mathematical simulation engine, procedural asset forge, and automated data ingestion system for the Tangent Science Fantasy Roleplay suite.

---

## 1. System Architecture & The 5 Thematic Suites

The Codex provides 17 engineering matrices grouped into 5 thematic suites:

### 1. Hardware & Structures Suite (Amber Theme)
- **Architecture Blueprint Matrix (ArchitectureBlueprintConfigurator):** Modular structure sizing (0.1 to 800+ Modules), 10:1 UDU mount conversions (1 Module = 10 Mounts), Highest Complexity DC stacking rule, and Workforce Productivity Engine (Daily PP = Crew * (Skill - 10) * Tier Multiplier).
- **Armor Coverage Matrix (ArmorCoverageSelector):** 7 hit-location coverage slots (Head, Torso, Arms, Legs, Full Suit), composite DR, Max Dex caps, and socket capacity.
- **Augmentation Nodes Matrix (AugmentationNodeConfigurator):** Cranial, Ocular, Thoracic, Neural, and Dermal node installations, Full Body Conversion (FBC) chassis, and stigma reaction penalties.
- **Equipment & Workshop Matrix (EquipmentCategoryConfigurator):** Fine to Structure sizing, workshop toolkits (+0 to +8 Check bonus), Processor Ratings (PR 0–4), and Environmental Hazard Protection (EPR 0–3).
- **Mecha & Vehicle Matrix (MechaChassisConfigurator):** Chassis frames (Humanoid, Quad, Tracked, Hover), Mount bays, Defense DC, and Megacredit ($M) military scaling.
- **Weapon Mod Stacker Matrix (WeaponModStacker):** Attachment rails, capacity upgrades/downgrades, and corporate manufacturer skin presets.

### 2. Characters & Companions Suite (Blue Theme)
- **Modular NPC Stat Block Matrix (ModularStatBlockConfigurator):** Threat Tiers 1–20, Competency roles (Minion, Skirmisher, Bruiser, Sniper, Elite, Boss), and tactical AI behaviors (Swarm, Flank, Suppress, Protect).
- **Features & Perks Matrix:** Canonical master library of general perks, combat techniques, and species traits.

### 3. Planetary, Species & Factions Suite (Emerald Theme)
- **Species Forge Matrix (SpeciesTraitSelector):** 150 BP character/species budget, movement modes, and biotechnology genetic synthesis DC.
- **Planetary Design Matrix (PlanetaryDesignConfigurator):** Universal World Profile (UWP/TWP), 16-domain civilization radar, Trade codes (Ag, In, Hi, Ri), and speculative commodity market margins.
- **Factions & Polities Matrix:** 26 canonical attributes covering doctrines, naval assets, sigils, and economic models.

### 4. Metaphysics Suite (Purple Theme)
- **Invocation Matrix (InvocationParameterConfigurator):** 6 disciplines, range/target/area/duration formulas, and essence drain strain costs.
- **Meta-Tech Matrix (MetaTechImbuementConfigurator):** Metamaterial resonance bonding, artifact crafting formulas, and passive imbuements.

### 5. System Suites (Slate Theme)
- **Economatrix Dashboard (EconomatrixDashboard):** Tangent Standard Curve (TSC) calculator, 7-tier crafting timetable, speculative trade simulator, and Wealth Score status table.
- **Technology Codex (TechnologyCodex):** TL0–TL5 Domain Matrix, adaptive tech reconfiguration action economy, and synthetic AI continuum.
- **Scaling Codex (ScalingCodex):** 14 size tiers, die degradation ladder (-1ds to -5ds), cross-scale combat matchups, and starship overblast.
- **Codex Ingestion Engine (CodexIngestionEngine):** Multimodal BASTION AI, Universal Delimiter CSV/TSV/Markdown parser, and Side-by-Side Record Diff Inspector.

---

## 2. Core Economic & Engineering Formulas

### Tangent Standard Curve (TSC)
```
Market Value (Credits) = 10 * 4^(DC / 5)
Material Fabrication Cost = floor(Market Value * 0.50)
```

### Crafting & Workforce Productivity (PP)
```
Daily Production Points (PP) = max(1, (Skill Check - 10) * Tool Tier Multiplier)
Crafting Days = Market Value / Daily PP
Cooperative Daily PP = Workers * (Average Skill Check - 10) * Tool Tier Multiplier
```

### Liquidity Gap Analysis
```
Liquid Gap Cost = max(0, Item Market Value - Buyer AutoBuy Limit)
```

### Unified Difficulty Units (UDU) 10:1 Ratio
```
1 Module = 10 Mounts = 100 Sockets = 1,000 Nodes = 10,000 Sub-Nodes
```

---

## 3. Data Ingestion Engine & Revision Pipeline

Accessed via /codex?matrix=ingestion-engine:
1. **Intake Modes:**
   - **BASTION AI Studio:** Multimodal extraction with multi-chunk section splitting (>10,000 chars) and live progress telemetry.
   - **Direct JSON Array:** Raw canonical array input.
   - **Universal Delimiter Tabular Parser:** Automatic detection of Markdown pipe tables, TSV, RFC 4180 quotation-aware CSV, and Semicolon tables with header aliasing and drag-and-drop file upload.
2. **Side-by-Side Diff Inspector Modal:**
   - Visual status badges: MODIFIED (Amber), NEW FIELD (Emerald), UNCHANGED (Slate).
   - Seamless one-click transition into the In-Place Revision Workbench.
3. **Conflict Handling:**
   - Merge (preserves document IDs), Overwrite, or Skip.
4. **Sanitization:**
   - Automatic stripping of LaTeX delimiters into clean unicode to protect Folio sheets and DBM compendium renderers.

## Game Mechanics Rules
```
Market Value = 10 * Math.pow(4, DC / 5)
Material Cost = Market Value * 0.50
```

## Gameplay Instructions
1. Navigate to /codex to launch any of the 17 design matrices.
2. Use the Ingestion Engine tab to batch import content from external PDFs, CSVs, or TSVs.
3. Use the Diff button on staged cards to inspect conflicts before writing to the Omnicortex database.

## Designer Notes
Every asset output by the Codex is guaranteed 100% compliant with the Persona Folio and DBM compendium schemas.
