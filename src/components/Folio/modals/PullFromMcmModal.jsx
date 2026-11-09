import React, { useState, useMemo } from 'react';
import { useDBM } from '../../../context/DBMContext';
import { useFolio } from '../../../context/FolioContext';
import { useStory } from '../../../context/CampaignContext';
import { showToast } from '../../../context/ToastContext';
import { AudioService } from '../../../services/audioService';
import {
  THREAT_TIER_CHASSIS,
  COMPETENCY_ROLES,
  BOSS_TYPES,
  DESIGNATIONS,
  SPECIES_SIZES
} from '../../../constants';
import { calculateNPCCombatBlock } from '../../../engines/tangentEntityEngines';
import {
  convertMcmToFolioPersona,
  buildVttUnitFromPersona,
  resolveCompetencyRoleKey,
  resolveBossTypeKey,
  resolveDesignationKey
} from '../../../utils/personaBridge';
import {
  Search, Shield, Zap, Heart, Crosshair, Activity,
  UserCheck, Sparkles, Lock, Edit3, Plus, UploadCloud, Cpu
} from 'lucide-react';

export const PullFromMcmModal = ({
  isOpen,
  onClose,
  onPulledCharacter
}) => {
  const { dbData, saveEntry } = useDBM() || { dbData: {} };
  const {
    importMcmCharacterToFolio,
    exportCurrentCharacterToMcm,
    characterData
  } = useFolio() || {};
  const storyCtx = useStory();
  const storyElements = storyCtx?.story?.elementsCatalog || [];

  const [modeTab, setModeTab] = useState('library'); // 'library' | 'quick-forge'
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);

  // Quick-Forge state
  const [qfName, setQfName] = useState('Vanguard Operative');
  const [qfTier, setQfTier] = useState(2);
  const [qfDesignation, setQfDesignation] = useState('Adversary');
  const [qfRole, setQfRole] = useState('SOLDIER');
  const [qfBossType, setQfBossType] = useState('STANDARD');
  const [qfSize, setQfSize] = useState('Medium');
  const [qfSpecies, setQfSpecies] = useState('Human');
  const [qfArchetype, setQfArchetype] = useState('Warrior');
  const [qfOccupation, setQfOccupation] = useState('Mercenary');
  const [qfOrigin, setQfOrigin] = useState('Frontier Colony');
  const [qfFaction, setQfFaction] = useState('Independent');
  const [qfWeapon, setQfWeapon] = useState('');
  const [qfArmor, setQfArmor] = useState('');

  // Combine Omnicortex modular_characters + Story MCM Personas
  const mcmCatalog = useMemo(() => {
    const cortexMcm = Array.isArray(dbData?.modular_characters) ? dbData.modular_characters : [];
    const storyMcm = (Array.isArray(storyElements) ? storyElements : [])
      .filter((el) => {
        if (!el) return false;
        const typeStr = String(el.type || '').toLowerCase();
        return (
          typeStr === 'persona' ||
          typeStr === 'npc' ||
          el.isMcmPersona ||
          el.fields?.personaSubcategory === 'mcm' ||
          el.fields?.mcmTier !== undefined
        );
      })
      .map((el) => ({
        ...el,
        ...(el.fields || {}),
        id: el.id || `story_mcm_${el.title}`,
        name: el.title || el.name || 'Story Persona',
        threatTier: Number(el.fields?.mcmTier ?? el.threatTier ?? 1) || 1,
        competencyRole: el.fields?.mcmRole || el.competencyRole || 'SKIRMISHER',
        designation: el.fields?.mcmDesignation || el.fields?.['char-role'] || el.designation || 'Adversary',
        species: el.fields?.['char-species'] || el.species || 'Human',
        archetype: el.fields?.['char-archetype'] || el.archetype || 'Specialist',
        occupation: el.fields?.['char-occu'] || el.occupation || 'Operative',
        origin: el.fields?.['char-origin'] || el.origin || 'Unknown',
        faction: el.fields?.['char-faction'] || el.faction || 'Independent',
        _sourceLabel: 'STORY'
      }));

    const seen = new Set();
    const combined = [];

    cortexMcm.forEach((item) => {
      if (!item) return;
      const id = String(item.id || item.name);
      if (seen.has(id)) return;
      seen.add(id);
      combined.push({
        ...item,
        id,
        name: item.name || item.title || 'MCM Template',
        threatTier: Number(item.threatTier ?? item.threat_tier ?? 1) || 1,
        competencyRole: resolveCompetencyRoleKey(item.competencyRole || item.role || 'SKIRMISHER'),
        designation: resolveDesignationKey(item.designation || 'Adversary'),
        _sourceLabel: 'MCM'
      });
    });

    storyMcm.forEach((item) => {
      const id = String(item.id || item.name);
      if (seen.has(id)) return;
      seen.add(id);
      combined.push(item);
    });

    return combined;
  }, [dbData?.modular_characters, storyElements]);

  const filteredList = useMemo(() => {
    return mcmCatalog.filter((item) => {
      if (designationFilter !== 'ALL' && resolveDesignationKey(item.designation) !== designationFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.competencyRole || '').toLowerCase().includes(q) ||
        String(item.species || '').toLowerCase().includes(q) ||
        String(item.occupation || '').toLowerCase().includes(q) ||
        String(item.faction || '').toLowerCase().includes(q)
      );
    });
  }, [mcmCatalog, designationFilter, searchQuery]);

  const activeLibraryItem = useMemo(() => {
    if (selectedId) {
      const found = filteredList.find((i) => String(i.id) === String(selectedId));
      if (found) return found;
    }
    return filteredList[0] || null;
  }, [filteredList, selectedId]);

  // Quick Forge synthesized MCM record
  const quickForgeRecord = useMemo(() => {
    const isSynth = String(qfSpecies || '').toLowerCase().includes('synthetic');
    const block = calculateNPCCombatBlock({
      name: qfName || 'MCM Operative',
      threatTier: qfTier,
      competencyRoleKey: qfRole,
      bossTypeKey: qfBossType,
      designationKey: qfDesignation,
      sizeKey: qfSize,
      isSynthetic: isSynth
    });

    return {
      id: `mcm_qf_${Date.now()}`,
      name: qfName || 'MCM Operative',
      threatTier: qfTier,
      competencyRole: qfRole,
      bossType: qfBossType,
      designation: qfDesignation,
      speciesSize: qfSize,
      isSynthetic: isSynth,
      species: qfSpecies,
      archetype: qfArchetype,
      occupation: qfOccupation,
      origin: qfOrigin,
      faction: qfFaction,
      vitalityPoints: block.vitalityPoints,
      healthPoints: block.healthPoints,
      structurePoints: block.structurePoints,
      armorDR: block.armorDR,
      staminaDR: block.staminaDR,
      defenseDC: block.defenseDC,
      attackBonus: block.attackBonus,
      actionsPerRound: block.actionsPerRound,
      weapons: qfWeapon
        ? [{ id: 'wpn_qf', name: qfWeapon, damage: block.baseDamageDice, range: 'Medium', type: 'Tactical' }]
        : [{ id: 'wpn_default', name: `${COMPETENCY_ROLES[qfRole]?.name || 'Standard'} Armament`, damage: block.baseDamageDice, range: 'Medium', type: 'Tactical' }],
      armor: qfArmor
        ? [{ id: 'arm_qf', name: qfArmor, dr: block.armorDR, equipped: true }]
        : block.armorDR > 0
          ? [{ id: 'arm_default', name: 'Tactical Plating', dr: block.armorDR, equipped: true }]
          : []
    };
  }, [qfName, qfTier, qfRole, qfBossType, qfDesignation, qfSize, qfSpecies, qfArchetype, qfOccupation, qfOrigin, qfFaction, qfWeapon, qfArmor]);

  const targetSource = modeTab === 'library' ? activeLibraryItem : quickForgeRecord;

  const previewFolio = useMemo(() => {
    if (!targetSource) return null;
    return convertMcmToFolioPersona(targetSource, { createCopy: false });
  }, [targetSource]);

  const previewVttUnit = useMemo(() => {
    if (!previewFolio) return null;
    return buildVttUnitFromPersona(previewFolio, { uniqueInstance: false });
  }, [previewFolio]);

  if (!isOpen) return null;

  const handlePull = async (lockForVtt = false) => {
    if (!targetSource || !importMcmCharacterToFolio) return;
    AudioService.playTerminalBeep(1200, 0.05);

    // If created in Quick Forge, also save to Cortex MCM library
    if (modeTab === 'quick-forge' && typeof saveEntry === 'function') {
      try {
        await saveEntry(targetSource, 'modular_characters');
      } catch (e) {
        console.warn('Could not persist quick-forged MCM to DBM:', e);
      }
    }

    const hydrated = importMcmCharacterToFolio(targetSource, {
      lockForVtt,
      createCopy: true
    });

    if (hydrated) {
      const docId = hydrated['character-doc-id'] || hydrated.id;
      showToast({
        type: 'success',
        title: lockForVtt ? 'PULLED AS VTT UNIT' : 'PULLED FROM MCM INTO FOLIO',
        text: `Imported "${hydrated['char-name']}" with full 5-Pillar, Attribute, Skill, Aspect, Loadout, and VTT Unit data.`
      });
      onPulledCharacter?.(docId, lockForVtt ? 'combat' : 'identity', lockForVtt);
      onClose?.();
    }
  };

  const handlePushCurrentFolioToMcm = async () => {
    if (!exportCurrentCharacterToMcm || !characterData) return;
    const mcmRecord = exportCurrentCharacterToMcm();
    if (mcmRecord && typeof saveEntry === 'function') {
      await saveEntry(mcmRecord, 'modular_characters');
      showToast({
        type: 'success',
        title: 'SAVED TO CORTEX MCM',
        text: `Saved current Folio "${mcmRecord.name}" to the Modular Character Matrix!`
      });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[220] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 pb-10 overflow-y-auto select-none font-sans text-slate-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0e1420] border-2 border-cyan-500/60 rounded-2xl w-full max-w-6xl max-h-[88vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              🧬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                  MODULAR CHARACTER MATRIX ⇄ PERSONA FOLIO BRIDGE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono font-bold uppercase">
                  VTT Unit Ready
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-mono uppercase tracking-wider text-slate-100">
                Pull Persona from MCM
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {characterData?.['char-name'] && (
              <button
                type="button"
                onClick={handlePushCurrentFolioToMcm}
                className="px-3 py-1.5 bg-purple-950/90 hover:bg-purple-900 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                title="Save your currently active Folio Persona as a reusable template in the Modular Character Matrix"
              >
                <UploadCloud size={13} />
                <span>Sync Current Folio → MCM</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl font-bold px-2.5 py-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode Switcher Bar */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModeTab('library')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                modeTab === 'library'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Cpu size={13} />
              <span>MCM &amp; Story Persona Library ({mcmCatalog.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setModeTab('quick-forge')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                modeTab === 'quick-forge'
                  ? 'bg-amber-950 text-amber-200 border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Sparkles size={13} />
              <span>Quick-Assemble New MCM Persona</span>
            </button>
          </div>

          {modeTab === 'library' && (
            <div className="flex items-center gap-2 flex-wrap">
              {['ALL', 'Adversary', 'Ally', 'Companion', 'Neutral'].map((des) => (
                <button
                  key={des}
                  type="button"
                  onClick={() => setDesignationFilter(des)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer border ${
                    designationFilter === des
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {des}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Split Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column: Library List OR Quick-Forge Controls */}
          <div className="lg:col-span-5 border-r border-slate-800 flex flex-col min-h-0 bg-slate-950/60">
            {modeTab === 'library' ? (
              <>
                <div className="p-3 border-b border-slate-800">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search MCM templates by name, role, species, faction..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredList.length === 0 ? (
                    <div className="text-center py-12 px-4 text-slate-500 font-mono text-xs space-y-3">
                      <p>No MCM templates match your filter.</p>
                      <button
                        type="button"
                        onClick={() => setModeTab('quick-forge')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl uppercase text-xs cursor-pointer"
                      >
                        + Quick-Assemble MCM NPC Now
                      </button>
                    </div>
                  ) : (
                    filteredList.map((item) => {
                      const isSelected = activeLibraryItem && String(activeLibraryItem.id) === String(item.id);
                      const roleObj = COMPETENCY_ROLES[item.competencyRole] || COMPETENCY_ROLES.SKIRMISHER;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold font-mono text-slate-100 truncate">
                                {item.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-950/90 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold">
                                T-{item.threatTier}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-purple-950/90 border border-purple-500/40 text-purple-300 text-[9px] font-mono">
                                {roleObj?.name || item.competencyRole}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                              {item.species || 'Human'} • {item.occupation || roleObj?.name} • {item.designation || 'Adversary'}
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 shrink-0">
                            {item._sourceLabel || 'MCM'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* Quick-Forge Controls */
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">Persona Name</label>
                  <input
                    type="text"
                    value={qfName}
                    onChange={(e) => setQfName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-cyan-400 flex justify-between mb-1">
                      <span>Threat Tier</span>
                      <span className="text-amber-300">T-{qfTier}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={qfTier}
                      onChange={(e) => setQfTier(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">Designation</label>
                    <select
                      value={qfDesignation}
                      onChange={(e) => setQfDesignation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-100"
                    >
                      {Object.entries(DESIGNATIONS).map(([k, d]) => (
                        <option key={k} value={k}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">Competency Role</label>
                    <select
                      value={qfRole}
                      onChange={(e) => setQfRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-purple-300"
                    >
                      {Object.entries(COMPETENCY_ROLES).map(([k, r]) => (
                        <option key={k} value={k}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">Boss Scale</label>
                    <select
                      value={qfBossType}
                      onChange={(e) => setQfBossType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-amber-300"
                    >
                      {Object.entries(BOSS_TYPES).map(([k, b]) => (
                        <option key={k} value={k}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">5-Pillar Identity</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 block">Species</label>
                      <input
                        type="text"
                        value={qfSpecies}
                        onChange={(e) => setQfSpecies(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block">Archetype</label>
                      <input
                        type="text"
                        value={qfArchetype}
                        onChange={(e) => setQfArchetype(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block">Occupation</label>
                      <input
                        type="text"
                        value={qfOccupation}
                        onChange={(e) => setQfOccupation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block">Origin</label>
                      <input
                        type="text"
                        value={qfOrigin}
                        onChange={(e) => setQfOrigin(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] text-slate-400 block">Faction</label>
                      <input
                        type="text"
                        value={qfFaction}
                        onChange={(e) => setQfFaction(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Complete Folio + VTT Unit Conversion Preview */}
          <div className="lg:col-span-7 flex flex-col min-h-0 overflow-y-auto p-5 space-y-4">
            {previewFolio && previewVttUnit ? (
              <>
                <div className="p-4 bg-slate-900/90 border border-cyan-500/40 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold font-mono text-cyan-200 uppercase">
                          {previewFolio['char-name']}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold">
                          Tier {previewVttUnit.threat_tier} • {previewVttUnit.competency_role}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/50 text-purple-300 text-[10px] font-mono font-bold">
                          {previewVttUnit.designation}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        {previewFolio['char-species']} • {previewFolio['char-archetype']} • {previewFolio['char-occu']} • {previewFolio['char-origin']} • {previewFolio['char-faction']}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold">
                      ✓ 100% Folio &amp; VTT Compatible
                    </span>
                  </div>

                  {/* VTT Combat Unit Stat Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Health / Vit</span>
                      <span className="text-xs font-mono font-extrabold text-rose-300">
                        {previewVttUnit.hp_max} HP / {previewVttUnit.vit_max} VP
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Defense DC</span>
                      <span className="text-xs font-mono font-extrabold text-amber-300">
                        DC {previewVttUnit.defense_dc}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Attack Bonus</span>
                      <span className="text-xs font-mono font-extrabold text-purple-300">
                        +{previewVttUnit.attack_bonus}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">DR (Arm + Tough)</span>
                      <span className="text-xs font-mono font-extrabold text-cyan-300">
                        {previewVttUnit.armor_dr} + {previewVttUnit.stamina_dr}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Actions / Init</span>
                      <span className="text-xs font-mono font-extrabold text-emerald-300">
                        {previewVttUnit.actions_per_round} Act • +{previewVttUnit.initiative_mod} Init
                      </span>
                    </div>
                  </div>

                  {/* 6 Primary Attributes */}
                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {['str', 'agi', 'sta', 'int', 'wil', 'cha'].map((k) => (
                      <div key={k} className="p-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-center">
                        <div className="text-[9px] font-mono uppercase text-slate-400">{k}</div>
                        <div className="text-xs font-mono font-bold text-cyan-300">
                          {previewFolio[`attr-${k}-base`] ?? 0}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features, Weapons & Attacks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">
                        VTT Ready Attacks ({previewVttUnit.attacks?.length || 0})
                      </span>
                      <div className="space-y-1">
                        {(previewVttUnit.attacks || []).slice(0, 3).map((atk, idx) => (
                          <div key={idx} className="px-2 py-1 bg-slate-950 rounded border border-slate-800 flex justify-between">
                            <span className="text-slate-200 truncate">{atk.name}</span>
                            <span className="text-amber-300">+{atk.bonus} ({atk.damage})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1">
                        Features &amp; Role Traits ({(previewFolio.features?.length || 0) + (previewFolio.traits?.length || 0)})
                      </span>
                      <div className="space-y-1">
                        {[...(previewFolio.features || []), ...(previewFolio.traits || [])].slice(0, 3).map((f, idx) => (
                          <div key={idx} className="px-2 py-1 bg-slate-950 rounded border border-slate-800 text-slate-300 truncate">
                            {f.name || f.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-mono text-slate-400 max-w-md">
                    Pulling creates an independent Persona Folio entry with all 5 Pillars, Attributes, Skills, Features, Loadout, and VTT Unit stats.
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handlePull(false)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={14} />
                      <span>Pull &amp; Expand in Folio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePull(true)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock size={14} />
                      <span>Pull as VTT Unit (Ready)</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
                Select an MCM Persona on the left or switch to Quick-Assemble to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PullFromMcmModal;
