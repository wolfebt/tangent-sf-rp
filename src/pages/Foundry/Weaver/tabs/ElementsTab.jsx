/**
 * @file ElementsTab.jsx
 * @description In-Situ World Elements Palette for Story Weaver.
 * Displays all elements in the universe, categorized by type (Persona, Faction, Location, Object, Lore).
 * Supports drag-and-drop element insertion into the active story text canvas,
 * quick search, type filtering, and direct element editing.
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Layers, 
  Edit3, 
  Trash2, 
  Move, 
  Sparkles, 
  ExternalLink,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { useStory } from '../../../../context/CampaignContext';
import { getTypePillStyle } from '../../ElementForge/elementSchemas';
import EditElementModal from '../../ElementForge/EditElementModal';
import { AudioService } from '../../../../services/audioService';
import { v4 as uuidv4 } from 'uuid';

export default function ElementsTab({ activeNode, onInsertElementMention }) {
  const { 
    elementsCatalog, 
    updateSavedElement, 
    deleteSavedElement 
  } = useStory();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [editingElement, setEditingElement] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const categories = ['All', 'Persona', 'Faction', 'Location', 'Object', 'Lore', 'Encounter', 'Hazard'];

  // Check if an element is mentioned in the active story text
  const isMentionedInStory = (elem) => {
    if (!activeNode?.content || !elem?.title) return false;
    const cleanContent = activeNode.content.toLowerCase();
    const cleanTitle = elem.title.toLowerCase();
    return cleanContent.includes(cleanTitle) || cleanContent.includes(`[[${cleanTitle}]]`);
  };

  const filteredElements = useMemo(() => {
    return (elementsCatalog || []).filter((elem) => {
      const matchesSearch = !search ||
        (elem.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (elem.fields?.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (elem.type || '').toLowerCase().includes(search.toLowerCase());
      
      const matchesType = selectedType === 'All' || elem.type?.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [elementsCatalog, search, selectedType]);

  const handleDragStart = (e, elem) => {
    AudioService.playTerminalBeep(940, 0.02);
    e.dataTransfer.setData('text/plain', `[[${elem.title}]]`);
    e.dataTransfer.setData('application/x-tangent-wiki-element', JSON.stringify(elem));
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: elem.id,
      title: elem.title,
      type: elem.type,
      description: elem.fields?.description || '',
      token: `[[${elem.title}]]`
    }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleCreateNewElement = () => {
    const newElem = {
      id: uuidv4(),
      title: 'New Story Element',
      type: selectedType === 'All' ? 'Persona' : selectedType,
      content: '',
      fields: {
        description: 'Newly forged world element.',
        oneLinePitch: 'A critical figure or location in the sector.',
        tags: ['new']
      },
      createdAt: Date.now()
    };
    if (updateSavedElement) {
      updateSavedElement(newElem.id, newElem);
    }
    setEditingElement(newElem);
    setIsEditModalOpen(true);
    AudioService.playCriticalChime(true);
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] flex flex-col overflow-hidden font-mono text-slate-100">
      {/* Top Header & Search Bar */}
      <div className="p-3 px-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Elements Palette</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {filteredElements.length} Available
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Drag elements into the story canvas to create live narrative links
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search elements..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
            />
          </div>

          {/* Create Button */}
          <button
            type="button"
            onClick={handleCreateNewElement}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Plus size={13} />
            <span>Forge Element</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="p-2 px-4 bg-[#070b13] border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedType(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer shrink-0 ${
              selectedType === cat
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Elements Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredElements.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-2">
            <Layers size={28} className="mx-auto text-slate-700" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
              No matching elements found.
            </p>
            <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
              Change the search query or category filter, or forge a new element above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredElements.map((elem) => {
              const pill = getTypePillStyle(elem.type || 'Object');
              const mentioned = isMentionedInStory(elem);

              return (
                <div
                  key={elem.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, elem)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 group cursor-grab active:cursor-grabbing select-none shadow-md ${
                    mentioned
                      ? 'bg-slate-900/80 border-cyan-500/50 shadow-cyan-950/20'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                  title="Drag this element into the story canvas to insert a live wiki mention"
                >
                  <div className="space-y-1.5">
                    {/* Header badge & title */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${pill.bg} ${pill.border} ${pill.text}`}>
                        {elem.type || 'Asset'}
                      </span>
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {mentioned && (
                          <span className="text-[9px] text-cyan-400 font-bold flex items-center gap-0.5" title="Mentioned in current story">
                            <CheckCircle2 size={11} />
                            <span>Linked</span>
                          </span>
                        )}
                        <Move size={11} className="text-slate-500" />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                      {elem.title || 'Untitled Element'}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">
                      {elem.fields?.description || elem.fields?.oneLinePitch || 'No description provided.'}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                    <span className="text-slate-500 font-mono text-[9px]">
                      DRAG TO WRITE
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingElement(elem);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Edit in Element Forge"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (deleteSavedElement && window.confirm(`Delete "${elem.title}"?`)) {
                            deleteSavedElement(elem.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete element"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Element Forge Modal */}
      {isEditModalOpen && (
        <EditElementModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingElement(null);
          }}
          element={editingElement}
          onSave={(saved) => {
            if (updateSavedElement && saved?.id) {
              updateSavedElement(saved.id, saved);
            }
            setIsEditModalOpen(false);
            setEditingElement(null);
          }}
          onDelete={(id) => {
            if (deleteSavedElement && id) {
              deleteSavedElement(id);
            }
            setIsEditModalOpen(false);
            setEditingElement(null);
          }}
        />
      )}
    </div>
  );
}
