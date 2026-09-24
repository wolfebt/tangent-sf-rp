/**
 * @file useCombatController.ts
 * @description Hook managing VTT Combat Resolution, Damage Pipeline, Turn Progression, Initiative, and Combat Logs.
 */

import { useState, useRef, useCallback } from 'react';
import { 
  useEngineStore,
  CombatArbitrator,
  SkillRank,
  SizeCategory,
  RangeCategory,
  DamagePipeline,
  DiceASTParser,
  EssenceTracker,
  type BVHBuilder
} from '../../../engine/index';
import { AudioService } from '../../../services/audioService';

export interface UseCombatControllerOptions {
  selectedToken: any;
  targetToken: any;
  tokens: any[];
  bvhBuilderRef: React.MutableRefObject<BVHBuilder>;
  isSimulationPaused: boolean;
  selectedTokenId: string | null;
  setSelectedTokenId: (id: string | null) => void;
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
  setSelectedTokenId
}: UseCombatControllerOptions): UseCombatControllerReturn {
  const combatArbRef = useRef<CombatArbitrator>(new CombatArbitrator());
  const damagePipeRef = useRef<DamagePipeline>(new DamagePipeline());
  const diceParserRef = useRef<DiceASTParser>(new DiceASTParser());
  const essenceTrackerRef = useRef<EssenceTracker>(new EssenceTracker());

  const [targetedLimb, setTargetedLimb] = useState<'torso' | 'head' | 'arms' | 'legs' | 'optics'>('torso');
  const [combatLog, setCombatLog] = useState<string[]>([
    '[SYSTEM] Stage WebGPU Engine initialized at 5ft Encounter scale.',
    '[SYSTEM] Operatives and Mecha units synchronized with Folio & Omnicortex.'
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
      alert('Tactical Simulation is paused while in Architect Design Mode. Click Resume Sim in the banner to continue live combat.');
      return;
    }

    if (!selectedToken || !targetToken) {
      alert('Select an Attacker and a Target on The Stage.');
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

    const limbMod = targetedLimb === 'head' ? -2 : targetedLimb === 'arms' ? -2 : targetedLimb === 'optics' ? -3 : targetedLimb === 'legs' ? -2 : -1;
    const stanceBonus = activeStance === 'aim' ? 2 : 0;

    const toHit = combatArbRef.current.buildToHitPackage(
      14 + limbMod + stanceBonus,
      SkillRank.Expert,
      attackMapStep,
      SizeCategory.Medium,
      targetToken.size_modifier > 0 ? SizeCategory.Large : SizeCategory.Medium,
      1.0,
      rangeCat,
      { isAiming: activeStance === 'aim', aimRounds: 1 }
    );

    toHit.finalTarget += coverCheck.coverMod;

    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const isDoubleTens = d1 === 10 && d2 === 10;
    const isDoubleOnes = d1 === 1 && d2 === 1;
    const critAttackBonus = isDoubleTens ? 30 : (isDoubleOnes ? -10 : 0);
    const totalAttack = d1 + d2 + toHit.finalTarget + critAttackBonus;

    const targetDefenseDC = combatArbRef.current.calculateUnopposedDC(
      targetToken.size_modifier > 0 ? SizeCategory.Large : SizeCategory.Medium,
      rangeCat
    );

    const isHit = totalAttack > targetDefenseDC && !isDoubleOnes;

    if (!isHit) {
      setCombatLog(prev => [
        `[COMBAT MISS] ${selectedToken.name} targeted ${targetedLimb.toUpperCase()} of ${targetToken.name} with ${attackWeapon.toUpperCase()}. 2d10 Roll: ${d1}+${d2}=${d1+d2} (Total Attack: ${totalAttack} vs CR ${targetDefenseDC} - Defender Wins Ties). [Cover: ${coverCheck.coverType.toUpperCase()}]`,
        ...prev.slice(0, 8)
      ]);
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

    const stanceDmg = activeStance === 'overcharge' ? 6 : 0;
    const ap = attackWeapon === 'plasma' ? 6 : attackWeapon === 'laser' ? 4 : 2;
    const isCalled = targetedLimb !== 'torso';
    const targetLoc = targetedLimb === 'head' ? 'head' : targetedLimb === 'arms' ? 'arm_right' : targetedLimb === 'legs' ? 'leg_right' : 'torso';

    const strikeResult = damagePipeRef.current.resolveStrike(
      {
        rawDamage: baseDamage + stanceDmg,
        armorPenetration: ap,
        damageType: attackWeapon,
        isCalledShot: isCalled,
        targetLocation: targetLoc as any
      },
      targetToken,
      [targetToken.armor_dr || 10],
      (targetToken as any).con_mod || 2,
      (targetToken as any).constitution || 12
    );

    useEngineStore.getState().applyDamage(targetToken.id, strikeResult.healthDamage);

    strikeResult.appliedStatuses.forEach(status => {
      useEngineStore.getState().toggleCondition(targetToken.id, status);
    });

    let logMsg = `[COMBAT HIT] ${selectedToken.name} struck ${targetedLimb.toUpperCase()} of ${targetToken.name} for ${strikeResult.netDamage} NET DMG (${strikeResult.effectiveDR} DR + ${strikeResult.conModSoak} CON Soak) [Cover: ${coverCheck.coverType.toUpperCase()}].`;
    if (strikeResult.entersMortalityState) {
      logMsg += strikeResult.isDead
        ? ` 💀 TARGET EXPIRED!`
        : ` ⚠️ MORTALITY STATE: Bleeding Out (${strikeResult.stabilityPointsRemaining} Stability Points)!`;
    } else if (strikeResult.appliedStatuses.length > 0) {
      logMsg += ` TRAUMA: ${strikeResult.appliedStatuses.join(', ')}`;
    }

    setCombatLog(prev => [
      logMsg,
      ...prev.slice(0, 8)
    ]);
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
    } catch (err: any) {
      alert(`Dice Syntax Error: ${err.message}`);
    }
  }, [customDiceExpr, selectedTokenId]);

  const handleNextTurn = useCallback(() => {
    if (tokens.length === 0) return;
    AudioService.playTerminalBeep(1050, 0.03);

    const nextIndex = (currentTurnIndex + 1) % tokens.length;
    setCurrentTurnIndex(nextIndex);
    setSelectedTokenId(tokens[nextIndex].id);

    if (nextIndex === 0) {
      const nextRound = roundNumber + 1;
      setRoundNumber(nextRound);
      essenceTrackerRef.current.processRoundDegradation([]);
      const entropyRoll = Math.floor(Math.random() * 10) + 1;
      setCombatLog(prev => [
        `[ROUND ${nextRound}] Initiated. Essence Degradation Protocol rolled -${entropyRoll} DC to active sustained effects.`,
        ...prev.slice(0, 8)
      ]);
    } else {
      setCombatLog(prev => [
        `[TURN] Active combatant is now ${tokens[nextIndex].name}.`,
        ...prev.slice(0, 8)
      ]);
    }
  }, [tokens, currentTurnIndex, roundNumber, setSelectedTokenId]);

  const handleRollAllInitiative = useCallback(() => {
    AudioService.playTerminalBeep(1200, 0.04);
    const scores: Record<string, number> = {};
    tokens.forEach(t => {
      scores[t.id] = Math.floor(Math.random() * 20) + 1 + (t.tech_level || 3);
    });
    setInitiativeScores(scores);
    setCurrentTurnIndex(0);
    setCombatLog(prev => [`[INITIATIVE] Roster initiative rolled for ${tokens.length} combatants.`, ...prev.slice(0, 8)]);
  }, [tokens]);

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
