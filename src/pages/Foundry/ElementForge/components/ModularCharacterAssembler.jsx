import React, { useState, useMemo } from 'react';
import { useDBM } from '../../../../context/DBMContext';
import { AudioService } from '../../../../services/audioService';
import { generateContent } from '../../../../services/aimeService';
import { AimeGuidanceButton } from '../../../../components/StoryFoundry/AimeGuidanceButton';
import { 
  Shield, Swords, Zap, Heart, Activity, 
  Sparkles, Check, RefreshCw, Wand2, User, Crosshair 
} from 'lucide-react';

const CHASSIS_PRESETS = {
  combatant: { name: 'Combatant', label: 'STR +3, AGI +2', str: 3, agi: 2, sta: 2, int: 0, tech: 0, wil: 1, cha: 0 },
  specialist: { name: 'Specialist', label: 'INT +3, TECH +2', str: 0, agi: 1, sta: 1, int: 3, tech: 2, wil: 1, cha: 0 },
  socialite: { name: 'Socialite', label: 'CHA +3, WIL +2', str: 0, agi: 1, sta: 1, int: 1, tech: 0, wil: 2, cha: 3 },
  balanced: { name: 'Balanced', label: '+1 All Attributes', str: 1, agi: 1, sta: 1, int: 1, tech: 1, wil: 1, cha: 1 }
};

const ROLE_PACKAGES = {
  bruiser: { name: 'Bruiser / Vanguard', role: 'bruiser', defaultWeapon: 'Vibro-Axe', armorType: 'Heavy Ballistic Weave', defenseBonus: 2, healthBonus: 10 },
  tactical: { name: 'Tactical / Commando', role: 'tactical', defaultWeapon: 'Plasma Carbine', armorType: 'Tactical Combat Vest', defenseBonus: 3, healthBonus: 5 },
  sniper: { name: 'Sniper / Precision', role: 'sniper', defaultWeapon: 'Needle Rifle', armorType: 'Chameleon Cloak', defenseBonus: 2, healthBonus: 0 },
  guardian: { name: 'Guardian / Protector', role: 'guardian', defaultWeapon: 'Kinetic Riot Hammer', armorType: 'Reinforced Exoskeleton', defenseBonus: 4, healthBonus: 15 },
  slicer: { name: 'Slicer / Tech Operative', role: 'specialist', defaultWeapon: 'Flechette Pistol', armorType: 'Light Mesh Vest', defenseBonus: 1, healthBonus: 0 },
  medic: { name: 'Field Medic / Support', role: 'support', defaultWeapon: 'Stun Pistol', armorType: 'Bio-Sealed Armor', defenseBonus: 2, healthBonus: 5 },
  boss: { name: 'Sector Boss / Commander', role: 'boss', defaultWeapon: 'Heavy Particle Cannon', armorType: 'Powered Battle Armor', defenseBonus: 5, healthBonus: 30 }
};

export const ModularCharacterAssembler = ({
  fields = {},
  onFieldChange,
  elementTitle = '',
  onOpenAimeGuidance = null
}) => {
  const { dbData } = useDBM() || { dbData: {} };

  // Live collections from Omnicortex DBM
  const speciesList = dbData?.species || [];
  const occupationsList = dbData?.occupations || [];
  const weaponsList = dbData?.weaponry || [];
  const armorsList = dbData?.armoring || [];

  // Local state for interactive modular assembly
  const [tier, setTier] = useState(parseInt(fields.mcmTier || '1', 10) || 1);
  const [designation, setDesignation] = useState(fields.mcmDesignation || 'Adversary');
  const [chassisKey, setChassisKey] = useState(fields.mcmChassis?.toLowerCase() || 'combatant');
  const [roleKey, setRoleKey] = useState(fields.mcmRole?.toLowerCase() || 'tactical');
  const [selectedSpecies, setSelectedSpecies] = useState(fields['char-species'] || '');
  const [selectedOccupation, setSelectedOccupation] = useState(fields['char-occu'] || '');
  const [selectedWeapon, setSelectedWeapon] = useState(fields.weapon || '');
  const [selectedArmor, setSelectedArmor] = useState(fields.armor || '');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);

  const activeChassis = CHASSIS_PRESETS[chassisKey] || CHASSIS_PRESETS.combatant;
  const activeRole = ROLE_PACKAGES[roleKey] || ROLE_PACKAGES.tactical;

  // Real-time calculated vitals based on canonical Tangent rules:
  // Health = 30 + (STA * 5) + Tier Scaling + Role Bonus
  const calculatedHealth = useMemo(() => {
    const base = 30;
    const staBonus = (activeChassis.sta || 1) * 5;
    const tierBonus = tier * 8;
    const roleBonus = activeRole.healthBonus || 0;
    return base + staBonus + tierBonus + roleBonus;
  }, [tier, activeChassis, activeRole]);

  // Vitality = 30 + (WIL * 5) + Tier Scaling
  const calculatedVitality = useMemo(() => {
    const base = 30;
    const wilBonus = (activeChassis.wil || 1) * 5;
    const tierBonus = tier * 5;
    return base + wilBonus + tierBonus;
  }, [tier, activeChassis]);

  // Defense DC = 10 + AGI + Armor + Role
  const calculatedDefense = useMemo(() => {
    const base = 10;
    const agi = activeChassis.agi || 1;
    const roleDef = activeRole.defenseBonus || 2;
    const tierDef = Math.floor(tier / 2);
    return base + agi + roleDef + tierDef;
  }, [tier, activeChassis, activeRole]);

  // Attack Bonus = Linked Attribute + Tier
  const calculatedAttackBonus = useMemo(() => {
    const primaryAttr = Math.max(activeChassis.str, activeChassis.agi, activeChassis.int);
    return primaryAttr + tier + 2;
  }, [tier, activeChassis]);

  // Apply all calculated values to parent form
  const handleApplyToElement = () => {
    AudioService.playTerminalBeep(1150, 0.1);
    onFieldChange?.('mcmTier', String(tier));
    onFieldChange?.('mcmDesignation', designation);
    onFieldChange?.('mcmChassis', activeChassis.name);
    onFieldChange?.('mcmRole', activeRole.name);
    onFieldChange?.('health', String(calculatedHealth));
    onFieldChange?.('vitality', String(calculatedVitality));
    onFieldChange?.('defense', String(calculatedDefense));
    onFieldChange?.('attackBonus', String(calculatedAttackBonus));
    if (selectedSpecies) onFieldChange?.('char-species', selectedSpecies);
    if (selectedOccupation) onFieldChange?.('char-occu', selectedOccupation);
    if (selectedWeapon) onFieldChange?.('weapon', selectedWeapon);
    if (selectedArmor) onFieldChange?.('armor', selectedArmor);

    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2500);
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
2. Tactical Role: bruiser, tactical, sniper, guardian, slicer, medic, or boss
3. Suggest a live Omnicortex weapon and armor matching Tech Level 3.

Respond in JSON format:
{
  "chassis": "combatant",
  "role": "tactical",
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
      if (parsed.role && ROLE_PACKAGES[parsed.role.toLowerCase()]) {
        setRoleKey(parsed.role.toLowerCase());
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
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-base shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            🧬
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-2">
              <span>Modular Character Matrix (MCM)</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-500/50">
                Live Omnicortex Attuned
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Canonical 4-block assembly: Power Tier, Designation, Chassis, and Role
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Assembly Grid Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* 1. Threat Tier */}
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center justify-between">
            <span>Threat Tier</span>
            <span className="text-amber-300 font-mono font-extrabold">T-{tier}</span>
          </label>
          <input
            type="range"
            min="0"
            max="15"
            value={tier}
            onChange={(e) => setTier(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>T0 Minion</span>
            <span>T5 Elite</span>
            <span>T15 Boss</span>
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
            <option value="Adversary">Adversary (Hostile Force)</option>
            <option value="Ally">Ally (Independent Supporter)</option>
            <option value="Companion">Companion (Player-Bound)</option>
            <option value="Neutral">Neutral (Bystander/Contact)</option>
          </select>
        </div>

        {/* 3. Chassis Array */}
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
            Chassis Primary Array
          </label>
          <select
            value={chassisKey}
            onChange={(e) => setChassisKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-amber-300 p-1.5 rounded-lg text-xs font-bold outline-none focus:border-cyan-400 font-mono"
          >
            {Object.entries(CHASSIS_PRESETS).map(([k, c]) => (
              <option key={k} value={k}>{c.name} ({c.label})</option>
            ))}
          </select>
        </div>

        {/* 4. Tactical Role */}
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
            Tactical Role Package
          </label>
          <select
            value={roleKey}
            onChange={(e) => setRoleKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-purple-300 p-1.5 rounded-lg text-xs font-bold outline-none focus:border-cyan-400 font-mono"
          >
            {Object.entries(ROLE_PACKAGES).map(([k, r]) => (
              <option key={k} value={k}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Omnicortex Relational Links Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Species Link */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
            Species (Omnicortex DB)
          </label>
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

        {/* Occupation Link */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
            Occupation (Omnicortex DB)
          </label>
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

        {/* Weapon Link */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
            Primary Weapon
          </label>
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
          >
            <option value="">Default: {activeRole.defaultWeapon}</option>
            {weaponsList.map((w, idx) => (
              <option key={w.id || idx} value={w.name || w.title}>{w.name || w.title}</option>
            ))}
          </select>
        </div>

        {/* Armor Link */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
            Equipped Armoring
          </label>
          <select
            value={selectedArmor}
            onChange={(e) => setSelectedArmor(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-xs font-mono outline-none focus:border-cyan-400"
          >
            <option value="">Default: {activeRole.armorType}</option>
            {armorsList.map((a, idx) => (
              <option key={a.id || idx} value={a.name || a.title}>{a.name || a.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-Time Calculated Vitals Strip & Apply Action */}
      <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/50 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Health */}
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-rose-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">Health:</span>
            <span className="text-xs font-mono font-extrabold text-rose-300">{calculatedHealth}</span>
          </div>

          {/* Vitality */}
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-cyan-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">Vitality:</span>
            <span className="text-xs font-mono font-extrabold text-cyan-300">{calculatedVitality}</span>
          </div>

          {/* Defense DC */}
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-amber-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">Defense DC:</span>
            <span className="text-xs font-mono font-extrabold text-amber-300">{calculatedDefense}</span>
          </div>

          {/* Attack Bonus */}
          <div className="flex items-center gap-1.5">
            <Crosshair size={14} className="text-purple-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400">Attack Bonus:</span>
            <span className="text-xs font-mono font-extrabold text-purple-300">+{calculatedAttackBonus}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {appliedNotification && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse flex items-center gap-1">
              <Check size={12} /> Applied to Element!
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
