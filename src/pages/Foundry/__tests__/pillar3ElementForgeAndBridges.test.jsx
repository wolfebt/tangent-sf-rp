/**
 * @file pillar3ElementForgeAndBridges.test.jsx
 * @description Pillar 3 Regression Suite:
 *   1. adeEngineBridge: recursive scenario flattening, hazardCr check, pure recap synthesis, opposed verb detection
 *   2. adeElementPersistence: fail-closed OmniCortex guard when auth flags omitted
 *   3. adeToCortexConsolidator: story Persona exclusion & scanPriority 50 default
 *   4. lorebookScanner: regex flag stripping, non-word triggers, case sensitivity, speakerFilter & unmatchedCount
 *   5. NpcScriptBuilder: false-string active flag preservation, ambush/dialogue_bark patterns, AIME clamping
 *   6. ModularCharacterAssembler: Chassis selector attributes & removable Tab 3/4 item chips
 *   7. elementPlaybooks & elementSchemas: Stage 3 tab exclusions, aliasKey preservation, boundary matching, triggerLogic/speakerFilter
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  toastMock,
  mockAuthValue,
  mockDbmValue,
  mockGenerateContent,
  mockGenerateAdeBridgeText
} = vi.hoisted(() => ({
  toastMock: vi.fn(),
  mockAuthValue: { currentUser: { uid: 'arch_p3' }, isAdmin: false },
  mockDbmValue: {
    dbData: {
      species: [{ id: 'sp_1', name: 'Human' }],
      weaponry: [{ id: 'w_1', name: 'Arc Rifle', damage: '2d8', range: 'Medium' }],
      armoring: [{ id: 'a_1', name: 'Titan Vest', dr: 6 }],
      gear: [{ id: 'g_1', name: 'Medkit' }],
      features: [{ id: 'f_1', name: 'Precision Strike' }],
      traits: [{ id: 't_1', name: 'Void-Touched' }],
      disadvantages: [{ id: 'd_1', name: 'Glass Jaw' }],
      augmentations: [{ id: 'aug_1', name: 'Synaptic Boost' }],
      invocations: [{ id: 'inv_1', name: 'Flux Lance' }],
      modular_characters: []
    },
    saveEntry: vi.fn(),
    deleteEntry: vi.fn()
  },
  mockGenerateContent: vi.fn(async () => '{"alertBark":"Intruder Alert!","detectionDc":99,"visionRangePx":5000,"visionFovDeg":999,"moraleThreshold":2.5}'),
  mockGenerateAdeBridgeText: vi.fn(async () => '{}')
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('../../../services/audioService', () => ({
  default: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() }
}));

vi.mock('../../../services/aimeService', () => ({
  generateContent: mockGenerateContent,
  generateAdeBridgeText: mockGenerateAdeBridgeText
}));

vi.mock('../../../services/diceService', () => ({
  rollDice: vi.fn(() => ({ total: 14, rolls: [7, 7], formatted: '[7, 7]' }))
}));

vi.mock('../../../services/sessionRecapService.js', () => ({
  SessionJournal: {
    clearEvents: vi.fn(),
    logEvent: vi.fn(),
    synthesizeMarkdownRecap: vi.fn(() => 'should not be called')
  }
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: toastMock,
  useToast: () => ({ toast: toastMock })
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuthValue
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => mockDbmValue
}));

import {
  validateUniverseRules,
  synthesizeRecapFromCronicle,
  adjudicateActionCheck
} from '../../../services/ade/adeEngineBridge';
import { SessionJournal } from '../../../services/sessionRecapService.js';
import { persistAdeElement } from '../../../utils/adeElementPersistence';
import {
  resolveTargetCortexCollection,
  consolidateAdeElementToCortexPayload
} from '../../../utils/cortex/adeToCortexConsolidator';
import {
  compileTriggerRegex,
  testKeywordList,
  scanDynamicLorebook
} from '../../../services/lorebookScanner';
import { NpcScriptBuilder } from '../ElementForge/components/NpcScriptBuilder';
import { ModularCharacterAssembler } from '../ElementForge/components/ModularCharacterAssembler';
import {
  getCoreSchemaFieldsForStage3,
  mergeNonDestructiveTraits,
  computeGuidedElementReadiness
} from '../ElementForge/guided/elementPlaybooks';
import { LOREBOOK_TRIGGER_SCHEMA_FIELDS } from '../ElementForge/elementSchemas';

describe('Pillar 3 — Element Forge & Data/Asset Bridges', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('1. adeEngineBridge recursively inspects nested scenarios, uses hazardCr, synthesizes pure Markdown, and detects combat verbs', () => {
    const telemetry = validateUniverseRules(
      {
        projectName: 'Nested Arc',
        scenarios: [
          {
            id: 'act_1',
            title: 'Act I',
            content: '<p>Act intro</p>',
            children: [
              { id: 'sc_child', title: 'Airlock Ambush', content: 'A vacuum ambush awaits.' }
            ]
          }
        ]
      },
      [
        { id: 'enc_1', title: 'Plasma Minefield', type: 'Encounter', fields: { hazardCr: '14' } }
      ]
    );

    expect(telemetry.warnings.some((w) => w.includes('Airlock Ambush'))).toBe(false);
    expect(telemetry.warnings.some((w) => w.includes('Plasma Minefield'))).toBe(false);

    const recap = synthesizeRecapFromCronicle(
      [
        { title: 'Docking Breach', summary: 'Operatives forced the bulkhead.', day: 2, sceneTitle: 'Airlock 7' }
      ],
      'Operation Eclipse'
    );
    expect(recap).toContain('# Mission Debrief & Episodic Recap: Operation Eclipse');
    expect(recap).toContain('Docking Breach');
    expect(SessionJournal.clearEvents).not.toHaveBeenCalled();

    // Tie (6+3 + baseline attr 2 + default rank 3 = 14 vs targetCR 14): combat verb auto-detects opposed => tie fails
    const opposedMandate = adjudicateActionCheck({
      actionText: 'strike the sentry drone with plasma blade',
      diceOverride: [6, 3],
      targetCR: 14
    });
    expect(opposedMandate.systemIntent).toBe('EXECUTE_FAILURE');

    // Explicit isOpposed: false overrides combat-verb heuristic => tie meets CR
    const unopposedMandate = adjudicateActionCheck({
      actionText: 'strike the keypad gently',
      diceOverride: [6, 3],
      targetCR: 14,
      isOpposed: false
    });
    expect(unopposedMandate.systemIntent).toBe('EXECUTE_SUCCESS');
  });

  it('2. adeElementPersistence fails closed when OmniCortex mutation authorization flags are omitted', async () => {
    const saveEntry = vi.fn();
    const updateSavedElement = vi.fn();
    await persistAdeElement({
      element: { id: 'el_wpn_1', title: 'Rail Lance', type: 'Weaponry', dbmId: 'wpn_1', fields: {} },
      elementsCatalog: [],
      updateSavedElement,
      saveEntry
    });

    expect(updateSavedElement).toHaveBeenCalledTimes(1);
    expect(saveEntry).not.toHaveBeenCalled();
  });

  it('3. adeToCortexConsolidator skips story-only Personas and defaults scanPriority to 50', () => {
    expect(
      resolveTargetCortexCollection({
        id: 'p_story',
        title: 'Dr. Mara Lin',
        type: 'Persona',
        fields: { personaSubcategory: 'story' }
      })
    ).toBeNull();

    expect(
      resolveTargetCortexCollection({
        id: 'p_mcm',
        title: 'Vanguard Heavy',
        type: 'Persona',
        fields: { personaSubcategory: 'mcm' }
      })
    ).toBe('modular_characters');

    const consolidated = consolidateAdeElementToCortexPayload({
      id: 'sp_helios',
      title: 'Helios Strain',
      type: 'Species',
      fields: {}
    });
    expect(consolidated?.targetCollection).toBe('species');
    expect(consolidated?.payload?.loreScanPriority).toBe(50);
  });

  it('4. lorebookScanner strips stateful flags, matches non-word triggers, enforces caseSensitive & speakerFilter, and reports unmatchedCount accurately', () => {
    const rx = compileTriggerRegex('/reactor/g', 'Kael', 'Aria');
    expect(rx).toBeInstanceOf(RegExp);
    expect(rx.global).toBe(false);
    expect(rx.test('reactor core')).toBe(true);
    expect(rx.test('reactor core')).toBe(true);

    expect(testKeywordList(['!hack', '+armor'], 'player attempts !hack on terminal', false)).toEqual(['!hack']);
    expect(testKeywordList(['!hack'], 'normal conversation', false)).toEqual([]);

    const scanResult = scanDynamicLorebook({
      input: 'We found the NOVA reactor shard.',
      activeScenario: { content: 'Corridors hum silently.' },
      catalog: [
        {
          id: 'lb_case_miss',
          title: 'Case Miss Entry',
          type: 'Lorebook Trigger',
          fields: { primaryTriggers: 'nova', loreCaseSensitive: true, caseSensitive: true, loreScanPriority: 0, triggerPriority: 0 }
        },
        {
          id: 'lb_case_hit',
          title: 'Case Hit Entry',
          type: 'Lorebook Trigger',
          fields: { primaryTriggers: 'NOVA', loreCaseSensitive: true, caseSensitive: true, loreScanPriority: 0, triggerPriority: 0 },
          content: 'Reactor echo whispers silently.'
        },
        {
          id: 'lb_npc_speaker',
          title: 'User Only Entry',
          type: 'Lorebook Trigger',
          fields: { primaryTriggers: 'silently', speakerFilter: 'user_only' }
        }
      ],
      storyFlags: {}
    });

    const ids = scanResult.injectedEntries.map((m) => m.elementId || m.rawElement?.id);
    expect(ids).toContain('lb_case_hit');
    expect(ids).not.toContain('lb_case_miss');
    expect(ids).not.toContain('lb_npc_speaker');
    expect(scanResult.injectedEntries.find((m) => (m.elementId || m.rawElement?.id) === 'lb_case_hit').priority).toBe(0);
    expect(scanResult.unmatchedCount).toBe(2);
  });

  it('5. NpcScriptBuilder respects false string active flag, supports ambush/dialogue_bark patterns, and clamps AIME numeric ranges', async () => {
    const onBatchFieldChange = vi.fn();
    render(
      <NpcScriptBuilder
        fields={{ vttScriptActive: 'false' }}
        onFieldChange={vi.fn()}
        onBatchFieldChange={onBatchFieldChange}
        elementTitle="Station Sentinel"
      />
    );

    expect(screen.getByText(/Static Standby/i)).toBeInTheDocument();
    const enableBtn = screen.getByRole('button', { name: /Enable Script/i });
    fireEvent.click(enableBtn);

    fireEvent.click(screen.getByRole('button', { name: /Stealth Ambush Stalker/i }));
    await waitFor(() => {
      const lastCall = onBatchFieldChange.mock.calls.at(-1)?.[0];
      expect(lastCall?.vttScript).toBeTruthy();
      const parsed = JSON.parse(lastCall.vttScript);
      expect(parsed.type).toBe('ambush');
      expect(parsed.ambushRadiusPx).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /Interactive Comms Bark/i }));
    await waitFor(() => {
      const lastCall = onBatchFieldChange.mock.calls.at(-1)?.[0];
      expect(lastCall?.vttScript).toBeTruthy();
      const parsed = JSON.parse(lastCall.vttScript);
      expect(parsed.type).toBe('dialogue_bark');
      expect(typeof parsed.dialogueBarks).toBe('string');
      expect(Number(parsed.barkCooldownRounds)).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /AIME Script Architect/i }));

    await waitFor(() => {
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const lastCall = onBatchFieldChange.mock.calls.at(-1)?.[0];
      const parsed = JSON.parse(lastCall.vttScript);
      expect(parsed.detectionDc).toBe(35);
      expect(parsed.visionRangePx).toBe(600);
      expect(parsed.visionFovDeg).toBe(180);
      expect(parsed.moraleThreshold).toBe(0.5);
    });
  });

  it('6. ModularCharacterAssembler applies Chassis preset modifiers and removes individual Tab 3 chips cleanly', () => {
    const onBatchFieldChange = vi.fn();
    render(
      <ModularCharacterAssembler
        fields={{
          mcmTier: '2',
          features: [
            { id: 'f_1', name: 'Precision Strike' },
            { id: 'f_2', name: 'Zero-G Reflex' }
          ]
        }}
        onFieldChange={vi.fn()}
        onBatchFieldChange={onBatchFieldChange}
        elementTitle="Cyber Scout"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Specialist/i }));
    expect(onBatchFieldChange).toHaveBeenCalled();
    const chassisPatch = onBatchFieldChange.mock.calls.at(-1)[0];
    expect(chassisPatch.mcmChassis).toBe('Specialist');
    expect(Number(chassisPatch['attr-intellect'])).toBeGreaterThan(Number(chassisPatch['attr-strength']));

    fireEvent.click(screen.getByRole('button', { name: /3\. Features, Traits & Augs/i }));
    const removeBtn = screen.getByRole('button', { name: /Remove Precision Strike/i });
    fireEvent.click(removeBtn);

    const removePatch = onBatchFieldChange.mock.calls.at(-1)[0];
    const remainingFeatureNames = removePatch.features.map((f) => f.name);
    expect(remainingFeatureNames).toContain('Zero-G Reflex');
    expect(remainingFeatureNames).not.toContain('Precision Strike');
  });

  it('7. elementPlaybooks & elementSchemas exclude non-Stage3 tabs, preserve aliasKeys, use boundary readiness checks, and expose triggerLogic/speakerFilter', () => {
    const clueStage3Fields = getCoreSchemaFieldsForStage3('Clue');
    expect(clueStage3Fields.length).toBeGreaterThan(0);
    expect(clueStage3Fields.some((f) => f.tab === 'Epistemic & Analysis')).toBe(false);

    const npcStage3Fields = getCoreSchemaFieldsForStage3('NPC');
    expect(npcStage3Fields.some((f) => f.tab === 'Tactical & VTT' || f.tab === 'Cloud DBM Links')).toBe(false);

    const { mergedFields, diffs } = mergeNonDestructiveTraits(
      { legacyBio: 'Existing deep canon bio.' },
      { summary: 'AI should not overwrite legacy alias' },
      [{ key: 'summary', label: 'Summary', aliasKeys: ['legacyBio'] }]
    );
    expect(mergedFields.summary).toBeUndefined();
    expect(mergedFields.legacyBio).toBe('Existing deep canon bio.');
    expect(diffs).toHaveLength(1);

    const readiness = computeGuidedElementReadiness({
      type: 'Lore',
      title: 'Startling Discovery',
      summary: 'A startling event without exact star token.',
      fields: { keywords: 'star' },
      relationships: []
    });
    expect(typeof readiness.score).toBe('number');
    expect(readiness.resonantKeywords).toEqual([]);

    const fieldKeys = LOREBOOK_TRIGGER_SCHEMA_FIELDS.map((f) => f.key);
    expect(fieldKeys).toContain('triggerLogic');
    expect(fieldKeys).toContain('speakerFilter');
  });
});
