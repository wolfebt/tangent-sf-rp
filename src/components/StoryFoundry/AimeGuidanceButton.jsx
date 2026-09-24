import React from 'react';
import { Sparkles } from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const AimeGuidanceButton = ({
  onClick,
  label = 'AIME Guidance',
  size = 'sm',
  className = '',
  title = 'Consult AIME Creative & Tactical Co-Pilot'
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    AudioService.playTerminalBeep(980, 0.04);
    if (onClick) onClick();
  };

  const isSmall = size === 'sm';
  const isXs = size === 'xs';

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      className={`bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-mono font-bold uppercase transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center gap-1.5 cursor-pointer rounded-lg ${
        isXs 
          ? 'px-2 py-0.5 text-[9px]' 
          : isSmall 
          ? 'px-2.5 py-1 text-[10px]' 
          : 'px-3 py-1.5 text-xs'
      } ${className}`}
    >
      <Sparkles size={isXs ? 10 : isSmall ? 12 : 14} className="text-amber-400 animate-pulse" />
      {label && <span>{label}</span>}
    </button>
  );
};

export default AimeGuidanceButton;
