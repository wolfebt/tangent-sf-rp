---
id: "3-00-05-damage-soak-armor-dr-ap"
name: "3.00.05 Damage Soak, Armor DR & AP Penetration Math"
category: "compendium"
parent: "3.00 TACTICAL COMBAT SYSTEM"
order: 6
perspective: "both"
entry_type: "Core Engine Manual"
---

# 3.00.05 Damage Soak, Armor DR & AP Penetration Math

Tangent uses an active armor absorption engine where **Armor Damage Reduction (DR)** soaks incoming damage unless pierced by **Armor Penetration (AP)** ratings.

---

## 1. The Damage Soak Formula

$$\text{Effective Damage} = \text{Incoming Damage} - \max(0, \text{Armor DR} - \text{Armor Piercing (AP)})$$

---

## 2. Damage Types & Resistances

| Damage Type | Description | Signature Weapon / Energy Source |
| :--- | :--- | :--- |
| **Kinetic / Ballistic** | High-velocity slugs, blades, shrapnel | Autopistols, rifles, vibro-blades, fragmentation |
| **Energy / Laser** | Concentrated coherent photonic beams | Laser carbines, blasters, plasma emitters |
| **Thermal / Fire** | Extreme heat, incendiary chemicals, plasma | Flamethrowers, plasma repeaters, thermite |
| **Cryo / Cold** | Absolute zero chill, liquid nitrogen | Cryo-grenades, freeze beams, ice invocations |
| **Electrical / EMP** | High-voltage lightning, ionic disruptors | Shock batons, EMP grenades, arc cannons |
| **Corrosive / Acid** | Molecular acid, toxic enzymes, bio-venom | Chemical sprayers, bio-spitters, alien toxins |
| **Sonic / Disruption** | High-frequency acoustic resonance | Sonic cannons, vibro-hammers |
| **Metaphysic / Warp** | Pure raw reality distortion | Invocations, planar rifts, psionic blasts |

## Game Mechanics Rules
```
EffectiveDamage = max(1, RawDamage - max(0, ArmorDR - WeaponAP))
```

## Gameplay Instructions
Apply weapon AP against target DR first. Any remaining DR reduces damage before subtracting from HP.

## Designer Notes
Metaphysical and Sonic damage types frequently ignore standard kinetic armor DR.
