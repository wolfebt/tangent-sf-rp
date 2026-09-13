import React, { useState, useMemo } from 'react';
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Zap, 
  Eye, 
  ShieldAlert, 
  Sparkles,
  Info,
  BookOpen
} from 'lucide-react';

const CATEGORY_ICONS = {
  sensory: '👁️',
  stealth: '🌿',
  social: '🗣️',
  physical: '🏃',
  mental: '🧠',
  combat: '⚔️',
  general: '📋'
};

const CATEGORY_NAMES = {
  sensory: 'Sensory & Awareness Checks',
  stealth: 'Stealth, Infiltration & Terrain',
  social: 'Social, Deception & Influence',
  physical: 'Physical & Mobility Checks',
  mental: 'Mental, Willpower & Focus',
  combat: 'Tactical & Combat Situations',
  general: 'General & Environmental Modifiers'
};

const CATEGORY_COLORS = {
  sensory: 'text-amber-300 border-amber-800/60 bg-amber-950/40',
  stealth: 'text-emerald-300 border-emerald-800/60 bg-emerald-950/40',
  social: 'text-cyan-300 border-cyan-800/60 bg-cyan-950/40',
  physical: 'text-orange-300 border-orange-800/60 bg-orange-950/40',
  mental: 'text-purple-300 border-purple-800/60 bg-purple-950/40',
  combat: 'text-rose-300 border-rose-800/60 bg-rose-950/40',
  general: 'text-slate-300 border-slate-700 bg-slate-900/60'
};

/**
 * Classifies a modifier / mechanic text into a relevant check category
 */
const classifyModifierCategory = (text) => {
  const lower = (text || '').toLowerCase();
  if (lower.includes('aware') || lower.includes('percept') || lower.includes('sight') || lower.includes('darkvision') || lower.includes('low light') || lower.includes('scent') || lower.includes('listen') || lower.includes('notice') || lower.includes('spot') || lower.includes('search')) {
    return 'sensory';
  }
  if (lower.includes('stealth') || lower.includes('disguise') || lower.includes('hide') || lower.includes('infiltrat') || lower.includes('terrain') || lower.includes('track') || lower.includes('camoufl') || lower.includes('wilderness')) {
    return 'stealth';
  }
  if (lower.includes('social') || lower.includes('decept') || lower.includes('persuas') || lower.includes('intimidat') || lower.includes('charm') || lower.includes('bluff') || lower.includes('etiquette') || lower.includes('negotiat') || lower.includes('stigma')) {
    return 'social';
  }
  if (lower.includes('athlet') || lower.includes('climb') || lower.includes('swim') || lower.includes('jump') || lower.includes('acrobat') || lower.includes('run') || lower.includes('lift') || lower.includes('escap') || lower.includes('grapple')) {
    return 'physical';
  }
  if (lower.includes('will') || lower.includes('panic') || lower.includes('fear') || lower.includes('cool') || lower.includes('sanity') || lower.includes('concentrat') || lower.includes('insight') || lower.includes('mental') || lower.includes('resist sleep')) {
    return 'mental';
  }
  if (lower.includes('initiat') || lower.includes('surprise') || lower.includes('cover') || lower.includes('attack') || lower.includes('parry') || lower.includes('ranged') || lower.includes('melee') || lower.includes('dodge') || lower.includes('armor check')) {
    return 'combat';
  }
  return 'general';
};

export const SituationalModifiersPanel = ({ characterData, updateField }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newCustomNote, setNewCustomNote] = useState('');

  // Extract all active assets that provide conditional/situational modifiers
  const situationalItems = useMemo(() => {
    if (!characterData) return [];
    const items = [];

    const checkAndPush = (rawItem, sourceTag, tagColor) => {
      if (!rawItem) return;
      const item = typeof rawItem === 'object' ? rawItem : { name: String(rawItem) };
      const name = item.name || item.title || 'Unnamed Asset';
      const text = [
        item.mechanic,
        item.mechanics,
        item.description,
        item.desc,
        item.summary,
        item.rules,
        item.notes,
        Array.isArray(item.modifiers) ? JSON.stringify(item.modifiers) : ''
      ].filter(Boolean).join(' ');

      const lower = text.toLowerCase();
      // Look for situational check keywords
      const isSituational = (
        lower.includes('check') || 
        lower.includes('checks') || 
        lower.includes('disadvantage') || 
        lower.includes('advantage') || 
        lower.includes('circumstance') || 
        lower.includes('situational') || 
        lower.includes('when ') || 
        lower.includes('while ') || 
        lower.includes('in dim') || 
        lower.includes('in dark') || 
        lower.includes('bonus to') || 
        lower.includes('penalty to') || 
        lower.includes('penalty on') || 
        lower.includes('bonus on') ||
        lower.includes('immune to') ||
        lower.includes('immunity') ||
        (Array.isArray(item.modifiers) && item.modifiers.some(m => m.condition || m.circumstance))
      );

      if (isSituational) {
        const category = classifyModifierCategory(`${name} ${text}`);
        items.push({
          id: item.id || `${sourceTag}_${name}`,
          name,
          sourceTag,
          tagColor,
          category,
          mechanic: item.mechanic || item.rules || item.description || item.notes || text.slice(0, 180),
          modifiers: Array.isArray(item.modifiers) ? item.modifiers : []
        });
      }
    };

    // 1. Hindrances
    (Array.isArray(characterData.hindrances) ? characterData.hindrances : []).forEach(h => {
      checkAndPush(h, 'Hindrance', 'rose');
    });

    // 2. Features
    (Array.isArray(characterData.features) ? characterData.features : []).forEach(f => {
      checkAndPush(f, 'Feature', 'amber');
    });

    // 3. Species Traits & Other Traits
    (Array.isArray(characterData.traits) ? characterData.traits : []).forEach(t => {
      checkAndPush(t, t.trait_type || 'Trait', 'cyan');
    });

    // 4. Special Abilities
    (Array.isArray(characterData.special_abilities) ? characterData.special_abilities : []).forEach(a => {
      checkAndPush(a, 'Ability', 'purple');
    });

    // 5. Augmentations
    (Array.isArray(characterData.augmentations) ? characterData.augmentations : []).forEach(a => {
      checkAndPush(a, 'Augmentation', 'emerald');
    });

    return items;
  }, [characterData]);

  // Saved user custom notes
  const customNotes = useMemo(() => {
    return Array.isArray(characterData?.situational_modifiers_notes)
      ? characterData.situational_modifiers_notes
      : [];
  }, [characterData?.situational_modifiers_notes]);

  const handleAddCustomNote = (e) => {
    e.preventDefault();
    if (!newCustomNote.trim()) return;
    const updated = [
      ...customNotes,
      {
        id: `custom_note_${Date.now()}`,
        text: newCustomNote.trim(),
        createdAt: new Date().toLocaleDateString()
      }
    ];
    if (updateField) updateField('situational_modifiers_notes', updated);
    setNewCustomNote('');
  };

  const handleDeleteCustomNote = (id) => {
    const updated = customNotes.filter(n => n.id !== id);
    if (updateField) updateField('situational_modifiers_notes', updated);
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const map = {};
    situationalItems.forEach(item => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [situationalItems]);

  const totalCount = situationalItems.length + customNotes.length;

  return (
    <div className="bg-slate-900/80 border border-amber-900/50 rounded-xl p-3 sm:p-4 text-xs space-y-3 shadow-lg backdrop-blur-sm transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
            <AlertCircle size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold uppercase tracking-wider text-amber-300 text-xs truncate">
                Situational & Limited Check Modifiers
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-950 border border-amber-700/80 text-amber-300 shrink-0">
                {totalCount} Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans hidden sm:block truncate">
              Passive check bonuses, situational penalties, and conditional modifiers from Hindrances, Features & Traits
            </p>
          </div>
        </div>

        <button 
          type="button" 
          className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          title={isOpen ? "Collapse panel" : "Expand panel"}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="pt-2 border-t border-slate-800/80 space-y-3.5">
          {totalCount === 0 ? (
            <div className="p-4 rounded-lg bg-slate-950/50 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
              No situational modifiers found on active features, hindrances, or traits. You can add custom reminders below.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(groupedItems).map(([catKey, items]) => {
                const icon = CATEGORY_ICONS[catKey] || '📋';
                const catName = CATEGORY_NAMES[catKey] || 'Situational';
                const style = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.general;

                return (
                  <div 
                    key={catKey}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 space-y-2 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-900 mb-2">
                        <span className="text-sm">{icon}</span>
                        <h4 className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wide truncate">
                          {catName}
                        </h4>
                        <span className="ml-auto text-[9.5px] font-mono text-slate-500">
                          {items.length}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {items.map((item, idx) => (
                          <div 
                            key={`${item.id}_${idx}`}
                            className="p-1.5 rounded bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors space-y-1"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-bold text-[11px] text-slate-100 truncate">
                                {item.name}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold uppercase shrink-0 ${
                                item.sourceTag === 'Hindrance' 
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' 
                                  : item.sourceTag === 'Feature'
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                  : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                              }`}>
                                {item.sourceTag}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed line-clamp-2" title={item.mechanic}>
                              {item.mechanic}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* User Custom Situational Conditions / Reminders */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <span>📝</span> Custom Session / Tactical Modifiers
              </span>
              <span className="text-[9.5px] text-slate-500 font-mono">
                {customNotes.length} Custom
              </span>
            </div>

            {customNotes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {customNotes.map((note) => (
                  <div 
                    key={note.id}
                    className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-amber-900/40 text-slate-200 text-xs font-sans shadow-sm"
                  >
                    <span className="text-amber-300 text-[10px] font-mono">•</span>
                    <span>{note.text}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomNote(note.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 ml-1 cursor-pointer transition-colors"
                      title="Remove note"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Custom Modifier Form */}
            <form onSubmit={handleAddCustomNote} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCustomNote}
                onChange={(e) => setNewCustomNote(e.target.value)}
                placeholder="Add custom situational note (e.g. +2 against ranged in cover, -2 in vacuum)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-amber-500 font-sans"
              />
              <button
                type="submit"
                disabled={!newCustomNote.trim()}
                className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-200 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SituationalModifiersPanel;
