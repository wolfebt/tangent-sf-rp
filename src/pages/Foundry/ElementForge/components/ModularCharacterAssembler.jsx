import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDBM } from '../../../../context/DBMContext';
import { useAuth } from '../../../../context/AuthContext';
import { showToast } from '../../../../context/ToastContext';
import { AudioService } from '../../../../services/audioService';
import { generateContent } from '../../../../services/aimeService';
import {
  THREAT_TIER_CHASSIS,
  COMPETENCY_ROLES,
  BOSS_TYPES,
  DESIGNATIONS,
  SPECIES_SIZES
} from '../../../../constants';
import { calculateNPCCombatBlock } from '../../../../engines/tangentEntityEngines';
import { ALL_CANONICAL_SKILLS as CANONICAL_SKILLS_REGISTRY } from '../../../../data/skillsData';
import {
  sendMcmToFolioRoster,
  convertMcmToFolioPersona,
  convertFolioToMcmRecord,
  buildVttUnitFromPersona,
  resolveCompetencyRoleKey,
  resolveBossTypeKey,
  resolveDesignationKey
} from '../../../../utils/personaBridge';
import {
  Shield, Zap, Heart, Activity,
  Sparkles, Check, User, Crosshair,
  ExternalLink
} from 'lucide-react';

const PRIMARY_ATTR_SCHEMA = [
  { key: 'str', attrKey: 'attr-strength', label: 'STR', sub: { key: 'might', attrKey: 'attr-might', label: 'Might' } },
  { key: 'agi', attrKey: 'attr-agility', label: 'AGI', sub: { key: 'reflex', attrKey: 'attr-reflex', label: 'Reflex' } },
  { key: 'sta', attrKey: 'attr-stamina', label: 'STA', sub: { key: 'fortitude', attrKey: 'attr-fortitude', label: 'Fortitude' } },
  { key: 'int', attrKey: 'attr-intellect', label: 'INT', sub: { key: 'logic', attrKey: 'attr-logic', label: 'Logic' } },
  { key: 'wis', attrKey: 'attr-wisdom', label: 'WIS', sub: { key: 'will', attrKey: 'attr-will', label: 'Will' } },
  { key: 'cha', attrKey: 'attr-charisma', label: 'CHA', sub: { key: 'etiquette', attrKey: 'attr-etiquette', label: 'Etiquette' } }
];

const CHASSIS_PRESETS = {
  combatant: { name: 'Combatant', label: 'STR +3, AGI +2', str: 3, agi: 2, sta: 2, int: 0, wis: 1, cha: 0 },
  specialist: { name: 'Specialist', label: 'INT +3, AGI +2', str: 0, agi: 2, sta: 1, int: 3, wis: 1, cha: 1 },
  socialite: { name: 'Socialite', label: 'CHA +3, WIS +2', str: 0, agi: 1, sta: 1, int: 1, wis: 2, cha: 3 },
  balanced: { name: 'Balanced', label: '+1 All Attributes', str: 1, agi: 1, sta: 1, int: 1, wis: 1, cha: 1 }
};

function parseExistingArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mergeSlotIntoArray(existingRaw, selectedName, catalogObj, fallbackFactory) {
  const existing = parseExistingArray(existingRaw);
  const cleanName = typeof selectedName === 'string' ? selectedName.trim() : '';
  if (!cleanName) return existing;
  const alreadyPresent = existing.some(
    (item) =>
      String(typeof item === 'string' ? item : item?.name || item?.title || '')
        .trim()
        .toLowerCase() === cleanName.toLowerCase()
  );
  if (alreadyPresent) return existing;
  return [catalogObj || fallbackFactory(cleanName), ...existing];
}

export const ModularCharacterAssembler = ({
  fields = {},
  onFieldChange,
  onBatchFieldChange,
  elementTitle = ''
}) => {
  const navigate = useNavigate();
  const { dbData, saveEntry } = useDBM() || { dbData: {} };
  const { isAdmin = false } = useAuth() || {};

  // Live collections from Omnicortex DBM
  const speciesList = dbData?.species || [];
  const archetypesList = dbData?.archetypes || [];
  const occupationsList = dbData?.occupations || [];
  const originsList = dbData?.origins || [];
  const factionsList = dbData?.factions || [];
  const featuresList = dbData?.features || [];
  const traitsList = useMemo(() => {
    const merged = [...(dbData?.traits || []), ...(dbData?.trait || [])];
    const seen = new Set();
    return merged.filter((item) => {
      if (!item || typeof item !== 'object') return false;
      const k = String(item.id || item.name || item.title || '').toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [dbData?.traits, dbData?.trait]);
  const disadvantagesList = dbData?.disadvantages || [];
  const augmentationsList = dbData?.augmentations || [];
  const metaphysicsList = dbData?.invocations || [];
  const weaponsList = dbData?.weaponry || [];
  const armorsList = dbData?.armoring || [];
  const gearList = dbData?.gear || [];
  const mcmPresetsList = dbData?.modular_characters || [];

  const [selectedMcmPresetId, setSelectedMcmPresetId] = useState('');
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'attributes' | 'aspects' | 'loadout'

  // Canonical MCM Core Configuration (Tiers 0-20)
  const [tier, setTier] = useState(() => {
    const parsed = parseInt(fields.mcmTier ?? '1', 10);
    return Number.isNaN(parsed) ? 1 : Math.max(0, Math.min(20, parsed));
  });
  const [designation, setDesignation] = useState(() => resolveDesignationKey(fields.mcmDesignation || fields['char-role'] || 'Adversary'));
  const [chassisKey, setChassisKey] = useState(fields.mcmChassis?.toLowerCase() || 'combatant');
  const [roleKey, setRoleKey] = useState(() => resolveCompetencyRoleKey(fields.mcmRole || 'Tank'));
  const [bossType, setBossType] = useState(() => resolveBossTypeKey(fields.mcmBossType || fields.bossType || 'STANDARD'));
  const [speciesSize, setSpeciesSize] = useState(fields.speciesSize || fields['char-size'] || 'Medium');

  // 5-Pillar Identity
  const [selectedSpecies, setSelectedSpecies] = useState(fields['char-species'] || '');
  const [selectedArchetype, setSelectedArchetype] = useState(fields['char-archetype'] || '');
  const [selectedOccupation, setSelectedOccupation] = useState(fields['char-occu'] || '');
  const [selectedOrigin, setSelectedOrigin] = useState(fields['char-origin'] || '');
  const [selectedFaction, setSelectedFaction] = useState(fields['char-faction'] || '');

  // Custom Attribute & Skill Overrides
  const [customAttrs, setCustomAttrs] = useState(() => ({
    str: fields['attr-strength'] ?? fields['attr-str-base'],
    agi: fields['attr-agility'] ?? fields['attr-agi-base'],
    sta: fields['attr-stamina'] ?? fields['attr-sta-base'],
    int: fields['attr-intellect'] ?? fields['attr-int-base'],
    wis: fields['attr-wisdom'] ?? fields['attr-wis'] ?? fields['attr-wil-base'],
    cha: fields['attr-charisma'] ?? fields['attr-cha-base']
  }));
  const [skillRanks, setSkillRanks] = useState(() => {
    const map = {};
    CANONICAL_SKILLS_REGISTRY.forEach((sk) => {
      if (fields[`skill-${sk.id}-rank`] !== undefined) {
        map[sk.id] = Number(fields[`skill-${sk.id}-rank`]);
      }
    });
    return map;
  });

  // Loadout & Aspects
  const [selectedWeapon, setSelectedWeapon] = useState(() => {
    if (typeof fields.weapon === 'string' && fields.weapon.trim()) return fields.weapon;
    const arr = parseExistingArray(fields.weapons);
    return arr[0]?.name || arr[0]?.title || '';
  });
  const [selectedArmor, setSelectedArmor] = useState(() => {
    if (typeof fields.selectedArmor === 'string' && fields.selectedArmor.trim()) return fields.selectedArmor;
    if (typeof fields.armor === 'string' && fields.armor.trim() && !fields.armor.trim().startsWith('[')) {
      return fields.armor;
    }
    const arr = parseExistingArray(fields.armor);
    return arr[0]?.name || arr[0]?.title || '';
  });
  const [selectedGear, setSelectedGear] = useState(() => {
    if (typeof fields.selectedGear === 'string') return fields.selectedGear;
    if (typeof fields.gear === 'string' && !fields.gear.trim().startsWith('[')) return fields.gear;
    const arr = parseExistingArray(fields.gear);
    return arr[0]?.name || arr[0]?.title || '';
  });
  const [selectedFeature, setSelectedFeature] = useState(() => {
    if (typeof fields.selectedFeature === 'string' && fields.selectedFeature.trim()) return fields.selectedFeature;
    const arr = parseExistingArray(fields.features);
    return arr[0]?.name || arr[0]?.title || '';
  });
  const [selectedTrait, setSelectedTrait] = useState(() => {
    if (typeof fields.selectedTrait === 'string' && fields.selectedTrait.trim()) return fields.selectedTrait;
    const arr = parseExistingArray(fields.traits);
    return arr[0]?.name || arr[0]?.title || '';
  });
  const [selectedDisadvantage, setSelectedDisadvantage] = useState(() => {
    if (typeof fields.selectedDisadvantage === 'string' && fields.selectedDisadvantage.trim()) return fields.selectedDisadvantage;
    const arr = parseExistingArray(fields.disadvantages);
    return arr[0]?.name || arr[0]?.title || '';
  });
  const [selectedAugmentation, setSelectedAugmentation] = useState(() => {
    if (typeof fields.selectedAugmentation === 'string' && fields.selectedAugmentation.trim()) return fields.selectedAugmentation;
    const arr = parseExistingArray(fields.augmentations);
    return arr[0]?.name || arr[0]?.title || '';
  });
  const [selectedInvocation, setSelectedInvocation] = useState(() => {
    if (typeof fields.selectedInvocation === 'string' && fields.selectedInvocation.trim()) return fields.selectedInvocation;
    const arr = parseExistingArray(fields.invocations);
    return arr[0]?.name || arr[0]?.title || '';
  });

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);
  const didAutoSyncMountRef = useRef(false);
  const appliedTimerRef = useRef(null);
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const pendingPresetArraysRef = useRef(null);
  const skipNextAutoSyncRef = useRef(false);

  useEffect(() => {
    return () => {
      if (appliedTimerRef.current) clearTimeout(appliedTimerRef.current);
    };
  }, []);

  // Sync local controls if external BASTION Auto-Calibrate mutates fields
  useEffect(() => {
    if (fields.mcmTier !== undefined && fields.mcmTier !== '') {
      const parsedTier = parseInt(fields.mcmTier, 10);
      if (!Number.isNaN(parsedTier)) {
        const clamped = Math.max(0, Math.min(20, parsedTier));
        setTier((prev) => (prev === clamped ? prev : clamped));
      }
    }
    if (fields.mcmRole) {
      const resolvedRole = resolveCompetencyRoleKey(fields.mcmRole);
      setRoleKey((prev) => (prev === resolvedRole ? prev : resolvedRole));
    }
    const incomingBoss = fields.mcmBossType || fields.bossType;
    if (incomingBoss) {
      const resolvedBoss = resolveBossTypeKey(incomingBoss);
      setBossType((prev) => (prev === resolvedBoss ? prev : resolvedBoss));
    }
    if (fields.mcmDesignation) {
      const resolvedDes = resolveDesignationKey(fields.mcmDesignation);
      setDesignation((prev) => (prev === resolvedDes ? prev : resolvedDes));
    }
    const incomingSize = fields.speciesSize || fields['char-size'];
    if (incomingSize) {
      setSpeciesSize((prev) => (prev === incomingSize ? prev : incomingSize));
    }
  }, [fields.mcmTier, fields.mcmRole, fields.mcmBossType, fields.bossType, fields.mcmDesignation, fields.speciesSize, fields['char-size']]);

  const isSyntheticSpecies =
    Boolean(fields.isSynthetic || fields.is_synthetic) ||
    fields.physiology === 'Synthetic' ||
    String(selectedSpecies || '').toLowerCase().includes('synthetic') ||
    String(selectedSpecies || '').toLowerCase().includes('automata');

  const activeChassis = CHASSIS_PRESETS[chassisKey] || CHASSIS_PRESETS.combatant;
  const activeRoleObj = COMPETENCY_ROLES[roleKey] || COMPETENCY_ROLES.Tank;

  // Lookup Armor DR from selected Armor if available (supports dr, dr_rating, armor_dr)
  const selectedArmorObj = useMemo(
    () => armorsList.find((a) => (a.name || a.title) === selectedArmor),
    [armorsList, selectedArmor]
  );
  const armorDRValue = useMemo(() => {
    const rawDr = selectedArmorObj?.dr ?? selectedArmorObj?.dr_rating ?? selectedArmorObj?.armor_dr;
    if (rawDr !== undefined && rawDr !== null && rawDr !== '') {
      const parsed = Number(rawDr);
      if (Number.isFinite(parsed)) return Math.max(0, parsed);
    }
    return Math.max(0, Math.floor(tier / 2) + (roleKey === 'Tank' || roleKey === 'Brute' ? 3 : 1));
  }, [selectedArmorObj, tier, roleKey]);

  // Canonical Combat Stat Block via tangentEntityEngines
  const combatBlock = useMemo(() => {
    return calculateNPCCombatBlock({
      tier,
      role: roleKey,
      bossType,
      size: speciesSize,
      designation,
      isSynthetic: isSyntheticSpecies,
      agility: customAttrs.agi !== undefined && customAttrs.agi !== '' ? Number(customAttrs.agi) : null,
      chassisType: isSyntheticSpecies ? 'Synthetic' : 'Biological'
    });
  }, [tier, roleKey, bossType, speciesSize, designation, isSyntheticSpecies, customAttrs.agi]);

  const calculatedHealth = isSyntheticSpecies ? (combatBlock.structurePoints ?? 0) : (combatBlock.health ?? 0);
  const calculatedVitality = isSyntheticSpecies ? 0 : (combatBlock.vitality ?? 0);
  const calculatedToughness = customAttrs.sta !== undefined && customAttrs.sta !== ''
    ? Number(customAttrs.sta)
    : ((combatBlock.attributes?.sta ?? combatBlock.attributeBonus ?? 0) + (activeChassis?.sta ?? 0));
  const hasCustomArmorDR = Boolean(
    selectedArmorObj &&
      (selectedArmorObj.dr !== undefined ||
        selectedArmorObj.dr_rating !== undefined ||
        selectedArmorObj.armor_dr !== undefined)
  );
  const effectiveArmorDR = hasCustomArmorDR ? armorDRValue : (combatBlock.expectedDR ?? armorDRValue);
  const calculatedBaseDamageDice = combatBlock.baseDamageDice || (tier >= 10 ? '3d8+4' : tier >= 5 ? '2d8+2' : '2d6+1');
  const calculatedTierTitle = combatBlock.narrativeRank || `Tier ${tier}`;
  const calculatedDefense = combatBlock.defenseDC ?? 10;
  const calculatedAttackBonus = combatBlock.attackBonus ?? 0;

  // Build Complete MCM Payload aligned with Persona Folio
  const buildFullMcmConfig = (overrides = null) => {
    const clearedSlot = overrides?.clearedSlot || null;
    const effWeapon = clearedSlot === 'weapon' ? '' : selectedWeapon;
    const effArmor = clearedSlot === 'selectedArmor' ? '' : selectedArmor;
    const effGear = clearedSlot === 'selectedGear' ? '' : selectedGear;
    const effFeature = clearedSlot === 'selectedFeature' ? '' : selectedFeature;
    const effTrait = clearedSlot === 'selectedTrait' ? '' : selectedTrait;
    const effDisadvantage = clearedSlot === 'selectedDisadvantage' ? '' : selectedDisadvantage;
    const effAugmentation = clearedSlot === 'selectedAugmentation' ? '' : selectedAugmentation;
    const effInvocation = clearedSlot === 'selectedInvocation' ? '' : selectedInvocation;

    const weapObj = weaponsList.find((w) => (w.name || w.title) === effWeapon);
    const gearObj = gearList.find((g) => (g.name || g.title) === effGear);
    const featObj = featuresList.find((f) => (f.name || f.title) === effFeature);
    const traitObj = traitsList.find((t) => (t.name || t.title) === effTrait);
    const disObj = disadvantagesList.find((d) => (d.name || d.title) === effDisadvantage);
    const augObj = augmentationsList.find((a) => (a.name || a.title) === effAugmentation);
    const invObj = metaphysicsList.find((m) => (m.name || m.title) === effInvocation);

    const latestFields = fieldsRef.current || {};
    const presetArrays = overrides?.arrays || pendingPresetArraysRef.current;
    if (!overrides?.arrays) {
      pendingPresetArraysRef.current = null;
    }

    const mergedWeapons = mergeSlotIntoArray(
      presetArrays ? presetArrays.weapons : latestFields.weapons,
      effWeapon,
      weapObj,
      (name) => ({ id: 'wpn_1', name, damage: calculatedBaseDamageDice, range: 'Medium', type: 'Tactical' })
    );
    const mergedArmor = mergeSlotIntoArray(
      presetArrays ? presetArrays.armor : latestFields.armor,
      effArmor,
      effArmor ? selectedArmorObj : null,
      (name) => ({ id: 'arm_1', name, dr: effectiveArmorDR, equipped: true })
    );

    const existingAttacks = parseExistingArray(latestFields.attacks);

    return {
      id: latestFields.dbmId || `mcm_${Date.now()}`,
      name: (elementTitle || `${designation} ${activeRoleObj.name}`).trim(),
      threatTier: tier,
      competencyRole: roleKey,
      bossType,
      designation,
      speciesSize,
      isSynthetic: isSyntheticSpecies,
      species: selectedSpecies || 'Human',
      archetype: selectedArchetype || activeChassis.name,
      occupation: selectedOccupation || activeRoleObj.name,
      origin: selectedOrigin || 'Sector Frontier',
      faction: selectedFaction || 'Independent',
      vitalityPoints: calculatedVitality,
      healthPoints: calculatedHealth,
      structurePoints: combatBlock.structurePoints ?? 0,
      armorDR: effectiveArmorDR,
      staminaDR: calculatedToughness,
      defenseDC: calculatedDefense,
      attackBonus: calculatedAttackBonus,
      actionsPerRound: combatBlock.actionsPerRound ?? 1,
      attributes: {
        str: customAttrs.str !== undefined && customAttrs.str !== '' ? Number(customAttrs.str) : ((combatBlock.attributes?.str ?? combatBlock.attributeBonus ?? 0) + (activeChassis?.str ?? 0)),
        agi: customAttrs.agi !== undefined && customAttrs.agi !== '' ? Number(customAttrs.agi) : ((combatBlock.attributes?.agi ?? combatBlock.secondaryAttrBonus ?? 0) + (activeChassis?.agi ?? 0)),
        sta: calculatedToughness,
        int: customAttrs.int !== undefined && customAttrs.int !== '' ? Number(customAttrs.int) : ((combatBlock.attributes?.int ?? combatBlock.secondaryAttrBonus ?? 0) + (activeChassis?.int ?? 0)),
        wis: customAttrs.wis !== undefined && customAttrs.wis !== '' ? Number(customAttrs.wis) : ((combatBlock.attributes?.wis ?? combatBlock.secondaryAttrBonus ?? 0) + (activeChassis?.wis ?? 0)),
        cha: customAttrs.cha !== undefined && customAttrs.cha !== '' ? Number(customAttrs.cha) : ((combatBlock.attributes?.cha ?? 0) + (activeChassis?.cha ?? 0))
      },
      skills: skillRanks,
      ...(existingAttacks.length > 0 ? { attacks: existingAttacks } : {}),
      weapons: mergedWeapons.length > 0
        ? mergedWeapons
        : (overrides?.emptyArrayKey === 'weapons'
            ? []
            : [{ id: 'wpn_default', name: `${activeRoleObj.name} Armament`, damage: calculatedBaseDamageDice, range: 'Medium', type: 'Tactical' }]),
      armor: mergedArmor.length > 0
        ? mergedArmor
        : (overrides?.emptyArrayKey === 'armor'
            ? []
            : (effectiveArmorDR > 0 ? [{ id: 'arm_default', name: 'Tactical Plating', dr: effectiveArmorDR, equipped: true }] : [])),
      gear: mergeSlotIntoArray(
        presetArrays ? presetArrays.gear : latestFields.gear,
        effGear,
        gearObj,
        (name) => ({ id: 'gear_1', name })
      ),
      features: mergeSlotIntoArray(
        presetArrays ? presetArrays.features : latestFields.features,
        effFeature,
        featObj,
        (name) => ({ id: 'feat_1', name })
      ),
      traits: mergeSlotIntoArray(
        presetArrays ? presetArrays.traits : latestFields.traits,
        effTrait,
        traitObj,
        (name) => ({ id: 'trait_1', name })
      ),
      disadvantages: mergeSlotIntoArray(
        presetArrays ? presetArrays.disadvantages : latestFields.disadvantages,
        effDisadvantage,
        disObj,
        (name) => ({ id: 'dis_1', name })
      ),
      augmentations: mergeSlotIntoArray(
        presetArrays ? presetArrays.augmentations : latestFields.augmentations,
        effAugmentation,
        augObj,
        (name) => ({ id: 'aug_1', name })
      ),
      invocations: mergeSlotIntoArray(
        presetArrays ? presetArrays.invocations : latestFields.invocations,
        effInvocation,
        invObj,
        (name) => ({ id: 'inv_1', name })
      ),
      concept: latestFields['char-concept'] || `${calculatedTierTitle} ${activeRoleObj.name} (${designation})`,
      motive: latestFields['char-motive'] || '',
      conflict: latestFields['char-conflict'] || '',
      theLie: latestFields.theLie || '',
      theTruth: latestFields.theTruth || '',
      definingTrauma: latestFields.definingTrauma || '',
      appearance: latestFields.appearance || '',
      voiceProfile: latestFields.voiceProfile || '',
      mannerisms: latestFields.mannerisms || '',
      content: latestFields.content ?? '',
      narrativeProse: latestFields.narrativeProse ?? latestFields.content ?? '',
      imageUrl: latestFields.imageUrl || latestFields.portrait || '',
      tokenUrl: latestFields.tokenUrl || latestFields.token || latestFields.imageUrl || '',
      guidance: latestFields.guidance,
      assetHub: latestFields.assetHub,
      customFields: latestFields.customFields,
      summary: latestFields.summary || '',
      backstory: latestFields.backstory || '',
      worldview: latestFields.worldview || '',
      goals: latestFields.goals || '',
      stakes: latestFields.stakes || '',
      plotHooks: latestFields.plotHooks || '',
      primaryTriggers: latestFields.primaryTriggers || '',
      secondaryTriggers: latestFields.secondaryTriggers || '',
      vttScript: latestFields.vttScript || '',
      vttScriptActive: latestFields.vttScriptActive,
      relationsStance: latestFields.relationsStance || 'Hostile',
      vipTarget: latestFields.vipTarget || '',
      rivalTarget: latestFields.rivalTarget || '',
      keyRelationships: latestFields.keyRelationships || '',
      tags: latestFields.tags || '',
      keywords: latestFields.keywords || '',
      negative_keywords: latestFields.negative_keywords || ''
    };
  };

  // Build batched parent field patch (shared by automatic live sync and manual Re-sync)
  const buildMcmBatchPatch = (overrides = null) => {
    const latestFields = fieldsRef.current || {};
    const fullConfig = buildFullMcmConfig(overrides);
    const folioPersona = convertMcmToFolioPersona(fullConfig);
    const vttUnit = buildVttUnitFromPersona(folioPersona, { uniqueInstance: false });
    const clearedSlot = overrides?.clearedSlot || null;

    const batchPatch = {
      personaSubcategory: 'mcm',
      mcmTier: String(tier),
      mcmDesignation: designation,
      mcmChassis: activeChassis.name,
      mcmRole: roleKey,
      mcmBossType: bossType,
      bossType,
      speciesSize,
      'char-size': speciesSize,
      physiology: isSyntheticSpecies ? 'Synthetic' : 'Organic',
      isSynthetic: isSyntheticSpecies,
      is_synthetic: isSyntheticSpecies,
      health: String(calculatedHealth),
      vitality: String(calculatedVitality),
      structure: String(combatBlock.structurePoints ?? 0),
      structurePoints: String(combatBlock.structurePoints ?? 0),
      toughness: String(calculatedToughness),
      armorDR: String(effectiveArmorDR),
      defense_dc: String(calculatedDefense),
      defense: String(calculatedDefense),
      attack_bonus: String(calculatedAttackBonus),
      attackBonus: String(calculatedAttackBonus),
      actions: String(combatBlock.actionsPerRound ?? 1),
      actionsPerRound: String(combatBlock.actionsPerRound ?? 1),
      damageDice: calculatedBaseDamageDice,
      ...(selectedSpecies ? { 'char-species': selectedSpecies } : {}),
      ...(selectedArchetype ? { 'char-archetype': selectedArchetype } : {}),
      ...(selectedOccupation ? { 'char-occu': selectedOccupation } : {}),
      ...(selectedOrigin ? { 'char-origin': selectedOrigin } : {}),
      ...(selectedFaction ? { 'char-faction': selectedFaction } : {}),
      ...(clearedSlot === 'weapon' ? { weapon: '' } : (selectedWeapon ? { weapon: selectedWeapon } : {})),
      ...(clearedSlot === 'selectedArmor' ? { selectedArmor: '' } : (selectedArmor ? { selectedArmor } : {})),
      ...(clearedSlot === 'selectedGear' ? { selectedGear: '' } : (selectedGear ? { selectedGear } : {})),
      ...(clearedSlot === 'selectedFeature' ? { selectedFeature: '' } : (selectedFeature ? { selectedFeature } : {})),
      ...(clearedSlot === 'selectedTrait' ? { selectedTrait: '' } : (selectedTrait ? { selectedTrait } : {})),
      ...(clearedSlot === 'selectedDisadvantage' ? { selectedDisadvantage: '' } : (selectedDisadvantage ? { selectedDisadvantage } : {})),
      ...(clearedSlot === 'selectedAugmentation' ? { selectedAugmentation: '' } : (selectedAugmentation ? { selectedAugmentation } : {})),
      ...(clearedSlot === 'selectedInvocation' ? { selectedInvocation: '' } : (selectedInvocation ? { selectedInvocation } : {})),
      features: folioPersona.features,
      traits: folioPersona.traits,
      disadvantages: folioPersona.disadvantages,
      augmentations: folioPersona.augmentations,
      invocations: folioPersona.invocations,
      weapons: folioPersona.weapons,
      armor: folioPersona.armor,
      gear: folioPersona.gear,
      attacks:
        parseExistingArray(latestFields.attacks).length > 0
          ? latestFields.attacks
          : folioPersona.attacks,
      vttUnitData: vttUnit,
      isReadyForVtt: true
    };

    PRIMARY_ATTR_SCHEMA.forEach(({ attrKey, sub }) => {
      batchPatch[attrKey] = String(folioPersona[attrKey] ?? 0);
      batchPatch[sub.attrKey] = String(folioPersona[sub.attrKey] ?? 2);
      if (sub.attrKey === 'attr-will') {
        batchPatch['attr-willpower'] = String(folioPersona[sub.attrKey] ?? 2);
      } else if (sub.attrKey === 'attr-logic') {
        batchPatch['attr-reason'] = String(folioPersona[sub.attrKey] ?? 2);
      }
    });

    CANONICAL_SKILLS_REGISTRY.forEach((sk) => {
      batchPatch[`skill-${sk.id}-rank`] = folioPersona[`skill-${sk.id}-rank`] ?? 0;
    });

    return { fullConfig, folioPersona, vttUnit, batchPatch };
  };

  const flushPatchToParent = (batchPatch) => {
    if (typeof onBatchFieldChange === 'function') {
      onBatchFieldChange(batchPatch);
    } else if (typeof onFieldChange === 'function') {
      Object.entries(batchPatch).forEach(([k, v]) => onFieldChange(k, v));
    }
  };

  const handleRemoveArrayItem = (arrayKey, indexToRemove, currentSelected, setSelectedFn, selectedFieldKey) => {
    const latestFields = fieldsRef.current || {};
    const allArrays = {
      weapons: parseExistingArray(latestFields.weapons),
      armor: parseExistingArray(latestFields.armor),
      gear: parseExistingArray(latestFields.gear),
      features: parseExistingArray(latestFields.features),
      traits: parseExistingArray(latestFields.traits),
      disadvantages: parseExistingArray(latestFields.disadvantages),
      augmentations: parseExistingArray(latestFields.augmentations),
      invocations: parseExistingArray(latestFields.invocations)
    };
    const currentList = allArrays[arrayKey] || [];
    const removedItem = currentList[indexToRemove];
    const removedName = String(removedItem?.name || removedItem?.title || removedItem || '').trim().toLowerCase();
    const nextList = currentList.filter((_, idx) => idx !== indexToRemove);
    const shouldClearSelected =
      Boolean(currentSelected) &&
      (String(currentSelected).trim().toLowerCase() === removedName || nextList.length === 0);

    const overrides = {
      arrays: { ...allArrays, [arrayKey]: nextList },
      clearedSlot: shouldClearSelected ? selectedFieldKey : null,
      emptyArrayKey: nextList.length === 0 ? arrayKey : null
    };

    const { batchPatch } = buildMcmBatchPatch(overrides);
    if (nextList.length === 0 && (arrayKey === 'weapons' || arrayKey === 'armor')) {
      batchPatch[arrayKey] = [];
    }

    if (shouldClearSelected && typeof setSelectedFn === 'function') {
      skipNextAutoSyncRef.current = true;
      setSelectedFn('');
    }
    flushPatchToParent(batchPatch);
  };

  const renderArrayChips = (arrayKey, currentSelected, setSelectedFn, selectedFieldKey, toneClass = 'bg-slate-900 border-slate-700 text-slate-200') => {
    const items = parseExistingArray(fields?.[arrayKey]);
    if (items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 pt-1">
        {items.map((item, idx) => {
          const itemName = String(item?.name || item?.title || item || `Item ${idx + 1}`).trim();
          return (
            <span
              key={`${arrayKey}-${item?.id || itemName}-${idx}`}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono ${toneClass}`}
            >
              <span className="truncate max-w-[140px]">{itemName}</span>
              <button
                type="button"
                aria-label={`Remove ${itemName}`}
                title={`Remove ${itemName}`}
                onClick={() => handleRemoveArrayItem(arrayKey, idx, currentSelected, setSelectedFn, selectedFieldKey)}
                className="text-slate-400 hover:text-rose-300 font-bold leading-none cursor-pointer px-0.5"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  // Auto-sync MCM edits directly to parent Element state so switching modes/tabs or saving never loses edits
  useEffect(() => {
    if (!didAutoSyncMountRef.current) {
      didAutoSyncMountRef.current = true;
      return;
    }
    if (skipNextAutoSyncRef.current) {
      skipNextAutoSyncRef.current = false;
      return;
    }
    const { batchPatch } = buildMcmBatchPatch();
    flushPatchToParent(batchPatch);
    setAppliedNotification(true);
    if (appliedTimerRef.current) clearTimeout(appliedTimerRef.current);
    appliedTimerRef.current = setTimeout(() => setAppliedNotification(false), 2000);
  }, [
    tier,
    designation,
    chassisKey,
    roleKey,
    bossType,
    speciesSize,
    isSyntheticSpecies,
    selectedSpecies,
    selectedArchetype,
    selectedOccupation,
    selectedOrigin,
    selectedFaction,
    customAttrs,
    skillRanks,
    selectedWeapon,
    selectedArmor,
    selectedGear,
    selectedFeature,
    selectedTrait,
    selectedDisadvantage,
    selectedAugmentation,
    selectedInvocation
  ]);

  // Apply all calculated values and full Persona Folio structure to parent Element form
  const handleApplyToElement = () => {
    AudioService.playTerminalBeep(1150, 0.1);
    const { fullConfig, folioPersona, vttUnit, batchPatch } = buildMcmBatchPatch();
    flushPatchToParent(batchPatch);
    setAppliedNotification(true);
    if (appliedTimerRef.current) clearTimeout(appliedTimerRef.current);
    appliedTimerRef.current = setTimeout(() => setAppliedNotification(false), 2500);
    return { fullConfig, folioPersona, vttUnit };
  };

  // Send to Persona Folio
  const handleSendToFolio = (openFolioAfter = false) => {
    const { fullConfig } = handleApplyToElement();
    const sent = sendMcmToFolioRoster(fullConfig, {
      lockForVtt: !openFolioAfter,
      openInFolio: openFolioAfter,
      activateInFolio: openFolioAfter
    });
    const sentName = sent?.['char-name'] || sent?.name || sent?.character_name || elementTitle || 'Persona';
    showToast({
      type: 'success',
      text: openFolioAfter
        ? `Sent "${sentName}" to Persona Folio — opening Folio...`
        : `Sent "${sentName}" to Persona Folio Roster (VTT & Folio Ready)!`
    });
    if (openFolioAfter) {
      navigate('/folio');
    }
  };

  // 1-Click AIME Modular Assembly
  const handleAimeAutoAssemble = async () => {
    setIsSynthesizing(true);
    AudioService.playTerminalBeep(980, 0.08);

    const candidateWeapons = weaponsList.map((w) => w.name || w.title).filter(Boolean).slice(0, 20);
    const candidateArmors = armorsList.map((a) => a.name || a.title).filter(Boolean).slice(0, 20);

    const prompt = `You are AIME assisting with a Modular Character build in the Tangent SFF RPG ADE.
Character Concept: "${elementTitle || 'Combatant Operative'}"
Designation: "${designation}"
Current Tier: ${tier}

Select the most thematic configuration from:
1. Chassis: combatant, specialist, socialite, or balanced
2. Tactical Role: Tank, Brute, MeleeDPS, RangedDPS, Sniper, MobilitySpecialist, Flank, CombativeMetaUser, Buffer, Leader, Debuffer, or Technician
3. Choose a weapon from live Omnicortex options: ${candidateWeapons.length > 0 ? candidateWeapons.join(', ') : '(suggest Tech Level 3 sci-fi weapon)'}
4. Choose armor from live Omnicortex options: ${candidateArmors.length > 0 ? candidateArmors.join(', ') : '(suggest Tech Level 3 sci-fi armor)'}

Respond in JSON format:
{
  "chassis": "combatant",
  "role": "Tank",
  "suggestedWeapon": "Plasma Carbine",
  "suggestedArmor": "Tactical Combat Vest",
  "rationale": "Brief 1-sentence tactical explanation"
}`;

    try {
      const responseText = await generateContent({ prompt, enforceJson: true });
      if (typeof responseText !== 'string' || !responseText.trim()) {
        throw new Error('Empty AIME response');
      }
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.chassis && CHASSIS_PRESETS[parsed.chassis.toLowerCase()]) {
        setChassisKey(parsed.chassis.toLowerCase());
      }
      if (parsed.role) {
        setRoleKey(resolveCompetencyRoleKey(parsed.role));
      }
      if (parsed.suggestedWeapon) {
        setSelectedWeapon(parsed.suggestedWeapon);
      }
      if (parsed.suggestedArmor) {
        setSelectedArmor(parsed.suggestedArmor);
      }

      AudioService.playTerminalBeep(1200, 0.12);
    } catch (err) {
      console.warn('AIME auto-assemble fallback:', err);
      showToast({
        type: 'warning',
        text: 'AIME Auto-Assemble could not parse a live suggestion; kept current MCM loadout.'
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="p-4 bg-slate-950/80 border border-cyan-500/40 rounded-2xl flex flex-col gap-4 font-sans select-none shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-base shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            🧬
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-2">
              <span>Modular Character Matrix (MCM)</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-500/50">
                Folio & VTT Aligned
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Canonical 0–20 Threat Engine + 5-Pillar Identity + Full Persona Folio & VTT Unit Parity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleSendToFolio(false)}
            className="px-2.5 py-1 bg-purple-950/90 hover:bg-purple-900 border border-purple-500/60 text-purple-200 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            title="Send this MCM Persona into the Persona Folio Roster"
          >
            <User size={12} className="text-purple-300" />
            <span>Send to Folio</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendToFolio(true)}
            className="px-2.5 py-1 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            title="Send to Persona Folio and open Folio to continue full character development"
          >
            <ExternalLink size={12} className="text-cyan-300" />
            <span>Expand in Folio</span>
          </button>
          <button
            type="button"
            disabled={isSynthesizing}
            onClick={handleAimeAutoAssemble}
            className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={12} className={isSynthesizing ? 'animate-spin text-amber-400' : 'text-amber-400'} />
            <span>{isSynthesizing ? 'Synthesizing...' : 'AIME Auto-Assemble'}</span>
          </button>
        </div>
      </div>

      {/* Cortex Modular Character Matrix Preset Bar */}
      <div className="p-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <span className="text-[10px] font-mono font-bold uppercase text-purple-300 shrink-0">
            Cortex MCM Library ({mcmPresetsList.length}):
          </span>
          <select
            value={selectedMcmPresetId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedMcmPresetId(id);
              const preset = mcmPresetsList.find((m) => String(m.id) === id);
              if (preset) {
                const nextTier = Number(preset.threatTier ?? preset.threat_tier ?? 1) || 1;
                const nextRole = resolveCompetencyRoleKey(preset.competencyRole || preset.role || 'Tank');
                const nextDes = resolveDesignationKey(preset.designation || 'Adversary');
                const nextBoss = resolveBossTypeKey(preset.bossType || preset.boss_type || 'Standard');
                setTier(nextTier);
                setRoleKey(nextRole);
                setDesignation(nextDes);
                setBossType(nextBoss);
                setSpeciesSize(preset.speciesSize || preset.size || 'Medium');
                if (preset.species) setSelectedSpecies(preset.species);
                if (preset.archetype) setSelectedArchetype(preset.archetype);
                if (preset.occupation) setSelectedOccupation(preset.occupation);
                if (preset.origin) setSelectedOrigin(preset.origin);
                if (preset.faction) setSelectedFaction(preset.faction);
                if (preset.attributes && typeof preset.attributes === 'object') {
                  setCustomAttrs({
                    str: preset.attributes.str,
                    agi: preset.attributes.agi,
                    sta: preset.attributes.sta,
                    int: preset.attributes.int,
                    wis: preset.attributes.wis,
                    cha: preset.attributes.cha
                  });
                }
                if (preset.skills && typeof preset.skills === 'object') {
                  setSkillRanks({ ...preset.skills });
                }
                const firstWeaponName = Array.isArray(preset.weapons) ? (preset.weapons[0]?.name || preset.weapons[0]?.title || '') : (preset.weapon || '');
                const firstArmorName = Array.isArray(preset.armor) ? (preset.armor[0]?.name || preset.armor[0]?.title || '') : (preset.armorName || '');
                const firstGearName = Array.isArray(preset.gear) ? (preset.gear[0]?.name || preset.gear[0]?.title || '') : '';
                const firstFeatureName = Array.isArray(preset.features) ? (preset.features[0]?.name || preset.features[0]?.title || '') : '';
                const firstTraitName = Array.isArray(preset.traits) ? (preset.traits[0]?.name || preset.traits[0]?.title || '') : '';
                const firstDisName = Array.isArray(preset.disadvantages) ? (preset.disadvantages[0]?.name || preset.disadvantages[0]?.title || '') : '';
                const firstAugName = Array.isArray(preset.augmentations) ? (preset.augmentations[0]?.name || preset.augmentations[0]?.title || '') : '';
                const firstInvName = Array.isArray(preset.invocations) ? (preset.invocations[0]?.name || preset.invocations[0]?.title || '') : '';
                pendingPresetArraysRef.current = {
                  weapons: Array.isArray(preset.weapons) ? preset.weapons : [],
                  armor: Array.isArray(preset.armor) ? preset.armor : [],
                  gear: Array.isArray(preset.gear) ? preset.gear : [],
                  features: Array.isArray(preset.features) ? preset.features : [],
                  traits: Array.isArray(preset.traits) ? preset.traits : [],
                  disadvantages: Array.isArray(preset.disadvantages) ? preset.disadvantages : [],
                  augmentations: Array.isArray(preset.augmentations) ? preset.augmentations : [],
                  invocations: Array.isArray(preset.invocations) ? preset.invocations : []
                };
                if (firstWeaponName) setSelectedWeapon(firstWeaponName);
                if (firstArmorName) setSelectedArmor(firstArmorName);
                if (firstGearName) setSelectedGear(firstGearName);
                if (firstFeatureName) setSelectedFeature(firstFeatureName);
                if (firstTraitName) setSelectedTrait(firstTraitName);
                if (firstDisName) setSelectedDisadvantage(firstDisName);
                if (firstAugName) setSelectedAugmentation(firstAugName);
                if (firstInvName) setSelectedInvocation(firstInvName);
              }
            }}
            className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-purple-400"
          >
            <option value="">-- Load Saved Modular Character Matrix Template --</option>
            {mcmPresetsList.map((m, idx) => (
              <option key={m.id || idx} value={String(m.id)}>
                {m.name || m.title} (T-{m.threatTier ?? m.threat_tier ?? 1} {m.competencyRole || m.role || ''})
              </option>
            ))}
          </select>
        </div>

        {isAdmin && typeof saveEntry === 'function' && (
          <button
            type="button"
            onClick={async () => {
              const { folioPersona } = handleApplyToElement();
              const targetMcmId = fields.dbmId || `mcm_${Date.now()}`;
              const existingMcm = mcmPresetsList.find((m) => String(m.id) === String(targetMcmId));
              const rawMcmRecord = convertFolioToMcmRecord(folioPersona, {
                id: targetMcmId
              });
              const mcmRecord = existingMcm
                ? {
                    ...existingMcm,
                    ...Object.fromEntries(
                      Object.entries(rawMcmRecord).filter(([, v]) => {
                        if (v === '' || v === null || v === undefined) return false;
                        if (Array.isArray(v) && v.length === 0) return false;
                        if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false;
                        return true;
                      })
                    ),
                    id: targetMcmId,
                    updatedAt: rawMcmRecord.updatedAt
                  }
                : rawMcmRecord;
              const res = await saveEntry(mcmRecord, 'modular_characters');
              if (res === false || res?.ok === false) {
                showToast({
                  type: 'error',
                  text: `Failed to save "${mcmRecord.name}" to OmniCortex Modular Character Matrix.`
                });
                return;
              }
              const patch = {
                dbmId: mcmRecord.id,
                dbmRef: mcmRecord.id,
                dbmCategory: 'modular_characters',
                personaSubcategory: 'mcm'
              };
              if (typeof onBatchFieldChange === 'function') {
                onBatchFieldChange(patch);
              } else {
                Object.entries(patch).forEach(([k, v]) => onFieldChange?.(k, v));
              }
              showToast({
                type: res?.localOnly || res?.permissionDenied ? 'warning' : 'success',
                text: res?.localOnly || res?.permissionDenied
                  ? `Saved "${mcmRecord.name}" locally (Cloud OmniCortex requires Admin clearance).`
                  : `Saved "${mcmRecord.name}" to OmniCortex Modular Character Matrix!`
              });
            }}
            className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer"
            title="Save this assembled statblock into OmniCortex / Codex Modular Character Matrix"
          >
            💾 Save to Cortex MCM
          </button>
        )}
      </div>

      {/* Section Tabs (1-4 Canonical Mechanical Assembly — Narrative/Scripting/Custom live in parent Forge) */}
      <div className="flex flex-wrap gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        {[
          { id: 'matrix', label: '1. Matrix & 5-Pillars' },
          { id: 'attributes', label: '2. Attributes & Skills' },
          { id: 'aspects', label: '3. Features, Traits & Augs' },
          { id: 'loadout', label: '4. Weapons, Armor & Gear' }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MATRIX & 5-PILLARS */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* 1. Threat Tier (0-20) */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center justify-between">
                <span>Threat Tier</span>
                <span className="text-amber-300 font-mono font-extrabold">T-{tier} ({calculatedTierTitle})</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={tier}
                onChange={(e) => setTier(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>T0 Minion</span>
                <span>T10 Boss</span>
                <span>T20 Mythic</span>
              </div>
            </div>

            {/* 2. Designation */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                Designation (Allegiance)
              </label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-1.5 rounded-lg text-xs font-semibold outline-none focus:border-cyan-400 font-mono"
              >
                {Object.entries(DESIGNATIONS).map(([k, d]) => (
                  <option key={k} value={k}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Competency Role */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                Competency Role
              </label>
              <select
                value={roleKey}
                onChange={(e) => setRoleKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-purple-300 p-1.5 rounded-lg text-xs font-bold outline-none focus:border-cyan-400 font-mono"
              >
                {Object.entries(COMPETENCY_ROLES)
                  .filter(([k, r]) => r && r.id === k)
                  .map(([k, r]) => (
                    <option key={k} value={k}>{r.name}</option>
                  ))}
              </select>
            </div>

            {/* 4. Boss Type */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                Boss / Hierarchy Scale
              </label>
              <select
                value={bossType}
                onChange={(e) => setBossType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-amber-300 p-1.5 rounded-lg text-xs font-bold outline-none focus:border-cyan-400 font-mono"
              >
                {Object.entries(BOSS_TYPES).map(([k, b]) => (
                  <option key={k} value={k}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* 5. Size & Physiology */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                Size Class
              </label>
              <select
                value={speciesSize}
                onChange={(e) => setSpeciesSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
              >
                {Object.keys(SPECIES_SIZES).map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attribute Chassis Archetype Selector */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                Attribute Chassis Preset
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Active: <strong className="text-cyan-200">{activeChassis.name}</strong> ({activeChassis.label})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(CHASSIS_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setChassisKey(key)}
                  className={`px-2.5 py-1.5 rounded-lg text-left border transition-all cursor-pointer ${
                    chassisKey === key
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950/80 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold">{preset.name}</div>
                  <div className="text-[9px] font-mono text-slate-400">{preset.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 5-Pillar Identity Row (Aligned with Persona Folio) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">1. Species</label>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
              >
                <option value="">-- Select Species --</option>
                {speciesList.map((sp, idx) => (
                  <option key={sp.id || idx} value={sp.name || sp.title}>{sp.name || sp.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">2. Archetype</label>
              <select
                value={selectedArchetype}
                onChange={(e) => setSelectedArchetype(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
              >
                <option value="">-- Select Archetype --</option>
                {archetypesList.map((ar, idx) => (
                  <option key={ar.id || idx} value={ar.name || ar.title}>{ar.name || ar.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">3. Occupation</label>
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
              >
                <option value="">-- Select Occupation --</option>
                {occupationsList.map((occ, idx) => (
                  <option key={occ.id || idx} value={occ.name || occ.title}>{occ.name || occ.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">4. Origin</label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
              >
                <option value="">-- Select Origin --</option>
                {originsList.map((or, idx) => (
                  <option key={or.id || idx} value={or.name || or.title}>{or.name || or.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">5. Faction</label>
              <select
                value={selectedFaction}
                onChange={(e) => setSelectedFaction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
              >
                <option value="">-- Select Faction --</option>
                {factionsList.map((fac, idx) => (
                  <option key={fac.id || idx} value={fac.name || fac.title}>{fac.name || fac.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTRIBUTES & SKILLS */}
      {activeTab === 'attributes' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PRIMARY_ATTR_SCHEMA.map(({ key, label }) => {
              const defaultVal =
                key === 'str' ? (combatBlock.attributes?.str ?? combatBlock.attributeBonus ?? 0) :
                key === 'agi' ? (combatBlock.attributes?.agi ?? combatBlock.secondaryAttrBonus ?? 0) :
                key === 'int' ? (combatBlock.attributes?.int ?? combatBlock.secondaryAttrBonus ?? 0) :
                key === 'sta' ? calculatedToughness :
                key === 'wis' ? (combatBlock.attributes?.wis ?? combatBlock.secondaryAttrBonus ?? 0) :
                (combatBlock.attributes?.cha ?? 0);
              const val = customAttrs[key] !== undefined ? customAttrs[key] : defaultVal;
              return (
                <div key={key} className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-300">{label}</span>
                  <input
                    type="number"
                    min="-2"
                    max="15"
                    value={val}
                    onChange={(e) => setCustomAttrs((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-700 text-amber-300 p-1 rounded text-xs font-mono font-bold text-center"
                  />
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-[10px] font-mono font-bold uppercase text-cyan-400 mb-2">
              Canonical Skill Ranks (Folio Synced)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {CANONICAL_SKILLS_REGISTRY.map((sk) => (
                <div key={sk.id} className="flex items-center justify-between bg-slate-950/90 border border-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-300 truncate">{sk.name}</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={skillRanks[sk.id] ?? (sk.category === 'Combat' ? Math.min(5, Math.ceil(tier / 3)) : 0)}
                    onChange={(e) => setSkillRanks((prev) => ({ ...prev, [sk.id]: Number(e.target.value) }))}
                    className="w-11 bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] font-mono font-bold text-center rounded p-0.5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEATURES, TRAITS, HINDRANCES, AUGMENTATIONS & METAPHYSICS */}
      {activeTab === 'aspects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-cyan-400">Feature</label>
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono"
            >
              <option value="">Role Default: {activeRoleObj?.feature?.split(':')[0] || activeRoleObj?.name || 'Standard'}</option>
              {featuresList.map((f, idx) => (
                <option key={f.id || idx} value={f.name || f.title}>{f.name || f.title}</option>
              ))}
            </select>
            {renderArrayChips('features', selectedFeature, setSelectedFeature, 'selectedFeature', 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200')}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-emerald-400">Trait</label>
            <select
              value={selectedTrait}
              onChange={(e) => setSelectedTrait(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono"
            >
              <option value="">-- Optional Trait --</option>
              {traitsList.map((t, idx) => (
                <option key={t.id || idx} value={t.name || t.title}>{t.name || t.title}</option>
              ))}
            </select>
            {renderArrayChips('traits', selectedTrait, setSelectedTrait, 'selectedTrait', 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200')}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-rose-400">Hindrance</label>
            <select
              value={selectedDisadvantage}
              onChange={(e) => setSelectedDisadvantage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono"
            >
              <option value="">-- Optional Hindrance --</option>
              {disadvantagesList.map((d, idx) => (
                <option key={d.id || idx} value={d.name || d.title}>{d.name || d.title}</option>
              ))}
            </select>
            {renderArrayChips('disadvantages', selectedDisadvantage, setSelectedDisadvantage, 'selectedDisadvantage', 'bg-rose-950/70 border-rose-500/40 text-rose-200')}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-amber-400">Augmentation</label>
            <select
              value={selectedAugmentation}
              onChange={(e) => setSelectedAugmentation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono"
            >
              <option value="">-- Optional Cyber/Bio Aug --</option>
              {augmentationsList.map((a, idx) => (
                <option key={a.id || idx} value={a.name || a.title}>{a.name || a.title}</option>
              ))}
            </select>
            {renderArrayChips('augmentations', selectedAugmentation, setSelectedAugmentation, 'selectedAugmentation', 'bg-amber-950/70 border-amber-500/40 text-amber-200')}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-purple-400">Metaphysics</label>
            <select
              value={selectedInvocation}
              onChange={(e) => setSelectedInvocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono"
            >
              <option value="">-- Optional Invocation --</option>
              {metaphysicsList.map((m, idx) => (
                <option key={m.id || idx} value={m.name || m.title}>{m.name || m.title}</option>
              ))}
            </select>
            {renderArrayChips('invocations', selectedInvocation, setSelectedInvocation, 'selectedInvocation', 'bg-purple-950/70 border-purple-500/40 text-purple-200')}
          </div>
        </div>
      )}

      {/* TAB 4: WEAPONS, ARMOR & GEAR */}
      {activeTab === 'loadout' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Primary Weapon</label>
            <select
              value={selectedWeapon}
              onChange={(e) => setSelectedWeapon(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
            >
              <option value="">Default ({calculatedBaseDamageDice})</option>
              {weaponsList.map((w, idx) => (
                <option key={w.id || idx} value={w.name || w.title}>{w.name || w.title}</option>
              ))}
            </select>
            {renderArrayChips('weapons', selectedWeapon, setSelectedWeapon, 'weapon', 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200')}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Equipped Armoring</label>
            <select
              value={selectedArmor}
              onChange={(e) => setSelectedArmor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
            >
              <option value="">Default (DR {effectiveArmorDR})</option>
              {armorsList.map((a, idx) => (
                <option key={a.id || idx} value={a.name || a.title}>{a.name || a.title}</option>
              ))}
            </select>
            {renderArrayChips('armor', selectedArmor, setSelectedArmor, 'selectedArmor', 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200')}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Tactical Gear / Utility</label>
            <select
              value={selectedGear}
              onChange={(e) => setSelectedGear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
            >
              <option value="">-- Optional Gear --</option>
              {gearList.map((g, idx) => (
                <option key={g.id || idx} value={g.name || g.title}>{g.name || g.title}</option>
              ))}
            </select>
            {renderArrayChips('gear', selectedGear, setSelectedGear, 'selectedGear', 'bg-amber-950/70 border-amber-500/40 text-amber-200')}
          </div>
        </div>
      )}

      {/* Real-Time Calculated Vitals Strip & Auto-Sync Status */}
      <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/50 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Health / Structure */}
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-rose-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">
              {isSyntheticSpecies ? 'Structure:' : 'Health:'}
            </span>
            <span className="text-xs font-mono font-extrabold text-rose-300">{calculatedHealth}</span>
          </div>

          {/* Vitality */}
          {!isSyntheticSpecies && (
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-[10px] font-mono uppercase text-slate-400">Vitality:</span>
              <span className="text-xs font-mono font-extrabold text-cyan-300">{calculatedVitality}</span>
            </div>
          )}

          {/* Defense DC */}
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-amber-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">Defense DC:</span>
            <span className="text-xs font-mono font-extrabold text-amber-300">{calculatedDefense}</span>
          </div>

          {/* Attack Bonus */}
          <div className="flex items-center gap-1.5">
            <Crosshair size={14} className="text-purple-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">Atk / Dmg:</span>
            <span className="text-xs font-mono font-extrabold text-purple-300">
              +{calculatedAttackBonus} ({calculatedBaseDamageDice})
            </span>
          </div>

          {/* Actions & DR */}
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">DR / Act:</span>
            <span className="text-xs font-mono font-extrabold text-emerald-300">
              DR {effectiveArmorDR}+{calculatedToughness} • {combatBlock.actionsPerRound ?? 1} Act
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${appliedNotification ? 'text-emerald-300 animate-pulse' : 'text-emerald-400/80'}`}>
            <Check size={12} /> {appliedNotification ? 'Synced to Persona & VTT!' : 'Auto-Synced to Persona & VTT'}
          </span>
          <button
            type="button"
            onClick={handleApplyToElement}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={13} />
            <span>Re-Sync Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModularCharacterAssembler;
