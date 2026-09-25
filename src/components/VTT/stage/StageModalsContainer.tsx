import React from 'react';
import LandmassGeneratorModal from '../../../pages/Foundry/MapMaker/map/LandmassGeneratorModal.jsx';
import { UvttImportModal } from '../../../pages/Foundry/MapMaker/map/UvttImportModal.jsx';
import MapAssetManagerModal from '../../../pages/Foundry/MapMaker/map/MapAssetManagerModal.jsx';
import MapUnderlayCalibrationModal from '../../../pages/Foundry/MapMaker/map/MapUnderlayCalibrationModal.jsx';
import { FolioHeroTokenDrawer } from '../../../pages/Foundry/MapMaker/map/FolioHeroTokenDrawer.jsx';
import { OmnicortexAssetDrawer } from '../../../pages/Foundry/MapMaker/map/OmnicortexAssetDrawer.jsx';
import InteractiveObjectModal from '../../../pages/Foundry/MapMaker/map/InteractiveObjectModal.jsx';
import HazmatVolumeManagerModal from '../../../pages/Foundry/MapMaker/map/HazmatVolumeManagerModal.jsx';
import MapLayersPanel from '../../../pages/Foundry/MapMaker/map/MapLayersPanel.jsx';
import { DEFAULT_LAYERS } from '../../../pages/Foundry/MapMaker/map/MapConstants';

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
  setUnderlayConfig
}) => {
  return (
    <>
      {/* 1. Procedural Landmass Generator Modal */}
      <LandmassGeneratorModal
        isOpen={isLandmassModalOpen}
        onClose={() => setIsLandmassModalOpen(false)}
        onCommitLandmass={handleCommitLandmass}
        defaultRenderMode={terrainRenderMode}
      />

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
        onUpdateTokenHealth={() => {}}
        onUpdateTokenVitality={() => {}}
        onUpdateTokenStructure={() => {}}
        onTriggerFloatingText={() => {}}
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
        onUpdateHazardZone={() => {}}
        onDeleteHazardZone={() => {}}
        onUpdateTokenHealth={() => {}}
        onUpdateTokenVitality={() => {}}
        onUpdateTokenStructure={() => {}}
        onUpdateTokenConditions={() => {}}
        onTriggerFloatingText={() => {}}
      />

      {/* 8. Map Layers Manager Panel */}
      <MapLayersPanel
        showLayersPanel={isLayersPanelOpen}
        setShowLayersPanel={setIsLayersPanelOpen}
        mapLayers={currentMap?.layers || DEFAULT_LAYERS}
        toggleLayerVisibility={toggleLayerVisibility}
        toggleLayerLock={toggleLayerLock}
        deleteCustomLayer={() => {}}
        newLayerNameInput=""
        setNewLayerNameInput={() => {}}
        addCustomLayer={() => {}}
      />

      {/* 9. Background Blueprint Underlay Calibration Modal */}
      <MapUnderlayCalibrationModal
        isOpen={isUnderlayModalOpen}
        onClose={() => setIsUnderlayModalOpen(false)}
        currentUnderlay={underlayConfig}
        onApplyUnderlay={(cfg: any) => {
          recordHistory('Apply Blueprint Underlay');
          setUnderlayConfig(cfg);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { underlay: cfg });
          }
        }}
        onClearUnderlay={() => {
          recordHistory('Clear Blueprint Underlay');
          setUnderlayConfig(null);
          if (currentMap && updateMap) {
            updateMap(currentMap.id, { underlay: null });
          }
        }}
      />
    </>
  );
};
