import React, { useMemo } from 'react';
import { Sparkles, Flame, Wand2 } from 'lucide-react';
import { CortexSmartPicker } from '../../../components/Codex/GuidedStudio/CortexSmartPicker';

const TRIAD_SKILLS = ['Attune', 'Channeling', 'Alteration'];

/**
 * DisciplineConfigurator
 * Specialized configurator for the 6 Canonical Metaphysical Disciplines (Operator Guide 4.00):
 * Dimension, Energy, Entropy, Illusion, Matter, and Mental.
 */
export const DisciplineConfigurator = ({
  formData = {},
  onChange,
  isEditMode = true,
  onOpenPicker = null,
  dbData = {},
  stepSection = 'all'
}) => {
  const showDomain = stepSection === 'all' || stepSection === 'domain';
  const showProgression = stepSection === 'all' || stepSection === 'progression';

  const mlLadder =
    typeof formData.ml_progression === 'object' && formData.ml_progression !== null
      ? formData.ml_progression
      : {};

  const boundInvocations = useMemo(() => {
    const invs = dbData?.invocations || [];
    const selfName = String(formData.name || '').trim().toLowerCase();
    if (!selfName || !Array.isArray(invs)) return [];
    return invs.filter((iv) => String(iv?.discipline || '').toLowerCase().includes(selfName));
  }, [dbData?.invocations, formData.name]);

  return (
    <div className="space-y-4 font-mono">
      {showDomain && (
        <div className="p-4 bg-slate-950/80 border border-purple-500/35 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Metaphysics Triad Domain & Governing Attributes</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] text-purple-200">
              Discipline Unlock = 3 CP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Primary Triad Meta-Skill</label>
              <select
                disabled={!isEditMode}
                value={formData.meta_skill || TRIAD_SKILLS[1]}
                onChange={(e) => onChange('meta_skill', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-purple-200"
              >
                {TRIAD_SKILLS.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-300 uppercase">Key Mental Attribute</label>
              <select
                disabled={!isEditMode}
                value={formData.governing_attribute || 'Wisdom (WIS)'}
                onChange={(e) => onChange('governing_attribute', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                <option value="Intellect (INT)">Intellect (INT)</option>
                <option value="Wisdom (WIS)">Wisdom (WIS)</option>
                <option value="Charisma (CHA)">Charisma (CHA)</option>
              </select>
            </div>
          </div>

          <CortexSmartPicker
            label="Associated Damage & Effect Vectors"
            sourceCollection="damage_types"
            value={formData.damage_vectors}
            valueFormat="array"
            onChange={(val) => onChange('damage_vectors', val)}
            formData={formData}
            dbData={dbData}
            isEditMode={isEditMode}
            onOpenPicker={onOpenPicker}
            accentColor="#a855f7"
            placeholder="E.g., Force, Fire, Voltic, Mental..."
          />
        </div>
      )}

      {showProgression && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Flame size={14} />
            <span>Meta Level (ML 1–5) Reality Manipulation Ladder</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              { key: 'ml1', label: 'ML 1 — Latent / Awakened', placeholder: 'Sensory attunement, minor micro-kinesis...' },
              { key: 'ml2', label: 'ML 2 — Adept / Practitioner', placeholder: 'Active tactical shielding, focused rays...' },
              { key: 'ml3', label: 'ML 3 — Master / Sorcerer', placeholder: 'Area weaves, gravimetric/spatial shifts...' },
              { key: 'ml4', label: 'ML 4 — High Sorcery / Archon', placeholder: 'Molecular transmutation, wide-area warp...' },
              { key: 'ml5', label: 'ML 5 — Cosmic / Planar', placeholder: 'Planetary-scale convergence phenomena...' }
            ].map((tier) => (
              <div key={tier.key} className="grid grid-cols-1 sm:grid-cols-[190px_1fr] items-center gap-2">
                <label className="text-[10.5px] font-bold text-purple-300 uppercase">{tier.label}</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={mlLadder[tier.key] || ''}
                  onChange={(e) =>
                    onChange('ml_progression', {
                      ...mlLadder,
                      [tier.key]: e.target.value
                    })
                  }
                  placeholder={tier.placeholder}
                  className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
                />
              </div>
            ))}
          </div>

          {boundInvocations.length > 0 && (
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-cyan-300 font-bold uppercase flex items-center gap-1 mr-1">
                <Wand2 size={11} />
                <span>{boundInvocations.length} Canonical Invocations Bound:</span>
              </span>
              {boundInvocations.slice(0, 8).map((iv) => (
                <span
                  key={iv.id || iv.name}
                  className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/35 text-[10px] text-purple-200"
                >
                  {iv.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(DisciplineConfigurator);
