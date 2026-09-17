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
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useStory } from '../../../../context/CampaignContext';
import { useAuth } from '../../../../context/AuthContext';
import { AudioService } from '../../../../services/audioService';
import { generateContent, streamContent } from '../../../../services/aimeService';
import { extractNarrativeDeltas } from '../../../../services/cronicleService';
import { GUIDANCE_GEMS } from '../guidanceGemsConfig';
import StoryElementExtractorModal from '../StoryElementExtractorModal';
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
  Sliders,
  MapPin,
  Activity,
  Radio,
  Map as MapIcon,
  Plus,
  Zap,
  Terminal,
  ShieldAlert
} from 'lucide-react';

export default function StoryWeaver({ activeNode, updateStory, guidanceGems = '' }) {
  const { 
    universeState, 
    updateCreativeState,
    updateOutline,
    updateSceneBeats,
    updateDraft,
    elementsCatalog,
    mapsCatalog,
    setActiveMapId,
    addMap,
    cronicle,
    stageCronicleDeltas
  } = useStory();

  const { currentUser, userHandle } = useAuth();
  const navigate = useNavigate();

  // Story Element Extractor Modal State
  const [isExtractorModalOpen, setIsExtractorModalOpen] = useState(false);
  const [extractInitialText, setExtractInitialText] = useState('');

  // Weaver Sub-Modes: 'manuscript' | 'outline' | 'tactical' | 'genesis'
  const [weaverTab, setWeaverTab] = useState('manuscript');

  // Unified Map Catalog access (global mapsCatalog + project maps)
  const allAvailableMaps = useMemo(() => {
    const catalog = mapsCatalog || [];
    const projectMaps = (universeState?.maps || []).filter(m => !catalog.some(cm => cm.id === m.id));
    return [...catalog, ...projectMaps];
  }, [mapsCatalog, universeState?.maps]);

  const linkedMap = useMemo(() => {
    if (!activeNode?.mapId) return null;
    return allAvailableMaps.find(m => m.id === activeNode.mapId) || null;
  }, [activeNode?.mapId, allAvailableMaps]);

  // Live Stage Event Stream
  const [tacticalEvents, setTacticalEvents] = useState([]);
  const [isGeneratingTacticalProse, setIsGeneratingTacticalProse] = useState(false);

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
    } finally {
      setIsBrainstorming(false);
    }
  };

  // Listen to real-time events from The Stage interactive objects
  useEffect(() => {
    const handleStoryTrigger = (e) => {
      const eventDetail = e.detail || {};
      const newEntry = {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        type: e.type,
        detail: eventDetail
      };
      setTacticalEvents(prev => [newEntry, ...prev].slice(0, 30));
      showToast(`⚡ Stage Event: ${e.type.replace(/-/g, ' ')}`);
    };

    window.addEventListener('story-foundry-node-triggered', handleStoryTrigger);
    window.addEventListener('stage-bulkhead-toggled', handleStoryTrigger);
    window.addEventListener('stage-hazard-toggled', handleStoryTrigger);
    window.addEventListener('story-foundry-milestone-reached', handleStoryTrigger);
    window.addEventListener('omnicortex-loot-dispensed', handleStoryTrigger);

    return () => {
      window.removeEventListener('story-foundry-node-triggered', handleStoryTrigger);
      window.removeEventListener('stage-bulkhead-toggled', handleStoryTrigger);
      window.removeEventListener('stage-hazard-toggled', handleStoryTrigger);
      window.removeEventListener('story-foundry-milestone-reached', handleStoryTrigger);
      window.removeEventListener('omnicortex-loot-dispensed', handleStoryTrigger);
    };
  }, []);

  // Synthesize rich GM read-aloud room/tactical narrative from map layout
  const handleGenerateTacticalProse = async () => {
    if (!linkedMap) return;
    setIsGeneratingTacticalProse(true);
    AudioService.playTerminalBeep(1100, 0.04);
    const tokenSummary = (linkedMap.tokens || []).map(t => `${t.name || t.label || 'Entity'} (${t.type || 'token'})`).join(', ') || 'No hostile units mapped';
    const objectSummary = (linkedMap.objects || []).map(o => `${o.label || o.type || 'Structure'} (${o.shape || 'object'})`).join(', ') || 'Standard tactical bulkheads';

    const prompt = `Write an atmospheric, sensory boxed-text GM read-aloud encounter description for this tactical battlemap in Tangent SFF RPG:
Scenario: "${activeNode?.title || 'Tactical Encounter'}"
Map Title: "${linkedMap.title}"
Grid Mode: ${linkedMap.gridMode || 'Square'}
Tactical Objects & Props: ${objectSummary}
Tokens & Entities Present: ${tokenSummary}
Guidance/Tone: ${guidanceGems || 'Sci-Fi Dark Industrial Tactical'}
Focus on sensory atmosphere (shadows, hum of generators, smell of ozone, tactical cover, impending tension). Keep it 2-3 evocative paragraphs.`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        const formatted = `<p><strong>[Tactical Read-Aloud: ${linkedMap.title}]</strong></p><p>${result.replace(/\n\n/g, '</p><p>')}</p>`;
        handleContentChange((content ? content + '<br/>' : '') + formatted);
        showToast('✓ Read-aloud description appended to Manuscript');
      }
    } catch (err) {
      console.warn('Tactical prose generation failed:', err);
    } finally {
      setIsGeneratingTacticalProse(false);
    }
  };

  // Insert a map event into the narrative manuscript
  const handleLogEventToProse = (evt) => {
    let summary = `Event: ${evt.type}`;
    if (evt.type === 'stage-bulkhead-toggled') {
      summary = `Bulkhead door ${evt.detail?.isOpen ? 'breached/opened' : 'sealed shut'}`;
    } else if (evt.type === 'story-foundry-node-triggered') {
      summary = `Data terminal accessed: ${evt.detail?.action || 'Encrypted node decrypted'}`;
    } else if (evt.type === 'stage-hazard-toggled') {
      summary = `Environmental hazard emitter ${evt.detail?.isActive ? 'activated' : 'vented/deactivated'}`;
    } else if (evt.type === 'omnicortex-loot-dispensed') {
      summary = `Supply container unlocked, gear acquired`;
    }
    const formattedNote = `<p><em>[Tactical Event @ ${evt.time}]: ${summary}.</em></p>`;
    handleContentChange((content ? content + '<br/>' : '') + formattedNote);
    showToast('✓ Logged event into Manuscript');
  };

  // Link or create map helper
  const handleCreateMapForScenario = () => {
    if (!activeNode) return;
    const newMapId = uuidv4();
    const newMap = {
      id: newMapId,
      title: `${activeNode.title || 'Untitled'} Encounter Map`,
      gridMode: 'hex',
      gridType: 'hex',
      lines: [],
      tokens: [],
      terrains: [],
      objects: [],
      texts: [],
      fog: []
    };
    if (typeof addMap === 'function') addMap(newMap);
    if (typeof updateStory === 'function') updateStory(activeNode.id, { mapId: newMapId });
    if (typeof setActiveMapId === 'function') setActiveMapId(newMapId);
    showToast('✓ New encounter map created and linked');
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
            onClick={() => setWeaverTab('tactical')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              weaverTab === 'tactical'
                ? 'bg-blue-950 text-blue-300 border border-blue-500/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tactical battlemap assets, scene triggers & live stage events"
          >
            <Target size={12} className={weaverTab === 'tactical' ? 'text-blue-300' : 'text-blue-400'} />
            <span>Tactical Map &amp; Events</span>
            {linkedMap && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/30 text-blue-200 font-mono">
                Linked
              </span>
            )}
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

            {/* Create Story Component / Element Extractor */}
            <button
              type="button"
              onClick={() => {
                const sel = window.getSelection()?.toString() || '';
                setExtractInitialText(sel || (content ? content.replace(/<[^>]+>/g, ' ').slice(0, 300) : ''));
                setIsExtractorModalOpen(true);
                AudioService.playTerminalBeep(1200, 0.03);
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/50 text-purple-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Extract or create game component (Persona, Item, Smart Prop, Hazard) from story"
            >
              <Box size={12} className="text-purple-400" />
              <span>Create Component</span>
            </button>

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

      {/* ── TAB VIEW 3: TACTICAL BATTLEMAP & LIVE STAGE EVENTS ── */}
      {weaverTab === 'tactical' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0e17] space-y-6 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header / Map Card */}
            {linkedMap ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-lg shadow-sm">
                      🗺️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-wide">{linkedMap.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 uppercase font-bold">
                          {linkedMap.gridMode || 'Square Grid'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Stage Map ID: {linkedMap.id} • Dimension: {linkedMap.width || 40}×{linkedMap.height || 30} cells
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1300, 0.04);
                        if (typeof setActiveMapId === 'function') setActiveMapId(linkedMap.id);
                        navigate(`/stage?mapId=${linkedMap.id}&scenarioId=${activeNode?.id}`);
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
                      title="Launch this battlemap live in The Stage VTT with active operative personas"
                    >
                      <span>⚔️</span>
                      <span>Deploy to STAGE</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateTacticalProse}
                      disabled={isGeneratingTacticalProse}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-blue-900/80 to-cyan-900/80 hover:from-blue-850 hover:to-cyan-850 border border-cyan-400/50 text-cyan-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      title="Synthesize atmospheric read-aloud description from map features using AIME"
                    >
                      {isGeneratingTacticalProse ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-amber-400" />}
                      <span>Synthesize Read-Aloud Prose</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStory(activeNode.id, { mapId: null })}
                      className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Unlink
                    </button>
                  </div>
                </div>

                {/* 2-Column Split: Tactical Map Elements Driving Story vs Live Stage Events */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
                  {/* Left Column: Map Elements & Objects */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={13} className="text-cyan-400" />
                        <span>Interactive Objects &amp; Bulkheads ({(linkedMap.objects || []).length})</span>
                      </span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                      {(linkedMap.objects || []).length === 0 ? (
                        <div className="p-3 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
                          No architectural interactive objects placed on this map yet.
                        </div>
                      ) : (
                        linkedMap.objects.map((obj, idx) => (
                          <div
                            key={obj.id || idx}
                            className="p-2.5 bg-slate-950/80 border border-slate-850 hover:border-slate-700 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                                <span className="text-[10px] text-cyan-400 uppercase font-mono">[{obj.type || obj.shape || 'PROP'}]</span>
                                <span className="truncate">{obj.label || `Object #${idx + 1}`}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Pos: ({Math.round(obj.x || 0)}, {Math.round(obj.y || 0)}) {obj.storyElementId ? `• Linked Node: ${obj.storyElementId}` : ''}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const mention = ` @${obj.label || obj.type || 'Object'} `;
                                handleContentChange((content ? content + ' ' : '') + mention);
                                showToast(`Inserted @${obj.label || obj.type} mention`);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-cyan-950/70 hover:bg-cyan-800 border border-cyan-500/40 text-cyan-300 rounded-lg uppercase tracking-wider transition-colors shrink-0"
                              title="Mention in scenario prose"
                            >
                              @Mention
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Tokens & Entities glancing */}
                    <div className="pt-2">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <UserCheck size={13} className="text-purple-400" />
                        <span>Deployed Tokens &amp; Operatives ({(linkedMap.tokens || []).length})</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(linkedMap.tokens || []).length === 0 ? (
                          <span className="text-xs text-slate-500 italic">No combat tokens deployed.</span>
                        ) : (
                          linkedMap.tokens.map((t, idx) => (
                            <span
                              key={t.id || idx}
                              className="px-2 py-1 bg-slate-950 border border-purple-500/30 text-purple-200 rounded-lg text-xs font-mono flex items-center gap-1"
                            >
                              <span>👤</span>
                              <span>{t.name || t.label || `Token #${idx + 1}`}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Event Chronicle & Narrative Link */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={13} className="text-amber-400" />
                        <span>Live Stage Narrative Feed ({tacticalEvents.length})</span>
                      </span>
                      {tacticalEvents.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setTacticalEvents([])}
                          className="text-[10px] text-slate-500 hover:text-slate-300 uppercase font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                      {tacticalEvents.length === 0 ? (
                        <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-center space-y-1.5">
                          <Radio size={16} className="text-slate-600 mx-auto animate-pulse" />
                          <p className="text-xs text-slate-400 font-bold">Awaiting Stage Interactions</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            When operatives breach bulkheads, access terminals, toggle hazards, or trigger story milestones on The Stage, real-time events appear here.
                          </p>
                        </div>
                      ) : (
                        tacticalEvents.map(evt => (
                          <div
                            key={evt.id}
                            className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 font-mono text-[11px] flex items-center gap-1">
                                <Zap size={11} className="text-amber-400" />
                                {evt.type.replace(/-/g, ' ')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{evt.time}</span>
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {evt.type === 'stage-bulkhead-toggled' && (
                                <span>Bulkhead door {evt.detail?.isOpen ? 'opened' : 'sealed'}{evt.detail?.operativeId ? ` by operative ${evt.detail.operativeId}` : ''}.</span>
                              )}
                              {evt.type === 'story-foundry-node-triggered' && (
                                <span>Terminal accessed: {evt.detail?.action || 'Encrypted Node Decrypted'}.</span>
                              )}
                              {evt.type === 'stage-hazard-toggled' && (
                                <span>Hazard emitter {evt.detail?.isActive ? 'activated' : 'vented/deactivated'}.</span>
                              )}
                              {evt.type === 'omnicortex-loot-dispensed' && (
                                <span>Loot crate dispensed gear item {evt.detail?.omnicortexGearId || ''}.</span>
                              )}
                              {evt.type === 'story-foundry-milestone-reached' && (
                                <span>Story milestone beacon reached by operative.</span>
                              )}
                            </div>
                            <div className="pt-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleLogEventToProse(evt)}
                                className="px-2 py-0.5 text-[9px] font-bold bg-amber-950/60 hover:bg-amber-800 border border-amber-500/40 text-amber-200 rounded uppercase transition-colors cursor-pointer"
                              >
                                + Log into Manuscript
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* No Map Linked - Connect with Map Catalog */
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg text-center max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-2xl mx-auto shadow-inner">
                  🗺️
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white tracking-wide">Connect Tactical Battlemap to Scenario</h3>
                  <p className="text-xs text-slate-400">
                    Intertwine this scenario node with the Map Catalog. Map actions and triggers will directly narrate and drive your campaign progression.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-left">
                  {allAvailableMaps.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block">
                        Select Existing Map from Catalog ({allAvailableMaps.length} Available):
                      </label>
                      <select
                        value={activeNode?.mapId || ''}
                        onChange={e => {
                          const val = e.target.value || null;
                          updateStory(activeNode.id, { mapId: val });
                          if (val) setActiveMapId(val);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs p-2.5 rounded-xl outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="">-- Choose Map from Catalog --</option>
                        {allAvailableMaps.map(m => (
                          <option key={m.id} value={m.id}>
                            🗺️ {m.title || 'Untitled Map'} {m.gridMode ? `(${m.gridMode})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleCreateMapForScenario}
                      className="px-4 py-2 bg-gradient-to-r from-blue-900 to-cyan-900 hover:from-blue-800 hover:to-cyan-800 border border-cyan-400/60 text-cyan-200 hover:text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus size={14} />
                      <span>Create New Scenario Encounter Map</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB VIEW 4: CREATIVE GENESIS & PREMISE ── */}
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

      {/* Story Element Extractor / Component Creator Modal */}
      <StoryElementExtractorModal
        isOpen={isExtractorModalOpen}
        onClose={() => setIsExtractorModalOpen(false)}
        initialText={extractInitialText}
        activeNode={activeNode}
        onCreated={(newElem) => {
          showToast(`✓ Component "${newElem.title}" registered to Omnicortex & Story!`);
        }}
      />
    </div>
  );
}
