import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Bell, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  Play, 
  Database,
  Building2
} from 'lucide-react';
import { useLoop } from '../context/LoopContext';
import { Role } from '../types';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentWorkspace, 
    currentUser, 
    switchRole, 
    canEdit, 
    simulateLiveBatch, 
    isSimulating,
    workspaceFeedback
  } = useLoop();

  const getPageMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Analytics Dashboard',
          subtitle: `Aggregated customer feedback intelligence for ${currentWorkspace.name}`,
        };
      case 'inbox':
        return {
          title: 'Feedback Inbox',
          subtitle: `Triage, review, and filter incoming customer feedback tickets across all 5 channels`,
        };
      case 'ingest':
        return {
          title: 'Feedback Ingestion Hub',
          subtitle: 'Ingest single feedback, upload bulk CSV datasets, or simulate live streams',
        };
      case 'trends':
        return {
          title: 'Themes & Spike Trends',
          subtitle: 'AI-clustered sentiment themes and automated Week-over-Week volume spike detection',
        };
      case 'ask':
        return {
          title: 'Ask LOOP - Grounded AI Analyst',
          subtitle: 'Ask questions in natural language with strict feedback citations and quote retrieval',
        };
      case 'reports':
        return {
          title: 'Voice-of-Customer Reports',
          subtitle: 'Executive intelligence summaries, sentiment deltas, and prioritized product action items',
        };
      case 'settings':
        return {
          title: 'Workspace Settings & RBAC',
          subtitle: 'Manage multi-tenant workspace members, access roles, and permission levels',
        };
      default:
        return {
          title: 'Project LOOP',
          subtitle: 'Customer Feedback Intelligence Platform',
        };
    }
  };

  const meta = getPageMeta();

  return (
    <header className="h-16 border-b border-white/5 bg-[#0A0A0B] px-6 md:px-8 flex items-center justify-between shadow-xs select-none">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">{meta.title}</h1>
            <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {workspaceFeedback.length} items
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden md:block">{meta.subtitle}</p>
        </div>
      </div>

      {/* Actions & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Grounded AI Engine Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles size={13} className="text-indigo-400 animate-pulse" />
          <span>Gemini 3.7 Intelligence</span>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="hidden sm:flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs font-medium">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Role:</span>
          {(['ADMIN', 'ANALYST', 'VIEWER'] as Role[]).map((r) => {
            const isActive = currentUser.role === r;
            return (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  isActive
                    ? r === 'ADMIN'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : r === 'ANALYST'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-white/10 text-slate-200 border border-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* Action Button: Ingest */}
        {activeTab !== 'ingest' && (
          <button
            onClick={() => setActiveTab('ingest')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
          >
            <Plus size={14} />
            <span>Ingest</span>
          </button>
        )}

        {/* Action Button: Live Simulation */}
        <button
          onClick={() => simulateLiveBatch(3)}
          disabled={isSimulating}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          title="Simulate incoming tickets from live channels"
        >
          <Play size={12} className={isSimulating ? 'animate-spin' : 'fill-slate-200'} />
          <span>{isSimulating ? 'Injecting...' : 'Simulate'}</span>
        </button>
      </div>
    </header>
  );
};
