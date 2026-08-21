import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../../../context/CampaignContext';
import { AudioService } from '../../../services/audioService';
import { BookOpen, X, Plus, Search, Layers, Map, Trash2, ChevronRight } from 'lucide-react';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

export const ScenariosDrawer = ({ onClose }) => {
  const navigate = useNavigate();
  const {
    universeState,
    storyCatalog,
    openStory,
    createNewStory,
    deleteStoryProject,
    loadPublicStories,
    publicStoryCatalog
  } = useStory();

  const [storySearch, setStorySearch] = useState('');
  const [storySourceTab, setStorySourceTab] = useState('my_stories');
  const [isFetchingPublic, setIsFetchingPublic] = useState(false);

  const activeStories = storySourceTab === 'my_stories' ? (storyCatalog || []) : (publicStoryCatalog || []);
  const filteredStories = activeStories.filter(s => {
    if (!storySearch.trim()) return true;
    const q = storySearch.toLowerCase();
    return (s.projectName || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-400 font-bold uppercase">
              STORY FOUNDRY
            </span>
            <span className="text-slate-600 font-mono">•</span>
            <span className="text-slate-400 font-mono text-xs">SCENARIOS & CAMPAIGNS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Story Scenarios Catalog
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.03);
              createNewStory();
              navigate('/foundry/story');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> New Campaign
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setStorySourceTab('my_stories');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
              storySourceTab === 'my_stories'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <BookOpen size={13} /> My Projects ({storyCatalog?.length || 0})
          </button>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setStorySourceTab('public_community');
              if (loadPublicStories) {
                setIsFetchingPublic(true);
                loadPublicStories().finally(() => setIsFetchingPublic(false));
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
              storySourceTab === 'public_community'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>🌐</span> Public Community ({publicStoryCatalog?.length || 0})
          </button>
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search scenarios..."
            value={storySearch}
            onChange={(e) => setStorySearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>
      </div>

      {/* Stories List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[calc(100vh-340px)]">
        {isFetchingPublic ? (
          <div className="p-10 text-center border border-dashed border-amber-500/30 rounded-xl bg-slate-950/40">
            <span className="text-2xl block mb-2 animate-bounce">🌐</span>
            <h4 className="text-sm font-mono font-bold text-amber-300 uppercase animate-pulse">
              Connecting to Community Network...
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Fetching shared campaigns from public database.
            </p>
          </div>
        ) : filteredStories.length === 0 ? (
          storySourceTab === 'public_community' ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <span className="text-3xl block mb-2">🌐</span>
              <h4 className="text-sm font-mono font-bold text-slate-300 uppercase">No Public Community Scenarios Found</h4>
              <p className="text-xs text-slate-500 font-mono mt-1 mb-3 max-w-sm mx-auto">
                {storySearch
                  ? `No public community scenarios match "${storySearch}".`
                  : 'No story campaigns have been published publicly to the community yet.'}
              </p>
              {!storySearch && (
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg max-w-sm mx-auto text-left">
                  <p className="text-[11px] text-slate-400 font-mono">
                    💡 <strong className="text-purple-300">How to share:</strong> Open a scenario campaign in the Story Module and mark it as <span className="text-amber-300 font-bold">Public</span> to share nodes and tactical maps with other players.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <BookOpen size={28} className="mx-auto text-slate-600 mb-2" />
              <h4 className="text-sm font-mono font-bold text-slate-300 uppercase">No Scenarios Found</h4>
              <p className="text-xs text-slate-500 font-mono mt-1 mb-4">
                {storySearch ? `No scenario projects match "${storySearch}".` : 'Start writing scenario outlines and tactical branches.'}
              </p>
              <button
                onClick={() => {
                  createNewStory();
                  navigate('/foundry/story');
                }}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase rounded-lg shadow inline-flex items-center gap-1.5"
              >
                <Plus size={13} /> Create Scenario
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStories.map(story => {
              const isCurrent = story.id === universeState?.id;
              const scenarioCount = story.scenarios?.length || 0;
              const mapCount = story.maps?.length || 0;

              return (
                <div
                  key={story.id}
                  onClick={() => {
                    AudioService.playTerminalBeep(1200, 0.03);
                    openStory(story.id);
                    navigate(`/foundry/story?storyId=${story.id}`);
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-slate-950/80 border-slate-800/90 hover:border-purple-500/60 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-bold text-white font-mono uppercase truncate">
                        {story.projectName || 'Untitled Story'}
                      </h4>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-400/50 rounded text-[9px] font-mono font-bold uppercase">
                          LOADED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                      {story.description || 'Campaign universe outline and tactical story branches.'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Layers size={12} /> {scenarioCount} {scenarioCount === 1 ? 'Node' : 'Nodes'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-purple-300">
                        <Map size={12} /> {mapCount} {mapCount === 1 ? 'Map' : 'Maps'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetName = story.projectName || 'Untitled Story Project';
                        if (confirmTypedDeletion(targetName, 'story project')) {
                          deleteStoryProject(story.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Story Project"
                    >
                      <Trash2 size={13} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        AudioService.playTerminalBeep(1200, 0.03);
                        openStory(story.id);
                        navigate(`/foundry/story?storyId=${story.id}`);
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-colors flex items-center gap-1"
                    >
                      <span>Open Story Module</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenariosDrawer;
