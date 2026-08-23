import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Dices, 
  User, 
  Map, 
  BookOpen, 
  Sparkles, 
  Compass, 
  CornerDownLeft,
  X 
} from 'lucide-react';
import { useDBM } from '../../context/DBMContext';
import { useFolio } from '../../context/FolioContext';
import { useStory } from '../../context/CampaignContext';
import { rollDice } from '../../services/diceService';
import { AudioService } from '../../services/audioService';
import { CODEX_MATRICES } from '../../pages/Codex/codexConfig';

export const CommandPalette = ({ isOpen, onClose, onDiceRolled }) => {
  const navigate = useNavigate();
  const { dbData } = useDBM() || {};
  const { roster, personaRoster } = useFolio() || {};
  const { universeState, mapsCatalog } = useStory() || {};

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Keyboard Trigger (Ctrl+K / Cmd+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic Search Index Aggregation
  const searchResults = useMemo(() => {
    if (!isOpen) return [];
    const q = query.toLowerCase().trim();

    // 1. Direct Slash Commands (/roll ...)
    if (q.startsWith('/roll')) {
      const rollExpr = q.replace('/roll', '').trim() || '2d10';
      return [{
        id: 'cmd_roll',
        type: 'action',
        icon: <Dices size={16} className="text-amber-400" />,
        title: `Execute Roll: ${rollExpr}`,
        subtitle: 'Roll polyhedral dice and log result to tray',
        action: () => {
          const result = rollDice(rollExpr);
          AudioService.playDiceRollSound();
          if (onDiceRolled) onDiceRolled(result);
          onClose();
        }
      }];
    }

    let results = [];

    // 2. Navigation & User Guide Actions
    const defaultNav = [
      { id: 'nav_hub', title: 'Go to Command Hub', subtitle: 'Main Dashboard & Operations', icon: <Compass size={16} className="text-cyan-400" />, action: () => { navigate('/'); onClose(); } },
      { id: 'nav_guide', title: 'Open Comprehensive User Guide', subtitle: 'System Manual & 10-App Documentation', icon: <BookOpen size={16} className="text-cyan-300" />, action: () => { window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'hub' } })); onClose(); } },
      { id: 'nav_folio', title: 'Go to Persona Folio', subtitle: 'Hero Roster & Operative Sheets', icon: <User size={16} className="text-cyan-400" />, action: () => { navigate('/folio'); onClose(); } },
      { id: 'nav_guide_folio', title: 'User Guide: Persona Folio', subtitle: 'CP Economy, 7 Tabs, 31 Narrative Fields', icon: <BookOpen size={16} className="text-cyan-400" />, action: () => { window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'folio' } })); onClose(); } },
      { id: 'nav_story', title: 'Go to Story Foundry', subtitle: 'Tactical Maps & Scenario Weaver', icon: <Map size={16} className="text-purple-400" />, action: () => { navigate('/foundry'); onClose(); } },
      { id: 'nav_guide_story', title: 'User Guide: Story Foundry', subtitle: 'Scenario Trees, Relational Links, Export', icon: <BookOpen size={16} className="text-purple-400" />, action: () => { window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'story' } })); onClose(); } },
      { id: 'nav_dbm', title: 'Go to Omnicortex (DBM)', subtitle: 'Rules Codex & Game Database', icon: <BookOpen size={16} className="text-emerald-400" />, action: () => { navigate('/dbm'); onClose(); } },
      { id: 'nav_guide_dbm', title: 'User Guide: Omnicortex DBM', subtitle: '13 Categories, Dev Mode & JSON Backup', icon: <BookOpen size={16} className="text-emerald-400" />, action: () => { window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'dbm' } })); onClose(); } },
      { id: 'nav_codex', title: 'Go to Codex Matrix Suite', subtitle: 'Guided Development Tools (14 Matrices)', icon: <Sparkles size={16} className="text-amber-400" />, action: () => { navigate('/codex'); onClose(); } },
      { id: 'nav_guide_codex', title: 'User Guide: Codex & Matrices', subtitle: '14 Engineering Matrices & Economatrix', icon: <BookOpen size={16} className="text-amber-400" />, action: () => { window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'codex' } })); onClose(); } },
      { id: 'nav_maps', title: 'Go to Tactical Map Maker', subtitle: 'Virtual Tabletop Grid Canvas', icon: <Map size={16} className="text-cyan-400" />, action: () => { navigate('/foundry/map-maker'); onClose(); } },
      { id: 'nav_guide_maps', title: 'User Guide: Tactical Map & VTT', subtitle: 'Grid Canvas, Tokens, Combat Tracker, Spectator', icon: <BookOpen size={16} className="text-cyan-400" />, action: () => { window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'maps' } })); onClose(); } },
      { id: 'nav_aime', title: 'Go to AIME Creative Suite', subtitle: 'Artificial Intellect Master Entity', icon: <Sparkles size={16} className="text-purple-400" />, action: () => { navigate('/foundry/aime'); onClose(); } },
      { id: 'nav_guide_rules', title: 'User Guide: Core Rules & Combat', subtitle: '2d10 Resolution, TN Ladder & Criticals', icon: <BookOpen size={16} className="text-teal-400" />, action: () => { window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'rules' } })); onClose(); } },
      { id: 'nav_elements', title: 'Go to Element Forge', subtitle: 'Custom Lore & Species Editor', icon: <Sparkles size={16} className="text-emerald-400" />, action: () => { navigate('/foundry/elements'); onClose(); } }
    ];

    if (!q) return defaultNav;

    // Filter Navigation
    defaultNav.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q)) {
        results.push(n);
      }
    });

    // 2.5 Search Codex Matrix Modules
    CODEX_MATRICES.forEach(mat => {
      if (
        mat.name.toLowerCase().includes(q) ||
        mat.label.toLowerCase().includes(q) ||
        mat.category.toLowerCase().includes(q) ||
        mat.description.toLowerCase().includes(q)
      ) {
        const MatIcon = mat.icon;
        results.push({
          id: `matrix_${mat.id}`,
          title: `Codex: ${mat.name} Matrix`,
          subtitle: `${mat.category} • ${mat.description.slice(0, 60)}...`,
          icon: <MatIcon size={16} style={{ color: mat.color }} />,
          action: () => {
            navigate(`/codex?matrix=${mat.id}`);
            onClose();
          }
        });
      }
    });

    // 3. Search Roster Heroes
    const allHeroes = personaRoster || roster || [];
    allHeroes.forEach(hero => {
      const heroName = hero.name || hero['char-name'];
      const heroSpecies = hero.species || hero['char-species'];
      const heroConcept = hero.concept || hero['char-concept'] || hero.occupation || hero['char-occu'];
      const heroId = hero.id || hero['character-doc-id'];
      if (
        heroName?.toLowerCase().includes(q) || 
        heroSpecies?.toLowerCase().includes(q) ||
        heroConcept?.toLowerCase().includes(q)
      ) {
        results.push({
          id: `hero_${heroId || heroName}`,
          title: heroName || 'Unnamed Hero',
          subtitle: `Hero Persona • ${heroSpecies || 'Human'} • ${heroConcept || 'Operative'}`,
          icon: <User size={16} className="text-amber-400" />,
          action: () => { 
            navigate(`/folio?charId=${heroId || ''}`); 
            onClose(); 
          }
        });
      }
    });

    // 4. Search Scenarios
    (universeState?.scenarios || []).forEach(scenario => {
      const scenarioTitle = scenario.title || scenario.name;
      if (scenarioTitle?.toLowerCase().includes(q)) {
        results.push({
          id: `scenario_${scenario.id}`,
          title: scenarioTitle,
          subtitle: `Story Scenario • ${scenario.type || 'Encounter'}`,
          icon: <BookOpen size={16} className="text-purple-400" />,
          action: () => { 
            navigate(`/foundry/story?scenarioId=${scenario.id}`); 
            onClose(); 
          }
        });
      }
    });

    // 5. Search Maps
    const allMaps = mapsCatalog?.length ? mapsCatalog : (universeState?.maps || []);
    allMaps.forEach(map => {
      if (map.name?.toLowerCase().includes(q) || map.title?.toLowerCase().includes(q)) {
        results.push({
          id: `map_${map.id}`,
          title: map.name || map.title || 'Untitled Map',
          subtitle: `Tactical Map • ${map.gridType || 'Square'} Grid`,
          icon: <Map size={16} className="text-cyan-400" />,
          action: () => { navigate(`/foundry/map-maker?mapId=${map.id}`); onClose(); }
        });
      }
    });

    // 6. Search DBM Compendium Entries
    if (dbData) {
      Object.keys(dbData).forEach(category => {
        const categoryItems = Array.isArray(dbData[category]) 
          ? dbData[category] 
          : Object.values(dbData[category] || {});
        categoryItems.forEach(item => {
          if (item?.name?.toLowerCase().includes(q) || item?.description?.toLowerCase().includes(q)) {
            results.push({
              id: `dbm_${item.id || item.name}`,
              title: item.name,
              subtitle: `Omnicortex ${category.toUpperCase()} • ${item.type || 'Standard'}`,
              icon: <BookOpen size={16} className="text-emerald-400" />,
              action: () => { navigate(`/dbm?category=${category}&itemId=${item.id || ''}`); onClose(); }
            });
          }
        });
      });
    }

    return results.slice(0, 10);
  }, [query, dbData, mapsCatalog, universeState, personaRoster, roster, isOpen, navigate, onClose, onDiceRolled]);

  // Keyboard navigation within list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, searchResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % Math.max(1, searchResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected?.action) {
        AudioService.playTerminalBeep(1200, 0.04);
        selected.action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-24 px-4 select-none font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0d1117] border border-cyan-500/40 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.2)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3 bg-slate-900/50">
          <Search size={18} className="text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search compendium, heroes, maps, or type /roll [dice]..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none font-mono"
          />
          {query && (
            <button 
              type="button"
              onClick={() => setQuery('')} 
              className="text-slate-500 hover:text-slate-300"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No matching records or commands found for "{query}".
            </div>
          ) : (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.04);
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 shadow-sm' 
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-cyan-900/50 text-cyan-300' : 'bg-slate-800/80 text-slate-400'}`}>
                      {item.icon}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-sm truncate font-mono text-slate-100">{item.title}</span>
                      <span className="text-[11px] text-slate-400 truncate">{item.subtitle}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 shrink-0">
                      <span>Jump</span>
                      <CornerDownLeft size={12} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick Footer Tips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Tip: type <code className="text-amber-400">/roll 2d10+4</code> for instant rolls</span>
          </div>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
