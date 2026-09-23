import React, { useState } from 'react';
import { 
  FileCheck, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  RefreshCw,
  Sparkles,
  Calendar,
  FileText,
  Printer
} from 'lucide-react';
import type { ExecutiveSummary } from '../types';
import { ProgressTracker } from './ProgressTracker';

interface ExecutiveSummaryViewProps {
  summary: ExecutiveSummary | null;
  isLoading: boolean;
  onRefresh: () => void;
  documentTitle: string;
}

const SUMMARY_STEPS = [
  'Parsing all document pages',
  'Building multi-page context',
  'Querying AI model',
  'Extracting key takeaways',
  'Structuring executive brief',
];

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  summary,
  isLoading,
  onRefresh,
  documentTitle,
}) => {

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // ─── Loading state: animated progress tracker ──────────────────────────
  if (isLoading) {
    return (
      <ProgressTracker
        isLoading={true}
        steps={SUMMARY_STEPS}
        completedLabel="Executive brief ready"
      />
    );
  }

  // ─── Empty state ────────────────────────────────────────────────────────
  if (!summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <FileCheck className="w-12 h-12 text-slate-600" />
        <div>
          <h3 className="text-sm font-semibold text-slate-200">No Executive Summary Generated Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Generate an AI executive brief to summarize {documentTitle}, detect risks, and highlight action items.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Executive Summary</span>
        </button>
      </div>
    );
  }

  // ─── Helpers ────────────────────────────────────────────────────────────
  const getRiskBadge = (score: string) => {
    switch (score?.toLowerCase()) {
      case 'low':
        return (
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Low Risk Profile</span>
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-4 h-4" />
            <span>High Risk Identified</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4" />
            <span>Medium Risk Factors</span>
          </span>
        );
    }
  };

  // ─── Export Markdown ────────────────────────────────────────────────────
  const handleExportMarkdown = () => {
    const md =
      `# ${summary.title || documentTitle}\n\n` +
      `## Executive Summary\n${summary.executive_summary}\n\n` +
      `**Risk Score:** ${summary.risk_score}\n\n` +
      `## Key Takeaways\n${summary.key_takeaways.map((t) => `- ${t}`).join('\n')}\n\n` +
      `## Action Items\n` +
      summary.action_items
        .map((a) => `- **${a.item}** (Owner: ${a.owner}, Deadline: ${a.deadline})`)
        .join('\n');

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\.[^/.]+$/, '')}_Executive_Brief.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Export PDF (browser print API) ─────────────────────────────────────
  const handleExportPDF = () => {
    setIsExportingPdf(true);

    const riskColor =
      summary.risk_score?.toLowerCase() === 'low'
        ? '#10b981'
        : summary.risk_score?.toLowerCase() === 'high'
        ? '#f43f5e'
        : '#f59e0b';

    const actionRows = (summary.action_items || [])
      .map(
        (a) =>
          `<tr>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e293b">${a.item}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569">${a.owner}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#d97706">${a.deadline}</td>
          </tr>`
      )
      .join('');

    const takeawayCards = (summary.key_takeaways || [])
      .map(
        (t, i) =>
          `<div style="display:flex;gap:10px;align-items:flex-start;padding:10px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:8px">
            <div style="min-width:22px;height:22px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${i + 1}</div>
            <p style="margin:0;font-size:13px;color:#334155;line-height:1.6">${t}</p>
          </div>`
      )
      .join('');

    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>DocuMind AI — Executive Brief</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #fff; }
          .page { max-width: 800px; margin: 0 auto; padding: 48px 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 28px; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .brand-dot { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg,#6366f1,#8b5cf6); }
          .brand-name { font-size: 18px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; }
          .brand-sub { font-size: 10px; color: #94a3b8; margin-top: 1px; }
          .meta { text-align: right; }
          .meta p { font-size: 11px; color: #94a3b8; }
          .doc-title { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
          .risk-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; color: ${riskColor}; border: 1px solid ${riskColor}; margin-bottom: 20px; }
          .section { margin-bottom: 28px; }
          .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; border-left: 3px solid #6366f1; padding-left: 8px; margin-bottom: 14px; }
          .summary-text { font-size: 14px; line-height: 1.75; color: #334155; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          thead { background: #f1f5f9; }
          th { padding: 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
          .footer p { font-size: 10px; color: #94a3b8; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              <div class="brand-dot"></div>
              <div>
                <div class="brand-name">DocuMind AI</div>
                <div class="brand-sub">Intelligent Document Analysis Platform</div>
              </div>
            </div>
            <div class="meta">
              <p>Executive Brief</p>
              <p>Generated: ${now}</p>
            </div>
          </div>

          <h1 class="doc-title">${summary.title || documentTitle}</h1>
          <div class="risk-badge">● ${summary.risk_score?.toUpperCase() || 'MEDIUM'} RISK</div>

          <div class="section">
            <div class="section-title">Executive Overview</div>
            <p class="summary-text">${summary.executive_summary || ''}</p>
          </div>

          ${takeawayCards ? `
          <div class="section">
            <div class="section-title">Core Takeaways &amp; Findings</div>
            ${takeawayCards}
          </div>` : ''}

          ${actionRows ? `
          <div class="section">
            <div class="section-title">Recommended Action Items &amp; Deadlines</div>
            <table>
              <thead>
                <tr>
                  <th>Action Item</th>
                  <th>Owner</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>${actionRows}</tbody>
            </table>
          </div>` : ''}

          <div class="footer">
            <p>DocuMind AI • Confidential Executive Brief</p>
            <p>${documentTitle}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow popups to export PDF. Then click Export PDF again.');
      setIsExportingPdf(false);
      return;
    }

    printWindow.document.write(printHtml);
    printWindow.document.close();

    // Wait for content to render, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setIsExportingPdf(false);
      }, 300);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => setIsExportingPdf(false), 3000);
  };

  // ─── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 h-[calc(100vh-4rem)]">
      {/* Top Header Card */}
      <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-base font-bold text-slate-100">{summary.title || documentTitle}</h2>
            {getRiskBadge(summary.risk_score)}
          </div>
          <p className="text-xs text-slate-400">
            Comprehensive synthesis grounded in complete document context
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5 text-xs"
            title="Re-run analysis"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5 text-xs"
            title="Download as Markdown"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>.md</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5 text-xs font-medium"
            title="Export as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Preparing…' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Executive Overview */}
      <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
          <FileCheck className="w-4 h-4" />
          <span>Executive Overview</span>
        </h3>
        <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
          {summary.executive_summary}
        </p>
      </div>

      {/* Key Takeaways */}
      <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Core Takeaways &amp; Findings</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.key_takeaways?.map((takeaway, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start space-x-3"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-300 leading-normal">{takeaway}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      {summary.action_items && summary.action_items.length > 0 && (
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Recommended Action Items &amp; Deadlines</span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 border-b border-slate-800">Action Item</th>
                  <th className="p-3 border-b border-slate-800">Assigned Owner</th>
                  <th className="p-3 border-b border-slate-800">Target Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {summary.action_items.map((act, aIdx) => (
                  <tr key={aIdx} className="hover:bg-slate-800/30">
                    <td className="p-3 font-medium text-slate-200">{act.item}</td>
                    <td className="p-3 text-slate-400 flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{act.owner}</span>
                    </td>
                    <td className="p-3 text-slate-400">
                      <span className="flex items-center space-x-1.5 text-amber-300/80">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{act.deadline}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export hint */}
      <p className="text-center text-[10px] text-slate-600 pb-2">
        💡 Click <strong className="text-slate-500">Export PDF</strong> → Print dialog → <em>Save as PDF</em> for a branded document
      </p>
    </div>
  );
};
