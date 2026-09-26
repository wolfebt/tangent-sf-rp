import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon, 
  Zap,
  Play,
  Pause
} from 'lucide-react';
import { 
  BANNER_COLOR_THEMES, 
  BANNER_SPEEDS, 
  BANNER_PRESETS, 
  saveHomeBanner 
} from '../../services/bannerService';
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
  const { showSuccessToast } = useToast();

  const [form, setForm] = useState(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialConfig) {
      setForm(initialConfig);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const currentTheme = BANNER_COLOR_THEMES[form.colorTheme] || BANNER_COLOR_THEMES.cyan;
  const SelectedIcon = ICON_COMPONENTS[form.icon] || Radio;

  const handleApplyPreset = (preset) => {
    AudioService.playTerminalBeep(1100, 0.02);
    setForm(prev => ({
      ...prev,
      badge: preset.badge,
      message: preset.message,
      colorTheme: preset.colorTheme,
      mode: preset.mode,
      speed: preset.speed,
      icon: preset.icon
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    AudioService.playTerminalBeep(1200, 0.04);
    setIsSaving(true);
    try {
      const res = await saveHomeBanner(form, currentUser);
      showSuccessToast('Tactical broadcast banner updated successfully');
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
      className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#090d16]/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden"
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
                  HOME BROADCAST BANNER CONFIG
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Adjust the live tactical ticker message, display mode, and cybernetic color palette.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { AudioService.playTerminalBeep(850, 0.02); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto no-scrollbar flex-1 font-mono text-xs text-slate-300">
          {/* Live Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Eye size={12} />
                LIVE PREVIEW (REAL-TIME RENDER)
              </span>
              <span>{form.mode === 'scrolling' ? `MARQUEE (${form.speed?.toUpperCase()})` : 'STATIC DISPLAY'}</span>
            </div>

            {/* Simulated Banner Container */}
            <div className={`relative overflow-hidden rounded-lg sm:rounded-xl border ${currentTheme.border} ${currentTheme.bg} ${currentTheme.boxGlow} backdrop-blur-xl px-3 flex items-center transition-all duration-300 ${
              form.mode === 'static'
                ? 'w-full min-h-[36px] py-2'
                : 'w-full h-9 sm:h-10'
            }`}>
              <div className="flex items-center justify-center w-5 shrink-0 z-10 mr-2">
                <div className={`w-2 h-2 rounded-full ${currentTheme.beacon} animate-pulse`} />
              </div>

              {/* Message Render */}
              <div className={`flex-1 overflow-hidden relative min-w-0 ${
                form.mode === 'static'
                  ? 'flex items-center justify-center text-center py-0.5'
                  : 'flex items-center whitespace-nowrap h-full'
              }`}>
                {form.mode === 'scrolling' ? (
                  <div 
                    className="animate-marquee-scifi text-[11px] sm:text-[12px] font-mono tracking-wide flex items-center whitespace-nowrap shrink-0"
                    style={{ '--marquee-duration': BANNER_SPEEDS[form.speed]?.duration || '25s' }}
                  >
                    <span className={`mr-12 font-semibold whitespace-nowrap shrink-0 ${currentTheme.text} ${currentTheme.textGlow}`}>
                      {form.message || 'NO MESSAGE ENTERED'}
                    </span>
                    <span className={`mr-12 font-semibold whitespace-nowrap shrink-0 ${currentTheme.text} ${currentTheme.textGlow}`}>
                      {form.message || 'NO MESSAGE ENTERED'}
                    </span>
                  </div>
                ) : (
                  <div className={`w-full text-center text-[11px] sm:text-[12px] font-mono whitespace-normal break-words leading-relaxed font-semibold ${currentTheme.text} ${currentTheme.textGlow}`}>
                    {form.message || 'NO MESSAGE ENTERED'}
                  </div>
                )}
              </div>

              {form.linkLabel && (
                <div className="shrink-0 ml-3 z-10">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-current opacity-90 whitespace-nowrap ${currentTheme.text}`}>
                    {form.linkLabel}
                  </span>
                </div>
              )}
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
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-[10.5px] text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1"
                >
                  <Zap size={11} className="text-cyan-400" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Banner Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 block text-xs">Banner Visibility</span>
              <span className="text-[10.5px] text-slate-400">Toggle whether this message banner is active on the home screen.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                setForm(prev => ({ ...prev, enabled: !prev.enabled }));
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                form.enabled 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              {form.enabled ? 'ACTIVE & VISIBLE' : 'DISABLED (OFFLINE)'}
            </button>
          </div>

          {/* Display Mode & Speed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode: Marquee vs Static */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Display Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1000, 0.02);
                    setForm(prev => ({ ...prev, mode: 'scrolling' }));
                  }}
                  className={`py-1.5 rounded-lg text-center font-bold transition-all text-xs ${
                    form.mode === 'scrolling'
                      ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Scrolling Marquee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1000, 0.02);
                    setForm(prev => ({ ...prev, mode: 'static' }));
                  }}
                  className={`py-1.5 rounded-lg text-center font-bold transition-all text-xs ${
                    form.mode === 'static'
                      ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Static Display
                </button>
              </div>
            </div>

            {/* Speed (if scrolling) */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Marquee Velocity
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                {Object.values(BANNER_SPEEDS).map((spd) => (
                  <button
                    key={spd.id}
                    type="button"
                    disabled={form.mode !== 'scrolling'}
                    onClick={() => {
                      AudioService.playTerminalBeep(1000, 0.02);
                      setForm(prev => ({ ...prev, speed: spd.id }));
                    }}
                    className={`py-1.5 rounded-lg text-center font-bold text-xs transition-all ${
                      form.speed === spd.id && form.mode === 'scrolling'
                        ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                        : form.mode !== 'scrolling'
                          ? 'opacity-30 cursor-not-allowed text-slate-600'
                          : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Themes */}
          <div className="space-y-2">
            <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
              Sci-Fi Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(BANNER_COLOR_THEMES).map((theme) => {
                const isSelected = form.colorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setForm(prev => ({ ...prev, colorTheme: theme.id }));
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? `${theme.border} ${theme.bg} ${theme.boxGlow} ring-1 ring-white/20`
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full border border-white/30 shrink-0" 
                        style={{ backgroundColor: theme.hex }}
                      />
                      <span className={`text-[11px] font-bold ${theme.text}`}>
                        {theme.label.split(' ')[0]}
                      </span>
                    </div>
                    {isSelected && <Check size={13} className={theme.text} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon and Badge Tag */}
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
                    className={`p-2 rounded-lg transition-all ${
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

          {/* Broadcast Message Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10.5px] text-slate-400 uppercase tracking-widest block font-bold">
                Broadcast Transmission Message
              </label>
              <span className="text-[10px] text-slate-500">{form.message?.length || 0} characters</span>
            </div>
            <textarea
              rows={2}
              value={form.message}
              onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter message text... (Use // to separate bullet segments)"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono resize-none"
            />
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
              setForm(initialConfig);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
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
