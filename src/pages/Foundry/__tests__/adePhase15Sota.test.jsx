/**
 * @file adePhase15Sota.test.jsx
 * @description Phase 15 SOTA UI Regression Suite:
 *   1. SelectivePrintModal: RTF export button presence & operatorSafeMode filtering of GM secrets
 *   2. EditElementModal: Canon Linter badge (Canon: N) & Auto-Fix resolution
 *   3. CronicleCalendarTab: Custom Era / Month / Recurring Holiday configuration
 *   4. StageChatRollFeed: Operative role masks blind-GM cards & suppresses remote GM whispers
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  showToastMock,
  mockAuthValue,
  mockDbmValue,
  mockFolioValue,
  mockStoryValue,
  mockCampaignValue
} = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  mockAuthValue: { currentUser: { uid: 'test-architect-uid' } },
  mockDbmValue: { dbData: {} },
  mockFolioValue: {
    roster: [],
    personaRoster: [],
    publicPersonas: [],
    publicCatalog: [],
    saveCurrentToRoster: vi.fn(),
    switchRosterCharacter: vi.fn()
  },
  mockStoryValue: {
    deleteSavedElement: vi.fn(),
    elementsCatalog: [],
    universeState: {
      scenarios: [
        { id: 'sc_1', title: 'Orbital Breach', content: 'Enter airlock.' }
      ],
      creativeState: { storyCards: [] },
      customElementTemplates: []
    },
    setUniverseState: vi.fn(),
    setIsDirty: vi.fn(),
    mapsCatalog: [],
    cronicle: { activeDay: 1 },
    updateStory: vi.fn(),
    addGalleryModifier: vi.fn()
  },
  mockCampaignValue: {
    universeState: {
      scenarios: [
        {
          id: 'sc_op',
          title: 'Public Sector',
          summary: 'Public brief',
          content: '<p>Open dock.</p><div class="ade-gm-secret">TOP_SECRET_TRAP</div>',
          fields: {
            gmSecrets: 'SECRET_BOSS_弱点'
          }
        },
        {
          id: 'sc_hidden',
          title: 'GM Only Vault',
          isHidden: true,
          content: 'CLASSIFIED_VAULT'
        }
      ],
      creativeState: { storyCards: [] }
    },
    elementsCatalog: [
      { id: 'el_vis', title: 'Dock Worker', type: 'Persona', fields: { vitality: 20, health: 20 } },
      { id: 'el_hid', title: 'Hidden Assassin', type: 'Persona', isHidden: true, fields: { vitality: 40, health: 40 } }
    ]
  }
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
  default: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playCombatHit: vi.fn()
  },
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn(),
    playCombatHit: vi.fn()
  }
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: showToastMock
}));

vi.mock('../../../utils/confirmationUtils', () => ({
  confirmTypedDeletion: vi.fn(async () => true)
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuthValue
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => mockDbmValue
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => mockFolioValue
}));

vi.mock('../../../context/CampaignContext', () => ({
  formatExportFilename: (name = 'untitled', ext = 'md') => `${name}.${ext}`,
  useStory: () => mockStoryValue,
  useCampaign: () => mockCampaignValue
}));

// Stub heavy modal/guided stage children not under direct test so jsdom renders fast
vi.mock('../../../components/StoryFoundry/ArtistHubModal', () => ({
  ArtistHubModal: () => null
}));
vi.mock('../../../components/StoryFoundry/AimeGuidanceFlyout', () => ({
  AimeGuidanceFlyout: () => null
}));
vi.mock('../../../components/StoryFoundry/AimeGuidanceButton', () => ({
  AimeGuidanceButton: () => null
}));
vi.mock('../../../components/StoryFoundry/GuidedForge/GuidedForgeShell', () => ({
  default: ({ children }) => <div>{children}</div>
}));
vi.mock('../ElementForge/guided/stages/Stage1SparkAndCanon', () => ({
  default: () => null
}));
vi.mock('../ElementForge/guided/stages/Stage2DirectorialLens', () => ({
  default: () => null
}));
vi.mock('../ElementForge/guided/stages/Stage3CoreReality', () => ({
  default: () => null
}));
vi.mock('../ElementForge/guided/stages/Stage4TacticalSystems', () => ({
  default: () => null
}));
vi.mock('../ElementForge/guided/stages/Stage5WebAndFinalize', () => ({
  default: () => null
}));

import { SelectivePrintModal } from '../../../components/StoryFoundry/SelectivePrintModal.jsx';
import EditElementModal from '../ElementForge/EditElementModal.jsx';
import CronicleCalendarTab from '../../../components/StoryFoundry/Cronicle/tabs/CronicleCalendarTab.jsx';
import { StageChatRollFeed } from '../../../components/VTT/stage/StageChatRollFeed.tsx';
import { createDefaultCalendarState } from '../../../services/campaignCalendarService';
import { VttEventBus } from '../../../utils/vttEventBus';

describe('ADE Phase 15 SOTA Regression UI Suite', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('1. SelectivePrintModal exposes RTF export button and enforces operatorSafeMode filtering', () => {
    render(
      <SelectivePrintModal
        isOpen={true}
        onClose={vi.fn()}
        universeState={{
          title: 'Helios Incident',
          scenarios: [
            {
              id: 'sc_op',
              title: 'Public Sector',
              summary: '<p>Dock approach.</p><aside data-gm-secret="true">GM_ONLY_AMBUSH</aside>',
              content: '<p>Visible hull.</p><div class="ade-gm-secret">HIDDEN_REACTOR_CODE</div>'
            },
            {
              id: 'sc_gm',
              title: 'Secret Backroom',
              isGmOnly: true,
              summary: 'Architect eyes only'
            }
          ],
          creativeState: { storyCards: [] }
        }}
        elementsCatalog={[
          { id: 'p1', title: 'Security Chief', type: 'Persona', fields: { isPlayerVisible: true } },
          { id: 'p2', title: 'Shadow Assassin', type: 'Persona', isGmOnly: true, fields: {} }
        ]}
        activeScenario={{
          id: 'sc_op',
          title: 'Public Sector',
          summary: '<p>Dock approach.</p><aside data-gm-secret="true">GM_ONLY_AMBUSH</aside>',
          content: '<p>Visible hull.</p><div class="ade-gm-secret">HIDDEN_REACTOR_CODE</div>'
        }}
      />
    );

    // RTF export button rendered cleanly
    expect(screen.getByTitle(/Download Universal Rich Text Format/i)).toBeInTheDocument();
    expect(screen.getByText('RTF')).toBeInTheDocument();

    // Initially Architect Full mode shows GM-only blocks and hidden personas
    expect(screen.getAllByText(/HIDDEN_REACTOR_CODE/).length).toBeGreaterThan(0);
    expect(screen.getByText('Shadow Assassin')).toBeInTheDocument();

    // Switch to Operator Safe mode
    fireEvent.click(screen.getByText('Architect Full'));
    expect(screen.getByText('Operator Safe')).toBeInTheDocument();
    expect(screen.queryAllByText(/HIDDEN_REACTOR_CODE/)).toHaveLength(0);
    expect(screen.queryAllByText(/GM_ONLY_AMBUSH/)).toHaveLength(0);
    expect(screen.queryByText('Shadow Assassin')).not.toBeInTheDocument();
    expect(screen.queryByText('Secret Backroom')).not.toBeInTheDocument();
    expect(screen.getByText('Security Chief')).toBeInTheDocument();
  });

  it('2. EditElementModal shows Canon Linter badge and Auto-Fix repairs non-canonical AP prose', () => {
    render(
      <EditElementModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        initialMode="sheet"
        element={{
          id: 'el_canon_1',
          type: 'Property',
          title: 'Pulse Rifle',
          content: '<p>Overcharge burst fire costing 2 AP.</p>',
          fields: {
            cost: '100',
            damage: '8',
            summary: 'Overcharge mode'
          }
        }}
      />
    );

    const canonBtn = screen.getByTitle(/Inspect Tangent v6 Canon Rules Linter/i);
    expect(canonBtn).toHaveTextContent(/Canon:\s*1/i);

    fireEvent.click(canonBtn);
    expect(screen.getByText(/Tangent v6 Canon Linter/i)).toBeInTheDocument();

    const autoFixBtn = screen.getByRole('button', { name: /Auto-Fix/i });
    fireEvent.click(autoFixBtn);

    expect(screen.getByTitle(/Inspect Tangent v6 Canon Rules Linter/i)).toHaveTextContent(/Canon:\s*0/i);
    expect(showToastMock).toHaveBeenCalled();
  });

  it('3. CronicleCalendarTab supports custom Era/Month editing and recurring Holiday creation', () => {
    let latestState = createDefaultCalendarState('galactic_standard');
    const onUpdateCalendar = vi.fn((next) => {
      latestState = next;
    });

    const { rerender } = render(
      <CronicleCalendarTab calendarState={latestState} onUpdateCalendar={onUpdateCalendar} />
    );

    fireEvent.click(screen.getByTitle(/Customize Era, Months & Holidays/i));
    fireEvent.change(screen.getByLabelText('Custom Era Name'), { target: { value: 'NCE' } });
    expect(onUpdateCalendar).toHaveBeenCalled();
    expect(latestState.config.eraName).toBe('NCE');

    rerender(<CronicleCalendarTab calendarState={latestState} onUpdateCalendar={onUpdateCalendar} />);
    fireEvent.change(screen.getByLabelText('Holiday Name'), { target: { value: 'Founders Solstice' } });
    fireEvent.click(screen.getByRole('button', { name: /\+ Holiday/i }));

    rerender(<CronicleCalendarTab calendarState={latestState} onUpdateCalendar={onUpdateCalendar} />);
    expect(screen.getByText(/Holiday:\s*Founders Solstice/i)).toBeInTheDocument();
  });

  it('4. StageChatRollFeed masks blind-GM roll cards and suppresses remote whispers for operatives', () => {
    render(<StageChatRollFeed userRole="operative" />);

    act(() => {
      VttEventBus.emit('stage-chat-card', {
        id: 'card_whisper_1',
        timestamp: '12:00:00',
        sender: 'Architect',
        visibility: 'whisper_gm',
        kind: 'dice',
        title: 'Secret Ambush Check',
        body: 'Stealth total 29 vs passive alertness',
        remote: true
      });
      VttEventBus.emit('stage-chat-card', {
        id: 'card_blind_1',
        timestamp: '12:00:05',
        sender: 'Architect',
        visibility: 'blind_gm',
        kind: 'attack',
        title: 'Sniper Critical',
        body: 'Rolled 20 total 31 — hits flatfooted',
        damagePayload: { totalDamage: 24 },
        remote: true
      });
    });

    expect(screen.queryByText('Secret Ambush Check')).not.toBeInTheDocument();
    expect(screen.getByText('[BLIND GM ROLL]')).toBeInTheDocument();
    expect(screen.getByText('Resolved in secret by the Architect.')).toBeInTheDocument();
    expect(screen.queryByText(/Sniper Critical/)).not.toBeInTheDocument();
    expect(screen.queryByText(/24/)).not.toBeInTheDocument();
  });
});
