/**
 * @file CommandPaletteModal.jsx
 * @description Global Ctrl+K / Cmd+K ADE Command Palette for fuzzy navigation across Scenarios,
 *   Story Elements, Battlemaps, Story Flags, Compendium/Omnicortex, and Studio Actions.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, FileText, Box, Map, Flag, Zap, X, Sparkles, Printer, Palette, BookOpen } from 'lucide-react';
import { useAdeStore } from '../store/adeStore';
import { AudioService } from '../../../services/audioService';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  universeState = {},
  elementsCatalog = [],
  isStoryReadOnly = false,
  onSelectScenario,
  onEditElement,
  onOpenNewElement,
  onSelectMap,
  onSwitchView,
  onToggleSplitView,
  onOpenModal
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const storyFlags = useAdeStore((s) => s.storyFlags);
  const perspectiveMode = useAdeStore((s) => s.perspectiveMode || 'architect');
  const isOperatorMode = perspectiveMode === 'operator';

  useEffect(() => {
    if (!isOpen) return undefined;
    setQuery('');
    setSelectedIndex(0);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 10);
    const handleWindowEscape = (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleWindowEscape);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleWindowEscape);
    };
  }, [isOpen, onClose]);

  const commands = useMemo(() => {
    const items = [];

    // 1. Studio Quick Actions
    items.push(
      ...(!isStoryReadOnly ? [{
        id: 'act_new_elem',
        category: 'Action',
        title: 'Create New Story Element',
        subtitle: 'Launch Guided Element Forge',
        icon: Sparkles,
        run: () => onOpenNewElement?.()
      }] : []),
      {
        id: 'act_cronicle',
        category: 'Action',
        title: 'Open Cronicle Deck & Sci-Fi Calendar',
        subtitle: 'Living Memory, Timeline, Calendar & Scratchbook',
        icon: BookOpen,
        run: () => onOpenModal?.('cronicle')
      },
      {
        id: 'act_artist_hub',
        category: 'Action',
        title: 'Open Artist Hub & Token Framer',
        subtitle: 'HIFI CHROMA Prompts, AI Generation & WebP Tokens',
        icon: Palette,
        run: () => onOpenModal?.('artistHub')
      },
      {
        id: 'act_print',
        category: 'Action',
        title: 'Open Selective Print, EPUB 3 & PDF Studio',
        subtitle: 'Export OSR spreads, Word .doc & EPUB e-books',
        icon: Printer,
        run: () => onOpenModal?.('print')
      },
      {
        id: 'act_split',
        category: 'Action',
        title: 'Toggle Dual-Pane Story / Stage Split View',
        subtitle: 'Side-by-side manuscript & tactical VTT stage',
        icon: Zap,
        run: () => onToggleSplitView?.()
      },
      {
        id: 'act_stage',
        category: 'Action',
        title: 'Switch to Live Tactical Stage',
        subtitle: 'Open Stage Workspace',
        icon: Zap,
        run: () => onSwitchView?.('stage', 'run')
      }
    );

    // 2. Scenarios (flattened)
    const walkScenarios = (nodes, depth = 0) => {
      for (const n of nodes || []) {
        if (!n) continue;
        if (isOperatorMode && (n.isHidden || n.isGmOnly)) continue;
        items.push({
          id: `sc_${n.id}`,
          category: 'Scenario',
          title: n.title || 'Untitled Scenario',
          subtitle: depth > 0 ? 'Sub-Scenario Chapter' : 'Primary Act / Scenario',
          icon: FileText,
          run: () => {
            onSelectScenario?.(n.id);
            onSwitchView?.('scenarios', 'write');
          }
        });
        if (Array.isArray(n.children)) walkScenarios(n.children, depth + 1);
      }
    };
    walkScenarios(universeState?.scenarios || []);

    // 3. Elements
    for (const el of elementsCatalog || []) {
      if (!el) continue;
      if (isOperatorMode && (el.isHidden || el.isGmOnly || el.fields?.playerVisible === false)) continue;
      items.push({
        id: `el_${el.id}`,
        category: el.type || 'Element',
        title: el.title || el.name || 'Untitled Element',
        subtitle: el.fields?.summary || el.fields?.archetype || el.type || 'Story Element',
        icon: Box,
        run: () => onEditElement?.(el)
      });
    }

    // 4. Maps
    for (const m of universeState?.maps || []) {
      if (!m) continue;
      items.push({
        id: `map_${m.id}`,
        category: 'Map',
        title: m.title || m.name || 'Untitled Map',
        subtitle: `${m.type || 'Tactical'} Grid (${m.gridSize || 50}px)`,
        icon: Map,
        run: () => {
          onSelectMap?.(m.id);
          onSwitchView?.('stage', 'run');
        }
      });
    }

    // 5. Story Flags
    for (const [key, rec] of Object.entries(storyFlags || {})) {
      items.push({
        id: `flag_${key}`,
        category: 'Story Flag',
        title: `${key} = ${String(rec?.value ?? rec)}`,
        subtitle: `Scope: ${rec?.scope || 'global'}`,
        icon: Flag,
        run: () => onSwitchView?.('stage', 'environment')
      });
    }

    return items;
  }, [
    universeState?.scenarios,
    universeState?.maps,
    elementsCatalog,
    storyFlags,
    onSelectScenario,
    onEditElement,
    onOpenNewElement,
    onSelectMap,
    onSwitchView,
    onToggleSplitView,
    onOpenModal
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 18);
    const tokens = q.split(/\s+/).filter(Boolean);
    return commands
      .filter((cmd) => {
        const hay = `${cmd.title} ${cmd.category} ${cmd.subtitle}`.toLowerCase();
        return tokens.every((tok) => hay.includes(tok));
      })
      .slice(0, 24);
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const executeItem = (item) => {
    if (!item) return;
    AudioService.playTerminalBeep(1300, 0.03);
    item.run?.();
    onClose?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(Math.max(0, filtered.length - 1), i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      executeItem(filtered[selectedIndex]);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="ADE Command Palette"
      className="fixed inset-0 z-[280] bg-black/75 backdrop-blur-sm flex items-start justify-center pt-16 p-4 font-mono"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-2xl bg-[#0b101d] border border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden text-slate-200">
        {/* Search Header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/90 flex items-center gap-3">
          <Search size={16} className="text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to Scenario, Element, Map, Flag, or Action... (↑↓ Enter Esc)"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close Command Palette"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/50 p-2 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No matching scenarios, elements, maps, or commands for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon || Box;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => executeItem(item)}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 border border-cyan-500/50 text-white'
                      : 'border border-transparent hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={14} className={isSelected ? 'text-cyan-300' : 'text-slate-400'} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] uppercase text-cyan-300 shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
