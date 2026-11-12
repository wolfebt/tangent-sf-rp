import React, { useMemo } from 'react';
import { Code, Calculator, Layers } from 'lucide-react';
import { findReverseCortexDependencies } from '../../../components/Codex/GuidedStudio/intelligence/cortexExemplarService';

/**
 * DevParameterConfigurator
 * Unified parameter studio for all 21+ `DEVELOPMENT_FIELDS_REGISTRY` reference tables
 * (`area`, `effect`, `range`, `target`, `critical_*`, `material`, `resistance`, `mode`,
 * `special`, `availability`, `gear_category`, `classification`, `creator`, `design`,
 * `component`, `prerequisite`, `modifier`, `augmentation_type`, `body_location`).
 */
export const DevParameterConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  dbData = {},
  domainKey = 'modifier',
  stepSection = 'all'
}) => {
  const showToken = stepSection === 'all' || stepSection === 'token';
  const showDeltas = stepSection === 'all' || stepSection === 'deltas';

  const reverseDeps = useMemo(
    () => findReverseCortexDependencies(formData, domainKey, dbData, 16),
    [formData, domainKey, dbData]
  );

  const cleanLabel = domainKey.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="space-y-4 font-mono">
      {showToken && (
        <div className="p-4 bg-slate-950/80 border border-cyan-500/35 rounded-2xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Code size={14} />
              <span>{cleanLabel} — System Token Specification</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300">
              Schema: {domainKey}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Parent Asset Scope</label>
              <input
                type="text"
                disabled={!isEditMode}
                value={formData.scope || formData.category || 'Universal Hardware & Metaphysics'}
                onChange={(e) => onChange('scope', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Minimum Tech / Meta Gate</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  max={5}
                  disabled={!isEditMode}
                  value={formData.tech_level ?? 0}
                  onChange={(e) => onChange('tech_level', parseInt(e.target.value, 10) || 0)}
                  placeholder="TL 0-5"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
                />
                <input
                  type="number"
                  min={0}
                  max={5}
                  disabled={!isEditMode}
                  value={formData.meta_level ?? 0}
                  onChange={(e) => onChange('meta_level', parseInt(e.target.value, 10) || 0)}
                  placeholder="ML 0-5"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-purple-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeltas && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Calculator size={14} />
            <span>CR / Cost Delta, Socket Weight & Mechanical Effect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-amber-300 uppercase">CR / DC Offset (+/-)</label>
              <input
                type="number"
                disabled={!isEditMode}
                value={formData.dc_modifier ?? formData.cr_delta ?? formData.dc_mod ?? 0}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10) || 0;
                  onChange('dc_modifier', v);
                  onChange('cr_delta', v);
                }}
                className="w-full p-2.5 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-amber-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-cyan-300 uppercase">Socket / Node Weight</label>
              <input
                type="number"
                step="0.5"
                disabled={!isEditMode}
                value={formData.socket_cost ?? formData.node_cost ?? 0}
                onChange={(e) => onChange('socket_cost', parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-emerald-300 uppercase">Value / Stat Multiplier</label>
              <input
                type="number"
                step="0.05"
                disabled={!isEditMode}
                value={formData.multiplier ?? 1}
                onChange={(e) => onChange('multiplier', parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 uppercase">
              Exact Mechanical Effect When Attached
            </label>
            <textarea
              rows={3}
              disabled={!isEditMode}
              value={formData.mechanic || ''}
              onChange={(e) => onChange('mechanic', e.target.value)}
              placeholder="Describe exact effect on strike, damage, penetration, DR, range, or UDU capacity..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
            />
          </div>
        </div>
      )}

      {/* Reverse Cortex Dependency Graph */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-cyan-300 uppercase">
            <Layers size={13} />
            <span>Reverse Omnicortex Dependency Graph</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-emerald-300">
            {reverseDeps.totalCount} Linked Record{reverseDeps.totalCount === 1 ? '' : 's'}
          </span>
        </div>

        {reverseDeps.totalCount === 0 ? (
          <p className="text-[11px] text-slate-400 font-sans">
            No existing Omnicortex entries currently reference this token by name or ID.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {reverseDeps.sampleMatches.map((m) => (
              <span
                key={`${m.collection}-${m.id}`}
                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-200"
              >
                {m.name} <span className="text-slate-500">({m.collection})</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(DevParameterConfigurator);
