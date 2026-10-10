# Tangent SF RP - Tile Requirements & Specifications

**Document Version:** 1.0.0  
**Target Environment:** 2D Canvas (Konva.js), WebGL (PixiJS), 3D Isometric View (Three.js), Universal VTT (`.dd2vtt`)  
**Applicable Modules:** PCG AI Studio, Map Maker, Tactical Stage Engine, Omnicortex Asset Catalog  

---

## 1. Executive Summary & Architecture Overview

In **Tangent SF RP**, a *Tile* is the fundamental unit of spatial, tactical, and environmental composition. The tile system supports multi-scale visualization ranging from intergalactic space sectors down to 5-foot tactical combat grids and microscopic inventory containers.

```
+-----------------------------------------------------------------------------------+
|                                 TILE SYSTEM ARCHITECTURE                          |
+-----------------------------------------------------------------------------------+
|  SCALES:                                                                          |
|  [Sector] -> [Solar System] -> [Planetary] -> [Regional] -> [City] -> [Tactical]  |
|                                                                                   |
|  PIPELINES:                                                                       |
|  1. Raster / Vector Data: Seamless SVG Patterns + WebP Texture Sheets             |
|  2. Auto-Tiling Engine: 4-Bit & 8-Bit Marching Squares (Beveled Contours)         |
|  3. Spatial Physics: BVH Spatial Partitioning, LoS Raycasting, Movement Cost      |
|  4. Atmospheric Engine: Dynamic Light Emitters, Environmental Hazards, Particles  |
|  5. Serialization: Story Foundry Stage Manifests & Universal VTT (.dd2vtt)        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Multi-Scale Hierarchy & Grid Dimensions

The engine operates across eight distinct operational scales. Each scale defines its native coordinate system, cell dimensions, and rendering resolution.

| Scale Identifier | Target World Scope | Primary Grid Geometry | Default Cell Size | Export Resolution | Gameplay Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tactical Interior** | Deckplans, Outposts, Labs | Square Grid (Orthogonal) | `50px` (5 ft / 1.5 m) | `100px` / `140px` | Tactical miniatures combat, LoS, AP movement |
| **Tactical Exterior** | Camps, Landing Zones, Trenches | Square or Hex Grid | `50px` (5 ft / 1.5 m) | `100px` / `140px` | Vehicle maneuvers, skirmish cover, sightlines |
| **Container / Inventory**| Lockers, Crates, Body Loot | Square Slots | `40px` - `60px` | `80px` | Diablo-style volumetric inventory grid |
| **City / Settlement** | Urban Blocks, Docks, Maglev | Square / Hex Blocks | `60px` (25 m blocks) | `120px` | Vehicle chase mechanics, district infiltration |
| **Regional** | Continents, Valleys, Fjords | Hexagonal Grid | `64px` - `128px` (5 km) | `256px` | Overland hex-crawling, supply logistics |
| **Planetary** | Global Hemispheres, Globes | Simplex Raster / Hex | `200` - `512` Cells | `2048px` texture | Astrogation orbit scans, biome dropsites |
| **Solar System** | AU Orbits, Kuiper Belts | Polar / Concentric AU | `100px` (1 AU steps) | Dynamic Vector | Interplanetary transit, orbital mechanics |
| **Sector** | Interstellar Hyperlanes | 3D Hex Lattice | `80px` (1 Parsec) | Dynamic Vector | FTL navigation, fleet armada deployments |

### 2.1 Standard Tactical Cell Sizes

For encounter and combat maps (**Tactical Interior & Exterior**), the engine supports the following pixel-to-grid ratios:

*   **`50px` (Engine Native Baseline):** 1 cell = 5 feet. Lightweight memory footprint, optimized for mobile browsers and large 100x100 battlemaps.
*   **`70px` (Virtual Tabletop Standard):** Standard Roll20 1-grid-unit resolution.
*   **`100px` (Foundry VTT High-Def):** Native 1:1 scale for high-definition assets without sub-pixel downscaling.
*   **`140px` (Ultra-HD / Retina 2x):** High-DPI displays; crisp zoom up to 400% without texture blur.
*   **`256px` / `512px` (Seamless Texture Stamp):** High-resolution source textures used by the PCG landmass and biome painter.

### 2.2 Hexagonal Grid Geometry

For hexagonal scales (**Regional, Sector, and Hex-Mode Planetary**), tiles must conform to precise mathematical constraints:

$$\text{Width} = 2 \cdot r \quad \text{or} \quad \sqrt{3} \cdot r$$

*   **Flat-Topped Hexagons:**
    *   $\text{Width} = 2 \cdot \text{Radius}$
    *   $\text{Height} = \sqrt{3} \cdot \text{Radius}$
    *   $\text{Horizontal Spacing} = 1.5 \cdot \text{Radius}$
    *   $\text{Vertical Spacing} = \sqrt{3} \cdot \text{Radius}$
*   **Pointy-Topped Hexagons:**
    *   $\text{Width} = \sqrt{3} \cdot \text{Radius}$
    *   $\text{Height} = 2 \cdot \text{Radius}$
    *   $\text{Horizontal Spacing} = \sqrt{3} \cdot \text{Radius}$
    *   $\text{Vertical Spacing} = 1.5 \cdot \text{Radius}$

---

## 3. Core Tile Categories & Functional Types

All tiles in Tangent SF RP are classified into eight core functional categories:

```
[ TILE ASSET ]
       +---> 1. Ground & Floor Tiles (Walkable substrate, audio dampening)
       +---> 2. Structural & Wall Tiles (Occlusion, ballistic cover, hitpoints)
       +---> 3. Portal & Door Tiles (Airlocks, blast doors, security hatches)
       +---> 4. Liquid & Hazard Tiles (Caustic pools, magma flows, radiation)
       +---> 5. Transition & Auto-Tile Edge Tiles (Marching Squares contours)
       +---> 6. Elevation & Strata Tiles (Multi-tier elevation and contour steps)
       +---> 7. Decal & Weathering Overlays (Carbon scoring, blood, hazard tape)
       +---> 8. Interactive Entity & Prop Tiles (Consoles, terminals, crates)
```

### 3.1 Category 1: Ground & Floor Tiles

Floor tiles represent traversable surfaces with defined acoustic, frictional, and structural properties.

| Subtype ID | Label | Base Color | Texture Pattern | Audio Footstep Profile | Tactical / Engine Modifiers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `metal_deck` | Heavy Metal Decking | `#334155` | `metalDecking` | Metallic Stomp (High Ping) | Base Move: 1.0; Dropped items echo |
| `ceramic_tile` | Sterile Laboratory Tile | `#f8fafc` | Solid Gloss | Sharp Click | Clean surface; blood spills cause slip DEX DC 12 |
| `acoustic_mat` | Rubberized Acoustic Mat | `#0f172a` | Micro-Stipple | Silent / Muffled | Stealth noise -100% (+4 Stealth checks) |
| `grating_mesh` | Industrial Steel Grate | `#475569` | Slotted Grate | Hollow Echo | LoS penetrates downward; gas venting eligible |
| `packed_dirt` | Compacted Earth / Soil | `#78350f` | Fine Grain | Dull Thud | Base Move: 1.0; Tracks visible for 5 rounds |
| `cavern_stone` | Raw Cavern Rock Floor | `#1e293b` | Jagged Fractures | Rocky Crunch | Move cost: 1.5; Dash requires Acrobatics DC 10 |
| `chitin_matrix`| Organic Xenomoss / Chitin | `#14532d` | `chitinHive` | Wet Squish | Alien speed +25%; Human movement cost: 1.5 |

### 3.2 Category 2: Structural & Wall Tiles

Wall tiles provide physical obstruction, visual occlusion, and cover values.

| Subtype ID | Classification | Thickness (px) | Default Armor / HP | LoS Occlusion | Tactical Rules & Properties |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bulkhead_heavy`| Armored Starship Bulkhead | `12px` - `16px` | Hardness 25 / 150 HP | Complete (Blocks All) | Immune to small arms; requires plasma cutter/breach |
| `wall_reinforced`| Concrete / Composite Wall | `8px` - `12px` | Hardness 15 / 80 HP | Complete (Blocks All) | Standard room separation; ricochet risk on kinetic |
| `glass_plasteel`| Transparent Plasteel Viewport | `6px` - `8px` | Hardness 10 / 40 HP | Transparent (Passes Vision)| Vision passes; ballistic cover (+4 DEF); sound sealed |
| `forcefield_mesh`| Holographic Energy Barrier | `4px` - `6px` | Shield Points 100 HP | Translucent / Cyan | Blocks matter; passes laser/energy weapons |
| `barricade_sandbag`| Deployable Tactical Sandbags| `20px` - `24px` | Hardness 5 / 50 HP | Low (Half Cover) | Height: 3 ft; grants +2 Cover DEF to crouched units |
| `natural_chasm_wall`| Tectonic Basalt Chasm Lip | `16px` - `30px` | Infinite (Terrain) | Blocks Movement | Sheer drop hazard; falling deals 1d6 per 10ft |

### 3.3 Category 3: Portal & Door Tiles

Portals bridge wall segments and dynamically modify line of sight, atmospheric containment, and pathfinding.

*   **Door States:**
    *   `CLOSED`: Blocks movement, vision, and atmospheric exchange.
    *   `OPEN`: Full movement, unrestricted vision, atmospheric venting enabled.
    *   `LOCKED`: Requires Keycard, Decryption Tool, or Bypass DC (14-25).
    *   `BARRICADED`: Reinforced with tactical crates or welds; HP increased by 200%.
    *   `BREACHED`: Damaged/exploded open; counts as rough terrain (Move Cost: 1.5).
*   **Portal Dimensions:**
    *   Standard Corridor Portal: `1 cell` wide ($50\text{px} \times 12\text{px}$).
    *   Vehicle / Cargo Airlock: `2` - `4 cells` wide ($100\text{px}\text{--}200\text{px} \times 16\text{px}$).
    *   Vertical Bulkhead Iris Hatch: $50\text{px} \times 50\text{px}$ floor plate.

### 3.4 Category 4: Liquid & Environmental Hazard Tiles

Hazard tiles apply continuous or entry-based damage, movement penalties, and light emissions.

| Hazard ID | Liquid / Phase | Base Color | Emission Glow | Tactical Effect |
| :--- | :--- | :--- | :--- | :--- |
| `volcanic_magma` | Liquid Basalt | `#ea580c` | Amber/Red (`#f97316`, radius 4 cells) | 4d10 Thermal Damage/turn; destroys organic matter |
| `toxic_acid` | Caustic Chemical Waste | `#84cc16` | Emerald (`#10b981`, radius 2 cells) | 2d6 Chemical Damage; degrades armor by 1 each turn |
| `deep_water` | Pelagic Water | `#0284c7` | None | Move Cost: 3.0; Requires Athletics (Swim); drown risk |
| `alien_slime` | Xenobiotic Gel | `#a855f7` | Violet (`#c026d3`, radius 1 cell) | Slows to 25% speed; inflicts Bio-Toxin on contact |
| `void_rift` | Gravitational Singularity | `#020617` | Cold Blue Pulse (`#38bdf8`) | Pulls units 1 cell toward center per round; 3d8 Force |

---

## 4. Environmental Biome Catalog (All 11 Presets)

Tangent SF RP incorporates 11 first-class environmental palettes. Every biome specifies 12 elevation strata, seamless texture mappings, and atmospheric parameters.

```
Elevation Strata:
[11. Summit]  -> Snow / Peak Glaciers
[10. Peak]    -> High Crags & Cirques
[09. Mount]   -> Granite / Basalt Faces
[08. Highland]-> Scree / Scree Slopes
[07. Midland] -> Old-Growth Forests / Shrub
[06. Lowland] -> Arable Plains / Terraces
[05. Coast]   -> Beach / Alluvial Flats
[04. Shallows]-> Coastal Reefs / Lagoons
[03. Ocean]   -> Surface Ocean Waters
[02. Deep]    -> Continental Shelf Waters
[01. Abyss]   -> Benthic Trenches
```

### 4.1 Biome Palette Specifications

```json
{
  "terrestrial": {
    "abyssal": "#020617", "deepOcean": "#0f172a", "ocean": "#1d4ed8", "shallowWater": "#3b82f6",
    "beach": "#d97706", "grass": "#15803d", "forest": "#047857", "hills": "#3f6212",
    "mountain": "#4b5563", "highPeaks": "#334155", "snow": "#f8fafc", "river": "#60a5fa"
  },
  "badlands": {
    "abyssal": "#1c0d06", "deepOcean": "#2e1509", "ocean": "#7c2d12", "shallowWater": "#b45309",
    "beach": "#d97706", "grass": "#c2410c", "forest": "#9a3412", "hills": "#7f1d1d",
    "mountain": "#451a03", "highPeaks": "#291004", "snow": "#fbcfe8", "river": "#ea580c"
  },
  "desert": {
    "abyssal": "#1c1208", "deepOcean": "#2e1d0c", "ocean": "#0284c7", "shallowWater": "#38bdf8",
    "beach": "#fbbf24", "grass": "#f59e0b", "forest": "#d97706", "hills": "#b45309",
    "mountain": "#78350f", "highPeaks": "#451a03", "snow": "#fef3c7", "river": "#0ea5e9"
  },
  "ravines": {
    "abyssal": "#020408", "deepOcean": "#0b1120", "ocean": "#1e3a8a", "shallowWater": "#2563eb",
    "beach": "#475569", "grass": "#334155", "forest": "#1e293b", "hills": "#475569",
    "mountain": "#64748b", "highPeaks": "#94a3b8", "snow": "#e2e8f0", "river": "#38bdf8"
  },
  "seafloor": {
    "abyssal": "#010409", "deepOcean": "#030f24", "ocean": "#042a5c", "shallowWater": "#0284c7",
    "beach": "#0d9488", "grass": "#059669", "forest": "#047857", "hills": "#0f766e",
    "mountain": "#134e4a", "highPeaks": "#115e59", "snow": "#a7f3d0", "river": "#34d399"
  },
  "arctic": {
    "abyssal": "#021422", "deepOcean": "#082f49", "ocean": "#0284c7", "shallowWater": "#38bdf8",
    "beach": "#bae6fd", "grass": "#7dd3fc", "forest": "#0369a1", "hills": "#cbd5e1",
    "mountain": "#94a3b8", "highPeaks": "#e2e8f0", "snow": "#ffffff", "river": "#a5f3fc"
  },
  "forest": {
    "abyssal": "#021a12", "deepOcean": "#064e3b", "ocean": "#0284c7", "shallowWater": "#38bdf8",
    "beach": "#84cc16", "grass": "#15803d", "forest": "#166534", "hills": "#14532d",
    "mountain": "#1e3a1e", "highPeaks": "#3f6212", "snow": "#f0fdf4", "river": "#60a5fa"
  },
  "mountains": {
    "abyssal": "#090e17", "deepOcean": "#111827", "ocean": "#1d4ed8", "shallowWater": "#60a5fa",
    "beach": "#64748b", "grass": "#3f6212", "forest": "#155e75", "hills": "#475569",
    "mountain": "#64748b", "highPeaks": "#334155", "snow": "#f8fafc", "river": "#93c5fd"
  },
  "scifi": {
    "abyssal": "#030712", "deepOcean": "#050b14", "ocean": "#0284c7", "shallowWater": "#38bdf8",
    "beach": "#c026d3", "grass": "#059669", "forest": "#0d9488", "hills": "#0f766e",
    "mountain": "#475569", "highPeaks": "#334155", "snow": "#e0f2fe", "river": "#818cf8"
  },
  "volcanic": {
    "abyssal": "#050505", "deepOcean": "#09090b", "ocean": "#451a03", "shallowWater": "#78350f",
    "beach": "#9a3412", "grass": "#b45309", "forest": "#c2410c", "hills": "#881337",
    "mountain": "#3f3f46", "highPeaks": "#27272a", "snow": "#71717a", "river": "#ef4444"
  },
  "glacial": {
    "abyssal": "#032b43", "deepOcean": "#0c4a6e", "ocean": "#0284c7", "shallowWater": "#38bdf8",
    "beach": "#7dd3fc", "grass": "#0284c7", "forest": "#0f766e", "hills": "#155e75",
    "mountain": "#64748b", "highPeaks": "#475569", "snow": "#ffffff", "river": "#a5f3fc"
  }
}
```

---

## 5. Marching Squares & Auto-Tiling Specifications

The auto-tiling system is responsible for eliminating rigid, blocky tile edges. It evaluates adjacent neighbor matrices to calculate bitmasks and contour bevels.

### 5.1 4-Bit Cardinal Bitmasking (16-Tile Set)

The 4-bit algorithm evaluates cardinal neighbors:

$$\text{Bitmask} = \sum (\text{Flag}_i \cdot 2^i) \quad \text{where } i \in \{\text{North}: 0, \text{East}: 1, \text{South}: 2, \text{West}: 3\}$$

*   **Bit 0 ($\text{Value } 1$):** North Neighbor matches material
*   **Bit 1 ($\text{Value } 2$):** East Neighbor matches material
*   **Bit 2 ($\text{Value } 4$):** South Neighbor matches material
*   **Bit 3 ($\text{Value } 8$):** West Neighbor matches material

```
       [ North: 1 ]
             ^
             |
[ West: 8 ]<-+->[ East: 2 ]
             |
             v
       [ South: 4 ]
```

| Bitmask Value | Binary | Cardinal Adjacency | Visual Description |
| :--- | :--- | :--- | :--- |
| **`0`** | `0000` | Isolated Cell | Island / Single Pillar with 4 rounded corners |
| **`1`** | `0001` | North Only | Dead-end pointing North; East/South/West borders |
| **`2`** | `0010` | East Only | Dead-end pointing East |
| **`3`** | `0011` | North + East | Bottom-Left Corner (Outer bevel on South & West) |
| **`5`** | `0101` | North + South | Vertical Corridor / Strip |
| **`10`** | `1010` | East + West | Horizontal Corridor / Strip |
| **`15`** | `1111` | Full Cardinal Connection | Solid Center Interior Fill |

### 5.2 8-Bit Diagonal Bitmasking (47-Tile Blob Set)

For seamless corners and diagonal awareness, the 8-bit bitmask registers diagonal neighbors if and only if both bounding cardinal neighbors exist:

$$\text{Bitmask8} = \text{N}(1) + \text{NE}(2) + \text{E}(4) + \text{SE}(8) + \text{S}(16) + \text{SW}(32) + \text{W}(64) + \text{NW}(128)$$

```
[ NW: 128 ]  [ N: 1 ]   [ NE: 2 ]
[ W: 64   ]    [ + ]    [ E: 4  ]
[ SW: 32  ]  [ S: 16 ]  [ SE: 8 ]
```

### 5.3 Geometric Marching Squares Contour Calculation

When rendering vector polygons (`MarchingSquaresAutoTiler.getMarchingPolygonPoints`), cells are subdivided into beveled points to produce smooth, non-grid contours:

```
(x0, y0)             (x1, y0)    (x2, y0)             (x3, y0)
   +--------------------+-----------+--------------------+
   |                   /             \                   |
   |                  /               \                  |
   | (x0, y1)        /                 \        (x3, y1) |
   +----------------+                   +----------------+
   |                |    CELL CENTER    |                |
   | (x0, y2)       |                   |       (x3, y2) |
   +----------------+                   +----------------+
   |                 \                 /                 |
   |                  \               /                  |
   |                   \             /                   |
   +--------------------+-----------+--------------------+
(x0, y3)             (x1, y3)    (x2, y3)             (x3, y3)
```

*   **Bevel Ratio ($\beta$):** Defaults to `0.5` (midpoint subdivision).
*   **Curve Tension ($\tau$):** Set to `0.15` in Konva.js to create rounded organic landmasses without vertex jitter.

---

## 6. Technical Asset Specifications & File Formats

All custom tile assets contributed by artists or generated procedurally must adhere to standard file specifications.

### 6.1 Vector Tiles (SVG)

*   **XML Standard:** SVG 1.1 or 2.0 compliant.
*   **ViewBox:** Strictly `viewBox="0 0 100 100"` or `viewBox="0 0 50 50"`.
*   **Tiling Pattern Requirements:**
    *   Must define a `<pattern id="..." width="X" height="Y" patternUnits="userSpaceOnUse">`.
    *   Texture patterns must tile seamlessly along both $X$ and $Y$ axes with zero pixel border seams.
*   **Color Parameterization:**
    *   Support CSS variable inheritance or `currentColor` for dynamic biome recoloring.

### 6.2 Raster Tiles (WebP & PNG)

*   **Format Priority:** **WebP** is the primary format (lossless compression with 8-bit alpha). PNG is supported as fallback.
*   **Color Space:** sRGB (with embedded profile stripped to reduce payload).
*   **Bit Depth:** 32-bit (RGBA with 8-bit transparency channel).
*   **Dimensions:** Always Power-of-Two ($2^n$) for WebGL mipmapping:
    *   Individual Tile: $128 \times 128\text{px}$, $256 \times 256\text{px}$, or $512 \times 512\text{px}$.
    *   Sprite Atlas / Tilesheet: $1024 \times 1024\text{px}$, $2048 \times 2048\text{px}$, or $4096 \times 4096\text{px}$.
*   **Gutter Padding:** Tilesheets must include a **`2px` border extrusion (gutter)** around every tile sprite to eliminate texture bleed during bilinear WebGL filtering.

```
+-----+-----+-----+-----+
| 2px |     | 2px |     |  <- Bleed margin duplicated from edge pixels
| Ext |     | Ext |     |
+-----+-----+-----+-----+
|     |Tile1|     |Tile2|
+-----+-----+-----+-----+
```

---

## 7. Lighting, Emission & Vision Occlusion Metadata

Tiles can act as spatial light emitters or vision occluders. The engine uses this metadata to drive the Raycast Vision Service and GPU shadow shaders.

### 7.1 Light Emitter Schema

```typescript
export interface TileLightEmitter {
  color: string;           // Hex color (e.g. '#f59e0b')
  intensity: number;       // Range: 0.1 to 1.5
  radiusCells: number;     // Illumination radius in grid units (e.g. 3.5)
  animation: 'steady' | 'flicker' | 'pulse';
  flickerSpeed?: number;   // Frequency in Hz (0.5 to 4.0)
  castShadows: boolean;    // If true, occluded by walls
}
```

### 7.2 Vision & Movement Occlusion Matrix

```typescript
export interface TileOcclusionDescriptor {
  blocksMovement: boolean;
  blocksSense: {
    vision: boolean;     // Standard optical sight
    infrared: boolean;   // Thermal sensors
    radar: boolean;      // Long-range radar
    sound: boolean;      // Acoustic audio pings
  };
  coverBonusAC: number;  // Bonus Armor Class (+2 Half Cover, +4 Three-Quarters)
  elevationLayer: number;// Height in feet (0 = Floor, 3 = Half Wall, 10 = Full Bulkhead)
}
```

---

## 8. Universal VTT (`.dd2vtt`) Export Compliance

When maps composed of these tiles are committed or exported to external VTT platforms (Foundry VTT, Fantasy Grounds, Roll20), the engine serializes the tile layout using the **Universal VTT (.dd2vtt)** specification:

```json
{
  "format": 0.2,
  "resolution": {
    "map_origin": { "x": 0, "y": 0 },
    "map_size": { "x": 40, "y": 30 },
    "pixels_per_grid": 100
  },
  "line_of_sight": [
    [ { "x": 0.0, "y": 0.0 }, { "x": 40.0, "y": 0.0 } ]
  ],
  "portals": [
    {
      "position": { "x": 12.0, "y": 8.0 },
      "bounds": [ { "x": 11.5, "y": 8.0 }, { "x": 12.5, "y": 8.0 } ],
      "rotation": 0.0,
      "closed": true,
      "freestanding": false
    }
  ],
  "lights": [
    {
      "position": { "x": 20.0, "y": 15.0 },
      "range": 4.5,
      "intensity": 0.85,
      "color": "ffff9e0b"
    }
  ]
}
```

*   **Collinear Segment Merging:** Contiguous wall tiles on the same line must be merged into single polyline segments to minimize vertex counts in external engines.
*   **Coordinate Normalization:** Coordinates are exported in float grid space ($x / \text{cellSize}, y / \text{cellSize}$) with sub-pixel precision.

---

## 9. Validation Checklist for Asset Creators

Before registering any new tile into `MASTER_TERRAINS` or `MASTER_OBJECTS`:

1. [ ] **Seamless Tiling:** Tiled horizontally and vertically without visible seams or seams at boundaries.
2. [ ] **Palette Compliance:** Uses colors from one of the 11 canonical biomes or provides explicit hex entries.
3. [ ] **Marching Squares Support:** If a ground or liquid tile, provides 4-bit cardinal variants or conforms to polygon contour beveling.
4. [ ] **Lighting & Shadows:** If an emitter, specifies valid hex color, radius, and animation mode.
5. [ ] **Collision Flags:** Declares whether tile blocks movement, line of sight, and acoustic sound.
6. [ ] **Performance Budget:** SVG file size under `25 KB` per pattern; WebP textures under `150 KB` per $512 \times 512$ tile.
