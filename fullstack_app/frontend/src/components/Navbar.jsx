import React from 'react';
import { 
  Activity, 
  Upload, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Moon, 
  BarChart2, 
  Lock, 
  Layers,
  ChevronRight,
  Menu,
  X,
  User as UserIcon,
  LogOut
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setView, 
  onOpenUpload, 
  onLoadDemo, 
  isDark, 
  toggleTheme,
  onOpenAuth,
  user,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = user ? [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'my-reports', label: 'My Reports' },
    { id: 'trends', label: 'Trends' },
    { id: 'how-it-works', label: 'How It Works', scrollTo: 'how-it-works' },
    { id: 'privacy', label: 'Privacy', scrollTo: 'privacy' }
  ] : [
    { id: 'landing', label: 'Overview' },
    { id: 'how-it-works', label: 'How It Works', scrollTo: 'how-it-works' },
    { id: 'features', label: 'Features', scrollTo: 'features' },
    { id: 'privacy', label: 'Privacy', scrollTo: 'privacy' }
  ];

  const handleNavClick = (item) => {
    setMobileMenuOpen(false);
    if (item.scrollTo && currentView === 'landing') {
      const el = document.getElementById(item.scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    setView(item.id === 'how-it-works' || item.id === 'features' || item.id === 'privacy' ? 'landing' : item.id);
    if (item.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(item.scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="fixed top-3 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl glass-panel shadow-2xl shadow-black/40 border border-white/[0.08] backdrop-blur-2xl transition-all">
        {/* Brand Logo */}
        <button 
          onClick={() => setView(user ? 'dashboard' : 'landing')} 
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-200 bg-clip-text text-transparent">
                MediLens
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                AI
              </span>
            </div>
          </div>
        </button>

        {/* Center Floating Navigation Items */}
        <div className="hidden lg:flex items-center gap-1 bg-black/30 dark:bg-slate-950/40 p-1 rounded-xl border border-white/[0.05]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                currentView === item.id 
                  ? 'text-white bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/40 shadow-sm shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-white/[0.05] border border-white/[0.06] transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Try Demo Report button */}
          <button
            onClick={onLoadDemo}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Demo</span>
          </button>

          {/* Analyze Report CTA */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Analyze</span>
            <span>Report</span>
          </button>

          {/* Authentication State: Logged-out vs Logged-in */}
          {!user ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => setView('login')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                  currentView === 'login'
                    ? 'text-white bg-white/10 border border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setView('signup')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-md shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 pl-1 border-l border-white/10">
              <div 
                onClick={() => setView('profile')}
                title="View Profile"
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-orange-500/40 cursor-pointer transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-[11px] font-extrabold shadow-sm">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                  {user.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.06] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden mt-2 p-4 rounded-2xl glass-panel border border-white/[0.08] shadow-2xl backdrop-blur-2xl space-y-2.5 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              {item.label}
            </button>
          ))}
          
          <div className="pt-2 border-t border-white/10 space-y-2">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); setView('login'); }}
                  className="w-full py-2 px-3 text-center rounded-xl text-xs font-bold text-slate-300 bg-white/[0.05] hover:bg-white/10 border border-white/10"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); setView('signup'); }}
                  className="w-full py-2 px-3 text-center rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white truncate max-w-[140px]">{user.full_name || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="px-2.5 py-1 rounded-lg text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            )}
            <button
              onClick={() => { setMobileMenuOpen(false); onLoadDemo(); }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-orange-400 hover:bg-orange-500/10 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Demo Report</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
