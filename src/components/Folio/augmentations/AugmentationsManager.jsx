import React, { useState, useMemo, useCallback } from 'react';
import {
  Cpu,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Shield,
  Zap,
  Activity,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useFolio } from '../../../context/FolioContext';
import { AUGMENTATION_STAGES, ANATOMICAL_BODY_SLOTS } from '../../../engines/tangentConstants';
import {
  determineAugmentationStage,
  calculateAugmentationStageBP,
  calculateBodyCapacityBreakdown,
  getAugmentationNodes,
  getAugmentationBP,
  getAugmentationLocation,
  getAugmentationStage,
  checkAugmentationStageCompatibility
} from '../../../engines/tangentComplexEngines';
import FolioTooltip from '../shared/FolioTooltip';

const BODY_SLOT_KEYS = [
  { id: 'Head', label: 'Head', max: 10, icon: Zap },
  { id: 'Torso', label: 'Torso', max: 50, icon: Shield },
  { id: 'LeftArm', label: 'Left Arm', max: 30, icon: Activity },
  { id: 'RightArm', label: 'Right Arm', max: 30, icon: Activity },
  { id: 'LeftLeg', label: 'Left Leg', max: 40, icon: Layers },
  { id: 'RightLeg', label: 'Right Leg', max: 40, icon: Layers }
];

export const AugmentationsManager = ({
  onOpenSelectorModal,
  onOpenAssetModal
}) => {
  const {
    characterData,
    updateField,
    handleAddItem,
    getAttrTotal
  } = useFolio();

  const [activeSlotFilter, setActiveSlotFilter] = useState('all');
  const [activeStageFilter, setActiveStageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  // Derived character attributes
  const staminaScore = useMemo(() => {
    return getAttrTotal ? getAttrTotal('attr-stamina') : parseInt(characterData?.['attr-stamina'] || 0, 10);
  }, [getAttrTotal, characterData]);

  const campaignTL = useMemo(() => {
    return parseInt(characterData?.['campaign-tl'] || characterData?.['char-tl'] || 3, 10);
  }, [characterData]);

  // Stage evaluation
  const stageInfo = useMemo(() => {
    return determineAugmentationStage(characterData, { staminaScore, tl: campaignTL });
  }, [characterData, staminaScore, campaignTL]);

  // BP credit calculations
  const bpStats = useMemo(() => {
    return calculateAugmentationStageBP(characterData, stageInfo);
  }, [characterData, stageInfo]);

  // Body capacity breakdown
  const bodyBreakdown = useMemo(() => {
    return calculateBodyCapacityBreakdown(characterData);
  }, [characterData]);

  // Installed augmentations list with stage & compatibility evaluation
  const augmentationsList = useMemo(() => {
    const raw = Array.isArray(characterData?.augmentations) ? characterData.augmentations : [];
    return raw.map((aug, idx) => {
      const itemObj = typeof aug === 'object' && aug !== null ? aug : { name: String(aug) };
      const stage = getAugmentationStage(itemObj);
      const compatibility = checkAugmentationStageCompatibility(characterData, itemObj);
      return {
        ...itemObj,
        sourceIndex: idx,
        stage,
        compatibility,
        calculatedNodes: getAugmentationNodes(itemObj),
        calculatedBP: getAugmentationBP(itemObj),
        resolvedLocation: getAugmentationLocation(itemObj)
      };
    });
  }, [characterData]);

  // Incompatible augmentations across the character
  const incompatibleAugs = useMemo(() => {
    return augmentationsList.filter(aug => !aug.compatibility.isCompatible);
  }, [augmentationsList]);

  // Filtered augmentations
  const filteredAugmentations = useMemo(() => {
    return augmentationsList.filter(aug => {
      const matchesSlot = activeSlotFilter === 'all' || aug.resolvedLocation === activeSlotFilter;
      if (!matchesSlot) return false;
      const matchesStage = activeStageFilter === 'all' || aug.stage.toLowerCase() === activeStageFilter.toLowerCase();
      if (!matchesStage) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (aug.name || aug.title || '').toLowerCase();
      const desc = (aug.description || aug.summary || '').toLowerCase();
      const type = (aug.type || aug.augmentation_type || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || type.includes(q);
    });
  }, [augmentationsList, activeSlotFilter, activeStageFilter, searchQuery]);

  // Handle stage change / feature acquisition
  const handleSelectStage = useCallback((targetStageId) => {
    const rawFeatures = Array.isArray(characterData?.features) ? [...characterData.features] : [];
    
    // Feature template definitions
    const featureTemplates = {
      augmented: {
        id: 'special-augmented',
        name: 'Augmented',
        category: 'features',
        feature_category: 'Special',
        cost_bp: 3,
        description: 'The character has undergone invasive surgery to replace or enhance biological systems with cybernetics, biotechnology, or magical prosthetics.',
        benefit: 'You are compatible with Standard Augmentations.',
        special: 'Upon taking this feature, you gain a "credit" of 6 Build Points (BP) worth of Augmentations effectively for free (representing the initial suite of upgrades). Any cost beyond this must be paid with BP or Credits.'
      },
      heavy: {
        id: 'special-heavy-augmentations',
        name: 'Heavy Augmentations',
        category: 'features',
        feature_category: 'Special',
        cost_bp: 3,
        prerequisites: 'Augmented, Stamina 2',
        description: 'The character has replaced significant portions of their body with industrial or military-grade hardware. These modifications are often bulky, obvious, and not designed for social integration.',
        benefit: 'You may install Heavy class Augmentations (which often have higher DR or Strength bonuses but may impose social penalties). You gain an additional 6 BP worth of Augmentations.',
        special: 'Grants an additional 6 BP worth of Augmentations for free (+12 BP cumulative credit). Unlocks compatibility with Heavy class cybernetic and biomechanical hardware.'
      },
      extreme: {
        id: 'special-extreme-augmentations',
        name: 'Extreme Augmentations',
        category: 'features',
        feature_category: 'Special',
        cost_bp: 3,
        prerequisites: 'Heavy Augmentations, Stamina 4',
        description: 'The character is more machine (or bio-construct) than original being. They have replaced the majority of biological functions.',
        benefit: 'You may undergo Full Body Conversion. You may install systems that alter your Size category or basic physiology (e.g., tank treads instead of legs). You gain an additional 6 BP worth of Augmentations.',
        special: 'Grants an additional 6 BP worth of Augmentations for free (+18 BP cumulative credit). Permits Full Body Conversion (FBC) chassis and radical physiological structural alterations.'
      }
    };

    // Filter out existing augmentation stage features
    const stageFeatureIds = ['special-augmented', 'special-heavy-augmentations', 'special-extreme-augmentations'];
    const cleanedFeatures = rawFeatures.filter(f => {
      if (!f) return false;
      const id = typeof f === 'object' ? (f.id || '') : '';
      const name = typeof f === 'object' ? (f.name || '') : String(f);
      if (stageFeatureIds.includes(id)) return false;
      if (['augmented', 'heavy augmentations', 'extreme augmentations'].includes(name.trim().toLowerCase())) return false;
      return true;
    });

    if (targetStageId === 'augmented') {
      cleanedFeatures.push(featureTemplates.augmented);
    } else if (targetStageId === 'heavy') {
      cleanedFeatures.push(featureTemplates.augmented);
      cleanedFeatures.push(featureTemplates.heavy);
    } else if (targetStageId === 'extreme') {
      cleanedFeatures.push(featureTemplates.augmented);
      cleanedFeatures.push(featureTemplates.heavy);
      cleanedFeatures.push(featureTemplates.extreme);
    }

    updateField('features', cleanedFeatures);
    updateField('augmentation-stage', targetStageId);
  }, [characterData?.features, updateField]);

  // Handle location shift for an installed augmentation
  const handleUpdateLocation = useCallback((augIndex, newLocation) => {
    const rawList = Array.isArray(characterData?.augmentations) ? [...characterData.augmentations] : [];
    if (augIndex >= 0 && augIndex < rawList.length) {
      const current = rawList[augIndex];
      const updated = typeof current === 'object' && current !== null
        ? { ...current, location: newLocation, body_location: newLocation }
        : { name: String(current), location: newLocation, body_location: newLocation };
      rawList[augIndex] = updated;
      updateField('augmentations', rawList);
    }
  }, [characterData?.augmentations, updateField]);

  // Handle remove augmentation
  const handleRemoveAugmentation = useCallback((augIndex) => {
    const rawList = Array.isArray(characterData?.augmentations) ? [...characterData.augmentations] : [];
    if (augIndex >= 0 && augIndex < rawList.length) {
      const updated = rawList.filter((_, idx) => idx !== augIndex);
      updateField('augmentations', updated);
    }
  }, [characterData?.augmentations, updateField]);

  // Stage styling helpers
  const getStageBadgeColor = (stageId) => {
    switch (stageId) {
      case 'extreme': return 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      case 'heavy': return 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      case 'augmented': return 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]';
      default: return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: HEADER & ACTIVE STAGE BANNER */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/90 border border-amber-900/60 rounded-xl p-5 shadow-xl relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-amber-950/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-700/60 text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <span>Cybernetic &amp; Biological Augmentations</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Anatomical prosthesis installations, biological grafts, and physiological system replacements.
                </p>
              </div>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Current Stage Badge */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${getStageBadgeColor(stageInfo.stageId)}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>STAGE: {stageInfo.stage.name.toUpperCase()}</span>
            </div>

            {/* Total BP Credit Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-900/60 text-amber-300 text-xs font-mono font-bold">
              <span>{bpStats.bpCredit} BP Credit</span>
            </div>

            {/* Total Chassis Capacity */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
              bodyBreakdown.isTotalOverCapacity
                ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                : 'bg-slate-950 border-cyan-900/60 text-cyan-300'
            }`}>
              <span>{bodyBreakdown.totalUsedNodes} / {bodyBreakdown.totalMaxCapacity} Nodes</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: 4-TIER STAGE PROGRESSION TRACKER */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Augmentation Stage Progression</span>
            </span>
            <button
              type="button"
              onClick={() => setIsRulesExpanded(prev => !prev)}
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{isRulesExpanded ? 'Hide Stage Details' : 'View Stage Details & Rules'}</span>
              {isRulesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(AUGMENTATION_STAGES).map(stage => {
              const isActive = stageInfo.stageId === stage.id;
              const isHeavy = stage.id === 'heavy';
              const isExtreme = stage.id === 'extreme';
              const isAugmented = stage.id === 'augmented';

              // Prerequisites evaluation
              let prereqMet = true;
              let prereqLabel = 'None';
              if (isAugmented) {
                prereqMet = campaignTL >= 3;
                prereqLabel = `TL 3+ (Campaign TL: ${campaignTL})`;
              } else if (isHeavy) {
                prereqMet = stageInfo.meetsHeavyPrereq;
                prereqLabel = `Augmented & Stamina 2+ (STA: ${staminaScore})`;
              } else if (isExtreme) {
                prereqMet = stageInfo.meetsExtremePrereq;
                prereqLabel = `Heavy & Stamina 4+ (STA: ${staminaScore})`;
              }

              return (
                <div
                  key={stage.id}
                  className={`rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'bg-slate-950/90 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                        Tier {stage.tier}
                      </span>
                      {isActive && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Active
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-bold leading-tight mb-1 ${
                      isActive ? 'text-amber-300' : 'text-slate-200'
                    }`}>
                      {stage.name}
                    </h4>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/80 text-amber-300 text-[10px] font-mono font-bold">
                        +{stage.bpCredit} BP Credit
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
                      {stage.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-900 mt-auto">
                    {/* Prerequisite Check */}
                    <div className="text-[10px] font-mono flex items-center justify-between gap-1">
                      <span className="text-slate-500">Prereq:</span>
                      <span className={`text-right truncate ${prereqMet ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {prereqLabel}
                      </span>
                    </div>

                    {/* Action Button */}
                    {isActive ? (
                      <div className="w-full py-1 text-center bg-amber-950/60 border border-amber-800/60 rounded text-[11px] font-mono font-bold text-amber-300 cursor-default">
                        Current Stage
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectStage(stage.id)}
                        className="w-full py-1 rounded text-[11px] font-mono font-bold bg-slate-900 hover:bg-amber-950/80 border border-slate-700 hover:border-amber-600 text-slate-300 hover:text-amber-200 transition-all cursor-pointer"
                      >
                        {stage.id === 'negligible' ? 'Set Baseline' : `Acquire ${stage.name}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable Rules Drawer */}
          {isRulesExpanded && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <Info className="w-4 h-4" />
                <span>Active Stage Mechanics: {stageInfo.stage.name}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
                <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Prerequisites</span>
                  <p className="text-slate-300 font-mono text-[11px]">{stageInfo.stage.prerequisites}</p>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Benefit</span>
                  <p className="text-slate-300 text-[11px]">{stageInfo.stage.benefit}</p>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Special &amp; BP Credit</span>
                  <p className="text-slate-300 text-[11px]">{stageInfo.stage.special}</p>
                </div>
              </div>

              {/* Prerequisite Warnings */}
              {stageInfo.prerequisiteWarnings.length > 0 && (
                <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/80 text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <div className="text-[11px]">
                    {stageInfo.prerequisiteWarnings.map((warn, i) => (
                      <span key={i} className="block">{warn}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 3: BUILD POINTS (BP) CREDIT TRACKER BAR */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">Augmentation BP Credit:</span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {bpStats.totalBPSpent} / {bpStats.bpCredit} BP
                </span>
                {bpStats.remainingCredit > 0 && (
                  <span className="text-[11px] font-mono text-emerald-400">
                    ({bpStats.remainingCredit} BP Credit Available)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {bpStats.isOverCredit
                  ? `Exceeded credit allowance by ${bpStats.overflowBP} BP. Overflow must be paid with BP or ${bpStats.overflowCreditsEquivalent.toLocaleString()} Credits.`
                  : `Fully covered by the ${stageInfo.stage.name} initial augmentation credit suite.`}
              </p>
            </div>

            {/* Visual Mini Progress Meter */}
            <div className="w-full sm:w-48 space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    bpStats.isOverCredit ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{
                    width: `${Math.min(100, bpStats.bpCredit > 0 ? (bpStats.totalBPSpent / bpStats.bpCredit) * 100 : (bpStats.totalBPSpent > 0 ? 100 : 0))}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 BP</span>
                <span>{bpStats.bpCredit} BP Free Credit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STAGE PREREQUISITE COMPATIBILITY WARNING BANNER */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {incompatibleAugs.length > 0 && (
        <div className="p-4 bg-rose-950/70 border border-rose-600/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          <div className="flex items-start sm:items-center gap-3 text-rose-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 animate-pulse mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold tracking-wide text-rose-100">
                Stage Prerequisite Warning: {incompatibleAugs.length} installed {incompatibleAugs.length === 1 ? 'augmentation requires' : 'augmentations require'} a higher stage!
              </p>
              <p className="text-[11px] text-rose-300/90 mt-0.5">
                Your operative stage is <strong className="text-white">{stageInfo.stage.name}</strong>. Hardware beyond your stage causes structural rejection or system malfunctions until the prerequisite feature is acquired.
              </p>
            </div>
          </div>
          {stageInfo.stageId !== 'extreme' && (
            <button
              type="button"
              onClick={() => {
                const hasExtreme = incompatibleAugs.some(a => a.stage === 'Extreme');
                const hasHeavy = incompatibleAugs.some(a => a.stage === 'Heavy');
                handleSelectStage(hasExtreme ? 'extreme' : (hasHeavy ? 'heavy' : 'augmented'));
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 border border-rose-500 text-rose-100 text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
            >
              Resolve Stage Feature
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: ANATOMICAL BODY CHART (CAPACITY BREAKDOWN) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/90 border border-cyan-900/50 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-cyan-950/80 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Anatomical Body Chart &amp; Capacity Limits</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hardware node consumption limits per anatomical section. Click any location to filter installed hardware.
            </p>
          </div>

          {activeSlotFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveSlotFilter('all')}
              className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900 transition-colors cursor-pointer"
            >
              &times; Reset Filter (Show All)
            </button>
          )}
        </div>

        {/* Body Slot Cards Schematic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BODY_SLOT_KEYS.map(slotKey => {
            const slotData = bodyBreakdown.slots[slotKey.id] || {
              name: slotKey.label,
              usedNodes: 0,
              maxNodes: slotKey.max,
              remainingNodes: slotKey.max,
              percentage: 0,
              isOverCapacity: false,
              items: []
            };

            const isSelected = activeSlotFilter === slotKey.id;
            const SlotIcon = slotKey.icon;

            return (
              <div
                key={slotKey.id}
                onClick={() => setActiveSlotFilter(prev => prev === slotKey.id ? 'all' : slotKey.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400'
                    : slotData.isOverCapacity
                      ? 'bg-rose-950/40 border-rose-600/80 hover:border-rose-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-cyan-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${
                        isSelected
                          ? 'bg-cyan-900/60 border-cyan-500 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <SlotIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-200">{slotKey.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                        slotData.isOverCapacity
                          ? 'bg-rose-950 border-rose-700 text-rose-300'
                          : slotData.percentage >= 80
                            ? 'bg-amber-950 border-amber-700 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-cyan-300'
                      }`}>
                        {slotData.usedNodes} / {slotData.maxNodes} Nodes
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-300 ${
                        slotData.isOverCapacity
                          ? 'bg-rose-500'
                          : slotData.percentage >= 80
                            ? 'bg-amber-400'
                            : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, slotData.percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                  <span>{slotData.items.length} {slotData.items.length === 1 ? 'Augment' : 'Augments'}</span>
                  {slotData.isOverCapacity ? (
                    <span className="text-rose-400 font-bold">+{slotData.overflowNodes} Over Limit!</span>
                  ) : (
                    <span className="text-slate-500">{slotData.remainingNodes} Nodes Free</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Chassis Capacity Summary Bar */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Body Chassis Load:</span>
            <span className="font-mono font-bold text-cyan-300">
              {bodyBreakdown.totalUsedNodes} / {bodyBreakdown.totalMaxCapacity} Nodes
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              ({bodyBreakdown.totalRemainingNodes} Nodes Remaining)
            </span>
          </div>

          {bodyBreakdown.hasAnyOverCapacity && (
            <div className="flex items-center gap-1.5 text-rose-400 font-mono text-xs font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>One or more anatomical sections exceed node capacity!</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: INSTALLED AUGMENTATIONS LIST & CONTROLS */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/90 border border-amber-900/50 rounded-xl p-5 shadow-xl space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-950 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Installed Augmentations ({filteredAugmentations.length})</span>
            </h3>
            {activeSlotFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-mono">
                Slot: {activeSlotFilter}
              </span>
            )}
            {activeStageFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 text-[11px] font-mono">
                Stage: {activeStageFilter}
              </span>
            )}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search installed..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal('augmentations', 'Augmentations Catalog', 'augmentations')}
                className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer shrink-0"
                title="Browse canonical augmentations catalog"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Augment</span>
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> Stage Filter:
            </span>
            {[
              { id: 'all', label: 'All Stages' },
              { id: 'Negligible', label: 'Negligible' },
              { id: 'Standard', label: 'Standard' },
              { id: 'Heavy', label: 'Heavy' },
              { id: 'Extreme', label: 'Extreme' }
            ].map(stageBtn => {
              const isSelected = activeStageFilter === stageBtn.id;
              return (
                <button
                  key={stageBtn.id}
                  type="button"
                  onClick={() => setActiveStageFilter(stageBtn.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? stageBtn.id === 'Negligible'
                        ? 'bg-slate-800 text-slate-100 border border-slate-600 ring-1 ring-slate-500'
                        : stageBtn.id === 'Standard'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 ring-1 ring-cyan-400'
                        : stageBtn.id === 'Heavy'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500 ring-1 ring-amber-400'
                        : stageBtn.id === 'Extreme'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500 ring-1 ring-rose-400'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500 ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {stageBtn.label}
                </button>
              );
            })}
          </div>

          {(activeSlotFilter !== 'all' || activeStageFilter !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setActiveSlotFilter('all');
                setActiveStageFilter('all');
                setSearchQuery('');
              }}
              className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Augmentations Grid */}
        {filteredAugmentations.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl space-y-2">
            <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              {augmentationsList.length === 0
                ? 'No cybernetic or biological augmentations installed.'
                : 'No augmentations match the current filter or search criteria.'}
            </p>
            {onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal('augmentations', 'Augmentations Catalog', 'augmentations')}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Browse Augmentations Catalog
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAugmentations.map(aug => {
              const name = aug.name || aug.title || 'Augmentation';
              const desc = aug.description || aug.summary || '';
              const nodes = aug.calculatedNodes;
              const bp = aug.calculatedBP;
              const location = aug.resolvedLocation;
              const stage = aug.stage;
              const isCompatible = aug.compatibility?.isCompatible ?? true;

              return (
                <div
                  key={`aug_${aug.sourceIndex}`}
                  className={`bg-slate-950/80 border rounded-xl p-3.5 flex flex-col justify-between transition-all group relative ${
                    !isCompatible
                      ? 'border-rose-700/80 shadow-[0_0_12px_rgba(244,63,94,0.15)] ring-1 ring-rose-600/30'
                      : 'border-amber-900/40 hover:border-amber-700/70'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <FolioTooltip
                        title={name}
                        badge={location}
                        badgeColor="amber"
                        description={desc || 'Prosthetic hardware, neural cyberware, or biological graft.'}
                        cost={`${nodes} Nodes | ${bp} BP | Stage: ${stage}`}
                        tags={['Augmentation', location, stage]}
                        showInfoIcon={true}
                      >
                        <h4 className="font-semibold text-xs text-slate-100 hover:text-amber-300 leading-snug cursor-help pr-1 transition-colors">
                          {name}
                        </h4>
                      </FolioTooltip>

                      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                        {/* Stage Pill */}
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                          stage === 'Extreme'
                            ? 'bg-rose-950/80 border-rose-700/80 text-rose-300'
                            : stage === 'Heavy'
                            ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                            : stage === 'Standard'
                            ? 'bg-cyan-950/80 border-cyan-700/80 text-cyan-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}>
                          {stage}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 rounded">
                          {nodes} N
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 rounded">
                          {bp} BP
                        </span>
                      </div>
                    </div>

                    {/* Stage Incompatibility Alert on Card */}
                    {!isCompatible && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 bg-rose-950/70 border border-rose-800/90 px-2 py-1 rounded my-1.5 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>Requires {aug.compatibility?.requiredFeatureName || stage}</span>
                      </div>
                    )}

                    {/* Location Selector */}
                    <div className="flex items-center gap-1.5 my-2">
                      <span className="text-[10px] text-slate-500 font-mono">Slot:</span>
                      <select
                        value={location}
                        onChange={e => handleUpdateLocation(aug.sourceIndex, e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] font-mono text-amber-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {BODY_SLOT_KEYS.map(slot => (
                          <option key={slot.id} value={slot.id}>{slot.label}</option>
                        ))}
                      </select>
                    </div>

                    {desc && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 mb-2">
                        {desc}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-900 mt-auto">
                    {onOpenAssetModal && (
                      <button
                        type="button"
                        onClick={() => onOpenAssetModal('augmentations', 'Augmentation', 'edit', aug.sourceIndex, aug)}
                        className="text-slate-400 hover:text-amber-300 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Edit augmentation properties"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAugmentation(aug.sourceIndex)}
                      className="text-slate-500 hover:text-rose-400 text-xs p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                      title="Uninstall augmentation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AugmentationsManager);
