/**
 * @file wave3PlacebosAndMapMaker.test.jsx
 * @description Wave 3 Regression Suite — Eliminate Placebo Controls, MapMaker Lag & Tool Unification:
 *   1. computeRulerPaceStats formats meters, feet, and squares accurately
 *   2. useMapHistory snapshots and restores regions on undo/redo
 *   3. ArchitectToolOptionsPanels renders working controls for pencil, text, ruler, and token (Portal Link)
 *   4. GlobalHUD hides GM shell chrome on /foundry/view/* and /foundry/spectator/* routes
 *   5. CreateScenarioModal merges mapsCatalog into "Link Existing Map" and resets state on reopen
 *   6. SelectivePrintModal gates Props & Tactical Spread in both preview and export options
 *   7. VttCompilerModal displays blocking compiler diagnostics when compilation throws
 *   8. Stage tabs: AnchorsTab region dimensions, FlowTab APPLY_MODIFIER, EnvironmentTab 3-bus mute, EncountersTab label+name
 *   9. PresetsAndScripts workbenches sync local state when selectedAsset changes
 *  10. AiConfigDrawer removes placeholder OpenAI/Anthropic options and runs honest fetch probes
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const hoisted = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  locationState: { pathname: '/foundry/map', search: '' },
  authState: {
    currentUser: { uid: 'uid_wave3' },
    userHandle: 'architect',
    openAuthModal: vi.fn(),
    confirmLogout: vi.fn(),
    isAdmin: true,
    isGM: true
  },
  campaignState: {
    universeState: {
      id: 'story_wave3',
      projectName: 'Wave 3 Station',
      scenarios: [{ id: 'sc_1', title: 'Docking Airlock', type: 'Scene', content: '<p>Entry bay</p>' }],
      maps: [{ id: 'map_univ', title: 'Universe Dock Map', objects: [] }],
      creativeState: {},
      galleryModifiers: []
    },
    elementsCatalog: [{ id: 'el_1', title: 'Thermal Lance', type: 'Property' }],
    mapsCatalog: [
      { id: 'map_univ', title: 'Universe Dock Map', objects: [] },
      { id: 'map_cat_only', title: 'Catalog Cargo Bay', objects: [] }
    ],
    galleryModifiers: [],
    activeMapId: 'map_univ',
    addStory: vi.fn(),
    updateStory: vi.fn(),
    addMap: vi.fn(() => 'map_new_1'),
    updateMap: vi.fn(),
    setActiveMapId: vi.fn(),
    setUniverseState: vi.fn()
  },
  stageStoreState: {
    stageManifest: {
      storyId: 'sc_1',
      anchors: [{ id: 'anchor_1', name: 'Airlock Alpha', kind: 'waypoint', pos: { x: 100, y: 120, w: 80, h: 80 } }],
      triggers: [],
      encounters: [],
      environment: { lighting: { mode: 'normal' }, weather: 'clear', ambientAudio: 'cyber_drone' },
      variables: {}
    },
    addAnchor: vi.fn(),
    updateAnchor: vi.fn(),
    removeAnchor: vi.fn(),
    addTrigger: vi.fn(),
    updateTrigger: vi.fn(),
    removeTrigger: vi.fn(),
    updateEnvironment: vi.fn(),
    setStageVariable: vi.fn(),
    removeStageVariable: vi.fn(),
    addEncounter: vi.fn(),
    updateEncounter: vi.fn(),
    removeEncounter: vi.fn()
  },
  stageElementsList: [{ id: 'el_guard', title: 'Orbital Sentry', type: 'Persona' }],
  stageStoriesList: [{ id: 'sc_1', title: 'Docking Airlock', type: 'Scene' }],
  proAudioMock: {
    playCue: vi.fn(async () => {}),
    stopBus: vi.fn()
  },
  getFreshFirebaseIdTokenMock: vi.fn(async () => null),
  chatState: { totalUnreadCount: 0, toggleCommsDock: vi.fn() },
  groupState: { pendingInvites: [] },
  diceState: { isDiceOpen: false, toggleDiceRoller: vi.fn() },
  audioState: { isMuted: false, toggleMute: vi.fn() },
  dbmState: { handleImportMasterJSON: vi.fn(), dbData: {} },
  folioState: { roster: [], personaRoster: [], activeTab: 'catalog', isCharacterSelected: false },
  toastState: {
    toast: vi.fn(),
    showToast: vi.fn(),
    showInfo: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn()
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
  auth: { currentUser: null }
}));

vi.mock('../../../utils/firebaseTokenStore', () => ({
  getFreshFirebaseIdToken: hoisted.getFreshFirebaseIdTokenMock,
  setInMemoryFirebaseIdToken: vi.fn(),
  getInMemoryFirebaseIdToken: vi.fn(() => ''),
  hasInMemoryFirebaseIdToken: vi.fn(() => false)
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

vi.mock('../Stage/stageStore', () => ({
  useStageStore: () => hoisted.stageStoreState
}));

vi.mock('../assetContracts', () => ({
  useElementAssets: () => ({ list: hoisted.stageElementsList }),
  useStoryAssets: () => ({ list: hoisted.stageStoriesList })
}));

vi.mock('../../../services/proAudioMixerService', () => ({
  proAudioMixerService: hoisted.proAudioMock
}));

vi.mock('../../../components/VTT/stage/StageAudioMixerDrawer', () => ({
  StageAudioMixerDrawer: () => null
}));

vi.mock('../StoryModule/workspaces/OsrControlPanelDeck', () => ({
  default: () => <div data-testid="mock-osr-deck" />
}));

vi.mock('../MapMaker/ChunkToolDrawerContent', () => ({
  ChunkToolDrawerContent: () => <div data-testid="mock-chunk-drawer" />
}));

import { computeRulerPaceStats } from '../MapMaker/pixi/mapMakerPixiHelpers';
import { useMapHistory } from '../MapMaker/hooks/useMapHistory';
import { ArchitectToolOptionsPanels } from '../MapMaker/map/console/ArchitectToolOptionsPanels';
import { GlobalHUD } from '../../../components/Layout/GlobalHUD';
import { CreateScenarioModal } from '../StoryModule/CreateScenarioModal';
import { SelectivePrintModal } from '../../../components/StoryFoundry/SelectivePrintModal';
import { VttCompilerModal } from '../../../components/StoryFoundry/VttCompilerModal';
import { PagedPdfCompiler } from '../../../engine/compilers/PagedPdfCompiler';
import { VttModuleCompiler } from '../../../services/vttModuleCompilerService';
import AnchorsTab from '../Stage/tabs/AnchorsTab';
import FlowTab from '../Stage/tabs/FlowTab';
import EnvironmentTab from '../Stage/tabs/EnvironmentTab';
import EncountersTab from '../Stage/tabs/EncountersTab';
import { TrapsAndHazardsWorkbench } from '../PresetsAndScripts/components/TrapsAndHazardsWorkbench';
import { MacroSandboxStudio } from '../PresetsAndScripts/components/MacroSandboxStudio';
import { AiConfigDrawer } from '../../../components/UI/AiConfigDrawer';

describe('Wave 3: Eliminate Placebo Controls, MapMaker Lag & Tool Unification', () => {
  const originalCreateObjectURL = globalThis.URL?.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL?.revokeObjectURL;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.locationState.pathname = '/foundry/map';
    hoisted.getFreshFirebaseIdTokenMock.mockResolvedValue(null);
  });

  afterEach(() => {
    cleanup();
    if (globalThis.URL) {
      globalThis.URL.createObjectURL = originalCreateObjectURL;
      globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    }
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('1. computeRulerPaceStats formats meters, feet, and squares uniformly', () => {
    const waypoints = [{ x: 0, y: 0 }, { x: 200, y: 0 }]; // 200px / 40px * 2m = 10m
    const meters = computeRulerPaceStats(waypoints, null, 40, 'meters');
    const feet = computeRulerPaceStats(waypoints, null, 40, 'feet');
    const squares = computeRulerPaceStats(waypoints, null, 40, 'squares');

    expect(meters?.formattedDistance).toBe('10m (33 ft)');
    expect(feet?.formattedDistance).toBe('33 ft (10m)');
    expect(squares?.formattedDistance).toBe('5 sq (10m)');
  });

  it('2. useMapHistory snapshots and restores regions across undo and redo', () => {
    const updateMapSpy = vi.fn();
    const initialRegions = [{ id: 'reg_1', name: 'No-Go Roof', x: 10, y: 20, w: 100, h: 100 }];
    const baseProps = {
      currentMap: { id: 'm1', chunkInstances: [] },
      lines: [],
      tokens: [],
      terrains: [],
      objects: [],
      texts: [],
      walls: [],
      lights: [],
      regions: initialRegions,
      fog: [],
      mapLayers: {},
      updateMap: updateMapSpy,
      activeMapId: 'm1'
    };

    const { result, rerender } = renderHook((props) => useMapHistory(props), {
      initialProps: baseProps
    });

    act(() => {
      result.current.recordHistory('Add Region');
    });

    const modifiedRegions = [...initialRegions, { id: 'reg_2', name: 'Reactor Core', x: 50, y: 50, w: 80, h: 80 }];
    rerender({ ...baseProps, regions: modifiedRegions });

    act(() => {
      result.current.handleUndo();
    });

    expect(updateMapSpy).toHaveBeenCalledWith('m1', expect.objectContaining({ regions: initialRegions }));

    act(() => {
      result.current.handleRedo();
    });

    expect(updateMapSpy).toHaveBeenLastCalledWith('m1', expect.objectContaining({ regions: modifiedRegions }));
  });

  it('3. ArchitectToolOptionsPanels renders controls for pencil, text, ruler, and portal token', () => {
    const setPencilWidth = vi.fn();
    const setTextLabelInput = vi.fn();
    const setMeasurementUnit = vi.fn();
    const setTokenType = vi.fn();

    const { rerender } = render(
      <ArchitectToolOptionsPanels
        activeTool="pencil"
        pencilWidth={5}
        setPencilWidth={setPencilWidth}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '10px' }));
    expect(setPencilWidth).toHaveBeenCalledWith(10);

    rerender(
      <ArchitectToolOptionsPanels
        activeTool="text"
        textLabelInput="Sector Alpha"
        setTextLabelInput={setTextLabelInput}
      />
    );
    fireEvent.change(screen.getByLabelText('Map text label'), { target: { value: 'Airlock B' } });
    expect(setTextLabelInput).toHaveBeenCalledWith('Airlock B');

    rerender(
      <ArchitectToolOptionsPanels
        activeTool="ruler"
        rulerSelectedPace="walk"
        measurementUnit="meters"
        setMeasurementUnit={setMeasurementUnit}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Feet (ft)' }));
    expect(setMeasurementUnit).toHaveBeenCalledWith('feet');

    rerender(
      <ArchitectToolOptionsPanels
        activeTool="token"
        tokenType="standard"
        setTokenType={setTokenType}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Portal Link' }));
    expect(setTokenType).toHaveBeenCalledWith('link');
  });

  it('4. GlobalHUD hides GM chrome on /foundry/view/* and /foundry/spectator/* routes', () => {
    hoisted.locationState.pathname = '/foundry/view/map-1';
    const { container, rerender } = render(<GlobalHUD />);
    expect(container.firstChild).toBeNull();

    hoisted.locationState.pathname = '/foundry/spectator/map-1';
    rerender(<GlobalHUD />);
    expect(container.firstChild).toBeNull();

    hoisted.locationState.pathname = '/foundry/map';
    rerender(<GlobalHUD />);
    expect(container.querySelector('header')).not.toBeNull();
  });

  it('5. CreateScenarioModal merges mapsCatalog into Link Existing Map and resets state on reopen', () => {
    const { rerender } = render(
      <CreateScenarioModal isOpen={true} onClose={vi.fn()} />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Act I: Perimeter Breach, Scene 2: Derelict Airlock...');
    fireEvent.change(titleInput, { target: { value: 'Transient Title' } });

    fireEvent.click(screen.getByRole('button', { name: /Link Existing Map/i }));
    expect(screen.getByRole('option', { name: /Catalog Cargo Bay/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Universe Dock Map/i })).toBeInTheDocument();

    rerender(<CreateScenarioModal isOpen={false} onClose={vi.fn()} />);
    rerender(<CreateScenarioModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText('e.g. Act I: Perimeter Breach, Scene 2: Derelict Airlock...')).toHaveValue('');
  });

  it('6. SelectivePrintModal gates Props & Tactical Spread sections and export options', () => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:print-mock');
    globalThis.URL.revokeObjectURL = vi.fn();
    const compileSpy = vi.spyOn(PagedPdfCompiler, 'compileToPagedHtml').mockReturnValue({
      html: '<html><body></body></html>',
      pageCount: 1
    });

    render(
      <SelectivePrintModal
        isOpen={true}
        onClose={vi.fn()}
        universeState={hoisted.campaignState.universeState}
        elementsCatalog={hoisted.campaignState.elementsCatalog}
        activeScenario={{ id: 'sc_1', title: 'Docking Airlock', content: '<p>Test</p>' }}
        activeMap={{
          id: 'map_1',
          title: 'Bay 4',
          objects: [{ id: 'obj_1', name: 'Plasma Relay Console', type: 'terminal', structure: 25, hackDc: 14 }]
        }}
      />
    );

    expect(screen.getByText('Tactical Encounter Spread')).toBeInTheDocument();
    expect(screen.getByText('Plasma Relay Console')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Props & Traps'));
    expect(screen.queryByText('Plasma Relay Console')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Tactical Spread'));
    expect(screen.queryByText('Tactical Encounter Spread')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Download Paged Media Print HTML'));
    expect(compileSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ includeProps: false, includeOsrSpread: false })
    );
  });

  it('7. VttCompilerModal renders Compiler Blocking Errors when compilation throws', () => {
    vi.spyOn(VttModuleCompiler, 'compileScenarioForVtt').mockImplementation(() => {
      throw new Error('Missing spatial exit node');
    });

    render(
      <VttCompilerModal
        isOpen={true}
        onClose={vi.fn()}
        activeScenario={{ id: 'sc_1', title: 'Broken Scene' }}
      />
    );

    expect(screen.getByText('Compiler Blocking Errors (1)')).toBeInTheDocument();
    expect(screen.getByText('Missing spatial exit node')).toBeInTheDocument();
  });

  it('8. Stage tabs: AnchorsTab region size, FlowTab APPLY_MODIFIER, EnvironmentTab 3-bus mute, EncountersTab label+name', () => {
    // AnchorsTab region width/height
    render(<AnchorsTab />);
    fireEvent.click(screen.getByRole('button', { name: /New Anchor/i }));
    expect(screen.queryByLabelText('Region Width (px)')).not.toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('Waypoint (Point)'), { target: { value: 'region' } });
    expect(screen.getByLabelText('Region Width (px)')).toBeInTheDocument();
    expect(screen.getByLabelText('Region Height (px)')).toBeInTheDocument();
    cleanup();

    // FlowTab APPLY_MODIFIER
    render(<FlowTab />);
    fireEvent.click(screen.getByRole('button', { name: /New Trigger/i }));
    const actionSelect = screen.getByDisplayValue('Trigger AIME Sensory Read-Aloud');
    fireEvent.change(actionSelect, { target: { value: 'APPLY_MODIFIER' } });
    const payloadInput = screen.getByPlaceholderText('Action text payload, prompt, or target ID...');
    fireEvent.change(payloadInput, { target: { value: 'ZERO_G_DRIFT' } });
    fireEvent.submit(payloadInput.closest('form'));
    expect(hoisted.stageStoreState.addTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        actions: [{ type: 'APPLY_MODIFIER', modifierId: 'ZERO_G_DRIFT' }]
      })
    );
    cleanup();

    // EnvironmentTab stops all 3 audio buses on none
    render(<EnvironmentTab />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'none' } });
    expect(hoisted.proAudioMock.stopBus).toHaveBeenCalledWith('ambient', true);
    expect(hoisted.proAudioMock.stopBus).toHaveBeenCalledWith('music', true);
    expect(hoisted.proAudioMock.stopBus).toHaveBeenCalledWith('sfx', true);
    cleanup();

    // EncountersTab sets both label and name
    render(<EncountersTab />);
    fireEvent.change(screen.getByPlaceholderText('Encounter squad title...'), { target: { value: 'Ambush Squad' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Stage Encounter/i }));
    expect(hoisted.stageStoreState.addEncounter).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Ambush Squad', name: 'Ambush Squad' })
    );
  });

  it('9. TrapsAndHazardsWorkbench and MacroSandboxStudio sync local state when selectedAsset changes', () => {
    const trapMap = {
      id: 'm1',
      title: 'Reactor Bay',
      objects: [
        { id: 'trap_1', name: 'Laser Tripwire', isTrap: true },
        { id: 'trap_2', name: 'Plasma Vent', isTrap: true }
      ]
    };

    const { rerender } = render(
      <TrapsAndHazardsWorkbench
        selectedAsset={{ id: 'a1', rawId: 'trap_1', catalogCategory: 'props_traps' }}
        allMaps={[trapMap]}
        selectedMapId="m1"
        onSelectMapId={vi.fn()}
        onUpdateMapObjects={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Laser Tripwire');

    rerender(
      <TrapsAndHazardsWorkbench
        selectedAsset={{ id: 'a2', rawId: 'trap_2', catalogCategory: 'props_traps' }}
        allMaps={[trapMap]}
        selectedMapId="m1"
        onSelectMapId={vi.fn()}
        onUpdateMapObjects={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Plasma Vent');
    cleanup();

    const { container, rerender: rerenderMacro } = render(
      <MacroSandboxStudio
        selectedAsset={{ id: 'mac_1', type: 'Macro', title: 'Alpha Macro', scriptData: { code: 'return 1;' } }}
        onSaveMacroToModule={vi.fn()}
        onAttachMacroToAsset={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText('Macro Name...')).toHaveValue('Alpha Macro');
    expect(container.querySelector('textarea').value).toContain('return 1;');

    rerenderMacro(
      <MacroSandboxStudio
        selectedAsset={{ id: 'mac_2', type: 'Macro', title: 'Beta Macro', scriptData: { code: 'return 2;' } }}
        onSaveMacroToModule={vi.fn()}
        onAttachMacroToAsset={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText('Macro Name...')).toHaveValue('Beta Macro');
    expect(container.querySelector('textarea').value).toContain('return 2;');
  });

  it('10. AiConfigDrawer removes unsupported presets and executes real fetch probes with honest errors', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock;

    // Legacy 'openai' normalizes display to 'gemini' & omits OpenAI/Claude cards
    const { rerender } = render(
      <AiConfigDrawer
        isOpen={true}
        onClose={vi.fn()}
        aiPlatform="openai"
        setAiPlatform={vi.fn()}
        geminiApiKey=""
        setGeminiApiKey={vi.fn()}
        otherAiApiKey=""
        setOtherAiApiKey={vi.fn()}
        customEndpoint=""
        setCustomEndpoint={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(screen.queryByText(/OpenAI GPT-4o/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Anthropic Claude/i)).not.toBeInTheDocument();
    expect(screen.getByText(/routes through Google Gemini/i)).toBeInTheDocument();

    // Unauthenticated proxy test fails honestly with rose banner
    fireEvent.click(screen.getByRole('button', { name: /TEST NEURAL LINK/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Sign in with a Tangent account/i);
    });
    expect(screen.getByRole('status')).toHaveClass('bg-rose-950/60');

    // Personal Gemini key triggers live Gemini models probe and succeeds on HTTP 200
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });
    rerender(
      <AiConfigDrawer
        isOpen={true}
        onClose={vi.fn()}
        aiPlatform="gemini"
        setAiPlatform={vi.fn()}
        geminiApiKey="AIza-test-key"
        setGeminiApiKey={vi.fn()}
        otherAiApiKey=""
        setOtherAiApiKey={vi.fn()}
        customEndpoint=""
        setCustomEndpoint={vi.fn()}
        onSave={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /TEST NEURAL LINK/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Google Gemini API key verified \(HTTP 200\)/i);
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash',
      expect.objectContaining({
        method: 'GET',
        headers: { 'x-goog-api-key': 'AIza-test-key' }
      })
    );
    expect(screen.getByRole('status')).toHaveClass('bg-emerald-950/60');

    // Custom endpoint HTTP 503 reports rose failure instead of fake success
    fetchMock.mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable' });
    rerender(
      <AiConfigDrawer
        isOpen={true}
        onClose={vi.fn()}
        aiPlatform="custom"
        setAiPlatform={vi.fn()}
        geminiApiKey=""
        setGeminiApiKey={vi.fn()}
        otherAiApiKey=""
        setOtherAiApiKey={vi.fn()}
        customEndpoint="http://localhost:11434"
        setCustomEndpoint={vi.fn()}
        onSave={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /TEST NEURAL LINK/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Custom endpoint probe failed: HTTP 503/i);
    });
    expect(screen.getByRole('status')).toHaveClass('bg-rose-950/60');
  });
});
