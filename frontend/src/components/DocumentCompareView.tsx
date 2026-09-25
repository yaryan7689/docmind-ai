import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles
} from 'lucide-react';
import type { DocumentItem, DiffResult } from '../types';
import { api } from '../services/api';

interface DocumentCompareViewProps {
  documents: DocumentItem[];
  apiKey: string;
  provider?: string;
}

export const DocumentCompareView: React.FC<DocumentCompareViewProps> = ({
  documents,
  apiKey,
  provider,
}) => {
  const [doc1Id, setDoc1Id] = useState<string>(documents[0]?.id || '');
  const [doc2Id, setDoc2Id] = useState<string>(documents[1]?.id || documents[0]?.id || '');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCompare = async () => {
    if (!doc1Id || !doc2Id) return;
    setIsLoading(true);
    try {
      const res = await api.compareDocuments(doc1Id, doc2Id, provider, apiKey);
      setDiffResult(res);
    } catch (err) {
      console.error(err);
      alert('Failed to compare documents');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            High Impact
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Moderate
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Low Impact
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 h-[calc(100vh-4rem)]">
      {/* Header Selector Card */}
      <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <span>Document Diff & Contract Comparison</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare two contracts, versions, or reports to detect clause modifications, fee adjustments, and liability deltas.
          </p>
        </div>

        {/* Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Base Document (Version A)
            </label>
            <select
              value={doc1Id}
              onChange={(e) => setDoc1Id(e.target.value)}
              className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} ({d.category})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Target Document (Version B)
            </label>
            <select
              value={doc2Id}
              onChange={(e) => setDoc2Id(e.target.value)}
              className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} ({d.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={isLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Analyzing Deviations...' : 'Run Comparative Diff Analysis'}</span>
        </button>
      </div>

      {/* Diff Results */}
      {diffResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Identified Changes ({diffResult.changes.length})
            </h3>
            <span className="text-xs text-indigo-400 font-mono">
              {diffResult.doc1_title} ➔ {diffResult.doc2_title}
            </span>
          </div>

          <div className="space-y-3">
            {diffResult.changes.map((ch, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">{ch.section}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {ch.type}
                    </span>
                  </div>
                  {getSeverityBadge(ch.severity)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl">
                    <p className="text-[10px] uppercase font-semibold text-rose-400 mb-1">
                      Original Clause (Version A)
                    </p>
                    <p className="text-slate-300 line-through opacity-80">{ch.old_value}</p>
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                    <p className="text-[10px] uppercase font-semibold text-emerald-400 mb-1">
                      Revised Clause (Version B)
                    </p>
                    <p className="text-slate-200 font-medium">{ch.new_value}</p>
                  </div>
                </div>

                {/* Analysis Commentary */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                  <span className="text-indigo-400 font-semibold mr-1.5">AI Analysis:</span>
                  {ch.analysis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
