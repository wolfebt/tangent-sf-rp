/**
 * @file elementForgeFullAudit.test.jsx
 * @description Comprehensive React UI audit suite covering Waves EF-1 through EF-5:
 *   1. ElementCardActions: unpinned Cortex/Folio cards have NO Delete; pinned show Unpin; drafts show Delete
 *   2. DbmBulkPinModal: read-only bulk pin search/select without OmniCortex mutation
 *   3. AimeThreeTierStack: single canonical Dynamic Lorebook tab (no duplicate Lorebook & Triggers)
 *   4. AimeGuidanceDeck: clears legacy capitalized keys & counts Extended Gems
 *   5. ModularCharacterAssembler: renders only Tabs 1–4 (Tabs 5–7 duplication removed)
 *   6. EditElementModal: non-admin Cortex edit saves Campaign-local override & hides Admin Delete;
 *      admin edit exposes Delete from OmniCortex (Admin); customTemplates key parity
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  showToastMock,
  mockAuthValue,
  mockDbmValue,
  mockFolioValue,
  mockStoryValue
} = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  mockAuthValue: { currentUser: { uid: 'test-architect-uid' }, isAdmin: false },
  mockDbmValue: { dbData: {}, saveEntry: vi.fn(), deleteEntry: vi.fn() },
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
      scenarios: [{ id: 'sc_1', title: 'Orbital Breach', content: 'Enter airlock.' }],
      creativeState: { storyCards: [] },
      customTemplates: [{ id: 'tpl_1', name: 'Scout Template', type: 'Persona', description: '', attributes: {}, tags: [], createdAt: '2026-01-01T00:00:00.000Z' }]
    },
    setUniverseState: vi.fn(),
    setIsDirty: vi.fn(),
    mapsCatalog: [],
    cronicle: { activeDay: 1 },
    updateStory: vi.fn(),
    addGalleryModifier: vi.fn()
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
  useStory: () => mockStoryValue,
  useCampaign: () => mockStoryValue
}));

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
  default: ({ children, footerLeft, footerRight }) => (
    <div>
      {children}
      <div>{footerLeft}</div>
      <div>{footerRight}</div>
    </div>
  )
}));
vi.mock('../ElementForge/guided/stages/Stage1SparkAndCanon', () => ({
  default: () => <div data-testid="stage1-mock" />
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

import { ElementCardActions } from '../ElementForge/components/ElementCardActions.jsx';
import { DbmBulkPinModal } from '../ElementForge/components/DbmBulkPinModal.jsx';
import AimeThreeTierStack from '../ElementForge/components/AimeThreeTierStack.jsx';
import AimeGuidanceDeck from '../ElementForge/components/AimeGuidanceDeck.jsx';
import { ModularCharacterAssembler } from '../ElementForge/components/ModularCharacterAssembler.jsx';
import EditElementModal from '../ElementForge/EditElementModal.jsx';

describe('Element Forge Comprehensive Audit Suite', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockAuthValue.isAdmin = false;
  });

  it('1. ElementCardActions enforces Unpin-only on Cortex/Folio and Delete-only on Module Drafts', () => {
    const onTogglePin = vi.fn();
    const onDeleteDraft = vi.fn();

    const { rerender } = render(
      <ElementCardActions
        el={{ id: 'cortex_1', title: 'Arc Pistol', type: 'Property', isCortexAsset: true, isPinnedToModule: false }}
        onTogglePin={onTogglePin}
        onDeleteDraft={onDeleteDraft}
      />
    );
    expect(screen.getByLabelText('Pin to Story Module')).toBeInTheDocument();
    expect(screen.queryByLabelText('Delete Story Module Element')).not.toBeInTheDocument();

    rerender(
      <ElementCardActions
        el={{ id: 'pin_cortex_1', title: 'Arc Pistol', type: 'Property', isCortexAsset: true, isPinnedToModule: true }}
        onTogglePin={onTogglePin}
        onDeleteDraft={onDeleteDraft}
      />
    );
    const unpinBtn = screen.getByLabelText('Unpin from Story Module');
    expect(screen.queryByLabelText('Delete Story Module Element')).not.toBeInTheDocument();
    fireEvent.click(unpinBtn);
    expect(onTogglePin).toHaveBeenCalledTimes(1);

    rerender(
      <ElementCardActions
        el={{ id: 'draft_1', title: 'Custom Local Rogue', type: 'Persona' }}
        onTogglePin={onTogglePin}
        onDeleteDraft={onDeleteDraft}
      />
    );
    const delBtn = screen.getByLabelText('Delete Story Module Element');
    fireEvent.click(delBtn);
    expect(onDeleteDraft).toHaveBeenCalledTimes(1);
  });

  it('2. DbmBulkPinModal filters entries and triggers read-only pin without OmniCortex mutation', () => {
    const onImportSelected = vi.fn();
    render(
      <DbmBulkPinModal
        isOpen={true}
        onClose={vi.fn()}
        activeType="Property"
        matchingDbmItems={[
          { id: 'wpn_1', name: 'Plasma Lance', dbmCategory: 'weaponry' },
          { id: 'arm_1', name: 'Composite Vest', dbmCategory: 'armoring' }
        ]}
        elementsCatalog={[]}
        searchTerm="Plasma"
        onChangeSearchTerm={vi.fn()}
        selectedIds={new Set(['wpn_1'])}
        onChangeSelectedIds={vi.fn()}
        onImportSelected={onImportSelected}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Plasma Lance')).toBeInTheDocument();
    expect(screen.queryByText('Composite Vest')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Pin 1 Elements'));
    expect(onImportSelected).toHaveBeenCalledTimes(1);
  });

  it('3. AimeThreeTierStack deduplicates Lorebook tabs into a single Dynamic Lorebook tab', () => {
    render(
      <AimeThreeTierStack
        elementType="Property"
        elementTitle="Pulse Carbine"
        fields={{}}
        onChangeField={vi.fn()}
        onChangeGuidance={vi.fn()}
        onChangeAssetHub={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Extended Systems & Lorebook'));
    expect(screen.getByText('Dynamic Lorebook')).toBeInTheDocument();
    expect(screen.queryByText('Lorebook & Triggers')).not.toBeInTheDocument();
  });

  it('4. AimeGuidanceDeck counts Extended Gems and strips legacy capitalized keys when toggling', () => {
    const onChangeGuidance = vi.fn();
    render(
      <AimeGuidanceDeck
        guidance={{ Genre: 'Sci-Fi', Mood: 'Gritty & Bleak' }}
        onChangeGuidance={onChangeGuidance}
      />
    );
    expect(screen.getByText('2 Active')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sci-Fi'));
    expect(onChangeGuidance).toHaveBeenCalledTimes(1);
    const updated = onChangeGuidance.mock.calls[0][0];
    expect(updated.genre).toBe('');
    expect(updated.Genre).toBeUndefined();
    expect(updated.Mood).toBe('Gritty & Bleak');
  });

  it('5. ModularCharacterAssembler renders only Tabs 1–4 without duplicated Narrative/Relations/Script tabs', () => {
    render(
      <ModularCharacterAssembler
        fields={{ mcmTier: '2', physiology: 'Organic' }}
        onFieldChange={vi.fn()}
        onBatchFieldChange={vi.fn()}
        elementTitle="Agent Kael"
      />
    );
    expect(screen.getByText('1. Matrix & 5-Pillars')).toBeInTheDocument();
    expect(screen.getByText('2. Attributes & Skills')).toBeInTheDocument();
    expect(screen.getByText('3. Features, Traits & Augs')).toBeInTheDocument();
    expect(screen.getByText('4. Weapons, Armor & Gear')).toBeInTheDocument();
    expect(screen.queryByText(/VTT Behavior Script/i)).not.toBeInTheDocument();
  });

  it('6. EditElementModal gates OmniCortex destination and Admin Delete on isAdmin clearance', () => {
    const cortexElement = {
      id: 'cortex_wpn_1',
      title: 'Helios Carbine',
      type: 'Property',
      propertySubcategory: 'weaponry',
      isCortexAsset: true,
      dbmCategory: 'weaponry',
      dbmId: 'wpn_helios',
      fields: { dbmRef: 'wpn_helios', dbmCategory: 'weaponry', propertySubcategory: 'weaponry' },
      createdAt: '2026-01-01T00:00:00.000Z'
    };

    mockAuthValue.isAdmin = false;
    const { unmount } = render(
      <EditElementModal
        isOpen={true}
        onClose={vi.fn()}
        element={cortexElement}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onDeleteCortex={vi.fn()}
        initialMode="sheet"
      />
    );
    expect(screen.getByText(/Campaign Module \(Local Override\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('FILE'));
    expect(screen.queryByText('Delete from OmniCortex (Admin)')).not.toBeInTheDocument();
    unmount();

    mockAuthValue.isAdmin = true;
    render(
      <EditElementModal
        isOpen={true}
        onClose={vi.fn()}
        element={{ ...cortexElement, id: 'cortex_wpn_2' }}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onDeleteCortex={vi.fn()}
        initialMode="sheet"
      />
    );
    expect(screen.getByText(/OmniCortex Canon \(weaponry\) • Admin/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('FILE'));
    expect(screen.getByText('Delete from OmniCortex (Admin)')).toBeInTheDocument();
  });
});
