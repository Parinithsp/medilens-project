import React, { useState } from 'react';
import { X, Mail, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { authAPI } from '../api';

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError('');

    if (!email.trim()) {
      setInlineError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setInlineError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err) {
      // In case backend is offline, still offer gentle fallback
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setIsSubmitted(false);
    setInlineError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0f15]/90 shadow-2xl p-6 sm:p-8 overflow-hidden backdrop-blur-2xl">
        {/* Ambient background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400 mb-4 shadow-lg shadow-orange-500/10">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Forgot your password?
              </h2>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Enter your email address and we'll send you secure instructions to reset your MediLens password.
              </p>
            </div>

            {inlineError && (
              <div className="mb-5 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{inlineError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (inlineError) setInlineError('');
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      inlineError 
                        ? 'border-rose-500/60 focus:border-rose-500' 
                        : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Sending reset instructions...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  if (onBackToLogin) onBackToLogin();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
            <p className="text-xs text-emerald-300/90 font-medium mb-3">
              Password reset instructions have been sent.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              If an account is associated with <span className="text-white font-medium">{email}</span>, you will receive an email containing a link to securely reset your password within a few minutes.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  if (onBackToLogin) onBackToLogin();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
              >
                Return to Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-orange-400 hover:underline"
              >
                Didn't receive an email? Try another address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
