import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Upload,
  Activity,
  Loader2,
  X
} from 'lucide-react';
import { reportAPI } from '../api';
import Sidebar from './Sidebar';

export default function MyReports({ 
  user,
  onSelectReport, 
  onBack, 
  onOpenUpload, 
  onLoadDemo,
  onNavigate,
  onLogout,
  showToast 
}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // Delete modal state
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportAPI.listReports();
      setReports(data || []);
      if (data && data.length >= 2) {
        setSelectedForCompare([data[0].id, data[1].id]);
      }
    } catch (err) {
      console.error("Failed to load user reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleToggleCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      if (selectedForCompare.length > 1) {
        setSelectedForCompare(selectedForCompare.filter(i => i !== id));
      }
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const handleDownloadPdf = async (e, r) => {
    e.stopPropagation();
    try {
      setDownloadingId(r.id);
      await reportAPI.downloadPdf(r.id, r.patient_name || r.original_name);
      if (showToast) {
        showToast({ type: 'success', message: `Downloaded PDF summary for ${r.original_name}` });
      }
    } catch (err) {
      if (showToast) {
        showToast({ type: 'error', message: 'Failed to download PDF summary.' });
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    setDeleting(true);
    try {
      await reportAPI.deleteReport(reportToDelete.id);
      setReports(prev => prev.filter(item => item.id !== reportToDelete.id));
      setReportToDelete(null);
      if (showToast) {
        showToast({ type: 'success', message: 'Report removed from your account.' });
      }
    } catch (err) {
      if (showToast) {
        showToast({ type: 'error', message: 'Failed to delete report.' });
      }
    } finally {
      setDeleting(false);
    }
  };

  const filtered = reports.filter(r => {
    const title = (r.original_name || r.patient_name || '').toLowerCase();
    const lab = (r.lab_name || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = title.includes(q) || lab.includes(q);
    const matchesType = filterType === 'ALL' ? true : r.file_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Column (Col 3) */}
        <div className="lg:col-span-3">
          <Sidebar
            currentView="my-reports"
            onNavigate={onNavigate || onBack}
            onOpenUpload={onOpenUpload}
            onLoadDemo={onLoadDemo}
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Main Reports Column (Col 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-400 block mb-1">
                  Document Archive
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  My Reports
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {reports.length > 1 && (
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    compareMode 
                      ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg shadow-orange-500/25' 
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>{compareMode ? 'Exit Comparison' : 'Compare Reports'}</span>
                </button>
              )}

              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <Activity className="w-8 h-8 mx-auto text-orange-400 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading user reports...</p>
            </div>
          ) : reports.length === 0 ? (
            /* Requirement 20: Beautiful Empty State */
            <div className="p-12 rounded-3xl glass-panel border border-white/[0.08] text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-xl shadow-orange-500/10">
                <FileText className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">No reports yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Upload your first medical report and MediLens will organize the information for you.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onOpenUpload}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Analyze Your First Report</span>
                </button>

                {onLoadDemo && (
                  <button
                    onClick={onLoadDemo}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Try Demo Report</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Reports List & Filter */
            <div>
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title or lab..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-xs font-semibold">
                  {['ALL', 'PDF', 'Image'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        filterType === type ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {type === 'ALL' ? 'All Formats' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requirement 6: Separate Cards, Non-overlapping responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((r, index) => (
                  <div
                    key={r.id}
                    onClick={() => onSelectReport(r)}
                    className="p-6 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/40 shadow-xl hover:shadow-orange-500/10 cursor-pointer card-hover-glow transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                            {r.file_type || 'PDF'}
                          </span>
                          {r.report_type === 'FICTIONAL DEMO DATA' && (
                            <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Demo
                            </span>
                          )}
                        </div>

                        {r.abnormal_count > 0 ? (
                          <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {r.abnormal_count} Flagged
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            All Within Range
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white hover:text-orange-300 transition-colors line-clamp-2">
                        {r.original_name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{r.lab_name || 'Metropolis Clinical Diagnostics'}</p>

                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {r.report_date || 'Recent'}
                        </span>
                        <span className="font-semibold text-white">{r.total_biomarkers} Tests</span>
                      </div>
                    </div>

                    {/* Action Buttons: View, Download, Delete */}
                    <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <button
                        onClick={() => onSelectReport(r)}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDownloadPdf(e, r)}
                          disabled={downloadingId === r.id}
                          title="Download PDF"
                          className="p-2 text-slate-400 hover:text-orange-400 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
                        >
                          {downloadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportToDelete(r);
                          }}
                          title="Delete Report"
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Requirement 7: Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/[0.1] bg-[#0d0f17]/95 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete this report?</h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{reportToDelete.original_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              This report and its associated analysis will be removed from your account.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReport}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
