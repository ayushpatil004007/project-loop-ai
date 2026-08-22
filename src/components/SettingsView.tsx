import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Check, 
  X, 
  Lock, 
  Trash2, 
  ShieldAlert, 
  Database,
  Layers,
  Key
} from 'lucide-react';
import { useLoop } from '../context/LoopContext';
import { Role } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    currentWorkspace, 
    users, 
    currentUser, 
    updateUserRole, 
    removeUser, 
    inviteUser, 
    isAdmin, 
    triggerForbidden,
    showToast 
  } = useLoop();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('ANALYST');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      triggerForbidden('Invite new team member');
      return;
    }
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    inviteUser(inviteName, inviteEmail, inviteRole);
    setInviteName('');
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const permissionsMatrix = [
    { action: 'View Analytics & Dashboard Charts', admin: true, analyst: true, viewer: true },
    { action: 'Search & Filter Feedback Inbox', admin: true, analyst: true, viewer: true },
    { action: 'Ask LOOP Grounded Q&A', admin: true, analyst: true, viewer: true },
    { action: 'Ingest Single & Bulk CSV Feedback', admin: true, analyst: true, viewer: false },
    { action: 'Update Triage & Workflow Status (NEW/REVIEWED/ACTIONED)', admin: true, analyst: true, viewer: false },
    { action: 'Create & Manage Intelligence Themes', admin: true, analyst: true, viewer: false },
    { action: 'Generate Executive VoC Reports', admin: true, analyst: true, viewer: false },
    { action: 'Delete Feedback Records', admin: true, analyst: false, viewer: false },
    { action: 'Manage Workspace Members & RBAC Roles', admin: true, analyst: false, viewer: false },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Workspace Profile Card */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 shadow-xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 size={18} className="text-indigo-400" />
              {currentWorkspace.name}
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              {currentWorkspace.plan} Plan
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Tenant ID: <span className="text-white font-bold">{currentWorkspace.id}</span> • Isolation: Strict Workspace Partitioning
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Multi-Tenant Schema
          </span>
        </div>
      </div>

      {/* Member Management & Access Control Table */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-indigo-400" />
              Workspace Members & Access Control (RBAC)
            </h3>
            <p className="text-xs text-slate-400">
              Manage member roles ({users.length} active in this workspace)
            </p>
          </div>

          <button
            onClick={() => {
              if (!isAdmin) {
                triggerForbidden('Invite new team member');
                return;
              }
              setIsInviteModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
          >
            <UserPlus size={14} />
            <span>Invite Member</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-400 bg-white/[0.02] border-b border-white/5">
                <th className="py-2.5 px-4">Member</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Title / Job Function</th>
                <th className="py-2.5 px-4">RBAC Role</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-300">
              {users.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-[11px] overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{member.name}</span>
                      {member.id === currentUser.id && (
                        <span className="text-[9px] text-indigo-400 font-bold uppercase">(You)</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {member.email}
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    {member.title || 'Product Team'}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={member.role}
                      onChange={(e) => updateUserRole(member.id, e.target.value as Role)}
                      disabled={!isAdmin || member.id === currentUser.id}
                      className={`py-1 px-2.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed bg-white/5 ${
                        member.role === 'ADMIN'
                          ? 'text-rose-300 border-rose-500/30 bg-rose-500/15'
                          : member.role === 'ANALYST'
                          ? 'text-indigo-300 border-indigo-500/30 bg-indigo-500/15'
                          : 'text-slate-300 border-white/10 bg-white/10'
                      }`}
                    >
                      <option value="ADMIN" className="bg-[#111113] text-white">ADMIN</option>
                      <option value="ANALYST" className="bg-[#111113] text-white">ANALYST</option>
                      <option value="VIEWER" className="bg-[#111113] text-white">VIEWER</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {member.id !== currentUser.id && (
                      <button
                        onClick={() => removeUser(member.id)}
                        disabled={!isAdmin}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
                        title={isAdmin ? "Remove user from workspace" : "Admin required to remove members"}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Role Permissions Matrix */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-400" />
            RBAC Permission Capabilities Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Authorization levels enforced across client and server-side operations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-400 bg-white/[0.02] border-b border-white/5">
                <th className="py-2.5 px-4 w-1/2">Action / Capability</th>
                <th className="py-2.5 px-4 text-center">ADMIN</th>
                <th className="py-2.5 px-4 text-center">ANALYST</th>
                <th className="py-2.5 px-4 text-center">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-300">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-4 text-slate-200">{item.action}</td>
                  <td className="py-2.5 px-4 text-center">
                    {item.admin ? <Check size={15} className="mx-auto text-emerald-400 font-bold" /> : <X size={15} className="mx-auto text-slate-600" />}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.analyst ? <Check size={15} className="mx-auto text-emerald-400 font-bold" /> : <X size={15} className="mx-auto text-slate-600" />}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.viewer ? <Check size={15} className="mx-auto text-emerald-400 font-bold" /> : <X size={15} className="mx-auto text-rose-400 font-bold" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111113] rounded-2xl max-w-md w-full shadow-2xl border border-white/10 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Invite Workspace Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jordan@company.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  RBAC Role Permission
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ADMIN" className="bg-[#111113] text-white">ADMIN (Full management & deletion)</option>
                  <option value="ANALYST" className="bg-[#111113] text-white">ANALYST (Ingest & report synthesis)</option>
                  <option value="VIEWER" className="bg-[#111113] text-white">VIEWER (Read-only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
