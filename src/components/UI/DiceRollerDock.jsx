import React, { useState } from 'react';
import { Dices, X, Target, RotateCcw, Radio } from 'lucide-react';
import { rollDice } from '../../services/diceService';
import { AudioService } from '../../services/audioService';
import { useChat } from '../../context/ChatContext';

const PRESET_DICE = [
  { label: '2d10', expr: '2d10' },
  { label: 'd20', expr: '1d20' },
  { label: 'd100', expr: '1d100' },
  { label: 'd6', expr: '1d6' },
  { label: 'd8', expr: '1d8' },
  { label: 'd12', expr: '1d12' }
];

export const DiceRollerDock = ({ isOpen, onClose }) => {
  const { sendDiceRoll, activeChannel } = useChat();
  const [customExpr, setCustomExpr] = useState('2d10+2');
  const [targetNumber, setTargetNumber] = useState('');
  const [history, setHistory] = useState([]);
  const [latestRoll, setLatestRoll] = useState(null);
  const [broadcastToChat, setBroadcastToChat] = useState(true);

  if (!isOpen) return null;

  const handleRoll = async (expr = customExpr) => {
    const tn = targetNumber ? parseInt(targetNumber, 10) : null;
    const result = rollDice(expr, { targetNumber: tn, label: 'Tactical Check' });

    AudioService.playDiceRollSound();
    if (result.isCritSuccess) AudioService.playCriticalChime(true);
    if (result.isCritFail) AudioService.playCriticalChime(false);

    setLatestRoll(result);
    setHistory(prev => [result, ...prev.slice(0, 19)]);

    if (broadcastToChat && sendDiceRoll) {
      try {
        await sendDiceRoll({
          expression: result.expression,
          total: result.total,
          rolls: result.rolls.map(r => r.value),
          modifier: result.modifier,
          isCritical: result.isCritSuccess,
          isFumble: result.isCritFail
        });
      } catch (err) {
        console.warn('Failed to broadcast roll to chat:', err);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-88 bg-[#0d1117]/95 backdrop-blur-md border border-amber-500/50 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.25)] p-4 flex flex-col gap-3 font-sans select-none animate-slide-up">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <Dices className="text-amber-400" size={18} />
          <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-amber-300">
            TANGENT DICE TRAY
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button 
              type="button"
              onClick={() => { setHistory([]); setLatestRoll(null); }} 
              className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
              title="Clear Dice History"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Close Tray"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Preset Dice Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {PRESET_DICE.map((p) => (
          <button
            key={p.expr}
            type="button"
            onClick={() => handleRoll(p.expr)}
            className="py-1.5 px-2 rounded bg-slate-900/80 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-slate-200 text-xs font-mono font-bold transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Formula & Target Number Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1">
          <span className="text-slate-500 text-xs font-mono mr-1">Roll:</span>
          <input
            type="text"
            value={customExpr}
            onChange={(e) => setCustomExpr(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRoll(customExpr); }}
            placeholder="2d10+4"
            className="w-full bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
          />
        </div>

        <div className="w-20 flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
          <Target size={12} className="text-slate-500 mr-1 shrink-0" />
          <input
            type="number"
            value={targetNumber}
            onChange={(e) => setTargetNumber(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRoll(customExpr); }}
            placeholder="TN"
            className="w-full bg-transparent text-xs font-mono text-amber-300 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => handleRoll(customExpr)}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg uppercase transition-all shadow-md shrink-0"
        >
          Roll
        </button>
      </div>

      {/* Broadcast to Active CommLink Channel option */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
          <input
            type="checkbox"
            checked={broadcastToChat}
            onChange={(e) => setBroadcastToChat(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
          />
          <Radio size={12} className={broadcastToChat ? 'text-cyan-400' : 'text-slate-600'} />
          <span>Broadcast to {activeChannel?.displayName || 'Comms'}</span>
        </label>
      </div>

      {/* Latest Result Banner */}
      {latestRoll && (
        <div className={`p-3 rounded-lg border text-center transition-all ${
          latestRoll.isCritSuccess 
            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
            : latestRoll.isCritFail
            ? 'bg-red-500/20 border-red-500 text-red-200'
            : 'bg-slate-900/90 border-slate-700 text-slate-100'
        }`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase">
            {latestRoll.expression} {latestRoll.targetNumber ? `vs TN ${latestRoll.targetNumber}` : ''}
          </div>
          <div className="text-3xl font-bold font-mono my-1 tracking-wider text-cyan-300">
            {latestRoll.total}
          </div>
          <div className="text-[11px] font-mono text-slate-300">
            Rolls: [{latestRoll.rolls.map(r => r.value).join(', ')}] {latestRoll.isCritSuccess ? '(Value: 30)' : latestRoll.isCritFail ? '(Value: -10)' : ''} {latestRoll.modifier !== 0 ? (latestRoll.modifier > 0 ? `+ ${latestRoll.modifier}` : `${latestRoll.modifier}`) : ''}
          </div>

          {latestRoll.isCritSuccess && (
            <div className="text-xs font-bold text-amber-300 uppercase mt-1 animate-pulse">
              ⚡ CRITICAL SUCCESS (VALUE: 30) ⚡
            </div>
          )}
          {latestRoll.isCritFail && (
            <div className="text-xs font-bold text-red-400 uppercase mt-1">
              💀 CRITICAL FUMBLE (VALUE: -10) 💀
            </div>
          )}
          {latestRoll.margin !== null && (
            <div className={`text-xs font-bold mt-1 ${latestRoll.isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
              {latestRoll.isSuccess ? `SUCCESS (Margin: +${latestRoll.margin})` : `FAILURE (Margin: ${latestRoll.margin})`}
            </div>
          )}
        </div>
      )}

      {/* History Log */}
      {history.length > 1 && (
        <div className="max-h-28 overflow-y-auto space-y-1 pr-1 border-t border-slate-800 pt-2">
          {history.slice(1).map((h) => (
            <div key={h.id} className="flex justify-between items-center text-[10px] font-mono text-slate-400 p-1 bg-slate-900/40 rounded">
              <span>{h.expression} [{h.rolls.map(r => r.value).join(', ')}]</span>
              <span className="text-slate-200 font-bold">{h.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiceRollerDock;
