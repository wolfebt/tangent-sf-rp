import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, Check, ShieldAlert } from 'lucide-react';

const ConfirmContext = createContext(null);

let _globalConfirmDispatcher = null;

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx.confirm;
};

export const getGlobalConfirm = () => _globalConfirmDispatcher;

export const showConfirm = (config) => {
  if (_globalConfirmDispatcher) {
    return _globalConfirmDispatcher(config);
  }
  // Native fallback if unmounted
  const msg = `${config.title ? config.title + '\n\n' : ''}${config.message || ''}`;
  return Promise.resolve(window.confirm(msg));
};

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ isOpen: false, config: {} });
  const resolveRef = useRef(null);
  const [typed, setTyped] = useState('');
  const [promptInput, setPromptInput] = useState('');

  const confirm = useCallback((config = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setTyped('');
      setPromptInput(config.inputValue || '');
      setState({ isOpen: true, config });
    });
  }, []);

  useEffect(() => {
    _globalConfirmDispatcher = confirm;
    return () => {
      if (_globalConfirmDispatcher === confirm) {
        _globalConfirmDispatcher = null;
      }
    };
  }, [confirm]);

  const handleConfirm = () => {
    const isInputMode = Boolean(state.config.inputLabel);
    setState(s => ({ ...s, isOpen: false }));
    if (isInputMode) {
      resolveRef.current?.({
        confirmed: true,
        inputValue: promptInput,
        value: promptInput
      });
    } else {
      resolveRef.current?.(true);
    }
  };

  const handleCancel = () => {
    const isInputMode = Boolean(state.config.inputLabel);
    setState(s => ({ ...s, isOpen: false }));
    if (isInputMode) {
      resolveRef.current?.({
        confirmed: false,
        inputValue: '',
        value: ''
      });
    } else {
      resolveRef.current?.(false);
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    if (!state.isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen]);

  const { config } = state;
  const canConfirm = config.requireTyped
    ? typed.trim().toLowerCase() === (config.typedTarget || '').trim().toLowerCase()
    : true;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.isOpen && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none font-sans"
          onClick={handleCancel}
        >
          <div
            className={`w-full max-w-md bg-[#0c1018] border rounded-2xl p-6 shadow-2xl relative transition-all duration-200 ${
              config.danger 
                ? 'border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.2)]' 
                : 'border-cyan-500/40 shadow-[0_0_50px_rgba(34,211,238,0.15)]'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className={`p-2.5 rounded-xl border shrink-0 ${
                config.danger 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}>
                {config.danger ? <ShieldAlert size={22} /> : <AlertTriangle size={22} />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                  {config.title || 'CONFIRM ACTION'}
                </h2>
                {config.message && (
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed break-words">
                    {config.message}
                  </p>
                )}
              </div>
            </div>

            {/* Custom Input Mode (e.g. for player reason or note) */}
            {config.inputLabel && (
              <div className="mb-4">
                <label className="block text-[11px] font-mono text-cyan-400 mb-1.5 uppercase tracking-wider">
                  {config.inputLabel}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl text-xs font-mono text-slate-100 outline-none transition-colors"
                  placeholder={config.placeholder || 'Enter details...'}
                />
              </div>
            )}

            {/* Typed Confirmation Mode */}
            {config.requireTyped && (
              <div className="mb-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[11px] font-mono text-amber-300 mb-2 uppercase tracking-wide">
                  Type <span className="text-white font-bold select-all bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/40">"{config.typedTarget}"</span> to confirm:
                </p>
                <input
                  autoFocus
                  type="text"
                  value={typed}
                  onChange={e => setTyped(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canConfirm && handleConfirm()}
                  className="w-full px-3 py-2 bg-black border border-slate-700 focus:border-rose-500 rounded-lg text-xs font-mono text-slate-100 outline-none transition-colors"
                  placeholder={config.typedTarget}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X size={14} />
                <span>{config.cancelLabel || 'Cancel'}</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  config.danger
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500 disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                }`}
              >
                {config.danger ? <Trash2 size={14} /> : <Check size={14} />}
                <span>{config.confirmLabel || 'Confirm'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};
