import React from 'react';
import { ChevronRight } from 'lucide-react';

export const ContextMenuItem = ({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  danger = false,
  highlight = false, // for AI items (BASTION / AIME)
  aiType = null,     // 'BASTION' | 'AIME'
  shortcut = null,
  badge = null,
  hasSubmenu = false,
  isOpen = false,
  onMouseEnter,
  onMouseLeave
}) => {
  let hoverBg = 'hover:bg-slate-800/80 hover:text-white';
  let textColor = 'text-slate-200';
  let iconColor = 'text-slate-400 group-hover:text-cyan-400';

  if (danger) {
    hoverBg = 'hover:bg-red-950/60 hover:text-red-300';
    textColor = 'text-red-400';
    iconColor = 'text-red-400';
  } else if (highlight || aiType) {
    if (aiType === 'AIME') {
      hoverBg = 'hover:bg-purple-950/60 hover:text-purple-200';
      textColor = 'text-purple-300 font-semibold';
      iconColor = 'text-purple-400 group-hover:text-purple-300';
    } else {
      hoverBg = 'hover:bg-cyan-950/60 hover:text-cyan-200';
      textColor = 'text-cyan-300 font-semibold';
      iconColor = 'text-cyan-400 group-hover:text-cyan-300';
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group w-full px-3 py-1.5 flex items-center justify-between text-left text-xs transition-colors rounded-md select-none ${
        disabled ? 'opacity-40 cursor-not-allowed text-slate-500' : `${hoverBg} ${textColor} cursor-pointer`
      } ${isOpen ? 'bg-slate-800 text-white' : ''}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        {Icon && (
          <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${iconColor}`} />
        )}
        <span className="truncate">{label}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        {badge && (
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-400 border border-slate-700/60">
            {badge}
          </span>
        )}
        {shortcut && (
          <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
            {shortcut}
          </span>
        )}
        {hasSubmenu && (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform" />
        )}
      </div>
    </button>
  );
};

export default ContextMenuItem;
