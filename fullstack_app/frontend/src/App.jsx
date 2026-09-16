import React, { useState, useEffect } from 'react';
import DnaStrand from './components/DnaStrand';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ReportDashboard from './components/ReportDashboard';
import ReportDetailView from './components/ReportDetailView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import HealthTrends from './components/HealthTrends';
import AskMediLens from './components/AskMediLens';
import MyReports from './components/MyReports';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import Toast from './components/Toast';
import TestDetailModal from './components/TestDetailModal';
import { authAPI, reportAPI } from './api';

const PROTECTED_VIEWS = ['dashboard', 'my-reports', 'report-detail', 'trends', 'ask', 'profile', 'settings'];

export default function App() {
  const [user, setUser] = useState(() => authAPI.getCurrentUser());
  const [currentView, setView] = useState(() => (user ? 'dashboard' : 'landing'));
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);
  
  // Single Report Detail State
  const [selectedReport, setSelectedReport] = useState(null);

  // Modals & Overlays
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedDetailTest, setSelectedDetailTest] = useState(null);

  // Theme Management (dark | light | system)
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('medilens_theme') || 'dark';
  });

  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = themeMode === 'system' ? isSystemDark : themeMode === 'dark';

  // Apply dark / light classes to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDark]);

  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme);
    localStorage.setItem('medilens_theme', newTheme);
  };

  const toggleTheme = () => {
    handleThemeChange(isDark ? 'light' : 'dark');
  };

  // User session persistence & verification
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('medilens_token');
      if (token) {
        try {
          const me = await authAPI.getMe();
          setUser(me);
        } catch (err) {
          if (err.response?.status === 401) {
            authAPI.logout();
            setUser(null);
            if (PROTECTED_VIEWS.includes(currentView)) {
              setView('login');
            }
          }
        }
      }
    };
    verifySession();
  }, []);

  // Route protection navigator
  const navigateToView = (targetView) => {
    if (PROTECTED_VIEWS.includes(targetView) && !user) {
      setRedirectAfterLogin(targetView);
      setToast({
        type: 'info',
        message: 'Please sign in to access your MediLens dashboard and reports.'
      });
      setView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    const destination = redirectAfterLogin || 'dashboard';
    setRedirectAfterLogin(null);
    setView(destination);
    setToast({
      type: 'success',
      message: `Welcome${authUser.full_name ? `, ${authUser.full_name}` : ''}!`
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setSelectedReport(null);
    setToast({
      type: 'info',
      message: 'You have been signed out.'
    });
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUploadProtected = () => {
    if (!user) {
      setRedirectAfterLogin('dashboard');
      setToast({
        type: 'info',
        message: 'Please sign in or create an account to analyze your medical report.'
      });
      setView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setUploadOpen(true);
    }
  };

  const handleReportUploaded = (uploaded) => {
    setSelectedReport(uploaded);
    setView('report-detail');
    setToast({
      type: 'success',
      message: 'Medical report successfully processed and clinical summary generated.'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReport = (r) => {
    setSelectedReport(r);
    setView('report-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Requirement 9: Demo Data isolated to user's account
  const handleLoadDemo = async () => {
    if (!user) {
      setRedirectAfterLogin('dashboard');
      setToast({
        type: 'info',
        message: 'Please sign in or create a fresh account to load demo medical data.'
      });
      setView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const sample = await reportAPI.loadSample('metabolic');
      setSelectedReport(sample);
      setView('report-detail');
      setToast({
        type: 'success',
        message: 'Fictional demo report loaded into your account.'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Could not load demo report.'
      });
    }
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden selection:bg-orange-500 selection:text-white ${isDark ? 'bg-[#08090d] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Continuous 3D Animated DNA Helix */}
      <DnaStrand isDark={isDark} />

      {/* Floating Rounded Navigation Bar */}
      <Navbar
        currentView={currentView}
        setView={navigateToView}
        onOpenUpload={handleOpenUploadProtected}
        onLoadDemo={handleLoadDemo}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenAuth={() => navigateToView('login')}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="relative z-10">
        {/* 1. Public Landing Page */}
        {currentView === 'landing' && (
          <LandingPage
            onOpenUpload={handleOpenUploadProtected}
            onLoadDemo={handleLoadDemo}
            onViewReport={() => navigateToView('dashboard')}
            onSelectTest={(test) => setSelectedDetailTest(test)}
            onNavigateToLogin={() => navigateToView('login')}
            onNavigateToSignUp={() => navigateToView('signup')}
          />
        )}

        {/* 2. Login Page */}
        {currentView === 'login' && (
          <LoginPage
            onNavigateToSignUp={() => navigateToView('signup')}
            onOpenForgotPassword={() => setForgotPasswordOpen(true)}
            onAuthSuccess={handleAuthSuccess}
            showToast={setToast}
          />
        )}

        {/* 3. Sign Up Page */}
        {currentView === 'signup' && (
          <SignUpPage
            onNavigateToLogin={() => navigateToView('login')}
            onAuthSuccess={handleAuthSuccess}
            showToast={setToast}
          />
        )}

        {/* 4. User Overview Dashboard */}
        {currentView === 'dashboard' && (
          <ReportDashboard
            user={user}
            onOpenUpload={handleOpenUploadProtected}
            onSelectReport={handleSelectReport}
            onOpenChat={() => navigateToView('ask')}
            onViewTrends={() => navigateToView('trends')}
            onViewMyReports={() => navigateToView('my-reports')}
            onLoadDemo={handleLoadDemo}
            onNavigate={navigateToView}
            onLogout={handleLogout}
            showToast={setToast}
          />
        )}

        {/* 5. Dedicated Single Report Detail View (No overlap) */}
        {currentView === 'report-detail' && (
          <ReportDetailView
            reportId={selectedReport?.id}
            initialReport={selectedReport}
            user={user}
            onBack={() => navigateToView('dashboard')}
            onOpenChat={() => navigateToView('ask')}
            onNavigate={navigateToView}
            onOpenUpload={handleOpenUploadProtected}
            onLoadDemo={handleLoadDemo}
            onLogout={handleLogout}
            showToast={setToast}
          />
        )}

        {/* 6. My Reports Library */}
        {currentView === 'my-reports' && (
          <MyReports
            user={user}
            onSelectReport={handleSelectReport}
            onBack={() => navigateToView('dashboard')}
            onOpenUpload={handleOpenUploadProtected}
            onLoadDemo={handleLoadDemo}
            onNavigate={navigateToView}
            onLogout={handleLogout}
            showToast={setToast}
          />
        )}

        {/* 7. Longitudinal Health Trends */}
        {currentView === 'trends' && (
          <HealthTrends
            user={user}
            onBack={() => navigateToView('dashboard')}
            onOpenUpload={handleOpenUploadProtected}
            onLoadDemo={handleLoadDemo}
            onNavigate={navigateToView}
            onLogout={handleLogout}
          />
        )}

        {/* 8. Ask MediLens AI Chat */}
        {currentView === 'ask' && (
          <AskMediLens
            report={selectedReport}
            user={user}
            onBack={() => navigateToView('dashboard')}
            onOpenUpload={handleOpenUploadProtected}
            onLoadDemo={handleLoadDemo}
            onNavigate={navigateToView}
            onLogout={handleLogout}
          />
        )}

        {/* 9. User Profile View */}
        {currentView === 'profile' && (
          <ProfileView
            user={user}
            onUserUpdated={(updatedUser) => setUser(updatedUser)}
            onLogout={handleLogout}
            onNavigate={navigateToView}
            onOpenUpload={handleOpenUploadProtected}
            onLoadDemo={handleLoadDemo}
            showToast={setToast}
          />
        )}

        {/* 10. Settings View */}
        {currentView === 'settings' && (
          <SettingsView
            user={user}
            themeMode={themeMode}
            onThemeChange={handleThemeChange}
            onLogout={handleLogout}
            onNavigate={navigateToView}
            onOpenUpload={handleOpenUploadProtected}
            onLoadDemo={handleLoadDemo}
            showToast={setToast}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        onReportUploaded={handleReportUploaded}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onBackToLogin={() => {
          setForgotPasswordOpen(false);
          navigateToView('login');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {selectedDetailTest && (
        <TestDetailModal
          test={selectedDetailTest}
          onClose={() => setSelectedDetailTest(null)}
        />
      )}

      {/* Global Toast Notification */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
