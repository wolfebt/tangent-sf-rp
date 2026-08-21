import React, { useState } from 'react';
import { Shield, Bot, Wand2, X, AlertCircle, Cpu } from 'lucide-react';
import { synthesizeMatrixWithBastion } from '../../services/bastionService';
import { AudioService } from '../../services/audioService';

export const CodexAiSynthesizerModal = ({
  isOpen,
  onClose,
  matrix,
  onApplyGeneratedData
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState(matrix.archetypes?.[0] || null);
  const [customDirectives, setCustomDirectives] = useState('');
  const [targetName, setTargetName] = useState('');
  const [targetTechLevel, setTargetTechLevel] = useState(3);
  const [targetMetaLevel, setTargetMetaLevel] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  if (!isOpen) return null;

  const handleSynthesize = async () => {
    setIsGenerating(true);
    setGenerationError('');
    AudioService.playTerminalBeep(1200, 0.04);

    try {
      const synthesizedData = await synthesizeMatrixWithBastion({
        matrix,
        archetype: selectedArchetype,
        customDirectives,
        targetName: targetName.trim(),
        targetTechLevel,
        targetMetaLevel
      });

      AudioService.playTerminalBeep(1400, 0.06);
      if (onApplyGeneratedData) {
        onApplyGeneratedData(synthesizedData);
      }
      onClose();
    } catch (err) {
      setGenerationError(`BASTION Synthesis error: ${err.message}`);
      AudioService.playErrorSound();
    } finally {
      setIsGenerating(false);
    }
  };

  const Icon = matrix.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
      <div className="w-full max-w-2xl bg-[#0b1019] border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col gap-4 text-slate-100 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `${matrix.color}20`, border: `1px solid ${matrix.color}60`, color: matrix.color }}
            >
              <Icon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                  <Bot size={12} /> BASTION TACTICAL COGNITION
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-mono text-amber-400 uppercase">{matrix.name} MATRIX</span>
              </div>
              <h2 className="font-bold text-base font-mono text-white">
                Engineer {matrix.label} with BASTION
              </h2>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {generationError && (
          <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{generationError}</span>
          </div>
        )}

        {/* Archetype Presets */}
        {matrix.archetypes && matrix.archetypes.length > 0 && (
          <div>
            <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              1. Tactical Archetype Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {matrix.archetypes.map((arch, idx) => {
                const isSelected = selectedArchetype?.name === arch.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedArchetype(arch);
                      if (!targetName) setTargetName(arch.name);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold text-slate-200 truncate">{arch.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{arch.prompt}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Parameters: Name, TL, ML */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
              Designation / Model Name
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="E.g., Mk-IV Pulse Rifle..."
              className="w-full p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
              Tech Level (TL: {targetTechLevel})
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={targetTechLevel}
              onChange={(e) => setTargetTechLevel(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>TL 0 (Archaic)</span>
              <span>TL 5 (Singularity)</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
              Meta Level (ML: {targetMetaLevel})
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={targetMetaLevel}
              onChange={(e) => setTargetMetaLevel(parseInt(e.target.value, 10))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>ML 0 (None)</span>
              <span>ML 5 (Cosmic)</span>
            </div>
          </div>
        </div>

        {/* Custom Directives / Tone */}
        <div>
          <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            2. Tactical Directives & Mechanical Focus (Optional)
          </label>
          <textarea
            rows={3}
            value={customDirectives}
            onChange={(e) => setCustomDirectives(e.target.value)}
            placeholder="E.g., Prioritize high armor penetration (AP 4), burst mode recoil compensation, high Design DC requirements..."
            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-none shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold uppercase rounded-xl transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSynthesize}
            disabled={isGenerating}
            className="flex-2 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>BASTION is Synthesizing {matrix.name} Rules...</span>
              </>
            ) : (
              <>
                <Cpu size={16} />
                <span>BASTION Synthesize & Pre-Fill Matrix</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CodexAiSynthesizerModal;
