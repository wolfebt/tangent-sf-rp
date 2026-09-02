import React, { useState, useMemo } from 'react';
import {
  Eye,
  Radio,
  Cpu,
  HeartHandshake,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Sliders,
  Send,
  Zap,
  Sparkles,
  Users
} from 'lucide-react';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';

export default function PassivePerceptionRadarModal({
  isOpen,
  onClose,
  tokens = [],
  onTriggerFloatingText,
  onBroadcastToChat
}) {
  if (!isOpen) return null;

  const { personaRoster = [] } = useFolio();
  const [testDC, setTestDC] = useState(15);
  const [hazardType, setHazardType] = useState('trap'); // 'trap' | 'ambush' | 'secret_door' | 'tech_signal'

  // Build Party Operative Radar Summary
  const partyRadar = useMemo(() => {
    // Collect unique operatives from personaRoster + tokens
    const list = personaRoster.length > 0
      ? personaRoster
      : tokens.filter(t => t.isHero || t.linkedHeroId || t.type === 'hero');

    return list.map((char, idx) => {
      const name = char['char-name'] || char.label || `Operative ${idx + 1}`;
      const species = char.species || 'Human';

      // Attributes & Skills (fallback sensible defaults)
      const perAttr = parseInt(char['attr-per-total'] || char.perception || 2, 10);
      const wilAttr = parseInt(char['attr-wil-total'] || char.willpower || 2, 10);
      const intAttr = parseInt(char['attr-int-total'] || char.intellect || 2, 10);
      const chaAttr = parseInt(char['attr-cha-total'] || char.charisma || 2, 10);

      // Passive Ratings (10 + Attribute + Estimated Skill)
      const physicalAlertness = 10 + perAttr + (char.alertnessRank || 2);
      const metaSense = 10 + wilAttr + (char.metaSenseRank || 1);
      const techScan = 10 + intAttr + (char.techRank || 2);
      const socialInsight = 10 + chaAttr + (char.empathyRank || 1);

      return {
        id: char.id || `char_${idx}`,
        name,
        species,
        physicalAlertness,
        metaSense,
        techScan,
        socialInsight
      };
    });
  }, [personaRoster, tokens]);

  // Evaluate detection based on selected hazard type & DC
  const detectionResults = useMemo(() => {
    return partyRadar.map(hero => {
      let heroScore = hero.physicalAlertness;
      if (hazardType === 'tech_signal') heroScore = hero.techScan;
      else if (hazardType === 'ambush') heroScore = Math.max(hero.physicalAlertness, hero.metaSense);
      else if (hazardType === 'social_deceit') heroScore = hero.socialInsight;

      const succeeds = heroScore >= testDC;
      const margin = heroScore - testDC;

      return {
        ...hero,
        heroScore,
        succeeds,
        margin
      };
    });
  }, [partyRadar, testDC, hazardType]);

  const handleBroadcastSecret = (hero) => {
    if (onBroadcastToChat) {
      const msg = `👁️ **[SECRET RADAR PASSIVE DETECTION]** **${hero.name}** passively detects the concealed ${hazardType.replace('_', ' ')} (Score ${hero.heroScore} vs. Secret DC ${testDC}, Margin +${hero.margin}).`;
      onBroadcastToChat(msg);
      AudioService.playTerminalBeep(980, 0.08);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] bg-[#0c111a] border-2 border-cyan-500/70 rounded-2xl shadow-[0_0_45px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border-b border-cyan-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-cyan-300 flex items-center gap-2">
                Passive Perception &amp; Secret GM Radar
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {partyRadar.length} OPERATIVES MONITORED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Adjudicate secret traps, stealth ambushes, hidden terminals, and lies without metagame rolls.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Secret DC Adjudicator Bar */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Hidden Anomaly:
            </label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-cyan-200 focus:border-cyan-400 outline-none font-medium"
            >
              <option value="trap">Hidden Trap / Mine (Physical Alertness)</option>
              <option value="ambush">Stealth Ambush / Camo (Alertness / Meta)</option>
              <option value="secret_door">Concealed Portal / Cache (Physical Alertness)</option>
              <option value="tech_signal">Encrypted Tech Signal (Tech Scan)</option>
              <option value="social_deceit">Deceit / Infiltrator Lie (Social Insight)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400 font-bold">Secret DC:</span>
            <input
              type="range"
              min="8"
              max="25"
              value={testDC}
              onChange={(e) => setTestDC(parseInt(e.target.value, 10))}
              className="w-32 accent-cyan-400 cursor-pointer"
            />
            <span className="text-cyan-300 font-black text-sm px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
              DC {testDC}
            </span>
          </div>
        </div>

        {/* Operatives Radar Grid */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {detectionResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No operative sheets detected. Populate the Persona Folio roster or add tokens to canvas.
            </div>
          ) : (
            detectionResults.map(hero => (
              <div
                key={hero.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between text-xs font-mono shadow-md ${
                  hero.succeeds
                    ? 'bg-cyan-950/30 border-cyan-500/80 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{hero.name}</h4>
                    <span className="text-[10px] text-slate-500 font-sans">{hero.species}</span>
                  </div>
                </div>

                {/* Radar 4 Pillars */}
                <div className="grid grid-cols-4 gap-3 text-center text-[10px]">
                  <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 block">Alertness</span>
                    <span className="text-cyan-300 font-bold">{hero.physicalAlertness}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 block">Meta Sense</span>
                    <span className="text-purple-300 font-bold">{hero.metaSense}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 block">Tech Scan</span>
                    <span className="text-amber-300 font-bold">{hero.techScan}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 block">Insight</span>
                    <span className="text-emerald-300 font-bold">{hero.socialInsight}</span>
                  </div>
                </div>

                {/* Detection Status & Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans flex items-center gap-1 ${
                      hero.succeeds
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}>
                      {hero.succeeds ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-600" />}
                      {hero.succeeds ? `Detected (+${hero.margin})` : 'Unaware'}
                    </span>
                  </div>

                  {hero.succeeds && onBroadcastToChat && (
                    <button
                      type="button"
                      onClick={() => handleBroadcastSecret(hero)}
                      className="p-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 transition-colors cursor-pointer"
                      title="Whisper secret detail to CommLink chat"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
