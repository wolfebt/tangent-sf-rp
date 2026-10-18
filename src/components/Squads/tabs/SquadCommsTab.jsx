import React, { useEffect, useState } from 'react';
import { Radio, ExternalLink, BookOpen } from 'lucide-react';
import { useChat } from '../../../context/ChatContext';
import { MessageView } from '../../Chat/MessageView';
import { MessageInput } from '../../Chat/MessageInput';
import { ArchitectDocketBlock } from '../../Chat/ArchitectDocketBlock';
import { AudioService } from '../../../services/audioService';

/**
 * @component SquadCommsTab
 * @description Embedded squad tactical comms feed in the Teams workstation.
 * Powered by full MessageView, MessageInput, and ArchitectDocketBlock components
 * with IC/OOC styling, dice rolling shortcuts, persona identity selection, and audio feedback.
 */
export const SquadCommsTab = ({
  activeGroup,
  navigate,
  onSwitchToComms
}) => {
  const { 
    messages = [], 
    loadingMessages = false, 
    activeChannel, 
    activeChannelId,
    selectChannel
  } = useChat() || {};

  const [showDocket, setShowDocket] = useState(false);

  // Ensure active squad channel is selected for tactical feed
  useEffect(() => {
    if (activeGroup?.channelId && activeChannelId !== activeGroup.channelId && selectChannel) {
      selectChannel(activeGroup.channelId);
    }
  }, [activeGroup?.channelId, activeChannelId, selectChannel]);

  const docketCount = Array.isArray(activeGroup?.architectBlocks) ? activeGroup.architectBlocks.length : 0;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#070b12]">
      {/* Comms Feed Top Sub-Header */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2 text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Radio size={14} className="text-cyan-400 animate-soft-back-glow shrink-0" />
          <span className="font-bold text-cyan-300 uppercase tracking-wider truncate">
            {activeGroup ? `${activeGroup.name} TACTICAL FEED` : 'ENCRYPTED RELAY'}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-[10.5px] text-slate-400 truncate hidden sm:inline">
            FREQ: {activeGroup?.channelId || activeChannel?.name || 'squad_freq'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Tactical Docket Toggle */}
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.02);
              setShowDocket(prev => !prev);
            }}
            className={`px-2.5 py-1 rounded text-[10.5px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showDocket
                ? 'bg-rose-950/80 text-rose-200 border-rose-400/80 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border-rose-500/50'
            }`}
            title="Toggle Squad Tactical Docket (Objectives, Checklists & Handouts)"
          >
            <BookOpen size={12} />
            <span>TACTICAL DOCKET</span>
            {docketCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40 text-[9px] font-bold">
                {docketCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1150, 0.02);
              if (onSwitchToComms) {
                onSwitchToComms();
              } else {
                navigate('/network?view=comms');
              }
            }}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="Open in full HoloNet CommLink matrix"
          >
            <span className="hidden sm:inline">FULL COMMS STATION</span>
            <span className="sm:hidden">MATRIX</span>
            <ExternalLink size={11} />
          </button>
        </div>
      </div>

      {/* Main Message Stream, Rich Composer & Collapsible Tactical Docket */}
      <div className="flex-1 flex h-full min-h-0 overflow-hidden bg-[#090e18] relative">
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <MessageView
            messages={messages}
            loading={loadingMessages}
            activeChannel={activeChannel}
          />
          <MessageInput isCompact={true} />
        </div>

        {showDocket && (
          <ArchitectDocketBlock
            channel={activeChannel}
            group={activeGroup}
            onClose={() => setShowDocket(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SquadCommsTab;
