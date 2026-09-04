/**
 * @file GMInspector.tsx
 * @description GM Dynamic Inspector Panel.
 * Handles granular single-entity inspection and manipulation,
 * as well as multi-entity batch controls via MultiSelectCard.
 * Integrated with Folio: dynamic XP awards, Karma updates, Status Conditions,
 * and Player Sheet Modification Review pipeline (Strict Player-Ownership Guarantee).
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Activity, 
  Users,
  Award,
  Sparkles,
  ShieldCheck,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useEngineStore, selectAllFusedTokens } from '../../../engine/index';
import { MultiSelectCard } from './MultiSelectCard';
import { AudioService } from '../../../services/audioService';
import { useFolio } from '../../../context/FolioContext';
import { GMModificationReviewModal } from './GMModificationReviewModal';

const AVAILABLE_CONDITIONS = [
  'Cover',
  'Aiming',
  'Stunned',
  'Blinded',
  'Burning',
  'Suppressed',
  'Overwatch',
  'Prone',
  'Bleeding'
];

export const GMInspector: React.FC = () => {
  const tokens = useEngineStore(selectAllFusedTokens);
  const selectedTokens = tokens.filter(t => t.is_selected);

  // Folio state & dynamic interaction
  const folio = (useFolio() || {}) as any;
  const { 
    personaRoster = [], 
    updateCharacterHealth, 
    awardExperience, 
    awardCharacterKarma, 
    applyVTTStatusConditions,
    setPersonaAllowPlayerOverride
  } = folio;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewTargetHeroId, setReviewTargetHeroId] = useState<string | null>(null);

  // Single selected token
  const currentToken = selectedTokens.length === 1 ? selectedTokens[0] : null;

  // Matched persona in roster if current token is a hero
  const matchedPersona = currentToken?.is_persona 
    ? personaRoster.find((c: any) => {
        const cId = c['character-doc-id'] || c.id;
        return cId === (currentToken as any).character_doc_id || cId === currentToken.id || currentToken.id.startsWith(cId + '-');
      })
    : null;

  const resolvedHeroId = matchedPersona ? (matchedPersona['character-doc-id'] || matchedPersona.id) : ((currentToken as any)?.character_doc_id || currentToken?.id);

  const personaPendingMods = (matchedPersona?.tracked_modifications || []).filter((m: any) => m.status === 'pending');

  // Total pending modifications across all roster personas
  const allPendingModsCount = personaRoster.reduce((acc: number, c: any) => {
    const pending = (c.tracked_modifications || []).filter((m: any) => m.status === 'pending');
    return acc + pending.length;
  }, 0);

  // Single Token Actions
  const handleApplyDamage = (amount: number) => {
    if (!currentToken) return;
    useEngineStore.getState().applyDamage(currentToken.id, amount);
    if (currentToken.is_persona && updateCharacterHealth) {
      const nextHp = Math.max(0, currentToken.current_hp - amount);
      updateCharacterHealth(resolvedHeroId, nextHp);
    }
    AudioService.playCriticalChime(true);
  };

  const handleApplyHeal = (amount: number) => {
    if (!currentToken) return;
    useEngineStore.getState().healHP(currentToken.id, amount);
    if (currentToken.is_persona && updateCharacterHealth) {
      const maxHp = currentToken.base_hp || 30;
      const nextHp = Math.min(maxHp, currentToken.current_hp + amount);
      updateCharacterHealth(resolvedHeroId, nextHp);
    }
    AudioService.playTerminalBeep();
  };

  const handleAdjustElevation = (delta: number) => {
    if (!currentToken) return;
    const next = Math.max(0, (currentToken.elevation_ft || 0) + delta);
    useEngineStore.getState().setElevation(currentToken.id, next);
  };

  const handleToggleCondition = (cond: string) => {
    if (!currentToken) return;
    useEngineStore.getState().toggleCondition(currentToken.id, cond);
    if (currentToken.is_persona && applyVTTStatusConditions) {
      const active = currentToken.active_conditions || [];
      const next = active.includes(cond) ? active.filter((c: string) => c !== cond) : [...active, cond];
      applyVTTStatusConditions(resolvedHeroId, next);
    }
    AudioService.playTerminalBeep();
  };

  const handleAwardXP = () => {
    if (!currentToken) return;
    const input = window.prompt(`Award XP (AP) to ${currentToken.name}:`, "2");
    if (!input) return;
    const amount = parseInt(input, 10);
    if (isNaN(amount) || amount <= 0) return;
    const reason = window.prompt("Reason / Campaign Milestone note:", "VTT Tactical Encounter");
    if (awardExperience) {
      awardExperience(resolvedHeroId, { amount, reason: reason || 'Tactical Award' });
      AudioService.playCriticalChime(true);
      alert(`Awarded ${amount} XP (AP) to ${currentToken.name}!`);
    }
  };

  const handleAdjustKarma = (delta: number) => {
    if (!currentToken) return;
    if (awardCharacterKarma) {
      awardCharacterKarma(resolvedHeroId, delta, "VTT Session Karma Adjustment");
      AudioService.playTerminalBeep(delta > 0 ? 1400 : 900, 0.05);
    }
  };

  const handleToggleHidden = () => {
    if (!currentToken) return;
    useEngineStore.getState().toggleHidden(currentToken.id);
    AudioService.playTerminalBeep();
  };

  const handleRemoveToken = () => {
    if (!currentToken) return;
    // Dismiss token from stage only (NEVER deleting the player's persona sheet)
    useEngineStore.getState().removeEntity(currentToken.id);
    AudioService.playTerminalBeep();
  };

  const handleDeselectAll = () => {
    useEngineStore.getState().clearSelection();
  };

  // Case 1: Multiple Tokens Selected -> MultiSelectCard
  if (selectedTokens.length > 1) {
    return (
      <MultiSelectCard 
        tokens={selectedTokens} 
        onDeselectAll={handleDeselectAll} 
      />
    );
  }

  // Case 2: Single Token Selected -> Detailed Inspection Card
  if (currentToken) {
    const isHidden = !!currentToken.is_hidden;
    const hpRatio = Math.max(0, Math.min(1, currentToken.current_hp / (currentToken.base_hp || 1)));

    return (
      <div className="space-y-2.5 font-mono text-xs select-none">
        {/* Token Header Card */}
        <div className="p-2.5 rounded-lg bg-[#0d121c] border border-cyan-500/50 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${currentToken.is_persona ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-red-400'}`} />
              <span className="font-bold text-slate-100 text-sm truncate">
                {currentToken.name || currentToken.id}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleHidden}
                className={`p-1 rounded border transition-colors cursor-pointer ${
                  isHidden
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isHidden ? 'Hidden from Players (Click to reveal)' : 'Visible to Players (Click to hide)'}
              >
                {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>

              <button
                type="button"
                onClick={handleRemoveToken}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-red-400 hover:text-red-300 hover:border-red-500/40 transition-colors cursor-pointer"
                title={currentToken.is_persona ? "Dismiss Token from Stage (Folio is protected)" : "Remove entity from stage"}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{currentToken.species || 'Humanoid'} &bull; {currentToken.archetype || 'Actor'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${
              currentToken.is_persona 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                : 'bg-slate-900 border-slate-800 text-cyan-300'
            }`}>
              {currentToken.is_persona ? 'HERO PERSONA (READY)' : 'TACTICAL ADVERSARY'}
            </span>
          </div>

          {/* Pending Modifications Alert for this Persona */}
          {currentToken.is_persona && personaPendingMods.length > 0 && (
            <div className="p-2 rounded bg-amber-950/60 border border-amber-500/80 flex items-center justify-between gap-2 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
                <AlertTriangle size={13} className="text-amber-400 animate-pulse shrink-0" />
                <span>{personaPendingMods.length} Pending Sheet Edit{personaPendingMods.length > 1 ? 's' : ''}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewTargetHeroId(currentToken.id);
                  setIsReviewModalOpen(true);
                }}
                className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] transition-colors cursor-pointer"
              >
                Review
              </button>
            </div>
          )}

          {/* GM Policy: Allow / Disallow Player Override for this Hero */}
          {currentToken.is_persona && (
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Shield size={12} className="text-amber-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-300 uppercase truncate">
                    Player Override
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {matchedPersona?.allow_player_override !== false ? 'Player can unlock sheet' : 'Sheet locked from player'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentAllowed = matchedPersona?.allow_player_override !== false;
                  if (setPersonaAllowPlayerOverride) {
                    setPersonaAllowPlayerOverride(resolvedHeroId, !currentAllowed);
                    AudioService.playTerminalBeep(!currentAllowed ? 1200 : 900, 0.05);
                  }
                }}
                className={`px-2 py-0.5 rounded font-mono text-[9.5px] font-bold border transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                  matchedPersona?.allow_player_override !== false
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
                    : 'bg-red-950/80 border-red-500/60 text-red-300 hover:bg-red-900'
                }`}
                title={matchedPersona?.allow_player_override !== false ? "Click to lock sheet and disallow player overrides" : "Click to permit player override on this persona"}
              >
                {matchedPersona?.allow_player_override !== false ? (
                  <>
                    <Unlock size={10} />
                    <span>Allowed</span>
                  </>
                ) : (
                  <>
                    <Lock size={10} />
                    <span>Disallowed</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Vitality & HP Bar */}
          <div>
            <div className="flex justify-between text-[10.5px] mb-0.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Heart size={11} className="text-red-400" /> HP:
              </span>
              <span className="font-bold text-slate-200">
                {currentToken.current_hp} / {currentToken.base_hp}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${
                  hpRatio > 0.5 ? 'bg-gradient-to-r from-emerald-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-red-600'
                }`}
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Damage & Heal Quick Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleApplyDamage(5)}
              className="flex-1 py-1 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 font-bold transition-all text-center cursor-pointer"
            >
              -5 HP
            </button>
            <button
              type="button"
              onClick={() => handleApplyDamage(1)}
              className="px-2.5 py-1 rounded bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-bold transition-all text-center cursor-pointer"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => handleApplyHeal(1)}
              className="px-2.5 py-1 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 font-bold transition-all text-center cursor-pointer"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleApplyHeal(5)}
              className="flex-1 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 font-bold transition-all text-center cursor-pointer"
            >
              +5 HP
            </button>
          </div>

          {/* Persona Dedicated Mechanics: XP Awards & Karma Controls */}
          {currentToken.is_persona && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-purple-400" />
                  VTT AWARDS &amp; KARMA
                </span>
                <span className="text-[9px] text-emerald-400">SYNCED WITH FOLIO</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleAwardXP}
                  className="py-1 px-2 rounded bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 text-purple-300 font-bold text-[10.5px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Award XP (AP) to hero persona sheet"
                >
                  <Award size={12} /> Award XP
                </button>

                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-bold px-1">KARMA</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustKarma(-1)}
                    className="flex-1 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] text-center"
                    title="Deduct 1 Karma point"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustKarma(1)}
                    className="flex-1 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold text-[10px] text-center border border-amber-500/40"
                    title="Award 1 Karma point"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Strict Player Ownership Notice */}
              <div className="text-[9.5px] text-cyan-300/70 flex items-center gap-1 bg-slate-950/50 px-2 py-1 rounded border border-slate-850">
                <ShieldCheck size={11} className="text-cyan-400 shrink-0" />
                <span>Folio is player property. Direct sheet edits/deletions locked.</span>
              </div>
            </div>
          )}
        </div>

        {/* Tactical Parameters Matrix */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">ARMOR DR</div>
            <div className="text-xs font-bold text-cyan-300">{currentToken.armor_dr || 0}</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">SPEED</div>
            <div className="text-xs font-bold text-slate-200">{currentToken.speed_ft || 30} ft</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="text-[10px] text-slate-500">ELEVATION</div>
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustElevation(-5)}
                className="text-slate-500 hover:text-slate-300"
              >
                <ChevronDown size={12} />
              </button>
              <span className="text-xs font-bold text-amber-300">{currentToken.elevation_ft || 0} ft</span>
              <button
                type="button"
                onClick={() => handleAdjustElevation(5)}
                className="text-slate-500 hover:text-slate-300"
              >
                <ChevronUp size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Conditions Matrix */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>ACTIVE CONDITIONS ({currentToken.active_conditions?.length || 0})</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {AVAILABLE_CONDITIONS.map(cond => {
              const isActive = (currentToken.active_conditions || []).includes(cond);
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => handleToggleCondition(cond)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {isActive ? `✓ ${cond}` : `+ ${cond}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* GM Modification Review Modal */}
        <GMModificationReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          targetHeroId={reviewTargetHeroId}
        />
      </div>
    );
  }

  // Case 3: Zero Tokens Selected -> General GM Stage Telemetry & Threat Overview
  const personaCount = tokens.filter(t => t.is_persona).length;
  const adversaryCount = tokens.filter(t => !t.is_persona).length;

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {/* Pending Player Sheet Modifications Banner */}
      {allPendingModsCount > 0 && (
        <div className="p-3 rounded-lg bg-amber-950/80 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-amber-200 block text-xs">
                {allPendingModsCount} Sheet Modification{allPendingModsCount > 1 ? 's' : ''} for Review
              </span>
              <span className="text-[10px] text-amber-300/80">
                Players in active session have submitted tracked changes.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setReviewTargetHeroId(null);
              setIsReviewModalOpen(true);
            }}
            className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <FileText size={12} /> Open GM Review Queue
          </button>
        </div>
      )}

      {/* Empty State Banner */}
      <div className="p-4 text-center rounded-lg bg-slate-950/40 border border-slate-850 space-y-1.5">
        <Users size={24} className="mx-auto text-cyan-400/60" />
        <div className="text-slate-300 font-bold">No Token Currently Selected</div>
        <p className="text-[10.5px] text-slate-500">
          Click on any token or actor on The Stage to inspect stats, apply direct damage, or modify conditions.
        </p>
      </div>

      {/* Stage Live Telemetry */}
      <div className="p-2.5 rounded-lg bg-[#0d121c] border border-slate-800 space-y-2">
        <div className="text-cyan-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
          <Activity size={13} />
          STAGE COMBAT TELEMETRY
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">HEROES &amp; ALLIES</span>
            <span className="text-emerald-400 font-bold text-sm">{personaCount} Active</span>
          </div>

          <div className="p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">ADVERSARIES</span>
            <span className="text-red-400 font-bold text-sm">{adversaryCount} Hostile</span>
          </div>
        </div>

        <div className="text-[10.5px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
          <span>Encounter Threat Status:</span>
          <span className={`font-bold ${adversaryCount > personaCount ? 'text-red-400' : 'text-emerald-400'}`}>
            {adversaryCount > personaCount ? 'HAZARDOUS' : 'MODERATE'}
          </span>
        </div>
      </div>

      {/* Global Session Player Override Policy */}
      <div className="p-2.5 rounded-lg bg-[#0d121c] border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-amber-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
            <Shield size={13} />
            <span>PLAYER OVERRIDE POLICY</span>
          </div>
          <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
            personaRoster.every((p: any) => p.allow_player_override !== false)
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
              : 'bg-amber-950 text-amber-300 border border-amber-500/50'
          }`}>
            {personaRoster.every((p: any) => p.allow_player_override !== false) ? 'ALL ALLOWED' : 'RESTRICTED'}
          </span>
        </div>
        <p className="text-[10.5px] text-slate-400 leading-snug">
          Permit or lock out direct sheet modifications across all deployed operative personas in this session.
        </p>
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => {
              if (setPersonaAllowPlayerOverride) {
                setPersonaAllowPlayerOverride(null, true);
                AudioService.playTerminalBeep(1200, 0.05);
              }
            }}
            className="py-1.5 px-2 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Unlock size={11} /> Allow All Overrides
          </button>
          <button
            type="button"
            onClick={() => {
              if (setPersonaAllowPlayerOverride) {
                setPersonaAllowPlayerOverride(null, false);
                AudioService.playTerminalBeep(900, 0.05);
              }
            }}
            className="py-1.5 px-2 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Lock size={11} /> Disallow All
          </button>
        </div>
      </div>

      {/* GM Modification Review Modal */}
      <GMModificationReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        targetHeroId={reviewTargetHeroId}
      />
    </div>
  );
};

export default GMInspector;
