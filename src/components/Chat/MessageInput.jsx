import React, { useState } from 'react';
import { Send, Dices, Shield, User, HelpCircle, Sparkles, BookOpen } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useFolio } from '../../context/FolioContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';

export const MessageInput = ({ isCompact = false }) => {
  const { 
    sendMessage, 
    speakingMode, 
    setSpeakingMode, 
    selectedPersona, 
    setSelectedPersona 
  } = useChat();
  const { personaRoster, roster } = useFolio();
  const { currentUser, userHandle } = useAuth();

  const [text, setText] = useState('');
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [diceExpr, setDiceExpr] = useState('2d10+2');

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
    e.preventDefault();
    if (!diceExpr.trim()) return;

    // Quick parse simple expression like XdY+Z
    try {
      const match = diceExpr.match(/(\d+)d(\d+)(?:\+([0-9]+))?/i);
      if (match) {
        const count = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);
        const mod = match[3] ? parseInt(match[3], 10) : 0;

        const rolls = [];
        let sum = 0;
        for (let i = 0; i < count; i++) {
          const r = Math.floor(Math.random() * sides) + 1;
          rolls.push(r);
          sum += r;
        }
        const total = sum + mod;
        const isCritical = rolls.every(r => r === sides) && count > 1;
        const isFumble = rolls.every(r => r === 1) && count > 1;

        sendMessage('', {
          type: 'dice_roll',
          metadata: {
            expression: diceExpr,
            rolls,
            modifier: mod,
            result: total,
            isCritical,
            isFumble
          }
        });
        setIsDiceModalOpen(false);
      } else {
        alert('Format: e.g. 2d10 or 1d20+4');
      }
    } catch (err) {
      console.error('Dice parse error:', err);
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
        <form onSubmit={handleQuickDiceRoll} className="mb-2 p-2 rounded-lg bg-slate-900 border border-amber-500/40 flex items-center gap-2">
          <span className="text-[11px] font-mono text-amber-300">EXPR:</span>
          <input
            type="text"
            value={diceExpr}
            onChange={(e) => setDiceExpr(e.target.value)}
            placeholder="e.g. 2d10+4"
            className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded font-mono transition-colors"
          >
            BROADCAST ROLL
          </button>
          <button
            type="button"
            onClick={() => setIsDiceModalOpen(false)}
            className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white text-xs rounded font-mono"
          >
            ✕
          </button>
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
