/**
 * @file adePhase3Integration.test.jsx
 * @description Phase 3 Vitest + React Testing Library integration tests for ADE UI contracts:
 *   1. AimeThreeTierStack renders Core Traits & Select inputs for Encounter / Clue / Universe / Property
 *   2. SelectivePrintModal safe open/close lifecycle without Rules-of-Hooks crashes
 *   3. StoryWeaver debounced updateStory persistence and flush on unmount
 */

import React, { useState, useRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const mockUpdateStory = vi.fn();
const mockCrdtUpdate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('react-quill-new', () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="mock-quill-editor"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}));

vi.mock('react-quill-new/dist/quill.snow.css', () => ({}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn()
  }
}));

vi.mock('../../../services/crdtCollabService', () => ({
  default: {
    getCollabStatus: () => ({ connected: false, peers: [] }),
    onCollabStatusChange: () => () => {},
    syncScenarioProse: (_id, initialText) => ({ currentContent: initialText }),
    subscribeToScenarioProse: () => () => {},
    updateScenarioProse: (...args) => mockCrdtUpdate(...args),
    attachLiveKitBridge: vi.fn(),
    detachLiveKitBridge: vi.fn()
  }
}));

const mockStoryContextValue = {
  universeState: { projectName: 'Sector Alpha', creativeState: {}, maps: [], stories: [], scenarios: [], galleryModifiers: [] },
  storyCatalog: [],
  updateCreativeState: vi.fn(),
  updateOutline: vi.fn(),
  updateSceneBeats: vi.fn(),
  updateDraft: vi.fn(),
  elementsCatalog: [{ id: 'elem_1', title: 'Drone Sentinel', fields: { vttScriptActive: 'true' } }],
  updateSavedElement: vi.fn(),
  deleteSavedElement: vi.fn(),
  mapsCatalog: [],
  activeMapId: null,
  setActiveMapId: vi.fn(),
  addMap: vi.fn(),
  updateMap: vi.fn(),
  addStory: vi.fn(),
  updateStory: vi.fn(),
  setActiveScenarioId: vi.fn(),
  openStory: vi.fn(),
  createNewStory: vi.fn(),
  deleteStoryProject: vi.fn(),
  updateProjectName: vi.fn(),
  handleSaveStory: vi.fn(),
  handleLoadStory: vi.fn(),
  pushUniverseToCloud: vi.fn(),
  pullUniverseFromCloud: vi.fn(),
  cloudSyncStatus: 'synced',
  lastCloudSavedAt: null,
  handleClearUniverse: vi.fn(),
  setGalleryModifiers: vi.fn(),
  cronicle: { entries: [] },
  stageCronicleDeltas: vi.fn()
};

vi.mock('../../../context/CampaignContext', () => ({
  useStory: () => mockStoryContextValue,
  useCampaign: () => mockStoryContextValue
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    toast: {
      showInfo: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn()
    }
  }),
  showToast: vi.fn()
}));

vi.mock('../../../context/ConfirmContext', () => ({
  showConfirm: vi.fn(),
  useConfirm: () => vi.fn()
}));

vi.mock('pixi.js', () => ({
  Container: class MockContainer {
    children = [];
    addChild(c) { this.children.push(c); return c; }
    removeChildren() { const c = this.children; this.children = []; return c; }
  },
  Graphics: class MockGraphics {
    rect() { return this; }
    fill() { return this; }
    circle() { return this; }
    stroke() { return this; }
    destroy() {}
  }
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test-uid' }, userHandle: 'Architect' })
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({ roster: [], characterData: null })
}));

vi.mock('../StoryModule/workspaces/AimeCanvasSculptor', () => ({
  default: () => <div data-testid="mock-canvas-sculptor" />
}));
vi.mock('../StoryModule/workspaces/ArchitectIdeationModal', () => ({
  default: () => null
}));
vi.mock('../StoryModule/workspaces/EpistemicPlayPanel', () => ({
  default: () => null
}));
vi.mock('../StoryModule/StoryElementExtractorModal', () => ({
  default: () => null
}));
vi.mock('../ElementForge/EditElementModal', () => ({
  default: () => null
}));

import AimeThreeTierStack from '../ElementForge/components/AimeThreeTierStack.jsx';
import { SelectivePrintModal } from '../../../components/StoryFoundry/SelectivePrintModal.jsx';
import StoryWeaver from '../StoryModule/workspaces/StoryWeaver.jsx';
import InteractiveObjectModal from '../MapMaker/map/InteractiveObjectModal.jsx';
import { StoryElementModal } from '../MapMaker/map/StoryElementModal.jsx';
import { useStageLighting } from '../../../components/VTT/stage/useStageLighting';
import ModuleMissionControl from '../Dashboard/ModuleMissionControl.jsx';

describe('ADE Phase 3 React Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('AimeThreeTierStack renders previously hidden schema types (Encounter, Clue, Universe) and handles select/text updates', () => {
    const onChangeField = vi.fn();
    const baseProps = {
      fields: {},
      onChangeField,
      guidance: {},
      onChangeGuidance: vi.fn(),
      assetHub: [],
      onChangeAssetHub: vi.fn()
    };

    const { rerender } = render(<AimeThreeTierStack elementType="Encounter" {...baseProps} />);
    expect(screen.getByPlaceholderText(/Kind of encounter/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/How the encounter begins/i)).toBeInTheDocument();

    rerender(<AimeThreeTierStack elementType="Clue" {...baseProps} />);
    expect(screen.getByPlaceholderText(/What this clue reveals/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Where or how it is discovered/i)).toBeInTheDocument();

    rerender(<AimeThreeTierStack elementType="Universe" {...baseProps} />);
    expect(screen.getByPlaceholderText('Designation...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Premise...')).toBeInTheDocument();

    rerender(<AimeThreeTierStack elementType="Property" {...baseProps} />);
    const subcategorySelect = screen.getByDisplayValue(/weaponry \/ armoring/i);
    fireEvent.change(subcategorySelect, { target: { value: 'mecha' } });
    expect(onChangeField).toHaveBeenCalledWith('propertySubcategory', 'mecha');
  });

  it('SelectivePrintModal toggles cleanly between closed and open without Rules-of-Hooks failures', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen((prev) => !prev)}>
            Toggle Print
          </button>
          <SelectivePrintModal
            isOpen={open}
            onClose={() => setOpen(false)}
            universeState={{ title: 'Sector 7 Dossier', stories: [] }}
            elementsCatalog={[]}
          />
        </div>
      );
    };

    render(<Harness />);
    expect(screen.queryByText(/Selective Print & Publishing Studio/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Toggle Print/i }));
    expect(screen.getByText(/Selective Print & Publishing Studio/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Toggle Print/i }));
    expect(screen.queryByText(/Selective Print & Publishing Studio/i)).not.toBeInTheDocument();
  });

  it('StoryWeaver debounces updateStory writes on rapid typing and flushes pending edits on unmount', () => {
    vi.useFakeTimers();

    const activeNode = {
      id: 'scene_alpha',
      title: 'Airlock Breach',
      type: 'Scene',
      content: 'Initial briefing.',
      fields: {}
    };

    const { unmount } = render(
      <StoryWeaver activeNode={activeNode} updateStory={mockUpdateStory} />
    );

    const editor = screen.getByTestId('mock-quill-editor');
    fireEvent.change(editor, { target: { value: 'Draft 1' } });
    fireEvent.change(editor, { target: { value: 'Draft 2' } });
    fireEvent.change(editor, { target: { value: 'Draft 3' } });

    expect(mockCrdtUpdate).toHaveBeenCalledTimes(3);
    expect(mockUpdateStory).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(260);
    });

    expect(mockUpdateStory).toHaveBeenCalledTimes(1);
    expect(mockUpdateStory).toHaveBeenCalledWith('scene_alpha', { content: 'Draft 3' });

    // Trigger another edit and verify unmount flushes immediately without waiting 250ms
    fireEvent.change(editor, { target: { value: 'Flushed Final Prose' } });
    expect(mockUpdateStory).toHaveBeenCalledTimes(1);

    unmount();
    expect(mockUpdateStory).toHaveBeenCalledTimes(2);
    expect(mockUpdateStory).toHaveBeenLastCalledWith('scene_alpha', {
      content: 'Flushed Final Prose'
    });
  });

  it('InteractiveObjectModal and StoryElementModal toggle cleanly between closed/null and open without Rules-of-Hooks errors', () => {
    const ObjectHarness = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen((p) => !p)}>Toggle Object Modal</button>
          <InteractiveObjectModal
            isOpen={open}
            objectNode={open ? { id: 'obj_1', name: 'Plasma Canister', type: 'explosive_canister', structure: 20 } : null}
            onClose={() => setOpen(false)}
          />
        </div>
      );
    };

    const ElementHarness = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen((p) => !p)}>Toggle Story Element Modal</button>
          <StoryElementModal
            isOpen={open}
            element={open ? { id: 'el_1', title: 'Airlock Trap', type: 'Hazard', summary: 'Vent alarm' } : null}
            onClose={() => setOpen(false)}
          />
        </div>
      );
    };

    render(
      <div>
        <ObjectHarness />
        <ElementHarness />
      </div>
    );

    expect(screen.queryByText(/Volatile Plasma Canister/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Toggle Object Modal/i }));
    expect(screen.getByText(/Volatile Plasma Canister/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Toggle Object Modal/i }));
    expect(screen.queryByText(/Volatile Plasma Canister/i)).not.toBeInTheDocument();

    expect(screen.queryByText('Airlock Trap')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Toggle Story Element Modal/i }));
    expect(screen.getByText('Airlock Trap')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Toggle Story Element Modal/i }));
    expect(screen.queryByText('Airlock Trap')).not.toBeInTheDocument();
  });

  it('useStageLighting resets weather to clear when switching from a weathered map to a plain map without polluting updateMap', () => {
    const updateMap = vi.fn();
    const toggleDynamicLighting = vi.fn();

    const { result, rerender } = renderHook(
      ({ map }) => {
        const atmosphereOverlayRef = useRef(null);
        const lightingContainerRef = useRef(null);
        const hazardSimulatorRef = useRef(null);
        return useStageLighting({
          currentMap: map,
          isCanvasReady: false,
          atmosphereOverlayRef,
          lightingContainerRef,
          hazardSimulatorRef,
          isDynamicLightingEnabled: false,
          toggleDynamicLighting,
          updateMap
        });
      },
      {
        initialProps: {
          map: { id: 'map_a', atmosphericWeather: 'toxic_smog', lights: [] }
        }
      }
    );

    expect(result.current.atmosphericWeather).toBe('toxic_smog');
    expect(updateMap).not.toHaveBeenCalled();

    rerender({ map: { id: 'map_b', lights: [] } });
    expect(result.current.atmosphericWeather).toBe('clear');
    expect(updateMap).not.toHaveBeenCalledWith('map_b', { atmosphericWeather: 'toxic_smog' });
    expect(updateMap).not.toHaveBeenCalled();
  });

  it('ModuleMissionControl renders with elementsCatalog without ReferenceError on removed savedElements', () => {
    render(<ModuleMissionControl onSwitchView={vi.fn()} />);
    expect(screen.getByText(/Active Module: Sector Alpha/i)).toBeInTheDocument();
  });
});
