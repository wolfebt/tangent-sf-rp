import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, MapPin, Play, Sliders, Layers, Eye, Copy, Check, 
  Map as MapIcon, Users, Swords, Radio, Sparkles, ChevronRight, Activity 
} from 'lucide-react';
import { useStory } from '../../context/CampaignContext';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';

export const CampaignOpsWidget = ({ onOpenVttOptionsDrawer, onShowOverview }) => {
  const navigate = useNavigate();
  const { universeState, mapsCatalog, activeMapId, setActiveMapId } = useStory();
  const { roster, personaRoster } = useFolio();
  const [copiedId, setCopiedId] = useState(null);

  const activeStoryTitle = universeState?.projectName || universeState?.title || 'Tangent Universe';
  const activeScenarios = universeState?.scenarios || [];
  const currentScenario = activeScenarios[0] || null;

  // Combine campaign maps
  const allMaps = [
    ...(universeState?.maps || []),
    ...(mapsCatalog || []).filter(cm => !(universeState?.maps || []).some(m => m.id === cm.id))
  ];

  const primaryMap = allMaps.find(m => m.id === activeMapId) || allMaps[0] || null;
  const recentMaps = allMaps.slice(0, 4);

  const handleLaunchMap = (mapId, e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1100, 0.03);
    if (setActiveMapId && mapId) {
      setActiveMapId(mapId);
    }
    navigate(`/foundry/map-maker${mapId ? `?mapId=${mapId}` : ''}`);
  };

  const handleCopySpectator = (mapId, e) => {
    if (e) e.stopPropagation();
    AudioService.playTerminalBeep(1250, 0.03);
    const url = `${window.location.origin}/spectator/${mapId || 'tactical-zone'}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(mapId);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const handleCardClick = () => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (onShowOverview) {
      onShowOverview();
    }
  };

  // Helper to extract character/unit names from map tokens
  const getMapDeployedCharacters = (map) => {
    if (!map || !map.tokens || map.tokens.length === 0) return [];
    return map.tokens
      .filter(t => t.type !== 'link')
      .map(t => t.label || t.name || 'Unit')
      .slice(0, 3);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-slate-900/15 hover:bg-slate-900/85 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border-2 border-cyan-500/70 hover:border-cyan-400 flex flex-col justify-between relative overflow-hidden group transition-all duration-200 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_24px_rgba(34,211,238,0.35)] cursor-pointer select-none"
    >
      {/* Ambient Cyberpunk Glow */}
      <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500"></div>

      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Target className="text-cyan-400 animate-pulse" size={14} />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
              CAMPAIGN OPS &amp; MAPS
            </span>
          </div>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[8px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            VTT COMMAND READY
          </span>
        </div>

        {/* Primary Map Banner */}
        <div className="p-2 rounded-lg bg-slate-950/80 border border-cyan-900/50 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[8px] font-mono uppercase tracking-wider text-cyan-400 block">
              Active Tactical Deployment:
            </span>
            <h3 className="text-xs font-bold text-white tracking-wide truncate font-mono">
              {primaryMap ? (primaryMap.title || primaryMap.name || 'Tactical Battlemap') : activeStoryTitle}
            </h3>
            <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <MapPin size={9} className="text-amber-400" />
              {currentScenario ? currentScenario.title : 'Sector Alpha Zone'}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => handleLaunchMap(primaryMap?.id, e)}
            className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-extrabold text-[10px] font-mono uppercase rounded-md flex items-center gap-1 shadow-[0_0_12px_rgba(34,211,238,0.4)] shrink-0 transition-all cursor-pointer"
          >
            <Play size={10} fill="currentColor" /> Enter VTT
          </button>
        </div>

        {/* Recent Maps & Used Characters List */}
        <div className="space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Recent Battlemaps &amp; Deployed Units ({allMaps.length}):
          </span>

          {allMaps.length === 0 ? (
            <div className="p-2 rounded bg-slate-950/50 border border-slate-800 text-[10px] text-slate-500 italic text-center font-mono">
              No battlemaps configured yet.
            </div>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
              {recentMaps.map(m => {
                const isActive = m.id === activeMapId || (!activeMapId && m.id === primaryMap?.id);
                const deployedChars = getMapDeployedCharacters(m);
                const tokenCount = (m.tokens || []).length;

                return (
                  <div
                    key={m.id}
                    onClick={(e) => handleLaunchMap(m.id, e)}
                    className={`p-1.5 rounded-lg border transition-all flex items-center justify-between text-[10px] font-mono cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/50 hover:bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate">
                          {m.title || m.name || 'Untitled Map'}
                        </span>
                        {isActive ? (
                          <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-extrabold border border-emerald-500/40 shrink-0">
                            🟢 LIVE ACTIVE
                          </span>
                        ) : (
                          <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-400 text-[8px] shrink-0">
                            ⚪ STANDBY
                          </span>
                        )}
                      </div>

                      {/* Deployed Characters Note */}
                      <div className="text-[9px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Users size={9} className="text-cyan-400 shrink-0" />
                        {deployedChars.length > 0 ? (
                          <span>
                            <strong className="text-slate-300">Units:</strong> {deployedChars.join(', ')}
                            {tokenCount > deployedChars.length ? ` (+${tokenCount - deployedChars.length})` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No units deployed</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopySpectator(m.id, e)}
                        title="Copy Player Spectator Link"
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 transition-colors"
                      >
                        {copiedId === m.id ? <Check size={10} /> : <Eye size={10} />}
                      </button>
                      <ChevronRight size={12} className="text-slate-500 group-hover:text-cyan-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenVttOptionsDrawer) {
              onOpenVttOptionsDrawer();
            } else {
              handleLaunchMap(primaryMap?.id, e);
            }
          }}
          className="flex-1 py-1 px-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-[9px] font-mono uppercase tracking-wider rounded-md border border-slate-700 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-1"
        >
          <Sliders size={10} className="text-cyan-400" /> VTT Console
        </button>

        <button
          type="button"
          onClick={(e) => handleCopySpectator(primaryMap?.id, e)}
          title="Copy Player Spectator Link"
          className="py-1 px-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 font-bold text-[9px] font-mono uppercase tracking-wider rounded-md border border-slate-700 hover:border-emerald-500/50 transition-colors flex items-center gap-1"
        >
          {copiedId === primaryMap?.id ? <Check size={10} className="text-emerald-400" /> : <Eye size={10} className="text-emerald-400" />}
          <span>{copiedId === primaryMap?.id ? 'Copied' : 'Spectator'}</span>
        </button>
      </div>
    </div>
  );
};

export default CampaignOpsWidget;
