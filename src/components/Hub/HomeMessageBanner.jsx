import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  AlertTriangle, 
  Sparkles, 
  Shield, 
  Terminal, 
  Bell, 
  Sliders, 
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
import { AdminBannerModal } from './AdminBannerModal';
import { useAuth } from '../../context/AuthContext';
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
  const { isAdmin } = useAuth();

  const [banner, setBanner] = useState(getCachedHomeBanner);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
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
  if (isDismissed && !isAdmin) {
    return null;
  }

  // If disabled and not admin
  if (!banner.enabled && !isAdmin) {
    return null;
  }

  // If disabled but user is Admin: show discreet operational toggle pill
  if (!banner.enabled && isAdmin) {
    return (
      <>
        <div className={`z-[1] flex items-center justify-center pointer-events-auto ${className}`}>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.03);
              setIsAdminModalOpen(true);
            }}
            className="group px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-dashed border-slate-700 hover:border-cyan-500/60 backdrop-blur-md text-[10.5px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-2 shadow-lg transition-all"
            title="Configure Home Broadcast Banner"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition-colors" />
            <span className="font-bold tracking-wider uppercase">BROADCAST OFFLINE</span>
            <span className="text-[9.5px] text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800">
              CONFIGURE (ADMIN)
            </span>
          </button>
        </div>

        <AdminBannerModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          initialConfig={banner}
          onSaved={(saved) => setBanner(saved)}
        />
      </>
    );
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

  return (
    <>
      <div 
        className={`z-[1] w-full px-2 sm:px-4 lg:px-6 pointer-events-auto transition-all duration-300 ${className}`}
      >
        <div
          className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border ${currentTheme.border} ${currentTheme.borderGlow} ${currentTheme.bg} ${currentTheme.boxGlow} bg-[#060a14]/85 backdrop-blur-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.65)] select-none`}
        >
          {/* Cybernetic Accent Line on Top Border */}
          <div className={`absolute top-0 left-4 right-4 h-[1px] opacity-60 ${currentTheme.accentLine}`} />

          {/* Left: Indicator Beacon & Badge Tag */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${currentTheme.beacon}`} />
              <span className={`absolute w-3.5 h-3.5 rounded-full ${currentTheme.beacon} opacity-75 animate-ping`} />
            </div>

            <div className={`px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10.5px] font-mono font-bold tracking-wider flex items-center gap-1.5 uppercase ${currentTheme.badgeBg}`}>
              <CategoryIcon size={12} className="shrink-0" />
              <span className="whitespace-nowrap">{banner.badge || 'TRANSMISSION'}</span>
            </div>
          </div>

          {/* Center: Dynamic Message Area (Marquee or Static) */}
          <div className="flex-1 overflow-hidden relative mx-1 sm:mx-2 flex items-center">
            {banner.mode === 'scrolling' ? (
              <div 
                className="animate-marquee-scifi text-[11px] sm:text-[12.5px] font-mono tracking-wide"
                style={{ '--marquee-duration': marqueeDuration }}
              >
                {/* 1st iteration */}
                <span className={`mr-12 font-semibold ${currentTheme.text} ${currentTheme.textGlow}`}>
                  {banner.message}
                </span>
                {/* 2nd iteration for seamless continuous ticker */}
                <span className={`mr-12 font-semibold ${currentTheme.text} ${currentTheme.textGlow}`}>
                  {banner.message}
                </span>
              </div>
            ) : (
              <div className={`w-full text-center sm:text-left text-[11px] sm:text-[12.5px] font-mono font-semibold truncate ${currentTheme.text} ${currentTheme.textGlow}`}>
                {banner.message}
              </div>
            )}
          </div>

          {/* Right: Optional Action CTA + Admin Edit Cog + Dismiss */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
            {banner.linkUrl && banner.linkLabel && (
              <button
                type="button"
                onClick={handleActionClick}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 border border-current shadow-sm hover:scale-105 active:scale-95 ${currentTheme.text} bg-black/40 hover:bg-black/70`}
              >
                <span>{banner.linkLabel}</span>
                <ChevronRight size={12} />
              </button>
            )}

            {/* Admin Edit Button */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  AudioService.playTerminalBeep(1100, 0.03);
                  setIsAdminModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer shadow-md"
                title="Admin: Configure Broadcast Banner"
              >
                <Sliders size={13} />
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
                className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
                title="Dismiss Banner"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Settings Modal */}
      <AdminBannerModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        initialConfig={banner}
        onSaved={(saved) => setBanner(saved)}
      />
    </>
  );
};

export default HomeMessageBanner;
