/**
 * @file pillar4MapMaker.test.jsx
 * @description Pillar 4 (Map Architect / MapMaker) Comprehensive Regression Suite:
 *   1. MapMaker mounts without ReferenceError (useMemo imported), opens Story Elements drawer via right rail
 *   2. useMapCanvasEvents buffers freehand strokes until pointerup & supports fog reveal mode
 *   3. mapMakerPixiHelpers enforces bounded 128-entry LRU texture cache
 *   4. useMapHistory snapshots & restores gridSize, underlays, ambientLight, weatherFx, metadata
 *   5. UvttImportModal displays light sources count and offloads data URI image via uploadAdeImageAsset
 *   6. VttExportTab invokes exportMapWithWorker even with thumbnail present & toasts errors on worker failure
 *   7. MapMaker3DPreviewModal supports dynamic decks, Slice ON/OFF toggle, and WebGL failure banner
 *   8. PlayerSpectatorView syncs video backdrop transform and allows tablet landscape (>=768px)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  toastMock,
  uploadAdeImageAssetMock,
  exportMapWithWorkerMock,
  mockUpdateMap,
  mockCampaignValue,
  mockTextureFrom,
  mockDeckSetSliceActive,
  mock3dInitResult,
  mockIsMobile
} = vi.hoisted(() => ({
  toastMock: vi.fn(),
  uploadAdeImageAssetMock: vi.fn(async () => ({ url: 'https://cdn.tangent.test/maps/offloaded.webp', offloaded: true })),
  exportMapWithWorkerMock: vi.fn(async () => ({ dataUrl: 'data:image/webp;base64,AAA111', usedWorker: true })),
  mockUpdateMap: vi.fn(),
  mockCampaignValue: {
    universeState: {
      id: 'story_p4',
      projectName: 'Pillar 4 Test Campaign',
      maps: [
        {
          id: 'map_p4_1',
          title: 'Starship Deck A',
          type: 'Interior',
          gridMode: 'square',
          gridSize: 50,
          width: 1400,
          height: 1050,
          terrains: [],
          walls: [],
          objects: [],
          tokens: [],
          lights: [],
          texts: [],
          fog: [],
          regions: [],
          videoBackgroundUrl: 'https://cdn.tangent.test/loop.webm'
        }
      ],
      elements: [{ id: 'el_1', title: 'Docking Manifest', type: 'Scene' }],
      customAssets: { terrains: [], objects: [], chunks: [] }
    },
    elementsCatalog: [{ id: 'el_1', title: 'Docking Manifest', type: 'Scene' }],
    activeMapId: 'map_p4_1',
    setActiveMapId: vi.fn(),
    updateMap: vi.fn(),
    addMap: vi.fn(),
    deleteMap: vi.fn(),
    allMaps: [],
    addCustomChunk: vi.fn(),
    updateCustomChunk: vi.fn(),
    deleteCustomChunk: vi.fn(),
    addCustomObject: vi.fn(),
    addCustomTerrain: vi.fn(),
    publishSpectatorMap: vi.fn(),
    isStoryReadOnly: false
  },
  mockTextureFrom: vi.fn((src) => ({ id: src?.src || 'tex', destroyed: false, destroy: vi.fn() })),
  mockDeckSetSliceActive: vi.fn(),
  mock3dInitResult: { value: true },
  mockIsMobile: { value: false }
}));

mockCampaignValue.updateMap = mockUpdateMap;
mockCampaignValue.allMaps = mockCampaignValue.universeState.maps;

vi.mock('pixi.js', () => ({
  Texture: { from: mockTextureFrom },
  Graphics: class MockGfx {},
  Container: class MockContainer {},
  Sprite: class MockSprite {},
  Text: class MockText {},
  TextStyle: class MockTextStyle {},
  ColorMatrixFilter: class MockCMF {}
}));

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useNavigate: () => vi.fn(),
  useParams: () => ({ mapId: 'map_p4_1' })
}));

vi.mock('../../../firebase', () => ({
  db: null,
  storage: null,
  auth: { currentUser: { uid: 'arch_p4' } }
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(async () => ({ exists: () => false })),
  onSnapshot: vi.fn(() => () => {})
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: toastMock,
  useToast: () => ({ toast: toastMock })
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'arch_p4' }, isAdmin: true })
}));

vi.mock('../../../context/CampaignContext', () => ({
  useCampaign: () => mockCampaignValue,
  useStory: () => mockCampaignValue,
  formatExportFilename: (t) => `${t || 'map'}.png`
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => ({ dbData: {} })
}));

vi.mock('../../../hooks/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile.value
}));

vi.mock('../../../services/audioService', () => ({
  default: { playTerminalBeep: vi.fn(), playCriticalSuccess: vi.fn(), playCombatHit: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalSuccess: vi.fn(), playCombatHit: vi.fn() }
}));

vi.mock('../../../services/spatialAudioService', () => ({
  default: { updateMapAtmosphere: vi.fn(), playAmbient: vi.fn(), stopAmbient: vi.fn() }
}));

vi.mock('../../../services/proAudioMixerService', () => ({
  proAudioMixerService: {
    getBusState: () => ({ muted: false }),
    toggleBusMute: vi.fn()
  }
}));

vi.mock('../../../services/adeMediaStorageService', () => ({
  uploadAdeImageAsset: uploadAdeImageAssetMock,
  uploadAdeMediaAsset: vi.fn(async () => ({ url: 'https://cdn.tangent.test/vid.webm' }))
}));

vi.mock('../../../services/mapWorkerExportService', () => ({
  exportMapWithWorker: exportMapWithWorkerMock
}));

vi.mock('../../../services/vttMultiplayerSyncService', () => ({
  getVttMultiplayerSync: () => ({
    init: vi.fn(),
    getTacticalTokensMap: () => ({ observe: vi.fn(), unobserve: vi.fn(), get: vi.fn() }),
    getDocument: () => ({ getMap: () => ({ observe: vi.fn(), unobserve: vi.fn(), get: vi.fn() }) })
  })
}));

vi.mock('../../../components/VTT/SpectatorPixiCanvas', () => ({
  SpectatorPixiCanvas: () => <div data-testid="mock-spectator-pixi" />
}));

vi.mock('./MapTextures', () => ({
  getTextureUrlFromColor: () => null,
  getLoadedImage: (src) => ({ complete: true, naturalWidth: 64, width: 64, src })
}));

vi.mock('../MapMaker/map/MapTextures', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getTextureUrlFromColor: () => null,
    getLoadedImage: (src) => ({ complete: true, naturalWidth: 64, width: 64, src })
  };
});

vi.mock('../../../engine/canvas/RendererContext.ts', () => ({
  RendererContext: class MockRenderer {
    initialize = vi.fn(async () => {});
    getIsInitialized = () => false;
    getApp = () => null;
    destroy = vi.fn(async () => {});
  }
}));

vi.mock('../../../engine/3d', () => ({
  Stage3DRendererContext: class Mock3DRenderer {
    initialize = vi.fn(() => mock3dInitResult.value);
    onResize = vi.fn(() => () => {});
    onRender = vi.fn(() => () => {});
    renderScene = vi.fn();
    destroy = vi.fn();
  },
  TacticalCameraRig: class MockCameraRig {
    camera = {};
    attach = vi.fn();
    detach = vi.fn();
    updateAspect = vi.fn();
    update = vi.fn();
    toggleMode = vi.fn(() => 'orbit');
    rotateTacticalAzimuth = vi.fn();
    resetView = vi.fn();
  },
  Stage3DCompositor: class Mock3DCompositor {
    scene = {};
    lightingManager = { setAtmosphere: vi.fn() };
    deckManager = { setActiveDeck: vi.fn(), setSliceActive: mockDeckSetSliceActive };
    syncFromMap = vi.fn();
    update = vi.fn();
    dispose = vi.fn();
  }
}));

vi.mock('../../../components/DBM/UnifiedRelationalSelectorModal', () => ({
  UnifiedRelationalSelectorModal: () => null
}));
vi.mock('../../../components/DBM/DBMItemModal', () => ({
  DBMItemModal: () => null
}));
vi.mock('../../../components/StoryFoundry/StoryFoundryGuideModal', () => ({
  StoryFoundryGuideModal: () => null
}));
vi.mock('../MapMaker/map/VttCommandDrawer', () => ({
  default: () => null
}));

import MapMaker from '../MapMaker/MapMaker';
import { useMapCanvasEvents } from '../MapMaker/hooks/useMapCanvasEvents';
import { useMapHistory } from '../MapMaker/hooks/useMapHistory';
import {
  requestPixiTexture,
  getPixiTextureCacheSize,
  clearPixiTextureCache
} from '../MapMaker/pixi/mapMakerPixiHelpers';
import { UvttImportModal } from '../MapMaker/map/UvttImportModal';
import { VttExportTab } from '../MapMaker/components/VttExportTab';
import { MapMaker3DPreviewModal } from '../MapMaker/components/MapMaker3DPreviewModal';
import { PlayerSpectatorView } from '../MapMaker/PlayerSpectatorView';

describe('Pillar 4 — Map Architect (MapMaker) Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock3dInitResult.value = true;
    mockIsMobile.value = false;
    clearPixiTextureCache();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-vtt');
    global.URL.revokeObjectURL = vi.fn();
    global.ResizeObserver = class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('1. MapMaker mounts without ReferenceError and exposes Story Elements Drawer launcher on right rail', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
    render(<MapMaker />);

    const storyBtn = screen.getByTitle('Story Elements Drawer');
    expect(storyBtn).toBeInTheDocument();
    fireEvent.click(storyBtn);
    expect(screen.getByText(/Docking Manifest/i)).toBeInTheDocument();
  });

  it('2. useMapCanvasEvents buffers freehand pencil strokes until pointerup and removes matching fog strokes in reveal mode', () => {
    const updateMap = vi.fn();
    const recordHistory = vi.fn();

    const { result } = renderHook(() =>
      useMapCanvasEvents({
        currentMap: { id: 'm1', gridSize: 50, gridMode: 'square' },
        activeMapId: 'm1',
        updateMap,
        recordHistory,
        activeTool: 'pencil',
        pencilColor: '#ef4444',
        pencilWidth: 6,
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
      result.current.handleMouseDown({ button: 0, worldPos: { x: 10, y: 10 } });
    });
    act(() => {
      result.current.handleMouseMove({ buttons: 1, worldPos: { x: 50, y: 40 } });
    });
    act(() => {
      result.current.handleMouseMove({ buttons: 1, worldPos: { x: 90, y: 80 } });
    });

    // Zero full-map commits during mousemove drag; preview carries live stroke
    expect(updateMap).not.toHaveBeenCalled();
    expect(result.current.activeStrokePreview?.points).toEqual([10, 10, 50, 40, 90, 80]);

    act(() => {
      result.current.handleMouseUp();
    });

    expect(updateMap).toHaveBeenCalledTimes(1);
    expect(result.current.activeStrokePreview).toBeNull();

    // Verify fog reveal mode removes intersected fog stroke cleanly
    const fogUpdate = vi.fn();
    const existingFog = [
      { id: 'fog_hit', points: [100, 100, 140, 100] },
      { id: 'fog_far', points: [800, 800, 860, 800] }
    ];
    const fogHook = renderHook(() =>
      useMapCanvasEvents({
        currentMap: { id: 'm1', gridSize: 50, gridMode: 'square' },
        activeMapId: 'm1',
        updateMap: fogUpdate,
        recordHistory,
        activeTool: 'fog',
        fogBrushMode: 'reveal',
        fog: existingFog,
        lines: [],
        terrains: [],
        walls: [],
        objects: [],
        tokens: [],
        texts: [],
        lights: []
      })
    );

    act(() => {
      fogHook.result.current.handleMouseDown({ button: 0, worldPos: { x: 105, y: 105 } });
      fogHook.result.current.handleMouseUp();
    });

    expect(fogUpdate).toHaveBeenCalledTimes(1);
    const updater = fogUpdate.mock.calls[0][1];
    const nextState = typeof updater === 'function' ? updater({ fog: existingFog }) : updater;
    expect(nextState.fog.map((f) => f.id)).toEqual(['fog_far']);
  });

  it('3. mapMakerPixiHelpers bounds cached textures to 128 LRU entries', () => {
    for (let i = 0; i < 140; i++) {
      requestPixiTexture(`https://cdn.tangent.test/tex_${i}.png`);
    }
    expect(getPixiTextureCacheSize()).toBe(128);
  });

  it('4. useMapHistory snapshots & restores gridSize, underlays, ambientLight, weatherFx, and metadata', () => {
    const updateMap = vi.fn();
    const initialMap = {
      id: 'm_hist',
      gridSize: 75,
      underlays: [{ id: 'u1', url: 'https://cdn.tangent.test/u.png' }],
      ambientLight: '#38bdf8',
      weatherFx: 'storm',
      metadata: { gravity: '0.8g' }
    };

    const { result, rerender } = renderHook(
      ({ map }) =>
        useMapHistory({
          currentMap: map,
          lines: [],
          tokens: [],
          terrains: [],
          objects: [],
          texts: [],
          walls: [],
          lights: [],
          fog: [],
          mapLayers: [],
          updateMap,
          activeMapId: 'm_hist'
        }),
      { initialProps: { map: initialMap } }
    );

    act(() => {
      result.current.recordHistory('Snapshot Environmental State');
    });

    rerender({
      map: {
        ...initialMap,
        gridSize: 50,
        ambientLight: '#000000',
        weatherFx: 'clear',
        underlays: [],
        metadata: { gravity: '1.0g' }
      }
    });

    act(() => {
      result.current.handleUndo();
    });

    expect(updateMap).toHaveBeenCalledTimes(1);
    const patch = updateMap.mock.calls[0][1];
    expect(patch.gridSize).toBe(75);
    expect(patch.ambientLight).toBe('#38bdf8');
    expect(patch.weatherFx).toBe('storm');
    expect(patch.underlays).toHaveLength(1);
    expect(patch.metadata).toEqual({ gravity: '0.8g' });
  });

  it('5. UvttImportModal displays light count and offloads imported raster texture via uploadAdeImageAsset', async () => {
    const onImportComplete = vi.fn();
    const uvttJson = JSON.stringify({
      format: 0.2,
      resolution: { map_size: { x: 10, y: 10 }, pixels_per_grid: 70 },
      line_of_sight: [],
      portals: [],
      lights: [{ position: { x: 3, y: 4 }, range: 3, color: 'ffaa00' }],
      image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    });

    class MockFileReader {
      readAsText() {
        setTimeout(() => {
          this.onload?.({ target: { result: uvttJson } });
        }, 0);
      }
    }
    const OrigFileReader = global.FileReader;
    global.FileReader = MockFileReader;

    try {
      render(<UvttImportModal isOpen={true} onClose={vi.fn()} onImportComplete={onImportComplete} />);
      const fileInput = document.querySelector('input[type="file"]');
      const file = new File([uvttJson], 'station.dd2vtt', { type: 'application/json' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Light Sources/i)).toBeInTheDocument();
      });

      const importBtn = screen.getByRole('button', { name: /Import/i });
      fireEvent.click(importBtn);

      await waitFor(() => {
        expect(uploadAdeImageAssetMock).toHaveBeenCalledTimes(1);
        expect(onImportComplete).toHaveBeenCalledTimes(1);
      });

      const imported = onImportComplete.mock.calls[0][0];
      expect(imported.type).toBe('Interior');
      expect(imported.lights).toHaveLength(1);
      expect(imported.terrains[0].imageUrl).toBe('https://cdn.tangent.test/maps/offloaded.webp');
    } finally {
      global.FileReader = OrigFileReader;
    }
  });

  it('6. VttExportTab renders full-resolution image via exportMapWithWorker and toasts on worker failure', async () => {
    render(
      <VttExportTab
        currentMap={{
          id: 'm_exp',
          title: 'Reactor Bay',
          gridSize: 50,
          width: 1000,
          height: 800,
          thumbnail: 'data:image/png;base64,LOWRES',
          terrains: [],
          walls: [],
          objects: [],
          tokens: [],
          texts: [],
          lights: []
        }}
        onExportPNG={vi.fn()}
      />
    );

    const exportBtn = screen.getByRole('button', { name: /Download \.dd2vtt/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(exportMapWithWorkerMock).toHaveBeenCalledTimes(1);
    });

    exportMapWithWorkerMock.mockRejectedValueOnce(new Error('Worker OOM'));
    render(
      <VttExportTab
        currentMap={{ id: 'm_exp_2', title: 'No Thumb Bay', gridSize: 50, walls: [], lights: [] }}
        onExportPNG={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button', { name: /Download \.dd2vtt/i });
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  it('7. MapMaker3DPreviewModal supports dynamic decks, Slice toggle, and WebGL failure alert', () => {
    render(
      <MapMaker3DPreviewModal
        isOpen={true}
        onClose={vi.fn()}
        currentMap={{
          id: 'm3d',
          decks: [
            { id: 'lower', label: 'Lower Engineering' },
            { id: 'bridge', label: 'Command Bridge' }
          ],
          walls: [],
          terrains: [],
          objects: [],
          lights: []
        }}
        tokens={[]}
      />
    );

    expect(screen.getByRole('option', { name: 'Lower Engineering' })).toBeInTheDocument();
    const sliceBtn = screen.getByRole('button', { name: /Slice ON/i });
    fireEvent.click(sliceBtn);
    expect(mockDeckSetSliceActive).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', { name: /Slice OFF/i })).toBeInTheDocument();

    cleanup();
    mock3dInitResult.value = false;
    render(
      <MapMaker3DPreviewModal
        isOpen={true}
        onClose={vi.fn()}
        currentMap={{ id: 'm3d_fail', walls: [] }}
        tokens={[]}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/WebGL Preview Unavailable/i);
  });

  it('8. PlayerSpectatorView allows tablet landscape (>=768px) and syncs video backdrop CSS transform', () => {
    mockIsMobile.value = true;
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    render(<PlayerSpectatorView />);

    expect(screen.queryByText(/currently unavailable on narrow mobile screens/i)).toBeNull();
    const vid = document.querySelector('video');
    expect(vid).toBeTruthy();
    expect(vid.style.transformOrigin).toBe('0 0');
    expect(vid.style.transform).toContain('translate(0px, 0px) scale(1)');
  });
});
