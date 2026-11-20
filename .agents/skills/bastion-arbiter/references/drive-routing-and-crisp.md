# BASTION Google Drive Asset Routing & Universal CRISP Visual Matrix

* **Focus Statement:** The canonical Google Drive CLI inspection workflow (`gdrive`, `gdocs`, `gsheets`), dual-mapped Folder ID registry (reconciling Primary `/game_rules` and `/rules_archive` trees alongside the local `docs/game_rules/` SSOT), complete Intent-to-File Routing Manifest, and Universal CRISP `"Hi-Fi Ink"` Form Presets `A–F` + 10 Faction Skins.

## I. Google Drive Game Asset Analysis Runbook (Portable Across Cloud & CLI Runtimes)

When analyzing, auditing, pricing, or migrating game assets stored in Google Drive, execute this deterministic read-only-first pipeline using whichever Drive integration is active in the current runtime:

### 1. Connect to Google Drive (Read-Only Default)

* **Mode A — Google Skills / Gemini Native `drive` Tool:**
  * Query folders, search file metadata, and fetch document/spreadsheet contents directly using the built-in `drive` tool and the canonical Folder/File IDs in Section II below (or any Drive link/ID shared by the user).
  * Stage exported text (`.md`, `.json`, `.tsv`, `.csv`) into temporary scratch storage (`/tmp/bastion_audit/`) when running [bastion_validator.py](../scripts/bastion_validator.py).
* **Mode B — CLI Workspace Runtime (`gdrive`, `gdocs`, `gsheets` Skills):**
  * Register the `gdrive` CLI wrapper once per session via its skill setup script (`<gdrive_skill_dir>/scripts/gdrive --version` or `gdrive.cmd --version`), then invoke bare `gdrive` (`gdocs` / `gsheets` if inspecting native Docs/Sheets directly).
  * Complete OAuth sign-in via the Plugins Manager or `gdrive auth login` if unauthenticated.
* **Read-Only Safety Law:** Always restrict discovery and analysis to read-only operations (`gdrive readonly <subcommand>`). **Never** overwrite, move, rename, or delete Google Drive files unless the user explicitly instructs.

### 2. Discover, Stage & Validate Drive Game Assets

1. **Inspect Folder Contents or Search by Name:**
   * Native `drive` tool: list children of target Folder ID or search by title/content.
   * CLI `gdrive`:
     ```bash
     gdrive readonly ls <FOLDER_ID> --max 50
     gdrive readonly search --name-contains "<Asset or Species Name>"
     gdrive readonly info <FILE_ID>
     ```
2. **Stage Assets into Scratch Storage by MIME Type:**
   * **Uploaded Markdown (`.md`), JSON (`.json`), CSV (`.csv`), or Text:** Download raw file (`gdrive readonly download <FILE_ID> --out "<ScratchDir>/asset.md"`).
   * **Native Google Docs (`application/vnd.google-apps.document`):** Export as Markdown (`gdrive readonly export <FILE_ID> "<ScratchDir>/asset.md" --format md`).
   * **Native Google Sheets (`application/vnd.google-apps.spreadsheet` — Weapon, Armor, Species, or Economy Tables):** Export as TSV (`gdrive readonly export <FILE_ID> "<ScratchDir>/asset.tsv" --format tsv`).
3. **Cross-Reference Against Canonical `/game_rules` Archive:**
   * Verify parameters against the canonical `/game_rules` files in Section II (or `docs/game_rules/` if a local repository mirror is mounted in the workspace) so rule discrepancies, outdated formulas, and missing codex entries are caught with zero guesswork.
4. **Execute Automated BASTION Validation & Math Proofs:**
   ```bash
   python "<SkillDir>/scripts/bastion_validator.py" "<ScratchDir>"
   # Optional SSOT structural check when auditing /game_rules Hub & Leaf Markdown files:
   python "<SkillDir>/scripts/bastion_validator.py" "<ScratchDir>" --ssot
   # Deterministic CLI calculators for rapid item/combat verification:
   python "<SkillDir>/scripts/bastion_validator.py" --calc-euft 22 --ws 15
   python "<SkillDir>/scripts/bastion_validator.py" --calc-armor "18,8,4" --pen 5 --sta 3 --raw 30
   ```

---

## II. Reconciled Google Drive Folder ID Registry & Intent Routing Manifest

> **Folder ID Reconciliation Note:** The Tangent Drive workspace maintains both the active **Primary `/game_rules` Repository** (`1ODaKql4LvEyTj_z8RxvPSlFrqRYsKHQS`) and the **Reference `/rules_archive` Repository** (`11f-YEfzysnmNlMSy-2XaYZuOE9S7V4FA`), alongside the unabridged narrative source archive **`_ _ TANGENT RP CODEX _ _`** (`1MqtYtmVOpSq6vCl7iwkGQRFN66vufIPj`). Both Folder ID sets are mapped side-by-side below.

### A. Root & Source Repositories

| Domain / Path | Primary `/game_rules` ID | `/rules_archive` / Source ID | Local SSOT Path & Contents |
| :--- | :--- | :--- | :--- |
| **Root (`/game_rules/`)** | `1ODaKql4LvEyTj_z8RxvPSlFrqRYsKHQS` | `11f-YEfzysnmNlMSy-2XaYZuOE9S7V4FA` | `docs/game_rules/` (`00.00`: `1pLZFsQGKbab8-QW5nbSxqfx5er_evFgH`, `00.01`: `1edj6rTUT3w8SU3BS4xmC45lDrJD_QYFj`, `00.02`: `13DKzqz27JIfbjvyaTtaAXggq_IvDsg_1`, `README.md`) |
| **Codex Source Archive** | — | `1MqtYtmVOpSq6vCl7iwkGQRFN66vufIPj` | `_ _ TANGENT RP CODEX _ _` (`81` unabridged narrative & source files) |
| **Volume I Hub (`operator/`)** | `1VWkmRfCuZUWm-kvqMIOubq8BuQY1idX0` | `1xvAWGrgKAWvnOGkLf_8-DhnnfU6DEQPJ` | `docs/game_rules/operator/` (`14` top-level player compendium hubs: `1.00` to `4.00`) |
| **Volume II Hub (`architect/`)** | `110UHVnjCAcBCByil3NskAU-C1bK98Rwm` | `1NdhrfuBJYVZ4vJEok1A3OuMBogcffVYp` | `docs/game_rules/architect/` (`10` top-level GM & Modular Matrix hubs: `00.00` to `99. TECHNOLOGY`) |

### B. Volume I: The Operator's Manual (`operator/`) Routing Table

| Subfolder Path | Primary Drive ID | Archive Drive ID | Files & Adjudication Scope |
| :--- | :--- | :--- | :--- |
| `operator/introduction/` | `11oAFdq75jfC8z65JeVQTIHV8FiL5o-RI` | `1ZoZypm4IloJMGiZkMDxcgw__oH0C-Z2w` | `1.00.Introduction.md`, `1.00.Glossary.md` — Six Pillars overview, 2d10 bell curve, 5-section Glossary. |
| `operator/character_creation/` | `1Pk1hAac5t1THMhHpHzDq-iCw31sq-KjF` | `1ZqcfuLB1oQdvAkO5V9uDjuioDYfBsE5g` | `10` files (`1.01.*`) — `150 CP` (`80+70`), Attributes, Perception, Vitality/Health/SP, Karma, Movement, Mortality (`-5 AP Debt`), Award Points (`AP`). |
| `operator/archetypes/` | `1MZr_xJiGejVXrkB2Pj2HMzPISiuGHleC` | `1Xj7R4e-n698mskT_zxqTZdf4Xh7rEEIQ` | `5` files (`1.02.*`) — `80-CP` Playable Archetypes (`Operatives`, `Savants`, `Sentinels`, `Visionaries`, `SignatureFeatures`). |
| `operator/species/` | `1iVOMQznkMY1m_SusGx6mQgumDVg0XGOV` | `1at9PSxOWe8sT-yZJPyeMVRUv6FZVD0FZ` | `93` files across root & 9 lineage subfolders (`Aeld`: `1PUTT2VOUTX9ypCULs3UciHRh03v9JNDU`, `Asi`: `1ry0wGdt7Mtt_qoz9G_6hzKujpGd55h3D`, `Aulurans`: `1Z4lz04tCKHauSkunMgKsmziKAYFgR6H8`, `Humans`: `1F3CCgHbdjXOW08C_lcOuZyWBgESuCA2-`, `Kitin`: `1WpXj_vQvxtb-Pqc83QuVZosWgTIa6eu-`, `Orll`: `1R0o2sPDlhVJhKdbi0kpXxqtqFlnYwSTo`, `Progenitors`: `1ug6uc_ltbc3HNyT0ONY5Fqxy2HWbV_v-`, `ShaNor`: `1ngjyXm5LUA9H6kLvvf8S2Clyz_p0ieVf`, `Synthetics`: `1HUehvV9GVJ58ePXAnsfeye24dYsQZkI_`). |
| `operator/factions/` | `1K08FlI9GJwQ7YkdpYH9aAqICUuJbC2bj` | `1RnblV8-_a2XgLzbeNkzzMVZoKgdVqcSb` | `42` files (`1.04.*`) — `20 SP` + `1 Recommended Feature` (`0` free Faction traits by default; optional `1 CP` traits; Kovian Tribunal `+3 WS`; *Psycholith*). |
| `operator/origins/` | `14UZAgAp2xCK6RcbB2th1y6nTEvn97xYd` | `1JcIU_kU6UXCoOsALlGg5QAPKzzeMvgqV` | `11` files (`1.05.*`) — `20 SP` + `1 Recommended Feature` + `2 Free Origin Traits`. |
| `operator/occupations/` | `19BKWCo_3Gqb0N1YdT-llzwbC818Up2np` | `1f5eFibUJMAjHwp4cSXXwAr25MbqLZYZP` | `13` files (`1.06.*`) — `20 SP` + `2 Recommended Features` + `2 Free Occupation Traits` + starting `WS` modifier. |
| `operator/skills/` | `1U0frEWYWEDJJUPQweqbdT02cGAQnQb5l` | `1364x3ey-Jw8LXP4SLlALdWDfeKlxbi8Y` | `20` files (`7` Mechanics + `13` Compendiums; `93` canonical skills; Base `0–20` [Creation Cap `11`], Spec `1–10` [prereq Base `6+`]). |
| `operator/features/` | `1LHULJWjMtKbPobnFtS8qKLG3d0w4dKM-` | `1rYTBj6fF7lQG7p2UjNLvKDCdcW_A2D8c` | `10` files (`1.08.*`) — Standard `3 CP`, Recommended `2 CP` (`Precision Strike` `2x/3x/4x`, `Companion` `3 CP -> 40 CP`). |
| `operator/hindrances/` | `1VOg0sV88Irz6pICRZHUWOMyfkmhWynMx` | `19QAwEllMGu__JMPIvI6_ItnTWJlkbCcZ` | `3` files (`1.09.*`) — Physical, Mental/Psychological, Social (`+10 CP` personal cap; Species & Stigmas exempt). |
| `operator/economatrix/` | `1rZV3MwvTFxgM0al5NodZ61BylZHZODTV` | `1TU2zzod97c-zmW0cOyFGzMv6HZ5uSs42` | `12` files (`2.00.*`) — Wealth Score, Liquidity Gap, Crafting, Trade, Weapons, Armor, Augs, Mecha, Architecture. |
| `operator/combat/` | `1f8BCIvYvxPDgOepMPc61EHz2q_uVKlU7` | `1owsQlXQFKKD3GPLWNfXUIj7vvWeSdOvc` | `5` files (`3.00.*`) — Edge, Called Shots, 23 Damage Types, Status Effects, Vehicular Combat, Diminishing Returns DR. |
| `operator/metaphysics/` | `1qbwsCWXxuGzLzVv_Qm1tcisqH_fZXM8Y` | `1R_CG6beRO6Ds0P6p26RAQvirXBfKBbpk` | `7` files (`4.00.*`) — Sensory Manifestations & 6 Discipline Compendiums (`Dimension`, `Energy`, `Entropy`, `Illusion`, `Matter`, `Mental`). |

### C. Volume II: The Architect's Matrix (`architect/`) Routing Table

| Subfolder Path | Primary Drive ID | Archive Drive ID | Files & Procedural Synthesis Scope |
| :--- | :--- | :--- | :--- |
| `architect/economy/` | `1Dm4SwJ7OTzlkkTGIFrsavUt_5ARlLaUi` | `1Ln1ABCpvVgldbLwJWyE6mM67GttH7DUu` | `2` files (`02.Economy.UnifiedFieldTheory.md`, `02.Economy.InterstellarTrade.md`). |
| `architect/archetypes/` | `15A1fK6ABGXU5B-R1Cv9vYlkoCIMAVIxO` | `1oFSPQHfTT-vvAiP6gSzNYRI7mh6jebtC` | `5` files — `220` NPC/Role Archetypes (`A_D`, `E_L`, `M_R`, `S_Z`) + `99.Archetypes.MBTIMapping.md`. |
| `architect/metaphysics/` | `14K-YICpU-gOHdyt0_JNomHyNZkwxTvWT` | `1NFURmtCARZZt0eyvLks79014S0MOVtCf` | `3` files — `04.TheResonance.md`, `99.Metaphysics.InvocationMatrix.md`, `99.Metaphysics.MetaTechMatrix.md`. |
| `architect/characters/` | `1fxLy9BcBOl7wMl5YrNCOmcViA1vjUxNT` | `1UZ0Iy-A8q00jVue8IkA9B3uCms54S1FJ` | `6` files — Modules A–G rapid NPC/Adversary construction, Lifepath schema, `04.03.BestiaryAndXenofauna.md`. |
| `architect/companions/` | `1uC_0qHsutzfO-qAxQw7fVaTPvye9ScII` | `1tx4TLicHgQTZc_B6G2sVQbRg1hV6382G` | `2` files — `99.Companion.FormPackages.md` (`15 CP`), `99.Companion.FunctionAndExamples.md` (`25 CP` + 10 Tiny Thralls). |
| `architect/planetary/` | `15qncpFV4_ae9ZSA4Gs2aduXDnyFiEGCQ` | `109zlYIjW9wrepAkLiSalza9ShijDsbWL` | `4` files — Astrophysics, Civilization/Economy, Hazards/Encounters, `04.00.StarAtlasAndGazetteer.md`. |
| `architect/species/` | `1xSMzHaAK6_R8LkduZLPInku9ydrTKb4f` | `1adog0gjpaRsC-ruBcVGvg_k_cnJ2NqNZ` | `3` files — `99.Species.ChassisAndMovement.md`, `99.Species.TraitsAndDisadvantages.md`, `04.03.01.DragonsCodex.md`. |
| `architect/technology/` | `1emxsLYM15uYNio2_F1emICswI5ufd7dl` | `1N1iPpMUd53bYikcBHHrmOec4AR220Kv7` | `20` files across 7 subfolders (`core`: `1Ul6LMf4Pt-IuEZiR7atseh8TUxD9H0Gv`, `architecture`: `1p5ONP4uysId7qSnsQpPeU_GfuTK7hgJX`, `armor`: `1LuIE1EEJ6gn0YwMFaVvdchEPpvgudfjW`, `augmentations`: `1TDUSvtqFuZCi_t1ZcgP_HrkNvjGqWTXB`, `equipment`: `1AVVilo4okZCNrl9NmqnKAYF42RDaFOwR`, `mecha`: `1Wkt4NzQblN3_DkUBxGOO0m7Bdu5pffkf`, `weaponry`: `1M5UY1aDGlLn1pl_DVLNA3EuN4GSkGn0Z`). |
| `architect/schemas/` | `1Nf2-ib_KSDUjrm969oURagkO437T9STm` | `1kHJDOh-WTb9dkL0JrR7EH9TwYRqaIurg` | `6` `.md` schema specs + `schemas.json` + `bastion_validator.py`. |

---

## III. Universal CRISP / "Hi-Fi Ink" Visualization Engine (`Presets A–F` & 10 Faction Skins)

When generating visual descriptions or copy-paste art prompts for characters, gear, vehicles, mecha, or habitats, output the 3-block **CRISP** structure below (`00.00 GM GUIDELINES.md` Section 4.D):

```text
[CONTENT PROMPT]
SUBJECT: <Detailed subject description grounded in Codex species, archetype, and equipment parameters>
NARRATIVE: <Dynamic operational posture, authentic material wear, and diegetic environmental interaction>

[GUIDANCE PROMPT]
SETTING STYLE: <Canonical Faction/Origin Setting Style>
CONTEXT: <Narrative & architectural context>
PALETTE: <Canonical Faction Palette>
ARCH/TECH: <Canonical Faction Architecture & Tech Level>
ATMOSPHERE: <Canonical Faction Atmosphere & Lighting>

[RENDERING PROMPT]
RENDERING: Photorealistic Cinematic Art, 8k raw imagery, lineless rendering, volumetric form, painterly realism, hyper-realistic texture, lifelike imagery, realistic anatomy, detailed musculature, heavy fabric physics, tailored clothing, intricate material definition, chiaroscuro, low key lighting, visible light beams, volumetric fog, deep color blocking, rich blacks, soft shadow transitions, deep indigo shadows, colored rim lighting, backlighting, kicker light, film grain, subsurface scattering, cinematic composition, rule of thirds, anamorphic bokeh.
FORM: <Insert Form Preset A, B, C, D, E, or F>
NEGATIVE PROMPT: <Faction Negative Tokens>, outlines, black lines, borders, ink strokes, contour lines, hatching, cross-hatching, line art, line weight, illustration, cartoon, sketch, 3d render, gradient mesh, fuzzy, blurry, messy, watermark, text, anime, cel shaded, toon shading, hard edges, capes, banners, extra fabric, excess cables, distorted hands, plastic skin, waxy texture, airbrushed, smooth, doll-like.
```

### 1. Canonical Form Presets (`A–F`)

* **Preset A (Master / Default):** Standard cinematic composition, balanced depth of field, clear silhouette separation, grounded environmental framing.
* **Preset B (Close-Up Portrait):** Macro photography, 85mm lens, shallow depth of field, detailed skin pores, subsurface scattering, heavy wool texture, herringbone weave, rigid denim stacking, leather patina, frayed edges, tactile realism, soft box chiaroscuro, Rembrandt lighting, eye catchlight, subtle rim light.
* **Preset C (Character Concept Sheet):** Full character concept sheet showing five distinct views: `(full body front view:1.5)`, `(full body back view:1.5)`, `(full body right side view:1.5)`, `(full body left side view:1.5)`, and a detailed `(face close-up profile:1.8)`. Clean, highly detailed array, minimal white/gradient background.
* **Preset D (Establishing Shot / Origin Scenery):** Wide angle lens, 24mm tilt-shift, 3-point perspective, atmospheric perspective, ambient occlusion, raytraced reflections, wet pavement reflections, scale comparison, imposition, monumental scale, intricate facade details, brutalist geometry or organic curves.
* **Preset E (Vehicle / Mecha):** Automotive photography, rolling shot or showroom angle, 35mm, motion blur, anisotropic reflections, carbon fiber weave, brushed steel, oil stains, heat-discolored exhaust, hydraulic fluids, rubber texture, scratched metal patina.
* **Preset F (Interior):** Interior design photography, 50mm lens, depth of field, dust particles in light shafts, subsurface scattering on plastics/glass, complex occlusion, screen space reflections, ambient light sources, diegetic lighting, narrative clutter.

### 2. The 10 Canonical Faction Skins

| Faction Skin | Setting Style | Palette | Arch / Tech | Atmosphere | Negative Tokens |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. The Radiant Impyrium** *(Dominion / Radiant)* | Regal Neo-Byzantine Solar Cathedral Sci-Fi, gilded relic-armor and psycholith inlays | Burnished gold, imperial alabaster, deep crimson velvet, incandescent amber psycholith glow | `TL 4` monumental vaults, fluted ceramite columns, consecrated plasma halos | Cathedral light shafts, drifting incense particulates, solemn high-contrast chiaroscuro | grungy cyberpunk neon, scavenged rust, crude patchwork |
| **2. The Syndicate (IPS)** | Slick Corporate Neo-Noir Megacity, executive arcology precision and tactical polymer stealth | Obsidian carbon, cold cyan telemetry, gunmetal titanium, rain-slicked amber sodium reflections | `TL 3–4` monolithic glass-and-ferrocrete towers, holographic ticker arrays, precision cyberware | Nocturnal rain mist, sharp cyan rim lighting, anamorphic corporate signage bokeh | medieval heraldry, organic chitin, rustic timber |
| **3. The Ascendancy** | Transhumanist Post-Scarcity Geometric Minimalism, immaculate hard-light and quantum chrome | Iridescent pearl white, vacuum silver, prismatic sapphire hard-light, deep void black | `TL 5` floating polyhedral spires, seamless picotech surfaces, photonic mandala interfaces | Clean orbital sunlight, crisp specular highlights, zero-dust sterile clarity | oil grime, exposed wiring, diesel exhaust, weathered rust |
| **4. The Dracon Dynasty** | Martial Honor-Bound Star Empire, layered lacquered scale-plate and forge-fire ceremonial steel | Volcanic obsidian, dragon-blood vermilion, forged bronze, ember orange plasma edges | `TL 3–4` tiered citadel bastions, thermal-forged mono-blades, heavy orbital kinetic batteries | Smoldering forge embers, dramatic low-angle rim light, wind-whipped ash haze | pastel corporate plastic, fragile filigree, cluttered neon |
| **5. The Alterian Enclave** *(Aeld Providence)* | Astral Bio-Crystalline High Science Fantasy, grown wraith-crystal and resonant starlight | Twilight indigo, luminous viridian aether, silver-leaf alloy, opalescent starlight | `TL 4 / ML 4` harmonic crystal spires, living metallic filigree, zero-seam psionic conduits | Bioluminescent mist, soft aurora refraction, ethereal volumetric beams | brutalist concrete, diesel hydraulics, industrial soot |
| **6. The Auluran Clans** | Arboreal Bio-Tactical Predator Culture, living symbiote chitin-weave and canopy tech | Forest emerald, warm amber ochre, matte panther-slate, bioluminescent cyan veins | `TL 3` bio-integrated composite carbines, braided carbon-vine rigging, agile scout harnesses | Dappled canopy sunbeams, humid spore mist, crisp kinetic tension | sterile cubic corridors, clunky boxy mecha, heavy smog |
| **7. The Mekan Collective** | Utilitarian Synthetic Megastructure Industrialism, exposed servo-frames and precision logic cores | Brushed tungsten, hazard ochre, optical cobalt, anodized graphite | `TL 4` modular synthetic chassis, fractal heat-sink arrays, orbital foundry gantries | Cool arc-welder flashes, crisp industrial shadows, ionized coolant vapor | organic flesh, flowing silk robes, botanical overgrowth |
| **8. The Entari Combine** | Deep-Core Masterwork Engineering & Heavy Exo-Foundry Guilds | Forged copper, slate iron, molten tungsten gold, deep basalt | `TL 4` heavy exo-rigs, gravimetric hammers, reinforced subterranean vault architecture | Radiant furnace warmth against deep cavern shadows, suspended metallic sparks | flimsy cloth, spindly proportions, airy pastel minimalism |
| **9. The Outworlds Coalition** | Rugged Frontier Salvage-Tech & Modular Mercenary Pragmatism | Weathered olive drab, desert rust, faded hazard yellow, scratched gunmetal | `TL 2–3` field-modified ballistic rifles, patched ceramic plating, modular drop-rigs | Harsh binary-sun dust glare, gritty film grain, lived-in tactical wear | pristine luxury gold, untouched showroom polish, ornate court attire |
| **10. The Kitin Collective / Riezen** | Genomatrix Bio-Engineered Carapace & Hive-Resonant Organic Architecture | Iridescent scarab chitin, bone ivory, bio-acid chartreuse, deep abyssal violet | `TL 3–4` grown bio-polymer armor, resinous neural conduits, cellular symbiote weaponry | Subsurface scattering through translucent resin, humid bioluminescent cavern glow | stamped sheet metal, rectilinear glass skyscrapers, chrome rivets |
