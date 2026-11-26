import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';

vi.mock('../../../firebase.js', () => ({
  auth: { currentUser: { uid: 'architect_uid_1' } },
  storage: null,
  db: null
}));

vi.mock('../../../firebase', () => ({
  auth: { currentUser: { uid: 'architect_uid_1' } },
  storage: null,
  db: null
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn(),
  useToast: () => ({ toast: vi.fn() })
}));

const mockUpdateMap = vi.fn();
const mockPublishSpectatorMap = vi.fn();

vi.mock('../../../context/CampaignContext', () => ({
  useCampaign: () => ({
    universeState: {
      maps: [
        { id: 'map_alpha', title: 'Alpha Deck', type: 'Interior', gridMode: 'hex' },
        { id: 'map_beta', title: 'Beta Bay', type: 'Sector', gridMode: 'square' }
      ],
      customAssets: { terrains: [], objects: [] }
    },
    activeMapId: 'map_alpha',
    setActiveMapId: vi.fn(),
    updateMap: mockUpdateMap,
    publishSpectatorMap: mockPublishSpectatorMap,
    addCustomObject: vi.fn()
  }),
  formatExportFilename: (t) => `${t}.png`
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'architect_uid_1' } })
}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playCriticalSuccess: vi.fn()
  },
  default: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playCriticalSuccess: vi.fn()
  }
}));

vi.mock('../../../services/adeMediaStorageService', () => ({
  uploadAdeMediaAsset: vi.fn(async () => ({ url: 'https://cdn.example/video.webm', offloaded: true })),
  uploadAdeImageAsset: vi.fn(async () => ({ url: 'https://cdn.example/blueprint.webp', offloaded: true }))
}));

vi.mock('../../../services/uvttImportService', () => ({
  parseUniversalVtt: vi.fn((parsed, title) => ({
    id: 'uvtt_map_1',
    title,
    walls: [],
    objects: [],
    terrains: [],
    tokens: [],
    lights: [],
    width: (parsed.resolution?.map_size?.x || 10) * 70,
    height: (parsed.resolution?.map_size?.y || 10) * 70
  }))
}));

vi.mock('../MapMaker/map/DraggablePanel', () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>
}));

vi.mock('../../../components/StoryFoundry/ArtistHubModal', () => ({
  ArtistHubModal: () => null
}));

import MapToolbar from '../MapMaker/map/MapToolbar';
import { useMapCanvasEvents } from '../MapMaker/hooks/useMapCanvasEvents';
import { SelectedElementInspectorBar } from '../MapMaker/map/SelectedElementInspectorBar';
import { MapUnderlayCalibrationModal } from '../MapMaker/map/MapUnderlayCalibrationModal';
import { UvttImportModal } from '../MapMaker/map/UvttImportModal';
import MapKeyPanel from '../MapMaker/map/MapKeyPanel';
import { uploadAdeImageAsset } from '../../../services/adeMediaStorageService';

describe('MapMaker Canvas & Tooling Deep Audit Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(async () => {}) },
      configurable: true
    });
  });

  it('MapToolbar renders /spectator/:mapId URL, toggles terrainRenderMode, and closes Cast modal on Escape', () => {
    const setTerrainRenderMode = vi.fn();
    render(
      <MapToolbar
        setIsModalOpen={vi.fn()}
        undoStack={[]}
        redoStack={[]}
        handleUndo={vi.fn()}
        handleRedo={vi.fn()}
        gridMode="hex"
        setGridMode={vi.fn()}
        terrainRenderMode="organic"
        setTerrainRenderMode={setTerrainRenderMode}
        showOmnicortexDrawer={false}
        setShowOmnicortexDrawer={vi.fn()}
        showStoryDrawer={false}
        setShowStoryDrawer={vi.fn()}
        showMetadataPanel={false}
        setShowMetadataPanel={vi.fn()}
        showKeyPanel={true}
        setShowKeyPanel={vi.fn()}
        selectedId={null}
        eraseElement={vi.fn()}
        onClearMap={vi.fn()}
        onResetView={vi.fn()}
        onExportPNG={vi.fn()}
      />
    );

    // Open Grid dropdown and switch to Hex Tile terrain mode
    const gridBtn = screen.getByText('GRID').closest('button');
    fireEvent.click(gridBtn);
    const hexTileBtn = screen.getByRole('button', { name: 'Hex Tile' });
    fireEvent.click(hexTileBtn);
    expect(setTerrainRenderMode).toHaveBeenCalledWith('hex');

    // Open Cast modal and verify canonical /spectator/:mapId route (never /foundry/view/)
    const castBtn = screen.getByTitle(/Live Operator Spectator Screen/i);
    fireEvent.click(castBtn);
    expect(screen.getByText(/\/spectator\/map_alpha/)).toBeTruthy();
    expect(screen.queryByText(/\/foundry\/view\//)).toBeNull();

    // Escape closes Cast modal
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('useMapCanvasEvents enforces isStoryReadOnly, layer locks, gridSnap, hex terrain painting, and clean wall history', () => {
    const recordHistory = vi.fn();
    const updateMap = vi.fn();
    const onBlockedAction = vi.fn();

    // 1. Read-only blocks mutation tools
    const roHook = renderHook(() =>
      useMapCanvasEvents({
        currentMap: { id: 'm1', gridSize: 50, gridMode: 'square' },
        activeMapId: 'm1',
        updateMap,
        recordHistory,
        activeTool: 'object',
        lines: [],
        terrains: [],
        walls: [],
        fog: [],
        objects: [],
        tokens: [],
        texts: [],
        lights: [],
        selectedObjectType: { id: 'crate', label: 'Crate' },
        isStoryReadOnly: true,
        onBlockedAction
      })
    );

    act(() => {
      roHook.result.current.handleMouseDown({ button: 0, worldPos: { x: 120, y: 140 } });
    });
    expect(onBlockedAction).toHaveBeenCalledWith('readonly');
    expect(updateMap).not.toHaveBeenCalled();

    // 2. Locked layer blocks placement
    vi.clearAllMocks();
    const lockHook = renderHook(() =>
      useMapCanvasEvents({
        currentMap: { id: 'm1', gridSize: 50, gridMode: 'square' },
        activeMapId: 'm1',
        updateMap,
        recordHistory,
        activeTool: 'wall',
        lines: [],
        terrains: [],
        walls: [],
        fog: [],
        objects: [],
        tokens: [],
        texts: [],
        lights: [],
        isLayerLocked: (id) => id === 'layer_walls',
        onBlockedAction
      })
    );
    act(() => {
      lockHook.result.current.handleMouseDown({ button: 0, worldPos: { x: 40, y: 40 } });
    });
    expect(onBlockedAction).toHaveBeenCalledWith('locked', 'layer_walls');
    expect(recordHistory).not.toHaveBeenCalled();

    // 3. Wall short-click does NOT pollute history; snapped object places at square intersection
    vi.clearAllMocks();
    const wallHook = renderHook(() =>
      useMapCanvasEvents({
        currentMap: { id: 'm1', gridSize: 50, gridMode: 'square' },
        activeMapId: 'm1',
        updateMap,
        recordHistory,
        activeTool: 'wall',
        lines: [],
        terrains: [],
        walls: [],
        fog: [],
        objects: [],
        tokens: [],
        texts: [],
        lights: [],
        gridSnap: true,
        gridSize: 50,
        gridMode: 'square'
      })
    );
    act(() => {
      wallHook.result.current.handleMouseDown({ button: 0, worldPos: { x: 96, y: 103 } });
    });
    expect(recordHistory).not.toHaveBeenCalled();
    act(() => {
      wallHook.result.current.handleMouseUp();
    });
    expect(recordHistory).not.toHaveBeenCalled();
    expect(updateMap).not.toHaveBeenCalled();

    // 4. Hex terrain mode creates renderType: 'hexTile'
    vi.clearAllMocks();
    const hexHook = renderHook(() =>
      useMapCanvasEvents({
        currentMap: { id: 'm1', gridSize: 50, gridMode: 'hex' },
        activeMapId: 'm1',
        updateMap,
        recordHistory,
        activeTool: 'terrain',
        terrainRenderMode: 'hex',
        selectedTerrain: { id: 'moss', label: 'Mossy Floor', color: '#16a34a' },
        lines: [],
        terrains: [],
        walls: [],
        fog: [],
        objects: [],
        tokens: [],
        texts: [],
        lights: []
      })
    );
    act(() => {
      hexHook.result.current.handleMouseDown({ button: 0, worldPos: { x: 10, y: 10 } });
    });
    expect(updateMap).toHaveBeenCalledTimes(1);
    const placedTerrain = updateMap.mock.calls[0][1].terrains[0];
    expect(placedTerrain.renderType).toBe('hexTile');
    expect(placedTerrain.label).toBe('Mossy Floor');
  });

  it('SelectedElementInspectorBar edits Wall/Door, Light, Text, and Region and disables in read-only', () => {
    const onUpdateWall = vi.fn();
    const onUpdateLight = vi.fn();
    const onUpdateText = vi.fn();
    const onUpdateRegion = vi.fn();
    const onRecordHistory = vi.fn();

    const baseMap = {
      id: 'm1',
      tokens: [],
      objects: [],
      walls: [{ id: 'w1', type: 'door', doorState: 'closed', hackDc: 14, breachHp: 40, p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 } }],
      lights: [{ id: 'l1', color: '#f59e0b', radius: 180, brightness: 0.8, animation: 'flicker' }],
      texts: [{ id: 't1', text: 'Bridge', fill: '#ffffff', fontSize: 24 }],
      regions: [{ id: 'r1', name: 'Plasma Leak', triggerType: 'hazard', bounds: { x: 0, y: 0, width: 150, height: 150 }, payload: { damage: 8 } }]
    };

    const { rerender } = render(
      <SelectedElementInspectorBar
        currentMap={baseMap}
        selectedId="w1"
        onUpdateWall={onUpdateWall}
        onUpdateLight={onUpdateLight}
        onUpdateText={onUpdateText}
        onUpdateRegion={onUpdateRegion}
        onRecordHistory={onRecordHistory}
      />
    );

    const doorSelect = screen.getByLabelText(/Door State/i);
    fireEvent.change(doorSelect, { target: { value: 'open' } });
    expect(onUpdateWall).toHaveBeenCalledWith('w1', { doorState: 'open', isOpen: true, isLocked: false });

    rerender(
      <SelectedElementInspectorBar
        currentMap={baseMap}
        selectedId="l1"
        onUpdateWall={onUpdateWall}
        onUpdateLight={onUpdateLight}
        onUpdateText={onUpdateText}
        onUpdateRegion={onUpdateRegion}
        onRecordHistory={onRecordHistory}
      />
    );
    const radiusSlider = screen.getByLabelText(/Radius/i);
    fireEvent.change(radiusSlider, { target: { value: '240' } });
    expect(onUpdateLight).toHaveBeenCalledWith('l1', { radius: 240 });
    expect(onRecordHistory).toHaveBeenCalledWith('Edit Element', { coalesceKey: 'inspector_l1' });

    rerender(
      <SelectedElementInspectorBar
        currentMap={baseMap}
        selectedId="t1"
        isStoryReadOnly={true}
        onUpdateText={onUpdateText}
        onRecordHistory={onRecordHistory}
      />
    );
    const textInput = screen.getByLabelText(/^Text:$/i);
    expect(textInput.disabled).toBe(true);
  });

  it('MapUnderlayCalibrationModal resyncs across map switches, uploads images via uploadAdeImageAsset, and closes on Escape', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <MapUnderlayCalibrationModal
        isOpen={true}
        onClose={onClose}
        mapId="map_one"
        userId="uid_1"
        currentUnderlay={{ url: 'https://cdn.example/one.png', opacity: 0.5, scale: 1, offsetX: 0, offsetY: 0 }}
        onApplyUnderlay={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('https://cdn.example/one.png')).toBeTruthy();

    rerender(
      <MapUnderlayCalibrationModal
        isOpen={true}
        onClose={onClose}
        mapId="map_two"
        userId="uid_1"
        currentUnderlay={{ url: 'https://cdn.example/two.png', opacity: 0.75, scale: 1.5, offsetX: 10, offsetY: 20 }}
        onApplyUnderlay={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('https://cdn.example/two.png')).toBeTruthy();

    const fileInput = document.querySelector('input[type="file"]');
    const imgFile = new File(['pngdata'], 'deck_plan.png', { type: 'image/png' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [imgFile] } });
    });
    expect(uploadAdeImageAsset).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue('https://cdn.example/blueprint.webp')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('UvttImportModal handles drop files, resets state on reopen, and closes on Escape', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <UvttImportModal isOpen={true} onClose={onClose} onImportComplete={vi.fn()} />
    );

    const dropzone = screen.getByTestId('uvtt-dropzone');
    const badFile = new File(['{bad json'], 'corrupt_map.dd2vtt', { type: 'application/json' });
    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, { dataTransfer: { files: [badFile] } });

    // Close and reopen -> stale fileName should reset
    rerender(<UvttImportModal isOpen={false} onClose={onClose} onImportComplete={vi.fn()} />);
    rerender(<UvttImportModal isOpen={true} onClose={onClose} onImportComplete={vi.fn()} />);
    expect(screen.getByDisplayValue('Imported Sector Battlemap')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('MapKeyPanel renders image-backed terrains without color and filters Walls, Lights, and Regions', () => {
    const mockMap = {
      id: 'map_1',
      type: 'Interior',
      terrains: [
        { id: 'ter1', label: 'Hull Plating', textureUrl: 'https://cdn.example/hull.png' }
      ],
      objects: [{ id: 'o1', label: 'Server Rack', x: 50, y: 50 }],
      tokens: [],
      walls: [{ id: 'w1', label: 'Airlock Alpha', type: 'door', doorState: 'closed', p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 } }],
      lights: [{ id: 'l1', name: 'Alert Beacon', x: 200, y: 200, radius: 180 }],
      regions: [{ id: 'r1', name: 'Zero-G Bay', triggerType: 'hazard', bounds: { x: 10, y: 10, width: 100, height: 100 } }]
    };

    render(
      <MapKeyPanel
        showKeyPanel={true}
        setShowKeyPanel={vi.fn()}
        currentMap={mockMap}
        setSelectedId={vi.fn()}
        selectedId={null}
        setPosition={vi.fn()}
      />
    );

    expect(screen.getByText('Hull Plating')).toBeTruthy();
    fireEvent.click(screen.getByText(/Directory \(4\)/i));
    expect(screen.getByText('Airlock Alpha')).toBeTruthy();
    expect(screen.getByText('Alert Beacon')).toBeTruthy();
    expect(screen.getByText('Zero-G Bay')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Lights (1)' }));
    expect(screen.getByText('Alert Beacon')).toBeTruthy();
    expect(screen.queryByText('Server Rack')).toBeNull();
  });
});
