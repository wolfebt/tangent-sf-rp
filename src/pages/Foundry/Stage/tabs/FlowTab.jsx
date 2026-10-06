/**
 * @file FlowTab.jsx
 * @description Scenario Flow & Trigger Graph Tab for the STAGE compiler.
 * Consolidates the old Visual Story Graph and trigger wiring into the Stage compiler.
 * Connects map anchors to interactive narrative triggers, beat advances, and AIME responses.
 */

import React, { useState } from 'react';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Edit3, 
  Zap, 
  Sparkles, 
  Check, 
  X,
  Play,
  ArrowRight,
  Filter,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useStageStore } from '../stageStore';
import { useStoryAssets } from '../../assetContracts';
import { AudioService } from '../../../../services/audioService';
import { v4 as uuidv4 } from 'uuid';

export default function FlowTab() {
  const { stageManifest, addTrigger, updateTrigger, removeTrigger } = useStageStore();
  const { list: scenariosList } = useStoryAssets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [anchorId, setAnchorId] = useState('');
  const [eventOn, setEventOn] = useState('enter');
  const [conditionWhen, setConditionWhen] = useState('');
  const [actionType, setActionType] = useState('TRIGGER_AIME');
  const [actionPayloadText, setActionPayloadText] = useState('');
  const [gmConfirm, setGmConfirm] = useState(false);

  const triggers = stageManifest.triggers || [];
  const anchors = stageManifest.anchors || [];

  const handleOpenCreate = () => {
    setEditingTrigger(null);
    setName(`Trigger #${triggers.length + 1}`);
    setAnchorId(anchors[0]?.id || '');
    setEventOn('enter');
    setConditionWhen('');
    setActionType('TRIGGER_AIME');
    setActionPayloadText('The air turns frigid as security wards activate.');
    setGmConfirm(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trigger) => {
    setEditingTrigger(trigger);
    setName(trigger.name || '');
    setAnchorId(trigger.anchorId || anchors[0]?.id || '');
    setEventOn(trigger.on || 'enter');
    setConditionWhen(trigger.when || '');
    const firstAction = trigger.actions?.[0];
    setActionType(firstAction?.type || 'TRIGGER_AIME');
    setActionPayloadText(firstAction?.readAloudText || firstAction?.prompt || firstAction?.targetScenarioId || '');
    setGmConfirm(!!trigger.gmConfirm);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !anchorId) return;

    let actionObj = { type: actionType };
    if (actionType === 'TRIGGER_AIME') {
      actionObj = { type: 'TRIGGER_AIME', prompt: actionPayloadText, readAloudText: actionPayloadText };
    } else if (actionType === 'ADVANCE_SCENARIO') {
      actionObj = { type: 'ADVANCE_SCENARIO', targetScenarioId: actionPayloadText };
    } else if (actionType === 'SET_FLAG') {
      actionObj = { type: 'SET_FLAG', key: actionPayloadText || 'ALERT_ACTIVE', value: true };
    } else if (actionType === 'REVEAL_BEAT') {
      actionObj = { type: 'REVEAL_BEAT', prompt: actionPayloadText };
    }

    const payload = {
      id: editingTrigger ? editingTrigger.id : `trigger-${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      anchorId,
      on: eventOn,
      when: conditionWhen.trim() || undefined,
      actions: [actionObj],
      gmConfirm
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
              Interactive conditions linking player movement & actions to story progression
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
              Add triggers to execute narrative prose, change environmentals, or advance scenarios when operatives enter coordinates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {triggers.map((trigger) => {
              const anchor = anchors.find(a => a.id === trigger.anchorId);
              const action = trigger.actions?.[0];

              return (
                <div
                  key={trigger.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">
                        {trigger.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {trigger.gmConfirm && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40 font-bold flex items-center gap-0.5">
                            <ShieldCheck size={10} />
                            <span>GM Confirm</span>
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
                      <div className="text-slate-400 flex items-center gap-1.5 pt-1">
                        <ArrowRight size={11} className="text-purple-400" />
                        <span>Action: <strong className="text-white">{action?.type || 'CUSTOM'}</strong></span>
                      </div>
                      {(action?.readAloudText || action?.prompt || action?.targetScenarioId) && (
                        <p className="text-[11px] text-slate-300 italic font-sans pl-4">
                          "{action.readAloudText || action.prompt || action.targetScenarioId}"
                        </p>
                      )}
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
                        onClick={() => {
                          if (window.confirm(`Delete trigger "${trigger.name}"?`)) {
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
          <div className="w-full max-w-md bg-[#0a0f1d] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100">
            <div className="p-3 px-4 bg-[#070b13] border-b border-slate-800 flex items-center justify-between">
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

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
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
                    {anchors.map(a => (
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
                    <option value="enter">Operative Enters</option>
                    <option value="leave">Operative Leaves</option>
                    <option value="interact">Operative Interacts</option>
                    <option value="beat">Scene Beat Advance</option>
                    <option value="flag">Variable / Flag Set</option>
                    <option value="timer">Timer Elapsed</option>
                  </select>
                </div>
              </div>

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

              {/* Action Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Action Execution</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 mb-2"
                >
                  <option value="TRIGGER_AIME">Trigger AIME Sensory Read-Aloud</option>
                  <option value="ADVANCE_SCENARIO">Advance to Scenario</option>
                  <option value="REVEAL_BEAT">Reveal Scene Beat</option>
                  <option value="SET_FLAG">Set Story State Flag</option>
                  <option value="APPLY_MODIFIER">Apply Situational Modifier</option>
                </select>

                <textarea
                  value={actionPayloadText}
                  onChange={(e) => setActionPayloadText(e.target.value)}
                  placeholder="Action text payload, prompt, or target ID..."
                  className="w-full h-16 bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 font-sans"
                />
              </div>

              {/* GM Confirm */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gmConfirm}
                  onChange={(e) => setGmConfirm(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-purple-600"
                />
                <span className="text-xs text-slate-300">
                  Require Architect / GM manual approval before execution
                </span>
              </label>

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
