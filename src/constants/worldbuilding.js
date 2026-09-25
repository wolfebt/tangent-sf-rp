// ═══════════════════════════════════════════════════════════
// MODULAR CHARACTER MATRIX CONSTANTS (PLAN 24)
// ═══════════════════════════════════════════════════════════

export const THREAT_TIER_CHASSIS = {
  0: { tier: 0, narrativeRank: 'Civilian / Minion', attrBonus: 0, primarySkill: 5, secondarySkill: 3, actions: 1, vitHeaBonus: 0, dr: 0, bp: '< 50 CP', cp: '< 50 CP' },
  1: { tier: 1, narrativeRank: 'Adept', attrBonus: 0, primarySkill: 6, secondarySkill: 3, actions: 2, vitHeaBonus: 5, dr: 2, bp: '50 CP', cp: '50 CP' },
  2: { tier: 2, narrativeRank: 'Militia', attrBonus: 1, primarySkill: 7, secondarySkill: 4, actions: 2, vitHeaBonus: 10, dr: 5, bp: '75 CP', cp: '75 CP' },
  3: { tier: 3, narrativeRank: 'Trooper', attrBonus: 1, primarySkill: 8, secondarySkill: 4, actions: 2, vitHeaBonus: 15, dr: 8, bp: '100 CP', cp: '100 CP' },
  4: { tier: 4, narrativeRank: 'Standard', attrBonus: 2, primarySkill: 9, secondarySkill: 5, actions: 2, vitHeaBonus: 20, dr: 10, bp: '125 CP', cp: '125 CP' },
  5: { tier: 5, narrativeRank: 'Professional', attrBonus: 2, primarySkill: 10, secondarySkill: 5, actions: 2, vitHeaBonus: 25, dr: 12, bp: '150 CP', cp: '150 CP' },
  6: { tier: 6, narrativeRank: 'Veteran', attrBonus: 3, primarySkill: 11, secondarySkill: 6, actions: 3, vitHeaBonus: 30, dr: 15, bp: '175 CP', cp: '175 CP' },
  7: { tier: 7, narrativeRank: 'Specialist', attrBonus: 3, primarySkill: 12, secondarySkill: 7, actions: 3, vitHeaBonus: 35, dr: 18, bp: '200 CP', cp: '200 CP' },
  8: { tier: 8, narrativeRank: 'Elite', attrBonus: 4, primarySkill: 13, secondarySkill: 8, actions: 3, vitHeaBonus: 40, dr: 20, bp: '225 CP', cp: '225 CP' },
  9: { tier: 9, narrativeRank: 'Operative', attrBonus: 4, primarySkill: 14, secondarySkill: 9, actions: 3, vitHeaBonus: 45, dr: 22, bp: '250 CP', cp: '250 CP' },
  10: { tier: 10, narrativeRank: 'Champion', attrBonus: 5, primarySkill: 16, secondarySkill: 11, actions: 4, vitHeaBonus: 50, dr: 25, bp: '275 CP', cp: '275 CP' },
  11: { tier: 11, narrativeRank: 'Warlord', attrBonus: 5, primarySkill: 17, secondarySkill: 12, actions: 4, vitHeaBonus: 55, dr: 28, bp: '300 CP', cp: '300 CP' },
  12: { tier: 12, narrativeRank: 'Commander', attrBonus: 6, primarySkill: 18, secondarySkill: 13, actions: 4, vitHeaBonus: 60, dr: 30, bp: '325 CP', cp: '325 CP' },
  13: { tier: 13, narrativeRank: 'General', attrBonus: 6, primarySkill: 19, secondarySkill: 14, actions: 4, vitHeaBonus: 65, dr: 32, bp: '350 CP', cp: '350 CP' },
  14: { tier: 14, narrativeRank: 'Paragon', attrBonus: 7, primarySkill: 21, secondarySkill: 16, actions: 5, vitHeaBonus: 70, dr: 35, bp: '375 CP', cp: '375 CP' },
  15: { tier: 15, narrativeRank: 'High Lord', attrBonus: 7, primarySkill: 22, secondarySkill: 17, actions: 5, vitHeaBonus: 75, dr: 38, bp: '400 CP', cp: '400 CP' },
  16: { tier: 16, narrativeRank: 'Heroic', attrBonus: 8, primarySkill: 23, secondarySkill: 18, actions: 5, vitHeaBonus: 80, dr: 40, bp: '425 CP', cp: '425 CP' },
  17: { tier: 17, narrativeRank: 'Legend', attrBonus: 8, primarySkill: 24, secondarySkill: 19, actions: 5, vitHeaBonus: 85, dr: 42, bp: '450 CP', cp: '450 CP' },
  18: { tier: 18, narrativeRank: 'Ascendant', attrBonus: 9, primarySkill: 26, secondarySkill: 21, actions: 6, vitHeaBonus: 90, dr: 45, bp: '475 CP', cp: '475 CP' },
  19: { tier: 19, narrativeRank: 'Demigod', attrBonus: 9, primarySkill: 28, secondarySkill: 23, actions: 6, vitHeaBonus: 95, dr: 48, bp: '500 CP', cp: '500 CP' },
  20: { tier: 20, narrativeRank: 'Cosmic / Mythic', attrBonus: 10, primarySkill: 30, secondarySkill: 26, actions: 6, vitHeaBonus: 100, dr: 50, bp: '525 CP', cp: '525 CP' }
};

export const COMPETENCY_ROLES = {
  Tank: { id: 'Tank', name: 'The Tank (Frontline Vanguard)', group: 'Combat', primaryAttrs: ['Stamina', 'Strength'], keySkills: ['Defense', 'Intimidate', 'Athletics'], feature: 'Guard (Intercept attacks meant for allies)', description: 'Impenetrable vanguard holding vitals and absorbing heavy trauma' },
  Brute: { id: 'Brute', name: 'The Brute (Heavy Assault)', group: 'Combat', primaryAttrs: ['Strength', 'Stamina'], keySkills: ['Melee Combat', 'Athletics'], feature: 'Rage (Take damage to deal +2 damage)', description: 'Raw kinetic force to shatter defensive lines in close quarters' },
  MeleeDPS: { id: 'MeleeDPS', name: 'Melee DPS (Close Striker)', group: 'Combat', primaryAttrs: ['Agility', 'Strength'], keySkills: ['Melee Combat', 'Acrobatics', 'Evasion'], feature: 'Sneak Attack (+1d6 damage on advantage)', description: 'High precision close-quarters executioner weaving through defenses' },
  RangedDPS: { id: 'RangedDPS', name: 'Ranged DPS (Fire Support)', group: 'Combat', primaryAttrs: ['Agility', 'Precision'], keySkills: ['Ranged Combat', 'Alertness'], feature: 'Burst Attack (Reduces auto-fire penalty)', description: 'Sustained suppressive and lethal mid-range fire' },
  Sniper: { id: 'Sniper', name: 'The Sniper (Long-Range Assassin)', group: 'Combat', primaryAttrs: ['Precision', 'Agility'], keySkills: ['Ranged Combat', 'Stealth', 'Alertness'], feature: 'Sniper (Ignore cover penalties)', description: 'Surgical elimination of high-value targets from extreme distance' },
  MobilitySpecialist: { id: 'MobilitySpecialist', name: 'Mobility Specialist (Skirmisher)', group: 'Combat', primaryAttrs: ['Agility', 'Stamina'], keySkills: ['Acrobatics', 'Piloting', 'Athletics'], feature: 'Nimble Moves (Ignore difficult terrain)', description: 'Master of traversal exploiting gaps in enemy formations' },
  Flank: { id: 'Flank', name: 'The Flank (Asymmetric Striker)', group: 'Combat', primaryAttrs: ['Agility', 'Precision'], keySkills: ['Stealth', 'Melee Combat', 'Evasion'], feature: 'Hit & Run (Move without provoking reactions)', description: 'Collapses defensive lines from flank using hit-and-run tactics' },
  CombativeMetaUser: { id: 'CombativeMetaUser', name: 'Combative Meta-User (Reality Warper)', group: 'Metaphysics', primaryAttrs: ['Intellect', 'Wisdom'], keySkills: ['Attune', 'Discipline'], feature: 'Awakened (Access to Invocations)', description: 'Esoteric artillery providing area denial and bypassing physical armor' },
  Buffer: { id: 'Buffer', name: 'The Buffer (Team Enhancer)', group: 'Support', primaryAttrs: ['Charisma', 'Wisdom'], keySkills: ['Diplomacy', 'Attune'], feature: 'Aura of Command (+1 Hit/Save in 30ft)', description: 'Elevates cohesion and resilience of allies through projected auras' },
  Leader: { id: 'Leader', name: 'The Leader (Tactical Commander)', group: 'Support', primaryAttrs: ['Intellect', 'Charisma'], keySkills: ['Tactics', 'Leadership', 'Insight'], feature: 'Master Plan (Bonus pool via planning)', description: 'Coordinates complex maneuvers to turn chaotic skirmishes into methodical victories' },
  Debuffer: { id: 'Debuffer', name: 'The Debuffer (Saboteur)', group: 'Controller', primaryAttrs: ['Wisdom', 'Intellect'], keySkills: ['Intimidate', 'Discipline'], feature: 'Suppressing Fire / Analyze Weakness', description: 'Systematically neutralizes enemy advantages through status conditions' },
  Technician: { id: 'Technician', name: 'The Technician (Electronic Warfare)', group: 'Controller', primaryAttrs: ['Intellect', 'Agility'], keySkills: ['Computers', 'Engineering', 'Mechanics'], feature: 'Jamming / Hack (Disable tech)', description: 'Controls digital/mechanical battlefield, hacking security and jamming comms' }
};

export const DESIGNATIONS = {
  Adversary: { id: 'Adversary', name: 'Adversary (Enemy)', description: 'Built to actively oppose players using full combat mechanics' },
  Ally: { id: 'Ally', name: 'Ally (Independent)', description: 'Aids players autonomously on own initiative with full tier scaling' },
  Companion: { id: 'Companion', name: 'Companion (Player-Bound)', description: 'Bound directly to player character via 40 CP budget system' },
  Neutral: { id: 'Neutral', name: 'Neutral (Civilian / Bystander)', description: 'Managed via narrative block; full health pool with untrained combat triggers' }
};

export const BOSS_TYPES = {
  Standard: { id: 'Standard', name: 'Standard Unit (1x Health)', multiplier: 1, description: 'Standard health pool, regular action economy' },
  Minion: { id: 'Minion', name: 'Minion (1 Health Rule)', multiplier: 0, isMinion: true, description: '1 Health Rule: Incapacitated if any damage bypasses DR' },
  Boss: { id: 'Boss', name: 'Boss (2x Health + Legendary Resilience)', multiplier: 2, isBoss: true, description: '2x Vitality & Health, Legendary Resilience (1-3 saves/day), Lair Actions' },
  Mastermind: { id: 'Mastermind', name: 'Mastermind (3x Health + Plot Armor)', multiplier: 3, isMastermind: true, description: '3x to 5x Vitality & Health, Plot Armor escape mechanics, macro-scale influence' }
};

export const TACTICAL_BEHAVIORS = [
  'Aggressive Rush',
  'Defensive Anchor',
  'Sniping from Cover',
  'Flank and Encircle',
  'Hit-and-Run Skirmish',
  'Pack Tactics Swarm',
  'Suppressive Fire Laydown',
  'Electronic Jamming & Sabotage',
  'Metaphysical Area Denial',
  'Buff & Command Coordination',
  'Strategic Retreat on 50% Health'
];

// ═══════════════════════════════════════════════════════════
// COMPANION MATRIX CONSTANTS (PLAN 25)
// ═══════════════════════════════════════════════════════════

export const COMPANION_TYPES = {
  Biological: { id: 'Biological', name: 'Biological (Beast / Xeno / Plant)', integrityType: 'Vitality + Health', recovery: 'Natural Healing / Medicine Skill', fuel: 'Food / Water / Sunlight', description: 'Living creature; full Vitality and Health pools' },
  Synthetic: { id: 'Synthetic', name: 'Synthetic (Drone / Automaton / Cyber-Pet)', integrityType: 'Structure Points (SP = Vitality + Health)', recovery: 'Repair / Engineering Skill', fuel: 'Energy Cells / Power Core', description: 'Mechanical unit; combines Vitality and Health into Structure, no Vitality buffer, immune to poison, disease, fatigue' },
  Metaphysical: { id: 'Metaphysical', name: 'Metaphysical (Spirit / Elemental / Familiar)', integrityType: 'Essence (Health)', recovery: 'Attune check / Master Essence Donation', fuel: 'Master\'s Essence / Ambient Magic', description: 'Ethereal entity; discorporates on 0 Essence, re-summoned with Karma' }
};

export const COMPANION_FORM_PACKAGES = [
  { id: 'canine', name: 'Canine / War Hound', type: 'Biological', size: 'Medium', baseBP: 10, bonusFeatures: ['Natural Weapons (Teeth 1d6)', 'Scent', 'Trip Attack', 'Runner'], stats: { str: 2, agi: 1, sta: 1, int: -1, wis: 1, cha: 0 } },
  { id: 'feline', name: 'Feline / Shadow Stalker', type: 'Biological', size: 'Small', baseBP: 10, bonusFeatures: ['Natural Weapons (Claws 1d4)', 'Low-Light Vision', 'Sneaky (+2 Stealth)', 'Cat\'s Luck'], stats: { str: 0, agi: 3, sta: 0, int: -1, wis: 1, cha: 0 } },
  { id: 'avian', name: 'Avian / Sky Hunter', type: 'Biological', size: 'Tiny', baseBP: 12, bonusFeatures: ['Flight (Fly 40ft)', 'Keen Senses (+2 Alertness)', 'Natural Weapons (Talons 1d4)'], stats: { str: -2, agi: 3, sta: 0, int: -1, wis: 2, cha: 0 } },
  { id: 'reptilian', name: 'Reptilian / Armored Monitor', type: 'Biological', size: 'Medium', baseBP: 10, bonusFeatures: ['Natural Armor (+2 DR)', 'Swim (30ft)', 'Hardy', 'Natural Weapons (Bite 1d6)'], stats: { str: 2, agi: 0, sta: 2, int: -2, wis: 0, cha: 0 } },
  { id: 'insectoid', name: 'Insectoid / Chitin Swarmer', type: 'Biological', size: 'Small', baseBP: 10, bonusFeatures: ['Exoskeleton (+3 DR)', 'Climber (30ft)', 'Darkvision 60ft', 'Venom'], stats: { str: 1, agi: 2, sta: 1, int: -3, wis: 0, cha: 0 } },
  { id: 'recon_drone', name: 'Recon Drone (Quad-Rotor)', type: 'Synthetic', size: 'Tiny', baseBP: 12, bonusFeatures: ['Flight (Hover/Prop 40ft)', 'Thermal Optics', 'Audio/Video Sensor Link', 'Silent Operation'], stats: { str: -3, agi: 3, sta: 0, int: 0, wis: 2, cha: -3 } },
  { id: 'security_bot', name: 'Security Automaton (Biped)', type: 'Synthetic', size: 'Medium', baseBP: 10, bonusFeatures: ['Armor Plating (DR 5)', 'Integrated Stun Taser', 'Hardened Logic', 'Guard Protocol'], stats: { str: 3, agi: 0, sta: 2, int: 0, wis: 0, cha: -2 } },
  { id: 'combat_drone', name: 'Combat Gun-Drone (Hover)', type: 'Synthetic', size: 'Small', baseBP: 12, bonusFeatures: ['Repulsor Hover (30ft)', 'Weapon Hardpoint (1 Socket)', 'Targeting Computer (+1 Atk)', 'Energy Shield (10 AP)'], stats: { str: 0, agi: 2, sta: 1, int: 0, wis: 1, cha: -3 } },
  { id: 'elemental_spirit', name: 'Elemental Wisp / Familiar', type: 'Metaphysical', size: 'Tiny', baseBP: 12, bonusFeatures: ['Incorporeal Movement', 'Energy Bolt (1d6)', 'Darkvision & Ether Sight', 'Empathic Bond'], stats: { str: -4, agi: 2, sta: 0, int: 1, wis: 2, cha: 1 } },
  { id: 'riding_mount', name: 'Heavy Riding Mount', type: 'Biological', size: 'Large', baseBP: 10, bonusFeatures: ['Fast Movement (+10ft)', 'Hauler', 'Powerful Charge', 'Mount Hardpoint (1 Mount)'], stats: { str: 4, agi: 0, sta: 3, int: -2, wis: 0, cha: 0 } }
];

export const COMPANION_FUNCTION_PACKAGES = [
  { id: 'guardian_attack', name: 'Guardian / Attack Focus', bpCost: 8, keySkills: ['Unarmed Combat (5)', 'Intimidate (3)', 'Athletics (4)'], bonusAtk: 2, bonusDR: 2 },
  { id: 'scout_recon', name: 'Scout / Recon Focus', bpCost: 8, keySkills: ['Stealth (5)', 'Alertness (5)', 'Survival (4)'], bonusStealth: 4, bonusAwareness: 3 },
  { id: 'utility_interface', name: 'Utility & Tool Interface', bpCost: 8, keySkills: ['Computers (4)', 'Engineering (4)', 'Search (4)'], bonusTech: 2 },
  { id: 'medical_injector', name: 'Medical & Trauma Support', bpCost: 8, keySkills: ['Medicine (5)', 'First Aid (5)'], bonusMed: 3 },
  { id: 'hacking_warfare', name: 'Hacking & EW Infiltrator', bpCost: 8, keySkills: ['Computers (5)', 'Disable Device (4)'], bonusHack: 3 },
  { id: 'stealth_assassin', name: 'Stealth & Ambush', bpCost: 8, keySkills: ['Stealth (6)', 'Evasion (4)', 'Melee Combat (3)'], bonusAmbush: 3 },
  { id: 'mount_transport', name: 'Mount & Heavy Transport', bpCost: 6, keySkills: ['Athletics (5)', 'Survival (4)'], bonusCapacity: 'Heavy Load' }
];

export const COMPANION_CONTROL_INTERFACES = [
  { id: 'voice_gesture', name: 'Direct Voice / Gestural (Move Action)', range: '50 ft (Voice/Sight)', description: 'Issues physical order using a Move Action' },
  { id: 'mind_link', name: 'Mind Link / Telepathic (Free Action)', range: '1 Mile', description: 'Direct telepathic tether; commands are Free Actions' },
  { id: 'data_tether', name: 'Data-Tether / Cyberdeck (Free Action)', range: '5 Miles / Mesh Grid', description: 'Encrypted tactical Wi-Fi mesh link for drones' },
  { id: 'autonomous', name: 'Autonomous Routine (No Action)', range: 'Unlimited', description: 'Executes standing behavioral algorithms independently' }
];

export const COMPANION_BOND_FEATURES = [
  { id: 'familiar_link', name: 'Familiar (Empathic Link)', bpCost: 2, effect: 'Know companion distance, direction, and emotional status anywhere on planet' },
  { id: 'mind_link', name: 'Mind Link (Telepathic)', bpCost: 3, effect: 'Silent telepathic communication; share highest Knowledge skill rank' },
  { id: 'shared_senses', name: 'Shared Senses', bpCost: 3, effect: 'See and hear through companion senses as standard action' },
  { id: 'loyal_protector', name: 'Loyal Protector (Interception)', bpCost: 3, effect: 'Adjacent companion takes hits meant for master as a reaction' }
];

// ═══════════════════════════════════════════════════════════
// INVOCATION MATRIX & SPECIAL ABILITY CONSTANTS (PLAN 26)
// ═══════════════════════════════════════════════════════════

export const SPECIAL_ABILITY_FOUNDATION_ATTRIBUTES = [
  { id: 'attr-intellect', name: 'Intellect', code: 'INT', check: 'Reason', description: 'Cognitive, psionic, and calculated supernatural architecture' },
  { id: 'attr-wisdom', name: 'Wisdom', code: 'WIS', check: 'Willpower', description: 'Intuitive, spiritual, instinctual, and willpower-driven powers' },
  { id: 'attr-charisma', name: 'Charisma', code: 'CHA', check: 'Presence', description: 'Inherent, force-of-personality, innate dragon-blood, or aura traits' },
  { id: 'attr-agility', name: 'Agility', code: 'AGI', check: 'Reflex', description: 'Kinetic reflexes, precision breath weapons, phasing evasion' },
  { id: 'attr-strength', name: 'Strength', code: 'STR', check: 'Might', description: 'Raw brute force manifestations, seismic shocks, heavy biomorphic traits' },
  { id: 'attr-stamina', name: 'Stamina', code: 'STA', check: 'Fortitude', description: 'Metabolic regeneration, bodily adaptations, toxic expulsions' }
];

export const INVOCATION_DISCIPLINES = [
  { id: 'telekinesis', name: 'Telekinesis', parent: 'Force / Kinetic', type: 'Attack / Utility', description: 'Manipulate physical matter, project kinetic blasts, create force shields' },
  { id: 'telepathy', name: 'Telepathy', parent: 'Mental / Consciousness', type: 'Sensory / Control', description: 'Read thoughts, transmit mental speech, mental compulsions, memory alteration' },
  { id: 'clairvoyance', name: 'Clairvoyance / Precognition', parent: 'Mental / Sense', type: 'Sensory', description: 'Remote scrying, danger sense, predictive combat positioning' },
  { id: 'pyrokinesis', name: 'Pyrokinesis', parent: 'Energy / Thermal', type: 'Attack', description: 'Thermal excitation, plasma arcs, superheated fire waves' },
  { id: 'chronos', name: 'Chronos-Distortion', parent: 'Dimension / Temporal', type: 'Utility / Control', description: 'Accelerate self, slow enemies, localized temporal stasis' },
  { id: 'biometabolism', name: 'Biometabolism', parent: 'Matter / Biological', type: 'Defense / Healing', description: 'Accelerated tissue repair, adrenaline surge, toxin purging, shapeshifting' },
  { id: 'void_attunement', name: 'Void-Attunement', parent: 'Entropy / Dark Energy', type: 'Attack / Control', description: 'Gravity wells, phasing incorporeal, matter dissolution, vacuum siphons' },
  { id: 'elemental_cryo', name: 'Cryokinesis', parent: 'Energy / Thermal', type: 'Attack / Control', description: 'Thermal drain, sub-zero flash freezing, ice barrier projection' },
  { id: 'elemental_voltic', name: 'Electrokinesis', parent: 'Energy / Electromagnetic', type: 'Attack', description: 'Lightning bolts, EMP disruption, electronic circuit overriding' },
  { id: 'dimension_space', name: 'Spatial Distortion (Phase/Gate)', parent: 'Dimension / Spatial', type: 'Movement', description: 'Short-range blinking, long-range wormholes, planar phasing' }
];

export const INVOCATION_BASE_DIFFICULTIES = {
  Simple: { id: 'Simple', name: 'Simple (DC 10)', dc: 10, example: 'Minor sensory effect, lighting candle, cleaning' },
  Standard: { id: 'Standard', name: 'Standard (DC 15)', dc: 15, example: 'Tier 1 combat blast, personal defense shield, basic telepathy' },
  Difficult: { id: 'Difficult', name: 'Difficult (DC 20)', dc: 20, example: 'Complex illusion, telekinesis lifting car, teleportation' },
  Extreme: { id: 'Extreme', name: 'Extreme (DC 25+)', dc: 25, example: 'Reality tearing, resurrecting dead, summoning storm' },
  OpposedFort: { id: 'OpposedFort', name: 'Opposed vs Fortitude (DC 15)', dc: 15, isOpposed: true, targetAttr: 'Stamina', example: 'Bodily transformation, necrosis, life drain' },
  OpposedRef: { id: 'OpposedRef', name: 'Opposed vs Reflex (DC 15)', dc: 15, isOpposed: true, targetAttr: 'Agility', example: 'Entanglement, kinetic grasping, gravity pull' },
  OpposedWill: { id: 'OpposedWill', name: 'Opposed vs Will (DC 15)', dc: 15, isOpposed: true, targetAttr: 'Wisdom', example: 'Mind control, telepathic domination, phantasm' }
};

export const CASTING_TIME_MODIFIERS = {
  Reaction: { id: 'Reaction', name: 'Reaction (+10 DC)', dcMod: 10, description: 'Instant defense or trigger on enemy action' },
  FreeAction: { id: 'FreeAction', name: 'Free Action (+5 DC)', dcMod: 5, description: 'Casting woven seamlessly into movement or speech' },
  MoveAction: { id: 'MoveAction', name: 'Move Action (+2 DC)', dcMod: 2, description: 'Fast casting allowing an attack in same turn' },
  StandardAction: { id: 'StandardAction', name: 'Standard Action (+0 DC)', dcMod: 0, description: 'Baseline action for combat invocations' },
  FullRound: { id: 'FullRound', name: 'Full Round Action (-2 DC)', dcMod: -2, description: 'Takes entire turn; no movement permitted' },
  Ritual: { id: 'Ritual', name: 'Ritual Casting (1 Min+) (-5 DC)', dcMod: -5, description: 'Deep meditation ritual; non-combat utility' }
};

export const INVOCATION_RANGE_MODIFIERS = {
  SelfTouch: { id: 'SelfTouch', name: 'Self / Touch (-2 DC)', dcMod: -2, description: 'Direct contact required or internal bodily effect' },
  Close: { id: 'Close', name: 'Close (25 ft + 5ft/2 Ranks) (+0 DC)', dcMod: 0, description: 'Short tactical combat distance' },
  Medium: { id: 'Medium', name: 'Medium (100 ft + 10ft/Rank) (+2 DC)', dcMod: 2, description: 'Standard mid-range engagement distance' },
  Long: { id: 'Long', name: 'Long (400 ft + 40ft/Rank) (+5 DC)', dcMod: 5, description: 'Extreme sniper / battlefield distance' },
  Sight: { id: 'Sight', name: 'Line of Sight (+10 DC)', dcMod: 10, description: 'Anywhere within visual line of sight' },
  Unlimited: { id: 'Unlimited', name: 'Unlimited / Planar (+15 DC)', dcMod: 15, description: 'Anywhere on the same planet or dimensional plane' }
};

export const INVOCATION_AOE_MODIFIERS = {
  SingleTarget: { id: 'SingleTarget', name: 'Single Target (+0 DC)', dcMod: 0, description: 'One individual creature or object' },
  LineRay: { id: 'LineRay', name: 'Line / Ray (5ft wide) (+0 DC)', dcMod: 0, description: 'Narrow beam projection along line of fire' },
  SmallBurst: { id: 'SmallBurst', name: 'Small Burst (10ft Radius) (+2 DC)', dcMod: 2, description: 'Covers a standard room or vehicle' },
  MediumBurst: { id: 'MediumBurst', name: 'Medium Burst (20ft Radius) (+5 DC)', dcMod: 5, description: 'Covers an entire hall or platoon zone' },
  Cone: { id: 'Cone', name: 'Cone (Emanation) (+5 DC)', dcMod: 5, description: 'Spreads outward from caster hands' },
  LargeBurst: { id: 'LargeBurst', name: 'Large Burst (50ft+ Radius) (+10 DC)', dcMod: 10, description: 'Massive battlefield district detonation' },
  Selective: { id: 'Selective', name: 'Selective Shaping (+5 DC)', dcMod: 5, description: 'Excludes allies from area of effect' }
};

export const INVOCATION_DURATION_MODIFIERS = {
  Instant: { id: 'Instant', name: 'Instantaneous (+0 DC)', dcMod: 0, description: 'Occurs and terminates immediately (Kinetic/Thermal blast)' },
  Concentration: { id: 'Concentration', name: 'Concentration (+0 DC)', dcMod: 0, description: 'Persists as long as caster spends Standard Actions' },
  RoundsPerLevel: { id: 'RoundsPerLevel', name: 'Rounds / Level (+2 DC)', dcMod: 2, description: 'Persists without focus for short combat encounter' },
  MinutesPerLevel: { id: 'MinutesPerLevel', name: 'Minutes / Level (+5 DC)', dcMod: 5, description: 'Persists for entire scene or infiltration operation' },
  HoursPerLevel: { id: 'HoursPerLevel', name: 'Hours / Level (+10 DC)', dcMod: 10, description: 'Long-term environmental shift or day-long buff' },
  Permanent: { id: 'Permanent', name: 'Permanent / Until Dispelled (+20 DC)', dcMod: 20, description: 'Enduring metaphysical construct or curse' }
};

export const INVOCATION_OTHER_MODIFIERS = [
  { id: 'subtle', name: 'Subtle / Silent (+5 DC)', dcMod: 5, description: 'Cast without visual or acoustic telltale signature' },
  { id: 'material_comp', name: 'Consumed Material Component (-2 DC)', dcMod: -2, description: 'Requires physical reagent or catalyst' },
  { id: 'backlash', name: 'Dangerous Backlash (-5 DC)', dcMod: -5, description: 'Failure deals direct Health damage to caster' },
  { id: 'tech_focus', name: 'Technological Focus Tool (-2 DC)', dcMod: -2, description: 'Requires specific focus hardware or psi-amp' }
];

export const SKILL_STAGES = [
  { stage: 1, name: 'Stage 1 — Novice', minRank: 1, maxRank: 5, minDC: 10, maxDC: 14, essenceCost: 0, description: 'Base learned stage: 0 Essence cost (ambient resonance)' },
  { stage: 2, name: 'Stage 2 — Trained', minRank: 6, maxRank: 10, minDC: 15, maxDC: 19, essenceCost: 0, description: 'Competent execution; standard scaling baseline' },
  { stage: 3, name: 'Stage 3 — Expert', minRank: 11, maxRank: 15, minDC: 20, maxDC: 24, essenceCost: 0, description: 'Specialized scaling and secondary tactical triggers' },
  { stage: 4, name: 'Stage 4 — Master', minRank: 16, maxRank: 20, minDC: 25, maxDC: 29, essenceCost: 0, description: 'Grand metaphysical effects with expanded radii' },
  { stage: 5, name: 'Stage 5 — Pinnacle', minRank: 21, maxRank: 30, minDC: 30, maxDC: 99, essenceCost: 0, description: 'Reality warping power; cosmic scale manifestation' }
];

export const INVOCATION_SCALING_FORMULAS = {
  energyDamage: { name: 'Energy Damage', base: '1d6', scaling: '+1d6 per Stage', formula: (s) => `${s}d6` },
  forceDamage: { name: 'Force Damage', base: '1d8', scaling: '+1d8 per Stage', formula: (s) => `${s}d8` },
  healing: { name: 'Healing Pool', base: '1d8', scaling: '+1d8 per Stage', formula: (s) => `${s}d8` },
  staticBonus: { name: 'Static Bonus', base: '+1', scaling: '+1 per Stage', formula: (s) => `+${s}` },
  damageReduction: { name: 'Damage Reduction', base: '2 DR', scaling: '+2 DR per Stage', formula: (s) => `${s * 2} DR` },
  multiTarget: { name: 'Target Count', base: '1 Target', scaling: '+1 Target per Stage', formula: (s) => `${s} Targets` },
  areaSize: { name: 'Area Radius', base: '10 ft', scaling: '+5ft or +50% per Stage', formula: (s) => `${5 + s * 5} ft` }
};

// ═══════════════════════════════════════════════════════════
// META-TECH MATRIX CONSTANTS (PLAN 27)
// ═══════════════════════════════════════════════════════════

export const META_TECH_ENHANCEMENT_TYPES = {
  Passive: { id: 'Passive', name: 'Passive Enhancement', description: 'Always-on matter/energy alteration (DC = Base Item DC + Sockets x 5)' },
  Active: { id: 'Active', name: 'Active Imbuement (Device)', description: 'Hard-coded spell in a device (DC = 15 + Invocation Rank + TL Mod)' },
  Consumable: { id: 'Consumable', name: 'Consumable / Grenade', description: 'Single-use charged item (DC = 15 + Invocation Rank - 10 Consumable Discount)' },
  Amplifier: { id: 'Amplifier', name: 'Symbiotic Amplifier', description: 'Lens multiplying caster own invocations by vehicle/structure scale' }
};

export const META_TECH_PASSIVE_CATALOG = [
  { id: 'energy_sheath', name: 'Energy Sheath', discipline: 'Energy (Elemental)', sockets: 1, dcMod: 5, targetType: 'Weapon', effect: 'Deals +1d6 Energy damage (Pyro/Cryo/Voltic)' },
  { id: 'ghost_strike', name: 'Ghost-Strike', discipline: 'Dimension (Phase)', sockets: 1, dcMod: 5, targetType: 'Weapon', effect: 'Ignores physical DR; only blocked by force fields' },
  { id: 'seeking', name: 'Seeking Micro-Correction', discipline: 'Mental (Sense)', sockets: 1, dcMod: 5, targetType: 'Weapon', effect: '+2 Attack roll bonus via micro-telekinetic nudging' },
  { id: 'vampiric', name: 'Vampiric Drain', discipline: 'Entropy (Chaos)', sockets: 1, dcMod: 5, targetType: 'Weapon', effect: 'On Critical Hit, wielder heals Health equal to 1/2 damage' },
  { id: 'soul_bound', name: 'Soul-Bound', discipline: 'Mental (Projection)', sockets: 1, dcMod: 5, targetType: 'Weapon/Armor', effect: 'Only functions for designated user; immune to disarm' },
  { id: 'featherweight', name: 'Featherweight Weave', discipline: 'Dimension (Gravity)', sockets: 1, dcMod: 5, targetType: 'Armor', effect: 'Armor counts as one weight category lighter' },
  { id: 'chameleon_weave', name: 'Chameleon Shadow Weave', discipline: 'Illusion (Shadow)', sockets: 1, dcMod: 5, targetType: 'Armor', effect: '+4 Stealth while moving, +8 when stationary' },
  { id: 'hardened_logic', name: 'Hardened Logic Lattice', discipline: 'Mental (Shield)', sockets: 1, dcMod: 5, targetType: 'Armor/Deck', effect: 'Advantage on saves vs hacking and psionic intrusion' },
  { id: 'auto_mend', name: 'Auto-Mend Matrix', discipline: 'Matter (Repair)', sockets: 1, dcMod: 5, targetType: 'Armor/Item', effect: 'Item regenerates 1d4 Structure Points (SP) per hour' }
];

export const META_TECH_SCALE_AMPLIFICATION = {
  Personal: { id: 'Personal', name: 'Personal Scale (x1)', multiplier: 1, unit: 'Socket', description: 'Standard individual magic and blast radius' },
  Large: { id: 'Large', name: 'Large Scale (x2)', multiplier: 2, unit: 'Socket', description: 'Ogre-sized magic; fireballs hit like light cannons' },
  Huge: { id: 'Huge', name: 'Vehicle Scale (x5)', multiplier: 5, unit: 'Mount', description: 'Tank-sized magic; telepathy reaches horizon' },
  Gargantuan: { id: 'Gargantuan', name: 'Siege Scale (x10)', multiplier: 10, unit: 'Mount', description: 'Siege magic; earthquakes level city blocks' },
  Titanic: { id: 'Titanic', name: 'Strategic / City Scale (x80)', multiplier: 80, unit: 'Module', description: 'Orbital/city magic; planetary weather control' }
};

export const META_TECH_SOCKET_LIMITS = {
  1: { sockets: 1, maxRank: 10, rankTier: 'Trained Effect (Ranks 1–10)' },
  2: { sockets: 2, maxRank: 20, rankTier: 'Master Effect (Ranks 11–20)' },
  3: { sockets: 3, maxRank: 30, rankTier: 'Pinnacle Effect (Ranks 21–30)' }
};

// ═══════════════════════════════════════════════════════════
// PLANETARY DESIGN MATRIX CONSTANTS (PLAN 28)
// ═══════════════════════════════════════════════════════════

export const STELLAR_CLASSES = {
  O: { id: 'O', name: 'Class O (Blue)', mass: '> 16.0 Sol', color: '#60a5fa', description: 'Violent/Young star; intense radiation, protoplanetary debris; mining outposts only' },
  B: { id: 'B', name: 'Class B (Blue-White)', mass: '2.1–16.0 Sol', color: '#93c5fd', description: 'High energy; intense UV radiation requires reflective shell shielding' },
  A: { id: 'A', name: 'Class A (White)', mass: '1.4–2.1 Sol', color: '#e2e8f0', description: 'Bright and harsh; polarized shielding, pre-garden worlds, Dyson swarms' },
  F: { id: 'F', name: 'Class F (Yellow-White)', mass: '1.04–1.4 Sol', color: '#fef08a', description: 'Prime habitation, hotter than Sol; tropical and arid biomes' },
  G: { id: 'G', name: 'Class G (Yellow)', mass: '0.8–1.04 Sol', color: '#facc15', description: 'Sol baseline; optimal for Earth-like garden and agricultural worlds' },
  K: { id: 'K', name: 'Class K (Orange)', mass: '0.45–0.8 Sol', color: '#fb923c', description: 'Long-lived, ancient civilizations, cooler and highly stable climates' },
  M: { id: 'M', name: 'Class M (Red Dwarf)', mass: '0.08–0.45 Sol', color: '#f87171', description: 'Red Dwarf; close orbits, tidal locking, flare hazards, twilight zone cities' },
  D: { id: 'D', name: 'Class D (White Dwarf / Remnant)', mass: 'Variable', color: '#cbd5e1', description: 'Remnant/dead star; ancient ruins, deep mining of exposed planetary cores' }
};

export const ORBITAL_ZONES = {
  Inner: { id: 'Inner', name: 'The Inner Zone (The Furnace)', description: 'Geomorteus / Geoplastic molten worlds, solar collection arrays, heavy shielding required' },
  BioZone: { id: 'BioZone', name: 'The Bio-Zone (Ecosphere)', description: 'Liquid water zone, Garden and Ocean worlds, prime real estate for Agri-worlds and capital hubs' },
  Outer: { id: 'Outer', name: 'The Outer Zone (The Deep / Cold Zone)', description: 'Beyond frost line; Cryo/Ice giants, hydrogen fuel skimming, secret research stations' }
};

export const PLANETARY_SIZE_CLASSES = {
  0: { size: 0, name: 'Class 0 (Asteroid / Void Belt)', km: '< 800 km', gravityTier: 'Zero-G', gVal: '< 0.1G', moveMod: 'Fly (Base)', carryMult: 10, combatMod: '-4 Attack/Skill', fallDmg: 'Muscle Atrophy (1d6 Str/wk)' },
  1: { size: 1, name: 'Class 1 (Tiny / Dwarf Planet)', km: '800–1,600 km', gravityTier: 'Low', gVal: '0.1–0.4G', moveMod: '+5 ft', carryMult: 2, combatMod: '-2 Attack, +2 Dex / -2 Str', fallDmg: '1d4/10ft' },
  2: { size: 2, name: 'Class 2 (Small / Mars-like)', km: '1,600–3,200 km', gravityTier: 'Low', gVal: '0.4–0.7G', moveMod: '+5 ft', carryMult: 2, combatMod: '-2 Attack, +2 Dex / -2 Str', fallDmg: '1d4/10ft' },
  3: { size: 3, name: 'Class 3 (Sub-Standard)', km: '3,200–4,800 km', gravityTier: 'Low', gVal: '0.7–0.8G', moveMod: '+5 ft', carryMult: 2, combatMod: '-2 Attack, +2 Dex / -2 Str', fallDmg: '1d4/10ft' },
  4: { size: 4, name: 'Class 4 (Standard Small)', km: '4,800–6,400 km', gravityTier: 'Standard', gVal: '0.8–0.9G', moveMod: 'Normal', carryMult: 1, combatMod: 'None', fallDmg: '1d6/10ft' },
  5: { size: 5, name: 'Class 5 (Standard Medium)', km: '6,400–8,000 km', gravityTier: 'Standard', gVal: '0.9–1.0G', moveMod: 'Normal', carryMult: 1, combatMod: 'None', fallDmg: '1d6/10ft' },
  6: { size: 6, name: 'Class 6 (Standard Earth-like)', km: '8,000–9,600 km', gravityTier: 'Standard', gVal: '1.0G', moveMod: 'Normal', carryMult: 1, combatMod: 'None', fallDmg: '1d6/10ft' },
  7: { size: 7, name: 'Class 7 (Standard Large)', km: '9,600–11,200 km', gravityTier: 'Standard', gVal: '1.0–1.2G', moveMod: 'Normal', carryMult: 1, combatMod: 'None', fallDmg: '1d6/10ft' },
  8: { size: 8, name: 'Class 8 (Super-Earth)', km: '11,200–12,800 km', gravityTier: 'High', gVal: '1.2–1.6G', moveMod: '-5 ft', carryMult: 0.5, combatMod: '-2 Attack, +2 Str / -2 Dex', fallDmg: '1d8/10ft (Fatigue)' },
  9: { size: 9, name: 'Class 9 (Heavy Super-Earth)', km: '12,800–14,400 km', gravityTier: 'High', gVal: '1.6–2.0G', moveMod: '-5 ft', carryMult: 0.5, combatMod: '-2 Attack, +2 Str / -2 Dex', fallDmg: '1d8/10ft (Fatigue)' },
  10: { size: 10, name: 'Class 10 (Giant / Extreme)', km: '> 14,400 km', gravityTier: 'Extreme', gVal: '> 2.0G', moveMod: 'Half Speed', carryMult: 0.25, combatMod: '-4 to all Physical Checks', fallDmg: 'Crush Dmg 1d6/min' }
};

export const ATMOSPHERE_TYPES_DETAILED = {
  0: { code: 0, name: 'Vacuum', pressure: '0.00 atm', gear: 'Vacc Suit', hazard: 'Suffocation, high radiation, 1d6 decompression dmg/rnd' },
  1: { code: 1, name: 'Trace', pressure: '< 0.1 atm', gear: 'Vacc Suit', hazard: 'CON DC 15 hourly vs fatigue; suffocation over time' },
  2: { code: 2, name: 'Very Thin', pressure: '0.1–0.4 atm', gear: 'Respirator', hazard: 'Fatigue checks in combat; projectile ranges +50%' },
  3: { code: 3, name: 'Thin', pressure: '0.4–0.7 atm', gear: 'Filter Mask', hazard: 'Breathable for natives; altitude sickness (Fatigue DC 15/hr)' },
  4: { code: 4, name: 'Standard', pressure: '0.7–1.5 atm', gear: 'None', hazard: 'Earth-normal standard breathable' },
  5: { code: 5, name: 'Dense', pressure: '1.5–2.5 atm', gear: 'None', hazard: 'High stamina; risk of the bends on rapid ascent; +4 Piloting' },
  6: { code: 6, name: 'Tainted', pressure: 'Varies', gear: 'Filter Mask', hazard: 'Pathogen/Pollutant exposure (Fort Save DC 15)' },
  7: { code: 7, name: 'Corrosive', pressure: 'Varies', gear: 'Hazmat Suit', hazard: '1d6 Acid dmg/round; degrades Armor DR by 1/min unless Sealed' },
  8: { code: 8, name: 'Exotic', pressure: 'Varies', gear: 'Air Supply', hazard: 'Unbreathable gas mixture (Methane/Chlorine); suffocation rules' },
  9: { code: 9, name: 'Dense, Tainted', pressure: 'High', gear: 'Filter Mask', hazard: 'Breathable pressure but contains allergens/pollutants' },
  10: { code: 10, name: 'Extreme Heat (10/A)', pressure: '> 120°F', gear: 'Cool Suit', hazard: '1d4 Heat dmg/10 mins (Fort Save DC 15)' },
  11: { code: 11, name: 'Extreme Cold (11/B)', pressure: '< 0°F', gear: 'Thermal Suit', hazard: '1d6 Cold dmg/10 mins (Fort Save DC 15)' },
  12: { code: 12, name: 'Insidious (12/C)', pressure: 'Varies', gear: 'Sealed Suit', hazard: 'Defeats suit seals over time; extreme corrosive hazard' }
};

export const GOVERNMENT_TYPES_DETAILED = {
  0: { code: 0, name: 'None / Anarchy', description: 'No central authority; rule by clan or gang violence (Outworlds)' },
  1: { code: 1, name: 'Corporate State', description: 'Citizenship is employment; laws are Terms of Service (Syndicate)' },
  2: { code: 2, name: 'Participating Democracy', description: 'Direct democracy; citizens vote directly via global networks' },
  3: { code: 3, name: 'Self-Perpetuating Oligarchy', description: 'Rule by specific class or minority independent of populace' },
  4: { code: 4, name: 'Representative Democracy', description: 'Elected officials create laws; standard for free worlds' },
  5: { code: 5, name: 'Feudal Technocracy', description: 'Nobility defined by tech access and bloodline (Dracon Dynasty)' },
  6: { code: 6, name: 'Captive Government', description: 'Puppet state ruled by external occupying faction' },
  7: { code: 7, name: 'Balkanized', description: 'Fragmented warring states, city-states, or competing arcologies' },
  8: { code: 8, name: 'Civil Service Bureaucracy', description: 'Ruled by government agencies and procedural law; logistics hubs' },
  9: { code: 9, name: 'Impersonal Bureaucracy', description: 'Ruled by detached algorithmic AI constructs; high efficiency, zero empathy' },
  10: { code: 10, name: 'Dictatorship (Charismatic)', description: 'Single populist leader, revolutionary hero, or warlord' },
  11: { code: 11, name: 'Dictatorship (Military)', description: 'Martial law, military rule; citizenship tied to service (Impyrium)' },
  12: { code: 12, name: 'Theocracy / Magocracy', description: 'Ruled by religious order or psychic/magical elite (Alterian)' },
  13: { code: 13, name: 'Hive / Collective', description: 'Communal hive mind; individualism suppressed (Davae / Mekan)' },
  14: { code: 14, name: 'Engineered Harmony', description: 'Algorithmic consensus or mass telepathy (Ascendancy Core)' },
  15: { code: 15, name: 'Progenitor Control', description: 'Absolute cosmic law dictated by ancient machine/god-entity' }
};

export const LAW_LEVELS_DETAILED = {
  0: { level: 0, name: 'No Law / Anarchy', bannedWeapons: 'None', bannedArmor: 'None', description: 'Complete freedom, high personal danger' },
  1: { level: 1, name: 'Minimal Law', bannedWeapons: 'Poison gas, WMDs', bannedArmor: 'Battle Dress', description: 'Frontier colony / mining outpost' },
  2: { level: 2, name: 'Low Law', bannedWeapons: 'Poison gas, WMDs, bio-agents', bannedArmor: 'Tactical Armor', description: 'Loose local enforcement' },
  3: { level: 3, name: 'Light Civil Law', bannedWeapons: 'Heavy Weapons (Machine guns, RPGs)', bannedArmor: 'All Heavy Armor', description: 'Free trade hubs' },
  4: { level: 4, name: 'Moderate Civil Law', bannedWeapons: 'Heavy weapons, military rifles', bannedArmor: 'All Heavy Armor', description: 'Standard residential colonies' },
  5: { level: 5, name: 'Moderate Law', bannedWeapons: 'Concealable Firearms (Pistols)', bannedArmor: 'All Medium & Heavy Armor', description: 'Dracon Dynasty core' },
  6: { level: 6, name: 'High Law', bannedWeapons: 'All Firearms (except stunners/shotguns)', bannedArmor: 'All Armor', description: 'Syndicate arcologies' },
  7: { level: 7, name: 'Strict Control', bannedWeapons: 'All Firearms and long bladed weapons', bannedArmor: 'All Armor', description: 'High security sectors' },
  8: { level: 8, name: 'Total Control', bannedWeapons: 'All Weapons except non-lethal', bannedArmor: 'All Armor', description: 'Syndicate executive hubs' },
  9: { level: 9, name: 'Police State', bannedWeapons: 'All Weapons (Possession is felony)', bannedArmor: 'All Armor, strict biometric IDs', description: 'Impyrium core' },
  10: { level: 10, name: 'Severe Martial Law', bannedWeapons: 'All Weapons, military checkpoints', bannedArmor: 'All Armor, curfew enforced', description: 'Impyrium fortress worlds' },
  11: { level: 11, name: 'Extreme Surveillance', bannedWeapons: 'All Weapons, neural scanning', bannedArmor: 'All Armor, restricted transit', description: 'Military black sites' },
  12: { level: 12, name: 'Totalitarian Control', bannedWeapons: 'Movement heavily restricted', bannedArmor: 'Mandatory neural implants', description: 'Mekan digital collective' },
  13: { level: 13, name: 'Thought-Crime Policing', bannedWeapons: 'Zero agency without authorization', bannedArmor: 'Mandatory surveillance', description: 'Automated labor matrices' },
  14: { level: 14, name: 'Absolute Algorithmic Law', bannedWeapons: 'Zero physical or digital deviance', bannedArmor: 'Integrated systemic state', description: 'Ascendancy harmonic matrix' },
  15: { level: 15, name: 'Absolute Suppression', bannedWeapons: 'Complete lack of personal agency', bannedArmor: 'None required (Total peace)', description: 'Progenitor vault containment' }
};

export const STARPORT_TYPES = {
  A: { code: 'A', name: 'Class A (Excellent)', facilities: 'Full Shipyard, Luxury Highport, Refined Fuel', repair: 'All capital repairs & refits' },
  B: { code: 'B', name: 'Class B (Good)', facilities: 'Good repair yards, tech shops, Refined Fuel', repair: 'Starship fabrication & upgrades' },
  C: { code: 'C', name: 'Class C (Routine)', facilities: 'Routine maintenance, Unrefined Fuel', repair: 'Basic hull & engine repairs' },
  D: { code: 'D', name: 'Class D (Poor)', facilities: 'Rough landing pads, Unrefined Fuel', repair: 'Emergency field repairs only' },
  E: { code: 'E', name: 'Class E (Frontier)', facilities: 'Marked beacon spot only, No Fuel', repair: 'No repair facilities' },
  X: { code: 'X', name: 'Class X (None / Quarantine)', facilities: 'Hazardous / Primitive / No provision', repair: 'Hostile quarantine' }
};

export const TRADE_CODE_DEFINITIONS = {
  Ag: { code: 'Ag', name: 'Agricultural', desc: 'Farming focus, optimal biosphere', exports: 'Foodstuffs, Textiles, Bio-matter, Timber', rule: 'Atmos 4-9, Hydro 4-8, Pop 5-7' },
  As: { code: 'As', name: 'Asteroid', desc: 'Mining colonies or orbital factories', exports: 'Metals, Crystals, Zero-G Tech', rule: 'Size 0, Atmos 0, Hydro 0' },
  Ba: { code: 'Ba', name: 'Barren', desc: 'Uncolonized or dead worlds', exports: 'Salvage, Artifacts', rule: 'Pop 0, Gov 0, Law 0' },
  De: { code: 'De', name: 'Desert', desc: 'Arid, < 10% surface water', exports: 'Silica, Solar Energy, Artifacts, Salt', rule: 'Hydro 0' },
  Fl: { code: 'Fl', name: 'Fluid Oceans', desc: 'Non-water liquid oceans (methane, chemical)', exports: 'Chemical Compounds, Fuel, Polymers', rule: 'Atmos 10+, Hydro 1+' },
  Ga: { code: 'Ga', name: 'Garden', desc: 'Earth-like paradise, optimal biosphere', exports: 'Luxuries, Art, Biologicals', rule: 'Size 5+, Atmos 4-9, Hydro 4-8' },
  Hi: { code: 'Hi', name: 'High Pop', desc: 'Billions in population, urban dense', exports: 'Manufactured Goods, Information', rule: 'Pop 9+' },
  Ht: { code: 'Ht', name: 'High Tech', desc: 'Advanced R&D and stellar industry (TL4+)', exports: 'Computers, Medical, Cybernetics, Ships', rule: 'TL 4+' },
  Ic: { code: 'Ic', name: 'Ice-Capped', desc: 'Frozen surface / cryogenic world', exports: 'Water (Ice), Superconductors, Cryo-Tech', rule: 'Atmos 0-1, Hydro 1+' },
  In: { code: 'In', name: 'Industrial', desc: 'High pop manufacturing center', exports: 'Weapons, Vehicles, Modules, Electronics', rule: 'Atmos (0-2, 4, 7, 9), Pop 9+' },
  Lo: { code: 'Lo', name: 'Low Pop', desc: 'Pioneer population (< 10,000)', exports: 'Raw Materials', rule: 'Pop 1-3' },
  Na: { code: 'Na', name: 'Non-Ag', desc: 'Too dry or barren for farming', exports: 'Textiles (Synthetic), Processed Ore', rule: 'Atmos 0-3, Hydro 0-3, Pop 6+' },
  Ni: { code: 'Ni', name: 'Non-Ind', desc: 'Too low pop for heavy industry', exports: 'Raw Materials', rule: 'Pop 4-6' },
  Po: { code: 'Po', name: 'Poor', desc: 'Lacking viable resources or land', exports: 'Scrap, Labor', rule: 'Atmos 2-5, Hydro 0-3' },
  Ri: { code: 'Ri', name: 'Rich / Mining', desc: 'Economic powerhouse, mineral abundance', exports: 'Luxuries, Advanced Tech, Ores, Crystals', rule: 'Atmos (6 or 8), Pop 6-8' },
  Va: { code: 'Va', name: 'Vacuum', desc: 'No atmosphere', exports: 'Salvage, Zero-G Goods, Ores', rule: 'Atmos 0' },
  Wa: { code: 'Wa', name: 'Water World', desc: '> 90% water surface', exports: 'Seafood, Hydrogen, Algae, Deuterium', rule: 'Hydro 10+' }
};

export const COMMODITIES_CATALOG = [
  { id: 'foodstuffs', name: 'Foodstuffs', sources: ['Ag', 'Ga', 'Wa'], demands: ['In', 'De', 'Ic'], baseCostPerTon: 500, notes: 'Grain, Meat, Spices, Fruit' },
  { id: 'textiles', name: 'Textiles', sources: ['Ag', 'Ni'], demands: ['In', 'Hi'], baseCostPerTon: 1000, notes: 'Cotton, Wool, Polymers, Silk' },
  { id: 'polymers', name: 'Polymers', sources: ['In', 'Fl'], demands: ['Ag', 'Ni'], baseCostPerTon: 4000, notes: 'Plastics, Synthetic Rubber' },
  { id: 'chemicals', name: 'Chemicals', sources: ['In', 'Fl'], demands: ['Ag', 'Ga'], baseCostPerTon: 5000, notes: 'Fertilizers, Acids, Fuel' },
  { id: 'metals', name: 'Metals', sources: ['As', 'Ri'], demands: ['In', 'Ht'], baseCostPerTon: 7000, notes: 'Steel, Copper, Aluminum, Titanium' },
  { id: 'machinery', name: 'Machinery', sources: ['In', 'Hi', 'Ht'], demands: ['Ag', 'Ni'], baseCostPerTon: 15000, notes: 'Tools, Parts, Robots, Vehicles' },
  { id: 'high_tech', name: 'High Tech', sources: ['Ht', 'Ri'], demands: ['Ag', 'Ni', 'Lo'], baseCostPerTon: 50000, notes: 'Computers, Sensors, Grav-Modules' },
  { id: 'luxuries', name: 'Luxuries', sources: ['Ga', 'Ri', 'Wa'], demands: ['Hi', 'Ri'], baseCostPerTon: 100000, notes: 'Art, Gems, Rare Spices, Liquor' },
  { id: 'contraband', name: 'Contraband', sources: ['Ba', 'Lo'], demands: ['Hi', 'In'], baseCostPerTon: 75000, notes: 'Weapons, Combat Drugs, AI Cores (Law 6+)' },
  { id: 'env_aid', name: 'Environmental Aid', sources: ['In', 'Ht'], demands: ['De', 'Ic', 'Va'], baseCostPerTon: 25000, notes: 'Life Support modules, Vacc Suits' }
];

export const CIVILIZATION_DOMAINS_DETAILED = {
  agriculture: { id: 'agriculture', name: 'Agriculture', stages: ['Hunting/Gathering', 'Farming', 'Advanced Farming', 'Terraforming', 'Planetary Engineering', 'Matter Synthesis'] },
  architecture: { id: 'architecture', name: 'Architecture', stages: ['Simple Structures', 'Advanced Masonry', 'Skyscrapers', 'Smart Cities', 'Advanced Space Habitats', 'Megastructures'] },
  biotechnology: { id: 'biotechnology', name: 'Biotechnology', stages: ['Herbalism', 'Pharmacology', 'Early Biotech', 'Genetic Engineering', 'Gene Editing', 'Advanced Nanobio'] },
  commerce: { id: 'commerce', name: 'Commerce', stages: ['Barter Systems', 'Currency Systems', 'Modern Financial', 'Digital Currencies', 'Post-Scarcity/Decentralized', 'Substance Interchange'] },
  communication: { id: 'communication', name: 'Communication', stages: ['Verbal/Pictograms', 'Published Text', 'Digital Networks', 'Holographic & FTL', 'Mnemonic Transceivers', 'Quantum Signaler'] },
  devices: { id: 'devices', name: 'Devices', stages: ['Simple Mechanical', 'Steam & Electric', 'Integrated Circuits', 'Robotics & AI', 'Brain-Computer Interfaces', 'Holophotonics'] },
  education: { id: 'education', name: 'Education', stages: ['Basic Survival', 'Vocational (+10)', 'Modern (+20)', 'Advanced (+30)', 'Highly Advanced (+40)', 'Cutting-Edge (+50)'] },
  energy: { id: 'energy', name: 'Energy', stages: ['Biomass/Wind', 'Fossil Fuels', 'Nuclear & Renewables', 'Fusion Power', 'Antimatter', 'Zero-Point & Dark Energy'] },
  manufacturing: { id: 'manufacturing', name: 'Manufacturing', stages: ['Handmade', 'Crafted Foundries', 'Mass Industrial', 'Nanotechnology', 'Programmable Material', 'Polymatter'] },
  materials: { id: 'materials', name: 'Materials', stages: ['Natural Materials', 'Synthetic Alloys', 'Advanced Composites', 'Metamaterials', 'Nanotech Assemblers', 'Polymatter'] },
  medicine: { id: 'medicine', name: 'Medicine', stages: ['Herbal Remedies', 'Basic Pharmacology', 'Focused Medicine', 'Augmentations & Cloning', 'Clinical Immortality', 'Retro-Genetic Reengineering'] },
  meta_sciences: { id: 'meta_sciences', name: 'Meta Sciences', stages: ['Folklore', 'Early Exploration', 'Systematic Study', 'Meta-Technology', 'Advanced Research', 'Integrated Magi-Tech'] },
  science: { id: 'science', name: 'Science', stages: ['Empirical', 'Systematic', 'Modern Disciplines', 'Advanced Theories', 'Unified Theories', 'Transcendent Theories'] },
  society: { id: 'society', name: 'Society', stages: ['Tribal', 'Early Civilizations', 'Modern Societies', 'Advanced System-Wide', 'Interconnected Galactic', 'Post-Scarcity Utopia'] },
  synthetic_intelligence: { id: 'synthetic_intelligence', name: 'Synthetic Intellect', stages: ['None', 'Reflexive Automation', 'Reactive Devices', 'Self-Aware AI', 'Artificial General Intelligence (AGI)', 'Hyper Intellect (ASI)'] },
  transportation: { id: 'transportation', name: 'Transportation', stages: ['Wagons & Boats', 'Wind & Aircraft', 'Rollers & Chemical Rockets', 'GEV & Reaction FTL', 'Force Wave & Tangent Space', 'Contra-Grav & Spatial Gateways'] },
  weaponry: { id: 'weaponry', name: 'Weaponry', stages: ['Melee & Bows', 'Gunpowder & Cannons', 'Modern Firearms & Missiles', 'Directed Energy & Railguns', 'Nanotech Force Weapons', 'Gravitonic Disintegration'] }
};

export const CIVILIZATION_ARCHETYPES = [
  { id: 'post_scarcity_utopia', name: 'Post-Scarcity Utopia', threshold: { energy: 5, society: 5, manufacturing: 5 }, description: 'Transformed by limitless energy and matter synthesis, focused on self-actualization.' },
  { id: 'militarized_technocracy', name: 'Militarized Technocracy', threshold: { weaponry: 4, transportation: 4, energy: 4 }, description: 'High defense readiness with kinetic force projectors and formidable star fleets.' },
  { id: 'bio_synthesist_collective', name: 'Bio-Synthesist Collective', threshold: { biotechnology: 4, medicine: 4, agriculture: 4 }, description: 'Living chitin cities, viral weapons, and genetic symbiosis.' },
  { id: 'cyber_corporate_grid', name: 'Cyber-Corporate Grid', threshold: { devices: 3, communication: 3, commerce: 3 }, description: 'Neon arcologies governed by automated market terms of service.' },
  { id: 'hyper_intellect_matrix', name: 'Hyper-Intellect Matrix', threshold: { synthetic_intelligence: 4, devices: 4, science: 4 }, description: 'Governed by gestalted superintelligences optimizing all civic operations.' },
  { id: 'arcane_resonant_enclave', name: 'Resonant Meta-Enclave', threshold: { meta_sciences: 3, science: 3 }, description: 'Societal infrastructure fused with psionic crystals and dimensional ether conduits.' },
  { id: 'frontier_salvage_world', name: 'Frontier Industrial Colony', threshold: {}, description: 'Rugged modular construction, industrial foundries, and utilitarian expansion.' }
];

export const ADAPTIVE_TECH_RECONFIG_TIMES = {
  3: { tl: 3, type: 'Nanotech / Biotech', time: '1 Minute (10 Rounds)', trigger: 'Move Action' },
  4: { tl: 4, type: 'Programmable Matter (Picotech)', time: '1 Full Round', trigger: 'Move Action' },
  5: { tl: 5, type: 'Polymatter / Holophotonics', time: '1 Standard Action / Instant', trigger: 'Move Action' }
};

export const SYNTHETIC_INTELLIGENCE_CONTINUUM = [
  { stage: 0, tl: 1, name: 'Mechanical Automation', description: 'Pure mechanical clockwork and cams; no data processing' },
  { stage: 1, tl: 2, name: 'Reactive Devices', description: 'Smart sensors, reflexive scripts; no persistent cognition' },
  { stage: 2, tl: 2.5, name: 'Limited Memory Assistants', description: 'Virtual assistants, contextual pattern recognition' },
  { stage: 3, tl: 3, name: 'Self-Aware Automata (Theory of Mind)', description: 'Emotional comprehension, independent initiative, personality' },
  { stage: 4, tl: 4, name: 'Artificial General Intelligence (AGI)', description: 'Indistinguishable from organic intellect; full domain synthesis' },
  { stage: 5, tl: 5, name: 'Hyper Intellect (ASI)', description: 'Trans-human cosmic intellect; planetary computation cores' }
];

export const CULTURAL_QUIRKS = [
  'Face Concealment: Masks or veils mandatory in public; showing face is severe taboo',
  'Barter Economy: Credits viewed with contempt; transactions done exclusively in goods or favors',
  'Technophilia: Cybernetics displayed as fine jewelry; unaugmented organics pitied',
  'Nocturnal: Society active exclusively during night hours to avoid planetary radiation',
  'Dueling Code: All legal disputes resolved through formalized non-lethal combat',
  'Caste Colors: Garment color strictly dictates administrative and civil caste',
  'Ancestor Worship: All civic decisions made by consulting AI consciousness constructs of elders',
  'Silence Vow: Public speech reserved for aristocracy; commoners communicate via sign language',
  'Xenophobia: Severe societal distrust of un-cataloged alien sophont species',
  'Communal Property: Personal theft is unrecognized; borrowing without notice is standard practice',
  'Ritual Scarification: Marks of status and achievement earned through rigorous trials',
  'The Debt Clock: Public digital displays track each citizen personal net societal favor rating',
  'No Permanent Residence: Population cycles through communal modular habitats on annual schedules',
  'Genetic Purity Testing: Mandatory biometric scans at all transit checkpoints to prevent drift',
  'Weather Rituals: Technological terraforming accompanied by sacred ceremonial observances',
  'Sound Silence: Continuous low-frequency harmonic resonance hum piped into all public plazas'
];


// ═══════════════════════════════════════════════════════════
// EXPERIENCE & AWARD POINTS (AP) SYSTEM (CANONICAL RULES)
// ═══════════════════════════════════════════════════════════

export const EXPERIENCE_RULES = {
  EXCHANGE_RATE: {
    apToCp: 1, // 1 AP = 1 CP
    apToBp: 1, // backward compatibility alias
    formula: '1 AP = 1 Character Point (CP)',
    description: 'Award Points (AP) are spent in the same manner as Character Points in character creation, on a 1-for-1 basis.'
  },
  INCREMENT_RULE: {
    maxIncrementPerAward: 1,
    isCritical: true,
    description: 'Abilities, skills, or other traits may ONLY HAVE A 1 POINT INCREMENT OF ANY SCORE PER EXPERIENCE AWARD. A player cannot dump multiple AP into a single skill or trait instantly.'
  },
  PACING: {
    standardSessionMin: 1,
    standardSessionMax: 3,
    description: 'Standard Award: 1-3 Award Points (AP) per Session based on pacing and achievements.'
  },
  STORY_AWARDS: {
    CHAPTER_COMPLETION: {
      id: 'chapter_completion',
      name: 'Chapter Completion',
      minAP: 5,
      maxAP: 10,
      description: 'Awarded when a chapter or major story arc is completed. Based on the steps and complexity involved, longer and complex chapters awarding more points. Opportunity for character development and reflection during downtime.'
    },
    OVERCOMING_GOAL_VILLAIN_PLOT: {
      id: 'overcoming_goal_villain_plot',
      name: 'Overcoming Worthy Goal, Villain, or Plot',
      minAP: 1,
      maxAP: 3,
      description: 'Recognizes achievements in overcoming significant obstacles, defeating powerful villains, or unraveling complex plots. Storyline elements, may be awarded by session.'
    }
  },
  SESSION_AWARDS: {
    PROPER_GAME_SESSION: {
      id: 'proper_game_session',
      name: 'Proper Game Session & Focused on Game',
      minAP: 0,
      maxAP: 2,
      description: 'Recognizes players who approach the game with a focus on gameplay mechanics and strategy (combat encounters, puzzles, game-related challenges).'
    },
    ROLEPLAYING_IN_CHARACTER: {
      id: 'roleplaying_in_character',
      name: 'Roleplaying in Character',
      minAP: 0,
      maxAP: 2,
      description: 'Given to players who immerse themselves in characters\' personalities and motivations, actively embodying them during roleplaying interactions.'
    }
  },
  EPIC_AWARDS: {
    EPIC_ACTION_OR_IDEA: {
      id: 'epic_action_or_idea',
      name: 'Epic Actions, Good Ideas & Stumping the Architect',
      minAP: 1,
      maxAP: 5,
      isAdHoc: true,
      description: 'Exceptional moments during gameplay: epic actions that turn the tide of battle, creative solutions to problems, or surprising the GM with unexpected twists.'
    }
  },
  EXPERIENCE_DEBT: {
    revivificationDebt: 5,
    repaymentRate: 1, // 1 AP pays off 1 Experience Debt
    description: 'A revived character suffers a -5 Experience Debt due to trauma. Settled as a reduction in traits or paid down 1-for-1 from future AP awards before new traits are advanced.'
  },
  SPENDING_COSTS: {
    SKILL_RANK: { costAP: 1, maxIncrement: 1, label: 'Skill Rank' },
    ATTRIBUTE_CHECK: { costAP: 1, maxIncrement: 1, label: 'Attribute Check (+1)' },
    PRIMARY_ATTRIBUTE: { costAP: 5, maxIncrement: 1, label: 'Primary Attribute (+1)' },
    FEATURE: { costAP: 3, recommendedCostAP: 2, maxIncrement: 1, label: 'Feature / Feat' },
    SPECIAL_ABILITY: { costAP: 5, maxIncrement: 1, label: 'Special Ability' },
    AWAKENED_DISCIPLINE: { costAP: 5, maxIncrement: 1, label: 'Awakened Discipline' },
    INVOCATION: { costAPMin: 1, costAPMax: 3, maxIncrement: 1, label: 'Invocation' },
    SPECIALIZATION: { costAP: 1, maxIncrement: 1, label: 'Specialization (+1 Rank)' },
    VITALITY: { costAP: 1, pointsPerAP: 5, maxIncrement: 5, label: 'Bonus Vitality (+5)' },
    HEALTH: { costAP: 1, pointsPerAP: 5, maxIncrement: 5, label: 'Bonus Health (+5)' }
  }
};
