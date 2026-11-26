/**
 * @file TileSynthesizerModal.tsx
 * @description Shared HIFI CHROMA Micro-Tile Unit Synthesizer modal used across
 * Asset Studio and MapMaker components.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import {
  HIFI_CHROMA_TILE_PRESETS,
  TILE_FAMILY_METADATA,
  type TileSynthesisRecipe,
  synthesizeTileDataUrl
} from '../../../../engine/assets/MicroTileSynthesizer';
import { synthesizeTileRecipeFromPrompt } from '../../../../services/tileAiRecipeService';

export interface TileSynthesizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnitName?: string;
  onApplyToSelected?: (
    recipe: TileSynthesisRecipe,
    options: { includeAutoTiles: boolean; includeStateTextures: boolean }
  ) => void;
  onMintNewUnit: (
    recipe: TileSynthesisRecipe,
    options: { includeAutoTiles: boolean; includeStateTextures: boolean }
  ) => void;
}

export const TileSynthesizerModal: React.FC<TileSynthesizerModalProps> = ({
  isOpen,
  onClose,
  selectedUnitName,
  onApplyToSelected,
  onMintNewUnit
}) => {
  const [tileRecipe, setTileRecipe] = useState<TileSynthesisRecipe>(() =>
    JSON.parse(JSON.stringify(HIFI_CHROMA_TILE_PRESETS[0]))
  );
  const [tilePrompt, setTilePrompt] = useState('');
  const [isTileAiLoading, setIsTileAiLoading] = useState(false);
  const [tileAiSource, setTileAiSource] = useState('');
  const [includeAutoTiles, setIncludeAutoTiles] = useState(false);
  const [includeStateTextures, setIncludeStateTextures] = useState(true);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const liveTilePreviewUrl = useMemo(() => {
    if (!isOpen) return '';
    return synthesizeTileDataUrl({ ...tileRecipe, resolution: 128 });
  }, [isOpen, tileRecipe]);

  if (!isOpen) return null;

  const handleTilePromptGenerate = async () => {
    if (!tilePrompt.trim()) return;
    setIsTileAiLoading(true);
    try {
      const { recipe, source } = await synthesizeTileRecipeFromPrompt(tilePrompt, tileRecipe);
      setTileRecipe(recipe);
      setTileAiSource(source === 'gemini_flash' ? '⚡ Gemini Flash' : '🧠 Semantic Engine');
    } finally {
      setIsTileAiLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="HIFI CHROMA Micro-Tile Unit Synthesizer"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-purple-700 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-purple-900/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-mono font-semibold text-slate-100 uppercase tracking-wider">
              HIFI CHROMA Micro-Tile Unit Synthesizer
            </h2>
            {tileAiSource && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                {tileAiSource}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Tile Synthesizer"
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs font-mono custom-scrollbar">
          {/* Prompt-to-Recipe Bar */}
          <div className="flex gap-2 bg-slate-950 p-3 rounded-lg border border-purple-800/50">
            <input
              type="text"
              value={tilePrompt}
              onChange={(e) => setTilePrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTilePromptGenerate();
                }
              }}
              placeholder="Describe tile (e.g., 'rusted starship grate over glowing green acid pool', 'cracked cryo glacier ice')..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-purple-400"
            />
            <button
              type="button"
              onClick={handleTilePromptGenerate}
              disabled={isTileAiLoading || !tilePrompt.trim()}
              className="px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white font-semibold uppercase"
            >
              {isTileAiLoading ? 'Synthesizing...' : '⚡ AI / Semantic Recipe'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1">
                  Tile Unit Name
                </label>
                <input
                  type="text"
                  value={tileRecipe.name}
                  onChange={(e) => setTileRecipe((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1">
                  Canonical HIFI CHROMA Presets ({HIFI_CHROMA_TILE_PRESETS.length})
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {HIFI_CHROMA_TILE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setTileRecipe(JSON.parse(JSON.stringify(preset)));
                        setIncludeAutoTiles(preset.outputMode === 'marching_squares_4bit');
                      }}
                      className={`p-2 rounded border text-left transition-all ${
                        tileRecipe.id === preset.id
                          ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate font-semibold">{preset.name}</span>
                        {preset.catalogCode && (
                          <span className="text-[9px] text-cyan-400 ml-1">{preset.catalogCode}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-cyan-300">
                  <input
                    type="checkbox"
                    checked={includeAutoTiles}
                    onChange={(e) => setIncludeAutoTiles(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  <span>Generate 16-Variant 4-Bit Marching Squares Auto-Tile Set</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-emerald-300">
                  <input
                    type="checkbox"
                    checked={includeStateTextures}
                    onChange={(e) => setIncludeStateTextures(e.target.checked)}
                    className="accent-emerald-400"
                  />
                  <span>Generate 5 Environmental State Textures (Pristine/Damaged/Destroyed/Overgrown/Corrupted)</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase text-cyan-400 self-start">
                2×2 Seamless Toroidal Preview
              </span>
              <div
                className="w-40 h-40 rounded border border-cyan-800 shadow-inner"
                style={{
                  backgroundImage: liveTilePreviewUrl ? `url("${liveTilePreviewUrl}")` : 'none',
                  backgroundSize: '50% 50%',
                  backgroundRepeat: 'repeat'
                }}
              />
              <div className="w-full text-[11px] space-y-1 text-slate-300 border-t border-slate-800 pt-2">
                <div>Family: <span className="text-cyan-300">{TILE_FAMILY_METADATA[tileRecipe.family]?.label}</span></div>
                <div>Material: <span className="text-cyan-300">{tileRecipe.vtt.material}</span> ({tileRecipe.vtt.movementCost}x move)</div>
                {tileRecipe.vtt.isHazard && (
                  <div className="text-amber-300">Hazard: {tileRecipe.vtt.damageFormula} (DC {tileRecipe.vtt.saveDc})</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2 px-4 py-3 bg-slate-950 border-t border-slate-800 text-xs font-mono">
          {selectedUnitName && onApplyToSelected && (
            <button
              type="button"
              onClick={() => {
                onApplyToSelected(tileRecipe, { includeAutoTiles, includeStateTextures });
                onClose();
              }}
              className="px-3 py-1.5 rounded bg-cyan-900 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 font-semibold"
            >
              Apply to &quot;{selectedUnitName}&quot;
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onMintNewUnit(tileRecipe, { includeAutoTiles, includeStateTextures });
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg"
          >
            ✨ Mint New AssetUnit to Catalog
          </button>
        </div>
      </div>
    </div>
  );
};

export default TileSynthesizerModal;
