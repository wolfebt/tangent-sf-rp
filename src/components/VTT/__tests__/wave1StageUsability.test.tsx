import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { StageChatRollFeed, sanitizeCardForRole } from '../stage/StageChatRollFeed';
import { StageTurnTrackerDrawer } from '../stage/StageTurnTrackerDrawer';
import { TokenContextualPill } from '../stage/TokenContextualPill';
import { useStageHotkeys } from '../hooks/useStageHotkeys';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { useEngineStore } from '../../../engine/state/VolatileSharder';
import { VttEventBus } from '../../../utils/vttEventBus';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';

describe('Wave 1 Stage VTT Usability & Role Isolation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useEngineStore.getState().clearAllEntities();
    useUILayoutStore.setState({
      userRole: 'architect',
      stageChatCards: [],
      unreadChatCardCount: 0,
      roundNumber: 1,
      currentTurnIndex: 0,
      initiativeScores: {},
      isTurnTrackerOpen: false,
      isDesignModeActive: false
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('StageChatRollFeed persistence, arbitrary dice, chat cards & redaction', () => {
    it('evaluates arbitrary dice formulas, sends plain-text chat cards, ingests chat-message events, and persists across remounts', () => {
      const { unmount } = render(<StageChatRollFeed userRole="architect" />);

      const input = screen.getByPlaceholderText(/2d10 \+ 4, 1d6\+2, or chat message/i) as HTMLInputElement;
      const sendBtn = screen.getByRole('button', { name: /Send/i });

      // 1. Arbitrary dice expression (non-2d10)
      fireEvent.change(input, { target: { value: '1d6+2' } });
      fireEvent.click(sendBtn);
      expect(screen.getByText('Roll (1d6+2)')).toBeInTheDocument();

      // 2. Plain-text narration card clears input
      fireEvent.change(input, { target: { value: 'Squad advancing to airlock' } });
      fireEvent.click(sendBtn);
      expect(screen.getByText('Squad advancing to airlock')).toBeInTheDocument();
      expect(input.value).toBe('');

      // 3. Unmount and remount — history remains persisted in uiLayoutStore
      unmount();
      render(<StageChatRollFeed userRole="architect" />);
      expect(screen.getByText('Roll (1d6+2)')).toBeInTheDocument();
      expect(screen.getByText('Squad advancing to airlock')).toBeInTheDocument();

      // 4. EventBus chat-message ingestion
      act(() => {
        VttEventBus.emit('chat-message', {
          sender: 'Vance',
          text: 'Breaching inner bulkhead!',
          type: 'tactical',
          timestamp: new Date().toISOString()
        });
      });
      expect(screen.getByText('Breaching inner bulkhead!')).toBeInTheDocument();
    });

    it('sanitizes blind_gm and remote whisper_gm cards for operatives', () => {
      const blindCard = {
        id: 'c_blind',
        timestamp: new Date().toISOString(),
        sender: 'Architect',
        visibility: 'blind_gm' as const,
        kind: 'dice' as const,
        title: 'Secret Stealth',
        body: 'Rolled 19 vs CR 12',
        diceBreakdown: { d1: 9, d2: 8, modifier: 2, total: 19, dcOrCr: 12, outcome: 'SUCCESS' }
      };
      const whisperCard = {
        id: 'c_whisper',
        timestamp: new Date().toISOString(),
        sender: 'Architect',
        visibility: 'whisper_gm' as const,
        kind: 'dice' as const,
        title: 'GM Whisper',
        body: 'Private trap DC 18',
        remote: true
      };

      const sanitizedBlind = sanitizeCardForRole(blindCard, false);
      expect(sanitizedBlind).not.toBeNull();
      expect(sanitizedBlind?.title).toBe('[BLIND GM ROLL]');
      expect(sanitizedBlind?.diceBreakdown).toBeUndefined();

      expect(sanitizeCardForRole(whisperCard, false)).toBeNull();
      expect(sanitizeCardForRole(blindCard, true)?.title).toBe('Secret Stealth');
    });
  });

  describe('StageTurnTrackerDrawer initiative, turn progression, DoT ticks & hidden token filtering', () => {
    it('rolls initiative, advances turns across round wrap with active effect tick, and filters hidden tokens for operatives', () => {
      const eng = useEngineStore.getState();
      eng.loadStaticEntity({
        id: 'tok-a',
        name: 'Alpha',
        base_hp: 30,
        base_vitality: 30,
        base_health: 30,
        initiative_mod: 3
      } as any);
      eng.loadStaticEntity({
        id: 'tok-h',
        name: 'Ambush Drone',
        base_hp: 25,
        base_vitality: 25,
        base_health: 25,
        is_hidden: true
      } as any);
      eng.setHidden('tok-h', true);
      eng.addActiveEffect('tok-a', {
        id: 'eff-burn',
        name: 'Plasma Burn',
        remainingRounds: 2,
        tickDamage: 3,
        modifierBonus: 0
      });

      const onSelectToken = vi.fn();
      const tokens = [
        { ...useEngineStore.getState().staticData['tok-a'], ...useEngineStore.getState().ephemeralData['tok-a'] },
        { ...useEngineStore.getState().staticData['tok-h'], ...useEngineStore.getState().ephemeralData['tok-h'] }
      ];

      const { rerender } = render(
        <StageTurnTrackerDrawer
          isOpen={true}
          onClose={vi.fn()}
          tokens={tokens}
          selectedTokenId="tok-a"
          onSelectToken={onSelectToken}
          isArchitectRole={true}
        />
      );

      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Ambush Drone')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Roll Init/i }));
      const scoresAfterRoll = useUILayoutStore.getState().initiativeScores;
      expect(scoresAfterRoll['tok-a']).toBeTypeOf('number');
      expect(scoresAfterRoll['tok-h']).toBeTypeOf('number');

      act(() => {
        useUILayoutStore.getState().setTurnState({
          roundNumber: 1,
          currentTurnIndex: 0,
          initiativeScores: { 'tok-a': 20, 'tok-h': 10 }
        });
      });

      fireEvent.click(screen.getByRole('button', { name: /Next Turn/i }));
      expect(useUILayoutStore.getState().currentTurnIndex).toBe(1);
      expect(useUILayoutStore.getState().roundNumber).toBe(1);

      fireEvent.click(screen.getByRole('button', { name: /Next Turn/i }));
      expect(useUILayoutStore.getState().currentTurnIndex).toBe(0);
      expect(useUILayoutStore.getState().roundNumber).toBe(2);
      expect(useEngineStore.getState().ephemeralData['tok-a']?.current_vitality).toBe(27);
      expect(useEngineStore.getState().ephemeralData['tok-a']?.current_health).toBe(30);

      rerender(
        <StageTurnTrackerDrawer
          isOpen={true}
          onClose={vi.fn()}
          tokens={tokens}
          selectedTokenId="tok-a"
          onSelectToken={onSelectToken}
          isArchitectRole={false}
        />
      );
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Ambush Drone')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Roll Init/i })).not.toBeInTheDocument();
    });
  });

  describe('TokenContextualPill operative lock & stealth vitals broadcast', () => {
    it('hides pill when hidden token is selected by operative and locks mutation controls on visible unowned tokens', () => {
      const sync = getVttMultiplayerSync();
      vi.spyOn(sync, 'canMoveToken').mockReturnValue(false);

      const eng = useEngineStore.getState();
      eng.loadStaticEntity({ id: 'tok-enemy', name: 'SecDrone', base_hp: 30, base_vitality: 30 } as any);
      eng.setHidden('tok-enemy', true);
      eng.setSelection('tok-enemy', true);

      const { container, rerender } = render(<TokenContextualPill isArchitectRole={false} />);
      expect(container.firstChild).toBeNull();

      act(() => {
        useEngineStore.getState().setHidden('tok-enemy', false);
      });
      rerender(<TokenContextualPill isArchitectRole={false} />);

      expect(screen.getByText('SecDrone')).toBeInTheDocument();
      expect(screen.getByText('READ-ONLY')).toBeInTheDocument();
      expect(screen.queryByTitle(/Apply -5/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Toggle token visibility' })).not.toBeInTheDocument();
    });

    it('broadcasts is_hidden state when Architect toggles visibility eye button', () => {
      const sync = getVttMultiplayerSync();
      const broadcastSpy = vi.spyOn(sync, 'broadcastTokenVitals').mockImplementation(() => {});

      const eng = useEngineStore.getState();
      eng.loadStaticEntity({ id: 'tok-gm', name: 'Operative X', base_hp: 30, base_vitality: 30 } as any);
      eng.setSelection('tok-gm', true);

      render(<TokenContextualPill isArchitectRole={true} />);
      const eyeBtn = screen.getByRole('button', { name: 'Toggle token visibility' });
      fireEvent.click(eyeBtn);

      expect(useEngineStore.getState().ephemeralData['tok-gm']?.is_hidden).toBe(true);
      expect(broadcastSpy).toHaveBeenCalledWith(
        'tok-gm',
        expect.objectContaining({ is_hidden: true })
      );
    });
  });

  describe('useStageHotkeys operative restrictions, Escape deselect & input guards', () => {
    const HotkeyHarness: React.FC<{
      isArchitectRole: boolean;
      selectedTokenId: string | null;
      selectedAssetIds?: string[];
      onDelete?: () => void;
      onToggleDesign?: () => void;
      onSetTool?: (tool: any) => void;
      onClearToken?: () => void;
    }> = ({
      isArchitectRole,
      selectedTokenId,
      selectedAssetIds = ['wall-1'],
      onDelete = vi.fn(),
      onToggleDesign = vi.fn(),
      onSetTool = vi.fn(),
      onClearToken = vi.fn()
    }) => {
      useStageHotkeys({
        selectedAssetIds,
        gridSnap: true,
        isDesignModeActive: true,
        isArchitectRole,
        selectedTokenId,
        onClearTokenSelection: onClearToken,
        wallConstructionMode: 'single',
        wallChainPoints: [],
        setWallChainPoints: vi.fn(),
        setWallDrawStart: vi.fn(),
        setWallDrawCurrent: vi.fn(),
        setIsDrawingToolActive: vi.fn(),
        setCombatLog: vi.fn(),
        handleBatchDelete: onDelete,
        handleBatchDuplicate: vi.fn(),
        handleBatchNudge: vi.fn(),
        handleDeselectAll: vi.fn(),
        handleToggleDesignMode: onToggleDesign,
        toggleGridSnap: vi.fn(),
        setActiveDesignTool: onSetTool
      });

      return (
        <div>
          <input aria-label="Text Input" />
          <div aria-label="Editable Box" contentEditable={true} suppressContentEditableWarning={true} />
        </div>
      );
    };

    it('blocks Architect hotkeys for operatives while still allowing Escape to deselect selectedTokenId', () => {
      const onDelete = vi.fn();
      const onToggleDesign = vi.fn();
      const onSetTool = vi.fn();
      const onClearToken = vi.fn();

      render(
        <HotkeyHarness
          isArchitectRole={false}
          selectedTokenId="tok-1"
          selectedAssetIds={[]}
          onDelete={onDelete}
          onToggleDesign={onToggleDesign}
          onSetTool={onSetTool}
          onClearToken={onClearToken}
        />
      );

      fireEvent.keyDown(window, { key: 'Delete' });
      fireEvent.keyDown(window, { key: 'm' });
      fireEvent.keyDown(window, { key: 'w' });
      fireEvent.keyDown(window, { key: 'f' });

      expect(onDelete).not.toHaveBeenCalled();
      expect(onToggleDesign).not.toHaveBeenCalled();
      expect(onSetTool).not.toHaveBeenCalled();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClearToken).toHaveBeenCalledTimes(1);
    });

    it('suppresses hotkeys when typing in INPUT or contentEditable elements', () => {
      const onToggleDesign = vi.fn();
      render(
        <HotkeyHarness
          isArchitectRole={true}
          selectedTokenId={null}
          selectedAssetIds={[]}
          onToggleDesign={onToggleDesign}
        />
      );

      const textInput = screen.getByLabelText('Text Input');
      fireEvent.keyDown(textInput, { key: 'm' });
      expect(onToggleDesign).not.toHaveBeenCalled();

      const editable = screen.getByLabelText('Editable Box');
      fireEvent.keyDown(editable, { key: 'm' });
      expect(onToggleDesign).not.toHaveBeenCalled();

      fireEvent.keyDown(window, { key: 'm' });
      expect(onToggleDesign).toHaveBeenCalledTimes(1);
    });
  });
});
