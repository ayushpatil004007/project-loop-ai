import React from 'react';
import { ShieldAlert, X, UserCheck, ShieldCheck, Lock } from 'lucide-react';
import { useLoop } from '../context/LoopContext';

export const ForbiddenModal: React.FC = () => {
  const { forbiddenAction, closeForbiddenModal, switchRole, currentUser } = useLoop();

  if (!forbiddenAction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#111113] rounded-2xl max-w-md w-full shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-rose-950/30 border-b border-rose-500/20 p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-rose-200">403 Forbidden</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  RBAC Restriction
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">Permission Denied for {currentUser.role} Account</p>
            </div>
          </div>
          <button
            onClick={closeForbiddenModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-slate-300">
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 text-xs leading-relaxed space-y-1">
            <span className="font-semibold text-white block">Attempted Restricted Action:</span>
            <p className="text-rose-300 font-mono text-[11px] bg-rose-500/15 px-2 py-1 rounded border border-rose-500/30">
              {forbiddenAction}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your current active role is <strong className="text-white font-semibold">{currentUser.role}</strong>. 
            Viewers have strictly read-only authorization across the platform to protect data integrity.
          </p>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick 1-Click Role Elevation (Demo Testing):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  switchRole('ANALYST');
                  closeForbiddenModal();
                }}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
              >
                <UserCheck size={14} />
                <span>Switch to Analyst</span>
              </button>
              <button
                onClick={() => {
                  switchRole('ADMIN');
                  closeForbiddenModal();
                }}
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-rose-600/20 border border-rose-500/30"
              >
                <ShieldCheck size={14} />
                <span>Switch to Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0D0D0F] px-6 py-3 border-t border-white/5 flex justify-end">
          <button
            onClick={closeForbiddenModal}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
