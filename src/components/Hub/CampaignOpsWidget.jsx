import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, MapPin, Play, Sliders, Layers, Eye, Copy, Check, Map } from 'lucide-react';
import { useStory } from '../../context/CampaignContext';
import { AudioService } from '../../services/audioService';

export const CampaignOpsWidget = ({ onOpenVttOptionsDrawer, onShowOverview }) => {
  const navigate = useNavigate();
  const { universeState, mapsCatalog } = useStory();
  const [copied, setCopied] = useState(false);

  const activeStoryTitle = universeState?.projectName || universeState?.title || 'Tangent Universe';
  const activeScenarios = universeState?.scenarios || [];
  const currentScenario = activeScenarios[0] || null;
  const activeMap = (mapsCatalog && mapsCatalog.length > 0) 
    ? mapsCatalog[0] 
    : (universeState?.maps && universeState.maps.length > 0 ? universeState.maps[0] : null);

  const scenarioCount = activeScenarios.length;
  const mapCount = (mapsCatalog?.length || 0) + (universeState?.maps?.length || 0);

  const mapId = activeMap?.id || 'tactical-zone';
  const spectatorUrl = `${window.location.origin}/spectator/${mapId}`;

  const handleAction = (path, e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1100, 0.03);
    navigate(path);
  };

  const handleCopySpectator = (e) => {
    e.stopPropagation();
    AudioService.playTerminalBeep(1250, 0.03);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(spectatorUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleCardClick = () => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (onShowOverview) {
      onShowOverview();
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-slate-900/30 hover:bg-slate-900/80 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-cyan-500/40 hover:border-cyan-400/90 flex flex-col justify-between relative overflow-hidden group transition-all duration-200 shadow-[0_0_15px_rgba(34,211,238,0.1)] cursor-pointer select-none"
    >
      {/* Ambient Cyberpunk Glow */}
      <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500"></div>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="text-cyan-400 animate-pulse" size={16} />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">
              CAMPAIGN OPS
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            VTT READY
          </span>
        </div>

        {/* Mission / VTT Tactical Details */}
        <div className="mt-2.5 space-y-1.5">
          <div>
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Tactical Deployment</span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate mt-0.5 font-mono">
              {activeMap ? (activeMap.name || activeMap.title || 'Tactical Battlemap') : activeStoryTitle}
            </h2>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={12} className="text-amber-400 shrink-0" />
              <span className="truncate text-[10.5px]">
                <strong className="text-slate-400 font-normal">Active Node:</strong> {currentScenario ? currentScenario.title : 'Sector Alpha'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="flex items-center gap-1">
                <Map size={11} className="text-cyan-400" /> {mapCount} {mapCount === 1 ? 'Map' : 'Maps'}
              </span>
              <span className="flex items-center gap-1">
                <Layers size={11} className="text-purple-400" /> {scenarioCount} {scenarioCount === 1 ? 'Scenario' : 'Scenarios'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1.5">
        <button
          type="button"
          onClick={(e) => handleAction(activeMap ? `/foundry/map-maker?mapId=${activeMap.id}` : '/foundry/map-maker', e)}
          className="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-[11px] font-mono uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-98"
        >
          <Play size={12} fill="currentColor" /> Launch Tactical VTT
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenVttOptionsDrawer) {
                onOpenVttOptionsDrawer();
              } else {
                handleAction('/vtt-ops', e);
              }
            }}
            className="flex-1 py-1.5 px-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-[10px] font-mono uppercase tracking-wider rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-1"
          >
            <Sliders size={11} className="text-cyan-400" /> VTT Options
          </button>

          <button
            type="button"
            onClick={handleCopySpectator}
            title="Copy Player Spectator Link"
            className="py-1.5 px-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 font-bold text-[10px] font-mono uppercase tracking-wider rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors flex items-center gap-1"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Eye size={11} className="text-emerald-400" />}
            <span>{copied ? 'Copied' : 'Spectator'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignOpsWidget;
