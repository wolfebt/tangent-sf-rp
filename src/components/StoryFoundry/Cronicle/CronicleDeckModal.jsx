import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Globe, 
  Brain, 
  Copy, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  Check, 
  X, 
  Sliders, 
  ShieldAlert, 
  Sparkles,
  MapPin,
  FileText,
  Search,
  Edit3,
  Boxes,
  FileCode,
  Tag,
  Clock,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { exportCronicleToMarkdown, formatCronicleContextForAIME } from '../../../services/cronicleService';
import { generateStoryScratchbook, findElementsUsed } from '../../../pages/Foundry/StoryModule/scratchbookService';
import { getTypePillStyle } from '../../../pages/Foundry/ElementForge/elementSchemas';

export default function CronicleDeckModal({ 
  isOpen, 
  onClose, 
  initialMode = 'living_memory',
  initialTab = null,
  beats = [] 
}) {
  const {
    universeState,
    elementsCatalog = [],
    cronicle,
    updateCronicle,
    updateWorkingMemory,
    applyCronicleDelta,
    cloneElementToCronicle,
    updateCreativeState,
    triggerStorySave
  } = useStory();

  // ── MASTER DECK MODE: 'living_memory' | 'scratchbook' ──
  const [deckMode, setDeckMode] = useState(initialMode);

  // Active sub-tabs per deck mode
  // living_memory: 'working_memory' | 'personas' | 'world' | 'timeline' | 'working_copies'
  const [memoryTab, setMemoryTab] = useState('working_memory');
  // scratchbook: 'scratchbook_doc' | 'aggregated_elements' | 'scratchbook_notes'
  const [scratchTab, setScratchTab] = useState('scratchbook_doc');

  // Synchronize mode/tab if passed or modal re-opens
  useEffect(() => {
    if (initialMode) {
      setDeckMode(initialMode);
    }
    if (initialTab) {
      if (['working_memory', 'personas', 'world', 'timeline', 'working_copies'].includes(initialTab)) {
        setDeckMode('living_memory');
        setMemoryTab(initialTab);
      } else if (['scratchbook_doc', 'aggregated_elements', 'scratchbook_notes'].includes(initialTab)) {
        setDeckMode('scratchbook');
        setScratchTab(initialTab);
      }
    }
  }, [initialMode, initialTab, isOpen]);

  // Working Memory State
  const workingMemory = cronicle?.workingMemory || {
    activeLocationId: null,
    activePersonaIds: [],
    immediateObjective: '',
    unresolvedConflicts: '',
    ephemeralNotes: ''
  };

  // Local helper states for creating new items
  const [newTimelineTitle, setNewTimelineTitle] = useState('');
  const [newTimelineSummary, setNewTimelineSummary] = useState('');
  const [newTimelineEntities, setNewTimelineEntities] = useState('');

  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaRole, setNewPersonaRole] = useState('');

  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationState, setNewLocationState] = useState('thriving');
  const [newLocationFaction, setNewLocationFaction] = useState('');

  // Selected element for Working Copy Protocol
  const [selectedElementToClone, setSelectedElementToClone] = useState('');

  // Trait input buffers per persona/location
  const [traitInputs, setTraitInputs] = useState({});
  const [inventoryInputs, setInventoryInputs] = useState({});
  const [hazardInputs, setHazardInputs] = useState({});

  // ── SCRATCHBOOK & DIRECTIVES STATE ──
  const initialStoredNotes = universeState?.creativeState?.scratchbookNotes || universeState?.scratchbookNotes || universeState?.developmentNotes || '';
  const [scratchNotes, setScratchNotes] = useState(initialStoredNotes);
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Aggregated Elements filters
  const [elementSearch, setElementSearch] = useState('');
  const [elementTypeFilter, setElementTypeFilter] = useState('ALL');
  const [clonedFeedback, setClonedFeedback] = useState({});

  // Sync stored notes when universeState changes externally
  useEffect(() => {
    const currentStoredNotes = universeState?.creativeState?.scratchbookNotes || universeState?.scratchbookNotes || universeState?.developmentNotes || '';
    if (currentStoredNotes && currentStoredNotes !== scratchNotes && !isNotesSaved) {
      setScratchNotes(currentStoredNotes);
    }
  }, [universeState]);

  const personas = cronicle?.personas || {};
  const locations = cronicle?.locations || {};
  const timeline = cronicle?.timeline || [];
  const workingCopies = cronicle?.workingCopies || {};

  // Find all elements used across scenarios and project hierarchy
  const elementsUsed = useMemo(() => {
    return findElementsUsed(universeState, elementsCatalog);
  }, [universeState, elementsCatalog]);

  // Dynamically compile the full Scratchbook Markdown
  const compiledScratchbookMarkdown = useMemo(() => {
    return generateStoryScratchbook({
      universeState,
      elementsCatalog,
      customNotes: scratchNotes,
      beatsLedger: beats
    });
  }, [universeState, elementsCatalog, scratchNotes, beats]);

  // Computed Context Injection Preview for Living Memory
  const contextPreview = useMemo(() => {
    return formatCronicleContextForAIME(cronicle);
  }, [cronicle]);

  // ── SCRATCHBOOK ACTIONS ──
  const handleSaveScratchNotes = () => {
    AudioService.playTerminalBeep(1100, 0.06);
    if (updateCreativeState) {
      updateCreativeState({ scratchbookNotes: scratchNotes });
    }
    if (triggerStorySave) {
      triggerStorySave();
    }
    setIsNotesSaved(true);
    setTimeout(() => setIsNotesSaved(false), 2200);
  };

  const handleCopyScratchbookMarkdown = () => {
    navigator.clipboard.writeText(compiledScratchbookMarkdown);
    AudioService.playTerminalBeep(1200, 0.05);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleDownloadScratchbook = () => {
    AudioService.playTerminalBeep(1400, 0.08);
    const cleanTitle = (universeState?.projectName || 'Tangent_Story')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanTitle}_SCRATCHBOOK.md`;
    const blob = new Blob([compiledScratchbookMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInsertSnippet = (snippet) => {
    AudioService.playTerminalBeep(900, 0.03);
    setScratchNotes(prev => {
      const spacing = prev.trim() ? '\n\n' : '';
      return `${prev}${spacing}${snippet}`;
    });
  };

  const handleCloneAggregatedElement = (element) => {
    if (!element) return;
    AudioService.playTerminalBeep(1300, 0.06);
    cloneElementToCronicle(element);
    setClonedFeedback(prev => ({ ...prev, [element.id]: true }));
    setTimeout(() => {
      setClonedFeedback(prev => ({ ...prev, [element.id]: false }));
    }, 2500);
  };

  // ── LIVING MEMORY: PERSONA HANDLERS ──
  const handleCreatePersona = (e) => {
    e.preventDefault();
    if (!newPersonaName.trim()) return;
    AudioService.playTerminalBeep(1200, 0.04);
    const prefix = cronicle.storyPrefix || 'story';
    const id = `${prefix}_${newPersonaName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.random().toString(36).substring(2, 5)}`;
    
    const newPersona = {
      id,
      name: newPersonaName.trim(),
      role: newPersonaRole.trim() || 'Operative',
      current_status: 'active',
      base_physical_stats: { str: 2, dex: 2, int: 2, hp: 30, maxHp: 30 },
      active_inventory: [],
      relationship_matrix: {},
      dynamic_psychological_traits: [],
      acquired_physical_traits: []
    };

    updateCronicle({
      personas: {
        ...personas,
        [id]: newPersona
      }
    });

    setNewPersonaName('');
    setNewPersonaRole('');
  };

  const handleDeletePersona = (personaId) => {
    AudioService.playCombatHit(false);
    const nextPersonas = { ...personas };
    delete nextPersonas[personaId];
    updateCronicle({ personas: nextPersonas });
  };

  const handleAddPersonaTrait = (personaId, type = 'physical') => {
    const val = (traitInputs[`${personaId}_${type}`] || '').trim();
    if (!val) return;
    AudioService.playTerminalBeep(1100, 0.03);
    applyCronicleDelta({
      id: `man_${Date.now()}`,
      entityId: personaId,
      action: 'add_trait',
      target: type,
      value: val
    });
    setTraitInputs(prev => ({ ...prev, [`${personaId}_${type}`]: '' }));
  };

  const handleRemovePersonaTrait = (personaId, traitValue, type = 'physical') => {
    applyCronicleDelta({
      id: `man_${Date.now()}`,
      entityId: personaId,
      action: 'remove_trait',
      target: type,
      value: traitValue
    });
  };

  const handleAddInventoryItem = (personaId) => {
    const val = (inventoryInputs[personaId] || '').trim();
    if (!val) return;
    AudioService.playTerminalBeep(1100, 0.03);
    applyCronicleDelta({
      id: `man_${Date.now()}`,
      entityId: personaId,
      action: 'add_item',
      value: val
    });
    setInventoryInputs(prev => ({ ...prev, [personaId]: '' }));
  };

  const handleRemoveInventoryItem = (personaId, item) => {
    applyCronicleDelta({
      id: `man_${Date.now()}`,
      entityId: personaId,
      action: 'remove_item',
      value: item
    });
  };

  const handleUpdateRelationship = (personaId, targetId, deltaScore) => {
    applyCronicleDelta({
      id: `man_${Date.now()}`,
      entityId: personaId,
      action: 'update_relationship',
      target: targetId,
      value: parseInt(deltaScore, 10)
    });
  };

  // ── LIVING MEMORY: LOCATION HANDLERS ──
  const handleCreateLocation = (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    AudioService.playTerminalBeep(1200, 0.04);
    const prefix = cronicle.storyPrefix || 'story';
    const id = `${prefix}_${newLocationName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.random().toString(36).substring(2, 5)}`;

    const newLoc = {
      id,
      name: newLocationName.trim(),
      current_geospatial_state: newLocationState,
      faction_control: newLocationFaction.trim() || 'Independent',
      environmental_hazards: [],
      occupant_lists: [],
      tactical_gm_notes: ''
    };

    updateCronicle({
      locations: {
        ...locations,
        [id]: newLoc
      }
    });

    setNewLocationName('');
    setNewLocationFaction('');
  };

  const handleDeleteLocation = (locationId) => {
    AudioService.playCombatHit(false);
    const nextLocs = { ...locations };
    delete nextLocs[locationId];
    updateCronicle({ locations: nextLocs });
  };

  const handleAddHazard = (locationId) => {
    const val = (hazardInputs[locationId] || '').trim();
    if (!val) return;
    AudioService.playTerminalBeep(1100, 0.03);
    applyCronicleDelta({
      id: `man_${Date.now()}`,
      entityId: locationId,
      action: 'add_hazard',
      value: val
    });
    setHazardInputs(prev => ({ ...prev, [locationId]: '' }));
  };

  const handleRemoveHazard = (locationId, hazard) => {
    applyCronicleDelta({
      id: `man_${Date.now()}`,
      entityId: locationId,
      action: 'remove_hazard',
      value: hazard
    });
  };

  // ── LIVING MEMORY: TIMELINE HANDLERS ──
  const handleAddTimelineEvent = (e) => {
    e.preventDefault();
    if (!newTimelineTitle.trim()) return;
    AudioService.playTerminalBeep(1200, 0.04);

    const entities = newTimelineEntities
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    applyCronicleDelta({
      id: `man_${Date.now()}`,
      action: 'add_timeline_event',
      sceneTitle: newTimelineTitle.trim(),
      value: newTimelineSummary.trim() || 'Narrative milestone established.',
      involved_entities: entities
    });

    setNewTimelineTitle('');
    setNewTimelineSummary('');
    setNewTimelineEntities('');
  };

  const handleDeleteTimelineEvent = (eventId) => {
    AudioService.playCombatHit(false);
    updateCronicle({
      timeline: timeline.filter(t => t.id !== eventId)
    });
  };

  // ── LIVING MEMORY: WORKING COPY PROTOCOL ──
  const handleCloneSelectedElement = () => {
    if (!selectedElementToClone) return;
    const target = elementsCatalog.find(e => e.id === selectedElementToClone);
    if (target) {
      AudioService.playTerminalBeep(1300, 0.06);
      cloneElementToCronicle(target);
      setSelectedElementToClone('');
    }
  };

  const handleDeleteWorkingCopy = (copyId) => {
    AudioService.playCombatHit(false);
    const nextCopies = { ...workingCopies };
    delete nextCopies[copyId];
    const nextPersonas = { ...personas };
    delete nextPersonas[copyId];
    const nextLocations = { ...locations };
    delete nextLocations[copyId];
    updateCronicle({
      workingCopies: nextCopies,
      personas: nextPersonas,
      locations: nextLocations
    });
  };

  // ── EXPORT / IMPORT HANDLERS ──
  const handleExportJSON = () => {
    AudioService.playTerminalBeep(1400, 0.06);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cronicle, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `${cronicle.storyPrefix || 'story'}_CRONICLE.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && (imported.personas || imported.locations || imported.timeline)) {
          updateCronicle(imported);
          AudioService.playTerminalBeep(1400, 0.1);
          alert("CRONICLE state successfully imported!");
        } else {
          alert("Invalid CRONICLE JSON format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Filtered elements used
  const filteredElements = elementsUsed.filter(el => {
    if (elementTypeFilter !== 'ALL' && (el.type || 'Custom').toLowerCase() !== elementTypeFilter.toLowerCase()) {
      return false;
    }
    if (!elementSearch) return true;
    const q = elementSearch.toLowerCase();
    return (
      (el.title && el.title.toLowerCase().includes(q)) ||
      (el.type && el.type.toLowerCase().includes(q)) ||
      (el.summary && el.summary.toLowerCase().includes(q)) ||
      (Array.isArray(el.usedIn) && el.usedIn.some(s => s.toLowerCase().includes(q)))
    );
  });

  // Unique element types for filtering pills
  const availableElementTypes = useMemo(() => {
    const set = new Set();
    elementsUsed.forEach(e => {
      if (e.type) set.add(e.type);
    });
    return Array.from(set).sort();
  }, [elementsUsed]);

  // Sync default elementTypeFilter
  useEffect(() => {
    if (elementTypeFilter === 'ALL' && availableElementTypes.length > 0) {
      setElementTypeFilter(availableElementTypes[0]);
    }
  }, [availableElementTypes]);

  // Highlighted or filtered markdown display
  const displayedMarkdown = useMemo(() => {
    if (!docSearchQuery.trim()) return compiledScratchbookMarkdown;
    return compiledScratchbookMarkdown;
  }, [compiledScratchbookMarkdown, docSearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-sans select-none animate-in fade-in duration-150">
      <div className="bg-[#0b0f19] border border-cyan-500/50 w-full max-w-7xl h-[92vh] rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden text-slate-200">
        
        {/* ── TOP HEADER BAR ── */}
        <div className="px-5 py-3 bg-[#080c14] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-purple-600 to-cyan-500 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-amber-300 font-mono">
                  CRONICLE: Persistent Memory &amp; Story Scratchbook
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                  Story Prefix: {cronicle.storyPrefix || 'story'}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-[10px] font-mono font-bold text-purple-300 uppercase">
                  {elementsUsed.length} Elements Used
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                Single Source of Truth • Living Memory Deck • Aggregated Elements Document • GM Directives
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={handleCopyScratchbookMarkdown}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Copy complete compiled Scratchbook Markdown to clipboard"
            >
              {copiedDoc ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-amber-400" />}
              <span className="hidden sm:inline">{copiedDoc ? 'Copied!' : 'Copy MD'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadScratchbook}
              className="px-2.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Download compiled Scratchbook as a Markdown (.md) file"
            >
              <Download size={12} />
              <span className="hidden sm:inline">Download .MD</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Export Cronicle state JSON"
            >
              <FileCode size={12} className="text-purple-400" />
              <span className="hidden md:inline">JSON</span>
            </button>

            <label className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm">
              <Upload size={12} className="text-emerald-400" />
              <span className="hidden md:inline">Import</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Close CRONICLE Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── MASTER DECK SWITCHER (LIVING MEMORY vs SCRATCHBOOK & AGGREGATED ELEMENTS) ── */}
        <div className="px-5 py-2.5 bg-[#0a0e17] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 p-1 bg-slate-950/90 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setDeckMode('living_memory')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                deckMode === 'living_memory'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Brain size={14} className={deckMode === 'living_memory' ? 'text-amber-200' : 'text-amber-400'} />
              <span>Living Memory Deck</span>
              <span className="px-1.5 py-0.2 bg-black/40 rounded text-[10px] font-mono">
                {Object.keys(personas).length + Object.keys(locations).length + timeline.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDeckMode('scratchbook')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                deckMode === 'scratchbook'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BookOpen size={14} className={deckMode === 'scratchbook' ? 'text-cyan-200' : 'text-cyan-400'} />
              <span>Scratchbook &amp; Aggregated Elements</span>
              <span className="px-1.5 py-0.2 bg-black/40 rounded text-[10px] font-mono">
                {elementsUsed.length}
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Project: <strong className="text-slate-200">{universeState?.projectName || 'Tangent Story'}</strong></span>
            <span>•</span>
            <span>Active Scene: <strong className="text-amber-300">{locations[workingMemory.activeLocationId]?.name || 'Unassigned'}</strong></span>
          </div>
        </div>

        {/* ── SUB-NAVIGATION TABS (Contextual to active deck mode) ── */}
        <div className="px-5 py-2 bg-[#101623] border-b border-slate-800 flex flex-wrap gap-1.5 shrink-0">
          
          {/* SUB-TABS: LIVING MEMORY DECK */}
          {deckMode === 'living_memory' && (
            <>
              <button
                type="button"
                onClick={() => setMemoryTab('working_memory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  memoryTab === 'working_memory'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Brain size={13} />
                <span>Working Memory &amp; Active Scene</span>
              </button>

              <button
                type="button"
                onClick={() => setMemoryTab('personas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  memoryTab === 'personas'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/80 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Users size={13} />
                <span>Persona Matrix ({Object.keys(personas).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMemoryTab('world')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  memoryTab === 'world'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Globe size={13} />
                <span>World Anvil ({Object.keys(locations).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMemoryTab('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  memoryTab === 'timeline'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Clock size={13} />
                <span>Story Weaver Timeline ({timeline.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMemoryTab('working_copies')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  memoryTab === 'working_copies'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Copy size={13} />
                <span>Working Copies Protocol ({Object.keys(workingCopies).length})</span>
              </button>
            </>
          )}

          {/* SUB-TABS: SCRATCHBOOK & AGGREGATED ELEMENTS */}
          {deckMode === 'scratchbook' && (
            <>
              <button
                type="button"
                onClick={() => setScratchTab('scratchbook_doc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  scratchTab === 'scratchbook_doc'
                    ? 'bg-amber-950/90 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileText size={13} />
                <span>Compiled Scratchbook Document (.md)</span>
              </button>

              <button
                type="button"
                onClick={() => setScratchTab('aggregated_elements')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  scratchTab === 'aggregated_elements'
                    ? 'bg-purple-950/90 text-purple-300 border border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Boxes size={13} />
                <span>Aggregated Elements Catalog ({elementsUsed.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setScratchTab('scratchbook_notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  scratchTab === 'scratchbook_notes'
                    ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Edit3 size={13} />
                <span>GM Scratchpad &amp; Directives (Editable)</span>
              </button>
            </>
          )}

        </div>

        {/* ── MAIN CONTENT VIEWPORT ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* DECK MODE 1: LIVING MEMORY DECK                                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {deckMode === 'living_memory' && (
            <>
              {/* TAB 1: WORKING MEMORY & ACTIVE SCENE */}
              {memoryTab === 'working_memory' && (
                <div className="flex flex-col lg:flex-row gap-5 h-full">
                  {/* Left Column: Form Settings */}
                  <div className="flex-1 flex flex-col gap-4 max-w-xl">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <MapPin size={14} /> Active Location for Current Scene
                      </h3>
                      <select
                        value={workingMemory.activeLocationId || ''}
                        onChange={(e) => updateWorkingMemory({ activeLocationId: e.target.value || null })}
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="">-- No Active Location Selected --</option>
                        {Object.values(locations).map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} [{loc.current_geospatial_state?.toUpperCase() || 'THRIVING'}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <Users size={14} /> Active Characters Present in Scene
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {Object.values(personas).map(p => {
                          const isSelected = (workingMemory.activePersonaIds || []).includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const curr = workingMemory.activePersonaIds || [];
                                  const next = e.target.checked ? [...curr, p.id] : curr.filter(id => id !== p.id);
                                  updateWorkingMemory({ activePersonaIds: next });
                                }}
                                className="accent-cyan-500"
                              />
                              <span className="font-bold truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-500 ml-auto">({p.role})</span>
                            </label>
                          );
                        })}
                        {Object.keys(personas).length === 0 && (
                          <p className="text-xs text-slate-500 italic col-span-2">
                            No personas registered yet. Create one in the Persona Matrix tab or clone from Aggregated Elements.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Immediate Quest Objective &amp; Conflicts
                      </h3>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Immediate Objective:</label>
                        <input
                          type="text"
                          value={workingMemory.immediateObjective || ''}
                          onChange={(e) => updateWorkingMemory({ immediateObjective: e.target.value })}
                          placeholder="e.g. Infiltrate the lower hangar and extract the VIP."
                          className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Unresolved Conflicts:</label>
                        <input
                          type="text"
                          value={workingMemory.unresolvedConflicts || ''}
                          onChange={(e) => updateWorkingMemory({ unresolvedConflicts: e.target.value })}
                          placeholder="e.g. Life support failing; rival bounty hunter is already inside."
                          className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Ephemeral Tactical Notes / Scene Directives:</label>
                        <textarea
                          value={workingMemory.ephemeralNotes || ''}
                          onChange={(e) => updateWorkingMemory({ ephemeralNotes: e.target.value })}
                          placeholder="Quick tactical modifiers, player state reminders, or active scene hooks..."
                          className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400 mt-1 min-h-[60px] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Context Injection Preview */}
                  <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-cyan-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                          Live AIME Context Injection Stream
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        3-Tier Mathematical Budget Preview
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      {contextPreview || 'No active context elements selected.'}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PERSONA MATRIX */}
              {memoryTab === 'personas' && (
                <div className="flex flex-col gap-5">
                  {/* Add New Persona Bar */}
                  <form onSubmit={handleCreatePersona} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={newPersonaName}
                        onChange={(e) => setNewPersonaName(e.target.value)}
                        placeholder="New Persona Name (e.g. Elara Vex)..."
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="w-48">
                      <input
                        type="text"
                        value={newPersonaRole}
                        onChange={(e) => setNewPersonaRole(e.target.value)}
                        placeholder="Role (e.g. Frontier Marshal)..."
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-cyan-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Persona</span>
                    </button>
                  </form>

                  {/* Personas Roster */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(personas).map(p => (
                      <div key={p.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-xs text-slate-400 font-normal">({p.role})</span>
                            </h4>
                            <span className="text-[10px] font-mono text-cyan-400">ID: {p.id}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={p.current_status || 'active'}
                              onChange={(e) => {
                                applyCronicleDelta({
                                  id: `man_${Date.now()}`,
                                  entityId: p.id,
                                  action: 'update_status',
                                  value: e.target.value
                                });
                              }}
                              className={`text-xs font-bold uppercase px-2 py-1 rounded border outline-none cursor-pointer ${
                                p.current_status === 'injured'
                                  ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                                  : p.current_status === 'deceased'
                                  ? 'bg-red-950 text-red-300 border-red-500/60'
                                  : p.current_status === 'unconscious'
                                  ? 'bg-purple-950 text-purple-300 border-purple-500/60'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                              }`}
                            >
                              <option value="active">Active</option>
                              <option value="injured">Injured</option>
                              <option value="unconscious">Unconscious</option>
                              <option value="deceased">Deceased</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleDeletePersona(p.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Delete Persona"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Physical Traits / Injuries */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Physical Traits &amp; Injuries:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(p.acquired_physical_traits || []).map(t => (
                              <span key={t} className="px-2 py-0.5 bg-red-950/60 border border-red-500/40 text-red-300 text-[11px] rounded flex items-center gap-1 font-mono">
                                {t}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePersonaTrait(p.id, t, 'physical')}
                                  className="hover:text-red-100 cursor-pointer ml-1"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            <input
                              type="text"
                              value={traitInputs[`${p.id}_physical`] || ''}
                              onChange={(e) => setTraitInputs(prev => ({ ...prev, [`${p.id}_physical`]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddPersonaTrait(p.id, 'physical')}
                              placeholder="+ Add physical injury / condition..."
                              className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddPersonaTrait(p.id, 'physical')}
                              className="px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Psychological Traits */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Psychological &amp; Behavioral Traits:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(p.dynamic_psychological_traits || []).map(t => (
                              <span key={t} className="px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] rounded flex items-center gap-1 font-mono">
                                {t}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePersonaTrait(p.id, t, 'psychological')}
                                  className="hover:text-purple-100 cursor-pointer ml-1"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            <input
                              type="text"
                              value={traitInputs[`${p.id}_psychological`] || ''}
                              onChange={(e) => setTraitInputs(prev => ({ ...prev, [`${p.id}_psychological`]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddPersonaTrait(p.id, 'psychological')}
                              placeholder="+ Add psychological state (e.g. Paranoia)..."
                              className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddPersonaTrait(p.id, 'psychological')}
                              className="px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Inventory Items */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Active Carried Inventory:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(p.active_inventory || []).map(item => (
                              <span key={item} className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px] rounded flex items-center gap-1 font-mono">
                                {item}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInventoryItem(p.id, item)}
                                  className="hover:text-cyan-100 cursor-pointer ml-1"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            <input
                              type="text"
                              value={inventoryInputs[p.id] || ''}
                              onChange={(e) => setInventoryInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddInventoryItem(p.id)}
                              placeholder="+ Add inventory item..."
                              className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddInventoryItem(p.id)}
                              className="px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Inter-character Relationships */}
                        {Object.values(personas).filter(other => other.id !== p.id).length > 0 && (
                          <div className="border-t border-slate-800 pt-2 flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                              Relational Web &amp; Affinity (-100 to +100):
                            </span>
                            {Object.values(personas)
                              .filter(other => other.id !== p.id)
                              .map(other => {
                                const score = p.relationship_matrix ? p.relationship_matrix[other.id] ?? 0 : 0;
                                return (
                                  <div key={other.id} className="flex items-center justify-between gap-3 text-xs">
                                    <span className="text-slate-300 truncate w-32">{other.name}:</span>
                                    <input
                                      type="range"
                                      min="-100"
                                      max="100"
                                      value={score}
                                      onChange={(e) => handleUpdateRelationship(p.id, other.id, e.target.value)}
                                      className="flex-1 accent-amber-500 cursor-pointer"
                                    />
                                    <span className={`font-mono font-bold w-12 text-right ${score < 0 ? 'text-red-400' : score > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                      {score > 0 ? `+${score}` : score}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WORLD ANVIL & LOCATIONS */}
              {memoryTab === 'world' && (
                <div className="flex flex-col gap-5">
                  {/* Add New Location Form */}
                  <form onSubmit={handleCreateLocation} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        placeholder="New Location Name (e.g. The Ruined Citadel)..."
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="w-40">
                      <select
                        value={newLocationState || 'thriving'}
                        onChange={(e) => setNewLocationState(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-emerald-400 cursor-pointer"
                      >
                        <option value="thriving">Thriving</option>
                        <option value="under_siege">Under Siege</option>
                        <option value="ruined">Ruined</option>
                        <option value="rebuilding">Rebuilding</option>
                      </select>
                    </div>
                    <div className="w-48">
                      <input
                        type="text"
                        value={newLocationFaction}
                        onChange={(e) => setNewLocationFaction(e.target.value)}
                        placeholder="Faction / Sovereignty..."
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-emerald-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Location</span>
                    </button>
                  </form>

                  {/* Locations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(locations).map(loc => (
                      <div key={loc.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              <span>{loc.name}</span>
                              <span className="text-xs text-slate-400 font-normal">[{loc.faction_control}]</span>
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400">ID: {loc.id}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={loc.current_geospatial_state || 'thriving'}
                              onChange={(e) => {
                                applyCronicleDelta({
                                  id: `man_${Date.now()}`,
                                  entityId: loc.id,
                                  action: 'update_location_state',
                                  value: e.target.value
                                });
                              }}
                              className={`text-xs font-bold uppercase px-2 py-1 rounded border outline-none cursor-pointer ${
                                loc.current_geospatial_state === 'ruined'
                                  ? 'bg-red-950 text-red-300 border-red-500/60'
                                  : loc.current_geospatial_state === 'under_siege'
                                  ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                                  : loc.current_geospatial_state === 'rebuilding'
                                  ? 'bg-purple-950 text-purple-300 border-purple-500/60'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                              }`}
                            >
                              <option value="thriving">Thriving</option>
                              <option value="under_siege">Under Siege</option>
                              <option value="ruined">Ruined</option>
                              <option value="rebuilding">Rebuilding</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleDeleteLocation(loc.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Delete Location"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Environmental Hazards */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Active Environmental Hazards:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(loc.environmental_hazards || []).map(h => (
                              <span key={h} className="px-2 py-0.5 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] rounded flex items-center gap-1 font-mono">
                                {h}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHazard(loc.id, h)}
                                  className="hover:text-amber-100 cursor-pointer ml-1"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            <input
                              type="text"
                              value={hazardInputs[loc.id] || ''}
                              onChange={(e) => setHazardInputs(prev => ({ ...prev, [loc.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddHazard(loc.id)}
                              placeholder="+ Add hazard (e.g. Acid Rain, Radiation Leak)..."
                              className="flex-1 bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddHazard(loc.id)}
                              className="px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Current Occupants */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Present Occupant Entities:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(loc.occupant_lists || []).map(occId => {
                              const occName = personas[occId]?.name || occId;
                              return (
                                <span key={occId} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded font-mono">
                                  {occName}
                                </span>
                              );
                            })}
                            {(!loc.occupant_lists || loc.occupant_lists.length === 0) && (
                              <span className="text-xs text-slate-500 italic">No occupants currently recorded here.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: STORY WEAVER TIMELINE */}
              {memoryTab === 'timeline' && (
                <div className="flex flex-col gap-5">
                  {/* Add Milestone Form */}
                  <form onSubmit={handleAddTimelineEvent} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <Plus size={14} /> Log New Milestone / Scene Outcome
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newTimelineTitle}
                        onChange={(e) => setNewTimelineTitle(e.target.value)}
                        placeholder="Milestone Title (e.g. The Breach of Copia Alpha)..."
                        className="bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-indigo-400"
                      />
                      <input
                        type="text"
                        value={newTimelineEntities}
                        onChange={(e) => setNewTimelineEntities(e.target.value)}
                        placeholder="Entities Involved (comma-separated, e.g. Elara, Vance)..."
                        className="bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-indigo-400"
                      />
                    </div>
                    <textarea
                      value={newTimelineSummary}
                      onChange={(e) => setNewTimelineSummary(e.target.value)}
                      placeholder="Summary of dramatic consequences, critical decisions, or tactical shifts..."
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-indigo-400 min-h-[60px]"
                    />
                    <button
                      type="submit"
                      className="self-end px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Log Milestone</span>
                    </button>
                  </form>

                  {/* Timeline Sequence */}
                  <div className="flex flex-col gap-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {timeline.map((evt, idx) => (
                      <div key={evt.id} className="relative pl-10">
                        <div className="absolute left-2.5 top-3 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-[#0b0f19] shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3.5 flex flex-col gap-1.5 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/40 rounded font-bold">
                                Act #{idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-slate-100">{evt.sceneTitle}</h4>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(evt.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteTimelineEvent(evt.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Delete Milestone"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {evt.summary}
                          </p>

                          {evt.involved_entities && evt.involved_entities.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-mono">Involved:</span>
                              {evt.involved_entities.map(ent => (
                                <span key={ent} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-cyan-400 rounded">
                                  {ent}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {timeline.length === 0 && (
                      <div className="text-center py-10 text-slate-500 italic">
                        No timeline milestones logged yet. As scenes complete, AIME will automatically record causal milestones here.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: WORKING COPIES PROTOCOL */}
              {memoryTab === 'working_copies' && (
                <div className="flex flex-col gap-5">
                  <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-4 flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                      <Copy size={14} /> The Working Copy Protocol (Source Element Preservation)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Base lore elements in your compendium and Elements Catalog are immutable templates. When imported into this story, they are cloned as story-prefixed Working Copies (e.g. <code className="text-cyan-300 font-mono">{cronicle.storyPrefix || 'story'}_element_id</code>). All mutations made during narrative generation modify only the Working Copy, keeping source templates pristine for other campaigns.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <select
                        value={selectedElementToClone || ''}
                        onChange={(e) => setSelectedElementToClone(e.target.value)}
                        className="flex-1 min-w-[240px] bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none"
                      >
                        <option value="">-- Select Source Element to Clone --</option>
                        {elementsCatalog.map(elem => (
                          <option key={elem.id} value={elem.id}>
                            {elem.title || 'Untitled'} [{elem.type || 'Element'}]
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleCloneSelectedElement}
                        disabled={!selectedElementToClone}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Clone to Story Cronicle</span>
                      </button>
                    </div>
                  </div>

                  {/* Cloned Copies Roster */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.values(workingCopies).map(copy => (
                      <div key={copy.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-purple-300 truncate">
                            {copy.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-slate-950 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-400 rounded uppercase">
                              {copy.type}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteWorkingCopy(copy.id)}
                              className="text-slate-500 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                              title="Discard working copy"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex flex-col gap-0.5">
                          <span>Working ID: <strong className="text-cyan-400">{copy.id}</strong></span>
                          <span>Source ID: {copy.sourceElementId}</span>
                          <span>Cloned: {new Date(copy.clonedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {Object.keys(workingCopies).length === 0 && (
                      <div className="col-span-2 text-center py-10 text-slate-500 italic">
                        No elements have been cloned into this story's working copy library yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* DECK MODE 2: SCRATCHBOOK & AGGREGATED ELEMENTS                   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {deckMode === 'scratchbook' && (
            <div className="h-full flex flex-col space-y-4">

              {/* ── TAB A: COMPILED SCRATCHBOOK DOCUMENT (.MD) ── */}
              {scratchTab === 'scratchbook_doc' && (
                <div className="flex-1 flex flex-col space-y-3 min-h-[500px]">
                  {/* Document Telemetry & Control Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-amber-300 font-bold flex items-center gap-1.5">
                        <FileText size={14} /> Full Scratchbook MD
                      </span>
                      <span className="text-slate-400">
                        Words: <strong className="text-white">{compiledScratchbookMarkdown.split(/\s+/).filter(Boolean).length}</strong>
                      </span>
                      <span className="text-slate-400">
                        Elements: <strong className="text-purple-300">{elementsUsed.length}</strong>
                      </span>
                      <span className="text-slate-400">
                        Scenarios: <strong className="text-cyan-300">{universeState?.scenarios?.length || 0}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyScratchbookMarkdown}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                      >
                        {copiedDoc ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedDoc ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadScratchbook}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download size={12} />
                        <span>Download .md</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScratchTab('scratchbook_notes')}
                        className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Jump to edit GM directives & notes"
                      >
                        <Edit3 size={12} />
                        <span>Edit GM Notes</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Viewport */}
                  <div className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-text scrollbar-thin shadow-inner">
                    {displayedMarkdown}
                  </div>
                </div>
              )}

              {/* ── TAB B: AGGREGATED ELEMENTS CATALOG ── */}
              {scratchTab === 'aggregated_elements' && (
                <div className="flex-1 flex flex-col space-y-4">
                  {/* Search & Type Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shrink-0">
                    <div className="relative flex-1 max-w-md">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={elementSearch}
                        onChange={(e) => setElementSearch(e.target.value)}
                        placeholder="Search elements used by title, type, scenario, or content..."
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                      />
                    </div>

                    {/* Type Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {availableElementTypes.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setElementTypeFilter(t)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                            elementTypeFilter === t
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/80'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setElementTypeFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                          elementTypeFilter === 'ALL'
                            ? 'bg-purple-950 text-purple-300 border border-purple-500/80'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        All ({elementsUsed.length})
                      </button>
                    </div>
                  </div>

                  {/* Elements Grid */}
                  <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                    {filteredElements.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 italic text-xs font-mono bg-slate-950/60 border border-slate-800 rounded-xl">
                        No elements matched your current filter criteria.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {filteredElements.map(el => {
                          const matchingCopy = Object.values(workingCopies).find(
                            c => c.sourceElementId === el.id || c.id === el.id
                          );
                          const isCloned = !!matchingCopy;
                          const isCloningJustNow = clonedFeedback[el.id];

                          return (
                            <div
                              key={el.id}
                              className="p-4 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between gap-3 shadow-sm transition-colors"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-slate-100 text-sm">
                                      {el.title || el.name || 'Untitled Element'}
                                    </h4>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getTypePillStyle(el.type || 'Custom')}`}>
                                      {el.type || 'Custom'}
                                    </span>
                                  </div>

                                  {isCloned ? (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/50 uppercase font-bold flex items-center gap-1 shrink-0">
                                      <Check size={10} className="text-emerald-400" />
                                      Working Copy Active
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleCloneAggregatedElement(el)}
                                      className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 hover:text-white text-[10px] font-mono font-bold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                      title="Clone this lore element into a story-prefixed mutable Working Copy for this campaign"
                                    >
                                      {isCloningJustNow ? (
                                        <>
                                          <Check size={11} className="text-emerald-400" />
                                          <span>Cloned!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={11} />
                                          <span>Clone as Working Copy</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {el.summary && (
                                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                    {el.summary}
                                  </p>
                                )}
                              </div>

                              {/* Footer: Referenced Scenarios and IDs */}
                              <div className="pt-2 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                                <div className="flex items-center gap-1 text-slate-400 flex-wrap">
                                  <span className="text-slate-500 font-bold">Referenced in:</span>
                                  {(el.usedIn && el.usedIn.length > 0) ? (
                                    el.usedIn.map((scene, idx) => (
                                      <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                                        {scene}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-500 italic">General Lore</span>
                                  )}
                                </div>
                                <span className="text-slate-500">
                                  ID: <code className="text-cyan-400">{el.id}</code>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB C: GM SCRATCHPAD & DIRECTIVES (EDITABLE) ── */}
              {scratchTab === 'scratchbook_notes' && (
                <div className="flex-1 flex flex-col space-y-3 min-h-[500px]">
                  {/* Top Editor Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 font-mono">
                        <Edit3 size={14} /> GM Campaign Scratchpad &amp; Directives
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Author running campaign directives, unresolved plot hooks, and rules reminders. These notes are automatically compiled into the Scratchbook and injected into AIME living memory prompts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveScratchNotes}
                        className={`px-4 py-1.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                          isNotesSaved
                            ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        }`}
                      >
                        {isNotesSaved ? <Check size={14} /> : <Save size={14} />}
                        <span>{isNotesSaved ? 'Saved to Story!' : 'Save Notes'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Snippet Insertions */}
                  <div className="flex items-center gap-1.5 flex-wrap p-2 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-mono">
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Quick Snippets:</span>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('### 🎯 Open Plot Hook:\n- Premise:\n- Stakes:\n- Target NPC / Location:\n')}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-amber-300 hover:text-white cursor-pointer transition-colors"
                    >
                      + Plot Hook
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('> ❓ **Open Mystery / Question**: ')}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-purple-300 hover:text-white cursor-pointer transition-colors"
                    >
                      + Open Question
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('> ⚖️ **Tactical Rule / Modifier**: ')}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-cyan-300 hover:text-white cursor-pointer transition-colors"
                    >
                      + Rules Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet('### 📅 Session Recap:\n- Key Milestones Achieved:\n- Casualties / Status Shifts:\n- Unresolved Thread:\n')}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-emerald-300 hover:text-white cursor-pointer transition-colors"
                    >
                      + Session Recap
                    </button>
                  </div>

                  {/* Editable Scratchpad Textarea */}
                  <textarea
                    value={scratchNotes}
                    onChange={(e) => setScratchNotes(e.target.value)}
                    placeholder="Author ongoing GM campaign notes, session recaps, unresolved mystery threads, and tactical rules reminders here..."
                    className="flex-1 w-full p-4 bg-slate-950/90 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed select-text shadow-inner"
                  />

                  {/* Footer Telemetry */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                    <span>
                      Words: <strong className="text-slate-300">{scratchNotes.split(/\s+/).filter(Boolean).length}</strong> • Characters: <strong className="text-slate-300">{scratchNotes.length}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400/90">
                      <Check size={11} /> Auto-synced with compiled Scratchbook &amp; AI co-pilot prompts
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
