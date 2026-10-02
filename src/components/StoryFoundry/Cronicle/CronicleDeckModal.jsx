import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Globe, 
  Brain, 
  Copy, 
  Download, 
  Upload, 
  Check, 
  X, 
  Sparkles,
  FileText,
  Boxes,
  FileCode,
  Clock,
  Edit3,
  Activity
} from 'lucide-react';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { formatCronicleContextForAIME } from '../../../services/cronicleService';
import { generateStoryScratchbook, findElementsUsed } from '../../../pages/Foundry/StoryModule/scratchbookService';
import { useToast } from '../../../context/ToastContext';

// Extracted Sub-Tabs
import CronicleWorkingMemoryTab from './tabs/CronicleWorkingMemoryTab';
import CroniclePersonasTab from './tabs/CroniclePersonasTab';
import CronicleWorldTab from './tabs/CronicleWorldTab';
import CronicleTimelineTab from './tabs/CronicleTimelineTab';
import CronicleDeltaReviewTab from './tabs/CronicleDeltaReviewTab';
import CronicleWorkingCopiesTab from './tabs/CronicleWorkingCopiesTab';
import CronicleScratchbookDocTab from './tabs/CronicleScratchbookDocTab';
import CronicleAggregatedElementsTab from './tabs/CronicleAggregatedElementsTab';
import CronicleScratchbookNotesTab from './tabs/CronicleScratchbookNotesTab';

export default function CronicleDeckModal({ 
  isOpen, 
  onClose, 
  initialMode = 'living_memory',
  initialTab = null,
  beats = [] 
}) {
  const { toast } = useToast();
  const {
    universeState,
    elementsCatalog = [],
    cronicle,
    updateCronicle,
    updateWorkingMemory,
    applyCronicleDelta,
    acceptPendingDelta,
    rejectPendingDelta,
    acceptAllPendingDeltas,
    clearPendingDeltas,
    cloneElementToCronicle,
    updateCreativeState,
    triggerStorySave
  } = useStory();

  // ── MASTER DECK MODE: 'living_memory' | 'scratchbook' ──
  const [deckMode, setDeckMode] = useState(initialMode);

  // Active sub-tabs per deck mode
  // living_memory: 'working_memory' | 'deltas' | 'personas' | 'world' | 'timeline' | 'working_copies'
  const [memoryTab, setMemoryTab] = useState('working_memory');
  // scratchbook: 'scratchbook_doc' | 'aggregated_elements' | 'scratchbook_notes'
  const [scratchTab, setScratchTab] = useState('scratchbook_doc');

  // Synchronize mode/tab if passed or modal re-opens
  useEffect(() => {
    if (initialMode) {
      setDeckMode(initialMode);
    }
    if (initialTab) {
      if (['working_memory', 'deltas', 'personas', 'world', 'timeline', 'working_copies'].includes(initialTab)) {
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

  const pendingDeltas = cronicle?.pendingDeltas || [];

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
    const prefix = cronicle?.storyPrefix || 'story';
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
    const prefix = cronicle?.storyPrefix || 'story';
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
    a.setAttribute("download", `${cronicle?.storyPrefix || 'story'}_CRONICLE.json`);
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
          toast({ type: 'success', text: "CRONICLE state successfully imported!" });
        } else {
          toast({ type: 'error', text: "Invalid CRONICLE JSON format." });
        }
      } catch (err) {
        toast({ type: 'error', text: "Failed to parse JSON file." });
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
                  Story Prefix: {cronicle?.storyPrefix || 'story'}
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
              <Upload size={12} className="text-cyan-400" />
              <span className="hidden md:inline">Import</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── MASTER DECK SWITCHER ── */}
        <div className="px-5 py-2.5 bg-[#0e131f] border-b border-slate-800 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setDeckMode('living_memory')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              deckMode === 'living_memory'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Brain size={14} />
            <span>Living Memory Deck</span>
          </button>

          <button
            type="button"
            onClick={() => setDeckMode('scratchbook')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              deckMode === 'scratchbook'
                ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>Story Scratchbook &amp; Elements</span>
          </button>
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
                <span>Working Memory</span>
              </button>

              <button
                type="button"
                onClick={() => setMemoryTab('deltas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  memoryTab === 'deltas'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Activity size={13} />
                <span>Pending Deltas ({pendingDeltas.length})</span>
                {pendingDeltas.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
                )}
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
                <span>Timeline ({timeline.length})</span>
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
                <span>Working Copies ({Object.keys(workingCopies).length})</span>
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
                <span>Compiled Scratchbook (.md)</span>
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
                <span>Aggregated Elements ({elementsUsed.length})</span>
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
                <span>GM Directives &amp; Notes</span>
              </button>
            </>
          )}

        </div>

        {/* ── MAIN CONTENT VIEWPORT ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {deckMode === 'living_memory' && (
            <>
              {memoryTab === 'working_memory' && (
                <CronicleWorkingMemoryTab
                  workingMemory={workingMemory}
                  updateWorkingMemory={updateWorkingMemory}
                  locations={locations}
                  personas={personas}
                  contextPreview={contextPreview}
                />
              )}

              {memoryTab === 'deltas' && (
                <CronicleDeltaReviewTab
                  pendingDeltas={pendingDeltas}
                  acceptPendingDelta={acceptPendingDelta}
                  rejectPendingDelta={rejectPendingDelta}
                  acceptAllPendingDeltas={acceptAllPendingDeltas}
                  clearPendingDeltas={clearPendingDeltas}
                />
              )}

              {memoryTab === 'personas' && (
                <CroniclePersonasTab
                  personas={personas}
                  newPersonaName={newPersonaName}
                  setNewPersonaName={setNewPersonaName}
                  newPersonaRole={newPersonaRole}
                  setNewPersonaRole={setNewPersonaRole}
                  handleCreatePersona={handleCreatePersona}
                  handleDeletePersona={handleDeletePersona}
                  applyCronicleDelta={applyCronicleDelta}
                  traitInputs={traitInputs}
                  setTraitInputs={setTraitInputs}
                  inventoryInputs={inventoryInputs}
                  setInventoryInputs={setInventoryInputs}
                  handleAddPersonaTrait={handleAddPersonaTrait}
                  handleRemovePersonaTrait={handleRemovePersonaTrait}
                  handleAddInventoryItem={handleAddInventoryItem}
                  handleRemoveInventoryItem={handleRemoveInventoryItem}
                  handleUpdateRelationship={handleUpdateRelationship}
                />
              )}

              {memoryTab === 'world' && (
                <CronicleWorldTab
                  locations={locations}
                  personas={personas}
                  newLocationName={newLocationName}
                  setNewLocationName={setNewLocationName}
                  newLocationState={newLocationState}
                  setNewLocationState={setNewLocationState}
                  newLocationFaction={newLocationFaction}
                  setNewLocationFaction={setNewLocationFaction}
                  handleCreateLocation={handleCreateLocation}
                  handleDeleteLocation={handleDeleteLocation}
                  applyCronicleDelta={applyCronicleDelta}
                  hazardInputs={hazardInputs}
                  setHazardInputs={setHazardInputs}
                  handleAddHazard={handleAddHazard}
                  handleRemoveHazard={handleRemoveHazard}
                />
              )}

              {memoryTab === 'timeline' && (
                <CronicleTimelineTab
                  timeline={timeline}
                  newTimelineTitle={newTimelineTitle}
                  setNewTimelineTitle={setNewTimelineTitle}
                  newTimelineSummary={newTimelineSummary}
                  setNewTimelineSummary={setNewTimelineSummary}
                  newTimelineEntities={newTimelineEntities}
                  setNewTimelineEntities={setNewTimelineEntities}
                  handleAddTimelineEvent={handleAddTimelineEvent}
                  handleDeleteTimelineEvent={handleDeleteTimelineEvent}
                />
              )}

              {memoryTab === 'working_copies' && (
                <CronicleWorkingCopiesTab
                  workingCopies={workingCopies}
                  elementsCatalog={elementsCatalog}
                  storyPrefix={cronicle?.storyPrefix}
                  selectedElementToClone={selectedElementToClone}
                  setSelectedElementToClone={setSelectedElementToClone}
                  handleCloneSelectedElement={handleCloneSelectedElement}
                  handleDeleteWorkingCopy={handleDeleteWorkingCopy}
                />
              )}
            </>
          )}

          {deckMode === 'scratchbook' && (
            <div className="h-full flex flex-col space-y-4">
              {scratchTab === 'scratchbook_doc' && (
                <CronicleScratchbookDocTab
                  compiledScratchbookMarkdown={compiledScratchbookMarkdown}
                  displayedMarkdown={displayedMarkdown}
                  elementsCount={elementsUsed.length}
                  scenariosCount={universeState?.scenarios?.length || 0}
                  copiedDoc={copiedDoc}
                  handleCopyScratchbookMarkdown={handleCopyScratchbookMarkdown}
                  handleDownloadScratchbook={handleDownloadScratchbook}
                  onNavigateToNotes={() => setScratchTab('scratchbook_notes')}
                />
              )}

              {scratchTab === 'aggregated_elements' && (
                <CronicleAggregatedElementsTab
                  elementsUsed={elementsUsed}
                  elementSearch={elementSearch}
                  setElementSearch={setElementSearch}
                  elementTypeFilter={elementTypeFilter}
                  setElementTypeFilter={setElementTypeFilter}
                  availableElementTypes={availableElementTypes}
                  filteredElements={filteredElements}
                  workingCopies={workingCopies}
                  clonedFeedback={clonedFeedback}
                  handleCloneAggregatedElement={handleCloneAggregatedElement}
                />
              )}

              {scratchTab === 'scratchbook_notes' && (
                <CronicleScratchbookNotesTab
                  scratchNotes={scratchNotes}
                  setScratchNotes={setScratchNotes}
                  isNotesSaved={isNotesSaved}
                  handleSaveScratchNotes={handleSaveScratchNotes}
                  handleInsertSnippet={handleInsertSnippet}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
