import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Shield,
  Check,
  AlertCircle,
  Crop,
  Layers,
  FileImage,
  Loader2
} from 'lucide-react';
import {
  FOLIO_IMAGE_SLOTS,
  processFolioImage,
  createCircularTokenPog,
  isWebPSupported
} from '../../../services/imageOptimizationService';
import { AudioService } from '../../../services/audioService';

export default function FolioImageCropModal({
  isOpen,
  onClose,
  initialSlot = 'portrait',
  onSave,
  characterName = 'Character'
}) {
  const [selectedSlot, setSelectedSlot] = useState(initialSlot);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Transform states for pan and zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Token specific options
  const [asCircularToken, setAsCircularToken] = useState(initialSlot === 'token');
  const [tokenBorderColor, setTokenBorderColor] = useState('#00f0ff');

  // Preview metrics
  const [estimatedSize, setEstimatedSize] = useState(null);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentSlotConfig = FOLIO_IMAGE_SLOTS[selectedSlot] || FOLIO_IMAGE_SLOTS.portrait;

  useEffect(() => {
    setSelectedSlot(initialSlot);
    setAsCircularToken(initialSlot === 'token');
  }, [initialSlot, isOpen]);

  // Reset transforms when new image is loaded
  const resetTransform = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setImageSrc(src);
      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        resetTransform();
        try {
          AudioService.play?.('click');
        } catch {}
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Redraw interactive canvas preview
  useEffect(() => {
    if (!imageElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark sci-fi backdrop grid
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Compute aspect ratio framing
    const targetAspect = currentSlotConfig.aspectRatio;
    let frameW = width - 40;
    let frameH = frameW / targetAspect;

    if (frameH > height - 40) {
      frameH = height - 40;
      frameW = frameH * targetAspect;
    }

    const frameX = (width - frameW) / 2;
    const frameY = (height - frameH) / 2;

    // Draw source image transformed inside clip or viewport
    ctx.save();

    // Clip to viewfinder frame (or circle if circular token mode)
    ctx.beginPath();
    if (asCircularToken) {
      const tokenRadius = Math.min(frameW, frameH) / 2;
      ctx.arc(frameX + frameW / 2, frameY + frameH / 2, tokenRadius, 0, Math.PI * 2);
    } else {
      ctx.rect(frameX, frameY, frameW, frameH);
    }
    ctx.clip();

    // Image drawing with zoom and pan
    const imgAspect = imageElement.width / imageElement.height;
    let drawW, drawH;
    if (imgAspect > targetAspect) {
      drawH = frameH * zoom;
      drawW = drawH * imgAspect;
    } else {
      drawW = frameW * zoom;
      drawH = drawW / imgAspect;
    }

    const drawX = frameX + (frameW - drawW) / 2 + pan.x;
    const drawY = frameY + (frameH - drawH) / 2 + pan.y;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageElement, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Draw Viewfinder Overlay
    ctx.save();
    if (asCircularToken) {
      const tokenRadius = Math.min(frameW, frameH) / 2;
      const centerX = frameX + frameW / 2;
      const centerY = frameY + frameH / 2;

      // Outer darkened vignette
      ctx.fillStyle = 'rgba(2, 6, 12, 0.75)';
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.arc(centerX, centerY, tokenRadius, 0, Math.PI * 2, true);
      ctx.fill();

      // Glowing tactical ring
      ctx.strokeStyle = tokenBorderColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = tokenBorderColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, tokenRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Cardinal ticks
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach(angle => {
        const x1 = centerX + Math.cos(angle) * (tokenRadius - 6);
        const y1 = centerY + Math.sin(angle) * (tokenRadius - 6);
        const x2 = centerX + Math.cos(angle) * (tokenRadius + 6);
        const y2 = centerY + Math.sin(angle) * (tokenRadius + 6);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    } else {
      // Standard rectangular crop frame with corner accents
      ctx.fillStyle = 'rgba(2, 6, 12, 0.75)';
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.rect(frameX, frameY, frameW, frameH);
      ctx.fill('evenodd');

      // Reticle frame border
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(frameX, frameY, frameW, frameH);

      // Sci-fi corner brackets
      const cornerLen = 14;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(frameX, frameY + cornerLen);
      ctx.lineTo(frameX, frameY);
      ctx.lineTo(frameX + cornerLen, frameY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(frameX + frameW - cornerLen, frameY);
      ctx.lineTo(frameX + frameW, frameY);
      ctx.lineTo(frameX + frameW, frameY + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(frameX, frameY + frameH - cornerLen);
      ctx.lineTo(frameX, frameY + frameH);
      ctx.lineTo(frameX + cornerLen, frameY + frameH);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(frameX + frameW - cornerLen, frameY + frameH);
      ctx.lineTo(frameX + frameW, frameY + frameH);
      ctx.lineTo(frameX + frameW, frameY + frameH - cornerLen);
      ctx.stroke();
    }
    ctx.restore();

    // Approximate size estimate based on target bounds & slot quality
    const pixelCount = currentSlotConfig.maxWidth * currentSlotConfig.maxHeight;
    const estKB = Math.round((pixelCount * 0.12 * currentSlotConfig.quality) / 1024);
    setEstimatedSize(estKB);
  }, [imageElement, zoom, pan, selectedSlot, asCircularToken, tokenBorderColor, currentSlotConfig]);

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (!imageElement) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e) => {
    if (!imageElement) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(z => Math.max(0.6, Math.min(3.5, z + delta)));
  };

  // Final generation & save
  const handleGenerateAndSave = async () => {
    if (!imageElement) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let finalResult;

      if (asCircularToken && selectedSlot === 'token') {
        finalResult = await createCircularTokenPog(imageSrc, {
          size: 512,
          borderColor: tokenBorderColor,
          borderWidth: 16
        });
      } else {
        // Calculate crop bounds from canvas transform (zoom & pan)
        const canvas = canvasRef.current;
        const width = canvas ? canvas.width : 480;
        const height = canvas ? canvas.height : 480;
        const targetAspect = currentSlotConfig.aspectRatio;
        let frameW = width - 40;
        let frameH = frameW / targetAspect;
        if (frameH > height - 40) {
          frameH = height - 40;
          frameW = frameH * targetAspect;
        }
        const frameX = (width - frameW) / 2;
        const frameY = (height - frameH) / 2;
        const imgAspect = imageElement.width / imageElement.height;
        let drawW, drawH;
        if (imgAspect > targetAspect) {
          drawH = frameH * zoom;
          drawW = drawH * imgAspect;
        } else {
          drawW = frameW * zoom;
          drawH = drawW / imgAspect;
        }
        const drawX = frameX + (frameW - drawW) / 2 + pan.x;
        const drawY = frameY + (frameH - drawH) / 2 + pan.y;
        const scaleX = imageElement.width / Math.max(1, drawW);
        const scaleY = imageElement.height / Math.max(1, drawH);
        const cropBounds = {
          x: Math.max(0, Math.round((frameX - drawX) * scaleX)),
          y: Math.max(0, Math.round((frameY - drawY) * scaleY)),
          width: Math.min(imageElement.width, Math.max(1, Math.round(frameW * scaleX))),
          height: Math.min(imageElement.height, Math.max(1, Math.round(frameH * scaleY)))
        };

        finalResult = await processFolioImage(imageSrc, selectedSlot, cropBounds, {
          quality: currentSlotConfig.quality
        });
      }

      try {
        AudioService.play?.('success');
      } catch {}

      if (onSave) {
        await onSave({
          ...finalResult,
          slotType: selectedSlot
        });
      }

      onClose();
    } catch (err) {
      console.error('[FolioCropModal] Error processing image:', err);
      setErrorMsg(err.message || 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      tabIndex={-1}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-950/70 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Folio Image Studio
                <span className="text-xs font-mono font-normal text-cyan-400/90 px-2 py-0.5 bg-cyan-950/60 border border-cyan-800/40 rounded">
                  {characterName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Client-optimized WebP encoding with zero cloud latency.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slot Selector Pills */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Slot:
          </span>
          {Object.entries(FOLIO_IMAGE_SLOTS).map(([key, config]) => {
            const isSelected = selectedSlot === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedSlot(key);
                  if (key === 'token') setAsCircularToken(true);
                  resetTransform();
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 font-bold shadow-sm shadow-cyan-950'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {config.name}
              </button>
            );
          })}
        </div>

        {/* Modal Body / Canvas Viewfinder */}
        <div className="flex-1 p-5 flex flex-col items-center justify-center overflow-hidden bg-slate-950/50 min-h-[340px]">
          {errorMsg && (
            <div className="w-full mb-3 p-2.5 bg-red-950/70 border border-red-500/50 rounded text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!imageSrc ? (
            /* Upload Dropzone */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                isDraggingFile
                  ? 'border-cyan-400 bg-cyan-950/30 text-cyan-200'
                  : 'border-slate-700 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/70 text-slate-300'
              }`}
            >
              <div className="p-3 bg-cyan-950/60 border border-cyan-500/30 rounded-full mb-3 text-cyan-400">
                <Upload className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="font-bold text-sm text-slate-100 mb-1">
                Drop image here or click to browse
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-3">
                {currentSlotConfig.recommendedDesc}
              </p>
              <div className="text-[11px] font-mono text-cyan-400/80 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800">
                Supports PNG, JPEG, WebP, HEIC &bull; Auto-scaled &bull; EXIF stripped
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            /* Canvas Viewfinder with Controls */
            <div className="w-full flex flex-col items-center">
              <div
                className="relative rounded-lg overflow-hidden border border-slate-700 shadow-inner bg-black cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={340}
                  className="block max-w-full"
                />

                {/* Tactical HUD overlays inside canvas */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur border border-slate-700/80 rounded text-[10px] font-mono text-cyan-400">
                  {currentSlotConfig.maxWidth}×{currentSlotConfig.maxHeight} ({currentSlotConfig.name})
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 rounded transition-colors"
                  >
                    Change Source
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
              </div>

              {/* Viewfinder Toolbar */}
              <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.6"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-24 accent-cyan-400 h-1.5 bg-slate-800 rounded appearance-none"
                  />
                  <button
                    onClick={() => setZoom(z => Math.min(3.0, z + 0.15))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetTransform}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded ml-1"
                    title="Reset Position"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Token Circular Toggle */}
                {selectedSlot === 'token' && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300">
                    <input
                      type="checkbox"
                      checked={asCircularToken}
                      onChange={(e) => setAsCircularToken(e.target.checked)}
                      className="accent-cyan-400 rounded"
                    />
                    <span>Circular Tactical Pog</span>
                  </label>
                )}

                {/* Compression Telemetry Badge */}
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-400">Est. Payload:</span>
                  <span className="text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-950/70 border border-emerald-500/40 rounded">
                    ~{estimatedSize || 75} KB (WebP)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/90">
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400/80" />
            <span>Target WebP &bull; 0.82 Quality &bull; Strips EXIF</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateAndSave}
              disabled={!imageElement || isProcessing}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-lg flex items-center gap-2 transition-all ${
                !imageElement || isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Optimizing & Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Save to Folio
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
