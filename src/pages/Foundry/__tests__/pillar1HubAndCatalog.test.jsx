/**
 * @file pillar1HubAndCatalog.test.jsx
 * @description Pillar 1 Regression Suite — HUB (Mission Control & Catalog Dashboard):
 *   1. ModuleMissionControl delegates health scoring to useModuleHealth and enforces isStoryReadOnly on rename/clear/delete/import
 *   2. DashboardCatalogPanel Activity Feed deep-links to ?scenarioId= and ?elementId=
 *   3. DashboardCatalogPanel renders the Elements tab, filters elements, and routes to ?view=elements&elementId=
 *   4. DashboardCatalogPanel VTT tab displays real map grid telemetry and Stage Manifest rows
 *   5. DashboardCatalogPanel gates story deletion behind confirmTypedDeletion
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const hoisted = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  confirmTypedDeletionMock: vi.fn(async () => true),
  toastMock: {
    showInfo: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn()
  },
  campaignState: {
    universeState: {
      id: 'story_p1',
      projectName: 'Relay Station Nine',
      scenarios: [{ id: 'sc_alpha', title: 'Airlock Breach', content: 'Pressurized steam vents across the deck.' }],
      maps: [{ id: 'map_alpha', title: 'Docking Ring', gridType: 'Hex', gridSize: 50, width: 1600, height: 1200 }],
      stageManifests: [
        { id: 'stg_1', title: 'Act I Stage', mapId: 'map_alpha', anchors: [{ id: 'a1' }], triggers: [{ id: 't1' }, { id: 't2' }] }
      ],
      creativeState: { gems: [] }
    },
    storyCatalog: [{ id: 'story_p1', projectName: 'Relay Station Nine' }],
    elementsCatalog: [
      { id: 'el_sword', title: 'Thermal Blade', type: 'Property', fields: { summary: 'Plasma-edged melee blade' }, updatedAt: '2026-11-20T00:00:00Z' }
    ],
    mapsCatalog: [{ id: 'map_alpha', title: 'Docking Ring', gridType: 'Hex', gridSize: 50, width: 1600, height: 1200 }],
    activeMapId: 'map_alpha',
    cloudSyncStatus: 'synced',
    lastCloudSavedAt: '12:00',
    isStoryReadOnly: false,
    openStory: vi.fn(),
    createNewStory: vi.fn(),
    deleteStoryProject: vi.fn(),
    updateProjectName: vi.fn(),
    handleSaveStory: vi.fn(),
    handleLoadStory: vi.fn(),
    pushUniverseToCloud: vi.fn(),
    pullUniverseFromCloud: vi.fn(),
    handleClearUniverse: vi.fn(),
    addMap: vi.fn(),
    updateMap: vi.fn(),
    addStory: vi.fn(),
    updateStory: vi.fn(),
    updateSavedElement: vi.fn(),
    setActiveMapId: vi.fn(),
    setActiveScenarioId: vi.fn(),
    setGalleryModifiers: vi.fn(),
    deleteSavedMap: vi.fn(),
    deleteMap: vi.fn()
  },
  adeState: {
    perspectiveMode: 'architect',
    setPerspectiveMode: vi.fn(),
    togglePerspectiveMode: vi.fn(),
    activePillar: 'mission_control',
    setActivePillar: vi.fn(),
    preflightTelemetry: null,
    setPreflightTelemetry: vi.fn(),
    setModal: vi.fn(),
    openGuidedElementCreator: vi.fn()
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => hoisted.navigateMock
}));

vi.mock('../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn()
  }
}));

vi.mock('../../../context/CampaignContext', () => ({
  useCampaign: () => hoisted.campaignState,
  useStory: () => hoisted.campaignState
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'uid_p1' }, userHandle: 'architect' })
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => ({ dbData: {} })
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({ personaRoster: [], roster: [], switchRosterCharacter: vi.fn() })
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ toast: hoisted.toastMock }),
  showToast: vi.fn()
}));

vi.mock('../../../context/ConfirmContext', () => ({
  useConfirm: () => vi.fn(async () => true)
}));

vi.mock('../store/adeStore', () => ({
  useADEStore: () => hoisted.adeState
}));

vi.mock('../../../utils/confirmationUtils', () => ({
  confirmTypedDeletion: (...args) => hoisted.confirmTypedDeletionMock(...args)
}));

vi.mock('../../../services/customFolderService', () => ({
  getFolders: () => [],
  getItemFolderAssignments: () => ({}),
  assignItemToFolder: vi.fn(),
  moveItemInFolder: vi.fn(),
  sortContentItems: (items) => items || [],
  FOLDERS_UPDATE_EVENT: 'tangent-folders-updated'
}));

vi.mock('../../../components/StoryFoundry/FolderOrganizerModal', () => ({
  default: () => null
}));

import ModuleMissionControl from '../Dashboard/ModuleMissionControl';
import DashboardCatalogPanel from '../Dashboard/DashboardCatalogPanel';

describe('Pillar 1: HUB (Mission Control & Catalog Dashboard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.campaignState.isStoryReadOnly = false;
    hoisted.confirmTypedDeletionMock.mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it('1. ModuleMissionControl delegates health scoring to useModuleHealth and locks mutations when isStoryReadOnly is true', () => {
    hoisted.campaignState.isStoryReadOnly = true;

    render(<ModuleMissionControl onSwitchView={vi.fn()} onOpenCompiler={vi.fn()} />);

    // Title rename button should be disabled when read-only
    const titleBtn = screen.getByTitle(/Read-only story/i);
    expect(titleBtn).toBeDisabled();

    // Danger zone buttons in FILE menu should be disabled
    fireEvent.click(screen.getByRole('button', { name: /^FILE$/i }));
    expect(screen.getByRole('button', { name: /Delete Story Module/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Clear All Elements/i })).toBeDisabled();

    // Shared useModuleHealth computes 100% for populated scenario+content+map (instead of old inline 90% gem penalty)
    expect(screen.getByTitle(/Preflight Rule Health: 100%/i)).toBeInTheDocument();
  });

  it('2. DashboardCatalogPanel Activity Feed deep-links scenarios and elements with item IDs', () => {
    render(<DashboardCatalogPanel />);

    fireEvent.click(screen.getByRole('button', { name: /Feed/i }));

    // Expand Stories & Scenarios block and click item
    fireEvent.click(screen.getByText(/Stories & Scenarios:/i));
    fireEvent.click(screen.getByText('Airlock Breach'));
    expect(hoisted.navigateMock).toHaveBeenCalledWith('/foundry?view=scenarios&scenarioId=sc_alpha');

    // Expand Elements block and click item
    fireEvent.click(screen.getByText(/Elements:/i));
    fireEvent.click(screen.getByText('Thermal Blade'));
    expect(hoisted.navigateMock).toHaveBeenCalledWith('/foundry?view=elements&elementId=el_sword');
  });

  it('3. DashboardCatalogPanel renders the Elements tab, filters items, and navigates to element detail', () => {
    render(<DashboardCatalogPanel />);

    fireEvent.click(screen.getByRole('button', { name: /Elements/i }));
    expect(screen.getByText('1 World Elements')).toBeInTheDocument();
    expect(screen.getByText('Thermal Blade')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Filter elements/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.getByText(/No world elements found/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Thermal' } });
    fireEvent.click(screen.getByRole('button', { name: /^Open$/i }));
    expect(hoisted.navigateMock).toHaveBeenCalledWith('/foundry?view=elements&elementId=el_sword');
  });

  it('4. DashboardCatalogPanel VTT tab renders Stage Manifest rows and real map grid telemetry (no hardcoded Grid: 5ft)', () => {
    render(<DashboardCatalogPanel />);

    fireEvent.click(screen.getByRole('button', { name: /^VTT$/i }));

    expect(screen.getByText('Act I Stage')).toBeInTheDocument();
    expect(screen.getByText(/Stage Manifest • 1 anchors • 2 triggers/i)).toBeInTheDocument();
    expect(screen.getByText('Docking Ring')).toBeInTheDocument();
    expect(screen.getByText(/Grid: Hex \(50px\) • 1600x1200/i)).toBeInTheDocument();
    expect(screen.queryByText(/Grid: 5ft/i)).not.toBeInTheDocument();
  });

  it('5. DashboardCatalogPanel gates story deletion behind confirmTypedDeletion', async () => {
    render(<DashboardCatalogPanel />);

    fireEvent.click(screen.getByTitle('Delete Story Module'));
    await waitFor(() => {
      expect(hoisted.confirmTypedDeletionMock).toHaveBeenCalledWith('Relay Station Nine', 'story module project');
      expect(hoisted.campaignState.deleteStoryProject).toHaveBeenCalledWith('story_p1');
    });
  });
});
