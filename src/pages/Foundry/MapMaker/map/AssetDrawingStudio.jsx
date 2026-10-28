import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useConfirm } from '../../../../context/ConfirmContext';
import {
  HIFI_CHROMA_TILE_PRESETS,
  TILE_FAMILY_METADATA,
  synthesizeTileDataUrl,
  generateAutoTileVariants4Bit
} from '../../../../engine/assets/MicroTileSynthesizer';
import { synthesizeTileRecipeFromPrompt } from '../../../../services/tileAiRecipeService';

const PRESET_PALETTES = {
  'Cyber & Neon': [
    '#22d3ee', '#38bdf8', '#06b6d4', '#3b82f6', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#10b981',
    '#14b8a6', '#facc15', '#fb923c', '#ffffff', '#000000'
  ],
  'Planetary Biomes': [
    '#15803d', '#16a34a', '#22c55e', '#84cc16', '#eab308',
    '#d97706', '#b45309', '#78350f', '#0284c7', '#0369a1',
    '#1e293b', '#475569', '#cbd5e1', '#f8fafc', '#713f12'
  ],
  'Sci-Fi Hull & Metal': [
    '#0f172a', '#1e293b', '#334155', '#475569', '#64748b',
    '#94a3b8', '#cbd5e1', '#e2e8f0', '#38bdf8', '#0284c7',
    '#0f766e', '#14b8a6', '#f59e0b', '#dc2626', '#1e1b4b'
  ],
  'Hazards & Deep Space': [
    '#050505', '#090d16', '#172554', '#312e81', '#581c87',
    '#701a75', '#831843', '#7f1d1d', '#ef4444', '#f97316',
    '#facc15', '#22c55e', '#06b6d4', '#a855f7', '#ffffff'
  ]
};

// Helper: Parse color string to RGBA [r, g, b, a]
function parseColorToRgba(colorStr, opacityPercent = 100) {
  if (colorStr === 'transparent') return [0, 0, 0, 0];
  const alpha = Math.round((opacityPercent / 100) * 255);
  
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return [r, g, b, alpha];
    }
  }
  
  // Fallback via dummy element
  try {
    const dummy = document.createElement('div');
    dummy.style.color = colorStr;
    document.body.appendChild(dummy);
    const cs = window.getComputedStyle(dummy).color;
    document.body.removeChild(dummy);
    const m = cs.match(/\d+/g);
    if (m && m.length >= 3) {
      return [parseInt(m[0], 10), parseInt(m[1], 10), parseInt(m[2], 10), alpha];
    }
  } catch (e) {}

  return [34, 211, 238, alpha]; // Default cyan
}

// Helper: RGB to Hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * @param {object} props
 * @param {string} [props.initialImage]
 * @param {(dataUrl: string) => void} [props.onChange]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {string} [props.label]
 * @param {string} [props.assetType]
 * @param {(dataUrl: string) => void} [props.onSaveToAsset]
 * @param {(recipe: any, dataUrl?: string) => void} [props.onSynthesizeRecipe]
 */
export default function AssetDrawingStudio({
  initialImage = '',
  onChange,
  width = 256,
  height = 256,
  label = 'Asset Image Canvas & Studio',
  assetType = 'terrain', // 'terrain' | 'object'
  onSaveToAsset,
  onSynthesizeRecipe
}) {
  const confirm = useConfirm();
  const mainCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Active Tool: 'pencil' | 'brush' | 'spray' | 'eraser' | 'fill' | 'picker' | 'line' | 'arrow' | 'rect' | 'circle' | 'hexagon' | 'star' | 'triangle'
  const [activeTool, setActiveTool] = useState('brush');
  const [brushProfile, setBrushProfile] = useState('round'); // 'round' | 'soft' | 'square' | 'glow'
  const [color, setColor] = useState('#22d3ee');
  const [brushSize, setBrushSize] = useState(16);
  const [opacity, setOpacity] = useState(100);
  const [isShapeFilled, setIsShapeFilled] = useState(true);
  const [activePalette, setActivePalette] = useState('Cyber & Neon');

  // Canvas View & Resolution
  const [canvasResolution, setCanvasResolution] = useState(width || 256);
  const [bgMode, setBgMode] = useState('transparent'); // 'transparent' | 'dark' | 'grid' | 'light'
  const [showTilingPreview, setShowTilingPreview] = useState(assetType === 'terrain');

  // Image Adjustment Sliders
  const [brightness, setBrightness] = useState(0); // -100 to 100
  const [contrast, setContrast] = useState(0); // -100 to 100
  const [hue, setHue] = useState(0); // -180 to 180
  const [saturation, setSaturation] = useState(100); // 0 to 200

  // Drawing Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // History for Undo / Redo
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Active procedural generator modal/panel (HIFI CHROMA Micro-Tile Synthesizer)
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [synthRecipe, setSynthRecipe] = useState(() =>
    assetType === 'object'
      ? HIFI_CHROMA_TILE_PRESETS.find((p) => p.outputMode === 'decal_overlay') || HIFI_CHROMA_TILE_PRESETS[0]
      : HIFI_CHROMA_TILE_PRESETS[0]
  );
  const [synthPrompt, setSynthPrompt] = useState('');
  const [isAiSynthLoading, setIsAiSynthLoading] = useState(false);
  const [synthSourceBadge, setSynthSourceBadge] = useState('');
  const [synthFamilyFilter, setSynthFamilyFilter] = useState('all');

  const synthPreviewDataUrl = useMemo(() => {
    if (!showGeneratorModal) return '';
    return synthesizeTileDataUrl({ ...synthRecipe, resolution: 128 });
  }, [showGeneratorModal, synthRecipe]);

  // Keep track of loaded image ID to prevent re-load loops on local changes
  const loadedImageRef = useRef(null);

  // Save current canvas state to history stack
  const saveToHistory = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory(prev => {
      const nextHistory = prev.slice(0, historyStep + 1);
      if (nextHistory.length > 25) nextHistory.shift(); // Limit history stack to 25
      return [...nextHistory, imageData];
    });
    setHistoryStep(prev => Math.min(prev + 1, 24));

    if (onChange) {
      onChange(canvas.toDataURL('image/png'));
    }
  }, [historyStep, onChange]);

  // Load initial image upon mount or if external asset changes
  useEffect(() => {
    if (initialImage && initialImage !== loadedImageRef.current) {
      loadedImageRef.current = initialImage;
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      canvas.width = canvasResolution;
      canvas.height = canvasResolution;

      const img = new Image();
      if (typeof initialImage === 'string' && !initialImage.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.onerror = () => {
        console.warn('AssetDrawingStudio: Failed to load initial image, initializing clear canvas');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = initialImage;
    } else if (!initialImage && loadedImageRef.current !== 'blank') {
      loadedImageRef.current = 'blank';
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = canvasResolution;
      canvas.height = canvasResolution;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, [initialImage, canvasResolution, saveToHistory]);

  // Undo / Redo
  const handleUndo = () => {
    if (historyStep <= 0) return;
    const newStep = historyStep - 1;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
    if (onChange) onChange(canvas.toDataURL('image/png'));
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const newStep = historyStep + 1;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
    if (onChange) onChange(canvas.toDataURL('image/png'));
  };

  // Get coords relative to main canvas
  const getCanvasCoords = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY)
    };
  };

  // Clear Canvas
  const handleClearCanvas = async () => {
    const ok = await confirm({
      title: 'Clear Canvas',
      message: 'Clear canvas? You can undo this action.',
      danger: true,
      confirmLabel: 'Clear'
    });
    if (ok) {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  };

  // Import local image file onto canvas
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Export canvas as PNG
  const handleExportPNG = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Eyedropper Color Pick
  const pickColorFromCanvas = (x, y) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 0) {
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setColor(hex);
    }
  };

  // Flood Fill Algorithm
  const performFloodFill = (startX, startY) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const [fillR, fillG, fillB, fillA] = parseColorToRgba(color, opacity);

    const startIdx = (startY * canvas.width + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];

    // If already the target color, return
    if (
      Math.abs(targetR - fillR) < 5 &&
      Math.abs(targetG - fillG) < 5 &&
      Math.abs(targetB - fillB) < 5 &&
      Math.abs(targetA - fillA) < 5
    ) {
      return;
    }

    const tolerance = 32;
    const stack = [[startX, startY]];
    const visited = new Uint8Array(canvas.width * canvas.height);

    while (stack.length > 0) {
      const [cx, cy] = stack.pop();
      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
      const idx = cy * canvas.width + cx;
      if (visited[idx]) continue;
      visited[idx] = 1;

      const pIdx = idx * 4;
      const rDiff = Math.abs(data[pIdx] - targetR);
      const gDiff = Math.abs(data[pIdx + 1] - targetG);
      const bDiff = Math.abs(data[pIdx + 2] - targetB);
      const aDiff = Math.abs(data[pIdx + 3] - targetA);

      if (rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance && aDiff <= tolerance) {
        data[pIdx] = fillR;
        data[pIdx + 1] = fillG;
        data[pIdx + 2] = fillB;
        data[pIdx + 3] = fillA;

        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    saveToHistory();
  };

  // Airbrush / Spray effect
  const drawSprayParticles = (ctx, cx, cy) => {
    const density = Math.max(10, Math.floor(brushSize * 1.5));
    const [r, g, b, a] = parseColorToRgba(color, opacity);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (brushSize / 2);
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      const pSize = Math.random() * 2 + 0.5;
      ctx.fillRect(px, py, pSize, pSize);
    }
  };

  // Helper: Draw geometric regular polygon
  const drawPolygonPath = (ctx, cx, cy, radius, sides, rotation = 0) => {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides + rotation;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  // Helper: Draw star path
  const drawStarPath = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  // Pointer Handlers
  const handlePointerDown = (e) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);
    setLastPos(coords);

    if (activeTool === 'picker') {
      pickColorFromCanvas(coords.x, coords.y);
      setIsDrawing(false);
      return;
    }

    if (activeTool === 'fill') {
      performFloodFill(coords.x, coords.y);
      setIsDrawing(false);
      return;
    }

    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.save();
    const [r, g, b, a] = parseColorToRgba(color, opacity);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      if (brushProfile === 'square') {
        ctx.fillRect(coords.x - brushSize / 2, coords.y - brushSize / 2, brushSize, brushSize);
      } else {
        ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (activeTool === 'spray') {
      drawSprayParticles(ctx, coords.x, coords.y);
    } else if (activeTool === 'pencil' || activeTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      ctx.lineCap = brushProfile === 'square' ? 'square' : 'round';
      ctx.lineJoin = 'round';

      if (brushProfile === 'glow') {
        ctx.shadowColor = color;
        ctx.shadowBlur = Math.min(brushSize, 20);
      }

      const effectiveWidth = activeTool === 'pencil' ? Math.max(1, Math.floor(brushSize / 4)) : brushSize;
      ctx.lineWidth = effectiveWidth;

      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Geometric Shape Preview Mode
    if (['line', 'arrow', 'rect', 'circle', 'hexagon', 'star', 'triangle'].includes(activeTool)) {
      const pCanvas = previewCanvasRef.current;
      if (!pCanvas) return;
      pCanvas.width = canvas.width;
      pCanvas.height = canvas.height;
      const pctx = pCanvas.getContext('2d');
      pctx.clearRect(0, 0, pCanvas.width, pCanvas.height);

      pctx.save();
      const [r, g, b, a] = parseColorToRgba(color, opacity);
      pctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      pctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      pctx.lineWidth = brushSize;
      pctx.lineCap = 'round';
      pctx.lineJoin = 'round';

      if (brushProfile === 'glow') {
        pctx.shadowColor = color;
        pctx.shadowBlur = Math.min(brushSize, 15);
      }

      const dx = coords.x - startPos.x;
      const dy = coords.y - startPos.y;
      const radius = Math.sqrt(dx * dx + dy * dy);

      if (activeTool === 'line') {
        pctx.beginPath();
        pctx.moveTo(startPos.x, startPos.y);
        pctx.lineTo(coords.x, coords.y);
        pctx.stroke();
      } else if (activeTool === 'arrow') {
        pctx.beginPath();
        pctx.moveTo(startPos.x, startPos.y);
        pctx.lineTo(coords.x, coords.y);
        pctx.stroke();

        // Arrow head
        const angle = Math.atan2(dy, dx);
        const headLen = Math.max(12, brushSize * 2);
        pctx.beginPath();
        pctx.moveTo(coords.x, coords.y);
        pctx.lineTo(coords.x - headLen * Math.cos(angle - Math.PI / 6), coords.y - headLen * Math.sin(angle - Math.PI / 6));
        pctx.lineTo(coords.x - headLen * Math.cos(angle + Math.PI / 6), coords.y - headLen * Math.sin(angle + Math.PI / 6));
        pctx.closePath();
        pctx.fill();
      } else if (activeTool === 'rect') {
        if (isShapeFilled) {
          pctx.fillRect(startPos.x, startPos.y, dx, dy);
        } else {
          pctx.strokeRect(startPos.x, startPos.y, dx, dy);
        }
      } else if (activeTool === 'circle') {
        pctx.beginPath();
        pctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        if (isShapeFilled) pctx.fill();
        else pctx.stroke();
      } else if (activeTool === 'hexagon') {
        drawPolygonPath(pctx, startPos.x, startPos.y, radius, 6, Math.PI / 6);
        if (isShapeFilled) pctx.fill();
        else pctx.stroke();
      } else if (activeTool === 'triangle') {
        drawPolygonPath(pctx, startPos.x, startPos.y, radius, 3, -Math.PI / 2);
        if (isShapeFilled) pctx.fill();
        else pctx.stroke();
      } else if (activeTool === 'star') {
        drawStarPath(pctx, startPos.x, startPos.y, 5, radius, radius * 0.45);
        if (isShapeFilled) pctx.fill();
        else pctx.stroke();
      }
      pctx.restore();
      return;
    }

    ctx.save();
    const [r, g, b, a] = parseColorToRgba(color, opacity);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.lineCap = brushProfile === 'square' ? 'square' : 'round';
      ctx.lineWidth = brushSize;
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (activeTool === 'spray') {
      drawSprayParticles(ctx, coords.x, coords.y);
    } else if (activeTool === 'pencil' || activeTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      ctx.lineCap = brushProfile === 'square' ? 'square' : 'round';
      ctx.lineJoin = 'round';

      if (brushProfile === 'glow') {
        ctx.shadowColor = color;
        ctx.shadowBlur = Math.min(brushSize, 20);
      }

      const effectiveWidth = activeTool === 'pencil' ? Math.max(1, Math.floor(brushSize / 4)) : brushSize;
      ctx.lineWidth = effectiveWidth;

      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
    ctx.restore();
    setLastPos(coords);
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (['line', 'arrow', 'rect', 'circle', 'hexagon', 'star', 'triangle'].includes(activeTool)) {
      const coords = getCanvasCoords(e);
      const pCanvas = previewCanvasRef.current;
      if (pCanvas) {
        const pctx = pCanvas.getContext('2d');
        pctx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      }

      ctx.save();
      const [r, g, b, a] = parseColorToRgba(color, opacity);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (brushProfile === 'glow') {
        ctx.shadowColor = color;
        ctx.shadowBlur = Math.min(brushSize, 15);
      }

      const dx = coords.x - startPos.x;
      const dy = coords.y - startPos.y;
      const radius = Math.sqrt(dx * dx + dy * dy);

      if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();

        const angle = Math.atan2(dy, dx);
        const headLen = Math.max(12, brushSize * 2);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(coords.x - headLen * Math.cos(angle - Math.PI / 6), coords.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(coords.x - headLen * Math.cos(angle + Math.PI / 6), coords.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (activeTool === 'rect') {
        if (isShapeFilled) ctx.fillRect(startPos.x, startPos.y, dx, dy);
        else ctx.strokeRect(startPos.x, startPos.y, dx, dy);
      } else if (activeTool === 'circle') {
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        if (isShapeFilled) ctx.fill();
        else ctx.stroke();
      } else if (activeTool === 'hexagon') {
        drawPolygonPath(ctx, startPos.x, startPos.y, radius, 6, Math.PI / 6);
        if (isShapeFilled) ctx.fill();
        else ctx.stroke();
      } else if (activeTool === 'triangle') {
        drawPolygonPath(ctx, startPos.x, startPos.y, radius, 3, -Math.PI / 2);
        if (isShapeFilled) ctx.fill();
        else ctx.stroke();
      } else if (activeTool === 'star') {
        drawStarPath(ctx, startPos.x, startPos.y, 5, radius, radius * 0.45);
        if (isShapeFilled) ctx.fill();
        else ctx.stroke();
      }
      ctx.restore();
    }

    saveToHistory();
  };

  // Image Transformations
  const handleRotate = (angleDeg) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tctx = tempCanvas.getContext('2d');
    tctx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();
    saveToHistory();
  };

  const handleFlip = (horizontal = true) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tctx = tempCanvas.getContext('2d');
    tctx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (horizontal) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
    saveToHistory();
  };

  const handleInvertColors = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
    }
    ctx.putImageData(imgData, 0, 0);
    saveToHistory();
  };

  // Adjustments: Brightness, Contrast, Hue, Saturation
  const applyImageAdjustments = (bVal, cVal, hVal, sVal) => {
    setBrightness(bVal);
    setContrast(cVal);
    setHue(hVal);
    setSaturation(sVal);

    if (historyStep < 0 || !history[historyStep]) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const baseData = history[historyStep];
    const newImgData = ctx.createImageData(baseData.width, baseData.height);
    const src = baseData.data;
    const dst = newImgData.data;

    const bFactor = (bVal / 100) * 128;
    const cFactor = (259 * (cVal + 255)) / (255 * (259 - cVal));
    const sFactor = sVal / 100;
    const hRad = (hVal * Math.PI) / 180;
    const cosH = Math.cos(hRad);
    const sinH = Math.sin(hRad);

    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] === 0) continue;

      let r = src[i];
      let g = src[i + 1];
      let b = src[i + 2];

      // Brightness & Contrast
      r = cFactor * (r + bFactor - 128) + 128;
      g = cFactor * (g + bFactor - 128) + 128;
      b = cFactor * (b + bFactor - 128) + 128;

      // Saturation
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;

      // Hue Shift
      if (hVal !== 0) {
        const nr = (0.213 + cosH * 0.787 - sinH * 0.213) * r + (0.715 - cosH * 0.715 - sinH * 0.715) * g + (0.072 - cosH * 0.072 + sinH * 0.928) * b;
        const ng = (0.213 - cosH * 0.213 + sinH * 0.143) * r + (0.715 + cosH * 0.285 + sinH * 0.140) * g + (0.072 - cosH * 0.072 - sinH * 0.283) * b;
        const nb = (0.213 - cosH * 0.213 - sinH * 0.787) * r + (0.715 - cosH * 0.715 + sinH * 0.715) * g + (0.072 + cosH * 0.928 + sinH * 0.072) * b;
        r = nr;
        g = ng;
        b = nb;
      }

      dst[i] = Math.min(255, Math.max(0, r));
      dst[i + 1] = Math.min(255, Math.max(0, g));
      dst[i + 2] = Math.min(255, Math.max(0, b));
      dst[i + 3] = src[i + 3];
    }
    ctx.putImageData(newImgData, 0, 0);
    if (onChange) onChange(canvas.toDataURL('image/png'));
  };

  // HIFI CHROMA Micro-Tile Synthesizer Handlers
  const handleAiSynthPrompt = async () => {
    if (!synthPrompt.trim()) return;
    setIsAiSynthLoading(true);
    try {
      const { recipe, source } = await synthesizeTileRecipeFromPrompt(synthPrompt, synthRecipe);
      setSynthRecipe(recipe);
      setSynthSourceBadge(source === 'gemini_flash' ? '⚡ Gemini Flash Recipe' : '🧠 Semantic Engine');
    } finally {
      setIsAiSynthLoading(false);
    }
  };

  const applySynthesizedTileToCanvas = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;

    if (synthRecipe.outputMode === 'marching_squares_4bit') {
      // Render all 16 4-bit Marching Squares variants as a 4x4 atlas sheet onto the canvas
      const cellPx = 64;
      const variants = generateAutoTileVariants4Bit(synthRecipe, cellPx);
      let loadedCount = 0;
      ctx.clearRect(0, 0, w, h);
      const subW = w / 4;
      const subH = h / 4;

      variants.forEach((vUrl, idx) => {
        const img = new Image();
        img.onload = () => {
          const col = idx % 4;
          const row = Math.floor(idx / 4);
          ctx.drawImage(img, col * subW, row * subH, subW, subH);
          loadedCount += 1;
          if (loadedCount === 16) {
            saveToHistory();
            const finalDataUrl = canvas.toDataURL('image/png');
            if (onSynthesizeRecipe) {
              onSynthesizeRecipe(synthRecipe, finalDataUrl);
            }
          }
        };
        img.src = vUrl;
      });
      setShowGeneratorModal(false);
      return;
    }

    const targetRes = w >= 256 ? 256 : 128;
    const synthesizedUrl = synthesizeTileDataUrl({ ...synthRecipe, resolution: targetRes });
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      saveToHistory();
      const finalDataUrl = canvas.toDataURL('image/png');
      if (onSynthesizeRecipe) {
        onSynthesizeRecipe(synthRecipe, finalDataUrl);
      }
    };
    img.src = synthesizedUrl;
    setShowGeneratorModal(false);
  };

  return (
    <div className="flex flex-col gap-3 bg-[#0d1117] border border-[#0D5C63]/60 rounded-xl p-3.5 shadow-2xl text-slate-100 select-none">
      
      {/* Top Header Bar: Title, Canvas Resolution, Undo/Redo & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0D5C63]/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-[#22d3ee] tracking-wider flex items-center gap-1.5">
            <span>🎨</span> {label}
          </span>
          <span className="text-[10px] text-slate-400 font-mono bg-[#161b22] px-2 py-0.5 rounded border border-[#0D5C63]/40">
            {canvasResolution} × {canvasResolution} px
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* History Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1"
            title="Undo"
          >
            <span>↩️</span> Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1"
            title="Redo"
          >
            <span>↪️</span> Redo
          </button>

          {/* HIFI CHROMA Micro-Tile Synthesizer Button */}
          <button
            type="button"
            onClick={() => setShowGeneratorModal(true)}
            className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700 rounded text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1 shadow-md"
            title="HIFI CHROMA Micro-Tile Synthesizer (Seamless Tiles, 4-Bit Auto-Tiles, Hazards & Decals)"
          >
            <span>✨</span> Tile Synth...
          </button>

          {/* File Upload to Canvas */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs font-bold transition-all"
            title="Load Image File onto Canvas"
          >
            <span>📁</span> Import File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageFileUpload}
            className="hidden"
          />

          {/* Save directly to Asset */}
          {onSaveToAsset && (
            <button
              type="button"
              onClick={() => {
                const canvas = mainCanvasRef.current;
                if (canvas) {
                  onSaveToAsset(canvas.toDataURL('image/png'));
                }
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/60"
              title="Save Image Directly to Asset Unit"
            >
              <span>💾</span> Save to Asset
            </button>
          )}

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleExportPNG}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-xs font-bold transition-all"
            title="Download PNG"
          >
            <span>📥</span> PNG
          </button>

          {/* Clear Canvas */}
          <button
            type="button"
            onClick={handleClearCanvas}
            className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 rounded text-xs font-bold transition-all"
            title="Clear Canvas"
          >
            <span>🧹</span> Clear
          </button>
        </div>
      </div>

      {/* Main Studio Body: Left Tools Bar + Center Canvas Viewport + Right Adjustments & Previews */}
      <div className="flex flex-wrap items-start justify-center gap-3">
        
        {/* LEFT TOOLBAR: Drawing & Shape Tools */}
        <div className="flex flex-col gap-1.5 bg-[#161b22] p-2.5 rounded-lg border border-[#0D5C63]/40 w-36 shrink-0">
          <span className="text-[10px] uppercase font-bold text-cyan-400 text-center tracking-wider mb-0.5 border-b border-[#0D5C63]/30 pb-1">
            Draw Tools
          </span>
          
          <button
            type="button"
            onClick={() => setActiveTool('pencil')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'pencil' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Fine Pencil (Pixel Precision)"
          >
            <span>✏️</span> Pencil
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('brush')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'brush' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Paint Brush"
          >
            <span>🖌️</span> Brush
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('spray')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'spray' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Airbrush / Soft Spray"
          >
            <span>💨</span> Airbrush
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'eraser' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Eraser (Clears to Transparency)"
          >
            <span>🧽</span> Eraser
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('fill')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'fill' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Flood Fill Paint Bucket"
          >
            <span>🪣</span> Fill Bucket
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('picker')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'picker' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Color Eyedropper"
          >
            <span>💧</span> Eyedropper
          </button>

          <div className="border-t border-[#0D5C63]/40 my-1" />

          <span className="text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider mb-0.5">
            Vector Shapes
          </span>

          <button
            type="button"
            onClick={() => setActiveTool('line')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'line' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Straight Line"
          >
            <span>📏</span> Line
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('arrow')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'arrow' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Directional Arrow"
          >
            <span>➡️</span> Arrow
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('rect')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'rect' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Rectangle"
          >
            <span>🔲</span> Rect
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('circle')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'circle' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Circle / Ellipse"
          >
            <span>⭕</span> Circle
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('hexagon')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'hexagon' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Tactical Hexagon"
          >
            <span>⬡</span> Hexagon
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('star')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'star' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Star / Blast Shape"
          >
            <span>⭐</span> Star
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('triangle')}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${
              activeTool === 'triangle' ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Triangle"
          >
            <span>📐</span> Triangle
          </button>
        </div>

        {/* CENTER VIEWPORT: Canvas Drawing Board */}
        <div className="flex flex-col items-center gap-2">
          
          {/* Canvas Background View Options */}
          <div className="flex items-center gap-2 bg-[#161b22] px-3 py-1 rounded-full border border-[#0D5C63]/40 text-[10px]">
            <span className="text-slate-400 font-bold uppercase">Backdrop:</span>
            {[
              { id: 'transparent', label: 'Checker' },
              { id: 'dark', label: 'Dark' },
              { id: 'grid', label: 'Grid' },
              { id: 'light', label: 'Light' }
            ].map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBgMode(b.id)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  bgMode === b.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60' : 'text-slate-400 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div
            className={`relative border-2 border-cyan-500/50 rounded-lg overflow-hidden shadow-2xl transition-all ${
              bgMode === 'transparent'
                ? 'bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0] bg-[#0f172a]'
                : bgMode === 'dark'
                ? 'bg-[#090d13]'
                : bgMode === 'grid'
                ? 'bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] bg-[#090d13]'
                : 'bg-slate-200'
            }`}
            style={{ width: `${canvasResolution}px`, height: `${canvasResolution}px` }}
          >
            <canvas
              ref={mainCanvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className={`block touch-none select-none ${
                activeTool === 'picker' ? 'cursor-crosshair' : (activeTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair')
              }`}
              style={{ width: `${canvasResolution}px`, height: `${canvasResolution}px` }}
            />
            <canvas
              ref={previewCanvasRef}
              className="pointer-events-none absolute inset-0 block"
              style={{ width: `${canvasResolution}px`, height: `${canvasResolution}px` }}
            />
          </div>

          {/* Quick Brush Profiles & Shape Fill Toggles */}
          <div className="flex items-center gap-2 bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#0D5C63]/40 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Brush Mode:</span>
            {['round', 'soft', 'square', 'glow'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setBrushProfile(p)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize transition-all ${
                  brushProfile === p ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}

            {['rect', 'circle', 'hexagon', 'star', 'triangle'].includes(activeTool) && (
              <label className="flex items-center gap-1 ml-2 text-slate-300 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isShapeFilled}
                  onChange={e => setIsShapeFilled(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span className="text-[10px] font-bold uppercase text-amber-300">Fill Shape</span>
              </label>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Image Adjustments & Live Tiling/Object Preview */}
        <div className="flex flex-col gap-3 bg-[#161b22] p-3 rounded-lg border border-[#0D5C63]/40 w-56 shrink-0">
          
          {/* Adjustments & Transformations */}
          <div className="flex flex-col gap-2 border-b border-[#0D5C63]/30 pb-2.5">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              Image Adjustments
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleRotate(90)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                title="Rotate 90° Clockwise"
              >
                <span>🔄</span> 90° CW
              </button>
              <button
                type="button"
                onClick={handleInvertColors}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                title="Invert Colors"
              >
                <span>☯️</span> Invert
              </button>
              <button
                type="button"
                onClick={() => handleFlip(true)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                title="Flip Horizontal"
              >
                <span>↔️</span> Flip H
              </button>
              <button
                type="button"
                onClick={() => handleFlip(false)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                title="Flip Vertical"
              >
                <span>↕️</span> Flip V
              </button>
            </div>

            {/* Brightness Slider */}
            <div className="flex flex-col gap-0.5 mt-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                <span>☀️ Brightness</span>
                <span className="text-cyan-400 font-mono">{brightness > 0 ? `+${brightness}` : brightness}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={brightness}
                onChange={e => applyImageAdjustments(Number(e.target.value), contrast, hue, saturation)}
                className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Contrast Slider */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                <span>🌗 Contrast</span>
                <span className="text-cyan-400 font-mono">{contrast > 0 ? `+${contrast}` : contrast}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={contrast}
                onChange={e => applyImageAdjustments(brightness, Number(e.target.value), hue, saturation)}
                className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Hue Shift Slider */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                <span>🌈 Hue Shift</span>
                <span className="text-cyan-400 font-mono">{hue}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={hue}
                onChange={e => applyImageAdjustments(brightness, contrast, Number(e.target.value), saturation)}
                className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Saturation Slider */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                <span>🎨 Saturation</span>
                <span className="text-cyan-400 font-mono">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={e => applyImageAdjustments(brightness, contrast, hue, Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Previews: Seamless 3x3 Tiling (for Terrains) or Object Sprite Preview */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                {assetType === 'terrain' ? '3×3 Seamless Tiling' : 'Object Sprite Preview'}
              </span>
              <button
                type="button"
                onClick={() => setShowTilingPreview(prev => !prev)}
                className="text-[9px] text-slate-400 hover:text-cyan-300 font-bold uppercase"
              >
                {showTilingPreview ? 'Hide' : 'Show'}
              </button>
            </div>

            {showTilingPreview && (
              <div className="bg-[#090d13] border border-[#0D5C63]/60 rounded-lg p-1.5 flex items-center justify-center overflow-hidden">
                {assetType === 'terrain' ? (
                  <div
                    className="w-full h-32 rounded border border-cyan-500/40"
                    style={{
                      backgroundImage: mainCanvasRef.current ? `url(${mainCanvasRef.current.toDataURL('image/png')})` : 'none',
                      backgroundRepeat: 'repeat',
                      backgroundSize: '48px 48px'
                    }}
                    title="Seamless repeating pattern test"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:8px_8px] rounded border border-cyan-500/40 p-2">
                    {mainCanvasRef.current && (
                      <img
                        src={mainCanvasRef.current.toDataURL('image/png')}
                        alt="Sprite Preview"
                        className="max-h-28 max-w-28 object-contain drop-shadow-[0_4px_12px_rgba(34,211,238,0.4)]"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Bottom Tool Configuration: Color Picker, Palettes, Size & Opacity */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161b22] p-2.5 rounded-lg border border-[#0D5C63]/40">
        
        {/* Color Picker & Palettes */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Color:</label>
            <input
              type="color"
              value={color === 'transparent' ? '#000000' : color}
              onChange={e => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-[#0D5C63]/60 bg-[#0d1117] cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-20 bg-[#0d1117] border border-[#0D5C63]/60 text-white px-1.5 py-1 rounded text-xs font-mono outline-none focus:border-[#22d3ee]"
            />
          </div>

          {/* Palette Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={activePalette}
              onChange={e => setActivePalette(e.target.value)}
              className="bg-[#0d1117] border border-[#0D5C63]/60 text-white text-[11px] px-2 py-1 rounded outline-none"
            >
              {Object.keys(PRESET_PALETTES).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 max-w-[280px] overflow-x-auto pb-0.5">
              {PRESET_PALETTES[activePalette]?.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border shrink-0 transition-transform ${
                    color === c ? 'scale-125 border-white ring-2 ring-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'border-white/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Size:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-24 h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
          />
          <span className="text-[11px] text-cyan-300 font-mono font-bold w-8">{brushSize}px</span>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Opacity:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="w-24 h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
          />
          <span className="text-[11px] text-cyan-300 font-mono font-bold w-9">{opacity}%</span>
        </div>

      </div>

      {/* HIFI CHROMA Micro-Tile Synthesizer Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto select-none font-sans">
          <div className="bg-[#161b22] border border-[#0D5C63] rounded-xl w-full max-w-3xl p-5 shadow-2xl text-slate-100 flex flex-col gap-3 max-h-[90vh] overflow-hidden">
            <div className="shrink-0 flex items-center justify-between border-b border-[#0D5C63]/40 pb-2.5">
              <div>
                <h3 className="text-sm font-bold uppercase text-[#22d3ee] tracking-wider flex items-center gap-2">
                  <span>✨</span> HIFI CHROMA Micro-Tile Synthesizer
                </h3>
                <p className="text-[10px] text-slate-400">
                  Ligne Claire / Bande Dessinée Toroidal Seamless Tiles, 4-Bit Auto-Tiles & Tactical Decals
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGeneratorModal(false)}
                className="text-slate-400 hover:text-white font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4 custom-scrollbar">
            {/* Natural-Language Prompt-to-Recipe Bar */}
            <div className="flex flex-col gap-1.5 bg-[#0d1117] border border-purple-800/60 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <span>🧠</span> AI / Semantic Prompt-to-Recipe
                </label>
                {synthSourceBadge && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-700/60">
                    {synthSourceBadge}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={synthPrompt}
                  onChange={(e) => setSynthPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAiSynthPrompt();
                    }
                  }}
                  placeholder="e.g. 'rusted starship grate over glowing green acid pool' or 'cracked cryo glacier ice'"
                  className="flex-1 bg-[#161b22] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={handleAiSynthPrompt}
                  disabled={isAiSynthLoading || !synthPrompt.trim()}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all"
                >
                  {isAiSynthLoading ? 'Synthesizing...' : '⚡ Generate Recipe'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
              {/* Left Column: Preset Catalog & Procedural Families (7 cols) */}
              <div className="md:col-span-7 flex flex-col gap-3">
                {/* Canonical Preset Selector */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 uppercase text-[10px]">
                      Canonical HIFI CHROMA Presets ({HIFI_CHROMA_TILE_PRESETS.length})
                    </label>
                    <select
                      value={synthFamilyFilter}
                      onChange={(e) => setSynthFamilyFilter(e.target.value)}
                      className="bg-[#0d1117] border border-slate-700 rounded px-2 py-0.5 text-[10px] text-cyan-300"
                    >
                      <option value="all">All Biomes & Families</option>
                      {Object.entries(TILE_FAMILY_METADATA).map(([famKey, meta]) => (
                        <option key={famKey} value={famKey}>
                          {meta.icon} {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {HIFI_CHROMA_TILE_PRESETS.filter(
                      (p) => synthFamilyFilter === 'all' || p.family === synthFamilyFilter
                    ).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSynthRecipe(JSON.parse(JSON.stringify(preset)));
                          setSynthSourceBadge(`📦 Preset ${preset.catalogCode || ''}`);
                        }}
                        className={`p-2 rounded border text-left flex flex-col gap-0.5 transition-all ${
                          synthRecipe.id === preset.id
                            ? 'border-[#22d3ee] bg-cyan-950/80 text-cyan-200 font-bold'
                            : 'border-slate-800 bg-[#0d1117] text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-[11px]">{preset.name}</span>
                          {preset.catalogCode && (
                            <span className="text-[9px] font-mono text-cyan-400 shrink-0">
                              {preset.catalogCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[
                            preset.palette.primary,
                            preset.palette.secondary,
                            preset.palette.accent,
                            preset.palette.glow || preset.palette.ink
                          ].map((sw, idx) => (
                            <span
                              key={idx}
                              className="w-2.5 h-2.5 rounded-sm border border-black/40"
                              style={{ backgroundColor: sw }}
                            />
                          ))}
                          <span className="text-[9px] text-slate-500 ml-auto">
                            {preset.vtt.isHazard ? '⚠️ Hazard' : preset.vtt.material}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Procedural Family & Output Mode */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-300 uppercase text-[10px]">
                      Procedural Family
                    </label>
                    <select
                      value={synthRecipe.family}
                      onChange={(e) =>
                        setSynthRecipe((prev) => ({ ...prev, family: e.target.value }))
                      }
                      className="bg-[#0d1117] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200"
                    >
                      {Object.entries(TILE_FAMILY_METADATA).map(([famKey, meta]) => (
                        <option key={famKey} value={famKey}>
                          {meta.icon} {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-300 uppercase text-[10px]">
                      Output Mode
                    </label>
                    <select
                      value={synthRecipe.outputMode}
                      onChange={(e) =>
                        setSynthRecipe((prev) => ({
                          ...prev,
                          outputMode: e.target.value,
                          geometry: {
                            ...prev.geometry,
                            transparentBg: e.target.value !== 'seamless_single'
                          }
                        }))
                      }
                      className="bg-[#0d1117] border border-slate-700 rounded px-2 py-1.5 text-xs text-cyan-300 font-bold"
                    >
                      <option value="seamless_single">🔁 Seamless Repeating Tile</option>
                      <option value="marching_squares_4bit">🧩 4-Bit Auto-Tile Atlas (4×4)</option>
                      <option value="decal_overlay">🎯 Alpha Decal / Prop Stamp</option>
                    </select>
                  </div>
                </div>

                {/* HIFI CHROMA Palette Pickers */}
                <div className="flex flex-col gap-1.5 bg-[#0d1117] border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 uppercase text-[10px]">
                      HIFI CHROMA Palette & Ink
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSynthRecipe((prev) => ({
                          ...prev,
                          seed: Math.floor(Math.random() * 89999) + 1000
                        }))
                      }
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono"
                    >
                      🎲 Seed #{synthRecipe.seed} (Re-Roll)
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { key: 'primary', label: 'Primary' },
                      { key: 'secondary', label: 'Secondary' },
                      { key: 'accent', label: 'Accent' },
                      { key: 'ink', label: 'Ink Line' },
                      { key: 'glow', label: 'Glow/FX' }
                    ].map(({ key, label: colLabel }) => (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={synthRecipe.palette[key] || '#38bdf8'}
                          onChange={(e) =>
                            setSynthRecipe((prev) => ({
                              ...prev,
                              palette: { ...prev.palette, [key]: e.target.value }
                            }))
                          }
                          className="w-8 h-7 rounded border border-[#0D5C63]/60 cursor-pointer bg-transparent"
                        />
                        <span className="text-[9px] text-slate-400">{colLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ligne Claire & Geometry Sliders */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-[#0d1117] border border-slate-800 rounded-lg p-2.5">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Cell / Plate Scale</span>
                      <span className="text-cyan-300 font-mono">{synthRecipe.geometry.scale}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="1"
                      value={synthRecipe.geometry.scale}
                      onChange={(e) =>
                        setSynthRecipe((prev) => ({
                          ...prev,
                          geometry: { ...prev.geometry, scale: Number(e.target.value) }
                        }))
                      }
                      className="w-full h-1 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Ligne Claire Ink Weight</span>
                      <span className="text-cyan-300 font-mono">
                        {synthRecipe.ligneClaire.inkWeight.toFixed(1)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.5"
                      step="0.2"
                      value={synthRecipe.ligneClaire.inkWeight}
                      onChange={(e) =>
                        setSynthRecipe((prev) => ({
                          ...prev,
                          ligneClaire: { ...prev.ligneClaire, inkWeight: Number(e.target.value) }
                        }))
                      }
                      className="w-full h-1 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Cross-Hatch Shadows</span>
                      <span className="text-cyan-300 font-mono">
                        {Math.round(synthRecipe.ligneClaire.crossHatchDensity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={synthRecipe.ligneClaire.crossHatchDensity}
                      onChange={(e) =>
                        setSynthRecipe((prev) => ({
                          ...prev,
                          ligneClaire: {
                            ...prev.ligneClaire,
                            crossHatchDensity: Number(e.target.value)
                          }
                        }))
                      }
                      className="w-full h-1 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Weathering & Grime</span>
                      <span className="text-cyan-300 font-mono">
                        {Math.round(synthRecipe.ligneClaire.weathering * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={synthRecipe.ligneClaire.weathering}
                      onChange={(e) =>
                        setSynthRecipe((prev) => ({
                          ...prev,
                          ligneClaire: { ...prev.ligneClaire, weathering: Number(e.target.value) }
                        }))
                      }
                      className="w-full h-1 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Emissive Seam Glow</span>
                      <span className="text-cyan-300 font-mono">
                        {Math.round(synthRecipe.ligneClaire.emissiveStrength * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={synthRecipe.ligneClaire.emissiveStrength}
                      onChange={(e) =>
                        setSynthRecipe((prev) => ({
                          ...prev,
                          ligneClaire: {
                            ...prev.ligneClaire,
                            emissiveStrength: Number(e.target.value)
                          }
                        }))
                      }
                      className="w-full h-1 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-amber-300">
                      <input
                        type="checkbox"
                        checked={synthRecipe.ligneClaire.hazardStripes}
                        onChange={(e) =>
                          setSynthRecipe((prev) => ({
                            ...prev,
                            ligneClaire: { ...prev.ligneClaire, hazardStripes: e.target.checked }
                          }))
                        }
                        className="accent-amber-400"
                      />
                      ⚠️ Hazard Chevrons
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Live 2x2 Seamless Tiling Preview & VTT Mechanics Readout (5 cols) */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 bg-[#0d1117] border border-slate-800 rounded-lg p-3 items-center">
                  <span className="text-[10px] font-bold uppercase text-cyan-300 tracking-wider self-start">
                    Live 2×2 Toroidal Seamless Preview
                  </span>
                  <div
                    className="w-44 h-44 rounded-lg border border-[#0D5C63] shadow-inner overflow-hidden"
                    style={{
                      backgroundImage: synthPreviewDataUrl ? `url("${synthPreviewDataUrl}")` : 'none',
                      backgroundSize: '50% 50%',
                      backgroundRepeat: 'repeat',
                      backgroundColor: '#090d16'
                    }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-full">
                    {synthRecipe.name}
                  </span>
                </div>

                {/* Auto-Inferred Tangent 2d10 VTT Mechanics Card */}
                <div className="flex flex-col gap-1.5 bg-[#0d1117] border border-slate-800 rounded-lg p-3 text-[11px]">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                    ⚙️ Auto-Wired 2d10 VTT Mechanics
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-slate-300">
                    <div>
                      <span className="text-slate-500">Material:</span>{' '}
                      <span className="font-mono text-cyan-300">{synthRecipe.vtt.material}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Move Cost:</span>{' '}
                      <span className="font-mono">{synthRecipe.vtt.movementCost}x</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Friction:</span>{' '}
                      <span className="font-mono">{synthRecipe.vtt.slipperyFriction}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Cover:</span>{' '}
                      <span className="font-mono">{synthRecipe.vtt.cover}</span>
                    </div>
                  </div>
                  {synthRecipe.vtt.emitsLight && (
                    <div className="text-[10px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 rounded px-2 py-1">
                      💡 Dynamic Light: {synthRecipe.vtt.lightRadiusBrightFt || 10}ft bright /{' '}
                      {synthRecipe.vtt.lightRadiusDimFt || 20}ft dim ({synthRecipe.vtt.lightAnimation || 'pulse'})
                    </div>
                  )}
                  {synthRecipe.vtt.isHazard && (
                    <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded px-2 py-1">
                      ☣️ Hazard: {synthRecipe.vtt.damageFormula} • DC {synthRecipe.vtt.saveDc || 14}{' '}
                      {synthRecipe.vtt.saveAttribute || 'Reflex (AGI)'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>

            <div className="shrink-0 flex items-center justify-between gap-2 pt-3 border-t border-[#0D5C63]/40">
              <span className="text-[10px] text-slate-400">
                {synthRecipe.outputMode === 'marching_squares_4bit'
                  ? 'Renders a 16-variant 4-Bit Marching Squares Auto-Tile Atlas onto the canvas.'
                  : 'Renders a 100% seamless toroidal tile onto the canvas & syncs VTT stats.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applySynthesizedTileToCanvas}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold uppercase text-xs shadow-lg"
                >
                  ✨ Synthesize onto Canvas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
