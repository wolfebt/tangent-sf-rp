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
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "specialties": [
          "Tumbling",
          "Tightrope & Ledge Balancing",
          "Parkour & Free-Running",
          "Breakfalling",
          "Zero-G Maneuvering",
          "Escapology",
          "Wall-Running",
          "Aerial Trapeze & Swing",
          "Dive & Roll",
          "Kip-Up & Rapid Recovery"
          ]
        },
        {
          "name": "Athletics",
          "id": "physical-athletics",
          "group": "physical",
          "baseAttr": "attr-strength",
          "description": "Running, jumping, swimming, lifting, and general physical prowess.",
          "keywords": "athletics, physical, strength, mobility, bodily-coordination, running",
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "specialties": [
          "Sprinting",
          "Endurance Running",
          "Vertical & Long Jumping",
          "Rock & Hull Climbing",
          "Swimming & Diving",
          "Powerlifting & Hauling",
          "Forceful Throwing",
          "Grapple Wrestling",
          "High-G Conditioning",
          "Breaching & Forcing"
          ]
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
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "specialties": [
          "Wheeled & Tracked Vehicles",
          "Hovercraft & Grav-Speeders",
          "Atmospheric Aircraft",
          "Sub-Orbital Shuttles",
          "Starfighters & Dogfighting",
          "Capital Ships & Freighters",
          "Mecha & Walkers",
          "Watercraft & Submersibles",
          "EVA Thruster Packs",
          "Combat Stunts & Evasion"
          ]
        },
        {
          "name": "Stealth",
          "id": "physical-stealth",
          "group": "physical",
          "baseAttr": "attr-agility",
          "description": "Moving silently, remaining undetected, and evading detection systems.",
          "keywords": "stealth, physical, agility, mobility, athletics, bodily-coordination",
          "negative_keywords": "sedentary, paralyzed, clumsy",
          "specialties": [
          "Silent Movement",
          "Camouflage & Concealment",
          "Urban Infiltration",
          "Wilderness Stalking",
          "Sensor Evasion",
          "Tailing & Shadowing",
          "Crowd Blending",
          "Vibration & Scent Masking",
          "Quick-Cover Snapping",
          "Infiltration Rigging"
          ]
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
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Visual Spotting",
          "Auditory Listening",
          "Ambush Detection",
          "Concealed Object Search",
          "Scent & Pheromone Recognition",
          "Sensor Feed Monitoring",
          "Danger Sense & Intuition",
          "Counter-Surveillance Awareness",
          "Micro-Detail Inspection",
          "Motion Tracking"
          ]
        },
        {
          "name": "Academics",
          "id": "mental-academics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "General higher education, scholarly research, and formal knowledge.",
          "keywords": "academics, mental, intellect, cognitive, expertise, higher",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Research Methodology",
          "Critical Epistemology",
          "Data Synthesis",
          "Scholarly Archiving",
          "Pedagogy & Instruction",
          "Technical Writing",
          "Abstract Logic",
          "Linguistic Philology",
          "Comparative Sociology",
          "Scholastic Peer Review"
          ]
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
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Antiquities & Relics",
          "Gems & Exotic Minerals",
          "High-Tech Hardware",
          "Xenotech Artifacts",
          "Fine Art & Holography",
          "Weapons & Armor Valuation",
          "Counterfeit & Forgery Detection",
          "Raw Industrial Commodities",
          "Metaphysical Artifacts",
          "Salvage Bulk Valuation"
          ]
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
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Corporate Law & Governance",
          "Market Trend Analysis",
          "Investment & Portfolio Management",
          "Mergers & Acquisitions",
          "Venture Capitalism",
          "Fiscal Auditing",
          "Contract Architecture",
          "Marketing & Public Relations",
          "Risk Management",
          "Corporate Shell Networks"
          ]
        },
        {
          "name": "Computers",
          "id": "mental-computers",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Hacking, programming, software engineering, and computer system security.",
          "keywords": "computers, mental, intellect, cognitive, expertise, hacking",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Network Intrusion (Hacking)",
          "Cyber-Defense & Hardening",
          "Scripting & Process Automation",
          "AI Architecture & Training",
          "Data Mining & Parsing",
          "Firmware & Low-Level Code",
          "Cryptographic Decryption",
          "Neural Interface Protocols",
          "Distributed Cloud Systems",
          "Counter-Forensic Scrubbing"
          ]
        },
        {
          "name": "Culture",
          "id": "mental-culture",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Customs, languages, etiquette, and social structures of diverse species and worlds.",
          "keywords": "culture, mental, intellect, cognitive, expertise, customs",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Impyrium High Society",
          "Dynasty Lineages",
          "Underworld Subcultures",
          "Alien Xenology (Auluran/Kizin/Dwerg)",
          "Frontier & Nomad Customs",
          "Corporate Megacorp Culture",
          "Planetary Folkways",
          "Diplomatic Hospitality Protocols",
          "Taboos & Insults",
          "Galactic Pop Trends"
          ]
        },
        {
          "name": "History",
          "id": "mental-history",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Historical records, past civilizations, conflicts, and galactic chronology.",
          "keywords": "history, mental, intellect, cognitive, expertise, historical",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Ancient Civilizations",
          "Galactic Wars & Campaigns",
          "Planetary Colonization",
          "Technological Evolution",
          "Political Revolutions",
          "House & Dynasty Lineages",
          "Archaeological Context",
          "Religious Schisms",
          "Pre-Void Collapse Lore",
          "Economic Booms & Panics"
          ]
        },
        {
          "name": "Investigation",
          "id": "mental-investigation",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Forensics, searching for clues, deducting motives, and solving mysteries.",
          "keywords": "investigation, mental, intellect, cognitive, expertise, forensics",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Crime Scene Reconstruction",
          "Forensic Ballistics & Trauma",
          "Digital Profiling & Tracing",
          "Evidence Preservation",
          "Interrogation Deduction",
          "Financial Paper Trails",
          "Physical Pattern Tracking",
          "Cryptanalysis",
          "Surveillance Audio/Video Analysis",
          "Cold Case Deduction"
          ]
        },
        {
          "name": "Language",
          "id": "mental-language",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Linguistics, deciphering scripts, and fluency in alien dialects.",
          "keywords": "language, mental, intellect, cognitive, expertise, linguistics",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Trade Common Fluency",
          "Draconic Dialects",
          "Premian Tongue",
          "Tech-Jargon & Machine Cant",
          "Ancient & Dead Scripts",
          "Fae & Metamystic Dialects",
          "Imperial High Tongue",
          "Tactical Sign Language",
          "Xeno-Linguistic Decryption",
          "Lip Reading"
          ]
        },
        {
          "name": "Logistics",
          "id": "mental-logistics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Supply chains, resource distribution, transit scheduling, and fleet support.",
          "keywords": "logistics, mental, intellect, cognitive, expertise, supply",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Interstellar Supply Chains",
          "Fleet Fuel & Resource Management",
          "Warehouse & Depot Operations",
          "Wartime Requisitioning",
          "Hazardous Cargo Transport",
          "Just-In-Time Distribution",
          "Cargo Manifest Auditing",
          "Emergency Relief Staging",
          "Multi-Modal Route Optimization",
          "Disassembly & Staging"
          ]
        },
        {
          "name": "Medicine",
          "id": "mental-medicine",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "First aid, surgery, pharmacology, pathology, and trauma treatment.",
          "keywords": "medicine, mental, intellect, cognitive, expertise, first",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Combat Trauma & Triage",
          "Field Surgery",
          "Xenobiology Treatment",
          "Pharmacology & Toxicology",
          "Cybernetic Implantation",
          "Infectious Diseases & Pathology",
          "Intensive Care Life-Support",
          "Gene Therapy",
          "Psychiatry & Neural Trauma",
          "Forensic Autopsy"
          ]
        },
        {
          "name": "Metaphysics",
          "id": "mental-metaphysics",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Understanding the nature of psionic energy, the Void, and supernatural phenomena.",
          "keywords": "metaphysics, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Planar Mechanics",
          "Cosmological Anomaly Analysis",
          "Psionic Field Theory",
          "Magitech Integration Theory",
          "Reality Anchoring",
          "Entropy & Void Dynamics",
          "Ley Line & Node Cartography",
          "Temporal Disruption Theory",
          "Aura Diagnostics",
          "Metascience Epistemology"
          ]
        },
        {
          "name": "Nature",
          "id": "mental-nature",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Fauna, flora, ecosystems, ecology, and natural sciences.",
          "keywords": "nature, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Alien Botany",
          "Zoology & Beast Behavior",
          "Geology & Speleology",
          "Meteorology & Weather Forecasting",
          "Marine & Aquatic Ecology",
          "Toxicology Sourcing",
          "Biome Tracking",
          "Ecosystem Modeling",
          "Spelunking & Underground Survival",
          "Micro-Ecology & Spores"
          ]
        },
        {
          "name": "Navigation",
          "id": "mental-navigation",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Astrogation, hyperspace charting, compass reading, and planetary orienteering.",
          "keywords": "navigation, mental, intellect, cognitive, expertise, astrogation",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Astrogation & FTL Calculations",
          "Planetary Orienteering",
          "Cartography & Mapmaking",
          "Dead Reckoning",
          "Subterranean Navigation",
          "Drift & Anomaly Routing",
          "Orbital Mechanics",
          "Nautical & Marine Navigation",
          "Sensor-Blind Navigation",
          "Waystation & Gate Wayfinding"
          ]
        },
        {
          "name": "Nobility",
          "id": "mental-nobility",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Heraldry, aristocratic hierarchies, courtly intrigue, and high-society protocols.",
          "keywords": "nobility, mental, intellect, cognitive, expertise, heraldry",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Imperial Dynasties",
          "Heraldry & Insignia",
          "Aristocratic Etiquette",
          "Feudal Law & Land Rights",
          "Court Intrigue & Factionalism",
          "Chivalric Orders",
          "Diplomatic Immunity Protocols",
          "Precedence Arbitration",
          "Royal Matchmaking",
          "Private Royal Treasuries"
          ]
        },
        {
          "name": "Physics",
          "id": "mental-physics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Astrophysics, quantum mechanics, gravimetrics, and energy thermodynamics.",
          "keywords": "physics, mental, intellect, cognitive, expertise, astrophysics",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Astrophysics",
          "Quantum Mechanics",
          "Relativistic Mechanics",
          "Plasma & High-Energy Dynamics",
          "Gravitational Field Physics",
          "Ballistics Trajectory",
          "Fluid Dynamics",
          "Thermodynamics",
          "Subatomic Particle Acceleration",
          "Dimensional Warp Mechanics"
          ]
        },
        {
          "name": "Religion",
          "id": "mental-religion",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Theology, cult rituals, religious dogmas, sacred texts, and mythical traditions.",
          "keywords": "religion, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Pantheons & Cosmic Deities",
          "Sectarian Cults & Heresies",
          "Liturgical Rites & Rituals",
          "Scriptural Hermeneutics",
          "Funerary Rites & Afterlife Lore",
          "Sacred Symbolism",
          "Ascendant & Precursor Worship",
          "Prophetic Traditions",
          "Ecclesiastical Law",
          "Exorcism & Cleansing"
          ]
        },
        {
          "name": "Science",
          "id": "mental-science",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "General scientific method, chemistry, biology, geology, and laboratory experimentation.",
          "keywords": "science, mental, intellect, cognitive, expertise, scientific",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Inorganic Chemistry",
          "Biochemistry",
          "Genetics & Cloning",
          "Material Science & Metallurgy",
          "Nanotechnology",
          "Laboratory Procedure",
          "Atmospheric Chemistry",
          "Radiological Science",
          "Synthetic Biology",
          "Applied Spectroscopy"
          ]
        },
        {
          "name": "Survival",
          "id": "mental-survival",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Foraging, tracking, building shelters, firecraft, and wilderness survival.",
          "keywords": "survival, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Foraging",
          "Water Procurement",
          "Extreme Cold (Arctic)",
          "Arid Wasteland (Desert)",
          "Jungle & Marshland",
          "Emergency Shelter Construction",
          "Zero-G & Vacuum Survival",
          "Subterranean Survival",
          "Fire-Building",
          "Wilderness Traps & Snares"
          ]
        },
        {
          "name": "Tactics",
          "id": "mental-tactics",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Squad tactics, battle maneuvers, defensive positioning, and combat strategy.",
          "keywords": "tactics, mental, intellect, cognitive, expertise, squad",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Close-Quarters Battle (CQB)",
          "Squad Fireteam Maneuvers",
          "Guerrilla & Asymmetric Warfare",
          "Ship-to-Ship Fleet Tactics",
          "Siegecraft & Fortifications",
          "Boarding Actions",
          "Ambush Planning",
          "Sniper/Spotter Protocols",
          "Electronic Warfare Coordination",
          "Counter-Battery Warfare"
          ]
        },
        {
          "name": "Technology",
          "id": "mental-technology",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Hardware maintenance, mechanical systems, cybernetics, and electronics.",
          "keywords": "technology, mental, intellect, cognitive, expertise, hardware",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Archaic Technology",
          "Advanced Directed Energy Systems",
          "Xenotechnology Diagnostics",
          "Robotics & Automata",
          "Weapons Technology",
          "Starship Subsystems",
          "Sensor & Scanner Systems",
          "Power Generators & Fuel Cells",
          "Security Hardware",
          "Emergency Field-Stripping"
          ]
        },
        {
          "name": "Trade",
          "id": "mental-trade",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Merchant lanes, interstellar tariffs, bargaining, and contraband smuggling.",
          "keywords": "trade, mental, intellect, cognitive, expertise, merchant",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Commodity Arbitrage",
          "Tariff & Customs Evasion",
          "Black Market Smuggling Networks",
          "Bulk Wholesale Brokering",
          "Planetary Export Licensing",
          "Supply Shortage Exploitation",
          "Currency & Credit Speculation",
          "Merchant Marine Regulations",
          "Consignment Sales",
          "Counter-Embargo Smuggling"
          ]
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
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Civil Bureaucracy",
          "Colony Management",
          "Corporate Personnel Management",
          "Budgetary Auditing",
          "Military Staff Coordination",
          "Public Regulatory Compliance",
          "Crisis Management Protocols",
          "Records Governance",
          "Contract Administration",
          "Inter-Department Mediation"
          ]
        },
        {
          "name": "Alchemist",
          "id": "mental-alchemist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Creating potions, elixirs, chemical compounds, and reactive reagents.",
          "keywords": "alchemist, mental, intellect, cognitive, expertise, creating",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Combat Stimulants",
          "Panaceas & Antitoxins",
          "Corrosive Acids & Caustics",
          "Incendiary Gels",
          "Metaphysical Potions",
          "Paralytics & Sleeping Agents",
          "Biological Preservatives",
          "Smoke & Gas Compounds",
          "Reagent Purification",
          "Volatile Reactions Handling"
          ]
        },
        {
          "name": "Ambassador",
          "id": "mental-ambassador",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Diplomatic negotiations, envoy missions, and high-level treaties.",
          "keywords": "ambassador, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "First Contact Protocols",
          "Bilateral Treaty Negotiation",
          "Extradition & Prisoner Exchanges",
          "Trade Coalition Representation",
          "Hostage & Ceasefire Mediation",
          "Diplomatic Immunity Defense",
          "Cultural Liaison",
          "Imperial Court Protocol",
          "Sanction & Embargo Negotiation",
          "Alliance Building"
          ]
        },
        {
          "name": "Architect",
          "id": "mental-architect",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Designing buildings, habitat domes, fortresses, and civil engineering.",
          "keywords": "architect, mental, intellect, cognitive, expertise, designing",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Arcology Design",
          "Starship Naval Architecture",
          "Bunkers & Fortifications",
          "Orbital Station Design",
          "Hostile-Environment Habitats",
          "Acoustic & Sightline Layouts",
          "Structural Weakness Assessment",
          "Modular Prefab Structures",
          "Urban Transit Design",
          "Historic Restoration Architecture"
          ]
        },
        {
          "name": "Archivist",
          "id": "mental-archivist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Cataloging data archives, library indexes, and preserving ancient artifacts.",
          "keywords": "archivist, mental, intellect, cognitive, expertise, cataloging",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Ancient Tome Preservation",
          "Data Recovery & File Reconstruction",
          "Genealogical Indexing",
          "Classified Document Redaction",
          "Library Taxonomy & Systems",
          "Holographic & Optical Media Care",
          "Museum Conservation",
          "Ancient Script Transliteration",
          "Historical Provenance Authentication",
          "Deep Index Searching"
          ]
        },
        {
          "name": "Armorer",
          "id": "mental-armorer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Fabricating, fitting, reinforcing, and repairing body armor and shields.",
          "keywords": "armorer, mental, intellect, cognitive, expertise, fabricating",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Archaic Plate & Mail",
          "Ballistic Weaves & Flak Suits",
          "Composite Ceramic Plating",
          "Powered Armor Exoskeletons",
          "Energy Shield Harnesses",
          "Hazardous Environment Seals",
          "Xenotech Shell Integration",
          "Stealth Coating Application",
          "Custom Armor Tailoring",
          "Rapid Battle-Damage Patching"
          ]
        },
        {
          "name": "Artist",
          "id": "mental-artist",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Visual arts, sculpting, painting, holography, and aesthetic design.",
          "keywords": "artist, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Canvas & Mural Painting",
          "Digital & Concept Illustration",
          "Hard-Light & Holographic Art",
          "Stone & Metal Sculpting",
          "Tattooing & Bio-Art",
          "Prop & Stage Design",
          "Artistic Forgery",
          "Graphic Iconography & Logos",
          "Calligraphy & Illumination",
          "Ceramics & Glasswork"
          ]
        },
        {
          "name": "Artificer",
          "id": "mental-artificer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Crafting technological wonders, specialized gadgets, and prototypes.",
          "keywords": "artificer, mental, intellect, cognitive, expertise, crafting",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Focusing Crystals",
          "Psionic Amplifiers",
          "Metaphysical Weapon Imbuement",
          "Magitech Circuitry",
          "Golem & Construct Forging",
          "Talisman & Amulet Crafting",
          "Dimensional Containers",
          "Wands & Focusing Rods",
          "Etheric Batteries",
          "Artifact Diagnostics"
          ]
        },
        {
          "name": "Broker",
          "id": "mental-broker",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Information dealing, resource arbitrage, and middleman transactions.",
          "keywords": "broker, mental, intellect, cognitive, expertise, information",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Black Market Contraband",
          "Securities & Equities",
          "Starship Sales & Transfers",
          "Mercenary Contracts",
          "Real Estate & Land Rights",
          "Military Arms Brokering",
          "Mining Claims & Concessions",
          "Information & Secrets Trading",
          "Intellectual Property Licensing",
          "High-Value Luxury Commodities"
          ]
        },
        {
          "name": "Celebrity",
          "id": "mental-celebrity",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Media presence, public relations, fan interaction, and reputation handling.",
          "keywords": "celebrity, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Holonet Streaming & Broadcast",
          "Public Relations Spin",
          "Brand Endorsements",
          "Red Carpet & Gala Presence",
          "Fanbase Mobilization",
          "Paparazzi Evasion",
          "Persona Fabrication",
          "Talk Show Charm",
          "Charity Gala Organizing",
          "VIP Access & Entourage Control"
          ]
        },
        {
          "name": "Constable",
          "id": "mental-constable",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Law enforcement protocols, suspect detention, and security policing.",
          "keywords": "constable, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Patrol Procedures",
          "Riot & Crowd Control",
          "Suspect Apprehension",
          "Evidence Chain of Custody",
          "Tactical Breaching",
          "Interrogation & Field Questioning",
          "Jurisdictional Sector Law",
          "Traffic & Checkpoint Control",
          "Hostage Crisis First-Response",
          "Undercover Vice Operations"
          ]
        },
        {
          "name": "Courtesan",
          "id": "mental-courtesan",
          "group": "mental",
          "baseAttr": "attr-charisma",
          "description": "Social entertainment, high-class companionship, and subtle gathering of secrets.",
          "keywords": "courtesan, mental, charisma, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "High-Society Etiquette",
          "Pillow Talk & Eavesdropping",
          "Art of Witty Conversation",
          "Sensual Seduction",
          "Discreet Companionship",
          "Flattery & Ego Stroking",
          "Poise & Posture Mastery",
          "Social Shielding",
          "Subtle Intoxication Management",
          "Patron Psychology"
          ]
        },
        {
          "name": "Culinarian",
          "id": "mental-culinarian",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Gastronomy, alien cuisine preparation, brewing, and nutrition.",
          "keywords": "culinarian, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Xenofood Neutralization",
          "Haute Cuisine & Fine Dining",
          "Field Ration Optimization",
          "Baking & Pastry Arts",
          "Brewing, Fermenting & Distilling",
          "Food Preservation & Curing",
          "Butchery & Dressing",
          "Flavor Balancing & Spicing",
          "Toxin & Poison Tasting",
          "Banquet & Mass Catering"
          ]
        },
        {
          "name": "Demolitionist",
          "id": "mental-demolitionist",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Explosives handling, bomb defusal, breaching, and controlled blasting.",
          "keywords": "demolitionist, mental, intellect, cognitive, expertise, explosives",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Structural Controlled Implosion",
          "Combat Breaching Charges",
          "EOD Bomb Defusal",
          "Commercial Mining Blasting",
          "Shaped-Charge Armor Penetration",
          "Improvised Explosive Devices (IEDs)",
          "Remote & Timed Detonators",
          "Underwater & Vacuum Demolitions",
          "Blast Mitigation & Containment",
          "Munitions Disposal"
          ]
        },
        {
          "name": "Electrician",
          "id": "mental-electrician",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Power grid wiring, circuitry, conduits, and electronic repair.",
          "keywords": "electrician, mental, intellect, cognitive, expertise, power",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "High-Voltage Distribution",
          "Micro-Electronics & PCBs",
          "Ship Power Bus Routing",
          "Backup Generators & Uninterruptible Power",
          "Circuit Breakers & Fuses",
          "Cyberware Interface Wiring",
          "Lock Relay Bypassing",
          "EMP Hardening",
          "Fiber-Optic & Data Cabling",
          "Solar & Renewable Arrays"
          ]
        },
        {
          "name": "Engineer",
          "id": "mental-engineer",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Heavy machinery, engine mechanics, reactor maintenance, and starship drives.",
          "keywords": "engineer, mental, intellect, cognitive, expertise, heavy",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Starship FTL Propulsion",
          "Sublight Thruster Assemblies",
          "Life Support Systems",
          "Civil Infrastructure",
          "Hydraulics & Pneumatics",
          "Thermal Dissipation Systems",
          "Industrial Automation & Assembly",
          "Structural Stress Diagnostics",
          "Power Plant Core Management",
          "Heavy Crane & Rigging Mechanics"
          ]
        },
        {
          "name": "Farmer",
          "id": "mental-farmer",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Agriculture, hydroponics, crop cultivation, and harvesting.",
          "keywords": "farmer, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Hydroponics & Aeroponics",
          "Broad-Acre Grain Farming",
          "Livestock Husbandry",
          "Soil Chemistry & Fertilization",
          "Agricultural Pest & Fungus Control",
          "Irrigation & Water Rights",
          "Alien Crop Domestication",
          "Greenhouse Environmental Control",
          "Veterinary Care",
          "Harvest Preservation & Silos"
          ]
        },
        {
          "name": "Groundskeeper",
          "id": "mental-groundskeeper",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Estate maintenance, terrain upkeep, and environmental management.",
          "keywords": "groundskeeper, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Landscape Gardening",
          "Arboriculture & Tree Surgery",
          "Estate Hardscaping",
          "Turf & Heavy Lawn Machinery",
          "Invasive Flora Eradication",
          "Drainage & Erosion Control",
          "Greenhouse Maintenance",
          "Park & Plaza Sanitation",
          "Soil & Mulch Composting",
          "Planetary Terraforming Planting"
          ]
        },
        {
          "name": "Handler",
          "id": "mental-handler",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Animal husbandry, beast training, mounts, and xenofauna handling.",
          "keywords": "handler, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Riding Mount Training",
          "Combat Attack Training",
          "Beast Calming & De-Escalation",
          "Scent & Tracking Hounds",
          "Working Draft Animals",
          "Exotic Alien Pet Taming",
          "Avian & Flying Mount Handling",
          "Livestock Herding",
          "Behavioral Obedience",
          "Zoological Caging & Transport"
          ]
        },
        {
          "name": "Laborer",
          "id": "mental-laborer",
          "group": "mental",
          "baseAttr": "attr-strength",
          "description": "Manual labor, construction, cargo hauling, and industrial tasks.",
          "keywords": "laborer, mental, strength, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Dockworking & Stevedoring",
          "Deep Shaft Mining",
          "Heavy Demolition Work",
          "Concrete & Composite Pouring",
          "Scaffolding Erection",
          "Manual Trenching & Shoveling",
          "Power Loader & Exosuit Labor",
          "Hazardous Waste Mucking",
          "High-G/Zero-G Physical Toil",
          "Industrial Site Rigging"
          ]
        },
        {
          "name": "Mechanic",
          "id": "mental-mechanic",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Vehicle diagnostics, engine overhaul, and mechanical repair.",
          "keywords": "mechanic, mental, intellect, cognitive, expertise, vehicle",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Internal Combustion Engines",
          "Turbines & Jet Propulsion",
          "Drive Train & Transmission",
          "Pneumatic & Hydraulic Actuators",
          "Suspension & Steering Systems",
          "Chassis & Body Fabrication",
          "Cooling & Radiator Systems",
          "Jury-Rigged Field Repairs",
          "Machine Shop Lathe Tooling",
          "Heavy Construction Equipment"
          ]
        },
        {
          "name": "Researcher",
          "id": "mental-researcher",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Academic studies, data synthesis, hypothesis testing, and laboratory work.",
          "keywords": "researcher, mental, intellect, cognitive, expertise, academic",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Experimental Design",
          "Empirical Data Modeling",
          "Field Specimen Collection",
          "Literature Review & Meta-Analysis",
          "Hypothesis Testing",
          "Statistical Error Auditing",
          "AI Model Validation",
          "Laboratory Safety Management",
          "Grant Proposal Drafting",
          "Peer-Reviewed Publishing"
          ]
        },
        {
          "name": "Salvager",
          "id": "mental-salvager",
          "group": "mental",
          "baseAttr": "attr-wisdom",
          "description": "Scrapping wrecks, identifying valuable components, and recycling materials.",
          "keywords": "salvager, mental, wisdom, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Deep Space Derelict Cutting",
          "Structural Stabilization",
          "Hazardous Reactor Extraction",
          "Component De-Installation",
          "Scrap Metal Grading",
          "Underwater Wreck Salvage",
          "Urban Ruin Scavenging",
          "Rigging & Cargo Extraction",
          "Booby-Trap & Hazard Spotting",
          "Black-Market Salvage Washing"
          ]
        },
        {
          "name": "Soldier",
          "id": "mental-soldier",
          "group": "mental",
          "baseAttr": "attr-stamina",
          "description": "Military protocol, battlefield discipline, marching, and unit drill.",
          "keywords": "soldier, mental, stamina, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Field Gear Maintenance",
          "Military Regulations & Law",
          "Drill & Formation Marching",
          "Entrenchment & Sandbagging",
          "Guard Duty & Perimeter Security",
          "Field Bivouac Setup",
          "Combat Communications Protocol",
          "Unit Cohesion & Morale",
          "Escort Formations",
          "Bayonet & Close-Quarters Drill"
          ]
        },
        {
          "name": "Tailor",
          "id": "mental-tailor",
          "group": "mental",
          "baseAttr": "attr-agility",
          "description": "Fabric crafting, custom tailoring, protective weave stitching, and fashion.",
          "keywords": "tailor, mental, agility, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "High-Society Couture",
          "Ballistic Fabric Weaving",
          "Uniform Tailoring",
          "Pattern Drafting & Cutting",
          "Concealed-Carry Alteration",
          "Space Suit Sealing & Repair",
          "Leather & Beast-Hide Working",
          "Quick-Change Garment Design",
          "Embroidery & Insignia Handiwork",
          "Garment Mending & Alterations"
          ]
        },
        {
          "name": "Transporter",
          "id": "mental-transporter",
          "group": "mental",
          "baseAttr": "attr-agility",
          "description": "Freight delivery, cargo transit, navigation under pressure, and escort driving.",
          "keywords": "transporter, mental, agility, intellect, cognitive, expertise",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Long-Haul Space Trucking",
          "Armored Cash Transit",
          "Secret Compartment Rigging",
          "Cargo Weight Distribution",
          "VIP Chauffeur Services",
          "Atmospheric Sky-Bus Transit",
          "Hazardous Cargo Hauling",
          "Intermodal Freight Transfer",
          "Smuggling Blockade Runs",
          "Cold-Chain Courier Delivery"
          ]
        },
        {
          "name": "Weaponsmith",
          "id": "mental-weaponsmith",
          "group": "mental",
          "baseAttr": "attr-intellect",
          "description": "Forging, calibrating, modding, and maintaining ranged and melee weaponry.",
          "keywords": "weaponsmith, mental, intellect, cognitive, expertise, forging",
          "negative_keywords": "mindless, instinct-only, illiterate",
          "specialties": [
          "Bladed Weapon Forging",
          "Ballistic Firearm Gunsmithing",
          "Energy Weapon Optics & Lasers",
          "Heavy Weapon Servicing",
          "Accurizing & Scope Fitting",
          "Ammunition Reloading & Swaging",
          "Weapon Modifications",
          "Vibro & High-Frequency Blades",
          "Field Cleaning & Unjamming",
          "Exotic Material Tempering"
          ]
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
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Voice & Accent Mimicry",
          "Improvisational Roleplay",
          "Method Immersion",
          "Stage & Holo-Screen Acting",
          "Feigning Injury & Death",
          "Physical Mannerism Masking",
          "Theatrical Stage Combat",
          "Dramatic Monologuing",
          "Musical Theatre",
          "Comedic Timing"
          ]
        },
        {
          "name": "Comedy",
          "id": "social-comedy",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Humor, wit, comedic timing, and tension relief.",
          "keywords": "comedy, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Stand-Up Routines",
          "Combat Taunts & Jeering",
          "Political Satire & Parody",
          "Hostility Defusal Through Humor",
          "Roasting & Heckler Put-Downs",
          "Slapstick & Physical Humor",
          "Dark & Gallows Humor",
          "Deadpan Irony",
          "Impressionist Parody",
          "Crowd Banter & Crowd-Work"
          ]
        },
        {
          "name": "Dancing",
          "id": "social-dancing",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Choreography, social dancing, and rhythmic physical grace.",
          "keywords": "dancing, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Ballroom & Court Waltz",
          "Club & Rave Freestyle",
          "Zero-G Aerial Dance",
          "Classical Ballet",
          "Folk & Cultural Dances",
          "Sensual & Seductive Dance",
          "Martial Katas & War Dances",
          "Breakdancing & Urban Acrobatics",
          "Choreographed Group Pop",
          "Tap & Percussive Footwork"
          ]
        },
        {
          "name": "Disguise",
          "id": "social-disguise",
          "group": "social",
          "baseAttr": "attr-intellect",
          "description": "Costuming, prosthetic makeup, and impersonation.",
          "keywords": "disguise, social, intellect, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Prosthetic & Latex Application",
          "Cosmetic Makeup & Contouring",
          "Specific Individual Cloning",
          "Cross-Species Camouflage",
          "Quick-Change Techniques",
          "Aging & De-Aging Effects",
          "Body Shape Padding",
          "Cyberware Concealment",
          "Camouflage Makeup",
          "Holographic Disguise Tuning"
          ]
        },
        {
          "name": "Keyboard",
          "id": "social-keyboard",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Playing pianos, synthesizers, organ consoles, and electronic keyboards.",
          "keywords": "keyboard, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Acoustic Grand Piano",
          "Pipe & Cathedral Organ",
          "Electronic Synthesizer Workstations",
          "Holographic Light-Keys",
          "Keytar & Stage Performance",
          "Harpsichord & Early Instruments",
          "Haptic Touch-Pads",
          "Accordion & Squeeze-Box",
          "Ambient Soundscape Design",
          "Microtonal Synthesizers"
          ]
        },
        {
          "name": "Legerdemain",
          "id": "social-legerdemain",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Sleight of hand, pickpocketing, card tricks, and concealing small items.",
          "keywords": "legerdemain, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Pickpocketing",
          "Palming & Small Item Concealment",
          "Card & Coin Manipulation",
          "Stage Illusions & Escapology",
          "Quick-Draw Palming",
          "Item Swapping",
          "Shell Game & Three-Card Monte",
          "Wax Impression Key Duplication",
          "Distraction Flairs",
          "Planting Evidence"
          ]
        },
        {
          "name": "Oratory",
          "id": "social-oratory",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Public speaking, rhetoric, debate, and inspiring crowds.",
          "keywords": "oratory, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Political Rally Speeches",
          "Military Pre-Battle Speeches",
          "Religious Sermons & Preaching",
          "Courtroom Advocacy",
          "Eulogies & Funerary Orations",
          "Crowd Riot Incitement",
          "Philosophical Lectures",
          "Diplomatic Keynote Addresses",
          "Acoustic Vocal Projection",
          "Debate Cross-Examination"
          ]
        },
        {
          "name": "Percussion",
          "id": "social-percussion",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Playing drums, percussion instruments, and rhythm keeping.",
          "keywords": "percussion, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Acoustic Drum Kits",
          "Military War Drums & Snares",
          "Orchestral Timpani & Gongs",
          "Hand Percussion (Congas/Bongos)",
          "Electronic Drum Pads",
          "Tuned Mallet Percussion",
          "Tribal Ritual Drumming",
          "Bodhrán & Frame Drums",
          "Cymbals, Triangles & Chimes",
          "Rhythmic Rowing/Marching Cadence"
          ]
        },
        {
          "name": "Singing",
          "id": "social-singing",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Vocal performance, pitch control, and melodic singing.",
          "keywords": "singing, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Classical Opera",
          "Rock & Metal Belting",
          "Choral & Sacred Hymns",
          "Lounge Jazz & Torch Songs",
          "Folk Ballads & Sea Shanties",
          "Overtone & Throat Singing",
          "Sub-Harmonic Vocalizations",
          "Vocal Whistling & Warbling",
          "Battle Hymns & Cadences",
          "Microtonal Alien Chants"
          ]
        },
        {
          "name": "String",
          "id": "social-string",
          "group": "social",
          "baseAttr": "attr-agility",
          "description": "Playing acoustic or laser string instruments (guitars, violins, harps).",
          "keywords": "string, social, agility, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Electric Guitar",
          "Acoustic Guitar",
          "Violin & Fiddle",
          "Cello & Double Bass",
          "Concert Harp",
          "Lute & Mandolin",
          "Electric Bass Guitar",
          "Exotic Alien Zithers",
          "Banjo Playing",
          "Bowed Rebec & Archaic Strings"
          ]
        },
        {
          "name": "Style",
          "id": "social-style",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Poise, fashion, personal presentation, and social elegance.",
          "keywords": "style, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "High-Society Elegance",
          "Streetwear & Cyberpunk Chic",
          "Corporate Executive Polish",
          "Military & Uniform Crispness",
          "Intimidating Mercenary Look",
          "Subtle Blend-In (Gray Man)",
          "Avant-Garde Alien Couture",
          "Gala Glamour",
          "Retro & Nostalgic Vintage",
          "Personal Grooming & Scent"
          ]
        },
        {
          "name": "Wind",
          "id": "social-wind",
          "group": "social",
          "baseAttr": "attr-stamina",
          "description": "Playing woodwind and brass musical instruments.",
          "keywords": "wind, social, stamina, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Brass Trumpet & Cornet",
          "Saxophone (Alto/Tenor/Baritone)",
          "Flute & Piccolo",
          "Clarinet & Reed Instruments",
          "Bagpipes & War Pipes",
          "Harmonica & Blues Harp",
          "Trombone & Low Brass",
          "Hunting Horns & Bugles",
          "Alien Double-Pipes",
          "Didgeridoo & Drone Wind"
          ]
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
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Street Market Haggling",
          "Bulk Discount Negotiation",
          "Non-Monetary Trade Swapping",
          "Margin Squeezing",
          "Trade Goods Appraisal",
          "Closing the Deal",
          "Credit Terms & Financing",
          "Collateral Negotiation",
          "Pawn Valuation",
          "Surplus Liquidating"
          ]
        },
        {
          "name": "Bluff",
          "id": "social-bluff",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Deception, lying convincingly, misdirection, and poker face.",
          "keywords": "bluff, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Fast-Talking",
          "Tactical Feints",
          "Impromptu Cover Stories",
          "Digital Credential Faking",
          "Poker Face & Emotional Masking",
          "Grifts & Confidence Scams",
          "False Identity Impersonation",
          "Shifting the Blame",
          "Manufactured Rumors",
          "Misdirection of Intent"
          ]
        },
        {
          "name": "Diplomacy",
          "id": "social-diplomacy",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Persuasion, mediating disputes, conflict resolution, and finding common ground.",
          "keywords": "diplomacy, social, charisma, interaction, influence, persuasion",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Hostility De-escalation",
          "Formal Treaty Drafting",
          "Consensus Building",
          "High-Society Etiquette",
          "Inter-Faction Mediation",
          "Goodwill Cultivation",
          "Official Information Gathering",
          "Apology & Restitution Brokerage",
          "Alliance Brokering",
          "Hostage Negotiation"
          ]
        },
        {
          "name": "Insight",
          "id": "social-insight",
          "group": "social",
          "baseAttr": "attr-wisdom",
          "description": "Reading body language, detecting lies, discerning motives, and empathy.",
          "keywords": "insight, social, wisdom, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Lie Detection",
          "Emotional Empathy",
          "Cold Reading",
          "Motive Deduction",
          "Social Tension Assessment",
          "Coercion & Blackmail Detection",
          "Hidden Relationship Spotting",
          "Mental Instability Profiling",
          "Body Language Reading",
          "Sincerity Gauging"
          ]
        },
        {
          "name": "Intimidate",
          "id": "social-intimidate",
          "group": "social",
          "baseAttr": "attr-strength",
          "description": "Coercion, physical threats, forceful presence, and psychological pressure.",
          "keywords": "intimidate, social, strength, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Physical Menace",
          "Interrogation Under Duress",
          "Cold Psychological Menace",
          "Combat Demoralization",
          "Reputation Posturing",
          "Veiled Extortion & Threats",
          "Stare-Down",
          "Interrogative Shock Tactics",
          "Crowd Dispersal",
          "Exploiting Phobias"
          ]
        },
        {
          "name": "Leadership",
          "id": "social-leadership",
          "group": "social",
          "baseAttr": "attr-charisma",
          "description": "Commanding allies, inspiring morale, coordination, and maintaining unit order.",
          "keywords": "leadership, social, charisma, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Battlefield Tactical Command",
          "Inspiring Speeches",
          "Crew Morale Management",
          "Crisis Command",
          "Delegation & Task Assignment",
          "Mutiny Suppression",
          "Rallying Broken Allies",
          "Strategic Vision Planning",
          "Mentorship & Drill",
          "Personal Accountability"
          ]
        },
        {
          "name": "Streetwise",
          "id": "social-streetwise",
          "group": "social",
          "baseAttr": "attr-wisdom",
          "description": "Underworld contacts, black market knowledge, criminal slang, and alley savvy.",
          "keywords": "streetwise, social, wisdom, interaction, diplomacy, influence",
          "negative_keywords": "isolated, anti-social, inarticulate",
          "specialties": [
          "Black Market Fences",
          "Underworld Informant Networks",
          "Gang Territory & Boundaries",
          "Safehouse Identification",
          "Criminal Cant & Slang",
          "Bribing Officials",
          "Loan Shark Navigation",
          "Spotting Plainclothes Law",
          "Illicit Contraband Sourcing",
          "Urban Evasion"
          ]
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
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
          "Evasion & Footwork",
          "Solid Shield Blocking",
          "Energy Shield Deflection",
          "Weapon Parrying",
          "Total Defense Stance",
          "Roll & Tuck (Impact Absorption)",
          "Counter-Grapple Framing",
          "High-Cover Bracing",
          "Ranged Projectile Weaving",
          "Point-Blank Deflection"
          ]
        },
        {
          "name": "Melee",
          "id": "combat-melee",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "Swords, axes, knives, blunt weapons, and polearms in hand-to-hand combat.",
          "keywords": "melee, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
          "Daggers & Combat Knives",
          "One-Handed Swords",
          "Two-Handed Greatswords",
          "Polearms & Spears",
          "Blunt Staves & Bo Rods",
          "Battleaxes & Cleavers",
          "Warhammers & Maces",
          "Vibro-Blades",
          "Energized Melee Weapons",
          "Flails & Flexible Weapons"
          ]
        },
        {
          "name": "Ranged",
          "id": "combat-ranged",
          "group": "combat",
          "baseAttr": "attr-agility",
          "description": "Bows, crossbows, slings, and thrown weapons.",
          "keywords": "ranged, combat, agility, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
          "Recurve & Hunting Bows",
          "Heavy Longbows",
          "Compound Tech-Bows",
          "Hand Crossbows",
          "Heavy Siege Crossbows",
          "Throwing Knives & Spikes",
          "Throwing Axes & Tomahawks",
          "Shuriken & Flechettes",
          "Slings & Staff Slings",
          "Boomerangs & Returning Sticks"
          ]
        },
        {
          "name": "Unarmed",
          "id": "combat-unarmed",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "Martial arts, brawling, grappling, kicks, and punches.",
          "keywords": "unarmed, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
          "Boxing & Power Punches",
          "Kicks & Leg Sweeps",
          "Joint Locks & Submissions",
          "Grappling & Throws",
          "Claws & Talons (Natural)",
          "Biting & Fangs (Natural)",
          "Horns & Headbutts (Natural)",
          "Tail Strikes & Sweeps (Natural)",
          "Chokeholds & Strangles",
          "Nerve Strikes & Pressure Points"
          ]
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
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
          "Semi-Automatic Pistols",
          "Heavy Revolvers",
          "Tactical Shotguns",
          "Submachine Guns (SMGs)",
          "Assault Rifles & Carbines",
          "Designated Marksman Rifles",
          "Sniper Rifles",
          "Automatic Fire Walking",
          "Kinetic Anti-Materiel Rifles",
          "Concealed Carry Quick-Draw"
          ]
        },
        {
          "name": "Heavy Weapons",
          "id": "combat-heavy-weapons",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "Machine guns, rocket launchers, mortars, and vehicle-mounted cannons.",
          "keywords": "heavy weapons, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
          "Squad Automatic Weapons (SAWs)",
          "Heavy Mounted Machine Guns",
          "Unguided Rocket Launchers",
          "Smart Missile Systems",
          "Rotary Grenade Launchers",
          "Vehicle-Mounted Cannons",
          "Rotary Miniguns",
          "Man-Portable Mortars",
          "Stationary Defense Emplacements",
          "Anti-Air Kinetic Flak"
          ]
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
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
          "Laser Pistols & Carbines",
          "Plasma Rifles",
          "Particle Beam Carbines",
          "Sonic Stunners & Shatterguns",
          "Cryo-Projectors",
          "Arc & Voltic Rifles",
          "Corrosive Spray Weapons",
          "Grav-Pulse Blasters",
          "Disruptor & Disintegrator Pistols",
          "Thermal Microwave Lances"
          ]
        },
        {
          "name": "Heavy Energy",
          "id": "combat-heavy-energy",
          "group": "combat",
          "baseAttr": "attr-strength",
          "description": "Particle cannons, heavy lasers, plasma bombards, and titan weaponry.",
          "keywords": "heavy energy, combat, strength, tactical, offensive, defense",
          "negative_keywords": "pacifist, unarmed-civilian, helpless",
          "specialties": [
          "Ship-to-Ship Laser Batteries",
          "Orbital Particle Lances",
          "Heavy Plasma Mortars",
          "Singularity Projectors",
          "Spinal Railguns & Coilguns",
          "Manned Fortress Energy Turrets",
          "Tachyon Beam Cannons",
          "Point-Defense Energy Arrays (PDC)",
          "Macro-Ion Cannons",
          "Coaxial Plasma Bombardment Cannons"
          ]
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
          "negative_keywords": "mundane, anti-magic-field, unattuned",
          "specialties": [
          "Conduit Channeling",
          "Concentration Under Stress",
          "Spell DC Augmentation",
          "Overcoming Resistance (SR/PR)",
          "Runic Circle Scribing",
          "Metascience Calibration",
          "Counter-Magic Shaping",
          "Ambient Energy Absorption",
          "Reality Anchor Stabilization",
          "Overcharging Invocations"
          ]
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

/**
 * Enriches a skill object with all canonical metadata (group, base attribute, description,
 * keywords, negative railguards, specialties, TL, ML) for Codex Matrix editing or DBM.
 */
export const getEnrichedSkillData = (skill) => {
  if (!skill) return null;
  const rawId = skill.id || '';
  const cleanId = rawId.replace(/^[a-z]+-/, '').toLowerCase();
  const rawName = (skill.name || skill.title || '').trim().toLowerCase();

  const canonical = ALL_CANONICAL_SKILLS.find(s => {
    const sId = (s.id || '').toLowerCase();
    const sCleanId = sId.replace(/^[a-z]+-/, '');
    const sName = (s.name || '').toLowerCase();
    return (rawId && sId === rawId.toLowerCase()) ||
           (cleanId && sCleanId === cleanId) ||
           (rawName && sName === rawName);
  });

  const group = skill.group || canonical?.group || 'physical';
  const name = skill.name || canonical?.name || 'Skill';
  const id = skill.id || canonical?.id || `${group}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return {
    ...(canonical || {}),
    ...skill,
    id,
    name,
    group,
    type: skill.type || canonical?.type || group,
    subtype: skill.subtype || canonical?.subcategory || canonical?.subtype || 'General',
    subcategory: skill.subcategory || canonical?.subcategory || 'General',
    baseAttr: skill.baseAttr || canonical?.baseAttr || 'attr-agility',
    description: skill.description || canonical?.description || '',
    keywords: skill.keywords || canonical?.keywords || '',
    negative_keywords: skill.negative_keywords || canonical?.negative_keywords || '',
    specialties: Array.isArray(skill.specialties) && skill.specialties.length > 0 
      ? skill.specialties 
      : (Array.isArray(canonical?.specialties) ? canonical.specialties : []),
    tech_level: skill.tech_level !== undefined ? skill.tech_level : (canonical?.tech_level ?? 0),
    meta_level: skill.meta_level !== undefined ? skill.meta_level : (canonical?.meta_level ?? 0),
    tl: skill.tech_level !== undefined ? skill.tech_level : (canonical?.tech_level ?? 0),
    ml: skill.meta_level !== undefined ? skill.meta_level : (canonical?.meta_level ?? 0),
  };
};
