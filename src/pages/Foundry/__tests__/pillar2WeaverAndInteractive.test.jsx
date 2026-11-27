/**
 * @file pillar2WeaverAndInteractive.test.jsx
 * @description Pillar 2 Regression Suite — WEAVER (StoryWeaver, Graph, Outliner & Interactive Play):
 *   1. WikiHoverDossierCard strips .ade-gm-secret HTML blocks in operator perspectiveMode
 *   2. RevisionHistoryDrawer closes on Escape and enforces isStoryReadOnly on Snapshot and Restore
 *   3. ArchitectIdeationModal surfaces flavorError with Skip AI Flavor recovery on Step 2 and resets on reopen
 *   4. ElementsTab exposes 1-click Insert Mention and respects isStoryReadOnly
 *   5. BrainstormTab surfaces AI errors explicitly without mock fallback and honors parsed TYPE on Save as Element
 *   6. assetGraphUtils classifies Faction -> Location edges as custodian_of
 *   7. TacticalStageViewport enforces isStoryReadOnly, FireteamVitalsBar renders Vitality/Strain & Squad controls,
 *      and interactivePlayService maps Omnicortex vitals & activeCharacter conditions
 *   8. ScenarioOutlinerTree TreeNode enforces isReadOnly without ReferenceError
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const hoisted = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
  campaignState: {
    universeState: {
      id: 'story_p2',
      projectName: 'Sector Omega',
      creativeState: { gems: [], customGems: {} }
    },
    elementsCatalog: [
      { id: 'el_npc', title: 'Kaelen Voss', type: 'Persona', fields: { description: 'Ex-Syndic operative' } }
    ],
    updateSavedElement: vi.fn(),
    deleteSavedElement: vi.fn(),
    updateStory: vi.fn(),
    triggerStorySave: vi.fn(),
    updateGems: vi.fn(),
    updateCreativeState: vi.fn(),
    getActiveGemsText: () => 'Dark Sci-Fi',
    isStoryReadOnly: false
  },
  adeState: {
    perspectiveMode: 'architect',
    setEditingElement: vi.fn()
  }
}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn()
  }
}));

vi.mock('../../../services/aimeService', () => ({
  generateContent: (...args) => hoisted.generateContentMock(...args)
}));

vi.mock('../../../services/aimeService.js', () => ({
  generateContent: (...args) => hoisted.generateContentMock(...args)
}));

vi.mock('../../../context/CampaignContext', () => ({
  useCampaign: () => hoisted.campaignState,
  useStory: () => hoisted.campaignState
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => ({ dbData: {} })
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({ personaRoster: [], publicCatalog: [] })
}));

vi.mock('../../../context/ConfirmContext', () => ({
  useConfirm: () => vi.fn(async () => true),
  showConfirm: vi.fn(async () => true)
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ toast: vi.fn(), showToast: vi.fn(), showSuccess: vi.fn(), showWarning: vi.fn() }),
  showToast: vi.fn()
}));

vi.mock('../store/adeStore', () => ({
  useAdeStore: Object.assign(
    (selector) => (typeof selector === 'function' ? selector(hoisted.adeState) : hoisted.adeState),
    {
      getState: () => hoisted.adeState
    }
  )
}));

vi.mock('../../../components/VTT/TripartiteStageView', () => ({
  default: () => <div data-testid="tripartite-stage-mock" />
}));

vi.mock('../../../components/VTT/stage/WaypointPromptChip', () => ({
  WaypointPromptChip: () => null
}));

import WikiHoverDossierCard from '../StoryModule/workspaces/weaver/WikiHoverDossierCard';
import RevisionHistoryDrawer from '../StoryModule/workspaces/weaver/RevisionHistoryDrawer';
import ArchitectIdeationModal from '../StoryModule/workspaces/ArchitectIdeationModal';
import ElementsTab from '../Weaver/tabs/ElementsTab';
import BrainstormTab from '../Weaver/tabs/BrainstormTab';
import { discoverSmartLoreSuggestions } from '../Weaver/tabs/assetGraphUtils';
import TacticalStageViewport from '../StoryModule/panels/TacticalStageViewport';
import FireteamVitalsBar from '../StoryModule/panels/FireteamVitalsBar';
import {
  loadDatabasePersonas,
  loadDatabaseModifiers
} from '../StoryModule/interactivePlayService';
import { TreeNode } from '../StoryModule/ScenarioOutlinerTree';

describe('Pillar 2: WEAVER, Outliner, Graph & Interactive Play', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.generateContentMock.mockReset();
    hoisted.adeState.perspectiveMode = 'architect';
    hoisted.campaignState.isStoryReadOnly = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('1. WikiHoverDossierCard strips .ade-gm-secret blocks in operator mode', () => {
    const elem = {
      id: 'npc_1',
      title: 'Station Commander',
      type: 'Persona',
      content: '<p>Public command officer.</p><div class="ade-gm-secret" data-gm-secret="true">Secretly betrays the squad.</div>'
    };

    hoisted.adeState.perspectiveMode = 'operator';
    const { rerender } = render(<WikiHoverDossierCard element={elem} />);
    expect(screen.getByText(/Public command officer/i)).toBeInTheDocument();
    expect(screen.queryByText(/Secretly betrays/i)).not.toBeInTheDocument();

    hoisted.adeState.perspectiveMode = 'architect';
    rerender(<WikiHoverDossierCard element={elem} />);
    expect(screen.getByText(/Secretly betrays/i)).toBeInTheDocument();
  });

  it('2. RevisionHistoryDrawer handles Escape and locks Snapshot/Restore when isStoryReadOnly is true', () => {
    const onClose = vi.fn();
    const onCreateSnapshot = vi.fn();
    const onRestoreSnapshot = vi.fn();
    const revisions = [
      { id: 'rev_1', label: 'Draft v1', wordCount: 42, createdAt: '2026-11-20T00:00:00Z', content: '<p>Old draft</p>' }
    ];

    render(
      <RevisionHistoryDrawer
        isOpen={true}
        onClose={onClose}
        revisions={revisions}
        currentContent="<p>New draft</p>"
        isStoryReadOnly={true}
        onCreateSnapshot={onCreateSnapshot}
        onRestoreSnapshot={onRestoreSnapshot}
      />
    );

    const snapshotBtn = screen.getByRole('button', { name: /Snapshot/i });
    const restoreBtn = screen.getByRole('button', { name: /Restore/i });
    expect(snapshotBtn).toBeDisabled();
    expect(restoreBtn).toBeDisabled();

    fireEvent.click(snapshotBtn);
    fireEvent.click(restoreBtn);
    expect(onCreateSnapshot).not.toHaveBeenCalled();
    expect(onRestoreSnapshot).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('3. ArchitectIdeationModal surfaces flavorError on Step 2 failure, lets user skip to review, and resets on reopen', async () => {
    hoisted.generateContentMock.mockRejectedValueOnce(new Error('Network down'));

    const onCommitNode = vi.fn();
    const onClose = vi.fn();
    const { rerender } = render(
      <ArchitectIdeationModal
        isOpen={true}
        onClose={onClose}
        activeNode={{ id: 'sc_1', title: 'Reactor Breach' }}
        initialNodeType="Climax"
        onCommitNode={onCommitNode}
      />
    );

    // Fill Step 1 intent and advance to Step 2
    const intentInput = screen.getByPlaceholderText(/Describe the dramatic turning point/i);
    fireEvent.change(intentInput, { target: { value: 'Trigger manual airlock override' } });
    fireEvent.click(screen.getByRole('button', { name: /Next: Stakes & Weather/i }));

    // Trigger AIME failure and check error banner + manual recovery button
    fireEvent.click(screen.getByRole('button', { name: /Call AIME Flavor Layer/i }));
    await waitFor(() => {
      expect(screen.getByText(/AIME flavor synthesis failed/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Skip AI Flavor/i }));
    expect(screen.getByText(/Final Node Assembly/i)).toBeInTheDocument();

    // Closing and reopening resets back to Step 1
    rerender(
      <ArchitectIdeationModal
        isOpen={false}
        onClose={onClose}
        activeNode={{ id: 'sc_1', title: 'Reactor Breach' }}
        initialNodeType="Resolution"
        onCommitNode={onCommitNode}
      />
    );
    rerender(
      <ArchitectIdeationModal
        isOpen={true}
        onClose={onClose}
        activeNode={{ id: 'sc_1', title: 'Reactor Breach' }}
        initialNodeType="Resolution"
        onCommitNode={onCommitNode}
      />
    );
    expect(screen.getByRole('button', { name: /Next: Stakes & Weather/i })).toBeInTheDocument();
  });

  it('4. ElementsTab exposes 1-click Insert Mention and respects isStoryReadOnly', () => {
    const onInsertElementMention = vi.fn();
    const { rerender } = render(
      <ElementsTab
        activeNode={{ id: 'sc_1', title: 'Scene 1', content: '' }}
        onInsertElementMention={onInsertElementMention}
      />
    );

    const insertBtn = screen.getByRole('button', { name: /Insert Mention/i });
    expect(insertBtn).toBeEnabled();
    fireEvent.click(insertBtn);
    expect(onInsertElementMention).toHaveBeenCalledWith(expect.objectContaining({ id: 'el_npc', title: 'Kaelen Voss' }));

    hoisted.campaignState.isStoryReadOnly = true;
    rerender(
      <ElementsTab
        activeNode={{ id: 'sc_1', title: 'Scene 1', content: '' }}
        onInsertElementMention={onInsertElementMention}
      />
    );
    expect(screen.getByRole('button', { name: /Insert Mention/i })).toBeDisabled();
  });

  it('5. BrainstormTab shows aiError instead of mock cards on failure and respects parsed TYPE when saving element', async () => {
    hoisted.generateContentMock.mockRejectedValueOnce(new Error('Quota exceeded'));

    render(
      <BrainstormTab
        activeNode={{ id: 'sc_1', title: 'Relay 9', content: '' }}
        updateStory={hoisted.campaignState.updateStory}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Brainstorm$/i }));
    await waitFor(() => {
      expect(screen.getByText(/AIME generation is currently unavailable/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Synthetic/i)).not.toBeInTheDocument();

    // Now test parsed TYPE preservation when saving as an element
    hoisted.generateContentMock.mockResolvedValueOnce(
      'TITLE: Obsidian Relay\nTYPE: Location\nSUMMARY: Orbital listening post hidden in asteroid dust.'
    );
    fireEvent.click(screen.getByRole('button', { name: /^Brainstorm$/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Obsidian Relay/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /Save as Element/i }));
    expect(hoisted.campaignState.updateSavedElement).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        title: 'Obsidian Relay',
        type: 'Setting'
      })
    );
  });

  it('6. assetGraphUtils prioritizes custodian_of for Faction -> Location links', () => {
    const assets = [
      { id: 'fac_1', title: 'Iron Syndicate', category: 'Faction', fields: { description: 'Maintains a garrison on Station Hera.' }, raw: {} },
      { id: 'loc_1', title: 'Station Hera', category: 'Location', fields: { description: 'Orbital dock.' }, raw: {} }
    ];
    const suggestions = discoverSmartLoreSuggestions({ catalogAssets: assets, confirmedConnections: [] });
    const match = suggestions.find((s) => s.source === 'fac_1' && s.target === 'loc_1');
    expect(match).toBeDefined();
    expect(match.type).toBe('custodian_of');
  });

  it('7. TacticalStageViewport enforces readOnly, FireteamVitalsBar exposes Vitality/Strain & Squad controls, and interactivePlayService syncs vitals/conditions', () => {
    render(
      <TacticalStageViewport
        activeNode={{ id: 'sc_1', title: 'Airlock' }}
        allAvailableMaps={[]}
        isStoryReadOnly={true}
        handleCreateNewMapForElement={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /Blank Tactical Hex Grid/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Derelict Starship/i })).toBeDisabled();

    const onUpdateVitals = vi.fn();
    const soloOp = {
      id: 'op_1',
      name: 'Nadia Cross',
      species: 'Human',
      archetype: 'Vanguard',
      isSynthetic: false,
      vitals: { health: 25, maxHealth: 30, vitality: 20, maxVitality: 30, shields: 10, maxShields: 15, strain: 2, maxStrain: 12 }
    };
    const { rerender } = render(
      <FireteamVitalsBar
        partyMode="solo"
        operatives={[soloOp]}
        activeOperativeId="op_1"
        onUpdateOperativeVitals={onUpdateVitals}
      />
    );
    expect(screen.getByText('VITALITY')).toBeInTheDocument();
    expect(screen.getByText('STRAIN')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle(/Restore \+5 Vitality/i));
    expect(onUpdateVitals).toHaveBeenCalledWith('op_1', expect.objectContaining({ vitality: 25 }));

    rerender(
      <FireteamVitalsBar
        partyMode="group"
        operatives={[soloOp]}
        activeOperativeId="op_1"
        onUpdateOperativeVitals={onUpdateVitals}
      />
    );
    fireEvent.click(screen.getByTitle(/Damage -5 HP/i));
    expect(onUpdateVitals).toHaveBeenCalledWith('op_1', expect.objectContaining({ health: 20 }));

    const personas = loadDatabasePersonas({
      dbArchetypes: [{ id: 'd1', name: 'Aegis Drone', category: 'Synth Drone' }]
    });
    const synthOp = personas.find((p) => p.id === 'd1');
    expect(synthOp).toBeDefined();
    expect(synthOp.isSynthetic).toBe(true);
    expect(synthOp.vitals.vitality).toBe(30);
    expect(synthOp.vitals.structure).toBe(30);

    const mods = loadDatabaseModifiers({
      activeCharacter: {
        active_conditions: ['Overheated Thrusters'],
        tracked_modifications: [{ id: 'tm_1', label: 'Stimulant Rush', value: 2, field: 'attr-reflex' }]
      }
    });
    expect(mods.some((m) => m.name === 'Overheated Thrusters')).toBe(true);
    expect(mods.some((m) => m.id === 'tm_1' && m.value === 2)).toBe(true);
  });

  it('8. ScenarioOutlinerTree TreeNode enforces isReadOnly without ReferenceError', () => {
    const node = { id: 'sc_1', title: 'Docking Bay Alpha', type: 'Scene', children: [] };
    const { rerender } = render(
      <TreeNode
        node={node}
        activeId="sc_1"
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        onAddChild={vi.fn()}
        isReadOnly={false}
      />
    );
    expect(screen.getByTitle('Add Sub-Element')).toBeInTheDocument();
    expect(screen.getByTitle('Delete this element')).toBeInTheDocument();

    rerender(
      <TreeNode
        node={node}
        activeId="sc_1"
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        onAddChild={vi.fn()}
        isReadOnly={true}
      />
    );
    expect(screen.queryByTitle('Add Sub-Element')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete this element')).not.toBeInTheDocument();
  });
});
