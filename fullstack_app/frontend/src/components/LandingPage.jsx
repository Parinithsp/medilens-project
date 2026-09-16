import React, { useState, useRef } from 'react';
import { 
  Activity, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Search, 
  BarChart3, 
  MessageSquare, 
  Download, 
  Lock, 
  Sparkles, 
  ChevronDown, 
  HelpCircle, 
  Stethoscope, 
  Layers, 
  FileCheck, 
  Image as ImageIcon,
  Check,
  TrendingUp,
  Sliders,
  Database,
  Eye,
  Trash2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function LandingPage({ 
  onOpenUpload, 
  onLoadDemo, 
  onViewReport,
  onSelectTest,
  onNavigateToLogin,
  onNavigateToSignUp
}) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState('all');

  const toggleFaq = (idx) => setActiveFaq(activeFaq === idx ? null : idx);

  // Sample analytics line chart for Bento card
  const miniChartData = [
    { month: 'Jan', val: 11.2 },
    { month: 'Mar', val: 11.8 },
    { month: 'Jun', val: 12.3 },
    { month: 'Sep', val: 12.8 },
    { month: 'Nov', val: 13.5 }
  ];

  return (
    <div className="relative pt-24 pb-20 overflow-hidden">
      {/* ==================================================== */}
      {/* 1. HERO SECTION */}
      {/* ==================================================== */}
      <section className="relative min-h-[90vh] flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 text-left z-10">
            {/* Small top label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wider uppercase mb-6 shadow-sm shadow-orange-500/10">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>AI Medical Report Analysis</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight text-white leading-[1.08] mb-6">
              Understand Your <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-purple-400 bg-clip-text text-transparent">
                Medical Reports.
              </span> <br />
              Simply.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-8">
              MediLens transforms complicated medical reports into clear, organized and understandable information using AI-powered document processing.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Analyze a Report</span>
              </button>

              <button
                onClick={onLoadDemo}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-orange-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Try Demo Report</span>
              </button>
            </div>

            {/* Quick security badges */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PDF, JPG, JPEG, PNG
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-orange-400" /> Tesseract OCR + PyMuPDF
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" /> 100% Software-Based
              </span>
            </div>
          </div>

          {/* Right Hero: 3D DNA Foreground Floating Dashboard Cards */}
          <div className="lg:col-span-6 relative h-[500px] sm:h-[580px] w-full flex items-center justify-center pointer-events-auto">
            {/* Ambient coral & purple back-glows */}
            <div className="absolute w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute w-72 h-72 bg-purple-600/10 rounded-full blur-3xl translate-x-20 translate-y-20 pointer-events-none" />

            {/* Floating Card 1: Hemoglobin (Below Range) */}
            <div 
              onClick={() => onSelectTest({ test_name: 'Hemoglobin', value_str: '11.2', unit: 'g/dL', reference_range: '12.0 - 16.0', status: 'Below Range', category: 'Complete Blood Count' })}
              className="absolute top-8 left-4 sm:left-8 p-4 rounded-2xl glass-panel border border-orange-500/30 shadow-xl shadow-black/60 cursor-pointer card-hover-glow animate-float-slow w-48 sm:w-56 text-left z-20"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Complete Blood Count</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Below Range
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">HEMOGLOBIN</h4>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-white">11.2</span>
                <span className="text-xs text-slate-400">g/dL</span>
              </div>
              <div className="mt-2 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[35%]" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Ref: 12.0 - 16.0 g/dL</span>
            </div>

            {/* Floating Card 2: WBC (Within Range) */}
            <div 
              onClick={() => onSelectTest({ test_name: 'White Blood Cells (WBC)', value_str: '8,500', unit: '/µL', reference_range: '4,000 - 11,000', status: 'Within Range', category: 'Complete Blood Count' })}
              className="absolute top-36 right-2 sm:right-6 p-4 rounded-2xl glass-panel border border-emerald-500/30 shadow-xl shadow-black/60 cursor-pointer card-hover-glow animate-float-reverse w-48 sm:w-56 text-left z-20"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Immune Cells</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Within Range
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">WBC</h4>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-white">8,500</span>
                <span className="text-xs text-slate-400">/µL</span>
              </div>
              <div className="mt-2 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[60%]" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Ref: 4,000 - 11,000 /µL</span>
            </div>

            {/* Floating Card 3: AI Summary Card */}
            <div className="absolute bottom-10 left-2 sm:left-12 p-5 rounded-2xl glass-panel border border-white/[0.08] shadow-2xl shadow-black/80 w-64 sm:w-72 text-left z-20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI SUMMARY</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Most results are within the provided reference ranges. Flagged values should be reviewed with your doctor.
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-orange-400 font-semibold">
                <span>Confidence: 98%</span>
                <span className="flex items-center gap-1">Verified <Check className="w-3 h-3" /></span>
              </div>
            </div>

            {/* Floating Card 4: Analysis Progress */}
            <div className="absolute bottom-28 right-4 sm:right-10 p-3.5 rounded-2xl glass-panel border border-purple-500/30 shadow-xl shadow-black/60 w-44 text-left z-20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-purple-300 uppercase">Analysis State</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs font-bold text-white">24 Tests Parsed</p>
              <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-purple-500 h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. HOW IT WORKS SECTION */}
      {/* ==================================================== */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 block">
            Automated Clinical Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            From Medical Report to Clear Understanding
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Four seamless software steps transform raw lab paperwork and scanned images into categorized health intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {/* Step 01 */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/40 transition-all card-hover-glow group">
            <div className="text-3xl font-black text-orange-500/40 group-hover:text-orange-400 transition-colors mb-3">
              01
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">UPLOAD</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Upload PDF, JPG, JPEG or PNG medical reports directly from your phone, scanner, or laboratory portal.
            </p>
          </div>

          {/* Step 02 */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/40 transition-all card-hover-glow group">
            <div className="text-3xl font-black text-purple-500/40 group-hover:text-purple-400 transition-colors mb-3">
              02
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">EXTRACT</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Extract test names, values, units and reference ranges using PyMuPDF vector streams or OpenCV + Tesseract OCR.
            </p>
          </div>

          {/* Step 03 */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/40 transition-all card-hover-glow group">
            <div className="text-3xl font-black text-amber-500/40 group-hover:text-amber-400 transition-colors mb-3">
              03
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">ANALYZE</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Organize results and identify values outside the reference ranges shown on the report (Within, Above, or Below Range).
            </p>
          </div>

          {/* Step 04 */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/40 transition-all card-hover-glow group">
            <div className="text-3xl font-black text-emerald-500/40 group-hover:text-emerald-400 transition-colors mb-3">
              04
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">UNDERSTAND</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Generate a simple AI-powered explanation with tailored questions to bring to your doctor's consultation.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. ASYMMETRIC BENTO FEATURES GRID */}
      {/* ==================================================== */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 block">
            Engineered For Health Literacy
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Features Designed for Clarity & Action
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Feature 01: AI Report Summary (Span 7) */}
          <div className="md:col-span-7 p-7 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/30 transition-all card-hover-glow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  Feature 01
                </span>
                <span className="text-xs text-slate-400">Natural Language Synthesis</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2">AI Report Summary</h3>
              <p className="text-xs text-orange-300 font-semibold mb-3">
                "Your report contains 24 detected measurements."
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                MediLens synthesizes the entire panel into everyday English. It explains baseline organ stability and flags tests requiring discussion without confusing medical jargon.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-400">Doctor discussion guide included automatically.</span>
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                Plain English <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Feature 02: Smart Test Extraction Table (Span 5) */}
          <div className="md:col-span-5 p-7 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/30 transition-all card-hover-glow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Feature 02
              </span>
              <span className="text-xs text-slate-400">High-Precision OCR</span>
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight mb-3">Smart Test Extraction</h3>
            
            {/* Interactive Mini-table */}
            <div className="space-y-2 mt-4">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Hemoglobin</p>
                  <span className="text-[10px] text-slate-400">11.2 g/dL</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Below Range
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">WBC</p>
                  <span className="text-[10px] text-slate-400">8,500 /µL</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Within Range
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Platelets</p>
                  <span className="text-[10px] text-slate-400">250,000 /µL</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Within Range
                </span>
              </div>
            </div>
          </div>

          {/* Feature 03: Visual Analytics (Span 4) */}
          <div className="md:col-span-4 p-7 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/30 transition-all card-hover-glow">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 block w-fit mb-3">
              Feature 03
            </span>
            <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">Visual Analytics</h3>
            <p className="text-xs text-slate-400 mb-4">Track biomarker progression across historical visits.</p>

            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChartData}>
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="val" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#ea580c', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature 04: Ask MediLens (Span 4) */}
          <div className="md:col-span-4 p-7 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/30 transition-all card-hover-glow">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 block w-fit mb-3">
              Feature 04
            </span>
            <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">Ask MediLens</h3>
            <p className="text-xs text-slate-400 mb-3">Conversational AI assistant grounded in your report.</p>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-xs space-y-2">
              <div className="p-2 rounded-xl bg-orange-500/15 text-orange-200 text-[11px]">
                "What does my elevated glucose mean?"
              </div>
              <div className="p-2 rounded-xl bg-white/[0.04] text-slate-300 text-[11px]">
                Your glucose is 118 mg/dL. Discuss diet and fasting habits with your physician.
              </div>
            </div>
          </div>

          {/* Feature 05: Report Comparison & Privacy (Span 4) */}
          <div className="md:col-span-4 p-7 rounded-3xl glass-panel border border-white/[0.08] hover:border-orange-500/30 transition-all card-hover-glow flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 block w-fit mb-3">
                Feature 05 & 06
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">Compare & Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Compare multi-year lab reports side by side. Isolated local processing guarantees your medical files remain private.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06] text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Zero external model training on your personal health files.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. ANALYZE REPORT SECTION (Interactive Upload) */}
      {/* ==================================================== */}
      <section id="analyze" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 block">
          Immediate Processing
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Analyze a Medical Report
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10">
          Upload any medical lab document. MediLens extracts values, determines reference ranges, and provides patient-friendly summaries.
        </p>

        {/* Large Premium Drag & Drop Upload Card */}
        <div 
          onClick={onOpenUpload}
          className="group relative p-10 sm:p-14 rounded-3xl glass-panel border-2 border-dashed border-white/[0.12] hover:border-orange-500/60 bg-gradient-to-b from-white/[0.02] to-black/40 hover:from-orange-500/[0.03] transition-all cursor-pointer shadow-2xl shadow-black/80"
        >
          {/* Floating glow accent on hover */}
          <div className="absolute inset-0 rounded-3xl bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto mb-5 group-hover:scale-110 group-hover:border-orange-400 transition-transform shadow-lg shadow-orange-500/20">
            <Upload className="w-8 h-8 animate-bounce" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
            Drop your medical report here
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            or click to browse from your device
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 mb-8">
            <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06]">PDF</span>
            <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06]">JPG</span>
            <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06]">JPEG</span>
            <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06]">PNG</span>
            <span className="text-slate-600">•</span>
            <span>Max 25 MB</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); onOpenUpload(); }}
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              Browse Files
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onLoadDemo(); }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-orange-500/40 transition-all cursor-pointer"
            >
              Try Demo Report (Instant)
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 5. PRIVACY SECTION */}
      {/* ==================================================== */}
      <section id="privacy" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 block">
            HIPAA-Grade Security Philosophy
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Your Health Information. Your Control.
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            We believe personal medical records demand strict security and absolute transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
            <Lock className="w-6 h-6 text-orange-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Private Documents</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your uploaded lab PDFs and images are processed in isolated memory without public exposure.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
            <Cpu className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Secure Processing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OCR and data extraction execute on secured servers. No data is used to train public models.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
            <Eye className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">User-Controlled</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You maintain 100% control over your report history, extracted biomarkers, and generated summaries.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
            <Trash2 className="w-6 h-6 text-rose-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Delete Anytime</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permanently erase your reports, chats, and biomarker logs at any moment with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 6. FAQ ACCORDION */}
      {/* ==================================================== */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 block">Common Questions</span>
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3.5">
          {[
            {
              q: "What file formats can I upload to MediLens?",
              a: "MediLens accepts PDF files (including vector digital reports and scanned sheets) as well as JPG, JPEG, and PNG images. It runs dual extraction using PyMuPDF and Tesseract OCR with OpenCV adaptive image filtering."
            },
            {
              q: "How are biological reference ranges evaluated?",
              a: "MediLens reads the exact numeric value and biological reference interval printed on your physical lab paper. It strictly classifies results as Within Range, Below Range, Above Range, or Unable to Determine without guessing."
            },
            {
              q: "Can MediLens replace my physician or provide a diagnosis?",
              a: "No. MediLens is strictly an educational tool to enhance patient health literacy and help you prepare for doctor appointments. It never diagnoses diseases, prescribes medications, or replaces licensed healthcare providers."
            },
            {
              q: "Can I download a printable summary for my next doctor visit?",
              a: "Yes! With one click, MediLens generates a doctor-ready PDF summary powered by ReportLab, containing patient metadata, extracted tables, and questions for your doctor."
            }
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl glass-panel border border-white/[0.07] overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-white font-semibold text-sm focus:outline-none cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-orange-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-400 border-t border-white/[0.05] pt-3 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 7. MANDATORY CLINICAL SAFETY NOTICE & FOOTER */}
      {/* ==================================================== */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="p-6 rounded-3xl bg-orange-950/20 border border-orange-500/30">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-orange-300 font-bold block mb-1">MANDATORY CLINICAL & EDUCATIONAL DISCLAIMER</strong>
              MediLens provides informational and educational assistance for understanding medical reports. It does not provide medical diagnosis, treatment, or professional medical advice. Reference ranges may vary between laboratories and individuals. Discuss your results and concerns with a qualified healthcare professional.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] pt-10 pb-16 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <span className="font-extrabold text-white">MediLens</span>
            <span>© 2026 MediLens Health Technologies. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-slate-300">How It Works</a>
            <a href="#features" className="hover:text-slate-300">Features</a>
            <a href="#privacy" className="hover:text-slate-300">Privacy</a>
            {onNavigateToLogin && (
              <button 
                onClick={onNavigateToLogin} 
                className="hover:text-orange-400 text-slate-400 font-semibold cursor-pointer transition-colors"
              >
                Sign In
              </button>
            )}
            {onNavigateToSignUp && (
              <button 
                onClick={onNavigateToSignUp} 
                className="hover:text-orange-400 text-slate-400 font-semibold cursor-pointer transition-colors"
              >
                Create Account
              </button>
            )}
            <span className="hidden md:inline">100% Software-Based Health SaaS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
