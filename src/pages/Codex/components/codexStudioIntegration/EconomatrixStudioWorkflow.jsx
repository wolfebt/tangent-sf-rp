import React, { useState, useMemo } from 'react';
import {
  Coins,
  Hammer,
  Clock,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Users,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Scale
} from 'lucide-react';
import {
  calculateCreditValue,
  calculateMaterialCost,
  calculateCraftingDays,
  calculateAllCraftingTiers,
  formatCraftingDuration,
  calculateLiquidityGap,
  calculateSellPrice,
  getFinancialStatus,
  getComplexityTier,
  calculateStartingWealth,
  calculateCooperativeCrafting
} from '../../../../engines/tangentEconEngine';
import {
  TOOL_TIERS,
  FINANCIAL_STATUS_TABLE,
  TRADE_CODE_DEFINITIONS,
  COMMODITIES_CATALOG
} from '../../../../engines/tangentConstants';
import { CodexTooltip } from '../../../../components/UI/CodexTooltip';
import { AudioService } from '../../../../services/audioService';

/**
 * EconomatrixStudioWorkflow
 * Integrates canonical Domain 7 Economatrix mechanics directly into the Asset Studio:
 * - TSC Valuation & 50% Material Cost breakdown
 * - Requisition & Liquidity Gap evaluation
 * - Fabrication duration with crafter skill margin & 7 tool tiers
 * - Cooperative industrial workforce simulator for structures and mecha
 * - Resale & salvage valuations (Legal 50%, Black Market 70%, Scrap 20%)
 * - Starting Wealth Score & liquidity for character assets
 * - One-click commitment to blueprint formData
 */
export const EconomatrixStudioWorkflow = ({
  matrix,
  formData = {},
  onChange,
  isEditMode = true,
  computedValues = {}
}) => {
  const isCharacterEntity = ['archetypes', 'occupations', 'origins', 'modular-characters'].includes(matrix.id);
  const isWorldOrFaction = ['planetary-design', 'factions'].includes(matrix.id);
  const isHardwareOrProperty = !isCharacterEntity && !isWorldOrFaction;

  // Active sub-tab inside Economatrix Workflow
  const [activeSubTab, setActiveSubTab] = useState(
    isCharacterEntity ? 'wealth' : (isWorldOrFaction ? 'trade' : 'valuation')
  );

  // 1. Valuation & Craft DC
  const effectiveDC = Number(
    formData.craft_dc ?? formData.design_dc ?? formData.dc ?? formData.tier_dc ?? 15
  ) || 0;

  const [simulatedDC, setSimulatedDC] = useState(effectiveDC);
  const currentCreditValue = useMemo(() => calculateCreditValue(simulatedDC), [simulatedDC]);
  const materialCost = useMemo(() => calculateMaterialCost(currentCreditValue), [currentCreditValue]);
  const statusInfo = useMemo(() => getFinancialStatus(simulatedDC), [simulatedDC]);
  const complexity = useMemo(() => getComplexityTier(simulatedDC), [simulatedDC]);

  // 2. Liquidity Gap & Requisition
  const [buyerWS, setBuyerWS] = useState(15);
  const liquidityGap = useMemo(() => {
    return calculateLiquidityGap(simulatedDC, buyerWS);
  }, [simulatedDC, buyerWS]);

  // 3. Fabrication & Tool Tiers
  const [crafterCheck, setCrafterCheck] = useState(20);
  const [selectedToolTier, setSelectedToolTier] = useState('advanced');

  const craftingTierTable = useMemo(() => {
    return calculateAllCraftingTiers(currentCreditValue, crafterCheck);
  }, [currentCreditValue, crafterCheck]);

  const selectedTierData = useMemo(() => {
    const tier = TOOL_TIERS.find(t => t.id === selectedToolTier) || TOOL_TIERS[3];
    const days = calculateCraftingDays(currentCreditValue, crafterCheck, tier.multiplier);
    return {
      tier,
      days,
      formatted: formatCraftingDuration(days)
    };
  }, [currentCreditValue, crafterCheck, selectedToolTier]);

  // 4. Cooperative Industrial Workforce (for structures, mecha, vehicles)
  const [workforceSize, setWorkforceSize] = useState(
    Number(formData.workforce_workers || formData.crew || 25) || 25
  );
  const [workforceAvgCheck, setWorkforceAvgCheck] = useState(
    Number(formData.workforce_skill || 15) || 15
  );
  const [workforceToolTier, setWorkforceToolTier] = useState('industrial');

  const cooperativeResults = useMemo(() => {
    const toolMult = TOOL_TIERS.find(t => t.id === workforceToolTier)?.multiplier || 50;
    return calculateCooperativeCrafting(workforceSize, workforceAvgCheck, toolMult, currentCreditValue);
  }, [currentCreditValue, workforceSize, workforceAvgCheck, workforceToolTier]);

  // 5. Market Sell & Salvage Valuations
  const sellPrices = useMemo(() => {
    return {
      legal: calculateSellPrice(currentCreditValue, 'legal'),
      blackMarket: calculateSellPrice(currentCreditValue, 'blackMarket'),
      scrap: calculateSellPrice(currentCreditValue, 'scrap')
    };
  }, [currentCreditValue]);

  // 6. Character / Starting Wealth calculations
  const [charOccupationWS, setCharOccupationWS] = useState(Number(formData.wealth_score || 10) || 10);
  const [charOriginMod, setCharOriginMod] = useState(0);
  const [charFactionMod, setCharFactionMod] = useState(0);
  const [charTlMod, setCharTlMod] = useState(Number(formData.tl || 2) || 2);
  const [charSkillRanks, setCharSkillRanks] = useState(2);

  const characterWealthResults = useMemo(() => {
    return calculateStartingWealth({
      occupationWS: charOccupationWS,
      originMod: charOriginMod,
      factionMod: charFactionMod,
      tlMod: charTlMod,
      skillRanks: charSkillRanks
    });
  }, [charOccupationWS, charOriginMod, charFactionMod, charTlMod, charSkillRanks]);

  // Commit handlers
  const handleApplyValuation = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    if (!onChange) return;
    onChange('cost', currentCreditValue);
    onChange('craft_dc', simulatedDC);
    onChange('material_cost', materialCost);
    onChange('ws_threshold', simulatedDC);
    onChange('complexity_tier', complexity);
  };

  const handleApplyWorkforce = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    if (!onChange) return;
    onChange('workforce_workers', workforceSize);
    onChange('workforce_skill', workforceAvgCheck);
    onChange('tool_tier', workforceToolTier);
    onChange('construction_days', cooperativeResults.totalDays || cooperativeResults.daysRequired || 0);
  };

  const handleApplyCharacterWealth = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    if (!onChange) return;
    onChange('wealth_score', characterWealthResults.computedWS);
    onChange('starting_credits', calculateCreditValue(characterWealthResults.computedWS));
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans select-none animate-fade-in">
      {/* Economatrix Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-950/80 border border-amber-500/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md">
            <Coins size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                BASTION Domain 7
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs font-mono text-slate-400">Economatrix Adjudication Engine</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold font-mono uppercase text-white mt-0.5">
              {matrix.name} Economic Workflow & Valuation
            </h3>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          {isHardwareOrProperty && (
            <>
              <button
                type="button"
                onClick={() => setActiveSubTab('valuation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  activeSubTab === 'valuation'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                Valuation & TSC
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('crafting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  activeSubTab === 'crafting'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                Fabrication Tiers
              </button>
              {['architecture', 'mecha'].includes(matrix.id) && (
                <button
                  type="button"
                  onClick={() => setActiveSubTab('workforce')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    activeSubTab === 'workforce'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-amber-200'
                  }`}
                >
                  Workforce Fab
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveSubTab('liquidity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  activeSubTab === 'liquidity'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                Liquidity Gap
              </button>
            </>
          )}

          {isCharacterEntity && (
            <button
              type="button"
              onClick={() => setActiveSubTab('wealth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeSubTab === 'wealth'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              Starting Wealth & Stipend
            </button>
          )}

          {isWorldOrFaction && (
            <button
              type="button"
              onClick={() => setActiveSubTab('trade')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeSubTab === 'trade'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              Trade & Commodities
            </button>
          )}
        </div>
      </div>

      {/* ── SUB-TAB 1: VALUATION & TSC ── */}
      {activeSubTab === 'valuation' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                  <TrendingUp size={14} />
                  <span>Tangent Standard Curve (TSC) Valuation</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Canonical formula: <span className="font-mono text-amber-300">V = 10 × 4^(DC / 5)</span>. Base Craft/Design DC determines market worth.
                </p>
              </div>

              {isEditMode && (
                <button
                  type="button"
                  onClick={handleApplyValuation}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  title="Write calculated valuation into asset fields"
                >
                  <Sparkles size={13} />
                  <span>Apply Valuation to Asset</span>
                </button>
              )}
            </div>

            {/* Interactive DC Slider */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Target Crafting / Complexity DC:</span>
                <span className="text-amber-400 font-extrabold text-sm px-2 py-0.5 bg-amber-950/80 rounded border border-amber-500/40">
                  DC {simulatedDC}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={simulatedDC}
                onChange={(e) => setSimulatedDC(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>DC 0 (Flint/Trivial, 10 Cr)</span>
                <span>DC 15 (Standard, 640 Cr)</span>
                <span>DC 30 (Advanced, 40,960 Cr)</span>
                <span>DC 45 (Exotic, 2.6M Cr)</span>
                <span>DC 60 (Singularity, 167M Cr)</span>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">TSC Market Value</span>
                <span className="text-base font-extrabold font-mono text-amber-300">
                  {currentCreditValue.toLocaleString()} <span className="text-[11px] font-normal text-amber-500">Cr</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Wholesale transaction standard</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Material Fabrication (50%)</span>
                <span className="text-base font-extrabold font-mono text-emerald-400">
                  {materialCost.toLocaleString()} <span className="text-[11px] font-normal text-emerald-500">Cr</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Raw alloys & components quota</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Wealth Score (WS) Requisition</span>
                <span className="text-base font-extrabold font-mono text-cyan-300">
                  WS {simulatedDC}
                </span>
                <span className="text-[10px] font-mono text-cyan-500 block mt-0.5">{statusInfo?.name || 'Standard'} Tier</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Complexity Rating</span>
                <span className="text-base font-extrabold font-mono text-purple-300">
                  {complexity}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Workshop certification needed</span>
              </div>
            </div>

            {/* Resale & Fence Valuation Matrix */}
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
                Resale, Fence & Salvage Liquidation Values
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Certified Legal Trade (50%)</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    {sellPrices.legal.toLocaleString()} Cr
                  </div>
                  <div className="text-[10px] text-slate-500">Licensed brokerage exchange</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-purple-900/50">
                  <div className="text-purple-300 text-[11px]">Syndicate Fence (70%)</div>
                  <div className="text-sm font-bold text-purple-200 mt-0.5">
                    {sellPrices.blackMarket.toLocaleString()} Cr
                  </div>
                  <div className="text-[10px] text-purple-400/80">Shadow markets / no questions</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-red-900/50">
                  <div className="text-red-300 text-[11px]">Salvage Scrap (20%)</div>
                  <div className="text-sm font-bold text-red-200 mt-0.5">
                    {sellPrices.scrap.toLocaleString()} Cr
                  </div>
                  <div className="text-[10px] text-red-400/80">Smelter slag & raw scrap</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: FABRICATION & TOOL TIERS ── */}
      {activeSubTab === 'crafting' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
              <Hammer size={14} />
              <span>Fabrication Workbench & Tool Tier Multipliers</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily Production Points (PP) = <span className="font-mono text-amber-300">max(1, (Check - 10) × Tier Multiplier)</span>.
              Crafting Days = <span className="font-mono text-amber-300">Credit Value / Daily PP</span>.
            </p>
          </div>

          {/* Crafter Check Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Crafter Engineering Check:</span>
                <span className="text-amber-400 font-bold px-2 py-0.5 bg-amber-950 rounded border border-amber-500/40">
                  {crafterCheck}
                </span>
              </div>
              <input
                type="range"
                min="11"
                max="40"
                step="1"
                value={crafterCheck}
                onChange={(e) => setCrafterCheck(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[10px] font-mono text-slate-500">
                Check Margin over 10: <span className="text-amber-300">+{crafterCheck - 10}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Active Workshop Tool Tier:
              </label>
              <select
                value={selectedToolTier}
                onChange={(e) => setSelectedToolTier(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {TOOL_TIERS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} (x{t.multiplier} Daily PP) — {t.examples || t.desc}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <span className="text-slate-400">Selected Tier Duration:</span>
                <span className="text-amber-300 font-extrabold">{selectedTierData.formatted} ({selectedTierData.days} days)</span>
              </div>
            </div>
          </div>

          {/* All 7 Tool Tiers Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Tool Tier</th>
                  <th className="p-2.5">Multiplier</th>
                  <th className="p-2.5">Daily PP</th>
                  <th className="p-2.5 text-right">Crafting Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                {craftingTierTable.map(row => {
                  const isSelected = row.id === selectedToolTier;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedToolTier(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-950/40 text-amber-200 font-bold' : 'hover:bg-slate-900/50 text-slate-300'
                      }`}
                    >
                      <td className="p-2.5 flex items-center gap-2">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        <span>{row.name}</span>
                      </td>
                      <td className="p-2.5 text-slate-400">x{row.multiplier}</td>
                      <td className="p-2.5 text-slate-300">{row.dailyPP.toLocaleString()} PP</td>
                      <td className="p-2.5 text-right font-extrabold text-amber-400">{row.formatted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: COOPERATIVE WORKFORCE ── */}
      {activeSubTab === 'workforce' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                <Users size={14} />
                <span>Cooperative Industrial Workforce Simulator</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                For capital starships, orbital installations, and arcologies. Multiplies crew PP by tool efficiency.
              </p>
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={handleApplyWorkforce}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                title="Write workforce specs to blueprint"
              >
                <Sparkles size={13} />
                <span>Apply Workforce Schedule</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Workforce Size (Laborers):
              </label>
              <input
                type="number"
                min="1"
                max="50000"
                value={workforceSize}
                onChange={(e) => setWorkforceSize(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] font-mono text-slate-500">Fabricators, welders, and technicians</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Average Crew Skill Check:
              </label>
              <input
                type="number"
                min="10"
                max="35"
                value={workforceAvgCheck}
                onChange={(e) => setWorkforceAvgCheck(Math.max(10, parseInt(e.target.value) || 10))}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] font-mono text-slate-500">Standard crew is Check 15 (+5 margin)</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Industrial Facility Tooling:
              </label>
              <select
                value={workforceToolTier}
                onChange={(e) => setWorkforceToolTier(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="professional">Professional Berth (x25)</option>
                <option value="advanced">Advanced Drydock (x50)</option>
                <option value="industrial">Heavy Orbital Slipway (x100)</option>
                <option value="nanofabricator">Molecular Nanoforge Array (x250)</option>
              </select>
              <span className="text-[10px] font-mono text-slate-500">Yard tooling multiplier</span>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase block">Daily Collective Production</span>
              <span className="text-lg font-extrabold font-mono text-amber-300">
                {cooperativeResults.combinedDailyPP.toLocaleString()} <span className="text-xs text-amber-500">PP / day</span>
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase block">Calculated Construction Time</span>
              <span className="text-lg font-extrabold font-mono text-emerald-400">
                {formatCraftingDuration(cooperativeResults.totalDays)} <span className="text-xs text-slate-400">({cooperativeResults.totalDays} days)</span>
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase block">Crew Burn Cost / Day</span>
              <span className="text-lg font-extrabold font-mono text-slate-200">
                {(workforceSize * 25).toLocaleString()} <span className="text-xs text-slate-500">Cr/day</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: LIQUIDITY GAP ── */}
      {activeSubTab === 'liquidity' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
              <DollarSign size={14} />
              <span>Requisition & Liquidity Gap Adjudicator</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Determines if a character or faction with Wealth Score (WS) can procure this item outright, lease it, or face a financial shortfall.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold uppercase">Buyer / Operative Wealth Score (WS):</span>
              <span className="text-cyan-300 font-bold px-2 py-0.5 bg-cyan-950 rounded border border-cyan-500/40">
                WS {buyerWS} ({calculateCreditValue(buyerWS).toLocaleString()} Cr Capital)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={buyerWS}
              onChange={(e) => setBuyerWS(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {(() => {
            const isAffordable = liquidityGap.autoBuy || liquidityGap.isAutoBuy || liquidityGap.liquidCost === 0;
            const shortfall = liquidityGap.liquidCost || 0;
            const surplus = Math.max(0, (liquidityGap.playerWSValue || 0) - (liquidityGap.itemValue || 0));
            const leaseCost = Math.round(shortfall * 0.05);

            return (
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isAffordable
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/30 border-red-500/40 text-red-200'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono font-bold text-sm">
                    {isAffordable ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-red-400" />}
                    <span>{isAffordable ? 'Requisition Approved (Affordable)' : 'Financial Liquidity Gap Detected'}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    Item DC {simulatedDC} ({currentCreditValue.toLocaleString()} Cr) vs Buyer WS {buyerWS} ({calculateCreditValue(buyerWS).toLocaleString()} Cr)
                  </p>
                </div>

                <div className="text-right font-mono">
                  {isAffordable ? (
                    <span className="text-xs px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 font-bold">
                      Surplus +{surplus.toLocaleString()} Cr
                    </span>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-xs text-red-300 font-bold">Shortfall: -{shortfall.toLocaleString()} Cr</div>
                      <div className="text-[10px] text-amber-400 font-bold">Syndicate Lease: {leaseCost.toLocaleString()} Cr / month</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── SUB-TAB 5: CHARACTER WEALTH & STIPEND ── */}
      {activeSubTab === 'wealth' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                <Coins size={14} />
                <span>Career Starting Wealth & Capital Calculator</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculates total starting Wealth Score, liquid starting credits, and lifestyle tier for occupations and archetypes.
              </p>
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={handleApplyCharacterWealth}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                title="Write wealth score into character profile"
              >
                <Sparkles size={13} />
                <span>Apply Wealth Score to Persona</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Occupation Base WS</label>
              <input
                type="number"
                min="0"
                max="30"
                value={charOccupationWS}
                onChange={(e) => setCharOccupationWS(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
              />
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Origin Homeworld Mod</label>
              <input
                type="number"
                min="-5"
                max="5"
                value={charOriginMod}
                onChange={(e) => setCharOriginMod(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
              />
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Faction Standing Mod</label>
              <input
                type="number"
                min="-5"
                max="5"
                value={charFactionMod}
                onChange={(e) => setCharFactionMod(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
              />
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Finance/Trade Skill Ranks</label>
              <input
                type="number"
                min="0"
                max="10"
                value={charSkillRanks}
                onChange={(e) => setCharSkillRanks(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-amber-500/40 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Total Starting WS</span>
              <span className="text-xl font-extrabold text-amber-300">WS {characterWealthResults.wealthScore}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Liquid Starting Funds</span>
              <span className="text-xl font-extrabold text-emerald-400">{characterWealthResults.startingCredits.toLocaleString()} Cr</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Lifestyle Standard</span>
              <span className="text-sm font-bold text-cyan-300 mt-1 block">{characterWealthResults.financialStatus?.name || 'Standard'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 6: WORLD TRADE & COMMODITIES ── */}
      {activeSubTab === 'trade' && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>World Trade Classifications & Strategic Commodities</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Tangent trade codes govern planetary commodity production, wholesale buy/sell margins, and freight tariffs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(TRADE_CODE_DEFINITIONS || {}).slice(0, 6).map(([code, def]) => (
              <div key={code} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-amber-400 uppercase">{def.name} ({code})</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Mod {def.marketMod >= 0 ? `+${def.marketMod}` : def.marketMod}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{def.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EconomatrixStudioWorkflow);
