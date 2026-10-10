import test from 'node:test';
import assert from 'node:assert/strict';

import { detectIntentCategories, queryOmnicortexRAG } from '../../src/services/omnicortexVectorRag.ts';
import { categoryConfig } from '../../src/components/DBM/categoryConfig.js';

test('Search Directives & Railguards: RAG Intent Detection', () => {
  const directiveQuery1 = detectIntentCategories('find directives for cybernetic cyberware');
  assert.ok(directiveQuery1.includes('directives'), 'Detects directives category intent');

  const directiveQuery2 = detectIntentCategories('show positive keywords and directives');
  assert.ok(directiveQuery2.includes('directives'), 'Detects positive keywords intent');

  const railguardQuery1 = detectIntentCategories('check railguards and exclusions');
  assert.ok(railguardQuery1.includes('railguards'), 'Detects railguards category intent');

  const railguardQuery2 = detectIntentCategories('negative keywords boundary restrictions');
  assert.ok(railguardQuery2.includes('railguards'), 'Detects negative keywords intent');
});

test('Search Directives & Railguards: RAG Query with Active Category Filters', () => {
  const resultDirectives = queryOmnicortexRAG('cybernetic directives guidance', {
    categoryFilter: 'directives',
    topK: 10
  });
  assert.ok(resultDirectives.length > 0, 'Returns RAG results for directives category filter');
  assert.ok(resultDirectives.some(r => r.chunk.id === 'rule-architect-directives-keywords'), 'Matches directives rule chunk');

  const resultRailguards = queryOmnicortexRAG('synthetic exclusions railguards', {
    categoryFilter: 'railguards',
    topK: 10
  });
  assert.ok(resultRailguards.length > 0, 'Returns RAG results for railguards category filter');
  assert.ok(resultRailguards.some(r => r.chunk.id === 'rule-architect-railguards-exclusions'), 'Matches railguards rule chunk');
});

test('Search Directives & Railguards: Category Filtering and Schema Parity', () => {
  // Test helper replicating standard directives / railguards filter
  const filterByDirective = (items) => items.filter(item => {
    const kw = item.keywords || item.directives;
    return Array.isArray(kw) ? kw.length > 0 : !!(kw && String(kw).trim());
  });

  const filterByRailguard = (items) => items.filter(item => {
    const negKw = item.negative_keywords || item.railguards || item.negativeKeywords;
    return Array.isArray(negKw) ? negKw.length > 0 : !!(negKw && String(negKw).trim());
  });

  // Verify filter logic with mock and configured entities
  const sampleEntities = [
    { id: '1', name: 'Cybernetic Specimen', keywords: ['cyberware', 'augments'], negative_keywords: ['primitive'] },
    { id: '2', name: 'Feral Stalker', keywords: 'stealth, hunting', negative_keywords: 'heavy armor, tech' },
    { id: '3', name: 'Raw Baseline', description: 'Standard template without keywords' }
  ];

  const directiveEntities = filterByDirective(sampleEntities);
  const railguardEntities = filterByRailguard(sampleEntities);

  assert.equal(directiveEntities.length, 2, '2 entities match Directives (+KW)');
  assert.equal(railguardEntities.length, 2, '2 entities match Railguards (-KW)');
  assert.ok(!directiveEntities.some(e => e.id === '3'), 'Baseline without keywords excluded from directives');
  assert.ok(!railguardEntities.some(e => e.id === '3'), 'Baseline without negative keywords excluded from railguards');

  // Verify all categories in categoryConfig define keywords & negative_keywords schema fields
  const coreCategories = ['species', 'factions', 'origins', 'occupations', 'skills', 'features', 'weaponry', 'armoring', 'gear', 'mecha', 'architecture', 'other'];
  for (const cat of coreCategories) {
    if (categoryConfig[cat]?.fields) {
      assert.ok(categoryConfig[cat].fields.keywords, `categoryConfig.${cat} must define keywords field`);
      assert.ok(categoryConfig[cat].fields.negative_keywords, `categoryConfig.${cat} must define negative_keywords field`);
    }
  }
});

test('Search Directives & Railguards: Free-Text Search matches Keywords & Negative Keywords', () => {
  const matchSearch = (item, query) => {
    const q = query.toLowerCase();
    const name = (item.name || item.title || '').toLowerCase();
    const desc = (item.description || item.desc || '').toLowerCase();
    const kw = (item.keywords ? (Array.isArray(item.keywords) ? item.keywords.join(' ') : String(item.keywords)) : '').toLowerCase();
    const negKw = (item.negative_keywords ? (Array.isArray(item.negative_keywords) ? item.negative_keywords.join(' ') : String(item.negative_keywords)) : '').toLowerCase();
    return name.includes(q) || desc.includes(q) || kw.includes(q) || negKw.includes(q);
  };

  const sampleItems = [
    { id: 'item-1', name: 'Exo-Spine Mk III', description: 'Hydraulic skeletal frame', keywords: ['neural-mesh', 'biometal'] },
    { id: 'item-2', name: 'Stealth Weave Suit', description: 'Chameleon fiber bodysuit', negative_keywords: ['power-generator', 'loud'] },
    { id: 'item-3', name: 'Standard Med-Kit', description: 'Emergency trauma supplies' }
  ];

  // Match via positive directive keywords
  const kwMatches = sampleItems.filter(i => matchSearch(i, 'neural-mesh'));
  assert.equal(kwMatches.length, 1);
  assert.equal(kwMatches[0].id, 'item-1');

  // Match via negative railguard keywords
  const negKwMatches = sampleItems.filter(i => matchSearch(i, 'power-generator'));
  assert.equal(negKwMatches.length, 1);
  assert.equal(negKwMatches[0].id, 'item-2');

  // Negative test: non-matching query
  const noneMatches = sampleItems.filter(i => matchSearch(i, 'plasma-arc'));
  assert.equal(noneMatches.length, 0);
});

test('Search Directives & Railguards: VTT Catalog Outliner Filter Tag Matching', () => {
  const matchesSearch = (text, tagType, entity, activeFilterTag, searchQuery) => {
    if (activeFilterTag) {
      if (activeFilterTag === '#maps' && tagType !== 'map') return false;
      if (activeFilterTag === '#hero' && tagType !== 'hero') return false;
      if (activeFilterTag === '#npc' && tagType !== 'npc') return false;
      if (activeFilterTag === '#clue' && tagType !== 'clue') return false;
      if (activeFilterTag === '#item' && tagType !== 'item') return false;
      if (activeFilterTag === '#directives') {
        const kw = entity?.keywords || entity?.fields?.keywords || entity?.meta?.keywords;
        const hasKw = Array.isArray(kw) ? kw.length > 0 : !!(kw && String(kw).trim());
        if (!hasKw) return false;
      }
      if (activeFilterTag === '#railguards') {
        const negKw = entity?.negative_keywords || entity?.negativeKeywords || entity?.fields?.negative_keywords || entity?.meta?.negative_keywords;
        const hasNegKw = Array.isArray(negKw) ? negKw.length > 0 : !!(negKw && String(negKw).trim());
        if (!hasNegKw) return false;
      }
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (text.toLowerCase().includes(q)) return true;
    if (entity) {
      const kw = entity.keywords || entity.fields?.keywords || entity.meta?.keywords;
      const kwStr = (kw ? (Array.isArray(kw) ? kw.join(' ') : String(kw)) : '').toLowerCase();
      if (kwStr.includes(q)) return true;

      const negKw = entity.negative_keywords || entity.negativeKeywords || entity.fields?.negative_keywords || entity.meta?.negative_keywords;
      const negKwStr = (negKw ? (Array.isArray(negKw) ? negKw.join(' ') : String(negKw)) : '').toLowerCase();
      if (negKwStr.includes(q)) return true;
    }
    return false;
  };

  const itemWithDirectives = { name: 'Thermal Katana', keywords: ['melee', 'high-tech', 'plasma'] };
  const itemWithRailguards = { name: 'Standard Carbine', negative_keywords: ['primitive', 'magical'] };
  const itemPlain = { name: 'Iron Pipe' };

  // #directives tag
  assert.equal(matchesSearch(itemWithDirectives.name, 'item', itemWithDirectives, '#directives', ''), true);
  assert.equal(matchesSearch(itemWithRailguards.name, 'item', itemWithRailguards, '#directives', ''), false);
  assert.equal(matchesSearch(itemPlain.name, 'item', itemPlain, '#directives', ''), false);

  // #railguards tag
  assert.equal(matchesSearch(itemWithDirectives.name, 'item', itemWithDirectives, '#railguards', ''), false);
  assert.equal(matchesSearch(itemWithRailguards.name, 'item', itemWithRailguards, '#railguards', ''), true);
  assert.equal(matchesSearch(itemPlain.name, 'item', itemPlain, '#railguards', ''), false);

  // Free-text keyword search
  assert.equal(matchesSearch(itemWithDirectives.name, 'item', itemWithDirectives, null, 'plasma'), true);
  assert.equal(matchesSearch(itemWithRailguards.name, 'item', itemWithRailguards, null, 'magical'), true);
  assert.equal(matchesSearch(itemPlain.name, 'item', itemPlain, null, 'plasma'), false);
});
