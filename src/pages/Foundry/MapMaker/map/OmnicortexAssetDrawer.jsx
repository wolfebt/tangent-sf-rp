import React, { useState, useMemo } from 'react';
import { useDBM } from '../../../../context/DBMContext';
import { AudioService } from '../../../../services/audioService';
import DraggablePanel from './DraggablePanel';
import { 
  Database, Search, Shield, Swords, Zap, 
  Flame, Rocket, ExternalLink, Plus, Package, Eye
} from 'lucide-react';
import { DBMItemModal } from '../../../../components/DBM/DBMItemModal';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Codex', icon: Database },
  { id: 'bestiary', label: 'Bestiary & Units', icon: Swords, filterKeys: ['bestiary', 'adversaries', 'creatures', 'npc', 'enemies'] },
  { id: 'weaponry', label: 'Weaponry', icon: Swords, filterKeys: ['weaponry', 'weapons'] },
  { id: 'armoring', label: 'Armoring', icon: Shield, filterKeys: ['armoring', 'armor', 'shields'] },
  { id: 'augmentations', label: 'Cybernetics', icon: Zap, filterKeys: ['augmentations', 'cybernetics'] },
  { id: 'hazards', label: 'Hazards & Traps', icon: Flame, filterKeys: ['hazards', 'traps', 'environment'] },
  { id: 'vehicles', label: 'Vehicles', icon: Rocket, filterKeys: ['vehicles', 'starships', 'mechs'] }
];

export const OmnicortexAssetDrawer = ({
  showDrawer,
  setShowDrawer,
  onSummonAsset
}) => {
  const { dbData } = useDBM() || { dbData: {} };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('bestiary');
  const [inspectingItem, setInspectingItem] = useState(null);

  // Consolidate all compendium items across categories
  const allCompendiumItems = useMemo(() => {
    if (!dbData) return [];
    const items = [];

    Object.entries(dbData).forEach(([catKey, catItems]) => {
      if (Array.isArray(catItems)) {
        catItems.forEach(item => {
          if (item && (item.name || item.title)) {
            items.push({
              ...item,
              _categoryKey: catKey,
              _resolvedName: item.name || item.title,
              _resolvedDesc: item.description || item.desc || item.effect || ''
            });
          }
        });
      }
    });

    return items;
  }, [dbData]);

  // Filter items by category tab & search query
  const filteredItems = useMemo(() => {
    let list = allCompendiumItems;

    const currentTabObj = CATEGORY_TABS.find(t => t.id === activeTab);
    if (activeTab !== 'all' && currentTabObj?.filterKeys) {
      list = list.filter(item => {
        const itemCat = (item.category || item._categoryKey || '').toLowerCase();
        return currentTabObj.filterKeys.some(fk => itemCat.includes(fk));
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item._resolvedName.toLowerCase().includes(q) ||
        item._resolvedDesc.toLowerCase().includes(q) ||
        (item.type && String(item.type).toLowerCase().includes(q)) ||
        (item.rarity && String(item.rarity).toLowerCase().includes(q))
      );
    }

    return list;
  }, [allCompendiumItems, activeTab, searchQuery]);

  if (!showDrawer) return null;

  const handleDragStart = (e, item) => {
    const payload = {
      type: 'omnicortex_asset',
      item: item,
      category: item._categoryKey
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleSpawnClick = (item) => {
    if (onSummonAsset) {
      AudioService.playTerminalBeep(1150, 0.04);
      onSummonAsset(item, item._categoryKey);
    }
  };

  return (
    <>
      <DraggablePanel
        id="omnicortex_asset_drawer"
        className="absolute top-16 right-4 z-40 w-84 sm:w-96 bg-[#0d1117]/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col max-h-[calc(100vh-140px)] select-none animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="drag-handle cursor-grab active:cursor-grabbing px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Database size={15} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                Omnicortex Compendium Assets
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Deploy bestiary, gear & hazards to tactical grid
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
            <input
              type="text"
              placeholder="Search adversaries, weapons, gear, hazards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Category Tabs Carousel */}
        <div className="flex gap-1 p-2 overflow-x-auto border-b border-slate-800/80 bg-slate-950/60 no-scrollbar">
          {CATEGORY_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  AudioService.playTerminalBeep(900, 0.02);
                  setActiveTab(tab.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-cyan-600 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[420px]">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No matching Omnicortex assets found in this category.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const name = item._resolvedName;
              const cat = item.category || item._categoryKey || 'Compendium';
              const hp = item.health || item.vitality || item.hp || item.derived_max_hp;
              const damage = item.damage || item.damageDice || item.dice;
              const cost = item.cost || item.credits || item.cp;

              return (
                <div
                  key={`${item.id || idx}_${name}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/60 transition-all flex items-center justify-between gap-2.5 cursor-grab active:cursor-grabbing group shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-mono font-bold text-slate-100 uppercase truncate">
                        {name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-[8px] font-mono text-cyan-300 font-bold uppercase">
                        {cat}
                      </span>
                    </div>

                    {/* Meta Stats Row */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 flex-wrap">
                      {hp && <span className="text-emerald-400 font-bold">HP: {hp}</span>}
                      {damage && <span className="text-rose-400 font-bold">DMG: {damage}</span>}
                      {cost && <span className="text-amber-400 font-bold">{cost} Cr</span>}
                      {item.range && <span>Rng: {item.range}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setInspectingItem(item)}
                      title="Inspect Omnicortex Codex"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => handleSpawnClick(item)}
                      title="Deploy to Tactical Map (Center)"
                      className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs uppercase rounded-lg shadow-sm flex items-center gap-1 transition-all"
                    >
                      <Plus size={13} />
                      <span>Deploy</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>{filteredItems.length} Assets Loaded</span>
          <span className="italic">Drag card onto map grid</span>
        </div>
      </DraggablePanel>

      {/* Inspect Omnicortex Item Modal */}
      {inspectingItem && (
        <DBMItemModal
          isOpen={!!inspectingItem}
          onClose={() => setInspectingItem(null)}
          categoryKey={inspectingItem._categoryKey || inspectingItem.category || 'compendium'}
          initialItem={inspectingItem}
        />
      )}
    </>
  );
};

export default OmnicortexAssetDrawer;
