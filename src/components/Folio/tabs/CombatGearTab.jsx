import React, { useState } from 'react';
import { useFolio } from '../../../context/FolioContext';

const PROPERTY_TABS = [
  { id: 'gear', label: 'Gear', title: 'Gear', key: 'gear', dbPath: 'gear' },
  { id: 'weapons', label: 'Weapons', title: 'Weapons', key: 'weapons', dbPath: 'weaponry' },
  { id: 'armor', label: 'Armor', title: 'Armor', key: 'armoring', dbPath: 'armoring' },
  { id: 'mecha', label: 'Mecha', title: 'Mecha', key: 'mecha', dbPath: 'mecha' },
  { id: 'other', label: 'Other', title: 'Other', key: 'other', dbPath: 'other' }
];

const CombatGearTab = ({ onOpenSelectorModal, onOpenAssetModal }) => {
  const { characterData, updateField } = useFolio();

  const [combatTab, setCombatTab] = useState('offensive'); // 'offensive' | 'defensive'
  const [propertyTab, setPropertyTab] = useState('gear'); // 'gear' | 'weapons' | 'armor' | 'mecha' | 'other'

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

  // Generic Property / Inventory List rendering with Database Integration & Build Modals
  const renderPropertyList = (title, key, dbPath) => {
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
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2.5">
            <h5 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              {title} Inventory
            </h5>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
              {list.length} {list.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {list.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-4 text-center">
              No {title.toLowerCase()} items added
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
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

        <div className="mt-3 flex gap-2 pt-2 border-t border-slate-800/80">
          {onOpenAssetModal && (
            <button
              type="button"
              onClick={() => onOpenAssetModal(key, title, 'create', null, { category: dbPath })}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title={`Open Manage Modal to build and save a new ${title} entry in OmniCortex DB`}
            >
              <span>⚙️</span> Build {title}
            </button>
          )}
          {onOpenSelectorModal && (
            <button
              type="button"
              onClick={() => onOpenSelectorModal(key, title, dbPath)}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title={`Browse ${title} Database`}
            >
              <span>🔍</span> Browse {title} DB
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-900/60 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Combat & Tactical Systems
          </h3>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setCombatTab('offensive')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                combatTab === 'offensive'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-600/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Offensive ({attacks.length})
            </button>
            <button
              type="button"
              onClick={() => setCombatTab('defensive')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                combatTab === 'defensive'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Defensive ({armors.length})
            </button>
          </div>
        </div>

        {combatTab === 'offensive' ? (
          /* Attacks Grid */
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Offensive Attacks
              </h4>
              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenSelectorModal && (
                  <button
                    type="button"
                    onClick={() => onOpenSelectorModal('weapons', 'Offensive Weapons', 'weaponry')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    title="Browse Weapons Database"
                  >
                    <span>🔍</span> Browse DB
                  </button>
                )}
                {onOpenAssetModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAssetModal('weapons', 'Attack Weapon', 'create', null, { category: 'weaponry' })}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    title="Build Weapon in Manage Modal"
                  >
                    <span>⚙️</span> Build Weapon
                  </button>
                )}
                <button
                  type="button"
                  onClick={addAttack}
                  className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  + Add Row
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
        ) : (
          /* Armor / Defense Grid */
          <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Defensive Protections
              </h4>
              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenSelectorModal && (
                  <button
                    type="button"
                    onClick={() => onOpenSelectorModal('armoring', 'Armor & Defense', 'armoring')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    title="Browse Armor Database"
                  >
                    <span>🔍</span> Browse DB
                  </button>
                )}
                {onOpenAssetModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAssetModal('armoring', 'Armor & Defense', 'create', null, { category: 'armoring' })}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    title="Build Armor in Manage Modal"
                  >
                    <span>⚙️</span> Build Armor
                  </button>
                )}
                <button
                  type="button"
                  onClick={addArmor}
                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  + Add Row
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
        )}
      </div>

      {/* Personal Property Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-900/60 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Personal Property & Equipment Inventory
          </h3>
          <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            {PROPERTY_TABS.map((tab) => {
              const count = getArray(tab.key).length;
              const isActive = propertyTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPropertyTab(tab.id)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-slate-900 text-slate-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {(() => {
          const currentTab = PROPERTY_TABS.find((t) => t.id === propertyTab) || PROPERTY_TABS[0];
          return renderPropertyList(currentTab.title, currentTab.key, currentTab.dbPath);
        })()}
      </div>
    </div>
  );
};

export default React.memo(CombatGearTab);
