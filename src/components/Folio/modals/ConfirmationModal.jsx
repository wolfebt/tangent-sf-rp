import React from 'react';
import { AccessibleModal } from '../../UI/AccessibleModal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      maxWidthClass="max-w-md"
      className="border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)]"
    >
      <div className="space-y-4 text-slate-100">
        <p className="text-sm text-slate-300 leading-relaxed">
          {message || 'Are you sure you want to proceed? Unsaved progress will be lost.'}
        </p>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500/60 text-red-200 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default React.memo(ConfirmationModal);
