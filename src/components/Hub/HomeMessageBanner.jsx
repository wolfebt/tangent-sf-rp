import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  AlertTriangle, 
  Sparkles, 
  Shield, 
  Terminal, 
  Bell
} from 'lucide-react';
import { 
  BANNER_COLOR_THEMES, 
  subscribeToHomeBanner, 
  getCachedHomeBanner, 
  normalizeBannerLines 
} from '../../services/bannerService';
import { AudioService } from '../../services/audioService';
import { BannerMessageDisplay } from './BannerMessageDisplay';

const ICON_COMPONENTS = {
  Radio,
  AlertTriangle,
  Sparkles,
  Shield,
  Terminal,
  Bell
};

export const HomeMessageBanner = ({ className = '', position = 'top' }) => {
  const navigate = useNavigate();
  const [banner, setBanner] = useState(() => getCachedHomeBanner(position));

  useEffect(() => {
    setBanner(getCachedHomeBanner(position));

    const unsub = subscribeToHomeBanner((newConfig) => {
      setBanner(newConfig);
    }, position);

    const eventName = position === 'bottom' ? 'tangent-bottom-banner-updated' : 'tangent-banner-updated';
    const handleCustomUpdate = (e) => {
      if (e?.detail) setBanner(e.detail);
    };
    window.addEventListener(eventName, handleCustomUpdate);

    return () => {
      if (unsub) unsub();
      window.removeEventListener(eventName, handleCustomUpdate);
    };
  }, [position]);

  // Theme styling
  const currentTheme = BANNER_COLOR_THEMES[banner?.colorTheme] || BANNER_COLOR_THEMES.cyan;
  const CategoryIcon = banner?.icon === 'none' ? null : (ICON_COMPONENTS[banner?.icon] || Radio);

  // Active lines (filter to non-empty lines so container height matches active line count)
  const activeLines = useMemo(() => {
    const raw = normalizeBannerLines(banner);
    const nonEmpty = raw.filter(l => typeof l === 'string' && l.trim().length > 0);
    return nonEmpty.length > 0 ? nonEmpty : raw;
  }, [banner]);

  // If disabled, banner is completely hidden
  if (!banner?.enabled) {
    return null;
  }

  // Height adapts dynamically depending on how many lines are active (1, 2, 3, or N lines)
  const linesCount = activeLines.length;
  const heightClass = linesCount >= 3
    ? 'min-h-[64px] sm:min-h-[72px] h-auto py-2 sm:py-2.5'
    : linesCount === 2
      ? 'min-h-[48px] sm:min-h-[54px] h-auto py-1.5 sm:py-2'
      : 'min-h-[38px] sm:min-h-[42px] h-auto py-1 sm:py-1.5';

  // Top marquee is top-anchored expanding down; Bottom marquee is bottom-anchored expanding up
  const isBottom = position === 'bottom';
  const anchorClass = isBottom
    ? 'mt-auto self-end items-end origin-bottom'
    : 'self-start items-start origin-top';

  // Check if cyber-gel background & frame are enabled (default: true)
  const showBackground = banner?.showBackground !== false;

  // Target route or URL navigation when marquee is clicked
  const targetUrl = typeof banner?.linkUrl === 'string' ? banner.linkUrl.trim() : '';
  const hasTarget = targetUrl.length > 0;

  const handleMarqueeClick = (e) => {
    if (!hasTarget) return;
    e.stopPropagation();
    AudioService.playTerminalBeep(1150, 0.03);
    if (/^(https?:)?\/\//i.test(targetUrl) || targetUrl.startsWith('mailto:')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      const routePath = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
      navigate(routePath);
    }
  };

  const handleMarqueeKeyDown = (e) => {
    if (!hasTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMarqueeClick(e);
    }
  };

  return (
    <div 
      data-marquee-position={position}
      data-marquee-anchor={isBottom ? 'bottom-up' : 'top-down'}
      data-marquee-lines={linesCount}
      data-marquee-target={hasTarget ? targetUrl : undefined}
      role="status"
      aria-live="polite"
      aria-label={isBottom ? 'System Telemetry Log' : 'Tactical Broadcast Banner'}
      className={`z-20 w-full pointer-events-auto transition-all duration-300 flex justify-center px-2 sm:px-4 ${anchorClass} ${className}`}
    >
      <div
        onClick={hasTarget ? handleMarqueeClick : undefined}
        onKeyDown={hasTarget ? handleMarqueeKeyDown : undefined}
        tabIndex={hasTarget ? 0 : undefined}
        title={hasTarget ? (banner?.linkLabel ? `${banner.linkLabel} (${targetUrl})` : `Navigate to ${targetUrl}`) : undefined}
        className={`group relative overflow-hidden rounded-xl transition-all duration-300 w-full max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3.5 select-none ${
          isBottom ? 'origin-bottom' : 'origin-top'
        } ${
          hasTarget ? 'cursor-pointer hover:brightness-110 active:scale-[0.995]' : ''
        } ${heightClass} ${
          showBackground
            ? `border ${currentTheme.border} ${currentTheme.borderGlow} ${currentTheme.bg} ${currentTheme.boxGlow} bg-[#060a14]/90 backdrop-blur-2xl px-3 sm:px-4 shadow-[0_4px_20px_rgba(0,0,0,0.65)] sm:rounded-2xl`
            : 'border-0 border-transparent bg-transparent shadow-none px-1 sm:px-2'
        }`}
      >
        {/* Cybernetic Accent Line on Anchor Border (Framed Mode Only) */}
        {showBackground && (
          <div className={`absolute ${isBottom ? 'bottom-0' : 'top-0'} left-4 right-4 h-[1px] opacity-60 ${currentTheme.accentLine}`} />
        )}

        {/* Left: Indicator Beacon & Category Badge */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          {showBackground && (
            <div className="relative flex items-center justify-center" aria-hidden="true">
              <span className={`w-2 h-2 rounded-full ${currentTheme.beacon}`} />
              <span className={`absolute w-3.5 h-3.5 rounded-full ${currentTheme.beacon} opacity-75 animate-ping`} />
            </div>
          )}

          {banner.badge && banner.badge.trim().length > 0 && (
            <div className={`hidden sm:flex px-2 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-wider items-center gap-1.5 uppercase ${
              showBackground
                ? currentTheme.badgeBg
                : 'text-slate-300 bg-transparent border border-slate-700/80'
            }`}>
              {CategoryIcon && <CategoryIcon size={12} className="shrink-0" aria-hidden="true" />}
              <span className="whitespace-nowrap">{banner.badge.trim()}</span>
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
            tickerAlignment={banner.tickerAlignment || 'left'}
            staticFade={banner.staticFade || 'none'}
            staticGlow={banner.staticGlow || 'subtle'}
            hasTarget={hasTarget}
            theme={currentTheme}
          />
        </div>

        {/* Right: Matched Indicator Beacon Dot (Framed Mode Only - No Buttons / Controls) */}
        {showBackground && (
          <div className="flex items-center justify-center w-4 shrink-0 z-10" aria-hidden="true">
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${currentTheme.beacon}`} />
              <span className={`absolute w-3.5 h-3.5 rounded-full ${currentTheme.beacon} opacity-75 animate-ping`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeMessageBanner;
