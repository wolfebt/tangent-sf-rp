/**
 * ═══════════════════════════════════════════════════════════════════
 * TANGENT SF RP — CANONICAL ORIGINS MASTER DATA (1.05 ORIGINS.MD)
 * Authoritative dataset defining the 11 canonical planetary, orbital,
 * and void environments shaping characters' backgrounds and worldviews.
 * 
 * Rules Parity:
 * - 20 Society Skill Points granted for Persona Folio allocation
 * - 2 Origin Traits selected for free (Additional traits cost 1 CP each)
 * - Decoupled from adversary chassis, combat roles, TL, and ML
 * ═══════════════════════════════════════════════════════════════════
 */

export const DEFAULT_ORIGINS = [
  {
    "id": "origin-agricultural",
    "name": "Agricultural",
    "category": "origins",
    "habitat": "Planetary Biome",
    "skill_points": 20,
    "society_skills": [
      "Piloting",
      "Alertness",
      "Knowledge (Nature)",
      "Knowledge (Survival)",
      "Knowledge (Technology)",
      "Vocation (Any)"
    ],
    "archetypes": [
      "Farmer",
      "Hunter",
      "Preservationist",
      "Pilot",
      "Technician",
      "Community Leader"
    ],
    "traits": [
      "trait-animal-husbandry",
      "trait-botanical-knowledge",
      "trait-community-building",
      "trait-green-thumb",
      "trait-mechanical-skills",
      "trait-resourcefulness",
      "trait-survival-skills",
      "trait-sustainable-practices"
    ],
    "traits_detail": [
      {
        "id": "trait-animal-husbandry",
        "name": "Animal Husbandry",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Expertise in raising and caring for livestock. Understands animal behavior, breeding, and nutrition. Can manage a farm with a diverse range of animals.",
        "mechanic": "+2 to Animal Handling",
        "bonus": "+2 Animal Handling",
        "cpCost": 1
      },
      {
        "id": "trait-botanical-knowledge",
        "name": "Botanical Knowledge",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Extensive knowledge of plants, crops, and agricultural techniques. Understands the science behind growing and cultivating various types of vegetation.",
        "mechanic": "+2 to Botany Checks",
        "bonus": "+2 Botany Checks",
        "cpCost": 1
      },
      {
        "id": "trait-community-building",
        "name": "Community Building",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Values community and may have skills in building and maintaining relationships with other farmers, suppliers, and customers. Can negotiate deals, organize cooperative efforts, and foster camaraderie.",
        "mechanic": "Once per Day may reroll a Social Skill Check",
        "bonus": "1/Day Social Reroll",
        "cpCost": 1
      },
      {
        "id": "trait-green-thumb",
        "name": "Green Thumb",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Natural talent for nurturing plants and making them thrive even in challenging environments. Has a knack for identifying needs of different plants.",
        "mechanic": "Checks involving nurturing and helping plants may be made at Advantage",
        "bonus": "Advantage on Plant Care Checks",
        "cpCost": 1
      },
      {
        "id": "trait-mechanical-skills",
        "name": "Mechanical Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Mechanical skills related to farming equipment and machinery. Can repair and maintain farming tools, vehicles, pumps, conveyors and other automated systems.",
        "mechanic": "+2 to Mechanical Skill Checks",
        "bonus": "+2 Mechanical Checks",
        "cpCost": 1
      },
      {
        "id": "trait-resourcefulness",
        "name": "Resourcefulness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "The character is able to make the most of limited resources and find creative solutions to problems, especially important where resources may be scarce.",
        "mechanic": "Once per Day make a Skill Check of choice at Advantage",
        "bonus": "1/Day Skill at Advantage",
        "cpCost": 1
      },
      {
        "id": "trait-survival-skills",
        "name": "Survival Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Survival skills honed from living and working in remote or harsh environments. Can navigate and forage for resources, making them self-sufficient.",
        "mechanic": "+2 Survival Skill Checks",
        "bonus": "+2 Survival Checks",
        "cpCost": 1
      },
      {
        "id": "trait-sustainable-practices",
        "name": "Sustainable Practices",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Knowledgeable about sustainable farming practices and strives to minimize environmental impact. Prioritizes organic methods and water conservation.",
        "mechanic": "+2 to any Agriculture based checks in a prepared grow area and to prepare and maintain an area.",
        "bonus": "+2 Agriculture Checks",
        "cpCost": 1
      }
    ],
    "description": "Agri-Worlds are essential for mass food production. These worlds typically have low development and population, ranging from small rural houses, barns, and silos to expansive mega-structure Arcologies and preservation biospheres.",
    "full_text": "### Origin Overview\nAgri-Worlds are essential for mass food production. These worlds typically have low development and population. Most communities range from small houses and other farm-related structures, including barns, silos and the like, to expansive mega-structure Arcologies. They also include most Preservation/Green Worlds, those purposefully left undeveloped but with self-sustaining small communities. Farming and preserved wilds are the focus of these worlds.\n\n### Society Skills (20 SP Pool)\nPiloting, Alertness, Knowledge (Nature, Survival, Technology), Vocation (any)\n\n### Typical Archetypes\nFarmer, Hunter, Preservationist, Pilot, Technician, Community Leader\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Animal Husbandry**: Expertise in raising and caring for livestock. Understands animal behavior, breeding, and nutrition. (+2 to Animal Handling)\n- **Botanical Knowledge**: Extensive knowledge of plants, crops, and agricultural techniques. (+2 to Botany Checks)\n- **Community Building**: Values community and maintains cooperative relations. (Once per Day may reroll a Social Skill Check)\n- **Green Thumb**: Natural talent for nurturing plants in challenging environments. (Checks involving nurturing plants made at Advantage)\n- **Mechanical Skills**: Repair and maintain agricultural equipment, harvesters, conveyors, and irrigation pumps. (+2 to Mechanical Skill Checks)\n- **Resourcefulness**: Creative problem-solving with limited supplies. (Once per Day make a Skill Check of choice at Advantage)\n- **Survival Skills**: Honed remote wilderness survival and foraging. (+2 Survival Skill Checks)\n- **Sustainable Practices**: Organic farming, crop rotation, and water conservation. (+2 to Agriculture checks in grow areas)"
  },
  {
    "id": "origin-aquatic",
    "name": "Aquatic",
    "category": "origins",
    "habitat": "Aquatic & Oceanic",
    "skill_points": 20,
    "society_skills": [
      "Athletics",
      "Piloting",
      "Alertness",
      "Knowledge (Navigation)",
      "Knowledge (Survival)",
      "Vocation (Any)"
    ],
    "archetypes": [
      "Mariner",
      "Deep Sea Explorer",
      "Marine Biologist",
      "Shipwright",
      "Underwater Salvage Expert",
      "Diver"
    ],
    "traits": [
      "trait-adaptability",
      "trait-aquatic-construction",
      "trait-curiosity",
      "trait-empathy",
      "trait-environmental-awareness",
      "trait-sea-piloting",
      "trait-resourcefulness",
      "trait-survival-skills"
    ],
    "traits_detail": [
      {
        "id": "trait-adaptability",
        "name": "Adaptability",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "The character is able to adapt to new environments and situations quickly, making them well-suited to life in an ever-changing aquatic world.",
        "mechanic": "+2 to a specific Skill Check, may change assigned Skill daily",
        "bonus": "+2 Daily Floating Skill",
        "cpCost": 1
      },
      {
        "id": "trait-aquatic-construction",
        "name": "Aquatic Construction",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Skilled in manufacturing buildings, flotillas, submerged domes, and other water-based habitats and structures.",
        "mechanic": "+2 to all Construction Checks",
        "bonus": "+2 Construction Checks",
        "cpCost": 1
      },
      {
        "id": "trait-curiosity",
        "name": "Curiosity",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Natural curiosity about oceanic depths and alien ecologies, driving exploration of underwater anomalies.",
        "mechanic": "Regain a Karma Point on the first encounter when dealing with something new during the session - creature, area, technology, etc.",
        "bonus": "Karma on Discovery",
        "cpCost": 1
      },
      {
        "id": "trait-empathy",
        "name": "Empathy",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Strong sense of empathy and connection with aquatic and sentient creatures, sensing basic needs and emotions.",
        "mechanic": "+2 Insight and +2 Handle Animal Checks while being Friendly to other creature",
        "bonus": "+2 Insight & Animal Handling",
        "cpCost": 1
      },
      {
        "id": "trait-environmental-awareness",
        "name": "Environmental Awareness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Highly attuned to ocean currents, pressure gradients, thermal vents, and atmospheric shifts affecting survival.",
        "mechanic": "+2 Alertness",
        "bonus": "+2 Alertness",
        "cpCost": 1
      },
      {
        "id": "trait-sea-piloting",
        "name": "Sea Piloting",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Operation of submersibles, high-speed hydrofoils, personal jets, and colossal floating platforms.",
        "mechanic": "+2 to all Seacraft Operation - Submersibles, Boats, Hovercraft, and Aircraft",
        "bonus": "+2 Seacraft Piloting",
        "cpCost": 1
      },
      {
        "id": "trait-resourcefulness",
        "name": "Resourcefulness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Creative solutions with limited supplies aboard remote vessels and isolated marine domes.",
        "mechanic": "Once per Day make a Skill Check of choice at Advantage",
        "bonus": "1/Day Skill at Advantage",
        "cpCost": 1
      },
      {
        "id": "trait-survival-skills",
        "name": "Survival Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Navigating underwater terrain, avoiding pelagic predators, and finding fresh water and shelter.",
        "mechanic": "+2 Survival Skill Checks",
        "bonus": "+2 Survival Checks",
        "cpCost": 1
      }
    ],
    "description": "This world is mostly covered in water, with over 85% of its surface being water of various depths. Habitats include anchored land installations, submerged pressurized domes, floating flotilla cities, and marine research platforms.",
    "full_text": "### Origin Overview\nThis world is mostly covered in water, with over 85% of its surface being water of various depths. Some structures are firmly secured on land, while others are submerged or floating. Boats, submarines, and flotillas are common forms of transportation, besides GEVs and aircraft.\n\n### Society Skills (20 SP Pool)\nAthletics, Piloting, Alertness, Knowledge (Navigation, Survival), Vocation (any)\n\n### Typical Archetypes\nMariner, Deep Sea Explorer, Marine Biologist, Shipwright, Underwater Salvage Expert, Diver\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Adaptability**: Rapid adaptation to marine conditions. (+2 to a specific Skill Check, may change assigned Skill daily)\n- **Aquatic Construction**: Building flotillas and submerged platforms. (+2 to all Construction Checks)\n- **Curiosity**: Investigative drive into pelagic depths. (Regain a Karma Point on the first encounter when dealing with something new)\n- **Empathy**: Deep connection with marine life and sentients. (+2 Insight and +2 Handle Animal Checks while being Friendly)\n- **Environmental Awareness**: Sensing water pressure, temperature, and currents. (+2 Alertness)\n- **Sea Piloting**: Master navigation of submersibles, boats, hovercraft, and aircraft. (+2 to all Seacraft Operation)\n- **Resourcefulness**: Creative problem-solving at sea. (Once per Day make a Skill Check of choice at Advantage)\n- **Survival Skills**: Underwater survival and predator evasion. (+2 Survival Skill Checks)"
  },
  {
    "id": "origin-colony",
    "name": "Colony",
    "category": "origins",
    "habitat": "Frontier Outpost",
    "skill_points": 20,
    "society_skills": [
      "Piloting",
      "Alertness",
      "Knowledge (Any)",
      "Vocation (Any)"
    ],
    "archetypes": [
      "Pioneer",
      "Homesteader",
      "Prospector",
      "Engineer",
      "Doctor",
      "Soldier"
    ],
    "traits": [
      "trait-adaptability",
      "trait-adventurous-spirit",
      "trait-community-building",
      "trait-diplomacy",
      "trait-leadership",
      "trait-problem-solving",
      "trait-resource-management",
      "trait-scientific-knowledge",
      "trait-survival-skills"
    ],
    "traits_detail": [
      {
        "id": "trait-adaptability",
        "name": "Adaptability",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Ability to adapt to new alien planetary biomes and unexpected environmental hurdles.",
        "mechanic": "+2 to a specific Skill Check, may change assigned Skill daily",
        "bonus": "+2 Daily Floating Skill",
        "cpCost": 1
      },
      {
        "id": "trait-adventurous-spirit",
        "name": "Adventurous Spirit",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Willingness to explore uncharted planetary regions and venture into the unknown frontier.",
        "mechanic": "One Skill Check at Advantage per day",
        "bonus": "1/Day Skill at Advantage",
        "cpCost": 1
      },
      {
        "id": "trait-community-building",
        "name": "Community Building",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Fostering cooperation and social cohesion essential for frontier settlement survival.",
        "mechanic": "Once per Day may reroll a Social Skill Check",
        "bonus": "1/Day Social Reroll",
        "cpCost": 1
      },
      {
        "id": "trait-diplomacy",
        "name": "Diplomacy",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Negotiating trade pacts and peaceful relations with rival outposts and indigenous factions.",
        "mechanic": "+2 Diplomacy",
        "bonus": "+2 Diplomacy",
        "cpCost": 1
      },
      {
        "id": "trait-leadership",
        "name": "Leadership",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Guiding fellow colonists through crises and establishing order in remote settlements.",
        "mechanic": "+2 Leadership",
        "bonus": "+2 Leadership",
        "cpCost": 1
      },
      {
        "id": "trait-problem-solving",
        "name": "Problem Solving",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Overcoming technical and environmental crises that arise during terraforming and settlement.",
        "mechanic": "Once per Day may reroll a Mental Skill Check",
        "bonus": "1/Day Mental Reroll",
        "cpCost": 1
      },
      {
        "id": "trait-resource-management",
        "name": "Resource Management",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Managing reserves of power, water, rations, and modular building components.",
        "mechanic": "Wealth Checks for Basic Resources made at Advantage",
        "bonus": "Advantage on Basic Wealth Checks",
        "cpCost": 1
      },
      {
        "id": "trait-scientific-knowledge",
        "name": "Scientific Knowledge",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Expertise in planetary geology, atmospheric biology, or agricultural terraforming.",
        "mechanic": "+2 to Science Knowledge",
        "bonus": "+2 Science Knowledge",
        "cpCost": 1
      },
      {
        "id": "trait-survival-skills",
        "name": "Survival Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Frontier wilderness survival, hazardous weather navigation, and shelter fabrication.",
        "mechanic": "+2 Survival Skill Checks",
        "bonus": "+2 Survival Checks",
        "cpCost": 1
      }
    ],
    "description": "New settlers who have just arrived or are still trying to establish themselves inhabit these worlds. Prefabricated or easily movable modular structures prevail on new planetary territories.",
    "full_text": "### Origin Overview\nNew settlers who have just arrived or are still trying to establish themselves inhabit these worlds. Prefabricated or other easily movable structures will be prevalent. It is simple to combine with another Origin (where the settlers come from or where they are building).\n\n### Society Skills (20 SP Pool)\nPiloting, Alertness, Knowledge (Any), Vocation (Any)\n\n### Typical Archetypes\nPioneer, Homesteader, Prospector, Engineer, Doctor, Soldier\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Adaptability**: Rapid adjustment to frontier obstacles. (+2 to a specific Skill Check, may change assigned Skill daily)\n- **Adventurous Spirit**: Audacity in exploring uncharted frontiers. (One Skill Check at Advantage per day)\n- **Community Building**: Fostering cooperative colony dynamics. (Once per Day may reroll a Social Skill Check)\n- **Diplomacy**: Inter-colony and faction negotiation. (+2 Diplomacy)\n- **Leadership**: Decisive guidance for frontier groups. (+2 Leadership)\n- **Problem Solving**: Technical and crisis resolution. (Once per Day may reroll a Mental Skill Check)\n- **Resource Management**: Optimal allocation of colony supplies. (Wealth Checks for Basic Resources made at Advantage)\n- **Scientific Knowledge**: Applied terraforming, geology, or biology. (+2 to Science Knowledge)\n- **Survival Skills**: Navigating untamed planetary frontiers. (+2 Survival Skill Checks)"
  },
  {
    "id": "origin-enlightened",
    "name": "Enlightened",
    "category": "origins",
    "habitat": "Sanctuary & Arcane",
    "skill_points": 20,
    "society_skills": [
      "Alertness",
      "Academics",
      "Knowledge (Culture)",
      "Knowledge (History)",
      "Knowledge (Language)",
      "Knowledge (Physics)",
      "Knowledge (Religion)",
      "Vocation (Any)"
    ],
    "archetypes": [
      "Arcanist",
      "Psionic",
      "Seer",
      "Scholar",
      "Spiritual Guide",
      "Envoy"
    ],
    "traits": [
      "trait-empathy",
      "trait-curiosity",
      "trait-mentorship",
      "trait-open-mindedness",
      "trait-peaceful-nature",
      "trait-problem-solving-skills",
      "trait-shared-wisdom",
      "trait-spiritual-awareness"
    ],
    "traits_detail": [
      {
        "id": "trait-empathy",
        "name": "Empathy",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Deep sense of empathy and compassion for sentient beings and spirits.",
        "mechanic": "+2 Insight and +2 Handle Animal Checks while being Friendly",
        "bonus": "+2 Insight & Animal Handling",
        "cpCost": 1
      },
      {
        "id": "trait-curiosity",
        "name": "Curiosity",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Philosophical and metaphysical curiosity driving exploration into arcane mysteries.",
        "mechanic": "Regain a Karma Point on the first encounter when dealing with something new during the session",
        "bonus": "Karma on Discovery",
        "cpCost": 1
      },
      {
        "id": "trait-mentorship",
        "name": "Mentorship",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Guiding pupils and imparting ancient wisdom to accelerate their intellectual and spiritual growth.",
        "mechanic": "Those under the Enlightened character’s tutelage may make Study Checks at Advantage",
        "bonus": "Advantage on Student Study Checks",
        "cpCost": 1
      },
      {
        "id": "trait-open-mindedness",
        "name": "Open-Mindedness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Receptiveness to foreign philosophies, traditions, and exotic worldviews.",
        "mechanic": "Reduce all Stigma Penalties with others by the Enlightened character’s Wisdom score for both parties",
        "bonus": "Reduce Stigma by Wisdom",
        "cpCost": 1
      },
      {
        "id": "trait-peaceful-nature",
        "name": "Peaceful Nature",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Harmonious disposition that de-escalates hostility through tranquil presence and negotiation.",
        "mechanic": "+2 to Diplomacy for peaceful meditations",
        "bonus": "+2 Peaceful Diplomacy",
        "cpCost": 1
      },
      {
        "id": "trait-problem-solving-skills",
        "name": "Problem-Solving Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Clarity of thought and meditative contemplation applied to intellectual quandaries.",
        "mechanic": "Once per Day may reroll a Mental Skill Check",
        "bonus": "1/Day Mental Reroll",
        "cpCost": 1
      },
      {
        "id": "trait-shared-wisdom",
        "name": "Shared Wisdom",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Imparting profound advice and guiding allies through precarious trials.",
        "mechanic": "Any Check to Aid, Guide or Instruct another (granting them a bonus) may be made at Advantage",
        "bonus": "Advantage on Aid Checks",
        "cpCost": 1
      },
      {
        "id": "trait-spiritual-awareness",
        "name": "Spiritual Awareness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Strong metaphysical attunement to ley lines, astral resonance, and psychic currents.",
        "mechanic": "+1 to Attune and one Metafocus Skill",
        "bonus": "+1 Attune & Metafocus",
        "cpCost": 1
      }
    ],
    "description": "Certain worlds have particularly strong ley lines, special crystal formations, atmospheric anomalies, or other features that make them metaphysically active. Adept Occupations and Metafocus Disciplines flourish here.",
    "full_text": "### Origin Overview\nCertain worlds have particularly strong ley lines, special crystal formations, atmospheric anomalies, or other features that make them more metaphysically active. This could be in the form of a variety of metaphysical energies or patterns, but it is still a common occurrence. Structures on these worlds may have a wide range of designs based on creativity, ability, and wants or needs. Adept Occupations (and Metafocus Disciplines) are more common in these worlds.\n\n### Society Skills (20 SP Pool)\nAlertness, Academics, Knowledge (Culture, History, Language, Physics, Religion), Vocation (any)\n\n### Typical Archetypes\nArcanist, Psionic, Seer, Scholar, Spiritual Guide, Envoy\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Empathy**: Deep compassion and insight into others. (+2 Insight and +2 Handle Animal Checks while being Friendly)\n- **Curiosity**: Natural drive toward discovery. (Regain a Karma Point on the first encounter when dealing with something new)\n- **Mentorship**: Nurturing student development. (Those under tutelage make Study Checks at Advantage)\n- **Open-Mindedness**: Dissolving cultural prejudice. (Reduce all Stigma Penalties by Wisdom score)\n- **Peaceful Nature**: Calming presence and mediation. (+2 to Diplomacy for peaceful meditations)\n- **Problem-Solving Skills**: Contemplative mental acuity. (Once per Day may reroll a Mental Skill Check)\n- **Shared Wisdom**: Guidance and tactical counsel. (Aid and Instruct checks made at Advantage)\n- **Spiritual Awareness**: Psychic and arcane resonance. (+1 to Attune and one Metafocus Skill)"
  },
  {
    "id": "origin-hostile",
    "name": "Hostile",
    "category": "origins",
    "habitat": "Death World & Extreme",
    "skill_points": 20,
    "society_skills": [
      "Athletics",
      "Alertness",
      "Knowledge (Survival)",
      "Combat (Any)",
      "Vocation (Any)"
    ],
    "archetypes": [
      "Survivalist",
      "Warrior",
      "Scavenger",
      "Shaman",
      "Mutant",
      "Outcast"
    ],
    "traits": [
      "trait-combat-skills",
      "trait-intuition",
      "trait-mental-toughness",
      "trait-physical-endurance",
      "trait-pilot-skills",
      "trait-resourcefulness",
      "trait-survival-skills",
      "trait-technical-skills"
    ],
    "traits_detail": [
      {
        "id": "trait-combat-skills",
        "name": "Combat Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Hardened combat training honed against ravenous apex predators and hostile environmental hazards.",
        "mechanic": "+2 to a Combat Skill of choice",
        "bonus": "+2 Chosen Combat Skill",
        "cpCost": 1
      },
      {
        "id": "trait-intuition",
        "name": "Intuition",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Heightened sixth sense allowing the operative to anticipate predatory ambushes and sudden cave-ins.",
        "mechanic": "Re-Roll any one failed Perception check per day",
        "bonus": "1/Day Perception Reroll",
        "cpCost": 1
      },
      {
        "id": "trait-mental-toughness",
        "name": "Mental Toughness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Withstanding psychic horrors, atmospheric hallucinations, and paralyzing terror.",
        "mechanic": "+2 Willpower Checks",
        "bonus": "+2 Willpower Checks",
        "cpCost": 1
      },
      {
        "id": "trait-physical-endurance",
        "name": "Physical Endurance",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Withstanding toxic atmosphere, radioactive fallout, dehydration, and exhaustion.",
        "mechanic": "+2 Fortitude Checks",
        "bonus": "+2 Fortitude Checks",
        "cpCost": 1
      },
      {
        "id": "trait-pilot-skills",
        "name": "Pilot Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Piloting atmospheric hovercraft and armored rovers through corrosive dust storms and boiling seas.",
        "mechanic": "+2 Piloting",
        "bonus": "+2 Piloting",
        "cpCost": 1
      },
      {
        "id": "trait-resourcefulness",
        "name": "Resourcefulness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Improvising survival tools and extracting water from poisoned soil.",
        "mechanic": "Once per Day make a Skill Check of choice at Advantage",
        "bonus": "1/Day Skill at Advantage",
        "cpCost": 1
      },
      {
        "id": "trait-survival-skills",
        "name": "Survival Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Tracking apex fauna, locating uncorrupted subterranean aquifers, and constructing sealed shelters.",
        "mechanic": "+2 Survival Skill Checks",
        "bonus": "+2 Survival Checks",
        "cpCost": 1
      },
      {
        "id": "trait-technical-skills",
        "name": "Technical Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Repairing air recyclers, EVA suits, and life-support units under extreme pressure.",
        "mechanic": "+1 to Mechanical, Electrical and Engineering Skill Checks",
        "bonus": "+1 Tech Checks",
        "cpCost": 1
      }
    ],
    "description": "It is uncommon to find a civilization in a dangerous or poisonous world, but hardy survivor clans have chosen or been forced to live in radiation wastelands, toxic swamps, and extreme geothermal death worlds.",
    "full_text": "### Origin Overview\nIt is uncommon to find a civilization in a dangerous or poisonous world, but some have chosen to live in such environments for various reasons. Structures must withstand corrosive rains, predator attacks, or seismic upheaval.\n\n### Society Skills (20 SP Pool)\nAthletics, Alertness, Knowledge (Survival), Combat (Any), Vocation (Any)\n\n### Typical Archetypes\nSurvivalist, Warrior, Scavenger, Shaman, Mutant, Outcast\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Combat Skills**: Defensive prowess against deadly fauna. (+2 to a Combat Skill of choice)\n- **Intuition**: Preternatural danger instinct. (Re-Roll any one failed Perception check per day)\n- **Mental Toughness**: Resistance to terror and despair. (+2 Willpower Checks)\n- **Physical Endurance**: Resistance to harsh toxins and fatigue. (+2 Fortitude Checks)\n- **Pilot Skills**: Hazardous terrain vehicular control. (+2 Piloting)\n- **Resourcefulness**: Scavenging and making every gram count. (Once per Day make a Skill Check of choice at Advantage)\n- **Survival Skills**: Finding food, water, and shelter in death zones. (+2 Survival Skill Checks)\n- **Technical Skills**: Emergency equipment patching. (+1 to Mechanical, Electrical and Engineering Skill Checks)"
  },
  {
    "id": "origin-industrial",
    "name": "Industrial",
    "category": "origins",
    "habitat": "Industrial Heavy",
    "skill_points": 20,
    "society_skills": [
      "Knowledge (Technology)",
      "Knowledge (Science)",
      "Vocation (Any)",
      "Knowledge (Any)"
    ],
    "archetypes": [
      "Miner",
      "Factory Worker",
      "Engineer",
      "Foreman",
      "Security Officer",
      "Corporate Executive"
    ],
    "traits": [
      "trait-adaptability",
      "trait-mechanical-aptitude",
      "trait-physical-strength",
      "trait-practicality",
      "trait-problem-solving-skills",
      "trait-resourcefulness",
      "trait-risk-taking",
      "trait-specialized-knowledge",
      "trait-teamwork"
    ],
    "traits_detail": [
      {
        "id": "trait-adaptability",
        "name": "Adaptability",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Adjusting rapidly to shifting manufacturing quotas, boiler hazards, and mechanical breakdowns.",
        "mechanic": "+2 to a specific Skill Check, may change assigned Skill daily",
        "bonus": "+2 Daily Floating Skill",
        "cpCost": 1
      },
      {
        "id": "trait-mechanical-aptitude",
        "name": "Mechanical Aptitude",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Natural talent for working with heavy machinery, hydraulic presses, automated assembly lines, and smelters.",
        "mechanic": "+1 to Mechanical, Electrical and Engineering Skill Checks",
        "bonus": "+1 Mechanical/Electrical/Eng Checks",
        "cpCost": 1
      },
      {
        "id": "trait-physical-strength",
        "name": "Physical Strength",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Above-average muscle power developed through grueling shifts in ore refineries and foundries.",
        "mechanic": "+2 Might Checks",
        "bonus": "+2 Might Checks",
        "cpCost": 1
      },
      {
        "id": "trait-practicality",
        "name": "Practicality",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Focused on functional, no-nonsense solutions over abstract or untested theories.",
        "mechanic": "+2 Logic Checks",
        "bonus": "+2 Logic Checks",
        "cpCost": 1
      },
      {
        "id": "trait-problem-solving-skills",
        "name": "Problem-Solving Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Diagnosing operational bottlenecks and fixing systemic failures on the plant floor.",
        "mechanic": "Once per Day may reroll a Mental Skill Check",
        "bonus": "1/Day Mental Reroll",
        "cpCost": 1
      },
      {
        "id": "trait-resourcefulness",
        "name": "Resourcefulness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Salvaging scrap parts and fabricating replacement gears on short notice.",
        "mechanic": "Once per Day make a Skill Check of choice at Advantage",
        "bonus": "1/Day Skill at Advantage",
        "cpCost": 1
      },
      {
        "id": "trait-risk-taking",
        "name": "Risk-Taking",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Willing to take calculated physical risks in hazardous high-heat, high-voltage environments.",
        "mechanic": "+1 Karma Point",
        "bonus": "+1 Karma Point",
        "cpCost": 1
      },
      {
        "id": "trait-specialized-knowledge",
        "name": "Specialized Knowledge",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Deep technical specialization in metallurgy, chemical processing, or structural robotics.",
        "mechanic": "+2 to a Vocation Specialization",
        "bonus": "+2 Vocation Specialization",
        "cpCost": 1
      },
      {
        "id": "trait-teamwork",
        "name": "Teamwork",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Flawless synchronization with crewmates operating heavy tandem machinery.",
        "mechanic": "additional +1 to Aid bonuses",
        "bonus": "+1 Aid Bonus",
        "cpCost": 1
      }
    ],
    "description": "These worlds are developed to exploit available natural resources and are designed for maximum efficiency. Heavy blast walls, automated smelters, toxic smokestacks, and modular worker complexes dominate.",
    "full_text": "### Origin Overview\nThese worlds are developed to exploit available resources and are designed for maximum efficiency. Buildings are often reinforced or mobile, with simple designs. These worlds typically have a non-green operating philosophy that prioritizes profit and output.\n\n### Society Skills (20 SP Pool)\nKnowledge (any), Vocation (any)\n\n### Typical Archetypes\nMiner, Factory Worker, Engineer, Foreman, Security Officer, Corporate Executive\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Adaptability**: Adjusting to changing shop-floor conditions. (+2 to a specific Skill Check, may change assigned Skill daily)\n- **Mechanical Aptitude**: Operating and repairing factory systems. (+1 to Mechanical, Electrical and Engineering Skill Checks)\n- **Physical Strength**: Rugged industrial conditioning. (+2 Might Checks)\n- **Practicality**: Grounded logical deduction. (+2 Logic Checks)\n- **Problem-Solving Skills**: Rapid diagnostic intuition. (Once per Day may reroll a Mental Skill Check)\n- **Resourcefulness**: Creative fixes under production pressure. (Once per Day make a Skill Check of choice at Advantage)\n- **Risk-Taking**: Daring courage around heavy machinery. (+1 Karma Point)\n- **Specialized Knowledge**: Deep industrial craft expertise. (+2 to a Vocation Specialization)\n- **Teamwork**: Synergy with work crews. (additional +1 to Aid bonuses)"
  },
  {
    "id": "origin-leisure",
    "name": "Leisure",
    "category": "origins",
    "habitat": "Resort & Paradise",
    "skill_points": 20,
    "society_skills": [
      "Vocation (Any)",
      "Social (Any)",
      "Etiquette",
      "Artisan (Any)"
    ],
    "archetypes": [
      "Aesthete",
      "Socialite",
      "Concierge",
      "Entertainer",
      "Artisan",
      "Security Officer"
    ],
    "traits": [
      "trait-adaptability",
      "trait-diplomacy",
      "trait-entertainment-skill",
      "trait-lifestyle-preferences",
      "trait-non-combat-focus",
      "trait-optimistic",
      "trait-management",
      "trait-resourcefulness",
      "trait-smooth-talking"
    ],
    "traits_detail": [
      {
        "id": "trait-adaptability",
        "name": "Adaptability",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Gracefully adjusting to high-society protocols and guest demands across diverse social tiers.",
        "mechanic": "+2 to a specific Skill Check, may change assigned Skill daily",
        "bonus": "+2 Daily Floating Skill",
        "cpCost": 1
      },
      {
        "id": "trait-diplomacy",
        "name": "Diplomacy",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Mastery in maintaining cordial relations, resolving delicate feuds, and managing elite clientele.",
        "mechanic": "+2 Diplomacy",
        "bonus": "+2 Diplomacy",
        "cpCost": 1
      },
      {
        "id": "trait-entertainment-skill",
        "name": "Entertainment Skill",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Excellence in musical performance, culinary arts, somatic exhibitions, or creative entertainment.",
        "mechanic": "+2 to a Non-Combat Skill of choice",
        "bonus": "+2 Non-Combat Skill",
        "cpCost": 1
      },
      {
        "id": "trait-lifestyle-preferences",
        "name": "Lifestyle Preferences",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Refined appreciation for luxurious fabrics, exotic beverages, and opulent surroundings.",
        "mechanic": "+1 Wealth and +1 Diplomacy",
        "bonus": "+1 Wealth & Diplomacy",
        "cpCost": 1
      },
      {
        "id": "trait-non-combat-focus",
        "name": "Non-Combat Focus",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Deep dedication to peaceful craftsmanship, service excellence, and cultural mastery.",
        "mechanic": "+2 to a Vocation Skill of choice",
        "bonus": "+2 Vocation Skill",
        "cpCost": 1
      },
      {
        "id": "trait-optimistic",
        "name": "Optimistic",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Irrepressible cheerfulness and positive mindset that helps weather tense diplomatic disputes.",
        "mechanic": "+1 to Karma Pool",
        "bonus": "+1 Karma Pool",
        "cpCost": 1
      },
      {
        "id": "trait-management",
        "name": "Management",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Organizing private events, overseeing luxury resort operations, and directing staff.",
        "mechanic": "+1 Wealth and +1 Leadership",
        "bonus": "+1 Wealth & Leadership",
        "cpCost": 1
      },
      {
        "id": "trait-resourcefulness",
        "name": "Resourcefulness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Improvising solutions to keep guests satisfied and operations smooth.",
        "mechanic": "Once per Day make a Skill Check of choice at Advantage",
        "bonus": "1/Day Skill at Advantage",
        "cpCost": 1
      },
      {
        "id": "trait-smooth-talking",
        "name": "Smooth talking",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Charismatic charm, silver-tongued rhetoric, and impeccable manners.",
        "mechanic": "+2 Etiquette Checks",
        "bonus": "+2 Etiquette Checks",
        "cpCost": 1
      }
    ],
    "description": "These worlds can best be described as paradise or utopian, focusing on aesthetics over functionality. High-end resort cities, private gambling spires, pristine beaches, and artistic sanctuaries cater to elites and tourists.",
    "full_text": "### Origin Overview\nThese worlds can best be described as paradise or utopian, focusing on aesthetics over functionality. They often cater to tourists, with notable resort or vacation spots where guest services are a priority. The wealthy/upper class will enjoy the leisurely side of the resorts, while those of lower station will likely be working - both are considered for this origin.\n\n### Society Skills (20 SP Pool)\nVocation (any), Social (any)\n\n### Typical Archetypes\nAesthete, Socialite, Concierge, Entertainer, Artisan, Security Officer\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Adaptability**: Effortless social adjustment. (+2 to a specific Skill Check, may change assigned Skill daily)\n- **Diplomacy**: Tact and dispute mediation. (+2 Diplomacy)\n- **Entertainment Skill**: Artistic, performance, or culinary talent. (+2 to a Non-Combat Skill of choice)\n- **Lifestyle Preferences**: Understanding luxury culture. (+1 Wealth and +1 Diplomacy)\n- **Non-Combat Focus**: Vocational and artistic excellence. (+2 to a Vocation Skill of choice)\n- **Optimistic**: Cheerful resilience under social tension. (+1 to Karma Pool)\n- **Management**: Asset and luxury facility coordination. (+1 Wealth and +1 Leadership)\n- **Resourcefulness**: Creative service problem-solving. (Once per Day make a Skill Check of choice at Advantage)\n- **Smooth talking**: High-society charm and silver-tongued poise. (+2 Etiquette Checks)"
  },
  {
    "id": "origin-militaristic",
    "name": "Militaristic",
    "category": "origins",
    "habitat": "Military Stronghold",
    "skill_points": 20,
    "society_skills": [
      "Combat (Any)",
      "Physical (Any)",
      "Vocation (Any)",
      "Alertness",
      "Tactics"
    ],
    "archetypes": [
      "Shock Trooper",
      "Sharpshooter",
      "Combat Medic",
      "Tactician",
      "Military Engineer",
      "Military Intelligence Officer"
    ],
    "traits": [
      "trait-combat-trained",
      "trait-disciplined",
      "trait-honor-bound",
      "trait-leadership",
      "trait-loyal",
      "trait-milspec-gear",
      "trait-pilot-skills",
      "trait-strategic",
      "trait-tough"
    ],
    "traits_detail": [
      {
        "id": "trait-combat-trained",
        "name": "Combat Trained",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Rigorous drills in small-arms tactics, hand-to-hand combat, and tactical room-clearing.",
        "mechanic": "+2 to a Combat Skill of choice",
        "bonus": "+2 Chosen Combat Skill",
        "cpCost": 1
      },
      {
        "id": "trait-disciplined",
        "name": "Disciplined",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Iron resolve, strict adherence to chain-of-command, and composure under enemy artillery fire.",
        "mechanic": "+2 Soldier Vocation",
        "bonus": "+2 Soldier Vocation",
        "cpCost": 1
      },
      {
        "id": "trait-honor-bound",
        "name": "Honor-bound",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Unshakable personal code of honor, willing to lay down one’s life to protect comrades.",
        "mechanic": "Any One check per day at Advantage, but must be for another",
        "bonus": "1/Day Advantage for Ally",
        "cpCost": 1
      },
      {
        "id": "trait-leadership",
        "name": "Leadership",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Proven battlefield command experience inspiring fireteams to advance against overwhelming odds.",
        "mechanic": "+2 Leadership Checks",
        "bonus": "+2 Leadership Checks",
        "cpCost": 1
      },
      {
        "id": "trait-loyal",
        "name": "Loyal",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Steadfast fidelity to battalion and squadmates, rendering mind control and betrayal abhorrent.",
        "mechanic": "Domination and Mind-Control Resistance Checks are made at Advantage",
        "bonus": "Advantage vs Mind Control",
        "cpCost": 1
      },
      {
        "id": "trait-milspec-gear",
        "name": "Milspec Gear",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Trained to utilize and field-strip military-grade ordinance and tactical armor.",
        "mechanic": "+2 Equipment",
        "bonus": "+2 Equipment Checks",
        "cpCost": 1
      },
      {
        "id": "trait-pilot-skills",
        "name": "Pilot Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "High-speed tactical dropship, attack gunship, and armored personnel carrier operation.",
        "mechanic": "+2 Piloting",
        "bonus": "+2 Piloting",
        "cpCost": 1
      },
      {
        "id": "trait-strategic",
        "name": "Strategic",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Deep understanding of tactical staging, supply lines, crossfire corridors, and coordinated assaults.",
        "mechanic": "Those following the plan will receive a bonus pool to be used during the operation equal to the characters Intellect Score + 2",
        "bonus": "Strategic Bonus Pool (INT+2)",
        "cpCost": 1
      },
      {
        "id": "trait-tough",
        "name": "Tough",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Rugged physical resilience and mental endurance forged through harsh bootcamp conditioning.",
        "mechanic": "+1 Fortitude and Willpower Checks",
        "bonus": "+1 Fortitude & Willpower",
        "cpCost": 1
      }
    ],
    "description": "Whether a fortified border fortress, orbital garrison, or dedicated planetary training ground, a pervasive military hierarchy governs every aspect of daily life. Fortified bunkers and security corridors prevail.",
    "full_text": "### Origin Overview\nWhether an outpost, training facility or some other strategic world, there is a governing military presence. Structures will be reinforced, placed within a defendable area and often walled. Many personnel from this type of society will be of the Soldier Profession.\n\n### Society Skills (20 SP Pool)\nPhysical (any), Vocation (any), Combat (any)\n\n### Typical Archetypes\nShock Trooper, Sharpshooter, Combat Medic, Tactician, Military Engineer, Military Intelligence Officer\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Combat Trained**: Specialized weapon drills and tactical combat. (+2 to a Combat Skill of choice)\n- **Disciplined**: Unwavering protocol adherence. (+2 Soldier Vocation)\n- **Honor-bound**: Self-sacrifice for battalion honor. (Any One check per day at Advantage, but must be for another)\n- **Leadership**: Commanding squad formations. (+2 Leadership Checks)\n- **Loyal**: Mental resistance to betrayal and psychic intrusion. (Domination and Mind-Control Resistance made at Advantage)\n- **Milspec Gear**: Familiarity with heavy ordinance. (+2 Equipment)\n- **Pilot Skills**: Military drop-craft and vehicle maneuvers. (+2 Piloting)\n- **Strategic**: Mission planning granting operational bonus pool. (Allies gain bonus pool equal to INT score + 2)\n- **Tough**: Physical and psychological resilience. (+1 Fortitude and Willpower Checks)"
  },
  {
    "id": "origin-research",
    "name": "Research",
    "category": "origins",
    "habitat": "Science & Laboratory",
    "skill_points": 20,
    "society_skills": [
      "Mental (Any)",
      "Academics",
      "Knowledge (Science)",
      "Knowledge (Technology)",
      "Vocation (Any)"
    ],
    "archetypes": [
      "Scientist",
      "Analyst",
      "Theorist",
      "Archivist",
      "Technician",
      "Security Officer"
    ],
    "traits": [
      "trait-adaptability",
      "trait-analytical-thinking",
      "trait-attention-to-detail",
      "trait-collaboration",
      "trait-curiosity",
      "trait-intellectualism",
      "trait-persistence",
      "trait-problem-solving",
      "trait-studious"
    ],
    "traits_detail": [
      {
        "id": "trait-adaptability",
        "name": "Adaptability",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Quickly modifying laboratory hypotheses and diagnostic parameters when anomalous data appears.",
        "mechanic": "+2 to a specific Skill Check, may change assigned Skill daily",
        "bonus": "+2 Daily Floating Skill",
        "cpCost": 1
      },
      {
        "id": "trait-analytical-thinking",
        "name": "Analytical thinking",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Analyzing complex telemetry, identifying cryptographic patterns, and drawing rigorous empirical conclusions.",
        "mechanic": "+2 Logic Checks",
        "bonus": "+2 Logic Checks",
        "cpCost": 1
      },
      {
        "id": "trait-attention-to-detail",
        "name": "Attention to detail",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Keen eye for micro-fluctuations in sensor readouts and microscopic material fractures.",
        "mechanic": "+2 Alertness",
        "bonus": "+2 Alertness",
        "cpCost": 1
      },
      {
        "id": "trait-collaboration",
        "name": "Collaboration",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Working smoothly with interdisciplinary research teams and effectively sharing breakthroughs.",
        "mechanic": "additional +1 to Aid bonuses received and granted",
        "bonus": "+1 Aid Given/Received",
        "cpCost": 1
      },
      {
        "id": "trait-curiosity",
        "name": "Curiosity",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Inquiring mind that revels in deciphering unknown alien relics and anomalous physics.",
        "mechanic": "Regain a Karma Point on the first encounter when dealing with something new during the session",
        "bonus": "Karma on Discovery",
        "cpCost": 1
      },
      {
        "id": "trait-intellectualism",
        "name": "Intellectualism",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "High academic pedigree and deep foundational mastery across scientific domains.",
        "mechanic": "+2 Academics and +2 to a Mental Skill Specialization",
        "bonus": "+2 Academics & Spec",
        "cpCost": 1
      },
      {
        "id": "trait-persistence",
        "name": "Persistence",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Relentless dedication that refuses to abandon stalled experiments or inscrutable ciphers.",
        "mechanic": "+1 Karma Point",
        "bonus": "+1 Karma Point",
        "cpCost": 1
      },
      {
        "id": "trait-problem-solving",
        "name": "Problem-solving",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Developing creative scientific workarounds to containment failures and computational limits.",
        "mechanic": "Once per Day may reroll a Mental Skill Check",
        "bonus": "1/Day Mental Reroll",
        "cpCost": 1
      },
      {
        "id": "trait-studious",
        "name": "Studious",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Gained encyclopedic familiarity with specialized academic archives and historical treatises.",
        "mechanic": "+2 to a Knowledge of choice",
        "bonus": "+2 Chosen Knowledge",
        "cpCost": 1
      }
    ],
    "description": "A complex or habitat dedicated to the pursuit of knowledge. These worlds are focused on the systematic scientific investigation of a particular subject, housing clean rooms, orbital observatories, and supercomputer arrays.",
    "full_text": "### Origin Overview\nA complex or habitat dedicated to the pursuit of knowledge. These worlds are focused on the systematic scientific investigation of a particular subject. Structures can range from prefabricated or mobile to large laboratory complexes, depending on need and resources.\n\n### Society Skills (20 SP Pool)\nMental (any)\n\n### Typical Archetypes\nScientist, Analyst, Theorist, Archivist, Technician, Security Officer\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Adaptability**: Modifying hypotheses to anomalous conditions. (+2 to a specific Skill Check, may change assigned Skill daily)\n- **Analytical thinking**: Rigorous empirical and logical analysis. (+2 Logic Checks)\n- **Attention to detail**: Catching micro-variations and anomalies. (+2 Alertness)\n- **Collaboration**: Academic synergy in research teams. (additional +1 to Aid bonuses received and granted)\n- **Curiosity**: Investigative passion for the unknown. (Regain a Karma Point on the first encounter when dealing with something new)\n- **Intellectualism**: Deep scientific and academic training. (+2 Academics and +2 to a Mental Skill Specialization)\n- **Persistence**: Relentless pursuit of scientific truth. (+1 Karma Point)\n- **Problem-solving**: Creative theoretical breakthroughs. (Once per Day may reroll a Mental Skill Check)\n- **Studious**: Encyclopedic archival mastery. (+2 to a Knowledge of choice)"
  },
  {
    "id": "origin-spacer",
    "name": "Spacer",
    "category": "origins",
    "habitat": "Deep Void & Station",
    "skill_points": 20,
    "society_skills": [
      "Piloting",
      "Alertness",
      "Knowledge (Technology)",
      "Knowledge (Survival)",
      "Vocation (Any)"
    ],
    "archetypes": [
      "Freighter Captain",
      "Explorer",
      "Mercenary",
      "Smuggler",
      "Technician",
      "Merchant"
    ],
    "traits": [
      "trait-combat-training",
      "trait-independence",
      "trait-leadership-skills",
      "trait-pilot-skills",
      "trait-resourcefulness",
      "trait-smooth-talking",
      "trait-technical-skills",
      "trait-toughness"
    ],
    "traits_detail": [
      {
        "id": "trait-combat-training",
        "name": "Combat Training",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Zero-g boarding tactics, depressurization combat, and close-quarters defense in cramped starship corridors.",
        "mechanic": "+2 to a Combat Skill of choice",
        "bonus": "+2 Chosen Combat Skill",
        "cpCost": 1
      },
      {
        "id": "trait-independence",
        "name": "Independence",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Self-reliance and autonomy nurtured through years of solitary deep-space voyages far beyond comms reach.",
        "mechanic": "+1 Karma Point",
        "bonus": "+1 Karma Point",
        "cpCost": 1
      },
      {
        "id": "trait-leadership-skills",
        "name": "Leadership Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Maintaining crew morale, resolving hull-fever quarrels, and commanding maneuvers during asteroid transit.",
        "mechanic": "+2 Leadership Checks",
        "bonus": "+2 Leadership Checks",
        "cpCost": 1
      },
      {
        "id": "trait-pilot-skills",
        "name": "Pilot Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Precise orbital docking, RCS thruster calibration, hyperlane vector alignment, and evasive rolls.",
        "mechanic": "+2 Piloting",
        "bonus": "+2 Piloting",
        "cpCost": 1
      },
      {
        "id": "trait-resourcefulness",
        "name": "Resourcefulness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Conserving O2, recycling reaction mass, and jury-rigging blown conduits with minimal spare parts.",
        "mechanic": "Once per Day make a Skill Check of choice at Advantage",
        "bonus": "1/Day Skill at Advantage",
        "cpCost": 1
      },
      {
        "id": "trait-smooth-talking",
        "name": "Smooth Talking",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Persuading station customs officers, negotiating black-market fuel rates, and bluffing privateers.",
        "mechanic": "+2 Bluff",
        "bonus": "+2 Bluff",
        "cpCost": 1
      },
      {
        "id": "trait-technical-skills",
        "name": "Technical Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Calibrating life support scrubbing arrays, micro-meteorite hull patches, and reactor coolant seals.",
        "mechanic": "+1 to Mechanical, Electrical and Engineering Skill Checks",
        "bonus": "+1 Tech Checks",
        "cpCost": 1
      },
      {
        "id": "trait-toughness",
        "name": "Toughness",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Withstanding microgravity bone loss, cosmic radiation exposure, and rapid cabin pressure fluctuations.",
        "mechanic": "+1 Fortitude and Willpower Checks",
        "bonus": "+1 Fortitude & Willpower",
        "cpCost": 1
      }
    ],
    "description": "Some people do not have a home planet, instead choosing to travel the stars. They spend most of their time on generation ships, orbital trade rings, and hollowed-out asteroid stations, rarely setting foot on planetary dirt.",
    "full_text": "### Origin Overview\nSome people do not have a home planet, instead choosing to travel the stars. They spend most of their time on ships and stations in space, and some have never set foot on a planet. Void clans, free-traders, and belt-miners embody this nomadic spaceborne existence.\n\n### Society Skills (20 SP Pool)\nPiloting, Alertness, Knowledge (Technology), Knowledge (Survival), Vocation (Any)\n\n### Typical Archetypes\nFreighter Captain, Explorer, Mercenary, Smuggler, Technician, Merchant\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Combat Training**: Zero-g and depressurized boarding warfare. (+2 to a Combat Skill of choice)\n- **Independence**: Deep-space self-reliance. (+1 Karma Point)\n- **Leadership Skills**: Managing starship crews in crisis. (+2 Leadership Checks)\n- **Pilot Skills**: Vacuum navigation and docking mastery. (+2 Piloting)\n- **Resourcefulness**: Life-support and fuel conservation. (Once per Day make a Skill Check of choice at Advantage)\n- **Smooth Talking**: Free-trader haggling and customs persuasion. (+2 Bluff)\n- **Technical Skills**: Starship maintenance and reactor repairs. (+1 to Mechanical, Electrical and Engineering Skill Checks)\n- **Toughness**: Resistance to cosmic radiation and decompression. (+1 Fortitude and Willpower Checks)"
  },
  {
    "id": "origin-urban",
    "name": "Urban",
    "category": "origins",
    "habitat": "Sprawl & Arcology",
    "skill_points": 20,
    "society_skills": [
      "Streetwise",
      "Alertness",
      "Knowledge (Culture)",
      "Knowledge (Technology)",
      "Social (Any)",
      "Vocation (Any)"
    ],
    "archetypes": [
      "Street Fixer",
      "Ganger Enforcer",
      "Cyber-Runner",
      "Rooftop Courier",
      "Corporate Drone",
      "City Gumshoe"
    ],
    "traits": [
      "trait-adaptability",
      "trait-contacts",
      "trait-resourceful",
      "trait-social-skills",
      "trait-street-fighting",
      "trait-streetwise",
      "trait-tech-savvy",
      "trait-urban-survival"
    ],
    "traits_detail": [
      {
        "id": "trait-adaptability",
        "name": "Adaptability",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Adapting to shifting turf wars, sudden police sweeps, and rapid socio-economic volatility in the megacity.",
        "mechanic": "+2 to a specific Skill Check, may change assigned Skill daily",
        "bonus": "+2 Daily Floating Skill",
        "cpCost": 1
      },
      {
        "id": "trait-contacts",
        "name": "Contacts",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Extensive web of street informants, back-alley chop-docs, corporate middle-managers, and black-market fences.",
        "mechanic": "Gather Information checks at Advantage",
        "bonus": "Advantage on Gather Info",
        "cpCost": 1
      },
      {
        "id": "trait-resourceful",
        "name": "Resourceful",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Hustling to turn junk electronics into functional surveillance taps and finding angles where none seem to exist.",
        "mechanic": "Once per Day make a Skill Check of choice at Advantage",
        "bonus": "1/Day Skill at Advantage",
        "cpCost": 1
      },
      {
        "id": "trait-social-skills",
        "name": "Social Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Navigating layered corporate boardrooms, gang shakedowns, and multicultural street markets.",
        "mechanic": "+1 all Social Manipulation Skills and Culture Knowledge",
        "bonus": "+1 Social & Culture Checks",
        "cpCost": 1
      },
      {
        "id": "trait-street-fighting",
        "name": "Street Fighting",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Vicious close-quarters brawl techniques using brass knuckles, concealed shivs, and dirty tactics in tight alleys.",
        "mechanic": "+1 Unarmed Combat and Defense",
        "bonus": "+1 Unarmed & Defense",
        "cpCost": 1
      },
      {
        "id": "trait-streetwise",
        "name": "Streetwise",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "In-depth mastery of underworld syndicates, secret black-clinic passwords, and surveillance blindspots.",
        "mechanic": "+2 Streetwise (additional +1 in Home City)",
        "bonus": "+2 Streetwise (+1 Home City)",
        "cpCost": 1
      },
      {
        "id": "trait-tech-savvy",
        "name": "Tech-Savvy",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Everyday expertise with neural datalinks, cybernetic interfaces, personal comm-arrays, and citywide grids.",
        "mechanic": "+2 to Knowledges of Computer and Technology",
        "bonus": "+2 Computer & Tech Knowledge",
        "cpCost": 1
      },
      {
        "id": "trait-urban-survival",
        "name": "Urban Survival Skills",
        "tier": "Basic",
        "classification": "Origin Trait",
        "description": "Acrobatic freerunning across neon rooftops, blending invisibly into crowds, and evasion of police drones.",
        "mechanic": "+2 Athletics and Stealth Skills (in Urban and developed areas)",
        "bonus": "+2 Athletics & Stealth (Urban)",
        "cpCost": 1
      }
    ],
    "description": "People who live in cities, from large metropolises to vertical arcologies, experience high population density, rapid technological integration, ground and air vehicles, and vibrant street cultures.",
    "full_text": "### Origin Overview\nPeople who live in cities, from large metropolises to smaller but highly developed areas, will experience the benefits and drawbacks of \"civilized society,\" which includes a high population density. Large high-rises will be the norm, and communities will be close together. Ground and air vehicles, including GEVs and hovercraft, will be commonplace.\n\n### Society Skills (20 SP Pool)\nStreetwise, Alertness, Knowledge (Culture), Knowledge (Technology), Social (Any), Vocation (Any)\n\n### Typical Archetypes\nStreet Fixer, Ganger Enforcer, Cyber-Runner, Rooftop Courier, Corporate Drone, City Gumshoe\n\n### Origin Traits (Select 2 Free; Additional 1 CP each)\n- **Adaptability**: Rapid reaction to volatile street politics. (+2 to a specific Skill Check, may change assigned Skill daily)\n- **Contacts**: Deep network of fixers and informants. (Gather Information checks at Advantage)\n- **Resourceful**: Surviving on wits and hustle. (Once per Day make a Skill Check of choice at Advantage)\n- **Social Skills**: Blending into high and low social strata. (+1 all Social Manipulation Skills and Culture Knowledge)\n- **Street Fighting**: Dirty infighting in tight corridors. (+1 Unarmed Combat and Defense)\n- **Streetwise**: Underworld savvy and territorial awareness. (+2 Streetwise, +1 in Home City)\n- **Tech-Savvy**: Practical expertise with cyber-grids and computers. (+2 to Knowledges of Computer and Technology)\n- **Urban Survival Skills**: Parkour, crowd evasion, and shadows. (+2 Athletics and Stealth Skills in Urban areas)"
  }
];

export default DEFAULT_ORIGINS;
