/**
 * @file GraphInspectorDrawer.jsx
 * @description Slide-out glass-cockpit properties inspector for the ADE Story Graph.
 * Supports deep editing of selected Scenario Nodes (prose, beats, choices, map links, OSR secrets),
 * selected Edge Connections (labels, DCs, conditions), and Module Graph Continuity Telemetry.
 */

import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Play, 
  Map as MapIcon, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Sliders, 
  ArrowRight, 
  ShieldAlert, 
  Crosshair, 
  ExternalLink,
  Flag,
  Copy,
  Layers,
  HelpCircle
} from 'lucide-react';
import { getNodeTypeConfig } from './graphUtils';
import { AudioService } from '../../../../../services/audioService';
import { v4 as uuidv4 } from 'uuid';

export const GraphInspectorDrawer = ({
  isOpen = false,
  onClose,
  selectedNode = null,
  selectedEdge = null,
  allNodes = [],
  allMaps = [],
  continuityHealth = null,
  onUpdateNode,
  onDeleteNode,
  onUpdateEdge,
  onDeleteEdge,
  onOpenWeaver,
  onOpenPlay,
  onPanStage,
  onAddBranchNode,
  onAutoLayout,
  onOpenAime
}) => {
  const [activeTab, setActiveTab] = useState('narrative'); // 'narrative' | 'choices' | 'mechanics'
  const [newBeatInput, setNewBeatInput] = useState('');
  const [newChoiceText, setNewChoiceText] = useState('');
  const [newChoiceTargetId, setNewChoiceTargetId] = useState('');
  const [newChoiceDc, setNewChoiceDc] = useState('');
  const [newChoiceAttr, setNewChoiceAttr] = useState('agility');

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────
  // 1. SELECTED EDGE INSPECTOR
  // ─────────────────────────────────────────────────────────────
  if (selectedEdge) {
    const srcNode = allNodes.find(n => n.id === selectedEdge.sourceId);
    const tgtNode = allNodes.find(n => n.id === selectedEdge.targetId);

    const handleSaveEdgeField = (key, value) => {
      if (!onUpdateEdge) return;
      onUpdateEdge(selectedEdge, { [key]: value });
    };

    return (
      <aside className="w-80 sm:w-96 bg-[#0a0f18]/98 backdrop-blur-xl border-l border-slate-800 h-full flex flex-col z-30 shadow-2xl font-mono text-xs select-none animate-in slide-in-from-right duration-200">
        {/* Edge Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Branch Edge Inspector
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Edge Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Source -> Target Nodes */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Connection Topology
            </div>
            <div className="flex items-center justify-between text-[11px] gap-2">
              <span className="truncate max-w-[120px] text-cyan-300 font-bold" title={srcNode?.title}>
                {srcNode?.title || 'Source'}
              </span>
              <ArrowRight size={14} className="text-amber-400 shrink-0" />
              <span className="truncate max-w-[120px] text-purple-300 font-bold" title={tgtNode?.title}>
                {tgtNode?.title || 'Target'}
              </span>
            </div>
          </div>

          {/* Label Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Branch / Choice Label
            </label>
            <input
              type="text"
              value={selectedEdge.label || ''}
              onChange={(e) => handleSaveEdgeField('label', e.target.value)}
              placeholder="e.g. Slicing Console / Stealth Insertion..."
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-100 font-mono text-xs outline-none"
            />
          </div>

          {/* Skill Check DC & Attribute */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Skill Check / DC Target</span>
              <span className="text-amber-400 text-[9px] font-bold">Optional</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedEdge.attribute || 'agility'}
                onChange={(e) => handleSaveEdgeField('attribute', e.target.value)}
                className="px-2 py-1.5 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-100 font-mono text-xs outline-none"
              >
                <option value="strength">Strength</option>
                <option value="agility">Agility</option>
                <option value="stamina">Stamina</option>
                <option value="intellect">Intellect</option>
                <option value="wisdom">Wisdom</option>
                <option value="charisma">Charisma</option>
              </select>

              <input
                type="number"
                value={selectedEdge.checkDc ?? ''}
                onChange={(e) => handleSaveEdgeField('checkDc', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="DC (e.g. 12)"
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-100 font-mono text-xs outline-none"
              />
            </div>
          </div>

          {/* Condition Requirement */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Condition Requirement
            </label>
            <input
              type="text"
              value={selectedEdge.condition || ''}
              onChange={(e) => handleSaveEdgeField('condition', e.target.value)}
              placeholder="e.g. Has Security Keycard A-9..."
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-100 font-mono text-xs outline-none"
            />
          </div>

          {/* Delete Edge Action */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (onDeleteEdge) onDeleteEdge(selectedEdge);
              }}
              className="w-full py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 size={13} />
              <span>Delete Connection Wire</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SELECTED NODE INSPECTOR
  // ─────────────────────────────────────────────────────────────
  if (selectedNode) {
    const typeConfig = getNodeTypeConfig(selectedNode.type);
    const linkedMap = allMaps.find(m => m.id === selectedNode.mapId);
    const rawBeats = selectedNode.fields?.sceneBeats || '';
    const beatsList = rawBeats.split('\n').map(b => b.trim()).filter(Boolean);
    const choices = selectedNode.fields?.choices || [];
    const connections = selectedNode.fields?.connections || [];

    const handleSaveNodeField = (key, value) => {
      if (!onUpdateNode) return;
      onUpdateNode(selectedNode.id, { [key]: value });
    };

    const handleSaveCustomField = (key, value) => {
      if (!onUpdateNode) return;
      onUpdateNode(selectedNode.id, {
        fields: {
          ...(selectedNode.fields || {}),
          [key]: value
        }
      });
    };

    const handleAddBeat = () => {
      if (!newBeatInput.trim()) return;
      const updated = [...beatsList, newBeatInput.trim()].join('\n');
      handleSaveCustomField('sceneBeats', updated);
      setNewBeatInput('');
      AudioService.playTerminalBeep(1200, 0.02);
    };

    const handleDeleteBeat = (idx) => {
      const updated = beatsList.filter((_, i) => i !== idx).join('\n');
      handleSaveCustomField('sceneBeats', updated);
    };

    const handleAddChoice = () => {
      if (!newChoiceText.trim() || !newChoiceTargetId) return;
      const newChoiceObj = {
        id: `choice_${uuidv4().slice(0, 8)}`,
        text: newChoiceText.trim(),
        targetScenarioId: newChoiceTargetId,
        attribute: newChoiceAttr,
        checkDc: newChoiceDc ? Number(newChoiceDc) : undefined
      };
      handleSaveCustomField('choices', [...choices, newChoiceObj]);
      setNewChoiceText('');
      setNewChoiceTargetId('');
      setNewChoiceDc('');
      AudioService.playCriticalChime(true);
    };

    const handleDeleteChoice = (choiceId) => {
      const updated = choices.filter(c => c.id !== choiceId);
      handleSaveCustomField('choices', updated);
    };

    return (
      <aside className="w-80 sm:w-96 bg-[#0a0f18]/98 backdrop-blur-xl border-l border-slate-800 h-full flex flex-col z-30 shadow-2xl font-mono text-xs select-none animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: typeConfig.dotColor }}
            />
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] truncate">
              {selectedNode.title || 'Scenario Node'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <X size={14} />
          </button>
        </div>

        {/* Quick Launch Action Strip */}
        <div className="p-2 px-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenWeaver && onOpenWeaver(selectedNode)}
            className="flex-1 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold flex items-center justify-center gap-1 text-[10px] cursor-pointer transition-colors"
            title="Open in Story Weaver Editor"
          >
            <BookOpen size={11} />
            <span>Weaver</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPlay && onOpenPlay(selectedNode)}
            className="flex-1 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold flex items-center justify-center gap-1 text-[10px] cursor-pointer transition-colors"
            title="Launch Interactive Play Studio"
          >
            <Play size={11} />
            <span>Play</span>
          </button>

          {linkedMap && (
            <button
              type="button"
              onClick={() => onPanStage && onPanStage(selectedNode)}
              className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] cursor-pointer"
              title="Pan Stage to Map"
            >
              <Crosshair size={11} />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 shrink-0 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('narrative')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'narrative'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Narrative
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('choices')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'choices'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Choices ({choices.length + connections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'mechanics'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            OSR / Sector
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* TAB 1: NARRATIVE & BEATS */}
          {activeTab === 'narrative' && (
            <div className="space-y-4">
              {/* Title & Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scenario Title
                </label>
                <input
                  type="text"
                  value={selectedNode.title || ''}
                  onChange={(e) => handleSaveNodeField('title', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-100 font-mono text-xs outline-none"
                  placeholder="Scenario Title..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Narrative Type
                </label>
                <select
                  value={selectedNode.type || 'Scene'}
                  onChange={(e) => handleSaveNodeField('type', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-100 font-mono text-xs outline-none"
                >
                  <option value="Act">Act / Arc Root</option>
                  <option value="Scene">Narrative Scene</option>
                  <option value="Encounter">Tactical Encounter</option>
                  <option value="Choice">Decision Gate</option>
                  <option value="Climax">Climax / Boss</option>
                  <option value="Resolution">Resolution / Finale</option>
                  <option value="Secret">Secret / Anomaly</option>
                </select>
              </div>

              {/* Read-Aloud Prose */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Sensory Read-Aloud Prose</span>
                  <span className="text-slate-500 text-[9px]">Markdown</span>
                </label>
                <textarea
                  rows={4}
                  value={selectedNode.content || ''}
                  onChange={(e) => handleSaveNodeField('content', e.target.value)}
                  placeholder="Atmospheric prose to read aloud when operatives arrive..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-200 font-sans text-xs leading-relaxed outline-none resize-y"
                />
              </div>

              {/* Linked Tactical Map */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapIcon size={12} className="text-cyan-400" />
                    <span>Linked Map Sector</span>
                  </span>
                  {selectedNode.mapId && (
                    <button
                      type="button"
                      onClick={() => handleSaveNodeField('mapId', null)}
                      className="text-[9px] text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Unlink
                    </button>
                  )}
                </label>
                <select
                  value={selectedNode.mapId || ''}
                  onChange={(e) => handleSaveNodeField('mapId', e.target.value || null)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-100 font-mono text-xs outline-none"
                >
                  <option value="">No Map Linked</option>
                  {allMaps.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title || 'Untitled Map'} ({m.waypoints?.length || 0} waypoints)
                    </option>
                  ))}
                </select>
              </div>

              {/* Scene Beats Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Scene Beats Checklist</span>
                  <span className="text-purple-400 font-bold">{beatsList.length} Beats</span>
                </label>

                {beatsList.length > 0 ? (
                  <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                    {beatsList.map((beat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 group"
                      >
                        <span className="text-[11px] text-slate-200 font-sans truncate flex-1">
                          {idx + 1}. {beat}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteBeat(idx)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No sequential beats defined.</p>
                )}

                {/* Add Beat Input */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newBeatInput}
                    onChange={(e) => setNewBeatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBeat()}
                    placeholder="New milestone beat..."
                    className="flex-1 px-2 py-1 bg-slate-900 border border-slate-750 focus:border-cyan-400 rounded text-slate-200 text-xs font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddBeat}
                    className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold rounded cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHOICES & BRANCHING */}
          {activeTab === 'choices' && (
            <div className="space-y-4">
              {/* Existing Choices */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Outgoing Decision Branches ({choices.length})
                </label>

                {choices.length > 0 ? (
                  <div className="space-y-2">
                    {choices.map(c => {
                      const tgt = allNodes.find(n => n.id === c.targetScenarioId);
                      return (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300 text-[11px] truncate flex-1">
                              {c.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteChoice(c.id)}
                              className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>➔ {tgt?.title || 'Unknown Target'}</span>
                            {c.checkDc && (
                              <span className="text-amber-400 font-bold">
                                {c.attribute?.toUpperCase()} CR {c.checkDc}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No player choice branches defined.</p>
                )}
              </div>

              {/* Add New Choice Form */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  + Add Decision Choice
                </div>

                <input
                  type="text"
                  value={newChoiceText}
                  onChange={(e) => setNewChoiceText(e.target.value)}
                  placeholder="Choice description (e.g. Slicing Console)..."
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-200 text-xs font-mono outline-none"
                />

                <select
                  value={newChoiceTargetId}
                  onChange={(e) => setNewChoiceTargetId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg text-slate-200 text-xs font-mono outline-none"
                >
                  <option value="">Select Target Scenario...</option>
                  {allNodes
                    .filter(n => n.id !== selectedNode.id)
                    .map(n => (
                      <option key={n.id} value={n.id}>
                        {n.title || 'Untitled'} ({n.type || 'Scene'})
                      </option>
                    ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newChoiceAttr}
                    onChange={(e) => setNewChoiceAttr(e.target.value)}
                    className="px-2 py-1.5 bg-slate-950 border border-slate-750 rounded-lg text-slate-200 text-xs outline-none"
                  >
                    <option value="strength">Strength</option>
                    <option value="agility">Agility</option>
                    <option value="stamina">Stamina</option>
                    <option value="intellect">Intellect</option>
                    <option value="wisdom">Wisdom</option>
                    <option value="charisma">Charisma</option>
                  </select>

                  <input
                    type="number"
                    value={newChoiceDc}
                    onChange={(e) => setNewChoiceDc(e.target.value)}
                    placeholder="DC (e.g. 12)"
                    className="px-2 py-1.5 bg-slate-950 border border-slate-750 rounded-lg text-slate-200 text-xs font-mono outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Create Branch Choice
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: OSR & MECHANICS */}
          {activeTab === 'mechanics' && (
            <div className="space-y-4">
              {/* Tech Level & Meta Level */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Tech Level (TL)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={selectedNode.fields?.['tech-level'] ?? selectedNode.fields?.techLevel ?? 3}
                    onChange={(e) => handleSaveCustomField('tech-level', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-750 rounded text-slate-100 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Meta Level (ML)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={selectedNode.fields?.['meta-level'] ?? selectedNode.fields?.metaLevel ?? 0}
                    onChange={(e) => handleSaveCustomField('meta-level', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-750 rounded text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Secrets & Clues */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Hidden Secrets & Clues
                </label>
                <textarea
                  rows={3}
                  value={selectedNode.fields?.secrets || ''}
                  onChange={(e) => handleSaveCustomField('secrets', e.target.value)}
                  placeholder="DC 14 Perception reveals hidden safe behind air vent..."
                  className="w-full p-2 bg-slate-900 border border-slate-750 rounded-lg text-slate-200 text-xs font-sans outline-none resize-y"
                />
              </div>

              {/* Tactical Threats / Monsters */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Tactical Threats & NPCs
                </label>
                <textarea
                  rows={3}
                  value={selectedNode.fields?.threatsNotes || ''}
                  onChange={(e) => handleSaveCustomField('threatsNotes', e.target.value)}
                  placeholder="2x Void Marine Sentry (Tier 2), 1x Automated Defense Turret..."
                  className="w-full p-2 bg-slate-900 border border-slate-750 rounded-lg text-slate-200 text-xs font-sans outline-none resize-y"
                />
              </div>
            </div>
          )}

          {/* Delete Scenario Node Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onDeleteNode && onDeleteNode(selectedNode)}
              className="w-full py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 size={13} />
              <span>Delete Scenario Node</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ADVENTURE MODULE GRAPH OVERVIEW (NO SELECTION)
  // ─────────────────────────────────────────────────────────────
  return (
    <aside className="w-80 sm:w-96 bg-[#0a0f18]/98 backdrop-blur-xl border-l border-slate-800 h-full flex flex-col z-30 shadow-2xl font-mono text-xs select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-purple-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Adventure Topology
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Health Score Card */}
        {continuityHealth && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Narrative Flow Readiness
              </span>
              <span className={`text-base font-extrabold ${
                continuityHealth.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {continuityHealth.score}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  continuityHealth.score >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${continuityHealth.score}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">{continuityHealth.nodeCount}</div>
                <div className="text-[8.5px] text-slate-400">Nodes</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">{continuityHealth.linkCount}</div>
                <div className="text-[8.5px] text-slate-400">Branches</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-amber-400">{continuityHealth.orphanCount}</div>
                <div className="text-[8.5px] text-slate-400">Orphans</div>
              </div>
            </div>
          </div>
        )}

        {/* Continuity Issues */}
        {continuityHealth?.issues?.length > 0 ? (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldAlert size={12} />
              <span>Flow Continuity Findings ({continuityHealth.issues.length})</span>
            </div>

            <div className="space-y-1.5">
              {continuityHealth.issues.map(iss => (
                <div
                  key={iss.id}
                  className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-[10.5px] font-sans text-amber-200 leading-snug"
                >
                  {iss.message}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-sans flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>All narrative scenario nodes are connected with clean progression exits!</span>
          </div>
        )}

        {/* Quick Module Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick Actions
          </div>

          <button
            type="button"
            onClick={() => onAddBranchNode && onAddBranchNode(null)}
            className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus size={13} />
            <span>Create Root Scenario Node</span>
          </button>

          <button
            type="button"
            onClick={onAutoLayout}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sliders size={13} />
            <span>Auto-Format Hierarchical Tree</span>
          </button>

          {onOpenAime && (
            <button
              type="button"
              onClick={onOpenAime}
              className="w-full py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles size={13} />
              <span>AIME Narrative Co-Pilot</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default React.memo(GraphInspectorDrawer);
