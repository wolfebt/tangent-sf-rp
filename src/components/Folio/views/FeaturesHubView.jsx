import React, { useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { AudioService } from '../../../services/audioService';
import { Sparkles, Zap, Cpu, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const FeaturesHubView = ({ 
  onSelectSection,
  onOpenMetaphysicsModal,
  onOpenSelectorModal,
  onOpenAssetModal
}) => {
  const { characterData } = useFolio();

  // Helper to extract items array safely
  const getItemList = (key) => {
    const data = characterData[key];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim()) {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [data];
      }
    }
    return [];
  };

  const isAwakenedItem = (item) => {
    if (!item) return false;
    const name = (typeof item === 'object' ? (item.name || item.title || '') : String(item)).toLowerCase();
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    return type.includes('awakened') || type.includes('discipline') || name.startsWith('awakened');
  };

  const isAugmentationItem = (item) => {
    if (!item) return false;
    const name = (typeof item === 'object' ? (item.name || item.title || '') : String(item)).toLowerCase();
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    return type.includes('aug') || type.includes('cyber') || type.includes('bio-mod') || name.startsWith('aug:');
  };

  const isHindranceItem = (item) => {
    if (!item) return false;
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    return type.includes('hindrance') || type.includes('disadvantage') || type.includes('flaw');
  };

  // 1. Standard Features
  const standardFeatures = useMemo(() => {
    const raw = getItemList('features');
    return raw.filter(item => !isAwakenedItem(item) && !isAugmentationItem(item) && !isHindranceItem(item));
  }, [characterData.features]);

  const totalStandardCP = useMemo(() => {
    return standardFeatures.reduce((acc, feat) => {
      const cost = typeof feat === 'object' && feat.cp !== undefined ? parseInt(feat.cp, 10) : 2;
      return acc + (isNaN(cost) ? 2 : cost);
    }, 0);
  }, [standardFeatures]);

  // 2. Awakened & Invocations
  const awakenedList = useMemo(() => {
    const fromAwakened = getItemList('awakened').map(w => ({
      ...(typeof w === 'object' ? w : { name: w }),
      cp: typeof w === 'object' && w.cp !== undefined ? w.cp : 3
    }));
    const fromFeatures = getItemList('features').filter(isAwakenedItem).map(item => ({
      ...(typeof item === 'object' ? item : { name: item }),
      cp: typeof item === 'object' && item.cp !== undefined ? item.cp : 3
    }));

    const seen = new Set();
    const combined = [];
    [...fromAwakened, ...fromFeatures].forEach(item => {
      const name = (item.name || item.title || '').toLowerCase().replace('awakened:', '').trim();
      if (!seen.has(name)) {
        seen.add(name);
        combined.push(item);
      }
    });
    return combined;
  }, [characterData.awakened, characterData.features]);

  const learnedInvocations = useMemo(() => {
    return getItemList('invocations');
  }, [characterData.invocations]);

  const totalAwakenedCP = useMemo(() => {
    const discCP = awakenedList.reduce((acc, f) => {
      const c = parseInt(f.cp, 10);
      return acc + (isNaN(c) ? 3 : c);
    }, 0);
    const invCP = learnedInvocations.reduce((acc, inv) => {
      const c = typeof inv === 'object' && inv.cp !== undefined ? parseInt(inv.cp, 10) : 1;
      return acc + (isNaN(c) ? 1 : c);
    }, 0);
    return discCP + invCP;
  }, [awakenedList, learnedInvocations]);

  // 3. Augmentations
  const augmentationsList = useMemo(() => {
    const fromAugs = getItemList('augmentations').map(a => (typeof a === 'object' ? a : { name: a }));
    const fromFeats = getItemList('features').filter(isAugmentationItem).map(a => (typeof a === 'object' ? a : { name: a }));
    const seen = new Set();
    const combined = [];
    [...fromAugs, ...fromFeats].forEach(item => {
      const name = (item.name || item.title || '').toLowerCase();
      if (!seen.has(name)) {
        seen.add(name);
        combined.push(item);
      }
    });
    return combined;
  }, [characterData.augmentations, characterData.features]);

  const totalAugmentationsCP = useMemo(() => {
    return augmentationsList.reduce((acc, aug) => {
      const c = typeof aug === 'object' && aug.cp !== undefined ? parseInt(aug.cp, 10) : 2;
      return acc + (isNaN(c) ? 2 : c);
    }, 0);
  }, [augmentationsList]);

  // 4. Hindrances
  const hindrancesList = useMemo(() => {
    const raw = (Array.isArray(characterData.hindrances) && characterData.hindrances.length > 0)
      ? characterData.hindrances
      : getItemList('disadvantages');
    return raw.map(h => (typeof h === 'object' ? h : { name: h }));
  }, [characterData.hindrances, characterData.disadvantages]);

  const totalHindrancesRefund = useMemo(() => {
    return hindrancesList.reduce((acc, dis) => {
      const r = typeof dis === 'object' && dis.cp !== undefined ? parseInt(dis.cp, 10) : 3;
      return acc + (isNaN(r) ? 3 : r);
    }, 0);
  }, [hindrancesList]);

  const totalFeaturesCP = totalStandardCP + totalAwakenedCP + totalAugmentationsCP;
  const netFeaturesCP = totalFeaturesCP - totalHindrancesRefund;

  const handleCardClick = (targetTab) => {
    AudioService.playTerminalBeep(1100, 0.02);
    if (onSelectSection) {
      onSelectSection(targetTab);
    }
  };

  const FEATURE_OPTIONS = [
    {
      id: 'features-standard',
      title: 'Standard Features',
      tagline: 'Combat, Racial, Skill & General Talents',
      icon: Sparkles,
      count: standardFeatures.length,
      unit: standardFeatures.length === 1 ? 'Feature' : 'Features',
      cpText: `${totalStandardCP} CP`,
      colorTheme: 'cyan',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]',
      iconBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      accentColor: 'text-cyan-400',
      description: 'Specialized operative abilities, innate species traits, combat maneuvers, and trained talent trees defining character capabilities.'
    },
    {
      id: 'features-metaphysics',
      title: 'Metaphysics / Awakened',
      tagline: 'Esoteric Disciplines & Invocations',
      icon: Zap,
      count: awakenedList.length,
      unit: awakenedList.length === 1 ? 'Discipline' : 'Disciplines',
      extraCountText: learnedInvocations.length > 0 ? `· ${learnedInvocations.length} Invocations` : '',
      cpText: `${totalAwakenedCP} CP`,
      colorTheme: 'purple',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.22)]',
      iconBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
      accentColor: 'text-purple-400',
      description: 'Awakened reality manipulation, psionic phenomena, metaphysical formulas, and psychic resonance across the 6 cosmic disciplines.'
    },
    {
      id: 'features-augmentations',
      title: 'Augmentations',
      tagline: 'Cybernetics, Bionics & Neural Grafts',
      icon: Cpu,
      count: augmentationsList.length,
      unit: augmentationsList.length === 1 ? 'Installed' : 'Installed',
      cpText: `${totalAugmentationsCP} CP`,
      colorTheme: 'amber',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.22)]',
      iconBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      accentColor: 'text-amber-400',
      description: 'High-tech physical alterations, sub-dermal armor, neural coprocessors, and synthetic implants augmenting biological limits.'
    },
    {
      id: 'features-hindrances',
      title: 'Hindrances',
      tagline: 'Flaws, Debts & Physical Vulnerabilities',
      icon: AlertTriangle,
      count: hindrancesList.length,
      unit: hindrancesList.length === 1 ? 'Flaw' : 'Flaws',
      cpText: totalHindrancesRefund > 0 ? `-${totalHindrancesRefund} CP Refund` : '0 CP',
      colorTheme: 'rose',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      glowColor: 'hover:shadow-[0_0_24px_rgba(244,63,94,0.22)]',
      iconBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
      accentColor: 'text-rose-400',
      description: 'Character flaws, behavioral quirks, physical handicaps, and social debts providing vital CP refunds during operative creation.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full overflow-y-auto">
      {/* Header Hub Section (Center-Aligned) */}
      <div className="flex flex-col items-center text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(34,211,238,0.2)]">
          <Sparkles size={13} className="text-cyan-400" />
          <span>Operative Capabilities Hub</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider text-white">
          Features Selection Hub
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
          Select one of the 4 feature capability subsystems below to inspect acquired talents, browse the omnicortex compendium, or equip modifications.
        </p>

        {/* Aggregate CP Status Chips (Center-Aligned) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-300 font-mono text-xs font-semibold flex items-center gap-1.5 shadow-inner">
            <span className="text-cyan-400">Total Features:</span>
            <span className="text-white font-bold">{totalFeaturesCP} CP</span>
          </span>

          {totalHindrancesRefund > 0 && (
            <span className="px-3 py-1 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1.5 shadow-inner">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Refund:</span>
              <span className="font-bold">-{totalHindrancesRefund} CP</span>
            </span>
          )}

          <span className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,211,238,0.15)]">
            <span className="text-cyan-400">Net Cost:</span>
            <span>{netFeaturesCP} CP</span>
          </span>
        </div>
      </div>

      {/* 4 Feature Options Grid (Center-Aligned) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full max-w-3xl justify-center items-stretch">
        {FEATURE_OPTIONS.map((opt) => {
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

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${opt.badgeBg}`}>
                      {opt.count} {opt.unit}
                    </span>
                    {opt.extraCountText && (
                      <span className="font-mono text-[10px] text-slate-400">
                        {opt.extraCountText}
                      </span>
                    )}
                  </div>
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
                <span className="font-mono font-bold text-slate-300">
                  {opt.cpText}
                </span>

                <div className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] ${opt.accentColor} group-hover:translate-x-0.5 transition-transform`}>
                  <span>Manage</span>
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

export default React.memo(FeaturesHubView);
