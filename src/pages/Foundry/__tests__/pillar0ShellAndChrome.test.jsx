/**
 * @file pillar0ShellAndChrome.test.jsx
 * @description Pillar 0 Regression Suite — ADE Shell, State, Navigation & Core Infrastructure:
 *   1. CommandPaletteModal reactivity to perspectiveMode and isStoryReadOnly toggles
 *   2. NewStoryModal title reset when reopened
 *   3. ToolbarProjectMenu read-only guards (rename, clear, delete, cloud push) and Studio Settings menu item
 *   4. ToolbarQuickActions DEPLOY TO STAGE dirty-state flush/confirm guard and mobile overflow menu
 *   5. FoundryModalHost Operator-Safe sanitization of floating AIME contextData
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const hoisted = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  streamChatContentMock: vi.fn(async ({ onChunk }) => {
    const reply = 'Acknowledged.';
    onChunk?.(reply);
    return reply;
  }),
  authState: {
    currentUser: { uid: 'uid_pillar0' },
    userHandle: 'architect',
    isAdmin: true
  },
  campaignState: {
    universeState: {
      id: 'story_p0',
      projectName: 'Orbital Watch',
      scenarios: [
        {
          id: 'sc_public',
          title: 'Public Docking Bay',
          type: 'Scene',
          content: '<p>Docking clamps engaged.</p><div class="ade-gm-secret">Secret Ambush</div>',
          fields: { gmNotes: 'Hidden sniper on catwalk', readAloud: 'Cold air hisses.' }
        },
        {
          id: 'sc_hidden',
          title: 'Secret Reactor Core',
          type: 'Scene',
          isHidden: true,
          content: '<p>Classified reactor.</p>',
          fields: {}
        }
      ],
      maps: [{ id: 'map_p0', title: 'Watch Grid', gridSize: 50 }],
      creativeState: {},
      galleryModifiers: [],
      cronicle: {
        history: [],
        pendingDeltas: [],
        gmNotes: 'Master GM Secret',
        secrets: 'Core is rigged',
        entries: [{ id: 'e1', title: 'Visible' }, { id: 'e2', title: 'Hidden', isHidden: true }]
      }
    },
    storyCatalog: [{ id: 'story_p0', projectName: 'Orbital Watch' }],
    elementsCatalog: [
      { id: 'el_pub', title: 'Plasma Torch', type: 'Property', fields: {} },
      { id: 'el_gm', title: 'GM Assassin', type: 'Persona', isGmOnly: true, fields: {} }
    ],
    isStoryReadOnly: false,
    openStory: vi.fn(),
    createNewStory: vi.fn(),
    deleteStoryProject: vi.fn(),
    updateProjectName: vi.fn(),
    handleSaveStory: vi.fn(),
    handleLoadStory: vi.fn(),
    pushUniverseToCloud: vi.fn(),
    pullUniverseFromCloud: vi.fn(),
    cloudSyncStatus: 'synced',
    lastCloudSavedAt: '12:00 PM',
    handleClearUniverse: vi.fn(),
    getActiveGemsText: vi.fn(() => ''),
    updateStory: vi.fn(),
    addMap: vi.fn(),
    updateMap: vi.fn(),
    addStory: vi.fn(),
    setActiveMapId: vi.fn(),
    setActiveScenarioId: vi.fn(),
    setGalleryModifiers: vi.fn(),
    saveStageManifest: vi.fn(),
    updateCreativeState: vi.fn(),
    updateCronicle: vi.fn()
  },
  toastState: {
    showToast: vi.fn(),
    toast: vi.fn()
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
  onSnapshot: vi.fn(() => () => {})
}));

vi.mock('../../../firebase', () => ({
  db: {},
  auth: { currentUser: null }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => hoisted.navigateMock,
  useLocation: () => ({ pathname: '/foundry', search: '' })
}));

vi.mock('../../../services/audioService', () => ({
  default: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn() }
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => hoisted.authState
}));

vi.mock('../../../context/CampaignContext', () => ({
  useCampaign: () => hoisted.campaignState,
  useStory: () => hoisted.campaignState
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: hoisted.toastState.showToast,
  useToast: () => hoisted.toastState
}));

vi.mock('../../../context/ConfirmContext', () => ({
  showConfirm: vi.fn(async () => true),
  useConfirm: () => vi.fn(async () => true)
}));

vi.mock('../../../utils/confirmationUtils', () => ({
  confirmTypedDeletion: vi.fn(async () => true)
}));

vi.mock('../../../services/aimeService', async () => {
  const { parseRollCommand } = await vi.importActual('../../../services/bastionService');
  return {
    streamChatContent: hoisted.streamChatContentMock,
    parseRollCommand,
    formatCronicleContextForAIME: vi.fn(() => '')
  };
});

vi.mock('../ElementForge/EditElementModal', () => ({
  default: () => null
}));

vi.mock('../../../components/StoryFoundry/FoundryLauncherModal', () => ({
  default: () => null
}));

vi.mock('../../../components/StoryFoundry/SelectivePrintModal', () => ({
  default: () => null
}));

vi.mock('../../../components/StoryFoundry/StoryFoundryGuideModal', () => ({
  StoryFoundryGuideModal: () => null
}));

vi.mock('../../../components/UserSettingsModal', () => ({
  UserSettingsModal: () => null
}));

vi.mock('../../../components/StoryFoundry/Cronicle/CronicleDeckModal', () => ({
  default: () => null
}));

vi.mock('../../../components/StoryFoundry/VttCompilerModal', () => ({
  default: () => null
}));

vi.mock('../../../components/StoryFoundry/ModulePackageModal', () => ({
  default: () => null
}));

vi.mock('../../../components/StoryFoundry/ArtistHubModal', () => ({
  ArtistHubModal: () => null
}));

import { useAdeStore } from '../store/adeStore';
import CommandPaletteModal from '../StoryModule/CommandPaletteModal';
import NewStoryModal from '../StoryModule/toolbar/NewStoryModal';
import ToolbarProjectMenu from '../StoryModule/toolbar/ToolbarProjectMenu';
import ToolbarQuickActions from '../StoryModule/toolbar/ToolbarQuickActions';
import FoundryModalHost from '../StoryModule/FoundryModalHost';

describe('Pillar 0: ADE Shell, State, Navigation & Core Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    hoisted.campaignState.isStoryReadOnly = false;
    useAdeStore.getState().setPerspectiveMode('architect');
    useAdeStore.getState().setModal('floatingAime', false);
  });

  afterEach(() => {
    cleanup();
  });

  it('1. CommandPaletteModal reacts immediately when perspectiveMode or isStoryReadOnly changes', () => {
    const { rerender } = render(
      <CommandPaletteModal
        isOpen={true}
        onClose={vi.fn()}
        universeState={hoisted.campaignState.universeState}
        elementsCatalog={hoisted.campaignState.elementsCatalog}
        isStoryReadOnly={false}
      />
    );

    expect(screen.getByText('Create New Story Element')).toBeInTheDocument();
    expect(screen.getByText('Secret Reactor Core')).toBeInTheDocument();
    expect(screen.getByText('GM Assassin')).toBeInTheDocument();

    // Switch to Operator mode & Read-only story without changing scenarios/elements references
    act(() => {
      useAdeStore.getState().setPerspectiveMode('operator');
    });
    rerender(
      <CommandPaletteModal
        isOpen={true}
        onClose={vi.fn()}
        universeState={hoisted.campaignState.universeState}
        elementsCatalog={hoisted.campaignState.elementsCatalog}
        isStoryReadOnly={true}
      />
    );

    expect(screen.queryByText('Create New Story Element')).not.toBeInTheDocument();
    expect(screen.queryByText('Secret Reactor Core')).not.toBeInTheDocument();
    expect(screen.queryByText('GM Assassin')).not.toBeInTheDocument();
    expect(screen.getByText('Public Docking Bay')).toBeInTheDocument();
  });

  it('2. NewStoryModal resets its title input back to default when closed and reopened', () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();
    const { rerender } = render(
      <NewStoryModal isOpen={true} onClose={onClose} onCreateStory={onCreate} />
    );

    const input = screen.getByPlaceholderText(/Operation Voidfall/i);
    fireEvent.change(input, { target: { value: 'Operation Nova' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));
    expect(onCreate).toHaveBeenCalledWith('Operation Nova');

    rerender(<NewStoryModal isOpen={false} onClose={onClose} onCreateStory={onCreate} />);
    rerender(<NewStoryModal isOpen={true} onClose={onClose} onCreateStory={onCreate} />);

    expect(screen.getByPlaceholderText(/Operation Voidfall/i)).toHaveValue('New Story Module');
  });

  it('3. ToolbarProjectMenu enforces isStoryReadOnly on rename/clear/delete/push and wires Studio Settings', async () => {
    const onToggleSettings = vi.fn();
    hoisted.campaignState.isStoryReadOnly = true;

    render(
      <ToolbarProjectMenu
        isStoryReadOnly={true}
        onToggleSettings={onToggleSettings}
      />
    );

    fireEvent.click(screen.getByTitle(/Story Module Actions/i));

    const renameInput = screen.getByPlaceholderText(/Story Module Name/i);
    expect(renameInput).toBeDisabled();

    const pushBtn = screen.getByRole('button', { name: /Push to Cloud DB/i });
    const clearBtn = screen.getByRole('button', { name: /Clear Story Elements/i });
    const deleteBtn = screen.getByRole('button', { name: /Delete Story Project/i });
    expect(pushBtn).toBeDisabled();
    expect(clearBtn).toBeDisabled();
    expect(deleteBtn).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Studio Settings/i }));
    expect(onToggleSettings).toHaveBeenCalledWith(true);
    expect(hoisted.campaignState.updateProjectName).not.toHaveBeenCalled();
    expect(hoisted.campaignState.handleClearUniverse).not.toHaveBeenCalled();
    expect(hoisted.campaignState.deleteStoryProject).not.toHaveBeenCalled();
  });

  it('4. ToolbarQuickActions flushes/confirms dirty state before DEPLOY TO STAGE and renders mobile overflow menu', async () => {
    const triggerStorySave = vi.fn(async () => {});
    const onToggleCompiler = vi.fn();
    render(
      <ToolbarQuickActions
        activeView="scenarios"
        universeState={hoisted.campaignState.universeState}
        activeNode={{ id: 'sc_public' }}
        targetMapId="map_p0"
        isDirty={true}
        triggerStorySave={triggerStorySave}
        onToggleCompiler={onToggleCompiler}
      />
    );

    fireEvent.click(screen.getByTitle(/Deploy active scenario/i));
    await waitFor(() => {
      expect(triggerStorySave).toHaveBeenCalledTimes(1);
      expect(hoisted.navigateMock).toHaveBeenCalledWith('/stage?mapId=map_p0&scenarioId=sc_public');
    });

    // If only confirmIfDirty is provided and returns false, navigation must abort
    hoisted.navigateMock.mockClear();
    cleanup();
    const confirmDeny = vi.fn(async () => false);
    render(
      <ToolbarQuickActions
        activeView="scenarios"
        universeState={hoisted.campaignState.universeState}
        activeNode={{ id: 'sc_public' }}
        targetMapId="map_p0"
        isDirty={true}
        confirmIfDirty={confirmDeny}
        onToggleCompiler={onToggleCompiler}
      />
    );
    fireEvent.click(screen.getByTitle(/Deploy active scenario/i));
    await waitFor(() => {
      expect(confirmDeny).toHaveBeenCalledTimes(1);
    });
    expect(hoisted.navigateMock).not.toHaveBeenCalled();

    // Mobile overflow menu exposes Prep VTT Module
    fireEvent.click(screen.getByRole('button', { name: /More Stage & Studio Actions/i }));
    const prepButtons = screen.getAllByRole('button', { name: /Prep VTT/i });
    fireEvent.click(prepButtons[prepButtons.length - 1]);
    expect(onToggleCompiler).toHaveBeenCalledWith(true);
  });

  it('5. FoundryModalHost sanitizes activeNode, cronicle, catalog, and scratchbook for AIMEChatBox in Operator mode', async () => {
    useAdeStore.getState().setPerspectiveMode('operator');

    render(
      <FoundryModalHost
        modals={{ floatingAime: true }}
        setModal={vi.fn()}
        activeNode={hoisted.campaignState.universeState.scenarios[0]}
        universeState={hoisted.campaignState.universeState}
        elementsCatalog={hoisted.campaignState.elementsCatalog}
        cronicle={hoisted.campaignState.universeState.cronicle}
      />
    );

    const input = screen.getByPlaceholderText(/Ask AIME for story lore/i);
    fireEvent.change(input, { target: { value: 'Summarize the bay.' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(hoisted.streamChatContentMock).toHaveBeenCalledTimes(1);
    });

    const callArg = hoisted.streamChatContentMock.mock.calls[0][0];
    const ctx = callArg.context;
    expect(ctx.operatorSafe).toBe(true);
    expect(ctx.activeNode.content).not.toContain('Secret Ambush');
    expect(ctx.activeNode.fields.gmNotes).toBeUndefined();
    expect(ctx.cronicle.gmNotes).toBeUndefined();
    expect(ctx.cronicle.secrets).toBeUndefined();
    expect(ctx.cronicle.entries.map((e) => e.id)).toEqual(['e1']);
    expect(ctx.customCatalog.map((e) => e.id)).toEqual(['el_pub']);
    expect(ctx.scratchbook).not.toContain('Secret Reactor Core');
    expect(ctx.scratchbook).not.toContain('Secret Ambush');
  });
});
