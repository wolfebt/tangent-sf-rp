/**
 * @file pillar5StageAndVtt.test.jsx
 * @description Comprehensive Pillar 5 regression suite covering:
 *   1. Stage Compiler (`compileStage`) deterministic encounter offsets, `leave` triggers, and region dimensions
 *   2. `useStageTriggerEngine`: `leave`, `when`, `gmConfirm` gating, multi-action (`SET_FLAG` + `REVEAL_BEAT` + `PLAY_AUDIO`), `once`, reactive `flag`/`beat`/`timer`, and `vtt-object-interacted`
 *   3. `useWaypointEngine`: `isTriggered` + `triggered` sync on `stageManaged` anchors, `skipProximity`, `handleResetAllWaypoints`, and non-destructive `handleAutoRouteFromBeats`
 *   4. Stage Workspace Tabs & Store: `duplicateStage`, `StageWorkspace` duplicate/delete/diagnostics pill, `FlowTab` multi-action/once/flag value, `EncountersTab` multi-unit edit + canonical `Persona`, `ScriptsTab` macro binding, `RunTab` diagnostics/variables/lighting merge, `EnvironmentTab` `atmosphericPresetId`
 *   5. VTT Runtime & Studio/Ingestion: `ADEScenarioStageDrawer` `isStoryReadOnly`, `TheaterSceneViewport` configurable Mod/CR & uncapped narration/cast, `useStageFogAndRegions` operative guard, `AssetIngestionModal` reset + Disarm/Detection DC/oneShot, `AssetStudioModal` `executeWithActions`, and `ShaderTintCustomizer` tint picker.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

const hoisted = vi.hoisted(() => ({
  saveStageManifest: vi.fn(),
  updateScenario: vi.fn(),
  updateMap: vi.fn(),
  showConfirm: vi.fn(async () => true),
  playCue: vi.fn(async () => {}),
  stopBus: vi.fn(),
  executeWithActions: vi.fn(async () => ({
    result: { ok: true },
    actions: [{ type: 'set_flag', key: 'SANDBOX_RAN', value: true }],
    executionTimeMs: 2.5
  })),
  mockScenarios: [
    {
      id: 'sc-1',
      title: 'Reactor Breach',
      type: 'Scenario',
      fields: {
        sceneBeats: 'Enter Airlock\nDisable Reactor',
        readAloud: 'A'.repeat(750)
      },
      completedBeats: [0]
    },
    { id: 'sc-2', title: 'Escape Pod Bay', type: 'Scenario', fields: {} }
  ],
  mockMaps: [{ id: 'map-1', title: 'Reactor Deck', tokens: [], objects: [], waypoints: [], regions: [], walls: [] }],
  mockElements: [
    { id: 'el-npc-1', title: 'Security Droid', type: 'NPC', category: 'Persona', fields: {} },
    { id: 'el-npc-2', title: 'Deck Chief', type: 'Character', category: 'Persona', fields: {} },
    { id: 'el-prop-1', title: 'Coolant Valve', type: 'Property', fields: {} }
  ],
  mockUniverseState: null
}));

hoisted.mockUniverseState = {
  id: 'story-1',
  projectName: 'Orbital Crisis',
  techLevel: 4,
  scenarios: hoisted.mockScenarios,
  scripts: [{ id: 'scr-alarm', title: 'Red Alert Macro', code: 'StoryFlags.set("ALERT", true);' }],
  galleryModifiers: []
};

vi.mock('../../../context/CampaignContext', () => ({
  useCampaign: () => ({
    universeState: hoisted.mockUniverseState,
    elementsCatalog: hoisted.mockElements,
    updateScenario: hoisted.updateScenario,
    updateStory: vi.fn(),
    saveStageManifest: hoisted.saveStageManifest,
    cronicle: { pendingDeltas: [] },
    acceptPendingDelta: vi.fn(),
    rejectPendingDelta: vi.fn(),
    acceptAllPendingDeltas: vi.fn(),
    isStoryReadOnly: true
  }),
  useStory: () => ({
    universeState: hoisted.mockUniverseState,
    saveStageManifest: hoisted.saveStageManifest,
    updateStory: vi.fn(),
    setUniverseState: vi.fn(),
    activeScenarioId: 'sc-1'
  })
}));

vi.mock('../assetContracts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMapAssets: () => ({ list: hoisted.mockMaps }),
    useStoryAssets: () => ({ list: hoisted.mockScenarios }),
    useElementAssets: () => ({ list: hoisted.mockElements })
  };
});

vi.mock('../../../context/ConfirmContext', () => ({
  showConfirm: (...args) => hoisted.showConfirm(...args)
}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playCombatHit: vi.fn()
  }
}));

vi.mock('../../../services/proAudioMixerService', () => ({
  proAudioMixerService: {
    playCue: (...args) => hoisted.playCue(...args),
    stopBus: (...args) => hoisted.stopBus(...args),
    getAllBusStates: () => ({}),
    getAllTracks: () => [],
    getCrossfadeMs: () => 500,
    subscribe: () => () => {}
  }
}));

vi.mock('../../../engine/scripting/QuickJSSandbox', () => ({
  QuickJSSandbox: class MockQuickJSSandbox {
    executeWithActions(...args) {
      return hoisted.executeWithActions(...args);
    }
    async execute(...args) {
      const { result } = await hoisted.executeWithActions(...args);
      return result;
    }
  }
}));

vi.mock('../../../components/VTT/TripartiteStageView', () => ({
  default: (props) => <div data-testid="mock-tripartite-stage" data-stage-id={props.compiledStage?.stageId || ''} />
}));

vi.mock('../PresetsAndScripts/PresetsAndScriptsDashboard', () => ({
  default: () => <div data-testid="mock-presets-dashboard" />
}));

vi.mock('../StoryModule/workspaces/OsrControlPanelDeck', () => ({
  default: () => <div data-testid="mock-osr-deck" />
}));

vi.mock('../../../services/vttMultiplayerSyncService', () => ({
  getVttMultiplayerSync: () => ({
    getDocument: () => ({
      getMap: () => ({ get: () => undefined, set: vi.fn(), observe: vi.fn(), unobserve: vi.fn() }),
      transact: (fn) => fn()
    }),
    broadcastChatCard: vi.fn(),
    broadcastFogExplored: vi.fn(),
    broadcastTokenMove: vi.fn()
  })
}));

vi.mock('../../../firebase', () => ({
  auth: { currentUser: { uid: 'test-uid' } }
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn()
}));

vi.mock('pixi.js', () => ({
  Graphics: class MockGraphics {
    clear() {}
  },
  Container: class MockContainer {
    constructor() {
      this.children = [];
      this.label = '';
    }
    addChild(c) {
      this.children.push(c);
    }
  }
}));

import { compileStage } from '../Stage/vttModuleCompilerService';
import { useStageStore } from '../Stage/stageStore';
import { useADEStore } from '../store/adeStore';
import { useStageTriggerEngine } from '../../../components/VTT/stage/useStageTriggerEngine';
import { useWaypointEngine } from '../hooks/useWaypointEngine';
import StageWorkspace from '../Stage/StageWorkspace';
import FlowTab from '../Stage/tabs/FlowTab';
import EncountersTab from '../Stage/tabs/EncountersTab';
import ScriptsTab from '../Stage/tabs/ScriptsTab';
import RunTab from '../Stage/tabs/RunTab';
import EnvironmentTab from '../Stage/tabs/EnvironmentTab';
import ADEScenarioStageDrawer from '../../../components/VTT/stage/ADEScenarioStageDrawer';
import TheaterSceneViewport from '../../../components/VTT/stage/TheaterSceneViewport';
import { useStageFogAndRegions } from '../../../components/VTT/stage/useStageFogAndRegions';
import { AssetIngestionModal } from '../../../components/VTT/ingestion/AssetIngestionModal';
import { AssetStudioModal } from '../../../components/VTT/studio/AssetStudioModal';
import { ShaderTintCustomizer } from '../../../components/VTT/studio/ShaderTintCustomizer';
import { VttEventBus } from '../../../utils/vttEventBus';

function TriggerHarness({ compiledStage, liveTokens, currentMap, updateMap }) {
  const engine = useStageTriggerEngine({
    compiledStage,
    liveTokens,
    currentMap,
    updateMap,
    elementsCatalog: hoisted.mockElements,
    enabled: true
  });
  return (
    <div>
      <div data-testid="pending-trigger">
        {engine.pendingTriggerPrompt ? engine.pendingTriggerPrompt.trigger.id : 'none'}
      </div>
      <button type="button" onClick={() => engine.confirmPendingTrigger()}>
        Confirm Pending
      </button>
    </div>
  );
}

describe('Pillar 5: THE STAGE VTT & Live Runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useADEStore.getState().clearActiveStoryFlags?.();
    useStageStore.getState().resetStageManifest('map-1', 'sc-1');
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('compileStage produces deterministic encounter offsets, leave autoTrigger, and matching region dims', () => {
    const manifest = {
      id: 'st-1',
      title: 'Deterministic Stage',
      mapId: 'map-1',
      storyId: 'sc-1',
      scenarioIds: ['sc-1'],
      anchors: [
        { id: 'reg-1', name: 'Lock', kind: 'region', pos: { x: 100, y: 120, w: 220, h: 160 }, elementIds: [] }
      ],
      triggers: [
        {
          id: 'tr-leave',
          name: 'Airlock Exit',
          anchorId: 'reg-1',
          on: 'leave',
          actions: [{ type: 'SET_FLAG', key: 'LEFT_LOCK', value: true }]
        }
      ],
      encounters: [
        { id: 'enc-1', label: 'Patrol', anchorId: 'reg-1', tokenElementIds: ['el-npc-1', 'el-npc-2'], active: true }
      ],
      environment: { lighting: { mode: 'normal' }, weather: 'clear', modifierIds: [] },
      variables: {},
      macros: []
    };

    const runA = compileStage({ manifest, mapAsset: hoisted.mockMaps[0], elementsCatalog: hoisted.mockElements });
    const runB = compileStage({ manifest, mapAsset: hoisted.mockMaps[0], elementsCatalog: hoisted.mockElements });

    expect(runA.map.tokens[0].x).toBe(runB.map.tokens[0].x);
    expect(runA.map.tokens[0].y).toBe(runB.map.tokens[0].y);
    expect(runA.map.regions[0].autoTrigger).toBe(true);
    const regionObj = runA.map.objects.find((o) => o.id === 'anchor-obj-reg-1');
    expect(regionObj).toMatchObject({ width: 220, height: 160, isRegionOverlay: true });
  });

  it('useStageTriggerEngine runs leave + when + gmConfirm + multi-action + PLAY_AUDIO + reactive flag/beat/timer + interact', () => {
    vi.useFakeTimers();
    const compiledStage = {
      stageId: 'st-live',
      title: 'Live Test',
      anchors: [{ id: 'reg-a', name: 'Zone A', kind: 'region', pos: { x: 50, y: 50, w: 100, h: 100 }, elementIds: [] }],
      triggers: [
        {
          id: 'tr-leave-multi',
          name: 'Exit Alarm',
          anchorId: 'reg-a',
          on: 'leave',
          when: 'ARMED == true',
          gmConfirm: true,
          once: true,
          actions: [
            { type: 'SET_FLAG', key: 'ALARM_TRIPPED', value: true },
            { type: 'REVEAL_BEAT', beatIndex: 1, prompt: 'Klaxons blare!' },
            { type: 'PLAY_AUDIO', bus: 'sfx', track: 'klaxon_alert' }
          ]
        },
        {
          id: 'tr-flag',
          name: 'Flag React',
          anchorId: 'reg-a',
          on: 'flag',
          flagKey: 'ALARM_TRIPPED',
          actions: [{ type: 'SET_FLAG', key: 'DEFENSE_UP', value: true }]
        },
        {
          id: 'tr-beat',
          name: 'Beat React',
          anchorId: 'reg-a',
          on: 'beat',
          beatIndex: 2,
          actions: [{ type: 'SET_FLAG', key: 'BEAT_2_REACT', value: 'ok' }]
        },
        {
          id: 'tr-timer',
          name: 'Timer Pulse',
          anchorId: 'reg-a',
          on: 'timer',
          intervalMs: 1000,
          once: true,
          actions: [{ type: 'SET_FLAG', key: 'TIMER_FIRED', value: true }]
        },
        {
          id: 'tr-interact',
          name: 'Valve Twist',
          anchorId: 'el-prop-1',
          on: 'interact',
          actions: [{ type: 'SET_FLAG', key: 'VALVE_TWISTED', value: true }]
        }
      ]
    };

    act(() => {
      useADEStore.getState().setStoryFlag('ARMED', true);
    });

    const { rerender } = render(
      <TriggerHarness
        compiledStage={compiledStage}
        liveTokens={[{ id: 'tok-1', x: 100, y: 100 }]}
        currentMap={{ id: 'map-1', regions: [], waypoints: [], tokens: [], objects: [] }}
        updateMap={hoisted.updateMap}
      />
    );

    // Move token outside reg-a -> triggers `on: 'leave'` -> queued for gmConfirm
    rerender(
      <TriggerHarness
        compiledStage={compiledStage}
        liveTokens={[{ id: 'tok-1', x: 300, y: 300 }]}
        currentMap={{ id: 'map-1', regions: [], waypoints: [], tokens: [], objects: [] }}
        updateMap={hoisted.updateMap}
      />
    );

    expect(screen.getByTestId('pending-trigger')).toHaveTextContent('tr-leave-multi');
    fireEvent.click(screen.getByText('Confirm Pending'));

    expect(useADEStore.getState().storyFlags.ALARM_TRIPPED.value).toBe(true);
    expect(useADEStore.getState().storyFlags.DEFENSE_UP.value).toBe(true);
    expect(hoisted.playCue).toHaveBeenCalledWith('sfx', 'klaxon_alert', true);

    // Non-stage-trigger milestone reaches `on: 'beat'`
    act(() => {
      VttEventBus.emit('story-foundry-milestone-reached', { beatIndex: 2, source: 'drawer' });
      VttEventBus.emit('vtt-object-interacted', { objectId: 'el-prop-1' });
      vi.advanceTimersByTime(1100);
    });

    expect(useADEStore.getState().storyFlags.BEAT_2_REACT.value).toBe('ok');
    expect(useADEStore.getState().storyFlags.VALVE_TWISTED.value).toBe(true);
    expect(useADEStore.getState().storyFlags.TIMER_FIRED.value).toBe(true);
  });

  it('useWaypointEngine syncs stageManaged anchors, skips skipProximity, resets stage anchors, and keeps manual waypoints on auto-route', () => {
    useStageStore.getState().addAnchor({
      id: 'wp-stage-1',
      name: 'Airlock Beacon',
      kind: 'waypoint',
      pos: { x: 200, y: 200 },
      elementIds: []
    });

    let hookApi;
    function WpHarness({ activeMap, liveTokens }) {
      hookApi = useWaypointEngine({
        activeMap,
        updateMap: hoisted.updateMap,
        activeScenario: hoisted.mockScenarios[0],
        flatScenarios: hoisted.mockScenarios,
        setActiveScenarioId: vi.fn(),
        studioMode: 'live_session',
        liveTokens,
        enableProximityInDev: true
      });
      return null;
    }

    const activeMap = {
      id: 'map-1',
      waypoints: [
        { id: 'wp-manual', name: 'Manual Marker', x: 50, y: 50, radius: 50 },
        { id: 'wp-stage-1', name: 'Stage WP', x: 200, y: 200, radius: 60, stageManaged: true, skipProximity: true, autoTrigger: true }
      ]
    };

    render(<WpHarness activeMap={activeMap} liveTokens={[{ id: 't1', x: 200, y: 200 }]} />);
    expect(hookApi.waypointPromptData).toBeNull();

    act(() => {
      hookApi.executeWaypointTrigger(activeMap.waypoints[1], { id: 't1' });
    });
    const syncedAnchor = useStageStore.getState().stageManifest.anchors.find((a) => a.id === 'wp-stage-1');
    expect(syncedAnchor.triggered).toBe(true);
    expect(syncedAnchor.isTriggered).toBe(true);

    act(() => {
      hookApi.handleResetAllWaypoints();
    });
    const resetAnchor = useStageStore.getState().stageManifest.anchors.find((a) => a.id === 'wp-stage-1');
    expect(resetAnchor.isTriggered).toBe(false);

    act(() => {
      hookApi.handleAutoRouteFromBeats();
    });
    const updateCall = hoisted.updateMap.mock.calls.at(-1);
    expect(updateCall[1].waypoints.some((w) => w.id === 'wp-manual')).toBe(true);
    expect(updateCall[1].waypoints.some((w) => w.id.startsWith('wp_beat_0_'))).toBe(true);
  });

  it('StageWorkspace supports duplicateStage and validation pill; Stage tabs wire Flow, Encounters, Scripts, Run, and Environment', async () => {
    const store = useStageStore.getState();
    store.updateStageManifest({ title: 'Sector 7G', mapId: 'map-1', storyId: 'sc-1' });
    store.addAnchor({ id: 'anc-1', name: 'Airlock', kind: 'region', pos: { x: 100, y: 100, w: 120, h: 120 }, elementIds: [] });

    render(
      <MemoryRouter>
        <StageWorkspace initialTab="flow" />
      </MemoryRouter>
    );

    // Duplicate stage button clones manifest
    fireEvent.click(screen.getByLabelText('Duplicate Stage'));
    expect(useStageStore.getState().stageManifest.title).toContain('(Copy)');

    // FlowTab multi-action + once + flag value
    fireEvent.click(screen.getByText(/New Trigger/i));
    fireEvent.change(screen.getByPlaceholderText(/Airlock Breach/i), { target: { value: 'Multi Trig' } });
    fireEvent.click(screen.getByText(/Add Action/i));
    fireEvent.click(screen.getByLabelText(/Require Architect/i) || screen.getByText(/Fire Once Only/i));
    fireEvent.click(screen.getByText(/Fire Once Only/i));
    fireEvent.click(screen.getByText(/Save Trigger/i));

    const savedTrig = useStageStore.getState().stageManifest.triggers[0];
    expect(savedTrig.actions).toHaveLength(2);
    expect(savedTrig.once).toBe(true);

    // EncountersTab multi-unit & canonical Persona filtering
    cleanup();
    render(<EncountersTab />);
    fireEvent.change(screen.getByPlaceholderText(/Encounter squad title/i), { target: { value: 'Alpha Squad' } });
    fireEvent.change(screen.getByLabelText(/Bind Persona or Threat Unit/i), { target: { value: 'el-npc-1' } });
    fireEvent.change(screen.getByLabelText(/Bind Persona or Threat Unit/i), { target: { value: 'el-npc-2' } });
    fireEvent.click(screen.getByText(/Add Stage Encounter/i));
    expect(useStageStore.getState().stageManifest.encounters[0].tokenElementIds).toEqual(['el-npc-1', 'el-npc-2']);

    // ScriptsTab binds Stage Macro
    cleanup();
    render(<ScriptsTab />);
    fireEvent.change(screen.getByLabelText(/Select Script to Bind to Stage/i), { target: { value: 'scr-alarm' } });
    fireEvent.click(screen.getByText(/Bind Macro/i));
    expect(useStageStore.getState().stageManifest.macros).toHaveLength(1);

    // EnvironmentTab persists atmosphericPresetId
    cleanup();
    render(<EnvironmentTab />);
    fireEvent.click(screen.getByText(/Acid Rain Corrosive/i));
    expect(useStageStore.getState().stageManifest.environment.atmosphericPresetId).toBe('toxic_smog');

    // RunTab preserves lighting properties, adds live Stage variable, and exposes diagnostics
    cleanup();
    useStageStore.getState().updateStageManifest({ mapId: '' });
    render(<RunTab />);
    fireEvent.click(screen.getByTitle(/Dim Twilight/i));
    expect(useStageStore.getState().stageManifest.environment.lighting.mode).toBe('dim');
    expect(useStageStore.getState().stageManifest.environment.lighting.tint).toBeDefined();
    fireEvent.change(screen.getByLabelText(/Live Variable Key/i), { target: { value: 'SECTOR_CLEAR' } });
    fireEvent.click(screen.getByText(/Set Var/i));
    expect(useStageStore.getState().stageManifest.variables.SECTOR_CLEAR).toBe(true);
    fireEvent.click(screen.getByTitle(/Toggle compiler diagnostics/i));
    expect(screen.getByText(/ERROR: Stage is missing a bound Map Asset/i)).toBeInTheDocument();
  });

  it('VTT Drawer, Theater Viewport, Fog Guard, Asset Ingestion, Asset Studio, and Shader Tint enforce Pillar 5 contracts', async () => {
    // 1. ADEScenarioStageDrawer read-only Reset Beats guard
    render(
      <MemoryRouter>
        <ADEScenarioStageDrawer activeScenarioId="sc-1" />
      </MemoryRouter>
    );
    const resetBtn = screen.getByText('Reset Beats').closest('button');
    expect(resetBtn).toBeDisabled();
    fireEvent.click(resetBtn);
    expect(hoisted.updateScenario).not.toHaveBeenCalled();

    // 2. TheaterSceneViewport uncapped narration + >6 cast + configurable 2d10 Mod/CR
    cleanup();
    const manyPersonas = Array.from({ length: 8 }, (_, idx) => ({
      id: `p-${idx}`,
      title: `Operative ${idx + 1}`,
      type: idx % 2 === 0 ? 'NPC' : 'Persona',
      fields: {}
    }));
    render(
      <TheaterSceneViewport
        activeScenario={hoisted.mockScenarios[0]}
        elementsCatalog={manyPersonas}
      />
    );
    expect(screen.getByText(new RegExp('A'.repeat(750)))).toBeInTheDocument();
    expect(screen.getByText('Operative 8')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Quick 2d10 Modifier'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Quick 2d10 Target CR'), { target: { value: '18' } });
    fireEvent.click(screen.getByText('Quick 2d10'));
    expect(screen.getByText(/vs CR 18/i)).toBeInTheDocument();

    // 3. useStageFogAndRegions blocks operative fog persistence & reveal actions
    cleanup();
    const onMapMutate = vi.fn();
    let fogApi;
    function FogHarness() {
      fogApi = useStageFogAndRegions({
        layerCompositorRef: { current: null },
        isCanvasReady: false,
        canvasGeneration: 0,
        currentMap: { id: 'm-op' },
        localWalls: [],
        tokens: [],
        selectedToken: null,
        activeSensorMode: 'standard_optical',
        isFogEnabled: true,
        isArchitect: false,
        onUpdateMap: onMapMutate
      });
      return null;
    }
    render(<FogHarness />);
    act(() => {
      fogApi.revealFogRect(0, 0, 100, 100);
      fogApi.revealAllFog();
    });
    expect(onMapMutate).not.toHaveBeenCalled();

    // 4. AssetIngestionModal exposes Disarm/Detection DC & oneShot and resets on reopen
    cleanup();
    const onClose = vi.fn();
    const { rerender } = render(
      <AssetIngestionModal isOpen={true} onClose={onClose} onAssetIngested={vi.fn()} />
    );
    fireEvent.click(screen.getByText(/4\. Triggers/i));
    fireEvent.click(screen.getByText(/Arm Spatial Trigger/i));
    fireEvent.change(screen.getByLabelText('Disarm DC'), { target: { value: '19' } });
    expect(screen.getByLabelText('Disarm DC')).toHaveValue(19);
    rerender(<AssetIngestionModal isOpen={false} onClose={onClose} onAssetIngested={vi.fn()} />);
    rerender(<AssetIngestionModal isOpen={true} onClose={onClose} onAssetIngested={vi.fn()} />);
    fireEvent.click(screen.getByText(/4\. Triggers/i));
    fireEvent.click(screen.getByText(/Arm Spatial Trigger/i));
    expect(screen.getByLabelText('Disarm DC')).toHaveValue(13);

    // 5. AssetStudioModal uses executeWithActions and shows queued actions
    cleanup();
    const sampleUnit = {
      unit_id: 'u-1',
      name: 'Test Terminal',
      category: 'doodad',
      tree_path: ['Custom'],
      tags: ['test'],
      dimensions: [1, 1],
      visuals: { baseTexture: '', thumbnail: '' },
      vtt_properties: {
        blocks_movement: false,
        blocks_vision: false,
        z_index_layer: 'interactive_objects',
        script: { enabled: true, executionHook: 'manual', sourceCode: 'StageAPI.setFlag("A", true);', timeoutMs: 500 }
      }
    };
    render(<AssetStudioModal isOpen={true} asset={sampleUnit} onClose={vi.fn()} onSaveAsset={vi.fn()} />);
    fireEvent.click(screen.getByText(/Script & Sandbox/i));
    fireEvent.click(screen.getByText(/Run Test in QuickJS Sandbox/i));
    await waitFor(() => {
      expect(screen.getByText(/Queued StageAPI Actions \(1\):/i)).toBeInTheDocument();
    });

    // 6. ShaderTintCustomizer provides custom hex & color tint pickers
    cleanup();
    const onTintChange = vi.fn();
    render(<ShaderTintCustomizer imageUrl="" onChange={onTintChange} />);
    fireEvent.change(screen.getByLabelText('Tint Color Hex'), { target: { value: '#ff0088' } });
    expect(onTintChange).toHaveBeenCalledWith(expect.objectContaining({ tintColor: '#ff0088' }));
  });
});
