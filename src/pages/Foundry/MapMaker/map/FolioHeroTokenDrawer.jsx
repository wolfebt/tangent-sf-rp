import React, { useState } from 'react';
import { useFolio } from '../../../../context/FolioContext';
import { useGroup } from '../../../../context/GroupContext';
import { AudioService } from '../../../../services/audioService';
import DraggablePanel from './DraggablePanel';
import { Users, User, Shield, Sparkles, Plus, ExternalLink } from 'lucide-react';
import { GameGroupModal } from '../../../../components/Groups/GameGroupModal';

export const FolioHeroTokenDrawer = ({
  showDrawer,
  setShowDrawer,
  onSummonToken
}) => {
  const { roster, personaRoster } = useFolio();
  const { groups, activeGroup, selectGroup } = useGroup();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('heroes'); // 'heroes' | 'squads'
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [selectedSquadId, setSelectedSquadId] = useState(null);

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

  const extractHeroStats = (hero) => {
    const maxHealth = parseInt(hero.health || hero.derived_max_hp || 30, 10);
    const currentHealth = hero.current_health !== undefined && hero.current_health !== null
      ? parseInt(hero.current_health, 10)
      : (hero.current_hp !== undefined && hero.current_hp !== null ? parseInt(hero.current_hp, 10) : maxHealth);
    const maxVitality = parseInt(hero.vitality || hero.derived_max_vitality || 30, 10);
    const currentVitality = hero.current_vitality !== undefined && hero.current_vitality !== null
      ? parseInt(hero.current_vitality, 10)
      : maxVitality;
    const defense = parseInt(hero.derived_defense || (hero['attr-reflex'] ? parseInt(hero['attr-reflex'], 10) + 10 : 12), 10);
    const actionPoints = parseInt(hero.derived_ap || 3, 10);
    const agility = parseInt(hero['attr-agility'] || hero.attr_agility || 10, 10);
    const speciesStr = String(hero['char-species'] || hero.species || '').toLowerCase();
    const isSynthetic = speciesStr.includes('synthetic') || speciesStr.includes('mekan') || speciesStr.includes('construct') || speciesStr.includes('golem') || speciesStr.includes('ooze') || speciesStr.includes('undead');
    const stamina = parseInt(hero['attr-stamina'] || 0, 10);
    const toughness = stamina;
    const maxStructure = maxHealth + maxVitality;
    const currentStructure = hero.current_structure !== undefined && hero.current_structure !== null
      ? parseInt(hero.current_structure, 10)
      : (currentHealth + currentVitality);

    return {
      heroId: hero['character-doc-id'] || hero.id,
      name: hero['char-name'] || hero.name || 'Unnamed Hero',
      avatarUrl: hero.avatarUrl || hero.imageUrl || null,
      maxHealth,
      currentHealth,
      maxVitality,
      currentVitality,
      maxStructure,
      currentStructure,
      isSynthetic,
      toughness,
      health: { current: currentHealth, max: maxHealth },
      vitality: { current: currentVitality, max: maxVitality },
      structure: { current: currentStructure, max: maxStructure },
      defense,
      actionPoints,
      agility,
      karma: parseInt(hero.karma !== undefined ? hero.karma : 3, 10),
      maxKarma: parseInt(hero.maxKarma || 3, 10),
      charisma: parseInt(hero['attr-charisma'] || hero.attr_charisma || 10, 10),
      earned_ap: parseInt(hero.earned_ap || 0, 10),
      available_ap: parseInt(hero.available_ap || hero.earned_ap || 0, 10)
    };
  };

  const handleDragStart = (e, hero) => {
    const stats = extractHeroStats(hero);
    const tokenPayload = {
      type: 'folio_hero_token',
      ...stats
    };

    e.dataTransfer.setData('application/json', JSON.stringify(tokenPayload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleSpawnClick = (hero) => {
    if (onSummonToken) {
      AudioService.playTerminalBeep(1100, 0.05);
      const stats = extractHeroStats(hero);
      onSummonToken(stats);
    }
  };

  // 1-Click Batch Spawn Entire Squad
  const handleDeploySquad = (squad) => {
    if (!onSummonToken) return;
    AudioService.playTerminalBeep(1250, 0.08);

    const members = Object.values(squad.memberDetails || {});
    if (members.length === 0) {
      // Spawn at least squad leader
      onSummonToken({
        heroId: `sq_${squad.id}_lead`,
        name: `${squad.name} Lead`,
        haloColor: squad.themeColor || '#22d3ee',
        maxHealth: 35,
        currentHealth: 35,
        maxVitality: 35,
        currentVitality: 35,
        defense: 12,
        actionPoints: 3,
        toughness: 2
      });
      return;
    }

    members.forEach((m, idx) => {
      setTimeout(() => {
        onSummonToken({
          heroId: m.uid || `sq_mem_${idx}`,
          name: m.characterName || m.displayName || `Operative ${idx + 1}`,
          avatarUrl: m.photoURL || null,
          haloColor: squad.themeColor || '#22d3ee',
          maxHealth: 30,
          currentHealth: 30,
          maxVitality: 30,
          currentVitality: 30,
          defense: 12,
          actionPoints: 3,
          toughness: 1
        });
      }, idx * 100);
    });
  };

  const handleOpenGroupBuilder = (groupId) => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (groupId) selectGroup(groupId);
    setSelectedSquadId(groupId);
    setIsSquadModalOpen(true);
  };

  return (
    <>
      <DraggablePanel
        id="folio_hero_drawer"
        className="absolute top-4 right-4 z-30 w-80 bg-[#161b22]/95 backdrop-blur-md border border-[#22d3ee]/60 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.25)] p-3 flex flex-col gap-2 font-sans select-none"
      >
        {/* Drawer Header */}
        <div className="drag-handle cursor-grab active:cursor-grabbing flex justify-between items-center pb-1.5 border-b border-[#0D5C63]/60">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📜</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#22d3ee] drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]">
              Tactical Units &amp; Squads
            </h3>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
            title="Close Drawer"
          >
            ×
          </button>
        </div>

        {/* Tab Switcher: Individual Heroes vs Squads */}
        <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#0d1117] rounded border border-slate-800 text-[10px] font-mono font-bold">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.03);
              setActiveTab('heroes');
            }}
            className={`py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'heroes'
                ? 'bg-cyan-600 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={11} /> Individual ({filteredHeroes.length})
          </button>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.03);
              setActiveTab('squads');
            }}
            className={`py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'squads'
                ? 'bg-emerald-600 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={11} /> Squads ({groups.length})
          </button>
        </div>

        {/* TAB 1: Individual Heroes */}
        {activeTab === 'heroes' && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Drag hero onto canvas to spawn token</span>
              <span className="font-mono text-cyan-300 font-bold">{filteredHeroes.length} Units</span>
            </div>

            {heroes.length > 3 && (
              <input
                type="text"
                placeholder="Filter roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0d1117] border border-[#0D5C63]/60 text-white px-2 py-1 rounded text-xs outline-none focus:border-[#22d3ee] w-full"
              />
            )}

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
                  const stats = extractHeroStats(hero);
                  const concept = hero['char-concept'] || hero.concept || hero['char-species'] || '';
                  const avatar = hero.avatarUrl || hero.imageUrl;

                  return (
                    <div
                      key={stats.heroId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, hero)}
                      className="p-2 rounded-lg bg-[#0d1117]/85 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/60 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between group shadow-sm"
                      title="Drag onto Canvas or click Spawn"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        {avatar ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50 shrink-0 bg-slate-900">
                            <img src={avatar} alt={stats.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0 shadow-inner">
                            {stats.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                            {stats.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                            {stats.isSynthetic ? (
                              <span className="text-amber-400 font-semibold">SP:{stats.currentStructure}/{stats.maxStructure}</span>
                            ) : (
                              <>
                                <span className="text-emerald-400 font-semibold">HLTH:{stats.currentHealth}</span>
                                <span className="text-cyan-400 font-semibold">VIT:{stats.currentVitality}</span>
                              </>
                            )}
                            <span className="text-emerald-400/90 font-semibold">Tgh:+{stats.toughness}</span>
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
          </div>
        )}

        {/* TAB 2: Squads & Fireteams */}
        {activeTab === 'squads' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Deploy entire fireteam onto battlemap:</span>
              <button
                type="button"
                onClick={() => handleOpenGroupBuilder(null)}
                className="text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center gap-0.5"
              >
                <Plus size={10} /> New Squad
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {groups.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic text-center py-4 bg-[#0d1117]/60 rounded border border-dashed border-slate-800">
                  No fireteams or squads configured.<br />
                  <button
                    type="button"
                    onClick={() => handleOpenGroupBuilder(null)}
                    className="text-emerald-400 underline font-bold mt-1 inline-block hover:text-emerald-300 cursor-pointer"
                  >
                    Build a Squad in Squad Hub →
                  </button>
                </div>
              ) : (
                groups.map((sq) => {
                  const members = Object.values(sq.memberDetails || {});

                  return (
                    <div
                      key={sq.id}
                      className="p-2 rounded-lg bg-[#0d1117]/90 border border-slate-800 hover:border-emerald-500/50 flex flex-col gap-1.5 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Shield size={13} className="text-emerald-400 shrink-0" />
                          <span className="font-bold text-xs text-white truncate font-mono">
                            {sq.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold shrink-0">
                          {members.length} {members.length === 1 ? 'MEMBER' : 'MEMBERS'}
                        </span>
                      </div>

                      {/* Squad Members preview */}
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                        {members.map((m, i) => (
                          <div
                            key={m.uid || i}
                            className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-[9px] font-mono text-slate-300 shrink-0"
                          >
                            {m.characterName || m.displayName || `Operative ${i + 1}`}
                          </div>
                        ))}
                      </div>

                      {/* Squad Action Buttons */}
                      <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => handleDeploySquad(sq)}
                          className="flex-1 py-1 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-[10px] uppercase rounded flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all"
                        >
                          <Sparkles size={10} /> Deploy Squad
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenGroupBuilder(sq.id)}
                          className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[10px] rounded flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open Squad Builder"
                        >
                          <ExternalLink size={10} /> Edit
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </DraggablePanel>

      {/* Squad / Party Group Modal */}
      {isSquadModalOpen && (
        <GameGroupModal
          isOpen={isSquadModalOpen}
          onClose={() => setIsSquadModalOpen(false)}
          initialTab="roster"
        />
      )}
    </>
  );
};

export default FolioHeroTokenDrawer;
