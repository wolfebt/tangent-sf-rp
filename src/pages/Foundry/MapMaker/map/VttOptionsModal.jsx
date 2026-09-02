import React, { useState } from 'react';
import AudioService from '../../../../services/audioService';

const VttOptionsModal = ({
  isOpen,
  onClose,
  activeMapId,
  gridSnap = true,
  onToggleGridSnap,
  gridSize = 40,
  onChangeGridSize,
  gridMode = 'square',
  onChangeGridMode,
  measurementUnit = 'meters',
  onChangeMeasurementUnit,
  fogEnabled = true,
  onToggleFog
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [audioVolume, setAudioVolume] = useState(() => {
    return typeof window !== 'undefined' ? parseFloat(localStorage.getItem('tangent_audio_volume') || '0.35') : 0.35;
  });

  if (!isOpen) return null;

  const spectatorUrl = typeof window !== 'undefined' ? `${window.location.origin}/spectator/${activeMapId || 'tactical-zone'}` : '';

  const handleCopySpectatorLink = () => {
    AudioService.playTerminalBeep(1200, 0.05);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(spectatorUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    AudioService.setVolume(val);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fadeIn">
      <div className="bg-[#0b121d] border border-cyan-500/70 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300">
                  VTT Tactical System Options
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-200">
                  SYSTEM ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grid Mechanics, Vision Rules, Audio Synthesis &amp; Spectator Casting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Options Settings Body */}
        <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[60vh] pr-1">
          {/* Grid & Measurement */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Tactical Grid &amp; Scale:</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-300 font-mono">Snap to Grid:</span>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(900, 0.04);
                    if (onToggleGridSnap) onToggleGridSnap();
                  }}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    gridSnap ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {gridSnap ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-300 font-mono">Measurement:</span>
                <div className="flex gap-1">
                  {['meters', 'feet', 'hexes'].map(unit => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(850, 0.04);
                        if (onChangeMeasurementUnit) onChangeMeasurementUnit(unit);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                        measurementUnit === unit ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fog of War & Vision */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-purple-400">Fog of War &amp; Vision:</span>
            
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
              <div>
                <span className="text-slate-200 font-bold block">Dynamic Fog of War Layer:</span>
                <span className="text-[10px] text-slate-400">Conceals unrevealed map coordinates from non-architect operatives</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(900, 0.04);
                  if (onToggleFog) onToggleFog();
                }}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  fogEnabled ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {fogEnabled ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Audio Synthesizer */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-400">Audio Synthesizer &amp; Ambience:</span>
            
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 gap-4">
              <span className="text-slate-300 font-mono shrink-0">Master SFX Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={handleVolumeChange}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-xs font-mono text-cyan-300 font-bold w-12 text-right">
                {Math.round(audioVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Spectator URL Broadcast Link */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Spectator 2nd Screen Broadcast:</span>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800">
              <input
                type="text"
                readOnly
                value={spectatorUrl}
                className="bg-transparent text-slate-300 font-mono text-[11px] flex-1 outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopySpectatorLink}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold font-mono rounded transition-colors cursor-pointer shrink-0"
              >
                {copiedLink ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default VttOptionsModal;
