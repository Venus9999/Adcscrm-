import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Languages,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Loader2,
  Table,
  ShieldCheck,
  Bot,
  User,
} from 'lucide-react';

interface AcrobatAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  currentPageText?: string;
  currentPageImageBase64?: string;
  onApplyExtractedData?: (data: any) => void;
}

export const AcrobatAIAssistantModal: React.FC<AcrobatAIAssistantModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  currentPageText,
  currentPageImageBase64,
  onApplyExtractedData,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'extract' | 'translate' | 'audit' | 'chat'>('summary');
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your Acrobat Pro AI Assistant. I can analyze "${documentTitle}", extract official government fields, translate Arabic/English, check GDRFA compliance, or answer any specific questions.`,
    },
  ]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const runAiTask = async (taskType: 'summarize' | 'extract_fields' | 'translate' | 'audit_compliance' | 'ask', questionOverride?: string) => {
    setLoading(true);
    setAiOutput('');

    try {
      const res = await fetch('/api/ai/pdf-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryType: taskType,
          documentTitle,
          documentText: currentPageText,
          base64ImageOrPdf: currentPageImageBase64,
          customQuestion: questionOverride || customQuestion,
          targetLanguage: 'Arabic and English',
        }),
      });

      const data = await res.json();
      if (data.success) {
        const text = data.text || 'No response generated.';
        setAiOutput(text);

        if (taskType === 'ask' && questionOverride) {
          setChatMessages((prev) => [
            ...prev,
            { sender: 'user', text: questionOverride },
            { sender: 'ai', text },
          ]);
        }
      } else {
        setAiOutput(`Error: ${data.error || 'Failed to process document with AI.'}`);
      }
    } catch (err: any) {
      setAiOutput(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[640px] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>Acrobat Pro AI Assistant</span>
                <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-mono">
                  Gemini 3.7 Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-md">{documentTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'summary', label: 'Executive Summary', icon: FileText },
            { id: 'extract', label: 'Extract Key Data', icon: Table },
            { id: 'translate', label: 'Translate (AR/EN)', icon: Languages },
            { id: 'audit', label: 'Compliance Audit', icon: ShieldCheck },
            { id: 'chat', label: 'Ask Questions', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'summary') runAiTask('summarize');
                  if (tab.id === 'extract') runAiTask('extract_fields');
                  if (tab.id === 'translate') runAiTask('translate');
                  if (tab.id === 'audit') runAiTask('audit_compliance');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-950/30 flex flex-col justify-between">
          {activeTab !== 'chat' ? (
            <div className="space-y-4">
              {/* Output Display */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[300px] text-xs text-slate-300 relative font-sans leading-relaxed">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-xs font-medium">Analyzing document with Gemini AI...</p>
                  </div>
                ) : aiOutput ? (
                  <div className="space-y-2 whitespace-pre-wrap">{aiOutput}</div>
                ) : (
                  <div className="text-center py-16 text-slate-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p>Click on any tab above to generate intelligence for this document.</p>
                  </div>
                )}

                {/* Quick copy button */}
                {aiOutput && !loading && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700 flex items-center gap-1 shadow-xs"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Chat Mode */
            <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 text-xs ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="p-1.5 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30 shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-purple-400 p-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customQuestion.trim() && !loading) {
                      const q = customQuestion;
                      setCustomQuestion('');
                      runAiTask('ask', q);
                    }
                  }}
                  placeholder="Ask a question about this document (e.g. Is passport valid for 6 months?)..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
                <button
                  onClick={() => {
                    if (customQuestion.trim() && !loading) {
                      const q = customQuestion;
                      setCustomQuestion('');
                      runAiTask('ask', q);
                    }
                  }}
                  disabled={loading || !customQuestion.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
