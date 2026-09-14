import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const compDir = path.join(projectRoot, 'src/data/omnicortex/compendium');
const seedPath = path.join(projectRoot, 'src/data/compendiumSeed.json');
const skillsDir = path.join(projectRoot, 'src/data/omnicortex/skills');
const bastionServicePath = path.join(projectRoot, 'src/services/bastionService.js');
const bastionAgentPath = path.join(projectRoot, 'src/engine/ai/BastionAgent.ts');
const specializedRulesPath = path.join(projectRoot, 'src/data/omnicortexSpecializedRules.json');
const catalogChunksPath = path.join(projectRoot, 'src/data/bastionCatalogChunks.json');

test('Omnicortex Compendium: 1-to-1 Parity between Markdown Files and compendiumSeed.json', () => {
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const mdFiles = fs.readdirSync(compDir).filter(f => f.endsWith('.md'));

  assert(seed.length >= 190, `Expected at least 190 seed articles, got ${seed.length}`);
  assert.equal(seed.length, mdFiles.length, `Expected seed count (${seed.length}) to match md files count (${mdFiles.length})`);

  const seedIds = new Set(seed.map(s => s.id));
  mdFiles.forEach(file => {
    const id = file.replace('.md', '');
    assert(seedIds.has(id), `Markdown file ${file} is missing from compendiumSeed.json`);
  });

  // Verify all 30 core docs from docs/game rules exist
  const coreDocIds = [
    'doc-operator-1-00-introduction',
    'doc-operator-1-01-character-creation',
    'doc-operator-1-02-archetypes',
    'doc-operator-1-03-species-work',
    'doc-operator-1-04-factions',
    'doc-operator-1-05-origins',
    'doc-operator-1-06-occupations',
    'doc-operator-1-07-skills',
    'doc-operator-1-08-features',
    'doc-operator-1-09-hindrances',
    'doc-operator-1-10-scaling',
    'doc-operator-2-00-economatrix',
    'doc-operator-3-00-combat',
    'doc-operator-4-00-metaphysics',
    'doc-architect-99-archetypes',
    'doc-architect-99-metaphysics',
    'doc-architect-99-metaphysics-invocation-matrix',
    'doc-architect-99-metaphysics-meta-tech-matrix',
    'doc-architect-99-modular-character-matrix',
    'doc-architect-99-modular-companion-matrix',
    'doc-architect-99-modular-faction-matrix',
    'doc-architect-99-modular-planetary-matrix',
    'doc-architect-99-modular-species-matrix',
    'doc-architect-99-technology-architectural-matrix',
    'doc-architect-99-technology-armor-matrix',
    'doc-architect-99-technology-augmentations-matrix',
    'doc-architect-99-technology-equipment-matrix',
    'doc-architect-99-technology-mecha-matrix',
    'doc-architect-99-technology-weaponry-matrix',
    'doc-architect-99-technology'
  ];

  coreDocIds.forEach(docId => {
    assert(seedIds.has(docId), `Critical game rule doc ${docId} missing from compendiumSeed.json`);
    const entry = seed.find(s => s.id === docId);
    assert(entry && entry.description.length > 5000, `Doc ${docId} should contain full rule text`);
  });
});

test('Omnicortex Compendium: 2d10 Dual Resolution Engine Canon (No d20 Resolution)', () => {
  const resFile = path.join(compDir, '2-01-2d10-dual-resolution-engine.md');
  assert(fs.existsSync(resFile), '2-01-2d10-dual-resolution-engine.md must exist');

  const content = fs.readFileSync(resFile, 'utf8');
  assert(content.includes('2d10'), 'Resolution engine must explicitly state 2d10');
  assert(content.includes('DEFENDER WINS ALL TIES'), 'Must state DEFENDER WINS ALL TIES');
  assert(content.includes('CR 15'), 'Must state baseline CR 15 for unopposed');
  assert(!fs.existsSync(path.join(compDir, '2-01-d20-universal-resolution-engine.md')), 'Legacy d20 file must not exist');
});

test('Omnicortex Skills: 100% Parity for all 95 Canonical Skills', async () => {
  const { ALL_CANONICAL_SKILLS } = await import('../../src/data/skillsData.js');
  assert(Array.isArray(ALL_CANONICAL_SKILLS), 'SkillsData must export ALL_CANONICAL_SKILLS');
  assert.equal(ALL_CANONICAL_SKILLS.length, 95, 'Expected exactly 95 canonical skills');

  const skillFiles = new Set(fs.readdirSync(skillsDir));
  ALL_CANONICAL_SKILLS.forEach(s => {
    const expectedFile = `${s.id}.md`;
    assert(skillFiles.has(expectedFile), `Skill ${s.name} (${s.id}) missing markdown file ${expectedFile} in omnicortex/skills`);
  });
});

test('BASTION Service: System Prompt Adheres to Skill Tier Action Economy (NO AP)', () => {
  const bastionServiceCode = fs.readFileSync(bastionServicePath, 'utf8');
  assert(bastionServiceCode.includes('Skill Tier Action Economy (NO Action Points / AP)'), 'BASTION prompt must enforce Skill Tier Action Economy');
  assert(bastionServiceCode.includes('DEFENDER WINS ALL TIES'), 'BASTION prompt must enforce DEFENDER WINS ALL TIES');
  assert(!bastionServiceCode.includes('3 AP + 1 Reaction'), 'BASTION prompt must NOT contain legacy 3 AP action economy');
});

test('Bastion Rules Agent: Conforms to Base 0 Attributes and 1 BP/Skill Rank', () => {
  const agentCode = fs.readFileSync(bastionAgentPath, 'utf8');
  assert(agentCode.includes('ATTR_BASE = 0'), 'BastionRulesAgent must have ATTR_BASE = 0');
  assert(agentCode.includes('SKILL_COST_PER_RANK = 1'), 'BastionRulesAgent must have SKILL_COST_PER_RANK = 1');
  assert(!agentCode.includes('ATTR_BASE = 10'), 'BastionRulesAgent must NOT have ATTR_BASE = 10');
});

test('BASTION RAG: Specialized Rules and Master Catalog Datasets are Populated', () => {
  assert(fs.existsSync(specializedRulesPath), 'omnicortexSpecializedRules.json must exist');
  const specRules = JSON.parse(fs.readFileSync(specializedRulesPath, 'utf8'));
  assert(Array.isArray(specRules) && specRules.length >= 75, `Expected >= 75 specialized rules, got ${specRules.length}`);

  assert(fs.existsSync(catalogChunksPath), 'bastionCatalogChunks.json must exist');
  const catChunks = JSON.parse(fs.readFileSync(catalogChunksPath, 'utf8'));
  assert(Array.isArray(catChunks) && catChunks.length >= 40, `Expected >= 40 catalog chunks, got ${catChunks.length}`);
});
