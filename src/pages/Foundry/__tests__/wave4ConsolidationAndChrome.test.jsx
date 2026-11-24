/**
 * @file wave4ConsolidationAndChrome.test.jsx
 * @description Wave 4 Regression Suite — UX Consolidation & Chrome De-Bloat:
 *   1. AIMEChatBox: embedded inline mode, Markdown rendering, project-scoped history, /roll effectiveTotal + error halt, Insert into Story
 *   2. ScenarioCockpitDockPanel: right-rail AIME button, embedded AIME mount, prose insert into active scenario, Open Split Stage
 *   3. GlobalHUD & FoundryModalHost: mutual exclusion between BASTION drawer and floating AIME
 *   4. ADENavRail, ToolbarQuickActions & ADETopToolbar: TREE/COCKPIT scenario guards, isExpanded labels, pendingDeltas pulse
 *   5. DashboardCatalogPanel & FolderOrganizerModal: 'all' default folder, touch-visible actions, Escape + backdrop close
 *   6. Core ADE modals: FoundryLauncherModal, ModulePackageModal, SelectivePrintModal, VttCompilerModal (nested AIME Audit priority), CronicleDeckModal Escape & backdrop dismissal
 *   7. ArchitectToolOptionsPanels ('pan') & useMultiplayerCursors (zero fake phantom bot cursors)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const hoisted = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  locationState: { pathname: '/foundry', search: '' },
  streamChatContentMock: vi.fn(async ({ onChunk }) => {
    const reply = '**Tactical Feed:** Airlock seals breached.';
    onChunk?.(reply);
    return reply;
  }),
  authState: {
    currentUser: { uid: 'uid_wave4' },
    userHandle: 'architect',
    openAuthModal: vi.fn(),
    confirmLogout: vi.fn(),
    isAdmin: true
  },
  campaignState: {
    universeState: {
      id: 'story_wave4_alpha',
      projectName: 'Station Helix',
      scenarios: [{ id: 'sc_1', title: 'Docking Bay', type: 'Scene', content: '<p>Initial prose.</p>' }],
      maps: [{ id: 'map_1', title: 'Bay Grid', gridMode: 'Hex', objects: [], tokens: [] }],
      creativeState: {},
      galleryModifiers: [],
      cronicle: { history: [{ id: 'old_h1' }], pendingDeltas: [] }
    },
    storyCatalog: [{ id: 'story_wave4_alpha', projectName: 'Station Helix' }],
    publicStoryCatalog: [],
    elementsCatalog: [{ id: 'el_1', title: 'Shock Baton', type: 'Property', fields: {} }],
    mapsCatalog: [{ id: 'map_1', title: 'Bay Grid', gridMode: 'Hex', objects: [], tokens: [] }],
    activeMapId: 'map_1',
    activeScenarioId: 'sc_1',
    cronicle: { history: [{ id: 'old_h1' }], pendingDeltas: [] },
    isStoryReadOnly: false,
    updateStory: vi.fn(),
    addStory: vi.fn(),
    openStory: vi.fn(),
    createNewStory: vi.fn(),
    deleteStoryProject: vi.fn(),
    deleteSavedElement: vi.fn(),
    updateSavedElement: vi.fn(),
    addMap: vi.fn(),
    updateMap: vi.fn(),
    setUniverseState: vi.fn(),
    setActiveScenarioId: vi.fn(),
    setActiveMapId: vi.fn(),
    setIsDirty: vi.fn(),
    setIsStoryReadOnly: vi.fn(),
    setGalleryModifiers: vi.fn(),
    handleSaveLocal: vi.fn(),
    confirmIfDirty: vi.fn(async () => true),
    toggleStoryVisibility: vi.fn(),
    loadPublicStories: vi.fn(),
    clonePublicStory: vi.fn(),
    deleteSavedMap: vi.fn(),
    getActiveGemsText: vi.fn(() => ''),
    updateCreativeState: vi.fn(),
    updateCronicle: vi.fn(),
    cloudSyncStatus: 'synced'
  },
  toastState: {
    toast: vi.fn(),
    showToast: vi.fn(),
    showInfo: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn()
  },
  chatState: { totalUnreadCount: 0, toggleCommsDock: vi.fn() },
  groupState: { pendingInvites: [] },
  diceState: { isDiceOpen: false, toggleDiceRoller: vi.fn() },
  audioState: { isMuted: false, toggleMute: vi.fn() },
  dbmState: { handleImportMasterJSON: vi.fn(), saveEntry: vi.fn(), dbData: {} },
  folioState: {
    roster: [],
    personaRoster: [],
    activeTab: 'catalog',
    isCharacterSelected: false,
    switchRosterCharacter: vi.fn(),
    saveCurrentToRoster: vi.fn()
  },
  foldersList: [{ id: 'folder_1', name: 'Sector Alpha', color: '#22d3ee' }],
  folderAssignments: { story_wave4_alpha: 'folder_1' }
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
  auth: { currentUser: null }
}));

vi.mock('react-router-dom', () => ({
  NavLink: ({ children, to, ...rest }) => <a href={to || '#'} {...rest}>{children}</a>,
  useLocation: () => hoisted.locationState,
  useNavigate: () => hoisted.navigateMock
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

vi.mock('../../../services/aimeService', async () => {
  const { parseRollCommand } = await vi.importActual('../../../services/bastionService');
  return {
    streamChatContent: hoisted.streamChatContentMock,
    parseRollCommand,
    formatCronicleContextForAIME: vi.fn(() => ''),
    generateGuidedStage3Draft: vi.fn(async () => ({})),
    generateContextualGuidance: vi.fn(async () => ({ guidance: 'Audit clean.' }))
  };
});

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

vi.mock('../../../context/ChatContext', () => ({
  useChat: () => hoisted.chatState
}));

vi.mock('../../../context/GroupContext', () => ({
  useGroup: () => hoisted.groupState
}));

vi.mock('../../../context/DiceContext', () => ({
  useDice: () => hoisted.diceState
}));

vi.mock('../../../context/AudioContext', () => ({
  useAudio: () => hoisted.audioState
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => hoisted.dbmState,
  loadCompendiumCatalog: vi.fn()
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => hoisted.folioState
}));

vi.mock('../../../services/customFolderService', () => ({
  getFolders: () => hoisted.foldersList,
  createFolder: vi.fn(),
  updateFolder: vi.fn(),
  deleteFolder: vi.fn(),
  getItemFolderAssignments: () => hoisted.folderAssignments,
  assignItemToFolder: vi.fn(),
  moveItemInFolder: vi.fn(),
  sortContentItems: (items) => items || [],
  FOLDER_COLORS: [{ name: 'Cyan', hex: '#22d3ee' }],
  FOLDERS_UPDATE_EVENT: 'tangent-folders-updated'
}));

vi.mock('../../../components/UserSettingsModal', () => ({
  UserSettingsModal: () => null
}));

vi.mock('../../../components/UI/ComprehensiveUserGuideModal', () => ({
  ComprehensiveUserGuideModal: () => null
}));

vi.mock('../../../components/Squads/SquadModal', () => ({
  GameGroupModal: () => null
}));

vi.mock('../StoryModule/toolbar/ToolbarProjectMenu', () => ({
  default: () => null
}));

vi.mock('../StoryModule/toolbar/ToolbarBreadcrumb', () => ({
  default: () => null
}));

vi.mock('../ElementForge/EditElementModal', () => ({
  default: () => null
}));

vi.mock('../../../components/StoryFoundry/Cronicle/tabs/CronicleWorkingMemoryTab', () => ({
  default: () => <div data-testid="cronicle-memory-tab" />
}));
vi.mock('../../../components/StoryFoundry/Cronicle/tabs/CroniclePersonasTab', () => ({
  default: () => null
}));
vi.mock('../../../components/StoryFoundry/Cronicle/tabs/CronicleWorldTab', () => ({
  default: () => null
}));
vi.mock('../../../components/StoryFoundry/Cronicle/tabs/CronicleTimelineTab', () => ({
  default: () => null
}));
vi.mock('../../../components/StoryFoundry/Cronicle/tabs/CronicleDeltaReviewTab', () => ({
  default: () => null
}));
vi.mock('../../../components/StoryFoundry/Cronicle/tabs/CronicleWorkingCopiesTab', () => ({
  default: () => null
}));
vi.mock('../../../components/StoryFoundry/Cronicle/tabs/CronicleScratchbookDocTab', () => ({
  default: () => null
}));
vi.mock('../../../components/StoryFoundry/Cronicle/tabs/CronicleCalendarTab', () => ({
  default: () => null
}));

import { useAdeStore } from '../store/adeStore';
import AIMEChatBox from '../AIME/AIMEChatBox';
import { ScenarioCockpitDockPanel } from '../StoryModule/ScenarioCockpitDock';
import { GlobalHUD } from '../../../components/Layout/GlobalHUD';
import FoundryModalHost from '../StoryModule/FoundryModalHost';
import ADENavRail from '../StoryModule/ADENavRail';
import ToolbarQuickActions from '../StoryModule/toolbar/ToolbarQuickActions';
import ADETopToolbar from '../StoryModule/ADETopToolbar';
import DashboardCatalogPanel from '../Dashboard/DashboardCatalogPanel';
import { FolderOrganizerModal } from '../../../components/StoryFoundry/FolderOrganizerModal';
import FoundryLauncherModal from '../../../components/StoryFoundry/FoundryLauncherModal';
import ModulePackageModal from '../../../components/StoryFoundry/ModulePackageModal';
import { SelectivePrintModal } from '../../../components/StoryFoundry/SelectivePrintModal';
import { VttCompilerModal } from '../../../components/StoryFoundry/VttCompilerModal';
import CronicleDeckModal from '../../../components/StoryFoundry/Cronicle/CronicleDeckModal';
import { VttModuleCompiler } from '../../../services/vttModuleCompilerService';
import { ArchitectToolOptionsPanels } from '../MapMaker/map/console/ArchitectToolOptionsPanels';
import { useMultiplayerCursors } from '../../../components/VTT/hooks/useMultiplayerCursors';

describe('Wave 4: UX Consolidation & Chrome De-Bloat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    hoisted.locationState.pathname = '/foundry';
    hoisted.campaignState.cronicle = { history: [{ id: 'old_h1' }], pendingDeltas: [] };
    useAdeStore.getState().setModal('floatingAime', false);
    useAdeStore.getState().setIsSplitView(false);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('1. AIMEChatBox renders embedded Markdown, scopes history by project, handles /roll Crit & syntax errors, and inserts prose', async () => {
    const onInsertMock = vi.fn();
    const { container, rerender } = render(
      <AIMEChatBox
        embedded={true}
        onClose={vi.fn()}
        onInsertText={onInsertMock}
        contextData={{ universeState: { id: 'proj_alpha', projectName: 'Alpha' } }}
      />
    );

    // Embedded layout must NOT render fixed right drawer overlay
    expect(container.querySelector('.fixed.right-0')).toBeNull();
    expect(screen.queryByTitle(/Undock into a movable floating window/i)).not.toBeInTheDocument();

    // Renders greeting with Markdown <strong>
    const strongAime = container.querySelector('strong');
    expect(strongAime).toHaveTextContent('AIME');

    // Canonical Crit /roll shows Effective Total and Advantage/Crit details
    const input = screen.getByPlaceholderText(/Ask AIME for story lore/i);
    fireEvent.change(input, { target: { value: '/roll 2d10+4 crit:2 vs 10' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText(/Effective Total =/i)).toBeInTheDocument();
    });

    // Invalid /roll stops with syntax error notice and never falls through to LLM
    fireEvent.change(input, { target: { value: '/roll ???' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText(/Roll syntax error/i)).toBeInTheDocument();
    });
    expect(hoisted.streamChatContentMock).not.toHaveBeenCalled();

    // LLM response renders formatted Markdown and enables "Insert into Story"
    fireEvent.change(input, { target: { value: 'Describe the breach.' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText(/Tactical Feed:/i)).toBeInTheDocument();
    });
    const insertBtn = screen.getByRole('button', { name: /Insert into Story/i });
    fireEvent.click(insertBtn);
    expect(onInsertMock).toHaveBeenCalledWith('**Tactical Feed:** Airlock seals breached.');

    // Switching project ID isolates chat history under separate storage key
    rerender(
      <AIMEChatBox
        embedded={true}
        onClose={vi.fn()}
        onInsertText={onInsertMock}
        contextData={{ universeState: { id: 'proj_beta', projectName: 'Beta' } }}
      />
    );
    expect(screen.queryByText(/Tactical Feed:/i)).not.toBeInTheDocument();
  });

  it('2. ScenarioCockpitDockPanel exposes AIME right-rail tab, embeds AIME inline, and inserts prose via updateStory', async () => {
    const setDockTab = vi.fn();
    const { rerender } = render(
      <ScenarioCockpitDockPanel
        isRightDockOpen={true}
        onToggleRightDock={vi.fn()}
        dockTab="inspector"
        setDockTab={setDockTab}
        activeNode={{ id: 'sc_1', title: 'Docking Bay', type: 'Scene', content: '<p>Start.</p>', fields: {} }}
        updateStory={hoisted.campaignState.updateStory}
        universeState={hoisted.campaignState.universeState}
        elementsCatalog={hoisted.campaignState.elementsCatalog}
        setActiveMapId={vi.fn()}
        setScenarioWorkspaceTab={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'AIME Co-Author' }));
    expect(setDockTab).toHaveBeenCalledWith('aime');

    rerender(
      <ScenarioCockpitDockPanel
        isRightDockOpen={true}
        onToggleRightDock={vi.fn()}
        dockTab="aime"
        setDockTab={setDockTab}
        activeNode={{ id: 'sc_1', title: 'Docking Bay', type: 'Scene', content: '<p>Start.</p>', fields: {} }}
        updateStory={hoisted.campaignState.updateStory}
        universeState={hoisted.campaignState.universeState}
        elementsCatalog={hoisted.campaignState.elementsCatalog}
        setActiveMapId={vi.fn()}
        setScenarioWorkspaceTab={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Ask AIME for story lore/i);
    fireEvent.change(input, { target: { value: 'Draft next beat.' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Insert into Story/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Insert into Story/i }));
    expect(hoisted.campaignState.updateStory).toHaveBeenCalledWith('sc_1', {
      content: expect.stringContaining('<strong>Tactical Feed:</strong> Airlock seals breached.')
    });
  });

  it('3. GlobalHUD & FoundryModalHost enforce BASTION <-> Floating AIME mutual exclusion', () => {
    const closeBastionSpy = vi.fn();
    window.addEventListener('close-bastion-drawer', closeBastionSpy);

    const setModalSpy = vi.fn();
    render(
      <>
        <GlobalHUD />
        <FoundryModalHost
          modals={{ floatingAime: true }}
          setModal={setModalSpy}
          universeState={hoisted.campaignState.universeState}
          elementsCatalog={hoisted.campaignState.elementsCatalog}
        />
      </>
    );

    expect(closeBastionSpy).toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new CustomEvent('close-floating-aime'));
    });
    expect(setModalSpy).toHaveBeenCalledWith('floatingAime', false);

    fireEvent.click(screen.getAllByTitle('Launch AIME Narrative Co-Pilot AI Assistant')[0]);
    expect(useAdeStore.getState().modals.floatingAime).toBe(true);
    window.removeEventListener('close-bastion-drawer', closeBastionSpy);
  });

  it('4. ADENavRail, ToolbarQuickActions & ADETopToolbar apply scenario guards, expanded labels, and pendingDeltas pulse', () => {
    const { rerender } = render(
      <ADENavRail
        activeView="map"
        onSwitchView={vi.fn()}
        isTreeExpanded={false}
        onToggleTreeExpanded={vi.fn()}
        onOpenGuide={vi.fn()}
      />
    );
    expect(screen.queryByText(/TREE COLLAPSED/i)).not.toBeInTheDocument();

    rerender(
      <ADENavRail
        activeView="scenarios"
        onSwitchView={vi.fn()}
        isTreeExpanded={true}
        onToggleTreeExpanded={vi.fn()}
        isMobileOpen={true}
        onOpenGuide={vi.fn()}
      />
    );
    expect(screen.getByText('TREE EXPANDED')).toBeInTheDocument();
    expect(screen.getByText('ADE GUIDE')).toBeInTheDocument();
    cleanup();

    render(
      <ToolbarQuickActions
        activeView="map"
        onToggleRightDock={vi.fn()}
        onSelectCockpitDeck={vi.fn()}
        universeState={hoisted.campaignState.universeState}
      />
    );
    expect(screen.queryByText('COCKPIT')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Launch AIME Narrative Co-Pilot'));
    expect(useAdeStore.getState().modals.floatingAime).toBe(true);
    cleanup();

    // ADETopToolbar must NOT pulse Cronicle badge when only history exists and pendingDeltas is empty
    hoisted.campaignState.cronicle = { history: [{ id: 'h1' }], pendingDeltas: [] };
    render(
      <ADETopToolbar
        activeView="scenarios"
        onToggleCronicle={vi.fn()}
      />
    );
    const cronicleBtn = screen.getByTitle(/Cronicle Living Memory/i);
    expect(cronicleBtn.querySelector('.animate-pulse')).toBeNull();
    cleanup();

    hoisted.campaignState.cronicle = { history: [{ id: 'h1' }], pendingDeltas: [{ id: 'd1' }] };
    render(
      <ADETopToolbar
        activeView="scenarios"
        onToggleCronicle={vi.fn()}
      />
    );
    expect(screen.getByTitle(/Cronicle Living Memory/i).querySelector('.animate-pulse')).not.toBeNull();
  });

  it('5. DashboardCatalogPanel defaults to all items and FolderOrganizerModal closes on Escape with touch-visible buttons', () => {
    const { container } = render(
      <DashboardCatalogPanel stories={hoisted.campaignState.storyCatalog} onOpenStory={vi.fn()} />
    );
    // Filed story is visible by default because activeFolderId starts at 'all'
    expect(screen.getByText('Station Helix')).toBeInTheDocument();
    expect(container).toBeTruthy();
    cleanup();

    const onCloseOrganizer = vi.fn();
    render(
      <FolderOrganizerModal
        isOpen={true}
        onClose={onCloseOrganizer}
        stories={hoisted.campaignState.storyCatalog}
      />
    );
    const renameBtn = screen.getByTitle('Rename / Edit color');
    expect(renameBtn.parentElement).toHaveClass('opacity-100');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseOrganizer).toHaveBeenCalled();
  });

  it('6. Core modals (Launcher, Package, Print, Compiler w/ AIME Audit precedence, Cronicle) dismiss cleanly on Escape & backdrop click', () => {
    const onCloseLauncher = vi.fn();
    const { unmount: unmountLauncher } = render(
      <FoundryLauncherModal isOpen={true} onClose={onCloseLauncher} />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseLauncher).toHaveBeenCalledTimes(1);
    unmountLauncher();

    const onClosePkg = vi.fn();
    const { container: pkgContainer, unmount: unmountPkg } = render(
      <ModulePackageModal isOpen={true} onClose={onClosePkg} universeState={hoisted.campaignState.universeState} />
    );
    fireEvent.click(pkgContainer.firstChild);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClosePkg).toHaveBeenCalledTimes(2);
    unmountPkg();

    const onClosePrint = vi.fn();
    const { unmount: unmountPrint } = render(
      <SelectivePrintModal
        isOpen={true}
        onClose={onClosePrint}
        universeState={hoisted.campaignState.universeState}
        elementsCatalog={hoisted.campaignState.elementsCatalog}
      />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClosePrint).toHaveBeenCalledTimes(1);
    unmountPrint();

    vi.spyOn(VttModuleCompiler, 'compileScenarioForVtt').mockReturnValue({
      package: {
        manifest: { title: 'Test', stats: { totalTokens: 0, scriptedNpcs: 0, totalObjects: 0, totalWalls: 0, totalModifiers: 0 } },
        automations: { scriptedNpcs: [], triggers: [] },
        gallery: { modifiers: [] }
      },
      diagnostics: { isValid: true, errors: [], warnings: [] }
    });
    const onCloseCompiler = vi.fn();
    const { unmount: unmountCompiler } = render(
      <VttCompilerModal isOpen={true} onClose={onCloseCompiler} />
    );
    // Open nested AIME Audit flyout first -> first Escape closes flyout, second Escape closes compiler
    fireEvent.click(screen.getByRole('button', { name: /AIME Audit/i }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseCompiler).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseCompiler).toHaveBeenCalledTimes(1);
    unmountCompiler();

    const onCloseCronicle = vi.fn();
    render(<CronicleDeckModal isOpen={true} onClose={onCloseCronicle} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseCronicle).toHaveBeenCalledTimes(1);
  });

  it('7. ArchitectToolOptionsPanels renders Pan panel and useMultiplayerCursors spawns zero fake phantom bots', () => {
    render(<ArchitectToolOptionsPanels activeTool="pan" />);
    expect(screen.getByText(/Viewport Pan \(H\)/i)).toBeInTheDocument();

    const fakeContainer = { destroyed: false, removeChildren: vi.fn(() => []), addChild: vi.fn(), children: [] };
    function Harness() {
      const ref = React.useRef(fakeContainer);
      useMultiplayerCursors({ containerRef: ref, isMultiplayerSimActive: true, isSimulationPaused: false, canvasGeneration: 1 });
      return null;
    }
    render(<Harness />);
    expect(fakeContainer.addChild).not.toHaveBeenCalled();
  });
});
