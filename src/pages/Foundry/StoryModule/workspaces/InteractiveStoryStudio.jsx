import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStory } from '../../../../context/CampaignContext';
import { useFolio } from '../../../../context/FolioContext';
import { AudioService } from '../../../../services/audioService';
import { streamContent } from '../../../../services/aimeService';
import { 
  Sparkles, Play, RotateCcw, BookOpen, Send, 
  Dices, User, MapPin, Shield, Search, FileText, 
  Flame, CheckCircle, ChevronRight, Share2, Printer, 
  Settings, ArrowRight, CornerDownRight
} from 'lucide-react';
import AdventurePrintModal from './AdventurePrintModal';

export const InteractiveStoryStudio = ({ activeNode }) => {
  const { universeState, elementsCatalog, updateDraft, addMap, setActiveMapId } = useStory();
  const { roster } = useFolio();

  // Active Series / Volume / Chapter tracker
  const [selectedVolume, setSelectedVolume] = useState('Volume 1');
  const [chapterTitle, setChapterTitle] = useState(activeNode?.title || 'Chapter 1');

  // Interactive Story Beats Feed (starts empty without mock data)
  const [beats, setBeats] = useState([]);

  // Current Input & Interactive Decision State
  const [customActionInput, setCustomActionInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStreamingText, setActiveStreamingText] = useState('');
  const [skillCheckRoll, setSkillCheckRoll] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Connected Context Elements (Personas, Factions, Scenes, Clues)
  const [selectedConnectedElementIds, setSelectedConnectedElementIds] = useState([]);

  const allAvailableElements = useMemo(() => {
    return elementsCatalog || [];
  }, [elementsCatalog]);

  const toggleElementConnection = (elemId) => {
    AudioService.playTerminalBeep(900, 0.02);
    setSelectedConnectedElementIds(prev => 
      prev.includes(elemId) ? prev.filter(id => id !== elemId) : [...prev, elemId]
    );
  };

  const endOfBeatsRef = useRef(null);

  useEffect(() => {
    endOfBeatsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [beats, activeStreamingText]);

  // Dice Roll Check Integration
  const handleRollCheck = (skillName, dc = 13) => {
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const bonus = 3;
    const total = d1 + d2 + bonus;
    const isSuccess = total >= dc;

    if (isSuccess) AudioService.playTerminalBeep(1100, 0.15);
    else AudioService.playCombatHit(false);

    setSkillCheckRoll({
      skillName,
      dc,
      d1,
      d2,
      bonus,
      total,
      isSuccess,
      text: `${skillName}: Rolled ${d1}+${d2}+${bonus} = ${total} vs DC ${dc} (${isSuccess ? 'SUCCESS' : 'FAILURE'})`
    });
  };

  // Advance to Next Story Beat
  const handleAdvanceBeat = async (selectedOptionText) => {
    if (isGenerating) return;
    const chosenAction = selectedOptionText || customActionInput;
    if (!chosenAction.trim()) return;

    AudioService.playTerminalBeep(980, 0.08);
    setIsGenerating(true);
    setActiveStreamingText('');

    // Mark previous beat with chosen decision
    const currentBeat = beats[beats.length - 1];
    const updatedBeats = [...beats];
    updatedBeats[updatedBeats.length - 1] = {
      ...currentBeat,
      gate: {
        ...currentBeat.gate,
        chosenOption: chosenAction,
        checkResult: skillCheckRoll ? skillCheckRoll.text : null
      }
    };
    setBeats(updatedBeats);

    // Build rich context from connected elements
    const connectedElementsInfo = allAvailableElements
      .filter(el => selectedConnectedElementIds.includes(el.id))
      .map(el => `[${el.type}] ${el.name || el.title}: ${el.summary || el.description || ''}`)
      .join('\n');

    const contextPrompt = `
Series: "${selectedVolume}"
Chapter: "${chapterTitle}"
Connected Universe Elements:
${connectedElementsInfo || 'Standard Tangent Sci-Fi Universe'}

Previous Story Beats:
${updatedBeats.slice(-3).map(b => `BEAT ${b.beatIndex}:\n${b.content}\n[PLAYER CHOSE]: ${b.gate.chosenOption || ''}\n`).join('\n')}

Action Chosen by Player:
"${chosenAction}"
${skillCheckRoll ? `(Dice Outcome: ${skillCheckRoll.text})` : ''}

TASK:
Write the NEXT GRANULAR STORY BEAT in 1 or 2 evocative, sensory-rich paragraphs (between 70 to 140 words).
Focus on tactile details, atmosphere, consequences of the choice, and advancing the tactical situation.
End by generating a prompt and exactly THREE new distinct decision options for the player.
Format as:
[STORY_PROSE]
(your 1-2 paragraphs of narrative)
[OPTIONS]
Option 1: (action description)
Option 2: (action description)
Option 3: (action description)
`;

    let generatedAccumulator = '';

    try {
      await streamContent({
        prompt: contextPrompt,
        context: activeNode,
        apiKey: '',
        onChunk: (chunk) => {
          generatedAccumulator += chunk;
          setActiveStreamingText(generatedAccumulator);
        }
      });
    } catch (err) {
      console.warn('AIME stream fallback:', err);
    }

    // Parse the generated story prose and options
    let prose = generatedAccumulator;
    let newOptions = [
      { id: 'opt_a', text: 'Secure defensive cover and scan the chamber for automated sentry pods.', skill: 'Perception (DC 13)' },
      { id: 'opt_b', text: 'Interface with the auxiliary data-core before the backup power drops.', skill: 'Tech / Slicing (DC 14)' },
      { id: 'opt_c', text: 'Move rapidly towards the elevator shaft and breach the lower deck.', skill: 'Agility / Athletics (DC 12)' }
    ];

    if (prose.includes('[STORY_PROSE]') && prose.includes('[OPTIONS]')) {
      const parts = prose.split('[OPTIONS]');
      prose = parts[0].replace('[STORY_PROSE]', '').trim();
      const optionsText = parts[1] || '';
      const parsedOpts = optionsText
        .split('\n')
        .filter(l => l.trim().startsWith('Option') || l.trim().startsWith('-'))
        .map((l, idx) => ({
          id: `opt_${Date.now()}_${idx}`,
          text: l.replace(/Option \d+:/i, '').replace(/^[-*]\s*/, '').trim()
        }));

      if (parsedOpts.length >= 2) {
        newOptions = parsedOpts.slice(0, 3);
      }
    } else if (!prose.trim()) {
      // Offline fallback high-quality beat
      prose = `The biometric relay clicks green under your bypass probe. The heavy bulkhead slides open with a pneumatic hiss, revealing a subterranean laboratory bathed in amber emergency strophes. Shattered containment tubes line the perimeter; pooling bioluminescent amniotic fluid reflects the silhouette of a severed synthetic android chassis slumped against the central terminal console.`;
    }

    const nextBeat = {
      id: `beat_${Date.now()}`,
      beatIndex: updatedBeats.length + 1,
      content: prose,
      gate: {
        prompt: 'What is your next tactical move?',
        options: newOptions,
        chosenOption: null
      },
      timestamp: new Date().toISOString()
    };

    setBeats(prev => [...prev, nextBeat]);
    setActiveStreamingText('');
    setIsGenerating(false);
    setCustomActionInput('');
    setSkillCheckRoll(null);
    AudioService.playTerminalBeep(1200, 0.1);
  };

  // Rewind / Checkpoint timeline rollback
  const handleRewindToBeat = (index) => {
    AudioService.playTerminalBeep(700, 0.1);
    setBeats(prev => prev.slice(0, index));
  };

  // Commit Beat Stream into Fiction Manuscript
  const handleCommitToManuscript = () => {
    const fullProse = beats.map(b => b.content).join('\n\n');
    if (updateDraft) {
      updateDraft(fullProse);
      AudioService.playTerminalBeep(1300, 0.2);
      alert('✅ Story beats successfully committed into Fiction Manuscript Studio!');
    }
  };

  // Compile to VTT Adventure Module Scene
  const handleCompileToVtt = () => {
    const newMapId = `map_ade_${Date.now()}`;
    const newMap = {
      id: newMapId,
      title: `${chapterTitle} (Tactical Scene)`,
      type: 'Local',
      gridMode: 'square',
      lines: [],
      terrains: [],
      walls: [],
      objects: [],
      tokens: [],
      texts: [
        {
          id: `txt_${Date.now()}`,
          text: chapterTitle,
          x: 400,
          y: 320,
          fill: '#38bdf8',
          fontSize: 22
        }
      ]
    };

    if (addMap) {
      addMap(newMap);
      if (setActiveMapId) setActiveMapId(newMapId);
      AudioService.playTerminalBeep(1400, 0.25);
      alert('🗺️ Compiled scene directly into Tactical VTT (MapMaker)!');
    }
  };

  const activeBeat = beats[beats.length - 1];

  return (
    <div className="flex h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden font-sans select-none">
      {/* ── LEFT DRAWER: SERIES CONTEXT & CONNECTED LORE MATRIX ── */}
      <div className="w-72 border-r border-slate-800 bg-[#090d14] flex flex-col shrink-0">
        {/* Series Header */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <BookOpen size={12} />
              <span>Fiction Series Arc</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              ADE Engine
            </span>
          </div>

          <input
            type="text"
            value={selectedVolume}
            onChange={(e) => setSelectedVolume(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-400 font-mono mb-1.5"
            placeholder="Volume / Book Title"
          />

          <input
            type="text"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
            placeholder="Chapter Title"
          />
        </div>

        {/* Connected Elements Selector */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              Connected Lore Elements ({selectedConnectedElementIds.length})
            </h4>
            <span className="text-[10px] text-cyan-400 font-mono">In Context</span>
          </div>

          {allAvailableElements.length === 0 ? (
            <p className="text-slate-500 font-mono text-[11px] italic py-4">
              No elements in Element Forge yet. Connect Personas, Factions, and Scenes to enrich AI storytelling.
            </p>
          ) : (
            allAvailableElements.slice(0, 15).map(el => {
              const isSelected = selectedConnectedElementIds.includes(el.id);

              return (
                <div
                  key={el.id}
                  onClick={() => toggleElementConnection(el.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400/60 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] font-mono truncate">
                      {el.name || el.title || 'Lore Element'}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                      {el.type || 'Element'}
                    </div>
                  </div>
                  <span className={`text-xs ${isSelected ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                    {isSelected ? '✓' : '+'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Action Pipelines Bottom Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-1.5 font-mono text-xs">
          <button
            type="button"
            onClick={handleCommitToManuscript}
            className="w-full py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/50 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Transfer narrative prose into Fiction Manuscript"
          >
            <FileText size={12} />
            <span>Commit to Manuscript</span>
          </button>

          <button
            type="button"
            onClick={handleCompileToVtt}
            className="w-full py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Export scene into Tactical VTT MapMaker"
          >
            <MapPin size={12} />
            <span>Compile to VTT Map</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Open Print & PDF Publishing Spread"
          >
            <Printer size={12} />
            <span>Print & PDF Export</span>
          </button>
        </div>
      </div>

      {/* ── MAIN INTERACTIVE STORY TIMELINE ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0d14]">
        {/* Top Breadcrumb Bar */}
        <div className="h-10 px-6 bg-[#0f1420] border-b border-slate-800 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span className="text-slate-400">ADE Granular Story Mode</span>
            <span className="text-slate-600">/</span>
            <span className="font-bold text-cyan-300">{selectedVolume}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">{chapterTitle}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Beats: <strong className="text-cyan-400">{beats.length}</strong></span>
            <span>Words: <strong className="text-amber-400">{beats.reduce((sum, b) => sum + b.content.split(/\s+/).length, 0)}</strong></span>
          </div>
        </div>

        {/* Scrollable Story Beats Stream */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-thin">
          {beats.length === 0 && !activeStreamingText && (
            <div className="max-w-md mx-auto text-center py-20 text-slate-500 space-y-3 font-mono text-xs">
              <BookOpen size={36} className="mx-auto text-slate-600 opacity-60" />
              <p className="text-slate-400 font-bold uppercase tracking-wider">No Story Beats Yet</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Connect lore elements from the left panel and submit an opening action prompt below to start drafting narrative beats.
              </p>
            </div>
          )}

          {beats.map((beat, idx) => (
            <div
              key={beat.id}
              className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 transition-all relative group shadow-lg"
            >
              {/* Beat Index Badge & Rewind Button */}
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold uppercase tracking-wider">
                  Beat #{beat.beatIndex}
                </span>

                {idx < beats.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleRewindToBeat(idx + 1)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-amber-400 hover:text-amber-300 cursor-pointer"
                    title="Rewind story to this checkpoint to explore an alternate branch"
                  >
                    <RotateCcw size={11} />
                    <span>Rewind Branch Here</span>
                  </button>
                )}
              </div>

              {/* Story Narrative Prose */}
              <p className="text-slate-200 text-sm md:text-base leading-relaxed font-serif tracking-wide selection:bg-cyan-500/30">
                {beat.content}
              </p>

              {/* Past Chosen Action Badge */}
              {beat.gate.chosenOption && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/30 p-2.5 rounded-xl">
                  <CornerDownRight size={13} className="text-cyan-400 shrink-0" />
                  <span className="font-bold">Chosen Action:</span>
                  <span className="text-slate-200 italic">"{beat.gate.chosenOption}"</span>
                  {beat.gate.checkResult && (
                    <span className="text-[10px] text-amber-300 ml-auto font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {beat.gate.checkResult}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Real-time Streaming Prose Container */}
          {activeStreamingText && (
            <div className="max-w-3xl mx-auto bg-slate-900/80 border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.2)] animate-in fade-in">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-2">
                Synthesizing Next Story Beat...
              </span>
              <p className="text-slate-100 text-sm md:text-base leading-relaxed font-serif tracking-wide">
                {activeStreamingText}
              </p>
            </div>
          )}

          <div ref={endOfBeatsRef} />
        </div>

        {/* ── INTERACTIVE DECISION GATE COCKPIT (Bottom) ── */}
        <div className="border-t border-slate-800 bg-[#0d121c] p-4 md:p-5 shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Gate Title */}
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ChevronRight size={14} className="text-amber-400" />
                <span>Decision Gate: {activeBeat?.gate?.prompt || 'What do you do?'}</span>
              </span>

              {skillCheckRoll && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${skillCheckRoll.isSuccess ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-rose-950 text-rose-300 border-rose-500/50'}`}>
                  {skillCheckRoll.text}
                </span>
              )}
            </div>

            {/* 3 Interactive Branching Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(activeBeat?.gate?.options || []).map((opt, i) => (
                <button
                  key={opt.id || i}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleAdvanceBeat(opt.text)}
                  className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-850 hover:border-cyan-500/60 border border-slate-700/80 text-left transition-all group cursor-pointer flex flex-col justify-between gap-2 shadow-sm disabled:opacity-50"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/30">
                      #{i + 1}
                    </span>
                    <span className="text-xs text-slate-200 group-hover:text-cyan-300 leading-snug">
                      {opt.text}
                    </span>
                  </div>

                  {opt.skill && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/90 pt-1 border-t border-slate-800">
                      <span>{opt.skill}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollCheck(opt.skill, 13);
                        }}
                        className="px-1.5 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded text-[9px] cursor-pointer flex items-center gap-1"
                        title="Roll 2d10 Check"
                      >
                        <Dices size={10} />
                        <span>Roll</span>
                      </button>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Action Input Prompt */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customActionInput}
                onChange={(e) => setCustomActionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAdvanceBeat();
                  }
                }}
                disabled={isGenerating}
                placeholder="Or declare custom operative action (e.g. Infiltrate via cargo loader)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
              />

              <button
                type="button"
                onClick={() => handleAdvanceBeat()}
                disabled={isGenerating || !customActionInput.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer shrink-0"
              >
                <span>Advance Beat</span>
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print & PDF Publishing Modal */}
      <AdventurePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        storyTitle={chapterTitle}
        volumeTitle={selectedVolume}
        beats={beats}
      />
    </div>
  );
};

export default InteractiveStoryStudio;
