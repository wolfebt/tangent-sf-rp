import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Map as MapIcon, Plus, Hammer, X, Rocket, Shield, Compass } from 'lucide-react';
import TripartiteStageView from '../../../../components/VTT/TripartiteStageView';
import { WaypointPromptChip } from '../../../../components/VTT/stage/WaypointPromptChip';
import { 
  createBlankCanvas, 
  createDerelictStarshipMap, 
  createResearchOutpostMap, 
  createPlanetaryLandingZoneMap 
} from '../../../../components/VTT/stage/defaultMaps';

export default function TacticalStageViewport({
  activeNode,
  linkedMap,
  allAvailableMaps = [],
  universeState,
  updateStory,
  setActiveMapId,
  addMap,
  handleCreateNewMapForElement,
  onSwitchView,
  waypointPromptData,
  executeWaypointTrigger,
  setWaypointPromptData,
  onSwitchToWeaver
}) {
  const navigate = useNavigate();

  // Determine effective map to display: linked to node, or active in universe, or first available map
  const effectiveMap = linkedMap || 
    (activeNode?.mapId ? allAvailableMaps.find(m => m.id === activeNode.mapId) : null) ||
    (universeState?.activeMapId ? allAvailableMaps.find(m => m.id === universeState.activeMapId) : null) ||
    (allAvailableMaps.length > 0 ? allAvailableMaps[0] : null);

  const isMapExplicitlyLinked = Boolean(activeNode?.mapId && effectiveMap && activeNode.mapId === effectiveMap.id);

  const handleDeployPresetMap = (mapCreator, defaultTitle) => {
    const newMap = typeof mapCreator === 'function' ? mapCreator() : createBlankCanvas({ title: defaultTitle });
    if (addMap) addMap(newMap);
    if (activeNode && updateStory) {
      updateStory(activeNode.id, { mapId: newMap.id });
    }
    if (setActiveMapId) {
      setActiveMapId(newMap.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full min-h-0 overflow-hidden bg-[#070b13] relative font-mono">
      {/* Tactical Stage Viewport or Empty State */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-[#050810]">
        {effectiveMap ? (
          <>
            <TripartiteStageView
              campaignId={universeState?.id}
              sceneId={effectiveMap.id}
              onSwitchToWeaver={onSwitchToWeaver}
            />
            <WaypointPromptChip
              promptData={waypointPromptData}
              onExecute={executeWaypointTrigger}
              onClose={() => setWaypointPromptData(null)}
            />
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center select-none font-mono">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 mb-4 shadow-xl">
              <Swords size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">No Tactical Sector Available</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Deploy a sci-fi tactical encounter sector or blank canvas to activate live WebGPU rendering, token movements, dynamic lighting, and narrative waypoints.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full">
              <button
                type="button"
                onClick={handleCreateNewMapForElement}
                className="py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={14} />
                <span>Blank Tactical Hex Grid</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeployPresetMap(createDerelictStarshipMap, 'Derelict Starship Corridor')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Rocket size={14} />
                <span>Derelict Starship</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeployPresetMap(createResearchOutpostMap, 'Research Outpost Lab')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield size={14} />
                <span>Bio-Lab Cleanroom</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeployPresetMap(createPlanetaryLandingZoneMap, 'Planetary Landing Zone')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass size={14} />
                <span>Planetary Landing Zone</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
