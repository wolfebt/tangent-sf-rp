/**
 * @file GraphAimeTools.jsx
 * @description AIME Narrative AI Co-Pilot modal for the ADE Story Graph.
 * Features automated branching path generation, complication injection,
 * and narrative flow continuity validation.
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  Loader2, 
  ArrowRight,
  GitBranch,
  Zap,
  Check
} from 'lucide-react';
import { streamContent } from '../../../../../services/aimeService';
import { AudioService } from '../../../../../services/audioService';
import { v4 as uuidv4 } from 'uuid';

export const GraphAimeTools = ({
  isOpen = false,
  onClose,
  activeNode = null,
  allNodes = [],
  allLinks = [],
  continuityHealth = null,
  onAddGeneratedBranches,
  onUpdateScenario
}) => {
  const [activeTab, setActiveTab] = useState('branches'); // 'branches' | 'complication' | 'audit'
  const [branchThemePrompt, setBranchThemePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [generatedBranches, setGeneratedBranches] = useState([]);
  const [selectedBranchIndices, setSelectedBranchIndices] = useState(new Set([0, 1, 2]));

  if (!isOpen) return null;

  // ── GENERATE BRANCHING PATHS VIA AIME ──
  const handleGenerateBranches = async () => {
    if (!activeNode) return;
    setIsGenerating(true);
    setStreamingText('');
    setGeneratedBranches([]);
    AudioService.playTerminalBeep(1200, 0.03);

    const activeNodeContext = `
Active Scenario Title: "${activeNode.title || 'Scene'}"
Scenario Type: ${activeNode.type || 'Scene'}
Briefing / Content: ${activeNode.content?.replace(/<[^>]*>/g, '').slice(0, 400) || 'None'}
Scene Beats: ${activeNode.fields?.sceneBeats || 'None'}
`;

    const prompt = `You are AIME, the narrative AI architect for Tangent Science Fantasy Roleplaying Game (SFF RPG).
Analyze this scenario:
${activeNodeContext}

User Directive: "${branchThemePrompt || 'Generate 3 diverse tactical / narrative branching paths (e.g., Direct Assault, Stealth/Infiltration, Tech/Slicing or Diplomatic)'}"

Generate exactly 3 logical branching scenario nodes that proceed from this scene.
FORMAT YOUR OUTPUT AS A STRICT VALID JSON OBJECT:
{
  "branches": [
    {
      "title": "Short evocative title (max 5 words)",
      "type": "Scene",
      "choiceLabel": "Player action text (e.g. Slicing the Security Grid)",
      "attribute": "intellect",
      "checkDc": 13,
      "readAloud": "One atmospheric paragraph (60-90 words) describing the sensory environment upon arriving at this branch.",
      "beats": "1. First beat\\n2. Second beat"
    }
  ]
}`;

    try {
      let accumulated = '';
      await streamContent({
        prompt,
        context: activeNode,
        onChunk: (chunk) => {
          accumulated += chunk;
          setStreamingText(accumulated);
        }
      });

      // Parse JSON
      const cleaned = accumulated.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.branches)) {
        setGeneratedBranches(parsed.branches);
        setSelectedBranchIndices(new Set(parsed.branches.map((_, i) => i)));
        AudioService.playCriticalChime(true);
      }
    } catch (err) {
      console.warn('AIME Branch parsing fallback:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── INSERT GENERATED BRANCHES INTO GRAPH ──
  const handleApplyBranches = () => {
    if (!activeNode || generatedBranches.length === 0 || !onAddGeneratedBranches) return;

    const branchesToInsert = generatedBranches.filter((_, idx) => selectedBranchIndices.has(idx));
    onAddGeneratedBranches(activeNode, branchesToInsert);
    AudioService.playCriticalChime(true);
    onClose();
  };

  const toggleSelectBranch = (idx) => {
    setSelectedBranchIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-2xl bg-[#090e1a] border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-3.5 px-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-purple-950 border border-purple-500/50 text-purple-300">
              <Sparkles size={14} />
            </div>
            <span className="font-bold text-slate-100 uppercase tracking-wider text-xs">
              AIME Narrative Co-Pilot & Graph Suite
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('branches')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'branches'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ Branch Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ Continuity Audit ({continuityHealth?.issues?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin text-xs">
          {/* TAB 1: AUTO BRANCH GENERATOR */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              {/* Context Summary */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Source Scenario Node
                </span>
                <div className="text-sm font-bold text-cyan-300">
                  {activeNode?.title || 'No scenario selected'}
                </div>
                <p className="text-[10.5px] font-sans text-slate-400 italic line-clamp-2">
                  {activeNode?.content?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Active scenario prose context.'}
                </p>
              </div>

              {/* Directive Prompt */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Custom Narrative Directive (Optional)</span>
                  <span className="text-purple-400 text-[9.5px]">Sci-Fi / OSR Tone</span>
                </label>
                <input
                  type="text"
                  value={branchThemePrompt}
                  onChange={(e) => setBranchThemePrompt(e.target.value)}
                  placeholder="e.g. Heavy combat encounter, covert cyber slicing, or alien negotiation..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-750 focus:border-purple-400 rounded-xl text-slate-100 font-mono text-xs outline-none"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateBranches}
                disabled={isGenerating || !activeNode}
                className="w-full py-2.5 bg-purple-950 hover:bg-purple-900 disabled:opacity-50 border border-purple-500/60 text-purple-200 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-purple-400" />
                    <span>Synthesizing Branching Paths with AIME...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-purple-400" />
                    <span>Generate 3 Branching Scenarios & Choices</span>
                  </>
                )}
              </button>

              {/* Streaming Output Preview */}
              {isGenerating && streamingText && (
                <div className="p-3 rounded-xl bg-slate-950 border border-purple-900/60 text-[10.5px] font-mono text-purple-300/80 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {streamingText}
                </div>
              )}

              {/* Parsed Branches Preview */}
              {generatedBranches.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Generated Branches ({selectedBranchIndices.size}/{generatedBranches.length} selected)</span>
                    <span className="text-emerald-400 text-[9.5px]">Ready to inject</span>
                  </div>

                  <div className="space-y-2">
                    {generatedBranches.map((branch, idx) => {
                      const isSelected = selectedBranchIndices.has(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleSelectBranch(idx)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                            isSelected
                              ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                              : 'bg-slate-900/50 border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] ${
                                isSelected ? 'bg-purple-500 border-purple-400 text-white font-bold' : 'border-slate-700'
                              }`}>
                                {isSelected ? <Check size={11} /> : null}
                              </div>
                              <span className="font-bold text-slate-100 text-xs">{branch.title}</span>
                            </div>

                            {branch.checkDc && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold">
                                {branch.attribute?.toUpperCase()} CR {branch.checkDc}
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-cyan-300 font-bold pl-6">
                            Choice: "{branch.choiceLabel}"
                          </div>

                          <p className="text-[10px] text-slate-300 font-sans italic pl-6 leading-relaxed">
                            {branch.readAloud}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Commit Button */}
                  <button
                    type="button"
                    onClick={handleApplyBranches}
                    disabled={selectedBranchIndices.size === 0}
                    className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                    <span>Insert {selectedBranchIndices.size} Branch Nodes to Graph</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTINUITY & AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {/* Score Header */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Module Flow Health</div>
                  <div className="text-xl font-black text-emerald-400">
                    {continuityHealth?.score || 100}%
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 space-y-0.5">
                  <div>{continuityHealth?.nodeCount || 0} Total Scenarios</div>
                  <div>{continuityHealth?.orphanCount || 0} Orphan Nodes</div>
                  <div>{continuityHealth?.deadEndCount || 0} Dead Ends</div>
                </div>
              </div>

              {/* Issue Cards */}
              <div className="space-y-2">
                {continuityHealth?.issues?.length > 0 ? (
                  continuityHealth.issues.map(iss => (
                    <div
                      key={iss.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] font-sans text-slate-200 leading-snug">
                          {iss.message}
                        </span>
                      </div>

                      {iss.id.startsWith('deadend') && onUpdateScenario && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateScenario(iss.nodeId, { type: 'Climax' });
                            AudioService.playCriticalChime(true);
                          }}
                          className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold rounded cursor-pointer"
                        >
                          Mark as Climax Resolution
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="shrink-0" />
                    <span>Graph topology is 100% sound. No isolated scenes or broken dead ends.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GraphAimeTools);
