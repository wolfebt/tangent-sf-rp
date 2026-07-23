import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121824] border border-red-500/60 rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] text-slate-100 space-y-4">
        
        <div className="flex justify-between items-center border-b border-red-900/60 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
            {title || 'Confirm Action'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold leading-none">
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {message || 'Are you sure you want to proceed? Unsaved progress will be lost.'}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold tracking-wider"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500/60 text-red-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
};

export default React.memo(ConfirmationModal);
