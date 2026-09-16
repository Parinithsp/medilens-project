import React from 'react';
import { 
  Activity, 
  Upload, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  User as UserIcon, 
  Settings, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  currentView, 
  onNavigate, 
  onOpenUpload, 
  onLoadDemo, 
  user, 
  onLogout 
}) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'analyze', label: 'Analyze Report', icon: Upload, action: onOpenUpload },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
    { id: 'trends', label: 'Health Trends', icon: TrendingUp },
    { id: 'ask', label: 'Ask MediLens', icon: MessageSquare },
  ];

  const userNavItems = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <aside className="w-full space-y-4">
      {/* Primary Navigation Panel */}
      <div className="p-5 rounded-3xl glass-panel border border-white/[0.08] shadow-xl text-left">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-md shadow-orange-500/10">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">MediLens Portal</h3>
            <p className="text-[10px] text-slate-400">Clinical Dashboard</p>
          </div>
        </div>

        {/* Main Links */}
        <nav className="space-y-1 text-xs font-semibold">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-purple-500/15 border border-orange-500/40 shadow-sm shadow-orange-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-400" />}
              </button>
            );
          })}
        </nav>

        {/* Profile & Settings Navigation */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-1 text-xs font-semibold">
          {userNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-orange-500/20 to-purple-500/15 border border-orange-500/40 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-400" />}
              </button>
            );
          })}
        </div>

        {/* Demo Report Action Button */}
        {onLoadDemo && (
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <button
              onClick={onLoadDemo}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Try Demo Report</span>
            </button>
          </div>
        )}
      </div>

      {/* User Account Capsule Card */}
      {user && (
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between gap-3 text-left">
          <div 
            onClick={() => onNavigate('profile')} 
            className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 hover:opacity-85 transition-opacity"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-orange-500/20 shrink-0">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.full_name || 'Patient'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.06] transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
