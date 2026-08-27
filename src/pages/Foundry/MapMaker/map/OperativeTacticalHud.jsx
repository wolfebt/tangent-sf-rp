import React, { useState } from 'react';
import AudioService from '../../../../services/audioService';
import { CANONICAL_PING_TYPES } from '../../../../services/mapPingService';

const OperativeTacticalHud = ({
  userControlledTokens = [],
  activeTokenId,
  onSelectActiveToken,
  targetToken,
  onTriggerAttack,
  onDropPing,
  onTriggerFloatingText,
  onBroadcastMessage
}) => {
  const [apBudget, setApBudget] = useState({ standard: 1, move: 1, reaction: 1 });
  const [activeWeapon, setActiveWeapon] = useState('Pulse Rifle (2d8+3)');

  const activeToken = userControlledTokens.find(t => t.id === activeTokenId) || userControlledTokens[0] || {
    label: 'Operative',
    hp: 30,
    maxHp: 30,
    sp: 10,
    maxSp: 10,
    speed: 6
  };

  const handleSpendAp = (type) => {
    if (apBudget[type] <= 0) return;
    AudioService.playTerminalBeep(980, 0.05);
    setApBudget(prev => ({ ...prev, [type]: prev[type] - 1 }));

    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 100, `-1 AP (${type.toUpperCase()})`, 'karma');
    }
  };

  const handleRefreshAp = () => {
    AudioService.playTerminalBeep(1200, 0.1);
    setApBudget({ standard: 1, move: 1, reaction: 1 });
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 100, `+3 AP REFRESHED`, 'heal');
    }
  };

  const handleUseConsumable = (item) => {
    AudioService.playTerminalBeep(1100, 0.1);
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 120, `USED: ${item}`, 'heal');
    }
    if (onBroadcastMessage) {
      onBroadcastMessage(`[OPERATIVE TACTICAL]: ${activeToken.label || 'Operative'} deployed ${item}`);
    }
  };

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 bg-[#090e17]/95 border border-cyan-500/70 rounded-2xl px-4 py-2.5 shadow-[0_0_35px_rgba(6,182,212,0.4)] text-white flex flex-col gap-2 max-w-3xl w-full select-none backdrop-blur-md animate-fadeIn">
      {/* Top Bar: Multi-Unit Switcher Ribbon */}
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-1.5 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Controlled Units:</span>
          {userControlledTokens.length === 0 ? (
            <span className="text-xs text-cyan-300 font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800">
              {activeToken.label || 'Operative'} (Active)
            </span>
          ) : (
            userControlledTokens.map(tok => (
              <button
                key={tok.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(850, 0.04);
                  if (onSelectActiveToken) onSelectActiveToken(tok.id);
                }}
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeToken.id === tok.id
                    ? 'bg-cyan-600 text-black shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tok.type === 'vehicle' ? '🚀' : tok.type === 'companion' ? '🤖' : '🧙‍♂️'}</span>
                <span>{tok.label || tok.name || 'Unit'}</span>
                <span className="text-[10px] opacity-75">({tok.hp || 30} HP)</span>
              </button>
            ))
          )}
        </div>

        {/* Tactical Beacon Quick Dispatcher */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ping:</span>
          {CANONICAL_PING_TYPES.map(p => (
            <button
              key={p.type}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(p.soundFreq, 0.08);
                if (onDropPing) onDropPing(p.type);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs transition-transform active:scale-90 cursor-pointer"
              title={`Broadcast ${p.label} Ping to Squad`}
            >
              {p.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Main HUD Row: Action Economy (Left), Target Lock (Center), Consumables (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs">
        {/* Action Point (AP) Budget */}
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Action Economy (AP):</span>
            <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => handleSpendAp('standard')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  apBudget.standard > 0 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-600 line-through'
                }`}
                title="Spend Standard Action"
              >
                Act
              </button>
              <button
                type="button"
                onClick={() => handleSpendAp('move')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  apBudget.move > 0 ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-600 line-through'
                }`}
                title="Spend Move Action"
              >
                Move
              </button>
              <button
                type="button"
                onClick={() => handleSpendAp('reaction')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  apBudget.reaction > 0 ? 'bg-purple-500 text-black' : 'bg-slate-800 text-slate-600 line-through'
                }`}
                title="Spend Reaction Slot"
              >
                React
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefreshAp}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
            title="Refresh Turn AP"
          >
            🔄 Reset
          </button>
        </div>

        {/* Tactical Target Lock */}
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-rose-400">Target Lock:</span>
            <span className="font-bold text-xs truncate text-slate-200">
              {targetToken ? (targetToken.label || targetToken.name || 'Target Unit') : 'No Target Selected'}
            </span>
          </div>

          {targetToken && (
            <button
              type="button"
              onClick={() => {
                AudioService.playCombatHit(false);
                if (onTriggerAttack) onTriggerAttack(activeToken.id, targetToken.id);
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_10px_rgba(244,63,94,0.4)] active:scale-95 cursor-pointer shrink-0"
            >
              ⚔️ Strike
            </button>
          )}
        </div>

        {/* Quick Operative Consumables */}
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => handleUseConsumable('Medi-Gel (+15 HP)')}
            className="flex-1 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded text-[10px] font-mono font-bold transition-all cursor-pointer text-center"
            title="Inject Medi-Gel"
          >
            💊 Medi-Gel
          </button>
          <button
            type="button"
            onClick={() => handleUseConsumable('Shield Battery (+20 SP)')}
            className="flex-1 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 rounded text-[10px] font-mono font-bold transition-all cursor-pointer text-center"
            title="Overcharge Kinetic Barrier"
          >
            🛡️ Shield
          </button>
          <button
            type="button"
            onClick={() => handleUseConsumable('Smoke Grenade (Cover Cloud)')}
            className="flex-1 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-300 rounded text-[10px] font-mono font-bold transition-all cursor-pointer text-center"
            title="Deploy Smoke Cover"
          >
            💨 Smoke
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperativeTacticalHud;
