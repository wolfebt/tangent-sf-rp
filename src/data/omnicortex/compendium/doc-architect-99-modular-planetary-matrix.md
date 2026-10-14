---
id: "doc-architect-99-modular-planetary-matrix"
name: "99. MODULAR PLANETARY MATRIX"
fileName: "99. MODULAR PLANETARY MATRIX.md"
relPath: "architect/99. MODULAR PLANETARY MATRIX.md"
isMasterDoc: true
masterDocId: "doc-architect-99-modular-planetary-matrix"
category: "architect_matrix"
parent: "5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)"
order: 21
perspective: "architect"
entry_type: "Architect Matrix"
tl: 3
ml: 0
cost: 0
tags: ["architect","core-rules","source-of-truth","99. modular planetary matrix","matrix"]
updatedAt: "2026-10-14T06:04:05.788Z"
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

# **WORLD-BUILDING FRAMEWORK**

# **The Omni-Structural Codex**

&nbsp;

---

## **Introduction: The Geopolitics of the Void**

In the realm of speculative fiction role-playing games, the construction of a planetary setting is a discipline that transcends mere creative writing; it is an act of "ontological engineering"—the creation of a functional reality that must sustain the weight of mechanical interaction and narrative scrutiny. A planet is not merely a backdrop; it is a "Geophysical Chassis" that dictates the survival conditions, resource scarcity, and cultural evolution of its inhabitants.

Within the Tangent universe, this process is elevated by the concept of "Kinetic Semiotics," where the physical artifacts of a civilization—its vehicles, architecture, and armored shells—serve as tangible manifestations of its cultural ethos. Therefore, the world-building process for Tangent cannot simply be a collection of random terrain features; it must be a rigorous synthesis of geophysical constants and sociological variables. It is the creation of a stage where the "Agnostic Chassis" of physics meets the "Cultural Skin" of factional ideology.

This document synthesizes the Geophysical Chassis guidelines with the Planetary Design Matrix (PDM) to provide a definitive, exhaustively detailed framework. It integrates modular granularity, astrophysical rigor, and narrative fluidity into a unified procedural generation system.

The framework operates on three layers:

1. **The Agnostic Substrate:** The physical reality of the star system, planet, and environment (Gravity, Atmosphere, Hydrology).  
2. **The Technocratic Overlay:** The infrastructure, economy, and legal systems imposed by the inhabitants (Tech Level, Government, Law Level, Economy, Meta Level).  
3. **The Narrative Texture:** The specific cultural and factional aesthetics that give the world its unique "flavor."

### 

### **The Component Hierarchy**

To ensure a World entry functions as a comprehensive setting, it must be constructed using the following six-part hierarchy:

1. **Cosmology & Fundamental Laws:** Defines the "Operating System" of reality (Universal Position, Physics & Metaphysics).  
2. **The Geophysical Chassis (Physical World):** The "Agnostic Substrate" (Stellar Mechanics, Planetary Statistics, Geography).  
3. **Chronological Stratigraphy (History):** The layers of time (Origin Myths, Eras & Cataclysms, Future Fate).  
4. **Biosphere & Demographics (Life):** The "Living Skin" of the planet (Ecology, Sentience).  
5. **Sociological Systems:** The "Cultural Software" (Technology & Metaphysics, Economy, Governance).  
6. **Narrative Aesthetics (Themes):** The "Vibe" and visual identity (Tone, Visual Semiotics).

&nbsp;

&nbsp;

---

---

## **10\. Synthesis: The Tangent World Profile (TWP)**

The Tangent World Profile (TWP) is the alphanumeric DNA of a planet. It utilizes a simple colon-separated numerical string to compress complex geophysical and sociological data into a compact format, allowing Game Masters to generate, record, and reference entire sectors with efficiency.

### 

### **10.1 The Universal World Profile (UWP) Structure**

The TWP is expressed as a string of pure numerical values (and one letter designation for the Starport). Values operate on a 0 to 15 scale.

**The String Sequence:**

Starport:Size:Atmosphere:Hydrography:Population:Government:Law Level:Tech Level:Meta Level

*Example:* A:8:6:7:10:4:5:4:3 (A large, wet, high-tech Syndicate world with moderate law and cultured metaphysics).

### 

### **10.2 Procedural Generation Sequence (The "Build Loop")**

Follow this sequence to construct a world from the void up.

**Mathematical Limits:** No generated UWP value can fall below 0 or exceed 15\. If a formula yields a negative, record 0\. If a formula exceeds 15, record 15\.

* **Step 1: Stellar Context**  
  * *Action:* Roll to determine the Primary Star (Section 1.1) and the Planet's Orbital Zone (Section 1.2).  
  * *Impact:* If the star is Type M (Red Dwarf) or the Zone is Inner/Outer, apply penalties to Atmosphere and Hydrography rolls (typically minus 2 or greater).  
* **Step 2: The Physical Chassis (Size, Atmos, Hydro)**  
  * *Planetary Size (S):* Formula: 2d6 minus 2\. Range: 0 (Asteroid Belt) to 10 (Super Earth). Effect: Sets Gravity Tier and limits Atmosphere.  
  * *Atmosphere (A):* Formula: 2d6 minus 7 plus Size. Constraint: If Size is 0, Atmosphere is 0\. Range: 0 (Vacuum) to 15 (Exotic/Thick).  
  * *Hydrography (H):* Formula: 2d6 minus 7 plus Atmosphere. Constraint: If Size is \< 2, Hydrography is 0\. If Atmosphere is 0 or 1, subtract 4 from Hydrography. Range: 0 (Desert 0%) to 10+ (Water World).  
* **Step 3: The Sociological Skin (Pop, Starport, Gov, Law)**  
  * *Population (P):* Formula: 2d6 minus 2\. (Roll 3d6 minus 2 if designated as a Faction Capital). Range: 0 (Uninhabited) to 15 (Quadrillions). Note: This is a base-10 logarithmic scale.  
  * *The Zero-Pop Override:* If Population is rolled as 0, the world is a Barren wasteland. Starport automatically becomes X, Government becomes 0, and Law Level becomes 0\. Disregard the formulas for these stats.  
  * *Starport (Sp):* Formula: 2d6 minus 7 plus Population. (A result of 0 or less \= X, 1-2 \= E, 3-4 \= D, 5-6 \= C, 7-8 \= B, 9+ \= A).  
  * *Government (G):* Formula: 2d6 minus 7 plus Population. Range: 0 (Anarchy) to 15 (Progenitor Control).  
  * *Law Level (L):* Formula: 2d6 minus 7 plus Government. Range: 0 (Lawless) to 15 (Absolute Suppression). Effect: Determines the "Banned Items" list and the difficulty of "Streetwise" checks.  
* **Step 4: The Factional Overlay Process**  
  * Once the raw world is generated, apply the "Faction Template" to align the math with the narrative. *Note: Faction Mandates are HARD OVERRIDES. They replace the generated math to ensure consistency.*  
  * *The Syndicate:* Mandate: If Pop is less than 8, override and set to 8\. Set Law to 5+ and TL to 4\.  
  * *The Dracon Dynasty:* Mandate: Change Government type to 5 regardless of roll. Increase Structure Points of all buildings by 20%.  
  * *The Coalition:* Mandate: Change Government to 4 or 7\. Reroll Law Levels above 6\. Coalition worlds value independence.  
  * *The Outworlds:* Mandate: Set TL to a maximum of 2, Law to a maximum of 3\. Apply "Scrap-Punk" aesthetic. Reduce effective Wealth of the world by minus 2\.  
* **Step 5: Technocratic Assessment (Tech Level)**  
  * *Base Tech Level (TL):* Baseline is 3 (Standard Interstellar, the most prevalent across 70+% of worlds). Roll 1d6. On a 1, subtract 1 from the Base. On a 6, add 1 to the Base. On a 2-5, the Base remains 3\.  
  * *Modifiers:* Starport A (+1), Starport X/E (-1); Size 0 or 1 (+1); Atmosphere 0-3 or 10+ (+1) (Survival demands tech); Population 10+ (+1); Government 0 (-1), Government 13 (-1).  
  * *Cap:* Floor at 0, Cap at 5\. Faction Overrides take final precedence.  
* **Step 6: Metaphysical Assessment (Meta Level)**  
  * *Base Meta Level (ML):* Formula: 1d6 minus 1\.  
  * *Modifiers:* Alterian Enclave presence (+2), Ascendancy presence (+2), Mekan presence (+1), Syndicate presence (-1), Impyrium presence (-1), Tech Level 0 (+1 for tribal shamanism/superstition).  
  * *Range:* Floor at 0 (Null) to 6 (Deific).

### 

### **10.3 Derived Attributes: Trade Codes**

Trade Codes are tags assigned based on the TWP string. They drive the economic simulation. See Section 5.1 for full code descriptions.

* **Ag (Agricultural):** Atmos 4-9, Hydro 4-8, Pop 5-7  
* **As (Asteroid):** Size 0, Atmos 0, Hydro 0  
* **Ba (Barren):** Pop 0, Gov 0, Law 0  
* **De (Desert):** Hydro 0  
* **Fl (Fluid Oceans):** Atmos 10+, Hydro 1+  
* **Ga (Garden):** Size 5+, Atmos 4-9, Hydro 4-8  
* **Hi (High Pop):** Pop 9+  
* **Ht (High Tech):** TL 4+  
* **Ic (Ice-Capped):** Atmos 0-1, Hydro 1+  
* **In (Industrial):** Atmos 0-2 or 4 or 7 or 9, Pop 9+  
* **Lo (Low Pop):** Pop 1-3  
* **Na (Non-Ag):** Atmos 0-3, Hydro 0-3, Pop 6+  
* **Ni (Non-Ind):** Pop 4-6  
* **Po (Poor):** Atmos 2-5, Hydro 0-3  
* **Ri (Rich):** Atmos 6 or 8, Pop 6-8  
* **Va (Vacuum):** Atmos 0  
* **Wa (Water World):** Hydro 10+

### 

### **10.4 Standard Planetary Record Sheet**

System Name: \[Name\] Sector Coordinates: \[XX, YY\]

Planet Name: \[Name\] TWP String: \[X:0:0:0:0:0:0:0:0\]

#### **GEOPHYSICAL DATA**

Star Type: \[Class O-M\]

Size Class: \[0-15\] Gravity: \[G-Force\]

Atmosphere: \[0-15\] Pressure: \[Type\] Mask Required? \[Y/N\]

Hydrography: \[0-15\] Liquid Type: \[Water/Methane/Magma\]

#### **SOCIOLOGICAL DATA**

Population: \[0-15\] \[Exact Estimate\]

Government: \[0-15\] \[Type Name\]

Law Level: \[0-15\] \[Banned Item Class\]

Tech Level: \[0-5\] \[Era Description\]

Meta Level: \[0-6\] \[Metaphysical State\]

Faction: \[Name\] \[Allegiance Code\]

#### **ECONOMIC PROFILE**

Trade Codes: \[Ag, Ni, Ri, etc.\]

Primary Export: \[Commodity\]

Primary Import: \[Commodity\]

Starport Class: \[A-X\] Facilities: \[Fuel/Repair/Shipyard\]

#### **CULTURAL NOTES**

Aesthetic: \[Architecture Style\]

Social Quirk: \[Behavior/Taboo\]

Major Landmark: \[Name & Description\]

### 

### **10.5 Ludo-Narrative Validation Checklist**

Before concluding the world-building process, verify the integration of your planet's mechanics and narrative details using this checklist:

* **Trade Code Math:** Are the applied Trade Codes (e.g., Ag, Ind, Hi) mathematically supported by the UWP generation scores?  
* **Faction Alignment:** Does the generated Tech Level (TL) and Meta Level (ML) accurately reflect the controlling Faction's mandated baselines, utilizing the Hard Overrides?  
* **Law Level vs. Architecture:** Are the local laws directly reflected in the visual aesthetics? (e.g., Does a strict Police State feature hidden black-market areas rather than open bazaars?)  
* **Market Economics:** Are the items natively available for purchase physically restricted by the Market Availability Cap formula: (Planetary TL \* 5\) \+ 10?  
* **Metaphysical Geography:** If the planet features a Meta Level (ML) of 4 or higher, are there clear Anomalous Geography features manifesting as environmental variables?  
* **Scale Integrity:** If the world is High Gravity or a Water World, have the native creatures been properly enhanced using the Scaling Multiplier (x2 to x10)?

&nbsp;

&nbsp;

---

## **11\. WORLD TEMPLATE**

*\[Instructions: Copy the block below and replace bracketed text to create your official world document.\]*

### **\[WORLD NAME\]**

**TWP String:** \[X:0:0:0:0:0:0:0:0\]

**Sector Coordinates:** \[XX, YY\]

**Slang/Aliases:** \[e.g., "The Rustball," "Garden's Edge"\]

**Core Premise:** \[One-sentence high-concept pitch. e.g., "A jungle world grown over a dead Necropolis."\]

**Factional Alignment:** \[Primary Faction or Independent status\]

#### 

#### **1\. Cosmology & Laws**

* **World Name:** \[Official Designation\]  
* **Cosmology:** \[Location in the universe. e.g., Sector Coordinates, "The Outer Rim."\]  
* **Laws of Physics:** \[Standard? High-Gravity? Time Dilation? Exotic?\]

**The Magic System (Metaphysics)**

* **Meta Level (ML):** \[0-6\] | \[Descriptor, e.g., Null, High-Fantasy\]  
* **Source of Power:** \[Where does magic come from? Ley lines? Crystals? The Void?\]  
* **Rules & Limitations:** \[What are the costs? Sanity loss? Physical fatigue? Rare reagents?\]  
* **Societal Impact:** \[How is magic viewed? Feared? Industrialized? Worshipped?\]

#### 

#### **2\. The Physical World (Geophysical Data)**

* **Star System:** \[Star Type (e.g., Red Dwarf Class M), Number of Planets.\]  
* **Planetary Statistics:**  
  * **Size Class:** \[0-15\] | **Gravity:** \[e.g., Large / 1.5G (Heavy)\]  
  * **Day Length:** \[e.g., 30 Standard Hours\]  
  * **Atmosphere:** \[0-15\] | **Pressure/Type:** \[e.g., Toxic, Thin\] | **Mask Required?:** \[Y/N\]  
  * **Hydrography:** \[0-15\] | **Liquid Type:** \[Water/Methane/Magma\]  
* **Moons:** \[Number, names, and their tidal/cultural effects.\]  
* **Global Geography:** \[Continents, Oceans, and major biomes. Note any Anomalous Geography for ML 4+.\]  
* **Weather & Tectonics:** \[Climate stability, storms, fault lines, currents.\]

#### 

#### **3\. Global History**

* **Creation Myth / Origin:** \[How life/civilization began here.\]  
* **Timeline of Major Ages:** \* **World-Altering Events:** \[Cataclysms, wars, or plagues that changed everything.\]  
* **Fallen Empires / Precursors:** \[Which Progenitor race ruled before (e.g., Ila, U'Nonn, Mondi)? What ruins did they leave?\]  
* **Prophecies / Future Lore:** \[What is foretold for the end times?\]

#### 

#### **4\. Life & Inhabitants (Sociological Data)**

* **Origin of Life:** \[Evolutionary, Divine Creation, Seeding, Terraforming?\]  
* **Major Sentient Species:** \[Primary inhabitants and % breakdown.\]  
* **Population:** \[0-15\] | \[Exact Estimate \- e.g., Millions, Trillions\]  
* **Dominant Factions:** \[Name\] | \[Allegiance Code\]  
* **Government:** \[0-15\] | \[Type Name \- e.g., Feudal Technocracy\]  
* **Law Level:** \[0-15\] | \[Banned Item Class\]  
* **Global Demographics:** \[Population size and distribution (Urban vs. Rural).\]  
* **Monsters & Wildlife:** \[Significant non-sentient threats or resources. Note any Mega-Fauna scaling.\]

#### 

#### **5\. World Systems (Economic Profile)**

* **Tech Level (TL):** \[0-5\] | \[Era Description \- e.g., TL4 Stellar Age\]  
* **Market Availability Cap:** \[TL x 5 \+ 10\]  
* **Trade Codes:** \[Ag, Ni, Ri, etc.\]  
* **Global Economy:**  
  * **Primary Exports / Trade Goods:** \[Commodities sold off-world.\]  
  * **Primary Imports:** \[Commodities needed for survival.\]  
  * **Starport Class:** \[A-X\] | **Facilities:** \[Fuel/Repair/Shipyard\]  
* **Languages:** \[Major language families or trade tongues.\]  
* **Calendar & Timekeeping:** \[How is time tracked locally?\]  
* **Interspecies Relations:** \[Tensions, alliances, caste systems.\]  
* **Gods & Pantheons:** \[Major deities and religious influence.\]

#### 

#### **6\. Themes & Tone (Cultural Notes)**

* **Central Themes:** \[Core conflicts or concepts. e.g., Order vs. Chaos, Nature vs. Tech.\]  
* **Overall Tone:** \[The "Vibe." e.g., Gritty Survival, Hopeful Exploration, Gothic Horror.\]  
* **Aesthetic/Architecture Style:** \[e.g., Imperial Brutalist, Cyber-Corporate\]  
* **Social Quirk:** \[Behavior/Taboo \- e.g., Mandatory Face Concealment\]  
* **Major Landmark:** \[Name & Description\]

&nbsp;

&nbsp;

---

## **12\. IMAGE SYNTHESIS GUIDANCE**

* **Guidance Prompt:** \[World Name\]  
  *Use this framework to generate environmental assets consistent with the world's lore.*  
* **\[SUBJECT \- Environment Selection\]**  
  * **Subject:** \[List 3-4 Key Locations, e.g., The Capital Spire, The Toxic Wastes, The Crystal Forest, Orbital View\].  
* **\[CONTEXT \- Biome & Architecture\]**  
  * **Biome Style:** "\[Short Evocative Phrase, e.g., 'Bioluminescent Fungal Swamp'\]"  
  * **Geology/Flora:** \[Describe the rocks, plants, and terrain textures. e.g., Hexagonal basalt columns, giant fern-trees, floating islands\].  
  * **Architecture:** \[Describe the buildings. e.g., Rusty favelas, white ceramic towers, ancient stone ruins\].  
  * **Atmosphere Tokens:** \[Mood Keywords. e.g., Hazy, Oppressive, Majestic, Vibrant, Decaying, Frozen\].  
* **\[LIGHTING & PALETTE\]**  
  * **Lighting:** \[Describe the sun/light source. e.g., "Harsh Red Sun," "Soft Bioluminescence," "Neon Rain"\].  
  * **Palette:** \[Dominant colors. e.g., Teal and Orange, Monochrome Grey with Red Accents\].  
* **\[RENDERING PROMPT \- Standardized Tangent Aesthetic\]**  
  * **Rendering:** Photorealistic Cinematic Art, 8k raw imagery, lineless rendering, volumetric form, painterly realism, hyper-realistic texture, lifelike imagery, epic scale, matte painting aesthetic, intricate environmental detail, atmospheric perspective, ray-tracing, global illumination, diffraction spikes, anamorphic bokeh.  
* **\[NEGATIVE PROMPT \- Standardized Exclusion Protocol\]**  
  * **Negative Prompt:** outlines, black lines, borders, ink strokes, contour lines, hatching, cross-hatching, line art, line weight, illustration, cartoon, sketch, 3d render, gradient mesh, fuzzy, blurry, messy, watermark, text, anime, cel shaded, toon shading, hard edges, distorted perspective, miniatures, tilt-shift, low resolution, pixelated.

**Example Prompt Construction: The \[Location Name\]**

* **Subject:** Landscape shot of \[Location\].  
* **Narrative:** \[Describe the activity or stillness of the scene\].  
* **Context:** \[Specific weather or lighting conditions\].  
* **Visuals:** \[Specific details of flora, fauna, or tech visible\].

---

# **PLANETARY MATRIX DIRECTORY INDEX**

Detailed generation tables and world-building subsystems are organized in the `./planetary/` directory:

* **[Astrophysics, Geophysics & Biosphere](./planetary/99.Planetary.AstrophysicsAndGeophysics.md)** — *Sections 1–3: Stellar Classification, Orbital Zones, Planetary Size/Gravity, Atmosphere, Hydrology, Native Life Matrix, Ecological Hazards, and Progenitor Relics*
* **[Civilization, Economy & Infrastructure](./planetary/99.Planetary.CivilizationAndEconomy.md)** — *Sections 4–8: Tech/Metafocus Levels, Government & Law, Population Density, Trade Codes, Commodities, Cultural Aesthetics, Starports, and Character Origins*
* **[Hazards, Adventure Hooks & Encounter Tables](./planetary/99.Planetary.HazardsAndEncounters.md)** — *Section 9: Environmental Hazards & Survival Tables, Adventure Hooks by World Type, and d10 Planetary Encounter Tables*

