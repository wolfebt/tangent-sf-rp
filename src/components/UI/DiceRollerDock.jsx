import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dices, 
  X, 
  Target, 
  RotateCcw, 
  Radio, 
  Shield, 
  Users, 
  Globe, 
  Hash, 
  Sparkles, 
  Scale, 
  Flame, 
  Skull,
  ChevronDown,
  ChevronUp,
  Tag,
  Bookmark,
  BookmarkPlus,
  Trash2
} from 'lucide-react';
import { TwoD10Icon } from './TwoD10Icon';
import { rollDice, targetDCs } from '../../services/diceService';
import { AudioService } from '../../services/audioService';
import { useChat } from '../../context/ChatContext';
import { useDice } from '../../context/DiceContext';
import { PersonaLogService, ACTION_TYPES } from '../../services/personaLogService';

const PRESET_DICE = [
  { label: 'd4', expr: '1d4' },
  { label: 'd6', expr: '1d6' },
  { label: 'd8', expr: '1d8' },
  { label: 'd10', expr: '1d10' },
  { label: 'd12', expr: '1d12' },
  { label: 'd20', expr: '1d20' },
  { label: '2d10', expr: '2d10' }
];

export const DiceRollerDock = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { isDiceOpen, closeDiceRoller, diceConfig } = useDice();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isDiceOpen;
  const onClose = propOnClose || closeDiceRoller;

  const { 
    sendDiceRoll, 
    activeChannel, 
    activeChannelId, 
    groupChannels, 
    publicChannels, 
    customChannels, 
    directChannels, 
    channels 
  } = useChat();

  const [checkLabel, setCheckLabel] = useState('');
  const [baseModifier, setBaseModifier] = useState(0);
  const [adHocModifier, setAdHocModifier] = useState(0);
  
  // Clamped Dice Pool Engine States
  const [advantageDice, setAdvantageDice] = useState(0); // Clamped -5 to +5
  const [critRangeSize, setCritRangeSize] = useState(1); // Clamped 1 to 5 (threshold: 21 - critRangeSize)
  const [fumbleRangeSize, setFumbleRangeSize] = useState(1); // Clamped 1 to 5 (threshold: 1 + fumbleRangeSize)
  const [targetDC, setTargetDC] = useState('');
  const [showCustomRollAccordion, setShowCustomRollAccordion] = useState(false);

  const [customExpr, setCustomExpr] = useState('2d10');
  const [history, setHistory] = useState([]);
  const [latestRoll, setLatestRoll] = useState(null);
  const [broadcastToChat, setBroadcastToChat] = useState(false);
  const [hasUsedBroadcast, setHasUsedBroadcast] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [characterName, setCharacterName] = useState('Operative');

  // User-saved custom dice strings (persisted in localStorage)
  const [savedDiceStrings, setSavedDiceStrings] = useState(() => {
    try {
      const stored = localStorage.getItem('tangent_saved_dice_strings');
      return stored ? JSON.parse(stored) : [
        { id: 'preset-1', expr: '2d10+4', label: 'Tactical Check' },
        { id: 'preset-2', expr: '1d20+5', label: 'Polyhedral D20' }
      ];
    } catch {
      return [];
    }
  });

  const lastAutoRollIdRef = useRef(null);
  const initialBaseModRef = useRef(0);
  const initialLabelRef = useRef('');
  const initialTargetDCRef = useRef('');

  // Synchronize when diceConfig changes from an external trigger (stat/skill/ability click)
  useEffect(() => {
    if (!diceConfig) return;

    const lbl = diceConfig.label || '';
    setCheckLabel(lbl);
    initialLabelRef.current = lbl;

    const bModRaw = diceConfig.baseModifier !== undefined
      ? Number(diceConfig.baseModifier) || 0
      : (diceConfig.modifier !== undefined ? Number(diceConfig.modifier) || 0 : 0);
    const bMod = Math.max(-20, Math.min(20, bModRaw));
    initialBaseModRef.current = bMod;
    setBaseModifier(bMod);

    const aMod = diceConfig.adHocModifier !== undefined ? Number(diceConfig.adHocModifier) || 0 : 0;

    // Enforce +/- 20 flat modifier boundary
    const clampedTotal = Math.max(-20, Math.min(20, bMod + aMod));
    setAdHocModifier(clampedTotal - bMod);

    // Enforce +/- 5 advantage dice boundary
    let advDice = 0;
    if (diceConfig.advantageDice !== undefined) {
      advDice = Number(diceConfig.advantageDice) || 0;
    } else if (diceConfig.rollMode === 'advantage') {
      advDice = 1;
    } else if (diceConfig.rollMode === 'disadvantage') {
      advDice = -1;
    }
    setAdvantageDice(Math.max(-5, Math.min(5, advDice)));

    // Enforce 1-5 threat range size boundaries
    if (diceConfig.critRangeSize !== undefined) {
      setCritRangeSize(Math.max(1, Math.min(5, Number(diceConfig.critRangeSize) || 1)));
    }
    if (diceConfig.fumbleRangeSize !== undefined) {
      setFumbleRangeSize(Math.max(1, Math.min(5, Number(diceConfig.fumbleRangeSize) || 1)));
    }

    const dcVal = diceConfig.targetDC !== undefined 
      ? diceConfig.targetDC 
      : (diceConfig.targetNumber !== undefined ? diceConfig.targetNumber : '');
    setTargetDC(dcVal);
    initialTargetDCRef.current = dcVal;

    if (diceConfig.characterName) setCharacterName(diceConfig.characterName);

    // Compute expression from formula or base + ad-hoc modifier
    let expr = diceConfig.expression;
    if (!expr) {
      expr = clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10';
    }
    setCustomExpr(expr);

    // Auto-roll if requested and this roll event is fresh
    if (diceConfig.autoRoll && diceConfig.rollId && diceConfig.rollId !== lastAutoRollIdRef.current) {
      lastAutoRollIdRef.current = diceConfig.rollId;
      handleRoll(expr, advDice, {
        ...diceConfig,
        expression: expr,
        baseModifier: bMod,
        adHocModifier: clampedTotal - bMod,
        advantageDice: advDice,
        critRangeSize: diceConfig.critRangeSize || 1,
        fumbleRangeSize: diceConfig.fumbleRangeSize || 1,
        targetDC: dcVal
      });
    }
  }, [diceConfig]);

  // Set default selected channel: prioritize group channel if available, then active channel
  useEffect(() => {
    if (selectedChannelId) return;
    if (diceConfig?.targetChannelId) {
      setSelectedChannelId(diceConfig.targetChannelId);
    } else if (groupChannels && groupChannels.length > 0) {
      setSelectedChannelId(groupChannels[0].id);
    } else if (activeChannelId) {
      setSelectedChannelId(activeChannelId);
    } else if (publicChannels && publicChannels.length > 0) {
      setSelectedChannelId(publicChannels[0].id);
    }
  }, [groupChannels, activeChannelId, publicChannels, diceConfig?.targetChannelId, selectedChannelId]);

  // Helper for Base Score changes (clamped to [-20, 20])
  const handleBaseScoreChange = (newVal) => {
    let raw;
    if (typeof newVal === 'string') {
      if (newVal === '' || newVal === '-') {
        raw = 0;
      } else {
        raw = parseInt(newVal, 10);
        if (isNaN(raw)) raw = 0;
      }
    } else {
      raw = Number(newVal) || 0;
    }

    const clampedBase = Math.max(-20, Math.min(20, raw));
    setBaseModifier(clampedBase);

    // Keep net total clamped [-20, 20]
    const clampedTotal = Math.max(-20, Math.min(20, clampedBase + adHocModifier));
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      const expr = clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10';
      setCustomExpr(expr);
    }
  };

  // Helper for Ad-Hoc / Situational Modifier changes (clamped to [-20, 20])
  const handleAdHocChange = (newVal) => {
    let raw;
    if (typeof newVal === 'string') {
      if (newVal === '' || newVal === '-') {
        raw = 0;
      } else {
        raw = parseInt(newVal, 10);
        if (isNaN(raw)) raw = 0;
      }
    } else {
      raw = Number(newVal) || 0;
    }

    const clampedAdHoc = Math.max(-20, Math.min(20, raw));
    setAdHocModifier(clampedAdHoc);

    // Keep net total clamped [-20, 20]
    const clampedTotal = Math.max(-20, Math.min(20, baseModifier + clampedAdHoc));
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      const expr = clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10';
      setCustomExpr(expr);
    }
  };

  // Comprehensive Reset: Clears all fields back to their base level score
  const handleResetAll = () => {
    const baseScore = initialBaseModRef.current ?? 0;
    const baseLabel = initialLabelRef.current ?? '';
    const baseDC = initialTargetDCRef.current ?? '';

    setBaseModifier(baseScore);
    setAdHocModifier(0);
    setAdvantageDice(0);
    setCritRangeSize(1);
    setFumbleRangeSize(1);
    setTargetDC(baseDC);
    setCheckLabel(baseLabel);

    const expr = baseScore !== 0 ? `2d10${baseScore > 0 ? '+' : ''}${baseScore}` : '2d10';
    setCustomExpr(expr);
  };

  const handleResetBaseScore = () => {
    const baseScore = initialBaseModRef.current ?? 0;
    setBaseModifier(baseScore);
    const clampedTotal = Math.max(-20, Math.min(20, baseScore + adHocModifier));
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      setCustomExpr(clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10');
    }
  };

  const handleResetAdHoc = () => {
    setAdHocModifier(0);
    const clampedTotal = Math.max(-20, Math.min(20, baseModifier));
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      setCustomExpr(clampedTotal !== 0 ? `2d10${clampedTotal > 0 ? '+' : ''}${clampedTotal}` : '2d10');
    }
  };

  // Save current custom formula & check label to localStorage
  const handleSaveCustomString = () => {
    const expr = (customExpr || '2d10').trim();
    const label = (checkLabel || '').trim();
    const newEntry = {
      id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      expr,
      label: label || expr
    };
    const updated = [newEntry, ...savedDiceStrings.filter(s => s.expr !== expr || s.label !== label)].slice(0, 15);
    setSavedDiceStrings(updated);
    try {
      localStorage.setItem('tangent_saved_dice_strings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save dice string to localStorage:', e);
    }
  };

  // Delete saved custom formula
  const handleDeleteSavedString = (id) => {
    const updated = savedDiceStrings.filter(s => s.id !== id);
    setSavedDiceStrings(updated);
    try {
      localStorage.setItem('tangent_saved_dice_strings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update saved dice strings in localStorage:', e);
    }
  };

  const handleRoll = async (expr = customExpr, overrideAdvantage = null, overrideConfig = null) => {
    // Resolve clamped advantageDice (-5 to +5)
    let adv = advantageDice;
    if (overrideAdvantage !== null && overrideAdvantage !== undefined) {
      adv = typeof overrideAdvantage === 'number' 
        ? overrideAdvantage 
        : (overrideAdvantage === 'advantage' ? 1 : overrideAdvantage === 'disadvantage' ? -1 : 0);
    } else if (overrideConfig?.advantageDice !== undefined) {
      adv = Number(overrideConfig.advantageDice) || 0;
    } else if (overrideConfig?.rollMode) {
      adv = overrideConfig.rollMode === 'advantage' ? 1 : overrideConfig.rollMode === 'disadvantage' ? -1 : 0;
    }
    const clampedAdv = Math.max(-5, Math.min(5, adv));

    // Resolve clamped flatModifier (-20 to +20)
    const bMod = overrideConfig?.baseModifier !== undefined ? Number(overrideConfig.baseModifier) || 0 : baseModifier;
    const aMod = overrideConfig?.adHocModifier !== undefined ? Number(overrideConfig.adHocModifier) || 0 : adHocModifier;
    const clampedFlatMod = Math.max(-20, Math.min(20, bMod + aMod));

    // Resolve clamped threat range sizes (1 to 5)
    const cSize = overrideConfig?.critRangeSize !== undefined 
      ? Math.max(1, Math.min(5, Number(overrideConfig.critRangeSize) || 1)) 
      : critRangeSize;
    const fSize = overrideConfig?.fumbleRangeSize !== undefined 
      ? Math.max(1, Math.min(5, Number(overrideConfig.fumbleRangeSize) || 1)) 
      : fumbleRangeSize;

    // Resolve target DC
    const dc = overrideConfig?.targetDC !== undefined 
      ? overrideConfig.targetDC 
      : (overrideConfig?.targetNumber !== undefined ? overrideConfig.targetNumber : targetDC);

    const cName = overrideConfig?.characterName || characterName || 'Operative';
    const cLabel = overrideConfig?.label || checkLabel || (
      clampedAdv > 0 
        ? `Advantage (+${clampedAdv}d10)` 
        : clampedAdv < 0 
        ? `Disadvantage (${clampedAdv}d10)` 
        : 'Tactical Check'
    );

    const result = rollDice(expr, {
      advantageDice: clampedAdv,
      flatModifier: clampedFlatMod,
      critRangeSize: cSize,
      fumbleRangeSize: fSize,
      targetDC: dc,
      targetNumber: dc,
      characterName: cName,
      label: cLabel
    });

    AudioService.playDiceRollSound();
    if (result.isCrit) AudioService.playCriticalChime(true);
    if (result.isFumble) AudioService.playCriticalChime(false);

    setLatestRoll(result);
    setHistory(prev => [result, ...prev.slice(0, 19)]);

    if (broadcastToChat && sendDiceRoll) {
      setHasUsedBroadcast(true);
      try {
        const targetChan = overrideConfig?.targetChannelId || selectedChannelId || activeChannelId;
        await sendDiceRoll({
          label: cLabel,
          expression: result.expression,
          total: result.finalTotal ?? result.total,
          finalTotal: result.finalTotal ?? result.total,
          naturalTotal: result.naturalTotal,
          rolls: result.rolls.map(r => r.value),
          dicePool: result.dicePool || result.rolls.map(r => r.value),
          keptDice: result.keptDice || [],
          modifier: result.appliedModifier ?? clampedFlatMod,
          appliedModifier: result.appliedModifier ?? clampedFlatMod,
          flatModifier: clampedFlatMod,
          adHocModifier: aMod,
          baseModifier: bMod,
          advantageDice: result.advantageDice ?? clampedAdv,
          critRangeSize: result.critRangeSize ?? cSize,
          fumbleRangeSize: result.fumbleRangeSize ?? fSize,
          critThreshold: result.critThreshold ?? (21 - cSize),
          fumbleThreshold: result.fumbleThreshold ?? (1 + fSize),
          isCritical: result.isCrit,
          isFumble: result.isFumble,
          isCrit: result.isCrit,
          isAdvantage: (result.advantageDice ?? clampedAdv) > 0,
          isDisadvantage: (result.advantageDice ?? clampedAdv) < 0,
          targetNumber: result.targetDC,
          targetDC: result.targetDC,
          isSuccess: result.isSuccess,
          outcome: result.outcome,
          margin: result.margin
        }, targetChan);
      } catch (err) {
        console.warn('Failed to broadcast roll to chat:', err);
      }
    }

    // Auto-log to Persona Telemetry Log if personaId is attached
    const targetPersonaId = overrideConfig?.personaId || diceConfig?.personaId;
    if (targetPersonaId) {
      PersonaLogService.logAction({
        personaId: targetPersonaId,
        personaName: cName,
        actionType: ACTION_TYPES.SKILL_CHECK,
        summary: `${cLabel}: ${result.finalTotal} (${result.expression})${result.isCrit ? ' [CRITICAL SUCCESS]' : result.isFumble ? ' [CRITICAL FUMBLE]' : ''}`,
        details: {
          expression: result.expression,
          dicePool: result.dicePool,
          keptDice: result.keptDice,
          rolls: result.rolls,
          naturalTotal: result.naturalTotal,
          total: result.finalTotal,
          modifier: result.appliedModifier,
          critThreshold: result.critThreshold,
          fumbleThreshold: result.fumbleThreshold,
          isCritical: result.isCrit,
          isFumble: result.isFumble,
          advantageDice: result.advantageDice,
          outcome: result.outcome,
          margin: result.margin
        },
        actorId: 'player',
        actorHandle: cName
      }).catch(() => {});
    }
  };

  if (!isOpen) return null;

  const totalCalculatedMod = Math.max(-20, Math.min(20, baseModifier + adHocModifier));
  const currentCritThreshold = 21 - critRangeSize;
  const currentFumbleThreshold = 1 + fumbleRangeSize;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 w-[calc(100vw-1.5rem)] max-w-[540px] sm:w-[460px] max-h-[92vh] overflow-y-auto bg-[#0d1117]/95 backdrop-blur-md border border-amber-500/60 rounded-xl shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.3)] p-3 sm:p-4 flex flex-col gap-2.5 font-sans select-none animate-slide-up no-scrollbar">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
        <div className="flex items-center gap-2 min-w-0">
          <TwoD10Icon className="text-amber-400 shrink-0" size={18} />
          <div className="min-w-0">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-amber-300 truncate">
              {checkLabel ? checkLabel : 'TANGENT 2D10 ROLLER'}
            </h3>
            {checkLabel && (
              <span className="text-[9px] text-slate-400 font-mono block truncate">
                Base: {baseModifier >= 0 ? `+${baseModifier}` : baseModifier}
                {adHocModifier !== 0 && ` • Ad Hoc: ${adHocModifier > 0 ? `+${adHocModifier}` : adHocModifier}`}
                {` • Net: ${totalCalculatedMod >= 0 ? `+${totalCalculatedMod}` : totalCalculatedMod}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleRoll('2d10')}
            className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black text-xs font-mono rounded-lg uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300/80 flex items-center gap-1.5 cursor-pointer"
            title="Execute 2d10 Check with current modifiers & DC"
          >
            <TwoD10Icon size={14} className="text-slate-950" />
            <span>CHECK</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="px-2 py-1 bg-slate-800/90 hover:bg-slate-700 hover:text-amber-300 text-slate-300 text-xs font-mono font-bold rounded-lg border border-slate-700 hover:border-amber-500/50 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Reset all fields back to base level score"
          >
            <RotateCcw size={12} className="text-amber-400" />
            <span>RESET</span>
          </button>

          {history.length > 0 && (
            <button 
              type="button"
              onClick={() => { setHistory([]); setLatestRoll(null); }} 
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear Roll History"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Tray"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Check Purpose / Chat Identifier Field (Editable) */}
      <div className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Tag size={11} className="text-amber-400" />
          <span>Purpose / Chat ID:</span>
        </span>
        <input
          type="text"
          value={checkLabel}
          onChange={(e) => setCheckLabel(e.target.value)}
          placeholder="Check Label / Chat ID (e.g. Might +5, Pilot +10)"
          className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
          title="Editable check purpose sent to chat comms and telemetry"
        />
        {checkLabel && (
          <button
            type="button"
            onClick={() => setCheckLabel('')}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Clear check label"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* 1. Dice Pool Modifier Block (-5 to +5 range with Standard to reset) */}
      <div className="space-y-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Scale size={11} className="text-amber-400" />
            <span>Dice Pool Modifier:</span>
          </span>
          <span className={`text-[9.5px] font-bold ${
            advantageDice > 0 ? 'text-emerald-400' : advantageDice < 0 ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {advantageDice > 0 
              ? `ADVANTAGE (+${advantageDice}d10: roll ${2 + advantageDice}, keep 2 highest)`
              : advantageDice < 0
              ? `DISADVANTAGE (${advantageDice}d10: roll ${2 + Math.abs(advantageDice)}, keep 2 lowest)`
              : 'STANDARD (2d10 single check)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Standard Reset Button */}
          <button
            type="button"
            onClick={() => setAdvantageDice(0)}
            className={`w-28 py-1.5 rounded font-mono text-[10.5px] font-bold transition-all border text-center cursor-pointer shrink-0 ${
              advantageDice === 0
                ? 'bg-slate-800 text-slate-200 border-slate-600 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Reset to Standard (2d10)"
          >
            Standard (0)
          </button>

          {/* Incremental Value Field (-5 to +5) */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 px-2 flex-1 justify-between">
            <button
              type="button"
              disabled={advantageDice <= -5}
              onClick={() => setAdvantageDice(prev => Math.max(-5, prev - 1))}
              className="w-7 h-6 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold cursor-pointer transition-colors"
              title="Decrease dice pool (-1, min -5)"
            >
              -
            </button>

            <input
              type="number"
              min={-5}
              max={5}
              value={advantageDice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setAdvantageDice(Math.max(-5, Math.min(5, val)));
                } else if (e.target.value === '' || e.target.value === '-') {
                  setAdvantageDice(0);
                }
              }}
              className={`w-14 text-center bg-transparent py-0.5 text-xs font-mono font-bold focus:outline-none ${
                advantageDice > 0 ? 'text-emerald-300' : advantageDice < 0 ? 'text-rose-300' : 'text-slate-300'
              }`}
              title="Advantage / Disadvantage extra dice pool (-5 to +5)"
            />

            <button
              type="button"
              disabled={advantageDice >= 5}
              onClick={() => setAdvantageDice(prev => Math.min(5, prev + 1))}
              className="w-7 h-6 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold cursor-pointer transition-colors"
              title="Increase dice pool (+1, max +5)"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 2. Modifier Engine Block: Base Score + Ad-Hoc / Situational Mod */}
      <div className="space-y-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="font-bold text-amber-400/90 uppercase tracking-wider">Modifier Engine:</span>
          <span className="text-[9px] text-cyan-300">
            Base ({baseModifier >= 0 ? `+${baseModifier}` : baseModifier}) + Mod ({adHocModifier >= 0 ? `+${adHocModifier}` : adHocModifier}) = <strong className="text-amber-300">Net {totalCalculatedMod >= 0 ? `+${totalCalculatedMod}` : totalCalculatedMod}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Base Score (From Folio Check or Custom Input) */}
          <div className="space-y-1 bg-slate-900/70 p-1.5 rounded border border-slate-800/80">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span className="font-bold text-amber-300 uppercase">Base Score:</span>
              <button
                type="button"
                onClick={handleResetBaseScore}
                className="text-[8px] text-slate-500 hover:text-amber-300 transition-colors cursor-pointer"
                title={`Reset Base Score to base level (${initialBaseModRef.current >= 0 ? `+${initialBaseModRef.current}` : initialBaseModRef.current})`}
              >
                Reset ({initialBaseModRef.current !== 0 ? (initialBaseModRef.current > 0 ? `+${initialBaseModRef.current}` : initialBaseModRef.current) : '0'})
              </button>
            </div>
            <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded p-0.5 px-1 justify-between">
              <button
                type="button"
                disabled={baseModifier <= -20}
                onClick={() => handleBaseScoreChange(baseModifier - 1)}
                className="w-6 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold cursor-pointer transition-colors"
                title="Decrease base score (-1, min -20)"
              >
                -
              </button>
              <input
                type="number"
                min={-20}
                max={20}
                value={baseModifier}
                onChange={(e) => handleBaseScoreChange(e.target.value)}
                className="w-12 text-center bg-transparent py-0.5 text-xs font-mono font-bold text-amber-300 focus:outline-none"
                title="Base Score (-20 to +20)"
              />
              <button
                type="button"
                disabled={baseModifier >= 20}
                onClick={() => handleBaseScoreChange(baseModifier + 1)}
                className="w-6 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold cursor-pointer transition-colors"
                title="Increase base score (+1, max +20)"
              >
                +
              </button>
            </div>
          </div>

          {/* Ad-Hoc / Situational Modifier */}
          <div className="space-y-1 bg-slate-900/70 p-1.5 rounded border border-slate-800/80">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span className="font-bold text-cyan-300 uppercase">Ad-Hoc Mod:</span>
              <button
                type="button"
                onClick={handleResetAdHoc}
                className="text-[8px] text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Clear Ad-Hoc Modifier to 0"
              >
                Clear (0)
              </button>
            </div>
            <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded p-0.5 px-1 justify-between">
              <button
                type="button"
                disabled={adHocModifier <= -20}
                onClick={() => handleAdHocChange(adHocModifier - 1)}
                className="w-6 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold cursor-pointer transition-colors"
                title="Decrease ad-hoc modifier (-1, min -20)"
              >
                -
              </button>
              <input
                type="number"
                min={-20}
                max={20}
                value={adHocModifier}
                onChange={(e) => handleAdHocChange(e.target.value)}
                className="w-12 text-center bg-transparent py-0.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                title="Ad-Hoc / Situational Modifier (-20 to +20)"
              />
              <button
                type="button"
                disabled={adHocModifier >= 20}
                onClick={() => handleAdHocChange(adHocModifier + 1)}
                className="w-6 h-5 flex items-center justify-center rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold cursor-pointer transition-colors"
                title="Increase ad-hoc modifier (+1, max +20)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Threat Ranges (Permanently Visible) */}
      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 space-y-1.5 text-[10px] font-mono">
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-amber-400" />
            <span>Threat Ranges:</span>
          </span>
          <span className="text-[9px] text-slate-400">
            Crit: <strong className="text-amber-300">&ge;{currentCritThreshold}</strong> ({critRangeSize}pt) • Fumble: <strong className="text-red-400">&le;{currentFumbleThreshold}</strong> ({fumbleRangeSize}pt)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
          {/* Crit Threat Range Stepper */}
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-1.5 rounded">
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Flame size={11} className="text-amber-400" />
              <span>Crit (&ge;{currentCritThreshold})</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={critRangeSize <= 1}
                onClick={() => setCritRangeSize(prev => Math.max(1, prev - 1))}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer"
                title="Shrink Crit Range (min 1 pt: 20 only)"
              >
                -
              </button>
              <span className="w-5 text-center font-bold text-amber-400">{critRangeSize}</span>
              <button
                type="button"
                disabled={critRangeSize >= 5}
                onClick={() => setCritRangeSize(prev => Math.min(5, prev + 1))}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer"
                title="Expand Crit Range (max 5 pts: 16-20)"
              >
                +
              </button>
            </div>
          </div>

          {/* Fumble Threat Range Stepper */}
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-1.5 rounded">
            <span className="text-red-400 font-bold flex items-center gap-1">
              <Skull size={11} className="text-red-400" />
              <span>Fumble (&le;{currentFumbleThreshold})</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={fumbleRangeSize <= 1}
                onClick={() => setFumbleRangeSize(prev => Math.max(1, prev - 1))}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer"
                title="Shrink Fumble Range (min 1 pt: 2 only)"
              >
                -
              </button>
              <span className="w-5 text-center font-bold text-red-400">{fumbleRangeSize}</span>
              <button
                type="button"
                disabled={fumbleRangeSize >= 5}
                onClick={() => setFumbleRangeSize(prev => Math.min(5, prev + 1))}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer"
                title="Expand Fumble Range (max 5 pts: 2-6)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Target Difficulty Class (DC) Presets (Fully Visible Block Grid) */}
      <div className="space-y-1 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
          <span className="font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1">
            <Target size={11} className="text-amber-400" />
            <span>Target DC:</span>
          </span>
          <span className="text-[9px] text-slate-400">
            {targetDC !== '' ? `Active DC: ${targetDC}` : 'No target DC set'}
          </span>
        </div>

        {/* 4x2 Grid of all 8 Difficulty Classes (Fully Visible Block) */}
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(targetDCs).map(([name, dcVal]) => {
            const isSelected = String(targetDC) === String(dcVal) || String(targetDC).toLowerCase() === name.toLowerCase();
            return (
              <button
                key={name}
                type="button"
                onClick={() => setTargetDC(isSelected ? '' : dcVal)}
                className={`py-1 px-1 rounded text-[9.5px] font-mono font-bold text-center transition-all border cursor-pointer truncate ${
                  isSelected
                    ? 'bg-amber-500/30 text-amber-200 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={`${name.toUpperCase()} DC: ${dcVal}`}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)} ({dcVal})
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 & 6. Quick & Custom Polyhedral Rolls Accordion (Collapsed by Default) */}
      <div className="bg-slate-950/70 rounded-lg border border-slate-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCustomRollAccordion(prev => !prev)}
          className="w-full p-2 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 hover:text-amber-300 transition-colors cursor-pointer select-none"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-amber-400/90">
            <Dices size={12} className="text-amber-400" />
            <span>Quick & Custom Polyhedral Rolls</span>
          </span>
          <span className="flex items-center gap-1 text-[9px] text-slate-500 font-normal">
            <span>{showCustomRollAccordion ? 'Collapse' : 'Expand'}</span>
            {showCustomRollAccordion ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </button>

        {showCustomRollAccordion && (
          <div className="p-2 pt-0 space-y-2 border-t border-slate-800/80">
            {/* Quick Polyhedral Dice Row */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 mb-1">
                <span className="uppercase font-bold text-slate-400">Quick Polyhedral Die:</span>
                <span className="text-[9px] text-slate-500">Instant Roll</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {PRESET_DICE.map((p) => (
                  <button
                    key={p.expr}
                    type="button"
                    onClick={() => {
                      setCustomExpr(p.expr);
                      handleRoll(p.expr);
                    }}
                    className="py-1 px-1 rounded bg-slate-900/90 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 text-[11px] font-mono font-bold text-center transition-all cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Formula & Custom Check Button */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1">
                <span className="text-slate-500 text-xs font-mono mr-1">Roll:</span>
                <input
                  type="text"
                  value={customExpr}
                  onChange={(e) => setCustomExpr(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRoll(customExpr); }}
                  placeholder="2d10+4"
                  className="w-full bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
                />
              </div>

              <div className="w-20 flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                <Target size={12} className="text-slate-500 mr-1 shrink-0" />
                <input
                  type="number"
                  value={targetDC}
                  onChange={(e) => setTargetDC(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRoll(customExpr); }}
                  placeholder="DC"
                  className="w-full bg-transparent text-xs font-mono text-amber-300 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRoll(customExpr)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1"
                title="Roll custom dice formula"
              >
                <Dices size={13} />
                <span>Custom Check</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCustomString}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/70 text-slate-300 hover:text-amber-300 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Save current formula to your saved presets"
              >
                <BookmarkPlus size={14} />
              </button>
            </div>

            {/* Saved Custom Strings List */}
            {savedDiceStrings.length > 0 && (
              <div className="pt-2 border-t border-slate-800/60 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="uppercase font-bold text-amber-400/90 flex items-center gap-1">
                    <Bookmark size={10} className="text-amber-400" />
                    <span>Saved Dice Formulas:</span>
                  </span>
                  <span className="text-slate-500">{savedDiceStrings.length} saved</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {savedDiceStrings.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded px-1.5 py-0.5 text-[9.5px] font-mono transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCustomExpr(s.expr);
                          if (s.label) setCheckLabel(s.label);
                        }}
                        className="text-slate-300 hover:text-amber-200 font-bold truncate max-w-[130px] cursor-pointer"
                        title={`Load ${s.expr}${s.label ? ` (${s.label})` : ''}`}
                      >
                        {s.label ? `${s.label}: ${s.expr}` : s.expr}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSavedString(s.id);
                        }}
                        className="ml-1 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete saved formula"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Broadcast to Chat & Channel Selector (Strictly 1 Line with Glow Shadow Until Used) */}
      <div className="bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-[10px] font-mono">
        <button
          type="button"
          onClick={() => {
            setBroadcastToChat(prev => !prev);
            setHasUsedBroadcast(true);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-mono font-bold transition-all cursor-pointer border shrink-0 ${
            broadcastToChat
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : !hasUsedBroadcast
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.7)] animate-pulse ring-1 ring-cyan-400/50'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
          }`}
          title={broadcastToChat ? 'Broadcast active: rolls will be sent to chat' : 'Click to broadcast rolls to chat'}
        >
          <Radio size={12} className={broadcastToChat ? 'text-cyan-400 animate-pulse' : !hasUsedBroadcast ? 'text-cyan-300 animate-pulse' : 'text-slate-500'} />
          <span>Broadcast</span>
        </button>

        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
          <span className="text-[9.5px] text-slate-500 shrink-0">Channel:</span>
          <select
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            disabled={!broadcastToChat}
            className={`bg-slate-900 border rounded px-2 py-1 text-[10.5px] font-mono outline-none truncate max-w-[200px] transition-colors cursor-pointer ${
              broadcastToChat
                ? 'border-slate-700 text-slate-200 focus:border-cyan-400'
                : 'border-slate-800/80 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            {groupChannels && groupChannels.length > 0 && (
              <optgroup label="🌟 Game Group / Team Channels">
                {groupChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    🛡️ {c.displayName || c.name}
                  </option>
                ))}
              </optgroup>
            )}

            {publicChannels && publicChannels.length > 0 && (
              <optgroup label="🌐 Public CommLink Channels">
                {publicChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    # {c.displayName || c.name}
                  </option>
                ))}
              </optgroup>
            )}

            {customChannels && customChannels.length > 0 && (
              <optgroup label="💬 Custom Frequencies">
                {customChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    # {c.displayName || c.name}
                  </option>
                ))}
              </optgroup>
            )}

            {directChannels && directChannels.length > 0 && (
              <optgroup label="🔒 Direct Comms">
                {directChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    👤 {c.displayName || c.name}
                  </option>
                ))}
              </optgroup>
            )}

            {(!channels || channels.length === 0) && (
              <option value="public_general"># general-holonet</option>
            )}
          </select>
        </div>
      </div>

      {/* 8. Latest Result Banner (Compact VTT Transparency) */}
      {latestRoll && (
        <div className={`p-2.5 rounded-lg border transition-all ${
          latestRoll.isCrit 
            ? 'bg-gradient-to-r from-amber-950/80 via-slate-950/90 to-slate-950 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            : latestRoll.isFumble
            ? 'bg-gradient-to-r from-rose-950/80 via-slate-950/90 to-slate-950 border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
            : latestRoll.outcome === 'Overwhelming Success'
            ? 'bg-gradient-to-r from-cyan-950/80 via-slate-950/90 to-slate-950 border-cyan-500/70 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
            : latestRoll.outcome === 'Catastrophic Failure'
            ? 'bg-gradient-to-r from-red-950/80 via-slate-950/90 to-slate-950 border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            : 'bg-slate-900/90 border-slate-700 text-slate-100'
        }`}>
          {/* Header Row: Label + Expression + Outcome Badges Inline */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 gap-1.5 mb-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-200 truncate uppercase">{latestRoll.label || 'Action Check'}</span>
              <span className="text-slate-500 text-[9px] font-mono">({latestRoll.expression})</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {latestRoll.advantageDice !== 0 && (
                <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${
                  latestRoll.advantageDice > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {latestRoll.advantageDice > 0 
                    ? `+${latestRoll.advantageDice} ADV` 
                    : `${latestRoll.advantageDice} DISADV`}
                </span>
              )}

              {latestRoll.outcome ? (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                  latestRoll.outcome === 'Critical Success'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse'
                    : latestRoll.outcome === 'Critical Failure'
                    ? 'bg-red-500/20 text-red-300 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse'
                    : latestRoll.outcome === 'Overwhelming Success'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                    : latestRoll.outcome === 'Catastrophic Failure'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400'
                    : latestRoll.outcome === 'Success'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {latestRoll.outcome.toUpperCase()}
                </span>
              ) : (
                <>
                  {latestRoll.isCrit && (
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded text-[9px] font-bold animate-pulse">
                      CRITICAL
                    </span>
                  )}
                  {latestRoll.isFumble && (
                    <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded text-[9px] font-bold animate-pulse">
                      FUMBLE
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Core Result Row: Score & DC on Left, Dice Pool on Right */}
          <div className="flex items-center justify-between gap-2.5 py-1 px-2 bg-slate-950/60 rounded border border-slate-800/60 mb-1.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black font-mono tracking-tight text-white leading-none">
                {latestRoll.finalTotal ?? latestRoll.total}
              </span>
              {latestRoll.targetDC !== null && latestRoll.targetDC !== undefined && (
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[10px] text-slate-400">vs DC {latestRoll.targetDC}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] border leading-none ${
                    latestRoll.isCrit
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse'
                      : latestRoll.isFumble
                      ? 'bg-red-500/20 text-red-300 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse'
                      : (latestRoll.outcome ? latestRoll.outcome.includes('Success') : latestRoll.isSuccess)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {latestRoll.isCrit 
                      ? 'CRIT SUCCESS' 
                      : latestRoll.isFumble 
                      ? 'CRIT FUMBLE' 
                      : (latestRoll.outcome ? latestRoll.outcome.includes('Success') : latestRoll.isSuccess) 
                      ? 'SUCCESS' 
                      : 'FAILURE'}
                    {latestRoll.margin !== null && latestRoll.margin !== undefined && (
                      <span className="opacity-80 ml-1">({latestRoll.margin >= 0 ? `+${latestRoll.margin}` : latestRoll.margin})</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Compact Dice Pool Badges */}
            {latestRoll.dicePool && latestRoll.dicePool.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap justify-end">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight mr-0.5">Pool:</span>
                {(() => {
                  const keptCounts = {};
                  (latestRoll.keptDice || []).forEach(k => {
                    keptCounts[k] = (keptCounts[k] || 0) + 1;
                  });

                  return latestRoll.dicePool.map((val, idx) => {
                    let isKept = false;
                    if (keptCounts[val] && keptCounts[val] > 0) {
                      isKept = true;
                      keptCounts[val]--;
                    }

                    return (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono transition-all border flex items-center gap-0.5 ${
                          isKept
                            ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_6px_rgba(245,158,11,0.25)]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-40 line-through'
                        }`}
                        title={isKept ? 'Kept Die' : 'Dropped Die'}
                      >
                        <span>{val}</span>
                        {isKept && latestRoll.dicePool.length > 1 && (
                          <span className="text-[7.5px] uppercase tracking-tighter opacity-75">K</span>
                        )}
                      </span>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Telemetry Breakdown Strip */}
          <div className="flex items-center justify-center gap-2 text-[9.5px] font-mono text-slate-300 py-0.5 px-2 bg-slate-950/40 rounded border border-slate-800/40 flex-wrap">
            <span>Natural: <strong className="text-cyan-300">{latestRoll.naturalTotal ?? (latestRoll.keptDice ? latestRoll.keptDice[0] + (latestRoll.keptDice[1] || 0) : '-')}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Mod: <strong className="text-amber-300">{latestRoll.appliedModifier >= 0 ? `+${latestRoll.appliedModifier}` : latestRoll.appliedModifier}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Crit: <strong className="text-amber-400">&ge;{latestRoll.critThreshold}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Fumble: <strong className="text-red-400">&le;{latestRoll.fumbleThreshold}</strong></span>
          </div>

          {/* Slim Reroll Button */}
          <button
            type="button"
            onClick={() => handleRoll(latestRoll.expression, latestRoll.advantageDice ?? 0)}
            className="mt-1.5 w-full py-1 bg-amber-950/40 hover:bg-amber-900/70 border border-amber-500/30 text-amber-300 hover:text-amber-200 rounded text-[9.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Reroll this check"
          >
            <RotateCcw size={11} />
            <span>Reroll Check</span>
          </button>
        </div>
      )}

      {/* History Log */}
      {history.length > 1 && (
        <div className="max-h-24 overflow-y-auto space-y-1 pr-1 border-t border-slate-800 pt-1.5 no-scrollbar">
          {history.slice(1).map((h) => (
            <div key={h.id} className="flex justify-between items-center text-[10px] font-mono text-slate-400 p-1 bg-slate-900/40 rounded">
              <span className="truncate mr-2">
                {h.label ? `${h.label}: ` : ''}{h.expression} [{h.rolls.map(r => r.value).join(', ')}]
              </span>
              <span className="text-slate-200 font-bold shrink-0">{h.finalTotal ?? h.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiceRollerDock;
