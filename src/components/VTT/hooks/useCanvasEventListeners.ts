/**
 * @file useCanvasEventListeners.ts
 * @description Hook managing VTT canvas event listeners and event-bus triggers:
 * - Sentry alerts & tactical detections
 * - Companion / Drone deployment & recall
 * - Studio & Cartography drawers/modals (Landmass, UVTT, Asset Manager, Hero Drawer, Omnicortex)
 */

import { useEffect } from 'react';
import { VttEventBus } from '../../../utils/vttEventBus';
import { useEngineStore, type StaticEntity } from '../../../engine/index';
import { AudioService } from '../../../services/audioService';

export interface UseCanvasEventListenersOptions {
  setIsLandmassModalOpen: (v: boolean) => void;
  setIsUvttModalOpen: (v: boolean) => void;
  setIsAssetManagerOpen: (v: boolean) => void;
  setIsHeroDrawerOpen: (v: boolean) => void;
  setIsOmnicortexDrawerOpen: (v: boolean) => void;
  setIsLayersPanelOpen?: (v: boolean) => void;
  selectedTokenId: string | null;
  setSelectedTokenId: (id: string | null) => void;
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useCanvasEventListeners({
  setIsLandmassModalOpen,
  setIsUvttModalOpen,
  setIsAssetManagerOpen,
  setIsHeroDrawerOpen,
  setIsOmnicortexDrawerOpen,
  setIsLayersPanelOpen,
  selectedTokenId,
  setSelectedTokenId,
  setCombatLog
}: UseCanvasEventListenersOptions): void {
  // Sentry alert listener
  useEffect(() => {
    const off = VttEventBus.on('sentry-alert', ({ detectedHero, alertBark }) => {
      setCombatLog(prev => [
        `🚨 [SENTRY ALERT] ${alertBark || 'Intruder detected in sector!'} (Target: ${detectedHero?.name || detectedHero?.label || 'Hero'})`,
        ...prev.slice(0, 8)
      ]);
      AudioService.playTerminalBeep(1200, 0.4);
    });

    return off;
  }, [setCombatLog]);

  // Companion & Cohort deployment listener
  useEffect(() => {
    const off = VttEventBus.on('companion-deploy-toggle', (detail) => {
      if (!detail) return;
      const { companionId, companion, parentOperativeName, is_deployed } = detail;
      const store = useEngineStore.getState();

      if (is_deployed) {
        // Deploy companion token near parent or stage origin
        const tokenId = `comp_tok_${companionId}`;
        const isSynth = companion?.chassisType === 'synthetic' || companion?.type === 'drone';
        const compEntity: StaticEntity = {
          id: tokenId,
          name: `${companion?.name || 'Companion'} (${parentOperativeName || 'Cohort'})`,
          base_hp: isSynth ? (companion?.vitals?.max_structure || 50) : (companion?.vitals?.max_hp || 25),
          base_health: isSynth ? 0 : (companion?.vitals?.max_hp || 25),
          base_vitality: isSynth ? 0 : (companion?.vitals?.max_vitality || 25),
          base_structure: isSynth ? (companion?.vitals?.max_structure || 50) : 0,
          is_synthetic: isSynth,
          tech_level: 3,
          armor_dr: companion?.armor?.dr || 2,
          size_modifier: -1,
          speed_ft: (companion?.speed || 10) * 3,
          species: isSynth ? 'Synthetic Drone' : 'Companion',
          archetype: companion?.role || 'Companion',
          is_persona: false
        };
        store.loadStaticEntitiesBatch([compEntity]);
        store.updatePosition(tokenId, 200 + Math.random() * 40, 200 + Math.random() * 40);
        setSelectedTokenId(tokenId);
      } else {
        // Recall companion token from stage
        const tokenId = `comp_tok_${companionId}`;
        store.removeEntity(tokenId);
        if (selectedTokenId === tokenId) {
          setSelectedTokenId(null);
        }
      }
    });

    return off;
  }, [selectedTokenId, setSelectedTokenId]);

  // Cartography & studio modal listeners
  useEffect(() => {
    const offLandmass = VttEventBus.on('open-landmass-modal', () => setIsLandmassModalOpen(true));
    const offUvtt = VttEventBus.on('open-uvtt-modal', () => setIsUvttModalOpen(true));
    const offAsset = VttEventBus.on('open-asset-manager', () => setIsAssetManagerOpen(true));
    const offHero = VttEventBus.on('open-hero-drawer', () => setIsHeroDrawerOpen(true));
    const offOmni = VttEventBus.on('open-omnicortex-drawer', () => setIsOmnicortexDrawerOpen(true));
    const offLayers = setIsLayersPanelOpen ? VttEventBus.on('open-layers-panel', () => setIsLayersPanelOpen(true)) : () => {};

    return () => {
      offLandmass();
      offUvtt();
      offAsset();
      offHero();
      offOmni();
      offLayers();
    };
  }, [
    setIsLandmassModalOpen,
    setIsUvttModalOpen,
    setIsAssetManagerOpen,
    setIsHeroDrawerOpen,
    setIsOmnicortexDrawerOpen,
    setIsLayersPanelOpen
  ]);
}
