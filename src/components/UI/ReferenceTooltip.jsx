import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './ReferenceTooltip.css';
import { useCampaign } from '../../context/CampaignContext';
import { useDBM } from '../../context/DBMContext';
import { AudioService } from '../../services/audioService';
import { resolveHyperlinkTarget } from '../../services/hyperlinkResolver.js';
import { ExternalLink, Compass, BookOpen, Layers, HelpCircle, ArrowUpRight, User, Database, FileText } from 'lucide-react';

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
  const leaveTimerRef = useRef(null);

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

  const handleMouseEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const popoverRect = popoverRef.current?.getBoundingClientRect();
    const popoverWidth = popoverRect?.width || 320;
    const popoverHeight = popoverRect?.height || 220;

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

  // Execute hyperlink operation (navigating to default option or chosen sub-option)
  const handleTriggerOperation = useCallback((e, targetOption = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsOpen(false);
    AudioService.playTerminalBeep(900, 0.03);

    const target = targetOption || resolved;

    if (typeof onLinkClick === 'function') {
      onLinkClick(target);
      return;
    }

    if (target.url) {
      navigate(target.url);
    }
  }, [navigate, onLinkClick, resolved]);

  // Render micro-icon based on target type and icon name
  const renderIcon = (type = resolved.targetType, iconName = null) => {
    if (iconName === 'User' || (type === 'section' && iconName !== 'Compass')) {
      return <User size={11} className="inline mr-1 opacity-80 shrink-0" />;
    }
    if (iconName === 'Compass' || type === 'stage') {
      return <Compass size={11} className="inline mr-1 opacity-80 shrink-0" />;
    }
    if (iconName === 'Database' || type === 'codex') {
      return <Database size={11} className="inline mr-1 opacity-80 shrink-0" />;
    }
    if (iconName === 'Layers' || type === 'catalog') {
      return <Layers size={11} className="inline mr-1 opacity-80 shrink-0" />;
    }
    if (iconName === 'FileText') {
      return <FileText size={11} className="inline mr-1 opacity-80 shrink-0" />;
    }
    if (type === 'compendium') {
      return <BookOpen size={11} className="inline mr-1 opacity-80 shrink-0" />;
    }
    return <ArrowUpRight size={11} className="inline mr-1 opacity-80 shrink-0" />;
  };

  return (
    <span 
      ref={triggerRef}
      className={`reference-highlight-container inline-flex items-baseline align-baseline select-none mx-0.5 ${className}`.trim()}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={(e) => handleTriggerOperation(e, null)}
        className={`reference-highlight-text inline-flex items-center gap-0.5 px-1 py-0.2 rounded-sm font-semibold cursor-pointer transition-all duration-150 align-baseline ${theme.text}`}
        title={`[${resolved.badge}] Click to ${resolved.actionLabel || 'open rules entry'}`}
      >
        {renderIcon(resolved.targetType, resolved.icon)}
        <span>{resolved.displayLabel || resolved.title}</span>
        <ArrowUpRight size={10} className="inline ml-0.5 opacity-60" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={popoverRef}
          role="tooltip"
          className={`glass-pane animate-fade-in fixed z-[999999] w-80 bg-slate-950/98 border ${theme.border} shadow-[0_12px_40px_rgba(0,0,0,0.9)] rounded-xl overflow-hidden text-left max-h-[calc(100vh-2rem)] overflow-y-auto font-sans`}
          style={{ 
            top: `${coords.top}px`, 
            left: `${coords.left}px`, 
            transform: coords.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
            zIndex: 999999
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 m-0 font-sans">
              {resolved.description}
            </p>

            {resolved.tags && resolved.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
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

            {/* Available Options Directory (as Selectable Links) */}
            {resolved.options && resolved.options.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Available Options ({resolved.options.length})
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400/80">
                    Selectable Links
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5 reference-options-scroll">
                  {resolved.options.map((option, idx) => {
                    const isDefault = Boolean(option.isDefault);
                    return (
                      <button
                        key={option.id || idx}
                        type="button"
                        onClick={(e) => handleTriggerOperation(e, option)}
                        className={`w-full text-left p-1.5 rounded-lg border transition-all flex items-start gap-2 cursor-pointer group select-none ${
                          isDefault
                            ? 'bg-emerald-950/50 hover:bg-emerald-900/70 border-emerald-500/60 hover:border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                            : 'bg-slate-900/80 hover:bg-slate-800/95 border-slate-800 hover:border-cyan-500/50 text-slate-200'
                        }`}
                        title={`Select option: ${option.title || option.label}`}
                      >
                        <div className={`mt-0.5 shrink-0 ${isDefault ? 'text-emerald-400' : 'text-slate-400 group-hover:text-cyan-300'}`}>
                          {renderIcon(option.targetType, option.icon)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`text-[11px] font-semibold truncate ${
                              isDefault ? 'text-emerald-300 group-hover:text-emerald-200 font-bold' : 'text-slate-200 group-hover:text-cyan-200'
                            }`}>
                              {option.label || option.title}
                            </span>

                            <span className={`text-[8.5px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                              isDefault
                                ? 'bg-emerald-900/80 border-emerald-400/70 text-emerald-300'
                                : 'bg-slate-950 border-slate-700/80 text-slate-400 group-hover:border-cyan-500/40 group-hover:text-cyan-300'
                            }`}>
                              {option.badge || (isDefault ? 'DEFAULT' : 'OPTION')}
                            </span>
                          </div>

                          {option.sublabel && (
                            <p className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate m-0 font-sans mt-0.5">
                              {option.sublabel}
                            </p>
                          )}
                        </div>

                        <ArrowUpRight size={11} className={`mt-0.5 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                          isDefault ? 'text-emerald-400 opacity-100' : 'text-slate-500 group-hover:text-cyan-300 group-hover:opacity-100'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Primary Action Button (Default Option) */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={(e) => handleTriggerOperation(e, null)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${theme.button}`}
              >
                <span>{resolved.actionLabel || 'Open Rules Entry'}</span>
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
