/**
 * @file adePhase7Integration.test.jsx
 * @description Phase 7 React UI stabilization suite covering:
 *   1. SpriteSheetCutterModal safe closed -> open toggle without hook-order crashes
 *   2. DraggablePanel React z-index focus without DOM reparenting + pointerup localStorage persistence
 *   3. OperativeCockpitRail Pinnacle 6 reaction slots, Optics (-5) called shot, and canonical 2d10 strike
 */

import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const { mockPlayCriticalChime, mockPlayCombatHit } = vi.hoisted(() => ({
  mockPlayCriticalChime: vi.fn(),
  mockPlayCombatHit: vi.fn()
}));

vi.mock('../../../services/audioService', () => ({
  default: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: mockPlayCriticalChime,
    playCombatHit: mockPlayCombatHit
  },
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: mockPlayCriticalChime,
    playCombatHit: mockPlayCombatHit
  }
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({ savedPersonas: [], characterData: null })
}));

vi.mock('../../../components/VTT/store/uiLayoutStore', () => ({
  useUILayoutStore: () => ({ isLeftWideMode: false, toggleLeftWideMode: vi.fn() })
}));

vi.mock('../../../components/Folio/views/TacticalPlayView', () => ({
  TacticalPlayView: () => <div data-testid="mock-tactical-play-view" />
}));

vi.mock('../MapMaker/map/ArchitectAssetCockpit', () => ({
  default: () => <div data-testid="mock-architect-asset-cockpit" />
}));

import { SpriteSheetCutterModal } from '../../../components/VTT/ingestion/SpriteSheetCutterModal';
import DraggablePanel from '../MapMaker/map/DraggablePanel.jsx';
import OperativeCockpitRail from '../MapMaker/map/OperativeCockpitRail.jsx';

describe('ADE Phase 7 P0 UI Stabilization Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('SpriteSheetCutterModal mounts closed and toggles open without hook-order errors', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen((p) => !p)}>
            Toggle Cutter
          </button>
          <SpriteSheetCutterModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onBatchIngested={vi.fn()}
          />
        </div>
      );
    };

    render(<Harness />);
    expect(screen.queryByText(/Interactive Sprite Sheet & Tile Slicer/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Toggle Cutter/i }));
    expect(screen.getByText(/Interactive Sprite Sheet & Tile Slicer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Toggle Cutter/i }));
    expect(screen.queryByText(/Interactive Sprite Sheet & Tile Slicer/i)).not.toBeInTheDocument();
  });

  it('DraggablePanel brings focused panel forward via React zIndex state and persists coordinates on pointerup', () => {
    render(
      <div data-testid="panel-host">
        <DraggablePanel id="p1" defaultPosition={{ x: 10, y: 20 }}>
          <div className="drag-handle">Header 1</div>
        </DraggablePanel>
        <DraggablePanel id="p2" defaultPosition={{ x: 30, y: 40 }}>
          <div className="drag-handle">Header 2</div>
        </DraggablePanel>
      </div>
    );

    const header1 = screen.getByText('Header 1');
    const panel1 = header1.parentElement;
    const panel2 = screen.getByText('Header 2').parentElement;
    const initialZ1 = Number(panel1.style.zIndex);
    const initialZ2 = Number(panel2.style.zIndex);
    expect(initialZ2).toBeGreaterThan(initialZ1);

    fireEvent.pointerDown(header1, { clientX: 50, clientY: 50 });
    expect(Number(panel1.style.zIndex)).toBeGreaterThan(initialZ2);

    fireEvent.pointerMove(window, { clientX: 80, clientY: 90 });
    fireEvent.pointerUp(window);

    const stored = JSON.parse(localStorage.getItem('draggable_panel_p1'));
    expect(stored).toEqual({ x: 40, y: 60 });
  });

  it('OperativeCockpitRail renders Pinnacle 6 reactions, Optics (-5) called shot, and executes canonical 2d10 strike', () => {
    const attacker = {
      id: 'op_pinnacle',
      label: 'Vex',
      name: 'Vex',
      armor_dr: 4,
      stamina_dr: 3,
      defense: 18,
      characterData: {
        id: 'op_pinnacle',
        'char-name': 'Vex',
        'skill-defense-rank': 28,
        'skill-firearms-long-arms-rank': 12
      }
    };
    const enemy = {
      id: 'target_1',
      label: 'Droid',
      name: 'Droid',
      type: 'hostile',
      defense: 15,
      armor_dr: 2,
      stamina_dr: 0
    };

    render(
      <OperativeCockpitRail
        tokens={[attacker, enemy]}
        activeTokenId="op_pinnacle"
        targetToken={enemy}
        vttRole="operative"
        onTriggerAttack={vi.fn()}
        onTriggerFloatingText={vi.fn()}
        onBroadcastMessage={vi.fn()}
      />
    );

    // Switch to full Action Deck view to inspect reactions, called shots, and BASTION strike button
    const deckModeBtn = screen.getByTitle(/Streamlined Tactical Action Deck/i);
    fireEvent.click(deckModeBtn);

    expect(screen.getByText(/6th Reaction \(-25\)/i)).toBeInTheDocument();
    const calledShotSelect = screen.getByDisplayValue(/Center Mass/i);
    expect(screen.getByRole('option', { name: /Optics.*Sensors/i })).toBeInTheDocument();
    fireEvent.change(calledShotSelect, { target: { value: 'optics' } });

    fireEvent.click(screen.getByRole('button', { name: /ADV \(3d10kh2\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /Roll BASTION Strike \(2d10\)/i }));

    expect(screen.getByText(/vs DEF 15/i)).toBeInTheDocument();
  });
});
