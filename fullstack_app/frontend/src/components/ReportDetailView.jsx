import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  ChevronRight, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  ShieldCheck, 
  Loader2,
  Trash2
} from 'lucide-react';
import { reportAPI } from '../api';
import Sidebar from './Sidebar';
import TestDetailModal from './TestDetailModal';

export default function ReportDetailView({ 
  reportId, 
  initialReport, 
  onBack, 
  onOpenChat, 
  onNavigate, 
  onOpenUpload, 
  onLoadDemo, 
  user, 
  onLogout,
  showToast 
}) {
  const [report, setReport] = useState(initialReport || null);
  const [loading, setLoading] = useState(!initialReport);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [selectedDetailTest, setSelectedDetailTest] = useState(null);

  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!reportId && !initialReport?.id) return;
      const targetId = reportId || initialReport.id;
      try {
        setLoading(true);
        const data = await reportAPI.getReport(targetId);
        setReport(data);
      } catch (err) {
        console.error("Failed to load report detail", err);
        if (showToast) {
          showToast({ type: 'error', message: 'Failed to load report information.' });
        }
      } finally {
        setLoading(false);
      }
    };

    if (reportId || !initialReport) {
      fetchReportDetail();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 space-y-3">
        <Activity className="w-8 h-8 mx-auto text-orange-400 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading report analysis...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto px-4 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Report not found</h3>
        <p className="text-xs text-slate-400">This report may have been deleted or does not belong to your account.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const biomarkers = report.biomarkers || [];

  const parseJsonSafe = (str, fallback = []) => {
    if (Array.isArray(str)) return str;
    if (typeof str === 'string') {
      try { return JSON.parse(str); } catch { return fallback; }
    }
    return fallback;
  };

  const keyFindings = parseJsonSafe(report.key_findings);
  const doctorQuestions = parseJsonSafe(report.doctor_questions);
  const healthTips = parseJsonSafe(report.health_tips);

  const outOfRangeCount = biomarkers.filter(b => b.status === 'Above Range' || b.status === 'Below Range').length;

  const filteredTests = biomarkers.filter(b => {
    const matchesFilter = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'ABOVE' ? b.status === 'Above Range' :
      filterStatus === 'BELOW' ? b.status === 'Below Range' :
      filterStatus === 'WITHIN' ? b.status === 'Within Range' :
      b.status === 'Unable to Determine';

    const matchesQuery = 
      (b.test_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await reportAPI.downloadPdf(report.id, report.patient_name || report.original_name);
      if (showToast) {
        showToast({ type: 'success', message: 'PDF summary downloaded.' });
      }
    } catch (err) {
      if (showToast) {
        showToast({ type: 'error', message: 'Failed to download PDF summary.' });
      }
    } finally {
      setDownloading(false);
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 'Within Range') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <CheckCircle2 className="w-3 h-3" /> Within Range
        </span>
      );
    } else if (status === 'Above Range') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <ArrowUp className="w-3 h-3" /> Above Range
        </span>
      );
    } else if (status === 'Below Range') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <ArrowDown className="w-3 h-3" /> Below Range
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400">
          <HelpCircle className="w-3 h-3" /> Qualitative
        </span>
      );
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Column (Col 3) */}
        <div className="lg:col-span-3">
          <Sidebar
            currentView="report-detail"
            onNavigate={onNavigate || onBack}
            onOpenUpload={onOpenUpload}
            onLoadDemo={onLoadDemo}
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Main Content Column (Col 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack} 
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                    Report Analysis
                  </span>
                  {report.report_type === 'FICTIONAL DEMO DATA' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Fictional Demo Data
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate max-w-xl">
                  {report.original_name}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {report.patient_name} • {report.report_date} • {report.lab_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask MediLens</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-orange-500/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-orange-400" />}
                <span>PDF Summary</span>
              </button>
            </div>
          </div>

          {/* Top Report Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Total Tests</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{biomarkers.length}</p>
              <span className="text-[10px] text-slate-500">Evaluated parameters</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Within Range</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                {biomarkers.filter(b => b.status === 'Within Range').length}
              </p>
              <span className="text-[10px] text-slate-500">Normal boundaries</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Outside Range</span>
              <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">{outOfRangeCount}</p>
              <span className="text-[10px] text-slate-500">Flagged parameters</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Document Date</span>
              <p className="text-sm sm:text-base font-black text-white mt-2 truncate">{report.report_date || 'Recent'}</p>
              <span className="text-[10px] text-slate-500 truncate block">{report.lab_name}</span>
            </div>
          </div>

          {/* AI Clinical Summary Card */}
          <div className="p-6 rounded-3xl glass-panel border border-orange-500/25 shadow-2xl relative overflow-hidden text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">AI Clinical Overview</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                Processed with Grounded Extraction
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {report.summary_text || "Automated analysis completed. Key results and laboratory reference intervals are categorized below."}
            </p>

            {/* Key Findings list */}
            {keyFindings && keyFindings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2 text-xs text-slate-300">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Key Findings</h4>
                <ul className="space-y-1.5 list-disc list-inside">
                  {keyFindings.map((finding, idx) => (
                    <li key={idx} className="leading-relaxed">{finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Doctor questions */}
            {doctorQuestions && doctorQuestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2 text-xs text-slate-300">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Questions to Discuss With Your Doctor</h4>
                <ul className="space-y-1.5 list-disc list-inside">
                  {doctorQuestions.map((q, idx) => (
                    <li key={idx} className="leading-relaxed">{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-[11px] text-slate-500 italic">
                Educational only • Does not replace physician diagnosis or treatment
              </span>
            </div>
          </div>

          {/* Test Results Section */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] shadow-xl text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Extracted Test Results ({filteredTests.length})</h3>
                <p className="text-xs text-slate-400">Click any row to inspect physiological context, source page, and reference ranges</p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search test..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-xs font-semibold">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'ABOVE', label: 'High' },
                    { id: 'BELOW', label: 'Low' },
                    { id: 'WITHIN', label: 'Normal' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFilterStatus(t.id)}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        filterStatus === t.id ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="pb-3 pl-3">BIOMARKER</th>
                    <th className="pb-3 px-3">VALUE</th>
                    <th className="pb-3 px-3">REFERENCE INTERVAL</th>
                    <th className="pb-3 px-3">CLASSIFICATION</th>
                    <th className="pb-3 pr-3 text-right">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredTests.map((test) => (
                    <tr
                      key={test.id}
                      onClick={() => setSelectedDetailTest(test)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 pl-3">
                        <span className="font-bold text-white group-hover:text-orange-300 transition-colors block">
                          {test.test_name}
                        </span>
                        <span className="text-[10px] text-slate-500">{test.category || 'General'}</span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {test.value_str} <span className="text-[10px] text-slate-400 font-normal">{test.unit}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {test.reference_range || 'Not Specified'}
                      </td>

                      <td className="py-3 px-3">
                        {renderStatusBadge(test.status)}
                      </td>

                      <td className="py-3 pr-3 text-right">
                        <span className="text-slate-400 group-hover:text-orange-400 text-xs font-semibold inline-flex items-center gap-1">
                          Inspect <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTests.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No biomarkers match the filter or search criteria.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Test Detail Modal */}
      {selectedDetailTest && (
        <TestDetailModal
          test={selectedDetailTest}
          onClose={() => setSelectedDetailTest(null)}
        />
      )}
    </div>
  );
}
