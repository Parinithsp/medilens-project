import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Trash2, 
  Download, 
  Calendar, 
  Sparkles,
  TrendingUp,
  FileCheck,
  Search,
  ExternalLink
} from 'lucide-react';
import { reportAPI } from '../api';

export default function Dashboard({ onOpenUpload, onSelectReport, onLoadSample }) {
  const [stats, setStats] = useState({ total_reports: 0, total_biomarkers: 0, abnormal_biomarkers: 0, recent_reports: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await reportAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async (e, reportId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this report record?")) {
      try {
        await reportAPI.deleteReport(reportId);
        fetchStats();
      } catch (err) {
        alert("Failed to delete report.");
      }
    }
  };

  const handleDownloadPdf = async (e, report) => {
    e.stopPropagation();
    try {
      await reportAPI.downloadPdf(report.id, report.patient_name);
    } catch (err) {
      alert("Failed to download PDF summary.");
    }
  };

  const filteredReports = (stats.recent_reports || []).filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
      (r.original_name && r.original_name.toLowerCase().includes(q)) ||
      (r.lab_name && r.lab_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Clinical Intelligence Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              Live Monitor
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Review your uploaded laboratory reports, biomarker classifications, and AI summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Upload New Report
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-700/40 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">{stats.total_reports}</span>
            <span className="text-xs text-slate-400">analyzed</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">PDF and image format documents</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Biomarkers Tracked</span>
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-700/40 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-cyan-400">{stats.total_biomarkers}</span>
            <span className="text-xs text-slate-400">parameters</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Across CBC, Lipids, CMP, LFT panels</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Range Flags</span>
            <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-700/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-rose-400">{stats.abnormal_biomarkers}</span>
            <span className="text-xs text-slate-400">flagged tests</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Identified above or below normal reference</p>
        </div>
      </div>

      {/* Reports Section Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Recent Laboratory Reports</h2>
          <p className="text-xs text-slate-400">Click any report to open full clinical analysis, interactive range bars, and AI Q&A chat.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient or test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Activity className="w-8 h-8 mx-auto text-cyan-400 animate-spin mb-3" />
          <p className="text-sm">Loading health records...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Medical Reports Uploaded Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
            Upload your medical report in PDF, JPG, JPEG, or PNG format to begin automated clinical biomarker extraction and AI analysis.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20"
            >
              <Upload className="w-4 h-4" />
              Upload Medical Report
            </button>
            <button
              onClick={() => onLoadSample('metabolic')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Load Sample Report
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      {report.file_type === 'PDF' ? <FileText className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cyan-400 tracking-wide uppercase">
                        {report.file_type} Report
                      </span>
                      <p className="text-[11px] text-slate-500">ID: ML-{report.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>

                  {report.abnormal_count > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 border border-rose-500/30 text-rose-300">
                      <AlertTriangle className="w-3 h-3" />
                      {report.abnormal_count} Flagged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      All Normal
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {report.patient_name || 'Patient Record'}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5" title={report.original_name}>
                  {report.original_name}
                </p>

                {report.lab_name && (
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{report.lab_name}</span>
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {report.report_date || new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-slate-300">
                    {report.total_biomarkers} Tests Evaluated
                  </span>
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Open Analysis <ChevronRight className="w-3.5 h-3.5" />
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDownloadPdf(e, report)}
                    title="Download ReportLab PDF Summary"
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, report.id)}
                    title="Delete Report"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
