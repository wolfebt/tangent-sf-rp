import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Headphones, 
  VolumeX, 
  PhoneOff, 
  Radio, 
  Users, 
  Settings, 
  Activity, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Volume2,
  Shield
} from 'lucide-react';
import { useVoiceChat } from '../../context/VoiceChatContext';
import { AudioService } from '../../services/audioService';

export const VoiceCommsBar = ({ className = '' }) => {
  const {
    isConnected,
    isConnecting,
    currentRoomName,
    roomDisplayName,
    isMuted,
    isDeafened,
    isSpeaking,
    activeSpeakers,
    participants,
    isPushToTalk,
    pttKey,
    isPttPressed,
    setIsPushToTalk,
    setPttKey,
    disconnectVoiceRoom,
    toggleMute,
    toggleDeafen,
    connectionError
  } = useVoiceChat();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!isConnected && !isConnecting) {
    return null;
  }

  const PTT_KEY_OPTIONS = [
    { label: 'V key', code: 'KeyV' },
    { label: 'Spacebar', code: 'Space' },
    { label: 'C key', code: 'KeyC' },
    { label: 'T key', code: 'KeyT' },
    { label: 'CapsLock', code: 'CapsLock' }
  ];

  return (
    <div className={`w-full bg-slate-950/95 border-t border-cyan-500/40 shadow-[0_-4px_20px_rgba(6,182,212,0.15)] select-none font-sans z-30 transition-all ${className}`}>
      {/* Top Banner / Collapsible Roster */}
      {isExpanded && (
        <div className="p-3 bg-slate-900/95 border-b border-slate-800 text-xs flex flex-col gap-2 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Users size={13} />
              <span>Operatives On Frequency ({participants.length + 1})</span>
            </span>
            <span className="text-slate-400 lowercase">{currentRoomName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {/* Local User */}
            <div className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
              isSpeaking
                ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white border ${
                  isSpeaking ? 'bg-emerald-600 border-emerald-400 animate-pulse' : 'bg-slate-700 border-slate-600'
                }`}>
                  YOU
                </div>
                {isSpeaking && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-slate-100 truncate text-[11.5px]">Local Operative</span>
                <span className="text-[9.5px] font-mono text-slate-400">
                  {isMuted ? 'Muted' : isSpeaking ? 'Transmitting...' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Remote Participants */}
            {participants.map((p) => {
              const speaking = activeSpeakers.includes(p.identity) || p.isSpeaking;
              return (
                <div 
                  key={p.identity} 
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    speaking
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white border ${
                      speaking ? 'bg-cyan-600 border-cyan-400 animate-pulse' : 'bg-slate-800 border-slate-700'
                    }`}>
                      {p.name?.substring(0, 2).toUpperCase() || 'OP'}
                    </div>
                    {speaking && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-slate-100 truncate text-[11.5px]">{p.name}</span>
                    <span className="text-[9.5px] font-mono text-slate-400 truncate">
                      {p.metadata?.role || (speaking ? 'Speaking...' : 'Standby')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Docked Control Bar */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Frequency Info & Waveform */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shrink-0">
            <Radio size={16} className={isConnecting ? 'animate-spin' : isSpeaking ? 'animate-bounce' : ''} />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
              isConnecting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
            }`} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wide text-cyan-300 uppercase truncate">
                {roomDisplayName || currentRoomName || 'SECURE COMM FREQ'}
              </span>
              <span className="hidden sm:inline px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[9px] font-bold border border-cyan-500/40">
                VOICE LIVE
              </span>
            </div>

            {/* Audio Wave / Speaking State Indicator */}
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-400">
              {isPushToTalk && (
                <span className={`font-bold transition-colors ${
                  isPttPressed ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                }`}>
                  [{isPttPressed ? 'TRANSMITTING' : `HOLD ${pttKey.replace('Key', '')} TO TALK`}]
                </span>
              )}
              {!isPushToTalk && (
                <span className={isSpeaking ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {isMuted ? 'MIC MUTED' : isSpeaking ? 'TRANSMITTING VOICE' : 'OPEN FREQUENCY'}
                </span>
              )}

              {/* Dynamic waveform bars */}
              <div className="flex items-center gap-0.5 ml-1 h-3">
                <span className={`w-0.5 rounded-full transition-all duration-75 ${
                  isSpeaking ? 'h-3 bg-emerald-400' : 'h-1 bg-slate-700'
                }`} />
                <span className={`w-0.5 rounded-full transition-all duration-75 ${
                  isSpeaking ? 'h-2 bg-emerald-400' : 'h-1 bg-slate-700'
                }`} />
                <span className={`w-0.5 rounded-full transition-all duration-75 ${
                  isSpeaking ? 'h-3.5 bg-emerald-400' : 'h-1.5 bg-slate-700'
                }`} />
                <span className={`w-0.5 rounded-full transition-all duration-75 ${
                  isSpeaking ? 'h-2.5 bg-emerald-400' : 'h-1 bg-slate-700'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Audio Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mute Mic Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-950/60 border-rose-500/70 text-rose-300 hover:bg-rose-900/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]' 
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Deafen Toggle */}
          <button
            type="button"
            onClick={toggleDeafen}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDeafened 
                ? 'bg-rose-950/60 border-rose-500/70 text-rose-300 hover:bg-rose-900/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]' 
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50'
            }`}
            title={isDeafened ? 'Undeafen Comms' : 'Deafen Comms (Mute Incoming Audio)'}
          >
            {isDeafened ? <VolumeX size={16} /> : <Headphones size={16} />}
          </button>

          {/* Settings Menu Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showSettings 
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-300'
              }`}
              title="Voice Transmission Settings"
            >
              <Settings size={16} />
            </button>

            {/* Settings Popover */}
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-950 border border-cyan-500/50 rounded-xl shadow-2xl z-50 text-xs font-mono">
                <div className="font-bold text-cyan-400 mb-2 border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>VOICE CONFIGURATION</span>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Transmission Mode */}
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Transmission Mode</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsPushToTalk(false)}
                        className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          !isPushToTalk 
                            ? 'bg-cyan-600 border-cyan-400 text-white font-bold' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Open Mic
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPushToTalk(true)}
                        className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          isPushToTalk 
                            ? 'bg-cyan-600 border-cyan-400 text-white font-bold' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Push-To-Talk
                      </button>
                    </div>
                  </div>

                  {/* PTT Key selector if enabled */}
                  {isPushToTalk && (
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Push-to-Talk Hotkey</label>
                      <select
                        value={pttKey}
                        onChange={(e) => setPttKey(e.target.value)}
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

                  <div className="text-[9.5px] text-slate-500 italic pt-1 border-t border-slate-900">
                    LiveKit SFU Adaptive Opus Audio (48kHz)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expand / Collapse Roster */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all cursor-pointer"
            title={isExpanded ? 'Collapse Operatives Roster' : 'View Operatives in Voice'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {/* Terminate / Disconnect Commlink */}
          <button
            type="button"
            onClick={disconnectVoiceRoom}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
            title="Sever Commlink Frequency"
          >
            <PhoneOff size={14} />
            <span className="hidden sm:inline">DISCONNECT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommsBar;
