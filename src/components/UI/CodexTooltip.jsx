import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, BookOpen, Calculator, Sparkles } from 'lucide-react';

/**
 * CodexTooltip
 * Glass-cockpit, high-tech interactive tooltip component for Codex fields,
 * computed outputs, configurators, and rule references.
 *
 * Renders via React portal directly into document.body with fixed z-index [999999]
 * so it is NEVER clipped by scrollable containers or hidden behind adjacent panels.
 */
export const CodexTooltip = ({
  title,
  children,
  rule,
  formula,
  description,
  impact,
  benchmarks,
  position = 'top',
  color = '#06b6d4',
  className = '',
  delay = 1000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, actualPosition: 'top' });
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const triggerRect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12;

    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const tooltipWidth = tooltipRect?.width || 320;
    const tooltipHeight = tooltipRect?.height || 220;

    const spaceAbove = triggerRect.top - margin;
    const spaceBelow = viewportHeight - triggerRect.bottom - margin;
    const spaceLeft = triggerRect.left - margin;
    const spaceRight = viewportWidth - triggerRect.right - margin;

    let targetPos = position;
    if (position === 'top' && spaceAbove < tooltipHeight && spaceBelow > spaceAbove) {
      targetPos = 'bottom';
    } else if (position === 'bottom' && spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      targetPos = 'top';
    } else if (position === 'left' && spaceLeft < tooltipWidth && spaceRight > spaceLeft) {
      targetPos = 'right';
    } else if (position === 'right' && spaceRight < tooltipWidth && spaceLeft > spaceRight) {
      targetPos = 'left';
    }

    let top = 0;
    let left = 0;

    if (targetPos === 'top') {
      top = triggerRect.top - 8;
      left = triggerRect.left + triggerRect.width / 2;
    } else if (targetPos === 'bottom') {
      top = triggerRect.bottom + 8;
      left = triggerRect.left + triggerRect.width / 2;
    } else if (targetPos === 'left') {
      top = triggerRect.top + triggerRect.height / 2;
      left = triggerRect.left - 8;
    } else if (targetPos === 'right') {
      top = triggerRect.top + triggerRect.height / 2;
      left = triggerRect.right + 8;
    }

    // Horizontal clamping
    if (targetPos === 'top' || targetPos === 'bottom') {
      const halfWidth = tooltipWidth / 2;
      if (left - halfWidth < margin) {
        left = margin + halfWidth;
      } else if (left + halfWidth > viewportWidth - margin) {
        left = viewportWidth - margin - halfWidth;
      }
    } else if (targetPos === 'left') {
      if (left - tooltipWidth < margin) {
        left = margin + tooltipWidth;
      }
    } else if (targetPos === 'right') {
      if (left + tooltipWidth > viewportWidth - margin) {
        left = viewportWidth - margin - tooltipWidth;
      }
    }

    // Vertical clamping
    if (targetPos === 'top') {
      if (top - tooltipHeight < margin) {
        top = margin + tooltipHeight;
      }
    } else if (targetPos === 'bottom') {
      if (top + tooltipHeight > viewportHeight - margin) {
        top = viewportHeight - margin - tooltipHeight;
      }
    } else {
      const halfHeight = tooltipHeight / 2;
      if (top - halfHeight < margin) {
        top = margin + halfHeight;
      } else if (top + halfHeight > viewportHeight - margin) {
        top = viewportHeight - margin - halfHeight;
      }
    }

    setCoords({ top, left, actualPosition: targetPos });
  }, [position]);

  const showTooltip = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 120);
  };

  const toggleTooltip = (e) => {
    e.stopPropagation();
    if (isVisible) {
      setIsVisible(false);
    } else {
      calculatePosition();
      setIsVisible(true);
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      const handleScrollOrResize = () => calculatePosition();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsVisible(false);
      };
      const handleOutsideClick = (e) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(e.target)
        ) {
          setIsVisible(false);
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      };
    }
  }, [isVisible, calculatePosition]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={toggleTooltip}
    >
      {children || (
        <button
          type="button"
          aria-label={title || 'Codex rule guidance'}
          className="p-0.5 text-slate-400 hover:text-cyan-300 focus:text-cyan-300 transition-colors cursor-help inline-flex items-center"
        >
          <HelpCircle size={12} className="opacity-80 hover:opacity-100 transition-opacity" />
        </button>
      )}

      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={hideTooltip}
          className="fixed z-[999999] w-72 sm:w-80 bg-slate-950/98 border rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(6,182,212,0.2)] p-3 text-left font-sans backdrop-blur-md animate-fade-in pointer-events-auto select-text max-h-[calc(100vh-2rem)] overflow-y-auto"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: coords.actualPosition === 'top'
              ? 'translate(-50%, -100%)'
              : coords.actualPosition === 'bottom'
              ? 'translate(-50%, 0%)'
              : coords.actualPosition === 'left'
              ? 'translate(-100%, -50%)'
              : 'translate(0%, -50%)',
            borderColor: `${color}70`,
            zIndex: 999999
          }}
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="min-w-0">
              {rule && (
                <div className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  <BookOpen size={10} className="shrink-0 text-cyan-400" />
                  <span className="truncate">{rule}</span>
                </div>
              )}
              <h4 className="text-xs font-bold font-mono text-white tracking-wide truncate">
                {title}
              </h4>
            </div>
            <div
              className="w-2 h-2 rounded-full shrink-0 mt-1 shadow-sm"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
          </div>

          {description && (
            <p className="text-[11px] text-slate-300 leading-relaxed mt-2 font-normal">
              {description}
            </p>
          )}

          {formula && (
            <div className="mt-2.5 p-2 bg-slate-900/90 border border-slate-800 rounded-lg text-[10px] font-mono">
              <div className="flex items-center gap-1 font-bold text-amber-400 uppercase text-[9px] mb-1">
                <Calculator size={11} className="text-amber-400" />
                <span>Canonical Formula</span>
              </div>
              <div className="text-cyan-300 font-semibold break-all">
                {formula}
              </div>
            </div>
          )}

          {impact && (
            <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-start gap-1.5">
              <Sparkles size={11} className="shrink-0 text-amber-400 mt-0.5" />
              <span><strong className="text-slate-300">Rule Impact:</strong> {impact}</span>
            </div>
          )}

          {Array.isArray(benchmarks) && benchmarks.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
              <div className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                Canonical Benchmarks:
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                {benchmarks.map((b, idx) => (
                  <div key={idx} className="bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300 flex justify-between">
                    <span className="font-bold text-cyan-300">{b.label}:</span>
                    <span className="text-slate-400 truncate ml-1">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </span>
  );
};

export default CodexTooltip;
