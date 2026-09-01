import { ChangeLogEntry, FieldChange, User, UserRole } from '../types/crm';

// Comprehensive dictionary mapping field keys to human-readable labels
export const FIELD_LABELS: Record<string, string> = {
  // Client Fields
  fullName: 'Full Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  mobile: 'Mobile Number',
  phone: 'Phone Number',
  whatsapp: 'WhatsApp Number',
  email: 'Email Address',
  nationality: 'Nationality',
  gender: 'Gender',
  dob: 'Date of Birth',
  passportNo: 'Passport Number',
  passportNumber: 'Passport Number',
  passportExpiry: 'Passport Expiry Date',
  emiratesId: 'Emirates ID (EID)',
  emiratesIdExpiry: 'Emirates ID Expiry Date',
  visaUid: 'Unified ID (UID)',
  visaType: 'Visa Category / Type',
  visaExpiry: 'Visa Expiry Date',
  residentialAddress: 'Residential Address',
  companyId: 'Registered Company / Branch',
  companyName: 'Company Name',
  category: 'Client Category',
  type: 'Registration Type',
  status: 'Account Status',
  pricingTier: 'Pricing Tier (B2B / B2C)',
  discountType: 'Discount Model',
  discountValue: 'Discount Rate / Amount',
  customServiceRate: 'Custom Negotiated Rate',
  corporateDiscountPercent: 'Corporate Discount %',
  assignedAdminId: 'Assigned Account Manager',
  assignedEmployeeId: 'Primary Assigned PRO / Employee',
  assignedEmployeeIds: 'Assigned PROs / Team',
  assignedEmployeeName: 'Assigned PRO Name',
  currentStageId: 'Current Pipeline Stage ID',
  currentStageName: 'Pipeline Stage',
  paymentStatus: 'Payment Status',
  totalAmount: 'Total Dossier Value (AED)',
  paidAmount: 'Amount Paid (AED)',
  outstandingAmount: 'Outstanding Balance (AED)',
  tags: 'Tags & Badges',
  notesText: 'Remarks / Notes',

  // Lead Fields
  name: 'Lead / Prospect Name',
  source: 'Acquisition Source',
  stage: 'Sales Pipeline Stage',
  estimatedValue: 'Estimated Deal Value (AED)',
  priority: 'Priority Level',
  serviceInterested: 'Interested Service',
  company: 'Company / Business Name',
  notes: 'Lead Remarks',
  currentLocation: 'Current Location',
  city: 'City',
  country: 'Country',
  isJobLead: 'Candidate / Job Seeker Flag',
  jobType: 'Job Category',
  jobTitleInterest: 'Job Title of Interest',
  jobExperienceYears: 'Years of Experience',

  // Invoice Fields
  invoiceNumber: 'Invoice Number',
  issueDate: 'Issue Date',
  dueDate: 'Payment Due Date',
  subtotal: 'Subtotal Amount (AED)',
  vatAmount: 'VAT 5% Amount (AED)',
  discountAmount: 'Discount Amount (AED)',
  grandTotal: 'Grand Total (AED)',
  balanceDue: 'Balance Due (AED)',
  paymentMethod: 'Payment Mode',
  paymentTerms: 'Payment Terms',

  // Task Fields
  title: 'Task Title',
  description: 'Task Description',
  dueDateFormatted: 'Task Deadline',
  isUrgent: 'Urgent Flag',

  // Visa Application Fields
  applicantName: 'Applicant Full Name',
  targetCountry: 'Destination Country',
  visaTypeName: 'Visa Sub-type',
  governmentFees: 'Govt Fees (AED)',
  serviceFee: 'Service Fee (AED)',
  submissionDate: 'Submission Date',
  estimatedCompletionDate: 'Target Completion Date',
  remarks: 'Application Remarks',
};

// Keys to ignore from generating diff noise (internal IDs, identical timestamps, etc.)
const IGNORED_KEYS = new Set([
  'updatedAt',
  'createdAt',
  'changelog',
  'services',
  'calls',
  'comments',
  'stageHistory',
  'history',
  'avatar',
  'logo',
]);

/**
 * Format any value into a clean, human-readable string representation
 */
export function formatValueForDisplay(val: any, fieldKey?: string): string {
  if (val === null || val === undefined || val === '') {
    return '(Empty)';
  }

  if (typeof val === 'boolean') {
    return val ? 'Yes' : 'No';
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return '(None)';
    // If array of strings/primitives
    if (typeof val[0] === 'string' || typeof val[0] === 'number') {
      return val.join(', ');
    }
    return `${val.length} items`;
  }

  if (typeof val === 'number') {
    if (
      fieldKey?.toLowerCase().includes('amount') ||
      fieldKey?.toLowerCase().includes('total') ||
      fieldKey?.toLowerCase().includes('paid') ||
      fieldKey?.toLowerCase().includes('balance') ||
      fieldKey?.toLowerCase().includes('fee') ||
      fieldKey?.toLowerCase().includes('price') ||
      fieldKey?.toLowerCase().includes('value')
    ) {
      return `AED ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (fieldKey?.toLowerCase().includes('percent')) {
      return `${val}%`;
    }
    return val.toString();
  }

  if (typeof val === 'object') {
    return JSON.stringify(val);
  }

  const str = String(val).trim();
  if (!str) return '(Empty)';

  // Format ISO date strings nicely if detected
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(str)) {
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    } catch {}
  }

  return str;
}

/**
 * Compares two objects and computes an array of modified fields
 */
export function calculateObjectDiff(
  oldObj: Record<string, any>,
  newUpdates: Record<string, any>
): FieldChange[] {
  const changes: FieldChange[] = [];

  for (const key of Object.keys(newUpdates)) {
    if (IGNORED_KEYS.has(key)) continue;

    const oldVal = oldObj[key];
    const newVal = newUpdates[key];

    // Check if undefined
    if (newVal === undefined) continue;

    // Handle deep equality for arrays and primitives
    let isDifferent = false;
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      if (oldVal.length !== newVal.length) {
        isDifferent = true;
      } else {
        const sOld = JSON.stringify(oldVal);
        const sNew = JSON.stringify(newVal);
        isDifferent = sOld !== sNew;
      }
    } else if (typeof oldVal === 'object' && typeof newVal === 'object' && oldVal !== null && newVal !== null) {
      isDifferent = JSON.stringify(oldVal) !== JSON.stringify(newVal);
    } else {
      isDifferent = oldVal !== newVal;
    }

    if (isDifferent) {
      const label = FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      const displayOldValue = formatValueForDisplay(oldVal, key);
      const displayNewValue = formatValueForDisplay(newVal, key);

      // Don't add if both strings look identical after display formatting
      if (displayOldValue !== displayNewValue) {
        changes.push({
          field: key,
          label,
          oldValue: oldVal,
          newValue: newVal,
          displayOldValue,
          displayNewValue,
        });
      }
    }
  }

  return changes;
}

/**
 * Creates a structured ChangeLogEntry from diff calculation
 */
export function createChangeLogEntry(
  entityType: ChangeLogEntry['entityType'],
  entityId: string,
  entityName: string | undefined,
  changes: FieldChange[],
  currentUser: User,
  customAction?: ChangeLogEntry['action'],
  customSummary?: string
): ChangeLogEntry {
  let summary = customSummary;
  if (!summary) {
    if (changes.length === 1) {
      summary = `Updated ${changes[0].label} (${changes[0].displayOldValue} ➔ ${changes[0].displayNewValue})`;
    } else if (changes.length > 1) {
      const top3 = changes.slice(0, 3).map((c) => c.label).join(', ');
      const extra = changes.length > 3 ? ` and ${changes.length - 3} more fields` : '';
      summary = `Updated ${changes.length} fields: ${top3}${extra}`;
    } else {
      summary = `Modified ${entityType} details`;
    }
  }

  return {
    id: `cl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    entityId,
    entityType,
    entityName,
    action: customAction || 'update',
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    userEmail: currentUser.email,
    userAvatar: currentUser.avatar,
    timestamp: new Date().toISOString(),
    summary,
    changes,
  };
}
