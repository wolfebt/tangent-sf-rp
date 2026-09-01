/**
 * @file ResponsiveGridConfig.tsx
 * @description Stage 6.2: Golden Layout framework and viewport scaling.
 * Configures the draggable, snappable dashboard using react-grid-layout. 
 * Defines strict breakpoints to seamlessly transition from dual-monitor 
 * 4K setups down to GM-tablet interfaces.
 */

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Wraps the grid to automatically calculate width based on the window
const ResponsiveGridLayout = WidthProvider(Responsive);

// Define breakpoints (Pixels)
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

// Define how many columns exist at each breakpoint
const COLS = { lg: 24, md: 16, sm: 10, xs: 6, xxs: 4 };

// Default Desktop Layout
const defaultDesktopLayout = [
  { i: 'combat-tracker', x: 0, y: 0, w: 4, h: 10, minW: 3 },
  { i: 'chat-log',       x: 20, y: 0, w: 4, h: 14, minW: 3 },
  { i: 'selected-actor', x: 0, y: 10, w: 6, h: 6, minW: 4 },
];

export const ResponsiveGridConfig: React.FC = () => {
  const [layouts, setLayouts] = useState({ lg: defaultDesktopLayout });

  // Hook for Firestore Profile Sync (Stage 6.3) would inject here
  // useEffect(() => { fetchLayoutFromFirestore().then(setLayouts) }, []);

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    // In production, debounce this call and push to Firestore debouncer
    // syncLayoutToGCP(allLayouts);
  };

  return (
    <div className="w-full h-full" style={{ pointerEvents: 'none' }}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        // Prevents items from pushing each other out of the way aggressively
        compactType="vertical" 
        margin={[10, 10]}
      >
        {/* Rendered Dashboard Widgets (Restoring pointer-events for interaction) */}
        
        <div key="combat-tracker" className="bg-slate-800/90 border border-slate-700 rounded shadow-lg overflow-hidden flex flex-col" style={{ pointerEvents: 'auto' }}>
          <div className="bg-slate-900 text-xs font-bold text-slate-400 p-1 cursor-grab drag-handle">INITIATIVE</div>
          <div className="p-2 flex-grow overflow-auto text-slate-200">
            {/* <CombatTrackerWidget /> */}
            [Tracker Pending]
          </div>
        </div>

        <div key="chat-log" className="bg-slate-800/90 border border-slate-700 rounded shadow-lg overflow-hidden flex flex-col" style={{ pointerEvents: 'auto' }}>
          <div className="bg-slate-900 text-xs font-bold text-slate-400 p-1 cursor-grab drag-handle">COMMS</div>
          <div className="p-2 flex-grow overflow-auto text-slate-200">
            [Yjs CRDT Chat Pending]
          </div>
        </div>

        <div key="selected-actor" className="bg-slate-800/90 border border-slate-700 rounded shadow-lg overflow-hidden flex flex-col" style={{ pointerEvents: 'auto' }}>
          <div className="bg-slate-900 text-xs font-bold text-slate-400 p-1 cursor-grab drag-handle">TARGET DATA</div>
          <div className="p-2 flex-grow overflow-auto text-slate-200">
            [Entity Sheet Pending]
          </div>
        </div>

      </ResponsiveGridLayout>
    </div>
  );
};