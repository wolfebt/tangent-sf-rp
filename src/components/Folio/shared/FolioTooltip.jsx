import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

/**
 * FolioTooltip: Reusable, zero-clip portal tooltip designed for the Tangent SF RP Folio.
 *
 * Renders via React portal directly to document.body so it is NEVER clipped
 * by scrollable tables (overflow-x-auto) or card containers (overflow-hidden).
 *
 * Props:
 * - title: Header text (e.g. "Strength (STR)" or "Acrobatics")
 * - badge: Category/Type pill label (e.g. "Primary Attribute", "Physical Skill", "Ability Feature")
 * - badgeColor: 'cyan' | 'purple' | 'amber' | 'emerald' | 'rose' | 'slate'
 * - description: Detailed text / lore
 * - formula: Calculation formula or mechanical equation
 * - prerequisites: Feature prerequisites (if any)
 * - cost: CP or BP cost/refund (if any)
 * - tags: Array of quick tag strings
 * - position: 'auto' | 'top' | 'bottom' | 'left' | 'right' (default 'auto')
 * - showInfoIcon: boolean - if true, renders a subtle info icon next to children or as standalone trigger
 * - asWrapper: boolean (default true) - wrap children with hover/click trigger
 * - maxWidth: number in pixels (default 320)
 * - children: Trigger content (text, label, icon)
 */
export const FolioTooltip = ({
  title,
  badge,
  badgeColor = 'cyan',
  description,
  formula,
  prerequisites,
  cost,
  tags = [],
  position = 'auto',
  showInfoIcon = false,
  asWrapper = true,
  maxWidth = 320,
  className = '',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, actualPosition: 'top' });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = maxWidth;
    const estimatedHeight = 160; // Approximate height for boundary check
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let targetPos = position;
    if (position === 'auto') {
      // If there's not enough room above, flip to bottom
      if (rect.top - estimatedHeight < margin) {
        targetPos = 'bottom';
      } else {
        targetPos = 'top';
      }
    }

    let top = 0;
    let left = 0;

    if (targetPos === 'top') {
      top = rect.top - margin;
      left = rect.left + rect.width / 2;
    } else if (targetPos === 'bottom') {
      top = rect.bottom + margin;
      left = rect.left + rect.width / 2;
    } else if (targetPos === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left - margin;
    } else if (targetPos === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.right + margin;
    }

    // Clamp horizontal position so tooltip doesn't bleed offscreen
    const halfWidth = tooltipWidth / 2;
    if (left - halfWidth < margin) {
      left = margin + halfWidth;
    } else if (left + halfWidth > viewportWidth - margin) {
      left = viewportWidth - margin - halfWidth;
    }

    setCoords({ top, left, actualPosition: targetPos });
  }, [position, maxWidth]);

  const showTooltip = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, 120);
  };

  const hideTooltip = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const toggleTooltip = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      calculatePosition();
      setIsOpen(true);
    }
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScrollOrResize = () => {
      if (isOpen) calculatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isOpen, calculatePosition]);

  // Color mapping for badge & accent glow
  const getBadgeClasses = (color) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50';
      case 'purple':
        return 'bg-purple-950/90 text-purple-300 border-purple-500/50';
      case 'amber':
        return 'bg-amber-950/90 text-amber-300 border-amber-500/50';
      case 'rose':
        return 'bg-rose-950/90 text-rose-300 border-rose-500/50';
      case 'blue':
        return 'bg-blue-950/90 text-blue-300 border-blue-500/50';
      case 'slate':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'cyan':
      default:
        return 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50';
    }
  };

  const hasContent = Boolean(title || description || formula || prerequisites || cost);
  if (!hasContent) {
    return children || null;
  }

  const tooltipPortal = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      style={{
        position: 'fixed',
        top: coords.actualPosition === 'top' ? `${coords.top}px` : `${coords.top}px`,
        left: `${coords.left}px`,
        transform: coords.actualPosition === 'top' 
          ? 'translate(-50%, -100%)' 
          : coords.actualPosition === 'bottom'
            ? 'translate(-50%, 0%)'
            : coords.actualPosition === 'left'
              ? 'translate(-100%, -50%)'
              : 'translate(0%, -50%)',
        maxWidth: `${maxWidth}px`,
        width: 'max-content',
        zIndex: 99999
      }}
      className="pointer-events-auto select-text font-sans text-left transition-all duration-150 animate-in fade-in zoom-in-95"
      onMouseEnter={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      }}
      onMouseLeave={hideTooltip}
    >
      <div className="bg-[#0b111e]/95 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.85),0_0_15px_rgba(6,182,212,0.25)] p-3 space-y-2 text-slate-200">
        
        {/* Header: Title + Badge */}
        <div className="flex items-start justify-between gap-2 border-b border-cyan-900/60 pb-1.5">
          <div className="space-y-0.5 min-w-0">
            {title && (
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <span className="text-cyan-400">❖</span>
                <span className="truncate">{title}</span>
              </h4>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {badge && (
              <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${getBadgeClasses(badgeColor)}`}>
                {badge}
              </span>
            )}
            {cost && (
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                {cost}
              </span>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        {prerequisites && (
          <div className="text-[10px] text-amber-300/90 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
            <span className="font-bold text-amber-400">Prereq:</span> {prerequisites}
          </div>
        )}

        {/* Body Description */}
        {description && (
          <p className="text-[11px] text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1">
            {description}
          </p>
        )}

        {/* Mechanics / Formula Card */}
        {formula && (
          <div className="bg-slate-950/80 border border-cyan-900/50 rounded p-1.5 text-[10px] font-mono text-cyan-300/90 space-y-0.5">
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Mechanics &amp; Formula</div>
            <div className="text-cyan-200 font-semibold">{formula}</div>
          </div>
        )}

        {/* Quick Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {tags.map((tag, idx) => (
              <span key={idx} className="px-1.5 py-0.2 text-[9px] font-mono bg-slate-900 border border-slate-700 text-slate-400 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  if (!asWrapper) {
    return (
      <>
        <span
          ref={triggerRef}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onClick={toggleTooltip}
          className={`inline-flex items-center text-slate-400 hover:text-cyan-300 cursor-pointer transition-colors ${className}`}
          role="button"
          tabIndex={0}
          aria-label={title || 'Info'}
        >
          <Info className="w-3.5 h-3.5" />
        </span>
        {tooltipPortal}
      </>
    );
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={toggleTooltip}
        className={`inline-flex items-center gap-1 cursor-help group/tooltip transition-colors ${className}`}
      >
        {children}
        {showInfoIcon && (
          <Info className="w-3 h-3 text-slate-500 group-hover/tooltip:text-cyan-400 transition-colors shrink-0" />
        )}
      </span>
      {tooltipPortal}
    </>
  );
};

export default FolioTooltip;
