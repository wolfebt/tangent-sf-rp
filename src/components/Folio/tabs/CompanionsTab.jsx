import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Edit3, 
  Radio, 
  Heart, 
  Shield, 
  Crosshair, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  X,
  Layers,
  Sparkles,
  Link,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';
import { 
  CHASSIS_TYPES, 
  FORM_PACKAGES, 
  FUNCTION_PACKAGES, 
  COMPANION_SUB_FEATURES, 
  COMMAND_ECONOMY_MODES 
} from '../../../data/companionModularMatrix';

export const CompanionsTab = () => {
  const { 
    characterData = {},
    companions = [], 
    handleAddCompanion, 
    handleUpdateCompanion, 
    handleDeleteCompanion, 
    handleToggleDeployCompanion,
    handleAddItem
  } = useFolio();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompanion, setEditingCompanion] = useState(null);

  // Companion Feature Unlocking Logic:
  // As with Metaphysics (Awakened) and Augmentations (Augmented), companions require purchasing the Companion feature.
  // Multiple purchases allow unlocking multiple companions or increasing budget.
  const rawFeatures = Array.isArray(characterData?.features) 
    ? characterData.features 
    : (typeof characterData?.features === 'string' && characterData.features.trim() ? [characterData.features] : []);
  
  const companionFeatureEntries = rawFeatures.filter(f => {
    const name = (typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f)).toLowerCase();
    return name === 'companion' || name.startsWith('companion ') || name.startsWith('companion:');
  });

  const companionFeatureUnlocked = companionFeatureEntries.length > 0;
  // Total purchases count (each purchase grants 1 companion slot or +10 CP budget)
  const companionFeatureCount = companionFeatureEntries.reduce((acc, f) => {
    const rank = typeof f === 'object' ? (Number(f.rank) || 1) : 1;
    return acc + rank;
  }, 0);

  // Maximum allowed companions is at least the feature purchase count
  const maxCompanionSlots = Math.max(1, companionFeatureCount);

  // Modular Builder State
  const [name, setName] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('predator');
  const [selectedFunctionId, setSelectedFunctionId] = useState('guardian');
  const [rank, setRank] = useState(1);
  const [commandMode, setCommandMode] = useState('direct');
  const [commandTether, setCommandTether] = useState('Voice / Visual (50ft)');
  const [notes, setNotes] = useState('');

  // Sockets / Mounts
  const [customSocketText, setCustomSocketText] = useState('');

  const activeForm = FORM_PACKAGES.find(f => f.id === selectedFormId) || FORM_PACKAGES[0];
  const activeFunction = FUNCTION_PACKAGES.find(f => f.id === selectedFunctionId) || FUNCTION_PACKAGES[0];
  const activeChassis = CHASSIS_TYPES[activeForm.category] || CHASSIS_TYPES.biological;

  // Budget calculations: Rank 1 = 40 CP, Rank 2+ = +10 CP per rank
  const cpBudget = 40 + Math.max(0, (rank - 1) * 10);
  const cpSpent = (activeForm.bpCost || activeForm.cpCost || 15) + (activeFunction.bpCost || activeFunction.cpCost || 25);
  const bpBudget = cpBudget;
  const bpSpent = cpSpent;

  const openNewModal = () => {
    AudioService.playTerminalBeep(1100, 0.02);
    setEditingCompanion(null);
    setName('');
    setSelectedFormId('predator');
    setSelectedFunctionId('guardian');
    setRank(1);
    setCommandMode('direct');
    setCommandTether('Voice / Visual (50ft)');
    setCustomSocketText('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (comp) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setEditingCompanion(comp);
    setName(comp.name || '');
    setSelectedFormId(comp.formPackageId || 'predator');
    setSelectedFunctionId(comp.functionPackageId || 'guardian');
    setRank(comp.rank || 1);
    setCommandMode(comp.commandMode || 'direct');
    setCommandTether(comp.commandTether || 'Voice / Visual (50ft)');
    setCustomSocketText(Array.isArray(comp.sockets) ? comp.sockets.map(s => s.name || s).join(', ') : '');
    setNotes(comp.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Harmonize vitals according to Chassis Type
    const isSynth = activeForm.category === 'synthetic';
    const isMeta = activeForm.category === 'metaphysical';

    const healthVal = activeForm.baseHealth || 25;
    const vitVal = activeForm.baseVitality || 25;
    // Canonical Tangent SF RP Rule: Structure for synthetics is the exact total of Vitality + Health
    const structVal = isSynth ? (activeForm.baseStructure || (healthVal + vitVal)) : 0;
    const essenceVal = isMeta ? (activeForm.baseHealth || 20) : 0;

    // Attributes summation: Form base + Function bonus
    const combinedAttributes = {
      strength: (activeForm.attributes?.strength || 0) + (activeFunction.attributesBonus?.strength || 0),
      agility: (activeForm.attributes?.agility || 0) + (activeFunction.attributesBonus?.agility || 0),
      stamina: (activeForm.attributes?.stamina || 0) + (activeFunction.attributesBonus?.stamina || 0),
      intellect: (activeForm.attributes?.intellect || 0) + (activeFunction.attributesBonus?.intellect || 0),
      wisdom: (activeForm.attributes?.wisdom || 0) + (activeFunction.attributesBonus?.wisdom || 0),
      charisma: (activeForm.attributes?.charisma || 0) + (activeFunction.attributesBonus?.charisma || 0)
    };

    // Protocols
    const combinedProtocols = [
      ...(activeForm.protocols || []),
      `Directive: ${activeFunction.name}`
    ];

    // Sockets
    const parsedSockets = customSocketText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map((name, idx) => ({ id: `sock_${idx}`, name, tier: 'socket' }));

    const compPayload = {
      name: name.trim(),
      chassisType: activeForm.category,
      formPackageId: activeForm.id,
      functionPackageId: activeFunction.id,
      rank: Number(rank) || 1,
      bpBudget,
      bpSpent,
      size: activeForm.size || 'Medium',
      role: activeFunction.name.replace(/ \(.*\)/, ''),
      commandMode,
      commandTether,
      vitals: {
        current_hp: isSynth ? structVal : isMeta ? essenceVal : healthVal,
        max_hp: isSynth ? structVal : isMeta ? essenceVal : healthVal,
        vitality: isSynth ? 0 : vitVal,
        max_vitality: isSynth ? 0 : vitVal,
        structure: structVal,
        max_structure: structVal,
        essence: essenceVal,
        max_essence: essenceVal
      },
      attributes: combinedAttributes,
      armor: { 
        dr: activeForm.armorDr || 2, 
        kinetic: activeForm.armorDr || 2, 
        energy: activeForm.armorDr || 2 
      },
      speed: activeForm.speed || 10,
      attacks: activeForm.attacks || [],
      skills: [...(activeForm.skills || []), ...(activeFunction.skills || [])],
      features: [...(activeForm.features || []), ...(activeFunction.features || [])],
      disadvantages: activeForm.disadvantages || [],
      protocols: combinedProtocols,
      sockets: parsedSockets,
      notes: notes.trim()
    };

    if (editingCompanion) {
      handleUpdateCompanion(editingCompanion.id, compPayload);
    } else {
      handleAddCompanion(compPayload);
    }

    AudioService.playTerminalBeep(1200, 0.03);
    setIsModalOpen(false);
  };

  const handleDelete = (comp) => {
    if (window.confirm(`Decommission companion unit "${comp.name}"? (No BP penalty; narrative retraining required)`)) {
      AudioService.playTerminalBeep(900, 0.03);
      handleDeleteCompanion(comp.id);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-mono text-xs">
      {/* Feature Unlock Banner / Status */}
      {!companionFeatureUnlocked ? (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={20} className="text-amber-400 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider text-xs block text-amber-300">
                COMPANION FEATURE REQUIRED
              </span>
              <p className="text-[11px] text-amber-200/90 font-sans mt-0.5">
                Like Metaphysics (Awakened) and Augmentations (Augmented), access to companions must be unlocked by purchasing the <strong>Companion</strong> feature (3 CP, Prerequisite: Charisma 1). You may purchase it multiple times for additional cohorts or to expand your build budget.
              </p>
            </div>
          </div>
          {handleAddItem && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                handleAddItem('features', {
                  id: `special-companion-${Date.now()}`,
                  name: 'Companion',
                  type: 'special',
                  category: 'Special',
                  cp: 3,
                  rank: 1,
                  prerequisites: 'Charisma 1',
                  description: 'Unlocks access to the Modular Companion Matrix (40 CP build).'
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider text-[11px] shrink-0 cursor-pointer shadow transition-colors"
            >
              + Unlock Companion Feature (3 CP)
            </button>
          )}
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
            <span>
              <strong>Companion Feature Active:</strong> {companionFeatureCount} Purchase{companionFeatureCount > 1 ? 's' : ''} recorded ({companions.length} / {maxCompanionSlots} Companion slots occupied).
            </span>
          </div>
          {handleAddItem && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                handleAddItem('features', {
                  id: `special-companion-${Date.now()}`,
                  name: `Companion (Rank ${companionFeatureCount + 1})`,
                  type: 'special',
                  category: 'Special',
                  cp: 3,
                  rank: 1,
                  prerequisites: 'Charisma 1',
                  description: 'Additional companion unlock (+1 cohort slot or +10 CP budget).'
                });
              }}
              className="px-2.5 py-1 rounded bg-purple-900/80 hover:bg-purple-800 border border-purple-500/60 text-purple-200 font-bold uppercase text-[10px] cursor-pointer"
            >
              + Buy Additional Companion (3 CP)
            </button>
          )}
        </div>
      )}

      {/* Tab Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300">
            <Bot size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider">
                MODULAR COMPANION MATRIX
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
                CANONICAL 40 CP ARCHITECTURE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Constructed via Form (15 CP) + Function (25 CP) Packages. Each Companion feature rank grants +10 CP to build budget or a new 40 CP cohort slot.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition-all cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>ASSEMBLE COMPANION</span>
        </button>
      </div>

      {/* Companions Registry Grid */}
      {companions.length === 0 ? (
        <div className="p-12 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-2xl">
            🛸
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="text-sm font-bold text-slate-200 uppercase">NO ACTIVE COMPANIONS</h4>
            <p className="text-[11px] text-slate-400 font-sans">
              Deploy cybernetic attack hounds, tactical hovering drones, loyal operative bodyguards, or metaphysical familiars built on the 40 CP Modular Matrix.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewModal}
            className="px-4 py-2 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold uppercase text-xs transition-all cursor-pointer shadow-md"
          >
            + Assemble First Companion
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companions.map((comp) => {
            const formObj = FORM_PACKAGES.find(f => f.id === comp.formPackageId) || FORM_PACKAGES[0];
            const funcObj = FUNCTION_PACKAGES.find(f => f.id === comp.functionPackageId) || FUNCTION_PACKAGES[0];
            const chassisInfo = CHASSIS_TYPES[comp.chassisType || 'biological'] || CHASSIS_TYPES.biological;

            const isSynth = comp.chassisType === 'synthetic';
            const isMeta = comp.chassisType === 'metaphysical';

            const curHp = comp.vitals?.current_hp ?? 25;
            const maxHp = comp.vitals?.max_hp ?? 25;
            const curVit = comp.vitals?.vitality ?? 25;
            const maxVit = comp.vitals?.max_vitality ?? 25;
            const curStruct = comp.vitals?.structure ?? ((comp.vitals?.current_hp || 25) + (comp.vitals?.vitality || 25));
            const maxStruct = comp.vitals?.max_structure ?? ((comp.vitals?.max_hp || 25) + (comp.vitals?.max_vitality || 25));

            const isDeployed = !!comp.is_deployed;

            return (
              <div 
                key={comp.id}
                className={`p-4 rounded-xl bg-slate-950/90 border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isDeployed 
                    ? 'border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.18)] ring-1 ring-purple-500/50' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="space-y-1.5 pb-2 border-b border-slate-800/80">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {chassisInfo.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-100 text-sm">{comp.name}</h3>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {formObj.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {funcObj.name.replace(/ \(.*\)/, '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans mt-0.5">
                          <span>Rank {comp.rank || 1} ({comp.bpBudget || 40} BP)</span>
                          <span>•</span>
                          <span className="capitalize">{comp.size || 'Medium'}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-mono text-[9px] uppercase">{comp.commandMode || 'Direct'} Command</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(comp)}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Edit Companion Specs"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comp)}
                        className="p-1 rounded bg-slate-900 hover:bg-red-950 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Decommission Companion"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vitals Telemetry */}
                <div className="space-y-1.5">
                  {isSynth ? (
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Cpu size={11} className="text-purple-400" />
                          STRUCTURE POINTS (SP)
                        </span>
                        <span className="font-bold text-purple-300">{curStruct}/{maxStruct} SP</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-purple-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (curStruct / (maxStruct || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : isMeta ? (
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Sparkles size={11} className="text-cyan-400" />
                          ESSENCE INTEGRITY
                        </span>
                        <span className="font-bold text-cyan-300">{curHp}/{maxHp} ESSENCE</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, (curHp / (maxHp || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Heart size={11} className="text-emerald-400" />
                          HEALTH &amp; VITALITY
                        </span>
                        <span className="font-bold text-emerald-300">
                          {curHp}/{maxHp} HP • {curVit}/{maxVit} VIT
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-emerald-400"
                            style={{ width: `${Math.min(100, (curHp / (maxHp || 1)) * 100)}%` }}
                          />
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-amber-400"
                            style={{ width: `${Math.min(100, (curVit / (maxVit || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attributes & Defense Strip */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-900/70 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">STR / AGI</span>
                      <span className="font-bold text-slate-200">
                        {comp.attributes?.strength >= 0 ? `+${comp.attributes?.strength}` : comp.attributes?.strength} / {comp.attributes?.agility >= 0 ? `+${comp.attributes?.agility}` : comp.attributes?.agility}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/70 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">STA / INT</span>
                      <span className="font-bold text-slate-200">
                        {comp.attributes?.stamina >= 0 ? `+${comp.attributes?.stamina}` : comp.attributes?.stamina} / {comp.attributes?.intellect >= 0 ? `+${comp.attributes?.intellect}` : comp.attributes?.intellect}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/70 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">ARMOR DR</span>
                      <span className="font-bold text-cyan-300">{comp.armor?.dr ?? 2}</span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/70 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">SPEED</span>
                      <span className="font-bold text-amber-300">{comp.speed ?? 10}m</span>
                    </div>
                  </div>
                </div>

                {/* Tactical Attacks & Skills */}
                <div className="space-y-1 text-[10px]">
                  {comp.attacks && comp.attacks.length > 0 && (
                    <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">ATTACKS &amp; WEAPONS</span>
                      {comp.attacks.map((atk, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <Crosshair size={10} className="text-purple-400 shrink-0" />
                            <strong>{atk.name}</strong>
                          </span>
                          <span className="font-bold text-amber-300">{atk.damage} ({atk.range})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {comp.skills && comp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {comp.skills.map((sk, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px]">
                          {sk.name}: R{sk.rank}
                        </span>
                      ))}
                    </div>
                  )}

                  {comp.sockets && comp.sockets.length > 0 && (
                    <div className="flex items-center gap-1 text-[9.5px] text-slate-400 pt-0.5">
                      <Layers size={11} className="text-cyan-400" />
                      <span>Sockets: {comp.sockets.map(s => s.name).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* VTT Deploy Toggle */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isDeployed ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`} />
                    <span>{isDeployed ? 'DEPLOYED ON STAGE' : 'STOWED / IN HANGAR'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(isDeployed ? 950 : 1250, 0.03);
                      handleToggleDeployCompanion(comp.id);
                    }}
                    className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDeployed
                        ? 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300'
                        : 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200'
                    }`}
                  >
                    <Radio size={11} className={isDeployed ? 'text-amber-400' : 'text-purple-400'} />
                    <span>{isDeployed ? 'RECALL TO HANGAR' : 'DEPLOY TO STAGE'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modular Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <form 
            onSubmit={handleSaveModal}
            className="w-full max-w-2xl bg-[#0b0f19] border border-purple-500/50 rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-purple-400" />
                <div>
                  <h3 className="font-bold text-slate-100 uppercase tracking-wider text-sm">
                    {editingCompanion ? 'RECONFIGURE COMPANION MATRIX' : 'MODULAR COMPANION ASSEMBLY'}
                  </h3>
                  <span className="text-[10px] text-purple-300 font-sans">
                    Form Package (15 CP) + Function Package (25 CP) = 40 CP Architecture
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step 1: Designation & Ranked Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">UNIT DESIGNATION / NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fenris Attack Hound, Sky-Eye Drone"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-purple-400 rounded-lg text-slate-100 text-xs outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">FEATURE RANK</label>
                <select
                  value={rank}
                  onChange={(e) => setRank(Number(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-purple-400 rounded-lg text-slate-200 text-xs outline-none font-mono"
                >
                  <option value={1}>Rank 1 (40 CP Budget)</option>
                  <option value={2}>Rank 2 (50 CP Budget)</option>
                  <option value={3}>Rank 3 (60 CP Budget)</option>
                  <option value={4}>Rank 4 (70 CP Budget)</option>
                </select>
              </div>
            </div>

            {/* Step 2: Form Package (Physical Body / Chassis) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <label className="font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[9px]">1</span>
                  <span>CHOOSE FORM PACKAGE (15 CP CHASSIS)</span>
                </label>
                <span className="text-purple-400 font-bold uppercase">{activeChassis.label}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {FORM_PACKAGES.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFormId(f.id)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedFormId === f.id
                        ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[10.5px] truncate">{f.name}</div>
                    <div className="text-[9px] text-slate-500 truncate font-sans">{f.archetypeDesc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Function Package (The Role / Job) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase flex items-center gap-1.5 text-[10px]">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[9px]">2</span>
                <span>CHOOSE FUNCTION PACKAGE (25 CP TACTICAL ROLE)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {FUNCTION_PACKAGES.map(fn => (
                  <button
                    key={fn.id}
                    type="button"
                    onClick={() => setSelectedFunctionId(fn.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedFunctionId === fn.id
                        ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-slate-100">{fn.name}</div>
                    <p className="text-[9.5px] text-slate-400 font-sans mt-0.5 line-clamp-2">{fn.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Command Economy & Tether Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[10px]">
              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1">COMMAND ECONOMY MODE</label>
                <select
                  value={commandMode}
                  onChange={(e) => setCommandMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-lg text-slate-200 outline-none font-mono"
                >
                  {COMMAND_ECONOMY_MODES.map(cm => (
                    <option key={cm.id} value={cm.id}>
                      {cm.label} ({cm.actionCost})
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-slate-500 block mt-1 font-sans">
                  {COMMAND_ECONOMY_MODES.find(c => c.id === commandMode)?.desc}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1">TETHER / SENSORY LINK RANGE</label>
                <input
                  type="text"
                  value={commandTether}
                  onChange={(e) => setCommandTether(e.target.value)}
                  placeholder="e.g. Voice / Visual (50ft), Data-Tether (1 mile)"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-lg text-slate-200 outline-none font-mono"
                />
                <span className="text-[9px] text-slate-500 block mt-1 font-sans">
                  Beyond range, companion reverts to Default Protocol (Wait, Return, or Hide).
                </span>
              </div>
            </div>

            {/* Step 5: Equipment Sockets (UDU) */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                EQUIPMENT SOCKETS &amp; HARDPOINTS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={customSocketText}
                onChange={(e) => setCustomSocketText(e.target.value)}
                placeholder="e.g. Camera Collar (1 Socket), Built-in Dartgun (1 Socket), Saddle Rig (1 Mount)"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-purple-400 rounded-lg text-slate-200 text-xs outline-none font-mono"
              />
            </div>

            {/* Calculated Vitals & Telemetry Preview */}
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] flex items-center justify-between">
              <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">Calculated Integrity:</span>
              {activeForm.category === 'synthetic' ? (
                <span className="font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Cpu size={13} className="text-amber-400" />
                  STRUCTURE: {activeForm.baseStructure || ((activeForm.baseHealth || 25) + (activeForm.baseVitality || 25))} SP
                  <span className="text-[9px] text-slate-400 font-sans font-normal">(Immune to Non-Lethal)</span>
                </span>
              ) : activeForm.category === 'metaphysical' ? (
                <span className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cyan-400" />
                  ESSENCE: {activeForm.baseHealth || 20}
                </span>
              ) : (
                <span className="font-mono font-bold text-emerald-300 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Heart size={13} className="text-emerald-400" />
                    HEALTH: {activeForm.baseHealth || 25}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-300">
                    VITALITY: {activeForm.baseVitality || 25}
                  </span>
                </span>
              )}
            </div>

            {/* Budget & Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400 font-bold">BUDGET ALLOCATION:</span>
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
                  {cpSpent} / {cpBudget} CP
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-900/40 cursor-pointer"
                >
                  Save Companion
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompanionsTab;