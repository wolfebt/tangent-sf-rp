import React, { useState, useEffect } from 'react';
import { synthesizeCombatNarration } from '../../services/aimeDirectorService';
import { AudioService } from '../../services/audioService';

const AimeNarrationHud = ({
  isOpen = true,
  onClose,
  latestEvent = null,
  combatContext = {},
  onBroadcastToComms,
  isFloating = true
}) => {
  const [narrationText, setNarrationText] = useState(
    'AIME Virtual Director standing by. Real-time atmospheric combat telemetry engaged.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!latestEvent) return;

    const generateNarration = async () => {
      setIsGenerating(true);
      try {
        const text = await synthesizeCombatNarration(latestEvent, combatContext);
        setNarrationText(text);
        setHistory(prev => [{ text, timestamp: new Date().toLocaleTimeString(), eventType: latestEvent.type }, ...prev.slice(0, 9)]);
        AudioService.playTerminalBeep(880, 0.1);
      } catch (err) {
        console.warn('AIME Narration error:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateNarration();
  }, [latestEvent]);

  if (!isOpen) return null;

  return (
    <div
      className={`${
        isFloating ? 'fixed bottom-20 right-4 z-30 max-w-sm' : 'w-full'
      } bg-[#0b0f19]/95 backdrop-blur-md border border-purple-500/50 rounded-xl p-3 shadow-[0_0_25px_rgba(168,85,247,0.25)] flex flex-col gap-2 font-sans select-none animate-in fade-in zoom-in-95 duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-purple-500/30">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">✨</span>
          <h4 className="font-bold text-[11px] uppercase tracking-wider text-purple-300">
            AIME Combat Narrator
          </h4>
        </div>
        <div className="flex items-center gap-1">
          {isGenerating && (
            <span className="text-[9px] font-mono text-purple-400 animate-pulse">
              Synthesizing...
            </span>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Narrative Display */}
      <div className="p-2.5 bg-purple-950/40 border border-purple-800/40 rounded-lg min-h-[55px] flex items-center">
        <p className="text-xs text-purple-200 italic leading-relaxed font-serif">
          "{narrationText}"
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 text-[10px]">
        <span className="text-slate-500 font-mono">
          Telemetry: {latestEvent ? latestEvent.type.toUpperCase() : 'STANDBY'}
        </span>
        <button
          type="button"
          onClick={() => {
            if (onBroadcastToComms) {
              onBroadcastToComms(`[AIME NARRATIVE]: ${narrationText}`);
              AudioService.playTerminalBeep(1100, 0.15);
            }
          }}
          className="px-2 py-0.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-600/50 rounded font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>📻</span> Broadcast
        </button>
      </div>
    </div>
  );
};

export default AimeNarrationHud;
