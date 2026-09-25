import React from 'react';
import { Radio, ExternalLink, Send } from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import ChatParser from '../../UI/ChatParser';

export const SquadCommsTab = ({
  activeGroup,
  navigate,
  messages = [],
  currentUser,
  handleSendChatMessage,
  speakingMode,
  setSpeakingMode,
  chatInput,
  setChatInput
}) => {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#070b12]">
      {/* Comms Feed Top Sub-Header */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <span className="font-bold text-cyan-300 uppercase tracking-wider">
            {activeGroup ? `${activeGroup.name} TACTICAL FEED` : 'ENCRYPTED RELAY'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[10.5px] text-slate-400">
            FREQ: {activeGroup?.channelId || 'tangent_freq_default'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            AudioService.playTerminalBeep(1150, 0.02);
            navigate('/comms');
          }}
          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
          title="Open in full HoloNet CommLink matrix"
        >
          <span>FULL COMMS STATION</span>
          <ExternalLink size={11} />
        </button>
      </div>

      {/* Chat Transmissions History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`p-3 rounded-xl border max-w-2xl font-mono text-xs ${
                msg.senderId === currentUser?.uid
                  ? 'ml-auto bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
                  : 'bg-slate-900/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 pb-1 mb-1 border-b border-slate-800/60">
                <span className="font-bold text-cyan-300">
                  {msg.senderName || msg.senderHandle || 'Operative'}
                </span>
                <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</span>
              </div>
              <ChatParser content={msg.content} />
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-slate-500 font-mono text-xs">
            <Radio size={28} className="text-slate-600" />
            <span>ENCRYPTED SQUAD FREQUENCY IS SILENT</span>
            <span className="text-[10.5px] text-slate-600">Send a tactical order or broadcast to initialize transmission logs.</span>
          </div>
        )}
      </div>

      {/* Chat Message Input Composer */}
      <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSpeakingMode(prev => prev === 'OOC' ? 'IC' : prev === 'IC' ? 'GM' : 'OOC')}
          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[10.5px] font-mono font-bold text-cyan-300 shrink-0 cursor-pointer"
          title="Toggle Speaking Mode (IC / OOC / GM)"
        >
          {speakingMode}
        </button>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={`Broadcast to ${activeGroup?.name || 'squad'}...`}
          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all shrink-0 cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
