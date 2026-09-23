import React from 'react';
import { FileText, Trash2, Plus, FileSpreadsheet, FileCode, CheckCircle } from 'lucide-react';
import type { DocumentItem } from '../types';

interface DocumentSidebarProps {
  documents: DocumentItem[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onOpenUpload: () => void;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onDeleteDoc,
  onOpenUpload,
}) => {
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />;
      default:
        return <FileCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />;
    }
  };

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900/60 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            Workspace Documents
          </h2>
          <p className="text-[11px] text-slate-500">
            {documents.length} loaded file{documents.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
          title="Upload new document"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {documents.map((doc) => {
          const isSelected = doc.id === selectedDocId;
          return (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`group relative p-3 rounded-xl cursor-pointer border transition-all ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between space-x-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
                    {getFileIcon(doc.file_type)}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                      {doc.filename}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400">
                      <span>{doc.total_pages} {doc.total_pages === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span>{doc.word_count.toLocaleString()} words</span>
                    </div>
                  </div>
                </div>

                {documents.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove "${doc.filename}" from workspace?`)) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status pills */}
              <div className="flex items-center space-x-1.5 mt-2.5">
                <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                  {doc.category || 'Uploaded'}
                </span>
                {doc.has_summary && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>Analyzed</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag & drop upload prompt in sidebar bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <button
          onClick={onOpenUpload}
          className="w-full py-2.5 px-3 border border-dashed border-indigo-500/30 rounded-xl text-xs text-indigo-300 hover:bg-indigo-600/10 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload PDF / DOCX / CSV</span>
        </button>
      </div>
    </aside>
  );
};
