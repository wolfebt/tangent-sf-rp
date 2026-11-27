/**
 * @file FlowTab.jsx
 * @description Scenario Flow & Trigger Graph Tab for the STAGE compiler.
 * Supports multi-action trigger pipelines, condition expressions, confirmation gates,
 * one-shot timers, and all canonical StageTriggerAction types.
 */

import React, { useState } from 'react';
import {
  GitBranch,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useStageStore } from '../stageStore';
import { useStoryAssets, useElementAssets } from '../../assetContracts';
import { AudioService } from '../../../../services/audioService';
import { showConfirm } from '../../../../context/ConfirmContext';
import { v4 as uuidv4 } from 'uuid';

const ACTION_TYPES = [
  { id: 'TRIGGER_AIME', label: 'Trigger AIME Sensory Read-Aloud' },
  { id: 'ADVANCE_SCENARIO', label: 'Advance to Scenario' },
  { id: 'REVEAL_BEAT', label: 'Reveal Scene Beat' },
  { id: 'SET_FLAG', label: 'Set Story State Flag' },
  { id: 'APPLY_MODIFIER', label: 'Apply Situational Modifier' },
  { id: 'TOGGLE_DOOR', label: 'Toggle Door / Bulkhead' },
  { id: 'SPAWN_ELEMENT', label: 'Spawn Element on Stage' },
  { id: 'DESPAWN_ELEMENT', label: 'Despawn Element from Stage' },
  { id: 'RUN_MACRO', label: 'Run QuickJS Stage Macro' },
  { id: 'PLAY_AUDIO', label: 'Play Audio Cue' }
];

const createDefaultAction = (type = 'TRIGGER_AIME') => {
  switch (type) {
    case 'SET_FLAG':
      return { type: 'SET_FLAG', key: 'ALERT_ACTIVE', value: true };
    case 'ADVANCE_SCENARIO':
      return { type: 'ADVANCE_SCENARIO', targetScenarioId: '' };
    case 'REVEAL_BEAT':
      return { type: 'REVEAL_BEAT', beatIndex: 0, prompt: '' };
    case 'APPLY_MODIFIER':
      return { type: 'APPLY_MODIFIER', modifierId: 'CUSTOM_MODIFIER' };
    case 'TOGGLE_DOOR':
      return { type: 'TOGGLE_DOOR', wallId: '', isOpen: true };
    case 'SPAWN_ELEMENT':
      return { type: 'SPAWN_ELEMENT', elementId: '' };
    case 'DESPAWN_ELEMENT':
      return { type: 'DESPAWN_ELEMENT', elementId: '' };
    case 'RUN_MACRO':
      return { type: 'RUN_MACRO', scriptId: '' };
    case 'PLAY_AUDIO':
      return { type: 'PLAY_AUDIO', track: 'klaxon_alert', bus: 'sfx', volume: 0.8, loop: false };
    case 'TRIGGER_AIME':
    default:
      return {
        type: 'TRIGGER_AIME',
        prompt: 'The air turns frigid as security wards activate.',
        readAloudText: 'The air turns frigid as security wards activate.'
      };
  }
};

function summarizeAction(action) {
  if (!action) return '';
  if (action.type === 'SET_FLAG') return `${action.key} = ${String(action.value)}`;
  if (action.type === 'PLAY_AUDIO') return `${action.bus || 'sfx'}:${action.track || action.cueId || ''}`;
  if (action.type === 'RUN_MACRO') return action.scriptId || action.macroId || '';
  if (action.type === 'SPAWN_ELEMENT' || action.type === 'DESPAWN_ELEMENT') return action.elementId || '';
  if (action.type === 'TOGGLE_DOOR') return action.wallId || action.objectId || '';
  return (
    action.readAloudText ||
    action.prompt ||
    action.targetScenarioId ||
    action.scenarioId ||
    action.modifierId ||
    ''
  );
}

export default function FlowTab() {
  const { stageManifest, addTrigger, updateTrigger, removeTrigger } = useStageStore();
  const { list: scenariosList } = useStoryAssets();
  const { list: elementsList } = useElementAssets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [anchorId, setAnchorId] = useState('');
  const [eventOn, setEventOn] = useState('enter');
  const [conditionWhen, setConditionWhen] = useState('');
  const [actionsList, setActionsList] = useState([createDefaultAction('TRIGGER_AIME')]);
  const [gmConfirm, setGmConfirm] = useState(false);
  const [onceOnly, setOnceOnly] = useState(false);
  const [intervalMs, setIntervalMs] = useState(5000);

  const triggers = stageManifest.triggers || [];
  const anchors = stageManifest.anchors || [];
  const macrosList = stageManifest.macros || [];

  const handleOpenCreate = () => {
    setEditingTrigger(null);
    setName(`Trigger #${triggers.length + 1}`);
    setAnchorId(anchors[0]?.id || '');
    setEventOn('enter');
    setConditionWhen('');
    setActionsList([createDefaultAction('TRIGGER_AIME')]);
    setGmConfirm(false);
    setOnceOnly(false);
    setIntervalMs(5000);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trigger) => {
    setEditingTrigger(trigger);
    setName(trigger.name || '');
    setAnchorId(trigger.anchorId || anchors[0]?.id || '');
    setEventOn(trigger.on || 'enter');
    setConditionWhen(trigger.when || trigger.conditionExpr || '');
    setActionsList(
      Array.isArray(trigger.actions) && trigger.actions.length > 0
        ? trigger.actions.map((a) => ({ ...a }))
        : [createDefaultAction('TRIGGER_AIME')]
    );
    setGmConfirm(Boolean(trigger.gmConfirm ?? trigger.requiresConfirm));
    setOnceOnly(Boolean(trigger.once));
    setIntervalMs(Number(trigger.intervalMs ?? trigger.delayMs ?? 5000));
    setIsModalOpen(true);
  };

  const handleUpdateActionAt = (index, patch) => {
    setActionsList((prev) =>
      prev.map((act, idx) => (idx === index ? { ...act, ...patch } : act))
    );
  };

  const handleChangeActionTypeAt = (index, nextType) => {
    const base = createDefaultAction(nextType);
    if (nextType === 'ADVANCE_SCENARIO' && scenariosList?.length > 0 && !base.targetScenarioId) {
      base.targetScenarioId = scenariosList[0].id;
    }
    if ((nextType === 'SPAWN_ELEMENT' || nextType === 'DESPAWN_ELEMENT') && elementsList?.length > 0 && !base.elementId) {
      base.elementId = elementsList[0].id;
    }
    if (nextType === 'RUN_MACRO' && macrosList?.length > 0 && !base.scriptId) {
      base.scriptId = macrosList[0].scriptId || macrosList[0].id;
    }
    setActionsList((prev) => prev.map((act, idx) => (idx === index ? base : act)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !anchorId) return;

    const normalizedActions = actionsList.map((act) => {
      if (act.type === 'TRIGGER_AIME') {
        const msg = act.prompt || act.readAloudText || '';
        return { type: 'TRIGGER_AIME', prompt: msg, readAloudText: msg };
      }
      if (act.type === 'SET_FLAG') {
        return {
          type: 'SET_FLAG',
          key: String(act.key || 'ALERT_ACTIVE').trim(),
          value: act.value !== undefined ? act.value : true
        };
      }
      return act;
    });

    const payload = {
      id: editingTrigger ? editingTrigger.id : `trigger-${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      anchorId,
      on: eventOn,
      when: conditionWhen.trim() || undefined,
      actions: normalizedActions,
      gmConfirm,
      once: onceOnly,
      ...(eventOn === 'timer' ? { intervalMs: Math.max(250, Number(intervalMs) || 5000) } : {})
    };

    if (editingTrigger) {
      updateTrigger(editingTrigger.id, payload);
    } else {
      addTrigger(payload);
    }

    AudioService.playCriticalChime(true);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] flex flex-col overflow-hidden font-mono text-slate-100">
      {/* Header bar */}
      <div className="p-3 px-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-400">
            <GitBranch size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Scenario Flow & Trigger Graph</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {triggers.length} Active Triggers
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Interactive conditions linking player movement & actions to multi-step story progression
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={anchors.length === 0}
          className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-colors ${
            anchors.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500 cursor-pointer'
          }`}
          title={anchors.length === 0 ? 'Create an anchor first in Anchors tab' : 'Add Trigger'}
        >
          <Plus size={13} />
          <span>New Trigger</span>
        </button>
      </div>

      {/* Main Flow List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {anchors.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-2">
            <AlertTriangle size={28} className="mx-auto text-amber-500" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
              No map anchors defined yet.
            </p>
            <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
              Please define at least one Anchor in the Anchors tab before wiring up interactive triggers.
            </p>
          </div>
        ) : triggers.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-2">
            <GitBranch size={28} className="mx-auto text-slate-700" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
              No triggers wired in this Stage.
            </p>
            <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
              Add triggers to execute narrative prose, change environmentals, or advance scenarios when operators enter coordinates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {triggers.map((trigger) => {
              const anchor = anchors.find((a) => a.id === trigger.anchorId);
              const triggerActions = Array.isArray(trigger.actions) ? trigger.actions : [];

              return (
                <div
                  key={trigger.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-purple-300 truncate">
                        {trigger.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {trigger.once && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                            ONCE
                          </span>
                        )}
                        {trigger.gmConfirm && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40 font-bold flex items-center gap-0.5">
                            <ShieldCheck size={10} />
                            <span>Architect Confirm</span>
                          </span>
                        )}
                        <span className="text-[9px] px-2 py-0.5 rounded uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          ON: {trigger.on}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                      <div className="text-slate-400">
                        Anchor: <strong className="text-cyan-300">{anchor?.name || trigger.anchorId}</strong>
                      </div>
                      {trigger.when && (
                        <div className="text-slate-400 font-mono text-[11px]">
                          Condition: <span className="text-amber-300">{trigger.when}</span>
                        </div>
                      )}
                      {triggerActions.map((act, idx) => (
                        <div key={idx} className="pt-1 space-y-0.5">
                          <div className="text-slate-400 flex items-center gap-1.5">
                            <ArrowRight size={11} className="text-purple-400" />
                            <span>
                              Action #{idx + 1}: <strong className="text-white">{act?.type || 'CUSTOM'}</strong>
                            </span>
                          </div>
                          {summarizeAction(act) && (
                            <p className="text-[11px] text-slate-300 italic font-sans pl-4 truncate">
                              {summarizeAction(act)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID: {trigger.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(trigger)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                        title="Edit Trigger"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: 'Delete Trigger',
                            message: `Delete trigger "${trigger.name}"?`,
                            confirmText: 'Delete',
                            danger: true
                          });
                          if (confirmed) {
                            removeTrigger(trigger.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Trigger"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Trigger */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0f1d] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-3 px-4 bg-[#070b13] border-b border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch size={14} />
                <span>{editingTrigger ? 'Edit Trigger' : 'New Trigger'}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Trigger Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Airlock Breach Sensory Burst"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Anchor</label>
                  <select
                    value={anchorId}
                    onChange={(e) => setAnchorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                    required
                  >
                    {anchors.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.kind})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Event Trigger (ON)</label>
                  <select
                    value={eventOn}
                    onChange={(e) => setEventOn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  >
                    <option value="enter">Operator Enters</option>
                    <option value="leave">Operator Leaves</option>
                    <option value="interact">Operator Interacts</option>
                    <option value="beat">Scene Beat Advance</option>
                    <option value="flag">Variable / Flag Set</option>
                    <option value="timer">Timer Elapsed</option>
                    <option value="round_start">Round Start</option>
                  </select>
                </div>
              </div>

              {eventOn === 'timer' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Timer Interval (ms)</label>
                  <input
                    type="number"
                    min={250}
                    step={250}
                    value={intervalMs}
                    onChange={(e) => setIntervalMs(Number(e.target.value) || 5000)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  />
                </div>
              )}

              {/* Condition Expression */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Condition Expression (WHEN)</span>
                  <span className="text-[9px] text-slate-500">Optional</span>
                </label>
                <input
                  type="text"
                  value={conditionWhen}
                  onChange={(e) => setConditionWhen(e.target.value)}
                  placeholder="e.g., ALERT_LEVEL > 2 or HAS_KEYCARD == true"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 font-mono"
                />
              </div>

              {/* Multi-Action Execution List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Actions ({actionsList.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setActionsList((prev) => [...prev, createDefaultAction('SET_FLAG')])}
                    className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={10} />
                    <span>Add Action</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {actionsList.map((act, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Action ${idx + 1} Type`}
                          value={act.type}
                          onChange={(e) => handleChangeActionTypeAt(idx, e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                        >
                          {ACTION_TYPES.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                        {actionsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setActionsList((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 rounded hover:bg-red-950/50 text-slate-400 hover:text-red-300 cursor-pointer"
                            title="Remove Action"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      {act.type === 'SET_FLAG' ? (
                        <div className="grid grid-cols-3 gap-1.5">
                          <input
                            type="text"
                            aria-label="Flag Key"
                            value={act.key || ''}
                            onChange={(e) => handleUpdateActionAt(idx, { key: e.target.value })}
                            placeholder="FLAG_KEY"
                            className="col-span-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                          />
                          <select
                            aria-label="Flag Value Type"
                            value={
                              typeof act.value === 'boolean'
                                ? (act.value ? 'true' : 'false')
                                : typeof act.value === 'number'
                                  ? 'number'
                                  : 'string'
                            }
                            onChange={(e) => {
                              const mode = e.target.value;
                              if (mode === 'true') handleUpdateActionAt(idx, { value: true });
                              else if (mode === 'false') handleUpdateActionAt(idx, { value: false });
                              else if (mode === 'number') handleUpdateActionAt(idx, { value: Number(act.value) || 0 });
                              else handleUpdateActionAt(idx, { value: String(act.value ?? '') });
                            }}
                            className="col-span-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                          >
                            <option value="true">Boolean: true</option>
                            <option value="false">Boolean: false</option>
                            <option value="number">Number</option>
                            <option value="string">String</option>
                          </select>
                          {(typeof act.value === 'number' || typeof act.value === 'string') && (
                            <input
                              type={typeof act.value === 'number' ? 'number' : 'text'}
                              aria-label="Flag Custom Value"
                              value={act.value}
                              onChange={(e) =>
                                handleUpdateActionAt(idx, {
                                  value: typeof act.value === 'number' ? Number(e.target.value) : e.target.value
                                })
                              }
                              className="col-span-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                            />
                          )}
                        </div>
                      ) : act.type === 'ADVANCE_SCENARIO' ? (
                        <select
                          aria-label="Target Scenario"
                          value={act.targetScenarioId || ''}
                          onChange={(e) => handleUpdateActionAt(idx, { targetScenarioId: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                        >
                          <option value="">Select Scenario...</option>
                          {(scenariosList || []).map((sc) => (
                            <option key={sc.id} value={sc.id}>{sc.title || sc.id}</option>
                          ))}
                        </select>
                      ) : act.type === 'SPAWN_ELEMENT' || act.type === 'DESPAWN_ELEMENT' ? (
                        <select
                          aria-label="Target Element"
                          value={act.elementId || ''}
                          onChange={(e) => handleUpdateActionAt(idx, { elementId: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                        >
                          <option value="">Select Element...</option>
                          {(elementsList || []).map((el) => (
                            <option key={el.id} value={el.id}>[{el.type}] {el.title || el.id}</option>
                          ))}
                        </select>
                      ) : act.type === 'RUN_MACRO' ? (
                        <input
                          type="text"
                          value={act.scriptId || ''}
                          onChange={(e) => handleUpdateActionAt(idx, { scriptId: e.target.value })}
                          placeholder="Macro ID or script title..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                        />
                      ) : act.type === 'PLAY_AUDIO' ? (
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={act.bus || 'sfx'}
                            onChange={(e) => handleUpdateActionAt(idx, { bus: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                          >
                            <option value="sfx">SFX Bus</option>
                            <option value="ambient">Ambient Bus</option>
                            <option value="music">Music Bus</option>
                          </select>
                          <input
                            type="text"
                            value={act.track || ''}
                            onChange={(e) => handleUpdateActionAt(idx, { track: e.target.value })}
                            placeholder="Audio cue ID (e.g. klaxon_alert)"
                            className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                          />
                        </div>
                      ) : act.type === 'TOGGLE_DOOR' ? (
                        <input
                          type="text"
                          value={act.wallId || ''}
                          onChange={(e) => handleUpdateActionAt(idx, { wallId: e.target.value })}
                          placeholder="Wall or bulkhead ID..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                        />
                      ) : act.type === 'APPLY_MODIFIER' ? (
                        <input
                          type="text"
                          value={act.modifierId || ''}
                          onChange={(e) => handleUpdateActionAt(idx, { modifierId: e.target.value })}
                          placeholder="Action text payload, prompt, or target ID..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100"
                        />
                      ) : (
                        <textarea
                          value={act.prompt ?? act.readAloudText ?? ''}
                          onChange={(e) =>
                            handleUpdateActionAt(idx, {
                              prompt: e.target.value,
                              ...(act.type === 'TRIGGER_AIME' ? { readAloudText: e.target.value } : {})
                            })
                          }
                          placeholder="Action text payload or sensory prompt..."
                          className="w-full h-14 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100 font-sans"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GM Confirm & One-Shot */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gmConfirm}
                    onChange={(e) => setGmConfirm(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-purple-600"
                  />
                  <span className="text-xs text-slate-300">
                    Require Architect manual approval before execution
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onceOnly}
                    onChange={(e) => setOnceOnly(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  <span className="text-xs text-slate-300">
                    Fire Once Only (lock trigger after first activation)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>Save Trigger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
