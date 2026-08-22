import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Sun, 
  Wind, 
  Droplets, 
  Users, 
  ShieldAlert, 
  Cpu, 
  Sparkles, 
  Compass, 
  Dices, 
  Layers, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Boxes,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { 
  STELLAR_CLASSES, 
  ORBITAL_ZONES, 
  PLANETARY_SIZE_CLASSES, 
  ATMOSPHERE_TYPES_DETAILED, 
  GOVERNMENT_TYPES_DETAILED, 
  LAW_LEVELS_DETAILED, 
  STARPORT_TYPES, 
  TRADE_CODE_DEFINITIONS,
  COMMODITIES_CATALOG,
  CIVILIZATION_DOMAINS_DETAILED,
  CULTURAL_QUIRKS
} from '../../../engines/tangentConstants';
import { 
  parseUWP, 
  formatUWP, 
  getGravityDetails, 
  getAtmosphereDetails, 
  deriveTradeCodes, 
  calculateCommodityModifiers, 
  generateProceduralPlanet, 
  evaluateCivilizationArchetype, 
  getMarketAvailabilityCap, 
  calculateHazardDC 
} from '../../../engines/tangentPlanetaryEngine';
import { AudioService } from '../../../services/audioService';

export const PlanetaryDesignConfigurator = ({ formData, onChange }) => {
  const [activeTab, setActiveTab] = useState('geophysics'); // 'geophysics' | 'sociology' | 'domains' | 'economy' | 'generator'
  const [hookFilter, setHookFilter] = useState('');

  // Extract or default current state values
  const starClass = formData.starClass || 'G';
  const orbitalZone = formData.orbitalZone || 'BioZone';
  const size = Number(formData.size ?? formData.size_class ?? 6);
  const atmosphere = Number(formData.atmosphere ?? formData.atmos_code ?? 4);
  const hydrography = Number(formData.hydrography ?? formData.hydro_code ?? 6);
  const population = Number(formData.population ?? formData.pop_code ?? 7);
  const starport = formData.starport || 'C';
  const government = Number(formData.government ?? formData.gov_code ?? 4);
  const lawLevel = Number(formData.lawLevel ?? formData.law_level ?? 4);
  const techLevel = Number(formData.techLevel ?? formData.tl ?? formData.tech_level ?? 3);
  const metaLevel = Number(formData.metaLevel ?? formData.ml ?? formData.meta_level ?? 0);
  const faction = formData.dominant_faction || 'Independent';

  // Domain ratings 0-5
  const domainRatings = useMemo(() => {
    const raw = formData.domainRatings || {};
    const result = {};
    Object.keys(CIVILIZATION_DOMAINS_DETAILED).forEach(key => {
      result[key] = raw[key] !== undefined ? Number(raw[key]) : techLevel;
    });
    return result;
  }, [formData.domainRatings, techLevel]);

  // Derived attributes
  const uwpData = useMemo(() => ({
    starport,
    size,
    atmosphere,
    hydrography,
    population,
    government,
    lawLevel,
    techLevel,
    metaLevel
  }), [starport, size, atmosphere, hydrography, population, government, lawLevel, techLevel, metaLevel]);

  const uwpString = useMemo(() => formatUWP(uwpData), [uwpData]);
  const tradeCodes = useMemo(() => deriveTradeCodes(uwpData), [uwpData]);
  const commodityExchange = useMemo(() => calculateCommodityModifiers(tradeCodes), [tradeCodes]);
  const gravityDetails = useMemo(() => getGravityDetails(size), [size]);
  const atmosphereDetails = useMemo(() => getAtmosphereDetails(atmosphere), [atmosphere]);
  const marketCap = useMemo(() => getMarketAvailabilityCap(techLevel), [techLevel]);
  const civArchetype = useMemo(() => evaluateCivilizationArchetype(domainRatings), [domainRatings]);
  const hazardDC = useMemo(() => calculateHazardDC('Moderate', atmosphere, size), [atmosphere, size]);

  const handleDomainChange = (domainKey, val) => {
    AudioService.playTerminalBeep(1200, 0.015);
    const newDomains = { ...domainRatings, [domainKey]: Number(val) };
    onChange('domainRatings', newDomains);
  };

  const handleProceduralGenerate = (selectedFaction) => {
    AudioService.playTerminalBeep(1400, 0.05);
    const generated = generateProceduralPlanet({ faction: selectedFaction || faction });
    
    onChange('starClass', generated.starClass);
    onChange('orbitalZone', generated.orbitalZone);
    onChange('size', generated.uwpData.size);
    onChange('atmosphere', generated.uwpData.atmosphere);
    onChange('hydrography', generated.uwpData.hydrography);
    onChange('population', generated.uwpData.population);
    onChange('starport', generated.uwpData.starport);
    onChange('government', generated.uwpData.government);
    onChange('lawLevel', generated.uwpData.lawLevel);
    onChange('techLevel', generated.uwpData.techLevel);
    onChange('tl', generated.uwpData.techLevel);
    onChange('metaLevel', generated.uwpData.metaLevel);
    onChange('ml', generated.uwpData.metaLevel);
    onChange('domainRatings', generated.domainRatings);
    onChange('dominant_faction', generated.dominantFaction);
    onChange('uwp', generated.uwp);
    if (!formData.name) {
      onChange('name', `${generated.dominantFaction.replace('The ', '')} Outpost ${Math.floor(Math.random() * 900 + 100)}`);
    }
  };

  // 16-Domain Radar Chart Points Calculation
  const radarPoints = useMemo(() => {
    const domains = Object.keys(CIVILIZATION_DOMAINS_DETAILED);
    const count = domains.length;
    const center = 150;
    const maxRadius = 110;

    const points = domains.map((key, index) => {
      const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
      const score = (domainRatings[key] || 0) / 5; // 0 to 1
      const r = maxRadius * score;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, key, label: CIVILIZATION_DOMAINS_DETAILED[key].name, score: domainRatings[key] || 0 };
    });

    const polygonPoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return { points, polygonPoints, center, maxRadius };
  }, [domainRatings]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Tangent World Profile (TWP) & Core Status */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-cyan-950/40 border border-teal-500/30 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/50 text-teal-300 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <Globe size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  UWP Code: {uwpString}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {STELLAR_CLASSES[starClass]?.name || 'Class G'} • {ORBITAL_ZONES[orbitalZone]?.name.split(' ')[0]}
                </span>
              </div>
              <h2 className="text-base font-mono font-extrabold text-white tracking-wide uppercase mt-0.5">
                {formData.name || 'UNEXPLORED CELESTIAL BODY'}
              </h2>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
              Gravity: {gravityDetails.gVal} ({gravityDetails.gravityTier})
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold">
              Atmos: {atmosphereDetails.name}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-teal-950/80 border border-teal-500/40 text-teal-300 font-bold">
              Cap: DC {marketCap}
            </span>
          </div>
        </div>

        {/* Trade Codes Live Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1">Trade Codes:</span>
          {tradeCodes.length === 0 ? (
            <span className="text-xs font-mono text-slate-500 italic">No special trade classifications</span>
          ) : (
            tradeCodes.map(tc => {
              const def = TRADE_CODE_DEFINITIONS[tc];
              return (
                <span 
                  key={tc} 
                  title={`${def?.name || tc}: ${def?.desc || ''}`}
                  className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-teal-900/60 border border-teal-500/50 text-teal-200 shadow-sm"
                >
                  [{tc}] {def?.name || tc}
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
        {[
          { id: 'geophysics', label: '1. Geophysical Chassis', icon: Sun },
          { id: 'sociology', label: '2. Sociological Skin', icon: Users },
          { id: 'domains', label: '3. Civilization Radar (16 Domains)', icon: Layers },
          { id: 'economy', label: '4. Commodity Exchange', icon: TrendingUp },
          { id: 'generator', label: '5. Procedural Worldbuilder', icon: Dices }
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
              className={`flex-1 min-w-[130px] px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-[0_0_12px_rgba(20,184,166,0.4)] border border-teal-400/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GEOPHYSICAL CHASSIS */}
      {activeTab === 'geophysics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Stellar & Orbital Settings */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Sun size={15} /> Stellar Context & Orbit
            </h3>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Primary Star Class</label>
              <select
                value={starClass}
                onChange={(e) => onChange('starClass', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:border-teal-400 focus:outline-none"
              >
                {Object.entries(STELLAR_CLASSES).map(([k, s]) => (
                  <option key={k} value={k}>
                    {s.name} — Mass: {s.mass}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">
                {STELLAR_CLASSES[starClass]?.description}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Orbital Ecosphere Zone</label>
              <select
                value={orbitalZone}
                onChange={(e) => onChange('orbitalZone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:border-teal-400 focus:outline-none"
              >
                {Object.entries(ORBITAL_ZONES).map(([k, z]) => (
                  <option key={k} value={k}>{z.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">
                {ORBITAL_ZONES[orbitalZone]?.description}
              </p>
            </div>
          </div>

          {/* Size & Gravity Mechanics */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Globe size={15} /> Planetary Size: Class {size} ({gravityDetails.km})
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                {gravityDetails.gravityTier} ({gravityDetails.gVal})
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={size}
              onChange={(e) => onChange('size', Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Move Speed:</span>
                <span className="font-bold text-teal-300">{gravityDetails.moveMod}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Carry Capacity:</span>
                <span className="font-bold text-amber-300">{gravityDetails.carryMult}x Base</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Combat Modifier:</span>
                <span className="font-bold text-purple-300">{gravityDetails.combatMod}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Fall / Gravity Hazards:</span>
                <span className="font-bold text-rose-300">{gravityDetails.fallDmg}</span>
              </div>
            </div>
          </div>

          {/* Atmosphere Composition */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Wind size={15} /> Atmosphere: Type {atmosphere}
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300">
                {atmosphereDetails.name}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={atmosphere}
              onChange={(e) => onChange('atmosphere', Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Pressure:</span>
                <span className="font-bold text-cyan-300">{atmosphereDetails.pressure}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Required Gear:</span>
                <span className="font-bold text-emerald-300">{atmosphereDetails.gear}</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 italic">
                {atmosphereDetails.hazard}
              </div>
            </div>
          </div>

          {/* Hydrography */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Droplets size={15} /> Surface Hydrographics: {hydrography * 10}%
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-300">
                {hydrography === 0 ? 'Desert / Arid (0%)' : hydrography >= 10 ? 'Water World (100%)' : `Wet Planet (${hydrography * 10}%)`}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={hydrography}
              onChange={(e) => onChange('hydrography', Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />

            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              {hydrography === 0 && 'Desert World: 0% surface water. Deep aquifer mining, solar distillation, tracked or GEV hover transports.'}
              {hydrography > 0 && hydrography < 4 && 'Dry World: 10–30% water coverage. Agriculture restricted to oases and protected valleys.'}
              {hydrography >= 4 && hydrography <= 8 && 'Standard Hydrology: Earth-like balance of oceans, continents, rivers, and diverse biomes.'}
              {hydrography > 8 && 'Pelagic / Water World: Massive global oceans. Requires floating arcologies or deep submersible habitats.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SOCIOLOGICAL SKIN */}
      {activeTab === 'sociology' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Population & Demographics */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Users size={15} /> Population: Tier {population}
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300">
                {population === 0 ? 'Uninhabited (0)' : `~10^${population} Citizens`}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={population}
              onChange={(e) => onChange('population', Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
              {population === 0 && 'Uninhabited / Barren wasteland or automated quarantine zone.'}
              {population >= 1 && population <= 3 && 'Frontier Pioneer Outpost: 10 to 1,000 colonists. High reliance on off-world supply runs.'}
              {population >= 4 && population <= 6 && 'Developed World: 10,000 to 1 Million residents. Established cities and infrastructure.'}
              {population >= 7 && population <= 8 && 'Core Planetary Colony: 10M to 100M population. Thriving industrial hubs and transit.'}
              {population >= 9 && 'Mega-Population / Ecumenopolis: Billions of citizens. Towering arcology spires and dense orbital transit.'}
            </div>
          </div>

          {/* Starport Classification */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Compass size={15} /> Starport Classification
            </h3>

            <select
              value={starport}
              onChange={(e) => onChange('starport', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:border-teal-400 focus:outline-none"
            >
              {Object.entries(STARPORT_TYPES).map(([k, s]) => (
                <option key={k} value={k}>{s.name}</option>
              ))}
            </select>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-teal-300 font-bold">{STARPORT_TYPES[starport]?.facilities}</div>
              <div className="text-slate-400">{STARPORT_TYPES[starport]?.repair}</div>
            </div>
          </div>

          {/* Government Type */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Briefcase size={15} /> Government: Type {government}
              </h3>
              <span className="text-xs font-mono font-bold text-slate-300 truncate max-w-[160px]">
                {GOVERNMENT_TYPES_DETAILED[government]?.name}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={government}
              onChange={(e) => onChange('government', Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />

            <p className="text-xs font-mono text-slate-400 italic">
              {GOVERNMENT_TYPES_DETAILED[government]?.description}
            </p>
          </div>

          {/* Law Level & Banned Items */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <ShieldAlert size={15} /> Law Level: {lawLevel} ({LAW_LEVELS_DETAILED[lawLevel]?.name})
              </h3>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                lawLevel >= 9 ? 'bg-red-950 border-red-500/50 text-red-300' :
                lawLevel >= 5 ? 'bg-amber-950 border-amber-500/50 text-amber-300' :
                'bg-emerald-950 border-emerald-500/50 text-emerald-300'
              }`}>
                {lawLevel === 0 ? 'Lawless' : lawLevel >= 9 ? 'Police State' : 'Civil Order'}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={lawLevel}
              onChange={(e) => onChange('lawLevel', Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-rose-300">
                <span className="text-slate-500">Banned Weapons: </span>
                {LAW_LEVELS_DETAILED[lawLevel]?.bannedWeapons}
              </div>
              <div className="text-purple-300">
                <span className="text-slate-500">Banned Armor: </span>
                {LAW_LEVELS_DETAILED[lawLevel]?.bannedArmor}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CIVILIZATION RADAR (16 DOMAINS) */}
      {activeTab === 'domains' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart Visualizer (5 Cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-between gap-4">
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">Civilization Archetype</span>
                <h4 className="text-sm font-mono font-extrabold text-white">{civArchetype.name}</h4>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-500/40 text-teal-300 font-bold">
                TL {techLevel} Baseline
              </span>
            </div>

            {/* SVG Spider / Radar Chart */}
            <div className="relative w-[300px] h-[300px] flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 300 300">
                {/* Concentric Grid Rings for TL 1 to 5 */}
                {[1, 2, 3, 4, 5].map(tier => {
                  const r = (radarPoints.maxRadius * tier) / 5;
                  return (
                    <circle
                      key={tier}
                      cx={radarPoints.center}
                      cy={radarPoints.center}
                      r={r}
                      fill="none"
                      stroke="#334155"
                      strokeDasharray="2,2"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Domain Axis Lines */}
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

                {/* Radar Fill Area */}
                <polygon
                  points={radarPoints.polygonPoints}
                  fill="rgba(20, 184, 166, 0.25)"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  className="transition-all duration-300"
                />

                {/* Radar Vertex Points */}
                {radarPoints.points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={3.5}
                    fill="#2dd4bf"
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

          {/* 16-Domain Interactive Sliders (7 Cols) */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 max-h-[500px] overflow-y-auto pr-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 mb-2">
              Civilization Domain Advancement (0–5)
            </h3>

            {Object.entries(CIVILIZATION_DOMAINS_DETAILED).map(([key, def]) => {
              const currentVal = domainRatings[key] !== undefined ? domainRatings[key] : techLevel;
              const currentStage = def.stages[currentVal] || def.stages[0];

              return (
                <div key={key} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{def.name}</span>
                    <span className="text-teal-300 font-bold">
                      TL {currentVal}: {currentStage}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={currentVal}
                    onChange={(e) => handleDomainChange(key, e.target.value)}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COMMODITY EXCHANGE */}
      {activeTab === 'economy' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <TrendingUp size={15} /> Local Commodity Exchange
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Market Availability Cap: <strong className="text-teal-300">DC {marketCap}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3">Commodity</th>
                    <th className="py-2 px-3">Base Cost</th>
                    <th className="py-2 px-3">Local Price / Ton</th>
                    <th className="py-2 px-3">Market Status</th>
                    <th className="py-2 px-3">Export Sources</th>
                    <th className="py-2 px-3">Import Demand</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {commodityExchange.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-bold text-slate-200">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{item.baseCost.toLocaleString()} Cr</td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={item.priceMultiplier < 1 ? 'text-emerald-400' : item.priceMultiplier > 1 ? 'text-amber-400' : 'text-slate-300'}>
                          {item.localCost.toLocaleString()} Cr
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isSource ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          item.isDemand ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {item.marketStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400">
                        {COMMODITIES_CATALOG.find(c => c.id === item.id)?.sources.join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400">
                        {COMMODITIES_CATALOG.find(c => c.id === item.id)?.demands.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROCEDURAL WORLDBUILDER */}
      {activeTab === 'generator' && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-900/80 border border-teal-500/30 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-mono font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                <Dices size={18} className="text-teal-400" />
                Procedural Planetary Synthesizer (2d6 Build Loop)
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Synthesize astrophysically grounded worlds from the void up, with automatic Faction Mandate overrides.
              </p>
            </div>

            {/* Quick Generator Triggers */}
            <div className="flex flex-wrap items-center gap-2">
              {['Independent', 'The Syndicate', 'Dracon Dynasty', 'The Coalition', 'The Outworlds', 'Ascendancy'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleProceduralGenerate(f)}
                  className="px-3 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(20,184,166,0.2)] cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>{f}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Faction Mandates Overview Table */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Faction Hard Overrides & Architectural Mandates
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px] text-slate-400">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-300">The Syndicate:</strong> Pop ≥ 8, Law ≥ 5, TL 4, Class A Starports.
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-cyan-300">Dracon Dynasty:</strong> Gov 5 (Feudal), +20% Structure Durability.
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-teal-300">The Coalition:</strong> Gov 4 or 7, Law ≤ 6 (Valued Independence).
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-rose-300">The Outworlds:</strong> TL ≤ 2, Law ≤ 3, Scrap-punk aesthetics.
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-purple-300">Ascendancy / Alterian:</strong> ML +2, psionic-resonant biospheres.
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-indigo-300">Mekan Collective:</strong> Gov 13 (Hive), TL ≥ 4, Synthetic Consensus.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetaryDesignConfigurator;
