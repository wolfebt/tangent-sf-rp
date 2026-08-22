import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const docsDir = path.join(projectRoot, 'docs', 'plans', 'OMNICORTEX');
const compendiumDir = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');
const seedJsonPath = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');

if (!fs.existsSync(compendiumDir)) {
  fs.mkdirSync(compendiumDir, { recursive: true });
}

function readDoc(filename) {
  const p = path.join(docsDir, filename);
  if (fs.existsSync(p)) {
    return fs.readFileSync(p, 'utf8');
  }
  return '';
}

const rawCombat = readDoc('3.00 COMBAT.md');
const rawMetaphysics = readDoc('4.00 METAPHYSICS.md');
const rawFactions = readDoc('1.04 FACTIONS.md');
const rawOrigins = readDoc('1.05 ORIGINS.md');
const rawOccupations = readDoc('1.06 OCCUPATIONS.md');
const rawSkills = readDoc('1.07 SKILLS.md');
const rawFeatures = readDoc('1.08 FEATURES.md');
const rawHindrances = readDoc('1.09 HINDRANCES.md');

// Helper to extract markdown slice by start and end regex/string
function extractSection(text, startPattern, endPattern) {
  const startIdx = text.search(startPattern);
  if (startIdx === -1) return '';
  const sub = text.substring(startIdx);
  if (!endPattern) return sub.trim();
  const endIdx = sub.search(endPattern);
  if (endIdx === -1) return sub.trim();
  return sub.substring(0, endIdx).trim();
}

console.log('Building canonical compendium articles...');
