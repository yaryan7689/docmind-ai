import React, { useState } from 'react';
import { X, KeyRound, Check, ExternalLink, Cpu, Zap, Bot, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  onSelectProvider: (provider: string) => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  provider,
  onSelectProvider,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
}) => {
  const [tempKey, setTempKey] = useState<string>(apiKey);
  const [tempProvider, setTempProvider] = useState<string>(provider || 'groq');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleProviderChange = (p: string) => {
    setTempProvider(p);
    // Switch default model based on provider
    if (p === 'groq') {
      onSelectModel('llama-3.3-70b-versatile');
    } else if (p === 'openai') {
      onSelectModel('gpt-4o-mini');
    } else if (p === 'gemini') {
      onSelectModel('gemini-3.8-flash');
    }
  };

  const handleSave = () => {
    onSelectProvider(tempProvider);
    onSaveApiKey(tempKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClearKey = () => {
    setTempKey('');
    onSaveApiKey('');
  };

  const getProviderInfo = () => {
    switch (tempProvider) {
      case 'groq':
        return {
          name: 'Groq Cloud',
          placeholder: 'gsk_...',
          link: 'https://console.groq.com/keys',
          linkLabel: 'Get free Groq API key',
          desc: 'Ultra-low latency inference powered by LPUs and Llama 3.3.',
        };
      case 'openai':
        return {
          name: 'OpenAI',
          placeholder: 'sk-proj-...',
          link: 'https://platform.openai.com/api-keys',
          linkLabel: 'Get OpenAI API key',
          desc: 'High intelligence reasoning with GPT-4o and GPT-4o-mini.',
        };
      default:
        return {
          name: 'Google Gemini',
          placeholder: 'AIzaSy...',
          link: 'https://aistudio.google.com/app/apikey',
          linkLabel: 'Get Gemini API key',
          desc: '1M token long-context multimodal understanding.',
        };
    }
  };

  const info = getProviderInfo();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <span>AI Model & Provider Configuration</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Choose your AI inference engine: Groq (recommended for speed), OpenAI, or Google Gemini.
          </p>
        </div>

        {/* Provider Switcher Tabs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Inference Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange('groq')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  tempProvider === 'groq'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/40 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xs font-semibold">Groq</div>
                <div className="text-[10px] text-amber-300/80">Ultra-Fast</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('openai')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  tempProvider === 'openai'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs font-semibold">OpenAI</div>
                <div className="text-[10px] text-emerald-300/80">GPT-4o</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  tempProvider === 'gemini'
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200 ring-1 ring-indigo-500/40 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xs font-semibold">Gemini</div>
                <div className="text-[10px] text-indigo-300/80">1M Context</div>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {info.name} API Key
              </label>
              <a
                href={info.link}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline inline-flex items-center space-x-1"
              >
                <span>{info.linkLabel}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder={info.placeholder}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              {tempKey && (
                <button
                  onClick={handleClearKey}
                  className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 hover:text-rose-400"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {info.desc}
            </p>
          </div>

          {/* Model Selector based on provider */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Model Selection</span>
            </label>

            {tempProvider === 'groq' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectModel('llama-3.3-70b-versatile')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedModel === 'llama-3.3-70b-versatile'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">Llama 3.3 70B</div>
                  <div className="text-[10px] text-slate-400">High accuracy & reasoning</div>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectModel('llama-3.1-8b-instant')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedModel === 'llama-3.1-8b-instant'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">Llama 3.1 8B</div>
                  <div className="text-[10px] text-slate-400">Instant response speed</div>
                </button>
              </div>
            )}

            {tempProvider === 'openai' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectModel('gpt-4o-mini')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedModel === 'gpt-4o-mini'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">GPT-4o Mini</div>
                  <div className="text-[10px] text-slate-400">Fast, smart & cost-effective</div>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectModel('gpt-4o')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedModel === 'gpt-4o'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">GPT-4o (Omni)</div>
                  <div className="text-[10px] text-slate-400">Flagship multimodal model</div>
                </button>
              </div>
            )}

            {tempProvider === 'gemini' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectModel('gemini-3.8-flash')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedModel === 'gemini-3.8-flash'
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">Gemini 3.8 Flash</div>
                  <div className="text-[10px] text-slate-400">1M multimodal tokens</div>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectModel('gemini-3.5-flash-lite')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedModel === 'gemini-3.5-flash-lite'
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">Gemini 3.5 Lite</div>
                  <div className="text-[10px] text-slate-400">Lowest latency inference</div>
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Sandbox Mode:</span> If an API key is missing or encounters a rate limit/quota error, DocuMind AI automatically provides intelligent grounded answers and citations from the local RAG engine.
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
