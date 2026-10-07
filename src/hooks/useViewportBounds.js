import { useState, useLayoutEffect, useCallback } from 'react';

/**
 * Calculates optimal (x, y) coordinates for a floating context menu or popover,
 * ensuring it stays strictly within the visible viewport bounds.
 */
export function useViewportBounds(initialX, initialY, menuRef, options = {}) {
  const { padding = 12, defaultWidth = 260, defaultHeight = 320 } = options;
  const [coords, setCoords] = useState({ x: initialX, y: initialY, alignLeft: false, alignTop: true });

  const calculateBounds = useCallback(() => {
    if (typeof window === 'undefined') return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let width = defaultWidth;
    let height = defaultHeight;

    if (menuRef?.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.width > 0) width = rect.width;
      if (rect.height > 0) height = rect.height;
    }

    let x = initialX;
    let y = initialY;
    let alignLeft = false;
    let alignTop = true;

    // Check right edge
    if (x + width > vw - padding) {
      x = Math.max(padding, vw - width - padding);
      alignLeft = true;
    }

    // Check bottom edge
    if (y + height > vh - padding) {
      y = Math.max(padding, vh - height - padding);
      alignTop = false;
    }

    setCoords({ x, y, alignLeft, alignTop });
  }, [initialX, initialY, menuRef, padding, defaultWidth, defaultHeight]);

  useLayoutEffect(() => {
    calculateBounds();
  }, [calculateBounds]);

  return coords;
}

export default useViewportBounds;
