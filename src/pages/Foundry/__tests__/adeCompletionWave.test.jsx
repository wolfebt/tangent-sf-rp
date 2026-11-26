import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';

// --- Mocks for A3 (useStageRaycast), A4 (Stage3DViewport), B1 (ScenarioCanvasSwitch) ---
const {
  mockStepNpcPatrols,
  mockEvaluateSentryVision,
  mockVttEmit,
  mockSetElevation,
  mockUpdatePosition,
  mockUpdateMap,
  mockBroadcastTokenMove,
  mockMockTokens,
  mockCurrentMap
} = vi.hoisted(() => {
  const tokenA = {
    id: 'tok_3d_1',
    name: 'Vanguard',
    x: 120,
    y: 160,
    elevation_ft: 10
  };
  return {
    mockStepNpcPatrols: vi.fn((tokens) => [
      { id: tokens[0]?.id || 'patrol_1', x: 180, y: 210, currentWaypointIndex: 1, isReversing: false }
    ]),
    mockEvaluateSentryVision: vi.fn(() => null),
    mockVttEmit: vi.fn(),
    mockSetElevation: vi.fn(),
    mockUpdatePosition: vi.fn(),
    mockUpdateMap: vi.fn(),
    mockBroadcastTokenMove: vi.fn(),
    mockMockTokens: [tokenA],
    mockCurrentMap: {
      id: 'map_3d_1',
      name: 'Hangar Deck',
      tokens: [{ ...tokenA }],
      walls: [],
      terrains: [],
      lights: [],
      decks: [{ id: 'deck_0', name: 'Main Deck', minElevation: 0, maxElevation: 15 }]
    }
  };
});

vi.mock('../../../services/reactiveVttService', () => ({
  stepNpcPatrols: mockStepNpcPatrols,
  evaluateSentryVision: mockEvaluateSentryVision
}));

vi.mock('../../../utils/vttEventBus', () => ({
  VttEventBus: {
    on: vi.fn(() => () => {}),
    emit: mockVttEmit
  }
}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playDieRoll: vi.fn(),
    playHitImpact: vi.fn()
  }
}));

vi.mock('../../../services/vttMultiplayerSyncService', () => ({
  getVttMultiplayerSync: () => ({
    broadcastTokenMove: mockBroadcastTokenMove,
    broadcastDoorToggle: vi.fn()
  })
}));

vi.mock('../../../context/CampaignContext', () => ({
  useCampaign: () => ({
    universeState: { maps: [mockCurrentMap] },
    activeMapId: mockCurrentMap.id,
    updateMap: mockUpdateMap
  })
}));

vi.mock('../../../engine/state/VolatileSharder.ts', () => {
  const stateObj = {
    ephemeralData: {},
    setElevation: mockSetElevation,
    updatePosition: mockUpdatePosition,
    applyDamage: vi.fn(),
    addCondition: vi.fn()
  };
  const useEngineStoreMock = (selector) => (typeof selector === 'function' ? selector(stateObj) : stateObj);
  useEngineStoreMock.getState = () => stateObj;
  return {
    useEngineStore: useEngineStoreMock,
    selectAllFusedTokens: () => mockMockTokens
  };
});

vi.mock('../../../engine/3d', () => ({
  Stage3DRendererContext: class {
    initialize() { return true; }
    onResize() { return () => {}; }
    onRender() { return () => {}; }
    renderScene() {}
    destroy() {}
  },
  TacticalCameraRig: class {
    constructor() { this.camera = {}; }
    attach() {}
    detach() {}
    updateAspect() {}
    update() {}
    toggleMode() { return 'orbit'; }
    focusOn() {}
  },
  Stage3DCompositor: class {
    constructor() {
      this.scene = {};
      this.lightingManager = { setAtmosphere: vi.fn() };
      this.waypointRuler = { start: vi.fn(), updateEnd: vi.fn() };
      this.deckManager = { setActiveDeck: vi.fn(), setSliceActive: vi.fn() };
    }
    syncFromMap() {}
    syncTokens() {}
    evaluateLoS() { return null; }
    markSliceDirty() {}
    update() {}
    dispose() {}
    raycastToken() { return null; }
    raycastWall() { return null; }
    raycastGround() { return null; }
  }
}));

vi.mock('react-split', () => ({
  default: ({ children }) => <div data-testid="split-pane">{children}</div>
}));

vi.mock('../Weaver/WeaverWorkspace', () => ({
  default: ({ activeTab }) => (
    <div data-testid="mock-weaver-workspace" data-activetab={activeTab}>
      WeaverWorkspace ({activeTab})
    </div>
  )
}));

vi.mock('../StoryModule/panels/TacticalStageViewport', () => ({
  default: () => <div data-testid="mock-tactical-stage-viewport">TacticalStageViewport</div>
}));

vi.mock('../StoryModule/workspaces/OsrControlPanelDeck', () => ({
  default: () => <div data-testid="mock-osr-deck">OsrControlPanelDeck</div>
}));

vi.mock('../StoryModule/workspaces/InteractiveStoryStudio', () => ({
  default: () => <div data-testid="mock-interactive-studio">InteractiveStoryStudio</div>
}));

vi.mock('../store/adeStore', () => {
  const storeState = {
    studioMode: 'development',
    viewportSplit: 'split',
    setViewportSplit: vi.fn()
  };
  return {
    useAdeStore: (selector) => (typeof selector === 'function' ? selector(storeState) : storeState)
  };
});

import { useStageRaycast } from '../../../components/VTT/stage/useStageRaycast.ts';
import { TokenRadialMenu } from '../../../components/VTT/TokenRadialMenu.tsx';
import { Stage3DViewport } from '../../../components/VTT/stage/Stage3DViewport.tsx';
import ScenarioCanvasSwitch from '../StoryModule/panels/ScenarioCanvasSwitch.jsx';

describe('ADE Completion Wave (A3, A4, B1) Component & Hook Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('A3: useStageRaycast runs autonomous NPC patrol ticks offline and pauses cleanly when paused', () => {
    vi.useFakeTimers();
    const engineUpdatePosition = vi.fn();
    const patrolTokens = [
      {
        id: 'patrol_1',
        name: 'Drone Sentry',
        x: 100,
        y: 100,
        vttScriptActive: 'true',
        script: {
          type: 'patrol',
          waypoints: [{ x: 100, y: 100 }, { x: 250, y: 250 }]
        }
      }
    ];

    const { rerender } = renderHook(
      ({ isPaused, isMulti }) =>
        useStageRaycast({
          isMultiplayerSimActive: isMulti,
          isSimulationPaused: isPaused,
          currentMapTokens: patrolTokens,
          engineStore: { updatePosition: engineUpdatePosition }
        }),
      { initialProps: { isPaused: false, isMulti: false } }
    );

    vi.advanceTimersByTime(1600);
    expect(mockStepNpcPatrols).toHaveBeenCalledTimes(1);
    expect(engineUpdatePosition).toHaveBeenCalledWith('patrol_1', 180, 210);

    // Pause simulation -> interval clears cleanly and stops ticking
    rerender({ isPaused: true, isMulti: false });
    vi.advanceTimersByTime(3200);
    expect(mockStepNpcPatrols).toHaveBeenCalledTimes(1);
  });

  it('A3: TokenRadialMenu exposes Disarm Trap slice when nearbyArmedTrap is present', () => {
    const onSelectAction = vi.fn();
    render(
      <TokenRadialMenu
        isOpen={true}
        onClose={vi.fn()}
        position={{ x: 200, y: 200 }}
        token={{ id: 'hero_1', name: 'Engineer' }}
        nearbyArmedTrap={{ id: 'trap_1', label: 'Plasma Mine', disarmDc: 15 }}
        onSelectAction={onSelectAction}
      />
    );

    const disarmBtn = screen.getByTitle('Disarm Trap: Plasma Mine');
    expect(disarmBtn).toBeTruthy();
    fireEvent.click(disarmBtn);
    expect(onSelectAction).toHaveBeenCalledWith('disarm_trap');
  });

  it('A4: Stage3DViewport +5ft and -5ft elevation buttons update engineStore, map state, and multiplayer sync', () => {
    render(<Stage3DViewport onSwitchTo2D={vi.fn()} />);

    const climbBtn = screen.getByTitle('Climb +5ft');
    const descendBtn = screen.getByTitle('Descend -5ft');

    fireEvent.click(climbBtn);
    expect(mockSetElevation).toHaveBeenCalledWith('tok_3d_1', 15);
    expect(mockUpdateMap).toHaveBeenCalledWith('map_3d_1', {
      tokens: [{ ...mockMockTokens[0], elevation_ft: 15 }]
    });
    expect(mockBroadcastTokenMove).toHaveBeenCalledWith('tok_3d_1', 120, 160, 15);

    fireEvent.click(descendBtn);
    expect(mockSetElevation).toHaveBeenCalledWith('tok_3d_1', 5);
    expect(mockBroadcastTokenMove).toHaveBeenCalledWith('tok_3d_1', 120, 160, 5);
  });

  it('B1: ScenarioCanvasSwitch renders WeaverWorkspace tabs inside Split Map view', () => {
    render(
      <ScenarioCanvasSwitch
        activeNode={{ id: 'sc_1', type: 'scenario', title: 'Airlock Breach', fields: {} }}
        scenarioWorkspaceTab="brainstorm"
        setScenarioWorkspaceTab={vi.fn()}
        isSplitView={true}
        setIsSplitView={vi.fn()}
        perspectiveMode="architect"
        locationPath={['Arc I', 'Airlock Breach']}
        handleTitleChange={vi.fn()}
        handleOpenAddModal={vi.fn()}
        handleDeleteElement={vi.fn()}
        isRightDockOpen={true}
        onToggleRightDock={vi.fn()}
        updateStory={vi.fn()}
        universeState={{ maps: [] }}
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

    expect(screen.getByTestId('split-pane')).toBeTruthy();
    const weaver = screen.getByTestId('mock-weaver-workspace');
    expect(weaver.getAttribute('data-activetab')).toBe('brainstorm');
    expect(screen.getByTestId('mock-tactical-stage-viewport')).toBeTruthy();
  });
});
