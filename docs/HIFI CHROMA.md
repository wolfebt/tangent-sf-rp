# **HIFI CHROMA & ARTIST HUB VISUAL SYNTHESIS FRAMEWORK**

* **Document Status:** Canonical Visual Prompt & Shader Specification (Nov 2026)
* **Production Implementation:** `src/services/artistHubFramework.js`, `src/components/StoryFoundry/ArtistHubModal.jsx`, `src/services/cortexAdeAssetBridge.js`, `src/services/tileAiRecipeService.ts`
* **Supported Engines:** **HIFI CHROMA** (Lineless Painted Ink & Painterly Realism), **HI-FI SKETCH** (Micron Pen & Technical Line Art), **CRISP Visual Synthesis** (Origin × Faction × Occupation Descriptors), and **HIFI CHROMA Ligne Claire** (Cartographic Shader & Tile Recipe Engine).

---

## **1. Modular Prompt Architecture**

All visual concept prompts in the Tangent SF RP Artist Hub (`artistHubFramework.js`) are synthesized using a deterministic three-tier structure:

### **\[CONTENT PROMPT\]**
* **SUBJECT:** Primary focal character, creature, structure, vehicle, or artifact (enriched automatically with Omnicortex traits, chassis morphology, and equipment loadouts).
* **NARRATIVE:** Active pose, tactical operation, or environmental story beat.

### **\[GUIDANCE PROMPT\]**
* **SETTING STYLE:** Science-Fantasy setting aesthetic (enriched via **CRISP Visual Synthesis** from linked Origin, Faction, and Occupation records).
* **CONTEXT:** Environmental surroundings, architectural scale, and spatial staging.
* **ATMOSPHERE:** Lighting conditions, chiaroscuro contrast, weather particles, and mood.

### **\[RENDERING PROMPT\]**
* **STYLE RENDERING TOKENS:** Canonical medium and brushwork tokens for the active style (**HIFI CHROMA** or **HI-FI SKETCH**).
* **FORM MODIFIER TOKENS:** Shot-specific framing and composition tokens (`MASTER`, `CLOSE-UP`, `CHARACTER CONCEPT SHEET`, `ARCHITECTURAL ESTABLISHING SHOT`, `VEHICLE / MECH DESIGN`, or `INTERIOR SPACE`).
* **ASPECT RATIO PHRASE:** Optional aspect ratio directive (`16:9`, `1:1`, `3:4`, `4:3`, `9:16`, `21:9`, or `Template Native`).
* **NEGATIVE PROMPT TOKENS:** Strict exclusion list preventing off-style artifacts.

---

## **2. Style Engine I: HIFI CHROMA (`hifi_chroma`)**

* **Subtitle:** Painted Ink & Painterly Realism
* **Core Aesthetic:** Pure lineless rendering, dense pigment blocking, striking chiaroscuro, wet-on-dry ink washes, and crisp planar forms.
* **AI Style Guidance:** Emphasize rich pigment contrast, planar light-and-shadow separation, vivid color washes, and dramatic chiaroscuro lighting suited for pure lineless painted ink.

### **Base Rendering Tokens (`HIFI CHROMA`)**
> *Hyper-detailed painted ink, painterly realism, micro fine brush strokes, sharp edges, pure lineless rendering, volumetric form, rich ink medium, dense pigment blocking, striking chiaroscuro, wet-on-dry ink blending, crisp planar forms, vivid color washes, meticulous brushwork, cinematic composition, rule of thirds, dramatic low key lighting, intense rim lighting, sharp texture definition, intricate material layering, deep shadow recesses, mixed media digital painting.*

### **Negative Prompt Tokens (`HIFI CHROMA`)**
> *outlines, border lines, contour lines, black lines, line art, line weight, hatching, cross-hatching, pen strokes, sketch, cartoon, anime, comic book coloring, 3d render, CGI, photorealism, raw photo, airbrushed, blurred, fuzzy, soft edges, flat colors, heavy block shading, smudged, messy, watermark, text.*

---

## **3. Style Engine II: HI-FI SKETCH (`hifi_sketch`)**

* **Subtitle:** Micron Pen & Technical Line Art
* **Core Aesthetic:** Fine black ink contour lines, volumetric cross-hatching, stipple shading, clean negative space, and subtle selective color accents.
* **AI Style Guidance:** Emphasize crisp structural draftsmanship, tactile surface linework, stark ink-on-paper contrast, clean negative space, and subtle selective marker/ink focal accents.

### **Base Rendering Tokens (`HI-FI SKETCH`)**
> *Hyper-detailed ink sketch, fine line art, micron pen illustration, masterwork drawing, precise contour lines, intricate cross-hatching, stipple shading, dynamic line weight, mostly monochrome, black ink on clean paper, subtle selective color accents, architectural precision, traditional media aesthetic, highly detailed draftsmanship, volumetric cross-hatching, expressive ink strokes, clean negative space, technical illustration qualities, crisp line execution.*

### **Negative Prompt Tokens (`HI-FI SKETCH`)**
> *photorealism, photography, raw photo, 3d render, CGI, oil painting, watercolor, lineless, soft shading, airbrushed, blurred, depth of field, out of focus, gradient mesh, flat colors, heavy block shading, smudged, messy lines, scratchy, poorly drawn contours, text, watermark, anime, comic book coloring, cinematic lighting.*

---

## **4. Template Variations (Form Modifiers & Framing Directives)**

Each of the six canonical templates pairs a **Recommended Aspect Ratio** and **AI Framing Directive** with style-specific **Form Modifier Tokens**:

| Template ID | Full Title | Recommended Ratio | AI Framing Directive |
| :--- | :--- | :---: | :--- |
| `master` | **MASTER** | `16:9` | Standard character-in-environment scene or narrative keyframe with clear focal subject, grounded action, and cohesive staging. |
| `closeup` | **CLOSE-UP** | `1:1` | Tight macro close-up or portrait focusing on facial planes, eyes/optics, expression, collar/armor details, and tactile micro-textures. |
| `character_concept` | **CHARACTER CONCEPT SHEET** | `3:4` | Full-body character proportions, silhouette, layered attire, gear/weapon loadouts, and facial traits on a clean minimal turnaround sheet. |
| `architectural` | **ARCHITECTURAL ESTABLISHING SHOT** | `16:9` | Monumental exterior architecture, structural geometry, facade materials, scale indicators, and deep atmospheric perspective. |
| `vehicle` | **VEHICLE / MECH DESIGN** | `16:9` | Industrial hull geometry, structural panels, propulsion thrusters, weapon hardpoints, functional markings, and operational wear. |
| `interior` | **INTERIOR SPACE** | `16:9` | Interior spatial layout, architectural ribs/bulkheads, diegetic lighting and shadow occlusion, and lived-in narrative clutter. |

### **4.1 `MASTER` Form Modifiers**
* **HIFI CHROMA & HI-FI SKETCH:** *(No extra form tokens required; uses base rendering tokens directly for balanced narrative scenes.)*

### **4.2 `CLOSE-UP` Form Modifiers**
* **HIFI CHROMA:** *Extreme macro painting details, highly visible micro fine brush strokes, sharp planar facial structure, stark lighting contrasts, crisp transitions between ink washes, rich pigment density in core shadows, detailed iris color blocking, sharp painted eye catchlight, intricate material textures rendered without lines.*
* **HI-FI SKETCH:** *Extreme macro ink details, highly visible pen strokes, intricate facial cross-hatching, dense stippling for core shadows, sharp ink contours, distinct fine-liner weights, detailed eye shading using only lines, subtle single-color marker accent on focal point.*

### **4.3 `CHARACTER CONCEPT SHEET` Form Modifiers**
* **HIFI CHROMA:** *Painterly character turnaround sheet, precise anatomical proportions, five distinct views: (full body front view:1.5), (full body back view:1.5), (full body profile side view:1.5), and a detailed (face close-up profile:1.8). The five images should be presented as a clean, highly detailed array on a single sheet, with a minimal flat background for clarity.*
* **HI-FI SKETCH:** *Character design sketchbook page, precise anatomical draftsmanship, turnaround views: (front view ink sketch:1.5), (back view ink sketch:1.5), (side profile ink sketch:1.5), faint construction lines visible, clean white paper background, highly detailed costume line art, organized sketch array.*

### **4.4 `ARCHITECTURAL ESTABLISHING SHOT` Form Modifiers**
* **HIFI CHROMA:** *Wide establishing environment painting, dynamic multi-point perspective, sharp architectural geometry, monumental scale, pure painted edges, crisp light and shadow separation, intricate painted masonry and facade details, pure ink wash skies, extreme depth achieved through atmospheric color blocking, hyper-detailed environmental realism.*
* **HI-FI SKETCH:** *Architectural ink rendering, traditional multi-point perspective drafting, precise vanishing points, technical drawing style, dense structural cross-hatching, faint wireframe accents, intricate masonry line art, monumental scale conveyed through line density, pure white background.*

### **4.5 `VEHICLE / MECH DESIGN` Form Modifiers**
* **HIFI CHROMA:** *Dynamic industrial design painting, hard-edged metallic reflections rendered purely with sharp brush strokes, extreme foreshortening, striking high-contrast surface rendering, dense black recesses, painted structural panels without contour lines, highly detailed functional realism, sharp glossy highlights, painted grime and wear.*
* **HI-FI SKETCH:** *Industrial design sketch, technical pen illustration, dynamic perspective, wireframe construction lines, high-contrast mechanical hatching, metallic reflections rendered purely in ink lines, exploded view accents, subtle design marker accent colors (e.g., Copic marker splash).*

### **4.6 `INTERIOR SPACE` Form Modifiers**
* **HIFI CHROMA:** *Dramatic interior setting, complex spatial painting, sharp light shafts piercing shadows, crisp diegetic lighting, sharp edge occlusion, heavy cast shadows, rich ambient color blocking, expansive framing, hyper-detailed narrative clutter rendered entirely through painterly brushwork and form rather than line.*
* **HI-FI SKETCH:** *Environmental perspective sketch, complex spatial line art, diegetic lighting rendered via varying hatching density, architectural interior drafting, detailed clutter rendered in pure line work, varying line thickness to simulate depth and atmospheric perspective.*

---

## **5. CRISP Visual Synthesis & Cartographic Shader Integration**

1. **CRISP Visual Synthesis (`src/services/cortexAdeAssetBridge.js` & `src/data/synthesisData.js`):**
   * Automatically resolves and embeds **266 canonical Origin × Faction × Occupation Visual Synthesis records** into ADE Story Foundry assets and Artist Hub prompts, supplying authentic architectural motifs, attire silhouettes, material palettes, and environmental lighting cues.
2. **HIFI CHROMA Cartographic Shader Engine (`src/services/tileAiRecipeService.ts`):**
   * Translates natural-language descriptions into deterministic `TileSynthesisRecipe` schemas combining Ligne Claire / HIFI CHROMA procedural palette parameters with canonical Tangent `2d10` VTT mechanics (`damageFormula: 2d10+X <type>`, movement cost, cover bonus, and LoS occlusion).
