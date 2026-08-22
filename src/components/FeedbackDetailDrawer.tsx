import React from 'react';
import { 
  X, 
  Tag, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  Trash2, 
  User, 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useLoop } from '../context/LoopContext';
import { Status } from '../types';

export const FeedbackDetailDrawer: React.FC = () => {
  const { 
    selectedFeedback, 
    setSelectedFeedback, 
    updateFeedbackStatus, 
    deleteFeedback, 
    isAdmin, 
    canEdit,
    setActiveTab,
  } = useLoop();

  if (!selectedFeedback) return null;

  const item = selectedFeedback;

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'POS':
        return <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-semibold">Positive</span>;
      case 'NEG':
        return <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-xs font-semibold">Negative</span>;
      default:
        return <span className="bg-white/10 text-slate-300 border border-white/10 px-2 py-0.5 rounded text-xs font-semibold">Neutral</span>;
    }
  };

  const getChannelBadge = (channel: string) => {
    return (
      <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-xs font-medium">
        {channel}
      </span>
    );
  };

  // Convert -1.0 to 1.0 into 0% to 100% position
  const scorePercent = Math.min(100, Math.max(0, ((item.sentimentScore + 1) / 2) * 100));

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#111113] h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-200 overflow-hidden text-slate-200"
        role="dialog"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {item.id}
              </span>
              {getChannelBadge(item.channel)}
              {getSentimentBadge(item.sentiment)}
            </div>
            <h2 className="text-base font-bold text-white line-clamp-1 mt-1">
              {item.customerLabel}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock size={12} />
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => setSelectedFeedback(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Triage Status Control */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Triage & Workflow Status
              </label>
              {!canEdit && (
                <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
                  Read Only (Viewer)
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['NEW', 'REVIEWED', 'ACTIONED'] as Status[]).map((st) => {
                const isSelected = item.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => updateFeedbackStatus(item.id, st)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? st === 'NEW'
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                          : st === 'REVIEWED'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={13} />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verbatim Feedback Text */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-indigo-400" />
              Verbatim Customer Voice
            </label>
            <div className="p-4 bg-black/40 text-slate-200 rounded-xl text-sm font-normal leading-relaxed border border-white/10 shadow-inner">
              "{item.content}"
            </div>
          </div>

          {/* Sentiment Score Gauge */}
          <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-wider">AI Sentiment Score</span>
              <span className={`font-mono text-sm ${
                item.sentimentScore > 0.2 ? 'text-emerald-400' :
                item.sentimentScore < -0.2 ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {item.sentimentScore > 0 ? `+${item.sentimentScore.toFixed(2)}` : item.sentimentScore.toFixed(2)}
              </span>
            </div>

            {/* Gauge bar */}
            <div className="relative pt-1">
              <div className="h-2.5 w-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full overflow-hidden" />
              <div 
                className="absolute top-0 w-3.5 h-4.5 bg-white border-2 border-slate-900 rounded shadow-md -translate-x-1/2 transition-all duration-300"
                style={{ left: `${scorePercent}%` }}
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                <span>-1.0 (Critical Neg)</span>
                <span>0.0 (Neutral)</span>
                <span>+1.0 (High Pos)</span>
              </div>
            </div>
          </div>

          {/* Classification & Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Feature Area</span>
              <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Tag size={13} className="text-indigo-400" />
                {item.featureArea || 'General UI'}
              </p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Clustered Theme</span>
              <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Layers size={13} className="text-indigo-400" />
                {item.theme || 'Uncategorized'}
              </p>
              {item.themeConfidence && (
                <span className="text-[10px] text-slate-400">
                  Confidence: {Math.round(item.themeConfidence * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* Customer Metadata Card */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User size={13} className="text-indigo-400" />
              Customer Profile & Source
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Identified Handle:</span>
                <span className="font-semibold text-white">{item.customerLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ingestion Channel:</span>
                <span className="font-semibold text-white">{item.channel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0D0D0F] border-t border-white/5 flex items-center justify-between">
          {isAdmin ? (
            <button
              onClick={() => deleteFeedback(item.id)}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete Record</span>
            </button>
          ) : <div />}

          <button
            onClick={() => {
              setSelectedFeedback(null);
              setActiveTab('ask');
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
          >
            <Sparkles size={14} />
            <span>Ask LOOP about this issue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
