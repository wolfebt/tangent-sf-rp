import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Headphones,
  VolumeX,
  PhoneOff,
  Radio,
  Settings,
  ChevronUp,
  ChevronDown,
  Shield,
  User,
  Check,
  Volume2,
  Sparkles,
  Activity,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';

const PTT_KEY_OPTIONS = [
  { label: 'V Key', code: 'KeyV' },
  { label: 'Spacebar', code: 'Space' },
  { label: 'C Key', code: 'KeyC' },
  { label: 'T Key', code: 'KeyT' },
  { label: 'CapsLock', code: 'CapsLock' }
];

const PRESENCE_STATES = [
  { id: 'online', label: 'Online // Ready', color: 'bg-emerald-400', text: 'text-emerald-300' },
  { id: 'idle', label: 'Idle // Standby', color: 'bg-amber-400', text: 'text-amber-300' },
  { id: 'dnd', label: 'In-Mission // DND', color: 'bg-rose-500', text: 'text-rose-300' },
  { id: 'invisible', label: 'Stealth // Cloaked', color: 'bg-slate-500', text: 'text-slate-400' }
];

/**
 * @component TransceiverDeck
 * @description Persistent bottom-left Operator, Persona & Voice Transceiver Pod anchored in Zone 2.
 * Combines Discord-style user/voice controls with TANGENT's IC/OOC Folio Persona switcher.
 */
export const TransceiverDeck = () => {
  const { currentUser, userHandle, openAuthModal } = useAuth() || {};
  const {
    activeChannel,
    speakingMode,
    setSpeakingMode,
    selectedPersona,
    setSelectedPersona,
    isCurrentChannelArchitect,
    manualPresenceStatus = 'online',
    setManualPresenceStatus,
    customStatusMessage = '',
    setCustomStatusMessage
  } = useChat() || {};

  const { personaRoster = [], roster = [] } = useFolio() || {};

  const {
    isConnected,
    isConnecting,
    currentRoomName,
    roomDisplayName,
    isMuted,
    isDeafened,
    isSpeaking,
    activeSpeakers = [],
    participants = [],
    isPushToTalk,
    pttKey = 'KeyV',
    isPttPressed,
    setIsPushToTalk,
    setPttKey,
    connectToVoiceRoom,
    disconnectVoiceRoom,
    toggleMute,
    toggleDeafen
  } = useVoiceChat() || {};

  const [activePopover, setActivePopover] = useState(null); // 'presence' | 'persona' | 'settings' | 'voiceRoster' | null
  const [statusDraft, setStatusDraft] = useState(customStatusMessage || '');

  const availablePersonas = React.useMemo(() => {
    const source =
      Array.isArray(personaRoster) && personaRoster.length > 0
        ? personaRoster
        : Array.isArray(roster)
        ? roster
        : [];
    const seen = new Set();
    return source.filter((p) => {
      if (!p || p.isDeleted) return false;
      const id = p['character-doc-id'] || p.id;
      const name = p['char-name'] || p.name;
      if (!id || !name || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [personaRoster, roster]);

  const effectiveHandle =
    userHandle ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Guest_Op';

  const activePersonaName =
    selectedPersona?.['char-name'] || selectedPersona?.name || null;

  const currentPresenceMeta =
    PRESENCE_STATES.find((s) => s.id === manualPresenceStatus) ||
    PRESENCE_STATES[0];

  const handleTogglePopover = (name) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (name === 'presence') {
      setStatusDraft(customStatusMessage || '');
    }
    setActivePopover((prev) => (prev === name ? null : name));
  };

  const handleQuickJoinOrMute = () => {
    if (isConnected) {
      toggleMute?.();
    } else if (activeChannel) {
      const targetRoom = `tangent_freq_${activeChannel.id}`;
      connectToVoiceRoom?.(
        targetRoom,
        activeChannel.displayName || `#${activeChannel.name}`
      );
    }
  };

  return (
    <div className="relative bg-[#060911] border-t border-slate-800/90 select-none font-mono text-xs shrink-0 z-20">
      {/* ── POPOVER 1: PRESENCE & CUSTOM STATUS ── */}
      {activePopover === 'presence' && (
        <div className="absolute bottom-full left-2 right-2 mb-2 p-3 rounded-xl bg-slate-950 border border-cyan-500/50 shadow-2xl z-50 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              OPERATOR TELEMETRY STATUS
            </span>
            <button
              type="button"
              onClick={() => setActivePopover(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {PRESENCE_STATES.map((st) => {
              const isSelected = manualPresenceStatus === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.02);
                    setManualPresenceStatus?.(st.id);
                  }}
                  className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 text-white font-bold'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${st.color}`} />
                  <span className="text-[10px] truncate">{st.label.split(' // ')[0]}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <label className="text-[9.5px] text-slate-400 uppercase block">
              Custom Signal Broadcast
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                placeholder="e.g. Prepping Sector 7 Raid..."
                maxLength={80}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomStatusMessage?.(statusDraft);
                  setActivePopover(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] cursor-pointer"
              >
                SET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── POPOVER 2: BOUND FOLIO PERSONA & IC/OOC/ARCHITECT SWITCHER ── */}
      {activePopover === 'persona' && (
        <div className="absolute bottom-full left-2 right-2 mb-2 p-3 rounded-xl bg-slate-950 border border-emerald-500/50 shadow-2xl z-50 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              TRANSMISSION IDENTITY
            </span>
            <button
              type="button"
              onClick={() => setActivePopover(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1150, 0.02);
                  setSpeakingMode?.('OOC');
                  setActivePopover(null);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  speakingMode === 'OOC'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <User size={12} />
                <span>👤 OOC OPERATOR</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1250, 0.02);
                  setSpeakingMode?.('IC');
                  setActivePopover(null);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  speakingMode === 'IC'
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎭 IC PERSONA</span>
              </button>
            </div>

            {isCurrentChannelArchitect && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1350, 0.025);
                  setSpeakingMode?.('ARCHITECT');
                  setActivePopover(null);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  speakingMode === 'ARCHITECT'
                    ? 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-900 border-amber-500/30 text-amber-300/90 hover:bg-amber-950/40'
                }`}
              >
                <Crown size={12} className="text-amber-400" />
                <span>ARCHITECT // GM (Referee)</span>
              </button>
            )}
          </div>

          {/* Persona Selector List */}
          <div className="space-y-1 max-h-44 overflow-y-auto no-scrollbar pt-1 border-t border-slate-800/80">
            <span className="text-[9.5px] text-slate-400 uppercase block">
              Active Folio Character ({availablePersonas.length})
            </span>
            {availablePersonas.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic py-1">
                No Folio characters found. Create one in Folio to transmit In-Character.
              </p>
            ) : (
              availablePersonas.map((p) => {
                const pId = p['character-doc-id'] || p.id;
                const pName = p['char-name'] || p.name;
                const pRole = p['char-concept'] || p.role || p['char-species'] || 'Operative';
                const currentId =
                  selectedPersona?.['character-doc-id'] || selectedPersona?.id;
                const isSelected = pId === currentId;

                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => {
                      AudioService.playTerminalBeep(1300, 0.02);
                      setSelectedPersona?.(p);
                      setSpeakingMode?.('IC');
                      setActivePopover(null);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-bold'
                        : 'bg-slate-900/70 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] truncate flex items-center gap-1">
                        <span>🎭</span>
                        <span className="truncate">{pName}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {pRole}
                      </div>
                    </div>
                    {isSelected && <Check size={12} className="text-emerald-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── POPOVER 3: VOICE & AUDIO SETTINGS ── */}
      {activePopover === 'settings' && (
        <div className="absolute bottom-full left-2 right-2 mb-2 p-3 rounded-xl bg-slate-950 border border-cyan-500/50 shadow-2xl z-50 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              TRANSCEIVER & VOICE CONFIG
            </span>
            <button
              type="button"
              onClick={() => setActivePopover(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-[9.5px] text-slate-400 uppercase">
              Voice Activation Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setIsPushToTalk?.(false)}
                className={`px-2 py-1.5 rounded-lg border text-center text-[10.5px] font-bold transition-all cursor-pointer ${
                  !isPushToTalk
                    ? 'bg-cyan-600 border-cyan-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Open Mic
              </button>
              <button
                type="button"
                onClick={() => setIsPushToTalk?.(true)}
                className={`px-2 py-1.5 rounded-lg border text-center text-[10.5px] font-bold transition-all cursor-pointer ${
                  isPushToTalk
                    ? 'bg-cyan-600 border-cyan-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Push-To-Talk
              </button>
            </div>
          </div>

          {isPushToTalk && (
            <div>
              <label className="block text-[9.5px] text-slate-400 uppercase mb-1">
                PTT Keybind
              </label>
              <select
                value={pttKey}
                onChange={(e) => setPttKey?.(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:border-cyan-400 outline-none cursor-pointer"
              >
                {PTT_KEY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Terminal Audio Chirps</span>
            <button
              type="button"
              onClick={() => AudioService.playTerminalBeep(1400, 0.05)}
              className="px-2 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[9.5px] font-bold cursor-pointer hover:bg-cyan-900"
            >
              TEST SIGNAL
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIVE VOICE CONNECTION STRIP (Shown when connected/connecting) ── */}
      {(isConnected || isConnecting) && (
        <div className="px-2.5 py-2 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-cyan-950/40 border-b border-emerald-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shrink-0">
              <Radio
                size={13}
                className={
                  isConnecting
                    ? 'animate-spin'
                    : isSpeaking
                    ? 'animate-pulse text-emerald-300'
                    : ''
                }
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-300 truncate uppercase">
                  {roomDisplayName || currentRoomName || 'VOICE ACTIVE'}
                </span>
                <span className="px-1 py-0.1 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-bold">
                  {participants.length + 1} IN ROOM
                </span>
              </div>
              <div className="text-[9px] text-slate-400 truncate">
                {isPushToTalk
                  ? isPttPressed
                    ? '⚡ TRANSMITTING PTT...'
                    : `Hold [${pttKey.replace('Key', '')}] to transmit`
                  : isMuted
                  ? 'Mic Muted'
                  : isSpeaking
                  ? '🟢 Speaking...'
                  : 'Voice Ready • 48kHz Opus'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={disconnectVoiceRoom}
            className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white transition-colors cursor-pointer shrink-0"
            title="Disconnect Voice Frequency"
          >
            <PhoneOff size={12} />
          </button>
        </div>
      )}

      {/* ── MAIN PERSISTENT OPERATOR & PERSONA TRANSCEIVER POD ── */}
      <div className="p-2 flex items-center justify-between gap-1.5">
        {/* Left: Operator Avatar + Status Dot + Active Persona Identity */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Avatar Button -> Opens Presence Popover */}
          <button
            type="button"
            onClick={() =>
              currentUser ? handleTogglePopover('presence') : openAuthModal?.()
            }
            className="relative group shrink-0 cursor-pointer"
            title={`Status: ${currentPresenceMeta.label} (Click to change)`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 border border-slate-700 group-hover:border-cyan-500/60 flex items-center justify-center font-bold text-[11px] text-cyan-300 shadow-sm">
              {effectiveHandle.slice(0, 2).toUpperCase()}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#060911] ${currentPresenceMeta.color}`}
            />
          </button>

          {/* Identity Stack -> Clickable to switch IC/OOC/ARCHITECT & Persona */}
          <button
            type="button"
            onClick={() => handleTogglePopover('persona')}
            className="min-w-0 flex-1 text-left px-1.5 py-0.5 rounded-lg hover:bg-slate-900/90 transition-colors cursor-pointer group"
            title="Click to switch Speaking Identity (OOC Operator, IC Folio Persona, or Architect GM / Referee)"
          >
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-bold text-[11px] text-slate-100 truncate">
                @{effectiveHandle}
              </span>
              <ChevronUp
                size={10}
                className="text-slate-500 group-hover:text-cyan-300 shrink-0"
              />
            </div>

            <div className="flex items-center gap-1 min-w-0">
              {speakingMode === 'ARCHITECT' && isCurrentChannelArchitect ? (
                <span className="text-[9.5px] font-bold text-amber-400 truncate flex items-center gap-1">
                  <Crown size={10} className="text-amber-400 shrink-0" />
                  <span className="truncate">ARCHITECT // GM</span>
                </span>
              ) : speakingMode === 'IC' && activePersonaName ? (
                <span className="text-[9.5px] font-bold text-emerald-400 truncate flex items-center gap-1">
                  <span>🎭 IC:</span>
                  <span className="truncate">{activePersonaName}</span>
                </span>
              ) : (
                <span className="text-[9.5px] text-cyan-400/90 truncate">
                  {customStatusMessage || '👤 OOC Operator Mode'}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Right: Audio & Transceiver Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mic / Quick Voice Join Button */}
          <button
            type="button"
            onClick={handleQuickJoinOrMute}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              !isConnected
                ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40'
                : isMuted
                ? 'bg-rose-950/70 border-rose-500/60 text-rose-300'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            }`}
            title={
              !isConnected
                ? 'Join Active Channel Voice Frequency'
                : isMuted
                ? 'Unmute Microphone'
                : 'Mute Microphone'
            }
          >
            {isConnected && isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>

          {/* Deafen Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isConnected) {
                toggleDeafen?.();
              } else {
                handleTogglePopover('settings');
              }
            }}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isConnected && isDeafened
                ? 'bg-rose-950/70 border-rose-500/60 text-rose-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
            title={
              isConnected
                ? isDeafened
                  ? 'Undeafen Audio'
                  : 'Deafen Audio'
                : 'Audio & Voice Settings'
            }
          >
            {isConnected && isDeafened ? (
              <VolumeX size={14} />
            ) : (
              <Headphones size={14} />
            )}
          </button>

          {/* Transceiver Settings Cog */}
          <button
            type="button"
            onClick={() => handleTogglePopover('settings')}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              activePopover === 'settings'
                ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
            title="Transceiver & PTT Configuration"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransceiverDeck;
