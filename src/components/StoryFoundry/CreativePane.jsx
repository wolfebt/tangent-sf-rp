import React, { useState, useRef, useEffect } from 'react';
import { useStory } from '../../context/CampaignContext';
import { generateContent, streamContent } from '../../services/aimeService';
import Split from 'react-split';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { ELEMENT_SCHEMAS } from './elementSchemas';

export const GUIDANCE_GEMS = {
  "Genre": ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Horror", "Mystery", "Romance", "Thriller"],
  "Tone": ["Serious", "Humorous", "Formal", "Informal", "Optimistic", "Pessimistic", "Joyful", "Sad", "Hopeful", "Cynical"],
  "Pacing": ["Fast-paced", "Slow-burn", "Steady", "Urgent", "Relaxed", "Meditative", "Action-Packed"],
  "POV": ["First Person", "Third Person Limited", "Third Person Omniscient", "Second Person", "Alternating POV"],
  "Theme": ["Redemption", "Betrayal", "Discovery", "Survival", "Love", "Hate", "Power", "Corruption", "Nature vs. Nurture"]
};

export default function CreativePane() {
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
    updateLinkedElements 
  } = useStory();

  const creativeState = universeState.creativeState || { gems: [], storyCards: [], storyOutline: '', sceneBeats: '', storyDraft: '', linkedElements: [], customGems: {} };
  const customGems = creativeState.customGems || {};

  const getAllElements = (nodes) => {
    let all = [];
    if (!nodes) return all;
    nodes.forEach(n => {
      all.push(n);
      if (n.children) all = all.concat(getAllElements(n.children));
    });
    return all;
  };
  const flatElements = universeState?.scenarios ? getAllElements(universeState.scenarios) : [];

  const [activeTab, setActiveTab] = useState('weaver'); // 'weaver' or 'forge'

  // Gems state for custom inputs per category
  const [customInputs, setCustomInputs] = useState({});

  // Story Weaver State
  const [stage, setStage] = useState(1);
  const [brainstormPrompt, setBrainstormPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingBeat, setIsSuggestingBeat] = useState(false);

  // AI Pair Authoring State
  const quillRef = useRef(null);
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
    e.preventDefault();
    if (selectedText) {
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

  // Element Forge State
  const [selectedForgeType, setSelectedForgeType] = useState('Persona');
  const [forgeTitle, setForgeTitle] = useState('');
  const [activeFormTab, setActiveFormTab] = useState(0);
  const [forgeFields, setForgeFields] = useState({});
  const [forgeGeneratedOutput, setForgeGeneratedOutput] = useState('');
  const [forgeViewMode, setForgeViewMode] = useState('form');

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
    if (!selectionRange || !selectedText) return;
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
Context Outline: ${creativeState.storyOutline.substring(0, 500)}...

Format Instructions: Respond ONLY with the revised or generated text. Do not include introductory phrases like "Here is the rewrite". Use Markdown if applicable.`;

    try {
      const result = await generateContent({ prompt });
      const quill = quillRef.current.getEditor();
      
      quill.deleteText(selectionRange.index, selectionRange.length);
      quill.insertText(selectionRange.index, result.trim());
      
      updateDraft(quill.root.innerHTML);
      
      setSelectionRange(null);
      setSelectedText('');
      setCustomAiPrompt('');
    } catch (err) {
      alert(`AI Assist failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Forge Actions
  const handleForgeGenerate = async () => {
    if (!forgeTitle.trim()) return alert("Please enter a name for this element first.");
    setIsGenerating(true);
    setForgeGeneratedOutput('');

    const formattedFields = Object.entries(forgeFields)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');

    const prompt = `Synthesize a comprehensive lore document for a ${selectedForgeType} titled "${forgeTitle}".
Defined Input Fields:
${formattedFields || 'General guidelines provided.'}

Guidance Gems Applied: ${getActiveGemsText() || 'None'}

Formatting: Use markdown headings, bullet points, sensory details, and psychological/world depth. Avoid generic clichés.`;

    try {
      let outputText = '';
      await streamContent({
        prompt: prompt,
        onChunk: (chunk) => {
          outputText += chunk;
          setForgeGeneratedOutput(outputText);
        }
      });
      setForgeViewMode('preview');
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleForgeSave = () => {
    if (!forgeTitle.trim()) return;
    const elemObj = {
      id: `elem_forge_${Date.now()}`,
      title: forgeTitle,
      type: 'Scenario',
      content: forgeGeneratedOutput,
      forgeType: selectedForgeType,
      forgeFields: forgeFields,
      children: []
    };
    addStory(elemObj);
    alert(`Saved "${forgeTitle}" to your Story Module!`);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0d1117] text-slate-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 border-b border-[#0D5C63]/50 bg-[#161b22]">
        <div>
          <h2 className="text-xl font-bold text-cyan-400">AIME Studio</h2>
          <p className="text-sm text-slate-500">Narrative Flow, Worldbuilding & Brainstorming</p>
        </div>
        <div className="flex gap-2 bg-[#0d1117] p-1 rounded-lg border border-[#0D5C63]/50">
          <button 
            className={`px-4 py-1 text-sm font-bold rounded ${activeTab === 'weaver' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('weaver')}
          >
            Story Weaver
          </button>
          <button 
            className={`px-4 py-1 text-sm font-bold rounded ${activeTab === 'forge' ? 'bg-amber-900 text-amber-200' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('forge')}
          >
            Element Forge
          </button>
        </div>
      </div>

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
          {activeTab === 'weaver' && (
            <div className="flex flex-col h-full">
              <div className="flex gap-2 mb-4">
                <button onClick={() => setStage(1)} className={`px-3 py-1 text-sm font-bold rounded ${stage === 1 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'}`}>1. Brainstorm</button>
                <button onClick={() => setStage(2)} className={`px-3 py-1 text-sm font-bold rounded ${stage === 2 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'}`}>2. Outline</button>
                <button onClick={() => setStage(3)} className={`px-3 py-1 text-sm font-bold rounded ${stage === 3 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'}`}>3. Scene Beats</button>
                <button onClick={() => setStage(4)} className={`px-3 py-1 text-sm font-bold rounded ${stage === 4 ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'}`}>4. Prose Draft</button>
              </div>

              {stage === 1 && (
                <div className="flex flex-col gap-4 max-w-4xl">
                  <div className="bg-[#161b22] p-4 rounded-lg border border-slate-700">
                    <label className="block text-sm font-bold text-slate-400 mb-2">Seed Prompt / Story Idea</label>
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm min-h-[100px] mb-4"
                      placeholder="A rogue AI awakens on a derelict starship..."
                      value={brainstormPrompt}
                      onChange={(e) => setBrainstormPrompt(e.target.value)}
                    />
                    <button onClick={handleGenerateConcepts} disabled={isGenerating} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-bold disabled:opacity-50">
                      {isGenerating ? 'Generating...' : 'Generate Concept Cards'}
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
                          <button onClick={() => handleDevelopOutline(card)} className="bg-slate-700 hover:bg-slate-600 text-white w-full py-2 rounded font-bold">Develop Outline</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {stage === 2 && (
                <div className="flex flex-col h-full gap-4 max-w-4xl">
                  <div className="bg-[#161b22] p-4 rounded-lg border border-slate-700 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-300">Story Outline</h3>
                      <div className="flex gap-2">
                        <button onClick={handleSuggestBeat} disabled={isSuggestingBeat} className="bg-amber-700 hover:bg-amber-600 px-3 py-1 rounded text-xs font-bold disabled:opacity-50">
                          {isSuggestingBeat ? 'Suggesting...' : 'Suggest Next Beat'}
                        </button>
                        <button onClick={handleDevelopSceneBeats} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-xs font-bold">
                          Generate Scene Beats ➔
                        </button>
                      </div>
                    </div>
                    <textarea 
                      className="w-full flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                      value={creativeState.storyOutline}
                      onChange={(e) => updateOutline(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {stage === 3 && (
                <div className="flex flex-col h-full gap-4 max-w-4xl">
                  <div className="bg-[#161b22] p-4 rounded-lg border border-slate-700 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-300">Scene Beats</h3>
                      <div className="flex gap-2">
                        <button onClick={handleGenerateDraft} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-xs font-bold">
                          Generate Draft ➔
                        </button>
                      </div>
                    </div>
                    <textarea 
                      className="w-full flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                      value={creativeState.sceneBeats}
                      onChange={(e) => updateSceneBeats(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {stage === 4 && (
                <div className="flex flex-col h-full max-w-5xl">
                  <div className="flex justify-end gap-2 mb-2">
                    <button onClick={handleGenerateNextScene} disabled={isGenerating} className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-xs font-bold disabled:opacity-50">
                      Generate Next Scene
                    </button>
                    <button onClick={handleContinueWriting} disabled={isGenerating} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-xs font-bold disabled:opacity-50">
                      Continue Writing
                    </button>
                  </div>
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
          )}

          {activeTab === 'forge' && (
            <div className="flex flex-col h-full max-w-5xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(ELEMENT_SCHEMAS).map(([key, schema]) => (
                    <button 
                      key={key}
                      onClick={() => { setSelectedForgeType(key); setActiveFormTab(0); }}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded ${selectedForgeType === key ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setForgeViewMode(forgeViewMode === 'form' ? 'preview' : 'form')} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm font-bold">
                    {forgeViewMode === 'form' ? 'Preview Output' : 'Edit Inputs'}
                  </button>
                  <button onClick={handleForgeSave} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-sm font-bold">Save Element</button>
                </div>
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded font-bold text-lg"
                  placeholder={`${selectedForgeType} Name...`}
                  value={forgeTitle}
                  onChange={(e) => setForgeTitle(e.target.value)}
                />
              </div>

              {forgeViewMode === 'form' ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-wrap border-b border-slate-700 mb-4 gap-1">
                    {Array.from(new Set((ELEMENT_SCHEMAS[selectedForgeType] || []).map(f => f.tab || 'General'))).map((tab, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveFormTab(idx)}
                        className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap flex-1 sm:flex-none text-center ${activeFormTab === idx ? 'border-b-2 border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'text-slate-400 hover:text-white'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4">
                    {(ELEMENT_SCHEMAS[selectedForgeType] || [])
                      .filter(f => (f.tab || 'General') === Array.from(new Set((ELEMENT_SCHEMAS[selectedForgeType] || []).map(t => t.tab || 'General')))[activeFormTab])
                      .map(field => (
                      <div key={field.key} className="flex flex-col">
                        <label className="text-xs font-bold text-slate-400 mb-1">{field.label}</label>
                        <textarea 
                          className="bg-slate-900 border border-slate-700 rounded p-2 text-sm min-h-[80px]"
                          value={forgeFields[field.key] || ''}
                          onChange={(e) => setForgeFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder || ''}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                    <button onClick={handleForgeGenerate} disabled={isGenerating} className="bg-amber-600 hover:bg-amber-500 px-6 py-2 rounded font-bold disabled:opacity-50 text-white">
                      {isGenerating ? 'Synthesizing...' : 'Synthesize Lore Document'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-slate-900 border border-slate-700 rounded p-4 overflow-y-auto prose prose-invert max-w-none">
                  {forgeGeneratedOutput ? (
                    <ReactQuill 
                      theme="snow"
                      value={forgeGeneratedOutput}
                      onChange={setForgeGeneratedOutput}
                      className="quill-editor prose-editor border-none"
                    />
                  ) : (
                    <div className="text-slate-500 italic text-center py-10">No lore generated yet. Fill out the form and click Synthesize.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Split>
    </div>
  );
}
