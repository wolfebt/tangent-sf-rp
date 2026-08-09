import React, { useState, useMemo, useRef } from 'react';
import { useStory } from '../../context/CampaignContext';
import { exportElementJSON, exportElementMarkdown, exportElementPDF } from './exportUtils';
import EditElementModal from './EditElementModal';
import { ELEMENT_TYPES } from './elementSchemas';
import { attachCreatorTag } from '../../utils/creatorUtils';

const FoundryLauncherModal = ({ isOpen, onClose, initialTab = 'stories' }) => {
  const {
    storyCatalog,
    elementsCatalog,
    openStory,
    createNewStory,
    deleteStoryProject,
    deleteSavedElement,
    updateSavedElement,
    addStory,
    universeState,
    handleSaveLocal,
    confirmIfDirty,
    toggleStoryVisibility,
    loadPublicStories,
    publicStoryCatalog,
    clonePublicStory
  } = useStory();

  const [activeTab, setActiveTab] = useState(initialTab); // 'stories' | 'elements'
  const [storySourceTab, setStorySourceTab] = useState('my_stories'); // 'my_stories' | 'public_community'
  
  // Element Editing State
  const [selectedCatalogElementId, setSelectedCatalogElementId] = useState('');
  const [editingElement, setEditingElement] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create Story Modal state
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDesc, setNewStoryDesc] = useState('');

  // Tab 1: Story Catalog Search & Sort State
  const [storySearch, setStorySearch] = useState('');
  const [storySortBy, setStorySortBy] = useState('recent'); // 'recent' | 'name_asc' | 'name_desc' | 'elements' | 'maps'

  // Tab 2: Elements Catalog Search, Filter & Sort State
  const [elementSearch, setElementSearch] = useState('');
  const [elementTypeFilter, setElementTypeFilter] = useState('All');
  const [elementSortBy, setElementSortBy] = useState('recent'); // 'recent' | 'title_asc' | 'title_desc' | 'type' | 'author'

  const fileInputRef = useRef(null);

  const handleStorySourceSwitch = (tab) => {
    setStorySourceTab(tab);
    if (tab === 'public_community' && loadPublicStories) {
      loadPublicStories();
    }
  };

  const handleCopyShareLink = (storyId) => {
    const url = `${window.location.origin}/story-foundry?storyId=${storyId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert(`Public Story Link copied to clipboard:\n\n${url}`);
      }).catch(() => {
        prompt("Copy this public story link:", url);
      });
    } else {
      prompt("Copy this public story link:", url);
    }
  };

  const handleCreateNewElement = (typeStr = 'Scenario') => {
    const rawElem = {
      id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `New ${typeStr}`,
      type: typeStr,
      content: `<p>New ${typeStr} element notes...</p>`,
      fields: {},
      customFields: [],
      updatedAt: new Date().toISOString()
    };
    const newElem = attachCreatorTag(rawElem, localStorage.getItem('userHandle'));
    setEditingElement(newElem);
    setIsEditModalOpen(true);
  };

  const handleSaveEditElement = async (updatedElem) => {
    const tagged = attachCreatorTag(updatedElem, localStorage.getItem('userHandle'));
    await updateSavedElement(tagged.id, tagged);
    setIsEditModalOpen(false);
    setEditingElement(null);
  };

  // Helper to count total elements recursively in a story project
  const countElements = (nodes) => {
    if (!Array.isArray(nodes)) return 0;
    let total = nodes.length;
    nodes.forEach(n => {
      if (n.children) total += countElements(n.children);
    });
    return total;
  };

  // Filtered & Sorted Story Projects
  const processedStories = useMemo(() => {
    const activeList = storySourceTab === 'my_stories' ? storyCatalog : publicStoryCatalog;
    let list = [...activeList];

    // Search filter
    if (storySearch.trim()) {
      const q = storySearch.toLowerCase().trim();
      list = list.filter(story => 
        (story.projectName && story.projectName.toLowerCase().includes(q)) ||
        (story.description && story.description.toLowerCase().includes(q)) ||
        (story.authorEmail && story.authorEmail.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (storySortBy === 'recent') {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      if (storySortBy === 'name_asc') {
        return (a.projectName || '').localeCompare(b.projectName || '');
      }
      if (storySortBy === 'name_desc') {
        return (b.projectName || '').localeCompare(a.projectName || '');
      }
      if (storySortBy === 'elements') {
        return countElements(b.scenarios) - countElements(a.scenarios);
      }
      if (storySortBy === 'maps') {
        return (b.maps?.length || 0) - (a.maps?.length || 0);
      }
      return 0;
    });

    return list;
  }, [storyCatalog, publicStoryCatalog, storySourceTab, storySearch, storySortBy]);

  // Filtered & Sorted Elements
  const processedElements = useMemo(() => {
    let list = [...elementsCatalog];

    // Type filter
    if (elementTypeFilter !== 'All') {
      list = list.filter(elem => (elem.type || 'Custom').toLowerCase() === elementTypeFilter.toLowerCase());
    }

    // Search filter
    if (elementSearch.trim()) {
      const q = elementSearch.toLowerCase().trim();
      list = list.filter(elem => 
        (elem.title && elem.title.toLowerCase().includes(q)) ||
        (elem.type && elem.type.toLowerCase().includes(q)) ||
        (elem.content && elem.content.toLowerCase().includes(q)) ||
        (elem.authorEmail && elem.authorEmail.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (elementSortBy === 'recent') {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      if (elementSortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (elementSortBy === 'title_desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (elementSortBy === 'type') {
        return (a.type || '').localeCompare(b.type || '');
      }
      if (elementSortBy === 'author') {
        return (a.authorEmail || '').localeCompare(b.authorEmail || '');
      }
      return 0;
    });

    return list;
  }, [elementsCatalog, elementTypeFilter, elementSearch, elementSortBy]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) {
      alert("Please enter a valid Story Project name.");
      return;
    }
    createNewStory(newStoryTitle.trim(), newStoryDesc.trim());
    setNewStoryTitle('');
    setNewStoryDesc('');
    setIsCreatingStory(false);
    onClose();
  };

  const handleImportElementToWorkingStory = (elem) => {
    if (!elem) return;
    const importedNode = {
      ...elem,
      id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: elem.title || `Untitled ${elem.type || 'Element'}`,
      children: elem.children || []
    };
    addStory(importedNode);
    alert(`Imported element "${importedNode.title}" into active story workspace!`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.type === "TangentUniverse" || data.type === "TangentStoryProject" || data.scenarios) {
          const newStory = createNewStory(
            data.data?.projectName || data.projectName || file.name.replace('.json', ''),
            "Imported story file"
          );
          alert(`Successfully imported and opened "${newStory.projectName}"!`);
          onClose();
        } else {
          alert("Unrecognized story file format.");
        }
      } catch (err) {
        alert("Failed to parse JSON story file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
      <div className="bg-[#161b22] border border-[#0D5C63] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Top Header & Tab Switcher */}
        <div className="px-6 py-4 bg-[#0d1117] border-b border-[#0D5C63]/60 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-amber-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              🏛️
            </div>
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-cyan-300">
                Story Foundry Launcher & Catalog
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Manage story project files & standalone story element libraries
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-[#161b22] p-1 rounded-xl border border-[#0D5C63]/80 shadow-inner">
            <button
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'stories'
                  ? 'bg-cyan-950 text-[#22d3ee] border border-[#22d3ee]/60 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              onClick={() => setActiveTab('stories')}
            >
              📖 Story Files Catalog ({storyCatalog.length})
            </button>
            <button
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'elements'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              onClick={() => setActiveTab('elements')}
            >
              🏛️ Elements Catalog ({elementsCatalog.length})
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Catalog Launcher"
          >
            &times;
          </button>
        </div>

        {/* Tab 1: Current Story Files Catalog */}
        {activeTab === 'stories' && (
          <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            
            {/* Sub-tabs: My Stories vs Public Community Stories */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStorySourceSwitch('my_stories')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  storySourceTab === 'my_stories'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>📖</span> My Stories ({storyCatalog.length})
              </button>
              <button
                onClick={() => handleStorySourceSwitch('public_community')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  storySourceTab === 'public_community'
                    ? 'bg-amber-950 text-amber-300 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>🌐</span> Public Community Stories ({publicStoryCatalog.length})
              </button>
            </div>

            {/* Search, Sort & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              
              {/* Search Bar */}
              <div className="flex-1 min-w-[220px] relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
                <input
                  type="text"
                  value={storySearch}
                  onChange={(e) => setStorySearch(e.target.value)}
                  placeholder={storySourceTab === 'my_stories' ? "Search my story projects..." : "Search public community stories by name, author..."}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                <select
                  value={storySortBy}
                  onChange={(e) => setStorySortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs font-bold text-cyan-300 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="recent">Recently Updated</option>
                  <option value="name_asc">Name (A ➔ Z)</option>
                  <option value="name_desc">Name (Z ➔ A)</option>
                  <option value="elements">Most Elements</option>
                  <option value="maps">Most Maps</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Pull-down List of Elements */}
                <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-lg border border-amber-500/40">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider pl-1">
                    Element:
                  </span>
                  <select
                    value={selectedCatalogElementId}
                    onChange={(e) => setSelectedCatalogElementId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-bold text-[#22d3ee] rounded px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer max-w-[190px] truncate"
                  >
                    <option value="">-- Select Element --</option>
                    {elementsCatalog.length > 0 && (
                      <optgroup label="📚 Saved Elements Library">
                        {elementsCatalog.map(e => (
                          <option key={e.id} value={`saved:${e.id}`}>
                            {e.title || 'Untitled'} ({e.type || 'Element'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="✨ Blank Element Types">
                      {ELEMENT_TYPES.map(t => (
                        <option key={t} value={`blank:${t}`}>
                          New Blank {t}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <button
                    onClick={() => {
                      if (!selectedCatalogElementId) {
                        handleCreateNewElement('Scenario');
                        return;
                      }
                      if (selectedCatalogElementId.startsWith('saved:')) {
                        const id = selectedCatalogElementId.replace('saved:', '');
                        const found = elementsCatalog.find(e => e.id === id);
                        if (found) {
                          setEditingElement(found);
                          setIsEditModalOpen(true);
                        }
                      } else if (selectedCatalogElementId.startsWith('blank:')) {
                        const typeStr = selectedCatalogElementId.replace('blank:', '');
                        handleCreateNewElement(typeStr);
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-500/70 text-amber-300 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 shadow-sm"
                    title="Edit selected element or create new blank element"
                  >
                    <span>✏️</span> {selectedCatalogElementId ? 'Edit' : '+ New Element'}
                  </button>

                  {selectedCatalogElementId && (
                    <button
                      onClick={() => {
                        if (selectedCatalogElementId.startsWith('saved:')) {
                          const id = selectedCatalogElementId.replace('saved:', '');
                          const found = elementsCatalog.find(e => e.id === id);
                          if (found) handleImportElementToWorkingStory(found);
                        } else if (selectedCatalogElementId.startsWith('blank:')) {
                          const typeStr = selectedCatalogElementId.replace('blank:', '');
                          const newBlank = {
                            id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                            title: `New ${typeStr}`,
                            type: typeStr,
                            children: []
                          };
                          addStory(newBlank);
                          alert(`Imported blank "${newBlank.title}" into active story workspace!`);
                        }
                      }}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1 shadow-sm"
                      title="Import selected element into active story workspace"
                    >
                      <span>📥</span> Import
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    confirmIfDirty(() => setIsCreatingStory(true));
                  }}
                  className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] flex items-center gap-2"
                >
                  <span>✨</span> + New Story Project
                </button>
                <button
                  onClick={() => {
                    confirmIfDirty(() => fileInputRef.current?.click());
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>📥</span> Import Story File
                </button>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Story Catalog Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {processedStories.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 border-2 border-dashed border-slate-800 rounded-2xl">
                  <span className="text-4xl mb-3">📖</span>
                  <p className="text-sm font-bold uppercase text-slate-300 tracking-wider">No Story Projects Found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {storySearch ? 'No projects match your current search query.' : (storySourceTab === 'my_stories' ? 'Create a new story project or import a story file to get started.' : 'No public community stories have been shared yet.')}
                  </p>
                  {storySourceTab === 'my_stories' && (
                    <button
                      onClick={() => {
                        confirmIfDirty(() => setIsCreatingStory(true));
                      }}
                      className="mt-4 px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase rounded-lg"
                    >
                      + Create First Story Project
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processedStories.map(story => {
                    const isActive = universeState.id === story.id;
                    const elemCount = countElements(story.scenarios);
                    const mapCount = story.maps?.length || 0;

                    return (
                      <div
                        key={story.id}
                        className={`bg-slate-900/90 rounded-xl p-4 border flex flex-col justify-between transition-all shadow-lg group ${
                          isActive 
                            ? 'border-cyan-400/90 shadow-[0_0_15px_rgba(34,211,238,0.25)] ring-1 ring-cyan-500/50' 
                            : 'border-slate-800 hover:border-cyan-500/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                              {isActive ? 'Current Working Story' : 'Story File'}
                            </span>
                            {storySourceTab === 'my_stories' ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => toggleStoryVisibility && toggleStoryVisibility(story.id, !story.isPublic)}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                                    story.isPublic
                                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 hover:bg-cyan-900'
                                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                                  }`}
                                  title="Toggle Public Story Visibility"
                                >
                                  {story.isPublic ? '🌐 Public' : '🔒 Private'}
                                </button>
                                {story.isPublic && (
                                  <button
                                    onClick={() => handleCopyShareLink(story.id)}
                                    className="px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40 rounded text-[9px] font-mono font-bold uppercase"
                                    title="Copy Public Link"
                                  >
                                    🔗 Share
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-600/50 rounded text-[9px] font-mono font-bold">
                                ✍️ {story.authorEmail || story.authorHandle || story.creatorHandle || 'Community Creator'}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 truncate mb-1">
                            {story.projectName || 'Untitled Story'}
                          </h3>
                          
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                            {story.description || 'No description provided.'}
                          </p>

                          {/* Stats Badges */}
                          <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-slate-400 mb-4 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-1">
                              <span>🧩</span>
                              <span className="text-amber-400">{elemCount}</span> Elements
                            </div>
                            <span className="text-slate-700">|</span>
                            <div className="flex items-center gap-1">
                              <span>🗺️</span>
                              <span className="text-cyan-400">{mapCount}</span> Maps
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          {storySourceTab === 'my_stories' ? (
                            <>
                              <button
                                onClick={() => {
                                  if (isActive) {
                                    onClose();
                                  } else {
                                    confirmIfDirty(() => {
                                      openStory(story.id);
                                      onClose();
                                    });
                                  }
                                }}
                                className="flex-1 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                              >
                                {isActive ? 'Continue Working' : 'Open Story'}
                              </button>
                              
                              <button
                                onClick={() => {
                                  openStory(story.id);
                                  handleSaveLocal();
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                                title="Export Story JSON File"
                              >
                                💾
                              </button>

                              {storyCatalog.length > 1 && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete story project "${story.projectName}"?`)) {
                                      deleteStoryProject(story.id);
                                    }
                                  }}
                                  className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg text-xs font-bold"
                                  title="Delete Story Project"
                                >
                                  🗑️
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-between w-full gap-2">
                              <button
                                onClick={() => handleCopyShareLink(story.id)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                                title="Copy Share Link"
                              >
                                🔗 Share
                              </button>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    openStory(story.id);
                                    onClose();
                                  }}
                                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg"
                                >
                                  👁️ View Story
                                </button>
                                <button
                                  onClick={() => {
                                    clonePublicStory(story);
                                    onClose();
                                  }}
                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow"
                                >
                                  📋 Clone
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: All Saved Elements Catalog */}
        {activeTab === 'elements' && (
          <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            
            {/* Search, Filter & Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
                <input
                  type="text"
                  value={elementSearch}
                  onChange={(e) => setElementSearch(e.target.value)}
                  placeholder="Search saved elements by title, content, or author..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type:</span>
                <select
                  value={elementTypeFilter}
                  onChange={(e) => setElementTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="All">All Element Types</option>
                  <option value="Scenario">Scenario</option>
                  <option value="Character">Character</option>
                  <option value="Location">Location</option>
                  <option value="Faction">Faction</option>
                  <option value="Item">Item</option>
                  <option value="Clue">Clue</option>
                  <option value="Lore">Lore</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                <select
                  value={elementSortBy}
                  onChange={(e) => setElementSortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="recent">Recently Saved</option>
                  <option value="title_asc">Title (A ➔ Z)</option>
                  <option value="title_desc">Title (Z ➔ A)</option>
                  <option value="type">Element Type</option>
                  <option value="author">Author</option>
                </select>
              </div>
            </div>

            {/* Elements Catalog Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {processedElements.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 border-2 border-dashed border-slate-800 rounded-2xl">
                  <span className="text-4xl mb-3">🏛️</span>
                  <p className="text-sm font-bold uppercase text-slate-300 tracking-wider">No Saved Story Elements Found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {elementSearch || elementTypeFilter !== 'All' 
                      ? 'No elements match your active search or type filter.' 
                      : 'Saving story projects automatically archives all contained elements independently here!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processedElements.map(elem => (
                    <div
                      key={elem.id}
                      className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 hover:border-amber-500/60 transition-all shadow-lg flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-400">
                            {elem.type || 'Element'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono truncate" title={elem.authorEmail}>
                            {elem.authorEmail ? `@${elem.authorEmail.split('@')[0]}` : 'Catalog'}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 truncate mb-1">
                          {elem.title || `Untitled ${elem.type || 'Element'}`}
                        </h3>

                        {elem.parentPath && (
                          <div className="text-[10px] font-mono text-cyan-400 truncate mb-2">
                            📂 {elem.parentPath}
                          </div>
                        )}

                        {elem.content && (
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                            {elem.content.replace(/<[^>]+>/g, '')}
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => handleImportElementToWorkingStory(elem)}
                          className="flex-1 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                        >
                          📥 Import to Story
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingElement(elem);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-xs font-bold"
                          title="Edit Element Fields & Content"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => exportElementJSON(elem, universeState)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                          title="Export Element JSON"
                        >
                          📤
                        </button>

                        <button
                          onClick={() => exportElementMarkdown(elem, universeState)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                          title="Export Markdown (.md)"
                        >
                          📄
                        </button>

                        <button
                          onClick={() => exportElementPDF(elem, universeState)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                          title="Export Printable PDF"
                        >
                          🖨️
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete element "${elem.title}" from catalog?`)) {
                              deleteSavedElement(elem.id);
                            }
                          }}
                          className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg text-xs font-bold"
                          title="Delete Saved Element"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create New Story Dialog Overlay */}
        {isCreatingStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#161b22] border border-cyan-500/60 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="text-xl">✨</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                  Create New Story Project
                </h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Story Project Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    placeholder="e.g. Beyond the Rim Chronicles"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Description / Premise (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={newStoryDesc}
                    onChange={(e) => setNewStoryDesc(e.target.value)}
                    placeholder="Brief summary of your campaign or narrative module..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingStory(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md"
                  >
                    Create & Open
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit Individual Element Modal */}
        <EditElementModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingElement(null);
          }}
          element={editingElement}
          onSave={handleSaveEditElement}
        />
      </div>
    </div>
  );
};

export default FoundryLauncherModal;
