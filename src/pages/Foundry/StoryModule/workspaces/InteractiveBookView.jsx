/**
 * @file InteractiveBookView.jsx
 * @description Dedicated Interactive Book / Gamebook Presentation Mode for Tangent ADE.
 * Renders scenario narrative beats in an immersive, book-quality typographical layout
 * with granular Lorebook margin dossiers, drop caps, mechanical footnotes, and decision gates.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Loader2, 
  Send, 
  Dices, 
  Brain, 
  Tag, 
  Bookmark, 
  Maximize2,
  FileText,
  Sliders,
  Compass,
  MessageSquare
} from 'lucide-react';
import { getTypePillStyle } from '../../ElementForge/elementSchemas';

// Helper to render [[Element Name]] or [[Element Name|Display Label]] as clickable lorebook wiki links
function renderTextWithWikiLinks(text, onOpenLorebookDossier) {
  if (!text) return null;
  const parts = text.split(/(\[\[[^\n\r\]]+\]\])/g);
  return parts.map((part, index) => {
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const inner = part.slice(2, -2).trim();
      const [targetName, displayName] = inner.includes('|')
        ? inner.split('|').map(s => s.trim())
        : [inner, inner];
      return (
        <button
          key={`wiki-${index}-${targetName}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLorebookDossier?.({
              title: targetName,
              name: targetName,
              type: 'Element',
              triggerMatched: `[[${targetName}]] Wiki Link`
            });
          }}
          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-sans text-xs font-semibold cursor-pointer transition-all hover:scale-105 align-baseline shadow-xs"
          title={`Inspect Lorebook dossier for "${targetName}"`}
        >
          <Bookmark size={10} className="text-cyan-400 shrink-0" />
          <span>{displayName || targetName}</span>
        </button>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
}

export default function InteractiveBookView({
  activeScenario,
  beats = [],
  activeStreamingText = '',
  isGenerating = false,
  activeOperative = null,
  skillCheckRoll = null,
  onAdvanceBeat,
  onRollCheck,
  onSpeakBeat,
  isSpeakingBeatId = null,
  onOpenLorebookDossier,
  customActionInput = '',
  setCustomActionInput,
  preAuthoredBranches = [],
  isEpistemicConsoleOpen = false,
  setIsEpistemicConsoleOpen,
  epistemicTargetType = 'npc',
  setEpistemicTargetType,
  epistemicTargetName = '',
  setEpistemicTargetName,
  epistemicQuery = '',
  setEpistemicQuery,
  epistemicFeed = [],
  isEpistemicSubmitting = false,
  handleExecuteEpistemicInterrogation
}) {
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large'
  const [showLoreMargins, setShowLoreMargins] = useState(true);
  const endOfBookRef = useRef(null);

  useEffect(() => {
    if (beats.length > 0 || activeStreamingText) {
      endOfBookRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [beats.length, activeStreamingText]);

  const activeBeat = beats.length > 0 ? beats[beats.length - 1] : null;

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#070a13] font-sans select-none relative">
      {/* ── BOOK READER CONTROLS HEADER ── */}
      <div className="px-4 md:px-8 py-2.5 bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap text-xs z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs">
            📖
          </span>
          <div>
            <h2 className="text-xs md:text-sm font-bold text-amber-200 tracking-wide font-serif">
              {activeScenario?.title || 'Interactive Scenario Book'}
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              Protagonist: <strong className="text-cyan-300">{activeOperative?.name || 'Operative'}</strong>
              {activeOperative && ` (${activeOperative.species} • ${activeOperative.archetype})`}
            </span>
          </div>
        </div>

        {/* Reader Customization Tools */}
        <div className="flex items-center gap-2">
          {/* Typography Size Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                fontSize === 'normal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                fontSize === 'large' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
              title="Large Font Size"
            >
              A+
            </button>
          </div>

          {/* Toggle Lorebook Margin Dossiers */}
          <button
            type="button"
            onClick={() => setShowLoreMargins(prev => !prev)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              showLoreMargins 
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Granular Lorebook Margin Tags"
          >
            <Bookmark size={12} className={showLoreMargins ? 'text-cyan-400' : 'text-slate-500'} />
            <span className="hidden sm:inline">Lorebook</span>
          </button>
        </div>
      </div>

      {/* ── MAIN SCROLLABLE BOOK PAGES ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 scrollbar-thin">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Chapter Opening / Scenario Read-Aloud Prologue */}
          <header className="border-b border-amber-500/20 pb-6 text-center space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80">
              — Chapter Opening Briefing —
            </div>
            <h1 className="text-xl md:text-3xl font-bold font-serif text-slate-100 tracking-tight">
              {activeScenario?.title || 'Tactical Incident'}
            </h1>
            {activeScenario?.fields?.readAloud && (
              <blockquote className="p-4 rounded-xl bg-slate-900/60 border-l-2 border-amber-500/60 text-xs md:text-sm text-slate-300 font-serif italic leading-relaxed text-left max-w-2xl mx-auto select-text shadow-sm">
                "{activeScenario.fields.readAloud}"
              </blockquote>
            )}
          </header>

          {/* Empty Timeline Notice */}
          {beats.length === 0 && !activeStreamingText && !isGenerating && (
            <div className="text-center py-16 space-y-3 text-slate-500 font-serif">
              <Compass size={40} className="mx-auto text-amber-500/50 animate-pulse" />
              <p className="text-sm font-semibold text-slate-300">The chapter begins with your first decision.</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
                Choose an authored branch or declare your operative's tactical action in the Decision Gate below.
              </p>
            </div>
          )}

          {/* Sequential Narrative Book Beats */}
          {beats.map((beat) => {
            const rawText = beat.text ? beat.text.trim() : '';
            const startsWithWiki = rawText.startsWith('[[');
            const firstLetter = (!startsWithWiki && rawText) ? rawText.charAt(0) : '';
            const remainingText = (!startsWithWiki && rawText) ? rawText.slice(1) : rawText;
            const textClasses = fontSize === 'large' 
              ? 'text-base md:text-lg leading-relaxed md:leading-loose' 
              : 'text-sm md:text-base leading-relaxed md:leading-loose';

            return (
              <article 
                key={beat.id} 
                className="space-y-4 pt-4 border-t border-slate-900 first:border-t-0 first:pt-0"
              >
                {/* Passage Header */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-850/60 pb-1.5">
                  <span className="font-bold text-amber-400/90 uppercase tracking-wider">
                    § Passage {beat.beatIndex} • {beat.protagonistName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSpeakBeat(beat.id, beat.text)}
                      className="hover:text-cyan-300 transition-colors cursor-pointer p-0.5"
                      title="Audio Read-Aloud"
                    >
                      <Volume2 size={13} className={isSpeakingBeatId === beat.id ? 'text-cyan-400 animate-pulse' : 'text-slate-500'} />
                    </button>
                    <span>{beat.timestamp}</span>
                  </div>
                </div>

                {/* Literary Prose with Drop Cap */}
                <div className={`text-slate-100 font-serif select-text ${textClasses}`}>
                  {firstLetter && (
                    <span className="float-left text-3xl md:text-4xl font-serif font-black text-amber-400 mr-2 leading-none select-none">
                      {firstLetter}
                    </span>
                  )}
                  <span className="whitespace-pre-wrap">{renderTextWithWikiLinks(remainingText, onOpenLorebookDossier)}</span>
                </div>

                {/* ── GRANULAR LOREBOOK MARGIN & FOOTNOTE DOSSIERS ── */}
                {showLoreMargins && beat.injectedLore && beat.injectedLore.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      <Bookmark size={11} className="text-cyan-400" />
                      <span>Granular Lorebook References Injected:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {beat.injectedLore.map((entry) => {
                        const pill = getTypePillStyle(entry.type);
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => onOpenLorebookDossier(entry)}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all hover:scale-105 cursor-pointer shadow-xs ${pill}`}
                            title={`Inspect ${entry.title} (${entry.triggerMatched || 'Matched Lore'})`}
                          >
                            <span>🏷️ {entry.title}</span>
                            <span className="text-[8px] opacity-75">({entry.type})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mechanical Mandate Footnote */}
                {beat.mandate && (
                  <div className="text-[10px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-850 flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-300">⚙️ Resolution:</span>
                      <span className={
                        beat.mandate.systemIntent === 'CRITICAL_TRIUMPH' ? 'text-emerald-300 font-bold' :
                        beat.mandate.systemIntent === 'EXECUTE_SUCCESS' ? 'text-cyan-300' :
                        beat.mandate.systemIntent === 'CRITICAL_FUMBLE' ? 'text-red-400 font-bold' :
                        'text-rose-400'
                      }>
                        {beat.mandate.systemIntent}
                      </span>
                      {beat.mandate.diceSummary && (
                        <span className="text-slate-500">• {beat.mandate.diceSummary.formula}</span>
                      )}
                    </span>
                    {beat.gate?.chosenOption && (
                      <span className="text-cyan-400 font-bold">
                        Decision ➔ "{beat.gate.chosenOption}"
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {/* Active Streaming Beat */}
          {activeStreamingText && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="animate-spin text-amber-400" />
                  <span>Synthesizing Passage #{beats.length + 1}...</span>
                </span>
                <Loader2 size={13} className="animate-spin text-amber-400" />
              </div>
              <p className="text-slate-100 font-serif text-sm md:text-base leading-relaxed md:leading-loose whitespace-pre-wrap">
                {renderTextWithWikiLinks(activeStreamingText, onOpenLorebookDossier)}
              </p>
            </div>
          )}

          <div ref={endOfBookRef} />

          {/* ── THE DECISION GATE (BOTTOM OF CHAPTER) ── */}
          <section className="pt-8 border-t-2 border-amber-500/30 space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs">
                  ⚡
                </span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  {activeBeat?.gate?.prompt || "Next Tactical Move"}
                </h3>
              </div>

              {/* Epistemic Interrogation Toggle */}
              <button
                type="button"
                onClick={() => setIsEpistemicConsoleOpen(prev => !prev)}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isEpistemicConsoleOpen
                    ? 'bg-amber-950 text-amber-300 border-amber-500/70 shadow-xs'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Epistemic Interrogation (NPC interrogation, Terminal slice, Clue deduction)"
              >
                <Brain size={11} className={isEpistemicConsoleOpen ? 'text-amber-400' : 'text-slate-400'} />
                <span>Interrogate / Deduce</span>
              </button>
            </div>

            {/* Pre-authored Visual Story Graph Branches */}
            {preAuthoredBranches.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                  📖 Canonical Story Branches:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {preAuthoredBranches.map(branch => (
                    <button
                      key={branch.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => onAdvanceBeat(branch.text, branch.targetScenarioId)}
                      className="p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/50 text-left text-xs font-sans text-purple-200 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-sm disabled:opacity-50"
                    >
                      <span className="font-semibold">{branch.text}</span>
                      <ChevronRight size={14} className="text-purple-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Dynamic Branching Decision Cards */}
            {activeBeat?.gate?.options && activeBeat.gate.options.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {activeBeat.gate.options.map((opt, i) => (
                  <button
                    key={opt.id || i}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => onAdvanceBeat(opt.text)}
                    className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 hover:border-amber-500/60 border border-slate-800 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-sm disabled:opacity-50 group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 shrink-0 font-mono">
                        #{i + 1}
                      </span>
                      <span className="text-xs font-sans text-slate-200 group-hover:text-amber-200 leading-snug">
                        {opt.text}
                      </span>
                    </div>

                    {opt.skill && (
                      <div className="flex items-center justify-between text-[10px] text-amber-300/90 pt-1.5 border-t border-slate-800/80">
                        <span className="truncate">{opt.skill}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRollCheck(opt.skill, 12);
                          }}
                          className="px-1.5 py-0.5 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-[9px] font-bold uppercase transition-colors shrink-0 ml-1 cursor-pointer"
                        >
                          🎲 2d10
                        </button>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Epistemic Interrogation Console */}
            {isEpistemicConsoleOpen && (
              <div className="p-3 bg-slate-900/95 border border-amber-500/50 rounded-xl space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Brain size={13} className="text-amber-400" />
                    <span>Epistemic Interrogation & Clue Deduction</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEpistemicTargetType('npc')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${epistemicTargetType === 'npc' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                    >
                      NPC
                    </button>
                    <button
                      type="button"
                      onClick={() => setEpistemicTargetType('terminal')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${epistemicTargetType === 'terminal' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Terminal
                    </button>
                    <button
                      type="button"
                      onClick={() => setEpistemicTargetType('artifact')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${epistemicTargetType === 'artifact' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Artifact
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={epistemicTargetName}
                    onChange={e => setEpistemicTargetName(e.target.value)}
                    placeholder={epistemicTargetType === 'npc' ? "NPC Name..." : epistemicTargetType === 'terminal' ? "Terminal ID..." : "Artifact Object..."}
                    className="w-1/3 bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={epistemicQuery}
                    onChange={e => setEpistemicQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleExecuteEpistemicInterrogation(); }}
                    placeholder="Ask deduction or interrogation question..."
                    className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    disabled={isEpistemicSubmitting || !epistemicQuery.trim()}
                    onClick={handleExecuteEpistemicInterrogation}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg uppercase cursor-pointer disabled:opacity-50"
                  >
                    {isEpistemicSubmitting ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                  </button>
                </div>

                {epistemicFeed.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 pt-1 border-t border-slate-800 text-[11px]">
                    {epistemicFeed.slice(0, 2).map(entry => (
                      <div key={entry.id} className="p-2 rounded bg-slate-950 border border-slate-850 space-y-0.5">
                        <div className="text-amber-300 font-bold">{entry.target}: "{entry.query}"</div>
                        <div className="text-slate-300 font-sans">{entry.answer}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Action Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customActionInput}
                onChange={e => setCustomActionInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onAdvanceBeat(); }}
                disabled={isGenerating}
                placeholder={activeOperative ? `Declare ${activeOperative.name}'s next action...` : 'Declare operative action...'}
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-400 placeholder-slate-500"
              />
              <button
                type="button"
                disabled={isGenerating || !customActionInput.trim()}
                onClick={() => onAdvanceBeat()}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send size={12} />
                <span>Act</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
