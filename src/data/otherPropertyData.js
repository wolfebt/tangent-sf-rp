/**
 * Canonical Other Property Database for Tangent SF RP
 * Commodities, Consumables, Raw Materials, Ammunition, Power Cells, Trade Goods & Meta-Tech Catalysts
 * Grounded in 2.00 ECONOMATRIX.md, 99.Tech.Equipment.Framework.md, 99.Tech.Equipment.SystemsAndMastercrafting.md,
 * and 99.Tech.Weaponry.ForgeProtocol.md. All prices follow the Tangent Standard Curve: round(10 * 4^(CR / 5)).
 */

export const DEFAULT_OTHER_PROPERTY = [
  {
    "id": "standard-field-rations",
    "name": "Dehydrated Field Rations (1-Day Pack)",
    "category": "other",
    "type": "Consumables",
    "size": "Diminutive",
    "weight": 0.5,
    "cost": 10,
    "tl": 2,
    "tech_level": 2,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      1,
      2,
      3,
      4
    ],
    "recommended_ml": [
      0,
      1
    ],
    "keywords": "sustenance, rations, survival, food, scout, wilderness, field supplies, supply die",
    "negative_keywords": "synthetic, construct, robot, immortal",
    "description": "Compact dehydrated nutrient rations sealed in waterproof foil pouches. Provides balanced daily caloric intake for biological operators.",
    "notes": "1 day of rations. Restores degraded Supply Die during field survival. Inedible for non-biological entities.",
    "mechanic": "1 Day of food. Restores Supply Die.",
    "craft_dc": 0,
    "design_dc": 0,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 10,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "nutrient-solution-biotech",
    "name": "Biotech Nutrient Solution (1-Dose Sustenance Bath)",
    "category": "other",
    "type": "Consumables",
    "size": "Tiny",
    "weight": 2,
    "cost": 10,
    "tl": 4,
    "tech_level": 4,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      3,
      4,
      5
    ],
    "recommended_ml": [
      0,
      1,
      2
    ],
    "keywords": "biotech, sustenance, nutrient, auluran, kitin, symbiotic, living gear, biological maintenance",
    "negative_keywords": "mechanical, primitive, stone age",
    "description": "Bio-rich enzymatic nutrient suspension required to sustain grown Auluran and Kitin heavy weapons and living carapace armor.",
    "notes": "Grown heavy weapons and armor must be submerged in 1 dose of Nutrient Solution once per week, or they degrade and gain the Broken (Starving) condition.",
    "mechanic": "Prevents Broken (Starving) condition on grown Biotech heavy weapons and armor for 1 week.",
    "craft_dc": 0,
    "design_dc": 0,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 10,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "standard-kinetic-magazine",
    "name": "Standard Kinetic Magazine (Caseless Slugs)",
    "category": "other",
    "type": "Commodities",
    "size": "Diminutive",
    "weight": 0.5,
    "cost": 10,
    "tl": 2,
    "tech_level": 2,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      1,
      2,
      3
    ],
    "recommended_ml": [
      0
    ],
    "keywords": "ammo, ammunition, kinetic, ballistic, slugs, magazine, clip, firearm, coalition, outworlds",
    "negative_keywords": "energy weapon, primitive, stone age",
    "description": "Standardized box magazine loaded with chemical-propellant or magnetically primed solid kinetic slugs for ballistic firearms.",
    "notes": "Standard reload for ballistic pistols, submachine guns, rifles, and shotguns.",
    "mechanic": "Restores 1 full magazine of standard Kinetic (Piercing/Blunt) ammunition.",
    "craft_dc": 0,
    "design_dc": 0,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 10,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "micro-energy-cell",
    "name": "Micro-Cell (Holdout & Attachment Battery)",
    "category": "other",
    "type": "Commodities",
    "size": "Fine",
    "weight": 0.1,
    "cost": 10,
    "tl": 3,
    "tech_level": 3,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      2,
      3,
      4,
      5
    ],
    "recommended_ml": [
      0,
      1
    ],
    "keywords": "energy, battery, micro-cell, holdout, optics, attachment, power, tech",
    "negative_keywords": "stone age, primitive",
    "description": "Sub-miniature high-density capacitor cell engineered for holdout pistols, optical sights, weapon attachments, and diminutive personal electronics.",
    "notes": "Standard TL 3 modular micro-power source. Negligible mass.",
    "mechanic": "Powers holdout energy weapons, sights, and Fine/Diminutive electronics.",
    "craft_dc": 0,
    "design_dc": 0,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 10,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "standard-power-cell",
    "name": "Standard Energy Cell (Universal TL 3 Battery)",
    "category": "other",
    "type": "Commodities",
    "size": "Diminutive",
    "weight": 0.5,
    "cost": 40,
    "tl": 3,
    "tech_level": 3,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      2,
      3,
      4,
      5
    ],
    "recommended_ml": [
      0,
      1
    ],
    "keywords": "energy, battery, power, ammo, electronics, gadgets, laser, blaster, plasma, modular",
    "negative_keywords": "stone age, low tech",
    "description": "Universal TL 3 modular hydrogen-graphene energy cell used to power directed-energy pistols, SMGs, rifles, energy blades, and field scanners.",
    "notes": "Features TL 3 Modular universal charging ports compatible across Syndicate, Ascendancy, Coalition, and Combine hardware.",
    "mechanic": "Standard reload/power source for Pistols, SMGs, Rifles, and Energy Blades.",
    "craft_dc": 5,
    "design_dc": 5,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 40,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "heavy-power-pack",
    "name": "Heavy Weapon Power Pack (Backpack Unit)",
    "category": "other",
    "type": "Commodities",
    "size": "Small",
    "weight": 6,
    "cost": 160,
    "tl": 3,
    "tech_level": 3,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      3,
      4,
      5
    ],
    "recommended_ml": [
      0
    ],
    "keywords": "heavy power, backpack battery, plasma launcher, heavy weapon, generator, industrial",
    "negative_keywords": "concealed, primitive",
    "description": "High-output wearable capacitor pack with armored umbilical feed cable designed for heavy energy weapons, plasma launchers, and industrial fusion cutters.",
    "notes": "Worn as a backpack unit or clipped to heavy armor webbing.",
    "mechanic": "Powers Heavy Weapons, Plasma Launchers, and high-drain field emitters.",
    "craft_dc": 10,
    "design_dc": 10,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 160,
      "nodes": 0,
      "sockets": 1,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "special-payload-magazine",
    "name": "Special Payload Ammunition Clip (AP / Incendiary / Cryo / EMP)",
    "category": "other",
    "type": "Commodities",
    "size": "Diminutive",
    "weight": 0.6,
    "cost": 160,
    "tl": 3,
    "tech_level": 3,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      2,
      3,
      4
    ],
    "recommended_ml": [
      0,
      1
    ],
    "keywords": "ammo, armor piercing, incendiary, cryo, corrosive, emp, non-lethal gel, tactical",
    "negative_keywords": "primitive, stone age",
    "description": "Precision-manufactured specialized munition magazine containing tungsten-core Armor-Piercing, Thermal Incendiary, Cryo-Gel, Corrosive Acid, Ionizing EMP, or Non-Lethal Gel rounds.",
    "notes": "Crafted at CR 10 (160 Cr) per magazine to alter a ballistic or launcher weapon's damage vector or penetration profile.",
    "mechanic": "Loads 1 magazine of specialized payload rounds (AP, Incendiary, Cryo, Acid, EMP, or Non-Lethal Gel).",
    "craft_dc": 10,
    "design_dc": 10,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 160,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "plasteel-ingot-bulk",
    "name": "Refined Plasteel & Titanium Ingot (Industrial Lot)",
    "category": "other",
    "type": "Raw Materials",
    "size": "Small",
    "weight": 10,
    "cost": 160,
    "tl": 3,
    "tech_level": 3,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      2,
      3,
      4
    ],
    "recommended_ml": [
      0
    ],
    "keywords": "metallurgy, plasteel, titanium, construction, crafting, repair, trade, forge, armor repair",
    "negative_keywords": "fragile, organic",
    "description": "High-tensile space-age structural alloy billet combining polymer matrices with refined titanium-steel alloys. Essential feedstock for workshops and nano-forges.",
    "notes": "Standard industrial raw material lot (provides 160 Cr of raw material value toward Productivity Engine crafting or structural SP repairs).",
    "mechanic": "Provides 160 Cr of TL 3 Industrial Raw Materials for crafting or armor/hull repair.",
    "craft_dc": 10,
    "design_dc": 10,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 160,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "nanotube-wire-spool",
    "name": "Carbon-Nanotube High-Tensile Spool (100m)",
    "category": "other",
    "type": "Raw Materials",
    "size": "Tiny",
    "weight": 1,
    "cost": 160,
    "tl": 3,
    "tech_level": 3,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      3,
      4,
      5
    ],
    "recommended_ml": [
      0,
      1
    ],
    "keywords": "rigging, carbon-nanotubes, climbing, traps, engineering, tactical wire, industrial material",
    "negative_keywords": "primitive, brittle",
    "description": "Braided molecular carbon-nanotube cord with 10,000 lbs breaking strain and motorized spooling handle. Used in both tactical rigging and composite armor weaving.",
    "notes": "Supports up to 5 tons of suspended mass; counts as 160 Cr of industrial carbon-nanotube material.",
    "mechanic": "Supports 5 tons tensile load; usable as tactical rigging or TL 3-4 composite raw material.",
    "craft_dc": 10,
    "design_dc": 10,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 160,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "kitin-hive-resin-composite",
    "name": "Kitin Hive-Resin Structural Composite",
    "category": "other",
    "type": "Raw Materials",
    "size": "Small",
    "weight": 5,
    "cost": 160,
    "tl": 3,
    "tech_level": 3,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      3,
      4
    ],
    "recommended_ml": [
      0,
      1
    ],
    "keywords": "kitin, hive-resin, bio-ceramic, lightweight, stealth, sound dampening, self-sealing, crafting",
    "negative_keywords": "heavy-iron, loud",
    "description": "Secreted organic bio-resin composite harvested by the Kitin Collective. Lighter than plasteel, extraordinarily rigid, and naturally self-sealing against micro-breaches.",
    "notes": "Armor crafted with Hive-Resin gains the Lightweight trait; architectural bulkheads lined with Hive-Resin grant +2 to Stealth (sound dampening) inside them.",
    "mechanic": "Kitin factional material. Grants Lightweight trait on armor or +2 Stealth (acoustic dampening) in structures.",
    "craft_dc": 10,
    "design_dc": 10,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 160,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "alterian-sunglass-laminate",
    "name": "Alterian Sunglass Laminate (Solar Capacitor)",
    "category": "other",
    "type": "Raw Materials",
    "size": "Tiny",
    "weight": 1,
    "cost": 640,
    "tl": 4,
    "tech_level": 4,
    "ml": 2,
    "meta_level": 2,
    "recommended_tl": [
      3,
      4,
      5
    ],
    "recommended_ml": [
      1,
      2,
      3,
      4
    ],
    "keywords": "alterian, sunglass, solar capacitor, photosynthesis, living wood, crystal, energy recharge",
    "negative_keywords": "coalition, crude, fossil-fuel",
    "description": "Crystalline structures grown from pure silica and coherent light by Alterian Enclave artisans. Functions as a perpetual solar capacitor.",
    "notes": "When integrated into energy weapons or powered tools (Photosynthesis trait), automatically recharges energy cells and ammunition when exposed to direct sunlight.",
    "mechanic": "Alterian factional material. Recharges energy weapons and powered tools automatically in direct sunlight.",
    "craft_dc": 15,
    "design_dc": 15,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 640,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "cold-credit-bearer-chit",
    "name": "Cold Credit Bearer Chit (640 Cr Untraceable Bond)",
    "category": "other",
    "type": "Trade Goods",
    "size": "Fine",
    "weight": 0.1,
    "cost": 640,
    "tl": 3,
    "tech_level": 3,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      2,
      3,
      4,
      5
    ],
    "recommended_ml": [
      0,
      1,
      2
    ],
    "keywords": "currency, cold credits, bearer bond, money, wealth, trade, black market, outworlds, commerce",
    "negative_keywords": "barter-only, primitive",
    "description": "Cryptographically locked physical bearer chit ('Cold Credits') holding 640 standard Credits offline, bypassing the Syndicate Mesh financial surveillance grid.",
    "notes": "Favored by Outworlds freelancers, Coalition traders, and Gray Market fixers for untraceable liquid transactions.",
    "mechanic": "Untraceable offline bearer currency worth 640 Cr (CR 15 value).",
    "craft_dc": 15,
    "design_dc": 15,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 640,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "platinum-iridium-bullion",
    "name": "Precious Metal Trade Bullion (Platinum / Iridium Bar)",
    "category": "other",
    "type": "Trade Goods",
    "size": "Tiny",
    "weight": 1,
    "cost": 640,
    "tl": 1,
    "tech_level": 1,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      0,
      1,
      2,
      3,
      4,
      5
    ],
    "recommended_ml": [
      0,
      1,
      2,
      3,
      4,
      5
    ],
    "keywords": "precious metal, platinum, iridium, gold, bullion, barter, frontier, entari combine, trade",
    "negative_keywords": "",
    "description": "Assayed and stamped precious metal bullion bar of refined platinum and iridium, universally accepted across the Commodities & Exchange Matrix from primitive worlds to Entari Combine ports.",
    "notes": "Retains full exchange value across all Tech Levels and disconnected frontier sectors.",
    "mechanic": "Universal physical trade commodity worth 640 Cr (CR 15 value).",
    "craft_dc": 15,
    "design_dc": 15,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 640,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "resonance-crystal-catalyst",
    "name": "Resonance Crystal (Meta-Tech Enhancement Catalyst)",
    "category": "other",
    "type": "Relics",
    "size": "Diminutive",
    "weight": 0.5,
    "cost": 2560,
    "tl": 3,
    "tech_level": 3,
    "ml": 3,
    "meta_level": 3,
    "recommended_tl": [
      2,
      3,
      4,
      5
    ],
    "recommended_ml": [
      2,
      3,
      4,
      5
    ],
    "keywords": "metaphysical, resonance crystal, meta-tech, passive enhancement, focus, warding, runic",
    "negative_keywords": "mundane, null-void",
    "description": "Naturally polarized noospheric mineral crystal that vibrates in harmony with Conscious Light. Required to anchor permanent passive Meta-Tech Enhancements into physical Sockets or dermal tattoos.",
    "notes": "Meta-Tech fabrication requires Resonance Crystals for Passive Enhancements (such as Energy Sheath, Ghost-Strike, or Featherweight), constituting 50% of the final item value.",
    "mechanic": "Exotic Meta-Tech catalyst worth 2,560 Cr (CR 20). Required for Passive Enhancements and Imbued Tattoos.",
    "craft_dc": 20,
    "design_dc": 20,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 2560,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "refined-aetherium-ampoule",
    "name": "Refined Aetherium Ampoule (Meta-Tech Imbuement Catalyst)",
    "category": "other",
    "type": "Relics",
    "size": "Diminutive",
    "weight": 0.5,
    "cost": 10240,
    "tl": 4,
    "tech_level": 4,
    "ml": 4,
    "meta_level": 4,
    "recommended_tl": [
      3,
      4,
      5
    ],
    "recommended_ml": [
      3,
      4,
      5
    ],
    "keywords": "aetherium, meta-tech, active imbuement, spell-tech, impyrium, alterian, catalyst, exotic material",
    "negative_keywords": "primitive, mundane",
    "description": "Hermetically containment-sealed ampoule of refined Aetherium—the hyper-conductive metaphysical element capable of hard-coding active Invocations into technological hardware.",
    "notes": "Required as 50% raw material value to fabricate Active Meta-Tech Imbuements (such as Blink Suits or Sun-Fire Vambraces) and TL 4 Aether-integrated power cores.",
    "mechanic": "Exotic Meta-Tech catalyst worth 10,240 Cr (CR 25). Required for Active Imbuements and Aether-Node fabrication.",
    "craft_dc": 25,
    "design_dc": 25,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 10240,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  },
  {
    "id": "raw-polymatter-canister",
    "name": "Raw Polymatter Substrate Canister (Mekan Liquid Metal)",
    "category": "other",
    "type": "Relics",
    "size": "Tiny",
    "weight": 2,
    "cost": 40960,
    "tl": 5,
    "tech_level": 5,
    "ml": 0,
    "meta_level": 0,
    "recommended_tl": [
      5
    ],
    "recommended_ml": [
      0,
      1,
      2,
      3,
      4,
      5
    ],
    "keywords": "polymatter, mekan, morphic, tl-5, programmable matter, liquid metal, singularity, exotic",
    "negative_keywords": "primitive, stone age, industrial",
    "description": "A magnetic-lattice containment cylinder holding true TL 5 Polymatter—a programmable liquid-metal substrate existing in a state of hyper-potentiality that reacts instantaneously to neural or digital commands.",
    "notes": "Used in Tier 5 Genesis fabrication and Base Substance Exchange to forge Morphic weapons, armor, and implants.",
    "mechanic": "Apex TL 5 exotic substrate worth 40,960 Cr (CR 30). Enables Morphic equipment fabrication and Base Substance Exchange.",
    "craft_dc": 30,
    "design_dc": 30,
    "costs": {
      "cp": 0,
      "bp": 0,
      "credits": 40960,
      "nodes": 0,
      "sockets": 0,
      "strain": 0,
      "focus": 0,
      "ap": 0
    }
  }
];
