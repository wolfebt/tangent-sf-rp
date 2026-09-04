import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  Send,
  X,
  Trash2,
  AlertTriangle,
  Building,
  Radio,
  Flame
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const INITIAL_FACTIONS = [
  {
    id: 'fac_1',
    name: 'OmniCorp Security Division',
    agenda: 'Deploy Heavy Combat Walkers into Mining District',
    clockTicks: 2,
    maxTicks: 6,
    threatLevel: 'High',
    color: 'border-rose-500/80 text-rose-300'
  },
  {
    id: 'fac_2',
    name: 'Ghost-Viper Syndicate',
    agenda: 'Infiltrate Central Data-Vault & Steal Precursor Coordinates',
    clockTicks: 3,
    maxTicks: 4,
    threatLevel: 'Critical',
    color: 'border-purple-500/80 text-purple-300'
  },
  {
    id: 'fac_3',
    name: 'Colonial Labor Union',
    agenda: 'Sabotage Plasma Fuel Refineries to Force Strike Settlement',
    clockTicks: 1,
    maxTicks: 6,
    threatLevel: 'Moderate',
    color: 'border-amber-500/80 text-amber-300'
  }
];

export default function FactionClocksModal({
  isOpen,
  onClose,
  onBroadcastToChat
}) {
  if (!isOpen) return null;

  const [factions, setFactions] = useState(INITIAL_FACTIONS);
  const [newFactionName, setNewFactionName] = useState('');
  const [newFactionAgenda, setNewFactionAgenda] = useState('');
  const [newFactionTicks, setNewFactionTicks] = useState(6);

  const handleTickClock = (id, delta) => {
    setFactions(prev => prev.map(fac => {
      if (fac.id !== id) return fac;
      const nextTicks = Math.max(0, Math.min(fac.maxTicks, fac.clockTicks + delta));
      return { ...fac, clockTicks: nextTicks };
    }));
    AudioService.playTerminalBeep(delta > 0 ? 880 : 440, 0.05);
  };

  const handleAddFaction = (e) => {
    e.preventDefault();
    if (!newFactionName.trim()) return;

    const newFac = {
      id: `fac_${Date.now()}`,
      name: newFactionName.trim(),
      agenda: newFactionAgenda.trim() || 'Advance covert agenda',
      clockTicks: 0,
      maxTicks: newFactionTicks,
      threatLevel: 'Moderate',
      color: 'border-cyan-500/80 text-cyan-300'
    };

    setFactions(prev => [...prev, newFac]);
    setNewFactionName('');
    setNewFactionAgenda('');
    AudioService.playTerminalBeep(920, 0.08);
  };

  const handleDeleteFaction = (id) => {
    setFactions(prev => prev.filter(fac => fac.id !== id));
  };

  const handleAdvanceFactionTurn = () => {
    AudioService.playCriticalChime(true);
    let completedAgendas = [];

    setFactions(prev => prev.map(fac => {
      const advance = Math.random() > 0.4 ? 1 : 0;
      const nextTicks = Math.min(fac.maxTicks, fac.clockTicks + advance);
      if (nextTicks === fac.maxTicks && fac.clockTicks < fac.maxTicks) {
        completedAgendas.push(fac);
      }
      return { ...fac, clockTicks: nextTicks };
    }));

    if (onBroadcastToChat) {
      let news = `🌐 **[HOLONET NEWS FLASH: LIVING WORLD FACTION TURN]**\nFaction agendas have advanced across the sector.\n\n`;
      factions.forEach(fac => {
        news += `- **${fac.name}**: ${fac.agenda} (${fac.clockTicks}/${fac.maxTicks} Ticks)\n`;
      });
      if (completedAgendas.length > 0) {
        news += `\n🚨 **MAJOR CRISIS TRIGGERED:** ${completedAgendas.map(c => c.name + ' has COMPLETED: ' + c.agenda).join(', ')}`;
      }
      onBroadcastToChat(news);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] bg-[#0d121c] border-2 border-purple-500/70 rounded-2xl shadow-[0_0_45px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border-b border-purple-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-purple-300 flex items-center gap-2">
                Living World Faction Clocks &amp; Agendas Engine
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {factions.length} FACTIONS ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Track rival megacorps, syndicates, and factions as their agendas tick forward in the background.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-400">
            Advance background world simulation between campaign sessions:
          </span>

          <button
            type="button"
            onClick={handleAdvanceFactionTurn}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Advance Faction Turn
          </button>
        </div>

        {/* Faction List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {factions.map(fac => {
            const isCompleted = fac.clockTicks >= fac.maxTicks;
            const progressRatio = fac.clockTicks / fac.maxTicks;

            return (
              <div
                key={fac.id}
                className={`p-4 rounded-xl bg-slate-900/80 border flex items-center justify-between gap-4 text-xs font-mono shadow-md ${
                  isCompleted ? 'border-red-500/90 bg-red-950/20' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-purple-400 shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-bold text-sm text-slate-100 truncate">{fac.name}</h4>
                    <span className="text-[11px] text-slate-400 font-sans">{fac.agenda}</span>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-rose-400' : 'text-purple-300'}`}>
                      {isCompleted ? 'COMPLETED / CRISIS TRIGGERED' : `${fac.clockTicks} / ${fac.maxTicks} Ticks`}
                    </span>
                    <div className="w-32 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${isCompleted ? 'bg-rose-500' : 'bg-purple-500'}`}
                        style={{ width: `${progressRatio * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Manual Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTickClock(fac.id, -1)}
                      disabled={fac.clockTicks <= 0}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-40"
                      aria-label="Decrease clock ticks"
                      title="Decrease clock ticks"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTickClock(fac.id, 1)}
                      disabled={isCompleted}
                      className="p-1 rounded bg-purple-950 hover:bg-purple-800 border border-purple-700 text-purple-300 disabled:opacity-40"
                      aria-label="Increase clock ticks"
                      title="Increase clock ticks"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaction(fac.id)}
                      className="p-1 rounded bg-slate-950 hover:bg-red-950 border border-slate-800 hover:border-red-700 text-slate-500 hover:text-red-300 ml-1"
                      aria-label="Delete faction"
                      title="Delete faction"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Faction Form */}
          <form onSubmit={handleAddFaction} className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex items-center gap-3">
            <input
              type="text"
              value={newFactionName}
              onChange={(e) => setNewFactionName(e.target.value)}
              placeholder="Faction / Corp Name..."
              className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none"
            />
            <input
              type="text"
              value={newFactionAgenda}
              onChange={(e) => setNewFactionAgenda(e.target.value)}
              placeholder="Faction Objective / Agenda..."
              className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none"
            />
            <select
              value={newFactionTicks}
              onChange={(e) => setNewFactionTicks(parseInt(e.target.value, 10))}
              className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-300 outline-none font-bold"
            >
              <option value="4">4 Ticks</option>
              <option value="6">6 Ticks</option>
              <option value="8">8 Ticks</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Add Clock
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
