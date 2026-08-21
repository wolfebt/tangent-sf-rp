import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, ChevronRight, UserPlus, Shield } from 'lucide-react';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';

export const PartyStatusWidget = () => {
  const navigate = useNavigate();
  const { personaRoster, roster, switchRosterCharacter } = useFolio();

  const heroList = personaRoster || roster || [];
  const activeHeroes = heroList.slice(0, 4);

  const handleHeroClick = (docId) => {
    AudioService.playTerminalBeep(1200, 0.02);
    if (docId && typeof switchRosterCharacter === 'function') {
      switchRosterCharacter(docId);
    }
    navigate('/folio');
  };

  const handleOpenFolio = () => {
    AudioService.playTerminalBeep(1000, 0.03);
    navigate('/folio');
  };

  return (
    <div className="bg-slate-900/20 hover:bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-slate-800 hover:border-amber-400/50 flex flex-col justify-between h-full transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="text-amber-400" size={18} />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
              PARTY AT A GLANCE ({heroList.length} {heroList.length === 1 ? 'OPERATIVE' : 'OPERATIVES'})
            </span>
          </div>
          <button
            type="button"
            onClick={handleOpenFolio}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 transition-colors"
          >
            Open Folio <ChevronRight size={12} />
          </button>
        </div>

        {/* Hero Cards List */}
        <div className="mt-3.5 space-y-2.5">
          {activeHeroes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-6 px-4 rounded-lg bg-slate-900/40 border border-dashed border-slate-800">
              <Shield size={28} className="text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 font-mono">NO ACTIVE HERO PERSONAS</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
                Create operative sheets in Persona Folio to track party health & combat vitals.
              </p>
              <button
                type="button"
                onClick={handleOpenFolio}
                className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
              >
                <UserPlus size={13} /> Create Operative
              </button>
            </div>
          ) : (
            activeHeroes.map((hero) => {
              const docId = hero['character-doc-id'] || hero.id;
              const name = hero['char-name'] || hero.name || 'Unnamed Operative';
              const species = hero['char-species'] || hero.species || 'Human';
              const concept = hero['char-concept'] || hero['char-occu'] || hero.occupation || 'Specialist';

              const maxHp = parseInt(hero['health'] || hero.health || hero.derived_max_hp || 30, 10);
              const curHp = parseInt(hero.current_hp !== undefined ? hero.current_hp : maxHp, 10);
              const hpPercent = Math.max(0, Math.min(100, Math.round((curHp / Math.max(1, maxHp)) * 100)));

              const hpBarColor = hpPercent <= 25 
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                : hpPercent <= 50 
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';

              const hpTextColor = hpPercent <= 25 
                ? 'text-red-400' 
                : hpPercent <= 50 
                ? 'text-amber-400' 
                : 'text-emerald-400';

              const initial = name.trim().charAt(0).toUpperCase() || '?';

              return (
                <div
                  key={docId || name}
                  onClick={() => handleHeroClick(docId)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Avatar Initials Badge */}
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-300 font-mono group-hover:border-cyan-500/50 group-hover:text-cyan-200 transition-colors shrink-0">
                      {initial}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                        {name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {species} • <span className="text-slate-500">{concept}</span>
                      </div>
                    </div>
                  </div>

                  {/* HP Bar & Metric */}
                  <div className="w-28 shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-center justify-between w-full text-[10px] font-mono">
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <Heart size={10} className={hpTextColor} /> HP
                      </span>
                      <span className={`font-bold ${hpTextColor}`}>
                        {curHp}/{maxHp}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div
                        className={`h-full ${hpBarColor} transition-all duration-500`}
                        style={{ width: `${hpPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PartyStatusWidget;
