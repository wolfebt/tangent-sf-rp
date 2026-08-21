import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { Sparkles, X } from 'lucide-react';

export const AimeDrawer = ({ onClose }) => {
  const navigate = useNavigate();
  const { universeState } = useStory();

  const storyCards = universeState?.creativeState?.storyCards || [];
  const activeGems = universeState?.creativeState?.gems || [];

  return (
    <div className="flex flex-col h-full space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-bold uppercase">
              STORY FOUNDRY
            </span>
            <span className="text-slate-600 font-mono">•</span>
            <span className="text-slate-400 font-mono text-xs">ARTIFICIAL INTELLECT MASTER ENTITY</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            AIME Creative Engine
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.03);
              navigate('/foundry/aime');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} /> Open AIME Suite
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Guidance Gems Summary */}
      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
        <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">Active Guidance Gems</span>
        <div className="flex flex-wrap gap-1.5">
          {activeGems.length > 0 ? (
            activeGems.map((g, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono">
                {typeof g === 'object' ? `${g.category}: ${g.value}` : g}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 font-mono italic">No creative guidance gems active.</span>
          )}
        </div>
      </div>

      {/* Idea Cards List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[calc(100vh-340px)]">
        <span className="text-[10px] font-mono uppercase text-slate-500 block">Generated Idea Cards & Scene Beats</span>
        {storyCards.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <Sparkles size={24} className="mx-auto text-cyan-400 mb-2" />
            <p className="text-xs text-slate-400 font-mono mb-3">No brainstorm idea cards generated yet.</p>
            <button
              onClick={() => navigate('/foundry/aime')}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-bold uppercase"
            >
              Launch Brainstorm
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {storyCards.map((card, idx) => (
              <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase">{card.title || `Idea Beat #${idx + 1}`}</h4>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">{card.content || card.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AimeDrawer;
