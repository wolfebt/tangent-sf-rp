import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const BANNER_COLOR_THEMES = {
  cyan: {
    id: 'cyan',
    label: 'Neon Cyan (Terran Core)',
    border: 'border-cyan-500/40',
    borderGlow: 'hover:border-cyan-400/70',
    bg: 'bg-cyan-950/30',
    text: 'text-cyan-300',
    textGlow: '[text-shadow:0_0_10px_rgba(34,211,238,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(34,211,238,0.18)]',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200',
    beacon: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]',
    accentLine: 'bg-cyan-400/80',
    hex: '#22d3ee'
  },
  amber: {
    id: 'amber',
    label: 'Amber Alert (Hazard Warning)',
    border: 'border-amber-500/40',
    borderGlow: 'hover:border-amber-400/70',
    bg: 'bg-amber-950/30',
    text: 'text-amber-300',
    textGlow: '[text-shadow:0_0_10px_rgba(245,158,11,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(245,158,11,0.18)]',
    badgeBg: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
    beacon: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]',
    accentLine: 'bg-amber-400/80',
    hex: '#f59e0b'
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald Matrix (Nominal / Safe)',
    border: 'border-emerald-500/40',
    borderGlow: 'hover:border-emerald-400/70',
    bg: 'bg-emerald-950/30',
    text: 'text-emerald-300',
    textGlow: '[text-shadow:0_0_10px_rgba(16,185,129,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(16,185,129,0.18)]',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
    beacon: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]',
    accentLine: 'bg-emerald-400/80',
    hex: '#10b981'
  },
  crimson: {
    id: 'crimson',
    label: 'Crimson Hazard (Critical Alert)',
    border: 'border-rose-500/45',
    borderGlow: 'hover:border-rose-400/80',
    bg: 'bg-rose-950/35',
    text: 'text-rose-300',
    textGlow: '[text-shadow:0_0_10px_rgba(244,63,94,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(244,63,94,0.2)]',
    badgeBg: 'bg-rose-500/25 border-rose-500/60 text-rose-200',
    beacon: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.95)]',
    accentLine: 'bg-rose-400/80',
    hex: '#f43f5e'
  },
  violet: {
    id: 'violet',
    label: 'Psionic Violet (Omnicortex / Metaphysics)',
    border: 'border-purple-500/45',
    borderGlow: 'hover:border-purple-400/80',
    bg: 'bg-purple-950/30',
    text: 'text-purple-300',
    textGlow: '[text-shadow:0_0_10px_rgba(168,85,247,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(168,85,247,0.2)]',
    badgeBg: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
    beacon: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]',
    accentLine: 'bg-purple-400/80',
    hex: '#a855f7'
  },
  gold: {
    id: 'gold',
    label: 'Solar Gold (Syndicate Sovereign)',
    border: 'border-yellow-500/45',
    borderGlow: 'hover:border-yellow-400/80',
    bg: 'bg-yellow-950/30',
    text: 'text-yellow-300',
    textGlow: '[text-shadow:0_0_10px_rgba(234,179,8,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(234,179,8,0.2)]',
    badgeBg: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
    beacon: 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.9)]',
    accentLine: 'bg-yellow-400/80',
    hex: '#eab308'
  }
};

export const BANNER_SPEEDS = {
  slow: { id: 'slow', label: 'Slow (40s)', duration: '40s' },
  normal: { id: 'normal', label: 'Standard (25s)', duration: '25s' },
  fast: { id: 'fast', label: 'Rapid (14s)', duration: '14s' }
};

export const BANNER_PRESETS = [
  {
    label: 'Standard Welcome',
    badge: 'TACTICAL BROADCAST',
    message: 'WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE // BASTION RULES ENGINE ACTIVE // SELECT ANY MODULE TO BEGIN',
    colorTheme: 'cyan',
    mode: 'scrolling',
    speed: 'normal',
    icon: 'Radio'
  },
  {
    label: 'Session Countdown',
    badge: 'MISSION SCHEDULED',
    message: 'ALL OPERATIVES TAKE NOTE: LIVE CAMPAIGN BRIEFING COMMENCES AT 19:00 UTC // STAGE VTT READY // CHECK COMMS RELAY',
    colorTheme: 'amber',
    mode: 'scrolling',
    speed: 'normal',
    icon: 'AlertTriangle'
  },
  {
    label: 'System Nominal',
    badge: 'ALL SYSTEMS GREEN',
    message: 'TERRAN DATA NET LATENCY NOMINAL (14ms) // MASTER COMPENDIUM SYNCHRONIZED // VOICE RELAY CHANNELS CLEARED FOR USE',
    colorTheme: 'emerald',
    mode: 'static',
    speed: 'normal',
    icon: 'Shield'
  },
  {
    label: 'Code Red Breach',
    badge: 'CODE RED PRIORITY',
    message: 'INCURSION DETECTED IN SECTOR 7 // OPERATIVES TO BATTLE STATIONS // REINFORCE DEFENSIVE MATRIX IMMEDIATELY',
    colorTheme: 'crimson',
    mode: 'scrolling',
    speed: 'fast',
    icon: 'AlertTriangle'
  },
  {
    label: 'Metaphysics Surge',
    badge: 'OMNICORTEX SURGE',
    message: 'PSIONIC RESONANCE PEAKING ACROSS UNKNOWN REGIONS // ARCHITECT AND OPERATIVE SYNAPSE SYNC RECOMMENDED',
    colorTheme: 'violet',
    mode: 'scrolling',
    speed: 'normal',
    icon: 'Sparkles'
  }
];

export const DEFAULT_BANNER_CONFIG = {
  enabled: true,
  badge: 'TACTICAL BROADCAST',
  message: 'WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE // BASTION RULES ENGINE ACTIVE // STAND BY FOR SQUAD ASSIGNMENT',
  mode: 'scrolling', // 'scrolling' | 'static'
  speed: 'normal', // 'slow' | 'normal' | 'fast'
  colorTheme: 'cyan', // 'cyan' | 'amber' | 'emerald' | 'crimson' | 'violet' | 'gold'
  icon: 'Radio', // 'Radio' | 'AlertTriangle' | 'Sparkles' | 'Shield' | 'Terminal' | 'Bell'
  linkUrl: '',
  linkLabel: '',
  allowDismiss: true,
  updatedAt: null,
  updatedBy: null
};

const LOCAL_STORAGE_KEY = 'tangent_home_banner';

export const getCachedHomeBanner = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BANNER_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn("Failed reading cached banner:", err);
  }
  return DEFAULT_BANNER_CONFIG;
};

export const subscribeToHomeBanner = (callback) => {
  // Emit initial cached state immediately
  const initial = getCachedHomeBanner();
  callback(initial);

  try {
    const docRef = doc(db, 'system_settings', 'home_banner');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const merged = { ...DEFAULT_BANNER_CONFIG, ...data };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        callback(merged);
      } else {
        // Doc not created yet, persist default to local storage
        callback(DEFAULT_BANNER_CONFIG);
      }
    }, (err) => {
      console.warn("Home banner Firestore listener warn (using local cache):", err);
      callback(getCachedHomeBanner());
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Firestore not available for banner subscription:", err);
    return () => {};
  }
};

export const saveHomeBanner = async (newConfig, user) => {
  const merged = {
    ...DEFAULT_BANNER_CONFIG,
    ...newConfig,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.displayName || user?.email || 'Operator'
  };

  // 1. Immediately cache locally
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('tangent-banner-updated', { detail: merged }));
  } catch (err) {
    console.warn("Failed to set local storage banner:", err);
  }

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'system_settings', 'home_banner');
    await setDoc(docRef, merged, { merge: true });
    return { success: true, banner: merged };
  } catch (err) {
    console.warn("Failed to save banner to Firestore, saved locally only:", err);
    return { success: true, banner: merged, localOnly: true };
  }
};
