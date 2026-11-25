/**
 * @file guidedElementForge.test.mjs
 * @description Unit test suite for Phase 1 Guided Element Forge:
 *   1. Playbook coverage across all 17 canonical ELEMENT_TYPES
 *   2. Stage 3 schema filtering (no mechanical/lorebook tab leakage)
 *   3. Non-destructive AI trait merging & diff generation
 *   4. Module Guidance Gems inheritance
 *   5. Readiness scoring, Positive Resonance & Negative Railguard conflict detection
 *   6. BASTION Canonical v6 calibration (Organic 30/30 vs Synthetic 60 SP, EUFT Economatrix, 2d10 CR 15)
 *   7. Lorebook trigger derivation, Resonant Asset Hub recommendations & Artist Hub brief synthesis
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ELEMENT_TYPES } from '../../src/pages/Foundry/ElementForge/elementSchemas.js';
import {
  getPlaybookForType,
  getCoreSchemaFieldsForStage3,
  mergeNonDestructiveTraits,
  inheritGuidanceFromModuleGems,
  computeGuidedElementReadiness,
  searchOmnicortexCanonRecords,
  ARCHETYPE_BLUEPRINTS
} from '../../src/pages/Foundry/ElementForge/guided/elementPlaybooks.js';
import {
  buildDeterministicTraitFallback,
  calibrateElementWithBastion,
  deriveLorebookTriggersFromDraft,
  recommendResonantAssets,
  buildArtistHubVisualBrief
} from '../../src/pages/Foundry/ElementForge/guided/guidedElementAiService.ts';
import { calculateCreditValue } from '../../src/engines/tangentEconEngine.js';
import { formatAimeGuidanceDirective } from '../../src/pages/Foundry/StoryModule/guidanceGemsConfig.js';
import { normalizeLinkedAssets } from '../../src/pages/Foundry/ElementForge/components/assetHubUtils.js';
import { parseAimeAssetFile } from '../../src/services/aimeAssetFileService.js';

test('Playbooks: All 17 canonical ELEMENT_TYPES (with Property consolidating Item & Technology, and Metaphysics separated from Philosophy) resolve to valid 5-family playbooks', () => {
  const validFamilies = new Set(['entity', 'location', 'relic', 'macro', 'epistemic']);
  assert.equal(ELEMENT_TYPES.length, 17);
  assert.ok(ELEMENT_TYPES.includes('Property'));
  assert.ok(ELEMENT_TYPES.includes('Metaphysics'));
  assert.ok(ELEMENT_TYPES.includes('Philosophy'));
  assert.ok(!ELEMENT_TYPES.includes('Item'));
  assert.ok(!ELEMENT_TYPES.includes('Technology'));

  const philPb = getPlaybookForType('Philosophy');
  const metaPb = getPlaybookForType('Metaphysics');
  assert.deepEqual(philPb.dbmCategories, ['philosophy']);
  assert.deepEqual(metaPb.dbmCategories, ['invocations', 'disciplines', 'special_abilities']);

  for (const elType of ELEMENT_TYPES) {
    const pb = getPlaybookForType(elType);
    assert.equal(pb.elementType, elType, `${elType} should resolve to canonical elementType`);
    assert.ok(validFamilies.has(pb.family), `${elType} family "${pb.family}" must be valid`);
    assert.ok(pb.pitchKey && pb.pitchKey.length > 0, `${elType} must define a pitchKey`);
    assert.ok(pb.stage3Title && pb.stage4Title, `${elType} must define Stage 3 & Stage 4 titles`);

    const stage3 = getCoreSchemaFieldsForStage3(elType);
    assert.ok(stage3.length > 0, `${elType} should expose at least 1 core trait field in Stage 3`);
    for (const f of stage3) {
      assert.notEqual(f.tab, 'Modular Assembly (MCM)');
      assert.notEqual(f.tab, 'Relations & Scripting');
      assert.notEqual(f.tab, 'Dynamic Lorebook');
      assert.notEqual(f.tab, 'Lorebook & Triggers');
    }
  }
});

test('Blueprints: Includes all 10 legacy Scenario Guides plus family blueprints (>= 15 total)', () => {
  assert.ok(ARCHETYPE_BLUEPRINTS.length >= 15);
  const npcBp = ARCHETYPE_BLUEPRINTS.find((b) => b.id === 'sg_npc');
  assert.ok(npcBp);
  assert.equal(npcBp.elementType, 'Persona');
  assert.ok(npcBp.seedGuidance);
});

test('mergeNonDestructiveTraits: Populates empty fields and stages diffs for populated fields', () => {
  const currentFields = {
    oneLinePitch: 'My handwritten gritty cyber-medic pitch',
    archetype: ''
  };
  const proposedFields = {
    oneLinePitch: 'AI proposed alternative pitch',
    archetype: 'Trauma Slicer',
    motivationsGoals: 'Clear syndicate debt'
  };
  const schema = [
    { key: 'oneLinePitch', label: 'One-Line Pitch' },
    { key: 'archetype', label: 'Archetype' },
    { key: 'motivationsGoals', label: 'Motivations & Goals' }
  ];

  const { mergedFields, appliedKeys, diffs } = mergeNonDestructiveTraits(
    currentFields,
    proposedFields,
    schema
  );

  // Handwritten field is NEVER overwritten
  assert.equal(mergedFields.oneLinePitch, 'My handwritten gritty cyber-medic pitch');
  // Blank fields ARE populated
  assert.equal(mergedFields.archetype, 'Trauma Slicer');
  assert.equal(mergedFields.motivationsGoals, 'Clear syndicate debt');
  assert.deepEqual(appliedKeys.sort(), ['archetype', 'motivationsGoals']);

  // Conflict surfaced cleanly as a diff
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].key, 'oneLinePitch');
  assert.equal(diffs[0].proposedValue, 'AI proposed alternative pitch');
});

test('inheritGuidanceFromModuleGems: Maps module string gems and scenario guidance into AIME Gems', () => {
  const inherited = inheritGuidanceFromModuleGems(
    ['Genre: Sci-Fi', 'Cynical', 'Urgent', 'Metaphor', 'Cyber-Noir'],
    { pov: 'Third Person Limited' },
    {}
  );

  assert.equal(inherited.genre, 'Sci-Fi');
  assert.equal(inherited.tone, 'Cynical');
  assert.equal(inherited.pacing, 'Urgent');
  assert.equal(inherited.pov, 'Third Person Limited');
  assert.equal(inherited.Mood, 'Cyber-Noir');
  assert.deepEqual(inherited.literaryDevices, ['Metaphor']);
});

test('computeGuidedElementReadiness: Scores 0-100 and detects Resonance + Railguard conflicts', () => {
  const emptyReport = computeGuidedElementReadiness({
    type: 'Persona',
    title: '',
    content: '',
    fields: {},
    guidance: {},
    assetHub: []
  });
  assert.equal(emptyReport.score, 0);
  assert.equal(emptyReport.stages.spark, 'empty');

  const populatedReport = computeGuidedElementReadiness({
    type: 'Persona',
    title: 'Commander Vane',
    content: '<p>A rain-slicked cybernetic veteran haunted by time travel experiments.</p>',
    imageUrl: 'https://example.com/vane.png',
    fields: {
      oneLinePitch: 'Disgraced syndicate enforcer',
      archetype: 'Enforcer',
      physicalDescription: 'Rain-slicked trenchcoat and brass cyber-arm',
      motivationsGoals: 'Protect Kestrel Station',
      keywords: 'rain-slicked, cybernetic, neon',
      negative_keywords: 'time travel, elves',
      mcmTier: '4',
      health: '58',
      primaryTriggers: 'Commander Vane, Vane'
    },
    guidance: {
      genre: 'Sci-Fi',
      tone: 'Cynical'
    },
    assetHub: [{ assetId: 'el_kestrel', assetTitle: 'Kestrel Station', assetType: 'Setting', importance: 'high', annotation: 'Base' }]
  });

  assert.equal(populatedReport.score, 100);
  assert.ok(populatedReport.resonantKeywords.includes('rain-slicked'));
  assert.ok(populatedReport.resonantKeywords.includes('cybernetic'));
  assert.deepEqual(populatedReport.railguardConflicts, ['time travel']);
});

test('calibrateElementWithBastion: Enforces Canonical v6 Organic (30/30) vs Synthetic (60 SP) & EUFT math', () => {
  // 1. Organic Persona
  const organic = calibrateElementWithBastion({
    draft: {
      id: 'p1',
      type: 'Persona',
      title: 'Dr. Sera Kael',
      content: 'Elite medic operative',
      fields: { oneLinePitch: 'Frontline human medic' },
      customFields: [],
      guidance: {},
      assetHub: []
    }
  });
  assert.equal(organic.calibratedFields.physiology, 'Organic');
  assert.ok(Number(organic.calibratedFields.vitality) >= 30);
  assert.ok(Number(organic.calibratedFields.health) >= 30);

  // 2. Synthetic Construct Persona
  const synthetic = calibrateElementWithBastion({
    draft: {
      id: 'p2',
      type: 'Persona',
      title: 'Unit HK-9',
      content: 'Autonomous combat android sentry',
      fields: { 'char-species': 'Mekan Construct' },
      customFields: [],
      guidance: {},
      assetHub: []
    }
  });
  assert.equal(synthetic.calibratedFields.physiology, 'Synthetic');
  assert.equal(synthetic.calibratedFields.vitality, '0');
  assert.ok(Number(synthetic.calibratedFields.structure) >= 60);

  // 3. Relic / Item EUFT Economatrix parity
  const relic = calibrateElementWithBastion({
    draft: {
      id: 'i1',
      type: 'Item',
      title: 'Prototype Phase Rifle',
      content: 'Experimental hard-light rifle',
      fields: { costCr: '18' },
      customFields: [],
      guidance: {},
      assetHub: []
    }
  });
  assert.equal(relic.calibratedFields.costCr, '18');
  assert.equal(Number(relic.calibratedFields.creditValue), calculateCreditValue(18));

  // 4. Epistemic Clue CR 15 baseline
  const clue = calibrateElementWithBastion({
    draft: {
      id: 'c1',
      type: 'Clue',
      title: 'Encrypted Airlock Datapad',
      content: 'Recovered terminal log',
      fields: {},
      customFields: [],
      guidance: {},
      assetHub: []
    }
  });
  assert.equal(clue.calibratedFields.analysisCr, '15');
  assert.ok(clue.calibratedFields.analysisSkill.includes('Slicing'));
});

test('Stage 3 Fallback, Lorebook Triggers, Resonant Assets & Artist Hub Brief', () => {
  const draft = {
    id: 'el_vane',
    type: 'Persona',
    title: 'Commander Vane',
    content: 'Operates out of Kestrel Station alongside the Entari Syndicate.',
    fields: {
      oneLinePitch: 'Rogue tactical commander',
      'char-faction': 'Entari Syndicate',
      physicalDescription: 'Chrome optics and scarred titanium jaw',
      'tech-level': '4'
    },
    customFields: [],
    guidance: { genre: 'Sci-Fi', tone: 'Cynical' },
    assetHub: []
  };

  const fallback = buildDeterministicTraitFallback(draft);
  assert.ok(Object.keys(fallback.proposedFields).length > 3);
  assert.ok(fallback.proposedProse.includes('Commander Vane'));

  const triggers = deriveLorebookTriggersFromDraft(draft);
  assert.ok(triggers.primaryTriggers.includes('Commander Vane'));
  assert.ok(triggers.primaryTriggers.includes('Vane'));
  assert.ok(triggers.secondaryTriggers.includes('Entari Syndicate'));

  const catalog = [
    { id: 'el_kestrel', title: 'Kestrel Station', type: 'Setting', fields: {} },
    { id: 'el_vault', title: 'Orbital Vault Nine', type: 'Setting', fields: {} },
    { id: 'el_unrelated', title: 'Deep Void Leviathan', type: 'Persona', fields: {} }
  ];
  const draftWithBracket = {
    ...draft,
    content: 'Operates out of Kestrel Station and holds keys to [The Sealed Vault|Orbital Vault Nine].'
  };
  const recs = recommendResonantAssets({ draft: draftWithBracket, catalog, currentElementId: 'el_vane' });
  assert.equal(recs.length, 2);
  assert.ok(recs.some((r) => r.assetId === 'el_kestrel' && r.suggestedImportance === 'high'));
  assert.ok(
    recs.some(
      (r) =>
        r.assetId === 'el_vault' &&
        r.matchReason === 'Explicit [Bracket] reference in traits/prose'
    )
  );

  const brief = buildArtistHubVisualBrief(draft);
  assert.ok(brief.includes('Commander Vane (Persona)'));
  assert.ok(brief.includes('Chrome optics'));
  assert.ok(brief.includes('Tech Level 4'));
});

test('searchOmnicortexCanonRecords: Returns empty when query is blank and searches all Omnicortex categories on demand', () => {
  const sampleDbData = {
    archetypes: [
      { id: 'arch_academic', name: 'The Academic', description: 'Conducts research to further knowledge.' },
      { id: 'arch_ace', name: 'The Ace', description: 'Navigates starships through asteroids.' }
    ],
    factions: [
      { id: 'fac_entari', name: 'Entari Combine', description: 'Corporatehegemony ruling core trade lanes.' }
    ],
    architecture: [
      { id: 'arch_station', name: 'Orbital Bastion Dock', description: 'Pressurized starship drydock.' }
    ],
    weaponry: [
      { id: 'wpn_lance', name: 'Entari Phase Lance', description: 'High-energy particle rifle.' }
    ]
  };

  // No pre-populated archetype catalog when search input is empty
  assert.deepEqual(searchOmnicortexCanonRecords(sampleDbData, ''), []);
  assert.deepEqual(searchOmnicortexCanonRecords(sampleDbData, '   '), []);

  // Searches across all Omnicortex categories once user types a query
  const dockResults = searchOmnicortexCanonRecords(sampleDbData, 'bastion dock', []);
  assert.equal(dockResults.length, 1);
  assert.equal(dockResults[0].dbmCategory, 'architecture');
  assert.equal(dockResults[0].displayTitle, 'Orbital Bastion Dock');

  // Archetypes remain searchable if explicitly queried
  const aceResults = searchOmnicortexCanonRecords(sampleDbData, 'The Ace', []);
  assert.equal(aceResults.length, 1);
  assert.equal(aceResults[0].dbmCategory, 'archetypes');

  // Preferred playbook categories receive tie-break boost for equivalent prefix matches
  const entariForFaction = searchOmnicortexCanonRecords(sampleDbData, 'entari', ['factions']);
  assert.equal(entariForFaction.length, 2);
  assert.equal(entariForFaction[0].dbmCategory, 'factions');
});

test('Wave EF-2/EF-3: calibrateElementWithBastion covers Persona (Synthetic vs Organic), Metaphysics, Species, and Faction', () => {
  const synthRes = calibrateElementWithBastion({
    draft: {
      id: 'el_syn',
      title: 'Unit 734',
      type: 'Persona',
      content: '',
      customFields: [],
      guidance: {},
      assetHub: [],
      fields: { physiology: 'Synthetic', mcmTier: '2', mcmRole: 'Operative', mcmChassis: 'Android' }
    }
  });
  assert.equal(synthRes.calibratedFields.vitality, '0');
  assert.ok(Number(synthRes.calibratedFields.health) >= 60);
  assert.ok(synthRes.summaryBadge.includes('SP'));

  const organicRes = calibrateElementWithBastion({
    draft: {
      id: 'el_org',
      title: 'Renn',
      type: 'Persona',
      content: '',
      customFields: [],
      guidance: {},
      assetHub: [],
      fields: { physiology: 'Organic', mcmTier: '2', mcmRole: 'Bruiser', mcmChassis: 'Standard' }
    }
  });
  assert.ok(Number(organicRes.calibratedFields.vitality) >= 30);
  assert.ok(organicRes.summaryBadge.includes('VP'));

  const metaRes = calibrateElementWithBastion({
    draft: {
      id: 'el_meta',
      title: 'Void Lance',
      type: 'Metaphysics',
      content: '',
      customFields: [],
      guidance: {},
      assetHub: [],
      fields: { meta_level: '3', meta_skill: 'Meta-Temporal' }
    }
  });
  assert.ok(Number(metaRes.calibratedFields.design_dc) >= 15);
  assert.ok(String(metaRes.calibratedFields.cast_time || '').includes('Strain'));

  const speciesRes = calibrateElementWithBastion({
    draft: {
      id: 'el_sp',
      title: 'Aetherian',
      type: 'Species',
      content: '',
      customFields: [],
      guidance: {},
      assetHub: [],
      fields: { techLevel: '4' }
    }
  });
  assert.equal(speciesRes.calibratedFields.techLevel, '4');
  assert.equal(speciesRes.calibratedFields.physiology, 'Organic');
  assert.ok(speciesRes.summaryBadge.includes('TL-4'));

  const factionRes = calibrateElementWithBastion({
    draft: {
      id: 'el_fac',
      title: 'Vanguard Consortium',
      type: 'Faction',
      content: '',
      customFields: [],
      guidance: {},
      assetHub: [],
      fields: { techLevel: '4', disposition: 'Hostile' }
    }
  });
  assert.equal(factionRes.calibratedFields.disposition, 'Hostile');
  assert.ok(String(factionRes.calibratedFields.clockGoal || '').includes('Vanguard Consortium'));
});

test('Wave EF-3/EF-4: formatAimeGuidanceDirective includes Extended Gems, normalizeLinkedAssets deduplicates, and parseAimeAssetFile sanitizes imports', () => {
  const directive = formatAimeGuidanceDirective({
    genre: 'Sci-Fi',
    tone: 'Serious',
    Mood: 'Gritty & Bleak',
    Theme: 'Survival vs Identity',
    Conflict: 'Person vs System',
    'Setting Style': 'Cyberpunk Megacity'
  });
  assert.ok(directive.includes('Mood: Gritty & Bleak'));
  assert.ok(directive.includes('Theme: Survival vs Identity'));
  assert.ok(directive.includes('Conflict Focus: Person vs System'));
  assert.ok(directive.includes('Setting Style: Cyberpunk Megacity'));

  const normalizedHub = normalizeLinkedAssets(
    [
      null,
      'el_1',
      { assetId: 'el_1', importance: 'high' },
      { assetId: 'el_2', assetTitle: 'Custom', importance: 'low' }
    ],
    [{ id: 'el_1', title: 'Alpha Station', type: 'Setting' }]
  );
  assert.equal(normalizedHub.length, 2);
  assert.equal(normalizedHub[0].assetTitle, 'Alpha Station');
  assert.equal(normalizedHub[1].assetId, 'el_2');

  const imported = parseAimeAssetFile(
    JSON.stringify({
      aimeVersion: '1.0',
      assetType: 'Persona',
      title: 'Imported Rogue',
      isCortexAsset: true,
      isPinnedToModule: true,
      dbmRef: 'secret_dbm_1',
      traits: { dbmRef: 'secret_dbm_1', dbmCategory: 'modular_characters', archetype: 'Infiltrator' }
    }),
    'rogue.persona'
  );
  assert.equal(imported.dbmSyncStatus, 'standalone');
  assert.equal(imported.isCortexAsset, undefined);
  assert.equal(imported.isPinnedToModule, undefined);
  assert.equal(imported.fields.dbmRef, undefined);
  assert.equal(imported.fields.archetype, 'Infiltrator');
});
