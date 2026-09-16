import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { generateLiveKitToken, getLiveKitServerUrl, isLiveKitConfigured } from '../services/livekitTokenService';
import { AudioService } from '../services/audioService';
import { useAuth } from './AuthContext';
import { useFolio } from './FolioContext';
import { getEffectiveUserHandle } from '../utils/personaValidationUtils';

const VoiceChatContext = createContext(null);

export const useVoiceChat = () => {
  const context = useContext(VoiceChatContext);
  if (!context) {
    throw new Error('useVoiceChat must be used within a VoiceChatProvider');
  }
  return context;
};

export const VoiceChatProvider = ({ children }) => {
  const { currentUser, userHandle } = useAuth();
  const folio = useFolio() || {};
  const { activePersona } = folio;

  const roomRef = useRef(null);
  const audioElementsRef = useRef(new Map()); // trackSid -> HTMLAudioElement

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState(null);
  const [roomDisplayName, setRoomDisplayName] = useState('');
  const [connectionError, setConnectionError] = useState(null);

  // Audio States
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState([]); // string identities
  const [participants, setParticipants] = useState([]); // array of remote participant info

  // Push-To-Talk Configuration
  const [isPushToTalk, setIsPushToTalk] = useState(false);
  const [pttKey, setPttKey] = useState('KeyV'); // Default 'V'
  const [isPttPressed, setIsPttPressed] = useState(false);

  // Refresh participant list from room state
  const syncParticipants = useCallback((room) => {
    if (!room) {
      setParticipants([]);
      return;
    }
    const list = [];
    room.remoteParticipants.forEach((p) => {
      let meta = {};
      try {
        if (p.metadata) meta = JSON.parse(p.metadata);
      } catch (e) {}

      list.push({
        identity: p.identity,
        name: p.name || p.identity,
        isSpeaking: p.isSpeaking,
        isAudioEnabled: p.isMicrophoneEnabled(),
        metadata: meta,
        joinedAt: p.joinedAt
      });
    });
    setParticipants(list);
  }, []);

  // Cleanup all audio elements
  const cleanupAudioElements = useCallback(() => {
    audioElementsRef.current.forEach((el) => {
      try {
        el.pause();
        el.srcObject = null;
        el.remove();
      } catch (e) {}
    });
    audioElementsRef.current.clear();
  }, []);

  // Disconnect from voice room
  const disconnectVoiceRoom = useCallback(() => {
    if (roomRef.current) {
      try {
        AudioService.playTerminalBeep(650, 0.06); // Comms offline chirp
        roomRef.current.disconnect();
      } catch (e) {
        console.warn('[VoiceChat] Error disconnecting:', e);
      }
      roomRef.current = null;
    }
    cleanupAudioElements();
    setIsConnected(false);
    setIsConnecting(false);
    setCurrentRoomName(null);
    setRoomDisplayName('');
    setActiveSpeakers([]);
    setParticipants([]);
    setIsSpeaking(false);
    setIsPttPressed(false);
  }, [cleanupAudioElements]);

  // Connect to a voice room
  const connectToVoiceRoom = useCallback(async (roomName, displayName = '') => {
    if (!roomName) return false;
    if (!isLiveKitConfigured()) {
      const err = 'LiveKit is not configured. Check VITE_LIVEKIT_URL and API keys in .env.';
      setConnectionError(err);
      console.warn('[VoiceChat]', err);
      return false;
    }

    // If already in this room, return true
    if (roomRef.current && isConnected && currentRoomName === roomName) {
      return true;
    }

    // Disconnect from previous room if switching
    if (roomRef.current) {
      disconnectVoiceRoom();
    }

    setIsConnecting(true);
    setConnectionError(null);

    const identity = currentUser?.uid || `anon_${Math.random().toString(36).substring(2, 8)}`;
    const effectiveHandle = userHandle || getEffectiveUserHandle(currentUser) || 'Operative';
    const personaName = activePersona?.['char-name'] || activePersona?.name || effectiveHandle;
    const metadata = {
      handle: effectiveHandle,
      personaName: personaName,
      species: activePersona?.['char-species'] || activePersona?.species || 'Human',
      role: activePersona?.['char-concept'] || activePersona?.role || 'Specialist',
      avatar: activePersona?.avatar || null
    };

    try {
      const token = await generateLiveKitToken({
        roomName,
        identity,
        name: personaName,
        metadata
      });

      const serverUrl = getLiveKitServerUrl();
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Track subscriptions (remote incoming audio)
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.setAttribute('data-participant-identity', participant.identity);
          el.muted = isDeafened;
          document.body.appendChild(el);
          audioElementsRef.current.set(publication.trackSid, el);
          syncParticipants(room);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
        if (track.kind === Track.Kind.Audio) {
          const el = audioElementsRef.current.get(publication.trackSid);
          if (el) {
            track.detach(el);
            el.remove();
            audioElementsRef.current.delete(publication.trackSid);
          }
          syncParticipants(room);
        }
      });

      // Active Speakers updates
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const ids = speakers.map(s => s.identity);
        setActiveSpeakers(ids);
        if (room.localParticipant) {
          setIsSpeaking(ids.includes(room.localParticipant.identity));
        }
        syncParticipants(room);
      });

      // Participant events
      room.on(RoomEvent.ParticipantConnected, () => syncParticipants(room));
      room.on(RoomEvent.ParticipantDisconnected, () => syncParticipants(room));
      room.on(RoomEvent.TrackMuted, () => syncParticipants(room));
      room.on(RoomEvent.TrackUnmuted, () => syncParticipants(room));

      room.on(RoomEvent.Disconnected, () => {
        disconnectVoiceRoom();
      });

      await room.connect(serverUrl, token);

      // Publish local microphone track
      if (!isPushToTalk) {
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
      } else {
        await room.localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      }

      roomRef.current = room;
      setIsConnected(true);
      setIsConnecting(false);
      setCurrentRoomName(roomName);
      setRoomDisplayName(displayName || roomName);
      syncParticipants(room);

      AudioService.playTerminalBeep(1400, 0.05); // Comms online chirp
      return true;
    } catch (err) {
      console.error('[VoiceChat] Failed to connect to room:', err);
      setConnectionError(err.message || 'Failed to connect to voice room');
      setIsConnecting(false);
      disconnectVoiceRoom();
      return false;
    }
  }, [
    currentUser,
    userHandle,
    activePersona,
    isConnected,
    currentRoomName,
    isDeafened,
    isPushToTalk,
    syncParticipants,
    disconnectVoiceRoom
  ]);

  // Toggle Microphone Mute
  const toggleMute = useCallback(async () => {
    if (!roomRef.current || !roomRef.current.localParticipant) return;
    try {
      const nextMuted = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted);
      setIsMuted(nextMuted);
      AudioService.playTerminalBeep(nextMuted ? 850 : 1250, 0.03);
    } catch (err) {
      console.warn('[VoiceChat] Error toggling mic:', err);
    }
  }, [isMuted]);

  // Toggle Deafen (mutes all remote audio elements + mutes mic)
  const toggleDeafen = useCallback(async () => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);

    // Mute/unmute all attached audio elements
    audioElementsRef.current.forEach((el) => {
      el.muted = nextDeafened;
    });

    // If deafening, also mute local mic
    if (nextDeafened && roomRef.current?.localParticipant && !isMuted) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(false);
      setIsMuted(true);
    }

    AudioService.playTerminalBeep(nextDeafened ? 600 : 1100, 0.03);
  }, [isDeafened, isMuted]);

  // Set participant volume
  const setParticipantVolume = useCallback((trackSid, volume) => {
    const el = audioElementsRef.current.get(trackSid);
    if (el) {
      el.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Push-To-Talk Keyboard Handlers
  useEffect(() => {
    if (!isConnected || !isPushToTalk || !roomRef.current?.localParticipant) return;

    const handleKeyDown = async (e) => {
      if (e.code === pttKey && !isPttPressed && !e.repeat) {
        // If typing inside an input or textarea, ignore unless explicitly configured
        const targetTag = e.target?.tagName?.toLowerCase();
        if (targetTag === 'input' || targetTag === 'textarea' || e.target?.isContentEditable) {
          return;
        }

        setIsPttPressed(true);
        try {
          await roomRef.current.localParticipant.setMicrophoneEnabled(true);
          setIsMuted(false);
          AudioService.playTerminalBeep(1550, 0.02); // Squelch in
        } catch (err) {}
      }
    };

    const handleKeyUp = async (e) => {
      if (e.code === pttKey && isPttPressed) {
        setIsPttPressed(false);
        try {
          await roomRef.current.localParticipant.setMicrophoneEnabled(false);
          setIsMuted(true);
          AudioService.playTerminalBeep(950, 0.02); // Squelch out
        } catch (err) {}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isConnected, isPushToTalk, pttKey, isPttPressed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      cleanupAudioElements();
    };
  }, [cleanupAudioElements]);

  const value = {
    isConnected,
    isConnecting,
    currentRoomName,
    roomDisplayName,
    connectionError,
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
    connectToVoiceRoom,
    disconnectVoiceRoom,
    toggleMute,
    toggleDeafen,
    setParticipantVolume,
    isConfigured: isLiveKitConfigured()
  };

  return (
    <VoiceChatContext.Provider value={value}>
      {children}
    </VoiceChatContext.Provider>
  );
};

export default VoiceChatContext;
