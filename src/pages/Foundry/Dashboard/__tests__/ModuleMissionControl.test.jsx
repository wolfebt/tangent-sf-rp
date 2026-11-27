/**
 * @file ModuleMissionControl.test.jsx
 * @description Comprehensive unit & interaction tests for ModuleMissionControl:
 * - Readiness score & moduleHealth preflight thresholds
 * - Inline module title rename (Enter / Escape)
 * - Create New Story Module modal
 * - Architect vs Operator package export triggers & error handling
 * - Typed-confirmation gating on destructive delete/clear actions
 * - Markdown element & JSON module file ingestion workflows
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
const mockToast = {
  showInfo: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn()
};
const mockConfirmTypedDeletion = vi.fn();
const mockExportArchitectModuleToFile = vi.fn();
const mockExportOperatorModuleToFile = vi.fn();
const mockParseAndValidateModuleFile = vi.fn();
const mockHydrateModuleIntoCampaign = vi.fn();
const mockBatchIngestElementFiles = vi.fn();

const stateHolder = {
  universeState: {
    id: 'story_alpha',
    projectName: 'Sector Alpha',
    scenarios: [],
    maps: [],
    creativeState: { gems: [] }
  },
  storyCatalog: [
    { id: 'story_alpha', projectName: 'Sector Alpha' },
    { id: 'story_beta', projectName: 'Beta Relay' }
  ],
  elementsCatalog: [],
  mapsCatalog: [],
  activeMapId: null,
  cloudSyncStatus: 'synced',
  lastCloudSavedAt: '12:00',
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
  setGalleryModifiers: vi.fn()
};

const adeStateHolder = {
  perspectiveMode: 'architect',
  setPerspectiveMode: vi.fn(),
  togglePerspectiveMode: vi.fn(),
  activePillar: 'dashboard',
  setActivePillar: vi.fn(),
  setModal: vi.fn(),
  openGuidedElementCreator: vi.fn()
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('../../../../services/audioService', () => ({
  AudioService: {
    playTerminalBeep: vi.fn(),
    playCriticalChime: vi.fn()
  }
}));

vi.mock('../../../../context/CampaignContext', () => ({
  useCampaign: () => stateHolder,
  useStory: () => stateHolder
}));

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'arch_uid_1' }, userHandle: 'Architect' })
}));

vi.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({ toast: mockToast })
}));

vi.mock('../../store/adeStore', () => ({
  useADEStore: () => adeStateHolder
}));

vi.mock('../../../../utils/confirmationUtils', () => ({
  confirmTypedDeletion: (...args) => mockConfirmTypedDeletion(...args)
}));

vi.mock('../../../../services/modulePackageService', () => ({
  exportArchitectModuleToFile: (...args) => mockExportArchitectModuleToFile(...args),
  exportOperatorModuleToFile: (...args) => mockExportOperatorModuleToFile(...args),
  parseAndValidateModuleFile: (...args) => mockParseAndValidateModuleFile(...args),
  hydrateModuleIntoCampaign: (...args) => mockHydrateModuleIntoCampaign(...args)
}));

vi.mock('../../../../services/elementIngestionService.js', () => ({
  batchIngestElementFiles: (...args) => mockBatchIngestElementFiles(...args),
  parseElementMarkdown: vi.fn()
}));

import ModuleMissionControl from '../ModuleMissionControl.jsx';

describe('ModuleMissionControl — ADE Cockpit & Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stateHolder.universeState = {
      id: 'story_alpha',
      projectName: 'Sector Alpha',
      scenarios: [],
      maps: [],
      creativeState: { gems: [] }
    };
    stateHolder.elementsCatalog = [];
    adeStateHolder.perspectiveMode = 'architect';
    mockConfirmTypedDeletion.mockResolvedValue(false);
    mockExportArchitectModuleToFile.mockReturnValue({ success: true, filename: 'sector-alpha.architect.json' });
    mockExportOperatorModuleToFile.mockReturnValue({ success: true, filename: 'sector-alpha.operator.json' });
  });

  afterEach(() => {
    cleanup();
  });

  it('computes Readiness Score (0% empty vs 100% populated) and Module Health Score thresholds', () => {
    const { rerender } = render(<ModuleMissionControl onSwitchView={vi.fn()} onOpenCompiler={vi.fn()} />);

    // Empty module: readiness 0%, health via adeEngineBridge.validateUniverseRules = 100 - 35 (no scenarios) = 65%
    expect(screen.getByTitle('Module Readiness: 0% Pre-Flight')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();

    // Populate scenarios(+25) + mapped scenario(+25) + scripted element(+25 + 10) + walled map(+15) + gem
    stateHolder.universeState = {
      id: 'story_alpha',
      projectName: 'Sector Alpha',
      scenarios: [{ id: 'sc_1', title: 'Docking Bay', mapId: 'map_1', beats: ['Beat 1'], content: 'Airlock seals engage with a resonant thud.' }],
      maps: [{ id: 'map_1', title: 'Hangar', walls: [{ p1: [0, 0], p2: [10, 0] }] }],
      creativeState: { gems: ['noir'] }
    };
    stateHolder.elementsCatalog = [{ id: 'el_1', title: 'Sentry', fields: { vttScriptActive: 'true' } }];

    rerender(<ModuleMissionControl onSwitchView={vi.fn()} onOpenCompiler={vi.fn()} />);
    expect(screen.getByTitle('Module Readiness: 100% Pre-Flight')).toBeInTheDocument();
    expect(screen.getAllByText('100%')).toHaveLength(2);
  });

  it('supports inline module rename on Enter and cancels cleanly on Escape', () => {
    render(<ModuleMissionControl onSwitchView={vi.fn()} />);

    const titleBtn = screen.getByTitle('Click to rename active module');
    fireEvent.click(titleBtn);

    const input = screen.getAllByDisplayValue('Sector Alpha').find((el) => el.tagName === 'INPUT');
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: 'Sector Omega' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(stateHolder.updateProjectName).toHaveBeenCalledWith('Sector Omega');
    expect(mockToast.showSuccess).toHaveBeenCalledWith('Module renamed to "Sector Omega"');

    // Escape should revert without saving
    fireEvent.click(screen.getByTitle('Click to rename active module'));
    const input2 = screen.getAllByDisplayValue('Sector Omega').find((el) => el.tagName === 'INPUT');
    expect(input2).toBeTruthy();
    fireEvent.change(input2, { target: { value: 'Ignored Change' } });
    fireEvent.keyDown(input2, { key: 'Escape' });
    expect(stateHolder.updateProjectName).toHaveBeenCalledTimes(1);
  });

  it('creates a new story module via the Create New Story modal', () => {
    render(<ModuleMissionControl onSwitchView={vi.fn()} />);

    fireEvent.click(screen.getByTitle('Create a New Adventure Story Module'));
    expect(screen.getByText('Create New Story Module')).toBeInTheDocument();

    const modalInput = screen.getByPlaceholderText('e.g. Operation Voidfall');
    fireEvent.change(modalInput, { target: { value: 'Operation Nebula' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));

    expect(stateHolder.createNewStory).toHaveBeenCalledWith('Operation Nebula');
    expect(mockToast.showSuccess).toHaveBeenCalledWith('Initialized module: "Operation Nebula"');
  });

  it('exports Architect and Operator packages and reports failures', () => {
    render(<ModuleMissionControl onSwitchView={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Export Architect Package/i }));
    expect(mockExportArchitectModuleToFile).toHaveBeenCalledWith(stateHolder.universeState, stateHolder.elementsCatalog);
    expect(mockToast.showSuccess).toHaveBeenCalledWith('Exported Architect Master Package: sector-alpha.architect.json');

    mockExportOperatorModuleToFile.mockReturnValueOnce({ success: false, error: 'Quota exceeded' });
    fireEvent.click(screen.getByRole('button', { name: /Export Operator Package/i }));
    expect(mockExportOperatorModuleToFile).toHaveBeenCalled();
    expect(mockToast.showError).toHaveBeenCalledWith('Export failed: Quota exceeded');
  });

  it('gates destructive Delete Story Module and Clear All Elements actions behind confirmTypedDeletion', async () => {
    render(<ModuleMissionControl onSwitchView={vi.fn()} />);

    // Open FILE menu
    fireEvent.click(screen.getByRole('button', { name: /^FILE$/i }));
    fireEvent.click(screen.getByText('Delete Story Module...'));

    await waitFor(() => {
      expect(mockConfirmTypedDeletion).toHaveBeenCalledWith('Sector Alpha', 'story module project');
    });
    expect(stateHolder.deleteStoryProject).not.toHaveBeenCalled();

    // Accept confirmation -> deletes project
    mockConfirmTypedDeletion.mockResolvedValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: /^FILE$/i }));
    fireEvent.click(screen.getByText('Delete Story Module...'));

    await waitFor(() => {
      expect(stateHolder.deleteStoryProject).toHaveBeenCalledWith('story_alpha');
    });

    // Clear All Elements gated as well
    mockConfirmTypedDeletion.mockResolvedValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: /^FILE$/i }));
    fireEvent.click(screen.getByText('Clear All Elements...'));

    await waitFor(() => {
      expect(mockConfirmTypedDeletion).toHaveBeenCalledWith('Sector Alpha', 'story element content');
      expect(stateHolder.handleClearUniverse).toHaveBeenCalled();
    });
  });

  it('ingests dropped/selected .md elements and .json module packages and catches malformed JSON errors', async () => {
    const { container } = render(<ModuleMissionControl onSwitchView={vi.fn()} />);
    const fileInput = container.querySelector('input[type="file"][accept=".json,.md,.markdown"]');
    expect(fileInput).toBeTruthy();

    // 1. Markdown ELEMENTS.md ingestion
    mockBatchIngestElementFiles.mockResolvedValueOnce([
      { success: true, element: { id: 'el_md_1', name: 'Void Rifle', type: 'Equipment', description: 'Heavy rail' } }
    ]);
    const mdFile = new File(['# Void Rifle'], 'void-rifle.md', { type: 'text/markdown' });
    fireEvent.change(fileInput, { target: { files: [mdFile] } });

    await waitFor(() => {
      expect(mockBatchIngestElementFiles).toHaveBeenCalled();
      expect(stateHolder.updateSavedElement).toHaveBeenCalledWith('el_md_1', expect.objectContaining({
        id: 'el_md_1',
        title: 'Void Rifle',
        content: 'Heavy rail'
      }));
      expect(mockToast.showSuccess).toHaveBeenCalledWith('Ingested 1 Element(s) [Equipment] adhering to ELEMENTS.md!');
    });

    // 2. Valid JSON module package hydration
    const jsonFile = new File(['{"meta":{}}'], 'alpha.tangent-module.json', { type: 'application/json' });
    jsonFile.text = async () => '{"meta":{}}';
    mockParseAndValidateModuleFile.mockReturnValueOnce({ isValid: true, data: { meta: {} } });
    mockHydrateModuleIntoCampaign.mockReturnValueOnce({ scenariosImported: 2, mapsImported: 1, elementsImported: 3 });

    fireEvent.change(fileInput, { target: { files: [jsonFile] } });
    await waitFor(() => {
      expect(mockParseAndValidateModuleFile).toHaveBeenCalled();
      expect(mockHydrateModuleIntoCampaign).toHaveBeenCalled();
      expect(mockToast.showSuccess).toHaveBeenCalledWith('Module Hydrated: 2 scenarios, 1 maps, 3 assets.');
    });

    // 3. Invalid JSON module triggers toast error
    const badJsonFile = new File(['bad'], 'broken.json', { type: 'application/json' });
    badJsonFile.text = async () => 'bad';
    mockParseAndValidateModuleFile.mockReturnValueOnce({ isValid: false, error: 'Corrupt manifest' });

    fireEvent.change(fileInput, { target: { files: [badJsonFile] } });
    await waitFor(() => {
      expect(mockToast.showError).toHaveBeenCalledWith('Import Error: Corrupt manifest');
    });
  });
});
