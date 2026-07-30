import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * High-performance virtualized list component for rendering large datasets at 60 FPS.
 * Uses viewport measurement, requestAnimationFrame throttled scroll tracking,
 * and absolute positioning for smooth scrolling without DOM inflation.
 */
export const VirtualizedList = ({
  items = [],
  itemHeight = 76,
  renderItem,
  containerClassName = "flex-1 overflow-y-auto p-4 space-y-2 bg-slate-950/40",
  overscan = 5,
  getKey = (item, index) => item?.id || item?.name || index,
  resetScrollDeps = []
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(400);
  const animationFrameIdRef = useRef(null);

  // Measure viewport height dynamically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateHeight = () => {
      if (el) {
        setViewportHeight(el.clientHeight || 400);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Reset scroll to top when dependencies change (e.g. search filter changes)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, resetScrollDeps);

  // Throttled scroll handler using requestAnimationFrame
  const handleScroll = useCallback((e) => {
    const currentScrollTop = e.target.scrollTop;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(() => {
      setScrollTop(currentScrollTop);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  const totalItems = items.length;
  const totalHeight = totalItems * itemHeight;

  // Calculate visible range with overscan buffering
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan);

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={containerClassName}
      style={{ position: 'relative' }}
    >
      {totalItems === 0 ? null : (
        <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const top = actualIndex * itemHeight;
            const key = getKey(item, actualIndex);

            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: 0,
                  right: 0,
                  height: `${itemHeight}px`,
                  boxSizing: 'border-box'
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
