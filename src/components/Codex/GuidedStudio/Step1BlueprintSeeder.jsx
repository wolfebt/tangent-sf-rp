import React, { useState, useMemo } from 'react';
import { Sparkles, Database, Layers, ChevronDown, ChevronRight, Copy, Search } from 'lucide-react';
import { getSynthesizerProfile } from '../../../pages/Codex/codexSynthesizerConfig';
import { findComparableCortexExemplars, buildSeedFromExemplar, resolveCatalogForDomain } from './intelligence/cortexExemplarService';

/**
 * Step1BlueprintSeeder
 * Activates three previously disconnected Cortex assets right inside Step 1 of Guided Creation:
 *  1) `matrix.archetypes` blueprint presets from `codexConfig.js`
 *  2) `CODEX_SYNTHESIZER_PROFILES` concept presets from `codexSynthesizerConfig.js`
 *  3) Live Omnicortex Exemplar Forking from `dbData`
 */
export const Step1BlueprintSeeder = ({
  matrix = {},
  domainKey = 'gear',
  formData = {},
  dbData = {},
  onApplySeed,
  isEditMode = true
}) => {
  const [isExpanded, setIsExpanded] = useState(() => !formData?.name);
  const [exemplarSearch, setExemplarSearch] = useState('');

  const matrixArchetypes = useMemo(
    () => (Array.isArray(matrix?.archetypes) ? matrix.archetypes : []),
    [matrix?.archetypes]
  );

  const synthPresets = useMemo(() => {
    try {
      const profile = getSynthesizerProfile(matrix, domainKey);
      const list = profile?.concepts || profile?.archetypes;
      if (Array.isArray(list)) {
        return list.slice(0, 6);
      }
    } catch {
      // Ignore if profile unavailable
    }
    return [];
  }, [matrix, domainKey]);

  const catalog = useMemo(
    () => resolveCatalogForDomain(domainKey, dbData),
    [domainKey, dbData]
  );

  const filteredExemplars = useMemo(() => {
    const q = exemplarSearch.trim().toLowerCase();
    if (q) {
      return catalog
        .filter((it) => {
          const hay = `${it?.name || ''} ${it?.title || ''} ${it?.category || ''} ${it?.description || ''}`.toLowerCase();
          return hay.includes(q);
        })
        .slice(0, 6)
        .map((item) => ({ item, matchReasons: ['Search Match'] }));
    }
    return findComparableCortexExemplars(formData, domainKey, dbData, 6);
  }, [exemplarSearch, catalog, formData, domainKey, dbData]);

  if (!isEditMode) return null;
  if (matrixArchetypes.length === 0 && synthPresets.length === 0 && catalog.length === 0) return null;

  const handleSelectMatrixArchetype = (arch) => {
    const presetValues = arch.values || arch.defaults || arch.data || {};
    onApplySeed({
      ...formData,
      ...presetValues,
      name: formData.name || arch.name || arch.label || '',
      description: formData.description || arch.description || arch.prompt || ''
    });
  };

  const handleSelectSynthPreset = (preset) => {
    const defaults = preset.presetParams || preset.defaults || preset.values || {};
    onApplySeed({
      ...formData,
      ...defaults,
      name: formData.name || preset.suggestedName || preset.label || preset.name || '',
      description: formData.description || preset.prompt || preset.description || preset.promptHint || ''
    });
  };

  const handleForkExemplar = (exemplar) => {
    const seeded = buildSeedFromExemplar(exemplar, formData, { overwriteIdentity: !formData.name });
    onApplySeed(seeded);
  };

  return (
    <div className="bg-slate-950/80 border border-cyan-500/35 rounded-2xl overflow-hidden shadow-inner">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-2.5 flex items-center justify-between gap-3 bg-gradient-to-r from-cyan-950/45 via-slate-950 to-purple-950/35 hover:from-cyan-950/65 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 text-left">
          <Sparkles size={15} className="text-cyan-400 shrink-0" />
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-200">
              Cortex Blueprint & Exemplar Seeder
            </span>
            <span className="hidden sm:inline text-[11px] font-mono text-slate-400 ml-2">
              • Quick-start from canonical templates or fork one of {catalog.length} Cortex records
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown size={15} className="text-cyan-400 shrink-0" />
        ) : (
          <ChevronRight size={15} className="text-slate-400 shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-slate-800/80 animate-fade-in">
          {/* 1. Matrix Archetypes + Synthesizer Blueprints */}
          {(matrixArchetypes.length > 0 || synthPresets.length > 0) && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-300">
                <Layers size={12} />
                <span>Canonical Archetype Templates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {matrixArchetypes.map((arch, idx) => (
                  <button
                    key={`m-arch-${arch.id || arch.name || idx}`}
                    type="button"
                    onClick={() => handleSelectMatrixArchetype(arch)}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400/60 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-mono font-bold text-amber-200 group-hover:text-amber-100 truncate">
                      {arch.name || arch.label}
                    </div>
                    {(arch.description || arch.prompt) && (
                      <div className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {arch.description || arch.prompt}
                      </div>
                    )}
                  </button>
                ))}

                {matrixArchetypes.length === 0 &&
                  synthPresets.map((preset, idx) => (
                    <button
                      key={`s-arch-${preset.id || preset.label || idx}`}
                      type="button"
                      onClick={() => handleSelectSynthPreset(preset)}
                      className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400/60 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-mono font-bold text-purple-200 group-hover:text-purple-100 truncate">
                        {preset.label || preset.name}
                      </div>
                      {(preset.description || preset.subtitle) && (
                        <div className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {preset.description || preset.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* 2. Fork from Live Omnicortex Exemplar */}
          {catalog.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                  <Database size={12} />
                  <span>Fork from Canonical Omnicortex Exemplar ({catalog.length} available)</span>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={exemplarSearch}
                    onChange={(e) => setExemplarSearch(e.target.value)}
                    placeholder="Filter Cortex exemplars..."
                    className="w-full pl-7 pr-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {filteredExemplars.map(({ item, matchReasons }) => {
                  const exName = item.name || item.title || item.id;
                  return (
                    <button
                      key={item.id || exName}
                      type="button"
                      onClick={() => handleForkExemplar(item)}
                      className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group flex flex-col justify-between gap-1.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-cyan-200 truncate">
                            {exName}
                          </span>
                          <Copy size={11} className="text-slate-500 group-hover:text-cyan-400 shrink-0" />
                        </div>
                        {item.description && (
                          <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {matchReasons && matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {matchReasons.map((r) => (
                            <span
                              key={r}
                              className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-cyan-300"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Step1BlueprintSeeder);
