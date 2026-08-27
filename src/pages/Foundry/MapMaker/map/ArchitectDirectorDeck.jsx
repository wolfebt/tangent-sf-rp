import React from 'react';
import AudioService from '../../../../services/audioService';

const ArchitectDirectorDeck = ({
  isCoArchitect = false,
  allMaps = [],
  activeMapId,
  onSelectMap,
  onApplyEnvironmentPreset,
  onBatchTokenAction,
  onBroadcastMessage
}) => {
  const ENV_PRESETS = [
    { id: 'zero_g', label: 'Zero-G Drift', icon: '🌌', desc: 'Floating inertia / Acrobatics DC 12' },
    { id: 'smoke_fog', label: 'Dense Smoke', icon: '💨', desc: 'Heavy obscurement / +4 Cover DC' },
    { id: 'radiation_leak', label: 'High Radiation', icon: '☢️', desc: '1d6 Lethal tick per turn' },
    { id: 'vacuum_decomp', label: 'Vacuum Breach', icon: '🕳️', desc: 'Requires sealed EVA suits' }
  ];

  const handleApplyEnv = (preset) => {
    AudioService.playTerminalBeep(980, 0.1);
    if (onApplyEnvironmentPreset) onApplyEnvironmentPreset(preset.id);
    if (onBroadcastMessage) {
      onBroadcastMessage(`[ENVIRONMENT UPDATE]: ${preset.icon} ${preset.label} engaged — ${preset.desc}`);
    }
  };

  const handleBatch = (action) => {
    AudioService.playTerminalBeep(1100, 0.1);
    if (onBatchTokenAction) onBatchTokenAction(action);
    if (onBroadcastMessage) {
      onBroadcastMessage(`[ARCHITECT DIRECTIVE]: Batch token action triggered: ${action.toUpperCase()}`);
    }
  };

  return (
    <div className="absolute top-14 right-4 z-30 bg-[#090e17]/95 border border-purple-500/70 rounded-2xl p-3 shadow-[0_0_30px_rgba(168,85,247,0.3)] text-white flex flex-col gap-2.5 max-w-xs w-full select-none backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-900/60 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{isCoArchitect ? '🤝' : '👑'}</span>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-300">
              {isCoArchitect ? 'Co-Architect Console' : 'Lead Architect Deck'}
            </h4>
            <span className="text-[9px] text-slate-400 font-mono">
              DIRECTOR CONTROLS
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 font-bold">
          GM ACCESS
        </span>
      </div>

      {/* Environmental Hazard Quick Bar */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase font-bold text-slate-400">Environmental Hazards:</span>
        <div className="grid grid-cols-2 gap-1.5">
          {ENV_PRESETS.map(env => (
            <button
              key={env.id}
              type="button"
              onClick={() => handleApplyEnv(env)}
              className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-purple-900/50 text-left flex items-center gap-1.5 transition-all cursor-pointer group"
            >
              <span className="text-sm shrink-0">{env.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold truncate text-slate-200 group-hover:text-purple-300">
                  {env.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Batch Token Director Actions */}
      <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/80">
        <span className="text-[9px] uppercase font-bold text-slate-400">Batch Token Directives:</span>
        <div className="grid grid-cols-3 gap-1 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => handleBatch('reveal_all')}
            className="py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-center"
            title="Reveal all hidden tokens to players"
          >
            👁️ Reveal All
          </button>
          <button
            type="button"
            onClick={() => handleBatch('stealth_all')}
            className="py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-center"
            title="Conceal enemy tokens into stealth"
          >
            🕶️ Stealth All
          </button>
          <button
            type="button"
            onClick={() => handleBatch('heal_party')}
            className="py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold transition-all cursor-pointer text-center"
            title="Restore party Vitality & Health"
          >
            💖 Rest Party
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchitectDirectorDeck;
