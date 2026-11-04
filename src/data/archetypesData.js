/**
 * Canonical 100 Archetypes for Tangent Science Fantasy Roleplaying Game (SFF RPG)
 * Auto-generated from src/data/omnicortex/archetypes/ (1.02 ARCHETYPES.md)
 * Chassis Allocation Formula: 80 CP (+3 Primary, +2 Secondary, 4 Trained + 6 Novice skills, Signature Traits @ 1 CP)
 */

export const ARCHETYPE_SPHERES = [
  {
    "id": "sentinels",
    "name": "Sentinels (The Stabilizers)",
    "focus": "Logistics, Protection, Tradition, and Economy",
    "description": "Sentinels are the foundation. They ensure the group survives, supplies are managed, and the line is held. They are the defenders, the providers, and the heavy infantry."
  },
  {
    "id": "operatives",
    "name": "Operatives (The Artisans)",
    "focus": "Action, Adaptability, Performance, and Risk",
    "description": "Operatives are the doers. They thrive on adrenaline, skill mastery, and manipulating the physical world. They are the rogues, pilots, and entertainers."
  },
  {
    "id": "visionaries",
    "name": "Visionaries (The Idealists)",
    "focus": "Identity, Meaning, Connection, and Influence",
    "description": "Visionaries are the soul of the party. They focus on the big picture, social harmony, and the metaphysical connection between beings. They are the leaders, the diplomats, and the mystics."
  },
  {
    "id": "savants",
    "name": "Savants (The Rationals)",
    "focus": "Competence, Knowledge, Systems, and Strategy",
    "description": "Savants are the brains of the operation. They solve puzzles, build tech, plan heists, and wield magic as a science."
  }
];

export const ARCHETYPE_SCALING_RULES = {
  "tier1": {
    "title": "NPC Tier 1 (Novice / Minion)",
    "health": 25,
    "vitality": 25,
    "attackRoll": "2d10 + 3 (Primary Attribute)",
    "defense": "11 + Secondary Attribute",
    "derivedSaves": "+2",
    "signatureFeatures": "1 basic Signature Trait passive effect only.",
    "signatureTraits": "1 basic Signature Trait passive effect only."
  },
  "tier2": {
    "title": "NPC Tier 2 (Veteran / Professional)",
    "health": 50,
    "vitality": 50,
    "attackRoll": "2d10 + 5 (Primary Attribute + 2)",
    "defense": "13 + Secondary Attribute",
    "derivedSaves": "+4",
    "signatureFeatures": "1 active Signature Trait, used once per combat.",
    "signatureTraits": "1 active Signature Trait, used once per combat."
  },
  "tier3": {
    "title": "NPC Tier 3 (Master / Boss)",
    "health": 100,
    "vitality": 100,
    "attackRoll": "2d10 + 8 (Primary Attribute + 5)",
    "defense": "15 + Secondary Attribute",
    "derivedSaves": "+7",
    "signatureFeatures": "2 Signature Traits, fully active.",
    "signatureTraits": "2 Signature Traits, fully active."
  },
  "tier4": {
    "title": "NPC Tier 4 (Pinnacle / Legendary)",
    "health": 200,
    "vitality": 200,
    "attackRoll": "2d10 + 12 (Primary Attribute + 8)",
    "defense": "18 + Secondary Attribute",
    "derivedSaves": "+10",
    "signatureFeatures": "3 Signature Traits, fully active, can spend 1 action to recharge.",
    "signatureTraits": "3 Signature Traits, fully active, can spend 1 action to recharge."
  }
};

export const DEFAULT_ARCHETYPES = [
  {
    "id": "archetype-armorer",
    "name": "The Armorer",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "The specialist who crafts and maintains the protective shells that preserve life in high-threat zones.",
    "flavor": "You provide the safety that makes heroism possible. You know every weak point in a chest plate and every bypass in a shield generator. Without your craft, the team is just target practice.",
    "quote": "\"Flesh is soft. Let me give you something harder.\"",
    "core_concept": "Crafter / Support / Defense",
    "recommended_occupations": [
      "Builder",
      "Soldier"
    ],
    "recommended_origins": [
      "Industrial",
      "Urban",
      "Militaristic"
    ],
    "recommended_factions": [
      "Impyrium (Forge Masters)",
      "Dynasty (Smiths)",
      "Syndicate"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Strength",
    "key_attributes": "Intellect (Primary), Strength (Secondary).",
    "essential_skills": [
      "Vocation (Armorer)",
      "Vocation (Engineer)",
      "Knowledge (Technology)",
      "Knowledge (Appraisal)"
    ],
    "signature_features": [
      "Master Vocation skillsman",
      "Crafters Insight"
    ],
    "tactical_role": "Repairing armor in the field, identifying equipment vulnerabilities, maximizing party DR.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The specialist who crafts and maintains the protective shells that preserve life in high-threat zones.\n\n*You provide the safety that makes heroism possible. You know every weak point in a chest plate and every bypass in a shield generator. Without your craft, the team is just target practice.*\n\n_\"Flesh is soft. Let me give you something harder.\"_",
    "keywords": "armorer, sentinel, defender, stability, order, crafter, support",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, mindless-brute",
    "signature_traits": [
      "Master Vocation skillsman",
      "Crafters Insight"
    ],
    "traits": [
      "Master Vocation skillsman",
      "Crafters Insight"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Armorer\n\n\nThe specialist who crafts and maintains the protective shells that preserve life in high-threat zones.\n\n*You provide the safety that makes heroism possible. You know every weak point in a chest plate and every bypass in a shield generator. Without your craft, the team is just target practice.*\n\n*\"Flesh is soft. Let me give you something harder.\"*\n\n  - **Core Concept:** Crafter / Support / Defense\n  - **Recommended Occupations:** Builder, Soldier.\n  - **Recommended Origins:** Industrial, Urban, Militaristic.\n  - **Recommended Factions:** Impyrium (Forge Masters), Dynasty (Smiths), Syndicate.\n  - **Key Attributes:** Intellect (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Armorer), Vocation (Engineer), Knowledge (Technology), Knowledge (Appraisal).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Master Craftsman, Crafter's Insight.\n  - **Tactical Role:** Repairing armor in the field, identifying equipment vulnerabilities, maximizing party DR.",
    "full_text": "# The Armorer\n\n\nThe specialist who crafts and maintains the protective shells that preserve life in high-threat zones.\n\n*You provide the safety that makes heroism possible. You know every weak point in a chest plate and every bypass in a shield generator. Without your craft, the team is just target practice.*\n\n*\"Flesh is soft. Let me give you something harder.\"*\n\n  - **Core Concept:** Crafter / Support / Defense\n  - **Recommended Occupations:** Builder, Soldier.\n  - **Recommended Origins:** Industrial, Urban, Militaristic.\n  - **Recommended Factions:** Impyrium (Forge Masters), Dynasty (Smiths), Syndicate.\n  - **Key Attributes:** Intellect (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Armorer), Vocation (Engineer), Knowledge (Technology), Knowledge (Appraisal).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Master Craftsman, Crafter's Insight.\n  - **Tactical Role:** Repairing armor in the field, identifying equipment vulnerabilities, maximizing party DR."
  },
  {
    "id": "archetype-bailiff",
    "name": "The Bailiff",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "The officer of the court and enforcer of civil law, ensuring that order is maintained within the halls of justice.",
    "flavor": "You are the shadow of the judge. You maintain the dignity of the law through physical presence and unwavering authority. You ensure that even the most chaotic elements respect the proceedings.",
    "quote": "\"The Court will have order. One way or another.\"",
    "core_concept": "Law Enforcement / Control / Tank",
    "recommended_occupations": [
      "Agent",
      "Citizen"
    ],
    "recommended_origins": [
      "Urban",
      "Militaristic",
      "Colony"
    ],
    "recommended_factions": [
      "Ascendancy (Judiciaries)",
      "Impyrium (Legalists)",
      "Entari Combine"
    ],
    "primary_attribute": "Strength",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Strength (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Investigation)",
      "Knowledge (Law)",
      "Intimidation",
      "Melee"
    ],
    "signature_features": [
      "Law Enforcement Training",
      "Authority Figure"
    ],
    "tactical_role": "Grappling and subduing targets, protecting VIPs, enforcing social order.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The officer of the court and enforcer of civil law, ensuring that order is maintained within the halls of justice.\n\n*You are the shadow of the judge. You maintain the dignity of the law through physical presence and unwavering authority. You ensure that even the most chaotic elements respect the proceedings.*\n\n_\"The Court will have order. One way or another.\"_",
    "keywords": "bailiff, sentinel, defender, stability, order, law enforcement, control",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, chaotic-anarchist",
    "signature_traits": [
      "Law Enforcement Training",
      "Authority Figure"
    ],
    "traits": [
      "Law Enforcement Training",
      "Authority Figure"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Bailiff\n\n\nThe officer of the court and enforcer of civil law, ensuring that order is maintained within the halls of justice.\n\n*You are the shadow of the judge. You maintain the dignity of the law through physical presence and unwavering authority. You ensure that even the most chaotic elements respect the proceedings.*\n\n*\"The Court will have order. One way or another.\"*\n\n  - **Core Concept:** Law Enforcement / Control / Tank\n  - **Recommended Occupations:** Agent, Citizen.\n  - **Recommended Origins:** Urban, Militaristic, Colony.\n  - **Recommended Factions:** Ascendancy (Judiciaries), Impyrium (Legalists), Entari Combine.\n  - **Key Attributes:** Strength (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Knowledge (Law), Intimidation, Melee.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Law Enforcement Training, Authority Figure.\n  - **Tactical Role:** Grappling and subduing targets, protecting VIPs, enforcing social order.",
    "full_text": "# The Bailiff\n\n\nThe officer of the court and enforcer of civil law, ensuring that order is maintained within the halls of justice.\n\n*You are the shadow of the judge. You maintain the dignity of the law through physical presence and unwavering authority. You ensure that even the most chaotic elements respect the proceedings.*\n\n*\"The Court will have order. One way or another.\"*\n\n  - **Core Concept:** Law Enforcement / Control / Tank\n  - **Recommended Occupations:** Agent, Citizen.\n  - **Recommended Origins:** Urban, Militaristic, Colony.\n  - **Recommended Factions:** Ascendancy (Judiciaries), Impyrium (Legalists), Entari Combine.\n  - **Key Attributes:** Strength (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Knowledge (Law), Intimidation, Melee.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Law Enforcement Training, Authority Figure.\n  - **Tactical Role:** Grappling and subduing targets, protecting VIPs, enforcing social order."
  },
  {
    "id": "archetype-beast-handler",
    "name": "The Beast-handler",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "The rugged specialist who trains and directs animals and xeno-fauna for work and war.",
    "flavor": "You understand the wild mind. You forge bonds with creatures that others view as monsters, turning their primal instincts into tactical assets. Your pack is your family and your weapon.",
    "quote": "\"They aren't pets. They're partners.\"",
    "core_concept": "Pet Master / Utility / Scout",
    "recommended_occupations": [
      "Scout",
      "Drifter"
    ],
    "recommended_origins": [
      "Agricultural",
      "Hostile",
      "Colony"
    ],
    "recommended_factions": [
      "Auluran (Graa Handlers)",
      "Outworlds (Wranglers)",
      "Coalition"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Vocation (Handler)",
      "Knowledge (Survival)",
      "Athletics",
      "Insight"
    ],
    "signature_features": [
      "Animal Affinity",
      "Spirit Walker"
    ],
    "tactical_role": "Directing animal allies in combat, tracking with biological aids, navigating wilderness.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The rugged specialist who trains and directs animals and xeno-fauna for work and war.\n\n*You understand the wild mind. You forge bonds with creatures that others view as monsters, turning their primal instincts into tactical assets. Your pack is your family and your weapon.*\n\n_\"They aren't pets. They're partners.\"_",
    "keywords": "beast-handler, sentinel, defender, stability, order, pet master, utility",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Animal Affinity",
      "Spirit Walker"
    ],
    "traits": [
      "Animal Affinity",
      "Spirit Walker"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Beast-Handler\n\n\nThe rugged specialist who trains and directs animals and xeno-fauna for work and war.\n\n*You understand the wild mind. You forge bonds with creatures that others view as monsters, turning their primal instincts into tactical assets. Your pack is your family and your weapon.*\n\n*\"They aren't pets. They're partners.\"*\n\n  - **Core Concept:** Pet Master / Utility / Scout\n  - **Recommended Occupations:** Scout, Drifter.\n  - **Recommended Origins:** Agricultural, Hostile, Colony.\n  - **Recommended Factions:** Auluran (Graa Handlers), Outworlds (Wranglers), Coalition.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Handler), Knowledge (Survival), Athletics, Insight.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Animal Affinity, Spirit Walker.\n  - **Tactical Role:** Directing animal allies in combat, tracking with biological aids, navigating wilderness.",
    "full_text": "# The Beast-Handler\n\n\nThe rugged specialist who trains and directs animals and xeno-fauna for work and war.\n\n*You understand the wild mind. You forge bonds with creatures that others view as monsters, turning their primal instincts into tactical assets. Your pack is your family and your weapon.*\n\n*\"They aren't pets. They're partners.\"*\n\n  - **Core Concept:** Pet Master / Utility / Scout\n  - **Recommended Occupations:** Scout, Drifter.\n  - **Recommended Origins:** Agricultural, Hostile, Colony.\n  - **Recommended Factions:** Auluran (Graa Handlers), Outworlds (Wranglers), Coalition.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Handler), Knowledge (Survival), Athletics, Insight.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Animal Affinity, Spirit Walker.\n  - **Tactical Role:** Directing animal allies in combat, tracking with biological aids, navigating wilderness."
  },
  {
    "id": "archetype-broker",
    "name": "The Broker",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "Travels space lanes buying and selling. Keen eye for value and negotiation.",
    "flavor": "You keep the galaxy moving. You know the value of everything, from a crate of ore to a secret. You turn risks into rewards, navigating trade routes and social circles to ensure your crew always turns a profit.",
    "quote": "\"Everything is negotiable. Even loyalty.\"",
    "core_concept": "Economy / Logistics / Face",
    "recommended_occupations": [
      "Merchant",
      "Spacer"
    ],
    "recommended_origins": [
      "Urban",
      "Spacer",
      "Colony"
    ],
    "recommended_factions": [
      "Entari Combine (Merchants)",
      "Syndicate (Traders)",
      "Alterian Enclave"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Insight",
      "Vocation (Broker)"
    ],
    "signature_features": [
      "Market Savvy",
      "Resourceful"
    ],
    "tactical_role": "Funding the party, acquiring rare gear, transport logistics.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Travels space lanes buying and selling. Keen eye for value and negotiation.\n\n*You keep the galaxy moving. You know the value of everything, from a crate of ore to a secret. You turn risks into rewards, navigating trade routes and social circles to ensure your crew always turns a profit.*\n\n_\"Everything is negotiable. Even loyalty.\"_",
    "keywords": "broker, sentinel, defender, stability, order, economy, logistics",
    "negative_keywords": "mindless-brute, reckless, illiterate, chaotic-anarchist, unreliable",
    "signature_traits": [
      "Market Savvy",
      "Resourceful"
    ],
    "traits": [
      "Market Savvy",
      "Resourceful"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Broker\n\n\nTravels space lanes buying and selling. Keen eye for value and negotiation.\n\n*You keep the galaxy moving. You know the value of everything, from a crate of ore to a secret. You turn risks into rewards, navigating trade routes and social circles to ensure your crew always turns a profit.*\n\n*\"Everything is negotiable. Even loyalty.\"*\n\n  - **Core Concept:** Economy / Logistics / Face\n  - **Recommended Occupations:** Merchant, Spacer.\n  - **Recommended Origins:** Urban, Spacer, Colony.\n  - **Recommended Factions:** Entari Combine (Merchants), Syndicate (Traders), Alterian Enclave.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Vocation (Broker).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Market Savvy, Resourceful.\n  - **Tactical Role:** Funding the party, acquiring rare gear, transport logistics.",
    "full_text": "# The Broker\n\n\nTravels space lanes buying and selling. Keen eye for value and negotiation.\n\n*You keep the galaxy moving. You know the value of everything, from a crate of ore to a secret. You turn risks into rewards, navigating trade routes and social circles to ensure your crew always turns a profit.*\n\n*\"Everything is negotiable. Even loyalty.\"*\n\n  - **Core Concept:** Economy / Logistics / Face\n  - **Recommended Occupations:** Merchant, Spacer.\n  - **Recommended Origins:** Urban, Spacer, Colony.\n  - **Recommended Factions:** Entari Combine (Merchants), Syndicate (Traders), Alterian Enclave.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Vocation (Broker).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Market Savvy, Resourceful.\n  - **Tactical Role:** Funding the party, acquiring rare gear, transport logistics."
  },
  {
    "id": "archetype-bureaucrat",
    "name": "The Bureaucrat",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "The skilled administrator who ensures the smooth operation of departments or territories. They navigate red tape like a labyrinth runner.",
    "flavor": "You are the grease in the gears of civilization. While others fight with guns or magic, you fight with logistics, ensuring the team has funding, permits, and a safe harbor. Without you, they are just vagrants; with you, they are an organization.",
    "quote": "\"Amateurs talk strategy. Professionals talk logistics. Now sign here.\"",
    "core_concept": "Logistics / Support / Social Tank",
    "recommended_occupations": [
      "Citizen (Corporate)",
      "Representative"
    ],
    "recommended_origins": [
      "Urban",
      "Colony",
      "Industrial"
    ],
    "recommended_factions": [
      "Syndicate (Middle Management)",
      "Impyrium (Administration)",
      "Entari Combine"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Charisma",
    "key_attributes": "Intellect (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Knowledge (History)",
      "Insight",
      "Vocation (Administration)"
    ],
    "signature_features": [
      "Bureaucratic Efficiency",
      "Master Negotiator"
    ],
    "tactical_role": "Secure resources, bypass legal hurdles, manage team logistics.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The skilled administrator who ensures the smooth operation of departments or territories. They navigate red tape like a labyrinth runner.\n\n*You are the grease in the gears of civilization. While others fight with guns or magic, you fight with logistics, ensuring the team has funding, permits, and a safe harbor. Without you, they are just vagrants; with you, they are an organization.*\n\n_\"Amateurs talk strategy. Professionals talk logistics. Now sign here.\"_",
    "keywords": "bureaucrat, sentinel, defender, stability, order, logistics, support",
    "negative_keywords": "mindless-brute, reckless, illiterate, chaotic-anarchist, unreliable",
    "signature_traits": [
      "Bureaucratic Efficiency",
      "Master Negotiator"
    ],
    "traits": [
      "Bureaucratic Efficiency",
      "Master Negotiator"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Bureaucrat\n\n\nThe skilled administrator who ensures the smooth operation of departments or territories. They navigate red tape like a labyrinth runner.\n\n*You are the grease in the gears of civilization. While others fight with guns or magic, you fight with logistics, ensuring the team has funding, permits, and a safe harbor. Without you, they are just vagrants; with you, they are an organization.*\n\n*\"Amateurs talk strategy. Professionals talk logistics. Now sign here.\"*\n\n  - **Core Concept:** Logistics / Support / Social Tank\n  - **Recommended Occupations:** Citizen (Corporate), Representative.\n  - **Recommended Origins:** Urban, Colony, Industrial.\n  - **Recommended Factions:** Syndicate (Middle Management), Impyrium (Administration), Entari Combine.\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Knowledge (History), Insight, Vocation (Administrator).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Bureaucratic Efficiency, Master Negotiator.\n  - **Tactical Role:** Secure resources, bypass legal hurdles, manage team logistics.",
    "full_text": "# The Bureaucrat\n\n\nThe skilled administrator who ensures the smooth operation of departments or territories. They navigate red tape like a labyrinth runner.\n\n*You are the grease in the gears of civilization. While others fight with guns or magic, you fight with logistics, ensuring the team has funding, permits, and a safe harbor. Without you, they are just vagrants; with you, they are an organization.*\n\n*\"Amateurs talk strategy. Professionals talk logistics. Now sign here.\"*\n\n  - **Core Concept:** Logistics / Support / Social Tank\n  - **Recommended Occupations:** Citizen (Corporate), Representative.\n  - **Recommended Origins:** Urban, Colony, Industrial.\n  - **Recommended Factions:** Syndicate (Middle Management), Impyrium (Administration), Entari Combine.\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Knowledge (History), Insight, Vocation (Administrator).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Bureaucratic Efficiency, Master Negotiator.\n  - **Tactical Role:** Secure resources, bypass legal hurdles, manage team logistics."
  },
  {
    "id": "archetype-company-man",
    "name": "The Company Man",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "Represents the company's interests, securing deals and resolving disputes. Backed by corporate resources.",
    "flavor": "You are the avatar of the megacorp. You walk into rooms and buy the building. You wield wealth and legal precedent like a cudgel, ensuring that no matter who wins the fight, your side wins the profit.",
    "quote": "\"My client is willing to offer a generous settlement. I suggest you take it before my security team settles it for you.\"",
    "core_concept": "Resource Access / Face / Fixer",
    "recommended_occupations": [
      "Agent",
      "Citizen (Corporate)"
    ],
    "recommended_origins": [
      "Urban",
      "Industrial",
      "Leisure"
    ],
    "recommended_factions": [
      "Syndicate (Executives)",
      "Entari Combine (Trade Reps)",
      "Ascendancy"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Insight",
      "Bluff",
      "Knowledge (Business)"
    ],
    "signature_features": [
      "Corporate Backing",
      "Business Acumen"
    ],
    "tactical_role": "Funding the mission, legal defense, accessing corporate restricted zones.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Represents the company's interests, securing deals and resolving disputes. Backed by corporate resources.\n\n*You are the avatar of the megacorp. You walk into rooms and buy the building. You wield wealth and legal precedent like a cudgel, ensuring that no matter who wins the fight, your side wins the profit.*\n\n_\"My client is willing to offer a generous settlement. I suggest you take it before my security team settles it for you.\"_",
    "keywords": "company man, sentinel, defender, stability, order, resource access, face",
    "negative_keywords": "mindless-brute, reckless, illiterate, chaotic-anarchist, unreliable",
    "signature_traits": [
      "Corporate Backing",
      "Business Acumen"
    ],
    "traits": [
      "Corporate Backing",
      "Business Acumen"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Company Man\n\n\nRepresents the company's interests, securing deals and resolving disputes. Backed by corporate resources.\n\n*You are the avatar of the megacorp. You walk into rooms and buy the building. You wield wealth and legal precedent like a cudgel, ensuring that no matter who wins the fight, your side wins the profit.*\n\n*\"My client is willing to offer a generous settlement. I suggest you take it before my security team settles it for you.\"*\n\n  - **Core Concept:** Resource Access / Face / Fixer\n  - **Recommended Occupations:** Agent, Citizen (Corporate).\n  - **Recommended Origins:** Urban, Industrial, Leisure.\n  - **Recommended Factions:** Syndicate (Executives), Entari Combine (Trade Reps), Ascendancy.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Bluff, Knowledge (Business).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Corporate Backing, Business Acumen.\n  - **Tactical Role:** Funding the mission, legal defense, accessing corporate restricted zones.",
    "full_text": "# The Company Man\n\n\nRepresents the company's interests, securing deals and resolving disputes. Backed by corporate resources.\n\n*You are the avatar of the megacorp. You walk into rooms and buy the building. You wield wealth and legal precedent like a cudgel, ensuring that no matter who wins the fight, your side wins the profit.*\n\n*\"My client is willing to offer a generous settlement. I suggest you take it before my security team settles it for you.\"*\n\n  - **Core Concept:** Resource Access / Face / Fixer\n  - **Recommended Occupations:** Agent, Citizen (Corporate).\n  - **Recommended Origins:** Urban, Industrial, Leisure.\n  - **Recommended Factions:** Syndicate (Executives), Entari Combine (Trade Reps), Ascendancy.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Bluff, Knowledge (Business).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Corporate Backing, Business Acumen.\n  - **Tactical Role:** Funding the mission, legal defense, accessing corporate restricted zones."
  },
  {
    "id": "archetype-culinarian",
    "name": "The Culinarian",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "The essential provider of nutrition and morale, transforming scarce resources into sustaining banquets.",
    "flavor": "You are the heart of the camp. You understand that a soldier fights on their stomach and a diplomat speaks with their palate. You can find sustenance on a dead moon and hope in a warm meal.",
    "quote": "\"A good meal can stop a war. A bad one can start it.\"",
    "core_concept": "Support / Morale / Survival",
    "recommended_occupations": [
      "Citizen",
      "Drifter"
    ],
    "recommended_origins": [
      "Agricultural",
      "Leisure",
      "Colony"
    ],
    "recommended_factions": [
      "Entari Combine (Hospitality)",
      "Auluran (Nurturers)",
      "Outworlds"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Charisma",
    "key_attributes": "Wisdom (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Vocation (Culinarian)",
      "Nature",
      "Medicine",
      "Insight"
    ],
    "signature_features": [
      "Self-Sufficiency",
      "Resourceful"
    ],
    "tactical_role": "Buffing party recovery during rest, identifying safe/toxic flora, boosting team morale.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The essential provider of nutrition and morale, transforming scarce resources into sustaining banquets.\n\n*You are the heart of the camp. You understand that a soldier fights on their stomach and a diplomat speaks with their palate. You can find sustenance on a dead moon and hope in a warm meal.*\n\n_\"A good meal can stop a war. A bad one can start it.\"_",
    "keywords": "culinarian, sentinel, defender, stability, order, support, morale",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Self-Sufficiency",
      "Resourceful"
    ],
    "traits": [
      "Self-Sufficiency",
      "Resourceful"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Culinarian\n\n\nThe essential provider of nutrition and morale, transforming scarce resources into sustaining banquets.\n\n*You are the heart of the camp. You understand that a soldier fights on their stomach and a diplomat speaks with their palate. You can find sustenance on a dead moon and hope in a warm meal.*\n\n*\"A good meal can stop a war. A bad one can start it.\"*\n\n  - **Core Concept:** Support / Morale / Survival\n  - **Recommended Occupations:** Citizen, Drifter.\n  - **Recommended Origins:** Agricultural, Leisure, Colony.\n  - **Recommended Factions:** Entari Combine (Hospitality), Auluran (Nurturers), Outworlds.\n  - **Key Attributes:** Wisdom (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Culinarian), Nature, Medicine, Insight.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Self-Sufficiency, Resourceful.\n  - **Tactical Role:** Buffing party recovery during rest, identifying safe/toxic flora, boosting team morale.",
    "full_text": "# The Culinarian\n\n\nThe essential provider of nutrition and morale, transforming scarce resources into sustaining banquets.\n\n*You are the heart of the camp. You understand that a soldier fights on their stomach and a diplomat speaks with their palate. You can find sustenance on a dead moon and hope in a warm meal.*\n\n*\"A good meal can stop a war. A bad one can start it.\"*\n\n  - **Core Concept:** Support / Morale / Survival\n  - **Recommended Occupations:** Citizen, Drifter.\n  - **Recommended Origins:** Agricultural, Leisure, Colony.\n  - **Recommended Factions:** Entari Combine (Hospitality), Auluran (Nurturers), Outworlds.\n  - **Key Attributes:** Wisdom (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Culinarian), Nature, Medicine, Insight.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Self-Sufficiency, Resourceful.\n  - **Tactical Role:** Buffing party recovery during rest, identifying safe/toxic flora, boosting team morale."
  },
  {
    "id": "archetype-demolisher",
    "name": "The Demolisher",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "Expert in operating heavy weaponry like machine guns and rocket launchers. Provides overwhelming firepower.",
    "flavor": "You believe there is no problem that cannot be solved by the proper application of high explosives. You control the battlefield through sheer volume of fire, turning cover into concealment and enemies into memories.",
    "quote": "\"Suppressive fire? No, I'm just clearing the room.\"",
    "core_concept": "DPS / Area Denial",
    "recommended_occupations": [
      "Soldier",
      "Mercenary"
    ],
    "recommended_origins": [
      "Militaristic",
      "Hostile",
      "Industrial"
    ],
    "recommended_factions": [
      "Coalition (Heavy Support)",
      "Impyrium (Legionnaires)",
      "Mekan (Siege Units)"
    ],
    "primary_attribute": "Strength",
    "secondary_attribute": "Agility",
    "key_attributes": "Strength (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Athletics",
      "Combat (Heavy)"
    ],
    "signature_features": [
      "Heavy Weapon Mastery",
      "Explosive Expertise"
    ],
    "tactical_role": "Suppressive fire, destroying vehicles, crowd control.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Expert in operating heavy weaponry like machine guns and rocket launchers. Provides overwhelming firepower.\n\n*You believe there is no problem that cannot be solved by the proper application of high explosives. You control the battlefield through sheer volume of fire, turning cover into concealment and enemies into memories.*\n\n_\"Suppressive fire? No, I'm just clearing the room.\"_",
    "keywords": "demolisher, sentinel, defender, stability, order, dps, area denial",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Heavy Weapon Mastery",
      "Explosive Expertise"
    ],
    "traits": [
      "Heavy Weapon Mastery",
      "Explosive Expertise"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Demolisher\n\n\nExpert in operating heavy weaponry like machine guns and rocket launchers. Provides overwhelming firepower.\n\n*You believe there is no problem that cannot be solved by the proper application of high explosives. You control the battlefield through sheer volume of fire, turning cover into concealment and enemies into memories.*\n\n*\"Suppressive fire? No, I'm just clearing the room.\"*\n\n  - **Core Concept:** DPS / Area Denial\n  - **Recommended Occupations:** Soldier, Mercenary.\n  - **Recommended Origins:** Militaristic, Hostile, Industrial.\n  - **Recommended Factions:** Coalition (Heavy Support), Impyrium (Legionnaires), Mekan (Siege Units).\n  - **Key Attributes:** Strength (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Athletics, Combat (Heavy).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Heavy Weapon Mastery, Explosive Expertise.\n  - **Tactical Role:** Suppressive fire, destroying vehicles, crowd control.",
    "full_text": "# The Demolisher\n\n\nExpert in operating heavy weaponry like machine guns and rocket launchers. Provides overwhelming firepower.\n\n*You believe there is no problem that cannot be solved by the proper application of high explosives. You control the battlefield through sheer volume of fire, turning cover into concealment and enemies into memories.*\n\n*\"Suppressive fire? No, I'm just clearing the room.\"*\n\n  - **Core Concept:** DPS / Area Denial\n  - **Recommended Occupations:** Soldier, Mercenary.\n  - **Recommended Origins:** Militaristic, Hostile, Industrial.\n  - **Recommended Factions:** Coalition (Heavy Support), Impyrium (Legionnaires), Mekan (Siege Units).\n  - **Key Attributes:** Strength (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Athletics, Combat (Heavy).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Heavy Weapon Mastery, Explosive Expertise.\n  - **Tactical Role:** Suppressive fire, destroying vehicles, crowd control."
  },
  {
    "id": "archetype-field-medic",
    "name": "The Field Medic",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "Provides emergency medical care under fire. Proficient in both combat and medicine.",
    "flavor": "You hold the line between life and death. When the armor fails and the screaming starts, you are the calm in the chaos. You possess the steady hands to stitch a wound while dodging plasma fire.",
    "quote": "\"I decide who walks away from this. Don't make me regret choosing you.\"",
    "core_concept": "Healer / Light Infantry",
    "recommended_occupations": [
      "Soldier",
      "Specialist"
    ],
    "recommended_origins": [
      "Militaristic",
      "Colony",
      "Spacer"
    ],
    "recommended_factions": [
      "Coalition (Combat Medics)",
      "Auluran (Healer Caste)",
      "Outworlds (Sawbones)"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Agility",
    "key_attributes": "Wisdom (Primary), Agility (Secondary).",
    "essential_skills": [
      "Medicine",
      "Athletics",
      "Combat (Rifle/Pistol)"
    ],
    "signature_features": [
      "Field Triage",
      "Combat Medic"
    ],
    "tactical_role": "Keep the tank alive, revive downed allies, provide light fire support.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Provides emergency medical care under fire. Proficient in both combat and medicine.\n\n*You hold the line between life and death. When the armor fails and the screaming starts, you are the calm in the chaos. You possess the steady hands to stitch a wound while dodging plasma fire.*\n\n_\"I decide who walks away from this. Don't make me regret choosing you.\"_",
    "keywords": "field medic, sentinel, defender, stability, order, healer, light infantry",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, chaotic-anarchist",
    "signature_traits": [
      "Field Triage",
      "Combat Medic"
    ],
    "traits": [
      "Field Triage",
      "Combat Medic"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Field Medic\n\n\nProvides emergency medical care under fire. Proficient in both combat and medicine.\n\n*You hold the line between life and death. When the armor fails and the screaming starts, you are the calm in the chaos. You possess the steady hands to stitch a wound while dodging plasma fire.*\n\n*\"I decide who walks away from this. Don't make me regret choosing you.\"*\n\n  - **Core Concept:** Healer / Light Infantry\n  - **Recommended Occupations:** Soldier, Specialist.\n  - **Recommended Origins:** Militaristic, Colony, Spacer.\n  - **Recommended Factions:** Coalition (Combat Medics), Auluran (Healer Caste), Outworlds (Sawbones).\n  - **Key Attributes:** Wisdom (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Medicine, Athletics, Combat (Rifle/Pistol).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Field Triage, Combat Medic.\n  - **Tactical Role:** Keep the tank alive, revive downed allies, provide light fire support.",
    "full_text": "# The Field Medic\n\n\nProvides emergency medical care under fire. Proficient in both combat and medicine.\n\n*You hold the line between life and death. When the armor fails and the screaming starts, you are the calm in the chaos. You possess the steady hands to stitch a wound while dodging plasma fire.*\n\n*\"I decide who walks away from this. Don't make me regret choosing you.\"*\n\n  - **Core Concept:** Healer / Light Infantry\n  - **Recommended Occupations:** Soldier, Specialist.\n  - **Recommended Origins:** Militaristic, Colony, Spacer.\n  - **Recommended Factions:** Coalition (Combat Medics), Auluran (Healer Caste), Outworlds (Sawbones).\n  - **Key Attributes:** Wisdom (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Medicine, Athletics, Combat (Rifle/Pistol).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Field Triage, Combat Medic.\n  - **Tactical Role:** Keep the tank alive, revive downed allies, provide light fire support."
  },
  {
    "id": "archetype-foreman",
    "name": "The Foreman",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A stern and authoritative leader who oversees the workforce and ensures that production targets are met.",
    "flavor": "You are the iron fist of industry. You manage personnel and resources with ruthless efficiency, ensuring the job gets done regardless of the obstacles. Your word is law on the factory floor.",
    "quote": "\"The schedule is not a suggestion. Get back to work.\"",
    "core_concept": "Leadership / Logistics / Intimidation",
    "recommended_occupations": [
      "Citizen (Worker)",
      "Builder"
    ],
    "recommended_origins": [
      "Industrial",
      "Colony",
      "Urban"
    ],
    "recommended_factions": [
      "Syndicate (Labor Oversight)",
      "Outworlds (Mine Bosses)",
      "Impyrium"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Stamina",
    "key_attributes": "Charisma (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Intimidation",
      "Leadership",
      "Diplomacy",
      "Vocation (Administrator)"
    ],
    "signature_features": [
      "Commanding Presence",
      "Efficient Manager"
    ],
    "tactical_role": "Organizing NPC labor, intimidating local workers, managing base construction.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A stern and authoritative leader who oversees the workforce and ensures that production targets are met.\n\n*You are the iron fist of industry. You manage personnel and resources with ruthless efficiency, ensuring the job gets done regardless of the obstacles. Your word is law on the factory floor.*\n\n_\"The schedule is not a suggestion. Get back to work.\"_",
    "keywords": "foreman, sentinel, defender, stability, order, leadership, logistics",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler, anti-social, mute",
    "signature_traits": [
      "Commanding Presence",
      "Efficient Manager"
    ],
    "traits": [
      "Commanding Presence",
      "Efficient Manager"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Foreman\n\n\nA stern and authoritative leader who oversees the workforce and ensures that production targets are met.\n\n*You are the iron fist of industry. You manage personnel and resources with ruthless efficiency, ensuring the job gets done regardless of the obstacles. Your word is law on the factory floor.*\n\n*\"The schedule is not a suggestion. Get back to work.\"*\n\n  - **Core Concept:** Leadership / Logistics / Intimidation\n  - **Recommended Occupations:** Citizen (Worker), Builder.\n  - **Recommended Origins:** Industrial, Colony, Urban.\n  - **Recommended Factions:** Syndicate (Labor Oversight), Outworlds (Mine Bosses), Impyrium.\n  - **Key Attributes:** Charisma (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Leadership, Diplomacy, Vocation (Administrator).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Commanding Presence, Efficient Manager.\n  - **Tactical Role:** Organizing NPC labor, intimidating local workers, managing base construction.",
    "full_text": "# The Foreman\n\n\nA stern and authoritative leader who oversees the workforce and ensures that production targets are met.\n\n*You are the iron fist of industry. You manage personnel and resources with ruthless efficiency, ensuring the job gets done regardless of the obstacles. Your word is law on the factory floor.*\n\n*\"The schedule is not a suggestion. Get back to work.\"*\n\n  - **Core Concept:** Leadership / Logistics / Intimidation\n  - **Recommended Occupations:** Citizen (Worker), Builder.\n  - **Recommended Origins:** Industrial, Colony, Urban.\n  - **Recommended Factions:** Syndicate (Labor Oversight), Outworlds (Mine Bosses), Impyrium.\n  - **Key Attributes:** Charisma (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Leadership, Diplomacy, Vocation (Administrator).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Commanding Presence, Efficient Manager.\n  - **Tactical Role:** Organizing NPC labor, intimidating local workers, managing base construction."
  },
  {
    "id": "archetype-high-commander",
    "name": "The High Commander",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A high-ranking military commander who leads legions into battle.",
    "flavor": "You are the architect of victory. You see the battlefield as a chessboard, moving units with precision and foresight. Your presence inspires discipline and courage in the face of overwhelming odds.",
    "quote": "\"Victory is not an accident. It is engineered.\"",
    "core_concept": "Leadership / Strategy / Buff",
    "recommended_occupations": [
      "Soldier (Officer)",
      "Noble"
    ],
    "recommended_origins": [
      "Militaristic",
      "Urban (Capital)"
    ],
    "recommended_factions": [
      "Impyrium (High Command)",
      "Dynasty (High Lord)"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Charisma",
    "key_attributes": "Intellect (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Leadership",
      "Knowledge (Tactics)",
      "Athletics",
      "Combat (Any)"
    ],
    "signature_features": [
      "Tactical Mastery",
      "Inspiring Strategist"
    ],
    "tactical_role": "Mass buffing allies, coordinating large-scale battles, strategic planning.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A high-ranking military commander who leads legions into battle.\n\n*You are the architect of victory. You see the battlefield as a chessboard, moving units with precision and foresight. Your presence inspires discipline and courage in the face of overwhelming odds.*\n\n_\"Victory is not an accident. It is engineered.\"_",
    "keywords": "high commander, sentinel, defender, stability, order, leadership, strategy",
    "negative_keywords": "mindless-brute, reckless, illiterate, chaotic-anarchist, unreliable",
    "signature_traits": [
      "Tactical Mastery",
      "Inspiring Strategist"
    ],
    "traits": [
      "Tactical Mastery",
      "Inspiring Strategist"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The High Commander\n\n\nA high-ranking military commander who leads legions into battle.\n\n*You are the architect of victory. You see the battlefield as a chessboard, moving units with precision and foresight. Your presence inspires discipline and courage in the face of overwhelming odds.*\n\n*\"Victory is not an accident. It is engineered.\"*\n\n  - **Core Concept:** Leadership / Strategy / Buff\n  - **Recommended Occupations:** Soldier (Officer), Representative (*Noble*).\n  - **Recommended Origins:** Militaristic, Urban (Capital).\n  - **Recommended Factions:** Impyrium (High Command), Dynasty (High Lord).\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Knowledge (Tactics), Athletics, Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Tactical Mastery, Inspiring Strategist.\n  - **Tactical Role:** Mass buffing allies, coordinating large-scale battles, strategic planning.",
    "full_text": "# The High Commander\n\n\nA high-ranking military commander who leads legions into battle.\n\n*You are the architect of victory. You see the battlefield as a chessboard, moving units with precision and foresight. Your presence inspires discipline and courage in the face of overwhelming odds.*\n\n*\"Victory is not an accident. It is engineered.\"*\n\n  - **Core Concept:** Leadership / Strategy / Buff\n  - **Recommended Occupations:** Soldier (Officer), Representative (*Noble*).\n  - **Recommended Origins:** Militaristic, Urban (Capital).\n  - **Recommended Factions:** Impyrium (High Command), Dynasty (High Lord).\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Knowledge (Tactics), Athletics, Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Tactical Mastery, Inspiring Strategist.\n  - **Tactical Role:** Mass buffing allies, coordinating large-scale battles, strategic planning."
  },
  {
    "id": "archetype-homesteader",
    "name": "The Homesteader",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A hardworking and resourceful individual determined to build a life on the frontier.",
    "flavor": "You tame the land. You don't need a replicator or a supermarket; you build what you need from the dirt up. You are the foundation upon which colonies are built, enduring where others would starve.",
    "quote": "\"This land is hard, but I am harder.\"",
    "core_concept": "Survival / Crafter / Base Builder",
    "recommended_occupations": [
      "Citizen (Colonist)",
      "Scout"
    ],
    "recommended_origins": [
      "Agricultural",
      "Colony",
      "Hostile"
    ],
    "recommended_factions": [
      "Outworlds (Colonists)",
      "Coalition (Settlers)",
      "Dracon Dynasty (Peasantry)"
    ],
    "primary_attribute": "Stamina",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Stamina (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Survival)",
      "Vocation (Farming/Laborer)",
      "Vocation (Handler)",
      "Knowledge (Nature)"
    ],
    "signature_features": [
      "Self-Sufficiency",
      "Resourceful"
    ],
    "tactical_role": "Generating food/water, building fortifications, animal taming.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A hardworking and resourceful individual determined to build a life on the frontier.\n\n*You tame the land. You don't need a replicator or a supermarket; you build what you need from the dirt up. You are the foundation upon which colonies are built, enduring where others would starve.*\n\n_\"This land is hard, but I am harder.\"_",
    "keywords": "homesteader, sentinel, defender, stability, order, survival, crafter",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Self-Sufficiency",
      "Resourceful"
    ],
    "traits": [
      "Self-Sufficiency",
      "Resourceful"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Homesteader\n\n\nA hardworking and resourceful individual determined to build a life on the frontier.\n\n*You tame the land. You don't need a replicator or a supermarket; you build what you need from the dirt up. You are the foundation upon which colonies are built, enduring where others would starve.*\n\n*\"This land is hard, but I am harder.\"*\n\n  - **Core Concept:** Survival / Crafter / Base Builder\n  - **Recommended Occupations:** Citizen (Colonist), Scout.\n  - **Recommended Origins:** Agricultural, Colony, Hostile.\n  - **Recommended Factions:** Outworlds (Colonists), Coalition (Settlers), Dracon Dynasty (Peasantry).\n  - **Key Attributes:** Stamina (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Vocation (Farming/Laborer), Vocation (Handler), Knowledge (Nature).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Self-Sufficiency, Resourceful.\n  - **Tactical Role:** Generating food/water, building fortifications, animal taming.",
    "full_text": "# The Homesteader\n\n\nA hardworking and resourceful individual determined to build a life on the frontier.\n\n*You tame the land. You don't need a replicator or a supermarket; you build what you need from the dirt up. You are the foundation upon which colonies are built, enduring where others would starve.*\n\n*\"This land is hard, but I am harder.\"*\n\n  - **Core Concept:** Survival / Crafter / Base Builder\n  - **Recommended Occupations:** Citizen (Colonist), Scout.\n  - **Recommended Origins:** Agricultural, Colony, Hostile.\n  - **Recommended Factions:** Outworlds (Colonists), Coalition (Settlers), Dracon Dynasty (Peasantry).\n  - **Key Attributes:** Stamina (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Vocation (Farming/Laborer), Vocation (Handler), Knowledge (Nature).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Self-Sufficiency, Resourceful.\n  - **Tactical Role:** Generating food/water, building fortifications, animal taming."
  },
  {
    "id": "archetype-legionnaire",
    "name": "The Legionnaire",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A disciplined and loyal soldier who serves in the Impyrium's legions. Expert in formation warfare.",
    "flavor": "You are a brick in the wall of the Empire. You fight not as an individual, but as a unit, locking shields and advancing with the inexorable weight of history behind you.",
    "quote": "\"Strength in unity. Victory in discipline.\"",
    "core_concept": "Tank / Formation Fighter / Discipline",
    "recommended_occupations": [
      "Soldier (Impyrium)",
      "Representative"
    ],
    "recommended_origins": [
      "Militaristic",
      "Urban (Capital)"
    ],
    "recommended_factions": [
      "Impyrium (Imperial Legion)",
      "Dynasty (Dragoons)"
    ],
    "primary_attribute": "Stamina",
    "secondary_attribute": "Strength",
    "key_attributes": "Stamina (Primary), Strength (Secondary).",
    "essential_skills": [
      "Athletics",
      "Intimidation",
      "Knowledge (Tactics)",
      "Combat (Melee/Heavy)"
    ],
    "signature_features": [
      "Iron Will",
      "Legionary Training"
    ],
    "tactical_role": "Holding choke points, soaking damage, providing cover bonuses to allies.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A disciplined and loyal soldier who serves in the Impyrium's legions. Expert in formation warfare.\n\n*You are a brick in the wall of the Empire. You fight not as an individual, but as a unit, locking shields and advancing with the inexorable weight of history behind you.*\n\n_\"Strength in unity. Victory in discipline.\"_",
    "keywords": "legionnaire, sentinel, defender, stability, order, tank, formation fighter",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, chaotic-anarchist",
    "signature_traits": [
      "Iron Will",
      "Legionary Training"
    ],
    "traits": [
      "Iron Will",
      "Legionary Training"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Legionnaire\n\n\nA disciplined and loyal soldier who serves in the Impyrium's legions. Expert in formation warfare.\n\n*You are a brick in the wall of the Empire. You fight not as an individual, but as a unit, locking shields and advancing with the inexorable weight of history behind you.*\n\n*\"Strength in unity. Victory in discipline.\"*\n\n  - **Core Concept:** Tank / Formation Fighter / Discipline\n  - **Recommended Occupations:** Soldier (Impyrium), Representative.\n  - **Recommended Origins:** Militaristic, Urban (Capital).\n  - **Recommended Factions:** Impyrium (Imperial Legion), Dynasty (Dragoons).\n  - **Key Attributes:** Stamina (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Intimidation, Knowledge (Tactics), Combat (Melee/Heavy).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Iron Will, Legionary Training.\n  - **Tactical Role:** Holding choke points, soaking damage, providing cover bonuses to allies.",
    "full_text": "# The Legionnaire\n\n\nA disciplined and loyal soldier who serves in the Impyrium's legions. Expert in formation warfare.\n\n*You are a brick in the wall of the Empire. You fight not as an individual, but as a unit, locking shields and advancing with the inexorable weight of history behind you.*\n\n*\"Strength in unity. Victory in discipline.\"*\n\n  - **Core Concept:** Tank / Formation Fighter / Discipline\n  - **Recommended Occupations:** Soldier (Impyrium), Representative.\n  - **Recommended Origins:** Militaristic, Urban (Capital).\n  - **Recommended Factions:** Impyrium (Imperial Legion), Dynasty (Dragoons).\n  - **Key Attributes:** Stamina (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Intimidation, Knowledge (Tactics), Combat (Melee/Heavy).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Iron Will, Legionary Training.\n  - **Tactical Role:** Holding choke points, soaking damage, providing cover bonuses to allies."
  },
  {
    "id": "archetype-maintenance-chief",
    "name": "The Maintenance Chief",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "The veteran technician who keeps massive infrastructure systems online under impossible conditions.",
    "flavor": "You are the caretaker of the megastructure. You know the vibrations of the gravity core and the scent of a failing oxygen scrubber. You speak the language of the machine and it answers.",
    "quote": "\"She's a bit cranky today, but I've got her settled.\"",
    "core_concept": "Support / Repair / Logistics",
    "recommended_occupations": [
      "Builder",
      "Spacer"
    ],
    "recommended_origins": [
      "Industrial",
      "Spacer",
      "Urban"
    ],
    "recommended_factions": [
      "Mekan (Maintenance Hubs)",
      "Syndicate (Grid Techs)",
      "Impyrium"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Agility",
    "key_attributes": "Intellect (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Vocation (Engineer)",
      "Alertness",
      "Vocation (Management)"
    ],
    "signature_features": [
      "Efficient Manager",
      "Technical Aptitude"
    ],
    "tactical_role": "Maintaining base infrastructure, rapid field repair of vehicles, bypassing industrial locks.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The veteran technician who keeps massive infrastructure systems online under impossible conditions.\n\n*You are the caretaker of the megastructure. You know the vibrations of the gravity core and the scent of a failing oxygen scrubber. You speak the language of the machine and it answers.*\n\n_\"She's a bit cranky today, but I've got her settled.\"_",
    "keywords": "maintenance chief, sentinel, defender, stability, order, support, repair",
    "negative_keywords": "mindless-brute, reckless, illiterate, chaotic-anarchist, unreliable",
    "signature_traits": [
      "Efficient Manager",
      "Technical Aptitude"
    ],
    "traits": [
      "Efficient Manager",
      "Technical Aptitude"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Maintenance Chief\n\n\nThe veteran technician who keeps massive infrastructure systems online under impossible conditions.\n\n*You are the caretaker of the megastructure. You know the vibrations of the gravity core and the scent of a failing oxygen scrubber. You speak the language of the machine and it answers.*\n\n*\"She's a bit cranky today, but I've got her settled.\"*\n\n  - **Core Concept:** Support / Repair / Logistics\n  - **Recommended Occupations:** Builder, Spacer.\n  - **Recommended Origins:** Industrial, Spacer, Urban.\n  - **Recommended Factions:** Mekan (Maintenance Hubs), Syndicate (Grid Techs), Impyrium.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Engineer), Alertness, Vocation (Administrator).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Efficient Manager, Technical Aptitude.\n  - **Tactical Role:** Maintaining base infrastructure, rapid field repair of vehicles, bypassing industrial locks.",
    "full_text": "# The Maintenance Chief\n\n\nThe veteran technician who keeps massive infrastructure systems online under impossible conditions.\n\n*You are the caretaker of the megastructure. You know the vibrations of the gravity core and the scent of a failing oxygen scrubber. You speak the language of the machine and it answers.*\n\n*\"She's a bit cranky today, but I've got her settled.\"*\n\n  - **Core Concept:** Support / Repair / Logistics\n  - **Recommended Occupations:** Builder, Spacer.\n  - **Recommended Origins:** Industrial, Spacer, Urban.\n  - **Recommended Factions:** Mekan (Maintenance Hubs), Syndicate (Grid Techs), Impyrium.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Engineer), Alertness, Vocation (Administrator).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Efficient Manager, Technical Aptitude.\n  - **Tactical Role:** Maintaining base infrastructure, rapid field repair of vehicles, bypassing industrial locks."
  },
  {
    "id": "archetype-marshal",
    "name": "The Marshal",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A law enforcement officer who maintains order and protects settlements in the lawless territories.",
    "flavor": "You are the law where there is no law. You carry authority in your bearing and justice in your holster. You stand between the town and the chaos, enforcing order through reputation and resolve.",
    "quote": "\"The law doesn't stop at the city limits. It stops where I say it stops.\"",
    "core_concept": "Social / Combat / Crowd Control",
    "recommended_occupations": [
      "Soldier",
      "Agent"
    ],
    "recommended_origins": [
      "Colony",
      "Hostile",
      "Militaristic"
    ],
    "recommended_factions": [
      "Coalition (Rangers)",
      "Outworlds (Sheriffs)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Intimidation",
      "Diplomacy",
      "Athletics",
      "Combat (Pistol)"
    ],
    "signature_features": [
      "Frontier Justice",
      "Wildstalker"
    ],
    "tactical_role": "De-escalating conflicts, arresting targets, tracking fugitives.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A law enforcement officer who maintains order and protects settlements in the lawless territories.\n\n*You are the law where there is no law. You carry authority in your bearing and justice in your holster. You stand between the town and the chaos, enforcing order through reputation and resolve.*\n\n_\"The law doesn't stop at the city limits. It stops where I say it stops.\"_",
    "keywords": "marshal, sentinel, defender, stability, order, social, combat",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Frontier Justice",
      "Wildstalker"
    ],
    "traits": [
      "Frontier Justice",
      "Wildstalker"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Marshal\n\n\nA law enforcement officer who maintains order and protects settlements in the lawless territories.\n\n*You are the law where there is no law. You carry authority in your bearing and justice in your holster. You stand between the town and the chaos, enforcing order through reputation and resolve.*\n\n*\"The law doesn't stop at the city limits. It stops where I say it stops.\"*\n\n  - **Core Concept:** Social / Combat / Crowd Control\n  - **Recommended Occupations:** Soldier, Agent.\n  - **Recommended Origins:** Colony, Hostile, Militaristic.\n  - **Recommended Factions:** Coalition (Rangers), Outworlds (Sheriffs).\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Diplomacy, Athletics, Combat (Pistol).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Frontier Justice, Wildstalker.\n  - **Tactical Role:** De-escalating conflicts, arresting targets, tracking fugitives.",
    "full_text": "# The Marshal\n\n\nA law enforcement officer who maintains order and protects settlements in the lawless territories.\n\n*You are the law where there is no law. You carry authority in your bearing and justice in your holster. You stand between the town and the chaos, enforcing order through reputation and resolve.*\n\n*\"The law doesn't stop at the city limits. It stops where I say it stops.\"*\n\n  - **Core Concept:** Social / Combat / Crowd Control\n  - **Recommended Occupations:** Soldier, Agent.\n  - **Recommended Origins:** Colony, Hostile, Militaristic.\n  - **Recommended Factions:** Coalition (Rangers), Outworlds (Sheriffs).\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Diplomacy, Athletics, Combat (Pistol).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Frontier Justice, Wildstalker.\n  - **Tactical Role:** De-escalating conflicts, arresting targets, tracking fugitives."
  },
  {
    "id": "archetype-munitions-magnate",
    "name": "The Munitions Magnate",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "Focuses on the trade of weapons and military equipment. They have access to cutting-edge technology and sell it at a premium.",
    "flavor": "You understand that peace is expensive, but war is profitable. You are the ultimate enabler, providing the tools of destruction that topple regimes. You are never outgunned because you supply the guns.",
    "quote": "\"I don't pull the trigger. I just ensure it works when you do.\"",
    "core_concept": "Merchant / Tech / Heavy Support",
    "recommended_occupations": [
      "Merchant",
      "Criminal"
    ],
    "recommended_origins": [
      "Industrial",
      "Urban",
      "Militaristic"
    ],
    "recommended_factions": [
      "Syndicate (Arms Division)",
      "Coalition (Gun-Runners)",
      "Impyrium (Heirloom Brokers)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Insight",
      "Knowledge (Technology)",
      "Streetwise"
    ],
    "signature_features": [
      "Weapons Expert",
      "Black Market Connections"
    ],
    "tactical_role": "Supply the team with top-tier gear, identify enemy weaponry, negotiate with warlords.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Focuses on the trade of weapons and military equipment. They have access to cutting-edge technology and sell it at a premium.\n\n*You understand that peace is expensive, but war is profitable. You are the ultimate enabler, providing the tools of destruction that topple regimes. You are never outgunned because you supply the guns.*\n\n_\"I don't pull the trigger. I just ensure it works when you do.\"_",
    "keywords": "munitions magnate, sentinel, defender, stability, order, merchant, tech",
    "negative_keywords": "mindless-brute, reckless, illiterate, chaotic-anarchist, unreliable",
    "signature_traits": [
      "Weapons Expert",
      "Black Market Connections"
    ],
    "traits": [
      "Weapons Expert",
      "Black Market Connections"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Munitions Magnate\n\n\nFocuses on the trade of weapons and military equipment. They have access to cutting-edge technology and sell it at a premium.\n\n*You understand that peace is expensive, but war is profitable. You are the ultimate enabler, providing the tools of destruction that topple regimes. You are never outgunned because you supply the guns.*\n\n*\"I don't pull the trigger. I just ensure it works when you do.\"*\n\n  - **Core Concept:** Merchant / Tech / Heavy Support\n  - **Recommended Occupations:** Merchant, Criminal.\n  - **Recommended Origins:** Industrial, Urban, Militaristic.\n  - **Recommended Factions:** Syndicate (Arms Division), Coalition (Gun-Runners), Impyrium (Heirloom Brokers).\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (Technology), Streetwise.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Weapons Expert, Black Market Connections.\n  - **Tactical Role:** Supply the team with top-tier gear, identify enemy weaponry, negotiate with warlords.",
    "full_text": "# The Munitions Magnate\n\n\nFocuses on the trade of weapons and military equipment. They have access to cutting-edge technology and sell it at a premium.\n\n*You understand that peace is expensive, but war is profitable. You are the ultimate enabler, providing the tools of destruction that topple regimes. You are never outgunned because you supply the guns.*\n\n*\"I don't pull the trigger. I just ensure it works when you do.\"*\n\n  - **Core Concept:** Merchant / Tech / Heavy Support\n  - **Recommended Occupations:** Merchant, Criminal.\n  - **Recommended Origins:** Industrial, Urban, Militaristic.\n  - **Recommended Factions:** Syndicate (Arms Division), Coalition (Gun-Runners), Impyrium (Heirloom Brokers).\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (Technology), Streetwise.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Weapons Expert, Black Market Connections.\n  - **Tactical Role:** Supply the team with top-tier gear, identify enemy weaponry, negotiate with warlords."
  },
  {
    "id": "archetype-muscle",
    "name": "The Muscle",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A hardworking individual contributing through physical labor and endurance.",
    "flavor": "You are the strength that builds empires. You lift, carry, and endure. When machines fail or finesse is not enough, you provide the raw power to move the world.",
    "quote": "\"Heavy lifting? That's just a warm-up.\"",
    "core_concept": "Utility / Strength / Endurance",
    "recommended_occupations": [
      "Citizen",
      "Builder"
    ],
    "recommended_origins": [
      "Industrial",
      "Colony",
      "Urban"
    ],
    "recommended_factions": [
      "Syndicate (Worker Caste)",
      "Outworlds",
      "Mekan (Drones)"
    ],
    "primary_attribute": "Strength",
    "secondary_attribute": "Stamina",
    "key_attributes": "Strength (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Athletics",
      "Vocation (Laborer)",
      "Endurance",
      "Knowledge (Trade)"
    ],
    "signature_features": [
      "Strong Back",
      "Skilled Worker"
    ],
    "tactical_role": "Clearing debris, carrying heavy gear, grappling enemies.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A hardworking individual contributing through physical labor and endurance.\n\n*You are the strength that builds empires. You lift, carry, and endure. When machines fail or finesse is not enough, you provide the raw power to move the world.*\n\n_\"Heavy lifting? That's just a warm-up.\"_",
    "keywords": "muscle, sentinel, defender, stability, order, utility, strength",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Strong Back",
      "Skilled Worker"
    ],
    "traits": [
      "Strong Back",
      "Skilled Worker"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Muscle\n\n\nA hardworking individual contributing through physical labor and endurance.\n\n*You are the strength that builds empires. You lift, carry, and endure. When machines fail or finesse is not enough, you provide the raw power to move the world.*\n\n*\"Heavy lifting? That's just a warm-up.\"*\n\n  - **Core Concept:** Utility / Strength / Endurance\n  - **Recommended Occupations:** Citizen, Builder.\n  - **Recommended Origins:** Industrial, Colony, Urban.\n  - **Recommended Factions:** Syndicate (Worker Caste), Outworlds, Mekan (Drones).\n  - **Key Attributes:** Strength (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Vocation (Laborer), Unarmed (*Endurance Feature recommended*), Knowledge (Trade).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Strong Back, Skilled Worker.\n  - **Tactical Role:** Clearing debris, carrying heavy gear, grappling enemies.",
    "full_text": "# The Muscle\n\n\nA hardworking individual contributing through physical labor and endurance.\n\n*You are the strength that builds empires. You lift, carry, and endure. When machines fail or finesse is not enough, you provide the raw power to move the world.*\n\n*\"Heavy lifting? That's just a warm-up.\"*\n\n  - **Core Concept:** Utility / Strength / Endurance\n  - **Recommended Occupations:** Citizen, Builder.\n  - **Recommended Origins:** Industrial, Colony, Urban.\n  - **Recommended Factions:** Syndicate (Worker Caste), Outworlds, Mekan (Drones).\n  - **Key Attributes:** Strength (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Vocation (Laborer), Unarmed (*Endurance Feature recommended*), Knowledge (Trade).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Strong Back, Skilled Worker.\n  - **Tactical Role:** Clearing debris, carrying heavy gear, grappling enemies."
  },
  {
    "id": "archetype-protector",
    "name": "The Protector",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "Protects high-profile individuals or cargo. Experienced in personal security and close-quarters combat.",
    "flavor": "You are the wall that refuses to break. Your job isn't to kill the enemy; it's to make sure your charge survives to see tomorrow. In a universe of assassins and snipers, your vigilance is the only thing keeping the mission alive.",
    "quote": "\"Get behind me.\"",
    "core_concept": "Tank / Defender / Interceptor",
    "recommended_occupations": [
      "Soldier",
      "Drifter"
    ],
    "recommended_origins": [
      "Urban",
      "Militaristic",
      "Leisure"
    ],
    "recommended_factions": [
      "Impyrium (Praetorians)",
      "Dynasty (House Guard)",
      "Syndicate (Asset Protection)"
    ],
    "primary_attribute": "Stamina",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Stamina (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Athletics",
      "Alertness",
      "Intimidation",
      "Combat (Melee/Pistol)"
    ],
    "signature_features": [
      "Protective Stance",
      "Situational Awareness"
    ],
    "tactical_role": "Take damage for the team, control melee engagement zones.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Protects high-profile individuals or cargo. Experienced in personal security and close-quarters combat.\n\n*You are the wall that refuses to break. Your job isn't to kill the enemy; it's to make sure your charge survives to see tomorrow. In a universe of assassins and snipers, your vigilance is the only thing keeping the mission alive.*\n\n_\"Get behind me.\"_",
    "keywords": "protector, sentinel, defender, stability, order, tank, interceptor",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, chaotic-anarchist",
    "signature_traits": [
      "Protective Stance",
      "Situational Awareness"
    ],
    "traits": [
      "Protective Stance",
      "Situational Awareness"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Protector\n\n\nProtects high-profile individuals or cargo. Experienced in personal security and close-quarters combat.\n\n*You are the wall that refuses to break. Your job isn't to kill the enemy; it's to make sure your charge survives to see tomorrow. In a universe of assassins and snipers, your vigilance is the only thing keeping the mission alive.*\n\n*\"Get behind me.\"*\n\n  - **Core Concept:** Tank / Defender / Interceptor\n  - **Recommended Occupations:** Soldier, Drifter.\n  - **Recommended Origins:** Urban, Militaristic, Leisure.\n  - **Recommended Factions:** Impyrium (Praetorians), Dynasty (House Guard), Syndicate (Asset Protection).\n  - **Key Attributes:** Stamina (+3 Primary), Wisdom / Alertness (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Alertness, Intimidation, Combat (Melee/Pistol).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Protective Stance, Situational Alertness.\n  - **Tactical Role:** Take damage for the team, control melee engagement zones.",
    "full_text": "# The Protector\n\n\nProtects high-profile individuals or cargo. Experienced in personal security and close-quarters combat.\n\n*You are the wall that refuses to break. Your job isn't to kill the enemy; it's to make sure your charge survives to see tomorrow. In a universe of assassins and snipers, your vigilance is the only thing keeping the mission alive.*\n\n*\"Get behind me.\"*\n\n  - **Core Concept:** Tank / Defender / Interceptor\n  - **Recommended Occupations:** Soldier, Drifter.\n  - **Recommended Origins:** Urban, Militaristic, Leisure.\n  - **Recommended Factions:** Impyrium (Praetorians), Dynasty (House Guard), Syndicate (Asset Protection).\n  - **Key Attributes:** Stamina (+3 Primary), Wisdom / Alertness (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Alertness, Intimidation, Combat (Melee/Pistol).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Protective Stance, Situational Alertness.\n  - **Tactical Role:** Take damage for the team, control melee engagement zones."
  },
  {
    "id": "archetype-quartermaster",
    "name": "The Quartermaster",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A resourceful individual who manages supplies, equipment, and finances.",
    "flavor": "You make sure the guns have ammo and the engines have fuel. You are the master of inventory, finding value in scrap and ensuring the team is never caught empty-handed.",
    "quote": "\"A soldier without bullets is just a target. I make sure you aren't targets.\"",
    "core_concept": "Economy / Support / Logistics",
    "recommended_occupations": [
      "Merchant",
      "Soldier"
    ],
    "recommended_origins": [
      "Militaristic",
      "Spacer",
      "Industrial"
    ],
    "recommended_factions": [
      "Outworlds (Scavengers)",
      "Impyrium (Logistics)",
      "Syndicate (Supply)"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Knowledge (Appraisal)",
      "Knowledge (Logistics)",
      "Barter"
    ],
    "signature_features": [
      "Resourceful",
      "Master of Logistics"
    ],
    "tactical_role": "Managing party inventory, sourcing specific gear, identifying loot value.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A resourceful individual who manages supplies, equipment, and finances.\n\n*You make sure the guns have ammo and the engines have fuel. You are the master of inventory, finding value in scrap and ensuring the team is never caught empty-handed.*\n\n_\"A soldier without bullets is just a target. I make sure you aren't targets.\"_",
    "keywords": "quartermaster, sentinel, defender, stability, order, economy, support",
    "negative_keywords": "mindless-brute, reckless, illiterate, chaotic-anarchist, unreliable",
    "signature_traits": [
      "Resourceful",
      "Master of Logistics"
    ],
    "traits": [
      "Resourceful",
      "Master of Logistics"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Quartermaster\n\n\nA resourceful individual who manages supplies, equipment, and finances.\n\n*You make sure the guns have ammo and the engines have fuel. You are the master of inventory, finding value in scrap and ensuring the team is never caught empty-handed.*\n\n*\"A soldier without bullets is just a target. I make sure you aren't targets.\"*\n\n  - **Core Concept:** Economy / Support / Logistics\n  - **Recommended Occupations:** Merchant, Soldier.\n  - **Recommended Origins:** Militaristic, Spacer, Industrial.\n  - **Recommended Factions:** Outworlds (Scavengers), Impyrium (Logistics), Syndicate (Supply).\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Appraisal), Knowledge (Logistics), Barter.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Resourceful, Master of Logistics.\n  - **Tactical Role:** Managing party inventory, sourcing specific gear, identifying loot value.",
    "full_text": "# The Quartermaster\n\n\nA resourceful individual who manages supplies, equipment, and finances.\n\n*You make sure the guns have ammo and the engines have fuel. You are the master of inventory, finding value in scrap and ensuring the team is never caught empty-handed.*\n\n*\"A soldier without bullets is just a target. I make sure you aren't targets.\"*\n\n  - **Core Concept:** Economy / Support / Logistics\n  - **Recommended Occupations:** Merchant, Soldier.\n  - **Recommended Origins:** Militaristic, Spacer, Industrial.\n  - **Recommended Factions:** Outworlds (Scavengers), Impyrium (Logistics), Syndicate (Supply).\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Appraisal), Knowledge (Logistics), Barter.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Resourceful, Master of Logistics.\n  - **Tactical Role:** Managing party inventory, sourcing specific gear, identifying loot value."
  },
  {
    "id": "archetype-security-officer",
    "name": "The Security Officer",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A vigilant and disciplined individual who ensures the safety and security of their post.",
    "flavor": "You see what others miss. While they relax, you watch the exits. You are the first line of defense against infiltration and sabotage, securing the perimeter with professional detachment.",
    "quote": "\"Secure. For now.\"",
    "core_concept": "Perception / Defense / Area Denial",
    "recommended_occupations": [
      "Soldier",
      "Agent"
    ],
    "recommended_origins": [
      "Urban",
      "Industrial",
      "Leisure"
    ],
    "recommended_factions": [
      "Syndicate (Asset Protection)",
      "Entari Combine (Constables)"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Stamina",
    "key_attributes": "Wisdom (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Alertness",
      "Insight",
      "Intimidation",
      "Combat (Any)"
    ],
    "signature_features": [
      "Keen Eye",
      "Guardian"
    ],
    "tactical_role": "Preventing ambushes, spotting hidden enemies, locking down areas.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A vigilant and disciplined individual who ensures the safety and security of their post.\n\n*You see what others miss. While they relax, you watch the exits. You are the first line of defense against infiltration and sabotage, securing the perimeter with professional detachment.*\n\n_\"Secure. For now.\"_",
    "keywords": "security officer, sentinel, defender, stability, order, perception, defense",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Keen Eye",
      "Guardian"
    ],
    "traits": [
      "Keen Eye",
      "Guardian"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Security Officer\n\n\nA vigilant and disciplined individual who ensures the safety and security of their post.\n\n*You see what others miss. While they relax, you watch the exits. You are the first line of defense against infiltration and sabotage, securing the perimeter with professional detachment.*\n\n*\"Secure. For now.\"*\n\n  - **Core Concept:** Perception / Defense / Area Denial\n  - **Recommended Occupations:** Soldier, Agent.\n  - **Recommended Origins:** Urban, Industrial, Leisure.\n  - **Recommended Factions:** Syndicate (Asset Protection), Entari Combine (Constables).\n  - **Key Attributes:** Wisdom (+3 Primary), Wisdom / Alertness (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Alertness, Insight, Intimidation, Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Keen Eye, Guardian.\n  - **Tactical Role:** Preventing ambushes, spotting hidden enemies, locking down areas.",
    "full_text": "# The Security Officer\n\n\nA vigilant and disciplined individual who ensures the safety and security of their post.\n\n*You see what others miss. While they relax, you watch the exits. You are the first line of defense against infiltration and sabotage, securing the perimeter with professional detachment.*\n\n*\"Secure. For now.\"*\n\n  - **Core Concept:** Perception / Defense / Area Denial\n  - **Recommended Occupations:** Soldier, Agent.\n  - **Recommended Origins:** Urban, Industrial, Leisure.\n  - **Recommended Factions:** Syndicate (Asset Protection), Entari Combine (Constables).\n  - **Key Attributes:** Wisdom (+3 Primary), Wisdom / Alertness (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Alertness, Insight, Intimidation, Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Keen Eye, Guardian.\n  - **Tactical Role:** Preventing ambushes, spotting hidden enemies, locking down areas."
  },
  {
    "id": "archetype-settler",
    "name": "The Settler",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A hardy individual who builds and maintains settlements in untamed worlds.",
    "flavor": "You turn wilderness into home. You are skilled in the practical arts of construction and defense, creating safe havens in the most hostile environments.",
    "quote": "\"We built this town with our own hands. We'll defend it the same way.\"",
    "core_concept": "Builder / Defender / Survivor",
    "recommended_occupations": [
      "Citizen",
      "Builder"
    ],
    "recommended_origins": [
      "Colony",
      "Agricultural",
      "Hostile"
    ],
    "recommended_factions": [
      "Outworlds",
      "Coalition"
    ],
    "primary_attribute": "Stamina",
    "secondary_attribute": "Strength",
    "key_attributes": "Stamina (Primary), Strength (Secondary).",
    "essential_skills": [
      "Vocation (Laborer)",
      "Knowledge (Survival)",
      "Athletics",
      "Combat (Rifle)"
    ],
    "signature_features": [
      "Construction",
      "Frontier Resilience"
    ],
    "tactical_role": "Building cover, repairing structures, environmental survival.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A hardy individual who builds and maintains settlements in untamed worlds.\n\n*You turn wilderness into home. You are skilled in the practical arts of construction and defense, creating safe havens in the most hostile environments.*\n\n_\"We built this town with our own hands. We'll defend it the same way.\"_",
    "keywords": "settler, sentinel, defender, stability, order, builder, survivor",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Construction",
      "Frontier Resilience"
    ],
    "traits": [
      "Construction",
      "Frontier Resilience"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Settler\n\n\nA hardy individual who builds and maintains settlements in untamed worlds.\n\n*You turn wilderness into home. You are skilled in the practical arts of construction and defense, creating safe havens in the most hostile environments.*\n\n*\"We built this town with our own hands. We'll defend it the same way.\"*\n\n  - **Core Concept:** Builder / Defender / Survivor\n  - **Recommended Occupations:** Citizen, Builder.\n  - **Recommended Origins:** Colony, Agricultural, Hostile.\n  - **Recommended Factions:** Outworlds, Coalition.\n  - **Key Attributes:** Stamina (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Laborer), Knowledge (Survival), Athletics, Combat (Rifle).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Construction, Frontier Resilience.\n  - **Tactical Role:** Building cover, repairing structures, environmental survival.",
    "full_text": "# The Settler\n\n\nA hardy individual who builds and maintains settlements in untamed worlds.\n\n*You turn wilderness into home. You are skilled in the practical arts of construction and defense, creating safe havens in the most hostile environments.*\n\n*\"We built this town with our own hands. We'll defend it the same way.\"*\n\n  - **Core Concept:** Builder / Defender / Survivor\n  - **Recommended Occupations:** Citizen, Builder.\n  - **Recommended Origins:** Colony, Agricultural, Hostile.\n  - **Recommended Factions:** Outworlds, Coalition.\n  - **Key Attributes:** Stamina (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Laborer), Knowledge (Survival), Athletics, Combat (Rifle).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Construction, Frontier Resilience.\n  - **Tactical Role:** Building cover, repairing structures, environmental survival."
  },
  {
    "id": "archetype-shipmaster",
    "name": "The Shipmaster",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A seasoned starship captain who commands a vessel and crew with expertise in trade and safety.",
    "flavor": "You are the master of the trade lanes. You navigate the complex web of commerce and law, ensuring your ship and cargo arrive intact and on time. You are a steady hand on the tiller of enterprise.",
    "quote": "\"Time is money, and we are ahead of schedule.\"",
    "core_concept": "Logistics / Transport / Leadership",
    "recommended_occupations": [
      "Merchant",
      "Spacer"
    ],
    "recommended_origins": [
      "Spacer",
      "Urban",
      "Industrial"
    ],
    "recommended_factions": [
      "Outworlds (Freighters)",
      "Entari Combine (Trade Fleet)",
      "Syndicate"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Charisma",
    "key_attributes": "Intellect (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Leadership",
      "Diplomacy",
      "Knowledge (Trade)"
    ],
    "signature_features": [
      "Naval Expertise",
      "Commanding Presence"
    ],
    "tactical_role": "Managing ship operations, negotiating docking fees, avoiding piracy.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A seasoned starship captain who commands a vessel and crew with expertise in trade and safety.\n\n*You are the master of the trade lanes. You navigate the complex web of commerce and law, ensuring your ship and cargo arrive intact and on time. You are a steady hand on the tiller of enterprise.*\n\n_\"Time is money, and we are ahead of schedule.\"_",
    "keywords": "shipmaster, sentinel, defender, stability, order, logistics, transport",
    "negative_keywords": "mindless-brute, reckless, illiterate, chaotic-anarchist, unreliable",
    "signature_traits": [
      "Naval Expertise",
      "Commanding Presence"
    ],
    "traits": [
      "Naval Expertise",
      "Commanding Presence"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Shipmaster\n\n\nA seasoned starship captain who commands a vessel and crew with expertise in trade and safety.\n\n*You are the master of the trade lanes. You navigate the complex web of commerce and law, ensuring your ship and cargo arrive intact and on time. You are a steady hand on the tiller of enterprise.*\n\n*\"Time is money, and we are ahead of schedule.\"*\n\n  - **Core Concept:** Logistics / Transport / Leadership\n  - **Recommended Occupations:** Merchant, Spacer.\n  - **Recommended Origins:** Spacer, Urban, Industrial.\n  - **Recommended Factions:** Outworlds (Freighters), Entari Combine (Trade Fleet), Syndicate.\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Leadership, Diplomacy, Knowledge (Trade).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Naval Expertise, Commanding Presence.\n  - **Tactical Role:** Managing ship operations, negotiating docking fees, avoiding piracy.",
    "full_text": "# The Shipmaster\n\n\nA seasoned starship captain who commands a vessel and crew with expertise in trade and safety.\n\n*You are the master of the trade lanes. You navigate the complex web of commerce and law, ensuring your ship and cargo arrive intact and on time. You are a steady hand on the tiller of enterprise.*\n\n*\"Time is money, and we are ahead of schedule.\"*\n\n  - **Core Concept:** Logistics / Transport / Leadership\n  - **Recommended Occupations:** Merchant, Spacer.\n  - **Recommended Origins:** Spacer, Urban, Industrial.\n  - **Recommended Factions:** Outworlds (Freighters), Entari Combine (Trade Fleet), Syndicate.\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Leadership, Diplomacy, Knowledge (Trade).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Naval Expertise, Commanding Presence.\n  - **Tactical Role:** Managing ship operations, negotiating docking fees, avoiding piracy."
  },
  {
    "id": "archetype-shock-trooper",
    "name": "The Shock Trooper",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "Disciplined soldier serving on navy vessels. Expert in boarding actions and zero-g combat.",
    "flavor": "You fight where others freeze. Vacuum, zero-g, tight corridors—this is your home. You are the tip of the spear in ship-to-ship actions, breaching hulls and taking bridges while the universe tries to kill you.",
    "quote": "\"Gravity is a crutch. Mag-lock and load.\"",
    "core_concept": "Combat / Environmental Specialist",
    "recommended_occupations": [
      "Soldier",
      "Spacer"
    ],
    "recommended_origins": [
      "Spacer",
      "Militaristic",
      "Aquatic"
    ],
    "recommended_factions": [
      "Impyrium (Void Marines)",
      "Syndicate (Drop Troops)",
      "Dynasty (Knights)"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Strength",
    "key_attributes": "Agility (Primary), Strength (Secondary).",
    "essential_skills": [
      "Athletics",
      "Acrobatics",
      "Knowledge (Tactics)",
      "Combat"
    ],
    "signature_features": [
      "Zero-G Combat",
      "Boarding Party"
    ],
    "tactical_role": "Fighting in hazardous environments/vacuum, breaching ships.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Disciplined soldier serving on navy vessels. Expert in boarding actions and zero-g combat.\n\n*You fight where others freeze. Vacuum, zero-g, tight corridors—this is your home. You are the tip of the spear in ship-to-ship actions, breaching hulls and taking bridges while the universe tries to kill you.*\n\n_\"Gravity is a crutch. Mag-lock and load.\"_",
    "keywords": "shock trooper, sentinel, defender, stability, order, combat, environmental specialist",
    "negative_keywords": "chaotic-anarchist, unreliable, reckless-gambler",
    "signature_traits": [
      "Zero-G Combat",
      "Boarding Party"
    ],
    "traits": [
      "Zero-G Combat",
      "Boarding Party"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Shock Trooper\n\n\nDisciplined soldier serving on navy vessels. Expert in boarding actions and zero-g combat.\n\n*You fight where others freeze. Vacuum, zero-g, tight corridors—this is your home. You are the tip of the spear in ship-to-ship actions, breaching hulls and taking bridges while the universe tries to kill you.*\n\n*\"Gravity is a crutch. Mag-lock and load.\"*\n\n  - **Core Concept:** Combat / Environmental Specialist\n  - **Recommended Occupations:** Soldier, Spacer.\n  - **Recommended Origins:** Spacer, Militaristic, Aquatic.\n  - **Recommended Factions:** Impyrium (Void Marines), Syndicate (Drop Troops), Dynasty (Knights).\n  - **Key Attributes:** Agility (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Acrobatics, Knowledge (Tactics), Combat.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Zero-G Combat, Boarding Party.\n  - **Tactical Role:** Fighting in hazardous environments/vacuum, breaching ships.",
    "full_text": "# The Shock Trooper\n\n\nDisciplined soldier serving on navy vessels. Expert in boarding actions and zero-g combat.\n\n*You fight where others freeze. Vacuum, zero-g, tight corridors—this is your home. You are the tip of the spear in ship-to-ship actions, breaching hulls and taking bridges while the universe tries to kill you.*\n\n*\"Gravity is a crutch. Mag-lock and load.\"*\n\n  - **Core Concept:** Combat / Environmental Specialist\n  - **Recommended Occupations:** Soldier, Spacer.\n  - **Recommended Origins:** Spacer, Militaristic, Aquatic.\n  - **Recommended Factions:** Impyrium (Void Marines), Syndicate (Drop Troops), Dynasty (Knights).\n  - **Key Attributes:** Agility (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Acrobatics, Knowledge (Tactics), Combat.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Zero-G Combat, Boarding Party.\n  - **Tactical Role:** Fighting in hazardous environments/vacuum, breaching ships."
  },
  {
    "id": "archetype-veteran",
    "name": "The Veteran",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "Brave and disciplined, skilled in combat and tactics. The backbone of any fighting force.",
    "flavor": "You are the professional. You don't fight for glory or gold, but for the mission and the person next to you. You bring discipline, tactics, and unwavering resolve to a chaotic universe.",
    "quote": "\"Check your corners. Stay sharp. We move on my mark.\"",
    "core_concept": "DPS / Tank / Reliable",
    "recommended_occupations": [
      "Soldier",
      "Mercenary"
    ],
    "recommended_origins": [
      "Militaristic",
      "Hostile",
      "Colony"
    ],
    "recommended_factions": [
      "Coalition (Rangers)",
      "Dynasty (Men-at-Arms)",
      "Outworlds (Survivors)"
    ],
    "primary_attribute": "Strength",
    "secondary_attribute": "Stamina",
    "key_attributes": "Strength (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Acrobatics",
      "Alertness",
      "Athletics",
      "Combat (Any)"
    ],
    "signature_features": [
      "Combat Expertise",
      "Unflinching"
    ],
    "tactical_role": "Frontline combat, holding ground, reliable damage output.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Brave and disciplined, skilled in combat and tactics. The backbone of any fighting force.\n\n*You are the professional. You don't fight for glory or gold, but for the mission and the person next to you. You bring discipline, tactics, and unwavering resolve to a chaotic universe.*\n\n_\"Check your corners. Stay sharp. We move on my mark.\"_",
    "keywords": "veteran, sentinel, defender, stability, order, dps, tank",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, chaotic-anarchist",
    "signature_traits": [
      "Combat Expertise",
      "Unflinching"
    ],
    "traits": [
      "Combat Expertise",
      "Unflinching"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Veteran\n\n\nBrave and disciplined, skilled in combat and tactics. The backbone of any fighting force.\n\n*You are the professional. You don't fight for glory or gold, but for the mission and the person next to you. You bring discipline, tactics, and unwavering resolve to a chaotic universe.*\n\n*\"Check your corners. Stay sharp. We move on my mark.\"*\n\n  - **Core Concept:** DPS / Tank / Reliable\n  - **Recommended Occupations:** Soldier, Mercenary.\n  - **Recommended Origins:** Militaristic, Hostile, Colony.\n  - **Recommended Factions:** Coalition (Rangers), Dynasty (Men-at-Arms), Outworlds (Survivors).\n  - **Key Attributes:** Strength or Agility (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Alertness, Athletics, Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Combat Expertise, Unflinching.\n  - **Tactical Role:** Frontline combat, holding ground, reliable damage output.",
    "full_text": "# The Veteran\n\n\nBrave and disciplined, skilled in combat and tactics. The backbone of any fighting force.\n\n*You are the professional. You don't fight for glory or gold, but for the mission and the person next to you. You bring discipline, tactics, and unwavering resolve to a chaotic universe.*\n\n*\"Check your corners. Stay sharp. We move on my mark.\"*\n\n  - **Core Concept:** DPS / Tank / Reliable\n  - **Recommended Occupations:** Soldier, Mercenary.\n  - **Recommended Origins:** Militaristic, Hostile, Colony.\n  - **Recommended Factions:** Coalition (Rangers), Dynasty (Men-at-Arms), Outworlds (Survivors).\n  - **Key Attributes:** Strength or Agility (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Alertness, Athletics, Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Combat Expertise, Unflinching.\n  - **Tactical Role:** Frontline combat, holding ground, reliable damage output."
  },
  {
    "id": "archetype-warden",
    "name": "The Warden",
    "sphere": "Sentinels (The Stabilizers)",
    "summary": "A protector of forests and natural habitats, skilled in both magic and combat to defend the wild.",
    "flavor": "You are the immunity of the living world. You stand between the encroaching machine and the sacred grove, wielding the raw power of nature to crush those who would despoil it. You don't just fight for a cause; you fight for existence itself.",
    "quote": "\"The forest is not empty. It is merely holding its breath.\"",
    "core_concept": "Hybrid (Magic/Melee) / Defender",
    "recommended_occupations": [
      "Adept",
      "Scout (Fey/Auluran origins)"
    ],
    "recommended_origins": [
      "Agricultural",
      "Enlightened",
      "Hostile"
    ],
    "recommended_factions": [
      "Auluran (Protector Caste)",
      "Alterian Enclave (Rangers)",
      "Entari Combine (Gardeners)"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Strength",
    "key_attributes": "Wisdom (Primary), Strength (Secondary).",
    "essential_skills": [
      "Athletics",
      "Stealth",
      "Knowledge (Survival)",
      "Discipline (Entropy \\- Nature/Life focus)"
    ],
    "signature_features": [
      "Guardian's Ward",
      "Nature's Wrath"
    ],
    "tactical_role": "Off-tank, terrain manipulation, healing support.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A protector of forests and natural habitats, skilled in both magic and combat to defend the wild.\n\n*You are the immunity of the living world. You stand between the encroaching machine and the sacred grove, wielding the raw power of nature to crush those who would despoil it. You don't just fight for a cause; you fight for existence itself.*\n\n_\"The forest is not empty. It is merely holding its breath.\"_",
    "keywords": "warden, sentinel, defender, stability, order, hybrid (magic, melee)",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, chaotic-anarchist",
    "signature_traits": [
      "Guardian's Ward",
      "Nature's Wrath"
    ],
    "traits": [
      "Guardian's Ward",
      "Nature's Wrath"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Warden\n\n\nA protector of forests and natural habitats, skilled in both magic and combat to defend the wild.\n\n*You are the immunity of the living world. You stand between the encroaching machine and the sacred grove, wielding the raw power of nature to crush those who would despoil it. You don't just fight for a cause; you fight for existence itself.*\n\n*\"The forest is not empty. It is merely holding its breath.\"*\n\n  - **Core Concept:** Hybrid (Magic/Melee) / Defender\n  - **Recommended Occupations:** Adept, Scout (Fey/Auluran origins).\n  - **Recommended Origins:** Agricultural, Enlightened, Hostile.\n  - **Recommended Factions:** Auluran (Protector Caste), Alterian Enclave (Rangers), Entari Combine (Gardeners).\n  - **Key Attributes:** Wisdom (+3 Primary), Strength or Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Stealth, Knowledge (Survival), Discipline (Entropy - Nature/Life focus).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Guardian's Ward, Nature's Wrath.\n  - **Tactical Role:** Off-tank, terrain manipulation, healing support.",
    "full_text": "# The Warden\n\n\nA protector of forests and natural habitats, skilled in both magic and combat to defend the wild.\n\n*You are the immunity of the living world. You stand between the encroaching machine and the sacred grove, wielding the raw power of nature to crush those who would despoil it. You don't just fight for a cause; you fight for existence itself.*\n\n*\"The forest is not empty. It is merely holding its breath.\"*\n\n  - **Core Concept:** Hybrid (Magic/Melee) / Defender\n  - **Recommended Occupations:** Adept, Scout (Fey/Auluran origins).\n  - **Recommended Origins:** Agricultural, Enlightened, Hostile.\n  - **Recommended Factions:** Auluran (Protector Caste), Alterian Enclave (Rangers), Entari Combine (Gardeners).\n  - **Key Attributes:** Wisdom (+3 Primary), Strength or Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Stealth, Knowledge (Survival), Discipline (Entropy - Nature/Life focus).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Guardian's Ward, Nature's Wrath.\n  - **Tactical Role:** Off-tank, terrain manipulation, healing support."
  },
  {
    "id": "archetype-ace",
    "name": "The Ace",
    "sphere": "Operatives (The Artisans)",
    "summary": "Navigates starships through asteroids and blockades. Master of the stick.",
    "flavor": "You are the god of velocity. On the ground, you're just another grunt, but behind a yoke, you are untouchable. You weave through debris fields and dogfights with a grin, delivering the team exactly where they need to be.",
    "quote": "\"Hold on back there. I'm gonna try something stupid.\"",
    "core_concept": "Vehicle Specialist / Transport",
    "recommended_occupations": [
      "Spacer",
      "Specialist"
    ],
    "recommended_origins": [
      "Spacer",
      "Militaristic",
      "Industrial"
    ],
    "recommended_factions": [
      "Coalition (Smugglers)",
      "Ascendancy (Test Pilots)",
      "Syndicate (Interceptors)"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Intellect",
    "key_attributes": "Agility (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Pilot",
      "Alertness",
      "Combat (Gunnery)"
    ],
    "signature_features": [
      "Evasive Maneuvers",
      "Quick Reflexes"
    ],
    "tactical_role": "Ship combat, extraction, high-speed chases.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Navigates starships through asteroids and blockades. Master of the stick.\n\n*You are the god of velocity. On the ground, you're just another grunt, but behind a yoke, you are untouchable. You weave through debris fields and dogfights with a grin, delivering the team exactly where they need to be.*\n\n_\"Hold on back there. I'm gonna try something stupid.\"_",
    "keywords": "ace, operative, artisan, adaptable, specialist, vehicle specialist, transport",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Evasive Maneuvers",
      "Quick Reflexes"
    ],
    "traits": [
      "Evasive Maneuvers",
      "Quick Reflexes"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Ace\n\n\nNavigates starships through asteroids and blockades. Master of the stick.\n\n*You are the god of velocity. On the ground, you're just another grunt, but behind a yoke, you are untouchable. You weave through debris fields and dogfights with a grin, delivering the team exactly where they need to be.*\n\n*\"Hold on back there. I'm gonna try something stupid.\"*\n\n  - **Core Concept:** Vehicle Specialist / Transport\n  - **Recommended Occupations:** Spacer, Specialist.\n  - **Recommended Origins:** Spacer, Militaristic, Industrial.\n  - **Recommended Factions:** Coalition (Smugglers), Ascendancy (Test Pilots), Syndicate (Interceptors).\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Pilot, Alertness, Combat (Gunnery).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Evasive Maneuvers, Quick Reflexes.\n  - **Tactical Role:** Ship combat, extraction, high-speed chases.",
    "full_text": "# The Ace\n\n\nNavigates starships through asteroids and blockades. Master of the stick.\n\n*You are the god of velocity. On the ground, you're just another grunt, but behind a yoke, you are untouchable. You weave through debris fields and dogfights with a grin, delivering the team exactly where they need to be.*\n\n*\"Hold on back there. I'm gonna try something stupid.\"*\n\n  - **Core Concept:** Vehicle Specialist / Transport\n  - **Recommended Occupations:** Spacer, Specialist.\n  - **Recommended Origins:** Spacer, Militaristic, Industrial.\n  - **Recommended Factions:** Coalition (Smugglers), Ascendancy (Test Pilots), Syndicate (Interceptors).\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Pilot, Alertness, Combat (Gunnery).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Evasive Maneuvers, Quick Reflexes.\n  - **Tactical Role:** Ship combat, extraction, high-speed chases."
  },
  {
    "id": "archetype-acrobat",
    "name": "The Acrobat",
    "sphere": "Operatives (The Artisans)",
    "summary": "A performer specializing in agility and stunts, often in zero-gravity.",
    "flavor": "You laugh at gravity. You move in ways that should be impossible, turning the battlefield into your stage. Whether swinging from rigging or dodging laser fire, your grace is your defense.",
    "quote": "\"Catch me if you can.\"",
    "core_concept": "Mobility / Evasion / Performance",
    "recommended_occupations": [
      "Entertainer",
      "Specialist"
    ],
    "recommended_origins": [
      "Leisure",
      "Spacer",
      "Urban"
    ],
    "recommended_factions": [
      "Entari Combine (Performers)",
      "Outworlds (Traveling Shows)"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Strength",
    "key_attributes": "Agility (Primary), Strength (Secondary).",
    "essential_skills": [
      "Acrobatics",
      "Athletics",
      "Expression (any)",
      "Animal Handling"
    ],
    "signature_features": [
      "Daredevil",
      "Showmanship"
    ],
    "tactical_role": "Traversing difficult terrain, dodging attacks, distracting enemies.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A performer specializing in agility and stunts, often in zero-gravity.\n\n*You laugh at gravity. You move in ways that should be impossible, turning the battlefield into your stage. Whether swinging from rigging or dodging laser fire, your grace is your defense.*\n\n_\"Catch me if you can.\"_",
    "keywords": "acrobat, operative, artisan, adaptable, specialist, mobility, evasion",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Daredevil",
      "Showmanship"
    ],
    "traits": [
      "Daredevil",
      "Showmanship"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Acrobat\n\n\nA performer specializing in agility and stunts, often in zero-gravity.\n\n*You laugh at gravity. You move in ways that should be impossible, turning the battlefield into your stage. Whether swinging from rigging or dodging laser fire, your grace is your defense.*\n\n*\"Catch me if you can.\"*\n\n  - **Core Concept:** Mobility / Evasion / Performance\n  - **Recommended Occupations:** Entertainer, Specialist.\n  - **Recommended Origins:** Leisure, Spacer, Urban.\n  - **Recommended Factions:** Entari Combine (Performers), Outworlds (Traveling Shows).\n  - **Key Attributes:** Agility (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Athletics, Expression (any), Vocation (Handler).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Daredevil, Showmanship.\n  - **Tactical Role:** Traversing difficult terrain, dodging attacks, distracting enemies.",
    "full_text": "# The Acrobat\n\n\nA performer specializing in agility and stunts, often in zero-gravity.\n\n*You laugh at gravity. You move in ways that should be impossible, turning the battlefield into your stage. Whether swinging from rigging or dodging laser fire, your grace is your defense.*\n\n*\"Catch me if you can.\"*\n\n  - **Core Concept:** Mobility / Evasion / Performance\n  - **Recommended Occupations:** Entertainer, Specialist.\n  - **Recommended Origins:** Leisure, Spacer, Urban.\n  - **Recommended Factions:** Entari Combine (Performers), Outworlds (Traveling Shows).\n  - **Key Attributes:** Agility (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Athletics, Expression (any), Vocation (Handler).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Daredevil, Showmanship.\n  - **Tactical Role:** Traversing difficult terrain, dodging attacks, distracting enemies."
  },
  {
    "id": "archetype-combat-saboteur",
    "name": "The Combat-saboteur",
    "sphere": "Operatives (The Artisans)",
    "summary": "The frontline demolitionist who uses chaos and high explosives to restructure the battlefield in real-time.",
    "flavor": "You are the architect of rubble. You don't just clear rooms; you remove them from the blueprint. You use the environment as a weapon, turning the enemy's cover into their coffin.",
    "quote": "\"Plan A involves explosives. Plan B is more explosives.\"",
    "core_concept": "Area Damage / Demolition / Utility",
    "recommended_occupations": [
      "Soldier",
      "Builder"
    ],
    "recommended_origins": [
      "Industrial",
      "Militaristic",
      "Colony"
    ],
    "recommended_factions": [
      "Coalition (Rebels)",
      "Syndicate (Demolitions)",
      "Impyrium"
    ],
    "primary_attribute": "Strength",
    "secondary_attribute": "Intellect",
    "key_attributes": "Strength (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Knowledge (Tactics)",
      "Athletics",
      "Heavy Weapons"
    ],
    "signature_features": [
      "Demolitionist",
      "Heavy Weapon Mastery"
    ],
    "tactical_role": "Breaching structures, area denial, destroying heavy enemy units.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The frontline demolitionist who uses chaos and high explosives to restructure the battlefield in real-time.\n\n*You are the architect of rubble. You don't just clear rooms; you remove them from the blueprint. You use the environment as a weapon, turning the enemy's cover into their coffin.*\n\n_\"Plan A involves explosives. Plan B is more explosives.\"_",
    "keywords": "combat-saboteur, operative, artisan, adaptable, specialist, area damage, demolition",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Demolitionist",
      "Heavy Weapon Mastery"
    ],
    "traits": [
      "Demolitionist",
      "Heavy Weapon Mastery"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Combat-Saboteur\n\n\nThe frontline demolitionist who uses chaos and high explosives to restructure the battlefield in real-time.\n\n*You are the architect of rubble. You don't just clear rooms; you remove them from the blueprint. You use the environment as a weapon, turning the enemy's cover into their coffin.*\n\n*\"Plan A involves explosives. Plan B is more explosives.\"*\n\n  - **Core Concept:** Area Damage / Demolition / Utility\n  - **Recommended Occupations:** Soldier, Builder.\n  - **Recommended Origins:** Industrial, Militaristic, Colony.\n  - **Recommended Factions:** Coalition (Rebels), Syndicate (Demolitions), Impyrium.\n  - **Key Attributes:** Strength (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Tactics), Athletics, Heavy Weapons.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Demolitionist, Heavy Weapon Mastery.\n  - **Tactical Role:** Breaching structures, area denial, destroying heavy enemy units.",
    "full_text": "# The Combat-Saboteur\n\n\nThe frontline demolitionist who uses chaos and high explosives to restructure the battlefield in real-time.\n\n*You are the architect of rubble. You don't just clear rooms; you remove them from the blueprint. You use the environment as a weapon, turning the enemy's cover into their coffin.*\n\n*\"Plan A involves explosives. Plan B is more explosives.\"*\n\n  - **Core Concept:** Area Damage / Demolition / Utility\n  - **Recommended Occupations:** Soldier, Builder.\n  - **Recommended Origins:** Industrial, Militaristic, Colony.\n  - **Recommended Factions:** Coalition (Rebels), Syndicate (Demolitions), Impyrium.\n  - **Key Attributes:** Strength (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Tactics), Athletics, Heavy Weapons.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Demolitionist, Heavy Weapon Mastery.\n  - **Tactical Role:** Breaching structures, area denial, destroying heavy enemy units."
  },
  {
    "id": "archetype-daredevil",
    "name": "The Daredevil",
    "sphere": "Operatives (The Artisans)",
    "summary": "Excels in extreme sports and high-risk maneuvers.",
    "flavor": "You live for the rush. The higher the risk, the better the performance. You take leaps of faith that others would call suicide, relying on skill and sheer nerve to survive.",
    "quote": "\"It's not a fall; it's a very fast descent with style.\"",
    "core_concept": "Mobility / Risk / Action",
    "recommended_occupations": [
      "Specialist",
      "Entertainer"
    ],
    "recommended_origins": [
      "Leisure",
      "Spacer",
      "Urban"
    ],
    "recommended_factions": [
      "Syndicate (Media Stunts)",
      "Outworlds",
      "Ascendancy"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Stamina",
    "key_attributes": "Agility (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Athletics",
      "Acrobatics",
      "Knowledge (Survival)",
      "Alertness"
    ],
    "signature_features": [
      "Peak Physical Condition",
      "Fearless"
    ],
    "tactical_role": "Reaching inaccessible areas, performing stunts, surviving falls.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Excels in extreme sports and high-risk maneuvers.\n\n*You live for the rush. The higher the risk, the better the performance. You take leaps of faith that others would call suicide, relying on skill and sheer nerve to survive.*\n\n_\"It's not a fall; it's a very fast descent with style.\"_",
    "keywords": "daredevil, operative, artisan, adaptable, specialist, mobility, risk",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Peak Physical Condition",
      "Fearless"
    ],
    "traits": [
      "Peak Physical Condition",
      "Fearless"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Daredevil\n\n\nExcels in extreme sports and high-risk maneuvers.\n\n*You live for the rush. The higher the risk, the better the performance. You take leaps of faith that others would call suicide, relying on skill and sheer nerve to survive.*\n\n*\"It's not a fall; it's a very fast descent with style.\"*\n\n  - **Core Concept:** Mobility / Risk / Action\n  - **Recommended Occupations:** Specialist, Entertainer.\n  - **Recommended Origins:** Leisure, Spacer, Urban.\n  - **Recommended Factions:** Syndicate (Media Stunts), Outworlds, Ascendancy.\n  - **Key Attributes:** Agility (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Acrobatics, Knowledge (Survival), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Peak Physical Condition, Fearless.\n  - **Tactical Role:** Reaching inaccessible areas, performing stunts, surviving falls.",
    "full_text": "# The Daredevil\n\n\nExcels in extreme sports and high-risk maneuvers.\n\n*You live for the rush. The higher the risk, the better the performance. You take leaps of faith that others would call suicide, relying on skill and sheer nerve to survive.*\n\n*\"It's not a fall; it's a very fast descent with style.\"*\n\n  - **Core Concept:** Mobility / Risk / Action\n  - **Recommended Occupations:** Specialist, Entertainer.\n  - **Recommended Origins:** Leisure, Spacer, Urban.\n  - **Recommended Factions:** Syndicate (Media Stunts), Outworlds, Ascendancy.\n  - **Key Attributes:** Agility (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Acrobatics, Knowledge (Survival), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Peak Physical Condition, Fearless.\n  - **Tactical Role:** Reaching inaccessible areas, performing stunts, surviving falls."
  },
  {
    "id": "archetype-escapologist",
    "name": "The Escapologist",
    "sphere": "Operatives (The Artisans)",
    "summary": "The master of extraction and evasion who specializes in getting out of \"impossible\" situations.",
    "flavor": "You are the loose thread. No cage can hold you, and no perimeter is absolute. You turn the enemy's own protocols into your exit strategy, proving that the best defense is simply not being there when the hammer falls.",
    "quote": "\"I'm not trapped in here with you. I'm already halfway to the hangar.\"",
    "core_concept": "Evasion / Utility / Mobility",
    "recommended_occupations": [
      "Criminal",
      "Entertainer"
    ],
    "recommended_origins": [
      "Urban",
      "Leisure",
      "Spacer"
    ],
    "recommended_factions": [
      "Outworlds (Fugitives)",
      "Syndicate (Extractors)",
      "Coalition"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Agility (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Acrobatics",
      "Legerdemain",
      "Stealth",
      "Investigation"
    ],
    "signature_features": [
      "Daredevil",
      "Evasive Maneuvers"
    ],
    "tactical_role": "Extraction specialist, bypassing traps, navigating high-security exits.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The master of extraction and evasion who specializes in getting out of \"impossible\" situations.\n\n*You are the loose thread. No cage can hold you, and no perimeter is absolute. You turn the enemy's own protocols into your exit strategy, proving that the best defense is simply not being there when the hammer falls.*\n\n_\"I'm not trapped in here with you. I'm already halfway to the hangar.\"_",
    "keywords": "escapologist, operative, artisan, adaptable, specialist, evasion, utility",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Daredevil",
      "Evasive Maneuvers"
    ],
    "traits": [
      "Daredevil",
      "Evasive Maneuvers"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Escapologist\n\n\nThe master of extraction and evasion who specializes in getting out of \"impossible\" situations.\n\n*You are the loose thread. No cage can hold you, and no perimeter is absolute. You turn the enemy's own protocols into your exit strategy, proving that the best defense is simply not being there when the hammer falls.*\n\n*\"I'm not trapped in here with you. I'm already halfway to the hangar.\"*\n\n  - **Core Concept:** Evasion / Utility / Mobility\n  - **Recommended Occupations:** Criminal, Entertainer.\n  - **Recommended Origins:** Urban, Leisure, Spacer.\n  - **Recommended Factions:** Outworlds (Fugitives), Syndicate (Extractors), Coalition.\n  - **Key Attributes:** Agility (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Legerdemain, Stealth, Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Daredevil, Evasive Maneuvers.\n  - **Tactical Role:** Extraction specialist, bypassing traps, navigating high-security exits.",
    "full_text": "# The Escapologist\n\n\nThe master of extraction and evasion who specializes in getting out of \"impossible\" situations.\n\n*You are the loose thread. No cage can hold you, and no perimeter is absolute. You turn the enemy's own protocols into your exit strategy, proving that the best defense is simply not being there when the hammer falls.*\n\n*\"I'm not trapped in here with you. I'm already halfway to the hangar.\"*\n\n  - **Core Concept:** Evasion / Utility / Mobility\n  - **Recommended Occupations:** Criminal, Entertainer.\n  - **Recommended Origins:** Urban, Leisure, Spacer.\n  - **Recommended Factions:** Outworlds (Fugitives), Syndicate (Extractors), Coalition.\n  - **Key Attributes:** Agility (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Legerdemain, Stealth, Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Daredevil, Evasive Maneuvers.\n  - **Tactical Role:** Extraction specialist, bypassing traps, navigating high-security exits."
  },
  {
    "id": "archetype-ghost",
    "name": "The Ghost",
    "sphere": "Operatives (The Artisans)",
    "summary": "Equipped with advanced enhancements to blend in and infiltrate high-security areas. Hack, cloak, and kill.",
    "flavor": "You are the ghost in the machine. Your body is a weapon, upgraded for speed and stealth. You bypass laser grids and hack turrets before the enemy even knows their perimeter is breached.",
    "quote": "\"Security offline. Target acquired. Exfiltrating now.\"",
    "core_concept": "Stealth / Tech / Combat",
    "recommended_occupations": [
      "Agent",
      "Soldier"
    ],
    "recommended_origins": [
      "Industrial",
      "Urban",
      "Militaristic"
    ],
    "recommended_factions": [
      "Syndicate (Infiltrators)",
      "Mekan (Stealth Units)",
      "Ascendancy"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Intellect",
    "key_attributes": "Agility (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Stealth",
      "Knowledge (Technology)",
      "Acrobatics",
      "Combat"
    ],
    "signature_features": [
      "Technological Prowess",
      "Adaptive Camouflage"
    ],
    "tactical_role": "Bypassing laser grids, hacking turrets, stealth takedowns.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Equipped with advanced enhancements to blend in and infiltrate high-security areas. Hack, cloak, and kill.\n\n*You are the ghost in the machine. Your body is a weapon, upgraded for speed and stealth. You bypass laser grids and hack turrets before the enemy even knows their perimeter is breached.*\n\n_\"Security offline. Target acquired. Exfiltrating now.\"_",
    "keywords": "ghost, operative, artisan, adaptable, specialist, stealth, tech",
    "negative_keywords": "heavy-plating, blunt-assault, loud, clumsy",
    "signature_traits": [
      "Technological Prowess",
      "Adaptive Camouflage"
    ],
    "traits": [
      "Technological Prowess",
      "Adaptive Camouflage"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Ghost\n\n\nEquipped with advanced enhancements to blend in and infiltrate high-security areas. Hack, cloak, and kill.\n\n*You are the ghost in the machine. Your body is a weapon, upgraded for speed and stealth. You bypass laser grids and hack turrets before the enemy even knows their perimeter is breached.*\n\n*\"Security offline. Target acquired. Exfiltrating now.\"*\n\n  - **Core Concept:** Stealth / Tech / Combat\n  - **Recommended Occupations:** Agent, Soldier.\n  - **Recommended Origins:** Industrial, Urban, Militaristic.\n  - **Recommended Factions:** Syndicate (Infiltrators), Mekan (Stealth Units), Ascendancy.\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Knowledge (Technology), Acrobatics, Combat.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Technological Prowess, Adaptive Camouflage.\n  - **Tactical Role:** Bypassing laser grids, hacking turrets, stealth takedowns.",
    "full_text": "# The Ghost\n\n\nEquipped with advanced enhancements to blend in and infiltrate high-security areas. Hack, cloak, and kill.\n\n*You are the ghost in the machine. Your body is a weapon, upgraded for speed and stealth. You bypass laser grids and hack turrets before the enemy even knows their perimeter is breached.*\n\n*\"Security offline. Target acquired. Exfiltrating now.\"*\n\n  - **Core Concept:** Stealth / Tech / Combat\n  - **Recommended Occupations:** Agent, Soldier.\n  - **Recommended Origins:** Industrial, Urban, Militaristic.\n  - **Recommended Factions:** Syndicate (Infiltrators), Mekan (Stealth Units), Ascendancy.\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Knowledge (Technology), Acrobatics, Combat.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Technological Prowess, Adaptive Camouflage.\n  - **Tactical Role:** Bypassing laser grids, hacking turrets, stealth takedowns."
  },
  {
    "id": "archetype-grifter",
    "name": "The Grifter",
    "sphere": "Operatives (The Artisans)",
    "summary": "Uses charm and bluff to swindle and exploit others for personal gain.",
    "flavor": "You exploit the bugs in human nature. You see greed, pride, and fear as levers to be pulled. You can walk into a fortress with nothing but a smile and walk out with the keys.",
    "quote": "\"Trust me. I'm exactly who you want me to be.\"",
    "core_concept": "Social Stealth / Deceiver",
    "recommended_occupations": [
      "Criminal",
      "Citizen"
    ],
    "recommended_origins": [
      "Urban",
      "Leisure",
      "Spacer"
    ],
    "recommended_factions": [
      "Outworlds (Con Artists)",
      "Syndicate (Espionage)",
      "Entari"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Bluff",
      "Insight",
      "Streetwise"
    ],
    "signature_features": [
      "Silver Tongue",
      "Master of Disguise"
    ],
    "tactical_role": "Talk the way into secure areas, trick enemies, gather intel via deception.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Uses charm and bluff to swindle and exploit others for personal gain.\n\n*You exploit the bugs in human nature. You see greed, pride, and fear as levers to be pulled. You can walk into a fortress with nothing but a smile and walk out with the keys.*\n\n_\"Trust me. I'm exactly who you want me to be.\"_",
    "keywords": "grifter, operative, artisan, adaptable, specialist, social stealth, deceiver",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Silver Tongue",
      "Master of Disguise"
    ],
    "traits": [
      "Silver Tongue",
      "Master of Disguise"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Grifter\n\n\nUses charm and bluff to swindle and exploit others for personal gain.\n\n*You exploit the bugs in human nature. You see greed, pride, and fear as levers to be pulled. You can walk into a fortress with nothing but a smile and walk out with the keys.*\n\n*\"Trust me. I'm exactly who you want me to be.\"*\n\n  - **Core Concept:** Social Stealth / Deceiver\n  - **Recommended Occupations:** Criminal, Citizen.\n  - **Recommended Origins:** Urban, Leisure, Spacer.\n  - **Recommended Factions:** Outworlds (Sta Artists), Syndicate (Espionage), Entari.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Bluff, Insight, Streetwise.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Silver Tongue, Master of Disguise.\n  - **Tactical Role:** Talk the way into secure areas, trick enemies, gather intel via deception.",
    "full_text": "# The Grifter\n\n\nUses charm and bluff to swindle and exploit others for personal gain.\n\n*You exploit the bugs in human nature. You see greed, pride, and fear as levers to be pulled. You can walk into a fortress with nothing but a smile and walk out with the keys.*\n\n*\"Trust me. I'm exactly who you want me to be.\"*\n\n  - **Core Concept:** Social Stealth / Deceiver\n  - **Recommended Occupations:** Criminal, Citizen.\n  - **Recommended Origins:** Urban, Leisure, Spacer.\n  - **Recommended Factions:** Outworlds (Sta Artists), Syndicate (Espionage), Entari.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Bluff, Insight, Streetwise.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Silver Tongue, Master of Disguise.\n  - **Tactical Role:** Talk the way into secure areas, trick enemies, gather intel via deception."
  },
  {
    "id": "archetype-manhunter",
    "name": "The Manhunter",
    "sphere": "Operatives (The Artisans)",
    "summary": "Uses tracking and combat skills to pursue criminals for a reward. Skilled in investigation and apprehension.",
    "flavor": "You always get your mark. No moon is distant enough, no hole deep enough. You combine the skills of a detective with the grit of a soldier, pursuing targets that others fear to name.",
    "quote": "\"I can bring you in warm, or I can bring you in cold.\"",
    "core_concept": "Hybrid (Combat/Skill) / Tracker",
    "recommended_occupations": [
      "Drifter",
      "Agent"
    ],
    "recommended_origins": [
      "Hostile",
      "Spacer",
      "Colony"
    ],
    "recommended_factions": [
      "Coalition (Bounty Hunters)",
      "Syndicate (Recovery)",
      "Outworlds"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Agility",
    "key_attributes": "Wisdom (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Survival)",
      "Alertness",
      "Knowledge (Investigation)",
      "Combat (Any)"
    ],
    "signature_features": [
      "Hunter's Intuition",
      "Relentless Pursuit"
    ],
    "tactical_role": "Tracking enemies, capturing targets alive, wilderness survival.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Uses tracking and combat skills to pursue criminals for a reward. Skilled in investigation and apprehension.\n\n*You always get your mark. No moon is distant enough, no hole deep enough. You combine the skills of a detective with the grit of a soldier, pursuing targets that others fear to name.*\n\n_\"I can bring you in warm, or I can bring you in cold.\"_",
    "keywords": "manhunter, operative, artisan, adaptable, specialist, hybrid (combat, skill)",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Hunter's Intuition",
      "Relentless Pursuit"
    ],
    "traits": [
      "Hunter's Intuition",
      "Relentless Pursuit"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Manhunter\n\n\nUses tracking and combat skills to pursue criminals for a reward. Skilled in investigation and apprehension.\n\n*You always get your mark. No moon is distant enough, no hole deep enough. You combine the skills of a detective with the grit of a soldier, pursuing targets that others fear to name.*\n\n*\"I can bring you in warm, or I can bring you in cold.\"*\n\n  - **Core Concept:** Hybrid (Combat/Skill) / Tracker\n  - **Recommended Occupations:** Drifter, Agent.\n  - **Recommended Origins:** Hostile, Spacer, Colony.\n  - **Recommended Factions:** Coalition (Bounty Hunters), Syndicate (Recovery), Outworlds.\n  - **Key Attributes:** Wisdom (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Alertness, Knowledge (Investigation), Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Hunter's Intuition, Relentless Pursuit.\n  - **Tactical Role:** Tracking enemies, capturing targets alive, wilderness survival.",
    "full_text": "# The Manhunter\n\n\nUses tracking and combat skills to pursue criminals for a reward. Skilled in investigation and apprehension.\n\n*You always get your mark. No moon is distant enough, no hole deep enough. You combine the skills of a detective with the grit of a soldier, pursuing targets that others fear to name.*\n\n*\"I can bring you in warm, or I can bring you in cold.\"*\n\n  - **Core Concept:** Hybrid (Combat/Skill) / Tracker\n  - **Recommended Occupations:** Drifter, Agent.\n  - **Recommended Origins:** Hostile, Spacer, Colony.\n  - **Recommended Factions:** Coalition (Bounty Hunters), Syndicate (Recovery), Outworlds.\n  - **Key Attributes:** Wisdom (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Alertness, Knowledge (Investigation), Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Hunter's Intuition, Relentless Pursuit.\n  - **Tactical Role:** Tracking enemies, capturing targets alive, wilderness survival."
  },
  {
    "id": "archetype-operative",
    "name": "The Operative",
    "sphere": "Operatives (The Artisans)",
    "summary": "A skilled agent who carries out dirty work. Expert in infiltration and sabotage.",
    "flavor": "You are the shadow in the corner. You slip past defenses, disable systems, and extract targets without leaving a trace. You are the tool that fixes problems quietly.",
    "quote": "\"I was never here.\"",
    "core_concept": "Stealth / Sabotage / Utility",
    "recommended_occupations": [
      "Agent",
      "Criminal"
    ],
    "recommended_origins": [
      "Urban",
      "Militaristic",
      "Industrial"
    ],
    "recommended_factions": [
      "Syndicate (Agents)",
      "Impyrium (Spies)",
      "Ascendancy (Intelligence)"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Intellect",
    "key_attributes": "Agility (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Stealth",
      "Bluff",
      "Knowledge (Technology)",
      "Combat (Pistol)"
    ],
    "signature_features": [
      "Undercover Operations",
      "Security Expertise"
    ],
    "tactical_role": "Infiltration, sabotage, covert surveillance.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A skilled agent who carries out dirty work. Expert in infiltration and sabotage.\n\n*You are the shadow in the corner. You slip past defenses, disable systems, and extract targets without leaving a trace. You are the tool that fixes problems quietly.*\n\n_\"I was never here.\"_",
    "keywords": "operative, artisan, adaptable, specialist, stealth, sabotage, utility",
    "negative_keywords": "heavy-plating, blunt-assault, loud, clumsy, mindless-brute",
    "signature_traits": [
      "Undercover Operations",
      "Security Expertise"
    ],
    "traits": [
      "Undercover Operations",
      "Security Expertise"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Operative\n\n\nA skilled agent who carries out dirty work. Expert in infiltration and sabotage.\n\n*You are the shadow in the corner. You slip past defenses, disable systems, and extract targets without leaving a trace. You are the tool that fixes problems quietly.*\n\n*\"I was never here.\"*\n\n  - **Core Concept:** Stealth / Sabotage / Utility\n  - **Recommended Occupations:** Agent, Criminal.\n  - **Recommended Origins:** Urban, Militaristic, Industrial.\n  - **Recommended Factions:** Syndicate (Agents), Impyrium (Spies), Ascendancy (Intelligence).\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Bluff, Knowledge (Technology), Combat (Pistol).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Undercover Operations, Security Expertise.\n  - **Tactical Role:** Infiltration, sabotage, covert surveillance.",
    "full_text": "# The Operative\n\n\nA skilled agent who carries out dirty work. Expert in infiltration and sabotage.\n\n*You are the shadow in the corner. You slip past defenses, disable systems, and extract targets without leaving a trace. You are the tool that fixes problems quietly.*\n\n*\"I was never here.\"*\n\n  - **Core Concept:** Stealth / Sabotage / Utility\n  - **Recommended Occupations:** Agent, Criminal.\n  - **Recommended Origins:** Urban, Militaristic, Industrial.\n  - **Recommended Factions:** Syndicate (Agents), Impyrium (Spies), Ascendancy (Intelligence).\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Bluff, Knowledge (Technology), Combat (Pistol).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Undercover Operations, Security Expertise.\n  - **Tactical Role:** Infiltration, sabotage, covert surveillance."
  },
  {
    "id": "archetype-pathfinder",
    "name": "The Pathfinder",
    "sphere": "Operatives (The Artisans)",
    "summary": "Ventures into the unknown, charting territories and assessing threats.",
    "flavor": "You are the eyes of the operation. You move ahead, unseen and unheard, painting targets and identifying traps. Knowledge is power, and you ensure your team always has the advantage of knowing what's coming.",
    "quote": "\"Three guards, two turrets, and a back door they forgot to lock. Easy.\"",
    "core_concept": "Stealth / Recon / Survival",
    "recommended_occupations": [
      "Scout",
      "Soldier"
    ],
    "recommended_origins": [
      "Colony",
      "Hostile",
      "Militaristic"
    ],
    "recommended_factions": [
      "Outworlds",
      "Auluran (Scouts)",
      "Coalition"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Agility (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Survival)",
      "Acrobatics",
      "Alertness",
      "Knowledge (Nature)"
    ],
    "signature_features": [
      "Pathfinder",
      "Keen Observer"
    ],
    "tactical_role": "Reconnaissance, initiating ambushes, guiding the party.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Ventures into the unknown, charting territories and assessing threats.\n\n*You are the eyes of the operation. You move ahead, unseen and unheard, painting targets and identifying traps. Knowledge is power, and you ensure your team always has the advantage of knowing what's coming.*\n\n_\"Three guards, two turrets, and a back door they forgot to lock. Easy.\"_",
    "keywords": "pathfinder, operative, artisan, adaptable, specialist, stealth, recon",
    "negative_keywords": "heavy-plating, blunt-assault, loud, clumsy",
    "signature_traits": [
      "Pathfinder",
      "Keen Observer"
    ],
    "traits": [
      "Pathfinder",
      "Keen Observer"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Pathfinder\n\n\nVentures into the unknown, charting territories and assessing threats.\n\n*You are the eyes of the operation. You move ahead, unseen and unheard, painting targets and identifying traps. Knowledge is power, and you ensure your team always has the advantage of knowing what's coming.*\n\n*\"Three guards, two turrets, and a back door they forgot to lock. Easy.\"*\n\n  - **Core Concept:** Stealth / Recon / Survival\n  - **Recommended Occupations:** Scout, Soldier.\n  - **Recommended Origins:** Colony, Hostile, Militaristic.\n  - **Recommended Factions:** Outworlds, Auluran (Scouts), Coalition.\n  - **Key Attributes:** Agility (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Acrobatics, Alertness, Knowledge (Geography).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Pathfinder, Keen Observer.\n  - **Tactical Role:** Reconnaissance, initiating ambushes, guiding the party.",
    "full_text": "# The Pathfinder\n\n\nVentures into the unknown, charting territories and assessing threats.\n\n*You are the eyes of the operation. You move ahead, unseen and unheard, painting targets and identifying traps. Knowledge is power, and you ensure your team always has the advantage of knowing what's coming.*\n\n*\"Three guards, two turrets, and a back door they forgot to lock. Easy.\"*\n\n  - **Core Concept:** Stealth / Recon / Survival\n  - **Recommended Occupations:** Scout, Soldier.\n  - **Recommended Origins:** Colony, Hostile, Militaristic.\n  - **Recommended Factions:** Outworlds, Auluran (Scouts), Coalition.\n  - **Key Attributes:** Agility (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Acrobatics, Alertness, Knowledge (Geography).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Pathfinder, Keen Observer.\n  - **Tactical Role:** Reconnaissance, initiating ambushes, guiding the party."
  },
  {
    "id": "archetype-pioneer",
    "name": "The Pioneer",
    "sphere": "Operatives (The Artisans)",
    "summary": "Charts new territories and uncovers the mysteries of the universe. Thirsts for discovery.",
    "flavor": "You go where the maps end. You are driven by the need to see the unseen and name the unnamed. You navigate the hazards of alien worlds so that others may follow in your footsteps.",
    "quote": "\"Second star to the right, and straight on 'til morning.\"",
    "core_concept": "Scout / Knowledge / Survival",
    "recommended_occupations": [
      "Scout",
      "Drifter"
    ],
    "recommended_origins": [
      "Colony",
      "Spacer",
      "Research"
    ],
    "recommended_factions": [
      "Ascendancy (Explorers)",
      "Outworlds",
      "Coalition"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Stamina",
    "key_attributes": "Wisdom (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Knowledge (Survival)",
      "Knowledge (Navigation)",
      "Knowledge (History)",
      "Alertness"
    ],
    "signature_features": [
      "Pathfinder",
      "Cartographer"
    ],
    "tactical_role": "Leading the party through wilderness, spotting hazards, mapping.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Charts new territories and uncovers the mysteries of the universe. Thirsts for discovery.\n\n*You go where the maps end. You are driven by the need to see the unseen and name the unnamed. You navigate the hazards of alien worlds so that others may follow in your footsteps.*\n\n_\"Second star to the right, and straight on 'til morning.\"_",
    "keywords": "pioneer, operative, artisan, adaptable, specialist, scout, knowledge",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Pathfinder",
      "Cartographer"
    ],
    "traits": [
      "Pathfinder",
      "Cartographer"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Pioneer\n\n\nCharts new territories and uncovers the mysteries of the universe. Thirsts for discovery.\n\n*You go where the maps end. You are driven by the need to see the unseen and name the unnamed. You navigate the hazards of alien worlds so that others may follow in your footsteps.*\n\n*\"Second star to the right, and straight on 'til morning.\"*\n\n  - **Core Concept:** Scout / Knowledge / Survival\n  - **Recommended Occupations:** Scout, Drifter.\n  - **Recommended Origins:** Colony, Spacer, Research.\n  - **Recommended Factions:** Ascendancy (Explorers), Outworlds, Coalition.\n  - **Key Attributes:** Wisdom (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Knowledge (Navigation), Knowledge (History), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Pathfinder, Cartographer.\n  - **Tactical Role:** Leading the party through wilderness, spotting hazards, mapping.",
    "full_text": "# The Pioneer\n\n\nCharts new territories and uncovers the mysteries of the universe. Thirsts for discovery.\n\n*You go where the maps end. You are driven by the need to see the unseen and name the unnamed. You navigate the hazards of alien worlds so that others may follow in your footsteps.*\n\n*\"Second star to the right, and straight on 'til morning.\"*\n\n  - **Core Concept:** Scout / Knowledge / Survival\n  - **Recommended Occupations:** Scout, Drifter.\n  - **Recommended Origins:** Colony, Spacer, Research.\n  - **Recommended Factions:** Ascendancy (Explorers), Outworlds, Coalition.\n  - **Key Attributes:** Wisdom (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Knowledge (Navigation), Knowledge (History), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Pathfinder, Cartographer.\n  - **Tactical Role:** Leading the party through wilderness, spotting hazards, mapping."
  },
  {
    "id": "archetype-privateer",
    "name": "The Privateer",
    "sphere": "Operatives (The Artisans)",
    "summary": "A skilled starship captain who operates independently on behalf of a faction.",
    "flavor": "You are a pirate with a badge. You hunt the enemies of the state for profit, blending the freedom of the outlaw with the legitimacy of the law.",
    "quote": "\"It's not piracy if you have a permit.\"",
    "core_concept": "Combat Pilot / Skirmisher / Face",
    "recommended_occupations": [
      "Spacer",
      "Soldier"
    ],
    "recommended_origins": [
      "Spacer",
      "Colony",
      "Militaristic"
    ],
    "recommended_factions": [
      "Coalition (Licensed)",
      "Entari Combine (Security)",
      "Outworlds"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Charisma",
    "key_attributes": "Agility (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Knowledge (Tactics)",
      "Acrobatics",
      "Combat (any)"
    ],
    "signature_features": [
      "Practiced Pilot",
      "Evasive Maneuvers"
    ],
    "tactical_role": "Space combat, boarding actions, high-speed interdiction.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A skilled starship captain who operates independently on behalf of a faction.\n\n*You are a pirate with a badge. You hunt the enemies of the state for profit, blending the freedom of the outlaw with the legitimacy of the law.*\n\n_\"It's not piracy if you have a permit.\"_",
    "keywords": "privateer, operative, artisan, adaptable, specialist, combat pilot, skirmisher",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Practiced Pilot",
      "Evasive Maneuvers"
    ],
    "traits": [
      "Practiced Pilot",
      "Evasive Maneuvers"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Privateer\n\n\nA skilled starship captain who operates independently on behalf of a faction.\n\n*You are a pirate with a badge. You hunt the enemies of the state for profit, blending the freedom of the outlaw with the legitimacy of the law.*\n\n*\"It's not piracy if you have a permit.\"*\n\n  - **Core Concept:** Combat Pilot / Skirmisher / Face\n  - **Recommended Occupations:** Spacer, Soldier.\n  - **Recommended Origins:** Spacer, Colony, Militaristic.\n  - **Recommended Factions:** Coalition (Licensed), Entari Combine (Security), Outworlds.\n  - **Key Attributes:** Agility (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Tactics), Acrobatics, Combat (any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Practiced Pilot, Evasive Maneuvers.\n  - **Tactical Role:** Space combat, boarding actions, high-speed interdiction.",
    "full_text": "# The Privateer\n\n\nA skilled starship captain who operates independently on behalf of a faction.\n\n*You are a pirate with a badge. You hunt the enemies of the state for profit, blending the freedom of the outlaw with the legitimacy of the law.*\n\n*\"It's not piracy if you have a permit.\"*\n\n  - **Core Concept:** Combat Pilot / Skirmisher / Face\n  - **Recommended Occupations:** Spacer, Soldier.\n  - **Recommended Origins:** Spacer, Colony, Militaristic.\n  - **Recommended Factions:** Coalition (Licensed), Entari Combine (Security), Outworlds.\n  - **Key Attributes:** Agility (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Tactics), Acrobatics, Combat (any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Practiced Pilot, Evasive Maneuvers.\n  - **Tactical Role:** Space combat, boarding actions, high-speed interdiction."
  },
  {
    "id": "archetype-quick-draw",
    "name": "The Quick-draw",
    "sphere": "Operatives (The Artisans)",
    "summary": "The gunslinger of the future, whose survival depends on being the first to fire in any confrontation.",
    "flavor": "You are the fastest hand in the sector. You live in the split second between intent and action, drawing and firing before the enemy can even process the threat. You don't start the fight, but you always end it.",
    "quote": "\"I already pulled the trigger. You just haven't fallen yet.\"",
    "core_concept": "Burst DPS / Initiative / Reflex",
    "recommended_occupations": [
      "Drifter",
      "Soldier"
    ],
    "recommended_origins": [
      "Hostile",
      "Colony",
      "Militaristic"
    ],
    "recommended_factions": [
      "Outworlds (Gunfighters)",
      "Coalition (Marshals)",
      "Syndicate"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Agility (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Combat (Pistols)",
      "Alertness",
      "Acrobatics",
      "Stealth"
    ],
    "signature_features": [
      "Quick Reflexes",
      "Seize Initiative"
    ],
    "tactical_role": "Winning initiative, eliminating high-threat targets first, high-mobility combat.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The gunslinger of the future, whose survival depends on being the first to fire in any confrontation.\n\n*You are the fastest hand in the sector. You live in the split second between intent and action, drawing and firing before the enemy can even process the threat. You don't start the fight, but you always end it.*\n\n_\"I already pulled the trigger. You just haven't fallen yet.\"_",
    "keywords": "quick-draw, operative, artisan, adaptable, specialist, burst dps, initiative",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Quick Reflexes",
      "Seize Initiative"
    ],
    "traits": [
      "Quick Reflexes",
      "Seize Initiative"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Quick-Draw\n\n\nThe gunslinger of the future, whose survival depends on being the first to fire in any confrontation.\n\n*You are the fastest hand in the sector. You live in the split second between intent and action, drawing and firing before the enemy can even process the threat. You don't start the fight, but you always end it.*\n\n*\"I already pulled the trigger. You just haven't fallen yet.\"*\n\n  - **Core Concept:** Burst DPS / Initiative / Reflex\n  - **Recommended Occupations:** Drifter, Soldier.\n  - **Recommended Origins:** Hostile, Colony, Militaristic.\n  - **Recommended Factions:** Outworlds (Gunfighters), Coalition (Marshals), Syndicate.\n  - **Key Attributes:** Agility (+3 Primary), Wisdom / Alertness (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Combat (Pistols), Alertness, Acrobatics, Stealth.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Quick Reflexes, Seize Initiative.\n  - **Tactical Role:** Winning initiative, eliminating high-threat targets first, high-mobility combat.",
    "full_text": "# The Quick-Draw\n\n\nThe gunslinger of the future, whose survival depends on being the first to fire in any confrontation.\n\n*You are the fastest hand in the sector. You live in the split second between intent and action, drawing and firing before the enemy can even process the threat. You don't start the fight, but you always end it.*\n\n*\"I already pulled the trigger. You just haven't fallen yet.\"*\n\n  - **Core Concept:** Burst DPS / Initiative / Reflex\n  - **Recommended Occupations:** Drifter, Soldier.\n  - **Recommended Origins:** Hostile, Colony, Militaristic.\n  - **Recommended Factions:** Outworlds (Gunfighters), Coalition (Marshals), Syndicate.\n  - **Key Attributes:** Agility (+3 Primary), Wisdom / Alertness (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Combat (Pistols), Alertness, Acrobatics, Stealth.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Quick Reflexes, Seize Initiative.\n  - **Tactical Role:** Winning initiative, eliminating high-threat targets first, high-mobility combat."
  },
  {
    "id": "archetype-racer",
    "name": "The Racer",
    "sphere": "Operatives (The Artisans)",
    "summary": "Skilled in piloting high-speed vehicles in competitive or dangerous environments.",
    "flavor": "You are the fastest thing alive. You push machines past their breaking point, threading the needle at supersonic speeds. Victory is measured in milliseconds.",
    "quote": "\"If you aren't first, you're last.\"",
    "core_concept": "Speed / Transport / Evasion",
    "recommended_occupations": [
      "Specialist",
      "Entertainer"
    ],
    "recommended_origins": [
      "Leisure",
      "Urban",
      "Spacer"
    ],
    "recommended_factions": [
      "Syndicate (Leisure)",
      "Outworlds"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Intellect",
    "key_attributes": "Agility (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Pilot",
      "Acrobatics",
      "Knowledge (Technology)",
      "Alertness"
    ],
    "signature_features": [
      "Speed Demon",
      "Adrenaline Rush"
    ],
    "tactical_role": "Chase scenes, extraction, outrunning threats.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Skilled in piloting high-speed vehicles in competitive or dangerous environments.\n\n*You are the fastest thing alive. You push machines past their breaking point, threading the needle at supersonic speeds. Victory is measured in milliseconds.*\n\n_\"If you aren't first, you're last.\"_",
    "keywords": "racer, operative, artisan, adaptable, specialist, speed, transport",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Speed Demon",
      "Adrenaline Rush"
    ],
    "traits": [
      "Speed Demon",
      "Adrenaline Rush"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Racer\n\n\nSkilled in piloting high-speed vehicles in competitive or dangerous environments.\n\n*You are the fastest thing alive. You push machines past their breaking point, threading the needle at supersonic speeds. Victory is measured in milliseconds.*\n\n*\"If you aren't first, you're last.\"*\n\n  - **Core Concept:** Speed / Transport / Evasion\n  - **Recommended Occupations:** Specialist, Entertainer.\n  - **Recommended Origins:** Leisure, Urban, Spacer.\n  - **Recommended Factions:** Syndicate (Leisure), Outworlds.\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Pilot, Acrobatics, Knowledge (Technology), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Speed Demon, Adrenaline Rush.\n  - **Tactical Role:** Chase scenes, extraction, outrunning threats.",
    "full_text": "# The Racer\n\n\nSkilled in piloting high-speed vehicles in competitive or dangerous environments.\n\n*You are the fastest thing alive. You push machines past their breaking point, threading the needle at supersonic speeds. Victory is measured in milliseconds.*\n\n*\"If you aren't first, you're last.\"*\n\n  - **Core Concept:** Speed / Transport / Evasion\n  - **Recommended Occupations:** Specialist, Entertainer.\n  - **Recommended Origins:** Leisure, Urban, Spacer.\n  - **Recommended Factions:** Syndicate (Leisure), Outworlds.\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Pilot, Acrobatics, Knowledge (Technology), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Speed Demon, Adrenaline Rush.\n  - **Tactical Role:** Chase scenes, extraction, outrunning threats."
  },
  {
    "id": "archetype-raider",
    "name": "The Raider",
    "sphere": "Operatives (The Artisans)",
    "summary": "A hardened survivor who uses force to secure resources.",
    "flavor": "You take what you need. In the lawless wastes, strength is the only currency. You strike hard and fast, seizing resources before the dust settles.",
    "quote": "\"Weakness is a choice. I chose strength.\"",
    "core_concept": "Aggression / Survival / Intimidation",
    "recommended_occupations": [
      "Criminal",
      "Drifter"
    ],
    "recommended_origins": [
      "Hostile",
      "Colony",
      "Militaristic"
    ],
    "recommended_factions": [
      "Outworlds (Pirates)",
      "Coalition (Rebels)"
    ],
    "primary_attribute": "Strength",
    "secondary_attribute": "Stamina",
    "key_attributes": "Strength (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Intimidation",
      "Athletics",
      "Combat (Melee/Ranged)",
      "Knowledge (Survival)"
    ],
    "signature_features": [
      "Wasteland Warrior",
      "Ruthless"
    ],
    "tactical_role": "Shock assault, intimidation, scavenging.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A hardened survivor who uses force to secure resources.\n\n*You take what you need. In the lawless wastes, strength is the only currency. You strike hard and fast, seizing resources before the dust settles.*\n\n_\"Weakness is a choice. I chose strength.\"_",
    "keywords": "raider, operative, artisan, adaptable, specialist, aggression, survival",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Wasteland Warrior",
      "Ruthless"
    ],
    "traits": [
      "Wasteland Warrior",
      "Ruthless"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Raider\n\n\nA hardened survivor who uses force to secure resources.\n\n*You take what you need. In the lawless wastes, strength is the only currency. You strike hard and fast, seizing resources before the dust settles.*\n\n*\"Weakness is a choice. I chose strength.\"*\n\n  - **Core Concept:** Aggression / Survival / Intimidation\n  - **Recommended Occupations:** Criminal, Drifter.\n  - **Recommended Origins:** Hostile, Colony, Militaristic.\n  - **Recommended Factions:** Outworlds (Pirates), Coalition (Rebels).\n  - **Key Attributes:** Strength (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Athletics, Combat (Melee/Ranged), Knowledge (Survival).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Wasteland Warrior, Ruthless.\n  - **Tactical Role:** Shock assault, intimidation, scavenging.",
    "full_text": "# The Raider\n\n\nA hardened survivor who uses force to secure resources.\n\n*You take what you need. In the lawless wastes, strength is the only currency. You strike hard and fast, seizing resources before the dust settles.*\n\n*\"Weakness is a choice. I chose strength.\"*\n\n  - **Core Concept:** Aggression / Survival / Intimidation\n  - **Recommended Occupations:** Criminal, Drifter.\n  - **Recommended Origins:** Hostile, Colony, Militaristic.\n  - **Recommended Factions:** Outworlds (Pirates), Coalition (Rebels).\n  - **Key Attributes:** Strength (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Athletics, Combat (Melee/Ranged), Knowledge (Survival).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Wasteland Warrior, Ruthless.\n  - **Tactical Role:** Shock assault, intimidation, scavenging."
  },
  {
    "id": "archetype-saboteur",
    "name": "The Saboteur",
    "sphere": "Operatives (The Artisans)",
    "summary": "A skilled operative who infiltrates to destroy or disrupt.",
    "flavor": "You break things. Not randomly, but surgically. You know exactly where to place the charge or cut the wire to bring the whole system crashing down.",
    "quote": "\"A little chaos goes a long way.\"",
    "core_concept": "Stealth / Tech / Debuff",
    "recommended_occupations": [
      "Agent",
      "Specialist"
    ],
    "recommended_origins": [
      "Militaristic",
      "Urban",
      "Industrial"
    ],
    "recommended_factions": [
      "Coalition (Resistance)",
      "Syndicate (Corporate Sabotage)"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Agility",
    "key_attributes": "Intellect (Primary), Agility (Secondary).",
    "essential_skills": [
      "Stealth",
      "Acrobatics",
      "Knowledge (Technology)",
      "Vocation (Demolitionist)"
    ],
    "signature_features": [
      "Demolitionist",
      "Infiltrator"
    ],
    "tactical_role": "Disabling enemy infrastructure, setting traps, causing distractions.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A skilled operative who infiltrates to destroy or disrupt.\n\n*You break things. Not randomly, but surgically. You know exactly where to place the charge or cut the wire to bring the whole system crashing down.*\n\n_\"A little chaos goes a long way.\"_",
    "keywords": "saboteur, operative, artisan, adaptable, specialist, stealth, tech",
    "negative_keywords": "heavy-plating, blunt-assault, loud, clumsy, mindless-brute",
    "signature_traits": [
      "Demolitionist",
      "Infiltrator"
    ],
    "traits": [
      "Demolitionist",
      "Infiltrator"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Saboteur\n\n\nA skilled operative who infiltrates to destroy or disrupt.\n\n*You break things. Not randomly, but surgically. You know exactly where to place the charge or cut the wire to bring the whole system crashing down.*\n\n*\"A little chaos goes a long way.\"*\n\n  - **Core Concept:** Stealth / Tech / Debuff\n  - **Recommended Occupations:** Agent, Specialist.\n  - **Recommended Origins:** Militaristic, Urban, Industrial.\n  - **Recommended Factions:** Coalition (Resistance), Syndicate (Corporate Sabotage).\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Acrobatics, Knowledge (Technology), Vocation (Demolitionist).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Demolitionist, Infiltrator.\n  - **Tactical Role:** Disabling enemy infrastructure, setting traps, causing distractions.",
    "full_text": "# The Saboteur\n\n\nA skilled operative who infiltrates to destroy or disrupt.\n\n*You break things. Not randomly, but surgically. You know exactly where to place the charge or cut the wire to bring the whole system crashing down.*\n\n*\"A little chaos goes a long way.\"*\n\n  - **Core Concept:** Stealth / Tech / Debuff\n  - **Recommended Occupations:** Agent, Specialist.\n  - **Recommended Origins:** Militaristic, Urban, Industrial.\n  - **Recommended Factions:** Coalition (Resistance), Syndicate (Corporate Sabotage).\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Acrobatics, Knowledge (Technology), Vocation (Demolitionist).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Demolitionist, Infiltrator.\n  - **Tactical Role:** Disabling enemy infrastructure, setting traps, causing distractions."
  },
  {
    "id": "archetype-salvage-specialist",
    "name": "The Salvage-specialist",
    "sphere": "Operatives (The Artisans)",
    "summary": "The high-risk recovery expert who ventures into derelict hulls and unstable ruins to pull riches from the wreckage.",
    "flavor": "You find treasure in trash. You know that the most valuable tech is often buried under tons of radioactive scrap or hidden in the heart of a failing starbase. You are the scavenger-king of the void.",
    "quote": "\"One man's debris is my next month's salary.\"",
    "core_concept": "Scavenging / Utility / Tech",
    "recommended_occupations": [
      "Spacer",
      "Specialist"
    ],
    "recommended_origins": [
      "Spacer",
      "Industrial",
      "Colony"
    ],
    "recommended_factions": [
      "Outworlds (Wreckers)",
      "Mekan (Resource Converters)",
      "Coalition"
    ],
    "primary_attribute": "Strength",
    "secondary_attribute": "Intellect",
    "key_attributes": "Strength (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Vocation (Salvager)",
      "Knowledge (Technology)",
      "Vocation (Engineer)",
      "Investigation"
    ],
    "signature_features": [
      "Junk Whisperer",
      "Technical Expertise"
    ],
    "tactical_role": "Extracting materials from environment, bypassing mechanical hurdles, locating hidden loot.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The high-risk recovery expert who ventures into derelict hulls and unstable ruins to pull riches from the wreckage.\n\n*You find treasure in trash. You know that the most valuable tech is often buried under tons of radioactive scrap or hidden in the heart of a failing starbase. You are the scavenger-king of the void.*\n\n_\"One man's debris is my next month's salary.\"_",
    "keywords": "salvage-specialist, operative, artisan, adaptable, specialist, scavenging, utility",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Junk Whisperer",
      "Technical Expertise"
    ],
    "traits": [
      "Junk Whisperer",
      "Technical Expertise"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Salvage-Specialist\n\n\nThe high-risk recovery expert who ventures into derelict hulls and unstable ruins to pull riches from the wreckage.\n\n*You find treasure in trash. You know that the most valuable tech is often buried under tons of radioactive scrap or hidden in the heart of a failing starbase. You are the scavenger-king of the void.*\n\n*\"One man's debris is my next month's salary.\"*\n\n  - **Core Concept:** Scavenging / Utility / Tech\n  - **Recommended Occupations:** Spacer, Specialist.\n  - **Recommended Origins:** Spacer, Industrial, Colony.\n  - **Recommended Factions:** Outworlds (Wreckers), Mekan (Resource Converters), Coalition.\n  - **Key Attributes:** Strength (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Salvager), Knowledge (Technology), Vocation (Engineer), Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Junk Whisperer, Technical Expertise.\n  - **Tactical Role:** Extracting materials from environment, bypassing mechanical hurdles, locating hidden loot.",
    "full_text": "# The Salvage-Specialist\n\n\nThe high-risk recovery expert who ventures into derelict hulls and unstable ruins to pull riches from the wreckage.\n\n*You find treasure in trash. You know that the most valuable tech is often buried under tons of radioactive scrap or hidden in the heart of a failing starbase. You are the scavenger-king of the void.*\n\n*\"One man's debris is my next month's salary.\"*\n\n  - **Core Concept:** Scavenging / Utility / Tech\n  - **Recommended Occupations:** Spacer, Specialist.\n  - **Recommended Origins:** Spacer, Industrial, Colony.\n  - **Recommended Factions:** Outworlds (Wreckers), Mekan (Resource Converters), Coalition.\n  - **Key Attributes:** Strength (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Vocation (Salvager), Knowledge (Technology), Vocation (Engineer), Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Junk Whisperer, Technical Expertise.\n  - **Tactical Role:** Extracting materials from environment, bypassing mechanical hurdles, locating hidden loot."
  },
  {
    "id": "archetype-shadow-stepper",
    "name": "The Shadow-stepper",
    "sphere": "Operatives (The Artisans)",
    "summary": "A master of optical camouflage and tactical misdirection who treats reality as an obstacle to be bypassed.",
    "flavor": "You aren't there. Even when they look right at you, their eyes slide away. You move through fortified lines like a ghost, leaving nothing behind but an empty vault or a neutralized leader.",
    "quote": "\"Did you hear that? Probably just the wind.\"",
    "core_concept": "Stealth / Infiltration / Sabotage",
    "recommended_occupations": [
      "Spy",
      "Criminal"
    ],
    "recommended_origins": [
      "Urban",
      "Research",
      "Industrial"
    ],
    "recommended_factions": [
      "Syndicate (Infiltrators)",
      "Alterian Enclave (Shadows)",
      "Mekan"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Intellect",
    "key_attributes": "Agility (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Stealth",
      "Disguise",
      "Knowledge (Computers)",
      "Acrobatics"
    ],
    "signature_features": [
      "Master of Disguise",
      "Digital Ghost"
    ],
    "tactical_role": "Stealth scouting, planting explosives, silent elimination.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A master of optical camouflage and tactical misdirection who treats reality as an obstacle to be bypassed.\n\n*You aren't there. Even when they look right at you, their eyes slide away. You move through fortified lines like a ghost, leaving nothing behind but an empty vault or a neutralized leader.*\n\n_\"Did you hear that? Probably just the wind.\"_",
    "keywords": "shadow-stepper, operative, artisan, adaptable, specialist, stealth, infiltration",
    "negative_keywords": "heavy-plating, blunt-assault, loud, clumsy, mindless-brute",
    "signature_traits": [
      "Master of Disguise",
      "Digital Ghost"
    ],
    "traits": [
      "Master of Disguise",
      "Digital Ghost"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Shadow-Stepper\n\n\nA master of optical camouflage and tactical misdirection who treats reality as an obstacle to be bypassed.\n\n*You aren't there. Even when they look right at you, their eyes slide away. You move through fortified lines like a ghost, leaving nothing behind but an empty vault or a neutralized leader.*\n\n*\"Did you hear that? Probably just the wind.\"*\n\n  - **Core Concept:** Stealth / Infiltration / Sabotage\n  - **Recommended Occupations:** Agent (*Spy*), Criminal.\n  - **Recommended Origins:** Urban, Research, Industrial.\n  - **Recommended Factions:** Syndicate (Infiltrators), Alterian Enclave (Shadows), Mekan.\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Disguise, Knowledge (Computers), Acrobatics.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Master of Disguise, Digital Ghost.\n  - **Tactical Role:** Stealth scouting, planting explosives, silent elimination.",
    "full_text": "# The Shadow-Stepper\n\n\nA master of optical camouflage and tactical misdirection who treats reality as an obstacle to be bypassed.\n\n*You aren't there. Even when they look right at you, their eyes slide away. You move through fortified lines like a ghost, leaving nothing behind but an empty vault or a neutralized leader.*\n\n*\"Did you hear that? Probably just the wind.\"*\n\n  - **Core Concept:** Stealth / Infiltration / Sabotage\n  - **Recommended Occupations:** Agent (*Spy*), Criminal.\n  - **Recommended Origins:** Urban, Research, Industrial.\n  - **Recommended Factions:** Syndicate (Infiltrators), Alterian Enclave (Shadows), Mekan.\n  - **Key Attributes:** Agility (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Disguise, Knowledge (Computers), Acrobatics.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Master of Disguise, Digital Ghost.\n  - **Tactical Role:** Stealth scouting, planting explosives, silent elimination."
  },
  {
    "id": "archetype-silent-blade",
    "name": "The Silent Blade",
    "sphere": "Operatives (The Artisans)",
    "summary": "A professional killer taking contracts to eliminate specific targets via long-range sniping or close-quarters execution.",
    "flavor": "You are the surgeon of warfare. You don't fight battles; you end them. With a single shot or a blade in the dark, you remove the pieces that hold the enemy together.",
    "quote": "\"One shot. One clean timeline.\"",
    "core_concept": "Stealth / Burst Damage",
    "recommended_occupations": [
      "Criminal",
      "Agent"
    ],
    "recommended_origins": [
      "Urban",
      "Militaristic",
      "Hostile"
    ],
    "recommended_factions": [
      "Syndicate (Liquidators)",
      "Dynasty (Royal Assassins)",
      "Outworlds"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Agility (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Stealth",
      "Acrobatics",
      "Athletics",
      "Combat (Sniper or Blades)"
    ],
    "signature_features": [
      "Silent Killer",
      "Master of Disguise"
    ],
    "tactical_role": "Elimination of High Value Targets, scouting, alpha strikes.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A professional killer taking contracts to eliminate specific targets via long-range sniping or close-quarters execution.\n\n*You are the surgeon of warfare. You don't fight battles; you end them. With a single shot or a blade in the dark, you remove the pieces that hold the enemy together.*\n\n_\"One shot. One clean timeline.\"_",
    "keywords": "silent blade, operative, artisan, adaptable, specialist, stealth, burst damage",
    "negative_keywords": "heavy-plating, blunt-assault, loud, clumsy",
    "signature_traits": [
      "Silent Killer",
      "Master of Disguise"
    ],
    "traits": [
      "Silent Killer",
      "Master of Disguise"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Silent Blade\n\n\nA professional killer taking contracts to eliminate specific targets via long-range sniping or close-quarters execution.\n\n*You are the surgeon of warfare. You don't fight battles; you end them. With a single shot or a blade in the dark, you remove the pieces that hold the enemy together.*\n\n*\"One shot. One clean timeline.\"*\n\n  - **Core Concept:** Stealth / Burst Damage\n  - **Recommended Occupations:** Criminal, Agent.\n  - **Recommended Origins:** Urban, Militaristic, Hostile.\n  - **Recommended Factions:** Syndicate (Liquidators), Dynasty (Royal Assassins), Outworlds.\n  - **Key Attributes:** Agility (+3 Primary), Wisdom / Alertness (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Acrobatics, Athletics, Combat (Sniper or Blades).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Silent Killer, Master of Disguise.\n  - **Tactical Role:** Elimination of High Value Targets, scouting, alpha strikes.",
    "full_text": "# The Silent Blade\n\n\nA professional killer taking contracts to eliminate specific targets via long-range sniping or close-quarters execution.\n\n*You are the surgeon of warfare. You don't fight battles; you end them. With a single shot or a blade in the dark, you remove the pieces that hold the enemy together.*\n\n*\"One shot. One clean timeline.\"*\n\n  - **Core Concept:** Stealth / Burst Damage\n  - **Recommended Occupations:** Criminal, Agent.\n  - **Recommended Origins:** Urban, Militaristic, Hostile.\n  - **Recommended Factions:** Syndicate (Liquidators), Dynasty (Royal Assassins), Outworlds.\n  - **Key Attributes:** Agility (+3 Primary), Wisdom / Alertness (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Stealth, Acrobatics, Athletics, Combat (Sniper or Blades).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Silent Killer, Master of Disguise.\n  - **Tactical Role:** Elimination of High Value Targets, scouting, alpha strikes."
  },
  {
    "id": "archetype-slicer",
    "name": "The Slicer",
    "sphere": "Operatives (The Artisans)",
    "summary": "A master of cyberspace, skilled in infiltrating networks and stealing data.",
    "flavor": "You are the knife in the digital dark. You carve through firewalls and dissect data streams, extracting the secrets that power empires.",
    "quote": "\"Information wants to be free. I'm just the liberator.\"",
    "core_concept": "Hacking / Intel / Support",
    "recommended_occupations": [
      "Specialist",
      "Criminal"
    ],
    "recommended_origins": [
      "Urban",
      "Industrial",
      "Research"
    ],
    "recommended_factions": [
      "Syndicate (Deckers)",
      "Mekan (Code-Weavers)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Agility",
    "key_attributes": "Intellect (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Knowledge (Computers)",
      "Knowledge (Investigation)",
      "Social"
    ],
    "signature_features": [
      "Digital Ghost",
      "Cyber Intrusion"
    ],
    "tactical_role": "Electronic warfare, data theft, bypassing security.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A master of cyberspace, skilled in infiltrating networks and stealing data.\n\n*You are the knife in the digital dark. You carve through firewalls and dissect data streams, extracting the secrets that power empires.*\n\n_\"Information wants to be free. I'm just the liberator.\"_",
    "keywords": "slicer, operative, artisan, adaptable, specialist, hacking, intel",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Digital Ghost",
      "Cyber Intrusion"
    ],
    "traits": [
      "Digital Ghost",
      "Cyber Intrusion"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Slicer\n\n\nA master of cyberspace, skilled in infiltrating networks and stealing data.\n\n*You are the knife in the digital dark. You carve through firewalls and dissect data streams, extracting the secrets that power empires.*\n\n*\"Information wants to be free. I'm just the liberator.\"*\n\n  - **Core Concept:** Hacking / Intel / Support\n  - **Recommended Occupations:** Specialist, Criminal.\n  - **Recommended Origins:** Urban, Industrial, Research.\n  - **Recommended Factions:** Syndicate (Deckers), Mekan (Code-Weavers), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Computers), Knowledge (Investigation), Social.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Digital Ghost, Cyber Intrusion.\n  - **Tactical Role:** Electronic warfare, data theft, bypassing security.",
    "full_text": "# The Slicer\n\n\nA master of cyberspace, skilled in infiltrating networks and stealing data.\n\n*You are the knife in the digital dark. You carve through firewalls and dissect data streams, extracting the secrets that power empires.*\n\n*\"Information wants to be free. I'm just the liberator.\"*\n\n  - **Core Concept:** Hacking / Intel / Support\n  - **Recommended Occupations:** Specialist, Criminal.\n  - **Recommended Origins:** Urban, Industrial, Research.\n  - **Recommended Factions:** Syndicate (Deckers), Mekan (Code-Weavers), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Computers), Knowledge (Investigation), Social.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Digital Ghost, Cyber Intrusion.\n  - **Tactical Role:** Electronic warfare, data theft, bypassing security."
  },
  {
    "id": "archetype-smuggler",
    "name": "The Smuggler",
    "sphere": "Operatives (The Artisans)",
    "summary": "Specializes in transporting illegal goods across borders.",
    "flavor": "You move the unmovable. You know the secret routes and the bribe-friendly guards. You deliver the goods, no questions asked, right under the noses of authority.",
    "quote": "\"I run a clean ship. Mostly.\"",
    "core_concept": "Transport / Stealth / Face",
    "recommended_occupations": [
      "Merchant",
      "Criminal"
    ],
    "recommended_origins": [
      "Spacer",
      "Urban",
      "Colony"
    ],
    "recommended_factions": [
      "Outworlds",
      "Coalition",
      "Syndicate (Black Market)"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Charisma",
    "key_attributes": "Agility (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Piloting",
      "Stealth",
      "Acrobatics",
      "Diplomacy"
    ],
    "signature_features": [
      "Evasive Maneuvers",
      "Hidden Compartments"
    ],
    "tactical_role": "Transporting illicit cargo, bypassing blockades, fast talk.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Specializes in transporting illegal goods across borders.\n\n*You move the unmovable. You know the secret routes and the bribe-friendly guards. You deliver the goods, no questions asked, right under the noses of authority.*\n\n_\"I run a clean ship. Mostly.\"_",
    "keywords": "smuggler, operative, artisan, adaptable, specialist, transport, stealth",
    "negative_keywords": "heavy-plating, blunt-assault, loud, clumsy",
    "signature_traits": [
      "Evasive Maneuvers",
      "Hidden Compartments"
    ],
    "traits": [
      "Evasive Maneuvers",
      "Hidden Compartments"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Smuggler\n\n\nSpecializes in transporting illegal goods across borders.\n\n*You move the unmovable. You know the secret routes and the bribe-friendly guards. You deliver the goods, no questions asked, right under the noses of authority.*\n\n*\"I run a clean ship. Mostly.\"*\n\n  - **Core Concept:** Transport / Stealth / Face\n  - **Recommended Occupations:** Merchant, Criminal.\n  - **Recommended Origins:** Spacer, Urban, Colony.\n  - **Recommended Factions:** Outworlds, Coalition, Syndicate (Black Market).\n  - **Key Attributes:** Agility (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Piloting, Stealth, Acrobatics, Diplomacy.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Evasive Maneuvers, Hidden Compartments.\n  - **Tactical Role:** Transporting illicit cargo, bypassing blockades, fast talk.",
    "full_text": "# The Smuggler\n\n\nSpecializes in transporting illegal goods across borders.\n\n*You move the unmovable. You know the secret routes and the bribe-friendly guards. You deliver the goods, no questions asked, right under the noses of authority.*\n\n*\"I run a clean ship. Mostly.\"*\n\n  - **Core Concept:** Transport / Stealth / Face\n  - **Recommended Occupations:** Merchant, Criminal.\n  - **Recommended Origins:** Spacer, Urban, Colony.\n  - **Recommended Factions:** Outworlds, Coalition, Syndicate (Black Market).\n  - **Key Attributes:** Agility (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Piloting, Stealth, Acrobatics, Diplomacy.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Evasive Maneuvers, Hidden Compartments.\n  - **Tactical Role:** Transporting illicit cargo, bypassing blockades, fast talk."
  },
  {
    "id": "archetype-swashbuckler",
    "name": "The Swashbuckler",
    "sphere": "Operatives (The Artisans)",
    "summary": "A skilled combatant who excels in boarding actions and close-quarters flair.",
    "flavor": "You fight with panache. You treat combat as a dance, outmaneuvering foes with wit and blade. You are the hero of your own story, and you make sure everyone knows it.",
    "quote": "\"En garde! Try not to bore me.\"",
    "core_concept": "Melee DPS / Mobility / Face",
    "recommended_occupations": [
      "Soldier",
      "Entertainer"
    ],
    "recommended_origins": [
      "Leisure",
      "Spacer",
      "Urban"
    ],
    "recommended_factions": [
      "Dynasty (Duelists)",
      "Outworlds (Pirates)",
      "Entari"
    ],
    "primary_attribute": "Agility",
    "secondary_attribute": "Charisma",
    "key_attributes": "Agility (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Acrobatics",
      "Athletics",
      "Combat (Melee)",
      "Bluff"
    ],
    "signature_features": [
      "Boarding Party",
      "Weapon Master"
    ],
    "tactical_role": "Engaging enemy leaders, mobile melee damage, flamboyant distraction.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A skilled combatant who excels in boarding actions and close-quarters flair.\n\n*You fight with panache. You treat combat as a dance, outmaneuvering foes with wit and blade. You are the hero of your own story, and you make sure everyone knows it.*\n\n_\"En garde! Try not to bore me.\"_",
    "keywords": "swashbuckler, operative, artisan, adaptable, specialist, melee dps, mobility",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Boarding Party",
      "Weapon Master"
    ],
    "traits": [
      "Boarding Party",
      "Weapon Master"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Swashbuckler\n\n\nA skilled combatant who excels in boarding actions and close-quarters flair.\n\n*You fight with panache. You treat combat as a dance, outmaneuvering foes with wit and blade. You are the hero of your own story, and you make sure everyone knows it.*\n\n*\"En garde! Try not to bore me.\"*\n\n  - **Core Concept:** Melee DPS / Mobility / Face\n  - **Recommended Occupations:** Soldier, Entertainer.\n  - **Recommended Origins:** Leisure, Spacer, Urban.\n  - **Recommended Factions:** Dynasty (Duelists), Outworlds (Pirates), Entari.\n  - **Key Attributes:** Agility (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Athletics, Combat (Melee), Bluff.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Boarding Party, Weapon Master.\n  - **Tactical Role:** Engaging enemy leaders, mobile melee damage, flamboyant distraction.",
    "full_text": "# The Swashbuckler\n\n\nA skilled combatant who excels in boarding actions and close-quarters flair.\n\n*You fight with panache. You treat combat as a dance, outmaneuvering foes with wit and blade. You are the hero of your own story, and you make sure everyone knows it.*\n\n*\"En garde! Try not to bore me.\"*\n\n  - **Core Concept:** Melee DPS / Mobility / Face\n  - **Recommended Occupations:** Soldier, Entertainer.\n  - **Recommended Origins:** Leisure, Spacer, Urban.\n  - **Recommended Factions:** Dynasty (Duelists), Outworlds (Pirates), Entari.\n  - **Key Attributes:** Agility (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Athletics, Combat (Melee), Bluff.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Boarding Party, Weapon Master.\n  - **Tactical Role:** Engaging enemy leaders, mobile melee damage, flamboyant distraction."
  },
  {
    "id": "archetype-thespian",
    "name": "The Thespian",
    "sphere": "Operatives (The Artisans)",
    "summary": "The master of the dramatic arts, captivating audiences with powerful performances.",
    "flavor": "You can be anyone. To the guard, you are a general; to the noble, a lost heir. You wield identity as a tool, slipping into social circles and extracting secrets before the curtain falls.",
    "quote": "\"All the world's a stage, and I am the only one who knows the script.\"",
    "core_concept": "Face / Infiltrator / Distraction",
    "recommended_occupations": [
      "Entertainer",
      "Spy"
    ],
    "recommended_origins": [
      "Urban",
      "Leisure",
      "Enlightened"
    ],
    "recommended_factions": [
      "Entari Combine (Culture)",
      "Alterian Enclave (High Art)",
      "Syndicate (Media)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Expression (any)",
      "Diplomacy",
      "Bluff",
      "Insight"
    ],
    "signature_features": [
      "Stage Presence",
      "Emotional Range"
    ],
    "tactical_role": "Create diversions, infiltrate social circles, impersonate key personnel.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The master of the dramatic arts, captivating audiences with powerful performances.\n\n*You can be anyone. To the guard, you are a general; to the noble, a lost heir. You wield identity as a tool, slipping into social circles and extracting secrets before the curtain falls.*\n\n_\"All the world's a stage, and I am the only one who knows the script.\"_",
    "keywords": "thespian, operative, artisan, adaptable, specialist, face, infiltrator",
    "negative_keywords": "heavy-plating, blunt-assault, loud, clumsy",
    "signature_traits": [
      "Stage Presence",
      "Emotional Range"
    ],
    "traits": [
      "Stage Presence",
      "Emotional Range"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Thespian\n\n\nThe master of the dramatic arts, captivating audiences with powerful performances.\n\n*You can be anyone. To the guard, you are a general; to the noble, a lost heir. You wield identity as a tool, slipping into social circles and extracting secrets before the curtain falls.*\n\n*\"All the world's a stage, and I am the only one who knows the script.\"*\n\n  - **Core Concept:** Face / Infiltrator / Distraction\n  - **Recommended Occupations:** Entertainer, Agent (*Spy*).\n  - **Recommended Origins:** Urban, Leisure, Enlightened.\n  - **Recommended Factions:** Entari Combine (Culture), Alterian Enclave (High Art), Syndicate (Media).\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Expression (any), Diplomacy, Bluff, Insight.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Stage Presence, Emotional Range.\n  - **Tactical Role:** Create diversions, infiltrate social circles, impersonate key personnel.",
    "full_text": "# The Thespian\n\n\nThe master of the dramatic arts, captivating audiences with powerful performances.\n\n*You can be anyone. To the guard, you are a general; to the noble, a lost heir. You wield identity as a tool, slipping into social circles and extracting secrets before the curtain falls.*\n\n*\"All the world's a stage, and I am the only one who knows the script.\"*\n\n  - **Core Concept:** Face / Infiltrator / Distraction\n  - **Recommended Occupations:** Entertainer, Agent (*Spy*).\n  - **Recommended Origins:** Urban, Leisure, Enlightened.\n  - **Recommended Factions:** Entari Combine (Culture), Alterian Enclave (High Art), Syndicate (Media).\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Expression (any), Diplomacy, Bluff, Insight.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Stage Presence, Emotional Range.\n  - **Tactical Role:** Create diversions, infiltrate social circles, impersonate key personnel."
  },
  {
    "id": "archetype-vagabond",
    "name": "The Vagabond",
    "sphere": "Operatives (The Artisans)",
    "summary": "Travels from place to place without a fixed home. Characterized by freedom, adaptability, and adventure.",
    "flavor": "You are the ultimate survivor. You have no home, but you have a skill for every situation. You fix what's broken, find what's lost, and disappear before the trouble starts.",
    "quote": "\"I've been everywhere, man. And I know the quickest way out of here.\"",
    "core_concept": "Jack-of-All-Trades / Survivor",
    "recommended_occupations": [
      "Drifter",
      "Scout"
    ],
    "recommended_origins": [
      "Spacer",
      "Colony",
      "Hostile"
    ],
    "recommended_factions": [
      "Outworlds (Drifters)",
      "Coalition (Wanderers)",
      "Ascendancy"
    ],
    "primary_attribute": "Stamina",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Stamina (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Pilot",
      "Knowledge (Survival)",
      "Streetwise",
      "Vocation (General)"
    ],
    "signature_features": [
      "Adaptability",
      "Mobility"
    ],
    "tactical_role": "Fills gaps in the party, transport, urban survival.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Travels from place to place without a fixed home. Characterized by freedom, adaptability, and adventure.\n\n*You are the ultimate survivor. You have no home, but you have a skill for every situation. You fix what's broken, find what's lost, and disappear before the trouble starts.*\n\n_\"I've been everywhere, man. And I know the quickest way out of here.\"_",
    "keywords": "vagabond, operative, artisan, adaptable, specialist, jack-of-all-trades, survivor",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Adaptability",
      "Mobility"
    ],
    "traits": [
      "Adaptability",
      "Mobility"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Vagabond\n\n\nTravels from place to place without a fixed home. Characterized by freedom, adaptability, and adventure.\n\n*You are the ultimate survivor. You have no home, but you have a skill for every situation. You fix what's broken, find what's lost, and disappear before the trouble starts.*\n\n*\"I've been everywhere, man. And I know the quickest way out of here.\"*\n\n  - **Core Concept:** Jack-of-All-Trades / Survivor\n  - **Recommended Occupations:** Drifter, Scout.\n  - **Recommended Origins:** Spacer, Colony, Hostile.\n  - **Recommended Factions:** Outworlds (Drifters), Coalition (Wanderers), Ascendancy.\n  - **Key Attributes:** Stamina (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Pilot, Knowledge (Survival), Streetwise, Vocation (General).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Adaptability, Mobility.\n  - **Tactical Role:** Fills gaps in the party, transport, urban survival.",
    "full_text": "# The Vagabond\n\n\nTravels from place to place without a fixed home. Characterized by freedom, adaptability, and adventure.\n\n*You are the ultimate survivor. You have no home, but you have a skill for every situation. You fix what's broken, find what's lost, and disappear before the trouble starts.*\n\n*\"I've been everywhere, man. And I know the quickest way out of here.\"*\n\n  - **Core Concept:** Jack-of-All-Trades / Survivor\n  - **Recommended Occupations:** Drifter, Scout.\n  - **Recommended Origins:** Spacer, Colony, Hostile.\n  - **Recommended Factions:** Outworlds (Drifters), Coalition (Wanderers), Ascendancy.\n  - **Key Attributes:** Stamina (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Pilot, Knowledge (Survival), Streetwise, Vocation (General).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Adaptability, Mobility.\n  - **Tactical Role:** Fills gaps in the party, transport, urban survival."
  },
  {
    "id": "archetype-virtuoso",
    "name": "The Virtuoso",
    "sphere": "Operatives (The Artisans)",
    "summary": "Captivates audiences with skills in music, dance, or acting. Thrives in the spotlight.",
    "flavor": "You control the mood of the room. You can turn a hostile crowd into a cheering mob or distract a guard with a song. Your art is your weapon, and fame is your shield.",
    "quote": "\"Eyes on me, everyone. You won't want to miss this.\"",
    "core_concept": "Social / Distraction / Buffer",
    "recommended_occupations": [
      "Entertainer",
      "Citizen"
    ],
    "recommended_origins": [
      "Leisure",
      "Urban",
      "Enlightened"
    ],
    "recommended_factions": [
      "Entari Combine (Culture)",
      "Alterian Enclave",
      "Syndicate (Media)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Agility",
    "key_attributes": "Charisma (Primary), Agility (Secondary).",
    "essential_skills": [
      "Acrobatics",
      "Expression (any)",
      "Diplomacy",
      "Social"
    ],
    "signature_features": [
      "Showmanship",
      "Star Power"
    ],
    "tactical_role": "Distracting guards, earning money, gaining access to exclusive events.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Captivates audiences with skills in music, dance, or acting. Thrives in the spotlight.\n\n*You control the mood of the room. You can turn a hostile crowd into a cheering mob or distract a guard with a song. Your art is your weapon, and fame is your shield.*\n\n_\"Eyes on me, everyone. You won't want to miss this.\"_",
    "keywords": "virtuoso, operative, artisan, adaptable, specialist, social, distraction",
    "negative_keywords": "incompetent, untrained, undisciplined",
    "signature_traits": [
      "Showmanship",
      "Star Power"
    ],
    "traits": [
      "Showmanship",
      "Star Power"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Virtuoso\n\n\nCaptivates audiences with skills in music, dance, or acting. Thrives in the spotlight.\n\n*You control the mood of the room. You can turn a hostile crowd into a cheering mob or distract a guard with a song. Your art is your weapon, and fame is your shield.*\n\n*\"Eyes on me, everyone. You won't want to miss this.\"*\n\n  - **Core Concept:** Social / Distraction / Buffer\n  - **Recommended Occupations:** Entertainer, Citizen.\n  - **Recommended Origins:** Leisure, Urban, Enlightened.\n  - **Recommended Factions:** Entari Combine (Culture), Alterian Enclave, Syndicate (Media).\n  - **Key Attributes:** Charisma (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Expression (any), Diplomacy, Social.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Showmanship, Star Power.\n  - **Tactical Role:** Distracting guards, earning money, gaining access to exclusive events.",
    "full_text": "# The Virtuoso\n\n\nCaptivates audiences with skills in music, dance, or acting. Thrives in the spotlight.\n\n*You control the mood of the room. You can turn a hostile crowd into a cheering mob or distract a guard with a song. Your art is your weapon, and fame is your shield.*\n\n*\"Eyes on me, everyone. You won't want to miss this.\"*\n\n  - **Core Concept:** Social / Distraction / Buffer\n  - **Recommended Occupations:** Entertainer, Citizen.\n  - **Recommended Origins:** Leisure, Urban, Enlightened.\n  - **Recommended Factions:** Entari Combine (Culture), Alterian Enclave, Syndicate (Media).\n  - **Key Attributes:** Charisma (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Acrobatics, Expression (any), Diplomacy, Social.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Showmanship, Star Power.\n  - **Tactical Role:** Distracting guards, earning money, gaining access to exclusive events."
  },
  {
    "id": "archetype-activist",
    "name": "The Activist",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A passionate individual who fights for social justice and equality. They utilize their voice to raise awareness and effect change.",
    "flavor": "You are the conscience of the galaxy. You speak for the voiceless and stand against the corrupt. Your power comes not from weapons, but from the unshakeable belief that things can be better.",
    "quote": "\"We do not beg for freedom. We demand it.\"",
    "core_concept": "Buffer / Leader / Moral Compass",
    "recommended_occupations": [
      "Citizen",
      "Representative"
    ],
    "recommended_origins": [
      "Urban",
      "Colony",
      "Enlightened"
    ],
    "recommended_factions": [
      "Coalition (Freedom Movement)",
      "Entari Combine (Ethicists)",
      "Outworlds"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Insight",
      "Knowledge (History)",
      "Leadership"
    ],
    "signature_features": [
      "Voice of the People",
      "Community Organizer"
    ],
    "tactical_role": "Rally NPCs to the party's cause, de-escalate riots, negotiate with locals.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A passionate individual who fights for social justice and equality. They utilize their voice to raise awareness and effect change.\n\n*You are the conscience of the galaxy. You speak for the voiceless and stand against the corrupt. Your power comes not from weapons, but from the unshakeable belief that things can be better.*\n\n_\"We do not beg for freedom. We demand it.\"_",
    "keywords": "activist, visionary, idealist, leadership, charisma, buffer, leader",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Voice of the People",
      "Community Organizer"
    ],
    "traits": [
      "Voice of the People",
      "Community Organizer"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Activist\n\n\nA passionate individual who fights for social justice and equality. They utilize their voice to raise awareness and effect change.\n\n*You are the conscience of the galaxy. You speak for the voiceless and stand against the corrupt. Your power comes not from weapons, but from the unshakeable belief that things can be better.*\n\n*\"We do not beg for freedom. We demand it.\"*\n\n  - **Core Concept:** Buffer / Leader / Moral Compass\n  - **Recommended Occupations:** Citizen, Representative.\n  - **Recommended Origins:** Urban, Colony, Enlightened.\n  - **Recommended Factions:** Coalition (Freedom Movement), Entari Combine (Ethicists), Outworlds.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (History), Leadership.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Voice of the People, Community Organizer.\n  - **Tactical Role:** Rally NPCs to the party's cause, de-escalate riots, negotiate with locals.",
    "full_text": "# The Activist\n\n\nA passionate individual who fights for social justice and equality. They utilize their voice to raise awareness and effect change.\n\n*You are the conscience of the galaxy. You speak for the voiceless and stand against the corrupt. Your power comes not from weapons, but from the unshakeable belief that things can be better.*\n\n*\"We do not beg for freedom. We demand it.\"*\n\n  - **Core Concept:** Buffer / Leader / Moral Compass\n  - **Recommended Occupations:** Citizen, Representative.\n  - **Recommended Origins:** Urban, Colony, Enlightened.\n  - **Recommended Factions:** Coalition (Freedom Movement), Entari Combine (Ethicists), Outworlds.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (History), Leadership.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Voice of the People, Community Organizer.\n  - **Tactical Role:** Rally NPCs to the party's cause, de-escalate riots, negotiate with locals."
  },
  {
    "id": "archetype-arbitrator",
    "name": "The Arbitrator",
    "sphere": "Visionaries (The Idealists)",
    "summary": "The neutral mediator who resolves disputes with absolute impartiality and a deep understanding of universal justice.",
    "flavor": "You are the middle ground. In a galaxy of competing interests and violent factions, you provide the calm center where words replace weapons. You don't take sides; you find the truth.",
    "quote": "\"Justice is a scale. It must be balanced, not broken.\"",
    "core_concept": "Mediator / Social / Buffer",
    "recommended_occupations": [
      "Agent",
      "Scholar"
    ],
    "recommended_origins": [
      "Research",
      "Urban",
      "Colony"
    ],
    "recommended_factions": [
      "Ascendancy (Judges)",
      "Entari Combine (Ethicists)",
      "Syndicate"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Charisma",
    "key_attributes": "Wisdom (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Insight",
      "Knowledge (Law)",
      "Diplomacy",
      "Investigation"
    ],
    "signature_features": [
      "Conflict resolution",
      "Master Negotiator"
    ],
    "tactical_role": "Preventing conflict escalation, identifying lies, securing diplomatic safety.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The neutral mediator who resolves disputes with absolute impartiality and a deep understanding of universal justice.\n\n*You are the middle ground. In a galaxy of competing interests and violent factions, you provide the calm center where words replace weapons. You don't take sides; you find the truth.*\n\n_\"Justice is a scale. It must be balanced, not broken.\"_",
    "keywords": "arbitrator, visionary, idealist, leadership, charisma, mediator, social",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Conflict resolution",
      "Master Negotiator"
    ],
    "traits": [
      "Conflict resolution",
      "Master Negotiator"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Arbitrator\n\n\nThe neutral mediator who resolves disputes with absolute impartiality and a deep understanding of universal justice.\n\n*You are the middle ground. In a galaxy of competing interests and violent factions, you provide the calm center where words replace weapons. You don't take sides; you find the truth.*\n\n*\"Justice is a scale. It must be balanced, not broken.\"*\n\n  - **Core Concept:** Mediator / Social / Buffer\n  - **Recommended Occupations:** Agent, Scholar.\n  - **Recommended Origins:** Research, Urban, Colony.\n  - **Recommended Factions:** Ascendancy (Judges), Entari Combine (Ethicists), Syndicate.\n  - **Key Attributes:** Wisdom (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Insight, Knowledge (Law), Diplomacy, Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Conflict resolution, Master Negotiator.\n  - **Tactical Role:** Preventing conflict escalation, identifying lies, securing diplomatic safety.",
    "full_text": "# The Arbitrator\n\n\nThe neutral mediator who resolves disputes with absolute impartiality and a deep understanding of universal justice.\n\n*You are the middle ground. In a galaxy of competing interests and violent factions, you provide the calm center where words replace weapons. You don't take sides; you find the truth.*\n\n*\"Justice is a scale. It must be balanced, not broken.\"*\n\n  - **Core Concept:** Mediator / Social / Buffer\n  - **Recommended Occupations:** Agent, Scholar.\n  - **Recommended Origins:** Research, Urban, Colony.\n  - **Recommended Factions:** Ascendancy (Judges), Entari Combine (Ethicists), Syndicate.\n  - **Key Attributes:** Wisdom (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Insight, Knowledge (Law), Diplomacy, Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Conflict resolution, Master Negotiator.\n  - **Tactical Role:** Preventing conflict escalation, identifying lies, securing diplomatic safety."
  },
  {
    "id": "archetype-aristocrat",
    "name": "The Aristocrat",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A member of the aristocracy, born into a position of privilege and power. They wield status as a weapon.",
    "flavor": "You were born to rule. Your name opens doors that are locked to commoners, and your wealth solves problems before they begin. You navigate the deadly game of courts and kings with practiced ease.",
    "quote": "\"Do you know who I am? That was a rhetorical question.\"",
    "core_concept": "Resource Access / Face / Leader",
    "recommended_occupations": [
      "Noble",
      "Citizen"
    ],
    "recommended_origins": [
      "Leisure",
      "Urban",
      "Enlightened"
    ],
    "recommended_factions": [
      "Dracon Dynasty (Nobility)",
      "Impyrium (Patricians)",
      "Alterian Enclave (Elders)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Knowledge (History)",
      "Insight",
      "Knowledge (Nobility)"
    ],
    "signature_features": [
      "Noble Lineage",
      "Courtly Intrigue"
    ],
    "tactical_role": "Gaining access to high-security areas via status, funding, legal immunity.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A member of the aristocracy, born into a position of privilege and power. They wield status as a weapon.\n\n*You were born to rule. Your name opens doors that are locked to commoners, and your wealth solves problems before they begin. You navigate the deadly game of courts and kings with practiced ease.*\n\n_\"Do you know who I am? That was a rhetorical question.\"_",
    "keywords": "aristocrat, visionary, idealist, leadership, charisma, resource access, face",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Noble Lineage",
      "Courtly Intrigue"
    ],
    "traits": [
      "Noble Lineage",
      "Courtly Intrigue"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Aristocrat\n\n\nA member of the aristocracy, born into a position of privilege and power. They wield status as a weapon.\n\n*You were born to rule. Your name opens doors that are locked to commoners, and your wealth solves problems before they begin. You navigate the deadly game of courts and kings with practiced ease.*\n\n*\"Do you know who I am? That was a rhetorical question.\"*\n\n  - **Core Concept:** Resource Access / Face / Leader\n  - **Recommended Occupations:** Representative / Citizen (Elite), Citizen.\n  - **Recommended Origins:** Leisure, Urban, Enlightened.\n  - **Recommended Factions:** Dracon Dynasty (Nobility), Impyrium (Patricians), Alterian Enclave (Elders).\n  - **Key Attributes:** Charisma (+3 Primary), History (Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Knowledge (History), Insight, Knowledge (Nobility).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Noble Lineage, Courtly Intrigue.\n  - **Tactical Role:** Gaining access to high-security areas via status, funding, legal immunity.",
    "full_text": "# The Aristocrat\n\n\nA member of the aristocracy, born into a position of privilege and power. They wield status as a weapon.\n\n*You were born to rule. Your name opens doors that are locked to commoners, and your wealth solves problems before they begin. You navigate the deadly game of courts and kings with practiced ease.*\n\n*\"Do you know who I am? That was a rhetorical question.\"*\n\n  - **Core Concept:** Resource Access / Face / Leader\n  - **Recommended Occupations:** Representative / Citizen (Elite), Citizen.\n  - **Recommended Origins:** Leisure, Urban, Enlightened.\n  - **Recommended Factions:** Dracon Dynasty (Nobility), Impyrium (Patricians), Alterian Enclave (Elders).\n  - **Key Attributes:** Charisma (+3 Primary), History (Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Knowledge (History), Insight, Knowledge (Nobility).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Noble Lineage, Courtly Intrigue.\n  - **Tactical Role:** Gaining access to high-security areas via status, funding, legal immunity."
  },
  {
    "id": "archetype-ascetic",
    "name": "The Ascetic",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A devout individual dedicated to prayer and meditation, seeking enlightenment.",
    "flavor": "You have mastered the self. While others seek power in the world, you find it within. Your mind is a fortress, and your spirit is a weapon honed by discipline and silence.",
    "quote": "\"Peace is not the absence of conflict, but the ability to handle it.\"",
    "core_concept": "Monk / Buffer / Mental Tank",
    "recommended_occupations": [
      "Adept",
      "Scholar"
    ],
    "recommended_origins": [
      "Enlightened",
      "Hostile",
      "Agricultural"
    ],
    "recommended_factions": [
      "Auluran (Dar Mystics)",
      "Mekan (Code Monks)",
      "Outworlds"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Stamina",
    "key_attributes": "Wisdom (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Insight",
      "Alertness",
      "Knowledge (Religion)",
      "Knowledge (Metaphysics)"
    ],
    "signature_features": [
      "Inner Peace",
      "Spiritual Attunement"
    ],
    "tactical_role": "Resisting mental attacks, calming emotions, spiritual guidance.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A devout individual dedicated to prayer and meditation, seeking enlightenment.\n\n*You have mastered the self. While others seek power in the world, you find it within. Your mind is a fortress, and your spirit is a weapon honed by discipline and silence.*\n\n_\"Peace is not the absence of conflict, but the ability to handle it.\"_",
    "keywords": "ascetic, visionary, idealist, leadership, charisma, monk, buffer",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Inner Peace",
      "Spiritual Attunement"
    ],
    "traits": [
      "Inner Peace",
      "Spiritual Attunement"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Ascetic\n\n\nA devout individual dedicated to prayer and meditation, seeking enlightenment.\n\n*You have mastered the self. While others seek power in the world, you find it within. Your mind is a fortress, and your spirit is a weapon honed by discipline and silence.*\n\n*\"Peace is not the absence of conflict, but the ability to handle it.\"*\n\n  - **Core Concept:** Monk / Buffer / Mental Tank\n  - **Recommended Occupations:** Adept, Scholar.\n  - **Recommended Origins:** Enlightened, Hostile, Agricultural.\n  - **Recommended Factions:** Auluran (Dar Mystics), Mekan (Code Monks), Outworlds.\n  - **Key Attributes:** Wisdom (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Insight, Alertness, Knowledge (Religion), Knowledge (Metaphysics).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Inner Peace, Spiritual Attunement.\n  - **Tactical Role:** Resisting mental attacks, calming emotions, spiritual guidance.",
    "full_text": "# The Ascetic\n\n\nA devout individual dedicated to prayer and meditation, seeking enlightenment.\n\n*You have mastered the self. While others seek power in the world, you find it within. Your mind is a fortress, and your spirit is a weapon honed by discipline and silence.*\n\n*\"Peace is not the absence of conflict, but the ability to handle it.\"*\n\n  - **Core Concept:** Monk / Buffer / Mental Tank\n  - **Recommended Occupations:** Adept, Scholar.\n  - **Recommended Origins:** Enlightened, Hostile, Agricultural.\n  - **Recommended Factions:** Auluran (Dar Mystics), Mekan (Code Monks), Outworlds.\n  - **Key Attributes:** Wisdom (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Insight, Alertness, Knowledge (Religion), Knowledge (Metaphysics).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Inner Peace, Spiritual Attunement.\n  - **Tactical Role:** Resisting mental attacks, calming emotions, spiritual guidance."
  },
  {
    "id": "archetype-chronicler",
    "name": "The Chronicler",
    "sphere": "Visionaries (The Idealists)",
    "summary": "Weaver of words and tales, captivating audiences with immersive narratives and transporting them to fantastical realms.",
    "flavor": "You keep the history alive. You know that a story can inspire a revolution or calm a beast. You carry the memory of your people, ensuring that their deeds—and your team's deeds—are never forgotten.",
    "quote": "\"Let me tell you how this ends.\"",
    "core_concept": "Bard / Historian / Buffer",
    "recommended_occupations": [
      "Entertainer",
      "Scholar"
    ],
    "recommended_origins": [
      "Enlightened",
      "Urban",
      "Leisure"
    ],
    "recommended_factions": [
      "Alterian Enclave (Historians)",
      "Impyrium (Archivists)",
      "Entari Combine"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Expression (Oratory)",
      "Knowledge (History)",
      "Diplomacy",
      "Bluff"
    ],
    "signature_features": [
      "Masterful Narrator",
      "World Builder"
    ],
    "tactical_role": "Buffing allies with inspiration, gathering local lore, engaging social encounters.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Weaver of words and tales, captivating audiences with immersive narratives and transporting them to fantastical realms.\n\n*You keep the history alive. You know that a story can inspire a revolution or calm a beast. You carry the memory of your people, ensuring that their deeds—and your team's deeds—are never forgotten.*\n\n_\"Let me tell you how this ends.\"_",
    "keywords": "chronicler, visionary, idealist, leadership, charisma, bard, historian",
    "negative_keywords": "mindless-brute, reckless, illiterate, anti-social, mute",
    "signature_traits": [
      "Masterful Narrator",
      "World Builder"
    ],
    "traits": [
      "Masterful Narrator",
      "World Builder"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Chronicler\n\n\nWeaver of words and tales, captivating audiences with immersive narratives and transporting them to fantastical realms.\n\n*You keep the history alive. You know that a story can inspire a revolution or calm a beast. You carry the memory of your people, ensuring that their deeds—and your team's deeds—are never forgotten.*\n\n*\"Let me tell you how this ends.\"*\n\n  - **Core Concept:** Bard / Historian / Buffer\n  - **Recommended Occupations:** Entertainer, Scholar.\n  - **Recommended Origins:** Enlightened, Urban, Leisure.\n  - **Recommended Factions:** Alterian Enclave (Historians), Impyrium (Archivists), Entari Combine.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Expression (Oratory), Knowledge (History), Diplomacy, Bluff.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Masterful Narrator, World Builder.\n  - **Tactical Role:** Buffing allies with inspiration, gathering local lore, engaging social encounters.",
    "full_text": "# The Chronicler\n\n\nWeaver of words and tales, captivating audiences with immersive narratives and transporting them to fantastical realms.\n\n*You keep the history alive. You know that a story can inspire a revolution or calm a beast. You carry the memory of your people, ensuring that their deeds—and your team's deeds—are never forgotten.*\n\n*\"Let me tell you how this ends.\"*\n\n  - **Core Concept:** Bard / Historian / Buffer\n  - **Recommended Occupations:** Entertainer, Scholar.\n  - **Recommended Origins:** Enlightened, Urban, Leisure.\n  - **Recommended Factions:** Alterian Enclave (Historians), Impyrium (Archivists), Entari Combine.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Expression (Oratory), Knowledge (History), Diplomacy, Bluff.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Masterful Narrator, World Builder.\n  - **Tactical Role:** Buffing allies with inspiration, gathering local lore, engaging social encounters."
  },
  {
    "id": "archetype-commander",
    "name": "The Commander",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A charismatic and cunning leader who commands a starship, charting courses and leading crew in dangerous adventures.",
    "flavor": "You are the one they look to when the alarms scream. You make the hard calls, hold the crew together, and steer the ship through the storm. You are the undisputed master of your vessel.",
    "quote": "\"On my deck, my word is law. Prepare for hard burn.\"",
    "core_concept": "Leader / Buffer / Vehicle Expert",
    "recommended_occupations": [
      "Spacer",
      "Officer"
    ],
    "recommended_origins": [
      "Spacer",
      "Militaristic",
      "Colony"
    ],
    "recommended_factions": [
      "Impyrium (Admiralty)",
      "Dynasty (Fleet Lords)",
      "Ascendancy"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Leadership",
      "Diplomacy",
      "Knowledge (Tactics)",
      "Combat (any)"
    ],
    "signature_features": [
      "Commanding Presence",
      "Pirate Captain"
    ],
    "tactical_role": "Buffing the party (Orders), piloting/commanding vehicles, face of the group.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A charismatic and cunning leader who commands a starship, charting courses and leading crew in dangerous adventures.\n\n*You are the one they look to when the alarms scream. You make the hard calls, hold the crew together, and steer the ship through the storm. You are the undisputed master of your vessel.*\n\n_\"On my deck, my word is law. Prepare for hard burn.\"_",
    "keywords": "commander, visionary, idealist, leadership, charisma, leader, buffer",
    "negative_keywords": "mindless-brute, reckless, illiterate, anti-social, mute",
    "signature_traits": [
      "Commanding Presence",
      "Pirate Captain"
    ],
    "traits": [
      "Commanding Presence",
      "Pirate Captain"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Commander\n\n\nA charismatic and cunning leader who commands a starship, charting courses and leading crew in dangerous adventures.\n\n*You are the one they look to when the alarms scream. You make the hard calls, hold the crew together, and steer the ship through the storm. You are the undisputed master of your vessel.*\n\n*\"On my deck, my word is law. Prepare for hard burn.\"*\n\n  - **Core Concept:** Leader / Buffer / Vehicle Expert\n  - **Recommended Occupations:** Specialist / Scout (*Spacer*), Soldier (Officer).\n  - **Recommended Origins:** Spacer, Militaristic, Colony.\n  - **Recommended Factions:** Impyrium (Admiralty), Dynasty (Fleet Lords), Ascendancy.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Diplomacy, Knowledge (Tactics), Combat (any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Commanding Presence, Pirate Captain.\n  - **Tactical Role:** Buffing the party (Orders), piloting/commanding vehicles, face of the group.",
    "full_text": "# The Commander\n\n\nA charismatic and cunning leader who commands a starship, charting courses and leading crew in dangerous adventures.\n\n*You are the one they look to when the alarms scream. You make the hard calls, hold the crew together, and steer the ship through the storm. You are the undisputed master of your vessel.*\n\n*\"On my deck, my word is law. Prepare for hard burn.\"*\n\n  - **Core Concept:** Leader / Buffer / Vehicle Expert\n  - **Recommended Occupations:** Specialist / Scout (*Spacer*), Soldier (Officer).\n  - **Recommended Origins:** Spacer, Militaristic, Colony.\n  - **Recommended Factions:** Impyrium (Admiralty), Dynasty (Fleet Lords), Ascendancy.\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Diplomacy, Knowledge (Tactics), Combat (any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Commanding Presence, Pirate Captain.\n  - **Tactical Role:** Buffing the party (Orders), piloting/commanding vehicles, face of the group."
  },
  {
    "id": "archetype-cult-leader",
    "name": "The Cult Leader",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A charismatic leader who inspires and guides followers, delivering divine pronouncements.",
    "flavor": "You speak the divine truth. Your followers look to you for salvation, and you lead them with absolute conviction. You channel the power of belief to shape the world around you.",
    "quote": "\"Have faith, for the path is clear.\"",
    "core_concept": "Leader / Buffer / Minion Master",
    "recommended_occupations": [
      "Representative",
      "Adept"
    ],
    "recommended_origins": [
      "Urban",
      "Colony",
      "Enlightened"
    ],
    "recommended_factions": [
      "Outworlds",
      "Impyrium (Heretics)",
      "Syndicate (Corporate Cults)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Leadership",
      "Diplomacy",
      "Insight",
      "Knowledge (Religion)"
    ],
    "signature_features": [
      "Divine Inspiration",
      "Spiritual Leader"
    ],
    "tactical_role": "Controlling minions, inspiring allies, social manipulation.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A charismatic leader who inspires and guides followers, delivering divine pronouncements.\n\n*You speak the divine truth. Your followers look to you for salvation, and you lead them with absolute conviction. You channel the power of belief to shape the world around you.*\n\n_\"Have faith, for the path is clear.\"_",
    "keywords": "cult leader, visionary, idealist, leadership, charisma, leader, buffer",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Divine Inspiration",
      "Spiritual Leader"
    ],
    "traits": [
      "Divine Inspiration",
      "Spiritual Leader"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Cult Leader\n\n\nA charismatic leader who inspires and guides followers, delivering divine pronouncements.\n\n*You speak the divine truth. Your followers look to you for salvation, and you lead them with absolute conviction. You channel the power of belief to shape the world around you.*\n\n*\"Have faith, for the path is clear.\"*\n\n  - **Core Concept:** Leader / Buffer / Minion Master\n  - **Recommended Occupations:** Representative, Adept.\n  - **Recommended Origins:** Urban, Colony, Enlightened.\n  - **Recommended Factions:** Outworlds, Impyrium (Heretics), Syndicate (Corporate Cults).\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Diplomacy, Insight, Knowledge (Religion).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Divine Inspiration, Spiritual Leader.\n  - **Tactical Role:** Controlling minions, inspiring allies, social manipulation.",
    "full_text": "# The Cult Leader\n\n\nA charismatic leader who inspires and guides followers, delivering divine pronouncements.\n\n*You speak the divine truth. Your followers look to you for salvation, and you lead them with absolute conviction. You channel the power of belief to shape the world around you.*\n\n*\"Have faith, for the path is clear.\"*\n\n  - **Core Concept:** Leader / Buffer / Minion Master\n  - **Recommended Occupations:** Representative, Adept.\n  - **Recommended Origins:** Urban, Colony, Enlightened.\n  - **Recommended Factions:** Outworlds, Impyrium (Heretics), Syndicate (Corporate Cults).\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Diplomacy, Insight, Knowledge (Religion).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Divine Inspiration, Spiritual Leader.\n  - **Tactical Role:** Controlling minions, inspiring allies, social manipulation."
  },
  {
    "id": "archetype-demagogue",
    "name": "The Demagogue",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A skilled propagandist who spreads dissent and undermines authority through persuasive speeches and subversive media.",
    "flavor": "You are the spark that starts the fire. You know that information is a virus, and you infect the masses with ideas that topple empires. You turn the enemy's own populace against them.",
    "quote": "\"The truth is whatever I say it is loud enough.\"",
    "core_concept": "Debuffer / Chaos Agent / Crowd Control",
    "recommended_occupations": [
      "Criminal",
      "Entertainer"
    ],
    "recommended_origins": [
      "Urban",
      "Industrial",
      "Colony"
    ],
    "recommended_factions": [
      "Coalition (Rebels)",
      "Outworlds (Cults)",
      "Syndicate (Hostile Takeover)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Expression (any)",
      "Bluff",
      "Knowledge (Computers)"
    ],
    "signature_features": [
      "Voice of Dissent",
      "Subversive Tactics"
    ],
    "tactical_role": "Incite distractions, turn enemy minions against leaders, sow confusion.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A skilled propagandist who spreads dissent and undermines authority through persuasive speeches and subversive media.\n\n*You are the spark that starts the fire. You know that information is a virus, and you infect the masses with ideas that topple empires. You turn the enemy's own populace against them.*\n\n_\"The truth is whatever I say it is loud enough.\"_",
    "keywords": "demagogue, visionary, idealist, leadership, charisma, debuffer, chaos agent",
    "negative_keywords": "mindless-brute, reckless, illiterate, anti-social, mute",
    "signature_traits": [
      "Voice of Dissent",
      "Subversive Tactics"
    ],
    "traits": [
      "Voice of Dissent",
      "Subversive Tactics"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Demagogue\n\n\nA skilled propagandist who spreads dissent and undermines authority through persuasive speeches and subversive media.\n\n*You are the spark that starts the fire. You know that information is a virus, and you infect the masses with ideas that topple empires. You turn the enemy's own populace against them.*\n\n*\"The truth is whatever I say it is loud enough.\"*\n\n  - **Core Concept:** Debuffer / Chaos Agent / Crowd Control\n  - **Recommended Occupations:** Criminal, Entertainer.\n  - **Recommended Origins:** Urban, Industrial, Colony.\n  - **Recommended Factions:** Coalition (Rebels), Outworlds (Cults), Syndicate (Hostile Takeover).\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Expression (any), Bluff, Knowledge (Computers).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Voice of Dissent, Subversive Tactics.\n  - **Tactical Role:** Incite distractions, turn enemy minions against leaders, sow confusion.",
    "full_text": "# The Demagogue\n\n\nA skilled propagandist who spreads dissent and undermines authority through persuasive speeches and subversive media.\n\n*You are the spark that starts the fire. You know that information is a virus, and you infect the masses with ideas that topple empires. You turn the enemy's own populace against them.*\n\n*\"The truth is whatever I say it is loud enough.\"*\n\n  - **Core Concept:** Debuffer / Chaos Agent / Crowd Control\n  - **Recommended Occupations:** Criminal, Entertainer.\n  - **Recommended Origins:** Urban, Industrial, Colony.\n  - **Recommended Factions:** Coalition (Rebels), Outworlds (Cults), Syndicate (Hostile Takeover).\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Expression (any), Bluff, Knowledge (Computers).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Voice of Dissent, Subversive Tactics.\n  - **Tactical Role:** Incite distractions, turn enemy minions against leaders, sow confusion."
  },
  {
    "id": "archetype-doomsayer",
    "name": "The Doomsayer",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A nihilistic prophet who believes the end is inevitable and seeks to hasten or warn of it.",
    "flavor": "You see the darkness coming. You are the harbinger of entropy, speaking truths that others fear to hear. Your presence instills dread, for you walk hand in hand with the inevitable end.",
    "quote": "\"The void calls, and I am its voice.\"",
    "core_concept": "Debuffer / Intimidator / Caster",
    "recommended_occupations": [
      "Adept",
      "Outcast"
    ],
    "recommended_origins": [
      "Hostile",
      "Spacer",
      "Enlightened"
    ],
    "recommended_factions": [
      "Outworlds (Entropy Cults)",
      "Sha'Nor",
      "Coalition"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Intimidation",
      "Diplomacy",
      "Discipline (Entropy \\- Chaos)"
    ],
    "signature_features": [
      "Harbinger of Doom",
      "Embrace the Void"
    ],
    "tactical_role": "Demoralizing enemies, inflicting fear, wielding entropic magic.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A nihilistic prophet who believes the end is inevitable and seeks to hasten or warn of it.\n\n*You see the darkness coming. You are the harbinger of entropy, speaking truths that others fear to hear. Your presence instills dread, for you walk hand in hand with the inevitable end.*\n\n_\"The void calls, and I am its voice.\"_",
    "keywords": "doomsayer, visionary, idealist, leadership, charisma, debuffer, intimidator",
    "negative_keywords": "anti-social, mute, solitary-hermit, null-zone, anti-magic-fanatic",
    "signature_traits": [
      "Harbinger of Doom",
      "Embrace the Void"
    ],
    "traits": [
      "Harbinger of Doom",
      "Embrace the Void"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Doomsayer\n\n\nA nihilistic prophet who believes the end is inevitable and seeks to hasten or warn of it.\n\n*You see the darkness coming. You are the harbinger of entropy, speaking truths that others fear to hear. Your presence instills dread, for you walk hand in hand with the inevitable end.*\n\n*\"The void calls, and I am its voice.\"*\n\n  - **Core Concept:** Debuffer / Intimidator / Caster\n  - **Recommended Occupations:** Adept, Outcast.\n  - **Recommended Origins:** Hostile, Spacer, Enlightened.\n  - **Recommended Factions:** Outworlds (Entropy Cults), Sha'Nor, Coalition.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Diplomacy, Discipline (Entropy - Chaos).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Harbinger of Doom, Embrace the Void.\n  - **Tactical Role:** Demoralizing enemies, inflicting fear, wielding entropic magic.",
    "full_text": "# The Doomsayer\n\n\nA nihilistic prophet who believes the end is inevitable and seeks to hasten or warn of it.\n\n*You see the darkness coming. You are the harbinger of entropy, speaking truths that others fear to hear. Your presence instills dread, for you walk hand in hand with the inevitable end.*\n\n*\"The void calls, and I am its voice.\"*\n\n  - **Core Concept:** Debuffer / Intimidator / Caster\n  - **Recommended Occupations:** Adept, Outcast.\n  - **Recommended Origins:** Hostile, Spacer, Enlightened.\n  - **Recommended Factions:** Outworlds (Entropy Cults), Sha'Nor, Coalition.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Diplomacy, Discipline (Entropy - Chaos).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Harbinger of Doom, Embrace the Void.\n  - **Tactical Role:** Demoralizing enemies, inflicting fear, wielding entropic magic."
  },
  {
    "id": "archetype-envoy",
    "name": "The Envoy",
    "sphere": "Visionaries (The Idealists)",
    "summary": "An adept negotiator entrusted with representing their faction. They navigate diplomatic channels to ensure peace.",
    "flavor": "You hold the weight of nations. You navigate the complex web of galactic politics, turning potential wars into alliances with a handshake. You ensure your team has friends in high places.",
    "quote": "\"A treaty is just a pause between wars. Let's make it a long one.\"",
    "core_concept": "Face / Shield / Connection Hub",
    "recommended_occupations": [
      "Representative",
      "Noble"
    ],
    "recommended_origins": [
      "Urban",
      "Enlightened",
      "Leisure"
    ],
    "recommended_factions": [
      "Entari Combine (Diplomats)",
      "Alterian Enclave (Ambassadors)",
      "Ascendancy"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Insight",
      "Knowledge (History)",
      "Knowledge (Culture)"
    ],
    "signature_features": [
      "Diplomatic Immunity",
      "Master Negotiator"
    ],
    "tactical_role": "Prevent combat before it starts, call in faction favors, secure safe houses.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "An adept negotiator entrusted with representing their faction. They navigate diplomatic channels to ensure peace.\n\n*You hold the weight of nations. You navigate the complex web of galactic politics, turning potential wars into alliances with a handshake. You ensure your team has friends in high places.*\n\n_\"A treaty is just a pause between wars. Let's make it a long one.\"_",
    "keywords": "envoy, visionary, idealist, leadership, charisma, face, shield",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Diplomatic Immunity",
      "Master Negotiator"
    ],
    "traits": [
      "Diplomatic Immunity",
      "Master Negotiator"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Envoy\n\n\nAn adept negotiator entrusted with representing their faction. They navigate diplomatic channels to ensure peace.\n\n*You hold the weight of nations. You navigate the complex web of galactic politics, turning potential wars into alliances with a handshake. You ensure your team has friends in high places.*\n\n*\"A treaty is just a pause between wars. Let's make it a long one.\"*\n\n  - **Core Concept:** Face / Shield / Connection Hub\n  - **Recommended Occupations:** Representative, Citizen (Elite / *Noble*).\n  - **Recommended Origins:** Urban, Enlightened, Leisure.\n  - **Recommended Factions:** Entari Combine (Diplomats), Alterian Enclave (Ambassadors), Ascendancy.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (History), Knowledge (Culture).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Diplomatic Immunity, Master Negotiator.\n  - **Tactical Role:** Prevent combat before it starts, call in faction favors, secure safe houses.",
    "full_text": "# The Envoy\n\n\nAn adept negotiator entrusted with representing their faction. They navigate diplomatic channels to ensure peace.\n\n*You hold the weight of nations. You navigate the complex web of galactic politics, turning potential wars into alliances with a handshake. You ensure your team has friends in high places.*\n\n*\"A treaty is just a pause between wars. Let's make it a long one.\"*\n\n  - **Core Concept:** Face / Shield / Connection Hub\n  - **Recommended Occupations:** Representative, Citizen (Elite / *Noble*).\n  - **Recommended Origins:** Urban, Enlightened, Leisure.\n  - **Recommended Factions:** Entari Combine (Diplomats), Alterian Enclave (Ambassadors), Ascendancy.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (History), Knowledge (Culture).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Diplomatic Immunity, Master Negotiator.\n  - **Tactical Role:** Prevent combat before it starts, call in faction favors, secure safe houses."
  },
  {
    "id": "archetype-icon",
    "name": "The Icon",
    "sphere": "Visionaries (The Idealists)",
    "summary": "The public figure who embodies a concept or cause, wielding their fame as a source of inspiration and pressure.",
    "flavor": "You are more than a person; you are a symbol. Your every action is scrutinized and celebrated, and your voice carries the weight of millions. You use your status to shape the cultural landscape.",
    "quote": "\"I don't just represent the cause. I am the cause.\"",
    "core_concept": "Social Influence / Leader / Face",
    "recommended_occupations": [
      "Entertainer",
      "Representative"
    ],
    "recommended_origins": [
      "Leisure",
      "Urban",
      "Industrial"
    ],
    "recommended_factions": [
      "Syndicate (Brand Identity)",
      "Coalition (Rebel Face)",
      "Entari"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Expression (any)",
      "Diplomacy",
      "Bluff",
      "Leadership"
    ],
    "signature_features": [
      "Star Power",
      "Inspiring Personality"
    ],
    "tactical_role": "Rallying public support, demoralizing opposition through reputation, high-stakes negotiation.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The public figure who embodies a concept or cause, wielding their fame as a source of inspiration and pressure.\n\n*You are more than a person; you are a symbol. Your every action is scrutinized and celebrated, and your voice carries the weight of millions. You use your status to shape the cultural landscape.*\n\n_\"I don't just represent the cause. I am the cause.\"_",
    "keywords": "icon, visionary, idealist, leadership, charisma, social influence, leader",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Star Power",
      "Inspiring Personality"
    ],
    "traits": [
      "Star Power",
      "Inspiring Personality"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Icon\n\n\nThe public figure who embodies a concept or cause, wielding their fame as a source of inspiration and pressure.\n\n*You are more than a person; you are a symbol. Your every action is scrutinized and celebrated, and your voice carries the weight of millions. You use your status to shape the cultural landscape.*\n\n*\"I don't just represent the cause. I am the cause.\"*\n\n  - **Core Concept:** Social Influence / Leader / Face\n  - **Recommended Occupations:** Entertainer, Representative.\n  - **Recommended Origins:** Leisure, Urban, Industrial.\n  - **Recommended Factions:** Syndicate (Brand Identity), Coalition (Rebel Face), Entari.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Expression (any), Diplomacy, Bluff, Leadership.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Star Power, Inspiring Personality.\n  - **Tactical Role:** Rallying public support, demoralizing opposition through reputation, high-stakes negotiation.",
    "full_text": "# The Icon\n\n\nThe public figure who embodies a concept or cause, wielding their fame as a source of inspiration and pressure.\n\n*You are more than a person; you are a symbol. Your every action is scrutinized and celebrated, and your voice carries the weight of millions. You use your status to shape the cultural landscape.*\n\n*\"I don't just represent the cause. I am the cause.\"*\n\n  - **Core Concept:** Social Influence / Leader / Face\n  - **Recommended Occupations:** Entertainer, Representative.\n  - **Recommended Origins:** Leisure, Urban, Industrial.\n  - **Recommended Factions:** Syndicate (Brand Identity), Coalition (Rebel Face), Entari.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Expression (any), Diplomacy, Bluff, Leadership.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Star Power, Inspiring Personality.\n  - **Tactical Role:** Rallying public support, demoralizing opposition through reputation, high-stakes negotiation."
  },
  {
    "id": "archetype-kingpin",
    "name": "The Kingpin",
    "sphere": "Visionaries (The Idealists)",
    "summary": "Leader of a criminal organization, overseeing illegal activities and managing a network of underlings.",
    "flavor": "You built an empire from the gutter. You command loyalty through fear and respect, leveraging a network of criminals to get things done. You don't ask for permission; you take what is yours.",
    "quote": "\"It's just business. But for you, it's personal.\"",
    "core_concept": "Leader / Minion Master / Intimidator",
    "recommended_occupations": [
      "Criminal",
      "Representative"
    ],
    "recommended_origins": [
      "Urban",
      "Industrial",
      "Colony"
    ],
    "recommended_factions": [
      "Syndicate (Shadow Boards)",
      "Coalition (Crime Lords)",
      "Outworlds"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Strength",
    "key_attributes": "Charisma (Primary), Strength (Secondary).",
    "essential_skills": [
      "Intimidation",
      "Leadership",
      "Diplomacy",
      "Streetwise"
    ],
    "signature_features": [
      "Commanding Presence",
      "Network of Power"
    ],
    "tactical_role": "Controlling NPC minions, sourcing illegal gear, intimidation.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Leader of a criminal organization, overseeing illegal activities and managing a network of underlings.\n\n*You built an empire from the gutter. You command loyalty through fear and respect, leveraging a network of criminals to get things done. You don't ask for permission; you take what is yours.*\n\n_\"It's just business. But for you, it's personal.\"_",
    "keywords": "kingpin, visionary, idealist, leadership, charisma, leader, minion master",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Commanding Presence",
      "Network of Power"
    ],
    "traits": [
      "Commanding Presence",
      "Network of Power"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Kingpin\n\n\nLeader of a criminal organization, overseeing illegal activities and managing a network of underlings.\n\n*You built an empire from the gutter. You command loyalty through fear and respect, leveraging a network of criminals to get things done. You don't ask for permission; you take what is yours.*\n\n*\"It's just business. But for you, it's personal.\"*\n\n  - **Core Concept:** Leader / Minion Master / Intimidator\n  - **Recommended Occupations:** Criminal, Representative.\n  - **Recommended Origins:** Urban, Industrial, Colony.\n  - **Recommended Factions:** Syndicate (Shadow Boards), Coalition (Crime Lords), Outworlds.\n  - **Key Attributes:** Charisma (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Leadership, Diplomacy, Streetwise.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Commanding Presence, Network of Power.\n  - **Tactical Role:** Controlling NPC minions, sourcing illegal gear, intimidation.",
    "full_text": "# The Kingpin\n\n\nLeader of a criminal organization, overseeing illegal activities and managing a network of underlings.\n\n*You built an empire from the gutter. You command loyalty through fear and respect, leveraging a network of criminals to get things done. You don't ask for permission; you take what is yours.*\n\n*\"It's just business. But for you, it's personal.\"*\n\n  - **Core Concept:** Leader / Minion Master / Intimidator\n  - **Recommended Occupations:** Criminal, Representative.\n  - **Recommended Origins:** Urban, Industrial, Colony.\n  - **Recommended Factions:** Syndicate (Shadow Boards), Coalition (Crime Lords), Outworlds.\n  - **Key Attributes:** Charisma (+3 Primary), Strength (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Leadership, Diplomacy, Streetwise.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Commanding Presence, Network of Power.\n  - **Tactical Role:** Controlling NPC minions, sourcing illegal gear, intimidation."
  },
  {
    "id": "archetype-mentor",
    "name": "The Mentor",
    "sphere": "Visionaries (The Idealists)",
    "summary": "The experienced instructor who guides the growth of others, identifying potential and refining raw talent.",
    "flavor": "You see the future in your pupils. You understand that the survival of your legacy depends on the success of the next generation. You don't just provide answers; you teach how to find them.",
    "quote": "\"You have the spark. Let me show you how to start the fire.\"",
    "core_concept": "Buffer / Support / Teacher",
    "recommended_occupations": [
      "Scholar",
      "Representative"
    ],
    "recommended_origins": [
      "Research",
      "Urban",
      "Enlightened"
    ],
    "recommended_factions": [
      "Ascendancy (Academics)",
      "Impyrium (Masters)",
      "Entari Combine"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Intellect",
    "key_attributes": "Wisdom (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Knowledge (Academics)",
      "Insight",
      "Leadership"
    ],
    "signature_features": [
      "Shared Wisdom",
      "Mentorship"
    ],
    "tactical_role": "Granting bonuses to allies' learning and skill checks, tactical instruction.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The experienced instructor who guides the growth of others, identifying potential and refining raw talent.\n\n*You see the future in your pupils. You understand that the survival of your legacy depends on the success of the next generation. You don't just provide answers; you teach how to find them.*\n\n_\"You have the spark. Let me show you how to start the fire.\"_",
    "keywords": "mentor, visionary, idealist, leadership, charisma, buffer, support",
    "negative_keywords": "mindless-brute, reckless, illiterate, anti-social, mute",
    "signature_traits": [
      "Shared Wisdom",
      "Mentorship"
    ],
    "traits": [
      "Shared Wisdom",
      "Mentorship"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Mentor\n\n\nThe experienced instructor who guides the growth of others, identifying potential and refining raw talent.\n\n*You see the future in your pupils. You understand that the survival of your legacy depends on the success of the next generation. You don't just provide answers; you teach how to find them.*\n\n*\"You have the spark. Let me show you how to start the fire.\"*\n\n  - **Core Concept:** Buffer / Support / Teacher\n  - **Recommended Occupations:** Scholar, Representative.\n  - **Recommended Origins:** Research, Urban, Enlightened.\n  - **Recommended Factions:** Ascendancy (Academics), Impyrium (Masters), Entari Combine.\n  - **Key Attributes:** Wisdom (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Knowledge (Academics), Insight, Leadership.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Shared Wisdom, Mentorship.\n  - **Tactical Role:** Granting bonuses to allies' learning and skill checks, tactical instruction.",
    "full_text": "# The Mentor\n\n\nThe experienced instructor who guides the growth of others, identifying potential and refining raw talent.\n\n*You see the future in your pupils. You understand that the survival of your legacy depends on the success of the next generation. You don't just provide answers; you teach how to find them.*\n\n*\"You have the spark. Let me show you how to start the fire.\"*\n\n  - **Core Concept:** Buffer / Support / Teacher\n  - **Recommended Occupations:** Scholar, Representative.\n  - **Recommended Origins:** Research, Urban, Enlightened.\n  - **Recommended Factions:** Ascendancy (Academics), Impyrium (Masters), Entari Combine.\n  - **Key Attributes:** Wisdom (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Knowledge (Academics), Insight, Leadership.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Shared Wisdom, Mentorship.\n  - **Tactical Role:** Granting bonuses to allies' learning and skill checks, tactical instruction."
  },
  {
    "id": "archetype-missionary",
    "name": "The Missionary",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A zealous preacher who travels the galaxy to spread their faith.",
    "flavor": "You carry the light into the darkness. You travel to the farthest reaches of the galaxy to share your truth, bringing hope and conviction to the lost and the forgotten.",
    "quote": "\"There is no place too dark for the light to reach.\"",
    "core_concept": "Face / Healer / Support",
    "recommended_occupations": [
      "Adept",
      "Representative"
    ],
    "recommended_origins": [
      "Enlightened",
      "Colony",
      "Spacer"
    ],
    "recommended_factions": [
      "Impyrium (State Religion)",
      "Entari Combine (Ethical)",
      "Ascendancy"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Stamina",
    "key_attributes": "Charisma (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Insight",
      "Knowledge (Survival)",
      "Knowledge (Religion)"
    ],
    "signature_features": [
      "Divine Inspiration",
      "Spiritual Guide"
    ],
    "tactical_role": "Converting NPCs, providing healing/support, navigating cultural/religious encounters.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A zealous preacher who travels the galaxy to spread their faith.\n\n*You carry the light into the darkness. You travel to the farthest reaches of the galaxy to share your truth, bringing hope and conviction to the lost and the forgotten.*\n\n_\"There is no place too dark for the light to reach.\"_",
    "keywords": "missionary, visionary, idealist, leadership, charisma, face, healer",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Divine Inspiration",
      "Spiritual Guide"
    ],
    "traits": [
      "Divine Inspiration",
      "Spiritual Guide"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Missionary\n\n\nA zealous preacher who travels the galaxy to spread their faith.\n\n*You carry the light into the darkness. You travel to the farthest reaches of the galaxy to share your truth, bringing hope and conviction to the lost and the forgotten.*\n\n*\"There is no place too dark for the light to reach.\"*\n\n  - **Core Concept:** Face / Healer / Support\n  - **Recommended Occupations:** Adept, Representative.\n  - **Recommended Origins:** Enlightened, Colony, Spacer.\n  - **Recommended Factions:** Impyrium (State Religion), Entari Combine (Ethical), Ascendancy.\n  - **Key Attributes:** Charisma (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (Survival), Knowledge (Religion).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Divine Inspiration, Spiritual Guide.\n  - **Tactical Role:** Converting NPCs, providing healing/support, navigating cultural/religious encounters.",
    "full_text": "# The Missionary\n\n\nA zealous preacher who travels the galaxy to spread their faith.\n\n*You carry the light into the darkness. You travel to the farthest reaches of the galaxy to share your truth, bringing hope and conviction to the lost and the forgotten.*\n\n*\"There is no place too dark for the light to reach.\"*\n\n  - **Core Concept:** Face / Healer / Support\n  - **Recommended Occupations:** Adept, Representative.\n  - **Recommended Origins:** Enlightened, Colony, Spacer.\n  - **Recommended Factions:** Impyrium (State Religion), Entari Combine (Ethical), Ascendancy.\n  - **Key Attributes:** Charisma (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (Survival), Knowledge (Religion).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Divine Inspiration, Spiritual Guide.\n  - **Tactical Role:** Converting NPCs, providing healing/support, navigating cultural/religious encounters."
  },
  {
    "id": "archetype-mystic",
    "name": "The Mystic",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A wise and insightful individual who perceives glimpses of the future and offers guidance.",
    "flavor": "You see what will be. Time is a river, and you stand on the bank, watching the currents. You guide others away from disaster and towards their destiny with cryptic wisdom.",
    "quote": "\"The future is written, but the ink is not yet dry.\"",
    "core_concept": "Diviner / Support / Advisor",
    "recommended_occupations": [
      "Adept",
      "Scholar"
    ],
    "recommended_origins": [
      "Enlightened",
      "Research",
      "Leisure"
    ],
    "recommended_factions": [
      "Auluran",
      "Alterian Enclave",
      "Ascendancy"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Charisma",
    "key_attributes": "Wisdom (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Insight",
      "Diplomacy",
      "Discipline (Divination)"
    ],
    "signature_features": [
      "Prophetic Visions",
      "Spiritual Advisor"
    ],
    "tactical_role": "Gaining initiative bonuses, avoiding traps, gathering info via divination.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A wise and insightful individual who perceives glimpses of the future and offers guidance.\n\n*You see what will be. Time is a river, and you stand on the bank, watching the currents. You guide others away from disaster and towards their destiny with cryptic wisdom.*\n\n_\"The future is written, but the ink is not yet dry.\"_",
    "keywords": "mystic, visionary, idealist, leadership, charisma, diviner, support",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Prophetic Visions",
      "Spiritual Advisor"
    ],
    "traits": [
      "Prophetic Visions",
      "Spiritual Advisor"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Mystic\n\n\nA wise and insightful individual who perceives glimpses of the future and offers guidance.\n\n*You see what will be. Time is a river, and you stand on the bank, watching the currents. You guide others away from disaster and towards their destiny with cryptic wisdom.*\n\n*\"The future is written, but the ink is not yet dry.\"*\n\n  - **Core Concept:** Diviner / Support / Advisor\n  - **Recommended Occupations:** Adept, Scholar.\n  - **Recommended Origins:** Enlightened, Research, Leisure.\n  - **Recommended Factions:** Auluran, Alterian Enclave, Ascendancy.\n  - **Key Attributes:** Wisdom (+3 Primary), Insight (Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Insight, Diplomacy, Discipline: Mental (Sense).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Prophetic Visions, Spiritual Advisor.\n  - **Tactical Role:** Gaining initiative bonuses, avoiding traps, gathering info via divination.",
    "full_text": "# The Mystic\n\n\nA wise and insightful individual who perceives glimpses of the future and offers guidance.\n\n*You see what will be. Time is a river, and you stand on the bank, watching the currents. You guide others away from disaster and towards their destiny with cryptic wisdom.*\n\n*\"The future is written, but the ink is not yet dry.\"*\n\n  - **Core Concept:** Diviner / Support / Advisor\n  - **Recommended Occupations:** Adept, Scholar.\n  - **Recommended Origins:** Enlightened, Research, Leisure.\n  - **Recommended Factions:** Auluran, Alterian Enclave, Ascendancy.\n  - **Key Attributes:** Wisdom (+3 Primary), Insight (Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Insight, Diplomacy, Discipline: Mental (Sense).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Prophetic Visions, Spiritual Advisor.\n  - **Tactical Role:** Gaining initiative bonuses, avoiding traps, gathering info via divination."
  },
  {
    "id": "archetype-officer",
    "name": "The Officer",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A strategic leader who commands troops and coordinates military operations.",
    "flavor": "You lead from the front. You are the mind of the army, directing the flow of battle with precision. Your orders save lives and win wars.",
    "quote": "\"Form up! Hold the line!\"",
    "core_concept": "Leader / Tactician / Buffer",
    "recommended_occupations": [
      "Soldier (Officer)",
      "Noble"
    ],
    "recommended_origins": [
      "Militaristic",
      "Urban",
      "Colony"
    ],
    "recommended_factions": [
      "Impyrium (Legions)",
      "Dracon Dynasty",
      "Coalition (Militia)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Intellect",
    "key_attributes": "Charisma (Primary), Intellect (Secondary).",
    "essential_skills": [
      "Leadership",
      "Knowledge (Tactics)",
      "Diplomacy",
      "Combat (Any)"
    ],
    "signature_features": [
      "Tactical Expertise",
      "Inspiring Leader"
    ],
    "tactical_role": "Granting bonuses to allies, organizing attacks, managing NPC troops.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A strategic leader who commands troops and coordinates military operations.\n\n*You lead from the front. You are the mind of the army, directing the flow of battle with precision. Your orders save lives and win wars.*\n\n_\"Form up! Hold the line!\"_",
    "keywords": "officer, visionary, idealist, leadership, charisma, leader, tactician",
    "negative_keywords": "mindless-brute, reckless, illiterate, anti-social, mute",
    "signature_traits": [
      "Tactical Expertise",
      "Inspiring Leader"
    ],
    "traits": [
      "Tactical Expertise",
      "Inspiring Leader"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Officer\n\n\nA strategic leader who commands troops and coordinates military operations.\n\n*You lead from the front. You are the mind of the army, directing the flow of battle with precision. Your orders save lives and win wars.*\n\n*\"Form up! Hold the line!\"*\n\n  - **Core Concept:** Leader / Tactician / Buffer\n  - **Recommended Occupations:** Soldier (Officer), Representative (*Noble*).\n  - **Recommended Origins:** Militaristic, Urban, Colony.\n  - **Recommended Factions:** Impyrium (Legions), Dracon Dynasty, Coalition (Militia).\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Knowledge (Tactics), Diplomacy, Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Tactical Expertise, Inspiring Leader.\n  - **Tactical Role:** Granting bonuses to allies, organizing attacks, managing NPC troops.",
    "full_text": "# The Officer\n\n\nA strategic leader who commands troops and coordinates military operations.\n\n*You lead from the front. You are the mind of the army, directing the flow of battle with precision. Your orders save lives and win wars.*\n\n*\"Form up! Hold the line!\"*\n\n  - **Core Concept:** Leader / Tactician / Buffer\n  - **Recommended Occupations:** Soldier (Officer), Representative (*Noble*).\n  - **Recommended Origins:** Militaristic, Urban, Colony.\n  - **Recommended Factions:** Impyrium (Legions), Dracon Dynasty, Coalition (Militia).\n  - **Key Attributes:** Charisma (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Knowledge (Tactics), Diplomacy, Combat (Any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Tactical Expertise, Inspiring Leader.\n  - **Tactical Role:** Granting bonuses to allies, organizing attacks, managing NPC troops."
  },
  {
    "id": "archetype-oracle",
    "name": "The Oracle",
    "sphere": "Visionaries (The Idealists)",
    "summary": "Possesses innate mental powers or spiritual connection. Seers, telepaths, and prophets.",
    "flavor": "You see the strings of the universe. While others rely on their eyes, you sense the thoughts, the futures, and the connections that bind all things. You are the guide to the unseen.",
    "quote": "\"Your thoughts are so... loud.\"",
    "core_concept": "Caster / Sensor / Controller",
    "recommended_occupations": [
      "Adept",
      "Enlightened"
    ],
    "recommended_origins": [
      "Enlightened",
      "Research",
      "Leisure"
    ],
    "recommended_factions": [
      "Auluran (Mystics)",
      "Alterian Enclave (Seers)",
      "Impyrium (Sanctioned Psykers)"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Stamina",
    "key_attributes": "Wisdom (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Insight",
      "Diplomacy",
      "Two Disciplines (Mental/Divination)"
    ],
    "signature_features": [
      "Prophetic Visions",
      "Spiritual Advisor"
    ],
    "tactical_role": "Scouting (Clairvoyance), Crowd Control (Telepathy), Buffing.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Possesses innate mental powers or spiritual connection. Seers, telepaths, and prophets.\n\n*You see the strings of the universe. While others rely on their eyes, you sense the thoughts, the futures, and the connections that bind all things. You are the guide to the unseen.*\n\n_\"Your thoughts are so... loud.\"_",
    "keywords": "oracle, visionary, idealist, leadership, charisma, caster, sensor",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Prophetic Visions",
      "Spiritual Advisor"
    ],
    "traits": [
      "Prophetic Visions",
      "Spiritual Advisor"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Oracle\n\n\nPossesses innate mental powers or spiritual connection. Seers, telepaths, and prophets.\n\n*You see the strings of the universe. While others rely on their eyes, you sense the thoughts, the futures, and the connections that bind all things. You are the guide to the unseen.*\n\n*\"Your thoughts are so— loud.\"*\n\n  - **Core Concept:** Caster / Sensor / Controller\n  - **Recommended Occupations:** Adept, Enlightened.\n  - **Recommended Origins:** Enlightened, Research, Leisure.\n  - **Recommended Factions:** Auluran (Mystics), Alterian Enclave (Seers), Impyrium (Sanctioned Psykers).\n  - **Key Attributes:** Wisdom (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Insight, Diplomacy, Attune, Discipline: Mental (Sense & Projection).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Prophetic Visions, Spiritual Advisor.\n  - **Tactical Role:** Scouting (Clairvoyance), Crowd Control (Telepathy), Buffing.",
    "full_text": "# The Oracle\n\n\nPossesses innate mental powers or spiritual connection. Seers, telepaths, and prophets.\n\n*You see the strings of the universe. While others rely on their eyes, you sense the thoughts, the futures, and the connections that bind all things. You are the guide to the unseen.*\n\n*\"Your thoughts are so— loud.\"*\n\n  - **Core Concept:** Caster / Sensor / Controller\n  - **Recommended Occupations:** Adept, Enlightened.\n  - **Recommended Origins:** Enlightened, Research, Leisure.\n  - **Recommended Factions:** Auluran (Mystics), Alterian Enclave (Seers), Impyrium (Sanctioned Psykers).\n  - **Key Attributes:** Wisdom (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Insight, Diplomacy, Attune, Discipline: Mental (Sense & Projection).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Prophetic Visions, Spiritual Advisor.\n  - **Tactical Role:** Scouting (Clairvoyance), Crowd Control (Telepathy), Buffing."
  },
  {
    "id": "archetype-peacekeeper",
    "name": "The Peacekeeper",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A protector of the innocent and champion of peace, using force and words.",
    "flavor": "You fight for peace. You are the shield of the defenseless, using violence only as a last resort. You walk the line between warrior and diplomat, resolving conflicts before they begin.",
    "quote": "\"Stand down. There is no need for bloodshed today.\"",
    "core_concept": "Tank / Diplomat / Controller",
    "recommended_occupations": [
      "Soldier",
      "Representative"
    ],
    "recommended_origins": [
      "Urban",
      "Colony",
      "Enlightened"
    ],
    "recommended_factions": [
      "Entari Combine (Constables)",
      "Ascendancy (Judges)",
      "Coalition"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Stamina",
    "key_attributes": "Charisma (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Athletics",
      "Diplomacy",
      "Insight",
      "Combat (any)"
    ],
    "signature_features": [
      "Pacifying Presence",
      "Defensive Stance"
    ],
    "tactical_role": "De-escalating combat, protecting allies, subduing enemies non-lethally.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A protector of the innocent and champion of peace, using force and words.\n\n*You fight for peace. You are the shield of the defenseless, using violence only as a last resort. You walk the line between warrior and diplomat, resolving conflicts before they begin.*\n\n_\"Stand down. There is no need for bloodshed today.\"_",
    "keywords": "peacekeeper, visionary, idealist, leadership, charisma, tank, diplomat",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, anti-social",
    "signature_traits": [
      "Pacifying Presence",
      "Defensive Stance"
    ],
    "traits": [
      "Pacifying Presence",
      "Defensive Stance"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Peacekeeper\n\n\nA protector of the innocent and champion of peace, using force and words.\n\n*You fight for peace. You are the shield of the defenseless, using violence only as a last resort. You walk the line between warrior and diplomat, resolving conflicts before they begin.*\n\n*\"Stand down. There is no need for bloodshed today.\"*\n\n  - **Core Concept:** Tank / Diplomat / Controller\n  - **Recommended Occupations:** Soldier, Representative.\n  - **Recommended Origins:** Urban, Colony, Enlightened.\n  - **Recommended Factions:** Entari Combine (Constables), Ascendancy (Judges), Coalition.\n  - **Key Attributes:** Charisma (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Diplomacy, Insight, Combat (any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Pacifying Presence, Defensive Stance.\n  - **Tactical Role:** De-escalating combat, protecting allies, subduing enemies non-lethally.",
    "full_text": "# The Peacekeeper\n\n\nA protector of the innocent and champion of peace, using force and words.\n\n*You fight for peace. You are the shield of the defenseless, using violence only as a last resort. You walk the line between warrior and diplomat, resolving conflicts before they begin.*\n\n*\"Stand down. There is no need for bloodshed today.\"*\n\n  - **Core Concept:** Tank / Diplomat / Controller\n  - **Recommended Occupations:** Soldier, Representative.\n  - **Recommended Origins:** Urban, Colony, Enlightened.\n  - **Recommended Factions:** Entari Combine (Constables), Ascendancy (Judges), Coalition.\n  - **Key Attributes:** Charisma (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Athletics, Diplomacy, Insight, Combat (any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Pacifying Presence, Defensive Stance.\n  - **Tactical Role:** De-escalating combat, protecting allies, subduing enemies non-lethally."
  },
  {
    "id": "archetype-philosopher",
    "name": "The Philosopher",
    "sphere": "Visionaries (The Idealists)",
    "summary": "The seeker of deeper meaning who challenges the assumptions of society and explores the fundamental nature of existence.",
    "flavor": "You think where others merely act. You analyze the moral and existential implications of every decision, providing the ethical framework that keeps the group—and civilization—from losing its soul.",
    "quote": "\"To know the universe, one must first know the silence between the thoughts.\"",
    "core_concept": "Support / Lore / Mental Tank",
    "recommended_occupations": [
      "Scholar",
      "Adept"
    ],
    "recommended_origins": [
      "Enlightened",
      "Research",
      "Urban"
    ],
    "recommended_factions": [
      "Alterian Enclave (Sages)",
      "Mekan (Code Adherents)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Academics",
      "Insight",
      "Diplomacy",
      "Knowledge (History)"
    ],
    "signature_features": [
      "Metacognition",
      "Enlightened Mind"
    ],
    "tactical_role": "Resisting mental intrusion, providing ethical guidance, identifying historical/philosophical context.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The seeker of deeper meaning who challenges the assumptions of society and explores the fundamental nature of existence.\n\n*You think where others merely act. You analyze the moral and existential implications of every decision, providing the ethical framework that keeps the group—and civilization—from losing its soul.*\n\n_\"To know the universe, one must first know the silence between the thoughts.\"_",
    "keywords": "philosopher, visionary, idealist, leadership, charisma, support, lore",
    "negative_keywords": "mindless-brute, reckless, illiterate, anti-social, mute",
    "signature_traits": [
      "Metacognition",
      "Enlightened Mind"
    ],
    "traits": [
      "Metacognition",
      "Enlightened Mind"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Philosopher\n\n\nThe seeker of deeper meaning who challenges the assumptions of society and explores the fundamental nature of existence.\n\n*You think where others merely act. You analyze the moral and existential implications of every decision, providing the ethical framework that keeps the group—and civilization—from losing its soul.*\n\n*\"To know the universe, one must first know the silence between the thoughts.\"*\n\n  - **Core Concept:** Support / Lore / Mental Tank\n  - **Recommended Occupations:** Scholar, Adept.\n  - **Recommended Origins:** Enlightened, Research, Urban.\n  - **Recommended Factions:** Alterian Enclave (Sages), Mekan (Code Adherents), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Insight, Diplomacy, Knowledge (History).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Metacognition, Enlightened Mind.\n  - **Tactical Role:** Resisting mental intrusion, providing ethical guidance, identifying historical/philosophical context.",
    "full_text": "# The Philosopher\n\n\nThe seeker of deeper meaning who challenges the assumptions of society and explores the fundamental nature of existence.\n\n*You think where others merely act. You analyze the moral and existential implications of every decision, providing the ethical framework that keeps the group—and civilization—from losing its soul.*\n\n*\"To know the universe, one must first know the silence between the thoughts.\"*\n\n  - **Core Concept:** Support / Lore / Mental Tank\n  - **Recommended Occupations:** Scholar, Adept.\n  - **Recommended Origins:** Enlightened, Research, Urban.\n  - **Recommended Factions:** Alterian Enclave (Sages), Mekan (Code Adherents), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Insight, Diplomacy, Knowledge (History).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Metacognition, Enlightened Mind.\n  - **Tactical Role:** Resisting mental intrusion, providing ethical guidance, identifying historical/philosophical context."
  },
  {
    "id": "archetype-priest",
    "name": "The Priest",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A devout servant of a state religion, maintaining morale and conducting ceremonies.",
    "flavor": "You are the pillar of the community. You hold the spiritual authority of an institution, guiding the faithful and ensuring the stability of society through ritual and tradition.",
    "quote": "\"By the authority vested in me, I command you to cease.\"",
    "core_concept": "Support / Leader / Face",
    "recommended_occupations": [
      "Adept",
      "Representative"
    ],
    "recommended_origins": [
      "Enlightened",
      "Urban",
      "Colony"
    ],
    "recommended_factions": [
      "Impyrium (Orthodoxy)",
      "Dracon Dynasty (Dragon Cults)"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Charisma",
    "key_attributes": "Wisdom (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Insight",
      "Knowledge (History)",
      "Knowledge (Religion)"
    ],
    "signature_features": [
      "Religious Authority",
      "Spiritual Guidance"
    ],
    "tactical_role": "Social influence via religious rank, buffing morale, healing.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A devout servant of a state religion, maintaining morale and conducting ceremonies.\n\n*You are the pillar of the community. You hold the spiritual authority of an institution, guiding the faithful and ensuring the stability of society through ritual and tradition.*\n\n_\"By the authority vested in me, I command you to cease.\"_",
    "keywords": "priest, visionary, idealist, leadership, charisma, support, leader",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Religious Authority",
      "Spiritual Guidance"
    ],
    "traits": [
      "Religious Authority",
      "Spiritual Guidance"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Priest\n\n\nA devout servant of a state religion, maintaining morale and conducting ceremonies.\n\n*You are the pillar of the community. You hold the spiritual authority of an institution, guiding the faithful and ensuring the stability of society through ritual and tradition.*\n\n*\"By the authority vested in me, I command you to cease.\"*\n\n  - **Core Concept:** Support / Leader / Face\n  - **Recommended Occupations:** Adept, Representative.\n  - **Recommended Origins:** Enlightened, Urban, Colony.\n  - **Recommended Factions:** Impyrium (Orthodoxy), Dracon Dynasty (Dragon Cults).\n  - **Key Attributes:** Wisdom (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (History), Knowledge (Religion).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Religious Authority, Spiritual Guidance.\n  - **Tactical Role:** Social influence via religious rank, buffing morale, healing.",
    "full_text": "# The Priest\n\n\nA devout servant of a state religion, maintaining morale and conducting ceremonies.\n\n*You are the pillar of the community. You hold the spiritual authority of an institution, guiding the faithful and ensuring the stability of society through ritual and tradition.*\n\n*\"By the authority vested in me, I command you to cease.\"*\n\n  - **Core Concept:** Support / Leader / Face\n  - **Recommended Occupations:** Adept, Representative.\n  - **Recommended Origins:** Enlightened, Urban, Colony.\n  - **Recommended Factions:** Impyrium (Orthodoxy), Dracon Dynasty (Dragon Cults).\n  - **Key Attributes:** Wisdom (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Insight, Knowledge (History), Knowledge (Religion).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Religious Authority, Spiritual Guidance.\n  - **Tactical Role:** Social influence via religious rank, buffing morale, healing."
  },
  {
    "id": "archetype-revolutionary",
    "name": "The Revolutionary",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A charismatic leader who inspires and unites the rebellion.",
    "flavor": "You are the voice of change. You rally the oppressed against the tyrant, turning despair into action. You lead the charge against the established order, fighting for a better tomorrow.",
    "quote": "\"Break the chains! Rise up!\"",
    "core_concept": "Leader / Agitator / Skirmisher",
    "recommended_occupations": [
      "Citizen",
      "Criminal"
    ],
    "recommended_origins": [
      "Industrial",
      "Colony",
      "Urban"
    ],
    "recommended_factions": [
      "Coalition (Independence)",
      "Outworlds",
      "Syndicate (Unionizers)"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Leadership",
      "Diplomacy",
      "Insight",
      "Knowledge (Tactics)",
      "Combat (any)"
    ],
    "signature_features": [
      "Inspiring Rhetoric",
      "Rebel Leader"
    ],
    "tactical_role": "Inspiring NPCs to fight, leading riots/raids, boosting ally morale.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A charismatic leader who inspires and unites the rebellion.\n\n*You are the voice of change. You rally the oppressed against the tyrant, turning despair into action. You lead the charge against the established order, fighting for a better tomorrow.*\n\n_\"Break the chains! Rise up!\"_",
    "keywords": "revolutionary, visionary, idealist, leadership, charisma, leader, agitator",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Inspiring Rhetoric",
      "Rebel Leader"
    ],
    "traits": [
      "Inspiring Rhetoric",
      "Rebel Leader"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Revolutionary\n\n\nA charismatic leader who inspires and unites the rebellion.\n\n*You are the voice of change. You rally the oppressed against the tyrant, turning despair into action. You lead the charge against the established order, fighting for a better tomorrow.*\n\n*\"Break the chains! Rise up!\"*\n\n  - **Core Concept:** Leader / Agitator / Skirmisher\n  - **Recommended Occupations:** Citizen, Criminal.\n  - **Recommended Origins:** Industrial, Colony, Urban.\n  - **Recommended Factions:** Coalition (Independence), Outworlds, Syndicate (Unionizers).\n  - **Key Attributes:** Charisma (+3 Primary), Spirit (Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Diplomacy, Insight, Knowledge (Tactics), Combat (any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Inspiring Rhetoric, Rebel Leader.\n  - **Tactical Role:** Inspiring NPCs to fight, leading riots/raids, boosting ally morale.",
    "full_text": "# The Revolutionary\n\n\nA charismatic leader who inspires and unites the rebellion.\n\n*You are the voice of change. You rally the oppressed against the tyrant, turning despair into action. You lead the charge against the established order, fighting for a better tomorrow.*\n\n*\"Break the chains! Rise up!\"*\n\n  - **Core Concept:** Leader / Agitator / Skirmisher\n  - **Recommended Occupations:** Citizen, Criminal.\n  - **Recommended Origins:** Industrial, Colony, Urban.\n  - **Recommended Factions:** Coalition (Independence), Outworlds, Syndicate (Unionizers).\n  - **Key Attributes:** Charisma (+3 Primary), Spirit (Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Leadership, Diplomacy, Insight, Knowledge (Tactics), Combat (any).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Inspiring Rhetoric, Rebel Leader.\n  - **Tactical Role:** Inspiring NPCs to fight, leading riots/raids, boosting ally morale."
  },
  {
    "id": "archetype-senator",
    "name": "The Senator",
    "sphere": "Visionaries (The Idealists)",
    "summary": "Charismatic figure who navigates the political landscape, builds alliances, and sways public opinion.",
    "flavor": "You play the great game. You know that laws are just suggestions and power is just perception. You manipulate the system to serve your ends, ensuring that public opinion is always on your side.",
    "quote": "\"I don't need a weapon. I have a mandate.\"",
    "core_concept": "Face / Leader / Buffer",
    "recommended_occupations": [
      "Representative",
      "Noble"
    ],
    "recommended_origins": [
      "Urban",
      "Leisure",
      "Enlightened"
    ],
    "recommended_factions": [
      "Impyrium (Senate)",
      "Coalition (Council)",
      "Entari Combine"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Diplomacy",
      "Bluff",
      "Insight",
      "Leadership"
    ],
    "signature_features": [
      "Political Acumen",
      "Influence Network"
    ],
    "tactical_role": "Dealing with authorities, securing funding, changing laws.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Charismatic figure who navigates the political landscape, builds alliances, and sways public opinion.\n\n*You play the great game. You know that laws are just suggestions and power is just perception. You manipulate the system to serve your ends, ensuring that public opinion is always on your side.*\n\n_\"I don't need a weapon. I have a mandate.\"_",
    "keywords": "senator, visionary, idealist, leadership, charisma, face, leader",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Political Acumen",
      "Influence Network"
    ],
    "traits": [
      "Political Acumen",
      "Influence Network"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Senator\n\n\nCharismatic figure who navigates the political landscape, builds alliances, and sways public opinion.\n\n*You play the great game. You know that laws are just suggestions and power is just perception. You manipulate the system to serve your ends, ensuring that public opinion is always on your side.*\n\n*\"I don't need a weapon. I have a mandate.\"*\n\n  - **Core Concept:** Face / Leader / Buffer\n  - **Recommended Occupations:** Representative, Citizen (Elite / *Noble*).\n  - **Recommended Origins:** Urban, Leisure, Enlightened.\n  - **Recommended Factions:** Impyrium (Senate), Coalition (Council), Entari Combine.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Bluff, Insight, Leadership.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Political Acumen, Influence Network.\n  - **Tactical Role:** Dealing with authorities, securing funding, changing laws.",
    "full_text": "# The Senator\n\n\nCharismatic figure who navigates the political landscape, builds alliances, and sways public opinion.\n\n*You play the great game. You know that laws are just suggestions and power is just perception. You manipulate the system to serve your ends, ensuring that public opinion is always on your side.*\n\n*\"I don't need a weapon. I have a mandate.\"*\n\n  - **Core Concept:** Face / Leader / Buffer\n  - **Recommended Occupations:** Representative, Citizen (Elite / *Noble*).\n  - **Recommended Origins:** Urban, Leisure, Enlightened.\n  - **Recommended Factions:** Impyrium (Senate), Coalition (Council), Entari Combine.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Diplomacy, Bluff, Insight, Leadership.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Political Acumen, Influence Network.\n  - **Tactical Role:** Dealing with authorities, securing funding, changing laws."
  },
  {
    "id": "archetype-socialite",
    "name": "The Socialite",
    "sphere": "Visionaries (The Idealists)",
    "summary": "A charismatic individual who thrives in social settings and networking.",
    "flavor": "You are the center of attention. You navigate the treacherous waters of high society with a smile and a drink. Information is your currency, and connections are your weapons.",
    "quote": "\"Oh, darling, you simply must tell me everything.\"",
    "core_concept": "Face / Info Gatherer / Buffer",
    "recommended_occupations": [
      "Citizen (Elite)",
      "Entertainer"
    ],
    "recommended_origins": [
      "Leisure",
      "Urban",
      "Enlightened"
    ],
    "recommended_factions": [
      "Syndicate (Elites)",
      "Entari Combine",
      "Dracon Dynasty"
    ],
    "primary_attribute": "Charisma",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Charisma (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Bluff",
      "Insight",
      "Leadership",
      "Diplomacy",
      "Etiquette"
    ],
    "signature_features": [
      "Social Butterfly",
      "Connections"
    ],
    "tactical_role": "Gathering rumors, gaining access to restricted social areas, manipulating NPCs.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A charismatic individual who thrives in social settings and networking.\n\n*You are the center of attention. You navigate the treacherous waters of high society with a smile and a drink. Information is your currency, and connections are your weapons.*\n\n_\"Oh, darling, you simply must tell me everything.\"_",
    "keywords": "socialite, visionary, idealist, leadership, charisma, face, info gatherer",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Social Butterfly",
      "Connections"
    ],
    "traits": [
      "Social Butterfly",
      "Connections"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Socialite\n\n\nA charismatic individual who thrives in social settings and networking.\n\n*You are the center of attention. You navigate the treacherous waters of high society with a smile and a drink. Information is your currency, and connections are your weapons.*\n\n*\"Oh, darling, you simply must tell me everything.\"*\n\n  - **Core Concept:** Face / Info Gatherer / Buffer\n  - **Recommended Occupations:** Citizen (Elite), Entertainer.\n  - **Recommended Origins:** Leisure, Urban, Enlightened.\n  - **Recommended Factions:** Syndicate (Elites), Entari Combine, Dracon Dynasty.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Bluff, Insight, Leadership, Diplomacy, Etiquette.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Social Butterfly, Connections.\n  - **Tactical Role:** Gathering rumors, gaining access to restricted social areas, manipulating NPCs.",
    "full_text": "# The Socialite\n\n\nA charismatic individual who thrives in social settings and networking.\n\n*You are the center of attention. You navigate the treacherous waters of high society with a smile and a drink. Information is your currency, and connections are your weapons.*\n\n*\"Oh, darling, you simply must tell me everything.\"*\n\n  - **Core Concept:** Face / Info Gatherer / Buffer\n  - **Recommended Occupations:** Citizen (Elite), Entertainer.\n  - **Recommended Origins:** Leisure, Urban, Enlightened.\n  - **Recommended Factions:** Syndicate (Elites), Entari Combine, Dracon Dynasty.\n  - **Key Attributes:** Charisma (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Bluff, Insight, Leadership, Diplomacy, Etiquette.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Social Butterfly, Connections.\n  - **Tactical Role:** Gathering rumors, gaining access to restricted social areas, manipulating NPCs."
  },
  {
    "id": "archetype-spirit-walker",
    "name": "The Spirit-walker",
    "sphere": "Visionaries (The Idealists)",
    "summary": "The conduit between the material plane and the spiritual realms, interpreting the will of the unseen.",
    "flavor": "You are the bridge. You walk between realities, speaking for the entities that exist in the spaces between the stars. You find balance where others see only chaos or silence.",
    "quote": "\"The veil is thin here. Can you hear the ancestors?\"",
    "core_concept": "Medium / Scout / Utility",
    "recommended_occupations": [
      "Adept",
      "Scout"
    ],
    "recommended_origins": [
      "Enlightened",
      "Agricultural",
      "Hostile"
    ],
    "recommended_factions": [
      "Auluran (Mystics)",
      "Sha'Nor",
      "Outworlds (Shamans)"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Stamina",
    "key_attributes": "Wisdom (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Discipline (Entropy \\- Order (Nature/Life))",
      "Insight",
      "Alertness",
      "Knowledge (Nature)"
    ],
    "signature_features": [
      "Spirit Walker",
      "Spiritual Attunement"
    ],
    "tactical_role": "Detecting other-dimensional threats, communing with local spirits, planar navigation.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The conduit between the material plane and the spiritual realms, interpreting the will of the unseen.\n\n*You are the bridge. You walk between realities, speaking for the entities that exist in the spaces between the stars. You find balance where others see only chaos or silence.*\n\n_\"The veil is thin here. Can you hear the ancestors?\"_",
    "keywords": "spirit-walker, visionary, idealist, leadership, charisma, medium, scout",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Spirit Walker",
      "Spiritual Attunement"
    ],
    "traits": [
      "Spirit Walker",
      "Spiritual Attunement"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Spirit-Walker\n\n\nThe conduit between the material plane and the spiritual realms, interpreting the will of the unseen.\n\n*You are the bridge. You walk between realities, speaking for the entities that exist in the spaces between the stars. You find balance where others see only chaos or silence.*\n\n*\"The veil is thin here. Can you hear the ancestors?\"*\n\n  - **Core Concept:** Medium / Scout / Utility\n  - **Recommended Occupations:** Adept, Scout.\n  - **Recommended Origins:** Enlightened, Agricultural, Hostile.\n  - **Recommended Factions:** Auluran (Mystics), Sha'Nor, Outworlds (Shamans).\n  - **Key Attributes:** Wisdom (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Discipline (Entropy - Order (Nature/Life)), Insight, Alertness, Knowledge (Nature).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Spirit Walker, Spiritual Attunement.\n  - **Tactical Role:** Detecting other-dimensional threats, communing with local spirits, planar navigation.",
    "full_text": "# The Spirit-Walker\n\n\nThe conduit between the material plane and the spiritual realms, interpreting the will of the unseen.\n\n*You are the bridge. You walk between realities, speaking for the entities that exist in the spaces between the stars. You find balance where others see only chaos or silence.*\n\n*\"The veil is thin here. Can you hear the ancestors?\"*\n\n  - **Core Concept:** Medium / Scout / Utility\n  - **Recommended Occupations:** Adept, Scout.\n  - **Recommended Origins:** Enlightened, Agricultural, Hostile.\n  - **Recommended Factions:** Auluran (Mystics), Sha'Nor, Outworlds (Shamans).\n  - **Key Attributes:** Wisdom (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Discipline (Entropy - Order (Nature/Life)), Insight, Alertness, Knowledge (Nature).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Spirit Walker, Spiritual Attunement.\n  - **Tactical Role:** Detecting other-dimensional threats, communing with local spirits, planar navigation."
  },
  {
    "id": "archetype-zealot",
    "name": "The Zealot",
    "sphere": "Visionaries (The Idealists)",
    "summary": "Roots out heresy and dissent. Skilled in interrogation and intimidation to enforce dogma.",
    "flavor": "You are the purity of the cause. You see the corruption that hides in the hearts of men and burn it out. You are feared not for your strength, but for your absolute, terrifying certainty.",
    "quote": "\"Innocence proves nothing.\"",
    "core_concept": "Social Combat / Anti-Meta",
    "recommended_occupations": [
      "Agent",
      "Soldier (Impyrium)"
    ],
    "recommended_origins": [
      "Militaristic",
      "Urban (Capital)",
      "Enlightened"
    ],
    "recommended_factions": [
      "Impyrium (Inquisitors)",
      "Auluran (Purists)",
      "Dracon Dynasty"
    ],
    "primary_attribute": "Wisdom",
    "secondary_attribute": "Charisma",
    "key_attributes": "Wisdom (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Intimidation",
      "Investigation",
      "Insight",
      "Bluff"
    ],
    "signature_features": [
      "Unwavering Conviction",
      "Fearsome Reputation"
    ],
    "tactical_role": "Breaking enemy morale, uncovering spies, resisting psychic attacks.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Roots out heresy and dissent. Skilled in interrogation and intimidation to enforce dogma.\n\n*You are the purity of the cause. You see the corruption that hides in the hearts of men and burn it out. You are feared not for your strength, but for your absolute, terrifying certainty.*\n\n_\"Innocence proves nothing.\"_",
    "keywords": "zealot, visionary, idealist, leadership, charisma, social combat, anti-meta",
    "negative_keywords": "anti-social, mute, solitary-hermit",
    "signature_traits": [
      "Unwavering Conviction",
      "Fearsome Reputation"
    ],
    "traits": [
      "Unwavering Conviction",
      "Fearsome Reputation"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Zealot\n\n\nRoots out heresy and dissent. Skilled in interrogation and intimidation to enforce dogma.\n\n*You are the purity of the cause. You see the corruption that hides in the hearts of men and burn it out. You are feared not for your strength, but for your absolute, terrifying certainty.*\n\n*\"Innocence proves nothing.\"*\n\n  - **Core Concept:** Social Combat / Anti-Meta\n  - **Recommended Occupations:** Agent, Soldier (Impyrium).\n  - **Recommended Origins:** Militaristic, Urban (Capital), Enlightened.\n  - **Recommended Factions:** Impyrium (Inquisitors), Auluran (Purists), Dracon Dynasty.\n  - **Key Attributes:** Wisdom (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Investigation, Insight, Bluff.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Unwavering Conviction, Fearsome Reputation.\n  - **Tactical Role:** Breaking enemy morale, uncovering spies, resisting psychic attacks.",
    "full_text": "# The Zealot\n\n\nRoots out heresy and dissent. Skilled in interrogation and intimidation to enforce dogma.\n\n*You are the purity of the cause. You see the corruption that hides in the hearts of men and burn it out. You are feared not for your strength, but for your absolute, terrifying certainty.*\n\n*\"Innocence proves nothing.\"*\n\n  - **Core Concept:** Social Combat / Anti-Meta\n  - **Recommended Occupations:** Agent, Soldier (Impyrium).\n  - **Recommended Origins:** Militaristic, Urban (Capital), Enlightened.\n  - **Recommended Factions:** Impyrium (Inquisitors), Auluran (Purists), Dracon Dynasty.\n  - **Key Attributes:** Wisdom (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Intimidation, Investigation, Insight, Bluff.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Unwavering Conviction, Fearsome Reputation.\n  - **Tactical Role:** Breaking enemy morale, uncovering spies, resisting psychic attacks."
  },
  {
    "id": "archetype-academic",
    "name": "The Academic",
    "sphere": "Savants (The Rationals)",
    "summary": "Conducts research to further knowledge. Systematically gathers evidence and tests hypotheses.",
    "flavor": "You question everything. You are driven by the need to understand the fundamental laws of reality. You bring the light of reason to the darkest corners of the galaxy.",
    "quote": "\"Hypothesis: This might explode. Experiment: Let's find out.\"",
    "core_concept": "Intelligence / Utility / Crafter",
    "recommended_occupations": [
      "Scholar",
      "Specialist"
    ],
    "recommended_origins": [
      "Research",
      "Enlightened",
      "Urban"
    ],
    "recommended_factions": [
      "Ascendancy (Universities)",
      "Entari Combine (Colleges)",
      "Alterian Enclave"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Academics",
      "Knowledge (Investigation)",
      "Knowledge (Technology)",
      "Knowledge (Science)"
    ],
    "signature_features": [
      "Scientific Method",
      "Inquisitive Mind"
    ],
    "tactical_role": "Analyzing anomalies, solving environmental puzzles, crafting items.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Conducts research to further knowledge. Systematically gathers evidence and tests hypotheses.\n\n*You question everything. You are driven by the need to understand the fundamental laws of reality. You bring the light of reason to the darkest corners of the galaxy.*\n\n_\"Hypothesis: This might explode. Experiment: Let's find out.\"_",
    "keywords": "academic, savant, rational, intellect, strategist, intelligence, utility",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Scientific Method",
      "Inquisitive Mind"
    ],
    "traits": [
      "Scientific Method",
      "Inquisitive Mind"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Academic\n\n\nConducts research to further knowledge. Systematically gathers evidence and tests hypotheses.\n\n*You question everything. You are driven by the need to understand the fundamental laws of reality. You bring the light of reason to the darkest corners of the galaxy.*\n\n*\"Hypothesis: This might explode. Experiment: Let's find out.\"*\n\n  - **Core Concept:** Intelligence / Utility / Crafter\n  - **Recommended Occupations:** Scholar, Specialist.\n  - **Recommended Origins:** Research, Enlightened, Urban.\n  - **Recommended Factions:** Ascendancy (Universities), Entari Combine (Colleges), Alterian Enclave.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Investigation), Knowledge (Technology), Knowledge (Science).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Scientific Method, Inquisitive Mind.\n  - **Tactical Role:** Analyzing anomalies, solving environmental puzzles, crafting items.",
    "full_text": "# The Academic\n\n\nConducts research to further knowledge. Systematically gathers evidence and tests hypotheses.\n\n*You question everything. You are driven by the need to understand the fundamental laws of reality. You bring the light of reason to the darkest corners of the galaxy.*\n\n*\"Hypothesis: This might explode. Experiment: Let's find out.\"*\n\n  - **Core Concept:** Intelligence / Utility / Crafter\n  - **Recommended Occupations:** Scholar, Specialist.\n  - **Recommended Origins:** Research, Enlightened, Urban.\n  - **Recommended Factions:** Ascendancy (Universities), Entari Combine (Colleges), Alterian Enclave.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Investigation), Knowledge (Technology), Knowledge (Science).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Scientific Method, Inquisitive Mind.\n  - **Tactical Role:** Analyzing anomalies, solving environmental puzzles, crafting items."
  },
  {
    "id": "archetype-architect",
    "name": "The Architect",
    "sphere": "Savants (The Rationals)",
    "summary": "Skilled in the design and upkeep of infrastructure.",
    "flavor": "You design the world. From skyscrapers to space stations, you understand the structures that house civilization. You see the stress points and the hidden flows of energy and people.",
    "quote": "\"Form follows function, but strength is non-negotiable.\"",
    "core_concept": "Builder / Support / Utility",
    "recommended_occupations": [
      "Builder",
      "Scholar"
    ],
    "recommended_origins": [
      "Urban",
      "Industrial",
      "Colony"
    ],
    "recommended_factions": [
      "Syndicate (Arcologies)",
      "Dynasty (Fortresses)",
      "Mekan (Megastructures)"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Vocation (Architect)",
      "Knowledge (Technology)",
      "Vocation (Engineer)"
    ],
    "signature_features": [
      "Macro-Engineering",
      "Coordination"
    ],
    "tactical_role": "Designing bases, identifying structural weaknesses, overseeing construction.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Skilled in the design and upkeep of infrastructure.\n\n*You design the world. From skyscrapers to space stations, you understand the structures that house civilization. You see the stress points and the hidden flows of energy and people.*\n\n_\"Form follows function, but strength is non-negotiable.\"_",
    "keywords": "architect, savant, rational, intellect, strategist, builder, support",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Macro-Engineering",
      "Coordination"
    ],
    "traits": [
      "Macro-Engineering",
      "Coordination"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Architect\n\n\nSkilled in the design and upkeep of infrastructure.\n\n*You design the world. From skyscrapers to space stations, you understand the structures that house civilization. You see the stress points and the hidden flows of energy and people.*\n\n*\"Form follows function, but strength is non-negotiable.\"*\n\n  - **Core Concept:** Builder / Support / Utility\n  - **Recommended Occupations:** Builder, Scholar.\n  - **Recommended Origins:** Urban, Industrial, Colony.\n  - **Recommended Factions:** Syndicate (Arcologies), Dynasty (Fortresses), Mekan (Megastructures).\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Architecture), Knowledge (Technology), Vocation (Engineer).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Macro-Engineering, Coordination.\n  - **Tactical Role:** Designing bases, identifying structural weaknesses, overseeing construction.",
    "full_text": "# The Architect\n\n\nSkilled in the design and upkeep of infrastructure.\n\n*You design the world. From skyscrapers to space stations, you understand the structures that house civilization. You see the stress points and the hidden flows of energy and people.*\n\n*\"Form follows function, but strength is non-negotiable.\"*\n\n  - **Core Concept:** Builder / Support / Utility\n  - **Recommended Occupations:** Builder, Scholar.\n  - **Recommended Origins:** Urban, Industrial, Colony.\n  - **Recommended Factions:** Syndicate (Arcologies), Dynasty (Fortresses), Mekan (Megastructures).\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Architecture), Knowledge (Technology), Vocation (Engineer).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Macro-Engineering, Coordination.\n  - **Tactical Role:** Designing bases, identifying structural weaknesses, overseeing construction."
  },
  {
    "id": "archetype-archivist",
    "name": "The Archivist",
    "sphere": "Savants (The Rationals)",
    "summary": "Studies history and culture. Provides context and insight into societies and ancient technologies.",
    "flavor": "You remember what the world forgot. You know that history repeats itself, and you know how to break the cycle. Your knowledge of the past is the key to surviving the future.",
    "quote": "\"Those who do not learn from the past are doomed to be eaten by it.\"",
    "core_concept": "Knowledge / Utility",
    "recommended_occupations": [
      "Scholar",
      "Representative"
    ],
    "recommended_origins": [
      "Enlightened",
      "Research",
      "Leisure"
    ],
    "recommended_factions": [
      "Mekan (Memory Banks)",
      "Impyrium (Vaults)",
      "Alterian Enclave"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Academics",
      "Insight",
      "Knowledge (History)",
      "Knowledge (Culture)"
    ],
    "signature_features": [
      "Historical Scholar",
      "Archivist"
    ],
    "tactical_role": "Solving puzzles, identifying enemy origins, diplomatic context.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Studies history and culture. Provides context and insight into societies and ancient technologies.\n\n*You remember what the world forgot. You know that history repeats itself, and you know how to break the cycle. Your knowledge of the past is the key to surviving the future.*\n\n_\"Those who do not learn from the past are doomed to be eaten by it.\"_",
    "keywords": "archivist, savant, rational, intellect, strategist, knowledge, utility",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Historical Scholar",
      "Archivist"
    ],
    "traits": [
      "Historical Scholar",
      "Archivist"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Archivist\n\n\nStudies history and culture. Provides context and insight into societies and ancient technologies.\n\n*You remember what the world forgot. You know that history repeats itself, and you know how to break the cycle. Your knowledge of the past is the key to surviving the future.*\n\n*\"Those who do not learn from the past are doomed to be eaten by it.\"*\n\n  - **Core Concept:** Knowledge / Utility\n  - **Recommended Occupations:** Scholar, Representative.\n  - **Recommended Origins:** Enlightened, Research, Leisure.\n  - **Recommended Factions:** Mekan (Memory Banks), Impyrium (Vaults), Alterian Enclave.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Insight, Knowledge (History), Knowledge (Culture).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Historical Scholar, Archivist.\n  - **Tactical Role:** Solving puzzles, identifying enemy origins, diplomatic context.",
    "full_text": "# The Archivist\n\n\nStudies history and culture. Provides context and insight into societies and ancient technologies.\n\n*You remember what the world forgot. You know that history repeats itself, and you know how to break the cycle. Your knowledge of the past is the key to surviving the future.*\n\n*\"Those who do not learn from the past are doomed to be eaten by it.\"*\n\n  - **Core Concept:** Knowledge / Utility\n  - **Recommended Occupations:** Scholar, Representative.\n  - **Recommended Origins:** Enlightened, Research, Leisure.\n  - **Recommended Factions:** Mekan (Memory Banks), Impyrium (Vaults), Alterian Enclave.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Insight, Knowledge (History), Knowledge (Culture).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Historical Scholar, Archivist.\n  - **Tactical Role:** Solving puzzles, identifying enemy origins, diplomatic context."
  },
  {
    "id": "archetype-astromancer",
    "name": "The Astromancer",
    "sphere": "Savants (The Rationals)",
    "summary": "Specializes in the study of celestial objects and phenomena. They provide navigation data and understand the cosmos.",
    "flavor": "You read the stars like a map. You understand the terrifying scale of the cosmos and how to navigate its dangers. When the nav-computer fails, you are the one who guides the ship home.",
    "quote": "\"We are all just stardust. Some of us are just moving faster than others.\"",
    "core_concept": "Expert / Navigator / Science Support",
    "recommended_occupations": [
      "Scholar",
      "Spacer"
    ],
    "recommended_origins": [
      "Research",
      "Spacer",
      "Enlightened"
    ],
    "recommended_factions": [
      "Alterian Enclave",
      "Ascendancy",
      "Void-dwelling species"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Academics",
      "Knowledge (Technology)",
      "Knowledge (Physics)",
      "Alertness"
    ],
    "signature_features": [
      "Celestial Savant",
      "Observational Skills"
    ],
    "tactical_role": "Navigation through anomalies, identifying cosmic threats, operating ship sensors.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Specializes in the study of celestial objects and phenomena. They provide navigation data and understand the cosmos.\n\n*You read the stars like a map. You understand the terrifying scale of the cosmos and how to navigate its dangers. When the nav-computer fails, you are the one who guides the ship home.*\n\n_\"We are all just stardust. Some of us are just moving faster than others.\"_",
    "keywords": "astromancer, savant, rational, intellect, strategist, expert, navigator",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Celestial Savant",
      "Observational Skills"
    ],
    "traits": [
      "Celestial Savant",
      "Observational Skills"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Astromancer\n\n\nSpecializes in the study of celestial objects and phenomena. They provide navigation data and understand the cosmos.\n\n*You read the stars like a map. You understand the terrifying scale of the cosmos and how to navigate its dangers. When the nav-computer fails, you are the one who guides the ship home.*\n\n*\"We are all just stardust. Some of us are just moving faster than others.\"*\n\n  - **Core Concept:** Expert / Navigator / Science Support\n  - **Recommended Occupations:** Scholar, Spacer.\n  - **Recommended Origins:** Research, Spacer, Enlightened.\n  - **Recommended Factions:** Alterian Enclave, Ascendancy, Void-dwelling species.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Technology), Knowledge (Astrophysics), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Celestial Savant, Observational Skills.\n  - **Tactical Role:** Navigation through anomalies, identifying cosmic threats, operating ship sensors.",
    "full_text": "# The Astromancer\n\n\nSpecializes in the study of celestial objects and phenomena. They provide navigation data and understand the cosmos.\n\n*You read the stars like a map. You understand the terrifying scale of the cosmos and how to navigate its dangers. When the nav-computer fails, you are the one who guides the ship home.*\n\n*\"We are all just stardust. Some of us are just moving faster than others.\"*\n\n  - **Core Concept:** Expert / Navigator / Science Support\n  - **Recommended Occupations:** Scholar, Spacer.\n  - **Recommended Origins:** Research, Spacer, Enlightened.\n  - **Recommended Factions:** Alterian Enclave, Ascendancy, Void-dwelling species.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Technology), Knowledge (Astrophysics), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Celestial Savant, Observational Skills.\n  - **Tactical Role:** Navigation through anomalies, identifying cosmic threats, operating ship sensors."
  },
  {
    "id": "archetype-biologist",
    "name": "The Biologist",
    "sphere": "Savants (The Rationals)",
    "summary": "The expert on living systems who studies the interaction between species and their environments.",
    "flavor": "You understand the spark of life. You see the connections between the smallest microbe and the largest apex predator. You find solutions where nature provides the blueprint.",
    "quote": "\"Life always finds a way. I'm just here to watch it happen.\"",
    "core_concept": "Science / Utility / Support",
    "recommended_occupations": [
      "Scholar",
      "Specialist"
    ],
    "recommended_origins": [
      "Agricultural",
      "Research",
      "Aquatic"
    ],
    "recommended_factions": [
      "Auluran (Life-Shapers)",
      "Entari Combine (Botanists)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Medicine",
      "Knowledge (Science \\- Biology)",
      "Knowledge (Nature)",
      "Investigation"
    ],
    "signature_features": [
      "Scientific Method",
      "Ecological Expertise"
    ],
    "tactical_role": "Identifying alien fauna/flora, treating organic toxins, analyzing biological samples.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The expert on living systems who studies the interaction between species and their environments.\n\n*You understand the spark of life. You see the connections between the smallest microbe and the largest apex predator. You find solutions where nature provides the blueprint.*\n\n_\"Life always finds a way. I'm just here to watch it happen.\"_",
    "keywords": "biologist, savant, rational, intellect, strategist, science, utility",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Scientific Method",
      "Ecological Expertise"
    ],
    "traits": [
      "Scientific Method",
      "Ecological Expertise"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Biologist\n\n\nThe expert on living systems who studies the interaction between species and their environments.\n\n*You understand the spark of life. You see the connections between the smallest microbe and the largest apex predator. You find solutions where nature provides the blueprint.*\n\n*\"Life always finds a way. I'm just here to watch it happen.\"*\n\n  - **Core Concept:** Science / Utility / Support\n  - **Recommended Occupations:** Scholar, Specialist.\n  - **Recommended Origins:** Agricultural, Research, Aquatic.\n  - **Recommended Factions:** Auluran (Life-Shapers), Entari Combine (Botanists), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Medicine, Knowledge (Science - Biology),  Knowledge (Nature), Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Scientific Method, Ecological Expertise.\n  - **Tactical Role:** Identifying alien fauna/flora, treating organic toxins, analyzing biological samples.",
    "full_text": "# The Biologist\n\n\nThe expert on living systems who studies the interaction between species and their environments.\n\n*You understand the spark of life. You see the connections between the smallest microbe and the largest apex predator. You find solutions where nature provides the blueprint.*\n\n*\"Life always finds a way. I'm just here to watch it happen.\"*\n\n  - **Core Concept:** Science / Utility / Support\n  - **Recommended Occupations:** Scholar, Specialist.\n  - **Recommended Origins:** Agricultural, Research, Aquatic.\n  - **Recommended Factions:** Auluran (Life-Shapers), Entari Combine (Botanists), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Medicine, Knowledge (Science - Biology),  Knowledge (Nature), Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Scientific Method, Ecological Expertise.\n  - **Tactical Role:** Identifying alien fauna/flora, treating organic toxins, analyzing biological samples."
  },
  {
    "id": "archetype-cryptographer",
    "name": "The Cryptographer",
    "sphere": "Savants (The Rationals)",
    "summary": "An expert in deciphering codes, languages, and hidden messages.",
    "flavor": "You unlock the secrets. No code is unbreakable, no language untranslatable. You find meaning in the chaos, revealing the hidden messages that others cannot see.",
    "quote": "\"Everything is a pattern. I just need to find the key.\"",
    "core_concept": "Intel / Support / Puzzle Solver",
    "recommended_occupations": [
      "Agent",
      "Scholar"
    ],
    "recommended_origins": [
      "Research",
      "Militaristic",
      "Urban"
    ],
    "recommended_factions": [
      "Syndicate (Encryption)",
      "Mekan (Logic)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Investigation)",
      "Knowledge (Language)",
      "Knowledge (Technology)"
    ],
    "signature_features": [
      "Codebreaker",
      "Analytical Mind"
    ],
    "tactical_role": "Decrypting comms, translating alien languages, solving logic puzzles.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "An expert in deciphering codes, languages, and hidden messages.\n\n*You unlock the secrets. No code is unbreakable, no language untranslatable. You find meaning in the chaos, revealing the hidden messages that others cannot see.*\n\n_\"Everything is a pattern. I just need to find the key.\"_",
    "keywords": "cryptographer, savant, rational, intellect, strategist, intel, support",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Codebreaker",
      "Analytical Mind"
    ],
    "traits": [
      "Codebreaker",
      "Analytical Mind"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Cryptographer\n\n\nAn expert in deciphering codes, languages, and hidden messages.\n\n*You unlock the secrets. No code is unbreakable, no language untranslatable. You find meaning in the chaos, revealing the hidden messages that others cannot see.*\n\n*\"Everything is a pattern. I just need to find the key.\"*\n\n  - **Core Concept:** Intel / Support / Puzzle Solver\n  - **Recommended Occupations:** Agent, Scholar.\n  - **Recommended Origins:** Research, Militaristic, Urban.\n  - **Recommended Factions:** Syndicate (Encryption), Mekan (Logic), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Knowledge (Language), Knowledge (Technology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Codebreaker, Analytical Mind.\n  - **Tactical Role:** Decrypting comms, translating alien languages, solving logic puzzles.",
    "full_text": "# The Cryptographer\n\n\nAn expert in deciphering codes, languages, and hidden messages.\n\n*You unlock the secrets. No code is unbreakable, no language untranslatable. You find meaning in the chaos, revealing the hidden messages that others cannot see.*\n\n*\"Everything is a pattern. I just need to find the key.\"*\n\n  - **Core Concept:** Intel / Support / Puzzle Solver\n  - **Recommended Occupations:** Agent, Scholar.\n  - **Recommended Origins:** Research, Militaristic, Urban.\n  - **Recommended Factions:** Syndicate (Encryption), Mekan (Logic), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Knowledge (Language), Knowledge (Technology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Codebreaker, Analytical Mind.\n  - **Tactical Role:** Decrypting comms, translating alien languages, solving logic puzzles."
  },
  {
    "id": "archetype-cyberneticist",
    "name": "The Cyberneticist",
    "sphere": "Savants (The Rationals)",
    "summary": "Specialist in creating, repairing, and modifying cybernetic enhancements.",
    "flavor": "You build better humans. You merge flesh and machine to create something greater than the sum of its parts. You understand the interface between the biological and the technological.",
    "quote": "\"Flesh is weak. Steel is strong. I provide the upgrade.\"",
    "core_concept": "Healer / Crafter / Buffer",
    "recommended_occupations": [
      "Doctor",
      "Engineer"
    ],
    "recommended_origins": [
      "Research",
      "Industrial",
      "Urban"
    ],
    "recommended_factions": [
      "Syndicate (Augmentation Clinics)",
      "Mekan (Integration)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Medicine)",
      "Knowledge (Technology)",
      "Knowledge (Science)",
      "Vocation (Engineer)"
    ],
    "signature_features": [
      "Cybernetic Enhancement",
      "Biomechanical Integration"
    ],
    "tactical_role": "Installing/repairing cybernetics, hacking enemy augments, buffing allies.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Specialist in creating, repairing, and modifying cybernetic enhancements.\n\n*You build better humans. You merge flesh and machine to create something greater than the sum of its parts. You understand the interface between the biological and the technological.*\n\n_\"Flesh is weak. Steel is strong. I provide the upgrade.\"_",
    "keywords": "cyberneticist, savant, rational, intellect, strategist, healer, crafter",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Cybernetic Enhancement",
      "Biomechanical Integration"
    ],
    "traits": [
      "Cybernetic Enhancement",
      "Biomechanical Integration"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Cyberneticist\n\n\nSpecialist in creating, repairing, and modifying cybernetic enhancements.\n\n*You build better humans. You merge flesh and machine to create something greater than the sum of its parts. You understand the interface between the biological and the technological.*\n\n*\"Flesh is weak. Steel is strong. I provide the upgrade.\"*\n\n  - **Core Concept:** Healer / Crafter / Buffer\n  - **Recommended Occupations:** Specialist (*Doctor*), Builder (*Engineer*).\n  - **Recommended Origins:** Research, Industrial, Urban.\n  - **Recommended Factions:** Syndicate (Augmentation Clinics), Mekan (Integration), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Medicine), Knowledge (Technology), Knowledge (Biology), Vocation (Engineer).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cybernetic Enhancement, Biomechanical Integration.\n  - **Tactical Role:** Installing/repairing cybernetics, hacking enemy augments, buffing allies.",
    "full_text": "# The Cyberneticist\n\n\nSpecialist in creating, repairing, and modifying cybernetic enhancements.\n\n*You build better humans. You merge flesh and machine to create something greater than the sum of its parts. You understand the interface between the biological and the technological.*\n\n*\"Flesh is weak. Steel is strong. I provide the upgrade.\"*\n\n  - **Core Concept:** Healer / Crafter / Buffer\n  - **Recommended Occupations:** Specialist (*Doctor*), Builder (*Engineer*).\n  - **Recommended Origins:** Research, Industrial, Urban.\n  - **Recommended Factions:** Syndicate (Augmentation Clinics), Mekan (Integration), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Medicine), Knowledge (Technology), Knowledge (Biology), Vocation (Engineer).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cybernetic Enhancement, Biomechanical Integration.\n  - **Tactical Role:** Installing/repairing cybernetics, hacking enemy augments, buffing allies."
  },
  {
    "id": "archetype-decker",
    "name": "The Decker",
    "sphere": "Savants (The Rationals)",
    "summary": "A master of cyberspace who infiltrates networks, manipulates data, and exploits vulnerabilities.",
    "flavor": "You own the network. While they lock the physical doors, you walk through the digital walls. You steal secrets, crash systems, and turn their own security against them without ever drawing a weapon.",
    "quote": "\"Access granted. Now, let's see what you're hiding.\"",
    "core_concept": "Tech / Stealth / Intel",
    "recommended_occupations": [
      "Specialist",
      "Criminal"
    ],
    "recommended_origins": [
      "Urban",
      "Industrial",
      "Research"
    ],
    "recommended_factions": [
      "Syndicate (The Grid)",
      "Mekan (The Code)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Agility",
    "key_attributes": "Intellect (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Investigation",
      "Knowledge (Computers)"
    ],
    "signature_features": [
      "Cyber Warfare",
      "Digital Ghost"
    ],
    "tactical_role": "Disabling alarms, stealing data, controlling enemy drones/turrets.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A master of cyberspace who infiltrates networks, manipulates data, and exploits vulnerabilities.\n\n*You own the network. While they lock the physical doors, you walk through the digital walls. You steal secrets, crash systems, and turn their own security against them without ever drawing a weapon.*\n\n_\"Access granted. Now, let's see what you're hiding.\"_",
    "keywords": "decker, savant, rational, intellect, strategist, tech, stealth",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, heavy-plating",
    "signature_traits": [
      "Cyber Warfare",
      "Digital Ghost"
    ],
    "traits": [
      "Cyber Warfare",
      "Digital Ghost"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Decker\n\n\nA master of cyberspace who infiltrates networks, manipulates data, and exploits vulnerabilities.\n\n*You own the network. While they lock the physical doors, you walk through the digital walls. You steal secrets, crash systems, and turn their own security against them without ever drawing a weapon.*\n\n*\"Access granted. Now, let's see what you're hiding.\"*\n\n  - **Core Concept:** Tech / Stealth / Intel\n  - **Recommended Occupations:** Specialist, Criminal.\n  - **Recommended Origins:** Urban, Industrial, Research.\n  - **Recommended Factions:** Syndicate (The Grid), Mekan (The Code), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Investigation, Knowledge (Computers).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cyber Warfare, Digital Ghost.\n  - **Tactical Role:** Disabling alarms, stealing data, controlling enemy drones/turrets.",
    "full_text": "# The Decker\n\n\nA master of cyberspace who infiltrates networks, manipulates data, and exploits vulnerabilities.\n\n*You own the network. While they lock the physical doors, you walk through the digital walls. You steal secrets, crash systems, and turn their own security against them without ever drawing a weapon.*\n\n*\"Access granted. Now, let's see what you're hiding.\"*\n\n  - **Core Concept:** Tech / Stealth / Intel\n  - **Recommended Occupations:** Specialist, Criminal.\n  - **Recommended Origins:** Urban, Industrial, Research.\n  - **Recommended Factions:** Syndicate (The Grid), Mekan (The Code), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Investigation, Knowledge (Computers).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cyber Warfare, Digital Ghost.\n  - **Tactical Role:** Disabling alarms, stealing data, controlling enemy drones/turrets."
  },
  {
    "id": "archetype-detective",
    "name": "The Detective",
    "sphere": "Savants (The Rationals)",
    "summary": "Relentless detective who uncovers conspiracies and brings criminals to justice.",
    "flavor": "You find the truth. You don't stop until the puzzle is solved and the guilty are exposed. You notice the details that others miss, following the trail wherever it leads.",
    "quote": "\"Everyone has a secret. I just have to find the loose thread.\"",
    "core_concept": "Investigation / Perception",
    "recommended_occupations": [
      "Agent",
      "Citizen (Law)"
    ],
    "recommended_origins": [
      "Urban",
      "Colony",
      "Hostile"
    ],
    "recommended_factions": [
      "Coalition (Marshals)",
      "Syndicate (PIs)",
      "Entari Combine"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Investigation)",
      "Insight",
      "Stealth",
      "Knowledge (Law/Streetwise)"
    ],
    "signature_features": [
      "Keen Observer",
      "Unwavering Determination"
    ],
    "tactical_role": "Finding plot hooks, solving mysteries, tracking targets in cities.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Relentless detective who uncovers conspiracies and brings criminals to justice.\n\n*You find the truth. You don't stop until the puzzle is solved and the guilty are exposed. You notice the details that others miss, following the trail wherever it leads.*\n\n_\"Everyone has a secret. I just have to find the loose thread.\"_",
    "keywords": "detective, savant, rational, intellect, strategist, investigation, perception",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Keen Observer",
      "Unwavering Determination"
    ],
    "traits": [
      "Keen Observer",
      "Unwavering Determination"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Detective\n\n\nRelentless detective who uncovers conspiracies and brings criminals to justice.\n\n*You find the truth. You don't stop until the puzzle is solved and the guilty are exposed. You notice the details that others miss, following the trail wherever it leads.*\n\n*\"Everyone has a secret. I just have to find the loose thread.\"*\n\n  - **Core Concept:** Investigation / Perception\n  - **Recommended Occupations:** Agent, Citizen (Law).\n  - **Recommended Origins:** Urban, Colony, Hostile.\n  - **Recommended Factions:** Coalition (Marshals), Syndicate (PIs), Entari Combine.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Insight, Stealth, Knowledge (Law/Streetwise).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Keen Observer, Unwavering Determination.\n  - **Tactical Role:** Finding plot hooks, solving mysteries, tracking targets in cities.",
    "full_text": "# The Detective\n\n\nRelentless detective who uncovers conspiracies and brings criminals to justice.\n\n*You find the truth. You don't stop until the puzzle is solved and the guilty are exposed. You notice the details that others miss, following the trail wherever it leads.*\n\n*\"Everyone has a secret. I just have to find the loose thread.\"*\n\n  - **Core Concept:** Investigation / Perception\n  - **Recommended Occupations:** Agent, Citizen (Law).\n  - **Recommended Origins:** Urban, Colony, Hostile.\n  - **Recommended Factions:** Coalition (Marshals), Syndicate (PIs), Entari Combine.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Insight, Stealth, Knowledge (Law/Streetwise).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Keen Observer, Unwavering Determination.\n  - **Tactical Role:** Finding plot hooks, solving mysteries, tracking targets in cities."
  },
  {
    "id": "archetype-forensic-pathologist",
    "name": "The Forensic Pathologist",
    "sphere": "Savants (The Rationals)",
    "summary": "An expert in determining cause of death and analyzing biological evidence.",
    "flavor": "The dead speak to you. You read the story of their final moments in their wounds and chemistry. You find the truth that the living try to hide.",
    "quote": "\"The body never lies.\"",
    "core_concept": "Investigation / Science / Intel",
    "recommended_occupations": [
      "Doctor",
      "Agent"
    ],
    "recommended_origins": [
      "Research",
      "Urban",
      "Colony"
    ],
    "recommended_factions": [
      "Entari Combine (Justice)",
      "Syndicate (Internal Affairs)",
      "Coalition"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Medicine)",
      "Knowledge (Investigation)",
      "Knowledge (Science \\- Biology)"
    ],
    "signature_features": [
      "Forensic Analysis",
      "Medical Expertise"
    ],
    "tactical_role": "Solving murders, identifying toxins/diseases, analyzing biological threats.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "An expert in determining cause of death and analyzing biological evidence.\n\n*The dead speak to you. You read the story of their final moments in their wounds and chemistry. You find the truth that the living try to hide.*\n\n_\"The body never lies.\"_",
    "keywords": "forensic pathologist, savant, rational, intellect, strategist, investigation, science",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Forensic Analysis",
      "Medical Expertise"
    ],
    "traits": [
      "Forensic Analysis",
      "Medical Expertise"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Forensic Pathologist\n\n\nAn expert in determining cause of death and analyzing biological evidence.\n\n*The dead speak to you. You read the story of their final moments in their wounds and chemistry. You find the truth that the living try to hide.*\n\n*\"The body never lies.\"*\n\n  - **Core Concept:** Investigation / Science / Intel\n  - **Recommended Occupations:** Specialist (*Doctor*), Agent.\n  - **Recommended Origins:** Research, Urban, Colony.\n  - **Recommended Factions:** Entari Combine (Justice), Syndicate (Internal Affairs), Coalition.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Medicine), Knowledge (Investigation), Knowledge (Science - Biology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Forensic Analysis, Medical Expertise.\n  - **Tactical Role:** Solving murders, identifying toxins/diseases, analyzing biological threats.",
    "full_text": "# The Forensic Pathologist\n\n\nAn expert in determining cause of death and analyzing biological evidence.\n\n*The dead speak to you. You read the story of their final moments in their wounds and chemistry. You find the truth that the living try to hide.*\n\n*\"The body never lies.\"*\n\n  - **Core Concept:** Investigation / Science / Intel\n  - **Recommended Occupations:** Specialist (*Doctor*), Agent.\n  - **Recommended Origins:** Research, Urban, Colony.\n  - **Recommended Factions:** Entari Combine (Justice), Syndicate (Internal Affairs), Coalition.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Medicine), Knowledge (Investigation), Knowledge (Science - Biology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Forensic Analysis, Medical Expertise.\n  - **Tactical Role:** Solving murders, identifying toxins/diseases, analyzing biological threats."
  },
  {
    "id": "archetype-geneticist",
    "name": "The Geneticist",
    "sphere": "Savants (The Rationals)",
    "summary": "Applies genetic engineering and biotechnology to create innovative tools, medicines, and biological constructs.",
    "flavor": "You design life. You see biology not as destiny, but as a canvas. You cure the incurable, enhance the weak, and grow solutions to problems that machines cannot solve.",
    "quote": "\"Evolution is too slow. I prefer immediate results.\"",
    "core_concept": "Healer / Crafter / Pet Master",
    "recommended_occupations": [
      "Specialist",
      "Scholar (Auluran)"
    ],
    "recommended_origins": [
      "Research",
      "Agricultural",
      "Enlightened"
    ],
    "recommended_factions": [
      "Auluran (Bio-Shapers)",
      "Syndicate (Augmenters)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Knowledge (Medicine)",
      "Knowledge (Science \\- Genetics)",
      "Knowledge (Science \\- Biology)"
    ],
    "signature_features": [
      "Biotechnologist",
      "Adaptive Engineering"
    ],
    "tactical_role": "Healing, creating buffs/mutations, identifying xeno-threats.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Applies genetic engineering and biotechnology to create innovative tools, medicines, and biological constructs.\n\n*You design life. You see biology not as destiny, but as a canvas. You cure the incurable, enhance the weak, and grow solutions to problems that machines cannot solve.*\n\n_\"Evolution is too slow. I prefer immediate results.\"_",
    "keywords": "geneticist, savant, rational, intellect, strategist, healer, crafter",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Biotechnologist",
      "Adaptive Engineering"
    ],
    "traits": [
      "Biotechnologist",
      "Adaptive Engineering"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Geneticist\n\n\nApplies genetic engineering and biotechnology to create innovative tools, medicines, and biological constructs.\n\n*You design life. You see biology not as destiny, but as a canvas. You cure the incurable, enhance the weak, and grow solutions to problems that machines cannot solve.*\n\n*\"Evolution is too slow. I prefer immediate results.\"*\n\n  - **Core Concept:** Healer / Crafter / Pet Master\n  - **Recommended Occupations:** Specialist, Scholar (Auluran).\n  - **Recommended Origins:** Research, Agricultural, Enlightened.\n  - **Recommended Factions:** Auluran (Bio-Shapers), Syndicate (Augmenters), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Medicine), Knowledge (Science - Genetics), Knowledge (Science - Biology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Biotechnologist, Adaptive Engineering.\n  - **Tactical Role:** Healing, creating buffs/mutations, identifying xeno-threats.",
    "full_text": "# The Geneticist\n\n\nApplies genetic engineering and biotechnology to create innovative tools, medicines, and biological constructs.\n\n*You design life. You see biology not as destiny, but as a canvas. You cure the incurable, enhance the weak, and grow solutions to problems that machines cannot solve.*\n\n*\"Evolution is too slow. I prefer immediate results.\"*\n\n  - **Core Concept:** Healer / Crafter / Pet Master\n  - **Recommended Occupations:** Specialist, Scholar (Auluran).\n  - **Recommended Origins:** Research, Agricultural, Enlightened.\n  - **Recommended Factions:** Auluran (Bio-Shapers), Syndicate (Augmenters), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Knowledge (Medicine), Knowledge (Science - Genetics), Knowledge (Science - Biology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Biotechnologist, Adaptive Engineering.\n  - **Tactical Role:** Healing, creating buffs/mutations, identifying xeno-threats."
  },
  {
    "id": "archetype-linguist",
    "name": "The Linguist",
    "sphere": "Savants (The Rationals)",
    "summary": "The master of communication who deciphers the languages of the galaxy to enable cooperation or manipulation.",
    "flavor": "You are the key to understanding. You translate the inscrutable and find the meaning hidden in alien noise. You know that the right word is often more powerful than the largest railgun.",
    "quote": "\"Language is the first weapon. And the first shield.\"",
    "core_concept": "Intel / Face / Support",
    "recommended_occupations": [
      "Scholar",
      "Representative"
    ],
    "recommended_origins": [
      "Urban",
      "Research",
      "Spacer"
    ],
    "recommended_factions": [
      "Entari Combine (Translators)",
      "Alterian Enclave",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Charisma",
    "key_attributes": "Intellect (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Knowledge (Language)",
      "Diplomacy",
      "Insight",
      "Knowledge (History)"
    ],
    "signature_features": [
      "Polyglot",
      "Cultural Interpreter"
    ],
    "tactical_role": "Translating alien documents/comms, mediating first contact, deciphering codes.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The master of communication who deciphers the languages of the galaxy to enable cooperation or manipulation.\n\n*You are the key to understanding. You translate the inscrutable and find the meaning hidden in alien noise. You know that the right word is often more powerful than the largest railgun.*\n\n_\"Language is the first weapon. And the first shield.\"_",
    "keywords": "linguist, savant, rational, intellect, strategist, intel, face",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Polyglot",
      "Cultural Interpreter"
    ],
    "traits": [
      "Polyglot",
      "Cultural Interpreter"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Linguist\n\n\nThe master of communication who deciphers the languages of the galaxy to enable cooperation or manipulation.\n\n*You are the key to understanding. You translate the inscrutable and find the meaning hidden in alien noise. You know that the right word is often more powerful than the largest railgun.*\n\n*\"Language is the first weapon. And the first shield.\"*\n\n  - **Core Concept:** Intel / Face / Support\n  - **Recommended Occupations:** Scholar, Representative.\n  - **Recommended Origins:** Urban, Research, Spacer.\n  - **Recommended Factions:** Entari Combine (Translators), Alterian Enclave, Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Languages), Diplomacy, Insight, Knowledge (History).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Polyglot, Cultural Interpreter.\n  - **Tactical Role:** Translating alien documents/comms, mediating first contact, deciphering codes.",
    "full_text": "# The Linguist\n\n\nThe master of communication who deciphers the languages of the galaxy to enable cooperation or manipulation.\n\n*You are the key to understanding. You translate the inscrutable and find the meaning hidden in alien noise. You know that the right word is often more powerful than the largest railgun.*\n\n*\"Language is the first weapon. And the first shield.\"*\n\n  - **Core Concept:** Intel / Face / Support\n  - **Recommended Occupations:** Scholar, Representative.\n  - **Recommended Origins:** Urban, Research, Spacer.\n  - **Recommended Factions:** Entari Combine (Translators), Alterian Enclave, Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Languages), Diplomacy, Insight, Knowledge (History).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Polyglot, Cultural Interpreter.\n  - **Tactical Role:** Translating alien documents/comms, mediating first contact, deciphering codes."
  },
  {
    "id": "archetype-magus",
    "name": "The Magus",
    "sphere": "Savants (The Rationals)",
    "summary": "A master of arcane magic, manipulating subtle energies to cast powerful spells through intricate gestures and rituals.",
    "flavor": "You hack reality. You have studied the underlying code of the universe and learned to rewrite it with a gesture. Fire, gravity, and time are just variables for you to manipulate.",
    "quote": "\"Physics is just a suggestion I choose to ignore.\"",
    "core_concept": "Artillery / Utility / Glass Cannon",
    "recommended_occupations": [
      "Adept",
      "Scholar"
    ],
    "recommended_origins": [
      "Enlightened",
      "Research",
      "Urban"
    ],
    "recommended_factions": [
      "Alterian Enclave (Arcanists)",
      "Dracon Dynasty (Sorcerers)",
      "Auluran (Shamans)"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Stamina",
    "key_attributes": "Intellect (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Alertness",
      "Two Disciplines (e.g",
      "Energy",
      "Dimension)",
      "Attune"
    ],
    "signature_features": [
      "Arcane Mastery",
      "Spell Weaving"
    ],
    "tactical_role": "Area damage, battlefield control, utility casting.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A master of arcane magic, manipulating subtle energies to cast powerful spells through intricate gestures and rituals.\n\n*You hack reality. You have studied the underlying code of the universe and learned to rewrite it with a gesture. Fire, gravity, and time are just variables for you to manipulate.*\n\n_\"Physics is just a suggestion I choose to ignore.\"_",
    "keywords": "magus, savant, rational, intellect, strategist, artillery, utility",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Arcane Mastery",
      "Spell Weaving"
    ],
    "traits": [
      "Arcane Mastery",
      "Spell Weaving"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Magus\n\n\nA master of arcane magic, manipulating subtle energies to cast powerful spells through intricate gestures and rituals.\n\n*You hack reality. You have studied the underlying code of the universe and learned to rewrite it with a gesture. Fire, gravity, and time are just variables for you to manipulate.*\n\n*\"Physics is just a suggestion I choose to ignore.\"*\n\n  - **Core Concept:** Artillery / Utility / Glass Cannon\n  - **Recommended Occupations:** Adept, Scholar.\n  - **Recommended Origins:** Enlightened, Research, Urban.\n  - **Recommended Factions:** Alterian Enclave (Arcanists), Dracon Dynasty (Sorcerers), Auluran (Shamans).\n  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Alertness, Two Disciplines (e.g., Energy, Dimension), Attune.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Arcane Mastery, Spell Weaving.\n  - **Tactical Role:** Area damage, battlefield control, utility casting.",
    "full_text": "# The Magus\n\n\nA master of arcane magic, manipulating subtle energies to cast powerful spells through intricate gestures and rituals.\n\n*You hack reality. You have studied the underlying code of the universe and learned to rewrite it with a gesture. Fire, gravity, and time are just variables for you to manipulate.*\n\n*\"Physics is just a suggestion I choose to ignore.\"*\n\n  - **Core Concept:** Artillery / Utility / Glass Cannon\n  - **Recommended Occupations:** Adept, Scholar.\n  - **Recommended Origins:** Enlightened, Research, Urban.\n  - **Recommended Factions:** Alterian Enclave (Arcanists), Dracon Dynasty (Sorcerers), Auluran (Shamans).\n  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Alertness, Two Disciplines (e.g., Energy, Dimension), Attune.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Arcane Mastery, Spell Weaving.\n  - **Tactical Role:** Area damage, battlefield control, utility casting."
  },
  {
    "id": "archetype-maker",
    "name": "The Maker",
    "sphere": "Savants (The Rationals)",
    "summary": "A brilliant inventor and technician who develops and maintains advanced technology. Skilled in hardware and software.",
    "flavor": "You build the future. If it's broken, you fix it; if it doesn't exist, you invent it. You keep the ship flying, the guns firing, and the lights on when the universe tries to turn them off.",
    "quote": "\"Give me a wrench and five minutes. I'll make it work.\"",
    "core_concept": "Utility / Support / Repair",
    "recommended_occupations": [
      "Builder",
      "Specialist"
    ],
    "recommended_origins": [
      "Industrial",
      "Urban",
      "Research"
    ],
    "recommended_factions": [
      "Mekan (Constructors)",
      "Syndicate (Engineers)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Agility",
    "key_attributes": "Intellect (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Vocation (Engineer)",
      "Vocation (Mechanic)",
      "Vocation (Electrician)"
    ],
    "signature_features": [
      "Master Builder",
      "Technical Aptitude"
    ],
    "tactical_role": "Fixing the ship/vehicle, building defenses, analyzing enemy tech.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A brilliant inventor and technician who develops and maintains advanced technology. Skilled in hardware and software.\n\n*You build the future. If it's broken, you fix it; if it doesn't exist, you invent it. You keep the ship flying, the guns firing, and the lights on when the universe tries to turn them off.*\n\n_\"Give me a wrench and five minutes. I'll make it work.\"_",
    "keywords": "maker, savant, rational, intellect, strategist, utility, support",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Master Builder",
      "Technical Aptitude"
    ],
    "traits": [
      "Master Builder",
      "Technical Aptitude"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Maker\n\n\nA brilliant inventor and technician who develops and maintains advanced technology. Skilled in hardware and software.\n\n*You build the future. If it's broken, you fix it; if it doesn't exist, you invent it. You keep the ship flying, the guns firing, and the lights on when the universe tries to turn them off.*\n\n*\"Give me a wrench and five minutes. I'll make it work.\"*\n\n  - **Core Concept:** Utility / Support / Repair\n  - **Recommended Occupations:** Builder, Specialist.\n  - **Recommended Origins:** Industrial, Urban, Research.\n  - **Recommended Factions:** Mekan (Constructors), Syndicate (Engineers), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Engineer), Vocation (Mechanic), Vocation (Electrician).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Master Builder, Technical Aptitude.\n  - **Tactical Role:** Fixing the ship/vehicle, building defenses, analyzing enemy tech.",
    "full_text": "# The Maker\n\n\nA brilliant inventor and technician who develops and maintains advanced technology. Skilled in hardware and software.\n\n*You build the future. If it's broken, you fix it; if it doesn't exist, you invent it. You keep the ship flying, the guns firing, and the lights on when the universe tries to turn them off.*\n\n*\"Give me a wrench and five minutes. I'll make it work.\"*\n\n  - **Core Concept:** Utility / Support / Repair\n  - **Recommended Occupations:** Builder, Specialist.\n  - **Recommended Origins:** Industrial, Urban, Research.\n  - **Recommended Factions:** Mekan (Constructors), Syndicate (Engineers), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Engineer), Vocation (Mechanic), Vocation (Electrician).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Master Builder, Technical Aptitude.\n  - **Tactical Role:** Fixing the ship/vehicle, building defenses, analyzing enemy tech."
  },
  {
    "id": "archetype-navigator",
    "name": "The Navigator",
    "sphere": "Savants (The Rationals)",
    "summary": "A skilled pilot and navigator who charts the course for ships.",
    "flavor": "You know the way. The void is vast and trackless, but you never lose your way. You guide the ship through the dark, avoiding hazards and finding the fastest route to your destination.",
    "quote": "\"Trust my headings. I've never lost a ship yet.\"",
    "core_concept": "Transport / Support / Explorer",
    "recommended_occupations": [
      "Spacer",
      "Specialist"
    ],
    "recommended_origins": [
      "Spacer",
      "Research",
      "Colony"
    ],
    "recommended_factions": [
      "Ascendancy (Reach Explorers)",
      "Impyrium (Navigators Guild)",
      "Outworlds"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Navigation)",
      "Pilot",
      "Knowledge (Technology)"
    ],
    "signature_features": [
      "Cartographer",
      "Ace Pilot"
    ],
    "tactical_role": "Plotting FTL jumps, navigating hazards, mapping sectors.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A skilled pilot and navigator who charts the course for ships.\n\n*You know the way. The void is vast and trackless, but you never lose your way. You guide the ship through the dark, avoiding hazards and finding the fastest route to your destination.*\n\n_\"Trust my headings. I've never lost a ship yet.\"_",
    "keywords": "navigator, savant, rational, intellect, strategist, transport, support",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Cartographer",
      "Ace Pilot"
    ],
    "traits": [
      "Cartographer",
      "Ace Pilot"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Navigator\n\n\nA skilled pilot and navigator who charts the course for ships.\n\n*You know the way. The void is vast and trackless, but you never lose your way. You guide the ship through the dark, avoiding hazards and finding the fastest route to your destination.*\n\n*\"Trust my headings. I've never lost a ship yet.\"*\n\n  - **Core Concept:** Transport / Support / Explorer\n  - **Recommended Occupations:** Spacer, Specialist.\n  - **Recommended Origins:** Spacer, Research, Colony.\n  - **Recommended Factions:** Ascendancy (Reach Explorers), Impyrium (Navigators Guild), Outworlds.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Navigation), Pilot, Knowledge (Technology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cartographer, Ace Pilot.\n  - **Tactical Role:** Plotting FTL jumps, navigating hazards, mapping sectors.",
    "full_text": "# The Navigator\n\n\nA skilled pilot and navigator who charts the course for ships.\n\n*You know the way. The void is vast and trackless, but you never lose your way. You guide the ship through the dark, avoiding hazards and finding the fastest route to your destination.*\n\n*\"Trust my headings. I've never lost a ship yet.\"*\n\n  - **Core Concept:** Transport / Support / Explorer\n  - **Recommended Occupations:** Spacer, Specialist.\n  - **Recommended Origins:** Spacer, Research, Colony.\n  - **Recommended Factions:** Ascendancy (Reach Explorers), Impyrium (Navigators Guild), Outworlds.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Navigation), Pilot, Knowledge (Technology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cartographer, Ace Pilot.\n  - **Tactical Role:** Plotting FTL jumps, navigating hazards, mapping sectors."
  },
  {
    "id": "archetype-net-architect",
    "name": "The Net-architect",
    "sphere": "Savants (The Rationals)",
    "summary": "The high-level systems engineer who designs and manages the data infrastructures that link civilizations.",
    "flavor": "You build the digital world. You don't just hack systems; you create the foundations they sit on. You understand the flow of information as a physical force that must be harnessed.",
    "quote": "\"The Grid is my masterpiece. Every packet of data is where I intended it to be.\"",
    "core_concept": "Tech / Logistics / Support",
    "recommended_occupations": [
      "Specialist",
      "Builder"
    ],
    "recommended_origins": [
      "Urban",
      "Industrial",
      "Research"
    ],
    "recommended_factions": [
      "Syndicate (Mesh Architects)",
      "Mekan (Grid Weavers)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Agility",
    "key_attributes": "Intellect (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Computers)",
      "Vocation (Engineer)",
      "Knowledge (Technology)"
    ],
    "signature_features": [
      "Automation Expert",
      "Master Builder"
    ],
    "tactical_role": "Hardening party networks, creating tactical data-links, identifying digital infrastructure weaknesses.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The high-level systems engineer who designs and manages the data infrastructures that link civilizations.\n\n*You build the digital world. You don't just hack systems; you create the foundations they sit on. You understand the flow of information as a physical force that must be harnessed.*\n\n_\"The Grid is my masterpiece. Every packet of data is where I intended it to be.\"_",
    "keywords": "net-architect, savant, rational, intellect, strategist, tech, logistics",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Automation Expert",
      "Master Builder"
    ],
    "traits": [
      "Automation Expert",
      "Master Builder"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Net-Architect\n\n\nThe high-level systems engineer who designs and manages the data infrastructures that link civilizations.\n\n*You build the digital world. You don't just hack systems; you create the foundations they sit on. You understand the flow of information as a physical force that must be harnessed.*\n\n*\"The Grid is my masterpiece. Every packet of data is where I intended it to be.\"*\n\n  - **Core Concept:** Tech / Logistics / Support\n  - **Recommended Occupations:** Specialist, Builder.\n  - **Recommended Origins:** Urban, Industrial, Research.\n  - **Recommended Factions:** Syndicate (Mesh Architects), Mekan (Grid Weavers), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Computers), Vocation (Engineer), Knowledge (Technology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Automation Expert, Master Builder.\n  - **Tactical Role:** Hardening party networks, creating tactical data-links, identifying digital infrastructure weaknesses.",
    "full_text": "# The Net-Architect\n\n\nThe high-level systems engineer who designs and manages the data infrastructures that link civilizations.\n\n*You build the digital world. You don't just hack systems; you create the foundations they sit on. You understand the flow of information as a physical force that must be harnessed.*\n\n*\"The Grid is my masterpiece. Every packet of data is where I intended it to be.\"*\n\n  - **Core Concept:** Tech / Logistics / Support\n  - **Recommended Occupations:** Specialist, Builder.\n  - **Recommended Origins:** Urban, Industrial, Research.\n  - **Recommended Factions:** Syndicate (Mesh Architects), Mekan (Grid Weavers), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Computers), Vocation (Engineer), Knowledge (Technology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Automation Expert, Master Builder.\n  - **Tactical Role:** Hardening party networks, creating tactical data-links, identifying digital infrastructure weaknesses."
  },
  {
    "id": "archetype-planetologist",
    "name": "The Planetologist",
    "sphere": "Savants (The Rationals)",
    "summary": "A scholar who studies the geology, climate, and ecosystems of planets.",
    "flavor": "You read the world. You understand the forces that shape planets, from tectonics to weather. You know where to find resources and how to survive the elements.",
    "quote": "\"This planet is alive, and right now, it's angry.\"",
    "core_concept": "Science / Survival / Explorer",
    "recommended_occupations": [
      "Scholar",
      "Explorer"
    ],
    "recommended_origins": [
      "Research",
      "Colony",
      "Hostile"
    ],
    "recommended_factions": [
      "Auluran (Terraformers)",
      "Ascendancy",
      "Entari Combine"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Stamina",
    "key_attributes": "Intellect (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Academics",
      "Knowledge (Survival)",
      "Knowledge (Science \\- Geology)",
      "Knowledge (Science \\- Biology)"
    ],
    "signature_features": [
      "Planetary Savant",
      "Field Researcher"
    ],
    "tactical_role": "Identifying environmental hazards, finding resources, surviving planetary conditions.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A scholar who studies the geology, climate, and ecosystems of planets.\n\n*You read the world. You understand the forces that shape planets, from tectonics to weather. You know where to find resources and how to survive the elements.*\n\n_\"This planet is alive, and right now, it's angry.\"_",
    "keywords": "planetologist, savant, rational, intellect, strategist, science, survival",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Planetary Savant",
      "Field Researcher"
    ],
    "traits": [
      "Planetary Savant",
      "Field Researcher"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Planetologist\n\n\nA scholar who studies the geology, climate, and ecosystems of planets.\n\n*You read the world. You understand the forces that shape planets, from tectonics to weather. You know where to find resources and how to survive the elements.*\n\n*\"This planet is alive, and right now, it's angry.\"*\n\n  - **Core Concept:** Science / Survival / Explorer\n  - **Recommended Occupations:** Scholar, Scout (*Explorer*).\n  - **Recommended Origins:** Research, Colony, Hostile.\n  - **Recommended Factions:** Auluran (Terraformers), Ascendancy, Entari Combine.\n  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Survival), Knowledge (Science - Geology), Knowledge (Science - Biology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Planetary Savant, Field Researcher.\n  - **Tactical Role:** Identifying environmental hazards, finding resources, surviving planetary conditions.",
    "full_text": "# The Planetologist\n\n\nA scholar who studies the geology, climate, and ecosystems of planets.\n\n*You read the world. You understand the forces that shape planets, from tectonics to weather. You know where to find resources and how to survive the elements.*\n\n*\"This planet is alive, and right now, it's angry.\"*\n\n  - **Core Concept:** Science / Survival / Explorer\n  - **Recommended Occupations:** Scholar, Scout (*Explorer*).\n  - **Recommended Origins:** Research, Colony, Hostile.\n  - **Recommended Factions:** Auluran (Terraformers), Ascendancy, Entari Combine.\n  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Survival), Knowledge (Science - Geology), Knowledge (Science - Biology).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Planetary Savant, Field Researcher.\n  - **Tactical Role:** Identifying environmental hazards, finding resources, surviving planetary conditions."
  },
  {
    "id": "archetype-relic-hunter",
    "name": "The Relic Hunter",
    "sphere": "Savants (The Rationals)",
    "summary": "Unveils the secrets of ancient ruins and artifacts, reconstructing chronicles of civilizations long gone.",
    "flavor": "You dig up the past to save the future. You are fearless in the face of ancient traps and curses, driven by the need to uncover the truth buried beneath the dust of ages.",
    "quote": "\"It belongs in a museum! Or at least, in my cargo hold.\"",
    "core_concept": "Explorer / Lore Expert / Trap Specialist",
    "recommended_occupations": [
      "Scholar",
      "Explorer"
    ],
    "recommended_origins": [
      "Research",
      "Colony",
      "Spacer"
    ],
    "recommended_factions": [
      "Alterian Enclave (Lore)",
      "Syndicate (Profit)",
      "Ascendancy (Research)"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Stamina",
    "key_attributes": "Intellect (Primary), Stamina (Secondary).",
    "essential_skills": [
      "Knowledge (Investigation)",
      "Knowledge (History)",
      "Knowledge (Survival)",
      "Knowledge (Culture)"
    ],
    "signature_features": [
      "Excavation Expert",
      "Artifact Analyst"
    ],
    "tactical_role": "Navigate dungeons, identify magical/tech loot, bypass ancient defenses.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Unveils the secrets of ancient ruins and artifacts, reconstructing chronicles of civilizations long gone.\n\n*You dig up the past to save the future. You are fearless in the face of ancient traps and curses, driven by the need to uncover the truth buried beneath the dust of ages.*\n\n_\"It belongs in a museum! Or at least, in my cargo hold.\"_",
    "keywords": "relic hunter, savant, rational, intellect, strategist, explorer, lore expert",
    "negative_keywords": "mindless-brute, reckless, illiterate, null-zone, anti-magic-fanatic",
    "signature_traits": [
      "Excavation Expert",
      "Artifact Analyst"
    ],
    "traits": [
      "Excavation Expert",
      "Artifact Analyst"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Relic Hunter\n\n\nUnveils the secrets of ancient ruins and artifacts, reconstructing chronicles of civilizations long gone.\n\n*You dig up the past to save the future. You are fearless in the face of ancient traps and curses, driven by the need to uncover the truth buried beneath the dust of ages.*\n\n*\"It belongs in a museum! Or at least, in my cargo hold.\"*\n\n  - **Core Concept:** Explorer / Lore Expert / Trap Specialist\n  - **Recommended Occupations:** Scholar, Scout (*Explorer*).\n  - **Recommended Origins:** Research, Colony, Spacer.\n  - **Recommended Factions:** Alterian Enclave (Lore), Syndicate (Profit), Ascendancy (Research).\n  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Knowledge (History), Knowledge (Survival), Knowledge (Culture).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Excavation Expert, Artifact Analyst.\n  - **Tactical Role:** Navigate dungeons, identify magical/tech loot, bypass ancient defenses.",
    "full_text": "# The Relic Hunter\n\n\nUnveils the secrets of ancient ruins and artifacts, reconstructing chronicles of civilizations long gone.\n\n*You dig up the past to save the future. You are fearless in the face of ancient traps and curses, driven by the need to uncover the truth buried beneath the dust of ages.*\n\n*\"It belongs in a museum! Or at least, in my cargo hold.\"*\n\n  - **Core Concept:** Explorer / Lore Expert / Trap Specialist\n  - **Recommended Occupations:** Scholar, Scout (*Explorer*).\n  - **Recommended Origins:** Research, Colony, Spacer.\n  - **Recommended Factions:** Alterian Enclave (Lore), Syndicate (Profit), Ascendancy (Research).\n  - **Key Attributes:** Intellect (+3 Primary), Stamina (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Knowledge (History), Knowledge (Survival), Knowledge (Culture).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Excavation Expert, Artifact Analyst.\n  - **Tactical Role:** Navigate dungeons, identify magical/tech loot, bypass ancient defenses."
  },
  {
    "id": "archetype-roboticist",
    "name": "The Roboticist",
    "sphere": "Savants (The Rationals)",
    "summary": "A scholar who specializes in the study, design, and development of robots.",
    "flavor": "You breathe life into metal. You design and build the machines that serve, fight, and explore. You understand the artificial mind better than the organic one.",
    "quote": "\"It's not just a machine. It's a masterpiece.\"",
    "core_concept": "Crafter / Minion Master / Tech",
    "recommended_occupations": [
      "Engineer",
      "Scholar"
    ],
    "recommended_origins": [
      "Research",
      "Industrial",
      "Urban"
    ],
    "recommended_factions": [
      "Mekan (Self-Study)",
      "Syndicate (Drone Works)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Agility",
    "key_attributes": "Intellect (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Vocation (Engineer)",
      "Knowledge (Computers)"
    ],
    "signature_features": [
      "Robotic Affinity",
      "Automation Expert"
    ],
    "tactical_role": "Building/repairing drones, commanding robot minions, hacking enemy bots.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A scholar who specializes in the study, design, and development of robots.\n\n*You breathe life into metal. You design and build the machines that serve, fight, and explore. You understand the artificial mind better than the organic one.*\n\n_\"It's not just a machine. It's a masterpiece.\"_",
    "keywords": "roboticist, savant, rational, intellect, strategist, crafter, minion master",
    "negative_keywords": "fragile, unarmored, timid, evasive-sniper, mindless-brute",
    "signature_traits": [
      "Robotic Affinity",
      "Automation Expert"
    ],
    "traits": [
      "Robotic Affinity",
      "Automation Expert"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Roboticist\n\n\nA scholar who specializes in the study, design, and development of robots.\n\n*You breathe life into metal. You design and build the machines that serve, fight, and explore. You understand the artificial mind better than the organic one.*\n\n*\"It's not just a machine. It's a masterpiece.\"*\n\n  - **Core Concept:** Crafter / Minion Master / Tech\n  - **Recommended Occupations:** Builder (*Engineer*), Scholar.\n  - **Recommended Origins:** Research, Industrial, Urban.\n  - **Recommended Factions:** Mekan (Self-Study), Syndicate (Drone Works), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Engineer), Knowledge (Computers).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Robotic Affinity, Automation Expert.\n  - **Tactical Role:** Building/repairing drones, commanding robot minions, hacking enemy bots.",
    "full_text": "# The Roboticist\n\n\nA scholar who specializes in the study, design, and development of robots.\n\n*You breathe life into metal. You design and build the machines that serve, fight, and explore. You understand the artificial mind better than the organic one.*\n\n*\"It's not just a machine. It's a masterpiece.\"*\n\n  - **Core Concept:** Crafter / Minion Master / Tech\n  - **Recommended Occupations:** Builder (*Engineer*), Scholar.\n  - **Recommended Origins:** Research, Industrial, Urban.\n  - **Recommended Factions:** Mekan (Self-Study), Syndicate (Drone Works), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Intellect (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Engineer), Knowledge (Computers).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Robotic Affinity, Automation Expert.\n  - **Tactical Role:** Building/repairing drones, commanding robot minions, hacking enemy bots."
  },
  {
    "id": "archetype-strategist",
    "name": "The Strategist",
    "sphere": "Savants (The Rationals)",
    "summary": "A proficient analytical thinker adept at processing data and solving problems. They see the patterns others miss.",
    "flavor": "You are the logic engine. You take the chaotic noise of the world and distill it into actionable data. You find the needle in the haystack, the flaw in the plan, and the weakness in the armor.",
    "quote": "\"The probability of success increases by 40% if you stop screaming.\"",
    "core_concept": "Utility / Investigation / Puzzle Solver",
    "recommended_occupations": [
      "Scholar",
      "Specialist",
      "Agent"
    ],
    "recommended_origins": [
      "Research",
      "Urban",
      "Militaristic"
    ],
    "recommended_factions": [
      "Mekan (Logic Engines)",
      "Impyrium (Tacticians)",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Investigation)",
      "Insight",
      "Knowledge (Technology)",
      "Alertness"
    ],
    "signature_features": [
      "Enhanced Processing",
      "Logical Deduction"
    ],
    "tactical_role": "Identify enemy weaknesses, crack codes, reconstruct crime scenes.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A proficient analytical thinker adept at processing data and solving problems. They see the patterns others miss.\n\n*You are the logic engine. You take the chaotic noise of the world and distill it into actionable data. You find the needle in the haystack, the flaw in the plan, and the weakness in the armor.*\n\n_\"The probability of success increases by 40% if you stop screaming.\"_",
    "keywords": "strategist, savant, rational, intellect, utility, investigation, puzzle solver",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Enhanced Processing",
      "Logical Deduction"
    ],
    "traits": [
      "Enhanced Processing",
      "Logical Deduction"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Strategist\n\n\nA proficient analytical thinker adept at processing data and solving problems. They see the patterns others miss.\n\n*You are the logic engine. You take the chaotic noise of the world and distill it into actionable data. You find the needle in the haystack, the flaw in the plan, and the weakness in the armor.*\n\n*\"The probability of success increases by 40% if you stop screaming.\"*\n\n  - **Core Concept:** Utility / Investigation / Puzzle Solver\n  - **Recommended Occupations:** Scholar, Specialist, Agent.\n  - **Recommended Origins:** Research, Urban, Militaristic.\n  - **Recommended Factions:** Mekan (Logic Engines), Impyrium (Tacticians), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Insight, Knowledge (Technology), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Enhanced Processing, Logical Deduction.\n  - **Tactical Role:** Identify enemy weaknesses, crack codes, reconstruct crime scenes.",
    "full_text": "# The Strategist\n\n\nA proficient analytical thinker adept at processing data and solving problems. They see the patterns others miss.\n\n*You are the logic engine. You take the chaotic noise of the world and distill it into actionable data. You find the needle in the haystack, the flaw in the plan, and the weakness in the armor.*\n\n*\"The probability of success increases by 40% if you stop screaming.\"*\n\n  - **Core Concept:** Utility / Investigation / Puzzle Solver\n  - **Recommended Occupations:** Scholar, Specialist, Agent.\n  - **Recommended Origins:** Research, Urban, Militaristic.\n  - **Recommended Factions:** Mekan (Logic Engines), Impyrium (Tacticians), Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Investigation), Insight, Knowledge (Technology), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Enhanced Processing, Logical Deduction.\n  - **Tactical Role:** Identify enemy weaknesses, crack codes, reconstruct crime scenes."
  },
  {
    "id": "archetype-tactician",
    "name": "The Tactician",
    "sphere": "Savants (The Rationals)",
    "summary": "A strategic mastermind who analyzes the battlefield and coordinates actions.",
    "flavor": "You win the battle before it starts. You see the flow of combat, anticipating enemy moves and positioning your allies for maximum effect. You turn chaos into order.",
    "quote": "\"They are moving to flank. Suppress the left and advance on my signal.\"",
    "core_concept": "Leader / Support / Buffer",
    "recommended_occupations": [
      "Soldier",
      "Officer"
    ],
    "recommended_origins": [
      "Militaristic",
      "Urban",
      "Spacer"
    ],
    "recommended_factions": [
      "Impyrium (High Command)",
      "Dracon Dynasty",
      "Mekan (War Minds)"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Charisma",
    "key_attributes": "Intellect (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Knowledge (Tactics)",
      "Leadership",
      "Combat (Any)",
      "Insight"
    ],
    "signature_features": [
      "Battlefield Awareness",
      "Tactical Genius"
    ],
    "tactical_role": "Boosting ally initiative/attacks, countering enemy tactics, controlling the battlefield.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A strategic mastermind who analyzes the battlefield and coordinates actions.\n\n*You win the battle before it starts. You see the flow of combat, anticipating enemy moves and positioning your allies for maximum effect. You turn chaos into order.*\n\n_\"They are moving to flank. Suppress the left and advance on my signal.\"_",
    "keywords": "tactician, savant, rational, intellect, strategist, leader, support",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Battlefield Awareness",
      "Tactical Genius"
    ],
    "traits": [
      "Battlefield Awareness",
      "Tactical Genius"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Tactician\n\n\nA strategic mastermind who analyzes the battlefield and coordinates actions.\n\n*You win the battle before it starts. You see the flow of combat, anticipating enemy moves and positioning your allies for maximum effect. You turn chaos into order.*\n\n*\"They are moving to flank. Suppress the left and advance on my signal.\"*\n\n  - **Core Concept:** Leader / Support / Buffer\n  - **Recommended Occupations:** Soldier, Representative (*Officer*).\n  - **Recommended Origins:** Militaristic, Urban, Spacer.\n  - **Recommended Factions:** Impyrium (High Command), Dracon Dynasty, Mekan (War Minds).\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Tactics), Leadership, Combat (Any), Insight.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Battlefield Alertness, Tactical Genius.\n  - **Tactical Role:** Boosting ally initiative/attacks, countering enemy tactics, controlling the battlefield.",
    "full_text": "# The Tactician\n\n\nA strategic mastermind who analyzes the battlefield and coordinates actions.\n\n*You win the battle before it starts. You see the flow of combat, anticipating enemy moves and positioning your allies for maximum effect. You turn chaos into order.*\n\n*\"They are moving to flank. Suppress the left and advance on my signal.\"*\n\n  - **Core Concept:** Leader / Support / Buffer\n  - **Recommended Occupations:** Soldier, Representative (*Officer*).\n  - **Recommended Origins:** Militaristic, Urban, Spacer.\n  - **Recommended Factions:** Impyrium (High Command), Dracon Dynasty, Mekan (War Minds).\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Tactics), Leadership, Combat (Any), Insight.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Battlefield Alertness, Tactical Genius.\n  - **Tactical Role:** Boosting ally initiative/attacks, countering enemy tactics, controlling the battlefield."
  },
  {
    "id": "archetype-technician",
    "name": "The Technician",
    "sphere": "Savants (The Rationals)",
    "summary": "A skilled worker who maintains and repairs complex machinery.",
    "flavor": "You keep the lights on. You are the hands-on expert who keeps the complex systems of the future running. You fix the engines, the power grids, and the life support.",
    "quote": "\"It's a bypass of the bypass. It'll hold... probably.\"",
    "core_concept": "Support / Utility / Repair",
    "recommended_occupations": [
      "Builder",
      "Spacer"
    ],
    "recommended_origins": [
      "Industrial",
      "Spacer",
      "Colony"
    ],
    "recommended_factions": [
      "Outworlds (Mechanics)",
      "Coalition (Techs)",
      "Syndicate"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Agility",
    "key_attributes": "Intellect (Primary), Agility (Secondary).",
    "essential_skills": [
      "Knowledge (Technology)",
      "Vocation (Mechanic)",
      "Vocation (Electrician)",
      "Investigation"
    ],
    "signature_features": [
      "Technical Expertise",
      "Problem Solver"
    ],
    "tactical_role": "Rapid repair of gear/vehicles, bypassing locks/panels, technical support.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "A skilled worker who maintains and repairs complex machinery.\n\n*You keep the lights on. You are the hands-on expert who keeps the complex systems of the future running. You fix the engines, the power grids, and the life support.*\n\n_\"It's a bypass of the bypass. It'll hold... probably.\"_",
    "keywords": "technician, savant, rational, intellect, strategist, support, utility",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Technical Expertise",
      "Problem Solver"
    ],
    "traits": [
      "Technical Expertise",
      "Problem Solver"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Technician\n\n\nA skilled worker who maintains and repairs complex machinery.\n\n*You keep the lights on. You are the hands-on expert who keeps the complex systems of the future running. You fix the engines, the power grids, and the life support.*\n\n*\"It's a bypass of the bypass. It'll hold— probably.\"*\n\n  - **Core Concept:** Support / Utility / Repair\n  - **Recommended Occupations:** Builder, Spacer.\n  - **Recommended Origins:** Industrial, Spacer, Colony.\n  - **Recommended Factions:** Outworlds (Mechanics), Coalition (Techs), Syndicate.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Mechanic), Vocation (Electrician), Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Technical Expertise, Problem Solver.\n  - **Tactical Role:** Rapid repair of gear/vehicles, bypassing locks/panels, technical support.",
    "full_text": "# The Technician\n\n\nA skilled worker who maintains and repairs complex machinery.\n\n*You keep the lights on. You are the hands-on expert who keeps the complex systems of the future running. You fix the engines, the power grids, and the life support.*\n\n*\"It's a bypass of the bypass. It'll hold— probably.\"*\n\n  - **Core Concept:** Support / Utility / Repair\n  - **Recommended Occupations:** Builder, Spacer.\n  - **Recommended Origins:** Industrial, Spacer, Colony.\n  - **Recommended Factions:** Outworlds (Mechanics), Coalition (Techs), Syndicate.\n  - **Key Attributes:** Intellect (+3 Primary), Agility (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Technology), Vocation (Mechanic), Vocation (Electrician), Investigation.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Technical Expertise, Problem Solver.\n  - **Tactical Role:** Rapid repair of gear/vehicles, bypassing locks/panels, technical support."
  },
  {
    "id": "archetype-theoretician",
    "name": "The Theoretician",
    "sphere": "Savants (The Rationals)",
    "summary": "THE visionary scientist who pushes the boundaries of standard physics to unlock the secrets of the multiverse.",
    "flavor": "You explore the \"why\" behind the \"how.\" While others use Knowledge (Technology), you define the laws that make it possible. You see the universe as a series of equations waiting to be balanced.",
    "quote": "\"The math doesn't lie. It just tells truths we aren't ready to hear.\"",
    "core_concept": "Research / Utility / Lore",
    "recommended_occupations": [
      "Scholar",
      "Specialist"
    ],
    "recommended_origins": [
      "Research",
      "Enlightened",
      "Spacer"
    ],
    "recommended_factions": [
      "Mekan (Code Researchers)",
      "Ascendancy (Theorists)",
      "Alterian Enclave"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Academics",
      "Knowledge (Science \\- Physics)",
      "Knowledge (Technology)",
      "Knowledge (Science \\- Mathematics)"
    ],
    "signature_features": [
      "Logical Deduction",
      "Innovative Thinking"
    ],
    "tactical_role": "Solving complex puzzles, predicting dimensional anomalies, theoretical tech analysis.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "THE visionary scientist who pushes the boundaries of standard physics to unlock the secrets of the multiverse.\n\n*You explore the \"why\" behind the \"how.\" While others use Knowledge (Technology), you define the laws that make it possible. You see the universe as a series of equations waiting to be balanced.*\n\n_\"The math doesn't lie. It just tells truths we aren't ready to hear.\"_",
    "keywords": "theoretician, savant, rational, intellect, strategist, research, utility",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Logical Deduction",
      "Innovative Thinking"
    ],
    "traits": [
      "Logical Deduction",
      "Innovative Thinking"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Theoretician\n\n\nTHE visionary scientist who pushes the boundaries of standard physics to unlock the secrets of the multiverse.\n\n*You explore the \"why\" behind the \"how.\" While others use Knowledge (Technology), you define the laws that make it possible. You see the universe as a series of equations waiting to be balanced.*\n\n*\"The math doesn't lie. It just tells truths we aren't ready to hear.\"*\n\n  - **Core Concept:** Research / Utility / Lore\n  - **Recommended Occupations:** Scholar, Specialist.\n  - **Recommended Origins:** Research, Enlightened, Spacer.\n  - **Recommended Factions:** Mekan (Code Researchers), Ascendancy (Theorists), Alterian Enclave.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Science - Physics), Knowledge (Technology), Knowledge (Science - Mathematics).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Logical Deduction, Innovative Thinking.\n  - **Tactical Role:** Solving complex puzzles, predicting dimensional anomalies, theoretical tech analysis.",
    "full_text": "# The Theoretician\n\n\nTHE visionary scientist who pushes the boundaries of standard physics to unlock the secrets of the multiverse.\n\n*You explore the \"why\" behind the \"how.\" While others use Knowledge (Technology), you define the laws that make it possible. You see the universe as a series of equations waiting to be balanced.*\n\n*\"The math doesn't lie. It just tells truths we aren't ready to hear.\"*\n\n  - **Core Concept:** Research / Utility / Lore\n  - **Recommended Occupations:** Scholar, Specialist.\n  - **Recommended Origins:** Research, Enlightened, Spacer.\n  - **Recommended Factions:** Mekan (Code Researchers), Ascendancy (Theorists), Alterian Enclave.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Academics, Knowledge (Science - Physics), Knowledge (Technology), Knowledge (Science - Mathematics).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Logical Deduction, Innovative Thinking.\n  - **Tactical Role:** Solving complex puzzles, predicting dimensional anomalies, theoretical tech analysis."
  },
  {
    "id": "archetype-xeno-surveyor",
    "name": "The Xeno-surveyor",
    "sphere": "Savants (The Rationals)",
    "summary": "The meticulous researcher who maps the biological and geological variables of alien worlds to assess their value and danger.",
    "flavor": "You read the planet's history in its soil and its future in its atmosphere. You are the vanguard of colonization, ensuring that those who follow know exactly what they are walking into.",
    "quote": "\"This world has potential. And at least three ways to kill you by sunset.\"",
    "core_concept": "Exploration / Science / Survival",
    "recommended_occupations": [
      "Scout",
      "Scholar"
    ],
    "recommended_origins": [
      "Colony",
      "Spacer",
      "Research"
    ],
    "recommended_factions": [
      "Ascendancy (Reach Surveyors)",
      "Outworlds",
      "Auluran"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Intellect (Primary), Wisdom (Secondary).",
    "essential_skills": [
      "Knowledge (Survival)",
      "Navigation",
      "Knowledge (Nature)",
      "Alertness"
    ],
    "signature_features": [
      "Cartographer",
      "Planetary Savant"
    ],
    "tactical_role": "Identifying environmental resources, plotting safe paths, planetary analysis.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The meticulous researcher who maps the biological and geological variables of alien worlds to assess their value and danger.\n\n*You read the planet's history in its soil and its future in its atmosphere. You are the vanguard of colonization, ensuring that those who follow know exactly what they are walking into.*\n\n_\"This world has potential. And at least three ways to kill you by sunset.\"_",
    "keywords": "xeno-surveyor, savant, rational, intellect, strategist, exploration, science",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Cartographer",
      "Planetary Savant"
    ],
    "traits": [
      "Cartographer",
      "Planetary Savant"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Xeno-Surveyor\n\n\nThe meticulous researcher who maps the biological and geological variables of alien worlds to assess their value and danger.\n\n*You read the planet's history in its soil and its future in its atmosphere. You are the vanguard of colonization, ensuring that those who follow know exactly what they are walking into.*\n\n*\"This world has potential. And at least three ways to kill you by sunset.\"*\n\n  - **Core Concept:** Exploration / Science / Survival\n  - **Recommended Occupations:** Scout, Scholar.\n  - **Recommended Origins:** Colony, Spacer, Research.\n  - **Recommended Factions:** Ascendancy (Reach Surveyors), Outworlds, Auluran.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Navigation, Knowledge (Geology), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cartographer, Planetary Savant.\n  - **Tactical Role:** Identifying environmental resources, plotting safe paths, planetary analysis.\n\n  \n**  \n**",
    "full_text": "# The Xeno-Surveyor\n\n\nThe meticulous researcher who maps the biological and geological variables of alien worlds to assess their value and danger.\n\n*You read the planet's history in its soil and its future in its atmosphere. You are the vanguard of colonization, ensuring that those who follow know exactly what they are walking into.*\n\n*\"This world has potential. And at least three ways to kill you by sunset.\"*\n\n  - **Core Concept:** Exploration / Science / Survival\n  - **Recommended Occupations:** Scout, Scholar.\n  - **Recommended Origins:** Colony, Spacer, Research.\n  - **Recommended Factions:** Ascendancy (Reach Surveyors), Outworlds, Auluran.\n  - **Key Attributes:** Intellect (+3 Primary), Wisdom (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Survival), Navigation, Knowledge (Geology), Alertness.\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cartographer, Planetary Savant.\n  - **Tactical Role:** Identifying environmental resources, plotting safe paths, planetary analysis.\n\n  \n**  \n**"
  },
  {
    "id": "archetype-xenologist",
    "name": "The Xenologist",
    "sphere": "Savants (The Rationals)",
    "summary": "An expert in alien cultures, biology, and languages.",
    "flavor": "You bridge the gap between worlds. You understand the strange and the alien, decoding their languages and customs to foster understanding or gain an advantage.",
    "quote": "\"They aren't monsters. They're just... different.\"",
    "core_concept": "Face / Knowledge / Science",
    "recommended_occupations": [
      "Scholar",
      "Diplomat"
    ],
    "recommended_origins": [
      "Research",
      "Spacer",
      "Enlightened"
    ],
    "recommended_factions": [
      "Entari Combine (First Contact)",
      "Alterian Enclave",
      "Ascendancy"
    ],
    "primary_attribute": "Intellect",
    "secondary_attribute": "Charisma",
    "key_attributes": "Intellect (Primary), Charisma (Secondary).",
    "essential_skills": [
      "Knowledge (Culture)",
      "Diplomacy",
      "Insight",
      "Language"
    ],
    "signature_features": [
      "Cultural Sensitivity",
      "Xeno-Linguist"
    ],
    "tactical_role": "Communicating with aliens, identifying xeno-threats, cultural navigation.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "An expert in alien cultures, biology, and languages.\n\n*You bridge the gap between worlds. You understand the strange and the alien, decoding their languages and customs to foster understanding or gain an advantage.*\n\n_\"They aren't monsters. They're just... different.\"_",
    "keywords": "xenologist, savant, rational, intellect, strategist, face, knowledge",
    "negative_keywords": "mindless-brute, reckless, illiterate",
    "signature_traits": [
      "Cultural Sensitivity",
      "Xeno-Linguist"
    ],
    "traits": [
      "Cultural Sensitivity",
      "Xeno-Linguist"
    ],
    "costs": {
      "cp": 80,
      "bp": 80
    },
    "modifiers": [],
    "cp_chassis": 80,
    "body": "# The Xenologist\n\n\nAn expert in alien cultures, biology, and languages.\n\n*You bridge the gap between worlds. You understand the strange and the alien, decoding their languages and customs to foster understanding or gain an advantage.*\n\n*\"They aren't monsters. They're just— different.\"*\n\n  - **Core Concept:** Face / Knowledge / Science\n  - **Recommended Occupations:** Scholar, Representative (*Diplomat*).\n  - **Recommended Origins:** Research, Spacer, Enlightened.\n  - **Recommended Factions:** Entari Combine (First Contact), Alterian Enclave, Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Xenology), Diplomacy, Insight, Knowledge (Language).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cultural Sensitivity, Xeno-Linguist.\n  - **Tactical Role:** Communicating with aliens, identifying xeno-threats, cultural navigation.",
    "full_text": "# The Xenologist\n\n\nAn expert in alien cultures, biology, and languages.\n\n*You bridge the gap between worlds. You understand the strange and the alien, decoding their languages and customs to foster understanding or gain an advantage.*\n\n*\"They aren't monsters. They're just— different.\"*\n\n  - **Core Concept:** Face / Knowledge / Science\n  - **Recommended Occupations:** Scholar, Representative (*Diplomat*).\n  - **Recommended Origins:** Research, Spacer, Enlightened.\n  - **Recommended Factions:** Entari Combine (First Contact), Alterian Enclave, Ascendancy.\n  - **Key Attributes:** Intellect (+3 Primary), Charisma (+2 Secondary).\n  - **Essential Skills (Rank 6 — 24 CP + 6 Supporting Skills at Rank 3 — 18 CP):** Knowledge (Xenology), Diplomacy, Insight, Knowledge (Language).\n  - **Signature Traits (1 CP each) & Core Signature Features (2 CP Recommended):** Cultural Sensitivity, Xeno-Linguist.\n  - **Tactical Role:** Communicating with aliens, identifying xeno-threats, cultural navigation."
  }
];

export const CANONICAL_SPHERES = [
  {
    "id": "sentinels",
    "name": "Sentinels (The Stabilizers)",
    "keywords": [
      "sentinel",
      "stabilizer"
    ]
  },
  {
    "id": "operatives",
    "name": "Operatives (The Artisans)",
    "keywords": [
      "operative",
      "artisan"
    ]
  },
  {
    "id": "visionaries",
    "name": "Visionaries (The Idealists)",
    "keywords": [
      "visionar",
      "idealist"
    ]
  },
  {
    "id": "savants",
    "name": "Savants (The Rationals)",
    "keywords": [
      "savant",
      "rational"
    ]
  }
];

export const getGroupedArchetypes = (archetypesList = DEFAULT_ARCHETYPES) => {
  const list = (Array.isArray(archetypesList) && archetypesList.length > 0) ? archetypesList : DEFAULT_ARCHETYPES;
  const groups = {
    'Sentinels (The Stabilizers)': [],
    'Operatives (The Artisans)': [],
    'Visionaries (The Idealists)': [],
    'Savants (The Rationals)': []
  };
  const otherGroup = [];

  list.forEach(arch => {
    const rawSphere = (arch.sphere || arch.category || '').toLowerCase();
    const matched = CANONICAL_SPHERES.find(s => s.keywords.some(k => rawSphere.includes(k)));
    if (matched) {
      groups[matched.name].push(arch);
    } else {
      otherGroup.push(arch);
    }
  });

  Object.keys(groups).forEach(sphereName => {
    groups[sphereName].sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
  });
  otherGroup.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));

  const result = Object.entries(groups).filter(([_, items]) => items.length > 0);
  if (otherGroup.length > 0) {
    result.push(['Other Archetypes', otherGroup]);
  }
  return result;
};
