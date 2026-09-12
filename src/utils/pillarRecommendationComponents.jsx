import React from 'react';
import { PILLAR_THEMES } from './pillarRecommendations.js';

/**
 * React Component to render colored glowing recommendation dots for features, feature groups, and skills
 */
export const PillarMarkerDots = ({ recommendations = [], className = '', size = 'sm' }) => {
  if (!recommendations || recommendations.length === 0) return null;

  const dotDimensions = size === 'xs' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <span className={`inline-flex items-center gap-1 shrink-0 ${className}`}>
      {recommendations.map(p => (
        <span
          key={p.id}
          className={`${dotDimensions} rounded-full inline-block shrink-0 ${p.dotClass}`}
          title={p.tooltip}
        />
      ))}
    </span>
  );
};

/**
 * React Component for the 5 Identity Pillars Color Legend
 */
export const PillarRecommendationLegend = ({ className = '', title = 'Identity Recommendation Key:' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 ${className}`}>
      {title && (
        <span className="font-bold text-slate-300 uppercase tracking-wider text-[9.5px]">
          {title}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 border border-amber-300/80 shadow-[0_0_5px_rgba(245,158,11,0.7)] inline-block" />
        <span className="text-amber-300 font-semibold">Archetype</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 border border-cyan-300/80 shadow-[0_0_5px_rgba(34,211,238,0.7)] inline-block" />
        <span className="text-cyan-300 font-semibold">Species</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-sky-400 border border-sky-300/80 shadow-[0_0_5px_rgba(56,189,248,0.7)] inline-block" />
        <span className="text-sky-300 font-semibold">Occupation</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 border border-emerald-300/80 shadow-[0_0_5px_rgba(52,211,153,0.7)] inline-block" />
        <span className="text-emerald-300 font-semibold">Origin</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-purple-400 border border-purple-300/80 shadow-[0_0_5px_rgba(192,132,252,0.7)] inline-block" />
        <span className="text-purple-300 font-semibold">Faction</span>
      </div>
    </div>
  );
};
