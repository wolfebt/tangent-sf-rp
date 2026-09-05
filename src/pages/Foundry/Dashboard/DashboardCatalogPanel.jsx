/**
 * @file DashboardCatalogPanel.jsx
 * @description Tabbed catalog panel for Stories, Maps, VTT Sessions, Personas, and Activity Feed.
 * Features clickable links to open items, folder filtering, and custom sorting.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Map, 
  Play, 
  User, 
  Activity, 
  Folder, 
  FolderPlus, 
  Sliders, 
  Search, 
  ExternalLink, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Database,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react';
import { useStory } from '../../../context/CampaignContext';
import { useFolio } from '../../../context/FolioContext';
import { 
  getFolders, 
  getItemFolderAssignments, 
  assignItemToFolder, 
  moveItemInFolder, 
  sortContentItems, 
  FOLDERS_UPDATE_EVENT 
} from '../../../services/customFolderService';
import FolderOrganizerModal from '../../../components/StoryFoundry/FolderOrganizerModal';
import { AudioService } from '../../../services/audioService';

export const DashboardCatalogPanel = () => {
  const navigate = useNavigate();
  const { 
    universeState, 
    storyCatalog, 
    mapsCatalog, 
    elementsCatalog, 
    openStory, 
    createNewStory 
  } = useStory();
  
  const folio = useFolio() || {};
  const personaRoster = folio.personaRoster || folio.roster || [];
  const switchRosterCharacter = folio.switchRosterCharacter;

  // Active Tab: 'stories' | 'maps' | 'vtt' | 'personas' | 'activity'
  const [activeTab, setActiveTab] = useState('stories');

  // Search and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'custom' | 'recent' | 'name_asc' | 'name_desc'
  const [activeFolderId, setActiveFolderId] = useState('all'); // 'all' | 'unfiled' | folderId

  // Folder system state
  const [folders, setFolders] = useState(() => getFolders());
  const [assignments, setAssignments] = useState(() => getItemFolderAssignments());
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);

  // Sync folders when updated
  useEffect(() => {
    const handleFoldersUpdate = () => {
      setFolders(getFolders());
      setAssignments(getItemFolderAssignments());
    };
    window.addEventListener(FOLDERS_UPDATE_EVENT, handleFoldersUpdate);
    return () => window.removeEventListener(FOLDERS_UPDATE_EVENT, handleFoldersUpdate);
  }, []);

  // ── 1. STORY ITEMS ──
  const processedStories = useMemo(() => {
    let list = [...(storyCatalog || [])];
    // Ensure active story is included if not in catalog
    if (universeState?.id && !list.some(s => s.id === universeState.id)) {
      list.unshift(universeState);
    }

    // Folder filtering
    if (activeFolderId === 'unfiled') {
      list = list.filter(s => !assignments[s.id]);
    } else if (activeFolderId !== 'all') {
      list = list.filter(s => assignments[s.id] === activeFolderId);
    }

    // Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        (s.projectName && s.projectName.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    return sortContentItems(list, sortBy, activeFolderId, 'id');
  }, [storyCatalog, universeState, assignments, activeFolderId, searchQuery, sortBy]);

  // ── 2. MAP ITEMS ──
  const processedMaps = useMemo(() => {
    const combined = [
      ...(mapsCatalog || []),
      ...((universeState?.maps || []).filter(m => !(mapsCatalog || []).some(catM => catM.id === m.id)))
    ];

    let list = combined;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => (m.name || m.title || '').toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (sortBy === 'name_asc') return (a.name || a.title || '').localeCompare(b.name || b.title || '');
      if (sortBy === 'name_desc') return (b.name || b.title || '').localeCompare(a.name || a.title || '');
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    return list;
  }, [mapsCatalog, universeState?.maps, searchQuery, sortBy]);

  // ── 3. VTT SESSIONS ──
  const processedVttSessions = useMemo(() => {
    // VTT encounters mapped from available tactical maps & stage encounters
    return processedMaps.map(m => ({
      id: m.id,
      title: m.name || m.title || 'Sector Recon Encounter',
      dimensions: `${m.width || 2000}x${m.height || 1500}`,
      gridSize: m.gridSize || 40,
      updatedAt: m.updatedAt,
      isTacticalReady: true
    }));
  }, [processedMaps]);

  // ── 4. PERSONA ITEMS ──
  const processedPersonas = useMemo(() => {
    let list = [...personaRoster];

    // Folder filtering
    if (activeFolderId === 'unfiled') {
      list = list.filter(p => !assignments[p['character-doc-id'] || p.id]);
    } else if (activeFolderId !== 'all') {
      list = list.filter(p => assignments[p['character-doc-id'] || p.id] === activeFolderId);
    }

    // Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        (p['char-name'] && p['char-name'].toLowerCase().includes(q)) ||
        (p['char-species'] && p['char-species'].toLowerCase().includes(q)) ||
        (p['char-occu'] && p['char-occu'].toLowerCase().includes(q))
      );
    }

    return sortContentItems(list, sortBy, activeFolderId, 'character-doc-id');
  }, [personaRoster, assignments, activeFolderId, searchQuery, sortBy]);

  // ── 5. ACTIVITY FEED ──
  const activityData = useMemo(() => {
    const extractScenarios = (nodes) => {
      let list = [];
      if (!nodes) return list;
      nodes.forEach(n => {
        list.push({ 
          id: n.id,
          title: n.title || 'Untitled Scenario', 
          date: n.updatedAt || universeState?.updatedAt,
          type: 'scenario'
        });
        if (n.children && n.children.length > 0) {
          list = list.concat(extractScenarios(n.children));
        }
      });
      return list;
    };

    const storyItems = extractScenarios(universeState?.scenarios || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    const elemItems = (elementsCatalog || [])
      .map(e => ({ id: e.id, title: e.title || e.name || 'Untitled Element', date: e.updatedAt, type: 'element' }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    const mapItems = (mapsCatalog || [])
      .map(m => ({ id: m.id, title: m.name || m.title || 'Untitled Map', date: m.updatedAt, type: 'map' }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    const aimeItems = (universeState?.creativeState?.storyCards || [])
      .map(c => ({ id: c.id, title: c.title || 'Idea Card', date: c.createdAt || universeState?.updatedAt, type: 'aime' }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    return { storyItems, elemItems, mapItems, aimeItems };
  }, [universeState, elementsCatalog, mapsCatalog]);

  // Navigation Click Handlers
  const handleOpenStory = (storyId) => {
    AudioService.playTerminalBeep(1200, 0.03);
    openStory(storyId);
    navigate(`/foundry/story?storyId=${storyId}`);
  };

  const handleOpenMap = (mapId) => {
    AudioService.playTerminalBeep(1200, 0.03);
    navigate(`/foundry/map-maker?mapId=${mapId}`);
  };

  const handleLaunchVtt = (mapId) => {
    AudioService.playTerminalBeep(1400, 0.04);
    navigate(`/stage?mapId=${mapId}`);
  };

  const handleOpenPersona = (charDocId) => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (switchRosterCharacter) {
      switchRosterCharacter(charDocId);
    }
    navigate('/folio');
  };

  const handleCreateNewStoryClick = () => {
    const title = prompt('Enter a title for your new story project:');
    if (title && title.trim()) {
      AudioService.playTerminalBeep(1300, 0.03);
      const newProj = createNewStory(title.trim());
      navigate(`/foundry/story?storyId=${newProj.id}`);
    }
  };

  const handleMoveOrder = (itemId, direction, list) => {
    AudioService.playTerminalBeep(1000, 0.02);
    moveItemInFolder(activeFolderId, itemId, direction, list);
    setAssignments(getItemFolderAssignments());
  };

  const handleFolderAssignment = (itemId, folderId) => {
    AudioService.playTerminalBeep(1000, 0.02);
    assignItemToFolder(itemId, folderId);
    setAssignments(getItemFolderAssignments());
  };

  return (
    <div className="dashboard-catalog-panel flex flex-col h-full bg-[#0a0d14]/95 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Panel Top Header with Tabs */}
      <div className="p-3 bg-[#0c1017] border-b border-slate-800 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Foundry Catalog & Feed
            </h2>
          </div>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.02);
              setIsOrganizerOpen(true);
            }}
            className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-[11px] font-bold font-mono uppercase flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] cursor-pointer"
            title="Manage Custom Folders and Organize Lists"
          >
            <Folder size={12} />
            <span>Folders</span>
          </button>
        </div>

        {/* Catalog Navigation Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono font-bold select-none">
          <button
            onClick={() => { AudioService.playTerminalBeep(900, 0.02); setActiveTab('stories'); }}
            className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'stories'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Stories Catalog"
          >
            <BookOpen size={13} />
            <span className="truncate">Stories</span>
          </button>

          <button
            onClick={() => { AudioService.playTerminalBeep(900, 0.02); setActiveTab('maps'); }}
            className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'maps'
                ? 'bg-sky-950 text-sky-300 border border-sky-500/50 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Maps Catalog"
          >
            <Map size={13} />
            <span className="truncate">Maps</span>
          </button>

          <button
            onClick={() => { AudioService.playTerminalBeep(900, 0.02); setActiveTab('vtt'); }}
            className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'vtt'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="VTT Tactical Sessions"
          >
            <Play size={13} />
            <span className="truncate">VTT</span>
          </button>

          <button
            onClick={() => { AudioService.playTerminalBeep(900, 0.02); setActiveTab('personas'); }}
            className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'personas'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Personas Catalog"
          >
            <User size={13} />
            <span className="truncate">Folio</span>
          </button>

          <button
            onClick={() => { AudioService.playTerminalBeep(900, 0.02); setActiveTab('activity'); }}
            className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Recent Activity Feed"
          >
            <Activity size={13} />
            <span className="truncate">Feed</span>
          </button>
        </div>

        {/* Filter & Sort Bar (shown on Stories, Maps, Personas) */}
        {activeTab !== 'activity' && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder={`Filter ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Sorting Mode Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
                title="Sort Order"
              >
                <option value="recent">⏱️ Newest</option>
                <option value="custom">⚡ Custom Order</option>
                <option value="name_asc">🔤 Name (A-Z)</option>
                <option value="name_desc">🔤 Name (Z-A)</option>
              </select>
            </div>

            {/* Folder Filter Chips (for Stories and Personas) */}
            {(activeTab === 'stories' || activeTab === 'personas') && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 text-[10px] font-mono">
                <button
                  onClick={() => setActiveFolderId('all')}
                  className={`px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                    activeFolderId === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFolderId('unfiled')}
                  className={`px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                    activeFolderId === 'unfiled'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Unfiled
                </button>
                {folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFolderId(f.id)}
                    className={`px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 transition-colors ${
                      activeFolderId === f.id
                        ? 'font-bold border'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                    style={activeFolderId === f.id ? {
                      borderColor: f.color,
                      backgroundColor: `${f.color}22`,
                      color: f.color
                    } : {}}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="truncate max-w-[85px]">{f.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        
        {/* ── TAB 1: STORIES CATALOG ── */}
        {activeTab === 'stories' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 text-[11px] font-mono text-slate-400">
              <span>{processedStories.length} Story Projects</span>
              <button
                onClick={handleCreateNewStoryClick}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Plus size={12} /> + New Story
              </button>
            </div>

            {processedStories.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No story projects found.
              </div>
            ) : (
              processedStories.map((story, index) => {
                const isActive = universeState?.id === story.id;
                const assignedFolder = folders.find(f => f.id === assignments[story.id]);

                return (
                  <div
                    key={story.id}
                    className={`group bg-slate-900/60 hover:bg-slate-900 border rounded-xl p-3 transition-all relative ${
                      isActive 
                        ? 'border-cyan-500/80 bg-gradient-to-r from-cyan-950/40 to-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                        : 'border-slate-800 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        onClick={() => handleOpenStory(story.id)}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold uppercase">
                              Active
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors truncate">
                            {story.projectName || 'Untitled Story'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {story.description || `${story.scenarios?.length || 0} scenarios • ${story.maps?.length || 0} maps`}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-mono">
                          <span>{story.scenarios?.length || 0} scenarios</span>
                          <span>•</span>
                          <span>{story.maps?.length || 0} maps</span>
                          {story.updatedAt && (
                            <>
                              <span>•</span>
                              <span>{new Date(story.updatedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Action: Open Link + Folder Picker */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenStory(story.id)}
                          className="px-2 py-1 bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open Story in ADE Editor"
                        >
                          <span>Open</span>
                          <ExternalLink size={10} />
                        </button>

                        {/* Reorder Buttons (When Custom Sort selected) */}
                        {sortBy === 'custom' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveOrder(story.id, 'up', processedStories)}
                              disabled={index === 0}
                              className="p-0.5 text-slate-500 hover:text-cyan-300 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(story.id, 'down', processedStories)}
                              disabled={index === processedStories.length - 1}
                              className="p-0.5 text-slate-500 hover:text-cyan-300 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                        )}

                        {/* Folder assignment chip / selector */}
                        <select
                          value={assignments[story.id] || ''}
                          onChange={(e) => handleFolderAssignment(story.id, e.target.value || null)}
                          className="bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400 hover:text-cyan-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-400 max-w-[105px] truncate cursor-pointer"
                          title="Change Folder"
                        >
                          <option value="">(Unfiled)</option>
                          {folders.map(f => (
                            <option key={f.id} value={f.id}>
                              📁 {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB 2: MAPS CATALOG ── */}
        {activeTab === 'maps' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 text-[11px] font-mono text-slate-400">
              <span>{processedMaps.length} Tactical Maps</span>
              <button
                onClick={() => navigate('/foundry/map-maker')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Plus size={12} /> + Create Map
              </button>
            </div>

            {processedMaps.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No maps found.
              </div>
            ) : (
              processedMaps.map((map) => (
                <div
                  key={map.id}
                  className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-3 transition-all relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      onClick={() => handleOpenMap(map.id)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors truncate">
                          {map.name || map.title || 'Untitled Map'}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Grid: {map.gridSize || 40}px • {map.width || 2000}x{map.height || 1500}
                      </p>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {map.updatedAt ? new Date(map.updatedAt).toLocaleDateString() : 'Ready'}
                      </div>
                    </div>

                    {/* Actions: Open in Map Maker & Launch Stage VTT */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenMap(map.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
                        title="Open in 2D Map Maker"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleLaunchVtt(map.id)}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(34,211,238,0.3)] cursor-pointer"
                        title="Launch in WebGPU Stage VTT"
                      >
                        <Play size={10} fill="currentColor" /> VTT
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 3: VTT SESSIONS CATALOG ── */}
        {activeTab === 'vtt' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 text-[11px] font-mono text-slate-400">
              <span>Tactical Encounter Sessions</span>
              <button
                onClick={() => navigate('/foundry/vtt-options')}
                className="text-amber-400 hover:text-amber-300 text-[10px] font-bold uppercase cursor-pointer"
              >
                Control Console →
              </button>
            </div>

            {/* Quick Master Launch Button */}
            <div 
              onClick={() => handleLaunchVtt(processedVttSessions[0]?.id || '')}
              className="p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border border-amber-500/50 hover:border-amber-400 cursor-pointer transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Play size={14} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                      Launch THE STAGE VTT
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Real-time WebGPU combat & tactical encounter
                    </p>
                  </div>
                </div>
                <span className="text-amber-400 font-mono font-bold text-xs">→</span>
              </div>
            </div>

            {/* List of tactical map encounter setups */}
            {processedVttSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No tactical map sessions configured yet.
              </div>
            ) : (
              processedVttSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 flex items-center justify-between gap-2 transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-200 truncate">
                        {session.title}
                      </h4>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Grid: 5ft • {session.dimensions}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => navigate(`/foundry/vtt-options?mapId=${session.id}`)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono uppercase rounded-lg transition-colors cursor-pointer"
                      title="Setup tokens and fog-of-war"
                    >
                      Config
                    </button>
                    <button
                      onClick={() => handleLaunchVtt(session.id)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)] cursor-pointer"
                    >
                      <Play size={10} fill="currentColor" /> Play
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: PERSONAS CATALOG ── */}
        {activeTab === 'personas' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 text-[11px] font-mono text-slate-400">
              <span>{processedPersonas.length} Operative Personas</span>
              <button
                onClick={() => navigate('/folio')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Plus size={12} /> + Open Folio
              </button>
            </div>

            {processedPersonas.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No operative personas found in your roster.
              </div>
            ) : (
              processedPersonas.map((persona, index) => {
                const docId = persona['character-doc-id'] || persona.id;

                return (
                  <div
                    key={docId}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 transition-all relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        onClick={() => handleOpenPersona(docId)}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                            {persona['char-name'] || 'Unnamed Operative'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
                          {persona['char-species'] || 'Species'} • {persona['char-archetype'] || persona['char-occu'] || 'Operative'}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          {persona.updatedAt ? new Date(persona.updatedAt).toLocaleDateString() : 'Ready'}
                        </div>
                      </div>

                      {/* Right Action: Open Link + Folder Assignment */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenPersona(docId)}
                          className="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open in Persona Folio"
                        >
                          <span>Open</span>
                          <ExternalLink size={10} />
                        </button>

                        {/* Reorder Buttons (When Custom Sort selected) */}
                        {sortBy === 'custom' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveOrder(docId, 'up', processedPersonas)}
                              disabled={index === 0}
                              className="p-0.5 text-slate-500 hover:text-cyan-300 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(docId, 'down', processedPersonas)}
                              disabled={index === processedPersonas.length - 1}
                              className="p-0.5 text-slate-500 hover:text-cyan-300 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                        )}

                        <select
                          value={assignments[docId] || ''}
                          onChange={(e) => handleFolderAssignment(docId, e.target.value || null)}
                          className="bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400 hover:text-emerald-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-400 max-w-[105px] truncate cursor-pointer"
                          title="Assign Folder"
                        >
                          <option value="">(Unfiled)</option>
                          {folders.map(f => (
                            <option key={f.id} value={f.id}>
                              📁 {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB 5: ACTIVITY FEED ── */}
        {activeTab === 'activity' && (
          <div className="space-y-2">
            <div className="pb-1 text-[11px] font-mono text-slate-400">
              Recent Cross-System Activity
            </div>

            {/* Story Recent Activity */}
            <ActivityBlock
              title="Stories & Scenarios"
              icon={<BookOpen size={14} />}
              color="var(--accent-primary)"
              items={activityData.storyItems}
              onItemClick={(item) => navigate('/foundry/story')}
            />

            {/* Elements Recent Activity */}
            <ActivityBlock
              title="Elements"
              icon={<Database size={14} />}
              color="var(--accent-green-dark)"
              items={activityData.elemItems}
              onItemClick={(item) => navigate('/foundry/elements')}
            />

            {/* Maps Recent Activity */}
            <ActivityBlock
              title="Maps"
              icon={<Map size={14} />}
              color="#34EBF7"
              items={activityData.mapItems}
              onItemClick={(item) => handleOpenMap(item.id)}
            />

            {/* AIME Recent Activity */}
            <ActivityBlock
              title="AIME Cards"
              icon={<Sparkles size={14} />}
              color="var(--accent-cyan-dark)"
              items={activityData.aimeItems}
              onItemClick={(item) => navigate('/foundry/aime')}
            />
          </div>
        )}
      </div>

      {/* Folder Organizer Modal */}
      <FolderOrganizerModal
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
        stories={storyCatalog || []}
        personas={personaRoster || []}
        initialFolderId={activeFolderId !== 'all' && activeFolderId !== 'unfiled' ? activeFolderId : null}
      />
    </div>
  );
};

const ActivityBlock = ({ title, icon, color, items = [], onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const latestItem = items[0];

  if (!latestItem) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-50 flex items-center gap-2 text-xs text-slate-500">
        <div style={{ color }}>{icon}</div>
        <span>No recent activity for {title}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/40 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-black/40" style={{ color }}>
            {icon}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-200 truncate block">
              {title}: <span style={{ color }}>"{latestItem.title}"</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {latestItem.date ? new Date(latestItem.date).toLocaleDateString() : 'Recently'}
            </span>
          </div>
        </div>

        <div className="text-slate-500">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </div>

      {isOpen && (
        <div className="px-3 py-2 bg-black/30 border-t border-slate-800/60 space-y-1.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onItemClick && onItemClick(item)}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center justify-between cursor-pointer py-1 group transition-colors"
            >
              <span className="truncate pr-2 group-hover:underline">{item.title}</span>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                {item.date ? new Date(item.date).toLocaleDateString() : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCatalogPanel;
