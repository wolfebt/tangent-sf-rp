import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AudioService } from '../../services/audioService';

const THEME_STYLES = {
  cyan: {
    border: 'border-slate-800 hover:border-cyan-400/80',
    glow: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.25)]',
    title: 'text-white group-hover:text-cyan-300',
    badge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500/20',
    button: 'text-cyan-400 group-hover:text-cyan-300'
  },
  emerald: {
    border: 'border-slate-800 hover:border-emerald-400/80',
    glow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.25)]',
    title: 'text-white group-hover:text-emerald-300',
    badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20',
    button: 'text-emerald-400 group-hover:text-emerald-300'
  },
  purple: {
    border: 'border-slate-800 hover:border-purple-400/80',
    glow: 'hover:shadow-[0_0_20px_rgba(192,132,252,0.25)]',
    title: 'text-white group-hover:text-purple-300',
    badge: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-500/20',
    button: 'text-purple-400 group-hover:text-purple-300'
  },
  amber: {
    border: 'border-slate-800 hover:border-amber-400/80',
    glow: 'hover:shadow-[0_0_20px_rgba(251,191,36,0.25)]',
    title: 'text-white group-hover:text-amber-300',
    badge: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20',
    button: 'text-amber-400 group-hover:text-amber-300'
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
  frequency = 1100
}) => {
  const navigate = useNavigate();
  const styles = THEME_STYLES[theme] || THEME_STYLES.cyan;

  const handleClick = () => {
    AudioService.playTerminalBeep(frequency, 0.03);
    navigate(path);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-slate-900/20 hover:bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border ${styles.border} ${styles.glow} flex flex-col justify-between cursor-pointer transition-all duration-300 group hover:-translate-y-1 relative select-none shadow-[0_4px_24px_rgba(0,0,0,0.4)]`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2.5 rounded-lg border ${styles.iconBg} transition-colors shrink-0`}>
                <Icon size={20} />
              </div>
            )}
            <div>
              <h3 className={`text-lg font-bold font-mono tracking-wider transition-colors ${styles.title}`}>
                {title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{subtitle}</p>
            </div>
          </div>

          {badge && (
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold shrink-0 ${styles.badge}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 mt-3.5 leading-relaxed opacity-20 group-hover:opacity-80 transition-opacity duration-300">
          {description}
        </p>
      </div>

      {/* Launch Footer CTA */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between opacity-20 group-hover:opacity-80 transition-opacity duration-300">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Module Access
        </span>
        <div className={`flex items-center gap-1 text-xs font-mono font-bold ${styles.button} transition-transform group-hover:translate-x-1`}>
          <span>LAUNCH</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </div>
  );
};

export default ModuleLauncherCard;
