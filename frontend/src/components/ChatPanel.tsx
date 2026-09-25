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
  Loader2,
  ShieldCheck
} from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (query: string) => void;
  onCitationClick: (page: number, snippet: string) => void;
  documentTitle: string;
}

/**
 * Rich formatted message renderer with interactive in-text citations.
 * Formats headers, bullet lists, bold figures, and turns [Page X] into clickable pills.
 */
const FormattedMessage: React.FC<{
  content: string;
  onCitationClick: (page: number, snippet: string) => void;
}> = ({ content, onCitationClick }) => {
  const lines = content.split('\n');

  const renderInlineFormatted = (text: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\[Page\s+(\d+)\]|\(Page\s+(\d+)\)|\*\*(.*?)\*\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[2] || match[3]) {
        const pageNum = parseInt(match[2] || match[3], 10);
        parts.push(
          <button
            key={match.index}
            onClick={(e) => {
              e.stopPropagation();
              onCitationClick(pageNum, text);
            }}
            className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 mx-1 rounded text-[11px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 hover:border-indigo-400 transition-all cursor-pointer align-baseline shadow-sm"
            title={`Jump directly to Page ${pageNum} in the viewer`}
          >
            <span>P{pageNum}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </button>
        );
      } else if (match[4]) {
        parts.push(
          <strong key={match.index} className="font-semibold text-slate-100">
            {match[4]}
          </strong>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-0.5" />;
        }

        // Section Headers
        if (trimmed.startsWith('### ')) {
          return (
            <div key={idx} className="text-sm font-bold text-indigo-300 pt-1 pb-0.5 border-b border-indigo-500/20 flex items-center space-x-1.5">
              <span>{trimmed.replace(/^###\s+/, '')}</span>
            </div>
          );
        }

        // Bullet point items
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s+/, '');
          return (
            <div key={idx} className="flex items-start space-x-2 pl-0.5 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5 shadow-sm shadow-indigo-400/50" />
              <div className="flex-1 leading-relaxed">
                {renderInlineFormatted(bulletText)}
              </div>
            </div>
          );
        }

        // Italic footer notes
        if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
          return (
            <div key={idx} className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-700/40">
              {renderInlineFormatted(trimmed.slice(1, -1))}
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineFormatted(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

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
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <span>DocuMind Executive Assistant</span>
              <span className="flex items-center text-[10px] text-emerald-400 font-normal">
                <ShieldCheck className="w-3 h-3 mr-0.5" />
                Verified
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 truncate max-w-[280px]">
              Querying against <span className="text-indigo-300 font-medium">{documentTitle}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Ask DocuMind AI anything</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Get clear, executive-grade answers backed by verifiable page-level citations from this document.
              </p>
            </div>

            {/* Quick Prompt Pills */}
            <div className="w-full max-w-md space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                Suggested Executive Questions
              </p>
              <div className="flex flex-col space-y-1.5">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="text-left text-xs bg-slate-800/60 hover:bg-indigo-950/40 hover:border-indigo-500/40 border border-slate-700/60 p-2.5 rounded-xl text-slate-300 transition-all flex items-center justify-between group cursor-pointer"
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
                className={`max-w-[92%] rounded-2xl p-4 shadow-md transition-all ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/70 rounded-bl-none'
                }`}
              >
                {/* Role Header */}
                <div className="flex items-center justify-between space-x-3 mb-2.5 text-[10px] text-slate-400">
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
                          <span className="px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 text-[9px] font-mono">
                            {msg.mode}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded hover:bg-slate-700/50"
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

                {/* Formatted Message Body */}
                {msg.role === 'assistant' ? (
                  <FormattedMessage content={msg.content} onCitationClick={onCitationClick} />
                ) : (
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                )}

                {/* Grounded Citations Drawer */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-700/60">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      <span>Verified Sources</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => onCitationClick(c.page, c.snippet)}
                          className="flex items-center space-x-1 text-[11px] font-medium bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg transition-colors group cursor-pointer"
                          title={`Click to inspect Page ${c.page}: "${c.snippet}"`}
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
            <span>DocuMind is synthesizing executive findings...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder={`Ask an executive question about ${documentTitle}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
