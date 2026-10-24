import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  X, 
  Sliders, 
  Shield, 
  Info, 
  Cpu, 
  Dna, 
  Sparkles, 
  Activity 
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

/**
 * Standard summary chip string formatting helper for traits/features/flaws.
 */
const defaultFormatSummaryChip = (item) => {
  if (!item) return '';
  if (typeof item === 'object') {
    const base = item.name || item.title || item.label || item.id || '';
    const choice = item.choiceLabel || (Array.isArray(item.choice) ? item.choice.join(', ') : item.choice);
    const cleanBase = String(base)
      .replace(/^(trait|feature|ability|species_movement|movement|disadvantage|flaw)[-_]/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return choice ? `${cleanBase} (${choice})` : cleanBase;
  }
  return String(item)
    .replace(/^(trait|feature|ability|species_movement|movement|disadvantage|flaw)[-_]/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * CodexMechanicsModal
 * Canonical Rulebook Mechanics & Live Asset Configuration Display Modal.
 * Replaces the previous inline expandable drawer with a focused high-tech dialog.
 */
export const CodexMechanicsModal = ({
  isOpen,
  onClose,
  guidance,
  matrix,
  isSpeciesStudio = false,
  speciesSummary = null,
  formData = {},
  formatSummaryChip = defaultFormatSummaryChip
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        AudioService.playTerminalBeep(800, 0.02);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter out internal budget balancing calculation sections if present
  const visibleSections = useMemo(() => {
    return (guidance?.sections || []).filter(sec => sec.id !== 'budget_balance');
  }, [guidance]);

  if (!isOpen || !guidance) return null;

  const chipFormatter = formatSummaryChip || defaultFormatSummaryChip;

  // Derive species live configuration arrays if in Species Studio
  const attrEntries = isSpeciesStudio && speciesSummary
    ? Object.entries(speciesSummary.attributes || {}).filter(([_, val]) => Number(val) !== 0)
    : [];
  const extraMovements = isSpeciesStudio && speciesSummary
    ? (speciesSummary.bpData?.itemized?.movement || []).filter(m => m && m.id !== 'normal' && m.id !== 'bipedal')
    : [];
  const specificSkills = isSpeciesStudio && speciesSummary
    ? (Array.isArray(formData.specific_skill_bonuses) ? formData.specific_skill_bonuses : [])
    : [];
  const traitsList = isSpeciesStudio && speciesSummary
    ? (speciesSummary.bpData?.itemized?.traits?.length > 0
      ? speciesSummary.bpData.itemized.traits
      : (speciesSummary.selectedTraits || []).map(tr => ({ name: chipFormatter(tr), bp: 1 })))
    : [];
  const featuresList = isSpeciesStudio && speciesSummary
    ? (speciesSummary.bpData?.itemized?.features?.length > 0
      ? speciesSummary.bpData.itemized.features
      : (speciesSummary.cleanedInherentFeatures || []).map(feat => ({ name: chipFormatter(feat), bp: 3 })))
    : [];
  const recFeaturesList = isSpeciesStudio && speciesSummary
    ? (Array.isArray(formData.recommended_features) && formData.recommended_features.length > 0
      ? formData.recommended_features
      : (speciesSummary.cleanedRecommendedFeatures || []))
    : [];
  const flawsList = isSpeciesStudio && speciesSummary
    ? (speciesSummary.bpData?.itemized?.disadvantages?.length > 0
      ? speciesSummary.bpData.itemized.disadvantages
      : (speciesSummary.selectedDisadvantages || []).map(flaw => ({ name: chipFormatter(flaw), refundBP: 2 })))
    : [];
  const skillPoolPoints = isSpeciesStudio && speciesSummary
    ? (speciesSummary.bpData?.itemized?.skills?.points ?? (speciesSummary.skillBundles * 5))
    : 0;
  const skillPoolCP = isSpeciesStudio && speciesSummary
    ? (speciesSummary.bpData?.breakdown?.skillsBP ?? (speciesSummary.skillBundles * 5))
    : 0;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none font-sans"
      onClick={() => {
        AudioService.playTerminalBeep(800, 0.02);
        onClose();
      }}
    >
      <div 
        className="relative w-full max-w-5xl bg-[#090d16] border-2 border-cyan-400/80 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.35)] flex flex-col max-h-[88vh] overflow-hidden animate-fade-in text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 border"
              style={{ 
                background: `${matrix?.color || '#06b6d4'}20`, 
                borderColor: `${matrix?.color || '#06b6d4'}60`, 
                color: matrix?.color || '#06b6d4' 
              }}
            >
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders size={12} /> CANONICAL MECHANICS
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-mono text-amber-400 uppercase truncate">
                  {matrix?.name || 'OMNICORTEX'}
                </span>
              </div>
              <h2 className="font-bold text-base sm:text-lg font-mono text-white truncate">
                {guidance.title} — Mechanics &amp; Canonical Reference
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden sm:inline-block text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider font-semibold">
              BASTION v2.4
            </span>
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(800, 0.02);
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Mechanics Modal (Esc)"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Modal Body ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-xs custom-scrollbar">
          
          {/* Overview & System Philosophy Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
                <Info size={14} className="text-cyan-400" />
                <span>Overview &amp; System Directives</span>
              </div>
              {guidance.category && (
                <span className="text-[10px] font-mono text-slate-400 uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {guidance.category}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {guidance.overview}
            </p>
          </div>

          {/* Canonical Rules Badges (if present) */}
          {Array.isArray(guidance.canonicalRules) && guidance.canonicalRules.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Shield size={13} className="text-amber-400" />
                <span>Governing Canonical Rules</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {guidance.canonicalRules.map(rule => (
                  <div key={rule.id} className="p-3 bg-slate-900/80 border border-slate-800/90 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-amber-400 font-mono tracking-wider">{rule.id}</span>
                      <span className="text-slate-300 font-sans truncate ml-2">{rule.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {rule.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Species Live Configuration Summary (when in Species Studio) */}
          {isSpeciesStudio && speciesSummary && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-3 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Dna size={15} className="text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
                    Species Package Summary — Chassis, Biology, Traits, Pools &amp; Flaws
                  </span>
                </div>
                <span className="px-3 py-1 rounded-lg bg-purple-950 border border-purple-400/80 text-purple-200 font-mono font-bold text-xs shadow-sm">
                  Package Cost: {speciesSummary.bpData?.totalBPUsed ?? 0} CP
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Unified overview of the active species chassis type, physical scale, locomotion modes, inherent attribute modifiers, attribute/skill/feature pools, biological traits (1, 2 &amp; 4 CP), granted features, and flaw/stigma refunds.
              </p>

              <div className="pt-2 border-t border-slate-800/90 flex flex-wrap items-center gap-1.5 text-[10px]">
                {/* Chassis Type */}
                <span className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/40 text-sky-300 font-bold">
                  Chassis: {speciesSummary.selectedType} ({speciesSummary.bpData?.breakdown?.typeBP ?? 0} CP)
                </span>

                {/* Size */}
                <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold">
                  Size: {speciesSummary.selectedSize} ({(speciesSummary.bpData?.breakdown?.sizeBP ?? 0) >= 0 ? `+${speciesSummary.bpData?.breakdown?.sizeBP ?? 0}` : speciesSummary.bpData?.breakdown?.sizeBP} CP)
                </span>

                {/* Base Speed & Locomotion Modes */}
                <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 font-bold">
                  Speed: {speciesSummary.bpData?.speedsFormatted || 'Ground 30 ft'} ({(speciesSummary.bpData?.breakdown?.movementBP ?? 0) >= 0 ? `+${speciesSummary.bpData?.breakdown?.movementBP ?? 0}` : speciesSummary.bpData?.breakdown?.movementBP} CP)
                </span>
                {extraMovements.map((m, mIdx) => (
                  <span
                    key={`mov-${mIdx}`}
                    className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-200"
                  >
                    Move: {m.name} <span className="text-amber-400 font-bold">({m.bp >= 0 ? `+${m.bp}` : m.bp} CP)</span>
                  </span>
                ))}

                {/* Inherent Attribute Modifiers */}
                {attrEntries.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                    Attrs: {attrEntries.map(([k, v]) => `${k.toUpperCase()} ${Number(v) >= 0 ? `+${v}` : v}`).join(', ')} ({(speciesSummary.bpData?.breakdown?.fixedAttributeBP ?? 0) >= 0 ? `+${speciesSummary.bpData?.breakdown?.fixedAttributeBP ?? 0}` : speciesSummary.bpData?.breakdown?.fixedAttributeBP} CP)
                  </span>
                )}

                {/* Flexible Attribute Pool */}
                {speciesSummary.bonusAttributePoints > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                    Attr Pool: +{speciesSummary.bonusAttributePoints} AP (+{speciesSummary.bonusAttributePoints * 5} CP)
                  </span>
                )}

                {/* Skill Pool & Specific Skill Bonuses */}
                {skillPoolPoints > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                    Skill Pool: +{skillPoolPoints} SP (+{skillPoolCP} CP)
                  </span>
                )}
                {specificSkills.map((sk, sIdx) => {
                  const skName = chipFormatter(sk.skill_id || sk.skill || sk.name || sk);
                  const skBonus = Number(sk.bonus ?? sk.value ?? 2);
                  return (
                    <span
                      key={`sk-${sIdx}`}
                      className="px-2 py-0.5 rounded bg-teal-950/70 border border-teal-500/40 text-teal-200"
                    >
                      Skill: {skName} {skBonus >= 0 ? `+${skBonus}` : skBonus}
                    </span>
                  );
                })}

                {/* Species Traits (1, 2, or 4 CP) */}
                {traitsList.map((tr, tIdx) => (
                  <span
                    key={`tr-${tIdx}`}
                    className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/40 text-purple-200"
                  >
                    Trait: {tr.name} <span className="text-purple-400 font-bold">({tr.bp >= 0 ? `+${tr.bp}` : tr.bp} CP)</span>
                  </span>
                ))}

                {/* Inherent Features, Feature Pool & Recommended Features */}
                {featuresList.map((feat, fIdx) => (
                  <span
                    key={`ft-${fIdx}`}
                    className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-200"
                  >
                    Feature: {feat.name} <span className="text-indigo-400 font-bold">(+{feat.bp ?? 3} CP)</span>
                  </span>
                ))}
                {speciesSummary.bonusFeatures > 0 && (
                  <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 font-bold">
                    Feature Pool: +{speciesSummary.bonusFeatures} Feat{speciesSummary.bonusFeatures > 1 ? 's' : ''} (+{speciesSummary.bonusFeatures * 3} CP)
                  </span>
                )}
                {recFeaturesList.map((rf, rfIdx) => (
                  <span
                    key={`rf-${rfIdx}`}
                    className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300"
                  >
                    Rec. Feat: {chipFormatter(rf)} <span className="text-slate-400">(0 CP)</span>
                  </span>
                ))}

                {/* Disadvantages / Flaws & Social Stigma (Refunds) */}
                {flawsList.map((flaw, dIdx) => (
                  <span
                    key={`flaw-${dIdx}`}
                    className="px-2 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-red-200"
                  >
                    Flaw: {flaw.name} <span className="text-red-400 font-bold">(-{flaw.refundBP ?? 2} CP)</span>
                  </span>
                ))}
                {speciesSummary.selectedStigma && speciesSummary.selectedStigma !== 'None' && (
                  <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/40 text-rose-200">
                    Stigma: {speciesSummary.selectedStigma} <span className="text-rose-400 font-bold">(-{speciesSummary.bpData?.breakdown?.stigmaRefund ?? 0} CP)</span>
                  </span>
                )}

                {/* Total Species Package Cost */}
                <span className="px-2.5 py-0.5 rounded bg-purple-950/90 border border-purple-400/60 text-purple-200 font-bold ml-auto shadow-sm">
                  Package Cost: {speciesSummary.bpData?.totalBPUsed ?? 0} CP
                </span>
              </div>
            </div>
          )}

          {/* Section Mechanics & Parameters Grid */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu size={13} className="text-cyan-400" />
              <span>Section Specifications &amp; Parameters</span>
            </div>

            <div className={`grid grid-cols-1 ${visibleSections.length === 1 ? '' : visibleSections.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-3`}>
              {visibleSections.map((sec, idx) => {
                // If this is the species chassis block and we already displayed it above, render a concise reference
                if (isSpeciesStudio && speciesSummary && sec.id === 'chassis_type') {
                  return (
                    <div key={sec.id || idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="text-amber-400 font-bold text-xs">{sec.name || sec.title}</div>
                        <div className="text-slate-400 text-[11px] leading-relaxed font-sans">{sec.description || sec.guidance}</div>
                      </div>
                      {Array.isArray(sec.tips) && sec.tips.length > 0 && (
                        <div className="space-y-1 pt-1.5 border-t border-slate-800/80">
                          {sec.tips.map((tip, tIdx) => (
                            <div key={tIdx} className="text-[10.5px] text-slate-400 flex items-start gap-1.5 font-sans leading-snug">
                              <span className="text-cyan-400 shrink-0 mt-0.5">›</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={sec.id || idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="text-amber-400 font-bold text-xs">{sec.name || sec.title}</div>
                      <div className="text-slate-400 text-[11px] leading-relaxed font-sans">{sec.description || sec.guidance}</div>
                    </div>

                    {sec.formula && (
                      <div className="p-2 rounded-lg bg-black/50 border border-slate-800 text-[10px] text-cyan-300 font-mono">
                        <span className="text-slate-500 uppercase mr-1">Formula:</span> {sec.formula}
                      </div>
                    )}

                    {Array.isArray(sec.tips) && sec.tips.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-slate-800/80">
                        {sec.tips.map((tip, tIdx) => (
                          <div key={tIdx} className="text-[10.5px] text-slate-400 flex items-start gap-1.5 font-sans leading-snug">
                            <span className="text-cyan-400 shrink-0 mt-0.5">›</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">ESC</kbd> or click outside to dismiss</span>
          </div>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(800, 0.02);
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold uppercase transition-all cursor-pointer border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default React.memo(CodexMechanicsModal);
