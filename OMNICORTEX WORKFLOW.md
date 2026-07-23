# Database Manager (DBM) - Comprehensive System Documentation

## Overview of Section Workflows

### 1. Universal System Workflows

* **Game Mode vs. Dev Mode Workflow**: 
  * **Game Mode (Read-Only)**: Default mode during tabletop play. Hides all "ADD NEW" buttons, forces fields into read-only states, hides administrative sidebar categories ("OTHER"), and prevents accidental edits.
  * **Dev Mode (Editable)**: Unlocks full creation, editing, deletion, item linking, and reveals the "OTHER" menu (Prerequisites & Modifiers) for authorized Contributors/Admins.
* **Role-Based Access Control (RBAC)**: Guests have read-only access. Contributors can create entries and edit/delete their own creations. Admins/Owners have unrestricted create/edit/delete access across all collections.
* **Modal Sub-Navigation (`navigationContext`)**: When editing an entry and linking/creating a child item (e.g., creating a *Modifier* from within a *Species* form), the parent form state is preserved. A **BACK** button appears in the header, allowing multi-level nested edits without losing unsaved changes.
* **Dynamic Calculation Workflow (`setupDynamicCalculations`)**: Items with a `design_dc` field (Invocations, Augmentations, Armoring, Weaponry, Mecha) automatically compute design DC in real-time as users toggle checkboxes or select dropdown options with `data-dc` attributes.

---

### 2. Section-Specific Workflows

* **Rules Codex (`rules_codex`)**:
  * **Workflow**: Uses a two-panel Wiki interface. Authors build hierarchical article trees using parent assignments and order indices. Content is formatted via the Quill Rich Text Editor. Inline `[[Article Name]]` bracket tags are automatically parsed into clickable hyperlinks to jump between codex articles.

* **Character Foundations (Species, Factions, Origins, Occupations)**:
  * **Workflow**: Authors define narrative identity (descriptions, attitudes, goals), link subcategory options (Types, Sizes, Traits) via the Unified Selector, configure bonus skill requirement lists via the JSON List Editor, and set free skill & feature point pools. CP costs from subcomponents automatically sum up to compute `TOTAL CP`.

* **Capabilities & Rules Engine (Skills, Features, Disciplines, Disadvantages)**:
  * **Workflow**: Skills are categorized by type and subtype; checking `is_specialization` dynamically reveals a `base_skill` selector. Features & Disadvantages set Tech/Meta levels, point costs (`cp`), multi-stage flags (`multi`, `staged`), and link prerequisites/modifiers. Disciplines group specific skills under magic/meta umbrellas.

* **Powers & Spells (Invocations & Special Abilities)**:
  * **Workflow**: Authors bind powers to a governing Discipline and Meta Skill, select modular area shapes/dimensions (bursts, cones, lines, cubes), range, target parameters, and critical effects. The dynamic calculation engine automatically calculates the resulting **DESIGN DC**.

* **Body Enhancements (Augmentations)**:
  * **Workflow**: Author selects Augmentation Type and Body Location (Head, Torso, Arms, Legs, Neural), sets Tech/Meta levels, Credit Cost, Availability grade, Challenge Rating (CR), and illegal/restricted flags. Links prerequisites, stat modifiers, and component slots.

* **Worldbuilding & Civilization (Societies & Tech Pillars)**:
  * **Workflow**: Authors define high-level societal parameters, TL/ML ranges, and cultural modifiers, then calibrate technology ratings (Levels 0 through 5) across 14 individual societal sectors (*Agriculture, Architecture, Biotechnology, Commerce, Communication, Devices, Education, Energy, Manufacturing, Materials, Medicine, Society, Synthetics, Weaponry*).

* **Foundational Mechanics (Prerequisites & Modifiers)**:
  * **Workflow**: Managed under the "OTHER" menu in Dev Mode. Prerequisites select aspect types (`attribute`, `skill`, `combat`, `meta`, `other`) which dynamically update `aspect_subtype` options and thresholds. Modifiers select aspects, scopes (`any` vs `specific`), bonus types (`adjust` vs `grant`), modifier types (`constant`, `situational`, `optional`, `temporary`), and numerical values.

* **Equipment & Property (Armoring, Weaponry, Gear, Mecha, Other)**:
  * **Workflow**: Branches from the Personal Property landing view into table directories. Weapons and armor set TL/ML, cost, availability, size, weight, quality rating (`Bad` to `Mastercrafted`), durability, component slots, weapon accuracy, AP, RoF, critical score, and wielding styles (`One-Handed`, `Two-Handed`, `Versatile`, `Independent`, `Mounted`), updating **DESIGN DC** dynamically. Mecha configure control modes (`Auto`, `Remote`, `Pilot`, `Crew`), speed, personnel, cargo, and maneuverability.

* **AI Copilot Workflow (BASTION Integration)**:
  * **Workflow**: Accessible via the slide-out chat modal (`#bastion-modal`). Messages automatically append contextual metadata (active page, current entry) and trigger cloud function calls to Gemini AI (`callRpgAssistantV3`). Responses render markdown formatting and intercept slash commands like `/roll`.

---

# Database Manager (DBM) - Complete Modal Catalog

This document provides an exhaustive reference catalog of all modals and their contained fields within the **Tangent SFF RPG Database Manager (DBM)** application.

---

## 1. Overview of Database Manager Modals

The Database Manager system utilizes 10 distinct modal dialogs to handle settings, entry creation/editing, confirmation workflows, item selection, error alerts, and AI assistance.

| Modal Name | Element DOM ID | Primary File(s) | Description |
| :--- | :--- | :--- | :--- |
| **Settings Modal** | `#settings-modal` | `pages/dbm.html`, `js/dbm-script.js` | Configures global settings such as the Gemini API Key. |
| **Entry Modal** | `#entry-modal` | `pages/dbm.html`, `js/dbm-script.js`, `js/category-config.js` | Core dynamic form container for viewing, creating, and editing entries across all 20+ RPG database categories. |
| **Summary Modal** | `#summary-modal` | `pages/dbm.html`, `js/dbm-script.js` | Displays a formatted, human-readable summary of the current entry data. |
| **Confirm Modal** | `#confirm-modal` | `pages/dbm.html`, `js/dbm-script.js` | Confirmation prompt for destructive actions (e.g. entry deletion). |
| **Unsaved Changes Modal** | `#unsaved-changes-modal` | `pages/dbm.html`, `js/dbm-script.js` | Prompts the user when navigating away from a modified form. |
| **Error Modal** | `#error-modal` | `pages/dbm.html`, `js/dbm-script.js` | Displays runtime and permission error alerts. |
| **Custom Choice Modal** | `#custom-modal` | `pages/dbm.html`, `js/dbm-script.js` | Generic multi-choice selection modal for custom user prompts. |
| **Unified Selector Modal** | `#unified-selector-modal` | `pages/dbm.html`, `js/dbm-script.js` | Modal for selecting and linking database references with inline "New Entry" creation capability. |
| **Bastion AI Assistant Modal** | `#bastion-modal` | `pages/dbm.html`, `js/dbm-script.js` | Interactive chat interface for the BASTION AI copilot. |
| **Complex Selector Modal** | `#selector-modal` | `js/selector-modal.js` | Multi-category item builder with pool points, modifier, and bonus inputs. |

---

## 2. Exhaustive Modal & Field Catalog

### 2.1 Settings Modal (`#settings-modal`)
Used to configure client-side settings.

* **Header Title**: Settings
* **Contained Fields / Inputs**:
  * **Gemini API Key**:
    * **Element ID**: `#api-key-input`
    * **Type**: `password`
    * **Label**: Gemini API Key
    * **Description**: "Your API key is stored securely in your browser's local storage and is never sent to our servers."
* **Action Buttons**:
  * `settings-cancel-btn` (`.btn.btn-secondary`): Closes modal without saving.
  * `settings-save-btn` (`.btn.btn-primary`): Saves key to `localStorage` under `geminiApiKey`.

---

### 2.2 Entry Modal (`#entry-modal`)
The primary data management interface. Dynamically generates form fields based on the selected database category (`categoryConfig`).

* **Header Controls**:
  * `#modal-title`: Displays `MANAGE <CATEGORY>` (in Dev Mode) or `VIEW <CATEGORY>` (in Game Mode).
  * `#modal-back-btn` *(Conditional)*: Appears when viewing/editing a child document from a parent modal context.
  * **DATA Menu**:
    * `#modal-data-btn`: Toggles dropdown menu.
    * `#modal-data-dropdown`:
      * **Save** (`type="submit"`, form `#entry-form`): Persists data to Firestore.
      * **Summary**: Opens Summary Modal (`#summary-modal`).
      * **Local Submenu**:
        * **Save**: Downloads current form state as a local JSON file.
        * **Load**: Triggers hidden file input (`#json-file-input`) to import JSON into form fields.
      * **Cancel**: Triggers `closeModal()`, prompting unsaved changes warning if dirty.
      * **Delete** *(Conditional)*: Deletes document from Firestore after confirmation.
* **Form & Footer Elements**:
  * `#entry-form`: Main HTML form wrapper.
  * `#form-fields`: Dynamic container where category fields are injected.
  * `#creator-info`: Footer text displaying `"Created by: <creatorEmail>"`.

---

### 2.3 Dynamic Entry Form Fields by Database Category

Below is the complete specification of all fields dynamically rendered inside `#form-fields` within the **Entry Modal**:

#### 1. RULES CODEX (`rules_codex`)
* `name` (text, required)
* `description` (Quill Rich Text Editor)
* `mechanic` (textarea)
* `note` (textarea)
* `guide` (textarea)
* `parent` (select from `rules_codex`)
* `order` (number, default: 0)

#### 2. SPECIES (`species`)
* `name` (text, required)
* `description` (textarea, AI enabled)
* `prerequisite` (multiselect, managed via Unified Selector)
* `type` (multiselect, managed via Unified Selector from `species_type`)
* `size` (multiselect, managed via Unified Selector from `species_size`)
* `movement` (multiselect, managed via Unified Selector from `species_movement`)
* `modifier` (multiselect, managed via Unified Selector from `modifier`)
* `bonus_skills` (json_list with requirement editor)
* `bonus_skill_options` (multiselect)
* `bonus_skill_choices` (number)
* `bonus_skill_points` (number)
* `bonus_skill_points_physical` (number)
* `bonus_skill_points_mental` (number)
* `bonus_skill_points_social` (number)
* `bonus_skill_points_combat` (number)
* `bonus_skill_points_meta` (number)
* `bonus_disciplines` (number)
* `bonus_special_abilities` (number)
* `bonus_features` (multiselect)
* `bonus_feature_options` (multiselect)
* `bonus_feature_choices` (number)
* `bonus_feature_points_ability` (number)
* `bonus_feature_points_combat` (number)
* `bonus_feature_points_meta` (number)
* `bonus_feature_points` (number)
* `bonus_feature_points_general` (number)
* `bonus_feature_points_karma` (number)
* `bonus_feature_points_skill` (number)
* `bonus_feature_points_exotic` (number)
* `recommended_features` (multiselect)
* `note` (textarea)
* `cp` (readonlytext)

##### Species Subcategories:
* **Species Types (`species_type`)**: `name`, `prerequisite`, `modifier`, `description`, `mechanic`, `note`, `cp`
* **Species Sizes (`species_size`)**: `name`, `modifier`, `description`, `scaling`, `height_length_range`, `weight_range`, `reach`, `mechanic`, `note`, `dc`, `cp`
* **Species Movements (`species_movement`)**: `name`, `prerequisite`, `modifier`, `description`, `mechanic`, `note`, `cp`

#### 3. FACTIONS (`factions`)
* `name` (text, required)
* `description` (textarea, AI enabled)
* `society` (select from `societies`)
* `prerequisite` (multiselect)
* `modifier` (multiselect)
* `bonus_skills` (json_list)
* `bonus_skill_options` (multiselect)
* `bonus_skill_choices` (number)
* `bonus_skill_points` (number)
* `bonus_skill_points_physical` (number)
* `bonus_skill_points_mental` (number)
* `bonus_skill_points_social` (number)
* `bonus_skill_points_combat` (number)
* `bonus_skill_points_meta` (number)
* `bonus_disciplines` (number)
* `bonus_special_abilities` (number)
* `bonus_features` (multiselect)
* `bonus_feature_options` (multiselect)
* `bonus_feature_choices` (number)
* `bonus_feature_points_ability` (number)
* `bonus_feature_points_combat` (number)
* `bonus_feature_points_meta` (number)
* `bonus_feature_points` (number)
* `bonus_feature_points_general` (number)
* `bonus_feature_points_karma` (number)
* `bonus_feature_points_skill` (number)
* `bonus_feature_points_exotic` (number)
* `recommended_features` (multiselect)
* `attitude` (textarea)
* `goals` (textarea)
* `social_strengths` (textarea)
* `social_weaknesses` (textarea)
* `mechanic` (textarea)
* `note` (textarea)

#### 4. ORIGINS (`origins`)
* `name`, `description`, `prerequisite`, `modifier`, `bonus_skills`, `bonus_skill_options`, `bonus_skill_choices`, `bonus_skill_points`, `bonus_skill_points_physical`, `bonus_skill_points_mental`, `bonus_skill_points_social`, `bonus_skill_points_combat`, `bonus_skill_points_meta`, `bonus_disciplines`, `bonus_special_abilities`, `bonus_features`, `bonus_feature_options`, `bonus_feature_choices`, `bonus_feature_points_ability`, `bonus_feature_points_combat`, `bonus_feature_points_meta`, `bonus_feature_points`, `bonus_feature_points_general`, `bonus_feature_points_karma`, `bonus_feature_points_skill`, `bonus_feature_points_exotic`, `recommended_features`, `trait` (multiselect), `mechanic`, `note`
* **Origin Trait (`trait`)**: `name`, `prerequisite`, `tech_level` (select 0-5), `meta_level` (select 0-5), `modifier`, `description`, `mechanic`, `note`, `cp`

#### 5. OCCUPATIONS (`occupations`)
* Same bonus fields as Factions/Origins, plus `trait` (multiselect), `mechanic`, `tech_level` (select 0-5), `meta_level` (select 0-5), `note`

#### 6. SKILLS (`skills`)
* `name` (text, required)
* `type` (select: `mental`, `physical`, `social`, `combat`, `meta`)
* `subtype` (select: `knowledge`, `vocation`, `manipulation`, `expression`, `archaic`, `modern`, `advanced`)
* `is_specialization` (boolean)
* `base_skill` (select from `skills`)
* `description` (textarea)
* `tech_level` (select 0-5)
* `meta_level` (select 0-5)
* `mechanic` (textarea)
* `note` (textarea)

#### 7. FEATURES (`features`)
* `name` (text, required)
* `type` (select: `ability`, `combat`, `meta`, `general`, `karma`, `skill`, `exotic`, `Special Ability`)
* `description` (textarea)
* `tech_level` (select 0-5)
* `meta_level` (select 0-5)
* `prerequisite` (multiselect)
* `modifier` (multiselect)
* `cp` (number)
* `costManuallyAdjusted` (boolean)
* `mechanic` (textarea)
* `note` (textarea)
* `multi` (boolean)
* `staged` (boolean)

#### 8. DISCIPLINES (`disciplines`)
* `name`, `description`, `prerequisite`, `modifier`, `discipline_skills` (multiselect), `mechanic`, `note`

#### 9. DISADVANTAGES (`disadvantages`)
* `name`, `description`, `tech_level`, `meta_level`, `prerequisite`, `modifier`, `cp`, `mechanic`, `note`

#### 10. INVOCATIONS (`invocations`) & SPECIAL ABILITIES (`special_abilities`)
* `name`, `description`, `discipline` (select), `meta_skill` (select), `area` (multiselect), `effect` (multiselect), `range` (multiselect), `target` (multiselect), `prerequisite`, `modifier`, `critical_success_effect` (multiselect), `critical_failure_effect` (multiselect), `design_dc` (readonlytext, auto-calculated total), `mechanic`, `tech_level`, `meta_level`, `note`

#### 11. AUGMENTATIONS (`augmentations`)
* `name`, `type` (select from `augmentation_type`), `classification` (multiselect), `location` (multiselect), `description`, `tech_level`, `meta_level`, `creator`, `design`, `component`, `prerequisite`, `modifier`, `critical_success_effect`, `critical_failure_effect`, `cost` (number), `availability` (select), `cr` (number), `restricted` (boolean), `design_dc` (readonlytext), `cp`, `mechanic`, `note`
* **Augmentation Types**: `name`, `description`, `prerequisite`, `modifier`, `mechanic`, `note`
* **Body Locations**: `name`, `description`

#### 12. SOCIETIES (`societies`)
* `name`, `description`, `tech_level`, `meta_level`, `prerequisite`, `modifier`, `agriculture`, `architecture`, `biotechnology`, `commerce`, `communication`, `devices`, `education`, `energy`, `manufacturing`, `materials`, `medicine`, `synthetics`, `weaponry`, `mechanic`, `note`
* **14 Subcategories** (Agriculture, Architecture, Biotechnology, Commerce, Communication, Devices, Education, Energy, Manufacturing, Materials, Medicine, Society, Synthetics, Weaponry):
  * `name`, `description`, `level` (select 0-5), `prerequisite`, `modifier`, `note`, `mechanic`

#### 13. VALUES (`values`, `secondary_values`, `tertiary_values`)
* `name`, `description`, `modifier`, `mechanic`, `cp`

#### 14. PREREQUISITES (`prerequisite`)
* `name`, `description`, `aspect` (select: `attribute`, `skill`, `combat`, `meta`, `other`), `aspect_subtype` (dynamic select), `value` (number), `dc` (number), `mechanic`, `note`, `cp`

#### 15. MODIFIERS (`modifier`)
* `name`, `description`, `aspect` (select: `attribute`, `skill`, `combat`, `other`, `feature`), `aspect_subtype` (dynamic select based on aspect), `bonus_scope` (radio: `any`, `specific`), `bonus_feature_categories` (multiselect: `ability`, `combat`, `meta`, `general`, `karma`, `skill`, `exotic`), `bonus_skill_categories` (multiselect: `mental`, `physical`, `social`, `combat`, `meta`), `bonus_attribute_options` (multiselect: 12 attributes), `skill_bonus_type` (radio: `adjust`, `grant`), `granted_skill_id` (select), `value` (number), `modifier_type` (radio: `constant`, `situational`, `optional`, `temporary`), `dc` (number), `mechanic`, `note`, `cp`

#### 16. ARMORING (`armoring`)
* `name`, `description`, `tl`, `ml`, `cost`, `availability`, `design_dc`, `size`, `weight`, `quality` (select: `Bad`, `Poor`, `Standard`, `Good`, `Exceptional`, `Mastercrafted`), `durability`, `prerequisite`, `skill`, `origin`, `creator`, `design`, `classification`, `material`, `location`, `component`, `resistance`, `critical_success_effect`, `critical_failure_effect`, `component_slots`, `modes`, `modifier`, `mechanic`, `note`

#### 17. WEAPONRY (`weaponry`)
* `name`, `description`, `tl`, `ml`, `cost`, `availability`, `design_dc`, `size`, `weight`, `quality`, `durability`, `prerequisite`, `skill`, `special`, `area`, `effect`, `range`, `target`, `origin`, `creator`, `design`, `classification`, `accuracy`, `ap`, `modes`, `attack_rate`, `critical_score`, `critical_effect`, `critical_success_effect`, `critical_failure_effect`, `wielding` (select: `One-Handed`, `Two-Handed`, `Versatile`, `Independent`, `Mounted`), `component`, `component_slots`, `modifier`, `mechanic`, `note`

#### 18. GEAR (`gear`)
* `name`, `description`, `category`, `cost`, `weight`, `tl`, `ml`, `availability`, `prerequisite`, `modifier`, `mechanic`, `note`

#### 19. MECHA (`mecha`)
* `name`, `description`, `tl`, `ml`, `cost`, `availability`, `design_dc`, `size`, `height`, `weight`, `quality`, `durability`, `prerequisite`, `skill`, `origin`, `creator`, `design`, `classification`, `personnel`, `cargo`, `speed`, `maneuverability`, `control` (select: `Auto`, `Remote`, `Pilot`, `Crew`), `component`, `critical_success_effect`, `critical_failure_effect`, `component_slots`, `modes`, `modifier`, `mechanic`, `note`

#### 20. OTHER PERSONAL PROPERTY (`other`)
* `name`, `description`, `cost`, `weight`, `tl`, `ml`, `availability`, `prerequisite`, `modifier`, `mechanic`, `note`

---

### 2.4 Summary Modal (`#summary-modal`)
Displays structured overview summary for entries.

* **Header Title**: `#summary-title` (`Summary`)
* **Body Element**: `#summary-content` (renders formatted HTML summary)
* **Action Buttons**:
  * `summary-close-btn` (`.btn.btn-primary`): Closes modal.

---

### 2.5 Confirm Modal (`#confirm-modal`)
Reusable confirmation dialog.

* **Header Title**: `#confirm-title` (`Are you sure?`)
* **Message Body**: `#confirm-message` (e.g., `"THIS ACTION CANNOT BE UNDONE."`)
* **Action Buttons**:
  * `confirm-cancel-btn` (`.btn.btn-secondary`): `CANCEL`
  * `confirm-ok-btn` (`.btn.btn-danger`): `CONFIRM` (triggers stored callback, e.g. entry deletion)

---

### 2.6 Unsaved Changes Modal (`#unsaved-changes-modal`)
Safety prompt triggered when leaving dirty forms.

* **Header Title**: `Unsaved Changes`
* **Message**: `"You have unsaved changes. Do you want to save them before continuing?"`
* **Action Buttons**:
  * `unsaved-cancel-btn` (`.btn.btn-secondary`): `CANCEL`
  * `unsaved-dismiss-btn` (`.btn.btn-danger`): `DISMISS CHANGES`
  * `unsaved-save-btn` (`.btn.btn-primary`): `SAVE & CONTINUE`

---

### 2.7 Error Modal (`#error-modal`)
Alert modal for system/permission errors.

* **Header Title**: `Error` (`.text-red-500`)
* **Message Body**: `#error-message`
* **Action Buttons**:
  * `error-ok-btn` (`.btn.btn-primary`): `OK`

---

### 2.8 Custom Choice Modal (`#custom-modal`)
Modal rendering dynamic option buttons for custom prompt choices.

* **Header Title**: `#custom-modal-title`
* **Content Container**: `#custom-modal-content`
* **Choices Container**: `#custom-modal-choices` (dynamically appends `.btn.btn-secondary` choice buttons)
* **Action Buttons**:
  * `custom-modal-ok-btn` (`.btn.btn-primary`, default hidden)
  * `custom-modal-cancel-btn` (`.btn.btn-secondary`): `Cancel`

---

### 2.9 Unified Selector Modal (`#unified-selector-modal`)
Selection modal for linking related database records with on-the-fly record creation.

* **Header Controls**:
  * `#unified-selector-title`: Modal title (e.g. `Select Prerequisites`)
  * `#unified-selector-search` (`.global-form-input`): Search text field
  * `#unified-selector-new-btn` (`.btn.btn-primary`): `New Entry` (opens blank Entry Modal to add a new record instantly)
* **List Area**:
  * `#unified-selector-list`: Scrollable container displaying checkable/selectable items.
* **Action Buttons**:
  * `unified-selector-cancel-btn` (`.btn.btn-secondary`): `Cancel`
  * `unified-selector-save-btn` (`.btn.btn-primary`): `Save Selection`

---

### 2.10 Bastion AI Assistant Modal (`#bastion-modal`)
AI chat interface for worldbuilding and rule assistance.

* **Header Title**: `BASTION` (`.text-cyan-400`)
* **Header Action**:
  * `#bastion-close-btn`: Close SVG icon button
* **Chat Body**:
  * `#bastion-chat-log`: Scrollable container for rendered markdown chat bubbles
* **Input Controls**:
  * `#bastion-input` (`textarea.global-form-input`, placeholder: `"Ask Bastion..."`): Chat input
  * `#bastion-send-btn` (`.btn.btn-primary`): `Send` button containing loading spinner `#bastion-loading`

---

### 2.11 Complex Selector Modal (`#selector-modal`)
Configurable builder modal used for complex item assignments (e.g. feature pools).

* **Header Title**: `#selector-modal-title`
* **Input Fields**:
  * `#selector-search-input`: Search filter field
  * `${type.id}-pool-points`: Point allotment field (when `hasPoolPoints` is true)
  * `Item Modifier Input`: Number field for item-specific modifiers (`hasModifier`)
  * `Item Bonus Input`: Number field for item-specific bonuses (`hasBonus`)
* **List Containers**:
  * `#selector-available-list`: Available items list
  * `#selector-lists-container`: Selected items grouped by type (e.g. Granted, Recommended)
* **Action Buttons**:
  * `#selector-cancel-btn` (`.btn.btn-secondary`): `Cancel`
  * `#selector-save-btn` (`.btn.btn-primary`): `Save`

---

# Database Manager (DBM) - User Entry Fields Catalog (Sorted by Section)

This document lists every user entry field in the **Tangent SFF RPG Database Manager**, grouped and organized by database section/category and subcategory.

---

## 1. Rules Codex (`rules_codex`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled, Rich Text / Quill)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`
* **Guide** (`guide`): `textarea`
* **Parent Entry** (`parent`): `select` *(Source: `rules_codex`)*
* **Order** (`order`): `number` *(Default: 0)*

---

## 2. Species (`species`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Species Type** (`type`): `multiselect` *(Source: `species_type`)*
* **Species Size** (`size`): `multiselect` *(Source: `species_size`)*
* **Species Movement** (`movement`): `multiselect` *(Source: `species_movement`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Bonus Skills** (`bonus_skills`): `json_list` *(Source: `skills`)*
* **Bonus Skill Options** (`bonus_skill_options`): `multiselect` *(Source: `skills`)*
* **Bonus Skill Choices** (`bonus_skill_choices`): `number`
* **Bonus ANY Skill Points** (`bonus_skill_points`): `number`
* **Bonus Physical Skill Points** (`bonus_skill_points_physical`): `number`
* **Bonus Mental Skill Points** (`bonus_skill_points_mental`): `number`
* **Bonus Social Skill Points** (`bonus_skill_points_social`): `number`
* **Bonus Combat Skill Points** (`bonus_skill_points_combat`): `number`
* **Bonus Meta Skill Points** (`bonus_skill_points_meta`): `number`
* **Bonus Disciplines** (`bonus_disciplines`): `number`
* **Bonus Special Abilities** (`bonus_special_abilities`): `number`
* **Bonus Features** (`bonus_features`): `multiselect` *(Source: `features`)*
* **Bonus Feature Options** (`bonus_feature_options`): `multiselect` *(Source: `features`)*
* **Bonus Feature Choices** (`bonus_feature_choices`): `number`
* **Bonus Ability Feature Points** (`bonus_feature_points_ability`): `number`
* **Bonus Combat Feature Points** (`bonus_feature_points_combat`): `number`
* **Bonus Meta Feature Points** (`bonus_feature_points_meta`): `number`
* **Bonus ANY Feature Points** (`bonus_feature_points`): `number`
* **Bonus General Feature Points** (`bonus_feature_points_general`): `number`
* **Bonus Karma Feature Points** (`bonus_feature_points_karma`): `number`
* **Bonus Skill Feature Points** (`bonus_feature_points_skill`): `number`
* **Bonus Exotic Feature Points** (`bonus_feature_points_exotic`): `number`
* **Recommended Features** (`recommended_features`): `multiselect` *(Source: `features`)*
* **Note** (`note`): `textarea`
* **Total CP** (`cp`): `readonlytext`

### Subcategories
* **Types (`species_type`)**: `name` (text, required), `prerequisite` (multiselect), `modifier` (multiselect), `description` (textarea, AI enabled), `mechanic` (textarea), `note` (textarea), `cp` (readonlytext)
* **Sizes (`species_size`)**: `name` (text, required), `modifier` (multiselect), `description` (textarea, AI enabled), `scaling` (number), `height_length_range` (text), `weight_range` (text), `reach` (text), `mechanic` (textarea), `note` (textarea), `dc` (number), `cp` (readonlytext)
* **Movements (`species_movement`)**: `name` (text, required), `prerequisite` (multiselect), `modifier` (multiselect), `description` (textarea, AI enabled), `mechanic` (textarea), `note` (textarea), `cp` (readonlytext)

---

## 3. Factions (`factions`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Society** (`society`): `select` *(Source: `societies`)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Bonus Skills** (`bonus_skills`): `json_list` *(Source: `skills`)*
* **Bonus Skill Options** (`bonus_skill_options`): `multiselect` *(Source: `skills`)*
* **Bonus Skill Choices** (`bonus_skill_choices`): `number`
* **Bonus ANY Skill Points** (`bonus_skill_points`): `number`
* **Bonus Physical Skill Points** (`bonus_skill_points_physical`): `number`
* **Bonus Mental Skill Points** (`bonus_skill_points_mental`): `number`
* **Bonus Social Skill Points** (`bonus_skill_points_social`): `number`
* **Bonus Combat Skill Points** (`bonus_skill_points_combat`): `number`
* **Bonus Meta Skill Points** (`bonus_skill_points_meta`): `number`
* **Bonus Disciplines** (`bonus_disciplines`): `number`
* **Bonus Special Abilities** (`bonus_special_abilities`): `number`
* **Bonus Features** (`bonus_features`): `multiselect` *(Source: `features`)*
* **Bonus Feature Options** (`bonus_feature_options`): `multiselect` *(Source: `features`)*
* **Bonus Feature Choices** (`bonus_feature_choices`): `number`
* **Bonus Ability Feature Points** (`bonus_feature_points_ability`): `number`
* **Bonus Combat Feature Points** (`bonus_feature_points_combat`): `number`
* **Bonus Meta Feature Points** (`bonus_feature_points_meta`): `number`
* **Bonus ANY Feature Points** (`bonus_feature_points`): `number`
* **Bonus General Feature Points** (`bonus_feature_points_general`): `number`
* **Bonus Karma Feature Points** (`bonus_feature_points_karma`): `number`
* **Bonus Skill Feature Points** (`bonus_feature_points_skill`): `number`
* **Bonus Exotic Feature Points** (`bonus_feature_points_exotic`): `number`
* **Recommended Features** (`recommended_features`): `multiselect` *(Source: `features`)*
* **Attitude** (`attitude`): `textarea`
* **Goals** (`goals`): `textarea`
* **Social Strengths** (`social_strengths`): `textarea`
* **Social Weaknesses** (`social_weaknesses`): `textarea`
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

---

## 4. Origins (`origins`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Bonus Skills** (`bonus_skills`): `json_list` *(Source: `skills`)*
* **Bonus Skill Options** (`bonus_skill_options`): `multiselect` *(Source: `skills`)*
* **Bonus Skill Choices** (`bonus_skill_choices`): `number`
* **Bonus ANY Skill Points** (`bonus_skill_points`): `number`
* **Bonus Physical Skill Points** (`bonus_skill_points_physical`): `number`
* **Bonus Mental Skill Points** (`bonus_skill_points_mental`): `number`
* **Bonus Social Skill Points** (`bonus_skill_points_social`): `number`
* **Bonus Combat Skill Points** (`bonus_skill_points_combat`): `number`
* **Bonus Meta Skill Points** (`bonus_skill_points_meta`): `number`
* **Bonus Disciplines** (`bonus_disciplines`): `number`
* **Bonus Special Abilities** (`bonus_special_abilities`): `number`
* **Bonus Features** (`bonus_features`): `multiselect` *(Source: `features`)*
* **Bonus Feature Options** (`bonus_feature_options`): `multiselect` *(Source: `features`)*
* **Bonus Feature Choices** (`bonus_feature_choices`): `number`
* **Bonus Ability Feature Points** (`bonus_feature_points_ability`): `number`
* **Bonus Combat Feature Points** (`bonus_feature_points_combat`): `number`
* **Bonus Meta Feature Points** (`bonus_feature_points_meta`): `number`
* **Bonus ANY Feature Points** (`bonus_feature_points`): `number`
* **Bonus General Feature Points** (`bonus_feature_points_general`): `number`
* **Bonus Karma Feature Points** (`bonus_feature_points_karma`): `number`
* **Bonus Skill Feature Points** (`bonus_feature_points_skill`): `number`
* **Bonus Exotic Feature Points** (`bonus_feature_points_exotic`): `number`
* **Recommended Features** (`recommended_features`): `multiselect` *(Source: `features`)*
* **Traits** (`trait`): `multiselect` *(Source: `trait`)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

### Subcategories
* **Traits (`trait`)**: `name` (text, required), `prerequisite` (multiselect), `tech_level` (select 0-5), `meta_level` (select 0-5), `modifier` (multiselect), `description` (textarea, AI enabled), `mechanic` (textarea), `note` (textarea), `cp` (readonlytext)

---

## 5. Occupations (`occupations`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Bonus Skills** (`bonus_skills`): `json_list` *(Source: `skills`)*
* **Bonus Skill Options** (`bonus_skill_options`): `multiselect` *(Source: `skills`)*
* **Bonus Skill Choices** (`bonus_skill_choices`): `number`
* **Bonus ANY Skill Points** (`bonus_skill_points`): `number`
* **Bonus Physical Skill Points** (`bonus_skill_points_physical`): `number`
* **Bonus Mental Skill Points** (`bonus_skill_points_mental`): `number`
* **Bonus Social Skill Points** (`bonus_skill_points_social`): `number`
* **Bonus Combat Skill Points** (`bonus_skill_points_combat`): `number`
* **Bonus Meta Skill Points** (`bonus_skill_points_meta`): `number`
* **Bonus Disciplines** (`bonus_disciplines`): `number`
* **Bonus Special Abilities** (`bonus_special_abilities`): `number`
* **Bonus Features** (`bonus_features`): `multiselect` *(Source: `features`)*
* **Bonus Feature Options** (`bonus_feature_options`): `multiselect` *(Source: `features`)*
* **Bonus Feature Choices** (`bonus_feature_choices`): `number`
* **Bonus Ability Feature Points** (`bonus_feature_points_ability`): `number`
* **Bonus Combat Feature Points** (`bonus_feature_points_combat`): `number`
* **Bonus Meta Feature Points** (`bonus_feature_points_meta`): `number`
* **Bonus ANY Feature Points** (`bonus_feature_points`): `number`
* **Bonus General Feature Points** (`bonus_feature_points_general`): `number`
* **Bonus Karma Feature Points** (`bonus_feature_points_karma`): `number`
* **Bonus Skill Feature Points** (`bonus_feature_points_skill`): `number`
* **Bonus Exotic Feature Points** (`bonus_feature_points_exotic`): `number`
* **Recommended Features** (`recommended_features`): `multiselect` *(Source: `features`)*
* **Traits** (`trait`): `multiselect` *(Source: `trait`)*
* **Mechanic** (`mechanic`): `textarea`
* **Tech Level** (`tech_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Meta Level** (`meta_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Note** (`note`): `textarea`

---

## 6. Skills (`skills`)
* **Name** (`name`): `text` *(Required)*
* **Type** (`type`): `select` *(Options: `mental`, `physical`, `social`, `combat`, `meta`, Required)*
* **Subtype** (`subtype`): `select` *(Options: `knowledge`, `vocation`, `manipulation`, `expression`, `archaic`, `modern`, `advanced`)*
* **Specialization Flag** (`is_specialization`): `boolean`
* **Base Skill** (`base_skill`): `select` *(Source: `skills`)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Tech Level** (`tech_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Meta Level** (`meta_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

---

## 7. Features (`features`)
* **Name** (`name`): `text` *(Required)*
* **Type** (`type`): `select` *(Options: `ability`, `combat`, `meta`, `general`, `karma`, `skill`, `exotic`, `Special Ability`)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Tech Level** (`tech_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Meta Level** (`meta_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **CP Cost** (`cp`): `number`
* **Cost Manually Adjusted** (`costManuallyAdjusted`): `boolean`
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`
* **Multi** (`multi`): `boolean`
* **Staged** (`staged`): `boolean`

---

## 8. Disciplines (`disciplines`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea`
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Discipline Skills** (`discipline_skills`): `multiselect` *(Source: `skills`)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

---

## 9. Disadvantages (`disadvantages`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Tech Level** (`tech_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Meta Level** (`meta_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **CP Cost** (`cp`): `number`
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

---

## 10. Invocations (`invocations`) & Special Abilities (`special_abilities`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Discipline** (`discipline`): `select` *(Source: `disciplines`)*
* **Meta Skill** (`meta_skill`): `select` *(Source: `skills_meta`)*
* **Area** (`area`): `multiselect` *(Source: `area`)*
* **Effect** (`effect`): `multiselect` *(Source: `effect`)*
* **Range** (`range`): `multiselect` *(Source: `range`)*
* **Target** (`target`): `multiselect` *(Source: `target`)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Critical Success Effect** (`critical_success_effect`): `multiselect` *(Source: `critical_success_effect`)*
* **Critical Failure Effect** (`critical_failure_effect`): `multiselect` *(Source: `critical_failure_effect`)*
* **DESIGN DC** (`design_dc`): `readonlytext` *(Auto-computed)*
* **Mechanic** (`mechanic`): `textarea`
* **Tech Level** (`tech_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Meta Level** (`meta_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Note** (`note`): `textarea`

---

## 11. Augmentations (`augmentations`)
* **Name** (`name`): `text` *(Required)*
* **Augmentation Type** (`type`): `select` *(Source: `augmentation_type`)*
* **Classification** (`classification`): `multiselect` *(Source: `classification`)*
* **Body Location** (`location`): `multiselect` *(Source: `body_location`)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Tech Level** (`tech_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Meta Level** (`meta_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Creator** (`creator`): `multiselect` *(Source: `creator`)*
* **Design** (`design`): `multiselect` *(Source: `design`)*
* **Component** (`component`): `multiselect` *(Source: `component`)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Critical Success Effect** (`critical_success_effect`): `multiselect`
* **Critical Failure Effect** (`critical_failure_effect`): `multiselect`
* **Cost** (`cost`): `number`
* **Availability** (`availability`): `select` *(Source: `availability`)*
* **CR** (`cr`): `number`
* **Restricted** (`restricted`): `boolean`
* **DESIGN DC** (`design_dc`): `readonlytext`
* **CP Cost** (`cp`): `number`
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

### Subcategories
* **Augmentation Types (`augmentation_type`)**: `name` (text, required), `description` (textarea), `prerequisite` (multiselect), `modifier` (multiselect), `mechanic` (textarea), `note` (textarea)
* **Body Locations (`body_location`)**: `name` (text, required), `description` (textarea)

---

## 12. Societies (`societies`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Tech Level** (`tech_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Meta Level** (`meta_level`): `select` *(Options: 0, 1, 2, 3, 4, 5)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Agriculture** (`agriculture`): `multiselect` *(Source: `society_agriculture`)*
* **Architecture** (`architecture`): `multiselect` *(Source: `society_architecture`)*
* **Biotechnology** (`biotechnology`): `multiselect` *(Source: `society_biotechnology`)*
* **Commerce** (`commerce`): `multiselect` *(Source: `society_commerce`)*
* **Communication** (`communication`): `multiselect` *(Source: `society_communication`)*
* **Devices** (`devices`): `multiselect` *(Source: `society_devices`)*
* **Education** (`education`): `multiselect` *(Source: `society_education`)*
* **Energy** (`energy`): `multiselect` *(Source: `society_energy`)*
* **Manufacturing** (`manufacturing`): `multiselect` *(Source: `society_manufacturing`)*
* **Materials** (`materials`): `multiselect` *(Source: `society_materials`)*
* **Medicine** (`medicine`): `multiselect` *(Source: `society_medicine`)*
* **Synthetics** (`synthetics`): `multiselect` *(Source: `society_synthetics`)*
* **Weaponry** (`weaponry`): `multiselect` *(Source: `society_weaponry`)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

### 14 Subcategories
*(Agriculture, Architecture, Biotechnology, Commerce, Communication, Devices, Education, Energy, Manufacturing, Materials, Medicine, Society, Synthetics, Weaponry)*
* **Fields**: `name` (text), `description` (textarea, AI enabled), `level` (select 0-5), `prerequisite` (multiselect), `modifier` (multiselect), `note` (textarea), `mechanic` (textarea)

---

## 13. Values / Secondary Values / Tertiary Values (`values`, `secondary_values`, `tertiary_values`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Mechanic** (`mechanic`): `textarea`
* **CP Cost** (`cp`): `number`

---

## 14. Prerequisites (`prerequisite`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Aspect** (`aspect`): `select` *(Options: `attribute`, `skill`, `combat`, `meta`, `other`)*
* **Aspect Subtype** (`aspect_subtype`): `select` *(Dynamic based on Aspect)*
* **Value** (`value`): `number`
* **DC** (`dc`): `number`
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`
* **CP Cost** (`cp`): `number`

---

## 15. Modifiers (`modifier`)
* **Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea` *(AI Enabled)*
* **Aspect** (`aspect`): `select` *(Options: `attribute`, `skill`, `combat`, `other`, `feature`)*
* **Aspect Subtype** (`aspect_subtype`): `select` *(Dynamic based on Aspect)*
* **Scope** (`bonus_scope`): `radio` *(Options: `any`, `specific`, hidden by default)*
* **Feature Categories** (`bonus_feature_categories`): `multiselect` *(Options: `ability`, `combat`, `meta`, `general`, `karma`, `skill`, `exotic`)*
* **Skill Categories** (`bonus_skill_categories`): `multiselect` *(Options: `mental`, `physical`, `social`, `combat`, `meta`)*
* **Attribute Options** (`bonus_attribute_options`): `multiselect` *(12 RPG attributes)*
* **Skill Bonus Type** (`skill_bonus_type`): `radio` *(Options: `adjust`, `grant`)*
* **Grant Skill** (`granted_skill_id`): `select` *(Source: `skills`)*
* **Value** (`value`): `number`
* **Modifier Type** (`modifier_type`): `radio` *(Options: `constant`, `situational`, `optional`, `temporary`)*
* **DC** (`dc`): `number`
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`
* **CP Cost** (`cp`): `number`

---

## 16. Armoring (`armoring`)
* **Armor Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea`
* **TL** (`tl`): `number`
* **ML** (`ml`): `number`
* **Cost** (`cost`): `number`
* **Availability** (`availability`): `select` *(Source: `availability`)*
* **DESIGN DC** (`design_dc`): `readonlytext`
* **Size** (`size`): `multiselect` *(Source: `species_size`)*
* **Weight** (`weight`): `number`
* **Quality** (`quality`): `select` *(Options: `Bad`, `Poor`, `Standard`, `Good`, `Exceptional`, `Mastercrafted`)*
* **Durability** (`durability`): `number`
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Skill** (`skill`): `select` *(Source: `skills`)*
* **Origin** (`origin`): `multiselect` *(Source: `origins`)*
* **Creator** (`creator`): `multiselect` *(Source: `creator`)*
* **Design** (`design`): `multiselect` *(Source: `design`)*
* **Classification** (`classification`): `multiselect` *(Source: `classification`)*
* **Material** (`material`): `multiselect` *(Source: `material`)*
* **Location** (`location`): `multiselect` *(Source: `body_location`)*
* **Component** (`component`): `multiselect` *(Source: `component`)*
* **Resistance** (`resistance`): `multiselect` *(Source: `resistance`)*
* **Critical Success Effect** (`critical_success_effect`): `multiselect`
* **Critical Failure Effect** (`critical_failure_effect`): `multiselect`
* **Component Slots** (`component_slots`): `number`
* **Modes** (`modes`): `multiselect` *(Source: `mode`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

### Subcategories
* **Availability, Materials, Resistances, Creators, Designs, Classifications**: `name` (text, required), `description` (textarea)

---

## 17. Weaponry (`weaponry`)
* **Weapon Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea`
* **TL** (`tl`): `number`
* **ML** (`ml`): `number`
* **Cost** (`cost`): `number`
* **Availability** (`availability`): `select` *(Source: `availability`)*
* **DESIGN DC** (`design_dc`): `readonlytext`
* **Size** (`size`): `multiselect` *(Source: `species_size`)*
* **Weight** (`weight`): `number`
* **Quality** (`quality`): `select` *(Options: `Bad`, `Poor`, `Standard`, `Good`, `Exceptional`, `Mastercrafted`)*
* **Durability** (`durability`): `number`
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Skill** (`skill`): `select` *(Source: `skills`)*
* **Special** (`special`): `multiselect` *(Source: `special`)*
* **Area** (`area`): `multiselect` *(Source: `area`)*
* **Effect** (`effect`): `multiselect` *(Source: `effect`)*
* **Range** (`range`): `multiselect` *(Source: `range`)*
* **Target** (`target`): `multiselect` *(Source: `target`)*
* **Origin** (`origin`): `multiselect` *(Source: `origins`)*
* **Creator** (`creator`): `multiselect` *(Source: `creator`)*
* **Design** (`design`): `multiselect` *(Source: `design`)*
* **Classification** (`classification`): `multiselect` *(Source: `classification`)*
* **Accuracy** (`accuracy`): `number`
* **AP** (`ap`): `number`
* **Modes** (`modes`): `multiselect` *(Source: `mode`)*
* **Rate of Fire** (`attack_rate`): `text`
* **Critical Score** (`critical_score`): `text`
* **Critical Effect** (`critical_effect`): `multiselect` *(Source: `critical_effect`)*
* **Critical Success Effect** (`critical_success_effect`): `multiselect`
* **Critical Failure Effect** (`critical_failure_effect`): `multiselect`
* **Wielding** (`wielding`): `select` *(Options: `One-Handed`, `Two-Handed`, `Versatile`, `Independent`, `Mounted`)*
* **Component** (`component`): `multiselect` *(Source: `component`)*
* **Component Slots** (`component_slots`): `number`
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

### Subcategories
* **Availability, Special, Modes, Critical Effects, Creators, Designs, Classifications**: `name` (text, required), `description` (textarea)

---

## 18. Gear (`gear`)
* **Item Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea`
* **Category** (`category`): `select` *(Source: `gear_category`)*
* **Cost** (`cost`): `number`
* **Weight** (`weight`): `number`
* **TL** (`tl`): `number`
* **ML** (`ml`): `number`
* **Availability** (`availability`): `select` *(Source: `availability`)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

### Subcategories
* **Gear Categories, Availability**: `name` (text, required), `description` (textarea)

---

## 19. Mecha (`mecha`)
* **Mecha Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea`
* **TL** (`tl`): `number`
* **ML** (`ml`): `number`
* **Cost** (`cost`): `number`
* **Availability** (`availability`): `select` *(Source: `availability`)*
* **DESIGN DC** (`design_dc`): `readonlytext`
* **Size** (`size`): `multiselect` *(Source: `species_size`)*
* **Height** (`height`): `number`
* **Weight** (`weight`): `number`
* **Quality** (`quality`): `select` *(Options: `Bad`, `Poor`, `Standard`, `Good`, `Exceptional`, `Mastercrafted`)*
* **Durability** (`durability`): `number`
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Skill** (`skill`): `select` *(Source: `skills`)*
* **Origin** (`origin`): `multiselect` *(Source: `origins`)*
* **Creator** (`creator`): `multiselect` *(Source: `creator`)*
* **Design** (`design`): `multiselect` *(Source: `design`)*
* **Classification** (`classification`): `multiselect` *(Source: `classification`)*
* **Personnel** (`personnel`): `text`
* **Cargo** (`cargo`): `text`
* **Speed** (`speed`): `text`
* **Maneuverability** (`maneuverability`): `text`
* **Control** (`control`): `select` *(Options: `Auto`, `Remote`, `Pilot`, `Crew`)*
* **Component** (`component`): `multiselect` *(Source: `component`)*
* **Critical Success Effect** (`critical_success_effect`): `multiselect`
* **Critical Failure Effect** (`critical_failure_effect`): `multiselect`
* **Component Slots** (`component_slots`): `number`
* **Modes** (`modes`): `multiselect` *(Source: `mode`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`

---

## 20. Other Personal Property (`other`)
* **Item Name** (`name`): `text` *(Required)*
* **Description** (`description`): `textarea`
* **Cost** (`cost`): `number`
* **Weight** (`weight`): `number`
* **TL** (`tl`): `number`
* **ML** (`ml`): `number`
* **Availability** (`availability`): `select` *(Source: `availability`)*
* **Prerequisites** (`prerequisite`): `multiselect` *(Source: `prerequisite`)*
* **Modifiers** (`modifier`): `multiselect` *(Source: `modifier`)*
* **Mechanic** (`mechanic`): `textarea`
* **Note** (`note`): `textarea`
