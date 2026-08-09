import React from 'react';
import { useFolio } from '../../../context/FolioContext';

const CombatGearTab = ({ onOpenSelectorModal, onOpenAssetModal }) => {
  const { characterData, updateField } = useFolio();
  const getArray = (key) => {
    const val = characterData[key];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Attack List
  const attacks = getArray('attacks');
  const addAttack = () => {
    const newAttacks = [...attacks, { name: '', score: '', damage: '', type: '', notes: '' }];
    updateField('attacks', newAttacks);
  };

  const updateAttack = (index, field, value) => {
    const updated = [...attacks];
    updated[index] = { ...updated[index], [field]: value };
    updateField('attacks', updated);
  };
  const removeAttack = (index) => {
    const atkName = attacks[index]?.name || 'Attack';
    if (!window.confirm(`Are you sure you want to delete attack "${atkName}"?`)) return;
    updateField('attacks', attacks.filter((_, i) => i !== index));
  };

  // Defense List
  const armors = getArray('armor');
  const addArmor = () => {
    const newArmors = [...armors, { name: '', resistance: '', type: '', notes: '' }];
    updateField('armor', newArmors);
  };

  const updateArmor = (index, field, value) => {
    const updated = [...armors];
    updated[index] = { ...updated[index], [field]: value };
    updateField('armor', updated);
  };
  const removeArmor = (index) => {
    const armorName = armors[index]?.name || 'Armor';
    if (!window.confirm(`Are you sure you want to delete armor entry "${armorName}"?`)) return;
    updateField('armor', armors.filter((_, i) => i !== index));
  };

  // Generic Equipment List rendering
  const renderPropertyList = (title, key, category) => {
    const list = getArray(key);
    const removeItem = (index) => {
      const item = list[index];
      const itemName = typeof item === 'object' ? (item.name || item.title || 'Item') : String(item);
      if (!window.confirm(`Are you sure you want to remove item "${itemName}"?`)) return;
      updateField(key, list.filter((_, i) => i !== index));
    };

    return (
      <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              {title}
            </h5>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
              {list.length}
            </span>
          </div>

          {list.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-2 text-center">
              No items
            </div>
          ) : (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {list.map((item, idx) => {
                const isObj = typeof item === 'object' && item !== null;
                const name = isObj ? (item.name || item.title || 'Item') : String(item);
                const cp = isObj && item.cp !== undefined ? item.cp : null;

                return (
                  <div key={idx} className="flex items-center justify-between bg-slate-800/60 border border-slate-700/80 hover:border-cyan-500/40 rounded px-2.5 py-1.5 text-xs text-slate-200 group transition-colors">
                    <div className="flex items-center gap-1.5 truncate mr-1">
                      <span className="font-medium truncate">{name}</span>
                      {cp !== null && cp > 0 && (
                        <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1 rounded font-mono font-bold shrink-0">
                          {cp} CP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {onOpenAssetModal && isObj && (
                        <button
                          type="button"
                          onClick={() => onOpenAssetModal(key, title, 'edit', idx, item)}
                          className="text-slate-400 hover:text-cyan-300 text-xs px-1"
                          title="Edit asset properties & database sync"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1 transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-2 flex gap-1.5">
          {onOpenAssetModal && (
            <button
              type="button"
              onClick={() => onOpenAssetModal(key, title, 'create', null, { category })}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              + New {title}
            </button>
          )}
          {onOpenSelectorModal && (
            <button
              type="button"
              onClick={() => onOpenSelectorModal(key, title, 'equipment', category)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
              title="Browse Database"
            >
              🔍
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-6">
      {/* Combat Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-900/60 pb-2">
          Combat & Tactical Systems
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attacks Grid */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Offensive Attacks
              </h4>
              <button
                type="button"
                onClick={addAttack}
                className="px-3 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                + Add Attack Row
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {attacks.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2 text-center">No attack entries</div>
              ) : (
                attacks.map((att, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-1.5 items-center bg-slate-950/60 p-2 rounded border border-slate-800 text-xs">
                    <input
                      type="text"
                      placeholder="Attack Name"
                      value={att.name || ''}
                      onChange={(e) => updateAttack(idx, 'name', e.target.value)}
                      className="col-span-3 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Score"
                      value={att.score || ''}
                      onChange={(e) => updateAttack(idx, 'score', e.target.value)}
                      className="col-span-2 text-center bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-1 py-1 text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Effect / Dmg"
                      value={att.damage || ''}
                      onChange={(e) => updateAttack(idx, 'damage', e.target.value)}
                      className="col-span-2 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Type"
                      value={att.type || ''}
                      onChange={(e) => updateAttack(idx, 'type', e.target.value)}
                      className="col-span-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-2 py-1 text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Notes"
                      value={att.notes || ''}
                      onChange={(e) => updateAttack(idx, 'notes', e.target.value)}
                      className="col-span-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 outline-none"
                    />
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      {onOpenAssetModal && (
                        <button
                          type="button"
                          onClick={() => onOpenAssetModal('attacks', 'Attack Weapon', 'edit', idx, att)}
                          className="text-slate-400 hover:text-cyan-300 font-bold text-xs"
                          title="Full asset edit & DB sync"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttack(idx)}
                        className="text-slate-400 hover:text-red-400 font-bold text-sm"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Armor / Defense Grid */}
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Defensive Protections
              </h4>
              <button
                type="button"
                onClick={addArmor}
                className="px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                + Add Defense Row
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {armors.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2 text-center">No defense entries</div>
              ) : (
                armors.map((arm, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-1.5 items-center bg-slate-950/60 p-2 rounded border border-slate-800 text-xs">
                    <input
                      type="text"
                      placeholder="Defense Name"
                      value={arm.name || ''}
                      onChange={(e) => updateArmor(idx, 'name', e.target.value)}
                      className="col-span-3 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Resistance"
                      value={arm.resistance || ''}
                      onChange={(e) => updateArmor(idx, 'resistance', e.target.value)}
                      className="col-span-2 text-center bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-1 py-1 text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Type"
                      value={arm.type || ''}
                      onChange={(e) => updateArmor(idx, 'type', e.target.value)}
                      className="col-span-2 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded px-2 py-1 text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Notes"
                      value={arm.notes || ''}
                      onChange={(e) => updateArmor(idx, 'notes', e.target.value)}
                      className="col-span-3 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 outline-none"
                    />
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      {onOpenAssetModal && (
                        <button
                          type="button"
                          onClick={() => onOpenAssetModal('armor', 'Armor & Defense', 'edit', idx, arm)}
                          className="text-slate-400 hover:text-cyan-300 font-bold text-xs"
                          title="Full asset edit & DB sync"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeArmor(idx)}
                        className="text-slate-400 hover:text-red-400 font-bold text-sm"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Property Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-cyan-900/60 pb-2">
          Personal Property & Equipment Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {renderPropertyList('Gear', 'gear', 'gear')}
          {renderPropertyList('Weapons', 'weapons', 'weaponry')}
          {renderPropertyList('Armor', 'armoring', 'armoring')}
          {renderPropertyList('Mecha', 'mecha', 'mecha')}
          {renderPropertyList('Other', 'other', 'other')}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CombatGearTab);
