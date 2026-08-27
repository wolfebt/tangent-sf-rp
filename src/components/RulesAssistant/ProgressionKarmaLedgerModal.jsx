import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Zap,
  TrendingUp,
  RotateCcw,
  ShieldAlert,
  Coins,
  CheckCircle2,
  X,
  Users,
  Plus,
  Send
} from 'lucide-react';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';

export default function ProgressionKarmaLedgerModal({
  isOpen,
  onClose,
  onBroadcastToChat
}) {
  if (!isOpen) return null;

  const {
    personaRoster = [],
    awardPartyExperience,
    awardPartyKarma,
    resetCharacterKarma,
    awardExperience
  } = useFolio();

  const [batchApAmount, setBatchApAmount] = useState(3);
  const [awardReason, setAwardReason] = useState('Mission Milestone Complete');

  const handleBatchAward = () => {
    if (batchApAmount <= 0) return;
    awardPartyExperience?.(batchApAmount, awardReason);
    AudioService.playCriticalChime(true);

    if (onBroadcastToChat) {
      onBroadcastToChat(`🌟 **[PARTY PROGRESSION AWARD]** Awarded **+${batchApAmount} AP** to all active operatives (${awardReason}).`);
    }
  };

  const handlePartyKarmaRecharge = () => {
    awardPartyKarma?.(3);
    AudioService.playTerminalBeep(980, 0.12);

    if (onBroadcastToChat) {
      onBroadcastToChat(`↻ **[PARTY KARMA RECHARGE]** All operative Karma pools have been fully recharged.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d121c] border-2 border-emerald-500/70 rounded-2xl shadow-[0_0_45px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-b border-emerald-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-emerald-300 flex items-center gap-2">
                Automated Progression &amp; Karma Master Ledger
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PARTY ADVANCEMENT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage Award Points (AP), Tier progression, Experience Debt, and Karma pools.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch Operations Bar */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Batch AP:
            </span>
            <input
              type="number"
              min="1"
              max="20"
              value={batchApAmount}
              onChange={(e) => setBatchApAmount(parseInt(e.target.value, 10) || 1)}
              className="w-16 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-200 text-center font-bold outline-none"
            />
            <input
              type="text"
              value={awardReason}
              onChange={(e) => setAwardReason(e.target.value)}
              placeholder="Reason for AP award..."
              className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 w-64 outline-none"
            />
            <button
              type="button"
              onClick={handleBatchAward}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              Award Party
            </button>
          </div>

          <button
            type="button"
            onClick={handlePartyKarmaRecharge}
            className="px-3 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-600/60 text-purple-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Full Karma Recharge
          </button>
        </div>

        {/* Operatives Progression Ledger Grid */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {personaRoster.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No registered operatives in Persona Folio. Create or import characters to manage progression.
            </div>
          ) : (
            personaRoster.map((hero, idx) => {
              const name = hero['char-name'] || `Operative ${idx + 1}`;
              const availableAp = parseInt(hero.availableAP || hero.ap || 0, 10);
              const earnedAp = parseInt(hero.earnedAP || hero.totalAP || 0, 10);
              const debt = parseInt(hero.experienceDebt || 0, 10);
              const karma = parseInt(hero.karma || 3, 10);
              const tier = earnedAp >= 50 ? 'Legend' : earnedAp >= 30 ? 'Master' : earnedAp >= 15 ? 'Expert' : 'Novice';

              return (
                <div
                  key={hero.id || idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between text-xs font-mono shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{name}</h4>
                      <span className="text-[10px] text-slate-500 font-sans">{hero.species || 'Human'} · {hero.archetype || 'Operator'}</span>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-4 gap-3 text-center text-[10px]">
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-500 block">Tier</span>
                      <span className="text-amber-300 font-bold">{tier}</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-500 block">Avail AP</span>
                      <span className="text-emerald-400 font-bold">{availableAp} AP</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-500 block">Exp Debt</span>
                      <span className={debt > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{debt} AP</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-500 block">Karma</span>
                      <span className="text-purple-300 font-bold">{karma} / 3</span>
                    </div>
                  </div>

                  {/* Individual Award Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => awardExperience?.(hero.id, 1, 'Quick Solo AP')}
                      className="px-2.5 py-1 rounded bg-slate-950 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-600 text-emerald-300 text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 1 AP
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
