import React, { useState, useRef, useEffect } from 'react';
import DraggablePanel from '../MapMaker/map/DraggablePanel';
import { streamChatContent } from '../../../services/aimeService';

export default function AIMEChatBox({ onClose, contextData }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsGenerating(true);

    // Placeholder for AIME's response
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      let currentResponse = '';
      await streamChatContent({
        messages: newMessages,
        context: contextData,
        onChunk: (chunk) => {
          currentResponse += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx].role === 'model') {
              updated[lastIdx].content = currentResponse;
            }
            return updated;
          });
        }
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { role: 'model', content: `[Error: ${error.message}]` }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DraggablePanel 
      id="aime-chat-box"
      defaultPosition={{ x: window.innerWidth - 420, y: 80 }}
      className="fixed z-50 flex flex-col bg-[#161b22] border border-cyan-800 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.2)] w-[380px] h-[550px] overflow-hidden"
    >
      {/* Header (Drag Handle) */}
      <div className="drag-handle flex justify-between items-center p-3 bg-[#0d1117] border-b border-cyan-800 cursor-move">
        <h3 className="text-cyan-400 font-bold text-sm flex items-center gap-2">
          <span className="text-amber-400">✨</span> AIME Chat
        </h3>
        <button 
          onClick={onClose} 
          className="text-cyan-600 hover:text-cyan-400 transition-colors p-1"
          title="Close Chat"
        >
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#161b22]/50">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-xs italic mt-4">
            AIME is ready to brainstorm and weave narratives with you...
          </div>
        )}
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
          >
            <span className={`text-[10px] mb-1 font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-amber-500 text-right' : 'text-cyan-500 text-left'}`}>
              {msg.role === 'user' ? 'You' : 'AIME'}
            </span>
            <div 
              className={`text-sm p-3 rounded-lg shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-amber-900/40 border border-amber-700/50 text-amber-50 rounded-tr-none'
                  : 'bg-cyan-950/40 border border-cyan-800/50 text-cyan-50 rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="self-start flex items-center gap-2 text-cyan-500 text-xs mt-1 font-semibold">
             <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
             Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0d1117] border-t border-cyan-800">
        <div className="flex gap-2 relative">
          <textarea 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AIME a question or for ideas..."
            className="flex-1 bg-[#161b22] border border-slate-700 focus:border-cyan-500/60 rounded p-2 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none h-[60px]"
          />
          <button 
            onClick={handleSend}
            disabled={isGenerating || !inputValue.trim()}
            className="bg-cyan-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-4 rounded transition-colors"
          >
            Send
          </button>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 text-center">
          Shift+Enter for new line. AIME will use your current Outline and Beats as context.
        </div>
      </div>
    </DraggablePanel>
  );
}

