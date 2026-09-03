import React, { useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';
import { 
  Briefcase, 
  Sword, 
  Shield, 
  Package, 
  Bot, 
  Building2, 
  Layers, 
  ArrowRight,
  Boxes,
  Scale
} from 'lucide-react';
import { scaleCarryingCapacity } from '../../../engines/tangentScalingEngine';

export const PropertyHubView = ({ 
  onSelectSection,
  onOpenSelectorModal,
  onOpenAssetModal
}) => {
  const { characterData, getAttrTotal, derivedStats } = useFolio();

  const getArray = (key, altKey) => {
    let val = characterData[key];
    if (!val && altKey) val = characterData[altKey];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const weaponryList = useMemo(() => getArray('weapons', 'weaponry'), [characterData.weapons, characterData.weaponry]);
  const armoringList = useMemo(() => getArray('armoring', 'armor'), [characterData.armoring, characterData.armor]);
  const gearList = useMemo(() => getArray('gear', 'equipment'), [characterData.gear, characterData.equipment]);
  const mechList = useMemo(() => getArray('mecha', 'mech'), [characterData.mecha, characterData.mech]);
  const architectureList = useMemo(() => getArray('architecture', 'structures'), [characterData.architecture, characterData.structures]);
  const otherList = useMemo(() => getArray('other', 'misc'), [characterData.other, characterData.misc]);

  const totalItemsCount = (
    weaponryList.length +
    armoringList.length +
    gearList.length +
    mechList.length +
    architectureList.length +
    otherList.length
  );

  const sumWeight = (list) => {
    return (list || []).reduce((acc, item) => {
      if (typeof item === 'object' && item !== null) {
        const wt = parseFloat(item.weight ?? item.wt ?? item.mass ?? 0) || 0;
        const qty = parseInt(item.qty ?? item.quantity ?? 1, 10) || 1;
        return acc + (wt * qty);
      }
      return acc;
    }, 0);
  };

  const carriedWeight = useMemo(() => {
    const total = sumWeight(weaponryList) + sumWeight(armoringList) + sumWeight(gearList) + sumWeight(otherList);
    return Math.round(total * 10) / 10;
  }, [weaponryList, armoringList, gearList, otherList]);

  const strScore = getAttrTotal ? getAttrTotal('attr-strength') : parseInt(characterData['attr-strength'] || 0, 10);
  const sizeKey = characterData['char-size'] || derivedStats?.size || 'Medium';
  const baseMaxCapacity = (Math.max(0, strScore) + 2) * 50; // 100 lbs base at STR 0
  const maxCapacity = scaleCarryingCapacity(baseMaxCapacity, sizeKey);
  const lightCapacity = Math.round(maxCapacity * 0.5);
  const isOverburdened = carriedWeight > maxCapacity;
  const isEncumbered = carriedWeight > lightCapacity && !isOverburdened;

  const handleCardClick = (targetTab) => {
    AudioService.playTerminalBeep(1100, 0.02);
    if (onSelectSection) {
      onSelectSection(targetTab);
    }
  };

  const PROPERTY_OPTIONS = [
    {
      id: 'property-weaponry',
      title: 'Weaponry',
      tagline: 'Offensive Armaments & Weapon Systems',
      icon: Sword,
      count: weaponryList.length,
      unit: weaponryList.length === 1 ? 'Weapon' : 'Weapons',
      colorTheme: 'amber',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.22)]',
      iconBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      accentColor: 'text-amber-400',
      description: 'Firearms, bladecraft, heavy ballistic ordnance, particle lances, energy projectors & tactical combat modules.'
    },
    {
      id: 'property-armoring',
      title: 'Armoring',
      tagline: 'Ballistics, Carapaces & Kinetic Shields',
      icon: Shield,
      count: armoringList.length,
      unit: armoringList.length === 1 ? 'Suit / Plate' : 'Suits / Plates',
      colorTheme: 'emerald',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(16,185,129,0.22)]',
      iconBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      accentColor: 'text-emerald-400',
      description: 'Body armor, ballistic weave, kinetic deflectors, powered exoskeletons, hazard suits & tactical carapaces.'
    },
    {
      id: 'property-gear',
      title: 'Gear',
      tagline: 'Operative Tools, Field Kits & Gadgets',
      icon: Package,
      count: gearList.length,
      unit: gearList.length === 1 ? 'Item' : 'Items',
      colorTheme: 'cyan',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]',
      iconBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      accentColor: 'text-cyan-400',
      description: 'Field kits, surveillance gear, medical autoinjectors, communications arrays, computer terminals & survival supplies.'
    },
    {
      id: 'property-mech',
      title: 'Mech & Vehicles',
      tagline: 'Combat Walkers, Craft & Drones',
      icon: Bot,
      count: mechList.length,
      unit: mechList.length === 1 ? 'Unit' : 'Units',
      colorTheme: 'purple',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.22)]',
      iconBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
      accentColor: 'text-purple-400',
      description: 'Piloted combat mecha, atmospheric skimmers, surface rovers, interstellar shuttlecraft & autonomous drone wings.'
    },
    {
      id: 'property-architecture',
      title: 'Architecture',
      tagline: 'Safehouses, Labs & Orbital Holdings',
      icon: Building2,
      count: architectureList.length,
      unit: architectureList.length === 1 ? 'Holding' : 'Holdings',
      colorTheme: 'blue',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(59,130,246,0.22)]',
      iconBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
      accentColor: 'text-blue-400',
      description: 'Covert safehouses, private research facilities, fortress redoubts, industrial workshops & orbital real estate.'
    },
    {
      id: 'property-other',
      title: 'Other Property',
      tagline: 'Commodities, Relics & Vault Stores',
      icon: Layers,
      count: otherList.length,
      unit: otherList.length === 1 ? 'Asset' : 'Assets',
      colorTheme: 'slate',
      borderColor: 'border-slate-600/40 hover:border-slate-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(148,163,184,0.22)]',
      iconBg: 'bg-slate-700/25 text-slate-300 border-slate-600/40',
      badgeBg: 'bg-slate-900/90 text-slate-300 border-slate-700/70',
      accentColor: 'text-slate-300',
      description: 'Trade commodities, valuable data drives, ancient relics, currency reserves & miscellaneous property items.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full overflow-y-auto">
      {/* Header Hub Section (Center-Aligned) */}
      <div className="flex flex-col items-center text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(34,211,238,0.2)]">
          <Briefcase size={13} className="text-cyan-400" />
          <span>Holdings &amp; Logistics Hub</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider text-white">
          Personal Property Hub
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
          Select one of the 6 property domains below to equip armaments, configure protective carapaces, allocate field gear, or manage vehicle &amp; domain holdings.
        </p>

        {/* Aggregate Holdings Status Chips (Center-Aligned) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-300 font-mono text-xs font-semibold flex items-center gap-1.5 shadow-inner">
            <Boxes size={13} className="text-cyan-400" />
            <span>Total Registered Items:</span>
            <span className="text-white font-bold">{totalItemsCount}</span>
          </span>

          <span className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,211,238,0.15)]">
            <span className="text-cyan-400">Domains:</span>
            <span>6 Categories Active</span>
          </span>

          <span className={`px-3 py-1 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 ${
            isOverburdened
              ? 'bg-red-950/80 border-red-500/60 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              : isEncumbered
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-slate-900/90 border-slate-700/80 text-emerald-300'
          }`}>
            <Scale size={13} className={isOverburdened ? 'text-red-400' : isEncumbered ? 'text-amber-400' : 'text-emerald-400'} />
            <span>Load:</span>
            <span className="text-white">{carriedWeight} / {maxCapacity} lbs</span>
            <span className="text-[10px] uppercase font-normal opacity-80">
              ({isOverburdened ? 'Overburdened' : isEncumbered ? 'Encumbered' : 'Unencumbered'})
            </span>
          </span>
        </div>
      </div>

      {/* 6 Property Options Grid (Center-Aligned) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full max-w-5xl justify-center items-stretch">
        {PROPERTY_OPTIONS.map((opt) => {
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => handleCardClick(opt.id)}
              className={`bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-xl border ${opt.borderColor} ${opt.glowColor} rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group shadow-lg text-left`}
            >
              {/* Card Header & Content */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-105 ${opt.iconBg}`}>
                    <Icon size={22} />
                  </div>

                  <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${opt.badgeBg}`}>
                    {opt.count} {opt.unit}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-200 transition-colors uppercase tracking-wide">
                    {opt.title}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 font-medium mt-0.5">
                    {opt.tagline}
                  </p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {opt.description}
                </p>
              </div>

              {/* Card Footer Action */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-500">
                  {opt.count > 0 ? `${opt.count} in Inventory` : 'Empty Inventory'}
                </span>

                <div className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] ${opt.accentColor} group-hover:translate-x-0.5 transition-transform`}>
                  <span>Explore</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(PropertyHubView);
