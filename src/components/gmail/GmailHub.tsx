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

  const { clients, crmBranding } = useCRM();

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerRecipient, setComposerRecipient] = useState('');
  const [composerSubject, setComposerSubject] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [quickVisaClientId, setQuickVisaClientId] = useState(clients[0]?.id || '');
  const [quickNotice, setQuickNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle Quick Visa Update via Gmail
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

  // If Not Connected to Google Gmail, render the Google Sign-in screen with official button style
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 text-white">
              <Mail className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800/60 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Official Google Workspace Integration
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Connect Your Gmail Account
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Seamlessly synchronize official investor communications, dispatch UAE Visa status notifications, and track client inquiries directly inside <strong>{crmBranding.name}</strong>.
              </p>
            </div>

            {authError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 text-left">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Official Sign in with Google Button */}
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={connectGmail}
                disabled={isAuthenticating}
                className="gsi-material-button group relative inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm shadow-lg hover:shadow-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-5 h-5 shrink-0"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isAuthenticating ? 'Connecting to Google...' : 'Sign in with Google (Gmail)'}</span>
                </div>
              </button>
              <p className="text-[11px] text-slate-400">
                Grant permission to read, compose, and send clearance emails securely.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <FileCheck2 className="w-5 h-5 text-emerald-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Visa Status Alerts</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  1-Click dispatch of official ICP/GDRFA updates to clients.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <Mail className="w-5 h-5 text-blue-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Live Inbox Hub</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Browse incoming emails, threads, and communications in real-time.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <ShieldCheck className="w-5 h-5 text-purple-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Strict Confirmation</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mandatory user approval review before any email is sent or trashed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Connected Account Status & Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                Gmail Communications Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30 shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              Account: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{gmailProfile?.emailAddress || googleUser?.email}</strong>
              {gmailProfile?.messagesTotal !== undefined && ` • ${gmailProfile.messagesTotal} Total Messages`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Refresh Inbox"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={disconnectGmail}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Disconnect Google Account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Disconnect</span>
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
                <span>Loading messages from Gmail...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Mail className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-400">No emails found in this folder</p>
                <p className="text-[11px] text-slate-400 mt-1">Try another search or folder</p>
              </div>
            ) : (
              messages.map((item) => {
                const isSelected = selectedMessage?.id === item.id;
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
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {item.date ? new Date(item.date).toLocaleDateString() : ''}
                      </span>
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
              <span>Fetching email payload from Google servers...</span>
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

                    <button
                      type="button"
                      onClick={() =>
                        requestTrashEmail(selectedMessage.id, selectedMessage.subject || 'Email')
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Move to Trash (Requires Confirmation)"
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
              <div className="p-6 flex-1 overflow-y-auto text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {selectedMessage.bodyHtml ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-xs"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{selectedMessage.bodyText}</div>
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
                Or click Compose Email to send a direct message via Gmail
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gmail Composer Modal */}
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
