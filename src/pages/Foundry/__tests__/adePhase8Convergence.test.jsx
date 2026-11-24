/**
 * @file adePhase8Convergence.test.jsx
 * @description Phase 8 React/DOM Convergence Suite covering:
 *   1. exportUtils.htmlToMarkdown (<ol>/<ul> item rendering without literal $1 and HTML entity decoding)
 *   2. SelectivePrintModal portal rendering into document.body, canonical v6 stats (SP / HP / Vitality / Defense CR / Actions), & 3 print layout modes
 *   3. StageSplitView invariant mount preservation across isOpen false -> true -> false toggles
 *   4. useMapIngestion canonical v6 defaults (30 HP / 30 Vit / 60 SP / CR 15 / 1 action) & breached door isOpen state
 */

import React, { useEffect, useRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

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

vi.mock('../../../context/CampaignContext', () => ({
  formatExportFilename: (name = 'untitled', ext = 'md') => `${name}.${ext}`,
  useCampaign: () => ({
    universeState: {
      scenarios: [{ id: 'sc_1', title: 'Docking Bay Breach', content: 'Airlocks fail.' }],
      creativeState: { storyCards: [] }
    },
    elementsCatalog: []
  })
}));

vi.mock('../../../context/FolioContext', () => ({
  useFolio: () => ({ personaRoster: [], characterData: null })
}));

vi.mock('../../../context/ToastContext', () => ({
  showToast: vi.fn()
}));

vi.mock('../../../context/ConfirmContext', () => ({
  showConfirm: vi.fn()
}));

vi.mock('../../../components/VTT/folio/ConnectedFolioTab', () => ({
  ConnectedFolioTab: () => <div data-testid="mock-folio-tab" />
}));

import { htmlToMarkdown } from '../StoryModule/exportUtils.js';
import { SelectivePrintModal } from '../../../components/StoryFoundry/SelectivePrintModal.jsx';
import { StageSplitView } from '../../../components/VTT/stage/StageSplitView.tsx';
import { useMapIngestion } from '../../../components/VTT/hooks/useMapIngestion.ts';
import { useEngineStore } from '../../../engine/state/VolatileSharder.ts';
import { BVHBuilder } from '../../../engine/vision/BVHBuilder.ts';
import { InteractiveObjectManager } from '../../../engine/assets/InteractiveObjectManager.ts';
import { LightSourceManager } from '../../../engine/vision/LightSourceManager.ts';

describe('ADE Phase 8 React & VTT Convergence Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    useEngineStore.getState().clearAllEntities?.();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('1. htmlToMarkdown renders actual list item text (never literal $1) and decodes HTML entities', () => {
    const html = '<h2>Mission Brief &amp; Ops</h2><ol><li>First Objective</li><li>Second &quot;Clean&quot; Item</li></ol><ul><li>Bullet A &lt;tag&gt;</li></ul>';
    const md = htmlToMarkdown(html);
    expect(md).not.toContain('$1');
    expect(md).toContain('Mission Brief & Ops');
    expect(md).toContain('1. First Objective');
    expect(md).toContain('2. Second "Clean" Item');
    expect(md).toContain('- Bullet A <tag>');
  });

  it('2. SelectivePrintModal portals to document.body with canonical v6 stats (SP/HP/CR/Actions) and layout modes', () => {
    render(
      <SelectivePrintModal
        isOpen={true}
        onClose={vi.fn()}
        universeState={{
          projectName: 'Orbital Heist',
          scenarios: [{ id: 's1', title: 'Airlock Entry', content: '<p>Breach the hull.</p>' }],
          creativeState: { storyOutline: 'Act 1 Summary', beatSheet: 'Beat 1 -> Beat 2' },
          maps: [
            {
              id: 'm1',
              title: 'Deck 4',
              tokens: [
                { id: 't_synth', name: 'Aegis Chassis', is_synthetic: true, base_structure: 60, armor_dr: 5, defense_dc: 16, actions_per_round: 2 },
                { id: 't_org', name: 'Void Corsair', is_synthetic: false, base_hp: 30, base_vitality: 30, armor_dr: 2, defense_dc: 15, actions_per_round: 1 }
              ]
            }
          ]
        }}
      />
    );

    const portalRoot = document.body.querySelector('#ade-print-portal-root');
    expect(portalRoot).not.toBeNull();
    expect(portalRoot.textContent).toContain('SP (Synthetic): 60');
    expect(portalRoot.textContent).toContain('HP: 30');
    expect(portalRoot.textContent).toContain('Vitality: 30');
    expect(portalRoot.textContent).toContain('Defense CR: 16');
    expect(portalRoot.textContent).not.toContain('AP: 3');

    // Switch across OSR Module -> Fiction Book -> Architect Cards
    fireEvent.click(screen.getByRole('button', { name: /Fiction Book/i }));
    const printableDoc = portalRoot.querySelector('#ade-selective-printable-document');
    expect(printableDoc.className).toContain('font-serif');
    fireEvent.click(screen.getByRole('button', { name: /Architect Cards/i }));
    expect(portalRoot.textContent).toContain('Compendium Reference Cut-Out Cards');
  });

  it('3. StageSplitView preserves children mount identity across open -> close -> open toggles', () => {
    let mountCount = 0;
    const PersistentCanvasProbe = () => {
      useEffect(() => {
        mountCount += 1;
      }, []);
      return <canvas data-testid="persistent-stage-canvas" />;
    };

    const Harness = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      const [tab, setTab] = React.useState('folio');
      return (
        <div>
          <button type="button" onClick={() => setIsOpen(v => !v)}>Toggle Split</button>
          <StageSplitView
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            activeTab={tab}
            onSelectTab={setTab}
          >
            <PersistentCanvasProbe />
          </StageSplitView>
        </div>
      );
    };

    render(<Harness />);
    expect(mountCount).toBe(1);
    const initialCanvas = screen.getByTestId('persistent-stage-canvas');

    fireEvent.click(screen.getByRole('button', { name: /Toggle Split/i }));
    expect(mountCount).toBe(1);
    expect(screen.getByTestId('persistent-stage-canvas')).toBe(initialCanvas);

    fireEvent.click(screen.getByRole('button', { name: /Toggle Split/i }));
    expect(mountCount).toBe(1);
    expect(screen.getByTestId('persistent-stage-canvas')).toBe(initialCanvas);
  });

  it('4. useMapIngestion enforces canonical v6 token defaults and opens breached/0-HP doors', () => {
    const bvh = new BVHBuilder();
    const objMgr = new InteractiveObjectManager();
    const lightMgr = new LightSourceManager();
    let capturedWalls = [];

    const IngestionHarness = ({ map }) => {
      const bvhRef = useRef(bvh);
      const objRef = useRef(objMgr);
      const lightRef = useRef(lightMgr);
      useMapIngestion({
        currentMap: map,
        bvhBuilderRef: bvhRef,
        interactiveObjMgrRef: objRef,
        lightSourceMgrRef: lightRef,
        setCombatLog: vi.fn(),
        setLocalWalls: (next) => { capturedWalls = next; },
        setLocalObjects: vi.fn(),
        setLocalLights: vi.fn(),
        setSelectedTokenId: vi.fn(),
        setTargetTokenId: vi.fn(),
        setUnderlayConfig: vi.fn(),
        setAtmosphericWeather: vi.fn()
      });
      return null;
    };

    render(
      <IngestionHarness
        map={{
          id: 'map_v6_check',
          walls: [
            { id: 'door_breached', type: 'door', doorState: 'breached', p1: { x: 0, y: 0 }, p2: { x: 70, y: 0 } },
            { id: 'door_zero_hp', type: 'door', breachHp: 0, p1: { x: 0, y: 70 }, p2: { x: 70, y: 70 } },
            { id: 'door_shut', type: 'door', doorState: 'closed', breachHp: 40, p1: { x: 0, y: 140 }, p2: { x: 70, y: 140 } }
          ],
          tokens: [
            { id: 'tok_bare', name: 'Recruit' }
          ]
        }}
      />
    );

    expect(capturedWalls.find(w => w.id === 'door_breached')?.isOpen).toBe(true);
    expect(capturedWalls.find(w => w.id === 'door_zero_hp')?.isOpen).toBe(true);
    expect(capturedWalls.find(w => w.id === 'door_shut')?.isOpen).toBe(false);

    const staticTok = useEngineStore.getState().staticData?.['tok_bare'];
    expect(staticTok).toBeDefined();
    expect(staticTok.base_hp).toBe(30);
    expect(staticTok.base_vitality).toBe(30);
    expect(staticTok.base_structure).toBe(60);
    expect(staticTok.armor_dr).toBe(0);
    expect(staticTok.stamina_dr).toBe(0);
    expect(staticTok.defense_dc).toBe(15);
    expect(staticTok.actions_per_round).toBe(1);
  });
});
