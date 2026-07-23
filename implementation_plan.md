# Comprehensive Master Inventory & React Migration Audit for Tangent DBM

This document provides an exhaustive, field-by-field, function-by-function inventory of the **Tangent SFF RPG Database Manager (DBM)**. It serves as the authoritative blueprint for migrating the existing vanilla JavaScript/Firebase implementation (`js/dbm-script.js` and `js/category-config.js`) into a modern, component-driven **React architecture** without dropping any fields, properties, calculation rules, or subcategory relationships.

---

## 1. Executive Summary & Migration Goals

The current DBM application is driven by a schema configuration object (`categoryConfig` in `js/category-config.js`) and a monolithic script (`js/dbm-script.js`). During initial React migration attempts, key data schemas (such as **SPECIES**, **ORIGINS**, **OCCUPATIONS**, **FACTIONS**, **WEAPONRY**, etc.) lost key fields because the complex nested field schemas and dynamic component logic were omitted or simplified.

### Key Objectives for Complete React Migration:
1. **100% Field Parity**: Preserve all 25+ categories, 30+ subcategories, and every single field attribute (`type`, `label`, `source`, `manageable`, `required`, `aiEnabled`, `options`, `default`, `hidden`).
2. **Master Field Order**: Retain the standard visual field sequence (`masterFieldOrder`) across form views.
3. **Dynamic Inter-Field Dependencies**: Port real-time reactive fields (e.g., Aspect $\rightarrow$ Subtype dropdowns in Modifiers/Prerequisites, Shape $\rightarrow$ Dimensions in Area, Type $\rightarrow$ Subtype & Base Skill in Skills).
4. **Calculated Field Engines**: Port Design DC summing and total CP calculations.
5. **Unified Selector & Nested Creation**: Convert `openUnifiedSelectorModal` into reusable React Modals/Comboboxes supporting on-the-fly record creation.
6. **State & Permission Management**: Translate Role-Based Access Control (RBAC with Owner/Admin/Contributor/Guest) and Dev Mode / Game Mode toggles into React Context & Hooks.

---

## 2. Complete Category & Field Inventory

Below is the complete inventory of all categories, their subcategories, view types, directory columns, and every individual field property.

---

### 2.1 Core Character & Setting Categories

#### 1. `species` (SPECIES)
- **View Type**: `table`
- **Directory Columns**: `['name', 'description', 'type']`
- **Subcategories**:
  1. `species_type` (TYPES) — Columns: `['name', 'description', 'modifier']`
     - Fields: `name` (text, req), `prerequisite` (multiselect, source: `prerequisite`, manageable), `modifier` (multiselect, source: `modifier`, manageable), `description` (textarea, ai), `mechanic` (textarea), `note` (textarea), `cp` (readonlytext)
  2. `species_size` (SIZES) — Columns: `['name', 'description', 'modifier']`
     - Fields: `name` (text, req), `modifier` (multiselect, source: `modifier`, manageable), `description` (textarea, ai), `scaling` (number), `height_length_range` (text), `weight_range` (text), `reach` (text), `mechanic` (textarea), `note` (textarea), `dc` (number), `cp` (readonlytext)
  3. `species_movement` (MOVEMENTS) — Columns: `['name', 'description', 'cp']`
     - Fields: `name` (text, req), `prerequisite` (multiselect, source: `prerequisite`, manageable), `modifier` (multiselect, source: `modifier`, manageable), `description` (textarea, ai), `mechanic` (textarea), `note` (textarea), `cp` (readonlytext)
- **Top-Level Fields**:
  - `name` (type: `text`, required: `true`)
  - `description` (type: `textarea`, aiEnabled: `true`)
  - `prerequisite` (type: `multiselect`, source: `prerequisite`, manageable: `true`)
  - `type` (type: `multiselect`, source: `species_type`, manageable: `true`)
  - `size` (type: `multiselect`, source: `species_size`, manageable: `true`)
  - `movement` (type: `multiselect`, source: `species_movement`, manageable: `true`)
  - `modifier` (type: `multiselect`, source: `modifier`, manageable: `true`)
  - `bonus_skills` (type: `json_list`, source: `skills`, label: `'Bonus Skills'`)
  - `bonus_skill_options` (type: `multiselect`, source: `skills`, label: `'Bonus Skill Options'`, manageable: `true`)
  - `bonus_skill_choices` (type: `number`, label: `'Bonus Skill Choices'`)
  - `bonus_skill_points` (type: `number`, label: `'Bonus ANY Skill Points'`)
  - `bonus_skill_points_physical` (type: `number`, label: `'Bonus Physical Skill Points'`)
  - `bonus_skill_points_mental` (type: `number`, label: `'Bonus Mental Skill Points'`)
  - `bonus_skill_points_social` (type: `number`, label: `'Bonus Social Skill Points'`)
  - `bonus_skill_points_combat` (type: `number`, label: `'Bonus Combat Skill Points'`)
  - `bonus_skill_points_meta` (type: `number`, label: `'Bonus Meta Skill Points'`)
  - `bonus_disciplines` (type: `number`, label: `'Bonus Disciplines'`)
  - `bonus_special_abilities` (type: `number`, label: `'Bonus Special Abilities'`)
  - `bonus_features` (type: `multiselect`, source: `features`, label: `'Bonus Features'`, manageable: `true`)
  - `bonus_feature_options` (type: `multiselect`, source: `features`, label: `'Bonus Feature Options'`, manageable: `true`)
  - `bonus_feature_choices` (type: `number`, label: `'Bonus Feature Choices'`)
  - `bonus_feature_points_ability` (type: `number`, label: `'Bonus Ability Feature Points'`)
  - `bonus_feature_points_combat` (type: `number`, label: `'Bonus Combat Feature Points'`)
  - `bonus_feature_points_meta` (type: `number`, label: `'Bonus Meta Feature Points'`)
  - `bonus_feature_points` (type: `number`, label: `'Bonus ANY Feature Points'`)
  - `bonus_feature_points_general` (type: `number`, label: `'Bonus General Feature Points'`)
  - `bonus_feature_points_karma` (type: `number`, label: `'Bonus Karma Feature Points'`)
  - `bonus_feature_points_skill` (type: `number`, label: `'Bonus Skill Feature Points'`)
  - `bonus_feature_points_exotic` (type: `number`, label: `'Bonus Exotic Feature Points'`)
  - `recommended_features` (type: `multiselect`, source: `features`, label: `'Recommended Features'`, manageable: `true`)
  - `note` (type: `textarea`)
  - `cp` (type: `readonlytext`, label: `'CP'`)

---

#### 2. `origins` (ORIGINS)
- **View Type**: `table`
- **Directory Columns**: `['name', 'description']`
- **Subcategories**:
  1. `trait` (TRAITS) — Columns: `['name', 'description', 'cp']`
     - Fields: `name` (text, req), `prerequisite` (multiselect, source: `prerequisite`, manageable), `tech_level` (select, options: [0..5]), `meta_level` (select, options: [0..5]), `modifier` (multiselect, source: `modifier`, manageable), `description` (textarea, ai), `mechanic` (textarea), `note` (textarea), `cp` (readonlytext)
- **Top-Level Fields**:
  - `name` (type: `text`, required: `true`)
  - `description` (type: `textarea`, aiEnabled: `true`)
  - `prerequisite` (type: `multiselect`, source: `prerequisite`, manageable: `true`)
  - `modifier` (type: `multiselect`, source: `modifier`, manageable: `true`)
  - `bonus_skills` (type: `json_list`, source: `skills`, label: `'Bonus Skills'`)
  - `bonus_skill_options` (type: `multiselect`, source: `skills`, label: `'Bonus Skill Options'`, manageable: `true`)
  - `bonus_skill_choices` (type: `number`, label: `'Bonus Skill Choices'`)
  - `bonus_skill_points`, `bonus_skill_points_physical`, `bonus_skill_points_mental`, `bonus_skill_points_social`, `bonus_skill_points_combat`, `bonus_skill_points_meta` (type: `number`)
  - `bonus_disciplines`, `bonus_special_abilities` (type: `number`)
  - `bonus_features`, `bonus_feature_options` (type: `multiselect`, source: `features`, manageable: `true`)
  - `bonus_feature_choices`, `bonus_feature_points_ability`, `bonus_feature_points_combat`, `bonus_feature_points_meta`, `bonus_feature_points`, `bonus_feature_points_general`, `bonus_feature_points_karma`, `bonus_feature_points_skill`, `bonus_feature_points_exotic` (type: `number`)
  - `recommended_features` (type: `multiselect`, source: `features`, manageable: `true`)
  - `trait` (type: `multiselect`, source: `trait`, manageable: `true`)
  - `mechanic` (type: `textarea`)
  - `note` (type: `textarea`)

---

#### 3. `occupations` (OCCUPATIONS)
- **View Type**: `table`
- **Directory Columns**: `['name', 'description']`
- **Fields**:
  - `name` (text, req), `description` (textarea, ai), `prerequisite` (multiselect, source: `prerequisite`, manageable), `modifier` (multiselect, source: `modifier`, manageable)
  - `bonus_skills` (json_list), `bonus_skill_options` (multiselect), `bonus_skill_choices`, `bonus_skill_points` + physical/mental/social/combat/meta (number)
  - `bonus_disciplines`, `bonus_special_abilities` (number)
  - `bonus_features`, `bonus_feature_options` (multiselect), `bonus_feature_choices`, `bonus_feature_points` + ability/combat/meta/general/karma/skill/exotic (number)
  - `recommended_features` (multiselect), `trait` (multiselect)
  - `tech_level` (select, options: [0..5]), `meta_level` (select, options: [0..5])
  - `mechanic` (textarea), `note` (textarea)

---

#### 4. `factions` (FACTIONS)
- **View Type**: `table`
- **Directory Columns**: `['name', 'description', 'society']`
- **Fields**:
  - `name` (text, req), `description` (textarea, ai)
  - `society` (select, source: `societies`, manageable: `true`)
  - `prerequisite`, `modifier`, `bonus_features`, `bonus_feature_options`, `recommended_features` (multiselect, manageable)
  - `bonus_skills` (json_list), all `bonus_skill_points` & `bonus_feature_points` breakdown fields
  - `attitude` (textarea), `goals` (textarea), `social_strengths` (textarea), `social_weaknesses` (textarea), `mechanic` (textarea), `note` (textarea)

---

#### 5. `skills` (SKILLS)
- **View Type**: `table`
- **Directory Columns**: `['name', 'type', 'subtype', 'description']`
- **Fields**:
  - `name` (text, req)
  - `type` (select, options: `['mental', 'physical', 'social', 'combat', 'meta']`, req)
  - `subtype` (select, options: `['knowledge', 'vocation', 'manipulation', 'expression', 'archaic', 'modern', 'advanced']`)
  - `is_specialization` (boolean, label: `'SPECIALIZATION'`)
  - `base_skill` (select, source: `skills`, label: `'BASE SKILL'`)
  - `description` (textarea, ai)
  - `tech_level` (select, [0..5]), `meta_level` (select, [0..5])
  - `mechanic` (textarea), `note` (textarea)

---

#### 6. `features` (FEATURES)
- **View Type**: `table`
- **Directory Columns**: `['name', 'type', 'description', 'cp']`
- **Fields**:
  - `name` (text, req)
  - `type` (select, options: `['ability', 'combat', 'meta', 'general', 'karma', 'skill', 'exotic', 'Special Ability']`)
  - `description` (textarea, ai)
  - `tech_level` (select, [0..5]), `meta_level` (select, [0..5])
  - `prerequisite` (multiselect, source: `prerequisite`, manageable)
  - `modifier` (multiselect, source: `modifier`, manageable)
  - `cp` (number, label: `'CP Cost'`), `costManuallyAdjusted` (boolean)
  - `mechanic` (textarea), `note` (textarea)
  - `multi` (boolean), `staged` (boolean)

---

#### 7. `disciplines` (DISCIPLINES)
- **Hide From Menu**: `true`
- **Directory Columns**: `['name', 'description']`
- **Fields**: `name`, `description`, `prerequisite`, `modifier`, `discipline_skills` (multiselect, source: `skills`, manageable), `mechanic`, `note`

---

#### 8. `disadvantages` (DISADVANTAGES)
- **View Type**: `table`
- **Directory Columns**: `['name', 'description', 'cp']`
- **Fields**: `name`, `description` (ai), `tech_level`, `meta_level`, `prerequisite`, `modifier`, `cp` (number), `mechanic`, `note`

---

#### 9. `invocations` & `special_abilities`
- **View Type**: `table`
- **Directory Columns**: `['name', 'description', 'discipline', 'meta_skill', 'design_dc']`
- **Fields**:
  - `name`, `description` (ai)
  - `discipline` (select, source: `disciplines`, manageable)
  - `meta_skill` (select, source: `skills_meta`, label: `'Meta Skill'`)
  - `area` (multiselect, source: `area`, manageable)
  - `effect` (multiselect, source: `effect`, manageable)
  - `range` (multiselect, source: `range`, manageable)
  - `target` (multiselect, source: `target`, manageable)
  - `prerequisite`, `modifier` (multiselect, manageable)
  - `critical_success_effect`, `critical_failure_effect` (multiselect, manageable)
  - `design_dc` (readonlytext, label: `'DESIGN DC'`)
  - `mechanic`, `tech_level`, `meta_level`, `note`

---

#### 10. `augmentations` (AUGMENTATIONS)
- **View Type**: `table`
- **Directory Columns**: `['name', 'type', 'description', 'design_dc']`
- **Subcategories**:
  1. `augmentation_type` — Columns: `['name', 'description']`
  2. `body_location` — Columns: `['name', 'description']`
- **Fields**:
  - `name`, `type` (select, source: `augmentation_type`, manageable), `classification` (multiselect, source: `classification`, manageable), `location` (multiselect, source: `body_location`, manageable)
  - `description` (ai), `tech_level`, `meta_level`
  - `creator`, `design`, `component`, `prerequisite`, `modifier`, `critical_success_effect`, `critical_failure_effect` (multiselect, manageable)
  - `cost`, `availability` (select, source: `availability`, manageable), `cr`, `restricted` (boolean)
  - `design_dc` (readonlytext), `cp` (number), `mechanic`, `note`

---

### 2.2 Personal Property Suite (`personal_property` Parent)

Landing Page with sub-items: `['gear', 'weaponry', 'armoring', 'mecha', 'other']`.

#### 1. `armoring` (Armoring)
- **Directory Columns**: `['name', 'tl', 'ml', 'description', 'cost', 'resistance', 'design_dc']`
- **Subcategories**: `availability`, `material`, `resistance`, `creator`, `design`, `classification`
- **Fields**: `name`, `description`, `tl`, `ml`, `cost`, `availability`, `design_dc`, `size`, `weight`, `quality` (select: `['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted']`), `durability`, `prerequisite`, `skill` (select, source: `skills`), `origin`, `creator`, `design`, `classification`, `material`, `location`, `component`, `resistance`, `critical_success_effect`, `critical_failure_effect`, `component_slots` (number), `modes` (multiselect, source: `mode`), `modifier`, `mechanic`, `note`

#### 2. `weaponry` (Weaponry)
- **Directory Columns**: `['name', 'tl', 'ml', 'description', 'cost', 'effect', 'design_dc']`
- **Subcategories**: `availability`, `special`, `mode`, `critical_effect`, `creator`, `design`, `classification`
- **Fields**: `name`, `description`, `tl`, `ml`, `cost`, `availability`, `design_dc`, `size`, `weight`, `quality`, `durability`, `prerequisite`, `skill`, `special`, `area`, `effect`, `range`, `target`, `origin`, `creator`, `design`, `classification`, `accuracy`, `ap`, `modes`, `attack_rate` (`Rate of Fire`), `critical_score`, `critical_effect`, `critical_success_effect`, `critical_failure_effect`, `wielding` (select: `['One-Handed', 'Two-Handed', 'Versatile', 'Independent', 'Mounted']`), `component`, `component_slots`, `modifier`, `mechanic`, `note`

#### 3. `gear` (Gear)
- **Directory Columns**: `['name', 'category', 'description', 'cost', 'weight']`
- **Subcategories**: `gear_category`, `availability`
- **Fields**: `name`, `description`, `category` (select, source: `gear_category`), `cost`, `weight`, `tl`, `ml`, `availability`, `prerequisite`, `modifier`, `mechanic`, `note`

#### 4. `mecha` (Mecha)
- **Directory Columns**: `['name', 'tl', 'ml', 'description', 'cost', 'design_dc']`
- **Fields**: `name`, `description`, `tl`, `ml`, `cost`, `availability`, `design_dc`, `size`, `height`, `weight`, `quality`, `durability`, `prerequisite`, `skill`, `origin`, `creator`, `design`, `classification`, `personnel`, `cargo`, `speed`, `maneuverability`, `control` (select: `['Auto', 'Remote', 'Pilot', 'Crew']`), `component`, `critical_success_effect`, `critical_failure_effect`, `component_slots`, `modes`, `modifier`, `mechanic`, `note`

#### 5. `other` (Other)
- **Directory Columns**: `['name', 'description', 'cost', 'weight']`
- **Fields**: `name`, `description`, `cost`, `weight`, `tl`, `ml`, `availability`, `prerequisite`, `modifier`, `mechanic`, `note`

---

### 2.3 Dev-Mode Foundational Categories

#### 1. `societies` (SOCIETIES)
- **Hide From Menu**: `true` | **Columns**: `['name', 'description', 'tech_level', 'meta_level']`
- **13 Subcategories**: `society_agriculture`, `society_architecture`, `society_biotechnology`, `society_commerce`, `society_communication`, `society_devices`, `society_education`, `society_energy`, `society_manufacturing`, `society_materials`, `society_medicine`, `society_society`, `society_synthetics`, `society_weaponry`
  - Subcategory fields: `name` (req), `description` (ai), `level` (select [0..5]), `prerequisite`, `modifier`, `note`, `mechanic`
- **Top-Level Fields**: `name`, `description`, `tech_level`, `meta_level`, `prerequisite`, `modifier`, all 14 society subcategory multiselects (`agriculture` .. `weaponry`), `mechanic`, `note`

#### 2. `values`, `secondary_values`, `tertiary_values`
- **Hide From Menu**: `true`
- **Fields**: `name` (req), `description` (ai), `modifier` (multiselect), `mechanic`, `cp` (number)

#### 3. `prerequisite` (PREREQUISITES)
- **Hide From Menu**: `true` | **Columns**: `['name', 'aspect', 'aspect_subtype', 'value', 'note', 'cp']`
- **Fields**: `name` (req), `description` (ai), `aspect` (select: `['attribute', 'skill', 'combat', 'meta', 'other']`), `aspect_subtype` (select, dynamic), `value` (number), `dc` (number), `mechanic`, `note`, `cp` (number)

#### 4. `modifier` (MODIFIERS)
- **Hide From Menu**: `true` | **Columns**: `['name', 'aspect', 'aspect_subtype', 'value', 'note', 'cp']`
- **Fields**:
  - `name` (req), `description` (ai)
  - `aspect` (select: `['attribute', 'skill', 'combat', 'other', 'feature']`)
  - `aspect_subtype` (select, dynamic options)
  - `bonus_scope` (radio: `['any', 'specific']`, hidden by default)
  - `bonus_feature_categories` (multiselect: `['ability', 'combat', 'meta', 'general', 'karma', 'skill', 'exotic']`, hidden)
  - `bonus_skill_categories` (multiselect: `['mental', 'physical', 'social', 'combat', 'meta']`, hidden)
  - `bonus_attribute_options` (multiselect: 12 attributes, hidden)
  - `skill_bonus_type` (radio: `['adjust', 'grant']`, hidden)
  - `granted_skill_id` (select, source: `skills`, hidden)
  - `value` (number)
  - `modifier_type` (radio: `['constant', 'situational', 'optional', 'temporary']`)
  - `dc` (number), `mechanic`, `note`, `cp` (number)

#### 5. `rules_codex` (RULES CODEX)
- **View Type**: `wiki`
- **Fields**: `name` (req), `description` (textarea/Quill), `mechanic` (textarea), `note` (textarea), `guide` (textarea), `parent` (select, source: `rules_codex`), `order` (number, default: 0)

#### 6. `user_guide` (User Guide)
- **View Type**: `guide` (Renders markdown user manual)

---

## 3. Detailed Inventory of Application Functions & Logic

The React architecture must faithfully replicate all operational logic currently housed in `js/dbm-script.js`:

### 3.1 Authentication & Role-Based Access Control (RBAC)
- **`OWNER_UID`**: `"09bdwApxw5UZ9BQTo7LXXdSsqx13"`
- **User Roles**: `guest` (anonymous), `contributor` (Google auth default), `admin`, `owner`.
- **`hasPermission(action, itemData)` Logic**:
  - If `devMode === false` (Game Mode): All write actions (`create`, `edit`, `delete`) return `false`.
  - In Dev Mode:
    - `create`: allowed for `owner`, `admin`, `contributor`.
    - `edit`/`delete`: allowed for `owner` & `admin` globally; allowed for `contributor` **ONLY IF** `itemData.creatorId === userId`.
- **State Properties**: `userId`, `isAnonymous`, `userRole`, `devMode`.

### 3.2 Master Field Order (`masterFieldOrder`)
To ensure form layout consistency across components, fields must be rendered in this precise array order:
```javascript
[
  'name', 'description', 'mechanic', 'guide', 'effect_type', 'value', 'aspect', 'aspect_subtype', 'bonus_scope', 'bonus_feature_categories', 'bonus_skill_categories', 'bonus_attribute_options', 'modifier_type', 'shape', 'dimensions', 'number_of_targets',
  'tech_level', 'meta_level', 'class', 'classification', 'category', 'type', 'subtype',
  'cr', 'cost', 'availability', 'dc', 'cp', 'restricted', 'component_slots',
  'location', 'size', 'height', 'weight', 'scaling', 'height_length_range', 'weight_range', 'personnel', 'cargo', 'reach', 'weapon_effect', 'wielding',
  'movement', 'speed',
  'quality', 'material', 'durability', 'resistance',
  'prerequisite', 'modifier', 'abilities',
  'ammunition_type', 'ap', 'area', 'attack_rate', 'damage', 'damage_type', 'damage_value', 'effect', 'effect_subtype', 'range', 'target', 'critical_score', 'critical_success_effect', 'critical_failure_effect', 'critical_effect',
  'skill', 'meta_skill', 'faction_skill', 'profession_skill', 'species_skill', 'is_specialization', 'base_skill', 'discipline', 'accuracy', 'control', 'maneuverability',
  'faction_feat', 'recommended_feature',
  'trait',
  'attitude', 'social_strengths', 'social_weaknesses', 'society', 'goals',
  'component', 'integration',
  'special',
  'modes', 'note', 'parent', 'order'
]
```

### 3.3 Dynamic Inter-Field Reactive Behaviors
1. **Modifier / Prerequisite Dynamic Aspect Subtypes**:
   - Selecting `aspect = 'attribute'` displays attributes list and reveals `bonus_scope`.
   - Selecting `aspect = 'skill'` displays skills list, reveals `skill_bonus_type` ('adjust' vs 'grant'), and toggles `granted_skill_id` vs `bonus_scope`.
   - Selecting `aspect = 'feature'` reveals `bonus_scope` and feature categories.
   - Selecting `aspect = 'combat'` displays combat stats (health, vitality, initiative, attack types, DRs, etc.).
   - Selecting `aspect = 'other'` displays generic properties (karma, size, speeds, perception, etc.).
2. **Skill Specialization Dependency**:
   - Selecting `type` in `['mental', 'social', 'combat']` reveals `subtype`.
   - Toggling `is_specialization === true` reveals `base_skill` dropdown.
3. **Area Shape Dependencies**:
   - `shape === 'burst'` $\rightarrow$ Options: 5ft/15ft/30ft/60ft radius.
   - `shape === 'cone'` $\rightarrow$ Options: 15ft/30ft/45ft length.
   - `shape === 'line'` $\rightarrow$ Options: 30ft/60ft/90ft length.
   - `shape === 'cubes'` $\rightarrow$ Read-only string: `"10ft x 10ft x 10ft cube per invocation level"`.
4. **Dynamic DC Calculation Engine (`setupDynamicCalculations`)**:
   - Sums all `data-dc` values from checked checkboxes and selected options in the form to populate `design_dc`.

### 3.4 Data Sanitization & Normalization (`saveCurrentForm`)
Before saving any document to Firestore:
- `multiselect` fields are guaranteed to be saved as JavaScript `Array<string>` (even if 0 or 1 item selected).
- `number` and `readonlytext` fields are parsed to pure JavaScript numbers (fallback to `0`).
- `boolean` fields are cast to true boolean primitives.
- `json_list` fields default to `'[]'`.
- `searchName` field is automatically indexed as `(name || '').toLowerCase()`.
- `creatorId` and `creatorEmail` metadata are preserved on updates and attached on creations.

### 3.5 AI Integration (Bastion Chat)
- Callable Cloud Function: `callRpgAssistantV3`.
- Maintains up to 20 conversation history turns.
- Renders Markdown responses via `marked`.
- Integrates Gemini API key management via Settings Modal and `localStorage.getItem('geminiApiKey')`.

---

## 4. Proposed React Component Architecture

To ensure clean state management and modularity, the React codebase will be organized under `src/components/dbm/`:

```
src/
├── types/
│   └── dbm.ts                      # TypeScript interfaces for Config, Categories, Fields, Items
├── context/
│   ├── AuthContext.tsx             # Firebase Auth, User Roles, Permissions Hook
│   └── DBMContext.tsx              # Active category, navigation history, Dev Mode state
├── hooks/
│   ├── useFirestoreCollection.ts   # Real-time listener hook with search/sort/filter
│   └── useDynamicForm.ts           # Form state, dynamic visibility & DC sum calculations
└── components/
    └── dbm/
        ├── DBMApp.tsx              # Main Layout Wrapper
        ├── DBMHeader.tsx           # Navigation arrows, Game/Dev toggle, Bastion trigger, Settings
        ├── DBMSidebar.tsx          # Main Categories, Parent/Sub-item accordions, OTHER separator
        ├── views/
        │   ├── TableView.tsx       # Standard table view with search bar and ADD NEW button
        │   ├── WikiView.tsx        # Rules Codex tree directory and preview pane
        │   ├── LandingView.tsx     # Personal Property parent hub
        │   └── GuideView.tsx       # User Guide rendered markdown
        ├── modals/
        │   ├── EntryModal.tsx      # Core edit/view modal with master field order
        │   ├── UnifiedSelectorModal.tsx # Multi-select combobox with inline record creation
        │   ├── BastionChatModal.tsx # Bastion AI Assistant sliding drawer
        │   ├── UnsavedChangesModal.tsx
        │   ├── SummaryModal.tsx
        │   └── SettingsModal.tsx
        └── fields/
            ├── FormField.tsx       # Router component mapping field types to controls
            ├── ManageableField.tsx # Renders value display + "Select [Label]" modal trigger
            ├── JsonListEditor.tsx  # Interactive requirement builder for bonus_skills
            └── RichTextEditor.tsx  # Quill/TipTap wrapper for Rules Codex
```

---

## 5. Verification & Testing Plan

### Automated Tests
1. **Schema Validation Tests**: Validate that `categoryConfig` in React contains every field key present in `js/category-config.js`.
2. **Form Sanitization Tests**: Unit test `saveCurrentForm` sanitization functions to verify array wrapping, number coercions, and string fallbacks.
3. **Permission Matrix Tests**: Test `hasPermission` against all role combinations in both Game Mode and Dev Mode.

### Manual Verification Steps
1. **SPECIES Verification**: Create a new Species entry in Dev Mode. Verify all 32 fields render in correct order, bonus skills JSON list operates, and manage selectors link correctly.
2. **ORIGINS & OCCUPATIONS Verification**: Edit an Origin/Occupation and verify trait selectors, TL/ML dropdowns, and point breakdown inputs persist cleanly to Firestore.
3. **MODIFIERS Reactive Tests**: Change aspect to `attribute`, `skill`, `combat`, `feature` and confirm dynamic sub-fields update without throwing errors.
4. **Bastion Chat Tests**: Open Bastion, send a prompt, and verify streamed response and history tracking.
