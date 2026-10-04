import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Eye, 
  Zap, 
  ShieldCheck, 
  Check, 
  X, 
  Copy, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  UserCheck, 
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  Layers,
  FileText
} from 'lucide-react';
import { AIME_CANONICAL_GEMS } from '../guidanceGemsConfig';
import { generateContent } from '../../../../services/aimeService';
import { synthesizeSuperPrompt } from '../../../../services/superPromptSynthesizer';
import { AudioService } from '../../../../services/audioService';

/**
 * Computes a lightweight word-level diff for visual comparison.
 */
function computeWordDiff(origText, newText) {
  const origWords = (origText || '').trim().split(/\s+/).filter(Boolean);
  const newWords = (newText || '').trim().split(/\s+/).filter(Boolean);
  
  // Simple word diff segments: { type: 'common' | 'removed' | 'added', text: string }
  // Find longest common subsequence (LCS) matrix
  const m = origWords.length;
  const n = newWords.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (origWords[i].toLowerCase() === newWords[j].toLowerCase()) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to reconstruct diff tokens
  let i = m, j = n;
  const origTokens = [];
  const newTokens = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1].toLowerCase() === newWords[j - 1].toLowerCase()) {
      origTokens.unshift({ type: 'common', text: origWords[i - 1] });
      newTokens.unshift({ type: 'common', text: newWords[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      newTokens.unshift({ type: 'added', text: newWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      origTokens.unshift({ type: 'removed', text: origWords[i - 1] });
      i--;
    }
  }

  return { origTokens, newTokens };
}

/**
 * AimeCanvasSculptor
 * Floating selection HUD and side-by-side Proposal Review modal for surgical prose crafting.
 */
export default function AimeCanvasSculptor({
  quillRef,
  activeNode,
  elementsCatalog = [],
  guidanceGems = '',
  activePov = '',
  onApplySculpt,
  onShowToast
}) {
  const [selection, setSelection] = useState(null); // { range, text, bounds }
  const [isWorking, setIsWorking] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  
  // Dropdown menus inside the floating palette
  const [toneMenuOpen, setToneMenuOpen] = useState(false);
  const [povMenuOpen, setPovMenuOpen] = useState(false);
  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Proposal Review State
  const [proposal, setProposal] = useState(null); // { originalText, proposalText, actionLabel, range }
  const [diffViewMode, setDiffViewMode] = useState('sideBySide'); // 'sideBySide' | 'unified'
  const [copiedProposal, setCopiedProposal] = useState(false);

  const paletteRef = useRef(null);

  // Tone options from canonical AIME gems
  const toneOptions = useMemo(() => {
    return AIME_CANONICAL_GEMS.tone?.options || [
      'Serious', 'Humorous', 'Formal', 'Informative', 'Optimistic',
      'Pessimistic', 'Joyful', 'Sad', 'Hopeful', 'Cynical'
    ];
  }, []);

  // POV options from canonical AIME gems + active persona
  const povOptions = useMemo(() => {
    const canonical = AIME_CANONICAL_GEMS.pointOfView?.options || [
      'First Person', 'Third Person Limited', 'Third Person Omniscient', 'Second Person'
    ];
    const list = canonical.map(p => ({ label: p, value: p }));
    if (activePov) {
      list.unshift({ label: `Active POV (${activePov})`, value: activePov });
    }
    return list;
  }, [activePov]);

  // Hook into Quill editor selection events
  useEffect(() => {
    let editor = null;
    let checkInterval = null;

    const attachListener = () => {
      if (!quillRef?.current) return false;
      editor = quillRef.current.getEditor ? quillRef.current.getEditor() : null;
      if (!editor) return false;

      const handleSelectionChange = (range, oldRange, source) => {
        if (!range || range.length < 3) {
          // Do not close immediately if proposal modal or dropdown is active
          if (!proposal && !isWorking) {
            setSelection(null);
          }
          return;
        }

        try {
          const selectedText = editor.getText(range.index, range.length).trim();
          if (!selectedText || selectedText.length < 3) {
            if (!proposal && !isWorking) setSelection(null);
            return;
          }

          const bounds = editor.getBounds(range.index, range.length);
          setSelection({
            range,
            text: selectedText,
            bounds
          });
        } catch (e) {
          console.warn('Error reading quill selection bounds:', e);
        }
      };

      editor.on('selection-change', handleSelectionChange);
      return () => {
        editor.off('selection-change', handleSelectionChange);
      };
    };

    let cleanup = attachListener();
    if (!cleanup) {
      checkInterval = setInterval(() => {
        cleanup = attachListener();
        if (cleanup) clearInterval(checkInterval);
      }, 250);
    }

    return () => {
      if (cleanup) cleanup();
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [quillRef, proposal, isWorking]);

  // Execute an AI Sculpt Action
  const executeSculpt = async (actionType, param = '') => {
    if (!selection?.text || isWorking) return;
    setIsWorking(true);
    setToneMenuOpen(false);
    setPovMenuOpen(false);
    setCustomPromptOpen(false);
    AudioService.playTerminalBeep(1100, 0.04);

    let actionLabel = '';
    let systemInstruction = '';

    const selectedExcerpt = selection.text;

    if (actionType === 'tone_shift') {
      actionLabel = `Tone Shift: ${param}`;
      systemInstruction = `Rewrite the following narrative excerpt shifting its overall mood and emotional lens strictly to a "${param}" tone. Preserve all factual events, character decisions, names, and plot stakes, but dramatically sculpt the vocabulary, sentence cadence, and descriptive voice to embody "${param}".\n\nExcerpt:\n"${selectedExcerpt}"`;
    } else if (actionType === 'pov_shift') {
      actionLabel = `POV Shift: ${param}`;
      systemInstruction = `Rewrite the following narrative excerpt strictly from the perspective of "${param}". Ensure sensory perceptions, internal thoughts, and narrative distance reflect this point of view accurately without altering the core events.\n\nExcerpt:\n"${selectedExcerpt}"`;
    } else if (actionType === 'sensory_expansion') {
      actionLabel = 'Sensory Expansion (Textures, Acoustics & Lighting)';
      systemInstruction = `Sensory Sculpt Directive: Expand the following passage by weaving in tactile, auditory, lighting, and olfactory textures. Describe the tangible physical world (e.g. the temperature of the air, the hum of ship systems, the scent of ozone, the play of harsh neon shadows) without bogging down the pacing.\n\nExcerpt:\n"${selectedExcerpt}"`;
    } else if (actionType === 'dramatize') {
      actionLabel = 'Dramatize ("Show, Don\'t Tell")';
      systemInstruction = `Dramatization Directive: Revise the following passage to embody "Show, Don't Tell". Transmute abstract emotional exposition, passive summaries, and internal conclusions into overt physical mannerisms, subtle gestures, active dialogue, and tangible interactions with objects in the scene.\n\nExcerpt:\n"${selectedExcerpt}"`;
    } else if (actionType === 'lore_audit') {
      actionLabel = 'Lore & Asset Consistency Audit';
      systemInstruction = `Directorial Audit: Inspect the following passage against the established world lore, species rules, and character traits. Correct any contradictions or vague generic filler, tightening the descriptions to be unmistakably aligned with the setting's canon and linked assets. Output the refined, lore-tightened version.\n\nExcerpt:\n"${selectedExcerpt}"`;
    } else if (actionType === 'custom') {
      actionLabel = `Custom Sculpt: "${param}"`;
      systemInstruction = `Directorial Directive: "${param}".\nRevise the following excerpt precisely following this directive while maintaining narrative coherence.\n\nExcerpt:\n"${selectedExcerpt}"`;
    }

    setActiveAction(actionLabel);

    try {
      // Synthesize prompt through super-prompt synthesizer to embed Guidance, Traits, and Asset Hub
      const synthesizedPrompt = synthesizeSuperPrompt({
        activeNode,
        customPrompt: systemInstruction,
        guidanceGems,
        elementsCatalog
      });

      const response = await generateContent({
        prompt: synthesizedPrompt,
        context: activeNode
      });

      if (response && response.trim()) {
        const cleanResponse = response
          .replace(/^```[a-z]*\n?/i, '')
          .replace(/\n?```$/i, '')
          .trim();

        setProposal({
          originalText: selectedExcerpt,
          proposalText: cleanResponse,
          actionLabel,
          range: selection.range
        });
        AudioService.playCriticalChime(true);
      } else {
        onShowToast?.('AI returned an empty response. Please try again.');
      }
    } catch (err) {
      console.warn('AIME Sculpting failed:', err);
      onShowToast?.(`Sculpting error: ${err.message || 'Request failed'}`);
    } finally {
      setIsWorking(false);
      setActiveAction('');
    }
  };

  // Accept and Replace in Quill
  const handleAcceptReplace = () => {
    if (!proposal || !quillRef?.current) return;
    const editor = quillRef.current.getEditor();
    if (editor) {
      const { range, proposalText } = proposal;
      // Delete selected text
      editor.deleteText(range.index, range.length);
      // Insert proposal
      editor.insertText(range.index, proposalText);
      // Notify parent of updated HTML content
      onApplySculpt?.(editor.root.innerHTML);
      AudioService.playTerminalBeep(1300, 0.06);
      onShowToast?.('✓ AI Sculpt accepted & replaced');
    }
    setProposal(null);
    setSelection(null);
  };

  // Append Proposal After Selection
  const handleAppend = () => {
    if (!proposal || !quillRef?.current) return;
    const editor = quillRef.current.getEditor();
    if (editor) {
      const { range, proposalText } = proposal;
      const insertIndex = range.index + range.length;
      editor.insertText(insertIndex, `\n\n${proposalText}`);
      onApplySculpt?.(editor.root.innerHTML);
      AudioService.playTerminalBeep(1200, 0.05);
      onShowToast?.('✓ Proposal appended to scene');
    }
    setProposal(null);
    setSelection(null);
  };

  const handleCopyProposal = () => {
    if (!proposal) return;
    navigator.clipboard.writeText(proposal.proposalText);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2000);
    onShowToast?.('✓ Copied proposal to clipboard');
  };

  // Calculate palette positioning constrained within editor viewport
  const paletteStyle = useMemo(() => {
    if (!selection?.bounds) return { display: 'none' };
    const b = selection.bounds;
    // Position palette above the selection if space permits, else below
    const top = b.top > 65 ? b.top - 52 : b.bottom + 8;
    const left = Math.max(10, Math.min(b.left, 500));
    return {
      top: `${top}px`,
      left: `${left}px`
    };
  }, [selection?.bounds]);

  // Diff tokens for Proposal Review Modal
  const wordDiff = useMemo(() => {
    if (!proposal) return { origTokens: [], newTokens: [] };
    return computeWordDiff(proposal.originalText, proposal.proposalText);
  }, [proposal]);

  return (
    <>
      {/* ── FLOATING SELECTION SURGICAL PALETTE ── */}
      {selection && !proposal && (
        <div
          ref={paletteRef}
          style={paletteStyle}
          onMouseDown={(e) => e.stopPropagation()} // Prevent Quill selection loss
          className="absolute z-50 flex items-center gap-1 p-1 bg-slate-950/95 border border-cyan-500/70 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 font-mono text-xs select-none"
        >
          {/* AIME Badge */}
          <div className="flex items-center gap-1 px-2 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold text-[10px] tracking-wider shrink-0">
            <Sparkles size={11} className="text-cyan-400 animate-pulse" />
            <span>AIME SCULPT</span>
          </div>

          {/* Action 1: Tone Shift Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={isWorking}
              onClick={() => {
                setToneMenuOpen(prev => !prev);
                setPovMenuOpen(false);
                setCustomPromptOpen(false);
              }}
              className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Shift Tone / Voice"
            >
              <Sliders size={12} className="text-amber-400" />
              <span>Tone</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>

            {toneMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 divide-y divide-slate-800 max-h-56 overflow-y-auto scrollbar-thin">
                <div className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Shift Passage Tone
                </div>
                <div className="py-1">
                  {toneOptions.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => executeSculpt('tone_shift', t)}
                      className="w-full text-left px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-cyan-950/60 rounded flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{t}</span>
                      <ArrowRight size={10} className="text-cyan-500/50" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action 2: POV Shift Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={isWorking}
              onClick={() => {
                setPovMenuOpen(prev => !prev);
                setToneMenuOpen(false);
                setCustomPromptOpen(false);
              }}
              className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-purple-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Shift Point of View"
            >
              <UserCheck size={12} className="text-purple-400" />
              <span>POV</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>

            {povMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 max-h-56 overflow-y-auto scrollbar-thin">
                <div className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Shift Perspective (POV)
                </div>
                {povOptions.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => executeSculpt('pov_shift', p.value)}
                    className="w-full text-left px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-purple-950/60 rounded flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="truncate">{p.label}</span>
                    <ArrowRight size={10} className="text-purple-500/50 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action 3: Sensory Expansion */}
          <button
            type="button"
            disabled={isWorking}
            onClick={() => executeSculpt('sensory_expansion')}
            className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-emerald-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            title="Expand sensory textures: lighting, sound, touch, and atmosphere"
          >
            <Eye size={12} className="text-emerald-400" />
            <span className="hidden sm:inline">Sensory</span>
          </button>

          {/* Action 4: Dramatize / Show Don't Tell */}
          <button
            type="button"
            disabled={isWorking}
            onClick={() => executeSculpt('dramatize')}
            className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            title="Dramatize: Show, Don't Tell (active micro-mannerisms and conflict)"
          >
            <Zap size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">Show &gt; Tell</span>
          </button>

          {/* Action 5: Lore & Asset Consistency Audit */}
          <button
            type="button"
            disabled={isWorking}
            onClick={() => executeSculpt('lore_audit')}
            className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-amber-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            title="Verify against linked assets in Asset Hub and tighten lore consistency"
          >
            <ShieldCheck size={12} className="text-amber-400" />
            <span className="hidden sm:inline">Lore Audit</span>
          </button>

          {/* Action 6: Custom Directive Input Toggle */}
          <div className="relative">
            <button
              type="button"
              disabled={isWorking}
              onClick={() => {
                setCustomPromptOpen(prev => !prev);
                setToneMenuOpen(false);
                setPovMenuOpen(false);
              }}
              className="px-2 py-1 hover:bg-slate-800 text-slate-200 hover:text-indigo-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Custom Directorial Directive"
            >
              <Wand2 size={12} className="text-indigo-400" />
              <span>Direct...</span>
            </button>

            {customPromptOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Authorial Instruction:
                </span>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customPrompt.trim()) {
                      executeSculpt('custom', customPrompt.trim());
                    }
                  }}
                  placeholder="e.g. Heighten the sense of claustrophobia..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg outline-none select-text"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCustomPromptOpen(false)}
                    className="px-2 py-1 text-[10px] text-slate-400 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!customPrompt.trim()}
                    onClick={() => executeSculpt('custom', customPrompt.trim())}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Sculpt
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => setSelection(null)}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-0.5"
            title="Close Sculptor"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── WORKING INDICATOR HUD ── */}
      {isWorking && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950/95 border border-cyan-500/80 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-xl flex items-center gap-3 animate-in fade-in font-mono text-xs">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 animate-spin">
            <RefreshCw size={16} />
          </div>
          <div>
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>AIME Sculpting in Progress...</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs truncate">
              {activeAction || 'Synthesizing directorial revision with Gemini...'}
            </p>
          </div>
        </div>
      )}

      {/* ── PROPOSAL & DIFF REVIEW MODAL ── */}
      {proposal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-mono select-none">
          <div className="w-full max-w-4xl bg-slate-950 border border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    AIME Directorial Sculpt Proposal
                  </h3>
                  <p className="text-xs text-cyan-400">
                    {proposal.actionLabel}
                  </p>
                </div>
              </div>

              {/* View Mode Toggle & Telemetry */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDiffViewMode('sideBySide')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      diffViewMode === 'sideBySide'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiffViewMode('unified')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      diffViewMode === 'unified'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Diff Tokens
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setProposal(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body: Comparison View */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-4">
              {diffViewMode === 'sideBySide' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Original Passage */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Original Excerpt ({proposal.originalText.split(/\s+/).filter(Boolean).length} words)
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text font-serif italic">
                      "{proposal.originalText}"
                    </div>
                  </div>

                  {/* Right Column: AI Proposal */}
                  <div className="bg-cyan-950/20 border border-cyan-500/40 rounded-xl p-4 flex flex-col shadow-inner">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        Sculpted Proposal ({proposal.proposalText.split(/\s+/).filter(Boolean).length} words)
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyProposal}
                        className="text-[10px] text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
                      >
                        {copiedProposal ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedProposal ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-100 leading-relaxed whitespace-pre-wrap select-text font-serif">
                      "{proposal.proposalText}"
                    </div>
                  </div>
                </div>
              ) : (
                /* Unified Diff Token View */
                <div className="space-y-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Original with Deletions:
                    </span>
                    <p className="text-xs leading-relaxed font-serif select-text">
                      {wordDiff.origTokens.map((tok, idx) => (
                        <span
                          key={idx}
                          className={tok.type === 'removed' ? 'bg-rose-950/80 text-rose-300 line-through px-0.5 rounded mx-0.5' : 'text-slate-300'}
                        >
                          {tok.text}{' '}
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest block mb-2">
                      Proposal with Additions:
                    </span>
                    <p className="text-xs leading-relaxed font-serif select-text">
                      {wordDiff.newTokens.map((tok, idx) => (
                        <span
                          key={idx}
                          className={tok.type === 'added' ? 'bg-emerald-950/90 text-emerald-300 px-1 py-0.5 rounded font-medium border border-emerald-500/30 mx-0.5 shadow-sm' : 'text-slate-200'}
                        >
                          {tok.text}{' '}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setProposal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reject &amp; Discard
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAppend}
                  className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Insert the sculpted proposal immediately following the original passage"
                >
                  <span>+ Append After</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptReplace}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
                  title="Replace original highlighted passage with this proposal"
                >
                  <Check size={14} />
                  <span>Accept &amp; Replace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
