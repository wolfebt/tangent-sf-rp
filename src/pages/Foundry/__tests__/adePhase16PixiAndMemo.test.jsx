/**
 * @file adePhase16PixiAndMemo.test.jsx
 * @description Phase 16 Component & Context Integration Suite:
 *   1. MapMakerPixiCanvas mounts with automatic Canvas2D fallback in jsdom, handles door toggle clicks & exposes toDataURL()
 *   2. ScenarioCanvasSwitch honors perspectiveMode='operator' with lock banner and disabled element deletion/creation
 *   3. CampaignContext exposes permanently stable action references via useStoryActions() across state re-renders
 */

import React, { useEffect } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const rendererInitMock = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('../../../engine/canvas/RendererContext.ts', () => ({
  RendererContext: class MockRendererContext {
    initialize = rendererInitMock;
    getIsInitialized = () => false; // Forces Canvas2D fallback deterministically in jsdom
    getApp = () => null;
    destroy = async () => {};
  }
}));

vi.mock('../../../services/audioService', () => ({
  default: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() }
}));

vi.mock('../../../firebase', () => ({
  db: {},
  auth: { currentUser: null }
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(async () => ({ docs: [] })),
  getDoc: vi.fn(async () => ({ exists: () => false })),
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn(async () => {}) }))
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, cb) => {
    cb(null);
    return () => {};
  })
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, userHandle: 'TestOperator' })
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn()
}));

vi.mock('../../../context/ConfirmContext', () => ({
  showConfirm: vi.fn(async () => true)
}));

vi.mock('../StoryModule/workspaces/StoryWeaver', () => ({
  default: ({ handleDeleteElement }) => (
    <div data-testid="mock-story-weaver" data-has-delete={String(Boolean(handleDeleteElement))} />
  )
}));

vi.mock('../StoryModule/workspaces/OsrControlPanelDeck', () => ({
  default: () => <div data-testid="mock-osr-deck" />
}));

vi.mock('../StoryModule/panels/TacticalStageViewport', () => ({
  default: ({ perspectiveMode }) => (
    <div data-testid="mock-tactical-stage" data-perspective={perspectiveMode} />
  )
}));

vi.mock('../Weaver/WeaverWorkspace', () => ({
  default: ({ handleDeleteElement }) => (
    <div data-testid="mock-weaver-workspace" data-has-delete={String(Boolean(handleDeleteElement))} />
  )
}));

import MapMakerPixiCanvas from '../MapMaker/pixi/MapMakerPixiCanvas.tsx';
import ScenarioCanvasSwitch from '../StoryModule/panels/ScenarioCanvasSwitch.jsx';
import { CampaignProvider, useStory, useStoryActions } from '../../../context/CampaignContext.jsx';

describe('ADE Phase 16 — PixiJS v8 MapMaker, PerspectiveMode & CampaignContext Actions Split', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('1. MapMakerPixiCanvas mounts cleanly with Canvas2D fallback, toggles doors, and exposes toDataURL()', async () => {
    const stageRef = React.createRef();
    const onToggleDoor = vi.fn();

    render(
      <MapMakerPixiCanvas
        ref={stageRef}
        width={800}
        height={600}
        scale={1}
        position={{ x: 0, y: 0 }}
        currentMap={{ id: 'm1', width: 1200, height: 800, enableWallShadows: true }}
        gridMode="square"
        gridSize={50}
        terrains={[]}
        lines={[]}
        objects={[]}
        walls={[
          {
            id: 'door_1',
            type: 'door',
            p1: { x: 100, y: 100 },
            p2: { x: 200, y: 100 },
            isOpen: false,
            isLocked: false
          }
        ]}
        lights={[]}
        texts={[]}
        tokens={[{ id: 'tok_1', x: 150, y: 200, radius: 25, label: 'Scout' }]}
        regions={[]}
        fog={[]}
        fogEnabled={false}
        visibilityPolygon={null}
        activePings={[]}
        rulerWaypoints={[]}
        rulerPointer={null}
        chunkGhostPreviewData={null}
        chunkCaptureMarquee={null}
        activeTool="select"
        selectedId={null}
        wallStartPoint={null}
        wallPreviewEnd={null}
        computeWallPreviewPoints={() => []}
        selectedWallType="solid"
        paintRoofLayer={false}
        isLayerVisible={() => true}
        isLayerLocked={() => false}
        onWheel={vi.fn()}
        onPointerDownEmptyOrTool={vi.fn()}
        onPointerMove={vi.fn()}
        onPointerUp={vi.fn()}
        onStagePan={vi.fn()}
        onSelect={vi.fn()}
        onSelectToken={vi.fn()}
        onErase={vi.fn()}
        onToggleDoor={onToggleDoor}
        onUpdateWall={vi.fn()}
        onUpdateObject={vi.fn()}
        onUpdateToken={vi.fn()}
        onUpdateLight={vi.fn()}
        onUpdateText={vi.fn()}
        onUpdateRegion={vi.fn()}
        onObjectDoubleClick={vi.fn()}
        onTokenDoubleClick={vi.fn()}
      />
    );

    const canvas = await screen.findByLabelText('MapMaker Tactical Cartography Canvas');
    expect(canvas).toHaveAttribute('data-renderer', 'canvas2d-fallback');
    expect(typeof stageRef.current?.toDataURL).toBe('function');
    expect(typeof stageRef.current?.toDataURL()).toBe('string');

    // Click midpoint of door_1 (150, 100)
    fireEvent.pointerDown(canvas.parentElement, { clientX: 150, clientY: 100, button: 0 });
    expect(onToggleDoor).toHaveBeenCalledWith('door_1');
  });

  it('2. ScenarioCanvasSwitch locks authoring & exposes Operator Perspective banner when perspectiveMode=operator', () => {
    const deleteSpy = vi.fn();

    const { rerender } = render(
      <ScenarioCanvasSwitch
        activeNode={null}
        scenarioWorkspaceTab="weaver"
        setScenarioWorkspaceTab={vi.fn()}
        isSplitView={false}
        setIsSplitView={vi.fn()}
        perspectiveMode="operator"
        handleOpenAddModal={vi.fn()}
        handleDeleteElement={deleteSpy}
      />
    );

    expect(screen.getByTestId('operator-perspective-banner')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\+ Create Element/i })).toBeNull();

    rerender(
      <ScenarioCanvasSwitch
        activeNode={{ id: 'sc_1', title: 'Docking Bay', content: 'Enter', fields: {} }}
        scenarioWorkspaceTab="stage"
        setScenarioWorkspaceTab={vi.fn()}
        isSplitView={false}
        setIsSplitView={vi.fn()}
        perspectiveMode="operator"
        handleOpenAddModal={vi.fn()}
        handleDeleteElement={deleteSpy}
      />
    );

    expect(screen.getByTestId('mock-tactical-stage')).toHaveAttribute('data-perspective', 'operator');

    rerender(
      <ScenarioCanvasSwitch
        activeNode={{ id: 'sc_1', title: 'Docking Bay', content: 'Enter', fields: {} }}
        scenarioWorkspaceTab="weaver"
        setScenarioWorkspaceTab={vi.fn()}
        isSplitView={false}
        setIsSplitView={vi.fn()}
        perspectiveMode="architect"
        handleOpenAddModal={vi.fn()}
        handleDeleteElement={deleteSpy}
      />
    );

    expect(screen.queryByTestId('operator-perspective-banner')).toBeNull();
    expect(screen.getByTestId('mock-weaver-workspace')).toHaveAttribute('data-has-delete', 'true');
  });

  it('3. CampaignContext useStoryActions() preserves referential equality across universe state updates', () => {
    const snapshots = [];

    function Probe() {
      const { universeState } = useStory();
      const actions = useStoryActions();
      useEffect(() => {
        snapshots.push({ projectName: universeState?.projectName, actions });
      });
      return (
        <div>
          <span data-testid="proj-name">{universeState?.projectName}</span>
          <button
            type="button"
            onClick={() => actions.updateProjectName('Phase 16 Renamed Sector')}
          >
            Rename
          </button>
        </div>
      );
    }

    render(
      <CampaignProvider>
        <Probe />
      </CampaignProvider>
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    });

    expect(screen.getByTestId('proj-name')).toHaveTextContent('Phase 16 Renamed Sector');
    expect(snapshots.length).toBeGreaterThanOrEqual(2);
    const first = snapshots[0].actions;
    const last = snapshots[snapshots.length - 1].actions;
    expect(last).toBe(first);
    expect(last.updateProjectName).toBe(first.updateProjectName);
    expect(last.addMap).toBe(first.addMap);
    expect(last.updateMap).toBe(first.updateMap);
  });
});
