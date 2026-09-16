import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Activity, 
  AlertCircle, 
  ShieldCheck, 
  FileCheck
} from 'lucide-react';
import { authAPI } from '../api';

export default function SignUpPage({ 
  onNavigateToLogin, 
  onAuthSuccess,
  showToast 
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const errors = {};

    if (!fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter a password.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.terms = 'Please accept the Terms and Privacy Policy to continue.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const data = await authAPI.register(email.trim(), password, fullName.trim());
      showToast({
        type: 'success',
        message: 'Account created successfully!'
      });
      onAuthSuccess(data.user);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed. Please check your details.';
      setGeneralError(detail);
      showToast({
        type: 'error',
        message: detail
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Simulated Google OAuth provider flow
    setLoading(true);
    setTimeout(async () => {
      try {
        const data = await authAPI.demoLogin();
        showToast({
          type: 'success',
          message: 'Account created successfully!'
        });
        onAuthSuccess(data.user);
      } catch (e) {
        setGeneralError('Google Authentication failed.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Biotech Narrative & Brand Highlights */}
        <div className="lg:col-span-6 text-left space-y-6 hidden lg:block pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Health Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your laboratory records,{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              demystified.
            </span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Join thousands of individuals and healthcare professionals using MediLens to summarize blood panels, detect trends, and prepare for medical consultations.
          </p>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Automated OCR & Biomarker Parsing</h4>
              </div>
              <p className="text-[11px] text-slate-400 pl-9">
                Extract values, units, and clinical reference ranges instantly from PDF and image reports.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Export Ready-to-Print Summaries</h4>
              </div>
              <p className="text-[11px] text-slate-400 pl-9">
                Download beautifully formatted physician discussion sheets with personalized questions.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Sign Up Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-3xl p-6 sm:p-8 bg-[#0d0f15]/85 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/60 text-left transition-all">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-purple-600 flex items-center justify-center mx-auto text-white mb-3 shadow-lg shadow-orange-500/25">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create your MediLens account
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                Start understanding your medical reports simply.
              </p>
            </div>

            {/* General error message */}
            {generalError && (
              <div className="mb-5 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Dr. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      fieldErrors.fullName 
                        ? 'border-rose-500/60 focus:border-rose-500' 
                        : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30'
                    }`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      fieldErrors.email 
                        ? 'border-rose-500/60 focus:border-rose-500' 
                        : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      fieldErrors.password 
                        ? 'border-rose-500/60 focus:border-rose-500' 
                        : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide Password" : "Show Password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      fieldErrors.confirmPassword 
                        ? 'border-rose-500/60 focus:border-rose-500' 
                        : 'border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? "Hide Password" : "Show Password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Terms and Privacy Policy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: '' });
                    }}
                    className="mt-0.5 rounded border-white/20 bg-slate-900 text-orange-500 focus:ring-orange-500/40 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 leading-snug">
                    I agree to the <span className="text-orange-400 font-semibold hover:underline">Terms</span> and <span className="text-orange-400 font-semibold hover:underline">Privacy Policy</span>.
                  </span>
                </label>
                {fieldErrors.terms && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{fieldErrors.terms}</span>
                  </p>
                )}
              </div>

              {/* Primary Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-[11px] font-bold text-slate-500 tracking-wider">
                OR
              </span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
            >
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
            </button>

            {/* Bottom text */}
            <div className="mt-5 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-orange-400 font-bold hover:text-orange-300 hover:underline transition-colors ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
