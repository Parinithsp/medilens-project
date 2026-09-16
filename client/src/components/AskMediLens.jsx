import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User as UserIcon, 
  ShieldAlert, 
  Activity, 
  Loader2, 
  ArrowLeft, 
  HelpCircle,
  FileText,
  Upload
} from 'lucide-react';
import { chatAPI, reportAPI } from '../api';
import Sidebar from './Sidebar';

export default function AskMediLens({ 
  report: passedReport, 
  user, 
  onBack, 
  onOpenUpload, 
  onLoadDemo, 
  onNavigate, 
  onLogout 
}) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(passedReport || null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "What does this report contain?",
    "Explain my hemoglobin result.",
    "Which results are outside the reference range?",
    "What does TSH mean?",
    "Explain this report in simple language.",
    "What questions should I ask my doctor?"
  ];

  // Fetch user reports if not passed
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoadingReports(true);
        const data = await reportAPI.listReports();
        setReports(data || []);
        if (!selectedReport && data && data.length > 0) {
          // Fetch detail of the latest report
          const detail = await reportAPI.getReport(data[0].id);
          setSelectedReport(detail);
        }
      } catch (err) {
        console.error("Failed to load reports for chat", err);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  // Update welcome message when selected report changes
  useEffect(() => {
    if (selectedReport) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello ${user?.full_name ? user.full_name.split(' ')[0] : ''}! I am MediLens AI. I have access to the laboratory data for **${selectedReport.patient_name || selectedReport.original_name}**.\n\nYou can ask me questions about your test numbers, reference intervals, or what to discuss with your doctor. How can I help you understand this report?`,
          created_at: new Date().toISOString()
        }
      ]);
      // Also fetch prior chat history if available
      chatAPI.getHistory(selectedReport.id).then((history) => {
        if (history && history.length > 0) {
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: `Hello! I have loaded your prior conversation for **${selectedReport.patient_name || selectedReport.original_name}**.`,
              created_at: new Date().toISOString()
            },
            ...history
          ]);
        }
      }).catch(() => {});
    }
  }, [selectedReport]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSelectReportChange = async (reportId) => {
    try {
      setLoading(true);
      const detail = await reportAPI.getReport(reportId);
      setSelectedReport(detail);
    } catch (err) {
      console.error("Failed to load selected report", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading || !selectedReport) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatAPI.ask(selectedReport.id, text);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I encountered an issue processing your question. Please try asking again.",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Column (Col 3) */}
        <div className="lg:col-span-3">
          <Sidebar
            currentView="ask"
            onNavigate={onNavigate || onBack}
            onOpenUpload={onOpenUpload}
            onLoadDemo={onLoadDemo}
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Main Chat Column (Col 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                    Clinical AI Companion
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400">
                    Grounded AI
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Ask MediLens</h1>
              </div>
            </div>

            {/* Report Selector Dropdown */}
            {reports.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Context:</span>
                <select
                  value={selectedReport?.id || ''}
                  onChange={(e) => handleSelectReportChange(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-semibold text-white focus:outline-none focus:border-orange-500 max-w-[200px] truncate"
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                      {r.original_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Safety Banner */}
          <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/25 flex items-start gap-2.5 text-xs text-orange-200">
            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Safety Reminder:</strong> MediLens AI answers are strictly grounded in your selected medical paperwork. MediLens does not provide medical diagnoses or prescribe treatment.
            </span>
          </div>

          {/* Empty state if 0 reports */}
          {!loadingReports && reports.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel border border-white/[0.08] text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-xl shadow-orange-500/10">
                <Bot className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">No medical reports in account</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Upload a medical report or try demo data so MediLens AI can read your clinical biomarkers and answer your questions.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onOpenUpload}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Medical Report</span>
                </button>

                {onLoadDemo && (
                  <button
                    onClick={onLoadDemo}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Try Demo Report</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Chat Box */
            <div className="rounded-3xl glass-panel border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col h-[560px]">
              
              {/* Message History */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold ${
                          isUser
                            ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                            : 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                        }`}
                      >
                        {isUser ? (user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U') : <Bot className="w-4 h-4" />}
                      </div>

                      <div
                        className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-orange-500 text-white font-medium rounded-tr-sm shadow-md shadow-orange-500/20'
                            : 'glass-panel border border-white/[0.08] text-slate-200 rounded-tl-sm shadow-lg'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3.5 rounded-2xl glass-panel border border-white/[0.08] text-xs text-slate-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                      <span>MediLens is reasoning over your report...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts */}
              <div className="px-4 py-2 bg-black/40 border-t border-white/[0.04] overflow-x-auto flex items-center gap-2 no-scrollbar">
                <span className="text-[10px] text-slate-500 font-bold shrink-0 uppercase tracking-wider">Suggested:</span>
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] whitespace-nowrap transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-black/60 border-t border-white/[0.08]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ask about ${selectedReport?.original_name || 'your report'}...`}
                    disabled={loading || !selectedReport}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || loading || !selectedReport}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ask</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
