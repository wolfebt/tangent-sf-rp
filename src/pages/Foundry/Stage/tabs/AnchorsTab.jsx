/**
 * @file AnchorsTab.jsx
 * @description Point of Interest & Anchor Editor for the STAGE compiler.
 * Allows defining coordinates, regions, and element links directly in the Stage Manifest.
 * Manifest-only: anchors do not mutate the raw map asset.
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  Sparkles, 
  Check, 
  X,
  Compass,
  Tag
} from 'lucide-react';
import { useStageStore } from '../stageStore';
import { useElementAssets } from '../../assetContracts';
import { AudioService } from '../../../../services/audioService';
import { v4 as uuidv4 } from 'uuid';

export default function AnchorsTab() {
  const { stageManifest, addAnchor, updateAnchor, removeAnchor } = useStageStore();
  const { list: elementsList } = useElementAssets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnchor, setEditingAnchor] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [kind, setKind] = useState('waypoint');
  const [posX, setPosX] = useState(400);
  const [posY, setPosY] = useState(300);
  const [posW, setPosW] = useState(80);
  const [posH, setPosH] = useState(80);
  const [selectedElements, setSelectedElements] = useState([]);
  const [note, setNote] = useState('');

  const anchors = stageManifest.anchors || [];

  const handleOpenCreate = () => {
    setEditingAnchor(null);
    setName(`Sector Anchor #${anchors.length + 1}`);
    setKind('waypoint');
    setPosX(400 + Math.floor(Math.random() * 200 - 100));
    setPosY(300 + Math.floor(Math.random() * 200 - 100));
    setPosW(80);
    setPosH(80);
    setSelectedElements([]);
    setNote('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (anchor) => {
    setEditingAnchor(anchor);
    setName(anchor.name || '');
    setKind(anchor.kind || 'waypoint');
    setPosX(anchor.pos?.x ?? 400);
    setPosY(anchor.pos?.y ?? 300);
    setPosW(anchor.pos?.w ?? 80);
    setPosH(anchor.pos?.h ?? 80);
    setSelectedElements(anchor.elementIds || []);
    setNote(anchor.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      id: editingAnchor ? editingAnchor.id : `anchor-${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      kind,
      pos: {
        x: Number(posX),
        y: Number(posY),
        w: Number(posW),
        h: Number(posH)
      },
      elementIds: selectedElements,
      note: note.trim() || undefined
    };

    if (editingAnchor) {
      updateAnchor(editingAnchor.id, payload);
    } else {
      addAnchor(payload);
    }

    AudioService.playCriticalChime(true);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 h-full w-full bg-[#080d16] flex flex-col overflow-hidden font-mono text-slate-100">
      {/* Header bar */}
      <div className="p-3 px-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <MapPin size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Points of Interest & Element Anchors</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {anchors.length} Anchors
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Link world elements and interactive trigger zones to map coordinates
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
        >
          <Plus size={13} />
          <span>New Anchor</span>
        </button>
      </div>

      {/* Anchors List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {anchors.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-2">
            <MapPin size={28} className="mx-auto text-slate-700" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
              No anchors defined yet.
            </p>
            <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
              Create an anchor to bind points of interest, tokens, or trigger regions to your map coordinates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anchors.map((anchor) => {
              const boundElems = elementsList.filter(e => anchor.elementIds?.includes(e.id));

              return (
                <div
                  key={anchor.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">
                        {anchor.name}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {anchor.kind}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>X: <strong className="text-slate-200">{anchor.pos?.x ?? 0}</strong></span>
                      <span>Y: <strong className="text-slate-200">{anchor.pos?.y ?? 0}</strong></span>
                      {anchor.kind === 'region' && (
                        <span>Area: <strong className="text-slate-200">{anchor.pos?.w}x{anchor.pos?.h}</strong></span>
                      )}
                    </div>

                    {/* Bound Elements Tags */}
                    {boundElems.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {boundElems.map(el => (
                          <span key={el.id} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            {el.title}
                          </span>
                        ))}
                      </div>
                    )}

                    {anchor.note && (
                      <p className="text-[11px] text-slate-400 italic font-sans line-clamp-2">
                        "{anchor.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500">
                      ID: {anchor.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(anchor)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Edit Anchor"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete anchor "${anchor.name}"?`)) {
                            removeAnchor(anchor.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Anchor"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Anchor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100">
            <div className="p-3 px-4 bg-[#070b13] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} />
                <span>{editingAnchor ? 'Edit Anchor' : 'New Anchor'}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Anchor Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Security Sub-Station Bravo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Anchor Kind</label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  >
                    <option value="waypoint">Waypoint (Point)</option>
                    <option value="region">Region / Zone (Box)</option>
                    <option value="object">Interactive Object</option>
                    <option value="spawn">Operative Spawn</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Position (X, Y)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={posX}
                      onChange={(e) => setPosX(e.target.value)}
                      className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      value={posY}
                      onChange={(e) => setPosY(e.target.value)}
                      className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                      placeholder="Y"
                    />
                  </div>
                </div>
              </div>

              {/* Elements Binding */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Bound World Elements</label>
                <select
                  multiple
                  value={selectedElements}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions, o => o.value);
                    setSelectedElements(opts);
                  }}
                  className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                >
                  {elementsList.map(elem => (
                    <option key={elem.id} value={elem.id}>
                      {elem.title} ({elem.type})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-500">Hold Ctrl/Cmd to select multiple elements</p>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Architect Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional explanation or context..."
                  className="w-full h-14 bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>Save Anchor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
