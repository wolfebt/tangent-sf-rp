/**
 * @file TripartiteLayout.tsx
 * @description Master IDE-style Tripartite Layout Container for Tangent VTT.
 * Houses the Left Module Catalog, Center WebGPU Stage Viewport, and Right Operational Cockpit.
 * Supports smooth transitions, drag-resizable panel boundaries, hotkeys ([ and ], F),
 * and floating collapse toggle handles.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Minimize2 
} from 'lucide-react';
import { useUILayoutStore } from './store/uiLayoutStore';

export interface TripartiteLayoutProps {
  /** Left Zone content (Module Catalog & Outliner) */
  leftPanel?: React.ReactNode;
  /** Center Zone content (Stage Viewport & Canvas) */
  centerStage: React.ReactNode;
  /** Right Zone content (Player Cockpit & GM Inspector) */
  rightPanel?: React.ReactNode;
  /** Optional Top Sub-Header / Breadcrumb Tab Bar */
  topBar?: React.ReactNode;
  /** Custom class overrides */
  className?: string;
}

export const TripartiteLayout: React.FC<TripartiteLayoutProps> = ({
  leftPanel,
  centerStage,
  rightPanel,
  topBar,
  className = ''
}) => {
  const {
    isLeftCollapsed,
    isRightCollapsed,
    isZenMode,
    leftWidth,
    rightWidth,
    toggleLeftCollapse,
    toggleRightCollapse,
    toggleZenMode,
    setLeftWidth,
    setRightWidth,
    isLeftWideMode,
    toggleLeftWideMode
  } = useUILayoutStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  // Global Keyboard Shortcuts: [ to toggle left, ] to toggle right, F for Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when typing inside inputs, textareas, or contentEditable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '{' || (e.key === '[' && e.shiftKey)) {
        e.preventDefault();
        toggleLeftWideMode();
      } else if (e.key === '[' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        toggleLeftCollapse();
      } else if (e.key === ']' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        toggleRightCollapse();
      } else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        toggleZenMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftCollapse, toggleRightCollapse, toggleZenMode, toggleLeftWideMode]);

  // Drag Resizing Logic for Left Rail
  const handleLeftResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  }, []);

  // Drag Resizing Logic for Right Rail
  const handleRightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
  }, []);

  useEffect(() => {
    if (!isDraggingLeft && !isDraggingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isDraggingLeft) {
        const newWidth = e.clientX - rect.left;
        setLeftWidth(newWidth);
      } else if (isDraggingRight) {
        const newWidth = rect.right - e.clientX;
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight, setLeftWidth, setRightWidth]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex flex-col bg-[#0b0f14] text-slate-100 overflow-hidden select-none font-sans ${className}`}
    >
      {/* Optional Top Sub-Header (Breadcrumb Scene Tabs or Macro Bar) */}
      {topBar && (
        <div className="w-full shrink-0 z-20 border-b border-slate-800/80 bg-[#0d1219]/95 backdrop-blur-md">
          {topBar}
        </div>
      )}

      {/* Main Tripartite Body */}
      <div className="relative w-full flex-1 flex overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: MODULE CATALOG & TAXONOMIES / TACTICAL COCKPIT              */}
        {/* ========================================================================= */}
        {leftPanel && (
          <aside
            style={{ 
              width: isLeftCollapsed ? '0px' : isLeftWideMode ? '70vw' : `${leftWidth}px`,
              minWidth: isLeftCollapsed ? '0px' : isLeftWideMode ? '640px' : '240px',
              maxWidth: isLeftCollapsed ? '0px' : isLeftWideMode ? '85vw' : '1100px'
            }}
            className={`relative shrink-0 h-full border-r border-slate-800/80 bg-[#0e131b]/95 backdrop-blur-md flex flex-col z-10 transition-[width] duration-200 ease-out overflow-hidden ${
              isLeftCollapsed ? 'border-r-0' : ''
            } ${isLeftWideMode ? 'shadow-[10px_0_30px_rgba(0,0,0,0.8)]' : ''}`}
          >
            <div 
              style={{ width: isLeftWideMode ? '100%' : `${leftWidth}px` }} 
              className={`h-full flex flex-col transition-opacity duration-150 ${
                isLeftCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {leftPanel}
            </div>
          </aside>
        )}

        {/* Left Resize Handle & Collapse Chevron Tab */}
        {leftPanel && !isLeftCollapsed && !isLeftWideMode && (
          <div
            onMouseDown={handleLeftResizeStart}
            className={`group absolute top-0 bottom-0 z-20 w-2 cursor-col-resize hover:bg-cyan-500/50 transition-colors flex items-center justify-center ${
              isDraggingLeft ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]' : 'bg-transparent'
            }`}
            style={{ left: `${leftWidth - 4}px` }}
            title="Drag to resize Left Cockpit. Hotkey: ["
          >
            {/* Hover Indicator Line */}
            <div className="w-1 h-12 rounded-full bg-slate-600 group-hover:bg-cyan-400 group-hover:h-24 transition-all shadow-sm" />
          </div>
        )}

        {/* Prominent Floating Left Panel Toggle Handle (Tactile Glowing Tab Pill) */}
        {leftPanel && (
          <button
            type="button"
            onClick={toggleLeftCollapse}
            style={{ 
              left: isLeftCollapsed ? '0px' : isLeftWideMode ? 'calc(70vw - 14px)' : `${leftWidth - 14}px` 
            }}
            className={`absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isLeftCollapsed 
                ? 'w-8 h-16 rounded-r-2xl bg-cyan-950/95 border-y-2 border-r-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.7)] hover:w-10 hover:bg-cyan-900 hover:text-white' 
                : 'w-7 h-14 rounded-full bg-[#090e15]/95 border-2 border-cyan-500/80 text-cyan-300 shadow-[0_0_15px_rgba(0,0,0,0.9)] hover:scale-110 hover:border-cyan-300 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]'
            }`}
            title={isLeftCollapsed ? "Expand Left Cockpit Rail (Hotkey: [)" : "Collapse Left Cockpit Rail (Hotkey: [)"}
          >
            {isLeftCollapsed ? (
              <ChevronRight size={20} className="text-cyan-300 animate-pulse drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        )}

        {/* ========================================================================= */}
        {/* CENTER ZONE: WEBGL/WEBGPU STAGE VIEWPORT (Full Bleed Tactical Canvas)    */}
        {/* ========================================================================= */}
        <main className="relative flex-1 h-full w-full overflow-hidden bg-black flex flex-col z-0">
          {centerStage}

          {/* Floating Exit Zen Mode Button (Only shown when stage is in full-bleed Zen Mode) */}
          {isZenMode && (
            <div className="absolute top-2.5 right-3 z-30 flex items-center gap-1.5 bg-[#0e131b]/90 border border-cyan-500/50 rounded-lg p-1 backdrop-blur-md shadow-[0_0_12px_rgba(34,211,238,0.25)] text-slate-300 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={toggleZenMode}
                className="px-2 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                title="Exit Zen Full-Stage View (F)"
              >
                <Minimize2 size={13} />
                <span className="text-[10px]">EXIT ZEN (F)</span>
              </button>
            </div>
          )}
        </main>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PLAYER COCKPIT & GM DYNAMIC INSPECTOR                       */}
        {/* ========================================================================= */}
        {/* Right Resize Handle & Collapse Chevron Tab */}
        {rightPanel && !isRightCollapsed && (
          <div
            onMouseDown={handleRightResizeStart}
            className={`group absolute top-0 bottom-0 z-20 w-2 cursor-col-resize hover:bg-amber-500/50 transition-colors flex items-center justify-center ${
              isDraggingRight ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]' : 'bg-transparent'
            }`}
            style={{ right: `${rightWidth - 4}px` }}
            title="Drag to resize Right Cockpit. Hotkey: ]"
          >
            {/* Hover Indicator Line */}
            <div className="w-1 h-12 rounded-full bg-slate-600 group-hover:bg-amber-400 group-hover:h-24 transition-all shadow-sm" />
          </div>
        )}

        {/* Prominent Floating Right Panel Toggle Handle (Tactile Glowing Tab Pill) */}
        {rightPanel && (
          <button
            type="button"
            onClick={toggleRightCollapse}
            style={{ right: isRightCollapsed ? '0px' : `${rightWidth - 14}px` }}
            className={`absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isRightCollapsed 
                ? 'w-8 h-16 rounded-l-2xl bg-amber-950/95 border-y-2 border-l-2 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.7)] hover:w-10 hover:bg-amber-900 hover:text-white' 
                : 'w-7 h-14 rounded-full bg-[#100e0a]/95 border-2 border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(0,0,0,0.9)] hover:scale-110 hover:border-amber-300 hover:text-white hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]'
            }`}
            title={isRightCollapsed ? "Expand Right Architect Cockpit (Hotkey: ])" : "Collapse Right Architect Cockpit (Hotkey: ])"}
          >
            {isRightCollapsed ? (
              <ChevronLeft size={20} className="text-amber-300 animate-pulse drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}

        {rightPanel && (
          <aside
            style={{ 
              width: isRightCollapsed ? '0px' : `${rightWidth}px`,
              minWidth: isRightCollapsed ? '0px' : '280px',
              maxWidth: isRightCollapsed ? '0px' : '560px'
            }}
            className={`relative shrink-0 h-full border-l border-slate-800/80 bg-[#0e131b]/95 backdrop-blur-md flex flex-col z-10 transition-[width] duration-200 ease-out overflow-hidden ${
              isRightCollapsed ? 'border-l-0' : ''
            }`}
          >
            <div 
              style={{ width: `${rightWidth}px` }} 
              className={`h-full flex flex-col transition-opacity duration-150 ${
                isRightCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {rightPanel}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default TripartiteLayout;
