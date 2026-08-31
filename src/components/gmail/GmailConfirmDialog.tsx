import React, { useState } from 'react';
import { Mail, AlertTriangle, Trash2, Send, CheckCircle2, ShieldAlert, X, Paperclip, File, FileText, FileImage, FileSpreadsheet } from 'lucide-react';
import { useGmail } from '../../context/GmailContext';

export const GmailConfirmDialog: React.FC = () => {
  const {
    sendConfirmData,
    cancelSendEmail,
    confirmSendEmail,
    deleteConfirmData,
    cancelTrashEmail,
    confirmTrashEmail,
  } = useGmail();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!sendConfirmData && !deleteConfirmData) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderFileIcon = (type: string, name: string) => {
    if (type.includes('image') || name.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
      return <FileImage className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    }
    if (type.includes('sheet') || type.includes('excel') || name.match(/\.(xlsx|xls|csv)$/i)) {
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
    return <File className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
  };

  const handleSendConfirm = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    const res = await confirmSendEmail();
    setIsProcessing(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to dispatch email.');
    }
  };

  const handleDeleteConfirm = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    const res = await confirmTrashEmail();
    setIsProcessing(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to move email to trash.');
    }
  };

  const attachments = sendConfirmData?.payload?.attachments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      {/* Send Confirmation Dialog */}
      {sendConfirmData && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Confirm Communication Dispatch
                </h3>
                <p className="text-[11px] text-slate-500">
                  Review recipient and attachments before logging and sending
                </p>
              </div>
            </div>
            <button
              onClick={cancelSendEmail}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Recipient:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                  {sendConfirmData.payload.to} {sendConfirmData.clientName && `(${sendConfirmData.clientName})`}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/50 pt-2">
                <span className="text-slate-400 font-medium">Subject:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                  {sendConfirmData.payload.subject}
                </span>
              </div>
              {attachments.length > 0 && (
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/50 pt-2">
                  <span className="text-slate-400 font-medium">Attachments:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" />
                    {attachments.length} file(s) ({formatBytes(attachments.reduce((a, b) => a + b.size, 0))})
                  </span>
                </div>
              )}
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Enclosed Files
                </label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {attachments.map((att) => (
                    <div key={att.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 truncate">
                        {renderFileIcon(att.type, att.name)}
                        <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{att.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono shrink-0">{formatBytes(att.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Message Body Preview
              </label>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto text-slate-700 dark:text-slate-300 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                {sendConfirmData.payload.body}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={cancelSendEmail}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendConfirm}
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Send Communication</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete / Move to Trash Confirmation Dialog */}
      {deleteConfirmData && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete Communication Record?
                </h3>
                <p className="text-[11px] text-slate-500">
                  Confirmation required before removing message
                </p>
              </div>
            </div>
            <button
              onClick={cancelTrashEmail}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-3 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to delete the following communication record?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white truncate">
              "{deleteConfirmData.subject}"
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={cancelTrashEmail}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
