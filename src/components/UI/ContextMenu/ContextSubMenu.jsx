import React, { useState, useRef, useEffect } from 'react';
import ContextMenuItem from './ContextMenuItem';

export const ContextSubMenu = ({
  item,
  onItemClick,
  parentAlignLeft = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const submenuRef = useRef(null);
  const [flyLeft, setFlyLeft] = useState(parentAlignLeft);

  // Check if submenu will hit right viewport edge
  useEffect(() => {
    if (isOpen && submenuRef.current && typeof window !== 'undefined') {
      const rect = submenuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth - 12) {
        setFlyLeft(true);
      }
    }
  }, [isOpen]);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ContextMenuItem
        label={item.label}
        icon={item.icon}
        disabled={item.disabled}
        highlight={item.highlight}
        aiType={item.aiType}
        hasSubmenu={true}
        isOpen={isOpen}
      />

      {isOpen && item.children && item.children.length > 0 && (
        <div
          ref={submenuRef}
          className={`absolute top-0 z-50 min-w-[210px] max-w-[300px] py-1.5 px-1 bg-[#0c1017]/98 backdrop-blur-2xl border border-slate-700/80 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-100 ${
            flyLeft ? 'right-full mr-1' : 'left-full ml-1'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {item.children.map((child, idx) => {
            if (child.type === 'divider') {
              return <div key={`div-${idx}`} className="h-px bg-slate-800 my-1 mx-2" />;
            }
            if (child.children && child.children.length > 0) {
              return (
                <ContextSubMenu
                  key={child.id || idx}
                  item={child}
                  onItemClick={onItemClick}
                  parentAlignLeft={flyLeft}
                />
              );
            }
            return (
              <ContextMenuItem
                key={child.id || idx}
                label={child.label}
                icon={child.icon}
                disabled={child.disabled}
                danger={child.danger}
                highlight={child.highlight}
                aiType={child.aiType}
                shortcut={child.shortcut}
                badge={child.badge}
                onClick={() => {
                  setIsOpen(false);
                  onItemClick(child);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContextSubMenu;
