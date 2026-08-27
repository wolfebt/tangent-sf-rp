import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Sparkles, 
  BookOpen, 
  Plus, 
  X, 
  Search, 
  Dices, 
  Check, 
  Layers, 
  Flame, 
  Clock, 
  Shield, 
  Cpu, 
  Eye, 
  Copy, 
  Wand2, 
  Trash2, 
  Edit3 
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { METAPHYSICAL_DISCIPLINES } from '../../../data/skillsData';
import { rollDice } from '../../../services/diceService';
import { AudioService } from '../../../services/audioService';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

// Canonical Invocations seeds for offline catalog browsing
const CANONICAL_INVOCATIONS = [
  // Entropy
  { id: 'inv-decay', name: 'Accelerate Decay', discipline: 'Entropy', subSkill: 'Chaos', baseDC: 15, time: '1 Action', range: 'Touch', area: 'Single Target', duration: 'Instantaneous', resistance: 'Fortitude', damage: '2d6 Necrotic', description: 'Accelerates entropy and cellular degradation in living or inanimate matter, causing immediate breakdown of molecular bonds.', scaling: '+1d6 damage per Invocation level beyond 1.' },
  { id: 'inv-curse', name: 'Entropic Curse', discipline: 'Entropy', subSkill: 'Chaos', baseDC: 16, time: '1 Action', range: '60 ft', area: '1 Creature', duration: '1 Minute', resistance: 'Willpower', damage: 'Disadvantage', description: 'Weaves destabilizing entropic probability around a foe, imposing Disadvantage on all ability checks and attack rolls.', scaling: 'Affects +1 target per 3 Invocation levels.' },
  { id: 'inv-regeneration', name: 'Cellular Restoration', discipline: 'Entropy', subSkill: 'Order', baseDC: 14, time: '1 Action', range: 'Touch', area: '1 Creature', duration: 'Instantaneous', resistance: 'None (Harmless)', damage: 'Heals 2d8 Health', description: 'Restores biological integrity and accelerates rapid natural cellular repair, mending severe lacerations and trauma.', scaling: 'Heals an additional +1d8 Health per Invocation level.' },
  { id: 'inv-stabilize-entropy', name: 'Harmonic Stasis', discipline: 'Entropy', subSkill: 'Order', baseDC: 12, time: 'Bonus Action', range: '30 ft', area: '1 Creature', duration: 'Concentration (1 min)', resistance: 'None', damage: 'Neutralize Hazard', description: 'Arrests advancing biological decay, halting hemorrhages, stabilizing dying operatives, or pausing advancing toxins.', scaling: 'Expands range by +15 ft per Invocation level.' },

  // Dimension
  { id: 'inv-teleport', name: 'Dimensional Teleport', discipline: 'Dimension', subSkill: 'Teleport', baseDC: 18, time: 'Standard Action', range: 'Self + Touch', area: 'Personal + Passengers', duration: 'Instantaneous', resistance: 'Will (if unwilling)', damage: 'Relocation', description: 'Instantaneous spatial relocation without traveling through intervening space. Requires familiarity with destination coordinates.', scaling: 'Carries +1 passenger per Invocation level; reduces familiarity DC by 2 per level.' },
  { id: 'inv-blink', name: 'Spatial Blink', discipline: 'Dimension', subSkill: 'Teleport', baseDC: 14, time: 'Bonus Action', range: '30 ft', area: 'Self', duration: 'Instantaneous', resistance: 'None', damage: 'Tactical Shift', description: 'Flickers out of phase to reappear at an unoccupied location within tactical line-of-sight.', scaling: 'Increases teleport distance by +10 ft per Invocation level.' },
  { id: 'inv-rift-gate', name: 'Planar Rift Gate', discipline: 'Dimension', subSkill: 'Summoning', baseDC: 24, time: '1 Minute', range: '10 ft', area: '10 ft Ring', duration: '10 Minutes', resistance: 'None', damage: 'Interstellar Transit', description: 'Opens a stable trans-dimensional gateway connecting two known spatial anchors across planetary or interstellar distances.', scaling: 'Duration extended to 1 hour per 2 Invocation levels.' },
  { id: 'inv-summon-construct', name: 'Dimensional Construct', discipline: 'Dimension', subSkill: 'Summoning', baseDC: 16, time: '1 Full Round', range: '30 ft', area: 'Construct', duration: 'Concentration (10 min)', resistance: 'None', damage: 'Guardian Unit', description: 'Draws energetic matter and alien lattice code across planar boundaries to materialize an obedient dimensional entity.', scaling: 'Construct gains +5 Vitality and +1 Strike per Invocation level.' },

  // Energy
  { id: 'inv-plasma-burst', name: 'Plasma Blast', discipline: 'Energy', subSkill: 'Elemental', baseDC: 15, time: '1 Action', range: '120 ft', area: '20 ft Radius', duration: 'Instantaneous', resistance: 'Reflex (Half)', damage: '4d6 Plasma', description: 'Ignites superheated plasma and radiant thermal energy in a devastating concussive detonation.', scaling: '+1d6 Plasma damage per Invocation level.' },
  { id: 'inv-lightning-arc', name: 'Arc Discharge', discipline: 'Energy', subSkill: 'Elemental', baseDC: 14, time: '1 Action', range: '60 ft', area: 'Chain (3 Targets)', duration: 'Instantaneous', resistance: 'Reflex (Half)', damage: '3d8 Electrical', description: 'Channels high-voltage ionized lightning that arcs through conductive armors, shorting out electrical shields and cyberware.', scaling: 'Arcs to +1 additional target per Invocation level.' },
  { id: 'inv-force-barrier', name: 'Kinetic Aegis', discipline: 'Energy', subSkill: 'Force', baseDC: 13, time: 'Reaction', range: 'Self / 10 ft', area: 'Spherical Screen', duration: 'Concentration (1 min)', resistance: 'None', damage: '20 SP Barrier', description: 'Erects an immovable translucent repulsor barrier that absorbs incoming ballistic rounds, laser beams, and melee impacts.', scaling: 'Barrier SP increases by +10 per Invocation level.' },
  { id: 'inv-force-pulse', name: 'Gravimetric Repulsor', discipline: 'Energy', subSkill: 'Force', baseDC: 15, time: '1 Action', range: 'Self', area: '15 ft Cone', duration: 'Instantaneous', resistance: 'Might (Save)', damage: '2d6 Concussive + Knockback', description: 'Releases a high-pressure kinetic gravity wave that knocks targets Prone and shatters structural bulkheads.', scaling: 'Knockback distance increases by 5 ft per Invocation level.' },

  // Illusion
  { id: 'inv-phantasm-hologram', name: 'Tactical Holo-Weave', discipline: 'Illusion', subSkill: 'Phantasm', baseDC: 14, time: '1 Action', range: '60 ft', area: '20 ft Cube', duration: 'Concentration (10 min)', resistance: 'Reason (Inspect)', damage: 'Sensory Deception', description: 'Creates an intricately detailed multi-sensory illusion complete with sight, sound, thermal signature, and radar returns.', scaling: 'Illusion volume doubles per 2 Invocation levels.' },
  { id: 'inv-invisibility', name: 'Refractive Camouflage', discipline: 'Illusion', subSkill: 'Phantasm', baseDC: 16, time: '1 Action', range: 'Touch', area: '1 Creature', duration: 'Concentration (10 min)', resistance: 'Perception opposed', damage: 'Invisibility', description: 'Bends light waves and thermal emissions around the target, rendering them entirely invisible to optical and infrared observation.', scaling: 'Allows making attacks without breaking camouflage at Invocation level 7+.' },
  { id: 'inv-shadow-weapon', name: 'Umbral Blade', discipline: 'Illusion', subSkill: 'Shadow', baseDC: 13, time: 'Bonus Action', range: 'Self', area: 'Melee Weapon', duration: '10 Minutes', resistance: 'Reflex', damage: '2d8 Shadow Damage', description: 'Condenses ambient shadows into a razor-sharp spectral blade that bypasses physical armor and strikes at vitality directly.', scaling: '+1d8 damage per 2 Invocation levels.' },
  { id: 'inv-shadow-cloak', name: 'Umbral Shroud', discipline: 'Illusion', subSkill: 'Shadow', baseDC: 15, time: 'Reaction', range: 'Self', area: 'Personal', duration: '1 Round', resistance: 'None', damage: '+4 Evasion', description: 'Disperses the operative into living darkness, causing incoming attacks to pass harmlessly through empty space.', scaling: 'Can be used 1 additional time per rest per Invocation level.' },

  // Matter
  { id: 'inv-reinforce-bulkhead', name: 'Molecular Hardening', discipline: 'Matter', subSkill: 'Enhancement', baseDC: 14, time: '1 Action', range: 'Touch', area: 'Object / Armor', duration: '1 Hour', resistance: 'None', damage: '+3 Armor DR', description: 'Re-aligns atomic crystal bonds in armor, shields, or bulkheads, increasing hardness and damage reduction significantly.', scaling: '+1 DR per 2 Invocation levels.' },
  { id: 'inv-weapon-sharpness', name: 'Resonant Edge', discipline: 'Matter', subSkill: 'Enhancement', baseDC: 13, time: 'Bonus Action', range: 'Touch', area: '1 Weapon', duration: '10 Minutes', resistance: 'None', damage: '+2 Strike, +3 Damage', description: 'Infuses a weapon with microscopic vibration harmonics, cleanly shearing through steel bulkheads and armored carapaces.', scaling: '+1 Strike and +1 Damage per Invocation level.' },
  { id: 'inv-transmute-matter', name: 'Elemental Transmutation', discipline: 'Matter', subSkill: 'Transmutation', baseDC: 18, time: '1 Full Round', range: 'Touch', area: '5 ft Cube', duration: 'Permanent', resistance: 'Fortitude (if living)', damage: 'Material Conversion', description: 'Alters atomic structures, transmuting stone to clay, steel to lead, or gas to liquid through molecular reorganization.', scaling: 'Volume converted increases by 5 ft cube per Invocation level.' },
  { id: 'inv-matter-reshape', name: 'Physical Sculpting', discipline: 'Matter', subSkill: 'Transmutation', baseDC: 15, time: '1 Action', range: '30 ft', area: 'Terrain', duration: 'Instantaneous', resistance: 'Reflex (Negates)', damage: 'Difficult Terrain / Spikes', description: 'Commands physical stone or earth to surge into protective breastworks, jagged puncturing spikes, or pits.', scaling: 'Covers an additional 10 ft radius per Invocation level.' },

  // Mental
  { id: 'inv-telepathy', name: 'Neural Telepathy', discipline: 'Mental', subSkill: 'Projection', baseDC: 12, time: 'Bonus Action', range: '1 Mile', area: 'Mental Link', duration: '1 Hour', resistance: 'Will (if unwilling)', damage: 'Direct Communication', description: 'Establishes an encrypted, two-way telepathic comms bridge with one or more conscious minds across extreme distances.', scaling: 'Range expands to planetary scale at Invocation level 5+.' },
  { id: 'inv-psionic-thrust', name: 'Mind Blast', discipline: 'Mental', subSkill: 'Projection', baseDC: 16, time: '1 Action', range: '60 ft', area: '1 Creature', duration: 'Instantaneous', resistance: 'Willpower (Half)', damage: '3d8 Psionic + Stun', description: 'Fires a concentrated spike of cognitive energy directly into a foe\'s synapses, overwhelming their consciousness.', scaling: '+1d8 Psionic damage per Invocation level.' },
  { id: 'inv-remote-viewing', name: 'Clairvoyant Eye', discipline: 'Mental', subSkill: 'Sense', baseDC: 15, time: '1 Minute', range: '10 Miles', area: 'Sensory Sensor', duration: 'Concentration (10 min)', resistance: 'Willpower (Negates)', damage: 'Reconnaissance', description: 'Projects consciousness into a remote spatial coordinate to see and hear events in real time without being physically present.', scaling: 'Range increases to 50 miles per Invocation level.' },
  { id: 'inv-empathy-probe', name: 'Synaptic Probe', discipline: 'Mental', subSkill: 'Sense', baseDC: 14, time: '1 Action', range: '30 ft', area: '1 Creature', duration: 'Concentration (1 min)', resistance: 'Willpower', damage: 'Read Memories', description: 'Surreptitiously probes surface thoughts, immediate emotional state, hidden motives, and recent memories.', scaling: 'Bypasses mental shields of CR + 2 per Invocation level.' }
];

export const MetaphysicsModal = ({ isOpen, onClose }) => {
  const { 
    characterData, 
    updateField, 
    handleAddItem, 
    handleUpdateItem, 
    getAttrTotal,
    economyBreakdown 
  } = useFolio();

  const [activeTab, setActiveTab] = useState('disciplines'); // 'disciplines' | 'invocations' | 'special_abilities'
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [governingAttr, setGoverningAttr] = useState('attr-intellect'); // 'attr-intellect' | 'attr-wisdom' | 'attr-charisma'
  const [latestRoll, setLatestRoll] = useState(null);

  // Custom Build Modal Sub-States
  const [isBuildInvocationOpen, setIsBuildInvocationOpen] = useState(false);
  const [isBuildSpecialAbilityOpen, setIsBuildSpecialAbilityOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    discipline: 'Entropy',
    subSkill: 'Chaos',
    baseDC: 15,
    time: '1 Action',
    range: '30 ft',
    area: 'Single Target',
    duration: 'Instantaneous',
    resistance: 'None',
    damage: '',
    description: '',
    scaling: '',
    rank: 1,
    cp: 3
  });

  if (!isOpen) return null;

  const getNum = (id, defaultVal = 0) => parseInt(characterData[id] || defaultVal, 10);

  // Character awakened disciplines list
  const awakenedList = Array.isArray(characterData.awakened) ? characterData.awakened : [];
  const isDisciplineAwakened = (discName) => {
    return awakenedList.some(d => {
      const n = typeof d === 'object' ? (d.name || '') : String(d);
      return n.toLowerCase().includes(discName.toLowerCase());
    }) || (Array.isArray(characterData.features) && characterData.features.some(f => {
      const n = typeof f === 'object' ? (f.name || '') : String(f);
      return n.toLowerCase().includes(`awakened: ${discName.toLowerCase()}`);
    }));
  };

  // Known Invocations list
  const knownInvocations = Array.isArray(characterData.invocations) ? characterData.invocations : [];
  // Special Abilities list
  const specialAbilities = Array.isArray(characterData.special_abilities) ? characterData.special_abilities : [];

  // Governing attribute score
  const governingAttrTotal = getAttrTotal(governingAttr);

  // ═══════════════════════════════════════════════════════════════════════════
  // CANONICAL ESSENCE POOL CALCULATION:
  // (Sum of all 6 Ability Scores) + (Attune Skill Rank) + (Total Discipline Ranks)
  // ═══════════════════════════════════════════════════════════════════════════
  const abilitySubstrate = [
    'attr-strength',
    'attr-agility',
    'attr-stamina',
    'attr-intellect',
    'attr-wisdom',
    'attr-charisma'
  ].reduce((sum, attrId) => sum + getAttrTotal(attrId), 0);

  const attuneRank = getNum('skill-meta-attune-rank', 0);
  const attuneMod = getNum('skill-meta-attune-mod', 0);
  const totalAttune = attuneRank + attuneMod;

  const totalDisciplineRanks = METAPHYSICAL_DISCIPLINES.reduce((sum, disc) => {
    return sum + disc.skills.reduce((sSum, skill) => {
      return sSum + getNum(`skill-${skill.id}-rank`, 0);
    }, 0);
  }, 0);

  const maxEssencePool = abilitySubstrate + attuneRank + totalDisciplineRanks;
  const currentEssence = characterData.essence_current !== undefined 
    ? Number(characterData.essence_current) 
    : maxEssencePool;

  const handleAdjustEssence = (delta) => {
    const nextVal = Math.max(0, Math.min(maxEssencePool, currentEssence + delta));
    updateField('essence_current', nextVal);
  };

  const handleRestoreFullEssence = () => {
    updateField('essence_current', maxEssencePool);
  };

  const handleLightRestEssence = () => {
    const recovery = Math.max(1, governingAttrTotal);
    const nextVal = Math.min(maxEssencePool, currentEssence + recovery);
    updateField('essence_current', nextVal);
  };

  const getEssenceCostForDC = (dc) => {
    if (dc <= 10) return 0;
    if (dc <= 15) return 1;
    if (dc <= 20) return 2;
    if (dc <= 25) return 3;
    if (dc <= 30) return 4;
    return 5;
  };

  // Helper to calculate total check score for an invocation
  const calculateInvocationScore = (inv) => {
    const disciplineObj = METAPHYSICAL_DISCIPLINES.find(d => 
      d.name.toLowerCase() === (inv.discipline || '').toLowerCase()
    );
    const subSkillObj = disciplineObj?.skills.find(s => 
      s.name.toLowerCase() === (inv.subSkill || '').toLowerCase()
    ) || disciplineObj?.skills[0];

    const skillId = subSkillObj ? subSkillObj.id : `meta-${(inv.discipline || 'energy').toLowerCase()}`;
    const skillRank = Math.min(20, Math.max(0, getNum(`skill-${skillId}-rank`, 0)));
    const skillMod = getNum(`skill-${skillId}-mod`, 0);
    const invLevel = Math.min(10, Math.max(1, parseInt(inv.rank || inv.level || 1, 10)));
    const totalScore = governingAttrTotal + skillRank + skillMod + invLevel;
    const take10Score = totalScore + 10;
    const baseDC = inv.baseDC || 15;
    const baseEssenceCost = getEssenceCostForDC(baseDC);
    const targetSaveDC = 10 + totalAttune + invLevel;

    return {
      governingAttrTotal,
      skillName: subSkillObj?.name || inv.discipline || 'Discipline',
      skillRank: skillRank + skillMod,
      invLevel,
      totalScore,
      take10Score,
      baseDC,
      baseEssenceCost,
      targetSaveDC
    };
  };

  // Toggle Awakened status for a discipline
  const handleToggleAwakened = (disc) => {
    const isAwakened = isDisciplineAwakened(disc.name);
    if (isAwakened) {
      if (!confirmTypedDeletion(`Awakened: ${disc.name}`, 'awakened discipline feature')) return;
      const updated = awakenedList.filter(d => {
        const n = typeof d === 'object' ? (d.name || '') : String(d);
        return !n.toLowerCase().includes(disc.name.toLowerCase());
      });
      updateField('awakened', updated);

      // Remove from features if present
      if (Array.isArray(characterData.features)) {
        const updatedFeats = characterData.features.filter(f => {
          const n = typeof f === 'object' ? (f.name || '') : String(f);
          return !n.toLowerCase().includes(`awakened: ${disc.name.toLowerCase()}`);
        });
        updateField('features', updatedFeats);
      }
    } else {
      // Purchase Awakened
      const newItem = {
        id: `awakened_${disc.id}_${Date.now()}`,
        name: `Awakened: ${disc.name}`,
        discipline: disc.name,
        type: 'Awakened',
        category: 'Awakened Discipline',
        cp: 3,
        description: disc.description
      };
      updateField('awakened', [...awakenedList, newItem]);
      handleAddItem('features', newItem);

      // Automatically ensure Attune skill is active
      if (getNum('skill-meta-attune-rank', 0) === 0) {
        updateField('skill-meta-attune-rank', 1);
        updateField('skill-meta-attune-name', 'Attune');
        updateField('skill-meta-attune-group', 'meta');
      }

      // Initialize the 2 associated discipline skills
      disc.skills.forEach(s => {
        if (getNum(`skill-${s.id}-rank`, 0) === 0) {
          updateField(`skill-${s.id}-rank`, 1);
          updateField(`skill-${s.id}-name`, s.name);
          updateField(`skill-${s.id}-group`, 'meta');
          updateField(`skill-${s.id}-subcategory`, disc.name);
        }
      });

      AudioService.playTerminalBeep(1400, 0.05);
    }
  };

  // Roll Invocation check
  const handleRollInvocation = (inv) => {
    const calc = calculateInvocationScore(inv);
    const rollResult = rollDice(`1d20+${calc.totalScore}`, {
      characterName: characterData['char-name'] || 'Operative',
      label: `${inv.name} Metaphysics Check`
    });

    AudioService.playDiceRollSound();
    if (rollResult.isCritSuccess) {
      AudioService.playCriticalChime(true);
    } else if (rollResult.isCritFail) {
      AudioService.playCriticalChime(false);
    }

    setLatestRoll(rollResult);
  };

  // Learn / Add Invocation to Character
  const handleLearnInvocation = (inv) => {
    const existingIdx = knownInvocations.findIndex(k => k.name.toLowerCase() === inv.name.toLowerCase());
    if (existingIdx >= 0) {
      alert(`Invocation "${inv.name}" is already known by this operative.`);
      return;
    }
    const newInv = {
      ...inv,
      id: `inv_${Date.now()}`,
      rank: 1,
      cp: 1
    };
    updateField('invocations', [...knownInvocations, newInv]);
    AudioService.playTerminalBeep(1200, 0.03);
  };

  // Remove known Invocation
  const handleRemoveKnownInvocation = (idx) => {
    const target = knownInvocations[idx];
    const name = target?.name || 'Invocation';
    if (!confirmTypedDeletion(name, 'invocation power')) return;
    const updated = knownInvocations.filter((_, i) => i !== idx);
    updateField('invocations', updated);
  };

  // Update Invocation Rank
  const handleUpdateInvocationRank = (idx, newRank) => {
    const clamped = Math.min(10, Math.max(1, parseInt(newRank, 10) || 1));
    const updated = [...knownInvocations];
    updated[idx] = { ...updated[idx], rank: clamped };
    updateField('invocations', updated);
  };

  // Repurpose Invocation as Special Ability
  const handleRepurposeToSpecialAbility = (inv) => {
    const newAbility = {
      id: `spec_abil_${Date.now()}`,
      name: `${inv.name} (Inherent)`,
      category: 'Special Ability',
      type: 'Special Ability',
      discipline: inv.discipline,
      subSkill: inv.subSkill,
      baseDC: inv.baseDC,
      time: inv.time,
      range: inv.range,
      area: inv.area,
      duration: inv.duration,
      resistance: inv.resistance,
      damage: inv.damage,
      description: inv.description,
      scaling: inv.scaling,
      cp: 5,
      isInherent: true
    };
    updateField('special_abilities', [...specialAbilities, newAbility]);
    setActiveTab('special_abilities');
    AudioService.playCriticalChime(true);
  };

  // Remove Special Ability
  const handleRemoveSpecialAbility = (idx) => {
    const target = specialAbilities[idx];
    const name = target?.name || 'Special Ability';
    if (!confirmTypedDeletion(name, 'special ability')) return;
    const updated = specialAbilities.filter((_, i) => i !== idx);
    updateField('special_abilities', updated);
  };

  // Save Custom Invocation Build
  const handleSaveCustomInvocation = (e) => {
    e.preventDefault();
    if (!customForm.name.trim()) return;
    const newInv = {
      ...customForm,
      id: `custom_inv_${Date.now()}`
    };
    updateField('invocations', [...knownInvocations, newInv]);
    setIsBuildInvocationOpen(false);
    AudioService.playCriticalChime(true);
  };

  // Save Custom Special Ability Build
  const handleSaveCustomSpecialAbility = (e) => {
    e.preventDefault();
    if (!customForm.name.trim()) return;
    const newAbil = {
      ...customForm,
      id: `custom_abil_${Date.now()}`,
      type: 'Special Ability',
      category: 'Special Ability',
      isInherent: true
    };
    updateField('special_abilities', [...specialAbilities, newAbil]);
    setIsBuildSpecialAbilityOpen(false);
    AudioService.playCriticalChime(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 overflow-y-auto">
      <div className="bg-[#0c121e] border border-purple-500/40 rounded-2xl max-w-5xl w-full p-4 sm:p-7 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-slate-100 space-y-5 my-4 sm:my-6">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-purple-950/80 rounded-lg border border-purple-500/40 text-purple-300">
                <Sparkles size={22} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-200 to-cyan-200">
                  Metaphysics, Invocations &amp; Special Abilities
                </h2>
                <p className="text-xs text-slate-400">
                  Awakened Disciplines, 12 Core Focus Skills, Invocation Formulas &amp; Inherent Powers
                </p>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <X size={14} />
            <span>Close Codex</span>
          </button>
        </div>

        {/* Latest Dice Roll Banner if present */}
        {latestRoll && (
          <div className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
            latestRoll.isCritSuccess 
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : latestRoll.isCritFail
              ? 'bg-rose-500/20 border-rose-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-slate-900/95 border-purple-500/50 text-slate-100 shadow-lg'
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold font-mono text-purple-300 flex items-center gap-1.5">
                <span>🎲</span> {latestRoll.total}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span>{latestRoll.label}</span>
                  <span className="font-mono text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/30 text-[10px]">
                    {latestRoll.expression}
                  </span>
                  {latestRoll.isCritSuccess && (
                    <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider animate-pulse">
                      ⚡ CRITICAL SUCCESS (+30 CHECK / MIRACULOUS TRANSCENDENCE)!
                    </span>
                  )}
                  {latestRoll.isCritFail && (
                    <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">
                      💀 CRITICAL MISTAKE (-10 CHECK / DISASTROUS BACKFIRE)!
                    </span>
                  )}
                  {latestRoll.total <= 0 && (
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                      ⚠️ RESULT &le; 0: ENERGY SURGE / FIZZLE (Doubled Essence Cost &amp; Strain)!
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Rolls: [{latestRoll.rolls.map(r => r.value).join(', ')}] {latestRoll.modifier !== 0 ? (latestRoll.modifier > 0 ? `+ ${latestRoll.modifier}` : `${latestRoll.modifier}`) : ''}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLatestRoll(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tradition / Governing Mental Attribute Configurator */}
        <div className="bg-slate-950/80 border border-purple-900/50 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🧠</span> Tradition Governing Attribute:
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {[
                { id: 'attr-intellect', label: 'Intellect (Arcane)', total: getAttrTotal('attr-intellect') },
                { id: 'attr-wisdom', label: 'Wisdom (Faith/Psionics)', total: getAttrTotal('attr-wisdom') },
                { id: 'attr-charisma', label: 'Charisma (Inherent)', total: getAttrTotal('attr-charisma') }
              ].map(attr => (
                <button
                  key={attr.id}
                  type="button"
                  onClick={() => setGoverningAttr(attr.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    governingAttr === attr.id
                      ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {attr.label} <span className="text-amber-300">+{attr.total}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Attune Skill Rank:</span>
            <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
              {attuneRank} Ranks (+{totalAttune})
            </span>
          </div>
        </div>

        {/* Dedicated Essence Pool & Channeling Hub */}
        <div className="bg-slate-950/90 border border-purple-900/60 rounded-xl p-3.5 space-y-2.5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>💠</span> Essence Reservoir:
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className={`text-base font-extrabold ${currentEssence === 0 ? 'text-rose-400 animate-pulse' : 'text-cyan-200'}`}>
                  {currentEssence}
                </span>
                <span className="text-slate-500 text-xs">/</span>
                <span className="text-xs text-slate-300 font-bold">{maxEssencePool} Max</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => handleAdjustEssence(-1)}
                  disabled={currentEssence <= 0}
                  className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-40"
                  title="Spend 1 Essence"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustEssence(1)}
                  disabled={currentEssence >= maxEssencePool}
                  className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-40"
                  title="Gain 1 Essence"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={handleLightRestEssence}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-900/60 text-[10px] font-mono font-bold cursor-pointer"
                  title="Light Rest: Recover Key Ability Modifier (min 1) per hour"
                >
                  Light Rest (+{Math.max(1, governingAttrTotal)})
                </button>
                <button
                  type="button"
                  onClick={handleRestoreFullEssence}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900/60 text-[10px] font-mono font-bold cursor-pointer"
                  title="Full Rest: 100% Restore"
                >
                  Full Rest
                </button>
              </div>
            </div>

            {/* Formula Breakdown Tooltip / Badge */}
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-2">
              <span title="Sum of all 6 Ability Scores">Substrate: <strong className="text-slate-200">+{abilitySubstrate}</strong></span>
              <span className="text-slate-600">•</span>
              <span title="Attune Skill Rank">Conduit (Attune): <strong className="text-purple-300">+{attuneRank}</strong></span>
              <span className="text-slate-600">•</span>
              <span title="Sum of ranks across all known Discipline focus skills">Breadth (Disciplines): <strong className="text-cyan-300">+{totalDisciplineRanks}</strong></span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-300 ${
                currentEssence === 0 
                  ? 'bg-rose-600' 
                  : currentEssence / maxEssencePool < 0.25 
                    ? 'bg-amber-500' 
                    : 'bg-gradient-to-r from-purple-600 to-cyan-500'
              }`}
              style={{ width: `${maxEssencePool > 0 ? (currentEssence / maxEssencePool) * 100 : 0}%` }}
            />
          </div>

          {/* The Burn Warning */}
          {currentEssence === 0 && (
            <div className="bg-rose-950/70 border border-rose-600/70 text-rose-300 text-xs px-3 py-1.5 rounded-lg flex items-center justify-between font-mono animate-pulse">
              <span>🔥 <strong>THE BURN ACTIVE:</strong> Essence Pool depleted! Each point of Essence needed deals <strong>2 points of direct Health damage</strong> (bypasses DR &amp; Stamina).</span>
            </div>
          )}

          {/* Tactical Quick Reference Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono text-slate-400">
            <div className="bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
              <span className="text-slate-500">Take 10 Potency:</span> <span className="text-amber-300 font-bold">Key + Skill + Inv + 10</span>
            </div>
            <div className="bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
              <span className="text-slate-500">Base Costs:</span> <span className="text-purple-300 font-bold">DC 5–10: 0 | DC 15: 1 | DC 20: 2</span>
            </div>
            <div className="bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
              <span className="text-slate-500">Ranges:</span> <span className="text-cyan-300 font-bold">Melee +5 | Close 0 | Med -5 | Lng -10</span>
            </div>
            <div className="bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
              <span className="text-slate-500">Countering:</span> <span className="text-emerald-300 font-bold">Step 1: Attune → Step 2: Focus</span>
            </div>
          </div>
        </div>

        {/* 3 Main Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('disciplines')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'disciplines'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>🔮</span>
            <span>Disciplines &amp; Awakened ({awakenedList.length}/6)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invocations')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'invocations'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>📜</span>
            <span>Invocations Catalog ({knownInvocations.length} Known)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('special_abilities')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'special_abilities'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>⚡</span>
            <span>Special Abilities ({specialAbilities.length} Inherent)</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: DISCIPLINES & AWAKENED FEATURE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'disciplines' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-purple-900/40 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
              <strong className="text-purple-300">Awakened Feature Mechanics:</strong> Purchasing the Awakened feature for a discipline (3 CP / 5 AP) unlocks access to the <strong className="text-amber-300">Attune</strong> skill as well as the <strong className="text-cyan-300">2 Associated Discipline Skills</strong>. These skills are leveled up to 20 ranks just like standard skills to increase invocation potency and check scores.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {METAPHYSICAL_DISCIPLINES.map(disc => {
                const isAwakened = isDisciplineAwakened(disc.name);

                return (
                  <div 
                    key={disc.id}
                    className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                      isAwakened
                        ? 'bg-purple-950/40 border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{disc.icon}</span>
                          <div>
                            <h4 className="font-bold text-sm text-slate-100">{disc.name}</h4>
                            <span className="text-[10px] font-mono text-purple-400 uppercase">Core Discipline</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isAwakened 
                            ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500'
                        }`}>
                          {isAwakened ? 'Awakened' : 'Dormant'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {disc.description}
                      </p>

                      {/* Associated Skills Section */}
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Associated Skills (Max 20 Ranks):
                        </div>
                        {disc.skills.map(skill => {
                          const rank = getNum(`skill-${skill.id}-rank`, 0);
                          const mod = getNum(`skill-${skill.id}-mod`, 0);
                          const total = rank + mod;

                          return (
                            <div key={skill.id} className="flex items-center justify-between text-xs bg-slate-950/80 px-2 py-1 rounded border border-slate-800/80">
                              <span className="font-medium text-slate-200">{skill.name}</span>
                              <div className="flex items-center gap-1.5 font-mono">
                                {isAwakened && (
                                  <button
                                    type="button"
                                    onClick={() => updateField(`skill-${skill.id}-rank`, Math.max(0, rank - 1))}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                                  >
                                    -
                                  </button>
                                )}
                                <span className={`w-7 text-center font-bold ${isAwakened ? 'text-cyan-300' : 'text-slate-600'}`}>
                                  {rank}
                                </span>
                                {isAwakened && (
                                  <button
                                    type="button"
                                    onClick={() => updateField(`skill-${skill.id}-rank`, Math.min(20, rank + 1))}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                )}
                                {mod !== 0 && (
                                  <span className="text-[10px] text-amber-400">
                                    {mod > 0 ? `+${mod}` : mod}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-850 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Cost: <strong className="text-amber-300">3 CP</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAwakened(disc)}
                        className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          isAwakened
                            ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300'
                            : 'bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 shadow-sm'
                        }`}
                      >
                        {isAwakened ? 'Remove Awakened' : 'Purchase Awakened'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: INVOCATIONS CATALOG & KNOWN INVOCATIONS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'invocations' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDisciplineId('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                    selectedDisciplineId === 'all'
                      ? 'bg-purple-950 text-purple-200 border border-purple-500/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Disciplines
                </button>
                {METAPHYSICAL_DISCIPLINES.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDisciplineId(d.name)}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer flex items-center gap-1 ${
                      selectedDisciplineId === d.name
                        ? 'bg-purple-950 text-purple-200 border border-purple-500/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{d.icon}</span>
                    <span>{d.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuildInvocationOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-purple-100 rounded-lg text-xs font-bold uppercase tracking-wider border border-purple-400/50 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>+ Build Invocation</span>
                </button>
              </div>
            </div>

            {/* Known Invocations Section on Sheet */}
            {knownInvocations.length > 0 && (
              <div className="bg-slate-900/60 border border-purple-900/60 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                    <span>📜</span> Active Learned Invocations ({knownInvocations.length})
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Formula: Attr + Discipline Skill + Level (1-10)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {knownInvocations.map((inv, idx) => {
                    const calc = calculateInvocationScore(inv);

                    return (
                      <div key={inv.id || idx} className="bg-slate-950/80 border border-purple-900/50 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                              <span>{inv.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                                {inv.discipline} ({inv.subSkill})
                              </span>
                            </h4>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              DC {inv.baseDC || 15} • {inv.time || '1 Action'} • {inv.range || 'Touch'} • {inv.duration || 'Instant'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRollInvocation(inv)}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                              title="Roll Invocation Check (1d20 + Score)"
                            >
                              <span>🎲</span>
                              <span>+{calc.totalScore}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveKnownInvocation(idx)}
                              className="text-slate-500 hover:text-red-400 text-sm font-bold px-1 cursor-pointer"
                            >
                              &times;
                            </button>
                          </div>
                        </div>

                        {/* Calculated Score Breakdown Card */}
                        <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">
                              Key (+{calc.governingAttrTotal}) + {calc.skillName} (+{calc.skillRank}) + Inv ({calc.invLevel})
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-300" title="Operational Safety Default Potency (Take 10)">
                                Take 10: {calc.take10Score}
                              </span>
                              <span className="font-bold text-cyan-300 text-xs" title="Roll Modifier">
                                (Roll: +{calc.totalScore})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                            <span>Cost: <strong className="text-purple-300">{calc.baseEssenceCost} Essence</strong> (Base DC {calc.baseDC})</span>
                            <span>Target DC: <strong className="text-amber-300">DC {calc.targetSaveDC}</strong></span>
                          </div>
                        </div>

                        {/* Rank Adjuster */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">Invocation Level:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateInvocationRank(idx, calc.invLevel - 1)}
                                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-amber-300 px-1">
                                {calc.invLevel}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateInvocationRank(idx, calc.invLevel + 1)}
                                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRepurposeToSpecialAbility(inv)}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-200 text-[10px] font-bold rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Repurpose as inherent Special Ability"
                          >
                            <Copy size={11} />
                            <span>Make Inherent</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Catalog Listing */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📚</span> Canonical Invocations Catalog
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CANONICAL_INVOCATIONS
                  .filter(inv => selectedDisciplineId === 'all' || inv.discipline.toLowerCase() === selectedDisciplineId.toLowerCase())
                  .map(inv => {
                    const calc = calculateInvocationScore(inv);
                    const isKnown = knownInvocations.some(k => k.name.toLowerCase() === inv.name.toLowerCase());

                    return (
                      <div key={inv.id} className="bg-slate-950/70 border border-slate-800 hover:border-purple-800/60 rounded-xl p-3.5 space-y-2 flex flex-col justify-between transition-colors">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-xs text-slate-100">{inv.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-800">
                                  {inv.discipline} ({inv.subSkill})
                                </span>
                                <span className="text-[10px] font-mono text-cyan-400">
                                  Base DC {inv.baseDC} ({calc.baseEssenceCost} Essence)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800" title="Take 10 Operational Safety">
                                Take 10: {calc.take10Score}
                              </span>
                              <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800" title="Roll Modifier">
                                +{calc.totalScore}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed mt-2 line-clamp-2">
                            {inv.description}
                          </p>

                          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400 mt-2 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                            <div>Time: <span className="text-slate-200">{inv.time}</span></div>
                            <div>Range: <span className="text-slate-200">{inv.range}</span></div>
                            <div>Duration: <span className="text-slate-200">{inv.duration}</span></div>
                            <div>Save: <span className="text-amber-300">{inv.resistance}</span></div>
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-850 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleRepurposeToSpecialAbility(inv)}
                            className="text-[10px] font-bold text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                            title="Repurpose as an inherent Special Ability"
                          >
                            <Copy size={12} />
                            <span>Repurpose as Special Ability</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLearnInvocation(inv)}
                            disabled={isKnown}
                            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              isKnown
                                ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-default'
                                : 'bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 shadow-sm'
                            }`}
                          >
                            {isKnown ? 'Learned' : '+ Learn Power'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: SPECIAL ABILITIES (INHERENT POWERS) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'special_abilities' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl p-4 text-xs text-slate-300 leading-relaxed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <strong className="text-cyan-300">Special Abilities Architecture:</strong> Special Abilities are inherent capabilities (biological, racial, cybernetic, or anomalous) built using the Invocation mechanics, but used as <strong className="text-amber-300">inherent traits without requiring the Awakened feature</strong>.
              </div>
              <button
                type="button"
                onClick={() => setIsBuildSpecialAbilityOpen(true)}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
              >
                <Plus size={13} />
                <span>+ Build Special Ability</span>
              </button>
            </div>

            {specialAbilities.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl space-y-2">
                <span className="text-3xl">⚡</span>
                <div className="text-xs text-slate-400 font-bold">No Special Abilities Added</div>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Build custom inherent traits or click "Make Inherent" on any Invocation in the catalog to repurpose it without discipline locks.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {specialAbilities.map((abil, idx) => (
                  <div key={abil.id || idx} className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-4 space-y-2.5 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-cyan-300">{abil.name}</h4>
                          <span className="text-[10px] font-mono text-cyan-500 uppercase">
                            Inherent Special Ability {abil.discipline ? `(${abil.discipline})` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {abil.damage && (
                            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                              {abil.damage}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialAbility(idx)}
                            className="text-slate-500 hover:text-red-400 text-sm font-bold px-1 cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      </div>

                      {abil.description && (
                        <p className="text-[11.5px] text-slate-300 leading-relaxed mt-2">
                          {abil.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 mt-2.5 bg-slate-900/70 p-2 rounded border border-slate-800">
                        <div>Time: <span className="text-slate-200">{abil.time || '1 Action'}</span></div>
                        <div>Range: <span className="text-slate-200">{abil.range || 'Self'}</span></div>
                        <div>Area: <span className="text-slate-200">{abil.area || 'Personal'}</span></div>
                        <div>Duration: <span className="text-slate-200">{abil.duration || 'Instant'}</span></div>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-400">
                        Cost: <strong className="text-amber-300">{abil.cp || 5} CP</strong>
                      </span>
                      {abil.damage && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = rollDice(abil.damage, { characterName: characterData['char-name'] || 'Hero', label: `${abil.name} Activation` });
                            AudioService.playDiceRollSound();
                            setLatestRoll(res);
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>🎲 Roll</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SUB-MODAL: BUILD INVOCATION FORM */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {isBuildInvocationOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
            <form onSubmit={handleSaveCustomInvocation} className="bg-[#0e1524] border border-purple-500/50 rounded-xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 size={16} /> + Build Custom Invocation
                </h3>
                <button type="button" onClick={() => setIsBuildInvocationOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Invocation Name</label>
                  <input
                    type="text"
                    required
                    value={customForm.name}
                    onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                    placeholder="e.g., Quantum Warp Tunnel"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Discipline</label>
                  <select
                    value={customForm.discipline}
                    onChange={(e) => setCustomForm({ ...customForm, discipline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  >
                    {METAPHYSICAL_DISCIPLINES.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sub-Skill Focus</label>
                  <input
                    type="text"
                    value={customForm.subSkill}
                    onChange={(e) => setCustomForm({ ...customForm, subSkill: e.target.value })}
                    placeholder="e.g., Teleport or Force"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Base DC Difficulty</label>
                  <input
                    type="number"
                    value={customForm.baseDC}
                    onChange={(e) => setCustomForm({ ...customForm, baseDC: parseInt(e.target.value, 10) || 15 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Casting Time</label>
                  <input
                    type="text"
                    value={customForm.time}
                    onChange={(e) => setCustomForm({ ...customForm, time: e.target.value })}
                    placeholder="1 Action / Bonus"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Range</label>
                  <input
                    type="text"
                    value={customForm.range}
                    onChange={(e) => setCustomForm({ ...customForm, range: e.target.value })}
                    placeholder="Touch / 60 ft"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Damage / Effect Formula</label>
                  <input
                    type="text"
                    value={customForm.damage}
                    onChange={(e) => setCustomForm({ ...customForm, damage: e.target.value })}
                    placeholder="e.g., 3d6 Energy"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Effect Description</label>
                  <textarea
                    rows={2}
                    value={customForm.description}
                    onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                    placeholder="Describe the reality manipulation mechanics..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuildInvocationOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold"
                >
                  Save Invocation
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SUB-MODAL: BUILD SPECIAL ABILITY FORM */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {isBuildSpecialAbilityOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
            <form onSubmit={handleSaveCustomSpecialAbility} className="bg-[#0e1524] border border-cyan-500/50 rounded-xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={16} /> + Build Inherent Special Ability
                </h3>
                <button type="button" onClick={() => setIsBuildSpecialAbilityOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ability Name</label>
                  <input
                    type="text"
                    required
                    value={customForm.name}
                    onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                    placeholder="e.g., Cybernetic Retractable Monoblade"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Activation Time</label>
                  <input
                    type="text"
                    value={customForm.time}
                    onChange={(e) => setCustomForm({ ...customForm, time: e.target.value })}
                    placeholder="Bonus Action / Reaction"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">CP Cost</label>
                  <input
                    type="number"
                    value={customForm.cp}
                    onChange={(e) => setCustomForm({ ...customForm, cp: parseInt(e.target.value, 10) || 5 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Range / Reach</label>
                  <input
                    type="text"
                    value={customForm.range}
                    onChange={(e) => setCustomForm({ ...customForm, range: e.target.value })}
                    placeholder="Self / Melee / 30 ft"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Damage Formula / Effect</label>
                  <input
                    type="text"
                    value={customForm.damage}
                    onChange={(e) => setCustomForm({ ...customForm, damage: e.target.value })}
                    placeholder="e.g., 2d8 Slashing"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ability Description</label>
                  <textarea
                    rows={2}
                    value={customForm.description}
                    onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                    placeholder="Describe physiological or cybernetic mechanics..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuildSpecialAbilityOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Save Special Ability
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default React.memo(MetaphysicsModal);
