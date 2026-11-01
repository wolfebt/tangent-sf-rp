import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Terminal, 
  Radio, 
  Database, 
  Layers, 
  BookOpen,
  Search,
  X,
  CornerDownLeft
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useFolio } from '../../context/FolioContext';
import { useDBM, loadCompendiumCatalog } from '../../context/DBMContext';
import { useStory } from '../../context/CampaignContext';
import { useGroup } from '../../context/GroupContext';
import { useChat } from '../../context/ChatContext';
import { CODEX_MATRICES } from '../../pages/Codex/codexConfig';

/**
 * @file WelcomeBriefing.jsx
 * @description Tactical briefing drawer docked on the left side of the landing page on wider views
 * (and rendered inline on mobile). The 5 cards act as visual launch tabs for the primary system modules,
 * accompanied by a live platform search bar.
 */
export const WelcomeBriefing = ({ onDismiss, isMobile = false, docked = false }) => {
  const navigate = useNavigate();

  // Telemetry & data for live metrics and platform search
  const { personaRoster = [], roster = [], setActiveTab, switchRosterCharacter } = useFolio() || {};
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};
  const { universeState, mapsCatalog, elementsCatalog } = useStory() || {};
  const { groups = [] } = useGroup() || {};
  const { totalUnreadCount = 0 } = useChat() || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const heroCount = Array.isArray(personaRoster) && personaRoster.length > 0 
    ? personaRoster.length 
    : (Array.isArray(roster) ? roster.length : 0);
  const dbmTotalItems = Object.keys(dbData).reduce((sum, key) => {
    return sum + (Array.isArray(dbData[key]) ? dbData[key].length : 0);
  }, 0);
  const scenarioCount = universeState?.scenarios?.length || 0;
  const mapsCount = mapsCatalog?.length || universeState?.maps?.length || 0;
  const teamCount = groups?.length || 0;
  const compendiumArticles = dbData?.compendium || [];
  const compendiumCount = Array.isArray(compendiumArticles) ? compendiumArticles.length : 0;

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeploy = (route, action) => {
    AudioService.playTerminalBeep(1150, 0.02);
    if (typeof action === 'function') {
      action();
    }
    if (route) {
      onDismiss?.();
      navigate(route);
    }
  };

  const primarySections = [
    {
      id: 'folio',
      railIndex: '01',
      title: 'FOLIO',
      subtitle: 'Persona Dossiers & Character Engine',
      badge: heroCount > 0 ? `${heroCount} ${heroCount === 1 ? 'PERSONA' : 'PERSONAS'}` : 'PERSONA ENGINE',
      desc: '150 CP character builder, 95+ skills matrix, augmentations, and live dual 2d10 sheet resolution.',
      primaryRoute: '/folio?tab=catalog',
      action: () => setActiveTab?.('catalog'),
      icon: Users,
      colorTheme: 'cyan',
      borderColor: 'border-cyan-500/35 hover:border-cyan-400 focus-within:border-cyan-400',
      barColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
      dotColor: 'bg-cyan-400',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      iconColor: 'text-cyan-400',
      titleColor: 'text-cyan-300 group-hover:text-cyan-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(34,211,238,0.22)]'
    },
    {
      id: 'rules',
      railIndex: '02',
      title: 'RULES',
      subtitle: 'System Compendium & Core Mechanics',
      badge: compendiumCount > 0 ? `${compendiumCount} ARTICLES` : 'RULES COMPENDIUM',
      desc: 'Canonical dual 2d10 mechanics, action economy, conditions, and tactical combat.',
      primaryRoute: '/compendium',
      icon: BookOpen,
      colorTheme: 'sky',
      borderColor: 'border-sky-500/35 hover:border-sky-400 focus-within:border-sky-400',
      barColor: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
      dotColor: 'bg-sky-400',
      badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
      btnColor: 'bg-sky-600 hover:bg-sky-500 text-white',
      iconColor: 'text-sky-400',
      titleColor: 'text-sky-300 group-hover:text-sky-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(56,189,248,0.22)]',
      onMouseEnter: () => loadCompendiumCatalog()
    },
    {
      id: 'network',
      railIndex: '03',
      title: 'NETWORK',
      subtitle: 'Tactical Squads, CommLink & Operator Relay',
      badge: totalUnreadCount > 0 
        ? `${totalUnreadCount} UNREAD` 
        : (teamCount > 0 ? `${teamCount} SQUADS` : 'SQUAD & COMMS NET'),
      desc: 'Assemble fireteams with QR invites, chat over encrypted subspace channels, and stream voice net.',
      primaryRoute: '/network',
      icon: Radio,
      colorTheme: 'emerald',
      borderColor: 'border-emerald-500/35 hover:border-emerald-400 focus-within:border-emerald-400',
      barColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      dotColor: 'bg-emerald-400',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300 group-hover:text-emerald-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(16,185,129,0.22)]'
    },
    {
      id: 'ade',
      railIndex: '04',
      title: 'ADE',
      subtitle: 'Consolidated Story, Maps & Stage VTT',
      badge: (scenarioCount + mapsCount) > 0 ? `${scenarioCount + mapsCount} ${(scenarioCount + mapsCount) === 1 ? 'MODULE' : 'MODULES'}` : 'ARCHITECT SUITE',
      desc: 'Author branching narrative scenarios, paint tactical grid maps, and direct live combat on The Stage.',
      primaryRoute: '/foundry',
      icon: Layers,
      colorTheme: 'purple',
      borderColor: 'border-purple-500/35 hover:border-purple-400 focus-within:border-purple-400',
      barColor: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
      dotColor: 'bg-purple-400',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
      iconColor: 'text-purple-400',
      titleColor: 'text-purple-300 group-hover:text-purple-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(168,85,247,0.22)]'
    },
    {
      id: 'cortex',
      railIndex: '05',
      title: 'CORTEX',
      subtitle: 'Master Database, Catalogs & Galactic Lore',
      badge: dbmTotalItems > 0 ? `${dbmTotalItems} ENTRIES` : 'DATABASE & LORE',
      desc: 'Canonical DBM catalog, 101 playable species, equipment matrix, and galactic lore wiki.',
      primaryRoute: '/dbm',
      icon: Database,
      colorTheme: 'amber',
      borderColor: 'border-amber-500/35 hover:border-amber-400 focus-within:border-amber-400',
      barColor: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
      dotColor: 'bg-amber-400',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      btnColor: 'bg-amber-600 hover:bg-amber-500 text-white',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-300 group-hover:text-amber-200',
      glowColor: 'hover:shadow-[0_0_22px_rgba(245,158,11,0.22)]',
      onMouseEnter: () => loadCompendiumCatalog()
    }
  ];

  // Live Platform Search Results across Modules, Personas, Rules, Cortex DBM, ADE Scenarios/Maps, Squads, and Codex Matrices
  const platformSearchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const results = [];

    // 1. Primary Platform Sections
    primarySections.forEach((sec) => {
      if (
        sec.title.toLowerCase().includes(q) ||
        sec.subtitle.toLowerCase().includes(q) ||
        sec.desc.toLowerCase().includes(q)
      ) {
        const SecIcon = sec.icon;
        results.push({
          id: `sec_${sec.id}`,
          title: sec.title,
          subtitle: sec.subtitle,
          badge: 'MODULE',
          badgeClass: sec.badgeColor,
          icon: <SecIcon size={13} className={sec.iconColor} />,
          onSelect: () => handleDeploy(sec.primaryRoute, sec.action)
        });
      }
    });

    // 2. Folio Personas
    const allHeroes = Array.isArray(personaRoster) && personaRoster.length > 0 ? personaRoster : (Array.isArray(roster) ? roster : []);
    allHeroes.forEach((hero) => {
      const heroName = hero?.name || hero?.['char-name'] || '';
      const heroSpecies = hero?.species || hero?.['char-species'] || '';
      const heroConcept = hero?.concept || hero?.['char-concept'] || hero?.occupation || hero?.['char-occu'] || '';
      const heroId = hero?.id || hero?.['character-doc-id'] || '';
      if (
        heroName.toLowerCase().includes(q) ||
        heroSpecies.toLowerCase().includes(q) ||
        heroConcept.toLowerCase().includes(q)
      ) {
        results.push({
          id: `hero_${heroId || heroName}`,
          title: heroName || 'Unnamed Persona',
          subtitle: `${heroSpecies || 'Human'} • ${heroConcept || 'Operator'}`,
          badge: 'FOLIO',
          badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
          icon: <Users size={13} className="text-cyan-400" />,
          onSelect: () =>
            handleDeploy(
              heroId ? `/folio?tab=identity&char=${encodeURIComponent(heroId)}` : '/folio?tab=catalog',
              () => {
                if (heroId) switchRosterCharacter?.(heroId);
                setActiveTab?.(heroId ? 'identity' : 'catalog');
              }
            )
        });
      }
    });

    // 3. Rules & Compendium Articles
    const compList = Array.isArray(dbData?.compendium) ? dbData.compendium : [];
    compList.forEach((article) => {
      const title = article?.name || article?.title || '';
      const entryType = article?.entry_type || 'Rule';
      const desc = article?.description || '';
      const mech = article?.mechanic || '';
      if (
        title.toLowerCase().includes(q) ||
        entryType.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        mech.toLowerCase().includes(q)
      ) {
        const targetId = article?.id || title;
        results.push({
          id: `rule_${targetId}`,
          title: title || 'Untitled Rule',
          subtitle: `${entryType}${desc ? ` • ${desc.slice(0, 65)}` : ''}`,
          badge: 'RULES',
          badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
          icon: <BookOpen size={13} className="text-sky-400" />,
          onSelect: () => handleDeploy(`/compendium?article=${encodeURIComponent(targetId)}`)
        });
      }
    });

    // 4. ADE Scenarios, Maps & Story Elements
    (universeState?.scenarios || []).forEach((scenario) => {
      const title = scenario?.title || scenario?.name || '';
      const desc = scenario?.description || scenario?.summary || '';
      if (title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
        results.push({
          id: `scenario_${scenario.id || title}`,
          title: title || 'Untitled Scenario',
          subtitle: `Scenario • ${scenario?.type || 'Story Module'}`,
          badge: 'ADE',
          badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
          icon: <Layers size={13} className="text-purple-400" />,
          onSelect: () => handleDeploy(`/foundry/story?scenarioId=${encodeURIComponent(scenario.id || '')}`)
        });
      }
    });

    const allMaps = Array.isArray(mapsCatalog) && mapsCatalog.length > 0 ? mapsCatalog : (universeState?.maps || []);
    allMaps.forEach((map) => {
      const mapTitle = map?.name || map?.title || '';
      if (mapTitle.toLowerCase().includes(q)) {
        results.push({
          id: `map_${map.id || mapTitle}`,
          title: mapTitle || 'Untitled Map',
          subtitle: `Tactical Map • ${map?.gridType || 'Square'} Grid`,
          badge: 'ADE',
          badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
          icon: <Layers size={13} className="text-purple-400" />,
          onSelect: () => handleDeploy(`/foundry/map?mapId=${encodeURIComponent(map.id || '')}`)
        });
      }
    });

    const allElements = Array.isArray(elementsCatalog) && elementsCatalog.length > 0 ? elementsCatalog : (universeState?.elements || []);
    allElements.forEach((el) => {
      const elName = el?.name || el?.title || '';
      const elType = el?.type || el?.category || 'Element';
      if (elName.toLowerCase().includes(q) || elType.toLowerCase().includes(q)) {
        results.push({
          id: `el_${el.id || elName}`,
          title: elName || 'Unnamed Element',
          subtitle: `Story Element • ${elType}`,
          badge: 'ADE',
          badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
          icon: <Layers size={13} className="text-purple-400" />,
          onSelect: () => handleDeploy('/foundry/elements')
        });
      }
    });

    // 5. Network Squads
    (Array.isArray(groups) ? groups : []).forEach((sq) => {
      const sqName = sq?.name || sq?.title || '';
      const sqDesc = sq?.description || '';
      if (sqName.toLowerCase().includes(q) || sqDesc.toLowerCase().includes(q)) {
        results.push({
          id: `squad_${sq.id || sqName}`,
          title: sqName || 'Unnamed Squad',
          subtitle: sqDesc || 'Tactical Squad',
          badge: 'NETWORK',
          badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          icon: <Radio size={13} className="text-emerald-400" />,
          onSelect: () => handleDeploy('/network?view=squads')
        });
      }
    });

    // 6. Codex Matrices
    (Array.isArray(CODEX_MATRICES) ? CODEX_MATRICES : []).forEach((mat) => {
      if (
        mat.name?.toLowerCase().includes(q) ||
        mat.label?.toLowerCase().includes(q) ||
        mat.category?.toLowerCase().includes(q) ||
        mat.description?.toLowerCase().includes(q)
      ) {
        results.push({
          id: `matrix_${mat.id}`,
          title: `${mat.name} Matrix`,
          subtitle: `${mat.category} • ${mat.description || ''}`,
          badge: 'CODEX',
          badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          icon: <Database size={13} className="text-amber-400" />,
          onSelect: () => handleDeploy(`/codex?matrix=${encodeURIComponent(mat.id)}`)
        });
      }
    });

    // 7. Cortex / DBM Catalog Entries (Species, Skills, Weaponry, Armoring, Gear, Augmentations, Factions, etc.)
    Object.keys(dbData || {}).forEach((category) => {
      if (category === 'compendium') return;
      const items = Array.isArray(dbData[category]) ? dbData[category] : [];
      items.forEach((item) => {
        if (!item) return;
        const itemName = item.name || item.title || '';
        const itemType = Array.isArray(item.type) ? item.type.join(', ') : (item.type || item.category || '');
        const itemDesc = item.description || '';
        if (
          itemName.toLowerCase().includes(q) ||
          String(itemType).toLowerCase().includes(q) ||
          itemDesc.toLowerCase().includes(q)
        ) {
          const itemKey = item.id || itemName;
          results.push({
            id: `dbm_${category}_${itemKey}`,
            title: itemName || 'Unnamed Entry',
            subtitle: `${category.replace(/_/g, ' ').toUpperCase()}${itemType ? ` • ${itemType}` : ''}${itemDesc ? ` — ${itemDesc.slice(0, 50)}` : ''}`,
            badge: 'CORTEX',
            badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
            icon: <Database size={13} className="text-amber-400" />,
            onSelect: () =>
              handleDeploy(
                `/dbm?cat=${encodeURIComponent(category)}&item=${encodeURIComponent(itemKey)}`,
                () => dbContext.navigateToCategory?.(category, null)
              )
          });
        }
      });
    });

    return results.slice(0, 15);
  }, [
    searchQuery,
    personaRoster,
    roster,
    dbData,
    universeState,
    mapsCatalog,
    elementsCatalog,
    groups
  ]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSearchQuery('');
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
      return;
    }
    if (!platformSearchResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % platformSearchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + platformSearchResults.length) % platformSearchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = platformSearchResults[selectedIndex] || platformSearchResults[0];
      if (target?.onSelect) {
        setSearchQuery('');
        setIsSearchFocused(false);
        target.onSelect();
      }
    }
  };

  const renderCard = (section) => {
    const Icon = section.icon;
    return (
      <article
        key={section.id}
        onMouseEnter={section.onMouseEnter}
        className={`group relative w-full px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#101520]/95 hover:bg-[#131b29] border ${section.borderColor} transition-all duration-150 flex flex-col gap-1 shadow-sm ${section.glowColor} overflow-hidden`}
      >
        {/* Top Accent Tab Indicator Line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${section.barColor} opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none`} />

        {/* Row 1: Icon, Semantic H2 Stretched-Link Title, Subtitle & Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className={`p-1 rounded-md bg-slate-900/90 ${section.iconColor} border border-slate-700/60 group-hover:scale-105 transition-transform shrink-0`}>
              <Icon size={14} aria-hidden="true" />
            </div>
            <h2 className="m-0 flex items-baseline gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => handleDeploy(section.primaryRoute, section.action)}
                className="text-left flex items-baseline gap-1.5 min-w-0 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 after:absolute after:inset-0 after:z-0"
                title={`Launch ${section.title} — ${section.subtitle}`}
              >
                <span className={`font-extrabold text-[13px] sm:text-sm font-mono tracking-wider leading-none ${section.titleColor}`}>
                  {section.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-medium">
                  /{section.railIndex}
                </span>
                <span className="hidden sm:inline text-slate-400 text-[10px] font-mono" aria-hidden="true">•</span>
                <span className="text-[10px] sm:text-[10.5px] font-mono text-slate-300 uppercase tracking-wider truncate hidden sm:inline font-semibold">
                  {section.subtitle}
                </span>
              </button>
            </h2>
          </div>
          <span className={`relative z-10 pointer-events-none text-[8.5px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider shrink-0 whitespace-nowrap ${section.badgeColor}`}>
            {section.badge}
          </span>
        </div>

        {/* Row 2: Full Description (No cutoff, single-line on desktop) */}
        <p className="text-[11px] sm:text-[11.5px] text-slate-200/95 leading-snug font-sans pointer-events-none">
          {section.desc}
        </p>
      </article>
    );
  };

  return (
    <section 
      aria-label="Tactical Briefing Operations Hub"
      className={
        docked
          ? 'w-full h-full p-2.5 sm:p-3.5 bg-[#0b1019]/95 backdrop-blur-xl border-r border-cyan-500/40 shadow-[10px_0_35px_rgba(0,0,0,0.85),0_0_15px_rgba(34,211,238,0.1)] flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-200 font-sans text-slate-200 select-none relative overflow-y-auto no-scrollbar'
          : 'w-full sm:w-[92%] md:w-4/5 lg:w-2/3 max-w-7xl mx-auto p-2 sm:p-3 bg-[#0b1019]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_15px_rgba(34,211,238,0.1)] flex flex-col gap-1.5 sm:gap-2 animate-in fade-in zoom-in-95 duration-200 font-sans text-slate-200 select-none relative overflow-hidden shrink-0'
      }
    >
      {/* Top subtle cyan energy scan line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none" />

      {/* ── Briefing Header with Functional Platform Search Bar ── */}
      <div ref={searchContainerRef} className="relative flex flex-col pb-2 border-b border-cyan-500/30 gap-2 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shrink-0">
            <Terminal size={14} aria-hidden="true" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)] shrink-0" aria-hidden="true" />
            <h1 className="m-0 text-xs sm:text-[13px] font-bold font-mono tracking-wider text-cyan-300 uppercase truncate">
              TACTICAL BRIEFING // WELCOME OPERATOR
            </h1>
          </div>
        </div>

        {/* Functional Platform Search Input */}
        <div className="w-full min-h-[30px] px-2.5 py-1 rounded-lg bg-slate-950/90 border border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_12px_rgba(34,211,238,0.2)] text-slate-200 font-mono text-[11px] flex items-center gap-1.5 transition-all shadow-inner">
          <Search size={12} className="text-cyan-400 shrink-0" aria-hidden="true" />
          <span className="text-cyan-400 font-bold shrink-0" aria-hidden="true">&gt;_</span>
          <input
            ref={searchInputRef}
            type="search"
            data-testid="platform-search-input"
            value={searchQuery}
            onFocus={() => {
              setIsSearchFocused(true);
              loadCompendiumCatalog();
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
              setIsSearchFocused(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search Cortex, rules, personas, maps..."
            aria-label="Search Cortex, rules, personas, maps, and modules"
            className="flex-1 min-w-0 bg-transparent text-slate-100 placeholder-slate-500 text-[11px] font-mono focus:outline-none select-text"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(0);
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="p-0.5 rounded text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Live Platform Search Results Dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div
            data-testid="platform-search-results"
            className="w-full max-h-72 overflow-y-auto rounded-lg bg-[#0d121d]/98 border border-cyan-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(34,211,238,0.18)] p-1.5 flex flex-col gap-1"
          >
            {platformSearchResults.length === 0 ? (
              <div className="py-4 px-3 text-center text-[11px] font-mono text-slate-400">
                No matching records found for &ldquo;{searchQuery.trim()}&rdquo;.
              </div>
            ) : (
              platformSearchResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(false);
                      item.onSelect?.();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-100 shadow-xs'
                        : 'bg-slate-900/40 hover:bg-slate-900/80 border-transparent text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded bg-slate-900/90 border border-slate-700/60 shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono font-bold text-[11px] text-slate-100 truncate">
                          {item.title}
                        </span>
                        <span className="font-sans text-[10px] text-slate-400 truncate">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider whitespace-nowrap ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                      {isSelected && (
                        <CornerDownLeft size={11} className="text-cyan-400 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── 5 Primary Section Cards (1 Card Per Row, Centered, 2/3 Width) ── */}
      <div className="flex flex-col gap-1.5 w-full">
        {primarySections.map(renderCard)}
      </div>
    </section>
  );
};

export default WelcomeBriefing;
