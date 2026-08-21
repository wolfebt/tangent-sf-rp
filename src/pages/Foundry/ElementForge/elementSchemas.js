/**
 * Element Input Schemas & Field Definitions for Story Foundry
 * Maps each of the 16 Scenario Element Types to its focused input fields and tabs.
 */

export const ELEMENT_TYPES = [
  'Story Arc', 'Adventure', 'Persona', 'Scene', 'Faction', 
  'Encounter', 'Item', 'Clue', 'Handout', 'Custom',
  'Universe', 'World', 'Philosophy', 'Technology', 'Species'
];

export const getTypePillStyle = (type) => {
  switch (type) {
    case 'Story Arc':
    case 'Adventure':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'Persona':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    case 'Scene':
    case 'Encounter':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    case 'Faction':
    case 'Philosophy':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    case 'Item':
    case 'Clue':
    case 'Handout':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'Map':
    case 'World':
    case 'Universe':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    case 'Species':
    case 'Technology':
      return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40';
    default:
      return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  }
};


export const ELEMENT_SCHEMAS = {
  'Custom': [],
  'Story Arc': [
    { tab: 'Overview', key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Brief overview of the arc...' },
    { tab: 'Overview', key: 'goal', label: 'Goal', type: 'text', placeholder: 'Ultimate objective of this story arc...' },
    { tab: 'Overview', key: 'antagonist', label: 'Key Antagonist', type: 'text', placeholder: 'Main opposing force or entity...' },
    { tab: 'Overview', key: 'linkedFaction', label: 'Linked Faction (Cloud DB)', type: 'relational', dbSource: 'factions', placeholder: 'Select Cloud DBM Faction...' },
    { tab: 'Overview', key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'How the arc concludes...' },
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Classification tags (e.g. Cyberpunk, Sector-7, Psi)...' }
  ],
  'Adventure': [
    { tab: 'Overview', key: 'hook', label: 'Hook', type: 'textarea', placeholder: 'How players are drawn into the adventure...' },
    { tab: 'Overview', key: 'goal', label: 'Goal', type: 'text', placeholder: 'Primary objective...' },
    { tab: 'Overview', key: 'stakes', label: 'Stakes', type: 'textarea', placeholder: 'Consequences of failure...' },
    { tab: 'Overview', key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'How the adventure might end...' },
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Gameplay tags (e.g. Investigation, Combat, Heist)...' }
  ],
  'Persona': [
    { tab: 'Overview', key: 'role', label: 'Role in Story', type: 'text', placeholder: 'Quest Giver, Rival, Fixer...' },
    { tab: 'Overview', key: 'char-concept', label: 'Character Archetype', type: 'text', placeholder: 'Archetype...' },
    { tab: 'Overview', key: 'summary', label: 'One-Sentence Summary', type: 'text', placeholder: 'Summary...' },
    { tab: 'Overview', key: 'char-motive', label: 'Core Motivation', type: 'textarea', placeholder: 'What drives this character...' },
    { tab: 'Overview', key: 'primaryConflict', label: 'Primary Conflict/Goal', type: 'textarea', placeholder: 'Conflict...' },
    { tab: 'Profile: Vitals', key: 'char-name', label: 'Full Name', type: 'text', placeholder: 'Name...' },
    { tab: 'Profile: Vitals', key: 'nicknames', label: 'Nicknames / Aliases', type: 'text', placeholder: 'Aliases...' },
    { tab: 'Profile: Vitals', key: 'char-age', label: 'Age & Date of Birth', type: 'text', placeholder: 'Age...' },
    { tab: 'Profile: Vitals', key: 'char-gender', label: 'Gender & Pronouns', type: 'text', placeholder: 'Gender...' },
    { tab: 'Profile: Vitals', key: 'char-occu', label: 'Occupation (Cloud DB)', type: 'relational', dbSource: 'occupations', placeholder: 'Link Cloud DBM Occupation...' },
    { tab: 'Profile: Vitals', key: 'socialClass', label: 'Social Class & Status', type: 'text', placeholder: 'Social class...' },
    { tab: 'Profile: Vitals', key: 'char-origin', label: 'Origin (Cloud DB)', type: 'relational', dbSource: 'origins', placeholder: 'Link Cloud DBM Origin...' },
    { tab: 'Profile: Vitals', key: 'char-faction', label: 'Faction (Cloud DB)', type: 'relational', dbSource: 'factions', placeholder: 'Link Cloud DBM Faction...' },
    { tab: 'Profile: Vitals', key: 'currentResidence', label: 'Current Residence', type: 'text', placeholder: 'Residence...' },
    { tab: 'Profile: Physicality', key: 'appearance', label: 'Physical Description', type: 'textarea', placeholder: 'Physical appearance, cybernetics...' },
    { tab: 'Profile: Physicality', key: 'char-height', label: 'Height', type: 'text', placeholder: 'Height...' },
    { tab: 'Profile: Physicality', key: 'char-weight', label: 'Weight', type: 'text', placeholder: 'Weight...' },
    { tab: 'Profile: Physicality', key: 'voice', label: 'Voice & Speech', type: 'textarea', placeholder: 'Speech pattern...' },
    { tab: 'Profile: Physicality', key: 'char-style', label: 'Typical Clothing Style', type: 'textarea', placeholder: 'Clothing...' },
    { tab: 'Profile: Physicality', key: 'mannerisms', label: 'Mannerisms & Body Language', type: 'textarea', placeholder: 'Mannerisms...' },
    { tab: 'Profile: Personality', key: 'positiveTraits', label: 'Positive Traits', type: 'textarea', placeholder: 'Positive...' },
    { tab: 'Profile: Personality', key: 'negativeTraits', label: 'Negative Traits / Flaws', type: 'textarea', placeholder: 'Negative...' },
    { tab: 'Profile: Personality', key: 'likesDislikes', label: 'Likes & Dislikes', type: 'textarea', placeholder: 'Likes and dislikes...' },
    { tab: 'Profile: Personality', key: 'hobbies', label: 'Hobbies & Skills', type: 'textarea', placeholder: 'Hobbies...' },
    { tab: 'Profile: Personality', key: 'personalityType', label: 'Personality Type', type: 'text', placeholder: 'Type...' },
    { tab: 'Backstory', key: 'backstory', label: 'Detailed Backstory', type: 'textarea', placeholder: 'History...' },
    { tab: 'Backstory', key: 'definingTrauma', label: 'Defining Trauma / Wound', type: 'textarea', placeholder: 'Trauma...' },
    { tab: 'Backstory', key: 'greatestAccomplishment', label: 'Greatest Accomplishment(s)', type: 'textarea', placeholder: 'Accomplishment...' },
    { tab: 'Backstory', key: 'childhoodEvents', label: 'Childhood & Adolescence Events', type: 'textarea', placeholder: 'Childhood...' },
    { tab: 'Backstory', key: 'keyRelationships', label: 'Key Relationships & Dynamics', type: 'textarea', placeholder: 'Relationships...' },
    { tab: 'Psychology', key: 'worldview', label: 'Worldview & Ethics', type: 'textarea', placeholder: 'Worldview...' },
    { tab: 'Psychology', key: 'theLie', label: 'The Lie They Believe', type: 'textarea', placeholder: 'Lie...' },
    { tab: 'Psychology', key: 'theTruth', label: 'The Truth They Must Learn', type: 'textarea', placeholder: 'Truth...' },
    { tab: 'Psychology', key: 'deepestFear', label: 'Deepest Fear & Secret', type: 'textarea', placeholder: 'Fear/Secret...' },
    { tab: 'Psychology', key: 'goals', label: 'External Goal vs Internal Need', type: 'textarea', placeholder: 'Want vs Need...' },
    { tab: 'Psychology', key: 'stakes', label: 'Stakes & Character Arc', type: 'textarea', placeholder: 'Stakes...' },
    { tab: 'Genre & Notes', key: 'char-species', label: 'Species (Cloud DB)', type: 'relational', dbSource: 'species', placeholder: 'Link Cloud DBM Species...' },
    { tab: 'Genre & Notes', key: 'stats', label: 'Powers / Abilities / Tech', type: 'textarea', placeholder: 'Game-specific stats, abilities, gear...' },
    { tab: 'Genre & Notes', key: 'plotHooks', label: 'Plot Connection & Motives', type: 'textarea', placeholder: 'How they launch or start new adventures...' },
    { tab: 'Genre & Notes', key: 'romanticHistory', label: 'Romantic History & Philosophy', type: 'textarea', placeholder: 'Romance...' },
    { tab: 'Genre & Notes', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Character tags (e.g. Merchant, Ally, Faction-Lead)...' },
    { tab: 'Mechanics: Vitals', key: 'starting-cp', label: 'Starting CP', type: 'text', placeholder: '150' },
    { tab: 'Mechanics: Vitals', key: 'tech-level', label: 'Tech Level', type: 'text', placeholder: '3' },
    { tab: 'Mechanics: Vitals', key: 'magic-level', label: 'Magic Level', type: 'text', placeholder: '1' },
    { tab: 'Mechanics: Vitals', key: 'health', label: 'Health (Physical)', type: 'text', placeholder: '30' },
    { tab: 'Mechanics: Vitals', key: 'vitality', label: 'Vitality (Mental)', type: 'text', placeholder: '30' },
    { tab: 'Mechanics: Vitals', key: 'karma', label: 'Karma', type: 'text', placeholder: '3' },
    { tab: 'Mechanics: JSON', key: 'features', label: 'Features (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'disadvantages', label: 'Disadvantages (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'augmentations', label: 'Augmentations (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'awakened', label: 'Awakened (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'invocations', label: 'Invocations (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'special_abilities', label: 'Special Abilities (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'attacks', label: 'Attacks (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'armor', label: 'Armor (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'gear', label: 'Gear (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'weapons', label: 'Weapons (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'armoring', label: 'Armoring (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'mecha', label: 'Mecha (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'other', label: 'Other (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'specializations', label: 'Specializations (JSON)', type: 'textarea', placeholder: 'JSON Array...' },
    { tab: 'Mechanics: JSON', key: 'notes', label: 'Notes (JSON)', type: 'textarea', placeholder: 'JSON Array...' }
  ],
  'Scene': [
    { tab: 'Core Elements', key: 'scenePurpose', label: 'Scene Purpose & Summary', type: 'textarea', placeholder: 'One sentence summary and purpose...' },
    { tab: 'Core Elements', key: 'locationType', label: 'Location Type & Scale', type: 'text', placeholder: 'Kind of place (e.g. Dungeon, Spaceport, Megacity)...' },
    { tab: 'Core Elements', key: 'genreConcept', label: 'Genre / Tech Level / Core Concept', type: 'text', placeholder: 'Concept...' },
    { tab: 'Core Elements', key: 'stateChange', label: 'Beginning State vs Ending State', type: 'textarea', placeholder: 'State change...' },
    { tab: 'Setting & Atmosphere', key: 'atmosphere', label: 'Atmosphere & Key Props', type: 'text', placeholder: 'Mood, lighting, tension level...' },
    { tab: 'Setting & Atmosphere', key: 'weather', label: 'Weather & Environment', type: 'text', placeholder: 'Weather...' },
    { tab: 'Setting & Atmosphere', key: 'soundsSmells', label: 'Sounds and Smells', type: 'textarea', placeholder: 'Auditory and olfactory details...' },
    { tab: 'Setting & Atmosphere', key: 'keySights', label: 'Key Sights & Color Palette', type: 'textarea', placeholder: 'Notable visual features and landmarks...' },
    { tab: 'Geography & Ecology', key: 'geography', label: 'Geography, Cosmology, Terrain', type: 'textarea', placeholder: 'Terrain...' },
    { tab: 'Geography & Ecology', key: 'floraFauna', label: 'Ecosystems, Flora, Fauna, Hazards', type: 'textarea', placeholder: 'Ecosystem...' },
    { tab: 'History & Society', key: 'history', label: 'Creation Origin & Ancient Ruins', type: 'textarea', placeholder: 'History...' },
    { tab: 'History & Society', key: 'demographics', label: 'Demographics, Government & Economy', type: 'textarea', placeholder: 'Society...' },
    { tab: 'History & Society', key: 'secrets', label: 'Secrets & Hidden Lairs', type: 'textarea', placeholder: 'Hidden truths or concealed areas...' },
    { tab: 'Characters & POV', key: 'pov', label: 'POV Character & Audience', type: 'text', placeholder: 'POV...' },
    { tab: 'Characters & POV', key: 'charactersPresent', label: 'Characters Present', type: 'textarea', placeholder: 'Who is here...' },
    { tab: 'Characters & POV', key: 'povGoals', label: 'POV Goal vs Opponent Goal', type: 'textarea', placeholder: 'Goals...' },
    { tab: 'Characters & POV', key: 'emotionalArc', label: 'Emotional Arc', type: 'textarea', placeholder: 'Arc...' },
    { tab: 'Plot & Pacing', key: 'openingBeat', label: 'Opening Beat & Inciting Event', type: 'textarea', placeholder: 'Opening...' },
    { tab: 'Plot & Pacing', key: 'risingAction', label: 'Rising Action & Climax', type: 'textarea', placeholder: 'Climax...' },
    { tab: 'Plot & Pacing', key: 'potentialEncounters', label: 'Potential Encounters & Conflict', type: 'textarea', placeholder: 'Creatures, hazards, or events here...' },
    { tab: 'Plot & Pacing', key: 'sensoryDialogue', label: 'Sensory Details & Key Dialogue', type: 'textarea', placeholder: 'Dialogue...' },
    { tab: 'Plot & Pacing', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Tags (e.g. TL-4, High-Danger, Subterranean)...' }
  ],
  'Faction': [
    { tab: 'Overview', key: 'dbmFactionRef', label: 'Faction Record (Cloud DB)', type: 'relational', dbSource: 'factions', placeholder: 'Link Cloud DBM Faction...' },
    { tab: 'Overview', key: 'coreIdentity', label: 'Core Identity & Mandate', type: 'textarea', placeholder: 'Identity...' },
    { tab: 'Overview', key: 'motto', label: 'Public Motto / Symbol', type: 'text', placeholder: 'Motto...' },
    { tab: 'Ideology & Governance', key: 'ideology', label: 'Core Ideology', type: 'textarea', placeholder: 'Core beliefs and code of operation...' },
    { tab: 'Ideology & Governance', key: 'goals', label: 'Public vs Hidden Agenda', type: 'textarea', placeholder: 'What the faction wants to achieve...' },
    { tab: 'Ideology & Governance', key: 'government', label: 'Government Type & Leadership', type: 'textarea', placeholder: 'Leadership...' },
    { tab: 'Ideology & Governance', key: 'laws', label: 'Laws & Membership Criteria', type: 'textarea', placeholder: 'Laws...' },
    { tab: 'Assets & Resources', key: 'resources', label: 'Economic Power & Industry', type: 'textarea', placeholder: 'Assets, weapons, wealth, contacts...' },
    { tab: 'Assets & Resources', key: 'territory', label: 'Scope of Influence & Territory', type: 'textarea', placeholder: 'Territory...' },
    { tab: 'Assets & Resources', key: 'military', label: 'Population & Military Strength', type: 'textarea', placeholder: 'Military...' },
    { tab: 'Assets & Resources', key: 'specialUnits', label: 'Specialized Units & Tactical Specialties', type: 'textarea', placeholder: 'Units...' },
    { tab: 'Culture & Relations', key: 'culture', label: 'Social Hierarchy & Aesthetics', type: 'textarea', placeholder: 'Culture...' },
    { tab: 'Culture & Relations', key: 'relations', label: 'Allies, Enemies & Neutral Parties', type: 'textarea', placeholder: 'Relations...' },
    { tab: 'Culture & Relations', key: 'reputation', label: 'Foreign Policy & World Reputation', type: 'textarea', placeholder: 'Reputation...' },
    { tab: 'History & Figures', key: 'history', label: 'Founding Story & Historical Figures', type: 'textarea', placeholder: 'History...' },
    { tab: 'History & Figures', key: 'turningPoints', label: 'Major Turning Points', type: 'textarea', placeholder: 'Turning points...' },
    { tab: 'History & Figures', key: 'keyMembers', label: 'Key NPCs & Plot Hooks', type: 'textarea', placeholder: 'Important figures and leaders...' },
    { tab: 'History & Figures', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Faction tags (e.g. Megacorp, Syndicate, Cult)...' }
  ],
  'Encounter': [
    { tab: 'Overview', key: 'encounterType', label: 'Type', type: 'text', placeholder: 'Kind of encounter (e.g. Combat, Social, Puzzle, Chase)...' },
    { tab: 'Overview', key: 'setup', label: 'Setup', type: 'textarea', placeholder: 'How the encounter begins...' },
    { tab: 'Overview', key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'Possible outcomes and rewards...' },
    { tab: 'Mechanics', key: 'mechanic', label: 'Mechanics', type: 'textarea', placeholder: 'Special rules, timers, or hazards...' },
    { tab: 'Mechanics', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Encounter tags (e.g. Lethal, Tactical, Boss)...' }
  ],
  'Item': [
    { tab: 'Overview', key: 'itemCategory', label: 'Cloud DB Category', type: 'text', placeholder: 'Weaponry / Armoring / Gear / Augmentations...' },
    { tab: 'Overview', key: 'weaponRef', label: 'Weapon Record (Cloud DB)', type: 'relational', dbSource: 'weaponry', placeholder: 'Link Cloud DBM Weapon...' },
    { tab: 'Overview', key: 'armoringRef', label: 'Armor Record (Cloud DB)', type: 'relational', dbSource: 'armoring', placeholder: 'Link Cloud DBM Armor...' },
    { tab: 'Overview', key: 'gearRef', label: 'Gear Record (Cloud DB)', type: 'relational', dbSource: 'gear', placeholder: 'Link Cloud DBM Gear...' },
    { tab: 'Overview', key: 'rarity', label: 'Rarity', type: 'text', placeholder: 'Rarity (e.g. Common, Prototype, Artifact)...' },
    { tab: 'Properties', key: 'attunement', label: 'Attunement', type: 'text', placeholder: 'Attunement requirement (e.g. Cyberware ML-2)...' },
    { tab: 'Properties', key: 'properties', label: 'Properties', type: 'textarea', placeholder: 'Passive abilities and bonuses...' },
    { tab: 'Mechanics', key: 'mechanic', label: 'Mechanics', type: 'textarea', placeholder: 'Active functioning and usage rules...' },
    { tab: 'Lore', key: 'history', label: 'History', type: 'textarea', placeholder: 'Origin story and previous owners...' },
    { tab: 'Lore', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Item tags (e.g. Tech, Weapon, Psionic)...' }
  ],
  'Clue': [
    { tab: 'Overview', key: 'rulesRef', label: 'Compendium / Rules (Cloud DB)', type: 'relational', dbSource: 'compendium', placeholder: 'Link Cloud DBM Compendium...' },
    { tab: 'Overview', key: 'information', label: 'Information Revealed', type: 'textarea', placeholder: 'What this clue reveals...' },
    { tab: 'Overview', key: 'locationFound', label: 'Location Found', type: 'text', placeholder: 'Where or how it is discovered...' },
    { tab: 'Overview', key: 'conclusion', label: 'Player Conclusion', type: 'textarea', placeholder: 'What players should realize...' },
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Clue tags (e.g. Datapad, Forensic, Keycode)...' }
  ],
  'Map': [
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Map tags (e.g. Grid-Square, Sector-A)...' }
  ],
  'Handout': [
    { tab: 'Overview', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Handout tags (e.g. Document, Cipher, Letter)...' }
  ],
  'Universe': [
    { tab: 'Core Concept & Metaphysics', key: 'designation', label: 'Universe Designation & Pitch', type: 'textarea', placeholder: 'Designation...' },
    { tab: 'Core Concept & Metaphysics', key: 'ontological', label: 'Ontological Premise & The Source', type: 'textarea', placeholder: 'Premise...' },
    { tab: 'Universal Laws & Structure', key: 'lawsPhysics', label: 'Laws of Physics & Metaphysics', type: 'textarea', placeholder: 'Laws...' },
    { tab: 'Universal Laws & Structure', key: 'natureMagic', label: 'Nature of Magic, Time & Space', type: 'textarea', placeholder: 'Magic...' },
    { tab: 'Universal Laws & Structure', key: 'cosmological', label: 'Cosmological Model & Multiverse Planes', type: 'textarea', placeholder: 'Cosmology...' },
    { tab: 'Cosmogony, Powers & Dynamics', key: 'creation', label: 'Cosmic Creation & End of Universe', type: 'textarea', placeholder: 'Creation...' },
    { tab: 'Cosmogony, Powers & Dynamics', key: 'entities', label: 'Cosmic Entities & Divine Hierarchy', type: 'textarea', placeholder: 'Entities...' },
    { tab: 'Cosmogony, Powers & Dynamics', key: 'interplanar', label: 'Inter-Planar Travel & Convergence Points', type: 'textarea', placeholder: 'Travel...' },
    { tab: 'Cosmogony, Powers & Dynamics', key: 'centralQuestion', label: 'Central Question & Overall Vibe', type: 'textarea', placeholder: 'Question...' }
  ],
  'World': [
    { tab: 'Cosmology & Magic Laws', key: 'highConcept', label: 'World Name & High Concept', type: 'textarea', placeholder: 'Concept...' },
    { tab: 'Cosmology & Magic Laws', key: 'laws', label: 'Cosmology & Laws of Physics', type: 'textarea', placeholder: 'Laws...' },
    { tab: 'Cosmology & Magic Laws', key: 'magic', label: 'Magic System: Source, Rules & Limits', type: 'textarea', placeholder: 'Magic...' },
    { tab: 'Physical Geography & History', key: 'starSystem', label: 'Star System & Planets', type: 'textarea', placeholder: 'Stars...' },
    { tab: 'Physical Geography & History', key: 'continents', label: 'Continents, Oceans & Weather', type: 'textarea', placeholder: 'Geography...' },
    { tab: 'Physical Geography & History', key: 'history', label: 'Creation Myth & Historical Eras', type: 'textarea', placeholder: 'History...' },
    { tab: 'Physical Geography & History', key: 'cataclysms', label: 'Cataclysms & Fallen Empires', type: 'textarea', placeholder: 'Cataclysms...' },
    { tab: 'Life, Inhabitants & Systems', key: 'species', label: 'Major Sentient Species & Factions', type: 'textarea', placeholder: 'Species...' },
    { tab: 'Life, Inhabitants & Systems', key: 'demographics', label: 'Global Demographics & Monsters', type: 'textarea', placeholder: 'Demographics...' },
    { tab: 'Life, Inhabitants & Systems', key: 'techLevel', label: 'Tech Level, Global Economy & Languages', type: 'textarea', placeholder: 'Tech...' },
    { tab: 'Themes & Pantheons', key: 'pantheons', label: 'Gods & Pantheons', type: 'textarea', placeholder: 'Gods...' },
    { tab: 'Themes & Pantheons', key: 'themes', label: 'Central Themes & Overall Vibe', type: 'textarea', placeholder: 'Themes...' },
    { tab: 'Themes & Pantheons', key: 'inspirations', label: 'Aesthetic Inspirations', type: 'textarea', placeholder: 'Aesthetics...' }
  ],
  'Philosophy': [
    { tab: 'Overview & Tenets', key: 'category', label: 'Philosophy Name & Category', type: 'text', placeholder: 'Name...' },
    { tab: 'Overview & Tenets', key: 'tenet', label: 'Core Tenet & Guiding Question', type: 'textarea', placeholder: 'Tenet...' },
    { tab: 'Metaphysics & Epistemology', key: 'cosmology', label: 'Cosmology, Deity & Afterlife', type: 'textarea', placeholder: 'Cosmology...' },
    { tab: 'Metaphysics & Epistemology', key: 'freeWill', label: 'Free Will vs Determinism', type: 'textarea', placeholder: 'Free Will...' },
    { tab: 'Metaphysics & Epistemology', key: 'truth', label: 'Source of Truth & Forbidden Knowledge', type: 'textarea', placeholder: 'Truth...' },
    { tab: 'Ethics, Society & Practice', key: 'ethics', label: 'Moral Compass & Virtues/Vices', type: 'textarea', placeholder: 'Ethics...' },
    { tab: 'Ethics, Society & Practice', key: 'society', label: 'Ideal Government & Social Structure', type: 'textarea', placeholder: 'Society...' },
    { tab: 'Ethics, Society & Practice', key: 'rituals', label: 'Founders, Sacred Texts & Rituals', type: 'textarea', placeholder: 'Rituals...' }
  ],
  'Technology': [
    { tab: 'Overview & Concept', key: 'category', label: 'Technology Name & Category', type: 'text', placeholder: 'Name...' },
    { tab: 'Overview & Concept', key: 'function', label: 'Core Function & Readiness Level', type: 'textarea', placeholder: 'Function...' },
    { tab: 'Mechanics & Principles', key: 'power', label: 'Power Source & Operating Principles', type: 'textarea', placeholder: 'Power...' },
    { tab: 'Mechanics & Principles', key: 'components', label: 'Key Components & User Interface', type: 'textarea', placeholder: 'Components...' },
    { tab: 'Origin, Aesthetics & Production', key: 'origin', label: 'Inventor, Date & Historical Context', type: 'textarea', placeholder: 'Origin...' },
    { tab: 'Origin, Aesthetics & Production', key: 'aesthetics', label: 'Physical & Sensory Description', type: 'textarea', placeholder: 'Aesthetics...' },
    { tab: 'Origin, Aesthetics & Production', key: 'production', label: 'Manufacturing Process & Cost', type: 'textarea', placeholder: 'Production...' },
    { tab: 'Societal Impact & Story Role', key: 'impact', label: 'Economic, Social & Military Impact', type: 'textarea', placeholder: 'Impact...' },
    { tab: 'Societal Impact & Story Role', key: 'weaknesses', label: 'Strengths, Weaknesses & Drawbacks', type: 'textarea', placeholder: 'Weaknesses...' },
    { tab: 'Societal Impact & Story Role', key: 'role', label: 'Role in the Narrative', type: 'textarea', placeholder: 'Role...' }
  ],
  'Species': [
    { tab: 'Overview', key: 'name', label: 'Species Name', type: 'text', placeholder: 'Name...' },
    { tab: 'Overview', key: 'dbmSpeciesRef', label: 'Species Record (Cloud DB)', type: 'relational', dbSource: 'species', placeholder: 'Link Cloud DBM Species...' },
    { tab: 'Overview', key: 'speciesTypeRef', label: 'Species Type (Cloud DB)', type: 'relational', dbSource: 'species_type', placeholder: 'Select Species Type...' },
    { tab: 'Overview', key: 'speciesSizeRef', label: 'Species Size (Cloud DB)', type: 'relational', dbSource: 'species_size', placeholder: 'Select Species Size...' },
    { tab: 'Overview', key: 'speciesMovementRef', label: 'Species Movement (Cloud DB)', type: 'relational', dbSource: 'species_movement', placeholder: 'Select Species Movement...' },
    { tab: 'Overview', key: 'homeworld', label: 'Homeworld / Plane of Origin', type: 'text', placeholder: 'Homeworld...' },
    { tab: 'Overview', key: 'sentience', label: 'Sentience Level', type: 'text', placeholder: 'Sentience...' },
    { tab: 'Overview', key: 'description', label: 'General Description', type: 'textarea', placeholder: 'Description...' },
    { tab: 'Overview', key: 'archetype', label: 'Core Concept / Archetype', type: 'text', placeholder: 'Archetype...' },
    { tab: 'Biology & Physiology', key: 'appearance', label: 'General Appearance', type: 'textarea', placeholder: 'Appearance...' },
    { tab: 'Biology & Physiology', key: 'composition', label: 'Physical Composition & Skeleton', type: 'textarea', placeholder: 'Skeleton...' },
    { tab: 'Biology & Physiology', key: 'features', label: 'Limbs, Integument & Head Features', type: 'textarea', placeholder: 'Features...' },
    { tab: 'Biology & Physiology', key: 'diet', label: 'Diet, Metabolism & Senses', type: 'textarea', placeholder: 'Diet...' },
    { tab: 'Biology & Physiology', key: 'reproduction', label: 'Reproduction & Life Cycle', type: 'textarea', placeholder: 'Life Cycle...' },
    { tab: 'Biology & Physiology', key: 'vulnerabilities', label: 'Vulnerabilities & Resistances', type: 'textarea', placeholder: 'Vulnerabilities...' },
    { tab: 'Psychology & Cognition', key: 'intelligence', label: 'Intelligence & Problem-Solving', type: 'textarea', placeholder: 'Intelligence...' },
    { tab: 'Psychology & Cognition', key: 'communication', label: 'Communication Method', type: 'textarea', placeholder: 'Communication...' },
    { tab: 'Psychology & Cognition', key: 'temperament', label: 'Dominant Instincts & Temperament', type: 'textarea', placeholder: 'Temperament...' },
    { tab: 'Psychology & Cognition', key: 'emotion', label: 'Emotional Range & Self-Concept', type: 'textarea', placeholder: 'Emotion...' },
    { tab: 'Culture & Society', key: 'society', label: 'Social Structure & Government', type: 'textarea', placeholder: 'Society...' },
    { tab: 'Culture & Society', key: 'laws', label: 'Laws, Ethics & Rank Hierarchy', type: 'textarea', placeholder: 'Laws...' },
    { tab: 'Culture & Society', key: 'language', label: 'Language, Tech Level & Art', type: 'textarea', placeholder: 'Language...' },
    { tab: 'Culture & Society', key: 'religion', label: 'Religion, Rituals & Cuisine', type: 'textarea', placeholder: 'Religion...' },
    { tab: 'Ecology & Abilities', key: 'traitsRef', label: 'Species Traits (Cloud DB)', type: 'relational', dbSource: 'trait', placeholder: 'Select Cloud DBM Species Traits...' },
    { tab: 'Ecology & Abilities', key: 'ecology', label: 'Homeworld Environment & Niche', type: 'textarea', placeholder: 'Environment...' },
    { tab: 'Ecology & Abilities', key: 'abilities', label: 'Inherent Abilities & Strengths', type: 'textarea', placeholder: 'Abilities...' },
    { tab: 'Ecology & Abilities', key: 'weaknesses', label: 'Species Weaknesses & Unique Traits', type: 'textarea', placeholder: 'Weaknesses...' },
    { tab: 'Ecology & Abilities', key: 'tags', label: 'Tags', type: 'text', placeholder: 'Species tags (e.g. Organic, Cyber-Enhanced, Aquatic)...' }
  ]
};

export const SCENARIO_GUIDE_MODULES = [
  {
    id: 'sg_adventure',
    name: 'Adventure Module',
    category: 'Narrative',
    elementType: 'Adventure',
    icon: '📜',
    promptTemplate: 'Synthesize a multi-act science fantasy Adventure Module titled "{title}". Include premise, key locations, hazards, NPC cast, combat encounters, and branching outcomes.'
  },
  {
    id: 'sg_encounter',
    name: 'Combat & Trap Encounter',
    category: 'Tactical',
    elementType: 'Encounter',
    icon: '⚔️',
    promptTemplate: 'Design a tactical Combat & Trap Encounter titled "{title}". Include terrain features, cover, environmental hazards, enemy statblocks, tactics, and XP/CP rewards.'
  },
  {
    id: 'sg_npc',
    name: 'NPC Profile',
    category: 'Entities',
    elementType: 'Persona',
    icon: '👤',
    promptTemplate: 'Generate a detailed NPC Profile for "{title}". Include species, faction allegiance, appearance, cybernetics/psionics, motivations, dialogue hooks, and combat stats.'
  },
  {
    id: 'sg_location',
    name: 'Dungeon & Location',
    category: 'World',
    elementType: 'Scene',
    icon: '🏛️',
    promptTemplate: 'Craft a detailed Location & Dungeon Spec for "{title}". Include sensory descriptions, room-by-room breakdown, security systems, loot containers, and atmospheric read-aloud text.'
  },
  {
    id: 'sg_item',
    name: 'Loot & Relic Spec',
    category: 'Items',
    elementType: 'Item',
    icon: '💎',
    promptTemplate: 'Generate an ancient relic / tech item specification for "{title}". Include lore origin, Tech Level, mechanical stat bonuses, active abilities, and CP cost.'
  },
  {
    id: 'sg_clue',
    name: 'Mystery & Clue',
    category: 'Investigation',
    elementType: 'Clue',
    icon: '🔍',
    promptTemplate: 'Design an investigative Mystery Clue for "{title}". Include physical appearance, analysis DC checks (Perception/Tech), linked secrets, and deduction leads.'
  },
  {
    id: 'sg_storyarc',
    name: 'Campaign Story Arc',
    category: 'Narrative',
    elementType: 'Story Arc',
    icon: '🌌',
    promptTemplate: 'Outline a major Campaign Story Arc titled "{title}". Include overarching antagonist faction, rising stakes, 3 pivotal milestones, and universe consequences.'
  },
  {
    id: 'sg_handout',
    name: 'Player Handout',
    category: 'Props',
    elementType: 'Handout',
    icon: '📄',
    promptTemplate: 'Write an in-universe Player Handout document for "{title}". Format as an encrypted transmission log, corporate memorandum, or intercepted comm-link transcript.'
  },
  {
    id: 'sg_faction',
    name: 'Faction & Group Matrix',
    category: 'Entities',
    elementType: 'Faction',
    icon: '🛡️',
    promptTemplate: 'Generate a Faction Profile for "{title}". Include hierarchy, military assets, tech level, psionic capabilities, rivalries, and GM plot hooks.'
  },
  {
    id: 'sg_mapspec',
    name: 'Tactical Map Spec',
    category: 'Tactical',
    elementType: 'Map',
    icon: '🗺️',
    promptTemplate: 'Generate a Tactical Map Layout Specification for "{title}". Include grid dimensions, terrain biomes, elevation levels, cover positions, and dynamic lighting zones.'
  }
];

