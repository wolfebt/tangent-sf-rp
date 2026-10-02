/**
 * @file PresetsAndScriptsDashboard.jsx
 * @description Pillar 3: Presets & Scripts Studio Dashboard (⌘3 / /foundry/scripts).
 * Consolidated Automation Pillar for the Adventure Development Environment (ADE).
 * Unifies:
 * 1. NPC Behavioral Routines Matrix (NpcScriptBuilder, vision cones, patrol loops, barks)
 * 2. Reactive Traps & Proximity Hazards Console (ReactiveAutomationConsole, bulkheads, triggers)
 * 3. Atmospheric & Weather Presets (Ambient profiles, lighting tints, fog, environmental hazards)
 * 4. Situational Combat Modifiers (Zero-G, vacuum, radiation, electronic warfare via modifierService)
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Bot, 
  ShieldAlert, 
  CloudRain, 
  Sliders, 
  Play, 
  Pause, 
  FastForward, 
  Flame, 
  Eye, 
  MapPin, 
  Sparkles, 
  Radio, 
  Compass, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Volume2, 
  SunMedium, 
  Wind, 
  Shield, 
  Swords, 
  Activity,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useStory, useCampaign } from '../../../context/CampaignContext';
import { useADEStore } from '../store/adeStore';
import { AudioService } from '../../../services/audioService';
import { ModifierService, MODIFIER_PRESETS } from '../../../services/modifierService';
import { NpcScriptBuilder } from '../ElementForge/components/NpcScriptBuilder';
import { ReactiveAutomationConsole } from '../MapMaker/map/ReactiveAutomationConsole';
import { stepNpcPatrols } from '../../../services/reactiveVttService';

// Master Atmospheric & Weather Presets
export const ATMOSPHERIC_PRESETS = [
  {
    id: 'deep_space_vacuum',
    name: 'Deep Space Vacuum',
    icon: '🌌',
    category: 'Orbital',
    tint: '#020617',
    fogDensity: 0.05,
    audioProfile: 'vacuum_drone',
    description: 'Zero atmosphere, total silence outside suit audio, micro-gravity drift.',
    modifiers: { attackMod: -1, defenseMod: 1, speedMod: -5, techMod: 0 },
    rule: 'Unsealed suits take 10 Void damage/round. Sound-based perception checks fail.'
  },
  {
    id: 'reactor_amber_alert',
    name: 'Reactor Amber Alert',
    icon: '⚠️',
    category: 'Industrial',
    tint: '#d97706',
    fogDensity: 0.35,
    audioProfile: 'amber_klaxon',
    description: 'Emergency containment breach, strobing amber beacons, coolant steam venting.',
    modifiers: { attackMod: 0, defenseMod: 0, speedMod: 0, techMod: -2 },
    rule: 'Radiation buildup: CON DC 13 every 3 rounds or gain 1 Rad Condition.'
  },
  {
    id: 'corrosive_acid_rain',
    name: 'Corrosive Acid Rain',
    icon: '🌧️',
    category: 'Exo-Planet',
    tint: '#84cc16',
    fogDensity: 0.5,
    audioProfile: 'heavy_hissing_rain',
    description: 'Atmospheric acid precipitation dissolves exterior armor and obscures optic sensors.',
    modifiers: { attackMod: -2, defenseMod: -1, speedMod: -5, techMod: -1 },
    rule: 'Optic range capped at 60ft. Non-hardened armor loses 1 Armor point per 5 rounds exposed.'
  },
  {
    id: 'cyberpunk_neon_rain',
    name: 'Cyberpunk Neon Rain',
    icon: '🏙️',
    category: 'Megacity',
    tint: '#06b6d4',
    fogDensity: 0.25,
    audioProfile: 'city_hum_rain',
    description: 'Damp asphalt reflections, holographic advertisements bleeding through mist.',
    modifiers: { attackMod: 0, defenseMod: 1, speedMod: 0, techMod: 1 },
    rule: 'High electronic density: +1 to Cyber and Hacking checks. Stealth +2 in shadow pockets.'
  },
  {
    id: 'geothermal_inferno',
    name: 'Geothermal Sub-Vent',
    icon: '🌋',
    category: 'Planetary',
    tint: '#e11d48',
    fogDensity: 0.4,
    audioProfile: 'volcanic_rumble',
    description: 'Superheated magma trenches, seismic tremors, thermal distortion plumes.',
    modifiers: { attackMod: -1, defenseMod: 0, speedMod: -10, techMod: -2 },
    rule: 'Extreme heat: STAMINA check DC 14 every round or suffer Heat Exhaustion.'
  }
];

export default function PresetsAndScriptsDashboard({ onBackToStory }) {
  const navigate = useNavigate();
  const { 
    elementsCatalog, 
    updateSavedElement, 
    mapsCatalog, 
    galleryModifiers = [],
    addGalleryModifier,
    updateGalleryModifier,
    deleteGalleryModifier,
    toggleGalleryModifier
  } = useStory();

  const { perspectiveMode } = useADEStore();
  const [activeTab, setActiveTab] = useState('npc_routines'); // 'npc_routines' | 'traps_hazards' | 'atmospherics' | 'combat_modifiers'

  // Selected Persona for Script Builder
  const personaElements = useMemo(() => {
    return (elementsCatalog || []).filter(e => e.type === 'Persona');
  }, [elementsCatalog]);

  const [selectedPersonaId, setSelectedPersonaId] = useState(personaElements[0]?.id || '');
  const selectedPersona = useMemo(() => {
    return personaElements.find(p => p.id === selectedPersonaId) || personaElements[0] || null;
  }, [personaElements, selectedPersonaId]);

  // Maps & Tokens for Traps Console
  const allMaps = useMemo(() => {
    return mapsCatalog || [];
  }, [mapsCatalog]);

  const [selectedMapId, setSelectedMapId] = useState(allMaps[0]?.id || '');
  const selectedMap = useMemo(() => {
    return allMaps.find(m => m.id === selectedMapId) || allMaps[0] || null;
  }, [allMaps, selectedMapId]);

  // Atmospheric Preset Active State
  const [activeAtmosphericPreset, setActiveAtmosphericPreset] = useState(ATMOSPHERIC_PRESETS[0]);
  const [isAtmosphericAudioPlaying, setIsAtmosphericAudioPlaying] = useState(false);

  // Situational Modifier Filter
  const [modifierFilterCategory, setModifierFilterCategory] = useState('all');

  // Handle NPC Script update
  const handleScriptChange = async (fieldName, value) => {
    if (!selectedPersona) return;
    const updatedFields = {
      ...(selectedPersona.fields || {}),
      [fieldName]: value
    };
    const updated = {
      ...selectedPersona,
      fields: updatedFields
    };
    await updateSavedElement(selectedPersona.id, updated);
  };

  // Add custom modifier
  const handleApplyPresetModifier = (preset) => {
    AudioService.playTerminalBeep(1200, 0.03);
    addGalleryModifier({
      ...preset,
      isActive: true,
      appliedAt: new Date().toISOString()
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#070b13] text-slate-100 font-sans select-none">
      {/* ── TOP PILLAR 3 BANNER & TAB NAVIGATION ── */}
      <header className="px-6 py-4 border-b border-slate-800 bg-[#0c121e] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Cpu size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider uppercase font-mono text-purple-300">
                  Presets & Scripts Studio
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-900 border border-slate-700 text-slate-400">
                  Pillar 3 · ⌘3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous VTT unit routines, reactive traps, atmospheric environments & combat modifiers.
              </p>
            </div>
          </div>
        </div>

        {/* Pillar Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setActiveTab('npc_routines');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'npc_routines'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot size={13} />
            <span>NPC Routines</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setActiveTab('traps_hazards');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'traps_hazards'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={13} />
            <span>Traps & Hazards</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setActiveTab('atmospherics');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'atmospherics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain size={13} />
            <span>Atmospherics</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setActiveTab('combat_modifiers');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'combat_modifiers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={13} />
            <span>Combat Modifiers ({galleryModifiers.length})</span>
          </button>
        </div>
      </header>

      {/* ── WORKSPACE CONTENT AREA ── */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto p-4 sm:p-6">
        {/* ── TAB 1: NPC BEHAVIORAL ROUTINES ── */}
        {activeTab === 'npc_routines' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Left Roster Column */}
            <div className="lg:col-span-1 rounded-2xl bg-[#0c121e] border border-slate-800 p-4 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Bot size={14} />
                    <span>Persona Units ({personaElements.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate('/foundry/assets')}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1"
                  >
                    <span>Assets ↗</span>
                  </button>
                </div>

                {personaElements.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">
                    No Personas created yet. Ingest or create a Persona in the Asset Forge to script behavior.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                    {personaElements.map(p => {
                      const isSelected = p.id === (selectedPersona?.id);
                      const hasScript = Boolean(p.fields?.vttScript || p.fields?.vttScriptActive === 'true');
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            AudioService.playTerminalBeep(900, 0.02);
                            setSelectedPersonaId(p.id);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-purple-950/40 border-purple-500/50 shadow-md'
                              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-white line-clamp-1">{p.title || p.name || 'Unit'}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Tier {p.fields?.mcmTier || '1'} · {p.fields?.mcmRole || 'Tactical'}
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                            hasScript 
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            {hasScript ? 'Scripted' : 'Idle'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-4 text-[11px] text-slate-400 font-sans">
                💡 Routine behaviors automatically execute on the VTT Live Stage during real-time combat turns.
              </div>
            </div>

            {/* Right Editor Column */}
            <div className="lg:col-span-3 rounded-2xl bg-[#0c121e] border border-slate-800 p-5 shadow-lg overflow-y-auto">
              {selectedPersona ? (
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Autonomous Script: {selectedPersona.title || selectedPersona.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono">
                          {selectedPersona.fields?.mcmRole || 'Tactical'}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Configure waypoint patrol paths, stationary sentry detection cones, ambush ranges and voice barks.
                      </p>
                    </div>
                  </div>

                  <NpcScriptBuilder
                    fields={selectedPersona.fields || {}}
                    onFieldChange={handleScriptChange}
                    elementTitle={selectedPersona.title || selectedPersona.name}
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  Select a Persona from the left column to configure autonomous scripts.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: REACTIVE TRAPS & HAZARDS CONSOLE ── */}
        {activeTab === 'traps_hazards' && (
          <div className="h-full flex flex-col rounded-2xl bg-[#0c121e] border border-slate-800 p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="text-rose-400" size={18} />
                  <span>Reactive Traps & Proximity Hazards Matrix</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage all proximity pressure plates, laser tripwires, and environmental breaches across encounter maps.
                </p>
              </div>

              {/* Map Selector */}
              {allMaps.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Map Sector:</span>
                  <select
                    value={selectedMapId}
                    onChange={(e) => setSelectedMapId(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-rose-400"
                  >
                    {allMaps.map(m => (
                      <option key={m.id} value={m.id}>{m.title || m.name || 'Sector'}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <ReactiveAutomationConsole
                isOpen={true}
                onClose={() => {}}
                tokens={selectedMap?.tokens || []}
                objects={selectedMap?.objects || []}
                onUpdateTokens={(tokens) => {}}
                onUpdateObjects={(objects) => {}}
                isAutomationActive={true}
                onToggleAutomation={() => {}}
              />
            </div>
          </div>
        )}

        {/* ── TAB 3: ATMOSPHERIC & WEATHER PRESETS ── */}
        {activeTab === 'atmospherics' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <CloudRain className="text-cyan-400" size={18} />
                    <span>Atmospheric & Weather Profiles</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Apply dynamic environmental lighting, fog density, audio loops, and environmental conditions to this module.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAtmosphericAudioPlaying(!isAtmosphericAudioPlaying);
                      AudioService.playTerminalBeep(1100, 0.05);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAtmosphericAudioPlaying 
                        ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Volume2 size={13} />
                    <span>{isAtmosphericAudioPlaying ? 'Mute Ambience' : 'Preview Audio'}</span>
                  </button>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ATMOSPHERIC_PRESETS.map(preset => {
                  const isSelected = activeAtmosphericPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        AudioService.playTerminalBeep(1200, 0.03);
                        setActiveAtmosphericPreset(preset);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#131b2c] border-cyan-500/60 shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{preset.icon}</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                            {preset.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-white mb-1">{preset.name}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">{preset.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <div className="text-[11px] font-mono text-cyan-300 flex items-center justify-between">
                          <span>Fog: {Math.round(preset.fogDensity * 100)}%</span>
                          <span>Audio: {preset.audioProfile}</span>
                        </div>
                        <div className="text-[10px] text-amber-300 font-sans italic bg-amber-950/20 p-1.5 rounded border border-amber-500/20">
                          {preset.rule}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: SITUATIONAL COMBAT MODIFIERS ── */}
        {activeTab === 'combat_modifiers' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="text-amber-400" size={18} />
                    <span>Situational Combat Modifiers ({galleryModifiers.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Rules and stat modifications active during tactical combat on the Stage.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['all', 'metaphysic', 'tech', 'environmental', 'tactical'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setModifierFilterCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                        modifierFilterCategory === cat
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canonical Preset Modifiers List */}
              <div className="mb-6">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Canonical System Presets (Click to Apply)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MODIFIER_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleApplyPresetModifier(preset)}
                      className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{preset.description}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300">
                        {preset.effects?.customRuleText || 'Stat modifier'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Modifiers in Story Gallery */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Currently Active Gallery Modifiers ({galleryModifiers.length})
                </h3>
                {galleryModifiers.length === 0 ? (
                  <p className="text-xs text-slate-500 p-6 bg-slate-900/30 rounded-xl text-center border border-slate-800/60">
                    No modifiers actively deployed. Click any preset above to deploy into this module.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryModifiers.map(mod => (
                      <div
                        key={mod.id}
                        className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs text-amber-200">{mod.name}</span>
                            <button
                              type="button"
                              onClick={() => toggleGalleryModifier(mod.id)}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border cursor-pointer ${
                                mod.isActive 
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                                  : 'bg-slate-900 text-slate-500 border-slate-700'
                              }`}
                            >
                              {mod.isActive ? 'Active' : 'Disabled'}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{mod.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono">
                          <span className="text-cyan-400">{mod.effects?.customRuleText || ''}</span>
                          <button
                            type="button"
                            onClick={() => deleteGalleryModifier(mod.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
