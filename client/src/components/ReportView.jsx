import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  MessageSquare, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Stethoscope, 
  Calendar, 
  Building, 
  FileText, 
  Filter, 
  Search,
  Activity,
  Heart,
  ChevronRight,
  Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { reportAPI } from '../api';

export default function ReportView({ report, onBack, onOpenChat }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState(false);

  if (!report) return null;

  const biomarkers = report.biomarkers || [];

  // Parse JSON helper
  const parseJsonSafe = (str, fallback = []) => {
    if (Array.isArray(str)) return str;
    if (typeof str === 'string') {
      try {
        return JSON.parse(str);
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  const keyFindings = parseJsonSafe(report.key_findings);
  const doctorQuestions = parseJsonSafe(report.doctor_questions);
  const healthTips = parseJsonSafe(report.health_tips);

  const aboveRangeCount = biomarkers.filter(b => b.status === 'Above Range').length;
  const belowRangeCount = biomarkers.filter(b => b.status === 'Below Range').length;
  const withinRangeCount = biomarkers.filter(b => b.status === 'Within Range').length;
  const unableCount = biomarkers.filter(b => b.status === 'Unable to Determine').length;

  const filteredBiomarkers = biomarkers.filter(b => {
    const matchesStatus = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'ABOVE' ? b.status === 'Above Range' :
      filterStatus === 'BELOW' ? b.status === 'Below Range' :
      filterStatus === 'WITHIN' ? b.status === 'Within Range' :
      b.status === 'Unable to Determine';

    const matchesSearch = 
      b.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await reportAPI.downloadPdf(report.id, report.patient_name);
    } catch (err) {
      alert("Failed to download PDF summary.");
    } finally {
      setDownloading(false);
    }
  };

  // Status visual pill badge
  const renderStatusBadge = (status) => {
    if (status === 'Within Range') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Within Range
        </span>
      );
    } else if (status === 'Above Range') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <ArrowUp className="w-3.5 h-3.5" />
          Above Range
        </span>
      );
    } else if (status === 'Below Range') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <ArrowDown className="w-3.5 h-3.5" />
          Below Range
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-slate-400">
          <HelpCircle className="w-3.5 h-3.5" />
          Unable to Determine
        </span>
      );
    }
  };

  // Horizontal Range Visualizer Gauge
  const renderRangeVisualizer = (b) => {
    if (b.numeric_value === null || b.numeric_value === undefined) {
      return <span className="text-[11px] text-slate-500 italic">Qualitative value</span>;
    }

    const val = b.numeric_value;
    const min = b.min_range;
    const max = b.max_range;

    // Standard interval: min and max both exist
    if (min !== null && max !== null && max > min) {
      const span = max - min;
      const lowerDisplay = Math.max(0, min - span * 0.4);
      const upperDisplay = max + span * 0.4;
      const totalDisplay = upperDisplay - lowerDisplay;

      const normalLeftPercent = Math.max(0, ((min - lowerDisplay) / totalDisplay) * 100);
      const normalWidthPercent = Math.min(100 - normalLeftPercent, ((max - min) / totalDisplay) * 100);

      const markerPercent = Math.min(96, Math.max(4, ((val - lowerDisplay) / totalDisplay) * 100));

      const isNormal = val >= min && val <= max;
      const isAbove = val > max;

      return (
        <div className="w-full max-w-[220px]">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Low: {min}</span>
            <span>High: {max}</span>
          </div>
          <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            {/* Normal Range Band */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-500/60"
              style={{ left: `${normalLeftPercent}%`, width: `${normalWidthPercent}%` }}
              title={`Normal Band: ${min} - ${max}`}
            />
            {/* Measured Value Pin Marker */}
            <div
              className={`absolute top-0 bottom-0 w-2 rounded-full transform -translate-x-1/2 shadow-md ${
                isNormal ? 'bg-emerald-400' : isAbove ? 'bg-rose-500' : 'bg-amber-400'
              }`}
              style={{ left: `${markerPercent}%` }}
              title={`Measured: ${val} ${b.unit || ''}`}
            />
          </div>
        </div>
      );
    }

    // Upper bound only (< max)
    if (max !== null) {
      const percent = Math.min(95, Math.max(5, (val / (max * 1.5)) * 100));
      const isAbove = val > max;
      return (
        <div className="w-full max-w-[200px]">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>0</span>
            <span>Max: {max}</span>
          </div>
          <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-[66%] bg-emerald-500/30 border-r border-emerald-500/60" />
            <div
              className={`absolute top-0 bottom-0 w-2 rounded-full transform -translate-x-1/2 ${
                isAbove ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ left: `${percent}%` }}
            />
          </div>
        </div>
      );
    }

    // Lower bound only (> min)
    if (min !== null) {
      const isBelow = val < min;
      const percent = Math.min(95, Math.max(5, (val / (min * 2)) * 100));
      return (
        <div className="w-full max-w-[200px]">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Min: {min}</span>
            <span>Target</span>
          </div>
          <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute top-0 bottom-0 right-0 w-[66%] bg-emerald-500/30 border-l border-emerald-500/60" />
            <div
              className={`absolute top-0 bottom-0 w-2 rounded-full transform -translate-x-1/2 ${
                isBelow ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ left: `${percent}%` }}
            />
          </div>
        </div>
      );
    }

    return <span className="text-[11px] text-slate-400">Standard range reference</span>;
  };

  // Chart data: Distribution of findings
  const chartData = [
    { name: 'Within Range', count: withinRangeCount, fill: '#10b981' },
    { name: 'Above Range', count: aboveRangeCount, fill: '#f43f5e' },
    { name: 'Below Range', count: belowRangeCount, fill: '#f59e0b' },
    { name: 'Undetermined', count: unableCount, fill: '#64748b' }
  ].filter(d => d.count > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {report.patient_name || 'Patient Laboratory Analysis'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                {report.file_type} Verified
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
              {report.lab_name && (
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  {report.lab_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {report.report_date || new Date(report.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {report.original_name}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Chat With Report
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/40 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            {downloading ? 'Exporting...' : 'Download PDF Summary'}
          </button>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="my-6 p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300 font-bold">Informational Notice:</strong> MediLens provides educational summaries and biomarker reference range tracking. It does not provide medical diagnoses, prescribe treatments, or substitute for your physician’s clinical judgment. Please bring these findings to your doctor.
        </div>
      </div>

      {/* Clinical AI Summary & Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Narrative Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Patient-Friendly AI Clinical Summary</h2>
              <p className="text-xs text-slate-400">Synthesized overview of your laboratory panel</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {report.summary_text || "Automated clinical parsing complete. Review your extracted biomarker results below."}
          </p>

          {/* Key Out-of-Range Highlights */}
          {keyFindings && keyFindings.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Attention / Flagged Findings ({aboveRangeCount + belowRangeCount})
              </h3>
              <div className="space-y-2">
                {keyFindings.map((finding, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span>{finding}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Questions for Your Doctor */}
          {doctorQuestions && doctorQuestions.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                Recommended Questions to Ask Your Doctor
              </h3>
              <div className="space-y-2">
                {doctorQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/30 text-xs text-cyan-200/90 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-900/60 border border-cyan-700/50 flex items-center justify-center text-[10px] font-bold text-cyan-300 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel Distribution & Metrics Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Panel Overview</h2>
              <span className="text-xs text-slate-400">{biomarkers.length} tests</span>
            </div>

            {/* Quick Stat Numbers */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
                <span className="text-[11px] text-emerald-400 font-semibold block">Within Normal</span>
                <span className="text-2xl font-black text-emerald-300">{withinRangeCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40">
                <span className="text-[11px] text-rose-400 font-semibold block">Out of Range</span>
                <span className="text-2xl font-black text-rose-300">{aboveRangeCount + belowRangeCount}</span>
              </div>
            </div>

            {/* Recharts Bar Breakdown */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={85} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Chat Callout */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-3">Have questions about these specific results?</p>
            <button
              onClick={onOpenChat}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-700/50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask AI About This Report
            </button>
          </div>
        </div>
      </div>

      {/* Biomarker Table Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Extracted Biomarker Results ({filteredBiomarkers.length})</h2>
            <p className="text-xs text-slate-400">Values matched directly against report reference intervals</p>
          </div>

          {/* Search and Status Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search biomarker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterStatus === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All ({biomarkers.length})
              </button>
              <button
                onClick={() => setFilterStatus('ABOVE')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterStatus === 'ABOVE' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Above ({aboveRangeCount})
              </button>
              <button
                onClick={() => setFilterStatus('BELOW')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterStatus === 'BELOW' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Below ({belowRangeCount})
              </button>
              <button
                onClick={() => setFilterStatus('WITHIN')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterStatus === 'WITHIN' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Within ({withinRangeCount})
              </button>
            </div>
          </div>
        </div>

        {/* Structured Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Investigation / Test</th>
                <th className="pb-3 px-3">Measured Result</th>
                <th className="pb-3 px-3">Reference Interval</th>
                <th className="pb-3 px-3">Classification</th>
                <th className="pb-3 px-3 min-w-[200px]">Range Visualizer</th>
                <th className="pb-3 pr-2 text-right">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBiomarkers.map((b) => (
                <tr key={b.id} className="hover:bg-slate-850/40 transition-colors">
                  {/* Test Name & Category */}
                  <td className="py-3.5 pl-2">
                    <p className="font-bold text-white text-sm">{b.test_name}</p>
                    <span className="text-[11px] text-slate-400">{b.category}</span>
                  </td>

                  {/* Result & Unit */}
                  <td className="py-3.5 px-3">
                    <span className="text-sm font-black text-white">{b.value_str}</span>{' '}
                    <span className="text-xs text-slate-400">{b.unit || ''}</span>
                  </td>

                  {/* Reference Interval */}
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {b.reference_range || 'Standard'}
                  </td>

                  {/* Classification Badge */}
                  <td className="py-3.5 px-3">
                    {renderStatusBadge(b.status)}
                  </td>

                  {/* Visualizer Gauge */}
                  <td className="py-3.5 px-3">
                    {renderRangeVisualizer(b)}
                  </td>

                  {/* Page */}
                  <td className="py-3.5 pr-2 text-right text-slate-500 font-mono">
                    p. {b.page_number || 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
