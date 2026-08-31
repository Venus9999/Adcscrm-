import React, { useState } from 'react';
import {
  Mail,
  Send,
  Inbox,
  Clock,
  Sparkles,
  Search,
  RefreshCw,
  Trash2,
  Reply,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  LogOut,
  Folder,
  Paperclip,
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Server,
  Settings,
} from 'lucide-react';
import { useGmail } from '../../context/GmailContext';
import { useCRM } from '../../context/CRMContext';
import { GmailComposerModal } from './GmailComposerModal';

export const GmailHub: React.FC = () => {
  const {
    isConnected,
    isAuthenticating,
    googleUser,
    gmailProfile,
    messages,
    selectedMessage,
    isLoadingMessages,
    isLoadingDetail,
    activeFolder,
    searchQuery,
    authError,
    connectGmail,
    disconnectGmail,
    setActiveFolder,
    setSearchQuery,
    fetchMessages,
    selectMessageById,
    clearSelectedMessage,
    requestTrashEmail,
    sendVisaStatusViaGmail,
    requestSendEmail,
  } = useGmail();

  const { clients, crmBranding, setActiveTab, currentUser } = useCRM();

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerRecipient, setComposerRecipient] = useState('');
  const [composerSubject, setComposerSubject] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [quickVisaClientId, setQuickVisaClientId] = useState(clients[0]?.id || '');
  const [quickNotice, setQuickNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper icon for file types
  const renderFileIcon = (type: string, name: string) => {
    if (type.includes('image') || name.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
      return <FileImage className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
    }
    if (type.includes('sheet') || type.includes('excel') || name.match(/\.(xlsx|xls|csv)$/i)) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    return <File className="w-4 h-4 text-blue-500 shrink-0" />;
  };

  // Handle Quick Visa Update
  const handleQuickVisaDispatch = async () => {
    if (!quickVisaClientId) return;
    const res = await sendVisaStatusViaGmail(quickVisaClientId);
    if (res.success && res.emailDetails) {
      requestSendEmail(
        {
          to: res.emailDetails.to,
          subject: res.emailDetails.subject,
          body: res.emailDetails.body,
        },
        res.emailDetails.clientName
      );
    } else {
      setQuickNotice({ type: 'error', text: res.error || 'Failed to prepare visa email.' });
      setTimeout(() => setQuickNotice(null), 4000);
    }
  };

  // Quick Reply handler
  const handleQuickReply = () => {
    if (!selectedMessage) return;
    setComposerRecipient(selectedMessage.from || '');
    setComposerSubject(
      selectedMessage.subject?.startsWith('Re:')
        ? selectedMessage.subject
        : `Re: ${selectedMessage.subject || ''}`
    );
    setComposerBody(
      `\n\n--- On ${selectedMessage.date || 'earlier'}, ${selectedMessage.from} wrote:\n> ${selectedMessage.snippet}`
    );
    setIsComposerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Communication Hub Status & Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                Client Communications & Email Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30 shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              Sender Profile: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{googleUser?.email || gmailProfile?.emailAddress || 'info@adcs.ae'}</strong>
              {gmailProfile?.messagesTotal !== undefined && ` • ${gmailProfile.messagesTotal} Total Records`}
              {' • '}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Max 2 MB Attachments Enabled</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('smtp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-all ${
              crmBranding?.smtpSettings?.user && crmBranding?.smtpSettings?.pass
                ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                : 'border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 animate-pulse'
            }`}
            title="Configure Outbound SMTP & Email Delivery Credentials"
          >
            <Server className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Email & SMTP Settings</span>
            <span
              className={`w-2 h-2 rounded-full ${
                crmBranding?.smtpSettings?.user && crmBranding?.smtpSettings?.pass
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setComposerRecipient('');
              setComposerSubject('');
              setComposerBody('');
              setIsComposerOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Email</span>
          </button>

          <button
            type="button"
            onClick={() => fetchMessages()}
            disabled={isLoadingMessages}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh Inbox"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick UAE Visa Status Dispatch Box */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white">Direct Visa Clearance Dispatch</h4>
            <p className="text-slate-400 text-[11px]">
              Instantly draft and preview official ICP/GDRFA notification to an applicant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={quickVisaClientId}
            onChange={(e) => setQuickVisaClientId(e.target.value)}
            className="p-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs font-medium max-w-xs truncate"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.refNo}) — {c.services?.[0]?.categoryName || 'Residency'}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleQuickVisaDispatch}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Draft & Review</span>
          </button>
        </div>
      </div>

      {quickNotice && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-2 text-xs ${
            quickNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {quickNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{quickNotice.text}</span>
        </div>
      )}

      {/* Main Mailbox Interface: Split Screen (List + Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
        {/* Left Column: Folders & Message List */}
        <div className="lg:col-span-5 space-y-3 flex flex-col">
          {/* Folder Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveFolder('INBOX')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeFolder === 'INBOX'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Inbox</span>
            </button>

            <button
              onClick={() => setActiveFolder('VISA')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeFolder === 'VISA'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Visa & Clearance</span>
            </button>

            <button
              onClick={() => setActiveFolder('SENT')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeFolder === 'SENT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sent</span>
            </button>

            <button
              onClick={() => setActiveFolder('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeFolder === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>All Mail</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchMessages();
                }
              }}
              placeholder="Search sender, recipient, or subject..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Message List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[520px] flex-1">
            {isLoadingMessages ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                <span>Loading communications...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Mail className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-400">No messages in this folder</p>
                <p className="text-[11px] text-slate-400 mt-1">Click Compose to create a new client communication</p>
              </div>
            ) : (
              messages.map((item) => {
                const isSelected = selectedMessage?.id === item.id;
                const hasAtts = Boolean(item.hasAttachment || (item.attachments && item.attachments.length > 0));
                return (
                  <div
                    key={item.id}
                    onClick={() => selectMessageById(item.id)}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`truncate max-w-[200px] ${
                          item.isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.from || item.to || 'Unknown Sender'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasAtts && (
                          <span title="Contains Attachment" className="text-slate-400">
                            <Paperclip className="w-3 h-3 text-blue-500" />
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.date ? new Date(item.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`truncate mb-1 ${
                        item.isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.subject || '(No Subject)'}
                    </p>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Message Reader */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          {isLoadingDetail ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 m-auto">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span>Fetching communication details...</span>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Message Header & Action Toolbar */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {selectedMessage.subject || '(No Subject)'}
                  </h3>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleQuickReply}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>

                    <a
                      href={`mailto:${selectedMessage.to || ''}?subject=${encodeURIComponent(
                        selectedMessage.subject || ''
                      )}`}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Open in default mail client"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mail App</span>
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        requestTrashEmail(selectedMessage.id, selectedMessage.subject || 'Email')
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">From:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedMessage.from}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">To:</span>
                    <span className="text-slate-600 dark:text-slate-300">{selectedMessage.to}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Date:</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {selectedMessage.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Body Content */}
              <div className="p-6 flex-1 overflow-y-auto text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-4">
                {selectedMessage.bodyHtml ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-xs"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{selectedMessage.bodyText}</div>
                )}

                {/* Attachments Display */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                      <span>Attachments ({selectedMessage.attachments.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedMessage.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {renderFileIcon(att.type, att.name)}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white truncate text-xs" title={att.name}>
                                {att.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {formatBytes(att.size)}
                              </p>
                            </div>
                          </div>

                          <a
                            href={att.dataUrl || '#'}
                            download={att.name}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shrink-0"
                            title="Download attachment"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 m-auto">
              <Mail className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
                Select an email to view full conversation
              </p>
              <p className="text-[11px] text-slate-400">
                Or click Compose Email to draft, attach documents (up to 2 MB), and log a new message
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Composer Modal */}
      <GmailComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialRecipient={composerRecipient}
        initialSubject={composerSubject}
        initialBody={composerBody}
      />
    </div>
  );
};
