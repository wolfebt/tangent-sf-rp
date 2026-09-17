import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Dna, 
  Sparkles, 
  Brain, 
  Shield, 
  Zap, 
  AlertTriangle, 
  Compass, 
  Sliders, 
  Info, 
  Check, 
  BookOpen, 
  Layers, 
  HelpCircle,
  Maximize2,
  TrendingUp,
  Award,
  Flame,
  Activity,
  UserCheck,
  Tag
} from 'lucide-react';

// Canonical Data Imports
import { ALL_CANONICAL_TRAITS, getTraitById } from '../../data/speciesTraitsData';
import { ALL_CANONICAL_SKILLS } from '../../data/skillsData';
import { DEFAULT_FEATURES, getFeatureById } from '../../data/featuresData';
import { DEFAULT_SPECIES_DISADVANTAGES, getDisadvantageById } from '../../data/speciesDisadvantagesData';
import { DEFAULT_SPECIES_TYPES, getSpeciesTypeById } from '../../data/speciesTypesData';
import { DEFAULT_SPECIES_SIZES, getSizeById } from '../../data/speciesSizeData';

/**
 * 1. OMNICORTEX TOOLTIP PORTAL WRAPPER
 * High-performance, glass-cockpit portal tooltip with boundary clamping,
 * interactive hovering, and auto-placement.
 */
export const OmnicortexTooltip = ({
  content,
  children,
  position = 'top',
  color = '#a855f7',
  delay = 1000,
  className = '',
  interactive = true,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, actualPos: 'top' });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12;

    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const tooltipWidth = tooltipRect?.width || 360;
    const tooltipHeight = tooltipRect?.height || 260;

    const spaceAbove = triggerRect.top - margin;
    const spaceBelow = viewportHeight - triggerRect.bottom - margin;
    const spaceLeft = triggerRect.left - margin;
    const spaceRight = viewportWidth - triggerRect.right - margin;

    let targetPos = position;
    if (position === 'top' && spaceAbove < tooltipHeight && spaceBelow > spaceAbove) {
      targetPos = 'bottom';
    } else if (position === 'bottom' && spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      targetPos = 'top';
    } else if (position === 'left' && spaceLeft < tooltipWidth && spaceRight > spaceLeft) {
      targetPos = 'right';
    } else if (position === 'right' && spaceRight < tooltipWidth && spaceLeft > spaceRight) {
      targetPos = 'left';
    }

    let top = 0;
    let left = 0;

    if (targetPos === 'top') {
      top = triggerRect.top - 8;
      left = triggerRect.left + triggerRect.width / 2;
    } else if (targetPos === 'bottom') {
      top = triggerRect.bottom + 8;
      left = triggerRect.left + triggerRect.width / 2;
    } else if (targetPos === 'left') {
      top = triggerRect.top + triggerRect.height / 2;
      left = triggerRect.left - 8;
    } else if (targetPos === 'right') {
      top = triggerRect.top + triggerRect.height / 2;
      left = triggerRect.right + 8;
    }

    // Horizontal clamping
    if (targetPos === 'top' || targetPos === 'bottom') {
      const halfWidth = tooltipWidth / 2;
      if (left - halfWidth < margin) {
        left = margin + halfWidth;
      } else if (left + halfWidth > viewportWidth - margin) {
        left = viewportWidth - margin - halfWidth;
      }
    } else if (targetPos === 'left') {
      if (left - tooltipWidth < margin) {
        left = margin + tooltipWidth;
      }
    } else if (targetPos === 'right') {
      if (left + tooltipWidth > viewportWidth - margin) {
        left = viewportWidth - margin - tooltipWidth;
      }
    }

    // Vertical clamping
    if (targetPos === 'top') {
      if (top - tooltipHeight < margin) {
        top = margin + tooltipHeight;
      }
    } else if (targetPos === 'bottom') {
      if (top + tooltipHeight > viewportHeight - margin) {
        top = viewportHeight - margin - tooltipHeight;
      }
    } else {
      const halfHeight = tooltipHeight / 2;
      if (top - halfHeight < margin) {
        top = margin + halfHeight;
      } else if (top + halfHeight > viewportHeight - margin) {
        top = viewportHeight - margin - halfHeight;
      }
    }

    setCoords({ top, left, actualPos: targetPos });
  }, [position]);

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    showTimerRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 140);
  };

  const handleClick = () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      const handleScrollOrResize = () => calculatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        if (showTimerRef.current) clearTimeout(showTimerRef.current);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      };
    }
  }, [isVisible, calculatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-flex items-center ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </div>

      {isVisible && content && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={() => {
            if (interactive && hideTimerRef.current) {
              clearTimeout(hideTimerRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
          className="fixed z-[999999] w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-[#070b14]/98 border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(0,0,0,0.8)] p-3.5 text-left font-sans backdrop-blur-2xl animate-fade-in pointer-events-auto select-text max-h-[85vh] overflow-y-auto"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: coords.actualPos === 'top'
              ? 'translate(-50%, -100%)'
              : coords.actualPos === 'bottom'
              ? 'translate(-50%, 0%)'
              : coords.actualPos === 'left'
              ? 'translate(-100%, -50%)'
              : 'translate(0%, -50%)',
            borderColor: `${color}80`,
            boxShadow: `0 15px 40px rgba(0,0,0,0.9), 0 0 20px ${color}35`
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

/**
 * 2. DETAILED TRAIT TOOLTIP CARD
 */
export const TraitTooltipCard = ({
  trait: rawTrait,
  customTraits = []
}) => {
  const trait = useMemo(() => {
    if (!rawTrait) return null;
    if (typeof rawTrait === 'object') {
      const match = getTraitById(rawTrait.id) || ALL_CANONICAL_TRAITS.find(t => t.name.toLowerCase() === (rawTrait.name || '').toLowerCase());
      return { ...match, ...rawTrait };
    }
    const idStr = String(rawTrait).trim();
    const fromId = getTraitById(idStr) || getTraitById(`trait-${idStr}`);
    if (fromId) return fromId;
    const fromName = ALL_CANONICAL_TRAITS.find(t => t.name.toLowerCase() === idStr.toLowerCase());
    if (fromName) return fromName;
    const fromCustom = customTraits.find(t => (t.id || t.name || '').toLowerCase() === idStr.toLowerCase());
    if (fromCustom) return fromCustom;
    return {
      id: idStr,
      name: idStr.replace(/^trait-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      classification: 'Species Trait',
      tier: 'Basic',
      bp: 1,
      description: 'Canonical species biological trait.'
    };
  }, [rawTrait, customTraits]);

  if (!trait) return null;

  const tier = trait.trait_tier || trait.tier || 'Basic';
  const tierColor = tier === 'Elite' 
    ? 'text-amber-400 bg-amber-950/80 border-amber-500/60' 
    : tier === 'Advanced' 
    ? 'text-purple-400 bg-purple-950/80 border-purple-500/60' 
    : 'text-cyan-400 bg-cyan-950/80 border-cyan-500/60';

  const cpCost = trait.bp || trait.cp || trait.costs?.bp || 1;

  return (
    <div className="space-y-2.5 font-mono text-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-purple-500/30">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${tierColor}`}>
              {tier} Tier
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {trait.classification || trait.type || 'Physical'}
            </span>
            {trait.isExclusive && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Exclusive
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mt-1 flex items-center gap-1.5">
            <Dna size={14} className="text-purple-400 shrink-0" />
            <span>{trait.name}</span>
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm">
            {cpCost} CP
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">Character Points</span>
        </div>
      </div>

      {/* Description */}
      <div className="text-[11px] text-slate-200 leading-relaxed font-sans">
        {trait.description || trait.desc || 'No description recorded.'}
      </div>

      {/* Mechanics & Rule Effect */}
      {(trait.mechanics || trait.mechanic) && (
        <div className="p-2.5 bg-slate-950/80 border border-purple-500/30 rounded-xl space-y-1">
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-purple-300">
            <Sparkles size={11} className="text-purple-400 shrink-0" />
            <span>Game Mechanics & Rules Effect</span>
          </div>
          <p className="text-[10.5px] text-purple-100/90 leading-snug font-sans">
            {trait.mechanics || trait.mechanic}
          </p>
        </div>
      )}

      {/* Modifiers List (if any) */}
      {Array.isArray(trait.modifiers) && trait.modifiers.length > 0 && (
        <div className="space-y-1 pt-1">
          <span className="text-[9px] font-bold uppercase text-slate-400">Granted Modifiers:</span>
          <div className="flex flex-wrap gap-1">
            {trait.modifiers.map((m, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold"
              >
                {m.target}: {m.value > 0 ? `+${m.value}` : m.value} {m.mode ? `(${m.mode})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footnote / Special Rules */}
      {(trait.rules || trait.special_rules || trait.notes) && (
        <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center gap-1">
          <Info size={10} className="text-slate-500 shrink-0" />
          <span className="truncate">{trait.rules || trait.special_rules || trait.notes}</span>
        </div>
      )}
    </div>
  );
};

/**
 * 3. DETAILED SKILL SUMMARY CARD
 */
export const SkillSummaryCard = ({
  skill: rawSkill,
  bonus = null,
  customSkills = []
}) => {
  const skill = useMemo(() => {
    if (!rawSkill) return null;
    const nameStr = typeof rawSkill === 'object' ? (rawSkill.skill || rawSkill.name || rawSkill.id || '') : String(rawSkill);
    const match = ALL_CANONICAL_SKILLS.find(s => s.name.toLowerCase() === nameStr.toLowerCase() || s.id.toLowerCase() === nameStr.toLowerCase());
    if (match) return { ...match, ...(typeof rawSkill === 'object' ? rawSkill : {}) };
    const fromCustom = customSkills.find(s => (s.name || s.id || '').toLowerCase() === nameStr.toLowerCase());
    if (fromCustom) return { ...fromCustom, ...(typeof rawSkill === 'object' ? rawSkill : {}) };
    return {
      name: nameStr,
      group: 'General',
      baseAttr: 'attr-intellect',
      description: `Aptitude in ${nameStr} operational checks and saves.`
    };
  }, [rawSkill, customSkills]);

  if (!skill) return null;

  const baseAttrLabel = (skill.baseAttr || '').replace(/^attr-/, '').toUpperCase() || 'ATTRIBUTE';
  const bonusVal = bonus !== null ? bonus : (typeof rawSkill === 'object' ? (rawSkill.bonus ?? rawSkill.value ?? null) : null);

  return (
    <div className="space-y-2.5 font-mono text-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-amber-500/30">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/60">
              {skill.group || 'Skill'} Group
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/40">
              Governed by {baseAttrLabel}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mt-1 flex items-center gap-1.5">
            <Brain size={14} className="text-amber-400 shrink-0" />
            <span>{skill.name}</span>
          </h4>
        </div>
        {bonusVal !== null && (
          <div className="text-right shrink-0">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm">
              +{bonusVal} Bonus
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">Species Aptitude</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="text-[11px] text-slate-200 leading-relaxed font-sans">
        {skill.description || 'Specialized knowledge or physical training.'}
      </div>

      {/* Application Callout */}
      <div className="p-2 bg-slate-950/80 border border-amber-500/30 rounded-xl text-[10px] space-y-1">
        <div className="flex items-center gap-1 font-bold text-amber-400 uppercase tracking-wider text-[9px]">
          <TrendingUp size={11} className="text-amber-400 shrink-0" />
          <span>BASTION Check Application</span>
        </div>
        <p className="text-slate-300 font-sans leading-snug">
          Roll 1d20 + {baseAttrLabel} Mod {bonusVal ? `+ ${bonusVal} (Species)` : ''} + Proficiency vs Target DC.
        </p>
      </div>
    </div>
  );
};

/**
 * 4. DETAILED FEATURE SUMMARY CARD
 */
export const FeatureSummaryCard = ({
  feature: rawFeature,
  mode = 'inherent',
  customFeatures = []
}) => {
  const feature = useMemo(() => {
    if (!rawFeature) return null;
    const nameStr = typeof rawFeature === 'object' ? (rawFeature.name || rawFeature.id || '') : String(rawFeature);
    const match = getFeatureById(nameStr) || DEFAULT_FEATURES.find(f => f.name.toLowerCase() === nameStr.toLowerCase());
    if (match) return { ...match, ...(typeof rawFeature === 'object' ? rawFeature : {}) };
    const fromTrait = ALL_CANONICAL_TRAITS.find(t => t.name.toLowerCase() === nameStr.toLowerCase());
    if (fromTrait) return { ...fromTrait, ...(typeof rawFeature === 'object' ? rawFeature : {}) };
    const fromCustom = customFeatures.find(f => (f.name || f.id || '').toLowerCase() === nameStr.toLowerCase());
    if (fromCustom) return { ...fromCustom, ...(typeof rawFeature === 'object' ? rawFeature : {}) };
    return {
      name: nameStr,
      category: 'General Feature',
      cp: 1,
      description: 'Specialized physical or tactical feature.'
    };
  }, [rawFeature, customFeatures]);

  if (!feature) return null;

  const isPurple = mode === 'recommended';
  const borderTone = isPurple ? 'border-purple-500/30' : 'border-emerald-500/30';
  const textTone = isPurple ? 'text-purple-400' : 'text-emerald-400';
  const badgeTone = isPurple 
    ? 'bg-purple-950/80 text-purple-300 border-purple-500/60' 
    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60';

  const cpCost = feature.cp || feature.costs?.bp || 1;

  return (
    <div className="space-y-2.5 font-mono text-xs">
      {/* Top Header */}
      <div className={`flex items-start justify-between gap-2 pb-2 border-b ${borderTone}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${badgeTone}`}>
              {mode === 'recommended' ? 'Recommended Feature' : 'Inherent Feature'}
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {feature.category || feature.type || 'Feature'}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mt-1 flex items-center gap-1.5">
            <Sparkles size={14} className={`${textTone} shrink-0`} />
            <span>{feature.name}</span>
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border shadow-sm ${badgeTone}`}>
            {cpCost} CP
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">Point Cost</span>
        </div>
      </div>

      {/* Description */}
      <div className="text-[11px] text-slate-200 leading-relaxed font-sans">
        {feature.description || feature.desc || 'No description recorded.'}
      </div>

      {/* Mechanics */}
      {(feature.mechanic || feature.mechanics) && (
        <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-300">
            <Zap size={11} className="text-amber-400 shrink-0" />
            <span>Tactical Benefit & Rules</span>
          </div>
          <p className="text-[10.5px] text-slate-300 leading-snug font-sans">
            {feature.mechanic || feature.mechanics}
          </p>
        </div>
      )}

      {/* Special Rules */}
      {(feature.special_rules || feature.rules) && (
        <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center gap-1">
          <Info size={10} className="text-slate-500 shrink-0" />
          <span className="truncate">{feature.special_rules || feature.rules}</span>
        </div>
      )}
    </div>
  );
};

/**
 * 5. ATTRIBUTE MODIFIER SUMMARY CARD
 */
const ATTRIBUTE_GUIDES = {
  Strength: {
    governs: 'Melee damage rolls, carrying capacity, athletic feats, and grappling power.',
    subAttrs: ['Might', 'Physical Force'],
    role: 'Primary Physical Stat'
  },
  Agility: {
    governs: 'Initiative modifier, Reflex saving checks, armor evasion rating, stealth, and ranged weapon accuracy.',
    subAttrs: ['Reflex', 'Dexterity'],
    role: 'Primary Tactical Stat'
  },
  Stamina: {
    governs: 'Maximum Health Point (HP) pool, Fortitude saving checks, natural fatigue thresholds, and wound recovery.',
    subAttrs: ['Fortitude', 'Constitution'],
    role: 'Primary Defensive Stat'
  },
  Intellect: {
    governs: 'Technological operations, hacking, arcane/meta knowledge, complex crafting, and problem solving.',
    subAttrs: ['Logic', 'Reasoning'],
    role: 'Primary Mental Stat'
  },
  Wisdom: {
    governs: 'Perception, sensory alertness, Will saving checks, psychological discipline, and intuition.',
    subAttrs: ['Will', 'Perception'],
    role: 'Primary Awareness Stat'
  },
  Charisma: {
    governs: 'Social influence, leadership, negotiation, trade bargaining, and command presence.',
    subAttrs: ['Presence', 'Etiquette'],
    role: 'Primary Social Stat'
  }
};

export const AttributeModifierSummaryCard = ({
  attribute = 'Strength',
  bonus = 0
}) => {
  const guide = ATTRIBUTE_GUIDES[attribute] || {
    governs: 'Operational checks, tactical bonuses, and saving throws.',
    subAttrs: ['Sub-Attributes'],
    role: 'Core Biological Metric'
  };

  const isPositive = bonus >= 0;

  return (
    <div className="space-y-2.5 font-mono text-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-cyan-500/30">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/60">
              {guide.role}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mt-1 flex items-center gap-1.5">
            <Activity size={14} className="text-cyan-400 shrink-0" />
            <span>{attribute}</span>
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border shadow-sm ${
            isPositive 
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60' 
              : 'bg-red-950/80 text-red-300 border-red-500/60'
          }`}>
            {isPositive ? `+${bonus}` : bonus} Modifier
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">Species Baseline</span>
        </div>
      </div>

      {/* Governed Mechanics */}
      <div className="p-2.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-1 font-sans">
        <div className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-300">
          <Sliders size={11} className="text-cyan-400 shrink-0" />
          <span>Core In-Game Derivations</span>
        </div>
        <p className="text-[11px] text-slate-200 leading-snug">
          {guide.governs}
        </p>
      </div>

      {/* Sub-attributes */}
      <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center gap-1">
        <span className="font-bold text-slate-300">Associated Sub-Attributes:</span>
        <span className="text-cyan-300">{guide.subAttrs.join(', ')}</span>
      </div>
    </div>
  );
};

import { DEFAULT_SPECIES_MOVEMENT, getMovementById } from '../../data/speciesMovementData';

/**
 * 6. MOVEMENT MODE SUMMARY CARD
 */
const MOVEMENT_DESCRIPTIONS = {
  'Ground 30 ft': 'Standard human baseline locomotion across normal planetary terrain.',
  'Ground 40 ft': 'Enhanced running speed characteristic of agile quadrupedal or long-limbed hunters.',
  'Ground 50 ft': 'Exceptional sprint velocity allowing rapid battlefield repositioning.',
  'Ground 20 ft': 'Stout or deliberate pace with lower momentum but higher stability.',
  'Flight': 'True aerial locomotion via wings, gas bladders, or gravitational organ nodes.',
  'Aquatic': 'Hydrodynamic propulsion granting full movement efficiency underwater without suffocation.',
  'Burrowing': 'Subsurface excavation through soil and loose rock, evading surface detection.',
  'Zero-G': 'Adapted thruster organs or prehensile balance suited for deep-space vacuum traversal.'
};

export const MovementModeSummaryCard = ({
  mode = 'Ground 30 ft'
}) => {
  const modeObj = useMemo(() => {
    if (typeof mode === 'object' && mode !== null) return mode;
    const rawStr = String(mode).trim();
    // Try lookup by id or name in DEFAULT_SPECIES_MOVEMENT
    const cleanId = rawStr.toLowerCase().replace(/^species_movement-/, '').replace(/^movement-/, '');
    const found = DEFAULT_SPECIES_MOVEMENT.find(m => 
      m.id === rawStr || 
      m.id === `species_movement-${cleanId}` || 
      m.id === `movement-${cleanId}` ||
      m.name.toLowerCase() === rawStr.toLowerCase() ||
      m.name.toLowerCase().startsWith(rawStr.toLowerCase())
    );
    return found || {
      name: rawStr,
      target_mode: 'Locomotion',
      speed: 30,
      description: MOVEMENT_DESCRIPTIONS[rawStr] || 'Biological or synthetic locomotion utilized for tactical maneuverability.'
    };
  }, [mode]);

  const targetMode = modeObj.target_mode || modeObj.type || 'Locomotion';
  const speed = modeObj.base_speed || modeObj.speed || 30;
  const bp = Number(modeObj.bp || 0);

  return (
    <div className="space-y-2 font-mono text-xs max-w-sm">
      <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/30">
        <div className="flex items-center gap-1.5 min-w-0">
          <Compass size={14} className="text-amber-400 shrink-0" />
          <span className="font-bold text-white text-sm truncate">{modeObj.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {bp !== 0 && (
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
              bp > 0 ? 'bg-purple-950 text-purple-300 border-purple-500/50' : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
            }`}>
              {bp > 0 ? `+${bp}` : bp} CP
            </span>
          )}
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50">
            {targetMode}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-amber-300">
        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 font-bold">
          Speed: {speed} ft / round
        </span>
        {modeObj.classification && (
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 capitalize text-[10px]">
            {modeObj.classification}
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-200 leading-relaxed font-sans line-clamp-4">
        {modeObj.description || 'Standard tactical movement mode across planetary or void environments.'}
      </p>

      <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
        <span className="text-amber-400 font-bold">Tactical Movement:</span>
        <span className="text-slate-300">1 Combat Round = 6 Seconds (Walk/Run multipliers apply)</span>
      </div>
    </div>
  );
};

/**
 * 7. SOCIAL STIGMA SUMMARY CARD
 */
export const SocialStigmaSummaryCard = ({
  stigma = 'None'
}) => {
  const stigmaStr = String(stigma || 'None').trim();
  
  // Parse penalty from (-X)
  const penaltyMatches = [...stigmaStr.matchAll(/\(-\s*(\d+)\)/g)];
  const totalPenalty = penaltyMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);
  
  let severityLabel = 'Neutral Social Standing';
  let penaltyText = '0 Reaction Penalty';
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

  if (totalPenalty >= 6 || stigmaStr.toLowerCase().includes('extreme') || stigmaStr.toLowerCase().includes('monstrous (-6)')) {
    severityLabel = 'Extreme Stigma / Pariah';
    penaltyText = `-${totalPenalty || 6} Social Reaction Checks`;
    badgeColor = 'bg-red-950 text-red-300 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
  } else if (totalPenalty >= 4 || stigmaStr.toLowerCase().includes('severe') || stigmaStr.toLowerCase().includes('feral') || stigmaStr.toLowerCase().includes('savage')) {
    severityLabel = 'Severe Social Stigma';
    penaltyText = `-${totalPenalty || 4} Social Reaction Checks`;
    badgeColor = 'bg-red-950/80 text-red-300 border-red-500/50';
  } else if (totalPenalty >= 2 || stigmaStr.toLowerCase().includes('xeno') || stigmaStr.toLowerCase().includes('synthetic') || stigmaStr.toLowerCase().includes('shifter')) {
    severityLabel = 'Typical Cultural Stigma';
    penaltyText = `-${totalPenalty || 2} Social Reaction Checks`;
    badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
  } else if (totalPenalty >= 1 || stigmaStr.toLowerCase().includes('minor')) {
    severityLabel = 'Minor Stigma / Exotic Strain';
    penaltyText = `-${totalPenalty || 1} Social Reaction Checks`;
    badgeColor = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
  }

  return (
    <div className="space-y-2 font-mono text-xs max-w-sm">
      <div className="flex items-center justify-between pb-1.5 border-b border-red-500/30">
        <div className="flex items-center gap-1.5 min-w-0">
          <UserCheck size={14} className="text-red-400 shrink-0" />
          <span className="font-bold text-white text-sm truncate">{stigmaStr}</span>
        </div>
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ml-2 ${badgeColor}`}>
          {severityLabel}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <span className="px-1.5 py-0.2 rounded bg-red-500/10 border border-red-500/30 text-red-300 font-bold">
          {penaltyText}
        </span>
        {totalPenalty > 0 && (
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
            +{totalPenalty} CP Refund
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
        Social modifiers reflect how external civilizations and human-centric factions perceive and treat members of this species. Higher penalties result in increased trade tariffs, law enforcement surveillance, and hostile starting NPC dispositions.
      </p>

      <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
        <span className="text-red-400 font-bold">BASTION Rule:</span>
        <span className="text-slate-300">Chapter 2 / Social Dynamics & Species Matrix</span>
      </div>
    </div>
  );
};

/**
 * 8. DISADVANTAGE SUMMARY CARD
 */
export const DisadvantageSummaryCard = ({
  disadvantage: rawDis
}) => {
  const dis = useMemo(() => {
    if (!rawDis) return null;
    const idStr = typeof rawDis === 'object' ? (rawDis.id || rawDis.name || '') : String(rawDis);
    const match = getDisadvantageById(idStr) || DEFAULT_SPECIES_DISADVANTAGES.find(d => d.name.toLowerCase() === idStr.toLowerCase());
    if (match) return { ...match, ...(typeof rawDis === 'object' ? rawDis : {}) };
    return {
      name: idStr,
      refundBP: 3,
      classification: 'Disadvantage',
      description: 'Biological or physiological vulnerability.'
    };
  }, [rawDis]);

  if (!dis) return null;

  return (
    <div className="space-y-2.5 font-mono text-xs">
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-red-500/30">
        <div>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/60">
            {dis.classification || 'Hindrance'}
          </span>
          <h4 className="text-sm font-bold text-white tracking-wide mt-1 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <span>{dis.name}</span>
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            -{dis.refundBP || 0} CP
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">Points Refunded</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
        {dis.description || dis.desc}
      </p>

      {(dis.mechanics || dis.mechanic) && (
        <div className="p-2.5 bg-slate-950/80 border border-red-500/30 rounded-xl space-y-1">
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-400">
            <AlertTriangle size={11} className="text-red-400 shrink-0" />
            <span>Severity & In-Game Penalties</span>
          </div>
          <p className="text-[10.5px] text-red-100/90 leading-snug font-sans">
            {dis.mechanics || dis.mechanic}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * 9. SPECIES TYPE SUMMARY CARD
 */
export const SpeciesTypeSummaryCard = ({
  typeId
}) => {
  const typeData = useMemo(() => {
    return getSpeciesTypeById(typeId) || DEFAULT_SPECIES_TYPES.find(t => t.name.toLowerCase() === String(typeId).toLowerCase()) || null;
  }, [typeId]);

  if (!typeData) return null;

  return (
    <div className="space-y-2.5 font-mono text-xs">
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-purple-500/30">
        <div>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/50">
            Species Chassis Type
          </span>
          <h4 className="text-sm font-bold text-white tracking-wide mt-1 flex items-center gap-1.5">
            <Dna size={14} className="text-purple-400 shrink-0" />
            <span>{typeData.name}</span>
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
            {typeData.bp || 0} CP
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
        {typeData.description || 'Biological chassis baseline.'}
      </p>

      <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
        {typeData.senses && (
          <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Senses:</span>
            <span className="text-purple-300">{typeData.senses}</span>
          </div>
        )}
        {typeData.immunities && (
          <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Immunities:</span>
            <span className="text-emerald-300">{typeData.immunities}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 10. SPECIES SIZE SUMMARY CARD
 */
export const SpeciesSizeSummaryCard = ({
  sizeName
}) => {
  const sizeData = useMemo(() => {
    return getSizeById(sizeName) || DEFAULT_SPECIES_SIZES.find(s => s.name.toLowerCase() === String(sizeName).toLowerCase()) || null;
  }, [sizeName]);

  if (!sizeData) return null;

  return (
    <div className="space-y-2.5 font-mono text-xs">
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-sky-500/30">
        <div>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/50">
            Physical Scale Tier
          </span>
          <h4 className="text-sm font-bold text-white tracking-wide mt-1 flex items-center gap-1.5">
            <Layers size={14} className="text-sky-400 shrink-0" />
            <span>{sizeData.name}</span>
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40">
            {sizeData.bp || 0} CP
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1">
        <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 block uppercase">Strength</span>
          <span className="font-bold text-emerald-300">
            {sizeData.strength_mod >= 0 ? `+${sizeData.strength_mod}` : sizeData.strength_mod}
          </span>
        </div>
        <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 block uppercase">Combat</span>
          <span className="font-bold text-amber-300">
            {sizeData.combat_mod >= 0 ? `+${sizeData.combat_mod}` : sizeData.combat_mod}
          </span>
        </div>
        <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 block uppercase">Stealth</span>
          <span className="font-bold text-cyan-300">
            {sizeData.stealth_mod >= 0 ? `+${sizeData.stealth_mod}` : sizeData.stealth_mod}
          </span>
        </div>
      </div>

      <div className="text-[10px] text-slate-300 space-y-0.5 pt-1 border-t border-slate-800/80">
        {sizeData.height_length_range && (
          <div><strong className="text-slate-400">Dimensions:</strong> {sizeData.height_length_range}</div>
        )}
        {sizeData.weight_range && (
          <div><strong className="text-slate-400">Weight:</strong> {sizeData.weight_range}</div>
        )}
        {sizeData.reach && (
          <div><strong className="text-slate-400">Tactical Reach:</strong> {sizeData.reach}</div>
        )}
      </div>
    </div>
  );
};
