import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ReferenceTooltip.css';
import { useCampaign } from '../../context/CampaignContext';

const ReferenceTooltip = ({ term }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'bottom' });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const { elementsCatalog } = useCampaign();

  // Find the element by matching the term with the title (case-insensitive)
  const element = elementsCatalog?.find(
    (el) => el.title?.toLowerCase() === term.toLowerCase()
  );

  const data = element ? {
    type: element.type,
    description: element.fields?.summary || element.fields?.description || 'No description available.',
    tags: [element.type]
  } : {
    type: 'Unknown Entity',
    description: "The " + term + " was not found in the current project's element catalog.",
    tags: ['Unknown']
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const popoverRect = popoverRef.current?.getBoundingClientRect();
    const popoverWidth = popoverRect?.width || 256; // 16rem = 256px
    const popoverHeight = popoverRect?.height || 180;

    const spaceAbove = triggerRect.top - margin;
    const spaceBelow = viewportHeight - triggerRect.bottom - margin;

    // Flip to top if not enough room below but enough room above
    const placement = (spaceBelow < popoverHeight && spaceAbove > spaceBelow) ? 'top' : 'bottom';

    let top = placement === 'top' ? triggerRect.top - margin : triggerRect.bottom + margin;
    let left = triggerRect.left + triggerRect.width / 2;

    // Horizontal clamping (translate -50%)
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

  return (
    <span 
      ref={triggerRef}
      className="reference-highlight-container inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span className="reference-highlight-text text-cyan-400 font-bold border-b border-dashed border-cyan-400/50 cursor-pointer hover:bg-cyan-900/30 transition-colors px-1 rounded-sm">{term}</span>
      
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={popoverRef}
          role="tooltip"
          className="glass-pane animate-fade-in fixed z-[999999] w-64 bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden text-left max-h-[calc(100vh-2rem)] overflow-y-auto" 
          style={{ 
            top: `${coords.top}px`, 
            left: `${coords.left}px`, 
            transform: coords.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
            zIndex: 999999
          }}
        >
          <div className="popover-header bg-slate-800 p-3 border-b border-slate-700">
            <span className="popover-type text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-1">{data.type}</span>
            <h4 className="popover-title text-sm font-bold text-slate-100 m-0 leading-tight">{element ? element.title : term}</h4>
          </div>
          <div className="popover-body p-3 bg-slate-900">
            <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-4">{data.description}</p>
            <div className="popover-tags flex flex-wrap gap-1.5">
              {data.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-bold uppercase rounded">{tag}</span>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </span>
  );
};

export default ReferenceTooltip;
