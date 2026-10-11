/**
 * Canonical Tangent SF RP Skills Database
 * Comprehensive definition of all skills across Physical, Mental, Social, Combat, and Metafocus groups.
 */

export const DEFAULT_SKILLS = {
  "physical": [
    {
      "title": null,
      "skills": [
        {
          "name": "Acrobatics",
          "id": "physical-acrobatics",
          "group": "physical",
          "baseAttr": "attr-agility",
          "description": "Balance, tumbling, climbing, dodging, and gymnastic maneuvers.",
          "keywords": "acrobatics, physical, agility, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy"
        },
        {
          "name": "Athletics",
          "id": "physical-athletics",
          "group": "physical",
          "baseAttr": "attr-strength",
          "description": "Running, jumping, swimming, lifting, and general physical prowess.",
          "keywords": "athletics, physical, strength, mobility, bodily-coordination, running",
          "negative_keywords": "sedentary, paralyzed, clumsy"
        },
        {
          "name": "Endurance",
          "id": "physical-endurance",
          "group": "physical",
          "baseAttr": "attr-stamina",
          "description": "Physical stamina, pain tolerance, resisting exhaustion, and prolonged exertion.",
          "keywords": "endurance, physical, stamina, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy"
        },
        {
          "name": "Piloting",
          "id": "physical-piloting",
          "group": "physical",
          "baseAttr": "attr-agility",
          "description": "Operating atmospheric, space, and planetary surface vehicles.",
          "keywords": "piloting, physical, agility, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy"
        },
        {
          "name": "Stealth",
          "id": "physical-stealth",
          "group": "physical",
          "baseAttr": "attr-agility",
          "description": "Moving silently, remaining undetected, and evading detection systems.",
          "keywords": "stealth, physical, agility, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy"
        }
      ]
    }
  ],
  "mental": [
    {
      "title": "General",
      "skills": [
        {
          "name": "Alertness",
          "id": "mental-alertness",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Perception, sensory awareness, detecting hidden hazards or ambushes.",
          "keywords": "alertness, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Academics",
          "id": "mental-academics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "General higher education, scholarly research, and formal knowledge.",
          "keywords": "academics, mental, intellect, cognitive, expertise, higher",
          "negative_keywords": "mindless, instinct-only, illiterate"
        }
      ]
    },
    {
      "title": "Knowledges",
      "skills": [
        {
          "name": "Appraisal",
          "id": "mental-appraisal",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Assessing the monetary, historical, or technological value of goods.",
          "keywords": "appraisal, mental, intellect, cognitive, expertise, assessing",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Arcane",
          "id": "mental-arcane",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Arcane theory, esoteric lore, magical traditions, runes, and occult phenomena.",
          "keywords": "arcane, mental, intellect, cognitive, expertise, theory",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Business",
          "id": "mental-business",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Commerce, corporate finance, market economics, and enterprise management.",
          "keywords": "business, mental, intellect, cognitive, expertise, commerce",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Computers",
          "id": "mental-computers",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Hacking, programming, software engineering, and computer system security.",
          "keywords": "computers, mental, intellect, cognitive, expertise, hacking",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Culture",
          "id": "mental-culture",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Customs, languages, etiquette, and social structures of diverse species and worlds.",
          "keywords": "culture, mental, intellect, cognitive, expertise, customs",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "History",
          "id": "mental-history",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Historical records, past civilizations, conflicts, and galactic chronology.",
          "keywords": "history, mental, intellect, cognitive, expertise, historical",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Investigation",
          "id": "mental-investigation",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Forensics, searching for clues, deducting motives, and solving mysteries.",
          "keywords": "investigation, mental, intellect, cognitive, expertise, forensics",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Language",
          "id": "mental-language",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Linguistics, deciphering scripts, and fluency in alien dialects.",
          "keywords": "language, mental, intellect, cognitive, expertise, linguistics",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Logistics",
          "id": "mental-logistics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Supply chains, resource distribution, transit scheduling, and fleet support.",
          "keywords": "logistics, mental, intellect, cognitive, expertise, supply",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Medicine",
          "id": "mental-medicine",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "First aid, surgery, pharmacology, pathology, and trauma treatment.",
          "keywords": "medicine, mental, intellect, cognitive, expertise, first",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Metaphysics",
          "id": "mental-metaphysics",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Understanding the nature of psionic energy, the Void, and supernatural phenomena.",
          "keywords": "metaphysics, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Nature",
          "id": "mental-nature",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Fauna, flora, ecosystems, ecology, and natural sciences.",
          "keywords": "nature, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Navigation",
          "id": "mental-navigation",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Astrogation, hyperspace charting, compass reading, and planetary orienteering.",
          "keywords": "navigation, mental, intellect, cognitive, expertise, astrogation",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Nobility",
          "id": "mental-nobility",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Heraldry, aristocratic hierarchies, courtly intrigue, and high-society protocols.",
          "keywords": "nobility, mental, intellect, cognitive, expertise, heraldry",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Physics",
          "id": "mental-physics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Astrophysics, quantum mechanics, gravimetrics, and energy thermodynamics.",
          "keywords": "physics, mental, intellect, cognitive, expertise, astrophysics",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Religion",
          "id": "mental-religion",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Theology, cult rituals, religious dogmas, sacred texts, and mythical traditions.",
          "keywords": "religion, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Science",
          "id": "mental-science",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "General scientific method, chemistry, biology, geology, and laboratory experimentation.",
          "keywords": "science, mental, intellect, cognitive, expertise, scientific",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Survival",
          "id": "mental-survival",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Foraging, tracking, building shelters, firecraft, and wilderness survival.",
          "keywords": "survival, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Tactics",
          "id": "mental-tactics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Squad tactics, battle maneuvers, defensive positioning, and combat strategy.",
          "keywords": "tactics, mental, intellect, cognitive, expertise, squad",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Technology",
          "id": "mental-technology",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Hardware maintenance, mechanical systems, cybernetics, and electronics.",
          "keywords": "technology, mental, intellect, cognitive, expertise, hardware",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Trade",
          "id": "mental-trade",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Merchant lanes, interstellar tariffs, bargaining, and contraband smuggling.",
          "keywords": "trade, mental, intellect, cognitive, expertise, merchant",
          "negative_keywords": "mindless, instinct-only, illiterate"
        }
      ]
    },
    {
      "title": "Vocations",
      "skills": [
        {
          "name": "Administrator",
          "id": "mental-administrator",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Bureaucratic processing, government record-keeping, and organization.",
          "keywords": "administrator, mental, intellect, cognitive, expertise, bureaucratic",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Alchemist",
          "id": "mental-alchemist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Creating potions, elixirs, chemical compounds, and reactive reagents.",
          "keywords": "alchemist, mental, intellect, cognitive, expertise, creating",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Ambassador",
          "id": "mental-ambassador",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Diplomatic negotiations, envoy missions, and high-level treaties.",
          "keywords": "ambassador, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Architect",
          "id": "mental-architect",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Designing buildings, habitat domes, fortresses, and civil engineering.",
          "keywords": "architect, mental, intellect, cognitive, expertise, designing",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Archivist",
          "id": "mental-archivist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Cataloging data archives, library indexes, and preserving ancient artifacts.",
          "keywords": "archivist, mental, intellect, cognitive, expertise, cataloging",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Armorer",
          "id": "mental-armorer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Fabricating, fitting, reinforcing, and repairing body armor and shields.",
          "keywords": "armorer, mental, intellect, cognitive, expertise, fabricating",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Artist",
          "id": "mental-artist",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Visual arts, sculpting, painting, holography, and aesthetic design.",
          "keywords": "artist, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Artificer",
          "id": "mental-artificer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Crafting technological wonders, specialized gadgets, and prototypes.",
          "keywords": "artificer, mental, intellect, cognitive, expertise, crafting",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Broker",
          "id": "mental-broker",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Information dealing, resource arbitrage, and middleman transactions.",
          "keywords": "broker, mental, intellect, cognitive, expertise, information",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Celebrity",
          "id": "mental-celebrity",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Media presence, public relations, fan interaction, and reputation handling.",
          "keywords": "celebrity, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Constable",
          "id": "mental-constable",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Law enforcement protocols, suspect detention, and security policing.",
          "keywords": "constable, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Courtesan",
          "id": "mental-courtesan",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Social entertainment, high-class companionship, and subtle gathering of secrets.",
          "keywords": "courtesan, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Culinarian",
          "id": "mental-culinarian",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Gastronomy, alien cuisine preparation, brewing, and nutrition.",
          "keywords": "culinarian, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Demolitionist",
          "id": "mental-demolitionist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Explosives handling, bomb defusal, breaching, and controlled blasting.",
          "keywords": "demolitionist, mental, intellect, cognitive, expertise, explosives",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Electrician",
          "id": "mental-electrician",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Power grid wiring, circuitry, conduits, and electronic repair.",
          "keywords": "electrician, mental, intellect, cognitive, expertise, power",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Engineer",
          "id": "mental-engineer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Heavy machinery, engine mechanics, reactor maintenance, and starship drives.",
          "keywords": "engineer, mental, intellect, cognitive, expertise, heavy",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Farmer",
          "id": "mental-farmer",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Agriculture, hydroponics, crop cultivation, and harvesting.",
          "keywords": "farmer, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Groundskeeper",
          "id": "mental-groundskeeper",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Estate maintenance, terrain upkeep, and environmental management.",
          "keywords": "groundskeeper, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Handler",
          "id": "mental-handler",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Animal husbandry, beast training, mounts, and xenofauna handling.",
          "keywords": "handler, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Laborer",
          "id": "mental-laborer",
          "group": "mental",
          "baseAttr": "attr-strength",
          "description": "Manual labor, construction, cargo hauling, and industrial tasks.",
          "keywords": "laborer, mental, strength, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Mechanic",
          "id": "mental-mechanic",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Vehicle diagnostics, engine overhaul, and mechanical repair.",
          "keywords": "mechanic, mental, intellect, cognitive, expertise, vehicle",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Researcher",
          "id": "mental-researcher",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Academic studies, data synthesis, hypothesis testing, and laboratory work.",
          "keywords": "researcher, mental, intellect, cognitive, expertise, academic",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Salvager",
          "id": "mental-salvager",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Scrapping wrecks, identifying valuable components, and recycling materials.",
          "keywords": "salvager, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Soldier",
          "id": "mental-soldier",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Military protocol, battlefield discipline, marching, and unit drill.",
          "keywords": "soldier, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Tailor",
          "id": "mental-tailor",
          "group": "mental",
          "baseAttr": "attr-agility",
          "description": "Fabric crafting, custom tailoring, protective weave stitching, and fashion.",
          "keywords": "tailor, mental, agility, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Transporter",
          "id": "mental-transporter",
          "group": "mental",
          "baseAttr": "attr-agility",
          "description": "Freight delivery, cargo transit, navigation under pressure, and escort driving.",
          "keywords": "transporter, mental, agility, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate"
        },
        {
          "name": "Weaponsmith",
          "id": "mental-weaponsmith",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Forging, calibrating, modding, and maintaining ranged and melee weaponry.",
          "keywords": "weaponsmith, mental, intellect, cognitive, expertise, forging",
          "negative_keywords": "mindless, instinct-only, illiterate"
        }
      ]
    }
  ],
  "social": [
    {
      "title": "Expression",
      "skills": [
        {
          "name": "Acting",
          "id": "social-acting",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Theatrical performance, emotional projection, and playing a role.",
          "keywords": "acting, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Comedy",
          "id": "social-comedy",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Humor, wit, comedic timing, and tension relief.",
          "keywords": "comedy, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Dancing",
          "id": "social-dancing",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Choreography, social dancing, and rhythmic physical grace.",
          "keywords": "dancing, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Disguise",
          "id": "social-disguise",
          "group": "social",
          "baseAttr": "attr-intellect",
          "description": "Costuming, prosthetic makeup, and impersonation.",
          "keywords": "disguise, social, intellect, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Keyboard",
          "id": "social-keyboard",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Playing pianos, synthesizers, organ consoles, and electronic keyboards.",
          "keywords": "keyboard, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Legerdemain",
          "id": "social-legerdemain",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Sleight of hand, pickpocketing, card tricks, and concealing small items.",
          "keywords": "legerdemain, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Oratory",
          "id": "social-oratory",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Public speaking, rhetoric, debate, and inspiring crowds.",
          "keywords": "oratory, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Percussion",
          "id": "social-percussion",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Playing drums, percussion instruments, and rhythm keeping.",
          "keywords": "percussion, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Singing",
          "id": "social-singing",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Vocal performance, pitch control, and melodic singing.",
          "keywords": "singing, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "String",
          "id": "social-string",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Playing acoustic or laser string instruments (guitars, violins, harps).",
          "keywords": "string, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Style",
          "id": "social-style",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Poise, fashion, personal presentation, and social elegance.",
          "keywords": "style, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Wind",
          "id": "social-wind",
          "group": "social",
          "baseAttr": "attr-stamina",
          "description": "Playing woodwind and brass musical instruments.",
          "keywords": "wind, social, stamina, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        }
      ]
    },
    {
      "title": "Manipulation",
      "skills": [
        {
          "name": "Barter",
          "id": "social-barter",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Haggling, negotiating prices, and trading goods.",
          "keywords": "barter, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Bluff",
          "id": "social-bluff",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Deception, lying convincingly, misdirection, and poker face.",
          "keywords": "bluff, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Diplomacy",
          "id": "social-diplomacy",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Persuasion, mediating disputes, conflict resolution, and finding common ground.",
          "keywords": "diplomacy, social, charisma, interaction, influence, persuasion",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Insight",
          "id": "social-insight",
          "group": "social",
          "baseAttr": "attr-wisdom",
          "description": "Reading body language, detecting lies, discerning motives, and empathy.",
          "keywords": "insight, social, wisdom, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Intimidate",
          "id": "social-intimidate",
          "group": "social",
          "baseAttr": "attr-strength",
          "description": "Coercion, physical threats, forceful presence, and psychological pressure.",
          "keywords": "intimidate, social, strength, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Leadership",
          "id": "social-leadership",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Commanding allies, inspiring morale, coordination, and maintaining unit order.",
          "keywords": "leadership, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        },
        {
          "name": "Streetwise",
          "id": "social-streetwise",
          "group": "social",
          "baseAttr": "attr-wisdom",
          "description": "Underworld contacts, black market knowledge, criminal slang, and alley savvy.",
          "keywords": "streetwise, social, wisdom, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate"
        }
      ]
    }
  ],
  "combat": [
    {
      "title": "Archaic",
      "skills": [
        {
          "name": "Defense",
          "id": "combat-defense",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "Parrying, blocking with shields, dodging strikes, and active combat evasion.",
          "keywords": "defense, combat, agility, tactical, offensive, parrying",
          "negative_keywords": "pacifist, unarmed-civilian, helpless"
        },
        {
          "name": "Melee",
          "id": "combat-melee",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "Swords, axes, knives, blunt weapons, and polearms in hand-to-hand combat.",
          "keywords": "melee, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless"
        },
        {
          "name": "Ranged",
          "id": "combat-ranged",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "Bows, crossbows, slings, and thrown weapons.",
          "keywords": "ranged, combat, agility, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless"
        },
        {
          "name": "Unarmed",
          "id": "combat-unarmed",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "Martial arts, brawling, grappling, kicks, and punches.",
          "keywords": "unarmed, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless"
        }
      ]
    },
    {
      "title": "Modern",
      "skills": [
        {
          "name": "Ballistic",
          "id": "combat-ballistic",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "Pistols, rifles, shotguns, and kinetic firearms.",
          "keywords": "ballistic, combat, agility, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless"
        },
        {
          "name": "Heavy Weapons",
          "id": "combat-heavy-weapons",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "Machine guns, rocket launchers, mortars, and vehicle-mounted cannons.",
          "keywords": "heavy weapons, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless"
        }
      ]
    },
    {
      "title": "Advanced",
      "skills": [
        {
          "name": "Energy",
          "id": "combat-energy",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "Laser pistols, plasma rifles, blasters, and directed energy weapons.",
          "keywords": "energy, combat, agility, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless"
        },
        {
          "name": "Heavy Energy",
          "id": "combat-heavy-energy",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "Particle cannons, heavy lasers, plasma bombards, and titan weaponry.",
          "keywords": "heavy energy, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless"
        }
      ]
    }
  ],
  "meta": [
    {
      "title": "General",
      "skills": [
        {
          "name": "Attune",
          "id": "meta-attune",
          "group": "meta",
          "baseAttr": "attr-wisdom",
          "description": "Channeling energy, sensing psionic/magical fields, and metaphysical resonance. Unlocked when character possesses any Awakened feature.",
          "keywords": "attune, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        }
      ]
    },
    {
      "title": "Dimension",
      "discipline": "Dimension",
      "skills": [
        {
          "name": "Summoning",
          "id": "meta-summoning",
          "group": "meta",
          "discipline": "Dimension",
          "baseAttr": "attr-wisdom",
          "description": "Dimension: Drawing entities, matter, and energetic constructs across dimensional boundaries.",
          "keywords": "summoning, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        },
        {
          "name": "Teleport",
          "id": "meta-teleport",
          "group": "meta",
          "discipline": "Dimension",
          "baseAttr": "attr-wisdom",
          "description": "Dimension: Instantaneous spatial relocation, portal anchors, and trans-dimensional folding.",
          "keywords": "teleport, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        }
      ]
    },
    {
      "title": "Energy",
      "discipline": "Energy",
      "skills": [
        {
          "name": "Elemental",
          "id": "meta-elemental",
          "group": "meta",
          "discipline": "Energy",
          "baseAttr": "attr-wisdom",
          "description": "Energy: Thermal, electrical, fire, frost, and plasma generation and channeling.",
          "keywords": "elemental, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        },
        {
          "name": "Force",
          "id": "meta-force",
          "group": "meta",
          "discipline": "Energy",
          "baseAttr": "attr-wisdom",
          "description": "Energy: Kinetic barriers, gravimetric pulses, concussive waves, and physical repulsors.",
          "keywords": "force, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        }
      ]
    },
    {
      "title": "Entropy",
      "discipline": "Entropy",
      "skills": [
        {
          "name": "Chaos",
          "id": "meta-chaos",
          "group": "meta",
          "discipline": "Entropy",
          "baseAttr": "attr-wisdom",
          "description": "Entropy: Accelerating decay, breaking molecular bonds, curses, and destructive negative energy.",
          "keywords": "chaos, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        },
        {
          "name": "Order",
          "id": "meta-order",
          "group": "meta",
          "discipline": "Entropy",
          "baseAttr": "attr-wisdom",
          "description": "Entropy: Probability stabilization, cellular regeneration, biological healing, and preservation.",
          "keywords": "order, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        }
      ]
    },
    {
      "title": "Illusion",
      "discipline": "Illusion",
      "skills": [
        {
          "name": "Phantasm",
          "id": "meta-phantasm",
          "group": "meta",
          "discipline": "Illusion",
          "baseAttr": "attr-wisdom",
          "description": "Illusion: Sensory phantasms, holographic weaves, auditory deception, and mirages.",
          "keywords": "phantasm, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        },
        {
          "name": "Shadow",
          "id": "meta-shadow",
          "group": "meta",
          "discipline": "Illusion",
          "baseAttr": "attr-wisdom",
          "description": "Illusion: Weaving darkness, shadow-stuff, optical refraction, and umbral constructs.",
          "keywords": "shadow, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        }
      ]
    },
    {
      "title": "Matter",
      "discipline": "Matter",
      "skills": [
        {
          "name": "Enhancement",
          "id": "meta-enhancement",
          "group": "meta",
          "discipline": "Matter",
          "baseAttr": "attr-wisdom",
          "description": "Matter: Strengthening material bonds, hardening objects, and physical reinforcement.",
          "keywords": "enhancement, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        },
        {
          "name": "Transmutation",
          "id": "meta-transmutation",
          "group": "meta",
          "discipline": "Matter",
          "baseAttr": "attr-wisdom",
          "description": "Matter: Reshaping physical matter, molecular conversion, and phase state changes.",
          "keywords": "transmutation, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        }
      ]
    },
    {
      "title": "Mental",
      "discipline": "Mental",
      "skills": [
        {
          "name": "Projection",
          "id": "meta-projection",
          "group": "meta",
          "discipline": "Mental",
          "baseAttr": "attr-wisdom",
          "description": "Mental: Psionic projections, telekinesis, telepathic speech, and cognitive thrusts.",
          "keywords": "projection, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        },
        {
          "name": "Sense",
          "id": "meta-sense",
          "group": "meta",
          "discipline": "Mental",
          "baseAttr": "attr-wisdom",
          "description": "Mental: Remote viewing, psionic detection, empathy, telepathic probing, and clairvoyance.",
          "keywords": "sense, meta, wisdom, metafocus, psionic, resonance",
          "negative_keywords": "mundane, anti-magic-field, unattuned"
        }
      ]
    }
  ]
};

/**
 * Canonical 6 Metaphysical Disciplines and their associated skills
 */
export const METAPHYSICAL_DISCIPLINES = [
  {
    id: 'dimension',
    name: 'Dimension',
    icon: '🌀',
    color: 'purple',
    skills: [
      { id: 'meta-summoning', name: 'Summoning', baseAttr: 'attr-wisdom', description: 'Drawing entities, matter, and energetic constructs across dimensional boundaries.' },
      { id: 'meta-teleport', name: 'Teleport', baseAttr: 'attr-wisdom', description: 'Instantaneous spatial relocation, portal anchors, and trans-dimensional folding.' }
    ],
    description: 'Spatial manipulation, teleportation, phasing, dimensional gates, and portal dynamics.'
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: '⚡',
    color: 'amber',
    skills: [
      { id: 'meta-elemental', name: 'Elemental', baseAttr: 'attr-wisdom', description: 'Thermal, electrical, fire, frost, and plasma generation and channeling.' },
      { id: 'meta-force', name: 'Force', baseAttr: 'attr-wisdom', description: 'Kinetic barriers, gravimetric pulses, concussive waves, and physical repulsors.' }
    ],
    description: 'Manipulating thermal, electromagnetic, kinetic, radiant, and pure kinetic force fields.'
  },
  {
    id: 'entropy',
    name: 'Entropy',
    icon: '⏳',
    color: 'rose',
    skills: [
      { id: 'meta-chaos', name: 'Chaos', baseAttr: 'attr-wisdom', description: 'Accelerating decay, breaking molecular bonds, curses, and destructive negative energy.' },
      { id: 'meta-order', name: 'Order', baseAttr: 'attr-wisdom', description: 'Probability stabilization, cellular regeneration, biological healing, and preservation.' }
    ],
    description: 'Governing probability, organic healing, cellular regeneration, life control, restoration, decay, and probability flux.'
  },
  {
    id: 'illusion',
    name: 'Illusion',
    icon: '🎭',
    color: 'cyan',
    skills: [
      { id: 'meta-phantasm', name: 'Phantasm', baseAttr: 'attr-wisdom', description: 'Sensory phantasms, holographic weaves, auditory deception, and mirages.' },
      { id: 'meta-shadow', name: 'Shadow', baseAttr: 'attr-wisdom', description: 'Weaving darkness, shadow-stuff, optical refraction, and umbral constructs.' }
    ],
    description: 'Sensory deception, mental phantasms, holographic weaves, and optical distortions.'
  },
  {
    id: 'matter',
    name: 'Matter',
    icon: '🧱',
    color: 'emerald',
    skills: [
      { id: 'meta-enhancement', name: 'Enhancement', baseAttr: 'attr-wisdom', description: 'Strengthening material bonds, hardening objects, and physical reinforcement.' },
      { id: 'meta-transmutation', name: 'Transmutation', baseAttr: 'attr-wisdom', description: 'Reshaping physical matter, molecular conversion, and phase state changes.' }
    ],
    description: 'Molecular alteration, density shifting, material reinforcement, and matter transmutation.'
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: '🧠',
    color: 'blue',
    skills: [
      { id: 'meta-projection', name: 'Projection', baseAttr: 'attr-wisdom', description: 'Psionic projections, telekinesis, telepathic speech, and cognitive thrusts.' },
      { id: 'meta-sense', name: 'Sense', baseAttr: 'attr-wisdom', description: 'Remote viewing, psionic detection, empathy, telepathic probing, and clairvoyance.' }
    ],
    description: 'Telepathy, psionic force, neural influence, clairvoyance, and cognitive attunement.'
  }
];

/**
 * Flattened array of all canonical skills for relational selectors and dropdowns
 */
export const ALL_CANONICAL_SKILLS = Object.entries(DEFAULT_SKILLS).flatMap(([groupKey, groupSections]) =>
  groupSections.flatMap(section =>
    section.skills.map(skill => {
      const groupTitle = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
      const subTitle = section.title ? ` · ${section.title}` : '';
      return {
        ...skill,
        group: groupKey,
        subcategory: section.title || 'General',
        categoryLabel: `${groupTitle}${section.title ? ' - ' + section.title : ''}`,
        type: `${groupTitle}${subTitle}`
      };
    })
  )
);

/**
 * Grouped category sections with display headers and icons for optgroups and categorized lists
 */
export const SKILL_CATEGORY_SECTIONS = [
  {
    key: 'physical',
    label: '🏃 Physical Skills',
    group: 'physical',
    skills: DEFAULT_SKILLS.physical[0].skills
  },
  {
    key: 'mental_general',
    label: '🧠 Mental Skills - General',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[0].skills
  },
  {
    key: 'mental_knowledges',
    label: '🧠 Mental Skills - Knowledges',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[1].skills
  },
  {
    key: 'mental_vocations',
    label: '🧠 Mental Skills - Vocations',
    group: 'mental',
    skills: DEFAULT_SKILLS.mental[2].skills
  },
  {
    key: 'social_expression',
    label: '💬 Social Skills - Expression',
    group: 'social',
    skills: DEFAULT_SKILLS.social[0].skills
  },
  {
    key: 'social_manipulation',
    label: '💬 Social Skills - Manipulation',
    group: 'social',
    skills: DEFAULT_SKILLS.social[1].skills
  },
  {
    key: 'combat_archaic',
    label: '⚔️ Combat Skills - Archaic',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[0].skills
  },
  {
    key: 'combat_modern',
    label: '⚔️ Combat Skills - Modern',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[1].skills
  },
  {
    key: 'combat_advanced',
    label: '⚔️ Combat Skills - Advanced',
    group: 'combat',
    skills: DEFAULT_SKILLS.combat[2].skills
  },
  {
    key: 'meta_general',
    label: '🔮 Metafocus Skills - General',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[0].skills
  },
  {
    key: 'meta_dimension',
    label: '🌀 Metafocus Skills - Dimension',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[1].skills
  },
  {
    key: 'meta_energy',
    label: '⚡ Metafocus Skills - Energy',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[2].skills
  },
  {
    key: 'meta_entropy',
    label: '⏳ Metafocus Skills - Entropy',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[3].skills
  },
  {
    key: 'meta_illusion',
    label: '🎭 Metafocus Skills - Illusion',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[4].skills
  },
  {
    key: 'meta_matter',
    label: '🧱 Metafocus Skills - Matter',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[5].skills
  },
  {
    key: 'meta_mental',
    label: '🧠 Metafocus Skills - Mental',
    group: 'meta',
    skills: DEFAULT_SKILLS.meta[6].skills
  }
];
