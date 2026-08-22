---
id: "3-07-armor-dr-damage-calculation"
name: "3.07 Armor DR, AP Rating & Damage Calculation"
category: "compendium"
entry_type: "Core Rule"
parent: "3.00 COMBAT"
order: 7
---
# 3.07 Armor DR, AP Rating & Damage Calculation

Damage in Tangent is resolved through a realistic **Damage Reduction (DR)** and **Armor Piercing (AP)** penetration model.

---

## The Damage Resolution Formula

\text{Effective Armor DR} = \max(0, \text{Target Armor DR} - \text{Weapon AP Rating})

\text{Hit Points Lost} = \max(1, \text{Incoming Damage} - \text{Effective Armor DR})

---

## Armor & Damage Interactions

- **Damage Reduction (DR):** The static number of damage points absorbed by physical armor, energy shields, or natural carapace.
- **Armor Piercing (AP):** The rating of the ammunition or energy beam that bypasses an equivalent amount of target Armor DR.
- **Minimum Damage Rule:** A successful hit that penetrates or glances always inflicts at least **1 point of damage**, representing kinetic concussive transfer.

---

## Example Calculation
- A heavy battle rifle fires an AP-4 slug dealing **16 Kinetic Damage**.
- The target wears Combat Plate with **DR 10**.
- **Effective DR:**  - 4 = 6$.
- **Final HP Lost:**  - 6 = 10 \text{ HP}$.
