import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Map as MapIcon, Plus, Hammer, X, Rocket, Shield, Compass } from 'lucide-react';
import { StageViewportWrapper } from '../../../../components/VTT/stage/StageViewportWrapper';
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
  setWaypointPromptData
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
      {/* Tactical Stage Header Bar */}
      <div className="h-10 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 z-20 gap-2">
        {/* Left: Map status and selector */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold shrink-0">
            <Swords size={14} className="text-purple-400" />
            <span className="hidden sm:inline">Tactical Stage</span>
          </div>

          <div className="h-4 w-px bg-slate-800 shrink-0" />

          {/* Map Selector */}
          <div className="flex items-center gap-1.5 min-w-0">
            <MapIcon size={12} className="text-slate-400 shrink-0" />
            <select
              value={effectiveMap?.id || ''}
              onChange={(e) => {
                const val = e.target.value || null;
                if (activeNode && updateStory) {
                  updateStory(activeNode.id, { mapId: val });
                }
                if (val && setActiveMapId) setActiveMapId(val);
              }}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 max-w-[200px] truncate cursor-pointer"
              title="Select sector for tactical display"
            >
              <option value="">-- No Sector Selected --</option>
              {allAvailableMaps.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title || m.name || `Sector ${m.id.slice(0, 6)}`}
                  {m.id === activeNode?.mapId ? ' [Linked]' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* New Sector Button */}
          <button
            type="button"
            onClick={handleCreateNewMapForElement}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Spawn a new blank tactical grid sector for this scenario"
          >
            <Plus size={11} />
            <span className="hidden sm:inline">New Sector</span>
          </button>

          {/* Architect / Map Maker button if effectiveMap is available */}
          {effectiveMap && (
            <>
              <button
                type="button"
                onClick={() => {
                  const targetMapId = effectiveMap.id;
                  if (targetMapId && setActiveMapId) {
                    setActiveMapId(targetMapId);
                  }
                  if (typeof onSwitchView === 'function') {
                    onSwitchView('map');
                  } else {
                    navigate(`/foundry/map?mapId=${targetMapId}`);
                  }
                }}
                className="px-2 py-1 bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Launch Map Maker / Architect for this tactical grid"
              >
                <Hammer size={11} />
                <span className="hidden sm:inline">Sector Architect</span>
              </button>

              {isMapExplicitlyLinked && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeNode && updateStory) {
                      updateStory(activeNode.id, { mapId: null });
                    }
                  }}
                  className="p-1 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded text-xs transition-colors cursor-pointer"
                  title="Unlink map from this scenario"
                >
                  <X size={13} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Unlinked Sector Notice Banner */}
      {!isMapExplicitlyLinked && effectiveMap && (
        <div className="h-7 px-3 bg-amber-950/80 border-b border-amber-500/40 flex items-center justify-between text-[11px] text-amber-200 z-10 shrink-0 select-none">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-amber-400">Sector Preview:</span>
            <span className="truncate">{effectiveMap.title || effectiveMap.name || 'Tactical Sector'}</span>
            <span className="text-amber-400/70 hidden md:inline">• Not permanently linked to "{activeNode?.title || 'Current Scenario'}"</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (activeNode && updateStory) {
                updateStory(activeNode.id, { mapId: effectiveMap.id });
              }
              if (setActiveMapId) setActiveMapId(effectiveMap.id);
            }}
            className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[10px] cursor-pointer shrink-0 transition-colors"
            title="Link this sector to the active scenario node"
          >
            Link to Scenario
          </button>
        </div>
      )}

      {/* Tactical Stage Viewport or Empty State */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-[#050810]">
        {effectiveMap ? (
          <>
            <StageViewportWrapper
              campaignId={universeState?.id}
              sceneId={effectiveMap.id}
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
