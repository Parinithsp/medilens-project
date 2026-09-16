import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Activity, 
  Bot, 
  User as UserIcon, 
  ShieldAlert, 
  HelpCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { chatAPI } from '../api';

export default function ReportChat({ isOpen, onClose, report }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (report && isOpen) {
      loadChatHistory();
    }
  }, [report, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadChatHistory = async () => {
    try {
      const history = await chatAPI.getHistory(report.id);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Seed with welcoming assistant greeting
        setMessages([{
          id: 'init',
          role: 'assistant',
          content: `Hello! I am your MediLens Assistant. I have reviewed the laboratory findings for **${report.patient_name || 'Patient'}** (${report.biomarkers?.length || 0} biomarkers evaluated).\n\nFeel free to ask any question about your numbers, reference intervals, or what to discuss with your doctor!`,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatAPI.ask(report.id, text);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I apologize, but I encountered a temporary communication issue. Please verify your connection and try asking again.",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !report) return null;

  const quickPrompts = [
    "What do my out-of-range values mean?",
    "Is my fasting blood glucose concerning?",
    "Explain my cholesterol and lipid numbers",
    "What questions should I ask my physician?"
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-in-right text-left">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              MediLens AI Assistant
            </h3>
            <p className="text-[11px] text-cyan-400 font-medium">
              Grounded in: {report.patient_name || 'Report Findings'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-950/40 border-b border-amber-900/30 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-300">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        <span>Educational assistant only. Not a medical diagnosis.</span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role !== 'user' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] p-3.5 rounded-2xl whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs shadow-md'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-xs'
              }`}
            >
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 text-slate-400 border border-slate-700/60 rounded-2xl rounded-bl-xs p-3.5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Analyzing report parameters...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Suggested Questions</p>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about your test results..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-2.5 rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
