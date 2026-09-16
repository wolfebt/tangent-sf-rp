import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AudioService } from '../../services/audioService';

/**
 * @file GuidanceRail.jsx
 * @description Standardized vertical navigation rail with color-coded theme styling,
 * icon containers matching the top buttons, visible monospace labels under icons, 
 * active state glow indicator bars, badge counters, audio feedback, and tooltips.
 */

const THEMES = {
  cyan: {
    iconBox: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 group-hover:text-cyan-300',
    activeBox: 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]',
    activeBtn: 'bg-cyan-950/70 border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.25)]',
    activeLabel: 'text-cyan-300 font-extrabold [text-shadow:0_0_8px_rgba(34,211,238,0.7)]',
    idleLabel: 'text-cyan-400/80 group-hover:text-cyan-200',
    bar: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    badge: 'bg-cyan-500 text-black'
  },
  blue: {
    iconBox: 'bg-blue-500/10 border-blue-500/30 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-400 group-hover:text-blue-300',
    activeBox: 'bg-blue-500/25 border-blue-400 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    activeBtn: 'bg-blue-950/70 border-blue-400/80 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    activeLabel: 'text-blue-300 font-extrabold [text-shadow:0_0_8px_rgba(59,130,246,0.7)]',
    idleLabel: 'text-blue-400/80 group-hover:text-blue-200',
    bar: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    badge: 'bg-blue-500 text-white'
  },
  amber: {
    iconBox: 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-400 group-hover:text-amber-300',
    activeBox: 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    activeBtn: 'bg-amber-950/70 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    activeLabel: 'text-amber-300 font-extrabold [text-shadow:0_0_8px_rgba(245,158,11,0.7)]',
    idleLabel: 'text-amber-400/80 group-hover:text-amber-200',
    bar: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    badge: 'bg-amber-500 text-black'
  },
  purple: {
    iconBox: 'bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-400 group-hover:text-purple-300',
    activeBox: 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    activeBtn: 'bg-purple-950/70 border-purple-400/80 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    activeLabel: 'text-purple-300 font-extrabold [text-shadow:0_0_8px_rgba(168,85,247,0.7)]',
    idleLabel: 'text-purple-400/80 group-hover:text-purple-200',
    bar: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    badge: 'bg-purple-500 text-white'
  },
  emerald: {
    iconBox: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400 group-hover:text-emerald-300',
    activeBox: 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    activeBtn: 'bg-emerald-950/70 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    activeLabel: 'text-emerald-300 font-extrabold [text-shadow:0_0_8px_rgba(16,185,129,0.7)]',
    idleLabel: 'text-emerald-400/80 group-hover:text-emerald-200',
    bar: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    badge: 'bg-emerald-500 text-black'
  }
};

export const GuidanceRail = ({
  items = [],
  activeId = null,
  onSelect = () => {},
  headerSlot = null,
  footerSlot = null,
  className = '',
  itemClassName = '',
  widthClass = 'w-18 sm:w-20',
  variant = 'cyan',
  ariaLabel = 'Navigation Rail'
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const getTheme = (item) => {
    const key = item.colorTheme || variant || 'cyan';
    return THEMES[key] || THEMES.cyan;
  };

  const handleItemClick = (item) => {
    if (item.disabled) return;
    AudioService.playTerminalBeep(1150, 0.02);
    if (item.onClick) {
      item.onClick();
    }
    onSelect(item.id, item);
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={`${widthClass} shrink-0 h-full bg-[#070a12]/95 backdrop-blur-md border-r border-slate-800/90 flex flex-col items-center justify-between py-2 sm:py-2.5 px-1 select-none z-20 font-sans shadow-lg ${className}`}
    >
      {/* Top Section / Header Slot */}
      <div className="flex flex-col items-center gap-2 w-full">
        {headerSlot && (
          <div className="w-full flex flex-col items-center justify-center mb-1">
            {headerSlot}
            <div className="w-8 h-px bg-slate-800/80 my-1" />
          </div>
        )}

        {/* Guidance Rail Navigation Items (Icon + Visible Label) */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const theme = getTheme(item);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({ item, theme, rect });
                }}
                onMouseLeave={() => setHoveredItem(null)}
                title={item.title || `${item.label}${item.sublabel ? ` • ${item.sublabel}` : ''}`}
                className={`group relative w-full py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none border ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed border-transparent'
                    : isActive
                    ? `${theme.activeBtn}`
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border-transparent hover:border-slate-800/80'
                } ${itemClassName}`}
              >
                {/* Active Left Glowing Indicator Bar */}
                {isActive && (
                  <span
                    className={`absolute -left-1 top-2 bottom-2 w-1 rounded-r-full ${theme.bar}`}
                  />
                )}

                {/* Color-Coded Icon Container Box (Matching Top Button Badges) */}
                <div 
                  className={`relative w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    isActive ? theme.activeBox : theme.iconBox
                  }`}
                >
                  {React.isValidElement(Icon) ? (
                    Icon
                  ) : Icon ? (
                    React.createElement(Icon, {
                      size: 17,
                      className: 'transition-colors'
                    })
                  ) : null}

                  {/* Top-Right Badge Notification / Counter */}
                  {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 px-1 py-0.2 min-w-[15px] h-[15px] rounded-full font-mono text-[8.5px] font-bold flex items-center justify-center shadow-md ${
                        item.badgeColor || theme.badge
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Visible Color-Coded Monospace Label Underneath Icon */}
                <span
                  className={`font-mono text-[9px] sm:text-[9.5px] uppercase tracking-wider text-center mt-1 truncate max-w-full px-0.5 leading-tight select-none transition-colors ${
                    isActive
                      ? theme.activeLabel
                      : theme.idleLabel
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section / Footer Slot */}
      {footerSlot && (
        <div className="w-full flex flex-col items-center gap-1.5 pt-2 border-t border-slate-800/80 mt-auto">
          {footerSlot}
        </div>
      )}

      {/* Topmost Portal Floating Tooltip for Desktop */}
      {hoveredItem && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          className="fixed z-[999999] pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-700 text-slate-100 font-mono text-[11px] font-bold whitespace-nowrap shadow-2xl animate-in fade-in duration-100 hidden md:block"
          style={{
            left: `${hoveredItem.rect.right + 10}px`,
            top: `${hoveredItem.rect.top + hoveredItem.rect.height / 2}px`,
            transform: 'translateY(-50%)',
            zIndex: 999999
          }}
        >
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: hoveredItem.theme.bar.split(' ')[0].replace('bg-', '') }} />
            <span>{hoveredItem.item.label}</span>
          </div>
          {hoveredItem.item.sublabel && (
            <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">{hoveredItem.item.sublabel}</div>
          )}
        </div>,
        document.body
      )}
    </nav>
  );
};

export default GuidanceRail;
