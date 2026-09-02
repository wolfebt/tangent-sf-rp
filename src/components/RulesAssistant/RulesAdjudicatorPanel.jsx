import React, { useState, useMemo } from 'react';
import {
  RANGE_BRACKETS,
  COVER_TYPES,
  LIGHTING_OBSCUREMENT,
  computeTacticalAttackModifiers
} from '../../services/rulesAdjudicatorService';
import AudioService from '../../services/audioService';

const RulesAdjudicatorPanel = ({
  isOpen,
  onClose,
  tokens = [],
  activeAttackerId = null,
  activeTargetId = null,
  onApplyToCombatResolver
}) => {
  const [attackerId, setAttackerId] = useState(activeAttackerId || tokens[0]?.id || null);
  const [targetId, setTargetId] = useState(activeTargetId || tokens[1]?.id || null);
  const [rangeBracketId, setRangeBracketId] = useState('short');
  const [coverTypeId, setCoverTypeId] = useState('none');
  const [lightingId, setLightingId] = useState('clear');
  const [hasHighGround, setHasHighGround] = useState(false);
  const [isFlanked, setIsFlanked] = useState(false);
  const [isTargetProne, setIsTargetProne] = useState(false);
  const [isTargetStunned, setIsTargetStunned] = useState(false);
  const [isAimed, setIsAimed] = useState(false);
  const [customMod, setCustomMod] = useState(0);

  const attackerToken = useMemo(() => tokens.find(t => t.id === attackerId) || tokens[0], [tokens, attackerId]);
  const targetToken = useMemo(() => tokens.find(t => t.id === targetId) || tokens[1] || tokens[0], [tokens, targetId]);

  const targetBaseDef = targetToken?.defense || 12;

  const adjudication = useMemo(() => {
    return computeTacticalAttackModifiers({
      rangeBracketId,
      coverTypeId,
      lightingId,
      hasHighGround,
      isFlanked,
      isTargetProne,
      isTargetStunned,
      isAimed,
      customMod
    });
  }, [rangeBracketId, coverTypeId, lightingId, hasHighGround, isFlanked, isTargetProne, isTargetStunned, isAimed, customMod]);

  if (!isOpen) return null;

  const handleApplyToResolver = () => {
    AudioService.playTerminalBeep(980, 0.15);
    if (onApplyToCombatResolver) {
      onApplyToCombatResolver(attackerId, targetId, adjudication.netAttackMod, targetBaseDef + adjudication.netDefenseMod);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fadeIn">
      <div className="bg-[#121622] border border-amber-500/70 rounded-xl p-5 w-full max-w-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-amber-300">
                  Tactical Trait &amp; Modifiers Adjudicator
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-950 border border-amber-500/60 text-amber-200">
                  REAL-TIME RULES
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Range Brackets, Cover Geometry, Elevation &amp; Obscurement Engine
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

        {/* Combatant Selectors */}
        <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Attacker</label>
            <select
              value={attackerId || ''}
              onChange={(e) => setAttackerId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {tokens.map(t => (
                <option key={t.id} value={t.id}>⚔️ {t.label || 'Unit'}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Target (Base DEF: {targetBaseDef})</label>
            <select
              value={targetId || ''}
              onChange={(e) => setTargetId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {tokens.map(t => (
                <option key={t.id} value={t.id}>🎯 {t.label || 'Target'} (DEF {t.defense || 12})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tactical Switchboard */}
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[260px] pr-1">
          {/* 1. Range Brackets */}
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-[10px] uppercase font-bold text-slate-400">Engagement Range Bracket:</label>
            <div className="grid grid-cols-5 gap-1.5">
              {RANGE_BRACKETS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRangeBracketId(r.id)}
                  className={`p-1.5 rounded border text-center flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    rangeBracketId === r.id
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{r.icon}</span>
                  <span className="text-[9px] truncate">{r.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Cover Geometry */}
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-[10px] uppercase font-bold text-slate-400">Target Cover Geometry:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {COVER_TYPES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCoverTypeId(c.id)}
                  className={`p-1.5 rounded border text-center flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    coverTypeId === c.id
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="text-[9px] truncate">{c.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Positional Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <label className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={hasHighGround}
                onChange={(e) => setHasHighGround(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span className="text-[11px] text-amber-300">⛰️ High Ground (+2)</span>
            </label>

            <label className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={isAimed}
                onChange={(e) => setIsAimed(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span className="text-[11px] text-cyan-300">🎯 Aim Lock (+2)</span>
            </label>

            <label className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={isFlanked}
                onChange={(e) => setIsFlanked(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span className="text-[11px] text-rose-300">⚔️ Flanked (-2 DEF)</span>
            </label>

            <label className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={isTargetProne}
                onChange={(e) => setIsTargetProne(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span className="text-[11px] text-purple-300">🧎 Target Prone</span>
            </label>
          </div>

          {/* 4. Environmental Obscurement */}
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-[10px] uppercase font-bold text-slate-400">Atmospheric Obscurement:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {LIGHTING_OBSCUREMENT.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLightingId(l.id)}
                  className={`p-1.5 rounded border text-center flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    lightingId === l.id
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{l.icon}</span>
                  <span className="text-[9px] truncate">{l.label.split('/')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Adjudication Result Card */}
        <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/50 flex flex-col gap-1.5 text-xs animate-fadeIn">
          <div className="flex items-center justify-between font-bold">
            <span className="text-amber-300 text-sm">
              Net Attack Mod: <span className="font-mono text-emerald-400">{adjudication.netAttackMod >= 0 ? `+${adjudication.netAttackMod}` : adjudication.netAttackMod}</span>
            </span>
            <span className="text-cyan-300 text-sm">
              Target Effective Defense DC: <span className="font-mono text-amber-400">{targetBaseDef + adjudication.netDefenseMod}</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-300 font-mono leading-snug">
            {adjudication.summary}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Adjudicator
          </button>

          <button
            type="button"
            onClick={handleApplyToResolver}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚔️</span> Apply to Combat Strike Resolver
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesAdjudicatorPanel;
