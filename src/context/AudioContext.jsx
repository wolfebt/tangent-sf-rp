import React, { createContext, useContext, useState, useCallback } from 'react';
import { AudioService } from '../services/audioService';

const AudioContext = createContext(null);

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>');
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
