/**
 * @file Stage4TacticalSystems.jsx
 * @description Stage 4 of Guided Element Forge: BASTION & VTT Mechanical Calibration.
 * Dynamically renders the family-appropriate Canonical v6 workbench:
 *   - Persona: ModularCharacterAssembler (30 VP/30 HP Organic vs 60 SP Synthetic) + NpcScriptBuilder
 *   - Relic (Item / Tech): Economatrix EUFT CR ↔ Credits live calculator (Golden Rule parity)
 *   - Location (Setting / Scene / Encounter / Map): Beats, Read-Aloud, Atmospheric Rules & Map Pairing
 *   - Epistemic (Clue / Handout / Custom): 2d10 Analysis CR gates & +5 High-Degree bonus intel
 *   - Macro / Entity Lore: Tech/Meta Level baselines, Faction Clocks & Story Flag keys
 */

import React, { useState, useMemo } from 'react';
import {
  Scale,
  Shield,
  Cpu,
  Map as MapIcon,
  CloudRain,
  Bot,
  Sliders,
  CheckCircle2,
  EyeOff
} from 'lucide-react';
import { getPlaybookForType } from '../elementPlaybooks';
import { calibrateElementWithBastion } from '../guidedElementAiService';
import { ModularCharacterAssembler } from '../../components/ModularCharacterAssembler';
import { NpcScriptBuilder } from '../../components/NpcScriptBuilder';
import {
  calculateCreditValue,
  calculateCRFromCredits
} from '../../../../../engines/tangentEconEngine';
import { ATMOSPHERIC_PRESETS } from '../../../PresetsAndScripts/constants/atmosphericPresets';
import { useDBM } from '../../../../../context/DBMContext';
import { showToast } from '../../../../../context/ToastContext';
import { AudioService } from '../../../../../services/audioService';

export default function Stage4TacticalSystems({
  draft,
  onChangeField,
  onMergeFields,
  mapsList = [],
  registerModifierOnSave = false,
  onToggleRegisterModifier,
  onOpenAimeGuidance
}) {
  const { dbData = {} } = useDBM() || {};
  const playbook = useMemo(() => getPlaybookForType(draft.type), [draft.type]);
  const fields = draft.fields || {};

  const [personaSubTab, setPersonaSubTab] = useState('mcm'); // 'mcm' | 'script'
  const [bastionBanner, setBastionBanner] = useState(null);

  const handleBastionCalibrate = () => {
    AudioService.playCriticalChime(true);
    const result = calibrateElementWithBastion({ draft, dbData });
    onMergeFields?.(result.calibratedFields);
    setBastionBanner({
      badge: result.summaryBadge,
      rationale: result.rationale
    });
    showToast({
      type: 'success',
      text: result.summaryBadge
    });
  };

  // Live EUFT Cost CR ↔ Credit Value synchronization for Relics / Property
  const handleCostCrChange = (rawCr) => {
    if (rawCr === '') {
      onMergeFields?.({ costCr: '', craft_dc: '', creditValue: '', cost: '' });
      return;
    }
    const crNum = Math.max(0, Math.min(60, Number(rawCr) || 0));
    const credits = calculateCreditValue(crNum);
    onMergeFields?.({
      costCr: String(crNum),
      craft_dc: String(crNum),
      creditValue: String(credits),
      cost: String(credits)
    });
  };

  const handleCreditsChange = (rawCredits) => {
    if (rawCredits === '') {
      onMergeFields?.({ creditValue: '', cost: '', costCr: '', craft_dc: '' });
      return;
    }
    const creditNum = Math.max(0, Number(rawCredits) || 0);
    const cr = calculateCRFromCredits(creditNum);
    onMergeFields?.({
      creditValue: String(creditNum),
      cost: String(creditNum),
      costCr: String(cr),
      craft_dc: String(cr)
    });
  };

  const selectedWeather = useMemo(
    () => ATMOSPHERIC_PRESETS.find((p) => p.id === fields.weatherPreset) || null,
    [fields.weatherPreset]
  );

  return (
    <div className="space-y-5">
      {/* ── BASTION DETERMINISTIC CALIBRATION BAR ── */}
      <section className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#211708] via-[#0c121e] to-[#0c121e] p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0">
            <Scale size={18} />
          </div>
          <div>
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-amber-300">
              {playbook.stage4Title}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enforces Canonical v6 math: 2d10 Dual Resolution (CR 15 baseline), 30/30 Organic vs 60 SP Synthetic vitals, and EUFT Economatrix parity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBastionCalibrate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border border-amber-400/80 text-slate-950 text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)] transition-all cursor-pointer shrink-0"
        >
          <Scale size={14} />
          <span>BASTION Auto-Calibrate</span>
        </button>
      </section>

      {/* BASTION Calibration Result Banner */}
      {bastionBanner && (
        <div className="px-4 py-3 rounded-xl bg-emerald-950/35 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-200">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span className="font-bold">{bastionBanner.badge}</span>
          </div>
          <span className="text-[11px] text-slate-300 font-sans">{bastionBanner.rationale}</span>
        </div>
      )}

      {/* ── FAMILY 1A: PERSONA (MCM + VTT SCRIPTING) ── */}
      {draft.type === 'Persona' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPersonaSubTab('mcm')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 cursor-pointer ${
                  personaSubTab === 'mcm'
                    ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield size={13} />
                <span>Modular Character Matrix (MCM)</span>
              </button>
              <button
                type="button"
                onClick={() => setPersonaSubTab('script')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 cursor-pointer ${
                  personaSubTab === 'script'
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot size={13} />
                <span>Autonomous VTT Routine</span>
              </button>
            </div>

            {/* Canonical Physiology Selector */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px]">
              <span className="text-slate-400 uppercase font-bold">Physiology:</span>
              {['Organic', 'Synthetic'].map((phys) => {
                const active = (fields.physiology || 'Organic') === phys;
                return (
                  <button
                    key={phys}
                    type="button"
                    onClick={() => {
                      const nextPatch =
                        phys === 'Synthetic'
                          ? { physiology: 'Synthetic', vitality: '0', structure: fields.health || '60', health: fields.health || '60' }
                          : { physiology: 'Organic', vitality: fields.vitality && fields.vitality !== '0' ? fields.vitality : '30', structure: '' };
                      onMergeFields?.(nextPatch);
                    }}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      active
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {phys === 'Synthetic' ? 'Synthetic (60 SP)' : 'Organic (30/30)'}
                  </button>
                );
              })}
            </div>
          </div>

          {personaSubTab === 'mcm' ? (
            <ModularCharacterAssembler
              fields={fields}
              onFieldChange={onChangeField}
              elementTitle={draft.title}
              onOpenAimeGuidance={onOpenAimeGuidance}
            />
          ) : (
            <NpcScriptBuilder
              fields={fields}
              onFieldChange={onChangeField}
              elementTitle={draft.title}
              onOpenAimeGuidance={onOpenAimeGuidance}
            />
          )}
        </div>
      )}

      {/* ── FAMILY 1B: SPECIES & FACTION BASELINES ── */}
      {playbook.family === 'entity' && draft.type !== 'Persona' && (
        <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {draft.type === 'Species' ? (
            <div>
              <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1.5">
                Canonical Physiology Baseline
              </label>
              <select
                value={fields.physiology || 'Organic'}
                onChange={(e) => onChangeField?.('physiology', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none"
              >
                <option value="Organic">Organic Lineage (30 VP / 30 HP Base)</option>
                <option value="Synthetic">Synthetic Construct (60 SP Structure Base)</option>
                <option value="Hybrid">Cybernetic / Awakened Hybrid</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1.5">
                Default Party Disposition
              </label>
              <select
                value={fields.disposition || 'Neutral'}
                onChange={(e) => onChangeField?.('disposition', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none"
              >
                <option value="Allied">Allied / Patron</option>
                <option value="Neutral">Neutral / Transactional</option>
                <option value="Rival">Rival / Suspicious</option>
                <option value="Hostile">Hostile / Shoot-on-Sight</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-cyan-300 uppercase mb-1.5">
              Baseline Tech Level (TL 0–5)
            </label>
            <select
              value={fields['tech-level'] ?? '3'}
              onChange={(e) => onChangeField?.('tech-level', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-cyan-200 p-2.5 rounded-xl text-xs outline-none"
            >
              {[0, 1, 2, 3, 4, 5].map((tl) => (
                <option key={tl} value={String(tl)}>
                  TL-{tl} {tl === 3 ? '(Galactic Standard)' : tl === 5 ? '(Singularity / Precursor)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1.5">
              Baseline Meta Level (ML 0–5)
            </label>
            <select
              value={fields['meta-level'] ?? '3'}
              onChange={(e) => onChangeField?.('meta-level', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-purple-200 p-2.5 rounded-xl text-xs outline-none"
            >
              {[0, 1, 2, 3, 4, 5].map((ml) => (
                <option key={ml} value={String(ml)}>
                  ML-{ml} {ml === 0 ? '(Mundane / Null)' : ml === 3 ? '(Awakened Standard)' : ''}
                </option>
              ))}
            </select>
          </div>

          {draft.type === 'Faction' && (
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Campaign Clock / Long-Term Agenda Countdown (Optional)
              </label>
              <input
                type="text"
                value={fields.clockGoal || ''}
                onChange={(e) => onChangeField?.('clockGoal', e.target.value)}
                placeholder="e.g. [6-Segment Clock] Complete orbital blockade of Sector Kestrel"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
          )}
        </section>
      )}

      {/* ── FAMILY 3: RELIC / ITEM / TECHNOLOGY (ECONOMATRIX EUFT CALIBRATOR) ── */}
      {playbook.family === 'relic' && (
        <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 p-5 space-y-4 font-mono">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-300">
            <Cpu size={15} />
            <span>Economatrix EUFT &amp; Golden Rule Calibrator (Purchase CR = Crafting CR = Cost CR)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-cyan-300 uppercase mb-1">
                Tech Level (0–5)
              </label>
              <select
                value={fields['tech-level'] ?? '3'}
                onChange={(e) =>
                  onMergeFields?.({
                    'tech-level': e.target.value,
                    techLevel: `TL-${e.target.value}`
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-cyan-200 p-2.5 rounded-xl text-xs outline-none"
              >
                {[0, 1, 2, 3, 4, 5].map((tl) => (
                  <option key={tl} value={String(tl)}>
                    TL-{tl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">
                Meta Level (0–5)
              </label>
              <select
                value={fields['meta-level'] ?? '0'}
                onChange={(e) => onChangeField?.('meta-level', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-purple-200 p-2.5 rounded-xl text-xs outline-none"
              >
                {[0, 1, 2, 3, 4, 5].map((ml) => (
                  <option key={ml} value={String(ml)}>
                    ML-{ml}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                Rarity Classification
              </label>
              <select
                value={fields.rarity || 'Standard'}
                onChange={(e) => onChangeField?.('rarity', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none"
              >
                {['Common', 'Standard', 'Masterwork', 'Prototype', 'Artifact'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-amber-300 uppercase mb-1">
                Cost / Craft CR
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={fields.costCr ?? fields.craft_dc ?? ''}
                onChange={(e) => handleCostCrChange(e.target.value)}
                placeholder="e.g. 15"
                className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 text-amber-200 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-300 uppercase mb-1">
                EUFT Credit Value
              </label>
              <input
                type="number"
                min="0"
                value={fields.creditValue ?? fields.cost ?? ''}
                onChange={(e) => handleCreditsChange(e.target.value)}
                placeholder="e.g. 640"
                className="w-full bg-slate-950 border border-emerald-500/40 focus:border-emerald-400 text-emerald-200 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          {/* Subcategory Tactical Combat / Cyberware Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-rose-300 uppercase mb-1">
                Damage / Output
              </label>
              <input
                type="text"
                value={fields.damage || ''}
                onChange={(e) => onChangeField?.('damage', e.target.value)}
                placeholder="e.g. 3d8+2 Energy"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-cyan-300 uppercase mb-1">
                Range / Coverage
              </label>
              <input
                type="text"
                value={fields.range || fields.location || ''}
                onChange={(e) => onChangeField?.('range', e.target.value)}
                placeholder="e.g. 40m / Torso"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-300 uppercase mb-1">
                Armor DR / AP
              </label>
              <input
                type="text"
                value={fields.dr || fields.ap || ''}
                onChange={(e) => onChangeField?.('dr', e.target.value)}
                placeholder="e.g. DR 6 / AP 4"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">
                Bio-Nodes / Weight
              </label>
              <input
                type="text"
                value={fields.nodes_consumed || fields.weight || ''}
                onChange={(e) => onChangeField?.('nodes_consumed', e.target.value)}
                placeholder="e.g. 2 Nodes / 1.5 kg"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1.5">
              Active 2d10 Mechanic, Damage &amp; Operational Rule
            </label>
            <textarea
              rows={3}
              value={fields.mechanic || ''}
              onChange={(e) => onChangeField?.('mechanic', e.target.value)}
              placeholder="e.g. Grants +2 Strike on ranged attacks; High-Degree (+5) inflicts Ionized for 1 round..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-slate-100 p-3 rounded-xl text-xs font-sans leading-relaxed outline-none"
            />
          </div>
        </section>
      )}

      {/* ── FAMILY 2: LOCATIONS, SCENES, ENCOUNTERS & MAPS ── */}
      {playbook.family === 'location' && (
        <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 p-5 space-y-4 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Paired Tactical Map */}
            <div>
              <label className="block text-[10px] font-bold text-sky-300 uppercase mb-1.5 flex items-center gap-1.5">
                <MapIcon size={12} />
                <span>Paired Tactical Map</span>
              </label>
              <select
                value={fields.pairedMapId || ''}
                onChange={(e) => onChangeField?.('pairedMapId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sky-200 p-2.5 rounded-xl text-xs outline-none"
              >
                <option value="">— None Linked Yet —</option>
                {mapsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title || m.name || m.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Atmospheric & Weather Preset */}
            <div>
              <label className="block text-[10px] font-bold text-cyan-300 uppercase mb-1.5 flex items-center gap-1.5">
                <CloudRain size={12} />
                <span>Atmospheric VTT Rule</span>
              </label>
              <select
                value={fields.weatherPreset || ''}
                onChange={(e) => onChangeField?.('weatherPreset', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-cyan-200 p-2.5 rounded-xl text-xs outline-none"
              >
                <option value="">— Standard Conditions —</option>
                {ATMOSPHERIC_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2d10 Environmental / Encounter Hazard CR */}
            <div>
              <label className="block text-[10px] font-bold text-amber-300 uppercase mb-1.5">
                2d10 Hazard / Encounter CR
              </label>
              <input
                type="number"
                min="5"
                max="40"
                value={fields.hazardCr || '15'}
                onChange={(e) => onChangeField?.('hazardCr', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-amber-200 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          {selectedWeather && (
            <div className="px-3.5 py-2 rounded-xl bg-cyan-950/35 border border-cyan-500/30 text-xs text-cyan-100 font-sans">
              <strong className="font-mono text-cyan-300">{selectedWeather.icon} {selectedWeather.name}:</strong>{' '}
              {selectedWeather.rule}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1.5">
                Sequential VTT Stage Beats
              </label>
              <textarea
                rows={4}
                value={fields.sceneBeats || ''}
                onChange={(e) => onChangeField?.('sceneBeats', e.target.value)}
                placeholder={'1. Arrival & Sensory Hook\n2. Complication / Hazard Trigger\n3. Climax & Exfil'}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-100 p-3 rounded-xl text-xs font-sans leading-relaxed outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1.5">
                Architect Read-Aloud Narration Box
              </label>
              <textarea
                rows={4}
                value={fields.readAloud || ''}
                onChange={(e) => onChangeField?.('readAloud', e.target.value)}
                placeholder="Evocative box text safe to broadcast directly to Operators on Stage entry..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 text-purple-100 p-3 rounded-xl text-xs font-sans italic leading-relaxed outline-none"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── FAMILY 5: EPISTEMIC PROPS (CLUE, HANDOUT, CUSTOM) ── */}
      {playbook.family === 'epistemic' && (
        <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 p-5 space-y-4 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-cyan-300 uppercase mb-1.5">
                2d10 Investigation / Decryption Skill
              </label>
              <input
                type="text"
                value={fields.analysisSkill || ''}
                onChange={(e) => onChangeField?.('analysisSkill', e.target.value)}
                placeholder="e.g. Slicing / Computers, Perception, Cryptography"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-amber-300 uppercase">
                  Target Challenge Rating (CR)
                </label>
                <div className="flex items-center gap-1">
                  {[
                    { cr: '10', label: 'Routine' },
                    { cr: '15', label: 'Std' },
                    { cr: '20', label: 'Hard' },
                    { cr: '25', label: 'Extreme' }
                  ].map((preset) => (
                    <button
                      key={preset.cr}
                      type="button"
                      onClick={() => onChangeField?.('analysisCr', preset.cr)}
                      className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[9px] text-amber-300 cursor-pointer"
                    >
                      CR {preset.cr}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="5"
                max="40"
                value={fields.analysisCr || '15'}
                onChange={(e) => onChangeField?.('analysisCr', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-amber-200 p-2.5 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-emerald-300 uppercase mb-1.5">
              High-Degree Success Intel (+5 Margin over CR)
            </label>
            <textarea
              rows={2}
              value={fields.highDegreeBonus || ''}
              onChange={(e) => onChangeField?.('highDegreeBonus', e.target.value)}
              placeholder="Bonus revelation unlocked when an Operator beats the Target CR by +5 or more..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 text-slate-100 p-2.5 rounded-xl text-xs font-sans outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-rose-300 uppercase mb-1.5 flex items-center gap-1.5">
              <EyeOff size={12} />
              <span>Confidential Architect Notes (Stripped in Operator Exports)</span>
            </label>
            <textarea
              rows={2}
              value={fields.gmNotes || ''}
              onChange={(e) => onChangeField?.('gmNotes', e.target.value)}
              placeholder="True culprit, red-herring context, or downstream scenario trigger..."
              className="w-full bg-slate-950 border border-rose-500/30 focus:border-rose-400 text-rose-100 p-2.5 rounded-xl text-xs font-sans outline-none"
            />
          </div>
        </section>
      )}

      {/* ── FAMILY 4: MACRO-LORE & METAPHYSICS (WORLD, UNIVERSE, PHILOSOPHY, METAPHYSICS, ARC, ADVENTURE) ── */}
      {playbook.family === 'macro' && (
        <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          <div>
            <label className="block text-[10px] font-bold text-cyan-300 uppercase mb-1.5">
              {draft.type === 'Metaphysics' ? 'Tech Level Affinity (TL 0–5)' : 'Setting Tech Level Ceiling (TL 0–5)'}
            </label>
            <select
              value={fields['tech-level'] ?? '3'}
              onChange={(e) => onChangeField?.('tech-level', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-cyan-200 p-2.5 rounded-xl text-xs outline-none"
            >
              {[0, 1, 2, 3, 4, 5].map((tl) => (
                <option key={tl} value={String(tl)}>
                  TL-{tl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1.5">
              {draft.type === 'Metaphysics' ? 'Required Meta Level (ML 0–5)' : 'Setting Meta Level Ceiling (ML 0–5)'}
            </label>
            <select
              value={fields.meta_level ?? fields['meta-level'] ?? '3'}
              onChange={(e) =>
                onMergeFields?.({
                  'meta-level': e.target.value,
                  meta_level: e.target.value
                })
              }
              className="w-full bg-slate-950 border border-slate-800 text-purple-200 p-2.5 rounded-xl text-xs outline-none"
            >
              {[0, 1, 2, 3, 4, 5].map((ml) => (
                <option key={ml} value={String(ml)}>
                  ML-{ml}
                </option>
              ))}
            </select>
          </div>

          {draft.type === 'Metaphysics' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-violet-300 uppercase mb-1.5">
                  Invocation / Ability Design DC
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={fields.design_dc || '18'}
                  onChange={(e) => onChangeField?.('design_dc', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-violet-200 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-violet-300 uppercase mb-1.5">
                  Governing Meta Skill / Discipline
                </label>
                <input
                  type="text"
                  value={fields.meta_skill || fields.discipline || ''}
                  onChange={(e) => onChangeField?.('meta_skill', e.target.value)}
                  placeholder="e.g. Meta-Psionics, Meta-Dimensional..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-300 uppercase mb-1.5">
                  Cast Time / AP &amp; Strain Cost
                </label>
                <input
                  type="text"
                  value={fields.cast_time || ''}
                  onChange={(e) => onChangeField?.('cast_time', e.target.value)}
                  placeholder="e.g. 2 AP • 2 Strain"
                  className="w-full bg-slate-950 border border-slate-800 text-amber-200 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-300 uppercase mb-1.5">
                  Range &amp; Area Pattern
                </label>
                <input
                  type="text"
                  value={fields.range || ''}
                  onChange={(e) => onChangeField?.('range', e.target.value)}
                  placeholder="e.g. Medium (45m) • 6m Sphere"
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-200 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-emerald-300 uppercase mb-1.5">
              Global Story Flag Key
            </label>
            <input
              type="text"
              value={fields.storyFlagKey || ''}
              onChange={(e) => onChangeField?.('storyFlagKey', e.target.value)}
              placeholder="e.g. vault_nine_unsealed"
              className="w-full bg-slate-950 border border-slate-800 text-emerald-200 p-2.5 rounded-xl text-xs outline-none"
            />
          </div>
        </section>
      )}

      {/* ── SITUATIONAL MODIFIER GALLERY BRIDGE ── */}
      {playbook.supportsSituationalModifier && (
        <label className="rounded-2xl border border-indigo-500/35 bg-indigo-950/20 p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-400/60 transition-colors">
          <div className="flex items-center gap-3">
            <Sliders size={16} className="text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-indigo-200 uppercase tracking-wider">
                Derive Situational Modifier in Story Gallery
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically registers an active VTT tactical/environmental modifier sourced from this {draft.type} when saved.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={Boolean(registerModifierOnSave)}
            onChange={(e) => onToggleRegisterModifier?.(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer shrink-0"
          />
        </label>
      )}
    </div>
  );
}
