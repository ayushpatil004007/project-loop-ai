export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER';

export type Sentiment = 'POS' | 'NEU' | 'NEG';

export type Status = 'NEW' | 'REVIEWED' | 'ACTIONED';

export type Channel = 
  | 'Support Ticket'
  | 'App Store Review'
  | 'NPS Survey'
  | 'Sales Call Note'
  | 'Community Post';

export interface Workspace {
  id: string;
  name: string;
  domain?: string;
  plan: 'Growth' | 'Enterprise' | 'Startup';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  workspaceId: string;
  avatar?: string;
  title?: string;
}

export interface Feedback {
  id: string;
  content: string;
  channel: Channel;
  customerLabel: string;
  sentiment: Sentiment;
  sentimentScore: number; // -1.0 to 1.0
  status: Status;
  featureArea: string;
  theme: string;
  themeConfidence?: number;
  workspaceId: string;
  createdAt: string;
  assignedTo?: string;
  notes?: string[];
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  color: string;
  workspaceId: string;
  count: number;
  delta: string; // e.g. "+60%", "-5%"
  isSpike?: boolean;
}

export interface ReportItem {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: {
    summary: string;
    topThemes: {
      name: string;
      count: number;
      sentimentScore: number;
      summary?: string;
    }[];
    sentimentDeltas: {
      posDelta: string;
      negDelta: string;
    };
    verbatimQuotes: {
      quote: string;
      customer: string;
      channel: string;
      theme: string;
      sentiment: Sentiment;
    }[];
    recommendedActions: {
      title: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      reason: string;
      owner: string;
    }[];
  };
  generatedBy: string;
  generatorName?: string;
  workspaceId: string;
  createdAt: string;
}

export interface Citation {
  id: string;
  ref: string;
  channel: Channel;
  customerLabel: string;
  sentiment: Sentiment;
  sentimentScore: number;
  featureArea: string;
  content: string;
}

export interface AskLoopMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  citations?: Citation[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface IngestionLog {
  id: string;
  timestamp: string;
  channel: string;
  count: number;
  type: 'manual' | 'csv' | 'simulation';
  status: 'SUCCESS' | 'ERROR';
}
