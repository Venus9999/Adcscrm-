export type UserRole = 'master' | 'admin' | 'employee' | 'agent' | 'client';

export interface UserPermissions {
  canCreateClients: boolean;
  canEditStages: boolean;
  canManagePayments: boolean;
  canManageBilling?: boolean;
  canEditInvoices?: boolean;
  canDeleteInvoices?: boolean;
  canViewAllCompanies: boolean;
  canAssignEmployees: boolean;
  canAssignTasks?: boolean;
  canDeleteRecords: boolean;
  canExportReports: boolean;
  canViewReports?: boolean;
  canManageLeads?: boolean;
  canManageTransactions?: boolean;
  canManageUsers?: boolean;
  canManageCompanies?: boolean;
  canCreateCompanies?: boolean;
  canCreateCompany?: boolean;
  canCreateBranches?: boolean;
  canCreateBranch?: boolean;
  canManageBranches?: boolean;
  canCreateClient?: boolean;
  canDeleteClient?: boolean;
  canExportData?: boolean;
  canViewFinancials?: boolean;
  canManageWorkflows?: boolean;
  canEditWorkflows?: boolean;
  canManageRoles?: boolean;
  canManageSystemSettings?: boolean;
  canManageDepartments?: boolean;
  canManageVendors?: boolean;
  canManageDocuments?: boolean;
  canSendBroadcasts?: boolean;
  canManageCommissions?: boolean;
  canApproveDiscounts?: boolean;
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
  trnNumber?: string;
  tradeLicenseNo: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  poBox?: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  vatRateDefault: number;
  vatRate?: number;
  vatPercentage?: number;
  currency: string;
  bankDetails: BankDetails;
  bankName?: string;
  bankBranch?: string;
  accountName?: string;
  iban?: string;
  swiftCode?: string;
  accountNumber?: string;
  signatoryName: string;
  signatoryTitle: string;
  authorizedSignatoryName?: string;
  authorizedSignatoryTitle?: string;
  signatorySignatureUrl: string;
  stampUrl: string;
  companyStampUrl?: string;
  stampText?: string;
  showSignatory: boolean;
  showStamp: boolean;
  showQrCodeOnInvoice?: boolean;
  showStampOnInvoice?: boolean;
  showSignatureOnInvoice?: boolean;
  termsAndConditions: string;
  invoiceFooterNote: string;
  footerNotes?: string;
  // Nomod Online Payment Gateway Configuration
  nomodEnabled?: boolean;
  nomodApiKey?: string;
  nomodPublishableKey?: string;
  nomodSecretKey?: string;
  nomodAccountId?: string;
  nomodLiveMode?: boolean;
  nomodCurrencyDefault?: string;
  nomodPaymentLinkTemplate?: string;
  signatory?: {
    name?: string;
    title?: string;
    designation?: string;
    signatureUrl?: string;
    signatureImageUrl?: string;
    fontFamily?: string;
    type?: string;
    showSignature?: boolean;
  };
  stamp?: {
    shape?: string;
    text?: string;
    stampLabel?: string;
    stampSubtext?: string;
    subText?: string;
    color?: string;
    imageUrl?: string;
    stampImageUrl?: string;
    showStamp?: boolean;
  };
  lastUpdated?: string;
  updatedBy?: string;
}

export interface SmtpSettings {
  enabled?: boolean;
  host: string;
  port: number;
  secure?: boolean;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail?: string;
  lastTested?: string;
  status?: 'verified' | 'untested' | 'failed';
}

export interface CRMBranding {
  name: string;
  companyName?: string;
  shortName?: string;
  tagline: string;
  logoUrl: string;
  primaryColor?: string;
  supportEmail?: string;
  supportPhone?: string;
  website?: string;
  footerText?: string;
  visaEmailTemplate: VisaEmailTemplate;
  billingSettings?: InvoiceBillingSettings;
  smtpSettings?: SmtpSettings;
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
  title?: string;
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
  assignedVendorIds?: string[];
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
  assignedEmployeeId?: string;
  assignedEmployeeIds?: string[];
  assignedEmployeeName?: string;
  assignedEmployeeNames?: string[];
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

export type DiscountType = 'percentage' | 'fixed';

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
  corporateDiscountType?: DiscountType; // 'percentage' | 'fixed'
  corporateDiscountValue?: number; // % value (e.g. 15) or AED fixed amount (e.g. 500)
  corporateDiscountPercent?: number; // Registered company default discount % for service catalog
  adminId: string;
  assignedAdminIds?: string[];
  employeeIds: string[];
  activeServicesCount: number;
  totalClientsCount: number;
  currency: string;
  createdAt: string;
  entityType?: 'company' | 'branch';
  parentCompanyId?: string;
  parentCompanyName?: string;
  branchCode?: string;
  branchLocation?: string;
  branchName?: string;
  isBranch?: boolean;
  portalLoginEnabled?: boolean;
  portalLoginEmail?: string;
  portalAdminName?: string;
  portalAdminRole?: string;
  portalTempPassword?: string;
  portalSecurityPin?: string;
  portalUserId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  companyId?: string;
  parentDivision?: string;
  headOfDepartment?: string;
  headOfDepartmentId?: string;
  deputyHead?: string;
  deputyHeadId?: string;
  email?: string;
  phone?: string;
  location?: string;
  workingHours?: string;
  serviceCategories?: string[];
  targetSlaDays?: number;
  maxDossierCapacity?: number;
  costCenterCode?: string;
  budget?: number;
  spendingApprovalLimit?: number;
  autoAssignMode?: 'manual' | 'round_robin' | 'least_busy';
  dataAccessScope?: 'global' | 'department_only' | 'branch_only';
  escalationEmail?: string;
  requiredDocumentsList?: string[];
  assignedStaffIds?: string[];
  color?: string;
  badgeBg?: string;
  badgeText?: string;
  employeeCount?: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface ServiceClassification {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isSystem?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  category: 'Visa Processing' | 'Business Setup' | 'Document Clearing' | 'PRO Services' | 'Recruitment' | 'Attestation' | string;
  defaultPrice: number;
  priceB2C?: number; // Retail / Direct Client Price (AED)
  priceB2B?: number; // Corporate / Registered Company Price (AED)
  b2bDiscountPercent?: number; // Corporate discount percentage (e.g. 15%)
  pricingTierAvailable?: 'all' | 'b2b_only' | 'b2c_only'; // Target visibility
  governmentFees: number;
  estimatedDays: number;
  description: string;
  requiredDocuments: string[];
  defaultStages: string[];
  isActive?: boolean;
  isPopular?: boolean;
  tags?: string[];
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
  type?: 'internal' | 'client_outreach' | 'whatsapp' | 'email' | 'call' | 'followup' | 'note' | 'client_message' | 'meeting' | 'call_log' | string;
  sentVia?: 'whatsapp' | 'email' | 'system' | string;
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
  categoryName?: string;
  notes?: string;
  price: number;
  originalPrice?: number;
  discountType?: DiscountType; // 'percentage' | 'fixed'
  discountValue?: number; // % value or AED fixed amount
  discountAmount?: number; // Net AED discounted
  discountPercent?: number;
  pricingTier?: 'b2c' | 'b2b';
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
  fileNumber?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationality: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  passportNo: string;
  passportNumber?: string;
  passportExpiry: string;
  emiratesId: string;
  emiratesIdExpiry: string;
  visaUid?: string;
  visaType?: string;
  visaExpiry?: string;
  mobile: string;
  phone?: string;
  whatsapp: string;
  email: string;
  residentialAddress: string;
  companyId: string;
  companyName?: string;
  category?: string;
  type?: string;
  status?: string;
  pricingTier?: 'b2c' | 'b2b';
  discountType?: DiscountType; // 'percentage' | 'fixed'
  discountValue?: number; // % or AED amount for this client
  customServiceRate?: number; // Custom rate agreed for this client
  corporateDiscountPercent?: number;
  isDirectRegistration?: boolean;
  vendorId?: string;
  vendorName?: string;
  referredBy?: string;
  assignedAdminId: string;
  assignedEmployeeId?: string;
  assignedEmployeeIds: string[];
  assignedEmployeeName?: string;
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
  notesText?: string;
  calls: CallLog[];
  tags: string[];
  changelog?: ChangeLogEntry[];
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
  assignedEmployeeIds?: string[];
  assignedEmployeeName: string;
  assignedEmployeeAvatar?: string;
  assignedToUserId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string;
  dueDate: string;
  reminderDate?: string;
  completedAt?: string;
  comments: TaskComment[];
  changelog?: ChangeLogEntry[];
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
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount?: number;
  discountPercent?: number;
  pricingTier?: 'b2c' | 'b2b';
  vatRate: number; // e.g. 5%
  vatAmount: number;
  governmentFees: number;
  grandTotal: number;
  amountPaid: number;
  balanceAmount: number;
  paymentMethod: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque' | 'Online Gateway';
  paymentProvider?: string;
  nomodPaymentId?: string;
  nomodAuthCode?: string;
  nomodTransactionDetails?: any;
  transactionRef?: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'refunded' | 'cancelled';
  notes?: string;
  items: InvoiceItem[];
  changelog?: ChangeLogEntry[];
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
  code?: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt?: string;
}

export interface LeadStage {
  id: string;
  name: string;
  stepNumber?: number;
  order?: number;
  color: string;
  badgeBg?: string;
  badgeText?: string;
  statusKey?: string;
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
  notesLog?: any[];
  tasks?: any[];
  tags?: string[];
  followUpDate?: string;
  convertedClientId?: string;
  originCountry?: string;
  countryOfApplying?: string;
  onlineApplicationRef?: string;
  assignedToStaffId?: string;
  assignedStaffName?: string;
  changelog?: ChangeLogEntry[];
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
  status: 'completed' | 'pending' | 'cancelled' | 'reversed' | 'failed';
  notes?: string;
  recordedByUserId: string;
  recordedByUserName: string;
  recordedByName?: string;
  createdAt: string;
}

export interface FieldChange {
  field: string;
  label: string;
  oldValue: any;
  newValue: any;
  displayOldValue: string;
  displayNewValue: string;
}

export interface ChangeLogEntry {
  id: string;
  entityId: string;
  entityType: 'Client' | 'Lead' | 'Invoice' | 'Task' | 'Document' | 'VisaApplication' | 'Company' | 'Vendor' | 'Service' | 'User' | 'Transaction';
  entityName?: string;
  action: 'create' | 'update' | 'stage_change' | 'status_change' | 'document_added' | 'note_added' | 'assignee_changed' | 'financial_edit';
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail?: string;
  userAvatar?: string;
  timestamp: string;
  summary: string;
  changes: FieldChange[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  action: string;
  module: 'Clients' | 'Companies' | 'Vendors' | 'Services' | 'Stages' | 'Documents' | 'Tasks' | 'Payments' | 'Users' | 'Settings' | 'Leads' | 'Transactions' | 'Profile' | 'Security' | 'Authentication' | 'Visa Services';
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
  type: 'stage_update' | 'expiry_alert' | 'payment_due' | 'task_deadline' | 'document_upload' | 'assignment' | 'system' | 'visa_application' | 'visa_status_update';
  linkTab?: string;
  relatedClientId?: string;
  relatedVisaAppId?: string;
  read: boolean;
  timestamp: string;
}

export type VisaApplicationStatus = 
  | 'submitted'
  | 'documents_verification'
  | 'payment_completed'
  | 'embassy_processing'
  | 'biometrics_appointment'
  | 'approved'
  | 'issued'
  | 'rejected'
  | 'on_hold';

export interface VisaTimelineEvent {
  id: string;
  title: string;
  description: string;
  stage: VisaApplicationStatus;
  timestamp: string;
  updatedBy: string;
  status: 'completed' | 'in_progress' | 'pending';
  actionRequired?: string;
  referenceCode?: string;
  location?: string;
}

export interface VisaUploadedDoc {
  id: string;
  docName: string;
  docCategory: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  remarks?: string;
}

export interface VisaApplication {
  id: string;
  applicationNumber: string; // e.g. "VSA-2026-AE-0891"
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientPassportNo: string;
  clientNationality: string;
  companyId?: string;
  
  // Origin & Applying Countries (Required by Consular & Processing Rules)
  originCountry: string; // Country of Origin / Citizenship / Passport Country
  countryOfApplying: string; // Country of Applying (Current Residence / Location of Submission)
  
  // Destination Country & Program
  targetCountry: string;
  targetCountryCode: string;
  targetCountryFlag: string;
  targetRegion: 'GCC & Middle East' | 'Europe & Schengen' | 'Americas' | 'Asia-Pacific' | 'Africa & Global';
  visaCategory: string; // "Tourist / Visit Visa", "Golden / Investor Visa", "Work / Employment Permit", "Business Visa", "Student Visa", "Digital Nomad"
  visaType: string; // "30 Days Single Entry", "90 Days Multiple Entry", "2-Year Residence", "5-Year Golden", etc.
  entryType: 'Single Entry' | 'Multiple Entry';
  validityDuration: string;
  stayDuration: string;
  
  // Processing speed & schedule
  processingSpeed: 'Standard' | 'Express / VIP' | 'Super Express (24h)';
  estimatedProcessingDays: number;
  estimatedCompletionDate: string;
  travelDate?: string;
  submissionDate: string;
  approvalDate?: string;
  expiryDate?: string;
  
  // Current Status & Progress Bar
  status: VisaApplicationStatus;
  progressPercentage: number; // 0 - 100
  currentStageTitle: string;
  governmentReferenceNo?: string;
  embassyReferenceNo?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerAvatar?: string;
  
  // Pricing & Payments
  governmentFee: number;
  serviceFee: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'paid' | 'partially_paid';
  paymentMethod?: string;
  paymentProvider?: 'nomod' | 'stripe' | 'manual';
  nomodPaymentId?: string;
  nomodPaymentUrl?: string;
  nomodPaymentStatus?: 'pending' | 'paid' | 'failed';
  nomodTransactionDetails?: {
    reference?: string;
    authCode?: string;
    cardBrand?: string;
    last4?: string;
    paidAt?: string;
    channel?: string;
  };
  invoiceId?: string;
  invoiceNumber?: string;
  
  // Documents & Timeline
  uploadedDocuments: VisaUploadedDoc[];
  timeline: VisaTimelineEvent[];
  changelog?: ChangeLogEntry[];
  notes?: string;
  specialInstructions?: string;
  
  // Issued e-Visa info
  issuedVisaUrl?: string;
  issuedVisaNumber?: string;
  issuedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}
