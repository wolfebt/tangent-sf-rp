/**
 * @file StoryGallery.jsx
 * @description Master Story Gallery for ADE & VTT.
 * The central location where all story assets reside:
 * - Story Elements (Personas, Items, Factions, Lore, Handouts)
 * - Tactical Maps (Sectors, Arenas, Battlemaps)
 * - Temporary & Situational Modifiers (Metaphysic, Tech, Environmental, Tactical)
 *   sourced from persons, items, or locations within the gallery.
 */

import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Map as MapIcon, 
  Sliders, 
  Plus, 
  Sparkles, 
  Trash2, 
  Play, 
  Cpu, 
  Shield, 
  Swords, 
  Flame, 
  Clock, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import ElementForge from '../../ElementForge/ElementForge';
import { useStory } from '../../../../context/CampaignContext';
import { AudioService } from '../../../../services/audioService';
import { ModifierService, MODIFIER_PRESETS } from '../../../../services/modifierService';
import { useNavigate } from 'react-router-dom';

export const StoryGallery = ({ onBackToStory, onOpenCompiler }) => {
  const navigate = useNavigate();
  const { 
    universeState, 
    elementsCatalog, 
    mapsCatalog, 
    galleryModifiers = [],
    addGalleryModifier,
    updateGalleryModifier,
    deleteGalleryModifier,
    toggleGalleryModifier,
    setActiveMapId
  } = useStory();

  const [activeTab, setActiveTab] = useState('elements'); // 'elements' | 'maps' | 'modifiers'
  const [modifierFilterCategory, setModifierFilterCategory] = useState('all');
  const [isNewModifierModalOpen, setIsNewModifierModalOpen] = useState(false);

  // New Modifier Form State
  const [modName, setModName] = useState('');
  const [modCategory, setModCategory] = useState('metaphysic');
  const [modSourceType, setModSourceType] = useState('story');
  const [modSourceId, setModSourceId] = useState('');
  const [modSourceName, setModSourceName] = useState('');
  const [modDescription, setModDescription] = useState('');
  const [modIsTemporary, setModIsTemporary] = useState(false);
  const [modDurationRounds, setModDurationRounds] = useState(3);
  const [modTargetScope, setModTargetScope] = useState('all');
  const [modAttackMod, setModAttackMod] = useState(0);
  const [modDefenseMod, setModDefenseMod] = useState(0);
  const [modDamageMod, setModDamageMod] = useState(0);
  const [modMetaphysicMod, setModMetaphysicMod] = useState(0);
  const [modTechMod, setModTechMod] = useState(0);
  const [modSpeedMod, setModSpeedMod] = useState(0);
  const [modCustomRule, setModCustomRule] = useState('');

  // Combined Maps from universe and catalog
  const allMaps = useMemo(() => {
    const list = [...(universeState?.maps || []), ...(mapsCatalog || [])];
    const unique = new Map();
    list.forEach(m => {
      if (m && m.id && !unique.has(m.id)) unique.set(m.id, m);
    });
    return Array.from(unique.values());
  }, [universeState?.maps, mapsCatalog]);

  // Gallery Personas & Items for source derivation
  const galleryPersonas = useMemo(() => {
    return (elementsCatalog || []).filter(e => e.type === 'Persona');
  }, [elementsCatalog]);

  const galleryItems = useMemo(() => {
    return (elementsCatalog || []).filter(e => e.type === 'Item');
  }, [elementsCatalog]);

  // Filtered Modifiers
  const filteredModifiers = useMemo(() => {
    if (modifierFilterCategory === 'all') return galleryModifiers;
    return galleryModifiers.filter(m => m.category === modifierFilterCategory);
  }, [galleryModifiers, modifierFilterCategory]);

  const handleApplyPreset = (preset) => {
    AudioService.playTerminalBeep(1200, 0.03);
    setModName(preset.name);
    setModCategory(preset.category);
    setModSourceType(preset.sourceType);
    setModDescription(preset.description);
    setModIsTemporary(preset.isTemporary);
    setModDurationRounds(preset.durationRounds || 3);
    setModTargetScope(preset.targetScope);
    setModAttackMod(preset.effects?.attackMod || 0);
    setModDefenseMod(preset.effects?.defenseMod || 0);
    setModDamageMod(preset.effects?.damageMod || 0);
    setModMetaphysicMod(preset.effects?.metaphysicMod || 0);
    setModTechMod(preset.effects?.techMod || 0);
    setModSpeedMod(preset.effects?.speedMod || 0);
    setModCustomRule(preset.effects?.customRuleText || '');
  };

  const handleSourceSelect = (type, id) => {
    setModSourceType(type);
    setModSourceId(id);
    if (type === 'person') {
      const p = galleryPersonas.find(e => e.id === id);
      if (p) {
        setModSourceName(p.fields?.['char-name'] || p.title || 'Operative');
        const derived = ModifierService.createModifierFromPerson(p);
        setModName(derived.name);
        setModCategory(derived.category);
        setModDescription(derived.description);
        setModAttackMod(derived.effects?.attackMod || 0);
        setModMetaphysicMod(derived.effects?.metaphysicMod || 0);
        setModTechMod(derived.effects?.techMod || 0);
      }
    } else if (type === 'item') {
      const itm = galleryItems.find(e => e.id === id);
      if (itm) {
        setModSourceName(itm.title || 'Device');
        const derived = ModifierService.createModifierFromItem(itm);
        setModName(derived.name);
        setModCategory(derived.category);
        setModDescription(derived.description);
        setModMetaphysicMod(derived.effects?.metaphysicMod || 0);
        setModDefenseMod(derived.effects?.defenseMod || 0);
      }
    } else if (type === 'location') {
      const loc = allMaps.find(m => m.id === id);
      if (loc) {
        setModSourceName(loc.title || 'Tactical Sector');
        const derived = ModifierService.createModifierFromLocation(loc);
        setModName(derived.name);
        setModCategory(derived.category);
        setModDescription(derived.description);
        setModAttackMod(derived.effects?.attackMod || 0);
      }
    }
  };

  const handleSaveModifier = (e) => {
    e.preventDefault();
    if (!modName.trim()) return;
    AudioService.playTerminalBeep(1400, 0.04);

    const newMod = ModifierService.createModifier({
      name: modName.trim(),
      category: modCategory,
      sourceType: modSourceType,
      sourceId: modSourceId || undefined,
      sourceName: modSourceName || undefined,
      description: modDescription.trim(),
      isTemporary: modIsTemporary,
      durationRounds: modIsTemporary ? parseInt(modDurationRounds, 10) || 3 : null,
      remainingRounds: modIsTemporary ? parseInt(modDurationRounds, 10) || 3 : null,
      targetScope: modTargetScope,
      isActive: true,
      effects: {
        attackMod: parseInt(modAttackMod, 10) || 0,
        defenseMod: parseInt(modDefenseMod, 10) || 0,
        damageMod: parseInt(modDamageMod, 10) || 0,
        metaphysicMod: parseInt(modMetaphysicMod, 10) || 0,
        techMod: parseInt(modTechMod, 10) || 0,
        speedMod: parseInt(modSpeedMod, 10) || 0,
        customRuleText: modCustomRule.trim()
      }
    });

    addGalleryModifier(newMod);
    setIsNewModifierModalOpen(false);

    // Reset form
    setModName('');
    setModDescription('');
    setModAttackMod(0);
    setModDefenseMod(0);
    setModMetaphysicMod(0);
    setModTechMod(0);
    setModCustomRule('');
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'metaphysic':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50';
      case 'tech':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
      case 'environmental':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      case 'tactical':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col bg-[#070b12] text-slate-200 select-none font-sans overflow-hidden">
      {/* Top Gallery Header Bar */}
      <header className="h-12 shrink-0 bg-[#0a0f18]/95 border-b border-slate-800 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Box size={16} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300 flex items-center gap-2">
              <span>THE GALLERY</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Story Asset Repository
              </span>
            </h2>
          </div>
        </div>

        {/* Pillar Switcher Tabs: Elements | Maps | Modifiers */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveTab('elements');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'elements'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box size={12} />
            <span>Elements</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {elementsCatalog?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveTab('maps');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'maps'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon size={12} />
            <span>Tactical Maps</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {allMaps.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setActiveTab('modifiers');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'modifiers'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={12} />
            <span>Situational Modifiers</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {galleryModifiers.length}
            </span>
          </button>
        </div>

        {/* Compiler Action Trigger */}
        <div className="flex items-center gap-2">
          {onOpenCompiler && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onOpenCompiler();
              }}
              className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Compile completed Gallery into a VTT Module package"
            >
              <Cpu size={13} />
              <span>Compile VTT Module</span>
            </button>
          )}

          {onBackToStory && (
            <button
              type="button"
              onClick={onBackToStory}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs rounded-lg transition-colors cursor-pointer"
            >
              Story ❯
            </button>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        {/* TAB 1: STORY ELEMENTS (ElementForge full view) */}
        {activeTab === 'elements' && (
          <ElementForge onBackToStory={onBackToStory} />
        )}

        {/* TAB 2: TACTICAL MAPS */}
        {activeTab === 'maps' && (
          <div className="w-full h-full p-4 md:p-6 overflow-y-auto font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                  Gallery Maps & Encounter Sectors ({allMaps.length})
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Tactical sectors, battlemaps, and encounter zones compiled into the story module.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/foundry/map-maker')}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>New Map Maker Canvas</span>
                </button>
              </div>
            </div>

            {allMaps.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
                <p className="text-sm">No tactical maps created yet in this story gallery.</p>
                <button
                  type="button"
                  onClick={() => navigate('/foundry/map-maker')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl"
                >
                  Launch Map Maker
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allMaps.map((map) => (
                  <div
                    key={map.id}
                    className="p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition-all space-y-3 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-cyan-200 group-hover:text-cyan-300 truncate">
                          {map.title || map.name || 'Untitled Sector'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {map.gridType || 'Hex'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-2">
                        {map.description || 'Tactical combat sector ready for VTT deployment.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-[10px] text-slate-400 text-center">
                      <div>
                        <span className="block text-slate-500">Tokens</span>
                        <span className="font-bold text-slate-200">{(map.tokens || []).length}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Walls</span>
                        <span className="font-bold text-slate-200">{(map.walls || []).length}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Traps</span>
                        <span className="font-bold text-slate-200">{(map.objects || []).filter(o => o.isTrap || o.type === 'hazard').length}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(1200, 0.02);
                          setActiveMapId(map.id);
                          navigate(`/foundry/map-maker?mapId=${map.id}`);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        <ExternalLink size={11} />
                        <span>Edit Cartography</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(1300, 0.03);
                          setActiveMapId(map.id);
                          navigate(`/stage?mapId=${map.id}`);
                        }}
                        className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        <Play size={11} />
                        <span>Stage VTT</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SITUATIONAL & TEMPORARY MODIFIERS */}
        {activeTab === 'modifiers' && (
          <div className="w-full h-full p-4 md:p-6 overflow-y-auto font-mono text-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <span>Story Gallery Situational Modifiers</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                    Live Rules Engine
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Temporary and situational modifiers (metaphysic, tech, environmental, tactical) derived from persons, items, or locations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {['all', 'metaphysic', 'tech', 'environmental', 'tactical'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setModifierFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold transition-all cursor-pointer ${
                        modifierFilterCategory === cat
                          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    setIsNewModifierModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Modifier</span>
                </button>
              </div>
            </div>

            {/* Modifiers List */}
            {filteredModifiers.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
                <Sliders size={28} className="mx-auto text-purple-400/50" />
                <p className="text-sm">No situational modifiers active in this category.</p>
                <p className="text-[11px] text-slate-500 font-sans max-w-md mx-auto">
                  Add modifiers to define metaphysic surges, EMP fallout, zero-G recoil, or auras generated by key personas and items in the gallery.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewModifierModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Create First Modifier
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModifiers.map((mod) => (
                  <div
                    key={mod.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                      mod.isActive
                        ? 'bg-slate-900/90 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${getCategoryBadge(mod.category)}`}>
                          {mod.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {mod.isTemporary && (
                            <span className="text-[10px] text-amber-400 flex items-center gap-1">
                              <Clock size={10} />
                              <span>{mod.remainingRounds} rds</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              AudioService.playTerminalBeep(1100, 0.02);
                              toggleGalleryModifier(mod.id);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                              mod.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {mod.isActive ? 'Active' : 'Muted'}
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        <span>{mod.name}</span>
                      </h4>

                      {mod.sourceName && (
                        <div className="text-[10px] text-slate-400">
                          Source: <span className="text-purple-300 font-bold">{mod.sourceName}</span> ({mod.sourceType})
                        </div>
                      )}

                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    {/* Numerical Effects Summary Strip */}
                    <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-[10px]">
                      <div className="flex flex-wrap gap-2 text-slate-300">
                        {mod.effects?.attackMod !== 0 && (
                          <span className={mod.effects.attackMod > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {mod.effects.attackMod > 0 ? `+${mod.effects.attackMod}` : mod.effects.attackMod} ATK
                          </span>
                        )}
                        {mod.effects?.defenseMod !== 0 && (
                          <span className={mod.effects.defenseMod > 0 ? 'text-cyan-400' : 'text-amber-400'}>
                            {mod.effects.defenseMod > 0 ? `+${mod.effects.defenseMod}` : mod.effects.defenseMod} DEF
                          </span>
                        )}
                        {mod.effects?.metaphysicMod !== 0 && (
                          <span className={mod.effects.metaphysicMod > 0 ? 'text-purple-400' : 'text-rose-400'}>
                            {mod.effects.metaphysicMod > 0 ? `+${mod.effects.metaphysicMod}` : mod.effects.metaphysicMod} Metaphysic
                          </span>
                        )}
                        {mod.effects?.techMod !== 0 && (
                          <span className={mod.effects.techMod > 0 ? 'text-cyan-400' : 'text-rose-400'}>
                            {mod.effects.techMod > 0 ? `+${mod.effects.techMod}` : mod.effects.techMod} Tech
                          </span>
                        )}
                        {mod.effects?.damageMod !== 0 && (
                          <span className="text-amber-300">
                            +{mod.effects.damageMod} DMG
                          </span>
                        )}
                      </div>

                      {mod.effects?.customRuleText && (
                        <p className="text-[9px] text-slate-400 font-sans italic border-t border-slate-800/60 pt-1">
                          {mod.effects.customRuleText}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-500">Scope: {mod.targetScope.toUpperCase()}</span>

                      <button
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(900, 0.03);
                          deleteGalleryModifier(mod.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Modifier"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE MODIFIER MODAL */}
      {isNewModifierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-purple-500/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col text-slate-200 overflow-hidden font-mono text-xs">
            <div className="px-5 py-3.5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border-b border-purple-500/40 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Sliders size={14} />
                <span>Add Story Gallery Situational Modifier</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModifierModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModifier} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Presets Quick Pick */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MODIFIER_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-purple-950/60 border border-slate-700/80 hover:border-purple-500/50 rounded-lg text-[10px] text-slate-300 hover:text-purple-200 transition-colors cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Derive from Gallery Source */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <label className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  <span>Derive From Story's Gallery</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 mb-0.5">Person / Operative</label>
                    <select
                      onChange={(e) => handleSourceSelect('person', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
                    >
                      <option value="">Select Persona...</option>
                      {galleryPersonas.map((p) => (
                        <option key={p.id} value={p.id}>{p.fields?.['char-name'] || p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-500 mb-0.5">Item / Tech Apparatus</label>
                    <select
                      onChange={(e) => handleSourceSelect('item', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
                    >
                      <option value="">Select Item...</option>
                      {galleryItems.map((itm) => (
                        <option key={itm.id} value={itm.id}>{itm.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-500 mb-0.5">Location / Map Sector</label>
                    <select
                      onChange={(e) => handleSourceSelect('location', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
                    >
                      <option value="">Select Map...</option>
                      {allMaps.map((m) => (
                        <option key={m.id} value={m.id}>{m.title || m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Modifier Name
                  </label>
                  <input
                    type="text"
                    value={modName}
                    onChange={(e) => setModName(e.target.value)}
                    required
                    placeholder="e.g. Null-Field Matrix"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={modCategory}
                    onChange={(e) => setModCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  >
                    <option value="metaphysic">Metaphysic</option>
                    <option value="tech">Tech</option>
                    <option value="environmental">Environmental</option>
                    <option value="tactical">Tactical</option>
                    <option value="status">Status / Condition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  value={modDescription}
                  onChange={(e) => setModDescription(e.target.value)}
                  rows={2}
                  placeholder="Explain why this modifier applies and what sensory/mechanical effects occur..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                />
              </div>

              {/* Temporary / Round Settings */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isTemporary"
                    checked={modIsTemporary}
                    onChange={(e) => setModIsTemporary(e.target.checked)}
                    className="accent-purple-500 rounded cursor-pointer"
                  />
                  <label htmlFor="isTemporary" className="text-xs text-slate-200 cursor-pointer">
                    Temporary Modifier (Round-based)
                  </label>
                </div>

                {modIsTemporary && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Duration (Rounds):</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={modDurationRounds}
                      onChange={(e) => setModDurationRounds(e.target.value)}
                      className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-center text-xs text-purple-300"
                    />
                  </div>
                )}
              </div>

              {/* Numerical Modifiers Grid */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Rules Adjustments
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 mb-0.5">Attack Mod</label>
                    <input
                      type="number"
                      value={modAttackMod}
                      onChange={(e) => setModAttackMod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 mb-0.5">Defense Mod</label>
                    <input
                      type="number"
                      value={modDefenseMod}
                      onChange={(e) => setModDefenseMod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 mb-0.5">Metaphysic</label>
                    <input
                      type="number"
                      value={modMetaphysicMod}
                      onChange={(e) => setModMetaphysicMod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center text-xs text-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 mb-0.5">Tech Mod</label>
                    <input
                      type="number"
                      value={modTechMod}
                      onChange={(e) => setModTechMod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center text-xs text-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 mb-0.5">Damage Mod</label>
                    <input
                      type="number"
                      value={modDamageMod}
                      onChange={(e) => setModDamageMod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center text-xs text-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Custom Rules Text
                </label>
                <input
                  type="text"
                  value={modCustomRule}
                  onChange={(e) => setModCustomRule(e.target.value)}
                  placeholder="e.g. Invocations suffer -4 penalty within 30ft."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModifierModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Save to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGallery;
