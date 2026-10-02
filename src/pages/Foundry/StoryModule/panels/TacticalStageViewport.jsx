import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Map as MapIcon, Plus, Hammer, X } from 'lucide-react';
import { StageViewportWrapper } from '../../../../components/VTT/stage/StageViewportWrapper';
import { WaypointPromptChip } from '../../../../components/VTT/stage/WaypointPromptChip';

export default function TacticalStageViewport({
  activeNode,
  linkedMap,
  allAvailableMaps,
  universeState,
  updateStory,
  setActiveMapId,
  handleCreateNewMapForElement,
  onSwitchView,
  waypointPromptData,
  executeWaypointTrigger,
  setWaypointPromptData
}) {
  const navigate = useNavigate();

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
              value={activeNode?.mapId || ''}
              onChange={(e) => {
                const val = e.target.value || null;
                if (activeNode) {
                  updateStory(activeNode.id, { mapId: val });
                  if (val && setActiveMapId) setActiveMapId(val);
                }
              }}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 max-w-[200px] truncate"
              title="Select linked map for this scenario node"
            >
              <option value="">-- No Map Linked --</option>
              {allAvailableMaps.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title || m.name || `Sector ${m.id.slice(0, 6)}`}
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

          {/* Architect / Map Maker button if linked */}
          {(activeNode?.mapId || linkedMap?.id) && (
            <>
              <button
                type="button"
                onClick={() => {
                  const targetMapId = activeNode?.mapId || linkedMap?.id;
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

              <button
                type="button"
                onClick={() => {
                  if (activeNode) {
                    updateStory(activeNode.id, { mapId: null });
                  }
                }}
                className="p-1 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded text-xs transition-colors cursor-pointer"
                title="Unlink map from this scenario"
              >
                <X size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tactical Stage Viewport or Empty State */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-[#050810]">
        {activeNode?.mapId || linkedMap?.id ? (
          <>
            <StageViewportWrapper
              campaignId={universeState?.id}
              sceneId={activeNode?.mapId || linkedMap?.id}
            />
            <WaypointPromptChip
              promptData={waypointPromptData}
              onExecute={executeWaypointTrigger}
              onClose={() => setWaypointPromptData(null)}
            />
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 mb-4 shadow-xl">
              <Swords size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">No Tactical Sector Linked</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Connect a tactical battlemap to this scenario node to unlock live WebGPU rendering, token management, dynamic lighting, and narrative waypoints.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCreateNewMapForElement}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} />
                <span>Create New Sector</span>
              </button>
              {allAvailableMaps.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && activeNode) {
                      updateStory(activeNode.id, { mapId: e.target.value });
                      if (setActiveMapId) setActiveMapId(e.target.value);
                    }
                  }}
                  className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-xs cursor-pointer focus:outline-none focus:border-purple-500"
                >
                  <option value="" disabled>Link existing sector...</option>
                  {allAvailableMaps.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title || m.name || `Sector ${m.id.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
