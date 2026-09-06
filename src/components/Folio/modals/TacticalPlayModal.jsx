import React, { useEffect } from 'react';
import { TacticalPlayView } from '../views/TacticalPlayView';
import { X, Crosshair } from 'lucide-react';

export const TacticalPlayModal = ({
  isOpen,
  onClose,
  character = null,
  isPreview = false,
  onSwitchToBuilder = null,
  onLockSheet = null
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl max-h-[92vh] bg-[#0c1219] border border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(34,211,238,0.2)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Floating Close Button */}
        <div className="absolute top-3 right-3 z-30">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shadow-md"
            title="Close Modal (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Cockpit Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-slate-950">
          <TacticalPlayView
            characterOverride={character}
            isModal={true}
            isPreview={isPreview}
            onClose={onClose}
            onSwitchToBuilder={onSwitchToBuilder}
            onLockSheet={onLockSheet}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(TacticalPlayModal);
