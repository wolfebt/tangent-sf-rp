import React, { useState, useRef, useEffect } from 'react';
import { useStory } from '../../../context/CampaignContext';
import { useAuth } from '../../../context/AuthContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { generateContent, streamContent } from '../../../services/aimeService';
import { StorageService } from '../../../services/storageService';
import Split from 'react-split';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AIMEChatBox from './AIMEChatBox';


export const GUIDANCE_GEMS = {
  "Genre": ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Horror", "Mystery", "Romance", "Thriller"],
  "Tone": ["Serious", "Humorous", "Formal", "Informal", "Optimistic", "Pessimistic", "Joyful", "Sad", "Hopeful", "Cynical"],
  "Pacing": ["Fast-paced", "Slow-burn", "Steady", "Urgent", "Relaxed", "Meditative", "Action-Packed"],
  "POV": ["First Person", "Third Person Limited", "Third Person Omniscient", "Second Person", "Alternating POV"],
  "Theme": ["Redemption", "Betrayal", "Discovery", "Survival", "Love", "Hate", "Power", "Corruption", "Nature vs. Nurture"]
};

export default function AIME() {
  const { currentUser, userHandle } = useAuth();
  const { 
    universeState, 
    updateGems, 
    updateCreativeState,
    updateStoryCards, 
    updateOutline, 
    updateSceneBeats,
    updateDraft, 
    getActiveGemsText,
    addStory,
    updateLinkedElements,
    triggerStorySave 
  } = useStory();

  const creativeState = universeState.creativeState || { gems: [], storyCards: [], storyOutline: '', sceneBeats: '', storyDraft: '', linkedElements: [], customGems: {} };
  const customGems = creativeState.customGems || {};

  const getAllElements = (nodes) => {
    let all = [];
    if (!Array.isArray(nodes)) return all;
    nodes.forEach(node => {
      all.push(node);
      if (node.children && node.children.length > 0) {
        all = all.concat(getAllElements(node.children));
      }
    });
    return all;
  };

  const allElements = getAllElements(universeState.scenarios);

  const [activeTab, setActiveTab] = useState('brainstorm');
  const [brainstormPrompt, setBrainstormPrompt] = useState('');
  const [selectedGemCategory, setSelectedGemCategory] = useState(Object.keys(GUIDANCE_GEMS)[0]);
  const [newGemInput, setNewGemInput] = useState('');
  const [activeViewMode, setActiveViewMode] = useState('both');
  const [toastMessage, setToastMessage] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingBeat, setIsSuggestingBeat] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // AI Pair Authoring State
  const quillRef = useRef(null);
  const outlineQuillRef = useRef(null);
  const beatsQuillRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [contextMenuPos, setContextMenuPos] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuPos) setContextMenuPos(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenuPos]);

  const handleContextMenu = (e) => {
    const windowSel = window.getSelection()?.toString().trim();
    if (windowSel && windowSel.length > 0) {
      setSelectedText(windowSel);
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    } else if (selectedText) {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleQuillChangeSelection = (range, source, editor) => {
    if (range && range.length > 0) {
      setSelectionRange(range);
      setSelectedText(editor.getText(range.index, range.length));
    } else {
      setSelectionRange(null);
      setSelectedText('');
    }
  };

  // Canvas Export/Import & Local Save/Load State & Handlers
  const fileInputRef = useRef(null);
  const activeCanvasKeyRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyMarkdown = (content) => {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard!');
  };

  const handleDownloadBlob = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerImport = (canvasKey) => {
    activeCanvasKeyRef.current = canvasKey;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleSaveLocal = async (canvasKey) => {
    try {
      if (canvasKey === 'brainstorm') {
        await StorageService.setItem('aime_canvas_brainstorm', { prompt: brainstormPrompt, storyCards: creativeState.storyCards || [], timestamp: Date.now() });
        showToast('Brainstorm canvas saved locally!');
      } else if (canvasKey === 'outline') {
        await StorageService.setItem('aime_canvas_outline', { outline: creativeState.storyOutline || '', timestamp: Date.now() });
        showToast('Outline canvas saved locally!');
      } else if (canvasKey === 'beats') {
        await StorageService.setItem('aime_canvas_scene_beats', { sceneBeats: creativeState.sceneBeats || '', timestamp: Date.now() });
        showToast('Scene Beats canvas saved locally!');
      } else if (canvasKey === 'draft') {
        await StorageService.setItem('aime_canvas_prose_draft', { storyDraft: creativeState.storyDraft || '', timestamp: Date.now() });
        showToast('Prose Draft canvas saved locally!');
      }
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  };

  const handleLoadLocal = async (canvasKey) => {
    try {
      const data = await StorageService.getItem(`aime_canvas_${canvasKey === 'beats' ? 'scene_beats' : canvasKey === 'draft' ? 'prose_draft' : canvasKey}`);
      if (!data) return alert(`No local save found for ${canvasKey} canvas.`);
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (canvasKey === 'brainstorm') {
        if (parsed.prompt !== undefined) setBrainstormPrompt(parsed.prompt);
        if (parsed.storyCards) updateStoryCards(parsed.storyCards);
        showToast('Brainstorm canvas loaded from local storage!');
      } else if (canvasKey === 'outline') {
        if (parsed.outline !== undefined) updateOutline(parsed.outline);
        showToast('Outline canvas loaded from local storage!');
      } else if (canvasKey === 'beats') {
        if (parsed.sceneBeats !== undefined) updateSceneBeats(parsed.sceneBeats);
        showToast('Scene Beats canvas loaded from local storage!');
      } else if (canvasKey === 'draft') {
        if (parsed.storyDraft !== undefined) updateDraft(parsed.storyDraft);
        showToast('Prose Draft canvas loaded from local storage!');
      }
    } catch (e) {
      alert(`Load failed: ${e.message}`);
    }
  };

  const handleExportCanvas = (canvasKey) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const creatorInfo = extractCreatorInfo(universeState, userHandle, currentUser);
    const headerPrefix = `# TANGENT AIME — ${universeState.projectName || 'Project'}\n> **CREATOR:** ${creatorInfo.creatorTag}${creatorInfo.contributorTags?.length ? ` | **CONTRIBUTORS:** ${creatorInfo.contributorTags.join(', ')}` : ''}\n\n`;

    if (canvasKey === 'brainstorm') {
      const payload = JSON.stringify({ 
        type: 'AIME_BRAINSTORM', 
        projectName: universeState.projectName || 'Project',
        creatorTag: creatorInfo.creatorTag,
        contributorTags: creatorInfo.contributorTags || [],
        prompt: brainstormPrompt, 
        storyCards: creativeState.storyCards || [], 
        exportedAt: new Date().toISOString() 
      }, null, 2);
      downloadFile(payload, `aime_brainstorm_${timestamp}.json`, 'application/json');
    } else if (canvasKey === 'outline') {
      downloadFile(headerPrefix + (creativeState.storyOutline || ''), `aime_outline_${timestamp}.md`, 'text/markdown;charset=utf-8');
    } else if (canvasKey === 'beats') {
      downloadFile(headerPrefix + (creativeState.sceneBeats || ''), `aime_scene_beats_${timestamp}.md`, 'text/markdown;charset=utf-8');
    } else if (canvasKey === 'draft') {
      downloadFile(headerPrefix + (creativeState.storyDraft || ''), `aime_prose_draft_${timestamp}.md`, 'text/markdown;charset=utf-8');
    }
  };

  const handleClearCanvas = (canvasKey) => {
    if (!window.confirm("Are you sure you want to clear this canvas? This action cannot be undone unless you have a local save.")) return;
    if (canvasKey === 'brainstorm') {
      setBrainstormPrompt('');
      updateStoryCards([]);
      showToast('Brainstorm canvas cleared!');
    } else if (canvasKey === 'outline') {
      updateOutline('');
      showToast('Outline canvas cleared!');
    } else if (canvasKey === 'beats') {
      updateSceneBeats('');
      showToast('Scene Beats canvas cleared!');
    } else if (canvasKey === 'draft') {
      updateDraft('');
      showToast('Prose Draft canvas cleared!');
    }
  };


  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const key = activeCanvasKeyRef.current;
      try {
        if (key === 'brainstorm') {
          let parsed;
          try { parsed = JSON.parse(text); } catch {}
          if (parsed && typeof parsed === 'object') {
            if (parsed.prompt !== undefined) setBrainstormPrompt(parsed.prompt);
            if (Array.isArray(parsed.cards)) updateStoryCards(parsed.cards);
            else if (Array.isArray(parsed.storyCards)) updateStoryCards(parsed.storyCards);
          } else {
            setBrainstormPrompt(text);
          }
          showToast('Imported Brainstorm content!');
        } else if (key === 'outline') {
          let parsed;
          try { parsed = JSON.parse(text); } catch {}
          if (parsed && parsed.outline !== undefined) updateOutline(parsed.outline);
          else updateOutline(text);
          showToast('Imported Outline content!');
        } else if (key === 'beats') {
          let parsed;
          try { parsed = JSON.parse(text); } catch {}
          if (parsed && (parsed.beats !== undefined || parsed.sceneBeats !== undefined)) updateSceneBeats(parsed.beats || parsed.sceneBeats);
          else updateSceneBeats(text);
          showToast('Imported Scene Beats content!');
        } else if (key === 'draft') {
          let parsed;
          try { parsed = JSON.parse(text); } catch {}
          if (parsed && (parsed.draft !== undefined || parsed.storyDraft !== undefined)) updateDraft(parsed.draft || parsed.storyDraft);
          else updateDraft(text);
          showToast('Imported Prose Draft content!');
        }
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleToggleGem = (gem) => {
    const currentGems = creativeState.gems || [];
    if (currentGems.includes(gem)) {
      updateGems(currentGems.filter(g => g !== gem));
    } else {
      updateGems([...currentGems, gem]);
    }
  };

  const handleAddCustomGem = (category) => {
    const val = (customInputs[category] || '').trim();
    if (!val) return;

    const currentCustomGems = creativeState.customGems || {};
    const categoryCustomGems = currentCustomGems[category] || [];

    let newCategoryCustomGems = categoryCustomGems;
    if (!categoryCustomGems.includes(val)) {
      newCategoryCustomGems = [...categoryCustomGems, val];
      updateCreativeState({
        customGems: {
          ...currentCustomGems,
          [category]: newCategoryCustomGems
        }
      });
    }

    const currentGems = creativeState.gems || [];
    if (!currentGems.includes(val)) {
      updateGems([...currentGems, val]);
    }

    setCustomInputs(prev => ({ ...prev, [category]: '' }));
  };

  const handleRemoveCustomGem = (category, gemToRemove) => {
    const currentCustomGems = creativeState.customGems || {};
    const categoryCustomGems = currentCustomGems[category] || [];
    const updatedCategoryCustomGems = categoryCustomGems.filter(g => g !== gemToRemove);

    updateCreativeState({
      customGems: {
        ...currentCustomGems,
        [category]: updatedCategoryCustomGems
      }
    });

    const currentGems = creativeState.gems || [];
    if (currentGems.includes(gemToRemove)) {
      updateGems(currentGems.filter(g => g !== gemToRemove));
    }
  };

  // Weaver Actions
  const handleGenerateConcepts = async () => {
    if (!brainstormPrompt.trim()) return alert("Please enter a core story prompt or seed idea.");
    setIsGenerating(true);

    const prompt = `Synthesize 3 distinct high-level story concept cards based on this seed:
Seed Idea: "${brainstormPrompt}"
Guidance Gems: ${getActiveGemsText() || 'None'}

Format output strictly as JSON array of objects:
[
  { "title": "Concept Title 1", "hook": "Compelling logline", "premise": "Core plot overview", "themes": "Central themes" },
  { "title": "Concept Title 2", "hook": "Compelling logline", "premise": "Core plot overview", "themes": "Central themes" },
  { "title": "Concept Title 3", "hook": "Compelling logline", "premise": "Core plot overview", "themes": "Central themes" }
]`;

    try {
      const result = await generateContent({ prompt });
      const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const cards = JSON.parse(cleanJson);
      updateStoryCards(cards);
      setStage(2);
    } catch (err) {
      alert(`Concept generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDevelopOutline = async (card) => {
    setIsGenerating(true);
    const prompt = `Develop a structured chapter-by-chapter plot outline based on this concept:
Title: ${card.title}
Premise: ${card.premise}
Themes: ${card.themes}
Guidance Gems: ${getActiveGemsText() || 'None'}

Formatting: Provide a markdown list of 5 key narrative acts/chapters with dramatic stakes.`;

    try {
      const outlineText = await generateContent({ prompt });
      updateOutline(outlineText);
      setStage(2);
    } catch (err) {
      alert(`Outline generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestBeat = async () => {
    setIsSuggestingBeat(true);
    const prompt = `Read the current story outline below and suggest the NEXT compelling plot point / dramatic conflict beat:
Current Outline:
${creativeState.storyOutline}

Guidance Gems: ${getActiveGemsText() || 'None'}

Format: Return a bullet point to append to the outline.`;

    try {
      const beat = await generateContent({ prompt });
      const updated = (creativeState.storyOutline || '') + `\n- ${beat.trim()}`;
      updateOutline(updated);
    } catch (err) {
      alert(`Suggest beat failed: ${err.message}`);
    } finally {
      setIsSuggestingBeat(false);
    }
  };

  const handleDevelopSceneBeats = async () => {
    setIsGenerating(true);
    setStage(3);
    const prompt = `Develop detailed scene-by-scene beats for the following story outline:
Outline:
${creativeState.storyOutline}

Guidance Gems: ${getActiveGemsText() || 'None'}

Formatting: Provide a markdown list of detailed scene beats, focusing on character actions, emotional shifts, and sensory details.`;

    try {
      const beatsText = await generateContent({ prompt });
      updateSceneBeats(beatsText);
    } catch (err) {
      alert(`Scene beats generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDraft = async () => {
    setStage(4);
    setIsGenerating(true);
    updateDraft('# Story Draft\n\n');

    const prompt = `Write a prose narrative draft based on the following scene beats and universe lore:
Scene Beats:
${creativeState.sceneBeats}

Outline Context:
${creativeState.storyOutline}

Guidance Gems: ${getActiveGemsText() || 'None'}

Style Instructions: Immersive, vivid sensory details, sharp character dialogue, and dramatic pacing. Use Markdown format.`;

    try {
      let draftText = '# Story Draft\n\n';
      await streamContent({
        prompt: prompt,
        onChunk: (chunk) => {
          draftText += chunk;
          updateDraft(draftText);
        }
      });
    } catch (err) {
      alert(`Draft generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNextScene = async () => {
    setIsGenerating(true);
    const prompt = `Write the NEXT scene in prose for the following draft, guided by the scene beats.
Current Draft:
${creativeState.storyDraft}

Scene Beats Context:
${creativeState.sceneBeats}

Guidance Gems: ${getActiveGemsText() || 'None'}

Style Instructions: Immersive, vivid sensory details, sharp character dialogue, and dramatic pacing. Use Markdown format. Respond ONLY with the new scene's text to append to the draft.`;

    try {
      let draftText = creativeState.storyDraft + '\n\n';
      await streamContent({
        prompt: prompt,
        onChunk: (chunk) => {
          draftText += chunk;
          updateDraft(draftText);
        }
      });
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueWriting = async () => {
    setIsGenerating(true);
    const prompt = `Continue writing the prose for the following draft from where it left off.
Current Draft:
${creativeState.storyDraft}

Guidance Gems: ${getActiveGemsText() || 'None'}

Style Instructions: Match the tone, immersive, vivid sensory details, sharp character dialogue. Use Markdown format. Respond ONLY with the continuation text to append.`;

    try {
      let draftText = creativeState.storyDraft + ' ';
      await streamContent({
        prompt: prompt,
        onChunk: (chunk) => {
          draftText += chunk;
          updateDraft(draftText);
        }
      });
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInlineEdit = async (actionType) => {
    if (!selectedText) return;
    setIsGenerating(true);

    let instruction = "";
    if (actionType === 'rewrite') instruction = "Rewrite the following text to improve prose, flow, and align with the Guidance Gems.";
    else if (actionType === 'expand') instruction = "Expand the following text with more sensory details, character interiority, and descriptive depth.";
    else if (actionType === 'summarize') instruction = "Summarize the following text concisely.";
    else if (actionType === 'custom') instruction = customAiPrompt;

    const prompt = `${instruction}
Selected Text:
"${selectedText}"

Guidance Gems: ${getActiveGemsText() || 'None'}
Context Outline: ${creativeState.storyOutline ? creativeState.storyOutline.substring(0, 500) : ''}...

Format Instructions: Respond ONLY with the revised or generated text. Do not include introductory phrases like "Here is the rewrite". Use Markdown if applicable.`;

    try {
      const result = await generateContent({ prompt });
      const cleanResult = result.trim();

      let activeQuill = null;
      if (stage === 2 && outlineQuillRef.current) activeQuill = outlineQuillRef.current.getEditor();
      else if (stage === 3 && beatsQuillRef.current) activeQuill = beatsQuillRef.current.getEditor();
      else if (stage === 4 && quillRef.current) activeQuill = quillRef.current.getEditor();

      if (activeQuill && selectionRange) {
        activeQuill.deleteText(selectionRange.index, selectionRange.length);
        activeQuill.insertText(selectionRange.index, cleanResult);
        
        if (stage === 2) updateOutline(activeQuill.root.innerHTML);
        else if (stage === 3) updateSceneBeats(activeQuill.root.innerHTML);
        else if (stage === 4) updateDraft(activeQuill.root.innerHTML);
      } else {
        if (stage === 1) {
          if (brainstormPrompt.includes(selectedText)) {
            setBrainstormPrompt(prev => prev.replace(selectedText, cleanResult));
          }
        } else if (stage === 2) {
          updateOutline((creativeState.storyOutline || '').replace(selectedText, cleanResult));
        } else if (stage === 3) {
          updateSceneBeats((creativeState.sceneBeats || '').replace(selectedText, cleanResult));
        } else if (stage === 4) {
          updateDraft((creativeState.storyDraft || '').replace(selectedText, cleanResult));
        }
      }
      
      setSelectionRange(null);
      setSelectedText('');
      setCustomAiPrompt('');
    } catch (err) {
      alert(`AI Assist failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0d1117] text-slate-300" onBlur={triggerStorySave}>
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 border-b border-[#0D5C63]/50 bg-[#161b22]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-cyan-400">AIME</h2>
            {(() => {
              const creatorInfo = extractCreatorInfo(universeState, userHandle, currentUser);
              return (
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono font-bold flex items-center gap-1 shadow-sm" title="Original Creator">
                    <span>🏷️</span>
                    <span>{creatorInfo.creatorTag}</span>
                  </span>
                  {creatorInfo.contributorTags && creatorInfo.contributorTags.length > 0 && (
                    <span className="px-2 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded text-[11px] font-mono font-bold" title={`Contributors: ${creatorInfo.contributorTags.join(', ')}`}>
                      Contrib: {creatorInfo.contributorTags.join(', ')}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
          <p className="text-sm text-slate-500">The Artificial Intellect Mythopoic Environ for Narrative Flow, Worldbuilding &amp; Brainstorming</p>
        </div>
        <button 
          onClick={() => setIsChatOpen(prev => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm border transition-colors ${
            isChatOpen 
              ? 'bg-cyan-900/60 text-cyan-300 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-cyan-400'
          }`}
        >
          <span>💬</span> Chat with AIME
        </button>
      </div>

      {/* In-Process Notification Banner */}
      {(isGenerating || isSuggestingBeat) && (
        <div className="bg-cyan-950/90 border-b border-cyan-500/50 px-4 py-2.5 flex items-center justify-between text-cyan-300 text-xs font-semibold animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="font-bold text-cyan-200 text-sm">Thinking...</span>
            <span className="text-cyan-400/90 text-xs">
              {isSuggestingBeat ? 'AIME is suggesting the next narrative beat...' : 'AIME is generating creative content...'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 bg-cyan-900/60 px-2.5 py-1 rounded border border-cyan-500/40">
            AIME In-Process
          </span>
        </div>
      )}

      <Split className="flex-1 flex overflow-hidden split-horizontal" sizes={[25, 75]} minSize={250} gutterSize={6}>
        {/* Left Sidebar: Guidance Gems */}
        <div className="p-4 overflow-y-auto bg-[#161b22]/50 border-r border-[#0D5C63]/30">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-1">Guidance Gems</h3>
          <p className="text-xs text-slate-400 mb-4">Select or add custom modifiers to shape AIME's creative output.</p>
          
          <div className="space-y-4 mb-6">
            {Object.entries(GUIDANCE_GEMS).map(([category, presetGems]) => {
              const categoryCustomGems = customGems[category] || [];
              const allCategoryGems = [...presetGems, ...categoryCustomGems];
              const categoryInputVal = customInputs[category] || '';

              return (
                <div key={category} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-bold text-amber-400/90 tracking-wide">{category}</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allCategoryGems.map(gem => {
                      const isSelected = (creativeState.gems || []).includes(gem);
                      const isCustom = categoryCustomGems.includes(gem);

                      return (
                        <div key={gem} className="inline-flex items-center">
                          <button 
                            onClick={() => handleToggleGem(gem)}
                            className={`text-xs px-2 py-1 rounded border transition-all flex items-center gap-1 font-medium ${
                              isSelected
                                ? 'bg-amber-900/60 text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-semibold'
                                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700/60'
                            }`}
                          >
                            {isSelected && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
                            <span>{gem}</span>
                          </button>
                          {isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCustomGem(category, gem);
                              }}
                              className="text-slate-500 hover:text-red-400 ml-1 text-xs px-1"
                              title={`Remove custom ${category} gem "${gem}"`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom User Gem for this category */}
                  <div className="flex gap-1.5 mt-1">
                    <input 
                      type="text" 
                      value={categoryInputVal}
                      onChange={(e) => setCustomInputs(prev => ({ ...prev, [category]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomGem(category)}
                      placeholder={`+ Custom ${category}...`}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500/60 text-xs px-2 py-1 rounded text-slate-200 placeholder-slate-600 outline-none"
                    />
                    <button 
                      onClick={() => handleAddCustomGem(category)}
                      className="bg-amber-800/50 hover:bg-amber-700 text-amber-200 px-2 rounded text-xs font-bold border border-amber-600/40 transition-colors"
                      title={`Add custom ${category}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mt-8 mb-2">Linked Context Elements</h3>
          <p className="text-xs text-slate-400 mb-2">Select project elements to feed into AIME's context window.</p>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto bg-slate-900 p-2 rounded border border-slate-700">
            {flatElements.map(el => (
              <label key={el.id} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
                <input 
                  type="checkbox" 
                  checked={(creativeState.linkedElements || []).includes(el.id)}
                  onChange={(e) => {
                    const current = creativeState.linkedElements || [];
                    if (e.target.checked) {
                      updateLinkedElements([...current, el.id]);
                    } else {
                      updateLinkedElements(current.filter(id => id !== el.id));
                    }
                  }}
                  className="accent-amber-500"
                />
                <span className="truncate flex-1" title={el.title}>
                  <span className="text-[9px] text-amber-500/80 uppercase mr-1.5 font-bold">[{el.type}]</span>
                  {el.title}
                </span>
              </label>
            ))}
            {flatElements.length === 0 && (
              <span className="text-xs text-slate-500 italic">No elements in your project yet.</span>
            )}
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col h-full">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex gap-2">
                  <button onClick={() => setStage(1)} className={`px-3 py-1 text-sm font-bold rounded ${stage === 1 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'}`}>1. Brainstorm</button>
                  <button onClick={() => setStage(2)} className={`px-3 py-1 text-sm font-bold rounded ${stage === 2 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'}`}>2. Outline</button>
                  <button onClick={() => setStage(3)} className={`px-3 py-1 text-sm font-bold rounded ${stage === 3 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'}`}>3. Scene Beats</button>
                  <button onClick={() => setStage(4)} className={`px-3 py-1 text-sm font-bold rounded ${stage === 4 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'}`}>4. Prose Draft</button>
                </div>
                <CanvasToolbar 
                  canvasName={stage === 1 ? 'Brainstorm' : stage === 2 ? 'Outline' : stage === 3 ? 'Scene Beats' : 'Prose Draft'}
                  canvasKey={stage === 1 ? 'brainstorm' : stage === 2 ? 'outline' : stage === 3 ? 'beats' : 'draft'}
                  onSaveLocal={handleSaveLocal}
                  onLoadLocal={handleLoadLocal}
                  onExport={handleExportCanvas}
                  onImport={triggerImport}
                  onClear={handleClearCanvas}
                />
              </div>

              {/* Floating AI Pair Authoring Context Menu */}
              {contextMenuPos && selectedText && (
                <div 
                  className="fixed z-50 bg-slate-800 p-3 rounded-lg border border-amber-900 shadow-2xl flex flex-col gap-2 min-w-[280px]"
                  style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1 border-b border-slate-700 pb-1">AI Pair Authoring</span>
                  <div className="flex gap-2">
                    <button onClick={() => { handleInlineEdit('rewrite'); setContextMenuPos(null); }} disabled={isGenerating} className="bg-slate-700 hover:bg-slate-600 px-2 py-1.5 rounded text-xs font-bold flex-1">Rewrite</button>
                    <button onClick={() => { handleInlineEdit('expand'); setContextMenuPos(null); }} disabled={isGenerating} className="bg-slate-700 hover:bg-slate-600 px-2 py-1.5 rounded text-xs font-bold flex-1">Expand</button>
                    <button onClick={() => { handleInlineEdit('summarize'); setContextMenuPos(null); }} disabled={isGenerating} className="bg-slate-700 hover:bg-slate-600 px-2 py-1.5 rounded text-xs font-bold flex-1">Summarize</button>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <input 
                      type="text" 
                      value={customAiPrompt}
                      onChange={(e) => setCustomAiPrompt(e.target.value)}
                      placeholder="Custom instruction..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                    />
                    <button onClick={() => { handleInlineEdit('custom'); setContextMenuPos(null); }} disabled={isGenerating || !customAiPrompt} className="bg-amber-700 hover:bg-amber-600 px-3 py-1.5 rounded text-xs font-bold disabled:opacity-50">Apply</button>
                  </div>
                </div>
              )}

              {stage === 1 && (
                <div className="flex flex-col gap-4 max-w-4xl" onContextMenu={handleContextMenu}>
                  <div className="bg-[#161b22] p-4 rounded-lg border border-slate-700">
                    <label className="block text-sm font-bold text-slate-400 mb-2">Seed Prompt / Story Idea</label>
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm min-h-[100px] mb-4"
                      placeholder="A rogue AI awakens on a derelict starship..."
                      value={brainstormPrompt}
                      onChange={(e) => setBrainstormPrompt(e.target.value)}
                    />
                    <button onClick={handleGenerateConcepts} disabled={isGenerating} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-bold disabled:opacity-50 flex items-center gap-2">
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-cyan-200 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Thinking...</span>
                        </>
                      ) : (
                        'Generate Concept Cards'
                      )}
                    </button>
                  </div>

                  {creativeState.storyCards.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {creativeState.storyCards.map((card, idx) => (
                        <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-cyan-900/50 flex flex-col">
                          <h4 className="text-lg font-bold text-cyan-400 mb-2">{card.title}</h4>
                          <p className="text-sm font-semibold text-amber-300 italic mb-2">"{card.hook}"</p>
                          <p className="text-sm text-slate-300 mb-4 flex-1">{card.premise}</p>
                          <div className="text-xs text-slate-400 mb-4"><strong>Themes:</strong> {card.themes}</div>
                          <button onClick={() => handleDevelopOutline(card)} disabled={isGenerating} className="bg-slate-700 hover:bg-slate-600 text-white w-full py-2 rounded font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                            {isGenerating ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                <span>Thinking...</span>
                              </>
                            ) : (
                              'Develop Outline'
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {stage === 2 && (
                <div className="flex flex-col h-full gap-4 max-w-4xl" onContextMenu={handleContextMenu}>
                  <div className="bg-[#161b22] p-4 rounded-lg border border-slate-700 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-300">Story Outline</h3>
                      <div className="flex gap-2">
                        <button onClick={handleSuggestBeat} disabled={isSuggestingBeat} className="bg-amber-700 hover:bg-amber-600 px-3 py-1 rounded text-xs font-bold disabled:opacity-50 flex items-center gap-1.5">
                          {isSuggestingBeat ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Thinking...</span>
                            </>
                          ) : (
                            'Suggest Next Beat'
                          )}
                        </button>
                        <button onClick={handleDevelopSceneBeats} disabled={isGenerating} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
                          {isGenerating ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-cyan-200 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Thinking...</span>
                            </>
                          ) : (
                            'Generate Scene Beats ➔'
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
                      <ReactQuill 
                        ref={outlineQuillRef}
                        theme="snow"
                        value={creativeState.storyOutline}
                        onChange={updateOutline}
                        onChangeSelection={handleQuillChangeSelection}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded overflow-hidden quill-editor prose-editor flex flex-col"
                      />
                    </div>
                  </div>
                </div>
              )}

              {stage === 3 && (
                <div className="flex flex-col h-full gap-4 max-w-4xl" onContextMenu={handleContextMenu}>
                  <div className="bg-[#161b22] p-4 rounded-lg border border-slate-700 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-300">Scene Beats</h3>
                      <div className="flex gap-2">
                        <button onClick={handleGenerateDraft} disabled={isGenerating} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
                          {isGenerating ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-cyan-200 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Thinking...</span>
                            </>
                          ) : (
                            'Generate Draft ➔'
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
                      <ReactQuill 
                        ref={beatsQuillRef}
                        theme="snow"
                        value={creativeState.sceneBeats}
                        onChange={updateSceneBeats}
                        onChangeSelection={handleQuillChangeSelection}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded overflow-hidden quill-editor prose-editor flex flex-col"
                      />
                    </div>
                  </div>
                </div>
              )}

              {stage === 4 && (
                <div className="flex flex-col h-full max-w-5xl">
                  <div className="flex justify-end gap-2 mb-2">
                    <button onClick={handleGenerateNextScene} disabled={isGenerating} className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-xs font-bold disabled:opacity-50 flex items-center gap-1.5">
                      {isGenerating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Thinking...</span>
                        </>
                      ) : (
                        'Generate Next Scene'
                      )}
                    </button>
                    <button onClick={handleContinueWriting} disabled={isGenerating} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-xs font-bold disabled:opacity-50 flex items-center gap-1.5">
                      {isGenerating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-cyan-200 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Thinking...</span>
                        </>
                      ) : (
                        'Continue Writing'
                      )}
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col" onContextMenu={handleContextMenu}>
                    <ReactQuill 
                      ref={quillRef}
                      theme="snow"
                      value={creativeState.storyDraft}
                      onChange={updateDraft}
                      onChangeSelection={handleQuillChangeSelection}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded overflow-hidden quill-editor prose-editor flex flex-col"
                    />
                  </div>
                </div>
              )}
            </div>
        </div>
      </Split>

      {/* Hidden File Input for Canvas Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        accept=".json,.md,.txt" 
        className="hidden" 
      />

      {/* Canvas Action Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-cyan-900/90 border border-cyan-400/80 text-cyan-200 px-4 py-2 rounded-lg shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md animate-bounce">
          <span className="text-amber-400">✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dynamic Chat Box */}
      {isChatOpen && (
        <AIMEChatBox 
          onClose={() => setIsChatOpen(false)}
          contextData={`Guidance Gems: ${getActiveGemsText() || 'None'}\n\nOutline Context:\n${creativeState.storyOutline || 'None'}\n\nScene Beats:\n${creativeState.sceneBeats || 'None'}\n\nCurrent Draft:\n${creativeState.storyDraft || 'None'}`}
        />
      )}
    </div>
  );
}

const CanvasToolbar = ({ canvasName, canvasKey, onSaveLocal, onLoadLocal, onExport, onImport, onClear }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1.5 bg-[#0d1117]/80 p-1.5 px-3 rounded-lg border border-slate-700/80 text-xs font-semibold shadow-sm shrink-0">
      <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] mr-2 hidden sm:inline">{canvasName}:</span>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 hover:text-cyan-100 px-3 py-1 rounded border border-cyan-700/50 hover:border-cyan-400 flex items-center gap-1 transition-all text-sm font-bold shadow-sm"
        >
          File ▾
        </button>
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-slate-800 border border-slate-600 rounded-md shadow-xl z-50 flex flex-col p-1.5 gap-1">
            <button
              onClick={() => { onSaveLocal(canvasKey); setIsOpen(false); }}
              className="text-left bg-transparent hover:bg-slate-700 text-slate-200 hover:text-cyan-300 px-2 py-1.5 rounded transition-all text-xs"
              title="Save snapshot to local browser storage"
            >
              💾 Save Local
            </button>
            <button
              onClick={() => { onLoadLocal(canvasKey); setIsOpen(false); }}
              className="text-left bg-transparent hover:bg-slate-700 text-slate-200 hover:text-cyan-300 px-2 py-1.5 rounded transition-all text-xs"
              title="Load snapshot from local browser storage"
            >
              📂 Load Local
            </button>
            <button
              onClick={() => { onImport(canvasKey); setIsOpen(false); }}
              className="text-left bg-transparent hover:bg-slate-700 text-slate-200 hover:text-amber-300 px-2 py-1.5 rounded transition-all text-xs"
              title="Import content from file on disk (.json, .md, .txt)"
            >
              📥 Import
            </button>
            <button
              onClick={() => { onExport(canvasKey); setIsOpen(false); }}
              className="text-left bg-transparent hover:bg-slate-700 text-slate-200 hover:text-amber-300 px-2 py-1.5 rounded transition-all text-xs"
              title="Export canvas content to file (.json or .md)"
            >
              📤 Export
            </button>
            <div className="h-px bg-slate-600 my-1"></div>
            <button
              onClick={() => { onClear(canvasKey); setIsOpen(false); }}
              className="text-left bg-transparent hover:bg-slate-700 text-slate-200 hover:text-red-400 px-2 py-1.5 rounded transition-all text-xs"
              title="Clear canvas content"
            >
              🗑️ Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

