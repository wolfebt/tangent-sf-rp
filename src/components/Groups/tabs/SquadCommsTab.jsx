import React from 'react';
import { Radio, ExternalLink } from 'lucide-react';
import { useChat } from '../../../context/ChatContext';
import { MessageView } from '../../Chat/MessageView';
import { MessageInput } from '../../Chat/MessageInput';
import { AudioService } from '../../../services/audioService';

/**
 * @component SquadCommsTab
 * @description Embedded squad tactical comms feed in the Teams workstation.
 * Powered by full MessageView and MessageInput components with IC/OOC styling,
 * dice rolling shortcuts, persona identity selection, and audio synthesis feedback.
 */
export const SquadCommsTab = ({
  activeGroup,
  navigate
}) => {
  const { 
    messages = [], 
    loadingMessages = false, 
    activeChannel 
  } = useChat() || {};

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#070b12]">
      {/* Comms Feed Top Sub-Header */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Radio size={14} className="text-cyan-400 animate-pulse shrink-0" />
          <span className="font-bold text-cyan-300 uppercase tracking-wider truncate">
            {activeGroup ? `${activeGroup.name} TACTICAL FEED` : 'ENCRYPTED RELAY'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[10.5px] text-slate-400 truncate">
            FREQ: {activeGroup?.channelId || activeChannel?.name || 'squad_freq'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1150, 0.02);
            navigate('/comms');
          }}
          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          title="Open in full HoloNet CommLink matrix (/comms)"
        >
          <span>FULL COMMS STATION</span>
          <ExternalLink size={11} />
        </button>
      </div>

      {/* Main Message Stream & Rich Composer */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#090e18]">
        <MessageView
          messages={messages}
          loading={loadingMessages}
          activeChannel={activeChannel}
        />
        <MessageInput isCompact={true} />
      </div>
    </div>
  );
};

export default SquadCommsTab;
