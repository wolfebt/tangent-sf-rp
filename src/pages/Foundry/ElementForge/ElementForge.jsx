import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaign } from '../../../context/CampaignContext';
import { ELEMENT_TYPES, getTypePillStyle, SCENARIO_GUIDE_MODULES, getElementFileExtension } from './elementSchemas';
import EditElementModal from './EditElementModal';
import { ArtistHubModal } from '../../../components/StoryFoundry/ArtistHubModal';
import AimeGuidanceButton from '../../../components/StoryFoundry/AimeGuidanceButton';
import { AimeGuidanceFlyout } from '../../../components/StoryFoundry/AimeGuidanceFlyout';
import { generateContent } from '../../../services/aimeService';
import { Sparkles, Palette, BookOpen, Plus, Search, Wand2, X, Trash2, Upload, Download, Database, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { showToast } from '../../../context/ToastContext';
import DOMPurify from 'dompurify';
import { downloadElementMarkdownFile, batchIngestElementFiles } from '../../../services/elementIngestionService.js';
import { downloadAimeAssetFile, downloadAimeAssetBundle, batchIngestAimeFiles } from '../../../services/aimeAssetFileService.js';
import { useDBM } from '../../../context/DBMContext';
import { pullElementFromOmnicortexDBM } from '../../../utils/storyAssetAdapter.js';

export const ElementForge = ({ onBackToStory }) => {
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
  const [isAimeFlyoutOpen, setIsAimeFlyoutOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const processImportFiles = async (files) => {
    const results = await batchIngestAimeFiles(files);
    let count = 0;
    for (const res of results) {
      if (res.success && res.element) {
        await updateSavedElement(res.element.id, res.element);
        await saveElementToCloud(res.element);
        count++;
      }
    }
    if (count > 0) {
      showToast({ type: 'success', text: `Ingested ${count} AIME portable asset(s)!` });
    } else {
      showToast({ type: 'warning', text: 'No valid element files could be ingested.' });
    }
  };

  // Omnicortex DBM Ingestion State
  const { dbData = {} } = useDBM() || {};
  const [isDbmImportOpen, setIsDbmImportOpen] = useState(false);
  const [selectedDbmIds, setSelectedDbmIds] = useState(new Set());
  const [dbmSearchTerm, setDbmSearchTerm] = useState('');

  // Discover matching DBM canonical records for the active element type
  const matchingDbmItems = useMemo(() => {
    if (!dbData) return [];
    let items = [];
    if (activeType === 'Faction') {
      items = (dbData.factions || []).map(f => ({ ...f, dbmCategory: 'factions', title: f.name || f.factionName }));
    } else if (activeType === 'Species') {
      items = (dbData.species || []).map(s => ({ ...s, dbmCategory: 'species', title: s.name || s.speciesName }));
    } else if (activeType === 'Item') {
      items = [
        ...(dbData.weaponry || []).map(w => ({ ...w, dbmCategory: 'weaponry', title: w.name })),
        ...(dbData.armoring || []).map(a => ({ ...a, dbmCategory: 'armoring', title: a.name })),
        ...(dbData.gear || []).map(g => ({ ...g, dbmCategory: 'gear', title: g.name })),
        ...(dbData.augmentations || []).map(au => ({ ...au, dbmCategory: 'augmentations', title: au.name }))
      ];
    } else if (activeType === 'Persona') {
      items = (dbData.archetypes || []).map(ar => ({ ...ar, dbmCategory: 'archetypes', title: ar.name }));
    } else if (activeType === 'Philosophy') {
      items = [
        ...(dbData.invocations || []).map(i => ({ ...i, dbmCategory: 'invocations', title: i.name })),
        ...(dbData.features || []).map(f => ({ ...f, dbmCategory: 'features', title: f.name }))
      ];
    }
    return items;
  }, [dbData, activeType]);

  const handleImportSelectedDbm = async () => {
    if (selectedDbmIds.size === 0) return;
    const itemsToImport = matchingDbmItems.filter(item => selectedDbmIds.has(item.id));
    let count = 0;
    for (const item of itemsToImport) {
      const newElem = {
        id: `elem_dbm_${item.id || Date.now()}`,
        title: item.title || item.name || 'Omnicortex Element',
        type: activeType,
        content: item.description || item.concept || item.notes || item.summary || '',
        dbmSyncStatus: 'synced',
        fields: {
          dbmRef: item.id,
          dbmCategory: item.dbmCategory,
          ...item
        }
      };
      await updateSavedElement(newElem.id, newElem);
      await saveElementToCloud(newElem);
      count++;
    }
    showToast({ type: 'success', text: `Successfully synced ${count} ${activeType} element(s) from Omnicortex DBM!` });
    setSelectedDbmIds(new Set());
    setIsDbmImportOpen(false);
  };

  const handleRefreshAllDbmLinks = async () => {
    const linked = (elementsCatalog || []).filter(el => el.fields?.dbmRef || el.dbmRef);
    if (linked.length === 0) {
      showToast({ type: 'info', text: 'No DBM-linked elements found in this catalog.' });
      return;
    }
    let updatedCount = 0;
    for (const el of linked) {
      const updated = pullElementFromOmnicortexDBM(el, dbData);
      if (updated) {
        await updateSavedElement(updated.id, updated);
        await saveElementToCloud(updated);
        updatedCount++;
      }
    }
    showToast({ type: 'success', text: `Refreshed ${updatedCount} element(s) with canonical Omnicortex DBM records!` });
  };

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
      showToast({ type: 'warning', text: 'Please enter a title for the Scenario Guide module.' });
      return;
    }

    setIsGeneratingGuide(true);
    const rawTemplate = selectedGuideModule.promptTemplate.replace('{title}', guideTitle.trim());
    const prompt = `${rawTemplate}
Additional Context / Specific Directives: "${guideContext.trim() || 'High sci-fi / cyberpunk science fantasy RPG tone.'}"

Output Format: Provide structured markdown with rich sections, atmospheric read-aloud boxes, GM secrets, stat notes, and tactical hooks.`;

    try {
      const context = {
        projectName: 'ElementForge Compendium',
        activeNode: {
          type: selectedGuideModule.elementType || activeType,
          title: guideTitle.trim(),
          fields: {
            category: selectedGuideModule.category,
            guideModule: selectedGuideModule.name
          }
        },
        guidanceGems: guideContext.trim() || 'High sci-fi / cyberpunk science fantasy RPG tone',
        customCatalog: elementsCatalog || []
      };
      const generatedMarkdown = await generateContent({ prompt, context });
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
      showToast({ type: 'error', text: `Scenario synthesis failed: ${err.message}` });
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  return (
    <div 
      className="flex h-full w-full overflow-hidden bg-[#0a0a0e] text-slate-100 font-sans relative select-none"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); }}
      onDrop={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          await processImportFiles(Array.from(e.dataTransfer.files));
        }
      }}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-black/85 border-2 border-dashed border-amber-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in pointer-events-none">
          <Sparkles size={48} className="text-amber-400 animate-pulse mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
            Drop Portable AIME Assets Here
          </h3>
          <p className="text-xs text-amber-200/80 max-w-md">
            Instantly ingest .persona, .setting, .world, .species, .tech, .philosophy, .scene, or .aime bundles into your project.
          </p>
        </div>
      )}

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
            {onBackToStory && (
              <button
                type="button"
                onClick={onBackToStory}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Return to Story Scenarios Canvas"
              >
                <span>←</span>
                <span>Story Canvas</span>
              </button>
            )}
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

            {/* AIME Guidance Trigger */}
            <AimeGuidanceButton
              onClick={() => setIsAimeFlyoutOpen(true)}
              label={`AIME ${activeType} Guidance`}
              variant="compact"
            />

            {/* Standard Create Button */}
            <button
              onClick={handleCreateNew}
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] transform hover:-translate-y-0.5 whitespace-nowrap border border-amber-500/50 flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Create {activeType}</span>
            </button>

            {/* Ingest AIME / ELEMENTS.md Button */}
            <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
              <Upload size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Import Assets</span>
              <input
                type="file"
                multiple
                accept=".persona,.setting,.world,.species,.tech,.philosophy,.scene,.aime,.json,.md,.markdown"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    await processImportFiles(Array.from(e.target.files));
                  }
                }}
              />
            </label>

            {/* Export All as .aime Bundle */}
            {filteredElements.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  downloadAimeAssetBundle(filteredElements, `${activeType.toLowerCase()}_compendium`);
                  showToast({ type: 'success', text: `Exported ${filteredElements.length} ${activeType} elements to .aime bundle!` });
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={`Export all ${filteredElements.length} ${activeType} elements as a portable .aime bundle`}
              >
                <Sparkles size={13} className="text-amber-400" />
                <span className="hidden sm:inline">Export .aime ({filteredElements.length})</span>
              </button>
            )}

            {/* Import from Omnicortex DBM */}
            {matchingDbmItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsDbmImportOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={`Import existing canonical ${activeType} entries from Omnicortex DBM`}
              >
                <Database size={14} className="text-cyan-400" />
                <span className="hidden sm:inline">DBM Sync ({matchingDbmItems.length})</span>
              </button>
            )}

            {/* Refresh All DBM Linked Records */}
            {(elementsCatalog || []).some(el => el.fields?.dbmRef || el.dbmRef) && (
              <button
                type="button"
                onClick={handleRefreshAllDbmLinks}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-teal-500/50 text-teal-300 hover:text-teal-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Refresh all DBM-linked elements with latest canon updates"
              >
                <RefreshCw size={13} className="text-teal-400" />
                <span className="hidden sm:inline">Refresh Canon</span>
              </button>
            )}
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
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/50 hover:bg-slate-800/60 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleEdit(el)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-base font-extrabold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1 tracking-wide">
                        {el.title || el.name || 'Untitled'}
                      </h3>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                        (el.fields?.dbmRef || el.dbmRef || el.dbmSyncStatus === 'synced')
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm' 
                          : el.dbmSyncStatus === 'local_override'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {(el.fields?.dbmRef || el.dbmRef || el.dbmSyncStatus === 'synced') ? '⚡ DBM' : el.dbmSyncStatus === 'local_override' ? '▲ Override' : '○ Standalone'}
                      </span>
                    </div>
                    
                    {el.fields?.summary && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {el.fields.summary}
                      </p>
                    )}
                    
                    {el.content && !el.fields?.summary && (
                      <div 
                        className="text-xs text-slate-400 line-clamp-2 mb-3 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(el.content.substring(0, 100)) }}
                      />
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-700/50 mt-3 shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">
                      {el.authorUid === 'local' ? 'Local Draft' : 'Cloud Synced'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* Pull Canon Updates from Omnicortex DBM */}
                      {(el.fields?.dbmRef || el.dbmRef || el.dbmSyncStatus === 'synced') && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const updated = pullElementFromOmnicortexDBM(el, dbData);
                            if (updated) {
                              await updateSavedElement(updated.id, updated);
                              await saveElementToCloud(updated);
                              showToast({ type: 'success', text: `Pulled canonical updates from DBM for ${updated.title}!` });
                            } else {
                              showToast({ type: 'warning', text: `No matching record found in Omnicortex DBM for ${el.title}.` });
                            }
                          }}
                          className="p-1.5 rounded text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/70 border border-cyan-500/30 transition-colors cursor-pointer"
                          title="Pull canonical updates from Omnicortex DBM"
                        >
                          <RefreshCw size={13} />
                        </button>
                      )}

                      {/* AIME Portable Asset Export Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAimeAssetFile(el);
                          showToast({ type: 'success', text: `Exported ${el.title || el.name} as portable ${getElementFileExtension(el.type)} asset!` });
                        }}
                        className="p-1.5 rounded text-amber-400 hover:text-amber-200 hover:bg-amber-950/60 border border-amber-500/30 transition-colors"
                        title={`Export AIME Asset (${getElementFileExtension(el.type)})`}
                      >
                        <Sparkles size={13} />
                      </button>

                      {/* Markdown Export Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadElementMarkdownFile({ ...el, name: el.title || el.name });
                          showToast({ type: 'info', text: `Exported ${el.title || el.name} to ELEMENTS.md markdown.` });
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                        title="Export as ELEMENTS.md Markdown"
                      >
                        <Download size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const targetName = el.title || 'Untitled Element';
                          if (await confirmTypedDeletion(targetName, (el.type || 'story element').toLowerCase())) {
                            deleteSavedElement(el.id);
                          }
                        }}
                        className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Delete Element"
                      >
                        <Trash2 size={13} />
                      </button>
                      <span className="text-[10px] text-cyan-400 group-hover:text-amber-300 transition-colors ml-1 font-bold">
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
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans">
          <div className="w-full max-w-2xl bg-[#0d1117] border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
            
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

      {/* AIME Guidance Flyout */}
      {isAimeFlyoutOpen && (
        <AimeGuidanceFlyout
          isOpen={isAimeFlyoutOpen}
          onClose={() => setIsAimeFlyoutOpen(false)}
          targetType={activeType === 'Persona' ? 'Persona' : 'Story'}
          contextData={{
            category: activeType,
            catalogCount: filteredElements.length,
            sampleTitles: filteredElements.slice(0, 5).map(e => e.title)
          }}
        />
      )}

      {/* Omnicortex DBM Import Modal */}
      {isDbmImportOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans">
          <div className="w-full max-w-2xl bg-[#0d1117] border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Sync {activeType}s from Omnicortex DBM
                  </h3>
                  <p className="text-xs text-slate-400">
                    Import existing canonical compendium data directly into your adventure element catalog.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDbmImportOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search & Selection Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Search ${matchingDbmItems.length} available DBM entries...`}
                  value={dbmSearchTerm}
                  onChange={(e) => setDbmSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <Search size={14} className="absolute left-3 top-2 text-slate-500" />
              </div>

              <button
                type="button"
                onClick={() => {
                  const visibleIds = matchingDbmItems
                    .filter(i => !dbmSearchTerm || (i.title || i.name || '').toLowerCase().includes(dbmSearchTerm.toLowerCase()))
                    .map(i => i.id);
                  if (selectedDbmIds.size === visibleIds.length) {
                    setSelectedDbmIds(new Set());
                  } else {
                    setSelectedDbmIds(new Set(visibleIds));
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors shrink-0"
              >
                {selectedDbmIds.size > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin max-h-[50vh]">
              {matchingDbmItems
                .filter(i => !dbmSearchTerm || (i.title || i.name || '').toLowerCase().includes(dbmSearchTerm.toLowerCase()))
                .map(item => {
                  const isSelected = selectedDbmIds.has(item.id);
                  const alreadyImported = (elementsCatalog || []).some(el => el.fields?.dbmRef === item.id || el.id === `elem_dbm_${item.id}`);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedDbmIds(prev => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      }}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-cyan-100'
                          : alreadyImported
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 opacity-75'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 text-cyan-400">
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold truncate text-sm">{item.title || item.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-400 uppercase font-mono">
                              {item.dbmCategory || activeType}
                            </span>
                            {alreadyImported && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">
                                In Catalog
                              </span>
                            )}
                          </div>
                          {(item.description || item.concept || item.notes || item.summary) && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 pt-0.5">
                              {item.description || item.concept || item.notes || item.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                {selectedDbmIds.size} of {matchingDbmItems.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDbmImportOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedDbmIds.size === 0}
                  onClick={handleImportSelectedDbm}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  <Database size={13} />
                  <span>Import {selectedDbmIds.size} Elements</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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
