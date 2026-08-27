import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Send,
  Layers,
  ShieldAlert,
  Terminal,
  DoorClosed,
  Flame,
  X,
  Plus
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const FACILITY_THEMES = [
  {
    id: 'derelict_ship',
    name: 'Derelict Starship Hulk',
    desc: 'Zero-g breached hull, flickering emergency lighting, exposed conduit hazards, and sealed bulkheads.',
    rooms: ['Command Bridge', 'Sub-Light Engine Room', 'Main Cargo Hold', 'Crew Bunks', 'Airlock Alpha', 'Life Support Node']
  },
  {
    id: 'cyber_bunker',
    name: 'Subterranean Cyber-Vault',
    desc: 'Reinforced durasteel bunker with active security turrets, optical mainframe, and encrypted blast doors.',
    rooms: ['Mainframe Core', 'Cybernetic Cleanroom', 'Armory Vault', 'Security Guardpost', 'Power Generator', 'Coolant Tunnel']
  },
  {
    id: 'bio_research',
    name: 'Megacorp Bio-Lab Outpost',
    desc: 'Quarantine airlocks, specimen stasis pods, broken test tubes, and biohazard contamination fields.',
    rooms: ['Specimen Containment', 'Decontamination Airlock', 'Genetics Lab', 'Incubator Wing', 'Director Office', 'Waste Chute']
  },
  {
    id: 'neon_bazaar',
    name: 'Underworld Black-Market Bazaar',
    desc: 'Dense neon corridors, smuggler hideouts, illicit arms tables, and hidden escape alleys.',
    rooms: ['Cantina Floor', 'Smuggler Hideout', 'Arms Dealer Stall', 'Data-Broker Backroom', 'Maintenance Duct', 'Rooftop Dropzone']
  }
];

export default function UduFacilityGeneratorModal({
  isOpen,
  onClose,
  onExportToCanvas,
  onBroadcastToChat
}) {
  if (!isOpen) return null;

  const [selectedThemeId, setSelectedThemeId] = useState('derelict_ship');
  const [roomCount, setRoomCount] = useState(5);
  const [hazardDensity, setHazardDensity] = useState('Medium');
  const [generatedFacility, setGeneratedFacility] = useState(null);

  const activeTheme = FACILITY_THEMES.find(t => t.id === selectedThemeId) || FACILITY_THEMES[0];

  const handleGenerate = () => {
    AudioService.playTerminalBeep(920, 0.08);

    const availableRooms = [...activeTheme.rooms];
    const generatedRooms = [];

    for (let i = 0; i < roomCount; i++) {
      const roomName = availableRooms[i % availableRooms.length];
      const hasTerminal = Math.random() > 0.4;
      const hasHazard = Math.random() > (hazardDensity === 'High' ? 0.3 : hazardDensity === 'Medium' ? 0.6 : 0.8);
      const hasLoot = Math.random() > 0.5;

      generatedRooms.push({
        id: `room_${i + 1}`,
        name: `Sector ${String.fromCharCode(65 + i)}: ${roomName}`,
        doors: Math.floor(Math.random() * 2) + 1,
        hasTerminal,
        hasHazard,
        hazardType: hasHazard ? (Math.random() > 0.5 ? 'Electrified Plasma Conduit (2d8 Dmg)' : 'Toxic Gas Leak (DC 14 Fort)') : null,
        hasLoot,
        lootType: hasLoot ? 'Military Supply Crate (Tier 2 Salvage)' : null
      });
    }

    setGeneratedFacility({
      id: `fac_${Date.now()}`,
      themeName: activeTheme.name,
      rooms: generatedRooms
    });
  };

  const handleCommitToMap = () => {
    if (!generatedFacility) return;
    AudioService.playCriticalChime(true);

    if (onExportToCanvas) {
      onExportToCanvas(generatedFacility);
    }

    if (onBroadcastToChat) {
      const roomListStr = generatedFacility.rooms.map(r => `- **${r.name}** (${r.doors} Bulkheads, ${r.hasTerminal ? '💻 Terminal, ' : ''}${r.hasHazard ? '⚠️ ' + r.hazardType : 'Safe'})`).join('\n');
      onBroadcastToChat(`🏗️ **[UDU FACILITY GENERATED: ${generatedFacility.themeName.toUpperCase()}]**\n${roomListStr}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c121b] border-2 border-amber-500/70 rounded-2xl shadow-[0_0_45px_rgba(245,158,11,0.3)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-amber-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-amber-300 flex items-center gap-2">
                1-Click UDU Facility &amp; Dungeon Generator
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PROCEDURAL ARCHITECTURE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate complex sci-fi facilities with interactive bulkheads, terminals, hazards, and loot caches.
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
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 grid grid-cols-3 gap-4 shrink-0">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Facility Theme</label>
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-200 outline-none"
            >
              {FACILITY_THEMES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Room Count ({roomCount})</label>
            <input
              type="range"
              min="3"
              max="8"
              value={roomCount}
              onChange={(e) => setRoomCount(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer mt-1"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" /> Forge Floorplan
            </button>
          </div>
        </div>

        {/* Generated Facility Display */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {!generatedFacility ? (
            <div className="p-12 text-center text-slate-500 text-xs font-mono">
              Select a facility archetype and click "Forge Floorplan" to generate procedural rooms, bulkheads, hazards, and terminals.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-sm text-amber-300">
                  {generatedFacility.themeName} ({generatedFacility.rooms.length} Sectors Generated)
                </span>
                <button
                  type="button"
                  onClick={handleCommitToMap}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Commit to Map &amp; CommLink
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedFacility.rooms.map(room => (
                  <div
                    key={room.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200">{room.name}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <DoorClosed className="w-3 h-3 text-cyan-400" /> {room.doors} Doors
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-sans">
                      {room.hasTerminal && (
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                          <Terminal className="w-3 h-3" /> Security Terminal
                        </span>
                      )}
                      {room.hasHazard && (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> {room.hazardType}
                        </span>
                      )}
                      {room.hasLoot && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {room.lootType}
                        </span>
                      )}
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
