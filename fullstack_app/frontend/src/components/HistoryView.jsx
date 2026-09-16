import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  TrendingUp, 
  Activity, 
  ChevronRight, 
  Download, 
  Trash2, 
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { reportAPI } from '../api';

export default function HistoryView({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBiomarkerTrend, setSelectedBiomarkerTrend] = useState('Glucose');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportAPI.listReports();
      setReports(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this report from history?")) {
      try {
        await reportAPI.deleteReport(id);
        fetchReports();
      } catch (err) {
        alert("Failed to delete report.");
      }
    }
  };

  const handleDownloadPdf = async (e, r) => {
    e.stopPropagation();
    try {
      await reportAPI.downloadPdf(r.id, r.patient_name);
    } catch (err) {
      alert("Failed to download PDF summary.");
    }
  };

  const filtered = reports.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
      (r.original_name && r.original_name.toLowerCase().includes(q)) ||
      (r.lab_name && r.lab_name.toLowerCase().includes(q))
    );
  });

  // Sample mock longitudinal trend data for visualization across test dates
  const trendData = [
    { date: 'Oct 2025', Glucose: 126, Cholesterol: 238, Hemoglobin: 13.8 },
    { date: 'Dec 2025', Glucose: 122, Cholesterol: 230, Hemoglobin: 14.0 },
    { date: 'Feb 2026', Glucose: 115, Cholesterol: 218, Hemoglobin: 14.1 },
    { date: 'Apr 2026', Glucose: 108, Cholesterol: 205, Hemoglobin: 14.2 },
    { date: 'Current', Glucose: 102, Cholesterol: 198, Hemoglobin: 14.4 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Medical Report Archive & Trends
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              {reports.length} Records
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Secure longitudinal history of your analyzed laboratory records and multi-visit biomarker tracking.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report archive..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Longitudinal Health Trend Card */}
      <div className="my-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Biomarker Health Trajectory</h2>
              <p className="text-xs text-slate-400">Historical trend across laboratory visits</p>
            </div>
          </div>

          {/* Biomarker Trend Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {['Glucose', 'Cholesterol', 'Hemoglobin'].map((bm) => (
              <button
                key={bm}
                onClick={() => setSelectedBiomarkerTrend(bm)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedBiomarkerTrend === bm 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {bm}
              </button>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey={selectedBiomarkerTrend}
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#0891b2', stroke: '#fff', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Table/Grid */}
      <h2 className="text-base font-bold text-white mb-4">Historical Archive</h2>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Activity className="w-8 h-8 mx-auto text-cyan-400 animate-spin mb-3" />
          <p className="text-sm">Fetching historical reports...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400">
          <p className="text-sm">No historical records found matching your query.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 pl-4">Patient / Subject</th>
                <th className="py-3.5 px-4">Original File</th>
                <th className="py-3.5 px-4">Diagnostic Lab</th>
                <th className="py-3.5 px-4">Exam Date</th>
                <th className="py-3.5 px-4">Biomarkers</th>
                <th className="py-3.5 px-4">Clinical Status</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => onSelectReport(report.id)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-4 pl-4 font-bold text-white text-sm">
                    {report.patient_name || 'Patient Record'}
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    <span className="truncate block max-w-xs">{report.original_name}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {report.lab_name || '-'}
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {report.report_date || new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 font-semibold text-cyan-300">
                    {report.total_biomarkers} Tests
                  </td>
                  <td className="py-4 px-4">
                    {report.abnormal_count > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                        <AlertTriangle className="w-3 h-3" />
                        {report.abnormal_count} Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        All Normal
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDownloadPdf(e, report)}
                        title="Download PDF"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, report.id)}
                        title="Delete Report"
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectReport(report.id)}
                        title="View Report"
                        className="p-1.5 text-cyan-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
