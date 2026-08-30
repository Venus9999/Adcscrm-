import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Upload,
  Send,
  Download,
  Calendar,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Globe,
  Plus,
  Eye,
  Plane,
  Wand2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ClientService, DocumentItem, VisaApplication } from '../../types/crm';
import { VisaApplicationModal } from '../visa/VisaApplicationModal';
import { VisaTimelineModal } from '../visa/VisaTimelineModal';
import { ApplyServicesView } from './ApplyServicesView';
import { AIVisaCountryAdvisor } from '../visa/AIVisaCountryAdvisor';
import { AIImageStudio } from '../ai/AIImageStudio';

export const ClientPortal: React.FC = () => {
  const {
    currentUser,
    clients,
    documents,
    invoices,
    stages,
    uploadDocument,
    messages,
    sendMessage,
    createInvoice,
    recordPayment,
    visaApplications,
    selectedClientId,
  } = useCRM();

  // Pick client profile corresponding to current logged-in user or selected client
  const client =
    clients.find((c) => c.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
    (selectedClientId ? clients.find((c) => c.id === selectedClientId) : null) ||
    clients.find((c) => c.id === currentUser.id) ||
    clients.find((c) => c.id === 'client-1') ||
    clients[0];

  const [activeTab, setActiveTab] = useState<
    'tracker' | 'apply_services' | 'visa_services' | 'ai_advisor' | 'photo_studio' | 'documents' | 'payments' | 'messages'
  >('tracker');
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentItem['category']>('Passport');
  const [uploadFileName, setUploadFileName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Visa Modals state
  const [showVisaApplyModal, setShowVisaApplyModal] = useState(false);
  const [selectedVisaTimelineApp, setSelectedVisaTimelineApp] = useState<VisaApplication | null>(null);

  if (!client) {
    return <div className="p-8 text-center text-slate-500">No client profile found.</div>;
  }

  const activeService: ClientService | undefined = (client.services || [])[selectedServiceIndex] || (client.services || [])[0];
  const clientDocs = (documents || []).filter((d) => d && d.clientId === client.id);
  const clientInvoices = (invoices || []).filter((i) => i && i.clientId === client.id);
  const clientMessages = (messages || []).filter((m) => m && m.conversationId === client.id);
  const clientVisaApps = (visaApplications || []).filter(
    (v) => v && (v.clientId === client.id || (v.clientEmail && client.email && v.clientEmail.toLowerCase() === client.email.toLowerCase()))
  );

  // Calculate workflow stage index
  const currentStageIndex = stages.findIndex((s) => s.id === client.currentStageId);
  const normalizedProgress = Math.min(100, Math.max(10, Math.round(((currentStageIndex + 1) / stages.length) * 100)));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendMessage(client.id, chatMessage.trim());
    setChatMessage('');
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    uploadDocument({
      clientId: client.id,
      clientName: client.fullName,
      serviceId: activeService?.serviceId,
      serviceName: activeService?.serviceName,
      name: uploadFileName.endsWith('.pdf') ? uploadFileName : `${uploadFileName}.pdf`,
      category: uploadCategory,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'application/pdf',
      fileSize: '1.8 MB',
      status: 'under_review',
      remarks: 'Uploaded by client via Client Portal',
    });

    setUploadFileName('');
    setShowUploadModal(false);
  };

  const handleSimulatePayment = (invId: string, amount: number) => {
    recordPayment(invId, amount, 'Credit Card', `STRIPE-${Date.now()}`, 'Paid via Client Portal Online Gateway');
    alert(`Payment of AED ${amount.toLocaleString()} processed successfully!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome Hero */}
      <div className="bg-slate-900 rounded-lg p-6 sm:p-7 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={client.avatar}
              alt={client.fullName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover ring-2 ring-blue-500/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600/30 text-blue-400 border border-blue-500/30">
                  Client Self-Service Portal
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {client.refNo}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">{client.fullName}</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Nationality: <span className="font-semibold text-white">{client.nationality}</span> • Passport:{' '}
                <span className="font-mono text-white">{client.passportNo}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-3 rounded-md border border-slate-700">
            <button
              onClick={() => setActiveTab('apply_services')}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-md text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply for Services</span>
            </button>
            <button
              onClick={() => setShowVisaApplyModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-md text-xs transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Apply for Visa (190+ Countries)</span>
            </button>
            <div className="text-right pl-2 border-l border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outstanding Balance</div>
              <div className="text-xl font-bold text-emerald-400">
                AED {client.outstandingAmount.toLocaleString()}
              </div>
            </div>
            {client.outstandingAmount > 0 && (
              <button
                onClick={() => setActiveTab('payments')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-md text-xs transition-colors cursor-pointer"
              >
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto text-xs font-bold uppercase tracking-tight">
          <button
            onClick={() => setActiveTab('apply_services')}
            className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'apply_services'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Services</span>
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Residency Tracker</span>
          </button>
          <button
            onClick={() => setActiveTab('visa_services')}
            className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'visa_services'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Worldwide Visas ({clientVisaApps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_advisor')}
            className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai_advisor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Visa Intelligence</span>
          </button>
          <button
            onClick={() => setActiveTab('photo_studio')}
            className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'photo_studio'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Photo Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents ({clientDocs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Invoices ({clientInvoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Agent Chat ({clientMessages.length})</span>
          </button>
        </div>
      </div>

      {/* Tab: Apply for Services */}
      {activeTab === 'apply_services' && (
        <ApplyServicesView client={client} onServiceApplied={() => setActiveTab('tracker')} />
      )}

      {/* Tab 1: Live Tracker */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          {/* Active Service Card & Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Active Processing Service
                </span>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  {activeService?.serviceName || 'Residency Visa Processing'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authority Reference:{' '}
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {activeService?.referenceNumber || 'ICP-AE-2026-0091'}
                  </span>{' '}
                  • Assigned Officer:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeService?.assignedEmployeeName || 'Farhan Akhtar (Senior PRO)'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {client.currentStageName}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="py-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                <span className="uppercase text-[10px] tracking-wider">Application Lifecycle Progress</span>
                <span className="text-blue-600 font-bold">{normalizedProgress}% Completed</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-md transition-all duration-500"
                  style={{ width: `${normalizedProgress}%` }}
                />
              </div>
            </div>

            {/* Interactive Timeline Milestones */}
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Milestone Progress Record</h3>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {activeService?.stageHistory && activeService.stageHistory.length > 0 ? (
                  activeService.stageHistory.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative group">
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center ${
                          idx === 0
                            ? 'border-blue-600 text-blue-600 ring-4 ring-blue-100 dark:ring-blue-950'
                            : 'border-emerald-500 text-emerald-500'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-emerald-500'}`}
                        />
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-md border border-slate-200/80 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {hist.toStage}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(hist.timestamp).toLocaleDateString()} at{' '}
                            {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">{hist.remarks}</p>
                        <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5">
                          <span>Updated by: {hist.updatedByUserName}</span>
                          {hist.nextFollowUpDate && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                Next Follow-up: {hist.nextFollowUpDate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">Stage history logged by operations team.</div>
                )}
              </div>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Document Compliance Checklist</h3>
                <p className="text-xs text-slate-500">Government mandatory requirements for this application</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('documents');
                  setShowUploadModal(true);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New File</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeService?.requiredDocs?.map((req, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    req.status === 'approved'
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : req.status === 'rejected'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {req.status === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : req.status === 'rejected' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{req.docName}</p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        Status: <span className="font-semibold">{req.status}</span>
                      </p>
                    </div>
                  </div>

                  {req.status !== 'approved' && (
                    <button
                      onClick={() => {
                        setUploadFileName(req.docName);
                        setShowUploadModal(true);
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50"
                    >
                      Upload
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Worldwide Visa Services */}
      {activeTab === 'visa_services' && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-7 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Worldwide Travel & Visa Applications
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Track your active visa applications for 190+ countries in real-time, view live milestone progress bars, and download issued entry permits.
              </p>
            </div>
            <button
              onClick={() => setShowVisaApplyModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-500/25 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for New Country Visa</span>
            </button>
          </div>

          {/* Visa Applications Grid */}
          {clientVisaApps.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
                <Plane className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Active Worldwide Visa Applications
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  You can apply for tourist, business, Schengen, UK, US, and worldwide visas directly from your portal.
                </p>
              </div>
              <button
                onClick={() => setShowVisaApplyModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Start New Visa Application
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientVisaApps.map((app) => {
                const latestMilestone = app.timeline[app.timeline.length - 1];
                return (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    {/* Country & Visa title */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{app.targetCountryFlag || '🌍'}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {app.targetCountry}
                            </h3>
                            <span className="text-xs font-mono text-slate-400 font-semibold">
                              #{app.applicationNumber}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {app.visaType} ({app.processingSpeed})
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {app.currentStageTitle || app.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                          Milestone Progress
                        </span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {app.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            app.status === 'issued' || app.status === 'approved'
                              ? 'bg-emerald-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.max(5, app.progressPercentage)}%` }}
                        />
                      </div>
                      {latestMilestone?.description && (
                        <p className="text-[11px] text-slate-500 pt-1 truncate">
                          {latestMilestone.description}
                        </p>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Travel Date:</span>
                        <span className="font-semibold">{app.travelDate || 'Flexible'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Paid Status:</span>
                        <span className="font-semibold capitalize text-emerald-600 dark:text-emerald-400">
                          {app.paymentStatus} (AED {app.totalAmount.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* View timeline button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Officer: <strong className="text-slate-600 dark:text-slate-300">{app.assignedOfficerName || 'Immigration PRO'}</strong>
                      </span>
                      <button
                        onClick={() => setSelectedVisaTimelineApp(app)}
                        className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Live Timeline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: AI Visa Country Intelligence & Search Grounding */}
      {activeTab === 'ai_advisor' && (
        <div className="space-y-6">
          <AIVisaCountryAdvisor initialNationality={client.nationality} />
        </div>
      )}

      {/* Tab: AI Photo & Document Studio */}
      {activeTab === 'photo_studio' && (
        <div className="space-y-6">
          <AIImageStudio />
        </div>
      )}

      {/* Tab 2: My Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Uploaded Digital Dossier</h2>
                <p className="text-xs text-slate-500">
                  Access your attested certificates, entry permits, and official submission scans
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                          doc.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : doc.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-3 truncate">{doc.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Category: {doc.category} • {doc.fileSize}
                    </p>

                    {doc.remarks && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
                        {doc.remarks}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payments & Invoices */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Financial Records & Invoices</h2>

            <div className="space-y-4">
              {clientInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{inv.serviceName}</p>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap gap-3">
                      <span>Total: AED {inv.grandTotal.toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">
                        Paid: AED {inv.amountPaid.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="text-rose-600 font-semibold">
                        Balance: AED {inv.balanceAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {inv.balanceAmount > 0 ? (
                      <button
                        onClick={() => handleSimulatePayment(inv.id, inv.balanceAmount)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                      >
                        Pay Balance (AED {inv.balanceAmount.toLocaleString()})
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Paid in Full</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Agent Chat */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                PRO
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeService?.assignedEmployeeName || 'Assigned PRO Consultant'}
                </h3>
                <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online for your service inquiry
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {clientMessages.map((msg) => {
              const isMe = msg.senderRole === 'client';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="font-semibold text-[10px] opacity-80 mb-1">{msg.senderName}</p>
                    <p>{msg.text}</p>
                    <span className="block text-[9px] opacity-70 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question about your visa stage, medical, or documents..."
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Upload Document File</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload clear PDF scans or JPG images to attach to your client dossier.
            </p>

            <form onSubmit={handleFileUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentItem['category'])}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                >
                  <option value="Passport">Passport Copy</option>
                  <option value="Emirates ID">Emirates ID</option>
                  <option value="Visa">Current Visa / Entry Permit</option>
                  <option value="Attested Degree">Attested Educational Degree</option>
                  <option value="Salary Slip">Bank Statement / Salary Certificate</option>
                  <option value="Tenancy/Ejari">Ejari / Tenancy Contract</option>
                  <option value="Photo">Passport Photo (White Background)</option>
                  <option value="Other">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Title / File Name
                </label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g. Attested_Marriage_Certificate_Scan.pdf"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Click to select file</p>
                <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 15MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-semibold text-white"
                >
                  Submit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worldwide Visa Application Modal */}
      {showVisaApplyModal && (
        <VisaApplicationModal
          isOpen={showVisaApplyModal}
          onClose={() => setShowVisaApplyModal(false)}
          preSelectedClientId={client.id}
        />
      )}

      {/* Visa Timeline & Dossier Modal */}
      {selectedVisaTimelineApp && (
        <VisaTimelineModal
          isOpen={Boolean(selectedVisaTimelineApp)}
          onClose={() => setSelectedVisaTimelineApp(null)}
          application={
            visaApplications.find((a) => a.id === selectedVisaTimelineApp.id) || selectedVisaTimelineApp
          }
        />
      )}
    </div>
  );
};
