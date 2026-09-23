import React, { useState, useMemo } from 'react';
import {
  Globe,
  TrendingUp,
  Boxes,
  Zap,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Compass
} from 'lucide-react';
import {
  CIVILIZATION_DOMAINS_DETAILED,
  CIVILIZATION_ARCHETYPES,
  TRADE_CODE_DEFINITIONS,
  COMMODITIES_CATALOG
} from '../../../../engines/tangentConstants';
import { AudioService } from '../../../../services/audioService';

/**
 * PlanetaryCivilizationWorkflow
 * Integrates 16-Domain Civilizational profiling, Civilization Archetypes, and World Trade Codes
 * directly into the Planetary Design, Species, and Factions Asset Studios.
 */
export const PlanetaryCivilizationWorkflow = ({
  matrix,
  formData = {},
  onChange,
  isEditMode = true
}) => {
  // Initial domains
  const initialDomains = useMemo(() => {
    const base = {
      agriculture: 3,
      architecture: 3,
      biotechnology: 3,
      commerce: 3,
      communication: 3,
      devices: 3,
      education: 3,
      energy: 3,
      manufacturing: 3,
      materials: 3,
      medicine: 3,
      meta_sciences: 1,
      science: 3,
      society: 3,
      synthetic_intelligence: 2,
      transportation: 3,
      weaponry: 3
    };
    if (formData.civilization_domains && typeof formData.civilization_domains === 'object') {
      return { ...base, ...formData.civilization_domains };
    }
    return base;
  }, [formData.civilization_domains]);

  const [domainRatings, setDomainRatings] = useState(initialDomains);
  const [selectedTradeCodes, setSelectedTradeCodes] = useState(
    Array.isArray(formData.trade_codes) ? formData.trade_codes : ['In', 'Rich']
  );

  const handleDomainChange = (domainKey, val) => {
    setDomainRatings(prev => ({
      ...prev,
      [domainKey]: Math.max(0, Math.min(5, Number(val) || 0))
    }));
  };

  // Matched Civilization Archetype
  const civArchetype = useMemo(() => {
    for (const arch of CIVILIZATION_ARCHETYPES) {
      const keys = Object.keys(arch.threshold || {});
      if (keys.length === 0) continue;
      const matches = keys.every(k => (domainRatings[k] || 0) >= arch.threshold[k]);
      if (matches) return arch;
    }
    return CIVILIZATION_ARCHETYPES[CIVILIZATION_ARCHETYPES.length - 1];
  }, [domainRatings]);

  // Radar Polygon calculation
  const radarPoints = useMemo(() => {
    const domains = Object.keys(CIVILIZATION_DOMAINS_DETAILED);
    const count = domains.length;
    const center = 140;
    const maxRadius = 100;

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

  // Trade Code Toggle
  const handleToggleTradeCode = (code) => {
    setSelectedTradeCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      }
      return [...prev, code];
    });
  };

  // Commit handler
  const handleApplyProfile = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    if (!onChange) return;
    onChange('civilization_domains', domainRatings);
    onChange('civilization_archetype', civArchetype.name);
    onChange('trade_codes', selectedTradeCodes);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans select-none animate-fade-in">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-500/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-md">
            <Globe size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                BASTION Domain 10.4
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs font-mono text-slate-400">16-Domain Civilization Profiler</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold font-mono uppercase text-white mt-0.5">
              {matrix.name} Civilizational Domains & Trade Codes
            </h3>
          </div>
        </div>

        {isEditMode && (
          <button
            type="button"
            onClick={handleApplyProfile}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            title="Write civilization profile to blueprint"
          >
            <Sparkles size={13} />
            <span>Apply Profile to World</span>
          </button>
        )}
      </div>

      {/* Main Grid: Radar Chart + Archetype Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar SVG Display */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-xs font-mono font-bold uppercase text-emerald-300 self-start mb-2">
            16-Domain Civilizational Radar
          </span>
          <svg width="280" height="280" className="overflow-visible">
            {/* Background concentric circles */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((ring, idx) => (
              <circle
                key={idx}
                cx={radarPoints.center}
                cy={radarPoints.center}
                r={radarPoints.maxRadius * ring}
                fill="none"
                stroke="#334155"
                strokeDasharray="2,2"
                strokeWidth="1"
              />
            ))}

            {/* Radar polygon */}
            <polygon
              points={radarPoints.polygonPoints}
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10b981"
              strokeWidth="2"
            />

            {/* Radar nodes */}
            {radarPoints.points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#34d399"
                stroke="#064e3b"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {/* Matched Civilization Archetype */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
              Matched Civilizational Archetype:
            </span>
            <div className="text-base font-extrabold font-mono text-white uppercase flex items-center gap-2">
              <Compass size={16} className="text-emerald-400" />
              <span>{civArchetype.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {civArchetype.description}
            </p>
          </div>

          {/* Trade Codes Selection */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <span className="text-xs font-mono font-bold uppercase text-amber-300 block">
              Planetary Trade Codes:
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {Object.entries(TRADE_CODE_DEFINITIONS || {}).map(([code, def]) => {
                const isSelected = selectedTradeCodes.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleToggleTradeCode(code)}
                    className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-slate-950 border-amber-400 font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {code} ({def.name})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 16 Domains Interactive Sliders */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
        <span className="text-xs font-mono font-bold uppercase text-slate-300 block">
          Individual Domain Ratings (0 to 5):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {Object.entries(CIVILIZATION_DOMAINS_DETAILED).map(([key, def]) => {
            const val = domainRatings[key] || 0;
            return (
              <div key={key} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold uppercase text-[11px] truncate">{def.name}</span>
                  <span className="text-emerald-400 font-extrabold px-1.5 py-0.2 bg-emerald-950 rounded border border-emerald-500/40">
                    Stage {val}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={val}
                  onChange={(e) => handleDomainChange(key, e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block truncate">
                  {def.stages[val] || `Stage ${val}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlanetaryCivilizationWorkflow);
