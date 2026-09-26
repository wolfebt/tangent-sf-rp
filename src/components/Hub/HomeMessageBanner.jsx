import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  AlertTriangle, 
  Sparkles, 
  Shield, 
  Terminal, 
  Bell, 
  ExternalLink, 
  ChevronRight,
  X
} from 'lucide-react';
import { 
  BANNER_COLOR_THEMES, 
  BANNER_SPEEDS, 
  subscribeToHomeBanner, 
  getCachedHomeBanner 
} from '../../services/bannerService';
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
  const [isDismissed, setIsDismissed] = useState(false);

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
  const currentTheme = BANNER_COLOR_THEMES[banner.colorTheme] || BANNER_COLOR_THEMES.cyan;
  const CategoryIcon = ICON_COMPONENTS[banner.icon] || Radio;
  const marqueeDuration = BANNER_SPEEDS[banner.speed]?.duration || '25s';

  // If dismissed by user for this session
  if (isDismissed) {
    return null;
  }

  // If disabled
  if (!banner.enabled) {
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

  const isStatic = banner.mode === 'static';

  return (
    <>
      <div 
        className={`z-[1] w-full px-2 sm:px-4 lg:px-6 pointer-events-auto transition-all duration-300 flex justify-center ${className}`}
      >
        <div
          className={`group relative overflow-hidden rounded-lg sm:rounded-xl border ${currentTheme.border} ${currentTheme.borderGlow} ${currentTheme.bg} ${currentTheme.boxGlow} bg-[#060a14]/90 backdrop-blur-2xl px-3 sm:px-4 flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.65)] select-none transition-all duration-300 ${
            isStatic 
              ? 'w-full sm:w-1/2 min-h-[36px] py-2 sm:py-2.5' 
              : 'w-full h-9 sm:h-10'
          }`}
        >
          {/* Cybernetic Accent Line on Top Border */}
          <div className={`absolute top-0 left-4 right-4 h-[1px] opacity-60 ${currentTheme.accentLine}`} />

          {/* Left: Indicator Beacon Dot */}
          <div className="flex items-center justify-center w-5 sm:w-6 shrink-0 z-10">
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${currentTheme.beacon}`} />
              <span className={`absolute w-3.5 h-3.5 rounded-full ${currentTheme.beacon} opacity-75 animate-ping`} />
            </div>
          </div>

          {/* Center: Dynamic Message Area (Marquee or Centered Wrapped Static) */}
          <div className={`flex-1 overflow-hidden relative mx-1 sm:mx-2 min-w-0 ${
            isStatic 
              ? 'flex items-center justify-center text-center py-0.5' 
              : 'flex items-center whitespace-nowrap h-full'
          }`}>
            {isStatic ? (
              <div className={`w-full text-center text-[11px] sm:text-[12.5px] font-mono font-semibold whitespace-normal break-words leading-relaxed ${currentTheme.text} ${currentTheme.textGlow}`}>
                {banner.message}
              </div>
            ) : (
              <div 
                className="animate-marquee-scifi text-[11px] sm:text-[12px] font-mono tracking-wide flex items-center whitespace-nowrap shrink-0"
                style={{ '--marquee-duration': marqueeDuration }}
              >
                {/* 1st iteration */}
                <span className={`mr-16 font-semibold whitespace-nowrap shrink-0 ${currentTheme.text} ${currentTheme.textGlow}`}>
                  {banner.message}
                </span>
                {/* 2nd iteration for seamless continuous ticker */}
                <span className={`mr-16 font-semibold whitespace-nowrap shrink-0 ${currentTheme.text} ${currentTheme.textGlow}`}>
                  {banner.message}
                </span>
              </div>
            )}
          </div>

          {/* Right: Optional Action CTA + Admin Edit Cog + Dismiss */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
            {banner.linkUrl && banner.linkLabel && (
              <button
                type="button"
                onClick={handleActionClick}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 border border-current shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap ${currentTheme.text} bg-black/40 hover:bg-black/70`}
              >
                <span>{banner.linkLabel}</span>
                <ChevronRight size={12} />
              </button>
            )}

            {/* Optional Dismiss button for users */}
            {banner.allowDismiss && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  AudioService.playTerminalBeep(850, 0.02);
                  setIsDismissed(true);
                }}
                className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
                title="Dismiss Banner"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeMessageBanner;
