import { useState, useEffect } from 'react';

/**
 * useIsMobile
 * Responsive hook returning true when the viewport is a mobile device:
 * - Width under breakpoint (default 768px - Tailwind 'md')
 * - OR small touch screens in landscape mode (width < 1024px with height < 550px)
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint || (window.innerWidth < 1024 && window.innerHeight < 550);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const check = () => {
      setIsMobile(window.innerWidth < breakpoint || (window.innerWidth < 1024 && window.innerHeight < 550));
    };

    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
