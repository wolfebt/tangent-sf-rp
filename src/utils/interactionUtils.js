import { useRef, useCallback } from 'react';

/**
 * Helper hook for items in trees, tables, and catalogs:
 * - Single left click / tap -> Select / View item
 * - Double left click (desktop) -> Open item edit modal
 * - Long press (1.5s+ on mobile) -> Open item edit modal
 */
export const useItemInteractions = ({ onSelect, onOpenEdit, delay = 1500 }) => {
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e) => {
    isLongPressRef.current = false;
    if (e.touches && e.touches[0]) {
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (onOpenEdit) onOpenEdit();
    }, delay);
  }, [onOpenEdit, delay]);

  const handleTouchMove = useCallback((e) => {
    if (!timerRef.current) return;
    if (e.touches && e.touches[0]) {
      const dx = Math.abs(e.touches[0].clientX - startPosRef.current.x);
      const dy = Math.abs(e.touches[0].clientY - startPosRef.current.y);
      if (dx > 10 || dy > 10) { // If user scrolls, cancel long press
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (!isLongPressRef.current) {
        if (onSelect) onSelect();
      }
    }
  }, [onSelect]);

  const handleClick = useCallback((e) => {
    // Desktop single click
    if (onSelect) onSelect();
  }, [onSelect]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (onOpenEdit) onOpenEdit();
  }, [onOpenEdit]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onClick: handleClick,
    onDoubleClick: handleDoubleClick
  };
};
