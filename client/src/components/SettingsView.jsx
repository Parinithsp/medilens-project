import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Sun, 
  Moon, 
  Laptop, 
  Bell, 
  ShieldAlert, 
  Download, 
  Trash2, 
  Key, 
  Check, 
  AlertTriangle, 
  Loader2, 
  X,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { authAPI, reportAPI } from '../api';
import Sidebar from './Sidebar';

export default function SettingsView({ 
  user, 
  themeMode, // 'dark' | 'light' | 'system'
  onThemeChange, 
  onLogout, 
  onNavigate, 
  onOpenUpload, 
  onLoadDemo,
  showToast 
}) {
  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('medilens_notifications') !== 'false';
  });
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(() => {
    return localStorage.getItem('medilens_email_alerts') === 'true';
  });

  // Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Privacy Actions State
  const [showClearReportsModal, setShowClearReportsModal] = useState(false);
  const [clearingReports, setClearingReports] = useState(false);

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [downloadingData, setDownloadingData] = useState(false);

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('medilens_notifications', String(next));
    if (showToast) {
      showToast({ type: 'info', message: `In-app notifications ${next ? 'enabled' : 'disabled'}.` });
    }
  };

  const handleToggleEmailAlerts = () => {
    const next = !emailAlertsEnabled;
    setEmailAlertsEnabled(next);
    localStorage.setItem('medilens_email_alerts', String(next));
    if (showToast) {
      showToast({ type: 'info', message: `Email notifications ${next ? 'enabled' : 'disabled'}.` });
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
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (showToast) {
        showToast({ type: 'success', message: 'Password changed successfully.' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      setDownloadingData(true);
      await reportAPI.exportUserData();
      if (showToast) {
        showToast({ type: 'success', message: 'Medical records export downloaded.' });
      }
    } catch (err) {
      if (showToast) {
        showToast({ type: 'error', message: 'Failed to export laboratory data.' });
      }
    } finally {
      setDownloadingData(false);
    }
  };

  const handleClearAllReports = async () => {
    try {
      setClearingReports(true);
      const res = await reportAPI.clearAllReports();
      setShowClearReportsModal(false);
      if (showToast) {
        showToast({ type: 'success', message: res.message || 'All reports deleted from your account.' });
      }
    } catch (err) {
      if (showToast) {
        showToast({ type: 'error', message: 'Failed to delete reports.' });
      }
    } finally {
      setClearingReports(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await authAPI.deleteAccount();
      setShowDeleteAccountModal(false);
      if (showToast) {
        showToast({ type: 'info', message: 'Your account and records have been permanently deleted.' });
      }
      onLogout();
    } catch (err) {
      if (showToast) {
        showToast({ type: 'error', message: 'Failed to delete account.' });
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Column (Col 3) */}
        <div className="lg:col-span-3">
          <Sidebar
            currentView="settings"
            onNavigate={onNavigate}
            onOpenUpload={onOpenUpload}
            onLoadDemo={onLoadDemo}
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Main Settings Column (Col 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header Banner */}
          <div className="pb-6 border-b border-white/[0.08]">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 block mb-1">
              Preferences & Security
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Settings
            </h1>
          </div>

          {/* ==================================================== */}
          {/* 1. ACCOUNT SECTION */}
          {/* ==================================================== */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight uppercase text-xs">Account</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                <span className="text-slate-400 block mb-1 font-semibold">Account Name</span>
                <p className="text-sm font-bold text-white truncate">{user?.full_name || 'Patient'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                <span className="text-slate-400 block mb-1 font-semibold">Email Address</span>
                <p className="text-sm font-mono text-slate-200 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Password Authentication</p>
                <p className="text-[11px] text-slate-400">Change your password anytime to keep your health data protected.</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-orange-500/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-orange-400" />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 2. APPEARANCE SECTION */}
          {/* ==================================================== */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight uppercase text-xs">Appearance</h2>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Select your preferred color theme. Changes persist automatically and smoothly transition without altering the MediLens layout.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Dark Theme Option */}
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-orange-500/15 border-orange-500/50 shadow-lg shadow-orange-500/10'
                    : 'bg-black/40 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Moon className="w-5 h-5 text-orange-400" />
                  {themeMode === 'dark' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-xs font-bold text-white">Dark Mode</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Near-black & glowing coral DNA</p>
              </button>

              {/* Light Theme Option */}
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-orange-500/15 border-orange-500/50 shadow-lg shadow-orange-500/10'
                    : 'bg-black/40 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  {themeMode === 'light' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-xs font-bold text-white">Light Mode</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Clean off-white & subtle DNA glow</p>
              </button>

              {/* System Theme Option */}
              <button
                type="button"
                onClick={() => onThemeChange('system')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  themeMode === 'system'
                    ? 'bg-orange-500/15 border-orange-500/50 shadow-lg shadow-orange-500/10'
                    : 'bg-black/40 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Laptop className="w-5 h-5 text-purple-400" />
                  {themeMode === 'system' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <p className="text-xs font-bold text-white">System Sync</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Adapts to your operating system</p>
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 3. NOTIFICATIONS SECTION */}
          {/* ==================================================== */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight uppercase text-xs">Notifications</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                <div>
                  <p className="text-xs font-bold text-white">Enable In-App Notifications</p>
                  <p className="text-[10px] text-slate-400">Receive toasts when reports finish extraction or when summaries ready.</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    notificationsEnabled ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                <div>
                  <p className="text-xs font-bold text-white">Email Health Summaries</p>
                  <p className="text-[10px] text-slate-400">Receive quarterly notification reminders to review repeat test timelines.</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEmailAlerts}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    emailAlertsEnabled ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      emailAlertsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 4. PRIVACY SECTION */}
          {/* ==================================================== */}
          <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight uppercase text-xs">Privacy & Data Governance</h2>
            </div>

            <div className="space-y-3">
              {/* Download Data */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                <div>
                  <p className="text-xs font-bold text-white">Download All Health Data</p>
                  <p className="text-[10px] text-slate-400">Export your laboratory results and AI clinical summaries in structured JSON format.</p>
                </div>
                <button
                  onClick={handleDownloadData}
                  disabled={downloadingData}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-orange-500/40 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {downloadingData ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-orange-400" />}
                  <span>Download Data</span>
                </button>
              </div>

              {/* Clear Reports */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-950/15 border border-rose-800/30">
                <div>
                  <p className="text-xs font-bold text-rose-300">Delete All Reports</p>
                  <p className="text-[10px] text-slate-400">Permanently delete all uploaded PDF/image reports and clinical biomarker history.</p>
                </div>
                <button
                  onClick={() => setShowClearReportsModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Reports</span>
                </button>
              </div>

              {/* Delete Account */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50">
                <div>
                  <p className="text-xs font-bold text-rose-200">Delete Account</p>
                  <p className="text-[10px] text-slate-400">Permanently close your MediLens account and delete all associated records.</p>
                </div>
                <button
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/[0.1] bg-[#0d0f17]/95 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Change Password</h3>
                  <p className="text-[10px] text-slate-400">Update account credentials</p>
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="Enter current password"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-orange-500"
                  placeholder="Re-enter new password"
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-md shadow-orange-500/25 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Reports Confirmation Modal */}
      {showClearReportsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-rose-800/50 bg-[#0d0f17]/95 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete All Reports?</h3>
                <p className="text-[11px] text-slate-400">Permanent data deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              This action will delete all medical reports, biomarker records, and clinical analyses from your account. Other accounts will not be affected.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearReportsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllReports}
                disabled={clearingReports}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 flex items-center gap-1.5 disabled:opacity-50"
              >
                {clearingReports ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete All Reports</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-rose-800/60 bg-[#0d0f17]/95 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Account?</h3>
                <p className="text-[11px] text-rose-400">Irreversible action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete your MediLens account? All of your uploaded reports, clinical insights, and preferences will be permanently wiped.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 flex items-center gap-1.5 disabled:opacity-50"
              >
                {deletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>Permanently Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
