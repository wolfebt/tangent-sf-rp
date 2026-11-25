/**
 * @file waveAP0Fixes.test.jsx
 * @description Wave A (P0) React UI Regression Suite:
 *   1. ModularCharacterAssembler preserves multi-item loadout/aspect arrays & outputs armor as an array
 *   2. ArtistHubModal Token Framer calls uploadAdeImageAsset(dataUrl, { userId, assetCategory: 'tokens', fileName })
 *   3. EditElementModal Canon Auto-Fix repairs non-summary fields (mechanic) & toggles isDirty on isPublic
 *   4. ElementForge renders Public / Shared source filter pill on non-Cortex type (Clue) and calls loadPublicElements
 *   5. GraphPlaySimulator evaluates Story-Flag conditions on branching options
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  toastMock,
  uploadAdeImageAssetMock,
  mockAuthValue,
  mockDbmValue,
  mockFolioValue,
  mockStoryValue
} = vi.hoisted(() => ({
  toastMock: vi.fn(),
  uploadAdeImageAssetMock: vi.fn(async () => ({ url: 'https://cdn.tangent.test/tokens/framed_tok.webp' })),
  mockAuthValue: { currentUser: { uid: 'arch_wave_a' }, isAdmin: false },
  mockDbmValue: {
    dbData: {
      species: [{ id: 'sp_1', name: 'Human' }],
      weaponry: [{ id: 'w_1', name: 'Arc Rifle', damage: '2d8', range: 'Medium' }],
      armoring: [{ id: 'a_1', name: 'Titan Vest', dr: 6 }],
      gear: [],
      features: [],
      traits: [],
      disadvantages: [],
      augmentations: [],
      invocations: [],
      modular_characters: []
    },
    saveEntry: vi.fn(),
    deleteEntry: vi.fn()
  },
  mockFolioValue: {
    roster: [],
    personaRoster: [],
    publicPersonas: [],
    publicCatalog: [],
    saveCurrentToRoster: vi.fn(),
    switchRosterCharacter: vi.fn()
  },
  mockStoryValue: {
    universeState: {
      id: 'story_wave_a',
      projectName: 'Wave A Frontier',
      scenarios: [{ id: 'sc_1', title: 'Docking Bay', content: '<p>Entry.</p>' }],
      creativeState: { storyCards: [] },
      customTemplates: []
    },
    elementsCatalog: [
      { id: 'clue_local', title: 'Keycard Shard', type: 'Clue', fields: {}, createdAt: '2026-01-01T00:00:00Z' },
      { id: 'clue_pub', title: 'Shared Cipher', type: 'Clue', isPublic: true, fields: {}, createdAt: '2026-01-01T00:00:00Z' }
    ],
    publicElementsCatalog: [],
    loadPublicElements: vi.fn(async () => []),
    updateSavedElement: vi.fn(),
    deleteSavedElement: vi.fn(),
    toggleElementVisibility: vi.fn(),
    updateStory: vi.fn(),
    setUniverseState: vi.fn(),
    setIsDirty: vi.fn(),
    mapsCatalog: [],
    cronicle: { activeDay: 1 },
    addGalleryModifier: vi.fn(),
    isStoryReadOnly: false
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
  default: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() },
  AudioService: { playTerminalBeep: vi.fn(), playCriticalChime: vi.fn(), playCombatHit: vi.fn() }
}));

vi.mock('../../../services/aimeService', () => ({
  generateContent: vi.fn(async () => '{}')
}));

vi.mock('../../../services/diceService', () => ({
  rollDice: vi.fn(() => ({ total: 14, rolls: [7, 7], formatted: '[7, 7]' }))
}));

vi.mock('../../../services/adeMediaStorageService', () => ({
  uploadAdeImageAsset: uploadAdeImageAssetMock
}));

vi.mock('../../../services/artistHubImageService', () => ({
  generateConceptArt: vi.fn(async () => ({ url: 'data:image/png;base64,AAA' })),
  ALLOWED_ARTIST_IMAGE_MODELS: ['gemini-2.5-flash-image']
}));

vi.mock('../../../utils/firebaseTokenStore', () => ({
  getFreshFirebaseIdToken: vi.fn(async () => 'tok_mock')
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

vi.mock('../../../components/StoryFoundry/TokenFramerPanel', () => ({
  default: ({ onExportToken }) => (
    <button
      type="button"
      onClick={() => onExportToken?.('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')}
    >
      Trigger Mock Token Export
    </button>
  )
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
vi.mock('../ElementForge/guided/stages/Stage1SparkAndCanon', () => ({ default: () => null }));
vi.mock('../ElementForge/guided/stages/Stage2DirectorialLens', () => ({ default: () => null }));
vi.mock('../ElementForge/guided/stages/Stage3CoreReality', () => ({ default: () => null }));
vi.mock('../ElementForge/guided/stages/Stage4TacticalSystems', () => ({ default: () => null }));
vi.mock('../ElementForge/guided/stages/Stage5WebAndFinalize', () => ({ default: () => null }));

import { ModularCharacterAssembler } from '../ElementForge/components/ModularCharacterAssembler.jsx';
import { ArtistHubModal } from '../../../components/StoryFoundry/ArtistHubModal.jsx';
import EditElementModal from '../ElementForge/EditElementModal.jsx';
import { ElementForge } from '../ElementForge/ElementForge.jsx';
import { GraphPlaySimulator } from '../StoryModule/workspaces/graph/GraphPlaySimulator.jsx';
import { useADEStore } from '../store/adeStore.ts';

describe('Wave A (P0) Security, Data Integrity & Core Contract Fixes', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    useADEStore.getState().setStoryScope('default');
  });

  it('1. ModularCharacterAssembler preserves multi-item loadout/feature arrays and writes armor as an array', () => {
    const onBatchFieldChange = vi.fn();
    const multiFeatures = [
      { id: 'f1', name: 'Precision Strike' },
      { id: 'f2', name: 'Zero-G Reflex' }
    ];
    const multiWeapons = [
      { id: 'w1', name: 'Pulse Pistol', damage: '2d6' },
      { id: 'w2', name: 'Mono Blade', damage: '2d8' }
    ];
    const multiArmor = [
      { id: 'a1', name: 'Exo-Carapace', dr: 4, equipped: true },
      { id: 'a2', name: 'Subdermal Mesh', dr: 3, equipped: true }
    ];

    render(
      <ModularCharacterAssembler
        fields={{
          mcmTier: '2',
          features: JSON.stringify(multiFeatures),
          weapons: multiWeapons,
          armor: multiArmor
        }}
        onFieldChange={vi.fn()}
        onBatchFieldChange={onBatchFieldChange}
        elementTitle="Veteran Operative"
      />
    );

    // Trigger auto-sync by bumping Threat Tier slider (previously wiped multi-item arrays & overwrote armor with string)
    const tierSlider = screen.getByRole('slider');
    fireEvent.change(tierSlider, { target: { value: '3' } });
    expect(onBatchFieldChange).toHaveBeenCalledTimes(1);
    const patch = onBatchFieldChange.mock.calls[0][0];

    expect(Array.isArray(patch.armor)).toBe(true);
    expect(patch.armor.length).toBe(2);
    expect(patch.armor.map((a) => a.name)).toContain('Exo-Carapace');
    expect(patch.armor.map((a) => a.name)).toContain('Subdermal Mesh');
    expect(patch.features.map((f) => f.name)).toContain('Precision Strike');
    expect(patch.features.map((f) => f.name)).toContain('Zero-G Reflex');
    expect(patch.weapons.length).toBe(2);
    expect(patch.weapons.map((w) => w.name)).toContain('Mono Blade');
  });

  it('2. ArtistHubModal Token Framer invokes uploadAdeImageAsset with (dataUrl, options) signature', async () => {
    const onApplyAsset = vi.fn();
    render(
      <ArtistHubModal
        isOpen={true}
        onClose={vi.fn()}
        onApplyAsset={onApplyAsset}
        elementContext={{ id: 'el_tok_1', title: 'Kael Voss', type: 'Persona' }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Quick Build/i }));
    fireEvent.click(screen.getByRole('button', { name: /Open Token Framer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Trigger Mock Token Export/i }));

    await waitFor(() => {
      expect(uploadAdeImageAssetMock).toHaveBeenCalledTimes(1);
    });
    const [arg1, arg2] = uploadAdeImageAssetMock.mock.calls[0];
    expect(typeof arg1).toBe('string');
    expect(arg1.startsWith('data:image/')).toBe(true);
    expect(arg2).toEqual(
      expect.objectContaining({
        userId: 'arch_wave_a',
        assetCategory: 'tokens'
      })
    );
  });

  it('3. EditElementModal Canon Auto-Fix repairs non-summary fields (mechanic) and marks isDirty when isPublic toggles', () => {
    const onSave = vi.fn();
    render(
      <EditElementModal
        isOpen={true}
        onClose={vi.fn()}
        element={{
          id: 'el_canon_1',
          title: 'Kinetic Amplifier',
          type: 'Property',
          propertySubcategory: 'gear',
          isPublic: false,
          content: '<p>Standard booster coil.</p>',
          fields: {
            mechanic: 'Spend 2 Action Points to trigger a d20 roll.'
          },
          createdAt: '2026-01-01T00:00:00Z'
        }}
        onSave={onSave}
        initialMode="sheet"
      />
    );

    // Toggle Public visibility -> save payload reflects isPublic: true
    fireEvent.click(screen.getByRole('button', { name: /Project/i }));
    expect(screen.getByRole('button', { name: /Public/i })).toBeInTheDocument();

    // Open Canon Linter drawer and click Auto-Fix sequentially until no auto-fix buttons remain
    const canonBadge = screen.getByRole('button', { name: /Canon:/i });
    fireEvent.click(canonBadge);
    let safety = 0;
    while (screen.queryAllByRole('button', { name: /Auto-Fix/i }).length > 0 && safety < 5) {
      fireEvent.click(screen.getAllByRole('button', { name: /Auto-Fix/i })[0]);
      safety++;
    }
    expect(safety).toBeGreaterThanOrEqual(2);

    // Save and confirm fields.mechanic was repaired (AP / d20 replaced)
    fireEvent.click(screen.getByRole('button', { name: /Save Element Changes/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0];
    expect(saved.isPublic).toBe(true);
    expect(saved.fields.mechanic).not.toMatch(/\bd20\b/i);
    expect(saved.fields.mechanic).not.toMatch(/\bAction Points?\b/i);
  });

  it('4. ElementForge exposes Public / Shared filter pill on non-Cortex type Clue and invokes loadPublicElements', () => {
    useADEStore.getState().setActiveElementType('Clue');
    render(<ElementForge activeType="Clue" onBackToStory={vi.fn()} />);

    const publicBtn = screen.getByRole('button', { name: /Public \/ Shared/i });
    expect(publicBtn).toBeInTheDocument();
    fireEvent.click(publicBtn);
    expect(mockStoryValue.loadPublicElements).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Shared Cipher')).toBeInTheDocument();
    expect(screen.queryByText('Keycard Shard')).not.toBeInTheDocument();
  });

  it('5. GraphPlaySimulator locks conditional branches until storyFlags satisfy expression', () => {
    const store = useADEStore.getState();
    store.setStoryScope('story_wave_a');
    store.setStoryFlag('airlockUnlocked', false);

    const onAdvanceNode = vi.fn();
    const currentNode = {
      id: 'sc_start',
      title: 'Airlock Threshold',
      type: 'Scene',
      content: '<p>Sealed bulkhead.</p>',
      fields: {
        connections: [
          { id: 'c_locked', label: 'Enter Reactor', targetId: 'sc_reactor', condition: 'airlockUnlocked == true' },
          { id: 'c_open', label: 'Wait in Corridor', targetId: 'sc_corridor' }
        ]
      }
    };
    const allNodes = [
      currentNode,
      { id: 'sc_reactor', title: 'Reactor Core' },
      { id: 'sc_corridor', title: 'Main Corridor' }
    ];

    const { rerender } = render(
      <GraphPlaySimulator
        isActive={true}
        currentNode={currentNode}
        allNodes={allNodes}
        historyTrail={['sc_start']}
        onSelectNode={vi.fn()}
        onAdvanceNode={onAdvanceNode}
        onRewindToStep={vi.fn()}
        onResetSimulation={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const lockedBtn = screen.getByRole('button', { name: /Enter Reactor/i });
    expect(lockedBtn).toBeDisabled();
    fireEvent.click(lockedBtn);
    expect(onAdvanceNode).not.toHaveBeenCalled();

    // Unlock flag and re-render
    store.setStoryFlag('airlockUnlocked', true);
    rerender(
      <GraphPlaySimulator
        isActive={true}
        currentNode={currentNode}
        allNodes={allNodes}
        historyTrail={['sc_start']}
        onSelectNode={vi.fn()}
        onAdvanceNode={onAdvanceNode}
        onRewindToStep={vi.fn()}
        onResetSimulation={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const unlockedBtn = screen.getByRole('button', { name: /Enter Reactor/i });
    expect(unlockedBtn).not.toBeDisabled();
    fireEvent.click(unlockedBtn);
    expect(onAdvanceNode).toHaveBeenCalledWith('sc_reactor');
  });
});
