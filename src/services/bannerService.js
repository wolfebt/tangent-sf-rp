import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export const BANNER_COLOR_THEMES = {
  amber: {
    id: 'amber',
    label: 'Amber Alert (Warning)',
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
  amethyst: {
    id: 'amethyst',
    label: 'Amethyst (Psionic Void)',
    border: 'border-purple-500/45',
    borderGlow: 'hover:border-purple-400/80',
    bg: 'bg-purple-950/35',
    text: 'text-purple-300',
    textGlow: '[text-shadow:0_0_10px_rgba(168,85,247,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(168,85,247,0.2)]',
    badgeBg: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
    beacon: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]',
    accentLine: 'bg-purple-400/80',
    hex: '#a855f7'
  },
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
  indigo: {
    id: 'indigo',
    label: 'Deep Indigo (Astral Void)',
    border: 'border-indigo-500/40',
    borderGlow: 'hover:border-indigo-400/70',
    bg: 'bg-indigo-950/30',
    text: 'text-indigo-300',
    textGlow: '[text-shadow:0_0_10px_rgba(99,102,241,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(99,102,241,0.18)]',
    badgeBg: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200',
    beacon: 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.9)]',
    accentLine: 'bg-indigo-400/80',
    hex: '#6366f1'
  },
  jade: {
    id: 'jade',
    label: 'Jade (Verdant Luminescence)',
    border: 'border-emerald-600/45',
    borderGlow: 'hover:border-emerald-500/75',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    textGlow: '[text-shadow:0_0_10px_rgba(5,150,105,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(5,150,105,0.18)]',
    badgeBg: 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300',
    beacon: 'bg-emerald-500 shadow-[0_0_8px_rgba(5,150,105,0.9)]',
    accentLine: 'bg-emerald-500/80',
    hex: '#059669'
  },
  rose: {
    id: 'rose',
    label: 'Rose Quartz (Bio-Resonance)',
    border: 'border-rose-400/40',
    borderGlow: 'hover:border-rose-300/70',
    bg: 'bg-rose-950/30',
    text: 'text-rose-300',
    textGlow: '[text-shadow:0_0_10px_rgba(251,113,133,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(251,113,133,0.18)]',
    badgeBg: 'bg-rose-500/20 border-rose-400/50 text-rose-200',
    beacon: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]',
    accentLine: 'bg-rose-400/80',
    hex: '#fb7185'
  },
  ruby: {
    id: 'ruby',
    label: 'Ruby Hazard (Critical Incursion)',
    border: 'border-rose-600/45',
    borderGlow: 'hover:border-rose-500/80',
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    textGlow: '[text-shadow:0_0_10px_rgba(225,29,72,0.5)]',
    boxGlow: 'shadow-[0_0_25px_rgba(225,29,72,0.22)]',
    badgeBg: 'bg-rose-600/25 border-rose-500/60 text-rose-200',
    beacon: 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.95)]',
    accentLine: 'bg-rose-500/80',
    hex: '#e11d48'
  },
  saphire: {
    id: 'saphire',
    label: 'Saphire (Cobalt Bastion)',
    border: 'border-blue-500/45',
    borderGlow: 'hover:border-blue-400/80',
    bg: 'bg-blue-950/35',
    text: 'text-blue-300',
    textGlow: '[text-shadow:0_0_10px_rgba(37,99,235,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(37,99,235,0.2)]',
    badgeBg: 'bg-blue-500/25 border-blue-500/60 text-blue-200',
    beacon: 'bg-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.95)]',
    accentLine: 'bg-blue-400/80',
    hex: '#2563eb'
  },
  teal: {
    id: 'teal',
    label: 'Cyber Teal (Sub-Oceanic Grid)',
    border: 'border-teal-500/40',
    borderGlow: 'hover:border-teal-400/70',
    bg: 'bg-teal-950/30',
    text: 'text-teal-300',
    textGlow: '[text-shadow:0_0_10px_rgba(20,184,166,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(20,184,166,0.18)]',
    badgeBg: 'bg-teal-500/20 border-teal-500/50 text-teal-200',
    beacon: 'bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.9)]',
    accentLine: 'bg-teal-400/80',
    hex: '#14b8a6'
  },
  topaz: {
    id: 'topaz',
    label: 'Solar Topaz (Syndicate Sovereign)',
    border: 'border-yellow-500/45',
    borderGlow: 'hover:border-yellow-400/80',
    bg: 'bg-yellow-950/30',
    text: 'text-yellow-300',
    textGlow: '[text-shadow:0_0_10px_rgba(251,191,36,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(251,191,36,0.2)]',
    badgeBg: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
    beacon: 'bg-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]',
    accentLine: 'bg-yellow-400/80',
    hex: '#fbbf24'
  },
  violet: {
    id: 'violet',
    label: 'Psionic Violet (Omnicortex / Resonance)',
    border: 'border-violet-500/45',
    borderGlow: 'hover:border-violet-400/80',
    bg: 'bg-violet-950/30',
    text: 'text-violet-300',
    textGlow: '[text-shadow:0_0_10px_rgba(139,92,246,0.45)]',
    boxGlow: 'shadow-[0_0_25px_rgba(139,92,246,0.2)]',
    badgeBg: 'bg-violet-500/20 border-violet-500/50 text-violet-200',
    beacon: 'bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.9)]',
    accentLine: 'bg-violet-400/80',
    hex: '#8b5cf6'
  },
  silver: {
    id: 'silver',
    label: 'Silver (Quicksilver / Black Shadow)',
    border: 'border-slate-300/50',
    borderGlow: 'hover:border-slate-100/80',
    bg: 'bg-slate-900/40',
    text: 'text-slate-100',
    textGlow: 'silver-black-text-shadow',
    boxGlow: 'silver-black-box-shadow',
    badgeBg: 'bg-slate-800/80 border-slate-400/60 text-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.9)]',
    beacon: 'bg-slate-100 shadow-[0_0_8px_rgba(255,255,255,0.95),0_0_4px_rgba(0,0,0,0.95)]',
    accentLine: 'bg-slate-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.9)]',
    hex: '#e2e8f0'
  }
};

// Aliases for compatibility and alternate spellings
BANNER_COLOR_THEMES.sapphire = BANNER_COLOR_THEMES.saphire;
BANNER_COLOR_THEMES.crimson = BANNER_COLOR_THEMES.ruby;
BANNER_COLOR_THEMES.gold = BANNER_COLOR_THEMES.topaz;
BANNER_COLOR_THEMES.chrome = BANNER_COLOR_THEMES.silver;
BANNER_COLOR_THEMES.platinum = BANNER_COLOR_THEMES.silver;

// The canonical list of distinct available color themes
export const AVAILABLE_BANNER_COLORS = [
  'amber',
  'amethyst',
  'cyan',
  'emerald',
  'indigo',
  'jade',
  'rose',
  'ruby',
  'saphire',
  'silver',
  'teal',
  'topaz',
  'violet'
];

export const BANNER_MODES = {
  ticker: { id: 'ticker', label: 'Ticker Effect', desc: 'Character progression teletype' },
  scrolling: { id: 'scrolling', label: 'Scrolling Marquee', desc: 'Continuous horizontal scroll' },
  static: { id: 'static', label: 'Static Display', desc: 'Fixed stacked text' }
};

export const BANNER_SPEEDS = {
  slow: { id: 'slow', label: 'Slow (40s)', duration: '40s' },
  normal: { id: 'normal', label: 'Standard (25s)', duration: '25s' },
  fast: { id: 'fast', label: 'Rapid (14s)', duration: '14s' },
  turbo: { id: 'turbo', label: 'Turbo (8s)', duration: '8s' }
};

export const TICKER_SPEEDS = {
  slow: { id: 'slow', label: 'Slow (55ms)', interval: 55 },
  normal: { id: 'normal', label: 'Standard (28ms)', interval: 28 },
  fast: { id: 'fast', label: 'Rapid (14ms)', interval: 14 },
  turbo: { id: 'turbo', label: 'Turbo (7ms)', interval: 7 }
};

export const TICKER_ALIGNMENTS = {
  left: { id: 'left', label: 'Left Justified', desc: 'Flush left character teletype' },
  right: { id: 'right', label: 'Right Justified', desc: 'Flush right character teletype' }
};

export const STATIC_FADE_OPTIONS = {
  none: { id: 'none', label: 'Solid (Off)', desc: 'Static continuous readout' },
  pulse: { id: 'pulse', label: 'Breathing Pulse', desc: '3.0s smooth opacity pulse' },
  slow: { id: 'slow', label: 'Slow Wave', desc: '6.0s deep ambient wave' }
};

export const STATIC_GLOW_OPTIONS = {
  none: { id: 'none', label: 'Crisp Flat', desc: 'No glow / razor sharp font' },
  subtle: { id: 'subtle', label: 'Subtle Neon', desc: 'Theme ambient radiance' },
  bloom: { id: 'bloom', label: 'Intense Bloom', desc: 'Hyper-saturated phosphor bloom' }
};

export const normalizeBannerLines = (config) => {
  if (Array.isArray(config?.lines) && config.lines.length > 0) {
    const valid = config.lines
      .map(l => (typeof l === 'string' ? l : ''))
      .slice(0, 3);
    if (valid.some(l => l.trim().length > 0)) {
      return valid;
    }
  }

  if (typeof config?.line1 === 'string' || typeof config?.line2 === 'string' || typeof config?.line3 === 'string') {
    const fromLineKeys = [config.line1, config.line2, config.line3]
      .map(l => (typeof l === 'string' ? l : ''))
      .slice(0, 3);
    if (fromLineKeys.some(l => l.trim().length > 0)) {
      return fromLineKeys;
    }
  }

  if (typeof config?.message === 'string' && config.message.trim().length > 0) {
    if (config.message.includes('\n')) {
      return config.message.split('\n').map(s => s.trim()).slice(0, 3);
    }
    if (config.message.includes(' // ')) {
      return config.message.split(' // ').map(s => s.trim()).slice(0, 3);
    }
    return [config.message.trim()];
  }

  return ['WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE'];
};

export const BANNER_PRESETS = [
  {
    label: 'Standard Welcome',
    badge: 'TACTICAL BROADCAST',
    line1: 'WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE',
    line2: 'BASTION RULES ENGINE ACTIVE // REAL-TIME OPS SYNCHRONIZED',
    line3: 'SELECT ANY MODULE FROM THE GUIDANCE RAIL TO BEGIN',
    lines: [
      'WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE',
      'BASTION RULES ENGINE ACTIVE // REAL-TIME OPS SYNCHRONIZED',
      'SELECT ANY MODULE FROM THE GUIDANCE RAIL TO BEGIN'
    ],
    message: 'WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE // BASTION RULES ENGINE ACTIVE',
    colorTheme: 'cyan',
    mode: 'ticker',
    speed: 'normal',
    tickerSpeed: 28,
    icon: 'Radio'
  },
  {
    label: 'Code Red Incursion',
    badge: 'CRITICAL ALERT',
    line1: 'INCURSION DETECTED IN SECTOR 7 // OPERATIVES TO BATTLE STATIONS',
    line2: 'DEFENSE MATRIX BREACHED AT AIRLOCK 04 // ENGAGE AUTOMATED SENTRY',
    line3: 'AUTHORIZATION SIGMA-9: LETHAL COUNTERMEASURES ENGAGED',
    lines: [
      'INCURSION DETECTED IN SECTOR 7 // OPERATIVES TO BATTLE STATIONS',
      'DEFENSE MATRIX BREACHED AT AIRLOCK 04 // ENGAGE AUTOMATED SENTRY',
      'AUTHORIZATION SIGMA-9: LETHAL COUNTERMEASURES ENGAGED'
    ],
    message: 'INCURSION DETECTED IN SECTOR 7 // OPERATIVES TO BATTLE STATIONS // REINFORCE DEFENSIVE MATRIX IMMEDIATELY',
    colorTheme: 'ruby',
    mode: 'ticker',
    speed: 'fast',
    tickerSpeed: 14,
    icon: 'AlertTriangle'
  },
  {
    label: 'Omnicortex Resonance',
    badge: 'OMNICORTEX SURGE',
    line1: 'PSIONIC RESONANCE PEAKING ACROSS UNKNOWN REGIONS',
    line2: 'ARCHITECT AND OPERATIVE SYNAPSE SYNC RECOMMENDED',
    line3: 'ATTUNEMENT DISCIPLINE STABILIZERS STANDING BY',
    lines: [
      'PSIONIC RESONANCE PEAKING ACROSS UNKNOWN REGIONS',
      'ARCHITECT AND OPERATIVE SYNAPSE SYNC RECOMMENDED',
      'ATTUNEMENT DISCIPLINE STABILIZERS STANDING BY'
    ],
    message: 'PSIONIC RESONANCE PEAKING ACROSS UNKNOWN REGIONS // ARCHITECT AND OPERATIVE SYNAPSE SYNC RECOMMENDED',
    colorTheme: 'amethyst',
    mode: 'ticker',
    speed: 'normal',
    tickerSpeed: 28,
    icon: 'Sparkles'
  },
  {
    label: 'Session Countdown',
    badge: 'MISSION SCHEDULED',
    line1: 'ALL OPERATIVES TAKE NOTE: LIVE CAMPAIGN BRIEFING COMMENCES AT 19:00 UTC',
    line2: 'STAGE VTT TACTICAL GRID READY // VERIFY ACTIVE COMBAT LOADOUTS',
    line3: 'VOICE COMMLINK RELAYS CLEARED ON ENCRYPTED FREQUENCY 142.8',
    lines: [
      'ALL OPERATIVES TAKE NOTE: LIVE CAMPAIGN BRIEFING COMMENCES AT 19:00 UTC',
      'STAGE VTT TACTICAL GRID READY // VERIFY ACTIVE COMBAT LOADOUTS',
      'VOICE COMMLINK RELAYS CLEARED ON ENCRYPTED FREQUENCY 142.8'
    ],
    message: 'ALL OPERATIVES TAKE NOTE: LIVE CAMPAIGN BRIEFING COMMENCES AT 19:00 UTC // STAGE VTT READY // CHECK COMMS RELAY',
    colorTheme: 'amber',
    mode: 'scrolling',
    speed: 'normal',
    tickerSpeed: 28,
    icon: 'AlertTriangle'
  },
  {
    label: 'System Nominal',
    badge: 'ALL SYSTEMS GREEN',
    line1: 'TERRAN DATA NET LATENCY NOMINAL (14ms) // OPFS VECTOR STORE ACTIVE',
    line2: 'MASTER COMPENDIUM SYNCHRONIZED // VOICE RELAY CHANNELS SECURE',
    lines: [
      'TERRAN DATA NET LATENCY NOMINAL (14ms) // OPFS VECTOR STORE ACTIVE',
      'MASTER COMPENDIUM SYNCHRONIZED // VOICE RELAY CHANNELS SECURE'
    ],
    message: 'TERRAN DATA NET LATENCY NOMINAL (14ms) // MASTER COMPENDIUM SYNCHRONIZED // VOICE RELAY CHANNELS CLEARED FOR USE',
    colorTheme: 'emerald',
    mode: 'static',
    speed: 'normal',
    tickerSpeed: 28,
    icon: 'Shield'
  },
  {
    label: 'Deep Void Recon',
    badge: 'ASTROGATION NET',
    line1: 'LONG RANGE SENSOR SWEEP COMPLETED FOR SUB-SECTOR DELTA',
    line2: 'ANOMALOUS DERELICT FOUNDRY IDENTIFIED IN KUIPER DRIFT',
    line3: 'DISPATCHING RECON PROBES // ARCHITECT CLEARANCE GRANTED',
    lines: [
      'LONG RANGE SENSOR SWEEP COMPLETED FOR SUB-SECTOR DELTA',
      'ANOMALOUS DERELICT FOUNDRY IDENTIFIED IN KUIPER DRIFT',
      'DISPATCHING RECON PROBES // ARCHITECT CLEARANCE GRANTED'
    ],
    message: 'LONG RANGE SENSOR SWEEP COMPLETED // DERELICT IDENTIFIED IN KUIPER DRIFT // RECON INITIATED',
    colorTheme: 'saphire',
    mode: 'ticker',
    speed: 'fast',
    tickerSpeed: 14,
    icon: 'Terminal'
  }
];

export const DEFAULT_BANNER_CONFIG = {
  enabled: true,
  badge: 'TACTICAL BROADCAST',
  line1: 'WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE',
  line2: 'BASTION RULES ENGINE ACTIVE // REAL-TIME OPS SYNCHRONIZED',
  line3: 'SELECT ANY MODULE FROM THE GUIDANCE RAIL TO BEGIN',
  lines: [
    'WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE',
    'BASTION RULES ENGINE ACTIVE // REAL-TIME OPS SYNCHRONIZED',
    'SELECT ANY MODULE FROM THE GUIDANCE RAIL TO BEGIN'
  ],
  message: 'WELCOME TO TANGENT SF RP // TERRAN DATA NET PROTOCOLS ONLINE // BASTION RULES ENGINE ACTIVE // SELECT ANY MODULE TO BEGIN',
  mode: 'ticker', // 'ticker' | 'scrolling' | 'static'
  speed: 'normal', // 'slow' | 'normal' | 'fast' | 'turbo'
  tickerSpeed: 28, // ms per char (5ms - 80ms)
  tickerAlignment: 'left', // 'left' | 'right'
  staticFade: 'none', // 'none' | 'pulse' | 'slow'
  staticGlow: 'subtle', // 'none' | 'subtle' | 'bloom'
  colorTheme: 'cyan', // 12 gem colors
  icon: 'Radio', // 'Radio' | 'AlertTriangle' | 'Sparkles' | 'Shield' | 'Terminal' | 'Bell'
  showBackground: true, // true (cyber-gel frame, border, box glow, pulsing beacon dots) | false (clean text only)
  linkUrl: '',
  linkLabel: '',
  allowDismiss: true,
  updatedAt: null,
  updatedBy: null
};

export const DEFAULT_BOTTOM_BANNER_CONFIG = {
  enabled: true,
  badge: 'SYSTEM TELEMETRY',
  line1: 'SECURE COMM LINK OPERATIONAL // ENCRYPTION AES-GCM-256 ACTIVE',
  line2: 'NODE ROUTING: KUIPER DRIFT RELAY 04 // LATENCY 14MS NOMINAL',
  line3: 'GRID SYNCHRONIZATION RUNNING // ALL SUB-SYSTEMS VERIFIED',
  lines: [
    'SECURE COMM LINK OPERATIONAL // ENCRYPTION AES-GCM-256 ACTIVE',
    'NODE ROUTING: KUIPER DRIFT RELAY 04 // LATENCY 14MS NOMINAL',
    'GRID SYNCHRONIZATION RUNNING // ALL SUB-SYSTEMS VERIFIED'
  ],
  message: 'SECURE COMM LINK OPERATIONAL // ENCRYPTION AES-GCM-256 ACTIVE // NODE ROUTING: KUIPER DRIFT RELAY 04',
  mode: 'ticker', // 'ticker' | 'scrolling' | 'static'
  speed: 'normal', // 'slow' | 'normal' | 'fast' | 'turbo'
  tickerSpeed: 28, // ms per char (5ms - 80ms)
  tickerAlignment: 'left', // 'left' | 'right'
  staticFade: 'none', // 'none' | 'pulse' | 'slow'
  staticGlow: 'subtle', // 'none' | 'subtle' | 'bloom'
  colorTheme: 'emerald', // 13 gem colors
  icon: 'Shield', // 'Radio' | 'AlertTriangle' | 'Sparkles' | 'Shield' | 'Terminal' | 'Bell' | 'none'
  showBackground: true, // true (cyber-gel frame) | false (clean text only)
  linkUrl: '',
  linkLabel: '',
  allowDismiss: true,
  updatedAt: null,
  updatedBy: null
};

export const LOCAL_STORAGE_KEY_TOP = 'tangent_home_banner';
export const LOCAL_STORAGE_KEY_BOTTOM = 'tangent_home_bottom_banner';
export const FIRESTORE_DOC_TOP = 'home_banner';
export const FIRESTORE_DOC_BOTTOM = 'home_bottom_banner';
export const EVENT_NAME_TOP = 'tangent-banner-updated';
export const EVENT_NAME_BOTTOM = 'tangent-bottom-banner-updated';

// Legacy alias
const LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEY_TOP;

export const getCachedHomeBanner = (position = 'top') => {
  const isBottom = position === 'bottom';
  const storageKey = isBottom ? LOCAL_STORAGE_KEY_BOTTOM : LOCAL_STORAGE_KEY_TOP;
  const defaultConfig = isBottom ? DEFAULT_BOTTOM_BANNER_CONFIG : DEFAULT_BANNER_CONFIG;
  try {
    const raw = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(storageKey) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...defaultConfig, ...parsed };
      // Ensure lines array is properly populated
      merged.lines = normalizeBannerLines(merged);
      merged.line1 = merged.lines[0] || '';
      merged.line2 = merged.lines[1] || '';
      merged.line3 = merged.lines[2] || '';
      return merged;
    }
  } catch (err) {
    console.warn(`Failed reading cached ${position} banner:`, err);
  }
  return { ...defaultConfig };
};

export const getCachedHomeBottomBanner = () => getCachedHomeBanner('bottom');

export const parseTimestamp = (val) => {
  if (!val) return 0;
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val?.toMillis === 'function') {
    try {
      const ms = val.toMillis();
      if (typeof ms === 'number' && !Number.isNaN(ms)) return ms;
    } catch {}
  }
  if (typeof val?.toDate === 'function') {
    try {
      const ms = val.toDate().getTime();
      if (typeof ms === 'number' && !Number.isNaN(ms)) return ms;
    } catch {}
  }
  if (typeof val?.seconds === 'number') {
    return (val.seconds * 1000) + Math.floor((val.nanoseconds || 0) / 1000000);
  }
  if (val instanceof Date) {
    const ms = val.getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  if (typeof val === 'string') {
    const ms = new Date(val).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  return 0;
};

export const subscribeToHomeBanner = (callback, position = 'top') => {
  const isBottom = position === 'bottom';
  const storageKey = isBottom ? LOCAL_STORAGE_KEY_BOTTOM : LOCAL_STORAGE_KEY_TOP;
  const firestoreDocName = isBottom ? FIRESTORE_DOC_BOTTOM : FIRESTORE_DOC_TOP;
  const defaultConfig = isBottom ? DEFAULT_BOTTOM_BANNER_CONFIG : DEFAULT_BANNER_CONFIG;

  // Emit initial cached state immediately
  const initial = getCachedHomeBanner(position);
  callback(initial);

  try {
    const docRef = doc(db, 'system_settings', firestoreDocName);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      const cached = getCachedHomeBanner(position);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Conflict resolution:
        // Parse remote and local timestamps safely across numbers, ISO strings, and Firestore Timestamp objects.
        const remoteTime = Math.max(
          parseTimestamp(data?.updatedAt),
          parseTimestamp(data?._localUpdatedAt)
        );
        const localTime = Math.max(
          parseTimestamp(cached?.updatedAt),
          parseTimestamp(cached?._localUpdatedAt)
        );

        // If local client has an explicit local modification (_localUpdatedAt)
        // and local timestamp is newer or equal to remote document timestamp,
        // preserve local user modifications (e.g. offline edits, local overrides, or rejected writes).
        if (cached?._localUpdatedAt && localTime >= remoteTime) {
          callback(cached);
          return;
        }

        const merged = { ...defaultConfig, ...data };
        merged.lines = normalizeBannerLines(merged);
        merged.line1 = merged.lines[0] || '';
        merged.line2 = merged.lines[1] || '';
        merged.line3 = merged.lines[2] || '';
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(storageKey, JSON.stringify(merged));
        }
        callback(merged);
      } else {
        // Document not created yet on remote Firestore: retain local cached banner
        callback(cached);
      }
    }, (err) => {
      console.warn(`Home ${position} banner Firestore listener warn (using local cache):`, err);
      callback(getCachedHomeBanner(position));
    });

    return unsubscribe;
  } catch (err) {
    console.warn(`Firestore not available for ${position} banner subscription:`, err);
    return () => {};
  }
};

export const subscribeToHomeBottomBanner = (callback) => subscribeToHomeBanner(callback, 'bottom');

export const saveHomeBanner = async (newConfig, user = null, position = 'top') => {
  const isBottom = position === 'bottom';
  const storageKey = isBottom ? LOCAL_STORAGE_KEY_BOTTOM : LOCAL_STORAGE_KEY_TOP;
  const firestoreDocName = isBottom ? FIRESTORE_DOC_BOTTOM : FIRESTORE_DOC_TOP;
  const eventName = isBottom ? EVENT_NAME_BOTTOM : EVENT_NAME_TOP;
  const defaultConfig = isBottom ? DEFAULT_BOTTOM_BANNER_CONFIG : DEFAULT_BANNER_CONFIG;

  // Extract and normalize up to 3 lines
  const rawLines = [
    newConfig.line1,
    newConfig.line2,
    newConfig.line3
  ].map(l => (typeof l === 'string' ? l.trim() : ''));

  const activeLines = rawLines.filter(Boolean);
  const normalizedLines = activeLines.length > 0
    ? activeLines
    : normalizeBannerLines(newConfig);

  const nowMillis = Date.now();
  const now = new Date(nowMillis).toISOString();
  const merged = {
    ...defaultConfig,
    ...newConfig,
    line1: normalizedLines[0] || '',
    line2: normalizedLines[1] || '',
    line3: normalizedLines[2] || '',
    lines: normalizedLines.slice(0, 3),
    message: normalizedLines.join(' // ') || newConfig.message || 'NO TRANSMISSION ENTERED',
    updatedAt: now,
    _localUpdatedAt: nowMillis,
    updatedBy: user?.displayName || user?.email || 'Operator'
  };

  // 1. Immediately cache locally
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(storageKey, JSON.stringify(merged));
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(eventName, { detail: merged }));
    }
  } catch (err) {
    console.warn(`Failed to set local storage banner for ${position}:`, err);
  }

  // 2. Persist to Firestore (with 1200ms timeout race to keep UI instantaneous)
  try {
    const docRef = doc(db, 'system_settings', firestoreDocName);
    const firestorePromise = setDoc(docRef, merged, { merge: true });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore operation timed out')), 1200)
    );
    await Promise.race([firestorePromise, timeoutPromise]);
    return { success: true, banner: merged };
  } catch (err) {
    console.warn(`Failed to save ${position} banner to Firestore, saved locally only:`, err);
    return { success: true, banner: merged, localOnly: true };
  }
};

export const saveHomeBottomBanner = async (newConfig, user = null) => saveHomeBanner(newConfig, user, 'bottom');
