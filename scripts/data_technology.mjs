export const technologyArticles = [
  {
    id: "5-01-technology-levels",
    name: "5.01 Technology Levels (TL 0 to TL 5)",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "5.00 TECHNOLOGY & GEAR",
    order: 1,
    description: # 5.01 Technology Levels (TL 0 to TL 5)

Technology Levels (**TL**) define the scientific development, industrial manufacturing, weapon lethality, and medical capabilities of worlds.

---

## Technology Level Classification Matrix

| TL Tier | Epoch Name | Power Generation | Weaponry & Armor | Medical & Cybernetics |
| :---: | :--- | :--- | :--- | :--- |
| **TL 0** | **Primitive** | Muscle, fire, early watermills | Bows, iron blades, hide armor | Herbalism, natural splints |
| **TL 1** | **Industrial** | Steam, coal, fossil fuels | Chemical firearms, steel plate | Early surgery, sterile medicine |
| **TL 2** | **Atomic / Digital** | Nuclear fission, solar arrays | Assault rifles, Kevlar, early lasers | Organ transplants, prosthetics |
| **TL 3** | **Interstellar (Standard)** | Fusion reactors, antimatter cells | Plasma blasters, powered armor, railguns | Biosynthetic limbs, clone tissue |
| **TL 4** | **Advanced / Cybernetic** | Graviton cores, zero-point cells | Hard-light sabers, smart-rifles, cloaks| Full-body cyborg conversion, neural stacks |
| **TL 5** | **Hyper-Tech / Exotic** | Singularity drives, chronal taps | Reality-disruptor beams, nanotech morph| Biological immortality, consciousness uploads |

---

## Tech Level Interactions
- Firing a **TL 3 Plasma Weapon** against **TL 1 Steel Armor** gains a **+4 Attack bonus** and doubles effective Armor Piercing (AP).
- Repairing or hacking higher-TL equipment imposes a **-2 penalty per TL difference**.,
    mechanic: TechCheckPenalty = (ItemTL - UserTL) * -2 (if ItemTL > UserTL)
ArmorPiercingMultiplier = (WeaponTL > ArmorTL) ? 2 : 1,
    guide: Check the planetary TL before purchasing gear or attempting field engineering repairs.,
    note: Relic artifacts from fallen TL 5 precursor civilizations ignore standard maintenance degradation.
  },
  {
    id: "5-02-weapon-armor-properties",
    name: "5.02 Weapon & Armor Properties",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "5.00 TECHNOLOGY & GEAR",
    order: 2,
    description: # 5.02 Weapon & Armor Properties

Weapons, armor suits, and defensive shielding feature specialized mechanical properties.

---

## Weapon Properties Matrix

- **Armor Piercing (AP X):** Bypasses $ points of target Armor DR before calculating damage.
- **Accurate (+X):** Adds $+X$ bonus to all attack and strike rolls due to precision optics or smart-link tracking.
- **Blast (Radius X ft):** Detonates in a spherical radius, dealing damage to all targets within $ feet on a failed Reflex save.
- **Concealable:** Grants a +4 bonus on Sleight of Hand / Stealth checks to hide the weapon on one's person.
- **Heavy / Two-Handed:** Requires both hands and minimum Strength to wield without suffering a -2 attack penalty.
- **High Critical (19–20):** Scores a Critical Hit on a natural die roll of 19 or 20.
- **Point Blank:** Deals damage with **Advantage** when fired within melee reach (5 ft).
- **Silent:** Firing the weapon does not break stealth and generates no audible sound signature.
- **Smart-Link:** When paired with a neural ocular chip, adds +2 to strike checks and calculates ballistic trajectories.

---

## Armor Properties
- **Damage Reduction (DR X):** Directly absorbs $ points of incoming physical/kinetic/energy damage.
- **Ablative Plating:** Grants high initial DR that degrades by 1 point per 10 damage absorbed until repaired.
- **Powered Exoskeleton:** Increases wearer's raw Strength score by +2 and doubles carrying capacity.,
    mechanic: EffectiveDamage = max(1, RawDamage - max(0, ArmorDR - WeaponAP))
CriticalRange = HighCritical ? [19, 20] : [20],
    guide: Equip weapons matching your tactical role (e.g. AP weapons against heavy cyborgs, Blast against swarms).,
    note: Smart-link weapons require a compatible neural optic interface to activate the +2 accuracy bonus.
  },
  {
    id: "5-03-cybernetic-bioware-augmentations",
    name: "5.03 Cybernetic & Bioware Augmentations",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "5.00 TECHNOLOGY & GEAR",
    order: 3,
    description: # 5.03 Cybernetic & Bioware Augmentations

Characters can augment their biology with high-tech chrome, dermal plating, sensory upgrades, and neural coprocessors.

---

## Augmentation Categories

### 1. Cybernetic Prosthetics (Chrome)
- **Cyber-Arm / Leg:** Replaces lost limb; provides **+2 Might / Kick damage** and built-in hidden storage.
- **Dermal Armor Plating:** Subdermal titanium weave granting **+3 to +6 static Armor DR**.
- **Neural Reflex Booster:** Hardwired synaptic accelerators granting **+2 Initiative** and an extra active defense reaction.
- **Ocular Targeting Suite:** Integrated HUD optics granting darkvision, thermal scanning, and smart-link sync.

### 2. Bioware & Genetic Enhancements
- **Enhanced Musculature:** Biological gene therapy increasing natural Strength score by +1.
- **Toxin Filter Gland:** Synthetic liver graft providing Advantage on all poison and disease Fortitude saves.
- **Sub-dermal Adrenal Surge:** Once per combat, gain +1 extra action on your turn as an adrenaline rush.

---

## Essence & Humanity Strain
Extensive cybernetic augmentation replaces organic tissue. Each major prosthetic imposes an **Augmentation Strain** cost that slightly reduces maximum Essence capacity for Metaphysic Adepts.,
    mechanic: MaxAugmentations = StaminaScore + 4
CyborgEssencePenalty = TotalCyberwareSlots * 1,
    guide: Visit authorized cyber-clinics or military surgeons during downtime to install augmentations.,
    note: EMP weapons and severe electrical shocks can temporarily short-circuit unshielded cybernetic limbs.
  },
  {
    id: "5-04-gear-tools-field-equipment",
    name: "5.04 Gear, Tools & Field Equipment",
    category: "compendium",
    entry_type: "Core Rule",
    parent: "5.00 TECHNOLOGY & GEAR",
    order: 4,
    description: # 5.04 Gear, Tools & Field Equipment

Exploration and tactical missions require specialized field kits, communication arrays, and survival gear.

---

## Master Field Gear Catalog

| Item Name | Function & Purpose | Mechanical Benefit |
| :--- | :--- | :--- |
| **Comms Array (Encrypted)** | Secure squad voice and data communications | 50 km range; immune to basic electronic eavesdropping |
| **Field Med-Kit (Trauma Pack)** | Immediate combat triage and stabilization | Restores 2d6 HP; stabilizes dying character on DC 10 Medicine check |
| **Hacker's Cyber-Deck** | Direct neural interface for computer intrusion | Required to execute military-grade cyber intrusions |
| **Multi-Tool & Solder Torch**| Universal mechanical repair kit | Eliminates penalty for improvised repairs on Technology checks |
| **Atmospheric Breather Mask**| Filters toxic gases, smoke, and biological spores| Immunity to inhaled airborne toxins for 8 hours |
| **Grav-Chute (Drop Pack)** | Slows terminal velocity falls from high altitudes | Completely negates falling damage when deployed |
| **Ration Cubes & Water Purifier**| Sustenance in hostile wilderness | Sustains 1 character for 10 days in uncultivated biomes |,
    mechanic: MedKitHeal = 2d6 HP (Max once per character per Short Rest)
ToolKitSynergy = Negates -4 improvised tool penalty,
    guide: Always pack a Trauma Pack, Multi-Tool, and Comms Array before departing on planetary expeditions.,
    note: High-tech electronic gear requires battery recharges at power outlets or portable solar generators.
  }
];
