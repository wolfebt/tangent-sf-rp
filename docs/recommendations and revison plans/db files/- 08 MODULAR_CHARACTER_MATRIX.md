<Agent System Instructions>
<PLAN 24: CODEX MODULAR CHARACTER GENERATOR>
> Phase 4 | Priority 8/14 | Source: `docs/plans/CODEX/99. MODULAR CHARACTER MATRIX.md`

## Overview
Creates NPCs ranging from mindless minions to cosmic bosses using a Tier + Role + Designation stack system. It generates fully statted entities automatically based on a set of narrative and combat parameters.

## Source Document Analysis
- **Construction Protocol**: Stack approach combining Tier Chassis + Designation + Competency Role + Narrative Architecture.
- **Threat Tiers**: 0-20 with escalating base stats.
- **Designations**: Adversary, Ally, Companion, Neutral.
- **Competency Roles**: Breaker, Striker, Commander, Tank, Healer, Controller, Sniper, Scout, Support, Summoner.
- **Boss Multipliers**: Boss (×2 Vit/Health), Mastermind (×3-5), Minion (1 HP rule).
- **Base Vitality/Health**: 30 + Tier Bonus.
- **Derived Stats**: Auto-calculated (Defense, Attack, DR, Speed) from tier + role.
- **Tactical Behaviors**: Aggressive, Defensive, Ambush, Swarm, Hit-and-Run.
- **Narrative Architecture**: Personality quirks, motivations, secrets.
- **Target Collection**: `compendium` with altCollection `features`.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useNPCStatGenerator.js`
Hook to compute Base Vitality, Health, Defense, Attack, DR, and Speed from Threat Tier, Role, and Boss Multipliers.

#### [NEW] `src/pages/Codex/components/EquipmentLoadoutLinker.jsx`
Component integrating `UnifiedRelationalSelectorModal` for mapping weapons, armoring, and gear to the NPC.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Add configuration for the Modular Character Generator, routing it to `compendium`.

## Data Model
```typescript
interface ModularCharacterData {
  id: string;
  name: string;
  threatTier: number;
  designation: 'Adversary' | 'Ally' | 'Companion' | 'Neutral';
  competencyRole: 'Breaker' | 'Striker' | 'Commander' | 'Tank' | 'Healer' | 'Controller' | 'Sniper' | 'Scout' | 'Support' | 'Summoner';
  bossType: 'Standard' | 'Minion' | 'Boss' | 'Mastermind';
  tacticalBehaviors: string[];
  narrativeArchitecture: { personality: string; motivation: string; secret: string };
  equipmentLoadouts: { weapons: string[]; armor: string[]; gear: string[] };
  _computed: {
    vitality: number;
    health: number;
    defense: number;
    attack: number;
    dr: number;
    speed: number;
  };
}
```

## Calculation Engine Integration
- Math utilities compute: Vitality/Health (30 + Tier Bonus * Multiplier).
- Base stat matrices configured in `tangentConstants.js` based on `competencyRole`.

## UI Specification
### Form Fields (codexConfig.js Entry)
```javascript
modular_character: {
  label: "Modular Character Generator",
  icon: "UserCog",
  targetCollection: "compendium",
  altCollection: "features",
  computeOnSave: true,
  layout: [
    { name: "threatTier", type: "number", min: 0, max: 20, required: true },
    { name: "designation", type: "select", options: ["Adversary", "Ally", "Companion", "Neutral"], required: true },
    { name: "competencyRole", type: "select", options: COMPETENCY_ROLES, required: true },
    { name: "bossType", type: "select", options: ["Standard", "Minion", "Boss", "Mastermind"] },
    { name: "tacticalBehaviors", type: "multiselect", options: TACTICAL_BEHAVIORS },
    { name: "narrativeArchitecture", type: "object", fields: ["personality", "motivation", "secret"] },
    { name: "equipmentLoadouts", type: "custom", component: "EquipmentLoadoutLinker" }
  ],
  engineHooks: ['useNPCStatGenerator']
}
```

### Computed Output Panel
- **Stat Block**: A fully realized NPC stat block showing Final Vitality/Health, Defense, Attack, DR, and Speed. Updates instantly as Tier or Role changes.

### Interactive Features
- **Equipment Loadout Linker**: A cross-matrix linking component allowing quick assignment of `Weaponry` and `Armor` matrix items.
- **Boss Multiplier Toggle**: Instantly recalculates health pool.

## Cross-Matrix References
- References to `Weaponry`, `Armor`, and `Gear` matrix collections via `UnifiedRelationalSelectorModal`.

## Firestore Schema
- **Collection**: `compendium`
- **Document Structure**: Matches `ModularCharacterData`.

## Verification
- Create a Tier 10 Boss Tank. Verify Health equals (30 + TierBonus) * 2.
- Verify linked weapons appear properly resolved in output panel.
</PLAN 24: CODEX MODULAR CHARACTER GENERATOR>
