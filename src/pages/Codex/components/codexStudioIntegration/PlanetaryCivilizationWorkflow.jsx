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

const CANONICAL_16_DOMAINS = [
  { key: 'agriculture', name: 'Agriculture', stages: ['Hunting/Gathering', 'Farming', 'Advanced Farming', 'Terraforming', 'Planetary Engineering', 'Matter Synthesis', 'Cosmic Biosynthesis'] },
  { key: 'architecture', name: 'Architecture', stages: ['Simple Structures', 'Advanced Masonry', 'Skyscrapers', 'Smart Cities', 'Advanced Space Habitats', 'Megastructures', 'Dimensional Architecture'] },
  { key: 'biotechnology', name: 'Biotechnology', stages: ['Herbalism', 'Pharmacology', 'Early Biotech', 'Genetic Engineering', 'Gene Editing', 'Advanced Nanobio', 'Transcendent Biogenesis'] },
  { key: 'communication', name: 'Communication', stages: ['Verbal/Pictograms', 'Published Text', 'Digital Networks', 'Holographic & FTL', 'Mnemonic Transceivers', 'Quantum Signaler', 'Omnipresent Noosphere'] },
  { key: 'defense', name: 'Defense', stages: ['Fortifications', 'Bunkers & Flak', 'Missile Grids', 'Planetary Shields', 'Orbital Bastions', 'Phase-Shift Curtains', 'Reality Ward Matrices'] },
  { key: 'energy', name: 'Energy', stages: ['Biomass/Wind', 'Fossil Fuels', 'Nuclear & Renewables', 'Fusion Power', 'Antimatter', 'Zero-Point & Dark Energy', 'Stellar / Vacuum Tap'] },
  { key: 'health_medicine', legacyKey: 'medicine', name: 'Health & Medicine', stages: ['Herbal Remedies', 'Basic Pharmacology', 'Focused Medicine', 'Augmentations & Cloning', 'Clinical Immortality', 'Retro-Genetic Reengineering', 'Consciousness Continuity'] },
  { key: 'industrial_production', legacyKey: 'manufacturing', name: 'Industrial Production', stages: ['Handmade', 'Crafted Foundries', 'Mass Industrial', 'Nanotechnology', 'Programmable Material', 'Polymatter', 'Instantaneous Matter Forging'] },
  { key: 'materials', name: 'Materials', stages: ['Natural Materials', 'Synthetic Alloys', 'Advanced Composites', 'Metamaterials', 'Nanotech Assemblers', 'Polymatter', 'Exotic Femtomatter'] },
  { key: 'metaphysics', legacyKey: 'meta_sciences', name: 'Metaphysics', stages: ['Folklore', 'Early Exploration', 'Systematic Study', 'Meta-Technology', 'Advanced Research', 'Integrated Magi-Tech', 'Deific Ontological Mastery'] },
  { key: 'computation', legacyKey: 'devices', name: 'Computation', stages: ['Simple Mechanical', 'Electromechanical', 'Integrated Circuits', 'Optical & Quantum', 'Neural-Mesh Substrates', 'Holophotonics', 'Matrioshka Computation'] },
  { key: 'science', name: 'Science', stages: ['Empirical', 'Systematic', 'Modern Disciplines', 'Advanced Theories', 'Unified Theories', 'Transcendent Theories', 'Omniscient Axiom Synthesis'] },
  { key: 'society', name: 'Society', stages: ['Tribal', 'Early Civilizations', 'Modern Societies', 'Advanced System-Wide', 'Interconnected Galactic', 'Post-Scarcity Utopia', 'Ascendant Harmony'] },
  { key: 'synthetic_intelligence', name: 'Synthetic Intelligence', stages: ['None', 'Reflexive Automation', 'Reactive Devices', 'Self-Aware AI', 'Artificial General Intelligence (AGI)', 'Hyper Intellect (ASI)', 'Cosmic Sovereign Mind'] },
  { key: 'transportation', name: 'Transportation', stages: ['Wagons & Boats', 'Wind & Aircraft', 'Rollers & Chemical Rockets', 'GEV & Reaction FTL', 'Force Wave & Tangent Space', 'Contra-Grav & Spatial Gateways', 'Instantaneous Fold Transit'] },
  { key: 'weaponry', name: 'Weaponry', stages: ['Melee & Bows', 'Gunpowder & Cannons', 'Modern Firearms & Missiles', 'Directed Energy & Railguns', 'Nanotech Force Weapons', 'Gravitonic Disintegration', 'Ontological Erasure'] }
];

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
  // Initial 16 Canonical Civilization Domains
  const initialDomains = useMemo(() => {
    const base = {
      agriculture: 3,
      architecture: 3,
      biotechnology: 3,
      communication: 3,
      defense: 3,
      energy: 3,
      health_medicine: 3,
      industrial_production: 3,
      materials: 3,
      metaphysics: 1,
      computation: 3,
      science: 3,
      society: 3,
      synthetic_intelligence: 2,
      transportation: 3,
      weaponry: 3
    };
    const raw = formData.civilization_domains && typeof formData.civilization_domains === 'object'
      ? formData.civilization_domains
      : {};
    const merged = { ...base };
    CANONICAL_16_DOMAINS.forEach(({ key, legacyKey }) => {
      if (raw[key] !== undefined) {
        merged[key] = Number(raw[key]);
      } else if (legacyKey && raw[legacyKey] !== undefined) {
        merged[key] = Number(raw[legacyKey]);
      }
      if (legacyKey) {
        merged[legacyKey] = merged[key];
      }
    });
    return merged;
  }, [formData.civilization_domains]);

  const [domainRatings, setDomainRatings] = useState(initialDomains);
  const [selectedTradeCodes, setSelectedTradeCodes] = useState(
    Array.isArray(formData.trade_codes) ? formData.trade_codes : ['In', 'Rich']
  );

  const handleDomainChange = (domainKey, val) => {
    const clamped = Math.max(0, Math.min(6, Number(val) || 0));
    const def = CANONICAL_16_DOMAINS.find(d => d.key === domainKey);
    setDomainRatings(prev => {
      const next = { ...prev, [domainKey]: clamped };
      if (def?.legacyKey) next[def.legacyKey] = clamped;
      return next;
    });
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

  // 16-Domain Radar Polygon calculation
  const radarPoints = useMemo(() => {
    const count = 16;
    const center = 140;
    const maxRadius = 100;

    const points = CANONICAL_16_DOMAINS.map((dom, index) => {
      const angle = (index * 2 * Math.PI) / 16 - Math.PI / 2;
      const rawScore = domainRatings[dom.key] || 0;
      const score = Math.min(1, Math.max(0, rawScore / 6));
      const r = maxRadius * score;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, key: dom.key, label: dom.name, score: rawScore, count };
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

            {/* 16 Domain Axis Spokes */}
            {radarPoints.points.map((p, i) => (
              <line
                key={i}
                x1={radarPoints.center}
                y1={radarPoints.center}
                x2={radarPoints.center + radarPoints.maxRadius * Math.cos((i * 2 * Math.PI) / 16 - Math.PI / 2)}
                y2={radarPoints.center + radarPoints.maxRadius * Math.sin((i * 2 * Math.PI) / 16 - Math.PI / 2)}
                stroke="#1e293b"
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
          16 Canonical Civilization Domain Ratings (0 to 6):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {CANONICAL_16_DOMAINS.map((def) => {
            const val = domainRatings[def.key] || 0;
            return (
              <div key={def.key} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold uppercase text-[11px] truncate">{def.name}</span>
                  <span className="text-emerald-400 font-extrabold px-1.5 py-0.2 bg-emerald-950 rounded border border-emerald-500/40">
                    Stage {val}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={val}
                  onChange={(e) => handleDomainChange(def.key, e.target.value)}
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
