import React, { useState } from 'react';
import { 
  Hash, 
  MessageSquare, 
  Users, 
  Plus, 
  Globe, 
  Lock, 
  Search, 
  Trash2, 
  Sparkles, 
  Radio,
  UserPlus,
  Shield,
  Settings,
  Edit3
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ChannelSettingsModal } from './ChannelSettingsModal';

export const ChannelSidebar = ({ onOpenCreateModal, onOpenSquadModal, isCompact = false }) => {
  const { 
    publicChannels, 
    directChannels, 
    groupChannels, 
    customChannels, 
    activeChannelId, 
    selectChannel, 
    unreadCounts,
    deleteChannel
  } = useChat();
  const { currentUser, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'public' | 'direct' | 'group' | 'custom'
  const [settingsChannel, setSettingsChannel] = useState(null);

  const filterChannels = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.displayName && c.displayName.toLowerCase().includes(q)) ||
      (c.topic && c.topic.toLowerCase().includes(q))
    );
  };

  const renderChannelItem = (channel) => {
    const isActive = activeChannelId === channel.id;
    const unread = unreadCounts[channel.id] || 0;
    const isDM = channel.type === 'direct' || channel.id.startsWith('dm_');
    const isGroup = channel.type === 'group' || !!channel.groupId;
    const canDelete = !channel.id.startsWith('public_') && (channel.createdById === currentUser?.uid || isAdmin);

    return (
      <div
        key={channel.id}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
          isActive 
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-semibold' 
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 border border-transparent'
        }`}
        onClick={() => selectChannel(channel.id)}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Channel Icon */}
          <div className="shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors">
            {isDM ? (
              <UserPlus size={14} className="text-emerald-400" />
            ) : isGroup ? (
              <Shield size={14} className="text-emerald-400" />
            ) : (
              <Hash size={14} className="text-cyan-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs truncate font-mono">
                {channel.displayName || `#${channel.name}`}
              </span>
              {isGroup && (
                <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8.5px] rounded font-mono font-bold">
                  SQUAD
                </span>
              )}
            </div>
            {channel.lastMessage?.text && (
              <p className="text-[10px] text-slate-500 truncate mt-0.5 max-w-[170px]">
                {channel.lastMessage.text}
              </p>
            )}
          </div>
        </div>

        {/* Right side: unread badge, settings gear, or delete option */}
        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {unread > 0 && (
            <span className="px-1.5 py-0.2 bg-cyan-500 text-black text-[10px] font-mono font-bold rounded-full animate-pulse">
              {unread}
            </span>
          )}

          {/* Quick Settings & Rename Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              AudioService.playTerminalBeep(1100, 0.02);
              setSettingsChannel(channel);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-all"
            title="Frequency Settings & Rename"
          >
            <Settings size={12} />
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete channel "${channel.displayName || channel.name}"?`)) {
                  deleteChannel(channel.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
              title="Delete Channel"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f17]/95 border-r border-slate-800 text-slate-200 select-none">
      {/* Top Header & Search */}
      <div className="p-3 border-b border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="text-cyan-400 animate-pulse" size={16} />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              COMMLINK RELAY
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-[11px] font-mono font-bold transition-all shadow-[0_0_10px_rgba(34,211,238,0.15)]"
            title="Create Channel or Direct Message"
          >
            <Plus size={13} />
            <span>NEW</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frequencies..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-800/80 text-[10px] font-mono">
          {[
            { id: 'all', label: 'ALL' },
            { id: 'public', label: 'PUBLIC' },
            { id: 'squad', label: 'SQUADS' },
            { id: 'direct', label: 'DMs' },
            { id: 'custom', label: 'CUSTOM' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1 rounded transition-colors ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Channel Lists */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
        {/* 1. Game Squad Channels */}
        {(activeTab === 'all' || activeTab === 'squad') && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Shield size={11} className="text-emerald-400" />
                GAME SQUADS &amp; PARTIES
              </span>
              <div className="flex items-center gap-1">
                {onOpenSquadModal && (
                  <button
                    type="button"
                    onClick={onOpenSquadModal}
                    className="text-[9px] text-emerald-300 hover:text-white bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-700/60 font-bold hover:bg-emerald-900 transition-colors"
                    title="Open Squad / Party Builder"
                  >
                    👥 Squad Hub
                  </button>
                )}
                <span className="text-slate-600">{groupChannels.length}</span>
              </div>
            </div>
            {groupChannels.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-slate-500 font-mono italic flex items-center justify-between">
                <span>No active squad channels.</span>
                {onOpenSquadModal && (
                  <button
                    type="button"
                    onClick={onOpenSquadModal}
                    className="text-emerald-400 underline font-bold"
                  >
                    Build Squad →
                  </button>
                )}
              </div>
            ) : (
              filterChannels(groupChannels).map(renderChannelItem)
            )}
          </div>
        )}

        {/* 2. Public Holonet Channels */}
        {(activeTab === 'all' || activeTab === 'public') && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Globe size={11} className="text-cyan-400" />
                HOLONET FREQUENCIES
              </span>
              <span className="text-slate-600">{publicChannels.length}</span>
            </div>
            {filterChannels(publicChannels).map(renderChannelItem)}
          </div>
        )}

        {/* 3. Direct Messages */}
        {(activeTab === 'all' || activeTab === 'direct') && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MessageSquare size={11} className="text-emerald-400" />
                DIRECT COMMS (1-ON-1)
              </span>
              <span className="text-slate-600">{directChannels.length}</span>
            </div>
            {directChannels.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-slate-500 font-mono italic">
                No active direct comms. Click NEW to message an operator.
              </div>
            ) : (
              filterChannels(directChannels).map(renderChannelItem)
            )}
          </div>
        )}

        {/* 4. Custom Channels */}
        {(activeTab === 'all' || activeTab === 'custom') && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Users size={11} className="text-purple-400" />
                CUSTOM FREQUENCIES
              </span>
              <span className="text-slate-600">{customChannels.length}</span>
            </div>
            {customChannels.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-slate-500 font-mono italic">
                No custom channels created yet.
              </div>
            ) : (
              filterChannels(customChannels).map(renderChannelItem)
            )}
          </div>
        )}
      </div>

      {/* Bottom Status bar */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>RELAY SYNCED</span>
        </div>
        <span className="text-cyan-400/90 font-bold">128-BIT QUANTUM</span>
      </div>

      {/* Channel Settings & Rename Modal */}
      {settingsChannel && (
        <ChannelSettingsModal
          isOpen={!!settingsChannel}
          onClose={() => setSettingsChannel(null)}
          channel={settingsChannel}
        />
      )}
    </div>
  );
};

export default ChannelSidebar;
