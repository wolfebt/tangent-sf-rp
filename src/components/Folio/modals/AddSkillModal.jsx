import React, { useState } from 'react';

const AddSkillModal = ({ isOpen, onClose, onAddSkill }) => {
  const [skillName, setSkillName] = useState('');
  const [skillGroup, setSkillGroup] = useState('physical');
  const [baseAttr, setBaseAttr] = useState('attr-strength');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    onAddSkill({
      name: skillName.trim(),
      id: `${skillGroup}-${skillName.toLowerCase().replace(/\s+/g, '-')}`,
      group: skillGroup,
      baseAttr
    });

    setSkillName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121824] border border-cyan-500/60 rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Add Custom Skill Entry
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-slate-300 mb-1">
              Skill Name
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

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-slate-300 mb-1">
              Category / Group
            </label>
            <select
              value={skillGroup}
              onChange={(e) => setSkillGroup(e.target.value)}
              className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option value="physical">Physical</option>
              <option value="mental">Mental</option>
              <option value="social">Social</option>
              <option value="combat">Combat</option>
              <option value="meta">Meta</option>
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
              className="px-5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider"
            >
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(AddSkillModal);
