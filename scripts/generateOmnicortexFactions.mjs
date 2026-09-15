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
  return str.replace(/\s+/g, ' ').trim();
}

function parseBulletValue(sectionText, prefixPattern) {
  const regex = new RegExp(`\\*\\s*\\*\\*${prefixPattern}:?\\*\\*\\s*:?\\s*(.*)`, 'i');
  const match = sectionText.match(regex);
  return match ? cleanString(match[1]) : '';
}

function parseSkillPackage(sectionText) {
  const skills = [];
  const startMatch = sectionText.match(/\*+\s*\*{0,2}Faction Skill Package[^:]*:\*{0,2}([\s\S]*?)(?=(\n\s*\*+\s*\*{0,2}Typical Archetypes|\n\s*\*+\s*\*{0,2}Recommended Features|\n\s*###|\n\s*##|$))/i);
  if (startMatch) {
    const lines = startMatch[1].split('\n');
    for (const line of lines) {
      const bullet = line.match(/^\s*[*+-]\s+(.*)/);
      if (bullet) {
        const item = cleanString(bullet[1]);
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
    .map(f => cleanString(f).replace(/^\*+|\*+$/g, '').replace(/^`+|`+$/g, ''))
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE MAJOR FACTIONS
// ─────────────────────────────────────────────────────────────────────────────
const majorRaw = fs.readFileSync(majorPath, 'utf8');
// Split by `## **...**`
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
    rawText: sec,
    overview,
    archetype,
    mandate,
    sigil,
    capital,
    techLevel,
    metaLevel,
    wealthMod,
    prominentSpecies,
    typicalArchetypes,
    recommendedFeatures,
    skills
  };
}

console.log(`Parsed ${Object.keys(majorMap).length} major faction sections:`, Object.keys(majorMap));

// ─────────────────────────────────────────────────────────────────────────────
// PARSE MINOR FACTIONS
// ─────────────────────────────────────────────────────────────────────────────
const minorRaw = fs.readFileSync(minorPath, 'utf8');
const minorSections = minorRaw.split(/\n(?=##\s+\*\*)/);

const minorList = [];

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

  minorList.push({
    title: rawTitle,
    rawText: sec,
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
    typicalArchetypes,
    recommendedFeatures,
    skills,
    designDirective,
    atmosphereTokens,
    hifiGuidance
  });
}

console.log(`Parsed ${minorList.length} minor faction templates:`, minorList.map(m => m.title));
