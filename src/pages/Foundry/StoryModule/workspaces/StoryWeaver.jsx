/**
 * @file StoryWeaver.jsx
 * @description Consolidated Story Weaver Workspace for ADE Studio.
 * Intelligently unites:
 *   1. Prose & Manuscript Authoring: Rich text (ReactQuill), live word telemetry, reading time,
 *      POV character lock, and AI pair-authoring (Continue, Expand, Polish, Extract State Deltas).
 *   2. Outline & Scene Beats: High-level scenario plot outline and beat-by-beat progression.
 *   3. Creative Genesis: Guidance Gems (Genre, Tone, Mood, Conflict) & premise brainstorming.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useStory } from '../../../../context/CampaignContext';
import { useAuth } from '../../../../context/AuthContext';
import { AudioService } from '../../../../services/audioService';
import { generateContent, streamContent } from '../../../../services/aimeService';
import { extractNarrativeDeltas } from '../../../../services/cronicleService';
import { GUIDANCE_GEMS } from '../guidanceGemsConfig';
import { 
  Feather, 
  UserCheck, 
  Clock, 
  Hash, 
  Copy, 
  Check, 
  Sparkles, 
  Loader2, 
  Download, 
  BookOpen, 
  Layers, 
  Target, 
  RefreshCw, 
  Send, 
  ArrowRight, 
  CornerDownRight, 
  FileText, 
  ChevronDown,
  Wand2,
  Sliders
} from 'lucide-react';

export default function StoryWeaver({ activeNode, updateStory, guidanceGems = '' }) {
  const { 
    universeState, 
    updateCreativeState,
    updateOutline,
    updateSceneBeats,
    updateDraft,
    elementsCatalog,
    cronicle,
    stageCronicleDeltas
  } = useStory();

  const { currentUser, userHandle } = useAuth();

  // Weaver Sub-Modes: 'manuscript' | 'outline' | 'genesis'
  const [weaverTab, setWeaverTab] = useState('manuscript');

  // Manuscript / Prose State
  const [content, setContent] = useState(activeNode?.content || '');
  const [activePov, setActivePov] = useState(activeNode?.fields?.pov || '');
  const [copied, setCopied] = useState(false);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [aiActionLabel, setAiActionLabel] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Outline & Beats State
  const [outline, setOutline] = useState(activeNode?.fields?.storyOutline || universeState?.creativeState?.storyOutline || '');
  const [sceneBeats, setSceneBeats] = useState(activeNode?.fields?.sceneBeats || universeState?.creativeState?.sceneBeats || '');
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingBeats, setIsGeneratingBeats] = useState(false);

  // Creative Genesis & Premise State
  const [premisePrompt, setPremisePrompt] = useState('');
  const [isBrainstorming, setIsBrainstorming] = useState(false);

  // Sync content when activeNode changes
  useEffect(() => {
    if (activeNode) {
      setContent(activeNode.content || '');
      setActivePov(activeNode.fields?.pov || '');
      setOutline(activeNode.fields?.storyOutline || universeState?.creativeState?.storyOutline || '');
      setSceneBeats(activeNode.fields?.sceneBeats || universeState?.creativeState?.sceneBeats || '');
    }
  }, [activeNode?.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Telemetry
  const words = useMemo(() => {
    return content.trim() ? content.trim().replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length : 0;
  }, [content]);

  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const handleContentChange = (val) => {
    setContent(val);
    if (activeNode?.id) {
      updateStory(activeNode.id, { content: val });
    }
  };

  const handlePovChange = (newPov) => {
    setActivePov(newPov);
    if (activeNode?.id) {
      updateStory(activeNode.id, {
        fields: {
          ...(activeNode.fields || {}),
          pov: newPov
        }
      });
    }
  };

  const handleCopy = () => {
    const plain = content.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(plain);
    AudioService.playTerminalBeep(1200, 0.05);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    AudioService.playTerminalBeep(1400, 0.08);
    const plain = content.replace(/<[^>]+>/g, '');
    const filename = `${(activeNode?.title || 'Story').replace(/[^a-zA-Z0-9_-]/g, '_')}_manuscript.md`;
    const blob = new Blob([plain], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── AI PAIR-AUTHORING ACTIONS ──
  const handleAiPairAuthor = async (actionType) => {
    if (isAiWorking || !activeNode) return;
    setIsAiWorking(true);
    AudioService.playTerminalBeep(1000, 0.05);

    const plainText = content.replace(/<[^>]+>/g, '');
    let prompt = '';

    if (actionType === 'continue') {
      setAiActionLabel('Continuing Scene Narrative...');
      prompt = `Continue writing the narrative from this exact point for 2 evocative paragraphs. Maintain the POV (${activePov || 'Third Person'}), active tone (${guidanceGems || 'Sci-Fi'}), and established atmosphere:\n\n${plainText.slice(-800)}`;
    } else if (actionType === 'expand') {
      setAiActionLabel('Expanding Sensory Details...');
      prompt = `Rewrite and expand the following scene segment with rich sensory textures (tactile details, lighting, sci-fi acoustics, interiority) while preserving the plot beats:\n\n${plainText.slice(-600)}`;
    } else if (actionType === 'polish') {
      setAiActionLabel('Polishing Prose & Style...');
      prompt = `Line-edit and polish the following prose for maximum dramatic tension, crisp pacing, and evocative science-fantasy style:\n\n${plainText.slice(-800)}`;
    }

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        let updated = content;
        if (actionType === 'continue') {
          updated = `${content}<p>${result.replace(/\n\n/g, '</p><p>')}</p>`;
        } else {
          updated = `${content}<br/><hr/><p><strong>[AI Polish Proposal]:</strong></p><p>${result.replace(/\n\n/g, '</p><p>')}</p>`;
        }
        handleContentChange(updated);
        showToast('✓ AI authoring assist complete');
      }
    } catch (err) {
      console.warn('AI authoring failed:', err);
      showToast('AI authoring request failed');
    } finally {
      setIsAiWorking(false);
      setAiActionLabel('');
    }
  };

  // State delta extraction into Cronicle
  const handleExtractDeltas = async () => {
    const plainText = content.replace(/<[^>]+>/g, '');
    if (!plainText || plainText.length < 30) {
      showToast('Need at least a paragraph of prose to deduce deltas');
      return;
    }
    setIsAiWorking(true);
    setAiActionLabel('Deducing Narrative State Transitions...');
    AudioService.playTerminalBeep(1050, 0.06);

    try {
      const deltas = await extractNarrativeDeltas({
        prose: plainText,
        cronicle
      });
      if (deltas && deltas.length > 0) {
        stageCronicleDeltas(deltas);
        showToast(`⚡ Deduced ${deltas.length} Cronicle state delta(s)!`);
      } else {
        showToast('No state changes detected in this section');
      }
    } catch (err) {
      console.warn('Delta extraction failed:', err);
      showToast('State extraction failed');
    } finally {
      setIsAiWorking(false);
      setAiActionLabel('');
    }
  };

  // ── OUTLINE & BEATS GENERATION ──
  const handleGenerateOutline = async () => {
    setIsGeneratingOutline(true);
    AudioService.playTerminalBeep(1100, 0.04);
    const prompt = `Synthesize a structured 3-act story outline with key narrative turning points for this RPG scenario:
Title: "${activeNode?.title || 'Scenario'}"
Guidance: ${guidanceGems || 'Sci-Fi'}
Format with clear bulleted acts:
Act 1: Inciting Incident & Mission Setup
Act 2: Rising Tension, Complications & Reversals
Act 3: Climax, Tactical Resolution & Aftermath`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        setOutline(result);
        if (activeNode?.id) {
          updateStory(activeNode.id, {
            fields: { ...(activeNode.fields || {}), storyOutline: result }
          });
        }
        showToast('✓ Story outline generated');
      }
    } catch (err) {
      console.warn('Outline generation failed:', err);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleGenerateBeats = async () => {
    setIsGeneratingBeats(true);
    AudioService.playTerminalBeep(1100, 0.04);
    const prompt = `Generate a sequence of 4-6 sequential tactical scene beats for this scenario:
Title: "${activeNode?.title || 'Scenario'}"
Outline: ${outline ? outline.slice(0, 400) : 'General progression'}
Guidance: ${guidanceGems || 'Sci-Fi'}
Format each beat on its own line:
- Beat 1: [Infiltration / Recon] description
- Beat 2: [Encounter / Puzzle] description
- Beat 3: [Crisis / Turning Point] description
- Beat 4: [Extraction / Climax] description`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        setSceneBeats(result);
        if (activeNode?.id) {
          updateStory(activeNode.id, {
            fields: { ...(activeNode.fields || {}), sceneBeats: result }
          });
        }
        showToast('✓ Scene beats generated');
      }
    } catch (err) {
      console.warn('Beats generation failed:', err);
    } finally {
      setIsGeneratingBeats(false);
    }
  };

  // ── CREATIVE GENESIS BRAINSTORMING ──
  const handleBrainstormPremise = async () => {
    if (!premisePrompt.trim()) return;
    setIsBrainstorming(true);
    AudioService.playTerminalBeep(1100, 0.04);
    const prompt = `Brainstorm 3 compelling story premises and dramatic narrative conflicts based on this prompt:
Prompt: "${premisePrompt}"
Guidance: ${guidanceGems || 'Sci-Fi'}
Provide rich atmospheric hooks, faction entanglements, and high-stakes choices for the operatives.`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        setOutline(prev => `${prev ? prev + '\n\n' : ''}### Brainstormed Premises\n${result}`);
        showToast('✓ Premises synthesized into outline');
      }
    } catch (err) {
      console.warn('Brainstorming failed:', err);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d16] font-mono select-none">
      {/* ── TOP WEAVER CONTROL BAR ── */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        {/* Weaver Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setWeaverTab('manuscript')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              weaverTab === 'manuscript'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Prose drafting & manuscript authoring"
          >
            <Feather size={12} />
            <span>Manuscript &amp; Prose</span>
          </button>

          <button
            type="button"
            onClick={() => setWeaverTab('outline')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              weaverTab === 'outline'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Structured plot outline & scene beats"
          >
            <Layers size={12} />
            <span>Outline &amp; Beats</span>
          </button>

          <button
            type="button"
            onClick={() => setWeaverTab('genesis')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              weaverTab === 'genesis'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Guidance Gems & creative premise genesis"
          >
            <Sparkles size={12} />
            <span>Creative Genesis</span>
          </button>
        </div>

        {/* Telemetry & Actions (Active when on manuscript tab) */}
        {weaverTab === 'manuscript' && (
          <div className="flex items-center gap-3 text-xs flex-wrap">
            {/* Word Count */}
            <div className="flex items-center gap-1 text-slate-400">
              <Hash size={12} className="text-cyan-400" />
              <span className="font-bold text-slate-200">{words}</span> words
            </div>

            {/* Reading Time */}
            <div className="flex items-center gap-1 text-slate-400 hidden sm:flex">
              <Clock size={12} className="text-amber-400" />
              <span className="font-bold text-slate-200">~{readingTimeMinutes}</span> min read
            </div>

            {/* POV Lock */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg text-[11px]">
              <UserCheck size={12} className="text-purple-400" />
              <input
                type="text"
                value={activePov}
                onChange={e => handlePovChange(e.target.value)}
                placeholder="POV: 3rd Person"
                className="bg-transparent text-purple-300 font-bold outline-none w-24 text-[10px]"
                title="Active Character Point of View"
              />
            </div>

            {/* AI Authoring Dropdown */}
            <div className="relative group">
              <button
                type="button"
                disabled={isAiWorking}
                className="px-2.5 py-1 bg-gradient-to-r from-cyan-950 to-purple-950 hover:from-cyan-900 hover:to-purple-900 border border-cyan-500/50 text-cyan-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Wand2 size={12} className="text-cyan-400" />
                <span>AI Assist</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              <div className="absolute right-0 mt-1 w-52 bg-slate-900/98 border border-cyan-500/40 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-xl text-xs divide-y divide-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                <button
                  onClick={() => handleAiPairAuthor('continue')}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                >
                  <span>⚡</span> Continue Narrative
                </button>
                <button
                  onClick={() => handleAiPairAuthor('expand')}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                >
                  <span>✨</span> Expand Sensory Details
                </button>
                <button
                  onClick={() => handleAiPairAuthor('polish')}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                >
                  <span>🪄</span> Polish &amp; Stylize
                </button>
                <button
                  onClick={handleExtractDeltas}
                  className="w-full text-left px-3 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 cursor-pointer"
                  title="Extract state transitions into Cronicle"
                >
                  <span>📜</span> Deduce State Deltas
                </button>
              </div>
            </div>

            {/* Copy / Export */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy prose"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Export Markdown"
            >
              <Download size={13} />
            </button>
          </div>
        )}
      </div>

      {/* AI Working Banner */}
      {isAiWorking && (
        <div className="px-4 py-1.5 bg-cyan-950/90 border-b border-cyan-400/50 text-cyan-300 text-xs flex items-center gap-2 font-mono shrink-0 animate-pulse">
          <Loader2 size={13} className="animate-spin text-cyan-400 shrink-0" />
          <span>{aiActionLabel || 'AI authoring assistant active...'}</span>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-14 right-6 z-40 bg-slate-900 border border-cyan-500 text-cyan-200 text-xs px-3 py-1.5 rounded-xl shadow-2xl font-mono animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* ── TAB VIEW 1: MANUSCRIPT & PROSE DRAFTING ── */}
      {weaverTab === 'manuscript' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#090d16] relative z-10 quill-dark-wrapper overflow-hidden">
          <ReactQuill 
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={quillModules}
            className="h-full flex flex-col"
            placeholder="Draft story prose, chapter narrative, sensory atmosphere, or dialogue..."
          />
        </div>
      )}

      {/* ── TAB VIEW 2: OUTLINE & SCENE BEATS ── */}
      {weaverTab === 'outline' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0e17] space-y-6 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Story Outline Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Scenario Plot Outline
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateOutline}
                  disabled={isGeneratingOutline}
                  className="px-3 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingOutline ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>{outline ? 'Regenerate Outline' : 'Generate Outline'}</span>
                </button>
              </div>

              <textarea
                value={outline}
                onChange={e => {
                  setOutline(e.target.value);
                  if (activeNode?.id) {
                    updateStory(activeNode.id, {
                      fields: { ...(activeNode.fields || {}), storyOutline: e.target.value }
                    });
                  }
                }}
                rows={8}
                placeholder="Author or generate structured 3-act plot outline..."
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500/60 text-slate-100 p-3 rounded-xl text-xs leading-relaxed outline-none select-text"
              />
            </div>

            {/* Scene Beats Progression Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Tactical Scene Beats Progression
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateBeats}
                  disabled={isGeneratingBeats}
                  className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingBeats ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>{sceneBeats ? 'Suggest Next Beats' : 'Generate Scene Beats'}</span>
                </button>
              </div>

              <textarea
                value={sceneBeats}
                onChange={e => {
                  setSceneBeats(e.target.value);
                  if (activeNode?.id) {
                    updateStory(activeNode.id, {
                      fields: { ...(activeNode.fields || {}), sceneBeats: e.target.value }
                    });
                  }
                }}
                rows={8}
                placeholder="Define chronological scene-by-scene beats and tactical milestones..."
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500/60 text-slate-100 p-3 rounded-xl text-xs leading-relaxed outline-none select-text"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB VIEW 3: CREATIVE GENESIS & PREMISE ── */}
      {weaverTab === 'genesis' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0e17] space-y-6 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Brainstorming Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Premise &amp; Conflict Synthesis
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide an imaginative seed, seed phrase, or prompt. The AI narrative engine will synthesize 3 dramatic hooks tailored to the Tangent SFF RPG setting.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={premisePrompt}
                  onChange={e => setPremisePrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleBrainstormPremise(); }}
                  placeholder="e.g. Derelict research orbital transmitting ghost telemetry from the Veil..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500/60 text-slate-100 p-2.5 rounded-xl text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleBrainstormPremise}
                  disabled={isBrainstorming || !premisePrompt.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isBrainstorming ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>Brainstorm</span>
                </button>
              </div>
            </div>

            {/* Guidance Gems Overview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>💎</span> Active Guidance Gems Context
              </span>
              <p className="text-xs text-slate-400">
                These creative tags shape all narrative generation across the Story Weaver and AI Overseer:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(universeState?.creativeState?.gems || []).length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No Guidance Gems active. Click 💎 Gems in the top bar to configure mood, tone, pacing, and conflict.</span>
                ) : (
                  universeState.creativeState.gems.map((gem, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1"
                    >
                      <span>💎</span> {gem}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
