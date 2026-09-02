import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Hammer, 
  Calculator, 
  Ship, 
  DollarSign, 
  BarChart3, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Users, 
  Sparkles, 
  ChevronRight, 
  FileText,
  Sliders,
  RefreshCw,
  Plus
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
  calculateTradeProfit, 
  calculateCooperativeCrafting, 
  calculateWealthGrowthCost 
} from '../../engines/tangentEconEngine';
import { 
  TOOL_TIERS, 
  FINANCIAL_STATUS_TABLE, 
  COMMODITIES_CATALOG, 
  TRADE_CODE_DEFINITIONS,
  UDU_TIERS 
} from '../../engines/tangentConstants';
import { AudioService } from '../../services/audioService';

export const EconomatrixDashboard = ({ onOpenBuilder }) => {
  const [activeTab, setActiveTab] = useState('tsc'); // 'tsc' | 'wealth' | 'purchasing' | 'crafting' | 'workforce' | 'trade' | 'tables'

  // 1. TSC Explorer State
  const [tscDC, setTscDC] = useState(20);

  // 2. Starting Wealth State
  const [occupationWS, setOccupationWS] = useState(10);
  const [originMod, setOriginMod] = useState(0);
  const [factionMod, setFactionMod] = useState(0);
  const [tlMod, setTlMod] = useState(2);
  const [skillRanks, setSkillRanks] = useState(2);

  // 3. Liquidity Gap State
  const [buyerWS, setBuyerWS] = useState(15);
  const [targetItemDC, setTargetItemDC] = useState(22);

  // 4. Fabrication State
  const [craftDC, setCraftDC] = useState(25);
  const [crafterCheck, setCrafterCheck] = useState(20);
  const [selectedToolTier, setSelectedToolTier] = useState('advanced');

  // 5. Cooperative Industrial State
  const [workforceSize, setWorkforceSize] = useState(100);
  const [workforceAvgCheck, setWorkforceAvgCheck] = useState(15);
  const [workforceToolTier, setWorkforceToolTier] = useState('industrial');
  const [projectPreset, setProjectPreset] = useState(2560000); // 2.56M Cr Frigate

  // 6. Trade Simulator State
  const [sourceCode, setSourceCode] = useState('Ag');
  const [destCode, setDestCode] = useState('In');
  const [selectedCommodity, setSelectedCommodity] = useState('foodstuffs');
  const [tradeTons, setTradeTons] = useState(100);
  const [marketRoll, setMarketRoll] = useState(4);

  // 7. Wealth Progression State
  const [currentWS, setCurrentWS] = useState(15);
  const [targetWS, setTargetWS] = useState(20);

  // Calculated values
  const tscValue = useMemo(() => calculateCreditValue(tscDC), [tscDC]);
  const tscMaterialCost = useMemo(() => calculateMaterialCost(tscValue), [tscValue]);
  const tscStatus = useMemo(() => getFinancialStatus(tscDC), [tscDC]);
  const tscComplexity = useMemo(() => getComplexityTier(tscDC), [tscDC]);

  const computedWealth = useMemo(() => {
    return calculateStartingWealth({
      occupationWS,
      originMod,
      factionMod,
      tlMod,
      skillRanks
    });
  }, [occupationWS, originMod, factionMod, tlMod, skillRanks]);

  const liquidityGap = useMemo(() => {
    return calculateLiquidityGap(targetItemDC, buyerWS);
  }, [targetItemDC, buyerWS]);

  const itemSellPrices = useMemo(() => {
    const val = calculateCreditValue(targetItemDC);
    return {
      legal: calculateSellPrice(val, 'legal'),
      blackMarket: calculateSellPrice(val, 'blackMarket'),
      scrap: calculateSellPrice(val, 'scrap')
    };
  }, [targetItemDC]);

  const craftingTime = useMemo(() => {
    const val = calculateCreditValue(craftDC);
    const tierMult = TOOL_TIERS[selectedToolTier]?.multiplier || 50;
    const days = calculateCraftingDays(val, crafterCheck, tierMult);
    return {
      val,
      days,
      humanized: formatCraftingDuration(days),
      allTiers: calculateAllCraftingTiers(val, crafterCheck)
    };
  }, [craftDC, crafterCheck, selectedToolTier]);

  const cooperativePlan = useMemo(() => {
    const tierMult = TOOL_TIERS[workforceToolTier]?.multiplier || 200;
    return calculateCooperativeCrafting(workforceSize, workforceAvgCheck, tierMult, projectPreset);
  }, [workforceSize, workforceAvgCheck, workforceToolTier, projectPreset]);

  const tradeResult = useMemo(() => {
    return calculateTradeProfit({
      commodityId: selectedCommodity,
      sourceTradeCode: sourceCode,
      destTradeCode: destCode,
      tons: tradeTons,
      marketRoll
    });
  }, [selectedCommodity, sourceCode, destCode, tradeTons, marketRoll]);

  const growthCost = useMemo(() => {
    return calculateWealthGrowthCost(currentWS, targetWS);
  }, [currentWS, targetWS]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900/70 to-teal-950/50 border border-emerald-500/40 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <TrendingUp size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Unified Economic Engine
                </span>
                <span className="text-xs font-mono text-slate-400">Value = 10 × 4^(DC/5)</span>
              </div>
              <h1 className="text-xl font-mono font-extrabold text-white uppercase tracking-wider mt-0.5">
                Economatrix Reference & Simulation Suite
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenBuilder}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <Plus size={14} />
              <span>Save Economic Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
        {[
          { id: 'tsc', label: '1. Standard Curve (TSC)', icon: TrendingUp },
          { id: 'wealth', label: '2. Starting Wealth', icon: Coins },
          { id: 'purchasing', label: '3. Liquidity Gap & Fence', icon: DollarSign },
          { id: 'crafting', label: '4. Fabrication & PP', icon: Hammer },
          { id: 'workforce', label: '5. Industrial Workforce', icon: Users },
          { id: 'trade', label: '6. Speculative Trade', icon: Ship },
          { id: 'tables', label: '7. Master Tables', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                setActiveTab(tab.id);
              }}
              className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TANGENT STANDARD CURVE (TSC) */}
      {activeTab === 'tsc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Calculator size={16} /> Crafting Difficulty Class: DC {tscDC}
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                {tscComplexity}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={80}
              step={1}
              value={tscDC}
              onChange={(e) => {
                AudioService.playTerminalBeep(1200, 0.01);
                setTscDC(Number(e.target.value));
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            {/* Metric Displays */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500">Market Credit Value</span>
                <div className="text-xl font-mono font-extrabold text-amber-300 mt-1">
                  {tscValue.toLocaleString()} Cr
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500">Material Cost (50%)</span>
                <div className="text-xl font-mono font-extrabold text-emerald-300 mt-1">
                  {tscMaterialCost.toLocaleString()} Cr
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Required Wealth Score:</span>
                <span className="font-bold text-cyan-300">WS {tscDC} ({tscStatus?.name || 'Standard'})</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Auto-Buy Purchasing Limit:</span>
                <span className="font-bold text-amber-300">{tscStatus?.purchasingLimit || `${tscValue.toLocaleString()} Cr`}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Estimated Societal Net Worth:</span>
                <span className="font-bold text-purple-300">{tscStatus?.netWorth || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Exponential Visual Curve Diagram */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">TSC Logarithmic Cost Curve</span>
              <span className="text-[11px] font-mono text-emerald-400">4x Growth / 5 DC</span>
            </div>

            <div className="relative h-48 w-full flex items-end justify-between gap-1 pt-4">
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((stepDC, idx) => {
                const val = calculateCreditValue(stepDC);
                const heightPercent = Math.min(100, Math.max(8, (Math.log10(val) / 8) * 100));
                const isSelected = Math.abs(tscDC - stepDC) <= 2;

                return (
                  <div key={stepDC} className="flex-1 flex flex-col items-center gap-1 group">
                    <div 
                      className={`w-full rounded-t-md transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-t from-emerald-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                          : 'bg-slate-800 group-hover:bg-slate-700'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                      {stepDC}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] font-mono text-slate-400 italic leading-relaxed">
              The Tangent Standard Curve prevents economic collapse by exponentially separating personal survival equipment from dreadnoughts and megastructures.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: STARTING WEALTH SCORE CALCULATOR */}
      {activeTab === 'wealth' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Coins size={15} /> Character Wealth Determinants
            </h3>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Base Occupation Status</label>
              <select
                value={occupationWS}
                onChange={(e) => setOccupationWS(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:border-emerald-400 focus:outline-none"
              >
                <option value={0}>Indebted / Slave (Base WS 0)</option>
                <option value={5}>Laborer / Drifter (Base WS 5)</option>
                <option value={10}>Technician / Soldier / Pilot (Base WS 10)</option>
                <option value={15}>Corporate Specialist / Merc Captain (Base WS 15)</option>
                <option value={20}>Wealthy Merchant / Guild Officer (Base WS 20)</option>
                <option value={30}>Hegemon / Syndicate Executive (Base WS 30)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Homeworld Origin Mod</label>
                <select
                  value={originMod}
                  onChange={(e) => setOriginMod(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono text-slate-200"
                >
                  <option value={-2}>Impoverished / Outworld (-2)</option>
                  <option value={0}>Standard Colony (0)</option>
                  <option value={2}>Affluent / Garden World (+2)</option>
                  <option value={4}>Core Megacity / Rich (+4)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Faction Patronage Mod</label>
                <select
                  value={factionMod}
                  onChange={(e) => setFactionMod(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono text-slate-200"
                >
                  <option value={-2}>Outlaw / Blacklisted (-2)</option>
                  <option value={0}>Independent / Neutral (0)</option>
                  <option value={2}>Coalition Guild (+2)</option>
                  <option value={4}>Syndicate / Dracon Noble (+4)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Tech Level Mod</label>
                <select
                  value={tlMod}
                  onChange={(e) => setTlMod(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono text-slate-200"
                >
                  <option value={-4}>TL 0 Stone Age (-4)</option>
                  <option value={-2}>TL 1 Metal Age (-2)</option>
                  <option value={0}>TL 2 Data Age (0)</option>
                  <option value={2}>TL 3 Space Age (+2)</option>
                  <option value={4}>TL 4 Stellar Age (+4)</option>
                  <option value={8}>TL 5 Galactic Age (+8)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Appraisal/Commerce Skills</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={skillRanks}
                  onChange={(e) => setSkillRanks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Computed Starting Wealth Block */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between gap-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Effective Starting Wealth</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-mono font-extrabold text-emerald-400">
                  WS {computedWealth.computedWS}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                  {computedWealth.status.name}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Auto-Buy Purchasing Limit:</span>
                <span className="font-bold text-amber-300">{computedWealth.status.purchasingLimit}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Estimated Net Worth:</span>
                <span className="font-bold text-cyan-300">{computedWealth.status.netWorth}</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 italic">
                {computedWealth.status.lifestyle}
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-500">
              The Golden Rule: You may automatically purchase any item with Crafting DC ≤ your Wealth Score without depleting cash.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: LIQUIDITY GAP & FENCING */}
      {activeTab === 'purchasing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <DollarSign size={15} /> The Liquidity Gap Rule
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Buyer Wealth Score</label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={buyerWS}
                  onChange={(e) => setBuyerWS(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Target Item DC</label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={targetItemDC}
                  onChange={(e) => setTargetItemDC(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Total Item Credit Value:</span>
                <span className="font-bold text-amber-300">{liquidityGap.itemValue.toLocaleString()} Cr</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Buyer Auto-Buy Coverage:</span>
                <span className="font-bold text-emerald-300">-{liquidityGap.playerWSValue.toLocaleString()} Cr</span>
              </div>
              <div className="flex justify-between text-sm font-mono pt-2 border-t border-slate-800">
                <span className="text-slate-200 font-bold">Liquid Cash Required:</span>
                <span className="font-extrabold text-rose-400">{liquidityGap.liquidGapCost.toLocaleString()} Cr</span>
              </div>
            </div>
          </div>

          {/* Liquidity Drag / Fence Rates */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck size={15} /> Liquidity Drag & Fence Rates (Selling Items)
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-emerald-300 font-bold">Legal / Direct Sale (50%)</span>
                  <p className="text-[10px] text-slate-500">Matches 50% material fabrication cost (0% infinite profit)</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">{itemSellPrices.legal.toLocaleString()} Cr</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-amber-300 font-bold">Black Market / Stolen (25%)</span>
                  <p className="text-[10px] text-slate-500">Unregistered fencing requiring street contacts</p>
                </div>
                <span className="text-sm font-bold text-amber-400">{itemSellPrices.blackMarket.toLocaleString()} Cr</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-bold">Scrap / Salvage (10%)</span>
                  <p className="text-[10px] text-slate-500">Raw bulk reclaiming and smelter dump</p>
                </div>
                <span className="text-sm font-bold text-slate-300">{itemSellPrices.scrap.toLocaleString()} Cr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FABRICATION & PRODUCTIVITY POINTS */}
      {activeTab === 'crafting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Hammer size={15} /> Fabrication Parameters
            </h3>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Item Crafting DC: {craftDC}</label>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={craftDC}
                onChange={(e) => setCraftDC(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Crafter Skill Check Result: {crafterCheck}</label>
              <input
                type="range"
                min={11}
                max={40}
                step={1}
                value={crafterCheck}
                onChange={(e) => setCrafterCheck(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Workshop Tool Tier</label>
              <select
                value={selectedToolTier}
                onChange={(e) => setSelectedToolTier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              >
                {Object.entries(TOOL_TIERS).map(([k, t]) => (
                  <option key={k} value={k}>{t.name} ({t.multiplier}x Multiplier)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Crafting Tier Matrix Table */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">Fabrication Timeline Across All 7 Tool Tiers</span>
              <span className="text-xs font-mono font-bold text-amber-300">Target: {craftingTime.val.toLocaleString()} PP</span>
            </div>

            <div className="space-y-2">
              {craftingTime.allTiers.map(tier => (
                <div key={tier.tier} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{tier.name} ({tier.multiplier}x)</span>
                    <span className="text-[10px] text-slate-500">{tier.dailyPP} PP/Day</span>
                  </div>
                  <span className="font-bold text-emerald-400">{tier.humanized}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INDUSTRIAL WORKFORCE */}
      {activeTab === 'workforce' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Users size={15} /> Cooperative Labor Pool Settings
            </h3>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Workforce Size (Workers)</label>
              <input
                type="number"
                min={1}
                max={50000}
                value={workforceSize}
                onChange={(e) => setWorkforceSize(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Average Worker Skill Check</label>
              <input
                type="number"
                min={11}
                max={40}
                value={workforceAvgCheck}
                onChange={(e) => setWorkforceAvgCheck(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Tool Tier Multiplier</label>
              <select
                value={workforceToolTier}
                onChange={(e) => setWorkforceToolTier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              >
                {Object.entries(TOOL_TIERS).map(([k, t]) => (
                  <option key={k} value={k}>{t.name} ({t.multiplier}x)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between gap-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Factory / Shipyard Daily Output</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                {cooperativePlan.totalDailyPP.toLocaleString()} PP / Day
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Output Per Worker:</span>
                <span className="font-bold text-cyan-300">{cooperativePlan.perWorkerDailyPP} PP/Day</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Project Duration:</span>
                <span className="font-bold text-amber-300">{cooperativePlan.humanized}</span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-400 italic">
              A major shipyard employing 1,000 workers with Industrial tools (200x) can construct a DC 50 Dreadnought (10.48M Cr) in 10.5 days.
            </p>
          </div>
        </div>
      )}

      {/* TAB 6: SPECULATIVE TRADE */}
      {activeTab === 'trade' && (
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Ship size={15} /> Speculative Interstellar Trade Simulator
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Source World Trade Code</label>
              <select
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              >
                {Object.keys(TRADE_CODE_DEFINITIONS).map(tc => (
                  <option key={tc} value={tc}>[{tc}] {TRADE_CODE_DEFINITIONS[tc].name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Destination World Code</label>
              <select
                value={destCode}
                onChange={(e) => setDestCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              >
                {Object.keys(TRADE_CODE_DEFINITIONS).map(tc => (
                  <option key={tc} value={tc}>[{tc}] {TRADE_CODE_DEFINITIONS[tc].name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Cargo Commodity</label>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              >
                {COMMODITIES_CATALOG.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.baseCostPerTon} Cr/Ton)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Cargo Tonnage (Tons)</label>
              <input
                type="number"
                min={1}
                max={50000}
                value={tradeTons}
                onChange={(e) => setTradeTons(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Trade Simulation Output Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500">Purchase Total:</span>
              <div className="text-base font-bold text-amber-300 mt-0.5">
                {tradeResult.totalBuyCost.toLocaleString()} Cr
              </div>
            </div>
            <div>
              <span className="text-slate-500">Gross Sale Revenue:</span>
              <div className="text-base font-bold text-cyan-300 mt-0.5">
                {tradeResult.totalSellRevenue.toLocaleString()} Cr
              </div>
            </div>
            <div>
              <span className="text-slate-500">Net Trade Profit:</span>
              <div className={`text-base font-extrabold mt-0.5 ${tradeResult.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tradeResult.netProfit.toLocaleString()} Cr
              </div>
            </div>
            <div>
              <span className="text-slate-500">Return on Investment (ROI):</span>
              <div className="text-base font-bold text-purple-300 mt-0.5">
                {tradeResult.profitMargin}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MASTER REFERENCE TABLES */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Table 3.2: Financial Status Hierarchy */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Table 3.2: Financial Status Hierarchy (WS 0 to 80+)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3">WS Range</th>
                    <th className="py-2 px-3">Financial Status</th>
                    <th className="py-2 px-3">CP Cost</th>
                    <th className="py-2 px-3">Purchasing Limit</th>
                    <th className="py-2 px-3">Est. Net Worth</th>
                    <th className="py-2 px-3">Lifestyle Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {FINANCIAL_STATUS_TABLE.map(row => (
                    <tr key={row.name} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-bold text-amber-300">WS {row.minWS}–{row.maxWS === 999 ? '80+' : row.maxWS}</td>
                      <td className="py-2 px-3 font-bold text-slate-200">{row.name}</td>
                      <td className="py-2 px-3 text-cyan-300">{row.bpCost ?? row.cpCost} CP</td>
                      <td className="py-2 px-3 font-bold text-emerald-300">{row.purchasingLimit}</td>
                      <td className="py-2 px-3 text-purple-300">{row.netWorth}</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">{row.lifestyle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 6.3: UDU Hierarchy */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Table 6.3: Universal Displacement Unit (UDU) Scale Hierarchy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              {Object.values(UDU_TIERS).map(tier => (
                <div key={tier.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-300">{tier.name}</span>
                    <span className="text-[10px] text-slate-500">{tier.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{tier.description}</div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                    Max Unit Mass: {tier.maxWeight} • Ratio: 10:1
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EconomatrixDashboard;
