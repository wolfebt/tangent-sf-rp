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
  const positionRef = useRef(position);
  positionRef.current = position;
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  const persistPosition = (pos) => {
    try {
      localStorage.setItem(`draggable_panel_${id}`, JSON.stringify(pos));
    } catch (e) {
      console.warn("Failed to persist draggable panel position:", id, e);
    }
  };

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
      persistPosition(positionRef.current);
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
      className={className} 
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, touchAction: 'none', zIndex }}
      onPointerDown={handlePointerDown}
    >
      {children}
    </div>
  );
};

export default DraggablePanel;
