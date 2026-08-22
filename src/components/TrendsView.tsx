import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  X,
  MessageSquare
} from 'lucide-react';
import { useLoop } from '../context/LoopContext';
import { Theme } from '../types';

export const TrendsView: React.FC = () => {
  const { 
    workspaceThemes, 
    workspaceFeedback, 
    addTheme, 
    canEdit, 
    triggerForbidden, 
    setSelectedFeedback, 
    setActiveTab,
    setActiveThemeFilter
  } = useLoop();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDesc, setNewThemeDesc] = useState('');
  const [newThemeColor, setNewThemeColor] = useState('#3B82F6');

  // Drill-down Modal State
  const [selectedThemeDrill, setSelectedThemeDrill] = useState<Theme | null>(null);

  const handleAddThemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      triggerForbidden('Create new intelligence theme');
      return;
    }
    if (!newThemeName.trim()) return;

    addTheme(newThemeName, newThemeDesc, newThemeColor);
    setNewThemeName('');
    setNewThemeDesc('');
    setIsAddModalOpen(false);
  };

  // Get sentiment distribution for a theme
  const getThemeStats = (themeName: string) => {
    const items = workspaceFeedback.filter(f => f.theme === themeName);
    const total = items.length;
    if (total === 0) return { total: 0, posPercent: 0, neuPercent: 0, negPercent: 0 };

    const pos = items.filter(f => f.sentiment === 'POS').length;
    const neu = items.filter(f => f.sentiment === 'NEU').length;
    const neg = items.filter(f => f.sentiment === 'NEG').length;

    return {
      total,
      posPercent: Math.round((pos / total) * 100),
      neuPercent: Math.round((neu / total) * 100),
      negPercent: Math.round((neg / total) * 100),
    };
  };

  const drilldownFeedback = selectedThemeDrill
    ? workspaceFeedback.filter(f => f.theme === selectedThemeDrill.name)
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Themes & Spike Velocity Intelligence</h2>
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              Automated Clustering
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time clustering of incoming customer signals with automated Week-over-Week volume spike alerts
          </p>
        </div>

        <button
          onClick={() => {
            if (!canEdit) {
              triggerForbidden('Create new custom theme');
              return;
            }
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
        >
          <Plus size={14} />
          <span>Add Custom Theme</span>
        </button>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaceThemes.map((theme) => {
          const stats = getThemeStats(theme.name);
          const isSpike = theme.isSpike || theme.delta.includes('+60') || stats.negPercent > 50;

          return (
            <div
              key={theme.id}
              onClick={() => setSelectedThemeDrill(theme)}
              className={`bg-[#111113] rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-lg cursor-pointer group relative overflow-hidden ${
                isSpike
                  ? 'border-rose-500/50 ring-1 ring-rose-500/30 hover:border-rose-500/80'
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              {/* Spike Indicator Banner */}
              {isSpike && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-lg tracking-widest flex items-center gap-1 shadow-md">
                  <AlertTriangle size={10} />
                  VOLUME SPIKE
                </div>
              )}

              <div>
                {/* Header Icon & Delta */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: `${theme.color}25`, color: theme.color }}
                  >
                    <Layers size={20} />
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                      theme.delta.startsWith('+')
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : theme.delta.startsWith('-')
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {theme.delta.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {theme.delta}
                  </span>
                </div>

                {/* Theme Name & Description */}
                <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                  {theme.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {theme.description || 'Customer issues clustered around this feature area.'}
                </p>
              </div>

              {/* Stats Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Ingested:</span>
                  <span className="font-extrabold text-white text-sm">
                    {stats.total} mentions
                  </span>
                </div>

                {/* Mini Sentiment Bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span className="text-emerald-400">{stats.posPercent}% POS</span>
                    <span className="text-slate-400">{stats.neuPercent}% NEU</span>
                    <span className="text-rose-400">{stats.negPercent}% NEG</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
                    <div style={{ width: `${stats.posPercent}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${stats.neuPercent}%` }} className="bg-slate-400 h-full" />
                    <div style={{ width: `${stats.negPercent}%` }} className="bg-rose-500 h-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300 pt-1">
                  <span>Drill down into feedback</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill-down Modal */}
      {selectedThemeDrill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111113] rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedThemeDrill.color }}
                  />
                  <h3 className="text-base font-bold text-white">{selectedThemeDrill.name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {drilldownFeedback.length} items
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedThemeDrill.description}</p>
              </div>

              <button
                onClick={() => setSelectedThemeDrill(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal List Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {drilldownFeedback.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">No feedback tagged with this theme yet.</p>
              ) : (
                drilldownFeedback.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedThemeDrill(null);
                      setSelectedFeedback(item);
                    }}
                    className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-colors space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {item.customerLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-400">{item.channel}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          item.sentiment === 'POS' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                          item.sentiment === 'NEG' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-white/10 text-slate-300 border border-white/10'
                        }`}>
                          {item.sentiment}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      "{item.content}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0D0D0F] flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveThemeFilter(selectedThemeDrill.name);
                  setSelectedThemeDrill(null);
                  setActiveTab('inbox');
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Filter size={13} />
                <span>Filter Inbox by this Theme</span>
              </button>

              <button
                onClick={() => setSelectedThemeDrill(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Theme Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111113] rounded-2xl max-w-md w-full shadow-2xl border border-white/10 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Create Intelligence Theme</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddThemeSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Theme Name *
                </label>
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="e.g. AI Copilot Latency"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Description / Clustering Scope
                </label>
                <textarea
                  value={newThemeDesc}
                  onChange={(e) => setNewThemeDesc(e.target.value)}
                  placeholder="Describe the issues or feature requests grouped under this theme..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#06B6D4'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewThemeColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newThemeColor === col ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111113] scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
                >
                  Create Theme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
