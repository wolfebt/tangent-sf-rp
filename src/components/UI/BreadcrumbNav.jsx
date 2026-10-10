import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { AudioService } from '../../services/audioService';

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - Display text
 * @property {React.ComponentType<{ size?: number, className?: string }>|string} [icon] - Optional Lucide icon or emoji
 * @property {() => void} [onClick] - Click handler
 * @property {string} [to] - Optional path to navigate to
 * @property {boolean} [active] - Whether this crumb is the active leaf
 * @property {string|number} [badge] - Optional badge text or count
 * @property {string} [color] - Optional custom text color (e.g. 'text-cyan-400')
 * @property {string} [title] - Optional tooltip title
 */

/**
 * BreadcrumbNav Component
 *
 * @param {Object} props
 * @param {BreadcrumbItem[]} props.items - List of breadcrumb items in hierarchy order
 * @param {() => void} [props.onBack] - Custom back button handler. If not provided, defaults to navigate(-1).
 * @param {boolean} [props.showBack=true] - Whether to show the back button
 * @param {string} [props.backTitle='Back'] - Tooltip for back button
 * @param {React.ReactNode} [props.rightSlot] - Optional right-aligned slot for quick actions / toggles
 * @param {string} [props.className] - Additional wrapper CSS classes
 */
export const BreadcrumbNav = ({
  items = [],
  onBack,
  showBack = true,
  backTitle = 'Back to previous page / section',
  rightSlot = null,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    AudioService.playTerminalBeep(900, 0.02);
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleCrumbClick = (item) => {
    if (item.active) return;
    AudioService.playTerminalBeep(1100, 0.02);
    if (item.onClick) {
      item.onClick();
    } else if (item.to) {
      navigate(item.to);
    }
  };

  if (!items.length && !rightSlot) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center justify-between gap-2 px-3 py-1.5 bg-[#0a0f18]/90 border-b border-cyan-500/20 backdrop-blur-md text-xs font-mono select-none shrink-0 min-h-[38px] z-20 shadow-xs ${className}`}
    >
      {/* Left: Back Button & Crumb Trail */}
      <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar py-0.5">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-1 px-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 group"
            title={backTitle}
            aria-label={backTitle}
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] uppercase font-bold tracking-wider hidden xs:inline">Back</span>
          </button>
        )}

        {/* Trail Items */}
        <ol className="flex items-center gap-1 min-w-0 list-none m-0 p-0">
          {items.map((crumb, idx) => {
            if (!crumb || !crumb.label) return null;
            const isLast = idx === items.length - 1 || crumb.active;
            const Icon = crumb.icon;
            const isClickable = !isLast && (Boolean(crumb.onClick) || Boolean(crumb.to));

            return (
              <li key={`${crumb.label}-${idx}`} className="flex items-center gap-1 min-w-0 shrink-0">
                {idx > 0 && (
                  <ChevronRight size={11} className="text-slate-600 shrink-0" aria-hidden="true" />
                )}

                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => handleCrumbClick(crumb)}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-800/80 text-slate-400 hover:text-cyan-200 transition-colors cursor-pointer group max-w-[160px] sm:max-w-[220px] truncate"
                    title={crumb.title || `Go to ${crumb.label}`}
                  >
                    {Icon && (
                      typeof Icon === 'string' ? (
                        <span>{Icon}</span>
                      ) : (
                        <Icon size={12} className={crumb.color || 'text-cyan-400 group-hover:text-cyan-300'} />
                      )
                    )}
                    <span className="truncate font-semibold tracking-wide">{crumb.label}</span>
                    {crumb.badge !== undefined && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold shrink-0">
                        {crumb.badge}
                      </span>
                    )}
                  </button>
                ) : (
                  <div
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md max-w-[200px] sm:max-w-[320px] truncate ${
                      isLast
                        ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 font-bold shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                        : 'text-slate-300'
                    }`}
                    title={crumb.title || crumb.label}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {Icon && (
                      typeof Icon === 'string' ? (
                        <span>{Icon}</span>
                      ) : (
                        <Icon size={12} className={crumb.color || (isLast ? 'text-cyan-300' : 'text-slate-400')} />
                      )
                    )}
                    <span className="truncate tracking-wide">{crumb.label}</span>
                    {crumb.badge !== undefined && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 font-bold shrink-0">
                        {crumb.badge}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Right Slot: Custom actions, indicators, toggles */}
      {rightSlot && (
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
        </div>
      )}
    </nav>
  );
};

export default BreadcrumbNav;
