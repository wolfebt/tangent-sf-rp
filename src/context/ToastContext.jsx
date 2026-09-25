import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let _globalToastDispatcher = null;

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

/**
 * Singleton toast helper that can be called from anywhere,
 * including non-React utilities or contexts without hook dependencies.
 */
export const showToast = (options) => {
  if (_globalToastDispatcher) {
    return _globalToastDispatcher(typeof options === 'string' ? { text: options } : options);
  }
  if (typeof options === 'string') {
    console.log(`[Toast] ${options}`);
  } else {
    console.log(`[Toast ${options?.type || 'info'}] ${options?.title ? options.title + ': ' : ''}${options?.text || ''}`);
  }
};

let _toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({ type = 'info', title, text, autoDismissMs = 4000 }) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, type, title, text, autoDismissMs }]);
    if (autoDismissMs > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, autoDismissMs);
    }
    return id;
  }, []);

  useEffect(() => {
    _globalToastDispatcher = toast;
    return () => {
      if (_globalToastDispatcher === toast) {
        _globalToastDispatcher = null;
      }
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div 
          aria-live="polite" 
          className="fixed bottom-6 right-6 z-[99998] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-3rem)]"
        >
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-300 shrink-0 mt-0.5" />,
  error:   <AlertOctagon size={18} className="text-rose-300 shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={18} className="text-amber-300 shrink-0 mt-0.5" />,
  info:    <Info size={18} className="text-cyan-300 shrink-0 mt-0.5" />,
};

const STYLES = {
  success: 'bg-emerald-950/95 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  error:   'bg-rose-950/95 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)]',
  warning: 'bg-amber-950/95 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  info:    'bg-[#0c1018]/95 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
};

const DEFAULT_TITLES = { 
  success: 'SUCCESS', 
  error: 'ERROR', 
  warning: 'WARNING', 
  info: 'SYSTEM NOTIFICATION' 
};

const ToastItem = ({ toast, onDismiss }) => (
  <div
    role="status"
    className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl font-sans text-sm min-w-[280px] sm:min-w-[320px] max-w-[460px] shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in ${STYLES[toast.type] || STYLES.info}`}
  >
    {ICONS[toast.type] || ICONS.info}
    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/90">
        {toast.title || DEFAULT_TITLES[toast.type]}
      </span>
      <span className="text-xs text-white/80 leading-relaxed break-words">{toast.text}</span>
    </div>
    <button
      type="button"
      onClick={onDismiss}
      className="text-white/40 hover:text-white/90 transition-colors mt-0.5 shrink-0 p-0.5 rounded"
      aria-label="Dismiss"
    >
      <X size={15} />
    </button>
  </div>
);
