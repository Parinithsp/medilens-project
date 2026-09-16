import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  Download, 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  Search, 
  ChevronRight, 
  Trash2,
  Eye,
  Clock,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { reportAPI } from '../api';
import Sidebar from './Sidebar';

export default function ReportDashboard({ 
  user,
  onOpenUpload, 
  onSelectReport, 
  onOpenChat, 
  onViewTrends, 
  onViewMyReports,
  onLoadDemo,
  onNavigate,
  onLogout,
  showToast 
}) {
  const [stats, setStats] = useState({ 
    total_reports: 0, 
    total_biomarkers: 0, 
    abnormal_biomarkers: 0, 
    recent_reports: [] 
  });
  const [loading, setLoading] = useState(true);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await reportAPI.getDashboardStats();
      setStats(data || { 
        total_reports: 0, 
        total_biomarkers: 0, 
        abnormal_biomarkers: 0, 
        recent_reports: [] 
      });
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      setReportToDelete(null);
      if (showToast) {
        showToast({ type: 'success', message: 'Report removed from your account.' });
      }
      fetchDashboardData();
    } catch (err) {
      if (showToast) {
        showToast({ type: 'error', message: 'Failed to delete report.' });
      }
    } finally {
      setDeleting(false);
    }
  };

  const latestReport = stats.recent_reports?.[0];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Column (Col 3) */}
        <div className="lg:col-span-3">
          <Sidebar
            currentView="dashboard"
            onNavigate={onNavigate || onViewMyReports}
            onOpenUpload={onOpenUpload}
            onLoadDemo={onLoadDemo}
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Main Dashboard Column (Col 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top Welcome & CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                  Clinical Overview
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Protected Tenant
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {stats.total_reports > 0 
                  ? `You have ${stats.total_reports} medical ${stats.total_reports === 1 ? 'report' : 'reports'} stored securely in your account.`
                  : 'Start your medical journey by analyzing your first laboratory document.'
                }
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {stats.total_reports > 0 && (
                <button
                  onClick={onOpenChat}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask MediLens</span>
                </button>
              )}

              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Report</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Reports Analyzed</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                {loading ? '...' : stats.total_reports}
              </p>
              <span className="text-[10px] text-slate-500">Your secure records</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Test Results</span>
              <p className="text-2xl sm:text-3xl font-black text-orange-400 mt-1">
                {loading ? '...' : stats.total_biomarkers}
              </p>
              <span className="text-[10px] text-slate-500">Biomarkers parsed</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Flagged Results</span>
              <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
                {loading ? '...' : stats.abnormal_biomarkers}
              </p>
              <span className="text-[10px] text-slate-500">Outside standard bounds</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Latest Report</span>
              <p className="text-base sm:text-lg font-black text-white mt-2 truncate">
                {loading ? '...' : (latestReport?.report_date || '—')}
              </p>
              <span className="text-[10px] text-slate-500 truncate block">
                {latestReport?.lab_name || 'No records yet'}
              </span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <Activity className="w-8 h-8 mx-auto text-orange-400 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading dashboard...</p>
            </div>
          ) : stats.total_reports === 0 ? (
            /* Requirement 2: Empty state for 0 reports */
            <div className="p-10 sm:p-14 rounded-3xl glass-panel border border-white/[0.08] text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500/20 via-amber-500/15 to-purple-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-2xl shadow-orange-500/10">
                <FileText className="w-10 h-10 animate-pulse" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  Your report journey starts here.
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload your first medical report to begin. MediLens will extract all biomarker numbers, compare them against reference ranges, and generate patient-friendly clinical summaries.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onOpenUpload}
                  className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-400 shadow-xl shadow-orange-500/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Analyze Your First Report</span>
                </button>

                {onLoadDemo && (
                  <button
                    onClick={onLoadDemo}
                    className="px-5 py-3 rounded-2xl text-xs font-bold text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Try Demo Report</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Existing User: Reports & Latest Report Preview */
            <div className="space-y-6">
              
              {/* Latest Report Feature Card */}
              {latestReport && (
                <div className="p-6 rounded-3xl glass-panel border border-orange-500/25 shadow-2xl relative overflow-hidden text-left">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-orange-400 tracking-wider">Most Recent Analysis</span>
                        <h3 className="text-base font-bold text-white tracking-tight">{latestReport.original_name}</h3>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectReport(latestReport)}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Analysis</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {latestReport.report_date} • {latestReport.lab_name}
                    </span>
                    <span className="font-semibold text-white">
                      {latestReport.total_biomarkers} Biomarkers ({latestReport.abnormal_count} Outside Range)
                    </span>
                  </div>
                </div>
              )}

              {/* Recent Reports List Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Reports</h3>
                  <p className="text-xs text-slate-400">Isolated medical documents belonging to your account</p>
                </div>

                <button
                  onClick={onViewMyReports}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Reports</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reports Grid (Non-overlapping separate cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recent_reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onSelectReport(r)}
                    className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/40 shadow-xl hover:shadow-orange-500/10 cursor-pointer card-hover-glow transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                          {r.file_type || 'PDF'}
                        </span>
                        {r.abnormal_count > 0 ? (
                          <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {r.abnormal_count} Flagged
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Normal
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-1 hover:text-orange-300 transition-colors">
                        {r.original_name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{r.lab_name}</p>

                      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                        <span>{r.report_date}</span>
                        <span className="font-semibold text-white">{r.total_biomarkers} Tests</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDownloadPdf(e, r)}
                          disabled={downloadingId === r.id}
                          title="Download PDF"
                          className="p-1.5 text-slate-400 hover:text-orange-400 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                        >
                          {downloadingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportToDelete(r);
                          }}
                          title="Delete Report"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
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
