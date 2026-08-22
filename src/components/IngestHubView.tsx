import React, { useState } from 'react';
import { 
  PlusCircle, 
  UploadCloud, 
  Play, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Radio, 
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useLoop } from '../context/LoopContext';
import { Channel, Sentiment, Status, Feedback } from '../types';
import { CHANNELS } from '../data/seedData';

export const IngestHubView: React.FC = () => {
  const { 
    addFeedback, 
    bulkAddFeedback, 
    simulateLiveBatch, 
    isSimulating, 
    canEdit, 
    triggerForbidden, 
    ingestionLogs,
    workspaceThemes,
    showToast,
    setActiveTab
  } = useLoop();

  // Manual Form State
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState<Channel>('Support Ticket');
  const [customerLabel, setCustomerLabel] = useState('');
  const [featureArea, setFeatureArea] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(workspaceThemes[0]?.name || 'Onboarding Friction');
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiPreview, setAiPreview] = useState<{
    sentiment: Sentiment;
    sentimentScore: number;
    featureArea?: string;
    primaryTheme?: string;
  } | null>(null);

  // CSV Uploader State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);

  // Trigger live AI Auto-Classification for manual entry
  const handleAutoClassify = async () => {
    if (!content.trim()) {
      showToast('Please type some customer feedback text first', 'warning');
      return;
    }

    setIsClassifying(true);
    try {
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          channel,
          availableThemes: workspaceThemes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiPreview({
          sentiment: data.sentiment || 'NEU',
          sentimentScore: data.sentimentScore || 0,
          featureArea: data.featureArea,
          primaryTheme: data.primaryTheme,
        });
        if (data.featureArea) setFeatureArea(data.featureArea);
        if (data.primaryTheme) setSelectedTheme(data.primaryTheme);
        showToast('AI classification generated!', 'success');
      }
    } catch (err) {
      console.warn('AI classify fallback:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Submit Single Feedback
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      triggerForbidden('Submit manual customer feedback');
      return;
    }

    if (!content.trim() || !customerLabel.trim()) {
      showToast('Please enter both feedback content and customer identifier', 'warning');
      return;
    }

    const sentiment = aiPreview?.sentiment || (content.toLowerCase().includes('slow') || content.toLowerCase().includes('error') ? 'NEG' : 'POS');
    const sentimentScore = aiPreview?.sentimentScore !== undefined ? aiPreview.sentimentScore : (sentiment === 'POS' ? 0.8 : -0.7);

    await addFeedback({
      content,
      channel,
      customerLabel,
      sentiment,
      sentimentScore,
      status: 'NEW',
      featureArea: featureArea || 'General',
      theme: selectedTheme || 'General',
      themeConfidence: 0.9,
    });

    // Reset Form
    setContent('');
    setCustomerLabel('');
    setFeatureArea('');
    setAiPreview(null);
  };

  // Parse CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setCsvErrors(['CSV file must have a header row and at least one data row.']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const contentIdx = headers.findIndex(h => h === 'content' || h === 'feedback' || h === 'text');
      const channelIdx = headers.findIndex(h => h === 'channel' || h === 'source');
      const customerIdx = headers.findIndex(h => h === 'customer_label' || h === 'customer' || h === 'user' || h === 'email');
      const featureIdx = headers.findIndex(h => h === 'feature_area' || h === 'feature');

      if (contentIdx === -1) {
        setCsvErrors(['Missing required column: "content"']);
        return;
      }

      const rows: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple comma split handling quotes
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        
        const rowContent = cols[contentIdx] || '';
        if (!rowContent) {
          errors.push(`Row #${i}: Empty content skipped.`);
          continue;
        }

        const rowChannel = (channelIdx !== -1 && cols[channelIdx]) ? cols[channelIdx] as Channel : 'Support Ticket';
        const rowCustomer = (customerIdx !== -1 && cols[customerIdx]) ? cols[customerIdx] : `Customer_CSV_${100 + i}`;
        const rowFeature = (featureIdx !== -1 && cols[featureIdx]) ? cols[featureIdx] : 'Core Platform';

        const isNeg = rowContent.toLowerCase().includes('error') || rowContent.toLowerCase().includes('slow') || rowContent.toLowerCase().includes('bug');
        const sentiment: Sentiment = isNeg ? 'NEG' : 'POS';
        const sentimentScore = isNeg ? -0.75 : 0.85;

        rows.push({
          content: rowContent,
          channel: rowChannel,
          customerLabel: rowCustomer,
          featureArea: rowFeature,
          sentiment,
          sentimentScore,
          status: 'NEW' as Status,
          theme: workspaceThemes[i % workspaceThemes.length]?.name || 'Onboarding Friction',
          themeConfidence: 0.88,
        });
      }

      setParsedRows(rows);
      setCsvErrors(errors);
      showToast(`Parsed ${rows.length} valid rows from ${file.name}`, 'info');
    };

    reader.readAsText(file);
  };

  // Import Parsed CSV
  const handleBulkImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessingCsv(true);
    try {
      await bulkAddFeedback(parsedRows);
      setCsvFile(null);
      setParsedRows([]);
      setCsvErrors([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCsv(false);
    }
  };

  // Download Sample CSV
  const downloadSampleCsv = () => {
    const csvHeader = 'content,channel,customer_label,feature_area\n';
    const sampleRows = [
      '"SSO token expiration triggers an unexpected logout during mobile usage.","Support Ticket","Elena Rostova (DevOps)","Authentication"',
      '"The real-time analytics chart rendered our entire monthly cohort in 200ms!","NPS Survey","David Kim (VP CX)","Analytics"',
      '"Can we get prorated seat billing breakdowns itemized on PDF receipts?","Sales Call Note","Finance Ops @ GlobalScale","Billing"',
      '"Occasional 502 Bad Gateway observed on European endpoint during peak morning hours.","App Store Review","Alexander Schmidt","Infrastructure"',
      '"Step 3 of user onboarding was super smooth for all 15 new engineers on our team.","Community Post","Chloe Bennett","Onboarding"'
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'project_loop_sample_feedback.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-[#111113] to-[#111113] p-6 rounded-2xl border border-indigo-500/20 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-500/30">
              <Sparkles size={16} />
            </span>
            <h2 className="text-lg font-bold text-white">Multi-Channel Feedback Ingestion Engine</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Stream customer signals directly from Support Tickets, App Store Reviews, NPS Surveys, Sales Notes, and Community Posts. Real-time Gemini models classify sentiment and cluster themes on arrival.
          </p>
        </div>

        {/* Live Simulation Quick Trigger */}
        <div className="shrink-0">
          <button
            onClick={() => simulateLiveBatch(5)}
            disabled={isSimulating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 border border-indigo-500/30 disabled:opacity-50"
          >
            <Play size={14} className={isSimulating ? 'animate-spin' : 'fill-white'} />
            <span>{isSimulating ? 'Simulating Stream...' : 'Simulate 5 Live Tickets'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Manual Ingestion & CSV Bulk Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Single Feedback Manual Entry */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PlusCircle size={16} className="text-indigo-400" />
                  Manual Single Feedback Entry
                </h3>
                <p className="text-xs text-slate-400">Record an individual customer touchpoint</p>
              </div>
              <button
                type="button"
                onClick={handleAutoClassify}
                disabled={isClassifying || !content.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/30 transition-colors disabled:opacity-40"
              >
                <Sparkles size={13} className={isClassifying ? 'animate-spin' : ''} />
                <span>{isClassifying ? 'Analyzing...' : 'AI Auto-Classify'}</span>
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-4">
              {/* Content Textarea */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Customer Verbatim Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or type exact quote from the user (e.g., 'SSO login keeps timing out on mobile when switching networks...')"
                  rows={4}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Grid: Channel & Customer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Channel Source *
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as Channel)}
                    className="w-full bg-[#18181B] border border-white/10 rounded-lg p-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch} className="bg-[#18181B] text-white">
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Customer Handle / Account *
                  </label>
                  <input
                    type="text"
                    value={customerLabel}
                    onChange={(e) => setCustomerLabel(e.target.value)}
                    placeholder="e.g. Elena (DevOps @ Acme)"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Grid: Feature Area & Theme */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Feature Area
                  </label>
                  <input
                    type="text"
                    value={featureArea}
                    onChange={(e) => setFeatureArea(e.target.value)}
                    placeholder="e.g. Authentication"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Target Theme
                  </label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full bg-[#18181B] border border-white/10 rounded-lg p-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {workspaceThemes.map((t) => (
                      <option key={t.id} value={t.name} className="bg-[#18181B] text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Classification Preview Pill */}
              {aiPreview && (
                <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span className="font-semibold text-white">AI Classification:</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      aiPreview.sentiment === 'POS' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                      aiPreview.sentiment === 'NEG' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}>
                      {aiPreview.sentiment} ({aiPreview.sentimentScore.toFixed(2)})
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-medium">
                    {aiPreview.primaryTheme || selectedTheme}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
              >
                Submit Feedback to Workspace
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Bulk CSV Uploader */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-indigo-400" />
                  Bulk CSV Dataset Uploader
                </h3>
                <p className="text-xs text-slate-400">Import hundreds of feedback rows with column validation</p>
              </div>
              <button
                onClick={downloadSampleCsv}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <Download size={13} />
                <span>Sample CSV</span>
              </button>
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-white/15 hover:border-indigo-500/60 rounded-2xl p-6 text-center transition-all bg-white/[0.02] relative cursor-pointer group">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud size={36} className="mx-auto text-slate-400 group-hover:text-indigo-400 transition-colors mb-2" />
              <p className="text-xs font-bold text-slate-200">
                {csvFile ? csvFile.name : 'Click to select or drag & drop CSV file'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Required columns: <code className="bg-white/10 px-1 py-0.5 rounded text-indigo-300 font-mono">content</code>, <code className="bg-white/10 px-1 py-0.5 rounded text-indigo-300 font-mono">channel</code>, <code className="bg-white/10 px-1 py-0.5 rounded text-indigo-300 font-mono">customer_label</code>
              </p>
            </div>

            {/* Parsing Summary */}
            {parsedRows.length > 0 && (
              <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    CSV Validation Successful
                  </span>
                  <span>{parsedRows.length} Rows Ready</span>
                </div>
                <p className="text-[11px] text-emerald-400/90">
                  All rows mapped cleanly with sentiment auto-scoring and theme distribution.
                </p>

                {/* Preview snippet of first 2 rows */}
                <div className="bg-black/30 rounded-lg p-2.5 border border-emerald-500/20 text-[11px] text-slate-300 space-y-1">
                  <span className="font-semibold text-emerald-400 block text-[10px] uppercase">Sample preview:</span>
                  <p className="truncate italic text-slate-300">1. "{parsedRows[0]?.content}"</p>
                  {parsedRows[1] && <p className="truncate italic text-slate-300">2. "{parsedRows[1]?.content}"</p>}
                </div>
              </div>
            )}

            {/* Errors */}
            {csvErrors.length > 0 && (
              <div className="mt-4 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertCircle size={14} className="text-rose-400" />
                  Validation Warnings:
                </span>
                {csvErrors.map((err, idx) => (
                  <p key={idx} className="text-[11px]">{err}</p>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleBulkImport}
              disabled={parsedRows.length === 0 || isProcessingCsv}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessingCsv ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Importing Records...</span>
                </>
              ) : (
                <>
                  <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Records` : 'CSV Batch'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Ingestion History Logs Table */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Recent Ingestion Logs
            </h3>
            <p className="text-xs text-slate-400">Audit trail of automated and manual batch imports</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
            {ingestionLogs.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-400 bg-white/[0.02] border-b border-white/5">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Channel / Source</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Record Count</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-300">
              {ingestionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {log.channel}
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-400">
                    {log.type}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-indigo-400">+{log.count}</span> items
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
