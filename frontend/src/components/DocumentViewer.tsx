import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Table as TableIcon,
  Layers,
  FileCheck2,
  ListOrdered
} from 'lucide-react';
import type { DocumentDetail } from '../types';
import { ErrorBoundary } from './ErrorBoundary';

interface DocumentViewerProps {
  document: DocumentDetail | null;
  targetPage?: number;
  highlightText?: string;
}

/**
 * Normalizes raw table data from any source into a safe 3D array:
 * List of Tables -> List of Rows -> List of Cells.
 */
function normalizeTables(raw: any): (string | number)[][][] {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return [];
  
  if (Array.isArray(raw[0])) {
    if (raw[0].length > 0 && Array.isArray(raw[0][0])) {
      return raw as (string | number)[][][];
    }
    return [raw as (string | number)[][]];
  }
  return [];
}

/**
 * Robust table renderer that handles any data shape safely with clean styling
 */
const SafeTableList: React.FC<{ rawTables: any; pageNumber: number }> = ({ rawTables, pageNumber }) => {
  const tables = normalizeTables(rawTables);
  if (tables.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-slate-800/80 font-sans w-full flex-shrink-0">
      <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-3">
        <TableIcon className="w-4 h-4" />
        <span>Extracted Data Tables (Page {pageNumber})</span>
      </div>
      {tables.map((table, tIdx) => {
        if (!Array.isArray(table) || table.length === 0) return null;
        const rawHeaders = Array.isArray(table[0]) ? table[0] : [table[0]];
        const rows = table.slice(1);

        return (
          <div key={tIdx} className="overflow-x-auto rounded-xl border border-slate-800/90 bg-slate-950/40 my-3 shadow-inner">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-slate-800/80 text-slate-200">
                <tr>
                  {rawHeaders.map((header, hIdx) => (
                    <th key={hIdx} className="p-2.5 border-b border-slate-700/80 font-semibold text-slate-200">
                      {String(header ?? '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={rawHeaders.length} className="p-3 text-center text-slate-500 italic">
                      No additional data rows
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rIdx) => {
                    const cells = Array.isArray(row) ? row : [row];
                    return (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-slate-300">
                            {String(cell ?? '')}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export const DocumentViewerInner: React.FC<DocumentViewerProps> = ({
  document,
  targetPage,
  highlightText,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const lastTargetPageRef = useRef<number | undefined>(undefined);

  // Jump to page if requested by citation click or external selector
  useEffect(() => {
    if (targetPage !== undefined && targetPage !== null && targetPage !== lastTargetPageRef.current) {
      lastTargetPageRef.current = targetPage;
      if (document && targetPage >= 1 && targetPage <= (document.pages?.length || 1)) {
        setCurrentPage(targetPage);
        if (viewMode === 'all') {
          setTimeout(() => {
            const el = pageRefs.current[targetPage];
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 50);
        }
      }
    }
  }, [targetPage, document, viewMode]);

  // Reset to page 1 on document change
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
    lastTargetPageRef.current = undefined;
  }, [document?.id]);

  if (!document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
        <FileText className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
        <p className="text-sm">Select or upload a document to inspect its contents</p>
      </div>
    );
  }

  const pages = document.pages && document.pages.length > 0 
    ? document.pages 
    : [{ page_number: 1, text: document.full_text || 'No text extracted', tables: [] }];
  
  const activePage = pages.find((p) => p.page_number === currentPage) || pages[0];

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < pages.length) setCurrentPage(currentPage + 1);
  };

  const handleJumpTo = (page: number) => {
    setCurrentPage(page);
    if (viewMode === 'all') {
      const el = pageRefs.current[page];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Text highlighting logic for searches and citations
  const renderHighlightedText = (text: string) => {
    if (!text || typeof text !== 'string') return '';
    const query = searchQuery.trim() || highlightText?.trim() || '';
    if (!query) return text;

    try {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-400/30 text-amber-200 px-1 py-0.5 rounded border border-amber-400/40">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950/70 border-r border-slate-800 overflow-hidden h-[calc(100vh-4rem)]">
      {/* Top Document Toolbar */}
      <div className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/50 gap-2">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-200 truncate max-w-[180px] sm:max-w-xs">
              {document.filename}
            </h3>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <FileCheck2 className="w-3 h-3" />
                <span>All {pages.length} Pages Analyzed</span>
              </span>
              <span>•</span>
              <span>{(document.word_count || 0).toLocaleString()} words</span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle: Single Page vs All Pages */}
        <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60">
          <button
            onClick={() => setViewMode('single')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center space-x-1 cursor-pointer ${
              viewMode === 'single'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="View one page at a time"
          >
            <ListOrdered className="w-3 h-3" />
            <span className="hidden sm:inline">Single Page</span>
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center space-x-1 cursor-pointer ${
              viewMode === 'all'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="View all pages in continuous scroll"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">All Pages</span>
          </button>
        </div>

        {/* Page Switcher (Single Mode) */}
        {viewMode === 'single' && (
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-300 px-1 whitespace-nowrap">
              Page {currentPage} of {pages.length || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= pages.length}
              className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* In-Document Search & Zoom */}
        <div className="flex items-center space-x-2">
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Find in text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-28 lg:w-40 transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700/60 p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Jump Page Pills */}
      {pages.length > 1 && (
        <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800/60 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mr-1 flex-shrink-0">
            Jump to page:
          </span>
          {pages.map((p) => (
            <button
              key={p.page_number}
              onClick={() => handleJumpTo(p.page_number)}
              className={`px-3 py-0.5 rounded-md text-[11px] font-mono transition-all flex-shrink-0 cursor-pointer ${
                currentPage === p.page_number
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              P{p.page_number}
            </button>
          ))}
        </div>
      )}

      {/* Main Page Canvas with gap-8 separation and zero shrinking */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center bg-slate-950/80 min-h-0">
        <div 
          className="w-full flex flex-col items-center gap-8 pb-16 flex-shrink-0 transition-all duration-150"
          style={{ 
            maxWidth: zoomLevel <= 100 ? '48rem' : `${(48 * zoomLevel) / 100}rem`,
            fontSize: `${zoomLevel}%`
          }}
        >
          {viewMode === 'single' ? (
            /* SINGLE PAGE VIEW */
            <div
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 min-h-[550px] h-fit flex flex-col flex-shrink-0 relative transition-all"
            >
              {/* Page Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5 text-xs text-slate-500 font-mono">
                <span className="truncate max-w-[200px] sm:max-w-md font-semibold text-slate-400">
                  PREVIEW — {document.filename}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20 text-[11px] flex-shrink-0">
                  PAGE {activePage?.page_number || 1} OF {pages.length}
                </span>
              </div>

              {/* Page Text Content */}
              <div className="font-serif text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
                {activePage?.text ? (
                  renderHighlightedText(activePage.text)
                ) : (
                  <p className="italic text-slate-500 font-sans">
                    (This page contains tables, charts, or non-textual layout)
                  </p>
                )}
              </div>

              {/* Tables on this page */}
              <SafeTableList rawTables={activePage?.tables} pageNumber={activePage?.page_number || 1} />

              {/* Page Footer */}
              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span className="text-slate-400 font-medium">Page {activePage?.page_number} of {pages.length}</span>
                <span>Indexed chunks: {document.chunks?.length || 0}</span>
              </div>
            </div>
          ) : (
            /* ALL PAGES CONTINUOUS SCROLL VIEW */
            pages.map((p) => (
              <div
                key={p.page_number}
                ref={(el) => { pageRefs.current[p.page_number] = el; }}
                className={`w-full bg-slate-900 border rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 min-h-[550px] h-fit flex flex-col flex-shrink-0 relative transition-all duration-200 ${
                  currentPage === p.page_number
                    ? 'border-indigo-500/90 ring-2 ring-indigo-500/40 shadow-indigo-500/10'
                    : 'border-slate-800/90 hover:border-slate-700/80'
                }`}
              >
                {/* Page Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5 text-xs text-slate-500 font-mono">
                  <span className="truncate max-w-[200px] sm:max-w-md font-semibold text-slate-400">
                    {document.filename}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20 text-[11px] flex-shrink-0">
                    PAGE {p.page_number} OF {pages.length}
                  </span>
                </div>

                {/* Page Text Content */}
                <div className="font-serif text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
                  {p.text ? (
                    renderHighlightedText(p.text)
                  ) : (
                    <p className="italic text-slate-500 font-sans">
                      (Page {p.page_number}: Graphic or tabular content)
                    </p>
                  )}
                </div>

                {/* Tables if any on this page */}
                <SafeTableList rawTables={p.tables} pageNumber={p.page_number} />

                {/* Page Footer */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                  <span className="text-slate-400 font-medium">Page {p.page_number} of {pages.length}</span>
                  <button
                    onClick={() => setCurrentPage(p.page_number)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      currentPage === p.page_number
                        ? 'text-indigo-400 font-semibold bg-indigo-500/10'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {currentPage === p.page_number ? '● Current Active' : 'Mark as Active'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const DocumentViewer: React.FC<DocumentViewerProps> = (props) => {
  return (
    <ErrorBoundary fallbackTitle="Document Viewer Error">
      <DocumentViewerInner {...props} />
    </ErrorBoundary>
  );
};
