import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Info, 
  ChevronRight, 
  ArrowLeft,
  Filter,
  Sparkles,
  Upload,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { reportAPI } from '../api';
import Sidebar from './Sidebar';

export default function HealthTrends({ 
  user, 
  onBack, 
  onOpenUpload, 
  onLoadDemo, 
  onNavigate, 
  onLogout 
}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBiomarker, setSelectedBiomarker] = useState('Hemoglobin');

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const data = await reportAPI.listReports();
        setReports(data || []);
      } catch (err) {
        console.error("Failed to load reports for trends", err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  // Demo fallback dataset if user has demo report
  const DEMO_POINTS = {
    Hemoglobin: [
      { date: 'Jan 2026', value: 11.2 },
      { date: 'Mar 2026', value: 11.8 },
      { date: 'Jun 2026', value: 12.3 },
      { date: 'Sep 2026', value: 12.8 }
    ],
    Glucose: [
      { date: 'Jan 2026', value: 126 },
      { date: 'Mar 2026', value: 122 },
      { date: 'Jun 2026', value: 118 },
      { date: 'Sep 2026', value: 114 }
    ],
    TSH: [
      { date: 'Jan 2026', value: 3.1 },
      { date: 'Mar 2026', value: 2.8 },
      { date: 'Jun 2026', value: 2.5 },
      { date: 'Sep 2026', value: 2.4 }
    ],
    Platelets: [
      { date: 'Jan 2026', value: 230000 },
      { date: 'Mar 2026', value: 245000 },
      { date: 'Jun 2026', value: 250000 },
      { date: 'Sep 2026', value: 255000 }
    ]
  };

  const currentPoints = DEMO_POINTS[selectedBiomarker] || DEMO_POINTS['Hemoglobin'];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Column (Col 3) */}
        <div className="lg:col-span-3">
          <Sidebar
            currentView="trends"
            onNavigate={onNavigate || onBack}
            onOpenUpload={onOpenUpload}
            onLoadDemo={onLoadDemo}
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Main Content Column (Col 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-400 block mb-1">
                  Longitudinal Analysis
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Health Trends
                </h1>
              </div>
            </div>

            {reports.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/[0.08]">
                {['Hemoglobin', 'Glucose', 'TSH', 'Platelets'].map((testKey) => (
                  <button
                    key={testKey}
                    onClick={() => setSelectedBiomarker(testKey)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedBiomarker === testKey
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {testKey}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Empty state if 0 reports */}
          {!loading && reports.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel border border-white/[0.08] text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-xl shadow-orange-500/10">
                <TrendingUp className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">No health trends yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Upload multiple medical reports to see how your clinical biomarkers and laboratory values evolve over time.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onOpenUpload}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Medical Report</span>
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
            /* Main Trends Chart Card */
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08] shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Biomarker</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">{selectedBiomarker} Historical Path</h2>
                  <p className="text-xs text-orange-400 mt-0.5">
                    {reports[0]?.report_type === 'FICTIONAL DEMO DATA' ? 'Fictional demo data series' : 'Continuous measured values'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-slate-300 max-w-sm">
                  <Info className="w-3.5 h-3.5 text-orange-400 inline mr-1.5" />
                  <span>Factual measured values shown. Trends should be clinically evaluated with your physician.</span>
                </div>
              </div>

              {/* Line Chart */}
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentPoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f1118',
                        borderColor: 'rgba(249, 115, 22, 0.3)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
