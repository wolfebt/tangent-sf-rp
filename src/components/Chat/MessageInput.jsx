import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Send, 
  Dices, 
  Shield, 
  User, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  X,
  Heart,
  Activity,
  Lock,
  Radio,
  Zap,
  Check
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useFolio } from '../../context/FolioContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';
import { rollDice } from '../../services/diceService';
import { PersonaLogService, ACTION_TYPES } from '../../services/personaLogService';
import { 
  getFolioTombstones, 
  isFolioPersonaDeleted, 
  isPersonaEmptyTemplate 
} from '../../utils/personaValidationUtils';

/**
 * @component MessageInput
 * @description Streamlined, clutter-free message composer for tactical chat.
 * Features a single Unified Identity Switcher pill, sleek Quick-Tools popover
 * for dice rolling & RPG shortcuts, and responsive keyboard controls.
 */
export const MessageInput = ({ isCompact = false }) => {
  const { 
    sendMessage, 
    sendDiceRoll,
    speakingMode, 
    setSpeakingMode, 
    selectedPersona, 
    setSelectedPersona,
    activeChannel,
    broadcastToVtt,
    setBroadcastToVtt
  } = useChat();
  const { personaRoster, roster, characterData } = useFolio();
  const { currentUser, userHandle } = useAuth();

  const [text, setText] = useState('');
  const [isIdentityDropdownOpen, setIsIdentityDropdownOpen] = useState(false);
  const [isDicePopoverOpen, setIsDicePopoverOpen] = useState(false);
  const [isRpgMenuOpen, setIsRpgMenuOpen] = useState(false);
  
  // Quick Dice Form State
  const [diceExpr, setDiceExpr] = useState('2d10');
  const [rollAdvantage, setRollAdvantage] = useState('norm'); // 'norm' | 'adv' | 'dis'
  const [rollLabel, setRollLabel] = useState('');

  const inputRef = useRef(null);

  // Collect all available personas from Folio catalog / roster / active characterData
  const allPersonas = useMemo(() => {
    const tombstones = getFolioTombstones();
    const list = [];
    const seen = new Set();
    const source = Array.isArray(personaRoster) && personaRoster.length > 0 
      ? personaRoster 
      : (Array.isArray(roster) && roster.length > 0 ? roster : (characterData ? [characterData] : []));

    source.forEach(p => {
      if (!p) return;
      const pId = p['character-doc-id'] || p.id;
      const pName = p['char-name'] || p.name;
      if (pId && pName && !seen.has(pId) && !isFolioPersonaDeleted(pId, tombstones) && !isPersonaEmptyTemplate(p) && !p.isDeleted) {
        seen.add(pId);
        list.push(p);
      }
    });

    return list;
  }, [personaRoster, roster, characterData]);

  // Set default selectedPersona if not already set
  useEffect(() => {
    if (!selectedPersona && allPersonas.length > 0) {
      setSelectedPersona(allPersonas[0]);
    }
  }, [allPersonas, selectedPersona, setSelectedPersona]);

  const isReadOnlyChannel = activeChannel?.isReadOnly || activeChannel?.type === 'persona_log' || activeChannel?.id?.startsWith('persona_log_');

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isReadOnlyChannel) return;

    const msgToSend = text.trim();
    setText('');
    await sendMessage(msgToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertRpgSnippet = (prefix) => {
    AudioService.playTerminalBeep(1150, 0.02);
    setIsRpgMenuOpen(false);
    setText(prev => {
      if (prefix === '[Codex]') return `${prev}[Hyperdrive] `;
      if (prev.startsWith(prefix)) return prev;
      return `${prefix} ${prev}`.trim();
    });
    if (inputRef.current) inputRef.current.focus();
  };

  const handleQuickDiceRoll = async (e) => {
    if (e) e.preventDefault();
    if (!diceExpr.trim()) return;

    try {
      const isAdv = rollAdvantage === 'adv';
      const isDis = rollAdvantage === 'dis';
      const cName = speakingMode === 'IC' && selectedPersona
        ? (selectedPersona['char-name'] || selectedPersona.name || 'Persona')
        : (userHandle || 'Operator');

      const rollResult = rollDice(diceExpr.trim(), {
        advantage: isAdv,
        disadvantage: isDis,
        characterName: cName,
        label: rollLabel.trim() || 'Tactical Check'
      });

      if (rollLabel.trim()) {
        rollResult.label = rollLabel.trim();
      }

      await sendDiceRoll(rollResult);

      // Auto-log to Persona Telemetry Log if speaking as a persona
      if (speakingMode === 'IC' && selectedPersona) {
        const personaId = selectedPersona['character-doc-id'] || selectedPersona.id;
        const personaName = selectedPersona['char-name'] || selectedPersona.name || 'Persona';
        
        PersonaLogService.logAction({
          personaId,
          personaName,
          actionType: ACTION_TYPES.SKILL_CHECK,
          summary: `${rollResult.label || 'Action Check'}: ${rollResult.total} (${rollResult.expression})${rollResult.isCritSuccess ? ' [CRITICAL 30]' : rollResult.isCritFail ? ' [FUMBLE -10]' : ''}`,
          details: {
            expression: rollResult.expression,
            rolls: rollResult.rolls,
            total: rollResult.total,
            modifier: rollResult.modifier,
            isCritical: rollResult.isCritSuccess,
            isFumble: rollResult.isCritFail,
            isAdvantage: isAdv,
            isDisadvantage: isDis
          },
          actorId: currentUser?.uid || 'anon',
          actorHandle: userHandle || 'Operator'
        }).catch(() => {});
      }

      setIsDicePopoverOpen(false);
      setRollLabel('');
    } catch (err) {
      console.error('Dice parse error:', err);
      alert('Invalid dice expression format. Examples: 2d10, 2d10+4, 1d20');
    }
  };

  const activePersonaName = selectedPersona?.['char-name'] || selectedPersona?.name || 'Persona';
  const activePersonaConcept = selectedPersona?.['char-concept'] || selectedPersona?.role || selectedPersona?.['char-occu'] || 'Specialist';
  const activePersonaHP = selectedPersona?.current_health ?? (selectedPersona?.current_hp ?? 30);
  const activePersonaMaxHP = selectedPersona?.health ?? (selectedPersona?.base_hp ?? 30);

  return (
    <div className="p-2 sm:p-3 bg-[#0a0e17] border-t border-slate-800 text-slate-200 select-none relative z-10">
      {/* ── Read-Only Frequency Guard Banner ── */}
      {isReadOnlyChannel ? (
        <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-amber-200">READ-ONLY PERSONA ACTION STREAM</span>
              <span className="text-[10px] text-slate-400">
                Transmissions are disabled on this frequency. Actions are automatically logged by the Tangent Engine.
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-amber-500/20 px-2 py-1 rounded border border-amber-500/40 uppercase">
            AUDIT ONLY
          </span>
        </div>
      ) : (
        <>
          {/* ── Contextual Direct Recipient Banner (If Direct Comms) ── */}
          {activeChannel?.type === 'direct' && (
            <div className={`mb-2 px-2.5 py-1 rounded-lg text-xs font-mono flex items-center justify-between border ${
              activeChannel.targetPersona?.name
                ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeChannel.targetPersona?.name ? 'bg-purple-400' : 'bg-cyan-400'} animate-pulse`} />
                <span className="text-[11px]">
                  {activeChannel.targetPersona?.name ? (
                    <>Whispering to Persona: <strong className="text-purple-300 font-bold">{activeChannel.targetPersona.name}</strong> <span className="text-[10px] text-slate-400">(@{activeChannel.displayName})</span></>
                  ) : (
                    <>Direct Comms with Operator: <strong className="text-cyan-300 font-bold">@{activeChannel.displayName}</strong></>
                  )}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700/60 text-slate-400">
                {activeChannel.targetPersona?.name ? '🎭 PERSONA DIRECT' : '👤 OPERATOR DIRECT'}
              </span>
            </div>
          )}

          {/* ── Streamlined Composer Top Bar: Unified Identity Switcher & Compact Quick-Tools ── */}
          <div className="flex items-center justify-between gap-2 mb-2 text-xs font-mono">
            {/* Unified Speaking Identity Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setIsIdentityDropdownOpen(prev => !prev);
                  setIsDicePopoverOpen(false);
                  setIsRpgMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs transition-all cursor-pointer shadow-sm ${
                  speakingMode === 'IC'
                    ? 'bg-purple-950/60 hover:bg-purple-900/70 border-purple-500/50 text-purple-200'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-700 hover:border-cyan-500/50 text-cyan-300'
                }`}
                title="Click to toggle speaking identity (Player OOC vs In-Character Persona)"
              >
                {speakingMode === 'IC' ? (
                  <>
                    <Shield size={13} className="text-purple-400" />
                    <span>IC: {activePersonaName}</span>
                    <span className="text-[10px] text-purple-300/80 hidden sm:inline">({activePersonaConcept})</span>
                    <span className="text-[9.5px] px-1 py-0.1 bg-purple-500/20 text-purple-300 rounded ml-0.5">
                      {activePersonaHP}/{activePersonaMaxHP} HP
                    </span>
                  </>
                ) : (
                  <>
                    <User size={13} className="text-cyan-400" />
                    <span>OOC: @{userHandle || 'Operator'}</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded ml-0.5">
                      PLAYER
                    </span>
                  </>
                )}
                <ChevronDown size={12} className="text-slate-400 ml-0.5" />
              </button>

              {/* Identity Picker Popover */}
              {isIdentityDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-1.5 w-72 bg-[#0c111a] border border-slate-700 rounded-xl shadow-2xl p-2 space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>SELECT TRANSMITTING IDENTITY</span>
                    <button
                      type="button"
                      onClick={() => setIsIdentityDropdownOpen(false)}
                      className="p-0.5 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Option 1: Player (OOC) */}
                  <div
                    onClick={() => {
                      AudioService.playTerminalBeep(1000, 0.02);
                      setSpeakingMode('OOC');
                      setIsIdentityDropdownOpen(false);
                    }}
                    className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                      speakingMode === 'OOC'
                        ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-cyan-400">
                        <User size={12} />
                      </div>
                      <div>
                        <span className="font-bold text-xs block">@{userHandle || 'Operator'}</span>
                        <span className="text-[9.5px] text-slate-400">Player Out-of-Character</span>
                      </div>
                    </div>
                    {speakingMode === 'OOC' && <Check size={14} className="text-cyan-400" />}
                  </div>

                  {/* Option 2: Folio Personas (IC) */}
                  <div className="pt-1 space-y-1">
                    <span className="text-[9.5px] font-bold text-purple-400 uppercase tracking-wider block px-1">
                      FOLIO PERSONAS ({allPersonas.length})
                    </span>

                    {allPersonas.length === 0 ? (
                      <div className="p-2 text-center text-[10px] text-slate-500 italic">
                        No character sheets saved in Folio.
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5 no-scrollbar">
                        {allPersonas.map((p) => {
                          const pId = p['character-doc-id'] || p.id;
                          const pName = p['char-name'] || p.name || 'Persona';
                          const pRole = p['char-concept'] || p.role || p['char-occu'] || 'Agent';
                          const isSelected = speakingMode === 'IC' && (selectedPersona?.['character-doc-id'] || selectedPersona?.id) === pId;

                          return (
                            <div
                              key={pId}
                              onClick={() => {
                                AudioService.playTerminalBeep(1150, 0.02);
                                setSelectedPersona(p);
                                setSpeakingMode('IC');
                                setIsIdentityDropdownOpen(false);
                              }}
                              className={`p-1.5 px-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-purple-950/60 border border-purple-500/50 text-purple-200'
                                  : 'bg-slate-900/40 border border-slate-800/80 text-slate-300 hover:bg-purple-950/30'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs">🎭</span>
                                <div className="min-w-0">
                                  <span className="font-bold text-[11px] block truncate">{pName}</span>
                                  <span className="text-[9px] text-slate-400 block truncate">{pRole}</span>
                                </div>
                              </div>
                              {isSelected && <Check size={13} className="text-purple-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick-Tools: Dice Roller, RPG Snippets, VTT Sync */}
            <div className="flex items-center gap-1.5">
              {/* Broadcast to VTT Toggle */}
              <button
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1200, 0.02);
                  setBroadcastToVtt(prev => !prev);
                }}
                className={`p-1.5 px-2 rounded-lg border font-bold text-[10.5px] flex items-center gap-1 transition-all cursor-pointer ${
                  broadcastToVtt
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
                title="Toggle VTT Stage Sync for dice rolls"
              >
                <Radio size={11} className={broadcastToVtt ? 'animate-pulse text-amber-400' : ''} />
                <span className="hidden sm:inline">VTT</span>
              </button>

              {/* RPG Actions Quick Menu Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1100, 0.02);
                    setIsRpgMenuOpen(prev => !prev);
                    setIsDicePopoverOpen(false);
                    setIsIdentityDropdownOpen(false);
                  }}
                  className="p-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-[10.5px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="RPG Formatting (/me, /ooc, [Codex])"
                >
                  <Sparkles size={12} className="text-purple-400" />
                  <span className="hidden sm:inline">RPG</span>
                </button>

                {isRpgMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-[#0c111a] border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in duration-100 text-xs">
                    <button
                      type="button"
                      onClick={() => insertRpgSnippet('/me')}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-purple-950 text-purple-200 font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>/me [Action]</span>
                      <span className="text-[9px] text-slate-500">Narrative</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertRpgSnippet('/ooc')}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>/ooc [Remark]</span>
                      <span className="text-[9px] text-slate-500">Out of char</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertRpgSnippet('[Codex]')}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-cyan-950 text-cyan-200 font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>[Lore Link]</span>
                      <span className="text-[9px] text-slate-500">Codex</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tactical Dice Roller Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.02);
                    setIsDicePopoverOpen(prev => !prev);
                    setIsRpgMenuOpen(false);
                    setIsIdentityDropdownOpen(false);
                  }}
                  className={`p-1.5 px-2.5 rounded-lg border font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDicePopoverOpen
                      ? 'bg-amber-500/25 text-amber-200 border-amber-500 shadow-sm'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                  }`}
                  title="Launch Tactical Dice Roller"
                >
                  <Dices size={13} />
                  <span>ROLL</span>
                </button>

                {/* Sleek Dice Roller Inline Popover */}
                {isDicePopoverOpen && (
                  <form 
                    onSubmit={handleQuickDiceRoll} 
                    className="absolute right-0 bottom-full mb-1.5 w-80 bg-[#0d121c] border border-amber-500/50 rounded-xl shadow-2xl p-3 space-y-2.5 z-50 animate-in fade-in duration-150 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-amber-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Dices size={14} />
                        <span>TACTICAL DICE ROLLER</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDicePopoverOpen(false)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1">
                      {['2d10', '2d10+2', '2d10+4', '1d20', '1d100'].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDiceExpr(preset)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            diceExpr === preset 
                              ? 'bg-amber-500/25 text-amber-300 border-amber-500/60' 
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    {/* Expression and Label */}
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">DICE FORMULA:</span>
                        <input
                          type="text"
                          value={diceExpr}
                          onChange={(e) => setDiceExpr(e.target.value)}
                          placeholder="e.g. 2d10+4, 1d20"
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded text-xs text-amber-200 outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">CHECK LABEL (OPTIONAL):</span>
                        <input
                          type="text"
                          value={rollLabel}
                          onChange={(e) => setRollLabel(e.target.value)}
                          placeholder="e.g. Plasma Carbine, Stealth Check"
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded text-xs text-cyan-200 outline-none"
                        />
                      </div>
                    </div>

                    {/* Mode: Norm, Adv, Dis */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setRollAdvantage('norm')}
                          className={`px-2 py-0.8 rounded font-bold border cursor-pointer ${
                            rollAdvantage === 'norm' ? 'bg-slate-800 text-slate-200 border-slate-600' : 'bg-slate-950 text-slate-500 border-slate-900'
                          }`}
                        >
                          NORM
                        </button>
                        <button
                          type="button"
                          onClick={() => setRollAdvantage('adv')}
                          className={`px-2 py-0.8 rounded font-bold border cursor-pointer ${
                            rollAdvantage === 'adv' ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60' : 'bg-slate-950 text-slate-500 border-slate-900'
                          }`}
                        >
                          ADV
                        </button>
                        <button
                          type="button"
                          onClick={() => setRollAdvantage('dis')}
                          className={`px-2 py-0.8 rounded font-bold border cursor-pointer ${
                            rollAdvantage === 'dis' ? 'bg-rose-500/25 text-rose-300 border-rose-500/60' : 'bg-slate-950 text-slate-500 border-slate-900'
                          }`}
                        >
                          DIS
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                      >
                        EXECUTE
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── Main Message Transmission Bar ── */}
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                speakingMode === 'IC'
                  ? `Transmit as ${activePersonaName} into ${activeChannel?.displayName || 'frequency'}...`
                  : `Transmit as @${userHandle || 'Operator'} into ${activeChannel?.displayName || 'frequency'}...`
              }
              className={`w-full pl-3.5 pr-12 py-2.5 bg-slate-950 border rounded-xl text-xs sm:text-sm font-mono placeholder-slate-500 focus:outline-none transition-all shadow-inner ${
                speakingMode === 'IC'
                  ? 'border-purple-500/50 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 text-purple-100'
                  : 'border-slate-800 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 text-slate-100'
              }`}
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className={`absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                text.trim()
                  ? speakingMode === 'IC'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
              title="Send Transmission (Enter)"
            >
              <Send size={14} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default MessageInput;
