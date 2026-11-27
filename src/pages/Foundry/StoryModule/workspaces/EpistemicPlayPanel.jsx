/**
 * @file EpistemicPlayPanel.jsx
 * @description Master Epistemic Interaction Panel for ADE Story Module.
 * Implements mechanics impossible with traditional branching trees:
 *   1. Open-Ended Terminal Hacking Console (CLI-based node exploration, Tech Level checks, slicing DC)
 *   2. Free-Form NPC Interrogation Workbench (Dynamic motive probing, deception checks, secret reveals)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { adjudicateActionCheck } from '../../../../services/ade/adeEngineBridge.ts';
import { generateContent } from '../../../../services/aimeService.js';
import { AudioService } from '../../../../services/audioService.js';
import { Terminal, MessageSquare, Brain, Shield, Send, CheckCircle2, AlertTriangle, XCircle, Copy, CornerDownRight, Loader2 } from 'lucide-react';

const stripHtml = (str) => String(str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export default function EpistemicPlayPanel({
  isOpen,
  onClose,
  activeOperative,
  activeNode = null,
  elementsCatalog = [],
  isStoryReadOnly = false,
  onInsertToProse
}) {
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'interrogation'

  const linkedIds = useMemo(() => {
    const ids = new Set();
    if (Array.isArray(activeNode?.linkedElements)) {
      activeNode.linkedElements.forEach((l) => {
        if (typeof l === 'string') ids.add(l);
        else if (l?.id) ids.add(l.id);
      });
    }
    if (Array.isArray(activeNode?.assetHub)) {
      activeNode.assetHub.forEach((a) => {
        if (typeof a === 'string') {
          ids.add(a);
        } else if (a?.assetId || a?.id) {
          ids.add(a.assetId || a.id);
        }
      });
    }
    return ids;
  }, [activeNode]);

  const terminalFiles = useMemo(() => {
    const relevant = (elementsCatalog || []).filter((el) => {
      if (!el) return false;
      const t = String(el.type || '').toLowerCase();
      const isTerminalArtifact = ['clue', 'handout', 'property', 'technology', 'custom'].includes(t);
      if (!isTerminalArtifact) return false;
      if (linkedIds.size > 0) return linkedIds.has(el.id);
      return true;
    }).slice(0, 6);

    if (relevant.length > 0) {
      return relevant.map((el) => {
        const slug = String(el.title || el.name || el.id || 'record')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');
        const isClueOrSecret = ['clue', 'handout'].includes(String(el.type || '').toLowerCase()) || Boolean(el.fields?.encrypted);
        const body = stripHtml(el.fields?.summary || el.fields?.description || el.content || 'Verified scenario dossier record.');
        return {
          name: `${slug || 'dossier'}.${isClueOrSecret ? 'enc' : 'log'}`,
          title: el.title || el.name || 'Record',
          encrypted: isClueOrSecret,
          content: body || `Record "${el.title || 'Data'}" verified in Omnicortex archive.`
        };
      });
    }

    return [
      {
        name: 'auth_matrix.key',
        title: 'Authentication Matrix',
        encrypted: true,
        content: 'ROOT KEY MATRIX: Sector clearance tokens synchronized with Command Relay.'
      },
      {
        name: 'comm_intercept.log',
        title: 'Comm Intercept',
        encrypted: false,
        content: 'INTERCEPT: "The courier arrived at Docking Ring 4. Suppress the automated sentries before operator sweep."'
      },
      {
        name: 'cargo_manifest.enc',
        title: 'Cargo Manifest',
        encrypted: false,
        content: 'CARGO MANIFEST: 40x Photonic Power Cells bound for Sector 7 Precursor Vault.'
      }
    ];
  }, [elementsCatalog, linkedIds]);

  const linkedPersonas = useMemo(() => {
    const allPersonas = (elementsCatalog || []).filter((el) => {
      const t = String(el?.type || '').toLowerCase();
      return t === 'persona' || t === 'npc' || t === 'faction';
    });
    const linked = allPersonas.filter((el) => linkedIds.has(el.id));
    return linked.length > 0 ? linked : allPersonas.slice(0, 12);
  }, [elementsCatalog, linkedIds]);

  // ── TERMINAL HACKING CONSOLE STATE ──
  const [terminalTL, setTerminalTL] = useState(() => Number(activeNode?.fields?.techLevel || 3));
  const [terminalInput, setTerminalInput] = useState('');
  const [isRootUnlocked, setIsRootUnlocked] = useState(false);
  const [decryptedFiles, setDecryptedFiles] = useState({});
  const [terminalLogs, setTerminalLogs] = useState(() => [
    { type: 'sys', text: `OMNICORTEX SECURE NODE • ${activeNode?.title ? activeNode.title.toUpperCase() : 'SECTOR RELAY'}` },
    { type: 'sys', text: `Sub-System Hardware: TL-${Number(activeNode?.fields?.techLevel || 3)} Encryption Matrix` },
    { type: 'prompt', text: 'Type "help", "status", "ls", "cat <file>", or "slice [subsystem]" to probe node.' }
  ]);

  // ── NPC INTERROGATION STATE ──
  const [suspectName, setSuspectName] = useState(() => linkedPersonas[0]?.title || linkedPersonas[0]?.name || 'Informant Jaxen');
  const [suspectArchetype, setSuspectArchetype] = useState(
    () => linkedPersonas[0]?.fields?.role || linkedPersonas[0]?.fields?.archetype || linkedPersonas[0]?.fields?.occupation || 'Syndicate Courier'
  );
  const [interrogationQuery, setInterrogationQuery] = useState('');
  const [isInterrogating, setIsInterrogating] = useState(false);
  const [interrogationHistory, setInterrogationHistory] = useState(() => [
    {
      speaker: 'suspect',
      text: activeNode?.title
        ? `Target locked in scene "${activeNode.title}". Ask your question or select a social check above.`
        : 'I already told your enforcers everything I know. I was just delivering an encrypted drive to the docking bay.'
    }
  ]);
  const [activeSkill, setActiveSkill] = useState('Etiquette'); // 'Etiquette' | 'Intimidation' | 'Perception'

  useEffect(() => {
    const nextTL = Number(activeNode?.fields?.techLevel || 3);
    setTerminalTL(nextTL);
    setTerminalInput('');
    setIsRootUnlocked(false);
    setDecryptedFiles({});
    setTerminalLogs([
      { type: 'sys', text: `OMNICORTEX SECURE NODE • ${activeNode?.title ? activeNode.title.toUpperCase() : 'SECTOR RELAY'}` },
      { type: 'sys', text: `Sub-System Hardware: TL-${nextTL} Encryption Matrix` },
      { type: 'prompt', text: 'Type "help", "status", "ls", "cat <file>", or "slice [subsystem]" to probe node.' }
    ]);
    setInterrogationQuery('');
    setInterrogationHistory([
      {
        speaker: 'suspect',
        text: activeNode?.title
          ? `Target locked in scene "${activeNode.title}". Ask your question or select a social check above.`
          : 'I already told your enforcers everything I know. I was just delivering an encrypted drive to the docking bay.'
      }
    ]);
  }, [activeNode?.id]);

  useEffect(() => {
    if (linkedPersonas[0]) {
      setSuspectName(linkedPersonas[0].title || linkedPersonas[0].name || 'Suspect');
      setSuspectArchetype(
        linkedPersonas[0].fields?.role || linkedPersonas[0].fields?.archetype || linkedPersonas[0].fields?.occupation || linkedPersonas[0].type || 'Persona'
      );
    }
  }, [activeNode?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const escapeHtml = (val) =>
    String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Handle Terminal CLI command execution
  const handleRunTerminalCommand = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');
    AudioService.playTerminalBeep(1200, 0.03);

    const newLogs = [...terminalLogs, { type: 'input', text: `> ${cmd}` }];

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      newLogs.push({ type: 'sys', text: 'Available commands: ls, cat <file>, slice <target>, status, clear' });
    } else if (lower === 'status') {
      const unlockedCount = terminalFiles.filter((f) => !f.encrypted || isRootUnlocked || decryptedFiles[f.name]).length;
      newLogs.push({
        type: 'info',
        text: `STATUS: Node="${activeNode?.title || 'Sec-Terminal #4'}" | Hardware=TL-${terminalTL} | Deck=TL-${activeOperative?.techLevel ?? 2} | RootShell=${isRootUnlocked ? 'UNLOCKED' : 'LOCKED'} | ReadableFiles=${unlockedCount}/${terminalFiles.length}`
      });
    } else if (lower === 'ls') {
      const listing = terminalFiles
        .map((f) => `[${f.name}${f.encrypted && !isRootUnlocked && !decryptedFiles[f.name] ? ' (ENC)' : ''}]`)
        .join(' ');
      newLogs.push({ type: 'sys', text: `FILES: ${listing}` });
    } else if (lower.startsWith('cat')) {
      const fileQuery = lower.replace(/^cat\s*/, '').trim();
      const matched = terminalFiles.find((f) =>
        f.name.toLowerCase().includes(fileQuery) || f.title.toLowerCase().includes(fileQuery)
      );
      if (!fileQuery) {
        newLogs.push({ type: 'error', text: 'Usage: cat <filename>' });
      } else if (!matched) {
        newLogs.push({ type: 'error', text: `File not found: "${fileQuery}". Run "ls" to view node files.` });
      } else if (matched.encrypted && !isRootUnlocked && !decryptedFiles[matched.name]) {
        newLogs.push({ type: 'error', text: `Access Denied: ${matched.name} is encrypted. Run "slice ${matched.name}" first.` });
      } else {
        newLogs.push({ type: 'info', text: `${matched.title.toUpperCase()}: ${matched.content}` });
      }
    } else if (lower.startsWith('slice') || lower.startsWith('hack') || lower.startsWith('override')) {
      // Execute canonical 2d10 action check with Tech Level verification!
      const targetEntity = { name: activeNode?.title || 'Secure Terminal', techLevel: terminalTL };
      const mandate = adjudicateActionCheck({
        actionText: cmd,
        operative: activeOperative,
        targetEntity,
        targetDC: 12
      });

      if (mandate.systemIntent === 'REFUSE_ACTION') {
        newLogs.push({ type: 'error', text: `[SYSTEM REFUSAL]: ${mandate.narrativeBounds.refusalReason}. Operator deck is TL-${activeOperative?.techLevel ?? 2}, target is TL-${terminalTL}. Capacitor feedback discharges!` });
      } else if (mandate.systemIntent === 'EXECUTE_SUCCESS' || mandate.systemIntent === 'CRITICAL_TRIUMPH') {
        setIsRootUnlocked(true);
        const unlockedMap = {};
        terminalFiles.forEach((f) => { unlockedMap[f.name] = true; });
        setDecryptedFiles((prev) => ({ ...prev, ...unlockedMap }));
        newLogs.push({ type: 'success', text: `[DECRYPTION SUCCESS (+${mandate.diceSummary.margin})]: Firewall bypassed. Root shell unlocked! Encrypted files are now readable via "cat".` });
      } else {
        newLogs.push({ type: 'warning', text: `[INTRUSION RESISTED (${mandate.diceSummary.margin})]: Trace protocol initiated. Sector alarm counter +1.` });
      }
    } else if (lower === 'clear') {
      setTerminalLogs([{ type: 'sys', text: 'Terminal cleared.' }]);
      return;
    } else {
      newLogs.push({ type: 'error', text: `Command not recognized: "${cmd}". Type "help" for options.` });
    }

    setTerminalLogs(newLogs);
  };

  // Handle Free-Form Interrogation
  const handleAskInterrogation = async (e) => {
    e.preventDefault();
    if (!interrogationQuery.trim() || isInterrogating) return;
    const query = interrogationQuery.trim();
    setInterrogationQuery('');
    setIsInterrogating(true);
    AudioService.playTerminalBeep(1100, 0.03);

    const matchedPersona = linkedPersonas.find(
      (p) => (p.title || p.name || '').toLowerCase() === suspectName.toLowerCase()
    );

    // Roll 2d10 check
    const mandate = adjudicateActionCheck({
      actionText: `${activeSkill} interrogation: "${query}"`,
      operative: activeOperative,
      targetEntity: matchedPersona || { name: suspectName, archetype: suspectArchetype },
      skillName: activeSkill,
      targetDC: 13
    });

    const isRefused = mandate.systemIntent === 'REFUSE_ACTION';
    const isSuccess = mandate.systemIntent === 'EXECUTE_SUCCESS' || mandate.systemIntent === 'CRITICAL_TRIUMPH';
    const margin = mandate.diceSummary?.margin ?? 0;

    setInterrogationHistory(prev => [
      ...prev,
      { speaker: 'operative', text: query, skill: activeSkill, margin, isSuccess }
    ]);

    let npcReply = '';
    if (isRefused) {
      npcReply = `[Interrogation Blocked]: ${mandate.narrativeBounds?.refusalReason || 'That line of technical questioning requires elevated deck clearance.'}`;
    } else {
      try {
        const personaBio = stripHtml(matchedPersona?.fields?.summary || matchedPersona?.content || '');
        const prompt = `In-Character Interrogation Response:
Suspect: ${suspectName} (${suspectArchetype})
${personaBio ? `Dossier Facts: ${personaBio}\n` : ''}Scene Context: ${activeNode?.title || 'Field Interrogation'}
Investigator: ${activeOperative?.name || 'Operator'} using ${activeSkill}
Question: "${query}"
Engine Verdict: ${mandate.systemIntent} (margin ${margin >= 0 ? `+${margin}` : margin})

Respond strictly in 2-3 concise sentences in-character as ${suspectName}. ${
  isSuccess
    ? 'The social check SUCCEEDED — let slip a concrete, verifiable clue or motive relevant to the scene.'
    : 'The social check FAILED — deflect, stonewall, or mislead without revealing secrets.'
}`;
        const aiReply = await generateContent({
          prompt,
          context: {
            activeNode,
            catalog: elementsCatalog,
            folioCharacter: activeOperative,
            operatorSafe: true,
            excludeGmSecrets: true
          },
          tierKey: 'tier2_tactical'
        });
        if (typeof aiReply === 'string' && aiReply.trim()) {
          npcReply = `${isSuccess ? `[+${margin} margin]` : `[${margin} margin]`} ${aiReply.trim()}`;
        }
      } catch (err) {
        console.warn('[EpistemicPlayPanel] AIME interrogation fallback:', err);
      }

      if (!npcReply) {
        npcReply = isSuccess
          ? `[Crack in composure (+${margin} margin)]: "Alright! Don't involve my family. The drive has coordinates to the sub-level behind the hydroponics bay."`
          : `[Deception maintained (${margin} margin)]: "You're bluffing, ${activeOperative?.name || 'operator'}. Your jurisdiction ends at this airlock."`;
      }
    }

    setInterrogationHistory(prev => [
      ...prev,
      { speaker: 'suspect', text: npcReply }
    ]);
    setIsInterrogating(false);
  };

  const handleExportToStory = () => {
    if (activeTab === 'terminal') {
      const text = terminalLogs.map(l => escapeHtml(l.text)).join('\n');
      onInsertToProse(`<blockquote style="border-left: 3px solid #06b6d4; padding-left: 10px; margin: 10px 0; background: rgba(8,51,68,0.3);"><pre style="font-family: monospace; font-size: 11px;">${text}</pre></blockquote>`);
    } else {
      const text = interrogationHistory.map(h => `<p><strong>${escapeHtml(h.speaker === 'operative' ? (activeOperative?.name || 'Operator') : suspectName)}:</strong> ${escapeHtml(h.text)}</p>`).join('');
      onInsertToProse(text);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#090d16] border border-amber-500/60 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300 flex items-center justify-center text-sm">
              <Brain size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-200">
                Epistemic Interaction Workbench
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Dynamic information discovery & mechanics beyond static branching trees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  activeTab === 'terminal' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CLI Slicing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('interrogation')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  activeTab === 'interrogation' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Interrogation
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab 1: Terminal Slicing Console */}
        {activeTab === 'terminal' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Terminal size={13} />
                <span>Target Node: {activeNode?.title || 'Sec-Terminal #4'}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Terminal Tech Level:</span>
                <select
                  value={terminalTL}
                  onChange={e => setTerminalTL(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs rounded px-1.5 py-0.5 outline-none font-bold"
                >
                  <option value={1}>TL-1 (Industrial)</option>
                  <option value={2}>TL-2 (Interstellar)</option>
                  <option value={3}>TL-3 (Advanced)</option>
                  <option value={4}>TL-4 (Hard-Light)</option>
                  <option value={5}>TL-5 (Precursor)</option>
                </select>
              </div>
            </div>

            {/* Terminal Feed */}
            <div className="flex-1 overflow-y-auto bg-black p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 scrollbar-thin select-text">
              {terminalLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={
                    log.type === 'input' ? 'text-amber-300 font-bold' :
                    log.type === 'success' ? 'text-emerald-400 font-bold' :
                    log.type === 'error' ? 'text-rose-400 font-bold' :
                    log.type === 'info' ? 'text-cyan-300' : 'text-slate-400'
                  }
                >
                  {log.text}
                </div>
              ))}
            </div>

            {/* Command Input Form */}
            <form onSubmit={handleRunTerminalCommand} className="flex gap-2">
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                placeholder="Enter command (e.g. ls, cat cargo_manifest.enc, slice firewall)..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-xl text-xs outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold uppercase transition-colors"
              >
                Execute
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Free-Form NPC Interrogation */}
        {activeTab === 'interrogation' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                <MessageSquare size={13} className="text-purple-300 shrink-0" />
                <input
                  type="text"
                  value={suspectName}
                  onChange={e => setSuspectName(e.target.value)}
                  aria-label="Suspect Name"
                  placeholder="Suspect name"
                  className="bg-slate-900 border border-slate-700 text-purple-200 text-xs rounded px-2 py-0.5 outline-none font-bold w-36"
                />
                <input
                  type="text"
                  value={suspectArchetype}
                  onChange={e => setSuspectArchetype(e.target.value)}
                  aria-label="Suspect Role"
                  placeholder="Role / Archetype"
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-0.5 outline-none w-32"
                />
                {linkedPersonas.length > 0 && (
                  <select
                    aria-label="Select Scenario Suspect"
                    value=""
                    onChange={(e) => {
                      const picked = linkedPersonas.find(p => (p.id || p.title || p.name) === e.target.value);
                      if (picked) {
                        setSuspectName(picked.title || picked.name || 'Suspect');
                        setSuspectArchetype(picked.fields?.role || picked.fields?.archetype || picked.fields?.occupation || picked.type || 'Persona');
                      }
                    }}
                    className="bg-slate-900 border border-purple-500/40 text-purple-300 text-[11px] rounded px-1.5 py-0.5 outline-none"
                  >
                    <option value="">Linked Personas...</option>
                    {linkedPersonas.map((p) => (
                      <option key={p.id || p.title} value={p.id || p.title || p.name}>
                        {p.title || p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Social Check:</span>
                <select
                  value={activeSkill}
                  onChange={e => setActiveSkill(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-purple-300 text-xs rounded px-1.5 py-0.5 outline-none font-bold"
                >
                  <option value="Etiquette">Etiquette (Charm/Persuasion)</option>
                  <option value="Intimidation">Intimidation (Threats/Force)</option>
                  <option value="Perception">Perception (Spotting Lies)</option>
                </select>
              </div>
            </div>

            {/* Dialogue History Feed */}
            <div className="flex-1 overflow-y-auto bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2.5 scrollbar-thin select-text">
              {interrogationHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border ${
                    item.speaker === 'operative' 
                      ? 'bg-purple-950/40 border-purple-500/30 text-purple-200 ml-4' 
                      : 'bg-slate-900 border-slate-800 text-slate-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span className={item.speaker === 'operative' ? 'text-purple-400' : 'text-amber-400'}>
                      {item.speaker === 'operative' ? `Operator (${item.skill} Check)` : suspectName}
                    </span>
                    {item.margin !== undefined && (
                      <span className={item.isSuccess ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.isSuccess ? `✓ Margin +${item.margin}` : `✗ Margin ${item.margin}`}
                      </span>
                    )}
                  </div>
                  <p className="font-sans leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Interrogation Query Form */}
            <form onSubmit={handleAskInterrogation} className="flex gap-2">
              <input
                type="text"
                value={interrogationQuery}
                onChange={e => setInterrogationQuery(e.target.value)}
                placeholder="Ask open-ended question or press suspect for intelligence..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-400 text-slate-100 p-2 rounded-xl text-xs outline-none font-sans"
              />
              <button
                type="submit"
                disabled={isInterrogating}
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-bold uppercase transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isInterrogating ? <Loader2 size={12} className="animate-spin" /> : null}
                <span>{isInterrogating ? 'Probing...' : 'Question'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <span className="text-[10px] text-slate-500">
            Adjudicated via canonical Tangent SFF RPG 2d10 rules engine
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isStoryReadOnly}
              onClick={() => {
                if (isStoryReadOnly) return;
                handleExportToStory();
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy size={12} />
              <span>Insert Log into Manuscript</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
