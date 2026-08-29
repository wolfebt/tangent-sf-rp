import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Sparkles, ChevronRight, UserPlus, Shield } from 'lucide-react';
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
    <div className="bg-slate-900/15 hover:bg-slate-900/85 backdrop-blur-md p-5 rounded-xl border border-slate-800 hover:border-amber-400/50 flex flex-col justify-between h-full transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="text-amber-400" size={18} />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
              TEAM AT A GLANCE ({heroList.length} {heroList.length === 1 ? 'OPERATIVE' : 'OPERATIVES'})
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
                Create operative sheets in Persona Folio to track party Health & Vitality.
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

              // Health calculations (Physical / Lethal)
              const maxHealth = parseInt(hero['health'] || hero.health || hero.derived_max_hp || 30, 10);
              const curHealth = parseInt(hero.current_health !== undefined ? hero.current_health : (hero.current_hp !== undefined ? hero.current_hp : maxHealth), 10);
              const healthPercent = Math.max(0, Math.min(100, Math.round((curHealth / Math.max(1, maxHealth)) * 100)));

              // Vitality calculations (Mental / Non-Lethal Buffer)
              const maxVitality = parseInt(hero['vitality'] || hero.vitality || hero.derived_max_vitality || 30, 10);
              const curVitality = parseInt(hero.current_vitality !== undefined ? hero.current_vitality : maxVitality, 10);
              const vitalityPercent = Math.max(0, Math.min(100, Math.round((curVitality / Math.max(1, maxVitality)) * 100)));

              // Structure calculations (Synthetics / Non-typical Anatomy)
              const speciesStr = String(species).toLowerCase();
              const isSynthetic = speciesStr.includes('synthetic') || speciesStr.includes('mekan') || speciesStr.includes('construct') || speciesStr.includes('golem') || speciesStr.includes('ooze') || speciesStr.includes('undead');
              const maxStructure = maxHealth + maxVitality;
              const curStructure = parseInt(hero.current_structure !== undefined ? hero.current_structure : (curHealth + curVitality), 10);
              const structurePercent = Math.max(0, Math.min(100, Math.round((curStructure / Math.max(1, maxStructure)) * 100)));

              // Toughness derived from Stamina
              const toughness = parseInt(hero['attr-stamina'] || 0, 10);

              const healthBarColor = healthPercent <= 25 
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                : healthPercent <= 50 
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';

              const healthTextColor = healthPercent <= 25 
                ? 'text-red-400' 
                : healthPercent <= 50 
                ? 'text-amber-400' 
                : 'text-emerald-400';

              const vitalityBarColor = vitalityPercent <= 25
                ? 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)]'
                : vitalityPercent <= 50
                ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]';

              const vitalityTextColor = vitalityPercent <= 25
                ? 'text-purple-400'
                : vitalityPercent <= 50
                ? 'text-cyan-300'
                : 'text-cyan-400';

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
                      <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors flex items-center gap-1.5">
                        <span className="truncate">{name}</span>
                        {toughness > 0 && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400/90 bg-emerald-950/60 px-1 rounded border border-emerald-800/40 shrink-0" title="Toughness: Point-for-point wound reduction">
                            🛡️+{toughness}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {species} • <span className="text-slate-500">{concept}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals Display: Structure for Synthetics, or Health & Vitality Gauges */}
                  <div className="w-40 shrink-0 flex flex-col gap-1.5">
                    {isSynthetic ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between w-full text-[9px] font-mono leading-none">
                          <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                            ⚙️ Structure
                          </span>
                          <span className="font-bold text-amber-300">
                            {curStructure}/{maxStructure}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                          <div
                            className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all duration-500"
                            style={{ width: `${structurePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Health Gauge (Lethal) */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between w-full text-[9px] font-mono leading-none">
                            <span className="text-slate-400 flex items-center gap-0.5 font-bold">
                              <Heart size={9} className={healthTextColor} /> Health
                            </span>
                            <span className={`font-bold ${healthTextColor}`}>
                              {curHealth}/{maxHealth}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <div
                              className={`h-full ${healthBarColor} transition-all duration-500`}
                              style={{ width: `${healthPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Vitality Gauge (Non-Lethal Buffer) */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between w-full text-[9px] font-mono leading-none">
                            <span className="text-slate-400 flex items-center gap-0.5 font-bold">
                              <Sparkles size={9} className={vitalityTextColor} /> Vitality
                            </span>
                            <span className={`font-bold ${vitalityTextColor}`}>
                              {curVitality}/{maxVitality}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <div
                              className={`h-full ${vitalityBarColor} transition-all duration-500`}
                              style={{ width: `${vitalityPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </>
                    )}
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
