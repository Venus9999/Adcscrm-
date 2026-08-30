import React, { useState } from 'react';
import {
  X,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Upload,
  User,
  Shield,
  MapPin,
  Sparkles,
  ArrowRight,
  Download,
  Mail,
  Edit3,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { VisaApplication, VisaApplicationStatus, VisaTimelineEvent } from '../../types/crm';
import { EditVisaApplicationModal } from './EditVisaApplicationModal';

interface VisaTimelineModalProps {
  application: VisaApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VisaTimelineModal: React.FC<VisaTimelineModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    updateVisaApplicationStatus,
    addVisaTimelineMilestone,
    uploadVisaDocument,
    sendVisaStatusEmail,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'manage'>('timeline');
  const [isEditDossierOpen, setIsEditDossierOpen] = useState(false);

  // Staff Update Status form state
  const [newStatus, setNewStatus] = useState<VisaApplicationStatus>(application?.status || 'documents_verification');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [actionRequired, setActionRequired] = useState('');
  const [milestoneLocation, setMilestoneLocation] = useState('');
  const [issuedVisaNumber, setIssuedVisaNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // New Custom Milestone state
  const [customMilestoneTitle, setCustomMilestoneTitle] = useState('');
  const [customMilestoneDesc, setCustomMilestoneDesc] = useState('');

  // New Document Upload state
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'Passport' | 'Photo' | 'Salary Slip' | 'NOC' | 'Emirates ID' | 'Other'>('Passport');

  // Email Notification modal
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  if (!isOpen || !application) return null;

  const isAdminOrStaff = currentUser.role === 'master' || currentUser.role === 'admin' || currentUser.role === 'employee';
  const isMasterOrAdmin = currentUser.role === 'master' || currentUser.role === 'admin';

  const statusColorMap: Record<VisaApplicationStatus, { bg: string; text: string; border: string }> = {
    submitted: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300' },
    documents_verification: { bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300' },
    payment_completed: { bg: 'bg-cyan-50 dark:bg-cyan-950/50', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-300' },
    biometrics_appointment: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300' },
    embassy_processing: { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300' },
    approved: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300' },
    issued: { bg: 'bg-emerald-100 dark:bg-emerald-900/60', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-500' },
    rejected: { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300' },
    on_hold: { bg: 'bg-amber-100 dark:bg-amber-900/60', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-400' },
  };

  const currentStatusStyle = statusColorMap[application.status] || statusColorMap.submitted;

  // Handle Status Update
  const handleUpdateStatus = () => {
    setIsUpdating(true);
    updateVisaApplicationStatus(
      application.id,
      newStatus,
      statusRemarks || undefined,
      actionRequired || undefined,
      milestoneLocation || undefined,
      currentUser.name,
      newStatus === 'issued' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : undefined,
      issuedVisaNumber || undefined
    );
    setIsUpdating(false);
    setStatusRemarks('');
    setActionRequired('');
    setActiveTab('timeline');
  };

  // Handle Add Custom Milestone
  const handleAddCustomMilestone = () => {
    if (!customMilestoneTitle) return;
    addVisaTimelineMilestone(application.id, {
      title: customMilestoneTitle,
      description: customMilestoneDesc || 'Custom milestone recorded by case officer.',
      stage: application.status,
      updatedBy: currentUser.name,
      status: 'completed',
    });
    setCustomMilestoneTitle('');
    setCustomMilestoneDesc('');
  };

  // Handle Upload Doc
  const handleUploadDoc = () => {
    if (!newDocName) return;
    uploadVisaDocument(application.id, {
      docName: newDocName,
      docCategory: newDocCategory,
      fileName: `${newDocName.replace(/\s+/g, '_')}_Uploaded.pdf`,
      fileSize: '1.9 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    });
    setNewDocName('');
  };

  // Handle Send Email Notification
  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    sendVisaStatusEmail(
      application.clientId || application.id,
      `${application.targetCountryFlag || ''} ${application.targetCountry} Visa (#${application.applicationNumber})`,
      application.timeline?.[application.timeline.length - 1]?.description
    );
    setIsSendingEmail(false);
    setEmailSentSuccess(true);
    setTimeout(() => setEmailSentSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="visa-timeline-modal"
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{application.targetCountryFlag || '🌍'}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  {application.targetCountry} - {application.visaType}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {application.applicationNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Applicant: <strong>{application.clientName}</strong> | Passport: <span className="font-mono">{application.clientPassportNo}</span> | Speed: <span className="text-blue-300">{application.processingSpeed}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isMasterOrAdmin && (
              <button
                onClick={() => setIsEditDossierOpen(true)}
                title="Edit Application Dossier Details (Master/Admin)"
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Dossier</span>
              </button>
            )}
            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              title="Send Real-time Email Notification to Client"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Sent Toast Banner */}
        {emailSentSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Real-time status notification email successfully dispatched to {application.clientEmail}!</span>
            </div>
            <button onClick={() => setEmailSentSuccess(false)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dynamic Progress Bar Banner */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
                {application.currentStageTitle || application.status.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">
                Turnaround: Est. {application.estimatedProcessingDays} Days
              </span>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
              {application.progressPercentage}% Completed
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                application.status === 'issued' || application.status === 'approved'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : application.status === 'rejected'
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${Math.max(5, application.progressPercentage)}%` }}
            />
          </div>

          {/* Key Milestone Checkpoints */}
          <div className="grid grid-cols-5 gap-1 text-[10px] text-center mt-2.5 font-medium text-slate-500">
            <div className={`truncate ${application.progressPercentage >= 15 ? 'text-blue-600 font-bold' : ''}`}>
              1. Submitted
            </div>
            <div className={`truncate ${application.progressPercentage >= 35 ? 'text-blue-600 font-bold' : ''}`}>
              2. Dossier Intake
            </div>
            <div className={`truncate ${application.progressPercentage >= 65 ? 'text-blue-600 font-bold' : ''}`}>
              3. Biometrics
            </div>
            <div className={`truncate ${application.progressPercentage >= 80 ? 'text-blue-600 font-bold' : ''}`}>
              4. Embassy Active
            </div>
            <div className={`truncate ${application.progressPercentage >= 95 ? 'text-emerald-600 font-bold' : ''}`}>
              5. Issued & Ready
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Milestone Timeline ({application.timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Consular Dossier & Documents ({application.uploadedDocuments?.length || 0})
          </button>
          {isAdminOrStaff && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1 ${
                activeTab === 'manage'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              <span>Officer Actions & Status Controls</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Real-time Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Issued Visa banner if completed */}
              {application.status === 'issued' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        Official Visa Granted & Issued!
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        Permit Reference: <strong className="font-mono">{application.issuedVisaNumber || 'VSA-EVISA-APPROVED'}</strong>
                      </p>
                    </div>
                  </div>
                  {application.issuedVisaUrl && (
                    <a
                      href={application.issuedVisaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/25 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download e-Visa</span>
                    </a>
                  )}
                </div>
              )}

              {/* Vertical Timeline List */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {application.timeline.map((event, idx) => {
                  const isLatest = idx === application.timeline.length - 1;
                  const isCompleted = event.status === 'completed';
                  return (
                    <div key={event.id || idx} className="relative group">
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-blue-600 border-blue-600 text-white animate-pulse'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Timeline Card */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        isLatest
                          ? 'bg-blue-50/50 dark:bg-slate-800/80 border-blue-300 dark:border-blue-700/60 shadow-sm'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {event.title}
                            </h4>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                              isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(event.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          {event.description}
                        </p>

                        {/* Action Required Pill if any */}
                        {event.actionRequired && (
                          <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start space-x-2 text-xs text-amber-900 dark:text-amber-200">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-semibold">Next Action Required:</strong> {event.actionRequired}
                            </div>
                          </div>
                        )}

                        {/* Location / Biometrics Appointment address */}
                        {event.location && (
                          <div className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            <span>Location / Embassy: {event.location}</span>
                          </div>
                        )}

                        {/* Officer Info & Ref Code */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            Updated by: <strong className="ml-1 text-slate-700 dark:text-slate-300">{event.updatedBy || 'System Desk'}</strong>
                          </span>
                          {event.referenceCode && (
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                              Ref: {event.referenceCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Milestone Box for Staff */}
              {isAdminOrStaff && (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    Add Real-time Milestone Log Entry
                  </h5>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Milestone Title (e.g., Biometrics Appointment Booked for 28-Aug)"
                      value={customMilestoneTitle}
                      onChange={(e) => setCustomMilestoneTitle(e.target.value)}
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Detailed remarks, appointment timing, or embassy tracking note..."
                      value={customMilestoneDesc}
                      onChange={(e) => setCustomMilestoneDesc(e.target.value)}
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={handleAddCustomMilestone}
                      disabled={!customMilestoneTitle}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Record Milestone Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Documents & Dossier */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Consular Application Dossier Files
                  </h4>
                  <p className="text-xs text-slate-500">
                    Documents uploaded for {application.targetCountry} embassy inspection
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {application.uploadedDocuments?.length || 0} Files Attached
                </span>
              </div>

              {/* Uploaded Documents List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(application.uploadedDocuments || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.docName}</p>
                        <p className="text-[10px] text-slate-400">
                          {doc.docCategory} | {doc.fileSize}
                        </p>
                      </div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Upload New Document Form */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center">
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  Attach Additional Consular Document
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Document Name (e.g. Flight Itinerary, Hotel Booking, Tax Certificate)"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value as any)}
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Passport">Passport</option>
                      <option value="Salary Slip">Bank Statement</option>
                      <option value="Emirates ID">ID / Resident Card</option>
                      <option value="NOC">NOC Letter</option>
                      <option value="Photo">Biometric Photo</option>
                      <option value="Other">Other Certificate</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleUploadDoc}
                  disabled={!newDocName}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  Upload & Attach to Dossier
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Officer Status Controls & Manage */}
          {activeTab === 'manage' && isAdminOrStaff && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                <p className="font-bold">Immigration Specialist Control Panel</p>
                <p className="mt-0.5 text-blue-700 dark:text-blue-300">
                  Advancing the visa stage automatically adds a formal milestone to the timeline and dispatches a push notification to the client.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Advance Application Stage:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as VisaApplicationStatus)}
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="documents_verification">1. Documents Verification & Intake (35%)</option>
                    <option value="payment_completed">2. Payment Cleared & Dossier Attested (50%)</option>
                    <option value="biometrics_appointment">3. Biometrics / VFS Appointment Scheduled (65%)</option>
                    <option value="embassy_processing">4. Active Consulate / Embassy Processing (80%)</option>
                    <option value="approved">5. Visa Officially Approved (95%)</option>
                    <option value="issued">6. Visa Issued & Stamped (100%)</option>
                    <option value="on_hold">On Hold / Additional Info Needed</option>
                    <option value="rejected">Refused / Returned by Embassy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Consular Remarks / Stage Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    placeholder="e.g. Biometrics captured at VFS Wafi Mall. File transmitted to the Embassy of France for final visa stamping."
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Action Required from Applicant (Optional):
                    </label>
                    <input
                      type="text"
                      value={actionRequired}
                      onChange={(e) => setActionRequired(e.target.value)}
                      placeholder="e.g. Bring original passport and 2 photos to VFS on Monday 10:00 AM"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Consulate / VFS Location:
                    </label>
                    <input
                      type="text"
                      value={milestoneLocation}
                      onChange={(e) => setMilestoneLocation(e.target.value)}
                      placeholder="e.g. VFS Global, Wafi Mall Level 3, Dubai"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {newStatus === 'issued' && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800">
                    <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                      Official Visa Number / Entry Permit Code:
                    </label>
                    <input
                      type="text"
                      value={issuedVisaNumber}
                      onChange={(e) => setIssuedVisaNumber(e.target.value)}
                      placeholder="e.g. FRA-2026-98129038"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating Status...' : 'Apply Stage Update & Dispatch Notification'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Assigned Officer: <strong className="text-slate-700 dark:text-slate-300">{application.assignedOfficerName || 'Immigration PRO'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
          >
            Close Tracker
          </button>
        </div>
      </div>

      {/* Edit Dossier Modal for Master & Admin */}
      {isEditDossierOpen && (
        <EditVisaApplicationModal
          isOpen={isEditDossierOpen}
          onClose={() => setIsEditDossierOpen(false)}
          application={application}
        />
      )}
    </div>
  );
};
