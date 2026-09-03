import React, { useState } from 'react';
import { Send, Dices, Shield, User, HelpCircle, Sparkles, BookOpen, ChevronRight, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useFolio } from '../../context/FolioContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';
import { rollDice } from '../../services/diceService';

export const MessageInput = ({ isCompact = false }) => {
  const { 
    sendMessage, 
    sendDiceRoll,
    speakingMode, 
    setSpeakingMode, 
    selectedPersona, 
    setSelectedPersona 
  } = useChat();
  const { personaRoster, roster } = useFolio();
  const { currentUser, userHandle } = useAuth();

  const [text, setText] = useState('');
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [diceExpr, setDiceExpr] = useState('2d10');
  const [rollAdvantage, setRollAdvantage] = useState('norm'); // 'norm' | 'adv' | 'dis'
  const [rollLabel, setRollLabel] = useState('');

  const allPersonas = personaRoster || roster || [];

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    const msgToSend = text.trim();
    setText('');
    await sendMessage(msgToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertBracketHelp = () => {
    AudioService.playTerminalBeep(1200, 0.02);
    setText(prev => `${prev}[Hyperdrive] `);
  };

  const handleQuickDiceRoll = (e) => {
    if (e) e.preventDefault();
    if (!diceExpr.trim()) return;

    try {
      const rollResult = rollDice(diceExpr.trim(), {
        advantage: rollAdvantage === 'adv',
        disadvantage: rollAdvantage === 'dis'
      });

      if (rollLabel.trim()) {
        rollResult.label = rollLabel.trim();
      }

      sendDiceRoll(rollResult);
      setIsDiceModalOpen(false);
      setRollLabel('');
    } catch (err) {
      console.error('Dice parse error:', err);
      alert('Invalid dice expression format. Examples: 2d10, 2d10+4, 1d20, 4d6k3');
    }
  };

  return (
    <div className="p-2 sm:p-3 bg-[#0b0f17]/95 border-t border-slate-800 text-slate-200 select-none">
      {/* Top Controls: Identity Selector (IC vs OOC), Codex helper, Dice trigger */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* OOC / IC Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setSpeakingMode('OOC');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all ${
                speakingMode === 'OOC'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Out of Character (Transmit as Operator)"
            >
              <User size={12} />
              <span>OOC</span>
            </button>

            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1000, 0.02);
                setSpeakingMode('IC');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all ${
                speakingMode === 'IC'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="In-Character (Transmit as Operative Persona)"
            >
              <Shield size={12} />
              <span>IC</span>
            </button>
          </div>

          {/* Persona Picker if IC is active */}
          {speakingMode === 'IC' && allPersonas.length > 0 && (
            <select
              value={selectedPersona?.id || ''}
              onChange={(e) => {
                const found = allPersonas.find(p => p.id === e.target.value);
                if (found) setSelectedPersona(found);
              }}
              className="bg-slate-900 border border-purple-500/50 text-purple-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500 max-w-[150px] truncate"
            >
              {allPersonas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name || p.identity?.name || 'Unnamed Operative'}
                </option>
              ))}
            </select>
          )}

          {/* Codex Lore Bracket Quick-insert */}
          <button
            type="button"
            onClick={insertBracketHelp}
            className="flex items-center gap-1 px-2 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
            title="Insert [Codex Link] brackets"
          >
            <BookOpen size={12} />
            <span className="hidden sm:inline">[Codex Link]</span>
          </button>
        </div>

        {/* Quick Dice Roll launcher */}
        <button
          type="button"
          onClick={() => setIsDiceModalOpen(prev => !prev)}
          className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)]"
          title="Roll Dice into Frequency"
        >
          <Dices size={13} />
          <span>ROLL</span>
        </button>
      </div>

      {/* Quick Dice Roll Inline Popover */}
      {isDiceModalOpen && (
        <form onSubmit={handleQuickDiceRoll} className="mb-2 p-3 rounded-xl bg-slate-900 border border-amber-500/50 shadow-lg space-y-2.5 animate-fade-in font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Dices size={14} />
              <span>TANGENT TACTICAL DICE ENGINE</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDiceModalOpen(false)}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          {/* Quick presets & formula input */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Presets:</span>
            {['2d10', '2d10+2', '2d10+4', '1d20', '1d100'].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setDiceExpr(preset)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  diceExpr === preset 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60' 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">DICE FORMULA:</span>
              <input
                type="text"
                value={diceExpr}
                onChange={(e) => setDiceExpr(e.target.value)}
                placeholder="e.g. 2d10+4, 1d20, 4d6k3"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">ACTION / SKILL REASON (OPTIONAL):</span>
              <input
                type="text"
                value={rollLabel}
                onChange={(e) => setRollLabel(e.target.value)}
                placeholder="e.g. Plasma Rifle shot, Stealth check"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Advantage / Disadvantage controls & Roll button */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap sm:flex-nowrap">
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setRollAdvantage('norm')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  rollAdvantage === 'norm' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setRollAdvantage('adv')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  rollAdvantage === 'adv' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-emerald-300'
                }`}
                title="Advantage: Roll twice, take higher"
              >
                Advantage ("I Got This")
              </button>
              <button
                type="button"
                onClick={() => setRollAdvantage('dis')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  rollAdvantage === 'dis' ? 'bg-red-950/80 text-red-300 border border-red-500/40 font-bold' : 'text-slate-400 hover:text-red-300'
                }`}
                title="Disadvantage: Roll twice, take lower"
              >
                Disadvantage ("Negative Karma")
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-lg font-mono transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer flex items-center gap-1.5 shrink-0 ml-auto"
            >
              <Dices size={13} />
              <span>TRANSMIT ROLL</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSend} className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              speakingMode === 'IC' 
                ? `Transmit dialogue as [${selectedPersona?.name || selectedPersona?.identity?.name || 'Operative'}]... (Enter to send, Shift+Enter for new line)`
                : `Transmit signal into comms... Use [Item Name] to reference Codex lore.`
            }
            rows={isCompact ? 1 : 2}
            className="w-full p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 resize-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="h-10 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0"
          title="Send Transmission (Enter)"
        >
          <Send size={15} />
          <span className="hidden sm:inline text-xs">TRANSMIT</span>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
