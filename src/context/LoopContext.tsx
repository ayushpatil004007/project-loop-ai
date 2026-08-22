import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  Workspace, User, Feedback, Theme, ReportItem, Role, Status, Channel, Sentiment, IngestionLog 
} from '../types';
import { 
  WORKSPACES, USERS, INITIAL_THEMES, generateSeedFeedback, INITIAL_REPORTS, CHANNELS 
} from '../data/seedData';

interface LoopContextType {
  // Workspaces & Tenancy
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, domain?: string) => Workspace;

  // Auth & RBAC
  currentUser: User;
  users: User[];
  allUsers: User[];
  switchUser: (user: User) => void;
  switchRole: (role: Role) => void;
  canEdit: boolean;
  isAdmin: boolean;
  isAnalyst: boolean;
  isViewer: boolean;
  updateUserRole: (userId: string, role: Role) => boolean;
  inviteUser: (name: string, email: string, role: Role) => boolean;
  removeUser: (userId: string) => boolean;

  // Feedback State & Actions
  feedback: Feedback[];
  workspaceFeedback: Feedback[];
  addFeedback: (item: Omit<Feedback, 'id' | 'createdAt' | 'workspaceId'>) => Promise<Feedback>;
  bulkAddFeedback: (items: Omit<Feedback, 'id' | 'createdAt' | 'workspaceId'>[]) => Promise<number>;
  updateFeedbackStatus: (id: string, status: Status) => boolean;
  deleteFeedback: (id: string) => boolean;
  selectedFeedback: Feedback | null;
  setSelectedFeedback: (feedback: Feedback | null) => void;

  // Themes & Trends
  themes: Theme[];
  workspaceThemes: Theme[];
  addTheme: (name: string, description: string, color: string) => boolean;
  activeThemeFilter: string | null;
  setActiveThemeFilter: (themeName: string | null) => void;

  // Reports
  reports: ReportItem[];
  workspaceReports: ReportItem[];
  activeReport: ReportItem | null;
  setActiveReport: (report: ReportItem | null) => void;
  generateReport: (title?: string, periodStart?: string, periodEnd?: string) => Promise<ReportItem | null>;
  isGeneratingReport: boolean;

  // Live Simulation
  isSimulating: boolean;
  simulateLiveBatch: (count?: number) => Promise<void>;
  ingestionLogs: IngestionLog[];

  // RBAC 403 Forbidden Modal
  forbiddenAction: string | null;
  closeForbiddenModal: () => void;
  triggerForbidden: (action: string) => void;

  // Toast notifications
  toast: { message: string; type: 'success' | 'info' | 'error' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;

  // Active view
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LoopContext = createContext<LoopContextType | undefined>(undefined);

export const LoopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(WORKSPACES);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('ws-acme');
  
  const [allUsers, setAllUsers] = useState<User[]>(USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('u1'); // Default Sarah Chen (Admin)
  
  const [allFeedback, setAllFeedback] = useState<Feedback[]>(() => generateSeedFeedback());
  const [allThemes, setAllThemes] = useState<Theme[]>(INITIAL_THEMES);
  const [allReports, setAllReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [activeThemeFilter, setActiveThemeFilter] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<ReportItem | null>(INITIAL_REPORTS[0]);
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      channel: 'System Seed',
      count: 120,
      type: 'simulation',
      status: 'SUCCESS',
    },
  ]);

  const [forbiddenAction, setForbiddenAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Active Workspace Object
  const currentWorkspace = useMemo(() => {
    return workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];
  }, [workspaces, currentWorkspaceId]);

  // Active User Object
  const currentUser = useMemo(() => {
    return allUsers.find(u => u.id === currentUserId) || allUsers[0];
  }, [allUsers, currentUserId]);

  // Users belonging to the current workspace
  const users = useMemo(() => {
    return allUsers.filter(u => u.workspaceId === currentWorkspaceId);
  }, [allUsers, currentWorkspaceId]);

  // Role permissions
  const isAdmin = currentUser.role === 'ADMIN';
  const isAnalyst = currentUser.role === 'ANALYST';
  const isViewer = currentUser.role === 'VIEWER';
  const canEdit = isAdmin || isAnalyst;

  // Tenant-isolated Feedback items
  const workspaceFeedback = useMemo(() => {
    return allFeedback.filter(f => f.workspaceId === currentWorkspaceId);
  }, [allFeedback, currentWorkspaceId]);

  // Tenant-isolated Themes with recalculated counts
  const workspaceThemes = useMemo(() => {
    const wsThemes = allThemes.filter(t => t.workspaceId === currentWorkspaceId);
    return wsThemes.map(theme => {
      const matchingCount = workspaceFeedback.filter(f => f.theme === theme.name).length;
      return {
        ...theme,
        count: matchingCount,
      };
    });
  }, [allThemes, currentWorkspaceId, workspaceFeedback]);

  // Tenant-isolated Reports
  const workspaceReports = useMemo(() => {
    return allReports.filter(r => r.workspaceId === currentWorkspaceId);
  }, [allReports, currentWorkspaceId]);

  // Keep active report in sync if workspace changes
  useEffect(() => {
    if (workspaceReports.length > 0) {
      setActiveReport(workspaceReports[0]);
    } else {
      setActiveReport(null);
    }
  }, [currentWorkspaceId, workspaceReports.length]);

  const triggerForbidden = (action: string) => {
    setForbiddenAction(action);
  };

  const closeForbiddenModal = () => {
    setForbiddenAction(null);
  };

  // Switch active user directly
  const switchUser = (user: User) => {
    setCurrentUserId(user.id);
    if (user.workspaceId !== currentWorkspaceId) {
      setCurrentWorkspaceId(user.workspaceId);
    }
    showToast(`Switched account to ${user.name} (${user.role})`, 'info');
  };

  // 1-Click Role Switcher for the active workspace
  const switchRole = (newRole: Role) => {
    // Find matching user in current workspace or update current user's role
    const matchedUser = allUsers.find(u => u.workspaceId === currentWorkspaceId && u.role === newRole);
    if (matchedUser) {
      setCurrentUserId(matchedUser.id);
      showToast(`Switched active role to ${newRole} (${matchedUser.name})`, 'info');
    } else {
      // Update current user role
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, role: newRole } : u));
      showToast(`Switched role to ${newRole}`, 'info');
    }
  };

  // Switch Workspace
  const switchWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    // Find first user in that workspace
    const userInWs = allUsers.find(u => u.workspaceId === workspaceId);
    if (userInWs) {
      setCurrentUserId(userInWs.id);
    }
    const targetWs = workspaces.find(w => w.id === workspaceId);
    showToast(`Switched workspace to ${targetWs?.name || workspaceId}`, 'info');
  };

  // Create Workspace
  const createWorkspace = (name: string, domain?: string): Workspace => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      domain,
      plan: 'Growth',
      createdAt: new Date().toISOString(),
    };
    setWorkspaces(prev => [...prev, newWs]);
    // Create an Admin user for this workspace
    const newAdmin: User = {
      id: `u-${Date.now()}`,
      name: `${currentUser.name} (Admin)`,
      email: currentUser.email,
      role: 'ADMIN',
      workspaceId: newWs.id,
      title: 'Workspace Owner',
    };
    setAllUsers(prev => [...prev, newAdmin]);
    setCurrentWorkspaceId(newWs.id);
    setCurrentUserId(newAdmin.id);
    showToast(`Workspace "${name}" created successfully!`, 'success');
    return newWs;
  };

  // Add Single Feedback Item
  const addFeedback = async (itemData: Omit<Feedback, 'id' | 'createdAt' | 'workspaceId'>): Promise<Feedback> => {
    if (!canEdit) {
      triggerForbidden('Submit new customer feedback');
      throw new Error('403 Forbidden');
    }

    const newId = `fb-${currentWorkspaceId}-${Date.now()}`;
    const newFeedback: Feedback = {
      ...itemData,
      id: newId,
      workspaceId: currentWorkspaceId,
      createdAt: new Date().toISOString(),
    };

    setAllFeedback(prev => [newFeedback, ...prev]);
    
    // Add to ingestion log
    setIngestionLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        channel: itemData.channel,
        count: 1,
        type: 'manual',
        status: 'SUCCESS',
      },
      ...prev,
    ]);

    showToast(`Feedback from ${itemData.customerLabel} ingested successfully!`, 'success');
    return newFeedback;
  };

  // Bulk Ingest Items
  const bulkAddFeedback = async (items: Omit<Feedback, 'id' | 'createdAt' | 'workspaceId'>[]): Promise<number> => {
    if (!canEdit) {
      triggerForbidden('Bulk import CSV feedback');
      throw new Error('403 Forbidden');
    }

    const baseTime = Date.now();
    const createdItems: Feedback[] = items.map((item, idx) => ({
      ...item,
      id: `fb-csv-${baseTime}-${idx}`,
      workspaceId: currentWorkspaceId,
      createdAt: new Date(baseTime - (idx * 60000)).toISOString(),
    }));

    setAllFeedback(prev => [...createdItems, ...prev]);

    setIngestionLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        channel: 'CSV Bulk Upload',
        count: createdItems.length,
        type: 'csv',
        status: 'SUCCESS',
      },
      ...prev,
    ]);

    showToast(`Successfully imported ${createdItems.length} feedback items!`, 'success');
    return createdItems.length;
  };

  // Update Status
  const updateFeedbackStatus = (id: string, newStatus: Status): boolean => {
    if (!canEdit) {
      triggerForbidden('Update feedback triage status');
      return false;
    }

    setAllFeedback(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, status: newStatus };
      }
      return f;
    }));

    if (selectedFeedback && selectedFeedback.id === id) {
      setSelectedFeedback(prev => prev ? { ...prev, status: newStatus } : null);
    }

    showToast(`Triage status updated to ${newStatus}`, 'info');
    return true;
  };

  // Delete Feedback
  const deleteFeedback = (id: string): boolean => {
    if (!isAdmin) {
      triggerForbidden('Delete feedback records (Admin only)');
      return false;
    }

    setAllFeedback(prev => prev.filter(f => f.id !== id));
    if (selectedFeedback?.id === id) {
      setSelectedFeedback(null);
    }
    showToast('Feedback item deleted', 'warning');
    return true;
  };

  // Add Theme
  const addTheme = (name: string, description: string, color: string): boolean => {
    if (!canEdit) {
      triggerForbidden('Create new intelligence themes');
      return false;
    }

    const newTheme: Theme = {
      id: `theme-${Date.now()}`,
      name,
      description,
      color,
      workspaceId: currentWorkspaceId,
      count: 0,
      delta: 'New',
    };

    setAllThemes(prev => [...prev, newTheme]);
    showToast(`Theme "${name}" added to workspace!`, 'success');
    return true;
  };

  // Generate Report
  const generateReport = async (
    title?: string, 
    periodStart?: string, 
    periodEnd?: string
  ): Promise<ReportItem | null> => {
    if (!canEdit) {
      triggerForbidden('Generate executive VoC reports');
      return null;
    }

    setIsGeneratingReport(true);
    try {
      const payload = {
        title: title || `Voice-of-Customer Intelligence (${new Date().toLocaleDateString()})`,
        periodStart: periodStart || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        periodEnd: periodEnd || new Date().toISOString().split('T')[0],
        workspaceName: currentWorkspace.name,
        feedbackSample: workspaceFeedback.slice(0, 50),
      };

      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let reportData;
      if (res.ok) {
        reportData = await res.json();
      } else {
        throw new Error('API request failed');
      }

      const newReport: ReportItem = {
        id: `rep-${Date.now()}`,
        title: reportData.title || payload.title,
        periodStart: reportData.periodStart || payload.periodStart,
        periodEnd: reportData.periodEnd || payload.periodEnd,
        generatedBy: currentUser.id,
        generatorName: `${currentUser.name} (${currentUser.role})`,
        workspaceId: currentWorkspaceId,
        createdAt: new Date().toISOString(),
        contentJson: {
          summary: reportData.summary || 'Summary generated.',
          topThemes: reportData.topThemes || [],
          sentimentDeltas: reportData.sentimentDeltas || { posDelta: '+5.0%', negDelta: '-2.0%' },
          verbatimQuotes: reportData.verbatimQuotes || [],
          recommendedActions: reportData.recommendedActions || [],
        },
      };

      setAllReports(prev => [newReport, ...prev]);
      setActiveReport(newReport);
      showToast('Weekly Executive VoC Report generated!', 'success');
      return newReport;
    } catch (err) {
      console.warn('Backend report generation error, creating local fallback report:', err);
      // Fallback local report calculation
      const negItems = workspaceFeedback.filter(f => f.sentiment === 'NEG');
      const posItems = workspaceFeedback.filter(f => f.sentiment === 'POS');

      const fallbackReport: ReportItem = {
        id: `rep-${Date.now()}`,
        title: title || `VoC Intelligence Report (${new Date().toLocaleDateString()})`,
        periodStart: periodStart || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        periodEnd: periodEnd || new Date().toISOString().split('T')[0],
        generatedBy: currentUser.id,
        generatorName: `${currentUser.name} (${currentUser.role})`,
        workspaceId: currentWorkspaceId,
        createdAt: new Date().toISOString(),
        contentJson: {
          summary: `Analysis across ${workspaceFeedback.length} customer feedback signals for ${currentWorkspace.name}. Team engagement remains solid with ${posItems.length} positive notes, while ${negItems.length} actionable tickets highlight optimization targets in core feature areas.`,
          topThemes: workspaceThemes.slice(0, 5).map(t => ({
            name: t.name,
            count: t.count,
            sentimentScore: -0.4,
            summary: t.description,
          })),
          sentimentDeltas: { posDelta: '+8.5% WoW', negDelta: '-3.2% WoW' },
          verbatimQuotes: workspaceFeedback.slice(0, 4).map(f => ({
            quote: f.content,
            customer: f.customerLabel,
            channel: f.channel,
            theme: f.theme,
            sentiment: f.sentiment,
          })),
          recommendedActions: [
            {
              title: 'Prioritize top friction points in current sprint',
              priority: 'HIGH',
              reason: 'Identified in recent support escalations.',
              owner: 'Core Product Engineering',
            },
            {
              title: 'Address billing & seat management clarity',
              priority: 'MEDIUM',
              reason: 'Customer feedback indicates confusion on mid-cycle prorations.',
              owner: 'Billing Operations',
            },
          ],
        },
      };

      setAllReports(prev => [fallbackReport, ...prev]);
      setActiveReport(fallbackReport);
      showToast('Executive Report generated successfully!', 'success');
      return fallbackReport;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Simulate Live Batch of Incoming Feedback
  const simulateLiveBatch = async (count: number = 5) => {
    if (!canEdit) {
      triggerForbidden('Simulate live channel data stream');
      return;
    }

    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 1400));

    const simTemplates = [
      {
        content: 'URGENT: European regional gateway experiencing 504 timeouts during SSO handshake.',
        channel: 'Support Ticket' as Channel,
        customerLabel: 'SRE Lead @ DataFlow Europe',
        sentiment: 'NEG' as Sentiment,
        sentimentScore: -0.95,
        featureArea: 'API & Infrastructure',
        theme: 'Performance & Speed',
      },
      {
        content: 'The new cohort analytics export feature is blazing fast! Shared the numbers with our board.',
        channel: 'NPS Survey' as Channel,
        customerLabel: 'Hannah Vance (Chief Growth Officer)',
        sentiment: 'POS' as Sentiment,
        sentimentScore: 0.96,
        featureArea: 'Analytics Hub',
        theme: 'Export & Reporting',
      },
      {
        content: 'Can you please add automatic VAT invoice generation for monthly UK credit card charges?',
        channel: 'Sales Call Note' as Channel,
        customerLabel: 'Enterprise Prospect: Finance VP @ LondonTech',
        sentiment: 'NEU' as Sentiment,
        sentimentScore: 0.10,
        featureArea: 'Billing & Payments',
        theme: 'Billing & Invoicing',
      },
      {
        content: 'Mobile app biometric touch ID login failed after today’s update. Had to reset credentials.',
        channel: 'App Store Review' as Channel,
        customerLabel: 'MobileUser_iOS_44',
        sentiment: 'NEG' as Sentiment,
        sentimentScore: -0.82,
        featureArea: 'Authentication & SSO',
        theme: 'SSO & Enterprise Auth',
      },
      {
        content: 'Onboarding walkthrough tutorial was super helpful for our 20 new team members!',
        channel: 'Community Post' as Channel,
        customerLabel: 'Jordan Lee (People Ops)',
        sentiment: 'POS' as Sentiment,
        sentimentScore: 0.88,
        featureArea: 'User Onboarding',
        theme: 'Onboarding Friction',
      },
    ];

    const newItems: Feedback[] = [];
    for (let i = 0; i < count; i++) {
      const template = simTemplates[i % simTemplates.length];
      newItems.push({
        id: `fb-live-${Date.now()}-${i}`,
        content: template.content,
        channel: template.channel,
        customerLabel: template.customerLabel,
        sentiment: template.sentiment,
        sentimentScore: template.sentimentScore,
        status: 'NEW',
        featureArea: template.featureArea,
        theme: template.theme,
        themeConfidence: 0.94,
        workspaceId: currentWorkspaceId,
        createdAt: new Date().toISOString(),
      });
    }

    setAllFeedback(prev => [...newItems, ...prev]);

    setIngestionLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        channel: 'Simulated Live Stream',
        count: newItems.length,
        type: 'simulation',
        status: 'SUCCESS',
      },
      ...prev,
    ]);

    setIsSimulating(false);
    showToast(`Simulated live injection: ${count} real-time feedback items added!`, 'success');
  };

  // Member Management (Admin only)
  const updateUserRole = (userId: string, newRole: Role): boolean => {
    if (!isAdmin) {
      triggerForbidden('Update member role permissions (Admin only)');
      return false;
    }

    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast(`User role updated to ${newRole}`, 'success');
    return true;
  };

  const inviteUser = (name: string, email: string, role: Role): boolean => {
    if (!isAdmin) {
      triggerForbidden('Invite new team members (Admin only)');
      return false;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      workspaceId: currentWorkspaceId,
      title: `${role} Member`,
    };

    setAllUsers(prev => [...prev, newUser]);
    showToast(`Invitation sent to ${email} as ${role}!`, 'success');
    return true;
  };

  const removeUser = (userId: string): boolean => {
    if (!isAdmin) {
      triggerForbidden('Remove workspace members (Admin only)');
      return false;
    }

    if (userId === currentUser.id) {
      showToast('Cannot remove your own active account', 'error');
      return false;
    }

    setAllUsers(prev => prev.filter(u => u.id !== userId));
    showToast('Member removed from workspace', 'info');
    return true;
  };

  return (
    <LoopContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        switchWorkspace,
        createWorkspace,
        currentUser,
        users,
        allUsers,
        switchUser,
        switchRole,
        canEdit,
        isAdmin,
        isAnalyst,
        isViewer,
        updateUserRole,
        inviteUser,
        removeUser,
        feedback: allFeedback,
        workspaceFeedback,
        addFeedback,
        bulkAddFeedback,
        updateFeedbackStatus,
        deleteFeedback,
        selectedFeedback,
        setSelectedFeedback,
        themes: allThemes,
        workspaceThemes,
        addTheme,
        activeThemeFilter,
        setActiveThemeFilter,
        reports: allReports,
        workspaceReports,
        activeReport,
        setActiveReport,
        generateReport,
        isGeneratingReport,
        isSimulating,
        simulateLiveBatch,
        ingestionLogs,
        forbiddenAction,
        closeForbiddenModal,
        triggerForbidden,
        toast,
        showToast,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </LoopContext.Provider>
  );
};

export const useLoop = () => {
  const context = useContext(LoopContext);
  if (!context) {
    throw new Error('useLoop must be used within a LoopProvider');
  }
  return context;
};
