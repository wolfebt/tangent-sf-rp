import React from 'react';

export const FloatingCombatText = ({ activeFloats = [] }) => {
  if (!activeFloats || activeFloats.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {activeFloats.map((float) => (
        <div
          key={float.id}
          className={`absolute font-mono font-black text-sm tracking-wider animate-float-up select-none ${
            float.type === 'damage'
              ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.95)]'
              : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.95)]'
          }`}
          style={{
            left: `${float.screenX}px`,
            top: `${float.screenY}px`
          }}
        >
          {float.text}
        </div>
      ))}
    </div>
  );
};

export default FloatingCombatText;
