import React, { useState, useEffect, useRef } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  useEffect(() => {
    localStorage.setItem(`draggable_panel_${id}`, JSON.stringify(position));
  }, [position, id]);

  const handlePointerDown = (e) => {
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
        startPosX: position.x,
        startPosY: position.y
      };
      
      // optionally bring to front
      const el = e.currentTarget;
      if (el && el.parentNode) {
        el.parentNode.appendChild(el);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.startPosX + dx,
      y: dragRef.current.startPosY + dy
    });
  };

  const handlePointerUp = () => {
    if (isDragging) setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  return (
    <div 
      className={className} 
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
    >
      {children}
    </div>
  );
};

export default DraggablePanel;
