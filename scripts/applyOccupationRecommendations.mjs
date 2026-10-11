import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const occupationsDir = path.resolve(__dirname, '../src/data/omnicortex/occupations');

export const OCCUPATION_RECOMMENDATIONS_MAP = {
  'occupation-adept': {
    recommended_species: [
      'Celestine (Alterian)',
      'Whisper',
      'Fey (Base)',
      'Sigal',
      'Draconian (Scaled Aeld)',
      'Impyrium Psion (Gen-E)',
      'Ila (Progenitor Archon)',
      'Eidolon (Aetherion Specialist)',
      'Tenen (Sha’nor Spectral)',
      'Golem (Arcane Construct)'
    ],
    recommended_factions: [
      'The Alterian Enclave',
      'The Ascendancy',
      'Elven Providence',
      'Dracon Dynasty',
      'Supernatural Faction Template',
      'Space Religion Faction Template',
      'Religious Cult Faction Template'
    ],
    recommended_origins: [
      'Enlightened',
      'Research',
      'Hostile',
      'Urban'
    ],
    keywords: 'psionic, metaphysical, attunement, arcane-focus, mystic-ritual, inner-discipline, mind-over-matter, halo-interface, telekinesis, telepathy, essence-surge, channeled-power, meditative-stance, astral-projection, spiritual-resonance, esoteric-arts',
    negative_keywords: 'mundane-bureaucracy, anti-magic, brute-force-only, crude-industrial-welding, corporate-spreadsheet, pure-mechanical-drone, soulless-assembly-line, low-tech-peasant, illiterate-scavenger'
  },
  'occupation-agent': {
    recommended_species: [
      'Doppelganger (Shifter)',
      'Changeling (Doppelganger Hybrid)',
      'Skin (Infiltrator Synthetic)',
      'Nocturne (Kovian)',
      'Android',
      'Cyberform Human',
      'Danai (Davae Hybrid)',
      'Kannid',
      'Human (Base)',
      'Whisper'
    ],
    recommended_factions: [
      'Incorporated Planetary Syndication (The Syndicate)',
      'Kovian Tribunal',
      'Corporate Faction Template',
      'Criminal Faction Template',
      'Interstellar Diplomats Faction Template',
      'Political Faction Template',
      'The Alterian Enclave'
    ],
    recommended_origins: [
      'Urban',
      'Spacer',
      'Hostile',
      'Research'
    ],
    keywords: 'covert-operative, espionage, infiltration, intelligence-handler, surveillance-rig, classified-dossier, suppressed-sidearm, wiretap, disguise, shadow-stealth, false-identity, tactical-hud, asset-extraction, counter-intel, dead-drop, encrypted-comm',
    negative_keywords: 'loud-heavy-artillery, obvious-presence, careless-brawler, primitive-mud-hut, flamboyant-circus-performer, transparent-honesty, naive-idealism, static-sentry, clumsy-laborer'
  },
  'occupation-builder': {
    recommended_species: [
      'Dwerg Human',
      'Cyberform Human',
      'Koda (Auluran Worker)',
      'Protocol (Task Automaton)',
      'Scrap (Junkframe Synthetic)',
      'Biomechanical Synthetic',
      'Human (Base)',
      'Mekan (Assimilation Unit)',
      'Digon (Gen-E)',
      'Orll'
    ],
    recommended_factions: [
      'The Mekan Collective',
      'Coalition of Independent Worlds',
      'Incorporated Planetary Syndication (The Syndicate)',
      'Technological Faction Template',
      'Corporate Faction Template',
      'Planetary Faction Template'
    ],
    recommended_origins: [
      'Industrial',
      'Colony',
      'Spacer',
      'Agricultural'
    ],
    keywords: 'fabricator, structural-engineer, heavy-welder, blueprints, pneumatic-tools, architectural-grid, habitat-assembly, repair-drone, hydraulic-lift, hardhat, high-temp-torch, reinforced-scaffolding, modular-construction, precision-machining, forge-craft',
    negative_keywords: 'fragile-aestheticism, theoretical-philosophy-only, careless-demolition, aristocratic-idleness, ungrounded-mysticism, non-technical-bureaucrat, frivolous-courtier, destructive-anarchy'
  },
  'occupation-citizen': {
    recommended_species: [
      'Human (Base)',
      'Lin Human',
      'Premian Human',
      'Argynt Human',
      'Nian Human',
      'Dwerg Human',
      'Kheen Human',
      'Kannid',
      'Android',
      'Awakened Animal'
    ],
    recommended_factions: [
      'Planetary Faction Template',
      'Coalition of Independent Worlds',
      'Impyrium Dominion',
      'Political Faction Template',
      'The Entari Combine',
      'Corporate Faction Template'
    ],
    recommended_origins: [
      'Urban',
      'Agricultural',
      'Colony',
      'Industrial'
    ],
    keywords: 'civic-minded, municipal-records, neighborhood-cooperative, public-transit, daily-commute, civil-servant, town-hall, local-commerce, community-solidarity, law-abiding, family-homestead, storefront, census-registry, civic-infrastructure',
    negative_keywords: 'bloodthirsty-berserker, eldritch-cultist, covert-assassin, rogue-warlord, deep-abyss-monstrosity, outlaw-raider, lone-wolf-vigilante, nihilistic-anarchist'
  },
  'occupation-criminal': {
    recommended_species: [
      'Doppelganger (Shifter)',
      'Changeling (Doppelganger Hybrid)',
      'Scrap (Junkframe Synthetic)',
      'Nocturne (Kovian)',
      'Cyberform Human',
      'Danai (Davae Hybrid)',
      'Kizin',
      'B’Dren Human',
      'Human (Base)',
      'Skin (Infiltrator Synthetic)'
    ],
    recommended_factions: [
      'Criminal Faction Template',
      'Space Pirate Faction Template',
      'Incorporated Planetary Syndication (The Syndicate)',
      'The Outworlds',
      'Kovian Tribunal',
      'Rebel Faction Template'
    ],
    recommended_origins: [
      'Urban',
      'Hostile',
      'Spacer',
      'Leisure'
    ],
    keywords: 'underworld-syndicate, black-market, illicit-contraband, pickpocket, safe-cracker, getaway-pilot, loan-shark, forged-credentials, speakeasy, fence-broker, shadow-economy, hideout, extortion, street-gang, numbers-runner, razor-knife',
    negative_keywords: 'strict-law-enforcer, incorruptible-judge, transparent-accountability, paladin-virtue, naive-honesty, municipal-hall-bureaucrat, pacifist-monk, royal-chivalry'
  },
  'occupation-drifter': {
    recommended_species: [
      'Vajar (Wilder)',
      'Wildling',
      'Ferren',
      'Scrap (Junkframe Synthetic)',
      'Rautha Human',
      'Frellin',
      'Kheen Human',
      'Jorni',
      'Human (Base)',
      'Sentient Machine (Free Droid)'
    ],
    recommended_factions: [
      'The Outworlds',
      'Coalition of Independent Worlds',
      'Vajar Tribes',
      'Post-apocalyptic Faction Template',
      'Space Exploration Faction Template',
      'Rebel Faction Template'
    ],
    recommended_origins: [
      'Spacer',
      'Hostile',
      'Colony',
      'Agricultural'
    ],
    keywords: 'itinerant, wanderer, transient, bedroll, cargo-hopper, dusty-duster, scavenged-gear, lone-highway, hitchhiker, open-starmap, untethered, makeshift-shelter, barter-economy, frontier-drifter, worn-boots, weathered-pack',
    negative_keywords: 'entrenched-bureaucracy, luxury-penthouse, stationary-desk-job, high-society-socialite, strict-military-barracks, corporate-salaryman, locked-vault, sedentary-lifestyle'
  },
  'occupation-entertainer': {
    recommended_species: [
      'Celestine (Alterian)',
      'Fey (Base)',
      'Ferren',
      'Argynt Human',
      'Brae Human',
      'Davae (Gen-E)',
      'Danai (Davae Hybrid)',
      'Kongi',
      'Human (Base)',
      'Changeling (Doppelganger Hybrid)'
    ],
    recommended_factions: [
      'Space Tourism Faction Template',
      'The Entari Combine',
      'Incorporated Planetary Syndication (The Syndicate)',
      'Elven Providence',
      'The Alterian Enclave',
      'Corporate Faction Template'
    ],
    recommended_origins: [
      'Leisure',
      'Urban',
      'Enlightened'
    ],
    keywords: 'performer, holo-stage, spotlight, virtuoso, acoustics, arena-gladiator, celebrity-aura, backstage-pass, charismatic-cadence, theatrical-costume, musical-instrument, crowd-pleaser, ovation, media-broadcast, vibrant-expression',
    negative_keywords: 'dull-drudgery, silent-monk-solitude, grim-trench-survival, sterile-lab-isolation, emotionless-drone, illiterate-labor, secretive-recluse, joyless-stoicism'
  },
  'occupation-merchant': {
    recommended_species: [
      'Human (Base)',
      'Dwerg Human',
      'Argynt Human',
      'Kannid',
      'Lin Human',
      'Varen (Gatekeeper)',
      'Changeling (Doppelganger Hybrid)',
      'Mekan (Assimilation Unit)'
    ],
    recommended_factions: [
      'Incorporated Planetary Syndication (The Syndicate)',
      'The Entari Combine',
      'Coalition of Independent Worlds',
      'Corporate Faction Template',
      'The Outworlds',
      'Planetary Faction Template'
    ],
    recommended_origins: [
      'Urban',
      'Spacer',
      'Leisure',
      'Agricultural'
    ],
    keywords: 'trade-caravan, commercial-ledger, import-export, supply-chain, profit-margin, cargo-manifest, bulk-freight, bill-of-lading, market-stall, merchant-guild, financial-leverage, credit-chip, trade-embargo, negotiation-table, warehouse-depot',
    negative_keywords: 'charity-ascetic, penniless-vow, senseless-vandalism, reckless-spender, anti-commercial-anarchist, self-destructive-rage, gift-economy-only'
  },
  'occupation-representative': {
    recommended_species: [
      'Celestine (Alterian)',
      'Manelli (Kitin Diplomat)',
      'Human (Base)',
      'Argynt Human',
      'Draconian (Scaled Aeld)',
      'Frellin',
      'Ila (Progenitor Archon)',
      'U’Nonn (Progenitor Sovereign)',
      'Changeling (Doppelganger Hybrid)'
    ],
    recommended_factions: [
      'Interstellar Diplomats Faction Template',
      'Political Faction Template',
      'The Entari Combine',
      'The Alterian Enclave',
      'The Ascendancy',
      'Dracon Dynasty',
      'Impyrium Dominion'
    ],
    recommended_origins: [
      'Urban',
      'Enlightened',
      'Leisure',
      'Research'
    ],
    keywords: 'plenipotentiary, diplomatic-envoy, legislative-chamber, state-summit, parliamentary-procedure, treaty-ratification, statesman, sovereign-mandate, court-etiquette, ambassadorial-seal, orator, policy-memo, executive-decree, consular-immunity',
    negative_keywords: 'feral-wildsman, vulgar-street-brawler, lawless-bandit, inarticulate-grunt, chaotic-rioter, mud-scavenger, reclusive-hermit, reckless-provocateur'
  },
  'occupation-scholar': {
    recommended_species: [
      'Sigal',
      'Celestine (Alterian)',
      'Nian Human',
      'Intellect Construct (Pure AI)',
      'Android',
      'Tozen',
      'Human (Base)',
      'Eidolon (Aetherion Specialist)',
      'Manelli (Kitin Diplomat)'
    ],
    recommended_factions: [
      'The Ascendancy',
      'Technological Faction Template',
      'The Alterian Enclave',
      'Elven Providence',
      'Sentient Intelligence Faction Template',
      'The Mekan Collective'
    ],
    recommended_origins: [
      'Research',
      'Enlightened',
      'Urban'
    ],
    keywords: 'academic-archive, peer-review, library-stacks, ancient-scrolls, data-crystal, research-fellow, epistemological, historiography, dissertation, antiquarian, field-notes, paleontology, theoretical-framework, scholarly-symposium',
    negative_keywords: 'willful-ignorance, superstitious-fear, book-burning, illiterate-thug, mindless-violence, anti-intellectual-dogma, reckless-brawling, unverified-rumor'
  },
  'occupation-scout': {
    recommended_species: [
      'Vajar (Wilder)',
      'Ferren',
      'Koban',
      'Dar (Auluran Hunter)',
      'Tozen',
      'Frellin',
      'Rakne (Kitin Stalker)',
      'Maantene (Kitin Leaper)',
      'Wildling',
      'Human (Base)'
    ],
    recommended_factions: [
      'The Outworlds',
      'Space Exploration Faction Template',
      'Coalition of Independent Worlds',
      'Auluran Clans',
      'Elven Providence',
      'Vajar Tribes'
    ],
    recommended_origins: [
      'Hostile',
      'Colony',
      'Spacer',
      'Agricultural',
      'Aquatic'
    ],
    keywords: 'reconnaissance, forward-observer, wilderness-pathfinder, trail-marker, ghillie-camo, binoculars, long-range-rifle, topological-map, stealth-stalking, compass-bearing, bushcraft, survival-rations, perimeter-tripwire, high-vantage',
    negative_keywords: 'claustrophobic-desk, loud-clanking-armor, conspicuous-banner, sedentary-indoor-worker, heavy-urban-drone, noisy-crowd, reckless-charger, nearsighted'
  },
  'occupation-soldier': {
    recommended_species: [
      'Draconian (Scaled Aeld)',
      'Janissary (Gen-E)',
      'Impyrium Regi (Gen-E)',
      'Rautha Human',
      'Graa (Auluran Heavy)',
      'Dar (Auluran Hunter)',
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
      'The Silvermoon Vanguard'
    ],
    recommended_origins: [
      'Militaristic',
      'Hostile',
      'Colony',
      'Industrial',
      'Spacer'
    ],
    keywords: 'fireteam, ballistic-plating, assault-rifle, combat-rig, trench-warfare, breaching-charge, perimeter-defense, unit-cohesion, drill-instructor, field-rations, tactical-reload, forward-fire-base, military-discipline, operational-readiness',
    negative_keywords: 'pacifist-retreat, unarmed-surrender, treasonous-desertion, careless-disregard, undisciplined-riot, ivory-tower-academic, delicate-socialite'
  },
  'occupation-specialist': {
    recommended_species: [
      'Sigal',
      'Cyberform Human',
      'Nian Human',
      'Intellect Construct (Pure AI)',
      'Android',
      'Dwerg Human',
      'Prokos (Auluran Biform)',
      'Skin (Infiltrator Synthetic)',
      'Swarm (Micro-Drone Synthetic)',
      'Human (Base)'
    ],
    recommended_factions: [
      'Technological Faction Template',
      'The Ascendancy',
      'The Mekan Collective',
      'Genetic Engineering Faction Template',
      'Incorporated Planetary Syndication (The Syndicate)',
      'The Alterian Enclave'
    ],
    recommended_origins: [
      'Research',
      'Industrial',
      'Urban',
      'Spacer',
      'Hostile'
    ],
    keywords: 'diagnostic-scanner, surgical-scalpel, terminal-debugger, flight-avionics, cyber-deck, technical-niche, calibration-matrix, specialist-rig, precision-telemetry, expert-system, protocol-analyzer, forensic-kit, field-medic-trauma',
    negative_keywords: 'jack-of-all-trades-master-of-none, crude-brute-force, unscientific-guesswork, superstitious-ritual, careless-operator, sloppy-execution, blunt-force'
  }
};

export function applyOccupationRecommendations() {
  if (!fs.existsSync(occupationsDir)) {
    console.error(`Occupations directory not found at: ${occupationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(occupationsDir).filter(f => f.endsWith('.md'));
  console.log(`Applying recommendations across ${files.length} occupation files in ${occupationsDir}...`);

  let updatedCount = 0;
  const missingDefinitions = [];

  for (const file of files) {
    const filePath = path.join(occupationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const id = data.id || file.replace(/\.md$/, '');

    const recs = OCCUPATION_RECOMMENDATIONS_MAP[id];
    if (!recs) {
      missingDefinitions.push(id);
      continue;
    }

    data.recommended_species = recs.recommended_species;
    data.recommended_factions = recs.recommended_factions;
    data.recommended_origins = recs.recommended_origins;
    data.keywords = recs.keywords;
    data.negative_keywords = recs.negative_keywords;

    const newContent = matter.stringify(parsed.content, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
    updatedCount++;
  }

  console.log(`\nUpdated ${updatedCount} occupation files successfully.`);
  if (missingDefinitions.length > 0) {
    console.error(`WARNING: Missing definitions for ${missingDefinitions.length} occupations:`, missingDefinitions);
  } else {
    console.log(`All ${files.length} occupations are 100% matched!`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyOccupationRecommendations();
}
