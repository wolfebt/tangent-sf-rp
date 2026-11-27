/**
 * @file TheaterSceneViewport.tsx
 * @description Cinematic Alchemy-style Theater-of-the-Mind Scene Mode for Stage.
 * Renders full-bleed scene backdrop (image or looping video), atmospheric particle glow,
 * Spotlight NPC/Persona cards, Read-Aloud teleprompter, quick 2d10 check roller, and Story Flags.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Dices, Flag, Sparkles, User, Map as MapIcon, Mic } from 'lucide-react';
import { resolveTangent2d10Check } from '../../../engine/rules/CanonicalCombatMath';
import { VttEventBus } from '../../../utils/vttEventBus';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { useAdeStore } from '../../../pages/Foundry/store/adeStore';
import { AudioService } from '../../../services/audioService';
import { normalizeElementType } from '../../../pages/Foundry/ElementForge/elementSchemas';

export interface TheaterSceneViewportProps {
  currentMap?: any;
  activeScenario?: any;
  tokens?: any[];
  elementsCatalog?: any[];
  activeSpeakers?: Array<{ identity: string; name?: string }>;
  isArchitect?: boolean;
  onSwitchMode?: (mode: '2d' | '3d' | 'theater') => void;
}

export const TheaterSceneViewport: React.FC<TheaterSceneViewportProps> = ({
  currentMap,
  activeScenario,
  tokens = [],
  elementsCatalog = [],
  activeSpeakers = [],
  isArchitect = true,
  onSwitchMode
}) => {
  const storyFlags = useAdeStore((s) => s.storyFlags);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [lastCheckResult, setLastCheckResult] = useState<string | null>(null);
  const [showReadAloud, setShowReadAloud] = useState<boolean>(true);
  const [isNarrationExpanded, setIsNarrationExpanded] = useState<boolean>(false);
  const [quickRollMod, setQuickRollMod] = useState<number>(4);
  const [quickRollCr, setQuickRollCr] = useState<number>(15);

  // Sync Theater Spotlight & Teleprompter visibility via Yjs session_meta
  useEffect(() => {
    const doc = getVttMultiplayerSync().getDocument();
    const meta = doc.getMap('session_meta');
    const syncFromMeta = () => {
      const remoteSpotlight = meta.get('theaterSpotlightId');
      if (remoteSpotlight !== undefined) {
        setSpotlightId(remoteSpotlight ? String(remoteSpotlight) : null);
      }
      const remoteTeleprompter = meta.get('theaterShowReadAloud');
      if (typeof remoteTeleprompter === 'boolean') {
        setShowReadAloud(remoteTeleprompter);
      }
    };
    syncFromMeta();
    meta.observe(syncFromMeta);
    return () => meta.unobserve(syncFromMeta);
  }, []);

  const handleToggleSpotlight = (charId: string) => {
    const nextId = spotlightId === charId ? null : charId;
    setSpotlightId(nextId);
    if (isArchitect) {
      const doc = getVttMultiplayerSync().getDocument();
      doc.transact(() => {
        doc.getMap('session_meta').set('theaterSpotlightId', nextId);
      }, 'local');
    }
  };

  const handleToggleTeleprompter = () => {
    const next = !showReadAloud;
    setShowReadAloud(next);
    if (isArchitect) {
      const doc = getVttMultiplayerSync().getDocument();
      doc.transact(() => {
        doc.getMap('session_meta').set('theaterShowReadAloud', next);
      }, 'local');
    }
  };

  const backdropVideoUrl = currentMap?.videoBackgroundUrl || currentMap?.videoUrl || '';
  const backdropImageUrl =
    currentMap?.background_url ||
    currentMap?.backgroundUrl ||
    currentMap?.backgroundImage ||
    currentMap?.underlayUrl ||
    currentMap?.underlay?.imageUrl ||
    activeScenario?.fields?.backdropUrl ||
    '';

  const readAloudText = useMemo(() => {
    const raw =
      activeScenario?.fields?.readAloud ||
      activeScenario?.summary ||
      activeScenario?.content ||
      'Systems humming softly along the bulkheads as emergency amber strobes sweep across the observation deck.';
    return String(raw).replace(/<[^>]+>/g, '');
  }, [activeScenario]);

  const spotlightCast = useMemo(() => {
    const visibleTokens = isArchitect
      ? tokens
      : tokens.filter((t: any) => !t?.is_hidden && !t?.isHidden && !t?.isGmOnly && t?.isPlayerVisible !== false);
    if (visibleTokens.length > 0) return visibleTokens;
    return (elementsCatalog || [])
      .filter((e: any) => normalizeElementType(e?.type) === 'Persona' && (isArchitect || (!e?.isHidden && !e?.isGmOnly && e?.fields?.playerVisible !== false)))
      .map((e: any) => ({
        id: e.id,
        name: e.title || e.name || 'Operative',
        archetype: e.fields?.archetype || 'Operative',
        image_url: e.fields?.imageUrl || e.imageUrl,
        is_persona: true
      }));
  }, [tokens, elementsCatalog, isArchitect]);

  const handleQuick2d10 = () => {
    const mod = Number.isFinite(quickRollMod) ? quickRollMod : 0;
    const cr = Number.isFinite(quickRollCr) ? quickRollCr : 15;
    const res = resolveTangent2d10Check({ modifier: mod, targetCR: cr, isOpposed: false });
    const msg = `2d10 (${res.d1}+${res.d2}) ${mod >= 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`} = ${res.total} vs CR ${cr} — ${res.isCrit ? 'CRIT!' : res.isFumble ? 'GLITCH' : res.isSuccess ? 'SUCCESS' : 'MISS'}`;
    setLastCheckResult(msg);
    const card = {
      id: `theater_roll_${Date.now()}`,
      timestamp: new Date().toISOString(),
      sender: 'Theater Scene',
      visibility: 'public' as const,
      kind: 'dice' as const,
      title: `${activeScenario?.title || 'Theater'} Check`,
      body: msg,
      diceBreakdown: {
        d1: res.d1,
        d2: res.d2,
        modifier: mod,
        total: res.total,
        dcOrCr: cr,
        outcome: res.isCrit ? 'CRIT' : res.isFumble ? 'GLITCH' : res.isSuccess ? 'SUCCESS' : 'MISS',
        crit: res.isCrit,
        fumble: res.isFumble
      }
    };
    VttEventBus.emit('stage-chat-card', card);
    getVttMultiplayerSync().broadcastChatCard(card);
    AudioService.playCriticalChime(res.isSuccess);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#060914] via-[#0c152b] to-[#140c24] text-slate-100 select-none flex flex-col justify-between">
      {/* Backdrop Visual Media */}
      {backdropVideoUrl ? (
        <video
          src={backdropVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
      ) : backdropImageUrl ? (
        <img
          src={backdropImageUrl}
          alt={currentMap?.title || 'Theater Scene'}
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 22% 30%, rgba(34,211,238,0.22), transparent 45%), radial-gradient(circle at 78% 72%, rgba(168,85,247,0.24), transparent 50%)'
          }}
        />
      )}

      {/* Atmospheric vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/35 to-[#050811]/70 pointer-events-none" />

      {/* Top Narrative Telemetry Bar */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between gap-2 flex-wrap font-mono">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-purple-500/40 rounded-xl px-3 py-1.5">
          <Sparkles size={13} className="text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Theater Mode · {activeScenario?.title || currentMap?.title || 'Narrative Encounter'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeSpeakers.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/85 border border-emerald-400/50 text-emerald-200 text-[10.5px]">
              <Mic size={11} className="text-emerald-400 animate-pulse" />
              <span>{activeSpeakers.map((s) => s.name || s.identity).join(', ')}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleTeleprompter}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 border border-amber-500/40 text-amber-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen size={12} />
            <span>{showReadAloud ? 'Hide Teleprompter' : 'Show Teleprompter'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-950/85 border border-emerald-500/40 rounded-xl px-2 py-1">
            <label className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Mod</span>
              <input
                type="number"
                aria-label="Quick 2d10 Modifier"
                value={quickRollMod}
                onChange={(e) => setQuickRollMod(parseInt(e.target.value, 10) || 0)}
                className="w-10 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[11px] text-emerald-300 text-center"
              />
            </label>
            <label className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>CR</span>
              <input
                type="number"
                aria-label="Quick 2d10 Target CR"
                value={quickRollCr}
                onChange={(e) => setQuickRollCr(parseInt(e.target.value, 10) || 15)}
                className="w-10 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[11px] text-amber-300 text-center"
              />
            </label>
            <button
              type="button"
              onClick={handleQuick2d10}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Dices size={12} />
              <span>Quick 2d10</span>
            </button>
          </div>

          {onSwitchMode && (
            <button
              type="button"
              onClick={() => onSwitchMode('2d')}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950/85 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <MapIcon size={12} />
              <span>Return to 2D Grid</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Read-Aloud Teleprompter & Roll Readout */}
      <div className="relative z-10 px-6 flex flex-col items-center justify-center gap-4 max-w-3xl mx-auto">
        {showReadAloud && (
          <div className="w-full p-5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-amber-500/35 shadow-[0_0_40px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                Scene Narration · Read-Aloud Box
              </div>
              {readAloudText.length > 300 && (
                <button
                  type="button"
                  onClick={() => setIsNarrationExpanded((v) => !v)}
                  className="text-[10px] font-mono text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  {isNarrationExpanded ? 'Collapse' : 'Expand'}
                </button>
              )}
            </div>
            <div className={isNarrationExpanded ? 'max-h-72 overflow-y-auto pr-1' : 'max-h-48 overflow-y-auto pr-1'}>
              <p className="text-base md:text-lg font-serif italic text-slate-100 leading-relaxed">
                &ldquo;{readAloudText}&rdquo;
              </p>
            </div>
          </div>
        )}

        {lastCheckResult && (
          <div className="px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-400/50 text-emerald-200 font-mono text-xs font-bold shadow-lg">
            {lastCheckResult}
          </div>
        )}
      </div>

      {/* Bottom Cast Spotlight Cards & Active Story Flags */}
      <div className="relative z-10 px-4 py-3 space-y-2.5">
        {isArchitect && Object.keys(storyFlags || {}).length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
            <Flag size={11} className="text-cyan-400" />
            {Object.entries(storyFlags).slice(0, 6).map(([key, rec]) => (
              <span
                key={key}
                className="px-2 py-0.5 rounded-full bg-slate-950/85 border border-cyan-500/30 text-cyan-200"
              >
                {key}: {String((rec as any)?.value ?? rec)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {spotlightCast.map((char: any) => {
            const isActive = spotlightId === char.id;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => handleToggleSpotlight(char.id)}
                className={`min-w-[165px] p-2.5 rounded-2xl border backdrop-blur-md text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-cyan-950/85 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.4)] -translate-y-1'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {char.image_url ? (
                    <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-cyan-400" />
                  )}
                </div>
                <div className="min-w-0 font-mono">
                  <div className="text-xs font-bold text-white truncate">{char.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {char.archetype || (char.is_persona ? 'Operative' : 'Cast')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TheaterSceneViewport;
