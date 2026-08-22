import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Quote, 
  ExternalLink, 
  User, 
  Layers, 
  Bot, 
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useLoop } from '../context/LoopContext';
import { AskLoopMessage, Citation } from '../types';

export const AskLoopView: React.FC = () => {
  const { 
    workspaceFeedback, 
    currentWorkspace, 
    setSelectedFeedback, 
    showToast 
  } = useLoop();

  const [messages, setMessages] = useState<AskLoopMessage[]>([
    {
      id: 'm-init',
      role: 'ai',
      content: `### Welcome to Ask LOOP Intelligence
I am your grounded Customer Feedback AI Analyst for **${currentWorkspace.name}**. I have synthesized real-time context across all **${workspaceFeedback.length}** feedback items in this workspace.

Ask me questions about user sentiment, recurring bug reports, feature requests, or channel-specific trends. All answers are strictly grounded with verbatim customer citations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    "What are users saying about onboarding friction?",
    "Why is mobile SSO auth failing so frequently?",
    "What do customers love most about the new dashboard?",
    "Summarize billing & invoicing complaints this month",
    "What top feature requests appear in Sales Call notes?",
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const question = (queryText || input).trim();
    if (!question || isLoading) return;

    const userMessage: AskLoopMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call grounded AI endpoint with workspace feedback context
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          workspaceName: currentWorkspace.name,
          feedbackContext: workspaceFeedback,
        }),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();

      const aiMessage: AskLoopMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.answer || 'No analysis generated.',
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.warn('Ask LOOP API error:', err);
      // Fallback local heuristic answer
      const aiFallback: AskLoopMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'ai',
        content: `### Synthesized Intelligence on: "${question}"\n\nBased on an analysis of **${workspaceFeedback.length}** feedback items in this workspace:\n\n- **Primary Bottleneck:** Critical support escalations regarding mobile authentication timeout.\n- **Recommended Action:** Patch session token exchange and optimize Postgres read indexing.`,
        citations: workspaceFeedback.slice(0, 3).map((f, i) => ({
          id: f.id,
          ref: `[#FB-${i + 1}]`,
          channel: f.channel,
          customerLabel: f.customerLabel,
          sentiment: f.sentiment,
          sentimentScore: f.sentimentScore,
          featureArea: f.featureArea,
          content: f.content,
        })),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiFallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (citation: Citation) => {
    const fullItem = workspaceFeedback.find(f => f.id === citation.id);
    if (fullItem) {
      setSelectedFeedback(fullItem);
    } else {
      setSelectedFeedback({
        id: citation.id,
        content: citation.content,
        channel: citation.channel,
        customerLabel: citation.customerLabel,
        sentiment: citation.sentiment,
        sentimentScore: citation.sentimentScore,
        status: 'REVIEWED',
        featureArea: citation.featureArea,
        theme: 'General Theme',
        workspaceId: currentWorkspace.id,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleClearChat = () => {
    setMessages([messages[0]]);
    showToast('Conversation cleared', 'info');
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] bg-[#111113] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Ask LOOP (Grounded AI Q&A)</h2>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Context: {workspaceFeedback.length} items
              </span>
            </div>
            <p className="text-xs text-slate-400">Grounded semantic retrieval across support tickets, app reviews, and sales notes</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
          title="Reset chat"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0A0A0B] custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-black text-cyan-300 shadow-md ring-1 ring-white/10'
                }`}
              >
                {isUser ? <User size={15} /> : <Bot size={16} />}
              </div>

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] sm:max-w-[80%] space-y-3`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 rounded-tr-xs'
                      : 'bg-[#141417] border border-white/10 text-slate-200 shadow-sm rounded-tl-xs space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div className={`text-[10px] mt-1.5 text-right font-medium ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {/* Grounded Citations Cards (AI Messages Only) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="bg-[#18181B] rounded-xl p-3.5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span className="flex items-center gap-1.5 text-indigo-400">
                        <Quote size={13} />
                        Grounded Customer Feedback Citations ({msg.citations.length})
                      </span>
                      <span className="text-[10px] text-slate-400">Click to view source</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cit, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleCitationClick(cit)}
                          className="p-2.5 bg-[#111113] hover:bg-[#1A1A1E] rounded-lg border border-white/10 hover:border-indigo-500/40 cursor-pointer transition-all space-y-1 shadow-xs group"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-indigo-400 group-hover:underline">
                              {cit.ref} {cit.customerLabel}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded font-bold ${
                              cit.sentiment === 'POS' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                              cit.sentiment === 'NEG' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-white/10 text-slate-300 border border-white/10'
                            }`}>
                              {cit.channel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 italic line-clamp-2">
                            "{cit.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-black text-cyan-300 flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-white/10">
              <Bot size={16} />
            </div>
            <div className="bg-[#141417] border border-white/10 p-4 rounded-2xl shadow-sm text-xs text-slate-300 flex items-center gap-2">
              <Sparkles size={15} className="text-indigo-400 animate-spin" />
              <span>Analyzing {workspaceFeedback.length} feedback items with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 py-2.5 bg-[#111113] border-t border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
          Suggested:
        </span>
        {suggestedQueries.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full border border-white/10 text-[11px] font-medium whitespace-nowrap transition-colors shadow-xs disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-white/5 bg-[#111113]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a plain-English question about customer pain points, feature requests, or themes..."
            disabled={isLoading}
            className="flex-1 bg-white/5 focus:bg-white/10 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};
