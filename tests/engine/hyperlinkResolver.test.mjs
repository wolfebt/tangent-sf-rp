import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseBracketToken,
  matchPlatformSection,
  matchElementsCatalog,
  matchCodexEntry,
  resolveHyperlinkTarget,
  extractBracketedTokens,
  extractAndResolveBracketContext,
  formatBracketContextForAI,
  SECTION_REGISTRY
} from '../../src/services/hyperlinkResolver.js';
import { synthesizeSuperPrompt } from '../../src/services/superPromptSynthesizer.js';
import { formatContext } from '../../src/services/aimeService.js';

describe('Hyperlink Resolver Engine', () => {
  describe('parseBracketToken', () => {
    it('parses simple term', () => {
      const parsed = parseBracketToken('[Laser Carbine]');
      assert.equal(parsed.displayLabel, 'Laser Carbine');
      assert.equal(parsed.identifier, 'Laser Carbine');
      assert.equal(parsed.prefix, null);
    });

    it('parses double brackets', () => {
      const parsed = parseBracketToken('[[Sector 4 Outpost]]');
      assert.equal(parsed.displayLabel, 'Sector 4 Outpost');
      assert.equal(parsed.identifier, 'Sector 4 Outpost');
      assert.equal(parsed.prefix, null);
    });

    it('parses display label with explicit prefix target [Label|section:target]', () => {
      const parsed = parseBracketToken('[Review Rules|section:compendium]');
      assert.equal(parsed.displayLabel, 'Review Rules');
      assert.equal(parsed.prefix, 'section');
      assert.equal(parsed.identifier, 'compendium');
    });

    it('parses target with display label [codex:Auluran|Auluran Race]', () => {
      const parsed = parseBracketToken('[codex:Auluran|Auluran Race]');
      assert.equal(parsed.displayLabel, 'Auluran Race');
      assert.equal(parsed.prefix, 'codex');
      assert.equal(parsed.identifier, 'Auluran');
    });

    it('parses standard alias [Alias|Target]', () => {
      const parsed = parseBracketToken('[Big Gun|Plasma Cannon]');
      assert.equal(parsed.displayLabel, 'Big Gun');
      assert.equal(parsed.identifier, 'Plasma Cannon');
      assert.equal(parsed.prefix, null);
    });
  });

  describe('matchPlatformSection', () => {
    it('matches section by key', () => {
      const section = matchPlatformSection('folio');
      assert.ok(section);
      assert.equal(section.key, 'folio');
      assert.equal(section.url, '/folio');
    });

    it('matches section by alias', () => {
      const section = matchPlatformSection('battlemap');
      assert.ok(section);
      assert.equal(section.key, 'stage');
    });

    it('matches comms section', () => {
      const section = matchPlatformSection('docket');
      assert.ok(section);
      assert.equal(section.key, 'comms');
    });
  });

  describe('matchElementsCatalog', () => {
    const mockCatalog = [
      { id: 'elem-1', title: 'Quantum Core', type: 'Artifact', fields: { summary: 'Super dense energy node.' } },
      { id: 'elem-2', title: 'Dr. Vance', type: 'NPC', fields: { summary: 'Chief cyberneticist.' } }
    ];

    it('matches element by exact title', () => {
      const found = matchElementsCatalog('Quantum Core', mockCatalog);
      assert.ok(found);
      assert.equal(found.id, 'elem-1');
    });

    it('matches element case-insensitively', () => {
      const found = matchElementsCatalog('dr. vance', mockCatalog);
      assert.ok(found);
      assert.equal(found.id, 'elem-2');
    });
  });

  describe('matchCodexEntry', () => {
    const mockDbData = {
      species: [
        { id: 'sp-1', name: 'Auluran', description: 'Avian bio-synthetics.' }
      ],
      weaponry: [
        { id: 'wp-1', name: 'Plasma Carbine', description: 'High-energy tactical rifle.' }
      ]
    };

    it('matches species in dbData', () => {
      const matched = matchCodexEntry('Auluran', mockDbData);
      assert.ok(matched);
      assert.equal(matched.item.id, 'sp-1');
      assert.equal(matched.collection, 'species');
    });

    it('matches weaponry in dbData', () => {
      const matched = matchCodexEntry('Plasma Carbine', mockDbData);
      assert.ok(matched);
      assert.equal(matched.item.id, 'wp-1');
      assert.equal(matched.collection, 'weaponry');
    });
  });

  describe('resolveHyperlinkTarget', () => {
    const mockCatalog = [
      { id: 'elem-1', title: 'Laser Carbine', type: 'Gear', fields: { summary: 'Standard issue energy carbine.' } }
    ];
    const mockDbData = {
      species: [
        { id: 'sp-1', name: 'Auluran', description: 'Avian bio-synthetics.' }
      ]
    };

    it('auto-resolves Platform Section first', () => {
      const res = resolveHyperlinkTarget('[Folio]', { elementsCatalog: mockCatalog, dbData: mockDbData });
      assert.equal(res.targetType, 'section');
      assert.equal(res.url, '/folio');
      assert.equal(res.exists, true);
    });

    it('auto-resolves Elements Catalog', () => {
      const res = resolveHyperlinkTarget('[Laser Carbine]', { elementsCatalog: mockCatalog, dbData: mockDbData });
      assert.equal(res.targetType, 'catalog');
      assert.equal(res.title, 'Laser Carbine');
      assert.equal(res.exists, true);
    });

    it('auto-resolves Codex entry', () => {
      const res = resolveHyperlinkTarget('[Auluran]', { elementsCatalog: mockCatalog, dbData: mockDbData });
      assert.equal(res.targetType, 'codex');
      assert.equal(res.title, 'Auluran');
      assert.equal(res.exists, true);
    });

    it('respects explicit section prefix [section:stage]', () => {
      const res = resolveHyperlinkTarget('[section:stage]', { elementsCatalog: mockCatalog, dbData: mockDbData });
      assert.equal(res.targetType, 'section');
      assert.equal(res.url, '/stage');
    });

    it('respects explicit alias [Tactical Grid|section:stage]', () => {
      const res = resolveHyperlinkTarget('[Tactical Grid|section:stage]', { elementsCatalog: mockCatalog, dbData: mockDbData });
      assert.equal(res.targetType, 'section');
      assert.equal(res.displayLabel, 'Tactical Grid');
      assert.equal(res.url, '/stage');
    });

    it('returns unresolved structure gracefully for unknown terms', () => {
      const res = resolveHyperlinkTarget('[Unknown Secret Relic]', { elementsCatalog: mockCatalog, dbData: mockDbData });
      assert.equal(res.targetType, 'unresolved');
      assert.equal(res.exists, false);
      assert.equal(res.displayLabel, 'Unknown Secret Relic');
    });

    it('resolves [1.01 character creation] to Compendium rules with default rules entry and selectable options', () => {
      const res = resolveHyperlinkTarget('[1.01 character creation]', { elementsCatalog: mockCatalog, dbData: mockDbData });
      assert.equal(res.targetType, 'compendium');
      assert.equal(res.title, '1.01 CHARACTER CREATION');
      assert.equal(res.url, '/compendium?article=doc-operator-1-01-character-creation');
      assert.equal(res.badge, 'COMPENDIUM: OPERATOR');
      assert.ok(res.options && res.options.length >= 8, 'Must have at least 8 available options');

      // Default option must be the rules entry
      const defaultOption = res.options[0];
      assert.equal(defaultOption.isDefault, true);
      assert.equal(defaultOption.targetType, 'compendium');
      assert.equal(defaultOption.url, '/compendium?article=doc-operator-1-01-character-creation');

      // Must include Persona Folio as an available platform builder option
      const folioOption = res.options.find(o => o.url === '/folio' || o.id === 'section-folio');
      assert.ok(folioOption, 'Must include Persona Folio as selectable platform builder option');
      assert.equal(folioOption.targetType, 'section');

      // Must include sub-rules (Attributes, Movement, Perception, etc.)
      const attrOption = res.options.find(o => o.url.includes('doc-operator-1-01-attributes'));
      assert.ok(attrOption, 'Must include 1.01 Attributes sub-rule');
      assert.equal(attrOption.targetType, 'compendium');
      assert.equal(attrOption.badge, 'SUB-RULE');

      const vitalsOption = res.options.find(o => o.url.includes('doc-operator-1-01-vitalityhealthstructure'));
      assert.ok(vitalsOption, 'Must include 1.01 Vitality, Health & Structure sub-rule');
    });

    it('resolves [Character Creation] without rule number to the rules entry', () => {
      const res = resolveHyperlinkTarget('[Character Creation]', { elementsCatalog: mockCatalog, dbData: mockDbData });
      assert.equal(res.targetType, 'compendium');
      assert.equal(res.title, '1.01 CHARACTER CREATION');
      assert.equal(res.url, '/compendium?article=doc-operator-1-01-character-creation');
    });
  });

  describe('AI Ingestion Bracket Reference Engine', () => {
    const mockCatalog = [
      {
        id: 'elem-core',
        title: 'Quantum Core',
        type: 'Artifact',
        fields: {
          oneLinePitch: 'Super dense chroniton power node.',
          summary: 'Power grid stabilizer for high-tier facilities.',
          techLevel: 4
        }
      }
    ];

    const mockDbData = {
      species: [
        {
          id: 'sp-auluran',
          name: 'Auluran',
          tl: 4,
          description: 'Avian bio-synthetics with resonance crests.',
          traits: ['Acoustic Echo', 'Low-G Mobility']
        }
      ]
    };

    it('extractBracketedTokens extracts single and double bracketed expressions', () => {
      const text = 'Operatives deployed with [Quantum Core] to investigate [[Auluran]] ruins near [Stage]. Also check [Unknown Relic].';
      const tokens = extractBracketedTokens(text);
      assert.deepEqual(tokens, [
        '[Quantum Core]',
        '[[Auluran]]',
        '[Stage]',
        '[Unknown Relic]'
      ]);
    });

    it('extractAndResolveBracketContext resolves all referenced entities', () => {
      const prompt = 'Investigate [Quantum Core] and consult [Auluran] records before returning to [Folio].';
      const resolved = extractAndResolveBracketContext(prompt, { elementsCatalog: mockCatalog, dbData: mockDbData });

      assert.equal(resolved.length, 3);
      assert.equal(resolved[0].targetType, 'catalog');
      assert.equal(resolved[0].title, 'Quantum Core');
      assert.equal(resolved[1].targetType, 'codex');
      assert.equal(resolved[1].title, 'Auluran');
      assert.equal(resolved[2].targetType, 'section');
      assert.equal(resolved[2].title, 'Persona Folio');
    });

    it('formatBracketContextForAI produces structured prompt context block', () => {
      const prompt = 'Deliver [Quantum Core] to [Auluran] elders.';
      const resolved = extractAndResolveBracketContext(prompt, { elementsCatalog: mockCatalog, dbData: mockDbData });
      const formatted = formatBracketContextForAI(resolved);

      assert.ok(formatted.includes('=== [EXPLICIT BRACKETED REFERENCES & ENTITY DOSSIERS — MANDATORY AI CONTEXT] ==='));
      assert.ok(formatted.includes('[CATALOG ASSET: ARTIFACT] "Quantum Core"'));
      assert.ok(formatted.includes('Super dense chroniton power node.'));
      assert.ok(formatted.includes('[CODEX ARCHIVE: CODEX: SPECIES] "Auluran"'));
      assert.ok(formatted.includes('Acoustic Echo, Low-G Mobility'));
    });

    it('synthesizeSuperPrompt embeds bracket context block automatically', () => {
      const prompt = synthesizeSuperPrompt({
        taskPrompt: 'Analyze the containment field around [Quantum Core].',
        catalog: mockCatalog,
        dbData: mockDbData
      });

      assert.ok(prompt.includes('=== [EXPLICIT BRACKETED REFERENCES & ENTITY DOSSIERS — MANDATORY AI CONTEXT] ==='));
      assert.ok(prompt.includes('[CATALOG ASSET: ARTIFACT] "Quantum Core"'));
      assert.ok(prompt.includes('Super dense chroniton power node.'));
    });

    it('formatContext embeds bracket context for empty context with bracketed promptQuery', () => {
      const formatted = formatContext('', 'Direct operatives to the [Folio] sector immediately.');
      assert.ok(formatted.includes('=== [EXPLICIT BRACKETED REFERENCES & ENTITY DOSSIERS — MANDATORY AI CONTEXT] ==='));
      assert.ok(formatted.includes('[PLATFORM SECTION: PERSONA FOLIO] "Persona Folio"'));
    });

    it('formatContext embeds codex bracket context when dbData is provided in context', () => {
      const formatted = formatContext({ dbData: mockDbData }, 'Explain the [Auluran] species physiology.');
      assert.ok(formatted.includes('=== [EXPLICIT BRACKETED REFERENCES & ENTITY DOSSIERS — MANDATORY AI CONTEXT] ==='));
      assert.ok(formatted.includes('[CODEX ARCHIVE: CODEX: SPECIES] "Auluran"'));
    });

    it('formatContext embeds bracket context for rich scenario context objects', () => {
      const formatted = formatContext({
        activeNode: {
          id: 'sc-1',
          title: 'Ruins of Eld',
          content: 'The shrine houses the [Quantum Core].'
        },
        catalog: mockCatalog,
        dbData: mockDbData
      }, 'Describe the scene.');

      assert.ok(formatted.includes('=== [EXPLICIT BRACKETED REFERENCES & ENTITY DOSSIERS — MANDATORY AI CONTEXT] ==='));
      assert.ok(formatted.includes('[CATALOG ASSET: ARTIFACT] "Quantum Core"'));
    });
  });
});

