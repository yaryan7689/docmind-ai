import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (query: string) => void;
  onCitationClick: (page: number, snippet: string) => void;
  documentTitle: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onCitationClick,
  documentTitle,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'What are the payment terms and fees?',
    'Summarize the SLA uptime commitment',
    'What are the security & data breach notice obligations?',
    'What is the governing law and liability limit?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-900/40">
      {/* Header */}
      <div className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200">Grounded Document Assistant</h3>
            <p className="text-[10px] text-slate-400">
              Querying against <span className="text-indigo-300 font-medium">{documentTitle}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Ask DocuMind AI anything</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Get instant factual answers backed by verifiable page-level citations from this document.
              </p>
            </div>

            {/* Quick Prompt Pills */}
            <div className="w-full max-w-md space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                Suggested Questions
              </p>
              <div className="flex flex-col space-y-1.5">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="text-left text-xs bg-slate-800/60 hover:bg-indigo-950/40 hover:border-indigo-500/40 border border-slate-700/60 p-2.5 rounded-xl text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/70 rounded-bl-none'
                }`}
              >
                {/* Role Header */}
                <div className="flex items-center justify-between space-x-3 mb-2 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    {msg.role === 'user' ? (
                      <>
                        <User className="w-3 h-3 text-indigo-200" />
                        <span className="font-semibold text-indigo-100">You</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span className="font-semibold text-indigo-300">DocuMind AI</span>
                        {msg.mode && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 text-[9px]">
                            {msg.mode}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Message Body */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Grounded Citations Drawer */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      <span>Verified Page Citations</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => onCitationClick(c.page, c.snippet)}
                          className="flex items-center space-x-1 text-[11px] font-medium bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg transition-colors group"
                          title={`Click to view Page ${c.page}: "${c.snippet}"`}
                        >
                          <span>Page {c.page}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isStreaming && (
          <div className="flex items-center space-x-2 text-indigo-400 text-xs py-2 px-1">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>DocuMind is reasoning and citing sources...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder={`Ask a question about ${documentTitle}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/30 active:scale-95"
            title="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
