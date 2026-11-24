/**
 * @file adeProUpgrades.test.jsx
 * @description Phase 14 Vitest + React Testing Library integration tests for Pro-Level ADE upgrades:
 *   1. CommandPaletteModal fuzzy search + Enter execution
 *   2. WeaverSlashCommandMenu block selection + statblock target injection
 *   3. CronicleCalendarTab stardate rendering + advancing days & logging events
 *   4. TheaterSceneViewport backdrop + speaker spotlight toggle
 *   5. StageAudioMixerDrawer 3-bus volume sliders & mute toggle
 *   6. StageChatRollFeed visibility mode (public / whisper_gm / blind_gm) & roll card damage/heal actions
 *   7. TokenFramerPanel bezel style switching & WebP export trigger
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn()
  }
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test-architect-1' } })
}));

vi.mock('../../../services/adeMediaStorageService.js', () => ({
  uploadAdeMediaAsset: vi.fn(async () => ({ url: 'https://storage.example/audio/track.mp3', offloaded: true }))
}));

import CommandPaletteModal from '../StoryModule/CommandPaletteModal';
import WeaverSlashCommandMenu from '../StoryModule/workspaces/weaver/WeaverSlashCommandMenu';
import CronicleCalendarTab from '../../../components/StoryFoundry/Cronicle/tabs/CronicleCalendarTab';
import { TheaterSceneViewport } from '../../../components/VTT/stage/TheaterSceneViewport';
import { StageAudioMixerDrawer } from '../../../components/VTT/stage/StageAudioMixerDrawer';
import { StageChatRollFeed } from '../../../components/VTT/stage/StageChatRollFeed';
import { TokenFramerPanel } from '../../../components/StoryFoundry/TokenFramerPanel';
import { VttEventBus } from '../../../utils/vttEventBus';
import { useEngineStore } from '../../../engine/state/VolatileSharder.ts';

describe('ADE Pro-Level Upgrades UI Suite (Phases 10–14)', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('1. CommandPaletteModal filters fuzzily and runs selected command on Enter', () => {
    const onSelectScenario = vi.fn();
    const onClose = vi.fn();

    render(
      <CommandPaletteModal
        isOpen={true}
        onClose={onClose}
        universeState={{
          scenarios: [
            { id: 'sc_1', title: 'Orbital Heist', summary: 'Steal quantum core' },
            { id: 'sc_2', title: 'Subsea Ruins', summary: 'Abyssal salvage' }
          ],
          maps: []
        }}
        elementsCatalog={[
          { id: 'el_1', title: 'Commander Vane', type: 'Persona' }
        ]}
        onSelectScenario={onSelectScenario}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Jump to Scenario/i);
    fireEvent.change(searchInput, { target: { value: 'Orbital Heist' } });

    expect(screen.getByText('Orbital Heist')).toBeInTheDocument();
    expect(screen.queryByText('Subsea Ruins')).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog', { name: 'ADE Command Palette' }), { key: 'Enter' });
    expect(onSelectScenario).toHaveBeenCalledWith('sc_1');
    expect(onClose).toHaveBeenCalled();
  });

  it('2. WeaverSlashCommandMenu inserts semantic Read-Aloud & GM Secret blocks cleanly', () => {
    const onInsertBlockHtml = vi.fn();
    const onClose = vi.fn();

    render(
      <WeaverSlashCommandMenu
        isOpen={true}
        onClose={onClose}
        elementsCatalog={[
          { id: 'el_p1', title: 'Shock Trooper', type: 'Persona', fields: { vitality: 28, health: 30, dr: 5 } }
        ]}
        onInsertBlockHtml={onInsertBlockHtml}
      />
    );

    fireEvent.click(screen.getByText('GM Secret Callout'));
    expect(onInsertBlockHtml).toHaveBeenCalledWith(
      expect.stringContaining('ade-gm-secret'),
      'gm_secret'
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('3. CronicleCalendarTab renders sci-fi epoch date, advances days, and logs events', () => {
    const onUpdateCalendar = vi.fn();
    const { rerender } = render(
      <CronicleCalendarTab
        calendarState={null}
        onUpdateCalendar={onUpdateCalendar}
      />
    );

    expect(screen.getByText(/Active Campaign Epoch Date/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /\+1d/i }));
    expect(onUpdateCalendar).toHaveBeenCalledTimes(1);
    const updatedState = onUpdateCalendar.mock.calls[0][0];

    rerender(
      <CronicleCalendarTab
        calendarState={updatedState}
        onUpdateCalendar={onUpdateCalendar}
      />
    );

    const titleInput = screen.getByPlaceholderText(/Event title/i);
    fireEvent.change(titleInput, { target: { value: 'Jump Gate Ignition' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Event/i }));

    expect(onUpdateCalendar).toHaveBeenCalledTimes(2);
    expect(onUpdateCalendar.mock.calls[1][0].events[0].title).toBe('Jump Gate Ignition');
  });

  it('4. TheaterSceneViewport renders scene read-aloud box and toggles speaker spotlight', () => {
    const onSwitchMode = vi.fn();
    render(
      <TheaterSceneViewport
        currentMap={{ id: 'm1', title: 'Bridge Deck', backgroundUrl: 'https://example.com/bridge.png' }}
        activeScenario={{
          title: 'Bridge Confrontation',
          fields: { readAloud: 'Red klaxons bathe the command bridge in crimson light.' }
        }}
        tokens={[
          { id: 'tok_1', name: 'Captain Kael', archetype: 'Commander', is_persona: true }
        ]}
        onSwitchMode={onSwitchMode}
      />
    );

    expect(screen.getByText(/Red klaxons bathe the command bridge/i)).toBeInTheDocument();
    const speakerBtn = screen.getByRole('button', { name: /Captain Kael/i });
    fireEvent.click(speakerBtn);
    expect(speakerBtn.className).toContain('border-cyan-400');

    fireEvent.click(screen.getByRole('button', { name: /Return to 2D Grid/i }));
    expect(onSwitchMode).toHaveBeenCalledWith('2d');
  });

  it('5. StageAudioMixerDrawer adjusts 3-bus volumes & mute toggles', () => {
    render(<StageAudioMixerDrawer isOpen={true} onClose={vi.fn()} />);

    const musicSlider = screen.getByLabelText('Music Bus Volume');
    expect(musicSlider).toBeInTheDocument();
    expect(screen.getByLabelText('Ambient Bed Volume')).toBeInTheDocument();
    expect(screen.getByLabelText('Sound FX Volume')).toBeInTheDocument();

    fireEvent.change(musicSlider, { target: { value: '0.4' } });
    expect(musicSlider.value).toBe('0.4');

    const muteButtons = screen.getAllByTitle('Mute bus');
    fireEvent.click(muteButtons[0]);
    expect(screen.getByTitle('Unmute bus')).toBeInTheDocument();
  });

  it('6. StageChatRollFeed switches visibility and emits roll / applies damage & heal actions', () => {
    const applyDamageMock = vi.spyOn(useEngineStore.getState(), 'applyDamage').mockImplementation(() => {});
    const healHPMock = vi.spyOn(useEngineStore.getState(), 'healHP').mockImplementation(() => {});

    render(
      <StageChatRollFeed
        selectedToken={{ id: 'tok_attacker', name: 'Vex', saves: { reflex: 3 } }}
        targetToken={{ id: 'tok_target', name: 'Drone-9', saves: { reflex: 2 } }}
        userRole="architect"
      />
    );

    const visibilitySelect = screen.getByLabelText('Roll Visibility');
    fireEvent.change(visibilitySelect, { target: { value: 'whisper_gm' } });
    expect(visibilitySelect.value).toBe('whisper_gm');

    // Emit interactive combat card with damagePayload
    act(() => {
      VttEventBus.emit('stage-chat-card', {
        id: 'card_test_1',
        timestamp: new Date().toISOString(),
        sender: 'Vex',
        visibility: 'public',
        kind: 'damage',
        title: 'Plasma Bolt Strike',
        body: 'Rolled 14 HP Plasma Damage vs Drone-9',
        damagePayload: {
          targetTokenId: 'tok_target',
          rawDamage: 14,
          netDamage: 14,
          isLethal: true,
          saveCr: 15
        }
      });
    });

    expect(screen.getByText('Plasma Bolt Strike')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Full/i }));
    expect(applyDamageMock).toHaveBeenCalledWith('tok_target', { amount: 14, isLethal: true });

    fireEvent.click(screen.getByRole('button', { name: /Heal/i }));
    expect(healHPMock).toHaveBeenCalledWith('tok_target', 14);

    applyDamageMock.mockRestore();
    healHPMock.mockRestore();
  });

  it('7. TokenFramerPanel switches ring styles and triggers framed token export', () => {
    const onExportToken = vi.fn();
    render(
      <TokenFramerPanel
        tokenLabel="Vance"
        onExportToken={onExportToken}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Hex Tactical' }));
    fireEvent.click(screen.getByRole('button', { name: /Export Framed Token \(WebP\)/i }));

    expect(onExportToken).toHaveBeenCalledTimes(1);
    expect(onExportToken.mock.calls[0][0]).toMatch(/^data:image\//);
  });
});
