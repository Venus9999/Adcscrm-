import React, { useState } from 'react';
import {
  Send,
  X,
  Mail,
  FileCheck2,
  Receipt,
  FileText,
  Sparkles,
  User,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useGmail } from '../../context/GmailContext';
import { useCRM } from '../../context/CRMContext';
import { SendEmailPayload } from '../../services/gmailService';

interface GmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialSubject?: string;
  initialBody?: string;
  clientId?: string;
}

export const GmailComposerModal: React.FC<GmailComposerModalProps> = ({
  isOpen,
  onClose,
  initialRecipient = '',
  initialSubject = '',
  initialBody = '',
  clientId,
}) => {
  const { isConnected, requestSendEmail, googleUser } = useGmail();
  const { clients, leads, crmBranding } = useCRM();

  const [to, setTo] = useState(initialRecipient);
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [showCc, setShowCc] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');

  // Update fields if props change
  React.useEffect(() => {
    if (initialRecipient) setTo(initialRecipient);
    if (initialSubject) setSubject(initialSubject);
    if (initialBody) setBody(initialBody);
  }, [initialRecipient, initialSubject, initialBody, isOpen]);

  if (!isOpen) return null;

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
          .replace(/{CRM_NAME}/g, crmBranding.name)
      );

      setBody(
        `${template.headerText}\n\nDear ${targetClient?.fullName || 'Valued Client'},\n\nWe are pleased to inform you that your ${serviceName} application (Ref: ${targetClient?.refNo || 'ADCS-REF'}) is now at the following stage:\n\n• Current Status: ${stageName}\n• Passport Number: ${targetClient?.passportNumber || 'On Record'}\n• Emirates ID: ${targetClient?.emiratesId || 'In Process'}\n\nRemarks: ${targetClient?.services?.[0]?.notes || 'Documents verified and under final processing.'}\n\nPlease reach out to your assigned PRO (${targetClient?.assignedEmployeeName || 'Customer Service'}) if you have any questions.\n\nBest Regards,\n${crmBranding.name}\n${crmBranding.supportPhone} | ${crmBranding.website}`
      );
    } else if (templateKey === 'invoice_reminder') {
      setSubject(`Official Invoice & Payment Advisory — ${targetClient?.fullName || 'Client'} | ${crmBranding.name}`);
      setBody(
        `Dear ${targetClient?.fullName || 'Client'},\n\nThis is a courtesy notice regarding your pending invoice for corporate clearance services with ${crmBranding.name}.\n\nPlease find your payment breakdown and bank transfer details in your client portal. Kindly process the settlement at your earliest convenience to avoid delays in government processing.\n\nThank you for choosing ${crmBranding.name}.\n\nAccounts & Finance Department\n${crmBranding.supportEmail}`
      );
    } else if (templateKey === 'document_request') {
      setSubject(`Urgent Action Required: Document Submission for UAE Visa Clearance — ${targetClient?.fullName || 'Applicant'}`);
      setBody(
        `Dear ${targetClient?.fullName || 'Applicant'},\n\nIn order to proceed with your UAE government clearance milestone, we kindly require the following supplementary documents:\n\n1. Valid High-Resolution Passport Copy (Bio page & signature)\n2. Attested Educational Certificate / Trade License (if applicable)\n3. Recent UAE Visa-compliant Passport Photo (White background)\n\nYou can upload these directly via your Client Portal or reply to this email with attachments.\n\nWarm regards,\n${crmBranding.name} Operations Team`
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
    };

    const client = clients.find((c) => c.email === to);
    requestSendEmail(payload, client?.fullName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">New Gmail Message</h3>
              <p className="text-[11px] text-blue-100">
                Sending from: {googleUser?.email || 'Connected Google Account'}
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
              rows={8}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email here..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-sans text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>
              Clicking <strong>Review & Send</strong> will open an approval dialog confirming the final payload before dispatching via Gmail.
            </span>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
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
              <span>Review & Send via Gmail</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
