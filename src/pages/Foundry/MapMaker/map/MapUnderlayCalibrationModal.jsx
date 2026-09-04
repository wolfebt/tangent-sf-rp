/**
 * @file MapUnderlayCalibrationModal.jsx
 * @description Background Blueprint & Underlay Calibration Modal for Map Maker and The Stage.
 * Enables Game Masters and Cartographers to upload external floorplans, concept blueprints,
 * or hand-drawn dungeon sketches, adjusting opacity, scale, and grid offset for precision tracing.
 */

import React, { useState } from 'react';
import { Image, Sliders, Upload, Eye, X, RefreshCw, Check, Move } from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export const MapUnderlayCalibrationModal = ({
  isOpen,
  onClose,
  currentUnderlay,
  onApplyUnderlay,
  onClearUnderlay
}) => {
  const [imageUrl, setImageUrl] = useState(currentUnderlay?.url || '');
  const [opacity, setOpacity] = useState(currentUnderlay?.opacity ?? 0.45);
  const [scale, setScale] = useState(currentUnderlay?.scale ?? 1.0);
  const [offsetX, setOffsetX] = useState(currentUnderlay?.offsetX ?? 0);
  const [offsetY, setOffsetY] = useState(currentUnderlay?.offsetY ?? 0);
  const [visible, setVisible] = useState(currentUnderlay?.visible ?? true);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
      AudioService.playCriticalChime(true);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    onApplyUnderlay({
      url: imageUrl,
      opacity,
      scale,
      offsetX,
      offsetY,
      visible
    });
    AudioService.playCriticalChime(true);
    onClose();
  };

  const handleReset = () => {
    setOpacity(0.45);
    setScale(1.0);
    setOffsetX(0);
    setOffsetY(0);
    setVisible(true);
    AudioService.playTerminalBeep(1000, 0.03);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 bg-slate-950 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Image size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Blueprint Underlay Calibration
              </h3>
              <p className="text-[10px] text-slate-400">
                Trace concept blueprints and architectural schematics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-200">
          {/* File Upload / URL Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-cyan-300 uppercase block">
              Blueprint Image Source:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl.startsWith('data:') ? '[Local Data Image Loaded]' : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste Image URL or select file..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <label className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors text-[11px] shrink-0">
                <Upload size={14} />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Live Preview Thumbnail */}
          {imageUrl && (
            <div className="h-28 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-2">
              <img
                src={imageUrl}
                alt="Underlay Preview"
                className="max-h-full max-w-full object-contain rounded"
                style={{ opacity }}
              />
              <span className="absolute bottom-1 right-2 text-[9px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
                Opacity: {Math.round(opacity * 100)}% • Scale: {scale.toFixed(2)}x
              </span>
            </div>
          )}

          {/* Opacity Slider */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Eye size={13} className="text-cyan-400" /> Layer Opacity:
              </span>
              <span className="text-cyan-300 font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Scale Slider */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sliders size={13} className="text-amber-400" /> Scale Calibration:
              </span>
              <span className="text-amber-300 font-bold">{scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="3.0"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Offset Nudge Controls */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Move size={13} className="text-emerald-400" /> Grid Alignment Offset:
              </span>
              <span className="text-emerald-300 font-bold">X: {offsetX}px, Y: {offsetY}px</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">X:</span>
                <input
                  type="number"
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div className="flex-1 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">Y:</span>
                <input
                  type="number"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
            {imageUrl && (
              <button
                onClick={() => {
                  setImageUrl('');
                  if (onClearUnderlay) onClearUnderlay();
                  AudioService.playTerminalBeep(900, 0.03);
                }}
                className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Underlay
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!imageUrl}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                imageUrl
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check size={14} />
              <span>Apply to Stage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapUnderlayCalibrationModal;
