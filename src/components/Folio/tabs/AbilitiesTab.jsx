import React from 'react';
import { useFolio } from '../../../context/FolioContext';

const AbilitiesTab = ({ onOpenSelectorModal }) => {
  const { characterData, updateField, economyBreakdown } = useFolio();

  const getItemList = (key) => {
    const data = characterData[key];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim()) {
      try {
        return JSON.parse(data);
      } catch {
        return [data];
      }
    }
    return [];
  };

  const removeItem = (key, index) => {
    const list = getItemList(key);
    const updated = list.filter((_, i) => i !== index);
    updateField(key, updated);
  };

  const renderSection = (title, key, browsePath, filterCategory = null, filterCategoryExclude = null) => {
    const list = getItemList(key);

    return (
      <div className="bg-slate-900/60 border border-cyan-900/50 rounded-lg p-4 space-y-3 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              {title}
            </h4>
          </div>

          {list.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-2 text-center">
              No items selected
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {list.map((item, index) => {
                const name = typeof item === 'object' ? item.name : item;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-800/60 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <span className="font-medium truncate mr-2">{name}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(key, index)}
                      className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1 transition-colors"
                      title="Remove item"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenSelectorModal(key, title, browsePath, filterCategory, filterCategoryExclude)}
          className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
        >
          + Add {title.replace(/s$/, '')}
        </button>
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Features */}
        {renderSection('Features', 'features', 'features', null, 'Special Ability')}

        {/* Disadvantages */}
        {renderSection('Disadvantages', 'disadvantages', 'disadvantages')}

        {/* Augmentations */}
        {renderSection('Augmentations', 'augmentations', 'augmentations')}

        {/* Awakened / Disciplines */}
        {renderSection('Awakened Disciplines', 'awakened', 'discipline')}

        {/* Invocations */}
        {renderSection('Invocations', 'invocations', 'invocations')}

        {/* Special Abilities */}
        {renderSection('Special Abilities', 'special_abilities', 'features', 'Special Ability')}
      </div>
    </div>
  );
};

export default React.memo(AbilitiesTab);
