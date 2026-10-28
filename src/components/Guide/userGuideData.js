/**
 * @file userGuideData.js
 * Comprehensive User Guide Data for Tangent Science Fantasy Roleplaying Game
 * Covers all modern platform modules, workflows, architecture, and 6W operational contexts.
 */

export const USER_GUIDE_SECTIONS = [
  {
    id: 'intro',
    num: 0,
    title: 'Intro & Table of Contents',
    fullTitle: 'Platform Architecture, System Blueprint & Table of Contents',
    badge: 'Core Manual',
    color: '#22d3ee',
    iconName: 'RingedPlanetLogo',
    sixW: [
      'Operatives, Lead Architects, Storytellers, and Game Masters embarking on science fantasy campaigns.',
      'A unified modular virtual tabletop, relational rules compendium, worldbuilding studio, and tactical narrative engine.',
      'Accessed via modern desktop and mobile browsers, reinforced with local-first indexed offline persistence.',
      'Deployed during world synthesis, tactical encounter prep, live combat adjudication, and squad campaigns.',
      'To eliminate prep friction, ensure deterministic 2d10 mechanical fidelity, and preserve deep narrative immersion.',
      'Navigated through synchronized studio workspaces, contextual HUD telemetry, interactive node graphs, and assisted AI synthesis.'
    ],
    lead: 'Welcome to the official Tangent Science Fantasy Roleplaying System Manual. Designed for high-velocity science fantasy adventures, Tangent unites cosmic space opera, grounded cybernetics, psionic disciplines, and megacorporate intrigue within an integrated digital operating system.',
    architectureHighlights: [
      {
        title: '270 Canonical Compendium Articles',
        badge: 'Source of Truth',
        desc: 'Split cleanly into 1.00 Operator Core Rules (224 articles across 14 master volumes) and 5.00 Architect Modular Matrices (46 articles across 9 master matrices), synchronized build-time with OPFS local storage.'
      },
      {
        title: 'Cyan Ringed Planet Brand & Identity',
        badge: 'Visual Identity',
        desc: 'Unifying the interface with high-fidelity celestial aesthetics, directional lighting, and metallic Cassini-division rings across splash screens, HUD, and compendium.'
      },
      {
        title: 'Universal Interactive Bracket Hyperlinks',
        badge: 'Cross-Linking',
        desc: 'Type [[Article Name]] or [[Rule Keyword]] anywhere in journals, encounter dockets, or comms channels to generate instant clickable dossiers and AI prompt ingestion.'
      },
      {
        title: 'Marching Squares 16-State Autotiler',
        badge: 'Procedural VTT',
        desc: 'Paint walls, blast doors, bulkheads, and terrain in the Tactical Map Maker with automated corner-smoothing and seamless collision geometry.'
      },
      {
        title: 'Clamped 2d10 Resolution Engine [-20, +20]',
        badge: 'Arbitration',
        desc: 'Strict mathematical bounds preventing stat bloat while preserving bell-curve margins of success, double-10 Critical Triumphs, and double-1 Complications.'
      },
      {
        title: 'Architect Directives & Docket Pinning',
        badge: 'GM Tools',
        desc: 'Lead and Co-Architects broadcast encrypted handouts, tactical floor plans, and objective markers directly to player HUDs in real time.'
      }
    ],
    sections: [
      {
        heading: 'Platform Philosophy & Operating Concept',
        content: `Tangent SF RP is built on the principle of **Zero-Friction Immersion**. Traditional tabletop roleplaying games suffer from cognitive overload: tracking hit points across scrap paper, disputing rulebook interpretations, and managing disconnected map software. 

Tangent integrates every aspect of the tabletop lifecycle into a cohesive digital workspace:
- **Instantaneous Rules Adjudication**: Single source of truth with 270 canonical rulebook & modular articles and Bastion AI query citations.
- **Local-First & Cloud-Synced**: Operates offline via indexed browser storage while seamlessly syncing party state and map tokens when online.
- **Modular Studio Architecture**: Jump between the Character Folio, Tactical VTT, Story Weaver, and Planetary Codex in a single click.`
      },
      {
        heading: 'System Topology & Core Modules',
        content: `The application suite is organized into 10 specialized operational studios, accessible via the collapsible left navigation rail or the global spotlight switcher (\`Ctrl+K\`):`
      }
    ]
  },
  {
    id: 'hub',
    num: 1,
    title: 'Operations Hub & Global HUD',
    fullTitle: 'Mission Flight Deck, Status Telemetry & Global HUD Bar',
    badge: 'Command Center',
    color: '#06b6d4',
    iconName: 'Compass',
    sixW: [
      'Active players, campaign coordinators, and system administrators.',
      'The central mission flight deck, party telemetry dashboard, marquee news ticker, and application launchpad.',
      'Anchored persistently at the root route (/) and framed by the global top status bar and bottom dock.',
      'Utilized upon initial mission deployment and continuously between tactical operations as the command center.',
      'To maintain unbroken party situational awareness, deliver real-time emergency broadcasts, and switch between tools instantly.',
      'Operated via the pinned collapsible navigation rail, global command palette (Ctrl+K), and interactive status indicators.'
    ],
    lead: 'The Operations Hub (/) serves as the main flight deck and situational briefing center. Whether organizing a squad for a deep-space derelict salvage or launching into worldbuilding, the Hub unifies party health, communications, and quick-launch gateways.',
    sections: [
      {
        heading: 'Persistent Global HUD & Telemetry',
        content: `The top HUD bar remains anchored across every screen in the Tangent suite, providing instant access to vital system states:
- **Active Persona Widget**: Displays your current character portrait, name, and current health/strain indicators. Clicking opens the Persona Folio.
- **Quick Dice Roller**: Tap the polyhedral dice icon or hit \`Alt+D\` to deploy the 2d10 roller dock with one-click modifier chips.
- **System Audio Mixer**: Toggle ambient drones, tactical terminal interface beeps, and audio alerts without opening settings.
- **Settings & API Configuration**: Quick gear icon (\`⚙️\`) to configure Gemini API credentials, WebGPU hardware acceleration, and UI themes.`
      },
      {
        heading: 'Marquee Ticker & Emergency Broadcasts',
        content: `The dynamic marquee news ticker spans the hub header, broadcasting active campaign bulletins, world lore rumors, and Architect directives. Administrators can customize the text, cycle through preset speeds, and toggle color palettes (Cyan, Emerald, Amber, Crimson) directly from the Broadcast Manager.`
      },
      {
        heading: 'Left Navigation Rail & Quick Launch',
        content: `The navigation rail provides instant access to every studio. Hovering expands the rail with contextual tooltips and keyboard shortcuts. Click the pin icon at the top to lock the rail in open mode, or unpin to maximize screen real estate during combat encounters.`
      }
    ],
    proTips: [
      'Press Ctrl+K from anywhere in the app to open the Spotlight Omni-Search and jump directly to any article, character, or map.',
      'The HUD health bar flashes amber when Strain exceeds 50% and pulses crimson when Critical Wound thresholds are breached.',
      'Custom broadcast messages set by the Lead Architect are cached locally so players immediately receive orders upon reconnecting.'
    ],
    hotkeys: [
      { key: 'Ctrl + K', action: 'Open Spotlight Omni-Search' },
      { key: 'Alt + D', action: 'Toggle Polyhedral Dice Dock' },
      { key: 'Alt + H', action: 'Navigate to Operations Hub' },
      { key: 'Alt + G', action: 'Open Comprehensive User Guide' },
      { key: 'Esc', action: 'Close active drawer or modal' }
    ]
  },
  {
    id: 'folio',
    num: 2,
    title: 'Persona Folio & Guided Creator',
    fullTitle: 'Operative Character Dossier, Tactical Play HUD & Creation Wizard',
    badge: 'Hero Manager',
    color: '#0ea5e9',
    iconName: 'Users',
    sixW: [
      'Operatives crafting distinct heroes and Architects managing active squad and NPC rosters.',
      'A high-fidelity digital character dossier, live play sheet, and 6-step guided character creation wizard.',
      'Found within the Folio interface (/folio) and accessible directly from the HUD active persona widget.',
      'Accessed during initial operative conception, level progression, gear equipping, and live combat turns.',
      'To automate derived statistic calculations, enforce rulebook point caps, and execute one-click roll checks without manual calculation errors.',
      'Interacted with through tabbed dossiers, point-allocation builders, drag-and-drop inventory, and the Bastion Guided Creator modal.'
    ],
    lead: 'The Persona Folio is your complete operative management suite. It bridges rigorous character progression with live tactical utility, calculating complex derived statistics while presenting a streamlined combat HUD for split-second decisions.',
    sections: [
      {
        heading: 'Core Attributes & Derived Statistics',
        content: `Characters are defined by **6 Core Attributes** (human baseline \`0\`), each coupled with a specialized **Sub-Attribute / Saving Throw**:
- **Strength (STR) / Might**: Physical power, carrying capacity, melee force, and grapple checks.
- **Agility (AGI) / Reflex**: Dexterity, fine motor control, balance, initiative, and dodge evasion.
- **Stamina (STA) / Fortitude**: Physical endurance, cellular resilience, base Toughness, and resistance to shock, poison, and disease.
- **Intellect (INT) / Reason (Logic)**: Deductive logic, technical aptitude, memory, hacking, and arcane/psychic computation.
- **Wisdom (WIS) / Willpower**: Intuition, spatial awareness, mental defense, fear resistance, and divine/cosmic grit.
- **Presence (PRE) / Influence (Etiquette)**: Social magnetism, leadership, command authority, diplomacy, and negotiation poise.

**Automated Derived Metrics**:
- **Vitality Points**: Base \`30\` (non-lethal stamina & luck buffer; \`+2\` per \`1 CP\`, max purchased increase \`5 x STA\`).
- **Health Points**: Base \`30\` (physical trauma & structural integrity; \`+2\` per \`1 CP\`, max purchased increase \`5 x STA\`).
- **Structure Points**: Base \`60\` for Synthetics (replaces biological Vitality/Health split).
- **Toughness**: Determined directly from **Stamina (STA)** score, reducing incoming wound damage point-for-point.
- **Perception**: Derived from \`Intellect + Wisdom\`, combined with \`Alertness\` (Default \`+10\`).
- **Initiative Rating**: Rolled as \`2d10 + Reflex Save + Agility Mod\`.`
      },
      {
        heading: '6-Step Bastion Guided Creator',
        content: `Building a balanced operative is effortless with the integrated Guided Creator wizard:
1. **Concept & Identity**: Select Operative Name, Call-sign, Pronouns, and narrative background archetype.
2. **Species Selection**: Choose from canonical species (Human, Synthetics, Jovian Uplift, Xenomorph Crossbreeds) with auto-applied biological traits.
3. **Origin & Background**: Establish homeworld, upbringing, and formative years, granting starting skill bonuses and cultural perks.
4. **Career & Occupation**: Select profession (Combat Mercenary, Net Infiltrator, Void Pilot, Nano-Surgeon) to grant career skill allocations.
5. **Attribute Allocation**: Distribute attribute points with live point-cap enforcement preventing invalid sheets.
6. **Gear, Weapons & Augmentations**: Equip starting credits in ballistic weapons, composite armor, cybernetic interfaces, and consumables.`
      },
      {
        heading: 'Tactical Play View',
        content: `During live combat, switch to the Tactical Play HUD. This dense layout replaces narrative tabs with quick-action weapon chips, consumable stim injectors, dynamic hit-location armor damage tracking, and reactive defensive dodge buttons.`
      }
    ],
    proTips: [
      'Clicking any Skill or Attribute label in the Folio immediately dispatches a 2d10 check to the dice dock with modifiers pre-filled.',
      'Equipping heavy armor automatically deducts the Armor Penalty from Agility checks while boosting Kinetic and Energy damage absorption.',
      'Use the Property Tab to manage personal starships, weaponized vehicles, orbital safehouses, and automated fabrication facilities.'
    ],
    hotkeys: [
      { key: 'Alt + F', action: 'Open Persona Folio' },
      { key: 'Alt + 1-9 / 0', action: 'Switch Folio dossier tabs' },
      { key: 'Click Stat', action: 'Instant 2d10 attribute check' }
    ]
  },
  {
    id: 'dbm',
    num: 3,
    title: 'Omnicortex DBM & Compendium',
    fullTitle: 'Master Rules Compendium, 270 Canonical Articles & Relational DBM',
    badge: 'Rules Compendium',
    color: '#10b981',
    iconName: 'Database',
    sixW: [
      'Operatives referencing rules, Architects adjudicating disputes, and creators researching setting lore.',
      'The definitive relational database and 270-article master rules compendium for the Tangent universe.',
      'Located in the Compendium view (/compendium) within the Omnicortex DBM module.',
      'Consulted whenever rules questions emerge, during session preparation, and while studying alien species and faction profiles.',
      'To provide an unambiguous, immutable single source of truth across all 1.00 Operator rules and 5.00 Architect matrices.',
      'Explored using dual-rail category tabs, fuzzy full-text search, bracket hyperlinks ([[Topic]]), and Bastion AI natural-language querying.'
    ],
    lead: 'The Omnicortex DBM is the living encyclopedia and computational heart of Tangent. It organizes all 270 canonical rulebook documents into two distinct perspectives—1.00 Operator Core Rules for players, and 5.00 Architect Modular Matrices for game masters.',
    sections: [
      {
        heading: 'The 270 Canonical Compendium Articles',
        content: `All game rules are synchronized build-time into immutable, high-speed markdown documents cached in the browser:
- **1.00 Operator Core Rules (224 Articles across 14 Master Volumes)**: Covers foundational player mechanics, 2d10 core resolution, 6 core attributes, 48 archetypes, 84 species across 10 lineages, 41 factions, 11 origins, 13 occupations, 101 skills, 284 features, hindrances, 14-tier scaling, Economatrix, tactical combat, and 6 metaphysics disciplines.
- **5.00 Architect Modular Matrices (46 Articles across 9 Master Matrices)**: In-depth worldbuilding and GM adjudication matrices, including Economic Unified Field Theory, Modular Character/Species/Faction/Companion/Planetary Matrices, Technology Forge Protocols (Weaponry, Armor, Equipment, Augmentations, Mecha, Architecture), and Invocation/Meta-Tech Matrices.`
      },
      {
        heading: 'Dual-Rail Drawer & Sequential Reading',
        content: `The compendium navigation rail separates Operator rules (Emerald 📘) and Architect matrices (Amber 🏛️), with the User Guide (Cyan 🪐) positioned directly adjacent. Features include:
- **Canonical vs Alphabetical Sorting**: Toggle between numerical canonical rule order (\`1-9\`) or alphabetical index (\`A-Z\`).
- **Cross-Tab Sequential Bridging**: Seamlessly transition from Operator rules directly into Architect matrices and into the User Guide using keyboard shortcuts (\`Alt+Left\` / \`Alt+Right\`).
- **Fuzzy In-Memory Search**: Instantly matches article titles, rule mechanics, designer notes, and tags.`
      },
      {
        heading: 'Interactive Bracket Hyperlinks & AI Ingestion',
        content: `Anywhere in the application—including personal notes, chat channels, and scenario text—typing \`[[Article Name]]\` (e.g. \`[[Combat Arbitration]]\`) automatically transforms the text into an interactive, clickable chip that opens the exact rule dossier. When sending prompts to Bastion AI or AIME, bracket hyperlinks are automatically scanned and their full canonical rule text is injected into the AI context window!`
      }
    ],
    proTips: [
      'Use Alt+Left and Alt+Right to flip between consecutive rulebook chapters without opening the sidebar drawer.',
      'In Architect Dev Mode (Admin), you can edit compendium articles, add positive/negative AI guidance keywords, and export custom seed JSON packages.',
      'Every compendium entry includes separate sections for Overview Lore, Bastion Game Mechanics, Step-by-Step Gameplay Guides, and Architect Designer Notes.'
    ],
    hotkeys: [
      { key: 'Alt + C', action: 'Open Rules Compendium' },
      { key: 'Alt + Left', action: 'Navigate to Previous Rulebook Article' },
      { key: 'Alt + Right', action: 'Navigate to Next Rulebook Article' },
      { key: '[ / ]', action: 'Toggle Omnicortex category drawer' },
      { key: '[[keyword]]', action: 'Create interactive rulebook hyperlink' }
    ]
  },
  {
    id: 'codex',
    num: 4,
    title: 'Codex & Economatrix Studios',
    fullTitle: 'Planetary Design, Civilization Scaling & Economatrix Worldbuilding',
    badge: 'Matrix Suite',
    color: '#f59e0b',
    iconName: 'Sparkles',
    sixW: [
      'Worldbuilders, lore architects, campaign directors, and economic planners.',
      'A parametric worldbuilding suite encompassing technology scaling, planetary design, civilization staging, and galactic trade economies.',
      'Situated in the Codex studio interface (/codex).',
      'Employed during campaign world generation, planetary survey creation, and equipment tier balancing.',
      'To establish mathematically grounded planetary ecologies, realistic trade wealth ratings, and balanced sci-fi technology tiers.',
      'Configured through parametric studio sliders, automated formula panels, and JSON blueprint export utilities.'
    ],
    lead: 'The Codex & Economatrix studio empowers Architects to construct entire star systems with scientific rigor and narrative flair. From atmospheric density calculations to planetary wealth curves, the Codex guarantees internally consistent worldbuilding.',
    sections: [
      {
        heading: 'Planetary Design Configurator',
        content: `Generate and calibrate terrestrial, gas, and void environments with realistic astrophysics:
- **Orbital Class & Solar Radiation**: Calibrate star type (F, G, K, M, Dwarf) and habitable zone distance.
- **Surface Gravity & Atmosphere**: Sliders adjust atmospheric pressure (Void, Trace, Thin, Standard, Dense, Supercritical) and surface gravity (0.0g to 3.5g). Gravitational variance automatically applies movement and encumbrance modifiers to operative sheets.
- **Biomes & Hydrosphere**: Allocate surface ocean percentages and climate zones (Arid Wastes, Cryo-Tundra, Volcanic Calderas, Subterranean Bio-Caverns).`
      },
      {
        heading: 'Economatrix Studio & Wealth Scoring',
        content: `Economatrix standardizes trade and resource scarcity across interplanetary civilizations:
- **Wealth Ratings (0 to 10)**: Replaces cumbersome bean-counting with abstract wealth tiers. Operatives with Wealth 4 can purchase everyday rations and ammunition without deducting credits, requiring rolls only for major capital investments.
- **Planetary Trade Specializations**: Define planetary economic outputs (Industrial Fabrication, Bio-Pharma, Helium-3 Fuel Extraction, Agricultural Breadbaskets) to calculate automated price inflation and black-market contraband markups.`
      },
      {
        heading: 'Architecture Blueprint Configurator',
        content: `Design tactical combat facilities, starship deckplans, and planetary settlements:
- **Structural Integrity (SI)**: Calculate blast resistance, decompression sealing, and hull breach thresholds.
- **Security Grids**: Configure automated laser sentry turrets, biometric bulkhead locks, and fire suppression systems for use in tactical scenarios.`
      }
    ],
    proTips: [
      'Export planetary blueprints directly into Story Foundry encounter anchors to instantly populate tactical mission environmentals.',
      'Planets with Toxic or Corrosive atmospheres automatically require operatives to equip sealed hazard suits or suffer cumulative Strain.',
      'The Scaling Studio allows seamless translation between personal combat scale, vehicular scale, and capital starship fleet engagements.'
    ],
    hotkeys: [
      { key: 'Alt + X', action: 'Open Codex Studio' },
      { key: 'Ctrl + S', action: 'Save current planetary blueprint' }
    ]
  },
  {
    id: 'story',
    num: 5,
    title: 'Story Foundry & Adventure Engine',
    fullTitle: 'Story Weaver Node Graph, Branching Scenarios & Mission Cockpit',
    badge: 'Adventure Engine',
    color: '#a855f7',
    iconName: 'Layers',
    sixW: [
      'Campaign Architects, narrative directors, and solo storytellers.',
      'An advanced scenario authoring platform featuring visual node graphs, branching decisions, encounter anchors, and a live story simulator.',
      'Accessed within the Story Foundry workspace (/foundry/story).',
      'Utilized during adventure drafting, plot pacing optimization, and live session directive management.',
      'To construct living, non-linear adventures that react dynamically to player choices while keeping GM prep organized.',
      'Constructed via the Story Weaver node canvas, AIME 3-tier prompting, contextual encounter anchors, and the simulation deck.'
    ],
    lead: 'The Story Foundry turns campaign preparation into a visual, dynamic experience. By linking narrative scenes, tactical maps, combat encounters, and NPC dialogues into an interactive node graph, Architects can run complex, reactive sandbox campaigns with zero panic.',
    sections: [
      {
        heading: 'Story Weaver Visual Node Canvas',
        content: `Draft campaigns as modular, branching narrative flowcharts:
- **Scene Nodes**: Narrative beats containing descriptions, GM read-aloud boxed text, secret Architect notes, and environmental triggers.
- **Choice & Decision Connectors**: Link scenes with conditional prerequisites (e.g. Requires \`[[Hack Security Console]]\` or \`Bribe Guard >= 200cr\`).
- **Encounter Anchors**: Directly embed tactical maps, enemy token groups, and trap hazards inside a scene node for one-click deployment during live play.`
      },
      {
        heading: 'Encounter Anchors & Asset Manifests',
        content: `Story Foundry enforces a strict **Manifest-Only Architecture**: maps and NPC stat blocks remain pristine templates in the database, while the scenario simply references them with custom overrides (e.g. "Security Guard Token with +2 Plasma Rifle and Damaged Armor"). This ensures map assets are 100% reusable across multiple distinct campaigns.`
      },
      {
        heading: 'Live Play Simulator & Cockpit',
        content: `Before running a scenario for your players, open the Graph Play Simulator. Walk through narrative branches, roll simulated 2d10 skill checks, trigger hidden traps, and test encounter lethality to verify your adventure flows smoothly.`
      }
    ],
    proTips: [
      'Right-click any node in the Story Weaver canvas to deploy AIME Brainstorming and generate three unexpected plot twists instantly.',
      'Use the Scenario Cockpit Dock to track party location in real-time on your GM screen without revealing the map to players prematurely.',
      'Export completed scenario modules as standalone .story packages to share with other Game Masters or archive for future runs.'
    ],
    hotkeys: [
      { key: 'Alt + S', action: 'Open Story Foundry' },
      { key: 'Space + Drag', action: 'Pan Story Weaver node canvas' },
      { key: 'Scroll Wheel', action: 'Zoom node graph around cursor' },
      { key: '[ / ]', action: 'Toggle Outliner / Inspector drawers' },
      { key: 'Ctrl + Z / Y', action: 'Undo / Redo scenario tree changes' }
    ]
  },
  {
    id: 'maps',
    num: 6,
    title: 'Tactical Map Maker & VTT Deck',
    fullTitle: 'Tactical Map Maker, Marching Squares Auto-Tiling & Stage Deck',
    badge: 'Virtual Tabletop',
    color: '#38bdf8',
    iconName: 'Map',
    sixW: [
      'Lead Architects directing combat scenes and Operatives maneuvering tactical unit tokens.',
      'A real-time 2D/isometric virtual tabletop equipped with marching squares auto-tiling, dynamic line-of-sight occlusion, and interactive smart props.',
      'Found in Map Maker (/foundry/map) and the live combat Stage Workspace.',
      'Engaged during tactical combat encounters, boarding actions, dungeon exploration, and stealth infiltrations.',
      'To deliver precise spatial immersion, automate line-of-sight fog-of-war, and adjudicate cover and movement penalties accurately.',
      'Controlled with mouse terrain brushes, collision wall pens, prop placement tools, and drag-and-drop token handles.'
    ],
    lead: 'The Tactical Map Maker delivers a high-performance 2D/isometric virtual tabletop engineered for fast tactical combat. Featuring procedural auto-tiling, line-of-sight occlusion, and multiplayer token synchronization, tactical engagements feel snappy and decisive.',
    sections: [
      {
        heading: '16-State Marching Squares Auto-Tiling',
        content: `Building battle maps is lightning fast thanks to procedural tile blending:
- **Terrain Brushes**: Paint steel bulkheads, toxic bio-sludge, starship decking, or craggy asteroid terrain.
- **Automated Corner Smoothing**: The 16-state marching squares algorithm automatically generates clean outer corners, inner bevels, wall caps, and borders without needing manual tile selection.`
      },
      {
        heading: 'Collision Walls, Doors & Occlusion',
        content: `Control line of sight and token navigation with dedicated wall vectors:
- **Solid Walls**: Completely block line-of-sight and physical movement. Tokens cannot see through or traverse solid wall vectors.
- **Interactive Doors**: Draw door segments that toggle between **Open** (clear vision and passage), **Closed** (blocks vision, can be interacted with), and **Locked** (requires security bypass check).
- **Window & Forcefield Barriers**: Allow full line of sight for ranged attacks while blocking physical token movement.`
      },
      {
        heading: 'Smart Props & Interactive Traps',
        content: `Scatter functional tactical props onto the battlefield:
- **Laser Tripmine**: Triggers explosive plasma burst when an operative token crosses its tripwire vector.
- **Surveillance Camera**: Rotates on a timer, sounding alarm and pinging enemy reinforcements if tokens enter its scanning cone.
- **Terminal Consoles**: Interactive hack points that disable environmental security or unlock blast doors upon a successful Tech check.`
      }
    ],
    proTips: [
      'Hold Shift while dragging a token to measure distance in meters with automated terrain movement penalties applied.',
      'Press G to toggle grid visibility, and M to deploy the freeform laser measurement ruler.',
      'Tokens with the Concealed or Camouflaged status are automatically rendered translucent to players without high enough Perception.'
    ],
    hotkeys: [
      { key: 'Alt + M', action: 'Open Tactical Map Maker' },
      { key: 'G', action: 'Cycle tactical grid mode (Hex / Square / Off)' },
      { key: 'M', action: 'Deploy tactical laser rangefinder' },
      { key: 'V / H / F / B', action: 'Select / Pan / Fog / Chunk Stamp tools' },
      { key: 'Shift + Drag', action: 'Measure token movement trajectory' },
      { key: 'Middle Click / Space', action: 'Pan tactical map viewport' },
      { key: '?', action: 'Toggle Map Maker Hotkeys Legend' }
    ]
  },
  {
    id: 'aime',
    num: 7,
    title: 'AIME Intelligence & Element Forge',
    fullTitle: 'Narrative AI Co-Architect, Super Prompt Synthesizer & Element Forge',
    badge: 'AI & Lore Forge',
    color: '#ec4899',
    iconName: 'Cpu',
    sixW: [
      'Architects needing instant creative synthesis and game masters forging customized setting elements.',
      'An integrated narrative AI assistant and custom asset forge for generating NPCs, monsters, weaponry, cybernetics, and environmental traps.',
      'Located in the AIME Studio (/foundry/aime) and contextual Element Forge dialogs.',
      'Engaged during prep when brainstorming unique adversaries, designing exotic relics, or generating unexpected scenario twists.',
      'To eliminate creative fatigue and output rules-compliant, compendium-ready assets in seconds.',
      'Harnessed through guided prompt templates, recursive lorebook context injection, and one-click database compilation.'
    ],
    lead: 'AIME (Artificial Intelligence Narrative Engine) acts as your creative co-pilot. Grounded strictly in canonical Tangent game rules and setting lore, AIME synthesizes fully statted NPCs, tactical traps, planetary encounters, and story twists in seconds.',
    sections: [
      {
        heading: 'AIME 3-Tier Architecture',
        content: `AIME routes generation requests based on hardware availability and complexity:
- **Tier 1 (Fast Local Brainstorming)**: Instant NPC names, tactical call-signs, loot tables, and quick descriptions using lightweight models.
- **Tier 2 (Deep Tactical Balancing)**: Full stat block synthesis, calculating weapon damage curves, armor ratings, and combat scripts.
- **Tier 3 (Comprehensive Worldbuilding)**: Large-scale planetary civilization histories, branching scenario outlines, and faction political intrigue.`
      },
      {
        heading: 'Recursive Lorebook Injection',
        content: `Unlike generic AI chatbots that hallucinate rules, AIME utilizes **Dynamic Lorebook Scanning**. When you ask AIME to generate an encounter involving the "Vorash Cartel on an Acid Moon", AIME automatically scans the compendium for related factions, environmental hazard rules, and weapon matrices, injecting them into the system prompt to guarantee 100% mechanical fidelity.`
      },
      {
        heading: 'Element Forge & Custom Compilation',
        content: `Create custom assets through the Element Forge dialogs:
- **NPC & Adversary Forge**: Define Combat Roles (Brute, Sniper, Infiltrator, Commander), AI behavioral states, and special features.
- **Weaponry & Cybernetic Forge**: Balance custom energy weapons and cyberware implants with automated point-cost calculation.
- **Compile to DBM**: One-click export saves your custom creations directly into the Omnicortex DBM for immediate use across character folios and maps.`
      }
    ],
    proTips: [
      'Type [[Species Name]] or [[Faction]] directly in your AIME prompt to force the AI to ground its narrative in that specific lore article.',
      'Configure your personal Gemini API key in User Settings to unlock ultra-high-speed Tier 3 narrative generation with zero rate limits.',
      'Use the "Regenerate with Twist" button in AIME brainstorm tabs to get alternate scenario directions with darker or more cosmic themes.'
    ],
    hotkeys: [
      { key: 'Alt + A', action: 'Open AIME Assistant' },
      { key: 'Ctrl + Enter', action: 'Submit prompt to AIME' }
    ]
  },
  {
    id: 'comms',
    num: 8,
    title: 'CommLink Relays, Squads & Dockets',
    fullTitle: 'Tactical Radio Relays, Squad Roster & Lead Architect Directive Dockets',
    badge: 'Comms Relay',
    color: '#3b82f6',
    iconName: 'Radio',
    sixW: [
      'Squad members, Lead Architects, Co-Architects, and tactical operatives.',
      'An encrypted multi-channel tactical comms relay, party roster management console, and Architect directive board.',
      'Situated in the Comms interface (/comms) and Squads hub (/squads).',
      'Active continuously during gaming sessions for in-character transmissions, tactical whispers, and mission handouts.',
      'To facilitate atmospheric roleplay communications, distribute secret GM intel, and manage team permissions securely.',
      'Operated through frequency selector channels, direct operative whispers, tactical pins, and the Architect Docket.'
    ],
    lead: 'CommLink Relay combines in-character immersion with multiplayer campaign management. Facilitating encrypted chat frequencies, live squad roster tracking, and Lead Architect directive pinning, your gaming group stays completely in sync.',
    sections: [
      {
        heading: 'Encrypted Multi-Channel Frequency Bands',
        content: `CommLink organizes communications into dedicated tactical frequencies:
- **Global Broadcast Frequency**: General out-of-character campaign chat, scheduling, and system announcements.
- **Squad Tactical Comms**: In-character operational channel. Messages are automatically styled with operative call-signs, audio beeps, and avatar badges.
- **Encrypted Whispers**: Secure 1-on-1 private transmissions between specific operatives or between an operative and the GM.
- **Architect GM Frequency**: Secret channel for the Lead Architect and Co-Architects to coordinate encounters and backstage events.`
      },
      {
        heading: 'Architect Docket & Handout Pinning',
        content: `Lead and Co-Architects can pin mission briefings, blueprints, intercepted transmissions, and evidence photos directly to the top of any channel feed. Pinned items feature one-click expansion, interactive image inspection, and persistent player access.`
      },
      {
        heading: 'Squad Management & Multi-Persona Binding',
        content: `In the Squads Hub (/squads), campaign organizers can manage party roles:
- **Lead Architect & Co-Architects**: Full control over map scenes, NPC placement, docket pins, and rulebook modifications.
- **Operatives**: Standard player permissions tied to their claimed character sheets.
- **Multi-Persona Binding**: Players can switch active personas on the fly for campaigns featuring multiple party members or drone companions.`
      }
    ],
    proTips: [
      'Use the /roll command directly in Comms chat to execute transparent dice checks visible to the entire squad.',
      'Lead Architects can use the /whisper <callsign> command to deliver private psionic visions or sensory hallucinations to a single player.',
      'Pinned dockets persist across sessions, ensuring players always have access to mission directives when logging back in.'
    ],
    hotkeys: [
      { key: 'Alt + R', action: 'Toggle CommLink Relay Dock' },
      { key: 'Enter', action: 'Send transmission (Shift + Enter for newline)' },
      { key: 'Tab / Up / Down', action: 'Autocomplete slash commands (/roll, /whisper)' }
    ]
  },
  {
    id: 'dice',
    num: 9,
    title: '2d10 Dice Engine & Arbitration',
    fullTitle: '2d10 Dual-Die Probability, Clamped Modifiers [-20, +20] & Target Numbers',
    badge: 'Dice & Arbiter',
    color: '#eab308',
    iconName: 'Dices',
    sixW: [
      'Every operative and Game Master making skill checks, attack rolls, and hazard saves.',
      'The core mathematical arbitration engine driving all probability calculations, target number checks, and critical determinations.',
      'Triggered via the global Polyhedral Dice Dock (Alt+D), inline chat /roll commands, or one-click Folio stat chips.',
      'Called upon whenever a character attempts an uncertain, risky, or contested action.',
      'To deliver transparent, non-linear probability curves with distinct Critical Triumph (Double 10s) and Critical Complication (Double 1s) outcomes.',
      'Executed by rolling two ten-sided dice (2d10) plus Attribute and Skill modifiers, clamped within the canonical [-20, +20] range against a Target Number (TN).'
    ],
    lead: 'The 2d10 Resolution Engine is the mathematical foundation of Tangent. Replacing swingy d20 linear rolls with a natural bell-curve distribution (peaking at 11), results emphasize professional competency while rewarding tactical foresight.',
    sections: [
      {
        heading: 'Core Resolution Formula & Target Numbers',
        content: `All actions in Tangent are arbitrated using a standard mathematical check:
\`\`\`
Check Result = Die 1 (1d10) + Die 2 (1d10) + Attribute + Skill + Circumstance Modifiers
\`\`\`
If the Check Result meets or exceeds the **Target Number (TN)**, the action succeeds:
- **Routine (TN 10)**: Standard operating tasks under calm conditions.
- **Moderate (TN 14)**: Challenging tasks attempted under time pressure or battlefield fire.
- **Challenging (TN 18)**: High-difficulty actions requiring specialized expertise or equipment.
- **Extreme (TN 22)**: Heroic feats pushing human and synthetic capabilities to their limits.
- **Near-Impossible (TN 26)**: Legendary achievements altering the course of a campaign.`
      },
      {
        heading: 'Critical Triumphs & Complications',
        content: `The dice engine identifies natural double rolls regardless of modifiers:
- **Critical Triumph (Double 10s - Natural 20)**: Automatic spectacular success! Generates bonus combat damage, resets operative strain, or creates cinematic tactical advantages.
- **Critical Complication (Double 1s - Natural 2)**: Automatic failure with complications! Triggers weapon jams, power supply overloads, structural collapses, or sensory disorientations.`
      },
      {
        heading: 'Margin of Success & Clamped Modifiers [-20, +20]',
        content: `The difference between your check result and the TN is your **Margin of Success (MoS)**:
- **MoS +0 to +3**: Basic Success.
- **MoS +4 to +7**: Superior Success (bonus damage or reduced action time).
- **MoS +8+**: Exceptional Masterwork Success.

**Ad-Hoc Modifier Limits**: To prevent mathematical overflow, all situational modifiers (cover, visibility, recoil, status buffs) are strictly clamped within the range \`[-20, +20]\`.`
      }
    ],
    proTips: [
      'The Polyhedral Dice Dock includes one-click chips for common tactical modifiers (+2 Aim, -4 Blind Fire, +3 Heavy Cover).',
      'Click the History button in the Dice Dock to review previous rolls with full mathematical breakdowns and timestamps.',
      'In contested rolls (e.g. Stealth vs Perception), the operative with the higher Margin of Success wins the exchange.'
    ],
    hotkeys: [
      { key: 'Alt + D', action: 'Toggle Polyhedral Dice Dock' },
      { key: 'Space (in dock)', action: 'Re-roll previous dice formula' },
      { key: 'Esc', action: 'Close dice roller' }
    ]
  },
  {
    id: 'shortcuts',
    num: 10,
    title: 'Hotkeys, Audio & System Preferences',
    fullTitle: 'Master Keyboard Navigation, Soundscape Audio & System Preferences',
    badge: 'Hotkeys & Admin',
    color: '#6366f1',
    iconName: 'Terminal',
    sixW: [
      'Every user seeking maximum interface responsiveness and personalized workspace configuration.',
      'A master repository of global keyboard shortcuts, reactive soundscape controls, hardware GPU telemetry, and API key management.',
      'Configured through User Settings (⚙️ on HUD) and active across the entire application suite.',
      'Referenced continuously to accelerate navigation speed and tailor audio-visual accessibility.',
      'To allow power users to manipulate complex game systems with zero mouse latency.',
      'Adjusted via preference toggles, audio mixer sliders, API credential inputs, and hotkey combinations.'
    ],
    lead: 'Tangent is designed for keyboard-driven power users. By mastering global hotkeys and tailoring your audio-visual preferences, you can command complex multi-studio operations with zero hesitation.',
    sections: [
      {
        heading: 'Master Keyboard Shortcuts Directory',
        content: `Memorize these essential keystrokes to navigate the platform at maximum velocity:
| Key Combination | Scope | Action Description |
|---|---|---|
| **Ctrl + K** | Global | Spotlight Omni-Search across all articles, maps, and personas |
| **Alt + D** | Global | Toggle Polyhedral 2d10 Dice Roller Dock |
| **Alt + R** | Global | Toggle CommLink Relay tactical frequency dock |
| **Alt + H** | Global | Jump to Operations Hub command flight deck |
| **Alt + F** | Global | Jump to Persona Folio operative dossier |
| **Alt + C** | Global | Jump to Omnicortex DBM Compendium rules |
| **Alt + X** | Global | Jump to Codex & Economatrix worldbuilding studio |
| **Alt + S** | Global | Jump to Story Foundry scenario weaver |
| **Alt + M** | Global | Jump to Tactical Map Maker virtual tabletop |
| **Alt + A** | Global | Jump to AIME narrative intelligence studio |
| **Alt + G** | Global | Open Comprehensive Platform User Guide |
| **Alt + Left / Right** | Compendium / Guide | Jump to Previous / Next rulebook article or guide chapter sequentially |
| **Alt + 1-9 / 0** | Persona Folio | Switch directly between operative dossier tabs |
| **G** | Map Maker | Toggle tactical battle map grid lines (Hex / Square / Off) |
| **M** | Map Maker | Deploy tactical laser distance measurement tool |
| **V / H / F / B** | Map Maker | Switch to Select (\`V\`), Pan (\`H\`), Fog of War (\`F\`), or Chunk Stamp (\`B\`) tool |
| **Space + Drag** | Maps / Story / Stage | Pan viewport canvas smoothly |
| **Space** | Dice Dock | Re-roll active dice formula when Dice Dock is open |
| **Esc** | Global | Close active modal, dismiss drawer, or cancel action |`
      },
      {
        heading: 'Reactive Soundscape & Audio Mixer',
        content: `Tangent features an atmospheric sci-fi soundscape tailored for tabletop immersion:
- **Terminal Beeps**: Subtle audio feedback confirming UI clicks, drawer toggles, and data saves.
- **Combat Chimes**: Resonant metallic sounds signaling Critical Triumphs and low-frequency pulses warning of Critical Complications.
- **Ambient Drones**: Optional background atmospheric audio for starships, cybernetic cities, and alien ruins.
- You can fine-tune sound effects volume, ambient audio, or mute all sounds entirely via the HUD audio icon or User Settings.`
      },
      {
        heading: 'WebGPU Hardware Telemetry & Cloud API Setup',
        content: `In User Settings (\`⚙️\`), power users can inspect real-time system performance:
- **Live GPU Telemetry**: Monitors GPU rendering vendor, adapter memory, and frame latency for high-density battle maps.
- **Gemini AI API Key**: Enter your personal Google Gemini API key to enable high-speed Tier 3 narrative and worldbuilding generation with zero rate throttling.`
      }
    ],
    proTips: [
      'Pin the left navigation rail using the pin icon to keep studio labels visible without needing to hover.',
      'On mobile devices, swipe inward from the left screen edge to open the navigation drawer instantly.',
      'Your settings, API keys, and compendium reading position are stored locally on your device for instant reload.'
    ],
    hotkeys: [
      { key: '⚙️ (Click)', action: 'Open User Settings & System Telemetry' },
      { key: 'Mute Key', action: 'Toggle master audio volume' }
    ]
  }
];

export default USER_GUIDE_SECTIONS;
