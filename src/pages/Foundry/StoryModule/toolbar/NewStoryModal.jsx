import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function NewStoryModal({ isOpen, onClose, onCreateStory }) {
  const [newStoryTitle, setNewStoryTitle] = useState('New Story Module');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (newStoryTitle.trim()) {
      onCreateStory(newStoryTitle.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-slate-900 border border-cyan-500/70 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <span className="text-base">✨</span>
            <span>Create New Story Module</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Story Module Title
          </label>
          <input
            type="text"
            autoFocus
            value={newStoryTitle}
            onChange={(e) => setNewStoryTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onClose();
            }}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 px-3 py-2 rounded-xl text-xs outline-none"
            placeholder="e.g. Operation Voidfall"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!newStoryTitle.trim()}
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50"
          >
            Create Module
          </button>
        </div>
      </div>
    </div>
  );
}
