import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import './Toast.css';

/**
 * @typedef {'success' | 'error' | 'warning' | 'info'} ToastType
 *
 * @typedef {Object} ToastProps
 * @property {string | { type?: ToastType, title?: string, text?: string, message?: string }} toast
 * @property {() => void} onClose
 * @property {number} [autoDismissMs=4000]
 */

export const Toast = ({
  toast,
  onClose,
  autoDismissMs = 4000
}) => {
  useEffect(() => {
    if (!toast) return;
    if (autoDismissMs > 0 && typeof onClose === 'function') {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [toast, autoDismissMs, onClose]);

  if (!toast) return null;

  const type = typeof toast === 'object' && toast.type ? toast.type : 'info';
  const title = typeof toast === 'object' && toast.title ? toast.title : null;
  const message =
    typeof toast === 'string'
      ? toast
      : toast.text || toast.message || 'Notification';

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-300 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertOctagon size={18} className="text-rose-300 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-300 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info size={18} className="text-cyan-300 shrink-0 mt-0.5" />;
    }
  };

  const defaultTitle = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'System'
  }[type] || 'Notice';

  return (
    <div className="tangent-toast-container" role="status" aria-live="polite">
      <div className={`tangent-toast toast-${type}`}>
        {renderIcon()}
        <div className="tangent-toast-content">
          <span className="tangent-toast-title">{title || defaultTitle}</span>
          <span className="tangent-toast-text">{message}</span>
        </div>
        {typeof onClose === 'function' && (
          <button
            type="button"
            className="tangent-toast-close"
            onClick={onClose}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
