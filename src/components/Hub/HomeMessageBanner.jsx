import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  AlertTriangle, 
  Sparkles, 
  Shield, 
  Terminal, 
  Bell, 
  ChevronRight
} from 'lucide-react';
import { 
  BANNER_COLOR_THEMES, 
  subscribeToHomeBanner, 
  getCachedHomeBanner, 
  normalizeBannerLines 
} from '../../services/bannerService';
import { BannerMessageDisplay } from './BannerMessageDisplay';
import { AudioService } from '../../services/audioService';

const ICON_COMPONENTS = {
  Radio,
  AlertTriangle,
  Sparkles,
  Shield,
  Terminal,
  Bell
};

export const HomeMessageBanner = ({ className = '' }) => {
  const navigate = useNavigate();
  const [banner, setBanner] = useState(getCachedHomeBanner);

  useEffect(() => {
    const unsub = subscribeToHomeBanner((newConfig) => {
      setBanner(newConfig);
    });

    const handleCustomUpdate = (e) => {
      if (e?.detail) setBanner(e.detail);
    };
    window.addEventListener('tangent-banner-updated', handleCustomUpdate);

    return () => {
      if (unsub) unsub();
      window.removeEventListener('tangent-banner-updated', handleCustomUpdate);
    };
  }, []);

  // Theme styling
  const currentTheme = BANNER_COLOR_THEMES[banner?.colorTheme] || BANNER_COLOR_THEMES.cyan;
  const CategoryIcon = ICON_COMPONENTS[banner?.icon] || Radio;

  // Active lines
  const activeLines = useMemo(() => {
    return normalizeBannerLines(banner);
  }, [banner]);

  // If disabled, banner is completely hidden; all properties are managed in the Settings Modal
  if (!banner?.enabled) {
    return null;
  }

  const handleActionClick = (e) => {
    e.stopPropagation();
    AudioService.playTerminalBeep(1100, 0.02);
    if (!banner.linkUrl) return;

    if (banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://')) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(banner.linkUrl);
    }
  };

  // Height adapts dynamically depending on whether 1, 2, or 3 lines are active
  const linesCount = activeLines.length;
  const heightClass = linesCount === 3
    ? 'min-h-[64px] sm:min-h-[72px] py-2 sm:py-2.5'
    : linesCount === 2
      ? 'min-h-[48px] sm:min-h-[54px] py-1.5 sm:py-2'
      : 'min-h-[38px] sm:min-h-[42px] py-1 sm:py-1.5';

  return (
    <div 
      className={`z-20 w-full pointer-events-auto transition-all duration-300 flex justify-center items-center px-2 sm:px-4 ${className}`}
    >
      <div
        className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border ${currentTheme.border} ${currentTheme.borderGlow} ${currentTheme.bg} ${currentTheme.boxGlow} bg-[#060a14]/90 backdrop-blur-2xl px-3 sm:px-4 flex items-center justify-between gap-2.5 sm:gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.65)] select-none transition-all duration-300 w-full max-w-6xl xl:max-w-7xl mx-auto ${heightClass}`}
      >
        {/* Cybernetic Accent Line on Top Border */}
        <div className={`absolute top-0 left-4 right-4 h-[1px] opacity-60 ${currentTheme.accentLine}`} />

        {/* Left: Indicator Beacon & Category Badge */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          <div className="relative flex items-center justify-center">
            <span className={`w-2 h-2 rounded-full ${currentTheme.beacon}`} />
            <span className={`absolute w-3.5 h-3.5 rounded-full ${currentTheme.beacon} opacity-75 animate-ping`} />
          </div>

          {banner.badge && (
            <div className={`hidden sm:flex px-2 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-wider items-center gap-1.5 uppercase ${currentTheme.badgeBg}`}>
              <CategoryIcon size={12} className="shrink-0" />
              <span className="whitespace-nowrap">{banner.badge}</span>
            </div>
          )}
        </div>

        {/* Center: Dynamic Transmission Display (Ticker, Scrolling Marquee, or Static) */}
        <div className="flex-1 overflow-hidden relative mx-1 sm:mx-2 min-w-0">
          <BannerMessageDisplay
            lines={activeLines}
            mode={banner.mode || 'ticker'}
            speed={banner.speed || 'normal'}
            tickerSpeed={banner.tickerSpeed}
            theme={currentTheme}
          />
        </div>

        {/* Right: Optional CTA Action Link + Right Matched Indicator Beacon Dot (No settings or close buttons) */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          {banner.linkUrl && banner.linkLabel && (
            <button
              type="button"
              onClick={handleActionClick}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 border border-current shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap ${currentTheme.text} bg-black/40 hover:bg-black/70 cursor-pointer`}
            >
              <span>{banner.linkLabel}</span>
              <ChevronRight size={12} />
            </button>
          )}

          {/* Right Matched Indicator Beacon Dot */}
          <div className="flex items-center justify-center w-4 shrink-0">
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${currentTheme.beacon}`} />
              <span className={`absolute w-3.5 h-3.5 rounded-full ${currentTheme.beacon} opacity-75 animate-ping`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMessageBanner;
