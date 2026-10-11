import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const speciesDir = path.resolve(__dirname, '../src/data/omnicortex/species');

export const SPECIES_RECOMMENDATIONS_MAP = {
  // ==========================================
  // 1. Aeld Lineage (5 Species)
  // ==========================================
  'species-aeld-celestine': {
    recommended_factions: ['The Alterian Enclave', 'The Silvermoon Vanguard', 'The Ascendancy'],
    recommended_origins: ['Enlightened', 'Research', 'Urban'],
    recommended_occupations: ['Representative', 'Scholar', 'Adept', 'Specialist'],
    keywords: 'arcane-affinity, magi-tech, diplomacy, long-view, high-refinement, scholarly, mediation, graceful',
    negative_keywords: 'brute-force, heavy-armor, reckless, technophile-cybernetics, short-sighted'
  },
  'species-aeld-doppelganger': {
    recommended_factions: ['The Alterian Enclave', 'The Syndicate', 'Criminal Faction Template'],
    recommended_origins: ['Urban', 'Spacer', 'Colony'],
    recommended_occupations: ['Agent', 'Criminal', 'Scout', 'Entertainer'],
    keywords: 'shapechanger, mimicry, espionage, stealth, deceptive, adaptive, infiltrator, elusive',
    negative_keywords: 'inflexible, heavy-armor, conspicuous, loud, static-form'
  },
  'species-aeld-draconian': {
    recommended_factions: ['Dracon Dynasty', 'The Alterian Enclave', 'Military Faction Template'],
    recommended_origins: ['Militaristic', 'Enlightened', 'Hostile'],
    recommended_occupations: ['Soldier', 'Adept', 'Representative', 'Specialist'],
    keywords: 'draconic, noble, armored-scales, martial-discipline, honor-bound, breath-weapon, feudal',
    negative_keywords: 'subterfuge, frail, cowardly, dishonorable, primitive'
  },
  'species-aeld-nocturne': {
    recommended_factions: ['Kovian Tribunal', 'The Alterian Enclave', 'The Syndicate'],
    recommended_origins: ['Hostile', 'Urban', 'Militaristic'],
    recommended_occupations: ['Agent', 'Soldier', 'Adept', 'Specialist'],
    keywords: 'umbral, shadow-magic, covert, lethal, discipline, stealth, night-vision, supremacist',
    negative_keywords: 'gregarious, daylight-dependent, naive, diplomatic-mediator, reckless'
  },
  'species-aeld-vajar': {
    recommended_factions: ['Vajar Tribes', 'The Alterian Enclave', 'Coalition of Independent Worlds'],
    recommended_origins: ['Hostile', 'Agricultural', 'Colony'],
    recommended_occupations: ['Scout', 'Soldier', 'Drifter', 'Adept'],
    keywords: 'feral, primal, tracker, wilderness, survivalist, predator, agile, tribal',
    negative_keywords: 'high-tech, urbanite, heavy-armor, bureaucratic, academic'
  },

  // ==========================================
  // 2. Asi / Fey Lineages (8 Species)
  // ==========================================
  'species-asi-ferren': {
    recommended_factions: ['Elven Providence', 'Coalition of Independent Worlds', 'Environmental Faction Template'],
    recommended_origins: ['Agricultural', 'Hostile', 'Colony'],
    recommended_occupations: ['Scout', 'Entertainer', 'Drifter'],
    keywords: 'arboreal, nimble, climber, canopy, playful, tail-agility, wilderness, nature',
    negative_keywords: 'heavy-armor, industrial, cybernetics, polluter, sedentary'
  },
  'species-asi-fey-base': {
    recommended_factions: ['Elven Providence', 'The Alterian Enclave', 'Supernatural Faction Template'],
    recommended_origins: ['Enlightened', 'Leisure', 'Hostile'],
    recommended_occupations: ['Adept', 'Entertainer', 'Drifter'],
    keywords: 'fey, immortal, glamour, illusions, flight, radiance, nature-magic, trickster',
    negative_keywords: 'cold-iron, heavy-machinery, industrial, blunt, scientific-rigor'
  },
  'species-asi-frellin': {
    recommended_factions: ['The Entari Combine', 'Coalition of Independent Worlds', 'Elven Providence'],
    recommended_origins: ['Colony', 'Spacer', 'Enlightened'],
    recommended_occupations: ['Scout', 'Representative', 'Adept'],
    keywords: 'avian, feathered, telepathic, flight, messenger, wind-currents, sensory, tiny',
    negative_keywords: 'subterranean, heavy-armor, claustrophile, brute-force, slow'
  },
  'species-asi-koban': {
    recommended_factions: ['Elven Providence', 'Coalition of Independent Worlds'],
    recommended_origins: ['Agricultural', 'Colony', 'Hostile'],
    recommended_occupations: ['Scout', 'Builder', 'Drifter'],
    keywords: 'shifter, camouflage, burrower, adaptable, nimble, wilderness, nature-communion',
    negative_keywords: 'conspicuous, rigid, metallic-cybernetics, heavy-weapons'
  },
  'species-asi-sigal': {
    recommended_factions: ['The Alterian Enclave', 'The Ascendancy', 'Sentient Intelligence Faction Template'],
    recommended_origins: ['Enlightened', 'Research', 'Spacer'],
    recommended_occupations: ['Scholar', 'Adept', 'Specialist'],
    keywords: 'elemental, photon, telekinesis, high-intellect, non-corporeal, eidetic-memory, radiant',
    negative_keywords: 'melee-combat, physical-strength, heavy-armor, primitive, mud'
  },
  'species-asi-tozen': {
    recommended_factions: ['Elven Providence', 'Coalition of Independent Worlds'],
    recommended_origins: ['Agricultural', 'Colony', 'Enlightened'],
    recommended_occupations: ['Scout', 'Soldier', 'Scholar'],
    keywords: 'centauroid, fleet-footed, astronomy, archery, open-steppes, proud, nomadic',
    negative_keywords: 'indoor-confined, starship-ductwork, urbanite, cramped-cockpits'
  },
  'species-asi-whisper': {
    recommended_factions: ['The Alterian Enclave', 'The Syndicate', 'Supernatural Faction Template'],
    recommended_origins: ['Enlightened', 'Urban', 'Spacer'],
    recommended_occupations: ['Agent', 'Adept', 'Scout'],
    keywords: 'ethereal, intangible, light-form, phantasmal, stealth, infiltration, soundless',
    negative_keywords: 'loud, heavy-infantry, conspicuous, physical-labor'
  },
  'species-asi-wildling': {
    recommended_factions: ['Vajar Tribes', 'Environmental Faction Template', 'Coalition of Independent Worlds'],
    recommended_origins: ['Hostile', 'Agricultural'],
    recommended_occupations: ['Scout', 'Soldier', 'Drifter'],
    keywords: 'totem-shifter, apex-predator, feral, pack-bond, wilderness, primal-instinct',
    negative_keywords: 'urban-court, high-technology, starship-bridge, academic-formal'
  },

  // ==========================================
  // 3. Aulurans (4 Species)
  // ==========================================
  'species-auluran-dar': {
    recommended_factions: ['Auluran Clans', 'Coalition of Independent Worlds', 'Mercenary Faction Template'],
    recommended_origins: ['Hostile', 'Colony', 'Research'],
    recommended_occupations: ['Scout', 'Soldier', 'Adept', 'Specialist'],
    keywords: 'feline, hunter, arboreal, living-symbiotes, biotechnology, prehensile, agile, psychic',
    negative_keywords: 'clumsy, heavy-armor, aquatic, cybernetic-dependent, pacifist'
  },
  'species-auluran-graa': {
    recommended_factions: ['Auluran Clans', 'Mercenary Faction Template', 'Military Faction Template'],
    recommended_origins: ['Hostile', 'Colony'],
    recommended_occupations: ['Soldier', 'Scout', 'Drifter'],
    keywords: 'quadruped, beast-juggernaut, crushing-power, apex-carnivore, charge, natural-armor',
    negative_keywords: 'fine-manipulation, marksmanship, tool-crafting, academic, urban-formal'
  },
  'species-auluran-koda': {
    recommended_factions: ['Auluran Clans', 'The Entari Combine', 'Coalition of Independent Worlds'],
    recommended_origins: ['Colony', 'Industrial', 'Hostile'],
    recommended_occupations: ['Builder', 'Soldier', 'Specialist'],
    keywords: 'feline-artisan, bio-architect, chitin-breeder, digitigrade, dense-muscle, athletic',
    negative_keywords: 'sedentary, fragile, metallic-machinery, technophobia'
  },
  'species-auluran-prokos': {
    recommended_factions: ['Auluran Clans', 'Coalition of Independent Worlds', 'The Outworlds'],
    recommended_origins: ['Hostile', 'Colony', 'Spacer'],
    recommended_occupations: ['Scout', 'Drifter', 'Specialist'],
    keywords: 'cryo-adapted, biform-shifter, tundra-hunter, dual-form, thermal-fur, resilient',
    negative_keywords: 'heat-intolerant, desert-dweller, static-form, fragile'
  },

  // ==========================================
  // 4. Engineered Humans / Gen-E (8 Species)
  // ==========================================
  'species-gene-aquatican': {
    recommended_factions: ['The Syndicate', 'Corporate Faction Template', 'Coalition of Independent Worlds'],
    recommended_origins: ['Aquatic', 'Research', 'Industrial'],
    recommended_occupations: ['Soldier', 'Specialist', 'Agent', 'Scout'],
    keywords: 'pelagic, gilled, deep-trench, aquatic-combat, pressure-hardened, underwater-sabotage',
    negative_keywords: 'dehydration, desert-wasteland, fire, clumsy-on-land'
  },
  'species-gene-base': {
    recommended_factions: ['The Syndicate', 'The Ascendancy', 'Genetic Engineering Faction Template'],
    recommended_origins: ['Research', 'Urban', 'Colony'],
    recommended_occupations: ['Specialist', 'Citizen', 'Soldier', 'Representative'],
    keywords: 'transhuman, genetic-optimization, disease-immunity, clean-genome, adaptive, athletic',
    negative_keywords: 'primitive, bio-purist, degenerative-defects, superstition'
  },
  'species-gene-chimera': {
    recommended_factions: ['The Syndicate', 'The Outworlds', 'Mercenary Faction Template'],
    recommended_origins: ['Research', 'Hostile', 'Colony'],
    recommended_occupations: ['Soldier', 'Scout', 'Drifter'],
    keywords: 'gene-spliced, animalistic-traits, thermal-vision, natural-weapons, hardy, predator-reflex',
    negative_keywords: 'high-society-diplomat, pureblood-supremacy, delicate'
  },
  'species-gene-davae': {
    recommended_factions: ['The Syndicate', 'The Ascendancy', 'Sentient Intelligence Faction Template'],
    recommended_origins: ['Research', 'Enlightened', 'Urban'],
    recommended_occupations: ['Scholar', 'Adept', 'Specialist'],
    keywords: 'hive-psion, neural-mesh, cranial-expansion, bio-computing, telepathic-network',
    negative_keywords: 'physical-labor, brute-force, solitary-isolation, psionic-null'
  },
  'species-gene-digon': {
    recommended_factions: ['Impyrium Dominion', 'Radiant Impyrium', 'Military Faction Template'],
    recommended_origins: ['Militaristic', 'Hostile', 'Industrial'],
    recommended_occupations: ['Soldier', 'Builder', 'Specialist'],
    keywords: 'shock-trooper, reinforced-skeleton, heavy-infantry, high-pain-threshold, boarding-party',
    negative_keywords: 'subtle-espionage, delicate-craft, diplomacy, psionics, agile-flight'
  },
  'species-gene-impyrium-psion': {
    recommended_factions: ['Impyrium Dominion', 'Radiant Impyrium'],
    recommended_origins: ['Enlightened', 'Militaristic', 'Urban'],
    recommended_occupations: ['Adept', 'Agent', 'Representative'],
    keywords: 'inquisitor, telepathy, precognition, imperial-authority, mental-domination, battle-psion',
    negative_keywords: 'physical-labor, anti-authoritarian, tech-hack, primitive'
  },
  'species-gene-impyrium-regi': {
    recommended_factions: ['Impyrium Dominion', 'Radiant Impyrium'],
    recommended_origins: ['Urban', 'Enlightened', 'Leisure'],
    recommended_occupations: ['Representative', 'Scholar', 'Citizen'],
    keywords: 'high-blood, aristocracy, imperial-regalia, command-aura, intellect, gene-perfection',
    negative_keywords: 'manual-labor, dirty-wastelands, subservient, scavenger'
  },
  'species-gene-janissary': {
    recommended_factions: ['The Syndicate', 'Corporate Faction Template', 'Mercenary Faction Template'],
    recommended_origins: ['Research', 'Militaristic', 'Urban'],
    recommended_occupations: ['Soldier', 'Agent', 'Specialist'],
    keywords: 'cloned-enforcer, vat-grown, adrenal-boost, targeter-implant, tactical-discipline, obedience',
    negative_keywords: 'creative-freethinking, rebellious, pacifist, emotional-expression'
  },

  // ==========================================
  // 5. Humans: Core & Variants (17 Species)
  // ==========================================
  'species-human-aquarian': {
    recommended_factions: ['The Syndicate', 'Coalition of Independent Worlds'],
    recommended_origins: ['Aquatic', 'Colony'],
    recommended_occupations: ['Scout', 'Specialist', 'Citizen'],
    keywords: 'aquatic, hydro-thrusters, diving, coastal-settler, pelagic-life',
    negative_keywords: 'arid-desert, heavy-foundry, claustrophobia'
  },
  'species-human-argynt': {
    recommended_factions: ['The Outworlds', 'Coalition of Independent Worlds'],
    recommended_origins: ['Hostile', 'Industrial'],
    recommended_occupations: ['Builder', 'Soldier', 'Drifter'],
    keywords: 'radiation-immune, colloidal-silver, heavy-worlder, resilient, miner',
    negative_keywords: 'fragile, luxury, delicate, light-gravity'
  },
  'species-human-base': {
    recommended_factions: ['The Ascendancy', 'The Entari Combine', 'Coalition of Independent Worlds', 'The Syndicate', 'Impyrium Dominion'],
    recommended_origins: ['Colony', 'Urban', 'Spacer', 'Agricultural'],
    recommended_occupations: ['Citizen', 'Soldier', 'Merchant', 'Scholar', 'Scout'],
    keywords: 'adaptable, ubiquitous, ambitious, versatile, tenacious, core-lineage',
    negative_keywords: 'environmental-extremophile, biologically-inflexible'
  },
  'species-human-bdren': {
    recommended_factions: ['The Outworlds', 'Kovian Tribunal'],
    recommended_origins: ['Hostile', 'Colony', 'Spacer'],
    recommended_occupations: ['Scout', 'Agent', 'Specialist'],
    keywords: 'nocturnal, twilight-world, tapetum-eyes, low-light-reflex, dark-adapted',
    negative_keywords: 'blinding-sunlight, open-plains, desert-heat'
  },
  'species-human-brae': {
    recommended_factions: ['The Entari Combine', 'The Outworlds'],
    recommended_origins: ['Spacer', 'Industrial', 'Urban'],
    recommended_occupations: ['Builder', 'Merchant', 'Criminal'],
    keywords: 'diminutive, generational-ship, conduit-crawler, compact-tinkerer, nimble',
    negative_keywords: 'heavy-combat, towering, brute-force'
  },
  'species-human-changeling': {
    recommended_factions: ['The Syndicate', 'The Alterian Enclave', 'Criminal Faction Template'],
    recommended_origins: ['Urban', 'Colony'],
    recommended_occupations: ['Agent', 'Entertainer', 'Criminal'],
    keywords: 'hybrid-shifter, persona-mimic, social-chameleon, subtle, disguise',
    negative_keywords: 'obvious, honest, rigid, static-features'
  },
  'species-human-cyberform': {
    recommended_factions: ['The Syndicate', 'Technological Faction Template'],
    recommended_origins: ['Industrial', 'Urban', 'Research'],
    recommended_occupations: ['Specialist', 'Builder', 'Soldier'],
    keywords: 'cyborg, neural-socket, optic-hub, titanium-replacement, high-tech, nanite-repair',
    negative_keywords: 'nature-magic, emp-vulnerable, biological-purist, low-tech'
  },
  'species-human-danai': {
    recommended_factions: ['The Ascendancy', 'The Syndicate'],
    recommended_origins: ['Urban', 'Research', 'Colony'],
    recommended_occupations: ['Representative', 'Specialist', 'Scholar'],
    keywords: 'empathic-diplomat, bio-resonance, gentle-glow, mediator, hybrid-psion',
    negative_keywords: 'brutality, isolation, violent-outburst'
  },
  'species-human-draconic': {
    recommended_factions: ['Dracon Dynasty', 'Military Faction Template'],
    recommended_origins: ['Militaristic', 'Enlightened'],
    recommended_occupations: ['Soldier', 'Representative', 'Specialist'],
    keywords: 'dragon-blood, feudal-knight, iridescent-scales, heat-hardened, commanding',
    negative_keywords: 'cowardly, dishonorable, treacherous'
  },
  'species-human-dwerg': {
    recommended_factions: ['The Entari Combine', 'The Outworlds'],
    recommended_origins: ['Industrial', 'Spacer', 'Hostile'],
    recommended_occupations: ['Builder', 'Soldier', 'Merchant'],
    keywords: 'asteroid-miner, forge-craft, dense-bone, foundry-armor, tenacious, blacksmith',
    negative_keywords: 'graceful-aerial, swimming, frail'
  },
  'species-human-kheen': {
    recommended_factions: ['The Entari Combine', 'The Alterian Enclave'],
    recommended_origins: ['Urban', 'Enlightened', 'Colony'],
    recommended_occupations: ['Representative', 'Merchant', 'Scholar'],
    keywords: 'half-aeld, cultural-bridge, diplomatic-emissary, refined, longevity, harmony',
    negative_keywords: 'feral, brute-force, primitive-tribal'
  },
  'species-human-lin': {
    recommended_factions: ['Environmental Faction Template', 'Coalition of Independent Worlds'],
    recommended_origins: ['Agricultural', 'Hostile'],
    recommended_occupations: ['Scout', 'Adept', 'Drifter'],
    keywords: 'canopy-dweller, symbiotic-flora, arboreal-tail, green-worlder, athletic',
    negative_keywords: 'sterile-metal, deep-space, high-gravity'
  },
  'species-human-nian': {
    recommended_factions: ['The Outworlds', 'Mercenary Faction Template'],
    recommended_origins: ['Hostile', 'Colony'],
    recommended_occupations: ['Soldier', 'Drifter', 'Scout'],
    keywords: 'calcified-armor, abrasive-badlands, rugged-survivor, heavy-slugthrower, tough',
    negative_keywords: 'aristocratic, delicate, indoor-sedentary'
  },
  'species-human-premian': {
    recommended_factions: ['The Syndicate', 'Corporate Faction Template'],
    recommended_origins: ['Urban', 'Leisure'],
    recommended_occupations: ['Merchant', 'Representative', 'Citizen'],
    keywords: 'high-finance, silver-tongue, corporate-mogul, patron-patronage, boardroom',
    negative_keywords: 'wilderness-scavenger, destitute, hermit'
  },
  'species-human-rautha': {
    recommended_factions: ['The Syndicate', 'Mercenary Faction Template'],
    recommended_origins: ['Urban', 'Hostile', 'Militaristic'],
    recommended_occupations: ['Scout', 'Agent', 'Soldier'],
    keywords: 'feline-reflexes, parkour, urban-predator, stealth-recon, desert-hunter',
    negative_keywords: 'slow, clumsy, heavy-armor, aquatic'
  },
  'species-human-risakin': {
    recommended_factions: ['The Outworlds', 'Industrial Faction Template'],
    recommended_origins: ['Hostile', 'Industrial'],
    recommended_occupations: ['Builder', 'Soldier', 'Drifter'],
    keywords: 'heavy-gravity, giant-human, hydraulic-power, massive-reach, crusher',
    negative_keywords: 'tight-ducts, stealth, tiny, agile-aerial'
  },
  'species-human-varen': {
    recommended_factions: ['The Ascendancy', 'The Alterian Enclave'],
    recommended_origins: ['Spacer', 'Research', 'Enlightened'],
    recommended_occupations: ['Scholar', 'Adept', 'Specialist'],
    keywords: 'stargate-navigator, spatial-slipstream, awakened-teleport, gate-kin, cosmic-recall',
    negative_keywords: 'ground-bound, claustrophobic, tech-phobic'
  },

  // ==========================================
  // 6. Independent Xenotypes (18 Species)
  // ==========================================
  'species-awakened-animal': {
    recommended_factions: ['Coalition of Independent Worlds', 'Environmental Faction Template'],
    recommended_origins: ['Agricultural', 'Hostile', 'Colony'],
    recommended_occupations: ['Scout', 'Drifter', 'Citizen'],
    keywords: 'uplifted-beast, quadruped-speed, acute-senses, pack-instinct, companion-fighter',
    negative_keywords: 'fine-tools, speech-inhibited, corporate-executive'
  },
  'species-caprian': {
    recommended_factions: ['The Alterian Enclave', 'Coalition of Independent Worlds'],
    recommended_origins: ['Hostile', 'Colony', 'Agricultural'],
    recommended_occupations: ['Scout', 'Soldier', 'Specialist'],
    keywords: 'caprine, mountaineer, ungulate-legs, high-gravity, perimeter-warden, horns',
    negative_keywords: 'flat-plains, oceanic, slow, uncoordinated'
  },
  'species-jorni': {
    recommended_factions: ['Coalition of Independent Worlds', 'Mercenary Faction Template'],
    recommended_origins: ['Hostile', 'Colony'],
    recommended_occupations: ['Soldier', 'Scout', 'Drifter'],
    keywords: 'reptilian, rapid-regeneration, swamp-hunter, severed-limb-regrowth, hardy',
    negative_keywords: 'arid-desert, delicate, fragile'
  },
  'species-kannid': {
    recommended_factions: ['Coalition of Independent Worlds', 'The Entari Combine', 'Military Faction Template'],
    recommended_origins: ['Hostile', 'Colony', 'Militaristic'],
    recommended_occupations: ['Soldier', 'Scout', 'Agent'],
    keywords: 'canine-humanoid, tracker, loyal-bodyguard, scent-master, pack-tactics, guardian',
    negative_keywords: 'treason, lone-wolf, stealth-disguise'
  },
  'species-kizin': {
    recommended_factions: ['The Entari Combine', 'The Syndicate', 'Coalition of Independent Worlds'],
    recommended_origins: ['Urban', 'Colony', 'Research'],
    recommended_occupations: ['Agent', 'Scholar', 'Scout'],
    keywords: 'feline-intellect, forensic-investigator, stealth, deductive, agile, curious',
    negative_keywords: 'brute-force, heavy-armor, reckless'
  },
  'species-kongi': {
    recommended_factions: ['Coalition of Independent Worlds', 'Environmental Faction Template'],
    recommended_origins: ['Hostile', 'Agricultural', 'Industrial'],
    recommended_occupations: ['Builder', 'Soldier', 'Scout'],
    keywords: 'simian-colossus, canopy-climber, prehensile-limbs, crushing-biceps, mega-jungle',
    negative_keywords: 'tiny-spaces, aerial-glide, frail'
  },
  'species-mobula': {
    recommended_factions: ['Coalition of Independent Worlds', 'Alien Faction Template'],
    recommended_origins: ['Aquatic', 'Spacer', 'Hostile'],
    recommended_occupations: ['Scout', 'Drifter', 'Specialist'],
    keywords: 'manta-biform, aerial-glide, sonar-echolocation, pelagic-dive, winged, gas-giant',
    negative_keywords: 'confined-corridors, arid-desert, subterranean'
  },
  'species-mondi': {
    recommended_factions: ['The Alterian Enclave', 'The Ascendancy', 'Sentient Intelligence Faction Template'],
    recommended_origins: ['Enlightened', 'Research', 'Spacer'],
    recommended_occupations: ['Scholar', 'Adept', 'Representative'],
    keywords: 'harmonic-telepathy, floating-levitation, luminous, ancient-wisdom, high-psionics',
    negative_keywords: 'physical-brawling, dirt, manual-labor, heavy-armor'
  },
  'species-orll-base': {
    recommended_factions: ['Coalition of Independent Worlds', 'The Outworlds', 'Mercenary Faction Template'],
    recommended_origins: ['Hostile', 'Militaristic'],
    recommended_occupations: ['Soldier', 'Drifter', 'Scout'],
    keywords: 'insectoid-berserker, brutal-strength, chitin-hide, combat-rage, scrap-weapons',
    negative_keywords: 'diplomacy, delicate-tech, scholar, peaceful'
  },
  'species-orll-graor': {
    recommended_factions: ['Coalition of Independent Worlds', 'Environmental Faction Template'],
    recommended_origins: ['Hostile', 'Agricultural'],
    recommended_occupations: ['Scout', 'Soldier', 'Adept'],
    keywords: 'photosynthetic-orll, sun-healer, green-chitin, solar-canopy, natural-resilience',
    negative_keywords: 'subterranean, dark-space, void'
  },
  'species-plasm': {
    recommended_factions: ['Coalition of Independent Worlds', 'Alien Faction Template'],
    recommended_origins: ['Hostile', 'Industrial', 'Colony'],
    recommended_occupations: ['Specialist', 'Drifter', 'Agent'],
    keywords: 'amorphous-ooze, vent-flow, shape-molding, fluid-regeneration, acid-immunity',
    negative_keywords: 'rigid-armor, fixed-clothing, skeletal'
  },
  'species-praeti': {
    recommended_factions: ['The Entari Combine', 'Coalition of Independent Worlds', 'The Ascendancy'],
    recommended_origins: ['Colony', 'Spacer', 'Militaristic'],
    recommended_occupations: ['Scout', 'Soldier', 'Representative'],
    keywords: 'avian-winged, eagle-eyes, marksman-sniper, aerial-supremacy, plumage, vantage',
    negative_keywords: 'subterranean, water-logging, cramped'
  },
  'species-qeric': {
    recommended_factions: ['The Entari Combine', 'Coalition of Independent Worlds'],
    recommended_origins: ['Agricultural', 'Colony', 'Leisure'],
    recommended_occupations: ['Entertainer', 'Merchant', 'Scout'],
    keywords: 'patagial-glider, tiny-charmer, canopy-scamper, charismatic, acrobatic, friendly',
    negative_keywords: 'heavy-infantry, slugthrower, terrifying'
  },
  'species-sefalin': {
    recommended_factions: ['The Syndicate', 'The Entari Combine', 'Coalition of Independent Worlds'],
    recommended_origins: ['Aquatic', 'Research', 'Industrial'],
    recommended_occupations: ['Scholar', 'Specialist', 'Builder'],
    keywords: 'cephalopod-humanoid, chromatophore-skin, multi-tentacle, trench-genius, bio-tech',
    negative_keywords: 'arid-desert, rigid, clumsy'
  },
  'species-thorn': {
    recommended_factions: ['Environmental Faction Template', 'The Alterian Enclave', 'Coalition of Independent Worlds'],
    recommended_origins: ['Hostile', 'Agricultural', 'Enlightened'],
    recommended_occupations: ['Adept', 'Scout', 'Drifter'],
    keywords: 'plant-humanoid, briar-armor, photosynthetic-sap, root-communion, verdant',
    negative_keywords: 'fire, industrial-pollution, herbicide'
  },
  'species-truldan': {
    recommended_factions: ['Coalition of Independent Worlds', 'The Outworlds'],
    recommended_origins: ['Aquatic', 'Hostile', 'Colony'],
    recommended_occupations: ['Scout', 'Drifter', 'Agent'],
    keywords: 'amphibious, chameleon-camouflage, prehensile-tongue, mangrove-stalker, regeneration',
    negative_keywords: 'dry-desert, heavy-metal, fire'
  },
  'species-vassoth': {
    recommended_factions: ['Coalition of Independent Worlds', 'Alien Faction Template', 'Criminal Faction Template'],
    recommended_origins: ['Hostile', 'Colony', 'Militaristic'],
    recommended_occupations: ['Soldier', 'Drifter', 'Adept'],
    keywords: 'serpentine-colossus, crushing-constriction, heat-sensing-pits, venom, massive',
    negative_keywords: 'stealth-in-crowds, pilot-small-cockpit, tiny'
  },
  'species-weti': {
    recommended_factions: ['The Entari Combine', 'The Outworlds', 'Coalition of Independent Worlds'],
    recommended_origins: ['Spacer', 'Industrial', 'Colony'],
    recommended_occupations: ['Builder', 'Specialist', 'Scout'],
    keywords: '18-inch-simian, duct-repair, gremlin-mechanic, tiny-infiltrator, hyper-agile',
    negative_keywords: 'heavy-combat, high-strength, lumbering'
  },

  // ==========================================
  // 7. Kitin Lineage (4 Species)
  // ==========================================
  'species-kitin-maantene': {
    recommended_factions: ['Hive Mind Faction Template', 'Coalition of Independent Worlds'],
    recommended_origins: ['Hostile', 'Colony'],
    recommended_occupations: ['Scout', 'Soldier'],
    keywords: 'four-armed, leaper, chitin-carapace, hive-psionics, insectoid-vanguard',
    negative_keywords: 'individualism, heavy-firearms, solitary'
  },
  'species-kitin-manelli': {
    recommended_factions: ['Hive Mind Faction Template', 'The Entari Combine', 'Coalition of Independent Worlds'],
    recommended_origins: ['Colony', 'Research', 'Urban'],
    recommended_occupations: ['Representative', 'Specialist', 'Citizen'],
    keywords: 'humanoid-kitin, hive-ambassador, telepathic-translator, carbon-bridge, empathetic',
    negative_keywords: 'berserker-rage, isolation, xenophobic'
  },
  'species-kitin-rakne': {
    recommended_factions: ['Hive Mind Faction Template', 'Criminal Faction Template'],
    recommended_origins: ['Hostile', 'Spacer'],
    recommended_occupations: ['Scout', 'Agent', 'Soldier'],
    keywords: 'arachnid-kitin, silk-spinner, wall-climber, neurotoxin-ambush, multi-limbed',
    negative_keywords: 'open-plains, diplomatic-court, conspicuous'
  },
  'species-kitin-riezen': {
    recommended_factions: ['Hive Mind Faction Template', 'Alien Faction Template'],
    recommended_origins: ['Hostile', 'Colony'],
    recommended_occupations: ['Soldier', 'Drifter', 'Adept'],
    keywords: 'swarm-aggregate, micro-arthropod-colossus, hive-mind-colony, distributed-mass',
    negative_keywords: 'fine-jewelry, solitary-individual, tiny-cockpit'
  },

  // ==========================================
  // 8. Progenitors (2 Species)
  // ==========================================
  'species-progenitor-ila': {
    recommended_factions: ['The Alterian Enclave', 'Sentient Intelligence Faction Template', 'Cosmic Justice Faction Template'],
    recommended_origins: ['Enlightened', 'Research', 'Spacer'],
    recommended_occupations: ['Scholar', 'Adept', 'Representative'],
    keywords: 'precursor-archon, megastructure-builder, deific-intellect, luminous-singularity, ancient',
    negative_keywords: 'primitive, mundane-labor, disposable, short-lived'
  },
  'species-progenitor-unonn': {
    recommended_factions: ['Alien Faction Template', 'Supernatural Faction Template'],
    recommended_origins: ['Enlightened', 'Spacer'],
    recommended_occupations: ['Adept', 'Scholar', 'Specialist'],
    keywords: 'primordial-sovereign, reality-warping, pure-thought, deific-metaphysics, void-command',
    negative_keywords: 'subservient, mortal-fragility, physical-tool'
  },

  // ==========================================
  // 9. Sha'nor & Void Lineages (3 Species)
  // ==========================================
  'species-shanor-base': {
    recommended_factions: ['Cosmic Horror Faction Template', 'Supernatural Faction Template'],
    recommended_origins: ['Hostile', 'Spacer'],
    recommended_occupations: ['Adept', 'Agent', 'Drifter'],
    keywords: 'void-aberration, dark-matter, semi-corporeal, entropy-harbinger, phase-shift',
    negative_keywords: 'solar-radiance, biological-healing, clumsy'
  },
  'species-shanor-eakren': {
    recommended_factions: ['The Outworlds', 'Mutant Faction Template'],
    recommended_origins: ['Hostile', 'Colony'],
    recommended_occupations: ['Drifter', 'Soldier', 'Scout'],
    keywords: 'void-mutant, warp-touched, chaotic-physiology, resilient-aberration, fringe-dweller',
    negative_keywords: 'pureblood-society, stable-form, pristine'
  },
  'species-shanor-tenen': {
    recommended_factions: ['The Alterian Enclave', 'The Outworlds'],
    recommended_origins: ['Enlightened', 'Spacer'],
    recommended_occupations: ['Scholar', 'Adept', 'Scout'],
    keywords: 'benign-spectral, chronicler, twilight-rift, spatial-observer, intangible-glide',
    negative_keywords: 'predatory-vampire, physical-brawler, loud'
  },

  // ==========================================
  // 10. Synthetics (12 Species)
  // ==========================================
  'species-synthetic-android': {
    recommended_factions: ['The Syndicate', 'Artificial Life Faction Template', 'The Ascendancy'],
    recommended_origins: ['Industrial', 'Urban', 'Research'],
    recommended_occupations: ['Specialist', 'Citizen', 'Soldier', 'Agent'],
    keywords: 'optronic-chassis, myomer-muscle, modular-hardware, tireless, emotion-neutral',
    negative_keywords: 'biological-disease, starvation, nature-magic'
  },
  'species-synthetic-biomechanical': {
    recommended_factions: ['The Syndicate', 'Artificial Life Faction Template'],
    recommended_origins: ['Research', 'Industrial'],
    recommended_occupations: ['Specialist', 'Soldier', 'Builder'],
    keywords: 'cyber-organic, vat-muscle, titanium-endoskeleton, hybrid-vitality, organ-sleeve',
    negative_keywords: 'pure-organic, purist-tech, anti-cyborg'
  },
  'species-synthetic-eidolon': {
    recommended_factions: ['The Alterian Enclave', 'Sentient Intelligence Faction Template'],
    recommended_origins: ['Enlightened', 'Research', 'Spacer'],
    recommended_occupations: ['Scholar', 'Adept', 'Specialist'],
    keywords: 'silicon-crystalline, photonic-pathways, consensus-hive, zero-point-energy, chrono-shaper',
    negative_keywords: 'dirty-oil, primitive-slugthrower, rust'
  },
  'species-synthetic-golem': {
    recommended_factions: ['The Alterian Enclave', 'The Silvermoon Vanguard'],
    recommended_origins: ['Enlightened', 'Militaristic'],
    recommended_occupations: ['Soldier', 'Builder'],
    keywords: 'runic-stone, arcane-matrix, obsidian-sentinel, heavy-fortification, unstoppable',
    negative_keywords: 'agile-acrobatics, hacking, subtle-espionage'
  },
  'species-synthetic-intellect': {
    recommended_factions: ['The Mekan Collective', 'The Ascendancy', 'Sentient Intelligence Faction Template'],
    recommended_origins: ['Research', 'Urban', 'Spacer'],
    recommended_occupations: ['Scholar', 'Specialist', 'Agent'],
    keywords: 'disembodied-mind, floating-core, drone-commander, digital-psionics, computing-singularity',
    negative_keywords: 'physical-endurance, melee-brawler, heavy-armor'
  },
  'species-synthetic-mekan': {
    recommended_factions: ['The Mekan Collective', 'Technological Faction Template'],
    recommended_origins: ['Industrial', 'Research', 'Colony'],
    recommended_occupations: ['Builder', 'Specialist', 'Adept'],
    keywords: 'nanite-assimilation, technopathy, modular-adaptation, machine-will, hyper-structure',
    negative_keywords: 'organic-healing, nature-communion, biological-purism'
  },
  'species-synthetic-protocol': {
    recommended_factions: ['Corporate Faction Template', 'The Syndicate', 'The Entari Combine'],
    recommended_origins: ['Urban', 'Research'],
    recommended_occupations: ['Specialist', 'Citizen', 'Representative'],
    keywords: 'directive-processing, medical-protocol, administrative-bot, precision-servant, etiquette',
    negative_keywords: 'rogue-anarchy, combat-frenzy, wilderness'
  },
  'species-synthetic-scrap': {
    recommended_factions: ['The Outworlds', 'Coalition of Independent Worlds'],
    recommended_origins: ['Industrial', 'Hostile', 'Colony'],
    recommended_occupations: ['Builder', 'Drifter', 'Criminal'],
    keywords: 'kit-bashed, junkframe, welded-chassis, scrapper-survivor, improvised-parts',
    negative_keywords: 'luxury-sleek, factory-standard, pureblood'
  },
  'species-synthetic-sentient-machine': {
    recommended_factions: ['The Outworlds', 'Artificial Life Faction Template', 'Coalition of Independent Worlds'],
    recommended_origins: ['Industrial', 'Colony', 'Spacer'],
    recommended_occupations: ['Builder', 'Soldier', 'Drifter'],
    keywords: 'awakened-industrial, free-droid, labor-rebel, heavy-mechanic, emancipated',
    negative_keywords: 'subservient-protocol, corporate-loyalty, factory-slave'
  },
  'species-synthetic-shell': {
    recommended_factions: ['The Syndicate', 'The Ascendancy'],
    recommended_origins: ['Urban', 'Research', 'Leisure'],
    recommended_occupations: ['Specialist', 'Agent', 'Citizen'],
    keywords: 'cortical-stack, resleeve, transhuman-mind, digitized-consciousness, sleeve-swap',
    negative_keywords: 'permanent-death-fear, natural-aging, bio-purist'
  },
  'species-synthetic-skin': {
    recommended_factions: ['The Syndicate', 'Corporate Faction Template'],
    recommended_origins: ['Urban', 'Research'],
    recommended_occupations: ['Agent', 'Entertainer', 'Criminal'],
    keywords: 'synthetic-flesh, emotional-emulator, infiltrator-android, social-mimic, sleeper-unit',
    negative_keywords: 'clunky-metal, obvious-robot, conspicuous'
  },
  'species-synthetic-swarm': {
    recommended_factions: ['The Mekan Collective', 'Sentient Intelligence Faction Template'],
    recommended_origins: ['Research', 'Industrial', 'Spacer'],
    recommended_occupations: ['Specialist', 'Agent', 'Builder'],
    keywords: 'micro-drone-cloud, distributed-intelligence, vent-seepage, nanite-fabrication, dispersed',
    negative_keywords: 'single-bullet-target, solid-frame, skeletal'
  }
};

export function applySpeciesRecommendations() {
  const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.md'));
  console.log(`Applying recommendations across ${files.length} species files in ${speciesDir}...`);

  let updatedCount = 0;
  const missingDefinitions = [];

  for (const file of files) {
    const filePath = path.join(speciesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const id = data.id || file.replace(/\.md$/, '');

    const recs = SPECIES_RECOMMENDATIONS_MAP[id];
    if (!recs) {
      missingDefinitions.push(id);
      continue;
    }

    data.recommended_factions = recs.recommended_factions;
    data.recommended_origins = recs.recommended_origins;
    data.recommended_occupations = recs.recommended_occupations;
    data.keywords = recs.keywords;
    data.negative_keywords = recs.negative_keywords;

    const newContent = matter.stringify(parsed.content, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
    updatedCount++;
  }

  console.log(`\nUpdated ${updatedCount} species files successfully.`);
  if (missingDefinitions.length > 0) {
    console.error(`WARNING: Missing definitions for ${missingDefinitions.length} species:`, missingDefinitions);
  } else {
    console.log(`All ${files.length} species are 100% matched!`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applySpeciesRecommendations();
}
