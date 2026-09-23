import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  Tag, 
  Calendar, 
  DollarSign, 
  Users, 
  ShieldAlert, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import type { ExtractedEntity } from '../types';
import { ProgressTracker } from './ProgressTracker';

const EXTRACTION_STEPS = [
  'Scanning all pages for entities',
  'Identifying financial figures',
  'Extracting dates & deadlines',
  'Mapping parties & obligations',
  'Structuring extracted data',
];

interface SmartExtractionViewProps {
  entities: ExtractedEntity[] | null;
  isLoading: boolean;
  onRefresh: () => void;
  documentTitle: string;
  onJumpToPage: (page: number) => void;
}

export const SmartExtractionView: React.FC<SmartExtractionViewProps> = ({
  entities,
  isLoading,
  onRefresh,
  documentTitle,
  onJumpToPage,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (isLoading) {
    return (
      <ProgressTracker
        isLoading={true}
        steps={EXTRACTION_STEPS}
        completedLabel="Extraction complete"
      />
    );
  }

  if (!entities || entities.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <Database className="w-12 h-12 text-slate-600" />
        <div>
          <h3 className="text-sm font-semibold text-slate-200">No Structured Data Extracted</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Run automated extraction to turn {documentTitle} into a structured relational catalog.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run Smart Extraction</span>
        </button>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(entities.map((e) => e.category)))];
  const uniquePages = Array.from(new Set(entities.map((e) => e.page))).sort((a, b) => a - b);
  const [filterPage, setFilterPage] = useState<number | 'All'>('All');

  const filteredEntities = entities.filter((e) => {
    const matchesCat = filterCategory === 'All' || e.category === filterCategory;
    const matchesPage = filterPage === 'All' || e.page === filterPage;
    const matchesQuery =
      searchQuery === '' ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.detail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesPage && matchesQuery;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Financial':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
            <DollarSign className="w-3 h-3" />
            <span>Financial</span>
          </span>
        );
      case 'Dates':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Dates</span>
          </span>
        );
      case 'Parties':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>Parties</span>
          </span>
        );
      case 'Legal & Risk':
      case 'Obligations':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
            <ShieldAlert className="w-3 h-3" />
            <span>{category}</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/50 flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>{category}</span>
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Name / Attribute', 'Extracted Value / Detail', 'Source Page'];
    const rows = filteredEntities.map((e) => [
      `"${e.category}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.detail.replace(/"/g, '""')}"`,
      `"${e.page}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\.[^/.]+$/, '')}_Extracted_Entities.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 h-[calc(100vh-4rem)]">
      {/* Controls & Filter Bar */}
      <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search entities, clauses, figures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Categories & Page Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}

          {uniquePages.length > 1 && (
            <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-slate-700">
              <span className="text-[10px] text-slate-400 mr-1">Page:</span>
              <button
                onClick={() => setFilterPage('All')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  filterPage === 'All'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({uniquePages.length}p)
              </button>
              {uniquePages.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPage(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    filterPage === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  P{p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action */}
        <button
          onClick={handleExportCSV}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5 text-xs font-medium self-end md:self-auto"
          title="Download as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Entities Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5 border-b border-slate-800">Category</th>
              <th className="p-3.5 border-b border-slate-800">Entity / Attribute</th>
              <th className="p-3.5 border-b border-slate-800">Extracted Value / Specification</th>
              <th className="p-3.5 border-b border-slate-800 text-right">Source Page</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEntities.map((ent, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 whitespace-nowrap">{getCategoryBadge(ent.category)}</td>
                <td className="p-3.5 font-semibold text-slate-200">{ent.name}</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  {ent.detail}
                </td>
                <td className="p-3.5 text-right whitespace-nowrap">
                  <button
                    onClick={() => onJumpToPage(ent.page)}
                    className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/20 transition-colors"
                  >
                    <span>Page {ent.page}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
