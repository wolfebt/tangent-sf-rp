/**
 * @file adeVttConnectivityIntegration.test.jsx
 * @description Integration tests covering Story Foundry <-> Stage <-> VTT connectivity:
 *   1. Nested scenario tree flattening (`flattenScenariosTree`)
 *   2. `modulePackageService` Stage manifest round-trip export & hydration
 *   3. `useStageTriggerEngine` spatial enter/exit trigger + `conditionExpr` evaluation
 *   4. `VolatileSharder` alive -> 0 HP/Structure `token-defeated` one-shot transition emission
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { flattenScenariosTree } from '../assetContracts';
import { buildModulePackagePayload, hydrateModuleIntoCampaign } from '../../../services/modulePackageService';
import { useStageTriggerEngine } from '../../../components/VTT/stage/useStageTriggerEngine';
import { useADEStore } from '../store/adeStore';
import { useEngineStore } from '../../../engine/state/VolatileSharder';
import { VttEventBus } from '../../../utils/vttEventBus';

function TriggerHarness({ compiledStage, liveTokens, currentMap, updateMap }) {
  useStageTriggerEngine({
    compiledStage,
    liveTokens,
    currentMap,
    updateMap,
    enabled: true,
  });
  return <div data-testid="trigger-harness" />;
}

describe('ADE <-> Stage <-> VTT Connectivity Integration', () => {
  beforeEach(() => {
    useADEStore.getState().clearActiveStoryFlags?.();
  });

  afterEach(() => {
    cleanup();
    useEngineStore.getState().clearAllEntities();
  });

  it('flattenScenariosTree resolves deeply nested child scenarios for VTT drawers & outliners', () => {
    const nested = [
      {
        id: 'sc-root',
        title: 'Act I',
        children: [
          {
            id: 'sc-branch',
            title: 'Deck 4',
            children: [{ id: 'sc-leaf', title: 'Airlock Breach', children: [] }],
          },
        ],
      },
    ];
    const flat = flattenScenariosTree(nested);
    expect(flat.map((s) => s.id)).toEqual(['sc-root', 'sc-branch', 'sc-leaf']);
  });

  it('modulePackageService serializes and rehydrates story-scoped stages cleanly', () => {
    const sampleStage = {
      id: 'stage-bay-4',
      title: 'Bay 4 Ambush',
      mapId: 'map-bay-4',
      storyId: 'story-alpha',
      anchors: [{ id: 'a1', name: 'Bulkhead', kind: 'waypoint', pos: { x: 200, y: 200 }, elementIds: [] }],
      triggers: [],
      variables: { ALARM_ARMED: true },
      macros: [],
      environment: { lighting: { mode: 'dim' }, weather: 'clear', modifierIds: [] },
    };

    const pkg = buildModulePackagePayload(
      {
        id: 'story-alpha',
        projectName: 'Alpha Station',
        scenarios: [{ id: 'sc-1', title: 'Opening', children: [] }],
        maps: [{ id: 'map-bay-4', name: 'Bay 4', tokens: [], objects: [], walls: [] }],
        stages: [sampleStage],
      },
      []
    );

    expect(pkg.stages).toHaveLength(1);
    expect(pkg.stages[0].id).toBe('stage-bay-4');

    const saveStageManifest = vi.fn();
    const res = hydrateModuleIntoCampaign(pkg, {
      addMap: vi.fn(),
      addStory: vi.fn(),
      addSavedElement: vi.fn(),
      saveStageManifest,
    });

    expect(res.stagesImported).toBe(1);
    expect(saveStageManifest).toHaveBeenCalledWith(expect.objectContaining({ id: 'stage-bay-4', mapId: 'map-bay-4' }));
  });

  it('useStageTriggerEngine gates enter triggers by adeStore.storyFlags and executes SET_FLAG', async () => {
    const compiledStage = {
      stageId: 'stage-trig-test',
      title: 'Airlock Stage',
      anchors: [
        { id: 'zone-1', name: 'Airlock Box', kind: 'region', pos: { x: 100, y: 100, w: 120, h: 120 } },
      ],
      triggers: [
        {
          id: 'trig-enter',
          name: 'Seal Breach',
          anchorId: 'zone-1',
          on: 'enter',
          once: true,
          conditionExpr: 'POWER_ONLINE == true',
          actions: [{ type: 'SET_FLAG', key: 'AIRLOCK_SEALED', value: true }],
        },
      ],
    };

    const map = { id: 'm1', objects: [], regions: [], waypoints: [] };
    const { rerender } = render(
      <MemoryRouter>
        <TriggerHarness compiledStage={compiledStage} liveTokens={[{ id: 'tok-1', x: 20, y: 20 }]} currentMap={map} />
      </MemoryRouter>
    );

    // Move inside BEFORE condition flag is set -> should NOT fire
    rerender(
      <MemoryRouter>
        <TriggerHarness compiledStage={compiledStage} liveTokens={[{ id: 'tok-1', x: 150, y: 150 }]} currentMap={map} />
      </MemoryRouter>
    );
    expect(useADEStore.getState().getStoryFlag('AIRLOCK_SEALED')).toBeUndefined();

    // Move out, set condition flag, then move back inside -> SHOULD fire
    rerender(
      <MemoryRouter>
        <TriggerHarness compiledStage={compiledStage} liveTokens={[{ id: 'tok-1', x: 20, y: 20 }]} currentMap={map} />
      </MemoryRouter>
    );
    act(() => {
      useADEStore.getState().setStoryFlag('POWER_ONLINE', true);
    });
    rerender(
      <MemoryRouter>
        <TriggerHarness compiledStage={compiledStage} liveTokens={[{ id: 'tok-1', x: 150, y: 150 }]} currentMap={map} />
      </MemoryRouter>
    );

    expect(useADEStore.getState().getStoryFlag('AIRLOCK_SEALED')).toBe(true);
  });

  it('VolatileSharder emits token-defeated exactly once when token HP drops from >0 to 0', () => {
    const defeatedPayloads = [];
    const off = VttEventBus.on('token-defeated', (payload) => {
      defeatedPayloads.push(payload);
    });

    const store = useEngineStore.getState();
    store.loadStaticEntity({
      id: 'tok-guard-1',
      name: 'Syndicate Guard',
      base_hp: 15,
      base_health: 15,
      base_vitality: 10,
      tech_level: 3,
      armor_dr: 2,
      speed_ft: 30,
      size_modifier: 0,
      is_persona: false,
    });

    // Lethal 20 dmg takes HP 15 -> 0
    store.applyDamage('tok-guard-1', { amount: 20, isLethal: true });
    expect(defeatedPayloads).toHaveLength(1);
    expect(defeatedPayloads[0].tokenId).toBe('tok-guard-1');

    // Subsequent damage while already at 0 HP must NOT re-emit
    store.applyDamage('tok-guard-1', { amount: 5, isLethal: true });
    expect(defeatedPayloads).toHaveLength(1);

    off();
  });
});
