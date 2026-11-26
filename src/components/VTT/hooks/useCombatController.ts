/**
 * @file useCombatController.ts
 * @description Hook managing VTT Combat Resolution, Damage Pipeline, Turn Progression, Initiative, and Combat Logs.
 */

import { useState, useRef, useCallback } from 'react';
import { useEngineStore } from '../../../engine/state/VolatileSharder.ts';
import {
  CombatArbitrator,
  SizeCategory,
  RangeCategory
} from '../../../engine/rules/CombatArbitrator.ts';
import { DamagePipeline } from '../../../engine/rules/DamagePipeline.ts';
import { DiceASTParser } from '../../../engine/math/DiceASTParser.ts';
import { EssenceTracker } from '../../../engine/rules/EssenceTracker.ts';
import { resolveTangent2d10Check } from '../../../engine/rules/CanonicalCombatMath.ts';
import type { BVHBuilder } from '../../../engine/vision/BVHBuilder.ts';
import { AudioService } from '../../../services/audioService';
import { CANONICAL_DEFAULT_DEFENSE_CR } from '../../../engine/rules/CanonicalCombatMath';
import { showToast } from '../../../context/ToastContext';
import { AimeAgent } from '../../../engine/ai/AimeAgent';
import { VttEventBus } from '../../../utils/vttEventBus';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { computeActiveGalleryModifiers, ModifierService } from '../../../services/modifierService';

export interface UseCombatControllerOptions {
  selectedToken: any;
  targetToken: any;
  tokens: any[];
  bvhBuilderRef: React.MutableRefObject<BVHBuilder>;
  isSimulationPaused: boolean;
  selectedTokenId: string | null;
  setSelectedTokenId: (id: string | null) => void;
  galleryModifiers?: any[];
  setGalleryModifiers?: (mods: any[]) => void;
}

export interface UseCombatControllerReturn {
  combatLog: string[];
  setCombatLog: React.Dispatch<React.SetStateAction<string[]>>;
  addCombatLogEntry: (entry: string) => void;
  targetedLimb: 'torso' | 'head' | 'arms' | 'legs' | 'optics';
  setTargetedLimb: React.Dispatch<React.SetStateAction<'torso' | 'head' | 'arms' | 'legs' | 'optics'>>;
  attackWeapon: 'kinetic' | 'plasma' | 'laser' | 'emp';
  setAttackWeapon: React.Dispatch<React.SetStateAction<'kinetic' | 'plasma' | 'laser' | 'emp'>>;
  attackMapStep: number;
  setAttackMapStep: React.Dispatch<React.SetStateAction<number>>;
  activeStance: 'normal' | 'guard' | 'overcharge' | 'aim';
  setActiveStance: React.Dispatch<React.SetStateAction<'normal' | 'guard' | 'overcharge' | 'aim'>>;
  customDiceExpr: string;
  setCustomDiceExpr: React.Dispatch<React.SetStateAction<string>>;
  roundNumber: number;
  setRoundNumber: React.Dispatch<React.SetStateAction<number>>;
  currentTurnIndex: number;
  setCurrentTurnIndex: React.Dispatch<React.SetStateAction<number>>;
  initiativeScores: Record<string, number>;
  setInitiativeScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  combatArbRef: React.MutableRefObject<CombatArbitrator>;
  damagePipeRef: React.MutableRefObject<DamagePipeline>;
  diceParserRef: React.MutableRefObject<DiceASTParser>;
  essenceTrackerRef: React.MutableRefObject<EssenceTracker>;
  handleExecuteCombatStrike: () => void;
  handleRollCustomDice: () => void;
  handleNextTurn: () => void;
  handleRollAllInitiative: () => void;
}

export function useCombatController({
  selectedToken,
  targetToken,
  tokens,
  bvhBuilderRef,
  isSimulationPaused,
  selectedTokenId,
  setSelectedTokenId,
  galleryModifiers = [],
  setGalleryModifiers
}: UseCombatControllerOptions): UseCombatControllerReturn {
  const combatArbRef = useRef<CombatArbitrator>(new CombatArbitrator());
  const damagePipeRef = useRef<DamagePipeline>(new DamagePipeline());
  const diceParserRef = useRef<DiceASTParser>(new DiceASTParser());
  const essenceTrackerRef = useRef<EssenceTracker>(new EssenceTracker());

  const [targetedLimb, setTargetedLimb] = useState<'torso' | 'head' | 'arms' | 'legs' | 'optics'>('torso');
  const [combatLog, setCombatLog] = useState<string[]>([
    '[SYSTEM] Stage WebGPU Engine initialized at 5ft Encounter scale.',
    '[SYSTEM] Operators and Mecha units synchronized with Folio & Omnicortex.'
  ]);
  const [attackWeapon, setAttackWeapon] = useState<'kinetic' | 'plasma' | 'laser' | 'emp'>('plasma');
  const [attackMapStep, setAttackMapStep] = useState<number>(0);
  const [activeStance, setActiveStance] = useState<'normal' | 'guard' | 'overcharge' | 'aim'>('normal');
  const [customDiceExpr, setCustomDiceExpr] = useState<string>('2d10 + @armor_dr');

  // Turn Tracker States
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [initiativeScores, setInitiativeScores] = useState<Record<string, number>>({});

  const addCombatLogEntry = useCallback((entry: string) => {
    setCombatLog(prev => [entry, ...prev.slice(0, 8)]);
  }, []);

  const handleExecuteCombatStrike = useCallback(() => {
    if (isSimulationPaused) {
      showToast({
        type: 'warn',
        title: 'Simulation Paused',
        text: 'Tactical Simulation is paused while in Architect Design Mode. Click Resume Sim in the banner to continue live combat.'
      });
      return;
    }

    if (!selectedToken || !targetToken) {
      showToast({
        type: 'warn',
        title: 'Target Required',
        text: 'Select an Attacker and a Target on The Stage.'
      });
      return;
    }

    AudioService.playTerminalBeep(1400, 0.05);

    const dx = targetToken.x - selectedToken.x;
    const dy = targetToken.y - selectedToken.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const distFt = Math.round((distPx / 70) * 5);
    const isPointBlank = distFt <= 5;
    const rangeCat = isPointBlank 
      ? RangeCategory.PointBlank 
      : distFt <= 30 
        ? RangeCategory.Short 
        : distFt <= 60 
          ? RangeCategory.Medium 
          : RangeCategory.Long;

    const targetRad = 22 + (targetToken.size_modifier || 0) * 8;
    const coverCheck = bvhBuilderRef.current.calculateLineOfSightCover(
      { x: selectedToken.x, y: selectedToken.y },
      { x: targetToken.x, y: targetToken.y },
      targetRad
    );

    if (coverCheck.coverType === 'total') {
      setCombatLog(prev => [
        `[COMBAT BLOCKED] Line of Sight obstructed by ${coverCheck.occludingWalls.length} wall(s)! Attack cannot proceed.`,
        ...prev.slice(0, 8)
      ]);
      AudioService.playTerminalBeep(450, 0.04);
      return;
    }

    const attackerSkillRank = Number(selectedToken.skill_rank ?? (selectedToken as any).attack_skill ?? 14);
    const attackerBaseMod = Number((selectedToken as any).attack_mod ?? attackerSkillRank);
    const toHit = combatArbRef.current.buildToHitPackage(
      attackerBaseMod,
      attackerSkillRank,
      attackMapStep,
      SizeCategory.Medium,
      targetToken.size_modifier > 0 ? SizeCategory.Large : SizeCategory.Medium,
      1.0,
      rangeCat,
      {
        isAiming: activeStance === 'aim',
        aimRounds: 1,
        isCalledShot: targetedLimb !== 'torso',
        calledShotLocation: targetedLimb
      }
    );

    const activeEffectAttackMod = Array.isArray(selectedToken.active_effects)
      ? selectedToken.active_effects.reduce((sum: number, eff: any) => sum + Number(eff?.modifierBonus || 0), 0)
      : 0;
    const gallerySummary = computeActiveGalleryModifiers(galleryModifiers, {
      targetTokenId: selectedToken?.id
    });
    toHit.finalTarget += coverCheck.coverMod + activeEffectAttackMod + gallerySummary.totalRollBonus;

    const targetDefenseDC = Number(
      targetToken.defense_dc ?? (targetToken as any).defense ?? CANONICAL_DEFAULT_DEFENSE_CR
    );

    const attackCheck = resolveTangent2d10Check({
      modifier: toHit.finalTarget,
      targetCR: targetDefenseDC,
      isOpposed: true
    });
    const d1 = attackCheck.d1;
    const d2 = attackCheck.d2;
    const isDoubleTens = attackCheck.isCrit;
    const isDoubleOnes = attackCheck.isFumble;
    const totalAttack = attackCheck.total;
    const isHit = attackCheck.isSuccess;

    if (!isHit) {
      const missNarration = AimeAgent.narrateCombatStrike({
        attackerName: selectedToken.name,
        targetName: targetToken.name,
        weaponName: attackWeapon.toUpperCase(),
        targetedLimb,
        isHit: false,
        isCriticalTriumph: false,
        isCriticalFumble: isDoubleOnes,
        netDamage: 0
      });
      setCombatLog(prev => [
        `[AIME] ${missNarration.narrativeText}`,
        `[COMBAT MISS] ${selectedToken.name} targeted ${targetedLimb.toUpperCase()} of ${targetToken.name} with ${attackWeapon.toUpperCase()}. 2d10 Roll: ${d1}+${d2}=${d1+d2} (Total Attack: ${totalAttack} vs CR ${targetDefenseDC} - Defender Wins Ties). [Cover: ${coverCheck.coverType.toUpperCase()}]`,
        ...prev.slice(0, 8)
      ]);
      const missCard = {
        id: `atk_miss_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        sender: selectedToken.name,
        visibility: 'public' as const,
        kind: 'attack' as const,
        title: `${attackWeapon.toUpperCase()} Strike vs ${targetToken.name}`,
        body: missNarration.narrativeText,
        diceBreakdown: {
          d1,
          d2,
          modifier: totalAttack - (d1 + d2),
          total: totalAttack,
          dcOrCr: targetDefenseDC,
          outcome: isDoubleOnes ? 'FUMBLE' : 'MISS',
          crit: false,
          fumble: isDoubleOnes
        }
      };
      VttEventBus.emit('stage-chat-card', missCard);
      getVttMultiplayerSync().broadcastChatCard(missCard);
      return;
    }

    let baseDamage = attackWeapon === 'plasma' ? 32 : attackWeapon === 'emp' ? 24 : 18;
    if (isDoubleTens) baseDamage *= 2;

    if (isPointBlank && (attackWeapon === 'kinetic' || attackWeapon === 'plasma' || attackWeapon === 'laser')) {
      const v1 = Math.floor(Math.random() * 8) + 1;
      const v2 = Math.floor(Math.random() * 8) + 1;
      baseDamage += Math.max(v1, v2);
    } else {
      baseDamage += Math.floor(Math.random() * 8) + 1;
    }

    const stanceDmg = (activeStance === 'overcharge' ? 6 : 0) + gallerySummary.totalDamageBonus;
    const ap = attackWeapon === 'plasma' ? 6 : attackWeapon === 'laser' ? 4 : 2;
    const isCalled = targetedLimb !== 'torso';
    const targetLoc = targetedLimb === 'head'
      ? 'head'
      : targetedLimb === 'arms'
        ? 'arm_right'
        : targetedLimb === 'legs'
          ? 'leg_right'
          : targetedLimb === 'optics'
            ? 'optics'
            : 'torso';

    const strikeResult = damagePipeRef.current.resolveStrike(
      {
        rawDamage: baseDamage + stanceDmg,
        armorPenetration: ap,
        damageType: attackWeapon,
        isCritical: isDoubleTens,
        isCalledShot: isCalled,
        targetLocation: targetLoc as any
      },
      targetToken,
      [targetToken.armor_dr ?? 0],
      Number(targetToken.stamina_dr ?? (targetToken as any).stamina_mod ?? 0),
      Number((targetToken as any).stamina ?? (targetToken as any).attributes?.stamina ?? 0)
    );

    const engStore = useEngineStore.getState();
    if (targetToken.is_synthetic) {
      engStore.setStructure(targetToken.id, Math.max(0, (targetToken.current_structure ?? targetToken.current_hp ?? 60) - (strikeResult.structureDamage ?? strikeResult.netDamage)));
    } else {
      if (strikeResult.vitalityDamage > 0) {
        engStore.setVitality(targetToken.id, Math.max(0, (targetToken.current_vitality ?? targetToken.base_vitality ?? 30) - strikeResult.vitalityDamage));
      }
      if (strikeResult.healthDamage > 0) {
        engStore.applyDamage(targetToken.id, strikeResult.healthDamage);
      }
    }

    strikeResult.appliedStatuses.forEach(status => {
      engStore.addCondition(targetToken.id, status);
    });

    let logMsg = `[COMBAT HIT] ${selectedToken.name} struck ${targetedLimb.toUpperCase()} of ${targetToken.name} for ${strikeResult.netDamage} NET DMG (${strikeResult.effectiveDR} DR + ${strikeResult.conModSoak} STA Soak) [Cover: ${coverCheck.coverType.toUpperCase()}].`;
    if (strikeResult.entersMortalityState) {
      logMsg += strikeResult.isDead
        ? ` 💀 TARGET EXPIRED!`
        : ` ⚠️ MORTALITY STATE: Bleeding Out (${strikeResult.stabilityPointsRemaining} Stability Points)!`;
    } else if (strikeResult.appliedStatuses.length > 0) {
      logMsg += ` TRAUMA: ${strikeResult.appliedStatuses.join(', ')}`;
    }

    const hitNarration = AimeAgent.narrateCombatStrike({
      attackerName: selectedToken.name,
      targetName: targetToken.name,
      weaponName: attackWeapon.toUpperCase(),
      targetedLimb,
      isHit: true,
      isCriticalTriumph: isDoubleTens,
      isCriticalFumble: false,
      netDamage: strikeResult.netDamage,
      isDowned: strikeResult.entersMortalityState,
      appliedStatuses: strikeResult.appliedStatuses
    });

    setCombatLog(prev => [
      `[AIME] ${hitNarration.narrativeText}`,
      logMsg,
      ...prev.slice(0, 8)
    ]);

    const updatedEph = useEngineStore.getState().ephemeralData[targetToken.id];
    if (updatedEph) {
      getVttMultiplayerSync().broadcastTokenVitals(targetToken.id, updatedEph);
    }

    const hitCard = {
      id: `atk_hit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      sender: selectedToken.name,
      visibility: 'public' as const,
      kind: 'attack' as const,
      title: `${attackWeapon.toUpperCase()} Hit (${targetedLimb.toUpperCase()}) -> ${targetToken.name}`,
      body: gallerySummary.breakdown.length > 0
        ? `${hitNarration.narrativeText} [${gallerySummary.breakdown.join(', ')}]`
        : hitNarration.narrativeText,
      diceBreakdown: {
        d1,
        d2,
        modifier: totalAttack - (d1 + d2),
        total: totalAttack,
        dcOrCr: targetDefenseDC,
        outcome: isDoubleTens ? 'CRITICAL HIT' : 'HIT',
        crit: isDoubleTens,
        fumble: false
      },
      damagePayload: {
        targetTokenId: targetToken.id,
        targetLabel: targetToken.name,
        rawDamage: baseDamage + stanceDmg,
        netDamage: strikeResult.netDamage,
        damageType: attackWeapon,
        isLethal: targetedLimb === 'head',
        saveCr: targetDefenseDC,
        damageApplied: true
      }
    };
    VttEventBus.emit('stage-chat-card', hitCard);
    getVttMultiplayerSync().broadcastChatCard(hitCard);
  }, [
    isSimulationPaused,
    selectedToken,
    targetToken,
    bvhBuilderRef,
    targetedLimb,
    activeStance,
    attackMapStep,
    attackWeapon
  ]);

  const handleRollCustomDice = useCallback(() => {
    try {
      const res = diceParserRef.current.evaluateExpression(customDiceExpr, selectedTokenId || undefined);
      AudioService.playTerminalBeep(1250, 0.04);
      setCombatLog(prev => [
        `[DICE ROLL] ${customDiceExpr} => TOTAL: ${res.total} (${res.breakdown})`,
        ...prev.slice(0, 8)
      ]);
      const card = {
        id: `dice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        sender: selectedToken?.name || 'Roller',
        visibility: 'public' as const,
        kind: 'dice' as const,
        title: `AST Formula (${customDiceExpr})`,
        body: `Total: ${res.total} (${res.breakdown})`
      };
      VttEventBus.emit('stage-chat-card', card);
      getVttMultiplayerSync().broadcastChatCard(card);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Dice Syntax Error',
        text: err?.message || 'Invalid dice expression.'
      });
    }
  }, [customDiceExpr, selectedTokenId, selectedToken?.name]);

  const handleNextTurn = useCallback(() => {
    if (tokens.length === 0) return;
    AudioService.playTerminalBeep(1050, 0.03);

    const orderedTokens = [...tokens].sort((a, b) => {
      const sa = initiativeScores[a.id];
      const sb = initiativeScores[b.id];
      if (sa === undefined && sb === undefined) return 0;
      if (sa === undefined) return 1;
      if (sb === undefined) return -1;
      return sb - sa;
    });

    const nextIndex = (currentTurnIndex + 1) % orderedTokens.length;
    const nextToken = orderedTokens[nextIndex];
    setCurrentTurnIndex(nextIndex);
    if (nextToken) {
      setSelectedTokenId(nextToken.id);
    }

    let nextRound = roundNumber;
    if (nextIndex === 0) {
      nextRound = roundNumber + 1;
      setRoundNumber(nextRound);
      VttEventBus.emit('stage-round-advanced', { roundNumber: nextRound });
      if (Array.isArray(galleryModifiers) && galleryModifiers.length > 0 && typeof setGalleryModifiers === 'function') {
        const { updatedModifiers } = ModifierService.tickModifiers(galleryModifiers);
        setGalleryModifiers(updatedModifiers);
      }
      essenceTrackerRef.current.processRoundDegradation([]);
      const entropyRoll = Math.floor(Math.random() * 10) + 1;
      setCombatLog(prev => [
        `[ROUND ${nextRound}] Initiated. Essence Degradation Protocol rolled -${entropyRoll} CR to active sustained effects.`,
        ...prev.slice(0, 8)
      ]);
    } else if (nextToken) {
      setCombatLog(prev => [
        `[TURN] Active combatant is now ${nextToken.name}.`,
        ...prev.slice(0, 8)
      ]);
    }

    if (nextToken) {
      const tickRes = useEngineStore.getState().tickActiveEffectsForToken(nextToken.id);
      if (tickRes.ticked.length > 0 || tickRes.expired.length > 0) {
        const msgParts: string[] = [];
        if (tickRes.totalDamage > 0) {
          msgParts.push(`${tickRes.totalDamage} DoT damage applied`);
        }
        if (tickRes.expired.length > 0) {
          msgParts.push(`Expired: ${tickRes.expired.map(e => e.name).join(', ')}`);
        }
        const effMsg = `[EFFECTS] ${nextToken.name}: ${msgParts.join(' • ') || `${tickRes.ticked.length} active effect(s) ticked`}`;
        setCombatLog(prev => [effMsg, ...prev.slice(0, 8)]);
        const effectCard = {
          id: `eff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sender: nextToken.name,
          visibility: 'public' as const,
          kind: 'effect' as const,
          title: `Turn Effects: ${nextToken.name}`,
          body: effMsg
        };
        VttEventBus.emit('stage-chat-card', effectCard);
        getVttMultiplayerSync().broadcastChatCard(effectCard);
      }

      const nextEph = useEngineStore.getState().ephemeralData[nextToken.id];
      if (nextEph) {
        getVttMultiplayerSync().broadcastTokenVitals(nextToken.id, nextEph);
      }
    }

    getVttMultiplayerSync().broadcastTurnState({
      roundNumber: nextRound,
      currentTurnIndex: nextIndex,
      initiativeScores
    });
  }, [tokens, currentTurnIndex, roundNumber, initiativeScores, setSelectedTokenId, galleryModifiers, setGalleryModifiers]);

  const handleRollAllInitiative = useCallback(() => {
    AudioService.playTerminalBeep(1200, 0.04);
    const scores: Record<string, number> = {};
    tokens.forEach(t => {
      const initMod = Number((t as any).initiative_mod ?? (t as any).attributes?.agi ?? (t as any).attributes?.agility ?? 0);
      scores[t.id] = (Math.floor(Math.random() * 10) + 1) + (Math.floor(Math.random() * 10) + 1) + initMod;
    });
    const orderedTokens = [...tokens].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
    setInitiativeScores(scores);
    setCurrentTurnIndex(0);
    if (orderedTokens[0]) {
      setSelectedTokenId(orderedTokens[0].id);
    }
    setCombatLog(prev => [`[INITIATIVE] Roster initiative rolled for ${tokens.length} combatants.`, ...prev.slice(0, 8)]);
    getVttMultiplayerSync().broadcastTurnState({
      roundNumber,
      currentTurnIndex: 0,
      initiativeScores: scores
    });
  }, [tokens, roundNumber, setSelectedTokenId]);

  return {
    combatLog,
    setCombatLog,
    addCombatLogEntry,
    targetedLimb,
    setTargetedLimb,
    attackWeapon,
    setAttackWeapon,
    attackMapStep,
    setAttackMapStep,
    activeStance,
    setActiveStance,
    customDiceExpr,
    setCustomDiceExpr,
    roundNumber,
    setRoundNumber,
    currentTurnIndex,
    setCurrentTurnIndex,
    initiativeScores,
    setInitiativeScores,
    combatArbRef,
    damagePipeRef,
    diceParserRef,
    essenceTrackerRef,
    handleExecuteCombatStrike,
    handleRollCustomDice,
    handleNextTurn,
    handleRollAllInitiative
  };
}
