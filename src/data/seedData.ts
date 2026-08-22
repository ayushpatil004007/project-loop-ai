import { Workspace, User, Theme, Feedback, ReportItem, Channel } from '../types';

export const CHANNELS: Channel[] = [
  'Support Ticket',
  'App Store Review',
  'NPS Survey',
  'Sales Call Note',
  'Community Post',
];

export const WORKSPACES: Workspace[] = [
  {
    id: 'ws-acme',
    name: 'Acme Corp SaaS',
    domain: 'acme.corp',
    plan: 'Enterprise',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'ws-finflow',
    name: 'FinFlow Payments',
    domain: 'finflow.io',
    plan: 'Growth',
    createdAt: '2026-02-15T10:30:00.000Z',
  },
];

export const USERS: User[] = [
  {
    id: 'u1',
    email: 'admin@loopdemo.com',
    name: 'Sarah Chen',
    role: 'ADMIN',
    workspaceId: 'ws-acme',
    title: 'VP of Product',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u2',
    email: 'analyst@loopdemo.com',
    name: 'Mark Rodriguez',
    role: 'ANALYST',
    workspaceId: 'ws-acme',
    title: 'Customer Insights Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u3',
    email: 'viewer@loopdemo.com',
    name: 'Jane Doe',
    role: 'VIEWER',
    workspaceId: 'ws-acme',
    title: 'Operations Analyst',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u4',
    email: 'alex.fin@finflow.io',
    name: 'Alex Rivera',
    role: 'ADMIN',
    workspaceId: 'ws-finflow',
    title: 'Head of Customer Experience',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_THEMES: Theme[] = [
  {
    id: 't1',
    name: 'Onboarding Friction',
    description: 'Confusion during initial team invite, permission setups, and workspace onboarding tutorials.',
    color: '#EF4444',
    workspaceId: 'ws-acme',
    count: 42,
    delta: '+12% WoW',
    isSpike: false,
  },
  {
    id: 't2',
    name: 'Billing & Invoicing',
    description: 'Inquiries regarding prorated seat additions, tax receipts, and annual contract invoicing.',
    color: '#F59E0B',
    workspaceId: 'ws-acme',
    count: 28,
    delta: '-5% WoW',
    isSpike: false,
  },
  {
    id: 't3',
    name: 'Performance & Speed',
    description: 'Regional latency, query timeouts on large workspaces, and mobile app UI responsiveness.',
    color: '#3B82F6',
    workspaceId: 'ws-acme',
    count: 25,
    delta: '+60% WoW',
    isSpike: true,
  },
  {
    id: 't4',
    name: 'SSO & Enterprise Auth',
    description: 'Okta SAML 2.0 mapping, multi-factor auth resets, and session timeout intervals on mobile.',
    color: '#8B5CF6',
    workspaceId: 'ws-acme',
    count: 15,
    delta: '+2% WoW',
    isSpike: false,
  },
  {
    id: 't5',
    name: 'Export & Reporting',
    description: 'CSV bulk downloader, PDF executive summaries, and raw webhooks stream requests.',
    color: '#10B981',
    workspaceId: 'ws-acme',
    count: 10,
    delta: '0% WoW',
    isSpike: false,
  },
  // Themes for FinFlow
  {
    id: 't-ff1',
    name: 'Payment Webhook Latency',
    description: 'Webhook delivery delays for Stripe and Adyen capture events.',
    color: '#EC4899',
    workspaceId: 'ws-finflow',
    count: 18,
    delta: '+15% WoW',
  },
  {
    id: 't-ff2',
    name: 'Chargeback Portal UX',
    description: 'Evidence submission upload errors and PDF preview.',
    color: '#06B6D4',
    workspaceId: 'ws-finflow',
    count: 12,
    delta: '-8% WoW',
  },
];

// Rich 120 realistic feedback items generator for Acme Corp
const sampleTemplates = [
  {
    content: "The SSO login keeps timing out on mobile devices whenever we switch from Wi-Fi to cellular data.",
    channel: "Support Ticket" as Channel,
    customerLabel: "Elena Rostova (DevOps Lead @ GlobalScale)",
    sentiment: "NEG" as const,
    score: -0.85,
    featureArea: "Authentication & SSO",
    theme: "SSO & Enterprise Auth",
  },
  {
    content: "Love the new real-time analytics dashboard! It gives our executive team instantaneous visibility into customer sentiment.",
    channel: "NPS Survey" as Channel,
    customerLabel: "David Kim (VP Product @ CloudVibe)",
    sentiment: "POS" as const,
    score: 0.92,
    featureArea: "Analytics Hub",
    theme: "Export & Reporting",
  },
  {
    content: "Why is the billing proration so confusing? When we added 15 enterprise seats mid-month, the itemized invoice made no sense.",
    channel: "Support Ticket" as Channel,
    customerLabel: "Marcus Thorne (Finance Director @ ApexLabs)",
    sentiment: "NEG" as const,
    score: -0.75,
    featureArea: "Billing & Payments",
    theme: "Billing & Invoicing",
  },
  {
    content: "The app is significantly slower since the v2.4 deployment. Loading the feedback table takes up to 6 seconds now.",
    channel: "App Store Review" as Channel,
    customerLabel: "TechReviewer_99",
    sentiment: "NEG" as const,
    score: -0.88,
    featureArea: "Performance Core",
    theme: "Performance & Speed",
  },
  {
    content: "Support team resolved our SAML 2.0 Okta federation problem within 15 minutes. Best B2B customer support experience.",
    channel: "Community Post" as Channel,
    customerLabel: "Priya Patel (Security Architect @ FinBridge)",
    sentiment: "POS" as const,
    score: 0.85,
    featureArea: "Customer Support",
    theme: "SSO & Enterprise Auth",
  },
  {
    content: "Would love to see an automated weekly email digest for Voice of Customer reports sent straight to Slack or PDF.",
    channel: "Sales Call Note" as Channel,
    customerLabel: "Prospect: CTO @ ScaleMatrix ($120k ARR)",
    sentiment: "NEU" as const,
    score: 0.15,
    featureArea: "Export & Reporting",
    theme: "Export & Reporting",
  },
  {
    content: "Initial onboarding wizard got stuck on step 3 when inviting team members without admin privileges.",
    channel: "Support Ticket" as Channel,
    customerLabel: "Chloe Bennett (HR Ops @ OmniCorp)",
    sentiment: "NEG" as const,
    score: -0.65,
    featureArea: "User Onboarding",
    theme: "Onboarding Friction",
  },
  {
    content: "CSV Bulk upload parsed 5,000 feedback tickets in under 3 seconds without any column mismatch errors. Outstanding!",
    channel: "Community Post" as Channel,
    customerLabel: "Liam O'Connor (Data Engineer)",
    sentiment: "POS" as const,
    score: 0.94,
    featureArea: "Data Ingestion",
    theme: "Export & Reporting",
  },
  {
    content: "We need role-based access control where external contractors only have Viewer rights to specific tagged themes.",
    channel: "Sales Call Note" as Channel,
    customerLabel: "Prospect: CISO @ HealthTech Solutions",
    sentiment: "NEU" as const,
    score: 0.05,
    featureArea: "Security & RBAC",
    theme: "SSO & Enterprise Auth",
  },
  {
    content: "Search filtering by channel and date range is extremely fast and intuitive. Saves our team hours every week.",
    channel: "NPS Survey" as Channel,
    customerLabel: "Sophia Martinez (Head of CX @ TravelEase)",
    sentiment: "POS" as const,
    score: 0.89,
    featureArea: "Search & Filtering",
    theme: "Performance & Speed",
  },
  {
    content: "Getting intermittent 502 Bad Gateway errors when querying trend reports during peak morning European hours.",
    channel: "Support Ticket" as Channel,
    customerLabel: "Alexander Schmidt (SRE @ BerlinData)",
    sentiment: "NEG" as const,
    score: -0.92,
    featureArea: "API & Infrastructure",
    theme: "Performance & Speed",
  },
  {
    content: "Can we get custom color palettes for our exported executive slide presentations?",
    channel: "Community Post" as Channel,
    customerLabel: "Morgan Reed (Design Ops)",
    sentiment: "NEU" as const,
    score: 0.20,
    featureArea: "Export & Reporting",
    theme: "Export & Reporting",
  },
];

export const generateSeedFeedback = (): Feedback[] => {
  const items: Feedback[] = [];
  const baseTime = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  // Generate exact 120 items for Acme Corp SaaS
  for (let i = 0; i < 120; i++) {
    const template = sampleTemplates[i % sampleTemplates.length];
    const timestampOffset = Math.floor((i / 120) * thirtyDaysMs);
    const createdAt = new Date(baseTime - timestampOffset).toISOString();
    
    // Status distribution: 60% Actioned, 25% Reviewed, 15% New
    const status = i < 72 ? 'ACTIONED' : i < 102 ? 'REVIEWED' : 'NEW';
    
    const customerSuffix = 100 + (i % 35);
    const customLabel = i % 3 === 0 
      ? template.customerLabel 
      : `${template.customerLabel.split('(')[0].trim()} (#${customerSuffix})`;

    items.push({
      id: `fb-acme-${i + 1}`,
      content: i % 4 === 0 
        ? `${template.content} (Ticket ref #${1042 + i})`
        : template.content,
      channel: CHANNELS[i % CHANNELS.length],
      customerLabel: customLabel,
      sentiment: template.sentiment,
      sentimentScore: Number((template.score + (Math.sin(i) * 0.08)).toFixed(2)),
      status: status,
      featureArea: template.featureArea,
      theme: template.theme,
      themeConfidence: Number((0.82 + (Math.cos(i) * 0.12)).toFixed(2)),
      workspaceId: 'ws-acme',
      createdAt: createdAt,
    });
  }

  // Generate 25 items for FinFlow Payments workspace for true tenant isolation testing
  for (let j = 0; j < 25; j++) {
    const isNeg = j % 2 === 0;
    items.push({
      id: `fb-finflow-${j + 1}`,
      content: isNeg 
        ? `FinFlow webhook delivery took >12s for merchant capture #${9000 + j}. Please investigate latency.`
        : `FinFlow dispute portal saved us 4 hours on cardholder arbitration #${9000 + j}. Excellent UI!`,
      channel: CHANNELS[j % CHANNELS.length],
      customerLabel: `Merchant_Partner_${200 + j}`,
      sentiment: isNeg ? 'NEG' : 'POS',
      sentimentScore: isNeg ? -0.8 : 0.85,
      status: j < 15 ? 'ACTIONED' : 'NEW',
      featureArea: isNeg ? 'Webhooks & Infrastructure' : 'Dispute Center',
      theme: isNeg ? 'Payment Webhook Latency' : 'Chargeback Portal UX',
      themeConfidence: 0.91,
      workspaceId: 'ws-finflow',
      createdAt: new Date(baseTime - (j * 86400000)).toISOString(),
    });
  }

  return items;
};

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    title: 'Weekly Executive Voice-of-Customer Intelligence',
    periodStart: '2026-08-15',
    periodEnd: '2026-08-22',
    generatedBy: 'u1',
    generatorName: 'Sarah Chen (Admin)',
    workspaceId: 'ws-acme',
    createdAt: '2026-08-22T02:00:00.000Z',
    contentJson: {
      summary: `During the current reporting period, Acme Corp SaaS recorded 120 customer feedback touchpoints across all active ingestion channels. Overall net sentiment held steady at +0.24, with significant positive resonance (+92% satisfaction) around the newly launched real-time Analytics Dashboard. However, a major negative volume spike (+60% WoW) was detected in "Performance & Speed" due to database connection pooling latency during peak European hours. Mobile SSO session timeout issues also remain the leading friction point for Enterprise tier users.`,
      topThemes: [
        {
          name: 'Onboarding Friction',
          count: 42,
          sentimentScore: -0.45,
          summary: 'Users report confusion during multi-user team invites and permissions setup.',
        },
        {
          name: 'Billing & Invoicing',
          count: 28,
          sentimentScore: -0.30,
          summary: 'Inquiries regarding mid-cycle seat proration transparency on monthly statements.',
        },
        {
          name: 'Performance & Speed',
          count: 25,
          sentimentScore: -0.80,
          summary: 'Critical latency spikes reported during European business hours (v2.4 query latency).',
        },
        {
          name: 'SSO & Enterprise Auth',
          count: 15,
          sentimentScore: -0.60,
          summary: 'Mobile Okta SAML 2.0 re-authentication loops when roaming between Wi-Fi and 5G.',
        },
        {
          name: 'Export & Reporting',
          count: 10,
          sentimentScore: 0.72,
          summary: 'High praise for fast CSV exports and demand for scheduled Slack PDF digests.',
        },
      ],
      sentimentDeltas: {
        posDelta: '+12.4% WoW',
        negDelta: '-4.2% WoW',
      },
      verbatimQuotes: [
        {
          quote: "The SSO login keeps timing out on mobile devices whenever we switch from Wi-Fi to cellular data.",
          customer: "Elena Rostova (DevOps Lead @ GlobalScale)",
          channel: "Support Ticket",
          theme: "SSO & Enterprise Auth",
          sentiment: "NEG",
        },
        {
          quote: "The app is significantly slower since the v2.4 deployment. Loading the feedback table takes up to 6 seconds now.",
          customer: "TechReviewer_99",
          channel: "App Store Review",
          theme: "Performance & Speed",
          sentiment: "NEG",
        },
        {
          quote: "Love the new real-time analytics dashboard! It gives our executive team instantaneous visibility into customer sentiment.",
          customer: "David Kim (VP Product @ CloudVibe)",
          channel: "NPS Survey",
          theme: "Export & Reporting",
          sentiment: "POS",
        },
        {
          quote: "Support team resolved our SAML 2.0 Okta federation problem within 15 minutes. Best B2B customer support experience.",
          customer: "Priya Patel (Security Architect @ FinBridge)",
          channel: "Community Post",
          theme: "SSO & Enterprise Auth",
          sentiment: "POS",
        },
      ],
      recommendedActions: [
        {
          title: "Patch Mobile SAML 2.0 Network Roaming Session Handler",
          priority: "HIGH",
          reason: "Responsible for 35% of high-severity enterprise tickets logged by Fortune 500 accounts.",
          owner: "Security & Auth Squad",
        },
        {
          title: "Optimize Postgres Read-Replica Indexing for v2.4 Tables",
          priority: "HIGH",
          reason: "Eliminates 6-second query latency during peak European morning usage windows.",
          owner: "Platform SRE Team",
        },
        {
          title: "Deploy Transparent Mid-Cycle Seat Proration Visualizer",
          priority: "MEDIUM",
          reason: "Directly resolves 28 monthly billing inquiries and clarifies itemized charges.",
          owner: "Billing & Growth PM",
        },
        {
          title: "Ship Automated Slack/Email VoC Weekly PDF Dispatch",
          priority: "LOW",
          reason: "Frequently requested feature by enterprise CTOs and customer insights leaders.",
          owner: "Integrations Squad",
        },
      ],
    },
  },
];
