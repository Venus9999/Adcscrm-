export type UserRole = 'master' | 'admin' | 'employee' | 'client';

export interface UserPermissions {
  canCreateClients: boolean;
  canEditStages: boolean;
  canManagePayments: boolean;
  canEditInvoices?: boolean;
  canDeleteInvoices?: boolean;
  canViewAllCompanies: boolean;
  canAssignEmployees: boolean;
  canDeleteRecords: boolean;
  canExportReports: boolean;
  canManageLeads?: boolean;
  canManageTransactions?: boolean;
  canManageUsers?: boolean;
  canManageCompanies?: boolean;
  canCreateClient?: boolean;
  canDeleteClient?: boolean;
  canExportData?: boolean;
  canViewFinancials?: boolean;
  canManageWorkflows?: boolean;
  canManageRoles?: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  isSystem?: boolean;
  roleType: UserRole;
  permissions: UserPermissions;
  userCount?: number;
  createdAt: string;
}

export interface UserNotificationsConfig {
  emailAlerts?: boolean;
  whatsappAlerts?: boolean;
  expiryAlerts?: boolean;
  taskReminders?: boolean;
  emailOnNewClient?: boolean;
  emailOnPayment?: boolean;
  smsOnVisaExpiry?: boolean;
  urgentTaskAlerts?: boolean;
}

export interface VisaEmailTemplate {
  subject: string;
  headerText: string;
  bodyTemplate: string;
  footerText: string;
  senderName: string;
  senderEmail: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface InvoiceBillingSettings {
  companyName: string;
  tradingName: string;
  tagline: string;
  trn: string; // Tax Registration Number / VAT ID
  tradeLicenseNo: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  vatRateDefault: number;
  currency: string;
  bankDetails: BankDetails;
  signatoryName: string;
  signatoryTitle: string;
  signatorySignatureUrl: string;
  stampUrl: string;
  stampText?: string;
  showSignatory: boolean;
  showStamp: boolean;
  showQrCodeOnInvoice?: boolean;
  showStampOnInvoice?: boolean;
  showSignatureOnInvoice?: boolean;
  termsAndConditions: string;
  invoiceFooterNote: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface CRMBranding {
  name: string;
  shortName?: string;
  tagline: string;
  logoUrl: string;
  primaryColor?: string;
  visaEmailTemplate: VisaEmailTemplate;
  billingSettings?: InvoiceBillingSettings;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  customRoleId?: string;
  companyId?: string; // empty if master user
  companyIds?: string[];
  avatar: string;
  title: string;
  jobTitle?: string;
  department?: string;
  status: 'active' | 'suspended' | 'inactive';
  permissions: UserPermissions;
  bio?: string;
  securityPin?: string;
  theme?: 'light' | 'dark' | 'system';
  signature?: string;
  signatureUrl?: string;
  notificationsConfig?: UserNotificationsConfig;
  createdAt: string;
  lastLogin?: string;
}

export interface Vendor {
  id: string;
  name: string;
  code?: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  trn?: string;
  licenseNo?: string;
  tradeLicenseNo?: string;
  tradeLicenseExpiry?: string;
  companyId?: string; // which company/branch or undefined for global
  companyName?: string;
  status: 'active' | 'suspended' | 'inactive';
  bankName?: string;
  iban?: string;
  accountNumber?: string;
  commissionRate?: number;
  rating?: number;
  notes?: string;
  servicesProvided?: string[];
  bankDetails?: BankDetails;
  createdAt: string;
  updatedAt?: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
}

export interface Company {
  id: string;
  name: string;
  tradeLicenseNo: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  trn: string; // Tax Registration Number
  country?: string;
  city?: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  website?: string;
  logo: string;
  bankDetails: BankDetails;
  signatoryName?: string;
  signatoryTitle?: string;
  signatorySignatureUrl?: string;
  stampUrl?: string;
  showSignatory?: boolean;
  showStamp?: boolean;
  adminId: string;
  assignedAdminIds?: string[];
  employeeIds: string[];
  activeServicesCount: number;
  totalClientsCount: number;
  currency: string;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  category: 'Visa Processing' | 'Business Setup' | 'Document Clearing' | 'PRO Services' | 'Recruitment' | 'Attestation';
  defaultPrice: number;
  governmentFees: number;
  estimatedDays: number;
  description: string;
  requiredDocuments: string[];
  defaultStages: string[];
}

export type StageCategory = 'inquiry' | 'documentation' | 'processing' | 'authority' | 'approval' | 'completed' | 'cancelled';

export interface WorkStage {
  id: string;
  name: string;
  stepNumber: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  category: StageCategory;
  description: string;
  workflowId?: string;
  requiresClientUpload?: boolean;
  requiresPaymentClearance?: boolean;
}

export interface PipelineWorkflow {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'Visa Processing' | 'Business Setup' | 'Document Clearing' | 'PRO Services' | 'Recruitment' | 'Attestation' | 'Custom';
  color: string;
  badgeBg?: string;
  stages: WorkStage[];
  serviceCategoryIds?: string[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StageHistoryEntry {
  id: string;
  serviceId?: string;
  fromStage: string;
  toStage: string;
  updatedByUserId: string;
  updatedByUserName: string;
  updatedByUserRole: UserRole;
  timestamp: string;
  remarks: string;
  attachedDocumentIds?: string[];
  nextFollowUpDate?: string;
}

export type DocumentCategory = 
  | 'Passport'
  | 'Emirates ID'
  | 'Visa'
  | 'Trade License'
  | 'Medical Fitness'
  | 'Salary Slip'
  | 'Police Clearance'
  | 'Tenancy/Ejari'
  | 'Application Form'
  | 'Invoice'
  | 'Receipt'
  | 'Attested Degree'
  | 'Photo'
  | 'Other';

export interface DocumentItem {
  id: string;
  clientId: string;
  clientName?: string;
  serviceId?: string;
  serviceName?: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  remarks?: string;
  uploadedByUserId: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  version: number;
}

export interface InternalNote {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  text: string;
  type?: 'internal' | 'client_outreach' | 'whatsapp' | 'email' | 'call' | 'followup';
  sentVia?: 'whatsapp' | 'email' | 'system';
  taggedUserIds?: string[];
  createdAt: string;
}

export interface CallLog {
  id: string;
  userId: string;
  userName: string;
  type: 'call' | 'meeting' | 'visit' | 'whatsapp';
  date: string;
  durationMinutes?: number;
  summary: string;
  outcome: string;
  nextActionDate?: string;
}

export interface ClientService {
  id: string;
  clientId: string;
  serviceId: string;
  serviceName: string;
  category: string;
  price: number;
  governmentFees: number;
  advancePaid: number;
  balance: number;
  invoiceId?: string;
  invoiceNumber?: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  currentStageId: string;
  currentStageName: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  startDate: string;
  targetCompletionDate: string;
  completedDate?: string;
  requiredDocs: {
    docName: string;
    isUploaded: boolean;
    status: 'pending' | 'approved' | 'rejected';
    documentId?: string;
  }[];
  stageHistory: StageHistoryEntry[];
  referenceNumber: string;
}

export interface Client {
  id: string;
  refNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationality: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  passportNo: string;
  passportExpiry: string;
  emiratesId: string;
  emiratesIdExpiry: string;
  visaUid?: string;
  visaType?: string;
  visaExpiry?: string;
  mobile: string;
  whatsapp: string;
  email: string;
  residentialAddress: string;
  companyId: string;
  vendorId?: string;
  vendorName?: string;
  referredBy?: string;
  assignedAdminId: string;
  assignedEmployeeIds: string[];
  createdByUserId?: string;
  services: ClientService[];
  currentStageId: string;
  currentStageName: string;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  notes: InternalNote[];
  calls: CallLog[];
  tags: string[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'waiting_client' | 'waiting_authority' | 'completed' | 'cancelled' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  text: string;
  createdAt: string;
}

export interface TaskDueReminder {
  id: string;
  taskId: string;
  task: TaskItem;
  title: string;
  dueDate: string;
  daysLeft: number;
  dueStatus: 'overdue' | 'due_today' | 'due_tomorrow' | 'due_soon' | 'upcoming';
  isOverdue: boolean;
  isDueToday: boolean;
  isUrgent: boolean;
  assignedEmployeeName: string;
  assignedEmployeeId: string;
  clientName?: string;
  clientId?: string;
  priority: TaskPriority;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  leadId?: string;
  leadName?: string;
  companyId?: string;
  serviceId?: string;
  serviceName?: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  assignedEmployeeAvatar: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  reminderDate?: string;
  completedAt?: string;
  comments: TaskComment[];
  createdAt: string;
}

export interface MessageAttachment {
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface MessageItem {
  id: string;
  conversationId: string; // usually clientId or team-channel
  clientId?: string;
  clientName?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  recipientId?: string;
  text: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  read: boolean;
  isInternalNote?: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  qty?: number;
  quantity?: number;
  rate?: number;
  unitPrice?: number;
  amount?: number;
  total?: number;
  isGovernmentFee?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  receiptNumber?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientPassport?: string;
  companyId: string;
  companyName: string;
  serviceId?: string;
  serviceName: string;
  subtotal: number;
  vatRate: number; // e.g. 5%
  vatAmount: number;
  governmentFees: number;
  grandTotal: number;
  amountPaid: number;
  balanceAmount: number;
  paymentMethod: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque' | 'Online Gateway';
  transactionRef?: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'refunded' | 'cancelled';
  notes?: string;
  items: InvoiceItem[];
  issuedByUserId: string;
  issuedByUserName: string;
  createdAt: string;
}

export type Task = TaskItem;
export type InvoiceLineItem = InvoiceItem;

export interface LeadCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  isJobCategory?: boolean; // Whether this category represents job application / recruitment
  type?: string; // Optional archetype category
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: string;
}

export interface LeadSource {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt?: string;
}

export interface LeadStage {
  id: string;
  name: string;
  stepNumber: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  statusKey: string;
  description?: string;
  isDefault?: boolean;
}

export interface Lead {
  id: string;
  refNo: string;
  name: string;
  gender?: 'Male' | 'Female' | 'Other';
  companyName?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  nationality: string;
  country?: string; // Country / Nationality
  city?: string; // City
  currentLocation?: string; // e.g. "Dubai, UAE", "Inside UAE", "Outside UAE (India)", etc.
  category?: string; // Lead Type / Category Name
  leadCategoryId?: string;
  isJobLead?: boolean;
  jobTitleInterest?: string; // If applying for a job (e.g. Accountant, PRO Officer, Driver)
  jobType?: string; // Job Type / Designation as mentioned while creating lead
  jobExperienceYears?: string;
  serviceInterested: string;
  serviceCategoryId?: string;
  estimatedValue: number;
  source: 'Google Ads' | 'Walk-in' | 'Referral' | 'Social Media' | 'PRO Network' | 'Website' | 'WhatsApp Direct' | 'Job Portal / Careers' | 'Other' | string;
  status: 'new' | 'contacted' | 'proposal_sent' | 'negotiation' | 'converted' | 'lost' | string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  companyId: string; // branch
  branchName?: string;
  assignedEmployeeId?: string;
  assignedEmployeeIds?: string[];
  assignedEmployeeName?: string;
  assignedEmployeeNames?: string[];
  assignedEmployeeAvatar?: string;
  createdByUserId?: string;
  createdByName?: string;
  notes?: string;
  notesList?: InternalNote[];
  tags?: string[];
  followUpDate?: string;
  convertedClientId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'deposit'
  | 'service_fee'
  | 'gov_fee'
  | 'typing_fee'
  | 'vat_payment'
  | 'refund'
  | 'expense'
  | 'withdrawal';

export type PaymentMethodType =
  | 'Cash'
  | 'Bank Transfer'
  | 'Credit Card'
  | 'Corporate Card'
  | 'Cheque'
  | 'Online Gateway';

export interface Transaction {
  id: string;
  transactionNumber: string;
  clientId?: string;
  clientName?: string;
  companyId: string;
  companyName: string;
  serviceId?: string;
  serviceName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  type: TransactionType;
  category: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  referenceNumber?: string; // Cheque No, Bank Ref, Auth Portal Ref
  receiptNumber?: string;
  receiptUrl?: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  recordedByUserId: string;
  recordedByUserName: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  action: string;
  module: 'Clients' | 'Companies' | 'Vendors' | 'Services' | 'Stages' | 'Documents' | 'Tasks' | 'Payments' | 'Users' | 'Settings' | 'Leads' | 'Transactions' | 'Profile' | 'Security' | 'Authentication';
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // empty means broad broadcast
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'stage_update' | 'expiry_alert' | 'payment_due' | 'task_deadline' | 'document_upload' | 'assignment' | 'system';
  linkTab?: string;
  relatedClientId?: string;
  read: boolean;
  timestamp: string;
}
