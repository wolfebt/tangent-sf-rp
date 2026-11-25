/**
 * @file waveBP1Features.test.jsx
 * @description Wave B (P1) React UI Regression Suite:
 *   1. EpistemicPlayPanel seeds terminal files dynamically from scenario Clues/Properties, unlocks encrypted files on slice, and queries AIME for interrogation
 *   2. GraphInspectorDrawer binds Read-Aloud to fields.readAloud (preserving Quill HTML content) & GM Secrets to fields.gmSecrets + renders threats badge
 *   3. ElementSelectorModal supports species_type fallback & multi-select Confirm button
 *   4. Stage3CoreReality renders alias-keyed schema values via resolveSchemaFieldValue
 *   5. InteractiveStoryStudio renders Sessions Drawer (Fork/Resume/Delete/New) & blocks Commit in read-only mode
 */

import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  generateContentMock,
  adjudicateActionCheckMock,
  mockStoryValue,
  mockDbmValue,
  mockFolioValue
} = vi.hoisted(() => ({
  generateContentMock: vi.fn(async () => 'Mocked interrogation confession from AIME.'),
  adjudicateActionCheckMock: vi.fn(() => ({
    systemIntent: 'EXECUTE_SUCCESS',
    diceSummary: { formula: '2d10+5 (16) vs CR 12', margin: 4 },
    narrativeBounds: {}
  })),
  mockStoryValue: {
    universeState: {
      id: 'story_wave_b',
      projectName: 'Wave B Station',
      scenarios: [{ id: 'sc_b', title: 'Docking Ring 4', content: '<p>Entry.</p>' }],
      creativeState: { storyCards: [] }
    },
    elementsCatalog: [
      { id: 'sp_t1', title: 'Augmented Human', type: 'Species', fields: {} }
    ],
    updateStory: vi.fn(),
    updateSavedElement: vi.fn(),
    deleteSavedElement: vi.fn(),
    setActiveScenarioId: vi.fn(),
    setActiveMapId: vi.fn(),
    mapsCatalog: [],
    addMap: vi.fn(),
    getActiveGemsText: () => 'Sci-Fi Noir',
    isStoryReadOnly: true
  },
  mockDbmValue: {
    dbData: {
      species_type: [{ id: 'st_bio', name: 'Biomorph Lineage', description: 'Adaptive genome' }]
    },
    saveEntry: vi.fn()
  },
  mockFolioValue: {
    roster: [],
    personaRoster: [],
    publicPersonas: [],
    publicCatalog: [],
    characterData: null,
    saveCurrentToRoster: vi.fn()
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('react-split', () => ({
  default: ({ children }) => <div>{children}</div>
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

vi.mock('../../../services/audioService.js', () => ({
  default: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() }
}));

vi.mock('../../../services/audioService', () => ({
  default: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() }
}));

vi.mock('../../../services/aimeService.js', () => ({
  generateContent: generateContentMock,
  streamContent: vi.fn(async () => '{"narrative":"Beat","gate":{"prompt":"Next?","options":[]}}'),
  calculateVramTelemetry: () => ({ badge: 'Auto LOD', fits8GbVram: true, gqaSavingsMb: 120 }),
  LOD_TIERS: {},
  resolveIntelligenceTier: () => 'tier2_tactical'
}));

vi.mock('../../../services/ade/adeEngineBridge.ts', () => ({
  adjudicateActionCheck: adjudicateActionCheckMock,
  formatMandateForPrompt: () => ''
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'arch_b' }, isAdmin: false })
}));

vi.mock('../../../context/ConfirmContext', () => ({
  showConfirm: vi.fn(async () => true),
  useConfirm: () => vi.fn(async () => true)
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn(),
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => mockDbmValue
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => mockFolioValue
}));

vi.mock('../../../context/CampaignContext', () => ({
  useStory: () => mockStoryValue,
  useCampaign: () => mockStoryValue
}));

import EpistemicPlayPanel from '../StoryModule/workspaces/EpistemicPlayPanel.jsx';
import GraphInspectorDrawer from '../StoryModule/workspaces/graph/GraphInspectorDrawer.jsx';
import { ElementSelectorModal } from '../ElementForge/ElementSelectorModal.jsx';
import Stage3CoreReality from '../ElementForge/guided/stages/Stage3CoreReality.jsx';
import { InteractiveStoryStudio } from '../StoryModule/workspaces/InteractiveStoryStudio.jsx';

describe('Wave B (P1) React UI Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('1. EpistemicPlayPanel seeds scenario files, unlocks encrypted logs on slice, and queries AIME for interrogation', async () => {
    const activeNode = {
      id: 'sc_reactor',
      title: 'Reactor Control',
      linkedElements: ['clue_blackbox', 'per_suspect']
    };
    const elementsCatalog = [
      { id: 'clue_blackbox', title: 'Blackbox Telemetry', type: 'Clue', fields: { summary: 'Reactor override code 8842.' } },
      { id: 'per_suspect', title: 'Chief Engineer Vex', type: 'Persona', fields: { role: 'Reactor Lead' } }
    ];

    render(
      <EpistemicPlayPanel
        isOpen={true}
        onClose={vi.fn()}
        activeOperative={{ name: 'Operative Zero', techLevel: 4 }}
        activeNode={activeNode}
        elementsCatalog={elementsCatalog}
        onInsertToProse={vi.fn()}
      />
    );

    const terminalInput = screen.getByPlaceholderText(/Enter command/i);
    fireEvent.change(terminalInput, { target: { value: 'status' } });
    fireEvent.submit(terminalInput.closest('form'));
    expect(screen.getAllByText(/Reactor Control/).length).toBeGreaterThan(0);

    fireEvent.change(terminalInput, { target: { value: 'cat blackbox_telemetry.enc' } });
    fireEvent.submit(terminalInput.closest('form'));
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();

    fireEvent.change(terminalInput, { target: { value: 'slice firewall' } });
    fireEvent.submit(terminalInput.closest('form'));
    expect(screen.getByText(/DECRYPTION SUCCESS/i)).toBeInTheDocument();

    fireEvent.change(terminalInput, { target: { value: 'cat blackbox_telemetry.enc' } });
    fireEvent.submit(terminalInput.closest('form'));
    expect(screen.getByText(/Reactor override code 8842\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Interrogation/i }));
    expect(screen.getByDisplayValue('Chief Engineer Vex')).toBeInTheDocument();

    const queryInput = screen.getByPlaceholderText(/Ask open-ended question/i);
    fireEvent.change(queryInput, { target: { value: 'Who disabled the coolant?' } });
    fireEvent.submit(queryInput.closest('form'));

    await waitFor(() => {
      expect(generateContentMock).toHaveBeenCalled();
      expect(screen.getByText(/Mocked interrogation confession from AIME\./i)).toBeInTheDocument();
    });
  });

  it('2. GraphInspectorDrawer edits fields.readAloud without clobbering node.content and displays structured threats badge', () => {
    const onUpdateNode = vi.fn();
    const selectedNode = {
      id: 'node_1',
      title: 'Airlock Alpha',
      type: 'Scene',
      content: '<p>Quill rich prose body.</p>',
      fields: {
        readAloud: 'Cold vapor hisses.',
        gmSecrets: 'Hidden sniper in rafters.',
        threats: [{ name: 'Void Sentry', tier: 'T-2' }]
      }
    };

    render(
      <GraphInspectorDrawer
        isOpen={true}
        onClose={vi.fn()}
        selectedNode={selectedNode}
        onUpdateNode={onUpdateNode}
      />
    );

    const readAloudArea = screen.getByDisplayValue('Cold vapor hisses.');
    fireEvent.change(readAloudArea, { target: { value: 'Updated boxed narration.' } });
    expect(onUpdateNode).toHaveBeenCalledWith(
      'node_1',
      expect.objectContaining({
        fields: expect.objectContaining({ readAloud: 'Updated boxed narration.' })
      })
    );
    expect(onUpdateNode.mock.calls[0][1].content).toBeUndefined();

    fireEvent.click(screen.getByRole('button', { name: /OSR \/ Sector/i }));
    expect(screen.getByText(/1 Structured: Void Sentry/i)).toBeInTheDocument();

    const secretArea = screen.getByDisplayValue('Hidden sniper in rafters.');
    fireEvent.change(secretArea, { target: { value: 'Two snipers behind vent.' } });
    expect(onUpdateNode).toHaveBeenCalledWith(
      'node_1',
      expect.objectContaining({
        fields: expect.objectContaining({ gmSecrets: 'Two snipers behind vent.' })
      })
    );
  });

  it('3. ElementSelectorModal resolves species_type fallback & supports multi-select confirmation', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <ElementSelectorModal
        isOpen={true}
        onClose={onClose}
        sourceType="species_type"
        fieldLabel="Lineage"
        onSelect={onSelect}
        isMulti={true}
      />
    );

    expect(screen.getByText('Augmented Human')).toBeInTheDocument();
    expect(screen.getByText('Biomorph Lineage')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Augmented Human'));
    fireEvent.click(screen.getByText('Biomorph Lineage'));

    const confirmBtn = screen.getByRole('button', { name: /Confirm Selected \(2\)/i });
    fireEvent.click(confirmBtn);

    expect(onSelect).toHaveBeenCalledTimes(1);
    const chosen = onSelect.mock.calls[0][0];
    expect(Array.isArray(chosen)).toBe(true);
    expect(chosen.map((c) => c.title)).toEqual(['Augmented Human', 'Biomorph Lineage']);
  });

  it('4. Stage3CoreReality renders alias-keyed field values via resolveSchemaFieldValue', () => {
    render(
      <Stage3CoreReality
        draft={{
          id: 'sp_test',
          type: 'Species',
          title: 'Vesperan',
          fields: {
            summary: 'Telepathic abyssal navigators',
            homeworld: 'Deep Trench IX'
          }
        }}
        onChangeField={vi.fn()}
        onMergeFields={vi.fn()}
        content=""
        onChangeContent={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Telepathic abyssal navigators')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Deep Trench IX')).toBeInTheDocument();
  });

  it('5. InteractiveStoryStudio opens Sessions Drawer for new/fork/delete and disables Commit when read-only', () => {
    render(<InteractiveStoryStudio />);

    const sessionsBtn = screen.getByRole('button', { name: /Sessions \(\d+\)/i });
    fireEvent.click(sessionsBtn);

    fireEvent.click(screen.getByRole('button', { name: /New Session/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sessions \(1\)/i }));
    expect(screen.getByText(/Saved Play Sessions \(1\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Fork Checkpoint/i }));
    expect(screen.getByRole('button', { name: /Sessions \(2\)/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Session & LOD/i }));
    const commitBtn = screen.getByRole('button', { name: /Commit Beats to Story Weaver/i });
    expect(commitBtn).toBeDisabled();
  });
});
