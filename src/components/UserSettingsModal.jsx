import React, { useState, useEffect } from 'react';
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
  Database
} from 'lucide-react';
import { ComprehensiveUserGuideModal } from './UI/ComprehensiveUserGuideModal';
import { AiConfigDrawer } from './UI/AiConfigDrawer';
import { AudioService } from '../services/audioService';

const AI_PLATFORM_LABELS = {
  gemini: 'Google Gemini (Native)',
  openai: 'OpenAI GPT-4o',
  anthropic: 'Anthropic Claude',
  custom: 'Custom Local / Ollama'
};

export const UserSettingsModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const { currentUser, refreshUserHandle, userRole, isAdmin } = useAuth();
  
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

  // Audio Immersion
  const [isAudioMuted, setIsAudioMuted] = useState(() => AudioService.muted);
  const [audioVolume, setAudioVolume] = useState(() => Math.round((AudioService.volume || 0.35) * 100));

  // User Guide Modal
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState('hub');

  // Status & Feedback
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHandle(localStorage.getItem('userHandle') || '');
      setContactInfo(localStorage.getItem('userContactInfo') || '');
      setGeminiApiKey(localStorage.getItem('geminiApiKey') || '');
      setAiPlatform(localStorage.getItem('aiPlatform') || 'gemini');
      setOtherAiApiKey(localStorage.getItem('otherAiApiKey') || '');
      setCustomEndpoint(localStorage.getItem('customEndpoint') || '');
      setIsAudioMuted(AudioService.muted);
      setAudioVolume(Math.round((AudioService.volume || 0.35) * 100));
      setSaveMessage('');

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

  const handleClearCache = () => {
    if (window.confirm("Clear local application cache, search filters and temporary storage? Your user profile and account remain safe.")) {
      localStorage.removeItem('tangent_dbm_cache');
      localStorage.removeItem('tangent_quick_notes');
      AudioService.playTerminalBeep(850, 0.05);
      setSaveMessage("Local cache cleared successfully.");
      setTimeout(() => setSaveMessage(""), 2000);
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

  const TABS = [
    { id: 'identity', label: 'Identity & Profile', icon: User },
    { id: 'audio', label: 'Audio & Immersion', icon: Volume2 },
    { id: 'ai', label: 'AI Neural Core', icon: Cpu, badge: aiPlatform },
    { id: 'manual', label: 'System Manual', icon: BookOpen },
    { id: 'system', label: 'System & Cache', icon: Settings }
  ];

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
        <div 
          className="bg-[#0d1117] border-2 border-cyan-500/50 rounded-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[88vh] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-sans select-none animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:px-6 bg-slate-950/90 border-b border-cyan-900/60 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-cyan-300">
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
              className="text-slate-400 hover:text-white text-xl font-bold leading-none p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Modal Main Body (Tab Nav Rail + Tab Content) */}
          <div className="flex flex-col sm:flex-row min-h-[380px] max-h-[70vh] overflow-hidden">
            
            {/* Left Tab Navigation Rail */}
            <div className="w-full sm:w-52 bg-slate-950/70 border-b sm:border-b-0 sm:border-r border-slate-800 p-2 sm:p-3 flex sm:flex-col gap-1.5 shrink-0 overflow-x-auto sm:overflow-x-visible">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
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
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs bg-[#0b0f17]/40">

              {/* 1. IDENTITY & PROFILE TAB */}
              {activeTab === 'identity' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <User size={14} />
                      <span>Operative Identity</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Configure your public callsign and shared transmission details across squads and sessions.
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
                      Optional external comms handles visible to your party members and squad commanders.
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
                </div>
              )}

              {/* 2. AUDIO & IMMERSION TAB */}
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
                          <div className="font-bold text-slate-200 text-[11px]">Story Foundry</div>
                          <div className="text-[9px] text-slate-500">Campaigns &amp; Nodes</div>
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

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                    <div className="text-cyan-400 font-bold uppercase">SYSTEM VERSION</div>
                    <div>TANGENT SF RP ENGINE BY WOLFE.BT@TANGENTLLC</div>
                    <div>CORE V2.0 • REACT 19.2</div>
                    <div>STATUS: ALL APPS OPERATIONAL</div>
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
          <div className="p-4 sm:px-6 bg-slate-950/90 border-t border-cyan-900/60 flex justify-end gap-2.5">
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
