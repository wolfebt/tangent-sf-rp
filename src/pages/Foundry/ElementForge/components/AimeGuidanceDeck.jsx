/**
 * @file AimeGuidanceDeck.jsx
 * @description Layer 1: Guidance (The 'How') for the AIME Creative Suite.
 * Directorial Control Panel presenting the 6 canonical Guidance Gems:
 * Genre, Tone, Pacing, Point of View, Literary Devices, Structure.
 */

import React, { useState } from 'react';
import { AIME_CANONICAL_GEMS, EXTENDED_GEMS } from '../../StoryModule/guidanceGemsConfig';
import { Compass, Sparkles, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

export default function AimeGuidanceDeck({
  guidance = {},
  onChangeGuidance,
  isCollapsedByDefault = false
}) {
  const [isOpen, setIsOpen] = useState(!isCollapsedByDefault);
  const [showExtended, setShowExtended] = useState(false);

  // Active selections
  const genre = guidance.genre || guidance.Genre || '';
  const tone = guidance.tone || guidance.Tone || '';
  const pacing = guidance.pacing || guidance.Pacing || '';
  const pov = guidance.pov || guidance.POV || guidance["Point of View"] || '';
  const devices = Array.isArray(guidance.literaryDevices || guidance.devices || guidance["Literary Devices"]) 
    ? (guidance.literaryDevices || guidance.devices || guidance["Literary Devices"])
    : (guidance.literaryDevices ? [guidance.literaryDevices] : []);
  const structure = guidance.structure || guidance.Structure || '';

  const activeCount = [genre, tone, pacing, pov, devices.length > 0 ? 'dev' : '', structure]
    .filter(Boolean).length;

  const handleSelectSingle = (gemKey, value) => {
    const current = guidance[gemKey];
    const nextVal = current === value ? '' : value;
    onChangeGuidance({
      ...guidance,
      [gemKey]: nextVal
    });
  };

  const handleToggleDevice = (device) => {
    const nextDevices = devices.includes(device)
      ? devices.filter(d => d !== device)
      : [...devices, device];
    onChangeGuidance({
      ...guidance,
      literaryDevices: nextDevices
    });
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChangeGuidance({});
  };

  return (
    <div className="border border-slate-800 rounded-2xl bg-[#090d16]/90 overflow-hidden shadow-lg font-mono">
      {/* Directorial Header Bar */}
      <div className="p-3.5 bg-gradient-to-r from-slate-950 via-[#0a1520] to-slate-950 border-b border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-2.5 text-left flex-1 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-sm shadow-sm group-hover:bg-cyan-500/30 transition-colors">
            <Compass size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Layer 1: Guidance (The 'How')
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                {activeCount} Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">
              Directorial control panel: Sets stylistic lens, narrative voice, tone, and pacing.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] text-slate-500 hover:text-rose-400 px-2 py-0.5 uppercase tracking-wider font-bold transition-colors"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="text-slate-400 hover:text-white p-1"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Collapsed Pill Summary */}
      {!isOpen && activeCount > 0 && (
        <div className="px-3.5 py-2 bg-slate-950/60 flex items-center gap-1.5 flex-wrap border-b border-slate-800/60">
          {genre && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              Genre: {genre}
            </span>
          )}
          {tone && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
              Tone: {tone}
            </span>
          )}
          {pacing && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
              Pacing: {pacing}
            </span>
          )}
          {pov && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              POV: {pov}
            </span>
          )}
          {structure && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
              Structure: {structure}
            </span>
          )}
          {devices.length > 0 && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
              Devices: {devices.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* Open Accordion: Granular Guidance Gems */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Gem 1: Genre */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block">
              1. Genre
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AIME_CANONICAL_GEMS["Genre"].map(opt => {
                const isSelected = genre === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectSingle('genre', opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gem 2: Tone */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">
              2. Tone
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AIME_CANONICAL_GEMS["Tone"].map(opt => {
                const isSelected = tone === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectSingle('tone', opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-950 text-purple-200 border-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.3)]'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gem 3: Pacing */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
              3. Pacing
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AIME_CANONICAL_GEMS["Pacing"].map(opt => {
                const isSelected = pacing === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectSingle('pacing', opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gem 4: Point of View */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
              4. Point of View (POV)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AIME_CANONICAL_GEMS["Point of View"].map(opt => {
                const isSelected = pov === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectSingle('pov', opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-950 text-emerald-200 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gem 5: Literary Devices (Multi-select) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 block">
              5. Literary Devices (Multi-Select)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AIME_CANONICAL_GEMS["Literary Devices"].map(opt => {
                const isSelected = devices.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleDevice(opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1 ${
                      isSelected
                        ? 'bg-rose-950 text-rose-200 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check size={10} />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gem 6: Narrative Structure */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
              6. Narrative Structure
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AIME_CANONICAL_GEMS["Structure"].map(opt => {
                const isSelected = structure === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectSingle('structure', opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-950 text-indigo-200 border-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.3)]'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Extended SFF Gems */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowExtended(prev => !prev)}
              className="text-[10px] text-slate-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <span>{showExtended ? '▾ Hide' : '▸ Show'} Extended Tangent RPG Flavor Gems (Mood, Theme, Conflict)</span>
            </button>

            {showExtended && (
              <div className="mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
                {Object.entries(EXTENDED_GEMS).map(([cat, list]) => (
                  <div key={cat} className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {cat}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {list.map(item => {
                        const isSelected = (guidance[cat] === item) || (Array.isArray(guidance[cat]) && guidance[cat].includes(item));
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              const curr = guidance[cat];
                              const next = curr === item ? '' : item;
                              onChangeGuidance({ ...guidance, [cat]: next });
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border ${
                              isSelected
                                ? 'bg-slate-800 text-cyan-300 border-cyan-500/60'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
