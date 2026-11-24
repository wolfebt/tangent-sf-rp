/**
 * @file wave2DataSafetyAndHandoffs.test.jsx
 * @description Wave 2 Regression Suite — Stop Silent Data Loss & Broken Handoffs:
 *   1. Folio vitals parser handles underscored & hyphenated keys + synthetic structure
 *   2. InteractiveStoryStudio Folio vitals sync (no strain->vitality corruption) & Split telemetry UI
 *   3. persistAdeElement canonical unpinned Folio & OmniCortex IDs vs pinned targetModuleId
 *   4. TokenFramerPanel local WebP/PNG file download + onExportToken staging callback
 *   5. ArtistHubModal Escape/backdrop dismissal & z-[280] + buildArtistConceptPatch
 *   6. AimeGuidanceFlyout Escape/backdrop/close label + ScenarioCockpitDock append fallback
 *   7. CampaignContext per-user default project scoping (proj_default_<uid>)
 *   8. ModuleMissionControl full hydration pass-through (creativeState, cronicle, existing*)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const hoisted = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  toastFnMock: vi.fn(),
  showInfoMock: vi.fn(),
  showSuccessMock: vi.fn(),
  showErrorMock: vi.fn(),
  showWarningMock: vi.fn(),
  updateCharacterHealth: vi.fn(),
  updateCharacterVitality: vi.fn(),
  updateCharacterStructure: vi.fn(),
  applyVTTStatusConditions: vi.fn(),
  hydrateModuleIntoCampaign: vi.fn(() => ({
    scenariosImported: 1,
    mapsImported: 1,
    elementsImported: 2,
    creativeStateRestored: true,
    cronicleRestored: true
  })),
  parseAndValidateModuleFile: vi.fn(() => ({
    isValid: true,
    data: { meta: { version: '2.0' } }
  })),
  generateContentMock: vi.fn(async () => 'Tactical infiltration note from AIME.'),
  streamContentMock: vi.fn(async ({ onChunk }) => {
    const payload = JSON.stringify({
      narrative: 'The blast doors hissed open into the dark bay.',
      gate: {
        prompt: 'Next move?',
        options: [
          { id: '1', text: 'Slice security relay', skillCheck: 'Slicing CR 12' }
        ]
      }
    });
    onChunk?.(payload);
    return payload;
  }),
  folioState: {
    roster: [],
    characterData: {
      'character-doc-id': 'folio_op_1',
      'char-name': 'Kaelen Voss',
      is_synthetic: false,
      current_health: 26,
      max_health: 30,
      current_vitality: 22,
      max_vitality: 30,
      current_structure: 0,
      max_structure: 0,
      active_conditions: []
    }
  },
  dbmState: {
    dbData: { archetypes: [], modifiers: [] }
  },
  campaignState: {
    universeState: {
      id: 'story_wave2',
      projectName: 'Wave 2 Sector',
      scenarios: [{ id: 'sc_1', title: 'Airlock Alpha', type: 'Scene', content: 'Staging deck' }],
      maps: [{ id: 'map_1', title: 'Docking Bay' }],
      creativeState: { gems: [] },
      galleryModifiers: []
    },
    storyCatalog: [{ id: 'story_wave2', projectName: 'Wave 2 Sector' }],
    elementsCatalog: [{ id: 'el_1', title: 'Plasma Cutter', type: 'Property' }],
    mapsCatalog: [{ id: 'map_1', title: 'Docking Bay' }],
    activeMapId: 'map_1',
    cloudSyncStatus: 'synced',
    lastCloudSavedAt: '12:00',
    openStory: vi.fn(),
    createNewStory: vi.fn(),
    deleteStoryProject: vi.fn(),
    updateProjectName: vi.fn(),
    handleSaveStory: vi.fn(),
    handleLoadStory: vi.fn(),
    pushUniverseToCloud: vi.fn(),
    pullUniverseFromCloud: vi.fn(),
    handleClearUniverse: vi.fn(),
    addMap: vi.fn(),
    updateMap: vi.fn(),
    addStory: vi.fn(),
    updateStory: vi.fn(),
    updateSavedElement: vi.fn(),
    deleteSavedElement: vi.fn(),
    handleCreateNewMapForElement: vi.fn(),
    getActiveGemsText: vi.fn(() => ''),
    setActiveMapId: vi.fn(),
    setActiveScenarioId: vi.fn(),
    setGalleryModifiers: vi.fn(),
    updateCreativeState: vi.fn(),
    updateCronicle: vi.fn()
  }
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(() => () => {})
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(async () => {}),
  onSnapshot: vi.fn(() => () => {}),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(async () => ({ docs: [] })),
  getDoc: vi.fn(async () => ({ exists: () => false })),
  deleteDoc: vi.fn(async () => {}),
  writeBatch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn(async () => {}) }))
}));

vi.mock('../../../firebase', () => ({
  db: {},
  auth: {}
}));

vi.mock('../../../services/cronicleVttBridge.js', () => ({
  initCronicleVttBridge: vi.fn(() => () => {})
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('react-split', () => ({
  default: ({ children }) => <div data-testid="mock-split">{children}</div>
}));

vi.mock('react-quill-new', () => ({
  default: ({ value, onChange }) => (
    <textarea value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
  )
}));

vi.mock('../../../services/audioService', () => ({
  default: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playCombatHit: vi.fn(),
    startAmbientDrone: vi.fn(),
    stopAmbientDrone: vi.fn()
  },
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playCombatHit: vi.fn(),
    startAmbientDrone: vi.fn(),
    stopAmbientDrone: vi.fn()
  }
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: hoisted.showToastMock,
  useToast: () => ({
    toast: hoisted.toastFnMock,
    showInfo: hoisted.showInfoMock,
    showSuccess: hoisted.showSuccessMock,
    showError: hoisted.showErrorMock,
    showWarning: hoisted.showWarningMock
  })
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'uid_wave2' } })
}));

vi.mock('../../../context/ConfirmContext', () => ({
  showConfirm: vi.fn(async () => true)
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => hoisted.dbmState
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({
    roster: hoisted.folioState.roster,
    characterData: hoisted.folioState.characterData,
    applyVTTStatusConditions: hoisted.applyVTTStatusConditions,
    recordTrackedModification: vi.fn(),
    updateCharacterHealth: hoisted.updateCharacterHealth,
    updateCharacterVitality: hoisted.updateCharacterVitality,
    updateCharacterStructure: hoisted.updateCharacterStructure,
    saveCurrentToRoster: vi.fn()
  })
}));

vi.mock('../../../context/CampaignContext', async () => {
  const actual = await vi.importActual('../../../context/CampaignContext');
  return {
    ...actual,
    useCampaign: () => hoisted.campaignState,
    useStory: () => hoisted.campaignState
  };
});

vi.mock('../../../services/aimeService', () => ({
  LOD_TIERS: {
    tier1_hero: {
      key: 'tier1_hero',
      label: 'Tier 1: Hero & Strategic Cognition',
      badge: '8B Q4_K_M (Hero)',
      vramEstimateMb: 5200,
      gqaSavingsMb: 1200
    },
    tier2_tactical: {
      key: 'tier2_tactical',
      label: 'Tier 2: Squad & Tactical Cognition',
      badge: '3B Q4_K_M (Tactical)',
      vramEstimateMb: 2100,
      gqaSavingsMb: 550
    },
    tier3_ambient: {
      key: 'tier3_ambient',
      label: 'Tier 3: Ambient & Sensor Subsystems',
      badge: '1B Q4_K_M (Ambient)',
      vramEstimateMb: 1100,
      gqaSavingsMb: 280
    }
  },
  resolveIntelligenceTier: () => ({
    key: 'tier1_hero',
    label: 'Tier 1: Hero & Strategic Cognition',
    badge: '8B Q4_K_M (Hero)'
  }),
  calculateVramTelemetry: () => ({
    tierKey: 'tier1_hero',
    tierLabel: 'Tier 1: Hero & Strategic Cognition',
    badge: '8B Q4_K_M (Hero)',
    parameterSize: '7B-8B',
    baseVramMb: 5200,
    kvCacheMb: 300,
    gqaSavingsMb: 1200,
    totalEstimatedVramMb: 5500,
    fits8GbVram: true,
    recommendedGqaFlags: '--cache-type-k q8_0'
  }),
  generateContent: hoisted.generateContentMock,
  streamContent: hoisted.streamContentMock
}));

vi.mock('../../../services/ade/adeEngineBridge.ts', () => ({
  adjudicateActionCheck: vi.fn(() => ({
    systemIntent: 'EXECUTE_SUCCESS',
    diceSummary: { formula: '2d10+4=16' },
    narrativeBounds: { prescribedOutcome: 'Yields telemetry' }
  })),
  formatMandateForPrompt: vi.fn(() => '')
}));

vi.mock('../../../services/lorebookScanner.ts', () => ({
  scanDynamicLorebook: vi.fn(() => ({ injectedEntries: [], formattedPromptContext: '' }))
}));

vi.mock('../StoryModule/panels/TacticalStageViewport', () => ({
  default: () => <div data-testid="mock-stage-viewport" />
}));

vi.mock('../StoryModule/panels/ActiveModifiersPillBar', () => ({
  default: () => <div data-testid="mock-modifiers-bar" />
}));

vi.mock('../StoryModule/panels/FireteamVitalsBar', () => ({
  default: ({ operatives, onUpdateOperativeVitals }) => (
    <div data-testid="mock-fireteam-bar">
      {operatives?.[0] && (
        <>
          <button
            type="button"
            data-testid="trigger-bio-vitals"
            onClick={() =>
              onUpdateOperativeVitals(operatives[0].id, {
                ...operatives[0].vitals,
                health: 24,
                vitality: 18,
                strain: 9,
                structure: 0
              })
            }
          >
            Update Bio Vitals
          </button>
          <button
            type="button"
            data-testid="trigger-synth-vitals"
            onClick={() =>
              onUpdateOperativeVitals(operatives[0].id, {
                ...operatives[0].vitals,
                health: 26,
                vitality: 10,
                structure: 42
              })
            }
          >
            Update Synth Structure
          </button>
        </>
      )}
    </div>
  )
}));

vi.mock('../StoryModule/workspaces/InteractiveBookView', () => ({
  default: () => <div data-testid="mock-book-view" />
}));

vi.mock('../StoryModule/panels/LorebookDossierModal', () => ({
  default: () => null
}));

vi.mock('../ElementForge/EditElementModal', () => ({
  default: () => null
}));

vi.mock('../ElementForge/ElementSelectorModal', () => ({
  ElementSelectorModal: () => null
}));

vi.mock('../ElementForge/components/AimeThreeTierStack', () => ({
  default: () => <div data-testid="mock-three-tier-stack" />
}));

vi.mock('../ElementForge/components/ModularCharacterAssembler', () => ({
  ModularCharacterAssembler: () => null
}));

vi.mock('../ElementForge/components/NpcScriptBuilder', () => ({
  NpcScriptBuilder: () => null
}));

vi.mock('../../../services/modulePackageService', () => ({
  exportArchitectModuleToFile: vi.fn(),
  exportOperatorModuleToFile: vi.fn(),
  parseAndValidateModuleFile: hoisted.parseAndValidateModuleFile,
  hydrateModuleIntoCampaign: hoisted.hydrateModuleIntoCampaign
}));

vi.mock('../../../services/elementIngestionService.js', () => ({
  batchIngestElementFiles: vi.fn(async () => []),
  parseElementMarkdown: vi.fn()
}));

vi.mock('../../../utils/confirmationUtils', () => ({
  confirmTypedDeletion: vi.fn(async () => false)
}));

vi.mock('../store/adeStore', () => {
  const state = {
    perspectiveMode: 'architect',
    setPerspectiveMode: vi.fn(),
    togglePerspectiveMode: vi.fn(),
    activePillar: 'dashboard',
    setActivePillar: vi.fn(),
    setModal: vi.fn(),
    openGuidedElementCreator: vi.fn(),
    lorebookConfig: { maxTokens: 1200, maxRecursionPasses: 3 },
    storyFlags: {}
  };
  const hook = () => state;
  hook.getState = () => state;
  return {
    useADEStore: hook,
    useAdeStore: hook
  };
});

import { createOperativeFromDatabasePersona } from '../StoryModule/interactivePlayService.js';
import { InteractiveStoryStudio } from '../StoryModule/workspaces/InteractiveStoryStudio.jsx';
import { persistAdeElement } from '../../../utils/adeElementPersistence.js';
import { TokenFramerPanel } from '../../../components/StoryFoundry/TokenFramerPanel.jsx';
import { ArtistHubModal } from '../../../components/StoryFoundry/ArtistHubModal.jsx';
import { buildArtistConceptPatch } from '../../../services/artistHubFramework.js';
import { AimeGuidanceFlyout } from '../../../components/StoryFoundry/AimeGuidanceFlyout.jsx';
import { ElementFieldsEditor } from '../StoryModule/ScenarioCockpitDock.jsx';
import {
  LEGACY_DEFAULT_PROJECT_ID,
  getDefaultProjectId,
  resolveProjectId
} from '../../../context/CampaignContext.jsx';
import ModuleMissionControl from '../Dashboard/ModuleMissionControl.jsx';

describe('Wave 2 — Data Safety, Sync & Cross-Tool Handoffs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    hoisted.folioState.characterData = {
      'character-doc-id': 'folio_op_1',
      'char-name': 'Kaelen Voss',
      is_synthetic: false,
      current_health: 26,
      max_health: 30,
      current_vitality: 22,
      max_vitality: 30,
      current_structure: 0,
      max_structure: 0,
      active_conditions: []
    };
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('1. createOperativeFromDatabasePersona parses underscored & hyphenated Folio keys cleanly', () => {
    const bioUnderscored = createOperativeFromDatabasePersona({
      'character-doc-id': 'op_u',
      'char-name': 'Underscore Hero',
      is_synthetic: false,
      current_health: 21,
      max_health: 30,
      current_vitality: 14,
      max_vitality: 28,
      current_structure: 0
    }, 'folio');
    expect(bioUnderscored.vitals.health).toBe(21);
    expect(bioUnderscored.vitals.vitality).toBe(14);
    expect(bioUnderscored.vitals.maxVitality).toBe(28);
    expect(bioUnderscored.vitals.structure).toBe(0);

    const bioHyphenated = createOperativeFromDatabasePersona({
      'character-doc-id': 'op_h',
      'char-name': 'Hyphen Hero',
      'current-health': 19,
      'max-health': 25,
      'current-vitality': 11,
      'max-vitality': 25
    }, 'folio');
    expect(bioHyphenated.vitals.health).toBe(19);
    expect(bioHyphenated.vitals.vitality).toBe(11);

    const synthOp = createOperativeFromDatabasePersona({
      'character-doc-id': 'op_s',
      'char-name': 'Unit-7',
      is_synthetic: true,
      current_structure: 45,
      max_structure: 60
    }, 'folio');
    expect(synthOp.isSynthetic).toBe(true);
    expect(synthOp.vitals.structure).toBe(45);
    expect(synthOp.vitals.vitality).toBe(0);
  });

  it('2. InteractiveStoryStudio preserves vitality (no strain overwrite), routes synthetic structure, and renders Split telemetry', async () => {
    const { unmount } = render(<InteractiveStoryStudio />);

    fireEvent.click(screen.getByTestId('trigger-bio-vitals'));
    expect(hoisted.updateCharacterHealth).toHaveBeenCalledWith('folio_op_1', 24);
    expect(hoisted.updateCharacterVitality).toHaveBeenCalledWith('folio_op_1', 18);
    expect(hoisted.updateCharacterStructure).not.toHaveBeenCalled();

    // Unmount and remount with synthetic active folio operative to verify structure routing
    unmount();
    hoisted.updateCharacterVitality.mockClear();
    hoisted.folioState.characterData = {
      'character-doc-id': 'folio_synth_1',
      'char-name': 'Frame-9',
      is_synthetic: true,
      current_health: 26,
      max_health: 30,
      current_structure: 50,
      max_structure: 60
    };
    render(<InteractiveStoryStudio />);
    fireEvent.click(screen.getByTestId('trigger-synth-vitals'));
    expect(hoisted.updateCharacterStructure).toHaveBeenCalledWith('folio_synth_1', 42);
    expect(hoisted.updateCharacterVitality).not.toHaveBeenCalled();

    // Epistemic console & roll telemetry in default Split mode
    fireEvent.click(screen.getByTitle('Toggle Epistemic Interrogation & Deduction Console'));
    const npcInput = screen.getByPlaceholderText('Target NPC...');
    fireEvent.change(npcInput, { target: { value: 'Harbor Master' } });
    fireEvent.change(screen.getByPlaceholderText('Ask epistemic question...'), {
      target: { value: 'Who unlocked bay 4?' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Inquire' }));

    await waitFor(() => {
      expect(screen.getByText(/Target: Harbor Master/i)).toBeInTheDocument();
      expect(screen.getByText(/Tactical infiltration note from AIME\./i)).toBeInTheDocument();
    });

    // Advance a beat so Split mode renders 2d10 option roll, roll check, then clear result
    fireEvent.change(screen.getByPlaceholderText('Declare operator action...'), {
      target: { value: 'Inspect relay panel' }
    });
    fireEvent.keyDown(screen.getByPlaceholderText('Declare operator action...'), { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Slice security relay/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/^🎲\s*2d10$/));
    const clearBtn = await screen.findByLabelText('Clear roll result');
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(screen.queryByLabelText('Clear roll result')).not.toBeInTheDocument();
  });

  it('3. persistAdeElement returns canonical Folio/Cortex IDs unpinned and keeps targetModuleId when pinned', async () => {
    const updateSavedElement = vi.fn(async () => {});
    const saveEntry = vi.fn(async () => ({ ok: true }));
    const saveCurrentToRoster = vi.fn(async (payload) => ({ 'character-doc-id': payload.id || 'doc_99' }));

    // Unpinned Folio Persona
    const unpinnedFolio = await persistAdeElement({
      element: {
        id: 'elem_temp_folio',
        title: 'Sera Vance',
        type: 'Persona',
        isFolioPersona: true,
        isPinnedToModule: false,
        personaData: { id: 'doc_99' }
      },
      elementsCatalog: [],
      updateSavedElement,
      saveCurrentToRoster,
      showToast: hoisted.showToastMock
    });
    expect(unpinnedFolio.id).toBe('folio_persona_doc_99');
    expect(unpinnedFolio.folioDocId).toBe('doc_99');
    expect(updateSavedElement).not.toHaveBeenCalled();

    // Unpinned OmniCortex Property
    const unpinnedCortex = await persistAdeElement({
      element: {
        id: 'elem_temp_gear',
        title: 'Mag-Rail Carbine',
        type: 'Property',
        propertySubcategory: 'weapons',
        isPinnedToModule: false,
        fields: {}
      },
      elementsCatalog: [],
      updateSavedElement,
      saveEntry,
      showToast: hoisted.showToastMock
    });
    expect(saveEntry).toHaveBeenCalledTimes(1);
    expect(unpinnedCortex.id).toMatch(/^cortex_.*_/);
    expect(unpinnedCortex.isCortexAsset).toBe(true);
    expect(unpinnedCortex.dbmSyncStatus).toBe('synced');
    expect(updateSavedElement).not.toHaveBeenCalled();

    // Pinned OmniCortex preserves moduleElementId
    const pinnedCortex = await persistAdeElement({
      element: {
        id: 'el_mod_gear_1',
        title: 'Mag-Rail Carbine',
        type: 'Property',
        propertySubcategory: 'weapons',
        isPinnedToModule: true,
        fields: {}
      },
      elementsCatalog: [{ id: 'el_mod_gear_1', title: 'Mag-Rail Carbine' }],
      updateSavedElement,
      saveEntry,
      showToast: hoisted.showToastMock
    });
    expect(pinnedCortex.id).toBe('el_mod_gear_1');
    expect(updateSavedElement).toHaveBeenCalledWith('el_mod_gear_1', expect.objectContaining({ id: 'el_mod_gear_1' }));
  });

  it('4. TokenFramerPanel downloads framed token file and invokes onExportToken', () => {
    const mockDataUrl = 'data:image/webp;base64,QUJD';
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation((mime) =>
      mime === 'image/png' ? 'data:image/png;base64,REVG' : mockDataUrl
    );
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const onExportToken = vi.fn();

    render(<TokenFramerPanel tokenLabel="Rook Nine" onExportToken={onExportToken} />);

    fireEvent.click(screen.getByRole('button', { name: /Export Framed Token \(WebP\)/i }));
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    expect(onExportToken).toHaveBeenCalledWith(mockDataUrl);

    fireEvent.click(screen.getByRole('button', { name: /^PNG$/i }));
    expect(anchorClickSpy).toHaveBeenCalledTimes(2);
    expect(onExportToken).toHaveBeenCalledWith('data:image/png;base64,REVG');
  });

  it('5. ArtistHubModal closes on Escape/backdrop with z-[280] and buildArtistConceptPatch preserves fields', () => {
    const onClose = vi.fn();
    render(<ArtistHubModal isOpen={true} onClose={onClose} initialPrompt="Orbital Elevator" />);

    const backdrop = document.querySelector('.z-\\[280\\]');
    expect(backdrop).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);

    const patch = buildArtistConceptPatch(
      { content: 'Existing body', fields: { summary: 'Existing summary', custom: 'keep' } },
      { url: 'https://example.com/art.png', prompt: 'Concept prompt text', style: 'HIFI CHROMA', template: 'Master' },
      { fillContent: true }
    );
    expect(patch.imageUrl).toBe('https://example.com/art.png');
    expect(patch.content).toBeUndefined();
    expect(patch.fields.summary).toBe('Existing summary');
    expect(patch.fields.custom).toBe('keep');
    expect(patch.fields.visualConceptPrompt).toBe('Concept prompt text');
  });

  it('6. AimeGuidanceFlyout closes on Escape/backdrop with aria-label and ScenarioCockpitDock appends guidance', async () => {
    const onClose = vi.fn();
    render(
      <AimeGuidanceFlyout
        isOpen={true}
        onClose={onClose}
        targetType="Story"
        onApplyGuidance={vi.fn()}
      />
    );
    expect(document.querySelector('.z-\\[280\\]')).toBeInTheDocument();
    expect(screen.getByLabelText('Close AIME Guidance')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    cleanup();

    hoisted.campaignState.updateStory.mockClear();
    render(
      <ElementFieldsEditor
        activeNode={{
          id: 'sc_append_1',
          type: 'Scene',
          content: 'Existing scene text',
          fields: { summary: 'Existing scene summary' }
        }}
        updateStory={hoisted.campaignState.updateStory}
        elementsCatalog={[]}
      />
    );

    fireEvent.click(screen.getByTitle('Consult AIME Creative & Tactical Co-Pilot'));
    const askInput = screen.getByPlaceholderText(/Ask AIME to advise/i);
    fireEvent.change(askInput, { target: { value: 'Add sensory hazards' } });
    fireEvent.click(screen.getByRole('button', { name: /Ask/i }));

    const applyBtn = await screen.findByRole('button', { name: /Apply/i });
    fireEvent.click(applyBtn);

    expect(hoisted.campaignState.updateStory).toHaveBeenCalledWith('sc_append_1', {
      content: expect.stringMatching(/^Existing scene text\n\n---\n### AIME Guidance\nTactical infiltration note from AIME\./)
    });
    expect(hoisted.showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', text: expect.stringContaining('Appended') })
    );
  });

  it('7. CampaignContext default project helpers scope cleanly per user', () => {
    expect(LEGACY_DEFAULT_PROJECT_ID).toBe('proj_default_universe');
    expect(getDefaultProjectId(null)).toBe('proj_default_universe');
    expect(getDefaultProjectId({ uid: 'user_abc' })).toBe('proj_default_user_abc');

    expect(resolveProjectId('proj_default_universe', { uid: 'user_abc' })).toBe('proj_default_user_abc');
    expect(resolveProjectId('', { uid: 'user_abc' })).toBe('proj_default_user_abc');
    expect(resolveProjectId('proj_custom_99', { uid: 'user_abc' })).toBe('proj_custom_99');
  });

  it('8. ModuleMissionControl passes full hydration callbacks and existing collections', async () => {
    const { container } = render(
      <ModuleMissionControl
        onSelectPillar={vi.fn()}
        onSwitchView={vi.fn()}
      />
    );
    const fileInput = container.querySelector('input[type="file"][accept=".json,.md,.markdown"]');
    const modFile = new File(['{"meta":{}}'], 'wave2.tangent-module.json', { type: 'application/json' });
    modFile.text = async () => '{"meta":{}}';

    fireEvent.change(fileInput, { target: { files: [modFile] } });

    await waitFor(() => {
      expect(hoisted.hydrateModuleIntoCampaign).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          updateCreativeState: hoisted.campaignState.updateCreativeState,
          updateCronicle: hoisted.campaignState.updateCronicle,
          existingMaps: hoisted.campaignState.universeState.maps,
          existingScenarios: hoisted.campaignState.universeState.scenarios,
          existingElements: hoisted.campaignState.elementsCatalog
        })
      );
    });
  });
});
