import React, { useState } from 'react';
import { useFolio } from '../../../../context/FolioContext';
import DraggablePanel from './DraggablePanel';

export const FolioHeroTokenDrawer = ({
  showDrawer,
  setShowDrawer,
  onSummonToken
}) => {
  const { roster, personaRoster } = useFolio();
  const [searchQuery, setSearchQuery] = useState('');

  if (!showDrawer) return null;

  const heroes = roster || personaRoster || [];
  const filteredHeroes = heroes.filter(hero => {
    const name = hero['char-name'] || hero.name || '';
    const concept = hero['char-concept'] || hero.concept || '';
    const species = hero['char-species'] || hero.species || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) ||
      (typeof concept === 'string' && concept.toLowerCase().includes(query)) ||
      (typeof species === 'string' && species.toLowerCase().includes(query));
  });

  const handleDragStart = (e, hero) => {
    const maxHp = parseInt(hero.health || hero.derived_max_hp || 30, 10);
    const currentHp = hero.current_hp !== undefined && hero.current_hp !== null
      ? parseInt(hero.current_hp, 10)
      : maxHp;
    const defense = parseInt(hero.derived_defense || (hero['attr-reflex'] ? Math.floor(parseInt(hero['attr-reflex'], 10) / 2) + 10 : 12), 10);
    const actionPoints = parseInt(hero.derived_ap || 3, 10);
    const agility = parseInt(hero['attr-agility'] || hero.attr_agility || 10, 10);

    const tokenPayload = {
      type: 'folio_hero_token',
      heroId: hero['character-doc-id'] || hero.id,
      name: hero['char-name'] || hero.name || 'Unnamed Hero',
      avatarUrl: hero.avatarUrl || hero.imageUrl || null,
      maxHp,
      currentHp,
      defense,
      actionPoints,
      agility
    };

    e.dataTransfer.setData('application/json', JSON.stringify(tokenPayload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleSpawnClick = (hero) => {
    if (onSummonToken) {
      const maxHp = parseInt(hero.health || hero.derived_max_hp || 30, 10);
      const currentHp = hero.current_hp !== undefined && hero.current_hp !== null
        ? parseInt(hero.current_hp, 10)
        : maxHp;
      const defense = parseInt(hero.derived_defense || (hero['attr-reflex'] ? Math.floor(parseInt(hero['attr-reflex'], 10) / 2) + 10 : 12), 10);
      const actionPoints = parseInt(hero.derived_ap || 3, 10);
      const agility = parseInt(hero['attr-agility'] || hero.attr_agility || 10, 10);

      onSummonToken({
        type: 'folio_hero_token',
        heroId: hero['character-doc-id'] || hero.id,
        name: hero['char-name'] || hero.name || 'Unnamed Hero',
        avatarUrl: hero.avatarUrl || hero.imageUrl || null,
        maxHp,
        currentHp,
        defense,
        actionPoints,
        agility
      });
    }
  };

  return (
    <DraggablePanel
      id="folio_hero_drawer"
      className="absolute top-4 right-4 z-30 w-72 bg-[#161b22]/95 backdrop-blur-md border border-[#22d3ee]/60 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.25)] p-3 flex flex-col gap-2 font-sans select-none"
    >
      {/* Drawer Header */}
      <div className="drag-handle cursor-grab active:cursor-grabbing flex justify-between items-center pb-1.5 border-b border-[#0D5C63]/60">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📜</span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#22d3ee] drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]">
            Folio Hero Roster
          </h3>
        </div>
        <button
          onClick={() => setShowDrawer(false)}
          className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
          title="Close Folio Drawer"
        >
          ×
        </button>
      </div>

      <div className="text-[10px] text-slate-400 flex items-center justify-between">
        <span>Drag hero onto canvas to spawn token</span>
        <span className="font-mono text-cyan-300 font-bold">{filteredHeroes.length} Hero{filteredHeroes.length === 1 ? '' : 'es'}</span>
      </div>

      {/* Search Filter */}
      {heroes.length > 3 && (
        <input
          type="text"
          placeholder="Filter roster..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white px-2 py-1 rounded text-xs outline-none focus:border-[#22d3ee]"
        />
      )}

      {/* Hero List */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
        {heroes.length === 0 ? (
          <div className="text-[11px] text-slate-400 italic text-center py-4 bg-[#0d1117]/60 rounded border border-dashed border-slate-800">
            No heroes saved in Persona Folio.<br />
            <a href="/folio" className="text-cyan-400 underline font-bold mt-1 inline-block hover:text-cyan-300">
              Create a Hero in Folio →
            </a>
          </div>
        ) : filteredHeroes.length === 0 ? (
          <div className="text-[11px] text-slate-400 italic text-center py-3">
            No heroes match "{searchQuery}"
          </div>
        ) : (
          filteredHeroes.map((hero) => {
            const heroId = hero['character-doc-id'] || hero.id;
            const heroName = hero['char-name'] || hero.name || 'Unnamed Hero';
            const concept = hero['char-concept'] || hero.concept || hero['char-species'] || '';
            const maxHp = parseInt(hero.health || hero.derived_max_hp || 30, 10);
            const currentHp = hero.current_hp !== undefined && hero.current_hp !== null
              ? parseInt(hero.current_hp, 10)
              : maxHp;
            const defense = parseInt(hero.derived_defense || (hero['attr-reflex'] ? Math.floor(parseInt(hero['attr-reflex'], 10) / 2) + 10 : 12), 10);
            const avatar = hero.avatarUrl || hero.imageUrl;

            return (
              <div
                key={heroId}
                draggable
                onDragStart={(e) => handleDragStart(e, hero)}
                className="p-2 rounded-lg bg-[#0d1117]/85 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/60 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between group shadow-sm"
                title="Drag onto Canvas or click Spawn to place"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  {avatar ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50 shrink-0 bg-slate-900">
                      <img src={avatar} alt={heroName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0 shadow-inner">
                      {heroName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                      {heroName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {concept && <span className="text-slate-500 mr-1">{typeof concept === 'object' ? concept.name : concept} •</span>}
                      <span className="text-emerald-400 font-semibold">HP: {currentHp}/{maxHp}</span> • Def: {defense}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpawnClick(hero);
                  }}
                  className="px-2 py-1 bg-cyan-950 hover:bg-cyan-800 text-[#22d3ee] border border-cyan-500/50 rounded text-[10px] font-mono font-bold uppercase transition-all shrink-0 hover:shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                  title="Summon Hero to Map Canvas"
                >
                  + SPAWN
                </button>
              </div>
            );
          })
        )}
      </div>
    </DraggablePanel>
  );
};

export default FolioHeroTokenDrawer;
