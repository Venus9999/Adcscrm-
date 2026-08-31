import React, { useState, useRef } from 'react';
import {
  Send,
  X,
  Mail,
  FileCheck2,
  Receipt,
  FileText,
  Sparkles,
  Paperclip,
  Trash2,
  File,
  HelpCircle,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
} from 'lucide-react';
import { useGmail } from '../../context/GmailContext';
import { useCRM } from '../../context/CRMContext';
import { SendEmailPayload, EmailAttachment } from '../../services/gmailService';

interface GmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialSubject?: string;
  initialBody?: string;
  clientId?: string;
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB limit per file
const MAX_TOTAL_SIZE_BYTES = 6 * 1024 * 1024; // 6 MB total limit

export const GmailComposerModal: React.FC<GmailComposerModalProps> = ({
  isOpen,
  onClose,
  initialRecipient = '',
  initialSubject = '',
  initialBody = '',
  clientId,
}) => {
  const { requestSendEmail, googleUser } = useGmail();
  const { clients, crmBranding } = useCRM();

  const [to, setTo] = useState(initialRecipient);
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [showCc, setShowCc] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  
  // Attachments state
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update fields if props change
  React.useEffect(() => {
    if (initialRecipient) setTo(initialRecipient);
    if (initialSubject) setSubject(initialSubject);
    if (initialBody) setBody(initialBody);
  }, [initialRecipient, initialSubject, initialBody, isOpen]);

  if (!isOpen) return null;

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle file selection (with 2MB check)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentTotal = attachments.reduce((acc, a) => acc + a.size, 0);
    let addedTotal = 0;
    const newAttachments: EmailAttachment[] = [];

    Array.from(files).forEach((file) => {
      // Check 2MB per file
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setAttachmentError(`"${file.name}" exceeds the 2 MB attachment limit (${formatBytes(file.size)}).`);
        return;
      }

      if (currentTotal + addedTotal + file.size > MAX_TOTAL_SIZE_BYTES) {
        setAttachmentError(`Total attachments exceed the 6 MB limit.`);
        return;
      }

      addedTotal += file.size;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setAttachmentError(null);
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

  // Quick Template Selection
  const applyTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const targetClient = clients.find((c) => c.email === to || c.id === clientId) || clients[0];

    if (templateKey === 'visa_update') {
      const template = crmBranding.visaEmailTemplate;
      const serviceName = targetClient?.services?.[0]?.categoryName || 'UAE Golden Visa Clearance';
      const stageName = targetClient?.services?.[0]?.currentStageName || 'Government Review';

      setSubject(
        template.subject
          .replace(/{CLIENT_NAME}/g, targetClient?.fullName || 'Investor')
          .replace(/{REF_NO}/g, targetClient?.refNo || 'ADCS-REF')
          .replace(/{SERVICE_NAME}/g, serviceName)
          .replace(/{CURRENT_STAGE}/g, stageName)
          .replace(/{CRM_NAME}/g, 'ADCS')
      );

      setBody(
        `Dear ${targetClient?.fullName || 'Valued Client'},\n\nWe are pleased to inform you that your ${serviceName} application (Ref: ${targetClient?.refNo || 'ADCS-REF'}) is now at the following stage:\n\n• Current Status: ${stageName}\n• Passport Number: ${targetClient?.passportNumber || 'On Record'}\n• Emirates ID: ${targetClient?.emiratesId || 'In Process'}\n\nRemarks: ${targetClient?.services?.[0]?.notes || 'Documents verified and under active government clearance.'}\n\nPlease review your status on the secure portal.\n\nBest regards,\nADCS\n\n----------------------------------------\nPlease do not reply directly to this email. This is an automated email from ADCS.`
      );
    } else if (templateKey === 'invoice_reminder') {
      setSubject(`Official Invoice & Payment Advisory — ${targetClient?.fullName || 'Client'} | ADCS`);
      setBody(
        `Dear ${targetClient?.fullName || 'Client'},\n\nThis is a notification regarding your pending invoice for corporate clearance services with ADCS.\n\nPlease find your payment breakdown and settlement instructions in your client portal.\n\nBest regards,\nADCS\n\n----------------------------------------\nPlease do not reply directly to this email. This is an automated email from ADCS.`
      );
    } else if (templateKey === 'document_request') {
      setSubject(`Document Submission Notice — ${targetClient?.fullName || 'Applicant'} | ADCS`);
      setBody(
        `Dear ${targetClient?.fullName || 'Applicant'},\n\nIn order to proceed with your government clearance milestone, we kindly require the following supplementary documents:\n\n1. Valid High-Resolution Passport Copy\n2. Attested Educational Certificate / Trade License (if applicable)\n3. Recent Visa-compliant Passport Photo (White background)\n\nPlease upload these directly via your Client Portal.\n\nBest regards,\nADCS\n\n----------------------------------------\nPlease do not reply directly to this email. This is an automated email from ADCS.`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to) {
      alert('Please enter a recipient email address.');
      return;
    }
    if (!subject) {
      alert('Please enter an email subject.');
      return;
    }
    if (!body) {
      alert('Please write an email message body.');
      return;
    }

    const payload: SendEmailPayload = {
      to,
      subject,
      body,
      cc: showCc && cc ? cc : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const client = clients.find((c) => c.email === to);
    requestSendEmail(payload, client?.fullName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Compose Client Email</h3>
              <p className="text-[11px] text-blue-100 flex items-center gap-1.5">
                <span>Sender:</span>
                <span className="font-semibold">
                  ADCS &lt;info@theadcs.com&gt;
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded-md font-bold uppercase tracking-wider">
                  Verified Dispatch
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template Selector Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" /> Templates:
          </span>
          <button
            type="button"
            onClick={() => applyTemplate('visa_update')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors ${
              selectedTemplate === 'visa_update'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            <FileCheck2 className="w-3 h-3" />
            <span>UAE Visa Status Update</span>
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('invoice_reminder')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors ${
              selectedTemplate === 'invoice_reminder'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            <Receipt className="w-3 h-3" />
            <span>Invoice Advisory</span>
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('document_request')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors ${
              selectedTemplate === 'document_request'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Document Request</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {/* Recipient Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                To (Recipient Email):
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowCc(!showCc)}
                  className="text-blue-500 hover:underline font-semibold"
                >
                  {showCc ? '- Hide Cc' : '+ Add Cc'}
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="email"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick recipient chip pills */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium">Quick Pick:</span>
              {clients.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setTo(c.email);
                    if (selectedTemplate !== 'custom') {
                      applyTemplate(selectedTemplate);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-medium transition-colors"
                >
                  {c.fullName.split(' ')[0]} ({c.email})
                </button>
              ))}
            </div>
          </div>

          {/* CC */}
          {showCc && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Cc:
              </label>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="compliance@adcs.ae, manager@adcs.ae"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              Subject Line:
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. UAE Golden Visa Approval & Next Steps"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              Email Message Body:
            </label>
            <textarea
              rows={6}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email here..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Attachments Section (up to 2 MB) */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                <span>Attachments (Max 2 MB per file):</span>
              </div>

              <label className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach Files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
                />
              </label>
            </div>

            {attachmentError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{attachmentError}</span>
              </div>
            )}

            {/* List of Attached Files */}
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {renderFileIcon(att.type, att.name)}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px] sm:max-w-[180px]">
                          {att.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatBytes(att.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-[11px]">
                No files attached. Attach Golden Visa approval PDFs, invoices, trade licenses, or passports (up to 2 MB each).
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>
              Emails and attached files are logged in the client's CRM communication history and can also be opened directly in your email app.
            </span>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <a
              href={`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Open in Mail App
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send & Log Communication</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
