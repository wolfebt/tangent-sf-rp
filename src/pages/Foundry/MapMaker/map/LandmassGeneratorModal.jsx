import React, { useState, useEffect, useRef } from 'react';
import { generateLandmassGrid, convertGridToKonvaElements, BIOME_PALETTES } from './landmassGenerator';

const PRESETS = [
  { name: 'HD Island Archipelago', algorithm: 'cellular', oceanLevel: 65, scale: 40, octaves: 6, roughness: 0.6, climateBias: 0, scatterDensity: 40, resolution: 200, erosionPasses: 1, falloff: true, rivers: true, palette: 'terrestrial' },
  { name: 'HD Pangaea Continent', algorithm: 'simplex', oceanLevel: 32, scale: 90, octaves: 7, roughness: 0.48, climateBias: 10, scatterDensity: 35, resolution: 240, erosionPasses: 2, falloff: true, rivers: true, palette: 'terrestrial' },
  { name: 'Sci-Fi Alien Ringland', algorithm: 'simplex', oceanLevel: 55, scale: 70, octaves: 8, roughness: 0.7, climateBias: -20, scatterDensity: 50, resolution: 200, erosionPasses: 1, falloff: false, rivers: true, palette: 'scifi' },
  { name: 'Ultra Tectonic Plates', algorithm: 'voronoi', oceanLevel: 42, scale: 120, octaves: 5, roughness: 0.5, climateBias: 0, scatterDensity: 30, resolution: 240, erosionPasses: 0, falloff: false, rivers: false, palette: 'terrestrial' },
  { name: 'Volcanic Ash Wasteland', algorithm: 'simplex', oceanLevel: 35, scale: 50, octaves: 7, roughness: 0.8, climateBias: 85, scatterDensity: 20, resolution: 200, erosionPasses: 1, falloff: true, rivers: true, palette: 'volcanic' },
  { name: 'Glacial Fjords & Crags', algorithm: 'simplex', oceanLevel: 50, scale: 65, octaves: 8, roughness: 0.75, climateBias: -85, scatterDensity: 25, resolution: 240, erosionPasses: 2, falloff: true, rivers: true, palette: 'glacial' }
];

const LandmassGeneratorModal = ({ isOpen, onClose, onCommitLandmass, defaultRenderMode = 'organic' }) => {
  const canvasRef = useRef(null);

  // Generator State
  const [algorithm, setAlgorithm] = useState('simplex');
  const [seed, setSeed] = useState('Terra_Nova_HD');
  const [renderMode, setRenderMode] = useState(defaultRenderMode);
  
  // 8 Interactive Slider States (HD Expanded Limits)
  const [oceanLevel, setOceanLevel] = useState(45);
  const [scale, setScale] = useState(60);
  const [octaves, setOctaves] = useState(6);
  const [roughness, setRoughness] = useState(0.5);
  const [climateBias, setClimateBias] = useState(0);
  const [scatterDensity, setScatterDensity] = useState(40);
  const [resolution, setResolution] = useState(240); // 240x180 Extreme HD
  const [erosionPasses, setErosionPasses] = useState(2);
  const [enableFalloff, setEnableFalloff] = useState(true);
  const [enableRivers, setEnableRivers] = useState(true);
  const [enableDomainWarp, setEnableDomainWarp] = useState(true);

  // Palette State
  const [paletteKey, setPaletteKey] = useState('terrestrial');

  const [gridResult, setGridResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setRenderMode(defaultRenderMode);
    }
  }, [isOpen, defaultRenderMode]);

  const randomizeSeed = () => {
    setSeed('Seed_' + Math.floor(Math.random() * 1000000));
  };

  const applyPreset = (preset) => {
    setAlgorithm(preset.algorithm);
    setOceanLevel(preset.oceanLevel);
    setScale(preset.scale);
    setOctaves(preset.octaves);
    setRoughness(preset.roughness);
    setClimateBias(preset.climateBias);
    setScatterDensity(preset.scatterDensity);
    setResolution(preset.resolution);
    setErosionPasses(preset.erosionPasses);
    setEnableFalloff(preset.falloff);
    setEnableRivers(preset.rivers);
    setEnableDomainWarp(preset.warp ?? true);
    setPaletteKey(preset.palette);
  };

  // Generate grid heightmap & biomes whenever parameters change
  useEffect(() => {
    if (!isOpen) return;

    const width = resolution;
    const height = Math.floor((resolution * 3) / 4);

    const result = generateLandmassGrid({
      algorithm,
      seed,
      width,
      height,
      oceanLevel,
      scale,
      octaves,
      roughness,
      climateBias,
      erosionPasses,
      enableFalloff,
      enableRivers,
      enableDomainWarp,
      paletteKey
    });

    setGridResult(result);
  }, [isOpen, algorithm, seed, oceanLevel, scale, octaves, roughness, climateBias, scatterDensity, resolution, erosionPasses, enableFalloff, enableRivers, enableDomainWarp, paletteKey]);

  // Render live HTML5 Canvas Preview
  useEffect(() => {
    if (!gridResult || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height, grid, getBiome } = gridResult;

    canvas.width = Math.max(400, width * 2);
    canvas.height = Math.max(300, height * 2);

    const cellW = canvas.width / width;
    const cellH = canvas.height / height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const val = grid[y * width + x];
        const biome = getBiome(val, x, y);
        ctx.fillStyle = biome.color;
        ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
      }
    }
  }, [gridResult]);

  if (!isOpen) return null;

  const handleCommit = (replaceExisting) => {
    if (!gridResult) return;

    const { terrains, objects } = convertGridToKonvaElements(gridResult, {
      stageWidth: 4000,
      stageHeight: 3000,
      scatterDensity,
      seed,
      renderMode
    });

    onCommitLandmass({ terrains, objects, replaceExisting });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-4 sm:pt-6 overflow-y-auto select-none">
      <div className="bg-[#0f172a] border border-[#0D5C63] rounded-xl shadow-[0_0_35px_rgba(34,211,238,0.25)] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="bg-[#1e293b]/90 px-6 py-4 border-b border-[#0D5C63]/60 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌏</span>
            <div>
              <h2 className="sci-fi-title-text text-lg font-bold text-white tracking-wider uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                Ultra HD Procedural Landmass Generator
              </h2>
              <p className="text-xs text-slate-400">High Resolution noise, multi-octave coastlines, procedural rivers, and 12-tier biomes.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-950 hover:text-red-400 border border-slate-700 text-slate-400 text-lg flex items-center justify-center transition-all"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Algorithm & Seed Selector */}
            <div className="bg-[#161b22] border border-[#0D5C63]/50 p-4 rounded-lg flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-[#22d3ee] font-bold tracking-wider">Algorithm & Seed</span>
                <div className="flex bg-slate-900 border border-slate-700 rounded p-0.5">
                  <button
                    onClick={() => setRenderMode('organic')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                      renderMode === 'organic' ? 'bg-[#22d3ee] text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🌱 Organic Vector
                  </button>
                  <button
                    onClick={() => setRenderMode('hex')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                      renderMode === 'hex' ? 'bg-[#22d3ee] text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⬢ Hex Tiles
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'simplex', label: 'Simplex HD' },
                  { id: 'cellular', label: 'Cellular Island' },
                  { id: 'voronoi', label: 'Voronoi Plates' }
                ].map(alg => (
                  <button
                    key={alg.id}
                    onClick={() => setAlgorithm(alg.id)}
                    className={`py-2 px-3 text-xs font-bold rounded border transition-all ${
                      algorithm === alg.id 
                        ? 'bg-cyan-950 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_8px_rgba(34,211,238,0.3)]' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {alg.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={seed}
                  onChange={e => setSeed(e.target.value)}
                  placeholder="World Seed..."
                  className="flex-1 bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs p-2 rounded outline-none focus:border-[#22d3ee]"
                />
                <button
                  onClick={randomizeSeed}
                  className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 border border-[#22d3ee] text-[#22d3ee] text-xs font-bold rounded flex items-center gap-1.5 transition-all"
                  title="Randomize Seed"
                >
                  🎲 Seed
                </button>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={enableFalloff} onChange={e => setEnableFalloff(e.target.checked)} className="accent-[#22d3ee]" />
                  <span>Radial Island Falloff</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={enableRivers} onChange={e => setEnableRivers(e.target.checked)} className="accent-[#22d3ee]" />
                  <span>Carve Rivers</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={enableDomainWarp} onChange={e => setEnableDomainWarp(e.target.checked)} className="accent-[#22d3ee]" />
                  <span>Domain Warping</span>
                </label>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-[#22d3ee]/60 rounded text-slate-300 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* HD Interactive Range Sliders */}
            <div className="bg-[#161b22] border border-[#0D5C63]/50 p-4 rounded-lg flex flex-col gap-4">
              <span className="text-xs uppercase text-[#22d3ee] font-bold tracking-wider">HD Fine Detail Controls</span>

              {/* Slider 1: Resolution */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-300">🧩 Grid Resolution (Fine Detail)</span>
                  <span className="text-amber-400 font-mono font-bold">{resolution} x {Math.floor((resolution * 3) / 4)} ({resolution * Math.floor((resolution * 3) / 4)} cells)</span>
                </div>
                <input type="range" min="60" max="600" step="20" value={resolution} onChange={e => setResolution(Number(e.target.value))} className="accent-amber-400" />
              </div>

              {/* Slider 2: Ocean Level */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">🌊 Ocean Level / Land Ratio</span>
                  <span className="text-cyan-400 font-mono">{oceanLevel}%</span>
                </div>
                <input type="range" min="10" max="85" value={oceanLevel} onChange={e => setOceanLevel(Number(e.target.value))} className="accent-[#22d3ee]" />
              </div>

              {/* Slider 3: Noise Scale */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">🔍 Continental Scale</span>
                  <span className="text-cyan-400 font-mono">{scale}</span>
                </div>
                <input type="range" min="15" max="300" value={scale} onChange={e => setScale(Number(e.target.value))} className="accent-[#22d3ee]" />
              </div>

              {/* Slider 4: Octaves & Detail */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">⛰️ Octaves & Fractal Detail</span>
                  <span className="text-cyan-400 font-mono">{octaves} Octaves</span>
                </div>
                <input type="range" min="1" max="10" value={octaves} onChange={e => setOctaves(Number(e.target.value))} className="accent-[#22d3ee]" />
              </div>

              {/* Slider 5: Roughness */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">⚡ Coastline Roughness & Fjords</span>
                  <span className="text-cyan-400 font-mono">{roughness.toFixed(2)}</span>
                </div>
                <input type="range" min="0.1" max="1.0" step="0.05" value={roughness} onChange={e => setRoughness(Number(e.target.value))} className="accent-[#22d3ee]" />
              </div>

              {/* Slider 6: Biome Climate Bias */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">🌡️ Climate & Temperature Bias</span>
                  <span className="text-cyan-400 font-mono">{climateBias > 0 ? `+${climateBias} (Arid)` : climateBias < 0 ? `${climateBias} (Glacial)` : '0 (Balanced)'}</span>
                </div>
                <input type="range" min="-100" max="100" value={climateBias} onChange={e => setClimateBias(Number(e.target.value))} className="accent-[#22d3ee]" />
              </div>

              {/* Slider 7: Feature Scattering Density */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">🌲 Feature & Asset Density</span>
                  <span className="text-cyan-400 font-mono">{scatterDensity}%</span>
                </div>
                <input type="range" min="0" max="100" value={scatterDensity} onChange={e => setScatterDensity(Number(e.target.value))} className="accent-[#22d3ee]" />
              </div>

              {/* Slider 8: Erosion / Smoothing */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">🌊 Hydraulic Erosion Passes</span>
                  <span className="text-cyan-400 font-mono">{erosionPasses} Passes</span>
                </div>
                <input type="range" min="0" max="5" value={erosionPasses} onChange={e => setErosionPasses(Number(e.target.value))} className="accent-[#22d3ee]" />
              </div>

            </div>

          </div>

          {/* Right Column: Live Preview Canvas & Biome Palette (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* Live Canvas Preview */}
            <div className="bg-[#161b22] border border-[#0D5C63]/50 p-4 rounded-lg flex flex-col gap-3">
              <span className="text-xs uppercase text-[#22d3ee] font-bold tracking-wider flex items-center justify-between">
                <span>🖥️ Real-Time HD Preview</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{resolution} x {Math.floor((resolution * 3) / 4)}</span>
              </span>

              <div className="relative aspect-[4/3] w-full bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Biome Palette Selection */}
            <div className="bg-[#161b22] border border-[#0D5C63]/50 p-4 rounded-lg flex flex-col gap-3">
              <span className="text-xs uppercase text-[#22d3ee] font-bold tracking-wider">HD Biome Palette Theme</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'terrestrial', label: 'Standard Earth' },
                  { id: 'scifi', label: 'Sci-Fi Neon' },
                  { id: 'volcanic', label: 'Volcanic Ash' },
                  { id: 'glacial', label: 'Sub-Zero Glacial' }
                ].map(pal => {
                  const colors = BIOME_PALETTES[pal.id];
                  return (
                    <button
                      key={pal.id}
                      onClick={() => setPaletteKey(pal.id)}
                      className={`p-2.5 rounded border text-left flex flex-col gap-1.5 transition-all ${
                        paletteKey === pal.id 
                          ? 'bg-cyan-950 border-[#22d3ee] shadow-[0_0_8px_rgba(34,211,238,0.3)]' 
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-200">{pal.label}</span>
                      <div className="flex gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.ocean }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.grass }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.mountain }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.snow }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-[#1e293b]/90 px-6 py-4 border-t border-[#0D5C63]/60 flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => handleCommit(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold rounded transition-all"
            >
              ➕ Add as Overlay
            </button>
            <button
              onClick={() => handleCommit(true)}
              className="px-5 py-2 bg-[#0D5C63] hover:bg-[#127e88] border border-[#22d3ee] text-white text-xs font-bold rounded shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all"
            >
              🌏 Apply HD Map (Replace Terrain)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandmassGeneratorModal;
