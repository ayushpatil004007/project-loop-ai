import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useLoop } from '../context/LoopContext';
import { Feedback, Status, Channel, Sentiment } from '../types';
import { CHANNELS } from '../data/seedData';

export const InboxView: React.FC = () => {
  const { 
    workspaceFeedback, 
    workspaceThemes, 
    setSelectedFeedback, 
    updateFeedbackStatus, 
    canEdit, 
    activeThemeFilter, 
    setActiveThemeFilter,
    showToast
  } = useLoop();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [sentimentFilter, setSentimentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [themeFilter, setThemeFilter] = useState<string>(activeThemeFilter || 'All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sorting
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-Filter & Search execution
  const filteredFeedback = useMemo(() => {
    let result = [...workspaceFeedback];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        f => f.content.toLowerCase().includes(q) || 
             f.customerLabel.toLowerCase().includes(q) || 
             f.featureArea.toLowerCase().includes(q) ||
             f.theme.toLowerCase().includes(q)
      );
    }

    // Channel filter
    if (channelFilter !== 'All') {
      result = result.filter(f => f.channel === channelFilter);
    }

    // Sentiment filter
    if (sentimentFilter !== 'All') {
      result = result.filter(f => f.sentiment === sentimentFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(f => f.status === statusFilter);
    }

    // Theme filter
    if (themeFilter !== 'All') {
      result = result.filter(f => f.theme === themeFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else {
        return sortOrder === 'desc' ? b.sentimentScore - a.sentimentScore : a.sentimentScore - b.sentimentScore;
      }
    });

    return result;
  }, [workspaceFeedback, searchQuery, channelFilter, sentimentFilter, statusFilter, themeFilter, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredFeedback.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFeedback.slice(start, start + pageSize);
  }, [filteredFeedback, currentPage, pageSize]);

  const resetFilters = () => {
    setSearchQuery('');
    setChannelFilter('All');
    setSentimentFilter('All');
    setStatusFilter('All');
    setThemeFilter('All');
    setActiveThemeFilter(null);
    setCurrentPage(1);
  };

  // Export filtered items to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Channel', 'Customer', 'Sentiment', 'Score', 'Status', 'Feature Area', 'Theme', 'Date', 'Content'];
    const rows = filteredFeedback.map(f => [
      f.id,
      `"${f.channel}"`,
      `"${f.customerLabel}"`,
      f.sentiment,
      f.sentimentScore,
      f.status,
      `"${f.featureArea}"`,
      `"${f.theme}"`,
      f.createdAt,
      `"${f.content.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `feedback_inbox_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredFeedback.length} feedback records to CSV!`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-[#111113] rounded-xl border border-white/5 shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Full-text Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search feedback by verbatim text, customer handle, feature area, or theme..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-xs text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Export and Reset actions */}
          <div className="flex items-center gap-2">
            {(searchQuery || channelFilter !== 'All' || sentimentFilter !== 'All' || statusFilter !== 'All' || themeFilter !== 'All') && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors shadow-xs"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-xs">
          {/* Channel Dropdown */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Channel
            </label>
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#18181B] border border-white/10 rounded-md py-1.5 px-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All" className="bg-[#18181B] text-white">All Channels</option>
              {CHANNELS.map(c => <option key={c} value={c} className="bg-[#18181B] text-white">{c}</option>)}
            </select>
          </div>

          {/* Sentiment Dropdown */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sentiment
            </label>
            <select
              value={sentimentFilter}
              onChange={(e) => {
                setSentimentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#18181B] border border-white/10 rounded-md py-1.5 px-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All" className="bg-[#18181B] text-white">All Sentiments</option>
              <option value="POS" className="bg-[#18181B] text-white">Positive (POS)</option>
              <option value="NEU" className="bg-[#18181B] text-white">Neutral (NEU)</option>
              <option value="NEG" className="bg-[#18181B] text-white">Negative (NEG)</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Triage Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#18181B] border border-white/10 rounded-md py-1.5 px-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All" className="bg-[#18181B] text-white">All Statuses</option>
              <option value="NEW" className="bg-[#18181B] text-white">NEW (Pending)</option>
              <option value="REVIEWED" className="bg-[#18181B] text-white">REVIEWED</option>
              <option value="ACTIONED" className="bg-[#18181B] text-white">ACTIONED</option>
            </select>
          </div>

          {/* Theme Dropdown */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Theme Cluster
            </label>
            <select
              value={themeFilter}
              onChange={(e) => {
                setThemeFilter(e.target.value);
                setActiveThemeFilter(e.target.value === 'All' ? null : e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#18181B] border border-white/10 rounded-md py-1.5 px-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All" className="bg-[#18181B] text-white">All Themes</option>
              {workspaceThemes.map(t => (
                <option key={t.id} value={t.name} className="bg-[#18181B] text-white">
                  {t.name} ({t.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Feedback Data Table */}
      <div className="bg-[#111113] rounded-xl border border-white/5 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase font-bold text-slate-400 bg-white/[0.02] border-b border-white/5 tracking-wider">
                <th className="py-3 px-4 w-4/12">Verbatim Customer Content</th>
                <th className="py-3 px-4 w-2/12">Channel & Source</th>
                <th className="py-3 px-4 w-2/12">
                  <button 
                    onClick={() => {
                      setSortBy('score');
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>Sentiment</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="py-3 px-4 w-2/12">Feature / Theme</th>
                <th className="py-3 px-4 w-2/12 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 space-y-2">
                    <AlertCircle size={28} className="mx-auto text-slate-500" />
                    <p className="font-semibold text-slate-200">No customer feedback matching criteria</p>
                    <p className="text-[11px] text-slate-500">Try adjusting your search keywords or resetting filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const sentimentColor =
                    item.sentiment === 'POS'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : item.sentiment === 'NEG'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-white/5 text-slate-300 border-white/10';

                  const statusColor =
                    item.status === 'ACTIONED'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : item.status === 'REVIEWED'
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedFeedback(item)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Content */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">{item.customerLabel}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 text-slate-300 border border-white/10">
                          {item.channel}
                        </span>
                      </td>

                      {/* Sentiment */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sentimentColor}`}>
                            {item.sentiment}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {item.sentimentScore > 0 ? `+${item.sentimentScore.toFixed(2)}` : item.sentimentScore.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Feature & Theme */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-200 text-[11px] flex items-center gap-1">
                            <Tag size={11} className="text-indigo-400" />
                            {item.featureArea || 'General'}
                          </p>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {item.theme}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) => updateFeedbackStatus(item.id, e.target.value as Status)}
                          disabled={!canEdit}
                          className={`text-[11px] font-semibold py-1 px-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed ${statusColor}`}
                        >
                          <option value="NEW" className="bg-[#18181B] text-amber-300">NEW</option>
                          <option value="REVIEWED" className="bg-[#18181B] text-indigo-300">REVIEWED</option>
                          <option value="ACTIONED" className="bg-[#18181B] text-emerald-300">ACTIONED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0D0D0F] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 font-semibold text-xs text-slate-200"
            >
              <option value={10} className="bg-[#18181B] text-white">10</option>
              <option value={25} className="bg-[#18181B] text-white">25</option>
              <option value={50} className="bg-[#18181B] text-white">50</option>
            </select>
            <span>of <strong className="text-white">{filteredFeedback.length}</strong> items</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-colors text-slate-300"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-colors text-slate-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
