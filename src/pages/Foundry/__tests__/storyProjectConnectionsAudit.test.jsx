/**
 * @file storyProjectConnectionsAudit.test.jsx
 * @description Wave SP-5 React UI Audit Suite covering Story Project <-> Elements usability & guards:
 *   1. StoryElementExtractorModal: NO OmniCortex sync toggle/badge, normalizes Smart Prop -> Property,
 *      writes synced linkedElements & assetHub on extract, and blocks extraction in read-only stories.
 *   2. EditElementModal: Exposes Project/Public visibility toggle (🔒 Project <-> 🌐 Public) & passes isPublic on Save.
 *   3. ElementForge: Exposes Public / Shared filter pill & calls loadPublicElements cleanly.
 *   4. OsrControlPanelDeck: Hides Classified Architect Discovery / Complication section in Operator perspective.
 *   5. LorebookDossierModal: Strips ade-gm-secret HTML blocks cleanly in dossier narrative output.
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  toastMock,
  mockAuthValue,
  mockDbmValue,
  mockFolioValue,
  mockStoryValue,
  mockAdeState
} = vi.hoisted(() => ({
  toastMock: vi.fn(),
  mockAuthValue: { currentUser: { uid: 'arch_1', email: 'arch@tangent.test' }, isAdmin: false },
  mockDbmValue: { dbData: { weaponry: [] }, saveEntry: vi.fn(), deleteEntry: vi.fn() },
  mockFolioValue: {
    roster: [],
    personaRoster: [],
    publicPersonas: [],
    publicCatalog: [],
    characterData: null,
    saveCurrentToRoster: vi.fn(),
    switchRosterCharacter: vi.fn()
  },
  mockStoryValue: {
    universeState: {
      id: 'story_audit_1',
      projectName: 'Audit Frontier',
      scenarios: [{ id: 'sc_1', title: 'Docking Bay', content: '<p>Entryway.</p>' }],
      creativeState: {},
      customTemplates: []
    },
    elementsCatalog: [
      { id: 'el_proj', title: 'Project Shield', type: 'Property', fields: {}, createdAt: '2026-01-01T00:00:00Z' },
      { id: 'el_pub', title: 'Public Relic', type: 'Property', isPublic: true, fields: {}, createdAt: '2026-01-01T00:00:00Z' }
    ],
    updateSavedElement: vi.fn(),
    deleteSavedElement: vi.fn(),
    toggleElementVisibility: vi.fn(),
    loadPublicElements: vi.fn(async () => []),
    publicElementsCatalog: [{ id: 'el_pub', title: 'Public Relic', type: 'Property', isPublic: true, fields: {} }],
    updateStory: vi.fn(),
    setUniverseState: vi.fn(),
    setIsDirty: vi.fn(),
    mapsCatalog: [],
    cronicle: { activeDay: 1 },
    addGalleryModifier: vi.fn(),
    isStoryReadOnly: false
  },
  mockAdeState: {
    perspectiveMode: 'architect'
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('react-quill-new', () => ({
  default: ({ value, onChange }) => (
    <textarea data-testid="mock-quill" value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
  )
}));

vi.mock('../../../services/audioService', () => ({
  default: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() }
}));

vi.mock('../../../services/aimeService', () => ({
  generateContent: vi.fn(async () => '{}')
}));

vi.mock('../../../services/diceService', () => ({
  rollDice: vi.fn(() => ({ total: 15, rolls: [7, 8], formatted: '[7, 8]' }))
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: toastMock,
  useToast: () => ({ toast: toastMock })
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

vi.mock('../store/adeStore', () => {
  const useAdeStore = (selector) => (typeof selector === 'function' ? selector(mockAdeState) : mockAdeState);
  useAdeStore.getState = () => mockAdeState;
  return { useAdeStore, useADEStore: useAdeStore };
});

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

import StoryElementExtractorModal from '../StoryModule/StoryElementExtractorModal.jsx';
import EditElementModal from '../ElementForge/EditElementModal.jsx';
import { ElementForge } from '../ElementForge/ElementForge.jsx';
import OsrControlPanelDeck from '../StoryModule/workspaces/OsrControlPanelDeck.jsx';
import LorebookDossierModal from '../StoryModule/panels/LorebookDossierModal.jsx';

describe('Story Project <-> Elements Usability & Connections UI Audit', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockStoryValue.isStoryReadOnly = false;
    mockAdeState.perspectiveMode = 'architect';
  });

  it('1. StoryElementExtractorModal removes OmniCortex sync, normalizes Smart Prop -> Property, syncs linkedElements + assetHub, and blocks read-only projects', () => {
    const activeNode = { id: 'sc_1', title: 'Docking Bay', linkedElements: [], assetHub: [] };
    const { rerender } = render(
      <StoryElementExtractorModal
        isOpen={true}
        onClose={vi.fn()}
        initialText="Automated turret console."
        activeNode={activeNode}
      />
    );

    // No OmniCortex sync controls exist
    expect(screen.queryByText(/OMNICORTEX SYNC/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sync to Omnicortex/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Smart Prop'));
    fireEvent.change(
      screen.getByPlaceholderText(/Plasma Arc Rifle/i),
      { target: { value: 'Security Turret Terminal' } }
    );
    fireEvent.click(screen.getByRole('button', { name: /Create & Register Asset/i }));

    expect(mockDbmValue.saveEntry).not.toHaveBeenCalled();
    expect(mockStoryValue.updateSavedElement).toHaveBeenCalledTimes(1);
    const [savedId, savedElem] = mockStoryValue.updateSavedElement.mock.calls[0];
    expect(savedElem.type).toBe('Property');
    expect(mockStoryValue.updateStory).toHaveBeenCalledWith(
      'sc_1',
      expect.objectContaining({
        linkedElements: [savedId],
        assetHub: expect.arrayContaining([savedId])
      })
    );

    // Read-only guard
    vi.clearAllMocks();
    mockStoryValue.isStoryReadOnly = true;
    rerender(
      <StoryElementExtractorModal
        isOpen={true}
        onClose={vi.fn()}
        initialText="Locked prose."
        activeNode={activeNode}
      />
    );
    fireEvent.change(
      screen.getByPlaceholderText(/Plasma Arc Rifle/i),
      { target: { value: 'Should Block' } }
    );
    fireEvent.click(screen.getByRole('button', { name: /Create & Register Asset/i }));
    expect(mockStoryValue.updateSavedElement).not.toHaveBeenCalled();
  });

  it('2. EditElementModal toggles Project vs Public visibility and saves isPublic', () => {
    const onSave = vi.fn();
    render(
      <EditElementModal
        isOpen={true}
        onClose={vi.fn()}
        element={{
          id: 'elem_vis_1',
          title: 'Pulse Key',
          type: 'Property',
          isPublic: false,
          fields: {},
          createdAt: '2026-01-01T00:00:00Z'
        }}
        onSave={onSave}
        initialMode="sheet"
      />
    );

    const visibilityBtn = screen.getByRole('button', { name: /Project/i });
    fireEvent.click(visibilityBtn);
    expect(screen.getByRole('button', { name: /Public/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Save Element Changes/i }));
    expect(onSave).toHaveBeenCalled();
    const savedPayload = onSave.mock.calls[0][0];
    expect(savedPayload.isPublic).toBe(true);
  });

  it('3. ElementForge exposes Public / Shared filter pill and invokes loadPublicElements', () => {
    render(<ElementForge onBackToStory={vi.fn()} />);
    const publicBtn = screen.getByRole('button', { name: /Public \/ Shared/i });
    expect(publicBtn).toBeInTheDocument();
    fireEvent.click(publicBtn);
    expect(mockStoryValue.loadPublicElements).toHaveBeenCalled();
  });

  it('4. OsrControlPanelDeck hides Classified Architect Secrets in Operator perspective', () => {
    const activeNode = {
      id: 'sc_1',
      title: 'Airlock Ambush',
      fields: {
        readAloud: 'Sparks arc across the bulkhead.',
        gmSecrets: 'Hidden sniper in the vents.'
      }
    };

    mockAdeState.perspectiveMode = 'architect';
    const { rerender } = render(
      <OsrControlPanelDeck activeNode={activeNode} updateStory={vi.fn()} />
    );
    expect(screen.getByText(/Classified Architect Discovery \/ Complication/i)).toBeInTheDocument();

    mockAdeState.perspectiveMode = 'operator';
    rerender(
      <OsrControlPanelDeck activeNode={activeNode} updateStory={vi.fn()} />
    );
    expect(screen.queryByText(/Classified Architect Discovery \/ Complication/i)).not.toBeInTheDocument();
  });

  it('5. LorebookDossierModal strips ade-gm-secret HTML blocks cleanly from displayed lore', () => {
    render(
      <LorebookDossierModal
        isOpen={true}
        onClose={vi.fn()}
        entry={{
          id: 'lore_1',
          title: 'Reactor Core',
          type: 'Property',
          rawElement: {
            id: 'lore_1',
            type: 'Property',
            content: '<p>Standard fusion sphere.</p><div class="ade-gm-secret">Self-destruct bypass code 449</div>',
            fields: {}
          }
        }}
      />
    );
    expect(screen.getByText(/Standard fusion sphere/i)).toBeInTheDocument();
    expect(screen.queryByText(/Self-destruct bypass code 449/i)).not.toBeInTheDocument();
  });
});
