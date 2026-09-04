import React, { useState, useMemo } from 'react';
import { 
  X, Search, Plus, ExternalLink, Edit3, Tag, Shield, 
  Cpu, Heart, Zap, User, Users, Box, MapPin, Sparkles, BookOpen, ChevronRight, Check
} from 'lucide-react';
import { ELEMENT_TYPES, ELEMENT_SCHEMAS, getTypePillStyle } from '../ElementForge/elementSchemas';

export const InSituElementDrawer = ({
  isOpen,
  onClose,
  elementsCatalog = [],
  activeElementId = null,
  onSelectElement,
  onOpenFullEditor,
  onOpenFullForge,
  onCreateElement,
  onInsertMention,
  currentSceneLinkedIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('linked'); // 'linked' | 'catalog'
  const [copiedId, setCopiedId] = useState(null);

  // Filter elements
  const filteredCatalog = useMemo(() => {
    return elementsCatalog.filter(elem => {
      const matchesSearch = !searchTerm || 
        elem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elem.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (elem.fields && Object.values(elem.fields).some(v => typeof v === 'string' && v.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesType = selectedTypeFilter === 'All' || elem.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [elementsCatalog, searchTerm, selectedTypeFilter]);

  // Linked elements for current scene
  const linkedElements = useMemo(() => {
    return elementsCatalog.filter(elem => currentSceneLinkedIds.includes(elem.id));
  }, [elementsCatalog, currentSceneLinkedIds]);

  const selectedElement = useMemo(() => {
    return elementsCatalog.find(e => e.id === activeElementId) || linkedElements[0] || filteredCatalog[0] || null;
  }, [elementsCatalog, activeElementId, linkedElements, filteredCatalog]);

  const handleCopyMention = (elem) => {
    if (onInsertMention && elem) {
      onInsertMention(elem);
      setCopiedId(elem.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 lg:w-96 flex-shrink-0 bg-slate-900/95 border-l border-slate-800 flex flex-col h-full z-20 backdrop-blur-md shadow-2xl transition-all">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Box size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              In-Situ Elements
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                {elementsCatalog.length}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Active Worldbuilding Inspector</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onOpenFullForge && (
            <button
              onClick={onOpenFullForge}
              className="p-1.5 rounded-md bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
              title="Open Full-Screen Element Forge in Story Module"
            >
              <ExternalLink size={13} />
              <span className="text-[11px] pr-0.5">Forge</span>
            </button>
          )}
          <button
            onClick={() => onCreateElement && onCreateElement()}
            className="p-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all"
            title="Create New Element"
          >
            <Plus size={14} />
            <span className="text-[11px] pr-0.5">New</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all"
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Mode Tabs: Linked vs All Catalog */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('linked')}
          className={`py-1.5 text-center rounded-md transition-all ${
            activeTab === 'linked'
              ? 'bg-slate-800 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Scene Linked ({linkedElements.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-1.5 text-center rounded-md transition-all ${
            activeTab === 'catalog'
              ? 'bg-slate-800 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Full Catalog ({elementsCatalog.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-2 border-b border-slate-800/80 space-y-2 bg-slate-900/50">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elements by name, tag, or field..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <button
            onClick={() => setSelectedTypeFilter('All')}
            className={`px-2 py-0.5 rounded-full border transition-all whitespace-nowrap ${
              selectedTypeFilter === 'All'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            All
          </button>
          {ELEMENT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTypeFilter(t)}
              className={`px-2 py-0.5 rounded-full border transition-all whitespace-nowrap ${
                selectedTypeFilter === t
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Element List & Inspector Split */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-3">
        {/* List of elements based on tab */}
        <div className="space-y-1.5">
          {(activeTab === 'linked' ? linkedElements : filteredCatalog).length === 0 ? (
            <div className="text-center py-6 px-3 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
              <p className="text-xs text-slate-400 font-medium">
                {activeTab === 'linked' ? 'No elements linked to this scene yet.' : 'No matching elements found.'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Type <span className="text-cyan-400 font-mono">@</span> in the editor or click New to create one.
              </p>
              {activeTab === 'linked' && elementsCatalog.length > 0 && (
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="mt-2 text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Browse Catalog <ChevronRight size={12} />
                </button>
              )}
            </div>
          ) : (
            (activeTab === 'linked' ? linkedElements : filteredCatalog).map(elem => {
              const isSelected = selectedElement?.id === elem.id;
              const pillStyle = getTypePillStyle(elem.type);

              return (
                <div
                  key={elem.id}
                  onClick={() => onSelectElement && onSelectElement(elem.id)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider flex-shrink-0 ${pillStyle}`}>
                      {elem.type || 'Custom'}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                        {elem.title || 'Untitled Element'}
                      </h4>
                      {elem.fields?.role && (
                        <p className="text-[10px] text-slate-400 truncate">{elem.fields.role}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyMention(elem);
                      }}
                      className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-all text-[10px] flex items-center gap-0.5"
                      title="Insert @mention into editor"
                    >
                      {copiedId === elem.id ? <Check size={12} className="text-emerald-400" /> : <Tag size={12} />}
                      <span className="hidden sm:inline">@{elem.title?.split(' ')[0] || 'link'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Element Detailed Inspector Card */}
        {selectedElement && (
          <div className="pt-3">
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 space-y-3 shadow-lg">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase tracking-wider ${getTypePillStyle(selectedElement.type)}`}>
                    {selectedElement.type || 'Custom'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 mt-1.5">
                    {selectedElement.title || 'Untitled Element'}
                  </h4>
                  {selectedElement.authorEmail && (
                    <p className="text-[10px] text-slate-500 font-mono">By {selectedElement.authorEmail}</p>
                  )}
                </div>

                <button
                  onClick={() => onOpenFullEditor && onOpenFullEditor(selectedElement)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center space-x-1 border border-slate-700 transition-all"
                  title="Open Full Element Forge Modal"
                >
                  <Edit3 size={13} />
                  <span>Full Edit</span>
                </button>
              </div>

              {/* Quick Stat Pill Highlights */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {selectedElement.fields?.techLevel !== undefined && (
                  <div className="bg-slate-900 border border-slate-800/80 p-1.5 rounded flex items-center space-x-1.5">
                    <Cpu size={13} className="text-cyan-400" />
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Tech Level</span>
                      <span className="font-semibold text-slate-200">TL {selectedElement.fields.techLevel}</span>
                    </div>
                  </div>
                )}
                {selectedElement.fields?.metaLevel !== undefined && (
                  <div className="bg-slate-900 border border-slate-800/80 p-1.5 rounded flex items-center space-x-1.5">
                    <Sparkles size={13} className="text-purple-400" />
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Meta Level</span>
                      <span className="font-semibold text-slate-200">ML {selectedElement.fields.metaLevel}</span>
                    </div>
                  </div>
                )}
                {selectedElement.fields?.hitPoints !== undefined && (
                  <div className="bg-slate-900 border border-slate-800/80 p-1.5 rounded flex items-center space-x-1.5">
                    <Heart size={13} className="text-rose-400" />
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Hit Points</span>
                      <span className="font-semibold text-slate-200">{selectedElement.fields.hitPoints}</span>
                    </div>
                  </div>
                )}
                {selectedElement.fields?.armorDr !== undefined && (
                  <div className="bg-slate-900 border border-slate-800/80 p-1.5 rounded flex items-center space-x-1.5">
                    <Shield size={13} className="text-amber-400" />
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Armor DR</span>
                      <span className="font-semibold text-slate-200">{selectedElement.fields.armorDr}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Canonical & Psychological Fields */}
              <div className="space-y-1.5 text-xs">
                {selectedElement.fields?.role && (
                  <div className="text-[11px]">
                    <span className="text-slate-500 font-medium">Role: </span>
                    <span className="text-slate-300 font-semibold">{selectedElement.fields.role}</span>
                  </div>
                )}
                {selectedElement.fields?.mandate && (
                  <div className="text-[11px]">
                    <span className="text-slate-500 font-medium">Mandate: </span>
                    <span className="text-slate-300">{selectedElement.fields.mandate}</span>
                  </div>
                )}
                {selectedElement.fields?.truth && (
                  <div className="text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-cyan-400 font-medium block text-[10px] uppercase">Internal Truth:</span>
                    <span className="text-slate-300 italic">{selectedElement.fields.truth}</span>
                  </div>
                )}
                {selectedElement.fields?.lie && (
                  <div className="text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-amber-400 font-medium block text-[10px] uppercase">Internal Lie:</span>
                    <span className="text-slate-300 italic">{selectedElement.fields.lie}</span>
                  </div>
                )}
                {selectedElement.content && (
                  <div className="mt-2 text-[11px] text-slate-400 line-clamp-3 bg-slate-900/40 p-2 rounded">
                    {selectedElement.content.replace(/<[^>]*>?/gm, '')}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleCopyMention(selectedElement)}
                  className="px-2.5 py-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  {copiedId === selectedElement.id ? <Check size={13} className="text-emerald-400" /> : <Tag size={13} />}
                  <span>Insert @{selectedElement.title || 'Mention'}</span>
                </button>

                <button
                  onClick={() => onOpenFullEditor && onOpenFullEditor(selectedElement)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition-colors"
                >
                  <span>Edit in Forge</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default InSituElementDrawer;
