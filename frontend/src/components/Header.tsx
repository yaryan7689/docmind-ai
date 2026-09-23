import React from 'react';
import { 
  Sparkles, 
  Settings, 
  Upload, 
  RotateCcw, 
  Layers,
  Zap,
  Bot
} from 'lucide-react';
import type { DocumentItem } from '../types';

interface HeaderProps {
  documents: DocumentItem[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onResetDemo: () => void;
  provider: string;
  apiKey: string;
  selectedModel: string;
}

export const Header: React.FC<HeaderProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onOpenUpload,
  onOpenSettings,
  onResetDemo,
  provider,
  apiKey,
  selectedModel,
}) => {
  const isLive = Boolean(apiKey);

  const getProviderBadge = () => {
    if (!isLive) {
      return (
        <div
          onClick={onOpenSettings}
          className="cursor-pointer hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80 transition-colors"
          title="Click to configure API Key (Groq, OpenAI, Gemini)"
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Demo Sandbox</span>
        </div>
      );
    }

    if (provider === 'groq') {
      return (
        <div
          onClick={onOpenSettings}
          className="cursor-pointer hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          title="Configured with Groq"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Groq: {selectedModel}</span>
        </div>
      );
    }

    if (provider === 'openai') {
      return (
        <div
          onClick={onOpenSettings}
          className="cursor-pointer hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
          title="Configured with OpenAI"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>OpenAI: {selectedModel}</span>
        </div>
      );
    }

    return (
      <div
        onClick={onOpenSettings}
        className="cursor-pointer hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
        title="Configured with Gemini"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>Gemini: {selectedModel}</span>
      </div>
    );
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-black/20">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              DocuMind AI
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v1.0 Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Multimodal Document Intelligence & Analysis
          </p>
        </div>
      </div>

      {/* Active Document Selector */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 hover:border-slate-600 transition-colors">
          <Layers className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
          <select
            value={selectedDocId}
            onChange={(e) => onSelectDoc(e.target.value)}
            className="bg-transparent text-sm text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="bg-slate-900 text-slate-200">
                {doc.filename} ({doc.total_pages} {doc.total_pages === 1 ? 'page' : 'pages'})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden md:inline">Upload</span>
        </button>
      </div>

      {/* Engine & Settings */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {getProviderBadge()}

        <button
          onClick={onResetDemo}
          title="Reset to default sample documents"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          title="API Key and Model Settings"
          className="flex items-center space-x-1.5 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
