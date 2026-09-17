import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles, Activity, AlertCircle, Zap } from 'lucide-react';
import { authAPI } from '../api';
import { signInWithGooglePopup, mapFirebaseAuthError, isFirebaseConfigured } from '../firebase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await authAPI.login(email, password);
      } else {
        data = await authAPI.register(email, password, fullName);
      }
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured. Please add VITE_FIREBASE_* variables to client/.env.");
      return;
    }

    setGoogleLoading(true);
    try {
      const googleResult = await signInWithGooglePopup();
      const authData = await authAPI.googleLogin({
        idToken: googleResult.idToken,
        email: googleResult.email,
        fullName: googleResult.displayName,
        photoUrl: googleResult.photoURL
      });
      onAuthSuccess(authData.user);
      onClose();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      setError(mapFirebaseAuthError(err) || err.response?.data?.detail || "Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await authAPI.demoLogin();
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError("Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto text-white mb-3 shadow-lg shadow-cyan-500/25">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {isLogin ? 'Welcome to MediLens' : 'Create Your MediLens Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin ? 'Access your reports and clinical summaries' : 'Start organizing and understanding your lab results'}
          </p>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full mb-3 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
        >
          {googleLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* 1-Click Demo Tour Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading || googleLoading}
          className="w-full mb-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-600/50 hover:bg-amber-900/40 transition-colors"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Instant 1-Click Demo Account</span>
        </button>

        <div className="flex items-center my-3.5">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-[11px] text-slate-500 uppercase font-semibold">Or use email</span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Eleanor Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In to Dashboard' : 'Create Free Account'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); }}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); }}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
