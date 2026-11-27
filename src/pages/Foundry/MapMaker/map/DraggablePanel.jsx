import React, { useState, useEffect, useRef } from 'react';

let nextPanelZIndex = 45;

const DraggablePanel = ({ 
  id, 
  defaultPosition = { x: 0, y: 0 }, 
  className = '', 
  children
}) => {
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(`draggable_panel_${id}`);
      if (saved && saved !== "undefined") {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to parse saved position for", id, e);
    }
    return defaultPosition;
  });
  const [zIndex, setZIndex] = useState(() => ++nextPanelZIndex);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef(null);
  const positionRef = useRef(position);
  positionRef.current = position;
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  const clampToViewport = (candidatePos) => {
    if (typeof window === 'undefined') return candidatePos;
    const el = panelRef.current;
    if (!el) return candidatePos;
    const rect = el.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return candidatePos;
    const winW = window.innerWidth || 1280;
    const winH = window.innerHeight || 720;
    const minVisibleLeft = 8;
    const maxVisibleLeft = Math.max(8, winW - rect.width - 8);
    const minVisibleTop = 8;
    const maxVisibleTop = Math.max(8, winH - Math.min(rect.height, 120) - 8);
    const targetLeft = Math.max(minVisibleLeft, Math.min(rect.left, maxVisibleLeft));
    const targetTop = Math.max(minVisibleTop, Math.min(rect.top, maxVisibleTop));
    const dx = targetLeft - rect.left;
    const dy = targetTop - rect.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return candidatePos;
    return {
      x: Math.round(candidatePos.x + dx),
      y: Math.round(candidatePos.y + dy)
    };
  };

  const persistPosition = (pos) => {
    try {
      localStorage.setItem(`draggable_panel_${id}`, JSON.stringify(pos));
    } catch (e) {
      console.warn("Failed to persist draggable panel position:", id, e);
    }
  };

  useEffect(() => {
    const syncClamp = () => {
      const clamped = clampToViewport(positionRef.current);
      if (clamped.x !== positionRef.current.x || clamped.y !== positionRef.current.y) {
        setPosition(clamped);
        persistPosition(clamped);
      }
    };
    syncClamp();
    window.addEventListener('resize', syncClamp);
    return () => window.removeEventListener('resize', syncClamp);
  }, [id]);

  const handlePointerDown = (e) => {
    // Bring focused panel to front via React zIndex state (never reparent DOM nodes)
    setZIndex(++nextPanelZIndex);

    // Do not start drag if clicked on an interactive element (button, input, textarea, select, link, or data-no-drag element)
    if (e.target.closest('button, input, textarea, select, a, [data-no-drag]')) {
      return;
    }

    // Only start dragging if the target is a header or has the drag-handle class
    const isDragHandle = e.target.closest('.drag-handle');
    if (isDragHandle) {
      e.preventDefault();
      // Ensure any inputs lose focus
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: positionRef.current.x,
        startPosY: positionRef.current.y
      };
    }
  };

  useEffect(() => {
    if (!isDragging) return undefined;

    const handlePointerMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.startPosX + dx,
        y: dragRef.current.startPosY + dy
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      const clamped = clampToViewport(positionRef.current);
      if (clamped.x !== positionRef.current.x || clamped.y !== positionRef.current.y) {
        setPosition(clamped);
      }
      persistPosition(clamped);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, id]);

  return (
    <div 
      ref={panelRef}
      className={className} 
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, touchAction: 'none', zIndex }}
      onPointerDown={handlePointerDown}
    >
      {children}
    </div>
  );
};

export default DraggablePanel;
