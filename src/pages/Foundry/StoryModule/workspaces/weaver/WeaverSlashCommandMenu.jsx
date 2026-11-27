/**
 * @file WeaverSlashCommandMenu.jsx
 * @description /Slash & Block Insertion Palette for StoryWeaver.
 * Inserts print-safe semantic blocks (Read-Aloud, GM Secret, Statblock Card, 2d10 Skill Check, Waypoint Pin, Divider).
 */

import React, { useEffect, useState } from 'react';
import { BookOpen, Lock, Shield, Dices, MapPin, Minus, Plus, X, Search } from 'lucide-react';

function escHtml(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const WEAVER_BLOCK_TEMPLATES = [
  {
    id: 'read_aloud',
    label: 'Read-Aloud Narration Box',
    description: 'Player-safe italicized boxed text styled for OSR/Paged print',
    icon: BookOpen,
    color: 'text-amber-300',
    buildHtml: () =>
      '<blockquote class="ade-read-aloud">Atmospheric sensory narration to read aloud to Operatives...</blockquote><p><br/></p>'
  },
  {
    id: 'gm_secret',
    label: 'GM Secret Callout',
    description: 'Architect-only spoiler note (auto-stripped in Operator/Safe exports)',
    icon: Lock,
    color: 'text-rose-300',
    buildHtml: () =>
      '<div class="ade-gm-secret" data-gm-secret="true"><strong>GM SECRET:</strong> Hidden motive, ambush trigger, or secret access override code.</div><p><br/></p>'
  },
  {
    id: 'statblock',
    label: 'Embedded Statblock Card',
    description: 'Compact Tangent v6 combat block card for NPCs or Hazards',
    icon: Shield,
    color: 'text-cyan-300',
    buildHtml: (elem) => {
      if (elem) {
        const vit = escHtml(elem.fields?.vitality || 30);
        const hp = escHtml(elem.fields?.health || elem.fields?.structure || 30);
        const dr = escHtml(elem.fields?.dr || elem.fields?.armor_dr || 4);
        const atk = escHtml(elem.fields?.attack || '+5 (2d10)');
        return `<div class="ade-statblock-card"><strong>${escHtml(elem.title || 'Combatant')}</strong> [${escHtml(elem.type || 'Persona')}] &bull; Vit ${vit} / HP ${hp} &bull; DR ${dr} &bull; ATK ${atk}</div><p><br/></p>`;
      }
      return '<div class="ade-statblock-card"><strong>Security Drone MK-IV</strong> [Synthetic Threat] &bull; 60 SP &bull; DR 6 &bull; ATK +6 Plasma Carbine (2d8)</div><p><br/></p>';
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
      '<div class="ade-waypoint"><strong>[MAP WAYPOINT: Sector Check-In]</strong> — Trigger beat when Operatives breach airlock.</div><p><br/></p>'
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
  const [filterText, setFilterText] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const personas = (elementsCatalog || []).filter(
    (e) => e && (e.type === 'Persona' || e.type === 'Hazard' || e.type === 'Encounter')
  );
  const q = filterText.trim().toLowerCase();
  const visibleTemplates = q
    ? WEAVER_BLOCK_TEMPLATES.filter((t) => `${t.label} ${t.description}`.toLowerCase().includes(q))
    : WEAVER_BLOCK_TEMPLATES;

  useEffect(() => {
    setActiveIndex(0);
  }, [filterText, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === 'ArrowDown' && visibleTemplates.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % visibleTemplates.length);
      } else if (e.key === 'ArrowUp' && visibleTemplates.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + visibleTemplates.length) % visibleTemplates.length);
      } else if (e.key === 'Enter' && visibleTemplates.length > 0 && document.activeElement?.tagName !== 'SELECT') {
        e.preventDefault();
        const tpl = visibleTemplates[Math.min(activeIndex, visibleTemplates.length - 1)];
        if (tpl) {
          const chosenElem = personas.find((p) => p.id === selectedStatblockId) || null;
          onInsertBlockHtml?.(tpl.buildHtml(chosenElem), tpl.id);
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, visibleTemplates, activeIndex, personas, selectedStatblockId, onInsertBlockHtml]);

  if (!isOpen) return null;

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

      <div className="px-3 py-1.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5">
        <Search size={11} className="text-slate-500 shrink-0" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter blocks (read, secret, stat, 2d10)..."
          className="w-full bg-transparent text-[11px] text-slate-200 placeholder-slate-500 outline-none"
        />
      </div>

      <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
        {visibleTemplates.map((tpl, idx) => {
          const Icon = tpl.icon;
          const isHighlighted = idx === activeIndex;
          return (
            <button
              key={tpl.id}
              type="button"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => {
                const chosenElem = personas.find((p) => p.id === selectedStatblockId) || null;
                onInsertBlockHtml?.(tpl.buildHtml(chosenElem), tpl.id);
                onClose?.();
              }}
              className={`w-full p-2 rounded-xl border text-left flex items-start gap-2.5 cursor-pointer transition-colors ${
                isHighlighted
                  ? 'bg-cyan-950/60 border-cyan-500/50'
                  : 'bg-slate-950/60 hover:bg-cyan-950/50 border-transparent hover:border-cyan-500/40'
              }`}
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
