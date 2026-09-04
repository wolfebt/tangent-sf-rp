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
  Maximize2, 
  Minimize2, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen 
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
    setRightWidth
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

      if (e.key === '[' && !e.ctrlKey && !e.altKey && !e.metaKey) {
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
  }, [toggleLeftCollapse, toggleRightCollapse, toggleZenMode]);

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
        {/* LEFT COLUMN: MODULE CATALOG & TAXONOMIES                                  */}
        {/* ========================================================================= */}
        {leftPanel && (
          <aside
            style={{ 
              width: isLeftCollapsed ? '0px' : `${leftWidth}px`,
              minWidth: isLeftCollapsed ? '0px' : '240px',
              maxWidth: isLeftCollapsed ? '0px' : '520px'
            }}
            className={`relative shrink-0 h-full border-r border-slate-800/80 bg-[#0e131b]/95 backdrop-blur-md flex flex-col z-10 transition-[width] duration-200 ease-out overflow-hidden ${
              isLeftCollapsed ? 'border-r-0' : ''
            }`}
          >
            <div 
              style={{ width: `${leftWidth}px` }} 
              className={`h-full flex flex-col transition-opacity duration-150 ${
                isLeftCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {leftPanel}
            </div>
          </aside>
        )}

        {/* Left Resize Handle & Collapse Chevron Tab */}
        {leftPanel && !isLeftCollapsed && (
          <div
            onMouseDown={handleLeftResizeStart}
            className={`group absolute top-0 bottom-0 z-20 w-1.5 cursor-col-resize hover:bg-cyan-500/50 transition-colors flex items-center justify-center ${
              isDraggingLeft ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-transparent'
            }`}
            style={{ left: `${leftWidth - 3}px` }}
            title="Drag to resize Left Catalog. Hotkey: ["
          >
            {/* Hover Indicator Line */}
            <div className="w-0.5 h-8 rounded-full bg-slate-600 group-hover:bg-cyan-400 group-hover:h-16 transition-all" />
          </div>
        )}

        {/* Floating Left Panel Toggle Handle (When Collapsed or Hovered) */}
        {leftPanel && (
          <button
            type="button"
            onClick={toggleLeftCollapse}
            style={{ left: isLeftCollapsed ? '4px' : `${leftWidth - 14}px` }}
            className={`absolute top-3 z-30 w-7 h-7 rounded-full bg-[#131b26]/90 border border-slate-700/80 hover:border-cyan-400 hover:text-cyan-300 text-slate-400 flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer ${
              isLeftCollapsed 
                ? 'opacity-80 hover:opacity-100 hover:scale-110 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                : 'opacity-0 hover:opacity-100 focus:opacity-100'
            }`}
            title={isLeftCollapsed ? "Expand Left Module Catalog ([)" : "Collapse Left Module Catalog ([)"}
          >
            {isLeftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* ========================================================================= */}
        {/* CENTER ZONE: WEBGL/WEBGPU STAGE VIEWPORT (Full Bleed Tactical Canvas)    */}
        {/* ========================================================================= */}
        <main className="relative flex-1 h-full w-full overflow-hidden bg-black flex flex-col z-0">
          {centerStage}

          {/* Floating Canvas Quick Controls Bar (Top Center / Overlay) */}
          <div className="absolute top-2.5 right-3 z-20 flex items-center gap-1.5 bg-[#0e131b]/80 border border-slate-800/80 rounded-lg p-1 backdrop-blur-md shadow-xl text-slate-300">
            {/* Quick Zen Mode Toggle */}
            <button
              type="button"
              onClick={toggleZenMode}
              className={`p-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                isZenMode 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={isZenMode ? "Exit Zen Full-Stage View (F)" : "Enter Zen Full-Stage View (F)"}
            >
              {isZenMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span className="text-[10px] font-bold hidden sm:inline">{isZenMode ? 'EXIT ZEN' : 'ZEN (F)'}</span>
            </button>

            {/* Quick Panel Toggle Indicators */}
            {leftPanel && (
              <button
                type="button"
                onClick={toggleLeftCollapse}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  !isLeftCollapsed ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Left Catalog ([)"
              >
                {!isLeftCollapsed ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
              </button>
            )}

            {rightPanel && (
              <button
                type="button"
                onClick={toggleRightCollapse}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  !isRightCollapsed ? 'text-amber-400 bg-amber-950/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Right Cockpit (])"
              >
                {!isRightCollapsed ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
              </button>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PLAYER COCKPIT & GM DYNAMIC INSPECTOR                       */}
        {/* ========================================================================= */}
        {/* Right Resize Handle & Collapse Chevron Tab */}
        {rightPanel && !isRightCollapsed && (
          <div
            onMouseDown={handleRightResizeStart}
            className={`group absolute top-0 bottom-0 z-20 w-1.5 cursor-col-resize hover:bg-amber-500/50 transition-colors flex items-center justify-center ${
              isDraggingRight ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-transparent'
            }`}
            style={{ right: `${rightWidth - 3}px` }}
            title="Drag to resize Right Cockpit. Hotkey: ]"
          >
            {/* Hover Indicator Line */}
            <div className="w-0.5 h-8 rounded-full bg-slate-600 group-hover:bg-amber-400 group-hover:h-16 transition-all" />
          </div>
        )}

        {/* Floating Right Panel Toggle Handle (When Collapsed or Hovered) */}
        {rightPanel && (
          <button
            type="button"
            onClick={toggleRightCollapse}
            style={{ right: isRightCollapsed ? '4px' : `${rightWidth - 14}px` }}
            className={`absolute top-3 z-30 w-7 h-7 rounded-full bg-[#131b26]/90 border border-slate-700/80 hover:border-amber-400 hover:text-amber-300 text-slate-400 flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer ${
              isRightCollapsed 
                ? 'opacity-80 hover:opacity-100 hover:scale-110 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                : 'opacity-0 hover:opacity-100 focus:opacity-100'
            }`}
            title={isRightCollapsed ? "Expand Right Cockpit (])" : "Collapse Right Cockpit (])"}
          >
            {isRightCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
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
