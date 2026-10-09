import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Radio, 
  AlertTriangle, 
  Sparkles, 
  Shield, 
  Terminal, 
  Bell, 
  Sliders, 
  Check, 
  Eye, 
  Zap,
  Gauge,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  BANNER_COLOR_THEMES, 
  AVAILABLE_BANNER_COLORS,
  BANNER_SPEEDS, 
  TICKER_SPEEDS,
  BANNER_MODES,
  BANNER_PRESETS, 
  DEFAULT_BANNER_CONFIG,
  normalizeBannerLines,
  saveHomeBanner 
} from '../../services/bannerService';
import { BannerMessageDisplay } from './BannerMessageDisplay';
import { AudioService } from '../../services/audioService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ICON_COMPONENTS = {
  Radio,
  AlertTriangle,
  Sparkles,
  Shield,
  Terminal,
  Bell
};

export const AdminBannerModal = ({ isOpen, onClose, initialConfig, onSaved }) => {
  const { currentUser } = useAuth();
  const { showSuccessToast } = useToast() || {};

  const getInitialState = (conf) => {
    const normLines = normalizeBannerLines(conf);
    return {
      ...DEFAULT_BANNER_CONFIG,
      ...conf,
      line1: conf?.line1 ?? (normLines[0] || ''),
      line2: conf?.line2 ?? (normLines[1] || ''),
      line3: conf?.line3 ?? (normLines[2] || ''),
      lines: normLines,
      mode: conf?.mode || 'ticker',
      speed: conf?.speed || 'normal',
      tickerSpeed: conf?.tickerSpeed || 28,
      colorTheme: conf?.colorTheme || 'cyan'
    };
  };

  const [form, setForm] = useState(() => getInitialState(initialConfig));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialConfig) {
      setForm(getInitialState(initialConfig));
    }
  }, [isOpen, initialConfig]);

  // Active lines for live preview
  const previewLines = useMemo(() => {
    const raw = [form.line1, form.line2, form.line3].map(l => (typeof l === 'string' ? l : ''));
    const nonEmpty = raw.filter(l => l.trim().length > 0);
    return nonEmpty.length > 0 ? nonEmpty : ['NO TRANSMISSION ENTERED'];
  }, [form.line1, form.line2, form.line3]);

  if (!isOpen) return null;

  const currentTheme = BANNER_COLOR_THEMES[form.colorTheme] || BANNER_COLOR_THEMES.cyan;
  const SelectedIcon = ICON_COMPONENTS[form.icon] || Radio;

  const handleApplyPreset = (preset) => {
    AudioService.playTerminalBeep(1100, 0.02);
    const norm = normalizeBannerLines(preset);
    setForm(prev => ({
      ...prev,
      badge: preset.badge || prev.badge,
      line1: preset.line1 ?? (norm[0] || ''),
      line2: preset.line2 ?? (norm[1] || ''),
      line3: preset.line3 ?? (norm[2] || ''),
      lines: norm,
      message: preset.message || norm.join(' // '),
      colorTheme: preset.colorTheme || prev.colorTheme,
      mode: preset.mode || prev.mode,
      speed: preset.speed || prev.speed,
      tickerSpeed: preset.tickerSpeed || prev.tickerSpeed,
      icon: preset.icon || prev.icon
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    AudioService.playTerminalBeep(1200, 0.04);
    setIsSaving(true);
    try {
      const activeRaw = [form.line1, form.line2, form.line3].map(l => (typeof l === 'string' ? l.trim() : ''));
      const activeFiltered = activeRaw.filter(Boolean);

      const payload = {
        ...form,
        line1: form.line1 || '',
        line2: form.line2 || '',
        line3: form.line3 || '',
        lines: activeFiltered.length > 0 ? activeFiltered : [form.line1 || 'WELCOME TO TANGENT SF RP'],
        message: activeFiltered.join(' // ') || form.line1 || 'WELCOME TO TANGENT SF RP'
      };

      const res = await saveHomeBanner(payload, currentUser);
      showSuccessToast?.('Tactical broadcast banner updated successfully');
      if (onSaved) onSaved(res.banner);
      onClose();
    } catch (err) {
      console.error("Error saving banner:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-[#090d16]/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
              <Sliders size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                  HOME BROADCAST MARQUEE CONFIG
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Configure up to 3 lines of text, character ticker effect with speed adjust, and 12 sci-fi color themes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { AudioService.playTerminalBeep(850, 0.02); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto no-scrollbar flex-1 min-h-0 font-mono text-xs text-slate-300">
          {/* Live Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Eye size={12} />
                LIVE PREVIEW (REAL-TIME RENDER)
              </span>
              <span className="text-slate-400">
                {form.mode === 'ticker' 
                  ? `TICKER (${(form.tickerSpeed || TICKER_SPEEDS[form.speed]?.interval || 28)}ms/char)`
                  : form.mode === 'scrolling' 
                    ? `MARQUEE (${form.speed?.toUpperCase()})` 
                    : 'STATIC DISPLAY'}
              </span>
            </div>

            {/* Simulated Banner Container */}
            <div className={`relative overflow-hidden rounded-lg sm:rounded-xl border ${currentTheme.border} ${currentTheme.bg} ${currentTheme.boxGlow} backdrop-blur-xl px-3 flex items-center justify-between gap-3 transition-all duration-300 w-full ${
              previewLines.length === 3
                ? 'min-h-[64px] sm:min-h-[72px] py-2'
                : previewLines.length === 2
                  ? 'min-h-[48px] sm:min-h-[54px] py-1.5'
                  : 'min-h-[38px] sm:min-h-[42px] py-1'
            }`}>
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-4 right-4 h-[1px] opacity-60 ${currentTheme.accentLine}`} />

              {/* Left Beacon & Badge */}
              <div className="flex items-center gap-2 shrink-0 z-10">
                <div className="relative flex items-center justify-center">
                  <span className={`w-2 h-2 rounded-full ${currentTheme.beacon}`} />
                  <span className={`absolute w-3.5 h-3.5 rounded-full ${currentTheme.beacon} opacity-75 animate-ping`} />
                </div>

                {form.badge && (
                  <div className={`hidden sm:flex px-2 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-wider items-center gap-1.5 uppercase ${currentTheme.badgeBg}`}>
                    <SelectedIcon size={12} className="shrink-0" />
                    <span className="whitespace-nowrap">{form.badge}</span>
                  </div>
                )}
              </div>

              {/* Center Transmission Display */}
              <div className="flex-1 overflow-hidden relative mx-1 sm:mx-2 min-w-0">
                <BannerMessageDisplay
                  lines={previewLines}
                  mode={form.mode}
                  speed={form.speed}
                  tickerSpeed={form.tickerSpeed}
                  theme={currentTheme}
                />
              </div>

              {/* Right CTA + Beacon */}
              <div className="flex items-center gap-2 shrink-0 z-10">
                {form.linkLabel && (
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-current opacity-90 whitespace-nowrap ${currentTheme.text} bg-black/40`}>
                    {form.linkLabel}
                  </span>
                )}
                <div className="relative flex items-center justify-center w-4 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${currentTheme.beacon}`} />
                  <span className={`absolute w-3.5 h-3.5 rounded-full ${currentTheme.beacon} opacity-75 animate-ping`} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Quick Presets / Templates</span>
            <div className="flex flex-wrap gap-1.5">
              {BANNER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-[10.5px] text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Zap size={11} className="text-cyan-400" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Banner Visibility Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 block text-xs">Marquee Visibility</span>
              <span className="text-[10.5px] text-slate-400">Toggle whether this transmission banner is broadcast on the Home screen.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                setForm(prev => ({ ...prev, enabled: !prev.enabled }));
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                form.enabled 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              {form.enabled ? 'ACTIVE & VISIBLE' : 'DISABLED (OFFLINE)'}
            </button>
          </div>

          {/* Up to 3 Lines of Text */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <label className="text-[10.5px] text-cyan-400 uppercase tracking-widest block font-bold flex items-center gap-1.5">
                <Layers size={13} />
                <span>Broadcast Transmission Lines (Up to 3 Lines)</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {previewLines.length} Active {previewLines.length === 1 ? 'Line' : 'Lines'}
              </span>
            </div>

            {/* Line 1 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-300">Line 1 (Primary Transmission) *</span>
                <span>{form.line1?.length || 0} chars</span>
              </div>
              <input
                type="text"
                value={form.line1}
                onChange={(e) => setForm(prev => ({ ...prev, line1: e.target.value }))}
                placeholder="e.g. WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE"
                maxLength={140}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono"
              />
            </div>

            {/* Line 2 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-300">Line 2 (Secondary Readout - Optional)</span>
                <span>{form.line2?.length || 0} chars</span>
              </div>
              <input
                type="text"
                value={form.line2}
                onChange={(e) => setForm(prev => ({ ...prev, line2: e.target.value }))}
                placeholder="e.g. BASTION RULES ENGINE ACTIVE // REAL-TIME OPS SYNCHRONIZED"
                maxLength={140}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono"
              />
            </div>

            {/* Line 3 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-300">Line 3 (Tactical Sub-Readout - Optional)</span>
                <span>{form.line3?.length || 0} chars</span>
              </div>
              <input
                type="text"
                value={form.line3}
                onChange={(e) => setForm(prev => ({ ...prev, line3: e.target.value }))}
                placeholder="e.g. SELECT ANY MODULE FROM THE GUIDANCE RAIL TO BEGIN"
                maxLength={140}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono"
              />
            </div>
          </div>

          {/* Display Mode & Velocity Adjust */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Display Mode: Ticker vs Scrolling vs Static */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Display Mode
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                {Object.values(BANNER_MODES).map((bm) => {
                  const isActive = form.mode === bm.id;
                  return (
                    <button
                      key={bm.id}
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1000, 0.02);
                        setForm(prev => ({ ...prev, mode: bm.id }));
                      }}
                      className={`py-1.5 px-1 rounded-lg text-center font-bold transition-all text-xs cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {bm.label.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Velocity / Speed Control */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                  <Gauge size={12} className="text-cyan-400" />
                  <span>{form.mode === 'ticker' ? 'Ticker Print Speed' : 'Marquee Velocity'}</span>
                </label>
                {form.mode === 'ticker' && (
                  <span className="text-[10px] text-cyan-300">
                    {form.tickerSpeed || TICKER_SPEEDS[form.speed]?.interval || 28}ms / char
                  </span>
                )}
              </div>

              {form.mode === 'static' ? (
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-slate-500 text-xs">
                  Static Display (Velocity Inactive)
                </div>
              ) : form.mode === 'ticker' ? (
                <div className="space-y-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="grid grid-cols-4 gap-1">
                    {Object.values(TICKER_SPEEDS).map((spd) => (
                      <button
                        key={spd.id}
                        type="button"
                        onClick={() => {
                          AudioService.playTerminalBeep(1000, 0.02);
                          setForm(prev => ({ ...prev, speed: spd.id, tickerSpeed: spd.interval }));
                        }}
                        className={`py-1 rounded text-center font-bold text-[11px] transition-all cursor-pointer ${
                          form.tickerSpeed === spd.interval || (form.speed === spd.id && !form.tickerSpeed)
                            ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  {/* Fine Adjustment Slider */}
                  <div className="px-1 flex items-center gap-2">
                    <span className="text-[9.5px] text-slate-500">Fast</span>
                    <input
                      type="range"
                      min={6}
                      max={75}
                      step={1}
                      value={form.tickerSpeed || TICKER_SPEEDS[form.speed]?.interval || 28}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setForm(prev => ({ ...prev, tickerSpeed: val }));
                      }}
                      className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9.5px] text-slate-500">Slow</span>
                  </div>
                </div>
              ) : (
                /* Scrolling Marquee Speeds */
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                  {Object.values(BANNER_SPEEDS).map((spd) => (
                    <button
                      key={spd.id}
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1000, 0.02);
                        setForm(prev => ({ ...prev, speed: spd.id }));
                      }}
                      className={`py-1.5 rounded-lg text-center font-bold text-xs transition-all cursor-pointer ${
                        form.speed === spd.id
                          ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 12 Colors Palette */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Sci-Fi Color Palette (12 Available Colors)
              </label>
              <span className="text-[10px] text-cyan-400 uppercase font-bold">
                {currentTheme.label}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {AVAILABLE_BANNER_COLORS.map((colorKey) => {
                const theme = BANNER_COLOR_THEMES[colorKey];
                if (!theme) return null;
                const isSelected = form.colorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setForm(prev => ({ ...prev, colorTheme: theme.id }));
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? `${theme.border} ${theme.bg} ${theme.boxGlow} ring-1 ring-white/30`
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0 shadow-sm" 
                        style={{ backgroundColor: theme.hex }}
                      />
                      <span className={`text-[11px] font-bold truncate ${theme.text}`}>
                        {theme.id.charAt(0).toUpperCase() + theme.id.slice(1)}
                      </span>
                    </div>
                    {isSelected && <Check size={13} className={theme.text} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Icon and Badge Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Category Icon
              </label>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 justify-between">
                {Object.entries(ICON_COMPONENTS).map(([key, Comp]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setForm(prev => ({ ...prev, icon: key }));
                    }}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      form.icon === key 
                        ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={key}
                  >
                    <Comp size={15} />
                  </button>
                ))}
              </div>
            </div>

            {/* Badge Text */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Badge Header Label
              </label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm(prev => ({ ...prev, badge: e.target.value.toUpperCase() }))}
                placeholder="TACTICAL BROADCAST"
                maxLength={30}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono uppercase"
              />
            </div>
          </div>

          {/* Optional Action Link & Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Optional Target Route or URL
              </label>
              <input
                type="text"
                value={form.linkUrl || ''}
                onChange={(e) => setForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="e.g. /comms or /compendium"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Button Label (Optional)
              </label>
              <input
                type="text"
                value={form.linkLabel || ''}
                onChange={(e) => setForm(prev => ({ ...prev, linkLabel: e.target.value.toUpperCase() }))}
                placeholder="e.g. OPEN COMMLINK"
                maxLength={24}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.02);
              setForm(getInitialState(initialConfig));
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>{isSaving ? 'SAVING...' : 'PUBLISH BROADCAST'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBannerModal;
