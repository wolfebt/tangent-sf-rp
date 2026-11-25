/**
 * @file waveCP2Features.test.jsx
 * @description Wave C (P2) React UI Integration Suite:
 *   1. StageTurnTrackerDrawer "Run AI Turn" invokes unitBehaviorService.decideAutonomousAction and emits VTT card/decision events
 *   2. Stage3CoreReality renders collapsible Extended Folio Dossier Fields for Persona elements
 *   3. CronicleScratchbookDocTab filters markdown via docSearchQuery input
 *   4. StoryFoundryGuideModal renders unified ADE workspaces and dismisses on Escape
 *   5. ToolbarBreadcrumb renders activeElement.title fallback cleanly
 */

import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  emitMock,
  broadcastCardMock
} = vi.hoisted(() => ({
  emitMock: vi.fn(),
  broadcastCardMock: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('react-quill-new', () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="mock-quill"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}));

vi.mock('../../../services/audioService', () => ({
  default: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() }
}));

vi.mock('../../../utils/vttEventBus', () => ({
  VttEventBus: {
    emit: emitMock,
    on: vi.fn(() => () => {})
  }
}));

vi.mock('../../../services/vttMultiplayerSyncService', () => ({
  getVttMultiplayerSync: () => ({
    broadcastTurnState: vi.fn(),
    broadcastChatCard: broadcastCardMock,
    broadcastTokenVitals: vi.fn()
  })
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => ({ dbData: {} })
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn(),
  useToast: () => ({ toast: vi.fn() })
}));

import { useUILayoutStore } from '../../../components/VTT/store/uiLayoutStore';
import { StageTurnTrackerDrawer } from '../../../components/VTT/stage/StageTurnTrackerDrawer.tsx';
import Stage3CoreReality from '../ElementForge/guided/stages/Stage3CoreReality.jsx';
import CronicleScratchbookDocTab from '../../../components/StoryFoundry/Cronicle/tabs/CronicleScratchbookDocTab.jsx';
import { StoryFoundryGuideModal } from '../../../components/StoryFoundry/StoryFoundryGuideModal.jsx';
import ToolbarBreadcrumb from '../StoryModule/toolbar/ToolbarBreadcrumb.jsx';

describe('Wave C (P2) React UI Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUILayoutStore.getState().setTurnState({
      roundNumber: 1,
      currentTurnIndex: 0,
      initiativeScores: { tok_boss: 20, tok_hero: 12 }
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('1. StageTurnTrackerDrawer executes autonomous FSM decision via Run AI Turn', () => {
    const tokens = [
      {
        id: 'tok_boss',
        name: 'Syndicate Enforcer',
        label: 'Syndicate Enforcer',
        type: 'enemy',
        behaviorProfile: 'sniper',
        x: 100,
        y: 100,
        health: { current: 25, max: 25 }
      },
      {
        id: 'tok_hero',
        name: 'Operative Nova',
        label: 'Operative Nova',
        type: 'hero',
        armorDr: 2,
        x: 320,
        y: 100,
        health: { current: 30, max: 30 }
      }
    ];

    render(
      <StageTurnTrackerDrawer
        isOpen={true}
        onClose={vi.fn()}
        tokens={tokens}
        selectedTokenId="tok_boss"
        onSelectToken={vi.fn()}
        isArchitectRole={true}
      />
    );

    const aiBtn = screen.getByRole('button', { name: /Run AI Turn/i });
    fireEvent.click(aiBtn);

    expect(emitMock).toHaveBeenCalledWith(
      'stage-chat-card',
      expect.objectContaining({
        title: 'AI Turn: Syndicate Enforcer',
        body: expect.stringContaining('AIMED SNIPER SHOT')
      })
    );
    expect(emitMock).toHaveBeenCalledWith(
      'stage-ai-decision',
      expect.objectContaining({
        tokenId: 'tok_boss',
        decision: expect.objectContaining({
          actionType: 'aimed_sniper_shot',
          targetId: 'tok_hero'
        })
      })
    );
    expect(broadcastCardMock).toHaveBeenCalledTimes(1);
  });

  it('2. Stage3CoreReality renders collapsible Extended Folio Dossier Fields for Persona', () => {
    const onChangeField = vi.fn();
    render(
      <Stage3CoreReality
        draft={{
          id: 'per_1',
          type: 'Persona',
          title: 'Captain Vane',
          fields: { currentResidence: 'Station Pier 7' }
        }}
        onChangeField={onChangeField}
        onMergeFields={vi.fn()}
        content=""
        onChangeContent={vi.fn()}
      />
    );

    const toggle = screen.getByRole('button', { name: /Extended Folio Dossier Fields/i });
    fireEvent.click(toggle);

    const residenceArea = screen.getByDisplayValue('Station Pier 7');
    fireEvent.change(residenceArea, { target: { value: 'Drydock Bay 9' } });
    expect(onChangeField).toHaveBeenCalledWith('currentResidence', 'Drydock Bay 9');
  });

  it('3. CronicleScratchbookDocTab filters dossier sections via docSearchQuery input', () => {
    function Harness() {
      const [q, setQ] = useState('');
      return (
        <CronicleScratchbookDocTab
          compiledScratchbookMarkdown={'# Airlock\nReactor pressure nominal\n# Vault\nPlasma keycard hidden'}
          docSearchQuery={q}
          setDocSearchQuery={setQ}
          elementsCount={2}
          scenariosCount={1}
          copiedDoc={false}
          handleCopyScratchbookMarkdown={vi.fn()}
          handleDownloadScratchbook={vi.fn()}
        />
      );
    }

    render(<Harness />);
    expect(screen.getByText(/Reactor pressure nominal/)).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/Search Scratchbook Dossier/i);
    fireEvent.change(searchInput, { target: { value: 'Plasma' } });

    expect(screen.getByText(/Plasma keycard hidden/)).toBeInTheDocument();
    expect(screen.queryByText(/Reactor pressure nominal/)).not.toBeInTheDocument();
  });

  it('4. StoryFoundryGuideModal shows unified ADE workspaces and closes on Escape', () => {
    const onClose = vi.fn();
    render(<StoryFoundryGuideModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText(/Unified ADE Workspaces/i)).toBeInTheDocument();
    expect(screen.getByText(/Visual Story Graph/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('5. ToolbarBreadcrumb renders activeElement.title fallback cleanly', () => {
    render(
      <ToolbarBreadcrumb
        activeView="elements"
        activeNode={null}
        activeElement={{ id: 'el_1', title: 'Void Lance Prototype' }}
        onSwitchView={vi.fn()}
      />
    );

    expect(screen.getByText('Void Lance Prototype')).toBeInTheDocument();
  });
});
