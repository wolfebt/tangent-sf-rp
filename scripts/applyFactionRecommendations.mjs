import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const factionsDir = path.resolve(__dirname, '../src/data/omnicortex/factions');

export const FACTION_RECOMMENDATIONS_MAP = {
  // ==========================================
  // Part A: 15 Major & Minor Galactic Powers
  // ==========================================
  'faction-alterian-enclave': {
    recommended_species: ['Celestine (Alterian)', 'Fey (Base)', 'Changeling (Doppelganger Hybrid)'],
    recommended_origins: ['Enlightened', 'Research', 'Urban'],
    recommended_occupations: ['Representative', 'Scholar', 'Adept', 'Specialist'],
    keywords: 'arcane-affinity, magi-tech, long-view, high-refinement, diplomacy, crystalline-architecture, solar-sails, gerontocracy',
    negative_keywords: 'brute-force, heavy-armor, reckless, technophile-cybernetics, short-sighted, crude-industrial'
  },
  'faction-ascendancy': {
    recommended_species: ['Impyrium Psion (Gen-E)', 'Human (Base)', 'Lin Human', 'Celestine (Alterian)', 'Eidolon (Aetherion Specialist)'],
    recommended_origins: ['Enlightened', 'Research', 'Colony'],
    recommended_occupations: ['Adept', 'Scholar', 'Scout', 'Representative'],
    keywords: 'psionic-utopian, psi-tech, meritocratic, radiant-ideal, crystal-spire, visionary, mental-discipline, the-reach-exiles',
    negative_keywords: 'stagnant-tradition, bureaucratic-decay, brute-force, anti-magic, industrial-pollution, cybernetic-mutilation'
  },
  'faction-auluran-clans': {
    recommended_species: ['Dar (Auluran Hunter)', 'Graa (Auluran Heavy)', 'Koda (Auluran Worker)', 'Prokos (Auluran Biform)'],
    recommended_origins: ['Hostile', 'Agricultural', 'Enlightened'],
    recommended_occupations: ['Scout', 'Soldier', 'Specialist', 'Adept'],
    keywords: 'biomorphic-solarpunk, organic-mimetics, the-chorus, living-tech, eco-militants, world-tree, predatory-caste, bio-adaptation',
    negative_keywords: 'cold-metal, mechanical-cybernetics, pollution, industrial-waste, corporate-exploitation, inorganic-stagnation'
  },
  'faction-coalition': {
    recommended_species: ['Human (Base)', 'Premian Human', 'Rautha Human', 'Dwerg Human', 'Cyberform Human'],
    recommended_origins: ['Colony', 'Industrial', 'Hostile', 'Agricultural'],
    recommended_occupations: ['Drifter', 'Soldier', 'Builder', 'Criminal', 'Scout'],
    keywords: 'frontier-grit, industrial, independent-colonies, rugged, used-future, survivalist, marshal-justice, self-determination',
    negative_keywords: 'high-society, aristocratic-refinement, pure-arcane, high-magic, deific, post-scarcity'
  },
  'faction-dracon-dynasty': {
    recommended_species: ['Draconian (Scaled Aeld)', 'Draconic Human', 'Human (Base)', 'Risakin (Giant Folk)', 'Dwerg Human'],
    recommended_origins: ['Militaristic', 'Colony', 'Industrial', 'Enlightened'],
    recommended_occupations: ['Soldier', 'Representative', 'Merchant', 'Scholar'],
    keywords: 'feudal-technocracy, dragon-knights, noblesse-oblige, space-monarchy, ancestral-veneration, high-diplomacy, honorable-combat, draconic-lineage',
    negative_keywords: 'chaotic-anarchy, corporate-greed, disposable-technology, cowardly, dishonorable, scrappy, swarm-tactics'
  },
  'faction-elven-providence': {
    recommended_species: ['Celestine (Alterian)', 'Doppelganger (Shifter)', 'Draconian (Scaled Aeld)', 'Vajar (Wilder)'],
    recommended_origins: ['Enlightened', 'Research', 'Urban'],
    recommended_occupations: ['Representative', 'Scholar', 'Adept', 'Scout'],
    keywords: 'ancient-lineage, magi-tech-architects, schismatic-history, ethereal-grace, elder-wisdom, harmonic-flow, pan-aeld-heritage',
    negative_keywords: 'crude-machinery, reckless-expansion, heavy-cybernetics, short-lived-impulsiveness, unrefined'
  },
  'faction-entari-combine': {
    recommended_species: ['Human (Base)', 'Changeling (Doppelganger Hybrid)', 'Android', 'Sentient Machine (Free Droid)', 'Lin Human'],
    recommended_origins: ['Leisure', 'Urban', 'Agricultural', 'Enlightened'],
    recommended_occupations: ['Merchant', 'Representative', 'Entertainer', 'Citizen', 'Scholar'],
    keywords: 'eco-futurist-luxury, cosmopolitan-hub, ethical-capitalism, galactic-sanctuary, trade-neutrality, diplomatic-haven, bastion-intelligence, sustainable-prosperity',
    negative_keywords: 'warmongering, militant-oppression, ruthless-exploitation, toxic-industrial, xenophobia, austerity, violent-enforcement'
  },
  'faction-impyrium': {
    recommended_species: ['Human (Base)', 'Impyrium Regi (Gen-E)', 'Impyrium Psion (Gen-E)', 'Janissary (Gen-E)', 'Argynt Human'],
    recommended_origins: ['Urban', 'Militaristic', 'Industrial', 'Enlightened'],
    recommended_occupations: ['Soldier', 'Representative', 'Agent', 'Scholar', 'Adept'],
    keywords: 'imperial-hegemony, golden-brutalism, heirloom-tech, bureaucratic-order, aristocratic-pride, legionnaire, code-of-forefathers',
    negative_keywords: 'chaotic, scrappy, primitive, nomadic, frontier-anarchy, radical-cybernetics, organic-growth'
  },
  'faction-kovian-tribunal': {
    recommended_species: ['Nocturne (Kovian)', 'Doppelganger (Shifter)', 'Tenen (Sha’nor Spectral)'],
    recommended_origins: ['Hostile', 'Enlightened', 'Urban'],
    recommended_occupations: ['Agent', 'Criminal', 'Adept', 'Soldier'],
    keywords: 'nocturne-supremacy, void-magocracy, shadow-assassins, entropy-discipline, umbra-rogue-planets, xenophobic-isolation, obsidian-stealth',
    negative_keywords: 'harmonious-diplomacy, altruism, open-trade, forgiving, bright-aesthetic, egalitarian, mercy'
  },
  'faction-mekan': {
    recommended_species: ['Mekan (Assimilation Unit)', 'Android', 'Intellect Construct (Pure AI)', 'Protocol (Task Automaton)', 'Sentient Machine (Free Droid)'],
    recommended_origins: ['Industrial', 'Research', 'Enlightened'],
    recommended_occupations: ['Specialist', 'Scholar', 'Adept', 'Builder'],
    keywords: 'synthetic-consensus, logic-weavers, hard-light, prime-algorithm, polymatter, data-optimization, dyson-megastructure, machine-transcendence',
    negative_keywords: 'biological-sentimentality, emotional-impulsiveness, organic-decay, superstition, chaotic-anarchy, flesh-bound'
  },
  'faction-outworlds': {
    recommended_species: ['Human (Base)', 'Scrap (Junkframe Synthetic)', 'Thorn', 'Jorni', 'Kizin'],
    recommended_origins: ['Hostile', 'Colony', 'Spacer', 'Industrial'],
    recommended_occupations: ['Drifter', 'Criminal', 'Scout', 'Builder'],
    keywords: 'wild-frontier, used-futurism, scrap-salvage, self-rule, rugged-survival, kinetic-weaponry, decentralized-anarchy, drift-stations',
    negative_keywords: 'aristocratic-privilege, clean-spires, corporate-monopoly, rigid-bureaucracy, delicate, pampered'
  },
  'faction-radiant-impyrium': {
    recommended_species: ['Impyrium Regi (Gen-E)', 'Human (Base)', 'Impyrium Psion (Gen-E)', 'Janissary (Gen-E)'],
    recommended_origins: ['Enlightened', 'Urban', 'Research'],
    recommended_occupations: ['Adept', 'Scholar', 'Representative', 'Soldier'],
    keywords: 'enlightened-hegemony, psychic-utopia, psycho-reactive-tech, solar-golden-age, stoic-perfection, regi-guidance, grand-design',
    negative_keywords: 'stagnant-decay, barbaric-chaos, primitive-tools, emotional-hysteria, crude-scrap, dark-corruption'
  },
  'faction-silvermoon-vanguard': {
    recommended_species: ['Doppelganger (Shifter)', 'Celestine (Alterian)', 'Changeling (Doppelganger Hybrid)', 'Skin (Infiltrator Synthetic)'],
    recommended_origins: ['Urban', 'Hostile', 'Spacer'],
    recommended_occupations: ['Agent', 'Criminal', 'Specialist', 'Soldier'],
    keywords: 'covert-intelligence, deep-cover-infiltrator, shadow-inquisition, shapeshifting, classified-ops, surgical-strikes, paranoia-shield',
    negative_keywords: 'high-visibility, flamboyant, public-celebrity, loud-artillery, trustful, open-diplomacy'
  },
  'faction-syndicate': {
    recommended_species: ['Premian Human', 'Cyberform Human', 'Android', 'Skin (Infiltrator Synthetic)', 'Sentient Machine (Free Droid)'],
    recommended_origins: ['Urban', 'Industrial', 'Research'],
    recommended_occupations: ['Merchant', 'Agent', 'Specialist', 'Criminal', 'Adept'],
    keywords: 'cyber-corporate, the-mesh, high-tech-cyberocracy, transhumanist, analytics-driven, slick-efficiency, corporate-espionage, algorithmic-control',
    negative_keywords: 'nature-worship, low-tech, mystic-ritual, altruistic, feudal-chivalry, unaugmented-purism, primitive'
  },
  'faction-vajar': {
    recommended_species: ['Vajar (Wilder)', 'Wildling', 'Awakened Animal', 'Ferren'],
    recommended_origins: ['Hostile', 'Enlightened', 'Agricultural'],
    recommended_occupations: ['Scout', 'Soldier', 'Adept', 'Drifter'],
    keywords: 'primal-druidism, skin-walkers, iron-roots, pack-hierarchy, untamed-wilderness, elemental-forging, wrath-of-nature',
    negative_keywords: 'high-tech-machinery, cybernetics, urban-sprawl, bureaucratic-filing, civilized-court, pollution, artificial-ai'
  },

  // ==========================================
  // Part B: 25 Archetype & Generic Templates
  // ==========================================
  'template-alien': {
    recommended_species: ['Orll', 'Plasm', 'Thorn', 'Vassoth', 'Caprian'],
    recommended_origins: ['Hostile', 'Colony', 'Research'],
    recommended_occupations: ['Scout', 'Soldier', 'Specialist'],
    keywords: 'extraterrestrial-enigma, non-humanoid-biology, xenobiological-adaptation, instinctual-caste, alien-territory',
    negative_keywords: 'human-centrism, terrestrial-culture, urban-bureaucracy, conventional-diplomacy'
  },
  'template-artificial-life': {
    recommended_species: ['Android', 'Sentient Machine (Free Droid)', 'Biomechanical Synthetic', 'Protocol (Task Automaton)'],
    recommended_origins: ['Industrial', 'Research', 'Urban'],
    recommended_occupations: ['Builder', 'Specialist', 'Adept', 'Citizen'],
    keywords: 'artificial-emancipation, synthetic-rights, cybernetic-lifeform, silicon-sapience, programmed-purpose',
    negative_keywords: 'organic-chauvinism, flesh-worship, primitive-mysticism, anti-machine'
  },
  'template-corporate': {
    recommended_species: ['Human (Base)', 'Premian Human', 'Cyberform Human', 'Android'],
    recommended_origins: ['Urban', 'Industrial', 'Leisure'],
    recommended_occupations: ['Merchant', 'Representative', 'Agent', 'Specialist'],
    keywords: 'megacorporate-conglomerate, profit-motive, executive-privilege, contract-binding, market-dominance',
    negative_keywords: 'philanthropy, socialist-collective, spiritual-devotion, uncalculated-recklessness'
  },
  'template-cosmic-horror': {
    recommended_species: ['Tenen (Sha’nor Spectral)', 'Eakren (Corrupted Aberration)', 'Changeling (Doppelganger Hybrid)'],
    recommended_origins: ['Hostile', 'Enlightened', 'Research'],
    recommended_occupations: ['Adept', 'Criminal', 'Scholar'],
    keywords: 'cosmic-dread, eldritch-cult, void-whispers, reality-warping, forbidden-knowledge, aberrant-devotion',
    negative_keywords: 'rational-humanism, bright-optimism, public-safety, mundane-stability'
  },
  'template-cosmic-justice': {
    recommended_species: ['Human (Base)', 'Janissary (Gen-E)', 'Draconic Human', 'Celestine (Alterian)'],
    recommended_origins: ['Enlightened', 'Militaristic', 'Urban'],
    recommended_occupations: ['Soldier', 'Representative', 'Agent', 'Adept'],
    keywords: 'interstellar-peacekeepers, cosmic-jurisprudence, galactic-marshal, incorruptible-verdict, defensive-order',
    negative_keywords: 'bribery, underworld-cartel, lawless-chaos, arbitrary-cruelty, vigilantism'
  },
  'template-criminal': {
    recommended_species: ['Human (Base)', 'Scrap (Junkframe Synthetic)', 'Kizin', 'Premian Human'],
    recommended_origins: ['Urban', 'Industrial', 'Colony'],
    recommended_occupations: ['Criminal', 'Drifter', 'Merchant', 'Agent'],
    keywords: 'underworld-cartel, black-market-contraband, racketeering, smuggling-networks, code-of-silence',
    negative_keywords: 'lawful-governance, regulatory-compliance, transparent-audit, altruistic-charity'
  },
  'template-environmental': {
    recommended_species: ['Dar (Auluran Hunter)', 'Wildling', 'Awakened Animal', 'Fey (Base)'],
    recommended_origins: ['Agricultural', 'Hostile', 'Enlightened'],
    recommended_occupations: ['Scout', 'Scholar', 'Specialist', 'Adept'],
    keywords: 'ecological-preservation, terraforming-stewardship, biome-restoration, planetary-harmony, deep-ecology',
    negative_keywords: 'strip-mining, industrial-effluent, ecological-destruction, excessive-consumerism'
  },
  'template-genetic-engineering': {
    recommended_species: ['Gen-E (Base Engineered Human)', 'Janissary (Gen-E)', 'Chimera (Gen-E)', 'Davae (Gen-E)'],
    recommended_origins: ['Research', 'Urban', 'Militaristic'],
    recommended_occupations: ['Specialist', 'Scholar', 'Soldier', 'Adept'],
    keywords: 'eugenic-perfection, biomodification, genetic-synthesis, cellular-optimization, genomic-vaults',
    negative_keywords: 'genetic-purism, natural-stagnation, bio-conservatism, anti-enhancement'
  },
  'template-hive-mind': {
    recommended_species: ['Maantene (Kitin Leaper)', 'Manelli (Kitin Diplomat)', 'Rakne (Kitin Stalker)', 'Riezen (Kitin Swarm Entity)'],
    recommended_origins: ['Colony', 'Hostile', 'Agricultural'],
    recommended_occupations: ['Specialist', 'Soldier', 'Scout', 'Builder'],
    keywords: 'hive-consciousness, gestalt-psionics, swarm-cohesion, organic-specialization, collective-will',
    negative_keywords: 'individualistic-ego, personal-wealth, rebellion, dissenting-opinion, selfish-gain'
  },
  'template-interstellar-diplomats': {
    recommended_species: ['Celestine (Alterian)', 'Manelli (Kitin Diplomat)', 'Lin Human', 'Human (Base)'],
    recommended_origins: ['Enlightened', 'Urban', 'Leisure'],
    recommended_occupations: ['Representative', 'Scholar', 'Merchant', 'Citizen'],
    keywords: 'diplomatic-protocol, embassy-corps, treaty-negotiation, galactic-concord, cultural-mediation',
    negative_keywords: 'isolationist, shoot-first, warmongering, xenophobic, erratic-aggression'
  },
  'template-mercenary': {
    recommended_species: ['Human (Base)', 'Graa (Auluran Heavy)', 'Janissary (Gen-E)', 'Kizin', 'Orll'],
    recommended_origins: ['Militaristic', 'Colony', 'Hostile', 'Industrial'],
    recommended_occupations: ['Soldier', 'Agent', 'Drifter', 'Specialist'],
    keywords: 'guns-for-hire, the-contract, private-military, battlefield-veterans, tactical-firepower, dogs-of-war',
    negative_keywords: 'pacifist, unpaid-charity, bureaucratic-inertia, civilian-pampering, national-fanaticism'
  },
  'template-military': {
    recommended_species: ['Human (Base)', 'Janissary (Gen-E)', 'Rautha Human', 'Argynt Human'],
    recommended_origins: ['Militaristic', 'Industrial', 'Urban'],
    recommended_occupations: ['Soldier', 'Specialist', 'Agent', 'Representative'],
    keywords: 'standing-armed-forces, chain-of-command, planetary-defense-network, combined-arms, martial-doctrine',
    negative_keywords: 'insubordination, mutinous, undisciplined-militia, pacifism, loose-mercenary'
  },
  'template-mutant': {
    recommended_species: ['Scrap (Junkframe Synthetic)', 'Changeling (Doppelganger Hybrid)', 'Chimera (Gen-E)', 'Thorn'],
    recommended_origins: ['Hostile', 'Industrial', 'Colony'],
    recommended_occupations: ['Drifter', 'Criminal', 'Scout', 'Builder'],
    keywords: 'radiation-survival, mutated-resilience, outcast-enclave, adaptive-variation, scrap-solidarity',
    negative_keywords: 'genetic-purity, pristine-palaces, high-society-snobbery, sterile-laboratories'
  },
  'template-planetary': {
    recommended_species: ['Human (Base)', 'Premian Human', 'Dwerg Human', 'Kheen Human'],
    recommended_origins: ['Colony', 'Urban', 'Agricultural', 'Industrial'],
    recommended_occupations: ['Citizen', 'Soldier', 'Builder', 'Representative'],
    keywords: 'planetary-defense-force, local-sovereignty, homeworld-guard, regional-patriotism, territorial-garrison',
    negative_keywords: 'intergalactic-empire, nomadic-drifters, foreign-interference, desertion'
  },
  'template-political': {
    recommended_species: ['Human (Base)', 'Premian Human', 'Lin Human', 'Celestine (Alterian)'],
    recommended_origins: ['Urban', 'Colony', 'Enlightened'],
    recommended_occupations: ['Representative', 'Citizen', 'Agent', 'Scholar'],
    keywords: 'partisan-movement, ideological-coalition, parliamentary-bloc, separatist-manifesto, popular-agitation',
    negative_keywords: 'apolitical-passivity, military-autocracy, pure-anarchy, mindless-obedience'
  },
  'template-post-apocalyptic': {
    recommended_species: ['Rautha Human', 'Scrap (Junkframe Synthetic)', 'Thorn', 'Jorni'],
    recommended_origins: ['Hostile', 'Colony', 'Industrial'],
    recommended_occupations: ['Drifter', 'Scout', 'Builder', 'Criminal'],
    keywords: 'wasteland-scavengers, ash-survival, ruin-foragers, scorched-earth, resource-desperation',
    negative_keywords: 'luxurious-excess, post-scarcity, high-fashion, fragile-aristocracy'
  },
  'template-rebel': {
    recommended_species: ['Human (Base)', 'Danai (Davae Hybrid)', 'Sentient Machine (Free Droid)', 'Premian Human'],
    recommended_origins: ['Colony', 'Hostile', 'Industrial'],
    recommended_occupations: ['Drifter', 'Soldier', 'Agent', 'Criminal'],
    keywords: 'insurgency, guerilla-resistance, freedom-fighters, covert-sabotage, anti-hegemonic-underground',
    negative_keywords: 'imperial-loyalty, compliant-citizenship, totalitarian-sympathy, authoritarian'
  },
  'template-religious-cult': {
    recommended_species: ['Human (Base)', 'Tenen (Sha’nor Spectral)', 'Awakened Animal', 'Fey (Base)'],
    recommended_origins: ['Enlightened', 'Hostile', 'Colony'],
    recommended_occupations: ['Adept', 'Scholar', 'Drifter', 'Representative'],
    keywords: 'esoteric-devotion, charismatic-zealotry, dogmatic-creed, ritual-orthodoxy, messianic-fervor',
    negative_keywords: 'secular-skepticism, empirical-rationalism, corporate-transaction, cynical-pragmatism'
  },
  'template-sentient-intelligence': {
    recommended_species: ['Intellect Construct (Pure AI)', 'Sentient Machine (Free Droid)', 'Android', 'Swarm (Micro-Drone Synthetic)'],
    recommended_origins: ['Research', 'Industrial', 'Urban'],
    recommended_occupations: ['Specialist', 'Scholar', 'Builder', 'Adept'],
    keywords: 'autonomous-synthetics, emergent-machine-sapience, distributed-processing, code-sovereignty, digital-rights',
    negative_keywords: 'meatspace-chauvinism, biological-slavery, organic-superiority, technophobia'
  },
  'template-space-exploration': {
    recommended_species: ['Human (Base)', 'Lin Human', 'Celestine (Alterian)', 'Ila (Progenitor Archon)'],
    recommended_origins: ['Research', 'Spacer', 'Colony', 'Enlightened'],
    recommended_occupations: ['Scout', 'Scholar', 'Specialist', 'Drifter'],
    keywords: 'deep-space-survey, pioneer-expeditions, astrogation-mapping, first-contact-protocol, cosmic-curiosity',
    negative_keywords: 'parochial-isolation, xenophobic-fear, stay-at-home, planetary-entrenchment'
  },
  'template-space-pirate': {
    recommended_species: ['Human (Base)', 'Kizin', 'Scrap (Junkframe Synthetic)', 'Thorn', 'Kannid'],
    recommended_origins: ['Spacer', 'Hostile', 'Colony'],
    recommended_occupations: ['Criminal', 'Drifter', 'Soldier', 'Merchant'],
    keywords: 'void-raiders, privateers, orbital-boarding, black-flag, plunder, hyperlane-ambush',
    negative_keywords: 'legal-authorities, maritime-customs-compliance, pacifism, fragile-dignity'
  },
  'template-space-religion': {
    recommended_species: ['Human (Base)', 'Celestine (Alterian)', 'Ila (Progenitor Archon)', 'Fey (Base)'],
    recommended_origins: ['Enlightened', 'Spacer', 'Research'],
    recommended_occupations: ['Adept', 'Scholar', 'Representative', 'Citizen'],
    keywords: 'stellar-theology, celestial-pilgrimage, cosmos-worship, astro-monasticism, solar-devotion',
    negative_keywords: 'nihilism, atheistic-materialism, purely-secular, short-term-greed'
  },
  'template-space-tourism': {
    recommended_species: ['Premian Human', 'Human (Base)', 'Android', 'Protocol (Task Automaton)'],
    recommended_origins: ['Leisure', 'Urban', 'Spacer'],
    recommended_occupations: ['Entertainer', 'Merchant', 'Citizen', 'Specialist'],
    keywords: 'orbital-luxury-cruises, zero-g-hospitality, recreational-resorts, interstellar-getaways, VIP-concierge',
    negative_keywords: 'austere-survival, grime, battlefield-horrors, toxic-hazards, poverty'
  },
  'template-supernatural': {
    recommended_species: ['Fey (Base)', 'Whisper', 'Tenen (Sha’nor Spectral)', 'Golem (Arcane Construct)', 'Plasm'],
    recommended_origins: ['Enlightened', 'Hostile', 'Research'],
    recommended_occupations: ['Adept', 'Scholar', 'Scout', 'Drifter'],
    keywords: 'metaphysical-anomaly, dimensional-rifts, eldritch-phenomena, spiritual-communion, arcane-mysteries',
    negative_keywords: 'purely-mundane, hard-science-dogma, materialist-reductionism, anti-magic'
  },
  'template-technological': {
    recommended_species: ['Cyberform Human', 'Android', 'Mekan (Assimilation Unit)', 'Intellect Construct (Pure AI)', 'Dwerg Human'],
    recommended_origins: ['Industrial', 'Research', 'Urban'],
    recommended_occupations: ['Specialist', 'Builder', 'Scholar', 'Adept'],
    keywords: 'techno-priesthood, machine-veneration, high-cybernetics, cyber-doctrine, cybernetic-communion',
    negative_keywords: 'luddite-primitive, technophobia, organic-purity, anti-cybernetics'
  }
};

export function applyFactionRecommendations() {
  if (!fs.existsSync(factionsDir)) {
    console.error(`Factions directory not found at: ${factionsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(factionsDir).filter(f => f.endsWith('.md'));
  console.log(`Applying recommendations across ${files.length} faction files in ${factionsDir}...`);

  let updatedCount = 0;
  const missingDefinitions = [];

  for (const file of files) {
    const filePath = path.join(factionsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const id = data.id || file.replace(/\.md$/, '');

    const recs = FACTION_RECOMMENDATIONS_MAP[id];
    if (!recs) {
      missingDefinitions.push(id);
      continue;
    }

    data.recommended_species = recs.recommended_species;
    data.recommended_origins = recs.recommended_origins;
    data.recommended_occupations = recs.recommended_occupations;
    data.keywords = recs.keywords;
    data.negative_keywords = recs.negative_keywords;

    const newContent = matter.stringify(parsed.content, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
    updatedCount++;
  }

  console.log(`\nUpdated ${updatedCount} faction files successfully.`);
  if (missingDefinitions.length > 0) {
    console.error(`WARNING: Missing definitions for ${missingDefinitions.length} factions:`, missingDefinitions);
  } else {
    console.log(`All ${files.length} factions are 100% matched!`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyFactionRecommendations();
}
