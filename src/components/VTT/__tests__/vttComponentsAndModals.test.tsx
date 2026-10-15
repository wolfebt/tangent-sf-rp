import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { WidgetErrorBoundary } from '../../../engine/ui/WidgetErrorBoundary';
import { ContextActionBar } from '../../../engine/ui/widgets/ContextActionBar';
import { A11yStageFeed } from '../A11yStageFeed';
import { PersonaLogModal } from '../PersonaLogModal';
import { useEngineStore } from '../../../engine/state/VolatileSharder';
import { PersonaLogService, ACTION_TYPES } from '../../../services/personaLogService';

describe('VTT React Components & Modal Workflows (Vitest + React Testing Library)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('WidgetErrorBoundary isolates dockable widget crashes and recovers on Reinitialize Subsystem', () => {
    const spyError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onReset = vi.fn();

    const FaultyWidget: React.FC<{ shouldCrash: boolean }> = ({ shouldCrash }) => {
      if (shouldCrash) {
        throw new Error('Shader uniform buffer overflow');
      }
      return <div data-testid="healthy-widget">Radar Online</div>;
    };

    const Harness: React.FC = () => {
      const [crash, setCrash] = useState(true);
      return (
        <WidgetErrorBoundary
          widgetId="tactical-radar"
          widgetTitle="Tactical Radar"
          onReset={() => {
            setCrash(false);
            onReset();
          }}
        >
          <FaultyWidget shouldCrash={crash} />
        </WidgetErrorBoundary>
      );
    };

    render(<Harness />);

    expect(screen.getByText(/Widget Subsystem Fault: Tactical Radar/i)).toBeInTheDocument();
    expect(screen.getByText(/Shader uniform buffer overflow/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Reinitialize Subsystem/i));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('healthy-widget')).toHaveTextContent('Radar Online');
    spyError.mockRestore();
  });

  it('ContextActionBar executes weapon strikes with MAP progression, Called Shots, Overcharge, and Active Defense', () => {
    const executedMacros: Array<{ macro: string; actionName: string }> = [];

    render(
      <ContextActionBar
        skillRank={6}
        activeTokenName="Vance"
        onExecuteRollMacro={(macro, actionName) => executedMacros.push({ macro, actionName })}
      />
    );

    expect(screen.getByText(/TACTICAL ACTION BAR • Vance/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Attacks\/rnd/i)).toBeInTheDocument();

    // Select Laser Rifle TL4, Head Called Shot (-4), and Overcharge (+1d6)
    fireEvent.click(screen.getByText('Laser Rifle TL4'));
    fireEvent.click(screen.getByText('head'));
    fireEvent.click(screen.getByText('Overcharge (+1d6)'));

    // Execute Strike #1 (0 MAP)
    fireEvent.click(screen.getByText(/Strike #1 \(0 MAP\)/i));
    expect(executedMacros.length).toBe(1);
    expect(executedMacros[0].actionName).toBe('Laser Rifle TL4');
    expect(executedMacros[0].macro).toContain('at [HEAD] (-4 Strike)');
    expect(executedMacros[0].macro).toContain('+1d6[OVERCHARGE]');

    // Attack counter advances to Strike #2 (-5 MAP)
    expect(screen.getByText(/Strike #2 \(-5 MAP\)/i)).toBeInTheDocument();

    // Execute Dodge reaction (#1 -> 0 penalty, then #2 -> -5 penalty)
    fireEvent.click(screen.getByText(/Dodge \(0\)/i));
    expect(executedMacros[1].actionName).toBe('Dodge');
    expect(screen.getByText(/Dodge \(-5\)/i)).toBeInTheDocument();

    // Reset Round restores Strike #1 and Dodge (0)
    fireEvent.click(screen.getByText('Reset Round'));
    expect(screen.getByText(/Strike #1 \(0 MAP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Dodge \(0\)/i)).toBeInTheDocument();
  });

  it('A11yStageFeed renders ARIA live announcements and deployed operative table', () => {
    const engine = useEngineStore.getState();
    engine.loadStaticEntity({
      id: 'tok-vance',
      name: 'Commander Vance',
      base_hp: 30,
      tech_level: 4,
      armor_dr: 5,
      size_modifier: 0
    });
    engine.updatePosition('tok-vance', 150, 250, 0);
    engine.toggleCondition('tok-vance', 'Overwatch');

    render(<A11yStageFeed mapName="Orbital Dock 9" />);

    expect(screen.getByText(/Current Tactical Operatives on Orbital Dock 9 \(1 deployed\)/i)).toBeInTheDocument();
    expect(screen.getByText('Commander Vance')).toBeInTheDocument();
    expect(screen.getByText('Overwatch')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new CustomEvent('tangent-tactical-event', {
          detail: { type: 'stage-token-moved', name: 'Commander Vance', x: 200, y: 300 }
        })
      );
    });

    expect(
      screen.getByText('Commander Vance repositioned to grid coordinates X 200, Y 300.')
    ).toBeInTheDocument();
  });

  it('PersonaLogModal renders accessible dialog, filters telemetry stream, and invokes onClose', () => {
    vi.spyOn(PersonaLogService, 'subscribeToPersonaLog').mockImplementation((_id, callback) => {
      callback([
        {
          id: 'log-1',
          actionType: ACTION_TYPES.SKILL_CHECK,
          senderHandle: 'Vance',
          summary: 'Rolled Stealth Check: 24 (Critical Success)'
        },
        {
          id: 'log-2',
          actionType: ACTION_TYPES.VITALS_CHANGE,
          senderHandle: 'GM',
          summary: 'Applied -8 Plasma Damage'
        }
      ]);
      return () => {};
    });

    const onClose = vi.fn();
    render(
      <PersonaLogModal
        isOpen={true}
        onClose={onClose}
        personaId="persona-vance-001"
        personaName="Operative Vance"
        species="Human"
        archetype="Infiltrator"
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Default filter is 'checks' -> shows skill check, hides vitals change
    expect(screen.getByText(/Rolled Stealth Check: 24/i)).toBeInTheDocument();
    expect(screen.queryByText(/Applied -8 Plasma Damage/i)).not.toBeInTheDocument();

    // Switch to VITALS & STATUS filter
    fireEvent.click(screen.getByText('VITALS & STATUS'));
    expect(screen.getByText(/Applied -8 Plasma Damage/i)).toBeInTheDocument();

    // Switch to ALL filter
    fireEvent.click(screen.getByText('ALL (2)'));
    expect(screen.getByText(/Rolled Stealth Check: 24/i)).toBeInTheDocument();
    expect(screen.getByText(/Applied -8 Plasma Damage/i)).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTitle('Close Telemetry Log'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
