import React from 'react';
import { PcgAiStudioTab } from '../../../pages/Foundry/MapMaker/components/PcgAiStudioTab';
import { UvttImportModal } from '../../../pages/Foundry/MapMaker/map/UvttImportModal.jsx';
import MapAssetManagerModal from '../../../pages/Foundry/MapMaker/map/MapAssetManagerModal.jsx';
import MapUnderlayCalibrationModal from '../../../pages/Foundry/MapMaker/map/MapUnderlayCalibrationModal.jsx';
import { FolioHeroTokenDrawer } from '../../../pages/Foundry/MapMaker/map/FolioHeroTokenDrawer.jsx';
import { OmnicortexAssetDrawer } from '../../../pages/Foundry/MapMaker/map/OmnicortexAssetDrawer.jsx';
import InteractiveObjectModal from '../../../pages/Foundry/MapMaker/map/InteractiveObjectModal.jsx';
import HazmatVolumeManagerModal from '../../../pages/Foundry/MapMaker/map/HazmatVolumeManagerModal.jsx';
import MapLayersPanel from '../../../pages/Foundry/MapMaker/map/MapLayersPanel.jsx';
import { DEFAULT_LAYERS } from '../../../pages/Foundry/MapMaker/map/MapConstants';
import { useAuth } from '../../../context/AuthContext';
import { useEngineStore } from '../../../engine/state/VolatileSharder.ts';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { showToast } from '../../../context/ToastContext';
import { AssetStudioModal } from '../studio/AssetStudioModal';
import { AssetIngestionModal } from '../ingestion/AssetIngestionModal';
import { SpriteSheetCutterModal } from '../ingestion/SpriteSheetCutterModal';
import type { AssetUnit } from '../../../schemas/assetUnitSchema';

export interface StageModalsContainerProps {
  isLandmassModalOpen: boolean;
  setIsLandmassModalOpen: (open: boolean) => void;
  handleCommitLandmass: (payload: any) => void;
  terrainRenderMode: any;

  isUvttModalOpen: boolean;
  setIsUvttModalOpen: (open: boolean) => void;
  handleImportCompleteUvtt: (mapData: any) => void;

  isAssetManagerOpen: boolean;
  setIsAssetManagerOpen: (open: boolean) => void;
  universeState: any;
  addCustomTerrain: any;
  updateCustomTerrain: any;
  deleteCustomTerrain: any;
  addCustomObject: any;
  updateCustomObject: any;
  deleteCustomObject: any;
  currentMap: any;

  isHeroDrawerOpen: boolean;
  setIsHeroDrawerOpen: (open: boolean) => void;
  handleSummonHeroToken: (heroPayload: any) => void;

  isOmnicortexDrawerOpen: boolean;
  setIsOmnicortexDrawerOpen: (open: boolean) => void;
  handleSummonOmnicortexAsset: (assetData: any) => void;

  inspectingInteractiveObj: any;
  setInspectingInteractiveObj: (obj: any) => void;
  recordHistory: (actionName?: string) => void;
  localObjects: any[];
  setLocalObjects: React.Dispatch<React.SetStateAction<any[]>>;
  interactiveObjMgrRef: React.MutableRefObject<any>;
  updateMap: any;

  isHazmatModalOpen: boolean;
  setIsHazmatModalOpen: (open: boolean) => void;
  hazardSimulatorRef: React.MutableRefObject<any>;
  setHazardCount: (count: number) => void;

  isLayersPanelOpen: boolean;
  setIsLayersPanelOpen: (open: boolean) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;

  isUnderlayModalOpen: boolean;
  setIsUnderlayModalOpen: (open: boolean) => void;
  underlayConfig: any;
  setUnderlayConfig: (cfg: any) => void;

  isAssetStudioOpen?: boolean;
  setIsAssetStudioOpen?: (open: boolean) => void;
  selectedStudioAsset?: AssetUnit | null;
  onSaveStudioAsset?: (asset: AssetUnit) => void;

  isAssetIngestionOpen?: boolean;
  setIsAssetIngestionOpen?: (open: boolean) => void;
  onAssetIngested?: (asset: AssetUnit) => void;

  isSpriteSheetCutterOpen?: boolean;
  setIsSpriteSheetCutterOpen?: (open: boolean) => void;
}

export const StageModalsContainer: React.FC<StageModalsContainerProps> = ({
  isLandmassModalOpen,
  setIsLandmassModalOpen,
  handleCommitLandmass,
  terrainRenderMode,

  isUvttModalOpen,
  setIsUvttModalOpen,
  handleImportCompleteUvtt,

  isAssetManagerOpen,
  setIsAssetManagerOpen,
  universeState,
  addCustomTerrain,
  updateCustomTerrain,
  deleteCustomTerrain,
  addCustomObject,
  updateCustomObject,
  deleteCustomObject,
  currentMap,

  isHeroDrawerOpen,
  setIsHeroDrawerOpen,
  handleSummonHeroToken,

  isOmnicortexDrawerOpen,
  setIsOmnicortexDrawerOpen,
  handleSummonOmnicortexAsset,

  inspectingInteractiveObj,
  setInspectingInteractiveObj,
  recordHistory,
  localObjects,
  setLocalObjects,
  interactiveObjMgrRef,
  updateMap,

  isHazmatModalOpen,
  setIsHazmatModalOpen,
  hazardSimulatorRef,
  setHazardCount,

  isLayersPanelOpen,
  setIsLayersPanelOpen,
  toggleLayerVisibility,
  toggleLayerLock,

  isUnderlayModalOpen,
  setIsUnderlayModalOpen,
  underlayConfig,
  setUnderlayConfig,

  isAssetStudioOpen = false,
  setIsAssetStudioOpen,
  selectedStudioAsset = null,
  onSaveStudioAsset,

  isAssetIngestionOpen = false,
  setIsAssetIngestionOpen,
  onAssetIngested,

  isSpriteSheetCutterOpen = false,
  setIsSpriteSheetCutterOpen
}) => {
  const { currentUser } = (useAuth() as any) || {};
  const [newLayerNameInput, setNewLayerNameInput] = React.useState('');

  const broadcastTokenState = (id: string) => {
    const eph = useEngineStore.getState().ephemeralData[id];
    if (eph) {
      getVttMultiplayerSync().broadcastTokenVitals(id, eph);
    }
  };

  const handleUpdateTokenHealth = (id: string, val: number) => {
    useEngineStore.getState().setHealth(id, val);
    broadcastTokenState(id);
  };

  const handleUpdateTokenVitality = (id: string, val: number) => {
    useEngineStore.getState().setVitality(id, val);
    broadcastTokenState(id);
  };

  const handleUpdateTokenStructure = (id: string, val: number) => {
    useEngineStore.getState().setStructure(id, val);
    broadcastTokenState(id);
  };

  const handleUpdateTokenConditions = (id: string, conditionOrList: string | string[]) => {
    const store = useEngineStore.getState();
    if (Array.isArray(conditionOrList)) {
      const current = store.ephemeralData[id]?.active_conditions || [];
      conditionOrList.forEach((c) => {
        if (!current.includes(c)) store.addCondition(id, c);
      });
      current.forEach((c) => {
        if (!conditionOrList.includes(c)) store.toggleCondition(id, c);
      });
    } else if (typeof conditionOrList === 'string' && conditionOrList) {
      store.toggleCondition(id, conditionOrList);
    }
    broadcastTokenState(id);
  };

  const handleTriggerFloatingText = (text: string, color?: string) => {
    if (!text) return;
    showToast({ type: color === '#ef4444' ? 'error' : 'info', text });
  };

  return (
    <>
      {/* 1. Procedural Content Generation (PCG) Modal */}
      {isLandmassModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
          <div className="bg-slate-950 border border-cyan-800 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <PcgAiStudioTab
              isModal={true}
              onCloseModal={() => setIsLandmassModalOpen(false)}
              terrainRenderMode={terrainRenderMode}
              onCommitPcgSector={(payload) => {
                handleCommitLandmass(payload);
                setIsLandmassModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Universal VTT (.uvtt) Importer Modal */}
      <UvttImportModal
        isOpen={isUvttModalOpen}
        onClose={() => setIsUvttModalOpen(false)}
        onImportComplete={handleImportCompleteUvtt}
      />

      {/* 3. Map Asset & Texture Manager Modal */}
      <MapAssetManagerModal
        isOpen={isAssetManagerOpen}
        onClose={() => setIsAssetManagerOpen(false)}
        customAssets={universeState?.customAssets || { terrains: [], objects: [] }}
        onAddCustomTerrain={addCustomTerrain}
        onUpdateCustomTerrain={updateCustomTerrain}
        onDeleteCustomTerrain={deleteCustomTerrain}
        onAddCustomObject={addCustomObject}
        onUpdateCustomObject={updateCustomObject}
        onDeleteCustomObject={deleteCustomObject}
        currentScale={currentMap?.type || 'Tactical'}
      />

      {/* 4. Folio Hero Token Drawer */}
      <FolioHeroTokenDrawer
        showDrawer={isHeroDrawerOpen}
        setShowDrawer={setIsHeroDrawerOpen}
        onSummonToken={handleSummonHeroToken}
      />

      {/* 5. Omnicortex Asset Drawer */}
      <OmnicortexAssetDrawer
        showDrawer={isOmnicortexDrawerOpen}
        setShowDrawer={setIsOmnicortexDrawerOpen}
        onSummonAsset={handleSummonOmnicortexAsset}
      />

      {/* 6. Interactive Object Configurator Modal */}
      <InteractiveObjectModal
        objectNode={inspectingInteractiveObj}
        isOpen={Boolean(inspectingInteractiveObj)}
        onClose={() => setInspectingInteractiveObj(null)}
        onUpdateObject={(id: string, updated: any) => {
          recordHistory();
          const updatedObjects = localObjects.map((o: any) => o.id === id ? { ...o, ...updated } : o);
          setLocalObjects(updatedObjects);
          interactiveObjMgrRef.current?.loadObjects(updatedObjects);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { objects: updatedObjects });
          }
          setInspectingInteractiveObj(null);
        }}
        onDeleteObject={(id: string) => {
          recordHistory();
          const updatedObjects = localObjects.filter((o: any) => o.id !== id);
          setLocalObjects(updatedObjects);
          interactiveObjMgrRef.current?.loadObjects(updatedObjects);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { objects: updatedObjects });
          }
          setInspectingInteractiveObj(null);
        }}
        onUpdateTokenHealth={handleUpdateTokenHealth}
        onUpdateTokenVitality={handleUpdateTokenVitality}
        onUpdateTokenStructure={handleUpdateTokenStructure}
        onTriggerFloatingText={handleTriggerFloatingText}
      />

      {/* 7. Hazmat Volume Manager Modal */}
      <HazmatVolumeManagerModal
        isOpen={isHazmatModalOpen}
        onClose={() => setIsHazmatModalOpen(false)}
        hazardZones={(hazardSimulatorRef.current?.getActiveHazards() as any) || []}
        onAddHazardZone={(hz: any) => {
          hazardSimulatorRef.current?.addHazardField(hz);
          setHazardCount(hazardSimulatorRef.current?.getActiveHazards().length || 0);
        }}
        onUpdateHazardZone={(id: string, updates: any) => {
          const existing = (hazardSimulatorRef.current?.getActiveHazards() || []).find((h: any) => h.id === id);
          hazardSimulatorRef.current?.removeHazardField?.(id);
          if (existing) {
            hazardSimulatorRef.current?.addHazardField({ ...existing, ...updates, id });
          }
          setHazardCount(hazardSimulatorRef.current?.getActiveHazards().length || 0);
        }}
        onDeleteHazardZone={(id: string) => {
          hazardSimulatorRef.current?.removeHazardField?.(id);
          setHazardCount(hazardSimulatorRef.current?.getActiveHazards().length || 0);
        }}
        onUpdateTokenHealth={handleUpdateTokenHealth}
        onUpdateTokenVitality={handleUpdateTokenVitality}
        onUpdateTokenStructure={handleUpdateTokenStructure}
        onUpdateTokenConditions={handleUpdateTokenConditions}
        onTriggerFloatingText={handleTriggerFloatingText}
      />

      {/* 8. Map Layers Manager Panel */}
      <MapLayersPanel
        showLayersPanel={isLayersPanelOpen}
        setShowLayersPanel={setIsLayersPanelOpen}
        mapLayers={currentMap?.layers || DEFAULT_LAYERS}
        toggleLayerVisibility={toggleLayerVisibility}
        toggleLayerLock={toggleLayerLock}
        deleteCustomLayer={(layerId: string) => {
          if (!currentMap || !updateMap) return;
          const nextLayers = (currentMap.layers || DEFAULT_LAYERS).filter((l: any) => l.id !== layerId);
          updateMap(currentMap.id, { layers: nextLayers });
        }}
        newLayerNameInput={newLayerNameInput}
        setNewLayerNameInput={setNewLayerNameInput}
        addCustomLayer={() => {
          const clean = newLayerNameInput.trim();
          if (!clean || !currentMap || !updateMap) return;
          const nextLayers = [
            ...(currentMap.layers || DEFAULT_LAYERS),
            { id: `layer_custom_${Date.now()}`, name: clean, visible: true, locked: false }
          ];
          updateMap(currentMap.id, { layers: nextLayers });
          setNewLayerNameInput('');
        }}
      />

      {/* 9. Background Blueprint Underlay Calibration Modal */}
      <MapUnderlayCalibrationModal
        isOpen={isUnderlayModalOpen}
        onClose={() => setIsUnderlayModalOpen(false)}
        currentUnderlay={underlayConfig}
        currentVideoUrl={currentMap?.videoBackgroundUrl || ''}
        mapId={currentMap?.id || 'map'}
        userId={currentUser?.uid || null}
        onApplyUnderlay={(cfg: any) => {
          recordHistory('Apply Blueprint Underlay');
          setUnderlayConfig(cfg);
          if (currentMap && updateMap) {
            if (cfg?.isVideo) {
              updateMap(currentMap.id, { videoBackgroundUrl: cfg.url || null, underlay: cfg });
            } else {
              updateMap(currentMap.id, { underlay: cfg });
            }
          }
        }}
        onClearUnderlay={() => {
          recordHistory('Clear Blueprint Underlay');
          setUnderlayConfig(null);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { underlay: null, videoBackgroundUrl: null });
          }
        }}
      />

      {/* 10. Asset Studio & Property Forge Modal */}
      {isAssetStudioOpen && selectedStudioAsset && (
        <AssetStudioModal
          isOpen={isAssetStudioOpen}
          asset={selectedStudioAsset}
          onClose={() => setIsAssetStudioOpen?.(false)}
          onSaveAsset={(updated) => {
            onSaveStudioAsset?.(updated);
            setIsAssetStudioOpen?.(false);
          }}
        />
      )}

      {/* 11. External Asset Ingestion Modal */}
      {isAssetIngestionOpen && (
        <AssetIngestionModal
          isOpen={isAssetIngestionOpen}
          onClose={() => setIsAssetIngestionOpen?.(false)}
          onAssetIngested={(asset) => {
            onAssetIngested?.(asset);
            setIsAssetIngestionOpen?.(false);
          }}
        />
      )}

      {/* 12. Sprite Sheet & Tile Slicer Modal */}
      {isSpriteSheetCutterOpen && (
        <SpriteSheetCutterModal
          isOpen={isSpriteSheetCutterOpen}
          onClose={() => setIsSpriteSheetCutterOpen?.(false)}
          onBatchIngested={(assets: AssetUnit[]) => {
            assets.forEach((s: AssetUnit) => onAssetIngested?.(s));
            setIsSpriteSheetCutterOpen?.(false);
          }}
        />
      )}
    </>
  );
};
