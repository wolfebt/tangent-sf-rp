import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Cpu, 
  Layers, 
  Zap, 
  Compass, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  ChevronDown, 
  Sliders, 
  Plus, 
  Trash2,
  Brain,
  AlertTriangle
} from 'lucide-react';
import { 
  TECH_LEVELS, 
  CIVILIZATION_DOMAINS_DETAILED, 
  CIVILIZATION_ARCHETYPES,
  ADAPTIVE_TECH_RECONFIG_TIMES,
  SYNTHETIC_INTELLIGENCE_CONTINUUM,
  SCHEMATIC_RARITY
} from '../../engines/tangentConstants';
import { 
  calculateTechPenalty, 
  calculateEducationBonus, 
  getSchematicCost, 
  getReconfigTime 
} from '../../engines/tangentTechEngine';
import { AudioService } from '../../services/audioService';

export const TechnologyCodex = ({ onOpenBuilder }) => {
  const [activeTab, setActiveTab] = useState('encyclopedia'); // 'encyclopedia' | 'domains' | 'adaptive' | 'technologist' | 'penalties' | 'ai'
  const [selectedTL, setSelectedTL] = useState(3);
  const [expandedTL, setExpandedTL] = useState(3);

  // 1. 16-Domain Profiler State
  const [domainRatings, setDomainRatings] = useState({
    agriculture: 3,
    architecture: 3,
    biotechnology: 3,
    commerce: 3,
    communication: 4,
    devices: 4,
    education: 3,
    energy: 3,
    manufacturing: 3,
    materials: 3,
    medicine: 3,
    meta_sciences: 1,
    science: 4,
    society: 3,
    synthetic_intelligence: 3,
    transportation: 3,
    weaponry: 4
  });

  // 2. Adaptive Device Configurator State
  const [deviceTL, setDeviceTL] = useState(4);
  const [deviceType, setDeviceType] = useState('Programmable Matter');
  const [schematics, setSchematics] = useState([
    { id: '1', name: 'Plasma Burst Pistol', baseCost: 2560, rarity: 'Common' },
    { id: '2', name: 'Mnemonic Data Probe', baseCost: 640, rarity: 'Uncommon' },
    { id: '3', name: 'Phase Infiltration Rig', baseCost: 10240, rarity: 'Rare' }
  ]);
  const [newSchematicName, setNewSchematicName] = useState('');
  const [newSchematicCost, setNewSchematicCost] = useState(1000);
  const [newSchematicRarity, setNewSchematicRarity] = useState('Common');

  // 3. Technologist Tracker State
  const [currentCharTL, setCurrentCharTL] = useState(3);
  const [advancedFields, setAdvancedFields] = useState(['devices', 'communication', 'synthetic_intelligence']);

  // 4. Tech Penalty Calculator State
  const [penaltyItemTL, setPenaltyItemTL] = useState(4);
  const [penaltyCharTL, setPenaltyCharTL] = useState(2);
  const [isWeaponPenalty, setIsWeaponPenalty] = useState(false);
  const [hasTechAdvancement, setHasTechAdvancement] = useState(false);

  // Derived calculations
  const civArchetype = useMemo(() => {
    for (const arch of CIVILIZATION_ARCHETYPES) {
      const keys = Object.keys(arch.threshold);
      if (keys.length === 0) continue;
      const matches = keys.every(k => (domainRatings[k] || 0) >= arch.threshold[k]);
      if (matches) return arch;
    }
    return CIVILIZATION_ARCHETYPES[CIVILIZATION_ARCHETYPES.length - 1];
  }, [domainRatings]);

  const radarPoints = useMemo(() => {
    const domains = Object.keys(CIVILIZATION_DOMAINS_DETAILED);
    const count = domains.length;
    const center = 150;
    const maxRadius = 110;

    const points = domains.map((key, index) => {
      const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
      const score = (domainRatings[key] || 0) / 5;
      const r = maxRadius * score;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, key, label: CIVILIZATION_DOMAINS_DETAILED[key].name, score: domainRatings[key] || 0 };
    });

    const polygonPoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return { points, polygonPoints, center, maxRadius };
  }, [domainRatings]);

  const calculatedPenalty = useMemo(() => {
    if (hasTechAdvancement) return 0;
    return calculateTechPenalty(penaltyItemTL, penaltyCharTL, isWeaponPenalty);
  }, [penaltyItemTL, penaltyCharTL, isWeaponPenalty, hasTechAdvancement]);

  const handleAddSchematic = () => {
    if (!newSchematicName.trim()) return;
    AudioService.playTerminalBeep(1200, 0.02);
    setSchematics(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newSchematicName.trim(),
        baseCost: Number(newSchematicCost) || 100,
        rarity: newSchematicRarity
      }
    ]);
    setNewSchematicName('');
  };

  const handleRemoveSchematic = (id) => {
    AudioService.playTerminalBeep(800, 0.02);
    setSchematics(prev => prev.filter(s => s.id !== id));
  };

  const toggleAdvancedField = (fieldKey) => {
    AudioService.playTerminalBeep(1100, 0.015);
    setAdvancedFields(prev => {
      if (prev.includes(fieldKey)) {
        return prev.filter(k => k !== fieldKey);
      } else {
        return [...prev, fieldKey];
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900/70 to-blue-950/50 border border-indigo-500/40 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Boxes size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Technological Framework
                </span>
                <span className="text-xs font-mono text-slate-400">TL 0 (Primitive) to TL 5 (Galactic) & TL X</span>
              </div>
              <h1 className="text-xl font-mono font-extrabold text-white uppercase tracking-wider mt-0.5">
                Technology Codex & Profiler
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenBuilder}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer"
            >
              <Plus size={14} />
              <span>Save Technology Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
        {[
          { id: 'encyclopedia', label: '1. Tech Level Encyclopedia', icon: BookOpen },
          { id: 'domains', label: '2. 16-Domain Civ Profiler', icon: Layers },
          { id: 'adaptive', label: '3. Adaptive Devices & Morphic', icon: Zap },
          { id: 'technologist', label: '4. Technologist Feature Tracker', icon: Brain },
          { id: 'penalties', label: '5. Tech Penalty Calculator', icon: ShieldAlert },
          { id: 'ai', label: '6. Synthetic Intelligence Matrix', icon: Cpu }
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
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] border border-indigo-400/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TECH LEVEL ENCYCLOPEDIA */}
      {activeTab === 'encyclopedia' && (
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5].map(tl => {
            const def = TECH_LEVELS[tl];
            const isExpanded = expandedTL === tl;

            return (
              <div 
                key={tl} 
                className={`rounded-2xl border transition-all ${
                  isExpanded 
                    ? 'bg-slate-900/70 border-indigo-500/50 shadow-lg' 
                    : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div 
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.015);
                    setExpandedTL(isExpanded ? null : tl);
                  }}
                  className="p-4 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono font-extrabold flex items-center justify-center text-sm">
                      TL{tl}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-white">{def.name}: {def.era}</span>
                        <span className="text-slate-500 font-mono text-xs">•</span>
                        <span className="text-xs font-mono text-indigo-300">{def.subtitle}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Power: {def.powerSources.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                      Wealth Mod: {def.wealthMod >= 0 ? `+${def.wealthMod}` : def.wealthMod}
                    </span>
                    {isExpanded ? <ChevronDown size={18} className="text-indigo-400" /> : <ChevronRight size={18} className="text-slate-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase text-[10px]">Associated Species</span>
                      <p className="text-slate-200 font-bold">{def.species.join(', ')}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase text-[10px]">Education Bonus</span>
                      <p className="text-emerald-300 font-bold">
                        {typeof def.educationBonus.value === 'number' ? `+${def.educationBonus.value} Skill Points` : def.educationBonus.value}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase text-[10px]">Mechanical Limits</span>
                      <p className="text-rose-300 font-bold">
                        {def.restrictedSkills?.length ? `Restricted: ${def.restrictedSkills.join(', ')}` : 'No Standard Skill Limits'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Tech Level X: Transgalactic Reference */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-purple-500/40 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center text-sm">
                TL X
              </span>
              <div>
                <span className="font-bold text-purple-300 uppercase">Tech Level X: Transgalactic (Mythical / Progenitors)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Restructured planets, large-scale quantum manipulation, causality engineering. Unavailable for player character crafting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 16-DOMAIN CIVILIZATION PROFILER */}
      {activeTab === 'domains' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-between gap-4">
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">Synthesized Profile</span>
                <h4 className="text-sm font-mono font-extrabold text-white">{civArchetype.name}</h4>
              </div>
            </div>

            {/* SVG Spider Chart */}
            <div className="relative w-[280px] h-[280px] flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 300 300">
                {[1, 2, 3, 4, 5].map(tier => (
                  <circle
                    key={tier}
                    cx={radarPoints.center}
                    cy={radarPoints.center}
                    r={(radarPoints.maxRadius * tier) / 5}
                    fill="none"
                    stroke="#334155"
                    strokeDasharray="2,2"
                    strokeWidth={1}
                  />
                ))}

                {radarPoints.points.map((p, i) => (
                  <line
                    key={i}
                    x1={radarPoints.center}
                    y1={radarPoints.center}
                    x2={radarPoints.center + radarPoints.maxRadius * Math.cos((i * 2 * Math.PI) / 16 - Math.PI / 2)}
                    y2={radarPoints.center + radarPoints.maxRadius * Math.sin((i * 2 * Math.PI) / 16 - Math.PI / 2)}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                ))}

                <polygon
                  points={radarPoints.polygonPoints}
                  fill="rgba(99, 102, 241, 0.25)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  className="transition-all duration-300"
                />

                {radarPoints.points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={3.5}
                    fill="#818cf8"
                    stroke="#0f172a"
                    strokeWidth={1.5}
                    className="transition-all duration-300"
                  />
                ))}
              </svg>
            </div>

            <p className="text-[11px] font-mono text-slate-400 text-center leading-relaxed italic">
              {civArchetype.description}
            </p>
          </div>

          <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 max-h-[500px] overflow-y-auto pr-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Domain Rating Adjustments (0–5)
            </h3>

            {Object.entries(CIVILIZATION_DOMAINS_DETAILED).map(([key, def]) => {
              const currentVal = domainRatings[key] || 0;
              const currentStage = def.stages[currentVal] || def.stages[0];

              return (
                <div key={key} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{def.name}</span>
                    <span className="text-indigo-300 font-bold">
                      TL {currentVal}: {currentStage}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={currentVal}
                    onChange={(e) => {
                      AudioService.playTerminalBeep(1200, 0.01);
                      setDomainRatings(prev => ({ ...prev, [key]: Number(e.target.value) }));
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ADAPTIVE DEVICES & MORPHIC RECONFIGURATION */}
      {activeTab === 'adaptive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Zap size={15} /> Adaptive Reconfiguration Matrix
            </h3>

            <div className="space-y-3">
              {Object.values(ADAPTIVE_TECH_RECONFIG_TIMES).map(entry => (
                <div key={entry.tl} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-300">TL {entry.tl}: {entry.type}</span>
                    <span className="text-amber-300 font-bold">{entry.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Integration DC: <strong className="text-cyan-300">DC {entry.tl * 5} Computer Check</strong> • Trigger: {entry.trigger}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schematic Design Library Manager */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">Schematic Memory Bank ({schematics.length}/5 Active)</span>
              <span className="text-xs font-mono font-bold text-indigo-400">{Math.round((schematics.length / 5) * 100)}% Used</span>
            </div>

            <div className="space-y-2">
              {schematics.map(s => {
                const multiplier = s.rarity === 'Common' ? 5 : s.rarity === 'Uncommon' ? 10 : 20;
                const marketCost = s.baseCost * multiplier;

                return (
                  <div key={s.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="font-bold text-slate-200">{s.name}</span>
                      <div className="text-[10px] text-slate-500">
                        {s.rarity} ({multiplier}x) • Market Value: <strong className="text-amber-300">{marketCost.toLocaleString()} Cr</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSchematic(s.id)}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Schematic Form */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs font-mono">
              <input
                type="text"
                value={newSchematicName}
                onChange={(e) => setNewSchematicName(e.target.value)}
                placeholder="New Schematic Name..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
              />
              <select
                value={newSchematicRarity}
                onChange={(e) => setNewSchematicRarity(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200"
              >
                <option value="Common">Common (5x)</option>
                <option value="Uncommon">Uncommon (10x)</option>
                <option value="Rare">Rare (20x)</option>
              </select>
              <button
                type="button"
                onClick={handleAddSchematic}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TECHNOLOGIST FEATURE TRACKER */}
      {activeTab === 'technologist' && (
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Brain size={15} /> Technologist Feature: 17 Fields of Study
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Master 5 or more fields from the next Technological Era to advance character Technology Level.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Mastered: <strong className="text-indigo-300">{advancedFields.length}/17</strong></span>
              <span className={`px-2.5 py-1 rounded-lg font-bold ${
                advancedFields.length >= 5 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
              }`}>
                {advancedFields.length >= 5 ? 'Ready for TL Advancement' : `${5 - advancedFields.length} more needed`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
            {Object.entries(CIVILIZATION_DOMAINS_DETAILED).map(([key, def]) => {
              const isChecked = advancedFields.includes(key);

              return (
                <div
                  key={key}
                  onClick={() => toggleAdvancedField(key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked 
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-sm' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold">{def.name}</span>
                  {isChecked && <CheckCircle size={14} className="text-indigo-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: TECH PENALTY CALCULATOR */}
      {activeTab === 'penalties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <ShieldAlert size={15} /> Tech Gap Parameters
            </h3>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Device Tech Level: TL {penaltyItemTL}</label>
              <input
                type="range"
                min={0}
                max={5}
                value={penaltyItemTL}
                onChange={(e) => setPenaltyItemTL(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Character Tech Level: TL {penaltyCharTL}</label>
              <input
                type="range"
                min={0}
                max={5}
                value={penaltyCharTL}
                onChange={(e) => setPenaltyCharTL(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWeaponPenalty}
                  onChange={(e) => setIsWeaponPenalty(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>Is Weapon Device (-1/TL)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTechAdvancement}
                  onChange={(e) => setHasTechAdvancement(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>Has Technologist Feature</span>
              </label>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between gap-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Check Penalty</span>
              <div className="text-3xl font-mono font-extrabold text-rose-400 mt-1">
                {calculatedPenalty === 0 ? '0 (No Penalty)' : `${calculatedPenalty} on Checks`}
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-400 leading-relaxed italic">
              Without the Technologist Feature in the relevant field, characters suffer a -5 penalty per Tech Level gap to use, modify, or repair advanced hardware (-1 per TL gap for simple weapons).
            </p>
          </div>
        </div>
      )}

      {/* TAB 6: SYNTHETIC INTELLIGENCE MATRIX */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
              <Cpu size={15} /> Synthetic Intelligence Continuum (TL 1 to TL 5)
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {SYNTHETIC_INTELLIGENCE_CONTINUUM.map(ai => (
                <div key={ai.stage} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">Stage {ai.stage}: {ai.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                        TL {ai.tl}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ai.description}</p>
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

export default TechnologyCodex;
