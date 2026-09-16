import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in pointer-events-auto">
      <div 
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
          isSuccess 
            ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-500/10' 
            : isError 
              ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-500/10' 
              : 'bg-slate-900/95 border-orange-500/40 text-slate-100 shadow-orange-500/10'
        }`}
      >
        <div className={`p-1.5 rounded-xl shrink-0 ${
          isSuccess 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : isError 
              ? 'bg-rose-500/20 text-rose-400' 
              : 'bg-orange-500/20 text-orange-400'
        }`}>
          {isSuccess && <CheckCircle2 className="w-5 h-5" />}
          {isError && <AlertCircle className="w-5 h-5" />}
          {!isSuccess && !isError && <Info className="w-5 h-5" />}
        </div>

        <div className="flex-1 pr-2">
          <p className="text-xs font-semibold tracking-wide">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
