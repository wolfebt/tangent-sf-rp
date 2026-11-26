import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createDefaultAssetUnit } from '../../../schemas/assetUnitSchema';

vi.mock('../../../firebase.js', () => ({
  auth: { currentUser: null },
  storage: null,
  db: null
}));

vi.mock('../../../firebase', () => ({
  auth: { currentUser: null },
  storage: null,
  db: null
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn(),
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('../../../utils/confirmationUtils', () => ({
  confirmTypedDeletion: vi.fn(async () => true)
}));

vi.mock('../../../services/adeMediaStorageService', () => ({
  uploadAdeImageAsset: vi.fn(async () => ({
    url: 'data:image/png;base64,iVBORw0KGgo=',
    offloaded: false
  }))
}));

vi.mock('../MapMaker/map/AssetDrawingStudio', () => ({
  default: ({ label }) => <div data-testid="mock-drawing-studio">{label}</div>
}));

vi.mock('../../../components/VTT/studio/CollisionHullEditor', () => ({
  CollisionHullEditor: () => <div data-testid="mock-collision-editor" />
}));

vi.mock('../../../components/VTT/studio/LightEmitterPlacer', () => ({
  LightEmitterPlacer: () => <div data-testid="mock-light-placer" />
}));

import { AssetStudioModal } from '../../../components/VTT/studio/AssetStudioModal';
import { UniversalAssetTree } from '../../../components/VTT/tree/UniversalAssetTree';
import { applyChromaKeyToImageData } from '../../../components/VTT/ingestion/ChromaKeyTool';
import { AssetStudioTab } from '../MapMaker/components/AssetStudioTab';
import { useAssetUnitStore } from '../../../engine/assets/assetUnitStore';

describe('Map Asset Studio Deep Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAssetUnitStore.getState().reloadFromStorage();
  });

  it('syncs AssetStudioModal form state across prop swaps, dismisses on Escape, and renders all 7 category mechanics tabs', () => {
    const vehicleUnit = createDefaultAssetUnit({
      unit_id: 'veh_test_1',
      name: 'Dropship MK-II',
      category: 'vehicle',
      dimensions: [3, 2],
      vtt_properties: {
        blocks_movement: true,
        blocks_vision: false,
        z_index_layer: 'tokens',
        vehicleHull: {
          hullDr: { kinetic: 12, energy: 10 },
          structureMaxHp: 150,
          speedMph: 80,
          handlingModifier: 1,
          passengerNodes: [],
          hardpointSockets: []
        }
      }
    });

    const portalUnit = createDefaultAssetUnit({
      unit_id: 'door_test_1',
      name: 'Vault Bulkhead',
      category: 'wall_portal',
      vtt_properties: {
        blocks_movement: true,
        blocks_vision: true,
        z_index_layer: 'interactive_objects',
        wallPortal: {
          wallType: 'blast_bulkhead',
          isDoor: true,
          doorType: 'iris',
          doorState: 'locked',
          blocksLight: true,
          blocksSensors: true,
          blocksMovement: true,
          soundMuffleFactor: 0.9
        }
      }
    });

    const onClose = vi.fn();
    const onSaveAsset = vi.fn();

    const { rerender } = render(
      <AssetStudioModal
        isOpen={true}
        asset={vehicleUnit}
        onClose={onClose}
        onSaveAsset={onSaveAsset}
      />
    );

    expect(screen.getByText(/Property Forge — Dropship MK-II/i)).toBeTruthy();

    // Open Tactical Properties tab -> Vehicle Hull & PassengerNodePlacer + Scatter Rules should appear
    fireEvent.click(screen.getByRole('button', { name: /Tactical Properties/i }));
    expect(screen.getByText(/Vehicle Hull & Kinematics/i)).toBeTruthy();
    expect(screen.getByText(/Vehicle Seats & Hardpoint Sockets/i)).toBeTruthy();
    expect(screen.getByText(/Procedural Scatter & PCG Placement Rules/i)).toBeTruthy();

    // Swap asset prop while mounted -> form must resync instead of showing stale Dropship name
    rerender(
      <AssetStudioModal
        isOpen={true}
        asset={portalUnit}
        onClose={onClose}
        onSaveAsset={onSaveAsset}
      />
    );
    expect(screen.getByText(/Property Forge — Vault Bulkhead/i)).toBeTruthy();
    expect(screen.getByText(/Wall & Portal Architecture/i)).toBeTruthy();

    // Escape closes modal
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('strips matching green-screen pixels cleanly with applyChromaKeyToImageData', () => {
    // 2 RGBA pixels: pure green screen (0, 255, 0, 255) and cyan foreground (0, 180, 255, 255)
    const buffer = new Uint8ClampedArray([
      0, 255, 0, 255,
      0, 180, 255, 255
    ]);
    applyChromaKeyToImageData(buffer, [0, 255, 0], 40, 10);
    expect(buffer[3]).toBe(0);
    expect(buffer[7]).toBe(255);
  });

  it('filters UniversalAssetTree by provenanceFilter and strips leading # on tag search', () => {
    const presetUnit = createDefaultAssetUnit({
      unit_id: 'tree_preset_1',
      name: 'Factory Terminal',
      category: 'doodad',
      tree_path: ['Tech', 'Consoles'],
      tags: ['cybernetic', 'console'],
      provenance: { source: 'preset', dateAdded: new Date().toISOString() }
    });
    const customUnit = createDefaultAssetUnit({
      unit_id: 'tree_custom_1',
      name: 'Smuggler Stash',
      category: 'doodad',
      tree_path: ['Custom', 'Containers'],
      tags: ['contraband', 'crate'],
      provenance: { source: 'custom_upload', dateAdded: new Date().toISOString() }
    });

    const onSelect = vi.fn();
    render(
      <UniversalAssetTree
        assets={[presetUnit, customUnit]}
        onSelectUnit={onSelect}
        searchQuery="#contraband"
        provenanceFilter="custom_upload"
      />
    );

    expect(screen.getByText('Smuggler Stash')).toBeTruthy();
    expect(screen.queryByText('Factory Terminal')).toBeNull();
  });

  it('connects AssetStudioTab to useAssetUnitStore for creation, duplication, CSS filter preview, and TileSynthesizerModal', () => {
    const onStamp = vi.fn();
    render(<AssetStudioTab onStampAssetOnMap={onStamp} />);

    // Seed unit count is displayed from store
    const initialCount = useAssetUnitStore.getState().assets.length;
    expect(screen.getByText(`${initialCount} Units Available`)).toBeTruthy();

    // Create Blank Unit adds to shared store & opens Property Forge
    fireEvent.click(screen.getByRole('button', { name: /New Blank Unit/i }));
    const afterCreateCount = useAssetUnitStore.getState().assets.length;
    expect(afterCreateCount).toBe(initialCount + 1);
    expect(screen.getByText(/Property Forge — New Custom Asset/i)).toBeTruthy();

    // Apply hue shift shader tint & save -> preview image reflects filter CSS
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    const blankUnit = useAssetUnitStore.getState().assets.find((u) => u.name === 'New Custom Asset');
    expect(blankUnit).toBeTruthy();
    act(() => {
      useAssetUnitStore.getState().upsertAssetUnit({
        ...blankUnit,
        visuals: {
          ...blankUnit.visuals,
          customization: { hueRotation: 90, saturation: 1.4, brightness: 1.1, contrast: 1.0 }
        }
      });
    });

    const previewImg = screen.getByAltText('New Custom Asset');
    const styleStr = previewImg.style.filter || previewImg.getAttribute('style') || '';
    expect(styleStr).toContain('hue-rotate(90deg)');

    // Duplicate Unit clones cleanly
    fireEvent.click(screen.getByRole('button', { name: /Duplicate/i }));
    expect(useAssetUnitStore.getState().assets.length).toBe(afterCreateCount + 1);

    // Tile Synthesizer Modal opens cleanly
    fireEvent.click(screen.getByRole('button', { name: /Synthesize Tile Unit/i }));
    expect(screen.getByText(/HIFI CHROMA Micro-Tile Unit Synthesizer/i)).toBeTruthy();
  });
});
