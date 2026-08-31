export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 data url for preview and download
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  historyId?: string;
  internalDate: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  isUnread?: boolean;
  hasAttachment?: boolean;
  attachments?: EmailAttachment[];
  labelIds?: string[];
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText: string;
  bodyHtml?: string;
  headers: Record<string, string>;
  labels: string[];
  attachments?: EmailAttachment[];
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  cc?: string;
  bcc?: string;
  inReplyTo?: string;
  threadId?: string;
  attachments?: EmailAttachment[];
}

const STORAGE_KEY = 'adcs_crm_communications_v2';

// Seed Initial Corporate CRM Communications with Sample Attachments
const INITIAL_COMMUNICATIONS: GmailMessageDetail[] = [
  {
    id: 'msg-comm-1',
    threadId: 'th-1',
    subject: 'Official Approval Notification: UAE 10-Year Golden Visa (Ref: ADCS-9821)',
    from: 'ADCS <info@theadcs.com>',
    to: 'Rashid Al Nuaimi <rashid.investor@gmail.com>',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    snippet: 'Dear Mr. Rashid, We are delighted to inform you that your 10-Year UAE Golden Visa has been formally approved by ICP Dubai...',
    bodyText: `Dear Mr. Rashid,\n\nWe are delighted to inform you that your 10-Year UAE Golden Visa application (Ref: ADCS-9821) has received full primary approval from the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP).\n\nKey Milestone Details:\n• Service: UAE 10-Year Golden Visa (Real Estate Investor Category)\n• Approval Number: ICP-DXB-2026-98124\n• Status: Issued & Ready for E-Visa Download\n\nNext Steps:\n1. Download your Entry Permit / Digital Visa Copy from the client portal or the attached file below.\n2. Our Senior PRO will escort you for the fast-track VIP Medical Fitness and Emirates ID biometrics on Wednesday at 10:00 AM.\n\nBest regards,\nADCS\n\n----------------------------------------\nPlease do not reply directly to this email. This is an automated email from ADCS.`,
    internalDate: Date.now().toString(),
    isUnread: false,
    hasAttachment: true,
    attachments: [
      {
        id: 'att-101',
        name: 'UAE_Golden_Visa_ICP_Approval_ADCS9821.pdf',
        size: 342000,
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
      },
      {
        id: 'att-102',
        name: 'VIP_Biometrics_Medical_Schedule.pdf',
        size: 184500,
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
      },
    ],
    labelIds: ['SENT', 'VISA'],
    labels: ['SENT', 'VISA'],
    headers: {
      from: 'ADCS <info@theadcs.com>',
      to: 'Rashid Al Nuaimi <rashid.investor@gmail.com>',
      subject: 'Official Approval Notification: UAE 10-Year Golden Visa (Ref: ADCS-9821)',
      date: new Date(Date.now() - 3600000 * 4).toUTCString(),
    },
  },
  {
    id: 'msg-comm-2',
    threadId: 'th-2',
    subject: 'Action Required: Supplementary Document Submission for Corporate Trade License',
    from: 'ADCS <info@theadcs.com>',
    to: 'Elena Rostova <elena.rostova@techsolutions.com>',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
    snippet: 'Dear Ms. Elena, In order to finalize your Dubai Mainland Trade License registration with the Department of Economy and Tourism (DET)...',
    bodyText: `Dear Ms. Elena,\n\nIn order to finalize your Dubai Mainland Commercial Trade License registration with the Department of Economy and Tourism (DET), the economic department has requested the following verified documents:\n\n1. Attested Board Resolution of the Parent Company\n2. Passport copy & High-resolution photo of the appointed General Manager\n3. Ejari (Tenancy Contract) or Initial Lease Agreement\n\nYou can upload these documents directly via your secure ADCS Client Portal.\n\nBest regards,\nADCS\n\n----------------------------------------\nPlease do not reply directly to this email. This is an automated email from ADCS.`,
    internalDate: (Date.now() - 3600000 * 18).toString(),
    isUnread: true,
    hasAttachment: false,
    labelIds: ['INBOX', 'IMPORTANT'],
    labels: ['INBOX', 'IMPORTANT'],
    headers: {
      from: 'ADCS <info@theadcs.com>',
      to: 'Elena Rostova <elena.rostova@techsolutions.com>',
      subject: 'Action Required: Supplementary Document Submission for Corporate Trade License',
      date: new Date(Date.now() - 3600000 * 18).toUTCString(),
    },
  },
  {
    id: 'msg-comm-3',
    threadId: 'th-3',
    subject: 'Tax & VAT Registration Confirmation — Federal Tax Authority (FTA)',
    from: 'ADCS <info@theadcs.com>',
    to: 'Tariq Mansoor <tariq.mansoor@globalholdings.ae>',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    snippet: 'Dear Mr. Tariq, Please find attached the official Tax Registration Number (TRN) certificate issued by the Federal Tax Authority...',
    bodyText: `Dear Mr. Tariq,\n\nWe are pleased to share that your Corporate Tax and VAT Registration with the Federal Tax Authority (FTA) has been completed successfully.\n\nYour Corporate TRN: 100-8472-9182-0003\nEffective Date: 01 March 2026\n\nYour official FTA Certificate has been deposited into your secure Document Vault inside the ADCS CRM and is attached below.\n\nBest regards,\nADCS\n\n----------------------------------------\nPlease do not reply directly to this email. This is an automated email from ADCS.`,
    internalDate: (Date.now() - 3600000 * 48).toString(),
    isUnread: false,
    hasAttachment: true,
    attachments: [
      {
        id: 'att-103',
        name: 'FTA_TRN_Official_Certificate.pdf',
        size: 512000,
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
      },
    ],
    labelIds: ['SENT', 'INBOX'],
    labels: ['SENT', 'INBOX'],
    headers: {
      from: 'ADCS <info@theadcs.com>',
      to: 'Tariq Mansoor <tariq.mansoor@globalholdings.ae>',
      subject: 'Tax & VAT Registration Confirmation — Federal Tax Authority (FTA)',
      date: new Date(Date.now() - 3600000 * 48).toUTCString(),
    },
  },
];

function getStoredMessages(): GmailMessageDetail[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMUNICATIONS));
      return INITIAL_COMMUNICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COMMUNICATIONS;
  } catch {
    return INITIAL_COMMUNICATIONS;
  }
}

function saveStoredMessages(messages: GmailMessageDetail[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

export const gmailService = {
  // Fetch Communications Profile
  async getProfile(): Promise<GmailProfile> {
    const msgs = getStoredMessages();
    return {
      emailAddress: 'info@adcs.ae',
      messagesTotal: msgs.length,
      threadsTotal: msgs.length,
      historyId: 'crm-sync-' + Date.now(),
    };
  },

  // List messages with search query and folder filter
  async listMessages(options?: {
    query?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
  }): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; resultSizeEstimate: number }> {
    let all = getStoredMessages();

    // Filter by labels if requested
    if (options?.labelIds && options.labelIds.length > 0) {
      const targetLabel = options.labelIds[0].toUpperCase();
      if (targetLabel === 'INBOX') {
        all = all.filter((m) => (m.labelIds || []).includes('INBOX'));
      } else if (targetLabel === 'SENT') {
        all = all.filter((m) => (m.labelIds || []).includes('SENT'));
      } else if (targetLabel === 'DRAFT') {
        all = all.filter((m) => (m.labelIds || []).includes('DRAFT'));
      } else if (targetLabel === 'VISA') {
        all = all.filter((m) => (m.labelIds || []).includes('VISA'));
      }
    }

    // Filter by query string
    if (options?.query) {
      const q = options.query.toLowerCase();
      all = all.filter(
        (m) =>
          (m.subject && m.subject.toLowerCase().includes(q)) ||
          (m.snippet && m.snippet.toLowerCase().includes(q)) ||
          (m.to && m.to.toLowerCase().includes(q)) ||
          (m.from && m.from.toLowerCase().includes(q))
      );
    }

    // Convert to summaries
    const summaries: GmailMessageSummary[] = all.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      snippet: m.snippet,
      internalDate: m.internalDate,
      subject: m.subject,
      from: m.from,
      to: m.to,
      date: m.date,
      isUnread: m.isUnread,
      hasAttachment: Boolean(m.hasAttachment || (m.attachments && m.attachments.length > 0)),
      attachments: m.attachments,
      labelIds: m.labelIds,
    }));

    return {
      messages: summaries,
      resultSizeEstimate: summaries.length,
    };
  },

  // Get fast summary
  async getMessageSummary(messageId: string): Promise<GmailMessageSummary> {
    const all = getStoredMessages();
    const found = all.find((m) => m.id === messageId) || all[0];
    return {
      id: found.id,
      threadId: found.threadId,
      snippet: found.snippet,
      internalDate: found.internalDate,
      subject: found.subject,
      from: found.from,
      to: found.to,
      date: found.date,
      isUnread: found.isUnread,
      hasAttachment: Boolean(found.hasAttachment || (found.attachments && found.attachments.length > 0)),
      attachments: found.attachments,
      labelIds: found.labelIds,
    };
  },

  // Get full message body
  async getFullMessage(messageId: string): Promise<GmailMessageDetail> {
    const all = getStoredMessages();
    const found = all.find((m) => m.id === messageId);
    if (!found) {
      throw new Error('Message not found');
    }
    return found;
  },

  // Send an email (Dispatches directly via live SMTP and logs to CRM records with attachments)
  async sendEmail(
    payload: SendEmailPayload,
    customSmtpConfig?: any
  ): Promise<{
    id: string;
    threadId: string;
    deliveredViaSmtp: boolean;
    method: string;
    messageId?: string;
    warning?: string;
    error?: string;
    webGmailUrl?: string;
    mailtoUrl?: string;
  }> {
    const newId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newThreadId = payload.threadId || `th-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const attachments = payload.attachments || [];

    let deliveredViaSmtp = false;
    let method = 'crm_logged';
    let messageId: string | undefined;
    let warning: string | undefined;
    let error: string | undefined;
    let webGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(payload.to)}&su=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;
    let mailtoUrl = `mailto:${payload.to}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;

    // Attempt real SMTP dispatch via server
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payload.to,
          subject: payload.subject,
          body: payload.body,
          isHtml: payload.isHtml,
          cc: payload.cc,
          bcc: payload.bcc,
          attachments,
          smtpConfig: customSmtpConfig,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.delivered) {
          deliveredViaSmtp = true;
          method = 'smtp';
          messageId = data.messageId;
        } else if (data.warning || data.details || data.error) {
          warning = data.warning || data.details || data.error;
          method = data.method || 'crm_logged';
        }
        if (data.webGmailUrl) webGmailUrl = data.webGmailUrl;
        if (data.mailtoUrl) mailtoUrl = data.mailtoUrl;
      } else {
        const errData = await response.json().catch(() => ({}));
        warning = errData.error || errData.details || 'Server email dispatch returned an error';
      }
    } catch (netErr: any) {
      console.warn('Backend email API call notice:', netErr);
      warning = 'Logged in CRM. Configure SMTP server in Settings to enable automatic background inbox delivery.';
    }

    const newMsg: GmailMessageDetail = {
      id: newId,
      threadId: newThreadId,
      subject: payload.subject,
      from: 'ADCS <info@theadcs.com>',
      to: payload.to,
      date: nowIso,
      snippet: payload.body.slice(0, 140) + (payload.body.length > 140 ? '...' : ''),
      bodyText: payload.body,
      internalDate: Date.now().toString(),
      isUnread: false,
      hasAttachment: attachments.length > 0,
      attachments,
      labelIds: ['SENT', payload.subject.toLowerCase().includes('visa') ? 'VISA' : 'GENERAL'],
      labels: ['SENT'],
      headers: {
        from: 'ADCS <info@theadcs.com>',
        to: payload.to,
        subject: payload.subject,
        date: new Date().toUTCString(),
      },
    };

    const current = getStoredMessages();
    const updated = [newMsg, ...current];
    saveStoredMessages(updated);

    return {
      id: newId,
      threadId: newThreadId,
      deliveredViaSmtp,
      method,
      messageId,
      warning,
      error,
      webGmailUrl,
      mailtoUrl,
    };
  },

  // Mark message as read/unread
  async modifyLabels(messageId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<void> {
    const current = getStoredMessages();
    const updated = current.map((m) => {
      if (m.id === messageId) {
        let labels = [...(m.labelIds || [])];
        if (removeLabelIds.includes('UNREAD')) {
          labels = labels.filter((l) => l !== 'UNREAD');
          m.isUnread = false;
        }
        if (addLabelIds.includes('UNREAD')) {
          if (!labels.includes('UNREAD')) labels.push('UNREAD');
          m.isUnread = true;
        }
        return { ...m, labelIds: labels, labels };
      }
      return m;
    });
    saveStoredMessages(updated);
  },

  // Move email to Trash / Delete
  async trashMessage(messageId: string): Promise<void> {
    const current = getStoredMessages();
    const updated = current.filter((m) => m.id !== messageId);
    saveStoredMessages(updated);
  },
};
