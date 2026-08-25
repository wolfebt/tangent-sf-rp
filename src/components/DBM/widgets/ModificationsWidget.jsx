import React, { useState } from 'react';
import { Wrench, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Cpu, Shield, Tag } from 'lucide-react';
import { WEAPON_MODIFICATIONS, WEAPON_DOWNGRADES } from '../../../engines/tangentConstants';

export const ModificationsWidget = ({
  modifications = [],
  onChange = () => {},
  isEditMode = true
}) => {
  const currentList = Array.isArray(modifications) ? modifications : [];

  const [modName, setModName] = useState('');
  const [modType, setModType] = useState('upgrade'); // 'upgrade' | 'downgrade' | 'module' | 'attachment' | 'skin'
  const [dcMod, setDcMod] = useState(0);
  const [sockets, setSockets] = useState(1);
  const [customDesc, setCustomDesc] = useState('');

  const handleAddModification = () => {
    const name = modName.trim();
    if (!name) {
      alert('Please enter or select a modification name.');
      return;
    }

    const newMod = {
      name,
      type: modType,
      dcMod: parseInt(dcMod, 10) || 0,
      sockets: parseInt(sockets, 10) || 0,
      description: customDesc.trim() || undefined
    };

    const updated = [...currentList, newMod];
    onChange(updated);

    // Reset inputs
    setModName('');
    setDcMod(0);
    setSockets(modType === 'downgrade' ? 0 : 1);
    setCustomDesc('');
  };

  const handleRemoveModification = (index) => {
    const updated = currentList.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handlePresetSelect = (e) => {
    const selected = e.target.value;
    if (!selected) return;

    // Check weapon mods
    const foundMod = WEAPON_MODIFICATIONS.find(m => m.name === selected || m.id === selected);
    if (foundMod) {
      setModName(foundMod.name);
      setModType('upgrade');
      setDcMod(foundMod.dcMod || 0);
      setSockets(foundMod.sockets || 1);
      setCustomDesc(foundMod.effect || '');
      return;
    }

    // Check downgrades
    const foundDowngrade = WEAPON_DOWNGRADES.find(d => d.name === selected || d.id === selected);
    if (foundDowngrade) {
      setModName(foundDowngrade.name);
      setModType('downgrade');
      setDcMod(foundDowngrade.dcMod || -2);
      setSockets(0);
      setCustomDesc(foundDowngrade.effect || '');
      return;
    }

    setModName(selected);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'downgrade':
        return {
          icon: <ArrowDownCircle size={12} className="text-rose-400" />,
          style: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
          label: 'Downgrade'
        };
      case 'module':
        return {
          icon: <Cpu size={12} className="text-purple-400" />,
          style: 'bg-purple-950/80 border-purple-500/50 text-purple-300',
          label: 'Module'
        };
      case 'attachment':
        return {
          icon: <Shield size={12} className="text-blue-400" />,
          style: 'bg-blue-950/80 border-blue-500/50 text-blue-300',
          label: 'Attachment'
        };
      case 'skin':
        return {
          icon: <Tag size={12} className="text-emerald-400" />,
          style: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
          label: 'Skin'
        };
      default:
        return {
          icon: <ArrowUpCircle size={12} className="text-amber-400" />,
          style: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          label: 'Upgrade'
        };
    }
  };

  if (!isEditMode) {
    if (currentList.length === 0) {
      return (
        <div className="text-xs text-slate-500 italic p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          No modifications or attachments installed.
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        {currentList.map((mod, idx) => {
          const badge = getTypeBadge(mod.type);
          const name = typeof mod === 'object' ? (mod.name || mod.id || 'Unnamed Mod') : String(mod);
          const dc = typeof mod === 'object' ? mod.dcMod : undefined;
          const sock = typeof mod === 'object' ? mod.sockets : undefined;

          return (
            <div
              key={idx}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 shadow-sm ${badge.style}`}
            >
              {badge.icon}
              <span className="font-bold">{name}</span>
              {dc !== undefined && dc !== 0 && (
                <span className="text-[10px] px-1 rounded bg-black/40 font-bold">
                  {dc > 0 ? `+${dc} DC` : `${dc} DC`}
                </span>
              )}
              {sock !== undefined && sock > 0 && (
                <span className="text-[10px] px-1 rounded bg-black/40 text-purple-300">
                  {sock} Sock
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Wrench size={14} />
          <span>Modifications & Attachments Array</span>
        </span>
        <span className="text-[10px] text-slate-500">
          {currentList.length} Installed
        </span>
      </div>

      {/* Existing List */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {currentList.length === 0 ? (
          <p className="text-xs text-slate-600 italic py-2">No modifications installed yet.</p>
        ) : (
          currentList.map((mod, idx) => {
            const badge = getTypeBadge(mod.type);
            const name = typeof mod === 'object' ? (mod.name || mod.id || 'Unnamed') : String(mod);
            const dc = typeof mod === 'object' ? mod.dcMod : undefined;
            const sock = typeof mod === 'object' ? mod.sockets : undefined;

            return (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {badge.icon}
                  <span className="text-white font-bold">{name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {badge.label}
                  </span>
                  {dc !== undefined && dc !== 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${dc > 0 ? 'bg-cyan-950/80 text-cyan-300' : 'bg-rose-950/80 text-rose-300'}`}>
                      {dc > 0 ? `+${dc} DC` : `${dc} DC`}
                    </span>
                  )}
                  {sock !== undefined && sock > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                      {sock} Socket{sock === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveModification(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 font-bold cursor-pointer transition-colors"
                  title="Remove modification"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modification Form */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          + Add Modification / Upgrade / Downgrade
        </div>

        {/* Quick Canonical Preset Picker */}
        <select
          onChange={handlePresetSelect}
          defaultValue=""
          className="w-full bg-slate-900 border border-slate-700 text-slate-300 p-1.5 rounded text-xs outline-none focus:border-amber-500"
        >
          <option value="">⚡ Quick Presets (Weapon / Armor Mods)...</option>
          <optgroup label="🛠️ Weapon Upgrades & Attachments">
            {WEAPON_MODIFICATIONS.map(m => (
              <option key={m.id} value={m.name}>{m.name} (+{m.dcMod} DC, {m.sockets} Sockets)</option>
            ))}
          </optgroup>
          <optgroup label="⚠️ Weapon Downgrades & Flaws">
            {WEAPON_DOWNGRADES.map(d => (
              <option key={d.id} value={d.name}>{d.name} ({d.dcMod} DC)</option>
            ))}
          </optgroup>
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          {/* Mod Type */}
          <div className="sm:col-span-3">
            <select
              value={modType}
              onChange={e => {
                const val = e.target.value;
                setModType(val);
                if (val === 'downgrade') setSockets(0);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-amber-300 p-2 rounded text-xs outline-none focus:border-amber-500 font-bold"
            >
              <option value="upgrade">⬆️ Upgrade</option>
              <option value="downgrade">⬇️ Downgrade</option>
              <option value="module">🧩 Module</option>
              <option value="attachment">🛡️ Attachment</option>
              <option value="skin">🏷️ Faction Skin</option>
            </select>
          </div>

          {/* Mod Name */}
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Modification Name..."
              value={modName}
              onChange={e => setModName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500"
            />
          </div>

          {/* DC Mod */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">DC</span>
              <input
                type="number"
                min="-20"
                max="30"
                value={dcMod}
                onChange={e => setDcMod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 font-mono text-center"
                placeholder="0"
              />
            </div>
          </div>

          {/* Sockets */}
          <div className="sm:col-span-1">
            <input
              type="number"
              min="0"
              max="10"
              value={sockets}
              onChange={e => setSockets(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-amber-500 font-mono text-center"
              placeholder="Sock"
              title="Socket consumption"
            />
          </div>

          {/* Add Button */}
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAddModification}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
