import React, { useState, useMemo } from 'react';
import {
  Dices,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Users,
  Shield,
  Flame,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import {
  classifyCombatant,
  getCombatantReflexBonus,
  rollCombatantInitiative,
  rollAllInitiatives,
  rollPcInitiatives,
  rollNpcInitiatives,
  sortInitiativeOrder,
  ENVIRONMENT_PRESETS
} from '../../../../services/initiativeService';
import { ACTOR_TYPES, AdventureLogService } from '../../../../services/adventureLogService';
import { AudioService } from '../../../../services/audioService';

export default function InitiativeManagerModal({
  isOpen,
  onClose,
  tokens = [],
  environmentCombatants = [],
  onUpdateTokens,
  onUpdateEnvironmentCombatants,
  personaRoster = [],
  characterData = null,
  currentRound = 1,
  onSetRound,
  onSetActiveTurnTokenId
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pcs' | 'npcs' | 'environment'
  const [customEnvName, setCustomEnvName] = useState('');
  const [customEnvCount, setCustomEnvCount] = useState(10);
  const [showAddEnv, setShowAddEnv] = useState(false);

  // Map hero roster by doc-id / id
  const heroMap = useMemo(() => {
    const map = {};
    (personaRoster || []).forEach(p => {
      const id = p['character-doc-id'] || p.id;
      if (id) map[id] = p;
    });
    if (characterData) {
      const id = characterData['character-doc-id'] || characterData.id;
      if (id) map[id] = characterData;
    }
    return map;
  }, [personaRoster, characterData]);

  if (!isOpen) return null;

  // Active unit tokens (exclude portal links)
  const unitTokens = tokens.filter(t => t.type !== 'link');

  // Categorize
  const pcTokens = unitTokens.filter(t => classifyCombatant(t) === ACTOR_TYPES.PC);
  const npcTokens = unitTokens.filter(t => classifyCombatant(t) === ACTOR_TYPES.NPC);

  // Combined combatants for preview
  const combinedList = [...unitTokens, ...environmentCombatants];
  const sortedOrder = sortInitiativeOrder(combinedList);

  // 1-Click Roll All
  const handleRollAll = () => {
    AudioService.playTerminalBeep(1200, 0.08);
    const { updatedTokens, updatedEnv, sorted } = rollAllInitiatives(
      tokens,
      environmentCombatants,
      heroMap,
      currentRound
    );

    if (onUpdateTokens) onUpdateTokens(updatedTokens);
    if (onUpdateEnvironmentCombatants) onUpdateEnvironmentCombatants(updatedEnv);
    if (onSetActiveTurnTokenId && sorted.length > 0) {
      onSetActiveTurnTokenId(sorted[0].id);
    }
  };

  // Roll PCs only
  const handleRollPcs = () => {
    AudioService.playTerminalBeep(1100, 0.05);
    const updated = rollPcInitiatives(tokens, heroMap, currentRound);
    if (onUpdateTokens) onUpdateTokens(updated);
  };

  // Roll NPCs only
  const handleRollNpcs = () => {
    AudioService.playTerminalBeep(950, 0.05);
    const updated = rollNpcInitiatives(tokens, currentRound);
    if (onUpdateTokens) onUpdateTokens(updated);
  };

  // Individual Re-roll
  const handleRerollIndividual = (combatant) => {
    AudioService.playTerminalBeep(1050, 0.04);
    const actorType = classifyCombatant(combatant);

    if (actorType === ACTOR_TYPES.ENVIRONMENT) {
      const rollData = rollCombatantInitiative(combatant, null, { rollEnvironment: true });
      const nextEnv = environmentCombatants.map(e =>
        e.id === combatant.id ? { ...e, initiative: rollData.total, initiativeRollDetails: rollData.details } : e
      );
      if (onUpdateEnvironmentCombatants) onUpdateEnvironmentCombatants(nextEnv);

      AdventureLogService.logInitiativeRoll({
        actor: combatant.name || combatant.label,
        actorType: ACTOR_TYPES.ENVIRONMENT,
        rollSubtotal: rollData.rollSubtotal,
        modifier: rollData.modifier,
        total: rollData.total,
        details: rollData.details,
        round: currentRound
      });
    } else {
      const hero = combatant.linkedHeroId ? heroMap[combatant.linkedHeroId] : null;
      const rollData = rollCombatantInitiative(combatant, hero);
      const nextTokens = tokens.map(t =>
        t.id === combatant.id ? { ...t, initiative: rollData.total, initiativeRollDetails: rollData.details } : t
      );
      if (onUpdateTokens) onUpdateTokens(nextTokens);

      AdventureLogService.logInitiativeRoll({
        actor: combatant.label || 'Unit',
        actorType,
        rollSubtotal: rollData.rollSubtotal,
        modifier: rollData.modifier,
        total: rollData.total,
        details: rollData.details,
        round: currentRound
      });
    }
  };

  // Manual update of initiative number
  const handleManualInitChange = (combatantId, isEnv, newVal) => {
    const val = parseInt(newVal, 10);
    const num = isNaN(val) ? 0 : val;

    if (isEnv) {
      const nextEnv = environmentCombatants.map(e =>
        e.id === combatantId ? { ...e, initiative: num } : e
      );
      if (onUpdateEnvironmentCombatants) onUpdateEnvironmentCombatants(nextEnv);
    } else {
      const nextTokens = tokens.map(t =>
        t.id === combatantId ? { ...t, initiative: num } : t
      );
      if (onUpdateTokens) onUpdateTokens(nextTokens);
    }
  };

  // Add Environmental Preset
  const handleAddEnvironmentPreset = (preset) => {
    AudioService.playTerminalBeep(980, 0.05);
    const newEnv = {
      id: `env_${preset.id}_${Date.now()}`,
      name: preset.name,
      label: preset.name,
      icon: preset.icon,
      type: 'environment',
      actorType: ACTOR_TYPES.ENVIRONMENT,
      isEnvironment: true,
      initiative: preset.defaultCount,
      defaultCount: preset.defaultCount,
      bonusMod: preset.bonusMod || 0,
      description: preset.description
    };

    const nextList = [...environmentCombatants, newEnv];
    if (onUpdateEnvironmentCombatants) onUpdateEnvironmentCombatants(nextList);

    AdventureLogService.log({
      category: 'initiative',
      type: 'environment_added',
      actor: preset.name,
      actorType: ACTOR_TYPES.ENVIRONMENT,
      round: currentRound,
      badge: preset.icon,
      summary: `Added Environmental Initiative: ${preset.name} (Count #${preset.defaultCount})`,
      details: preset.description
    });
  };

  // Add Custom Environmental Event
  const handleAddCustomEnv = (e) => {
    e.preventDefault();
    if (!customEnvName.trim()) return;

    AudioService.playTerminalBeep(1000, 0.04);
    const newEnv = {
      id: `env_custom_${Date.now()}`,
      name: customEnvName.trim(),
      label: customEnvName.trim(),
      icon: '🌋',
      type: 'environment',
      actorType: ACTOR_TYPES.ENVIRONMENT,
      isEnvironment: true,
      initiative: parseInt(customEnvCount, 10) || 10,
      defaultCount: parseInt(customEnvCount, 10) || 10,
      bonusMod: 0,
      description: 'Custom environmental event / countdown.'
    };

    const nextList = [...environmentCombatants, newEnv];
    if (onUpdateEnvironmentCombatants) onUpdateEnvironmentCombatants(nextList);

    AdventureLogService.log({
      category: 'initiative',
      type: 'environment_added',
      actor: newEnv.name,
      actorType: ACTOR_TYPES.ENVIRONMENT,
      round: currentRound,
      badge: '🌋',
      summary: `Added Environmental Initiative: ${newEnv.name} (Count #${newEnv.initiative})`,
      details: 'Custom GM-defined round event.'
    });

    setCustomEnvName('');
    setShowAddEnv(false);
  };

  // Remove Environmental Event
  const handleRemoveEnv = (envId) => {
    const nextList = environmentCombatants.filter(e => e.id !== envId);
    if (onUpdateEnvironmentCombatants) onUpdateEnvironmentCombatants(nextList);
  };

  // Reset / Clear Initiative
  const handleClearInitiative = () => {
    AudioService.playCombatHit(false);
    const clearedTokens = tokens.map(t => ({ ...t, initiative: null, initiativeRollDetails: null }));
    const clearedEnv = environmentCombatants.map(e => ({ ...e, initiative: null }));
    if (onUpdateTokens) onUpdateTokens(clearedTokens);
    if (onUpdateEnvironmentCombatants) onUpdateEnvironmentCombatants(clearedEnv);

    AdventureLogService.log({
      category: 'initiative',
      type: 'initiative_cleared',
      actor: 'Architect',
      actorType: ACTOR_TYPES.GM,
      round: currentRound,
      badge: '↻',
      summary: 'Initiative counts reset for all combatants.',
      details: 'Encounter initiative cleared.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#0b1019] border border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150 text-slate-200">
        
        {/* ── HEADER ── */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Dices size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm tracking-wider uppercase text-amber-300">
                  Encounter Initiative Manager
                </h2>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  2d10 + Reflex Check
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {unitTokens.length} Units · {environmentCombatants.length} Environmental Hazards · Round #{currentRound}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer text-base leading-none font-bold"
            title="Close Manager"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── BATCH ROLLING RIBBON ── */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRollAll}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs font-mono uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 cursor-pointer"
              title="Roll canonical 2d10 + Reflex checks for all PCs, NPCs, and Environment"
            >
              <Dices size={14} />
              <span>Roll All (PCs + NPCs + Env)</span>
            </button>

            <button
              type="button"
              onClick={handleRollPcs}
              className="px-2.5 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/60 font-bold text-xs font-mono uppercase rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Roll 2d10 + Reflex for Player Characters only"
            >
              <Users size={13} />
              <span>Roll PCs ({pcTokens.length})</span>
            </button>

            <button
              type="button"
              onClick={handleRollNpcs}
              className="px-2.5 py-1.5 bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-500/60 font-bold text-xs font-mono uppercase rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Roll 2d10 + Agility for NPCs & Adversaries only"
            >
              <Shield size={13} />
              <span>Roll NPCs ({npcTokens.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddEnv(prev => !prev)}
              className="px-2.5 py-1.5 bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-500/60 font-bold text-xs font-mono uppercase rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Add Environmental Lair Event or Hazard to Initiative"
            >
              <Flame size={13} />
              <span>+ Environmental Hazard</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleClearInitiative}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset initiative values for all combatants"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>

        {/* ── ENVIRONMENTAL HAZARDS PRESETS DRAWER ── */}
        {showAddEnv && (
          <div className="p-3 bg-[#0d121c] border-b border-amber-500/30 flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase font-mono flex items-center gap-1.5">
                <Flame size={13} /> Add Environmental Event into Initiative Phase
              </span>
              <span className="text-[10px] text-slate-400">Acts alongside PCs and NPCs</span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {ENVIRONMENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAddEnvironmentPreset(preset)}
                  className="p-2 bg-slate-900/90 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500/60 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 flex items-center gap-1.5">
                      <span>{preset.icon}</span> {preset.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 bg-amber-950 text-amber-400 rounded border border-amber-600/50">
                      Init #{preset.defaultCount}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{preset.description}</p>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleAddCustomEnv} className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <input
                type="text"
                value={customEnvName}
                onChange={(e) => setCustomEnvName(e.target.value)}
                placeholder="Custom Hazard Name (e.g. Orbital Strike, Fire Spread)..."
                className="bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs px-2.5 py-1.5 rounded-lg flex-1 outline-none text-white"
              />
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Init #:</span>
                <input
                  type="number"
                  value={customEnvCount}
                  onChange={(e) => setCustomEnvCount(parseInt(e.target.value, 10) || 0)}
                  className="w-12 bg-transparent text-xs text-amber-300 font-mono font-bold outline-none text-center"
                />
              </div>
              <button
                type="submit"
                disabled={!customEnvName.trim()}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        )}

        {/* ── FILTER TABS & TURN ORDER PREVIEW ── */}
        <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 font-mono text-xs">
            {[
              { id: 'all', label: `All (${combinedList.length})` },
              { id: 'pcs', label: `PCs (${pcTokens.length})` },
              { id: 'npcs', label: `NPCs (${npcTokens.length})` },
              { id: 'environment', label: `Environment (${environmentCombatants.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <span>High roll goes first (Defenders win ties)</span>
          </div>
        </div>

        {/* ── COMBATANT LIST TABLE ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sortedOrder.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No combatants on the tactical battlemap. Drop hero or enemy tokens onto the canvas to populate.
            </div>
          ) : (
            sortedOrder.map((c, index) => {
              const actorType = classifyCombatant(c);
              const isEnv = actorType === ACTOR_TYPES.ENVIRONMENT;
              const isPc = actorType === ACTOR_TYPES.PC;
              const hero = c.linkedHeroId ? heroMap[c.linkedHeroId] : null;
              const reflexBonus = getCombatantReflexBonus(c, hero);

              // Filter by active tab
              if (activeTab === 'pcs' && !isPc) return null;
              if (activeTab === 'npcs' && (isPc || isEnv)) return null;
              if (activeTab === 'environment' && !isEnv) return null;

              return (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isPc
                      ? 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400/60'
                      : isEnv
                      ? 'bg-amber-950/20 border-amber-600/50 hover:border-amber-500'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Position Rank, Avatar/Icon, Label, Type Badge */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-400">
                      #{index + 1}
                    </span>

                    {c.avatarUrl ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-400 shrink-0">
                        <img src={c.avatarUrl} alt={c.label} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 border border-slate-700"
                        style={{ backgroundColor: c.color || (isPc ? '#0284c7' : isEnv ? '#f59e0b' : '#ef4444') }}
                      >
                        {isEnv ? (c.icon || '🌋') : isPc ? '🛡️' : '⚔️'}
                      </div>
                    )}

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {c.label || c.name || 'Combatant'}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded border text-[8.5px] font-mono font-bold uppercase ${
                            isPc
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-600/50'
                              : isEnv
                              ? 'bg-amber-950 text-amber-300 border-amber-600/50'
                              : 'bg-rose-950 text-rose-300 border-rose-600/50'
                          }`}
                        >
                          {isPc ? 'PC' : isEnv ? 'ENV' : 'NPC'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isEnv
                          ? (c.description || 'Environmental hazard round action')
                          : `Reflex Mod: +${reflexBonus} (2d10 Check)`}
                      </span>
                    </div>
                  </div>

                  {/* Right: Roll Details, Initiative Input, Re-roll Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {c.initiativeRollDetails && (
                      <span className="text-[9.5px] font-mono text-slate-500 hidden md:inline truncate max-w-[180px]">
                        {c.initiativeRollDetails}
                      </span>
                    )}

                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                      <span className="text-[9px] font-mono font-bold text-amber-400">INIT:</span>
                      <input
                        type="number"
                        value={c.initiative !== undefined && c.initiative !== null ? c.initiative : ''}
                        onChange={(e) => handleManualInitChange(c.id, isEnv, e.target.value)}
                        placeholder="--"
                        className="w-10 bg-transparent text-center font-mono font-bold text-xs text-white outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRerollIndividual(c)}
                      className="p-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/60 rounded-lg transition-colors cursor-pointer"
                      title={`Re-roll 2d10 initiative for ${c.label || c.name}`}
                    >
                      <Dices size={14} />
                    </button>

                    {isEnv && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEnv(c.id)}
                        className="p-1.5 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Remove Environmental Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Active Encounter:</span>
            <span className="text-xs font-mono font-bold text-amber-300">Round #{currentRound}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
