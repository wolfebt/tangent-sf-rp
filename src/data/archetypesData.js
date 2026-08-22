/**
 * Canonical 100 Archetypes for Tangent Science Fantasy Roleplaying Game (SFF RPG)
 * Sourced from docs/plans/OMNICORTEX/1.02 ARCHETYPES.md
 * Chassis Allocation Formula: 80 BP (+3 Primary, +2 Secondary, 4 Trained + 6 Novice skills, Signature Features)
 */

export const ARCHETYPE_SPHERES = [
  {
    id: 'sentinels',
    name: 'Sentinels (The Stabilizers)',
    focus: 'Logistics, Protection, Tradition, and Economy',
    description: 'Sentinels are the foundation. They ensure the group survives, supplies are managed, and the line is held. They are the defenders, the providers, and the heavy infantry.'
  },
  {
    id: 'operatives',
    name: 'Operatives (The Artisans)',
    focus: 'Action, Adaptability, Performance, and Risk',
    description: 'Operatives are the doers. They thrive on adrenaline, skill mastery, and manipulating the physical world. They are the rogues, pilots, and entertainers.'
  },
  {
    id: 'visionaries',
    name: 'Visionaries (The Idealists)',
    focus: 'Identity, Meaning, Connection, and Influence',
    description: 'Visionaries are the soul of the party. They focus on the big picture, social harmony, and the metaphysical connection between beings. They are the leaders, the diplomats, and the mystics.'
  },
  {
    id: 'savants',
    name: 'Savants (The Rationals)',
    focus: 'Competence, Knowledge, Systems, and Strategy',
    description: 'Savants are the brains of the operation. They solve puzzles, build tech, plan heists, and wield magic as a science.'
  }
];

export const ARCHETYPE_SCALING_RULES = {
  tier1: {
    title: 'NPC Tier 1 (Novice / Minion)',
    health: 25,
    vitality: 25,
    attackRoll: 'd20 + 3 (Primary Attribute)',
    defense: '11 + Secondary Attribute',
    derivedSaves: '+2',
    signatureFeatures: '1 basic feature passive effect only.'
  },
  tier2: {
    title: 'NPC Tier 2 (Veteran / Professional)',
    health: 50,
    vitality: 50,
    attackRoll: 'd20 + 5 (Primary Attribute + 2)',
    defense: '13 + Secondary Attribute',
    derivedSaves: '+4',
    signatureFeatures: '1 active feature, used once per combat.'
  },
  tier3: {
    title: 'NPC Tier 3 (Master / Boss)',
    health: 100,
    vitality: 100,
    attackRoll: 'd20 + 8 (Primary Attribute + 5)',
    defense: '15 + Secondary Attribute',
    derivedSaves: '+7',
    signatureFeatures: '2 features, fully active.'
  },
  tier4: {
    title: 'NPC Tier 4 (Pinnacle / Legendary)',
    health: 200,
    vitality: 200,
    attackRoll: 'd20 + 12 (Primary Attribute + 8)',
    defense: '18 + Secondary Attribute',
    derivedSaves: '+10',
    signatureFeatures: '3 features, fully active, can spend 1 action to recharge.'
  }
};

export const DEFAULT_ARCHETYPES = [
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
    "description": "The skilled administrator who ensures the smooth operation of departments or territories. They navigate red tape like a labyrinth runner.\n\n*You are the grease in the gears of civilization. While others fight with guns or magic, you fight with logistics, ensuring the team has funding, permits, and a safe harbor. Without you, they are just vagrants; with you, they are an organization.*\n\n_\"Amateurs talk strategy. Professionals talk logistics. Now sign here.\"_"
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
    "secondary_attribute": "Strength or Agility",
    "key_attributes": "Wisdom (Primary), Strength or Agility (Secondary).",
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
    "description": "A protector of forests and natural habitats, skilled in both magic and combat to defend the wild.\n\n*You are the immunity of the living world. You stand between the encroaching machine and the sacred grove, wielding the raw power of nature to crush those who would despoil it. You don't just fight for a cause; you fight for existence itself.*\n\n_\"The forest is not empty. It is merely holding its breath.\"_"
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
    "description": "Focuses on the trade of weapons and military equipment. They have access to cutting-edge technology and sell it at a premium.\n\n*You understand that peace is expensive, but war is profitable. You are the ultimate enabler, providing the tools of destruction that topple regimes. You are never outgunned because you supply the guns.*\n\n_\"I don't pull the trigger. I just ensure it works when you do.\"_"
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
    "primary_attribute": "Constitution",
    "secondary_attribute": "Perception",
    "key_attributes": "Constitution (Primary), Perception (Secondary).",
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
    "description": "Protects high-profile individuals or cargo. Experienced in personal security and close-quarters combat.\n\n*You are the wall that refuses to break. Your job isn't to kill the enemy; it's to make sure your charge survives to see tomorrow. In a universe of assassins and snipers, your vigilance is the only thing keeping the mission alive.*\n\n_\"Get behind me.\"_"
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
    "description": "Provides emergency medical care under fire. Proficient in both combat and medicine.\n\n*You hold the line between life and death. When the armor fails and the screaming starts, you are the calm in the chaos. You possess the steady hands to stitch a wound while dodging plasma fire.*\n\n_\"I decide who walks away from this. Don't make me regret choosing you.\"_"
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
    "description": "Represents the company's interests, securing deals and resolving disputes. Backed by corporate resources.\n\n*You are the avatar of the megacorp. You walk into rooms and buy the building. You wield wealth and legal precedent like a cudgel, ensuring that no matter who wins the fight, your side wins the profit.*\n\n_\"My client is willing to offer a generous settlement. I suggest you take it before my security team settles it for you.\"_"
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
    "description": "Expert in operating heavy weaponry like machine guns and rocket launchers. Provides overwhelming firepower.\n\n*You believe there is no problem that cannot be solved by the proper application of high explosives. You control the battlefield through sheer volume of fire, turning cover into concealment and enemies into memories.*\n\n_\"Suppressive fire? No, I'm just clearing the room.\"_"
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
    "description": "Disciplined soldier serving on navy vessels. Expert in boarding actions and zero-g combat.\n\n*You fight where others freeze. Vacuum, zero-g, tight corridors—this is your home. You are the tip of the spear in ship-to-ship actions, breaching hulls and taking bridges while the universe tries to kill you.*\n\n_\"Gravity is a crutch. Mag-lock and load.\"_"
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
    "description": "Travels space lanes buying and selling. Keen eye for value and negotiation.\n\n*You keep the galaxy moving. You know the value of everything, from a crate of ore to a secret. You turn risks into rewards, navigating trade routes and social circles to ensure your crew always turns a profit.*\n\n_\"Everything is negotiable. Even loyalty.\"_"
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
    "primary_attribute": "Strength or Agility",
    "secondary_attribute": "Constitution",
    "key_attributes": "Strength or Agility (Primary), Constitution (Secondary).",
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
    "description": "Brave and disciplined, skilled in combat and tactics. The backbone of any fighting force.\n\n*You are the professional. You don't fight for glory or gold, but for the mission and the person next to you. You bring discipline, tactics, and unwavering resolve to a chaotic universe.*\n\n_\"Check your corners. Stay sharp. We move on my mark.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Charisma (Primary), Constitution (Secondary).",
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
    "description": "A stern and authoritative leader who oversees the workforce and ensures that production targets are met.\n\n*You are the iron fist of industry. You manage personnel and resources with ruthless efficiency, ensuring the job gets done regardless of the obstacles. Your word is law on the factory floor.*\n\n_\"The schedule is not a suggestion. Get back to work.\"_"
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
    "primary_attribute": "Constitution",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Constitution (Primary), Wisdom (Secondary).",
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
    "description": "A hardworking and resourceful individual determined to build a life on the frontier.\n\n*You tame the land. You don't need a replicator or a supermarket; you build what you need from the dirt up. You are the foundation upon which colonies are built, enduring where others would starve.*\n\n_\"This land is hard, but I am harder.\"_"
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
    "primary_attribute": "Constitution",
    "secondary_attribute": "Strength",
    "key_attributes": "Constitution (Primary), Strength (Secondary).",
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
    "description": "A disciplined and loyal soldier who serves in the Impyrium's legions. Expert in formation warfare.\n\n*You are a brick in the wall of the Empire. You fight not as an individual, but as a unit, locking shields and advancing with the inexorable weight of history behind you.*\n\n_\"Strength in unity. Victory in discipline.\"_"
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
    "description": "A law enforcement officer who maintains order and protects settlements in the lawless territories.\n\n*You are the law where there is no law. You carry authority in your bearing and justice in your holster. You stand between the town and the chaos, enforcing order through reputation and resolve.*\n\n_\"The law doesn't stop at the city limits. It stops where I say it stops.\"_"
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
    "description": "A resourceful individual who manages supplies, equipment, and finances.\n\n*You make sure the guns have ammo and the engines have fuel. You are the master of inventory, finding value in scrap and ensuring the team is never caught empty-handed.*\n\n_\"A soldier without bullets is just a target. I make sure you aren't targets.\"_"
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
    "secondary_attribute": "Perception",
    "key_attributes": "Wisdom (Primary), Perception (Secondary).",
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
    "description": "A vigilant and disciplined individual who ensures the safety and security of their post.\n\n*You see what others miss. While they relax, you watch the exits. You are the first line of defense against infiltration and sabotage, securing the perimeter with professional detachment.*\n\n_\"Secure. For now.\"_"
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
    "primary_attribute": "Constitution",
    "secondary_attribute": "Strength",
    "key_attributes": "Constitution (Primary), Strength (Secondary).",
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
    "description": "A hardy individual who builds and maintains settlements in untamed worlds.\n\n*You turn wilderness into home. You are skilled in the practical arts of construction and defense, creating safe havens in the most hostile environments.*\n\n_\"We built this town with our own hands. We'll defend it the same way.\"_"
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
    "description": "A seasoned starship captain who commands a vessel and crew with expertise in trade and safety.\n\n*You are the master of the trade lanes. You navigate the complex web of commerce and law, ensuring your ship and cargo arrive intact and on time. You are a steady hand on the tiller of enterprise.*\n\n_\"Time is money, and we are ahead of schedule.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Strength (Primary), Constitution (Secondary).",
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
    "description": "A hardworking individual contributing through physical labor and endurance.\n\n*You are the strength that builds empires. You lift, carry, and endure. When machines fail or finesse is not enough, you provide the raw power to move the world.*\n\n_\"Heavy lifting? That's just a warm-up.\"_"
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
    "description": "A high-ranking military commander who leads legions into battle.\n\n*You are the architect of victory. You see the battlefield as a chessboard, moving units with precision and foresight. Your presence inspires discipline and courage in the face of overwhelming odds.*\n\n_\"Victory is not an accident. It is engineered.\"_"
  },
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
    "description": "The specialist who crafts and maintains the protective shells that preserve life in high-threat zones.\n\n*You provide the safety that makes heroism possible. You know every weak point in a chest plate and every bypass in a shield generator. Without your craft, the team is just target practice.*\n\n_\"Flesh is soft. Let me give you something harder.\"_"
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
    "description": "The essential provider of nutrition and morale, transforming scarce resources into sustaining banquets.\n\n*You are the heart of the camp. You understand that a soldier fights on their stomach and a diplomat speaks with their palate. You can find sustenance on a dead moon and hope in a warm meal.*\n\n_\"A good meal can stop a war. A bad one can start it.\"_"
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
    "description": "The officer of the court and enforcer of civil law, ensuring that order is maintained within the halls of justice.\n\n*You are the shadow of the judge. You maintain the dignity of the law through physical presence and unwavering authority. You ensure that even the most chaotic elements respect the proceedings.*\n\n_\"The Court will have order. One way or another.\"_"
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
    "description": "The veteran technician who keeps massive infrastructure systems online under impossible conditions.\n\n*You are the caretaker of the megastructure. You know the vibrations of the gravity core and the scent of a failing oxygen scrubber. You speak the language of the machine and it answers.*\n\n_\"She's a bit cranky today, but I've got her settled.\"_"
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
    "description": "The rugged specialist who trains and directs animals and xeno-fauna for work and war.\n\n*You understand the wild mind. You forge bonds with creatures that others view as monsters, turning their primal instincts into tactical assets. Your pack is your family and your weapon.*\n\n_\"They aren't pets. They're partners.\"_"
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
    "description": "The master of the dramatic arts, captivating audiences with powerful performances.\n\n*You can be anyone. To the guard, you are a general; to the noble, a lost heir. You wield identity as a tool, slipping into social circles and extracting secrets before the curtain falls.*\n\n_\"All the world's a stage, and I am the only one who knows the script.\"_"
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
    "secondary_attribute": "Perception",
    "key_attributes": "Agility (Primary), Perception (Secondary).",
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
    "description": "A professional killer taking contracts to eliminate specific targets via long-range sniping or close-quarters execution.\n\n*You are the surgeon of warfare. You don't fight battles; you end them. With a single shot or a blade in the dark, you remove the pieces that hold the enemy together.*\n\n_\"One shot. One clean timeline.\"_"
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
    "description": "Uses tracking and combat skills to pursue criminals for a reward. Skilled in investigation and apprehension.\n\n*You always get your mark. No moon is distant enough, no hole deep enough. You combine the skills of a detective with the grit of a soldier, pursuing targets that others fear to name.*\n\n_\"I can bring you in warm, or I can bring you in cold.\"_"
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
    "description": "Uses charm and bluff to swindle and exploit others for personal gain.\n\n*You exploit the bugs in human nature. You see greed, pride, and fear as levers to be pulled. You can walk into a fortress with nothing but a smile and walk out with the keys.*\n\n_\"Trust me. I'm exactly who you want me to be.\"_"
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
    "secondary_attribute": "Technology",
    "key_attributes": "Agility (Primary), Technology (Secondary).",
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
    "description": "Equipped with advanced enhancements to blend in and infiltrate high-security areas. Hack, cloak, and kill.\n\n*You are the ghost in the machine. Your body is a weapon, upgraded for speed and stealth. You bypass laser grids and hack turrets before the enemy even knows their perimeter is breached.*\n\n_\"Security offline. Target acquired. Exfiltrating now.\"_"
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
    "primary_attribute": "Constitution",
    "secondary_attribute": "Wisdom",
    "key_attributes": "Constitution (Primary), Wisdom (Secondary).",
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
    "description": "Travels from place to place without a fixed home. Characterized by freedom, adaptability, and adventure.\n\n*You are the ultimate survivor. You have no home, but you have a skill for every situation. You fix what's broken, find what's lost, and disappear before the trouble starts.*\n\n_\"I've been everywhere, man. And I know the quickest way out of here.\"_"
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
    "description": "Captivates audiences with skills in music, dance, or acting. Thrives in the spotlight.\n\n*You control the mood of the room. You can turn a hostile crowd into a cheering mob or distract a guard with a song. Your art is your weapon, and fame is your shield.*\n\n_\"Eyes on me, everyone. You won't want to miss this.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Wisdom (Primary), Constitution (Secondary).",
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
    "description": "Charts new territories and uncovers the mysteries of the universe. Thirsts for discovery.\n\n*You go where the maps end. You are driven by the need to see the unseen and name the unnamed. You navigate the hazards of alien worlds so that others may follow in your footsteps.*\n\n_\"Second star to the right, and straight on 'til morning.\"_"
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
    "description": "Navigates starships through asteroids and blockades. Master of the stick.\n\n*You are the god of velocity. On the ground, you're just another grunt, but behind a yoke, you are untouchable. You weave through debris fields and dogfights with a grin, delivering the team exactly where they need to be.*\n\n_\"Hold on back there. I'm gonna try something stupid.\"_"
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
      "Knowledge (Geography)"
    ],
    "signature_features": [
      "Pathfinder",
      "Keen Observer"
    ],
    "tactical_role": "Reconnaissance, initiating ambushes, guiding the party.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Ventures into the unknown, charting territories and assessing threats.\n\n*You are the eyes of the operation. You move ahead, unseen and unheard, painting targets and identifying traps. Knowledge is power, and you ensure your team always has the advantage of knowing what's coming.*\n\n_\"Three guards, two turrets, and a back door they forgot to lock. Easy.\"_"
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
    "description": "A performer specializing in agility and stunts, often in zero-gravity.\n\n*You laugh at gravity. You move in ways that should be impossible, turning the battlefield into your stage. Whether swinging from rigging or dodging laser fire, your grace is your defense.*\n\n_\"Catch me if you can.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Agility (Primary), Constitution (Secondary).",
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
    "description": "Excels in extreme sports and high-risk maneuvers.\n\n*You live for the rush. The higher the risk, the better the performance. You take leaps of faith that others would call suicide, relying on skill and sheer nerve to survive.*\n\n_\"It's not a fall; it's a very fast descent with style.\"_"
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
    "description": "A skilled agent who carries out dirty work. Expert in infiltration and sabotage.\n\n*You are the shadow in the corner. You slip past defenses, disable systems, and extract targets without leaving a trace. You are the tool that fixes problems quietly.*\n\n_\"I was never here.\"_"
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
    "description": "A skilled starship captain who operates independently on behalf of a faction.\n\n*You are a pirate with a badge. You hunt the enemies of the state for profit, blending the freedom of the outlaw with the legitimacy of the law.*\n\n_\"It's not piracy if you have a permit.\"_"
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
    "secondary_attribute": "Technology",
    "key_attributes": "Agility (Primary), Technology (Secondary).",
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
    "description": "Skilled in piloting high-speed vehicles in competitive or dangerous environments.\n\n*You are the fastest thing alive. You push machines past their breaking point, threading the needle at supersonic speeds. Victory is measured in milliseconds.*\n\n_\"If you aren't first, you're last.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Strength (Primary), Constitution (Secondary).",
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
    "description": "A hardened survivor who uses force to secure resources.\n\n*You take what you need. In the lawless wastes, strength is the only currency. You strike hard and fast, seizing resources before the dust settles.*\n\n_\"Weakness is a choice. I chose strength.\"_"
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
    "description": "A skilled operative who infiltrates to destroy or disrupt.\n\n*You break things. Not randomly, but surgically. You know exactly where to place the charge or cut the wire to bring the whole system crashing down.*\n\n_\"A little chaos goes a long way.\"_"
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
    "secondary_attribute": "Technology",
    "key_attributes": "Intellect (Primary), Technology (Secondary).",
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
    "description": "A master of cyberspace, skilled in infiltrating networks and stealing data.\n\n*You are the knife in the digital dark. You carve through firewalls and dissect data streams, extracting the secrets that power empires.*\n\n_\"Information wants to be free. I'm just the liberator.\"_"
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
    "description": "Specializes in transporting illegal goods across borders.\n\n*You move the unmovable. You know the secret routes and the bribe-friendly guards. You deliver the goods, no questions asked, right under the noses of authority.*\n\n_\"I run a clean ship. Mostly.\"_"
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
    "description": "A skilled combatant who excels in boarding actions and close-quarters flair.\n\n*You fight with panache. You treat combat as a dance, outmaneuvering foes with wit and blade. You are the hero of your own story, and you make sure everyone knows it.*\n\n_\"En garde! Try not to bore me.\"_"
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
    "secondary_attribute": "Perception",
    "key_attributes": "Agility (Primary), Perception (Secondary).",
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
    "description": "The gunslinger of the future, whose survival depends on being the first to fire in any confrontation.\n\n*You are the fastest hand in the sector. You live in the split second between intent and action, drawing and firing before the enemy can even process the threat. You don't start the fight, but you always end it.*\n\n_\"I already pulled the trigger. You just haven't fallen yet.\"_"
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
    "description": "The high-risk recovery expert who ventures into derelict hulls and unstable ruins to pull riches from the wreckage.\n\n*You find treasure in trash. You know that the most valuable tech is often buried under tons of radioactive scrap or hidden in the heart of a failing starbase. You are the scavenger-king of the void.*\n\n_\"One man's debris is my next month's salary.\"_"
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
    "description": "A master of optical camouflage and tactical misdirection who treats reality as an obstacle to be bypassed.\n\n*You aren't there. Even when they look right at you, their eyes slide away. You move through fortified lines like a ghost, leaving nothing behind but an empty vault or a neutralized leader.*\n\n_\"Did you hear that? Probably just the wind.\"_"
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
    "description": "The master of extraction and evasion who specializes in getting out of \"impossible\" situations.\n\n*You are the loose thread. No cage can hold you, and no perimeter is absolute. You turn the enemy's own protocols into your exit strategy, proving that the best defense is simply not being there when the hammer falls.*\n\n_\"I'm not trapped in here with you. I'm already halfway to the hangar.\"_"
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
    "description": "The frontline demolitionist who uses chaos and high explosives to restructure the battlefield in real-time.\n\n*You are the architect of rubble. You don't just clear rooms; you remove them from the blueprint. You use the environment as a weapon, turning the enemy's cover into their coffin.*\n\n_\"Plan A involves explosives. Plan B is more explosives.\"_"
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
    "description": "A passionate individual who fights for social justice and equality. They utilize their voice to raise awareness and effect change.\n\n*You are the conscience of the galaxy. You speak for the voiceless and stand against the corrupt. Your power comes not from weapons, but from the unshakeable belief that things can be better.*\n\n_\"We do not beg for freedom. We demand it.\"_"
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
    "description": "A skilled propagandist who spreads dissent and undermines authority through persuasive speeches and subversive media.\n\n*You are the spark that starts the fire. You know that information is a virus, and you infect the masses with ideas that topple empires. You turn the enemy's own populace against them.*\n\n_\"The truth is whatever I say it is loud enough.\"_"
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
    "description": "An adept negotiator entrusted with representing their faction. They navigate diplomatic channels to ensure peace.\n\n*You hold the weight of nations. You navigate the complex web of galactic politics, turning potential wars into alliances with a handshake. You ensure your team has friends in high places.*\n\n_\"A treaty is just a pause between wars. Let's make it a long one.\"_"
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
    "description": "A charismatic and cunning leader who commands a starship, charting courses and leading crew in dangerous adventures.\n\n*You are the one they look to when the alarms scream. You make the hard calls, hold the crew together, and steer the ship through the storm. You are the undisputed master of your vessel.*\n\n_\"On my deck, my word is law. Prepare for hard burn.\"_"
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
    "description": "Leader of a criminal organization, overseeing illegal activities and managing a network of underlings.\n\n*You built an empire from the gutter. You command loyalty through fear and respect, leveraging a network of criminals to get things done. You don't ask for permission; you take what is yours.*\n\n_\"It's just business. But for you, it's personal.\"_"
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
    "description": "Roots out heresy and dissent. Skilled in interrogation and intimidation to enforce dogma.\n\n*You are the purity of the cause. You see the corruption that hides in the hearts of men and burn it out. You are feared not for your strength, but for your absolute, terrifying certainty.*\n\n_\"Innocence proves nothing.\"_"
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
    "secondary_attribute": "History",
    "key_attributes": "Charisma (Primary), History (Secondary).",
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
    "description": "A member of the aristocracy, born into a position of privilege and power. They wield status as a weapon.\n\n*You were born to rule. Your name opens doors that are locked to commoners, and your wealth solves problems before they begin. You navigate the deadly game of courts and kings with practiced ease.*\n\n_\"Do you know who I am? That was a rhetorical question.\"_"
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
    "description": "Charismatic figure who navigates the political landscape, builds alliances, and sways public opinion.\n\n*You play the great game. You know that laws are just suggestions and power is just perception. You manipulate the system to serve your ends, ensuring that public opinion is always on your side.*\n\n_\"I don't need a weapon. I have a mandate.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Wisdom (Primary), Constitution (Secondary).",
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
    "description": "Possesses innate mental powers or spiritual connection. Seers, telepaths, and prophets.\n\n*You see the strings of the universe. While others rely on their eyes, you sense the thoughts, the futures, and the connections that bind all things. You are the guide to the unseen.*\n\n_\"Your thoughts are so... loud.\"_"
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
    "description": "Weaver of words and tales, captivating audiences with immersive narratives and transporting them to fantastical realms.\n\n*You keep the history alive. You know that a story can inspire a revolution or calm a beast. You carry the memory of your people, ensuring that their deeds—and your team's deeds—are never forgotten.*\n\n_\"Let me tell you how this ends.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Wisdom (Primary), Constitution (Secondary).",
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
    "description": "A devout individual dedicated to prayer and meditation, seeking enlightenment.\n\n*You have mastered the self. While others seek power in the world, you find it within. Your mind is a fortress, and your spirit is a weapon honed by discipline and silence.*\n\n_\"Peace is not the absence of conflict, but the ability to handle it.\"_"
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
    "description": "A charismatic leader who inspires and guides followers, delivering divine pronouncements.\n\n*You speak the divine truth. Your followers look to you for salvation, and you lead them with absolute conviction. You channel the power of belief to shape the world around you.*\n\n_\"Have faith, for the path is clear.\"_"
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
    "description": "A nihilistic prophet who believes the end is inevitable and seeks to hasten or warn of it.\n\n*You see the darkness coming. You are the harbinger of entropy, speaking truths that others fear to hear. Your presence instills dread, for you walk hand in hand with the inevitable end.*\n\n_\"The void calls, and I am its voice.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Charisma (Primary), Constitution (Secondary).",
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
    "description": "A zealous preacher who travels the galaxy to spread their faith.\n\n*You carry the light into the darkness. You travel to the farthest reaches of the galaxy to share your truth, bringing hope and conviction to the lost and the forgotten.*\n\n_\"There is no place too dark for the light to reach.\"_"
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
    "secondary_attribute": "Insight",
    "key_attributes": "Wisdom (Primary), Insight (Secondary).",
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
    "description": "A wise and insightful individual who perceives glimpses of the future and offers guidance.\n\n*You see what will be. Time is a river, and you stand on the bank, watching the currents. You guide others away from disaster and towards their destiny with cryptic wisdom.*\n\n_\"The future is written, but the ink is not yet dry.\"_"
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
    "description": "A strategic leader who commands troops and coordinates military operations.\n\n*You lead from the front. You are the mind of the army, directing the flow of battle with precision. Your orders save lives and win wars.*\n\n_\"Form up! Hold the line!\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Charisma (Primary), Constitution (Secondary).",
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
    "description": "A protector of the innocent and champion of peace, using force and words.\n\n*You fight for peace. You are the shield of the defenseless, using violence only as a last resort. You walk the line between warrior and diplomat, resolving conflicts before they begin.*\n\n_\"Stand down. There is no need for bloodshed today.\"_"
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
    "description": "A devout servant of a state religion, maintaining morale and conducting ceremonies.\n\n*You are the pillar of the community. You hold the spiritual authority of an institution, guiding the faithful and ensuring the stability of society through ritual and tradition.*\n\n_\"By the authority vested in me, I command you to cease.\"_"
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
    "secondary_attribute": "Spirit",
    "key_attributes": "Charisma (Primary), Spirit (Secondary).",
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
    "description": "A charismatic leader who inspires and unites the rebellion.\n\n*You are the voice of change. You rally the oppressed against the tyrant, turning despair into action. You lead the charge against the established order, fighting for a better tomorrow.*\n\n_\"Break the chains! Rise up!\"_"
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
    "description": "A charismatic individual who thrives in social settings and networking.\n\n*You are the center of attention. You navigate the treacherous waters of high society with a smile and a drink. Information is your currency, and connections are your weapons.*\n\n_\"Oh, darling, you simply must tell me everything.\"_"
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
    "description": "The experienced instructor who guides the growth of others, identifying potential and refining raw talent.\n\n*You see the future in your pupils. You understand that the survival of your legacy depends on the success of the next generation. You don't just provide answers; you teach how to find them.*\n\n_\"You have the spark. Let me show you how to start the fire.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Wisdom (Primary), Constitution (Secondary).",
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
    "description": "The conduit between the material plane and the spiritual realms, interpreting the will of the unseen.\n\n*You are the bridge. You walk between realities, speaking for the entities that exist in the spaces between the stars. You find balance where others see only chaos or silence.*\n\n_\"The veil is thin here. Can you hear the ancestors?\"_"
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
    "description": "The public figure who embodies a concept or cause, wielding their fame as a source of inspiration and pressure.\n\n*You are more than a person; you are a symbol. Your every action is scrutinized and celebrated, and your voice carries the weight of millions. You use your status to shape the cultural landscape.*\n\n_\"I don't just represent the cause. I am the cause.\"_"
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
    "description": "The neutral mediator who resolves disputes with absolute impartiality and a deep understanding of universal justice.\n\n*You are the middle ground. In a galaxy of competing interests and violent factions, you provide the calm center where words replace weapons. You don't take sides; you find the truth.*\n\n_\"Justice is a scale. It must be balanced, not broken.\"_"
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
    "description": "The seeker of deeper meaning who challenges the assumptions of society and explores the fundamental nature of existence.\n\n*You think where others merely act. You analyze the moral and existential implications of every decision, providing the ethical framework that keeps the group—and civilization—from losing its soul.*\n\n_\"To know the universe, one must first know the silence between the thoughts.\"_"
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
    "description": "A proficient analytical thinker adept at processing data and solving problems. They see the patterns others miss.\n\n*You are the logic engine. You take the chaotic noise of the world and distill it into actionable data. You find the needle in the haystack, the flaw in the plan, and the weakness in the armor.*\n\n_\"The probability of success increases by 40% if you stop screaming.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Intellect (Primary), Constitution (Secondary).",
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
    "description": "Unveils the secrets of ancient ruins and artifacts, reconstructing chronicles of civilizations long gone.\n\n*You dig up the past to save the future. You are fearless in the face of ancient traps and curses, driven by the need to uncover the truth buried beneath the dust of ages.*\n\n_\"It belongs in a museum! Or at least, in my cargo hold.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Intellect (Primary), Constitution (Secondary).",
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
    "description": "A master of arcane magic, manipulating subtle energies to cast powerful spells through intricate gestures and rituals.\n\n*You hack reality. You have studied the underlying code of the universe and learned to rewrite it with a gesture. Fire, gravity, and time are just variables for you to manipulate.*\n\n_\"Physics is just a suggestion I choose to ignore.\"_"
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
      "Knowledge (Astrophysics)",
      "Alertness"
    ],
    "signature_features": [
      "Celestial Savant",
      "Observational Skills"
    ],
    "tactical_role": "Navigation through anomalies, identifying cosmic threats, operating ship sensors.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Specializes in the study of celestial objects and phenomena. They provide navigation data and understand the cosmos.\n\n*You read the stars like a map. You understand the terrifying scale of the cosmos and how to navigate its dangers. When the nav-computer fails, you are the one who guides the ship home.*\n\n_\"We are all just stardust. Some of us are just moving faster than others.\"_"
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
    "description": "Applies genetic engineering and biotechnology to create innovative tools, medicines, and biological constructs.\n\n*You design life. You see biology not as destiny, but as a canvas. You cure the incurable, enhance the weak, and grow solutions to problems that machines cannot solve.*\n\n_\"Evolution is too slow. I prefer immediate results.\"_"
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
    "description": "A brilliant inventor and technician who develops and maintains advanced technology. Skilled in hardware and software.\n\n*You build the future. If it's broken, you fix it; if it doesn't exist, you invent it. You keep the ship flying, the guns firing, and the lights on when the universe tries to turn them off.*\n\n_\"Give me a wrench and five minutes. I'll make it work.\"_"
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
    "description": "A master of cyberspace who infiltrates networks, manipulates data, and exploits vulnerabilities.\n\n*You own the network. While they lock the physical doors, you walk through the digital walls. You steal secrets, crash systems, and turn their own security against them without ever drawing a weapon.*\n\n_\"Access granted. Now, let's see what you're hiding.\"_"
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
    "description": "Studies history and culture. Provides context and insight into societies and ancient technologies.\n\n*You remember what the world forgot. You know that history repeats itself, and you know how to break the cycle. Your knowledge of the past is the key to surviving the future.*\n\n_\"Those who do not learn from the past are doomed to be eaten by it.\"_"
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
    "description": "Relentless detective who uncovers conspiracies and brings criminals to justice.\n\n*You find the truth. You don't stop until the puzzle is solved and the guilty are exposed. You notice the details that others miss, following the trail wherever it leads.*\n\n_\"Everyone has a secret. I just have to find the loose thread.\"_"
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
    "description": "Conducts research to further knowledge. Systematically gathers evidence and tests hypotheses.\n\n*You question everything. You are driven by the need to understand the fundamental laws of reality. You bring the light of reason to the darkest corners of the galaxy.*\n\n_\"Hypothesis: This might explode. Experiment: Let's find out.\"_"
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
      "Knowledge (Architecture)",
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
    "description": "Skilled in the design and upkeep of infrastructure.\n\n*You design the world. From skyscrapers to space stations, you understand the structures that house civilization. You see the stress points and the hidden flows of energy and people.*\n\n_\"Form follows function, but strength is non-negotiable.\"_"
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
    "description": "An expert in deciphering codes, languages, and hidden messages.\n\n*You unlock the secrets. No code is unbreakable, no language untranslatable. You find meaning in the chaos, revealing the hidden messages that others cannot see.*\n\n_\"Everything is a pattern. I just need to find the key.\"_"
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
    "secondary_attribute": "Technology",
    "key_attributes": "Intellect (Primary), Technology (Secondary).",
    "essential_skills": [
      "Knowledge (Medicine)",
      "Knowledge (Technology)",
      "Knowledge (Biology)",
      "Vocation (Engineer)"
    ],
    "signature_features": [
      "Cybernetic Enhancement",
      "Biomechanical Integration"
    ],
    "tactical_role": "Installing/repairing cybernetics, hacking enemy augments, buffing allies.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "Specialist in creating, repairing, and modifying cybernetic enhancements.\n\n*You build better humans. You merge flesh and machine to create something greater than the sum of its parts. You understand the interface between the biological and the technological.*\n\n_\"Flesh is weak. Steel is strong. I provide the upgrade.\"_"
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
    "description": "An expert in determining cause of death and analyzing biological evidence.\n\n*The dead speak to you. You read the story of their final moments in their wounds and chemistry. You find the truth that the living try to hide.*\n\n_\"The body never lies.\"_"
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
    "description": "A skilled pilot and navigator who charts the course for ships.\n\n*You know the way. The void is vast and trackless, but you never lose your way. You guide the ship through the dark, avoiding hazards and finding the fastest route to your destination.*\n\n_\"Trust my headings. I've never lost a ship yet.\"_"
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
    "secondary_attribute": "Constitution",
    "key_attributes": "Intellect (Primary), Constitution (Secondary).",
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
    "description": "A scholar who studies the geology, climate, and ecosystems of planets.\n\n*You read the world. You understand the forces that shape planets, from tectonics to weather. You know where to find resources and how to survive the elements.*\n\n_\"This planet is alive, and right now, it's angry.\"_"
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
    "secondary_attribute": "Technology",
    "key_attributes": "Intellect (Primary), Technology (Secondary).",
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
    "description": "A scholar who specializes in the study, design, and development of robots.\n\n*You breathe life into metal. You design and build the machines that serve, fight, and explore. You understand the artificial mind better than the organic one.*\n\n_\"It's not just a machine. It's a masterpiece.\"_"
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
    "description": "A strategic mastermind who analyzes the battlefield and coordinates actions.\n\n*You win the battle before it starts. You see the flow of combat, anticipating enemy moves and positioning your allies for maximum effect. You turn chaos into order.*\n\n_\"They are moving to flank. Suppress the left and advance on my signal.\"_"
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
    "description": "A skilled worker who maintains and repairs complex machinery.\n\n*You keep the lights on. You are the hands-on expert who keeps the complex systems of the future running. You fix the engines, the power grids, and the life support.*\n\n_\"It's a bypass of the bypass. It'll hold... probably.\"_"
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
      "Knowledge (Xenology)",
      "Diplomacy",
      "Insight",
      "Linguistics"
    ],
    "signature_features": [
      "Cultural Sensitivity",
      "Xeno-Linguist"
    ],
    "tactical_role": "Communicating with aliens, identifying xeno-threats, cultural navigation.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "An expert in alien cultures, biology, and languages.\n\n*You bridge the gap between worlds. You understand the strange and the alien, decoding their languages and customs to foster understanding or gain an advantage.*\n\n_\"They aren't monsters. They're just... different.\"_"
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
    "description": "THE visionary scientist who pushes the boundaries of standard physics to unlock the secrets of the multiverse.\n\n*You explore the \"why\" behind the \"how.\" While others use Knowledge (Technology), you define the laws that make it possible. You see the universe as a series of equations waiting to be balanced.*\n\n_\"The math doesn't lie. It just tells truths we aren't ready to hear.\"_"
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
    "description": "The expert on living systems who studies the interaction between species and their environments.\n\n*You understand the spark of life. You see the connections between the smallest microbe and the largest apex predator. You find solutions where nature provides the blueprint.*\n\n_\"Life always finds a way. I'm just here to watch it happen.\"_"
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
    "description": "The high-level systems engineer who designs and manages the data infrastructures that link civilizations.\n\n*You build the digital world. You don't just hack systems; you create the foundations they sit on. You understand the flow of information as a physical force that must be harnessed.*\n\n_\"The Grid is my masterpiece. Every packet of data is where I intended it to be.\"_"
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
      "Knowledge (Languages)",
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
    "description": "The master of communication who deciphers the languages of the galaxy to enable cooperation or manipulation.\n\n*You are the key to understanding. You translate the inscrutable and find the meaning hidden in alien noise. You know that the right word is often more powerful than the largest railgun.*\n\n_\"Language is the first weapon. And the first shield.\"_"
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
      "Knowledge (Geology)",
      "Alertness"
    ],
    "signature_features": [
      "Cartographer",
      "Planetary Savant"
    ],
    "tactical_role": "Identifying environmental resources, plotting safe paths, planetary analysis.",
    "category": "archetypes",
    "bp_chassis": 80,
    "description": "The meticulous researcher who maps the biological and geological variables of alien worlds to assess their value and danger.\n\n*You read the planet's history in its soil and its future in its atmosphere. You are the vanguard of colonization, ensuring that those who follow know exactly what they are walking into.*\n\n_\"This world has potential. And at least three ways to kill you by sunset.\"_"
  }
];
