/

* @file DashboardOverlay.tsx  
* @description Stage 6.1: Canvas decoupling and input masking.  
* A full-screen React Portal overlay. It utilizes pointer-events: none on the root  
* to allow mouse clicks to pass through to the underlying PixiJS/WebGPU canvas,  
* while explicitly restoring pointer events for the UI panels.  
  \*/

import React, { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

import { ResponsiveGridConfig } from './layout/ResponsiveGridConfig';

// import { ContextActionBar } from './widgets/ContextActionBar';

export const DashboardOverlay: React.FC \= () \=\> {

const \[mounted, setMounted\] \= useState(false);

useEffect(() \=\> {

// Ensure portal only renders on the client after hydration

setMounted(true);

}, \[\]);

if (\!mounted) return null;

const overlayRoot \= document.getElementById('ui-overlay-root');

if (\!overlayRoot) {

console.error('\[DashboardOverlay\] \#ui-overlay-root missing from index.html');

return null;

}

return createPortal(

\<div

className="absolute inset-0 w-full h-full z-\[100\]"

// CRITICAL: This allows panning/zooming the WebGPU map underneath the UI

style={{ pointerEvents: 'none' }}

\>

  {/\*   
    The React-Grid-Layout manager.   
    It explicitly applies pointerEvents: 'auto' to its children so they can be clicked/dragged.  
  \*/}  
  \<ResponsiveGridConfig /\>

  {/\*   
    Floating Action Bar (Pinned to the bottom center, un-dockable)  
  \*/}  
  \<div   
    className="absolute bottom-8 left-1/2 transform \-translate-x-1/2 flex items-center gap-2 p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl shadow-2xl"  
    style={{ pointerEvents: 'auto' }}  
  \>  
    {/\* \<ContextActionBar /\> \*/}  
    \<span className="text-slate-300 font-mono text-sm px-4"\>TACTICAL HUD ONLINE\</span\>  
  \</div\>

\</div\>,  
overlayRoot

);

};