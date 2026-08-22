import React, { useState, useEffect } from 'react';
import { 
  X, 
  Hash, 
  MessageSquare, 
  Users, 
  Lock, 
  Globe, 
  UserPlus, 
  Search, 
  Check, 
  Sparkles,
  Radio
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';

export const CreateChannelModal = ({ isOpen, onClose }) => {
  const { 
    createNewChannel, 
    startDirectMessage, 
    userDirectory, 
    refreshUserDirectory 
  } = useChat();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('channel'); // 'channel' | 'direct' | 'group'
  const [channelName, setChannelName] = useState('');
  const [channelTopic, setChannelTopic] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      refreshUserDirectory();
      setError(null);
      setChannelName('');
      setChannelTopic('');
      setSelectedUserIds([]);
    }
  }, [isOpen, refreshUserDirectory]);

  if (!isOpen) return null;

  const filteredUsers = userDirectory.filter(u => {
    const q = userSearchQuery.toLowerCase();
    const handle = (u.userHandle || u.displayName || u.email || '').toLowerCase();
    return handle.includes(q);
  });

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!channelName.trim()) {
      setError('Please provide a channel name.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      AudioService.playTerminalBeep(1400, 0.04);
      await createNewChannel({
        name: channelName.trim(),
        topic: channelTopic.trim(),
        isPublic: isPublic,
        type: activeTab === 'group' ? 'group' : 'custom',
        members: selectedUserIds
      });
      onClose();
    } catch (err) {
      console.error('Channel creation failed:', err);
      setError(err.message || 'Failed to create channel.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartDM = async (targetUser) => {
    setSubmitting(true);
    setError(null);
    try {
      AudioService.playTerminalBeep(1400, 0.04);
      await startDirectMessage(targetUser);
      onClose();
    } catch (err) {
      console.error('Starting DM failed:', err);
      setError(err.message || 'Failed to start direct message.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserSelection = (uid) => {
    setSelectedUserIds(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-[#0f141d] border border-cyan-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Radio className="text-cyan-400 animate-pulse" size={18} />
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                OPEN COMMLINK FREQUENCY
              </h2>
              <span className="text-[11px] font-mono text-cyan-400">Initialize Direct or Custom Relays</span>
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

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/80 p-2 gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('channel')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
              activeTab === 'channel'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash size={14} />
            <span>CUSTOM CHANNEL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
              activeTab === 'direct'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={14} />
            <span>DIRECT MESSAGE (1-ON-1)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
              activeTab === 'group'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={14} />
            <span>SQUAD GROUP</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/60 text-xs font-mono text-red-300">
              {error}
            </div>
          )}

          {/* TAB 1 & 3: Custom Channel or Squad Group Creation */}
          {(activeTab === 'channel' || activeTab === 'group') && (
            <form onSubmit={handleCreateChannel} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                  {activeTab === 'group' ? 'Squad Channel Name' : 'Channel Name'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">#</span>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="e.g. vanguard-squad-alpha"
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                  Frequency Topic / Purpose
                </label>
                <input
                  type="text"
                  value={channelTopic}
                  onChange={(e) => setChannelTopic(e.target.value)}
                  placeholder="e.g. Mission planning for Sector 7 excursion"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
                  Signal Security
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setIsPublic(true)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isPublic 
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Globe size={14} />
                      <span>PUBLIC FREQUENCY</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Visible on the Holonet to all operators.
                    </p>
                  </div>

                  <div
                    onClick={() => setIsPublic(false)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      !isPublic 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Lock size={14} />
                      <span>ENCRYPTED / INVITE</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Only invited squad members can tune in.
                    </p>
                  </div>
                </div>
              </div>

              {/* Member Selection for Squad / Private Channels */}
              {(!isPublic || activeTab === 'group') && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-slate-300 font-bold uppercase tracking-wider">
                    Invite Squad Operators ({selectedUserIds.length} Selected)
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    {userDirectory.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic p-1">No other registered operators discovered yet.</p>
                    ) : (
                      userDirectory.map(u => {
                        const isSelected = selectedUserIds.includes(u.uid);
                        const handle = u.userHandle || u.displayName || u.email || 'Operator';
                        return (
                          <div
                            key={u.uid}
                            onClick={() => toggleUserSelection(u.uid)}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-900 text-slate-300'
                            }`}
                          >
                            <span className="truncate">@{handle}</span>
                            {isSelected && <Check size={14} className="text-cyan-400" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting || !channelName.trim()}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono font-bold rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={15} />
                  <span>{submitting ? 'INITIALIZING FREQUENCY...' : 'ESTABLISH RELAY CHANNEL'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Direct Message User Directory */}
          {activeTab === 'direct' && (
            <div className="space-y-3 text-xs font-mono">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search registered operators by handle..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-1">
                    <Users size={24} className="mx-auto text-slate-600" />
                    <p>No matching operators found.</p>
                    <p className="text-[10px] text-slate-600">Operators will appear here once logged into the network.</p>
                  </div>
                ) : (
                  filteredUsers.map(targetUser => {
                    const handle = targetUser.userHandle || targetUser.displayName || targetUser.email || 'Operator';
                    return (
                      <div
                        key={targetUser.uid}
                        onClick={() => handleStartDM(targetUser)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
                            @
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 group-hover:text-emerald-300">
                              @{handle}
                            </span>
                            {targetUser.role && (
                              <span className="text-[10px] text-slate-500 block">
                                {targetUser.role}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1 bg-emerald-600/30 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-black rounded text-[11px] font-bold transition-all"
                        >
                          CONNECT
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
