import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  FileCheck, 
  Database, 
  GitCompare, 
  PanelLeftClose, 
  PanelLeftOpen,
  Loader2
} from 'lucide-react';
import { Header } from './components/Header';
import { DocumentSidebar } from './components/DocumentSidebar';
import { DocumentViewer } from './components/DocumentViewer';
import { ChatPanel } from './components/ChatPanel';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { SmartExtractionView } from './components/SmartExtractionView';
import { DocumentCompareView } from './components/DocumentCompareView';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { SettingsModal } from './components/SettingsModal';
import { api } from './services/api';
import type { DocumentItem, DocumentDetail, ChatMessage, Citation } from './types';

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [selectedDocDetail, setSelectedDocDetail] = useState<DocumentDetail | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'extract' | 'compare'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Citation highlighting
  const [targetPage, setTargetPage] = useState<number | undefined>(undefined);
  const [highlightText, setHighlightText] = useState<string | undefined>(undefined);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Summary & Extraction loading
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingEntities, setIsLoadingEntities] = useState<boolean>(false);

  // Modals & Settings
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Multi-Provider state (Groq, OpenAI, Gemini)
  const [provider, setProvider] = useState<string>(
    () => localStorage.getItem('documind_provider') || 'groq'
  );
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem('documind_api_key') || ''
  );
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem('documind_model');
    if (saved) return saved;
    const prov = localStorage.getItem('documind_provider') || 'groq';
    if (prov === 'groq') return 'llama-3.3-70b-versatile';
    if (prov === 'openai') return 'gpt-4o-mini';
    return 'gemini-3.8-flash';
  });

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async (selectId?: string) => {
    setIsLoadingDocs(true);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      if (docs.length > 0) {
        const nextId = selectId || (docs.find((d) => d.id === selectedDocId)?.id ?? docs[0].id);
        setSelectedDocId(nextId);
        loadDocumentDetail(nextId);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const loadDocumentDetail = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await api.getDocumentDetail(id);
      setSelectedDocDetail(detail);
      setChatMessages([]);
      setTargetPage(1);
      setHighlightText(undefined);
    } catch (err) {
      console.error('Error fetching document detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSelectDoc = (id: string) => {
    if (id === selectedDocId) return;
    setSelectedDocId(id);
    loadDocumentDetail(id);
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await api.deleteDocument(id);
      loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Reset workspace back to original demo documents?')) {
      try {
        await api.resetDemo();
        loadDocuments();
      } catch (err) {
        console.error('Error resetting demo:', err);
      }
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('documind_api_key', key);
  };

  const handleSelectProvider = (newProvider: string) => {
    setProvider(newProvider);
    localStorage.setItem('documind_provider', newProvider);
  };

  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem('documind_model', model);
  };

  // Chat message sending with streaming
  const handleSendMessage = async (query: string) => {
    if (!selectedDocDetail || isStreaming) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      citations: [],
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setIsStreaming(true);

    const historyPayload = chatMessages.map((m) => ({ role: m.role, content: m.content }));

    await api.streamChat(
      selectedDocDetail.id,
      query,
      historyPayload,
      provider,
      apiKey,
      selectedModel,
      (chunk: string) => {
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      },
      (citations: Citation[]) => {
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, citations } : msg))
        );
      },
      (mode: string) => {
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, mode: mode as any } : msg
          )
        );
        setIsStreaming(false);
      },
      (err: any) => {
        console.error('Chat error:', err);
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    'An error occurred while generating response. Please check your provider API key or network connection.',
                }
              : msg
          )
        );
        setIsStreaming(false);
      }
    );
  };

  // Citation click handler (jumps viewer to page & highlights text snippet)
  const handleCitationClick = (page: number, snippet: string) => {
    setTargetPage(page);
    setHighlightText(snippet.slice(0, 40));
  };

  // Summary generation
  const handleGenerateSummary = async (forceRefresh: boolean = false) => {
    if (!selectedDocDetail) return;
    setIsLoadingSummary(true);
    try {
      const summary = await api.getSummary(selectedDocDetail.id, provider, apiKey, selectedModel, forceRefresh);
      setSelectedDocDetail((prev) => (prev ? { ...prev, summary } : null));
    } catch (err) {
      console.error(err);
      alert('Failed to generate executive summary');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Entity extraction
  const handleGenerateEntities = async (forceRefresh: boolean = false) => {
    if (!selectedDocDetail) return;
    setIsLoadingEntities(true);
    try {
      const res = await api.getEntities(selectedDocDetail.id, provider, apiKey, selectedModel, forceRefresh);
      setSelectedDocDetail((prev) => (prev ? { ...prev, entities: res.entities } : null));
    } catch (err) {
      console.error(err);
      alert('Failed to extract entities');
    } finally {
      setIsLoadingEntities(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <Header
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDoc={handleSelectDoc}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetDemo={handleResetDemo}
        provider={provider}
        apiKey={apiKey}
        selectedModel={selectedModel}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {isSidebarOpen && (
          <DocumentSidebar
            documents={documents}
            selectedDocId={selectedDocId}
            onSelectDoc={handleSelectDoc}
            onDeleteDoc={handleDeleteDoc}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {/* Sidebar Toggle Tab */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="h-10 w-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-y border-r border-slate-700 rounded-r self-center z-10 flex items-center justify-center transition-colors"
          title={isSidebarOpen ? 'Collapse documents sidebar' : 'Expand documents sidebar'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-3 h-3" />
          ) : (
            <PanelLeftOpen className="w-3 h-3" />
          )}
        </button>

        {/* Document Viewer (Left/Center Canvas) */}
        <div className="flex-1 flex min-w-0">
          {isLoadingDocs || isLoadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
              <p className="text-xs text-slate-400">Loading document workspace...</p>
            </div>
          ) : (
            <DocumentViewer
              document={selectedDocDetail}
              targetPage={targetPage}
              highlightText={highlightText}
            />
          )}
        </div>

        {/* Right Intelligence Panel */}
        <div className="w-[480px] xl:w-[540px] flex flex-col border-l border-slate-800 bg-slate-900/80 backdrop-blur-md">
          {/* Tab Navigation */}
          <div className="h-14 border-b border-slate-800 px-3 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Q&A Chat</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('summary');
                  if (!selectedDocDetail?.summary && !isLoadingSummary) {
                    handleGenerateSummary();
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Summary</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('extract');
                  if (!selectedDocDetail?.entities && !isLoadingEntities) {
                    handleGenerateEntities();
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'extract'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Entities</span>
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'compare'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare</span>
              </button>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'chat' && (
              <ChatPanel
                messages={chatMessages}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onCitationClick={handleCitationClick}
                documentTitle={selectedDocDetail?.filename || 'Document'}
              />
            )}

            {activeTab === 'summary' && (
              <ExecutiveSummaryView
                summary={selectedDocDetail?.summary || null}
                isLoading={isLoadingSummary}
                onRefresh={() => handleGenerateSummary(true)}
                documentTitle={selectedDocDetail?.filename || 'Document'}
              />
            )}

            {activeTab === 'extract' && (
              <SmartExtractionView
                entities={selectedDocDetail?.entities || null}
                isLoading={isLoadingEntities}
                onRefresh={() => handleGenerateEntities(true)}
                documentTitle={selectedDocDetail?.filename || 'Document'}
                onJumpToPage={(p) => setTargetPage(p)}
              />
            )}

            {activeTab === 'compare' && (
              <DocumentCompareView
                documents={documents}
                apiKey={apiKey}
                provider={provider}
              />
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newDoc) => {
          loadDocuments(newDoc.id);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        provider={provider}
        onSelectProvider={handleSelectProvider}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />
    </div>
  );
};

export default App;
