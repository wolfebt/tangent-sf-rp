import React, { useState, useEffect, useMemo } from 'react';
import { Dices, X, Target, RotateCcw, Radio, Shield, Users, Globe, Hash, Sparkles, Scale } from 'lucide-react';
import { rollDice } from '../../services/diceService';
import { AudioService } from '../../services/audioService';
import { useChat } from '../../context/ChatContext';
import { useDice } from '../../context/DiceContext';

const PRESET_DICE = [
  { label: '2d10', expr: '2d10' },
  { label: 'd20', expr: '1d20' },
  { label: 'd100', expr: '1d100' },
  { label: 'd6', expr: '1d6' },
  { label: 'd8', expr: '1d8' },
  { label: 'd12', expr: '1d12' }
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
  const [customExpr, setCustomExpr] = useState('2d10');
  const [targetNumber, setTargetNumber] = useState('');
  const [history, setHistory] = useState([]);
  const [latestRoll, setLatestRoll] = useState(null);
  const [broadcastToChat, setBroadcastToChat] = useState(true);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [rollMode, setRollMode] = useState('normal'); // 'normal', 'advantage', 'disadvantage'
  const [characterName, setCharacterName] = useState('Operative');

  // Synchronize when diceConfig changes from an external trigger (stat/skill/offensive ability click)
  useEffect(() => {
    if (!diceConfig) return;

    if (diceConfig.label) setCheckLabel(diceConfig.label);
    const bMod = Number(diceConfig.baseModifier) || 0;
    const aMod = Number(diceConfig.adHocModifier) || 0;
    setBaseModifier(bMod);
    setAdHocModifier(aMod);

    if (diceConfig.targetNumber !== undefined) setTargetNumber(diceConfig.targetNumber);
    if (diceConfig.rollMode) setRollMode(diceConfig.rollMode);
    if (diceConfig.characterName) setCharacterName(diceConfig.characterName);

    // Compute expression from formula or base + ad-hoc modifier
    if (diceConfig.expression) {
      setCustomExpr(diceConfig.expression);
    } else {
      const totalMod = bMod + aMod;
      const expr = totalMod !== 0 ? `2d10${totalMod > 0 ? '+' : ''}${totalMod}` : '2d10';
      setCustomExpr(expr);
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

  // Update formula when baseModifier or adHocModifier changes, unless it's a completely custom non-2d10 dice formula
  const handleAdHocChange = (newAdHoc) => {
    const val = parseInt(newAdHoc, 10) || 0;
    setAdHocModifier(val);

    // If expression starts with 2d10, update with (baseModifier + val)
    if (customExpr.startsWith('2d10') || !customExpr.includes('d')) {
      const totalMod = baseModifier + val;
      const expr = totalMod !== 0 ? `2d10${totalMod > 0 ? '+' : ''}${totalMod}` : '2d10';
      setCustomExpr(expr);
    } else {
      // It's a damage formula like 3d8 or 2d6+2: adjust modifier if simple
      const match = customExpr.match(/^(\d+d\d+)([+-]\d+)?$/i);
      if (match) {
        const dicePart = match[1];
        const existingMod = match[2] ? parseInt(match[2], 10) : 0;
        const diff = val - adHocModifier;
        const newTotalMod = existingMod + diff;
        setCustomExpr(newTotalMod !== 0 ? `${dicePart}${newTotalMod > 0 ? '+' : ''}${newTotalMod}` : dicePart);
      }
    }
  };

  const handleRoll = async (expr = customExpr, overrideMode = null) => {
    const mode = overrideMode || rollMode;
    const tn = targetNumber ? parseInt(targetNumber, 10) : null;
    const result = rollDice(expr, {
      targetNumber: tn,
      advantage: mode === 'advantage',
      disadvantage: mode === 'disadvantage',
      characterName: characterName || 'Operative',
      label: checkLabel || (mode === 'advantage' ? 'Advantage ("I Got This")' : mode === 'disadvantage' ? 'Disadvantage (Negative Karma)' : 'Tactical Check')
    });

    AudioService.playDiceRollSound();
    if (result.isCritSuccess) AudioService.playCriticalChime(true);
    if (result.isCritFail) AudioService.playCriticalChime(false);

    setLatestRoll(result);
    setHistory(prev => [result, ...prev.slice(0, 19)]);

    if (broadcastToChat && sendDiceRoll) {
      try {
        const targetChan = selectedChannelId || activeChannelId;
        await sendDiceRoll({
          label: checkLabel,
          expression: result.expression,
          total: result.total,
          rolls: result.rolls.map(r => r.value),
          modifier: result.modifier,
          adHocModifier: adHocModifier,
          baseModifier: baseModifier,
          isCritical: result.isCritSuccess,
          isFumble: result.isCritFail,
          isAdvantage: result.isAdvantage,
          isDisadvantage: result.isDisadvantage,
          targetNumber: tn,
          isSuccess: result.isSuccess,
          margin: result.margin,
          alternateRoll: result.alternateRoll ? {
            total: result.alternateRoll.total,
            rolls: result.alternateRoll.rolls.map(r => r.value)
          } : null
        }, targetChan);
      } catch (err) {
        console.warn('Failed to broadcast roll to chat:', err);
      }
    }
  };

  if (!isOpen) return null;

  const totalCalculatedMod = baseModifier + adHocModifier;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 w-[calc(100vw-1.5rem)] max-w-md sm:w-96 bg-[#0d1117]/95 backdrop-blur-md border border-amber-500/60 rounded-xl shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.3)] p-3 sm:p-4 flex flex-col gap-3 font-sans select-none animate-slide-up">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
        <div className="flex items-center gap-2 min-w-0">
          <Dices className="text-amber-400 shrink-0" size={18} />
          <div className="min-w-0">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-amber-300 truncate">
              {checkLabel ? checkLabel : 'TANGENT DICE TRAY'}
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

        <div className="flex items-center gap-1 shrink-0">
          {history.length > 0 && (
            <button 
              type="button"
              onClick={() => { setHistory([]); setLatestRoll(null); }} 
              className="p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              title="Clear Dice History"
            >
              <RotateCcw size={14} />
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

      {/* Advantage & Disadvantage Selection Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>ROLL STANCE:</span>
          <span className="text-[9px] text-slate-500">
            {rollMode === 'advantage' 
              ? 'Roll 2d10 again & take highest' 
              : rollMode === 'disadvantage' 
              ? 'Roll 2d10 again & take lowest' 
              : 'Standard 2d10 single check'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setRollMode('normal')}
            className={`py-1 rounded transition-colors text-center font-bold cursor-pointer ${
              rollMode === 'normal'
                ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Standard Roll: Roll 2d10 once"
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setRollMode(rollMode === 'advantage' ? 'normal' : 'advantage')}
            className={`py-1 rounded transition-colors text-center font-bold flex items-center justify-center gap-1 cursor-pointer ${
              rollMode === 'advantage'
                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'text-emerald-500/70 hover:text-emerald-300'
            }`}
            title="Advantage: Roll 2d10 again and take highest result ('I Got This' - 1 Karma)"
          >
            <Sparkles size={11} />
            <span>Advantage</span>
          </button>
          <button
            type="button"
            onClick={() => setRollMode(rollMode === 'disadvantage' ? 'normal' : 'disadvantage')}
            className={`py-1 rounded transition-colors text-center font-bold flex items-center justify-center gap-1 cursor-pointer ${
              rollMode === 'disadvantage'
                ? 'bg-rose-950/90 text-rose-300 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                : 'text-rose-500/70 hover:text-rose-300'
            }`}
            title="Disadvantage: Roll 2d10 again and take lowest result (Negative Karma Debt)"
          >
            <Scale size={11} />
            <span>Disadvantage</span>
          </button>
        </div>
      </div>

      {/* Ad Hoc Situational Modifiers Bar */}
      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="font-bold text-amber-400/90 uppercase tracking-wider">Ad Hoc Modifiers:</span>
          <span className="text-[9px] text-cyan-300">
            Net Modifier: <strong className="text-amber-300">{totalCalculatedMod >= 0 ? `+${totalCalculatedMod}` : totalCalculatedMod}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Ad-hoc buttons */}
          {[-5, -2, -1, 0, 1, 2, 5].map((val) => {
            const isZero = val === 0;
            const isCurrent = adHocModifier === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleAdHocChange(val)}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                    : isZero
                    ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    : val > 0
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60'
                }`}
                title={isZero ? 'Clear ad-hoc modifier' : `Set ad-hoc situational modifier to ${val > 0 ? `+${val}` : val}`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            );
          })}

          {/* Direct Ad-hoc input */}
          <input
            type="number"
            value={adHocModifier}
            onChange={(e) => handleAdHocChange(e.target.value)}
            className="w-12 text-center bg-slate-900 border border-slate-700 focus:border-amber-400 rounded py-1 text-xs font-mono font-bold text-amber-300 outline-none"
            title="Custom ad-hoc situational modifier (+/-)"
            placeholder="Mod"
          />
        </div>
      </div>

      {/* Preset Dice Grid */}
      <div className="grid grid-cols-6 gap-1">
        {PRESET_DICE.map((p) => (
          <button
            key={p.expr}
            type="button"
            onClick={() => {
              setCustomExpr(p.expr);
              handleRoll(p.expr);
            }}
            className="py-1 px-1 rounded bg-slate-900/80 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-slate-300 text-[11px] font-mono font-bold text-center transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Formula & Target Number Input */}
      <div className="flex items-center gap-1.5">
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
            value={targetNumber}
            onChange={(e) => setTargetNumber(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRoll(customExpr); }}
            placeholder="TN"
            className="w-full bg-transparent text-xs font-mono text-amber-300 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => handleRoll(customExpr)}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-lg uppercase transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1"
        >
          <Dices size={14} />
          <span>Roll</span>
        </button>
      </div>

      {/* Broadcast to Chat & Channel Selector */}
      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={broadcastToChat}
              onChange={(e) => setBroadcastToChat(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <Radio size={12} className={broadcastToChat ? 'text-cyan-400' : 'text-slate-600'} />
            <span className="font-bold text-[10.5px]">Broadcast Roll to Chat</span>
          </label>

          {groupChannels && groupChannels.length > 0 && (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/40">
              🛡️ {groupChannels.length} Group Chan Available
            </span>
          )}
        </div>

        {/* Channel Selector Dropdown */}
        {broadcastToChat && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
            <span className="text-slate-500 text-[10px] shrink-0">Channel:</span>
            <select
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-xs text-slate-200 outline-none truncate cursor-pointer"
            >
              {/* Prioritized Game Group / Squad Channels */}
              {groupChannels && groupChannels.length > 0 && (
                <optgroup label="🌟 Game Group / Squad Channels">
                  {groupChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      🛡️ {c.displayName || c.name} (Squad)
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Public Channels */}
              {publicChannels && publicChannels.length > 0 && (
                <optgroup label="🌐 Public CommLink Channels">
                  {publicChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      # {c.displayName || c.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Custom Channels */}
              {customChannels && customChannels.length > 0 && (
                <optgroup label="💬 Custom Frequencies">
                  {customChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      # {c.displayName || c.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Direct Messages */}
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
        )}
      </div>

      {/* Latest Result Banner */}
      {latestRoll && (
        <div className={`p-3 rounded-lg border text-center transition-all ${
          latestRoll.isCritSuccess 
            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
            : latestRoll.isCritFail
            ? 'bg-red-500/20 border-red-500 text-red-200'
            : 'bg-slate-900/90 border-slate-700 text-slate-100'
        }`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase">
            {latestRoll.label || 'Action Check'} • {latestRoll.expression} {latestRoll.targetNumber ? `vs TN ${latestRoll.targetNumber}` : ''}
          </div>

          {/* Advantage / Disadvantage Comparison Header */}
          {latestRoll.isAdvantage && (
            <div className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 py-0.5 px-2 rounded border border-emerald-700/50 my-1 inline-block">
              ✨ ADVANTAGE: Kept {latestRoll.total} {latestRoll.alternateRoll ? `over ${latestRoll.alternateRoll.total}` : ''}
            </div>
          )}
          {latestRoll.isDisadvantage && (
            <div className="text-[10px] font-mono font-bold text-rose-300 bg-rose-950/80 py-0.5 px-2 rounded border border-rose-700/50 my-1 inline-block">
              ⚖️ DISADVANTAGE: Kept {latestRoll.total} {latestRoll.alternateRoll ? `over ${latestRoll.alternateRoll.total}` : ''}
            </div>
          )}

          <div className="text-3xl font-bold font-mono my-1 tracking-wider text-cyan-300">
            {latestRoll.total}
          </div>

          <div className="text-[11px] font-mono text-slate-300">
            Rolls: [{latestRoll.rolls.map(r => r.value).join(', ')}]
            {latestRoll.isCritSuccess ? ' (Crit Value: 30)' : latestRoll.isCritFail ? ' (Fumble Value: -10)' : ''}
            {latestRoll.modifier !== 0 ? (latestRoll.modifier > 0 ? ` + ${latestRoll.modifier}` : ` ${latestRoll.modifier}`) : ''}
          </div>

          {latestRoll.alternateRoll && (
            <div className="text-[9.5px] font-mono text-slate-500 mt-0.5">
              Alternative Roll Pool: [{latestRoll.alternateRoll.rolls.map(r => r.value).join(', ')}] = {latestRoll.alternateRoll.total}
            </div>
          )}

          {latestRoll.isCritSuccess && (
            <div className="text-xs font-bold text-amber-300 uppercase mt-1 animate-pulse">
              ⚡ CRITICAL SUCCESS (VALUE: 30) ⚡
            </div>
          )}
          {latestRoll.isCritFail && (
            <div className="text-xs font-bold text-red-400 uppercase mt-1">
              💀 CRITICAL FUMBLE (VALUE: -10) 💀
            </div>
          )}
          {latestRoll.margin !== null && (
            <div className={`text-xs font-bold mt-1 ${latestRoll.isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
              {latestRoll.isSuccess ? `SUCCESS (Margin: +${latestRoll.margin})` : `FAILURE (Margin: ${latestRoll.margin})`}
            </div>
          )}

          {/* Reroll: "Not What I Meant" Karma Action Trigger */}
          <button
            type="button"
            onClick={() => handleRoll(latestRoll.expression, 'normal')}
            className="mt-2 w-full py-1 bg-amber-950/50 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Reroll Check ('Not What I Meant' - 1 Karma Point). Must accept 2nd result."
          >
            <span>🔄</span> Reroll Check ("Not What I Meant" - 1 KP)
          </button>
        </div>
      )}

      {/* History Log */}
      {history.length > 1 && (
        <div className="max-h-24 overflow-y-auto space-y-1 pr-1 border-t border-slate-800 pt-1.5">
          {history.slice(1).map((h) => (
            <div key={h.id} className="flex justify-between items-center text-[10px] font-mono text-slate-400 p-1 bg-slate-900/40 rounded">
              <span className="truncate mr-2">{h.label ? `${h.label}: ` : ''}{h.expression} [{h.rolls.map(r => r.value).join(', ')}]</span>
              <span className="text-slate-200 font-bold shrink-0">{h.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiceRollerDock;
