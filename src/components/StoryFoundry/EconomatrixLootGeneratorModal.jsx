import React, { useState } from 'react';
import {
  Coins,
  Sparkles,
  Layers,
  CheckCircle2,
  Send,
  X,
  RefreshCw,
  Package,
  Shield,
  Zap,
  Activity,
  Cpu
} from 'lucide-react';
import { calculateCreditValue } from '../../engines/tangentEconEngine';
import { AudioService } from '../../services/audioService';

export const LOOT_TIERS = [
  { tier: 1, label: 'Tier 1: Outlaw / Scavenger Cache', baseDC: 8, itemCounts: [2, 3] },
  { tier: 2, label: 'Tier 2: Corporate Security Patrol', baseDC: 12, itemCounts: [3, 4] },
  { tier: 3, label: 'Tier 3: Military Spec-Ops Cache', baseDC: 16, itemCounts: [4, 5] },
  { tier: 4, label: 'Tier 4: Black-Ops Cyber-Vault', baseDC: 20, itemCounts: [4, 6] },
  { tier: 5, label: 'Tier 5: Precursor / Transcendent Artifact', baseDC: 24, itemCounts: [5, 7] }
];

export const ITEM_TEMPLATES = [
  { name: 'Heavy Plasma Charge Cells', type: 'Ammo / Battery', dc: 8, desc: 'Recharges energy weaponry (30 units)' },
  { name: 'Bio-Regenerative Trauma Injector', type: 'Medical', dc: 10, desc: 'Restores 15 Vitality or stabilizes dying operative' },
  { name: 'Vibroblade / Monomolecular Dagger', type: 'Weapon', dc: 12, desc: '1d10+2 Dmg, AP 4, Concealable' },
  { name: 'Hardened Kinetic Armor Vest', type: 'Armor', dc: 14, desc: 'Provides 3 DR to Torso' },
  { name: 'Optical Camouflage Shroud', type: 'Gear', dc: 16, desc: '+3 bonus to Stealth checks for 10 minutes' },
  { name: 'Military Assault Slug-Rifle', type: 'Weapon', dc: 18, desc: '2d10+4 Dmg, AP 3, Burst/Auto capability' },
  { name: 'Subdermal Plating Cyber-Rig', type: 'Augmentation', dc: 20, desc: '+2 natural DR to all hit locations' },
  { name: 'Precursor Zero-Point Battery', type: 'Artifact', dc: 24, desc: 'Endless energy reservoir for starship or mecha' }
];

export default function EconomatrixLootGeneratorModal({
  isOpen,
  onClose,
  onBroadcastToChat
}) {
  if (!isOpen) return null;

  const [selectedTier, setSelectedTier] = useState(2);
  const [techLevel, setTechLevel] = useState(3);
  const [tradeCode, setTradeCode] = useState('industrial');
  const [generatedLoot, setGeneratedLoot] = useState(null);

  const activeTierConfig = LOOT_TIERS.find(t => t.tier === selectedTier) || LOOT_TIERS[1];

  const handleGenerate = () => {
    AudioService.playTerminalBeep(940, 0.08);

    const count = activeTierConfig.itemCounts[0] + Math.floor(Math.random() * (activeTierConfig.itemCounts[1] - activeTierConfig.itemCounts[0] + 1));
    const items = [];
    let totalValue = 0;

    for (let i = 0; i < count; i++) {
      const template = ITEM_TEMPLATES[Math.min(ITEM_TEMPLATES.length - 1, Math.floor(Math.random() * ITEM_TEMPLATES.length))];
      const dc = Math.max(5, template.dc + (techLevel - 3) * 2);
      
      // Calculate TSC value V = 10 * 4^(DC / 5)
      let value = calculateCreditValue ? calculateCreditValue(dc) : Math.round(10 * Math.pow(4, dc / 5));

      // Trade code modifier
      if (tradeCode === 'industrial' && template.type === 'Gear') value = Math.round(value * 0.85);
      if (tradeCode === 'agricultural' && template.type === 'Medical') value = Math.round(value * 0.8);

      totalValue += value;
      items.push({
        id: `loot_${i + 1}`,
        name: template.name,
        type: template.type,
        dc,
        value,
        desc: template.desc
      });
    }

    setGeneratedLoot({
      id: `drop_${Date.now()}`,
      tierLabel: activeTierConfig.label,
      totalCredits: totalValue,
      items
    });
  };

  const handleBroadcast = () => {
    if (!generatedLoot) return;
    AudioService.playCriticalChime(true);

    if (onBroadcastToChat) {
      const listStr = generatedLoot.items.map(it => `- **${it.name}** [${it.type}] · Value: **${it.value.toLocaleString()} TSC** (DC ${it.dc}) — *${it.desc}*`).join('\n');
      onBroadcastToChat(`💰 **[SALVAGE & LOOT DROP: ${generatedLoot.tierLabel.toUpperCase()}]**\n**Total Estimated Value:** ${generatedLoot.totalCredits.toLocaleString()} TSC\n\n${listStr}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] bg-[#0d121c] border-2 border-amber-500/70 rounded-2xl shadow-[0_0_45px_rgba(245,158,11,0.3)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-amber-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-amber-300 flex items-center gap-2">
                Economatrix TSC Loot &amp; Salvage Generator
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  V = 10 · 4^(DC/5) EQUATION
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate encounter loot caches, salvage drops, and corporate payroll crates with accurate market valuation.
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

        {/* Generator Controls */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 grid grid-cols-4 gap-3 shrink-0">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Threat Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(parseInt(e.target.value, 10))}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-200 outline-none"
            >
              {LOOT_TIERS.map(t => (
                <option key={t.tier} value={t.tier}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Tech Level (TL{techLevel})</label>
            <select
              value={techLevel}
              onChange={(e) => setTechLevel(parseInt(e.target.value, 10))}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-200 outline-none"
            >
              <option value="1">TL1 (Industrial / Primitive)</option>
              <option value="2">TL2 (Modern Slug)</option>
              <option value="3">TL3 (Advanced Plasma / Cyber)</option>
              <option value="4">TL4 (Antimatter / Bioware)</option>
              <option value="5">TL5 (Nanotech Singularity)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Planetary Trade Code</label>
            <select
              value={tradeCode}
              onChange={(e) => setTradeCode(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-200 outline-none"
            >
              <option value="industrial">Industrial (-15% Tech)</option>
              <option value="agricultural">Agricultural (-20% Medical)</option>
              <option value="high_tech">High-Tech Nexus</option>
              <option value="barren">Barren Outpost (+20% Scarcity)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" /> Drop Salvage
            </button>
          </div>
        </div>

        {/* Generated Loot Display */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {!generatedLoot ? (
            <div className="p-12 text-center text-slate-500 text-xs font-mono">
              Select encounter threat tier and planetary trade codes, then click "Drop Salvage" to generate randomized equipment caches.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="font-black text-sm text-amber-300 block">{generatedLoot.tierLabel}</span>
                  <span className="text-xs font-mono text-emerald-400">
                    Total Estimated Value: {generatedLoot.totalCredits.toLocaleString()} TSC
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleBroadcast}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Broadcast Drop to CommLink
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedLoot.items.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">{item.name}</span>
                      <span className="text-emerald-300 font-black">{item.value.toLocaleString()} TSC</span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans leading-tight">
                      {item.desc}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[9px] text-slate-500">
                      <span>Category: {item.type}</span>
                      <span>Crafting DC {item.dc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
