import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  Filter, 
  Calendar, 
  Sparkles, 
  Layers, 
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { useLoop } from '../context/LoopContext';
import { Channel, Sentiment } from '../types';
import { CHANNELS } from '../data/seedData';

export const DashboardView: React.FC = () => {
  const { workspaceFeedback, workspaceThemes, setSelectedFeedback, setActiveTab } = useLoop();

  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d' | 'all'>('30d');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');

  // Filter feedback by date range and channel
  const filteredFeedback = useMemo(() => {
    let items = [...workspaceFeedback];

    // Channel filter
    if (selectedChannel !== 'All') {
      items = items.filter(f => f.channel === selectedChannel);
    }

    // Date range filter
    const now = Date.now();
    let daysCutoff = 30;
    if (dateRange === '7d') daysCutoff = 7;
    if (dateRange === '14d') daysCutoff = 14;
    if (dateRange === '30d') daysCutoff = 30;
    if (dateRange === 'all') daysCutoff = 365;

    const cutoffMs = daysCutoff * 24 * 60 * 60 * 1000;
    items = items.filter(f => (now - new Date(f.createdAt).getTime()) <= cutoffMs);

    return items;
  }, [workspaceFeedback, selectedChannel, dateRange]);

  // High-level Stats Calculation
  const stats = useMemo(() => {
    const total = filteredFeedback.length;
    if (total === 0) {
      return {
        total: 0,
        negPercent: '0.0',
        posPercent: '0.0',
        neuPercent: '0.0',
        activeThemes: workspaceThemes.length,
        spikeLabel: 'No Spikes',
        spikeDelta: '0%',
        avgSentiment: 0.0,
      };
    }

    const negCount = filteredFeedback.filter(f => f.sentiment === 'NEG').length;
    const posCount = filteredFeedback.filter(f => f.sentiment === 'POS').length;
    const neuCount = filteredFeedback.filter(f => f.sentiment === 'NEU').length;

    const totalScore = filteredFeedback.reduce((acc, curr) => acc + curr.sentimentScore, 0);
    const avgScore = totalScore / total;

    return {
      total,
      negPercent: ((negCount / total) * 100).toFixed(1),
      posPercent: ((posCount / total) * 100).toFixed(1),
      neuPercent: ((neuCount / total) * 100).toFixed(1),
      activeThemes: workspaceThemes.length,
      spikeLabel: 'Performance & Speed',
      spikeDelta: '+60% WoW',
      avgSentiment: avgScore,
    };
  }, [filteredFeedback, workspaceThemes]);

  // Volume Over Time Chart Data
  const volumeChartData = useMemo(() => {
    const daysMap: Record<string, { date: string; total: number; pos: number; neg: number; neu: number }> = {};
    
    // Sort items chronologically
    const sorted = [...filteredFeedback].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach(item => {
      const d = new Date(item.createdAt);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (!daysMap[key]) {
        daysMap[key] = { date: key, total: 0, pos: 0, neg: 0, neu: 0 };
      }
      daysMap[key].total += 1;
      if (item.sentiment === 'POS') daysMap[key].pos += 1;
      if (item.sentiment === 'NEG') daysMap[key].neg += 1;
      if (item.sentiment === 'NEU') daysMap[key].neu += 1;
    });

    const data = Object.values(daysMap);
    if (data.length === 0) {
      return [
        { date: 'Day 1', total: 4, pos: 2, neg: 1, neu: 1 },
        { date: 'Day 2', total: 8, pos: 5, neg: 2, neu: 1 },
        { date: 'Day 3', total: 14, pos: 8, neg: 4, neu: 2 },
        { date: 'Day 4', total: 18, pos: 10, neg: 5, neu: 3 },
      ];
    }
    return data;
  }, [filteredFeedback]);

  // Sentiment Breakdown Donut Data
  const sentimentPieData = useMemo(() => {
    const pos = filteredFeedback.filter(f => f.sentiment === 'POS').length;
    const neu = filteredFeedback.filter(f => f.sentiment === 'NEU').length;
    const neg = filteredFeedback.filter(f => f.sentiment === 'NEG').length;

    return [
      { name: 'Positive', value: pos || 1, color: '#10B981' },
      { name: 'Neutral', value: neu || 1, color: '#64748B' },
      { name: 'Negative', value: neg || 1, color: '#EF4444' },
    ];
  }, [filteredFeedback]);

  // Top Themes Bar Chart Data
  const themesBarData = useMemo(() => {
    return workspaceThemes
      .slice(0, 5)
      .map(theme => {
        const matchingFeedback = filteredFeedback.filter(f => f.theme === theme.name);
        return {
          name: theme.name.length > 18 ? `${theme.name.slice(0, 16)}...` : theme.name,
          fullName: theme.name,
          count: matchingFeedback.length,
          color: theme.color,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [workspaceThemes, filteredFeedback]);

  // Recent Critical Signals Feed
  const recentCriticalSignals = useMemo(() => {
    return filteredFeedback
      .filter(f => f.sentiment === 'NEG' || f.sentimentScore <= -0.7)
      .slice(0, 4);
  }, [filteredFeedback]);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111113] p-4 rounded-xl border border-white/5 shadow-xs">
        {/* Channel Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full custom-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Filter size={12} />
            Channel:
          </span>
          <button
            onClick={() => setSelectedChannel('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedChannel === 'All'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
            }`}
          >
            All Channels
          </button>
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedChannel === ch
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={12} />
            Period:
          </span>
          <div className="bg-white/5 p-0.5 rounded-lg border border-white/10 flex text-xs font-medium">
            {[
              { id: '7d', label: '7D' },
              { id: '14d', label: '14D' },
              { id: '30d', label: '30D' },
              { id: 'all', label: 'All' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRange(p.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  dateRange === p.id
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Feedback Volume"
          value={stats.total}
          subtitle={`Across ${selectedChannel === 'All' ? '5 Channels' : selectedChannel}`}
          delta="+14.2% YoY"
          trend="up"
        />
        <StatCard
          title="Negative Sentiment Rate"
          value={`${stats.negPercent}%`}
          subtitle={`${filteredFeedback.filter(f => f.sentiment === 'NEG').length} critical issues`}
          delta="+2.4% WoW"
          trend="up"
          isBad
        />
        <StatCard
          title="Active Clustered Themes"
          value={stats.activeThemes}
          subtitle="Real-time AI categorization"
          delta="Stable"
          trend="neutral"
        />
        <StatCard
          title="Volume Spike Alert"
          value={stats.spikeLabel}
          subtitle="Top friction velocity"
          delta={stats.spikeDelta}
          trend="up"
          isBad
          highlight
        />
      </div>

      {/* Charts Row: Volume Over Time & Sentiment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: Feedback Volume Over Time */}
        <div className="lg:col-span-2 bg-[#111113] p-6 rounded-xl border border-white/5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Feedback Volume & Trends Over Time</h3>
              <p className="text-xs text-slate-400">Daily frequency of ingested customer touchpoints</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Total Volume
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Positive
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Negative
              </span>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111113',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="pos" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="neg" stroke="#EF4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorNeg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Sentiment Breakdown */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Sentiment Distribution</h3>
            <p className="text-xs text-slate-400">Distribution across active feedback sample</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111113',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-white">
                {stats.posPercent}%
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Positive Net
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-center">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="block text-[10px] uppercase font-bold text-emerald-400">POS</span>
              <span className="text-xs font-bold text-white">{stats.posPercent}%</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="block text-[10px] uppercase font-bold text-slate-400">NEU</span>
              <span className="text-xs font-bold text-white">{stats.neuPercent}%</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="block text-[10px] uppercase font-bold text-rose-400">NEG</span>
              <span className="text-xs font-bold text-white">{stats.negPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top 5 Themes by Volume & Recent High-Impact Signals Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Themes Bar Chart */}
        <div className="lg:col-span-2 bg-[#111113] p-6 rounded-xl border border-white/5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Top Themes by Feedback Volume</h3>
              <p className="text-xs text-slate-400">Ranked by total mentions across all channels</p>
            </div>
            <button
              onClick={() => setActiveTab('trends')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Explore Trends</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={themesBarData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={130} />
                <Tooltip
                  formatter={(value: any, _name: any, item: any) => [`${value} mentions`, item.payload.fullName]}
                  contentStyle={{
                    backgroundColor: '#111113',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {themesBarData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Impact Feedback Signals */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-400" />
                High-Impact Signals
              </h3>
              <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                Live Alert
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Critical negative issues requiring priority triage</p>

            <div className="space-y-2.5">
              {recentCriticalSignals.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className="p-3 bg-white/[0.02] hover:bg-white/[0.06] rounded-lg border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                      {item.customerLabel}
                    </span>
                    <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                      {item.channel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-relaxed">
                    "{item.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('inbox')}
            className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <span>View All Feedback in Inbox</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  isBad?: boolean;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  delta,
  trend,
  isBad = false,
  highlight = false,
}) => {
  const isPos = trend === 'up';

  const getDeltaColor = () => {
    if (trend === 'neutral') return 'text-slate-400 bg-white/5 border border-white/10';
    if (isBad) {
      return isPos ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
    }
    return isPos ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
  };

  return (
    <div className={`p-5 rounded-xl border transition-all shadow-xs ${
      highlight
        ? 'bg-[#111113] border-indigo-500/30 ring-1 ring-indigo-500/20'
        : 'bg-[#111113] border-white/5 hover:border-white/15'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${getDeltaColor()}`}>
          {trend === 'up' && <TrendingUp size={11} />}
          {trend === 'down' && <TrendingDown size={11} />}
          {delta}
        </span>
      </div>

      <div className="mt-1">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{value}</h2>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};
