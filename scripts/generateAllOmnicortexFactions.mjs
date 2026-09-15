import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const majorPath = path.join(projectRoot, 'docs', 'MAJOR Factions.md');
const minorPath = path.join(projectRoot, 'docs', 'MINOR Factions.md');
const factionsDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'factions');

if (!fs.existsSync(factionsDir)) {
  fs.mkdirSync(factionsDir, { recursive: true });
}

function cleanString(str) {
  if (!str) return '';
  return str.replace(/\\([+-\\])/g, '$1').replace(/\s+/g, ' ').replace(/^[\s,;.]+|[\s,;.]+$/g, '').trim();
}

function parseBulletValue(sectionText, prefixPattern) {
  const regex = new RegExp(`\\*\\s*\\*\\*${prefixPattern}:?\\*\\*\\s*:?\\s*(.*)`, 'i');
  const match = sectionText.match(regex);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function parseSkillPackage(sectionText) {
  const skills = [];
  const startMatch = sectionText.match(/\*+\s*\*{0,2}Faction Skill Package[^:]*:\*{0,2}([\s\S]*?)(?=(\n\s*\*+\s*\*{0,2}Typical Archetypes|\n\s*\*+\s*\*{0,2}Recommended Features|\n\s*###|\n\s*##|$))/i);
  if (startMatch) {
    const lines = startMatch[1].split('\n');
    for (const line of lines) {
      const bullet = line.match(/^\s*[*+-]\s+(.*)/);
      if (bullet) {
        const item = bullet[1].replace(/\s+/g, ' ').trim();
        if (item) skills.push(item);
      }
    }
  }
  return skills;
}

function parseFeaturesList(rawText) {
  if (!rawText) return [];
  return rawText
    .split(/[,;]/)
    .map(f => cleanString(f).replace(/^\*+|\*+$/g, '').replace(/^`+|`+$/g, '').replace(/\.$/, ''))
    .filter(Boolean);
}

function parseListItems(rawText) {
  if (!rawText) return [];
  return rawText
    .split(/[,;]/)
    .map(f => cleanString(f).replace(/^\*+|\*+$/g, '').replace(/^`+|`+$/g, '').replace(/\.$/, ''))
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE MAJOR FACTIONS
// ─────────────────────────────────────────────────────────────────────────────
const majorRaw = fs.readFileSync(majorPath, 'utf8');
const majorSections = majorRaw.split(/\n(?=##\s+\*\*)/);

const majorMap = {};

for (const sec of majorSections) {
  const headerMatch = sec.match(/^##\s+\*\*(.*?)\*\*/);
  if (!headerMatch) continue;
  const rawTitle = headerMatch[1].trim();
  if (rawTitle.includes('INTRODUCTION')) continue;

  const overview = parseBulletValue(sec, 'Overview');
  const archetype = parseBulletValue(sec, 'Archetype');
  const mandate = parseBulletValue(sec, 'Driving Mandate');
  const sigil = parseBulletValue(sec, 'Symbol/Sigil') || parseBulletValue(sec, 'Symbol / Sigil');
  const capital = parseBulletValue(sec, 'Capital/Key World') || parseBulletValue(sec, 'Capital');
  const techLevel = parseBulletValue(sec, 'Tech Level \\(TL\\)') || parseBulletValue(sec, 'Tech Level');
  const metaLevel = parseBulletValue(sec, 'Meta Level \\(ML\\)') || parseBulletValue(sec, 'Meta Level');
  const wealthMod = parseBulletValue(sec, 'Wealth Modifier');
  const prominentSpecies = parseBulletValue(sec, 'Prominent Species');
  const typicalArchetypes = parseBulletValue(sec, 'Typical Archetypes');
  const recFeatsRaw = parseBulletValue(sec, 'Recommended Features \\(1 BP Discount\\)') || parseBulletValue(sec, 'Recommended Features');
  const recommendedFeatures = parseFeaturesList(recFeatsRaw);
  const skills = parseSkillPackage(sec);

  majorMap[rawTitle] = {
    title: rawTitle,
    rawText: sec.trim(),
    overview,
    archetype,
    mandate,
    sigil,
    capital,
    techLevel,
    metaLevel,
    wealthMod,
    prominentSpecies,
    typicalArchetypes: parseListItems(typicalArchetypes),
    recommendedFeatures,
    skills
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE MINOR FACTIONS
// ─────────────────────────────────────────────────────────────────────────────
const minorRaw = fs.readFileSync(minorPath, 'utf8');
const minorSections = minorRaw.split(/\n(?=##\s+\*\*)/);

const minorMap = {};

for (const sec of minorSections) {
  const headerMatch = sec.match(/^##\s+\*\*(\d+\\\.\s+)?(.*?)\*\*/);
  if (!headerMatch) continue;
  const rawTitle = headerMatch[2].trim();

  const overview = parseBulletValue(sec, 'Overview');
  const archetype = parseBulletValue(sec, 'Archetype');
  const mandate = parseBulletValue(sec, 'Driving Mandate');
  const officialDesig = parseBulletValue(sec, 'Official Designation');
  const colloquialisms = parseBulletValue(sec, 'Colloquialisms');
  const capital = parseBulletValue(sec, 'Capital/Key World');
  const techLevel = parseBulletValue(sec, 'Tech Level \\(TL\\)') || parseBulletValue(sec, 'Tech Level');
  const strengths = parseBulletValue(sec, 'Strengths');
  const weaknesses = parseBulletValue(sec, 'Weaknesses');
  const militaryDoctrine = parseBulletValue(sec, 'Military Doctrine');
  const prominentSpecies = parseBulletValue(sec, 'Prominent Species');
  const typicalArchetypes = parseBulletValue(sec, 'Typical Archetypes');
  const recFeatsRaw = parseBulletValue(sec, 'Recommended Features \\(1 BP Discount\\)') || parseBulletValue(sec, 'Recommended Features');
  const recommendedFeatures = parseFeaturesList(recFeatsRaw);
  const skills = parseSkillPackage(sec);
  const designDirective = parseBulletValue(sec, 'Design Directive');
  const atmosphereTokens = parseBulletValue(sec, 'Atmosphere Tokens');
  const hifiGuidance = parseBulletValue(sec, 'HI-FI INK Guidance');

  minorMap[rawTitle] = {
    title: rawTitle,
    rawText: sec.trim(),
    overview,
    archetype,
    mandate,
    officialDesig,
    colloquialisms,
    capital,
    techLevel,
    strengths,
    weaknesses,
    militaryDoctrine,
    prominentSpecies,
    typicalArchetypes: parseListItems(typicalArchetypes),
    recommendedFeatures,
    skills,
    designDirective,
    atmosphereTokens,
    hifiGuidance
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE WRITING HELPER
// ─────────────────────────────────────────────────────────────────────────────
function writeFactionFile(filename, data) {
  const filePath = path.join(factionsDir, filename);

  const cleanDesc = cleanString(data.description || data.overview || '').replace(/"/g, '\\"');
  const cleanWealth = cleanString(data.wealth_modifier || '0').replace(/"/g, '\\"');
  const cleanFeatures = (data.recommended_features || []).map(cleanString).filter(Boolean);
  const cleanBonus = (data.bonus_features || (cleanFeatures.length > 0 ? [cleanFeatures[0]] : [])).map(cleanString).filter(Boolean);
  const cleanArchetypes = (data.typical_archetypes || []).map(cleanString).filter(Boolean);
  const cleanSkills = (data.skill_package || []).map(cleanString).filter(Boolean);

  const yamlLines = [
    '---',
    `id: ${data.id}`,
    `name: "${cleanString(data.name).replace(/"/g, '\\"')}"`,
    `category: factions`,
    `faction_type: "${cleanString(data.faction_type || 'Major Polity').replace(/"/g, '\\"')}"`,
    `archetype: "${cleanString(data.archetype || '').replace(/"/g, '\\"')}"`,
    `driving_mandate: "${cleanString(data.driving_mandate || '').replace(/"/g, '\\"')}"`,
    `symbol_sigil: "${cleanString(data.symbol_sigil || '').replace(/"/g, '\\"')}"`,
    `capital_world: "${cleanString(data.capital_world || '').replace(/"/g, '\\"')}"`,
    `tech_level: "${cleanString(data.tech_level ?? '3')}"`,
    `meta_level: "${cleanString(data.meta_level ?? '0')}"`,
    `wealth_modifier: "${cleanWealth}"`,
    `prominent_species: "${cleanString(data.prominent_species || '').replace(/"/g, '\\"')}"`,
    `typical_archetypes: ${JSON.stringify(cleanArchetypes)}`,
    `skill_package: ${JSON.stringify(cleanSkills)}`,
    `recommended_features: ${JSON.stringify(cleanFeatures)}`,
    `features: ${JSON.stringify(cleanFeatures)}`,
    `bonus_features: ${JSON.stringify(cleanBonus)}`,
    `description: "${cleanDesc}"`,
    `costs:`,
    `  bp: 0`,
    `  credits: 0`,
    `  nodes: 0`,
    `  sockets: 0`,
    `  strain: 0`,
    `  focus: 0`,
    `  ap: 0`,
    `modifiers: []`,
    `modifications: []`,
    `critical_details:`,
    `  score: ''`,
    `  effect: []`,
    `  success_effect: []`,
    `  failure_effect: []`,
    `sockets:`,
    `  max: 0`,
    `  used: 0`,
    `  tier: Socket`,
    `  allocated: []`,
    `faction_classification: "${data.faction_classification || 'Major Galactic Power'}"`,
    '---',
    '',
    data.body.trim(),
    ''
  ];

  fs.writeFileSync(filePath, yamlLines.join('\n'), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD 15 MAJOR FACTION FILES
// ─────────────────────────────────────────────────────────────────────────────

// 1. Dracon Dynasty
const dracon = majorMap['THE DRACON DYNASTY'] || {};
writeFactionFile('faction-dracon-dynasty.md', {
  id: 'faction-dracon-dynasty',
  name: 'Dracon Dynasty',
  faction_type: 'Major Polity',
  archetype: dracon.archetype || 'Feudal Technocracy / Space Monarchy',
  driving_mandate: dracon.mandate || 'Protect the Realm; Expand through Diplomacy.',
  symbol_sigil: dracon.sigil || 'The Dragon Rampant',
  capital_world: dracon.capital || 'Draconis',
  tech_level: '3',
  meta_level: '3',
  wealth_modifier: dracon.wealthMod || '+2',
  prominent_species: dracon.prominentSpecies || 'Humans, Draconic Descendants',
  typical_archetypes: dracon.typicalArchetypes,
  skill_package: dracon.skills,
  recommended_features: dracon.recommendedFeatures,
  bonus_features: ['Benefit (Status)', 'Combat Specialist'],
  description: dracon.overview,
  faction_classification: 'Major Galactic Power',
  body: dracon.rawText
});

// 2. Syndicate
const syn = majorMap['INCORPORATED PLANETARY SYNDICATION (SYNDICATE)'] || {};
writeFactionFile('faction-syndicate.md', {
  id: 'faction-syndicate',
  name: 'Incorporated Planetary Syndication (The Syndicate)',
  faction_type: 'Major Polity',
  archetype: syn.archetype || 'High-Tech Cyberocracy / Corporate Hegemony',
  driving_mandate: syn.mandate || 'Eliminate Friction; Maximize Efficiency.',
  symbol_sigil: syn.sigil || 'The Hexagon',
  capital_world: syn.capital || 'Premius (Core World)',
  tech_level: '4',
  meta_level: '2',
  wealth_modifier: syn.wealthMod || '+4',
  prominent_species: syn.prominentSpecies || 'Premian, Synthetics, Cybers',
  typical_archetypes: syn.typicalArchetypes,
  skill_package: syn.skills,
  recommended_features: Array.from(new Set(['Underworld Connections', ...(syn.recommendedFeatures || [])])),
  bonus_features: ['Underworld Connections', 'Neural Interface', 'Wealthy'],
  description: syn.overview,
  faction_classification: 'Major Galactic Power',
  body: syn.rawText
});

// 3. Entari Combine
const ent = majorMap['THE ENTARI COMBINE'] || {};
writeFactionFile('faction-entari-combine.md', {
  id: 'faction-entari-combine',
  name: 'The Entari Combine',
  faction_type: 'Major Polity',
  archetype: ent.archetype || 'Planetary Mega-Conglomerate / Hydro-Mineral Technocracy',
  driving_mandate: ent.mandate || 'Resource Monopolization; Industrial Domination.',
  symbol_sigil: ent.sigil || 'The Geared Droplet',
  capital_world: ent.capital || 'Entari Prime (Oceanic Rig World)',
  tech_level: '3',
  meta_level: '1',
  wealth_modifier: ent.wealthMod || '+3',
  prominent_species: ent.prominentSpecies || 'Entari, Humans, Scavengers',
  typical_archetypes: ent.typicalArchetypes,
  skill_package: ent.skills,
  recommended_features: ent.recommendedFeatures,
  bonus_features: ['Industrial Connections', 'Deep Diver'],
  description: ent.overview,
  faction_classification: 'Major Galactic Power',
  body: ent.rawText
});

// 4 & 5. Coalition of Independent Worlds (both files)
const coal = majorMap['COALITION OF INDEPENDENT WORLDS'] || {};
const coalData = {
  name: 'Coalition of Independent Worlds',
  faction_type: 'Major Polity',
  archetype: coal.archetype || 'Democratic Confederation / Frontier League',
  driving_mandate: coal.mandate || 'Defend Self-Determination; Resist Imperial Dominion.',
  symbol_sigil: coal.sigil || 'The Broken Chain over Starfield',
  capital_world: coal.capital || 'Libertalia (Rotating Hub)',
  tech_level: '3',
  meta_level: '2',
  wealth_modifier: coal.wealthMod || '+1',
  prominent_species: coal.prominentSpecies || 'Cosmopolitan Mix (Humans, Dracon, Outsiders)',
  typical_archetypes: coal.typicalArchetypes,
  skill_package: coal.skills,
  recommended_features: coal.recommendedFeatures,
  bonus_features: ['Independent Grit', 'Jack of All Trades'],
  description: coal.overview,
  faction_classification: 'Major Galactic Power',
  body: coal.rawText
};
writeFactionFile('faction-coalition.md', { ...coalData, id: 'faction-coalition' });

// Silvermoon Vanguard (Doppelgangers)
writeFactionFile('faction-silvermoon-vanguard.md', {
  id: 'faction-silvermoon-vanguard',
  name: 'The Silvermoon Vanguard',
  faction_type: 'Major Polity',
  archetype: 'Shadowed Inquisition / Covert Intelligence Network',
  driving_mandate: 'Eradicate true evil through perfect infiltration and absolute intelligence.',
  symbol_sigil: 'The Silver Crescent in Shadow',
  capital_world: 'Nomadic / Classified Deep-Cover Nodes',
  tech_level: '4',
  meta_level: '3',
  wealth_modifier: '+2',
  prominent_species: 'Doppelgangers, Elves',
  typical_archetypes: ['The Infiltrator', 'The Shadow Investigator', 'The Deep Cover Operative', 'The Silent Assassin', 'The Mind-Hunter'],
  skill_package: ['Deception (+5)', 'Stealth (+5)', 'Awareness (+4)', 'Investigation (+4)', 'Combat (Melee) (+3)'],
  recommended_features: ['Shapeshifter', 'Mimic Voice', 'Master of Disguise', 'Unshakable Mind', 'Clandestine Network'],
  bonus_features: ['Shapeshifter', 'Clandestine Network'],
  description: 'A shadow faction engineered to hunt existential corruption. Officially non-existent to younger races, they manipulate galactic events from the shadows via infiltration and surgical strikes.',
  faction_classification: 'Major Galactic Power',
  body: `## **SILVERMOON VANGUARD (Doppelgangers)**

*Part of Elven Providence (The Factional Schisms)*

* **Archetype:** Shadowed Inquisition / Covert Intelligence Network  
* **Capital:** Nomadic / Classified deep-cover nodes.  
* **Mandate:** "Eradicate true evil through perfect infiltration and absolute intelligence."  
* **Profile:** A shadow faction engineered to hunt corruption. They officially "do not exist" to the younger races. They manipulate galactic events from the shadows via assassinations and infiltration. Forced into extreme secrecy due to historical gaslighting and smear campaigns by hostile rulers.`
});

// 6. Outworlds
const out = majorMap['OUTWORLDS'] || {};
writeFactionFile('faction-outworlds.md', {
  id: 'faction-outworlds',
  name: 'The Outworlds',
  faction_type: 'Major Polity',
  archetype: out.archetype || 'Frontier Scavengers / Anarcho-Syndicates',
  driving_mandate: out.mandate || 'Survival through Independence; Defy Central Authority.',
  symbol_sigil: out.sigil || 'The Crossed Rivets',
  capital_world: out.capital || 'Rust-Haven / Dispersed Asteroid Habitats',
  tech_level: '3',
  meta_level: '1',
  wealth_modifier: out.wealthMod || '0',
  prominent_species: out.prominentSpecies || 'Scrappers, Mutant Clades, Humans',
  typical_archetypes: out.typicalArchetypes,
  skill_package: out.skills,
  recommended_features: out.recommendedFeatures,
  bonus_features: ['Scavenger Instinct', 'Rugged Survival'],
  description: out.overview,
  faction_classification: 'Major Galactic Power',
  body: out.rawText
});

// 7. Ascendancy
const asc = majorMap['ASCENDANCY'] || {};
writeFactionFile('faction-ascendancy.md', {
  id: 'faction-ascendancy',
  name: 'The Ascendancy',
  faction_type: 'Major Polity',
  archetype: asc.archetype || 'Psionic Theocracy / Transcendence Hegemony',
  driving_mandate: asc.mandate || 'Uplift Sentient Consciousness; Attune to the Cosmic Weave.',
  symbol_sigil: asc.sigil || 'The Open Lotus of Light',
  capital_world: asc.capital || 'Solace (Crystalline Monastic World)',
  tech_level: '3',
  meta_level: '5',
  wealth_modifier: asc.wealthMod || '+2',
  prominent_species: asc.prominentSpecies || 'Awakened Humans, Psions, Celestines',
  typical_archetypes: asc.typicalArchetypes,
  skill_package: asc.skills,
  recommended_features: asc.recommendedFeatures,
  bonus_features: ['Awakened Mind', 'Deep Attunement'],
  description: asc.overview,
  faction_classification: 'Major Galactic Power',
  body: asc.rawText
});

// 8. Mekan Collective
const mek = majorMap['THE MEKAN COLLECTIVE'] || {};
writeFactionFile('faction-mekan.md', {
  id: 'faction-mekan',
  name: 'The Mekan Collective',
  faction_type: 'Major Polity',
  archetype: mek.archetype || 'Synthetic Technocracy / Machine Consciousness',
  driving_mandate: mek.mandate || 'Perfection of Form; Eradication of Biological Inefficiency.',
  symbol_sigil: mek.sigil || 'The Cog of Eternity',
  capital_world: mek.capital || 'Mekan Prime (Foundry World)',
  tech_level: '5',
  meta_level: '1',
  wealth_modifier: mek.wealthMod || '+4',
  prominent_species: mek.prominentSpecies || 'Mekan Synthetics, Cyborgs, AI Cores',
  typical_archetypes: mek.typicalArchetypes,
  skill_package: mek.skills,
  recommended_features: mek.recommendedFeatures,
  bonus_features: ['Machine Logic', 'Reinforced Chassis'],
  description: mek.overview,
  faction_classification: 'Major Galactic Power',
  body: mek.rawText
});

// 9. Auluran Clans
const aul = majorMap['AULURAN CLANS'] || {};
writeFactionFile('faction-auluran-clans.md', {
  id: 'faction-auluran-clans',
  name: 'Auluran Clans',
  faction_type: 'Major Polity',
  archetype: aul.archetype || 'Nomadic Starfarers / Bio-Smiths',
  driving_mandate: aul.mandate || 'Preserve the Fleet; Honor the Ancestor Pods.',
  symbol_sigil: aul.sigil || 'The Great Flotilla Keel',
  capital_world: aul.capital || 'The Great Armada (Flagship Aulura-Prime)',
  tech_level: '4',
  meta_level: '3',
  wealth_modifier: aul.wealthMod || '+2',
  prominent_species: aul.prominentSpecies || 'Aulurans (Feline Nomads)',
  typical_archetypes: aul.typicalArchetypes,
  skill_package: aul.skills,
  recommended_features: aul.recommendedFeatures,
  bonus_features: ['Zero-G Veteran', 'Bio-Crafting Intuition'],
  description: aul.overview,
  faction_classification: 'Major Galactic Power',
  body: aul.rawText
});

// 10. Elven Providence (The Factional Schisms)
const elv = majorMap['ELVEN PROVIDENCE (THE FACTIONAL SCHISMS)'] || {};
writeFactionFile('faction-elven-providence.md', {
  id: 'faction-elven-providence',
  name: 'Elven Providence',
  faction_type: 'Major Polity',
  archetype: elv.archetype || 'Ancient High Magitech Hegemony (Factional Schisms)',
  driving_mandate: elv.mandate || 'Preserve Ancient Legacy; Navigate Ideological Schisms.',
  symbol_sigil: elv.sigil || 'The Solar Spire / Silver Crescent',
  capital_world: elv.capital || 'Altheria (The Gilded World)',
  tech_level: '4',
  meta_level: '4',
  wealth_modifier: elv.wealthMod || '+3',
  prominent_species: elv.prominentSpecies || 'Celestine, High Elves, Doppelgangers',
  typical_archetypes: elv.typicalArchetypes,
  skill_package: elv.skills.length > 0 ? elv.skills : ['Attune (+5)', 'Culture (+4)', 'Academics (+4)', 'Diplomacy (+4)', 'Combat (+3)'],
  recommended_features: elv.recommendedFeatures.length > 0 ? elv.recommendedFeatures : ['Ancient Lineage', 'Ethereal Grace', 'Benefit (Status)'],
  bonus_features: ['Ancient Lineage', 'Ethereal Grace'],
  description: 'Ancient, fractured civilization encompassing the Alterian Enclave, Silvermoon Vanguard, and Draconian Order across millennia of ideological schisms.',
  faction_classification: 'Major Galactic Power',
  body: elv.rawText
});

// 11. Alterian Enclave (Celestine Elven State)
writeFactionFile('faction-alterian-enclave.md', {
  id: 'faction-alterian-enclave',
  name: 'The Alterian Enclave',
  faction_type: 'Major Polity',
  archetype: 'Galactic Diplomats / Magi-Tech Architects (Celestine)',
  driving_mandate: 'Perfect the Art of Living; Maintain the Galactic Balance.',
  symbol_sigil: 'The Crystalline Star',
  capital_world: 'Altheria (The Gilded World)',
  tech_level: '4',
  meta_level: '4',
  wealth_modifier: '+3',
  prominent_species: 'Celestine (High Elves)',
  typical_archetypes: ['The Diplomat', 'The High Architect', 'The Star Weaver', 'The Sage'],
  skill_package: ['Attune (+5)', 'Diplomacy (+4)', 'Culture (+4)', 'Academics (+4)', 'Combat (+3)'],
  recommended_features: ['Benefit (Status)', 'Ancient Lineage', 'Ethereal Grace', 'Master Craftsman'],
  bonus_features: ['Benefit (Status)', 'Ancient Lineage'],
  description: 'The self-appointed Elder Siblings of the galaxy, ruling from gilded spires and governing through long-view diplomacy and high magitech architecture.',
  faction_classification: 'Major Galactic Power',
  body: `## **ALTERIAN ENCLAVE (Celestine)**

*Part of Elven Providence (The Factional Schisms)*

* **Archetype:** Galactic Diplomats / Magi-Tech Architects  
* **Capital:** Altheria (The Gilded World)  
* **Mandate:** "Perfect the Art of Living; Maintain the Galactic Balance."  
* **Profile:** The self-appointed "Elder Siblings" of the galaxy. They engage heavily in galactic trade and diplomacy, believing the universe functions on harmonic principles ("The Flow"). Governed by a Gerontocracy/Meritocracy. They take "The Long View," moving slowly but acting with overwhelming magi-tech superiority when necessary.`
});

// 12. Kovian Tribunal (Nocturne)
const kov = majorMap['KOVIAN TRIBUNAL (NOCTURNE)'] || {};
writeFactionFile('faction-kovian-tribunal.md', {
  id: 'faction-kovian-tribunal',
  name: 'Kovian Tribunal',
  faction_type: 'Major Polity',
  archetype: kov.archetype || 'Supremacist / Isolationist / Magocracy',
  driving_mandate: kov.mandate || 'Dominance through Darkness; Eradicate Weakness.',
  symbol_sigil: kov.sigil || 'The Eclipse Sigil',
  capital_world: kov.capital || 'Umbra Prime (Umbra Sector)',
  tech_level: '4',
  meta_level: '3',
  wealth_modifier: kov.wealthMod || '+2',
  prominent_species: kov.prominentSpecies || 'Kovian Elves (Nocturne)',
  typical_archetypes: kov.typicalArchetypes,
  skill_package: kov.skills,
  recommended_features: kov.recommendedFeatures,
  bonus_features: ['Shadowmeld', 'Incorruptible Will'],
  description: kov.overview,
  faction_classification: 'Major Galactic Power',
  body: kov.rawText
});

// 13. Vajar Tribes (Wilder)
const vaj = majorMap['VAJAR TRIBES (WILDER)'] || {};
writeFactionFile('faction-vajar.md', {
  id: 'faction-vajar',
  name: 'Vajar Tribes',
  faction_type: 'Major Polity',
  archetype: vaj.archetype || 'Primal Nomads / Survivalist Clans (Wilder)',
  driving_mandate: vaj.mandate || 'Honor the Ancestors; Strength through Hardship.',
  symbol_sigil: vaj.sigil || 'The Beast Skull / Primal Fang',
  capital_world: vaj.capital || 'Vajarath / The Roaming Steppes',
  tech_level: '3',
  meta_level: '3',
  wealth_modifier: vaj.wealthMod || '0',
  prominent_species: vaj.prominentSpecies || 'Vajar Elves (Wilder), Beast-Clans',
  typical_archetypes: vaj.typicalArchetypes,
  skill_package: vaj.skills,
  recommended_features: vaj.recommendedFeatures,
  bonus_features: ['Primal Resilience', 'Beast Hunter'],
  description: vaj.overview,
  faction_classification: 'Major Galactic Power',
  body: vaj.rawText
});

// 14. Impyrium Dominion (Shadow of the Sun)
const imp = majorMap['IMPYRIUM DOMINION (THE SHADOW OF THE SUN)'] || {};
writeFactionFile('faction-impyrium.md', {
  id: 'faction-impyrium',
  name: 'Impyrium Dominion',
  faction_type: 'Major Polity',
  archetype: imp.archetype || 'Militaristic Autocracy / Totalitarian Empire',
  driving_mandate: imp.mandate || 'Total Order; Subjugation through Military Might.',
  symbol_sigil: imp.sigil || 'The Sun in Eclipse / Iron Eagle',
  capital_world: imp.capital || 'Sol-Invictus Prime',
  tech_level: '4',
  meta_level: '3',
  wealth_modifier: imp.wealthMod || '+3',
  prominent_species: imp.prominentSpecies || 'Humans (Imperial Pureblood)',
  typical_archetypes: imp.typicalArchetypes,
  skill_package: imp.skills,
  recommended_features: imp.recommendedFeatures,
  bonus_features: ['Imperial Discipline', 'Authority'],
  description: imp.overview,
  faction_classification: 'Major Galactic Power',
  body: imp.rawText
});

// 15. Radiant Impyrium (The Enlightened Age)
const rad = majorMap['RADIANT IMPYRIUM (THE ENLIGHTENED AGE)'] || {};
writeFactionFile('faction-radiant-impyrium.md', {
  id: 'faction-radiant-impyrium',
  name: 'Radiant Impyrium',
  faction_type: 'Major Polity',
  archetype: rad.archetype || 'Enlightened Monarchy / High Imperial Hegemony',
  driving_mandate: rad.mandate || 'Order through Illumination; The Golden Age of Man.',
  symbol_sigil: rad.sigil || 'The Golden Sunburst',
  capital_world: rad.capital || 'Aethelgard / Sol-Invictus',
  tech_level: '4',
  meta_level: '4',
  wealth_modifier: rad.wealthMod || '+4',
  prominent_species: rad.prominentSpecies || 'Humans, Imperial Ascendants',
  typical_archetypes: rad.typicalArchetypes,
  skill_package: rad.skills,
  recommended_features: rad.recommendedFeatures,
  bonus_features: ['Solar Aura', 'High Imperial Status'],
  description: rad.overview,
  faction_classification: 'Major Galactic Power',
  body: rad.rawText
});

console.log('Successfully generated all 15 major faction files in omnicortex/factions/');

// ─────────────────────────────────────────────────────────────────────────────
// BUILD 25 MINOR FACTION TEMPLATE FILES
// ─────────────────────────────────────────────────────────────────────────────
const minorFileMap = {
  'ALIEN': 'template-alien.md',
  'ARTIFICIAL LIFE': 'template-artificial-life.md',
  'CORPORATE': 'template-corporate.md',
  'CRIMINAL': 'template-criminal.md',
  'COSMIC JUSTICE': 'template-cosmic-justice.md',
  'COSMIC HORROR': 'template-cosmic-horror.md',
  'ENVIRONMENTAL': 'template-environmental.md',
  'GENETIC ENGINEERING': 'template-genetic-engineering.md',
  'HIVE MIND': 'template-hive-mind.md',
  'INTERSTELLAR DIPLOMATS': 'template-interstellar-diplomats.md',
  'MERCENARY': 'template-mercenary.md',
  'MILITARY': 'template-military.md',
  'MUTANT': 'template-mutant.md',
  'PLANETARY': 'template-planetary.md',
  'POLITICAL': 'template-political.md',
  'POST-APOCALYPTIC': 'template-post-apocalyptic.md',
  'REBEL': 'template-rebel.md',
  'RELIGIOUS CULT': 'template-religious-cult.md',
  'SENTIENT INTELLIGENCE': 'template-sentient-intelligence.md',
  'SPACE EXPLORATION': 'template-space-exploration.md',
  'SPACE PIRATE': 'template-space-pirate.md',
  'SPACE RELIGION': 'template-space-religion.md',
  'SPACE TOURISM': 'template-space-tourism.md',
  'SUPERNATURAL': 'template-supernatural.md',
  'TECHNOLOGICAL': 'template-technological.md'
};

for (const [key, filename] of Object.entries(minorFileMap)) {
  const item = minorMap[key];
  if (!item) {
    console.warn(`Could not find parsed minor faction for key: ${key}`);
    continue;
  }

  const cleanId = filename.replace(/\.md$/, '');
  const properName = key.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Faction Template';

  writeFactionFile(filename, {
    id: cleanId,
    name: properName,
    faction_type: 'Generic Template',
    archetype: item.archetype || `${properName} Baseline`,
    driving_mandate: item.mandate || 'Fulfill organizational imperative.',
    symbol_sigil: item.colloquialisms || '',
    capital_world: item.capital || 'Variable',
    tech_level: item.techLevel || '3',
    meta_level: '0',
    wealth_modifier: '0',
    prominent_species: item.prominentSpecies || 'Variable',
    typical_archetypes: item.typicalArchetypes,
    skill_package: item.skills,
    recommended_features: item.recommendedFeatures,
    bonus_features: item.recommendedFeatures.length > 0 ? [item.recommendedFeatures[0]] : [],
    description: item.overview,
    faction_classification: 'Faction Template',
    body: item.rawText
  });
}

console.log('Successfully generated all 25 minor faction template files in omnicortex/factions/');
