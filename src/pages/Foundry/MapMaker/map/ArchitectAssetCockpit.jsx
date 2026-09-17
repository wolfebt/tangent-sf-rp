import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Sliders,
  Target,
  Search,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Heart,
  Activity,
  Cpu,
  Shield,
  Zap,
  Flame,
  Swords,
  User,
  Users,
  Box,
  MapPin,
  Gem,
  FileText,
  Crosshair,
  Sparkles,
  HelpCircle,
  Maximize2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Compass,
  BookOpen
} from 'lucide-react';
import { useCampaign, useStory } from '../../../../context/CampaignContext';
import { useDBM } from '../../../../context/DBMContext';
import { useFolio } from '../../../../context/FolioContext';
import { useEngineStore } from '../../../../engine/index';
import { AudioService } from '../../../../services/audioService';
import { adeElementToStageToken, adeElementToInteractiveObject } from '../../../../utils/storyAssetAdapter';
import { OBJECT_TYPES } from '../../../../services/interactiveObjectService';

export const CONDITION_LIST = [
  { id: 'prone', label: 'Prone', color: 'text-amber-300 border-amber-500/50 bg-amber-950/40' },
  { id: 'stunned', label: 'Stunned', color: 'text-yellow-300 border-yellow-500/50 bg-yellow-950/40' },
  { id: 'bleeding', label: 'Bleeding', color: 'text-rose-400 border-rose-500/50 bg-rose-950/40' },
  { id: 'burning', label: 'Burning', color: 'text-orange-400 border-orange-500/50 bg-orange-950/40' },
  { id: 'blinded', label: 'Blinded', color: 'text-purple-400 border-purple-500/50 bg-purple-950/40' },
  { id: 'restrained', label: 'Restrained', color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40' },
  { id: 'emp_disrupted', label: 'EMP Disrupted', color: 'text-blue-400 border-blue-500/50 bg-blue-950/40' },
  { id: 'panicked', label: 'Panicked', color: 'text-red-400 border-red-500/50 bg-red-950/40' },
  { id: 'trauma', label: 'Trauma', color: 'text-red-500 border-red-600/70 bg-red-950/60' }
];

export const ARCHETYPE_OPTIONS = [
  'Operative',
  'Vanguard',
  'Infiltrator',
  'Heavy',
  'Cyber-Runner',
  'Sniper',
  'Tactician',
  'Psionic',
  'Mecha Pilot',
  'Enforcer',
  'Automaton'
];

export const SPECIES_OPTIONS = [
  'Human',
  'Synthetic',
  'Android',
  'Cyborg',
  'Automaton',
  'Xenotype',
  'Clone',
  'Mutant'
];

export const OBJECT_TYPE_OPTIONS = [
  { id: 'security_terminal', label: 'Security Terminal / Console' },
  { id: 'reinforced_door', label: 'Reinforced Bulkhead / Door' },
  { id: 'blast_door', label: 'Blast Door' },
  { id: 'loot_cache', label: 'Cargo Crate / Loot Cache' },
  { id: 'clue_pad', label: 'Data Pad / Clue' },
  { id: 'trap_emitter', label: 'Hazard / Trap Emitter' },
  { id: 'explosive_canister', label: 'Explosive Canister' },
  { id: 'power_relay', label: 'Power Relay / Node' },
  { id: 'ventilation_grate', label: 'Ventilation Grate' },
  { id: 'elevator_lift', label: 'Elevator Lift' }
];

export const ArchitectAssetCockpit = ({
  tokens = [],
  objects = [],
  currentMap = null,
  activeAssetId = null,
  onSelectAsset,
  onUpdateToken,
  onUpdateObject,
  onDeleteToken,
  onDeleteObject,
  onDuplicateToken,
  onDuplicateObject,
  onDeployAsset,
  onOpenTacticalModal
}) => {
  const { universeState, activeMapId, updateMap } = useCampaign();
  const { elementsCatalog } = useStory();
  const { dbData } = useDBM() || { dbData: {} };
  const { roster, personaRoster, savedPersonas } = useFolio();

  // Internal Cockpit Sub-Tab: 'library' (Asset Library) vs 'inspector' (Selected Asset Edit Details)
  const [cockpitSubTab, setCockpitSubTab] = useState('inspector');
  const [libraryCategory, setLibraryCategory] = useState('all'); // 'all' | 'tokens' | 'objects' | 'story' | 'omnicortex' | 'personas'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Consolidate Map Tokens
  const mapTokens = useMemo(() => {
    const list = tokens && tokens.length > 0 ? tokens : (currentMap?.tokens || []);
    return list.map(t => ({
      ...t,
      _sourceType: 'token',
      _displayCategory: t.is_persona ? 'Persona Token' : (t.type === 'hostile' ? 'Hostile Unit' : (t.type === 'vehicle' ? 'Vehicle' : 'Token')),
      _displayName: t.label || t.name || 'Unit Token',
      _displayImage: t.image_url || t.imageUrl || t.avatar || null,
      _isOnMap: true
    }));
  }, [tokens, currentMap?.tokens]);

  // 2. Consolidate Map Objects
  const mapObjects = useMemo(() => {
    const list = objects && objects.length > 0 ? objects : (currentMap?.objects || []);
    return list.map(o => ({
      ...o,
      _sourceType: 'object',
      _displayCategory: 'Map Object',
      _displayName: o.name || o.label || 'Interactive Object',
      _isOnMap: true
    }));
  }, [objects, currentMap?.objects]);

  // 3. Consolidate ADE Story Elements
  const storyElements = useMemo(() => {
    const list = [...(elementsCatalog || [])];
    const traverseScenarios = (nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach(n => {
        if (n && n.id && !list.some(el => el.id === n.id)) {
          list.push({
            id: n.id,
            title: n.title || n.name || 'Story Node',
            type: n.type || 'Scene',
            summary: n.summary || (n.content ? String(n.content).replace(/<[^>]*>?/gm, '').substring(0, 100) : ''),
            tags: n.tags || 'Scenario'
          });
        }
        if (n && n.children) traverseScenarios(n.children);
      });
    };
    if (universeState?.scenarios) traverseScenarios(universeState.scenarios);

    return list.map(el => ({
      ...el,
      _sourceType: 'story_element',
      _displayCategory: `ADE ${el.type || 'Story'}`,
      _displayName: el.title || el.name || 'Story Asset',
      _displayImage: el.imageUrl || el.image || null,
      _isOnMap: mapTokens.some(t => t.character_doc_id === el.id || t.adeStoryElementId === el.id) ||
                mapObjects.some(o => o.storyElementId === el.id)
    }));
  }, [elementsCatalog, universeState?.scenarios, mapTokens, mapObjects]);

  // 4. Consolidate Omnicortex Items
  const omnicortexItems = useMemo(() => {
    if (!dbData) return [];
    const items = [];
    Object.entries(dbData).forEach(([catKey, catItems]) => {
      if (Array.isArray(catItems)) {
        catItems.forEach(item => {
          if (item && (item.name || item.title)) {
            items.push({
              ...item,
              _sourceType: 'omnicortex',
              _categoryKey: catKey,
              _displayCategory: `Omnicortex (${catKey})`,
              _displayName: item.name || item.title,
              _displayImage: item.imageUrl || item.image || null,
              _isOnMap: false
            });
          }
        });
      }
    });
    return items;
  }, [dbData]);

  // 5. Consolidate Folio Hero Personas
  const folioPersonas = useMemo(() => {
    const list = roster || personaRoster || savedPersonas || [];
    return list.map(p => ({
      ...p,
      _sourceType: 'persona',
      _displayCategory: 'Folio Persona',
      _displayName: p['char-name'] || p.name || 'Operative Persona',
      _displayImage: p.portrait_url || p.avatar || p.image_url || null,
      _isOnMap: mapTokens.some(t => t.character_doc_id === p.id || t.id === p.id)
    }));
  }, [roster, personaRoster, savedPersonas, mapTokens]);

  // Consolidated Library Filter
  const filteredLibraryItems = useMemo(() => {
    let items = [];
    if (libraryCategory === 'all') {
      items = [...mapTokens, ...mapObjects, ...storyElements, ...omnicortexItems, ...folioPersonas];
    } else if (libraryCategory === 'tokens') {
      items = mapTokens;
    } else if (libraryCategory === 'objects') {
      items = mapObjects;
    } else if (libraryCategory === 'story') {
      items = storyElements;
    } else if (libraryCategory === 'omnicortex') {
      items = omnicortexItems;
    } else if (libraryCategory === 'personas') {
      items = folioPersonas;
    }

    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => {
      const name = String(item._displayName || '').toLowerCase();
      const cat = String(item._displayCategory || '').toLowerCase();
      const type = String(item.type || item.objectType || '').toLowerCase();
      const tags = String(item.tags || item.archetype || item.species || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || type.includes(q) || tags.includes(q);
    });
  }, [libraryCategory, mapTokens, mapObjects, storyElements, omnicortexItems, folioPersonas, searchQuery]);

  // Resolve currently selected asset
  const selectedAsset = useMemo(() => {
    if (!activeAssetId) {
      return mapTokens[0] || mapObjects[0] || null;
    }
    // Check map tokens first
    const token = mapTokens.find(t => t.id === activeAssetId);
    if (token) return token;

    // Check map objects
    const obj = mapObjects.find(o => o.id === activeAssetId);
    if (obj) return obj;

    // Check story elements
    const story = storyElements.find(s => s.id === activeAssetId);
    if (story) return story;

    // Check personas
    const persona = folioPersonas.find(p => p.id === activeAssetId);
    if (persona) return persona;

    // Check omnicortex
    const omni = omnicortexItems.find(o => o.id === activeAssetId);
    if (omni) return omni;

    return mapTokens[0] || null;
  }, [activeAssetId, mapTokens, mapObjects, storyElements, folioPersonas, omnicortexItems]);

  // Handlers for Token Updates
  const handleTokenPropertyChange = (field, value) => {
    if (!selectedAsset || selectedAsset._sourceType !== 'token') return;
    const tokenId = selectedAsset.id;
    const updates = { [field]: value };

    if (onUpdateToken) {
      onUpdateToken(tokenId, updates);
    } else if (currentMap && updateMap) {
      const next = (currentMap.tokens || []).map(t => t.id === tokenId ? { ...t, ...updates } : t);
      updateMap(currentMap.id, { tokens: next });
    }

    // Also update EngineStore if available
    try {
      const state = useEngineStore.getState();
      if (state?.updateToken) {
        state.updateToken(tokenId, updates);
      }
    } catch {
      // Ignored if engine store doesn't support
    }
    AudioService.playTerminalBeep(980, 0.02);
  };

  const handleStepTokenStat = (field, delta, min = 0, max = 999) => {
    if (!selectedAsset || selectedAsset._sourceType !== 'token') return;
    const cur = parseInt(selectedAsset[field] ?? (selectedAsset.health?.current ?? 30), 10);
    const nextVal = Math.max(min, Math.min(cur + delta, max));
    handleTokenPropertyChange(field, nextVal);
  };

  const handleToggleCondition = (condId) => {
    if (!selectedAsset || selectedAsset._sourceType !== 'token') return;
    const current = selectedAsset.conditions || [];
    const exists = current.includes(condId);
    const next = exists ? current.filter(c => c !== condId) : [...current, condId];
    handleTokenPropertyChange('conditions', next);
  };

  // Handlers for Object Updates
  const handleObjectPropertyChange = (field, value) => {
    if (!selectedAsset || selectedAsset._sourceType !== 'object') return;
    const objId = selectedAsset.id;
    const updates = { [field]: value };

    if (onUpdateObject) {
      onUpdateObject(objId, updates);
    } else if (currentMap && updateMap) {
      const next = (currentMap.objects || []).map(o => o.id === objId ? { ...o, ...updates } : o);
      updateMap(currentMap.id, { objects: next });
    }
    AudioService.playTerminalBeep(1020, 0.02);
  };

  // Handlers for Deploying Library Assets to the Map
  const handleDeployToStage = (item) => {
    AudioService.playCriticalChime(true);
    const spawnPos = { x: 350 + (Math.random() - 0.5) * 60, y: 350 + (Math.random() - 0.5) * 60 };

    if (item._sourceType === 'story_element') {
      if (onDeployAsset) {
        onDeployAsset(item, spawnPos);
        return;
      }
      if (item.type === 'Persona') {
        const token = adeElementToStageToken(item, spawnPos);
        if (token && currentMap && updateMap) {
          updateMap(currentMap.id, { tokens: [...(currentMap.tokens || []), token] });
          if (onSelectAsset) onSelectAsset(token.id);
        }
      } else {
        const obj = adeElementToInteractiveObject(item, spawnPos);
        if (obj && currentMap && updateMap) {
          updateMap(currentMap.id, { objects: [...(currentMap.objects || []), obj] });
          if (onSelectAsset) onSelectAsset(obj.id);
        }
      }
    } else if (item._sourceType === 'persona') {
      const isSyn = Boolean(item.is_synthetic || String(item['char-species'] || '').toLowerCase().includes('synthetic'));
      const newToken = {
        id: `token-hero-${item.id || Date.now()}-${Math.floor(Math.random() * 1000)}`,
        character_doc_id: item.id,
        name: item['char-name'] || item.name || 'Hero Operative',
        label: item['char-name'] || item.name || 'Hero Operative',
        image_url: item.portrait_url || item.avatar || item.image_url || null,
        base_hp: item.health?.max || 30,
        base_vitality: item.vitality?.max || 25,
        base_health: item.health?.max || 30,
        base_structure: item.structure?.max || 50,
        current_hp: item.health?.current ?? item.health?.max ?? 30,
        current_vitality: item.vitality?.current ?? 25,
        current_structure: item.structure?.current ?? 50,
        armor_dr: item.armor_dr || item['armor-dr']?.kinetic || 6,
        stamina_dr: item.stamina_dr || 2,
        speed_ft: item.speed || 30,
        tech_level: item.tech_level || 3,
        is_synthetic: isSyn,
        type: 'operative',
        species: item['char-species'] || 'Human',
        archetype: item['char-archetype'] || 'Operative',
        is_persona: true,
        x: spawnPos.x,
        y: spawnPos.y
      };
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { tokens: [...(currentMap.tokens || []), newToken] });
        if (onSelectAsset) onSelectAsset(newToken.id);
      }
    } else if (item._sourceType === 'omnicortex') {
      const isSyn = item._categoryKey === 'vehicles' || String(item.name || '').toLowerCase().includes('droid');
      const hp = parseInt(item.hp || item.health || 30, 10);
      const newToken = {
        id: `token-omni-${item.id || Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: item.name || item.title || 'Omnicortex Asset',
        label: item.name || item.title || 'Omnicortex Asset',
        image_url: item.imageUrl || item.image || null,
        base_hp: hp,
        base_vitality: 25,
        base_health: hp,
        base_structure: isSyn ? 60 : 30,
        current_hp: hp,
        current_vitality: 25,
        current_structure: isSyn ? 60 : 30,
        armor_dr: parseInt(item.armor_dr || item.dr || 6, 10),
        stamina_dr: 2,
        speed_ft: 30,
        tech_level: item.tier || 3,
        is_synthetic: isSyn,
        type: item._categoryKey === 'bestiary' ? 'hostile' : (item._categoryKey === 'vehicles' ? 'vehicle' : 'npc'),
        species: item.species || (isSyn ? 'Synthetic' : 'Entity'),
        archetype: item.category || 'Combatant',
        notes: item.description || '',
        x: spawnPos.x,
        y: spawnPos.y
      };
      if (currentMap && updateMap) {
        updateMap(currentMap.id, { tokens: [...(currentMap.tokens || []), newToken] });
        if (onSelectAsset) onSelectAsset(newToken.id);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0f17] text-slate-200 overflow-hidden font-sans select-none">
      {/* Cockpit Mode Switcher Strip */}
      <div className="h-9 px-2 border-b border-slate-800/80 bg-[#090d14] flex items-center justify-between gap-1 shrink-0 z-10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setCockpitSubTab('library');
              AudioService.playTerminalBeep(900, 0.02);
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
              cockpitSubTab === 'library'
                ? 'bg-amber-950/70 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
            title="Browse Asset Library (Story, Map, ADE, Omnicortex)"
          >
            <FolderTree size={12} className={cockpitSubTab === 'library' ? 'text-amber-400' : 'text-slate-500'} />
            <span>ASSET LIBRARY</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCockpitSubTab('inspector');
              AudioService.playTerminalBeep(1100, 0.02);
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
              cockpitSubTab === 'inspector'
                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
            title="Inspect & Edit Current Selected Asset"
          >
            <Sliders size={12} className={cockpitSubTab === 'inspector' ? 'text-cyan-400' : 'text-slate-500'} />
            <span>INSPECTOR</span>
          </button>
        </div>

        {selectedAsset && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 truncate max-w-[110px]" title={selectedAsset._displayName}>
            {selectedAsset._displayName}
          </span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ASSET LIBRARY OF STORY & MAP                                      */}
      {/* ========================================================================= */}
      {cockpitSubTab === 'library' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Search and Category Filter Strip */}
          <div className="p-2 border-b border-slate-800/80 bg-[#0c111a] space-y-2 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter story/map assets, personas, bestiary..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Filter Category Chips */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 text-[9.5px] font-mono">
              {[
                { id: 'all', label: 'All', count: mapTokens.length + mapObjects.length + storyElements.length + omnicortexItems.length + folioPersonas.length },
                { id: 'tokens', label: 'Tokens', count: mapTokens.length },
                { id: 'objects', label: 'Objects', count: mapObjects.length },
                { id: 'story', label: 'ADE Story', count: storyElements.length },
                { id: 'omnicortex', label: 'Omnicortex', count: omnicortexItems.length },
                { id: 'personas', label: 'Folio', count: folioPersonas.length }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setLibraryCategory(cat.id);
                    AudioService.playTerminalBeep(950, 0.01);
                  }}
                  className={`px-2 py-0.5 rounded-full border whitespace-nowrap cursor-pointer transition-all ${
                    libraryCategory === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_6px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
            {filteredLibraryItems.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-slate-500 space-y-1">
                <Box size={24} className="mx-auto text-slate-600 mb-1 opacity-60" />
                <div>No matching assets found</div>
                <div className="text-[10px] text-slate-600">Try adjusting your search query or filter</div>
              </div>
            ) : (
              filteredLibraryItems.map((item, idx) => {
                const isSelected = selectedAsset && (selectedAsset.id === item.id);
                return (
                  <div
                    key={`${item._sourceType}-${item.id || idx}`}
                    onClick={() => {
                      if (onSelectAsset) onSelectAsset(item.id);
                      setCockpitSubTab('inspector');
                      AudioService.playTerminalBeep(1100, 0.02);
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_10px_rgba(34,211,238,0.2)] text-white'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Avatar / Icon */}
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center relative">
                        {item._displayImage ? (
                          <img src={item._displayImage} alt="" className="w-full h-full object-cover" />
                        ) : item._sourceType === 'token' ? (
                          <User size={15} className="text-cyan-400" />
                        ) : item._sourceType === 'object' ? (
                          <Box size={15} className="text-amber-400" />
                        ) : item._sourceType === 'story_element' ? (
                          <BookOpen size={15} className="text-rose-400" />
                        ) : item._sourceType === 'persona' ? (
                          <Users size={15} className="text-purple-400" />
                        ) : (
                          <Sparkles size={15} className="text-emerald-400" />
                        )}
                        {item._isOnMap && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" title="On Stage" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold truncate flex items-center gap-1">
                          <span className="truncate">{item._displayName}</span>
                          {item._isOnMap && (
                            <span className="text-[8px] font-mono px-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                              ON STAGE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans truncate">
                          {item._displayCategory} &bull; {item.type || item.archetype || item.objectType || 'Standard'}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!item._isOnMap && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeployToStage(item);
                          }}
                          className="px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-mono text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="Deploy to Stage Canvas"
                        >
                          <Plus size={11} />
                          <span>DEPLOY</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectAsset) onSelectAsset(item.id);
                          setCockpitSubTab('inspector');
                          AudioService.playTerminalBeep(1100, 0.02);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                        title="Edit Details in Inspector"
                      >
                        <Sliders size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: INSPECTOR & LIVE EDIT FUNCTIONS FOR SELECTED ASSET               */}
      {/* ========================================================================= */}
      {cockpitSubTab === 'inspector' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-2.5 space-y-3 scrollbar-thin">
          {!selectedAsset ? (
            <div className="text-center py-12 text-xs font-mono text-slate-500 space-y-2">
              <Target size={28} className="mx-auto text-slate-600 mb-1 opacity-70" />
              <div className="text-slate-300 font-bold">NO ASSET SELECTED</div>
              <div className="text-[10.5px] max-w-[220px] mx-auto text-slate-500">
                Click any token or interactive object on The Stage, or select an asset from the Asset Library.
              </div>
              <button
                type="button"
                onClick={() => setCockpitSubTab('library')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FolderTree size={13} />
                <span>OPEN ASSET LIBRARY</span>
              </button>
            </div>
          ) : (
            <>
              {/* Asset Identity Card Header */}
              <div className="p-2.5 rounded-xl bg-[#0e131d] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                    selectedAsset._sourceType === 'token'
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
                      : selectedAsset._sourceType === 'object'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                      : selectedAsset._sourceType === 'persona'
                      ? 'bg-purple-950/60 text-purple-300 border-purple-500/50'
                      : selectedAsset._sourceType === 'story_element'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                  }`}>
                    {selectedAsset._displayCategory || selectedAsset._sourceType}
                  </span>

                  <div className="flex items-center gap-1">
                    {selectedAsset._sourceType === 'token' && (
                      <button
                        type="button"
                        onClick={() => handleTokenPropertyChange('is_hidden', !selectedAsset.is_hidden)}
                        className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                          selectedAsset.is_hidden
                            ? 'text-red-400 bg-red-950/60 border border-red-500/50'
                            : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                        }`}
                        title={selectedAsset.is_hidden ? "Hidden from Players (Click to Reveal)" : "Visible to Players (Click to Hide)"}
                      >
                        {selectedAsset.is_hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}

                    {onOpenTacticalModal && (selectedAsset._sourceType === 'token' || selectedAsset._sourceType === 'persona') && (
                      <button
                        type="button"
                        onClick={() => onOpenTacticalModal(selectedAsset)}
                        className="p-1 rounded text-purple-400 hover:text-purple-200 hover:bg-purple-950/60 border border-purple-800/40 transition-colors"
                        title="Launch Full Folio Tactical Play Sheet"
                      >
                        <ExternalLink size={13} />
                      </button>
                    )}

                    {selectedAsset._isOnMap && onDuplicateToken && selectedAsset._sourceType === 'token' && (
                      <button
                        type="button"
                        onClick={() => onDuplicateToken(selectedAsset.id)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                        title="Duplicate Token on Stage"
                      >
                        <Copy size={13} />
                      </button>
                    )}

                    {selectedAsset._isOnMap && onDeleteToken && selectedAsset._sourceType === 'token' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete token "${selectedAsset._displayName}" from Stage?`)) {
                            onDeleteToken(selectedAsset.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40"
                        title="Remove Token from Stage"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    {selectedAsset._isOnMap && onDeleteObject && selectedAsset._sourceType === 'object' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete object "${selectedAsset._displayName}" from Stage?`)) {
                            onDeleteObject(selectedAsset.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40"
                        title="Remove Object from Stage"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Name & Avatar Row */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center relative">
                    {selectedAsset._displayImage ? (
                      <img src={selectedAsset._displayImage} alt="" className="w-full h-full object-cover" />
                    ) : selectedAsset._sourceType === 'token' ? (
                      <User size={18} className="text-cyan-400" />
                    ) : selectedAsset._sourceType === 'object' ? (
                      <Box size={18} className="text-amber-400" />
                    ) : (
                      <Sparkles size={18} className="text-purple-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-0.5">
                      Asset Label / Name
                    </label>
                    <input
                      type="text"
                      value={selectedAsset._displayName || selectedAsset.name || selectedAsset.label || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (selectedAsset._sourceType === 'token') {
                          handleTokenPropertyChange('name', val);
                          handleTokenPropertyChange('label', val);
                        } else if (selectedAsset._sourceType === 'object') {
                          handleObjectPropertyChange('name', val);
                          handleObjectPropertyChange('label', val);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500/60"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* SUB-PANEL: MAP TOKEN / PERSONA EDIT CONTROLS                        */}
              {/* =================================================================== */}
              {(selectedAsset._sourceType === 'token' || selectedAsset._sourceType === 'persona') && (
                <div className="space-y-3">
                  {/* Survival & Vitals Pool Steppers */}
                  <div className="p-2.5 rounded-xl bg-[#0e131d] border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 flex items-center gap-1">
                        <Activity size={12} className="text-cyan-400" />
                        SURVIVAL & VITALS POOLS
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleTokenPropertyChange('current_hp', selectedAsset.base_hp || selectedAsset.health?.max || 30);
                            handleTokenPropertyChange('current_vitality', selectedAsset.base_vitality || selectedAsset.vitality?.max || 25);
                            handleTokenPropertyChange('current_structure', selectedAsset.base_structure || selectedAsset.structure?.max || 50);
                            AudioService.playCriticalChime(true);
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 cursor-pointer"
                          title="Full Restore HP / Vitality / Structure"
                        >
                          RESTORE
                        </button>
                      </div>
                    </div>

                    {/* Health (HP) Pool */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-rose-400 flex items-center gap-1">
                          <Heart size={10} /> Health (Lethal HP):
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={selectedAsset.current_hp ?? selectedAsset.health?.current ?? selectedAsset.hp ?? 30}
                            onChange={(e) => handleTokenPropertyChange('current_hp', parseInt(e.target.value || 0, 10))}
                            className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-rose-200 font-bold"
                          />
                          <span className="text-slate-500">/</span>
                          <input
                            type="number"
                            value={selectedAsset.base_hp ?? selectedAsset.health?.max ?? selectedAsset.maxHp ?? 30}
                            onChange={(e) => handleTokenPropertyChange('base_hp', parseInt(e.target.value || 0, 10))}
                            className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-slate-300"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepTokenStat('current_hp', -5)}
                          className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-rose-400 cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepTokenStat('current_hp', -1)}
                          className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-rose-400 cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepTokenStat('current_hp', 1)}
                          className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-emerald-400 cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepTokenStat('current_hp', 5)}
                          className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-emerald-400 cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    {/* Vitality (Buffer VP) Pool */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Activity size={10} /> Vitality (Buffer VP):
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={selectedAsset.current_vitality ?? selectedAsset.vitality?.current ?? 25}
                            onChange={(e) => handleTokenPropertyChange('current_vitality', parseInt(e.target.value || 0, 10))}
                            className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-cyan-200 font-bold"
                          />
                          <span className="text-slate-500">/</span>
                          <input
                            type="number"
                            value={selectedAsset.base_vitality ?? selectedAsset.vitality?.max ?? 25}
                            onChange={(e) => handleTokenPropertyChange('base_vitality', parseInt(e.target.value || 0, 10))}
                            className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-slate-300"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepTokenStat('current_vitality', -5)}
                          className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-cyan-400 cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepTokenStat('current_vitality', -1)}
                          className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-cyan-400 cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepTokenStat('current_vitality', 1)}
                          className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-emerald-400 cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepTokenStat('current_vitality', 5)}
                          className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-emerald-400 cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    {/* Structure (SP) Pool for synthetics/vehicles */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-amber-400 flex items-center gap-1">
                          <Cpu size={10} /> Structure (Mech / Syn SP):
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={selectedAsset.current_structure ?? selectedAsset.structure?.current ?? 50}
                            onChange={(e) => handleTokenPropertyChange('current_structure', parseInt(e.target.value || 0, 10))}
                            className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-amber-200 font-bold"
                          />
                          <span className="text-slate-500">/</span>
                          <input
                            type="number"
                            value={selectedAsset.base_structure ?? selectedAsset.structure?.max ?? 50}
                            onChange={(e) => handleTokenPropertyChange('base_structure', parseInt(e.target.value || 0, 10))}
                            className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Defensive Quick Stats Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                    <div className="p-1.5 rounded-lg bg-[#0e131d] border border-slate-800 flex flex-col items-center">
                      <span className="text-slate-500 text-[9px]">ARMOR DR</span>
                      <input
                        type="number"
                        value={selectedAsset.armor_dr ?? selectedAsset.armorDr ?? 6}
                        onChange={(e) => handleTokenPropertyChange('armor_dr', parseInt(e.target.value || 0, 10))}
                        className="w-10 text-center font-bold text-cyan-300 bg-transparent border-b border-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#0e131d] border border-slate-800 flex flex-col items-center">
                      <span className="text-slate-500 text-[9px]">STA SOAK</span>
                      <input
                        type="number"
                        value={selectedAsset.stamina_dr ?? selectedAsset.staminaDr ?? 2}
                        onChange={(e) => handleTokenPropertyChange('stamina_dr', parseInt(e.target.value || 0, 10))}
                        className="w-10 text-center font-bold text-emerald-400 bg-transparent border-b border-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#0e131d] border border-slate-800 flex flex-col items-center">
                      <span className="text-slate-500 text-[9px]">SPEED (FT)</span>
                      <input
                        type="number"
                        value={selectedAsset.speed_ft ?? selectedAsset.speed ?? 30}
                        onChange={(e) => handleTokenPropertyChange('speed_ft', parseInt(e.target.value || 0, 10))}
                        className="w-10 text-center font-bold text-amber-300 bg-transparent border-b border-slate-800 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#0e131d] border border-slate-800 flex flex-col items-center">
                      <span className="text-slate-500 text-[9px]">TECH LVL</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={selectedAsset.tech_level ?? selectedAsset.techLevel ?? 3}
                        onChange={(e) => handleTokenPropertyChange('tech_level', parseInt(e.target.value || 1, 10))}
                        className="w-10 text-center font-bold text-sky-300 bg-transparent border-b border-slate-800 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Archetype, Species, and Alignment Options */}
                  <div className="p-2.5 rounded-xl bg-[#0e131d] border border-slate-800 space-y-2 text-xs font-mono">
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <Shield size={12} className="text-amber-400" />
                      IDENTITY & CLASSIFICATION
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Archetype</label>
                        <select
                          value={selectedAsset?.archetype || ARCHETYPE_OPTIONS[0]}
                          onChange={(e) => handleTokenPropertyChange('archetype', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-amber-500/60"
                        >
                          {!ARCHETYPE_OPTIONS.includes(selectedAsset?.archetype) && selectedAsset?.archetype && (
                            <option value={selectedAsset.archetype}>{selectedAsset.archetype}</option>
                          )}
                          {ARCHETYPE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Species / Form</label>
                        <select
                          value={selectedAsset?.species || SPECIES_OPTIONS[0]}
                          onChange={(e) => handleTokenPropertyChange('species', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-amber-500/60"
                        >
                          {!SPECIES_OPTIONS.includes(selectedAsset?.species) && selectedAsset?.species && (
                            <option value={selectedAsset.species}>{selectedAsset.species}</option>
                          )}
                          {SPECIES_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Unit Alignment / Category</label>
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        {[
                          { id: 'operative', label: 'Operative', color: 'text-cyan-300 border-cyan-500/50 bg-cyan-950/40' },
                          { id: 'npc', label: 'NPC / Ally', color: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40' },
                          { id: 'hostile', label: 'Hostile', color: 'text-rose-400 border-rose-500/50 bg-rose-950/40' },
                          { id: 'construct', label: 'Construct', color: 'text-amber-300 border-amber-500/50 bg-amber-950/40' },
                          { id: 'vehicle', label: 'Vehicle', color: 'text-blue-300 border-blue-500/50 bg-blue-950/40' }
                        ].map(al => (
                          <button
                            key={al.id}
                            type="button"
                            onClick={() => handleTokenPropertyChange('type', al.id)}
                            className={`py-1 rounded border text-center transition-all cursor-pointer ${
                              (selectedAsset.type || 'operative') === al.id
                                ? al.color
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {al.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Conditions Matrix */}
                  <div className="p-2.5 rounded-xl bg-[#0e131d] border border-slate-800 space-y-2 text-xs font-mono">
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <Flame size={12} className="text-orange-400" />
                      STATUS CONDITIONS MATRIX
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {CONDITION_LIST.map(cond => {
                        const hasCond = (selectedAsset.conditions || []).includes(cond.id);
                        return (
                          <button
                            key={cond.id}
                            type="button"
                            onClick={() => handleToggleCondition(cond.id)}
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-mono transition-all cursor-pointer ${
                              hasCond
                                ? cond.color
                                : 'bg-slate-950/70 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {cond.label} {hasCond && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* GM Notes & Intel */}
                  <div className="p-2.5 rounded-xl bg-[#0e131d] border border-slate-800 space-y-1.5 text-xs font-mono">
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <FileText size={12} className="text-amber-400" />
                      TACTICAL NOTES & GM INTEL
                    </span>
                    <textarea
                      value={selectedAsset.notes || selectedAsset.dialogueHook || selectedAsset.storySummary || ''}
                      onChange={(e) => handleTokenPropertyChange('notes', e.target.value)}
                      placeholder="Secret behavioral routines, tactical tactics, inventory, special abilities..."
                      className="w-full h-20 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none scrollbar-thin"
                    />
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* SUB-PANEL: MAP INTERACTIVE OBJECT EDIT CONTROLS                     */}
              {/* =================================================================== */}
              {selectedAsset._sourceType === 'object' && (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-[#0e131d] border border-slate-800 space-y-2 text-xs font-mono">
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <Box size={12} className="text-amber-400" />
                      INTERACTIVE OBJECT SETTINGS
                    </span>

                    {/* Object Type Selector */}
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Object Prototype</label>
                      <select
                        value={selectedAsset?.objectType || selectedAsset?.type || OBJECT_TYPE_OPTIONS[0].id}
                        onChange={(e) => handleObjectPropertyChange('objectType', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/60"
                      >
                        {!OBJECT_TYPE_OPTIONS.some(opt => opt.id === (selectedAsset?.objectType || selectedAsset?.type)) && (selectedAsset?.objectType || selectedAsset?.type) && (
                          <option value={selectedAsset?.objectType || selectedAsset?.type}>
                            {selectedAsset?.objectType || selectedAsset?.type}
                          </option>
                        )}
                        {OBJECT_TYPE_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Interactive State Controls */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleObjectPropertyChange('isOpen', !selectedAsset.isOpen)}
                        className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
                          selectedAsset.isOpen
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{selectedAsset.isOpen ? 'OPEN' : 'CLOSED'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleObjectPropertyChange('isLocked', !selectedAsset.isLocked)}
                        className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
                          selectedAsset.isLocked
                            ? 'bg-red-950/60 text-red-300 border-red-500/50'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                        }`}
                      >
                        {selectedAsset.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        <span>{selectedAsset.isLocked ? 'LOCKED' : 'UNLOCKED'}</span>
                      </button>
                    </div>

                    {/* Security DC Checks */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Physical Lock DC</label>
                        <input
                          type="number"
                          value={selectedAsset.lockDc ?? selectedAsset.lock_dc ?? 14}
                          onChange={(e) => handleObjectPropertyChange('lockDc', parseInt(e.target.value || 10, 10))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-500/60"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Cyber Hack DC</label>
                        <input
                          type="number"
                          value={selectedAsset.hackDc ?? selectedAsset.hack_dc ?? 15}
                          onChange={(e) => handleObjectPropertyChange('hackDc', parseInt(e.target.value || 10, 10))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-500/60"
                        />
                      </div>
                    </div>

                    {/* Keycode requirement */}
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Required Keycode / Passkey</label>
                      <input
                        type="text"
                        value={selectedAsset.requiredKeyId || ''}
                        onChange={(e) => handleObjectPropertyChange('requiredKeyId', e.target.value)}
                        placeholder="e.g. key_bridge_alpha, biometric_gm..."
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
                      />
                    </div>

                    {/* Durability HP */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Structure HP</label>
                        <input
                          type="number"
                          value={selectedAsset.structure ?? selectedAsset.maxStructure ?? 30}
                          onChange={(e) => handleObjectPropertyChange('structure', parseInt(e.target.value || 1, 10))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-amber-200 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block mb-0.5">Armor DR</label>
                        <input
                          type="number"
                          value={selectedAsset.armorDr ?? 8}
                          onChange={(e) => handleObjectPropertyChange('armorDr', parseInt(e.target.value || 0, 10))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-cyan-300 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* SUB-PANEL: ADE STORY ELEMENT / OMNICORTEX DETAILS                   */}
              {/* =================================================================== */}
              {(selectedAsset._sourceType === 'story_element' || selectedAsset._sourceType === 'omnicortex') && (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-[#0e131d] border border-slate-800 space-y-2 text-xs font-mono">
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <Sparkles size={12} className="text-rose-400" />
                      {selectedAsset._sourceType === 'story_element' ? 'ADE STORY NARRATIVE' : 'OMNICORTEX CODEX RULES'}
                    </span>

                    <div className="text-xs text-slate-300 font-sans leading-relaxed p-2 rounded bg-slate-950 border border-slate-800/80">
                      {selectedAsset.summary || selectedAsset.description || selectedAsset.effect || selectedAsset.content || 'No description provided.'}
                    </div>

                    {selectedAsset.tags && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Tags: <span className="text-amber-300">{Array.isArray(selectedAsset.tags) ? selectedAsset.tags.join(', ') : selectedAsset.tags}</span>
                      </div>
                    )}

                    {!selectedAsset._isOnMap && (
                      <button
                        type="button"
                        onClick={() => handleDeployToStage(selectedAsset)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer mt-2"
                      >
                        <Plus size={14} />
                        <span>DEPLOY ASSET TO STAGE</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchitectAssetCockpit;
