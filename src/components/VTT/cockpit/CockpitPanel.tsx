/**
 * @file CockpitPanel.tsx
 * @description Right Zone: Operational Cockpit (Player) & Dynamic Inspector (GM).
 * Built strictly on Tangent SF RP rules: 4 AP Action Economy, Armor DR,
 * Called Shots & Trauma thresholds, Essence invocations, Mecha sockets,
 * and multi-monitor Popout Portal.
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Target, 
  Activity, 
  Cpu, 
  FileText, 
  Swords,
  Shield,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { TangentActionDeck } from './TangentActionDeck';
import type { CalledShotLocation } from './TangentActionDeck';
import { MechaCompanionDeck } from './MechaCompanionDeck';
import { GMInspector } from './GMInspector';
import { PopoutPortal } from './PopoutPortal';
import { AimeCockpitDeck } from './AimeCockpitDeck';
import { queryOmnicortexRAG } from '../../../services/omnicortexVectorRag';
import { parseRollCommand } from '../../../services/bastionService.js';
import { analyzeCombatPacing, executeWhisperCardAction, CANONICAL_WHISPER_CARDS } from '../../../services/bastionWhisperService.js';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';

export const CockpitPanel: React.FC = () => {
  const { 
    activeCockpitTab, 
    setActiveCockpitTab, 
    userRole, 
    setUserRole 
  } = useUILayoutStore();

  const folio = (useFolio() || {}) as any;
  const character = folio?.characterData || {};

  // Tangent Rules State
  const [calledShotTarget, setCalledShotTarget] = useState<CalledShotLocation>('torso');

  // Popout state for multi-monitor native window
  const [isPoppedOut, setIsPoppedOut] = useState<boolean>(false);

  // Notes state with persistence
  const [fieldNotes, setFieldNotes] = useState<string>(() => {
    return localStorage.getItem('tangent_vtt_notes') || '';
  });

  // Bastion HQ Tactical Rules & Logistics State
  const stageTokens = useEngineStore(selectAllFusedTokens);
  const [bastionRuleQuery, setBastionRuleQuery] = useState<string>('2d10 dual resolution opposed defense');
  const [bastionRollInput, setBastionRollInput] = useState<string>('/roll 2d10+4 vs 15');
  const [bastionRollResult, setBastionRollResult] = useState<any>(null);
  const [bastionWhisperBanner, setBastionWhisperBanner] = useState<string>('');
  const [strongholdSystems, setStrongholdSystems] = useState<Record<string, boolean>>({
    perimeterShields: true,
    orbitalDropBeacon: true,
    medBayAutodoc: true,
    omnicortexUplink: true
  });

  const bastionWhisperPacing = React.useMemo(() => {
    return analyzeCombatPacing(stageTokens as any[], 1);
  }, [stageTokens]);

  const handleExecuteWhisperCard = (cardId: string) => {
    const res: any = executeWhisperCardAction(cardId, stageTokens as any[], 1);
    if (res.spawnedTokens && res.spawnedTokens.length > 0) {
      const staticSpawns = res.spawnedTokens.map((sp: any, idx: number) => ({
        id: `${sp.id}_${Date.now()}_${idx}`,
        name: sp.name,
        species: 'Human',
        archetype: 'Tier 1 Drop-Trooper',
        size_modifier: 0,
        base_hp: 60,
        base_vitality: 30,
        base_health: 30,
        armor_dr: sp.armorDr || 4,
        speed_ft: 30,
        avatar_url: '',
        is_persona: false
      }));
      useEngineStore.getState().loadStaticEntitiesBatch(staticSpawns);
    }
    if (cardId === 'environmental_surge') {
      stageTokens.forEach((t) => {
        if (!t.active_conditions.includes('Cover')) {
          useEngineStore.getState().toggleCondition(t.id, 'Cover');
        }
      });
    } else if (cardId === 'tactical_retreat') {
      stageTokens.filter((t) => !t.is_persona).forEach((t) => {
        if (!t.active_conditions.includes('Cover')) {
          useEngineStore.getState().toggleCondition(t.id, 'Cover');
        }
      });
    } else if (cardId === 'heroic_inspiration' && folio?.awardCharacterKarma) {
      const heroId = character?.['character-doc-id'] || character?.id;
      if (heroId) folio.awardCharacterKarma(heroId, 1);
    }
    setBastionWhisperBanner(res.logEntry);
  };

  const bastionRagResults = React.useMemo(() => {
    return queryOmnicortexRAG(bastionRuleQuery || '2d10 combat resolution', 3);
  }, [bastionRuleQuery]);

  const handleBastionRoll = () => {
    const res = parseRollCommand(bastionRollInput.trim().startsWith('/roll') ? bastionRollInput.trim() : `/roll ${bastionRollInput.trim()}`);
    setBastionRollResult(res);
  };

  const toggleStrongholdSystem = (key: string) => {
    setStrongholdSystems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotesChange = (val: string) => {
    setFieldNotes(val);
    localStorage.setItem('tangent_vtt_notes', val);
  };

  // Canonical Tangent Survival & Defensive Pools per 3.00 COMBAT.md
  const isSynthetic = Boolean(
    character?.is_synthetic ||
    character?.species?.toLowerCase()?.includes('synthetic') ||
    character?.species?.toLowerCase()?.includes('construct') ||
    character?.species?.toLowerCase()?.includes('automata')
  );

  const vitalityCurrent = character?.vitality?.current ?? character?.['hit-points']?.current ?? 30;
  const vitalityMax = character?.vitality?.max ?? character?.base_vitality ?? 30;

  const healthCurrent = character?.health?.current ?? character?.base_health ?? 30;
  const healthMax = character?.health?.max ?? character?.base_health ?? 30;

  const structureCurrent = character?.structure?.current ?? character?.base_structure ?? 60;
  const structureMax = character?.structure?.max ?? character?.base_structure ?? 60;

  const staminaScore = character?.attributes?.sta ?? character?.attributes?.con ?? 0;
  const staminaDr = character?.stamina_dr ?? Math.max(0, staminaScore);
  const stabilityCurrent = character?.stability_points ?? Math.max(5, staminaScore + 5);
  const stabilityMax = Math.max(5, staminaScore + 5);

  const kineticDr = character?.['armor-dr']?.kinetic ?? character?.armor_dr ?? 6;
  const energyDr = character?.['armor-dr']?.energy ?? 4;
  const agilityScore = character?.attributes?.agi ?? character?.attributes?.dex ?? 0;
  const walkSpeed = Math.max(15, 30 + agilityScore * 5);
  const characterName = character?.name || 'Operative Echo';

  const cockpitContent = (
    <div className="w-full h-full flex flex-col bg-[#0c1017] text-slate-200 overflow-hidden font-sans select-none">
      {/* ========================================================================= */}
      {/* COCKPIT HEADER: Role Switcher & Popout Button                             */}
      {/* ========================================================================= */}
      <div className="h-10 px-3 border-b border-slate-800/80 bg-[#0d121a] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Activity size={13} />
            {userRole === 'gm' ? 'DYNAMIC INSPECTOR' : 'OPERATIVE COCKPIT'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Popout Button for Secondary Display */}
          <button
            type="button"
            onClick={() => setIsPoppedOut(true)}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
            title="Pop out into native OS window for secondary monitor"
          >
            <ExternalLink size={13} />
          </button>

          {/* Role Toggle Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => {
                setUserRole('player');
                if (activeCockpitTab === 'inspector') setActiveCockpitTab('vitals');
              }}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
                userRole === 'player'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Player
            </button>
            <button
              type="button"
              onClick={() => {
                setUserRole('gm');
                setActiveCockpitTab('inspector');
              }}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
                userRole === 'gm'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              GM
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION VITALS BAR: Dual Vitality/Health or Structure, STA DR & Pace       */}
      {/* ========================================================================= */}
      <div className="p-2.5 border-b border-slate-800/80 bg-[#0a0e14] shrink-0 space-y-2">
        {/* Name & Identity */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-100 truncate">{characterName}</span>
          <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
            PACE: {walkSpeed}ft
          </span>
        </div>

        {/* Dynamic Survival Pools: Structure for Synthetics vs Dual Vitality & Health for Organics */}
        {isSynthetic ? (
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-0.5">
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <Cpu size={10} /> STRUCTURE:
              </span>
              <span className="text-slate-200 font-bold">{structureCurrent} / {structureMax} SP</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, (structureCurrent / structureMax) * 100))}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Vitality Pool (Fast Recovery, Non-lethal buffer) */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-0.5">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Activity size={10} /> VITALITY (Buffer):
                </span>
                <span className="text-cyan-200 font-bold">{vitalityCurrent} / {vitalityMax} VP</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (vitalityCurrent / vitalityMax) * 100))}%` }}
                />
              </div>
            </div>

            {/* Health Pool (Slow Recovery, Lethal bleedout trigger) */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-0.5">
                <span className="text-rose-400 flex items-center gap-1">
                  <Heart size={10} /> HEALTH (Lethal):
                </span>
                <span className="text-rose-200 font-bold">{healthCurrent} / {healthMax} HP</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    healthCurrent <= 0 
                      ? 'bg-rose-900 animate-pulse' 
                      : 'bg-gradient-to-r from-red-600 to-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (healthCurrent / healthMax) * 100))}%` }}
                />
              </div>
            </div>

            {/* Mortality State Alert */}
            {healthCurrent <= 0 && (
              <div className="text-[10px] font-mono text-red-400 bg-red-950/80 border border-red-500/60 rounded px-1.5 py-0.5 flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider animate-pulse">Mortality: Bleeding Out</span>
                <span>Stability: {stabilityCurrent} / {stabilityMax}</span>
              </div>
            )}
          </div>
        )}

        {/* Defensive & Kinetic Quick Counters */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5 text-[10px] font-mono">
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">KIN DR</span>
            <span className="font-bold text-cyan-300">{kineticDr}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">ENG DR</span>
            <span className="font-bold text-sky-300">{energyDr}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">STA SOAK</span>
            <span className="font-bold text-emerald-400">+{staminaDr}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500">STABILITY</span>
            <span className="font-bold text-amber-300">{stabilityCurrent}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COCKPIT SUB-TABS STRIP                                                    */}
      {/* ========================================================================= */}
      <div className="h-8 px-2 border-b border-slate-800/80 bg-[#0d121a] flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveCockpitTab('vitals')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'vitals' || activeCockpitTab === 'actions'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords size={11} />
          <span>Actions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCockpitTab('mecha')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'mecha'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu size={11} />
          <span>Mecha & Sockets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCockpitTab('bastion')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'bastion'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield size={11} />
          <span>Bastion</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCockpitTab('inspector')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'inspector'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target size={11} />
          <span>Inspector</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCockpitTab('aime')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'aime'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={11} className="text-amber-400" />
          <span>AIME</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCockpitTab('notes')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
            activeCockpitTab === 'notes'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={11} />
          <span>Notes</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* COCKPIT TAB BODY                                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
        {/* TAB 1: TANGENT ACTION DECK (Skill Actions, Called Shots, Defenses, Tactics, Essence) */}
        {(activeCockpitTab === 'vitals' || activeCockpitTab === 'actions') && (
          <TangentActionDeck
            calledShotTarget={calledShotTarget}
            onSetCalledShotTarget={setCalledShotTarget}
          />
        )}

        {/* TAB 2: MECHA & MODULAR SOCKET MATRIX */}
        {activeCockpitTab === 'mecha' && (
          <MechaCompanionDeck />
        )}

        {/* TAB: BASTION HQ — COMMAND, TACTICAL RULES & LOGISTICS */}
        {activeCockpitTab === 'bastion' && (
          <div className="space-y-3 text-xs font-mono">
            {/* Header Banner */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40">
                  <Shield size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                    Bastion HQ — Command &amp; Rules Engine
                  </p>
                  <p className="text-slate-400 text-[10px] font-sans">
                    Omnicortex v6 Vector RAG, 2d10 Dual Resolution &amp; Garrison Readiness
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                ONLINE
              </span>
            </div>

            {/* 2d10 Dual Resolution Roll Tester */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400">
                  🎲 2d10 Dual Resolution Resolver
                </span>
                <span className="text-[9px] text-slate-500">Defender Wins Ties</span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={bastionRollInput}
                  onChange={(e) => setBastionRollInput(e.target.value)}
                  placeholder="/roll 2d10+4 vs 15"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500/60"
                />
                <button
                  type="button"
                  onClick={handleBastionRoll}
                  className="px-2.5 py-1 rounded bg-amber-600/80 hover:bg-amber-500 text-black font-bold text-[10px] uppercase cursor-pointer"
                >
                  Roll
                </button>
              </div>
              {bastionRollResult && !bastionRollResult.error && (
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Dice: [{bastionRollResult.d1}, {bastionRollResult.d2}] ({bastionRollResult.modifier >= 0 ? `+${bastionRollResult.modifier}` : bastionRollResult.modifier})
                    </span>
                    <span className="font-bold text-amber-300">Total: {bastionRollResult.total}</span>
                  </div>
                  <div className="text-cyan-300 font-bold">{bastionRollResult.outcomeText}</div>
                  <div className="text-slate-400 font-sans text-[10px]">{bastionRollResult.degreeDetails}</div>
                </div>
              )}
            </div>

            {/* Omnicortex Canonical Rulebook RAG Lookup */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  📚 Omnicortex Canonical RAG Lookup
                </span>
                <span className="text-[9px] text-slate-500">Top {bastionRagResults.length} Chunks</span>
              </div>
              <input
                type="text"
                value={bastionRuleQuery}
                onChange={(e) => setBastionRuleQuery(e.target.value)}
                placeholder="Search combat, karma, economatrix, species..."
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500/60"
              />
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {bastionRagResults.map(({ chunk, score }) => (
                  <div key={chunk.id} className="p-2 rounded bg-slate-900/80 border border-slate-800/90 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-amber-300 truncate">{chunk.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase shrink-0">
                        {chunk.category} ({(score * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-sans leading-snug line-clamp-3">
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* BASTION Co-GM Whisper Pacing Deck & 1-Click Stage Mutations */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-purple-400">
                  🧠 BASTION Co-GM Pacing Whispers
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                  style={{
                    backgroundColor: `${bastionWhisperPacing.pacingColor}22`,
                    color: bastionWhisperPacing.pacingColor,
                    border: `1px solid ${bastionWhisperPacing.pacingColor}55`
                  }}
                >
                  Tension {bastionWhisperPacing.tensionScore}%
                </span>
              </div>
              <div className="text-[10px] text-slate-300 font-semibold">
                {bastionWhisperPacing.pacingLabel}
              </div>
              {bastionWhisperPacing.advice && (
                <p className="text-[9.5px] text-slate-400 font-sans leading-snug">
                  {bastionWhisperPacing.advice}
                </p>
              )}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(bastionWhisperPacing.suggestedCards?.length
                  ? bastionWhisperPacing.suggestedCards
                  : CANONICAL_WHISPER_CARDS.slice(0, 3)
                ).map((card: any) => (
                  <div
                    key={card.id}
                    className="p-2 rounded bg-slate-900/90 border border-slate-800/90 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-slate-200 truncate">
                        {card.icon} {card.label}
                      </div>
                      <div className="text-[9px] text-slate-400 font-sans truncate">
                        {card.actionEffect}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExecuteWhisperCard(card.id)}
                      className="px-2 py-1 rounded bg-purple-900/70 hover:bg-purple-700 text-purple-200 border border-purple-500/40 text-[9px] font-bold uppercase shrink-0 cursor-pointer"
                    >
                      Inject
                    </button>
                  </div>
                ))}
              </div>
              {bastionWhisperBanner && (
                <div className="p-2 rounded bg-purple-950/50 border border-purple-500/40 text-[9.5px] text-purple-200 font-sans">
                  {bastionWhisperBanner}
                </div>
              )}
            </div>

            {/* Stronghold & Garrison Logistics */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                🛰️ Stronghold &amp; Garrison Systems
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'perimeterShields', label: 'Perimeter Shields' },
                  { key: 'orbitalDropBeacon', label: 'Orbital Supply Drop' },
                  { key: 'medBayAutodoc', label: 'Med-Bay Autodoc' },
                  { key: 'omnicortexUplink', label: 'Omnicortex Uplink' }
                ].map((sys) => {
                  const active = strongholdSystems[sys.key];
                  return (
                    <button
                      key={sys.key}
                      type="button"
                      onClick={() => toggleStrongholdSystem(sys.key)}
                      className={`p-1.5 rounded border text-left transition-colors cursor-pointer flex items-center justify-between ${
                        active
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] truncate">{sys.label}</span>
                      <span className="text-[9px] font-bold">{active ? 'ON' : 'OFF'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GM DYNAMIC INSPECTOR & MULTI-ENTITY BATCH CONTROLS */}
        {activeCockpitTab === 'inspector' && (
          <GMInspector />
        )}

        {/* TAB 4: AIME CO-PILOT DECK (Sensory Read-Aloud, Tactical Barks, Transmutation) */}
        {activeCockpitTab === 'aime' && (
          <AimeCockpitDeck />
        )}

        {/* TAB 4: PERSISTED FIELD NOTES */}
        {activeCockpitTab === 'notes' && (
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-slate-300 font-bold flex items-center gap-1.5">
              <FileText size={14} className="text-amber-400" />
              <span>FIELD NOTES & REVEALED CLUES</span>
            </div>
            <textarea
              value={fieldNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Record operational coordinates, intercepted transmissions, tactical clues..."
              className="w-full h-48 p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none scrollbar-thin"
            />
            <div className="text-[10px] text-slate-500 text-right">
              Persisted to local storage &bull; {fieldNotes.length} characters
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PopoutPortal
      title="Tangent SF RP - Operative Cockpit"
      isOpen={isPoppedOut}
      onClose={() => setIsPoppedOut(false)}
    >
      {cockpitContent}
    </PopoutPortal>
  );
};

export default CockpitPanel;
