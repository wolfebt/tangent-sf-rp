import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../../context/CampaignContext';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { AudioService } from '../../../services/audioService';
import { 
  Map, Play, Users, Eye, Shield, Sparkles, Sliders, 
  Copy, Check, ArrowLeft, Layers, Grid, Compass, ExternalLink
} from 'lucide-react';

export const VttOptionsPage = () => {
  const navigate = useNavigate();
  const { universeState, mapsCatalog } = useStory();
  const { personaRoster, roster } = useFolio();
  const { currentUser, userHandle } = useAuth();

  const allMaps = [
    ...(mapsCatalog || []),
    ...((universeState?.maps || []).filter(m => !(mapsCatalog || []).some(catM => catM.id === m.id)))
  ];

  const allOperatives = personaRoster || roster || [];

  // VTT Configuration State
  const [selectedMapId, setSelectedMapId] = useState(allMaps[0]?.id || 'default');
  const [selectedTokens, setSelectedTokens] = useState(() => allOperatives.map(o => o['character-doc-id'] || o.id));
  const [fogOfWarDefault, setFogOfWarDefault] = useState(true);
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(40);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedMap = allMaps.find(m => m.id === selectedMapId) || allMaps[0] || {
    id: 'default',
    title: 'Sector Recon Alpha',
    name: 'Sector Recon Alpha',
    width: 2000,
    height: 1500
  };

  const spectatorUrl = `${window.location.origin}/spectator/${selectedMap.id || 'tactical-zone'}`;

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

  const toggleTokenSelection = (docId) => {
    AudioService.playTerminalBeep(950, 0.02);
    setSelectedTokens(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleLaunchStageVtt = () => {
    AudioService.playTerminalBeep(1400, 0.04);
    navigate(`/stage?mapId=${selectedMap.id}`);
  };

  const handleLaunchMapMaker = () => {
    AudioService.playTerminalBeep(1200, 0.03);
    navigate(`/foundry/map-maker?mapId=${selectedMap.id}`);
  };

  return (
    <div className="h-full w-full bg-[#0d1117] text-slate-100 font-sans overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <button
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Hub
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-bold uppercase">
                TACTICAL OPERATIONS
              </span>
              <span className="text-slate-600 font-mono">•</span>
              <span className="text-slate-400 font-mono text-xs">VTT CONTROL CONSOLE</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLaunchMapMaker}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs uppercase rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Open 2D Vector Map Maker"
            >
              <Layers size={14} /> 2D Map Maker
            </button>
            <button
              onClick={handleLaunchStageVtt}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(34,211,238,0.5)] flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/40"
              title="Launch WebGPU Stage Engine with In-Situ Architect Design Studio"
            >
              <Play size={16} fill="currentColor" /> Launch WebGPU Stage & Architect Studio
            </button>
          </div>
        </div>

        {/* 2-Column Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Map Selection & Token Deployment */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Tactical Map Selection */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <Map className="text-cyan-400" size={18} />
                  <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                    1. Tactical Battlemap Selection
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {allMaps.length} {allMaps.length === 1 ? 'Map Available' : 'Maps Available'}
                </span>
              </div>

              {allMaps.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg">
                  <p className="text-xs text-slate-400 font-mono mb-3">No tactical maps found in current story project.</p>
                  <button
                    onClick={() => navigate('/foundry/map-maker')}
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold uppercase rounded-lg"
                  >
                    + Create New Tactical Map
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                  {allMaps.map(m => {
                    const isSelected = m.id === selectedMapId;
                    const mapTitle = m.name || m.title || 'Tactical Sector';
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          AudioService.playTerminalBeep(1000, 0.02);
                          setSelectedMapId(m.id);
                        }}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`text-xs font-bold font-mono uppercase truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {mapTitle}
                          </h3>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-mono font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 mt-2">
                          <span>{m.width || 2000} × {m.height || 1500} px</span>
                          <span>•</span>
                          <span>Grid: {m.gridSize || 40}px</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Hero Token Deployment */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-purple-400" size={18} />
                  <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                    2. Operative Token Deployment
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {selectedTokens.length} Deployed
                </span>
              </div>

              {allOperatives.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg">
                  <p className="text-xs text-slate-400 font-mono mb-3">No operative character sheets in Persona Folio.</p>
                  <button
                    onClick={() => navigate('/folio')}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold uppercase rounded-lg"
                  >
                    + Create Operative Sheet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {allOperatives.map(op => {
                    const docId = op['character-doc-id'] || op.id;
                    const isDeployed = selectedTokens.includes(docId);
                    const name = op['char-name'] || 'Operative';
                    const species = typeof op['char-species'] === 'object' ? op['char-species']?.name : op['char-species'] || 'Species N/A';
                    const occu = typeof op['char-occu'] === 'object' ? op['char-occu']?.name : op['char-occu'] || 'Role N/A';

                    return (
                      <div
                        key={docId}
                        onClick={() => toggleTokenSelection(docId)}
                        className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between gap-2 transition-all ${
                          isDeployed
                            ? 'bg-purple-950/50 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-60'
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-100 font-mono truncate uppercase">{name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{species} • {occu}</p>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                          isDeployed ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isDeployed ? '✓' : '+'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Spectator Link & Environment Settings */}
          <div className="space-y-6">
            
            {/* Spectator Mode Link Hub */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
                <Eye className="text-emerald-400" size={18} />
                <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                  Player Spectator Mode
                </h2>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-mono mb-4">
                Share this live tactical stream link with your players. Spectators see fog-of-war reveal, live token moves, and combat animations in real-time.
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 font-mono text-xs">
                <span className="text-slate-300 truncate text-[11px]">{spectatorUrl}</span>
                <button
                  onClick={handleCopySpectatorLink}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold uppercase shrink-0 transition-colors flex items-center gap-1"
                >
                  {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                onClick={() => window.open(spectatorUrl, '_blank')}
                className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold uppercase rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={13} /> Preview Spectator View
              </button>
            </div>

            {/* Encounter Tactical Preferences */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                <Sliders className="text-amber-400" size={18} />
                <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                  Tactical Grid Settings
                </h2>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Fog of War Masking</span>
                  <input
                    type="checkbox"
                    checked={fogOfWarDefault}
                    onChange={(e) => setFogOfWarDefault(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Snap Tokens to Grid</span>
                  <input
                    type="checkbox"
                    checked={gridSnap}
                    onChange={(e) => setGridSnap(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1.5">Grid Unit Size</span>
                  <div className="flex gap-2">
                    {[32, 40, 50, 64].map(sz => (
                      <button
                        key={sz}
                        onClick={() => setGridSize(sz)}
                        className={`flex-1 py-1 rounded text-xs font-bold ${
                          gridSize === sz ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default VttOptionsPage;
