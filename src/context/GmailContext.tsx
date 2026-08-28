import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  getCachedGoogleUser,
} from '../services/googleAuth';
import {
  gmailService,
  GmailMessageSummary,
  GmailMessageDetail,
  GmailProfile,
  SendEmailPayload,
} from '../services/gmailService';
import { useCRM } from './CRMContext';

interface SendConfirmationData {
  isOpen: boolean;
  payload: SendEmailPayload;
  clientName?: string;
  onConfirm: () => Promise<void>;
}

interface DeleteConfirmationData {
  isOpen: boolean;
  messageId: string;
  subject: string;
  onConfirm: () => Promise<void>;
}

interface GmailContextType {
  isConnected: boolean;
  isAuthenticating: boolean;
  googleUser: FirebaseUser | null;
  gmailProfile: GmailProfile | null;
  messages: GmailMessageSummary[];
  selectedMessage: GmailMessageDetail | null;
  isLoadingMessages: boolean;
  isLoadingDetail: boolean;
  activeFolder: 'INBOX' | 'SENT' | 'DRAFT' | 'ALL' | 'VISA';
  searchQuery: string;
  authError: string | null;
  
  // Confirmation Modals (Mandatory for destructive/mutating actions)
  sendConfirmData: SendConfirmationData | null;
  deleteConfirmData: DeleteConfirmationData | null;

  // Actions
  connectGmail: () => Promise<boolean>;
  disconnectGmail: () => Promise<void>;
  setActiveFolder: (folder: 'INBOX' | 'SENT' | 'DRAFT' | 'ALL' | 'VISA') => void;
  setSearchQuery: (query: string) => void;
  fetchMessages: (folderOverride?: string, queryOverride?: string) => Promise<void>;
  selectMessageById: (messageId: string) => Promise<void>;
  clearSelectedMessage: () => void;
  
  // Email Dispatch with Mandatory Confirmation
  requestSendEmail: (payload: SendEmailPayload, clientName?: string) => void;
  cancelSendEmail: () => void;
  confirmSendEmail: () => Promise<{ success: boolean; error?: string }>;

  // Delete / Trash with Mandatory Confirmation
  requestTrashEmail: (messageId: string, subject: string) => void;
  cancelTrashEmail: () => void;
  confirmTrashEmail: () => Promise<{ success: boolean; error?: string }>;

  // Quick Helper to Send Official UAE Visa Status Email via connected Gmail
  sendVisaStatusViaGmail: (clientId: string) => Promise<{ success: boolean; error?: string; emailDetails?: any }>;
}

const GmailContext = createContext<GmailContextType | undefined>(undefined);

export const GmailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { clients, crmBranding, logAuditEvent } = useCRM();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [gmailProfile, setGmailProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [activeFolder, setActiveFolder] = useState<'INBOX' | 'SENT' | 'DRAFT' | 'ALL' | 'VISA'>('INBOX');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // User Confirmation State for Mutating Operations
  const [sendConfirmData, setSendConfirmData] = useState<SendConfirmationData | null>(null);
  const [deleteConfirmData, setDeleteConfirmData] = useState<DeleteConfirmationData | null>(null);

  // Initialize Auth State Listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        if (token) {
          setIsConnected(true);
          setGoogleUser(user);
          setAuthError(null);
          try {
            const profile = await gmailService.getProfile();
            setGmailProfile(profile);
          } catch (e: any) {
            console.warn('Could not fetch initial Gmail profile:', e);
          }
        }
      },
      () => {
        setIsConnected(false);
        setGoogleUser(null);
        setGmailProfile(null);
        setMessages([]);
        setSelectedMessage(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch messages based on folder and query
  const fetchMessages = useCallback(
    async (folderOverride?: string, queryOverride?: string) => {
      const token = await getAccessToken();
      if (!token) return;

      setIsLoadingMessages(true);
      try {
        const folder = folderOverride || activeFolder;
        const query = queryOverride !== undefined ? queryOverride : searchQuery;

        let finalQuery = query;
        let labelIds: string[] | undefined = undefined;

        if (folder === 'INBOX') {
          labelIds = ['INBOX'];
        } else if (folder === 'SENT') {
          labelIds = ['SENT'];
        } else if (folder === 'DRAFT') {
          labelIds = ['DRAFT'];
        } else if (folder === 'VISA') {
          finalQuery = (finalQuery ? `${finalQuery} ` : '') + '(visa OR residency OR ICP OR GDRFA OR clearance OR Emirates)';
        }

        const res = await gmailService.listMessages({
          query: finalQuery,
          labelIds,
          maxResults: 30,
        });

        setMessages(res.messages);
      } catch (err: any) {
        console.error('Failed to load messages from Gmail:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [activeFolder, searchQuery]
  );

  // Auto-refresh messages when connection is established or activeFolder changes
  useEffect(() => {
    if (isConnected) {
      fetchMessages();
    }
  }, [isConnected, activeFolder, fetchMessages]);

  // Connect Gmail with Google Sign-in Popup
  const connectGmail = async (): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setIsConnected(true);
        setGoogleUser(result.user);
        const profile = await gmailService.getProfile();
        setGmailProfile(profile);
        await fetchMessages();
        
        logAuditEvent(
          'CONNECT_GMAIL',
          'Authentication',
          `Authorized Google Workspace Gmail account: ${result.user.email}`
        );
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Gmail connection error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google Gmail.');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Disconnect Gmail
  const disconnectGmail = async () => {
    await logoutGoogle();
    setIsConnected(false);
    setGoogleUser(null);
    setGmailProfile(null);
    setMessages([]);
    setSelectedMessage(null);
    logAuditEvent('DISCONNECT_GMAIL', 'Authentication', 'Disconnected Google Gmail session');
  };

  // Select a message and load its full content
  const selectMessageById = async (messageId: string) => {
    setIsLoadingDetail(true);
    try {
      const full = await gmailService.getFullMessage(messageId);
      setSelectedMessage(full);
      // Mark as read in Gmail if unread
      if (full.isUnread) {
        await gmailService.modifyLabels(messageId, [], ['UNREAD']);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isUnread: false } : m))
        );
      }
    } catch (err) {
      console.error('Failed to load message detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const clearSelectedMessage = () => {
    setSelectedMessage(null);
  };

  // Step 1 of Sending: Present Mandatory Confirmation Dialog to user
  const requestSendEmail = (payload: SendEmailPayload, clientName?: string) => {
    setSendConfirmData({
      isOpen: true,
      payload,
      clientName,
      onConfirm: async () => {},
    });
  };

  const cancelSendEmail = () => {
    setSendConfirmData(null);
  };

  // Step 2 of Sending: User clicks "Confirm & Send Email" in the modal
  const confirmSendEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!sendConfirmData) return { success: false, error: 'No email queued to send' };
    const { payload, clientName } = sendConfirmData;

    try {
      const result = await gmailService.sendEmail(payload);
      logAuditEvent(
        'SEND_GMAIL_EMAIL',
        'Authentication',
        `Dispatched Gmail message (ID: ${result.id}) to ${payload.to} with subject "${payload.subject}"`
      );
      setSendConfirmData(null);
      // Refresh Sent items if in SENT folder
      if (activeFolder === 'SENT') {
        fetchMessages();
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispatch email via Gmail' };
    }
  };

  // Step 1 of Trashing: Present Mandatory Confirmation Dialog
  const requestTrashEmail = (messageId: string, subject: string) => {
    setDeleteConfirmData({
      isOpen: true,
      messageId,
      subject,
      onConfirm: async () => {},
    });
  };

  const cancelTrashEmail = () => {
    setDeleteConfirmData(null);
  };

  // Step 2 of Trashing: User clicks "Confirm Move to Trash"
  const confirmTrashEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!deleteConfirmData) return { success: false, error: 'No message selected for deletion' };
    const { messageId, subject } = deleteConfirmData;

    try {
      await gmailService.trashMessage(messageId);
      logAuditEvent(
        'TRASH_GMAIL_MESSAGE',
        'Authentication',
        `Moved message "${subject}" (${messageId}) to Trash via Gmail API`
      );
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      setDeleteConfirmData(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to move email to trash' };
    }
  };

  // Quick Helper: Send UAE Visa Status Update via Real Gmail Account
  const sendVisaStatusViaGmail = async (
    clientId: string
  ): Promise<{ success: boolean; error?: string; emailDetails?: any }> => {
    if (!isConnected) {
      return { success: false, error: 'Gmail is not connected. Please sign in with Google first.' };
    }

    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      return { success: false, error: 'Applicant client not found in CRM.' };
    }
    if (!client.email) {
      return { success: false, error: `Applicant ${client.fullName} has no email address on file.` };
    }

    const template = crmBranding.visaEmailTemplate;
    const currentService = client.services?.[0];
    const serviceName = currentService?.categoryName || 'UAE Golden Visa / Residency Clearance';
    const stageName = currentService?.currentStageName || 'Application Processing';

    // Parse template with real client variables
    let subject = template.subject
      .replace(/{CLIENT_NAME}/g, client.fullName)
      .replace(/{REF_NO}/g, client.refNo)
      .replace(/{SERVICE_NAME}/g, serviceName)
      .replace(/{CURRENT_STAGE}/g, stageName)
      .replace(/{CRM_NAME}/g, crmBranding.name);

    let body = template.bodyTemplate
      .replace(/{CLIENT_NAME}/g, client.fullName)
      .replace(/{REF_NO}/g, client.refNo)
      .replace(/{SERVICE_NAME}/g, serviceName)
      .replace(/{CURRENT_STAGE}/g, stageName)
      .replace(/{PASSPORT_NO}/g, client.passportNumber || 'N/A')
      .replace(/{EMIRATES_ID}/g, client.emiratesId || 'Pending Issue')
      .replace(/{COMPANY_NAME}/g, client.companyName || 'ADCS Corporate Clients')
      .replace(/{STAGE_REMARKS}/g, currentService?.notes || 'File in good standing with UAE General Directorate of Residency.')
      .replace(/{ASSIGNED_PRO_NAME}/g, client.assignedEmployeeName || 'Corporate PRO Officer')
      .replace(/{CRM_NAME}/g, crmBranding.name);

    // Add signature header and footer
    const fullBody = `${template.headerText}\n\n${body}\n\n---\n${template.footerText}\n${crmBranding.name} • Direct: ${crmBranding.supportPhone} • ${crmBranding.website}`;

    // Return the prepared payload so the caller can trigger the confirmation dialog
    return {
      success: true,
      emailDetails: {
        to: client.email,
        subject,
        body: fullBody,
        clientName: client.fullName,
      },
    };
  };

  return (
    <GmailContext.Provider
      value={{
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
        sendConfirmData,
        deleteConfirmData,
        connectGmail,
        disconnectGmail,
        setActiveFolder,
        setSearchQuery,
        fetchMessages,
        selectMessageById,
        clearSelectedMessage,
        requestSendEmail,
        cancelSendEmail,
        confirmSendEmail,
        requestTrashEmail,
        cancelTrashEmail,
        confirmTrashEmail,
        sendVisaStatusViaGmail,
      }}
    >
      {children}
    </GmailContext.Provider>
  );
};

export const useGmail = (): GmailContextType => {
  const context = useContext(GmailContext);
  if (!context) {
    throw new Error('useGmail must be used within a GmailProvider');
  }
  return context;
};
