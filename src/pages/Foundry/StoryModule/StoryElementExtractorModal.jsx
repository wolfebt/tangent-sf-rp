/**
 * @file StoryElementExtractorModal.jsx
 * @description In-Situ Component Extractor & Creator for ADE Studio.
 * Turns narrative story prose into discrete, structured Omnicortex game assets
 * (Personas, Items, Smart Props, Hazards, Clues, Factions) ready for The Stage VTT.
 */

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Sparkles, 
  X, 
  Check, 
  Bot, 
  Box, 
  Terminal, 
  AlertTriangle, 
  FileText, 
  Shield, 
  Crosshair,
  Database,
  Layers,
  Wand2,
  Loader2
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { generateContent } from '../../../services/aimeService';
import { useStory } from '../../../context/CampaignContext';
import { useDBM } from '../../../context/DBMContext';
import { syncElementToOmnicortexDBM } from '../../../utils/storyAssetAdapter';

export default function StoryElementExtractorModal({
  isOpen,
  onClose,
  initialText = '',
  activeNode = null,
  onCreated = null
}) {
  const { updateSavedElement, updateStory } = useStory();
  const dbm = useDBM();

  const [type, setType] = useState('Persona'); // 'Persona' | 'Item' | 'Smart Prop' | 'Hazard' | 'Clue' | 'Faction'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [linkToScenario, setLinkToScenario] = useState(true);
  const [syncToOmnicortex, setSyncToOmnicortex] = useState(true);

  // Type-specific game context mechanics fields
  // 1. Persona
  const [species, setSpecies] = useState('Human');
  const [archetype, setArchetype] = useState('Operative');
  const [health, setHealth] = useState(30);
  const [vitality, setVitality] = useState(30);
  const [structure, setStructure] = useState(30);
  const [armorDr, setArmorDr] = useState(6);
  const [personaRole, setPersonaRole] = useState('Neutral NPC');
  const [attacksSummary, setAttacksSummary] = useState('TL3 Kinetic Pistol (2d10+2 kinetic)');

  // 2. Item
  const [itemCategory, setItemCategory] = useState('weaponry');
  const [damageDice, setDamageDice] = useState('2d10+3');
  const [techLevel, setTechLevel] = useState(3);
  const [itemRarity, setItemRarity] = useState('Prototype');
  const [cpCost, setCpCost] = useState(10);

  // 3. Smart Prop / Interactive Object
  const [propType, setPropType] = useState('security_terminal');
  const [hackDc, setHackDc] = useState(13);
  const [strengthDc, setStrengthDc] = useState(16);
  const [propStructure, setPropStructure] = useState(20);
  const [clueIntel, setClueIntel] = useState('');
  const [lootPayloadDesc, setLootPayloadDesc] = useState('');

  // 4. Hazard / Trap
  const [trapType, setTrapType] = useState('proximity_plasma_mine');
  const [saveCr, setSaveCr] = useState(14);
  const [hazardDamage, setHazardDamage] = useState('2d10+4');
  const [appliedCondition, setAppliedCondition] = useState('Burning');

  // Initialize from initialText if provided
  useEffect(() => {
    if (initialText) {
      const clean = initialText.replace(/<[^>]+>/g, '').trim();
      const firstLine = clean.split('\n')[0] || '';
      if (firstLine.length > 0 && firstLine.length < 50) {
        setTitle(firstLine);
        setContent(clean.substring(firstLine.length).trim());
      } else {
        setTitle(clean.slice(0, 32));
        setContent(clean);
      }
    }
  }, [initialText]);

  if (!isOpen) return null;

  // AI Auto-Fill / Suggest Mechanics based on Story Context
  const handleAiSuggestMechanics = async () => {
    setIsAiWorking(true);
    AudioService.playTerminalBeep(1100, 0.04);

    const prompt = `Analyze this story excerpt and component title in the Tangent SFF RPG system.
Title: "${title}"
Type: ${type}
Story Excerpt: "${content || initialText || activeNode?.title || ''}"

Return a JSON object only (no markdown wrapping, no extra keys) with recommended game mechanics attributes:
If Type is "Persona": { "title": string, "species": string, "archetype": string, "role": string, "health": number, "vitality": number, "structure": number, "armorDr": number, "attacksSummary": string, "summary": string }
If Type is "Item": { "title": string, "itemCategory": "weaponry"|"armoring"|"gear", "damageDice": string, "techLevel": number, "rarity": string, "cpCost": number, "summary": string }
If Type is "Smart Prop": { "title": string, "propType": "security_terminal"|"blast_door"|"loot_cache"|"power_conduit"|"clue_pad", "hackDc": number, "strengthDc": number, "clueIntel": string, "lootPayloadDesc": string, "summary": string }
If Type is "Hazard": { "title": string, "trapType": "proximity_plasma_mine"|"laser_tripwire"|"neurotoxin_vent"|"cryo_stasis_field", "saveCr": number, "hazardDamage": string, "appliedCondition": string, "summary": string }
If Type is "Clue": { "title": string, "clueIntel": string, "summary": string }`;

    try {
      const res = await generateContent({ prompt, context: activeNode });
      if (res) {
        const cleaned = res.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.title && !title) setTitle(parsed.title);
        if (parsed.summary && !content) setContent(parsed.summary);

        if (type === 'Persona') {
          if (parsed.species) setSpecies(parsed.species);
          if (parsed.archetype) setArchetype(parsed.archetype);
          if (parsed.role) setPersonaRole(parsed.role);
          if (parsed.health) setHealth(parsed.health);
          if (parsed.vitality) setVitality(parsed.vitality);
          if (parsed.structure) setStructure(parsed.structure);
          if (parsed.armorDr) setArmorDr(parsed.armorDr);
          if (parsed.attacksSummary) setAttacksSummary(parsed.attacksSummary);
        } else if (type === 'Item') {
          if (parsed.itemCategory) setItemCategory(parsed.itemCategory);
          if (parsed.damageDice) setDamageDice(parsed.damageDice);
          if (parsed.techLevel) setTechLevel(parsed.techLevel);
          if (parsed.rarity) setItemRarity(parsed.rarity);
          if (parsed.cpCost) setCpCost(parsed.cpCost);
        } else if (type === 'Smart Prop') {
          if (parsed.propType) setPropType(parsed.propType);
          if (parsed.hackDc) setHackDc(parsed.hackDc);
          if (parsed.strengthDc) setStrengthDc(parsed.strengthDc);
          if (parsed.clueIntel) setClueIntel(parsed.clueIntel);
          if (parsed.lootPayloadDesc) setLootPayloadDesc(parsed.lootPayloadDesc);
        } else if (type === 'Hazard') {
          if (parsed.trapType) setTrapType(parsed.trapType);
          if (parsed.saveCr) setSaveCr(parsed.saveCr);
          if (parsed.hazardDamage) setHazardDamage(parsed.hazardDamage);
          if (parsed.appliedCondition) setAppliedCondition(parsed.appliedCondition);
        } else if (type === 'Clue') {
          if (parsed.clueIntel) setClueIntel(parsed.clueIntel);
        }

        AudioService.playCriticalChime(true);
      }
    } catch (e) {
      console.warn('AI Suggest mechanics error:', e);
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleSaveComponent = () => {
    if (!title.trim()) {
      alert('Please enter a component title.');
      return;
    }

    const newId = uuidv4();
    let fields = {};
    let icon = '📦';

    if (type === 'Persona') {
      icon = '🧙‍♂️';
      fields = {
        'char-name': title,
        'char-species': species,
        species,
        'char-concept': archetype,
        archetype,
        role: personaRole,
        health,
        vitality,
        structure,
        armor_dr: armorDr,
        attacks: [{ name: 'Primary Attack', damage: attacksSummary }],
        summary: content,
        plotHooks: content
      };
    } else if (type === 'Item') {
      icon = itemCategory === 'weaponry' ? '⚔️' : itemCategory === 'armoring' ? '🛡️' : '📦';
      fields = {
        itemCategory,
        damage: damageDice,
        'tech-level': techLevel,
        rarity: itemRarity,
        cost_cp: cpCost,
        properties: content,
        description: content
      };
    } else if (type === 'Smart Prop') {
      icon = propType === 'blast_door' ? '🚪' : propType === 'loot_cache' ? '📦' : '💻';
      fields = {
        propType,
        hackDc,
        strengthDc,
        structure: propStructure,
        information: clueIntel,
        description: content,
        lootPayload: lootPayloadDesc ? [{ name: lootPayloadDesc, category: 'gear' }] : []
      };
    } else if (type === 'Hazard') {
      icon = '⚠️';
      fields = {
        isTrap: true,
        trapType,
        saveCr,
        damageDice: hazardDamage,
        appliedCondition,
        description: content
      };
    } else if (type === 'Clue') {
      icon = '📜';
      fields = {
        information: clueIntel || content,
        description: content
      };
    } else {
      fields = { description: content };
    }

    const newElement = {
      id: newId,
      title: title.trim(),
      type: type === 'Smart Prop' ? 'Item' : type,
      content,
      icon,
      fields,
      createdAt: new Date().toISOString()
    };

    // 1. Save to Story Elements Catalog
    updateSavedElement(newId, newElement);

    // 2. Link to active scenario node if selected
    if (linkToScenario && activeNode?.id && updateStory) {
      const existingLinked = activeNode.linkedElements || [];
      if (!existingLinked.includes(newId)) {
        updateStory(activeNode.id, {
          linkedElements: [...existingLinked, newId]
        });
      }
    }

    // 3. Sync to Omnicortex DBM if selected
    if (syncToOmnicortex && dbm) {
      syncElementToOmnicortexDBM(newElement, dbm);
    }

    AudioService.playCriticalChime(true);
    if (onCreated) onCreated(newElement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none font-mono">
      <div className="bg-[#0b1019] border border-cyan-500/60 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-purple-950/80 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-cyan-200 tracking-wider flex items-center gap-2">
                <span>CREATE STORY ELEMENT COMPONENT</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  OMNICORTEX SYNC
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Turns story narrative into discrete game components usable on The Stage VTT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Component Type Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Component Taxonomy:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'Persona', label: 'Persona / NPC', icon: '🧙‍♂️' },
                { id: 'Item', label: 'Item / Gear', icon: '⚔️' },
                { id: 'Smart Prop', label: 'Smart Prop', icon: '💻' },
                { id: 'Hazard', label: 'Trap / Hazard', icon: '⚠️' },
                { id: 'Clue', label: 'Clue / Intel', icon: '📜' },
                { id: 'Faction', label: 'Faction', icon: '🏛️' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id);
                    AudioService.playTerminalBeep(1100, 0.02);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    type === t.id
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="text-[10px] text-center leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & AI Assist */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Component Name / Designation:
              </label>
              <button
                type="button"
                onClick={handleAiSuggestMechanics}
                disabled={isAiWorking}
                className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Use AIME AI to scan prose and synthesize BASTION mechanics"
              >
                {isAiWorking ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                <span>AI Suggest Mechanics</span>
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Plasma Arc Rifle, Sub-Level 3 Terminal, Syndic Enforcer..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none text-xs"
            />
          </div>

          {/* Narrative Story Description */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Narrative Context & Lore Description:
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Describe this element's appearance, narrative role, and atmospheric sensory details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-cyan-500 outline-none text-xs resize-none"
            />
          </div>

          {/* ── TYPE-SPECIFIC GAME CONTEXT & BASTION MECHANICS ── */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚙️</span>
              <span>Tactical BASTION Mechanics (Stage VTT Game Context)</span>
            </span>

            {/* PERSONA MECHANICS */}
            {type === 'Persona' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Species</span>
                  <input
                    type="text"
                    value={species}
                    onChange={e => setSpecies(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-cyan-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Archetype</span>
                  <input
                    type="text"
                    value={archetype}
                    onChange={e => setArchetype(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-purple-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Health / Vitality</span>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={health}
                      onChange={e => setHealth(parseInt(e.target.value, 10) || 0)}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-emerald-300"
                      title="Physical Health"
                    />
                    <input
                      type="number"
                      value={vitality}
                      onChange={e => setVitality(parseInt(e.target.value, 10) || 0)}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-blue-300"
                      title="Mental Vitality"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Armor DR</span>
                  <input
                    type="number"
                    value={armorDr}
                    onChange={e => setArmorDr(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-amber-300"
                  />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <span className="text-[9px] text-slate-400 block mb-1">Attacks &amp; Weapons</span>
                  <input
                    type="text"
                    value={attacksSummary}
                    onChange={e => setAttacksSummary(e.target.value)}
                    placeholder="e.g. Plasma Blade (2d10+4 thermal) / Flechette Carbine"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* ITEM MECHANICS */}
            {type === 'Item' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Category</span>
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-cyan-300"
                  >
                    <option value="weaponry">Weaponry</option>
                    <option value="armoring">Armoring</option>
                    <option value="gear">Tactical Gear</option>
                    <option value="relic">Relic / Artifact</option>
                  </select>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Damage / Protection</span>
                  <input
                    type="text"
                    value={damageDice}
                    onChange={e => setDamageDice(e.target.value)}
                    placeholder="e.g. 2d10+4"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-red-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Tech Level</span>
                  <input
                    type="number"
                    value={techLevel}
                    onChange={e => setTechLevel(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-purple-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">CP Cost</span>
                  <input
                    type="number"
                    value={cpCost}
                    onChange={e => setCpCost(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-amber-300"
                  />
                </div>
              </div>
            )}

            {/* SMART PROP MECHANICS */}
            {type === 'Smart Prop' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Prop Type</span>
                  <select
                    value={propType}
                    onChange={e => setPropType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-cyan-300"
                  >
                    <option value="security_terminal">Security Terminal (Sliceable)</option>
                    <option value="blast_door">Blast Door / Bulkhead</option>
                    <option value="loot_cache">Supply Cache / Container</option>
                    <option value="power_conduit">Power Conduit / Generator</option>
                    <option value="clue_pad">Data Pad / Intel Holocron</option>
                  </select>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Slicing DC (Tech)</span>
                  <input
                    type="number"
                    value={hackDc}
                    onChange={e => setHackDc(parseInt(e.target.value, 10) || 10)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-blue-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Breach DC (STR)</span>
                  <input
                    type="number"
                    value={strengthDc}
                    onChange={e => setStrengthDc(parseInt(e.target.value, 10) || 10)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-amber-300"
                  />
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[9px] text-slate-400 block mb-1">Clue Intel / Decrypted Message</span>
                  <input
                    type="text"
                    value={clueIntel}
                    onChange={e => setClueIntel(e.target.value)}
                    placeholder="Message or secret revealed when sliced/inspected..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-emerald-300"
                  />
                </div>
              </div>
            )}

            {/* HAZARD MECHANICS */}
            {type === 'Hazard' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Trap Type</span>
                  <select
                    value={trapType}
                    onChange={e => setTrapType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-rose-300"
                  >
                    <option value="proximity_plasma_mine">Proximity Plasma Mine</option>
                    <option value="laser_tripwire">Laser Tripwire</option>
                    <option value="neurotoxin_vent">Neurotoxin Gas Vent</option>
                    <option value="cryo_stasis_field">Cryo Stasis Field</option>
                  </select>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Save CR (Reflex/Fort)</span>
                  <input
                    type="number"
                    value={saveCr}
                    onChange={e => setSaveCr(parseInt(e.target.value, 10) || 12)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-cyan-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Damage Dice</span>
                  <input
                    type="text"
                    value={hazardDamage}
                    onChange={e => setHazardDamage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-red-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Condition Applied</span>
                  <input
                    type="text"
                    value={appliedCondition}
                    onChange={e => setAppliedCondition(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-amber-300"
                  />
                </div>
              </div>
            )}

            {/* CLUE MECHANICS */}
            {type === 'Clue' && (
              <div>
                <span className="text-[9px] text-slate-400 block mb-1">Information / Clue Text Revealed:</span>
                <input
                  type="text"
                  value={clueIntel}
                  onChange={e => setClueIntel(e.target.value)}
                  placeholder="Key intel or deduction revealed to player characters upon investigation..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-emerald-300"
                />
              </div>
            )}
          </div>

          {/* Sync Checkboxes */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={linkToScenario}
                onChange={e => setLinkToScenario(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span className="text-[11px]">
                Link directly to active Scenario ({activeNode?.title || 'Current Scenario'})
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={syncToOmnicortex}
                onChange={e => setSyncToOmnicortex(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-0"
              />
              <span className="text-[11px] flex items-center gap-1 text-purple-300">
                <Database size={11} />
                <span>Sync to Omnicortex DBM (Canonical Repository)</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveComponent}
            className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={13} />
            <span>Create &amp; Register Asset</span>
          </button>
        </div>

      </div>
    </div>
  );
}
