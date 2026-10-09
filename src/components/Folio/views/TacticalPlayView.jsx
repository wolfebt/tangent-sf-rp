import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { rollDice } from '../../../services/diceService';
import { AudioService } from '../../../services/audioService';
import { useToast } from '../../../context/ToastContext';
import { ALL_CANONICAL_SKILLS } from '../../../data/skillsData';
import { resolveSubAttrScore } from '../../../utils/attributeUtils';
import { scaleCarryingCapacity } from '../../../engines/tangentScalingEngine';
import { 
  resolveAllTacticalAttacks, 
  sanitizeDiceExpression, 
  createAttackFromWeapon, 
  buildWeaponNotes 
} from '../../../utils/combatUtils';
import { enrichItemWithModifiers } from '../../../engines/tangentModifierEngine';
import FolioTooltip from '../shared/FolioTooltip';
import { getSpeciesRestProfile } from '../../../engines/tangentRestEngine';
import { getInherentSpeciesTraits, formatSpeciesTrait } from '../../../utils/speciesDisplayUtils';
import { resolveCatalogItem } from '../../../engines/tangentIdentityEngine';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
import { 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Swords,
  Heart, 
  Activity, 
  Dices, 
  Crosshair, 
  Sword, 
  Lock, 
  Unlock, 
  Moon, 
  Sun, 
  AlertTriangle, 
  Skull, 
  CheckCircle2, 
  RotateCcw, 
  Zap, 
  Sparkles,
  Layers,
  Flame,
  User,
  Cpu,
  X,
  Eye,
  Info,
  ChevronRight,
  ChevronDown,
  BookOpen,
  BatteryCharging,
  Wrench,
  Briefcase,
  Package,
  Boxes,
  Scale,
  Search
} from 'lucide-react';

export const TacticalPlayView = ({ 
  onSwitchToBuilder, 
  characterOverride = null, 
  isModal = false, 
  isPreview = false, 
  onClose = null,
  onLockSheet = null 
}) => {
  const { toast } = useToast();
  const folio = useFolio();
  const rawCharacterData = characterOverride || folio.characterData || {};
  const [localVitalsOverride, setLocalVitalsOverride] = useState({});

  // Reset local override when the persona switches
  useEffect(() => {
    setLocalVitalsOverride({});
  }, [rawCharacterData['character-doc-id'], rawCharacterData.id]);

  const characterData = useMemo(() => ({
    ...rawCharacterData,
    ...localVitalsOverride
  }), [rawCharacterData, localVitalsOverride]);

  const derivedStats = folio.derivedStats || {};
  const getAttrTotal = folio.getAttrTotal;
  const applyCharacterDamage = folio.applyCharacterDamage;
  const updateCharacterHealth = folio.updateCharacterHealth;
  const updateCharacterVitality = folio.updateCharacterVitality;
  const updateCharacterStructure = folio.updateCharacterStructure;
  const updateCharacterKarma = folio.updateCharacterKarma;
  const spendKarma = folio.spendKarma;
  const takeCharacterRest = folio.takeCharacterRest;
  const stabilizeCharacter = folio.stabilizeCharacter;
  const advanceCharacterDeathTurn = folio.advanceCharacterDeathTurn;
  const revivifyCharacter = folio.revivifyCharacter;
  const unlockPersona = folio.unlockPersona;
  const lockPersona = folio.lockPersona;
  const isLocked = folio.isLocked;

  const { openDiceRoller } = useDice();

  // Section Tab State: 'all' | 'vitals' | 'combat' | 'aspects' | 'skills' | 'property'
  // Default land to all cockpit
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setActiveTab('all');
  }, [characterData['character-doc-id'], characterData.id]);

  // Combat Triage State
  const [damageInput, setDamageInput] = useState('5');
  const [damageType, setDamageType] = useState('kinetic'); // kinetic | lethal | direct_health | direct_vit | crit | concussive
  const [applyToughnessSoak, setApplyToughnessSoak] = useState(false);
  const [healInput, setHealInput] = useState('5');
  const [healTarget, setHealTarget] = useState('smart'); // smart | vitality | health | structure
  const [triageFeedback, setTriageFeedback] = useState(null);
  const [latestDamageResult, setLatestDamageResult] = useState(null);
  const [attackCategoryFilter, setAttackCategoryFilter] = useState('all'); // all | weapon | natural | metaphysics
  const [latestTacticalRoll, setLatestTacticalRoll] = useState(null);

  // Consolidated Aspects State
  const [aspectSearchQuery, setAspectSearchQuery] = useState('');
  const [aspectFilter, setAspectFilter] = useState('all'); // 'all' | 'traits' | 'metaphysics' | 'augmentations'

  // Property State: Collapsible Categories (No slider bar)
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState(() => ({
    weaponry: true,
    armoring: true,
    gear: true,
    mecha: true,
    architecture: false,
    other: false
  }));

  // Sync aspect filter if external tabs request specific subfeature
  useEffect(() => {
    if (activeTab === 'metaphysics') {
      setAspectFilter('metaphysics');
    } else if (activeTab === 'augmentations') {
      setAspectFilter('augmentations');
    } else if (activeTab === 'aspects' || activeTab === 'traits' || activeTab === 'features') {
      setAspectFilter('traits');
    }
  }, [activeTab]);

  // Synthetic vs Biological Vitals Rule:
  // A synthetic (mecha, construct) character has structure and does NOT have health or vitality.
  // Otherwise, character has health and vitality and does NOT have structure.
  const speciesStr = String(characterData['char-species'] || characterData.species || '').toLowerCase();
  const archetypeStr = String(characterData['char-archetype'] || characterData.archetype || '').toLowerCase();
  const isSynthetic = Boolean(
    characterData.isSynthetic ?? characterData.is_synthetic ?? derivedStats?.isSynthetic ?? (
      speciesStr.includes('synthetic') || speciesStr.includes('mekan') || 
      speciesStr.includes('construct') || speciesStr.includes('golem') || 
      speciesStr.includes('ooze') || speciesStr.includes('undead') ||
      speciesStr.includes('mecha') || speciesStr.includes('robot') || speciesStr.includes('drone') ||
      archetypeStr.includes('synthetic')
    )
  );

  // Vitals calculation
  const curHealth = isSynthetic ? null : parseInt(characterData.current_health ?? characterData.health ?? 30, 10);
  const maxHealth = isSynthetic ? null : parseInt(characterData.health || derivedStats?.health || 30, 10);
  const curVitality = isSynthetic ? null : parseInt(characterData.current_vitality ?? characterData.vitality ?? 30, 10);
  const maxVitality = isSynthetic ? null : parseInt(characterData.vitality || derivedStats?.vitality || 30, 10);

  const curStructure = isSynthetic 
    ? parseInt(characterData.current_structure ?? characterData.structure ?? derivedStats?.structure ?? 60, 10)
    : null;
  const maxStructure = isSynthetic 
    ? parseInt(characterData.structure || derivedStats?.structure || 60, 10)
    : null;

  const curKarma = parseInt(characterData.karma ?? derivedStats?.maxKarma ?? 3, 10);
  const maxKarma = parseInt(derivedStats?.maxKarma ?? 3, 10);
  const plotPoints = parseInt(characterData['plot-points'] || 0, 10);

  // Status checks
  const isDead = Boolean(characterData.is_dead);
  const isStabilized = Boolean(characterData.is_stabilized);
  const atDeathsDoor = !isDead && !isStabilized && (
    isSynthetic 
      ? Boolean(curStructure <= 0 || characterData.is_at_deaths_door)
      : Boolean(characterData.is_at_deaths_door || (curHealth <= 0 && curVitality <= 0))
  );
  const isIncapacitated = !isDead && !atDeathsDoor && !isStabilized && (
    isSynthetic ? (curStructure <= 10 && curStructure > 0) : (curHealth <= 0)
  );

  // Damage already sustained from maximum vitals
  const hpDamageTaken = !isSynthetic && maxHealth !== null && curHealth !== null ? Math.max(0, maxHealth - curHealth) : 0;
  const vitDamageTaken = !isSynthetic && maxVitality !== null && curVitality !== null ? Math.max(0, maxVitality - curVitality) : 0;
  const structDamageTaken = isSynthetic && maxStructure !== null && curStructure !== null ? Math.max(0, maxStructure - curStructure) : 0;

  // Attributes
  const attrStr = getAttrTotal ? getAttrTotal('attr-strength') : parseInt(characterData['attr-strength'] || 0, 10);
  const attrAgi = getAttrTotal ? getAttrTotal('attr-agility') : parseInt(characterData['attr-agility'] || 0, 10);
  const attrSta = getAttrTotal ? getAttrTotal('attr-stamina') : parseInt(characterData['attr-stamina'] || 0, 10);
  const attrInt = getAttrTotal ? getAttrTotal('attr-intellect') : parseInt(characterData['attr-intellect'] || 0, 10);
  const attrWis = getAttrTotal ? getAttrTotal('attr-wisdom') : parseInt(characterData['attr-wisdom'] || 0, 10);
  const attrCha = getAttrTotal ? getAttrTotal('attr-charisma') : parseInt(characterData['attr-charisma'] || 0, 10);
  const effectiveToughness = derivedStats?.toughness ?? attrSta ?? 0;

  // Live damage preview for visual feedback on vitals bars
  const previewDamage = useMemo(() => {
    const amt = parseInt(damageInput, 10);
    if (!amt || amt <= 0) {
      return {
        netDamage: 0,
        vitLoss: 0,
        hpLoss: 0,
        structLoss: 0,
        immune: false,
        remainingVit: curVitality,
        remainingHp: curHealth,
        remainingStruct: curStructure
      };
    }

    if (isSynthetic) {
      if (damageType === 'nonlethal') {
        return {
          netDamage: 0,
          vitLoss: 0,
          hpLoss: 0,
          structLoss: 0,
          immune: true,
          remainingVit: 0,
          remainingHp: 0,
          remainingStruct: curStructure
        };
      }
      const mult = damageType === 'crit' ? 2 : 1;
      let net = amt * mult;
      if (applyToughnessSoak && effectiveToughness > 0) {
        net = Math.max(1, net - effectiveToughness);
      }
      const sLoss = Math.min(curStructure || 0, net);
      return {
        netDamage: net,
        vitLoss: 0,
        hpLoss: 0,
        structLoss: sLoss,
        immune: false,
        remainingVit: 0,
        remainingHp: 0,
        remainingStruct: Math.max(0, (curStructure || 0) - sLoss)
      };
    }

    // Biological targets
    const mult = damageType === 'crit' ? 2 : 1;
    let net = amt * mult;
    if (applyToughnessSoak && effectiveToughness > 0) {
      net = Math.max(1, net - effectiveToughness);
    }

    let vLoss = 0;
    let hLoss = 0;

    if (damageType === 'kinetic' || damageType === 'nonlethal') {
      // Depletes Vitality (stamina) buffer first, then spills into Health
      vLoss = Math.min(curVitality || 0, net);
      const spill = net - vLoss;
      hLoss = Math.min(curHealth || 0, spill);
    } else if (damageType === 'lethal' || damageType === 'crit') {
      // Damages Health directly, excess spills to Vitality
      hLoss = Math.min(curHealth || 0, net);
      const excess = net - hLoss;
      vLoss = Math.min(curVitality || 0, excess);
    } else if (damageType === 'direct_health') {
      hLoss = Math.min(curHealth || 0, net);
      vLoss = 0;
    } else if (damageType === 'direct_vit') {
      vLoss = Math.min(curVitality || 0, net);
      hLoss = 0;
    } else if (damageType === 'concussive') {
      // Concussive fatigue split: half to Vitality, half to Health
      const half = Math.floor(net / 2);
      const otherHalf = net - half;
      let tentativeVitLoss = Math.min(curVitality || 0, half);
      let tentativeHpLoss = Math.min(curHealth || 0, otherHalf);
      let vitSpill = half - tentativeVitLoss;
      let hpSpill = otherHalf - tentativeHpLoss;
      hLoss = Math.min(curHealth || 0, tentativeHpLoss + vitSpill);
      vLoss = Math.min(curVitality || 0, tentativeVitLoss + hpSpill);
    }

    return {
      netDamage: net,
      vitLoss: vLoss,
      hpLoss: hLoss,
      structLoss: 0,
      immune: false,
      remainingVit: Math.max(0, (curVitality || 0) - vLoss),
      remainingHp: Math.max(0, (curHealth || 0) - hLoss)
    };
  }, [damageInput, damageType, applyToughnessSoak, effectiveToughness, isSynthetic, curStructure, curVitality, curHealth]);

  // Live heal preview for visual feedback on vitals bars
  const previewHeal = useMemo(() => {
    const pts = parseInt(healInput, 10);
    if (!pts || pts <= 0) {
      return { hpGain: 0, vitGain: 0, structGain: 0, resultingHp: curHealth, resultingVit: curVitality, resultingStruct: curStructure };
    }
    if (isSynthetic) {
      const cur = curStructure || 0;
      const gain = Math.min(pts, Math.max(0, maxStructure - cur));
      return { hpGain: 0, vitGain: 0, structGain: gain, resultingStruct: cur + gain };
    }
    const curH = curHealth || 0;
    const curV = curVitality || 0;
    let hGain = 0;
    let vGain = 0;
    if (healTarget === 'smart') {
      const hDef = Math.max(0, maxHealth - curH);
      hGain = Math.min(hDef, pts);
      const rem = pts - hGain;
      if (rem > 0) {
        const vDef = Math.max(0, maxVitality - curV);
        vGain = Math.min(vDef, rem);
      }
    } else if (healTarget === 'health') {
      hGain = Math.min(Math.max(0, maxHealth - curH), pts);
    } else if (healTarget === 'vitality') {
      vGain = Math.min(Math.max(0, maxVitality - curV), pts);
    }
    return {
      hpGain: hGain,
      vitGain: vGain,
      structGain: 0,
      resultingHp: curH + hGain,
      resultingVit: curV + vGain
    };
  }, [healInput, healTarget, isSynthetic, curStructure, maxStructure, curHealth, maxHealth, curVitality, maxVitality]);

  // Canonical Primary Attributes & Paired Secondary Checks (Saves & Feats)
  const attributeCheckPairs = useMemo(() => [
    {
      primaryKey: 'attr-strength',
      subKey: 'attr-might',
      primaryName: 'Strength',
      primaryCode: 'STR',
      primaryScore: attrStr,
      subName: 'Might',
      subCode: 'MGT',
      subScore: getAttrTotal ? getAttrTotal('attr-might') : resolveSubAttrScore('attr-might', characterData, attrStr),
      role: 'Brute Force & Heavy Lifting',
      desc: 'Power, physical force, breaking bulkheads, melee impact'
    },
    {
      primaryKey: 'attr-agility',
      subKey: 'attr-reflex',
      primaryName: 'Agility',
      primaryCode: 'AGI',
      primaryScore: attrAgi,
      subName: 'Reflex',
      subCode: 'REF',
      subScore: getAttrTotal ? getAttrTotal('attr-reflex') : resolveSubAttrScore('attr-reflex', characterData, attrAgi),
      role: 'Reaction Save & Evasion',
      desc: 'Balance, coordination, dodging explosions/traps, initiative base'
    },
    {
      primaryKey: 'attr-stamina',
      subKey: 'attr-fortitude',
      primaryName: 'Stamina',
      primaryCode: 'STA',
      primaryScore: attrSta,
      subName: 'Fortitude',
      subCode: 'FOR',
      subScore: getAttrTotal ? getAttrTotal('attr-fortitude') : resolveSubAttrScore('attr-fortitude', characterData, attrSta),
      role: 'Endurance & Pathogen/Shock Save',
      desc: isSynthetic ? 'Structural shearing, power overload, kinetic shock' : 'Resisting toxins, radiation, biological trauma, exhaustion'
    },
    {
      primaryKey: 'attr-intellect',
      subKey: 'attr-logic',
      primaryName: 'Intellect',
      primaryCode: 'INT',
      primaryScore: attrInt,
      subName: 'Reason',
      subCode: 'LOG',
      subScore: getAttrTotal ? getAttrTotal('attr-logic') : resolveSubAttrScore('attr-logic', characterData, attrInt),
      role: 'Deduction & Tech Override',
      desc: 'Cracking ciphers, cybernetic decoding, tech system operation'
    },
    {
      primaryKey: 'attr-wisdom',
      subKey: 'attr-will',
      primaryName: 'Wisdom',
      primaryCode: 'WIS',
      primaryScore: attrWis,
      subName: 'Willpower',
      subCode: 'WIL',
      subScore: getAttrTotal ? getAttrTotal('attr-will') : resolveSubAttrScore('attr-will', characterData, attrWis),
      role: 'Mental & Psychic Screen',
      desc: isSynthetic ? 'Resisting cyber-intrusion, electronic warfare' : 'Resisting psychic coercion, fear, metaphysical breach'
    },
    {
      primaryKey: 'attr-charisma',
      subKey: 'attr-etiquette',
      primaryName: 'Charisma',
      primaryCode: 'CHA',
      primaryScore: attrCha,
      subName: 'Etiquette',
      subCode: 'ETI',
      subScore: getAttrTotal ? getAttrTotal('attr-etiquette') : resolveSubAttrScore('attr-etiquette', characterData, attrCha),
      role: 'Composure & Tactical Command',
      desc: 'Diplomacy, morale, leadership commands, social de-escalation'
    }
  ], [attrStr, attrAgi, attrSta, attrInt, attrWis, attrCha, characterData, getAttrTotal, isSynthetic]);

  // Defense Skill & Combat Defense Rank
  const defRank = parseInt(characterData['skill-combat-defense-rank'] || characterData['skill-defense-rank'] || 0, 10);
  const acroRank = parseInt(characterData['skill-physical-acrobatics-rank'] || characterData['skill-acrobatics-rank'] || 0, 10);
  const meleeRank = parseInt(characterData['skill-combat-melee-rank'] || characterData['skill-melee-rank'] || 0, 10);

  // Size Category Defense Modifier
  const sizeKey = characterData['char-size'] || derivedStats?.size || 'Medium';
  const sizeLower = String(sizeKey).toLowerCase();
  let sizeDefenseMod = 0;
  if (sizeLower.includes('fine')) sizeDefenseMod = 8;
  else if (sizeLower.includes('diminutive')) sizeDefenseMod = 4;
  else if (sizeLower.includes('tiny')) sizeDefenseMod = 2;
  else if (sizeLower.includes('small')) sizeDefenseMod = 1;
  else if (sizeLower.includes('large')) sizeDefenseMod = -1;
  else if (sizeLower.includes('huge')) sizeDefenseMod = -2;
  else if (sizeLower.includes('gargantuan')) sizeDefenseMod = -4;
  else if (sizeLower.includes('colossal')) sizeDefenseMod = -8;

  // Canonical Base Defense Score: 10 + Agility + Defense Rank + Size/Armor Modifiers
  const baseDefenseScore = 10 + attrAgi + defRank + sizeDefenseMod;
  const baseDefenseCheckMod = attrAgi + defRank;

  // Physical Armor & Energy Shield
  const physicalArmor = parseInt(characterData.physical_armor || derivedStats?.toughness || characterData.armor || 0, 10);
  const energyShield = parseInt(characterData.energy_shield || characterData.shield || 0, 10);

  // Shield Item Bonus (from armoring, shield property, or characterData.shield_bonus)
  const shieldBonus = parseInt(characterData.shield_bonus || characterData.shield_rating || (characterData.shield ? 2 : 0), 10);

  // Dedicated Reaction Slots (Specialties): Dodge (Evasion), Parry (Weapon Block), Block (Shield)
  // 1. Dodge Slot (Evasion Specialization / Acrobatics Synergy)
  const dodgeBonus = attrAgi + defRank + acroRank + parseInt(characterData.dodge_mod || 0, 10);
  const dodgeScore = 10 + dodgeBonus + sizeDefenseMod;

  // 2. Parry Slot (Weapon Block Specialization / Melee Synergy)
  const meleeAttr = Math.max(attrAgi, attrStr);
  const parryBonus = meleeAttr + defRank + meleeRank + parseInt(characterData.parry_mod || 0, 10);
  const parryScore = 10 + parryBonus + sizeDefenseMod;

  // 3. Block Slot (Shield Specialization / Equipped Shield)
  const blockBonus = attrAgi + defRank + shieldBonus + parseInt(characterData.block_mod || 0, 10);
  const blockScore = 10 + blockBonus + sizeDefenseMod;

  // Species Rest Profile (Minimal Rest: Synthetics, Fae, Insects; Meditative: Alterians, Mondi)
  const speciesRestProfile = useMemo(() => {
    return getSpeciesRestProfile(characterData);
  }, [characterData]);
  const isMinimalRestSpecies = Boolean(speciesRestProfile.lightRestCountsAsFull || isSynthetic);

  // Key Ability Modifier for Essence Recovery (Wisdom / Intellect)
  const keyAbilityMod = Math.max(1, Math.max(attrWis, attrInt));

  // Light Rests Tracking (max 4/day)
  const lightRestsToday = parseInt(characterData.light_rests_today || 0, 10);
  const maxLightRests = 4;

  // Death Clock rounds (Stamina score, minimum 1)
  const deathClockRounds = characterData.death_clock ?? Math.max(1, attrSta);

  // Reaction Saves (Saves are rolled using the sub-attributes Reflex, Fortitude, Willpower)
  const reflexSaveBonus = attributeCheckPairs.find(p => p.subKey === 'attr-reflex')?.subScore ?? (getAttrTotal ? getAttrTotal('attr-reflex') : resolveSubAttrScore('attr-reflex', characterData, attrAgi));
  const fortitudeSaveBonus = attributeCheckPairs.find(p => p.subKey === 'attr-fortitude')?.subScore ?? (getAttrTotal ? getAttrTotal('attr-fortitude') : resolveSubAttrScore('attr-fortitude', characterData, attrSta));
  const willpowerSaveBonus = attributeCheckPairs.find(p => p.subKey === 'attr-will')?.subScore ?? (getAttrTotal ? getAttrTotal('attr-will') : resolveSubAttrScore('attr-will', characterData, attrWis));

  const reactionSaves = useMemo(() => [
    { name: 'Reflex Save', code: 'REF', bonus: reflexSaveBonus, desc: 'Dodge explosions, area hazards, traps' },
    { name: 'Fortitude Save', code: 'FOR', bonus: fortitudeSaveBonus, desc: isSynthetic ? 'Resist structural shearing, overload, kinetic shock' : 'Resist toxins, radiation, biological shock' },
    { name: 'Willpower Save', code: 'WIL', bonus: willpowerSaveBonus, desc: isSynthetic ? 'Resist cyber-intrusion, electronic warfare, AI override' : 'Resist psychic coercion, fear, metaphysical breach' }
  ], [reflexSaveBonus, fortitudeSaveBonus, willpowerSaveBonus, isSynthetic]);

  // Tactical Attacks & Offensive Capabilities List (Weapons, Natural Attacks & Offensive Metaphysics)
  const weaponsList = useMemo(() => {
    return resolveAllTacticalAttacks(characterData, getAttrTotal, isSynthetic);
  }, [characterData, getAttrTotal, isSynthetic]);

  const attackCounts = useMemo(() => ({
    all: weaponsList.length,
    weapon: weaponsList.filter(item => item.category === 'weapon').length,
    natural: weaponsList.filter(item => item.category === 'natural').length,
    metaphysics: weaponsList.filter(item => item.category === 'metaphysics').length
  }), [weaponsList]);

  const filteredAttacks = useMemo(() => {
    if (attackCategoryFilter === 'all') return weaponsList;
    return weaponsList.filter(item => item.category === attackCategoryFilter);
  }, [weaponsList, attackCategoryFilter]);

  // Trained Skills Grouped by Category (EMPTY GROUPS ARE NOT DISPLAYED)
  const trainedSkillsByGroup = useMemo(() => {
    const groupLabels = {
      combat: '⚔️ Combat Skills',
      physical: '🏃 Physical Skills',
      mental: '🧠 Mental Skills',
      social: '💬 Social Skills',
      metafocus: '🔮 Metafocus Skills'
    };

    const canonicalMap = new Map();
    ALL_CANONICAL_SKILLS.forEach(s => {
      canonicalMap.set(s.id.toLowerCase(), s);
      const cleanId = s.id.replace(/^[a-z]+-/, '').toLowerCase();
      canonicalMap.set(cleanId, s);
    });

    const trainedSkills = new Map();

    Object.entries(characterData).forEach(([key, val]) => {
      if (key.startsWith('skill-') && key.endsWith('-rank')) {
        const rank = parseInt(val, 10);
        if (rank > 0) {
          const rawId = key.replace('skill-', '').replace('-rank', '').toLowerCase();
          const cleanId = rawId.replace(/^[a-z]+-/, '');
          const canon = canonicalMap.get(rawId) || canonicalMap.get(cleanId);
          const name = canon?.name || characterData[`skill-${rawId}-name`] || characterData[`skill-${cleanId}-name`] || cleanId.replace(/-/g, ' ');
          const group = canon?.group || 'combat';
          const baseAttr = canon?.baseAttr || 'attr-agility';
          const attrKey = baseAttr.replace('attr-', '');
          const attrScore = getAttrTotal ? getAttrTotal(baseAttr) : parseInt(characterData[baseAttr] || 0, 10);
          const total = attrScore + rank;

          if (!trainedSkills.has(cleanId) || rank > trainedSkills.get(cleanId).rank) {
            trainedSkills.set(cleanId, {
              id: cleanId,
              name,
              group,
              rank,
              baseAttr,
              attrKey: attrKey.toUpperCase().slice(0, 3),
              attrScore,
              total,
              description: canon?.description || ''
            });
          }
        }
      }
    });

    const groups = {};
    trainedSkills.forEach(skill => {
      const grp = skill.group || 'combat';
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(skill);
    });

    Object.values(groups).forEach(list => {
      list.sort((a, b) => a.name.localeCompare(b.name));
    });

    const order = ['combat', 'physical', 'mental', 'social', 'metafocus'];
    const result = [];
    order.forEach(gKey => {
      if (groups[gKey] && groups[gKey].length > 0) {
        result.push({
          key: gKey,
          label: groupLabels[gKey] || `${gKey.toUpperCase()} Skills`,
          skills: groups[gKey]
        });
      }
    });

    Object.keys(groups).forEach(gKey => {
      if (!order.includes(gKey) && groups[gKey].length > 0) {
        result.push({
          key: gKey,
          label: `${gKey.toUpperCase()} Skills`,
          skills: groups[gKey]
        });
      }
    });

    return result;
  }, [characterData, getAttrTotal]);

  // Identity Pillars extraction
  const speciesName = characterData['char-species'] || characterData.species || '';
  const occuName = characterData['char-occu'] || characterData.occupation || '';
  const originName = characterData['char-origin'] || characterData.origin || '';
  const factionName = characterData['char-faction'] || characterData.faction || '';

  // 4 Identity Pillars Traits Grouping (Granted vs Chosen, empty pillar omission)
  const pillarTraitsData = useMemo(() => {
    const specObj = speciesName ? (resolveCatalogItem('species', speciesName) || DEFAULT_SPECIES.find(s => (s.name || s.id || '').toLowerCase() === String(speciesName).toLowerCase())) : null;

    // Helper to normalize trait entry
    const normalizeTrait = (raw, defaultSource, isGrantedDefault = false) => {
      if (!raw) return null;
      const feat = enrichItemWithModifiers(raw);
      const name = typeof feat === 'object' ? (feat.name || feat.title || feat.id || '') : String(feat);
      if (!name) return null;
      const desc = typeof feat === 'object' ? (feat.description || feat.desc || feat.summary || feat.effect || '') : '';
      const rules = typeof feat === 'object' ? (feat.rules || feat.mechanic || '') : '';
      const source = typeof feat === 'object' ? (feat.source || defaultSource) : defaultSource;
      const cp = typeof feat === 'object' && feat.cp !== undefined ? feat.cp : (isGrantedDefault ? 0 : 1);
      const isGranted = Boolean(isGrantedDefault || cp === 0 || feat.isGranted || feat.isInherent || source?.toLowerCase().includes('inherent') || defaultSource?.toLowerCase().includes('inherent'));
      return {
        id: typeof feat === 'object' ? (feat.id || name) : name,
        name,
        description: desc,
        rules,
        source,
        cp: isGranted ? 0 : 1,
        isGranted,
        category: typeof feat === 'object' ? (feat.category || feat.type || 'Trait') : 'Trait',
        modifiers: Array.isArray(feat?.modifiers) ? feat.modifiers : []
      };
    };

    const seenNames = new Set();
    const addUnique = (list, item) => {
      if (!item) return;
      const key = item.name.toLowerCase().trim();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        list.push(item);
      }
    };

    // 1. Species Pillar
    const speciesList = [];
    if (specObj) {
      const inherentList = getInherentSpeciesTraits(specObj);
      inherentList.forEach(t => {
        const canonical = formatSpeciesTrait(t, specObj);
        if (canonical) {
          addUnique(speciesList, {
            id: canonical.id || String(t),
            name: canonical.name || String(t),
            description: canonical.tooltip?.description || 'Inherent species trait.',
            rules: canonical.tooltip?.rules || '',
            source: 'Species Inherent',
            cp: 0,
            isGranted: true,
            category: 'Species Trait',
            modifiers: []
          });
        }
      });
    }
    const speciesAlloc = characterData.speciesAllocations?.traits || [];
    speciesAlloc.forEach(t => addUnique(speciesList, normalizeTrait(t, 'Species', false)));
    (characterData.speciesAllocations?.features || []).forEach(f => addUnique(speciesList, normalizeTrait(f, 'Species', false)));

    // 2. Occupation Pillar
    const occuList = [];
    const occuAlloc = characterData.occuAllocations?.traits || [];
    occuAlloc.forEach(t => addUnique(occuList, normalizeTrait(t, 'Occupation', false)));
    (characterData.occuAllocations?.features || []).forEach(f => addUnique(occuList, normalizeTrait(f, 'Occupation', false)));

    // 3. Origin Pillar
    const originList = [];
    const originAlloc = characterData.originAllocations?.traits || [];
    originAlloc.forEach(t => addUnique(originList, normalizeTrait(t, 'Origin', false)));
    (characterData.originAllocations?.features || []).forEach(f => addUnique(originList, normalizeTrait(f, 'Origin', false)));

    // 4. Faction Pillar
    const factionList = [];
    const factionAlloc = characterData.factionAllocations?.traits || [];
    factionAlloc.forEach(t => addUnique(factionList, normalizeTrait(t, 'Faction', false)));
    (characterData.factionAllocations?.features || []).forEach(f => addUnique(factionList, normalizeTrait(f, 'Faction', false)));

    // Sort characterData.traits into pillars or general
    const rawTraits = Array.isArray(characterData.traits) ? characterData.traits : [];
    rawTraits.forEach(t => {
      const src = (typeof t === 'object' ? (t.source || t.columnCategory || t.category || '') : '').toLowerCase();
      if (src.includes('species')) {
        addUnique(speciesList, normalizeTrait(t, 'Species', false));
      } else if (src.includes('occu')) {
        addUnique(occuList, normalizeTrait(t, 'Occupation', false));
      } else if (src.includes('origin')) {
        addUnique(originList, normalizeTrait(t, 'Origin', false));
      } else if (src.includes('faction')) {
        addUnique(factionList, normalizeTrait(t, 'Faction', false));
      }
    });

    // General Features
    const generalList = [];
    (Array.isArray(characterData.features) ? characterData.features : []).forEach(f => {
      const isAwakened = typeof f === 'object' && (f.source?.toLowerCase().includes('awakened') || (f.name || '').toLowerCase().startsWith('awakened:'));
      if (!isAwakened) {
        const norm = normalizeTrait(f, 'Purchased Feature', false);
        if (norm) {
          const key = norm.name.toLowerCase().trim();
          if (!seenNames.has(key)) {
            seenNames.add(key);
            generalList.push(norm);
          }
        }
      }
    });
    rawTraits.forEach(t => {
      const norm = normalizeTrait(t, 'General Trait', false);
      if (norm) {
        const key = norm.name.toLowerCase().trim();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          generalList.push(norm);
        }
      }
    });

    // ONLY SHOW PILLAR IF PILLAR IS CHOSEN AND HAS AT LEAST 1 ENTRY
    const pillars = [
      {
        id: 'species',
        title: 'Species Traits',
        pillarName: speciesName,
        icon: '🧬',
        color: 'emerald',
        traits: speciesList.sort((a, b) => (b.isGranted ? 1 : 0) - (a.isGranted ? 1 : 0) || a.name.localeCompare(b.name))
      },
      {
        id: 'occupation',
        title: 'Occupation Traits',
        pillarName: occuName,
        icon: '💼',
        color: 'cyan',
        traits: occuList.sort((a, b) => (b.isGranted ? 1 : 0) - (a.isGranted ? 1 : 0) || a.name.localeCompare(b.name))
      },
      {
        id: 'origin',
        title: 'Origin Traits',
        pillarName: originName,
        icon: '🌍',
        color: 'amber',
        traits: originList.sort((a, b) => (b.isGranted ? 1 : 0) - (a.isGranted ? 1 : 0) || a.name.localeCompare(b.name))
      },
      {
        id: 'faction',
        title: 'Faction Traits',
        pillarName: factionName,
        icon: '🏛️',
        color: 'purple',
        traits: factionList.sort((a, b) => (b.isGranted ? 1 : 0) - (a.isGranted ? 1 : 0) || a.name.localeCompare(b.name))
      }
    ].filter(p => Boolean(p.pillarName && p.traits.length > 0));

    const totalTraitsCount = pillars.reduce((sum, p) => sum + p.traits.length, 0) + generalList.length;

    return {
      pillars,
      generalList,
      totalTraitsCount
    };
  }, [speciesName, occuName, originName, factionName, characterData]);

  // Metaphysics: Awakened Disciplines & Invocations
  const awakenedDisciplines = useMemo(() => {
    if (!Array.isArray(characterData.awakened)) return [];
    return characterData.awakened.filter(Boolean).map(awk => (
      typeof awk === 'object' ? awk : { name: String(awk) }
    ));
  }, [characterData.awakened]);

  const invocationsList = useMemo(() => {
    if (!Array.isArray(characterData.invocations)) return [];
    return characterData.invocations.filter(Boolean).map((inv, idx) => {
      const obj = typeof inv === 'object' ? inv : { name: String(inv) };
      const rank = parseInt(obj.rank || 1, 10);
      const mod = parseInt(obj.mod || 0, 10);
      const total = attrWis + rank + mod;
      return {
        id: obj.id || `inv_${idx}`,
        name: obj.name || obj.title || 'Invocation',
        discipline: obj.discipline || 'Metaphysics',
        baseDC: obj.baseDC || 15,
        total,
        rank,
        desc: obj.description || obj.desc || ''
      };
    });
  }, [characterData.invocations, attrWis]);

  // Augmentations & Cyberware
  const augmentationsList = useMemo(() => {
    const list = [];
    const seen = new Set();
    const addAug = (aug) => {
      if (!aug) return;
      const name = typeof aug === 'object' ? (aug.name || aug.title || '') : String(aug);
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      list.push(typeof aug === 'object' ? aug : { name, type: 'Chassis Cyberware' });
    };

    if (Array.isArray(characterData.augmentations)) {
      characterData.augmentations.forEach(addAug);
    }
    if (Array.isArray(characterData['property-augmentations'])) {
      characterData['property-augmentations'].forEach(addAug);
    }
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [characterData.augmentations, characterData['property-augmentations']]);

  // Consolidate Features, Metaphysics, and Augmentations into unified Aspects list
  const allAspects = useMemo(() => {
    const list = [];
    // 1. Pillar Traits
    pillarTraitsData.pillars.forEach(p => {
      p.traits.forEach(t => {
        list.push({
          ...t,
          subfeature: 'traits',
          pillarId: p.id,
          pillarTitle: p.title,
          aspectType: `${p.pillarName} ${t.isGranted ? '[Granted]' : '[Chosen]'}`
        });
      });
    });
    // General Features
    pillarTraitsData.generalList.forEach(t => {
      list.push({
        ...t,
        subfeature: 'traits',
        pillarId: 'general',
        pillarTitle: 'General Features',
        aspectType: 'Purchased Feature'
      });
    });
    // 2. Awakened Disciplines
    awakenedDisciplines.forEach((awk, idx) => {
      list.push({
        id: `awk_${idx}`,
        name: awk.name || 'Awakened Discipline',
        category: 'Awakened Domain',
        source: 'Metaphysics',
        description: awk.description || awk.desc || 'Awakened discipline resonance.',
        subfeature: 'metaphysics',
        aspectType: 'Awakened Domain'
      });
    });
    // 3. Learned Invocations
    invocationsList.forEach(inv => {
      list.push({
        id: inv.id,
        name: inv.name,
        category: inv.discipline || 'Metaphysics',
        source: 'Invocation',
        description: inv.desc || `Rank ${inv.rank} Invocation. Base Target DC ${inv.baseDC}.`,
        subfeature: 'metaphysics',
        aspectType: 'Learned Invocation',
        baseDC: inv.baseDC,
        total: inv.total,
        rank: inv.rank,
        discipline: inv.discipline
      });
    });
    // 4. Augmentations
    augmentationsList.forEach((aug, idx) => {
      list.push({
        id: aug.id || `aug_${idx}`,
        name: aug.name || `Augmentation #${idx + 1}`,
        category: aug.type || 'Chassis Cyberware',
        source: 'Augmentation',
        description: aug.description || aug.desc || aug.summary || 'Cybernetic / synthetic enhancement installed.',
        subfeature: 'augmentations',
        aspectType: 'Installed Augmentation',
        tl: aug.tl || null,
        cost: aug.cost || null
      });
    });
    return list;
  }, [pillarTraitsData, awakenedDisciplines, invocationsList, augmentationsList]);

  const aspectCounts = useMemo(() => ({
    all: allAspects.length,
    traits: pillarTraitsData.totalTraitsCount,
    metaphysics: awakenedDisciplines.length + invocationsList.length,
    augmentations: augmentationsList.length
  }), [allAspects.length, pillarTraitsData.totalTraitsCount, awakenedDisciplines.length, invocationsList.length, augmentationsList.length]);

  const filteredAspects = useMemo(() => {
    return allAspects.filter(item => {
      if (aspectFilter !== 'all' && item.subfeature !== aspectFilter) {
        return false;
      }
      if (aspectSearchQuery) {
        const q = aspectSearchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesCategory = (item.category || '').toLowerCase().includes(q);
        const matchesSource = (item.source || '').toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesCategory || matchesSource;
      }
      return true;
    });
  }, [allAspects, aspectFilter, aspectSearchQuery]);

  // Property & Equipment Catalog Aggregation
  const getArray = useCallback((key, altKey) => {
    let val = characterData[key];
    if (!val && altKey) val = characterData[altKey];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [characterData]);

  const propertyCatalog = useMemo(() => {
    const rawCategories = [
      {
        id: 'weaponry',
        name: 'Weaponry',
        icon: '⚔️',
        color: 'amber',
        items: [...getArray('weapons', 'weaponry'), ...getArray('property-weaponry')]
      },
      {
        id: 'armoring',
        name: 'Armoring',
        icon: '🛡️',
        color: 'emerald',
        items: [...getArray('armoring', 'armor'), ...getArray('property-armoring')]
      },
      {
        id: 'gear',
        name: 'Gear & Equipment',
        icon: '🎒',
        color: 'cyan',
        items: [...getArray('gear', 'equipment'), ...getArray('property-gear')]
      },
      {
        id: 'mecha',
        name: 'Vehicles, Mechs & Drones',
        icon: '🤖',
        color: 'purple',
        items: [...getArray('mecha', 'mech'), ...getArray('property-mech')]
      },
      {
        id: 'architecture',
        name: 'Architecture & Real Estate',
        icon: '🏛️',
        color: 'blue',
        items: [...getArray('architecture', 'structures'), ...getArray('property-architecture')]
      },
      {
        id: 'other',
        name: 'Valuables & Misc',
        icon: '📦',
        color: 'slate',
        items: [...getArray('other', 'misc'), ...getArray('property-other')]
      }
    ];

    const categories = rawCategories.map(cat => {
      const seen = new Set();
      const cleanItems = [];
      cat.items.forEach((raw, idx) => {
        if (!raw) return;
        const itemObj = typeof raw === 'object' ? raw : { name: String(raw) };
        const name = itemObj.name || itemObj.title || itemObj.label || `Item #${idx + 1}`;
        const key = `${name.toLowerCase()}_${itemObj.id || idx}`;
        if (!seen.has(key)) {
          seen.add(key);
          cleanItems.push({
            id: itemObj.id || `prop_${cat.id}_${idx}`,
            name,
            qty: parseInt(itemObj.qty ?? itemObj.quantity ?? 1, 10) || 1,
            weight: parseFloat(itemObj.weight ?? itemObj.wt ?? itemObj.mass ?? 0) || 0,
            tl: itemObj.tl || itemObj.techLevel || null,
            cost: itemObj.cost || itemObj.price || null,
            category: cat.name,
            categoryId: cat.id,
            damage: itemObj.damage || itemObj.damageExpr || null,
            attackMod: parseInt(itemObj.attackMod || itemObj.mod || 0, 10),
            armorDr: itemObj.armor || itemObj.dr || itemObj.defense || null,
            range: itemObj.range || null,
            desc: itemObj.description || itemObj.desc || itemObj.effect || itemObj.summary || '',
            properties: itemObj.properties || itemObj.tags || []
          });
        }
      });
      return {
        ...cat,
        items: cleanItems
      };
    }).filter(cat => cat.items.length > 0);

    const allItems = categories.flatMap(c => c.items);
    return {
      categories,
      allItems
    };
  }, [getArray]);

  // Carried weight vs capacity
  const carriedWeight = useMemo(() => {
    const portableCats = ['weaponry', 'armoring', 'gear', 'other'];
    return Math.round(
      propertyCatalog.categories
        .filter(c => portableCats.includes(c.id))
        .flatMap(c => c.items)
        .reduce((sum, item) => sum + (item.weight * item.qty), 0) * 10
    ) / 10;
  }, [propertyCatalog]);

  const baseMaxCapacity = (Math.max(0, attrStr) + 2) * 50;
  const maxCapacity = scaleCarryingCapacity(baseMaxCapacity, sizeKey);
  const lightCapacity = Math.round(maxCapacity * 0.5);
  const isOverburdened = carriedWeight > maxCapacity;
  const isEncumbered = carriedWeight > lightCapacity && !isOverburdened;

  // Collapsible category toggles
  const toggleCategory = useCallback((catId) => {
    setOpenCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  }, []);

  const toggleAllCategories = useCallback((expand) => {
    setOpenCategories(prev => {
      const next = { ...prev };
      propertyCatalog.categories.forEach(cat => {
        next[cat.id] = expand;
      });
      return next;
    });
  }, [propertyCatalog.categories]);

  // Horizontal Navigation Tabs (Aspects consolidates Traits, Metaphysics, and Augmentations)
  const sideTabs = useMemo(() => [
    { id: 'all', label: 'All Cockpit', icon: <Layers size={13} className="shrink-0" /> },
    { id: 'vitals', label: isSynthetic ? 'Structure & Rest' : 'Vitals & Rest', icon: isSynthetic ? <Cpu size={13} className="shrink-0" /> : <Heart size={13} className="shrink-0" /> },
    { id: 'combat', label: 'Combat', icon: <Crosshair size={13} className="shrink-0" />, badge: weaponsList.length },
    { id: 'aspects', label: 'Aspects', icon: <Sparkles size={13} className="shrink-0" />, badge: aspectCounts.all },
    { id: 'skills', label: 'Skills', icon: <Dices size={13} className="shrink-0" />, badge: trainedSkillsByGroup.reduce((acc, g) => acc + g.skills.length, 0) },
    { id: 'property', label: 'Property', icon: <Briefcase size={13} className="shrink-0" />, badge: propertyCatalog.allItems.length }
  ], [isSynthetic, weaponsList.length, aspectCounts.all, trainedSkillsByGroup, propertyCatalog.allItems.length]);

  // Handlers
  const handleApplyDamageSubmit = async () => {
    const amt = parseInt(damageInput, 10);
    if (!amt || amt <= 0) return;

    if (isSynthetic && (damageType === 'nonlethal')) {
      AudioService.playCombatHit(false);
      setTriageFeedback(`🤖 Chassis is IMMUNE to non-lethal fatigue damage! Suffered 0 SP loss.`);
      return;
    }

    const charId = characterData['character-doc-id'] || characterData.id;
    const res = await applyCharacterDamage(charId, {
      incomingDamage: amt,
      isNonLethal: damageType === 'nonlethal' || damageType === 'kinetic',
      isCritical: damageType === 'crit',
      isConcussive: damageType === 'concussive',
      isDirectHealth: damageType === 'direct_health',
      isDirectVitality: damageType === 'direct_vit',
      attemptedReduction: applyToughnessSoak
    });

    AudioService.playCombatHit(damageType === 'crit');
    if (res) {
      setLocalVitalsOverride(prev => ({
        ...prev,
        current_vitality: isSynthetic ? prev.current_vitality : res.newVitality,
        current_health: isSynthetic ? prev.current_health : res.newHealth,
        current_structure: isSynthetic ? res.newStructure : prev.current_structure,
        is_at_deaths_door: res.atDeathsDoor,
        death_clock: res.deathClock,
        is_dead: res.dead,
        is_comatose: res.comatose,
        is_stabilized: res.atDeathsDoor ? false : prev.is_stabilized
      }));
      if (isSynthetic) {
        setTriageFeedback(`Chassis suffered ${amt} ${damageType} damage: -${res.structureDamage || res.netDamage || amt} SP. (Structure: ${res.newStructure}/${maxStructure} SP).`);
      } else {
        const vDmg = res.vitalityDamage !== undefined ? res.vitalityDamage : Math.max(0, curVitality - res.newVitality);
        const hDmg = res.healthDamage !== undefined ? res.healthDamage : Math.max(0, curHealth - res.newHealth);
        const soaked = res.damageAbsorbed || res.damageSoaked || 0;
        setTriageFeedback(`Suffered ${amt} ${damageType} damage: -${vDmg} VIT, -${hDmg} HP.${soaked > 0 ? ` (Soaked ${soaked} DR).` : ''}`);
      }
    }
  };

  const handleApplyHealSubmit = async () => {
    const pts = parseInt(healInput, 10);
    if (!pts || pts <= 0) return;
    const charId = characterData['character-doc-id'] || characterData.id;

    if (isSynthetic) {
      const nextStruct = Math.min(maxStructure, (curStructure || 0) + pts);
      if (updateCharacterStructure) await updateCharacterStructure(charId, nextStruct);
      setLocalVitalsOverride(prev => ({
        ...prev,
        current_structure: nextStruct,
        is_dead: nextStruct > 0 ? false : prev.is_dead,
        is_at_deaths_door: nextStruct > 0 ? false : prev.is_at_deaths_door,
        is_stabilized: nextStruct > 0 ? false : prev.is_stabilized,
        death_clock: nextStruct > 0 ? null : prev.death_clock
      }));
      setTriageFeedback(`Repaired +${pts} Chassis Structure (${nextStruct}/${maxStructure} SP)`);
      AudioService.playPointSpendSound();
      toast({
        type: 'success',
        title: 'Chassis Repaired',
        message: `+${pts} SP restored (${nextStruct}/${maxStructure} SP).`
      });
      return;
    }

    // Biological targets
    let nextHp = curHealth || 0;
    let nextVit = curVitality || 0;
    let hpHealed = 0;
    let vitHealed = 0;

    if (healTarget === 'smart') {
      const hpDeficit = Math.max(0, maxHealth - nextHp);
      hpHealed = Math.min(hpDeficit, pts);
      nextHp += hpHealed;
      const rem = pts - hpHealed;
      if (rem > 0) {
        const vitDeficit = Math.max(0, maxVitality - nextVit);
        vitHealed = Math.min(vitDeficit, rem);
        nextVit += vitHealed;
      }
    } else if (healTarget === 'health') {
      const hpDeficit = Math.max(0, maxHealth - nextHp);
      hpHealed = Math.min(hpDeficit, pts);
      nextHp += hpHealed;
    } else if (healTarget === 'vitality') {
      const vitDeficit = Math.max(0, maxVitality - nextVit);
      vitHealed = Math.min(vitDeficit, pts);
      nextVit += vitHealed;
    }

    if (hpHealed > 0 && updateCharacterHealth) {
      await updateCharacterHealth(charId, nextHp);
    }
    if (vitHealed > 0 && updateCharacterVitality) {
      await updateCharacterVitality(charId, nextVit);
    }

    const isNowConscious = nextHp > 0;
    setLocalVitalsOverride(prev => ({
      ...prev,
      current_health: nextHp,
      current_vitality: nextVit,
      is_dead: isNowConscious ? false : prev.is_dead,
      is_at_deaths_door: isNowConscious ? false : prev.is_at_deaths_door,
      is_stabilized: isNowConscious ? false : prev.is_stabilized,
      death_clock: isNowConscious ? null : prev.death_clock
    }));

    const details = [];
    if (hpHealed > 0) details.push(`+${hpHealed} HP`);
    if (vitHealed > 0) details.push(`+${vitHealed} VIT`);
    setTriageFeedback(`Field Healing applied: ${details.join(', ') || '0'} (Health: ${nextHp}/${maxHealth}, Vitality: ${nextVit}/${maxVitality})`);
    AudioService.playPointSpendSound();
    toast({
      type: 'success',
      title: 'Healing Applied',
      message: `${details.join(' & ') || '0 healed'}. Operative vitals updated.`
    });
  };

  const handleFullRestore = async () => {
    const charId = characterData['character-doc-id'] || characterData.id;

    if (isSynthetic) {
      if (updateCharacterStructure) await updateCharacterStructure(charId, maxStructure);
      setLocalVitalsOverride(prev => ({
        ...prev,
        current_structure: maxStructure,
        is_dead: false,
        is_at_deaths_door: false,
        is_stabilized: false,
        death_clock: null
      }));
      setTriageFeedback(`Full Chassis Restoration: 100% Structure restored (${maxStructure}/${maxStructure} SP).`);
    } else {
      if (updateCharacterHealth) await updateCharacterHealth(charId, maxHealth);
      if (updateCharacterVitality) await updateCharacterVitality(charId, maxVitality);
      setLocalVitalsOverride(prev => ({
        ...prev,
        current_health: maxHealth,
        current_vitality: maxVitality,
        is_dead: false,
        is_at_deaths_door: false,
        is_stabilized: false,
        death_clock: null
      }));
      setTriageFeedback(`Full Vitals Restored: 100% Health (${maxHealth}/${maxHealth}) & Vitality (${maxVitality}/${maxVitality}).`);
    }

    AudioService.playCriticalChime(true);
    toast({
      type: 'success',
      title: isSynthetic ? 'Chassis Fully Restored' : 'Vitals Fully Restored',
      message: 'All vital tracks replenished to maximum.'
    });
  };

  const handleQuickHeal = (amount, target = 'vitality') => {
    const pts = parseInt(amount, 10);
    if (!pts || pts <= 0) return;
    const charId = characterData['character-doc-id'] || characterData.id;

    if (isSynthetic) {
      const next = Math.min(maxStructure, (curStructure || 0) + pts);
      if (updateCharacterStructure) updateCharacterStructure(charId, next);
      if (next > 0) {
        setLocalVitalsOverride(prev => ({
          ...prev,
          current_structure: next,
          is_dead: false,
          is_at_deaths_door: false,
          is_stabilized: false,
          death_clock: null
        }));
      }
      setTriageFeedback(`Repaired +${pts} Structure (${next}/${maxStructure} SP)`);
    } else {
      if (target === 'vitality') {
        const next = Math.min(maxVitality, (curVitality || 0) + pts);
        if (updateCharacterVitality) updateCharacterVitality(charId, next);
        setLocalVitalsOverride(prev => ({
          ...prev,
          current_vitality: next
        }));
        setTriageFeedback(`Healed +${pts} Vitality (${next}/${maxVitality})`);
      } else {
        const next = Math.min(maxHealth, (curHealth || 0) + pts);
        if (updateCharacterHealth) updateCharacterHealth(charId, next);
        if (next > 0) {
          setLocalVitalsOverride(prev => ({
            ...prev,
            current_health: next,
            is_dead: false,
            is_at_deaths_door: false,
            is_stabilized: false,
            death_clock: null
          }));
        }
        setTriageFeedback(`Healed +${pts} Health (${next}/${maxHealth})`);
      }
    }
    AudioService.playPointSpendSound();
  };

  const handleStabilizeOperative = async () => {
    const charId = characterData['character-doc-id'] || characterData.id;

    // Instant optimistic UI update
    setLocalVitalsOverride(prev => ({
      ...prev,
      is_stabilized: true,
      is_at_deaths_door: false,
      is_comatose: false,
      death_clock: null
    }));

    if (stabilizeCharacter) {
      await stabilizeCharacter(charId, { hasHealingEffect: true, isMedicineSuccess: true, force: true });
    }

    AudioService.playCriticalChime(true);
    toast({
      type: 'success',
      title: isSynthetic ? 'Unit Stabilized' : 'Operative Stabilized',
      message: isSynthetic 
        ? 'Emergency stabilization successful. Chassis shutdown stabilized.' 
        : 'Operative successfully stabilized. Death clock halted.'
    });
  };

  const handleAdvanceDeathTurn = async () => {
    const charId = characterData['character-doc-id'] || characterData.id;
    const currentClock = characterData.death_clock !== undefined && characterData.death_clock !== null 
      ? Number(characterData.death_clock) 
      : Math.max(1, attrSta);
    const nextClock = Math.max(0, currentClock - 1);
    const willDie = nextClock <= 0;

    // Instant optimistic UI update
    setLocalVitalsOverride(prev => ({
      ...prev,
      death_clock: nextClock,
      is_dead: willDie,
      is_at_deaths_door: !willDie
    }));

    if (advanceCharacterDeathTurn) {
      await advanceCharacterDeathTurn(charId);
    }

    if (willDie) {
      AudioService.playCriticalChime(false);
      toast({
        type: 'danger',
        title: isSynthetic ? 'Unit Destroyed' : 'Operative Perished',
        message: 'Death clock reached 0 rounds. Operative has succumbed to trauma.'
      });
    } else {
      AudioService.playDiceRollSound();
      toast({
        type: 'warning',
        title: 'Turn Advanced',
        message: `Death clock advanced by 1 turn. ${nextClock} round${nextClock === 1 ? '' : 's'} remaining.`
      });
    }
  };

  const handleRevivifyOperative = async () => {
    const charId = characterData['character-doc-id'] || characterData.id;

    // Instant optimistic UI update
    setLocalVitalsOverride(prev => ({
      ...prev,
      is_dead: false,
      is_at_deaths_door: false,
      is_stabilized: true,
      death_clock: null,
      current_health: isSynthetic ? 0 : 1,
      current_structure: isSynthetic ? 1 : prev.current_structure
    }));

    if (revivifyCharacter) {
      await revivifyCharacter(charId, { revivedHealth: 1 });
    }

    AudioService.playCriticalChime(true);
    toast({
      type: 'success',
      title: isSynthetic ? 'Chassis Reconstructed' : 'Operative Revivified',
      message: 'Operative revived with 1 HP. Note: The High Cost of Dying rules apply (-5 AP Debt).'
    });
  };

  const handleExecuteRest = async (type = 'light') => {
    const charId = characterData['character-doc-id'] || characterData.id;
    if (type === 'light' && lightRestsToday >= maxLightRests) {
      toast({ type: 'warning', text: "Exceeded maximum Light Rests (4/day). Operative requires a Full Rest to recharge." });
      return;
    }

    if (type === 'light' && isMinimalRestSpecies) {
      // Minimal Rest species (Synthetic, Fae, Insect) gain Full Rest recovery from a Light Rest!
      if (isSynthetic) {
        if (updateCharacterStructure) updateCharacterStructure(charId, maxStructure);
      } else {
        if (updateCharacterVitality) updateCharacterVitality(charId, maxVitality);
      }
      const nextRests = Math.min(maxLightRests, lightRestsToday + 1);
      if (folio.setCharacterData) {
        folio.setCharacterData(prev => ({ ...prev, light_rests_today: nextRests }));
      }
      AudioService.playCriticalChime(true);
      setTriageFeedback(`⚡ Minimal Rest Profile (${speciesRestProfile.subType}): Diagnostic Light Rest completed! Vitals restored to 100% (+full recovery). Used ${nextRests}/${maxLightRests} daily cycles.`);
      return;
    }

    const res = await takeCharacterRest(charId, { restType: type });
    if (res?.success) {
      AudioService.playCriticalChime(true);
      if (type === 'full') {
        if (isSynthetic && updateCharacterStructure) updateCharacterStructure(charId, maxStructure);
        setTriageFeedback(`${isSynthetic ? 'Full Shipyard Overhaul' : 'Full Rest'} (6–8h) completed. 100% Vitals & Essence restored, Exhaustion cleared, daily rest cycles reset to 0.`);
      } else {
        setTriageFeedback(`${isSynthetic ? 'Quick diagnostic cycle' : 'Light Rest'} completed (+${res.vitalityRecovered || 5} recovery, +${keyAbilityMod} Essence). Used ${res.newLightRestsToday}/${maxLightRests} daily cycles.`);
      }
    }
  };

  const handleSecondWind = async () => {
    const charId = characterData['character-doc-id'] || characterData.id;
    if (curKarma < 1) {
      toast({ type: 'warning', text: "Insufficient Karma Points. Second Wind requires 1 Karma Point." });
      return;
    }

    // Spend 1 Karma
    if (spendKarma) {
      await spendKarma(charId, 1, 'Second Wind');
    } else if (updateCharacterKarma) {
      await updateCharacterKarma(charId, curKarma - 1);
    }

    // Execute instant recovery without downtime
    if (isSynthetic) {
      const missingSP = Math.max(0, maxStructure - (curStructure || 0));
      const recoveryAmt = Math.max(10, Math.ceil(maxStructure * 0.5));
      const nextSP = Math.min(maxStructure, (curStructure || 0) + recoveryAmt);
      if (updateCharacterStructure) updateCharacterStructure(charId, nextSP);
      setTriageFeedback(`⚡ Second Wind (1 Karma spent): 1 min internal focus restored +${nextSP - curStructure} SP (${nextSP}/${maxStructure} SP) with 0 downtime.`);
    } else {
      const missingVit = Math.max(0, maxVitality - (curVitality || 0));
      const recoveryAmt = Math.max(10, Math.ceil(maxVitality * 0.5));
      const nextVit = Math.min(maxVitality, (curVitality || 0) + recoveryAmt);
      if (updateCharacterVitality) updateCharacterVitality(charId, nextVit);
      setTriageFeedback(`⚡ Second Wind (1 Karma spent): 1 min internal focus recovered +${nextVit - curVitality} Vitality (${nextVit}/${maxVitality}) with 0 downtime.`);
    }
    AudioService.playCriticalChime(true);
  };

  // Unified Interactive Dice Rolling Pipeline
  const handleExecuteTacticalRoll = useCallback((label, modifier, customExpression = null) => {
    const charName = characterData['char-name'] || characterData.name || 'Operative';
    const modNum = parseInt(modifier, 10) || 0;
    const expr = customExpression || `2d10${modNum !== 0 ? (modNum > 0 ? `+${modNum}` : `${modNum}`) : ''}`;

    const result = rollDice(expr, { characterName: charName, label: label });

    AudioService.playDiceRollSound();
    if (result.isCritSuccess) AudioService.playCriticalChime(true);
    if (result.isCritFail) AudioService.playCriticalChime(false);

    setLatestTacticalRoll({
      label,
      total: result.total,
      expression: expr,
      rolls: result.rolls,
      modifier: modNum,
      isCrit: result.isCritSuccess,
      isFumble: result.isCritFail,
      timestamp: Date.now()
    });

    if (label.includes('Damage')) {
      setLatestDamageResult({
        weaponName: label.replace(' Damage', ''),
        expression: expr,
        total: result.total,
        rolls: result.rolls
      });
    }

    if (openDiceRoller) {
      openDiceRoller({
        label,
        baseModifier: modNum,
        expression: expr,
        rollMode: 'normal',
        characterName: charName,
        personaId: characterData['character-doc-id'] || characterData.id,
        autoRoll: false
      });
    }

    window.dispatchEvent(new CustomEvent('vtt-trigger-floating-text', {
      detail: {
        text: `${charName}: ${label} [${result.total}]`,
        type: result.isCritSuccess ? 'critical' : result.isCritFail ? 'crit_fail' : 'damage'
      }
    }));

    window.dispatchEvent(new CustomEvent('vtt-tactical-roll', {
      detail: {
        characterName: charName,
        label,
        total: result.total,
        expression: expr,
        rolls: result.rolls,
        isCrit: result.isCritSuccess,
        isFumble: result.isCritFail
      }
    }));
  }, [characterData, openDiceRoller]);

  const handleRollCheck = (label, modifier) => {
    handleExecuteTacticalRoll(label, modifier);
  };

  const handleRollWeaponDamage = (weapon) => {
    const rawExpr = weapon.damage || '1d10';
    const expr = sanitizeDiceExpression(rawExpr);
    handleExecuteTacticalRoll(`${weapon.name} Damage`, 0, expr);
  };

  return (
    <div className={`space-y-4 font-sans select-none ${isModal ? 'p-1' : 'pb-20'}`}>
      {/* 1. Tactical Cockpit Header Banner */}
      <div className="bg-slate-900/90 border border-cyan-500/50 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-300 shadow-md shrink-0">
            {isSynthetic ? <Cpu size={22} className="text-amber-400 animate-pulse" /> : <Crosshair size={22} className="text-cyan-400 animate-pulse" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold font-mono uppercase text-white tracking-wide truncate">
                {characterData['char-name'] || 'UNNAMED OPERATIVE'}
              </h2>
              {isSynthetic ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950/80 border border-amber-500/60 text-amber-300 flex items-center gap-1">
                  <Cpu size={10} /> SYNTHETIC CHASSIS
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 flex items-center gap-1">
                  <Heart size={10} /> BIOLOGICAL
                </span>
              )}
              {isDead ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950 border border-red-500 text-red-300 flex items-center gap-1 animate-pulse">
                  <Skull size={11} /> {isSynthetic ? 'DESTROYED' : 'DECEASED'}
                </span>
              ) : atDeathsDoor ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 border border-amber-500 text-amber-300 flex items-center gap-1 animate-pulse">
                  <AlertTriangle size={11} /> {isSynthetic ? 'CHASSIS FAILING' : `DEATH'S DOOR (${deathClockRounds} ROUNDS)`}
                </span>
              ) : isStabilized ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center gap-1">
                  <ShieldCheck size={11} /> {isSynthetic ? 'CHASSIS STABILIZED' : 'STABILIZED (UNCONSCIOUS)'}
                </span>
              ) : isIncapacitated ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-950 border border-rose-500 text-rose-300 flex items-center gap-1">
                  <AlertTriangle size={11} /> INCAPACITATED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 border border-cyan-500/80 text-cyan-300 flex items-center gap-1">
                  <CheckCircle2 size={11} /> COMBAT ACTIVE
                </span>
              )}
              {isPreview && (
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 flex items-center gap-1 shadow-sm"
                  title="Live tactical sheet for VTT engagement and action checks."
                >
                  <Crosshair size={10} className="text-cyan-400" /> LIVE TACTICAL
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <p className="text-xs text-slate-400 font-mono truncate">
                {characterData['char-species'] || 'Human'} • {characterData['char-archetype'] || 'Operative'} • {characterData['char-occu'] || 'Freelancer'}
              </p>
              {isPreview && (
                <span className="hidden sm:inline text-[10.5px] font-mono text-cyan-400/80">
                  &bull; Live Tactical Sheet (VTT Ready)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Builder Switcher / Close / Lock Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
          <FolioTooltip
            title="Tangent SF RP Combat Rules"
            badge="Core 2d10 Mechanics"
            badgeColor="cyan"
            maxWidth={380}
            formula="Check / Attack = 2d10 + Ability Mod + Skill vs Target Defense Score"
            rules={[
              "Critical Hit: Dual 10s on 2d10 is treated as 30 (+10 bonus over max 20).",
              "Critical Failure (Fumble): Dual 1s on 2d10 is treated as -10.",
              "Advantage / Disadvantage: Roll two pairs of 2d10, take higher (Adv) or lower (Disadv). Cancels if both apply.",
              "Defender Wins Ties: In all active opposed defense checks, defender wins all ties!",
              "Biological Vitals: Damage depletes Vitality (stamina/shields) first, then Health (fatal flesh wounds).",
              "Synthetic Vitals: Synthetic chassis uses Structure Points (SP) exclusively. Immune to non-lethal damage."
            ]}
            tags={['2d10 Base', 'Crits = 30', 'Fumbles = -10', 'Defender Wins Ties', 'Dynamic Triage']}
            notes="Base Defense Score = 10 + Agility + Defense Rank + Modifiers. Reaction slots include Dodge (Evasion), Parry (Weapon Block), and Block (Shield). Physical Armor and Energy Shields mitigate damage before vitals attrition."
          >
            <button
              type="button"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="View Core 2d10 Rules Reference"
            >
              <BookOpen size={12} className="text-cyan-400" />
              <span>Rules Ref</span>
            </button>
          </FolioTooltip>

          <div className="hidden md:flex items-center gap-2">
            {isPreview && (
              <button
                type="button"
                onClick={() => {
                  if (onLockSheet) onLockSheet();
                  else if (lockPersona) lockPersona();
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-800 text-cyan-300 border border-cyan-500/60 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md hover:shadow-cyan-500/30 active:scale-95"
                title="Lock & Set this Persona for VTT Play"
              >
                <Lock size={12} className="text-cyan-400" />
                <span>Lock for VTT</span>
              </button>
            )}

            {onSwitchToBuilder && (
              <button
                type="button"
                onClick={onSwitchToBuilder}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                title="Switch to Builder Mode"
              >
                <span>🛠️ Builder</span>
              </button>
            )}

            {!isPreview && isLocked && unlockPersona && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.03);
                  if (unlockPersona) unlockPersona();
                  if (onSwitchToBuilder) onSwitchToBuilder();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                title="Unlock persona back to development phase"
              >
                <Unlock size={12} className="text-amber-400" />
                <span>Unlock</span>
              </button>
            )}
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Tactical Play Cockpit (ESC)"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Live Tactical Roll HUD Result Banner */}
      {latestTacticalRoll && (
        <div className={`p-2.5 px-4 rounded-xl border flex items-center justify-between gap-2 backdrop-blur-md shadow-lg transition-all animate-in fade-in duration-200 ${
          latestTacticalRoll.isCrit 
            ? 'bg-amber-950/80 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
            : latestTacticalRoll.isFumble 
            ? 'bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
            : 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200'
        }`}>
          <div className="flex items-center gap-2 text-xs font-mono min-w-0">
            <Dices size={16} className={latestTacticalRoll.isCrit ? 'text-amber-400 animate-spin shrink-0' : 'text-cyan-400 shrink-0'} />
            <div className="truncate">
              <span className="font-bold text-slate-100">{latestTacticalRoll.label}:</span>{' '}
              <span className="text-white font-bold text-sm bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 ml-1">
                {latestTacticalRoll.total}
              </span>{' '}
              <span className="text-slate-400 text-[11px] ml-1">
                ({latestTacticalRoll.expression} &bull; Rolls: [{latestTacticalRoll.rolls?.map(r => r.value ?? r).join(', ')}])
              </span>
            </div>
            {latestTacticalRoll.isCrit && (
              <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[9.5px] font-bold uppercase tracking-wider shrink-0 shadow">
                CRITICAL SUCCESS!
              </span>
            )}
            {latestTacticalRoll.isFumble && (
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9.5px] font-bold uppercase tracking-wider shrink-0 shadow">
                FUMBLE!
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setLatestTacticalRoll(null)}
            className="text-slate-400 hover:text-white text-xs font-bold leading-none p-1 shrink-0 cursor-pointer"
            title="Dismiss Roll Banner"
          >
            ×
          </button>
        </div>
      )}

      {/* 3. Emergency Triage Banner (When at Death's Door, Dead, or Stabilized at 0 HP) */}
      {(atDeathsDoor || isDead || isStabilized) && (
        isStabilized && !isDead ? (
          <div className="bg-emerald-950/90 border-2 border-emerald-500/80 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-200">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} className="text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-emerald-300">
                  LIFE STATUS: {isSynthetic ? 'CHASSIS STABILIZED (SHUTDOWN)' : 'OPERATIVE STABILIZED (COMATOSE)'}
                </div>
                <p className="text-xs text-emerald-300/80">
                  {isSynthetic 
                    ? 'Emergency repairs secured chassis integrity. Death clock halted. Apply repairs to restore online operations.' 
                    : 'Death clock has been halted. Operative remains unconscious at 0 HP. Apply medical healing or Rest to restore consciousness.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleQuickHeal(5, isSynthetic ? 'structure' : 'health')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold rounded uppercase cursor-pointer transition-colors shadow"
              >
                {isSynthetic ? '⚡ Emergency Repair (+5 SP)' : '💉 Administer Med (+5 HP)'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-red-950/90 border-2 border-red-500 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-red-200 animate-pulse">
            <div className="flex items-center gap-3">
              <Skull size={28} className="text-red-400 shrink-0" />
              <div>
                <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-red-300">
                  CRITICAL LIFE STATUS: {isDead ? (isSynthetic ? 'CHASSIS DESTROYED' : 'OPERATIVE PERISHED') : (isSynthetic ? 'CATASTROPHIC STRUCTURAL FAILURE' : `DEATH CLOCK RUNNING (${deathClockRounds} ROUNDS)`)}
                </div>
                <p className="text-xs text-red-300/80">
                  {isDead 
                    ? (isSynthetic ? 'Chassis suffered total mechanical failure. Requires shipyard reconstruction.' : 'Operative has succumbed to trauma. Requires high-tier medical resuscitation.')
                    : (isSynthetic ? 'Structural Integrity at 0. Unit requires immediate emergency repairs.' : 'Health and Vitality are both at 0. Operative must be stabilized before death clock expires.')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isDead ? (
                <>
                  <button
                    type="button"
                    onClick={handleStabilizeOperative}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold rounded uppercase cursor-pointer transition-colors shadow flex items-center gap-1.5"
                  >
                    <span>{isSynthetic ? '🔧 Emergency Stabilize' : '🩹 Stabilize Operative'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAdvanceDeathTurn}
                    className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white font-mono text-xs font-bold rounded uppercase cursor-pointer transition-colors shadow flex items-center gap-1.5"
                  >
                    <span>⏳ Advance Turn (-1)</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleRevivifyOperative}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded uppercase cursor-pointer transition-colors shadow flex items-center gap-1.5"
                >
                  <span>⚡ {isSynthetic ? 'Reconstruct Unit' : 'Revivify Operative'}</span>
                </button>
              )}
            </div>
          </div>
        )
      )}

      {/* 4. Main Body: Horizontal Navigation Tabs + 2-Column Responsive Cockpit */}
      <div className="space-y-4 w-full">
        {/* Horizontal Navigation Tabs (Grid layout to fit full width with no slider/scrollbar) */}
        <nav
          className="w-full bg-[#090e16]/95 border border-slate-800 rounded-xl p-1.5 shadow-lg"
          aria-label="Tactical Cockpit Navigation Tabs"
        >
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5 w-full">
            {sideTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    AudioService.playTerminalBeep(900, 0.02);
                  }}
                  className={`px-2 py-1.5 sm:py-2 rounded-lg font-mono text-[11px] sm:text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center border min-w-0 ${
                    isActive
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/70 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                      : 'bg-slate-950/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono shrink-0 ml-0.5 ${
                      isActive ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 5. Main Content Area */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* ========================================================
              LEFT COLUMN: Attributes, Aspects & Rest (Under Aspects)
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'vitals' || activeTab === 'aspects' || activeTab === 'features' || activeTab === 'metaphysics' || activeTab === 'augmentations') && (
            <div className={`${(activeTab === 'all' || activeTab === 'vitals') ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4`}>

              {/* Core Attributes & Secondary Checks Card */}
              {(activeTab === 'all' || activeTab === 'vitals') && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Dices size={15} className="text-cyan-400" />
                      <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                        Core Attributes &amp; Secondary Checks
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Saves &amp; Checks: 2d10 + Score
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attributeCheckPairs.map(pair => (
                      <div
                        key={pair.primaryKey}
                        className="p-2.5 rounded-lg bg-[#0d1117]/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between gap-2 shadow-sm group"
                      >
                        {/* Primary Attribute display */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {pair.primaryCode}
                            </span>
                            <span className="font-bold text-xs text-white truncate">
                              {pair.primaryName}
                            </span>
                          </div>

                          <span
                            className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono font-bold shrink-0 shadow-inner"
                            title={`Primary Attribute Score: ${pair.primaryName} (${pair.primaryScore >= 0 ? `+${pair.primaryScore}` : pair.primaryScore})`}
                          >
                            {pair.primaryScore >= 0 ? `+${pair.primaryScore}` : pair.primaryScore}
                          </span>
                        </div>

                        {/* Secondary Check / Save roll trigger */}
                        <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                                {pair.subCode}
                              </span>
                              <span className="text-xs font-mono font-bold text-amber-300 truncate">
                                {pair.subName}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-sans block truncate mt-0.5" title={pair.desc}>
                              {pair.role}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleExecuteTacticalRoll(`${pair.subName} (${pair.subCode}) Save/Check`, pair.subScore)}
                            className="px-2.5 py-1 rounded bg-amber-950/90 hover:bg-amber-800 border border-amber-500/70 hover:border-amber-400 text-amber-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md hover:shadow-amber-500/20 active:scale-95"
                            title={`Roll Secondary Check: 2d10 + ${pair.subScore}`}
                          >
                            <Dices size={12} className="text-amber-400" />
                            <span>+{pair.subScore}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================
                  ASPECTS (Features, Perks, Metaphysics, Augmentations)
                  Moved directly UNDER Attributes on Left Column!
                  No scrollbar - content flows naturally!
                  ======================================================== */}
              {(activeTab === 'all' || activeTab === 'aspects' || activeTab === 'features' || activeTab === 'metaphysics' || activeTab === 'augmentations') && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
                  {/* Aspects Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={15} className="text-amber-400" />
                      <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                        Aspects
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-bold">
                        {aspectCounts.all}
                      </span>
                    </div>

                    <div className="relative w-full sm:w-44">
                      <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Filter aspects..."
                        value={aspectSearchQuery}
                        onChange={(e) => setAspectSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs pl-7 pr-6 py-1 rounded text-slate-200 outline-none focus:border-cyan-500 font-mono"
                      />
                      {aspectSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setAspectSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subfeature Filter Pills (Traits, Metaphysics, Augmentations) */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAspectFilter('all')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        aspectFilter === 'all'
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({aspectCounts.all})
                    </button>
                    {aspectCounts.traits > 0 && (
                      <button
                        type="button"
                        onClick={() => setAspectFilter('traits')}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                          aspectFilter === 'traits'
                            ? 'bg-amber-950 border border-amber-500 text-amber-300'
                            : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Sparkles size={10} className="text-amber-400" />
                        <span>Traits ({aspectCounts.traits})</span>
                      </button>
                    )}
                    {aspectCounts.metaphysics > 0 && (
                      <button
                        type="button"
                        onClick={() => setAspectFilter('metaphysics')}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                          aspectFilter === 'metaphysics'
                            ? 'bg-purple-950 border border-purple-500 text-purple-300'
                            : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Flame size={10} className="text-purple-400" />
                        <span>Metaphysics ({aspectCounts.metaphysics})</span>
                      </button>
                    )}
                    {aspectCounts.augmentations > 0 && (
                      <button
                        type="button"
                        onClick={() => setAspectFilter('augmentations')}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                          aspectFilter === 'augmentations'
                            ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                            : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Zap size={10} className="text-cyan-400" />
                        <span>Augmentations ({aspectCounts.augmentations})</span>
                      </button>
                    )}
                  </div>

                  {/* Aspects List - Categorized by 4 Identity Pillars, Metaphysics, and Augmentations (No scrollbar) */}
                  {filteredAspects.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                      {aspectSearchQuery ? `No aspects matching "${aspectSearchQuery}".` : 'No aspects recorded in this category.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* 1. Identity Pillar Traits (Species, Occupation, Origin, Faction) */}
                      {(aspectFilter === 'all' || aspectFilter === 'traits') && pillarTraitsData.pillars.map(pillar => {
                        const matchingTraits = pillar.traits.filter(t => {
                          if (!aspectSearchQuery) return true;
                          const q = aspectSearchQuery.toLowerCase();
                          return t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q) || (t.source || '').toLowerCase().includes(q);
                        });

                        if (matchingTraits.length === 0) return null;

                        const grantedCount = matchingTraits.filter(t => t.isGranted).length;
                        const chosenCount = matchingTraits.filter(t => !t.isGranted).length;

                        return (
                          <div key={pillar.id} className="space-y-1.5">
                            {/* Pillar Header (Only displayed if pillar exists and has traits) */}
                            <div className="flex items-center justify-between px-2.5 py-1 bg-slate-950 border border-slate-800/80 rounded-lg">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">{pillar.icon}</span>
                                <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wide">
                                  {pillar.title}: <span className="text-amber-400 normal-case">{pillar.pillarName}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                                {grantedCount > 0 && (
                                  <span className="text-emerald-400 font-semibold">{grantedCount} Granted</span>
                                )}
                                {grantedCount > 0 && chosenCount > 0 && (
                                  <span className="text-slate-600">•</span>
                                )}
                                {chosenCount > 0 && (
                                  <span className="text-amber-400 font-semibold">{chosenCount} Chosen</span>
                                )}
                              </div>
                            </div>

                            {/* Traits inside this Pillar */}
                            <div className="space-y-1 pl-1">
                              {matchingTraits.map((trait) => (
                                <div
                                  key={`${pillar.id}_${trait.id || trait.name}`}
                                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FolioTooltip
                                      title={trait.name}
                                      badge={`${pillar.title} • ${trait.isGranted ? 'Granted Innate (0 CP)' : 'Chosen Trait (1 CP)'}`}
                                      badgeColor={trait.isGranted ? 'emerald' : 'amber'}
                                      description={trait.description || 'No description recorded.'}
                                      modifiers={trait.modifiers}
                                      rules={trait.rules}
                                      showInfoIcon={true}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0 cursor-pointer">
                                        <Sparkles size={12} className={trait.isGranted ? 'text-emerald-400 shrink-0' : 'text-amber-400 shrink-0'} />
                                        <span className={`text-xs font-mono font-bold truncate ${
                                          trait.isGranted ? 'text-emerald-200 hover:text-emerald-100' : 'text-amber-200 hover:text-amber-100'
                                        }`}>
                                          {trait.name}
                                        </span>
                                      </div>
                                    </FolioTooltip>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border ${
                                      trait.isGranted
                                        ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
                                        : 'bg-amber-950/80 border-amber-700/60 text-amber-300'
                                    }`}>
                                      {trait.isGranted ? '[Granted]' : '[Chosen]'}
                                    </span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                                      {trait.cp === 0 ? '0 CP' : '1 CP'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* General Features & Feats */}
                      {(aspectFilter === 'all' || aspectFilter === 'traits') && (() => {
                        const matchingGeneral = pillarTraitsData.generalList.filter(t => {
                          if (!aspectSearchQuery) return true;
                          const q = aspectSearchQuery.toLowerCase();
                          return t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q) || (t.source || '').toLowerCase().includes(q);
                        });

                        if (matchingGeneral.length === 0) return null;

                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-2.5 py-1 bg-slate-950 border border-slate-800/80 rounded-lg">
                              <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wide">
                                ⭐ General Features &amp; Perks ({matchingGeneral.length})
                              </span>
                            </div>
                            <div className="space-y-1 pl-1">
                              {matchingGeneral.map(feat => (
                                <div
                                  key={feat.id || feat.name}
                                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FolioTooltip
                                      title={feat.name}
                                      badge={`${feat.category} • ${feat.source}`}
                                      badgeColor="amber"
                                      description={feat.description || 'No description recorded.'}
                                      modifiers={feat.modifiers}
                                      rules={feat.rules}
                                      showInfoIcon={true}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0 cursor-pointer">
                                        <Sparkles size={12} className="text-amber-400 shrink-0" />
                                        <span className="text-xs font-mono font-bold truncate text-amber-200 hover:text-amber-100">
                                          {feat.name}
                                        </span>
                                      </div>
                                    </FolioTooltip>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                                      {feat.source}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 2. Metaphysics Subfeature (Disciplines & Invocations) */}
                      {(aspectFilter === 'all' || aspectFilter === 'metaphysics') && (awakenedDisciplines.length > 0 || invocationsList.length > 0) && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-2.5 py-1 bg-purple-950/50 border border-purple-800/60 rounded-lg">
                            <div className="flex items-center gap-1.5">
                              <Flame size={12} className="text-purple-400" />
                              <span className="text-[11px] font-mono font-bold text-purple-200 uppercase tracking-wide">
                                Metaphysics: Awakened Disciplines &amp; Invocations
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-purple-300">
                              {awakenedDisciplines.length + invocationsList.length} Total
                            </span>
                          </div>

                          <div className="space-y-1 pl-1">
                            {/* Awakened Disciplines */}
                            {awakenedDisciplines
                              .filter(awk => {
                                if (!aspectSearchQuery) return true;
                                const q = aspectSearchQuery.toLowerCase();
                                return (awk.name || '').toLowerCase().includes(q) || (awk.description || '').toLowerCase().includes(q);
                              })
                              .map((awk, idx) => (
                                <div
                                  key={`awk_${idx}`}
                                  className="p-2 rounded-lg bg-purple-950/20 border border-purple-900/60 hover:border-purple-500/50 transition-all flex items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Flame size={12} className="text-purple-400 shrink-0" />
                                    <span className="text-xs font-mono font-bold text-purple-200 truncate">
                                      {awk.name}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800/60 text-purple-400 uppercase">
                                    Awakened Domain
                                  </span>
                                </div>
                              ))}

                            {/* Learned Invocations */}
                            {invocationsList
                              .filter(inv => {
                                if (!aspectSearchQuery) return true;
                                const q = aspectSearchQuery.toLowerCase();
                                return inv.name.toLowerCase().includes(q) || (inv.desc || '').toLowerCase().includes(q) || inv.discipline.toLowerCase().includes(q);
                              })
                              .map((inv) => (
                                <div
                                  key={inv.id}
                                  className="p-2 rounded-lg bg-purple-950/20 border border-purple-900/60 hover:border-purple-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FolioTooltip
                                      title={inv.name}
                                      badge={`${inv.discipline} • Rank ${inv.rank}`}
                                      badgeColor="purple"
                                      description={inv.desc || `Rank ${inv.rank} invocation. Base target DC ${inv.baseDC}.`}
                                      showInfoIcon={true}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0 cursor-pointer">
                                        <Flame size={12} className="text-purple-400 shrink-0" />
                                        <span className="text-xs font-mono font-bold text-purple-200 hover:text-purple-100 truncate">
                                          {inv.name}
                                        </span>
                                      </div>
                                    </FolioTooltip>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                    <span className="text-[9px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                                      DC {inv.baseDC}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleExecuteTacticalRoll(`${inv.name} Invocation`, inv.total)}
                                      className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 border border-purple-600/70 text-purple-200 font-mono font-bold text-[10px] cursor-pointer transition-colors shadow flex items-center gap-1"
                                      title={`Roll Invocation Check: 2d10 + ${inv.total}`}
                                    >
                                      <Zap size={10} className="text-purple-400" />
                                      <span>Cast (+{inv.total})</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Augmentations Subfeature */}
                      {(aspectFilter === 'all' || aspectFilter === 'augmentations') && augmentationsList.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-2.5 py-1 bg-cyan-950/50 border border-cyan-800/60 rounded-lg">
                            <div className="flex items-center gap-1.5">
                              <Cpu size={12} className="text-cyan-400" />
                              <span className="text-[11px] font-mono font-bold text-cyan-200 uppercase tracking-wide">
                                Augmentations &amp; Cyberware
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-cyan-300">
                              {augmentationsList.length} Installed
                            </span>
                          </div>

                          <div className="space-y-1 pl-1">
                            {augmentationsList
                              .filter(aug => {
                                if (!aspectSearchQuery) return true;
                                const q = aspectSearchQuery.toLowerCase();
                                return (aug.name || '').toLowerCase().includes(q) || (aug.description || aug.desc || '').toLowerCase().includes(q);
                              })
                              .map((aug, idx) => (
                                <div
                                  key={aug.id || `aug_${idx}`}
                                  className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-900/60 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FolioTooltip
                                      title={aug.name}
                                      badge={aug.type || 'Chassis Cyberware'}
                                      badgeColor="cyan"
                                      description={aug.description || aug.desc || aug.summary || 'Cybernetic / synthetic enhancement installed.'}
                                      showInfoIcon={true}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0 cursor-pointer">
                                        <Cpu size={12} className="text-cyan-400 shrink-0" />
                                        <span className="text-xs font-mono font-bold text-cyan-200 hover:text-cyan-100 truncate">
                                          {aug.name}
                                        </span>
                                      </div>
                                    </FolioTooltip>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                    {aug.tl && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/50 text-cyan-300">
                                        TL {aug.tl}
                                      </span>
                                    )}
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                                      {aug.type || 'Installed'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Rest & Recovery Tracking (At bottom of Left Column) */}
              {(activeTab === 'all' || activeTab === 'vitals') && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-1">
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                      {isSynthetic ? <BatteryCharging size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
                      <span>{isSynthetic ? 'Maintenance & Diagnostic Cycles' : 'Rest & Recovery Economy'}</span>
                    </span>
                    <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded border font-bold ${
                      isMinimalRestSpecies 
                        ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300' 
                        : 'bg-indigo-950 border-indigo-500/60 text-indigo-300'
                    }`}>
                      {speciesRestProfile.badgeLabel}
                    </span>
                  </div>

                  {/* 1. Light Rest / Diagnostic Cycle */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-slate-200 font-bold truncate">
                        {isSynthetic ? 'Diagnostic Cycle (10 min)' : 'Light Rest (10 min - 1 hr)'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {isMinimalRestSpecies 
                          ? '⚡ Minimal Rest: Brief cycle restores 100% Vitals without sleep' 
                          : `Recovers Vitality stamina & +${keyAbilityMod} Essence (Removes Exhaustion)`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs text-amber-300 font-bold">
                        {lightRestsToday} / {maxLightRests}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleExecuteRest('light')}
                        disabled={lightRestsToday >= maxLightRests}
                        className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-800 disabled:opacity-40 border border-cyan-600/60 text-cyan-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow-sm"
                        title={isMinimalRestSpecies ? "Minimal Rest species: Light Rest provides Full Rest refresh benefits!" : "Perform Light Rest"}
                      >
                        {isSynthetic ? '⚡ Diagnostic' : '☕ Rest'}
                      </button>
                    </div>
                  </div>

                  {/* 2. Full Rest / Shipyard Overhaul */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-slate-200 font-bold truncate">
                        {isSynthetic ? 'Full Shipyard Overhaul (8 Hours)' : 'Full Rest (6–8 Hours Uninterrupted)'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Resets daily rest counters (0/4), restores 100% vitals &amp; essence, clears exhaustion
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExecuteRest('full')}
                      className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-800 border border-indigo-600/60 text-indigo-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shrink-0 shadow-sm"
                    >
                      💤 Full Rest
                    </button>
                  </div>

                  {/* 3. Second Wind (Karma Economy Integration) */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70 bg-amber-950/20 -mx-3 -mb-3 p-2.5 rounded-b-xl border-amber-900/30">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-amber-300 font-bold flex items-center gap-1">
                        <Zap size={12} className="text-amber-400" />
                        <span>Second Wind (Karma Action)</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        1 min focus restores 50% vitals with 0 downtime (replaces Light Rest)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSecondWind}
                      disabled={curKarma < 1}
                      className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 disabled:opacity-40 border border-amber-500/70 text-amber-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shrink-0 shadow-md flex items-center gap-1"
                      title={curKarma < 1 ? "Requires at least 1 Karma Point" : "Spend 1 Karma for instant recovery"}
                    >
                      <Sparkles size={11} className="text-amber-400" />
                      <span>1 Karma</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================
              RIGHT COLUMN: Top-Right Integrated Combat Console,
              Trained Skills, and Reworked Property Catalog
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'combat' || activeTab === 'weapons' || activeTab === 'skills' || activeTab === 'property' || activeTab === 'vitals') && (
            <div className={`${(activeTab === 'all' || activeTab === 'vitals') ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
              
              {/* ========================================================
                  TOP RIGHT: INTEGRATED COMBAT SECTION
                  (Includes Vitals & Damage Triage, Defenses, Arsenal)
                  ======================================================== */}
              {(activeTab === 'all' || activeTab === 'combat' || activeTab === 'weapons' || activeTab === 'vitals') && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-4 backdrop-blur-sm shadow-lg">
                  {/* Combat Section Top Title */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Crosshair size={16} className="text-cyan-400" />
                      <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                        Tactical Combat &amp; Triage Console
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Vitals &amp; Triage • Defenses • Arsenal
                    </span>
                  </div>

                  {/* 1. Consolidated Dual-Track Vitals & Damage Triage Terminal (AT TOP OF COMBAT GROUP) */}
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
                    {/* Block Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {isSynthetic ? (
                          <Cpu size={15} className="text-amber-400" />
                        ) : (
                          <Heart size={15} className="text-rose-400" />
                        )}
                        <h4 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                          {isSynthetic ? 'Chassis Integrity & Damage Triage' : 'Dual-Track Vitals & Damage Triage'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-slate-400 hidden sm:inline">
                          {isSynthetic ? 'Synthetic Chassis System' : 'Tangent Trauma System'}
                        </span>
                        {atDeathsDoor && (
                          <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500 text-red-300 font-bold uppercase animate-pulse">
                            ⚠️ Death's Door
                          </span>
                        )}
                        {isIncapacitated && !atDeathsDoor && (
                          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300 font-bold uppercase">
                            ⚡ Incapacitated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vitals Gauges with Live Damage Indicators & Previews */}
                    {isSynthetic ? (
                      /* SYNTHETIC: CHASSIS STRUCTURE BAR */
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-amber-400 font-bold flex items-center gap-1.5 min-w-0 truncate mr-2">
                            <Cpu size={12} className="shrink-0 text-amber-400" />
                            <span className="truncate">CHASSIS STRUCTURE (SP):</span>
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0 font-bold">
                            <span className="text-amber-300">
                              {curStructure} / {maxStructure} SP
                            </span>
                            {structDamageTaken > 0 && (
                              <span className="text-[10px] text-amber-400/90 font-mono font-bold">
                                (-{structDamageTaken} DMG)
                              </span>
                            )}
                            {previewDamage.structLoss > 0 && (
                              <span className="text-[10px] text-red-400 font-mono font-bold animate-pulse">
                                (-{previewDamage.structLoss} incoming{previewDamage.remainingStruct <= 0 ? ' • 0 SP!' : ` → ${previewDamage.remainingStruct}`})
                              </span>
                            )}
                            {previewHeal.structGain > 0 && (
                              <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                                (+{previewHeal.structGain} repair → {previewHeal.resultingStruct} SP)
                              </span>
                            )}
                            {previewDamage.immune && (
                              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                IMMUNE (0 SP)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full h-4 sm:h-4.5 bg-slate-950 rounded-full overflow-hidden border border-amber-900/60 p-0.5 relative shadow-inner flex">
                          <div className="absolute inset-0 bg-amber-950/20 pointer-events-none" />
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-l-full transition-all duration-300 relative z-10"
                            style={{ width: `${Math.min(100, Math.max(0, ((previewDamage.remainingStruct ?? curStructure) / (maxStructure || 1)) * 100))}%` }}
                          />
                          {previewDamage.structLoss > 0 && (
                            <div 
                              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-300 animate-pulse transition-all duration-300 relative z-10 border-l border-white/50"
                              style={{ width: `${Math.min(100, Math.max(0, (previewDamage.structLoss / (maxStructure || 1)) * 100))}%` }}
                              title={`-${previewDamage.structLoss} SP Incoming`}
                            />
                          )}
                          {previewHeal.structGain > 0 && (
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse transition-all duration-300 relative z-10 border-l border-white/50"
                              style={{ width: `${Math.min(100, Math.max(0, (previewHeal.structGain / (maxStructure || 1)) * 100))}%` }}
                              title={`+${previewHeal.structGain} SP Repaired`}
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          🤖 Synthetic entities absorb all damage directly into Chassis Structure. No flesh or biological fatigue.
                        </p>
                      </div>
                    ) : (
                      /* BIOLOGICAL: HEALTH & VITALITY DUAL TRACK WITH DAMAGE PREVIEW */
                      <div className="space-y-2.5">
                        {/* Health Bar (Rose) */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-rose-400 font-bold flex items-center gap-1.5 min-w-0 truncate mr-2">
                              <Heart size={12} className="shrink-0 text-rose-400" />
                              <span className="truncate">HEALTH <span className="text-[10px] text-rose-400/80 font-normal hidden sm:inline">(Meat / Trauma)</span>:</span>
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 font-bold">
                              <span className="text-slate-200">
                                {curHealth} / {maxHealth} HP
                              </span>
                              {hpDamageTaken > 0 && (
                                <span className="text-[10px] text-rose-400/90 font-mono font-bold">
                                  (-{hpDamageTaken} DMG)
                                </span>
                              )}
                              {previewDamage.hpLoss > 0 && (
                                <span className="text-[10px] text-amber-300 font-mono font-bold animate-pulse">
                                  (-{previewDamage.hpLoss} incoming{previewDamage.remainingHp <= 0 ? ' • 0 HP!' : ` → ${previewDamage.remainingHp}`})
                                </span>
                              )}
                              {previewHeal.hpGain > 0 && (
                                <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                                  (+{previewHeal.hpGain} heal → {previewHeal.resultingHp} HP)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full h-4 sm:h-4.5 bg-slate-950 rounded-full overflow-hidden border border-rose-900/60 p-0.5 relative shadow-inner flex">
                            <div className="absolute inset-0 bg-rose-950/20 pointer-events-none" />
                            <div 
                              className="h-full bg-gradient-to-r from-rose-800 via-rose-600 to-rose-500 rounded-l-full transition-all duration-300 relative z-10"
                              style={{ width: `${Math.min(100, Math.max(0, ((previewDamage.remainingHp ?? curHealth) / (maxHealth || 1)) * 100))}%` }}
                            />
                            {previewDamage.hpLoss > 0 && (
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 animate-pulse transition-all duration-300 relative z-10 border-l border-white/50"
                                style={{ width: `${Math.min(100, Math.max(0, (previewDamage.hpLoss / (maxHealth || 1)) * 100))}%` }}
                                title={`-${previewDamage.hpLoss} HP Incoming`}
                              />
                            )}
                            {previewHeal.hpGain > 0 && (
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 animate-pulse transition-all duration-300 relative z-10 border-l border-white/50"
                                style={{ width: `${Math.min(100, Math.max(0, (previewHeal.hpGain / (maxHealth || 1)) * 100))}%` }}
                                title={`+${previewHeal.hpGain} HP Healed`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Vitality Bar (Teal) */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-teal-400 font-bold flex items-center gap-1.5 min-w-0 truncate mr-2">
                              <Activity size={12} className="shrink-0 text-teal-400" />
                              <span className="truncate">VITALITY <span className="text-[10px] text-teal-400/80 font-normal hidden sm:inline">(Stamina / Energy)</span>:</span>
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 font-bold">
                              <span className="text-slate-200">
                                {curVitality} / {maxVitality} VIT
                              </span>
                              {vitDamageTaken > 0 && (
                                <span className="text-[10px] text-teal-400/90 font-mono font-bold">
                                  (-{vitDamageTaken} DMG)
                                </span>
                              )}
                              {previewDamage.vitLoss > 0 && (
                                <span className="text-[10px] text-amber-300 font-mono font-bold animate-pulse">
                                  (-{previewDamage.vitLoss} incoming{previewDamage.remainingVit <= 0 ? ' • 0 VIT!' : ` → ${previewDamage.remainingVit}`})
                                </span>
                              )}
                              {previewHeal.vitGain > 0 && (
                                <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                                  (+{previewHeal.vitGain} heal → {previewHeal.resultingVit} VIT)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full h-4 sm:h-4.5 bg-slate-950 rounded-full overflow-hidden border border-teal-900/70 p-0.5 relative shadow-inner flex">
                            <div className="absolute inset-0 bg-teal-950/20 pointer-events-none" />
                            <div 
                              className="h-full bg-gradient-to-r from-[#0d5c63] via-teal-700 to-teal-500 rounded-l-full transition-all duration-300 relative z-10"
                              style={{ width: `${Math.min(100, Math.max(0, ((previewDamage.remainingVit ?? curVitality) / (maxVitality || 1)) * 100))}%` }}
                            />
                            {previewDamage.vitLoss > 0 && (
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-teal-300 animate-pulse transition-all duration-300 relative z-10 border-l border-white/50"
                                style={{ width: `${Math.min(100, Math.max(0, (previewDamage.vitLoss / (maxVitality || 1)) * 100))}%` }}
                                title={`-${previewDamage.vitLoss} VIT Incoming`}
                              />
                            )}
                            {previewHeal.vitGain > 0 && (
                              <div 
                                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 animate-pulse transition-all duration-300 relative z-10 border-l border-white/50"
                                style={{ width: `${Math.min(100, Math.max(0, (previewHeal.vitGain / (maxVitality || 1)) * 100))}%` }}
                                title={`+${previewHeal.vitGain} VIT Recovered`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dual Console: Damage Console + Field Recovery Console */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                      {/* Left: Damage Console */}
                      <div className="bg-slate-900/80 border border-red-950/80 rounded-lg p-2.5 space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-red-950/60 pb-1">
                            <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                              <span>💥 Incoming Damage</span>
                            </span>
                            {damageInput && (
                              <button
                                type="button"
                                onClick={() => setDamageInput('')}
                                className="text-slate-500 hover:text-slate-300 text-[10px] font-mono cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                                Amount:
                              </label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 5"
                                value={damageInput}
                                onChange={(e) => setDamageInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-red-400 text-white font-mono font-bold text-sm px-2.5 py-1.5 rounded-md outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                                Type:
                              </label>
                              <select
                                value={damageType}
                                onChange={(e) => setDamageType(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-red-400 text-white font-mono text-xs px-2 py-1.5 rounded-md outline-none"
                              >
                                {isSynthetic ? (
                                  <>
                                    <option value="kinetic">Kinetic (SP)</option>
                                    <option value="energy">Energy (SP)</option>
                                    <option value="nonlethal">Non-Lethal (IMMUNE)</option>
                                    <option value="crit">Critical (2× SP)</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="kinetic">Kinetic (Vit → HP)</option>
                                    <option value="lethal">Lethal (HP → Vit)</option>
                                    <option value="direct_health">Direct Health</option>
                                    <option value="direct_vit">Direct Vitality</option>
                                    <option value="concussive">Concussive (50/50)</option>
                                    <option value="crit">Critical (2× Trauma)</option>
                                  </>
                                )}
                              </select>
                            </div>
                          </div>

                          {!isSynthetic && (
                            <label className="flex items-center gap-2 cursor-pointer text-[10.5px] font-mono text-slate-300 hover:text-slate-100 select-none pt-0.5">
                              <input
                                type="checkbox"
                                checked={applyToughnessSoak}
                                onChange={(e) => setApplyToughnessSoak(e.target.checked)}
                                className="rounded border-slate-700 bg-slate-950 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                              <span>
                                Apply Toughness Soak {effectiveToughness > 0 ? `(-${effectiveToughness} DR)` : '(0 DR)'}
                              </span>
                            </label>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleApplyDamageSubmit}
                          disabled={!damageInput || parseInt(damageInput, 10) <= 0}
                          className="w-full py-1.5 bg-red-950 hover:bg-red-800 disabled:opacity-40 border border-red-500/60 hover:border-red-400 text-red-200 rounded-md text-xs font-mono font-bold uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>💥 Apply Hit</span>
                          {previewDamage.netDamage > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/50 text-red-300 border border-red-500/30">
                              -{previewDamage.netDamage}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Right: Healing & Recovery Console */}
                      <div className="bg-slate-900/80 border border-emerald-950/80 rounded-lg p-2.5 space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-emerald-950/60 pb-1">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              <span>💚 Field Recovery &amp; Heal</span>
                            </span>
                            {healInput && (
                              <button
                                type="button"
                                onClick={() => setHealInput('')}
                                className="text-slate-500 hover:text-slate-300 text-[10px] font-mono cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                                Amount:
                              </label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 5"
                                value={healInput}
                                onChange={(e) => setHealInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white font-mono font-bold text-sm px-2.5 py-1.5 rounded-md outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                                Target:
                              </label>
                              <select
                                value={healTarget}
                                onChange={(e) => setHealTarget(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white font-mono text-xs px-2 py-1.5 rounded-md outline-none"
                              >
                                {isSynthetic ? (
                                  <option value="structure">Structure (SP)</option>
                                ) : (
                                  <>
                                    <option value="smart">Smart (HP ➔ VIT)</option>
                                    <option value="health">Health Only (HP)</option>
                                    <option value="vitality">Vitality Only (VIT)</option>
                                  </>
                                )}
                              </select>
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-slate-400 truncate pt-0.5">
                            {isSynthetic 
                              ? '🤖 Repairs chassis plates and structure.' 
                              : healTarget === 'smart' 
                                ? '🩹 Smart triage: closes meat trauma before refilling stamina.' 
                                : healTarget === 'health' 
                                  ? '🩸 Direct wound suture and meat healing.' 
                                  : '⚡ Stim breather recovering stamina only.'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={handleApplyHealSubmit}
                            disabled={!healInput || parseInt(healInput, 10) <= 0}
                            className="flex-1 py-1.5 bg-emerald-950 hover:bg-emerald-800 disabled:opacity-40 border border-emerald-500/60 hover:border-emerald-400 text-emerald-200 rounded-md text-xs font-mono font-bold uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>💚 Apply Heal</span>
                            {(previewHeal.hpGain + previewHeal.vitGain + previewHeal.structGain) > 0 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/50 text-emerald-300 border border-emerald-500/30">
                                +{previewHeal.hpGain + previewHeal.vitGain + previewHeal.structGain}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleFullRestore}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 rounded-md text-xs font-mono font-bold uppercase transition-all shadow-md cursor-pointer shrink-0"
                            title={isSynthetic ? "Fully restore Chassis Structure to 100%" : "Fully restore both Health and Vitality to 100%"}
                          >
                            ✨ Full Restore
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Triage Feedback */}
                    {triageFeedback && (
                      <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs font-mono animate-in fade-in duration-200 flex items-center justify-between">
                        <span>{triageFeedback}</span>
                        <button
                          type="button"
                          onClick={() => setTriageFeedback('')}
                          className="text-cyan-400 hover:text-cyan-200 text-[10px] underline cursor-pointer ml-2"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Tactical Defenses & Reaction Saves (Visible on combat/all tabs) */}
                  {(activeTab === 'all' || activeTab === 'combat' || activeTab === 'weapons') && (
                    <>
                      <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                        <Shield size={12} />
                        <span>Reaction Saves &amp; Defenses</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">2d10 + Modifier • Opposed Checks</span>
                    </div>

                    {/* Passive Baseline Defenses Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <FolioTooltip
                        title="Base Defense Score"
                        badge="Canonical Defense"
                        badgeColor="cyan"
                        description={`Base passive defense rating against incoming combat attacks.\nFormula: 10 + Agility (${attrAgi}) + Defense Skill Rank (${defRank})${sizeDefenseMod !== 0 ? ` + Size Mod (${sizeDefenseMod > 0 ? '+' : ''}${sizeDefenseMod})` : ''} = ${baseDefenseScore} DEF.`}
                        rules="Attacker must meet or exceed this score with their attack roll (2d10 + Attack Mod) to land a hit. In opposed active rolls, defender wins all ties."
                      >
                        <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/40 hover:border-cyan-400 text-center cursor-pointer transition-colors shadow-sm">
                          <span className="text-[9px] font-mono font-bold text-cyan-400/90 uppercase block">Base Defense</span>
                          <span className="text-sm font-mono font-bold text-cyan-300">{baseDefenseScore} DEF</span>
                        </div>
                      </FolioTooltip>

                      <div className="p-2 rounded-lg bg-slate-950 border border-yellow-500/30 text-center">
                        <span className="text-[9px] font-mono font-bold text-yellow-500/80 uppercase block">Physical Armor</span>
                        <span className="text-sm font-mono font-bold text-yellow-400">{physicalArmor} DR</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30 text-center">
                        <span className="text-[9px] font-mono font-bold text-purple-400 uppercase block">Energy Shield</span>
                        <span className="text-sm font-mono font-bold text-purple-300">{energyShield} SHD</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Karma Points</span>
                        <span className="text-sm font-mono font-bold text-emerald-300">{curKarma} / {maxKarma}</span>
                      </div>
                    </div>

                    {/* Dedicated Reaction Defense Slots: Dodge, Parry, Block */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck size={12} className="text-emerald-400" />
                          <span>Dedicated Reaction Slots (Active Defenses)</span>
                        </span>
                        <span className="text-[9px] font-mono text-amber-400/90 font-semibold">
                          ⚡ Defender Wins All Ties
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* 1. Dodge Slot */}
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between gap-1.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">🏃</span>
                              <span className="text-[11px] font-mono font-bold text-slate-200">Dodge</span>
                            </div>
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                              {dodgeScore} DEF
                            </span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
                            <span>Acrobatics Synergy:</span>
                            <span className="text-slate-300 font-semibold">{dodgeBonus >= 0 ? `+${dodgeBonus}` : dodgeBonus} Check</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleExecuteTacticalRoll('Active Dodge Reaction', dodgeBonus)}
                            className="w-full py-1 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 hover:border-cyan-400 text-cyan-200 rounded font-mono font-bold text-[10px] cursor-pointer transition-colors shadow flex items-center justify-center gap-1"
                            title="Roll Active Dodge: 2d10 + Agility + Defense Rank + Acrobatics Synergy"
                          >
                            <Zap size={10} className="text-cyan-400" />
                            <span>Roll Dodge (2d10{dodgeBonus >= 0 ? `+${dodgeBonus}` : dodgeBonus})</span>
                          </button>
                        </div>

                        {/* 2. Parry Slot */}
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-1.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Swords size={12} className="text-amber-400" />
                              <span className="text-[11px] font-mono font-bold text-slate-200">Parry</span>
                            </div>
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
                              {parryScore} DEF
                            </span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
                            <span>Melee Synergy:</span>
                            <span className="text-slate-300 font-semibold">{parryBonus >= 0 ? `+${parryBonus}` : parryBonus} Check</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleExecuteTacticalRoll('Active Parry Reaction', parryBonus)}
                            className="w-full py-1 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 hover:border-amber-400 text-amber-200 rounded font-mono font-bold text-[10px] cursor-pointer transition-colors shadow flex items-center justify-center gap-1"
                            title="Roll Active Parry: 2d10 + Agility/Strength + Defense Rank + Melee Synergy"
                          >
                            <Zap size={10} className="text-amber-400" />
                            <span>Roll Parry (2d10{parryBonus >= 0 ? `+${parryBonus}` : parryBonus})</span>
                          </button>
                        </div>

                        {/* 3. Block Slot */}
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-1.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <ShieldAlert size={12} className="text-emerald-400" />
                              <span className="text-[11px] font-mono font-bold text-slate-200">Block</span>
                            </div>
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                              {blockScore} DEF
                            </span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
                            <span>Shield Bonus:</span>
                            <span className="text-slate-300 font-semibold">+{shieldBonus} ({blockBonus >= 0 ? `+${blockBonus}` : blockBonus} Check)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleExecuteTacticalRoll('Active Shield Block Reaction', blockBonus)}
                            className="w-full py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 hover:border-emerald-400 text-emerald-200 rounded font-mono font-bold text-[10px] cursor-pointer transition-colors shadow flex items-center justify-center gap-1"
                            title="Roll Active Block: 2d10 + Agility + Defense Rank + Shield Item Bonus"
                          >
                            <Zap size={10} className="text-emerald-400" />
                            <span>Roll Block (2d10{blockBonus >= 0 ? `+${blockBonus}` : blockBonus})</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Opposed Defense Check Quick Roll */}
                    <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-cyan-400 shrink-0" />
                        <span className="text-[10px] font-mono text-slate-300">
                          Base Opposed Defense Check: <strong className="text-cyan-300">2d10{baseDefenseCheckMod >= 0 ? `+${baseDefenseCheckMod}` : baseDefenseCheckMod}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExecuteTacticalRoll('Base Opposed Defense Check', baseDefenseCheckMod)}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-cyan-200 font-mono font-bold text-[10px] cursor-pointer transition-colors shadow flex items-center gap-1 shrink-0"
                      >
                        <Zap size={10} className="text-cyan-400" />
                        <span>Roll Base Defense</span>
                      </button>
                    </div>

                    {/* 1-Click Reaction Save Buttons (Reflex, Fortitude, Willpower) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {reactionSaves.map(save => (
                        <button
                          key={save.name}
                          type="button"
                          onClick={() => handleRollCheck(save.name, save.bonus)}
                          className="p-2 rounded-lg bg-slate-950/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/60 transition-all flex flex-col justify-between text-left cursor-pointer group shadow-sm"
                          title={save.desc}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300">
                              {save.name}
                            </span>
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                              {save.bonus >= 0 ? `+${save.bonus}` : save.bonus}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 mt-1 line-clamp-1">
                            {save.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Tactical Arsenal & Strikes */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800 pt-2">
                      <h4 className="text-[10.5px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sword size={12} />
                        <span>Tactical Arsenal &amp; Strikes ({weaponsList.length})</span>
                      </h4>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setAttackCategoryFilter('all')}
                          className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            attackCategoryFilter === 'all'
                              ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                              : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          All ({attackCounts.all})
                        </button>
                        {attackCounts.weapon > 0 && (
                          <button
                            type="button"
                            onClick={() => setAttackCategoryFilter('weapon')}
                            className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                              attackCategoryFilter === 'weapon'
                                ? 'bg-amber-950 border border-amber-500 text-amber-300'
                                : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>⚔️ Weapons ({attackCounts.weapon})</span>
                          </button>
                        )}
                        {attackCounts.natural > 0 && (
                          <button
                            type="button"
                            onClick={() => setAttackCategoryFilter('natural')}
                            className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                              attackCategoryFilter === 'natural'
                                ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                                : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>🐾 Natural ({attackCounts.natural})</span>
                          </button>
                        )}
                        {attackCounts.metaphysics > 0 && (
                          <button
                            type="button"
                            onClick={() => setAttackCategoryFilter('metaphysics')}
                            className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                              attackCategoryFilter === 'metaphysics'
                                ? 'bg-purple-950 border border-purple-500 text-purple-300'
                                : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>🔮 Meta ({attackCounts.metaphysics})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Attacks List - NO SCROLLBAR */}
                    <div className="space-y-2">
                      {filteredAttacks.length === 0 ? (
                        <div className="p-3 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                          No offensive capabilities in the selected category.
                        </div>
                      ) : (
                        filteredAttacks.map(weapon => {
                          const isMeta = weapon.category === 'metaphysics';
                          const isNat = weapon.category === 'natural';

                          return (
                            <div
                              key={weapon.uid}
                              className={`p-2.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-colors ${
                                isMeta
                                  ? 'bg-purple-950/20 border-purple-900/60 hover:border-purple-500/50'
                                  : isNat
                                  ? 'bg-emerald-950/20 border-emerald-900/60 hover:border-emerald-500/50'
                                  : 'bg-slate-950/90 border-slate-800/90 hover:border-cyan-800/60'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-mono font-bold text-slate-200">
                                    {weapon.name}
                                  </span>

                                  {isMeta ? (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 border border-purple-700/60 text-purple-300 uppercase flex items-center gap-1">
                                      <Zap size={10} className="text-purple-400" />
                                      <span>METAPHYSICS{weapon.discipline ? ` • ${weapon.discipline}` : ''}</span>
                                    </span>
                                  ) : isNat ? (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 uppercase flex items-center gap-1">
                                      <span>🐾 NATURAL</span>
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 uppercase">
                                      {weapon.type || 'WEAPON'}
                                    </span>
                                  )}

                                  {weapon.range && (
                                    <span className="text-[9px] font-mono text-cyan-400">
                                      {weapon.range}
                                    </span>
                                  )}

                                  {weapon.baseDC && (
                                    <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-1 rounded border border-amber-800/50">
                                      Target DC {weapon.baseDC}
                                    </span>
                                  )}
                                </div>

                                <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                  <span>Base Damage: <strong className={isMeta ? 'text-purple-300' : isNat ? 'text-emerald-300' : 'text-amber-300'}>{weapon.damage}</strong></span>
                                  {weapon.notes && (
                                    <span className="text-slate-500 font-sans text-[10px] truncate max-w-xs sm:max-w-md" title={weapon.notes}>
                                      • {weapon.notes}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                {isMeta ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRollCheck(`${weapon.name} Invocation Check`, weapon.attackMod)}
                                    className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow flex items-center gap-1"
                                    title={`Roll 2d10 + Meta Check (${weapon.attackMod >= 0 ? `+${weapon.attackMod}` : weapon.attackMod}) vs CR ${weapon.baseDC || 14}`}
                                  >
                                    <Zap size={12} className="text-purple-400" />
                                    <span>Cast ({weapon.attackMod >= 0 ? `+${weapon.attackMod}` : weapon.attackMod})</span>
                                  </button>
                                ) : isNat ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRollCheck(`${weapon.name} Strike`, weapon.attackMod)}
                                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow flex items-center gap-1"
                                    title="Roll 2d10 + Natural Strike Modifier"
                                  >
                                    <Dices size={12} className="text-emerald-400" />
                                    <span>Strike ({weapon.attackMod >= 0 ? `+${weapon.attackMod}` : weapon.attackMod})</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRollCheck(`${weapon.name} Attack`, weapon.attackMod)}
                                    className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-800 border border-cyan-600/60 text-cyan-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow flex items-center gap-1"
                                    title="Roll 2d10 + Attack Modifier"
                                  >
                                    <Dices size={12} />
                                    <span>Hit ({weapon.attackMod >= 0 ? `+${weapon.attackMod}` : weapon.attackMod})</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRollWeaponDamage(weapon)}
                                  className="px-2.5 py-1 bg-rose-950 hover:bg-rose-800 border border-rose-600/60 text-rose-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow flex items-center gap-1"
                                  title={`Roll damage expression (${weapon.damage})`}
                                >
                                  <span>💥 Damage</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {latestDamageResult && (
                        <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs font-mono flex items-center justify-between animate-in fade-in">
                          <span>
                            <strong>{latestDamageResult.weaponName}</strong> rolled: <span className="text-white font-bold">{latestDamageResult.expression}</span> = <strong className="text-amber-300 text-sm">{latestDamageResult.total} Damage</strong>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            (Rolls: {JSON.stringify(latestDamageResult.rolls)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                    </>
                  )}
                </div>
              )}

              {/* Trained Skills (Grouped by Category, Empty Groups Hidden, No scrollbars) */}
              {(activeTab === 'all' || activeTab === 'skills') && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Crosshair size={14} className="text-emerald-400" />
                      Trained Operative Skills
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Rank &gt; 0 Only</span>
                  </h3>

                  {trainedSkillsByGroup.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                      No trained skill ranks allocated on this operative sheet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trainedSkillsByGroup.map(group => (
                        <div key={group.key} className="space-y-1.5">
                          <div className="text-[10.5px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-800/60 pb-1">
                            <span>{group.label}</span>
                            <span className="text-[9px] text-slate-500 font-normal">({group.skills.length})</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {group.skills.map(skill => (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleRollCheck(`${skill.name} Check`, skill.total)}
                                className="p-2 rounded-lg bg-slate-950/80 hover:bg-cyan-950/50 border border-slate-800/80 hover:border-cyan-500/60 transition-all flex items-center justify-between cursor-pointer group shadow-sm text-left"
                                title={`${skill.name}: Rank ${skill.rank} + ${skill.attrKey} (${skill.attrScore}) = Total ${skill.total}\n${skill.description}`}
                              >
                                <div className="truncate pr-1">
                                  <span className="text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300 block truncate">
                                    {skill.name}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    Rank {skill.rank} • {skill.attrKey} {skill.attrScore >= 0 ? `+${skill.attrScore}` : skill.attrScore}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-800 text-cyan-300 font-mono font-bold text-xs shrink-0">
                                  +{skill.total}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  REWORKED PROPERTY & EQUIPMENT CATALOG
                  No Slider Bar • Collapsible Categories • No Scrollbars
                  ======================================================== */}
              {(activeTab === 'all' || activeTab === 'property') && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
                  {/* Property Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Briefcase size={15} className="text-cyan-400" />
                      <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                        Property &amp; Equipment Catalog
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {propertyCatalog.allItems.length} Items
                      </span>
                    </div>

                    {/* Encumbrance Stat Chip (No slider bar) */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Scale size={13} className={isOverburdened ? 'text-red-400' : isEncumbered ? 'text-amber-400' : 'text-emerald-400'} />
                      <span className="text-[11px] text-slate-400">Carried Load:</span>
                      <span className={`font-bold ${isOverburdened ? 'text-red-400' : isEncumbered ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {carriedWeight} / {maxCapacity} lbs
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        isOverburdened 
                          ? 'bg-red-950 text-red-300 border border-red-800' 
                          : isEncumbered 
                            ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {isOverburdened ? 'Overburdened (-2)' : isEncumbered ? 'Encumbered' : 'Unencumbered'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Search Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleAllCategories(true)}
                        className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10.5px] font-mono font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAllCategories(false)}
                        className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10.5px] font-mono font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
                      >
                        Collapse All
                      </button>
                    </div>

                    <div className="relative shrink-0 w-full sm:w-48">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Filter property..."
                        value={propertySearchQuery}
                        onChange={(e) => setPropertySearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs pl-7 pr-6 py-1 rounded text-slate-200 outline-none focus:border-cyan-500 font-mono"
                      />
                      {propertySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPropertySearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Collapsible Category Accordions (No slider bar, no scrollbars) */}
                  <div className="space-y-2">
                    {(() => {
                      const visibleCategories = propertyCatalog.categories.filter(cat => {
                        if (!propertySearchQuery) return true;
                        const q = propertySearchQuery.toLowerCase();
                        return cat.items.some(item => (
                          item.name.toLowerCase().includes(q) ||
                          (item.desc || '').toLowerCase().includes(q) ||
                          (item.category || '').toLowerCase().includes(q) ||
                          (Array.isArray(item.properties) && item.properties.some(p => String(p).toLowerCase().includes(q)))
                        ));
                      });

                      if (propertyCatalog.categories.length === 0) {
                        return (
                          <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                            No property or equipment currently recorded on this operative sheet.
                          </div>
                        );
                      }

                      if (visibleCategories.length === 0) {
                        return (
                          <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                            No property items matching "{propertySearchQuery}".
                          </div>
                        );
                      }

                      return visibleCategories.map(cat => {
                        const catMatchingItems = cat.items.filter(item => {
                          if (!propertySearchQuery) return true;
                          const q = propertySearchQuery.toLowerCase();
                          return (
                            item.name.toLowerCase().includes(q) ||
                            (item.desc || '').toLowerCase().includes(q) ||
                            (item.category || '').toLowerCase().includes(q) ||
                            (Array.isArray(item.properties) && item.properties.some(p => String(p).toLowerCase().includes(q)))
                          );
                        });

                        const catWeight = Math.round(cat.items.reduce((sum, item) => sum + (item.weight * item.qty), 0) * 10) / 10;
                        const isOpen = propertySearchQuery ? catMatchingItems.length > 0 : Boolean(openCategories[cat.id]);

                        return (
                          <div
                            key={cat.id}
                            className="rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden shadow-sm transition-all"
                          >
                            {/* Category Header Row (Click to toggle) */}
                            <button
                              type="button"
                              onClick={() => toggleCategory(cat.id)}
                              className="w-full p-2.5 px-3 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-slate-400">
                                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                                <span className="text-sm">{cat.icon}</span>
                                <span className="text-xs font-mono font-bold text-slate-200 truncate">
                                  {cat.name}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                                  {cat.items.length}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 text-xs font-mono text-slate-400">
                                {catWeight > 0 && (
                                  <span className="text-[10.5px]">
                                    {catWeight} lbs
                                  </span>
                                )}
                              </div>
                            </button>

                            {/* Category Expanded Items List - Natural Flow, No Scrollbars */}
                            {isOpen && (
                              <div className="p-2.5 pt-0 border-t border-slate-800/40">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                  {catMatchingItems.map(item => (
                                    <div
                                      key={item.id}
                                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between gap-1.5 shadow-sm"
                                    >
                                      <div>
                                        <div className="flex items-start justify-between gap-1.5 flex-wrap">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-xs font-mono font-bold text-slate-200 truncate" title={item.name}>
                                              {item.name}
                                            </span>
                                            {item.qty > 1 && (
                                              <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                                                ×{item.qty}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            {item.tl && (
                                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/50 text-cyan-400">
                                                TL {item.tl}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1 flex-wrap">
                                          {item.weight > 0 && (
                                            <span>Weight: <strong className="text-slate-300">{item.weight * item.qty} lbs</strong> {item.qty > 1 ? `(${item.weight} ea)` : ''}</span>
                                          )}
                                          {item.cost && (
                                            <span>Val: <strong className="text-emerald-400">{item.cost}</strong></span>
                                          )}
                                          {item.armorDr && (
                                            <span className="text-amber-300 font-bold">DR {item.armorDr}</span>
                                          )}
                                          {item.damage && (
                                            <span className="text-rose-300 font-bold">Dmg: {item.damage}</span>
                                          )}
                                          {item.range && (
                                            <span className="text-cyan-300">Rng: {item.range}</span>
                                          )}
                                        </div>

                                        {item.desc && (
                                          <p className="text-[10.5px] font-sans text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                            {item.desc}
                                          </p>
                                        )}
                                      </div>

                                      {/* Action Roll Trigger if item has combat stats */}
                                      {(item.damage || item.attackMod !== 0) && (
                                        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/80 mt-1">
                                          <button
                                            type="button"
                                            onClick={() => handleRollCheck(`${item.name} Attack`, item.attackMod)}
                                            className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[10px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1"
                                            title={`Roll 2d10 + ${item.attackMod}`}
                                          >
                                            <Dices size={10} />
                                            <span>Hit ({item.attackMod >= 0 ? `+${item.attackMod}` : item.attackMod})</span>
                                          </button>
                                          {item.damage && (
                                            <button
                                              type="button"
                                              onClick={() => handleRollWeaponDamage(item)}
                                              className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-[10px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1"
                                              title={`Roll Damage: ${item.damage}`}
                                            >
                                              <span>💥 {item.damage}</span>
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                    });
                  })()}
                </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default React.memo(TacticalPlayView);
