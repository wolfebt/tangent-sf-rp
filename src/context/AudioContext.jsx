import React, { createContext, useContext, useState, useCallback } from 'react';
import { AudioService } from '../services/audioService';

const AudioContext = globalThis.__TANGENT_AUDIO_CONTEXT__ || (globalThis.__TANGENT_AUDIO_CONTEXT__ = createContext(null));

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) return { isMuted: AudioService.muted, toggleMute: () => AudioService.toggleMute() };
  return ctx;
};

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => AudioService.muted);

  const toggleMute = useCallback(() => {
    const next = AudioService.toggleMute();
    setIsMuted(next);
    if (!next) AudioService.playTerminalBeep(1100, 0.04);
  }, []);

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
};
