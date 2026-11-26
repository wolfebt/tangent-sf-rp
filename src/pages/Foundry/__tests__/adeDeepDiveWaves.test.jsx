import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// --- Shared Mocks for ADE Deep-Dive Waves D1-D6 Component Tests ---
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn()
}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playDieRoll: vi.fn(),
    playHitImpact: vi.fn(),
    speak: vi.fn(),
    stopSpeaking: vi.fn()
  }
}));

vi.mock('../../../services/vttMultiplayerSyncService', () => ({
  getVttMultiplayerSync: () => ({
    broadcastDiceRoll: vi.fn(),
    getDocument: () => ({
      getMap: () => ({
        get: () => null,
        observe: () => {},
        unobserve: () => {}
      })
    })
  })
}));

vi.mock('../../../utils/vttEventBus', () => ({
  VttEventBus: {
    on: vi.fn(() => () => {}),
    emit: vi.fn()
  }
}));

vi.mock('../../../context/CampaignContext', () => ({
  useStory: () => ({
    universeState: { id: 'story_test_1', projectName: 'Test Sector', scenarios: [] },
    elementsCatalog: [],
    cronicle: null,
    activeMapId: null,
    isDirty: false,
    cloudSyncStatus: 'idle',
    activeScenarioId: null,
    addGalleryModifier: vi.fn(),
    addElementToStory: vi.fn(),
    updateElementInStory: vi.fn(),
    deleteElementFromStory: vi.fn()
  })
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => ({
    scenarios: [],
    personas: [],
    worldElements: [],
    addAsset: vi.fn(),
    updateAsset: vi.fn(),
    deleteAsset: vi.fn()
  })
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({
    mcmPresetsList: [],
    saveMcmPreset: vi.fn(),
    folioList: [],
    saveFolioCharacter: vi.fn()
  })
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'user_1', displayName: 'Architect' },
    userProfile: { isAdmin: false, role: 'user' }
  })
}));

vi.mock('../../../utils/cortexAdeAssetBridge', () => ({
  buildUnifiedAdeCatalog: () => [],
  resolveTargetCortexCollection: () => 'worldElements'
}));

vi.mock('../../../services/customElementTemplateService', () => ({
  listCustomTemplates: () => [],
  saveCustomTemplate: vi.fn(),
  applyCustomTemplate: vi.fn(),
  deleteCustomTemplate: vi.fn()
}));

vi.mock('../../../services/modifierService', () => ({
  MODIFIER_PRESETS: [
    {
      name: 'Zero-G Maneuvering',
      category: 'Environmental',
      description: 'Low gravity drift',
      attackMod: -2,
      defenseMod: 0,
      damageMod: 0,
      speedMod: 5
    },
    {
      name: 'Reactor Overdrive',
      category: 'Tactical',
      description: 'Surging shields and weapons',
      attackMod: 2,
      defenseMod: 1,
      damageMod: 3,
      speedMod: 0
    }
  ],
  ModifierService: {
    applyModifiers: vi.fn((v) => v)
  }
}));

vi.mock('../../../hooks/useDirtyModalClose', () => ({
  useDirtyModalClose: () => ({
    confirmClose: vi.fn((cb) => cb?.()),
    DirtyClosePrompt: null
  })
}));

vi.mock('../../../components/StoryFoundry/GuidedForge/GuidedForgeShell', () => ({
  default: ({ children }) => <div data-testid="mock-guided-forge-shell">{children}</div>
}));

vi.mock('../ElementForge/components/EditElementModalHeader', () => ({
  default: ({ title }) => <div data-testid="mock-edit-header">{title}</div>
}));

vi.mock('../ElementForge/components/EditElementSheetModeBody', () => ({
  default: () => <div data-testid="mock-edit-sheet-body">SheetBody</div>
}));

vi.mock('../store/adeStore', () => {
  const storeState = {
    studioMode: 'development',
    setStudioMode: vi.fn(),
    perspectiveMode: 'architect',
    togglePerspectiveMode: vi.fn(),
    isSplitView: false,
    setIsSplitView: vi.fn(),
    viewportSplit: 'split',
    setViewportSplit: vi.fn(),
    isTreeExpanded: true,
    setIsTreeExpanded: vi.fn(),
    setPreflightTelemetry: vi.fn(),
    storyFlags: {
      gm_secret: { value: true, updatedAt: '2026-11-26' }
    }
  };
  return {
    useAdeStore: (selector) => (typeof selector === 'function' ? selector(storeState) : storeState)
  };
});

vi.mock('../StoryModule/toolbar/ToolbarBreadcrumb', () => ({
  default: () => <div data-testid="mock-toolbar-breadcrumb">Breadcrumb</div>
}));

vi.mock('../StoryModule/toolbar/ToolbarQuickActions', () => ({
  default: () => <div data-testid="mock-toolbar-quick-actions">QuickActions</div>
}));

vi.mock('../StoryModule/toolbar/useModuleHealth', () => ({
  useModuleHealth: () => ({ score: 100, issues: [] })
}));

vi.mock('../../../components/UI/ChatParser', () => ({
  default: ({ text }) => <span>{text}</span>
}));

import EditElementModal from '../ElementForge/EditElementModal.jsx';
import { CombatModifiersWorkbench } from '../PresetsAndScripts/components/CombatModifiersWorkbench.jsx';
import { WallExtruder3D } from '../../../engine/3d/geometry/WallExtruder3D.ts';
import { TheaterSceneViewport } from '../../../components/VTT/stage/TheaterSceneViewport.tsx';
import CronicleWorkingMemoryTab from '../../../components/StoryFoundry/Cronicle/tabs/CronicleWorkingMemoryTab.jsx';
import CronicleCalendarTab from '../../../components/StoryFoundry/Cronicle/tabs/CronicleCalendarTab.jsx';
import ADETopToolbar from '../StoryModule/ADETopToolbar.jsx';
import InteractiveBookView from '../StoryModule/workspaces/InteractiveBookView.jsx';

describe('ADE Deep-Dive Waves D1-D6 Component & Engine Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof Element !== 'undefined') {
      Element.prototype.scrollIntoView = vi.fn();
    }
  });

  it('D1.1: EditElementModal renders closed->open transitions with zero React hook order errors', () => {
    const spySave = vi.fn();
    const spyClose = vi.fn();
    const spyDelete = vi.fn();
    const { rerender } = render(
      <EditElementModal
        isOpen={false}
        onClose={spyClose}
        element={null}
        onSave={spySave}
        onDelete={spyDelete}
      />
    );

    expect(screen.queryByTestId('mock-edit-header')).toBeNull();

    rerender(
      <EditElementModal
        isOpen={true}
        onClose={spyClose}
        element={{
          id: 'elem_d1_1',
          type: 'Setting',
          title: 'Orbital Drydock Theta',
          fields: { summary: 'Drydock berth' }
        }}
        onSave={spySave}
        onDelete={spyDelete}
      />
    );

    expect(screen.getByTestId('mock-edit-header')).toBeTruthy();
  });

  it('D1.3: CombatModifiersWorkbench emits unique truthy IDs across rapid preset clicks', () => {
    const spyAdd = vi.fn();
    const spyToggle = vi.fn();
    const spyDelete = vi.fn();

    render(
      <CombatModifiersWorkbench
        galleryModifiers={[]}
        onAddModifier={spyAdd}
        onToggleModifier={spyToggle}
        onDeleteModifier={spyDelete}
        selectedAsset={null}
      />
    );

    const presetAButton = screen.getByText('Zero-G Maneuvering');
    const presetBButton = screen.getByText('Reactor Overdrive');
    expect(presetAButton).toBeTruthy();
    expect(presetBButton).toBeTruthy();

    fireEvent.click(presetAButton);
    fireEvent.click(presetBButton);

    expect(spyAdd).toHaveBeenCalledTimes(2);
    const idA = spyAdd.mock.calls[0][0]?.id;
    const idB = spyAdd.mock.calls[1][0]?.id;
    expect(typeof idA).toBe('string');
    expect(idA.length).toBeGreaterThan(0);
    expect(typeof idB).toBe('string');
    expect(idB.length).toBeGreaterThan(0);
    expect(idA).not.toBe(idB);
  });

  it('D2.1: WallExtruder3D masks closed secret doors as non-door walls for Operatives', () => {
    const extruder = new WallExtruder3D();
    const secretDoorWall = {
      id: 'wall_secret_1',
      p1: { x: 0, y: 0 },
      p2: { x: 100, y: 0 },
      type: 'door',
      isDoor: true,
      isSecret: true,
      isOpen: false
    };

    const operativeMesh = extruder.createWallMesh(secretDoorWall, false);
    const architectMesh = extruder.createWallMesh(secretDoorWall, true);

    expect(operativeMesh).toBeTruthy();
    expect(architectMesh).toBeTruthy();
    expect(operativeMesh.userData.isDoor).toBe(false);
    expect(architectMesh.userData.isDoor).toBe(true);
  });

  it('D2.6: TheaterSceneViewport filters is_hidden tokens and storyFlags strip for Operatives', () => {
    const tokens = [
      { id: 't_vis', name: 'Hero', is_hidden: false },
      { id: 't_hid', name: 'Secret Assassin', is_hidden: true }
    ];

    const { rerender } = render(
      <TheaterSceneViewport
        currentMap={{ name: 'Briefing Deck' }}
        activeScenario={{ title: 'Briefing' }}
        tokens={tokens}
        elementsCatalog={[]}
        isArchitect={false}
      />
    );

    expect(screen.getByText('Hero')).toBeTruthy();
    expect(screen.queryByText('Secret Assassin')).toBeNull();
    expect(screen.queryByText('gm_secret')).toBeNull();

    rerender(
      <TheaterSceneViewport
        currentMap={{ name: 'Briefing Deck' }}
        activeScenario={{ title: 'Briefing' }}
        tokens={tokens}
        elementsCatalog={[]}
        isArchitect={true}
      />
    );

    expect(screen.getByText('Hero')).toBeTruthy();
    expect(screen.getByText('Secret Assassin')).toBeTruthy();
    expect(screen.getByText(/gm_secret/i)).toBeTruthy();
  });

  it('D5.3: CronicleWorkingMemoryTab and CronicleCalendarTab enforce read-only lock when isStoryReadOnly is true', () => {
    const spyCal = vi.fn();
    const { container } = render(
      <>
        <CronicleWorkingMemoryTab
          workingMemory={{ activeLocationId: '', activePersonaIds: [] }}
          updateWorkingMemory={vi.fn()}
          locations={[]}
          personas={[]}
          contextPreview=""
          scratchNotes=""
          setScratchNotes={vi.fn()}
          handleSaveScratchNotes={vi.fn()}
          isStoryReadOnly={true}
        />
        <CronicleCalendarTab
          calendarState={null}
          onUpdateCalendar={spyCal}
          isStoryReadOnly={true}
        />
      </>
    );

    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeTruthy();
    expect(fieldset.disabled).toBe(true);

    const advanceDayBtn = screen.getByRole('button', { name: /\+1d/i });
    fireEvent.click(advanceDayBtn);
    expect(spyCal).not.toHaveBeenCalled();

    const titleInput = screen.getByPlaceholderText(/Event title/i);
    fireEvent.change(titleInput, { target: { value: 'Locked Event Attempt' } });
    const addEventBtn = screen.getByRole('button', { name: /Add Event/i });
    fireEvent.click(addEventBtn);
    expect(spyCal).not.toHaveBeenCalled();
  });

  it('D5.5: ADETopToolbar invokes MD, PDF, Guide, and Settings quick-action callbacks', () => {
    const spyMd = vi.fn();
    const spyPdf = vi.fn();
    const spyGuide = vi.fn();
    const spySettings = vi.fn();

    render(
      <ADETopToolbar
        activeView="scenarios"
        activeNode={{ id: 'sc_1', title: 'Scenario Alpha' }}
        onExportMarkdown={spyMd}
        onExportPDF={spyPdf}
        onToggleGuide={spyGuide}
        onToggleSettings={spySettings}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'MD' }));
    fireEvent.click(screen.getByRole('button', { name: 'PDF' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guide' }));
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(spyMd).toHaveBeenCalledTimes(1);
    expect(spyPdf).toHaveBeenCalledTimes(1);
    expect(spyGuide).toHaveBeenCalledWith(true);
    expect(spySettings).toHaveBeenCalledWith(true);
  });

  it('D5.6: InteractiveBookView separates decision text and 2d10 roll into sibling buttons without nesting', () => {
    const spyAdvance = vi.fn();
    const spyRoll = vi.fn();

    render(
      <InteractiveBookView
        activeScenario={{ title: 'Chapter 1' }}
        beats={[
          {
            id: 'beat_1',
            beatIndex: 1,
            protagonistName: 'Operative',
            text: 'You approach the blast bulkhead.',
            gate: {
              options: [
                {
                  id: 'opt_1',
                  text: 'Hack Door',
                  skillCheck: 'Slicing CR 14'
                }
              ]
            }
          }
        ]}
        activeStreamingText=""
        isGenerating={false}
        onAdvanceBeat={spyAdvance}
        onRollCheck={spyRoll}
      />
    );

    const groupEl = screen.getByRole('group');
    expect(groupEl.tagName.toLowerCase()).not.toBe('button');

    const optionTextBtn = screen.getByText('Hack Door').closest('button');
    const rollBtn = screen.getByText(/2d10/i).closest('button');

    expect(optionTextBtn).toBeTruthy();
    expect(rollBtn).toBeTruthy();
    expect(optionTextBtn).not.toBe(rollBtn);
    expect(optionTextBtn.contains(rollBtn)).toBe(false);
    expect(rollBtn.contains(optionTextBtn)).toBe(false);

    fireEvent.click(optionTextBtn);
    expect(spyAdvance).toHaveBeenCalledTimes(1);
    expect(spyAdvance).toHaveBeenCalledWith('Hack Door');
    expect(spyRoll).not.toHaveBeenCalled();

    fireEvent.click(rollBtn);
    expect(spyRoll).toHaveBeenCalledTimes(1);
    expect(spyRoll).toHaveBeenCalledWith('Slicing CR 14', 14);
    expect(spyAdvance).toHaveBeenCalledTimes(1);
  });
});
