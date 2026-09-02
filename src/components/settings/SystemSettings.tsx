import React, { useState, useRef } from 'react';
import {
  Settings,
  Layers,
  Shield,
  Bell,
  CheckCircle2,
  CheckCircle,
  Save,
  RotateCcw,
  Sliders,
  Sparkles,
  Lock,
  Upload,
  Image as ImageIcon,
  Mail,
  FileCheck2,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Key,
  Server,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  Building2,
  Phone,
  Globe,
  Receipt,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Tag,
  SlidersHorizontal,
  Briefcase,
  UserCheck,
  QrCode,
  DollarSign,
  Database,
  Cloud,
  Download,
  Copy,
  HardDrive,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useGmail } from '../../context/GmailContext';
import { VisaEmailTemplate, CRMBranding, InvoiceBillingSettings, LeadCategory, LeadSource, LeadStage, SmtpSettings } from '../../types/crm';
import { DepartmentSettings } from './DepartmentSettings';

interface SystemSettingsProps {
  initialTab?: 'billing' | 'departments' | 'lead_config' | 'branding' | 'visa_email' | 'smtp' | 'stages' | 'security' | 'notifications' | 'cloud_sync';
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ initialTab = 'billing' }) => {
  const {
    departments,
    stages,
    updateStage,
    currentUser,
    availableUsers,
    crmBranding,
    updateCRMBranding,
    resetCRMBrandingToDefault,
    updateSmtpSettings,
    billingSettings,
    updateBillingSettings,
    resetBillingSettingsToDefault,
    leadCategories,
    addLeadCategory,
    updateLeadCategory,
    deleteLeadCategory,
    leadSources,
    addLeadSource,
    updateLeadSource,
    deleteLeadSource,
    leadStages,
    addLeadStage,
    updateLeadStage,
    deleteLeadStage,
    resetVisaEmailTemplate,
    updateVisaEmailTemplate,
    sendVisaStatusEmail,
    clients,
    resetToDefaultData,
    clearAllDataToZero,
    isSavingToServer,
    serverSyncStatus,
    lastServerSyncTime,
    saveDataToServer,
    loadDataFromServer,
    createDatabaseBackup,
    exportCRMData,
    importCRMData,
  } = useCRM();

  const {
    isConnected: isGmailConnected,
    connectGmail,
    sendVisaStatusViaGmail,
    requestSendEmail,
  } = useGmail();

  const isMaster = currentUser.role === 'master';
  const isAdminOrMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'billing' | 'departments' | 'lead_config' | 'branding' | 'visa_email' | 'smtp' | 'stages' | 'security' | 'notifications' | 'cloud_sync'>(
    (initialTab === 'lead_config' || initialTab === 'departments') && !isAdminOrMaster ? 'branding' : initialTab
  );

  React.useEffect(() => {
    if (initialTab) {
      if ((initialTab === 'lead_config' || initialTab === 'departments') && !isAdminOrMaster) {
        setActiveTab('branding');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab, isAdminOrMaster]);
  
  // Billing Settings Form State
  const [billingForm, setBillingForm] = useState<InvoiceBillingSettings>(billingSettings);
  const [billingNotice, setBillingNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cloud & Multi-System Sync State
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Category CRUD Modal/Inline State
  const [editingCategory, setEditingCategory] = useState<LeadCategory | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatData, setNewCatData] = useState<{
    name: string;
    type: 'standard' | 'job_application' | 'corporate' | 'golden_visa' | 'general';
    description: string;
    color: string;
    isActive: boolean;
  }>({
    name: '',
    type: 'general',
    description: '',
    color: '#3B82F6',
    isActive: true,
  });

  // Source CRUD Modal/Inline State
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSrcData, setNewSrcData] = useState<{
    name: string;
    icon: string;
    description: string;
    isActive: boolean;
  }>({
    name: '',
    icon: 'Globe',
    description: '',
    isActive: true,
  });

  // Stage CRUD Modal/Inline State
  const [editingStageItem, setEditingStageItem] = useState<LeadStage | null>(null);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageData, setNewStageData] = useState<{
    name: string;
    color: string;
    order: number;
    description: string;
  }>({
    name: '',
    color: '#3B82F6',
    order: (leadStages?.length || 5) + 1,
    description: '',
  });

  // Branding Form State (Synced with crmBranding)
  const [brandForm, setBrandForm] = useState<CRMBranding>(crmBranding);
  const [brandingNotice, setBrandingNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Visa Email Form State
  const [emailForm, setEmailForm] = useState<VisaEmailTemplate>(crmBranding.visaEmailTemplate);
  const [emailNotice, setEmailNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testClientId, setTestClientId] = useState<string>(clients[0]?.id || '');
  const [testSentSuccess, setTestSentSuccess] = useState<any>(null);

  // SMTP & Outbound Email Dispatch Form State
  const [smtpForm, setSmtpForm] = useState<SmtpSettings>(
    crmBranding.smtpSettings || {
      enabled: true,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      user: '',
      pass: '',
      fromName: 'ADCS Corporate Services',
      fromEmail: '',
    }
  );
  const [smtpNotice, setSmtpNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message?: string; error?: string; details?: string } | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState(currentUser.email || 'info@adcs.ae');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // Duplicate rules state
  const [duplicateMobile, setDuplicateMobile] = useState(true);
  const [duplicatePassport, setDuplicatePassport] = useState(true);
  const [duplicateEID, setDuplicateEID] = useState(true);
  const [duplicateEmail, setDuplicateEmail] = useState(true);
  const [expiryDaysThreshold, setExpiryDaysThreshold] = useState(180);

  // File input refs
  const logoFileRef = useRef<HTMLInputElement>(null);
  const stampFileRef = useRef<HTMLInputElement>(null);
  const signatureFileRef = useRef<HTMLInputElement>(null);

  // Sync state if context changes
  React.useEffect(() => {
    setBrandForm(crmBranding);
    setEmailForm(crmBranding.visaEmailTemplate);
    if (crmBranding.smtpSettings) {
      setSmtpForm(crmBranding.smtpSettings);
    }
    if (billingSettings) {
      setBillingForm(billingSettings);
    }
  }, [crmBranding, billingSettings]);

  // Handle Logo Upload from Device
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMaster) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setBrandingNotice({ type: 'error', text: 'Image file size must be under 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setBrandForm((prev) => ({ ...prev, logoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Stamp Upload
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdminOrMaster) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setBillingNotice({ type: 'error', text: 'Stamp image file size must be under 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setBillingForm((prev) => ({
          ...prev,
          stamp: { ...prev.stamp, stampImageUrl: base64, showStamp: true },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Signature Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdminOrMaster) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setBillingNotice({ type: 'error', text: 'Signature image file size must be under 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setBillingForm((prev) => ({
          ...prev,
          signatory: { ...prev.signatory, signatureImageUrl: base64, showSignature: true },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Billing Settings (Admin & Master)
  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrMaster) {
      setBillingNotice({
        type: 'error',
        text: 'Access Denied: Only Admin or Master users can modify Invoice & Billing configurations.',
      });
      return;
    }

    const res = updateBillingSettings(billingForm);
    if (res.success) {
      setBillingNotice({ type: 'success', text: 'Invoice company details, VAT, signatory, and stamp saved successfully.' });
      setTimeout(() => setBillingNotice(null), 4000);
    } else {
      setBillingNotice({ type: 'error', text: res.error || 'Failed to update billing settings.' });
    }
  };

  // Reset Billing Settings
  const handleResetBilling = () => {
    if (!isAdminOrMaster) {
      alert('Only Admin or Master users can reset billing settings.');
      return;
    }
    if (confirm('Reset invoice company details, VAT rate, and stamp/signatory to standard defaults?')) {
      resetBillingSettingsToDefault();
      setBillingNotice({ type: 'success', text: 'Billing settings restored to default values.' });
      setTimeout(() => setBillingNotice(null), 3000);
    }
  };

  // Save CRM Branding (Master Only)
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) {
      setBrandingNotice({
        type: 'error',
        text: 'Access Denied: Only Master User can modify CRM Name, Logo & Branding.',
      });
      return;
    }

    const res = updateCRMBranding(brandForm);
    if (res.success) {
      setBrandingNotice({ type: 'success', text: 'CRM Name, Logo & System Branding updated successfully.' });
      setTimeout(() => setBrandingNotice(null), 4000);
    } else {
      setBrandingNotice({ type: 'error', text: res.error || 'Failed to update branding.' });
    }
  };

  // Reset CRM Branding to Defaults
  const handleResetBranding = () => {
    if (!isMaster) {
      alert('Only Master User can reset CRM branding.');
      return;
    }
    if (confirm('Reset CRM name, logo, and theme to initial factory defaults?')) {
      resetCRMBrandingToDefault();
      setBrandingNotice({ type: 'success', text: 'Branding restored to factory defaults.' });
      setTimeout(() => setBrandingNotice(null), 3000);
    }
  };

  // Lead Category Handlers
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatData.name.trim()) return;
    const isJob = newCatData.type === 'job_application';
    const code = newCatData.name.toUpperCase().replace(/[^A-Z0-9]/g, '_') || `CAT_${Date.now()}`;
    addLeadCategory({
      name: newCatData.name.trim(),
      code,
      type: newCatData.type,
      description: newCatData.description || '',
      color: newCatData.color || '#3B82F6',
      badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      badgeText: newCatData.name.trim(),
      isJobCategory: isJob,
      isActive: newCatData.isActive,
      isDefault: false,
    });
    setNewCatData({
      name: '',
      type: 'general',
      description: '',
      color: '#3B82F6',
      isActive: true,
    });
    setShowAddCategoryModal(false);
  };

  const handleUpdateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const isJob = editingCategory.type === 'job_application' || editingCategory.isJobCategory;
    updateLeadCategory(editingCategory.id, {
      ...editingCategory,
      isJobCategory: isJob,
      badgeText: editingCategory.name,
    });
    setEditingCategory(null);
  };

  // Lead Source Handlers
  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrcData.name.trim()) return;
    addLeadSource(newSrcData);
    setNewSrcData({
      name: '',
      icon: 'Globe',
      description: '',
      isActive: true,
    });
    setShowAddSourceModal(false);
  };

  const handleUpdateSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;
    updateLeadSource(editingSource.id, editingSource);
    setEditingSource(null);
  };

  // Lead Stage Handlers
  const handleCreateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageData.name.trim()) return;
    addLeadStage(newStageData);
    setNewStageData({
      name: '',
      color: '#3B82F6',
      order: (leadStages?.length || 5) + 1,
      description: '',
    });
    setShowAddStageModal(false);
  };

  const handleUpdateStageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStageItem) return;
    updateLeadStage(editingStageItem.id, editingStageItem);
    setEditingStageItem(null);
  };

  // Save Visa Email Template
  const handleSaveVisaEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateVisaEmailTemplate(emailForm);
    if (res.success) {
      setEmailNotice({ type: 'success', text: 'Official UAE Visa email template saved.' });
      setTimeout(() => setEmailNotice(null), 4000);
    } else {
      setEmailNotice({ type: 'error', text: res.error || 'Failed to update email template.' });
    }
  };

  // Reset Visa Email Template
  const handleResetVisaEmail = () => {
    if (confirm('Reset Visa clearance email template to official UAE GDRFA / ICP default format?')) {
      resetVisaEmailTemplate();
      setEmailNotice({ type: 'success', text: 'Visa email template restored to official UAE ICP/GDRFA defaults.' });
      setTimeout(() => setEmailNotice(null), 3000);
    }
  };

  // Dispatch Test Visa Email
  const handleSendTestVisaEmail = () => {
    if (!testClientId) {
      alert('Please select a client to dispatch the test email.');
      return;
    }
    const res = sendVisaStatusEmail(testClientId);
    if (res.success) {
      setTestSentSuccess(res.emailRecord);
      setEmailNotice({ type: 'success', text: `Test visa notification email dispatched to client (${res.emailRecord.to})!` });
    } else {
      setEmailNotice({ type: 'error', text: res.error || 'Failed to send test email.' });
    }
  };

  // SMTP Quick Presets
  const handleApplySmtpPreset = (preset: 'gmail' | 'outlook' | 'custom') => {
    if (preset === 'gmail') {
      setSmtpForm((prev) => ({
        ...prev,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        fromName: 'ADCS',
        fromEmail: 'info@theadcs.com',
      }));
    } else if (preset === 'outlook') {
      setSmtpForm((prev) => ({
        ...prev,
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        fromName: 'ADCS',
        fromEmail: 'info@theadcs.com',
      }));
    } else {
      setSmtpForm((prev) => ({
        ...prev,
        host: 'mail.theadcs.com',
        port: 465,
        secure: true,
        fromName: 'ADCS',
        fromEmail: 'info@theadcs.com',
      }));
    }
    setSmtpNotice({
      type: 'success',
      text: `Loaded preset configuration for ${preset === 'gmail' ? 'Gmail / Google Workspace' : preset === 'outlook' ? 'Microsoft 365 / Outlook' : 'Corporate Mail Server'}. Sender set to ADCS <info@theadcs.com>.`,
    });
    setTimeout(() => setSmtpNotice(null), 4000);
  };

  // Test SMTP Server Connection Handshake
  const handleTestSmtpConnection = async () => {
    if (!smtpForm.user || !smtpForm.pass) {
      setSmtpTestResult({
        success: false,
        error: 'Missing Credentials',
        details: 'Please enter both your Email / Username and Password / Google App Password before testing the connection.',
      });
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await fetch('/api/smtp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpForm.host,
          port: Number(smtpForm.port),
          secure: smtpForm.secure,
          user: smtpForm.user,
          pass: smtpForm.pass,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpTestResult({
          success: true,
          message: data.message || `Successfully connected and authenticated with ${smtpForm.host}:${smtpForm.port} (${smtpForm.user})!`,
        });
      } else {
        setSmtpTestResult({
          success: false,
          error: data.error || 'Connection handshake failed',
          details: data.details || 'Unable to establish authenticated SMTP session. Please check your credentials or Google App Password.',
        });
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        error: 'Network Error',
        details: err.message || 'Failed to reach SMTP test endpoint.',
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Save SMTP Settings
  const handleSaveSmtpSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrMaster) {
      setSmtpNotice({ type: 'error', text: 'Restricted setting: Only Admin or Master users can configure SMTP dispatch.' });
      return;
    }

    const res = updateSmtpSettings(smtpForm);
    if (res.success) {
      setSmtpNotice({ type: 'success', text: 'SMTP email server configuration saved and synchronized successfully!' });
      setTimeout(() => setSmtpNotice(null), 5000);
    } else {
      setSmtpNotice({ type: 'error', text: res.error || 'Failed to save SMTP settings.' });
    }
  };

  // Send Live Test Email
  const handleSendLiveTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setTestEmailResult({ success: false, error: 'Please enter a valid recipient email address.' });
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailRecipient,
          subject: `ADCS — Verification Notice`,
          body: `Dear Client,\n\nThis is an official verification notice from ADCS confirming that your communication channel is active and authenticated.\n\nBest regards,\nADCS\n\n----------------------------------------\nPlease do not reply directly to this email. This is an automated email from ADCS.`,
          smtpConfig: {
            host: smtpForm.host,
            port: Number(smtpForm.port),
            secure: smtpForm.secure,
            user: smtpForm.user,
            pass: smtpForm.pass,
            fromName: 'ADCS',
            fromEmail: smtpForm.fromEmail || 'info@theadcs.com',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.delivered) {
        setTestEmailResult({
          success: true,
          message: `Live email successfully delivered to ${testEmailRecipient} via SMTP! (Message ID: ${data.messageId || 'OK'})`,
        });
      } else {
        setTestEmailResult({
          success: false,
          error: data.error || data.details || data.warning || 'Failed to deliver live test email. Check server response.',
        });
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        error: err.message || 'Error occurred while dispatching live test email.',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleGlobalResetData = () => {
    if (confirm('Reset entire CRM database to fresh initial seed data?')) {
      resetToDefaultData();
    }
  };

  const handleClearAllToZero = async () => {
    if (confirm('Are you sure you want to remove all clients, leads, invoices, tasks, transactions, and documents and set all operational metrics to 0?')) {
      await clearAllDataToZero();
      alert('All operational records have been wiped and metrics set to 0.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Settings & Governance</h1>
            {isMaster ? (
              <span className="text-[10px] font-black px-2.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> MASTER UNLOCKED
              </span>
            ) : isAdminOrMaster ? (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> ADMIN UNLOCKED
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> ROLE: {currentUser.role.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure invoice billing details, VAT/TRN, company stamp & signatory, lead categories & channels, and CRM branding
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Invoice & Billing Settings</span>
          {!isAdminOrMaster && <Lock className="w-3 h-3 text-slate-400" />}
        </button>

        {isAdminOrMaster && (
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'departments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Departments ({(departments || []).length})</span>
          </button>
        )}

        {isAdminOrMaster && (
          <button
            onClick={() => setActiveTab('lead_config')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'lead_config'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Lead Categories & Channels ({leadCategories?.length || 0})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'branding'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>CRM Name & Photo Branding</span>
          {!isMaster && <Lock className="w-3 h-3 text-slate-400" />}
        </button>

        <button
          onClick={() => setActiveTab('visa_email')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'visa_email'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Reset Visa Email Template</span>
        </button>

        <button
          onClick={() => setActiveTab('smtp')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'smtp'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Email & SMTP Dispatch</span>
          {!isAdminOrMaster && <Lock className="w-3 h-3 text-slate-400" />}
        </button>

        <button
          onClick={() => setActiveTab('stages')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'stages'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Workflow Stages ({stages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Duplicate Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Alerts & Reset</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud_sync')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'cloud_sync'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud & Data Persistence</span>
        </button>
      </div>

      {/* Tab: Departments Management */}
      {activeTab === 'departments' && <DepartmentSettings />}

      {/* Tab: Invoice & Billing Settings */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Permission Notice Banner */}
          {!isAdminOrMaster ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Admin / Master Access Required</strong>
                <span>
                  Invoice company details, VAT registration, authorized signatory, and official stamp settings can only be modified by Administrator or Master accounts.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs flex items-start gap-3">
              <Receipt className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Official UAE Tax Invoice & Billing Governance</strong>
                <span>
                  Configure legal company information, TRN (Tax Registration Number), standard VAT rates, bank transfer wire instructions, authorized signatory details, and official company stamp. Changes apply dynamically across all invoices and printable receipts.
                </span>
              </div>
            </div>
          )}

          {billingNotice && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                billingNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {billingNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{billingNotice.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveBilling} className="space-y-6">
            {/* Section 1: Company Legal Identity & Tax Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Company Legal Entity & Tax Registration (FTA UAE)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    required
                    value={billingForm.companyName ?? ''}
                    onChange={(e) => setBillingForm({ ...billingForm, companyName: e.target.value })}
                    placeholder="e.g. ADCS Document Clearing LLC"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Trade License Number
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    value={billingForm.tradeLicenseNo || ''}
                    onChange={(e) => setBillingForm({ ...billingForm, tradeLicenseNo: e.target.value })}
                    placeholder="e.g. TL-89421 / Dubai DED"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tax Registration Number (TRN / VAT No.) *
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    required
                    value={billingForm.trnNumber ?? ''}
                    onChange={(e) => setBillingForm({ ...billingForm, trnNumber: e.target.value })}
                    placeholder="e.g. 10048291000003"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-blue-600 disabled:opacity-60"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">15-digit Federal Tax Authority Registration Code</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Standard VAT Rate (%) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      disabled={!isAdminOrMaster}
                      min={0}
                      max={100}
                      required
                      value={billingForm.vatPercentage ?? ''}
                      onChange={(e) => setBillingForm({ ...billingForm, vatPercentage: Number(e.target.value) })}
                      className="w-28 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold disabled:opacity-60"
                    />
                    <span className="text-xs text-slate-500 font-medium">% (Standard UAE FTA Rate is 5%)</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Registered Physical Address
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    value={billingForm.address ?? ''}
                    onChange={(e) => setBillingForm({ ...billingForm, address: e.target.value })}
                    placeholder="e.g. Business Bay Tower, Floor 14, P.O. Box 89211, Dubai, UAE"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Official Billing Email
                  </label>
                  <input
                    type="email"
                    disabled={!isAdminOrMaster}
                    value={billingForm.email ?? ''}
                    onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                    placeholder="finance@adcs.ae"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Official Billing Phone / Hotline
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    value={billingForm.phone ?? ''}
                    onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value })}
                    placeholder="+971 4 800 2739"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Bank Wire & Remittance Settlement */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Bank Transfer Settlement Details (Printed on Invoices)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Beneficiary Bank Name
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    value={billingForm.bankDetails?.bankName || ''}
                    onChange={(e) =>
                      setBillingForm({
                        ...billingForm,
                        bankDetails: { ...(billingForm.bankDetails || { bankName: '', accountName: '', accountNumber: '', iban: '', swift: '', branch: '' }), bankName: e.target.value },
                      })
                    }
                    placeholder="e.g. Emirates NBD PJSC (Dubai Main)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Beneficiary Name
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    value={billingForm.bankDetails?.accountName || ''}
                    onChange={(e) =>
                      setBillingForm({
                        ...billingForm,
                        bankDetails: { ...(billingForm.bankDetails || { bankName: '', accountName: '', accountNumber: '', iban: '', swift: '', branch: '' }), accountName: e.target.value },
                      })
                    }
                    placeholder="e.g. ADCS Document Clearing LLC"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    IBAN (International Bank Account Number)
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    value={billingForm.bankDetails?.iban || ''}
                    onChange={(e) =>
                      setBillingForm({
                        ...billingForm,
                        bankDetails: { ...(billingForm.bankDetails || { bankName: '', accountName: '', accountNumber: '', iban: '', swift: '', branch: '' }), iban: e.target.value },
                      })
                    }
                    placeholder="AE44 0260 0001 2345 6789 012"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrMaster}
                    value={billingForm.bankDetails?.swift || ''}
                    onChange={(e) =>
                      setBillingForm({
                        ...billingForm,
                        bankDetails: { ...(billingForm.bankDetails || { bankName: '', accountName: '', accountNumber: '', iban: '', swift: '', branch: '' }), swift: e.target.value },
                      })
                    }
                    placeholder="EBILAEADXXX"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Nomod Online Payment Gateway & Checkout Configuration */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Nomod Live Gateway & Digital Payments</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Accept instant credit/debit card payments, Apple Pay, Google Pay, and UAE debit cards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {billingForm.nomodEnabled && billingForm.nomodApiKey ? (
                    <>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                        Direct API Active
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        Live Mode
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-bold">
                      Disconnected
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Nomod Secret Live API Key (Bearer Token)
                    </label>
                    <div className="flex items-center gap-2">
                      {billingForm.nomodApiKey && (
                        <button
                          type="button"
                          disabled={!isAdminOrMaster}
                          onClick={() => {
                            setBillingForm({
                              ...billingForm,
                              nomodApiKey: '',
                              nomodEnabled: false,
                            });
                          }}
                          className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                        >
                          Disconnect / Logout from Nomod
                        </button>
                      )}
                      {!billingForm.nomodApiKey && (
                        <button
                          type="button"
                          disabled={!isAdminOrMaster}
                          onClick={() => {
                            setBillingForm({
                              ...billingForm,
                              nomodApiKey: 'sk_live_3IVlZ54J.kLVItZdIN1Xlvi2ybkMPU6Fv6K13UhvY',
                              nomodEnabled: true,
                            });
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                        >
                          Use Demo Credentials
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      disabled={!isAdminOrMaster}
                      value={billingForm.nomodApiKey ?? ''}
                      onChange={(e) => setBillingForm({ ...billingForm, nomodApiKey: e.target.value })}
                      placeholder="sk_live_..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100 disabled:opacity-60"
                    />
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                      {billingForm.nomodApiKey ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                          Connected
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Not Set
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used securely server-side to generate instant payment links and verify authorizations.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Default Settlement Currency
                  </label>
                  <select
                    disabled={!isAdminOrMaster}
                    value={billingForm.nomodCurrencyDefault || 'AED'}
                    onChange={(e) => setBillingForm({ ...billingForm, nomodCurrencyDefault: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-60"
                  >
                    <option value="AED">AED - United Arab Emirates Dirham</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Checkout Feature Status
                  </label>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Enable Instant Checkout</span>
                    <input
                      type="checkbox"
                      disabled={!isAdminOrMaster}
                      checked={billingForm.nomodEnabled ?? true}
                      onChange={(e) => setBillingForm({ ...billingForm, nomodEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Authorized Signatory & Official Company Stamp */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span>Authorized Signatory & Official Company Stamp</span>
                </h3>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                  Admin & Master Controlled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Signatory Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Authorized Signatory</span>
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isAdminOrMaster}
                        checked={billingForm.signatory?.showSignature ?? true}
                        onChange={(e) =>
                          setBillingForm({
                            ...billingForm,
                            signatory: {
                              ...(billingForm.signatory || { name: 'Alexander Vance', designation: 'Managing Director & Authorized Signatory', showSignature: true }),
                              showSignature: e.target.checked,
                            },
                          })
                        }
                        className="w-3.5 h-3.5 text-blue-600 rounded-sm"
                      />
                      <span className="text-[11px] text-slate-500">Show on Invoices</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Signatory Officer Name *
                    </label>
                    <input
                      type="text"
                      disabled={!isAdminOrMaster}
                      required
                      value={billingForm.signatory?.name || ''}
                      onChange={(e) =>
                        setBillingForm({
                          ...billingForm,
                          signatory: {
                            ...(billingForm.signatory || { designation: 'Managing Director & Authorized Signatory', showSignature: true }),
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Alexander Vance"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Designation / Title *
                    </label>
                    <input
                      type="text"
                      disabled={!isAdminOrMaster}
                      required
                      value={billingForm.signatory?.designation || ''}
                      onChange={(e) =>
                        setBillingForm({
                          ...billingForm,
                          signatory: {
                            ...(billingForm.signatory || { name: 'Alexander Vance', showSignature: true }),
                            designation: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Managing Director & Authorized Signatory"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                    />
                  </div>

                  {/* Signature Image & Preview */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Signature Mark / Digital Seal
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center p-1 overflow-hidden">
                        {billingForm.signatory?.signatureImageUrl ? (
                          <img
                            src={billingForm.signatory.signatureImageUrl}
                            alt="Signatory"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="font-serif italic text-blue-800 text-sm tracking-wide">
                            {billingForm.signatory?.name || 'Alexander Vance'}
                          </div>
                        )}
                      </div>

                      {isAdminOrMaster && (
                        <div>
                          <input
                            ref={signatureFileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => signatureFileRef.current?.click()}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Signature</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Stamp Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-rose-600" />
                      <span>Official Corporate Stamp</span>
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isAdminOrMaster}
                        checked={billingForm.stamp?.showStamp ?? true}
                        onChange={(e) =>
                          setBillingForm({
                            ...billingForm,
                            stamp: {
                              ...(billingForm.stamp || { stampLabel: 'ADCS DOCUMENT CLEARING LLC', stampSubtext: 'GOVERNMENT PRO & VISA CLEARANCE', showStamp: true }),
                              showStamp: e.target.checked,
                            },
                          })
                        }
                        className="w-3.5 h-3.5 text-rose-600 rounded-sm"
                      />
                      <span className="text-[11px] text-slate-500">Show on Invoices</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Stamp Primary Seal Label
                    </label>
                    <input
                      type="text"
                      disabled={!isAdminOrMaster}
                      value={billingForm.stamp?.stampLabel || ''}
                      onChange={(e) =>
                        setBillingForm({
                          ...billingForm,
                          stamp: {
                            ...(billingForm.stamp || { stampSubtext: 'GOVERNMENT PRO & VISA CLEARANCE', showStamp: true }),
                            stampLabel: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. ADCS DOCUMENT CLEARING LLC"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 uppercase font-bold text-[11px] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Stamp Subtitle / Jurisdiction
                    </label>
                    <input
                      type="text"
                      disabled={!isAdminOrMaster}
                      value={billingForm.stamp?.stampSubtext || ''}
                      onChange={(e) =>
                        setBillingForm({
                          ...billingForm,
                          stamp: {
                            ...(billingForm.stamp || { stampLabel: 'ADCS DOCUMENT CLEARING LLC', showStamp: true }),
                            stampSubtext: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. GOVERNMENT PRO & VISA CLEARANCE - DUBAI UAE"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-[11px] disabled:opacity-60"
                    />
                  </div>

                  {/* Stamp Visual Preview */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Stamp Seal Preview
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center p-1">
                        {billingForm.stamp?.stampImageUrl ? (
                          <img
                            src={billingForm.stamp.stampImageUrl}
                            alt="Stamp"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full border-2 border-rose-600/80 dark:border-rose-500/80 flex flex-col items-center justify-center text-center p-1 text-[8px] text-rose-700 dark:text-rose-400 font-bold uppercase rotate-[-6deg] shadow-xs">
                            <span>ADCS</span>
                            <span className="text-[6px] font-mono text-slate-500">OFFICIAL</span>
                            <span className="text-[6px] text-rose-600">DUBAI UAE</span>
                          </div>
                        )}
                      </div>

                      {isAdminOrMaster && (
                        <div>
                          <input
                            ref={stampFileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleStampUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => stampFileRef.current?.click()}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Stamp Logo</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Live Invoice Footer Preview */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Live Invoice Footer & Authorization Preview</span>
                </h4>
                <span className="text-[10px] text-slate-400">FTA Standard Format</span>
              </div>

              <div className="p-6 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Left: QR Code & Security */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center p-2 shrink-0">
                    <QrCode className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    <p className="font-bold text-slate-800">{billingForm.companyName || 'ADCS Clearing LLC'}</p>
                    <p className="font-mono">TRN: {billingForm.trnNumber || '10048291000003'}</p>
                    <p>Cryptographically validated for UAE FTA VAT Compliance</p>
                  </div>
                </div>

                {/* Right: Signatory & Stamp Rendering */}
                <div className="flex items-center gap-4">
                  {/* Stamp */}
                  {billingForm.stamp?.showStamp && (
                    <div className="w-16 h-16 rounded-full border-2 border-rose-600/80 flex flex-col items-center justify-center text-center p-1 text-[7px] text-rose-700 font-bold uppercase rotate-[-8deg] shadow-xs">
                      <span>{billingForm.stamp.stampLabel || 'ADCS'}</span>
                      <span className="text-[6px] font-mono text-slate-500">APPROVED</span>
                      <span className="text-[6px] text-rose-600">{billingForm.stamp.stampSubtext || 'DUBAI UAE'}</span>
                    </div>
                  )}

                  {/* Signatory */}
                  {billingForm.signatory?.showSignature && (
                    <div className="text-center">
                      <div className="h-9 flex items-center justify-center">
                        {billingForm.signatory.signatureImageUrl ? (
                          <img
                            src={billingForm.signatory.signatureImageUrl}
                            alt="Signature"
                            className="max-h-8 object-contain"
                          />
                        ) : (
                          <span className="font-serif italic text-blue-900 text-sm font-semibold">
                            {billingForm.signatory.name}
                          </span>
                        )}
                      </div>
                      <div className="w-40 border-b border-slate-300 pb-0.5"></div>
                      <p className="text-[10px] font-bold text-slate-800 mt-1">{billingForm.signatory.name}</p>
                      <p className="text-[8px] text-slate-500">{billingForm.signatory.designation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isAdminOrMaster && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetBilling}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Billing Defaults</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Invoice & Billing Settings</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab: Lead Categories, Channels & Pipeline Stages */}
      {activeTab === 'lead_config' && (
        <div className="space-y-6">
          {/* Information Notice */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs flex items-start gap-3">
            <Tag className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Lead Categories, Acquisition Channels & Pipeline Stages</strong>
              <span>
                Create, edit, and delete lead types/categories (including Job Applications, Corporate, Golden Visa, and VIP categories), marketing channels/sources, and pipeline stages. All changes persist automatically.
              </span>
            </div>
          </div>

          {/* Section 1: Lead Categories Management */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>Lead Categories & Inquiries Types ({leadCategories?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define types of leads such as Job Applicants, Golden Visa, Corporate PRO, and VIP Inquiries. Category is optional on lead entry.
                </p>
              </div>

              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Categories List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {leadCategories?.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: cat.color || '#3B82F6' }}
                      >
                        {cat.isJobCategory || cat.type === 'job_application'
                          ? '💼 Job Application'
                          : (cat.badgeText || cat.name || cat.code || 'Category')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete lead category "${cat.name}"?`)) {
                              deleteLeadCategory(cat.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{cat.description || 'No description added'}</p>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                    <span>Status: {cat.isActive !== false ? 'Active' : 'Archived'}</span>
                    <span className="font-mono">ID: {cat.id.slice(0, 12)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Lead Sources & Channels Management */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Lead Acquisition Channels & Sources ({leadSources?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage marketing channels where prospect inquiries originate (e.g. Website, Referral, LinkedIn, Walk-in).
                </p>
              </div>

              <button
                onClick={() => setShowAddSourceModal(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Channel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {leadSources?.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{src.name}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{src.description || 'Acquisition channel'}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingSource(src)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Edit Source"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete lead source channel "${src.name}"?`)) {
                          deleteLeadSource(src.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Delete Source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Lead Pipeline Stages Management */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                  <span>Lead Pipeline Stages ({leadStages?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure stages for the prospect pipeline Kanban workflow.
                </p>
              </div>

              <button
                onClick={() => setShowAddStageModal(true)}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pipeline Stage</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {leadStages?.map((stg, idx) => (
                <div
                  key={stg.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-bold flex items-center justify-center">
                      {stg.order || idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stg.color || '#3B82F6' }}></span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{stg.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stg.description || 'Pipeline Stage'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingStageItem(stg)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Edit Stage"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete pipeline stage "${stg.name}"?`)) {
                          deleteLeadStage(stg.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Delete Stage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal: Add Category */}
          {showAddCategoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>Create Lead Category</span>
                  </h3>
                  <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCategory} className="space-y-3.5 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatData.name ?? ''}
                      onChange={(e) => setNewCatData({ ...newCatData, name: e.target.value })}
                      placeholder="e.g. Job Application / Candidate"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Category Archetype *
                      </label>
                      <select
                        value={newCatData.type ?? ''}
                        onChange={(e) => setNewCatData({ ...newCatData, type: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="job_application">💼 Job Application</option>
                        <option value="corporate">Corporate PRO</option>
                        <option value="golden_visa">Golden Visa Specialist</option>
                        <option value="vip">VIP / High Net Worth</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Badge Accent Color
                      </label>
                      <input
                        type="color"
                        value={newCatData.color ?? ''}
                        onChange={(e) => setNewCatData({ ...newCatData, color: e.target.value })}
                        className="w-full h-9 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCatData.description ?? ''}
                      onChange={(e) => setNewCatData({ ...newCatData, description: e.target.value })}
                      placeholder="e.g. Inquiries from job seekers applying for positions"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Category */}
          {editingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                    <span>Edit Category ({editingCategory.name})</span>
                  </h3>
                  <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateCategorySubmit} className="space-y-3.5 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name ?? ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Category Archetype
                      </label>
                      <select
                        value={editingCategory.type ?? ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, type: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="job_application">💼 Job Application</option>
                        <option value="corporate">Corporate PRO</option>
                        <option value="golden_visa">Golden Visa Specialist</option>
                        <option value="vip">VIP / High Net Worth</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Badge Color
                      </label>
                      <input
                        type="color"
                        value={editingCategory.color || '#3B82F6'}
                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                        className="w-full h-9 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editingCategory.description || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Add Source */}
          {showAddSourceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Create Lead Source / Channel</span>
                  </h3>
                  <button onClick={() => setShowAddSourceModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSource} className="space-y-3.5 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Channel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newSrcData.name ?? ''}
                      onChange={(e) => setNewSrcData({ ...newSrcData, name: e.target.value })}
                      placeholder="e.g. WhatsApp Inbound, Job Portal, Exhibition"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Channel Description
                    </label>
                    <input
                      type="text"
                      value={newSrcData.description ?? ''}
                      onChange={(e) => setNewSrcData({ ...newSrcData, description: e.target.value })}
                      placeholder="e.g. Inquiries generated from website chat widget"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddSourceModal(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                    >
                      Create Channel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Source */}
          {editingSource && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-600" />
                    <span>Edit Source Channel ({editingSource.name})</span>
                  </h3>
                  <button onClick={() => setEditingSource(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateSourceSubmit} className="space-y-3.5 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Channel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSource.name ?? ''}
                      onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editingSource.description || ''}
                      onChange={(e) => setEditingSource({ ...editingSource, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingSource(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Add Pipeline Stage */}
          {showAddStageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                    <span>Create Lead Pipeline Stage</span>
                  </h3>
                  <button onClick={() => setShowAddStageModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateStage} className="space-y-3.5 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Stage Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStageData.name ?? ''}
                      onChange={(e) => setNewStageData({ ...newStageData, name: e.target.value })}
                      placeholder="e.g. Document Verification, Screening"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Order Sequence
                      </label>
                      <input
                        type="number"
                        value={newStageData.order ?? ''}
                        onChange={(e) => setNewStageData({ ...newStageData, order: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Color Theme
                      </label>
                      <input
                        type="color"
                        value={newStageData.color ?? ''}
                        onChange={(e) => setNewStageData({ ...newStageData, color: e.target.value })}
                        className="w-full h-9 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddStageModal(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20"
                    >
                      Create Stage
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Pipeline Stage */}
          {editingStageItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-purple-600" />
                    <span>Edit Pipeline Stage ({editingStageItem.name})</span>
                  </h3>
                  <button onClick={() => setEditingStageItem(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateStageSubmit} className="space-y-3.5 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Stage Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStageItem.name ?? ''}
                      onChange={(e) => setEditingStageItem({ ...editingStageItem, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Order Sequence
                      </label>
                      <input
                        type="number"
                        value={editingStageItem.order ?? ''}
                        onChange={(e) => setEditingStageItem({ ...editingStageItem, order: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Color Theme
                      </label>
                      <input
                        type="color"
                        value={editingStageItem.color || '#3B82F6'}
                        onChange={(e) => setEditingStageItem({ ...editingStageItem, color: e.target.value })}
                        className="w-full h-9 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingStageItem(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 1: CRM Name & Photo Branding (Master Only) */}
      {activeTab === 'branding' && (
        <div className="space-y-5">
          {/* Master Permission Notice Banner */}
          {!isMaster ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-200">Restricted Setting: Master User Only</p>
                <p className="text-amber-300/80 mt-0.5">
                  CRM Name, Photo Logo, and System Branding parameters are strictly reserved and can only be altered by the Master Administrator (<strong className="text-amber-100">{availableUsers?.find((u) => u.role === 'master')?.name || 'Master Administrator'}</strong>). You are currently signed in as <strong className="capitalize">{currentUser.name} ({currentUser.role})</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-purple-300 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>You have full Master authority to customize CRM branding, logo, names, and contact details across all branches.</span>
              </div>
              <button
                type="button"
                onClick={handleResetBranding}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Restore Defaults</span>
              </button>
            </div>
          )}

          {brandingNotice && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs ${
                brandingNotice.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {brandingNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{brandingNotice.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveBranding} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">CRM Identity & Visual Logo</h3>
              <p className="text-xs text-slate-500">
                These settings update the global CRM top bar, sidebar brand, invoices header, and login screen
              </p>
            </div>

            {/* Logo Photo Upload & Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative group shrink-0">
                {brandForm.logoUrl ? (
                  <div className="w-24 h-20 p-2 bg-white rounded-2xl ring-2 ring-blue-500/40 shadow-md flex items-center justify-center overflow-hidden">
                    <img
                      src={brandForm.logoUrl}
                      alt="CRM Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-md">
                    {brandForm.shortName ? brandForm.shortName[0] : 'A'}
                  </div>
                )}
                {isMaster && (
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span>Upload</span>
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">CRM Photo / Emblem Logo</h4>
                  <span className="text-[10px] text-slate-500">PNG, JPG, WebP, SVG</span>
                </div>
                <p className="text-xs text-slate-500">
                  Upload an official logo image from your device, or enter a direct web image URL below.
                </p>

                {isMaster && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={logoFileRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoFileRef.current?.click()}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </button>
                    {brandForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setBrandForm((prev) => ({ ...prev, logoUrl: '' }))}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Direct Logo URL input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Logo Direct Image URL (or pasted Base64 Data URL)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  disabled={!isMaster}
                  value={brandForm.logoUrl ?? ''}
                  onChange={(e) => setBrandForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/... or data:image/png;base64,..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Name and Tagline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  CRM Official System Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!isMaster}
                  value={brandForm.name ?? ''}
                  onChange={(e) => setBrandForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. ADCS Master PRO"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Short Acronym / Badge Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!isMaster}
                  value={brandForm.shortName ?? ''}
                  onChange={(e) => setBrandForm((prev) => ({ ...prev, shortName: e.target.value }))}
                  placeholder="e.g. ADCS"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Brand Tagline & Sub-header
              </label>
              <input
                type="text"
                disabled={!isMaster}
                value={brandForm.tagline ?? ''}
                onChange={(e) => setBrandForm((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="e.g. UAE Corporate Services & Government Clearance CRM"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Support and Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Support Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    disabled={!isMaster}
                    value={brandForm.supportEmail ?? ''}
                    onChange={(e) => setBrandForm((prev) => ({ ...prev, supportEmail: e.target.value }))}
                    placeholder="support@adcs.ae"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Direct Support Phone (UAE)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    disabled={!isMaster}
                    value={brandForm.supportPhone ?? ''}
                    onChange={(e) => setBrandForm((prev) => ({ ...prev, supportPhone: e.target.value }))}
                    placeholder="+971 4 398 2200"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Portal Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    disabled={!isMaster}
                    value={brandForm.website ?? ''}
                    onChange={(e) => setBrandForm((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://adcs.ae"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Footer Notice (Shown in Invoices & PDF exports)
              </label>
              <input
                type="text"
                disabled={!isMaster}
                value={brandForm.footerText ?? ''}
                onChange={(e) => setBrandForm((prev) => ({ ...prev, footerText: e.target.value }))}
                placeholder="ADCS Master PRO • Licensed by UAE Department of Economy and Tourism (DET)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            {/* Master Submit Button */}
            {isMaster && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Master Branding Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 2: Reset Visa Email Template & Customizer */}
      {activeTab === 'visa_email' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-500" />
                  <span>UAE Residency & Visa Status Email Template</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated official notifications dispatched to investors and applicants upon milestone advancement
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetVisaEmail}
                  className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-100"
                  title="Restore default UAE ICP/GDRFA template format"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Reset Visa Email (Default ICP/GDRFA)</span>
                </button>
              </div>
            </div>

            {emailNotice && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs ${
                  emailNotice.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {emailNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{emailNotice.text}</span>
              </div>
            )}

            {/* Template Variables Legend */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
              <div className="flex items-center gap-2 mb-1.5">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Dynamic Placeholders (Auto-Replaced at Dispatch)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{CLIENT_NAME}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{REF_NO}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{SERVICE_NAME}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{CURRENT_STAGE}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{PASSPORT_NO}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{EMIRATES_ID}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{COMPANY_NAME}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{STAGE_REMARKS}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{ASSIGNED_PRO_NAME}'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {'{CRM_NAME}'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveVisaEmail} className="space-y-4">
              {/* Subject Line */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Subject Line Template
                </label>
                <input
                  type="text"
                  required
                  value={emailForm.subject ?? ''}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Sender info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Sender Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={emailForm.senderName ?? ''}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, senderName: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Sender Dispatch Email
                  </label>
                  <input
                    type="email"
                    required
                    value={emailForm.senderEmail ?? ''}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, senderEmail: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Header Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Header Banner Text
                </label>
                <input
                  type="text"
                  value={emailForm.headerText ?? ''}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, headerText: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                />
              </div>

              {/* Body Template */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Message Body Template
                </label>
                <textarea
                  rows={9}
                  required
                  value={emailForm.bodyTemplate ?? ''}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, bodyTemplate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Footer Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Footer / Regulatory Notice
                </label>
                <input
                  type="text"
                  value={emailForm.footerText ?? ''}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, footerText: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  Last updated by: {emailForm.updatedBy || 'Master User'}
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Email Template</span>
                </button>
              </div>
            </form>

            {/* Test Email Dispatch Sandbox */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-blue-500" />
                  <span>Test Visa Status Email Dispatch</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select an active applicant from the CRM database to simulate an automated visa update email dispatch.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={testClientId}
                  onChange={(e) => setTestClientId(e.target.value)}
                  className="flex-1 w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id ?? ''}>
                      {c.fullName} ({c.refNo}) — {c.services?.[0]?.serviceName || c.services?.[0]?.category || 'Residency'} ({c.email})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSendTestVisaEmail}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Simulate Sandbox</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!isGmailConnected) {
                        const ok = await connectGmail();
                        if (!ok) return;
                      }
                      const res = await sendVisaStatusViaGmail(testClientId);
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
                        setEmailNotice({ type: 'error', text: res.error || 'Failed to prepare Gmail message.' });
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via Gmail</span>
                  </button>
                </div>
              </div>

              {testSentSuccess && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Dispatched Email Preview
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{testSentSuccess.sentAt}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono">
                    <p><span className="text-slate-500">To:</span> {testSentSuccess.to} ({testSentSuccess.clientName})</p>
                    <p><span className="text-slate-500">Subject:</span> {testSentSuccess.subject}</p>
                    <p><span className="text-slate-500">From:</span> {testSentSuccess.senderName} &lt;{testSentSuccess.senderEmail}&gt;</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {testSentSuccess.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Email & SMTP Outbound Server Configuration */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          {/* Header & Quick Intro */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Email & SMTP Outbound Server Configuration</span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                      LIVE DISPATCH
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your real Google Workspace / Gmail, Microsoft 365, or Corporate Webmail credentials to guarantee direct inbox delivery to clients.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Outbound SMTP Status:</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                    smtpForm.enabled && smtpForm.user && smtpForm.pass
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      smtpForm.enabled && smtpForm.user && smtpForm.pass ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {smtpForm.enabled && smtpForm.user && smtpForm.pass ? 'Configured & Active' : 'Setup Required'}
                </span>
              </div>
            </div>

            {/* Explanatory Callout Banner */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    Why configure custom SMTP?
                  </p>
                  <p className="text-blue-800/90 dark:text-blue-300 leading-relaxed text-[11.5px]">
                    When sending quotation, invoice, or visa update emails from the CRM, outbound messages are routed through this authenticated mail server. Using your dedicated Google Workspace, Gmail (with 16-character App Password), or Corporate SMTP server ensures emails arrive directly in your clients' inboxes with 100% deliverability.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification alert banner */}
            {smtpNotice && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in ${
                  smtpNotice.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {smtpNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>{smtpNotice.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmtpNotice(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Provider Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1-Click Provider Quick-Fill:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleApplySmtpPreset('gmail')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    smtpForm.host === 'smtp.gmail.com'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-red-500" />
                      Gmail / Workspace
                    </span>
                    {smtpForm.host === 'smtp.gmail.com' && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Selected</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">smtp.gmail.com : 465 (SSL)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplySmtpPreset('outlook')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    smtpForm.host === 'smtp.office365.com'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      Microsoft 365 / Outlook
                    </span>
                    {smtpForm.host === 'smtp.office365.com' && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Selected</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">smtp.office365.com : 587 (TLS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplySmtpPreset('custom')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    smtpForm.host === 'mail.adcs.ae'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-purple-500" />
                      Corporate / cPanel
                    </span>
                    {smtpForm.host === 'mail.adcs.ae' && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Selected</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">mail.adcs.ae : 465 (SSL)</span>
                </button>
              </div>
            </div>

            {/* SMTP Main Settings Form */}
            <form onSubmit={handleSaveSmtpSettings} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SMTP Server Host */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Server className="w-3 h-3 text-slate-400" />
                    SMTP Host / Server
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. smtp.gmail.com or mail.yourdomain.com"
                    value={smtpForm.host ?? ''}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, host: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>

                {/* SMTP Port & Secure Check */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Port
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="465 or 587"
                      value={smtpForm.port ?? ''}
                      onChange={(e) => setSmtpForm((prev) => ({ ...prev, port: parseInt(e.target.value) || 465 }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      SSL / TLS Security
                    </label>
                    <select
                      value={smtpForm.secure ? 'true' : 'false'}
                      onChange={(e) => setSmtpForm((prev) => ({ ...prev, secure: e.target.value === 'true' }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="true">SSL / TLS (Port 465)</option>
                      <option value="false">STARTTLS / Plain (Port 587)</option>
                    </select>
                  </div>
                </div>

                {/* User / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    Authentication Email / Username
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. operations@adcs.ae or yourname@gmail.com"
                    value={smtpForm.user ?? ''}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, user: e.target.value, fromEmail: prev.fromEmail || e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                  <p className="text-[10.5px] text-slate-500">
                    The email address used to log in to the SMTP server.
                  </p>
                </div>

                {/* Password / App Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Key className="w-3 h-3 text-slate-400" />
                      Password / Google App Password
                    </label>
                    {smtpForm.host.includes('gmail') && (
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10.5px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Create App Password</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showSmtpPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter mailbox password or 16-character App Password"
                      value={smtpForm.pass ?? ''}
                      onChange={(e) => setSmtpForm((prev) => ({ ...prev, pass: e.target.value }))}
                      className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    For Gmail/Google Workspace accounts with 2-Step Verification, generate a 16-character <strong>App Password</strong> in Google Account Security.
                  </p>
                </div>

                {/* From Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sender Display Name (Shows only ADCS)
                  </label>
                  <input
                    type="text"
                    placeholder="ADCS"
                    value={smtpForm.fromName || 'ADCS'}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, fromName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                  />
                  <p className="text-[10.5px] text-slate-500">
                    The name that appears in the client's inbox. Default is <strong>ADCS</strong>.
                  </p>
                </div>

                {/* From Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    From / Reply-To Address
                  </label>
                  <input
                    type="email"
                    placeholder="info@theadcs.com"
                    value={smtpForm.fromEmail || ''}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, fromEmail: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                  <p className="text-[10.5px] text-slate-500">
                    Dispatched from and replies directed to <strong>info@theadcs.com</strong>.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleTestSmtpConnection}
                  disabled={isTestingSmtp}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isTestingSmtp ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  ) : (
                    <Server className="w-3.5 h-3.5 text-blue-500" />
                  )}
                  <span>{isTestingSmtp ? 'Verifying Handshake...' : 'Test Connection Handshake'}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save SMTP Server Settings</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Test Connection Results Box */}
            {smtpTestResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                  smtpTestResult.success
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {smtpTestResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>
                    {smtpTestResult.success ? 'SMTP Connection Successful!' : 'SMTP Connection Failed'}
                  </span>
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  {smtpTestResult.message || smtpTestResult.error}
                </p>
                {smtpTestResult.details && (
                  <div className="p-2.5 rounded-lg bg-black/10 dark:bg-black/30 text-[11px] font-mono whitespace-pre-wrap">
                    {smtpTestResult.details}
                  </div>
                )}
                {!smtpTestResult.success && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Recommended Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                      <li>For Gmail / Workspace: Ensure 2-Step Verification is active, and generate a 16-letter <strong>App Password</strong> instead of your regular password.</li>
                      <li>Check that port 465 (SSL) or 587 (TLS) matches the security option.</li>
                      <li>Ensure firewall or mail provider allows standard SMTP AUTH connections.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Dispatch Test Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Send Live Test Email to Client / Inbox
                </h4>
                <p className="text-xs text-slate-500">
                  Send a real live verification message right now to confirm delivery in your or your client's email inbox.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter recipient email (e.g. client@example.com or your inbox)"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSendLiveTestEmail}
                disabled={isSendingTestEmail}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shrink-0"
              >
                {isSendingTestEmail ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isSendingTestEmail ? 'Sending Live Email...' : 'Send Live Test Email'}</span>
              </button>
            </div>

            {testEmailResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1 animate-in fade-in ${
                  testEmailResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testEmailResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{testEmailResult.success ? 'Delivery Confirmed!' : 'Delivery Failed'}</span>
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  {testEmailResult.message || testEmailResult.error}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Stages Customizer */}
      {activeTab === 'stages' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workflow Stages Hierarchy</h3>
            <p className="text-xs text-slate-500">
              The 16 predefined milestones powering the CRM pipeline and client progress tracking
            </p>
          </div>

          <div className="space-y-3">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.stepNumber}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={stage.name ?? ''}
                      onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                      className="font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-500">{stage.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold capitalize">
                    {stage.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Duplicate Rules */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated Duplicate Client Prevention Engine
            </h3>
            <p className="text-xs text-slate-500">
              Configure which identity fields trigger strict duplicate warnings to maintain CRM data hygiene
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Passport Number Matching
                </span>
                <span className="text-[11px] text-slate-500">
                  Block creation if passport number already exists in database
                </span>
              </div>
              <input
                type="checkbox"
                checked={duplicatePassport}
                onChange={(e) => setDuplicatePassport(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Emirates ID (EID) Matching
                </span>
                <span className="text-[11px] text-slate-500">
                  Check against 784-XXXX-XXXXXXX-X format for existing records
                </span>
              </div>
              <input
                type="checkbox"
                checked={duplicateEID}
                onChange={(e) => setDuplicateEID(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Mobile Phone Number Matching
                </span>
                <span className="text-[11px] text-slate-500">
                  Prevent duplicate registrations using identical contact number
                </span>
              </div>
              <input
                type="checkbox"
                checked={duplicateMobile}
                onChange={(e) => setDuplicateMobile(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Email Address Matching
                </span>
                <span className="text-[11px] text-slate-500">
                  Verify unique email address for client portal access
                </span>
              </div>
              <input
                type="checkbox"
                checked={duplicateEmail}
                onChange={(e) => setDuplicateEmail(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 5: Alerts & Factory Reset */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-6">
          {/* Server Disk Persistence Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Cloud Firestore & Multi-Device Live Sync</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      serverSyncStatus === 'synced'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : serverSyncStatus === 'saving'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {serverSyncStatus === 'synced' ? '● Synced & Live Across All Systems' : serverSyncStatus === 'saving' ? '● Syncing...' : serverSyncStatus}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your database (companies, clients, invoices, leads, categories, billing configs) is safely mirrored to Google Cloud Firestore and persistent server storage. Logging in from any other computer, device, or fresh browser tab will seamlessly retain all your data.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await saveDataToServer();
                    if (ok) {
                      alert('CRM database snapshot successfully synced to Google Cloud Firestore and server storage.');
                    } else {
                      alert('Failed to sync to cloud storage.');
                    }
                  }}
                  disabled={isSavingToServer}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSavingToServer ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const res = await createDatabaseBackup();
                    if (res.success) {
                      alert(`Point-in-time database snapshot backup created: ${res.filename}`);
                    } else {
                      alert(`Backup error: ${res.error}`);
                    }
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Create Backup</span>
                </button>
              </div>
            </div>

            {lastServerSyncTime && (
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono pt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Last auto-sync timestamp: {lastServerSyncTime}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Expiry Radar Threshold</h3>
            <p className="text-xs text-slate-500">Configure warning intervals for upcoming government visa expirations</p>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Alert Trigger Window (Days prior to expiry)
            </label>
            <select
              value={expiryDaysThreshold}
              onChange={(e) => setExpiryDaysThreshold(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value={30}>30 Days (Urgent)</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days (Quarterly)</option>
              <option value={180}>180 Days (6 Months Standard)</option>
            </select>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-rose-600 mb-1">CRM Reset & Clean Slate Zone</h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Wipe all client records, transactions, invoices, and leads to start clean at 0, or restore factory demo seeds.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleClearAllToZero}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe All Data (Set to 0)</span>
              </button>
              <button
                type="button"
                onClick={handleGlobalResetData}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Demo Seed Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Cloud & Database Persistence */}
      {activeTab === 'cloud_sync' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs shrink-0">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span>Google Cloud Firestore Persistence</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-white rounded-full font-bold uppercase tracking-wider">
                    DURABLE CLOUD
                  </span>
                </h3>
                <p className="text-xs text-blue-100 mt-1 max-w-xl">
                  Your clients, leads, staff profiles, custom categories, invoices, and documents are stored in Google Cloud Firestore. Your data is permanent and will not be wiped when republishing or refreshing.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await saveDataToServer();
                alert('Database snapshot successfully pushed to Google Cloud Firestore and server disk!');
              }}
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>Sync Cloud Now</span>
            </button>
          </div>

          {/* Clarity & Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>How Code Updates vs Cloud Data Work</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>1. Instant Live Updates</span>
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  In this development workspace, code updates and new features appear instantly on page refresh.
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>2. Cloud Persistence</span>
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  All user modifications are continuously saved to Google Cloud Firestore, separate from container builds.
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>3. Safe Republishing</span>
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  When you publish or share the app, the deployed build connects to the same cloud database, keeping all data intact.
                </p>
              </div>
            </div>
          </div>

          {/* Sync Status & Action Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Database Management & Actions</h4>
                <p className="text-[11px] text-slate-500">
                  {lastServerSyncTime ? `Last synced: ${lastServerSyncTime}` : 'Continuous synchronization active'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await loadDataFromServer();
                    if (ok) {
                      alert('Latest database snapshot loaded from cloud/server/bundled store!');
                    } else {
                      alert('Database already matches the latest available remote snapshot.');
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Pull Latest Data</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await createDatabaseBackup();
                    if (res.success) {
                      alert(`Backup download started: ${res.filename}`);
                    } else {
                      alert(`Backup notice: ${res.error}`);
                    }
                  }}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (!content) return;
                      const ok = importCRMData(content);
                      if (ok) {
                        alert('Database backup successfully restored and synchronized!');
                      } else {
                        alert('Failed to parse backup JSON file. Please ensure it is a valid CRM database file.');
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore / Import (.json)</span>
                </button>
              </div>
            </div>

            {/* Quick Cross-System Sync (Copy / Paste) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cross-System Direct Sync (Between Different PCs / Browsers)</span>
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Transfer all clients, leads, invoices, and settings from one computer to another in one click without needing server setup.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const json = exportCRMData();
                      navigator.clipboard.writeText(json);
                      setSyncNotice({ type: 'success', text: 'Complete CRM data payload copied to clipboard! Paste it into the other system.' });
                      setTimeout(() => setSyncNotice(null), 5000);
                    } catch {
                      setSyncNotice({ type: 'error', text: 'Clipboard access denied. Please use Download Backup (.json) instead.' });
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Sync Code</span>
                </button>
              </div>

              {syncNotice && (
                <div className={`p-2.5 rounded-xl text-xs font-medium ${syncNotice.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
                  {syncNotice.text}
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Paste sync code or database JSON here to apply updates from another system..."
                  value={syncCodeInput}
                  onChange={(e) => setSyncCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
                />
                <button
                  type="button"
                  disabled={!syncCodeInput.trim()}
                  onClick={() => {
                    if (!syncCodeInput.trim()) return;
                    const ok = importCRMData(syncCodeInput.trim());
                    if (ok) {
                      setSyncCodeInput('');
                      setSyncNotice({ type: 'success', text: 'Sync payload applied successfully! All records updated.' });
                      setTimeout(() => setSyncNotice(null), 5000);
                    } else {
                      setSyncNotice({ type: 'error', text: 'Invalid sync payload. Please verify you copied the full JSON code.' });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
