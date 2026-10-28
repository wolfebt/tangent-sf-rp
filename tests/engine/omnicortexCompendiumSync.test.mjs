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

  assert(seed.length >= 260, `Expected at least 260 modular seed articles, got ${seed.length}`);
  assert.equal(seed.length, mdFiles.length, `Expected seed count (${seed.length}) to match md files count (${mdFiles.length})`);

  const seedIds = new Set(seed.map(s => s.id));
  mdFiles.forEach(file => {
    const id = file.replace('.md', '');
    assert(seedIds.has(id), `Markdown file ${file} is missing from compendiumSeed.json`);
  });

  // Verify all 14 Operator Master Chapters + 8 Architect Master Matrices + sample modular sub-docs
  const coreDocIds = [
    'doc-operator-1-00-introduction',
    'doc-operator-1-01-character-creation',
    'doc-operator-1-02-archetypes',
    'doc-operator-1-03-species',
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
    'doc-architect-02-economy-and-wealth',
    'doc-architect-99-metaphysics',
    'doc-architect-99-modular-character-matrix',
    'doc-architect-99-modular-companion-matrix',
    'doc-architect-99-modular-faction-matrix',
    'doc-architect-99-modular-planetary-matrix',
    'doc-architect-99-modular-species-matrix',
    'doc-architect-99-technology',
    // Sample modular sub-documents
    'doc-operator-1-03-aeld',
    'doc-operator-1-03-aeld-alterian',
    'doc-operator-1-04-aeldprovidence',
    'doc-operator-1-07-physical',
    'doc-architect-99-tech-mecha-forgeprotocol',
    'doc-architect-99-metaphysics-invocationmatrix'
  ];

  // Ensure legacy architect archetypes section is removed from Architect compendium list
  assert(!seedIds.has('doc-architect-99-archetypes'), 'Legacy doc-architect-99-archetypes must not be in Architect compendium');

  // Ensure Architect section names do not have leading numbers like "02" or "99."
  const archEntries = seed.filter(s => s.perspective === 'architect');
  archEntries.forEach(entry => {
    assert(
      !/^(?:02|99\.?)\s/.test(entry.name),
      `Architect section "${entry.name}" (${entry.id}) should not start with a number prefix like "02" or "99."`
    );
  });

  coreDocIds.forEach(docId => {
    assert(seedIds.has(docId), `Critical game rule doc ${docId} missing from compendiumSeed.json`);
    const entry = seed.find(s => s.id === docId);
    assert(entry && entry.description.length > 500, `Doc ${docId} should contain rule text`);
  });

  // Verify zero orphaned parents across all 267 articles
  const validCategories = new Set([
    '1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)',
    '5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)'
  ]);
  seed.forEach(entry => {
    assert(
      validCategories.has(entry.parent) || seedIds.has(entry.parent),
      `Article ${entry.id} has invalid/orphaned parent: ${entry.parent}`
    );
  });
});

test('Omnicortex Compendium: 2d10 Dual Resolution Engine Canon (No d20 Resolution)', () => {
  const combatFile = path.join(compDir, 'doc-operator-3-00-combat.md');
  assert(fs.existsSync(combatFile), 'doc-operator-3-00-combat.md must exist');

  const content = fs.readFileSync(combatFile, 'utf8');
  assert(content.includes('2d10'), 'Resolution engine must explicitly state 2d10');
  assert(content.includes('DEFENDER WINS ALL TIES'), 'Must state DEFENDER WINS ALL TIES');
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

test('Omnicortex Compendium: Strict Canonical Numbered Index Order & Zero Erroneous Content', async () => {
  const { mergeSeedsWithDocs } = await import('../../src/utils/omnicortexPersistence.js');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  // 1. Ensure zero occurrences of non-canonical "Free Worlds Coalition" anywhere in compendiumSeed.json
  const hasFreeWorlds = seed.some(
    a =>
      (a.name || '').toLowerCase().includes('free worlds coalition') ||
      (a.description || '').toLowerCase().includes('free worlds coalition')
  );
  assert.equal(hasFreeWorlds, false, 'Compendium must NOT contain non-canonical "Free Worlds Coalition"');

  // 2. Ensure Coalition of Independent Worlds is present with exact canonical name
  const coalitionDoc = seed.find(a => a.id === 'doc-operator-1-04-major-coalition');
  assert(coalitionDoc, 'doc-operator-1-04-major-coalition must exist');
  assert.equal(coalitionDoc.name, '1.04 Major: Coalition of Independent Worlds');

  // 3. Ensure Operator root chapters are strictly ordered 1.00 -> 4.00
  const opMasters = seed
    .filter(a => a.parent === '1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)')
    .sort((a, b) => a.order - b.order);
  const expectedOpMasters = [
    '1.00 INTRODUCTION',
    '1.01 CHARACTER CREATION',
    '1.02 ARCHETYPES',
    '1.03 SPECIES',
    '1.04 FACTIONS',
    '1.05 ORIGINS',
    '1.06 OCCUPATIONS',
    '1.07 SKILLS',
    '1.08 FEATURES',
    '1.09 HINDRANCES',
    '1.10 SCALING',
    '2.00 ECONOMATRIX',
    '3.00 COMBAT',
    '4.00 METAPHYSICS'
  ];
  assert.deepEqual(
    opMasters.map(a => a.name),
    expectedOpMasters,
    'Operator root chapters must be in exact numbered index order 1.00 -> 4.00'
  );

  // 4. Ensure mergeSeedsWithDocs('compendium') rejects stale legacy Firestore documents
  const pollutedFirestoreDocs = [
    { id: 'comp-1-04-03', name: '1.04.03 Free Worlds Coalition & Frontier Alliance', description: 'Guessed content' },
    { id: 'comp-0-01', name: '0.01 OPERATOR Reference Manual', description: 'Legacy content' }
  ];
  const merged = mergeSeedsWithDocs(pollutedFirestoreDocs, 'compendium');
  assert.equal(merged.length, seed.length, 'mergeSeedsWithDocs must return only canonical seed articles');
  assert(!merged.some(a => a.id === 'comp-1-04-03'), 'Stale Firestore doc comp-1-04-03 must be rejected');

  // 5. Ensure Humans, Orll, and Sha'Nor have both Lineage Overviews and Baseline child entries first in their submenus
  const lineageChecks = [
    {
      parentId: 'doc-operator-1-03-humans',
      baseId: 'doc-operator-1-03-humans-base',
      baseName: '1.03 Humans: Humans (Base)'
    },
    {
      parentId: 'doc-operator-1-03-orll',
      baseId: 'doc-operator-1-03-orll-base',
      baseName: '1.03 Orll: Orll (Base)'
    },
    {
      parentId: 'doc-operator-1-03-shanor',
      baseId: 'doc-operator-1-03-shanor-base',
      baseName: "1.03 Sha'Nor: Sha'Nor (Base)"
    }
  ];

  for (const { parentId, baseId, baseName } of lineageChecks) {
    const parentNode = seed.find(a => a.id === parentId);
    assert(parentNode, `Lineage overview ${parentId} must exist`);
    assert.equal(parentNode.parent, 'doc-operator-1-03-species');

    const children = seed.filter(a => a.parent === parentId).sort((a, b) => a.order - b.order);
    assert(children.length >= 2, `Lineage ${parentId} must have baseline + offshoot children`);
    assert.equal(children[0].id, baseId, `First child of ${parentId} must be baseline entry ${baseId}`);
    assert.equal(children[0].name, baseName);
  }
});

test('Omnicortex Compendium: No Dummy File-Path Placeholders in Seed or Markdown Files', () => {
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  // Ensure zero articles contain the dummy boilerplate file-path placeholders
  const hasDummyMechanic = seed.some(a => (a.mechanic || '').startsWith('See full canonical text'));
  const hasDummyGuide = seed.some(a => (a.guide || '').includes('in the game rules library for complete'));
  const hasDummyNote = seed.some(a => (a.note || '').includes('Complete, unabridged source of truth'));

  assert.equal(hasDummyMechanic, false, 'No seed article should contain dummy mechanic placeholder');
  assert.equal(hasDummyGuide, false, 'No seed article should contain dummy guide placeholder');
  assert.equal(hasDummyNote, false, 'No seed article should contain dummy note placeholder');

  // Verify markdown files also do not contain dummy placeholders
  const mdFiles = fs.readdirSync(compDir).filter(f => f.endsWith('.md'));
  for (const file of mdFiles) {
    const content = fs.readFileSync(path.join(compDir, file), 'utf8');
    assert.equal(content.includes('See full canonical text'), false, `${file} must not contain dummy mechanic placeholder`);
    assert.equal(content.includes('in the game rules library for complete architectural tables'), false, `${file} must not contain dummy guide placeholder`);
    assert.equal(content.includes('Complete, unabridged source of truth'), false, `${file} must not contain dummy note placeholder`);
  }
});

