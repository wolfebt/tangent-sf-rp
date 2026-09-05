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
  Edit3,
  Filter,
  List,
  Grid,
  Info,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Lock
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { METAPHYSICAL_DISCIPLINES } from '../../../data/skillsData';
import { rollDice } from '../../../services/diceService';
import { AudioService } from '../../../services/audioService';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { DEFAULT_INVOCATIONS } from '../../../data/invocationsData';
import { resolveMetaSkillForInvocation } from '../../../utils/metaphysicsUtils';
import FolioTooltip from '../shared/FolioTooltip';
import { checkPrerequisite } from '../../../utils/prerequisiteEvaluator';

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

// Canonical Inherent Special Abilities for Omnicortex Catalog
const CANONICAL_SPECIAL_ABILITIES = [
  {
    id: 'spec-breath-weapon',
    name: 'Draconic Thermal Breath',
    discipline: 'Energy',
    subSkill: 'Elemental',
    time: '1 Action',
    range: 'Self',
    area: '30 ft Cone',
    duration: 'Instantaneous',
    resistance: 'Reflex (Half)',
    damage: '3d8 Fire Damage',
    description: 'Exhales a devastating torrent of superheated dragon-fire or plasma directly from biological glandular chambers or cybernetic thermocores.',
    scaling: '+1d8 Fire damage per 2 CP allocated.',
    cp: 5,
    isInherent: true
  },
  {
    id: 'spec-sonic-cannon',
    name: 'Cybernetic Sonic Scream',
    discipline: 'Energy',
    subSkill: 'Force',
    time: '1 Action',
    range: '60 ft Line',
    area: '5 ft Wide Beam',
    duration: 'Instantaneous',
    resistance: 'Fortitude (Save)',
    damage: '2d10 Concussive + Deafened',
    description: 'Fires high-amplitude sonic resonance through throat implants, pulverizing armor bulkheads and disorienting synaptic targets.',
    scaling: 'Stuns targets for 1 round on critical hits.',
    cp: 5,
    isInherent: true
  },
  {
    id: 'spec-phase-shift',
    name: 'Spatial Phase Shift',
    discipline: 'Dimension',
    subSkill: 'Teleport',
    time: 'Bonus Action',
    range: '40 ft',
    area: 'Self',
    duration: 'Instantaneous',
    resistance: 'None',
    damage: 'Tactical Reposition',
    description: 'Inherent dimensional anomaly allowing instantaneous micro-teleportation across tactical lines without traversing physical obstacle planes.',
    scaling: 'Increases shift distance by +10 ft per 2 CP allocated.',
    cp: 5,
    isInherent: true
  },
  {
    id: 'spec-synaptic-emp',
    name: 'Synaptic EMP Surge',
    discipline: 'Mental',
    subSkill: 'Projection',
    time: '1 Action',
    range: 'Self',
    area: '20 ft Radius',
    duration: '1 Round',
    resistance: 'Will / Tech Save',
    damage: '2d6 Ion + Cyber Shutdown',
    description: 'Emits a localized electromagnetic and neural shockwave that disables unshielded electronics, drones, and enemy neural cyberware.',
    scaling: '+10 ft blast radius per 2 CP allocated.',
    cp: 5,
    isInherent: true
  },
  {
    id: 'spec-biomorphic-claws',
    name: 'Biomorphic Monomolecular Claws',
    discipline: 'Matter',
    subSkill: 'Enhancement',
    time: 'Bonus Action (Stance)',
    range: 'Melee',
    area: 'Personal',
    duration: 'Sustained',
    resistance: 'None',
    damage: '2d8 Slashing (AP 4)',
    description: 'Extends carbon-nanotube reinforced talons or biomechanical blades capable of cleanly piercing standard ballistic plating.',
    scaling: '+1 Strike and +2 Armor Piercing per 2 CP allocated.',
    cp: 5,
    isInherent: true
  },
  {
    id: 'spec-regenerative-surge',
    name: 'Rapid Cellular Regeneration',
    discipline: 'Entropy',
    subSkill: 'Order',
    time: 'Reaction',
    range: 'Self',
    area: 'Personal',
    duration: 'Instantaneous',
    resistance: 'None',
    damage: 'Heals 2d8+Con Vitality',
    description: 'Triggered metabolic acceleration that rapidly knits severed flesh, closes bleed wounds, and purges toxic contaminants.',
    scaling: 'Can be triggered 1 additional time per encounter per 2 CP allocated.',
    cp: 5,
    isInherent: true
  },
  {
    id: 'spec-chameleon-shroud',
    name: 'Adaptive Optical Camouflage',
    discipline: 'Illusion',
    subSkill: 'Phantasm',
    time: '1 Action',
    range: 'Self',
    area: 'Personal',
    duration: '10 Minutes',
    resistance: 'Perception opposed',
    damage: '+6 Stealth / Concealment',
    description: 'Dynamic chromatophore skin or light-bending thermoptic skin weave that renders the operative nearly indistinguishable from their surroundings.',
    scaling: 'Grants full Invisibility while stationary.',
    cp: 5,
    isInherent: true
  },
  {
    id: 'spec-gravimetric-anchor',
    name: 'Gravimetric Density Anchor',
    discipline: 'Matter',
    subSkill: 'Transmutation',
    time: 'Reaction',
    range: 'Self',
    area: 'Personal',
    duration: '1 Minute',
    resistance: 'None',
    damage: 'Knockback Immunity + 4 DR',
    description: 'Locks molecular mass to the planetary gravity matrix, completely preventing knockback, forced movement, and trip maneuvers.',
    scaling: 'Grants +2 additional DR against explosive concussive damage.',
    cp: 5,
    isInherent: true
  }
];

// Unified catalog combining rich seed stats and the full 137 Omnicortex database
const ALL_CATALOG_INVOCATIONS = (() => {
  const map = new Map();
  CANONICAL_INVOCATIONS.forEach(inv => {
    const resolved = resolveMetaSkillForInvocation(inv);
    map.set(inv.name.toLowerCase(), {
      ...inv,
      baseSkillId: inv.baseSkillId || resolved.baseSkillId,
      subSkill: inv.subSkill || resolved.subSkill,
      discipline: inv.discipline || resolved.discipline,
      cp: 1,
      powerType: 'invocation'
    });
  });

  DEFAULT_INVOCATIONS.forEach(inv => {
    const key = (inv.name || inv.title || '').toLowerCase();
    if (!map.has(key)) {
      const resolved = resolveMetaSkillForInvocation(inv);
      map.set(key, {
        id: inv.id,
        name: inv.name,
        discipline: inv.discipline || resolved.discipline,
        subSkill: inv.subSkill || resolved.subSkill,
        baseSkillId: inv.baseSkillId || resolved.baseSkillId,
        baseDC: inv.baseDC || 15,
        time: inv.time || inv.castingTime || '1 Action',
        range: inv.range || 'Touch',
        area: inv.area || 'Single Target',
        duration: inv.duration || 'Instantaneous',
        resistance: inv.resistance || inv.save || 'None',
        damage: inv.damage || 'Effect',
        description: inv.description || (inv.body ? (inv.body.split('\n\n')[1] || inv.body.slice(0, 140)) : 'Omnicortex reality manipulation formula.'),
        scaling: inv.scaling || '+1d6 per Invocation level.',
        cp: 1,
        powerType: 'invocation'
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

export const MetaphysicsModal = ({ isOpen, onClose }) => {
  const { 
    characterData, 
    updateField, 
    handleAddItem, 
    getAttrTotal
  } = useFolio();
  const { openDiceRoller } = useDice();

  // Navigation Tabs: 'disciplines' | 'character_catalog' | 'omnicortex_catalog'
  const [activeTab, setActiveTab] = useState('disciplines');

  // Character Catalog Sub-filters & Search
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState('all'); // 'all' | 'invocations' | 'special_abilities'
  const [catalogDisciplineFilter, setCatalogDisciplineFilter] = useState('all');

  // Omnicortex Catalog Sub-filters & Search
  const [omnicortexSearch, setOmnicortexSearch] = useState('');
  const [omnicortexTypeFilter, setOmnicortexTypeFilter] = useState('all'); // 'all' | 'invocations' | 'special_abilities'
  const [omnicortexDisciplineFilter, setOmnicortexDisciplineFilter] = useState('all');

  // Tradition / Governing Attribute
  const [governingAttr, setGoverningAttr] = useState('attr-intellect');
  const [latestRoll, setLatestRoll] = useState(null);

  // Custom Build & Edit Form State
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [buildModalMode, setBuildModalMode] = useState('create_invocation'); // 'create_invocation' | 'create_special_ability' | 'edit_invocation' | 'edit_special_ability'
  const [editingTargetIndex, setEditingTargetIndex] = useState(null);
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
    cp: 1,
    isInherent: false
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

      if (Array.isArray(characterData.features)) {
        const updatedFeats = characterData.features.filter(f => {
          const n = typeof f === 'object' ? (f.name || '') : String(f);
          return !n.toLowerCase().includes(`awakened: ${disc.name.toLowerCase()}`);
        });
        updateField('features', updatedFeats);
      }
    } else {
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

      if (getNum('skill-meta-attune-rank', 0) === 0) {
        updateField('skill-meta-attune-rank', 1);
        updateField('skill-meta-attune-name', 'Attune');
        updateField('skill-meta-attune-group', 'meta');
      }

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
    openDiceRoller({
      label: `${inv.name} Metaphysics Check`,
      baseModifier: calc.totalScore,
      expression: `2d10${calc.totalScore !== 0 ? (calc.totalScore > 0 ? `+${calc.totalScore}` : `${calc.totalScore}`) : ''}`,
      targetNumber: inv.baseDC || 15,
      rollMode: 'normal',
      characterName: characterData['char-name'] || 'Operative',
      autoRoll: true
    });
  };

  // Learn / Add Invocation to Character
  const handleLearnInvocation = (inv) => {
    const existingIdx = knownInvocations.findIndex(k => (k.name || '').toLowerCase() === (inv.name || '').toLowerCase());
    if (existingIdx >= 0) {
      alert(`Invocation "${inv.name}" is already known by this operative.`);
      return;
    }
    const resolved = resolveMetaSkillForInvocation(inv);
    const newInv = {
      ...inv,
      id: inv.id || `inv_${Date.now()}`,
      rank: 1,
      cp: 1,
      discipline: inv.discipline || resolved.discipline,
      subSkill: inv.subSkill || resolved.subSkill,
      baseSkillId: inv.baseSkillId || resolved.baseSkillId,
      mod: 0
    };
    updateField('invocations', [...knownInvocations, newInv]);
    AudioService.playTerminalBeep(1200, 0.03);
  };

  // Add Special Ability to Character
  const handleAddSpecialAbility = (abil) => {
    const existingIdx = specialAbilities.findIndex(a => (a.name || '').toLowerCase() === (abil.name || '').toLowerCase());
    if (existingIdx >= 0) {
      alert(`Special Ability "${abil.name}" is already possessed by this operative.`);
      return;
    }
    const newAbil = {
      ...abil,
      id: abil.id || `spec_abil_${Date.now()}`,
      category: 'Special Ability',
      type: 'Special Ability',
      cp: abil.cp || 5,
      isInherent: true
    };
    updateField('special_abilities', [...specialAbilities, newAbil]);
    AudioService.playTerminalBeep(1300, 0.04);
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

  // Repurpose Invocation as Inherent Special Ability
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
    setActiveTab('character_catalog');
    setCatalogTypeFilter('special_abilities');
    AudioService.playCriticalChime(true);
  };

  // Codify Special Ability as Codified Invocation
  const handleCodifyToInvocation = (abil) => {
    const newInv = {
      id: `inv_${Date.now()}`,
      name: abil.name.replace('(Inherent)', '').trim(),
      discipline: abil.discipline || 'Energy',
      subSkill: abil.subSkill || 'Elemental',
      baseDC: abil.baseDC || 15,
      time: abil.time || '1 Action',
      range: abil.range || 'Touch',
      area: abil.area || 'Single Target',
      duration: abil.duration || 'Instantaneous',
      resistance: abil.resistance || 'None',
      damage: abil.damage || 'Effect',
      description: abil.description || '',
      scaling: abil.scaling || '+1d6 per Invocation level.',
      rank: 1,
      cp: 1
    };
    updateField('invocations', [...knownInvocations, newInv]);
    setActiveTab('character_catalog');
    setCatalogTypeFilter('invocations');
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

  // Open Edit Form for Invocation
  const handleOpenEditInvocation = (inv, idx) => {
    setCustomForm({
      name: inv.name || '',
      discipline: inv.discipline || 'Entropy',
      subSkill: inv.subSkill || 'Chaos',
      baseDC: inv.baseDC || 15,
      time: inv.time || '1 Action',
      range: inv.range || '30 ft',
      area: inv.area || 'Single Target',
      duration: inv.duration || 'Instantaneous',
      resistance: inv.resistance || 'None',
      damage: inv.damage || '',
      description: inv.description || '',
      scaling: inv.scaling || '',
      rank: inv.rank || 1,
      cp: inv.cp || 1,
      isInherent: false
    });
    setEditingTargetIndex(idx);
    setBuildModalMode('edit_invocation');
    setIsBuildModalOpen(true);
  };

  // Open Edit Form for Special Ability
  const handleOpenEditSpecialAbility = (abil, idx) => {
    setCustomForm({
      name: abil.name || '',
      discipline: abil.discipline || 'Energy',
      subSkill: abil.subSkill || 'Force',
      baseDC: abil.baseDC || 15,
      time: abil.time || '1 Action',
      range: abil.range || '30 ft',
      area: abil.area || 'Single Target',
      duration: abil.duration || 'Instantaneous',
      resistance: abil.resistance || 'None',
      damage: abil.damage || '',
      description: abil.description || '',
      scaling: abil.scaling || '',
      rank: 1,
      cp: abil.cp || 5,
      isInherent: true
    });
    setEditingTargetIndex(idx);
    setBuildModalMode('edit_special_ability');
    setIsBuildModalOpen(true);
  };

  // Save Build or Edit Form
  const handleSaveCustomForm = (e) => {
    e.preventDefault();
    if (!customForm.name.trim()) return;

    if (buildModalMode === 'create_invocation') {
      const newInv = {
        ...customForm,
        id: `custom_inv_${Date.now()}`
      };
      updateField('invocations', [...knownInvocations, newInv]);
    } else if (buildModalMode === 'edit_invocation' && editingTargetIndex !== null) {
      const updated = [...knownInvocations];
      updated[editingTargetIndex] = {
        ...updated[editingTargetIndex],
        ...customForm
      };
      updateField('invocations', updated);
    } else if (buildModalMode === 'create_special_ability') {
      const newAbil = {
        ...customForm,
        id: `custom_abil_${Date.now()}`,
        type: 'Special Ability',
        category: 'Special Ability',
        isInherent: true
      };
      updateField('special_abilities', [...specialAbilities, newAbil]);
    } else if (buildModalMode === 'edit_special_ability' && editingTargetIndex !== null) {
      const updated = [...specialAbilities];
      updated[editingTargetIndex] = {
        ...updated[editingTargetIndex],
        ...customForm,
        type: 'Special Ability',
        category: 'Special Ability',
        isInherent: true
      };
      updateField('special_abilities', updated);
    }

    setIsBuildModalOpen(false);
    setEditingTargetIndex(null);
    AudioService.playCriticalChime(true);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBINED CHARACTER'S INVOCATIONS & SPECIAL ABILITIES CATALOG
  // ═══════════════════════════════════════════════════════════════════════════
  const characterPowers = useMemo(() => {
    const invs = knownInvocations.map((inv, idx) => ({
      ...inv,
      powerType: 'invocation',
      originalIndex: idx
    }));
    const abs = specialAbilities.map((abil, idx) => ({
      ...abil,
      powerType: 'special_ability',
      originalIndex: idx
    }));
    return [...invs, ...abs];
  }, [knownInvocations, specialAbilities]);

  const filteredCharacterPowers = useMemo(() => {
    return characterPowers.filter(p => {
      // Type filter
      if (catalogTypeFilter === 'invocations' && p.powerType !== 'invocation') return false;
      if (catalogTypeFilter === 'special_abilities' && p.powerType !== 'special_ability') return false;

      // Discipline filter
      if (catalogDisciplineFilter !== 'all') {
        const disc = (p.discipline || '').toLowerCase();
        if (!disc.includes(catalogDisciplineFilter.toLowerCase())) return false;
      }

      // Search query
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchDisc = (p.discipline || '').toLowerCase().includes(q);
        const matchSub = (p.subSkill || '').toLowerCase().includes(q);
        const matchDmg = (p.damage || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchDisc && !matchSub && !matchDmg) return false;
      }

      return true;
    });
  }, [characterPowers, catalogTypeFilter, catalogDisciplineFilter, catalogSearch]);

  const totalCharacterCP = useMemo(() => {
    const invCP = knownInvocations.reduce((acc, inv) => acc + (parseInt(inv.cp, 10) || 1), 0);
    const abilCP = specialAbilities.reduce((acc, a) => acc + (parseInt(a.cp, 10) || 5), 0);
    return { invCP, abilCP, total: invCP + abilCP };
  }, [knownInvocations, specialAbilities]);

  // Combined Omnicortex Catalog (Invocations + Canonical Special Abilities)
  const combinedOmnicortexCatalog = useMemo(() => {
    const invocations = ALL_CATALOG_INVOCATIONS.map(inv => ({
      ...inv,
      powerType: 'invocation'
    }));
    const abilities = CANONICAL_SPECIAL_ABILITIES.map(abil => ({
      ...abil,
      powerType: 'special_ability'
    }));
    return [...invocations, ...abilities];
  }, []);

  const filteredOmnicortexCatalog = useMemo(() => {
    return combinedOmnicortexCatalog.filter(item => {
      if (omnicortexTypeFilter === 'invocations' && item.powerType !== 'invocation') return false;
      if (omnicortexTypeFilter === 'special_abilities' && item.powerType !== 'special_ability') return false;

      if (omnicortexDisciplineFilter !== 'all') {
        const disc = (item.discipline || '').toLowerCase();
        if (!disc.includes(omnicortexDisciplineFilter.toLowerCase())) return false;
      }

      if (omnicortexSearch.trim()) {
        const q = omnicortexSearch.toLowerCase();
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchDisc = (item.discipline || '').toLowerCase().includes(q);
        const matchSub = (item.subSkill || '').toLowerCase().includes(q);
        const matchDmg = (item.damage || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchDisc && !matchSub && !matchDmg) return false;
      }

      return true;
    });
  }, [combinedOmnicortexCatalog, omnicortexTypeFilter, omnicortexDisciplineFilter, omnicortexSearch]);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 pt-8 sm:pt-12 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0c121e] border border-purple-500/40 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-slate-100 space-y-4">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-900/60 pb-3.5">
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
                  Awakened Disciplines, 12 Core Focus Skills, Inherent Abilities &amp; Character Catalog
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
        <div className="bg-slate-950/80 border border-purple-900/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
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
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
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
              <span title="Sum of ranks across all known Discipline focus skills">Breadth: <strong className="text-cyan-300">+{totalDisciplineRanks}</strong></span>
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
        </div>

        {/* 3 Main Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
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
            onClick={() => {
              setActiveTab('character_catalog');
              setCatalogTypeFilter('all');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'character_catalog' || activeTab === 'invocations' || activeTab === 'special_abilities'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>📋</span>
            <span>Character's Catalog ({characterPowers.length} Active Powers)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('omnicortex_catalog')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'omnicortex_catalog'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>📚</span>
            <span>Omnicortex Catalog ({combinedOmnicortexCatalog.length} Formulas)</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: CONSOLIDATED DISCIPLINES & AWAKENED FEATURE (LIST LAYOUT)  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'disciplines' && (
          <div className="space-y-3.5">
            <div className="bg-slate-900/60 border border-purple-900/40 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <strong className="text-purple-300">Awakened Feature Mechanics:</strong> Awakening a discipline costs 3 CP, unlocking the discipline and its 2 paired focus skills. The Attune conduit skill applies to all awakened reality manipulation.
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-700/60 text-purple-300 font-mono text-[11px] font-bold">
                  {awakenedList.length} of 6 Awakened
                </span>
              </div>
            </div>

            {/* Consolidated List-Type Layout */}
            <div className="space-y-2.5">
              {METAPHYSICAL_DISCIPLINES.map(disc => {
                const isAwakened = isDisciplineAwakened(disc.name);

                return (
                  <div 
                    key={disc.id}
                    className={`rounded-xl p-3 sm:p-4 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 ${
                      isAwakened
                        ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_16px_rgba(168,85,247,0.12)] ring-1 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700/80'
                    }`}
                  >
                    {/* Left: Discipline Identity & Tagline */}
                    <div className="flex items-start gap-3 min-w-[260px] lg:max-w-xs xl:max-w-sm">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border shrink-0 ${
                        isAwakened 
                          ? 'bg-purple-950/90 border-purple-500/50 text-purple-200 shadow-inner' 
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {disc.icon}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-100 tracking-wide">{disc.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isAwakened 
                              ? 'bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 shadow-sm' 
                              : 'bg-slate-900 border border-slate-800 text-slate-500'
                          }`}>
                            {isAwakened ? 'Awakened' : 'Dormant'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                          {disc.description}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Associated Skills with Steppers */}
                    <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-900/80 p-2 sm:p-2.5 rounded-xl border border-slate-800/90">
                      {disc.skills.map(skill => {
                        const rank = getNum(`skill-${skill.id}-rank`, 0);
                        const mod = getNum(`skill-${skill.id}-mod`, 0);

                        return (
                          <div 
                            key={skill.id} 
                            className={`flex-1 min-w-[135px] flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                              isAwakened
                                ? 'bg-slate-950/80 border-slate-800/90'
                                : 'bg-slate-950/40 border-slate-900 text-slate-500'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className={`font-semibold text-xs ${isAwakened ? 'text-slate-200' : 'text-slate-500'}`}>
                                {skill.name}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                Max 20 Ranks
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 font-mono">
                              {isAwakened && (
                                <button
                                  type="button"
                                  onClick={() => updateField(`skill-${skill.id}-rank`, Math.max(0, rank - 1))}
                                  className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors active:scale-95"
                                  title="Decrease Rank"
                                >
                                  -
                                </button>
                              )}
                              <span className={`w-6 text-center font-bold text-xs ${
                                isAwakened ? 'text-cyan-300' : 'text-slate-600'
                              }`}>
                                {rank}
                              </span>
                              {isAwakened && (
                                <button
                                  type="button"
                                  onClick={() => updateField(`skill-${skill.id}-rank`, Math.min(20, rank + 1))}
                                  className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors active:scale-95"
                                  title="Increase Rank"
                                >
                                  +
                                </button>
                              )}
                              {mod !== 0 && (
                                <span className="text-[10px] text-amber-400 font-bold ml-0.5">
                                  {mod > 0 ? `+${mod}` : mod}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Cost & Awaken Toggle Action */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-850">
                      <span className="text-[11px] font-mono text-slate-400">
                        Cost: <strong className="text-amber-300">3 CP</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAwakened(disc)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                          isAwakened
                            ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 hover:text-white'
                            : 'bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-200 hover:text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        }`}
                      >
                        {isAwakened ? (
                          <>
                            <span>&times;</span>
                            <span>Remove Awakened</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} className="text-purple-400" />
                            <span>Awaken (3 CP)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: CATALOG OF THE CHARACTER'S INVOCATIONS & SPECIAL ABILITIES  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'character_catalog' || activeTab === 'invocations' || activeTab === 'special_abilities') && (
          <div className="space-y-4">
            
            {/* Header / Summary Status Banner */}
            <div className="bg-slate-950/70 border border-purple-900/50 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <span>📋</span> Character Powers Catalog
                </h3>
                <p className="text-[11px] text-slate-400">
                  Comprehensive manifest of this operative's active reality invocations and inherent special traits.
                </p>
              </div>

              {/* Statistics & Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400">Invocations:</span>
                  <span className="text-purple-300 font-bold">{knownInvocations.length}</span>
                  <span className="text-slate-600">({totalCharacterCP.invCP} CP)</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Special Abilities:</span>
                  <span className="text-cyan-300 font-bold">{specialAbilities.length}</span>
                  <span className="text-slate-600">({totalCharacterCP.abilCP} CP)</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCustomForm({
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
                      cp: 1,
                      isInherent: false
                    });
                    setBuildModalMode('create_invocation');
                    setIsBuildModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-600/60 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>+ Invocation</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomForm({
                      name: '',
                      discipline: 'Energy',
                      subSkill: 'Force',
                      baseDC: 15,
                      time: '1 Action',
                      range: 'Self',
                      area: 'Personal',
                      duration: 'Instantaneous',
                      resistance: 'None',
                      damage: '',
                      description: '',
                      scaling: '',
                      rank: 1,
                      cp: 5,
                      isInherent: true
                    });
                    setBuildModalMode('create_special_ability');
                    setIsBuildModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-600/60 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>+ Special Ability</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('omnicortex_catalog')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                  title="Browse Omnicortex Database to learn new powers"
                >
                  <BookOpen size={12} />
                  <span>Browse Catalog</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
              {/* Type Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCatalogTypeFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    catalogTypeFilter === 'all'
                      ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Powers ({characterPowers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogTypeFilter('invocations')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    catalogTypeFilter === 'invocations'
                      ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>📜</span>
                  <span>Invocations ({knownInvocations.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogTypeFilter('special_abilities')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    catalogTypeFilter === 'special_abilities'
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚡</span>
                  <span>Special Abilities ({specialAbilities.length})</span>
                </button>
              </div>

              {/* Discipline Selector & Search Box */}
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <select
                  value={catalogDisciplineFilter}
                  onChange={(e) => setCatalogDisciplineFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 outline-none font-mono"
                >
                  <option value="all">All Disciplines</option>
                  {METAPHYSICAL_DISCIPLINES.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <div className="relative flex-1 sm:w-56">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search character's powers..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500/50"
                  />
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredCharacterPowers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl space-y-3 bg-slate-950/40">
                <span className="text-3xl">🔮</span>
                <div className="text-sm text-slate-300 font-bold">
                  {catalogSearch || catalogTypeFilter !== 'all' || catalogDisciplineFilter !== 'all'
                    ? 'No Powers Match Filters'
                    : 'No Invocations or Special Abilities Added Yet'}
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {catalogSearch || catalogTypeFilter !== 'all' || catalogDisciplineFilter !== 'all'
                    ? 'Try adjusting your search criteria or resetting filters.'
                    : 'This character has not acquired any codified Invocations or inherent Special Abilities. Browse the Omnicortex Catalog to learn canonical powers or construct custom traits.'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('omnicortex_catalog')}
                    className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/60 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <BookOpen size={13} />
                    <span>Browse Omnicortex Catalog</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Character Catalog Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCharacterPowers.map((power) => {
                  const isInv = power.powerType === 'invocation';
                  const calc = isInv ? calculateInvocationScore(power) : null;
                  const prereqResult = checkPrerequisite(power, characterData, isInv ? 'invocations' : 'special_abilities');
                  const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                  return (
                    <div 
                      key={power.id || `${power.powerType}_${power.originalIndex}`}
                      className={`border rounded-xl p-4 space-y-3 flex flex-col justify-between transition-all shadow-sm ${
                        isPrereqUnmet
                          ? 'bg-slate-950/70 border-dashed border-rose-900/60 opacity-60 grayscale-[70%] hover:opacity-100 hover:grayscale-0'
                          : isInv 
                          ? 'bg-slate-950/80 border-purple-900/60 hover:border-purple-700/70' 
                          : 'bg-slate-950/80 border-cyan-900/60 hover:border-cyan-700/70'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Power Header */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                isInv 
                                  ? 'bg-purple-950 text-purple-300 border-purple-800' 
                                  : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              }`}>
                                {isInv ? `📜 Invocation (Rank ${power.rank || 1})` : '⚡ Inherent Ability'}
                              </span>

                              {power.discipline && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                                  {power.discipline} {power.subSkill ? `(${power.subSkill})` : ''}
                                </span>
                              )}

                              {isPrereqUnmet && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-rose-950/80 border border-rose-800/80 text-rose-300" title={`Missing: ${prereqResult.unmetReasons.join(', ')}`}>
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Prereq Missing</span>
                                </span>
                              )}
                            </div>

                            <FolioTooltip
                              title={power.name}
                              prerequisites={prereqResult.prerequisiteText}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              description={power.description}
                              tags={[power.discipline, power.subSkill].filter(Boolean)}
                            >
                              <h4 className={`font-bold text-sm cursor-pointer ${
                                isPrereqUnmet ? 'text-slate-400 hover:text-rose-300' : isInv ? 'text-purple-100 hover:text-purple-300' : 'text-cyan-100 hover:text-cyan-300'
                              }`}>
                                {power.name}
                              </h4>
                            </FolioTooltip>
                          </div>

                          {/* Quick Roll / Activation Action */}
                          <div className="flex items-center gap-1 shrink-0">
                            {isInv ? (
                              <button
                                type="button"
                                onClick={() => handleRollInvocation(power)}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                                title={`Roll 2d10 + ${calc.totalScore} vs Base DC ${calc.baseDC}`}
                              >
                                <span>🎲</span>
                                <span>+{calc.totalScore}</span>
                              </button>
                            ) : (
                              power.damage ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    openDiceRoller({
                                      label: `${power.name} Activation`,
                                      expression: power.damage,
                                      baseModifier: 0,
                                      rollMode: 'normal',
                                      characterName: characterData['char-name'] || 'Operative',
                                      autoRoll: true
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                                  title="Roll ability activation / damage"
                                >
                                  <span>🎲</span>
                                  <span>{power.damage}</span>
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                  Active Inherent
                                </span>
                              )
                            )}

                            {/* Edit & Delete Controls */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isInv) {
                                  handleOpenEditInvocation(power, power.originalIndex);
                                } else {
                                  handleOpenEditSpecialAbility(power, power.originalIndex);
                                }
                              }}
                              className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                              title="Edit Power Properties"
                            >
                              <Edit3 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isInv) {
                                  handleRemoveKnownInvocation(power.originalIndex);
                                } else {
                                  handleRemoveSpecialAbility(power.originalIndex);
                                }
                              }}
                              className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                              title="Remove Power"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {power.description && (
                          <p className="text-[11.5px] text-slate-300 leading-relaxed line-clamp-3">
                            {power.description}
                          </p>
                        )}

                        {/* Invocation Take 10 Potency & Essence Cost Strip */}
                        {isInv && (
                          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 space-y-1 text-[10px] font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">
                                Attr (+{calc.governingAttrTotal}) + {calc.skillName} (+{calc.skillRank}) + Lvl ({calc.invLevel})
                              </span>
                              <span className="font-bold text-amber-300" title="Operational Safety Default Potency (Take 10)">
                                Take 10: {calc.take10Score}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400 pt-0.5 border-t border-slate-850">
                              <span>Cost: <strong className="text-purple-300">{calc.baseEssenceCost} Essence</strong> (Base DC {calc.baseDC})</span>
                              <span>Target Save: <strong className="text-amber-300">DC {calc.targetSaveDC}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Parameters Matrix Strip */}
                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                          <div>Time: <span className="text-slate-200">{power.time || '1 Action'}</span></div>
                          <div>Range: <span className="text-slate-200">{power.range || 'Touch'}</span></div>
                          <div>Duration: <span className="text-slate-200">{power.duration || 'Instant'}</span></div>
                          <div>Save: <span className="text-amber-300">{power.resistance || 'None'}</span></div>
                          {power.damage && <div className="col-span-2">Damage: <span className="text-emerald-300 font-bold">{power.damage}</span></div>}
                          {power.scaling && <div className="col-span-2 text-purple-300">Scaling: <span>{power.scaling}</span></div>}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                        {isInv ? (
                          <>
                            {/* Invocation Rank Stepper */}
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span className="text-[10px] text-slate-400">Level:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateInvocationRank(power.originalIndex, (power.rank || 1) - 1)}
                                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-bold text-amber-300 px-1">
                                  {power.rank || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateInvocationRank(power.originalIndex, (power.rank || 1) + 1)}
                                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRepurposeToSpecialAbility(power)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-200 text-[10px] font-bold rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Repurpose as an inherent Special Ability"
                            >
                              <Copy size={11} />
                              <span>Make Inherent</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-mono text-slate-400">
                              Cost: <strong className="text-amber-300">{power.cp || 5} CP</strong>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleCodifyToInvocation(power)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-purple-200 text-[10px] font-bold rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Codify into learned Invocation formula"
                            >
                              <Wand2 size={11} />
                              <span>Codify as Invocation</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: OMNICORTEX CATALOG & COMPENDIUM BROWSER                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'omnicortex_catalog' && (
          <div className="space-y-4">
            {/* Catalog Filter Controls */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setOmnicortexTypeFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    omnicortexTypeFilter === 'all'
                      ? 'bg-purple-950 text-purple-200 border border-purple-500/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({combinedOmnicortexCatalog.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOmnicortexTypeFilter('invocations')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    omnicortexTypeFilter === 'invocations'
                      ? 'bg-purple-950 text-purple-200 border border-purple-500/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>📜</span>
                  <span>Invocations ({ALL_CATALOG_INVOCATIONS.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOmnicortexTypeFilter('special_abilities')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    omnicortexTypeFilter === 'special_abilities'
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚡</span>
                  <span>Special Abilities ({CANONICAL_SPECIAL_ABILITIES.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <select
                  value={omnicortexDisciplineFilter}
                  onChange={(e) => setOmnicortexDisciplineFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 outline-none font-mono"
                >
                  <option value="all">All Disciplines</option>
                  {METAPHYSICAL_DISCIPLINES.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <div className="relative flex-1 sm:w-60">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={omnicortexSearch}
                    onChange={(e) => setOmnicortexSearch(e.target.value)}
                    placeholder="Search Omnicortex library..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500/50"
                  />
                  {omnicortexSearch && (
                    <button
                      type="button"
                      onClick={() => setOmnicortexSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredOmnicortexCatalog.map(item => {
                const isInv = item.powerType === 'invocation';
                const calc = isInv ? calculateInvocationScore(item) : null;
                const isKnown = isInv
                  ? knownInvocations.some(k => k.name.toLowerCase() === item.name.toLowerCase())
                  : specialAbilities.some(a => a.name.toLowerCase() === item.name.toLowerCase());

                const prereqResult = checkPrerequisite(item, characterData, isInv ? 'invocations' : 'special_abilities');
                const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                return (
                  <div 
                    key={item.id} 
                    className={`border rounded-xl p-3.5 space-y-2 flex flex-col justify-between transition-all shadow-sm ${
                      isPrereqUnmet
                        ? 'bg-slate-950/70 border-dashed border-rose-900/60 opacity-60 grayscale-[70%] hover:opacity-100 hover:grayscale-0'
                        : 'bg-slate-950/70 border-slate-800 hover:border-purple-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              isInv 
                                ? 'bg-purple-950 text-purple-400 border-purple-800' 
                                : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                            }`}>
                              {isInv ? 'Invocation' : 'Special Ability'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.discipline} ({item.subSkill})
                            </span>
                            {isPrereqUnmet && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-rose-950/80 border border-rose-800/80 text-rose-300" title={`Missing: ${prereqResult.unmetReasons.join(', ')}`}>
                                <Lock className="w-2.5 h-2.5" />
                                <span>Prereq Missing</span>
                              </span>
                            )}
                          </div>
                          <FolioTooltip
                            title={item.name}
                            prerequisites={prereqResult.prerequisiteText}
                            prerequisiteMet={!isPrereqUnmet}
                            prerequisiteUnmetReasons={prereqResult.unmetReasons}
                            description={item.description}
                            tags={[item.discipline, item.subSkill].filter(Boolean)}
                          >
                            <h4 className={`font-bold text-xs cursor-pointer ${
                              isPrereqUnmet ? 'text-slate-400 hover:text-rose-300' : 'text-slate-100 hover:text-purple-300'
                            }`}>
                              {item.name}
                            </h4>
                          </FolioTooltip>
                        </div>

                        {isInv ? (
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              Take 10: {calc.take10Score}
                            </span>
                            <span className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-bold">
                              +{calc.totalScore}
                            </span>
                          </div>
                        ) : (
                          item.damage && (
                            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800">
                              {item.damage}
                            </span>
                          )
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed mt-2 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400 mt-2 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                        <div>Time: <span className="text-slate-200">{item.time}</span></div>
                        <div>Range: <span className="text-slate-200">{item.range}</span></div>
                        <div>Duration: <span className="text-slate-200">{item.duration}</span></div>
                        <div>Save: <span className="text-amber-300">{item.resistance}</span></div>
                        {isInv && (
                          <div className="col-span-2">
                            Base DC {item.baseDC} ({calc.baseEssenceCost} Essence)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-850 flex items-center justify-between">
                      {isInv ? (
                        <button
                          type="button"
                          onClick={() => handleRepurposeToSpecialAbility(item)}
                          className="text-[10px] font-bold text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          title="Acquire as an inherent Special Ability"
                        >
                          <Copy size={11} />
                          <span>+ Add as Special Ability</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          Cost: <strong className="text-amber-300">{item.cp || 5} CP</strong>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (isInv) {
                            handleLearnInvocation(item);
                          } else {
                            handleAddSpecialAbility(item);
                          }
                        }}
                        disabled={isKnown}
                        className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          isKnown
                            ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-default'
                            : isPrereqUnmet
                            ? 'bg-slate-900 text-rose-300 border border-rose-900/60 hover:bg-slate-850'
                            : isInv
                              ? 'bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 shadow-sm'
                              : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 shadow-sm'
                        }`}
                      >
                        {isKnown ? 'Learned' : isPrereqUnmet ? (isInv ? '+ Learn (Prereq Missing)' : '+ Acquire (Prereq Missing)') : isInv ? '+ Learn Power' : '+ Acquire Ability'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SUB-MODAL: UNIFIED BUILD & EDIT POWER MODAL                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {isBuildModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
            <form onSubmit={handleSaveCustomForm} className="bg-[#0e1524] border border-purple-500/50 rounded-xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  {buildModalMode.includes('invocation') ? <Wand2 size={16} /> : <Zap size={16} />}
                  <span>
                    {buildModalMode === 'edit_invocation' ? 'Edit Invocation' :
                     buildModalMode === 'edit_special_ability' ? 'Edit Special Ability' :
                     buildModalMode === 'create_invocation' ? '+ Build Custom Invocation' :
                     '+ Build Inherent Special Ability'}
                  </span>
                </h3>
                <button 
                  type="button" 
                  onClick={() => setIsBuildModalOpen(false)} 
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Power Name</label>
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sub-Skill / Focus</label>
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Casting / Action Time</label>
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Area / Target</label>
                  <input
                    type="text"
                    value={customForm.area}
                    onChange={(e) => setCustomForm({ ...customForm, area: e.target.value })}
                    placeholder="Single Target / 20 ft Cube"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={customForm.duration}
                    onChange={(e) => setCustomForm({ ...customForm, duration: e.target.value })}
                    placeholder="Instantaneous / 10 Min"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Save / Resistance</label>
                  <input
                    type="text"
                    value={customForm.resistance}
                    onChange={(e) => setCustomForm({ ...customForm, resistance: e.target.value })}
                    placeholder="Reflex (Half) / None"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Damage / Effect Formula</label>
                  <input
                    type="text"
                    value={customForm.damage}
                    onChange={(e) => setCustomForm({ ...customForm, damage: e.target.value })}
                    placeholder="e.g., 3d6 Plasma"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">CP Cost</label>
                  <input
                    type="number"
                    value={customForm.cp}
                    onChange={(e) => setCustomForm({ ...customForm, cp: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Effect Description</label>
                  <textarea
                    rows={2}
                    value={customForm.description}
                    onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                    placeholder="Describe reality manipulation mechanics..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 outline-none resize-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Scaling Rules</label>
                  <input
                    type="text"
                    value={customForm.scaling}
                    onChange={(e) => setCustomForm({ ...customForm, scaling: e.target.value })}
                    placeholder="+1d6 damage per rank..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuildModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-bold cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold cursor-pointer shadow-md"
                >
                  Save Power
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
