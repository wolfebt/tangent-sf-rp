/**
 * @file pillar6PresetsAndScripts.test.jsx
 * @description Pillar 6 regression suite covering:
 *   1. TrapsAndHazardsWorkbench: catalog Hazard render with allMaps=[], custom (X, Y) trap/terminal/bulkhead deploy, and catalog delete handling
 *   2. PresetsAndScriptsDashboard: keeps saved macro selected (no double `macro-` prefix), auto-switches encounters/items to macros, always shows + New Macro
 *   3. AtmosphericsWorkbench: preset audio preview via proAudioMixerService (no circular dependency)
 *   4. CombatModifiersWorkbench: unique instance IDs on repeat deploy, category filtering for presets & deployed, inline edit via onUpdateModifier, custom modifier creation
 *   5. assetAggregator & MacroSandboxStudio: honest Hazard isScripted computation, Isolated Worker JS Sandbox copy (no WebAssembly QuickJS), line-number gutter scroll sync
 *   6. useAttachedMacroRunner: runtime execution of scenario `onEnterMacro` and object `vtt_properties.script` (`on_interact`, `on_turn_start` recursion-guarded, `on_destruct`)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

const hoisted = vi.hoisted(() => ({
  updateSavedElement: vi.fn(async () => {}),
  deleteSavedElement: vi.fn(async () => {}),
  updateMap: vi.fn(async () => {}),
  updateUniverseMetadata: vi.fn(),
  addGalleryModifier: vi.fn(),
  updateGalleryModifier: vi.fn(),
  deleteGalleryModifier: vi.fn(),
  toggleGalleryModifier: vi.fn(),
  playCue: vi.fn(async () => {}),
  stopBus: vi.fn(),
  mockElements: [
    {
      id: 'haz-bare',
      title: 'Bare Gas Pocket',
      type: 'Hazard',
      content: 'Methane pocket.',
      fields: {}
    },
    {
      id: 'haz-armed',
      title: 'Plasma Tripwire',
      type: 'Hazard',
      content: 'Tripwire',
      fields: { trapType: 'proximity_plasma_mine', saveCr: 15, isTrap: true }
    },
    {
      id: 'item-1',
      title: 'Cryo Emitter',
      type: 'Technology',
      fields: { macroScript: 'StoryFlags.set("CRYO", true);' }
    }
  ],
  mockUniverseState: null
}));

hoisted.mockUniverseState = {
  id: 'story-p6',
  projectName: 'Pillar 6 Test Module',
  maps: [],
  scenarios: [
    { id: 'enc-1', title: 'Docking Bay Skirmish', type: 'Encounter', children: [] }
  ],
  scripts: []
};

vi.mock('../../../context/CampaignContext', () => ({
  useStory: () => ({
    elementsCatalog: hoisted.mockElements,
    updateSavedElement: hoisted.updateSavedElement,
    deleteSavedElement: hoisted.deleteSavedElement,
    mapsCatalog: [],
    universeState: hoisted.mockUniverseState,
    updateMap: hoisted.updateMap,
    updateStory: vi.fn(),
    updateUniverseMetadata: hoisted.updateUniverseMetadata,
    galleryModifiers: [],
    addGalleryModifier: hoisted.addGalleryModifier,
    updateGalleryModifier: hoisted.updateGalleryModifier,
    deleteGalleryModifier: hoisted.deleteGalleryModifier,
    toggleGalleryModifier: hoisted.toggleGalleryModifier,
    activeMapId: 'map-1',
    isStoryReadOnly: false
  })
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'gm-1' }, isAdmin: true, isGM: true })
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn()
}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    startAmbientDrone: vi.fn(),
    stopAmbientDrone: vi.fn()
  }
}));

vi.mock('../../../services/proAudioMixerService', () => ({
  proAudioMixerService: {
    playCue: (...args) => hoisted.playCue(...args),
    stopBus: (...args) => hoisted.stopBus(...args)
  }
}));

vi.mock('../../../services/vttMultiplayerSyncService', () => ({
  getVttMultiplayerSync: () => ({
    broadcastDoorToggle: vi.fn(),
    broadcastChatCard: vi.fn()
  })
}));

vi.mock('../../../engine/scripting/QuickJSSandbox', () => ({
  QuickJSSandbox: class MockSandbox {
    async executeWithActions(code, context = {}) {
      if (code.includes('ON_ENTER_OK')) {
        return { result: true, actions: [{ type: 'set_flag', key: 'SCENARIO_ENTERED', value: true }] };
      }
      if (code.includes('ON_INTERACT_OK')) {
        return { result: true, actions: [{ type: 'set_flag', key: 'TERMINAL_SLICED', value: true }] };
      }
      if (code.includes('ON_TURN_OK')) {
        return { result: true, actions: [{ type: 'set_flag', key: 'TURN_SCRIPT_RAN', value: (context.storyFlags?.TURN_SCRIPT_RAN || 0) + 1 }] };
      }
      if (code.includes('ON_DESTRUCT_OK')) {
        return { result: true, actions: [{ type: 'set_flag', key: 'REACTOR_SHATTERED', value: true }] };
      }
      return { result: 'ok', actions: [] };
    }
  }
}));

import PresetsAndScriptsDashboard from '../PresetsAndScripts/PresetsAndScriptsDashboard';
import { TrapsAndHazardsWorkbench } from '../PresetsAndScripts/components/TrapsAndHazardsWorkbench';
import { AtmosphericsWorkbench } from '../PresetsAndScripts/components/AtmosphericsWorkbench';
import { CombatModifiersWorkbench } from '../PresetsAndScripts/components/CombatModifiersWorkbench';
import { MacroSandboxStudio } from '../PresetsAndScripts/components/MacroSandboxStudio';
import { aggregateModuleAssets } from '../PresetsAndScripts/utils/assetAggregator';
import { useAttachedMacroRunner } from '../../../components/VTT/stage/useAttachedMacroRunner';
import { useADEStore } from '../store/adeStore';
import { VttEventBus } from '../../../utils/vttEventBus';

function MacroRunnerHarness({ activeScenario, currentMap }) {
  useAttachedMacroRunner({
    activeScenario,
    currentMap,
    updateMap: hoisted.updateMap,
    isArchitect: true,
    enabled: true
  });
  return <div data-testid="macro-runner-harness" />;
}

describe('Pillar 6: Presets & Scripts Automation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useADEStore.getState().clearActiveStoryFlags?.();
  });

  afterEach(() => {
    cleanup();
  });

  it('TrapsAndHazardsWorkbench safely renders catalog Hazard with empty maps, deploys custom (X, Y) nodes, and deletes catalog hazards', () => {
    const onDeleteHazard = vi.fn();
    const { unmount } = render(
      <TrapsAndHazardsWorkbench
        selectedAsset={{
          id: 'haz-armed',
          rawId: 'haz-armed',
          title: 'Plasma Tripwire',
          catalogCategory: 'props_traps',
          source: 'elementsCatalog',
          fields: { trapType: 'proximity_plasma_mine', saveCr: 15 }
        }}
        allMaps={[]}
        onUpdateMapObjects={hoisted.updateMap}
        onDeleteHazardElement={onDeleteHazard}
      />
    );

    expect(screen.getByText(/Sector: Catalog Hazard/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Select or create a tactical map first/i)).toBeDisabled();
    fireEvent.click(screen.getByTitle(/Remove from map/i));
    expect(onDeleteHazard).toHaveBeenCalledWith('haz-armed');
    unmount();

    const onUpdateMapObjects = vi.fn();
    render(
      <TrapsAndHazardsWorkbench
        allMaps={[{ id: 'm-1', title: 'Docking Bay', objects: [] }]}
        selectedMapId="m-1"
        onUpdateMapObjects={onUpdateMapObjects}
      />
    );
    fireEvent.change(screen.getByLabelText('Deploy Node Kind'), { target: { value: 'security_terminal' } });
    fireEvent.change(screen.getByLabelText('Deploy X Coordinate'), { target: { value: '420' } });
    fireEvent.change(screen.getByLabelText('Deploy Y Coordinate'), { target: { value: '510' } });
    fireEvent.click(screen.getByText('Deploy Trap'));

    expect(onUpdateMapObjects).toHaveBeenCalledWith(
      'm-1',
      expect.arrayContaining([
        expect.objectContaining({ objectType: 'security_terminal', x: 420, y: 510, hackDc: 13 })
      ])
    );
  });

  it('PresetsAndScriptsDashboard preserves selected macro ID after save, switches on encounter/item click, and always shows + New Macro', () => {
    render(
      <MemoryRouter>
        <PresetsAndScriptsDashboard />
      </MemoryRouter>
    );

    // + New Macro button is visible immediately even when activeCategory is 'all'
    expect(screen.getByText('+ New Macro')).toBeInTheDocument();

    // Selecting an encounter opens JS Macro Sandbox workbench
    fireEvent.click(screen.getByText('Docking Bay Skirmish'));
    expect(screen.getByText('Isolated Worker JS Sandbox')).toBeInTheDocument();

    // Save a new macro -> keeps the saved macro selected instead of snapping back to item 0
    fireEvent.change(screen.getByPlaceholderText('Macro Name...'), { target: { value: 'Door Override' } });
    fireEvent.click(screen.getByText('Save Macro'));

    expect(hoisted.updateUniverseMetadata).toHaveBeenCalled();
    const savedMacro = hoisted.updateUniverseMetadata.mock.calls[0][0].scripts[0];
    expect(savedMacro.name).toBe('Door Override');
    // Saved macro stays active & selected in the rail (doesn't snap back to item 0)
    const railCard = screen.getByText('Door Override').closest('.rounded-xl');
    expect(railCard.className).toContain('border-purple-500/70');
  });

  it('AtmosphericsWorkbench previews preset audio cues cleanly via proAudioMixerService', () => {
    render(
      <AtmosphericsWorkbench
        allMaps={[{ id: 'm1', title: 'Engine Room' }]}
        selectedMapId="m1"
        onApplyAtmosphereToMap={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Corrosive Acid Rain'));
    fireEvent.click(screen.getByText('Preview Audio'));
    expect(hoisted.playCue).toHaveBeenCalledWith('ambient', 'acid_rain', false);
  });

  it('CombatModifiersWorkbench generates unique IDs on repeat deploy, filters both lists, edits inline, and creates custom modifiers', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const { rerender } = render(
      <CombatModifiersWorkbench
        galleryModifiers={[]}
        onAddModifier={onAdd}
        onUpdateModifier={onUpdate}
        onDeleteModifier={vi.fn()}
        onToggleModifier={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Zero-G Inertia Drift'));
    fireEvent.click(screen.getByText('Zero-G Inertia Drift'));
    expect(onAdd).toHaveBeenCalledTimes(2);
    expect(onAdd.mock.calls[0][0].id).not.toBe(onAdd.mock.calls[1][0].id);

    // Category filter filters preset catalog too
    fireEvent.click(screen.getByRole('button', { name: 'metaphysic' }));
    expect(screen.queryByText('Zero-G Inertia Drift')).not.toBeInTheDocument();

    // Custom modifier creator
    fireEvent.click(screen.getByText('Custom Modifier'));
    fireEvent.change(screen.getByLabelText('Custom Modifier Name'), { target: { value: 'Magnetic Storm' } });
    fireEvent.change(screen.getByLabelText('Custom Modifier Rule'), { target: { value: '-2 Tech checks' } });
    fireEvent.click(screen.getByText('Deploy Custom'));
    expect(onAdd).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'Magnetic Storm', category: 'tactical' })
    );

    // Inline editing calls onUpdateModifier
    rerender(
      <CombatModifiersWorkbench
        galleryModifiers={[{ id: 'mod-1', name: 'Old Mod', category: 'tactical', description: 'Desc', isActive: true, effects: { customRuleText: '+1' } }]}
        onAddModifier={onAdd}
        onUpdateModifier={onUpdate}
        onDeleteModifier={vi.fn()}
        onToggleModifier={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'all' }));
    fireEvent.click(screen.getByLabelText('Edit Old Mod'));
    fireEvent.change(screen.getByLabelText('Edit Modifier Name'), { target: { value: 'Refined Mod' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onUpdate).toHaveBeenCalledWith('mod-1', expect.objectContaining({ name: 'Refined Mod' }));
  });

  it('assetAggregator computes Hazard isScripted honestly & MacroSandboxStudio syncs gutter scrollTop without WebAssembly QuickJS claims', () => {
    const assets = aggregateModuleAssets({
      elementsCatalog: hoisted.mockElements,
      mapsCatalog: [],
      universeState: hoisted.mockUniverseState,
      customMacros: [{ id: 'm-1', name: 'Alpha', code: 'return 1;' }]
    });

    const bareHaz = assets.find((a) => a.rawId === 'haz-bare');
    const armedHaz = assets.find((a) => a.rawId === 'haz-armed');
    const macroAsset = assets.find((a) => a.id === 'm-1');

    expect(bareHaz.isScripted).toBe(false);
    expect(armedHaz.isScripted).toBe(true);
    expect(macroAsset.description).not.toMatch(/WebAssembly|QuickJS/i);

    const { container } = render(
      <MacroSandboxStudio
        selectedAsset={{ id: 'm-1', type: 'Macro', title: 'Alpha', scriptData: { code: 'a\nb\nc' } }}
      />
    );
    expect(screen.getByText('Isolated Worker JS Sandbox')).toBeInTheDocument();
    const textarea = container.querySelector('textarea');
    const gutter = container.querySelector('.overflow-hidden.w-10');
    expect(textarea).toBeTruthy();
    expect(gutter).toBeTruthy();
    textarea.scrollTop = 42;
    fireEvent.scroll(textarea);
    expect(gutter.scrollTop).toBe(42);
  });

  it('useAttachedMacroRunner executes scenario onEnterMacro and object on_interact, on_turn_start, and on_destruct hooks', async () => {
    const initialMap = {
      id: 'm-run',
      objects: [
        {
          id: 'obj-term',
          label: 'Console',
          vtt_properties: {
            script: { enabled: true, executionHook: 'on_interact', sourceCode: 'ON_INTERACT_OK' }
          }
        },
        {
          id: 'obj-pulse',
          label: 'Conduit',
          vtt_properties: {
            script: { enabled: true, executionHook: 'on_turn_start', sourceCode: 'ON_TURN_OK' }
          }
        },
        {
          id: 'obj-reactor',
          label: 'Core',
          structure: 20,
          vtt_properties: {
            script: { enabled: true, executionHook: 'on_destruct', sourceCode: 'ON_DESTRUCT_OK' }
          }
        }
      ]
    };

    const { rerender } = render(
      <MacroRunnerHarness
        activeScenario={{ id: 'sc-enter', title: 'Breach', onEnterMacro: 'ON_ENTER_OK' }}
        currentMap={initialMap}
      />
    );

    await waitFor(() => {
      expect(useADEStore.getState().storyFlags.SCENARIO_ENTERED?.value).toBe(true);
    });

    await act(async () => {
      VttEventBus.emit('vtt-object-interacted', { objectId: 'obj-term' });
      VttEventBus.emit('stage-round-advanced', { round: 2 });
    });

    await waitFor(() => {
      expect(useADEStore.getState().storyFlags.TERMINAL_SLICED?.value).toBe(true);
      expect(useADEStore.getState().storyFlags.TURN_SCRIPT_RAN?.value).toBe(1);
    });

    // Drop structure from 20 to 0 -> fires on_destruct once
    rerender(
      <MacroRunnerHarness
        activeScenario={{ id: 'sc-enter', title: 'Breach', onEnterMacro: 'ON_ENTER_OK' }}
        currentMap={{
          ...initialMap,
          objects: initialMap.objects.map((o) =>
            o.id === 'obj-reactor' ? { ...o, structure: 0 } : o
          )
        }}
      />
    );

    await waitFor(() => {
      expect(useADEStore.getState().storyFlags.REACTOR_SHATTERED?.value).toBe(true);
    });
  });
});
