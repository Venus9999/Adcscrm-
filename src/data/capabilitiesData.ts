import { UserPermissions, UserRole } from '../types/crm';

export interface CapabilityDefinition {
  key: keyof UserPermissions;
  label: string;
  category:
    | 'Clients & Leads'
    | 'Workflows & Execution'
    | 'Financials & Invoicing'
    | 'Multi-Branch & Governance'
    | 'Staff & Access Control'
    | 'Audit & Export';
  description: string;
  technicalScope: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical Admin';
  recommendedFor: UserRole[];
}

export const SYSTEM_CAPABILITIES: CapabilityDefinition[] = [
  // Category 1: Clients & Leads
  {
    key: 'canCreateClients',
    label: 'Create & Onboard Client Profiles',
    category: 'Clients & Leads',
    description: 'Enables creation of new individual and corporate client profiles, dossier creation, and document storage.',
    technicalScope: 'Grants access to +New Client modal, company branch assignment, and initial KYC record registration.',
    riskLevel: 'Low',
    recommendedFor: ['master', 'admin', 'employee'],
  },
  {
    key: 'canCreateClient',
    label: 'Direct Client Registration',
    category: 'Clients & Leads',
    description: 'Allows registering client profiles directly from client directory without requiring prior lead qualification.',
    technicalScope: 'Enables quick client creation shortcut in top navigation and client database views.',
    riskLevel: 'Low',
    recommendedFor: ['master', 'admin', 'employee'],
  },
  {
    key: 'canManageLeads',
    label: 'Manage Prospects & Leads Pipeline',
    category: 'Clients & Leads',
    description: 'Allows staff to capture, qualify, assign, update, and convert incoming leads into active client cases.',
    technicalScope: 'Grants access to Leads board, lead status updates, lead scoring, and 1-click client conversion.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin', 'employee', 'agent'],
  },
  {
    key: 'canDeleteClient',
    label: 'Delete Client Profiles & Records',
    category: 'Clients & Leads',
    description: 'Permanently removes client accounts, archived dossiers, and attached identification document vaults.',
    technicalScope: 'Enables hard delete button on client detail pages. Requires high security clearance.',
    riskLevel: 'Critical Admin',
    recommendedFor: ['master'],
  },

  // Category 2: Workflows & Execution
  {
    key: 'canEditStages',
    label: 'Advance Pipeline Milestones',
    category: 'Workflows & Execution',
    description: 'Permits moving client cases across pipeline milestones (e.g., ICP Entry Permit, Medical Fitness, Biometrics, Visa Stamping).',
    technicalScope: 'Allows updating stage status, completing prerequisite checklist items, and triggering stage change logs.',
    riskLevel: 'Low',
    recommendedFor: ['master', 'admin', 'employee'],
  },
  {
    key: 'canManageWorkflows',
    label: 'Configure Workflow Pipelines & Stages',
    category: 'Workflows & Execution',
    description: 'Allows designing custom pipeline templates, stage sequences, SLA targets, and mandatory required documents.',
    technicalScope: 'Grants full CRUD access to Workflow Pipelines & Stage Configuration settings.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canAssignTasks',
    label: 'Assign Tasks & Action Items',
    category: 'Workflows & Execution',
    description: 'Allows delegating case action items, typing center visits, and government department liaison duties to other staff.',
    technicalScope: 'Enables staff assignment selector on tasks and deadline notifications.',
    riskLevel: 'Low',
    recommendedFor: ['master', 'admin', 'employee'],
  },

  // Category 3: Financials & Invoicing
  {
    key: 'canManagePayments',
    label: 'Record Payments & Issue Receipts',
    category: 'Financials & Invoicing',
    description: 'Allows recording incoming bank transfers, cash collections, Nomod credit card payments, and receipt generations.',
    technicalScope: 'Enables payment creation modal, Nomod payment link generator, and receipt PDF rendering.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin', 'employee'],
  },
  {
    key: 'canEditInvoices',
    label: 'Draft & Modify Tax Invoices',
    category: 'Financials & Invoicing',
    description: 'Permits creating custom VAT invoices, adding government fee line items, and adjusting retainer agreements.',
    technicalScope: 'Grants access to Invoice builder, fee customization, and tax rate overrides.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canDeleteInvoices',
    label: 'Void & Remove Invoices',
    category: 'Financials & Invoicing',
    description: 'Allows cancelling, voiding, or permanently purging generated tax invoices and transaction records from the ledger.',
    technicalScope: 'Enables invoice voiding and deletion. Tracked in audit changelog.',
    riskLevel: 'Critical Admin',
    recommendedFor: ['master'],
  },
  {
    key: 'canViewFinancials',
    label: 'View Corporate Financials & Revenue',
    category: 'Financials & Invoicing',
    description: 'Provides access to firm-wide revenue totals, gross profits, fee margin breakdowns, and VAT compliance summaries.',
    technicalScope: 'Displays executive financial dashboards, profit & loss metrics, and revenue charts.',
    riskLevel: 'High',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canApproveDiscounts',
    label: 'Authorize Customer Fee Discounts',
    category: 'Financials & Invoicing',
    description: 'Permits applying retainer reductions and custom discounts on service fees up to departmental limits.',
    technicalScope: 'Unlocks discount percentage input on invoice and payment generation modals.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin'],
  },

  // Category 4: Multi-Branch & Governance
  {
    key: 'canViewAllCompanies',
    label: 'Multi-Branch Cross-Entity Scope',
    category: 'Multi-Branch & Governance',
    description: 'Provides unrestricted visibility across all registered UAE companies, branch locations, and subsidiaries.',
    technicalScope: 'Bypasses branch filtering locks and allows global search across all corporate entities.',
    riskLevel: 'High',
    recommendedFor: ['master'],
  },
  {
    key: 'canCreateCompanies',
    label: 'Create Independent Companies (Parent Entities)',
    category: 'Multi-Branch & Governance',
    description: 'Allows registering and creating new standalone parent corporate entities, commercial holdings, and brand legal identities.',
    technicalScope: 'Unlocks the "New Standalone Company" registration workflow and corporate setup controls.',
    riskLevel: 'Critical Admin',
    recommendedFor: ['master'],
  },
  {
    key: 'canCreateBranches',
    label: 'Create & Provision Branch Offices',
    category: 'Multi-Branch & Governance',
    description: 'Authorizes creating subsidiary branch locations, satellite offices, and regional desks under an existing parent entity.',
    technicalScope: 'Unlocks the "Branch Office" creation option with parent company linking, branch codes, and local branch admin assignment.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canManageCompanies',
    label: 'Manage Parent Legal Entities',
    category: 'Multi-Branch & Governance',
    description: 'Allows configuring parent corporate entities, trade licenses, TRNs, corporate discount rates, and official seals.',
    technicalScope: 'Grants access to Parent Company settings, corporate profile modifications, and trade license renewals.',
    riskLevel: 'Critical Admin',
    recommendedFor: ['master'],
  },
  {
    key: 'canManageBranches',
    label: 'Manage & Configure Branch Entities',
    category: 'Multi-Branch & Governance',
    description: 'Enables updating branch operational parameters, physical addresses, branch bank sub-accounts, and assigning branch admins.',
    technicalScope: 'Grants update and operational maintenance authority over existing branch offices.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canManageDepartments',
    label: 'Configure Departments & Cost Centers',
    category: 'Multi-Branch & Governance',
    description: 'Enables configuring organizational divisions, assigning Department Heads (HOD), setting SLA targets, and managing budgets.',
    technicalScope: 'Grants CRUD access to Department Settings, SLA configuration, and cost center management.',
    riskLevel: 'High',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canManageVendors',
    label: 'Manage Government Vendors & Typing Centers',
    category: 'Multi-Branch & Governance',
    description: 'Allows registering and managing external typing centers, medical test centers, courier partners, and supplier ledgers.',
    technicalScope: 'Grants access to Vendor Directory, outsourced task routing, and vendor billing settlement.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin'],
  },

  // Category 5: Staff & Access Control
  {
    key: 'canAssignEmployees',
    label: 'Reassign Case Files & Portfolios',
    category: 'Staff & Access Control',
    description: 'Allows bulk transferring clients, leads, and active dossiers between officers upon employee leave or restructuring.',
    technicalScope: 'Unlocks atomic portfolio reassignment modal in Employees Management.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canManageUsers',
    label: 'Manage Staff & User Accounts',
    category: 'Staff & Access Control',
    description: 'Allows creating, editing, suspending staff accounts, and performing administrative password resets.',
    technicalScope: 'Grants CRUD access to Employee Directory, account suspension, and password generation.',
    riskLevel: 'Critical Admin',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canManageRoles',
    label: 'Define Roles & Permissions Matrices',
    category: 'Staff & Access Control',
    description: 'Permits creating custom organizational roles and altering system capability matrices across the entire CRM.',
    technicalScope: 'Enables custom role creation and granular permission toggling.',
    riskLevel: 'Critical Admin',
    recommendedFor: ['master'],
  },
  {
    key: 'canManageSystemSettings',
    label: 'System Administration & Master Control',
    category: 'Staff & Access Control',
    description: 'Access to system-wide configurations, database backups, API keys, official stamp generators, and audit log inspection.',
    technicalScope: 'Unlocks master settings navigation and system security configuration.',
    riskLevel: 'Critical Admin',
    recommendedFor: ['master'],
  },

  // Category 6: Audit & Export
  {
    key: 'canDeleteRecords',
    label: 'Hard Delete Records & Activity Logs',
    category: 'Audit & Export',
    description: 'Authorizes permanent hard deletion of records, notes, tasks, and audit trail entries.',
    technicalScope: 'Enables delete action buttons across all CRM modules. Strict audit logging enforced.',
    riskLevel: 'Critical Admin',
    recommendedFor: ['master'],
  },
  {
    key: 'canExportReports',
    label: 'Export Business Analytics & Reports',
    category: 'Audit & Export',
    description: 'Allows downloading CSV and PDF analytical reports, SLA turnaround scorecards, and revenue summaries.',
    technicalScope: 'Unlocks report export buttons on analytics dashboards and client lists.',
    riskLevel: 'Moderate',
    recommendedFor: ['master', 'admin'],
  },
  {
    key: 'canExportData',
    label: 'Full Raw Database Extraction',
    category: 'Audit & Export',
    description: 'Authorizes full database snapshot extraction and mass customer data export.',
    technicalScope: 'Unlocks full JSON/CSV bulk data dump features in system settings.',
    riskLevel: 'High',
    recommendedFor: ['master'],
  },
];

export interface RolePresetTemplate {
  name: string;
  roleType: UserRole;
  description: string;
  color: string;
  permissions: Partial<UserPermissions>;
}

export const ROLE_PRESET_TEMPLATES: RolePresetTemplate[] = [
  {
    name: 'Senior PRO & Case Specialist',
    roleType: 'employee',
    description: 'Handles client dossiers, ministry submissions, workflow stage advancement, and payment recording.',
    color: '#3B82F6',
    permissions: {
      canCreateClients: true,
      canCreateClient: true,
      canManageLeads: true,
      canEditStages: true,
      canAssignTasks: true,
      canManagePayments: true,
      canExportReports: true,
      canDeleteRecords: false,
      canDeleteClient: false,
      canDeleteInvoices: false,
      canManageUsers: false,
      canViewAllCompanies: false,
    },
  },
  {
    name: 'Finance, Tax & Accounts Officer',
    roleType: 'admin',
    description: 'Manages invoicing, VAT returns, payment reconciliations, fee discount approvals, and financial exports.',
    color: '#F59E0B',
    permissions: {
      canCreateClients: false,
      canEditStages: false,
      canManagePayments: true,
      canEditInvoices: true,
      canDeleteInvoices: false,
      canViewFinancials: true,
      canApproveDiscounts: true,
      canExportReports: true,
      canExportData: true,
      canDeleteRecords: false,
    },
  },
  {
    name: 'Branch Operations Manager',
    roleType: 'admin',
    description: 'Oversees branch operations, assigns staff tasks, reassigns portfolios, manages department workflows & SLAs.',
    color: '#10B981',
    permissions: {
      canCreateClients: true,
      canCreateClient: true,
      canManageLeads: true,
      canEditStages: true,
      canManageWorkflows: true,
      canAssignTasks: true,
      canAssignEmployees: true,
      canManagePayments: true,
      canEditInvoices: true,
      canViewFinancials: true,
      canApproveDiscounts: true,
      canManageDepartments: true,
      canManageVendors: true,
      canManageUsers: true,
      canCreateBranches: true,
      canManageBranches: true,
      canExportReports: true,
      canDeleteRecords: false,
      canDeleteClient: false,
      canDeleteInvoices: false,
    },
  },
  {
    name: 'Immigration & Consular Advisor',
    roleType: 'employee',
    description: 'Specializes in visa applications, consular document checklists, client communications, and milestone tracking.',
    color: '#8B5CF6',
    permissions: {
      canCreateClients: true,
      canCreateClient: true,
      canManageLeads: true,
      canEditStages: true,
      canAssignTasks: true,
      canManagePayments: true,
      canExportReports: false,
      canDeleteRecords: false,
      canManageUsers: false,
    },
  },
  {
    name: 'Business Development & Referral Partner',
    roleType: 'agent',
    description: 'External referral agent managing incoming prospect leads, submission tracking, and commission receipts.',
    color: '#06B6D4',
    permissions: {
      canCreateClients: true,
      canManageLeads: true,
      canEditStages: false,
      canManagePayments: false,
      canDeleteRecords: false,
      canManageUsers: false,
      canViewFinancials: false,
    },
  },
];

export interface RoleHierarchyGuide {
  role: UserRole;
  title: string;
  badge: string;
  badgeBg: string;
  color: string;
  scopeSummary: string;
  keyResponsibilities: string[];
  securityClearance: 'Supreme Master Authority' | 'Branch Level Management' | 'Operational Case Execution' | 'Referral / External' | 'Client Self-Service';
  dataVisibilityScope: string;
}

export const ROLE_HIERARCHY_GUIDES: RoleHierarchyGuide[] = [
  {
    role: 'master',
    title: 'Master Administrator / Super Admin',
    badge: 'Supreme Master',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    color: '#F43F5E',
    scopeSummary: 'Supreme authority across all UAE corporate entities, global settings, audit trails, and financial books.',
    keyResponsibilities: [
      'Multi-entity & branch legal governance (Trade licenses, TRNs, corporate stamps)',
      'System-wide role definition and permissions matrix alterations',
      'Hard deletion rights and security audit log review',
      'Executive financial P&L, VAT compliance, and raw database extraction',
      'Staff account provisioning and administrative master credential management',
    ],
    securityClearance: 'Supreme Master Authority',
    dataVisibilityScope: 'Global Unrestricted (All branches, all clients, all ledgers)',
  },
  {
    role: 'admin',
    title: 'Branch Administrator / Operations Director',
    badge: 'Branch Admin',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    color: '#10B981',
    scopeSummary: 'Branch-level management authority overseeing department operations, staff allocation, and financial invoicing.',
    keyResponsibilities: [
      'Operational supervision of branch case officers and workload balancing',
      'Tax invoice drafting, fee payment verification, and discount authorizations',
      'Department HOD assignments, SLA turnaround tracking, and cost center budgets',
      'Portfolio reassignment between staff during leave or caseload shifts',
      'Branch-level analytics and staff performance scorecard reporting',
    ],
    securityClearance: 'Branch Level Management',
    dataVisibilityScope: 'Branch & Department Scopes (Configurable cross-branch view)',
  },
  {
    role: 'employee',
    title: 'PRO Officer / Case Specialist',
    badge: 'Case Officer',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    color: '#3B82F6',
    scopeSummary: 'Day-to-day operational execution of client files, ministry applications, and pipeline advancement.',
    keyResponsibilities: [
      'Client file onboarding, KYC document vetting, and passport data entry',
      'Advancing cases across milestone stages (ICP, GDRFA, Medical, Biometrics, Stamping)',
      'Recording client payments, generating receipts, and sending payment links',
      'Direct communication with clients regarding required documents and appointments',
      'Executing task checklists and meeting SLA turnaround targets',
    ],
    securityClearance: 'Operational Case Execution',
    dataVisibilityScope: 'Assigned Cases & Department Silo',
  },
  {
    role: 'agent',
    title: 'Referral Agent / Strategic Partner',
    badge: 'Referral Partner',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    color: '#06B6D4',
    scopeSummary: 'External business development partner submitting leads and monitoring commission milestones.',
    keyResponsibilities: [
      'Submitting new corporate & individual leads into the CRM intake pipeline',
      'Tracking the real-time milestone progress of referred client files',
      'Monitoring earned referral commissions and payout disbursements',
      'Direct messaging with assigned case officers regarding prospective clients',
    ],
    securityClearance: 'Referral / External',
    dataVisibilityScope: 'Referred Leads & Clients Only',
  },
  {
    role: 'client',
    title: 'Client Portal User',
    badge: 'Client Portal',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    color: '#8B5CF6',
    scopeSummary: 'End-user client accessing self-service dashboard to view case status, invoices, and documents.',
    keyResponsibilities: [
      'Viewing real-time live milestone progress of visa, business setup, and attestation files',
      'Securely uploading required KYC documents, passport copies, and attested certificates',
      'Viewing issued VAT tax invoices and settling fees via Nomod credit card payment links',
      'Downloading stamped visa copies, Emirates ID cards, and official completion letters',
    ],
    securityClearance: 'Client Self-Service',
    dataVisibilityScope: 'Own Profile & Documents Only',
  },
];
