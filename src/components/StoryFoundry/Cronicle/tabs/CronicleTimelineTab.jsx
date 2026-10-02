import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function CronicleTimelineTab({
  timeline,
  newTimelineTitle,
  setNewTimelineTitle,
  newTimelineSummary,
  setNewTimelineSummary,
  newTimelineEntities,
  setNewTimelineEntities,
  handleAddTimelineEvent,
  handleDeleteTimelineEvent
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Add Milestone Form */}
      <form onSubmit={handleAddTimelineEvent} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
          <Plus size={14} /> Log New Milestone / Scene Outcome
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={newTimelineTitle}
            onChange={(e) => setNewTimelineTitle(e.target.value)}
            placeholder="Milestone Title (e.g. The Breach of Copia Alpha)..."
            className="bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-indigo-400"
          />
          <input
            type="text"
            value={newTimelineEntities}
            onChange={(e) => setNewTimelineEntities(e.target.value)}
            placeholder="Entities Involved (comma-separated, e.g. Elara, Vance)..."
            className="bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-indigo-400"
          />
        </div>
        <textarea
          value={newTimelineSummary}
          onChange={(e) => setNewTimelineSummary(e.target.value)}
          placeholder="Summary of dramatic consequences, critical decisions, or tactical shifts..."
          className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-indigo-400 min-h-[60px]"
        />
        <button
          type="submit"
          className="self-end px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={13} />
          <span>Log Milestone</span>
        </button>
      </form>

      {/* Timeline Sequence */}
      <div className="flex flex-col gap-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {timeline.map((evt, idx) => (
          <div key={evt.id} className="relative pl-10">
            <div className="absolute left-2.5 top-3 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-[#0b0f19] shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3.5 flex flex-col gap-1.5 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/40 rounded font-bold">
                    Act #{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{evt.sceneTitle}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(evt.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTimelineEvent(evt.id)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  title="Delete Milestone"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {evt.summary}
              </p>

              {evt.involved_entities && evt.involved_entities.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-mono">Involved:</span>
                  {evt.involved_entities.map(ent => (
                    <span key={ent} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-cyan-400 rounded">
                      {ent}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {timeline.length === 0 && (
          <div className="text-center py-10 text-slate-500 italic">
            No timeline milestones logged yet. As scenes complete, AIME will automatically record causal milestones here.
          </div>
        )}
      </div>
    </div>
  );
}
