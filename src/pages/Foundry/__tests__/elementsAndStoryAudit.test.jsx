import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const {
  mockDownloadAimeAssetFile,
  mockVttEmit,
  mockUseAdeStoreState,
  mockCampaignState
} = vi.hoisted(() => ({
  mockDownloadAimeAssetFile: vi.fn(),
  mockVttEmit: vi.fn(),
  mockUseAdeStoreState: {
    studioMode: 'live_session',
    perspectiveMode: 'architect',
    viewportSplit: 'side_by_side',
    setViewportSplit: vi.fn(),
    isSplitView: false,
    setIsSplitView: vi.fn()
  },
  mockCampaignState: {
    universeState: {
      id: 'story_audit_1',
      projectName: 'Audit Sector',
      scenarios: [],
      maps: [{ id: 'map_1', title: 'Docking Bay', gridType: 'hex', tokens: [], walls: [], objects: [] }],
      creativeState: { gems: [] }
    },
    elementsCatalog: [],
    mapsCatalog: [],
    galleryModifiers: [],
    activeScenarioId: null,
    activeMapId: null,
    isStoryReadOnly: true,
    deleteSavedElement: vi.fn(),
    setUniverseState: vi.fn(),
    setIsDirty: vi.fn(),
    updateStory: vi.fn(),
    addGalleryModifier: vi.fn(),
    updateGalleryModifier: vi.fn(),
    deleteGalleryModifier: vi.fn(),
    toggleGalleryModifier: vi.fn(),
    setActiveMapId: vi.fn(),
    deleteMap: vi.fn(),
    deleteSavedMap: vi.fn()
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn(),
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('../../../context/ConfirmContext', () => ({
  useConfirm: () => vi.fn(async () => true),
  showConfirm: vi.fn(async () => true)
}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playDieRoll: vi.fn(),
    playHitImpact: vi.fn()
  }
}));

vi.mock('../../../services/aimeAssetFileService', () => ({
  downloadAimeAssetFile: mockDownloadAimeAssetFile
}));

vi.mock('../../../utils/vttEventBus', () => ({
  VttEventBus: {
    on: vi.fn(() => () => {}),
    emit: mockVttEmit
  }
}));

vi.mock('../../../context/CampaignContext', () => ({
  useStory: () => mockCampaignState,
  useCampaign: () => mockCampaignState,
  formatExportFilename: (t) => `${t || 'export'}.md`
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => ({ dbData: {} })
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({
    roster: [],
    personaRoster: [],
    publicPersonas: [],
    publicCatalog: [],
    saveCurrentToRoster: vi.fn(),
    switchRosterCharacter: vi.fn()
  })
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'user_audit' },
    isAdmin: false
  })
}));

vi.mock('../../../utils/cortexAdeAssetBridge', () => ({
  buildUnifiedAdeCatalog: () => [],
  resolveTargetCortexCollection: () => null
}));

vi.mock('../../../services/customElementTemplateService', () => ({
  listCustomTemplates: () => [],
  saveCustomTemplate: vi.fn(),
  applyCustomTemplate: vi.fn(),
  deleteCustomTemplate: vi.fn()
}));

vi.mock('../../../services/modifierService', () => ({
  MODIFIER_PRESETS: [],
  ModifierService: {
    createModifier: vi.fn((m) => m),
    applyModifiers: vi.fn((v) => v)
  }
}));

vi.mock('../../../components/StoryFoundry/GuidedForge/GuidedForgeShell', () => ({
  default: ({ children, footerRight }) => (
    <div data-testid="guided-shell">
      <div>{children}</div>
      <div data-testid="guided-footer-right">{footerRight}</div>
    </div>
  )
}));

vi.mock('../ElementForge/components/EditElementSheetModeBody', () => ({
  default: () => <div data-testid="sheet-body" />
}));

vi.mock('../ElementForge/ElementForge', () => ({
  default: () => <div data-testid="mock-element-forge" />
}));

vi.mock('../Weaver/WeaverWorkspace', () => ({
  default: () => <div data-testid="mock-weaver-workspace">WeaverWorkspace</div>
}));

vi.mock('../StoryModule/panels/TacticalStageViewport', () => ({
  default: () => <div data-testid="mock-tactical-stage" />
}));

vi.mock('../StoryModule/workspaces/OsrControlPanelDeck', () => ({
  default: () => <div data-testid="mock-osr-deck" />
}));

vi.mock('../StoryModule/workspaces/InteractiveStoryStudio', () => ({
  default: () => <div data-testid="mock-interactive-studio" />
}));

vi.mock('../store/adeStore', () => ({
  useAdeStore: (selector) => (typeof selector === 'function' ? selector(mockUseAdeStoreState) : mockUseAdeStoreState)
}));

import EditElementModal from '../ElementForge/EditElementModal.jsx';
import ScenarioCanvasSwitch from '../StoryModule/panels/ScenarioCanvasSwitch.jsx';
import StoryGallery from '../StoryModule/workspaces/StoryGallery.jsx';

describe('Elements & Story Foundry Audit Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdeStoreState.studioMode = 'live_session';
    mockUseAdeStoreState.perspectiveMode = 'architect';
    mockCampaignState.isStoryReadOnly = true;
  });

  it('EditElementModal exports portable asset via FILE menu without missing getElementFileExtension and disables Save Template when read-only', () => {
    render(
      <EditElementModal
        isOpen={true}
        initialMode="guided"
        onClose={vi.fn()}
        element={{
          id: 'elem_export_1',
          type: 'Property',
          title: 'Plasma Cutter',
          fields: { propertySubcategory: 'gear', summary: 'Industrial torch' }
        }}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const saveTemplateBtn = screen.getByRole('button', { name: /Save Template/i });
    expect(saveTemplateBtn.disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /FILE/i }));
    const exportBtn = screen.getByRole('button', { name: /Export \.property Asset/i });
    fireEvent.click(exportBtn);

    expect(mockDownloadAimeAssetFile).toHaveBeenCalledTimes(1);
    expect(mockDownloadAimeAssetFile.mock.calls[0][0].title).toBe('Plasma Cutter');
  });

  it('ScenarioCanvasSwitch strips ade-gm-secret HTML blocks from Live Session Read-Aloud broadcast and hides HUD in Operator perspective', () => {
    const activeNode = {
      id: 'sc_live_1',
      type: 'scenario',
      title: 'Airlock Seven',
      content: '<p>Frost coats the viewport.</p><div class="ade-gm-secret"><p>Hidden sniper in rafters.</p></div>',
      fields: {}
    };

    const { rerender } = render(
      <ScenarioCanvasSwitch
        activeNode={activeNode}
        scenarioWorkspaceTab="write"
        setScenarioWorkspaceTab={vi.fn()}
        isSplitView={false}
        setIsSplitView={vi.fn()}
        perspectiveMode="architect"
        locationPath={['Arc I', 'Airlock Seven']}
        handleTitleChange={vi.fn()}
        handleOpenAddModal={vi.fn()}
        handleDeleteElement={vi.fn()}
        isRightDockOpen={false}
        onToggleRightDock={vi.fn()}
        updateStory={vi.fn()}
        universeState={mockCampaignState.universeState}
        setActiveScenarioId={vi.fn()}
        linkedMap={null}
        allAvailableMaps={[]}
        setActiveMapId={vi.fn()}
        addMap={vi.fn()}
        handleCreateNewMapForElement={vi.fn()}
        onSwitchView={vi.fn()}
        waypointPromptData={null}
        executeWaypointTrigger={vi.fn()}
        handleConfirmWaypointBeat={vi.fn()}
        handleToggleAutoTrigger={vi.fn()}
        setWaypointPromptData={vi.fn()}
      />
    );

    expect(screen.getByText(/Frost coats the viewport/i)).toBeTruthy();
    expect(screen.queryByText(/Hidden sniper in rafters/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Broadcast to Stage/i }));
    expect(mockVttEmit).toHaveBeenCalledWith(
      'chat-message',
      expect.objectContaining({
        text: 'Frost coats the viewport.'
      })
    );

    rerender(
      <ScenarioCanvasSwitch
        activeNode={activeNode}
        scenarioWorkspaceTab="write"
        setScenarioWorkspaceTab={vi.fn()}
        isSplitView={false}
        setIsSplitView={vi.fn()}
        perspectiveMode="operator"
        locationPath={['Arc I', 'Airlock Seven']}
        handleTitleChange={vi.fn()}
        handleOpenAddModal={vi.fn()}
        handleDeleteElement={vi.fn()}
        isRightDockOpen={false}
        onToggleRightDock={vi.fn()}
        updateStory={vi.fn()}
        universeState={mockCampaignState.universeState}
        setActiveScenarioId={vi.fn()}
        linkedMap={null}
        allAvailableMaps={[]}
        setActiveMapId={vi.fn()}
        addMap={vi.fn()}
        handleCreateNewMapForElement={vi.fn()}
        onSwitchView={vi.fn()}
        waypointPromptData={null}
        executeWaypointTrigger={vi.fn()}
        handleConfirmWaypointBeat={vi.fn()}
        handleToggleAutoTrigger={vi.fn()}
        setWaypointPromptData={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Broadcast to Stage/i })).toBeNull();
  });

  it('StoryGallery disables Delete Map and Add Modifier when read-only, and dismisses Create Modifier modal on Escape & backdrop', () => {
    const { rerender } = render(<StoryGallery />);

    fireEvent.click(screen.getByRole('button', { name: /Tactical Maps/i }));
    expect(screen.getByTitle('Delete Tactical Map').disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /Situational Modifiers/i }));
    expect(screen.getByRole('button', { name: /Add Modifier/i }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: /Create First Modifier/i }).disabled).toBe(true);

    mockCampaignState.isStoryReadOnly = false;
    rerender(<StoryGallery key="editable" />);

    fireEvent.click(screen.getByRole('button', { name: /Situational Modifiers/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add Modifier/i }));
    const dialog = screen.getByRole('dialog', { name: /Add Story Gallery Situational Modifier/i });
    expect(dialog).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /Add Story Gallery Situational Modifier/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Add Modifier/i }));
    const backdrop = screen.getByRole('dialog', { name: /Add Story Gallery Situational Modifier/i }).parentElement;
    fireEvent.click(backdrop);
    expect(screen.queryByRole('dialog', { name: /Add Story Gallery Situational Modifier/i })).toBeNull();
  });
});
