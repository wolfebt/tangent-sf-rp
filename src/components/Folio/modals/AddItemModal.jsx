import React, { useState } from 'react';

const AddItemModal = ({ isOpen, onClose, modalConfig, onAddItem }) => {
  const [itemName, setItemName] = useState('');

  if (!isOpen || !modalConfig) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onAddItem(modalConfig.key, itemName.trim());
    setItemName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#121824] border border-cyan-500/60 rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Add {modalConfig.title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-slate-300 mb-1">
              Item / Ability Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={`Enter ${modalConfig.title.toLowerCase()} name...`}
              className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-slate-100 outline-none"
            />
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
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(AddItemModal);
