import React, { useState } from 'react';

export const DEFAULT_STATUS_GEMS = [
  { id: 'Shielded', label: 'Shielded', icon: '🛡️', color: '#3b82f6' },
  { id: 'Stunned', label: 'Stunned', icon: '⚡', color: '#eab308' },
  { id: 'Poisoned', label: 'Poisoned', icon: '☠️', color: '#22c55e' },
  { id: 'Invisible', label: 'Invisible', icon: '👁️', color: '#06b6d4' },
  { id: 'Burning', label: 'Burning', icon: '🔥', color: '#f97316' },
  { id: 'Wounded', label: 'Wounded', icon: '❤️', color: '#ef4444' },
  { id: 'Cover', label: 'Cover', icon: '🧱', color: '#64748b' },
  { id: 'Concentrating', label: 'Concentrating', icon: '🎯', color: '#a855f7' },
  { id: 'Flight', label: 'Flight', icon: '🕊️', color: '#38bdf8' },
  { id: 'Frozen', label: 'Frozen', icon: '🧊', color: '#60a5fa' },
  { id: 'Charmed', label: 'Charmed', icon: '🧠', color: '#ec4899' },
  { id: 'Hasted', label: 'Hasted', icon: '⚡', color: '#facc15' }
];

const PRESET_GEM_COLORS = [
  '#3b82f6', '#22c55e', '#ef4444', '#eab308',
  '#a855f7', '#06b6d4', '#f97316', '#ec4899',
  '#64748b', '#ffffff'
];

const StatusGemsModal = ({
  isOpen,
  onClose,
  selectedToken,
  activeConditions = [],
  onToggleCondition,
  onAddCustomGem
}) => {
  const [customGemLabel, setCustomGemLabel] = useState('');
  const [customGemColor, setCustomGemColor] = useState('#3b82f6');
  const [customGems, setCustomGems] = useState([]);

  if (!isOpen) return null;

  const allGems = [...DEFAULT_STATUS_GEMS, ...customGems];

  const handleAddGem = (e) => {
    e.preventDefault();
    const trimmed = customGemLabel.trim();
    if (!trimmed) return;

    const newGem = {
      id: trimmed,
      label: trimmed,
      icon: '✨',
      color: customGemColor
    };

    setCustomGems(prev => [...prev, newGem]);
    onAddCustomGem?.(newGem);
    onToggleCondition(trimmed);
    setCustomGemLabel('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#161b22] border border-[#0D5C63] rounded-xl p-5 w-[460px] shadow-[0_0_30px_rgba(0,0,0,0.8)] text-white flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#0D5C63]/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#22d3ee]">
                Status & Conditions Inspector
              </h3>
              <p className="text-[11px] text-slate-400">
                Unit: <span className="text-amber-300 font-bold">{selectedToken?.label || 'Unit'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-lg font-bold leading-none px-1.5"
          >
            ×
          </button>
        </div>

        {/* Gems Selector Grid */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[260px] pr-1">
          <label className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
            Select Active Conditions:
          </label>

          <div className="grid grid-cols-2 gap-2">
            {allGems.map(gem => {
              const active = activeConditions.includes(gem.label);

              return (
                <button
                  key={gem.id}
                  type="button"
                  onClick={() => onToggleCondition(gem.label)}
                  className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-all ${
                    active
                      ? 'bg-cyan-950/90 border-[#22d3ee] text-white font-bold shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                      : 'bg-[#0d1117]/80 border-[#0D5C63]/50 text-slate-300 hover:border-[#22d3ee]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40 shadow-sm"
                      style={{ backgroundColor: gem.color }}
                    />
                    <span className="truncate">{gem.icon} {gem.label}</span>
                  </div>

                  <span className={`text-xs font-bold ${active ? 'text-[#22d3ee]' : 'text-slate-600'}`}>
                    {active ? '✓' : '+'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Custom Gem Form */}
        <form onSubmit={handleAddGem} className="pt-3 border-t border-[#0D5C63]/60 flex flex-col gap-2">
          <label className="text-[10px] uppercase text-[#22d3ee] font-bold tracking-wider">
            ➕ Add Custom Status Gem:
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="E.g. Psionic Barrier, Overload..."
              value={customGemLabel}
              onChange={e => setCustomGemLabel(e.target.value)}
              className="flex-1 bg-[#0d1117] border border-[#0D5C63]/70 text-white px-2.5 py-1.5 rounded text-xs outline-none focus:border-[#22d3ee]"
            />

            <button
              type="submit"
              disabled={!customGemLabel.trim()}
              className="px-3 py-1.5 bg-cyan-950 border border-[#22d3ee]/60 hover:bg-cyan-900 disabled:opacity-50 text-[#22d3ee] font-bold text-xs rounded uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(34,211,238,0.3)] shrink-0"
            >
              + Add Gem
            </button>
          </div>

          {/* Preset Color Swatches */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-slate-400">Gem Color:</span>
            {PRESET_GEM_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setCustomGemColor(color)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  customGemColor === color
                    ? 'border-[#22d3ee] scale-110 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </form>

        {/* Footer Close Button */}
        <div className="flex justify-end pt-2 border-t border-[#0D5C63]/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded border border-slate-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusGemsModal;
