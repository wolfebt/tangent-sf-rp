/**
 * @file CreateScenarioModal.jsx
 * @description Comprehensive Scenario & Narrative Node Creation Modal for ADE.
 * Provides full authoring options: Title, Node Type (Act, Chapter, Scene, Encounter, etc.),
 * Parent hierarchy nesting, Story Templates (3-Act Arc, Tactical Breach, Investigation, Cyber Intrusion),
 * and direct Tactical Map Pairing (existing or fresh paired grid).
 */

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, 
  Layers, 
  FolderPlus, 
  Map as MapIcon, 
  Sparkles, 
  Swords, 
  Shield, 
  FileText, 
  Compass, 
  X,
  Target,
  Terminal,
  Search
} from 'lucide-react';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { createBlankCanvas, createDerelictStarshipMap, createResearchOutpostMap } from '../../../components/VTT/stage/defaultMaps';

export const SCENARIO_TYPES = [
  { id: 'Act', label: 'Act', icon: Compass, color: 'text-amber-400', desc: 'Major narrative milestone or chapter phase' },
  { id: 'Scene', label: 'Scene', icon: FileText, color: 'text-cyan-400', desc: 'Specific narrative location and moment' },
  { id: 'Encounter', label: 'Tactical Encounter', icon: Swords, color: 'text-rose-400', desc: 'Combat, trap, or high-stakes challenge' },
  { id: 'Story Arc', label: 'Story Arc', icon: Layers, color: 'text-purple-400', desc: 'Overarching campaign plotline' },
  { id: 'Investigation', label: 'Investigation Lead', icon: Search, color: 'text-emerald-400', desc: 'Clue analysis and deduction node' },
  { id: 'Climax', label: 'Climax', icon: Target, color: 'text-orange-400', desc: 'Pivotal final confrontation or escape' }
];

export const SCENARIO_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Slate',
    icon: Plus,
    desc: 'Clean, unformatted scenario with basic tech-level and beats fields.',
    content: ''
  },
  {
    id: 'three_act',
    name: '3-Act Structure',
    icon: Compass,
    desc: 'Inciting Incident, Midpoint Complication, and Climax resolution framework.',
    content: `<h2>ACT I: INCITING INCIDENT</h2><p><strong>The Hook:</strong> Operatives receive encrypted distress coordinates...</p><p><strong>Complication:</strong> Atmospheric interference prevents immediate extraction.</p><h2>ACT II: THE CONFLICT</h2><p><strong>Midpoint:</strong> Security grid lockdown engaged. Tactical choices determine the path forward.</p><p><strong>Discovery:</strong> Recovered telemetry reveals unexpected hostiles.</p><h2>ACT III: CLIMAX & EXFIL</h2><p><strong>Confrontation:</strong> Core objective resolution under severe pressure.</p><p><strong>Extraction:</strong> Evac point reached with retrieved assets.</p>`
  },
  {
    id: 'tactical_breach',
    name: 'Tactical Breach & Clear',
    icon: Swords,
    desc: 'Outer perimeter infiltration, bulkhead breach, core objective, and exfil.',
    content: `<h2>PERIMETER INFILTRATION</h2><p><strong>Approach Vector:</strong> Maintenance conduit bypass or frontal airlock breach.</p><p><strong>Security Patrols:</strong> Automated sentries patrolling sectors A and B.</p><h2>INTERIOR SECUREMENT</h2><p><strong>Bulkhead Breach:</strong> Hardened security door requiring bypass (DC 14 Technical or EMP charge).</p><p><strong>Core Objective:</strong> Terminal access and target extraction.</p><h2>EXTRACTION RUN</h2><p><strong>Alert Level:</strong> High alarm triggers response drones in 3 combat rounds.</p>`
  },
  {
    id: 'investigation',
    name: 'Investigative Mystery',
    icon: Search,
    desc: 'Crime/event hook, 3 key clues/evidence nodes, suspect interrogation, revelation.',
    content: `<h2>THE CRIME SCENE</h2><p><strong>Atmosphere:</strong> Abandoned laboratory with fluctuating emergency lighting.</p><h2>DISCOVERABLE CLUES</h2><ul><li><strong>Clue 1 (Forensic):</strong> Scorched bulkhead showing plasma discharge residue.</li><li><strong>Clue 2 (Data):</strong> Corrupted audio log on secondary terminal.</li><li><strong>Clue 3 (Physical):</strong> Dropped biometric security badge with security clearance level 3.</li></ul><h2>THE CONFRONTATION</h2><p><strong>Interrogation:</strong> Confronting the chief researcher regarding unauthorized experiments.</p>`
  },
  {
    id: 'cyber_intrusion',
    name: 'Cyber Intrusion / Infiltration',
    icon: Terminal,
    desc: 'ICE firewall penetration, subnet navigation, data vault extraction, countermeasure evasion.',
    content: `<h2>SUBNET RECONNAISSANCE</h2><p><strong>Network Architecture:</strong> Tier 3 Corporate Network with encrypted subnet layers.</p><p><strong>Firewall ICE:</strong> Intrusion Countermeasure Electronics monitoring ports.</p><h2>VAULT ACCESS</h2><p><strong>Core System:</strong> Central Data Vault encrypted with AES-4096 quantum keys.</p><p><strong>Payload:</strong> Classified R&D blueprints ready for download.</p><h2>TRACE EVASION</h2><p><strong>Active Trace:</strong> Black ICE program active. Operatives have limited actions before physical location is compromised.</p>`
  }
];

export const CreateScenarioModal = ({
  isOpen,
  onClose,
  defaultParentId = null,
  onScenarioCreated
}) => {
  const { universeState, addStory, availableMaps, addMap, setActiveMapId } = useStory();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Scene');
  const [parentId, setParentId] = useState(defaultParentId || '');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [mapOption, setMapOption] = useState('new_blank'); // 'none' | 'new_blank' | 'new_starship' | 'new_outpost' | 'existing'
  const [selectedExistingMapId, setSelectedExistingMapId] = useState('');
  const [sceneBeats, setSceneBeats] = useState('');

  if (!isOpen) return null;

  // Flatten scenarios tree for parent selector
  const flatScenarioOptions = [];
  const recurse = (nodes, depth = 0) => {
    if (!Array.isArray(nodes)) return;
    nodes.forEach(n => {
      flatScenarioOptions.push({
        id: n.id,
        title: `${'— '.repeat(depth)}${n.title || 'Untitled'} (${n.type || 'Node'})`
      });
      if (n.children && n.children.length > 0) {
        recurse(n.children, depth + 1);
      }
    });
  };
  recurse(universeState?.scenarios || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTitle = title.trim() || `New ${type}`;
    const tpl = SCENARIO_TEMPLATES.find(t => t.id === selectedTemplate) || SCENARIO_TEMPLATES[0];

    // Determine or create linked map
    let finalMapId = null;
    if (mapOption === 'existing' && selectedExistingMapId) {
      finalMapId = selectedExistingMapId;
    } else if (mapOption === 'new_blank') {
      const newMap = createBlankCanvas({ title: `${finalTitle} - Tactical Grid` });
      if (addMap) addMap(newMap);
      finalMapId = newMap.id;
    } else if (mapOption === 'new_starship') {
      const newMap = createDerelictStarshipMap();
      newMap.title = `${finalTitle} - Starship Sector`;
      if (addMap) addMap(newMap);
      finalMapId = newMap.id;
    } else if (mapOption === 'new_outpost') {
      const newMap = createResearchOutpostMap();
      newMap.title = `${finalTitle} - Outpost Sector`;
      if (addMap) addMap(newMap);
      finalMapId = newMap.id;
    }

    const newScenarioNode = {
      id: uuidv4(),
      title: finalTitle,
      type,
      content: tpl.content || '',
      mapId: finalMapId,
      fields: {
        'tech-level': universeState?.techLevel || 3,
        sceneBeats: sceneBeats.trim()
      },
      children: []
    };

    if (addStory) {
      addStory(newScenarioNode, parentId || null);
    }

    if (finalMapId && setActiveMapId) {
      setActiveMapId(finalMapId);
    }

    AudioService.playCriticalChime(true);
    if (onScenarioCreated) {
      onScenarioCreated(newScenarioNode);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto font-mono">
      <div className="bg-[#0b101d] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-sm">
              <FolderPlus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <span>Create Scenario &amp; Narrative Node</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Structure acts, scenes, tactical encounters, and paired battlemaps
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          
          {/* 1. Title Input */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1.5">
              Scenario / Scene Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Act I: Perimeter Breach, Scene 2: Derelict Airlock..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs font-sans transition-colors"
            />
          </div>

          {/* 2. Scenario Type Selector */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1.5">
              Node Type &amp; Narrative Function
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCENARIO_TYPES.map((st) => {
                const Icon = st.icon;
                const isSelected = type === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setType(st.id);
                      AudioService.playTerminalBeep(1100, 0.02);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon size={14} className={st.color} />
                      <span className="font-bold text-xs">{st.label}</span>
                    </div>
                    <span className="text-[9.5px] text-slate-500 leading-tight">
                      {st.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Hierarchy / Parent Selector */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1.5">
              Hierarchy Placement
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="">📂 Top-Level (Root Act / Scenario)</option>
              {flatScenarioOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Story Archetype & Starter Templates */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1.5">
              Manuscript Framework &amp; Starter Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SCENARIO_TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(tpl.id);
                      AudioService.playTerminalBeep(1000, 0.02);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-purple-300 shrink-0 mt-0.5' : 'text-slate-500 shrink-0 mt-0.5'} />
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{tpl.name}</div>
                      <div className="text-[9.5px] text-slate-500 leading-tight mt-0.5">
                        {tpl.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Tactical Sector Map Pairing */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <MapIcon size={12} className="text-amber-400" />
              <span>Tactical Sector Map Integration</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setMapOption('new_blank')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  mapOption === 'new_blank'
                    ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>➕ New Blank Hex Grid</span>
                <span className="text-[9px] text-slate-500 font-normal">Fresh canvas</span>
              </button>

              <button
                type="button"
                onClick={() => setMapOption('new_starship')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  mapOption === 'new_starship'
                    ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🚀 Starship Corridor</span>
                <span className="text-[9px] text-slate-500 font-normal">Pre-built bulkheads</span>
              </button>

              <button
                type="button"
                onClick={() => setMapOption('new_outpost')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  mapOption === 'new_outpost'
                    ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🛡️ Research Outpost</span>
                <span className="text-[9px] text-slate-500 font-normal">Multi-room compound</span>
              </button>

              <button
                type="button"
                onClick={() => setMapOption('existing')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  mapOption === 'existing'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🔗 Link Existing Map</span>
                <span className="text-[9px] text-slate-500 font-normal">Select from library</span>
              </button>

              <button
                type="button"
                onClick={() => setMapOption('none')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  mapOption === 'none'
                    ? 'bg-slate-800 border-slate-600 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <span>🚫 No Map (Pure Prose)</span>
                <span className="text-[9px] text-slate-500 font-normal">Author text only</span>
              </button>
            </div>

            {/* Existing Map Dropdown */}
            {mapOption === 'existing' && (
              <div className="pt-1">
                <select
                  value={selectedExistingMapId}
                  onChange={(e) => setSelectedExistingMapId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/50 rounded-xl text-cyan-200 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="">-- Choose Existing Tactical Map --</option>
                  {(availableMaps || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title || 'Untitled Map'} ({m.tokens?.length || 0} tokens, {m.walls?.length || 0} walls)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 6. Initial Scene Beats */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1.5">
              Scene Beats &amp; Objectives (Optional)
            </label>
            <textarea
              rows={2}
              value={sceneBeats}
              onChange={(e) => setSceneBeats(e.target.value)}
              placeholder="e.g. 1. Breach perimeter airlock; 2. Download security logs; 3. Evac before alarms trigger..."
              className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Scenario</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateScenarioModal;
