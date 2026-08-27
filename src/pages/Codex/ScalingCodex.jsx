import React, { useState, useMemo } from 'react';
import { 
  Maximize2, 
  Shield, 
  Zap, 
  Crosshair, 
  Flame, 
  Scale, 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Sliders, 
  Calculator, 
  Sparkles, 
  Layers, 
  Bot, 
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Cpu,
  Coins
} from 'lucide-react';
import { 
  SIZE_CATEGORIES, 
  SIZE_CATEGORIES_LIST, 
  DIE_STEP_LADDER 
} from '../../engines/tangentConstants';
import { 
  getScalingCategory, 
  stepDieSide, 
  scaleDamageDice, 
  calculateFluidCombatModifier, 
  calculateProximityDamage, 
  scaleMetaTechInvocation, 
  scaleMovementSpeed, 
  scaleRange, 
  scaleStructurePoints, 
  scaleCarryingCapacity, 
  validateAssetScaling, 
  validateAssetValuation 
} from '../../engines/tangentScalingEngine';
import { AudioService } from '../../services/audioService';

export const ScalingCodex = ({ onOpenBuilder }) => {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'combat' | 'metatech' | 'starship' | 'checker'
  const [selectedSizeKey, setSelectedSizeKey] = useState('Huge');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'submedium' | 'tactical' | 'starship'
  const [searchQuery, setSearchQuery] = useState('');

  // Fluid Combat Matchup Simulator state
  const [attackerSize, setAttackerSize] = useState('Large');
  const [defenderSize, setDefenderSize] = useState('Small');

  // Meta-Tech Invocation scaling state
  const [invocationName, setInvocationName] = useState('Thermal Fireball');
  const [baseDamage, setBaseDamage] = useState('5d6');
  const [baseRange, setBaseRange] = useState(100);
  const [baseArea, setBaseArea] = useState(20);
  const [baseDC, setBaseDC] = useState(15);
  const [hostChassisSize, setHostChassisSize] = useState('Huge');

  // Starship proximity state
  const [starshipSize, setStarshipSize] = useState('Titanic');
  const [starshipDamage, setStarshipDamage] = useState('80d10');

  // Asset validation inspector state
  const [testAssetName, setTestAssetName] = useState('Titan-Class Siege Mech');
  const [testAssetSize, setTestAssetSize] = useState('Huge');
  const [testAssetDC, setTestAssetDC] = useState(30);
  const [testAssetCost, setTestAssetCost] = useState(40960);
  const [testAssetSP, setTestAssetSP] = useState(250);
  const [testAssetStealth, setTestAssetStealth] = useState(-8);
  const [testAssetDamage, setTestAssetDamage] = useState('5d10');

  const activeCategory = useMemo(() => getScalingCategory(selectedSizeKey), [selectedSizeKey]);

  // Filter size categories
  const filteredSizes = useMemo(() => {
    return SIZE_CATEGORIES_LIST.filter(size => {
      if (filterType === 'submedium' && (size.scaleMultiplier >= 1.0 || size.dieStep === 0)) return false;
      if (filterType === 'tactical' && (size.dieStep < 0 || size.isStarship)) return false;
      if (filterType === 'starship' && !size.isStarship) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          size.name.toLowerCase().includes(q) ||
          size.scaleDisplay.toLowerCase().includes(q) ||
          (size.example && size.example.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [filterType, searchQuery]);

  // Real-time combat matchup calculation
  const combatMatchup = useMemo(() => {
    return calculateFluidCombatModifier(attackerSize, defenderSize);
  }, [attackerSize, defenderSize]);

  // Real-time meta-tech invocation calculation
  const scaledInvocation = useMemo(() => {
    return scaleMetaTechInvocation({
      name: invocationName,
      baseDamage,
      baseRange: Number(baseRange) || 0,
      baseArea: Number(baseArea) || 0,
      saveDC: Number(baseDC) || 15
    }, hostChassisSize);
  }, [invocationName, baseDamage, baseRange, baseArea, baseDC, hostChassisSize]);

  // Real-time proximity calculation
  const proximityResults = useMemo(() => {
    return calculateProximityDamage(starshipSize, starshipDamage);
  }, [starshipSize, starshipDamage]);

  // Real-time asset validation results
  const assetValidation = useMemo(() => {
    const scaleCheck = validateAssetScaling({
      name: testAssetName,
      size: testAssetSize,
      durability: testAssetSP,
      stealth: testAssetStealth,
      damage: testAssetDamage
    });
    const valuationCheck = validateAssetValuation(testAssetDC, testAssetCost);
    return { scaleCheck, valuationCheck };
  }, [testAssetName, testAssetSize, testAssetDC, testAssetCost, testAssetSP, testAssetStealth, testAssetDamage]);

  const handleTabChange = (tab) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col h-full bg-[#080d16] text-slate-100 font-sans select-none overflow-y-auto">
      {/* Header Banner */}
      <div className="p-6 pb-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-950/80 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Maximize2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
                  SCALING MATRIX SUITE
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                  01.01.09 Canon
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Universal 14-Tier Scaling, Fluid Relative Combat Modifiers, Starship Overblast & Asset Valuation
              </p>
            </div>
          </div>

          {/* Quick Tab Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'matrix', label: '14-Tier Matrix', icon: Layers },
              { id: 'combat', label: 'Fluid Combat Matchups', icon: Crosshair },
              { id: 'metatech', label: 'Meta-Tech Scaler', icon: Zap },
              { id: 'starship', label: 'Starship Overblast', icon: Flame },
              { id: 'checker', label: 'Asset Valuation Checker', icon: Calculator }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6">
        {/* TAB 1: 14-TIER SIZE MATRIX */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            {/* Filter Bar & Quick Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Filter Scale:</span>
                {[
                  { id: 'all', label: 'All 14 Tiers' },
                  { id: 'submedium', label: 'Sub-Medium (-1ds to -5ds)' },
                  { id: 'tactical', label: 'Tactical (x1 to x20)' },
                  { id: 'starship', label: 'Starship (x40 to x320)' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(900, 0.02);
                      setFilterType(f.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      filterType === f.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search size, reach, or tier..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Selected Category Deep Dive Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Scale Highlights */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950/90 rounded-2xl p-6 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.05)] relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-2xl font-mono font-bold text-amber-300">
                        {activeCategory.name}
                      </h2>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold">
                        {activeCategory.scaleDisplay} Multiplier
                      </span>
                      {activeCategory.isStarship && (
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-red-950/80 text-red-300 border border-red-500/40 font-bold">
                          Starship Scale
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Archetype Example: <span className="text-slate-200">{activeCategory.example || 'General Asset'}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Baseline Reach</span>
                    <span className="text-base font-mono font-bold text-cyan-300">{activeCategory.reach}</span>
                  </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Strength Mod</span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {activeCategory.strMod >= 0 ? `+${activeCategory.strMod}` : activeCategory.strMod}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Combat Mod (vs Med)</span>
                    <span className="text-lg font-mono font-bold text-blue-400">
                      {activeCategory.combatMod >= 0 ? `+${activeCategory.combatMod}` : activeCategory.combatMod}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Stealth Mod</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {typeof activeCategory.stealthMod === 'number' && activeCategory.stealthMod >= 0
                        ? `+${activeCategory.stealthMod}`
                        : activeCategory.stealthMod}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Max Dimensions</span>
                    <span className="text-xs font-mono font-bold text-slate-300 mt-1 block truncate">
                      {activeCategory.height} | {activeCategory.weight}
                    </span>
                  </div>
                </div>

                {/* Scaled Parameter Calculations */}
                <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 space-y-3">
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Calculator size={13} className="text-amber-400" />
                    <span>Scaled Output Multipliers (Applied to Medium Baselines)</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Weapon Damage (1d10 Base)</span>
                      <span className="text-amber-300 font-bold text-sm">
                        {scaleDamageDice('1d10', activeCategory.id)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Move Speed (30 ft Base)</span>
                      <span className="text-cyan-300 font-bold text-sm">
                        {scaleMovementSpeed(30, activeCategory.id)} ft/rnd
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Structure Points (50 SP Base)</span>
                      <span className="text-emerald-300 font-bold text-sm">
                        {scaleStructurePoints(50, activeCategory.id)} SP
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Carry Capacity (500 lb Base)</span>
                      <span className="text-purple-300 font-bold text-sm">
                        {scaleCarryingCapacity(500, activeCategory.id).toLocaleString()} lbs
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Die-Stepping Reference Ladder */}
              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-amber-400" />
                  <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wide">
                    Die-Stepping Ladder (-ds)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  Sub-medium sizes step down weapon die side values rather than fractioning rolls:
                </p>
                <div className="space-y-1.5 font-mono text-xs">
                  {DIE_STEP_LADDER.map((step, idx) => (
                    <div 
                      key={step}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                        idx === 0 
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 font-bold' 
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-slate-500">Tier -{idx}ds:</span>
                      <span className="font-bold text-cyan-300">{step}</span>
                      <span className="text-[10px] text-slate-500">
                        {idx === 0 ? 'Standard Baseline' : idx === 6 ? '1 Point Minimum' : `Step -${idx}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comprehensive 14-Tier Master Table */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={15} className="text-amber-400" />
                  <span>Canonical 14-Tier Size Categories Matrix</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Showing {filteredSizes.length} categories
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Size Category</th>
                      <th className="py-3 px-4">Scaling Mod*</th>
                      <th className="py-3 px-4">STR Mod</th>
                      <th className="py-3 px-4">Combat Mod</th>
                      <th className="py-3 px-4">Stealth Mod</th>
                      <th className="py-3 px-4">Height / Length</th>
                      <th className="py-3 px-4">Weight</th>
                      <th className="py-3 px-4">Reach</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSizes.map(size => {
                      const isSelected = size.id === selectedSizeKey;
                      return (
                        <tr
                          key={size.id}
                          onClick={() => {
                            AudioService.playTerminalBeep(900, 0.02);
                            setSelectedSizeKey(size.id);
                          }}
                          className={`hover:bg-amber-500/10 cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-500/15 text-amber-200 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <td className="py-3 px-4 font-bold flex items-center gap-2">
                            {isSelected && <ChevronRight size={13} className="text-amber-400" />}
                            <span>{size.name}</span>
                            {size.isStarship && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/30">
                                ** Starship
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-cyan-300 font-bold">{size.scaleDisplay}</td>
                          <td className="py-3 px-4 text-amber-400">
                            {size.strMod >= 0 ? `+${size.strMod}` : size.strMod}
                          </td>
                          <td className="py-3 px-4 text-blue-400">
                            {size.combatMod >= 0 ? `+${size.combatMod}` : size.combatMod}
                          </td>
                          <td className="py-3 px-4 text-emerald-400">
                            {typeof size.stealthMod === 'number' && size.stealthMod >= 0 ? `+${size.stealthMod}` : size.stealthMod}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{size.height}</td>
                          <td className="py-3 px-4 text-slate-400">{size.weight}</td>
                          <td className="py-3 px-4 text-slate-300 font-bold">{size.reach}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLUID COMBAT MATCHUP SIMULATOR */}
        {activeTab === 'combat' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-mono font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <Crosshair size={18} className="text-cyan-400" />
                  <span>Fluid Relative Combat Modifier Simulator</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                  Modifiers in Tangent are fluid based on both Attacker and Defender size tiers. 
                  Subtract when attacker vs defender cross the medium threshold; divide when both are on the same side of Medium.
                </p>
              </div>

              {/* Attacker vs Defender Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-amber-300 uppercase block">
                    Attacker Size Category
                  </label>
                  <select
                    value={attackerSize}
                    onChange={(e) => setAttackerSize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {SIZE_CATEGORIES_LIST.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.scaleDisplay}, Combat Mod {s.combatMod >= 0 ? `+${s.combatMod}` : s.combatMod})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-blue-300 uppercase block">
                    Defender / Target Size Category
                  </label>
                  <select
                    value={defenderSize}
                    onChange={(e) => setDefenderSize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {SIZE_CATEGORIES_LIST.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.scaleDisplay}, Combat Mod {s.combatMod >= 0 ? `+${s.combatMod}` : s.combatMod})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Matchup Resolution Box */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-6 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Effective Fluid Combat Modifier for {combatMatchup.attackerSize} vs {combatMatchup.defenderSize}
                    </span>
                    <div className="text-3xl font-mono font-bold text-cyan-300 mt-1">
                      {combatMatchup.modifier >= 0 ? `+${combatMatchup.modifier}` : combatMatchup.modifier}
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono">
                    <span className="text-slate-400 block text-[10px]">Tactical Outcome:</span>
                    <span className={`font-bold ${combatMatchup.modifier > 0 ? 'text-emerald-400' : combatMatchup.modifier < 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {combatMatchup.modifier > 0 
                        ? `Advantage to Attacker (+${combatMatchup.modifier})` 
                        : combatMatchup.modifier < 0 
                        ? `Advantage to Target Defender (${combatMatchup.modifier})` 
                        : 'Equal Size Matchup (0)'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                  <span className="text-cyan-400 font-bold block mb-1">Mathematical Rule Breakdown:</span>
                  {combatMatchup.explanation}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: META-TECH / INVOCATION HOST SCALER */}
        {activeTab === 'metatech' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-mono font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <Zap size={18} className="text-purple-400" />
                  <span>Meta-Tech & Invocation Chassis Multiplier</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                  When a Meta-Tech device or Invocation is generated or installed onto a host vehicle chassis, 
                  the Scale Multiplier amplifies Damage Dice, Range, and Area, while preserving Save DCs.
                </p>
              </div>

              {/* Input Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block">Invocation / Spell</label>
                  <input
                    type="text"
                    value={invocationName}
                    onChange={(e) => setInvocationName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-amber-300 uppercase block">Base Damage Dice</label>
                  <input
                    type="text"
                    value={baseDamage}
                    onChange={(e) => setBaseDamage(e.target.value)}
                    placeholder="E.g. 5d6, 2d10"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-purple-300 uppercase block">Host Chassis Size</label>
                  <select
                    value={hostChassisSize}
                    onChange={(e) => setHostChassisSize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  >
                    {SIZE_CATEGORIES_LIST.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.scaleDisplay})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-cyan-300 uppercase block">Base Range (ft)</label>
                  <input
                    type="number"
                    value={baseRange}
                    onChange={(e) => setBaseRange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-emerald-300 uppercase block">Base Area (ft radius)</label>
                  <input
                    type="number"
                    value={baseArea}
                    onChange={(e) => setBaseArea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase block">Base Save DC</label>
                  <input
                    type="number"
                    value={baseDC}
                    onChange={(e) => setBaseDC(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Scaled Output Card */}
              <div className="bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-950 rounded-2xl p-6 border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] space-y-4">
                <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
                  <span className="text-sm font-mono font-bold text-purple-300">
                    Amplified Result: {scaledInvocation.name} on {scaledInvocation.hostChassisSize} Chassis (x{scaledInvocation.scaleMultiplier})
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30 font-bold">
                    DC {scaledInvocation.saveDC} (Preserved)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Scaled Damage</span>
                    <span className="text-lg font-bold text-amber-400">{scaledInvocation.scaledDamage}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">(Base {scaledInvocation.baseDamage} × {scaledInvocation.scaleMultiplier})</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Scaled Range</span>
                    <span className="text-lg font-bold text-cyan-400">{scaledInvocation.scaledRange}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">(Base {scaledInvocation.baseRange} × {scaledInvocation.scaleMultiplier})</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Scaled Area</span>
                    <span className="text-lg font-bold text-emerald-400">{scaledInvocation.scaledArea}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">(Base {scaledInvocation.baseArea} × {scaledInvocation.scaleMultiplier})</span>
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-300 italic pt-2">
                  "{scaledInvocation.summary}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STARSHIP PROXIMITY DAMAGE */}
        {activeTab === 'starship' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-mono font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <Flame size={18} className="text-red-400" />
                  <span>Starship Proximity Damage & Overblast Tool</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                  Capital ships and starship-scale assets (Enormous+) vaporize small targets directly, 
                  and also deal 1/10th Indirect Damage within a radius of half their Strength Modifier in feet.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-red-300 uppercase block">Starship Size Tier</label>
                  <select
                    value={starshipSize}
                    onChange={(e) => setStarshipSize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  >
                    {SIZE_CATEGORIES_LIST.filter(s => s.isStarship).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.scaleDisplay}, STR Mod +{s.strMod})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-amber-300 uppercase block">Direct Blast Damage</label>
                  <input
                    type="text"
                    value={starshipDamage}
                    onChange={(e) => setStarshipDamage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Proximity Analysis Box */}
              <div className="bg-gradient-to-br from-red-950/30 via-slate-950 to-slate-950 rounded-2xl p-6 border border-red-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
                  <span className="text-sm font-mono font-bold text-red-300">
                    Proximity Overblast Analysis ({starshipSize} Scale)
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-bold">
                    Active Capital Scale
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Direct Hit Target</span>
                    <span className="text-lg font-bold text-amber-400">{proximityResults.directDamage}</span>
                    <span className="text-[10px] text-red-400 block mt-0.5">Vaporization risk</span>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Overblast Radius</span>
                    <span className="text-lg font-bold text-cyan-400">{proximityResults.splashRadiusFt} ft radius</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">(Half STR Mod in feet)</span>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Indirect Splash Damage</span>
                    <span className="text-lg font-bold text-purple-400">1/10th Direct Dmg</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Debris / shockwave trauma</span>
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  {proximityResults.overblastDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ASSET SCALING & TSC VALUATION CHECKER */}
        {activeTab === 'checker' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-mono font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <Calculator size={18} className="text-amber-400" />
                  <span>Real-Time Asset Scaling & TSC Valuation Inspector</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                  Test and verify any in-game asset against canonical scaling thresholds and the Tangent Standard Curve (TSC).
                </p>
              </div>

              {/* Asset Test Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block">Asset Name</label>
                  <input
                    type="text"
                    value={testAssetName}
                    onChange={(e) => setTestAssetName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-amber-300 uppercase block">Size Category</label>
                  <select
                    value={testAssetSize}
                    onChange={(e) => setTestAssetSize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  >
                    {SIZE_CATEGORIES_LIST.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.scaleDisplay})</option>
                    ))}
                  </select>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-cyan-300 uppercase block">Craft / Complexity DC</label>
                  <input
                    type="number"
                    value={testAssetDC}
                    onChange={(e) => setTestAssetDC(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-emerald-300 uppercase block">Entered Cost (Cr)</label>
                  <input
                    type="number"
                    value={testAssetCost}
                    onChange={(e) => setTestAssetCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-blue-300 uppercase block">Entered SP</label>
                  <input
                    type="number"
                    value={testAssetSP}
                    onChange={(e) => setTestAssetSP(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-purple-300 uppercase block">Stealth Mod</label>
                  <input
                    type="text"
                    value={testAssetStealth}
                    onChange={(e) => setTestAssetStealth(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-amber-300 uppercase block">Damage Notation</label>
                  <input
                    type="text"
                    value={testAssetDamage}
                    onChange={(e) => setTestAssetDamage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Diagnostic Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scale Diagnostics */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-amber-400" />
                    <span>Scaling Engine Diagnostics</span>
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Tier Category:</span>
                      <span className="text-amber-300 font-bold">{assetValidation.scaleCheck.scaleCategory}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Scale Multiplier:</span>
                      <span className="text-cyan-300 font-bold">{assetValidation.scaleCheck.scaleDisplay}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Reach Bound:</span>
                      <span className="text-slate-200">{assetValidation.scaleCheck.reach}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Canonical Stealth Mod:</span>
                      <span className="text-emerald-400 font-bold">{assetValidation.scaleCheck.stealthMod}</span>
                    </div>

                    {assetValidation.scaleCheck.warnings.length > 0 ? (
                      <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle size={13} />
                          <span>Scaling Rule Warnings</span>
                        </div>
                        {assetValidation.scaleCheck.warnings.map((w, idx) => (
                          <div key={idx} className="text-[11px] text-amber-200">{w}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 font-bold">
                        <CheckCircle2 size={14} />
                        <span>Asset strictly complies with scaling metrics</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Valuation Diagnostics */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Coins size={14} className="text-amber-400" />
                    <span>TSC Valuation & DC Integrity</span>
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Calculated TSC Value:</span>
                      <span className="text-amber-300 font-bold">{Number(assetValidation.valuationCheck.tscValue).toLocaleString()} Credits</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Entered Cost:</span>
                      <span className="text-slate-200 font-bold">{Number(assetValidation.valuationCheck.enteredCost).toLocaleString()} Credits</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Valuation Ratio:</span>
                      <span className="text-cyan-300 font-bold">{assetValidation.valuationCheck.ratio}x</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Complexity Tier:</span>
                      <span className="text-purple-300 font-bold">{assetValidation.valuationCheck.complexityTier}</span>
                    </div>

                    <div 
                      className="p-3 rounded-xl border font-bold text-xs"
                      style={{ 
                        borderColor: assetValidation.valuationCheck.color, 
                        background: `${assetValidation.valuationCheck.color}15`,
                        color: assetValidation.valuationCheck.color 
                      }}
                    >
                      <span>Valuation Status: {assetValidation.valuationCheck.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScalingCodex;
