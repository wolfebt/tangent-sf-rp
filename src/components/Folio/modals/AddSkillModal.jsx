import React, { useState, useEffect } from 'react';

const AddSkillModal = ({
  isOpen,
  onClose,
  onAddSkill,
  onAddSpecialization,
  availableSkills = [],
  initialMode = 'custom'
}) => {
  const [mode, setMode] = useState('custom'); // 'custom' | 'specialization'

  // Custom Skill Form State
  const [skillName, setSkillName] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('physical|General');
  const [baseAttr, setBaseAttr] = useState('attr-strength');
  const [skillRank, setSkillRank] = useState(1);

  // Specialization Form State
  const [specName, setSpecName] = useState('');
  const [baseSkillId, setBaseSkillId] = useState('');
  const [specRank, setSpecRank] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === 'specialization' ? 'specialization' : 'custom');

      setSkillName('');
      setSelectedCategoryKey('physical|General');
      setBaseAttr('attr-strength');
      setSkillRank(1);

      setSpecName('');
      setSpecRank(1);
      if (availableSkills.length > 0) {
        setBaseSkillId(availableSkills[0].id);
      } else {
        setBaseSkillId('');
      }
    }
  }, [isOpen, initialMode, availableSkills]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'custom') {
      if (!skillName.trim()) return;
      const cleanName = skillName.trim();
      const [skillGroup, subcategory] = selectedCategoryKey.split('|');
      const id = `${skillGroup}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      onAddSkill({
        name: cleanName,
        id,
        group: skillGroup,
        subcategory: subcategory || 'General',
        baseAttr,
        rank: Math.min(20, Math.max(0, parseInt(skillRank, 10) || 0))
      });
    } else {
      if (!specName.trim() || !baseSkillId) return;
      const cleanName = specName.trim();
      const selectedSkill = availableSkills.find((s) => s.id === baseSkillId);
      const category = selectedSkill ? selectedSkill.group : 'general';

      onAddSpecialization({
        name: cleanName,
        baseSkillId,
        rank: Math.min(10, Math.max(0, parseInt(specRank, 10) || 0)),
        category
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-6 sm:pt-10 overflow-y-auto">
      <div className="bg-[#121824] border border-cyan-500/60 rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            {mode === 'custom' ? 'Add Custom Skill' : 'Add Specialization / Evocation'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold leading-none">
            &times;
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 pb-1 gap-1.5">
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded transition-all ${
              mode === 'custom'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Custom Skill
          </button>
          <button
            type="button"
            onClick={() => setMode('specialization')}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded transition-all ${
              mode === 'specialization'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Specialization
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'custom' ? (
            <>
              {/* Custom Skill Fields */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-300 mb-1">
                  Custom Skill Name
                </label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Plasma Weaponry, Xenobiology"
                  className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-xs font-bold uppercase text-slate-300 mb-1">
                    Category / Subcategory
                  </label>
                  <select
                    value={selectedCategoryKey}
                    onChange={(e) => setSelectedCategoryKey(e.target.value)}
                    className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    <optgroup label="Physical">
                      <option value="physical|General">Physical</option>
                    </optgroup>
                    <optgroup label="Mental">
                      <option value="mental|General">Mental - General</option>
                      <option value="mental|Knowledges">Mental - Knowledges</option>
                      <option value="mental|Vocations">Mental - Vocations</option>
                    </optgroup>
                    <optgroup label="Social">
                      <option value="social|Expression">Social - Expression</option>
                      <option value="social|Manipulation">Social - Manipulation</option>
                    </optgroup>
                    <optgroup label="Combat">
                      <option value="combat|Archaic">Combat - Archaic</option>
                      <option value="combat|Modern">Combat - Modern</option>
                      <option value="combat|Advanced">Combat - Advanced</option>
                    </optgroup>
                    <optgroup label="Metafocus">
                      <option value="meta|Disciplines">Meta - Disciplines</option>
                    </optgroup>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold uppercase text-slate-300 mb-1">
                    Base Attribute
                  </label>
                  <select
                    value={baseAttr}
                    onChange={(e) => setBaseAttr(e.target.value)}
                    className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    <option value="attr-strength">Strength (STR)</option>
                    <option value="attr-agility">Agility (AGI)</option>
                    <option value="attr-stamina">Stamina (STA)</option>
                    <option value="attr-intellect">Intellect (INT)</option>
                    <option value="attr-wisdom">Wisdom (WIS)</option>
                    <option value="attr-charisma">Charisma (CHA)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-300 mb-1">
                  Starting Rank (Max 20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={skillRank}
                  onChange={(e) => setSkillRank(Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                  className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Specialization / Evocation Fields */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-300 mb-1">
                  Linked Base Skill / Discipline
                </label>
                <select
                  value={baseSkillId}
                  required
                  onChange={(e) => setBaseSkillId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none max-h-40"
                >
                  {availableSkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.group ? `[${s.group.toUpperCase()}] ` : ''}{s.name} (Total: {s.total})
                    </option>
                  ))}
                </select>
              </div>

              {/* Metafocus Evocation Notice if linked to Meta skill */}
              {availableSkills.find((s) => s.id === baseSkillId)?.group === 'meta' && (
                <div className="px-3 py-1.5 bg-purple-950/70 border border-purple-500/40 rounded text-[11px] text-purple-300 font-mono">
                  ✨ <span className="font-bold">Metafocus Evocation:</span> Specializations linked to a Meta discipline are classified as Evocations.
                </div>
              )}

              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-300 mb-1">
                  {availableSkills.find((s) => s.id === baseSkillId)?.group === 'meta' ? 'Evocation Name' : 'Specialization Name'}
                </label>
                <input
                  type="text"
                  required
                  value={specName}
                  onChange={(e) => setSpecName(e.target.value)}
                  placeholder={availableSkills.find((s) => s.id === baseSkillId)?.group === 'meta' ? "e.g. Telekinesis, Fireball, Mind Reading" : "e.g. Parkour, Dogfighting, Sniper Rifles"}
                  className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-300 mb-1">
                  Specialization Level / Rank (Max 10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={specRank}
                  onChange={(e) => setSpecRank(Math.min(10, Math.max(0, parseInt(specRank, 10) || 0)))}
                  className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
              {mode === 'custom' ? 'Add Custom Skill' : 'Add Specialization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(AddSkillModal);
