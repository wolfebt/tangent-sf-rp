import React, { useMemo, useState } from 'react';
import { 
  Coins, 
  Hammer, 
  Clock, 
  TrendingUp, 
  Layers, 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  Zap,
  Activity,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Crosshair,
  Globe,
  Sliders,
  Users
} from 'lucide-react';
import { CraftingTimeTable } from './CraftingTimeTable';
import { 
  validateAssetScaling, 
  validateAssetValuation, 
  getScalingCategory,
  calculateFluidCombatModifier,
  scaleDamageDice,
  scaleStructurePoints,
  scaleCarryingCapacity,
  scaleMetaTechInvocation
} from '../../../engines/tangentScalingEngine';
import { calculateTechPenalty, getTechLevelDef } from '../../../engines/tangentTechEngine';
import { calculateLiquidityGap, calculateCreditValue } from '../../../engines/tangentEconEngine';
import { SIZE_CATEGORIES_LIST } from '../../../engines/tangentConstants';
import { CodexTooltip } from '../../../components/UI/CodexTooltip';
import { OmnicortexTooltip, SpeciesBuildCostTooltipCard } from '../../../components/Codex/SpeciesStudioTooltips';
import { evaluateAssetBuildCost } from '../codexBuildCostValidator';
import { getGuidanceForDataset } from '../codexDatasetGuidance';

const ICON_MAP = {
  Coins,
  Hammer,
  Clock,
  TrendingUp,
  Layers,
  Cpu,
  Zap,
  Activity,
  Maximize2,
  Globe,
  Users,
  Sparkles
};

const COMPUTED_METRIC_GUIDANCE = {
  credit_value: {
    title: 'TSC Market Value',
    rule: 'Omnicortex Property Valuation (BASTION Ch. 7.2)',
    formula: 'Base Cost × Scale Factor × Complexity Tier',
    description: 'Derived economic benchmark value. Sets wholesale transaction price and collateral threshold.',
    impact: 'Controls buy/sell prices, black market fences, and salvage valuations.'
  },
  material_cost: {
    title: 'Fabrication Material Cost',
    rule: 'Hardware Fabrication Quota (BASTION Ch. 7.3)',
    formula: 'Credit Value × 0.50 (50% rule)',
    description: 'Raw materials, composite alloys, optical filaments, and nanoforge fuel required to craft this asset.',
    impact: 'Engineers must invest 50% market value in physical components.'
  },
  ws_threshold: {
    title: 'Required Wealth Score',
    rule: 'Requisition & Liquidity Threshold',
    formula: 'Math.ceil(Math.log10(Credit Value) * 1.5)',
    description: 'Minimum personal or faction Wealth Score needed to purchase or sponsor this asset without syndicate financing.',
    impact: 'Characters below this Wealth Score must lease or take syndicate bounties.'
  },
  complexity_tier: {
    title: 'Complexity Tier',
    rule: 'System Architecture Rating (BASTION Ch. 7.1)',
    formula: 'Evaluated by Engineering DC and Tech Level',
    description: 'Engineering complexity category ranging from Simple to Hyper-Advanced Singularity.',
    impact: 'Governs required workshop facilities, tools, and labor crew sizes.'
  },
  crafting_time: {
    title: 'Crafting Duration',
    rule: 'Fabrication Duration Matrix (BASTION Ch. 7.4)',
    formula: 'Credit Value / (Skill Margin × 100 Cr/day)',
    description: 'Active assembly time required in a certified engineering berth or nanofabricator.',
    impact: 'Exceeding the Craft DC by 5+ halves crafting days.'
  }
};

export const ComputedOutputPanel = ({
  computedOutputs = [],
  computedValues = {},
  formData = {},
  matrix = {},
  currentKey = '',
  onFieldChange = null,
  isLoading = false
}) => {
  const resolvedDatasetKey = currentKey || matrix?.targetCollection || matrix?.id || 'equipment';

  const buildCheck = useMemo(
    () => evaluateAssetBuildCost(formData, resolvedDatasetKey, computedValues),
    [formData, resolvedDatasetKey, computedValues]
  );

  const isProperty = Boolean(matrix?.isProperty) && Boolean(buildCheck?.isProperty);

  const guidance = useMemo(
    () => getGuidanceForDataset(resolvedDatasetKey) || getGuidanceForDataset(matrix?.id),
    [resolvedDatasetKey, matrix?.id]
  );

  const [showRulesChecklist, setShowRulesChecklist] = useState(true);

  const isWeapon = matrix?.id === 'weaponry';
  const isInvocation = ['invocation', 'meta-tech'].includes(matrix?.id);
  const isCharacter = ['archetypes', 'occupations', 'origins', 'modular-characters', 'species'].includes(matrix?.id);
  const isWorld = ['planetary-design', 'factions'].includes(matrix?.id);

  const effectiveDC = Number(
    formData.craft_dc ?? formData.design_dc ?? formData.dc ?? formData.tier_dc ?? computedValues.craft_dc ?? 15
  ) || 0;
  
  const enteredCost = formData.cost !== undefined && formData.cost !== null && formData.cost !== '' 
    ? Number(formData.cost) 
    : (computedValues.credit_value ?? computedValues.cost ?? 0);

  const creditValue = computedValues.credit_value ?? computedValues.cost ?? enteredCost ?? 0;
  const assetTL = Number(formData.tl ?? formData.tech_level ?? 3) || 3;
  const sizeVal = formData.size || formData.sizeCategory || formData.footprint || (matrix?.id === 'mecha' ? 'Large' : 'Medium');
  const sizeCat = getScalingCategory(sizeVal);

  // Real-time scaling and valuation diagnostics
  const diagnostics = useMemo(() => {
    const scale = validateAssetScaling({
      ...formData,
      size: sizeVal
    });
    const valuation = validateAssetValuation(enteredCost, effectiveDC);
    return { scale, valuation, sizeVal };
  }, [formData, effectiveDC, enteredCost, sizeVal]);

  // Mini Quick-Adjudicator Dock State
  const [quickToolTab, setQuickToolTab] = useState('liquidity'); // 'liquidity' | 'penalty' | 'matchup'
  const [quickBuyerWS, setQuickBuyerWS] = useState(15);
  const [quickOperatorTL, setQuickOperatorTL] = useState(2);
  const [quickTargetSize, setQuickTargetSize] = useState('Medium');

  const quickLiquidity = useMemo(() => {
    return calculateLiquidityGap(effectiveDC, quickBuyerWS);
  }, [effectiveDC, quickBuyerWS]);

  const quickPenalty = useMemo(() => {
    return calculateTechPenalty(assetTL, quickOperatorTL, isWeapon);
  }, [assetTL, quickOperatorTL, isWeapon]);

  const quickMatchup = useMemo(() => {
    return calculateFluidCombatModifier(sizeVal, quickTargetSize);
  }, [sizeVal, quickTargetSize]);

  const statusColorClasses =
    buildCheck.status === 'valid'
      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
      : buildCheck.status === 'info'
        ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
        : buildCheck.status === 'error'
          ? 'bg-red-950/70 border-red-500/50 text-red-300'
          : 'bg-amber-950/70 border-amber-500/50 text-amber-300';

  return (
    <aside className="w-full lg:w-84 xl:w-96 flex flex-col gap-4 font-mono text-slate-200 shrink-0">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu size={16} className={isLoading ? 'animate-spin' : ''} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Rules Codex</span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[9px] text-slate-400 uppercase">Design Framework</span>
            </div>
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-white truncate">
              Build Cost &amp; Value Checker
            </h4>
          </div>
        </div>

        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold uppercase">
          {isLoading ? 'Computing...' : 'Live Audit'}
        </span>
      </div>

      {/* ── Universal Build Cost & Value Verification Card ── */}
      <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <OmnicortexTooltip content={<SpeciesBuildCostTooltipCard buildCheck={buildCheck} />}>
          <div className="flex items-center justify-between gap-2 cursor-help rounded-lg p-1 -m-1 hover:bg-slate-900/60 transition-colors">
            <div>
              <span className="text-[9.5px] uppercase tracking-wider text-slate-400 block">
                Active Build Valuation
              </span>
              <div className="text-base font-extrabold text-amber-300 tracking-tight">
                {buildCheck.primaryCostLabel}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {buildCheck.secondaryLabel}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${statusColorClasses}`}>
              {buildCheck.statusLabel}
            </span>
          </div>
        </OmnicortexTooltip>

        {/* Formula Banner */}
        <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-cyan-300 leading-relaxed">
          <span className="text-slate-500 font-bold uppercase block text-[8.5px] mb-0.5">
            Canonical Build Cost Formula
          </span>
          {buildCheck.formulaSummary}
        </div>

        {/* Itemized Build Cost Breakdown */}
        {Array.isArray(buildCheck.breakdown) && buildCheck.breakdown.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Component Breakdown</span>
              <span>Cost / Target</span>
            </div>
            <div className="divide-y divide-slate-800/70 border border-slate-800/90 rounded-xl bg-slate-900/50 overflow-hidden">
              {buildCheck.breakdown.map((row, idx) => {
                const isUnaccounted = Boolean(row.unaccounted || row.status === 'warning');
                return (
                  <div
                    key={idx}
                    className={`p-2 text-[10.5px] flex flex-col gap-0.5 ${
                      isUnaccounted
                        ? 'bg-amber-950/60 border-l-2 border-amber-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold truncate ${isUnaccounted ? 'text-amber-200' : 'text-slate-200'}`}>
                        {row.label}
                      </span>
                      <span className={`font-bold shrink-0 ${
                        row.status === 'error'
                          ? 'text-red-400'
                          : isUnaccounted
                            ? 'text-amber-300'
                            : 'text-emerald-300'
                      }`}>
                        {row.value}
                      </span>
                    </div>
                    {row.note && (
                      <div className={`flex items-start justify-between gap-2 text-[9.5px] font-sans ${
                        isUnaccounted ? 'text-amber-200/80' : 'text-slate-400'
                      }`}>
                        <span className="break-words leading-snug">{row.note}</span>
                        {row.target && (
                          <span className={`font-mono shrink-0 ${isUnaccounted ? 'text-amber-400/80' : 'text-slate-500'}`}>
                            {row.target}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 1-Click Sync to Canonical Build Cost Button */}
        {buildCheck.syncPatch && typeof onFieldChange === 'function' && (
          <button
            type="button"
            onClick={() => {
              onFieldChange(buildCheck.syncPatch.field, buildCheck.syncPatch.value);
              if (buildCheck.syncPatch.secondaryField) {
                onFieldChange(buildCheck.syncPatch.secondaryField, buildCheck.syncPatch.secondaryValue);
              }
              if (buildCheck.syncPatch.extraPatch && typeof buildCheck.syncPatch.extraPatch === 'object') {
                Object.entries(buildCheck.syncPatch.extraPatch).forEach(([k, v]) => {
                  onFieldChange(k, v);
                });
              }
            }}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-200 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Zap size={12} className="text-amber-400" />
            <span>{buildCheck.syncPatch.label}</span>
          </button>
        )}
      </div>

      {/* ── Rules Codex Design Framework Checklist & Canonical Rules ── */}
      {guidance && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
          <button
            type="button"
            onClick={() => setShowRulesChecklist(prev => !prev)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400 shrink-0" />
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-200">
                {guidance.title} Rules
              </span>
            </div>
            <span className="text-[9.5px] text-cyan-400 font-bold uppercase">
              {showRulesChecklist ? 'Hide' : 'Show'}
            </span>
          </button>

          {showRulesChecklist && (
            <div className="space-y-2 pt-1.5 border-t border-slate-800/80 text-[10.5px] font-sans">
              <p className="text-slate-300 leading-relaxed">
                {guidance.overview}
              </p>
              {Array.isArray(guidance.canonicalRules) && guidance.canonicalRules.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {guidance.canonicalRules.map((rule, rIdx) => (
                    <div key={rule.id || rule.code || rIdx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between font-mono text-[9.5px] mb-0.5">
                        <span className="text-amber-400 font-bold">{rule.title || rule.label}</span>
                        <span className="text-slate-500">{rule.id || rule.code}</span>
                      </div>
                      <p className="text-slate-400 text-[10px] leading-snug">{rule.summary || rule.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Computed Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {computedOutputs.map((output) => {
          if (output.format === 'time_table') {
            return null;
          }
          if (
            !isProperty &&
            (output.format === 'credits' ||
              ['credit_value', 'material_cost', 'ws_threshold', 'crafting_time', 'cost'].includes(output.id))
          ) {
            return null;
          }

          const rawVal = computedValues[output.id];
          const Icon = ICON_MAP[output.icon] || Cpu;
          const displayColor = output.color || '#38bdf8';

          return (
            <div
              key={output.id}
              className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${displayColor}15`, border: `1px solid ${displayColor}40`, color: displayColor }}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-tight truncate">
                      {output.label}
                    </span>
                    {COMPUTED_METRIC_GUIDANCE[output.id] && (
                      <CodexTooltip
                        title={COMPUTED_METRIC_GUIDANCE[output.id].title}
                        rule={COMPUTED_METRIC_GUIDANCE[output.id].rule}
                        formula={COMPUTED_METRIC_GUIDANCE[output.id].formula}
                        description={COMPUTED_METRIC_GUIDANCE[output.id].description}
                        impact={COMPUTED_METRIC_GUIDANCE[output.id].impact}
                        color={displayColor}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {output.format === 'credits' ? (
                      <span className="text-sm font-extrabold text-amber-300 font-mono tracking-tight">
                        {typeof rawVal === 'number' ? rawVal.toLocaleString() : (rawVal || '0')} <span className="text-[10px] text-amber-500 font-normal">Cr</span>
                      </span>
                    ) : output.format === 'status_badge' ? (
                      <span className="text-xs font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40">
                        {rawVal?.name || rawVal || 'Standard'}
                      </span>
                    ) : output.format === 'badge' ? (
                      <span className="text-xs font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40">
                        {rawVal || 'Standard'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-100">
                        {typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal ?? '—')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embodied Entity Physical Scale Profile (Species, Modular Characters, Companions & Size Tiers Only) */}
      {!isProperty && ['species', 'modular-characters', 'modular_characters', 'companions', 'species_size', 'scaling'].includes(String(matrix?.id || '').toLowerCase()) && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-md text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Maximize2 size={13} />
              <span>{matrix?.name} Physical Scale Profile</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
              {sizeCat.name} ({sizeCat.scaleDisplay})
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block">STR Mod</span>
              <span className="text-amber-400 font-bold">{sizeCat.strMod >= 0 ? `+${sizeCat.strMod}` : sizeCat.strMod}</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block">Combat Mod</span>
              <span className="text-blue-400 font-bold">{sizeCat.combatMod >= 0 ? `+${sizeCat.combatMod}` : sizeCat.combatMod}</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block">Reach</span>
              <span className="text-slate-300 font-bold">{sizeCat.reach}</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Scaling & Valuation Diagnostics Card (Property Items Only) */}
      {isProperty && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5">
              <Maximize2 size={13} className="text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                Scale & Valuation Checker
              </span>
              <CodexTooltip
                title="Tangent Scale & Valuation Diagnostics"
                rule="Scale & Valuation Matrix (BASTION Ch. 7.2)"
                formula="Footprint Category vs Standard Medium Humanoid"
                description="Verifies that physical scale dimensions, STR modifiers, and reach match canonical Tangent rules."
                impact="Ensures heavy industrial frames and colossal structures balance physical damage capacity."
                color="#f59e0b"
              />
            </div>
            <span className="text-[10px] text-cyan-300 font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30">
              {diagnostics.scale.scaleCategory} ({diagnostics.scale.scaleDisplay})
            </span>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 text-center">
              <span className="text-slate-500 block">STR Mod</span>
              <span className="text-amber-400 font-bold">
                {diagnostics.scale.strMod >= 0 ? `+${diagnostics.scale.strMod}` : diagnostics.scale.strMod}
              </span>
            </div>
            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 text-center">
              <span className="text-slate-500 block">Combat Mod</span>
              <span className="text-blue-400 font-bold">
                {diagnostics.scale.combatMod >= 0 ? `+${diagnostics.scale.combatMod}` : diagnostics.scale.combatMod}
              </span>
            </div>
            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 text-center">
              <span className="text-slate-500 block">Reach</span>
              <span className="text-slate-300 font-bold">{diagnostics.scale.reach}</span>
            </div>
          </div>

          {/* Valuation badge */}
          <div 
            className="p-2 rounded-lg border text-[11px] font-bold flex items-center justify-between"
            style={{ 
              borderColor: diagnostics.valuation.color, 
              background: `${diagnostics.valuation.color}15`,
              color: diagnostics.valuation.color 
            }}
          >
            <span className="truncate">{diagnostics.valuation.status}</span>
            <span className="text-[10px] opacity-80 shrink-0">
              {diagnostics.valuation.ratio}x TSC
            </span>
          </div>

          {/* Warnings if any */}
          {diagnostics.scale.warnings.length > 0 && (
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[10px] space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <AlertTriangle size={11} />
                <span>Scaling Rule Notice</span>
              </div>
              {diagnostics.scale.warnings.map((w, idx) => (
                <div key={idx} className="text-amber-200/90">{w}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Interactive Codex Quick-Adjudicator Dock (Property Items Only) ── */}
      {isProperty && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-200">
              <Sliders size={13} className="text-cyan-400" />
              <span>Codex Quick-Adjudicator</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuickToolTab('liquidity')}
                className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-colors ${
                  quickToolTab === 'liquidity' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Liquidity
              </button>
              <button
                type="button"
                onClick={() => setQuickToolTab('penalty')}
                className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-colors ${
                  quickToolTab === 'penalty' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tech Pen
              </button>
              <button
                type="button"
                onClick={() => setQuickToolTab('matchup')}
                className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-colors ${
                  quickToolTab === 'matchup' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Matchup
              </button>
            </div>
          </div>

          {/* Quick Tool 1: Liquidity Gap */}
          {quickToolTab === 'liquidity' && (() => {
            const isAffordable = Boolean(quickLiquidity?.canAfford ?? (quickLiquidity?.autoBuy || (quickLiquidity?.liquidCost ?? 0) === 0));
            const margin = Number(quickLiquidity?.marginCredits ?? Math.max(0, (quickLiquidity?.playerWSValue ?? 0) - (quickLiquidity?.itemValue ?? 0))) || 0;
            const shortfall = Number(quickLiquidity?.shortfallCredits ?? quickLiquidity?.liquidCost ?? 0) || 0;
            const buyerCapital = Number(calculateCreditValue(quickBuyerWS)) || 0;

            return (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Buyer WS:</span>
                  <span className="text-amber-400 font-bold">WS {quickBuyerWS} ({buyerCapital.toLocaleString()} Cr)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={quickBuyerWS}
                  onChange={(e) => setQuickBuyerWS(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className={`p-2 rounded text-[11px] font-bold flex items-center justify-between ${
                  isAffordable
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border border-red-500/40 text-red-300'
                }`}>
                  <span>{isAffordable ? 'Affordable' : 'Liquidity Shortfall'}</span>
                  <span>{isAffordable ? `+${margin.toLocaleString()} Cr` : `-${shortfall.toLocaleString()} Cr`}</span>
                </div>
              </div>
            );
          })()}

          {/* Quick Tool 2: Operator Tech Penalty */}
          {quickToolTab === 'penalty' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Operator Native TL:</span>
                <span className="text-blue-400 font-bold">TL {quickOperatorTL} (Asset: TL {assetTL})</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={quickOperatorTL}
                onChange={(e) => setQuickOperatorTL(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className={`p-2 rounded text-[11px] font-bold flex items-center justify-between ${
                quickPenalty === 0
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
              }`}>
                <span>{quickPenalty === 0 ? 'Full Compatibility' : 'Operating Check Penalty'}</span>
                <span>{quickPenalty === 0 ? '+0' : `${quickPenalty}`}</span>
              </div>
            </div>
          )}

          {/* Quick Tool 3: Fluid Combat Matchup */}
          {quickToolTab === 'matchup' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Opponent Size:</span>
                <select
                  value={quickTargetSize}
                  onChange={(e) => setQuickTargetSize(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                >
                  {SIZE_CATEGORIES_LIST.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] flex items-center justify-between">
                <span className="text-slate-300">Opposed Attack Roll:</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">
                  {quickMatchup.modifier >= 0 ? `+${quickMatchup.modifier}` : quickMatchup.modifier}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Embedded Crafting Time Table Widget (Property Items Only) */}
      {isProperty && (
        <CraftingTimeTable creditValue={creditValue} defaultSkillCheck={20} />
      )}
    </aside>
  );
};

export default React.memo(ComputedOutputPanel);
