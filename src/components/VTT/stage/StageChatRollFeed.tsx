/**
 * @file StageChatRollFeed.tsx
 * @description Interactive Pro VTT Roll Card & Combat Event Feed with visibility modes
 *   (Public / Whisper GM / Blind GM), 2d10 dice breakdown pills, and 1-click Apply Full /
 *   Apply Half / Heal / Roll Save action buttons.
 */

import React, { useEffect, useState } from 'react';
import { Shield, Heart, Zap, EyeOff, Lock, Globe, Send, Trash2 } from 'lucide-react';
import { VttEventBus, type VttEventMap } from '../../../utils/vttEventBus';
import { useEngineStore } from '../../../engine/state/VolatileSharder';
import { resolveTangent2d10Check } from '../../../engine/rules/CanonicalCombatMath';
import { DiceASTParser } from '../../../engine/math/DiceASTParser';
import { getVttMultiplayerSync } from '../../../services/vttMultiplayerSyncService';
import { AudioService } from '../../../services/audioService';
import { useUILayoutStore } from '../store/uiLayoutStore';

export type ChatRollCard = VttEventMap['stage-chat-card'];

export interface StageChatRollFeedProps {
  selectedToken?: any;
  targetToken?: any;
  userRole?: 'architect' | 'operative' | 'gm' | 'player' | 'spectator';
  compact?: boolean;
  useGlobalListener?: boolean;
}

export function sanitizeCardForRole(card: ChatRollCard, isArchitect: boolean): ChatRollCard | null {
  if (!card) return null;
  if (!isArchitect && card.visibility === 'whisper_gm' && card.remote) {
    return null;
  }
  if (!isArchitect && card.visibility === 'blind_gm') {
    return {
      id: card.id,
      timestamp: card.timestamp,
      sender: card.sender,
      ...(card.senderRole !== undefined ? { senderRole: card.senderRole } : {}),
      ...(card.senderId !== undefined ? { senderId: card.senderId } : {}),
      visibility: 'blind_gm',
      kind: card.kind,
      title: '[BLIND GM ROLL]',
      body: 'Resolved in secret by the Architect.',
      ...(card.remote !== undefined ? { remote: card.remote } : {})
    };
  }
  return card;
}

export const StageChatRollFeed: React.FC<StageChatRollFeedProps> = ({
  selectedToken = null,
  targetToken = null,
  userRole = 'architect',
  compact = false,
  useGlobalListener = true
}) => {
  const isArchitect = userRole === 'architect' || userRole === 'gm';
  const cards = useUILayoutStore((s) => s.stageChatCards);
  const pushStageChatCard = useUILayoutStore((s) => s.pushStageChatCard);
  const clearStageChatCards = useUILayoutStore((s) => s.clearStageChatCards);
  const [visibility, setVisibility] = useState<'public' | 'whisper_gm' | 'blind_gm'>('public');
  const [quickFormula, setQuickFormula] = useState('2d10 + 4');
  const [appliedCardIds, setAppliedCardIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!useGlobalListener) return undefined;
    const unsub = VttEventBus.on('stage-chat-card', (card) => {
      const safeCard = sanitizeCardForRole(card, isArchitect);
      if (safeCard) {
        pushStageChatCard(safeCard, false);
      }
    });
    const unsubChat = VttEventBus.on('chat-message', (msg) => {
      if (!msg || !msg.text) return;
      const card: ChatRollCard = {
        id: (msg as any).id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: msg.timestamp || new Date().toISOString(),
        sender: msg.sender || 'Stage',
        visibility: 'public',
        kind: msg.type === 'system' ? 'system' : 'narration',
        title: (msg as any).title || msg.sender || 'Stage Comms',
        body: msg.text
      };
      pushStageChatCard(card, false);
    });
    return () => {
      unsub();
      unsubChat();
    };
  }, [isArchitect, useGlobalListener, pushStageChatCard]);

  const handleApplyDamageCard = (card: ChatRollCard, multiplier: number) => {
    if (!isArchitect) return;
    const dmgInfo = card.damagePayload;
    if (!dmgInfo) return;
    const recipientId = dmgInfo.targetTokenId || targetToken?.id || selectedToken?.id;
    if (!recipientId) return;

    const amount = Math.max(0, Math.round((dmgInfo.netDamage ?? dmgInfo.rawDamage ?? 0) * multiplier));
    const store = useEngineStore.getState();
    store.applyDamage(recipientId, { amount, isLethal: Boolean(dmgInfo.isLethal) });
    const eph = useEngineStore.getState().ephemeralData[recipientId];
    if (eph) {
      getVttMultiplayerSync().broadcastTokenVitals(recipientId, eph);
    }
    setAppliedCardIds((prev) => ({ ...prev, [card.id]: true }));
    AudioService.playTerminalBeep(multiplier < 0 ? 1300 : 750, 0.04);
  };

  const handleHealCard = (card: ChatRollCard) => {
    if (!isArchitect) return;
    const dmgInfo = card.damagePayload;
    if (!dmgInfo) return;
    const recipientId = dmgInfo.targetTokenId || selectedToken?.id || targetToken?.id;
    if (!recipientId) return;

    const amount = Math.max(1, Math.round(dmgInfo.netDamage ?? dmgInfo.rawDamage ?? 5));
    const store = useEngineStore.getState();
    store.healHP(recipientId, amount);
    const eph = useEngineStore.getState().ephemeralData[recipientId];
    if (eph) {
      getVttMultiplayerSync().broadcastTokenVitals(recipientId, eph);
    }
    AudioService.playCriticalChime(true);
  };

  const handleRollSave = (card: ChatRollCard) => {
    const targetCr = card.damagePayload?.saveCr || 15;
    const roller = targetToken || selectedToken;
    const saveMod = Number(roller?.saves?.reflex ?? roller?.stamina_dr ?? 2);
    const check = resolveTangent2d10Check({
      modifier: saveMod,
      targetCR: targetCr,
      isOpposed: false
    });
    const saveCard: ChatRollCard = {
      id: `save_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      sender: roller?.name || 'Combatant',
      visibility,
      kind: 'dice',
      title: `Save Check vs CR ${targetCr}`,
      body: `${roller?.name || 'Target'} rolled ${check.d1}+${check.d2} + ${saveMod} = ${check.total} (${check.isSuccess ? 'SAVED' : 'FAILED'})`,
      diceBreakdown: {
        d1: check.d1,
        d2: check.d2,
        modifier: saveMod,
        total: check.total,
        dcOrCr: targetCr,
        outcome: check.isCrit ? 'CRIT' : check.isFumble ? 'FUMBLE' : check.isSuccess ? 'SAVED' : 'FAILED',
        crit: check.isCrit,
        fumble: check.isFumble
      }
    };
    getVttMultiplayerSync().broadcastChatCard(saveCard);
    VttEventBus.emit('stage-chat-card', saveCard);
    AudioService.playCriticalChime(check.isSuccess);
  };

  const handleQuickRoll = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = quickFormula.trim();
    if (!raw) return;

    const tangentMatch = raw.match(/^(?:\/roll\s+|\/r\s+)?2d10(?:\s*([+-]\s*\d+))?(?:\s*(?:vs|cr|dc)\s*(\d+))?$/i);
    const arbitraryDiceMatch = raw.match(/^(?:\/roll\s+|\/r\s+)?(\d*d\d+(?:\s*[+-]\s*(?:\d*d\d+|\d+))*)$/i);

    let card: ChatRollCard;
    if (tangentMatch) {
      const mod = tangentMatch[1] ? parseInt(tangentMatch[1].replace(/\s+/g, ''), 10) : 0;
      const targetCr = tangentMatch[2] ? parseInt(tangentMatch[2], 10) : 15;
      const check = resolveTangent2d10Check({ modifier: mod, targetCR: targetCr, isOpposed: false });
      card = {
        id: `roll_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        sender: selectedToken?.name || (isArchitect ? 'Architect' : 'Operative'),
        visibility,
        kind: 'dice',
        title: `2d10 Check (${raw})`,
        body: `Rolled [${check.d1}, ${check.d2}] ${mod >= 0 ? `+${mod}` : mod} => ${check.total} vs CR ${targetCr}`,
        diceBreakdown: {
          d1: check.d1,
          d2: check.d2,
          modifier: mod,
          total: check.total,
          dcOrCr: targetCr,
          outcome: check.isCrit ? 'CRIT +10' : check.isFumble ? 'GLITCH -10' : check.isSuccess ? 'SUCCESS' : 'MISS',
          crit: check.isCrit,
          fumble: check.isFumble
        }
      };
    } else if (arbitraryDiceMatch && arbitraryDiceMatch[1]) {
      const expr = arbitraryDiceMatch[1].replace(/\s+/g, '');
      try {
        const res = new DiceASTParser().evaluateExpression(expr, selectedToken?.id);
        card = {
          id: `dice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sender: selectedToken?.name || (isArchitect ? 'Architect' : 'Operative'),
          visibility,
          kind: 'dice',
          title: `Roll (${expr})`,
          body: `Total: ${res.total} (${res.breakdown})`
        };
      } catch (err: any) {
        card = {
          id: `dice_err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sender: 'System',
          visibility: 'public',
          kind: 'system',
          title: `Invalid Dice Formula`,
          body: err?.message || `Could not parse "${expr}".`
        };
      }
    } else {
      card = {
        id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        sender: selectedToken?.name || (isArchitect ? 'Architect' : 'Operative'),
        visibility,
        kind: 'narration',
        title: isArchitect ? 'Architect Broadcast' : 'Operative Comms',
        body: raw
      };
      setQuickFormula('');
    }

    getVttMultiplayerSync().broadcastChatCard(card);
    VttEventBus.emit('stage-chat-card', card);
    AudioService.playTerminalBeep(1280, 0.04);
  };

  return (
    <div className="flex flex-col border-t border-slate-800 bg-slate-950/90 font-mono text-[10px]">
      {/* Quick Roll & Visibility Bar */}
      <form onSubmit={handleQuickRoll} className="p-1.5 border-b border-slate-800/80 flex items-center gap-1">
        <select
          aria-label="Roll Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[9.5px] text-cyan-300 outline-none cursor-pointer"
        >
          <option value="public">Public</option>
          <option value="whisper_gm">Whisper GM</option>
          <option value="blind_gm">Blind GM</option>
        </select>
        <input
          type="text"
          value={quickFormula}
          onChange={(e) => setQuickFormula(e.target.value)}
          placeholder="2d10 + 4, 1d6+2, or chat message..."
          className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-emerald-300 outline-none"
        />
        <button
          type="submit"
          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1 cursor-pointer"
          title="Roll Formula or Send Chat Message"
        >
          <Send size={10} />
          <span>Send</span>
        </button>
        {isArchitect && cards.length > 0 && (
          <button
            type="button"
            onClick={() => clearStageChatCards()}
            className="p-1 rounded bg-slate-900 hover:bg-rose-950/60 border border-slate-700 text-slate-400 hover:text-rose-300 cursor-pointer"
            title="Clear Roll & Chat History"
            aria-label="Clear Roll Feed"
          >
            <Trash2 size={10} />
          </button>
        )}
      </form>

      {/* Interactive Roll Cards Stream */}
      <div className={`${compact ? 'max-h-40' : 'max-h-56'} overflow-y-auto p-1.5 space-y-1.5`}>
        {cards.length === 0 ? (
          <div className="text-[9.5px] text-slate-500 italic px-1 py-2 text-center">
            Roll cards, AoE blasts & combat checks appear here with 1-click Apply/Save actions.
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-cyan-300 truncate">{card.title}</span>
                <span className="flex items-center gap-1 text-[9px] text-slate-400 shrink-0">
                  {card.visibility === 'blind_gm' ? (
                    <EyeOff size={10} className="text-amber-400" />
                  ) : card.visibility === 'whisper_gm' ? (
                    <Lock size={10} className="text-purple-400" />
                  ) : (
                    <Globe size={10} className="text-emerald-400" />
                  )}
                  <span>{card.sender}</span>
                </span>
              </div>

              <div className="text-[10px] text-slate-300 leading-snug">{card.body}</div>

              {card.diceBreakdown && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[9.5px] font-bold ${
                      card.diceBreakdown.crit
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                        : card.diceBreakdown.fumble
                          ? 'bg-rose-950 border-rose-400 text-rose-300'
                          : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    {card.diceBreakdown.d1}+{card.diceBreakdown.d2} = {card.diceBreakdown.total}
                  </span>
                  {card.diceBreakdown.outcome && (
                    <span className="text-[9px] font-bold uppercase text-amber-300">
                      {card.diceBreakdown.outcome}
                    </span>
                  )}
                </div>
              )}

              {card.damagePayload && (isArchitect || card.visibility !== 'blind_gm') && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {isArchitect && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApplyDamageCard(card, 1)}
                        className="px-1.5 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-[9px] font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap size={9} /> Full
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyDamageCard(card, 0.5)}
                        className="px-1.5 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-[9px] font-bold cursor-pointer"
                      >
                        Half
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHealCard(card)}
                        className="px-1.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-[9px] font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Heart size={9} /> Heal
                      </button>
                      {(card.damagePayload.damageApplied || appliedCardIds[card.id]) && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[8.5px] font-bold">
                          Applied
                        </span>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRollSave(card)}
                    className="px-1.5 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-[9px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Shield size={9} /> Save
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StageChatRollFeed;
