import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  Play, 
  ExternalLink, 
  Copy, 
  Check, 
  Shield, 
  Eye, 
  Sparkles, 
  Layers, 
  Radio, 
  Activity,
  Heart,
  Crosshair,
  Sliders,
  Send
} from 'lucide-react';
import { useStory } from '../../context/CampaignContext';
import { useFolio } from '../../context/FolioContext';
import { useChat } from '../../context/ChatContext';
import { AudioService } from '../../services/audioService';

export const CommsVttPanel = () => {
  const navigate = useNavigate();
  const { universeState, mapsCatalog, activeMapId, setActiveMapId } = useStory();
  const { personaRoster = [], roster = [] } = useFolio();
  const { broadcastToVtt, setBroadcastToVtt, sendDiceRoll } = useChat();

  const [copiedLink, setCopiedLink] = useState(false);

  const allMaps = [
    ...(mapsCatalog || []),
    ...((universeState?.maps || []).filter(m => !(mapsCatalog || []).some(catM => catM.id === m.id)))
  ];

  const currentMap = allMaps.find(m => m.id === activeMapId) || allMaps[0] || {
    id: 'default_sector',
    title: 'Sector 4 Orbital Outpost',
    name: 'Sector 4 Orbital Outpost',
    width: 2000,
    height: 1500,
    gridSize: 40
  };

  const allOperatives = personaRoster.length > 0 ? personaRoster : roster;
  const spectatorUrl = `${window.location.origin}/spectator/${currentMap.id || 'tactical-zone'}`;

  const handleCopySpectatorLink = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(spectatorUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    } else {
      prompt('Copy Spectator URL:', spectatorUrl);
    }
  };

  const handleLaunchStage = () => {
    AudioService.playTerminalBeep(1400, 0.04);
    navigate(`/stage?mapId=${currentMap.id}`);
  };

  const handleLaunchVttOptions = () => {
    AudioService.playTerminalBeep(1150, 0.02);
    navigate('/vtt-ops');
  };

  return (
    <div className="h-full flex flex-col bg-[#0b1019] text-slate-100 select-none overflow-hidden font-sans border-r border-slate-800/80">
      {/* Top Header */}
      <div className="p-3 border-b border-slate-800 bg-gradient-to-b from-slate-900/90 to-transparent shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Map size={15} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-100 block">
                TACTICAL VTT STAGE
              </h3>
              <span className="text-[9.5px] font-mono text-amber-400 block">
                VTT ENGINE INTEGRATION
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLaunchStage}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-[10.5px] font-mono font-bold shadow-md transition-all cursor-pointer"
            title="Open Master VTT Stage Viewport"
          >
            <Play size={12} fill="currentColor" />
            <span>ENTER STAGE</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar text-xs font-mono">
        {/* 1. Active Scenario Map Card */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-cyan-400" />
              <span>ACTIVE TACTICAL SCENARIO</span>
            </span>

            {/* Map selector */}
            {allMaps.length > 1 && (
              <select
                value={currentMap.id}
                onChange={(e) => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  if (setActiveMapId) setActiveMapId(e.target.value);
                }}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-[10px] focus:outline-none focus:border-cyan-500"
              >
                {allMaps.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title || m.name || m.id}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100 truncate">
                {currentMap.title || currentMap.name || 'Sector Recon Alpha'}
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] rounded font-bold">
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
              <div>DIMENSIONS: <strong className="text-slate-200">{currentMap.width || 2000}×{currentMap.height || 1500}</strong></div>
              <div>GRID SCALE: <strong className="text-slate-200">{currentMap.gridSize || 40}px</strong></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopySpectatorLink}
              className={`p-2 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {copiedLink ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedLink ? 'LINK COPIED!' : 'SPECTATOR LINK'}</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchVttOptions}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders size={12} />
              <span>VTT CONFIG</span>
            </button>
          </div>
        </div>

        {/* 2. Broadcast Comms to Stage Toggle */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Radio size={16} className={broadcastToVtt ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
            <div>
              <span className="font-bold text-slate-200 block text-xs">
                BROADCAST ROLLS TO VTT STAGE
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Stream chat dice rolls &amp; tactical checks directly into stage HUD
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.02);
              setBroadcastToVtt(prev => !prev);
            }}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              broadcastToVtt ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                broadcastToVtt ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Operative Combatants on Stage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Shield size={12} className="text-emerald-400" />
              <span>STAGE COMBATANTS &amp; OPERATIVES</span>
            </span>
            <span>{allOperatives.length} TOKENS</span>
          </div>

          <div className="space-y-1.5">
            {allOperatives.length === 0 ? (
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[10.5px] text-slate-500 italic text-center">
                No operative tokens registered in folio roster.
              </div>
            ) : (
              allOperatives.map((op, idx) => {
                const name = op['char-name'] || op.name || `Operative ${idx + 1}`;
                const hp = op.current_health ?? (op.current_hp ?? op.health ?? 30);
                const maxHp = op.health ?? (op.base_hp ?? 30);
                const role = op['char-concept'] || op.role || op['char-occu'] || 'Specialist';

                return (
                  <div
                    key={op['character-doc-id'] || op.id || idx}
                    className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                        🎭
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-200 block truncate text-[11px]">
                          {name}
                        </span>
                        <span className="text-[9.5px] text-slate-400 block truncate">
                          {role}
                        </span>
                      </div>
                    </div>

                    {/* Vitals */}
                    <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 shrink-0">
                      <Heart size={10} className="text-emerald-400" />
                      <span className="text-emerald-300 font-bold">{hp}/{maxHp}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-400 font-bold">VTT ENGINE READY</span>
        </span>
        <button
          type="button"
          onClick={handleLaunchStage}
          className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
        >
          <span>OPEN VTT</span>
          <ExternalLink size={10} />
        </button>
      </div>
    </div>
  );
};

export default CommsVttPanel;
