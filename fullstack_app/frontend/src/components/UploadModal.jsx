import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Cpu, 
  Activity, 
  ArrowRight,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { reportAPI } from '../api';

export default function UploadModal({ isOpen, onClose, onReportUploaded }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0=Upload, 1=Read, 2=Extract, 3=Analyze, 4=Summary, 5=Complete
  const [error, setError] = useState(null);
  const [analyzedReport, setAnalyzedReport] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const processSteps = [
    { num: '01', name: 'Upload', msg: 'Uploading medical document...' },
    { num: '02', name: 'Read Report', msg: 'Reading your report...' },
    { num: '03', name: 'Extract Data', msg: 'Extracting laboratory values...' },
    { num: '04', name: 'Analyze Results', msg: 'Organizing results...' },
    { num: '05', name: 'Generate Summary', msg: 'Generating summary...' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const validateFile = (selected) => {
    setError(null);
    if (!selected) return;
    const valid = ['.pdf', '.jpg', '.jpeg', '.png'];
    const name = selected.name.toLowerCase();
    if (!valid.some(ext => name.endsWith(ext))) {
      setError("Unsupported format. Please upload a PDF, JPG, JPEG, or PNG medical report.");
      return;
    }
    if (selected.size > 25 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 25 MB.");
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateFile(e.dataTransfer.files[0]);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setCurrentStepIndex(1);

    // Step animation cadence
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 1100);

    try {
      const data = await reportAPI.uploadReport(file);
      clearInterval(interval);
      setCurrentStepIndex(5); // Complete
      setAnalyzedReport(data);

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      clearInterval(interval);
      setUploading(false);
      setError(err.response?.data?.detail || "Failed to process document. Please ensure document is legible.");
    }
  };

  const handleFinish = () => {
    if (analyzedReport) {
      onReportUploaded(analyzedReport);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in text-left">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel border border-white/[0.1] bg-[#0d0f17]/95 shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-orange-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {uploading ? 'Processing Medical Document' : 'Analyze a Medical Report'}
              </h3>
              <p className="text-xs text-slate-400">
                {uploading ? 'Automated extraction & clinical range evaluation' : 'Upload your PDF or image medical report'}
              </p>
            </div>
          </div>

          {!uploading && (
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {!uploading ? (
          <div>
            {/* Drag & drop upload box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-orange-400 bg-orange-500/[0.08]' 
                  : file 
                    ? 'border-emerald-500/50 bg-emerald-500/[0.05]' 
                    : 'border-white/[0.12] hover:border-orange-500/50 bg-black/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && validateFile(e.target.files[0])}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-white break-all max-w-sm">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <span className="mt-3 text-xs text-orange-400 font-semibold hover:underline">Click to change file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-orange-400 mb-4 group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-base font-bold text-white">Drop your medical report here</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse from your device</p>

                  <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">PDF</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">JPG</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">PNG</span>
                    <span>Max 25 MB</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!file}
                onClick={startAnalysis}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start AI Analysis</span>
              </button>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* ANIMATED 5-STEP PROCESSING PIPELINE */
          /* ==================================================== */
          <div className="py-4 text-center">
            
            {/* Center Document Visualization */}
            <div className="relative w-24 h-32 rounded-2xl bg-black/60 border border-white/[0.12] mx-auto mb-6 flex flex-col items-center justify-center p-3 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent" />
              <FileText className="w-8 h-8 text-orange-400 mb-2 animate-pulse" />
              <div className="w-full space-y-1.5 opacity-60">
                <div className="w-full h-1 rounded bg-slate-600" />
                <div className="w-[80%] h-1 rounded bg-slate-600" />
                <div className="w-[60%] h-1 rounded bg-orange-400" />
              </div>

              {/* Glowing scanning bar */}
              {currentStepIndex < 5 && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-bounce shadow-md shadow-orange-500/80" />
              )}
            </div>

            {/* Current Status Message */}
            <div className="mb-8">
              <h4 className="text-lg font-black text-white tracking-tight">
                {currentStepIndex === 5 ? "Analysis Complete" : processSteps[Math.min(currentStepIndex - 1, 4)]?.msg}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {currentStepIndex === 5 ? "All biomarkers extracted and evaluated against reference intervals." : "Please keep this window open while MediLens processes your report."}
              </p>
            </div>

            {/* 5-Step Progress Indicators */}
            <div className="space-y-2.5 max-w-md mx-auto text-left mb-8">
              {processSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isDone = currentStepIndex > stepNum;
                const isCurrent = currentStepIndex === stepNum;

                return (
                  <div
                    key={step.num}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isDone 
                        ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300' 
                        : isCurrent 
                          ? 'border-orange-500/60 bg-orange-500/[0.08] text-white shadow-md shadow-orange-500/10' 
                          : 'border-white/[0.05] bg-black/20 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold opacity-60">{step.num}</span>
                      <span className={`text-xs font-bold ${isCurrent ? 'text-orange-300' : isDone ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {step.name}
                      </span>
                    </div>

                    <div>
                      {isDone ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View Report Final CTA */}
            {currentStepIndex === 5 && (
              <button
                onClick={handleFinish}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-xl shadow-orange-500/30 transition-all cursor-pointer transform active:scale-95 animate-fade-in"
              >
                <span>View Medical Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
