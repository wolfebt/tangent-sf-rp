import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { Map, X, Plus, Search, Eye, Check, Trash2, ChevronRight, ArrowUpRight } from 'lucide-react';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

export const MapsDrawer = ({ onClose, onOpenDrawer }) => {
  const navigate = useNavigate();
  const { universeState, mapsCatalog, deleteSavedMap } = useStory();

  const [mapSearch, setMapSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState('');

  const allMaps = [
    ...(mapsCatalog || []),
    ...((universeState?.maps || []).filter(m => !(mapsCatalog || []).some(catM => catM.id === m.id)))
  ];

  const filtered = allMaps.filter(m => {
    if (!mapSearch.trim()) return true;
    const q = mapSearch.toLowerCase();
    return (m.name || m.title || '').toLowerCase().includes(q);
  });

  const handleCopyShareLink = (url, key) => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(key);
        setTimeout(() => setCopiedLink(''), 2500);
      });
    } else {
      prompt('Copy Spectator URL:', url);
    }
  };

  const handleOpenMapWorkspace = (mapId) => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (onOpenDrawer) {
      onOpenDrawer('foundry-maps-workspace');
    } else {
      navigate(`/foundry/map-maker?mapId=${mapId}`);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3.5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-bold uppercase">
              STORY FOUNDRY
            </span>
            <span className="text-slate-600 font-mono">•</span>
            <span className="text-slate-400 font-mono text-xs">VTT TACTICAL BATTLEMAPS</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Tactical Maps Catalog
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.03);
              if (onOpenDrawer) onOpenDrawer('foundry-maps-workspace');
              else navigate('/foundry/map-maker');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> New Map
          </button>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.02);
              navigate('/foundry/map-maker');
            }}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono font-bold uppercase transition-colors hidden sm:flex items-center gap-1"
            title="Open Full Browser View (/foundry/map-maker)"
          >
            <ArrowUpRight size={13} />
            <span>FULL BROWSER</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full shrink-0">
        <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search tactical battlemaps..."
          value={mapSearch}
          onChange={(e) => setMapSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Maps Vertical Stacked Gem-Like List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[calc(100vh-320px)]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <Map size={28} className="mx-auto text-slate-600 mb-2" />
            <h4 className="text-sm font-mono font-bold text-slate-300 uppercase">No Battlemaps Found</h4>
            <p className="text-xs text-slate-500 font-mono mt-1 mb-4">Create tactical battlemaps with tokens and fog of war.</p>
            <button
              onClick={() => {
                if (onOpenDrawer) onOpenDrawer('foundry-maps-workspace');
                else navigate('/foundry/map-maker');
              }}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase rounded-lg shadow inline-flex items-center gap-1.5"
            >
              <Plus size={13} /> Create Map
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(m => {
              const mapTitle = m.name || m.title || 'Tactical Sector';
              const spectatorUrl = `${window.location.origin}/spectator/${m.id}`;

              return (
                <div
                  key={m.id}
                  onClick={() => handleOpenMapWorkspace(m.id)}
                  className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-cyan-500/60 hover:bg-slate-900/60 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  {/* Left: Gem Pill & Map Details */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-xs text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)] shrink-0">
                      <Map size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white font-mono uppercase truncate group-hover:text-cyan-200 transition-colors">
                          {mapTitle}
                        </h4>
                        <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded text-[8.5px] font-mono font-bold shrink-0">
                          {m.width || 2000}×{m.height || 1500}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                        <span>Grid: {m.gridSize || 40}px</span>
                        <span>•</span>
                        <span>Objects: {m.objects?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyShareLink(spectatorUrl, m.id);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1"
                      title="Copy Spectator Mode Link"
                    >
                      {copiedLink === m.id ? <Check size={11} className="text-emerald-400" /> : <Eye size={11} />}
                      <span>{copiedLink === m.id ? 'Copied' : 'Spectator'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetName = m.name || m.title || 'Untitled Map';
                        if (confirmTypedDeletion(targetName, 'tactical map')) {
                          deleteSavedMap(m.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                      title="Delete Map"
                    >
                      <Trash2 size={13} />
                    </button>

                    <button
                      onClick={() => handleOpenMapWorkspace(m.id)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-colors flex items-center gap-1"
                    >
                      <span>Enter VTT</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapsDrawer;
