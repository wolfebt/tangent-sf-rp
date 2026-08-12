import React, { useState } from 'react';
import { useCampaign } from '../../../context/CampaignContext';

export const ElementSelectorModal = ({ isOpen, onClose, sourceType, fieldLabel, onSelect, isMulti = false }) => {
  const { elementsCatalog } = useCampaign();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // dbSource from old schema like 'species', 'factions', 'weaponry'
  // Map it to the new Element Types if possible
  const typeMap = {
    'species': 'Species',
    'factions': 'Faction',
    'origins': 'Custom', // Map to custom if no direct equivalent
    'occupations': 'Custom',
    'weaponry': 'Item',
    'armoring': 'Item',
    'gear': 'Item',
    'rules_codex': 'Custom',
    'compendium': 'Custom'
  };

  const targetType = typeMap[sourceType] || 'Custom';

  const items = (elementsCatalog || []).filter(el => {
    if (el.type !== targetType && targetType !== 'Custom') return false; // Allow anything if custom for now
    if (searchTerm && !el.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-lg flex flex-col shadow-2xl overflow-hidden text-slate-200">
        <h3 className="text-lg font-bold text-cyan-400 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">
          Select {fieldLabel || targetType}
        </h3>
        
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-4 px-4 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded text-sm w-full outline-none"
        />

        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] border border-slate-800 rounded bg-slate-950/50 p-2 space-y-1">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">No items found. Create one in the Element Editor.</div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(isMulti ? [item] : item);
                  onClose();
                }}
                className="p-2 bg-slate-900 border border-slate-800 rounded hover:border-cyan-500/50 hover:bg-cyan-950/20 cursor-pointer transition-colors"
              >
                <div className="font-bold text-sm text-slate-300">{item.title || 'Untitled'}</div>
                {item.fields?.summary && <div className="text-xs text-slate-500 truncate">{item.fields.summary}</div>}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold uppercase">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
