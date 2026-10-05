/**
 * @file AimeThreeTierStack.jsx
 * @description Master 3-Tier Vertical Layout for AIME ("The Art of AI Crafting").
 * Unites:
 *   - Layer 1: Guidance (The 'How') - Directorial Guidance Gems
 *   - Layer 2: Traits (The 'What') - Factual Element Schema Fields + Extensible RPG Systems
 *   - Layer 3: Asset Hub (The 'Who / What Else') - Contextual Linking with Importance & Directorial Notes
 */

import React, { useState } from 'react';
import { ELEMENT_SCHEMAS, getTypePillStyle } from '../elementSchemas';
import AimeGuidanceDeck from './AimeGuidanceDeck';
import AssetHubDeck from './AssetHubDeck';
import { ModularCharacterAssembler } from './ModularCharacterAssembler';
import { NpcScriptBuilder } from './NpcScriptBuilder';
import { BookOpen, Sparkles, ChevronDown, ChevronUp, Layers, Sliders, ExternalLink } from 'lucide-react';

export default function AimeThreeTierStack({
  elementType,
  fields = {},
  onChangeField,
  guidance = {},
  onChangeGuidance,
  assetHub = [],
  onChangeAssetHub,
  availableElements = [],
  currentElementId = null,
  onOpenRelationalSelector = null,
  onOpenAimeGuidance = null
}) {
  const [isRpgSystemsOpen, setIsRpgSystemsOpen] = useState(false);
  const [activeRpgTab, setActiveRpgTab] = useState('Modular Assembly (MCM)');

  const schema = ELEMENT_SCHEMAS[elementType] || [];
  
  // Separate core traits from extended RPG mechanics tabs
  const coreFields = schema.filter(f => !f.tab || f.tab === 'Core Traits');
  const rpgTabs = Array.from(new Set(schema.filter(f => f.tab && f.tab !== 'Core Traits').map(f => f.tab)));
  const currentRpgTab = rpgTabs.includes(activeRpgTab) ? activeRpgTab : (rpgTabs[0] || 'Modular Assembly (MCM)');

  return (
    <div className="space-y-4 font-mono">
      {/* ── LAYER 1: GUIDANCE (THE 'HOW') ── */}
      <section aria-label="Layer 1 Guidance">
        <AimeGuidanceDeck
          guidance={guidance}
          onChangeGuidance={onChangeGuidance}
          isCollapsedByDefault={false}
        />
      </section>

      {/* ── LAYER 2: TRAITS (THE 'WHAT') ── */}
      <section aria-label="Layer 2 Traits" className="border border-slate-800 rounded-2xl bg-[#090d16]/90 overflow-hidden shadow-lg">
        {/* Traits Header */}
        <div className="p-3.5 bg-gradient-to-r from-slate-950 via-[#131124] to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-sm shadow-sm">
              <BookOpen size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                  Layer 2: Traits (The 'What')
                </span>
                <span className={`text-[9px] px-2 py-0.2 rounded-full border font-bold ${getTypePillStyle(elementType)}`}>
                  {elementType}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">
                Objective reality: The single source of truth for this element's canonical subject matter.
              </p>
            </div>
          </div>

          {rpgTabs.length > 0 && (
            <button
              type="button"
              onClick={() => setIsRpgSystemsOpen(prev => !prev)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders size={12} className="text-amber-400" />
              <span>{isRpgSystemsOpen ? 'Hide Systems' : 'Extended Systems & Lorebook'}</span>
            </button>
          )}
        </div>

        {/* Core Traits Form Body */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreFields.map((f) => {
              const val = fields[f.key] !== undefined ? fields[f.key] : '';
              const isRelational = f.type === 'relational' || f.dbSource;

              return (
                <div 
                  key={f.key} 
                  className={`space-y-1.5 ${f.type === 'textarea' ? 'md:col-span-2' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{f.label}</span>
                    </label>

                    {f.dbSource && onOpenRelationalSelector && (
                      <button
                        type="button"
                        onClick={() => onOpenRelationalSelector(f)}
                        className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[9px] font-bold uppercase tracking-wider transition-colors"
                      >
                        ☁️ Cloud DBM
                      </button>
                    )}
                  </div>

                  {/* Relational Linked Badge */}
                  {isRelational && val && (
                    <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded-lg text-xs">
                      <span className="text-cyan-400 font-bold">☁️ DBM:</span>
                      <span className="text-white font-semibold flex-1 truncate">{val}</span>
                      <button
                        type="button"
                        onClick={() => onChangeField(f.key, '')}
                        className="text-slate-400 hover:text-red-400 font-bold px-1"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={val}
                      onChange={(e) => onChangeField(f.key, e.target.value)}
                      placeholder={f.placeholder || `Enter ${f.label}...`}
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none transition-all leading-relaxed font-sans placeholder-slate-600"
                    />
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => onChangeField(f.key, e.target.value)}
                      placeholder={f.placeholder || `Enter ${f.label}...`}
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-400 text-slate-100 p-2 rounded-xl text-xs outline-none transition-all font-sans placeholder-slate-600"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Optional RPG Systems & Tactical Tray */}
          {isRpgSystemsOpen && rpgTabs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/50 -mx-4 -mb-4 p-4 rounded-b-2xl space-y-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {rpgTabs.map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveRpgTab(tab)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                      currentRpgTab === tab
                        ? 'bg-amber-950 text-amber-200 border-amber-500/70 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Sub-Panel: Modular Character Assembler */}
              {elementType === 'Persona' && currentRpgTab === 'Modular Assembly (MCM)' && (
                <ModularCharacterAssembler
                  fields={fields}
                  onFieldChange={onChangeField}
                  elementTitle={fields.name || fields.title}
                  onOpenAimeGuidance={onOpenAimeGuidance}
                />
              )}

              {/* Sub-Panel: Autonomous VTT Script & Relations Builder */}
              {elementType === 'Persona' && currentRpgTab === 'Relations & Scripting' && (
                <NpcScriptBuilder
                  fields={fields}
                  onFieldChange={onChangeField}
                  elementTitle={fields.name || fields.title}
                  onOpenAimeGuidance={onOpenAimeGuidance}
                />
              )}

              {/* Generic Schema Fields for Active RPG Tab */}
              {currentRpgTab !== 'Modular Assembly (MCM)' && currentRpgTab !== 'Relations & Scripting' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schema.filter(f => f.tab === currentRpgTab).map(f => (
                    <div key={f.key} className={`space-y-1 ${f.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                      <label className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        {f.label}
                      </label>
                      {f.type === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={fields[f.key] || ''}
                          onChange={(e) => onChangeField(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-slate-100 p-2 rounded-lg text-xs outline-none font-sans"
                        />
                      ) : (
                        <input
                          type="text"
                          value={fields[f.key] || ''}
                          onChange={(e) => onChangeField(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-slate-100 p-2 rounded-lg text-xs outline-none font-sans"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── LAYER 3: ASSET HUB (THE 'WHO / WHAT ELSE') ── */}
      <section aria-label="Layer 3 Asset Hub">
        <AssetHubDeck
          assetHub={assetHub}
          onChangeAssetHub={onChangeAssetHub}
          availableElements={availableElements}
          currentElementId={currentElementId}
          isCollapsedByDefault={false}
        />
      </section>
    </div>
  );
}
