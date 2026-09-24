import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  Shield,
  Zap,
  Swords,
  Activity,
  Skull,
  Heart,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Dices,
  Flame,
  RefreshCw,
  CheckCircle2,
  Target,
  Cpu,
  ShieldAlert,
  BatteryCharging,
  Pin,
  PinOff,
  Eye,
  Users,
  Footprints,
  FastForward,
  ShieldCheck,
  Compass,
  Maximize2,
  Minimize2,
  FolderTree,
  Sliders
} from 'lucide-react';
import AudioService from '../../../../services/audioService';
import { rollDice } from '../../../../services/diceService';
import { CANONICAL_PING_TYPES } from '../../../../services/mapPingService';
import { DEFAULT_WEAPONRY } from '../../../../data/weaponryData';
import { HIT_LOCATIONS } from './CombatResolutionModal';
import { useFolio } from '../../../../context/FolioContext';
import { VttEventBus } from '../../../../utils/vttEventBus';
import { TacticalPlayView } from '../../../../components/Folio/views/TacticalPlayView';
import { useUILayoutStore } from '../../../../components/VTT/store/uiLayoutStore';
import ArchitectAssetCockpit from './ArchitectAssetCockpit';

/**
 * Resolves the combat skill, rank, and unlocked attack ladder for a weapon/attack
 * strictly according to Tangent canonical RULE-SKL-01 (NO ACTION POINTS):
 * Rank 0: Full Round Action (1 strike)
 * Rank 1-5: 1 Strike (+0 Strike, +2 Focus)
 * Rank 6-10: 2 Strikes (+0, -5, +3 Focus)
 * Rank 11-15: 3 Strikes (+0, -5, -10, +4 Focus)
 * Rank 16-20: 4 Strikes (+0, -5, -10, -15, +5 Focus)
 * Rank 21-25: 5 Strikes (+0, -5, -10, -15, -20, +6 Focus)
 * Rank 26-30: 6 Strikes (+0, -5, -10, -15, -20, -25, +7 Focus)
 */
function resolveCombatSkillForWeapon(weapon, persona = {}) {
  const name = (weapon?.name || '').toLowerCase();

  let skillKey = 'firearms-long-arms';
  let skillLabel = 'Firearms (Long Arms)';

  if (name.includes('pistol') || name.includes('sidearm') || name.includes('revolver')) {
    skillKey = 'firearms-pistols';
    skillLabel = 'Firearms (Pistols)';
  } else if (name.includes('axe') || name.includes('sword') || name.includes('blade') || name.includes('great') || name.includes('katana') || name.includes('machete')) {
    skillKey = 'heavy-blades';
    skillLabel = 'Heavy Blades';
  } else if (name.includes('dagger') || name.includes('knife') || name.includes('vibro-blade')) {
    skillKey = 'light-blades';
    skillLabel = 'Light Blades';
  } else if (name.includes('cannon') || name.includes('heavy') || name.includes('rocket') || name.includes('launcher') || name.includes('plasma')) {
    skillKey = 'heavy-weapons';
    skillLabel = 'Heavy Weapons';
  } else if (name.includes('bow') || name.includes('crossbow')) {
    skillKey = 'archery';
    skillLabel = 'Archery';
  } else if (name.includes('unarmed') || name.includes('fist') || name.includes('punch') || name.includes('brawl')) {
    skillKey = 'unarmed-combat';
    skillLabel = 'Unarmed Combat';
  } else if (name.includes('attune') || name.includes('lance') || name.includes('invocation') || name.includes('psi') || name.includes('bolt')) {
    skillKey = 'attune';
    skillLabel = 'Attune / Metaphysics';
  }

  const rankVal = persona[`skill-${skillKey}-rank`] ?? 
                  persona[`skill-combat-${skillKey}-rank`] ?? 
                  persona[`skill-${skillKey}`] ?? 
                  persona[skillKey];

  const rank = parseInt(rankVal ?? 2, 10);

  let unlockedAttacks = 1;
  let focusBonus = 2;
  let rankTier = 'Novice';
  let isFullRound = false;

  if (rank === 0) {
    unlockedAttacks = 1;
    focusBonus = 0;
    rankTier = 'Untrained (Full Round)';
    isFullRound = true;
  } else if (rank <= 5) {
    unlockedAttacks = 1;
    focusBonus = 2;
    rankTier = 'Novice';
  } else if (rank <= 10) {
    unlockedAttacks = 2;
    focusBonus = 3;
    rankTier = 'Trained';
  } else if (rank <= 15) {
    unlockedAttacks = 3;
    focusBonus = 4;
    rankTier = 'Expert';
  } else if (rank <= 20) {
    unlockedAttacks = 4;
    focusBonus = 5;
    rankTier = 'Master';
  } else if (rank <= 25) {
    unlockedAttacks = 5;
    focusBonus = 6;
    rankTier = 'Grand Master';
  } else {
    unlockedAttacks = 6;
    focusBonus = 7;
    rankTier = 'Pinnacle';
  }

  const ladder = [];
  for (let i = 0; i < unlockedAttacks; i++) {
    const penalty = i === 0 ? 0 : -(i * 5);
    ladder.push({
      step: i + 1,
      penalty,
      label: i === 0 
        ? (isFullRound ? 'Full Round Strike (+0)' : '#1 (0)') 
        : `#${i + 1} (${penalty})`
    });
  }

  return {
    skillKey,
    skillLabel,
    rank,
    rankTier,
    focusBonus,
    unlockedAttacks,
    ladder,
    isFullRound
  };
}

/**
 * Resolves active defense reaction slots per RULE-SKL-02:
 * Reactions governed by Defense skill rank, with cumulative -5 penalty after 1st reaction.
 */
function resolveActiveDefenseReactions(persona = {}) {
  const defenseRank = parseInt(
    persona['skill-defense-rank'] ?? 
    persona['skill-combat-defense-rank'] ?? 
    persona['skill-dodge-rank'] ?? 
    persona['skill-parry-rank'] ?? 
    2, 
    10
  );

  let allowedReactions = 1;
  let tierLabel = 'Novice';
  if (defenseRank <= 5) {
    allowedReactions = 1;
    tierLabel = defenseRank === 0 ? 'Untrained' : 'Novice';
  } else if (defenseRank <= 10) {
    allowedReactions = 2;
    tierLabel = 'Trained';
  } else if (defenseRank <= 15) {
    allowedReactions = 3;
    tierLabel = 'Expert';
  } else if (defenseRank <= 20) {
    allowedReactions = 4;
    tierLabel = 'Master';
  } else {
    allowedReactions = 5;
    tierLabel = 'Grand Master';
  }

  const reactionSlots = [];
  for (let i = 0; i < allowedReactions; i++) {
    reactionSlots.push({
      slot: i + 1,
      penalty: i === 0 ? 0 : -(i * 5),
      label: i === 0 ? '1st Reaction (+0)' : `${i + 1}${i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Reaction (-${i * 5})`
    });
  }

  return {
    defenseRank,
    allowedReactions,
    tierLabel,
    reactionSlots
  };
}

const CANONICAL_TACTICAL_WEAPONS = (DEFAULT_WEAPONRY && DEFAULT_WEAPONRY.length > 0)
  ? DEFAULT_WEAPONRY.slice(0, 10).map((w, idx) => ({
      id: w.id || `wpn_${idx}`,
      name: w.name || 'Weapon',
      damage: w.damage || '2d8+2',
      damageType: (w.damageType || w.category || 'kinetic').toLowerCase(),
      range: w.range || '50 ft',
      ap: w.ap || 1,
      mod: 3,
      notes: w.special || w.notes || ''
    }))
  : [
      {
        id: 'wpn_pulse_rifle',
        name: 'Pulse Rifle',
        damage: '2d8+3',
        damageType: 'kinetic',
        range: '80 ft',
        ap: 2,
        mod: 4,
        notes: 'Burst Fire (+2 DMG against unshielded targets)'
      }
    ];

export const OperativeCockpitRail = ({
  tokens = [],
  activeTokenId,
  onSelectActiveToken,
  vttRole = 'operative',
  isPinned = false,
  onTogglePin,
  isCollapsed = false,
  onToggleCollapse,
  targetToken = null,
  onSelectTargetToken,
  onTriggerAttack,
  onDropPing,
  onTriggerFloatingText,
  onBroadcastMessage,
  activeSensorMode = 'standard_optical',
  onChangeSensorMode,
  onUpdateTokenHealth,
  onUpdateTokenVitality,
  onUpdateTokenStructure,
  // Architect Stage Asset Cockpit & Library props:
  objects = [],
  currentMap = null,
  onUpdateToken,
  onUpdateObject,
  onDeleteToken,
  onDeleteObject,
  onDuplicateToken,
  onDuplicateObject,
  onDeployAsset,
  onOpenTacticalModal
}) => {
  // Role & Cockpit Master Mode ('architect_cockpit' vs 'operative_cockpit')
  const isArchitectRole = vttRole === 'architect' || vttRole === 'gm' || vttRole === 'co_architect';
  const [railMode, setRailMode] = useState(isArchitectRole ? 'architect_cockpit' : 'operative_cockpit');

  React.useEffect(() => {
    if (isArchitectRole) {
      setRailMode('architect_cockpit');
    }
  }, [isArchitectRole]);

  // Tactical Movement Stance
  const [movementStance, setMovementStance] = useState('pace'); // 'pace' | 'sprint' | 'guard' | 'evasive'
  
  // Combat State
  const [selectedWeaponId, setSelectedWeaponId] = useState('wpn_pulse_rifle');
  const [activeMapStep, setActiveMapStep] = useState(1); // 1 to 6
  const [spentReactions, setSpentReactions] = useState(0);
  const [selectedCalledShotId, setSelectedCalledShotId] = useState('center_mass');
  const [edgeAiming, setEdgeAiming] = useState(false);
  const [edgeFlanking, setEdgeFlanking] = useState(false);
  const [edgeHighGround, setEdgeHighGround] = useState(false);
  const [hasAdvantage, setHasAdvantage] = useState(false);
  const [hasDisadvantage, setHasDisadvantage] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('combat'); // 'profile' | 'movement' | 'combat' | 'abilities'
  const [cockpitViewMode, setCockpitViewMode] = useState('folio'); // 'cockpit' | 'folio' (default to canonical folio tactical view)
  const [lastRollResult, setLastRollResult] = useState(null);

  const { isLeftWideMode, toggleLeftWideMode } = useUILayoutStore();

  const [railWidth, setRailWidth] = useState(() => {
    try {
      const stored = localStorage.getItem('tangent_cockpit_rail_width');
      return stored ? Number(stored) : 420;
    } catch {
      return 420;
    }
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleStartResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = railWidth;

    const onMouseMove = (moveEvt) => {
      const delta = moveEvt.clientX - startX;
      const nextWidth = Math.max(320, Math.min(startWidth + delta, 750));
      setRailWidth(nextWidth);
      try {
        localStorage.setItem('tangent_cockpit_rail_width', String(nextWidth));
      } catch {}
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const folio = useFolio() || {};
  const { savedPersonas, characterData } = folio;

  // Active Token Resolution
  const activeToken = useMemo(() => {
    return tokens.find(t => t.id === activeTokenId) || tokens[0] || {
      id: 'mock_op',
      label: 'Operative Lead',
      name: 'Operative Lead',
      type: 'operative',
      health: { current: 30, max: 30 },
      vitality: { current: 25, max: 25 },
      structure: { current: 50, max: 50 },
      sp: 12,
      maxSp: 12,
      armorDr: 4,
      staminaDr: 2,
      defense: 12,
      speed: 6,
      conditions: []
    };
  }, [tokens, activeTokenId]);

  // Resolve authentic Folio persona matching this token
  const activePersona = useMemo(() => {
    if (activeToken.characterData) return activeToken.characterData;
    if (savedPersonas && savedPersonas.length > 0) {
      const match = savedPersonas.find(p => 
        p.id === activeToken.id || 
        p.id === activeToken.character_doc_id ||
        p.id === activeToken.characterId ||
        p['char-name'] === activeToken.label ||
        p['char-name'] === activeToken.name
      );
      if (match) return match;
    }
    if (characterData && (characterData.id === activeToken.id || characterData['char-name'] === activeToken.label || !activeTokenId)) {
      return characterData;
    }
    return {
      id: activeToken.id,
      'char-name': activeToken.label || activeToken.name || 'Operative',
      'char-species': activeToken.species || 'Human',
      'char-archetype': activeToken.archetype || 'Operative',
      health: activeToken.health?.max || activeToken.maxHp || 30,
      current_health: activeToken.health?.current ?? activeToken.hp ?? 30,
      vitality: activeToken.vitality?.max || 25,
      current_vitality: activeToken.vitality?.current ?? 25,
      structure: activeToken.structure?.max || 50,
      current_structure: activeToken.structure?.current ?? 50,
      sp: activeToken.sp || activeToken.shield?.current || 10,
      max_sp: activeToken.maxSp || activeToken.shield?.max || 10,
      isSynthetic: activeToken.isSynthetic || activeToken.type === 'vehicle' || activeToken.type === 'synthetic',
      attacks: activeToken.attacks || [],
      weapons: activeToken.weapons || [],
      portrait_url: activeToken.image_url || activeToken.imageUrl || activeToken.avatar
    };
  }, [activeToken, savedPersonas, characterData, activeTokenId]);

  // Is unit synthetic or vehicle?
  const isSynthetic = activeToken.isSynthetic || activeToken.type === 'synthetic' || activeToken.type === 'vehicle';

  // Current Vitals
  const curHealth = activeToken.health?.current ?? activeToken.hp ?? 30;
  const maxHealth = activeToken.health?.max ?? activeToken.maxHp ?? 30;
  const curVitality = activeToken.vitality?.current ?? 25;
  const maxVitality = activeToken.vitality?.max ?? 25;
  const curStructure = activeToken.structure?.current ?? 50;
  const maxStructure = activeToken.structure?.max ?? 50;
  const curShield = activeToken.sp ?? activeToken.shield?.current ?? 10;
  const maxShield = activeToken.maxSp ?? activeToken.shield?.max ?? 10;
  const armorDr = activeToken.armorDr ?? activeToken.toughness ?? 4;
  const staminaDr = activeToken.staminaDr ?? 2;
  const conditions = activeToken.conditions || [];
  const stability = activeToken.stability ?? 5; // Bleedout Stability Pool (RULE-CMB-06)

  // Weapons list
  const availableWeapons = useMemo(() => {
    if (activeToken.attacks && activeToken.attacks.length > 0) {
      return activeToken.attacks.map((att, idx) => ({
        id: att.id || `att_${idx}`,
        name: att.name || 'Weapon',
        damage: att.damage || att.damageDice || '2d8+2',
        damageType: att.damageType || 'kinetic',
        range: att.range || '50 ft',
        ap: att.ap || 0,
        mod: parseInt(att.score || att.mod || 3, 10) || 3,
        notes: att.notes || att.special || ''
      }));
    }
    if (activePersona?.weapons && activePersona.weapons.length > 0) {
      return activePersona.weapons.map((w, idx) => ({
        id: w.id || `wpn_${idx}`,
        name: w.name || 'Weapon',
        damage: w.damage || '2d8+2',
        damageType: (w.damageType || 'kinetic').toLowerCase(),
        range: w.range || '50 ft',
        ap: w.ap || 1,
        mod: 3,
        notes: w.special || w.notes || ''
      }));
    }
    return CANONICAL_TACTICAL_WEAPONS;
  }, [activeToken.attacks, activePersona?.weapons]);

  const activeWeapon = availableWeapons.find(w => w.id === selectedWeaponId) || availableWeapons[0];

  // Enemy / Target Token Resolution
  const resolvedTargetToken = useMemo(() => {
    if (targetToken) return targetToken;
    return tokens.find(t => t.id !== activeToken.id && (t.type === 'hostile' || t.type === 'adversary' || t.type === 'npc'));
  }, [tokens, targetToken, activeToken.id]);

  // Called Shot lookup
  const activeCalledShot = useMemo(() => {
    if (selectedCalledShotId === 'center_mass') {
      return { id: 'center_mass', label: 'Center Mass', penalty: -1, saveType: 'Fortitude', effect: 'Winded (-2 Actions)' };
    }
    const loc = HIT_LOCATIONS.find(h => h.id === selectedCalledShotId);
    if (loc) {
      return {
        id: loc.id,
        label: loc.label,
        penalty: loc.penalty,
        saveType: loc.saveType,
        effect: loc.traumaEffect
      };
    }
    return { id: 'torso', label: 'Torso', penalty: -2, saveType: 'Fortitude', effect: 'Winded' };
  }, [selectedCalledShotId]);

  // Canonical Skill & Action Resolutions (RULE-SKL-01 & RULE-SKL-02)
  const skillResolution = useMemo(() => {
    return resolveCombatSkillForWeapon(activeWeapon, activePersona);
  }, [activeWeapon, activePersona]);

  const defenseResolution = useMemo(() => {
    return resolveActiveDefenseReactions(activePersona);
  }, [activePersona]);

  const handleUseReaction = (slotNum) => {
    AudioService.playTerminalBeep(980, 0.05);
    setSpentReactions(prev => (prev >= slotNum ? slotNum - 1 : slotNum));
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 120, `REACTION ${slotNum} TOGGLED`, 'karma');
    }
  };

  const handleResetReactions = () => {
    AudioService.playTerminalBeep(1200, 0.08);
    setSpentReactions(0);
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 120, `REACTIONS RESET`, 'heal');
    }
  };

  // Stance Handler
  const handleSetStance = (stance) => {
    setMovementStance(stance);
    AudioService.playTerminalBeep(1050, 0.06);
    let label = 'PACE (Standard)';
    if (stance === 'sprint') label = 'SPRINT (+10 ft / -2 Def)';
    if (stance === 'guard') label = 'GUARD STANCE (+2 Active Def)';
    if (stance === 'evasive') label = 'EVASIVE (+Def vs Ranged)';
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 140, `STANCE: ${label}`, 'karma');
    }
    if (onBroadcastMessage) {
      onBroadcastMessage(`[TACTICAL STANCE]: ${activeToken.label || 'Operative'} engaged ${label}`);
    }
  };

  // Consumables / Abilities
  const handleUseConsumable = (item, healAmount = 15) => {
    AudioService.playTerminalBeep(1100, 0.1);
    if (isSynthetic) {
      if (onUpdateTokenStructure) onUpdateTokenStructure(activeToken.id, Math.min(maxStructure, curStructure + healAmount), false, healAmount);
    } else {
      if (onUpdateTokenHealth) onUpdateTokenHealth(activeToken.id, Math.min(maxHealth, curHealth + healAmount), false, healAmount);
    }
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, window.innerHeight - 140, `USED: ${item} (+${healAmount})`, 'heal');
    }
    if (onBroadcastMessage) {
      onBroadcastMessage(`[OPERATIVE TACTICAL]: ${activeToken.label || 'Operative'} deployed ${item}`);
    }
  };

  // BASTION Strike Arbitration Execution
  const handleExecuteBastionAttack = () => {
    // 1. Calculate Multi-Attack Penalty (MAP) & Focus Bonus based on Skill Rank (RULE-SKL-01)
    const mapObj = skillResolution.ladder.find(m => m.step === activeMapStep) || skillResolution.ladder[0] || { penalty: 0, step: 1 };
    const mapPenalty = mapObj.penalty;
    const focusBonus = skillResolution.focusBonus || 0;

    // 2. Called Shot Penalty
    const calledPenalty = activeCalledShot.penalty;

    // 3. Edge Modifiers
    let edgeMod = 0;
    if (edgeAiming) edgeMod += 2;
    if (edgeFlanking) edgeMod += 2;
    if (edgeHighGround) edgeMod += 2;

    const baseMod = activeWeapon.mod || 3;
    const totalStrikeMod = baseMod + mapPenalty + calledPenalty + edgeMod + focusBonus;

    // 4. Roll 2d10 using canonical BASTION dice engine
    const rollExpr = hasAdvantage ? '2d10kh1' : hasDisadvantage ? '2d10kl1' : '2d10';
    const diceResult = rollDice(rollExpr);
    const d10Sum = diceResult.rolls.reduce((a, b) => a + b, 0);
    const isCritSuccess = diceResult.rolls[0] === 10 && diceResult.rolls[1] === 10;
    const isCritFumble = diceResult.rolls[0] === 1 && diceResult.rolls[1] === 1;

    let finalStrikeScore = d10Sum + totalStrikeMod;
    if (isCritSuccess) finalStrikeScore += 30; // RULE-RES-03
    if (isCritFumble) finalStrikeScore -= 10;

    // 5. Defender Target
    const targetDefense = resolvedTargetToken ? (resolvedTargetToken.defense || 12) : 15;
    // BASTION RULE-RES-01: Opposed roll, Attacker strictly exceeds Defender to hit. DEFENDER WINS TIES!
    const isHit = isCritSuccess || (!isCritFumble && finalStrikeScore > targetDefense);

    // 6. Damage Calculation (RULE-CMB-03)
    let netDamage = 0;
    let targetShieldDmg = 0;
    let targetHpDmg = 0;

    if (isHit) {
      const dmgDiceExpr = isCritSuccess ? `${activeWeapon.damage}*2` : activeWeapon.damage;
      const dmgRoll = rollDice(dmgDiceExpr);
      const rawDmg = Math.max(1, dmgRoll.total);
      
      const targetArmorDr = resolvedTargetToken?.armorDr ?? resolvedTargetToken?.toughness ?? 3;
      const effectiveDr = Math.max(0, targetArmorDr - (activeWeapon.ap || 0));
      netDamage = Math.max(1, rawDmg - effectiveDr);

      // Distribute to Target Shields first
      const targetCurShield = resolvedTargetToken?.sp ?? resolvedTargetToken?.shield?.current ?? 0;
      if (targetCurShield > 0) {
        targetShieldDmg = Math.min(targetCurShield, netDamage);
        targetHpDmg = netDamage - targetShieldDmg;
      } else {
        targetHpDmg = netDamage;
      }
    }

    const resultSummary = {
      timestamp: Date.now(),
      weapon: activeWeapon.name,
      targetName: resolvedTargetToken?.label || resolvedTargetToken?.name || 'Target',
      d10Sum,
      rolls: diceResult.rolls,
      totalStrikeMod,
      finalStrikeScore,
      targetDefense,
      isHit,
      isCritSuccess,
      isCritFumble,
      netDamage,
      targetShieldDmg,
      targetHpDmg,
      calledShot: activeCalledShot.label,
      mapStep: mapObj.step
    };

    setLastRollResult(resultSummary);

    // Audio & Visual feedback
    if (isCritSuccess) {
      AudioService.playCriticalRoll();
    } else if (isHit) {
      AudioService.playCombatHit(netDamage >= 12);
    } else {
      AudioService.playTerminalBeep(350, 0.15);
    }

    // Trigger Floating Text
    if (onTriggerFloatingText) {
      const resultText = isCritSuccess
        ? `CRITICAL STRIKE! ${finalStrikeScore} vs DEF ${targetDefense} (DMG: ${netDamage})`
        : isHit
        ? `HIT! ${finalStrikeScore} vs DEF ${targetDefense} (-${netDamage} HP)`
        : `MISS! ${finalStrikeScore} vs DEF ${targetDefense}`;
      onTriggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2 - 80,
        resultText,
        isCritSuccess ? 'crit_success' : isHit ? 'damage' : 'crit_fail'
      );
    }

    // Broadcast to Adventure Log
    if (onBroadcastMessage) {
      const logMsg = `[BASTION ARBITRATION]: ${activeToken.label} struck ${resultSummary.targetName} with ${activeWeapon.name} [Location: ${activeCalledShot.label}, MAP: ${mapObj.label}]. Roll: 2d10(${diceResult.rolls.join('+')})${totalStrikeMod >= 0 ? '+' : ''}${totalStrikeMod} = ${finalStrikeScore} vs DEF ${targetDefense}. Result: ${isHit ? `HIT (-${netDamage} Net Damage)` : 'DEFENDER REPELS'}`;
      onBroadcastMessage(logMsg);
    }

    // Trigger external attack callback if target exists
    if (onTriggerAttack && resolvedTargetToken) {
      onTriggerAttack(activeToken.id, resolvedTargetToken.id, netDamage);
    }
  };

  return (
    <aside
      className={`h-full flex z-20 select-none font-sans relative shrink-0 ${
        isResizing ? '' : 'transition-[width] duration-150'
      }`}
      style={{ width: isCollapsed ? '48px' : `${railWidth}px` }}
      aria-label="Operative Cockpit Tactical Rail"
    >
      {/* 48px Vertical Icon Strip */}
      <nav
        className="w-12 shrink-0 h-full border-r border-cyan-950/80 bg-[#090d13] flex flex-col items-center py-2 gap-2 z-20 shadow-[2px_0_15px_rgba(0,0,0,0.5)]"
        aria-label="Operative Rail Nav"
      >
        {/* Architect Asset Cockpit & Library Icon */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setRailMode('architect_cockpit');
            AudioService.playTerminalBeep(1100, 0.02);
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            railMode === 'architect_cockpit' && !isCollapsed
              ? 'bg-amber-950 text-amber-300 border border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
          }`}
          title="Architect Stage Asset Cockpit (Library & Inspector)"
        >
          <FolderTree size={18} />
        </button>

        {/* Unit Status Icon */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setRailMode('operative_cockpit');
            setActiveAccordion('profile');
            setCockpitViewMode('folio');
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            railMode === 'operative_cockpit' && (activeAccordion === 'profile' || cockpitViewMode === 'folio') && !isCollapsed
              ? 'bg-purple-950 text-purple-300 border border-purple-500/70 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
          }`}
          title="Unit Folio Tactical View & Vitals"
        >
          <Activity size={18} />
          {curHealth <= maxHealth * 0.3 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        {/* PROMINENT EXPAND BUTTON (when collapsed) */}
        {isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-10 py-2 rounded-xl bg-gradient-to-b from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 text-white font-mono font-bold flex flex-col items-center justify-center gap-0.5 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse hover:animate-none transition-all cursor-pointer border border-cyan-300"
            title="Expand Operative Cockpit Sheet"
          >
            <ChevronRight size={18} />
            <span className="text-[8px] tracking-wider uppercase">OPEN</span>
          </button>
        )}

        {/* Combat Action Deck */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setRailMode('operative_cockpit');
            setActiveAccordion('combat');
            setCockpitViewMode('cockpit');
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            railMode === 'operative_cockpit' && activeAccordion === 'combat' && cockpitViewMode === 'cockpit' && !isCollapsed
              ? 'bg-amber-950 text-amber-300 border border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
          }`}
          title="BASTION Combat Engine"
        >
          <Swords size={18} />
        </button>

        {/* Action & Movement Stance */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setRailMode('operative_cockpit');
            setActiveAccordion('movement');
            setCockpitViewMode('cockpit');
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            railMode === 'operative_cockpit' && activeAccordion === 'movement' && cockpitViewMode === 'cockpit' && !isCollapsed
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
          }`}
          title="AP Economy & Locomotion"
        >
          <Footprints size={18} />
        </button>

        {/* Abilities & Invocations */}
        <button
          type="button"
          onClick={() => {
            if (isCollapsed) onToggleCollapse?.();
            setRailMode('operative_cockpit');
            setActiveAccordion('abilities');
            setCockpitViewMode('cockpit');
          }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
            railMode === 'operative_cockpit' && activeAccordion === 'abilities' && cockpitViewMode === 'cockpit' && !isCollapsed
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
          }`}
          title="Quick Abilities & Consumables"
        >
          <Zap size={18} />
        </button>

        <div className="w-6 h-px bg-slate-800 my-1" />

        {/* Tactical Radar Pings */}
        <div className="flex flex-col items-center gap-1.5 flex-1 overflow-y-auto scrollbar-none w-full px-1">
          {CANONICAL_PING_TYPES.map(p => (
            <button
              key={p.type}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(p.soundFreq, 0.08);
                if (onDropPing) onDropPing(p.type);
              }}
              className="w-8 h-8 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              title={`Broadcast ${p.label} Ping`}
            >
              <span>{p.icon}</span>
            </button>
          ))}
        </div>

        {/* Pin / Expand Toggle */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 pt-2 border-t border-slate-800 w-full px-1">
          <button
            type="button"
            onClick={onTogglePin}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isPinned
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)] font-bold'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title={isPinned ? 'Unpin Left Rail' : 'Pin Left Rail Open (Dual-Wielding)'}
          >
            {isPinned ? <Pin size={15} /> : <PinOff size={15} />}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
              isCollapsed
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.8)] animate-pulse'
                : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 hover:bg-cyan-500 hover:text-black'
            }`}
            title={isCollapsed ? 'Expand Operative Cockpit' : 'Collapse Operative Cockpit'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </nav>

      {/* Expanded Operative Cockpit Drawer */}
      <div
        className={`h-full border-r border-slate-800/90 bg-[#0a0e14]/95 backdrop-blur-md flex flex-col overflow-hidden shadow-2xl flex-1 min-w-0 ${
          isCollapsed ? 'hidden' : ''
        }`}
      >
        {/* Drawer Header: Mode Switcher (Architect Asset Cockpit vs Operative Combat) & Collapse Button */}
        <div className="h-12 px-3 border-b border-cyan-950/80 bg-[#080c12] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {isArchitectRole ? (
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setRailMode('architect_cockpit');
                    AudioService.playTerminalBeep(1100, 0.02);
                  }}
                  className={`px-2 py-1 rounded font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                    railMode === 'architect_cockpit'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Architect Cockpit: Story & Map Asset Library, Token/Object Inspector & Live Editor"
                >
                  <FolderTree size={12} className={railMode === 'architect_cockpit' ? 'text-amber-400' : 'text-slate-500'} />
                  <span>ASSETS & EDIT</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRailMode('operative_cockpit');
                    AudioService.playTerminalBeep(950, 0.02);
                  }}
                  className={`px-2 py-1 rounded font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                    railMode === 'operative_cockpit'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Operative Combat Deck: BASTION 2d10 Strikes, Weapon Ladders, AP & Reactions"
                >
                  <Swords size={12} className={railMode === 'operative_cockpit' ? 'text-cyan-400' : 'text-slate-500'} />
                  <span>OPERATIVE</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0 shrink">
                <span className="text-base">{activeToken.type === 'vehicle' ? '🚀' : activeToken.type === 'companion' ? '🤖' : '🧙‍♂️'}</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-bold text-cyan-300 truncate">
                    {activeToken.label || activeToken.name || 'Operative'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                    {isSynthetic ? 'Synthetic Chassis' : 'Biological Asset'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* If in operative combat mode, show Deck vs Folio view */}
            {railMode === 'operative_cockpit' && (
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setCockpitViewMode('cockpit')}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    cockpitViewMode === 'cockpit'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Streamlined Tactical Action Deck"
                >
                  Deck
                </button>
                <button
                  type="button"
                  onClick={() => setCockpitViewMode('folio')}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    cockpitViewMode === 'folio'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Canonical Folio Tactical Sheet"
                >
                  Folio
                </button>
              </div>
            )}

            {/* PROMINENT COLLAPSE BUTTON */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-500 border border-cyan-500/70 hover:border-cyan-300 text-cyan-300 hover:text-black font-mono font-bold text-xs flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer"
              title="Collapse Rail (◀)"
            >
              <ChevronLeft size={14} />
              <span className="text-[10px] hidden sm:inline">COLLAPSE</span>
            </button>
          </div>
        </div>

        {railMode === 'architect_cockpit' ? (
          <ArchitectAssetCockpit
            tokens={tokens}
            objects={objects}
            currentMap={currentMap}
            activeAssetId={activeTokenId}
            onSelectAsset={(id) => {
              if (onSelectActiveToken) onSelectActiveToken(id);
            }}
            onUpdateToken={onUpdateToken || ((id, updates) => {
              if (onUpdateTokenHealth && updates.current_hp !== undefined) {
                onUpdateTokenHealth(id, updates.current_hp);
              }
              if (onUpdateTokenVitality && updates.current_vitality !== undefined) {
                onUpdateTokenVitality(id, updates.current_vitality);
              }
              if (onUpdateTokenStructure && updates.current_structure !== undefined) {
                onUpdateTokenStructure(id, updates.current_structure);
              }
            })}
            onUpdateObject={onUpdateObject}
            onDeleteToken={onDeleteToken}
            onDeleteObject={onDeleteObject}
            onDuplicateToken={onDuplicateToken}
            onDuplicateObject={onDuplicateObject}
            onDeployAsset={onDeployAsset}
            onOpenTacticalModal={onOpenTacticalModal || ((asset) => {
              VttEventBus.emit('open-tactical-play-modal', { token: asset });
            })}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Multi-Unit Switcher Pills */}
        {tokens.length > 1 && (
          <div className="px-3 py-1.5 bg-[#06090e] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[9px] uppercase font-bold text-slate-500 shrink-0">Units:</span>
            {tokens.map(tok => (
              <button
                key={tok.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(850, 0.04);
                  if (onSelectActiveToken) onSelectActiveToken(tok.id);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  activeToken.id === tok.id
                    ? 'bg-cyan-600 text-black shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tok.label || tok.name || 'Unit'}
              </button>
            ))}
          </div>
        )}

        {/* Mode Content: Folio Tactical Sheet vs Streamlined Deck */}
        {cockpitViewMode === 'folio' || activeAccordion === 'profile' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0a0e14] scrollbar-thin scrollbar-thumb-purple-950 p-1">
            <TacticalPlayView
              characterOverride={activePersona}
              isModal={false}
              onClose={() => setCockpitViewMode('cockpit')}
            />
          </div>
        ) : (
          /* Scrollable Content Container */
          <div className="flex-1 overflow-y-auto p-3 text-slate-200 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-cyan-950">
          {/* Vitals Overview Card */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-950 flex flex-col gap-2">
            {/* Health / Structure Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <Heart size={11} className="text-emerald-400" />
                  <span>{isSynthetic ? 'Structure:' : 'Health (HP):'}</span>
                </span>
                <span className="text-slate-300 font-bold">
                  {isSynthetic ? `${curStructure}/${maxStructure}` : `${curHealth}/${maxHealth}`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${isSynthetic ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (isSynthetic ? curStructure / maxStructure : curHealth / maxHealth) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Vitality Points (VP) Bar (Biological Only - RULE-VIT-01) */}
            {!isSynthetic && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-teal-400 font-bold uppercase flex items-center gap-1">
                    <Activity size={11} className="text-teal-400" />
                    <span>Vitality (VP):</span>
                  </span>
                  <span className="text-slate-300 font-bold">{curVitality}/{maxVitality}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-teal-400 transition-all duration-300 shadow-[0_0_6px_rgba(45,212,191,0.6)]"
                    style={{ width: `${Math.max(0, Math.min(100, (curVitality / Math.max(1, maxVitality)) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Shield Points (SP) Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-cyan-400 font-bold uppercase flex items-center gap-1">
                  <Shield size={11} className="text-cyan-400" />
                  <span>Energy Shields:</span>
                </span>
                <span className="text-slate-300 font-bold">{curShield}/{maxShield}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  style={{ width: `${Math.max(0, Math.min(100, (curShield / Math.max(1, maxShield)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Armor DR, Stamina DR, and Bleedout Stability */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-800/80">
              <div className="p-1 rounded bg-slate-900/90 border border-slate-800 flex flex-col items-center">
                <span className="text-slate-400 text-[8px] uppercase">Armor DR</span>
                <span className="font-bold text-amber-300">{armorDr}</span>
              </div>
              <div className="p-1 rounded bg-slate-900/90 border border-slate-800 flex flex-col items-center">
                <span className="text-slate-400 text-[8px] uppercase">Stamina DR</span>
                <span className="font-bold text-purple-300">{staminaDr}</span>
              </div>
              <div className="p-1 rounded bg-slate-900/90 border border-slate-800 flex flex-col items-center">
                <span className="text-slate-400 text-[8px] uppercase">Stability</span>
                <span className={`font-bold ${curHealth <= 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {stability}
                </span>
              </div>
            </div>

            {/* Conditions / Status Gems */}
            {conditions.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/80">
                {conditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-[9px] text-red-300 font-mono font-bold flex items-center gap-1"
                  >
                    <span>⚠️</span>
                    <span>{cond}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skill-Based Action Economy & Combat Options (RULE-SKL-01 & RULE-SKL-02) */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
            {/* Weapon & Skill Action Economy Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                <Crosshair size={12} />
                <span>Skill Action Economy:</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                {skillResolution.attackCount} {skillResolution.attackCount === 1 ? 'Attack' : 'Attacks'} Unlocked
              </span>
            </div>

            {/* Weapon Skill & Focus Banner */}
            <div className="p-1.5 rounded bg-slate-900/90 border border-cyan-950 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300 font-bold">
                  {skillResolution.skillName} (Rank {skillResolution.rank})
                </span>
                <span className="text-amber-400 font-bold">
                  +{skillResolution.focusBonus} Focus Bonus
                </span>
              </div>
              <span className="text-[9px] text-slate-400 italic">
                {skillResolution.description}
              </span>
            </div>

            {/* Unlocked Multi-Attack Sequence Buttons */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold text-slate-400">
                Attack Sequence (RULE-SKL-01):
              </span>
              <div className="grid grid-cols-3 gap-1 font-mono text-[9px]">
                {skillResolution.ladder.map((map) => (
                  <button
                    key={map.step}
                    type="button"
                    onClick={() => setActiveMapStep(map.step)}
                    className={`py-1 px-1 rounded font-bold transition-all cursor-pointer text-center flex flex-col items-center ${
                      activeMapStep === map.step
                        ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white'
                    }`}
                  >
                    <span>{map.label}</span>
                    <span className="text-[8px] opacity-80">
                      {map.penalty >= 0 ? `+${map.penalty}` : map.penalty} Strike
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Defense Reactions Cluster (RULE-SKL-02) */}
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-purple-400 flex items-center gap-1">
                  <ShieldAlert size={11} />
                  <span>Defenses ({defenseResolution.defenseSkill} R{defenseResolution.defenseRank}):</span>
                </span>
                {spentReactions > 0 && (
                  <button
                    type="button"
                    onClick={handleResetReactions}
                    className="text-[8px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-0.5 cursor-pointer bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50"
                  >
                    <RefreshCw size={8} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                {defenseResolution.reactionSlots.map((slot) => {
                  const isSpent = spentReactions >= slot.slot;
                  return (
                    <button
                      key={slot.slot}
                      type="button"
                      onClick={() => handleUseReaction(slot.slot)}
                      className={`py-1 px-1.5 rounded border font-bold transition-all cursor-pointer flex justify-between items-center ${
                        isSpent
                          ? 'bg-slate-900 border-slate-800 text-slate-600 line-through'
                          : 'bg-purple-950/50 border-purple-800/70 text-purple-200 hover:bg-purple-900/60'
                      }`}
                      title={`Toggle Reaction Slot #${slot.slot} (${slot.penalty} penalty)`}
                    >
                      <span>{slot.label}</span>
                      <span className={`text-[8px] px-1 py-0.2 rounded ${isSpent ? 'bg-slate-800 text-slate-600' : 'bg-purple-900 text-purple-300'}`}>
                        {isSpent ? 'SPENT' : slot.penalty}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactical Stance Selector */}
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/80">
              <span className="text-[9px] uppercase font-bold text-slate-400">Locomotion Stance:</span>
              <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                <button
                  type="button"
                  onClick={() => handleSetStance('pace')}
                  className={`py-1 px-1.5 rounded border font-bold text-left transition-all cursor-pointer ${
                    movementStance === 'pace'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🚶 Pace (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStance('sprint')}
                  className={`py-1 px-1.5 rounded border font-bold text-left transition-all cursor-pointer ${
                    movementStance === 'sprint'
                      ? 'bg-amber-950 border-amber-500 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Sprint (+10ft)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStance('guard')}
                  className={`py-1 px-1.5 rounded border font-bold text-left transition-all cursor-pointer ${
                    movementStance === 'guard'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ Guard (+2 Def)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStance('evasive')}
                  className={`py-1 px-1.5 rounded border font-bold text-left transition-all cursor-pointer ${
                    movementStance === 'evasive'
                      ? 'bg-purple-950 border-purple-500 text-purple-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🌀 Evasive Move
                </button>
              </div>
            </div>

            {/* Sensor / Vision Mode Selector */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Eye size={11} />
                <span>Sensor LoS:</span>
              </span>
              <select
                value={activeSensorMode}
                onChange={(e) => onChangeSensorMode?.(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-cyan-300 outline-none font-mono"
              >
                <option value="standard_optical">Optical / Visible</option>
                <option value="thermal_ir">Thermal IR</option>
                <option value="cyber_radar">Cyber Radar</option>
                <option value="meta_attunement">Meta Influx</option>
              </select>
            </div>
          </div>

          {/* BASTION Combat Engine Section */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-950/70 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                <Swords size={12} />
                <span>BASTION Combat Engine</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                2d10 ARBITRATION
              </span>
            </div>

            {/* Weapon Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Equipped Weapon:</label>
              <select
                value={selectedWeaponId}
                onChange={(e) => setSelectedWeaponId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-amber-300 font-bold outline-none"
              >
                {availableWeapons.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.damage}) — Rng: {w.range}
                  </option>
                ))}
              </select>
            </div>

            {/* Multi-Attack Penalty (MAP) Ladder */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                <span>Multi-Attack Ladder (RULE-SKL-01):</span>
                <span className="text-amber-400 font-mono">
                  {skillResolution.ladder.find(m => m.step === activeMapStep)?.label || `Attack #${activeMapStep}`}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 font-mono text-[9px]">
                {skillResolution.ladder.map(map => (
                  <button
                    key={map.step}
                    type="button"
                    onClick={() => setActiveMapStep(map.step)}
                    className={`py-1 rounded font-bold transition-all cursor-pointer text-center ${
                      activeMapStep === map.step
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    #{map.step} ({map.penalty >= 0 ? `+${map.penalty}` : map.penalty})
                  </button>
                ))}
              </div>
            </div>

            {/* Called Shot Matrix */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                <span>Called Shot Matrix (RULE-CMB-04):</span>
                <span className="text-purple-300 font-mono">{activeCalledShot.label} ({activeCalledShot.penalty})</span>
              </div>
              <select
                value={selectedCalledShotId}
                onChange={(e) => setSelectedCalledShotId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-purple-300 outline-none font-mono"
              >
                <option value="center_mass">Torso: Center Mass (-1 Strike) • Fortitude vs Winded</option>
                <option value="head">Head / Sensory (-4 Strike) • Reason vs Stunned/KO</option>
                <option value="right_arm">Right Arm (-4 Strike) • Reflex vs Disarm</option>
                <option value="left_arm">Left Arm (-4 Strike) • Reflex vs Disarm</option>
                <option value="right_leg">Right Leg (-2 Strike) • Might vs Hobbled</option>
                <option value="left_leg">Left Leg (-2 Strike) • Might vs Hobbled</option>
              </select>
              <span className="text-[9px] text-slate-500 italic truncate">
                Save Target: {activeCalledShot.effect}
              </span>
            </div>

            {/* Tactical Edge Modifiers */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80 text-[10px]">
              <button
                type="button"
                onClick={() => setEdgeAiming(!edgeAiming)}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  edgeAiming
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Aim (+2)
              </button>
              <button
                type="button"
                onClick={() => setEdgeFlanking(!edgeFlanking)}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  edgeFlanking
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Flank (+2)
              </button>
              <button
                type="button"
                onClick={() => setEdgeHighGround(!edgeHighGround)}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  edgeHighGround
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                High Ground (+2)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasAdvantage(!hasAdvantage);
                  if (!hasAdvantage) setHasDisadvantage(false);
                }}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  hasAdvantage
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                ADV (2d10kh1)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasDisadvantage(!hasDisadvantage);
                  if (!hasDisadvantage) setHasAdvantage(false);
                }}
                className={`px-2 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-all ${
                  hasDisadvantage
                    ? 'bg-red-950 border-red-500 text-red-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                DIS (2d10kl1)
              </button>
            </div>

            {/* Target Information */}
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Target size={11} className="text-red-400" />
                <span>Target:</span>
              </span>
              <span className="font-mono font-bold text-red-300 truncate max-w-[150px]">
                {resolvedTargetToken?.label || resolvedTargetToken?.name || 'No Target Selected'}
                {resolvedTargetToken && ` (DEF ${resolvedTargetToken.defense || 12})`}
              </span>
            </div>

            {/* BASTION Attack Trigger Button */}
            <button
              type="button"
              onClick={handleExecuteBastionAttack}
              className="py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95 cursor-pointer mt-1"
            >
              <Dices size={15} />
              <span>Roll BASTION Strike (2d10)</span>
            </button>

            {/* Last Roll Outcome Card */}
            {lastRollResult && (
              <div className={`p-2 rounded-lg border text-[10px] font-mono mt-1 ${
                lastRollResult.isHit
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                  : 'bg-red-950/80 border-red-800 text-red-200'
              }`}>
                <div className="flex justify-between items-center font-bold">
                  <span>{lastRollResult.isCritSuccess ? '🌟 CRITICAL HIT!' : lastRollResult.isHit ? '🎯 STRIKE HIT' : '❌ STRIKE MISSED'}</span>
                  <span>{lastRollResult.finalStrikeScore} vs DEF {lastRollResult.targetDefense}</span>
                </div>
                <div className="text-[9px] opacity-80 mt-0.5">
                  Rolls: [{lastRollResult.rolls.join(', ')}] {lastRollResult.totalStrikeMod >= 0 ? '+' : ''}{lastRollResult.totalStrikeMod} Mod • Net DMG: {lastRollResult.netDamage}
                </div>
              </div>
            )}
          </div>

          {/* Quick Consumables & Abilities */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1">
              <Zap size={12} />
              <span>Quick Consumables & Stims</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => handleUseConsumable('Med-Stim Alpha', 15)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-emerald-900/60 text-emerald-300 font-bold text-left cursor-pointer transition-all"
              >
                💉 Med-Stim (+15)
              </button>
              <button
                type="button"
                onClick={() => handleUseConsumable('Shield Recharger', 10)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-900/60 text-cyan-300 font-bold text-left cursor-pointer transition-all"
              >
                ⚡ Shield Cell (+10)
              </button>
              <button
                type="button"
                onClick={() => handleUseConsumable('Nanite Patch', 25)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-amber-900/60 text-amber-300 font-bold text-left cursor-pointer transition-all"
              >
                🧬 Nanite Patch (+25)
              </button>
              <button
                type="button"
                onClick={() => handleUseConsumable('Adrenaline Shot', 10)}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-purple-900/60 text-purple-300 font-bold text-left cursor-pointer transition-all"
              >
                🔋 Adrenaline Shot (+2 Strike)
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        )}
      </div>

    {/* Draggable Adjustment Slider Splitter (Right Edge of Left Rail) */}
    {!isCollapsed && (
      <div
        onMouseDown={handleStartResize}
        className="w-2 hover:w-2.5 -mr-1 h-full cursor-col-resize z-40 relative group flex items-center justify-center transition-all select-none hover:bg-cyan-500/20 active:bg-cyan-500/40 shrink-0"
        title="Drag adjustment slider to resize Operative Cockpit"
      >
        <div className="w-0.5 h-16 rounded bg-slate-700 group-hover:bg-cyan-400 group-hover:h-24 transition-all" />
        {/* Prominent floating collapse tab */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse?.();
          }}
          className="absolute top-1/2 -translate-y-1/2 -right-3.5 z-50 w-7 h-14 rounded-r-xl bg-slate-900/95 border-y border-r border-cyan-500/70 hover:border-cyan-400 text-cyan-400 hover:text-black hover:bg-cyan-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer group/btn"
          title="Collapse Operative Cockpit"
        >
          <ChevronLeft size={16} className="transition-transform group-hover/btn:-translate-x-0.5" />
          <span className="text-[7px] font-mono font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180 text-cyan-300 group-hover/btn:text-black">HIDE</span>
        </button>
      </div>
    )}
  </aside>
  );
};

export default OperativeCockpitRail;
