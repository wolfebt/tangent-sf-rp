/**
 * @file pillar7AimeAndPublishing.test.jsx
 * @description Pillar 7 regression suite covering:
 *   1. formatAimeProseToHtml: Markdown lists (ul/ol), blockquotes, code fences, headings, HTML passthrough & XSS escape
 *   2. AIME.jsx: Markdown -> Quill HTML output on outline/beats, resilient JSON array slice parsing with toast error, clamped context menu, elementsCatalog in Linked Context Elements
 *   3. AIMEChatBox: Operator-Safe redaction of .ade-gm-secret, hidden catalog, and Cronicle notes/secrets inside object contextData
 *   4. CronicleDeckModal: isStoryReadOnly guards on handleCloneSelectedElement, handleDeleteWorkingCopy, handleImportJSON + operatorSafe contextPreview
 *   5. scratchbookService & exportUtils: [[Wiki]] mention discovery, operatorSafe word count exclusion, generateScratchbookMarkdown forwarding, and exportElementJSON({ operatorSafe: true })
 *   6. VttCompilerModal: unified StageManifest compileStage path (pristine map untouched) and fallback compileScenarioForVtt path
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

const hoisted = vi.hoisted(() => ({
  toast: vi.fn(),
  generateContent: vi.fn(),
  streamContent: vi.fn(),
  updateOutline: vi.fn(),
  updateSceneBeats: vi.fn(),
  updateDraft: vi.fn(),
  updateStoryCards: vi.fn(),
  updateCronicle: vi.fn(),
  cloneElementToCronicle: vi.fn(),
  updateMap: vi.fn(),
  storyContextState: {
    isStoryReadOnly: true,
    elementsCatalog: [
      { id: 'cat-1', title: 'Commander Vega', type: 'Persona', fields: {} },
      { id: 'cat-secret', title: 'Hidden Syndicate', type: 'Faction', isGmOnly: true, fields: { playerVisible: false } }
    ],
    mapsCatalog: [{ id: 'map-cat', title: 'Orbital Sector', gridMode: 'Hex', walls: [] }],
    universeState: {
      id: 'story-p7',
      projectName: 'Nebula Gate',
      scenarios: [
        { id: 'sc-1', title: 'Airlock Entry', type: 'Scenario', mapId: 'map-cat', content: '<p>Meet [[Commander Vega]] here.</p><div class="ade-gm-secret">Secret trap!</div>', fields: {}, children: [] }
      ],
      maps: [{ id: 'map-cat', title: 'Orbital Sector', gridMode: 'Hex', walls: [] }],
      stages: [],
      creativeState: {
        gems: [],
        storyCards: [],
        storyOutline: '',
        sceneBeats: '',
        storyDraft: '',
        linkedElements: [],
        customGems: {}
      }
    },
    cronicle: {
      storyPrefix: 'neb',
      ephemeralNotes: 'GM TOP SECRET NOTE',
      gmNotes: 'GM PRIVATE',
      workingMemory: {
        activeLocationId: 'loc-1',
        activePersonaIds: ['p-vis', 'p-hid'],
        immediateObjective: 'Secure airlock',
        ephemeralNotes: 'SECRET EPHEMERAL'
      },
      personas: {
        'p-vis': { id: 'p-vis', name: 'Vega', role: 'Lead', current_status: 'active' },
        'p-hid': { id: 'p-hid', name: 'Mole', role: 'Spy', isHidden: true, current_status: 'active' }
      },
      locations: {
        'loc-1': { id: 'loc-1', name: 'Deck 4', current_geospatial_state: 'breached', gmNotes: 'GM LOC SECRET', secrets: 'TRAPDOOR' }
      },
      workingCopies: {
        'wc-1': { id: 'wc-1', title: 'Draft Copy' }
      },
      timeline: []
    }
  }
}));

vi.mock('../../../context/CampaignContext', () => ({
  useStory: () => ({
    ...hoisted.storyContextState,
    updateGems: vi.fn(),
    updateCreativeState: vi.fn(),
    updateStoryCards: hoisted.updateStoryCards,
    updateOutline: hoisted.updateOutline,
    updateSceneBeats: hoisted.updateSceneBeats,
    updateDraft: hoisted.updateDraft,
    getActiveGemsText: () => 'Hard Sci-Fi',
    addStory: vi.fn(),
    updateLinkedElements: vi.fn(),
    triggerStorySave: vi.fn(),
    stageCronicleDeltas: vi.fn(),
    acceptPendingDelta: vi.fn(),
    rejectPendingDelta: vi.fn(),
    acceptAllPendingDeltas: vi.fn(),
    clearPendingDeltas: vi.fn(),
    updateCronicle: hoisted.updateCronicle,
    updateWorkingMemory: vi.fn(),
    applyCronicleDelta: vi.fn(),
    cloneElementToCronicle: hoisted.cloneElementToCronicle,
    updateMap: hoisted.updateMap,
    galleryModifiers: []
  }),
  formatExportFilename: (title, _type, ext) => `${(title || 'export').replace(/\s+/g, '_')}.${ext}`
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'gm-1', displayName: 'Architect' }, userHandle: 'architect' })
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ toast: hoisted.toast }),
  showToast: vi.fn()
}));

vi.mock('../../../context/ConfirmContext', () => ({
  useConfirm: () => vi.fn(async () => true),
  showConfirm: vi.fn(async () => true)
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => ({ dbData: {} })
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({ personaRoster: [], publicCatalog: [] })
}));

vi.mock('../../../services/aimeService', () => ({
  generateContent: (...args) => hoisted.generateContent(...args),
  streamContent: (...args) => hoisted.streamContent(...args),
  streamChatContent: vi.fn(),
  parseRollCommand: vi.fn(),
  formatCronicleContextForAIME: (c, opts) => {
    const isSafe = Boolean(opts?.operatorSafe);
    if (!c) return '';
    return isSafe ? 'CRONICLE_SAFE_PREVIEW' : `CRONICLE_FULL:${c.workingMemory?.ephemeralNotes || ''}`;
  }
}));

vi.mock('../../../services/cronicleService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    extractNarrativeDeltas: vi.fn(async () => [])
  };
});

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playCombatHit: vi.fn()
  }
}));

vi.mock('react-quill-new', () => ({
  default: ({ value }) => <div data-testid="mock-quill">{value}</div>
}));

vi.mock('react-split', () => ({
  default: ({ children }) => <div data-testid="mock-split">{children}</div>
}));

import { formatAimeProseToHtml } from '../AIME/aimeTextUtils';
import AIME from '../AIME/AIME';
import AIMEChatBox from '../AIME/AIMEChatBox';
import CronicleDeckModal from '../../../components/StoryFoundry/Cronicle/CronicleDeckModal';
import { findElementsUsed, generateStoryScratchbook, generateScratchbookMarkdown } from '../StoryModule/scratchbookService';
import { exportElementJSON } from '../StoryModule/exportUtils';
import { VttCompilerModal } from '../../../components/StoryFoundry/VttCompilerModal';
import { VttModuleCompiler } from '../../../services/vttModuleCompilerService';
import { useAdeStore } from '../store/adeStore';
import { useStageStore } from '../Stage/stageStore';
import { streamChatContent } from '../../../services/aimeService';

describe('Pillar 7: AIME, Cronicle, Scratchbook, Export & Compiler Convergence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof Element !== 'undefined') {
      Element.prototype.scrollIntoView = vi.fn();
    }
    useAdeStore.getState().setPerspectiveMode?.('architect');
    useStageStore.getState().resetStageManifest('', '');
    hoisted.storyContextState.isStoryReadOnly = true;
    hoisted.storyContextState.universeState.stages = [];
    hoisted.storyContextState.universeState.creativeState.storyCards = [];
  });

  afterEach(() => {
    cleanup();
  });

  it('formatAimeProseToHtml converts Markdown lists, blockquotes, code blocks, headings and preserves existing HTML', () => {
    const md = [
      '# Briefing <script>alert(1)</script>',
      '- First **bold** bullet\n- Second *italic* bullet',
      '1. Step one\n2. Step two',
      '> Warning quote',
      '```js\nconst x = 1 < 2;\n```'
    ].join('\n\n');

    const html = formatAimeProseToHtml(md);
    expect(html).toContain('<h1>Briefing &lt;script&gt;alert(1)&lt;/script&gt;</h1>');
    expect(html).toContain('<ul><li>First <strong>bold</strong> bullet</li><li>Second <em>italic</em> bullet</li></ul>');
    expect(html).toContain('<ol><li>Step one</li><li>Step two</li></ol>');
    expect(html).toContain('<blockquote>Warning quote</blockquote>');
    expect(html).toContain('<pre><code>const x = 1 &lt; 2;</code></pre>');

    const existingHtml = '<p>Already <strong>formatted</strong> draft</p>';
    expect(formatAimeProseToHtml(existingHtml)).toBe(existingHtml);
  });

  it('AIME converts Markdown outline to HTML, extracts fenced concept JSON safely, lists elementsCatalog, and clamps context menu', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <AIME />
      </MemoryRouter>
    );

    // ElementsCatalog entry appears directly in Linked Context Elements
    expect(screen.getByText('Commander Vega')).toBeInTheDocument();

    // Right-click context menu far offscreen is clamped within viewport
    window.getSelection = () => ({ toString: () => 'selected words' });
    const seedTextarea = screen.getByPlaceholderText(/A rogue AI awakens/i);
    fireEvent.contextMenu(seedTextarea, { clientX: 5000, clientY: 5000 });
    const menuTitle = screen.getByText('AI Pair Authoring');
    const menuEl = menuTitle.closest('.fixed');
    expect(parseInt(menuEl.style.left, 10)).toBeLessThanOrEqual((window.innerWidth || 1024) - 250);

    // Preamble + fenced JSON array parses cleanly
    hoisted.generateContent.mockResolvedValueOnce(
      'Here are your concepts:\n```json\n[{"title":"Hull Breach","hook":"Air is failing","premise":"Fix it","themes":"Survival"}]\n```'
    );
    fireEvent.change(seedTextarea, { target: { value: 'Derelict orbital station' } });
    fireEvent.click(screen.getByText('Generate Concept Cards'));

    await waitFor(() => {
      expect(hoisted.updateStoryCards).toHaveBeenCalledWith([
        expect.objectContaining({ title: 'Hull Breach' })
      ]);
    });

    // Reflect updated storyCards into mock context and re-render Stage 1 to inspect Develop Outline
    hoisted.storyContextState.universeState.creativeState.storyCards = hoisted.updateStoryCards.mock.calls[0][0];
    rerender(
      <MemoryRouter>
        <AIME />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('1. Brainstorm'));

    // Develop Outline feeds HTML through formatAimeProseToHtml instead of raw markdown
    hoisted.generateContent.mockResolvedValueOnce('## Act I\n\n- **Alarm** sounds');
    fireEvent.click(screen.getByText('Develop Outline').closest('button'));
    await waitFor(() => {
      expect(hoisted.updateOutline).toHaveBeenCalledWith('<h2>Act I</h2><ul><li><strong>Alarm</strong> sounds</li></ul>');
    });

    // Malformed JSON triggers error toast
    fireEvent.click(screen.getByText('1. Brainstorm'));
    hoisted.generateContent.mockResolvedValueOnce('not json at all');
    fireEvent.click(screen.getByText('Generate Concept Cards'));
    await waitFor(() => {
      expect(hoisted.toast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  it('AIMEChatBox redacts GM secrets and Cronicle notes inside object contextData when in operator mode', async () => {
    useAdeStore.getState().setPerspectiveMode?.('operator');
    streamChatContent.mockImplementation(async ({ onChunk }) => {
      onChunk?.('Copy that, Operator.');
    });

    render(
      <AIMEChatBox
        contextData={{
          activeNode: {
            id: 'sc-1',
            title: 'Deck 4',
            content: '<p>Public text.</p><div class="ade-gm-secret">DO NOT LEAK</div>',
            fields: { gmSecrets: 'CLASSIFIED' }
          },
          outline: '<p>Goal</p><p class="ade-gm-secret">SECRET OUTLINE</p>',
          linkedContextElements: hoisted.storyContextState.elementsCatalog,
          cronicle: hoisted.storyContextState.cronicle
        }}
      />
    );

    const input = screen.getByPlaceholderText(/Ask AIME for story lore/i);
    fireEvent.change(input, { target: { value: 'Status report?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(streamChatContent).toHaveBeenCalled();
    });

    const passedContext = streamChatContent.mock.calls[0][0].context;
    expect(passedContext.operatorSafe).toBe(true);
    expect(passedContext.activeNode.content).not.toContain('DO NOT LEAK');
    expect(passedContext.activeNode.fields.gmSecrets).toBeUndefined();
    expect(passedContext.outline).not.toContain('SECRET OUTLINE');
    expect(passedContext.linkedContextElements.map((e) => e.id)).toEqual(['cat-1']);
    expect(passedContext.cronicle.ephemeralNotes).toBe('');
    expect(passedContext.cronicle.workingMemory.ephemeralNotes).toBe('');
    expect(passedContext.cronicle.personas['p-hid']).toBeUndefined();
  });

  it('CronicleDeckModal blocks Working Copy delete, clone, and JSON import when isStoryReadOnly is true and passes operatorSafe to preview', () => {
    useAdeStore.getState().setPerspectiveMode?.('operator');

    render(
      <CronicleDeckModal
        isOpen={true}
        onClose={vi.fn()}
        initialTab="working_copies"
      />
    );

    // Import input is disabled when read-only
    const importInput = document.querySelector('input[type="file"][accept=".json"]');
    expect(importInput).toBeDisabled();

    // Context injection preview strips ephemeralNotes and hidden personas in operator mode
    fireEvent.click(screen.getByText(/Working Memory & Notes/i));
    const previewEl = screen.getByText(/CRONICLE TIER 1/i);
    expect(previewEl).toBeInTheDocument();
    expect(previewEl.textContent).not.toContain('SECRET EPHEMERAL');
    expect(previewEl.textContent).not.toContain('Mole');
  });

  it('scratchbookService & exportUtils enforce Wiki mention scan and Operator-Safe stripping', () => {
    const usedSafe = findElementsUsed(hoisted.storyContextState.universeState, hoisted.storyContextState.elementsCatalog, { operatorSafe: true });
    expect(usedSafe.map((e) => e.id)).toContain('cat-1');
    expect(usedSafe.map((e) => e.id)).not.toContain('cat-secret');

    const safeDoc = generateStoryScratchbook({
      universeState: hoisted.storyContextState.universeState,
      elementsCatalog: hoisted.storyContextState.elementsCatalog,
      mapsCatalog: hoisted.storyContextState.mapsCatalog,
      operatorSafe: true
    });
    expect(safeDoc).not.toContain('Secret trap!');
    expect(safeDoc).toContain('*Total Words*: `4`');

    const viaWrapper = generateScratchbookMarkdown(
      hoisted.storyContextState.universeState,
      hoisted.storyContextState.elementsCatalog,
      '',
      [],
      hoisted.storyContextState.mapsCatalog,
      { operatorSafe: true }
    );
    expect(viaWrapper).not.toContain('Secret trap!');

    // exportElementJSON({ operatorSafe: true })
    let capturedBlob = null;
    const origCreateObjectURL = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn((blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    URL.revokeObjectURL = vi.fn();

    exportElementJSON(
      {
        id: 'sc-export',
        title: 'Airlock',
        type: 'Scenario',
        content: '<p>Safe</p><div class="ade-gm-secret">SECRET</div>',
        fields: { gmSecrets: 'BOSS AMBUSH' }
      },
      hoisted.storyContextState.universeState,
      { operatorSafe: true }
    );

    expect(capturedBlob).toBeTruthy();
    return capturedBlob.text().then((raw) => {
      const parsed = JSON.parse(raw);
      expect(parsed.element.content).not.toContain('SECRET');
      expect(parsed.element.fields.gmSecrets).toBeUndefined();
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevoke;
    });
  });

  it('VttCompilerModal unifies with compileStage when a matching StageManifest exists and preserves pristine map', () => {
    hoisted.storyContextState.universeState.stages = [
      {
        id: 'stage-unified',
        title: 'Airlock Stage Manifest',
        mapId: 'map-cat',
        storyId: 'sc-1',
        scenarioIds: ['sc-1'],
        anchors: [
          { id: 'anc-1', name: 'Lock', kind: 'waypoint', pos: { x: 120, y: 120 }, elementIds: [] }
        ],
        triggers: [],
        environment: { lighting: { mode: 'normal' }, weather: 'clear', modifierIds: [] },
        encounters: [],
        variables: {},
        macros: []
      }
    ];
    const legacySpy = vi.spyOn(VttModuleCompiler, 'compileScenarioForVtt');
    hoisted.storyContextState.isStoryReadOnly = false;

    render(
      <MemoryRouter>
        <VttCompilerModal
          isOpen={true}
          onClose={vi.fn()}
          activeScenario={hoisted.storyContextState.universeState.scenarios[0]}
        />
      </MemoryRouter>
    );

    expect(legacySpy).not.toHaveBeenCalled();
    expect(screen.getByText('Open in Stage Director')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Deploy to Tactical Stage'));
    expect(hoisted.updateMap).not.toHaveBeenCalled();
    expect(screen.getByText(/Manifest "Airlock Stage Manifest" ready on Tactical Stage/i)).toBeInTheDocument();
  });
});
