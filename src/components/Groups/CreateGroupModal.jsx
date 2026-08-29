import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Shield, 
  Globe, 
  Lock, 
  Sparkles, 
  BookOpen, 
  Radio, 
  UserCheck 
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useStory } from '../../context/CampaignContext';
import { useFolio } from '../../context/FolioContext';
import { AudioService } from '../../services/audioService';

export const CreateGroupModal = ({ isOpen, onClose, onCreated }) => {
  const { createGroup } = useGroup();
  const { storyCatalog, universeState } = useStory();
  const { personaRoster, roster, activePersona } = useFolio();

  const allPersonas = personaRoster || roster || [];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStoryId, setSelectedStoryId] = useState(universeState?.id || '');
  const [maxMembers, setMaxMembers] = useState(6);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedPersonaId, setSelectedPersonaId] = useState(activePersona?.id || (allPersonas[0]?.id || ''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a team or game group name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const selectedStory = (storyCatalog || []).find(s => s.id === selectedStoryId) || universeState;
      const chosenPersona = allPersonas.find(p => (p['character-doc-id'] || p.id) === selectedPersonaId) || null;

      const newGroup = await createGroup({
        name: name.trim(),
        description: description.trim(),
        campaignId: selectedStoryId || null,
        campaignTitle: selectedStory?.projectName || selectedStory?.title || 'Tangent Universe',
        maxMembers: Number(maxMembers) || 6,
        isPublic: isPublic,
        persona: chosenPersona
      });

      AudioService.playTerminalBeep(1500, 0.04);
      if (onCreated) {
        onCreated(newGroup);
      }
      onClose();
    } catch (err) {
      console.error('Failed to establish team group:', err);
      setError(err.message || 'Failed to establish game team.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-[#0f141d] border border-cyan-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                ESTABLISH GAME TEAM
              </h2>
              <span className="text-[11px] font-mono text-cyan-400">
                Form a tactical group with linked Holonet comms and invite codes
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/60 text-red-300">
              {error}
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
              Team / Group Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Vanguard Strike Team"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
              Mission Brief / Group Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational objectives, play style, roleplay focus, or weekly schedule..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Linked Campaign & Max Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Linked Campaign Story
              </label>
              <select
                value={selectedStoryId}
                onChange={(e) => setSelectedStoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Standalone Operation --</option>
                {(storyCatalog || []).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.projectName || s.title || 'Untitled Campaign'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Max Operatives Slot Limit
              </label>
              <select
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="4">4 Operatives (Standard Fireteam)</option>
                <option value="6">6 Operatives (Tactical Team)</option>
                <option value="8">8 Operatives (Platoon Strike)</option>
                <option value="12">12 Operatives (Battalion Raid)</option>
              </select>
            </div>
          </div>

          {/* Initial Persona Selection */}
          {allPersonas.length > 0 && (
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                <span>Your Lead Operative Persona</span>
                <span className="text-[10px] text-cyan-400 font-normal">From Persona Folio</span>
              </label>
              <select
                value={selectedPersonaId}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {allPersonas.map(p => {
                  const id = p['character-doc-id'] || p.id;
                  const charName = p['char-name'] || p.name || 'Unnamed Operative';
                  const species = p['char-species'] || p.species || 'Human';
                  const role = p['char-concept'] || p['char-occu'] || p.occupation || 'Specialist';
                  return (
                    <option key={id} value={id}>
                      {charName} ({species} - {role})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Visibility / Recruitment Status */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
              Recruitment Privacy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setIsPublic(true)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isPublic 
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Globe size={14} />
                  <span>PUBLIC LISTING</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Visible to operators browsing public teams in the Hub.
                </p>
              </div>

              <div
                onClick={() => setIsPublic(false)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  !isPublic 
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Lock size={14} />
                  <span>INVITE ONLY</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Hidden; joinable only by direct invite or shareable code.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 text-white font-mono font-bold rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={15} />
              <span>{submitting ? 'COMMISSIONING TEAM...' : 'INITIALIZE GAME TEAM & COMMS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
