/**
 * @file vttControllers.test.tsx
 * @description Vitest + React Testing Library suite for VTT controller hooks:
 * - useDesignModeController (bi-directional sync with useUILayoutStore)
 * - useCombatController (combat log, stance/weapon/limb selection, turn progression, and dice expression evaluation)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDesignModeController } from '../useDesignModeController';
import { useCombatController } from '../useCombatController';
import { useUILayoutStore } from '../../store/uiLayoutStore';
import { BVHBuilder } from '../../../../engine/index';

describe('VTT Controller Hooks — useDesignModeController & useCombatController', () => {
  beforeEach(() => {
    useUILayoutStore.setState({
      userRole: 'architect',
      activeArchitectTool: 'select',
      selectedWallType: 'solid',
      doorLockDc: 15,
      selectedTerrain: 'difficult',
      terrainBrushWidth: 70
    });
  });

  it('useDesignModeController syncs activeArchitectTool and sub-options from useUILayoutStore', () => {
    const { result } = renderHook(() => useDesignModeController());

    expect(result.current.activeDesignTool).toBe('select');
    expect(result.current.wallConstructionMode).toBe('single');

    // Update store tool to wall and wall type to door
    act(() => {
      useUILayoutStore.getState().setActiveArchitectTool('wall');
      useUILayoutStore.getState().setSelectedWallType('door');
      useUILayoutStore.getState().setDoorLockDc(22);
    });

    expect(result.current.isDesignModeActive).toBe(true);
    expect(result.current.activeDesignTool).toBe('wall');
    expect(result.current.selectedWallType).toBe('door');
    expect(result.current.doorLockDc).toBe(22);
  });

  it('useCombatController manages turn progression, round escalation, initiative rolling, and custom dice', () => {
    const setSelectedTokenId = vi.fn();
    const tokens = [
      { id: 'tok-alpha', name: 'Vance', x: 100, y: 100, tech_level: 4, armor_dr: 8 },
      { id: 'tok-bravo', name: 'Raider', x: 135, y: 100, tech_level: 2, armor_dr: 4 }
    ];
    const bvhBuilderRef = { current: new BVHBuilder() };

    const { result } = renderHook(() =>
      useCombatController({
        selectedToken: tokens[0],
        targetToken: tokens[1],
        tokens,
        bvhBuilderRef: bvhBuilderRef as any,
        isSimulationPaused: false,
        selectedTokenId: 'tok-alpha',
        setSelectedTokenId
      })
    );

    expect(result.current.roundNumber).toBe(1);
    expect(result.current.currentTurnIndex).toBe(0);
    expect(result.current.targetedLimb).toBe('torso');
    expect(result.current.attackWeapon).toBe('plasma');

    // Roll initiative for all combatants
    act(() => {
      result.current.handleRollAllInitiative();
    });
    expect(Object.keys(result.current.initiativeScores)).toEqual(['tok-alpha', 'tok-bravo']);
    expect(result.current.combatLog[0]).toMatch(/\[INITIATIVE\] Roster initiative rolled for 2 combatants/);

    // Advance turn to second combatant (index 1)
    act(() => {
      result.current.handleNextTurn();
    });
    expect(result.current.currentTurnIndex).toBe(1);
    expect(result.current.roundNumber).toBe(1);
    expect(setSelectedTokenId).toHaveBeenCalledWith('tok-bravo');

    // Advance turn back to index 0 -> escalates to Round 2
    act(() => {
      result.current.handleNextTurn();
    });
    expect(result.current.currentTurnIndex).toBe(0);
    expect(result.current.roundNumber).toBe(2);
    expect(result.current.combatLog[0]).toMatch(/\[ROUND 2\] Initiated/);

    // Evaluate custom dice expression
    act(() => {
      result.current.setCustomDiceExpr('2d10 + 5');
    });
    act(() => {
      result.current.handleRollCustomDice();
    });
    expect(result.current.combatLog[0]).toMatch(/\[DICE ROLL\] 2d10 \+ 5 => TOTAL:/);

    // Execute live combat strike
    act(() => {
      result.current.handleExecuteCombatStrike();
    });
    expect(result.current.combatLog.some(log => /\[COMBAT (HIT|MISS|BLOCKED)\]/.test(log))).toBe(true);
  });
});
