import React, { useState, useMemo } from 'react';
import { useStory } from '../../../../context/CampaignContext';
import { AudioService } from '../../../../services/audioService';
import DraggablePanel from './DraggablePanel';
import { 
  BookOpen, Search, Sparkles, Plus, ExternalLink, 
  MapPin, User, Shield, Swords, Gem, FileText, 
  Flame, Cpu, Globe, Compass, Eye, X, Move
} from 'lucide-react';
import { ELEMENT_TYPES, getTypePillStyle } from '../../ElementForge/elementSchemas';

export const ADE_ELEMENT_SLOTS = [
  { id: 'all', label: 'All Elements', icon: BookOpen, color: 'text-cyan-400' },
  { id: 'Scene', label: 'Scenes & Rooms', icon: MapPin, color: 'text-rose-400', category: 'Scene' },
  { id: 'Persona', label: 'Personas / NPCs', icon: User, color: 'text-purple-400', category: 'Persona' },
  { id: 'Encounter', label: 'Tactical Encounters', icon: Swords, color: 'text-red-400', category: 'Encounter' },
  { id: 'Item', label: 'Items & Loot Caches', icon: Gem, color: 'text-emerald-400', category: 'Item' },
  { id: 'Clue', label: 'Clues & Evidence', icon: Search, color: 'text-amber-400', category: 'Clue' },
  { id: 'Handout', label: 'Player Handouts', icon: FileText, color: 'text-sky-400', category: 'Handout' },
  { id: 'Hazard', label: 'Traps & Hazards', icon: Flame, color: 'text-orange-400', category: 'Hazard' },
  { id: 'Technology', label: 'Technology & Relays', icon: Cpu, color: 'text-fuchsia-400', category: 'Technology' },
  { id: 'Faction', label: 'Factions & Outposts', icon: Shield, color: 'text-indigo-400', category: 'Faction' },
  { id: 'Story Arc', label: 'Story Arcs & Acts', icon: Compass, color: 'text-amber-300', category: 'Story Arc' },
  { id: 'Adventure', label: 'Adventure Modules', icon: BookOpen, color: 'text-yellow-400', category: 'Adventure' },
  { id: 'Species', label: 'Species & Dens', icon: Globe, color: 'text-teal-400', category: 'Species' },
  { id: 'World', label: 'World & Environment', icon: Globe, color: 'text-blue-400', category: 'World' },
  { id: 'Universe', label: 'Universe & Physics', icon: Globe, color: 'text-cyan-300', category: 'Universe' },
  { id: 'Philosophy', label: 'Philosophies', icon: Compass, color: 'text-indigo-300', category: 'Philosophy' },
  { id: 'Custom', label: 'Custom Markers', icon: Sparkles, color: 'text-slate-300', category: 'Custom' }
];

export const StoryElementsDrawer = ({
  showDrawer,
  setShowDrawer,
  onSummonElement,
  onInspectElement
}) => {
  const { elementsCatalog, universeState, saveElementToCloud, updateSavedElement } = useStory();
  const [activeSlot, setActiveSlot] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all elements from catalog as well as scenarios tree
  const allStoryElements = useMemo(() => {
    const list = [...(elementsCatalog || [])];

    // Also extract scenario nodes from universeState
    const traverseScenarios = (nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach(n => {
        if (n && n.id) {
          // Avoid duplicate IDs
          if (!list.some(el => el.id === n.id)) {
            list.push({
              id: n.id,
              name: n.title || n.name || 'Scenario Node',
              type: n.type || 'Scene',
              summary: n.summary || n.content ? String(n.content).replace(/<[^>]*>?/gm, '').substring(0, 120) : '',
              isScenarioNode: true,
              tags: n.tags || 'Scenario'
            });
          }
        }
        if (n.children && n.children.length > 0) {
          traverseScenarios(n.children);
        }
      });
    };

    if (universeState?.scenarios) {
      traverseScenarios(universeState.scenarios);
    }

    return list;
  }, [elementsCatalog, universeState?.scenarios]);

  // Counts by element type
  const typeCounts = useMemo(() => {
    const counts = { all: allStoryElements.length };
    allStoryElements.forEach(item => {
      const t = item.type || 'Custom';
      counts[t] = (counts[t] || 0) + 1;
      if (t === 'Hazard' || t === 'Trap' || t === 'hazard') {
        counts['Hazard'] = (counts['Hazard'] || 0) + 1;
      }
    });
    return counts;
  }, [allStoryElements]);

  // Filtered elements
  const filteredElements = useMemo(() => {
    let result = allStoryElements;

    if (activeSlot !== 'all') {
      result = result.filter(item => {
        const itemType = (item.type || 'Custom').toLowerCase();
        const slotType = activeSlot.toLowerCase();
        if (slotType === 'hazard') {
          return itemType.includes('hazard') || itemType.includes('trap');
        }
        return itemType === slotType;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        const name = (item.name || item.title || '').toLowerCase();
        const summary = (item.summary || item.description || item.concept || '').toLowerCase();
        const tags = (item.tags || '').toLowerCase();
        return name.includes(q) || summary.includes(q) || tags.includes(q);
      });
    }

    return result;
  }, [allStoryElements, activeSlot, searchQuery]);

  // Quick preset creator for empty slots
  const handleCreateQuickPreset = (type) => {
    const newId = `elem_${type.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newElement = {
      id: newId,
      name: `New ${type}`,
      type: type,
      summary: `Authored ${type} element for ADE narrative & tactical VTT placement.`,
      tags: `ADE, ${type}`,
      dc: 14,
      damage: '2d10',
      createdAt: new Date().toISOString()
    };

    if (updateSavedElement) {
      updateSavedElement(newElement);
    } else if (saveElementToCloud) {
      saveElementToCloud(newElement);
    }

    AudioService.playTerminalBeep(920, 0.1);
  };

  if (!showDrawer) return null;

  return (
    <DraggablePanel
      id="story_elements_drawer"
      defaultPosition={{ x: 16, y: 70 }}
      className="fixed z-40 w-[420px] max-w-[95vw] bg-slate-950/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.3)] backdrop-blur-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200 font-sans"
    >
      {/* Header */}
      <div className="drag-handle px-4 py-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between cursor-move select-none">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              ADE • Story Module Elements
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Drag or summon narrative elements onto tactical grid
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5" data-no-drag>
          <button
            type="button"
            onClick={() => setShowDrawer(false)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/60" data-no-drag>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search story arcs, personas, scenes, clues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Element Type Menu Slots Pills (Horizontal Carousel) */}
      <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin select-none" data-no-drag>
        {ADE_ELEMENT_SLOTS.map((slot) => {
          const Icon = slot.icon;
          const count = typeCounts[slot.category || slot.id] || 0;
          const isActive = activeSlot === (slot.category || slot.id);

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1050, 0.02);
                setActiveSlot(slot.category || slot.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border shrink-0 ${
                isActive
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon size={12} className={slot.color} />
              <span>{slot.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[480px] scrollbar-thin" data-no-drag>
        {filteredElements.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs flex flex-col items-center gap-3">
            <BookOpen size={24} className="opacity-40 text-cyan-400" />
            <p>No story elements found in this slot.</p>
            {activeSlot !== 'all' && (
              <button
                type="button"
                onClick={() => handleCreateQuickPreset(activeSlot)}
                className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <Plus size={13} />
                <span>Create Preset {activeSlot}</span>
              </button>
            )}
          </div>
        ) : (
          filteredElements.map((item) => {
            const pillStyle = getTypePillStyle(item.type || 'Custom');

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'story_element',
                    element: item
                  }));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="group p-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all shadow-sm flex flex-col gap-1.5 cursor-grab active:cursor-grabbing relative"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                      <Move size={12} />
                    </span>
                    <span className="font-bold text-xs text-slate-200 group-hover:text-cyan-300 truncate font-mono">
                      {item.name || item.title || 'Untitled Element'}
                    </span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase tracking-wider shrink-0 ${pillStyle}`}>
                    {item.type || 'Element'}
                  </span>
                </div>

                {/* Summary / Description preview */}
                {(item.summary || item.description || item.concept || item.hook) && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.summary || item.description || item.concept || item.hook}
                  </p>
                )}

                {/* Footer action buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                  <span className="text-slate-500 truncate max-w-[140px]">
                    {item.tags || 'Drag to place'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Inspect button */}
                    <button
                      type="button"
                      onClick={() => onInspectElement?.(item)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Inspect Narrative Dossier"
                    >
                      <Eye size={11} className="text-amber-400" />
                      <span>Inspect</span>
                    </button>

                    {/* Summon to center */}
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(980, 0.05);
                        onSummonElement?.(item);
                      }}
                      className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Summon to Canvas Center"
                    >
                      <Plus size={11} className="text-cyan-400" />
                      <span>Summon</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>{filteredElements.length} elements available</span>
        <span className="text-cyan-400/80">✨ Drag any card onto canvas</span>
      </div>
    </DraggablePanel>
  );
};

export default StoryElementsDrawer;
