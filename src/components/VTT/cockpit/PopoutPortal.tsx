/**
 * @file PopoutPortal.tsx
 * @description Native Multi-Monitor Popout Window Portal.
 * Renders any React component tree into a separate native browser window
 * using ReactDOM.createPortal, copying all active stylesheets and Tailwind rules.
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ExternalLink, ArrowDownLeft } from 'lucide-react';

export interface PopoutPortalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const PopoutPortal: React.FC<PopoutPortalProps> = ({
  title = 'Tangent SF RP - Detached Cockpit',
  isOpen,
  onClose,
  children
}) => {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const externalWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (externalWindowRef.current) {
        externalWindowRef.current.close();
        externalWindowRef.current = null;
      }
      setContainerEl(null);
      return;
    }

    // Open native browser popup
    const popup = window.open(
      '',
      '_blank',
      'width=500,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );

    if (!popup) {
      console.warn('[PopoutPortal] Pop-up window was blocked by the browser.');
      onClose();
      return;
    }

    externalWindowRef.current = popup;
    popup.document.title = title;

    // Copy parent document stylesheets to child window
    Array.from(document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.href) {
          const newLink = popup.document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = styleSheet.href;
          popup.document.head.appendChild(newLink);
        } else if (styleSheet.cssRules) {
          const newStyle = popup.document.createElement('style');
          Array.from(styleSheet.cssRules).forEach((rule) => {
            newStyle.appendChild(popup.document.createTextNode(rule.cssText));
          });
          popup.document.head.appendChild(newStyle);
        }
      } catch (e) {
        // Cross-origin stylesheet access handling
      }
    });

    // Style popup document body
    popup.document.body.style.margin = '0';
    popup.document.body.style.backgroundColor = '#0c1017';
    popup.document.body.style.color = '#e2e8f0';
    popup.document.body.style.overflow = 'auto';

    // Create mount root container inside popup
    const mountContainer = popup.document.createElement('div');
    mountContainer.id = 'detached-cockpit-root';
    mountContainer.style.width = '100%';
    mountContainer.style.minHeight = '100vh';
    popup.document.body.appendChild(mountContainer);

    setContainerEl(mountContainer);

    // Clean up when popup is closed by user
    const handleUnload = () => {
      onClose();
    };
    popup.addEventListener('beforeunload', handleUnload);

    return () => {
      popup.removeEventListener('beforeunload', handleUnload);
      if (popup && !popup.closed) {
        popup.close();
      }
      externalWindowRef.current = null;
      setContainerEl(null);
    };
  }, [isOpen, title, onClose]);

  // When popped out, render placeholder in parent DOM
  if (isOpen) {
    return (
      <>
        {containerEl && ReactDOM.createPortal(children, containerEl)}
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#090d13] text-slate-400 font-mono text-xs space-y-3 select-none">
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-300">
            <ExternalLink size={28} className="mx-auto mb-2" />
            <div className="font-bold">Cockpit Popped Out</div>
          </div>
          <p className="text-slate-500 max-w-xs text-[11px]">
            This panel is currently running in a detached native OS window for multi-monitor gameplay.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowDownLeft size={13} />
            <span>Re-attach Panel</span>
          </button>
        </div>
      </>
    );
  }

  // Regular inline render
  return <>{children}</>;
};

export default PopoutPortal;
