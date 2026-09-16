import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  FileText, 
  Clock, 
  Edit3, 
  Key, 
  LogOut, 
  Check, 
  X, 
  ShieldCheck, 
  Activity, 
  AlertCircle,
  Loader2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { authAPI, reportAPI } from '../api';
import Sidebar from './Sidebar';

export default function ProfileView({ 
  user, 
  onUserUpdated, 
  onLogout, 
  onNavigate, 
  onOpenUpload, 
  onLoadDemo,
  showToast 
}) {
  const [stats, setStats] = useState({ total_reports: 0, recent_reports: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState('');

  // Change Password Modal State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setNameInput(user?.full_name || '');
  }, [user]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoadingStats(true);
        const data = await reportAPI.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load user profile stats", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchUserStats();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setEditError("Name cannot be empty.");
      return;
    }
    setSavingProfile(true);
    setEditError('');
    try {
      const updated = await authAPI.updateProfile(nameInput.trim());
      onUserUpdated(updated);
      setIsEditing(false);
      if (showToast) {
        showToast({ type: 'success', message: 'Profile updated successfully.' });
      }
    } catch (err) {
      setEditError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      if (showToast) {
        showToast({ type: 'success', message: 'Password changed successfully.' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Format account created date
  const formatDate = (isoString) => {
    if (!isoString) return 'Active Member';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const lastActivity = stats.recent_reports?.[0]?.report_date || (user?.created_at ? formatDate(user.created_at) : 'Active Today');

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Column (Col 3) */}
        <div className="lg:col-span-3">
          <Sidebar
            currentView="profile"
            onNavigate={onNavigate}
            onOpenUpload={onOpenUpload}
            onLoadDemo={onLoadDemo}
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Main Profile Column (Col 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400 block mb-1">
                Account & Credentials
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                User Profile
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-orange-500/40 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setIsChangingPassword(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-purple-500/40 transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* Profile Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/[0.08] shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
              {/* Profile Avatar with Halo Glow */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl shadow-orange-500/25 ring-4 ring-white/10">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {user?.full_name || 'Patient'}
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    Patient Account
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user?.email}</span>
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Joined {formatDate(user?.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Last Activity: {lastActivity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Metrics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Reports Analyzed</span>
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-2">
                {loadingStats ? '...' : stats.total_reports}
              </p>
              <span className="text-[10px] text-slate-500">Secure user records</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Biomarkers Tracked</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-purple-400 mt-2">
                {loadingStats ? '...' : stats.total_biomarkers}
              </p>
              <span className="text-[10px] text-slate-500">Longitudinal data points</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">User ID</span>
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-xl font-mono font-bold text-emerald-400 mt-2">
                ID-{user?.id ? String(user.id).padStart(4, '0') : '0000'}
              </p>
              <span className="text-[10px] text-slate-500">Isolated database tenant</span>
            </div>
          </div>

          {/* Account Details & Management Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Account Details</h3>

            <div className="divide-y divide-white/[0.06] text-xs">
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Full Name</span>
                <span className="font-bold text-white">{user?.full_name || 'Not set'}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Email Address</span>
                <span className="font-mono text-slate-200">{user?.email}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Account Created</span>
                <span className="text-slate-300">{formatDate(user?.created_at)}</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Security Encryption</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> bcrypt + JWT Isolated
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all cursor-pointer"
              >
                Change Password
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all cursor-pointer ml-auto"
              >
                <LogOut className="w-3.5 h-3.5 inline mr-1.5" />
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/[0.1] bg-[#0d0f17]/95 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Profile</h3>
                  <p className="text-[10px] text-slate-400">Update your account name</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="Your full name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-white/[0.05] text-sm text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Email is locked to your account identifier.</span>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-md shadow-orange-500/25 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/[0.1] bg-[#0d0f17]/95 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Change Password</h3>
                  <p className="text-[10px] text-slate-400">Update your account authentication key</p>
                </div>
              </div>
              <button onClick={() => setIsChangingPassword(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter existing password"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Re-enter new password"
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 shadow-md shadow-purple-500/25 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
