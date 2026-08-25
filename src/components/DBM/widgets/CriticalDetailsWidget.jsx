import React, { useState } from 'react';
import { Target, Flame, CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';

export const CriticalDetailsWidget = ({
  criticalDetails = {},
  onChange = () => {},
  isEditMode = true,
  relationalData = {}
}) => {
  const current = {
    score: criticalDetails?.score || '',
    effect: Array.isArray(criticalDetails?.effect) ? criticalDetails.effect : (criticalDetails?.effect ? [String(criticalDetails.effect)] : []),
    success_effect: Array.isArray(criticalDetails?.success_effect) ? criticalDetails.success_effect : (criticalDetails?.success_effect ? [String(criticalDetails.success_effect)] : []),
    failure_effect: Array.isArray(criticalDetails?.failure_effect) ? criticalDetails.failure_effect : (criticalDetails?.failure_effect ? [String(criticalDetails.failure_effect)] : [])
  };

  const [newEffectText, setNewEffectText] = useState('');
  const [newSuccessText, setNewSuccessText] = useState('');
  const [newFailureText, setNewFailureText] = useState('');

  const handleScoreChange = (score) => {
    onChange({
      ...current,
      score
    });
  };

  const handleAddEffect = (listKey, textVal, resetFn) => {
    const val = textVal.trim();
    if (!val) return;

    const list = current[listKey] || [];
    if (!list.includes(val)) {
      onChange({
        ...current,
        [listKey]: [...list, val]
      });
    }
    resetFn('');
  };

  const handleRemoveEffect = (listKey, itemToRemove) => {
    const list = current[listKey] || [];
    onChange({
      ...current,
      [listKey]: list.filter(item => item !== itemToRemove)
    });
  };

  if (!isEditMode) {
    const hasDetails = current.score || current.effect.length > 0 || current.success_effect.length > 0 || current.failure_effect.length > 0;
    if (!hasDetails) {
      return (
        <div className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          No critical strike outcomes or threat parameters configured.
        </div>
      );
    }

    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5 font-mono text-xs">
        {current.score && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Threat Range:</span>
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 font-extrabold">
              🎯 {current.score}
            </span>
          </div>
        )}

        {current.effect.length > 0 && (
          <div className="space-y-1">
            <span className="block text-[10px] text-amber-400 uppercase font-bold">Critical Strike Effects:</span>
            <div className="flex flex-wrap gap-1">
              {current.effect.map((eff, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs">
                  💥 {eff}
                </span>
              ))}
            </div>
          </div>
        )}

        {current.success_effect.length > 0 && (
          <div className="space-y-1">
            <span className="block text-[10px] text-emerald-400 uppercase font-bold">Critical Success Triggers:</span>
            <div className="flex flex-wrap gap-1">
              {current.success_effect.map((eff, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs">
                  🌟 {eff}
                </span>
              ))}
            </div>
          </div>
        )}

        {current.failure_effect.length > 0 && (
          <div className="space-y-1">
            <span className="block text-[10px] text-rose-400 uppercase font-bold">Mishap & Backlash Triggers:</span>
            <div className="flex flex-wrap gap-1">
              {current.failure_effect.map((eff, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                  ⚠️ {eff}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
          <Target size={14} />
          <span>Critical Details & Outcome Group</span>
        </span>
        <span className="text-[10px] text-slate-500">Threat Ranges & Effects</span>
      </div>

      {/* Critical Threat Range */}
      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-400 uppercase">
          Critical Score / Threat Range
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 19-20, 20, Natural 20..."
            value={current.score}
            onChange={e => handleScoreChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-rose-300 font-bold p-2 rounded text-xs outline-none focus:border-rose-400"
          />
          {['20', '19-20', '18-20'].map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => handleScoreChange(preset)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-mono shrink-0 cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Critical Effects */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
        <label className="block text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
          <Flame size={12} />
          <span>Primary Critical Strike Effects</span>
        </label>
        <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 bg-slate-900 rounded-lg border border-slate-800">
          {current.effect.length === 0 ? (
            <span className="text-xs text-slate-600 italic">No critical effects assigned</span>
          ) : (
            current.effect.map((eff, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-xs flex items-center gap-1">
                💥 {eff}
                <button type="button" onClick={() => handleRemoveEffect('effect', eff)} className="hover:text-white cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add critical effect (e.g. Severe Bleed, Knockdown, Stun)..."
            value={newEffectText}
            onChange={e => setNewEffectText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEffect('effect', newEffectText, setNewEffectText);
              }
            }}
            className="w-full bg-slate-900 border border-slate-700 text-white p-1.5 rounded text-xs outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={() => handleAddEffect('effect', newEffectText, setNewEffectText)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase shrink-0 cursor-pointer"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Critical Success Triggers */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
        <label className="block text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
          <CheckCircle size={12} />
          <span>Critical Success Triggers (Metaphysics / Weapons)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 bg-slate-900 rounded-lg border border-slate-800">
          {current.success_effect.length === 0 ? (
            <span className="text-xs text-slate-600 italic">No success triggers assigned</span>
          ) : (
            current.success_effect.map((eff, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1">
                🌟 {eff}
                <button type="button" onClick={() => handleRemoveEffect('success_effect', eff)} className="hover:text-white cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add success trigger (e.g. Double Range, Max Damage, Instant Cast)..."
            value={newSuccessText}
            onChange={e => setNewSuccessText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEffect('success_effect', newSuccessText, setNewSuccessText);
              }
            }}
            className="w-full bg-slate-900 border border-slate-700 text-white p-1.5 rounded text-xs outline-none focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={() => handleAddEffect('success_effect', newSuccessText, setNewSuccessText)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase shrink-0 cursor-pointer"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Critical Failure Triggers */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
        <label className="block text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
          <AlertTriangle size={12} />
          <span>Critical Failure / Backlash Triggers</span>
        </label>
        <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 bg-slate-900 rounded-lg border border-slate-800">
          {current.failure_effect.length === 0 ? (
            <span className="text-xs text-slate-600 italic">No failure triggers assigned</span>
          ) : (
            current.failure_effect.map((eff, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-xs flex items-center gap-1">
                ⚠️ {eff}
                <button type="button" onClick={() => handleRemoveEffect('failure_effect', eff)} className="hover:text-white cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add failure trigger (e.g. Weapon Jam, Energy Backlash, Prone)..."
            value={newFailureText}
            onChange={e => setNewFailureText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEffect('failure_effect', newFailureText, setNewFailureText);
              }
            }}
            className="w-full bg-slate-900 border border-slate-700 text-white p-1.5 rounded text-xs outline-none focus:border-rose-400"
          />
          <button
            type="button"
            onClick={() => handleAddEffect('failure_effect', newFailureText, setNewFailureText)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold uppercase shrink-0 cursor-pointer"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
};
