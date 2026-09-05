import React from 'react';
import {
  Users,
  Database,
  Layers,
  Sparkles,
  Hash,
  Tv2
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

// ─── Individual standalone card (FOLIO, OMNICORTEX) ───────────────────────────
const NavCard = ({ title, subtitle, badge, icon: Icon, theme, isActive, onClick }) => {
  const themes = {
    cyan: {
      card: isActive
        ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_20px_rgba(34,211,238,0.35)]'
        : 'border-cyan-500/50 bg-slate-950/20 hover:bg-slate-900/70 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(34,211,238,0.25)]',
      title: isActive ? 'text-cyan-300' : 'text-slate-100 group-hover:text-cyan-300',
      badge: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      icon: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      dot: 'bg-cyan-400',
    },
    emerald: {
      card: isActive
        ? 'border-emerald-400 bg-emerald-950/50 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
        : 'border-emerald-500/50 bg-slate-950/20 hover:bg-slate-900/70 hover:border-emerald-400 hover:shadow-[0_0_16px_rgba(52,211,153,0.25)]',
      title: isActive ? 'text-emerald-300' : 'text-slate-100 group-hover:text-emerald-300',
      badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      icon: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
    },
  };
  const t = themes[theme] || themes.cyan;

  return (
    <button
      type="button"
      onClick={() => {
        AudioService.playTerminalBeep(1150, 0.03);
        onClick?.();
      }}
      className={`flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 backdrop-blur-md
        transition-all duration-200 cursor-pointer group text-left select-none ${t.card}`}
    >
      {/* Icon */}
      <div className={`p-1.5 rounded-lg border shrink-0 transition-colors ${t.icon}`}>
        <Icon size={15} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider transition-colors truncate ${t.title}`}>
            {title}
          </span>
          {isActive && <span className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${t.dot}`} />}
        </div>
        {subtitle && (
          <span className="text-[9px] font-mono text-slate-500 truncate block">{subtitle}</span>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <span className={`px-1.5 py-0.5 rounded-full border text-[8.5px] font-mono font-bold shrink-0 ${t.badge}`}>
          {badge}
        </span>
      )}
    </button>
  );
};

// ─── Sub-option pill inside a group block ─────────────────────────────────────
const SubPill = ({ label, icon: PillIcon, badge, isActive, color, onClick }) => {
  const colors = {
    purple: isActive
      ? 'bg-purple-500/25 border-purple-400/80 text-purple-200 shadow-[0_0_8px_rgba(192,132,252,0.2)]'
      : 'bg-slate-950/50 border-slate-700/80 text-slate-300 hover:border-purple-500/50 hover:text-purple-200 hover:bg-purple-950/20',
    amber: isActive
      ? 'bg-amber-500/25 border-amber-400/80 text-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
      : 'bg-slate-950/50 border-slate-700/80 text-slate-300 hover:border-amber-500/50 hover:text-amber-200 hover:bg-amber-950/20',
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        AudioService.playTerminalBeep(1200, 0.02);
        onClick?.();
      }}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9.5px] font-mono font-semibold
        transition-all duration-150 cursor-pointer whitespace-nowrap select-none ${colors[color] || colors.purple}`}
    >
      {PillIcon && <PillIcon size={10} className="shrink-0" />}
      <span>{label}</span>
      {badge !== undefined && badge !== null && (
        <span className="text-[8px] opacity-60 font-mono ml-0.5 bg-black/30 px-1 rounded">
          {badge}
        </span>
      )}
    </button>
  );
};

// ─── Grouped block (FOUNDRY or COMMS) with header + sub-pills ────────────────
const GroupBlock = ({ title, color, isAnyActive, children }) => {
  const borders = {
    purple: isAnyActive
      ? 'border-purple-400/70 bg-purple-950/20 shadow-[0_0_14px_rgba(192,132,252,0.2)]'
      : 'border-purple-500/30 bg-slate-950/10 hover:border-purple-500/50 hover:bg-purple-950/10',
    amber: isAnyActive
      ? 'border-amber-400/70 bg-amber-950/20 shadow-[0_0_14px_rgba(251,191,36,0.2)]'
      : 'border-amber-500/30 bg-slate-950/10 hover:border-amber-500/50 hover:bg-amber-950/10',
  };
  const labelColor = {
    purple: isAnyActive ? 'text-purple-300' : 'text-purple-400/80',
    amber: isAnyActive ? 'text-amber-300' : 'text-amber-400/80',
  };
  const dotColor = {
    purple: 'bg-purple-400',
    amber: 'bg-amber-400',
  };

  return (
    <div className={`flex flex-col gap-1.5 px-3 py-2 rounded-xl border-2 backdrop-blur-md
      transition-all duration-200 ${borders[color] || borders.purple}`}
    >
      {/* Block header label */}
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[color]}`} />
        <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${labelColor[color]}`}>
          {title}
        </span>
      </div>
      {/* Pills row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {children}
      </div>
    </div>
  );
};

// ─── Main TopNavBar export ────────────────────────────────────────────────────
export const TopNavBar = ({
  activeDrawer,
  onSelectDrawer,
  heroCount = 0,
  dbmTotalItems = 0,
  scenarioCount = 0,
  mapCount = 0,
  aimeCardsCount = 0,
  teamCount = 0,
  inviteCount = 0,
}) => {
  const folioActive = activeDrawer === 'persona-folio' || activeDrawer === 'persona-sheet';
  const omniActive = activeDrawer === 'omnicortex' || activeDrawer === 'dbm' || activeDrawer === 'codex';

  const foundryDrawers = ['foundry-scenarios', 'foundry-scenarios-workspace', 'foundry-elements', 'foundry-elements-workspace', 'foundry-maps', 'foundry-maps-workspace', 'foundry-aime', 'foundry-aime-workspace'];
  const commsDrawers = ['game-groups', 'squads', 'comms', 'comm-center'];

  const foundryAnyActive = foundryDrawers.includes(activeDrawer);
  const commsAnyActive = commsDrawers.includes(activeDrawer);

  return (
    <div className="w-full flex flex-row items-stretch gap-3 xl:gap-5 px-4 py-2.5
      bg-[#0b0f17]/80 backdrop-blur-xl border-b border-slate-800/70
      shadow-[0_4px_20px_rgba(0,0,0,0.5)] select-none overflow-x-auto no-scrollbar">

      {/* ── FOLIO ── */}
      <NavCard
        title="FOLIO"
        subtitle="Hero Builder & Roster"
        badge={`${heroCount} ${heroCount === 1 ? 'Operative' : 'Operatives'}`}
        icon={Users}
        theme="cyan"
        isActive={folioActive}
        onClick={() => onSelectDrawer('persona-folio')}
      />

      {/* ── OMNICORTEX ── */}
      <NavCard
        title="OMNICORTEX"
        subtitle="Rules & DBM"
        badge={dbmTotalItems > 0 ? `${dbmTotalItems.toLocaleString()} Entries` : 'Active'}
        icon={Database}
        theme="emerald"
        isActive={omniActive}
        onClick={() => onSelectDrawer('omnicortex')}
      />

      {/* ── ADE STUDIO block (purple) ── */}
      <GroupBlock title="ADE STUDIO" color="purple" isAnyActive={foundryAnyActive}>
        <SubPill
          label="VTT"
          icon={Tv2}
          badge={mapCount}
          color="purple"
          isActive={activeDrawer === 'foundry-maps' || activeDrawer === 'foundry-maps-workspace'}
          onClick={() => onSelectDrawer('foundry-maps')}
        />
        <SubPill
          label="SCENARIOS"
          icon={Layers}
          badge={scenarioCount}
          color="purple"
          isActive={activeDrawer === 'foundry-scenarios' || activeDrawer === 'foundry-scenarios-workspace'}
          onClick={() => onSelectDrawer('foundry-scenarios')}
        />
        <SubPill
          label="AIME STUDIO"
          icon={Sparkles}
          badge={aimeCardsCount}
          color="purple"
          isActive={activeDrawer === 'foundry-aime' || activeDrawer === 'foundry-aime-workspace'}
          onClick={() => onSelectDrawer('foundry-aime')}
        />
      </GroupBlock>

      {/* ── COMMS block (amber) ── */}
      <GroupBlock title="COMMS" color="amber" isAnyActive={commsAnyActive}>
        <SubPill
          label="TEAM VTT"
          icon={Users}
          badge={inviteCount > 0 ? `${inviteCount} ⚡` : teamCount}
          color="amber"
          isActive={activeDrawer === 'game-groups' || activeDrawer === 'squads'}
          onClick={() => onSelectDrawer('game-groups')}
        />
        <SubPill
          label="CHANNELS"
          icon={Hash}
          color="amber"
          isActive={activeDrawer === 'comms' || activeDrawer === 'comm-center'}
          onClick={() => onSelectDrawer('comms')}
        />
      </GroupBlock>
    </div>
  );
};

export default TopNavBar;
