import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  User, 
  Volume2, 
  VolumeX, 
  Cpu, 
  BookOpen, 
  Sparkles, 
  Settings, 
  ExternalLink, 
  Check, 
  RotateCcw, 
  Trash2, 
  Shield, 
  Radio, 
  Layers, 
  Compass, 
  Database,
  Sliders,
  AlertTriangle,
  Eye,
  Zap,
  Save,
  Gauge,
  Terminal,
  Bell,
  LogOut
} from 'lucide-react';
import { ComprehensiveUserGuideModal } from './UI/ComprehensiveUserGuideModal';
import { AiConfigDrawer } from './UI/AiConfigDrawer';
import { BannerMessageDisplay } from './Hub/BannerMessageDisplay';
import { AudioService } from '../services/audioService';
import { TelemetryService } from '../services/telemetryService';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import { 
  BANNER_COLOR_THEMES, 
  AVAILABLE_BANNER_COLORS,
  BANNER_SPEEDS, 
  TICKER_SPEEDS,
  BANNER_MODES,
  BANNER_PRESETS, 
  DEFAULT_BANNER_CONFIG,
  normalizeBannerLines,
  saveHomeBanner, 
  getCachedHomeBanner, 
  subscribeToHomeBanner 
} from '../services/bannerService';

const AI_PLATFORM_LABELS = {
  gemini: 'Google Gemini (Native)',
  openai: 'OpenAI GPT-4o',
  anthropic: 'Anthropic Claude',
  custom: 'Custom Local / Ollama'
};

const BANNER_ICON_COMPONENTS = {
  Radio,
  AlertTriangle,
  Sparkles,
  Shield,
  Terminal,
  Bell
};

export const UserSettingsModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const navigate = useNavigate();
  const { currentUser, refreshUserHandle, userRole, isAdmin, isGM, triggerBootSplash, confirmLogout } = useAuth() || {};
  const canManageMarquee = Boolean(isAdmin || isGM || userRole === 'Admin' || userRole === 'GM' || !currentUser);
  const confirm = useConfirm();
  const { showSuccessToast } = useToast() || {};
  
  // Navigation tab: 'identity' | 'audio' | 'ai' | 'manual' | 'system'
  const [activeTab, setActiveTab] = useState('identity');

  // User Profile
  const [handle, setHandle] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // AI Configuration
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [aiPlatform, setAiPlatform] = useState('gemini');
  const [otherAiApiKey, setOtherAiApiKey] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Display & Typography Scaling
  const [textScale, setTextScale] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tangent_text_scale') || 'standard';
    }
    return 'standard';
  });

  const handleTextScaleChange = (scale) => {
    setTextScale(scale);
    localStorage.setItem('tangent_text_scale', scale);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-text-scale', scale);
    }
    AudioService.playTerminalBeep(1100, 0.02);
  };

  // Audio Immersion
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);
  const [audioVolume, setAudioVolume] = useState(() => Math.round((AudioService.volume || 0.35) * 100));

  // User Guide Modal
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState('hub');

  // Status & Feedback
  const [saveMessage, setSaveMessage] = useState('');

  // Tactical Home Marquee Broadcast (Admin / Developer Controls)
  const getInitialBannerFormState = (conf) => {
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
      colorTheme: conf?.colorTheme || 'cyan',
      icon: conf?.icon || 'Radio',
      badge: conf?.badge || 'TACTICAL BROADCAST',
      linkLabel: conf?.linkLabel || '',
      linkUrl: conf?.linkUrl || '',
      allowDismiss: false
    };
  };

  // Tactical Home Marquee Broadcast (Admin / Developer Controls)
  const [bannerForm, setBannerForm] = useState(() => getInitialBannerFormState(getCachedHomeBanner()));
  const [isBannerSaving, setIsBannerSaving] = useState(false);

  // Hardware Profile & Graphics Telemetry
  const [gpuProfile, setGpuProfile] = useState(() => TelemetryService.getGPUHardwareProfile());
  const [telemetryCopied, setTelemetryCopied] = useState(false);

  useEffect(() => {
    let unsubBanner = null;
    if (isOpen) {
      setHandle(localStorage.getItem('userHandle') || '');
      setContactInfo(localStorage.getItem('userContactInfo') || '');
      setGeminiApiKey(localStorage.getItem('geminiApiKey') || '');
      setAiPlatform(localStorage.getItem('aiPlatform') || 'gemini');
      setOtherAiApiKey(localStorage.getItem('otherAiApiKey') || '');
      setCustomEndpoint(localStorage.getItem('customEndpoint') || '');
      setIsAudioMuted(AudioService.muted);
      setAudioVolume(Math.round((AudioService.volume || 0.35) * 100));
      setTextScale(localStorage.getItem('tangent_text_scale') || 'standard');
      setSaveMessage('');

      // Initialize Banner Form
      setBannerForm(getInitialBannerFormState(getCachedHomeBanner()));
      try {
        unsubBanner = subscribeToHomeBanner((conf) => {
          setBannerForm(getInitialBannerFormState(conf));
        });
      } catch (err) {
        console.warn("Banner subscription in settings modal warning:", err);
      }

      if (currentUser) {
        getDoc(doc(db, 'users', currentUser.uid)).then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.userHandle !== undefined) {
              setHandle(data.userHandle);
              localStorage.setItem('userHandle', data.userHandle);
            }
            if (data.userContactInfo !== undefined) {
              setContactInfo(data.userContactInfo);
              localStorage.setItem('userContactInfo', data.userContactInfo);
            }
            if (data.geminiApiKey !== undefined) {
              setGeminiApiKey(data.geminiApiKey);
              localStorage.setItem('geminiApiKey', data.geminiApiKey);
            }
            if (data.aiPlatform !== undefined) {
              setAiPlatform(data.aiPlatform);
              localStorage.setItem('aiPlatform', data.aiPlatform);
            }
            if (data.otherAiApiKey !== undefined) {
              setOtherAiApiKey(data.otherAiApiKey);
              localStorage.setItem('otherAiApiKey', data.otherAiApiKey);
            }
            if (data.customEndpoint !== undefined) {
              setCustomEndpoint(data.customEndpoint);
              localStorage.setItem('customEndpoint', data.customEndpoint);
            }
          }
        }).catch(err => console.warn("Failed to fetch user cloud settings:", err));
      }
    }
    return () => {
      if (unsubBanner) unsubBanner();
    };
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleToggleAudioMute = () => {
    const nextMuted = AudioService.toggleMute();
    setIsAudioMuted(nextMuted);
    if (!nextMuted) {
      AudioService.playTerminalBeep(1100, 0.04);
    }
  };

  const handleVolumeChange = (newPercent) => {
    setAudioVolume(newPercent);
    AudioService.setVolume(newPercent / 100);
  };

  const handleTestSound = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    setTimeout(() => {
      AudioService.playDiceRollSound();
    }, 120);
  };

  const handleOpenManual = (tab = 'hub') => {
    AudioService.playTerminalBeep(1100, 0.03);
    setGuideInitialTab(tab);
    setIsGuideOpen(true);
  };

  const handleClearCache = async () => {
    const ok = await confirm({
      title: "Clear Local Cache",
      message: "Clear local application cache, search filters and temporary storage? Your user profile and account remain safe.",
      confirmLabel: "Clear Cache",
      danger: true
    });
    if (ok) {
      localStorage.removeItem('tangent_dbm_cache');
      localStorage.removeItem('tangent_quick_notes');
      AudioService.playTerminalBeep(850, 0.05);
      showSuccessToast?.("Local cache cleared successfully.");
      setSaveMessage("Local cache cleared successfully.");
      setTimeout(() => setSaveMessage(""), 2000);
    }
  };

  const handleExitApp = async () => {
    AudioService.playTerminalBeep(900, 0.02);
    if (confirmLogout) {
      onClose();
      await confirmLogout(navigate);
    } else if (currentUser) {
      onClose();
      if (navigate) navigate('/');
    } else {
      const confirmed = await confirm({
        title: 'Exit App',
        message: 'Are you sure you want to disconnect and exit to the main terminal?',
        confirmLabel: 'Exit App',
        danger: false,
      });
      if (confirmed) {
        onClose();
        if (navigate) navigate('/');
      }
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    AudioService.playTerminalBeep(1200, 0.03);

    const trimmedHandle = handle.trim();
    const trimmedContactInfo = contactInfo.trim();
    const trimmedGeminiKey = geminiApiKey.trim();
    const trimmedOtherKey = otherAiApiKey.trim();
    const trimmedEndpoint = customEndpoint.trim();

    localStorage.setItem('userHandle', trimmedHandle);
    localStorage.setItem('userContactInfo', trimmedContactInfo);
    localStorage.setItem('geminiApiKey', trimmedGeminiKey);
    localStorage.setItem('aiPlatform', aiPlatform);
    localStorage.setItem('otherAiApiKey', trimmedOtherKey);
    localStorage.setItem('customEndpoint', trimmedEndpoint);
    localStorage.setItem('tangent_text_scale', textScale);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-text-scale', textScale);
    }

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          userHandle: trimmedHandle,
          userContactInfo: trimmedContactInfo,
          geminiApiKey: trimmedGeminiKey,
          aiPlatform: aiPlatform,
          otherAiApiKey: trimmedOtherKey,
          customEndpoint: trimmedEndpoint,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("Failed to sync settings to Firestore:", err);
      }
    }

    if (canManageMarquee && bannerForm) {
      try {
        const activeRaw = [bannerForm.line1, bannerForm.line2, bannerForm.line3].map(l => (typeof l === 'string' ? l.trim() : ''));
        const activeFiltered = activeRaw.filter(Boolean);
        const payload = {
          ...bannerForm,
          line1: bannerForm.line1 || '',
          line2: bannerForm.line2 || '',
          line3: bannerForm.line3 || '',
          lines: activeFiltered.length > 0 ? activeFiltered : [bannerForm.line1 || 'WELCOME TO TANGENT SF RP'],
          message: activeFiltered.join(' // ') || bannerForm.line1 || 'WELCOME TO TANGENT SF RP',
          allowDismiss: false
        };
        await saveHomeBanner(payload, currentUser);
      } catch (err) {
        console.warn("Failed saving banner in global settings save:", err);
      }
    }

    setSaveMessage('System settings saved successfully!');

    if (refreshUserHandle) {
      refreshUserHandle();
    }

    if (onSaveSuccess) {
      onSaveSuccess();
    }

    setTimeout(() => {
      setSaveMessage('');
      onClose();
    }, 800);
  };

  const handleApplyBannerPreset = (preset) => {
    AudioService.playTerminalBeep(1100, 0.02);
    const norm = normalizeBannerLines(preset);
    setBannerForm(prev => ({
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
      icon: preset.icon || prev.icon,
      linkLabel: preset.linkLabel ?? prev.linkLabel,
      linkUrl: preset.linkUrl ?? prev.linkUrl
    }));
  };

  const handleSaveBannerOnly = async () => {
    AudioService.playTerminalBeep(1200, 0.04);
    setIsBannerSaving(true);
    try {
      const activeRaw = [bannerForm.line1, bannerForm.line2, bannerForm.line3].map(l => (typeof l === 'string' ? l.trim() : ''));
      const activeFiltered = activeRaw.filter(Boolean);
      const payload = {
        ...bannerForm,
        line1: bannerForm.line1 || '',
        line2: bannerForm.line2 || '',
        line3: bannerForm.line3 || '',
        lines: activeFiltered.length > 0 ? activeFiltered : [bannerForm.line1 || 'WELCOME TO TANGENT SF RP'],
        message: activeFiltered.join(' // ') || bannerForm.line1 || 'WELCOME TO TANGENT SF RP',
        allowDismiss: false
      };

      await saveHomeBanner(payload, currentUser);
      showSuccessToast?.('Broadcast marquee banner updated successfully!');
      setSaveMessage('Broadcast marquee updated successfully!');
      setTimeout(() => setSaveMessage(''), 2500);
    } catch (err) {
      console.warn("Failed saving banner from settings:", err);
    } finally {
      setIsBannerSaving(false);
    }
  };

  const TABS = [
    { id: 'identity', label: 'Identity & Profile', icon: User },
    { id: 'display', label: 'Display & Typography', icon: Eye, badge: textScale !== 'standard' ? textScale.toUpperCase() : undefined },
    { id: 'audio', label: 'Audio & Immersion', icon: Volume2 },
    { id: 'ai', label: 'AI Neural Core', icon: Cpu, badge: aiPlatform },
    { id: 'manual', label: 'System Manual', icon: BookOpen },
    { id: 'system', label: 'System & Cache', icon: Settings },
    ...(canManageMarquee ? [{ id: 'broadcast', label: 'Admin Marquee', icon: Radio, badge: 'ADMIN' }] : [])
  ];

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 pt-6 sm:pt-10 md:pt-12 pb-8 overflow-y-auto select-none font-sans">
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-dialog-title"
          className="bg-[#0d1117] border-2 border-cyan-500/50 rounded-2xl w-[94vw] max-w-4xl max-h-[94vh] sm:max-h-[95dvh] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-sans select-none animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:px-6 bg-slate-950/90 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <Settings size={16} aria-hidden="true" />
              </div>
              <div>
                <h3 id="settings-dialog-title" className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-cyan-300">
                  SYSTEM SETTINGS &amp; CONTROLS
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentUser ? `CONNECTED: ${handle || currentUser.email}` : 'LOCAL OPERATOR MODE'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                AudioService.playTerminalBeep(900, 0.02);
                onClose();
              }}
              aria-label="Close settings dialog"
              className="text-slate-400 hover:text-white text-xl font-bold leading-none p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          {/* Modal Main Body (Tab Nav Rail + Tab Content) */}
          <div className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden">
            
            {/* Left Tab Navigation Rail */}
            <div 
              role="tablist"
              aria-label="Settings categories"
              className="w-full sm:w-52 bg-slate-950/70 border-b sm:border-b-0 sm:border-r border-slate-800 p-2 sm:p-3 flex sm:flex-col gap-1.5 shrink-0 overflow-x-auto sm:overflow-x-visible"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`settings-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`settings-tab-panel-${tab.id}`}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer text-left whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className={isActive ? "text-cyan-400" : "text-slate-500"} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className="hidden sm:inline text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300/80 border border-slate-700 font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Tab Content Viewport */}
            <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs bg-[#0b0f17]/40">

              {/* 1. IDENTITY & PROFILE TAB */}
              {activeTab === 'identity' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <User size={14} />
                      <span>Operative Identity</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Configure your public callsign and shared transmission details across teams and sessions.
                    </p>
                  </div>

                  {/* Public Handle */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      Public Handle / Callsign
                    </label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="E.g. Operator_Zero"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white p-2.5 rounded-xl text-xs font-mono outline-none transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 italic">
                      Displayed on characters, campaign logs, and comms transmissions to protect your private email.
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      Transmission Coordinates / Contact Info
                    </label>
                    <textarea
                      rows={2}
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="E.g. Discord: @operator0 | Comms: frequency-7"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white p-2.5 rounded-xl text-xs font-mono outline-none transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 italic">
                      Optional external comms handles visible to your party members and team commanders.
                    </p>
                  </div>

                  {/* Account Metadata Badge */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={isAdmin ? "text-amber-400" : "text-cyan-400"} />
                      <span className="text-slate-400">ACCESS ROLE:</span>
                      <span className="font-bold text-white uppercase">{userRole || 'OPERATOR'}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${currentUser ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                      {currentUser ? 'Cloud Synced' : 'Offline Mode'}
                    </span>
                  </div>

                  {/* Session Disconnect / Exit App Option */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                        <LogOut size={13} className="text-red-400" />
                        <span>Session &amp; Terminal Exit</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {currentUser ? 'Disconnect from Terran Data Net and exit current session.' : 'Exit active session and return to main terminal.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleExitApp}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 hover:border-red-400 text-red-400 hover:text-red-300 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.15)] shrink-0"
                    >
                      <LogOut size={13} />
                      <span>Exit App</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. DISPLAY & TYPOGRAPHY TAB */}
              {activeTab === 'display' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Eye size={14} />
                      <span>Display &amp; Typography Scaling</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Fine-tune font hierarchy, legibility, and sub-pixel scaling without breaking layout boundaries or requiring 150% browser zoom.
                    </p>
                  </div>

                  {/* Scale Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'standard',
                        name: 'Standard (100% Balanced)',
                        multiplier: '1.00x',
                        tag: 'DEFAULT',
                        desc: 'Calibrated baseline typography with elevated micro-labels (~12px) and Inter UI sans-serif. Recommended for 1080p and 1440p displays.'
                      },
                      {
                        id: 'comfortable',
                        name: 'Comfortable (+8%)',
                        multiplier: '1.08x',
                        tag: 'POPULAR',
                        desc: 'Slightly enlarged labels and body text for relaxed reading across long roleplaying and GM sessions, without overflowing containers.'
                      },
                      {
                        id: 'large',
                        name: 'Large (+16%)',
                        multiplier: '1.16x',
                        tag: 'HIGH VISIBILITY',
                        desc: 'Maximized readability for 4K / QHD monitors or low-strain viewing while keeping sidebars, grids, and action buttons locked.'
                      },
                      {
                        id: 'compact',
                        name: 'Compact (-6%)',
                        multiplier: '0.94x',
                        tag: 'DENSE',
                        desc: 'Ultra-dense tactical layout designed for smaller netbook viewports or power operators demanding high information density.'
                      }
                    ].map((opt) => {
                      const isSelected = textScale === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleTextScaleChange(opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.2)] text-white'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                              <span className="font-mono text-xs font-bold text-white tracking-wide">
                                {opt.name}
                              </span>
                            </div>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isSelected
                                ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300'
                                : 'bg-slate-900 border border-slate-800 text-slate-400'
                            }`}>
                              {opt.multiplier}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal pl-5">
                            {opt.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Tactical Preview Box */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="font-mono text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                        <Terminal size={13} className="text-cyan-400" />
                        <span>Real-Time Typography Preview</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        Scale Active: <span className="text-cyan-300 font-bold">{textScale.toUpperCase()}</span>
                      </span>
                    </div>

                    {/* Preview Sample Card */}
                    <div className="p-3 rounded-lg bg-[#070a12] border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-cyan-300">
                            UNIT #709 // CYBER-OPERATIVE
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                            ONLINE
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <span>HP: <strong className="text-emerald-400 font-bold">48/48</strong></span>
                          <span>•</span>
                          <span>SHIELD: <strong className="text-cyan-400 font-bold">100%</strong></span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Tactical neural link established. Sub-pixel anti-aliasing enhances glyph definition across high-contrast HUD components, campaign dossiers, and VTT encounter tables.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-slate-800/60 font-mono text-[10px]">
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
                          <span className="text-[8px] text-slate-400 uppercase">REFLEXES</span>
                          <span className="text-xs font-bold text-cyan-300">16 (+3)</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
                          <span className="text-[8px] text-slate-400 uppercase">INTELLECT</span>
                          <span className="text-xs font-bold text-cyan-300">18 (+4)</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
                          <span className="text-[8px] text-slate-400 uppercase">RESOLVE</span>
                          <span className="text-xs font-bold text-cyan-300">14 (+2)</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
                          <span className="text-[8px] text-slate-400 uppercase">STATUS</span>
                          <span className="text-xs font-bold text-emerald-300">OPTIMAL</span>
                        </div>
                      </div>
                    </div>

                    {/* Architectural Note */}
                    <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[10px] text-cyan-300/90 font-mono flex items-start gap-2">
                      <Sparkles size={14} className="shrink-0 text-cyan-400 mt-0.5" />
                      <span>
                        <strong>No Cutoff Guarantee:</strong> Text scale adjusts font sizes gracefully while container heights, flex grids, and sidebars remain locked to prevent cutoff or overlapping. You do not need to use 150% browser zoom.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. AUDIO & IMMERSION TAB */}
              {activeTab === 'audio' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Volume2 size={14} />
                      <span>Audio FX &amp; Immersion Synthesizer</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Real-time procedural Web Audio sound synthesis for dice rolls, combat hits, and terminal feedback.
                    </p>
                  </div>

                  {/* Mute Toggle Switch */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${!isAudioMuted ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'}`}>
                        {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </div>
                      <div>
                        <div className="font-mono text-xs font-bold text-white uppercase">
                          Procedural Audio FX
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isAudioMuted ? 'All procedural audio muted' : 'Audio synthesizer active & online'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleAudioMute}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                        !isAudioMuted
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isAudioMuted ? 'Muted' : 'Unmuted'}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between items-center font-mono text-[11px]">
                      <span className="font-bold text-slate-300 uppercase">Master Synthesis Volume</span>
                      <span className="text-cyan-400 font-bold">{audioVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioVolume}
                      disabled={isAudioMuted}
                      onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400 cursor-pointer disabled:opacity-30 h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>0% (Silent)</span>
                      <span>50% (Recommended)</span>
                      <span>100% (Maximum)</span>
                    </div>
                  </div>

                  {/* Audio Test Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleTestSound}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-cyan-300 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>🔊</span>
                      <span>Test Terminal Beep &amp; Dice Sound</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. AI NEURAL CORE TAB */}
              {activeTab === 'ai' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Cpu size={14} />
                      <span>AI Neural Core Integration</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Power BASTION, AIME Creative Engine, and intelligent scenario synthesis with local or cloud AI models.
                    </p>
                  </div>

                  {/* Consolidated AI Status Card with Drawer Action */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-950 to-slate-900 border-2 border-cyan-500/40 space-y-3 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/60 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                            ACTIVE ENGINE
                          </div>
                          <div className="font-mono text-sm font-bold text-white">
                            {AI_PLATFORM_LABELS[aiPlatform] || aiPlatform}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase">
                        {geminiApiKey || otherAiApiKey ? 'Custom Key' : 'System Default'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                      {aiPlatform === 'gemini' && !geminiApiKey
                        ? 'Operating with Tangent SFF RP secured system native Google Gemini credentials. All AI assistants ready for deployment.'
                        : `Configured to route requests via ${AI_PLATFORM_LABELS[aiPlatform] || aiPlatform} with user-provided API credentials.`}
                    </div>

                    {/* Single Trigger Button to Open Dedicated AI Config Drawer */}
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1200, 0.03);
                        setIsAiDrawerOpen(true);
                      }}
                      className="w-full py-2.5 px-4 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Cpu size={15} className="group-hover:scale-110 transition-transform" />
                      <span>Configure AI Core &amp; Credentials</span>
                      <span className="text-cyan-400 font-bold ml-1">➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. SYSTEM MANUAL & DOCS TAB */}
              {activeTab === 'manual' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <BookOpen size={14} />
                      <span>System Manual &amp; Documentation</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Full breakdown of all 10 Tangent core applications, character mechanics, and rule matrices.
                    </p>
                  </div>

                  {/* Big Primary Guide Button */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 to-slate-900/80 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/60 flex items-center justify-center text-cyan-300">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <div className="font-mono text-xs font-bold text-white uppercase">
                          Comprehensive User Guide
                        </div>
                        <div className="text-[10px] text-cyan-300/80">
                          Complete searchable manual &amp; operational walkthrough
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenManual('hub')}
                      className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 hover:text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)] flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>Open Full Guide</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>

                  {/* Quick-Jump Category Cards */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Quick Manual Jump Links:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenManual('folio')}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors flex items-center gap-2 cursor-pointer font-mono"
                      >
                        <span className="text-cyan-400">👤</span>
                        <div>
                          <div className="font-bold text-slate-200 text-[11px]">Persona Folio</div>
                          <div className="text-[9px] text-slate-500">Character Builder &amp; CP</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenManual('dbm')}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors flex items-center gap-2 cursor-pointer font-mono"
                      >
                        <span className="text-emerald-400">🗄️</span>
                        <div>
                          <div className="font-bold text-slate-200 text-[11px]">Omnicortex DBM</div>
                          <div className="text-[9px] text-slate-500">Database &amp; Rules</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenManual('story')}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-left transition-colors flex items-center gap-2 cursor-pointer font-mono"
                      >
                        <span className="text-purple-400">🎭</span>
                        <div>
                          <div className="font-bold text-slate-200 text-[11px]">ADE Studio</div>
                          <div className="text-[9px] text-slate-500">Adventure Development &amp; Scenarios</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenManual('maps')}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition-colors flex items-center gap-2 cursor-pointer font-mono"
                      >
                        <span className="text-amber-400">🗺️</span>
                        <div>
                          <div className="font-bold text-slate-200 text-[11px]">THE STAGE VTT</div>
                          <div className="text-[9px] text-slate-500">Tactical Grid &amp; Combat</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SYSTEM & CACHE TAB */}
              {activeTab === 'system' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Settings size={14} />
                      <span>System Maintenance &amp; Cache</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Diagnostics, temporary state reset, and memory cache pruning.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    {canManageMarquee && (
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                        <div>
                          <div className="font-mono text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                            <Radio size={13} className="text-cyan-400" />
                            <span>Home Tactical Marquee Broadcast</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Configure broadcast ticker visibility, speed, sci-fi colors, and transmissions.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            AudioService.playTerminalBeep(1100, 0.02);
                            setActiveTab('broadcast');
                          }}
                          className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.2)] shrink-0"
                        >
                          <Sliders size={13} />
                          <span>Configure Marquee</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="font-mono text-xs font-bold text-cyan-300 uppercase">
                          System Boot Diagnostics
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Replay the high-tech sci-fi boot splash and data stream diagnostics sequence.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (triggerBootSplash) triggerBootSplash();
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.2)] shrink-0"
                      >
                        <Sparkles size={13} />
                        <span>Run Diagnostics</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-white uppercase">
                          Prune Local Memory Cache
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Clears Omnicortex temporary search indices and local staging data.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Clear Cache</span>
                      </button>
                    </div>
                  </div>

                  {/* Live GPU Hardware & Graphics Telemetry */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-900/50 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div className="font-mono text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                        <Cpu size={14} className="text-cyan-400" />
                        <span>Hardware &amp; Graphics Telemetry</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const profileText = JSON.stringify(gpuProfile, null, 2);
                          navigator.clipboard.writeText(profileText);
                          setTelemetryCopied(true);
                          setTimeout(() => setTelemetryCopied(false), 2000);
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-800/60 rounded text-[10.5px] font-mono font-bold transition-colors cursor-pointer"
                      >
                        {telemetryCopied ? '✓ Copied' : 'Copy Telemetry'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono text-slate-300">
                      <div><span className="text-slate-500">GPU:</span> {gpuProfile.renderer}</div>
                      <div><span className="text-slate-500">Vendor:</span> {gpuProfile.vendor}</div>
                      <div><span className="text-slate-500">WebGL:</span> {gpuProfile.webglVersion}</div>
                      <div><span className="text-slate-500">Max Texture:</span> {gpuProfile.maxTextureSize}px</div>
                      <div><span className="text-slate-500">Pixel Ratio:</span> {gpuProfile.devicePixelRatio}x</div>
                      <div><span className="text-slate-500">Screen:</span> {gpuProfile.screenResolution}</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                    <div className="text-cyan-400 font-bold uppercase">SYSTEM VERSION</div>
                    <div>TANGENT SF RP ENGINE BY WOLFE.BT@TANGENTLLC</div>
                    <div>CORE V2.0 • REACT 19.2</div>
                    <div>STATUS: ALL APPS OPERATIONAL</div>
                  </div>
                </div>
              )}

              {/* 6. ADMIN & DEVELOPER BROADCAST MARQUEE TAB */}
              {activeTab === 'broadcast' && canManageMarquee && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Radio size={14} className="text-cyan-400" />
                        <span>Tactical Broadcast Marquee</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Configure up to 3 lines of text, character ticker effect with speed adjust, and 12 sci-fi color themes.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/50 text-cyan-300">
                      ADMIN / DEV ACCESS
                    </span>
                  </div>

                  {/* Live Interactive Preview Box */}
                  <div className="space-y-1.5">
                    {(() => {
                      const curTheme = BANNER_COLOR_THEMES[bannerForm.colorTheme] || BANNER_COLOR_THEMES.cyan;
                      const IconComp = BANNER_ICON_COMPONENTS[bannerForm.icon] || Radio;

                      const rawLines = [bannerForm.line1, bannerForm.line2, bannerForm.line3].map(l => (typeof l === 'string' ? l : ''));
                      const previewLines = rawLines.filter(l => l.trim().length > 0);
                      const safePreview = previewLines.length > 0 ? previewLines : ['NO TRANSMISSION ENTERED'];

                      return (
                        <>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                              <Eye size={12} />
                              LIVE PREVIEW (REAL-TIME RENDER)
                            </span>
                            <span>
                              {bannerForm.mode === 'ticker'
                                ? `TICKER (${(bannerForm.tickerSpeed || TICKER_SPEEDS[bannerForm.speed]?.interval || 28)}ms/char)`
                                : bannerForm.mode === 'scrolling'
                                  ? `MARQUEE (${bannerForm.speed?.toUpperCase()})`
                                  : 'STATIC DISPLAY'}
                            </span>
                          </div>

                          <div className={`relative overflow-hidden rounded-lg sm:rounded-xl border ${curTheme.border} ${curTheme.bg} ${curTheme.boxGlow} bg-[#060a14]/85 backdrop-blur-xl px-3 flex items-center justify-between gap-3 transition-all duration-300 w-full ${
                            safePreview.length === 3
                              ? 'min-h-[64px] sm:min-h-[72px] py-2'
                              : safePreview.length === 2
                                ? 'min-h-[48px] sm:min-h-[54px] py-1.5'
                                : 'min-h-[38px] sm:min-h-[42px] py-1'
                          }`}>
                            {/* Top Accent Line */}
                            <div className={`absolute top-0 left-4 right-4 h-[1px] opacity-60 ${curTheme.accentLine}`} />

                            <div className="flex items-center gap-2 shrink-0 z-10">
                              <div className="relative flex items-center justify-center">
                                <span className={`w-2 h-2 rounded-full ${curTheme.beacon}`} />
                                <span className={`absolute w-3.5 h-3.5 rounded-full ${curTheme.beacon} opacity-75 animate-ping`} />
                              </div>

                              {bannerForm.badge && (
                                <div className={`hidden sm:flex px-2 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-wider items-center gap-1.5 uppercase ${curTheme.badgeBg}`}>
                                  <IconComp size={12} className="shrink-0" />
                                  <span className="whitespace-nowrap">{bannerForm.badge}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 overflow-hidden relative mx-1 sm:mx-2 min-w-0">
                              <BannerMessageDisplay
                                lines={safePreview}
                                mode={bannerForm.mode}
                                speed={bannerForm.speed}
                                tickerSpeed={bannerForm.tickerSpeed}
                                theme={curTheme}
                              />
                            </div>

                            <div className="flex items-center gap-2 shrink-0 z-10">
                              {bannerForm.linkLabel && (
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-current opacity-90 whitespace-nowrap ${curTheme.text} bg-black/40`}>
                                  {bannerForm.linkLabel}
                                </span>
                              )}
                              <div className="relative flex items-center justify-center w-4 shrink-0">
                                <span className={`w-2 h-2 rounded-full ${curTheme.beacon}`} />
                                <span className={`absolute w-3.5 h-3.5 rounded-full ${curTheme.beacon} opacity-75 animate-ping`} />
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* 1-Click Presets */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block">
                      Quick Presets / Templates
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {BANNER_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyBannerPreset(preset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-[10.5px] font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Zap size={11} className="text-cyan-400" />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-mono font-bold text-slate-200 block text-xs">Banner Visibility</span>
                      <span className="text-[10.5px] text-slate-400">Toggle whether this marquee message is broadcast on the Home screen.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(900, 0.02);
                        setBannerForm(prev => ({ ...prev, enabled: !prev.enabled }));
                      }}
                      className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs border transition-all cursor-pointer ${
                        bannerForm.enabled 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {bannerForm.enabled ? 'ACTIVE & VISIBLE' : 'DISABLED (OFFLINE)'}
                    </button>
                  </div>

                  {/* Up to 3 Lines of Text */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <label className="text-[10.5px] font-mono text-cyan-400 uppercase tracking-widest block font-bold flex items-center gap-1.5">
                        <Layers size={13} />
                        <span>Broadcast Transmission Lines (Up to 3 Lines)</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        {[bannerForm.line1, bannerForm.line2, bannerForm.line3].filter(l => l && l.trim()).length} Active
                      </span>
                    </div>

                    {/* Line 1 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-slate-300">Line 1 (Primary Transmission) *</span>
                        <span>{bannerForm.line1?.length || 0} chars</span>
                      </div>
                      <input
                        type="text"
                        value={bannerForm.line1 || ''}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, line1: e.target.value }))}
                        placeholder="e.g. WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE"
                        maxLength={140}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono"
                      />
                    </div>

                    {/* Line 2 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-slate-300">Line 2 (Secondary Readout - Optional)</span>
                        <span>{bannerForm.line2?.length || 0} chars</span>
                      </div>
                      <input
                        type="text"
                        value={bannerForm.line2 || ''}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, line2: e.target.value }))}
                        placeholder="e.g. BASTION RULES ENGINE ACTIVE // REAL-TIME OPS SYNCHRONIZED"
                        maxLength={140}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono"
                      />
                    </div>

                    {/* Line 3 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-slate-300">Line 3 (Tactical Sub-Readout - Optional)</span>
                        <span>{bannerForm.line3?.length || 0} chars</span>
                      </div>
                      <input
                        type="text"
                        value={bannerForm.line3 || ''}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, line3: e.target.value }))}
                        placeholder="e.g. SELECT ANY MODULE FROM THE GUIDANCE RAIL TO BEGIN"
                        maxLength={140}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Mode & Speed */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                        Display Mode
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                        {Object.values(BANNER_MODES).map((bm) => (
                          <button
                            key={bm.id}
                            type="button"
                            onClick={() => {
                              AudioService.playTerminalBeep(1000, 0.02);
                              setBannerForm(prev => ({ ...prev, mode: bm.id }));
                            }}
                            className={`py-1.5 px-1 rounded-lg text-center font-mono font-bold transition-all text-xs cursor-pointer ${
                              bannerForm.mode === bm.id
                                ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {bm.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                          <Gauge size={12} className="text-cyan-400" />
                          <span>{bannerForm.mode === 'ticker' ? 'Ticker Print Speed' : 'Marquee Velocity'}</span>
                        </label>
                        {bannerForm.mode === 'ticker' && (
                          <span className="text-[10px] font-mono text-cyan-300">
                            {bannerForm.tickerSpeed || TICKER_SPEEDS[bannerForm.speed]?.interval || 28}ms / char
                          </span>
                        )}
                      </div>

                      {bannerForm.mode === 'static' ? (
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-slate-500 text-xs">
                          Static Display (Velocity Inactive)
                        </div>
                      ) : bannerForm.mode === 'ticker' ? (
                        <div className="space-y-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                          <div className="grid grid-cols-4 gap-1">
                            {Object.values(TICKER_SPEEDS).map((spd) => (
                              <button
                                key={spd.id}
                                type="button"
                                onClick={() => {
                                  AudioService.playTerminalBeep(1000, 0.02);
                                  setBannerForm(prev => ({ ...prev, speed: spd.id, tickerSpeed: spd.interval }));
                                }}
                                className={`py-1 rounded text-center font-bold text-[11px] transition-all cursor-pointer ${
                                  bannerForm.tickerSpeed === spd.interval || (bannerForm.speed === spd.id && !bannerForm.tickerSpeed)
                                    ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {spd.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                          {/* Slider */}
                          <div className="px-1 flex items-center gap-2">
                            <span className="text-[9.5px] text-slate-500">Fast</span>
                            <input
                              type="range"
                              min={6}
                              max={75}
                              step={1}
                              value={bannerForm.tickerSpeed || TICKER_SPEEDS[bannerForm.speed]?.interval || 28}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setBannerForm(prev => ({ ...prev, tickerSpeed: val }));
                              }}
                              className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                            />
                            <span className="text-[9.5px] text-slate-500">Slow</span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                          {Object.values(BANNER_SPEEDS).map((spd) => (
                            <button
                              key={spd.id}
                              type="button"
                              onClick={() => {
                                AudioService.playTerminalBeep(1000, 0.02);
                                setBannerForm(prev => ({ ...prev, speed: spd.id }));
                              }}
                              className={`py-1.5 rounded-lg text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                                bannerForm.speed === spd.id
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
                      <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                        Sci-Fi Color Palette (12 Available Colors)
                      </label>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                        {BANNER_COLOR_THEMES[bannerForm.colorTheme]?.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {AVAILABLE_BANNER_COLORS.map((colorKey) => {
                        const theme = BANNER_COLOR_THEMES[colorKey];
                        if (!theme) return null;
                        const isSelected = bannerForm.colorTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              AudioService.playTerminalBeep(1100, 0.02);
                              setBannerForm(prev => ({ ...prev, colorTheme: theme.id }));
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? `${theme.border} ${theme.bg} ${theme.boxGlow} ring-1 ring-white/30`
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0 shadow-sm" 
                                style={{ backgroundColor: theme.hex }}
                              />
                              <span className={`text-[11px] font-mono font-bold truncate ${theme.text}`}>
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
                      <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                        Category Icon
                      </label>
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 justify-between">
                        {Object.entries(BANNER_ICON_COMPONENTS).map(([key, Comp]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              AudioService.playTerminalBeep(1100, 0.02);
                              setBannerForm(prev => ({ ...prev, icon: key }));
                            }}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${
                              bannerForm.icon === key 
                                ? 'bg-cyan-500/25 border border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.25)]' 
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
                      <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                        Badge Header Label
                      </label>
                      <input
                        type="text"
                        value={bannerForm.badge}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, badge: e.target.value.toUpperCase() }))}
                        placeholder="TACTICAL BROADCAST"
                        maxLength={30}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Optional Action CTA Link & Route Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                        Optional Target Route or URL
                      </label>
                      <input
                        type="text"
                        value={bannerForm.linkUrl || ''}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                        placeholder="e.g. /comms or https://..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                        Button Label (Optional)
                      </label>
                      <input
                        type="text"
                        value={bannerForm.linkLabel || ''}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, linkLabel: e.target.value.toUpperCase() }))}
                        placeholder="e.g. OPEN COMMLINK"
                        maxLength={24}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 outline-none text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Apply Marquee Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isBannerSaving}
                      onClick={handleSaveBannerOnly}
                      className="px-5 py-2 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all cursor-pointer"
                    >
                      <Save size={14} />
                      <span>{isBannerSaving ? 'SAVING MARQUEE...' : 'APPLY & PUBLISH MARQUEE'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Feedback Message */}
          {saveMessage && (
            <div className="mx-4 sm:mx-6 my-2 p-2.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 rounded-xl text-xs font-mono text-center font-bold animate-fadeIn">
              {saveMessage}
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 sm:px-6 bg-slate-950/90 border-t border-cyan-900/60 flex items-center justify-between gap-2.5 shrink-0">
            <div>
              <button
                type="button"
                onClick={handleExitApp}
                className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 hover:border-red-400 text-red-400 hover:text-red-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                title="Disconnect & Exit App"
              >
                <LogOut size={14} />
                <span>Exit App</span>
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(900, 0.02);
                  onClose();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.3)] hover:shadow-[0_0_18px_rgba(34,211,238,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive User Guide Modal */}
      <ComprehensiveUserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTab={guideInitialTab}
      />

      {/* Dedicated AI Neural Core Configuration Drawer */}
      <AiConfigDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        aiPlatform={aiPlatform}
        setAiPlatform={setAiPlatform}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
        otherAiApiKey={otherAiApiKey}
        setOtherAiApiKey={setOtherAiApiKey}
        customEndpoint={customEndpoint}
        setCustomEndpoint={setCustomEndpoint}
        onSave={() => handleSave()}
      />
    </>
  );
};

export default UserSettingsModal;
