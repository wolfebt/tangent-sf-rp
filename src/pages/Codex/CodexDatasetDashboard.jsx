import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Eye, 
  Bot, 
  Cpu, 
  Layers, 
  LayoutGrid, 
  Table, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Calculator, 
  ShieldAlert, 
  TrendingUp,
  Info
} from 'lucide-react';
import { getGuidanceForDataset } from './codexDatasetGuidance';
import { CodexTooltip } from '../../components/UI/CodexTooltip';
import { AudioService } from '../../services/audioService';
import * as econEngine from '../../engines/tangentEconEngine';

export const CodexDatasetDashboard = ({
  matrix,
  records = [],
  onOpenBuilder,
  onEditItem,
  onDuplicateItem,
  onDeleteItem,
  onOpenAiSynthesizer,
  onOpenIngestion
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tlFilter, setTlFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [sandboxDc, setSandboxDc] = useState(18);

  const guidance = useMemo(() => getGuidanceForDataset(matrix.id), [matrix.id]);
  const isProperty = guidance?.isProperty ?? (matrix.computedOutputs && matrix.computedOutputs.length > 0);

  // Dynamic Intelligence KPIs
  const kpis = useMemo(() => {
    const total = records.length;
    const tlCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumCost = 0;
    let costCount = 0;
    let sumDc = 0;
    let dcCount = 0;

    records.forEach(r => {
      const tl = r.tl ?? r.tech_level ?? 0;
      if (tlCounts[tl] !== undefined) tlCounts[tl]++;
      
      const cost = r.costs?.credits ?? r.cost ?? r.price;
      if (cost !== undefined && !isNaN(Number(cost))) {
        sumCost += Number(cost);
        costCount++;
      }

      const dc = r.craft_dc ?? r.design_dc;
      if (dc !== undefined && !isNaN(Number(dc))) {
        sumDc += Number(dc);
        dcCount++;
      }
    });

    return {
      total,
      tlCounts,
      avgCost: costCount > 0 ? Math.round(sumCost / costCount) : 0,
      avgDc: dcCount > 0 ? Math.round((sumDc / dcCount) * 10) / 10 : 0
    };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      if (tlFilter !== 'ALL') {
        const itemTl = String(item.tl ?? item.tech_level ?? 0);
        if (itemTl !== tlFilter) return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const name = (item.name || item.title || '').toLowerCase();
      const desc = (item.description || item.mechanic || '').toLowerCase();
      const cat = (item.category || item.type || '').toString().toLowerCase();
      return name.includes(term) || desc.includes(term) || cat.includes(term);
    });
  }, [records, tlFilter, searchTerm]);

  // Formula sandbox for property matrices
  const sandboxCalculations = useMemo(() => {
    if (!isProperty) return null;
    const creditVal = econEngine.calculateCreditValue(sandboxDc);
    const materialCost = econEngine.calculateMaterialCost(creditVal);
    const ws = sandboxDc;
    const tier = econEngine.getComplexityTier(sandboxDc);
    return { creditVal, materialCost, ws, tier };
  }, [isProperty, sandboxDc]);

  const Icon = matrix.icon;

  return (
    <div className="space-y-5 select-none font-sans text-slate-100">
      
      {/* 1. Dynamic Intelligence KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Verified Records</span>
            <Layers size={14} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white mt-1">
            {kpis.total}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Stored in {matrix.targetCollection}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Tech Distribution</span>
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {Object.entries(kpis.tlCounts).map(([tl, count]) => (
              <span 
                key={tl} 
                className={`text-[9px] font-mono px-1 py-0.5 rounded ${count > 0 ? 'bg-amber-500/20 text-amber-300 font-bold' : 'bg-slate-950 text-slate-600'}`}
                title={`TL${tl}: ${count} records`}
              >
                T{tl}:{count}
              </span>
            ))}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            TL0 primitive to TL5 quantum
          </div>
        </div>

        {isProperty ? (
          <>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                <span>Avg Market Value</span>
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                {kpis.avgCost.toLocaleString()} <span className="text-xs font-normal text-slate-400">Cr</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Tangent Standard Curve (TSC)
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                <span>Avg Crafting DC</span>
                <Calculator size={14} className="text-purple-400" />
              </div>
              <div className="text-2xl font-mono font-extrabold text-purple-300 mt-1">
                DC {kpis.avgDc}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Fabrication Benchmark
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                <span>Domain Standard</span>
                <BookOpen size={14} className="text-blue-400" />
              </div>
              <div className="text-base font-mono font-bold text-blue-300 mt-1 truncate">
                {matrix.category || 'Non-Property'}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Point-Buy / Canonical Rules
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                <span>Domain Status</span>
                <Sparkles size={14} className="text-cyan-400" />
              </div>
              <div className="text-base font-mono font-bold text-cyan-300 mt-1">
                Active Catalog
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Full Schema Compliant
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. Interactive Section Guidance Hub (Collapsible) */}
      {guidance && (
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg transition-all">
          <div 
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setIsGuidanceOpen(prev => !prev);
            }}
            className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: `${matrix.color}20`, color: matrix.color }}
              >
                <BookOpen size={14} />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span>{guidance.title} — Canonical Rules &amp; Section Manual</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                    BASTION Verified
                  </span>
                </span>
              </div>
            </div>

            <button type="button" className="text-slate-400 hover:text-white p-1">
              {isGuidanceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {isGuidanceOpen && (
            <div className="p-4 sm:p-5 space-y-4 animate-fade-in text-xs font-mono">
              <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                {guidance.overview}
              </p>

              {/* Canonical Rules Badges */}
              {Array.isArray(guidance.canonicalRules) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                  {guidance.canonicalRules.map(rule => (
                    <div key={rule.id} className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase">
                        <span>{rule.id}</span>
                        <span>{rule.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-normal">
                        {rule.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Section-by-Section Accordion */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Included Guidance for Each Section:
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                  {guidance.sections?.map(sec => {
                    const isExpanded = activeSectionId === sec.id;
                    return (
                      <div 
                        key={sec.id}
                        className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                            <Sparkles size={12} className="text-amber-400" />
                            <span>{sec.name}</span>
                          </span>
                          {sec.formula && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                              Formula
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          {sec.description}
                        </p>

                        {sec.formula && (
                          <div className="p-1.5 bg-slate-950 rounded-lg text-[10px] text-cyan-300 font-mono border border-slate-800">
                            {sec.formula}
                          </div>
                        )}

                        {Array.isArray(sec.tips) && sec.tips.length > 0 && (
                          <ul className="space-y-1 pt-1 text-[10px] text-slate-300 list-disc list-inside">
                            {sec.tips.map((tip, idx) => (
                              <li key={idx} className="font-sans leading-snug">{tip}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Formula Sandbox (For Property Matrices) */}
              {isProperty && sandboxCalculations && (
                <div className="mt-3 p-3 bg-slate-900/90 border border-amber-500/40 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                      <Calculator size={14} />
                      <span>Live Crafting &amp; Valuation Simulator (Property Rule)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Adjust Crafting DC to preview real-time Tangent Standard Curve results:
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-mono">DC:</span>
                      <input 
                        type="range"
                        min="5"
                        max="40"
                        value={sandboxDc}
                        onChange={(e) => setSandboxDc(Number(e.target.value))}
                        className="w-28 accent-amber-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-amber-300 font-mono w-6">{sandboxDc}</span>
                    </div>

                    <div className="flex items-center gap-2 pl-3 border-l border-slate-700 text-xs font-mono">
                      <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        <span className="text-slate-400 text-[9px] block">VALUE</span>
                        <span className="text-emerald-400 font-bold">{sandboxCalculations.creditVal.toLocaleString()} Cr</span>
                      </div>
                      <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        <span className="text-slate-400 text-[9px] block">MATERIAL</span>
                        <span className="text-cyan-400 font-bold">{sandboxCalculations.materialCost.toLocaleString()} Cr</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Records Filter & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${matrix.name.toLowerCase()}...`}
              className="pl-8 pr-3 py-1.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono w-44 sm:w-60 shadow-inner"
            />
            <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
          </div>

          {/* Tech Level Chips */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-0.5 text-[10px] font-mono">
            {['ALL', '0', '1', '2', '3', '4', '5'].map((tl) => (
              <button
                key={tl}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(950, 0.02);
                  setTlFilter(tl);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all font-bold uppercase cursor-pointer ${
                  tlFilter === tl
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tl === 'ALL' ? 'All TL' : `TL${tl}`}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Clean Data Table View"
          >
            <Table size={14} />
          </button>
        </div>
      </div>

      {/* 4. Records View (Cards or Clean Table) */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <Icon size={24} />
          </div>
          <p className="text-slate-400 text-sm font-mono">
            No entries found in {matrix.name} matching your search filter.
          </p>
          <button
            type="button"
            onClick={onOpenBuilder}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus size={14} />
            <span>+ Build First {matrix.name} Blueprint</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredRecords.map((item) => {
            const tl = item.tl ?? item.tech_level ?? 0;
            const cost = item.costs?.credits ?? item.cost ?? item.price;
            const dc = item.craft_dc ?? item.design_dc;

            return (
              <div
                key={item.id}
                onClick={() => onEditItem(item)}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer shadow-md relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-slate-950 text-amber-400 border border-slate-800">
                          TL {tl}
                        </span>
                        {item.faction_skin && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded text-slate-400 bg-slate-950 truncate max-w-[100px]">
                            {item.faction_skin}
                          </span>
                        )}
                        {item.cp !== undefined && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-blue-950 text-blue-300 border border-blue-500/30">
                            {item.cp} CP
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors truncate font-mono">
                        {item.name || item.title || 'Untitled Blueprint'}
                      </h3>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateItem(item);
                        }}
                        className="p-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                        title="Duplicate Variant"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item);
                        }}
                        className="p-1 rounded-lg bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-300"
                        title="Delete Blueprint"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description || item.mechanic || item.body || 'No description logged in Omnicortex.'}
                  </p>
                </div>

                {/* Footer specs */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  {isProperty ? (
                    <>
                      <span>{cost ? `${Number(cost).toLocaleString()} Cr` : '0 Cr'}</span>
                      <span>{dc ? `DC ${dc}` : ''}</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate">{item.type || item.category || 'Standard'}</span>
                      <span className="text-cyan-400 group-hover:underline">Inspect Matrix ➔</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean Data Table */
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Designation / Name</th>
                <th className="p-3">Tech Level</th>
                <th className="p-3">Category / Type</th>
                {isProperty && <th className="p-3">Market Value</th>}
                {isProperty && <th className="p-3">Craft DC</th>}
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((item) => (
                <tr 
                  key={item.id}
                  onClick={() => onEditItem(item)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-slate-200 hover:text-amber-300">
                    {item.name || item.title || 'Untitled'}
                  </td>
                  <td className="p-3 text-amber-400">
                    TL {item.tl ?? item.tech_level ?? 0}
                  </td>
                  <td className="p-3 text-slate-400">
                    {item.type || item.category || 'Standard'}
                  </td>
                  {isProperty && (
                    <td className="p-3 text-emerald-400 font-bold">
                      {item.costs?.credits ?? item.cost ? `${Number(item.costs?.credits ?? item.cost).toLocaleString()} Cr` : '—'}
                    </td>
                  )}
                  {isProperty && (
                    <td className="p-3 text-purple-300">
                      {item.craft_dc ?? item.design_dc ? `DC ${item.craft_dc ?? item.design_dc}` : '—'}
                    </td>
                  )}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300"
                        title="Edit in Studio"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicateItem(item)}
                        className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                        title="Duplicate"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item)}
                        className="p-1 rounded bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CodexDatasetDashboard;
