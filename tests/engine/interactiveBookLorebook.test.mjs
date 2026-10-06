/**
 * @file interactiveBookLorebook.test.mjs
 * @description Unit tests for Interactive Book Mode & Dynamic Lorebook integration,
 * validating Custom Codex schemas, recursive lore scanning, user-defined field serialization,
 * and presentation contracts for LorebookDossierModal and InteractiveBookView.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { 
  ELEMENT_TYPES, 
  ELEMENT_SCHEMAS, 
  AIME_CORE_MODULES, 
  SCENARIO_GUIDE_MODULES, 
  CUSTOM_ELEMENT_SCHEMA,
  getTypePillStyle,
  getElementFileExtension
} from '../../src/pages/Foundry/ElementForge/elementSchemas.js';

import { 
  EXTENSION_TO_TYPE_MAP,
  serializeAimeAsset,
  parseAimeAssetFile
} from '../../src/services/aimeAssetFileService.js';

import { 
  parseElementMarkdown, 
  validateElementAgainstSchema 
} from '../../src/services/elementIngestionService.js';

import { 
  scanDynamicLorebook, 
  extractLoreSnippet,
  estimateTokenCount,
  compileTriggerRegex 
} from '../../src/services/lorebookScanner.ts';

describe('Phase 1: Custom Codex Schema & Ingestion Integration', () => {

  test('Custom element schema is registered across all taxonomy catalogs', () => {
    // 1. Core element types list
    assert.ok(ELEMENT_TYPES.includes('Custom'), 'ELEMENT_TYPES must include Custom');
    assert.ok(!ELEMENT_TYPES.includes('Custom Codex'), 'ELEMENT_TYPES must not include Custom Codex');
    assert.ok(!ELEMENT_TYPES.includes('Custom Element'), 'ELEMENT_TYPES must not include Custom Element');

    // 2. Element schemas dictionary
    assert.ok(ELEMENT_SCHEMAS['Custom'], 'ELEMENT_SCHEMAS must define Custom');
    assert.ok(Array.isArray(ELEMENT_SCHEMAS['Custom']), 'ELEMENT_SCHEMAS[Custom] must be an array of fields');
    assert.equal(ELEMENT_SCHEMAS['Custom'], CUSTOM_ELEMENT_SCHEMA);

    // 3. Scenario Guide Modules
    const customGuide = SCENARIO_GUIDE_MODULES.find(m => m.elementType === 'Custom' || m.name.includes('Custom'));
    assert.ok(customGuide, 'SCENARIO_GUIDE_MODULES must contain Custom');

    // 4. File extension mappings
    assert.equal(getElementFileExtension('Custom'), '.custom');
    assert.equal(EXTENSION_TO_TYPE_MAP['.custom'], 'Custom');

    // 5. Visual styling badge helper
    const pillStyle = getTypePillStyle('Custom');
    assert.ok(pillStyle.includes('teal'), `Pill style should use teal styling: ${pillStyle}`);
  });

  test('elementIngestionService parses Custom Codex markdown files', () => {
    const customMarkdown = `
# **Custom Codex Development Fields**

This document provides a framework for user-defined worldbuilding codex entries.

### **1. Core Identity**

* **Custom Title:** The Obsidian Covenant
* **Codex Category:** Secret Society
* **Summary / Pitch:** An esoteric cabal manipulating sub-space communications across Sector 9.
* **Tags / Keywords:** conspiracy, sub-space, covert, cipher

### **2. Descriptive Details**

* **Comprehensive Description:** Operating from dormant comms relays, the Obsidian Covenant monitors encrypted hyperspace traffic using quantum decryption keys.

### **3. Lorebook Triggers & Dynamic Injection**

* **Primary Triggers:** obsidian covenant, covert cabal, sub-space cipher
* **Secondary Triggers:** dormant relay, quantum decryption
* **Trigger Regex:** /\\b(obsidian[- ]covenant|sub-space cipher)\\b/i
* **Lore Scan Priority:** 85
* **Lore Budget Tokens:** 220
`;

    const parsed = parseElementMarkdown(customMarkdown, 'obsidian-covenant.custom.md');
    assert.equal(parsed.type, 'Custom');
    assert.equal(parsed.title, 'The Obsidian Covenant');
    assert.equal(parsed.fields.category, 'Secret Society');
    assert.equal(parsed.fields.primaryTriggers, 'obsidian covenant, covert cabal, sub-space cipher');
    assert.equal(Number(parsed.fields.loreScanPriority), 85);
    assert.equal(Number(parsed.fields.loreBudgetTokens), 220);

    const validation = validateElementAgainstSchema(parsed);
    assert.equal(validation.valid, true);
    assert.ok(validation.completenessScore > 0);
  });

  test('aimeAssetFileService serializes and parses .custom AIME assets with user custom fields', () => {
    const asset = {
      id: 'custom_cipher_protocol',
      title: 'Protocol Blacklight',
      type: 'Custom',
      category: 'Encryption Protocol',
      fields: {
        category: 'Cyber-Warfare',
        summary: 'Emergency quantum scrubbing algorithm.',
        description: 'Purges neural cyberdeck memory within 3 clock cycles.',
        primaryTriggers: 'blacklight, emergency purge, neural scrub'
      },
      customFields: [
        { id: 'cf_1', label: 'Purge Delay', value: '3 clock cycles', type: 'text' },
        { id: 'cf_2', label: 'Recovery Key', value: 'OMEGA-992-SIGMA', type: 'text' }
      ]
    };

    const serializedObj = serializeAimeAsset(asset);
    const jsonStr = JSON.stringify(serializedObj, null, 2);
    const parsed = parseAimeAssetFile(jsonStr, 'protocol_blacklight.custom');

    assert.equal(parsed.type, 'Custom');
    assert.equal(parsed.title, 'Protocol Blacklight');
    assert.equal(parsed.customFields.length, 2);
    assert.equal(parsed.customFields[0].label, 'Purge Delay');
    assert.equal(parsed.customFields[1].value, 'OMEGA-992-SIGMA');
  });
});

describe('Phase 2: Lore Snippet Extraction with User-Defined Custom Fields', () => {

  test('extractLoreSnippet includes standard metadata and dynamic user-defined fields', () => {
    const customElement = {
      id: 'elem_vault_kheper',
      title: 'Vault Kheper',
      type: 'Custom',
      fields: {
        category: 'Forbidden Archive',
        summary: 'A sub-surface precursor bunker submerged in liquid methane.',
        techLevel: 'TL-5',
        tags: 'bunker, precursor, archive',
        description: 'Constructed during the Third Expansion era to seal anomalous temporal artifacts.'
      },
      customFields: [
        { label: 'Access Code', value: 'DELTA-ZERO-SEVEN' },
        { label: 'Internal Pressure', value: '450 atmospheres' }
      ]
    };

    const { snippet, tokens } = extractLoreSnippet(customElement, 250);

    assert.ok(snippet.includes('Category: Forbidden Archive'), 'Snippet should contain category');
    assert.ok(snippet.includes('Summary: A sub-surface precursor bunker'), 'Snippet should contain summary');
    assert.ok(snippet.includes('Tech Level: TL-5'), 'Snippet should contain Tech Level');
    assert.ok(snippet.includes('User Fields: [Access Code: DELTA-ZERO-SEVEN, Internal Pressure: 450 atmospheres]'), 'Snippet should format custom fields');
    assert.ok(tokens > 0 && tokens <= 250, 'Tokens should be within budget');
  });

  test('extractLoreSnippet gracefully falls back when fields are sparse', () => {
    const minimalElement = {
      id: 'elem_minimal',
      title: 'Uncharted Outpost',
      type: 'Custom',
      description: 'An abandoned research station with frozen comms arrays.'
    };

    const { snippet, tokens } = extractLoreSnippet(minimalElement, 150);
    assert.ok(snippet.includes('An abandoned research station'));
    assert.ok(tokens > 0);
  });
});

describe('Phase 3: scanDynamicLorebook with Custom Codex & Multi-Pass Association', () => {

  const testCatalog = [
    {
      id: 'elem_custom_cabal',
      title: 'The Ghost Vector',
      type: 'Custom',
      fields: {
        category: 'Netrunning Syndicate',
        primaryTriggers: 'ghost vector, phantom signal',
        secondaryTriggers: 'neural proxy, siphon sub-routine',
        triggerRegex: '/\\bghost[- ]vector\\b/i',
        loreScanPriority: 80,
        loreBudgetTokens: 180,
        summary: 'An autonomous cyber-entity collective inhabiting defunct relay nodes.',
        description: 'They utilize experimental Precursor Nanite Swarms to reconstruct damaged optical conduits.'
      },
      customFields: [
        { label: 'Network Node', value: 'Sub-Grid 88' },
        { label: 'Threat Signature', value: 'Class IV Intrusion' }
      ]
    },
    {
      id: 'elem_nanites',
      title: 'Precursor Nanite Swarm',
      type: 'Technology',
      fields: {
        primaryTriggers: 'nanite swarm, nanites, microscopic constructors',
        secondaryTriggers: 'Precursor Nanite Swarms, nanite matrix',
        loreScanPriority: 75,
        loreBudgetTokens: 150,
        techLevel: 'TL-5',
        functionPurpose: 'Self-assembling molecular automata capable of instant matter reconfiguration.'
      }
    },
    {
      id: 'elem_orbital_docks',
      title: 'Port Calypso Docks',
      type: 'Setting',
      fields: {
        primaryTriggers: 'port calypso, calypso docks, orbital docking bay',
        loreScanPriority: 60,
        corePremise: 'The primary deep-space freighter hub orbiting the gas giant.'
      }
    }
  ];

  test('Pass 1: Direct trigger match on Custom Codex element with user fields', () => {
    const result = scanDynamicLorebook({
      input: 'The operative intercepted a transmission from the ghost vector on the comms line.',
      catalog: testCatalog,
      storyFlags: {},
      config: { maxTokens: 800, maxRecursionPasses: 2 }
    });

    assert.ok(result.injectedEntries.length >= 1, 'Should match at least 1 entry');
    const ghostEntry = result.injectedEntries.find(e => e.id === 'elem_custom_cabal');
    assert.ok(ghostEntry, 'Ghost Vector custom entry should be injected');
    assert.equal(ghostEntry.type, 'Custom');
    assert.equal(ghostEntry.passMatched, 1);
    assert.ok(ghostEntry.triggerMatched, 'Trigger matched should be defined');

    // Check formatted context
    assert.ok(result.formattedPromptContext.includes('The Ghost Vector'));
    assert.ok(result.formattedPromptContext.includes('[Custom]'));
    assert.ok(result.formattedPromptContext.includes('User Fields: [Network Node: Sub-Grid 88, Threat Signature: Class IV Intrusion]'));
  });

  test('Pass 2: Associative recursive scan triggers from Custom Codex into Standard Lore', () => {
    // Input only mentions "ghost vector", but ghost vector's description mentions "Precursor Nanite Swarms"
    const result = scanDynamicLorebook({
      input: 'The operative investigated the ghost vector signal near the terminal.',
      catalog: testCatalog,
      storyFlags: {},
      config: { maxTokens: 800, maxRecursionPasses: 2, enableRecursiveScanning: true }
    });

    assert.equal(result.passesExecuted, 2);
    assert.equal(result.injectedEntries.length, 2);

    const ids = result.injectedEntries.map(e => e.id);
    assert.ok(ids.includes('elem_custom_cabal'), 'Custom entry should be matched in Pass 1');
    assert.ok(ids.includes('elem_nanites'), 'Technology entry should be matched in Pass 2 via associative text');

    const naniteEntry = result.injectedEntries.find(e => e.id === 'elem_nanites');
    assert.equal(naniteEntry.passMatched, 2);

    // Docks should NOT be matched
    assert.equal(ids.includes('elem_orbital_docks'), false);
  });

  test('Strict token budgeting caps injection count cleanly', () => {
    const tightBudgetResult = scanDynamicLorebook({
      input: 'ghost vector port calypso docks nanite swarm',
      catalog: testCatalog,
      storyFlags: {},
      config: { maxTokens: 120, maxRecursionPasses: 1 } // very small budget
    });

    assert.ok(tightBudgetResult.tokensUsed <= 120, `Tokens used ${tightBudgetResult.tokensUsed} must not exceed 120`);
    assert.ok(tightBudgetResult.injectedEntries.length >= 1);
  });

  test('Fallback behavior: gracefully handles unmatched inputs and edge cases', () => {
    // 1. Unmatched text
    const unmatched = scanDynamicLorebook({
      input: 'A completely unrelated query about hydroponic strawberries.',
      catalog: testCatalog,
      storyFlags: {}
    });
    assert.equal(unmatched.injectedEntries.length, 0);
    assert.equal(unmatched.formattedPromptContext, '');
    assert.equal(unmatched.tokensUsed, 0);

    // 2. Empty input
    const emptyInput = scanDynamicLorebook({
      input: '',
      catalog: testCatalog
    });
    assert.equal(emptyInput.injectedEntries.length, 0);

    // 3. Null / undefined catalog
    const emptyCatalog = scanDynamicLorebook({
      input: 'ghost vector',
      catalog: []
    });
    assert.equal(emptyCatalog.injectedEntries.length, 0);
  });
});

describe('Phase 4: Interactive Book Mode & Dossier Modal Data Contracts', () => {

  test('injectedLore entries satisfy all props required by LorebookDossierModal and InteractiveBookView', () => {
    const rawCustomElement = {
      id: 'elem_vault_black',
      title: 'Project Blacklight Vault',
      type: 'Custom',
      imageUrl: 'https://example.com/vault.png',
      fields: {
        category: 'Black Site',
        summary: 'Deep-mantle covert laboratory.',
        description: 'Geothermal energy tapped for black-budget reverse engineering.',
        techLevel: 'TL-4',
        metaLevel: 'ML-0',
        tags: 'classified, bunker, geothermal'
      },
      customFields: [
        { label: 'Security Code', value: 'SIGMA-9' },
        { label: 'Sub-Level Count', value: '14' }
      ]
    };

    const scanResult = scanDynamicLorebook({
      input: 'Approaching the blacklight vault in the geothermal caverns',
      catalog: [
        {
          ...rawCustomElement,
          fields: {
            ...rawCustomElement.fields,
            primaryTriggers: 'blacklight vault, geothermal caverns'
          }
        }
      ],
      storyFlags: {}
    });

    assert.equal(scanResult.injectedEntries.length, 1);
    const entry = scanResult.injectedEntries[0];

    // Data contract assertions as consumed by LorebookDossierModal.jsx:
    assert.equal(entry.id, 'elem_vault_black');
    assert.equal(entry.title, 'Project Blacklight Vault');
    assert.equal(entry.type, 'Custom');
    assert.equal(typeof entry.triggerMatched, 'string');
    assert.equal(typeof entry.passMatched, 'number');
    assert.equal(typeof entry.allocatedTokens, 'number');
    assert.equal(typeof entry.snippet, 'string');
    assert.ok(entry.rawElement);

    // Assert rawElement features used in LorebookDossierModal:
    const raw = entry.rawElement;
    assert.equal(raw.fields.category, 'Black Site');
    assert.equal(raw.fields.techLevel, 'TL-4');
    assert.equal(raw.fields.metaLevel, 'ML-0');
    assert.equal(raw.customFields.length, 2);
    assert.equal(raw.customFields[0].label, 'Security Code');
    assert.equal(raw.customFields[0].value, 'SIGMA-9');

    // Data contract assertions as stored in interactive beat objects:
    const mockBeat = {
      id: 'beat_1001',
      beatIndex: 1,
      scenarioTitle: 'Breaching the Perimeter',
      protagonistName: 'Operative Jax',
      text: 'The heavy blast door opens to reveal the blacklight vault.',
      injectedLore: [entry],
      gate: {
        prompt: 'How do you bypass the biometric lock?',
        options: [
          { id: '1', text: 'Hack the biometric scanner', skill: 'Slicing CR 13' },
          { id: '2', text: 'Apply thermal breaching charge', skill: 'Demolitions CR 12' }
        ]
      }
    };

    assert.equal(mockBeat.injectedLore.length, 1);
    assert.equal(mockBeat.injectedLore[0].type, 'Custom');
    assert.equal(mockBeat.injectedLore[0].title, 'Project Blacklight Vault');
  });
});
