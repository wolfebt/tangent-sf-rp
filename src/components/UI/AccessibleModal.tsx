/**
 * @file AccessibleModal.tsx
 * @description Fortune 500 / WCAG 2.1 AA Compliant Accessible Modal Primitive for Tangent SF RP.
 * Guarantees WAI-ARIA dialog semantics, keyboard focus trapping, Escape key closing,
 * and focus restoration on unmount.
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  description?: string;
  descriptionId?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
  className?: string;
  showCloseButton?: boolean;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  titleId,
  description,
  descriptionId,
  children,
  maxWidthClass = 'max-w-2xl',
  className = '',
  showCloseButton = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const resolvedTitleId = titleId || `dialog-title-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const resolvedDescId = descriptionId || (description ? `dialog-desc-${resolvedTitleId}` : undefined);

  useEffect(() => {
    if (!isOpen) return;

    // Cache previously focused element to return focus after modal closes
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Shift initial focus into the dialog after render
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes modal
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      // Keyboard Focus Trap inside modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown, true);
      // Restore focus to opener element
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn select-none"
      onClick={onClose}
      aria-hidden="false"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedTitleId}
        aria-describedby={resolvedDescId}
        tabIndex={-1}
        className={`bg-[#0d1117] border border-cyan-500/50 rounded-2xl w-full ${maxWidthClass} shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative focus:outline-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 bg-slate-950/90 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
          <div>
            <h2 id={resolvedTitleId} className="text-sm sm:text-base font-mono font-bold uppercase tracking-widest text-cyan-300">
              {title}
            </h2>
            {description && (
              <p id={resolvedDescId} className="text-xs font-mono text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
      </div>
    </div>
  );
};
