<PLAN 18: WEAPONRY MATRIX FORGE>
> Phase 2 | Priority 2/14 | Source: `docs/plans/CODEX/99. WEAPONRY MATRIX.md`

## Overview
The Weaponry Matrix Forge manages the creation, modification, and scaling of all offensive armaments—from simple kinetic sidearms to massive mecha-mounted energy weapons. It utilizes a modular DC adjustment system where bases, mods, and downgrades compile into a final TSC value.

## Source Document Analysis
Key systems extracted:
- **Base Typology:** Kinetic, Thermal, Energy, Melee, Heavy Ordnance.
- **Modifications (DC Additions):** Accurate (+1/+2/+3 = DC 10/20/30), Automated (+20), Collapsable (+15), Improved Damage (+20), etc.
- **Downgrades (DC Reductions):** Decreased Range (-5), Increased Weight (-5), Reduced Damage (-5), Disposable.
- **Capacities:** Double (10), Triple (15), Pack (20), Canister (25), Hopper (30).
- **Mount Scaling:** Weapon scale multipliers for vehicle/mecha application.
- **UDU & Aesthetics:** UDU sockets limit total slots. Faction Cultural Skins serve as aesthetic overlays.

## Proposed Changes

### New Files
#### [NEW] `src/pages/Codex/hooks/useWeaponryMatrix.js`
Computes the final DC by summing base DC, modification DCs, capacity DCs, and subtracting downgrade DCs. Calculates the scale multiplier for mounted variants.
#### [NEW] `src/pages/Codex/components/WeaponModStacker.jsx`
An interactive UI component for adding/removing weapon mods and downgrades from a predefined list.

### Modified Files
#### [MODIFY] `src/pages/Codex/codexConfig.js`
Update the 'weaponry' matrix definition to use the new hook and specialized components.

## Data Model
```typescript
interface WeaponryData {
  name: string;
  type: 'Kinetic' | 'Energy' | 'Melee' | 'Heavy' | 'Explosive';
  skill: string;
  tl: number;
  ml: number;
  base_dc: number;
  wielding: '1H' | '2H' | 'Mounted';
  scale_multiplier: number;
  modifications: { name: string; dc_modifier: number }[];
  downgrades: { name: string; dc_modifier: number }[];
  capacity_upgrade?: string;
  udu_sockets_base: number;
  faction_skin: string;
  _computed?: ComputedWeaponStats;
}

interface ComputedWeaponStats {
  final_dc: number;
  credit_value: number;
  material_cost: number;
  total_udu_sockets: number;
  crafting_days: number;
}
```

## Calculation Engine Integration
- `tangentEconEngine.js`: Transforms `final_dc` into credits (V = 10 × 4^(DC/5)).
- `tangentUDUEngine.js`: Validates if total modifications exceed the base UDU slots of the weapon frame.

## UI Specification

### Form Fields (codexConfig.js Entry)
```javascript
{
  id: 'weaponry',
  name: 'Weaponry',
  targetCollection: 'weaponry',
  icon: 'Sword',
  fields: [
    { name: 'name', type: 'text', label: 'Designation', required: true },
    { name: 'type', type: 'select', label: 'Damage Type', options: ['Kinetic', 'Thermal', 'Energy', 'Melee'] },
    { name: 'tl', type: 'number', label: 'Tech Level' },
    { name: 'base_dc', type: 'number', label: 'Base DC' },
    { name: 'wielding', type: 'select', label: 'Wielding', options: ['1H', '2H', 'Mounted'] },
    { name: 'scale_multiplier', type: 'number', label: 'Scale Multiplier', default: 1 },
    { name: 'faction_skin', type: 'select', label: 'Cultural Skin' }
  ],
  customComponents: ['WeaponModStacker'],
  useCustomHook: 'useWeaponryMatrix'
}
```

### Computed Output Panel
- **Combat Stats Overview:** Final expected Damage, AP, and Critical Score based on base weapon + mods.
- **Economics:** Final DC (Base + Mods - Downgrades) -> TSC Value.
- **Slot Budget:** A progress bar showing Base Sockets vs Consumed Sockets (by mods).

### Interactive Features
- **Mod Stacker:** A drag-and-drop or checklist interface to pile on modifiers. Downgrades visually deduct from the running DC total.
- **Scale Toggle:** Toggling a weapon to 'Mounted' unlocks the scale multiplier, which scales the TSC and Damage values.

## Cross-Matrix References
- **Factions:** Pulls aesthetic descriptors for the `faction_skin`.
- **Mecha/Vehicles:** Mounted weapons serve as relational targets for vehicle loadouts.

## Firestore Schema
**Collection:** `weaponry`
Documents store array of applied mods and downgrades. `_computed` holds `final_dc`, `credit_value`.

## Verification
- Create a Base Kinetic Pistol (DC 15). Add "Accurate +1" (DC 10) and "Disposable" (DC -5). Final DC should be 20. Value should be 10 * 4^(20/5) = 2560 Cr.
- Verify UDU slot warnings trigger if mods exceed base capacity.
</PLAN 18: WEAPONRY MATRIX FORGE>
