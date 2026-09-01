# TANGENT SFF RP: Comprehensive Dataset Schema & Field Catalog

This document serves as the canonical reference specification for schemas, field names, data types, optionality, and transformation rules across all datasets within the TANGENT SFF RP ecosystem.

---

## 1. Universal Base Schema (`BaseCompendiumItem`)

All Omnicortex and Compendium records share a foundational metadata contract:

| Field | Type | Required | Description / Parsing Rule | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier (slugified kebab-case or UID). | `"weapon-plasma-rifle"` |
| `name` | `string` | **Yes** | Display title / canonical label. | `"Heavy Plasma Rifle"` |
| `category` | `string` | **Yes** | Compendium domain grouping. | `"weaponry"`, `"species"`, `"skills"` |
| `description` | `string` | **Yes** | Summary text or markdown description. | `"Standard military energy weapon."` |
| `body` | `string` | No | Full markdown content / extended rules text. | `"# Heavy Plasma Rifle\n\n**Special:**..."` |
| `tl` | `number` | **Yes** | Tech Level (0 to 10+). | `4` |
| `ml` | `number` | **Yes** | Metaphysics Level requirement (0 to 10). | `0` |
| `cost` | `number` | No | Standard currency / credit value. | `1200` |
| `updatedAt` | `string` | No | ISO 8601 timestamp string. | `"2026-08-23T10:56:46.545Z"` |
| `tags` | `string[]` | No | Search and classification tags. | `["energy", "ranged", "two-handed"]` |

---

## 2. Character Creation & Identity Datasets

### 2.1 Species (`species_database.json` / `src/data/omnicortex/species`)
Defines base playable species, sub-lineages, and morphological profiles.

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Unique species identifier (e.g., `"species-human"`). |
| `name` | `string` | **Yes** | Common name of the species. |
| `category` | `string` | **Yes** | Always `"species"`. |
| `species_type` | `string` | **Yes** | Biological taxonomy category (e.g., `"Humanoid"`, `"Synthetic"`, `"Arthropod"`). |
| `size` | `string` | **Yes** | Size scale rating (`"Fine"`, `"Diminutive"`, `"Tiny"`, `"Small"`, `"Medium"`, `"Large"`, `"Huge"`, `"Gargantuan"`, `"Colossal"`). |
| `movement` | `object` \| `string` | **Yes** | Base speed & movement modes (e.g., `{ ground: 6, swim: 3, fly: 0 }`). |
| `attribute_modifiers`| `object` | No | Map of attribute keys to numeric modifiers (e.g., `{ strength: 1, tech: 2 }`). |
| `traits` | `string[]` | No | IDs of innate species traits. |
| `features` | `string[]` | No | IDs of innate species features. |
| `disadvantages`| `string[]` | No | Innate biological/cultural hindrances. |
| `lifespan` | `string` \| `number` | No | Typical biological lifespan in standard solar years. |
| `homeworld` | `string` | No | Native planet or primary territory. |

---

### 2.2 Occupations (`occupations_database.json` / `src/data/omnicortex/occupations`)
Defines professional roles, starting competencies, and vocation trees.

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"occupation-pilot"`). |
| `name` | `string` | **Yes** | Occupation name. |
| `category` | `string` | **Yes** | Always `"occupations"`. |
| `tier` | `number` | No | Entry tier level (default: `1`). |
| `skill_proficiencies`| `string[]` | **Yes** | Core skill IDs granted or boosted by this role. |
| `occupational_traits`| `string[]` | No | Trait choices unlocked by this career. |
| `starting_gear` | `string[]` | No | Recommended or granted equipment item IDs. |
| `credits_stipend` | `number` | No | Starting monetary balance modifier. |
| `prerequisites` | `string[]` | No | Skill or stat requirements needed to qualify. |

---

### 2.3 Origins (`origins_database.json` / `src/data/omnicortex/origins`)
Represents cultural, planetary, or environmental upbringing.

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Origin identifier (e.g., `"origin-core-world"`). |
| `name` | `string` | **Yes** | Origin name (e.g., `"Core World"`, `"Orbital Colony"`, `"Deep Fringe"`). |
| `origin_type` | `string` | **Yes** | Subtype classification (e.g., `"Planetary"`, `"Void"`, `"Subterranean"`). |
| `origin_traits` | `string[]` | No | List of selectable origin traits. |
| `native_languages` | `string[]` | No | Granted linguistic proficiencies. |
| `environmental_adaptation` | `string` | No | Innate environmental tolerances (e.g., `"Zero-G"`, `"High Gravity"`, `"Toxic Atmospheres"`). |

---

### 2.4 Archetypes & Modular Roles (`archetypes_database.json`)
Base build archetypes for fast character building and NPC generation.

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"archetype-vanguard"`). |
| `name` | `string` | **Yes** | Archetype title. |
| `role` | `string` | **Yes** | Tactical/narrative function (`"Combat"`, `"Support"`, `"Tech"`, `"Mystic"`). |
| `primary_attributes`| `string[]` | **Yes** | Core favored attributes (e.g., `["strength", "stamina"]`). |
| `suggested_skills` | `string[]` | No | Recommended primary skill IDs. |
| `suggested_traits` | `string[]` | No | Recommended trait IDs. |

---

### 2.5 Traits, Features & Disadvantages

#### Traits (`trait_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"trait-adaptability"`). |
| `name` | `string` | **Yes** | Trait name. |
| `trait_type` | `string` | **Yes** | `"Origin Trait"`, `"Occupational Trait"`, or `"Species Trait"`. |
| `cost_cp` | `number` | **Yes** | Character Point / Creation cost. |
| `origin_association` | `string` | No | Specific origin condition (e.g., `"General"`, `"Colony"`). |
| `occupation_association`| `string` | No | Associated career role (e.g., `"Adept"`, `"Soldier"`). |
| `modifiers` | `object` | No | Key-value mechanics adjustments (dice bonuses, defenses). |

#### Features / Perks (`features_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"feature-deadeye"`). |
| `name` | `string` | **Yes** | Feature title. |
| `tier` | `number` | **Yes** | Progression tier (1 to 5). |
| `ap_cost` | `number` | **Yes** | Advancement Point cost to acquire. |
| `prerequisites` | `string[]` | No | Required stats, skills, or prior features. |
| `passive_effect` | `string` | No | Continuous mechanical bonus. |
| `activated_effect`| `string` | No | Active trigger condition, AP/action cost, and output. |

#### Disadvantages / Hindrances (`disadvantages_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"disadv-code-of-honor"`). |
| `name` | `string` | **Yes** | Disadvantage title. |
| `severity` | `string` | **Yes** | `"Minor"`, `"Major"`, or `"Severe"`. |
| `cp_refund` | `number` | **Yes** | Points gained during character creation. |
| `penalty_condition` | `string` | **Yes** | Trigger rule and mechanical consequence. |

---

### 2.6 Skills (`skills_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Skill identifier (e.g., `"skill-athletics"`). |
| `name` | `string` | **Yes** | Skill title. |
| `governing_attribute` | `string` | **Yes** | Core attribute (`"strength"`, `"agility"`, `"intellect"`, etc.). |
| `untrained_allowed` | `boolean` | **Yes** | Can be attempted without prior rank allocation. |
| `specializations` | `string[]` | No | Valid focus areas (e.g., `["Zero-G", "Climbing", "Running"]`). |

---

## 3. Combat, Gear & Technology Datasets

### 3.1 Weaponry (`weaponry_database.json` / `src/data/omnicortex/weaponry`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"laser-rifle-medium"`). |
| `name` | `string` | **Yes** | Weapon model name. |
| `category` | `string` | **Yes** | `"weaponry"`. |
| `classification` | `string` | **Yes** | Classification & damage mode (e.g., `"Ranged (Laser)"`, `"Melee (Slashing)"`). |
| `damage` | `string` | **Yes** | Damage formula (e.g., `"2d8"`, `"1d10+2"`). |
| `damage_type` | `string` | **Yes** | `"Kinetic"`, `"Energy"`, `"Thermal"`, `"Cryo"`, `"Disruption"`, `"Sonic"`. |
| `wielding` | `string` | **Yes** | `"One-Handed"`, `"Two-Handed"`, `"Mounted"`. |
| `range` | `string` | **Yes** | Effective range bracket (e.g., `"50m"`, `"100/300m"`, `"Engaged/Reach"`). |
| `ammo` | `string` \| `number` | No | Magazine/battery capacity (e.g., `"30"`, `"10 Energy Cell"`). |
| `ap` | `number` | No | Armor Piercing rating (ignores X points of armor). |
| `accuracy` | `number` | No | Flat attack roll modifier. |
| `durability` | `number` | No | Structural threshold / weapon health. |
| `sockets` | `number` | No | Modular component attachment slots. |
| `tl` | `number` | **Yes** | Tech Level. |
| `ml` | `number` | **Yes** | Metaphysics Level. |

---

### 3.2 Armoring & Defensive Gear (`armoring_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"armor-powered-combat-suit"`). |
| `name` | `string` | **Yes** | Armor name. |
| `armor_type` | `string` | **Yes** | `"Light"`, `"Medium"`, `"Heavy"`, `"Powered"`, `"Shield"`. |
| `coverage` | `string[]` | **Yes** | Protected body zones (`["Head", "Torso", "Arms", "Legs"]`). |
| `dr_kinetic` | `number` | **Yes** | Damage Reduction against Kinetic attacks. |
| `dr_energy` | `number` | **Yes** | Damage Reduction against Energy/Thermal attacks. |
| `dr_environmental` | `number` | No | Resistance to radiation, vacuum, biohazards. |
| `encumbrance_penalty` | `number` | No | Agility / Movement penalty. |
| `power_requirements` | `string` | No | Energy cell draw or generator requirements. |

---

### 3.3 Augmentations & Cybernetics (`augmentations_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"aug-subdermal-plating"`). |
| `name` | `string` | **Yes** | Augmentation name. |
| `augmentation_type` | `string` | **Yes** | `"Cybernetic"`, `"Bionic"`, `"Bioware"`, `"Nanotech"`, `"Genemod"`. |
| `body_location` | `string` | **Yes** | Target slot (`"Neural"`, `"Subdermal"`, `"Ocular"`, `"Limb"`, `"Internal"`). |
| `essence_cost` | `number` | **Yes** | Bio-tolerance / Essence capacity impact. |
| `power_drain` | `number` | No | Energy usage per round/hour. |
| `modifiers` | `object` | No | Stat and skill bonus map. |

---

### 3.4 General Gear & Tools (`gear_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"gear-medkit-adv"`). |
| `name` | `string` | **Yes** | Gear title. |
| `gear_category` | `string` | **Yes** | `"Medical"`, `"Communications"`, `"Survival"`, `"Tools"`, `"Electronics"`. |
| `weight` | `number` | No | Weight in kg / encumbrance units. |
| `charges` | `number` | No | Maximum uses or consumable units before replenishment. |

---

## 4. Metaphysics & Psionics Datasets

### 4.1 Invocations & Powers (`invocations_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"invoc-telekinesis-burst"`). |
| `name` | `string` | **Yes** | Power/Invocation title. |
| `discipline` | `string` | **Yes** | Root discipline (e.g., `"Psychokinesis"`, `"Telepathy"`, `"Metashifting"`). |
| `ml` | `number` | **Yes** | Minimum Meta Level requirement. |
| `cost_essence` | `number` | **Yes** | Essence / Mental resource cost to activate. |
| `action_type` | `string` | **Yes** | `"Instant"`, `"Standard Action"`, `"Sustained"`, `"Reaction"`. |
| `range` | `string` | **Yes** | Casting range (`"Self"`, `"Touch"`, `"30m"`, `"Line of Sight"`). |
| `duration` | `string` | **Yes** | `"Instantaneous"`, `"1 Round"`, `"Concentration"`, `"1 Hour"`. |
| `saving_throw` | `string` | No | Resisting attribute and target difficulty formula. |

### 4.2 Disciplines (`disciplines_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"discipline-pyrokinesis"`). |
| `name` | `string` | **Yes** | Discipline name. |
| `governing_attribute` | `string` | **Yes** | Typically `"metaphysics"` or `"willpower"`. |
| `tier_progression` | `object[]` | No | Array of tier thresholds and unlocking perks. |

---

## 5. Factions, Societies & Worldbuilding

### 5.1 Factions (`factions_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"faction-sol-coalition"`). |
| `name` | `string` | **Yes** | Formal faction title. |
| `alignment` | `string` | No | Philosophical / diplomatic disposition. |
| `influence_level` | `number` | No | Galactic scope (1 = Local, 5 = Interstellar Hegemony). |
| `hq_location` | `string` | No | Capital planet, station, or territory. |
| `hostile_factions` | `string[]` | No | Array of opposing faction IDs. |
| `allied_factions` | `string[]` | No | Array of cooperative faction IDs. |

### 5.2 Mecha & Heavy Vehicles (`mecha_database.json`)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Identifier (e.g., `"mecha-titan-v"`). |
| `name` | `string` | **Yes** | Vehicle/Frame designation. |
| `frame_class` | `string` | **Yes** | `"Light Scout"`, `"Medium Striker"`, `"Heavy Siege"`, `"Super-Heavy"`. |
| `structure_points` | `number` | **Yes** | Frame structural hit points. |
| `hardpoints` | `object` | **Yes** | Available weapon/equipment mounting points (e.g., `{ arm_l: 1, arm_r: 1, shoulder: 2 }`). |
| `power_core` | `string` | **Yes** | Reactor type and energy output capacity. |
| `speed_tactical` | `number` | **Yes** | Grid tactical hex/square movement rate. |

---

## 6. Persona Folio & Live Character Schema (`FolioCharacter`)

Used by the Character Builder, Folio sheet, and combat calculators:

```typescript
interface FolioCharacter {
  // Identity
  id: string;                          // Document ID (e.g. "char_1725203948")
  'character-doc-id': string;          // Mirror ID for Firestore sync
  'char-name': string;                 // Operative name
  'char-species': string;              // Species key or name
  'char-occu': string;                 // Occupation key or name
  'char-origin': string;               // Origin key or name
  'char-faction': string;              // Faction alignment
  'char-archetype'?: string;           // Base build archetype
  avatarUrl?: string | null;           // Portrait asset URI

  // Core Attributes (1 to 20 scale)
  attributes: {
    strength: number;
    agility: number;
    stamina: number;
    intellect: number;
    perception: number;
    presence: number;
    tech: number;
    willpower: number;
    charisma: number;
    metaphysics: number;
    luck: number;
    karma: number;
  };

  // Combat & Vital Tracks
  'current-health': number;            // Current HP
  'max-health': number;                // Maximum computed HP
  'current-vitality': number;          // Current Stamina/Vitality
  'max-vitality': number;              // Maximum Stamina/Vitality
  'current-structure'?: number;        // For synthetic/cybernetic entities
  'max-structure'?: number;
  toughness: number;                   // Base DR
  defense: number;                     // Target to hit (default: 12)
  karma: number;                       // Current active Karma pool
  maxKarma: number;                    // Maximum Karma points

  // Progression
  earned_ap: number;                   // Lifetime Advancement Points
  available_ap: number;                // Unspent Advancement Points
  earned_cp: number;                   // Creation Points

  // Inventory & Capabilities
  skills: Record<string, number>;      // Map of skill IDs to rank numbers
  traits: string[];                    // Array of trait IDs
  features: string[];                  // Array of feature IDs
  disadvantages: string[];             // Array of disadvantage IDs
  inventory: Array<{                   // Slotted equipment items
    itemId: string;
    name: string;
    quantity: number;
    equipped: boolean;
    customModifiers?: Record<string, any>;
  }>;

  // Narrative
  'narrative-backstory'?: string;      // Backstory notes / history
  notes?: string;
  updatedAt: string;                   // ISO 8601
}
```

---

## 7. Story Foundry & Worldbuilding Element Schema (`FoundryElement`)

Used by the Story Foundry, campaign editor, and lore compendium:

```typescript
interface FoundryElement {
  id: string;                          // "elem_species_1725203948"
  type: 'Persona' | 'Species' | 'Occupation' | 'Faction' | 'Location' | 'Item' | 'Lore' | 'Chapter';
  title: string;                       // Entity header
  content: string;                     // Markdown document content
  parentModuleId?: string;             // Attached campaign / world ID
  fields: {
    tl?: number;                       // Tech Level (0-10)
    ml?: number;                       // Meta Level (0-10)
    cost?: number;                     // Economy pricing
    category: string;                  // Subcategory
    tags: string[];                    // Indexing tags
    [customKey: string]: any;          // Dynamic dataset attributes
  };
  updatedAt: string;
}
```

---

## 8. Virtual Tabletop (VTT) & Tactical Token Schema (`VttToken`)

Used for battlemap rendering, grid calculations, and combat state tracking:

```typescript
interface VttToken {
  id: string;                          // Token UUID
  linkedHeroId?: string;               // Reference to Folio Character ID
  label: string;                       // Display nametag
  x: number;                           // Grid coordinate X
  y: number;                           // Grid coordinate Y
  z?: number;                          // Elevation / Layer index
  size: number;                        // Grid footprints (1 = 1x1 cell, 2 = 2x2 cell)
  rotation: number;                    // Facing angle in degrees (0 - 360)
  
  // Health & Trackers
  health: { current: number; max: number };
  vitality: { current: number; max: number };
  structure?: { current: number; max: number };
  isSynthetic: boolean;
  defense: number;
  toughness: number;
  karma: number;

  // Visuals & Status
  avatarUrl?: string | null;
  tintColor?: string;
  conditions: string[];                // E.g. ["Stunned", "Prone", "Cover (Half)"]
  visionRange: number;                 // Vision / fog-of-war radius in grid units
  darkvision: boolean;
}
```

---

## 9. Parser Transformation & Normalization Matrix

When ingesting or bridging datasets across modules, adapters adhere to these standardized rules:

| Source Property | Normalized Target Property | Fallback Default | Notes |
| :--- | :--- | :--- | :--- |
| `name`, `char-name`, `title`, `label` | `name` / `title` | `"Unnamed Entity"` | Extracted via `extractCanonicalName()`. |
| `tl`, `techLevel`, `TL` | `tl` | `3` | Standardized to integer. |
| `ml`, `metaLevel`, `ML` | `ml` | `0` | Standardized to integer. |
| `cost`, `price`, `cost_cp`, `ap_cost` | `cost` / respective cost field | `0` | Numeric unit representation. |
| `description`, `content`, `summary`, `body` | `description` / `content` | `""` | Preserves Markdown formatting. |
| `tags`, `category` | `tags` | `[categoryKey]` | Normalized array of lower-case strings. |
