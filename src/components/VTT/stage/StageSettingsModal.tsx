/**
 * @file StageSettingsModal.tsx
 * @description Consolidated Stage Settings & Tactical Operations Console for ADE The Stage.
 * Unifies Map selection, Operative token deployment, live Spectator stream broadcasting,
 * and Tactical Engine preferences (Grid, LoS, Audio) into an in-situ modal.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Map, 
  Users, 
  Eye, 
  Sliders, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Volume2, 
  X,
  Plus
} from 'lucide-react';
import { useCampaign } from '../../../context/CampaignContext';
import { useFolio } from '../../../context/FolioContext';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { GridType } from '../../../engine/math/CoordinateEngine';
import { AudioService } from '../../../services/audioService';
import { useConfirm } from '../../../context/ConfirmContext';
import { showToast } from '../../../context/ToastContext';
import { VttEventBus } from '../../../utils/vttEventBus';

export interface StageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMapId?: string;
  onSelectMap?: (mapId: string) => void;
  onDeployElement?: (element: any) => void;
}

type SettingsTab = 'maps' | 'tokens' | 'spectator' | 'engine';

export const StageSettingsModal: React.FC<StageSettingsModalProps> = ({
  isOpen,
  onClose,
  activeMapId,
  onSelectMap,
  onDeployElement
}) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { universeState, updateMap, setActiveMapId } = useCampaign();
  const { personaRoster, roster } = (useFolio() as any) || {};

  const {
    gridSnap,
    toggleGridSnap,
    gridType,
    setGridType,
    isGridVisible,
    toggleGridVisible,
    isDynamicLightingEnabled,
    toggleDynamicLighting
  } = useUILayoutStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('maps');
  const [copiedLink, setCopiedLink] = useState(false);
  const [fogOfWarEnabled, setFogOfWarEnabled] = useState(true);
  const [measurementUnit, setMeasurementUnit] = useState<'meters' | 'feet' | 'hexes'>('meters');
  const [gridSize, setGridSize] = useState<number>(40);
  const [audioVolume, setAudioVolume] = useState<number>(() => {
    return typeof window !== 'undefined' ? parseFloat(localStorage.getItem('tangent_audio_volume') || '0.35') : 0.35;
  });

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const availableMaps = universeState?.maps || [];
  const currentMap = availableMaps.find((m: any) => m.id === activeMapId) || availableMaps[0];
  const currentMapId = currentMap?.id || activeMapId || 'tactical-zone';

  const allOperatives: any[] = personaRoster || roster || [];
  const deployedTokenIds = new Set((currentMap?.tokens || []).map((t: any) => t.personaId || t.docId || t.id));

  const spectatorUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/spectator/${currentMapId}`
    : '';

  const handleCopySpectatorLink = async () => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(spectatorUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
        showToast({
          type: 'success',
          title: 'URL Copied',
          text: 'Spectator URL copied to clipboard.'
        });
        return;
      } catch (err) {
        // Fallback to modal
      }
    }
    await confirm({
      title: 'Spectator URL',
      message: 'Copy Spectator URL to clipboard:',
      inputLabel: 'Spectator URL',
      inputValue: spectatorUrl,
      confirmLabel: 'Done'
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    AudioService.setVolume(val);
  };

  const handleDeployPersona = (op: any) => {
    AudioService.playTerminalBeep(1300, 0.03);
    if (onDeployElement) {
      const element = {
        id: op['character-doc-id'] || op.id || `persona-${Date.now()}`,
        name: op['char-name'] || op.name || 'Operative',
        type: 'Persona',
        role: typeof op['char-occu'] === 'object' ? op['char-occu']?.name : op['char-occu'] || 'Operative',
        species: typeof op['char-species'] === 'object' ? op['char-species']?.name : op['char-species'] || 'Human',
        health: op['derived-traits']?.health?.max || op.health?.max || 30,
        vitality: op['derived-traits']?.vitality?.max || op.vitality?.max || 30,
        structure: op['derived-traits']?.structure?.max || op.structure?.max || 0,
        data: op
      };
      onDeployElement(element);
    }
  };

  const handleSwitchMap = (mapId: string) => {
    AudioService.playTerminalBeep(1050, 0.02);
    if (onSelectMap) onSelectMap(mapId);
    if (setActiveMapId) setActiveMapId(mapId);
  };

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-mono animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-[#0b121d] border border-cyan-500/70 rounded-2xl p-5 w-full max-w-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white flex flex-col gap-4 max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-xl text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Settings size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-300">
                  VTT Stage Settings &amp; Operations
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-200">
                  CONTROL CONSOLE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Battlemaps, Operative Token Deployment, Vision Rules &amp; Spectator Link
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveTab('maps');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              activeTab === 'maps'
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Map size={13} />
            <span>Maps ({availableMaps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveTab('tokens');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              activeTab === 'tokens'
                ? 'bg-purple-950/90 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users size={13} />
            <span>Operatives ({allOperatives.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveTab('spectator');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              activeTab === 'spectator'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Eye size={13} />
            <span>Spectator Hub</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveTab('engine');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              activeTab === 'engine'
                ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders size={13} />
            <span>Engine &amp; Audio</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-[300px]">
          {/* TAB 1: TACTICAL MAPS */}
          {activeTab === 'maps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Select active tactical scene for the stage:</span>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    navigate(`/foundry/map-maker?mapId=${currentMapId}`);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Layers size={11} /> 2D Map Maker
                </button>
              </div>

              {availableMaps.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400 mb-3">No tactical maps created yet in this campaign.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/foundry/map-maker');
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
                  >
                    + Create New Map
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableMaps.map((m: any) => {
                    const isSelected = m.id === currentMapId;
                    const mapTitle = m.name || m.title || 'Tactical Sector';
                    const tokenCount = (m.tokens || []).length;
                    const objectCount = (m.objects || []).length;

                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSwitchMap(m.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className={`text-xs font-bold uppercase truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                              {mapTitle}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-sans mt-0.5 truncate">
                              {m.width || 2000} × {m.height || 1500}px • {m.scale || m.type || 'Encounter'}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-bold shrink-0">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/80 font-mono">
                          <span>{tokenCount} Tokens • {objectCount} Objects</span>
                          <span className="text-slate-400">{m.gridMode || 'hex'} grid</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OPERATIVE TOKENS */}
          {activeTab === 'tokens' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Deploy characters from Persona Folio onto current scene:</span>
                <span className="text-[10px] text-purple-400 font-bold">
                  {allOperatives.length} Roster Sheets
                </span>
              </div>

              {allOperatives.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400 mb-3">No operative character sheets found in Folio.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/folio');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
                  >
                    + Create Operative Sheet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allOperatives.map((op: any) => {
                    const docId = op['character-doc-id'] || op.id;
                    const isDeployed = deployedTokenIds.has(docId);
                    const name = op['char-name'] || op.name || 'Operative';
                    const species = typeof op['char-species'] === 'object' ? op['char-species']?.name : op['char-species'] || 'Species N/A';
                    const occu = typeof op['char-occu'] === 'object' ? op['char-occu']?.name : op['char-occu'] || 'Role N/A';

                    return (
                      <div
                        key={docId}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isDeployed
                            ? 'bg-purple-950/40 border-purple-500/50'
                            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-100 uppercase truncate">{name}</h4>
                          <p className="text-[10px] text-slate-400 font-sans truncate">{species} • {occu}</p>
                          {isDeployed && (
                            <span className="inline-block mt-1 text-[9px] text-emerald-400 font-bold">
                              ● On Stage
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeployPersona(op)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                          title="Deploy this operative token to the active map"
                        >
                          <Plus size={12} />
                          <span>Deploy</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLAYER SPECTATOR MODE */}
          {activeTab === 'spectator' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Eye size={16} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Live Player Spectator Broadcast
                  </h4>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Share this spectator stream URL with your tabletop group. Connected players see real-time token movement, dynamic line-of-sight reveals, dynamic lighting, and combat FX.
                </p>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-300 truncate text-[11px]">{spectatorUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopySpectatorLink}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold uppercase shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => window.open(spectatorUrl, '_blank')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink size={13} /> Preview Spectator View (New Tab)
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5 text-emerald-300 font-sans">
                <span className="font-bold font-mono text-[11px] uppercase block text-emerald-400">
                  Active Spectator Features:
                </span>
                <p>• Fog of War Masking hides unrevealed rooms and hidden GM markers.</p>
                <p>• Raycast Line-of-Sight calculates visibility based on active operative tokens.</p>
                <p>• WebGPU canvas streams animated dice rolls and dynamic damage numbers.</p>
              </div>
            </div>
          )}

          {/* TAB 4: ENGINE PREFERENCES & AUDIO */}
          {activeTab === 'engine' && (
            <div className="space-y-3.5 text-xs">
              {/* Grid Controls */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Tactical Grid &amp; Scale
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Snap Tokens to Grid:</span>
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.04);
                        toggleGridSnap();
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        gridSnap ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {gridSnap ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Grid Geometry:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(950, 0.02);
                          setGridType(GridType.HexFlatTop);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                          gridType === GridType.HexFlatTop ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Hex
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(950, 0.02);
                          setGridType(GridType.Square);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                          gridType === GridType.Square ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Square
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Show Grid Lines:</span>
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.04);
                        toggleGridVisible();
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        isGridVisible ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isGridVisible ? 'VISIBLE' : 'HIDDEN'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Measurement Unit:</span>
                    <div className="flex gap-1">
                      {(['meters', 'feet', 'hexes'] as const).map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => {
                            AudioService.playTerminalBeep(850, 0.02);
                            setMeasurementUnit(u);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                            measurementUnit === u ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Grid Unit Size:</span>
                    <div className="flex gap-1">
                      {[32, 40, 50, 64].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            AudioService.playTerminalBeep(900, 0.02);
                            setGridSize(sz);
                            if (currentMap && updateMap) {
                              updateMap(currentMap.id, { gridSize: sz });
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            gridSize === sz ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {sz}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Lighting & LoS */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Vision &amp; Lighting Engine
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Dynamic Lighting:</span>
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.04);
                        toggleDynamicLighting();
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        isDynamicLightingEnabled ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDynamicLightingEnabled ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Fog of War Layer:</span>
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.04);
                        setFogOfWarEnabled(!fogOfWarEnabled);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        fogOfWarEnabled ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {fogOfWarEnabled ? 'ENABLED' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Master Audio Synthesizer */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Master Tactical Audio &amp; SFX
                </span>
                
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 gap-4">
                  <span className="text-slate-300 shrink-0 flex items-center gap-1.5">
                    <Volume2 size={13} className="text-emerald-400" /> SFX Volume:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioVolume}
                    onChange={handleVolumeChange}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs text-cyan-300 font-bold w-12 text-right">
                    {Math.round(audioVolume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                VttEventBus.emit('open-module-ingestion-modal');
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
              title="Ingest or compile adventure module packages"
            >
              📦 Ingest Module
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageSettingsModal;
