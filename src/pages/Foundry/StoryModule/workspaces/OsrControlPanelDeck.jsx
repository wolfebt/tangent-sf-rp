/**
 * @file OsrControlPanelDeck.jsx
 * @description Integrated OSR Control Panel Deck for ADE Scenarios.
 * Provides boxed sensory read-alouds (GM scripts), scannable bullet points with bracketed DCs,
 * 3-tier threat matrices, and classified GM discoveries with AI generation assist and thinking indicators.
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  ShieldAlert, 
  HelpCircle, 
  Dices, 
  Plus, 
  Trash2, 
  Loader2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';
import { generateContent } from '../../../../services/aimeService';

export default function OsrControlPanelDeck({ activeNode, updateStory, guidanceGems = '' }) {
  if (!activeNode) return null;

  const fields = activeNode.fields || {};
  const readAloud = fields.readAloud || '';
  const bulletPoints = Array.isArray(fields.bulletPoints) ? fields.bulletPoints : [];
  const threats = Array.isArray(fields.threats) ? fields.threats : [];
  const gmSecrets = fields.gmSecrets || fields.complications || '';

  const [isExpanded, setIsExpanded] = useState(true);
  const [newBulletText, setNewBulletText] = useState('');
  
  // Threat creator state
  const [newThreatName, setNewThreatName] = useState('');
  const [newThreatTier, setNewThreatTier] = useState('Tier 1 (Minion)');
  const [newThreatHp, setNewThreatHp] = useState('12');
  const [newThreatDr, setNewThreatDr] = useState('2');
  const [newThreatAttack, setNewThreatAttack] = useState('Kinetic Carbine (2d10+2, DC 12)');

  // AI Generation loading states
  const [isGeneratingReadAloud, setIsGeneratingReadAloud] = useState(false);
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);
  const [isGeneratingThreats, setIsGeneratingThreats] = useState(false);
  const [isGeneratingSecrets, setIsGeneratingSecrets] = useState(false);

  // Dice roll check state
  const [recentRoll, setRecentRoll] = useState(null);

  const handleUpdateField = (fieldName, val) => {
    updateStory(activeNode.id, {
      fields: {
        ...(activeNode.fields || {}),
        [fieldName]: val
      }
    });
  };

  const handleRollCheck = (dcText) => {
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const total = d1 + d2 + 3; // Standard operative +3 modifier
    AudioService.playTerminalBeep(1200, 0.08);

    setRecentRoll({
      label: dcText.slice(0, 40),
      text: `Rolled ${d1}+${d2}+3 = ${total}`
    });
    setTimeout(() => setRecentRoll(null), 4000);
  };

  // Add & delete bullet points
  const handleAddBullet = (e) => {
    if (e) e.preventDefault();
    if (!newBulletText.trim()) return;
    const updated = [...bulletPoints, newBulletText.trim()];
    handleUpdateField('bulletPoints', updated);
    setNewBulletText('');
    AudioService.playTerminalBeep(1100, 0.03);
  };

  const handleDeleteBullet = (index) => {
    const updated = bulletPoints.filter((_, i) => i !== index);
    handleUpdateField('bulletPoints', updated);
    AudioService.playTerminalBeep(700, 0.04);
  };

  // Add & delete threats
  const handleAddThreat = (e) => {
    if (e) e.preventDefault();
    if (!newThreatName.trim()) return;
    const newThreat = {
      id: `th_${Date.now()}`,
      name: newThreatName.trim(),
      tier: newThreatTier,
      hp: newThreatHp.trim() || '10',
      dr: newThreatDr.trim() || '0',
      attack: newThreatAttack.trim() || 'Kinetic Pulse'
    };
    handleUpdateField('threats', [...threats, newThreat]);
    setNewThreatName('');
    AudioService.playTerminalBeep(1150, 0.04);
  };

  const handleDeleteThreat = (index) => {
    const updated = threats.filter((_, i) => i !== index);
    handleUpdateField('threats', updated);
    AudioService.playTerminalBeep(700, 0.04);
  };

  // ── AI ASSIST GENERATORS WITH STATUS SPINNERS ──

  const handleAiGenerateReadAloud = async () => {
    setIsGeneratingReadAloud(true);
    AudioService.playTerminalBeep(1000, 0.05);
    const prompt = `Write a vivid, sensory-rich 2-3 sentence Read-Aloud GM script for the players entering this sci-fi RPG scenario:
Scenario: "${activeNode.title || 'Scene'}"
Guidance Gems: ${guidanceGems || 'Sci-Fi'}
Tone: Immediate, immersive, atmospheric (lighting, sounds, temperature, ozone smells).`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        handleUpdateField('readAloud', result.trim());
      }
    } catch (err) {
      console.warn('AI Read-Aloud failed:', err);
    } finally {
      setIsGeneratingReadAloud(false);
    }
  };

  const handleAiGenerateBullets = async () => {
    setIsGeneratingBullets(true);
    AudioService.playTerminalBeep(1000, 0.05);
    const prompt = `Generate 4 scannable tactical interaction bullet points with bracketed DCs for this RPG scene:
Scenario: "${activeNode.title || 'Scene'}"
Guidance Gems: ${guidanceGems || 'Sci-Fi'}
Format each on its own line:
- [Perception DC 12] description of clue or sensor alert
- [Tech / Slicing DC 13] description of terminal or hackable system
- [Agility / Cover DC 11] description of tactical terrain or obstacle
- [Culture / Faction DC 12] description of insignia or lore interactable`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        const parsed = result
          .split('\n')
          .map(l => l.replace(/^[-*]\s*/, '').trim())
          .filter(l => l.length > 5);
        if (parsed.length > 0) {
          handleUpdateField('bulletPoints', [...bulletPoints, ...parsed]);
        }
      }
    } catch (err) {
      console.warn('AI Bullets failed:', err);
    } finally {
      setIsGeneratingBullets(false);
    }
  };

  const handleAiGenerateThreats = async () => {
    setIsGeneratingThreats(true);
    AudioService.playTerminalBeep(1000, 0.05);
    const prompt = `Generate a 3-Tier Threat Matrix (Minion, Operative, Boss) for this sci-fi RPG scenario:
Scenario: "${activeNode.title || 'Scene'}"
Format strictly as JSON array:
[
  {"name": "Adversary 1", "tier": "Tier 1 (Minion)", "hp": "12", "dr": "1", "attack": "Kinetic Carbine (2d10, DC 11)"},
  {"name": "Adversary 2", "tier": "Tier 2 (Operative)", "hp": "24", "dr": "3", "attack": "Plasma Scattergun (2d10+4, DC 13)"},
  {"name": "Adversary 3", "tier": "Tier 3 (Apex/Boss)", "hp": "45", "dr": "5", "attack": "Particle Lance & Force Blade (2d10+6, DC 15)"}
]`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        handleUpdateField('threats', [...threats, ...parsed]);
      }
    } catch (err) {
      console.warn('AI Threat generation failed:', err);
    } finally {
      setIsGeneratingThreats(false);
    }
  };

  const handleAiGenerateSecrets = async () => {
    setIsGeneratingSecrets(true);
    AudioService.playTerminalBeep(1000, 0.05);
    const prompt = `Generate 2-3 classified GM operational secrets, hidden complications, reinforcement triggers, or room hazards for:
Scenario: "${activeNode.title || 'Scene'}"
Guidance Gems: ${guidanceGems || 'Sci-Fi'}`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        handleUpdateField('gmSecrets', result.trim());
      }
    } catch (err) {
      console.warn('AI Secrets failed:', err);
    } finally {
      setIsGeneratingSecrets(false);
    }
  };

  return (
    <div className="border-t border-slate-800 bg-[#0a0d15] p-4 font-sans select-none space-y-4 shrink-0">
      
      {/* Control Panel Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">⚡</span>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
            OSR Control Panel Deck
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
            Read-Aloud &bull; Tactical Bullets &bull; Threat Matrix &bull; GM Secrets
          </span>
        </div>

        <div className="flex items-center gap-3">
          {recentRoll && (
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm animate-pulse">
              🎲 {recentRoll.label}: {recentRoll.text}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          
          {/* COLUMN 1: READ-ALOUD & TACTICAL BULLETS */}
          <div className="space-y-4">
            
            {/* Sensory Read-Aloud GM Script */}
            <div className="p-3.5 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Sensory Read-Aloud (GM Script)</span>
                </span>
                <button
                  type="button"
                  onClick={handleAiGenerateReadAloud}
                  disabled={isGeneratingReadAloud}
                  className="px-2 py-0.5 rounded bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  title="Generate or enhance Read-Aloud with AIME"
                >
                  {isGeneratingReadAloud ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-amber-400" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={10} />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={readAloud}
                onChange={(e) => handleUpdateField('readAloud', e.target.value)}
                placeholder="Author 2-3 evocative, atmospheric sentences for the GM to read aloud..."
                className="w-full h-20 p-2 bg-slate-950/80 border border-slate-800 rounded-lg font-serif italic text-xs text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none leading-relaxed select-text"
              />
            </div>

            {/* Scannable Bullet Points & Bracketed DCs */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Target size={13} className="text-cyan-400" />
                  <span>Tactical Bullets & DCs ({bulletPoints.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAiGenerateBullets}
                  disabled={isGeneratingBullets}
                  className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  title="Generate tactical interaction bullet points with AIME"
                >
                  {isGeneratingBullets ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-cyan-400" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={10} />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bullet list */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {bulletPoints.length === 0 ? (
                  <p className="text-slate-500 text-[11px] font-mono italic p-2">
                    No tactical bullets configured. Add interactive items, clues, or DCs below.
                  </p>
                ) : (
                  bulletPoints.map((bp, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 px-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-2 group"
                    >
                      <span className="font-sans text-[11px] leading-relaxed truncate select-text">{bp}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRollCheck(bp)}
                          className="p-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-400 text-[10px] cursor-pointer transition-colors"
                          title="Roll 2d10 Check against this DC"
                        >
                          <Dices size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBullet(idx)}
                          className="p-1 rounded hover:bg-red-950/60 text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                          title="Delete bullet"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Bullet Form */}
              <form onSubmit={handleAddBullet} className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={newBulletText}
                  onChange={(e) => setNewBulletText(e.target.value)}
                  placeholder="e.g. [Tech DC 13] Bypass security console to vent chamber..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={!newBulletText.trim()}
                  className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-mono font-bold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </form>
            </div>

          </div>

          {/* COLUMN 2: 3-TIER THREAT MATRIX & GM SECRETS */}
          <div className="space-y-4">
            
            {/* 3-Tier Threat Matrix */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldAlert size={13} className="text-rose-400" />
                  <span>3-Tier Threat Matrix ({threats.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAiGenerateThreats}
                  disabled={isGeneratingThreats}
                  className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  title="Generate 3-Tier Threat Matrix with AIME"
                >
                  {isGeneratingThreats ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-rose-400" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={10} />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Threat cards */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {threats.length === 0 ? (
                  <p className="text-slate-500 text-[11px] font-mono italic p-2">
                    No threat entities assigned. Add Minions, Operatives, or Apex threats below.
                  </p>
                ) : (
                  threats.map((th, idx) => (
                    <div
                      key={th.id || idx}
                      className="p-2 rounded-lg bg-red-950/20 border border-red-500/30 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{th.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/40">
                            {th.tier}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteThreat(idx)}
                            className="text-slate-500 hover:text-red-400 cursor-pointer"
                            title="Delete threat"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-3">
                        <span>HP: <strong className="text-emerald-400">{th.hp}</strong></span>
                        <span>DR: <strong className="text-cyan-300">{th.dr}</strong></span>
                        <span className="truncate">Atk: <strong className="text-amber-300">{th.attack}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Threat Form */}
              <form onSubmit={handleAddThreat} className="grid grid-cols-2 gap-1.5 pt-1">
                <input
                  type="text"
                  value={newThreatName}
                  onChange={(e) => setNewThreatName(e.target.value)}
                  placeholder="Threat Name (e.g. Sentry Drone)"
                  className="col-span-2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-rose-400"
                />
                <select
                  value={newThreatTier}
                  onChange={(e) => setNewThreatTier(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 font-mono outline-none"
                >
                  <option value="Tier 1 (Minion)">Tier 1 (Minion)</option>
                  <option value="Tier 2 (Operative)">Tier 2 (Operative)</option>
                  <option value="Tier 3 (Apex/Boss)">Tier 3 (Apex/Boss)</option>
                </select>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newThreatHp}
                    onChange={(e) => setNewThreatHp(e.target.value)}
                    placeholder="HP"
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono text-center"
                    title="Hit Points"
                  />
                  <input
                    type="text"
                    value={newThreatDr}
                    onChange={(e) => setNewThreatDr(e.target.value)}
                    placeholder="DR"
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono text-center"
                    title="Damage Reduction"
                  />
                </div>
                <input
                  type="text"
                  value={newThreatAttack}
                  onChange={(e) => setNewThreatAttack(e.target.value)}
                  placeholder="Attack formula (e.g. Pulse Rifle 2d10+3)"
                  className="col-span-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!newThreatName.trim()}
                  className="col-span-1 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 rounded-lg text-xs font-mono font-bold transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus size={11} />
                  <span>Add Threat</span>
                </button>
              </form>
            </div>

            {/* Classified GM Discoveries & Secrets */}
            <div className="p-3.5 bg-slate-950/80 border border-purple-500/40 rounded-xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-purple-300 flex items-center gap-1.5 uppercase">
                  <HelpCircle size={13} className="text-purple-400" />
                  <span>Classified GM Discovery / Complication</span>
                </span>
                <button
                  type="button"
                  onClick={handleAiGenerateSecrets}
                  disabled={isGeneratingSecrets}
                  className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  title="Generate hidden GM secrets and complications with AIME"
                >
                  {isGeneratingSecrets ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-purple-400" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={10} />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={gmSecrets}
                onChange={(e) => handleUpdateField('gmSecrets', e.target.value)}
                placeholder="Author secret GM discoveries, reinforcement timers, traps, or room twists..."
                className="w-full h-20 p-2 bg-slate-950/90 border border-purple-500/30 rounded-lg font-mono text-xs text-purple-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/60 resize-none leading-relaxed select-text"
              />
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
