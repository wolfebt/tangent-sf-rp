import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  splitMarkdownIntoSections,
  loadCompendiumSeedDataset,
  queryOmnicortexRAG,
  CANONICAL_RULES_COMPENDIUM
} from '../../src/services/omnicortexVectorRag.ts';
import {
  mergeSeedsWithDocs,
  saveOmnicortexCustomEntry,
  removeOmnicortexCustomEntry
} from '../../src/utils/omnicortexPersistence.js';
import { adaptItemToCodexFormData } from '../../src/pages/Codex/codexAssetBridge.js';
import {
  replaceMarkdownBodyPreservingFrontmatter,
  runCrossVaultSync
} from '../../scripts/syncRulebooksToOmnicortexEntities.mjs';
import { ingestStagedMarkdown } from '../../scripts/ingestStagedMarkdown.mjs';

test('SSOT Markdown Pipeline — Zero-Truncation RAG, Seed Refresh, & Staging Ingestion', async (t) => {

  await t.test('1. splitMarkdownIntoSections preserves 100% of prose across multi-heading long documents', () => {
    const uniqueTailToken = 'xylophagic_chronos_lattice_9941';
    const longMarkdown = [
      '# Chapter 1: Introduction',
      'A'.repeat(1600),
      '## Section 1.1: Deep Mechanics',
      'B'.repeat(1700),
      '## Section 1.2: Deep Flavor & Unredacted Tail',
      `The ancient vault contains the ${uniqueTailToken} beneath the spire.`
    ].join('\n\n');

    const sections = splitMarkdownIntoSections(longMarkdown, 2000, 2800);
    assert.ok(sections.length >= 2, `Should split long document into multiple sections, got ${sections.length}`);
    const recombined = sections.map(s => s.content).join('\n\n');
    assert.ok(recombined.includes(uniqueTailToken), 'Tail prose past 3,000+ chars must be preserved with zero truncation');
    assert.ok(recombined.includes('A'.repeat(1600)), 'Opening prose must be preserved');
    assert.ok(recombined.includes('B'.repeat(1700)), 'Middle prose must be preserved');
  });

  await t.test('2. Omnicortex Vector RAG indexes multi-section Compendium & Entity Markdown bodies beyond 500 chars', async () => {
    await loadCompendiumSeedDataset();

    const multiSectionChunks = CANONICAL_RULES_COMPENDIUM.filter(c => c.id.includes('-sec-'));
    assert.ok(multiSectionChunks.length > 100, `Expected >100 multi-section rulebook/entity chunks, got ${multiSectionChunks.length}`);

    const entityChunks = CANONICAL_RULES_COMPENDIUM.filter(c => c.id.startsWith('entity-'));
    assert.ok(entityChunks.length >= 900, `Expected >=900 structured Omnicortex entity RAG chunks, got ${entityChunks.length}`);

    // Query deep Alterian clan lore ("Silvermoon Clan" / "Lansmarr Clan") located well past character 500
    const deepLoreResults = queryOmnicortexRAG('Lansmarr Clan Lanaran Clan Silvermoon Clan mahogany', 5);
    assert.ok(deepLoreResults.length > 0, 'Deep lore query past 500 characters must return matches');
    assert.ok(
      deepLoreResults.some(r => r.chunk.text.toLowerCase().includes('lansmarr')),
      'RAG must retrieve unredacted body text well past the legacy 500-character cutoff'
    );
  });

  await t.test('3. mergeSeedsWithDocs refreshes stale/truncated non-custom records while preserving custom user edits', () => {
    const staleDoc = {
      id: 'faction-alterian-enclave',
      name: 'The Alterian Enclave',
      description: 'Short stale description',
      body: 'Truncated old body.'
    };

    const merged = mergeSeedsWithDocs([staleDoc], 'factions', []);
    const refreshed = merged.find(f => f.id === 'faction-alterian-enclave');
    assert.ok(refreshed, 'Alterian Enclave must be present in merged factions');
    assert.ok(
      refreshed.body.length > 2000,
      `Canonical seed body must supersede truncated Firestore body (got ${refreshed.body.length} chars)`
    );

    // Custom entry flagged `isCustom: true` must NOT be overwritten by canonical seed
    const customOverride = {
      id: 'faction-alterian-enclave',
      name: 'The Alterian Enclave (Homebrew)',
      isCustom: true,
      description: 'Custom campaign variant',
      body: 'My custom campaign body text.'
    };
    const mergedWithCustom = mergeSeedsWithDocs([customOverride], 'factions', []);
    const preserved = mergedWithCustom.find(f => f.id === 'faction-alterian-enclave');
    assert.equal(preserved.body, 'My custom campaign body text.');
    removeOmnicortexCustomEntry('factions', 'faction-alterian-enclave');
  });

  await t.test('4. adaptItemToCodexFormData hydrates canonical Markdown body & full_text for Codex AssetStudio', () => {
    const partialOccupation = { id: 'occupation-adept', name: 'Adept' };
    const hydratedOcc = adaptItemToCodexFormData(partialOccupation, 'occupations');
    assert.ok(hydratedOcc.body && hydratedOcc.body.length > 200, 'Occupation Codex form data must hydrate canonical Markdown body');
    assert.equal(hydratedOcc.full_text, hydratedOcc.body);

    const partialArchetype = { id: 'archetype-ace', name: 'The Ace' };
    const hydratedArch = adaptItemToCodexFormData(partialArchetype, 'archetypes');
    assert.ok(hydratedArch.body && hydratedArch.body.includes('The Ace'), 'Archetype Codex form data must hydrate canonical Markdown body');
  });

  await t.test('5. Staging Ingester & Option A Cross-Vault Propagator enforce shrink protection and byte-exact YAML preservation', () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tangent-ssot-test-'));
    try {
      const ruleOriginsDir = path.join(tmpRoot, 'docs', 'game_rules', 'operator', 'origins');
      const omniOriginsDir = path.join(tmpRoot, 'src', 'data', 'omnicortex', 'origins');
      const stagingDir = path.join(tmpRoot, 'staging');
      fs.mkdirSync(ruleOriginsDir, { recursive: true });
      fs.mkdirSync(omniOriginsDir, { recursive: true });
      fs.mkdirSync(stagingDir, { recursive: true });

      const originalRuleFile = path.join(ruleOriginsDir, '1.05.Agricultural.md');
      fs.writeFileSync(originalRuleFile, '# AGRICULTURAL\n\nInitial canonical paragraph with 80 characters of text here.\n', 'utf8');

      const exactFrontmatter = [
        '---',
        'id: origin-agricultural',
        'name: Agricultural',
        'costs:',
        '  cp: 0',
        '  bp: 0',
        "keywords: 'agrarian, hydroponics'",
        '---'
      ].join('\n');
      const originalEntityFile = path.join(omniOriginsDir, 'origin-agricultural.md');
      fs.writeFileSync(originalEntityFile, `${exactFrontmatter}\n\n# Agricultural\n\nShort stub.\n`, 'utf8');

      // Case A: Shorter staged file must be BLOCKED by default
      const stagedRulePath = path.join(stagingDir, '1.05.Agricultural.md');
      fs.writeFileSync(stagedRulePath, '# Tiny accidental truncation\n', 'utf8');

      const shrinkReport = ingestStagedMarkdown({
        projectRoot: tmpRoot,
        stagingDirs: [stagingDir],
        apply: true,
        allowShrink: false,
        silent: true
      });
      assert.equal(shrinkReport.blockedShrinkCount, 1, 'Accidental shrink must be blocked without --allow-shrink');

      // Case B: Expanded unredacted staged rulebook file applies cleanly and propagates via Option A without touching YAML
      const expandedLore = [
        '# 1.05.01 ORIGIN: AGRICULTURAL (+0 WS)',
        '',
        'Expanded unredacted agricultural lore covering orbital solar-mirrors, mega-silos, and preservation worlds in full fidelity.'
      ].join('\n');
      fs.writeFileSync(stagedRulePath, expandedLore, 'utf8');

      const applyReport = ingestStagedMarkdown({
        projectRoot: tmpRoot,
        stagingDirs: [stagingDir],
        apply: true,
        silent: true
      });
      assert.equal(applyReport.appliedCount, 1, 'Expanded staged file should be applied');

      const syncSummary = runCrossVaultSync({
        projectRoot: tmpRoot,
        categories: ['origins'],
        apply: true,
        silent: true
      });
      assert.equal(syncSummary.updated, 1, 'Cross-vault sync should propagate expanded rulebook prose to entity .md');

      const updatedEntityRaw = fs.readFileSync(originalEntityFile, 'utf8');
      assert.ok(updatedEntityRaw.startsWith(exactFrontmatter), 'YAML frontmatter must be preserved byte-for-byte');
      assert.ok(updatedEntityRaw.includes('orbital solar-mirrors, mega-silos'), 'Expanded prose must appear in entity Markdown body');

      // Verify helper directly
      const replaced = replaceMarkdownBodyPreservingFrontmatter(updatedEntityRaw, 'Updated body prose.');
      assert.ok(replaced.startsWith(exactFrontmatter));
      assert.ok(replaced.endsWith('Updated body prose.\n'));
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});
