# GUIDED CHARACTER GENERATION AID (IMPLEMENTATION PLAN)

## Overview
This document outlines the implementation plan for adding a Guided Character Generation Aid (Wizard) to the Persona Folio. This feature will streamline the complex character creation rules defined in `1.01 CHARACTER CREATION.md`, ensuring players correctly manage their 150 Build Points (BP) and allocate bonuses correctly.

## Architecture & State
1. **Entry Point**: A "Guided Creation" button will be added to the Folio UI (e.g., in the Roster Drawer or main FolioHeader).
2. **Component**: A new `GuidedCreatorModal.jsx` will be created to house the multi-step wizard.
3. **State**: 
   - A `draftCharacter` object will store all choices.
   - A computed `bpRemaining` integer will dynamically update as choices are made (Starting BP: 150).

## Wizard Steps

### Step 1: Concept & Identity
- **Inputs**: Character Name, Age, Height, Weight, General Concept.
- **Action**: Initializes the `draftCharacter` object.

### Step 2: Species Selection
- **UI**: A searchable list of Species pulled from `src/data/omnicortex/species`.
- **Logic**: 
  - Deducts the specified Species BP cost.
  - Automatically applies Inherent Features.
  - Presents a sub-selection for Species Bonus Features if applicable.
  - Records the Species Attribute Modifiers to be applied during the Core Stats step.

### Step 3: Faction & Origin
- **UI**: Selectors for Faction and Origin.
- **Logic**:
  - Grants a pool of 20 Skill Ranks for Faction and 20 for Origin.
  - Allows selection of 2 Faction Features and 2 Origin Traits for free.
  - Additional traits cost 1 BP each.

### Step 4: Occupation
- **UI**: Selector for Occupation.
- **Logic**:
  - Grants a pool of 20 Occupational Skill Ranks.
  - Allows selection of 2 Occupational Traits.
  - Unlocks discounts for recommended Occupational Features.

### Step 5: Core Stats (Attributes)
- **UI**: Point-buy interface for Strength, Agility, Stamina, Intellect, Wisdom, and Charisma.
- **Logic**:
  - Base stat is +0. Max is +4 (before species modifiers).
  - Cost: 5 BP per +1 increase.
  - Final displayed stat will factor in the Species Attribute Modifiers selected in Step 2.

### Step 6: Technology Level & Hindrances
- **UI**: Dropdown for Technology Level, multi-select for Hindrances.
- **Logic**:
  - Technology: TL3 is 0 BP. TL4 is -10 BP (deducts 10). TL5 is -20 BP. TL<3 gives +10 BP (adds 10).
  - Hindrances: Each selected hindrance refunds a specific amount of BP to the pool.

### Step 7: Features & Skills
- **UI**: Two main sections for spending remaining BP.
- **Features**: Base cost 3 BP. If the feature was recommended by Faction/Origin/Occupation, cost is reduced (minimum 1 BP).
- **Skills**: Physical, Mental, Social, Discipline, Combat. Cost is 1 BP per rank (on top of the free 20/20/20 ranks from earlier).

### Step 8: Property & Meta (Optional)
- **UI**: Select starting Gear/Weapons/Armor based on Wealth and Tech Level.
- **Logic**: Allows spending BP on Augmentations (requires Augmented feature) or Meta Invocations (requires Awakened feature).

### Step 9: Review & Finalize
- **UI**: A summary sheet displaying the final stats, chosen features, skills, and the final BP cost (must be <= 150).
- **Action**: Submitting this form calls a new Context method `applyGuidedCharacter(draftCharacter)` which populates the FolioContext and closes the wizard.

## Integration into `FolioContext`
- A new context method `applyGuidedCharacter(draftData)` will be implemented in `FolioContext.jsx`.
- This method will map the `draftData` structure to the `characterData` schema used by the app, replacing the currently active character sheet.
