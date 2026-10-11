import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const originsDir = path.resolve(__dirname, '../src/data/omnicortex/origins');

export const ORIGIN_RECOMMENDATIONS_MAP = {
  'origin-agricultural': {
    recommended_species: [
      'Lin Human',
      'Rautha Human',
      'Human (Base)',
      'Tozen',
      'Ferren',
      'Koban',
      'Kannid',
      'Koda (Auluran Worker)',
      'Awakened Animal',
      'Thorn'
    ],
    recommended_factions: [
      'Auluran Clans',
      'Environmental Faction Template',
      'Planetary Faction Template',
      'Impyrium Dominion',
      'The Outworlds',
      'Coalition of Independent Worlds'
    ],
    recommended_occupations: [
      'Builder',
      'Citizen',
      'Scout',
      'Specialist',
      'Drifter',
      'Merchant'
    ],
    keywords: 'agrarian, pastoral, bio-dome, mega-harvester, hydroponics, homestead, fertile-plains, crop-canopies, silo-arcology, soil-ecology, rural-frontier, green-biosphere, food-security, agricultural-combine, cultivation, earthy, golden-fields, season-cycles, solar-irrigators',
    negative_keywords: 'cyberpunk-megacity, void-vacuum, zero-g-station, deep-abyss, volcanic-waste, neon-high-tech-sprawl, nanite-swarm, pure-synthetic-android, bleak-penal-colony, corporate-executive-boardroom, casino-strip, orbital-dockyard'
  },
  'origin-aquatic': {
    recommended_species: [
      'Aquarian Human',
      'Aquatican (Gen-E)',
      'Mobula',
      'Sefalin',
      'Truldan',
      'Praeti',
      'Plasm',
      'Caprian'
    ],
    recommended_factions: [
      'Environmental Faction Template',
      'Coalition of Independent Worlds',
      'Auluran Clans',
      'The Entari Combine',
      'Incorporated Planetary Syndication (The Syndicate)',
      'The Alterian Enclave'
    ],
    recommended_occupations: [
      'Scout',
      'Specialist',
      'Builder',
      'Drifter',
      'Merchant',
      'Agent'
    ],
    keywords: 'oceanic, deep-sea, submerged-arcology, flotilla-city, pelagic, coral-reef, bathyscaphe, hydro-mining, tidal-energy, bioluminescent, marine-ecology, kelp-forest, trench-explorer, waterworld, pressure-hull, aquanaut, nautical, wave-rider, saline',
    negative_keywords: 'arid-desert, dune-sea, barren-wasteland, smog-heavy-industry, fire-lava-cavern, ash-wastes, deep-underground-tunnel, orbital-high-g-forge, dry-steppes, pure-vacuum-void'
  },
  'origin-colony': {
    recommended_species: [
      'Human (Base)',
      'Lin Human',
      'Premian Human',
      'Dwerg Human',
      'Cyberform Human',
      'Wildling',
      'Kheen Human',
      'Frellin',
      'Jorni',
      'Mondi',
      'Sentient Machine (Free Droid)'
    ],
    recommended_factions: [
      'The Outworlds',
      'Coalition of Independent Worlds',
      'Planetary Faction Template',
      'Space Exploration Faction Template',
      'Impyrium Dominion',
      'Rebel Faction Template'
    ],
    recommended_occupations: [
      'Builder',
      'Scout',
      'Citizen',
      'Soldier',
      'Specialist',
      'Drifter'
    ],
    keywords: 'frontier, prefab-habitat, settler, pioneer, homestead, prospector, geodesic-dome, rugged-survival, terraforming-array, modular-outpost, borderlands, expansionist, resource-staging, self-reliance, uncharted-horizon, dusty-trail, solar-array-grid',
    negative_keywords: 'decadent-leisure-resort, ancient-gilded-spire, high-class-ballroom, megacity-cyber-sprawl, ancestral-temple, pure-void-deep-spacer, imperial-palace-court, corporate-high-executive-boardroom'
  },
  'origin-enlightened': {
    recommended_species: [
      'Celestine (Alterian)',
      'Whisper',
      'Fey (Base)',
      'Sigal',
      'Draconian (Scaled Aeld)',
      'Ila (Progenitor Archon)',
      'U’Nonn (Progenitor Sovereign)',
      'Tenen (Sha’nor Spectral)',
      'Golem (Arcane Construct)',
      'Eidolon (Aetherion Specialist)'
    ],
    recommended_factions: [
      'The Alterian Enclave',
      'The Ascendancy',
      'Elven Providence',
      'Dracon Dynasty',
      'Supernatural Faction Template',
      'Religious Cult Faction Template',
      'Space Religion Faction Template'
    ],
    recommended_occupations: [
      'Adept',
      'Scholar',
      'Representative',
      'Specialist',
      'Agent',
      'Entertainer'
    ],
    keywords: 'metaphysical, ley-line, psionic-sanctuary, crystal-spire, temple-enclave, ancient-archives, meditation-garden, resonance-core, esoteric-wisdom, arcane-orrery, mind-over-matter, harmonic-energy, illuminated-sanctum, philosophy, ascetic, transcendence, mystic-shrines',
    negative_keywords: 'smog-factory-belt, brutal-trench-warfare, industrial-strip-mine, grimy-scrap-flotilla, cybernetic-meat-grinder, low-life-street-ganger, corporate-debt-enforcer, mechanized-assembly-line, dieselpunk-forge'
  },
  'origin-hostile': {
    recommended_species: [
      'Rautha Human',
      'B’Dren Human',
      'Vajar (Wilder)',
      'Nocturne (Kovian)',
      'Graa (Auluran Heavy)',
      "Gra'or",
      'Vassoth',
      'Rakne (Kitin Stalker)',
      'Eakren (Corrupted Aberration)',
      'Risakin (Giant Folk)',
      'Scrap (Junkframe Synthetic)'
    ],
    recommended_factions: [
      'The Outworlds',
      'Post-apocalyptic Faction Template',
      'Mutant Faction Template',
      'Vajar Tribes',
      'Kovian Tribunal',
      'Mercenary Faction Template',
      'Alien Faction Template'
    ],
    recommended_occupations: [
      'Soldier',
      'Scout',
      'Specialist',
      'Drifter',
      'Criminal',
      'Builder'
    ],
    keywords: 'death-world, toxic-atmosphere, corrosive-rain, ash-wastes, volcanic-ridge, apex-predators, radiation-hazard, hardened-bunkers, respirator-gear, survivalist, harsh-biome, chem-scrubber, armored-carapace, extreme-elements, scavenged-scrap, danger-zone',
    negative_keywords: 'pristine-luxury-resort, polished-marble-ballroom, carefree-tourism, fragile-glass-spire, gentle-pastoral-meadow, silk-velvet-lounge, serene-academic-cloister, high-society-banquet, unshielded-civilian-park'
  },
  'origin-industrial': {
    recommended_species: [
      'Dwerg Human',
      'Cyberform Human',
      'Koda (Auluran Worker)',
      'Mekan (Assimilation Unit)',
      'Protocol (Task Automaton)',
      'Scrap (Junkframe Synthetic)',
      'Biomechanical Synthetic',
      'Human (Base)',
      'Digon (Gen-E)',
      'Orll'
    ],
    recommended_factions: [
      'The Mekan Collective',
      'Incorporated Planetary Syndication (The Syndicate)',
      'Technological Faction Template',
      'Coalition of Independent Worlds',
      'Corporate Faction Template',
      'Impyrium Dominion'
    ],
    recommended_occupations: [
      'Builder',
      'Specialist',
      'Citizen',
      'Soldier',
      'Merchant',
      'Agent'
    ],
    keywords: 'forge-world, heavy-industry, smelting-plant, foundry, assembly-line, slag-vats, cranes, gantry-grid, smog-stack, strip-mining, hydraulics, pneumatics, machining, high-pressure-steam, industrial-robotics, tooling, hardhat, rust-and-iron',
    negative_keywords: 'pristine-natural-forest, serene-underwater-reef, gilded-royal-court, arcane-ley-line-sanctuary, untouched-wilderness, luxury-sunbathing-beach, zero-g-delicate-glass, pastoral-vineyard, fae-enchantment'
  },
  'origin-leisure': {
    recommended_species: [
      'Celestine (Alterian)',
      'Fey (Base)',
      'Argynt Human',
      'Brae Human',
      'Davae (Gen-E)',
      'Danai (Davae Hybrid)',
      'Kizin',
      'Kongi',
      'Skin (Infiltrator Synthetic)',
      'Changeling (Doppelganger Hybrid)'
    ],
    recommended_factions: [
      'Space Tourism Faction Template',
      'Incorporated Planetary Syndication (The Syndicate)',
      'The Alterian Enclave',
      'Dracon Dynasty',
      'Corporate Faction Template',
      'The Silvermoon Vanguard'
    ],
    recommended_occupations: [
      'Entertainer',
      'Representative',
      'Merchant',
      'Citizen',
      'Agent',
      'Criminal'
    ],
    keywords: 'resort-world, luxury-retreat, pleasure-dome, infinity-pool, casino-strip, haute-cuisine, grand-amphitheater, opulent-suites, holographic-cabaret, hospitality, hedonism, concierge, star-gazing-pavilion, fine-wine, decadence, pampered, neon-nightlife',
    negative_keywords: 'bleak-trench-warfare, industrial-ash-heap, toxic-radiation-bog, grimy-slag-pit, cramped-miner-submersible, rigorous-ascetic-monasticism, penal-forced-labor, extreme-deprivation, mud-and-blood'
  },
  'origin-militaristic': {
    recommended_species: [
      'Draconian (Scaled Aeld)',
      'Janissary (Gen-E)',
      'Impyrium Regi (Gen-E)',
      'Rautha Human',
      'Dar (Auluran Hunter)',
      'Graa (Auluran Heavy)',
      'Maantene (Kitin Leaper)',
      'Qeric',
      'Weti',
      'Sentient Machine (Free Droid)'
    ],
    recommended_factions: [
      'Military Faction Template',
      'Impyrium Dominion',
      'Dracon Dynasty',
      'Mercenary Faction Template',
      'Radiant Impyrium',
      'Cosmic Justice Faction Template'
    ],
    recommended_occupations: [
      'Soldier',
      'Specialist',
      'Scout',
      'Agent',
      'Builder',
      'Representative'
    ],
    keywords: 'fortress-world, military-garrison, plasteel-bunkers, firing-range, parade-grounds, barbed-perimeters, defense-turrets, flak-emplacements, hardened-command-bunker, combat-readiness, drills, disciplined-ranks, munitions-depots, war-room, drop-ship-hangar',
    negative_keywords: 'carefree-resort-beach, gilded-dance-ballroom, pacifist-commune, chaotic-unregulated-slums, fragile-glass-greenhouse, drug-riddled-cantina, unarmed-ascetic-hermitage, frivolous-haute-couture'
  },
  'origin-research': {
    recommended_species: [
      'Sigal',
      'Celestine (Alterian)',
      'Nian Human',
      'Intellect Construct (Pure AI)',
      'Android',
      'Manelli (Kitin Diplomat)',
      'Prokos (Auluran Biform)',
      'Impyrium Psion (Gen-E)',
      'Gen-E (Base Engineered Human)',
      'Swarm (Micro-Drone Synthetic)'
    ],
    recommended_factions: [
      'The Ascendancy',
      'Technological Faction Template',
      'The Mekan Collective',
      'Sentient Intelligence Faction Template',
      'Genetic Engineering Faction Template',
      'The Alterian Enclave'
    ],
    recommended_occupations: [
      'Scholar',
      'Specialist',
      'Builder',
      'Agent',
      'Scout',
      'Representative'
    ],
    keywords: 'research-facility, cleanroom-laboratory, supercomputer-array, particle-accelerator, observational-dome, genetic-sequencing, quantum-analysis, test-chambers, data-servers, scientific-method, academic-archive, prototyping, telemetry, whiteboard-hypotheses',
    negative_keywords: 'anti-intellectualism, feudal-superstition, primitive-mud-hut, unregulated-street-riot, lawless-mercenary-den, slag-heavy-smelting, decadent-carefree-party, trench-mud-war'
  },
  'origin-spacer': {
    recommended_species: [
      'Varen (Gatekeeper)',
      'Cyberform Human',
      'Human (Base)',
      'Frellin',
      'Jorni',
      'Mobula',
      'Sentient Machine (Free Droid)',
      'Shell (Transferred Organic)',
      'Chimera (Gen-E)',
      'Scrap (Junkframe Synthetic)'
    ],
    recommended_factions: [
      'The Outworlds',
      'Coalition of Independent Worlds',
      'The Entari Combine',
      'Space Exploration Faction Template',
      'Space Pirate Faction Template',
      'Mercenary Faction Template'
    ],
    recommended_occupations: [
      'Drifter',
      'Scout',
      'Merchant',
      'Builder',
      'Agent',
      'Soldier'
    ],
    keywords: 'void-born, zero-g, orbital-station, pressurized-corridor, airlock, tramp-freighter, asteroid-belt, solar-sails, hull-plating, life-support, gravity-plates, nav-computer, docking-clamps, microgravity, bulkheads, spacefarer, stellar-void',
    negative_keywords: 'deep-planetary-gravity-well, vast-open-prairie, mountainous-alpine-forest, submerged-coral-trench, heavy-mud-bog, ancient-stone-catacomb, open-atmosphere-storm, unpressurized-wilderness'
  },
  'origin-urban': {
    recommended_species: [
      'Human (Base)',
      'Doppelganger (Shifter)',
      'Changeling (Doppelganger Hybrid)',
      'Cyberform Human',
      'Skin (Infiltrator Synthetic)',
      'Android',
      'Kannid',
      'Kizin',
      'Danai (Davae Hybrid)',
      'Nocturne (Kovian)'
    ],
    recommended_factions: [
      'Incorporated Planetary Syndication (The Syndicate)',
      'Coalition of Independent Worlds',
      'Corporate Faction Template',
      'Criminal Faction Template',
      'Impyrium Dominion',
      'Political Faction Template',
      'Interstellar Diplomats Faction Template'
    ],
    recommended_occupations: [
      'Criminal',
      'Agent',
      'Citizen',
      'Entertainer',
      'Specialist',
      'Merchant'
    ],
    keywords: 'megacity, arcology, neon-drenched, rain-slicked-pavement, skyscraper-concourse, mass-transit-monorail, street-market, verticality, alleyway, cyberpunk-sprawl, overcrowded, high-population-density, holographic-billboards, underworld, smog-haze',
    negative_keywords: 'untamed-wilderness, pristine-glacial-tundra, desert-sand-dunes, lonely-deep-space-station, pastoral-farming-valley, quiet-ancient-hermitage, submerged-oceanic-trench, feral-jungle-canopy'
  }
};

export function applyOriginRecommendations() {
  if (!fs.existsSync(originsDir)) {
    console.error(`Origins directory not found at: ${originsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(originsDir).filter(f => f.endsWith('.md'));
  console.log(`Applying recommendations across ${files.length} origin files in ${originsDir}...`);

  let updatedCount = 0;
  const missingDefinitions = [];

  for (const file of files) {
    const filePath = path.join(originsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const id = data.id || file.replace(/\.md$/, '');

    const recs = ORIGIN_RECOMMENDATIONS_MAP[id];
    if (!recs) {
      missingDefinitions.push(id);
      continue;
    }

    data.recommended_species = recs.recommended_species;
    data.recommended_factions = recs.recommended_factions;
    data.recommended_occupations = recs.recommended_occupations;
    data.keywords = recs.keywords;
    data.negative_keywords = recs.negative_keywords;

    const newContent = matter.stringify(parsed.content, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
    updatedCount++;
  }

  console.log(`\nUpdated ${updatedCount} origin files successfully.`);
  if (missingDefinitions.length > 0) {
    console.error(`WARNING: Missing definitions for ${missingDefinitions.length} origins:`, missingDefinitions);
  } else {
    console.log(`All ${files.length} origins are 100% matched!`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyOriginRecommendations();
}
