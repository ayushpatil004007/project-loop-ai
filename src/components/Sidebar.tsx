import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  PlusCircle, 
  TrendingUp, 
  MessageSquareCode, 
  FileText, 
  Settings, 
  Zap, 
  Building2, 
  ChevronDown, 
  ShieldCheck, 
  UserCheck, 
  Eye,
  Sparkles,
  Layers
} from 'lucide-react';
import { useLoop } from '../context/LoopContext';
import { Role } from '../types';

export const Sidebar: React.FC = () => {
  const { 
    currentWorkspace, 
    workspaces, 
    switchWorkspace, 
    currentUser, 
    switchRole, 
    activeTab, 
    setActiveTab,
    workspaceFeedback,
    isViewer,
  } = useLoop();

  const navItems = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'inbox', label: 'Feedback Inbox', icon: Inbox, badge: workspaceFeedback.filter(f => f.status === 'NEW').length },
    { id: 'ingest', label: 'Ingestion Hub', icon: PlusCircle, badge: null },
    { id: 'trends', label: 'Themes & Trends', icon: TrendingUp, badge: 'Spike' },
    { id: 'ask', label: 'Ask LOOP (AI Q&A)', icon: MessageSquareCode, badge: 'AI' },
    { id: 'reports', label: 'Voice-of-Customer', icon: FileText, badge: null },
    { id: 'settings', label: 'Workspace & RBAC', icon: Settings, badge: null },
  ];

  const roleOptions: { role: Role; label: string; desc: string; icon: any; color: string }[] = [
    { 
      role: 'ADMIN', 
      label: 'Admin', 
      desc: 'Full read/write/delete & user admin', 
      icon: ShieldCheck, 
      color: 'bg-rose-500 text-rose-100' 
    },
    { 
      role: 'ANALYST', 
      label: 'Analyst', 
      desc: 'Ingest data & generate reports', 
      icon: UserCheck, 
      color: 'bg-indigo-500 text-indigo-100' 
    },
    { 
      role: 'VIEWER', 
      label: 'Viewer', 
      desc: 'Read-only access (403 restricted)', 
      icon: Eye, 
      color: 'bg-slate-500 text-slate-100' 
    },
  ];

  return (
    <aside className="w-64 md:w-72 bg-[#111113] text-slate-200 flex flex-col border-r border-white/5 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base">Project LOOP</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Customer Feedback AI</p>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Workspace Selector */}
      <div className="p-3 border-b border-white/5 bg-[#0D0D0F]">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 px-2 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Building2 size={12} className="text-slate-400" />
            TENANT WORKSPACE
          </span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Isolated
          </span>
        </div>
        
        <div className="relative">
          <select
            value={currentWorkspace.id}
            onChange={(e) => switchWorkspace(e.target.value)}
            className="w-full bg-white/5 text-white text-xs font-semibold py-2 px-3 pr-8 rounded-lg border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition-colors"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id} className="bg-[#111113] text-white">
                {ws.name} ({ws.plan})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-3 mb-2">
          Platform Views
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all group ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={17}
                  className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badge === 'AI'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : item.badge === 'Spike'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : isActive
                      ? 'bg-indigo-500/30 text-indigo-200'
                      : 'bg-white/5 text-slate-400 border border-white/5'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 1-Click Demo RBAC Switcher */}
      <div className="p-3 border-t border-white/5 bg-[#0D0D0F]">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Layers size={11} className="text-indigo-400" />
            1-Click Demo Role
          </span>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
            currentUser.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
            currentUser.role === 'ANALYST' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
            'bg-slate-800 text-slate-300 border-white/10'
          }`}>
            {currentUser.role}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {roleOptions.map((opt) => {
            const isCurrent = currentUser.role === opt.role;
            return (
              <button
                key={opt.role}
                onClick={() => switchRole(opt.role)}
                title={opt.desc}
                className={`py-1.5 px-2 rounded-lg flex flex-col items-center gap-1 text-[11px] font-medium transition-all ${
                  isCurrent
                    ? 'bg-white/10 text-white border border-indigo-500/40 shadow-sm'
                    : 'bg-white/[0.02] text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-white/5'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                <span className="text-[11px] leading-none">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-white/5 bg-[#111113]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0 overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 block">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
