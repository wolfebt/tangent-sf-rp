import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaign } from '../../../context/CampaignContext';
import { ELEMENT_TYPES, getTypePillStyle, SCENARIO_GUIDE_MODULES } from './elementSchemas';
import EditElementModal from './EditElementModal';
import { ArtistHubModal } from '../../../components/StoryFoundry/ArtistHubModal';
import { generateContent } from '../../../services/aimeService';
import { Sparkles, Palette, BookOpen, Plus, Search, Wand2, X, Trash2 } from 'lucide-react';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

export const ElementForge = () => {
  const navigate = useNavigate();
  const { elementsCatalog, updateSavedElement, deleteSavedElement, saveElementToCloud } = useCampaign();
  
  const [activeType, setActiveType] = useState(ELEMENT_TYPES[0]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArtistHubOpen, setIsArtistHubOpen] = useState(false);
  const [isScenarioGuideModalOpen, setIsScenarioGuideModalOpen] = useState(false);
  const [selectedGuideModule, setSelectedGuideModule] = useState(SCENARIO_GUIDE_MODULES[0]);
  const [guideTitle, setGuideTitle] = useState('');
  const [guideContext, setGuideContext] = useState('');
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter elements by active type and search term
  const filteredElements = (elementsCatalog || []).filter(el => {
    if (el.type !== activeType) return false;
    if (searchTerm && !el.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleCreateNew = () => {
    setSelectedElement({
      id: `elem_${Date.now()}`,
      title: '',
      type: activeType,
      content: '',
      fields: {}
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (el) => {
    setSelectedElement(el);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedElement) => {
    await updateSavedElement(updatedElement.id, updatedElement);
    await saveElementToCloud(updatedElement);
    setIsEditModalOpen(false);
    setSelectedElement(null);
  };

  const handleGenerateScenarioGuide = async () => {
    if (!guideTitle.trim()) {
      alert("Please enter a title for the Scenario Guide module.");
      return;
    }

    setIsGeneratingGuide(true);
    const rawTemplate = selectedGuideModule.promptTemplate.replace('{title}', guideTitle.trim());
    const prompt = `${rawTemplate}
Additional Context / Specific Directives: "${guideContext.trim() || 'High sci-fi / cyberpunk science fantasy RPG tone.'}"

Output Format: Provide structured markdown with rich sections, atmospheric read-aloud boxes, GM secrets, stat notes, and tactical hooks.`;

    try {
      const generatedMarkdown = await generateContent({ prompt });
      const newElem = {
        id: `elem_sg_${Date.now()}`,
        title: guideTitle.trim(),
        type: selectedGuideModule.elementType || activeType,
        content: generatedMarkdown,
        fields: {
          summary: `Generated from Scenario Guide: ${selectedGuideModule.name}`,
          tags: `ScenarioGuide, ${selectedGuideModule.category}, ${selectedGuideModule.name}`
        }
      };

      await updateSavedElement(newElem.id, newElem);
      await saveElementToCloud(newElem);
      
      setIsScenarioGuideModalOpen(false);
      setGuideTitle('');
      setGuideContext('');
      
      // Open in editor for user review
      setSelectedElement(newElem);
      setActiveType(newElem.type);
      setIsEditModalOpen(true);
    } catch (err) {
      alert(`Scenario synthesis failed: ${err.message}`);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0a0a0e] text-slate-100 font-sans relative select-none">
      {/* Forge Glow Background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Left Sidebar for Element Types */}
      <aside className="w-64 h-full bg-[#0d1117]/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col shrink-0 p-4 gap-2 overflow-y-auto relative z-10">
        <div className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest px-2 mb-2 border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Element Types</span>
          <span className="text-slate-500 font-mono text-[9px]">{ELEMENT_TYPES.length} Categories</span>
        </div>
        
        {ELEMENT_TYPES.map(type => {
          const isActive = activeType === type;
          const count = elementsCatalog?.filter(e => e.type === type).length || 0;
          return (
            <button
              key={type}
              onClick={() => { setActiveType(type); setSearchTerm(''); }}
              className={`w-full text-left px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-between group border ${
                isActive
                  ? `${getTypePillStyle(type)} shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30`
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/80 hover:border-slate-700/60'
              }`}
            >
              <span className="truncate">{type}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                isActive
                  ? 'bg-black/40 text-amber-200 border border-amber-500/30'
                  : 'bg-slate-800/80 text-slate-500 group-hover:text-cyan-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-8 relative z-10">
        {/* Header Bar */}
        <div className="flex flex-wrap justify-between items-center mb-6 shrink-0 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg gap-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${getTypePillStyle(activeType)}`}>
              {activeType}
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 tracking-wider uppercase">
                {activeType} Elements
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${activeType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs focus:outline-none focus:border-amber-500/60 text-slate-200 placeholder-slate-500 w-56 sm:w-64 transition-colors shadow-inner"
              />
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            </div>

            {/* Scenario Guide Generator Trigger */}
            <button
              onClick={() => setIsScenarioGuideModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 hover:to-slate-800 border border-cyan-500/50 text-cyan-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              title="Generate with Scenario Guide Archetypes"
            >
              <BookOpen size={14} />
              <span>Scenario Guides</span>
            </button>

            {/* Artist Hub Visual Concept Trigger */}
            <button
              onClick={() => setIsArtistHubOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-950 to-slate-900 hover:from-purple-900 hover:to-slate-800 border border-purple-500/50 text-purple-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              title="Open Artist Hub Visual Concept Generator"
            >
              <Palette size={14} />
              <span>Artist Hub</span>
            </button>

            {/* Standard Create Button */}
            <button
              onClick={handleCreateNew}
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] transform hover:-translate-y-0.5 whitespace-nowrap border border-amber-500/50 flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Create {activeType}</span>
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          {filteredElements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="text-4xl mb-4 opacity-50">📂</div>
              <p className="text-sm">No {activeType} elements found.</p>
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleCreateNew}
                  className="text-cyan-400 hover:text-cyan-300 underline text-xs font-bold"
                >
                  Create manual entry
                </button>
                <span className="text-slate-600">•</span>
                <button 
                  onClick={() => setIsScenarioGuideModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 underline text-xs font-bold"
                >
                  Synthesize with Scenario Guides
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max pb-8">
              {filteredElements.map(el => (
                <div 
                  key={el.id} 
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/50 hover:bg-slate-800/60 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleEdit(el)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-extrabold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1 tracking-wide">
                      {el.title || 'Untitled'}
                    </h3>
                  </div>
                  
                  {el.fields?.summary && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 flex-1">
                      {el.fields.summary}
                    </p>
                  )}
                  
                  {el.content && !el.fields?.summary && (
                    <div 
                      className="text-xs text-slate-400 line-clamp-2 mb-3 flex-1 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: el.content.substring(0, 100) }} 
                    />
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mt-auto shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">
                      {el.authorUid === 'local' ? 'Local Draft' : 'Cloud Synced'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetName = el.title || 'Untitled Element';
                          if (confirmTypedDeletion(targetName, (el.type || 'story element').toLowerCase())) {
                            deleteSavedElement(el.id);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Delete Element"
                      >
                        <Trash2 size={13} />
                      </button>
                      <span className="text-[10px] text-cyan-400 group-hover:text-amber-300 transition-colors">
                        Edit ✏️
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Scenario Guide Synthesis Modal */}
      {isScenarioGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0d1117] border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-sm font-mono uppercase tracking-wider text-cyan-300">
                    Scenario Guide Generator
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Ported from AIME — Synthesize complete multi-act modules, tactical encounters, and relics.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsScenarioGuideModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Module Archetype Grid */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                1. Select Module Archetype
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {SCENARIO_GUIDE_MODULES.map((mod) => {
                  const isSelected = selectedGuideModule.id === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setSelectedGuideModule(mod)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base shrink-0">{mod.icon}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold font-mono truncate">{mod.name}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{mod.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Premise Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  2. Title / Subject <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={guideTitle}
                  onChange={(e) => setGuideTitle(e.target.value)}
                  placeholder={`E.g., Derelict Dreadnought V-77, Infiltrator Fixer, Plasma Relic...`}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  3. Additional Directives or Context (Optional)
                </label>
                <textarea
                  rows={2}
                  value={guideContext}
                  onChange={(e) => setGuideContext(e.target.value)}
                  placeholder="E.g. Set in the Neon Undercity, high-danger TL-4 traps, involve the Syndicate faction..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsScenarioGuideModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateScenarioGuide}
                disabled={isGeneratingGuide || !guideTitle.trim()}
                className="flex-2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingGuide ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AIME is Synthesizing {selectedGuideModule.name}...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>Synthesize {selectedGuideModule.name}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Artist Hub Modal */}
      {isArtistHubOpen && (
        <ArtistHubModal
          isOpen={isArtistHubOpen}
          onClose={() => setIsArtistHubOpen(false)}
          initialPrompt={searchTerm ? `${searchTerm}` : ''}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditElementModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          element={selectedElement}
          onSave={handleSave}
          onDelete={deleteSavedElement}
        />
      )}
    </div>
  );
};

export default ElementForge;
