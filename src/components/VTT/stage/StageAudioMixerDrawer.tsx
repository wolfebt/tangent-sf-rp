/**
 * @file StageAudioMixerDrawer.tsx
 * @description Slide-over 3-bus Web Audio Mixer & Tabletop Soundboard Drawer (Music / Ambient / SFX)
 *   with smooth crossfades, preset cues, custom audio file/URL registration, and LiveKit sync broadcast.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Square, Plus, Radio, Upload, X, Sliders, Music } from 'lucide-react';
import {
  proAudioMixerService,
  type AudioBusId,
  type AudioBusState,
  type AudioTrackPreset
} from '../../../services/proAudioMixerService';
import { uploadAdeMediaAsset } from '../../../services/adeMediaStorageService.js';
import { useAuth } from '../../../context/AuthContext';

export interface StageAudioMixerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUS_META: Record<AudioBusId, { label: string; color: string; badge: string }> = {
  music: { label: 'Music Bus', color: 'accent-purple-400', badge: 'text-purple-300 border-purple-500/40 bg-purple-950/60' },
  ambient: { label: 'Ambient Bed', color: 'accent-cyan-400', badge: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60' },
  sfx: { label: 'Sound FX', color: 'accent-amber-400', badge: 'text-amber-300 border-amber-500/40 bg-amber-950/60' }
};

export const StageAudioMixerDrawer: React.FC<StageAudioMixerDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser } = (useAuth() as any) || {};
  const [buses, setBuses] = useState<Record<AudioBusId, AudioBusState>>(() =>
    proAudioMixerService.getAllBusStates()
  );
  const [tracks, setTracks] = useState<AudioTrackPreset[]>(() =>
    proAudioMixerService.getAllTracks()
  );
  const [crossfadeMs, setCrossfadeMs] = useState<number>(() =>
    proAudioMixerService.getCrossfadeMs()
  );
  const [broadcastToOperatives, setBroadcastToOperatives] = useState<boolean>(true);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customBus, setCustomBus] = useState<AudioBusId>('music');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return proAudioMixerService.subscribe(() => {
      setBuses(proAudioMixerService.getAllBusStates());
      setTracks(proAudioMixerService.getAllTracks());
      setCrossfadeMs(proAudioMixerService.getCrossfadeMs());
    });
  }, []);

  if (!isOpen) return null;

  const handleAddExternalTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    const trimmedUrl = customUrl.trim();
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setUploadError('Enter a valid https:// audio URL or upload a local audio file.');
      return;
    }
    const track = proAudioMixerService.registerCustomTrack({
      id: `custom_${Date.now()}`,
      title: customTitle.trim() || 'Custom Tabletop Track',
      bus: customBus,
      url: trimmedUrl,
      loop: customBus !== 'sfx'
    });
    setCustomTitle('');
    setCustomUrl('');
    void proAudioMixerService.playCue(customBus, track.id, broadcastToOperatives);
  };

  const handleUploadAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const res = await uploadAdeMediaAsset(file, {
        userId: currentUser?.uid || null,
        category: 'audio',
        fileName: file.name
      });
      const track = proAudioMixerService.registerCustomTrack({
        id: `upload_${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, ''),
        bus: customBus,
        url: res.url,
        loop: customBus !== 'sfx'
      });
      await proAudioMixerService.playCue(customBus, track.id, broadcastToOperatives);
    } catch (err: any) {
      setUploadError(err?.message || 'Audio upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Pro Audio Mixer & Soundboard"
      className="fixed inset-y-0 right-0 z-[220] w-full max-w-md bg-[#0a0f1d]/98 border-l border-purple-500/40 shadow-[-10px_0_40px_rgba(0,0,0,0.7)] flex flex-col font-mono text-slate-200 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300">
            <Music size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200">
              3-Bus Tabletop Audio Mixer
            </h3>
            <p className="text-[10px] text-slate-400">
              Music, Ambient & SFX Soundboard with LiveKit Sync
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
          aria-label="Close Audio Mixer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Controls Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Sync + Crossfade Top Row */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={broadcastToOperatives}
                onChange={(e) => setBroadcastToOperatives(e.target.checked)}
                className="accent-emerald-400"
              />
              <Radio size={12} className={broadcastToOperatives ? 'text-emerald-400' : 'text-slate-500'} />
              <span>Sync Cues to Connected Operatives</span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders size={11} /> Crossfade ({crossfadeMs}ms)
            </span>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={crossfadeMs}
              onChange={(e) => proAudioMixerService.setCrossfadeMs(Number(e.target.value))}
              className="w-40 accent-purple-400"
            />
          </div>
        </div>

        {/* 3 Independent Bus Strips */}
        <div className="space-y-2.5">
          {(['music', 'ambient', 'sfx'] as AudioBusId[]).map((busId) => {
            const busState = buses[busId];
            const meta = BUS_META[busId];
            return (
              <div key={busId} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${meta.badge}`}>
                    {meta.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {busState.isPlaying ? busState.activeTitle : 'Idle'}
                    </span>
                    <button
                      type="button"
                      onClick={() => proAudioMixerService.toggleBusMute(busId)}
                      className="p-1 rounded bg-slate-950 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                      title={busState.muted ? 'Unmute bus' : 'Mute bus'}
                    >
                      {busState.muted ? <VolumeX size={12} className="text-rose-400" /> : <Volume2 size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => proAudioMixerService.stopBus(busId, broadcastToOperatives)}
                      className="p-1 rounded bg-slate-950 border border-slate-700 text-slate-300 hover:text-rose-300 cursor-pointer"
                      title="Stop bus"
                    >
                      <Square size={11} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-8 text-slate-400">{Math.round(busState.volume * 100)}%</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={busState.volume}
                    aria-label={`${meta.label} Volume`}
                    onChange={(e) => proAudioMixerService.setBusVolume(busId, Number(e.target.value), broadcastToOperatives)}
                    className={`flex-1 ${meta.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Soundboard Trigger Pads */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Soundboard Cues
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {tracks.map((track) => {
              const isActive = buses[track.bus]?.isPlaying && buses[track.bus]?.activeTrackId === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => void proAudioMixerService.playCue(track.bus, track.id, broadcastToOperatives)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-950/70 border-purple-400 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="uppercase text-slate-400">{track.bus}</span>
                    <Play size={10} className={isActive ? 'text-purple-300' : 'text-slate-500'} />
                  </div>
                  <div className="text-[11px] font-bold truncate mt-0.5">{track.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Custom Audio URL / File Upload */}
        <form onSubmit={handleAddExternalTrack} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-cyan-300">
              Add Custom Track or SFX
            </span>
            <select
              value={customBus}
              onChange={(e) => setCustomBus(e.target.value as AudioBusId)}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200"
            >
              <option value="music">Music</option>
              <option value="ambient">Ambient</option>
              <option value="sfx">SFX</option>
            </select>
          </div>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Track Title"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200"
          />
          <div className="flex gap-1.5">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://.../track.mp3 or upload"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-[11px] cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/ogg,audio/wav,audio/webm"
              onChange={handleUploadAudioFile}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload size={11} />
              <span>{isUploading ? 'Uploading Audio...' : 'Upload MP3 / OGG / WAV / WebM (Max 15MB)'}</span>
            </button>
          </div>
          {uploadError && (
            <p className="text-[10px] text-rose-400">{uploadError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default StageAudioMixerDrawer;
