import React, { useRef, useState, useEffect, useCallback } from 'react';

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

export default function AssetDrawingStudio({
  initialImage = '',
  onChange,
  width = 256,
  height = 256,
  label = 'Asset Image Canvas & Studio',
  assetType = 'terrain', // 'terrain' | 'object'
  onSaveToAsset
}) {
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

  // Active procedural generator modal/panel
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [activeGenType, setActiveGenType] = useState('noise'); // 'noise' | 'grid' | 'nebula' | 'veins'
  const [genColorA, setGenColorA] = useState('#0f172a');
  const [genColorB, setGenColorB] = useState('#06b6d4');
  const [genColorC, setGenColorC] = useState('#38bdf8');
  const [genScale, setGenScale] = useState(20);
  const [genDetail, setGenDetail] = useState(4);

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
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
  const handleClearCanvas = () => {
    if (window.confirm('Clear canvas? You can undo this action.')) {
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

  // Procedural Synthesizers
  const generateProceduralTexture = (type) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const [r1, g1, b1] = parseColorToRgba(genColorA, 100);
    const [r2, g2, b2] = parseColorToRgba(genColorB, 100);
    const [r3, g3, b3] = parseColorToRgba(genColorC, 100);

    if (type === 'noise') {
      // Fractal value noise generator
      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;
      const scale = Math.max(5, genScale);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          // Simple multi-frequency sine wave synthesis for seamless texture
          const nx = (x / w) * Math.PI * 2 * (scale / 10);
          const ny = (y / h) * Math.PI * 2 * (scale / 10);

          let val = Math.sin(nx) * Math.cos(ny) * 0.5 + 0.5;
          val += (Math.sin(nx * 2 + 1.2) * Math.cos(ny * 2 + 0.8) * 0.25);
          val += (Math.sin(nx * 4 + 2.5) * Math.cos(ny * 4 + 1.7) * 0.125);
          val = Math.max(0, Math.min(1, val));

          // Interpolate between colors
          let r, g, b;
          if (val < 0.5) {
            const t = val * 2;
            r = r1 + (r2 - r1) * t;
            g = g1 + (g2 - g1) * t;
            b = b1 + (b2 - b1) * t;
          } else {
            const t = (val - 0.5) * 2;
            r = r2 + (r3 - r2) * t;
            g = g2 + (g3 - g2) * t;
            b = b2 + (b3 - b2) * t;
          }

          data[idx] = Math.round(r);
          data[idx + 1] = Math.round(g);
          data[idx + 2] = Math.round(b);
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (type === 'grid') {
      // Sci-fi Tactical Hull & Grid Plates
      ctx.fillStyle = genColorA;
      ctx.fillRect(0, 0, w, h);

      const cellSize = Math.max(16, genScale * 2);
      ctx.strokeStyle = genColorB;
      ctx.lineWidth = 2;

      for (let x = 0; x < w; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Bevel accents and corner rivets
      ctx.fillStyle = genColorC;
      for (let x = 0; x < w; x += cellSize) {
        for (let y = 0; y < h; y += cellSize) {
          ctx.fillRect(x + 2, y + 2, 4, 4);
          ctx.fillRect(x + cellSize - 6, y + 2, 4, 4);
          ctx.fillRect(x + 2, y + cellSize - 6, 4, 4);
          ctx.fillRect(x + cellSize - 6, y + cellSize - 6, 4, 4);
        }
      }
    } else if (type === 'nebula') {
      // Cosmic Space Nebula & Starfield
      ctx.fillStyle = genColorA;
      ctx.fillRect(0, 0, w, h);

      // Nebula cloud puffs
      for (let i = 0; i < 8; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const rad = Math.random() * (w * 0.4) + (w * 0.2);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grad.addColorStop(0, genColorB + '99');
        grad.addColorStop(0.5, genColorC + '44');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Star clusters
      const starCount = Math.floor((w * h) / 400);
      for (let s = 0; s < starCount; s++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        const sSize = Math.random() * 2 + 0.5;
        const bright = Math.random() > 0.3 ? '#ffffff' : genColorC;
        ctx.fillStyle = bright;
        ctx.fillRect(sx, sy, sSize, sSize);
      }
    } else if (type === 'veins') {
      // Fissures / Crystal Veins
      ctx.fillStyle = genColorA;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = genColorB;
      ctx.shadowColor = genColorC;
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;

      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        let vx = Math.random() * w;
        let vy = Math.random() * h;
        ctx.moveTo(vx, vy);
        for (let step = 0; step < 12; step++) {
          vx += (Math.random() - 0.5) * (w / 3);
          vy += (Math.random() - 0.5) * (h / 3);
          ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }
    }

    saveToHistory();
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

          {/* Procedural Generator Button */}
          <button
            type="button"
            onClick={() => setShowGeneratorModal(true)}
            className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700 rounded text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1 shadow-md"
            title="Procedural Synthesizers (Noise, Grids, Nebulae, Veins)"
          >
            <span>✨</span> Generator...
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

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleExportPNG}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-xs font-bold transition-all"
            title="Download PNG"
          >
            <span>💾</span> PNG
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

      {/* Procedural Synthesizer Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
          <div className="bg-[#161b22] border border-[#0D5C63] rounded-xl w-full max-w-md p-5 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#0D5C63]/40 pb-2">
              <h3 className="text-sm font-bold uppercase text-[#22d3ee] tracking-wider flex items-center gap-2">
                <span>✨</span> Procedural Texture Synthesizer
              </h3>
              <button
                type="button"
                onClick={() => setShowGeneratorModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300 uppercase text-[10px]">Synthesis Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'noise', label: '🌌 Planetary Noise', desc: 'Organic rock, water, gas clouds' },
                    { id: 'grid', label: '🧱 Sci-Fi Hull Grid', desc: 'Plating, decks, panels' },
                    { id: 'nebula', label: '⭐ Deep Space Nebula', desc: 'Star clusters & dust clouds' },
                    { id: 'veins', label: '🌋 Fissures & Veins', desc: 'Lava rifts, crystals' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveGenType(t.id)}
                      className={`p-2 rounded border text-left flex flex-col gap-0.5 transition-all ${
                        activeGenType === t.id
                          ? 'border-[#22d3ee] bg-cyan-950/80 text-cyan-300 font-bold'
                          : 'border-slate-800 bg-[#0d1117] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[9px] text-slate-500">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Gradient Stops */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-300 uppercase text-[10px]">Palette Gradient Stops</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Base:</span>
                    <input
                      type="color"
                      value={genColorA}
                      onChange={e => setGenColorA(e.target.value)}
                      className="w-7 h-7 rounded border border-[#0D5C63]/60 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Mid:</span>
                    <input
                      type="color"
                      value={genColorB}
                      onChange={e => setGenColorB(e.target.value)}
                      className="w-7 h-7 rounded border border-[#0D5C63]/60 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Highlight:</span>
                    <input
                      type="color"
                      value={genColorC}
                      onChange={e => setGenColorC(e.target.value)}
                      className="w-7 h-7 rounded border border-[#0D5C63]/60 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Scale Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                  <span>Frequency / Feature Scale</span>
                  <span className="text-cyan-400 font-mono">{genScale}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={genScale}
                  onChange={e => setGenScale(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0D5C63]/40">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => generateProceduralTexture(activeGenType)}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold uppercase text-xs shadow-lg"
                >
                  Synthesize onto Canvas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
