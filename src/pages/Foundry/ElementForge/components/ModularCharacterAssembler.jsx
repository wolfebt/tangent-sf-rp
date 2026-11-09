import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useDBM } from '../../../../context/DBMContext';
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
  resolveDesignationKey,
  FOLIO_NARRATIVE_SECTIONS
} from '../../../../utils/personaBridge';
import { NpcScriptBuilder } from './NpcScriptBuilder';
import AimeGuidanceDeck from './AimeGuidanceDeck';
import {
  Shield, Swords, Zap, Heart, Activity,
  Sparkles, Check, RefreshCw, Wand2, User, Crosshair,
  ExternalLink, Plus, Trash2, BookOpen, Cpu
} from 'lucide-react';

const PRIMARY_ATTR_SCHEMA = [
  { key: 'str', label: 'STR', subs: [{ key: 'might', label: 'Might' }, { key: 'reflex', label: 'Reflex' }] },
  { key: 'agi', label: 'AGI', subs: [{ key: 'coordination', label: 'Coord' }, { key: 'quickness', label: 'Quick' }] },
  { key: 'sta', label: 'STA', subs: [{ key: 'endurance', label: 'Endur' }, { key: 'vigor', label: 'Vigor' }] },
  { key: 'int', label: 'INT', subs: [{ key: 'reason', label: 'Reason' }, { key: 'intuition', label: 'Intuit' }] },
  { key: 'wil', label: 'WIL', subs: [{ key: 'resolve', label: 'Resolve' }, { key: 'composure', label: 'Compos' }] },
  { key: 'cha', label: 'CHA', subs: [{ key: 'presence', label: 'Pres' }, { key: 'manipulation', label: 'Manip' }] }
];

const CHASSIS_PRESETS = {
  combatant: { name: 'Combatant', label: 'STR +3, AGI +2', str: 3, agi: 2, sta: 2, int: 0, wil: 1, cha: 0 },
  specialist: { name: 'Specialist', label: 'INT +3, AGI +2', str: 0, agi: 2, sta: 1, int: 3, wil: 1, cha: 1 },
  socialite: { name: 'Socialite', label: 'CHA +3, WIL +2', str: 0, agi: 1, sta: 1, int: 1, wil: 2, cha: 3 },
  balanced: { name: 'Balanced', label: '+1 All Attributes', str: 1, agi: 1, sta: 1, int: 1, wil: 1, cha: 1 }
};

export const ModularCharacterAssembler = ({
  fields = {},
  onFieldChange,
  elementTitle = '',
  onOpenAimeGuidance = null
}) => {
  const navigate = useNavigate();
  const { dbData, saveEntry } = useDBM() || { dbData: {} };

  // Live collections from Omnicortex DBM
  const speciesList = dbData?.species || [];
  const archetypesList = dbData?.archetypes || [];
  const occupationsList = dbData?.occupations || [];
  const originsList = dbData?.origins || [];
  const factionsList = dbData?.factions || [];
  const featuresList = dbData?.features || [];
  const traitsList = dbData?.traits || [];
  const disadvantagesList = dbData?.disadvantages || [];
  const augmentationsList = dbData?.augmentations || [];
  const metaphysicsList = dbData?.metaphysics || [];
  const weaponsList = dbData?.weaponry || [];
  const armorsList = dbData?.armoring || [];
  const gearList = dbData?.equipment || [];
  const mcmPresetsList = dbData?.modular_characters || [];

  const [selectedMcmPresetId, setSelectedMcmPresetId] = useState('');
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'attributes' | 'aspects' | 'loadout' | 'narrative' | 'scripting' | 'custom-fields'
  const [activeNarrativeSec, setActiveNarrativeSec] = useState('profile');

  const customFields = useMemo(() => {
    const raw = fields.customFields;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }, [fields.customFields]);

  const handleAddCustomField = () => {
    const next = [...customFields, { id: uuidv4(), label: '', value: '' }];
    onFieldChange?.('customFields', next);
  };

  const handleUpdateCustomField = (id, key, val) => {
    const next = customFields.map((cf) => (cf.id === id ? { ...cf, [key]: val } : cf));
    onFieldChange?.('customFields', next);
  };

  const handleRemoveCustomField = (id) => {
    const next = customFields.filter((cf) => cf.id !== id);
    onFieldChange?.('customFields', next);
  };

  // Canonical MCM Core Configuration (Tiers 0-20)
  const [tier, setTier] = useState(() => {
    const parsed = parseInt(fields.mcmTier ?? '1', 10);
    return Number.isNaN(parsed) ? 1 : Math.max(0, Math.min(20, parsed));
  });
  const [designation, setDesignation] = useState(() => resolveDesignationKey(fields.mcmDesignation || fields['char-role'] || 'Adversary'));
  const [chassisKey, setChassisKey] = useState(fields.mcmChassis?.toLowerCase() || 'combatant');
  const [roleKey, setRoleKey] = useState(() => resolveCompetencyRoleKey(fields.mcmRole || 'SKIRMISHER'));
  const [bossType, setBossType] = useState(() => resolveBossTypeKey(fields.bossType || 'STANDARD', parseInt(fields.mcmTier ?? '1', 10) || 1));
  const [speciesSize, setSpeciesSize] = useState(fields.speciesSize || 'Medium');

  // 5-Pillar Identity
  const [selectedSpecies, setSelectedSpecies] = useState(fields['char-species'] || '');
  const [selectedArchetype, setSelectedArchetype] = useState(fields['char-archetype'] || '');
  const [selectedOccupation, setSelectedOccupation] = useState(fields['char-occu'] || '');
  const [selectedOrigin, setSelectedOrigin] = useState(fields['char-origin'] || '');
  const [selectedFaction, setSelectedFaction] = useState(fields['char-faction'] || '');

  // Custom Attribute & Skill Overrides
  const [customAttrs, setCustomAttrs] = useState(() => ({
    str: fields['attr-str-base'],
    agi: fields['attr-agi-base'],
    sta: fields['attr-sta-base'],
    int: fields['attr-int-base'],
    wil: fields['attr-wil-base'],
    cha: fields['attr-cha-base']
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
  const [selectedWeapon, setSelectedWeapon] = useState(fields.weapon || '');
  const [selectedArmor, setSelectedArmor] = useState(fields.armor || '');
  const [selectedGear, setSelectedGear] = useState(fields.gear || '');
  const [selectedFeature, setSelectedFeature] = useState(fields.selectedFeature || '');
  const [selectedTrait, setSelectedTrait] = useState(fields.selectedTrait || '');
  const [selectedDisadvantage, setSelectedDisadvantage] = useState(fields.selectedDisadvantage || '');
  const [selectedAugmentation, setSelectedAugmentation] = useState(fields.selectedAugmentation || '');
  const [selectedInvocation, setSelectedInvocation] = useState(fields.selectedInvocation || '');

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);

  const isSyntheticSpecies =
    fields.physiology === 'Synthetic' ||
    String(selectedSpecies || '').toLowerCase().includes('synthetic') ||
    String(selectedSpecies || '').toLowerCase().includes('automata');

  const activeChassis = CHASSIS_PRESETS[chassisKey] || CHASSIS_PRESETS.combatant;
  const activeRoleObj = COMPETENCY_ROLES[roleKey] || COMPETENCY_ROLES.SKIRMISHER;

  // Lookup Armor DR from selected Armor if available
  const selectedArmorObj = useMemo(
    () => armorsList.find((a) => (a.name || a.title) === selectedArmor),
    [armorsList, selectedArmor]
  );
  const armorDRValue = useMemo(() => {
    if (selectedArmorObj?.dr !== undefined) return Number(selectedArmorObj.dr) || 0;
    return Math.max(0, Math.floor(tier / 2) + (roleKey === 'DEFENDER' || roleKey === 'BRUTE' ? 3 : 1));
  }, [selectedArmorObj, tier, roleKey]);

  // Canonical Combat Stat Block via tangentEntityEngines
  const combatBlock = useMemo(() => {
    return calculateNPCCombatBlock({
      name: elementTitle || `${designation} ${activeRoleObj.name}`,
      threatTier: tier,
      competencyRoleKey: roleKey,
      bossTypeKey: bossType,
      designationKey: designation,
      sizeKey: speciesSize,
      isSynthetic: isSyntheticSpecies,
      armorDR: armorDRValue,
      staminaDR: customAttrs.sta !== undefined ? Number(customAttrs.sta) : undefined
    });
  }, [elementTitle, tier, roleKey, bossType, designation, speciesSize, isSyntheticSpecies, armorDRValue, customAttrs.sta]);

  const calculatedHealth = isSyntheticSpecies ? combatBlock.structurePoints : combatBlock.healthPoints;
  const calculatedVitality = isSyntheticSpecies ? 0 : combatBlock.vitalityPoints;
  const calculatedToughness = combatBlock.staminaDR;
  const calculatedDefense = combatBlock.defenseDC;
  const calculatedAttackBonus = combatBlock.attackBonus;

  // Build Complete MCM Payload aligned with Persona Folio
  const buildFullMcmConfig = () => {
    const weapObj = weaponsList.find((w) => (w.name || w.title) === selectedWeapon);
    const gearObj = gearList.find((g) => (g.name || g.title) === selectedGear);
    const featObj = featuresList.find((f) => (f.name || f.title) === selectedFeature);
    const traitObj = traitsList.find((t) => (t.name || t.title) === selectedTrait);
    const disObj = disadvantagesList.find((d) => (d.name || d.title) === selectedDisadvantage);
    const augObj = augmentationsList.find((a) => (a.name || a.title) === selectedAugmentation);
    const invObj = metaphysicsList.find((m) => (m.name || m.title) === selectedInvocation);

    return {
      id: fields.dbmId || `mcm_${Date.now()}`,
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
      structurePoints: combatBlock.structurePoints,
      armorDR: combatBlock.armorDR,
      staminaDR: calculatedToughness,
      defenseDC: calculatedDefense,
      attackBonus: calculatedAttackBonus,
      actionsPerRound: combatBlock.actionsPerRound,
      primaryAttributes: {
        str: customAttrs.str !== undefined ? Number(customAttrs.str) : combatBlock.primaryAttrBonus,
        agi: customAttrs.agi !== undefined ? Number(customAttrs.agi) : combatBlock.secondaryAttrBonus,
        sta: customAttrs.sta !== undefined ? Number(customAttrs.sta) : calculatedToughness,
        int: customAttrs.int !== undefined ? Number(customAttrs.int) : combatBlock.secondaryAttrBonus,
        wil: customAttrs.wil !== undefined ? Number(customAttrs.wil) : combatBlock.tertiaryAttrBonus,
        cha: customAttrs.cha !== undefined ? Number(customAttrs.cha) : combatBlock.tertiaryAttrBonus
      },
      skills: skillRanks,
      weapons: selectedWeapon
        ? [weapObj || { id: 'wpn_1', name: selectedWeapon, damage: combatBlock.baseDamageDice, range: 'Medium', type: 'Tactical' }]
        : [{ id: 'wpn_default', name: `${activeRoleObj.name} Armament`, damage: combatBlock.baseDamageDice, range: 'Medium', type: 'Tactical' }],
      armor: selectedArmor
        ? [selectedArmorObj || { id: 'arm_1', name: selectedArmor, dr: combatBlock.armorDR, equipped: true }]
        : combatBlock.armorDR > 0
          ? [{ id: 'arm_default', name: 'Tactical Plating', dr: combatBlock.armorDR, equipped: true }]
          : [],
      gear: selectedGear ? [gearObj || { id: 'gear_1', name: selectedGear }] : [],
      features: selectedFeature ? [featObj || { id: 'feat_1', name: selectedFeature }] : [],
      traits: selectedTrait ? [traitObj || { id: 'trait_1', name: selectedTrait }] : [],
      disadvantages: selectedDisadvantage ? [disObj || { id: 'dis_1', name: selectedDisadvantage }] : [],
      augmentations: selectedAugmentation ? [augObj || { id: 'aug_1', name: selectedAugmentation }] : [],
      invocations: selectedInvocation ? [invObj || { id: 'inv_1', name: selectedInvocation }] : [],
      concept: fields['char-concept'] || `${combatBlock.tierTitle} ${activeRoleObj.name} (${designation})`,
      motive: fields['char-motive'] || '',
      conflict: fields['char-conflict'] || '',
      theLie: fields.theLie || '',
      theTruth: fields.theTruth || '',
      definingTrauma: fields.definingTrauma || '',
      appearance: fields.appearance || '',
      voiceProfile: fields.voiceProfile || '',
      mannerisms: fields.mannerisms || ''
    };
  };

  // Apply all calculated values and full Persona Folio structure to parent Element form
  const handleApplyToElement = () => {
    AudioService.playTerminalBeep(1150, 0.1);
    const fullConfig = buildFullMcmConfig();
    const folioPersona = convertMcmToFolioPersona(fullConfig);
    const vttUnit = buildVttUnitFromPersona(folioPersona, { uniqueInstance: false });

    onFieldChange?.('personaSubcategory', 'mcm');
    onFieldChange?.('mcmTier', String(tier));
    onFieldChange?.('mcmDesignation', designation);
    onFieldChange?.('mcmChassis', activeChassis.name);
    onFieldChange?.('mcmRole', activeRoleObj.name);
    onFieldChange?.('bossType', bossType);
    onFieldChange?.('speciesSize', speciesSize);
    onFieldChange?.('physiology', isSyntheticSpecies ? 'Synthetic' : 'Organic');
    onFieldChange?.('health', String(calculatedHealth));
    onFieldChange?.('vitality', String(calculatedVitality));
    onFieldChange?.('structurePoints', String(combatBlock.structurePoints));
    onFieldChange?.('toughness', String(calculatedToughness));
    onFieldChange?.('armorDR', String(combatBlock.armorDR));
    onFieldChange?.('defense', String(calculatedDefense));
    onFieldChange?.('attackBonus', String(calculatedAttackBonus));
    onFieldChange?.('actionsPerRound', String(combatBlock.actionsPerRound));
    onFieldChange?.('damageDice', combatBlock.baseDamageDice);

    // 5-Pillar Sync
    if (selectedSpecies) onFieldChange?.('char-species', selectedSpecies);
    if (selectedArchetype) onFieldChange?.('char-archetype', selectedArchetype);
    if (selectedOccupation) onFieldChange?.('char-occu', selectedOccupation);
    if (selectedOrigin) onFieldChange?.('char-origin', selectedOrigin);
    if (selectedFaction) onFieldChange?.('char-faction', selectedFaction);

    // Primary + Sub Attributes Sync
    PRIMARY_ATTR_SCHEMA.forEach(({ key, subs }) => {
      onFieldChange?.(`attr-${key}-base`, folioPersona[`attr-${key}-base`]);
      subs.forEach((s) => {
        onFieldChange?.(`sub-${s.key}-bonus`, folioPersona[`sub-${s.key}-bonus`]);
      });
    });

    // Canonical Skills Sync
    CANONICAL_SKILLS_REGISTRY.forEach((sk) => {
      onFieldChange?.(`skill-${sk.id}-rank`, folioPersona[`skill-${sk.id}-rank`] ?? 0);
    });

    // Loadout & Aspects Sync
    if (selectedWeapon) onFieldChange?.('weapon', selectedWeapon);
    if (selectedArmor) onFieldChange?.('armor', selectedArmor);
    if (selectedGear) onFieldChange?.('gear', selectedGear);
    if (selectedFeature) onFieldChange?.('selectedFeature', selectedFeature);
    if (selectedTrait) onFieldChange?.('selectedTrait', selectedTrait);
    if (selectedDisadvantage) onFieldChange?.('selectedDisadvantage', selectedDisadvantage);
    if (selectedAugmentation) onFieldChange?.('selectedAugmentation', selectedAugmentation);
    if (selectedInvocation) onFieldChange?.('selectedInvocation', selectedInvocation);

    onFieldChange?.('features', folioPersona.features);
    onFieldChange?.('traits', folioPersona.traits);
    onFieldChange?.('disadvantages', folioPersona.disadvantages);
    onFieldChange?.('augmentations', folioPersona.augmentations);
    onFieldChange?.('invocations', folioPersona.invocations);
    onFieldChange?.('weapons', folioPersona.weapons);
    onFieldChange?.('gear', folioPersona.gear);
    onFieldChange?.('attacks', folioPersona.attacks);
    onFieldChange?.('vttUnitData', vttUnit);
    onFieldChange?.('isReadyForVtt', true);

    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2500);
    return { fullConfig, folioPersona, vttUnit };
  };

  // Send to Persona Folio
  const handleSendToFolio = (openFolioAfter = false) => {
    const { fullConfig } = handleApplyToElement();
    const sent = sendMcmToFolioRoster(fullConfig, {
      lockForVtt: !openFolioAfter,
      openInFolio: true
    });
    showToast({
      type: 'success',
      text: openFolioAfter
        ? `Sent "${sent.character_name}" to Persona Folio — opening Folio...`
        : `Sent "${sent.character_name}" to Persona Folio Roster (VTT & Folio Ready)!`
    });
    if (openFolioAfter) {
      navigate('/folio');
    }
  };

  // 1-Click AIME Modular Assembly
  const handleAimeAutoAssemble = async () => {
    setIsSynthesizing(true);
    AudioService.playTerminalBeep(980, 0.08);

    const prompt = `You are AIME assisting with a Modular Character build in the Tangent SFF RPG ADE.
Character Concept: "${elementTitle || 'Combatant Operative'}"
Designation: "${designation}"
Current Tier: ${tier}

Select the most thematic configuration from:
1. Chassis: combatant, specialist, socialite, or balanced
2. Tactical Role: BRUTE, SOLDIER, SKIRMISHER, ARTILLERY, CONTROLLER, LURKER, DEFENDER, LEADER, SUPPORT, or MINION
3. Suggest a live Omnicortex weapon and armor matching Tech Level 3.

Respond in JSON format:
{
  "chassis": "combatant",
  "role": "SOLDIER",
  "suggestedWeapon": "Plasma Carbine",
  "suggestedArmor": "Tactical Combat Vest",
  "rationale": "Brief 1-sentence tactical explanation"
}`;

    try {
      const responseText = await generateContent({ prompt });
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
                const nextRole = resolveCompetencyRoleKey(preset.competencyRole || preset.role || 'SKIRMISHER');
                const nextDes = resolveDesignationKey(preset.designation || 'Adversary');
                const nextBoss = resolveBossTypeKey(preset.bossType || 'STANDARD', nextTier);
                setTier(nextTier);
                setRoleKey(nextRole);
                setDesignation(nextDes);
                setBossType(nextBoss);
                if (preset.species) setSelectedSpecies(preset.species);
                if (preset.archetype) setSelectedArchetype(preset.archetype);
                if (preset.occupation) setSelectedOccupation(preset.occupation);
                if (preset.origin) setSelectedOrigin(preset.origin);
                if (preset.faction) setSelectedFaction(preset.faction);
                onFieldChange?.('mcmTier', String(nextTier));
                onFieldChange?.('mcmDesignation', nextDes);
                onFieldChange?.('mcmRole', COMPETENCY_ROLES[nextRole]?.name || nextRole);
                onFieldChange?.('health', String(preset.healthPoints ?? 30));
                onFieldChange?.('vitality', String(preset.vitalityPoints ?? 30));
                onFieldChange?.('personaSubcategory', 'mcm');
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

        {typeof saveEntry === 'function' && (
          <button
            type="button"
            onClick={async () => {
              const { folioPersona } = handleApplyToElement();
              const mcmRecord = convertFolioToMcmRecord(folioPersona, {
                id: fields.dbmId || `mcm_${Date.now()}`
              });
              await saveEntry(mcmRecord, 'modular_characters');
              onFieldChange?.('personaSubcategory', 'mcm');
              showToast({
                type: 'success',
                text: `Saved "${mcmRecord.name}" to OmniCortex Modular Character Matrix!`
              });
            }}
            className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer"
            title="Save this assembled statblock into OmniCortex / Codex Modular Character Matrix"
          >
            💾 Save to Cortex MCM
          </button>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        {[
          { id: 'matrix', label: '1. Matrix & 5-Pillars' },
          { id: 'attributes', label: '2. Attributes & Skills' },
          { id: 'aspects', label: '3. Features, Traits & Augs' },
          { id: 'loadout', label: '4. Weapons, Armor & Gear' },
          { id: 'narrative', label: '5. Narrative, Prose & Lore' },
          { id: 'scripting', label: '6. Scripting & AI Guidance' },
          { id: 'custom-fields', label: `7. Custom Fields${customFields.length > 0 ? ` (${customFields.length})` : ''}` }
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
                <span className="text-amber-300 font-mono font-extrabold">T-{tier} ({combatBlock.tierTitle})</span>
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
                {Object.entries(COMPETENCY_ROLES).map(([k, r]) => (
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
                  <option key={k} value={k}>{b.name} (x{b.hpMult} HP, {b.actions} Act)</option>
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
                key === 'str' ? combatBlock.primaryAttrBonus :
                key === 'agi' || key === 'int' ? combatBlock.secondaryAttrBonus :
                key === 'sta' ? calculatedToughness :
                combatBlock.tertiaryAttrBonus;
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
              <option value="">Role Default: {activeRoleObj.roleFeature?.split(':')[0]}</option>
              {featuresList.map((f, idx) => (
                <option key={f.id || idx} value={f.name || f.title}>{f.name || f.title}</option>
              ))}
            </select>
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
              <option value="">Default ({combatBlock.baseDamageDice})</option>
              {weaponsList.map((w, idx) => (
                <option key={w.id || idx} value={w.name || w.title}>{w.name || w.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Equipped Armoring</label>
            <select
              value={selectedArmor}
              onChange={(e) => setSelectedArmor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
            >
              <option value="">Default (DR {combatBlock.armorDR})</option>
              {armorsList.map((a, idx) => (
                <option key={a.id || idx} value={a.name || a.title}>{a.name || a.title}</option>
              ))}
            </select>
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
          </div>
        </div>
      )}

      {/* TAB 5: NARRATIVE, PROSE & LORE (ALL PERSONA FOLIO NARRATIVE SECTIONS) */}
      {activeTab === 'narrative' && (
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-cyan-300">
              Persona Folio Narrative Sections &amp; Lore
            </span>
            <div className="flex flex-wrap gap-1">
              {FOLIO_NARRATIVE_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveNarrativeSec(sec.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                    activeNarrativeSec === sec.id
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const activeSec =
              FOLIO_NARRATIVE_SECTIONS.find((s) => s.id === activeNarrativeSec) ||
              FOLIO_NARRATIVE_SECTIONS[0];
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeSec.fields.map((nf) => {
                  const val =
                    fields[nf.id] ||
                    (nf.aliasKeys || []).map((k) => fields[k]).find(Boolean) ||
                    '';
                  return (
                    <div key={nf.id} className={nf.span2 ? 'sm:col-span-2' : ''}>
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                        {nf.label}
                      </label>
                      <textarea
                        rows={nf.span2 ? 2 : 1}
                        value={val}
                        onChange={(e) => {
                          const nextVal = e.target.value;
                          onFieldChange?.(nf.id, nextVal);
                          (nf.aliasKeys || []).forEach((aliasKey) => {
                            onFieldChange?.(aliasKey, nextVal);
                          });
                        }}
                        placeholder={nf.placeholder}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="pt-2 border-t border-slate-800 space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-cyan-300 block">
              Detailed Description, Narrative Prose &amp; Lore
            </label>
            <textarea
              rows={3}
              value={fields.narrativeProse || fields.content || ''}
              onChange={(e) => {
                onFieldChange?.('narrativeProse', e.target.value);
                onFieldChange?.('content', e.target.value);
              }}
              placeholder="Write extended narrative prose, lore notes, or character dossier exposition..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      )}

      {/* TAB 6: SCRIPTING & AI GUIDANCE */}
      {activeTab === 'scripting' && (
        <div className="space-y-3">
          <NpcScriptBuilder
            fields={fields}
            onFieldChange={onFieldChange}
            elementTitle={elementTitle || fields['char-name'] || 'MCM Unit'}
            onOpenAimeGuidance={onOpenAimeGuidance}
          />
          <AimeGuidanceDeck
            guidance={fields.guidance || {}}
            onChangeGuidance={(nextGuidance) => onFieldChange?.('guidance', nextGuidance)}
            isCollapsedByDefault={false}
          />
        </div>
      )}

      {/* TAB 7: CUSTOM FIELDS & KEY-VALUE ATTRIBUTES */}
      {activeTab === 'custom-fields' && (
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-cyan-300">
              Custom Fields &amp; Key-Value Attributes
            </span>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-[10px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus size={11} />
              <span>Add Custom Field</span>
            </button>
          </div>

          {customFields.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs italic bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
              No custom fields defined yet. Click &quot;+ Add Custom Field&quot; to attach custom attributes.
            </div>
          ) : (
            <div className="space-y-2">
              {customFields.map((cf, idx) => (
                <div
                  key={cf.id || idx}
                  className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cf.label || ''}
                      onChange={(e) => handleUpdateCustomField(cf.id, 'label', e.target.value)}
                      placeholder="Field Label (e.g. Bounty Value, Clearance)"
                      className="bg-slate-900 border border-slate-700 text-cyan-300 p-1.5 rounded text-xs font-bold outline-none focus:border-cyan-400 flex-1 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(cf.id)}
                      className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      <span>Remove</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={cf.value || ''}
                    onChange={(e) => handleUpdateCustomField(cf.id, 'value', e.target.value)}
                    placeholder="Field value / description..."
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-1.5 rounded text-xs font-mono outline-none focus:border-cyan-400"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Real-Time Calculated Vitals Strip & Apply Action */}
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
              +{calculatedAttackBonus} ({combatBlock.baseDamageDice})
            </span>
          </div>

          {/* Actions & DR */}
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">DR / Act:</span>
            <span className="text-xs font-mono font-extrabold text-emerald-300">
              DR {combatBlock.armorDR}+{calculatedToughness} • {combatBlock.actionsPerRound} Act
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {appliedNotification && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse flex items-center gap-1">
              <Check size={12} /> Synced to Persona & VTT!
            </span>
          )}
          <button
            type="button"
            onClick={handleApplyToElement}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={13} />
            <span>Apply Modular Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModularCharacterAssembler;
