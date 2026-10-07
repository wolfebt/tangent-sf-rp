import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useViewportBounds from '../../../hooks/useViewportBounds';
import ContextMenuItem from './ContextMenuItem';
import ContextSubMenu from './ContextSubMenu';
import { AudioService } from '../../../services/audioService';

export const ContextMenu = ({
  isOpen,
  onClose,
  x,
  y,
  title,
  categoryBadge,
  domain = 'global', // 'folio' | 'cortex' | 'ade' | 'stage' | 'global'
  items = [],
  onItemClick
}) => {
  const menuRef = useRef(null);
  const coords = useViewportBounds(x, y, menuRef, { defaultWidth: 260, defaultHeight: 340 });

  // Play subtle sci-fi terminal click upon menu open
  useEffect(() => {
    if (isOpen) {
      try {
        AudioService?.playTerminalBeep?.(1280, 0.03);
      } catch (e) {}
    }
  }, [isOpen]);

  // Keyboard navigation & dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Domain theme borders and accents
  let domainBorder = 'border-cyan-500/30';
  let domainBadgeBg = 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40';
  let domainGlow = 'shadow-[0_12px_45px_rgba(0,0,0,0.85)]';

  if (domain === 'cortex') {
    domainBorder = 'border-amber-500/35';
    domainBadgeBg = 'bg-amber-950/70 text-amber-300 border-amber-500/40';
  } else if (domain === 'ade') {
    domainBorder = 'border-purple-500/35';
    domainBadgeBg = 'bg-purple-950/70 text-purple-300 border-purple-500/40';
  } else if (domain === 'stage') {
    domainBorder = 'border-red-500/35';
    domainBadgeBg = 'bg-red-950/70 text-red-300 border-red-500/40';
  }

  const content = (
    <div
      ref={menuRef}
      role="menu"
      aria-label={title || "Context Menu"}
      className={`fixed z-[9999] min-w-[240px] max-w-[320px] py-1.5 px-1 bg-[#0a0e17]/95 backdrop-blur-2xl border ${domainBorder} rounded-xl ${domainGlow} animate-in fade-in zoom-in-95 duration-100 font-sans select-none`}
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        // Prevent default nested contextmenu
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Category / Context Header */}
      {(categoryBadge || title) && (
        <div className="px-3 py-1.5 mb-1 border-b border-slate-800/80 flex items-center justify-between gap-2">
          {categoryBadge && (
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${domainBadgeBg}`}>
              {categoryBadge}
            </span>
          )}
          {title && (
            <span className="text-[11px] font-medium text-slate-300 truncate max-w-[170px]" title={title}>
              {title}
            </span>
          )}
        </div>
      )}

      {/* Item Listing */}
      <div className="flex flex-col gap-0.5">
        {items.length === 0 ? (
          <div className="px-3 py-2 text-[11px] text-slate-500 font-mono italic">
            No contextual actions available
          </div>
        ) : (
          items.map((item, idx) => {
            if (item.type === 'divider') {
              return (
                <div key={`div-${idx}`} className="h-px bg-slate-800/90 my-1 mx-2" />
              );
            }

            if (item.type === 'section-header') {
              return (
                <div key={`sec-${idx}`} className="px-3 pt-1.5 pb-0.5 text-[9px] font-mono tracking-wider uppercase text-slate-500">
                  {item.label}
                </div>
              );
            }

            if (item.children && item.children.length > 0) {
              return (
                <ContextSubMenu
                  key={item.id || idx}
                  item={item}
                  onItemClick={(child) => {
                    onClose();
                    onItemClick?.(child);
                  }}
                  parentAlignLeft={coords.alignLeft}
                />
              );
            }

            return (
              <ContextMenuItem
                key={item.id || idx}
                label={item.label}
                icon={item.icon}
                disabled={item.disabled}
                danger={item.danger}
                highlight={item.highlight}
                aiType={item.aiType}
                shortcut={item.shortcut}
                badge={item.badge}
                onClick={() => {
                  onClose();
                  onItemClick?.(item);
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ContextMenu;
