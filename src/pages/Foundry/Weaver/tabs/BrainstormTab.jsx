/**
 * @file BrainstormTab.jsx
 * @description Dual-Scope Ideation & Guidance Gems Suite for Story Weaver.
 * Covers:
 *   1. Focus Archetype & Guidance Gems (Genre, Tone, Mood, Theme, Conflict, Setting Style, Pacing, POV, Devices, Structure, Custom Gems)
 *   2. Story Scenario Ideation: Plot twists, scene hooks, conflicts, sensory descriptions, scene beats.
 *   3. World Elements Ideation: Persona concepts, faction motives, locations, anomalies, lore.
 * Supports direct insertion into Story manuscript or instant creation in the Element Forge catalog.
 */

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Layers, 
  Plus, 
  Copy, 
  Check, 
  RefreshCw, 
  Wand2, 
  Bookmark,
  Search,
  X,
  Trash2
} from 'lucide-react';
import { useStory } from '../../../../context/CampaignContext';
import { useConfirm } from '../../../../context/ConfirmContext';
import { AudioService } from '../../../../services/audioService';
import { generateContent } from '../../../../services/aimeService';
import { getMergedGems } from '../../StoryModule/guidanceGemsConfig';
import { v4 as uuidv4 } from 'uuid';

export default function BrainstormTab({ activeNode, updateStory, onInsertProse }) {
  const { 
    universeState, 
    elementsCatalog, 
    updateSavedElement, 
    updateGems,
    updateCreativeState,
    getActiveGemsText,
    triggerStorySave
  } = useStory();
  const confirm = useConfirm();

  const [scope, setScope] = useState('story'); // 'story' | 'elements'
  const [topicPrompt, setTopicPrompt] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('plot_twist');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [addedElementId, setAddedElementId] = useState(null);

  // Story Focus Archetype options
  const storyPresets = useMemo(() => [
    { id: 'plot_twist', label: 'Plot Twist / Revelation', icon: '⚡' },
    { id: 'scene_hook', label: 'Compelling Scene Hook', icon: '🪝' },
    { id: 'conflict', label: 'Moral Dilemma & Stakes', icon: '⚔️' },
    { id: 'sensory', label: 'Sensory Prose Atmosphere', icon: '🌌' },
    { id: 'beats', label: 'Sequence of Scene Beats', icon: '🎬' }
  ], []);

  // Element Focus Archetype options
  const elementPresets = useMemo(() => [
    { id: 'persona', label: 'NPC / Persona Archetype', icon: '👤' },
    { id: 'faction', label: 'Faction / Syndicate Motive', icon: '🏛️' },
    { id: 'location', label: 'Hazardous Sector / Location', icon: '📍' },
    { id: 'anomaly', label: 'Relic / Tech Artifact', icon: '🔮' },
    { id: 'lore', label: 'Historical Lore / Secret', icon: '📜' }
  ], []);

  const activePresets = scope === 'story' ? storyPresets : elementPresets;

  // Guidance Gems State (Integrated into Part 1 with Archetype as first Gem category)
  const creativeState = universeState?.creativeState || { gems: [], customGems: {} };
  const activeGems = creativeState?.gems || [];
  const customGems = creativeState?.customGems || {};

  const [gemSearchQuery, setGemSearchQuery] = useState('');
  const [selectedGemCategory, setSelectedGemCategory] = useState('Archetype');
  const [customGemInput, setCustomGemInput] = useState('');

  const mergedGems = useMemo(() => {
    const baseMerged = getMergedGems(customGems);
    const presetLabels = activePresets.map(p => p.label);
    const customArchetypes = (Array.isArray(customGems['Archetype']) ? customGems['Archetype'] : []).filter(
      g => !presetLabels.includes(g)
    );
    return {
      Archetype: [...presetLabels, ...customArchetypes],
      ...baseMerged
    };
  }, [customGems, activePresets]);

  const allGemCategories = useMemo(() => {
    return Object.keys(mergedGems).filter(cat => cat !== 'POV'); // Avoid duplicate with 'Point of View'
  }, [mergedGems]);

  const currentCategoryGems = useMemo(() => {
    if (gemSearchQuery.trim()) {
      const q = gemSearchQuery.toLowerCase().trim();
      const matches = [];
      for (const [cat, list] of Object.entries(mergedGems)) {
        if (cat === 'POV') continue;
        for (const g of list) {
          if (g.toLowerCase().includes(q) && !matches.some(m => m.gem === g)) {
            matches.push({ gem: g, category: cat });
          }
        }
      }
      return matches;
    }
    const list = mergedGems[selectedGemCategory] || [];
    return list.map(g => ({ gem: g, category: selectedGemCategory }));
  }, [mergedGems, selectedGemCategory, gemSearchQuery]);

  const handleToggleGem = (gem, category) => {
    AudioService.playTerminalBeep(920, 0.03);
    // If clicking an Archetype option, also sync selectedFocus for generation context
    const matchedPreset = [...storyPresets, ...elementPresets].find(p => p.label === gem);
    if (matchedPreset || category === 'Archetype') {
      setSelectedFocus(matchedPreset ? matchedPreset.id : gem);
    }
    if (!updateGems) return;
    if (activeGems.includes(gem)) {
      updateGems(activeGems.filter(g => g !== gem));
    } else {
      updateGems([...activeGems, gem]);
    }
  };

  const handleAddCustomGem = (e) => {
    if (e) e.preventDefault();
    const val = customGemInput.trim();
    if (!val) return;

    const currentCategoryCustom = customGems[selectedGemCategory] || [];
    if (!currentCategoryCustom.includes(val)) {
      const updatedCustom = {
        ...customGems,
        [selectedGemCategory]: [...currentCategoryCustom, val]
      };
      if (updateCreativeState) {
        updateCreativeState({ customGems: updatedCustom });
      }
    }

    if (selectedGemCategory === 'Archetype') {
      setSelectedFocus(val);
    }

    if (updateGems && !activeGems.includes(val)) {
      updateGems([...activeGems, val]);
    }

    AudioService.playTerminalBeep(1250, 0.05);
    setCustomGemInput('');
  };

  const handleRemoveCustomGem = (category, gemToRemove) => {
    AudioService.playTerminalBeep(600, 0.05);
    const currentCategoryCustom = customGems[category] || [];
    const updatedCustom = {
      ...customGems,
      [category]: currentCategoryCustom.filter(g => g !== gemToRemove)
    };
    if (updateCreativeState) {
      updateCreativeState({ customGems: updatedCustom });
    }
    if (updateGems && activeGems.includes(gemToRemove)) {
      updateGems(activeGems.filter(g => g !== gemToRemove));
    }
  };

  const handleClearAllGems = async () => {
    if (confirm) {
      const ok = await confirm({
        title: 'Deselect Guidance Gems',
        message: 'Are you sure you want to deselect all active guidance gems?',
        danger: true,
        confirmLabel: 'Deselect All'
      });
      if (!ok) return;
    }
    AudioService.playTerminalBeep(500, 0.08);
    if (updateGems) updateGems([]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    AudioService.playTerminalBeep(980, 0.03);

    const gemsContext = typeof getActiveGemsText === 'function' ? getActiveGemsText() : '';
    const storyContext = activeNode ? `Active Story Scenario: "${activeNode.title || 'Untitled'}"\nSummary/Content: ${activeNode.content?.slice(0, 500) || 'None'}` : 'No active scenario.';
    const catalogSummary = (elementsCatalog || []).slice(0, 10).map(e => `${e.title} (${e.type})`).join(', ');

    const promptMessage = scope === 'story'
      ? `Generate 3 distinct, compelling, and creative storytelling ideas for the focus: ${selectedFocus.toUpperCase()}.
Topic / Custom Note: "${topicPrompt || 'High tension, sci-fi tactical depth'}"
${storyContext}
Guidance Gems / World Directives: ${gemsContext || 'Dark sci-fi, tactile cyber-intrigue'}
Format each idea with:
TITLE: [Concise title]
SUMMARY: [2-3 sentences explaining the hook or twist]
PROSE: [A short narrative excerpt or beat ready for the story]`
      : `Generate 3 distinct world element concepts for the focus: ${selectedFocus.toUpperCase()}.
Topic / Custom Note: "${topicPrompt || 'Unique faction or operative concept'}"
Universe Context: ${(universeState?.projectName || 'Tangent Universe')}
Existing Elements: ${catalogSummary || 'None'}
Guidance Gems: ${gemsContext || 'Cybernetic gritty realism'}
Format each idea with:
TITLE: [Name of element]
TYPE: [Persona, Faction, Location, Object, or Lore]
SUMMARY: [2-3 sentences explaining its place in the world]
DETAILS: [Key mechanical perk, complication, or secret]`;

    try {
      const response = await generateContent({
        prompt: promptMessage,
        systemInstruction: 'You are AIME, the advanced narrative architect assistant. Return structured brainstorming ideas as requested.'
      });

      const text = typeof response === 'string' ? response : (response?.text || '');
      
      // Parse structured ideas or split by double newline
      const sections = text.split(/(?=TITLE:|\n\n(?=[1-3]\.))/i).filter(s => s.trim().length > 20);
      
      if (sections.length > 0) {
        const parsed = sections.map((sec, idx) => {
          const lines = sec.trim().split('\n');
          const titleLine = lines.find(l => l.toUpperCase().startsWith('TITLE:')) || lines[0] || `Idea #${idx + 1}`;
          const cleanTitle = titleLine.replace(/^TITLE:\s*/i, '').replace(/^[1-3]\.\s*/, '').trim();
          return {
            id: uuidv4(),
            title: cleanTitle || `Concept ${idx + 1}`,
            body: sec.trim(),
            scope
          };
        });
        setGeneratedIdeas(parsed);
      } else {
        setGeneratedIdeas([
          {
            id: uuidv4(),
            title: `${selectedFocus.replace('_', ' ').toUpperCase()} Concept`,
            body: text || 'A compelling narrative surge unfolds as hidden loyalties fracture under pressure.',
            scope
          }
        ]);
      }
      AudioService.playCriticalChime(false);
    } catch (err) {
      console.warn('AI Brainstorm failed or offline, falling back to local heuristic synthesis:', err);
      setGeneratedIdeas([
        {
          id: uuidv4(),
          title: `Synthetic ${selectedFocus.replace('_', ' ').toUpperCase()} Hook`,
          body: `TITLE: Classified Signal Infiltration\nSUMMARY: An encrypted telemetry burst from a forgotten orbital relay contradicts the primary scenario directive, forcing operatives to decide between mission protocol and survival.\nPROSE: "The console flickered amber—not an error, but an overwrite code signed by someone who died ten cycles ago."`,
          scope
        },
        {
          id: uuidv4(),
          title: `Secondary Complication`,
          body: `TITLE: Environmental Quake Protocol\nSUMMARY: Subterranean conduit stabilizers fail during the breach, flooding the corridor with superheated coolant and limiting sensor visibility to 3 hexes.`,
          scope
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    AudioService.playTerminalBeep(1100, 0.02);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleInsertIntoStory = (idea) => {
    if (!activeNode) return;
    const addition = `\n\n### ${idea.title}\n${idea.body}\n`;
    const newContent = (activeNode.content || '') + addition;
    updateStory(activeNode.id, { content: newContent });
    if (triggerStorySave) triggerStorySave();
    AudioService.playCriticalChime(true);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSaveAsElement = (idea) => {
    const newElement = {
      id: uuidv4(),
      title: idea.title,
      type: scope === 'elements' ? (selectedFocus.charAt(0).toUpperCase() + selectedFocus.slice(1)) : 'Lore',
      content: idea.body,
      fields: {
        description: idea.body.slice(0, 300),
        oneLinePitch: `Brainstormed ${selectedFocus} concept for ${activeNode?.title || 'Story'}`,
        tags: ['brainstormed', scope]
      },
      createdAt: Date.now()
    };
    if (updateSavedElement) {
      updateSavedElement(newElement.id, newElement);
    }
    setAddedElementId(idea.id);
    AudioService.playCriticalChime(true);
    setTimeout(() => setAddedElementId(null), 2500);
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] flex flex-col overflow-hidden font-mono text-slate-100">
      {/* Top Banner / Scope Switcher */}
      <div className="p-3 px-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <Lightbulb size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>AIME Brainstorm Forge</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                Dual Scope
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Co-authoring intelligence for scenarios and world elements
            </p>
          </div>
        </div>

        {/* Scope Toggle: Story Scenario vs World Elements */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setScope('story');
              setSelectedFocus('plot_twist');
              AudioService.playTerminalBeep(900, 0.02);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              scope === 'story'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={12} />
            <span>Current Story</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScope('elements');
              setSelectedFocus('persona');
              AudioService.playTerminalBeep(900, 0.02);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              scope === 'elements'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={12} />
            <span>World Elements</span>
          </button>
        </div>
      </div>

      {/* Main Form & Ideas Display */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* 1. Guidance Gems & Archetype Directives (Integrated Part 1) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0f1c] border border-slate-800/90 space-y-2.5 shadow-inner">
          {/* Part 1 Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>1. Select Guidance Gems ({scope === 'story' ? 'Scenario' : 'Element'})</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
                <Sparkles size={10} className="text-amber-400" />
                <span>{activeGems.length} Gems Active</span>
              </span>
              {activeGems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllGems}
                  className="text-[10px] text-slate-400 hover:text-red-300 underline cursor-pointer transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Active Gems Strip */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[24px]">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
              <Sparkles size={11} />
              <span>Guidance Gems:</span>
            </span>
            {activeGems.length === 0 ? (
              <span className="text-[10px] text-slate-500 italic">
                No gems selected — select an archetype, narrative style, tone, mood, or world directives below.
              </span>
            ) : (
              activeGems.map((gem) => (
                <button
                  key={gem}
                  type="button"
                  onClick={() => handleToggleGem(gem)}
                  className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-red-950/80 hover:border-red-500/60 hover:text-red-200 transition-colors"
                  title="Click to remove directive"
                >
                  <span>{gem}</span>
                  <X size={9} />
                </button>
              ))
            )}
          </div>

          {/* Category Tabs (Archetype + Canonical & Extended Gems) + Search + Custom Gem Input */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
            {/* Category Selector Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {allGemCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1000, 0.02);
                    setSelectedGemCategory(cat);
                    setGemSearchQuery('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    selectedGemCategory === cat && !gemSearchQuery.trim()
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Custom Gem Controls */}
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap ml-auto">
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={gemSearchQuery}
                  onChange={(e) => setGemSearchQuery(e.target.value)}
                  placeholder="Filter gems..."
                  className="w-36 sm:w-40 pl-7 pr-6 py-1 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-lg text-[11px] text-slate-200 placeholder-slate-500 outline-none transition-colors"
                />
                {gemSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setGemSearchQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>

              <form onSubmit={handleAddCustomGem} className="flex items-center gap-1">
                <input
                  type="text"
                  value={customGemInput}
                  onChange={(e) => setCustomGemInput(e.target.value)}
                  placeholder={`+ Custom ${selectedGemCategory}...`}
                  className="w-36 sm:w-44 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!customGemInput.trim()}
                  className="px-2 py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 rounded-lg text-[10px] font-bold uppercase transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus size={11} />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>

          {/* Listed Options for Active Gem Category / Filter */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {currentCategoryGems.map(({ gem, category }) => {
              const matchedPreset = activePresets.find(p => p.label === gem);
              const isActive = activeGems.includes(gem) || (category === 'Archetype' && matchedPreset && selectedFocus === matchedPreset.id && !activeGems.some(g => activePresets.some(p => p.label === g)));
              const isCustom = (customGems[category] || []).includes(gem);

              return (
                <div
                  key={`${category}-${gem}`}
                  onClick={() => handleToggleGem(gem, category)}
                  className={`group px-2.5 py-1 rounded-xl text-xs font-mono cursor-pointer transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {matchedPreset && <span className="text-xs shrink-0">{matchedPreset.icon}</span>}
                  <span>{gem}</span>
                  {gemSearchQuery.trim() && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-950/80 text-slate-400 uppercase">
                      {category}
                    </span>
                  )}
                  {isActive && <Check size={11} className="text-amber-400 shrink-0" />}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCustomGem(category, gem);
                      }}
                      className="p-0.5 text-slate-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete custom gem"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Prompt & Context Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>2. Seed / Specific Query or Direction (Optional)</span>
            {activeNode && (
              <span className="text-[10px] text-cyan-400 truncate max-w-xs font-normal">
                Anchored to: {activeNode.title}
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              placeholder={scope === 'story' ? 'e.g., A betrayal during extraction, high cybernetic distortion...' : 'e.g., Rogue cyber-medic with ties to an underground syndicate...'}
              className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shrink-0 ${
                isGenerating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : (scope === 'story' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white')
              }`}
            >
              {isGenerating ? <RefreshCw size={13} className="animate-spin" /> : <Wand2 size={13} />}
              <span>{isGenerating ? 'Synthesizing...' : 'Brainstorm'}</span>
            </button>
          </div>
        </div>

        {/* Results Stream */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              <span>Generated Ideas ({generatedIdeas.length})</span>
            </span>
            {generatedIdeas.length > 0 && (
              <button
                type="button"
                onClick={() => setGeneratedIdeas([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear Results
              </button>
            )}
          </div>

          {generatedIdeas.length === 0 && !isGenerating && (
            <div className="p-8 text-center border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/20 space-y-2">
              <Lightbulb size={28} className="mx-auto text-slate-700" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                No active brainstorming seeds generated yet.
              </p>
              <p className="text-[11px] text-slate-600 max-w-md mx-auto">
                Choose a focus archetype above, optionally add a seed direction, and click Brainstorm to pair-author ideas with AIME.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generatedIdeas.map((idea) => (
              <div 
                key={idea.id} 
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      {idea.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-slate-800 text-slate-400">
                      {idea.scope}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {idea.body}
                  </p>
                </div>

                {/* Actions: Insert into Story, Save as Element, Copy */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleInsertIntoStory(idea)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 cursor-pointer transition-colors"
                    title="Append into active Story scenario"
                  >
                    {copiedId === idea.id ? <Check size={11} className="text-emerald-400" /> : <Plus size={11} />}
                    <span>Insert into Story</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveAsElement(idea)}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 cursor-pointer transition-colors"
                    title="Save as a persistent World Element in Element Forge"
                  >
                    {addedElementId === idea.id ? <Check size={11} className="text-emerald-400" /> : <Bookmark size={11} />}
                    <span>Save as Element</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(idea.id, idea.body)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] cursor-pointer ml-auto"
                    title="Copy to clipboard"
                  >
                    {copiedId === idea.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
