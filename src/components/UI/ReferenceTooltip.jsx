import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './ReferenceTooltip.css';
import { useCampaign } from '../../context/CampaignContext';
import { useDBM } from '../../context/DBMContext';
import { AudioService } from '../../services/audioService';
import { resolveHyperlinkTarget } from '../../services/hyperlinkResolver.js';
import { ExternalLink, Compass, BookOpen, Layers, HelpCircle, ArrowUpRight } from 'lucide-react';

const THEME_STYLES = {
  emerald: {
    text: 'text-emerald-300 border-b border-dashed border-emerald-400/60 hover:bg-emerald-950/40 hover:text-emerald-200',
    badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    border: 'border-emerald-500/40'
  },
  amber: {
    text: 'text-amber-300 border-b border-dashed border-amber-400/60 hover:bg-amber-950/40 hover:text-amber-200',
    badge: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
    button: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    border: 'border-amber-500/40'
  },
  cyan: {
    text: 'text-cyan-300 border-b border-dashed border-cyan-400/60 hover:bg-cyan-950/40 hover:text-cyan-200',
    badge: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    border: 'border-cyan-500/40'
  },
  slate: {
    text: 'text-slate-300 border-b border-dotted border-slate-500/60 hover:bg-slate-800/40 hover:text-slate-100',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
    button: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    border: 'border-slate-700'
  }
};

const ReferenceTooltip = ({ 
  term, 
  label: propLabel, 
  onLinkClick, 
  className = '', 
  style = {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'bottom' });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const navigate = useNavigate();
  const campaignContext = useCampaign();
  const dbmContext = useDBM();

  const elementsCatalog = campaignContext?.elementsCatalog || [];
  const dbData = dbmContext?.dbData || {};

  // Resolve target using centralized multi-source resolver
  const resolved = useMemo(() => {
    const raw = propLabel ? `${propLabel}|${term}` : term;
    return resolveHyperlinkTarget(raw, { elementsCatalog, dbData });
  }, [term, propLabel, elementsCatalog, dbData]);

  const theme = THEME_STYLES[resolved.colorTheme] || THEME_STYLES.cyan;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const popoverRect = popoverRef.current?.getBoundingClientRect();
    const popoverWidth = popoverRect?.width || 280;
    const popoverHeight = popoverRect?.height || 200;

    const spaceAbove = triggerRect.top - margin;
    const spaceBelow = viewportHeight - triggerRect.bottom - margin;

    // Flip to top if not enough room below but enough room above
    const placement = (spaceBelow < popoverHeight && spaceAbove > spaceBelow) ? 'top' : 'bottom';

    let top = placement === 'top' ? triggerRect.top - margin : triggerRect.bottom + margin;
    let left = triggerRect.left + triggerRect.width / 2;

    // Horizontal clamping
    const halfWidth = popoverWidth / 2;
    if (left - halfWidth < margin) {
      left = margin + halfWidth;
    } else if (left + halfWidth > viewportWidth - margin) {
      left = viewportWidth - margin - halfWidth;
    }

    // Vertical clamping
    if (placement === 'top') {
      if (top - popoverHeight < margin) {
        top = margin + popoverHeight;
      }
    } else {
      if (top + popoverHeight > viewportHeight - margin) {
        top = viewportHeight - margin - popoverHeight;
      }
    }

    setCoords({ top, left, placement });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, updatePosition]);

  // Execute hyperlink operation
  const handleTriggerOperation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    AudioService.playTerminalBeep(900, 0.03);
    setIsOpen(false);

    if (typeof onLinkClick === 'function') {
      onLinkClick(resolved);
      return;
    }

    if (resolved.url) {
      navigate(resolved.url);
    }
  };

  // Render micro-icon based on target type
  const renderIcon = () => {
    switch (resolved.targetType) {
      case 'section':
        return <Compass size={11} className="inline mr-1 opacity-70 shrink-0" />;
      case 'codex':
        return <BookOpen size={11} className="inline mr-1 opacity-70 shrink-0" />;
      case 'catalog':
        return <Layers size={11} className="inline mr-1 opacity-70 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span 
      ref={triggerRef}
      className={`reference-highlight-container inline-flex items-baseline align-baseline select-none mx-0.5 ${className}`.trim()}
      style={style}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={handleTriggerOperation}
        className={`reference-highlight-text inline-flex items-center gap-0.5 px-1 py-0.2 rounded-sm font-semibold cursor-pointer transition-all duration-150 align-baseline ${theme.text}`}
        title={`[${resolved.badge}] Click to ${resolved.actionLabel || 'navigate'}`}
      >
        {renderIcon()}
        <span>{resolved.displayLabel || resolved.title}</span>
        <ArrowUpRight size={10} className="inline ml-0.5 opacity-60" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={popoverRef}
          role="tooltip"
          className={`glass-pane animate-fade-in fixed z-[999999] w-72 bg-slate-950/95 border ${theme.border} shadow-[0_10px_35px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden text-left max-h-[calc(100vh-2rem)] overflow-y-auto font-sans`}
          style={{ 
            top: `${coords.top}px`, 
            left: `${coords.left}px`, 
            transform: coords.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
            zIndex: 999999
          }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Popover Header */}
          <div className="bg-slate-900/90 p-3 border-b border-slate-800">
            <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block mb-1.5 ${theme.badge}`}>
              {resolved.badge}
            </span>
            <h4 className="text-sm font-bold text-slate-100 m-0 leading-tight flex items-center justify-between gap-2">
              <span className="truncate">{resolved.title}</span>
            </h4>
          </div>

          {/* Popover Body */}
          <div className="p-3 bg-slate-950/90 space-y-2.5">
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 m-0 font-sans">
              {resolved.description}
            </p>

            {resolved.tags && resolved.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {resolved.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-mono font-semibold uppercase rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Trigger Button */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleTriggerOperation}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${theme.button}`}
              >
                <span>{resolved.actionLabel || 'Navigate'}</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </span>
  );
};

export default React.memo(ReferenceTooltip);
