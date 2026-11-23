/**
 * @file WeaverSlashCommandMenu.jsx
 * @description /Slash & Block Insertion Palette for StoryWeaver.
 * Inserts print-safe semantic blocks (Read-Aloud, GM Secret, Statblock Card, 2d10 Skill Check, Waypoint Pin, Divider).
 */

import React, { useState } from 'react';
import { BookOpen, Lock, Shield, Dices, MapPin, Minus, Plus, X } from 'lucide-react';

export const WEAVER_BLOCK_TEMPLATES = [
  {
    id: 'read_aloud',
    label: 'Read-Aloud Narration Box',
    description: 'Player-safe italicized boxed text styled for OSR/Paged print',
    icon: BookOpen,
    color: 'text-amber-300',
    buildHtml: () =>
      '<blockquote class="ade-read-aloud"><p>Atmospheric sensory narration to read aloud to Operatives...</p></blockquote><p><br/></p>'
  },
  {
    id: 'gm_secret',
    label: 'GM Secret Callout',
    description: 'Architect-only spoiler note (auto-stripped in Operator/Safe exports)',
    icon: Lock,
    color: 'text-rose-300',
    buildHtml: () =>
      '<div class="ade-gm-secret" data-gm-secret="true"><p><strong>GM SECRET:</strong> Hidden motive, ambush trigger, or secret access override code.</p></div><p><br/></p>'
  },
  {
    id: 'statblock',
    label: 'Embedded Statblock Card',
    description: 'Compact Tangent v6 combat block card for NPCs or Hazards',
    icon: Shield,
    color: 'text-cyan-300',
    buildHtml: (elem) => {
      if (elem) {
        const vit = elem.fields?.vitality || 30;
        const hp = elem.fields?.health || elem.fields?.structure || 30;
        const dr = elem.fields?.dr || elem.fields?.armor_dr || 4;
        const atk = elem.fields?.attack || '+5 (2d10)';
        return `<div class="ade-statblock-card"><p><strong>${elem.title || 'Combatant'}</strong> [${elem.type || 'Persona'}] &bull; Vit ${vit} / HP ${hp} &bull; DR ${dr} &bull; ATK ${atk}</p></div><p><br/></p>`;
      }
      return '<div class="ade-statblock-card"><p><strong>Security Drone MK-IV</strong> [Synthetic Threat] &bull; 60 SP &bull; DR 6 &bull; ATK +6 Plasma Carbine (2d8)</p></div><p><br/></p>';
    }
  },
  {
    id: 'skill_check',
    label: 'Inline 2d10 Check Pill',
    description: 'Embeds a canonical 2d10 challenge rating tag',
    icon: Dices,
    color: 'text-emerald-300',
    buildHtml: () =>
      '<span class="ade-skill-check" data-skill="Perception" data-dc="15">[2d10 Perception · CR 15]</span> '
  },
  {
    id: 'waypoint_pin',
    label: 'Map Waypoint Reference',
    description: 'Marks a physical Stage map trigger anchor in prose',
    icon: MapPin,
    color: 'text-purple-300',
    buildHtml: () =>
      '<p><strong>[MAP WAYPOINT: Sector Check-In]</strong> — Trigger beat when Operatives breach airlock.</p>'
  },
  {
    id: 'scene_divider',
    label: 'Scene Break Divider',
    description: 'Clean typographic scene transition line',
    icon: Minus,
    color: 'text-slate-300',
    buildHtml: () => '<hr class="ade-scene-divider" /><p><br/></p>'
  }
];

export default function WeaverSlashCommandMenu({
  isOpen,
  onClose,
  elementsCatalog = [],
  onInsertBlockHtml
}) {
  const [selectedStatblockId, setSelectedStatblockId] = useState('');

  if (!isOpen) return null;

  const personas = (elementsCatalog || []).filter(
    (e) => e && (e.type === 'Persona' || e.type === 'Hazard' || e.type === 'Encounter')
  );

  return (
    <div
      role="dialog"
      aria-label="Insert Story Block Menu"
      className="w-80 bg-[#0b101d] border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-slate-200 z-50"
    >
      <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
          <Plus size={12} /> Insert Story Block (/command)
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white cursor-pointer"
          aria-label="Close Insert Block Menu"
        >
          <X size={12} />
        </button>
      </div>

      {personas.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/50">
          <label className="text-[9.5px] uppercase text-slate-400 block mb-1">
            Statblock Element Target (optional)
          </label>
          <select
            value={selectedStatblockId}
            onChange={(e) => setSelectedStatblockId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-cyan-200"
          >
            <option value="">Default Threat Template</option>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || p.name} ({p.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
        {WEAVER_BLOCK_TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                const chosenElem = personas.find((p) => p.id === selectedStatblockId) || null;
                onInsertBlockHtml?.(tpl.buildHtml(chosenElem), tpl.id);
                onClose?.();
              }}
              className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-cyan-950/50 border border-transparent hover:border-cyan-500/40 text-left flex items-start gap-2.5 cursor-pointer transition-colors"
            >
              <Icon size={14} className={`${tpl.color} mt-0.5 shrink-0`} />
              <div className="min-w-0">
                <div className="font-bold text-[11px] text-white">{tpl.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{tpl.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
