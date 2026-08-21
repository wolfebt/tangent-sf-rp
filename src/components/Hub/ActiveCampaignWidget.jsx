import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, MapPin, Play, Calendar, BookOpen, Layers } from 'lucide-react';
import { useStory } from '../../context/CampaignContext';
import { AudioService } from '../../services/audioService';

export const ActiveCampaignWidget = () => {
  const navigate = useNavigate();
  const { universeState, mapsCatalog } = useStory();

  const activeStoryTitle = universeState?.projectName || universeState?.title || 'Tangent Universe';
  const activeScenarios = universeState?.scenarios || [];
  const currentScenario = activeScenarios[0] || null;
  const activeMap = (mapsCatalog && mapsCatalog.length > 0) 
    ? mapsCatalog[0] 
    : (universeState?.maps && universeState.maps.length > 0 ? universeState.maps[0] : null);

  const scenarioCount = activeScenarios.length;
  const mapCount = (mapsCatalog?.length || 0) + (universeState?.maps?.length || 0);

  const handleAction = (path) => {
    AudioService.playTerminalBeep(1100, 0.03);
    navigate(path);
  };

  return (
    <div className="bg-slate-900/20 hover:bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-cyan-500/30 hover:border-cyan-400/80 flex flex-col justify-between h-full relative overflow-hidden group transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Ambient Cyberpunk Glow */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500"></div>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="text-cyan-400 animate-pulse" size={18} />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">
              ACTIVE CAMPAIGN OPS
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            ACTIVE MISSION
          </span>
        </div>

        {/* Mission Details */}
        <div className="mt-4 space-y-2.5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Campaign Operation</span>
            <h2 className="text-xl font-bold text-white tracking-wide truncate mt-0.5">
              {activeStoryTitle}
            </h2>
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={14} className="text-amber-400 shrink-0" />
              <span className="truncate">
                <strong className="text-slate-400 font-normal">Target Node:</strong> {currentScenario ? currentScenario.title : 'Sector Recon Alpha'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={14} className="text-slate-500 shrink-0" />
              <span>
                <strong className="text-slate-400 font-normal">Briefing:</strong> Tactical Session Ready
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <BookOpen size={12} className="text-cyan-400" /> {scenarioCount} {scenarioCount === 1 ? 'Scenario' : 'Scenarios'}
              </span>
              <span className="flex items-center gap-1">
                <Layers size={12} className="text-purple-400" /> {mapCount} {mapCount === 1 ? 'Tactical Map' : 'Tactical Maps'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => handleAction(activeMap ? `/foundry/map-maker?mapId=${activeMap.id}` : '/foundry/map-maker')}
          className="flex-1 min-w-[140px] py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-95"
        >
          <Play size={14} fill="currentColor" /> Resume Tactical VTT
        </button>

        <button
          type="button"
          onClick={() => handleAction('/foundry/story')}
          className="py-2.5 px-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1.5"
        >
          <BookOpen size={13} className="text-cyan-400" /> Story Tree
        </button>

        <button
          type="button"
          onClick={() => handleAction('/foundry/elements')}
          className="py-2.5 px-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
          title="Element Forge"
        >
          Forge
        </button>
      </div>
    </div>
  );
};

export default ActiveCampaignWidget;
