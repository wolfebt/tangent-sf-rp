import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  Users, 
  Shield, 
  Crosshair, 
  Zap, 
  Crown, 
  Heart, 
  Activity, 
  Sparkles, 
  Sliders, 
  Award, 
  Skull, 
  Radio,
  Send,
  ExternalLink,
  Plus,
  Trash2,
  Dna,
  Brain,
  Swords,
  BookOpen,
  RefreshCw,
  Bot
} from 'lucide-react';
import { 
  THREAT_TIER_CHASSIS, 
  COMPETENCY_ROLES, 
  DESIGNATIONS, 
  BOSS_TYPES, 
  TACTICAL_BEHAVIORS, 
  SPECIES_SIZES 
} from '../../../engines/tangentConstants';
import { calculateNPCCombatBlock } from '../../../engines/tangentEntityEngines';
import { ALL_CANONICAL_SKILLS, resolveCanonicalSkillAlias } from '../../../data/skillsData';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
import { DEFAULT_OCCUPATIONS } from '../../../data/occupationsData';
import { useDBM } from '../../../context/DBMContext';
import { useStory } from '../../../context/CampaignContext';
import { showToast } from '../../../context/ToastContext';
import {
  sendMcmToFolioRoster,
  convertMcmToFolioPersona,
  FOLIO_NARRATIVE_SECTIONS
} from '../../../utils/personaBridge';
import AimeThreeTierStack from '../../Foundry/ElementForge/components/AimeThreeTierStack';
import { NpcScriptBuilder } from '../../Foundry/ElementForge/components/NpcScriptBuilder';

const PRIMARY_ATTR_DEFS = [
  { key: 'attr-strength', short: 'str', label: 'Strength (STR)', subKey: 'attr-might', subLabel: 'Might (MGT)', saveName: 'Might' },
  { key: 'attr-agility', short: 'agi', label: 'Agility (AGI)', subKey: 'attr-reflex', subLabel: 'Reflex (REF)', saveName: 'Reflex' },
  { key: 'attr-stamina', short: 'sta', label: 'Stamina (STA)', subKey: 'attr-fortitude', subLabel: 'Fortitude (FOR)', saveName: 'Fortitude' },
  { key: 'attr-intellect', short: 'int', label: 'Intellect (INT)', subKey: 'attr-logic', subLabel: 'Reason (RSN)', saveName: 'Reason' },
  { key: 'attr-wisdom', short: 'wis', label: 'Wisdom (WIS)', subKey: 'attr-will', subLabel: 'Willpower (WIL)', saveName: 'Willpower' },
  { key: 'attr-charisma', short: 'cha', label: 'Charisma (CHA)', subKey: 'attr-etiquette', subLabel: 'Etiquette (ETI)', saveName: 'Etiquette' }
];

const CHASSIS_MODES = [
  { id: 'Biological', label: 'Biological (Vitality + Health Pools)' },
  { id: 'Synthetic', label: 'Synthetic / Construct (Structure Points Only)' },
  { id: 'NonCorporeal', label: 'Non-Corporeal / Cosmic Entity (-75 CP, Base 60 SP + WIS×10)' }
];

const ARCHETYPE_OPTIONS = [
  'Everyman', 'Special', 'Augmented', 'Cyborg', 'Synthetic', 'Mutant', 'Awakened', 'Esper', 'Mage', 'Monster'
];

export const ModularStatBlockConfigurator = ({ formData = {}, onChange }) => {
  const navigate = useNavigate();
  const { dbData } = useDBM() || {};
  const storyCtx = useStory() || {};
  const [activeSubTab, setActiveSubTab] = useState('matrix');
  const [activeNarrativeSec, setActiveNarrativeSec] = useState('profile');
  const [skillToAdd, setSkillToAdd] = useState('');
  const [customItemText, setCustomItemText] = useState({
    features: '',
    traits: '',
    disadvantages: '',
    augmentations: '',
    invocations: '',
    weapons: '',
    armor: '',
    gear: ''
  });

  const customFields = useMemo(() => {
    const raw = formData.customFields;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }, [formData.customFields]);

  const handleAddCustomField = () => {
    onChange('customFields', [...customFields, { id: uuidv4(), label: '', value: '' }]);
  };

  const handleUpdateCustomField = (id, key, val) => {
    onChange(
      'customFields',
      customFields.map((cf) => (cf.id === id ? { ...cf, [key]: val } : cf))
    );
  };

  const handleRemoveCustomField = (id) => {
    onChange(
      'customFields',
      customFields.filter((cf) => cf.id !== id)
    );
  };

  const threatTier = Number(formData.threatTier ?? formData.threat_tier ?? formData.craft_dc ?? 3);
  const selectedRole = formData.competencyRole ?? formData.role ?? 'Tank';
  const selectedDesignation = formData.designation || 'Adversary';
  const selectedBossType = formData.bossType ?? formData.boss_type ?? 'Standard';
  const selectedSize = formData.sizeCategory ?? formData.size ?? 'Medium';
  const chassisMode = formData.chassisMode || formData.chassis_mode || (
    formData.isNonCorporeal || formData.is_non_corporeal
      ? 'NonCorporeal'
      : (formData.isSynthetic || formData.species === 'Synthetic' || formData['char-species'] === 'Synthetic' ? 'Synthetic' : 'Biological')
  );
  const isNonCorporeal = chassisMode === 'NonCorporeal';
  const isSynthetic = chassisMode === 'Synthetic' || isNonCorporeal;
  const selectedBehaviors = Array.isArray(formData.tacticalBehaviors)
    ? formData.tacticalBehaviors
    : (Array.isArray(formData.tactical_behaviors) ? formData.tactical_behaviors : []);

  // Compute live stat block
  const combatBlock = useMemo(() => {
    return calculateNPCCombatBlock({
      tier: threatTier,
      role: selectedRole,
      bossType: selectedBossType,
      size: selectedSize,
      designation: selectedDesignation,
      isSynthetic
    });
  }, [threatTier, selectedRole, selectedBossType, selectedSize, selectedDesignation, isSynthetic]);

  // Compute live Folio preview so all Persona Folio components stay 100% aligned
  const liveFolioPersona = useMemo(() => {
    return convertMcmToFolioPersona(formData, { targetFolio: false });
  }, [formData]);

  // Canonical 6 Saving Throws (+2 + 2*Attr / Passive CR 12 + 2*Attr) & Non-Corporeal SP (60 + WIS*10)
  const canonicalSaves = useMemo(() => {
    const tierDef = THREAT_TIER_CHASSIS[threatTier] || THREAT_TIER_CHASSIS[3] || {};
    const defaultAttr = tierDef.attrBonus ?? combatBlock.attributeBonus ?? 0;
    return PRIMARY_ATTR_DEFS.map(def => {
      const rawAttr = formData[def.key] ?? liveFolioPersona?.[def.key];
      const attrVal = rawAttr !== undefined && rawAttr !== null && rawAttr !== '' ? Number(rawAttr) : defaultAttr;
      const bonus = 2 + attrVal * 2;
      const passiveCR = 12 + attrVal * 2;
      return {
        ...def,
        attrVal,
        bonus,
        passiveCR
      };
    });
  }, [formData, liveFolioPersona, threatTier, combatBlock.attributeBonus]);

  const nonCorporealSP = useMemo(() => {
    const wisEntry = canonicalSaves.find(s => s.short === 'wis');
    const wisScore = wisEntry ? wisEntry.attrVal : (combatBlock.attributeBonus ?? 0);
    return 60 + Math.max(0, wisScore) * 10;
  }, [canonicalSaves, combatBlock.attributeBonus]);

  // Catalog options for 5 Pillars & Loadout
  const speciesOptions = useMemo(() => {
    const raw = Array.isArray(dbData?.species) && dbData.species.length > 0 ? dbData.species : DEFAULT_SPECIES;
    const names = raw.map(s => s?.name || s?.title).filter(Boolean);
    return Array.from(new Set(['Human', 'Synthetic', ...names]));
  }, [dbData?.species]);

  const occupationOptions = useMemo(() => {
    const raw = Array.isArray(dbData?.occupations) && dbData.occupations.length > 0 ? dbData.occupations : DEFAULT_OCCUPATIONS;
    const names = raw.map(o => o?.name || o?.title).filter(Boolean);
    return Array.from(new Set(names));
  }, [dbData?.occupations]);

  const originOptions = useMemo(() => {
    const raw = Array.isArray(dbData?.origins) ? dbData.origins : [];
    const names = raw.map(o => o?.name || o?.title).filter(Boolean);
    return Array.from(new Set(['Core Worlds', 'Frontier Colony', 'Orbital Habitat', 'Deep Space', 'Underhive', ...names]));
  }, [dbData?.origins]);

  const factionOptions = useMemo(() => {
    const raw = Array.isArray(dbData?.factions) ? dbData.factions : [];
    const names = raw.map(f => f?.name || f?.title).filter(Boolean);
    return Array.from(new Set(['Independent', ...names]));
  }, [dbData?.factions]);

  const toggleBehavior = (behavior) => {
    const exists = selectedBehaviors.includes(behavior);
    const updated = exists
      ? selectedBehaviors.filter(b => b !== behavior)
      : [...selectedBehaviors, behavior];
    onChange('tacticalBehaviors', updated);
    onChange('tactical_behaviors', updated);
  };

  const handleTierChange = (val) => {
    const t = Math.max(0, Math.min(20, Number(val)));
    onChange('threatTier', t);
    onChange('threat_tier', t);
    onChange('craft_dc', t);
  };

  const handleSyncAttrsFromRoleAndTier = () => {
    const roleDef = COMPETENCY_ROLES[selectedRole] || COMPETENCY_ROLES.Tank;
    const primaryNames = (roleDef.primaryAttrs || ['Stamina', 'Strength']).map(a => {
      const lower = String(a).toLowerCase();
      return lower === 'precision' ? 'wisdom' : lower;
    });
    const tierDef = THREAT_TIER_CHASSIS[threatTier] || THREAT_TIER_CHASSIS[3] || {};
    const baseBonus = combatBlock.attributeBonus ?? tierDef.attrBonus ?? 1;
    const secBonus = tierDef.secondaryAttrBonus ?? Math.floor(baseBonus * 0.6);
    const tertBonus = Math.max(0, Math.floor(baseBonus * 0.3));

    PRIMARY_ATTR_DEFS.forEach(({ key, subKey }) => {
      const clean = key.replace('attr-', '');
      const val = primaryNames.includes(clean)
        ? baseBonus
        : (clean === 'stamina' || clean === 'agility' ? secBonus : tertBonus);
      onChange(key, val);
      onChange(subKey, 2 + val * 2);
    });
    showToast({
      type: 'info',
      title: 'Attributes Synchronized',
      message: `Synced 6 Primary & 12 Sub-Attributes to Tier ${threatTier} ${roleDef.name}.`
    });
  };

  const handleAttrChange = (attrDef, rawVal) => {
    const val = Math.max(-2, Math.min(20, parseInt(rawVal, 10) || 0));
    onChange(attrDef.key, val);
    onChange(attrDef.subKey, 2 + val * 2);
  };

  // Skills Map management
  const activeSkillsMap = useMemo(() => {
    const map = {};
    if (formData.skills && typeof formData.skills === 'object' && !Array.isArray(formData.skills)) {
      Object.assign(map, formData.skills);
    }
    Object.keys(liveFolioPersona || {}).forEach((k) => {
      if (k.startsWith('skill-') && k.endsWith('-rank')) {
        const sId = k.replace(/^skill-/, '').replace(/-rank$/, '');
        if (map[sId] === undefined) {
          map[sId] = liveFolioPersona[k];
        }
      }
    });
    return map;
  }, [formData.skills, liveFolioPersona]);

  const handleSetSkillRank = (skillId, rankVal) => {
    const r = Math.max(0, Math.min(30, parseInt(rankVal, 10) || 0));
    const nextSkills = { ...activeSkillsMap };
    if (r <= 0) {
      delete nextSkills[skillId];
    } else {
      nextSkills[skillId] = r;
    }
    onChange('skills', nextSkills);
    onChange(`skill-${skillId}-rank`, r);
  };

  const handleAddCanonicalSkill = () => {
    if (!skillToAdd) return;
    const resolved = resolveCanonicalSkillAlias(skillToAdd) || ALL_CANONICAL_SKILLS.find(s => s.id === skillToAdd);
    const sId = resolved ? resolved.id : skillToAdd;
    handleSetSkillRank(sId, combatBlock.secondarySkillRank || 4);
    setSkillToAdd('');
  };

  // Generic Array Item Helpers (Features, Traits, Hindrances, Augmentations, Invocations, Weapons, Armor, Gear)
  const getArrayField = (fieldKey) => {
    const raw = formData[fieldKey] ?? liveFolioPersona?.[fieldKey] ?? [];
    return Array.isArray(raw) ? raw : [];
  };

  const handleAddArrayItem = (fieldKey, itemObjOrText) => {
    if (!itemObjOrText) return;
    const current = getArrayField(fieldKey);
    const entry = typeof itemObjOrText === 'object'
      ? {
          id: itemObjOrText.id || `${fieldKey}_${Date.now()}`,
          name: itemObjOrText.name || itemObjOrText.title || 'Entry',
          description: itemObjOrText.description || itemObjOrText.mechanic || '',
          mechanic: itemObjOrText.mechanic || '',
          ...(itemObjOrText.damage ? { damage: itemObjOrText.damage } : {}),
          ...(itemObjOrText.dr !== undefined ? { dr: itemObjOrText.dr } : {}),
          source: 'MCM Configurator'
        }
      : {
          id: `${fieldKey}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          name: String(itemObjOrText).trim(),
          description: '',
          source: 'MCM Configurator'
        };
    if (!entry.name) return;
    onChange(fieldKey, [...current, entry]);
    setCustomItemText(prev => ({ ...prev, [fieldKey]: '' }));
  };

  const handleRemoveArrayItem = (fieldKey, index) => {
    const current = getArrayField(fieldKey);
    onChange(fieldKey, current.filter((_, idx) => idx !== index));
  };

  // Send to Folio handler
  const handleSendToFolio = (openInFolio = false, lockForVtt = false) => {
    const payload = {
      ...formData,
      name: formData.name || formData.title || formData['char-name'] || `Tier ${threatTier} ${selectedRole}`,
      threatTier,
      competencyRole: selectedRole,
      designation: selectedDesignation,
      bossType: selectedBossType,
      sizeCategory: selectedSize,
      isSynthetic
    };
    const folioPersona = sendMcmToFolioRoster(payload, {
      createCopy: true,
      lockForVtt,
      activateInFolio: true
    });
    if (folioPersona) {
      showToast({
        type: 'success',
        title: openInFolio ? 'Sent & Opening in Persona Folio' : 'Sent to Persona Folio',
        message: `"${folioPersona['char-name']}" is now in your Persona Folio roster with all 5 Pillars, Attributes, Skills, Loadout, and VTT Unit stats.`
      });
      if (openInFolio) {
        navigate('/folio');
      }
    }
  };

  return (
    <div className="bg-slate-900/90 border border-sky-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-5 text-slate-100 font-mono">
      {/* Top Header: Threat Hierarchy, Chassis & Send to Folio Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-sky-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-sky-400">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-sky-200">
              Modular Character Matrix (MCM) — Full Persona Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              Threat Tier <span className="text-sky-300 font-bold">{threatTier}</span>: <span className="text-amber-400 font-bold">{combatBlock.narrativeRank}</span> ({THREAT_TIER_CHASSIS[threatTier]?.bp}) • VTT Unit Ready
            </p>
          </div>
        </div>

        {/* Send to Folio & Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-sky-950 border border-sky-500/40 text-sky-300">
            {selectedDesignation}
          </span>
          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
            combatBlock.isBoss ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' :
            combatBlock.isMastermind ? 'bg-purple-950/80 border-purple-500/60 text-purple-300' :
            combatBlock.isMinion ? 'bg-red-950/80 border-red-500/60 text-red-300' :
            'bg-slate-950 border-slate-700 text-slate-400'
          }`}>
            {selectedBossType}
          </span>
          <button
            type="button"
            onClick={() => handleSendToFolio(false, false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold uppercase tracking-wider transition-all"
            title="Send this MCM character to the Persona Folio Roster for continued development or immediate VTT play"
          >
            <Send size={12} />
            <span>Send to Folio</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendToFolio(true, false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg transition-all"
            title="Send to Persona Folio and open immediately in the Folio Builder"
          >
            <ExternalLink size={12} />
            <span>Expand in Folio</span>
          </button>
        </div>
      </div>

      {/* Component Navigation Tabs (Aligned with Persona Folio & Persona Element Architecture) */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/90 border border-slate-800 rounded-xl">
        {[
          { id: 'matrix', label: '1. Matrix & 5 Pillars', icon: Dna },
          { id: 'attributes', label: '2. Attributes & Skills', icon: Brain },
          { id: 'traits', label: '3. Features, Traits & Meta', icon: Sparkles },
          { id: 'loadout', label: '4. Loadout & VTT Attacks', icon: Swords },
          { id: 'narrative', label: '5. Narrative, Prose & Lore', icon: BookOpen },
          { id: 'scripting', label: '6. Scripting & AIME 3-Tier', icon: Bot },
          { id: 'custom-fields', label: `7. Custom Fields${customFields.length > 0 ? ` (${customFields.length})` : ''}`, icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-sky-500/20 border border-sky-400 text-sky-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MATRIX & 5-PILLAR IDENTITY */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Threat Tier Interactive Slider */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={13} className="text-sky-400" />
                <span>Threat Tier Level (Tiers 0–20)</span>
              </label>
              <span className="text-sm font-bold text-sky-400 font-mono">
                Tier {threatTier} — {combatBlock.narrativeRank}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={threatTier}
              onChange={(e) => handleTierChange(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500 uppercase">
              <span>Tier 0 (Civilian)</span>
              <span>Tier 5 (Professional)</span>
              <span>Tier 10 (Champion / Boss)</span>
              <span>Tier 15 (High Lord)</span>
              <span>Tier 20 (Cosmic)</span>
            </div>
          </div>

          {/* Designation, Boss Type, Size & Synthetic Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Designation
              </label>
              <select
                value={selectedDesignation}
                onChange={(e) => onChange('designation', e.target.value)}
                className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400"
              >
                {Object.keys(DESIGNATIONS).map(d => (
                  <option key={d} value={d}>{DESIGNATIONS[d].name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Chassis Multiplier
              </label>
              <select
                value={selectedBossType}
                onChange={(e) => {
                  onChange('bossType', e.target.value);
                  onChange('boss_type', e.target.value);
                }}
                className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400"
              >
                {Object.keys(BOSS_TYPES).map(b => (
                  <option key={b} value={b}>{BOSS_TYPES[b].name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Size Scale
              </label>
              <select
                value={selectedSize}
                onChange={(e) => {
                  onChange('sizeCategory', e.target.value);
                  onChange('size', e.target.value);
                  onChange('char-size', e.target.value);
                }}
                className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400"
              >
                {Object.keys(SPECIES_SIZES).map(s => (
                  <option key={s} value={s}>{SPECIES_SIZES[s].name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Chassis Mode
              </label>
              <select
                value={chassisMode}
                onChange={(e) => {
                  const nextMode = e.target.value;
                  onChange('chassisMode', nextMode);
                  onChange('chassis_mode', nextMode);
                  onChange('isSynthetic', nextMode === 'Synthetic' || nextMode === 'NonCorporeal');
                  onChange('isNonCorporeal', nextMode === 'NonCorporeal');
                  onChange('is_non_corporeal', nextMode === 'NonCorporeal');
                  onChange('chassis_cp_modifier', nextMode === 'NonCorporeal' ? -75 : 0);
                }}
                className="w-full p-2 bg-slate-950 border border-sky-500/40 rounded-xl text-xs text-sky-200 focus:outline-none focus:border-sky-400"
              >
                {CHASSIS_MODES.map(mode => (
                  <option key={mode.id} value={mode.id}>{mode.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 5-Pillar Identity Architecture (Aligned with Persona Folio) */}
          <div className="p-3.5 bg-slate-950/80 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Dna size={13} />
                <span>5-Pillar Persona Identity (Folio Compatible)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Carries directly into Persona Folio & VTT
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {/* Species */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">1. Species</label>
                <select
                  value={formData['char-species'] || formData.species || (isSynthetic ? 'Synthetic' : 'Human')}
                  onChange={(e) => {
                    onChange('char-species', e.target.value);
                    onChange('species', e.target.value);
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100"
                >
                  {speciesOptions.map(sp => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>

              {/* Archetype */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">2. Archetype</label>
                <select
                  value={formData['char-archetype'] || formData.archetype || 'Everyman'}
                  onChange={(e) => {
                    onChange('char-archetype', e.target.value);
                    onChange('archetype', e.target.value);
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100"
                >
                  {ARCHETYPE_OPTIONS.map(arch => (
                    <option key={arch} value={arch}>{arch}</option>
                  ))}
                </select>
              </div>

              {/* Occupation */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">3. Occupation</label>
                <input
                  type="text"
                  list="mcm-occupation-list"
                  value={formData['char-occu'] || formData.occupation || ''}
                  onChange={(e) => {
                    onChange('char-occu', e.target.value);
                    onChange('occupation', e.target.value);
                  }}
                  placeholder={combatBlock.role}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
                <datalist id="mcm-occupation-list">
                  {occupationOptions.map(occ => (
                    <option key={occ} value={occ} />
                  ))}
                </datalist>
              </div>

              {/* Origin */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">4. Origin</label>
                <input
                  type="text"
                  list="mcm-origin-list"
                  value={formData['char-origin'] || formData.origin || ''}
                  onChange={(e) => {
                    onChange('char-origin', e.target.value);
                    onChange('origin', e.target.value);
                  }}
                  placeholder="Homeworld / Origin..."
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
                <datalist id="mcm-origin-list">
                  {originOptions.map(orig => (
                    <option key={orig} value={orig} />
                  ))}
                </datalist>
              </div>

              {/* Faction */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">5. Faction</label>
                <input
                  type="text"
                  list="mcm-faction-list"
                  value={formData['char-faction'] || formData.faction || ''}
                  onChange={(e) => {
                    onChange('char-faction', e.target.value);
                    onChange('faction', e.target.value);
                  }}
                  placeholder="Allegiance / Faction..."
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
                <datalist id="mcm-faction-list">
                  {factionOptions.map(fac => (
                    <option key={fac} value={fac} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Competency Role Grid */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
              Competency Role ({combatBlock.role})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.keys(COMPETENCY_ROLES).map(roleKey => {
                const role = COMPETENCY_ROLES[roleKey];
                const isSelected = selectedRole === roleKey || selectedRole === role.name;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => {
                      onChange('competencyRole', roleKey);
                      onChange('role', roleKey);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-sky-950/70 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-sky-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{role.name.split(' (')[0]}</span>
                      <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">{role.group}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {role.feature}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTRIBUTES & CANONICAL SKILLS */}
      {activeSubTab === 'attributes' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase text-sky-300">6 Primary Attributes & 12 Derived Sub-Attributes</h4>
                <p className="text-[10px] text-slate-400">
                  Sub-Attributes auto-compute via canonical 2 + (Primary × 2). Stamina provides Base Toughness DR.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSyncAttrsFromRoleAndTier}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-bold uppercase hover:bg-sky-500/30"
              >
                <RefreshCw size={11} />
                <span>Sync to Tier & Role</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {PRIMARY_ATTR_DEFS.map(attrDef => {
                const primaryVal = Number(formData[attrDef.key] ?? liveFolioPersona?.[attrDef.key] ?? 0);
                const subVal = Number(formData[attrDef.subKey] ?? liveFolioPersona?.[attrDef.subKey] ?? (2 + primaryVal * 2));
                return (
                  <div key={attrDef.key} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-300 block">{attrDef.label}</label>
                    <input
                      type="number"
                      min="-2"
                      max="20"
                      value={primaryVal}
                      onChange={(e) => handleAttrChange(attrDef, e.target.value)}
                      className="w-full p-1.5 bg-slate-950 border border-sky-500/40 rounded text-center text-sm font-bold text-sky-300"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>{attrDef.subLabel}:</span>
                      <span className="font-bold text-amber-300">{subVal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canonical Skills Matrix */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase text-sky-300">Canonical Skills & Ranks</h4>
                <p className="text-[10px] text-slate-400">
                  Role Key Skills default to Primary Rank ({combatBlock.primarySkillRank}) and Secondary Rank ({combatBlock.secondarySkillRank}).
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={skillToAdd}
                  onChange={(e) => setSkillToAdd(e.target.value)}
                  className="p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  <option value="">+ Add Canonical Skill...</option>
                  {ALL_CANONICAL_SKILLS.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.group})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCanonicalSkill}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(activeSkillsMap).map(([skillId, rank]) => {
                const canon = ALL_CANONICAL_SKILLS.find(s => s.id === skillId) || resolveCanonicalSkillAlias(skillId);
                const displayName = canon ? canon.name : skillId;
                return (
                  <div key={skillId} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-xs font-bold text-slate-200 truncate pr-2">{displayName}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 uppercase">Rank</span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={rank}
                        onChange={(e) => handleSetSkillRank(skillId, e.target.value)}
                        className="w-14 p-1 bg-slate-950 border border-slate-700 rounded text-center text-xs font-bold text-sky-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleSetSkillRank(skillId, 0)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Remove skill"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEATURES, TRAITS, HINDRANCES, AUGMENTATIONS & METAPHYSICS */}
      {activeSubTab === 'traits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'features', label: 'Features & Role Abilities', catalog: dbData?.features || [] },
            { key: 'traits', label: 'Species & Innate Traits', catalog: dbData?.species_traits || [] },
            { key: 'disadvantages', label: 'Hindrances & Disadvantages', catalog: dbData?.hindrances || [] },
            { key: 'augmentations', label: 'Cybernetics & Augmentations', catalog: dbData?.augmentations || [] },
            { key: 'invocations', label: 'Invocations & Metaphysics', catalog: dbData?.invocations || [] }
          ].map(({ key, label, catalog }) => {
            const items = getArrayField(key);
            return (
              <div key={key} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-sky-300">{label} ({items.length})</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    list={`mcm-catalog-${key}`}
                    value={customItemText[key] || ''}
                    onChange={(e) => setCustomItemText(prev => ({ ...prev, [key]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const matched = catalog.find(c => (c.name || c.title || '').toLowerCase() === (customItemText[key] || '').toLowerCase());
                        handleAddArrayItem(key, matched || customItemText[key]);
                      }
                    }}
                    placeholder={`Add ${label.split(' ')[0]}...`}
                    className="flex-1 p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                  />
                  <datalist id={`mcm-catalog-${key}`}>
                    {catalog.slice(0, 150).map((c, idx) => (
                      <option key={c.id || idx} value={c.name || c.title || ''} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={() => {
                      const matched = catalog.find(c => (c.name || c.title || '').toLowerCase() === (customItemText[key] || '').toLowerCase());
                      handleAddArrayItem(key, matched || customItemText[key]);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {items.map((item, idx) => (
                    <span
                      key={item.id || idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                    >
                      <span>{item.name || item.title || String(item)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(key, idx)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {items.length === 0 && (
                    <span className="text-[10px] text-slate-500 italic">None added yet.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: TACTICAL LOADOUT & VTT ATTACKS */}
      {activeSubTab === 'loadout' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: 'weapons', label: 'Weapons & Armaments', catalog: dbData?.weaponry || [] },
              { key: 'armor', label: 'Armor & Protective Kit', catalog: dbData?.armoring || [] },
              { key: 'gear', label: 'Tactical Gear & Kit', catalog: dbData?.gear || [] }
            ].map(({ key, label, catalog }) => {
              const items = getArrayField(key);
              return (
                <div key={key} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold uppercase text-amber-300 block">{label} ({items.length})</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      list={`mcm-loadout-${key}`}
                      value={customItemText[key] || ''}
                      onChange={(e) => setCustomItemText(prev => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const matched = catalog.find(c => (c.name || c.title || '').toLowerCase() === (customItemText[key] || '').toLowerCase());
                          handleAddArrayItem(key, matched || customItemText[key]);
                        }
                      }}
                      placeholder={`Add ${label.split(' ')[0]}...`}
                      className="flex-1 p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                    />
                    <datalist id={`mcm-loadout-${key}`}>
                      {catalog.slice(0, 150).map((c, idx) => (
                        <option key={c.id || idx} value={c.name || c.title || ''} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={() => {
                        const matched = catalog.find(c => (c.name || c.title || '').toLowerCase() === (customItemText[key] || '').toLowerCase());
                        handleAddArrayItem(key, matched || customItemText[key]);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="space-y-1 pt-1">
                    {items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between p-1.5 bg-slate-900 border border-slate-800 rounded text-xs">
                        <span className="text-slate-200 font-bold truncate">{item.name || item.title || String(item)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem(key, idx)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: NARRATIVE, PROSE & LORE (ALL PERSONA FOLIO NARRATIVE SECTIONS) */}
      {activeSubTab === 'narrative' && (
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase text-sky-300">
                Persona Folio Narrative Architecture &amp; Lore
              </h4>
              <p className="text-[10px] text-slate-400">
                All Persona Folio narrative sections plus Detailed Prose &amp; Lore—carried seamlessly between MCM, Folio, and Story Persona Elements.
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {FOLIO_NARRATIVE_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveNarrativeSec(sec.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    activeNarrativeSec === sec.id
                      ? 'bg-sky-600/30 border border-sky-400 text-sky-200'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSec.fields.map((nf) => {
                  const val =
                    formData[nf.id] ||
                    (nf.aliasKeys || []).map((k) => formData[k]).find(Boolean) ||
                    '';
                  return (
                    <div key={nf.id} className={nf.span2 ? 'sm:col-span-2' : ''}>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        {nf.label}
                      </label>
                      <textarea
                        rows={nf.span2 ? 2 : 1}
                        value={val}
                        onChange={(e) => {
                          const nextVal = e.target.value;
                          onChange(nf.id, nextVal);
                          (nf.aliasKeys || []).forEach((aliasKey) => {
                            onChange(aliasKey, nextVal);
                          });
                        }}
                        placeholder={nf.placeholder}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:border-sky-400 outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Narrative Prose & Lore (Persona Element Dossier Body) */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-sky-300 block">
              Detailed Description, Narrative Prose &amp; Lore (Persona Element Body)
            </label>
            <textarea
              rows={4}
              value={formData.narrativeProse || formData.content || formData.description || ''}
              onChange={(e) => {
                onChange('narrativeProse', e.target.value);
                onChange('content', e.target.value);
                if (!formData.description) {
                  onChange('description', e.target.value);
                }
              }}
              placeholder="Write detailed narrative prose, lore, background, secrets, or sensory description..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:border-sky-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* TAB 6: SCRIPTING & AIME 3-TIER ARCHITECTURE */}
      {activeSubTab === 'scripting' && (
        <div className="space-y-4">
          <NpcScriptBuilder
            fields={formData}
            onFieldChange={(key, val) => onChange(key, val)}
            elementTitle={formData.name || formData['char-name'] || 'MCM Unit'}
          />

          <AimeThreeTierStack
            elementType="Persona"
            fields={formData}
            onChangeField={(key, val) => onChange(key, val)}
            guidance={formData.guidance || {}}
            onChangeGuidance={(nextGuidance) => onChange('guidance', nextGuidance)}
            assetHub={Array.isArray(formData.assetHub) ? formData.assetHub : []}
            onChangeAssetHub={(nextHub) => onChange('assetHub', nextHub)}
            availableElements={storyCtx.elementsCatalog || []}
            currentElementId={formData.id}
          />
        </div>
      )}

      {/* TAB 7: CUSTOM FIELDS & KEY-VALUE ATTRIBUTES */}
      {activeSubTab === 'custom-fields' && (
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase text-sky-300">
                Custom Fields &amp; Key-Value Attributes
              </h4>
              <p className="text-[10px] text-slate-400">
                Define custom key-value properties carried across MCM, Persona Folio, and Story Persona Elements.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-500/60 text-sky-300 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Custom Field</span>
            </button>
          </div>

          {customFields.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
              No custom fields defined. Click &quot;+ Add Custom Field&quot; to attach custom attributes.
            </div>
          ) : (
            <div className="space-y-2.5">
              {customFields.map((cf, idx) => (
                <div
                  key={cf.id || idx}
                  className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cf.label || ''}
                      onChange={(e) => handleUpdateCustomField(cf.id, 'label', e.target.value)}
                      placeholder="Field Label (e.g. Danger Rating, Clearance)"
                      className="bg-slate-950 border border-slate-700 text-sky-300 p-1.5 rounded text-xs font-bold outline-none focus:border-sky-400 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(cf.id)}
                      className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={cf.value || ''}
                    onChange={(e) => handleUpdateCustomField(cf.id, 'value', e.target.value)}
                    placeholder="Field value / description..."
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2 rounded text-xs outline-none focus:border-sky-400"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Calculated NPC Combat Stat Block Preview */}
      <div className="p-4 bg-slate-950/90 rounded-xl border border-sky-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Live Tactical Combat Stat Block
            </span>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">
            Wealth Score: WS {combatBlock.wealthScore}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center">
          {/* Health / SP */}
          {isNonCorporeal ? (
            <div className="p-2 rounded-lg bg-slate-900 border border-purple-500/40">
              <span className="text-[9px] uppercase text-purple-300 block">Non-Corporeal SP (-75 CP)</span>
              <span className="text-sm font-bold text-purple-300 font-mono">{nonCorporealSP} SP</span>
              <span className="text-[8px] text-slate-400 block">60 + WIS×10</span>
            </div>
          ) : isSynthetic ? (
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[9px] uppercase text-slate-500 block">Structure</span>
              <span className="text-sm font-bold text-sky-400 font-mono">{combatBlock.structurePoints} SP</span>
            </div>
          ) : (
            <>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Vitality</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{combatBlock.vitality}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500 block">Health</span>
                <span className="text-sm font-bold text-red-400 font-mono">{combatBlock.health}</span>
              </div>
            </>
          )}

          {/* Defense DC */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Defense DC</span>
            <span className="text-sm font-bold text-sky-300 font-mono">{combatBlock.defenseDC}</span>
          </div>

          {/* Attack Bonus */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Attack Bonus</span>
            <span className="text-sm font-bold text-amber-400 font-mono">+{combatBlock.attackBonus}</span>
          </div>

          {/* DR */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Expected DR</span>
            <span className="text-sm font-bold text-slate-200 font-mono">DR {combatBlock.expectedDR}</span>
          </div>

          {/* Initiative */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Initiative</span>
            <span className="text-sm font-bold text-purple-400 font-mono">+{combatBlock.initiative}</span>
          </div>

          {/* Actions */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Actions</span>
            <span className="text-sm font-bold text-sky-400 font-mono">{combatBlock.actionsPerRound} / rnd</span>
          </div>

          {/* Speed */}
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[9px] uppercase text-slate-500 block">Speed</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{combatBlock.speed} ft</span>
          </div>
        </div>

        {/* 6 Canonical Saving Throws & Role Skills */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              6 Canonical Saving Throws (+2 + 2×Attr | Passive CR 12 + 2×Attr):
            </span>
            <div>
              <span className="text-slate-400 font-bold">Primary Skills: </span>
              <span className="text-sky-300">{combatBlock.keySkills.join(', ')} (Rank {combatBlock.primarySkillRank})</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
            {canonicalSaves.map(save => (
              <div key={save.saveName} className="px-2 py-1 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300">{save.saveName}</span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">
                  {save.bonus >= 0 ? `+${save.bonus}` : save.bonus} <span className="text-slate-500">(CR {save.passiveCR})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tactical Behaviors Pill Multi-Select */}
      <div>
        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
          Tactical Behaviors ({selectedBehaviors.length} selected)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TACTICAL_BEHAVIORS.map(beh => {
            const isSelected = selectedBehaviors.includes(beh);
            return (
              <button
                key={beh}
                type="button"
                onClick={() => toggleBehavior(beh)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  isSelected 
                    ? 'bg-sky-600 text-white shadow-sm' 
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {beh}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModularStatBlockConfigurator;
