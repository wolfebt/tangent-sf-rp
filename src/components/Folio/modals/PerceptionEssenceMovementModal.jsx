import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Zap, 
  Footprints, 
  Shield, 
  Wind, 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  X, 
  Search, 
  BookOpen, 
  Compass, 
  Flame, 
  Clock, 
  Layers,
  Award,
  Coffee,
  Heart,
  Target,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { 
  CORE_ATTRIBUTES, 
  ATTRIBUTE_CHECKS, 
  REST_SYSTEM_RULES,
  EXPERIENCE_RULES,
  PERCEPTION_RULES, 
  MOVEMENT_MODES_AND_PACES, 
  MOVEMENT_FATIGUE_SYSTEM, 
  FLYING_COMBAT_RULES 
} from '../../../engines/tangentConstants';
import { calculateRestDegradation, getSpeciesRestProfile } from '../../../engines/tangentRestEngine';
import { AudioService } from '../../../services/audioService';

// ═══════════════════════════════════════════════════════════════════════════
// CANONICAL CONSTANTS & BENCHMARKS
// ═══════════════════════════════════════════════════════════════════════════

const CHALLENGE_RATINGS = [
  { dc: 10, label: 'Easy', desc: 'Routine professional tasks with minor pressure or mild distraction.', perceptionExample: 'Spotting prominent tracks in mud; hearing loud conversation in the next room' },
  { dc: 15, label: 'Moderate', desc: 'Standard professional challenge; demanding for untrained operators.', perceptionExample: 'Noticing a concealed tripwire; detecting nervous body language in a civilian' },
  { dc: 18, label: 'Challenging', desc: 'Complex problem or stressful combat situation requiring skill.', perceptionExample: 'Discerning residual arcane thermal signature; spotting a camouflaged sentry' },
  { dc: 20, label: 'Hard', desc: 'Significant hazard, masterwork obstacle, or high-tier opposition.', perceptionExample: 'Detecting an encrypted radio blip in static; reading an alien micro-expression' },
  { dc: 25, label: 'Extreme', desc: 'Legendary difficulty; nearly impossible without specialized training or traits.', perceptionExample: 'Spotting an active optical-camo cloaked assassin; finding a microscopic wiretap' },
  { dc: 30, label: 'Heroic', desc: 'Feats bordering on miracle; world-class or cinematic actions.', perceptionExample: 'Detecting a planar displacement microsecond before rift opens; sensing air pressure shift' },
  { dc: 35, label: 'Mythic', desc: 'Godlike or cosmic-scale endeavors pushing the boundaries of reality.', perceptionExample: 'Perceiving Progenitor hyper-spatial code strings interwoven with reality' }
];

const SKILL_SYNERGIES = [
  { check: 'Might (STR)', skills: 'Athletics, Combat Maneuvers, Brawling', bonusDesc: 'Circumstance bonuses for high-leverage lifts, grappling large beasts, or breaching bulkheads.' },
  { check: 'Reflex (AGI)', skills: 'Acrobatics, Stealth, Piloting / Evasion', bonusDesc: 'Applies circumstance modifiers when diving clear of explosions, ship debris, or catching projectiles.' },
  { check: 'Fortitude (STA)', skills: 'Medicine, Survival, Biochemistry', bonusDesc: 'Allows physiological knowledge to bolster biological saves against toxins, radiation, and harsh weather.' },
  { check: 'Reason (INT)', skills: 'Linguistics, Cryptography, Science, Technology', bonusDesc: 'Provides direct competence bonuses when decrypting alien ciphers, xeno-tech, or solving mechanisms.' },
  { check: 'Willpower (WIS)', skills: 'Attune, Mental Alertness, Insight', bonusDesc: 'Strengthens psychic mental defense screens against psionic intrusion, terror, panic, and mind control.' },
  { check: 'Etiquette (CHA)', skills: 'Diplomacy, Bluff, Streetwise, Subterfuge', bonusDesc: 'Enables nuanced reading of social etiquette, underworld codes, or high protocol to avert bloodshed.' }
];

const LOCAL_DAMAGE_ROUTING_TIERS = [
  {
    type: 'Non-Lethal Damage',
    target: 'Vitality First',
    icon: '🥊',
    color: 'amber',
    summary: 'Pummeling, fatigue, exhaustion, stun attacks',
    description: 'Vitality acts as a buffer absorbing non-lethal harm. Only when Vitality is completely depleted (0) does excess non-lethal damage spill over into Health.'
  },
  {
    type: 'Lethal Damage',
    target: 'Health Direct',
    icon: '🗡️',
    color: 'rose',
    summary: 'Blades, ballistic fire, energy weapons, plasma, acid',
    description: 'Lethal damage reduces Health directly. If lethal damage exceeds current Health (reducing it to 0), any excess damage is applied to remaining Vitality.'
  },
  {
    type: 'Critical Hits',
    target: 'Direct Health Bypass',
    icon: '⚡',
    color: 'purple',
    summary: 'Natural 20s, critical exploits, pinpoint strikes',
    description: 'Critical strikes bypass the target\'s Vitality buffer entirely, inflicting direct lethal damage straight to Health. If the attack was non-lethal, it remains non-lethal, absorbing through Vitality first before overflowing into Health as lethal. Excess damage beyond 0 Health goes to Vitality.'
  },
  {
    type: 'Concussive Damage',
    target: '50/50 Split (Trauma)',
    icon: '💥',
    color: 'cyan',
    summary: 'Falls, shockwaves, vehicle collisions, explosions',
    description: 'Concussive trauma is dispersed across the entire body. If the character attempts to reduce the damage, it is split 50/50 between Vitality and Health.'
  }
];

const LOCAL_MORTALITY_STAGES = [
  {
    stage: '1. Buffered / Active',
    trigger: 'Health > 0 & Vitality > 0',
    status: 'Combat Effective',
    color: 'emerald',
    icon: '🛡️',
    details: 'The character is fully conscious, functioning, and protected by their dual-track vitality buffer and stamina toughness.'
  },
  {
    stage: '2. Incapacitated',
    trigger: '0 Health (Vitality > 0)',
    status: 'Unconscious & Prone',
    color: 'amber',
    icon: '🛌',
    details: 'The character falls unconscious immediately, drops anything held, and falls Prone. Crucially, they are NOT on the death clock because Vitality buffer still cushions them.'
  },
  {
    stage: '3. Death\'s Door',
    trigger: '0 Health AND 0 Vitality',
    status: 'Comatose (Death Clock Active)',
    color: 'rose',
    icon: '💀',
    details: 'Both tracks are zero. The character enters a coma. The Death Clock starts with rounds equal to Stamina score (minimum 1 round). Medical aid or healing is urgently required.'
  },
  {
    stage: '4. Deceased',
    trigger: 'Death Clock Reaches 0 / Massive Damage',
    status: 'Permanently Dead',
    color: 'red',
    icon: '⚰️',
    details: 'The biological life or artificial core has expired. Return requires high-tier Metaphysics or TL5 tech, incurring "The High Cost of Dying" (-All Karma, -5 AP Debt).'
  }
];

const KARMA_ACTIONS = [
  {
    id: 'i-got-this',
    name: '"I Got This"',
    cost: '1 Karma',
    timing: 'Declare BEFORE making the roll',
    scope: 'Any single dice roll (Ability, Skill, Attack, Save, Damage)',
    summary: 'Gain Advantage on the roll (roll twice, take the higher result).',
    description: 'Allows players to gain an advantage on any single roll. Must declare before making the roll. Can be used on ability checks, skill checks, attack rolls, saving throws, and damage rolls.',
    tag: 'Roll Advantage',
    color: 'emerald'
  },
  {
    id: 'not-what-i-meant',
    name: '"Not What I Meant"',
    cost: '1 Karma',
    timing: 'Declare IMMEDIATELY AFTER initial roll',
    scope: 'Ability Checks and non-combat Skill Checks only',
    summary: 'Reroll the failed check. Must accept 2nd result even if worse.',
    description: 'Allows a player to reroll an Ability Check or non-combat Skill Check. Excludes attack rolls, damage rolls, and combat-specific rolls. The second roll\'s result must be accepted.',
    tag: 'Reroll Check',
    color: 'amber'
  },
  {
    id: 'shake-it-off',
    name: '"Shake it Off"',
    cost: '1 Karma',
    timing: 'Anytime while afflicted with a temporary condition',
    scope: 'Temporary conditions with severity stages (Poisoned, Stunned, Blinded)',
    summary: 'Reduce condition severity by one stage (e.g., Major to Minor).',
    description: 'Allows characters to reduce the severity of temporary conditions affecting them by one stage (e.g., Major Poisoning to Minor Poisoning).',
    tag: 'Condition Relief',
    color: 'cyan'
  },
  {
    id: 'second-wind',
    name: '"Second Wind"',
    cost: '1 Karma + 1 Full Minute of Focus',
    timing: '1 minute out of immediate combat / quiet focus',
    scope: 'Refreshes limited-use daily abilities or features without taking a Light Rest',
    summary: 'Bypasses the need for a Light Rest; instantly refreshes spent daily powers.',
    description: 'Allows a character to quickly refresh their abilities and resources, bypassing the need for a Light Rest downtime period through sheer focus.',
    tag: 'Instant Recovery',
    color: 'blue'
  },
  {
    id: 'so-mote-it-be',
    name: '"So Mote it Be"',
    cost: '1 Karma',
    timing: 'Declare SIMULTANEOUSLY with metaphysical skill or feat',
    scope: 'Metaphysics users (Arcane, Psi, Supernatural forces)',
    summary: 'Boosts metaphysical check potency (range, duration, damage) or activates a Karma Feat.',
    description: 'Interacts with metaphysical abilities, enhancing their power, expanding range or duration, or triggering special discipline Karma Feats.',
    tag: 'Metaphysics Boost',
    color: 'purple'
  },
  {
    id: 'by-will-alone',
    name: '"By Will Alone"',
    cost: '1 Karma',
    timing: 'When facing an insurmountable mental or physical obstacle',
    scope: 'Narrative exertion or resisting fatal catastrophic effects',
    summary: 'Push physical/mental limits beyond mortal capacity or auto-succeed DC ≤ 15 check.',
    description: 'Allows an operative to push their physiological or psychic boundaries to survive impossible odds or automatically succeed at an essential routine check under extreme pressure.',
    tag: 'Heroic Resolve',
    color: 'rose'
  }
];

const ADVANCEMENT_COSTS = [
  {
    category: 'Skills & Proficiencies',
    items: [
      { name: 'Skill Rank (+1)', cost: '1 AP', increment: 'Max +1 per award', desc: 'Increases the skill score by +1. Must adhere to the Increment Rule.' },
      { name: 'Skill Specialization (+1)', cost: '1 AP', increment: 'Max +1 per award', desc: 'Specialized focus in a specific weapon, craft, tool, or lore domain.' },
      { name: 'Attribute Check / Save (+1)', cost: '1 AP', increment: 'Max +1 per award', desc: 'Increases saving throw or passive attribute check modifier.' }
    ]
  },
  {
    category: 'Vitals & Survivability',
    items: [
      { name: 'Bonus Vitality (+5 Pool)', cost: '1 AP', increment: 'Max +5 per award', desc: 'Adds +5 points to the kinetic / energy Vitality shield buffer.' },
      { name: 'Bonus Health (+5 Pool)', cost: '1 AP', increment: 'Max +5 per award', desc: 'Adds +5 points to the biological / lethal Health life-force pool.' }
    ]
  },
  {
    category: 'Attributes & Feats',
    items: [
      { name: 'Primary Attribute (+1)', cost: '5 AP', increment: 'Max +1 per award', desc: 'Permanently increases Strength, Agility, Intellect, etc. Represents intense conditioning.' },
      { name: 'Feature / Feat', cost: '2 – 3 AP', increment: '1 Feat per award', desc: 'Acquires a new combat trait, scientific specialty, or racial/background feature.' }
    ]
  },
  {
    category: 'Powers & Metaphysics',
    items: [
      { name: 'Special Ability', cost: '5 AP', increment: '1 Ability per award', desc: 'Unlocks a specialized biological, cybernetic, or racial special ability.' },
      { name: 'Awakened Discipline', cost: '5 AP', increment: '1 Discipline per award', desc: 'Awakens a new psychic or metaphysical school of discipline.' },
      { name: 'Invocation / Power', cost: '1 – 3 AP', increment: '1 Invocation per award', desc: 'Acquires an individual psychic or metaphysical invocation within an awakened school.' }
    ]
  }
];

const ESSENCE_COST_SCALE = [
  { difficulty: 'Very Easy', dc: 5, essenceCost: 0, context: 'Safe sanctuaries, laboratory cleanrooms, sanctums, quiet meditation' },
  { difficulty: 'Easy', dc: 10, essenceCost: 0, context: 'Casual travel, non-hostile wilderness, relaxed routine operations' },
  { difficulty: 'Average', dc: 15, essenceCost: 1, context: 'Active firefights, vigorous movement, hostile tactical combat (The Combat Tax)' },
  { difficulty: 'Difficult', dc: 20, essenceCost: 2, context: 'Uncontrolled freefalls, burning vehicle crashes, severe disorientation' },
  { difficulty: 'Very Difficult', dc: 25, essenceCost: 3, context: 'Planetary seismic rifts, high-intensity plasma storms, psychic shockwaves' },
  { difficulty: 'Nearly Impossible', dc: 30, essenceCost: 4, context: 'Global atmospheric warping, dimensional reality restructuring' },
  { difficulty: 'Miraculous', dc: 35, essenceCost: 5, context: 'Progenitor cosmic interactions and mythic timeline alteration' }
];

const SITUATIONAL_PERCEPTION_MODIFIERS = [
  { condition: 'Dim Light / Partial Concealment', mod: '-2', type: 'Penalty', desc: 'Shadows, fog, heavy rain, or foliage obscuring vision' },
  { condition: 'Pitch Darkness / Thick Smoke', mod: '-5', type: 'Severe Penalty', desc: 'Zero ambient light; requires thermal, night vision, or attune senses' },
  { condition: 'Target in Active Stealth', mod: 'Opposed', type: 'Contest', desc: 'Perception check opposed by target\'s Agility + Stealth roll' },
  { condition: 'Extreme Range (>100m)', mod: '-2 / bracket', type: 'Distance', desc: 'Each additional 100 meters imposes cumulative -2 without optical magnification' },
  { condition: 'Sensory Overload / Flashbang', mod: '-4', type: 'Disorientation', desc: 'Sudden high-decibel or blinding flash disorients for 1d4 rounds' },
  { condition: 'Elevated Vantage / Macro-Sensors', mod: '+2 to +4', type: 'Circumstance Bonus', desc: 'High ground, sensor telemetry drone feed, or high-ground optical array' }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PerceptionEssenceMovementModal = ({
  isOpen,
  onClose,
  initialTab = 'perception',
  characterData: propCharacterData,
  getAttrTotal: propGetAttrTotal,
  derivedStats: propDerivedStats
}) => {
  // Use Folio context for live reactive state & methods
  const folio = useFolio();
  const characterData = propCharacterData || folio.characterData || {};
  const getAttrTotal = propGetAttrTotal || folio.getAttrTotal || (() => 0);
  const derivedStats = propDerivedStats || folio.derivedStats || {};
  const economyBreakdown = folio.economyBreakdown || {};
  const takeCharacterRest = folio.takeCharacterRest;
  const resetDailyCharacterRests = folio.resetDailyCharacterRests;
  const stabilizeCharacter = folio.stabilizeCharacter;
  const advanceCharacterDeathTurn = folio.advanceCharacterDeathTurn;
  const revivifyCharacter = folio.revivifyCharacter;
  const payExperienceDebt = folio.payExperienceDebt;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMovementMode, setActiveMovementMode] = useState('all'); // 'all' | 'ground' | 'flying' | 'swimming' | 'climbing' | 'burrowing'

  // Rest execution local state
  const [restType, setRestType] = useState('light'); // 'light' | 'full'
  const [activityTier, setActivityTier] = useState('nap'); // 'nap' | 'lounging' | 'light_duty'
  const [interruptions, setInterruptions] = useState(0);
  const [restFeedback, setRestFeedback] = useState(null);
  const [isRestProcessing, setIsRestProcessing] = useState(false);

  // Sync initial tab when reopened
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleTabChange = (tabId) => {
    try {
      AudioService?.playTerminalBeep?.(1200, 0.03);
    } catch (e) {
      // Audio fallback
    }
    setActiveTab(tabId);
    setSearchQuery('');
  };

  const getNum = (id, defaultVal = 0) => parseInt(characterData[id] || defaultVal, 10);

  // ═══════════════════════════════════════════════════════════════════════
  // TELEMETRY EVALUATIONS
  // ═══════════════════════════════════════════════════════════════════════

  // Vitals & Mortality
  const curHealth = parseInt(characterData.health || 30, 10);
  const curVitality = parseInt(characterData.vitality || 30, 10);
  const staminaScore = getAttrTotal('attr-stamina') || 0;
  const toughness = derivedStats?.toughness ?? staminaScore;
  const reflexTotal = getAttrTotal('check-reflex') || 0;
  const initiativeMod = Number(characterData?.['initiative-mod'] || 0);
  const initiativeTotal = reflexTotal + initiativeMod;
  const isSynthetic = derivedStats?.isSynthetic || false;
  const structure = derivedStats?.structure ?? (curHealth + curVitality);
  const isDead = characterData?.is_dead || false;
  const atDeathsDoor = !isDead && (characterData?.is_at_deaths_door || (curHealth <= 0 && curVitality <= 0));
  const isIncapacitated = !isDead && !atDeathsDoor && curHealth <= 0;
  const isStabilized = characterData?.is_stabilized || false;
  const deathClock = characterData?.death_clock ?? Math.max(1, staminaScore || 1);

  // Rest state
  const speciesProfile = derivedStats?.speciesRestProfile || getSpeciesRestProfile(characterData);
  const lightRestsToday = characterData.light_rests_today !== undefined ? parseInt(characterData.light_rests_today, 10) : (derivedStats?.lightRestsToday || 0);
  const restDegradation = calculateRestDegradation(activityTier, interruptions);

  // Karma & Plot
  const currentKarma = getNum('karma', derivedStats?.maxKarma ?? 3);
  const maxKarma = derivedStats?.maxKarma ?? 3;
  const plotPoints = getNum('plot-points', 0);
  const charismaScore = getAttrTotal('attr-charisma');
  const karmicDebtLimit = Math.max(1, charismaScore + 1);

  // Experience & AP
  const earnedAP = Number(characterData?.earned_ap || 0);
  const availableAP = economyBreakdown?.availableAP ?? earnedAP;
  const experienceDebt = Number(characterData?.experience_debt || 0);

  // Perception
  const intellectTotal = getAttrTotal('attr-intellect');
  const wisdomTotal = getAttrTotal('attr-wisdom');
  const basePerception = intellectTotal + wisdomTotal;
  const alertnessRank = getNum('skill-mental-alertness-rank');
  const alertnessMod = getNum('skill-mental-alertness-mod');
  const alertPerception = basePerception + alertnessRank + alertnessMod;
  const attuneRank = getNum('skill-meta-attune-rank');
  const attuneMod = getNum('skill-meta-attune-mod');
  const metaPerception = basePerception + attuneRank + attuneMod;
  const insightRank = getNum('skill-social-insight-rank');
  const insightMod = getNum('skill-social-insight-mod');
  const socialPerception = basePerception + insightRank + insightMod;
  const techRank = getNum('skill-mental-technology-rank');
  const techMod = getNum('skill-mental-technology-mod');
  const techPerception = basePerception + techRank + techMod;

  // Essence
  const primaryAttrs = [
    { name: 'Strength', id: 'attr-strength', score: getAttrTotal('attr-strength') },
    { name: 'Agility', id: 'attr-agility', score: getAttrTotal('attr-agility') },
    { name: 'Stamina', id: 'attr-stamina', score: getAttrTotal('attr-stamina') },
    { name: 'Intellect', id: 'attr-intellect', score: getAttrTotal('attr-intellect') },
    { name: 'Wisdom', id: 'attr-wisdom', score: getAttrTotal('attr-wisdom') },
    { name: 'Charisma', id: 'attr-charisma', score: getAttrTotal('attr-charisma') }
  ];
  const primaryAttrsTotal = primaryAttrs.reduce((sum, a) => sum + a.score, 0);

  const defaultMetaSkills = [
    { id: 'meta-attune', name: 'Attune (Conduit)' },
    { id: 'meta-dimension', name: 'Dimension Discipline' },
    { id: 'meta-energy', name: 'Energy Discipline' },
    { id: 'meta-entropy', name: 'Entropy Discipline' },
    { id: 'meta-illusion', name: 'Illusion Discipline' },
    { id: 'meta-matter', name: 'Matter Discipline' },
    { id: 'meta-mental', name: 'Mental Discipline' }
  ];
  const customMetaKeys = Object.keys(characterData).filter(
    k => k.startsWith('skill-meta-') && k.endsWith('-rank')
  );
  const allMetaSkillEntries = [
    ...defaultMetaSkills,
    ...customMetaKeys
      .map(k => k.replace('skill-', '').replace('-rank', ''))
      .filter(id => !defaultMetaSkills.some(d => d.id === id))
      .map(id => ({ id, name: id.replace('meta-', '').toUpperCase() + ' Discipline' }))
  ];
  const metaSkillsList = allMetaSkillEntries.map(s => {
    const rank = getNum(`skill-${s.id}-rank`);
    const mod = getNum(`skill-${s.id}-mod`);
    return { ...s, rank, mod, total: rank + mod };
  });
  const metaSkillsTotal = metaSkillsList.reduce((sum, s) => sum + s.total, 0);
  const essenceTotal = primaryAttrsTotal + metaSkillsTotal;

  // Movement
  const fortitudeTotal = getAttrTotal('attr-fortitude');
  const walkSpeed = getNum('move-walk', 30);
  const flySpeed = getNum('move-fly', 0);
  const swimSpeed = getNum('move-swim', 0);
  const climbSpeed = getNum('move-climb', 0);
  const burrowSpeed = getNum('move-burrow', 0);
  const teleportSpeed = getNum('move-teleport', 0);

  // Dynamic calculated bases for pace charts
  const flyBaseSpeed = flySpeed > 0 ? flySpeed : walkSpeed * 2;
  const swimBaseSpeed = swimSpeed > 0 ? swimSpeed : Math.max(5, Math.round(walkSpeed * 0.5));
  const climbBaseSpeed = climbSpeed > 0 ? climbSpeed : Math.max(5, Math.round(walkSpeed * 0.5));
  const burrowBaseSpeed = burrowSpeed > 0 ? burrowSpeed : Math.max(2.5, Math.round(walkSpeed * 0.25 * 10) / 10);

  // Tab definitions
  const TABS = [
    { id: 'attributes', label: 'Attributes & Checks', icon: '🛡️', badge: null },
    { id: 'vitals', label: 'Vitals & Dying', icon: '⚡', badge: `${curHealth}/${curVitality}` },
    { id: 'rest', label: 'Rest & Recovery', icon: '☕', badge: `${lightRestsToday}/4` },
    { id: 'karma', label: 'Karma & Fate', icon: '💠', badge: currentKarma },
    { id: 'experience', label: 'Experience & AP', icon: '🎖️', badge: `+${earnedAP}` },
    { id: 'perception', label: 'Perception', icon: '👁️', badge: basePerception },
    { id: 'essence', label: 'Essence Pool', icon: '🔮', badge: essenceTotal },
    { id: 'movement', label: 'Movement & Paces', icon: '🏃', badge: `${walkSpeed} ft` }
  ];

  // Rest execution handler
  const handleExecuteRest = async () => {
    if (!takeCharacterRest) return;
    setIsRestProcessing(true);
    setRestFeedback(null);
    try {
      const heroId = characterData['character-doc-id'] || characterData.id || 'active';
      const result = await takeCharacterRest(heroId, {
        restType,
        activityTier,
        interruptions
      });
      if (!result.success) {
        setRestFeedback({ type: 'error', text: result.error });
      } else {
        setRestFeedback({ type: 'success', text: result.logMessage });
        setInterruptions(0);
      }
    } catch (err) {
      setRestFeedback({ type: 'error', text: err.message || 'Rest execution failed' });
    } finally {
      setIsRestProcessing(false);
    }
  };

  const handleResetDaily = async () => {
    if (!resetDailyCharacterRests) return;
    const heroId = characterData['character-doc-id'] || characterData.id || 'active';
    await resetDailyCharacterRests(heroId);
    setRestFeedback({ type: 'success', text: 'Daily rest counter reset to 0/4 for the new day.' });
  };

  const checksList = Object.values(ATTRIBUTE_CHECKS);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0c121e] border border-cyan-500/40 rounded-2xl max-w-5xl w-full p-4 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-slate-100 space-y-5">
        
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-cyan-950/80 rounded-lg border border-cyan-500/40">
                {TABS.find(t => t.id === activeTab)?.icon || '📖'}
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-200">
                  Core Stats Rules &amp; Mechanics Codex
                </h2>
                <p className="text-xs text-slate-400">
                  Canonical Tangent Science Fantasy Roleplay Reference &amp; Live Hero Evaluation
                </p>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <X size={14} />
            <span>Close Codex</span>
          </button>
        </div>

        {/* 8-Tab Consolidated Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950/90 p-2 rounded-xl border border-slate-800 shadow-inner">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950 to-cyan-900 text-cyan-200 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-sm">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge !== null && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono shrink-0 ${
                    isActive
                      ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-700/50'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: ATTRIBUTES & CHECKS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'attributes' && (
          <div className="space-y-6">
            {/* Live Hero Check Tracker */}
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Activity size={14} /> Hero Check Baseline Tracker
                </span>
                <span className="text-cyan-400 font-mono">Formula: Base = 2 + (Attr × 2)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono">
                {checksList.map(check => {
                  const attrTotal = getAttrTotal(check.attributeId);
                  const checkTotal = getAttrTotal(check.id);
                  const calculatedBase = 2 + (attrTotal * 2);

                  return (
                    <div key={check.id} className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-sans font-bold text-slate-300 uppercase truncate">
                          {check.name}
                        </div>
                        <div className="text-[9px] text-slate-500 font-sans">
                          {check.attributeCode} ({attrTotal >= 0 ? `+${attrTotal}` : attrTotal})
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <div className="text-base font-bold text-cyan-300">
                          {checkTotal > 0 ? `+${checkTotal}` : checkTotal}
                        </div>
                        <div className="text-[8.5px] text-amber-400/80 font-sans">
                          Base: {calculatedBase}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Formulas & Economy */}
            <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>📐</span> Core Formulas &amp; Character Progression Economy
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center justify-between">
                    <span>Base Score Formula</span>
                    <code className="text-amber-300 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      Base = 2 + (Attribute × 2)
                    </code>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    Whenever an Attribute increases, its corresponding sub-attribute check base score automatically shifts by twice that amount. A character with an Attribute of 0 has a base check score of 2. An Attribute of +3 gives a base score of 8.
                  </p>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                    Roll Expression: <span className="text-emerald-300 font-bold">2d10 + Total Score + Circumstance Modifiers</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center justify-between">
                    <span>Point Costs &amp; Paragon Limits</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">5 CP / Attr • 1 CP / Check</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    <strong>Primary Attributes</strong> cost <strong>5 Character Points (CP)</strong> per +1 increase. <strong>Attribute Checks</strong> can also be increased independently at a cost of <strong>1 CP</strong> per +1 point.
                  </p>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                    Characters start with an attribute maximum of <strong>+4</strong> before species traits. Paragon upper score is <strong>+5</strong> + species modifiers.
                  </div>
                </div>
              </div>

              {/* Challenge Types: Targeted vs Opposed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/50 space-y-1">
                  <div className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                    <span>🎯</span> Targeted Challenges (vs Static CR)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Targeted challenges pit a character's roll against a static Challenge Rating (CR) set by the Architect/GM or scenario. Meeting or exceeding the CR achieves success.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/50 space-y-1">
                  <div className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                    <span>⚔️</span> Opposed Challenges (Contest)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Opposed challenges involve direct competition between two active participants (e.g. Might vs Might in an arm wrestle, or Reflex vs Reflex in a quick-draw contest). The highest total roll wins.
                  </p>
                </div>
              </div>

              {/* Challenge Rating Scale */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Standard Challenge Rating (CR) Scale
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center font-mono">
                  {CHALLENGE_RATINGS.map(cr => (
                    <div key={cr.dc} className="bg-slate-950 p-2 rounded-lg border border-slate-800" title={cr.desc}>
                      <div className="text-sm font-bold text-cyan-300">CR {cr.dc}</div>
                      <div className="text-[10px] font-sans font-bold text-amber-400">{cr.label}</div>
                      <div className="text-[9px] text-slate-500 font-sans mt-0.5 line-clamp-2">{cr.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Synergies */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>🔗</span> Skill Synergies &amp; Circumstance Modifiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {SKILL_SYNERGIES.map((syn, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-cyan-300">{syn.check}</span>
                      <span className="text-[10px] font-mono text-amber-400">{syn.skills}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{syn.bonusDesc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: VITALS & DYING */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            {/* Live Hero Vitals Status Bar */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex flex-wrap justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <span className="flex items-center gap-1 text-cyan-300"><Activity size={14} /> Hero Mortality Telemetry</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono">Toughness: +{toughness} (STA Soak)</span>
                  {isSynthetic && <span className="text-amber-400 font-mono">Structure: {structure} SP</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-sans text-slate-400 font-bold uppercase">Health (Lethal)</div>
                  <div className={`text-lg font-bold ${curHealth <= 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {curHealth}
                  </div>
                  <div className="text-[9px] font-sans text-slate-500">Physical Trauma</div>
                </div>

                <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-sans text-cyan-300 font-bold uppercase">Vitality (Buffer)</div>
                  <div className={`text-lg font-bold ${curVitality <= 0 ? 'text-rose-400' : 'text-cyan-300'}`}>
                    {curVitality}
                  </div>
                  <div className="text-[9px] font-sans text-slate-500">Non-Lethal Cushion</div>
                </div>

                <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-sans text-emerald-400 font-bold uppercase">Base Toughness</div>
                  <div className="text-lg font-bold text-emerald-300">+{toughness}</div>
                  <div className="text-[9px] font-sans text-slate-500">Wound Soak / Point</div>
                </div>

                <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-sans text-amber-400 font-bold uppercase">Condition Status</div>
                  <div className="text-xs font-bold font-sans mt-1">
                    {isDead ? (
                      <span className="text-red-400 uppercase">⚰️ Deceased</span>
                    ) : atDeathsDoor ? (
                      <span className="text-rose-400 uppercase">💀 Death's Door ({deathClock}r)</span>
                    ) : isIncapacitated ? (
                      <span className="text-amber-400 uppercase">🛌 Incapacitated</span>
                    ) : (
                      <span className="text-emerald-400 uppercase">✓ Combat Active</span>
                    )}
                  </div>
                  <div className="text-[9px] font-sans text-slate-500">
                    {isStabilized ? 'Stabilized' : 'Normal'}
                  </div>
                </div>
              </div>

              {/* Mortality Actions */}
              {(atDeathsDoor || isDead || isIncapacitated) && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-300 text-[11px]">
                    {isDead && <span className="text-red-400">Hero is deceased. Revivification invokes The High Cost of Dying (-All Karma, -5 AP Debt).</span>}
                    {atDeathsDoor && <span className="text-rose-300">Hero is Comatose at Death's Door! Apply Medicine DC 15 check or healing tech.</span>}
                    {isIncapacitated && <span className="text-amber-300">Hero is unconscious at 0 Health, but buffered by remaining Vitality.</span>}
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {atDeathsDoor && !isStabilized && (
                      <>
                        <button
                          type="button"
                          onClick={() => stabilizeCharacter && stabilizeCharacter({ hasHealingEffect: true })}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10.5px] font-bold uppercase tracking-wider border border-emerald-400 transition-colors cursor-pointer"
                        >
                          🩹 Stabilize (DC 15)
                        </button>
                        <button
                          type="button"
                          onClick={() => advanceCharacterDeathTurn && advanceCharacterDeathTurn()}
                          className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[10.5px] font-mono font-bold uppercase tracking-wider border border-rose-700 transition-colors cursor-pointer"
                        >
                          ⏳ -1 Round
                        </button>
                      </>
                    )}
                    {isDead && revivifyCharacter && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Perform Revivification? Character loses ALL Karma and suffers -5 AP Debt.")) {
                            revivifyCharacter();
                          }
                        }}
                        className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded text-[10.5px] font-bold uppercase tracking-wider border border-red-500 transition-colors cursor-pointer"
                      >
                        ⚡ Revivify (-5 AP Debt)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Combat Readiness & Defenses Section */}
            <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>⚔️</span> Combat Readiness: Initiative &amp; Toughness Formulas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Initiative Rule */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-amber-300">Initiative Turn Order</span>
                    <code className="text-[11px] font-mono text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      Reflex Check + Modifiers
                    </code>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Initiative establishes the hero's turn order in combat. Base Initiative equals the hero's <strong>Reflex Sub-Attribute Check</strong> (Agility) plus any situational, tactical gear, or trait modifiers.
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-1.5">
                    Formula: <span className="text-amber-300">Ref ({reflexTotal}) + Mod ({initiativeMod}) = <strong className="text-amber-400 font-bold">{initiativeTotal}</strong></span>
                  </div>
                </div>

                {/* Toughness Rule */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-emerald-300">Stamina Natural DR (Toughness)</span>
                    <code className="text-[11px] font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      Stamina Score
                    </code>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    All character Stamina is a natural damage reduction (DR) and automatically reduces all incoming damage which penetrates the character's defenses, minimum of 1 point.
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-1.5">
                    Natural DR: <strong className="text-emerald-300">+{toughness} DR (Min 1 penetrating damage)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Damage Routing Tiers */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Canonical Damage Routing Tiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {LOCAL_DAMAGE_ROUTING_TIERS.map((tier, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{tier.icon}</span> {tier.type}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 font-bold">
                        {tier.target}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans italic">{tier.summary}</div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mortality Stages */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                The 4 Mortality Stages &amp; Death's Door Mechanics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                {LOCAL_MORTALITY_STAGES.map((st, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <span>{st.icon}</span> <span>{st.stage}</span>
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-1">{st.trigger}</div>
                      <div className="text-[10.5px] font-bold text-amber-300 mb-1">{st.status}</div>
                      <p className="text-slate-400 text-[10.5px] leading-relaxed">{st.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: REST & RECOVERY */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'rest' && (
          <div className="space-y-6">
            {/* Live Hero Rest Telemetry */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Coffee size={14} /> Hero Downtime &amp; Rest Telemetry
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/50 text-emerald-300 font-bold">
                  {speciesProfile?.badgeLabel || 'Standard Physiology'} • {lightRestsToday} / 4 Rests Today
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Vitality Recovery</div>
                  <div className="text-lg font-black text-cyan-300">{curVitality}</div>
                  <div className="text-[9px] text-slate-500">Max: {derivedStats?.maxVitality || 30}</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Health State</div>
                  <div className="text-lg font-black text-emerald-300">{curHealth}</div>
                  <div className="text-[9px] text-slate-500">Max: {derivedStats?.maxHealth || 30}</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Light Rest Limit</div>
                  <div className="text-lg font-black text-amber-300">{4 - lightRestsToday} Left</div>
                  <div className="text-[9px] text-slate-500">{lightRestsToday} / 4 Taken</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Sleep Profile</div>
                  <div className="text-xs font-black text-purple-300 mt-1">{speciesProfile?.cycleDuration || '6-8 Hours'}</div>
                  <div className="text-[9px] text-slate-500">{speciesProfile?.category || 'Standard'}</div>
                </div>
              </div>
            </div>

            {/* Interactive Rest Execution Widget */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span>⚡</span> Execute Downtime Rest Action
                </h3>
                {lightRestsToday >= 4 && (
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    Daily Light Rest Cap Reached
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Rest Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Rest Type</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRestType('light')}
                      className={`py-1 px-2 rounded text-[11px] font-bold ${restType === 'light' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Light Rest
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestType('full')}
                      className={`py-1 px-2 rounded text-[11px] font-bold ${restType === 'full' ? 'bg-cyan-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Full Rest
                    </button>
                  </div>
                </div>

                {/* Activity Tier (Light Rest only) */}
                {restType === 'light' ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Activity Tier</label>
                    <select
                      value={activityTier}
                      onChange={(e) => setActivityTier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                    >
                      <option value="nap">Nap (1h) - 50% Vitality</option>
                      <option value="lounging">Lounging (2h) - 40% Vitality</option>
                      <option value="light_duty">Light Duty (3h) - 30% Vitality</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Full Rest Duration</label>
                    <div className="bg-slate-950 border border-slate-800 p-1.5 rounded-lg text-[11px] text-cyan-300 font-mono">
                      {speciesProfile?.cycleDuration || '6-8 Hours Sleep'}
                    </div>
                  </div>
                )}

                {/* Strenuous Interruptions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Interruptions: {interruptions}</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInterruptions(Math.max(0, interruptions - 1))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 font-mono"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs px-2 text-amber-300">{interruptions}</span>
                    <button
                      type="button"
                      onClick={() => setInterruptions(interruptions + 1)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 font-mono"
                    >
                      +
                    </button>
                    <span className="text-[10px] text-slate-500 ml-auto">
                      Tier: <strong className="text-amber-400">{restDegradation?.effectiveTierName || 'Normal'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                {restFeedback && (
                  <div className={`text-xs ${restFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {restFeedback.text}
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleResetDaily}
                    className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 transition-colors"
                  >
                    Reset Daily Counter
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteRest}
                    disabled={isRestProcessing}
                    className="px-3.5 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg border border-emerald-500 shadow-sm transition-colors"
                  >
                    {isRestProcessing ? 'Resting...' : 'Take Rest Now'}
                  </button>
                </div>
              </div>
            </div>

            {/* Rest Rules Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-cyan-300">Light Rest (1-3 Hours)</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Allows short recuperation during field operations. Limited to <strong>4 Light Rests per day</strong>. Recovers a percentage of missing Vitality (Nap 50%, Lounging 40%, Light Duty 30%). Minimal Rest species (Synthetics, Fae, Insects) treat Light Rest as Full Rest.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-300">Full Rest (6-8 Hours)</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Requires complete, secure downtime. Restores <strong>100% of maximum Vitality</strong>, clears Exhaustion conditions, and completely replenishes the operative's Essence pool. Natural health recovery occurs over consecutive full rests.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: KARMA & FATE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'karma' && (
          <div className="space-y-6">
            {/* Live Hero Karma Telemetry */}
            <div className="bg-slate-950/80 border border-purple-500/40 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles size={14} /> Hero Karma &amp; Fate Telemetry
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-600/50 text-purple-300 font-bold">
                  Karma Pool: {currentKarma} / {maxKarma} • Plot Points: {plotPoints}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Karma</div>
                  <div className={`text-lg font-black ${currentKarma < 0 ? 'text-rose-400' : 'text-cyan-300'}`}>
                    {currentKarma}
                  </div>
                  <div className="text-[9px] text-slate-500">Max: {maxKarma}</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Plot Points</div>
                  <div className="text-lg font-black text-fuchsia-300">{plotPoints}</div>
                  <div className="text-[9px] text-slate-500">Narrative Tokens</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Charisma Mod</div>
                  <div className="text-lg font-black text-amber-300">+{charismaScore}</div>
                  <div className="text-[9px] text-slate-500">Social Aptitude</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Karmic Debt Limit</div>
                  <div className="text-lg font-black text-rose-400">-{karmicDebtLimit}</div>
                  <div className="text-[9px] text-slate-500">CHA + 1</div>
                </div>
              </div>
            </div>

            {/* The 6 Universal Karma Actions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                The 6 Universal Karma Point Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {KARMA_ACTIONS.map(action => (
                  <div key={action.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{action.name}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                          {action.cost}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">{action.timing}</div>
                      <p className="text-slate-300 text-[11px] leading-relaxed mt-1">{action.description}</p>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-850">
                      Scope: {action.scope}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Karmic Debt & Plot Points Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-rose-950/30 p-3.5 rounded-xl border border-rose-900/50 space-y-1.5">
                <div className="font-bold text-rose-300">Karmic Debt &amp; "The Dark Turn"</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Operatives may spend into negative Karma up to <strong className="text-rose-200">Charisma + 1</strong>. When in debt, the Architect/GM may invoke "The Dark Turn" on any dramatic check, forcing Disadvantage or triggering environmental complications.
                </p>
              </div>

              <div className="bg-fuchsia-950/30 p-3.5 rounded-xl border border-fuchsia-900/50 space-y-1.5">
                <div className="font-bold text-fuchsia-300">Plot Points (Narrative Influence)</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Awarded for extraordinary roleplay, creative solutions, or suffering major story setbacks. Can be spent to introduce minor narrative conveniences (e.g. finding a convenient access vent, discovering an old contact).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: ADVANCEMENT POINTS (AP) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            {/* Live Hero Advancement Telemetry */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Award size={14} /> Hero Advancement &amp; Progression Telemetry
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-600/50 text-amber-300 font-bold">
                  1 AP = 1 CP • Increment Rule: Max +1 per Event
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Earned AP</div>
                  <div className="text-lg font-black text-amber-300">+{earnedAP}</div>
                  <div className="text-[9px] text-slate-500">Campaign Lifetime</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Available AP</div>
                  <div className="text-lg font-black text-emerald-300">{availableAP} AP</div>
                  <div className="text-[9px] text-slate-500">Unspent Downtime Budget</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Active XP Debt</div>
                  <div className={`text-lg font-black ${experienceDebt > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {experienceDebt > 0 ? `-${experienceDebt} AP` : '0 AP'}
                  </div>
                  <div className="text-[9px] text-slate-500">Revivification Trauma</div>
                </div>
              </div>

              {experienceDebt > 0 && availableAP > 0 && payExperienceDebt && (
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-rose-300">Character has active trauma debt. Settle debt using available AP.</span>
                  <button
                    type="button"
                    onClick={() => payExperienceDebt(Math.min(experienceDebt, availableAP))}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded font-bold uppercase tracking-wider text-[11px]"
                  >
                    Repay Debt ({Math.min(experienceDebt, availableAP)} AP)
                  </button>
                </div>
              )}
            </div>

            {/* The Increment Rule */}
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 space-y-1.5">
              <h4 className="text-amber-300 font-bold uppercase text-xs font-mono tracking-wider flex items-center gap-1.5">
                <span>⚠️</span> The Increment Rule (CRITICAL CANON RULE)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Abilities, skills, or other traits may <strong className="text-amber-200">ONLY HAVE A 1 POINT INCREMENT OF ANY SCORE PER EXPERIENCE AWARD EVENT</strong>. 
                A player cannot dump multiple points into a single skill or stat at once. Character development reflects balanced, authentic progression over downtime.
              </p>
            </div>

            {/* Advancement Costs Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Advancement Point Costs (1 AP = 1 CP)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {ADVANCEMENT_COSTS.map((cat, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-cyan-300 border-b border-slate-800 pb-1">{cat.category}</div>
                    <div className="space-y-2">
                      {cat.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start text-[11px]">
                          <div>
                            <span className="font-bold text-slate-200">{item.name}</span>
                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                          </div>
                          <div className="text-right shrink-0 ml-2 font-mono">
                            <span className="text-amber-300 font-bold">{item.cost}</span>
                            <div className="text-[9px] text-slate-500">{item.increment}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: PERCEPTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'perception' && (
          <div className="space-y-6">
            {/* Live Hero Tracker */}
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Activity size={14} className="text-cyan-400" />
                  Hero Perception Live Telemetry
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-600/50 text-cyan-300 font-bold">
                  Formula: Base = Intellect ({intellectTotal}) + Wisdom ({wisdomTotal}) = {basePerception}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Base Perception</div>
                  <div className="text-lg font-black text-cyan-300">{basePerception}</div>
                  <div className="text-[9px] text-slate-500">INT + WIS</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-cyan-600/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <div className="text-[10px] uppercase font-bold text-cyan-300">Alertness (Default)</div>
                  <div className="text-lg font-black text-cyan-200">{alertPerception}</div>
                  <div className="text-[9px] text-cyan-400/80">Base + {alertnessRank + alertnessMod} Alert</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-600/60 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                  <div className="text-[10px] uppercase font-bold text-amber-400">Meta (Attune)</div>
                  <div className="text-lg font-black text-amber-300">{metaPerception}</div>
                  <div className="text-[9px] text-amber-400/80">Base + {attuneRank + attuneMod} Attune</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-emerald-600/60 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Social (Insight)</div>
                  <div className="text-lg font-black text-emerald-300">{socialPerception}</div>
                  <div className="text-[9px] text-emerald-400/80">Base + {insightRank + insightMod} Insight</div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-blue-600/60 shadow-[0_0_10px_rgba(59,130,246,0.1)] col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-blue-400">Tech (Knowledge)</div>
                  <div className="text-lg font-black text-blue-300">{techPerception}</div>
                  <div className="text-[9px] text-blue-400/80">Base + {techRank + techMod} Tech</div>
                </div>
              </div>
            </div>

            {/* Perception Philosophy */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <BookOpen size={16} className="text-cyan-400" />
                Perception Mechanics &amp; Philosophy
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                In Tangent Science Fantasy Roleplay, <strong className="text-cyan-300">Perception</strong> is not an isolated attribute rolled alone. 
                Instead, it represents a character’s innate sensory acuity, mental clarity, and subconscious environmental processing derived from 
                <strong className="text-amber-300"> Intellect</strong> and <strong className="text-emerald-300">Wisdom</strong>.
              </p>
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-200">
                <strong className="text-cyan-100">Roll Formula:</strong> When an operative conducts a sensory detection check, they roll:
                <div className="font-mono font-bold text-cyan-300 mt-1 bg-slate-950/80 p-2 rounded border border-cyan-700/40">
                  Result = 2d10 + Perception Base + Relevant Skill Modifiers + Circumstance Modifiers
                </div>
              </div>
            </div>

            {/* The 4 Detection Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 border border-cyan-600/40 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>🎯</span> Alertness — Default Environmental Detection
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/50">
                    Base + Alertness
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  General passive and active situational awareness. Spot visual/auditory anomalies, concealed tripwires, mechanical traps, camouflaged predators, ambush setups, and sudden peripheral movement.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-amber-600/40 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🔮</span> Attune — Metaphysical &amp; Psionic Detection
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-700/50">
                    Base + Attune
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sensing invisible metaphysical flows, psychic emanations, planar distortions, cloaked spirits, active spell signatures, and ancient eldritch relics. Functions as an ethereal sensory radar.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-emerald-600/40 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>💬</span> Insight — Social &amp; Psychological Deception
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/50">
                    Base + Insight
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Reading micro-expressions, tonal inflection, pupil dilation, and nervous body language to determine true intentions, spot fabricated lies, identify blackmail vulnerability, or predict combat feints.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-blue-600/40 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <span>⚙️</span> Technical — Hardware, Scans &amp; Diagnostics
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-700/50">
                    Base + Tech
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Interpreting active sensor array telemetry, infrared thermography, micro-transmitter frequencies, structural weak points in bulkheads, electronic surveillance bugs, and sabotaged machinery.
                </p>
              </div>
            </div>

            {/* Modifiers & DCs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-300">
                  <AlertTriangle size={14} className="text-amber-400" />
                  Environmental &amp; Situational Modifiers
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                        <th className="pb-1.5">Condition</th>
                        <th className="pb-1.5 text-center">Modifier</th>
                        <th className="pb-1.5 hidden sm:table-cell">Tactical Effect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {SITUATIONAL_PERCEPTION_MODIFIERS.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="py-1.5 font-medium text-slate-200">{m.condition}</td>
                          <td className="py-1.5 text-center font-mono font-bold text-amber-300">{m.mod}</td>
                          <td className="py-1.5 text-slate-400 text-[10px] hidden sm:table-cell">{m.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-300">
                  <Compass size={14} className="text-cyan-400" />
                  Perception Challenge Ratings (DCs)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                        <th className="pb-1.5">DC</th>
                        <th className="pb-1.5">Tier</th>
                        <th className="pb-1.5">Sample Challenge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {CHALLENGE_RATINGS.map((cr) => (
                        <tr key={cr.dc} className="hover:bg-slate-900/40">
                          <td className="py-1.5 font-mono font-bold text-cyan-300">DC {cr.dc}</td>
                          <td className="py-1.5 font-bold text-slate-300">{cr.label}</td>
                          <td className="py-1.5 text-slate-400 text-[10px]">{cr.perceptionExample}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 7: ESSENCE POOL */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'essence' && (
          <div className="space-y-6">
            {/* Live Hero Essence Tracker */}
            <div className="bg-slate-950/80 border border-purple-500/40 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-400" />
                  Hero Essence Reservoir Live Telemetry
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-600/50 text-purple-300 font-bold">
                  Total Essence Capacity: {essenceTotal}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">1. Ability Substrate (Containment)</div>
                    <div className="text-2xl font-black text-purple-300 my-1">+{primaryAttrsTotal}</div>
                    <div className="text-[9px] text-slate-400">Sum of All 6 Primary Attributes</div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-[9px] text-slate-400 bg-slate-950 p-1.5 rounded">
                    {primaryAttrs.map(a => (
                      <span key={a.id}>{a.name.slice(0, 3)}: <strong className="text-cyan-300">{a.score}</strong></span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-amber-700/60 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400">2. The Conduit (Attune Skill)</div>
                    <div className="text-2xl font-black text-amber-300 my-1">+{attuneRank + attuneMod}</div>
                    <div className="text-[9px] text-slate-400">Rank ({attuneRank}) + Mod ({attuneMod})</div>
                  </div>
                  <div className="text-[9px] text-amber-300/80 bg-slate-950 p-1.5 rounded mt-2">
                    Ensures precision in opening conduits to universal Code without blowback
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-700/60 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-cyan-400">3. The Breadth (Disciplines)</div>
                    <div className="text-2xl font-black text-cyan-300 my-1">+{metaSkillsTotal - (attuneRank + attuneMod)}</div>
                    <div className="text-[9px] text-slate-400">Sum of Ranks Across Known Disciplines</div>
                  </div>
                  <div className="text-[9px] text-cyan-300/80 bg-slate-950 p-1.5 rounded mt-2">
                    Total ranks in Dimension, Energy, Entropy, Illusion, Matter &amp; Mental
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-purple-950/40 border border-purple-800/40 text-center font-mono text-xs text-purple-200">
                <strong>Formula:</strong> Essence Pool = Primary Attributes ({primaryAttrsTotal}) + Attune ({attuneRank + attuneMod}) + Discipline Breadth ({metaSkillsTotal - (attuneRank + attuneMod)}) = <strong className="text-purple-300 text-sm">{essenceTotal} Essence</strong>
              </div>
            </div>

            {/* Essence Cost Scale Table */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Zap size={15} className="text-purple-400" />
                  Canonical Essence Cost Scale (Environmental DC vs Cost)
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Source: 4.00 METAPHYSICS</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                      <th className="py-2 px-3">Difficulty Tier</th>
                      <th className="py-2 px-2 text-center">Base DC</th>
                      <th className="py-2 px-2 text-center font-bold text-purple-300">Essence Cost</th>
                      <th className="py-2 px-3">Environmental Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-sans">
                    {ESSENCE_COST_SCALE.map((tier, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-200">{tier.difficulty}</td>
                        <td className="py-2 px-2 text-center font-mono text-cyan-300 font-bold">DC {tier.dc}</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-purple-300">
                          {tier.essenceCost === 0 ? (
                            <span className="text-emerald-400">0 Essence</span>
                          ) : (
                            <span className="text-amber-300">+{tier.essenceCost} Essence</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">{tier.context}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overchanneling & Rest Recovery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-rose-950/40 border border-rose-600/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold uppercase text-xs">
                  <Flame size={16} className="text-rose-400" />
                  "The Burn" (Overchanneling Life Force)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  If an operative’s Essence Pool is completely exhausted (0), they may elect to <strong className="text-rose-300">burn their own biological/synthetic life force</strong> to fuel invocations:
                </p>
                <div className="bg-slate-950/90 p-2.5 rounded border border-rose-800 text-rose-200 font-mono text-[11px] space-y-1">
                  <div><strong>Damage Rate:</strong> 2 Direct Health Damage per 1 Essence needed</div>
                  <div className="text-[10px] text-slate-400">Bypasses Armor DR and Stamina Toughness completely.</div>
                </div>
                <div className="text-[10.5px] text-rose-300/80">
                  <strong>Internalized Strain:</strong> If a free-cast invocation check fails, the Essence is still consumed and the caster takes <strong>1d6 Non-Lethal damage per 5 points of failure</strong>.
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-600/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold uppercase text-xs">
                  <Clock size={16} className="text-emerald-400" />
                  Essence Restoration &amp; Pacing
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Essence is continuously recycled from ambient reality once an operative reaches equilibrium through restful downtime:
                </p>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="bg-slate-950/90 p-2 rounded border border-emerald-800 text-emerald-200">
                    <strong>Light Rest (1 Hour):</strong> Recovers Essence equal to operative's <strong>Key Ability Modifier</strong> (minimum 1 Essence/hr).
                  </div>
                  <div className="bg-slate-950/90 p-2 rounded border border-emerald-800 text-cyan-200">
                    <strong>Full Rest (6-8 Hours):</strong> Completely recharges the operative's Essence Pool to 100% maximum capacity.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 8: MOVEMENT & PACES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'movement' && (
          <div className="space-y-6">
            {/* Live Hero Locomotion Tracker */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Footprints size={14} className="text-amber-400" />
                  Hero Locomotion &amp; Speed Telemetry
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-600/50 text-amber-300 font-bold">
                  Fatigue Save: Fortitude {fortitudeTotal >= 0 ? `+${fortitudeTotal}` : fortitudeTotal} (DC 15)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono">
                <div className={`p-2.5 rounded-lg border ${walkSpeed > 0 ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-300' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Ground Walk</div>
                  <div className="text-base font-black">{walkSpeed} ft</div>
                  <div className="text-[9px] text-slate-400">{Math.round(walkSpeed * 0.3)} m/turn</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${flySpeed > 0 ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-300' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Flight</div>
                  <div className="text-base font-black">{flySpeed} ft</div>
                  <div className="text-[9px] text-slate-400">{Math.round(flySpeed * 0.3)} m/turn</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${swimSpeed > 0 ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-300' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Swim</div>
                  <div className="text-base font-black">{swimSpeed} ft</div>
                  <div className="text-[9px] text-slate-400">{Math.round(swimSpeed * 0.3)} m/turn</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${climbSpeed > 0 ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-300' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Climb</div>
                  <div className="text-base font-black">{climbSpeed} ft</div>
                  <div className="text-[9px] text-slate-400">{Math.round(climbSpeed * 0.3)} m/turn</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${burrowSpeed > 0 ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-300' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Burrow</div>
                  <div className="text-base font-black">{burrowSpeed} ft</div>
                  <div className="text-[9px] text-slate-400">{Math.round(burrowSpeed * 0.3)} m/turn</div>
                </div>

                <div className={`p-2.5 rounded-lg border ${teleportSpeed > 0 ? 'bg-slate-900/90 border-purple-500/50 text-purple-300' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Teleport</div>
                  <div className="text-base font-black">{teleportSpeed} ft</div>
                  <div className="text-[9px] text-slate-400">{Math.round(teleportSpeed * 0.3)} m/turn</div>
                </div>
              </div>
            </div>

            {/* Mode Switcher Filter */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1 hidden sm:inline">
                Mode Charts:
              </span>
              {[
                { id: 'all', label: 'All Modes', icon: '📋' },
                { id: 'ground', label: 'Ground', icon: '🚶' },
                { id: 'flying', label: 'Flying', icon: '🪽' },
                { id: 'swimming', label: 'Swimming', icon: '🏊' },
                { id: 'climbing', label: 'Climbing', icon: '🧗' },
                { id: 'burrowing', label: 'Burrowing', icon: '⛏️' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMovementMode(mode.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeMovementMode === mode.id
                      ? 'bg-amber-950 text-amber-200 border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>

            {/* 1. Ground Movement Paces */}
            {(activeMovementMode === 'all' || activeMovementMode === 'ground') && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <span>🚶</span> Ground Movement Paces &amp; Tactical Modifiers
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Medium Canon: 30 ft/rd (6 kph) • Hero Base: <strong className="text-cyan-300">{walkSpeed} ft/rd</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                        <th className="py-2 px-3">Pace</th>
                        <th className="py-2 px-2 text-center">Multiplier</th>
                        <th className="py-2 px-2 text-center font-bold text-amber-300">Hero Speed</th>
                        <th className="py-2 px-2 text-center">Action Mod</th>
                        <th className="py-2 px-3">Check &amp; Fatigue Rules</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-sans">
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-200">Walk</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">1.0x</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{walkSpeed} ft ({Math.round(walkSpeed * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">Normal combat maneuvering; no checks required</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-amber-300">Jog</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{walkSpeed * 2} ft ({Math.round(walkSpeed * 2 * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-2 Penalty</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">Hurried pace; imposes -2 to fine motor/ranged actions</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-orange-400">Running</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">4.0x <span className="text-[10px] text-slate-500">(5x Runner)</span></td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">
                          {walkSpeed * 4} ft ({Math.round(walkSpeed * 4 * 0.3)}m)
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Requires <strong>Athletics DC 10+</strong> every minute of sustained exertion</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-rose-400">Sprinting</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">6.0x <span className="text-[10px] text-slate-500">(7x Runner)</span></td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">
                          {walkSpeed * 6} ft ({Math.round(walkSpeed * 6 * 0.3)}m)
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-8 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Maximum burst; <strong>Athletics DC 15+</strong>. Triggers Fatigue Save after 5 rounds!</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-300">Crawl</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">0.5x (1/2x)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{Math.round(walkSpeed * 0.5)} ft</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">+2 Stealth</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">Prone posture; granting cover against ranged attacks</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-300">Slow Crawl</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">0.25x (1/4x)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{Math.round(walkSpeed * 0.25)} ft</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">+4 Stealth</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">Ultra-silent infiltration through ducts or grass</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Flying Movement Paces & Maneuvers */}
            {(activeMovementMode === 'all' || activeMovementMode === 'flying') && (
              <div className="bg-slate-950/70 border border-cyan-900/60 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    <span>🪽</span> Flying Movement Paces &amp; Tactical Aerial Maneuvers
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Medium Canon: 60 ft/rd (2x Walk) • Hero Flight Base: <strong className="text-cyan-300">{flyBaseSpeed} ft/rd</strong> {flySpeed > 0 ? '(Native/Equipped)' : '(Standard 2x Walk)'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                        <th className="py-2 px-3">Maneuver</th>
                        <th className="py-2 px-2 text-center">Multiplier</th>
                        <th className="py-2 px-2 text-center font-bold text-cyan-300">Hero Speed</th>
                        <th className="py-2 px-2 text-center">Subtlety Mod</th>
                        <th className="py-2 px-3">Check &amp; Tactical Rules</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-sans">
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-200">Flight</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">1.0x Fly (2x Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{flyBaseSpeed} ft ({Math.round(flyBaseSpeed * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">Standard cruising flight in 3D airspace; no checks required</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-amber-300">Sail</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x Fly (4x Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{flyBaseSpeed * 2} ft ({Math.round(flyBaseSpeed * 2 * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-2 Penalty</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">Hurried flight / wide wing-spread thermal cruising; -2 penalty to fine actions</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-orange-400">Surge / Soar</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">4.0x Fly (8x Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{flyBaseSpeed * 4} ft ({Math.round(flyBaseSpeed * 4 * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Rapid pursuit &amp; intercept; <strong>Acrobatics DC 10+</strong> every min (5x with Soar trait)</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-rose-400">Diving</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x Current (Up to 8x Fly)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">Up to {flyBaseSpeed * 8} ft ({Math.round(flyBaseSpeed * 8 * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Steep high-speed power dive; requires <strong>Acrobatics DC 15+</strong> (9x with Soar trait)</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-emerald-300">Gliding</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">Maintains Forward Speed</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{flyBaseSpeed} ft ({Math.round(flyBaseSpeed * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">+2 Bonus</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Controlled descent; drops 1 ft per 5 ft horizontal; <strong>Acrobatics DC 10+</strong></td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-300">Hover / Controlled Descent</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">1/2 Fly or Less (Static)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{Math.round(flyBaseSpeed * 0.5)} ft or 0 ft</td>
                        <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">Holding stationary altitude; <strong>Acrobatics DC 15+</strong> (unless possessing native hover)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Flying Combat Tactical Modifiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-700/50 space-y-1">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                      <span>🎯</span> High Ground Tactical Advantage
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed">
                      Flyers maintaining altitude above ground targets gain <strong className="text-emerald-300">+2 to Strike</strong> and <strong className="text-emerald-300">+2 to Critical Range</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-700/50 space-y-1">
                    <div className="font-bold text-rose-300 flex items-center gap-1.5 text-[11px]">
                      <span>💥</span> Aerial Rams (Kinetic Collisions)
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed">
                      Deliberate ramming deals <strong className="text-amber-300">+1d per Flight Stage + 1 Impact Damage per 10 ft of speed</strong> to all involved parties.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Swimming Movement Paces */}
            {(activeMovementMode === 'all' || activeMovementMode === 'swimming') && (
              <div className="bg-slate-950/70 border border-blue-900/60 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
                    <span>🏊</span> Swimming Movement Paces &amp; Aquatic Operations
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Medium Canon: 15 ft/rd (1/2 Walk) [3 kph] • Hero Swim Base: <strong className="text-cyan-300">{swimBaseSpeed} ft/rd</strong> {swimSpeed > 0 ? '(Native/Equipped)' : '(1/2 Walk)'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                        <th className="py-2 px-3">Pace</th>
                        <th className="py-2 px-2 text-center">Multiplier</th>
                        <th className="py-2 px-2 text-center font-bold text-blue-300">Hero Speed</th>
                        <th className="py-2 px-2 text-center">Subtlety Mod</th>
                        <th className="py-2 px-3">Check &amp; Fatigue Rules</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-sans">
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-200">Swimming</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">1.0x Swim (1/2 Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{swimBaseSpeed} ft ({Math.round(swimBaseSpeed * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">Standard calm swimming; no checks required under normal conditions</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-amber-300">Glide</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x Swim (1.0x Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{swimBaseSpeed * 2} ft ({Math.round(swimBaseSpeed * 2 * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-2 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Hurried swimming pace; requires <strong>Athletics (Swimming) DC 10+</strong></td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-orange-400">Stroke</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">4.0x Swim (2.0x Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{swimBaseSpeed * 4} ft ({Math.round(swimBaseSpeed * 4 * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Full power stroke exertion; requires <strong>Athletics (Swimming) DC 15+</strong></td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-emerald-300">Treading</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">1/2 Swim or Less</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{Math.round(swimBaseSpeed * 0.5 * 10) / 10} ft</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">+2 Bonus</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Maintaining surface position; +2 to actions; <strong>Athletics (Swimming) DC 5+</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-[10.5px] text-slate-300">
                  <strong className="text-blue-300">Aquatic Feature Trait:</strong> Operatives with dedicated aquatic features (flippers, aquatic physiology, cyber-gills) increase swimming baseline to <strong>30 ft/rd</strong> (Glide 60 ft, Stroke 90 ft).
                </div>
              </div>
            )}

            {/* 4. Climbing Movement Paces & Surface Difficulties */}
            {(activeMovementMode === 'all' || activeMovementMode === 'climbing') && (
              <div className="bg-slate-950/70 border border-emerald-900/60 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <span>🧗</span> Climbing Movement Paces &amp; Surface Difficulties
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Medium Canon: 15 ft/rd (Easy) • Hero Base: <strong className="text-cyan-300">{climbBaseSpeed} ft/rd</strong> {climbSpeed > 0 ? '(Native)' : '(1/2 Walk)'}
                  </span>
                </div>

                {/* Surface Difficulties */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider">
                    Terrain Surface Difficulty Benchmarks:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-300">Easy (DC 10+)</span>
                        <span className="font-mono text-cyan-300 font-bold">{Math.round(walkSpeed * 0.5)} ft/rd</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">1/2 Walking Speed</div>
                      <p className="text-[10px] text-slate-400 mt-1">Ladders, steep inclines with handholds, knotted ropes, climbing pegs</p>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-300">Moderate (DC 15+)</span>
                        <span className="font-mono text-cyan-300 font-bold">{Math.round(walkSpeed * 0.25)} ft/rd</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">1/4 Walking Speed</div>
                      <p className="text-[10px] text-slate-400 mt-1">Brick masonry, textured natural rock, scaffolding, tree trunks</p>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-rose-300">Difficult (DC 20+)</span>
                        <span className="font-mono text-cyan-300 font-bold">{Math.max(1, Math.round(walkSpeed * 0.1))} ft/rd</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">1/10 Walking Speed</div>
                      <p className="text-[10px] text-slate-400 mt-1">Sheer vertical rock, wet ice, polished metallic spaceship hulls</p>
                    </div>
                  </div>
                </div>

                {/* Active Climbing Paces Table */}
                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                        <th className="py-2 px-3">Climbing Pace</th>
                        <th className="py-2 px-2 text-center">Speed Ratio</th>
                        <th className="py-2 px-2 text-center font-bold text-emerald-300">Hero Speed</th>
                        <th className="py-2 px-2 text-center">Action Mod</th>
                        <th className="py-2 px-3">Check &amp; Fatigue Rules</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-sans">
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-200">Scaling</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">1.0x Walk</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{walkSpeed} ft ({Math.round(walkSpeed * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-2 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Ascending at full base speed; <strong>Athletics (Climb) at -5 check penalty</strong></td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-amber-300">Fast Ascent</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x Walk</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{walkSpeed * 2} ft ({Math.round(walkSpeed * 2 * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Ascending at double speed; <strong>Athletics (Climb) at -10 check penalty</strong></td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-orange-400">Fast Descent</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">4.0x Walk</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{walkSpeed * 4} ft ({Math.round(walkSpeed * 4 * 0.3)}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Descending at quadruple speed; <strong>DC 20 Athletics (Climb)</strong> or <strong>-10 penalty</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[10.5px] text-slate-300">
                  <strong className="text-emerald-300">Climbing Feature Trait:</strong> Characters with dedicated climbing adaptations scale at base <strong>30 ft/rd</strong> (Scaling 60 ft, Fast Ascent 90 ft, Fast Descent 180 ft).
                </div>
              </div>
            )}

            {/* 5. Burrowing Movement Paces */}
            {(activeMovementMode === 'all' || activeMovementMode === 'burrowing') && (
              <div className="bg-slate-950/70 border border-amber-900/60 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <span>⛏️</span> Burrowing Movement Paces &amp; Subterranean Excavation
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Medium Canon: 7.5 ft/rd (1/4 Walk) • Hero Burrow Base: <strong className="text-cyan-300">{burrowBaseSpeed} ft/rd</strong> {burrowSpeed > 0 ? '(Native)' : '(1/4 Walk)'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                        <th className="py-2 px-3">Pace</th>
                        <th className="py-2 px-2 text-center">Speed Ratio</th>
                        <th className="py-2 px-2 text-center font-bold text-amber-400">Hero Speed</th>
                        <th className="py-2 px-2 text-center">Action Mod</th>
                        <th className="py-2 px-3">Practical Application &amp; Geological Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-sans">
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-200">Burrowing</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">1.0x Burrow (1/4 Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{burrowBaseSpeed} ft ({Math.round(burrowBaseSpeed * 0.3 * 10) / 10}m)</td>
                        <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Standard displacement through loose soil, sand, soft sediment, or gravel</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-amber-300">Tunneling</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x Burrow (1/2 Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{burrowBaseSpeed * 2} ft ({Math.round(burrowBaseSpeed * 2 * 0.3 * 10) / 10}m)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-2 Penalty</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Rapid breaching and creating hasty, unreinforced tunnels prone to collapse</td>
                      </tr>
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-bold text-slate-300">Excavation</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">0.5x Burrow (1/8 Walk)</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{Math.round(burrowBaseSpeed * 0.5 * 10) / 10} ft</td>
                        <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">Carefully carving fortified underground chambers, pit traps, or structural foundations</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[10.5px] text-slate-300">
                  <strong className="text-amber-300">Fossorial Species Note:</strong> Dedicated subterranean species (e.g. Kitin burrowers, earth elementals) baseline at <strong>20 ft/rd</strong>.
                </div>
              </div>
            )}

            {/* Fatigue System */}
            <div className="bg-rose-950/30 border border-rose-500/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 font-bold uppercase text-xs">
                  <AlertTriangle size={16} className="text-rose-400" />
                  Movement Fatigue &amp; Exhaustion Mechanics
                </div>
                <span className="text-[10px] font-mono bg-rose-950 px-2 py-0.5 rounded text-rose-200 border border-rose-800">
                  CRITICAL SURVIVAL RULE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-rose-900/60 space-y-1.5">
                  <div className="font-bold text-rose-300 font-mono text-[11px]">1. Fatigue Check Triggers</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li><strong>Sprint Trigger:</strong> 5 consecutive combat rounds of sprinting forces an immediate <strong>Stamina Fortitude Check (DC 15)</strong>.</li>
                    <li><strong>Hurried Travel:</strong> 10 minutes of hurried travel forces an immediate <strong>Stamina Fortitude Check (DC 15)</strong>.</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-rose-900/60 space-y-1.5">
                  <div className="font-bold text-amber-300 font-mono text-[11px]">2. Failure Penalties &amp; Damage</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li><strong>Vitality Damage:</strong> Failure inflicts <strong>5 points of Non-Lethal Vitality damage</strong> (+1 pt per 5 points missed below DC 15).</li>
                    <li><strong>Exhaustion Condition:</strong> When Vitality hits 0, takes <strong>2 Health damage</strong> and gains <strong>Exhausted</strong> (-2 to all active checks, 1/2 move speed) until taking a <strong>Light Rest (Nap)</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-cyan-900/60 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono">⚡ Tangent SFF RP Master Codex</span>
            <span>•</span>
            <span>All 8 Core Rules Sections Integrated</span>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Done / Close Codex
          </button>
        </div>

      </div>
    </div>
  );
};

export { PerceptionEssenceMovementModal as CoreStatsRulesModal };
export default React.memo(PerceptionEssenceMovementModal);
