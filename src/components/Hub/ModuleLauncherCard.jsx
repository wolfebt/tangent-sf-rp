import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { AudioService } from '../../services/audioService';

const THEME_STYLES = {
  cyan: {
    border: 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/15 hover:bg-slate-900/80 shadow-[0_0_15px_rgba(34,211,238,0.1)]',
    activeBorder: 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    title: 'text-white group-hover:text-cyan-300',
    badge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500/20',
    subActive: 'bg-cyan-500/20 border-cyan-400/80 text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.2)]',
    button: 'text-cyan-400 group-hover:text-cyan-300'
  },
  emerald: {
    border: 'border-2 border-emerald-500/70 hover:border-emerald-400 bg-emerald-950/20 hover:bg-slate-900/80 shadow-[0_0_18px_rgba(52,211,153,0.18)]',
    activeBorder: 'border-2 border-emerald-400 bg-emerald-950/45 shadow-[0_0_22px_rgba(52,211,153,0.35)]',
    title: 'text-white group-hover:text-emerald-300',
    badge: 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/25',
    subActive: 'bg-emerald-500/25 border border-emerald-400/80 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
    button: 'text-emerald-400 group-hover:text-emerald-300 font-bold'
  },
  purple: {
    border: 'border-purple-500/40 hover:border-purple-400 bg-purple-950/15 hover:bg-slate-900/80 shadow-[0_0_15px_rgba(192,132,252,0.1)]',
    activeBorder: 'border-purple-400 bg-purple-950/40 shadow-[0_0_20px_rgba(192,132,252,0.3)]',
    title: 'text-white group-hover:text-purple-300',
    badge: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-500/20',
    subActive: 'bg-purple-500/20 border-purple-400/80 text-purple-200 shadow-[0_0_8px_rgba(192,132,252,0.2)]',
    button: 'text-purple-400 group-hover:text-purple-300'
  },
  amber: {
    border: 'border-2 border-amber-500/70 hover:border-amber-400 bg-amber-950/20 hover:bg-slate-900/80 shadow-[0_0_18px_rgba(251,191,36,0.18)]',
    activeBorder: 'border-2 border-amber-400 bg-amber-950/45 shadow-[0_0_22px_rgba(251,191,36,0.35)]',
    title: 'text-white group-hover:text-amber-300',
    badge: 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold',
    iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/25',
    subActive: 'bg-amber-500/25 border border-amber-400/80 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]',
    button: 'text-amber-400 group-hover:text-amber-300 font-bold'
  }
};

export const ModuleLauncherCard = ({
  title,
  subtitle,
  description,
  badge,
  icon: Icon,
  path,
  theme = 'cyan',
  frequency = 1100,
  isActive = false,
  onClick,
  subOptions = [],
  activeSubOptionId = null,
  compact = false,
  small = false
}) => {
  const navigate = useNavigate();
  const styles = THEME_STYLES[theme] || THEME_STYLES.cyan;

  const handleClick = () => {
    AudioService.playTerminalBeep(frequency, 0.03);
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`backdrop-blur-md ${small ? 'p-2' : compact ? 'p-2.5' : 'p-3'} rounded-xl border ${
        isActive ? styles.activeBorder : styles.border
      } flex flex-col justify-between cursor-pointer transition-all duration-200 group relative select-none`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {Icon && (
              <div className={`${small ? 'p-1' : compact ? 'p-1' : 'p-1.5'} rounded-lg border ${styles.iconBg} transition-colors shrink-0`}>
                <Icon size={small ? 13 : compact ? 15 : 16} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className={`${small ? 'text-[11px]' : 'text-xs sm:text-sm'} font-bold font-mono tracking-wider transition-colors truncate ${styles.title}`}>
                {title}
              </h3>
              <p className={`${small ? 'text-[9px]' : 'text-[10px]'} text-slate-400 font-mono truncate`}>{subtitle}</p>
            </div>
          </div>

          {badge && (
            <span className={`${small ? 'px-1.5 py-0 text-[8px]' : 'px-1.5 py-0.2 text-[9px]'} rounded-full border font-mono font-bold shrink-0 ${styles.badge}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className={`${small ? 'text-[9px] mt-1' : compact ? 'text-[10px] mt-1' : 'text-[10px] mt-1.5'} text-slate-400 line-clamp-2 leading-tight`}>
            {description}
          </p>
        )}

        {/* Sub-Options List */}
        {subOptions && subOptions.length > 0 && (
          <div className={`${small ? 'mt-1 pt-1' : compact ? 'mt-1.5 pt-1.5' : 'mt-2 pt-2'} border-t border-slate-800/80 space-y-1`} onClick={(e) => e.stopPropagation()}>
            <span className={`${small ? 'text-[8px]' : 'text-[8.5px]'} font-mono uppercase tracking-widest text-slate-500 block mb-0.5`}>
              Catalogs & Workspaces
            </span>
            <div className="grid grid-cols-1 gap-1">
              {subOptions.map((sub) => {
                const isSubActive = activeSubOptionId === sub.id;
                const SubIcon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      AudioService.playTerminalBeep(frequency + 50, 0.02);
                      sub.onClick?.();
                    }}
                    className={`w-full ${small ? 'px-1.5 py-0.5 text-[9.5px]' : 'px-2 py-1 text-[10.5px]'} rounded-md border text-left font-mono font-medium transition-all flex items-center justify-between gap-1.5 ${
                      isSubActive
                        ? styles.subActive
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {SubIcon && <SubIcon size={small ? 10 : 12} className="shrink-0 text-slate-400" />}
                      <span className={`truncate ${small ? 'text-[9px]' : 'text-[10px]'}`}>{sub.label}</span>
                    </div>
                    {sub.badge && (
                      <span className={`${small ? 'text-[8px]' : 'text-[8.5px]'} opacity-70 px-1 py-0.2 bg-black/40 rounded`}>
                        {sub.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Quick Access CTA */}
      <div className={`${small ? 'mt-1 pt-1 text-[8px]' : compact ? 'mt-1.5 pt-1 text-[9px]' : 'mt-2 pt-1.5 text-[9px]'} border-t border-slate-800/60 flex items-center justify-between font-mono text-slate-500`}>
        <span className="uppercase tracking-wider">
          {subOptions?.length ? 'SELECT SUB-MODULE' : 'ACCESS MODULE'}
        </span>
        <div className={`flex items-center gap-0.5 font-bold ${styles.button} transition-transform group-hover:translate-x-0.5`}>
          <span>OPEN</span>
          <ChevronRight size={small ? 9 : 11} />
        </div>
      </div>
    </div>
  );
};

export default ModuleLauncherCard;
