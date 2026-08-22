import React from 'react';
import { LoopProvider, useLoop } from './context/LoopContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InboxView } from './components/InboxView';
import { IngestHubView } from './components/IngestHubView';
import { TrendsView } from './components/TrendsView';
import { AskLoopView } from './components/AskLoopView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { FeedbackDetailDrawer } from './components/FeedbackDetailDrawer';
import { ForbiddenModal } from './components/ForbiddenModal';
import { CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, toast } = useLoop();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'inbox':
        return <InboxView />;
      case 'ingest':
        return <IngestHubView />;
      case 'trends':
        return <TrendsView />;
      case 'ask':
        return <AskLoopView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0B] font-sans text-slate-200 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0A0A0B]">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0A0A0B] text-slate-200 custom-scrollbar">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Slide-over Drawers */}
      <FeedbackDetailDrawer />
      <ForbiddenModal />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-none max-w-sm w-full animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-[#111113]/95 text-emerald-300 border-emerald-500/30 shadow-emerald-950/40'
                : toast.type === 'error'
                ? 'bg-[#111113]/95 text-rose-300 border-rose-500/30 shadow-rose-950/40'
                : toast.type === 'warning'
                ? 'bg-[#111113]/95 text-amber-300 border-amber-500/30 shadow-amber-950/40'
                : 'bg-[#111113]/95 text-slate-200 border-white/10 shadow-black/60'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="text-indigo-400 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <LoopProvider>
      <MainAppContent />
    </LoopProvider>
  );
}
