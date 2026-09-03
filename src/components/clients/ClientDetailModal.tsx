import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Shield,
  FileText,
  DollarSign,
  CheckSquare,
  MessageSquare,
  PhoneCall,
  Calendar,
  Upload,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Building2,
  UserCheck,
  Send,
  Trash2,
  Handshake,
  Share2,
  Edit2,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  History,
  Mail,
  Sparkles,
  Eye,
  ExternalLink,
  Paperclip,
  Lock,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useGmail } from '../../context/GmailContext';
import { GmailComposerModal } from '../gmail/GmailComposerModal';
import { Client, DocumentItem, Invoice, InvoiceLineItem, WorkStage, Transaction, ServiceCategory } from '../../types/crm';
import { ChangeLogView } from '../common/ChangeLogView';
import { QuickCreateServiceModal } from '../services/QuickCreateServiceModal';

interface ClientDetailModalProps {
  clientId: string | null;
  onClose: () => void;
  onOpenInvoiceModal?: (clientId: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ clientId, onClose, onOpenInvoiceModal }) => {
  const {
    clients,
    companies,
    vendors,
    users,
    stages,
    serviceCategories,
    documents,
    invoices,
    transactions,
    tasks,
    currentUser,
    billingSettings,
    createInvoice,
    updateClient,
    updateServiceStage,
    addServiceToClient,
    uploadDocument,
    deleteDocument,
    updateDocumentStatus,
    addClientNote,
    deleteClientNote,
    addClientCallLog,
    reassignClient,
    deleteClient,
    recordPayment,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useCRM();

  const {
    isConnected: isGmailConnected,
    connectGmail,
    sendVisaStatusViaGmail,
    requestSendEmail,
    fetchMessages,
    messages: allGmailMessages,
    isLoadingMessages: isGmailLoading,
  } = useGmail();

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'documents' | 'payments' | 'transactions' | 'gmail' | 'notes' | 'calls' | 'tasks' | 'history'>('overview');
  const [isGmailComposerOpen, setIsGmailComposerOpen] = useState(false);
  const [gmailInitialSubject, setGmailInitialSubject] = useState('');
  const [gmailInitialBody, setGmailInitialBody] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [showStageModal, setShowStageModal] = useState(false);
  const [targetStageId, setTargetStageId] = useState('');
  const [stageRemarks, setStageRemarks] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Edit Client Details Modal
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    avatar: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    whatsapp: '',
    nationality: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    status: 'active' as 'active' | 'completed' | 'on_hold' | 'cancelled',
    passportNo: '',
    passportExpiry: '',
    emiratesId: '',
    emiratesIdExpiry: '',
    residentialAddress: '',
    companyId: '',
    vendorId: '',
    referredBy: '',
    pricingTier: 'b2b' as 'b2b' | 'b2c',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    corporateDiscountPercent: 0,
    customServiceRate: 0,
    assignedEmployeeIds: [] as string[],
  });

  // Helper for computing service default fee based on client settings
  const calculateDefaultServicePrice = (catId: string) => {
    const cat = serviceCategories.find((c) => c.id === catId);
    if (!cat) return 0;
    const baseB2C = cat.priceB2C ?? cat.defaultPrice ?? 0;
    const isDirect = !!client.isDirectRegistration || client.pricingTier === 'b2c' || (!client.companyId);
    if (isDirect) {
      return baseB2C;
    }
    if (client.customServiceRate !== undefined && client.customServiceRate > 0) {
      return client.customServiceRate;
    }
    const dType = client.discountType || company?.corporateDiscountType || 'percentage';
    const dVal = client.discountValue ?? (dType === 'fixed' ? (company?.corporateDiscountValue ?? 0) : (client.corporateDiscountPercent ?? company?.corporateDiscountPercent ?? 15));
    if (dType === 'fixed' && dVal > 0) {
      return Math.max(0, baseB2C - dVal);
    }
    if (dType === 'percentage' && dVal > 0) {
      const discount = Math.round(baseB2C * (dVal / 100));
      return Math.max(0, baseB2C - discount);
    }
    if (cat.priceB2B !== undefined && cat.priceB2B > 0) {
      return cat.priceB2B;
    }
    return baseB2C;
  };

  // Add Service Form State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceCatId, setNewServiceCatId] = useState(serviceCategories?.[0]?.id || '');
  const [newServicePrice, setNewServicePrice] = useState<number>(serviceCategories?.[0]?.defaultPrice || 0);

  // Note form
  const [noteText, setNoteText] = useState('');
  const [taggedUser, setTaggedUser] = useState('');
  const [noteCategory, setNoteCategory] = useState<'note' | 'call_log' | 'meeting' | 'followup' | 'email' | 'whatsapp'>('note');
  const [noteSentVia, setNoteSentVia] = useState<'none' | 'whatsapp' | 'email'>('none');

  // Call log form
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [callType, setCallType] = useState<'call' | 'meeting' | 'visit' | 'whatsapp'>('call');
  const [callSummary, setCallSummary] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [callNextDate, setCallNextDate] = useState('');

  // Document upload state
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('Passport');
  const [docExpiryDate, setDocExpiryDate] = useState('');
  const [docFileDataUrl, setDocFileDataUrl] = useState<string>('');
  const [docFileSizeText, setDocFileSizeText] = useState<string>('');
  const [docFileMimeType, setDocFileMimeType] = useState<string>('application/pdf');
  const [docIsDragging, setDocIsDragging] = useState(false);
  const [previewDossierDoc, setPreviewDossierDoc] = useState<DocumentItem | null>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  ];

  // Record payment state
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<Invoice['paymentMethod']>('Bank Transfer');
  const [payRef, setPayRef] = useState('');

  // Invoice state
  interface ClientInvoiceServiceLineItem {
    id: string;
    serviceCatId?: string;
    name: string;
    serviceFee: number;
    govFee: number;
  }
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [invServiceMode, setInvServiceMode] = useState<'catalog' | 'custom'>('catalog');
  const [invServiceCatId, setInvServiceCatId] = useState(serviceCategories[0]?.id || '');
  const [invCustomServiceName, setInvCustomServiceName] = useState('');
  const [invServiceFee, setInvServiceFee] = useState<number>(serviceCategories[0]?.defaultPrice || 3500);
  const [invGovFee, setInvGovFee] = useState<number>(serviceCategories[0]?.governmentFees || 2200);
  const [invoiceServiceLines, setInvoiceServiceLines] = useState<ClientInvoiceServiceLineItem[]>([]);
  const [invVatRate, setInvVatRate] = useState<number>(billingSettings?.vatRate ?? 5);
  const [invDueDate, setInvDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [invNotes, setInvNotes] = useState('');

  const handleAddServiceLine = (cat?: ServiceCategory) => {
    const targetCat = cat || serviceCategories[0];
    const newLine: ClientInvoiceServiceLineItem = {
      id: `cline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      serviceCatId: targetCat?.id,
      name: targetCat?.name || 'Corporate PRO Service',
      serviceFee: targetCat?.defaultPrice || 3500,
      govFee: targetCat?.governmentFees || 2200,
    };
    setInvoiceServiceLines((prev) => [...prev, newLine]);
  };

  const handleUpdateServiceLine = (
    id: string,
    field: 'serviceCatId' | 'name' | 'serviceFee' | 'govFee',
    value: any
  ) => {
    setInvoiceServiceLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        if (field === 'serviceCatId') {
          const cat = serviceCategories.find((c) => c.id === value);
          return {
            ...line,
            serviceCatId: value,
            name: cat ? cat.name : line.name,
            serviceFee: cat ? cat.defaultPrice : line.serviceFee,
            govFee: cat ? cat.governmentFees : line.govFee,
          };
        }
        return { ...line, [field]: value };
      })
    );
  };

  const handleRemoveServiceLine = (id: string) => {
    setInvoiceServiceLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  };

  // Quick Create Service state
  const [showQuickCreateService, setShowQuickCreateService] = useState(false);
  const [serviceTargetContext, setServiceTargetContext] = useState<'enrollment' | 'invoice'>('enrollment');

  const handleServiceCreated = (newService: ServiceCategory) => {
    if (serviceTargetContext === 'enrollment') {
      setNewServiceCatId(newService.id);
      const computedPrice = calculateDefaultServicePrice(newService.id);
      setNewServicePrice(computedPrice);
    } else {
      setInvServiceMode('catalog');
      setInvServiceCatId(newService.id);
      setInvServiceFee(newService.defaultPrice);
      setInvGovFee(newService.governmentFees);
      setInvoiceServiceLines((prev) => [
        ...prev,
        {
          id: `cline-${Date.now()}`,
          serviceCatId: newService.id,
          name: newService.name,
          serviceFee: newService.defaultPrice,
          govFee: newService.governmentFees,
        },
      ]);
    }
  };

  // Transaction state
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [txFormData, setTxFormData] = useState({
    type: 'deposit' as Transaction['type'],
    category: 'Client Advance Payment',
    amount: 1500,
    paymentMethod: 'Bank Transfer' as Transaction['paymentMethod'],
    date: new Date().toISOString().split('T')[0],
    status: 'completed' as Transaction['status'],
    notes: '',
  });

  if (!clientId) return null;
  const client = (clients || []).find((c) => c && c.id === clientId);
  if (!client) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Access Restricted</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              You are only authorized to access client profiles, billing data, and documents explicitly assigned to your account.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const clientDocs = (documents || []).filter((d) => d && d.clientId === client.id);
  const clientInvoices = (invoices || []).filter((i) => i && i.clientId === client.id);
  const clientTransactions = (transactions || []).filter((t) => t && t.clientId === client.id);
  const clientTasks = (tasks || []).filter((t) => t && t.clientId === client.id);
  const company = (companies || []).find((c) => c && c.id === client.companyId);
  const vendor = (vendors || []).find((v) => v && v.id === client.vendorId);

  const activeService = (client.services || []).find((s) => s && s.id === selectedServiceId) || (client.services || [])[0];

  const handleOpenEditClientModal = () => {
    setEditFormData({
      avatar: client.avatar || '',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      mobile: client.mobile || '',
      whatsapp: client.whatsapp || '',
      nationality: client.nationality || 'United Arab Emirates',
      gender: (client.gender as 'Male' | 'Female' | 'Other') || 'Male',
      status: (client.status as 'active' | 'completed' | 'on_hold' | 'cancelled') || 'active',
      passportNo: client.passportNo || '',
      passportExpiry: client.passportExpiry || '',
      emiratesId: client.emiratesId || '',
      emiratesIdExpiry: client.emiratesIdExpiry || '',
      residentialAddress: client.residentialAddress || '',
      companyId: client.companyId || (companies?.[0]?.id || 'comp-1'),
      vendorId: client.vendorId || '',
      referredBy: client.referredBy || '',
      pricingTier: client.pricingTier || (client.isDirectRegistration ? 'b2c' : 'b2b'),
      discountType: client.discountType || company?.corporateDiscountType || 'percentage',
      discountValue: client.discountValue ?? (company?.corporateDiscountValue || 0),
      corporateDiscountPercent: client.corporateDiscountPercent ?? (company?.corporateDiscountPercent || 15),
      customServiceRate: client.customServiceRate || 0,
      assignedEmployeeIds: client.assignedEmployeeIds || (client.assignedAdminId ? [client.assignedAdminId] : []),
    });
    setShowEditClientModal(true);
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setEditFormData((prev) => ({ ...prev, avatar: uploadEvent.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClientDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const selVendor = (vendors || []).find((v) => v && v.id === editFormData.vendorId);
    updateClient(client.id, {
      ...editFormData,
      fullName: `${(editFormData.firstName || '').trim()} ${(editFormData.lastName || '').trim()}`.trim() || client.fullName,
      vendorName: selVendor ? selVendor.name : undefined,
    });
    setShowEditClientModal(false);
  };

  const handleStageChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService || !targetStageId) return;

    updateServiceStage(client.id, activeService.id, targetStageId, stageRemarks, nextFollowUpDate || undefined);
    setShowStageModal(false);
    setStageRemarks('');
    setNextFollowUpDate('');
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceToClient(client.id, newServiceCatId, newServicePrice);
    setShowAddServiceModal(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addClientNote(
      client.id,
      noteText.trim(),
      taggedUser ? [taggedUser] : [],
      noteCategory,
      noteSentVia !== 'none' ? (noteSentVia as any) : undefined
    );

    // If sentVia is whatsapp or email, open quick client dispatch if requested
    if (noteSentVia === 'whatsapp' && (client.whatsapp || client.mobile)) {
      const cleanPhone = (client.whatsapp || client.mobile).replace(/[^0-9]/g, '');
      const encoded = encodeURIComponent(`Hello ${client.fullName},\n\nUpdate regarding your file (${client.refNo}):\n${noteText.trim()}\n\n- ADCS Team`);
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    }

    setNoteText('');
    setTaggedUser('');
    setNoteSentVia('none');
  };

  const handleAddCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callSummary.trim()) return;
    addClientCallLog(client.id, {
      type: callType,
      date: new Date().toISOString(),
      summary: callSummary.trim(),
      outcome: callOutcome.trim(),
      nextActionDate: callNextDate || undefined,
    });
    setShowCallLogModal(false);
    setCallSummary('');
    setCallOutcome('');
    setCallNextDate('');
  };

  const processDossierDocFile = (file: File) => {
    const sizeKB = file.size / 1024;
    const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
    setDocFileSizeText(sizeFormatted);
    setDocFileMimeType(file.type || 'application/pdf');
    if (!docName.trim()) {
      setDocName(file.name);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setDocFileDataUrl(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    uploadDocument({
      clientId: client.id,
      clientName: client.fullName,
      serviceId: activeService?.serviceId,
      serviceName: activeService?.serviceName,
      name: docName.trim(),
      category: docCategory,
      fileUrl: docFileDataUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: docFileMimeType || 'application/pdf',
      fileSize: docFileSizeText || '1.8 MB',
      expiryDate: docExpiryDate || undefined,
      status: 'pending',
    });
    setShowDocUploadModal(false);
    setDocName('');
    setDocExpiryDate('');
    setDocFileDataUrl('');
    setDocFileSizeText('');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || payAmount <= 0) return;
    recordPayment(selectedInvoiceId, payAmount, payMethod, payRef, 'Payment recorded via dossier');
    setShowPayModal(false);
  };

  const handleOpenCreateInvoiceModal = () => {
    const firstCat = serviceCategories[0];
    if (firstCat) {
      setInvServiceCatId(firstCat.id);
      setInvServiceFee(firstCat.defaultPrice || 3500);
      setInvGovFee(firstCat.governmentFees || 2200);
      setInvoiceServiceLines([
        {
          id: `cline-${Date.now()}-1`,
          serviceCatId: firstCat.id,
          name: firstCat.name,
          serviceFee: firstCat.defaultPrice || 3500,
          govFee: firstCat.governmentFees || 2200,
        },
      ]);
    } else {
      setInvoiceServiceLines([
        {
          id: `cline-${Date.now()}-1`,
          name: 'Corporate PRO & Legal Clearance Service',
          serviceFee: 3500,
          govFee: 2200,
        },
      ]);
    }
    setInvVatRate(billingSettings?.vatRate ?? 5);
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setInvDueDate(d.toISOString().split('T')[0]);
    setInvNotes('');
    setShowCreateInvoiceModal(true);
  };

  const handleCreateClientInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine effective service lines
    const effectiveLines =
      invServiceMode === 'custom' && invCustomServiceName.trim()
        ? [
            {
              id: `cline-custom-${Date.now()}`,
              name: invCustomServiceName.trim(),
              serviceFee: invServiceFee,
              govFee: invGovFee,
            },
          ]
        : invoiceServiceLines.length > 0
        ? invoiceServiceLines
        : [
            {
              id: `cline-default-${Date.now()}`,
              name: 'Corporate PRO & Legal Clearance Service',
              serviceFee: invServiceFee,
              govFee: invGovFee,
            },
          ];

    const totalServiceFee = effectiveLines.reduce((acc, l) => acc + (Number(l.serviceFee) || 0), 0);
    const totalGovFee = effectiveLines.reduce((acc, l) => acc + (Number(l.govFee) || 0), 0);
    const actualVatRate = invVatRate !== undefined && !isNaN(Number(invVatRate)) ? Math.max(0, Number(invVatRate)) : 0;
    const vatAmount = actualVatRate > 0 ? (totalServiceFee * actualVatRate) / 100 : 0;
    const subtotal = totalServiceFee;
    const grandTotal = subtotal + totalGovFee + vatAmount;

    const items: InvoiceLineItem[] = [];
    effectiveLines.forEach((line, idx) => {
      const sFee = Number(line.serviceFee) || 0;
      const gFee = Number(line.govFee) || 0;
      if (sFee > 0 || gFee === 0) {
        items.push({
          id: `item-${Date.now()}-${idx * 2 + 1}`,
          description: `${line.name} - Professional Agency & PRO Processing Fee`,
          quantity: 1,
          unitPrice: sFee,
          isGovernmentFee: false,
          total: sFee,
        });
      }
      if (gFee > 0) {
        items.push({
          id: `item-${Date.now()}-${idx * 2 + 2}`,
          description: `${line.name} - Government Official Pass-through Authority Fee`,
          quantity: 1,
          unitPrice: gFee,
          isGovernmentFee: true,
          total: gFee,
        });
      }
    });

    const finalServiceName =
      effectiveLines.map((l) => l.name).filter(Boolean).join(' + ') ||
      'Corporate PRO & Visa Service Dossier';
    const finalServiceId = effectiveLines[0]?.serviceCatId;

    createInvoice({
      clientId: client.id,
      clientName: client.fullName,
      clientEmail: client.email || '',
      clientPhone: client.mobile || (client as any).phone || '',
      clientAddress: client.residentialAddress || (client as any).address || 'Dubai, UAE',
      clientPassport: client.passportNo || '',
      companyId: client.companyId || companies[0]?.id || 'comp-1',
      companyName: company?.name || billingSettings?.companyName || 'ADCS Clearing LLC',
      serviceId: finalServiceId,
      serviceName: finalServiceName,
      subtotal,
      vatRate: actualVatRate,
      vatAmount,
      governmentFees: totalGovFee,
      grandTotal,
      amountPaid: 0,
      balanceAmount: grandTotal,
      paymentMethod: 'Bank Transfer',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'unpaid',
      notes: invNotes,
      items,
    });

    setShowCreateInvoiceModal(false);
  };

  // Transaction Handlers
  const handleOpenAddTxModal = () => {
    setEditingTransaction(null);
    setTxFormData({
      type: 'deposit',
      category: 'Client Advance Payment',
      amount: 1500,
      paymentMethod: 'Bank Transfer',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: '',
    });
    setShowAddTxModal(true);
  };

  const handleOpenEditTxModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxFormData({
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      date: tx.date,
      status: tx.status,
      notes: tx.notes || '',
    });
    setShowAddTxModal(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (txFormData.amount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type: txFormData.type,
        category: txFormData.category,
        amount: Number(txFormData.amount),
        paymentMethod: txFormData.paymentMethod,
        date: txFormData.date,
        status: txFormData.status,
        notes: txFormData.notes,
      });
    } else {
      addTransaction({
        clientId: client.id,
        clientName: client.fullName,
        companyId: client.companyId,
        companyName: company?.name || 'ADCS Group',
        serviceId: activeService?.id,
        serviceName: activeService?.serviceName,
        type: txFormData.type,
        category: txFormData.category,
        amount: Number(txFormData.amount),
        paymentMethod: txFormData.paymentMethod,
        date: txFormData.date,
        status: txFormData.status,
        notes: txFormData.notes,
      });
    }

    setShowAddTxModal(false);
  };

  const totalDeposits = clientTransactions
    .filter((t) => t.type === 'deposit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDisbursements = clientTransactions
    .filter((t) => t.type !== 'deposit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in">
        {/* Header Profile Dossier Banner */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={client.avatar}
              alt={client.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{client.fullName || `${client.firstName || ''} ${client.lastName || ''}`}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {client.refNo || 'REF-CLIENT'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                  {(client.paymentStatus || 'unpaid').replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{client.nationality || 'UAE Resident'}</span>
                <span>&bull;</span>
                <span>{company ? company.name : 'Master Group'}</span>
                {client.vendorName && (
                  <>
                    <span>&bull;</span>
                    <span className="text-indigo-300 font-medium flex items-center gap-1">
                      <Handshake className="w-3 h-3" />
                      Partner: {client.vendorName}
                    </span>
                  </>
                )}
                {client.referredBy && (
                  <>
                    <span>&bull;</span>
                    <span className="text-purple-300 font-medium">
                      Ref: {client.referredBy}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Outstanding Balance
              </span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                AED {(client.outstandingAmount ?? 0).toLocaleString()}
              </div>
            </div>
            <button
              onClick={handleOpenEditClientModal}
              title="Edit Client Info"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            Client Profile
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction History ({clientTransactions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            Services & Stages ({(client.services || []).length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            Documents ({clientDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            Invoices ({clientInvoices.length})
          </button>
          {currentUser.role !== 'client' && (
            <>
              <button
                onClick={() => {
                  setActiveTab('gmail');
                  fetchMessages(undefined, client.email);
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'gmail'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Communications ({allGmailMessages.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'notes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                Internal Notes ({(client.notes || []).length})
              </button>
              <button
                onClick={() => setActiveTab('calls')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'calls'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                Call Logs ({(client.calls || []).length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'tasks'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                Tasks ({clientTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <History className="w-3.5 h-3.5 text-blue-500" />
                <span>Audit & Change Log ({client.changelog?.length || 0})</span>
              </button>
            </>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-xs text-slate-500 font-medium">Passport Validity</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {client.passportNo || 'N/A'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Expiry Date: {client.passportExpiry || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-xs text-slate-500 font-medium">Emirates ID Details</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {client.emiratesId || 'Not registered'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Expiry Date: {client.emiratesIdExpiry || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="text-xs text-slate-500 font-medium">Current Work Stage</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {client.currentStageName || 'Application Processing'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Status: {(client.paymentStatus || 'unpaid').toUpperCase()}</p>
                </div>
              </div>

              {/* Full Details List */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Full Digital Profile Data
                  </h3>
                  <button
                    onClick={handleOpenEditClientModal}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile Data</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400">Mobile Phone:</span>
                    <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5">{client.mobile}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">WhatsApp:</span>
                    <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5">{client.whatsapp}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email Address:</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{client.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Date of Birth:</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{client.dob} ({client.gender})</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Company Branch:</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {company ? company.name : 'Master Enterprise Group'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Vendor / External Partner:</span>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {client.vendorName || (vendor ? vendor.name : 'None / In-house')}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Referred By:</span>
                    <p className="font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                      {client.referredBy || 'Direct / Walk-in'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Residential Address:</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {client.residentialAddress || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Assigned Branch Admin:</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {users.find((u) => u.id === client.assignedAdminId)?.name || 'Admin'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[11px]">Pricing Tier & Terms:</span>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        client.pricingTier === 'b2c' || client.isDirectRegistration || !client.companyId
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {client.pricingTier === 'b2c' || client.isDirectRegistration || !client.companyId ? 'B2C Direct Rate' : 'Corporate B2B Rate'}
                      </span>
                      {client.customServiceRate ? (
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          (Custom: AED {client.customServiceRate.toLocaleString()})
                        </span>
                      ) : (client.discountType === 'fixed' && (client.discountValue || company?.corporateDiscountValue)) ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          (AED {(client.discountValue ?? company?.corporateDiscountValue ?? 0).toLocaleString()} Fixed OFF)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ({client.corporateDiscountPercent ?? company?.corporateDiscountPercent ?? 15}% OFF)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Staff & Agents:</span>
                      {(currentUser.role === 'master' || currentUser.role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditClientModal()}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          + Manage Staff
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {client.assignedEmployeeIds && client.assignedEmployeeIds.length > 0 ? (
                        client.assignedEmployeeIds.map((empId) => {
                          const emp = users.find((u) => u.id === empId);
                          return (
                            <span
                              key={empId}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              <span>{emp?.name || empId}</span>
                              <span className="text-[10px] text-blue-500 capitalize">({emp?.role || 'Staff'})</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-400 italic text-xs">No employees or agents assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete / Danger zone for Master/Admin */}
              {(currentUser.role === 'master' || currentUser.role === 'admin') && (
                <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Delete Client Dossier</h4>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400">
                      Permanently remove this client and linked files from the system.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to permanently delete ${client.fullName}? This will remove all associated documents, tasks, and invoices from cloud and local storage.`)) {
                        deleteClient(client.id);
                        onClose();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Client</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Transaction History with Full CRUD */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Total Deposits Collected</span>
                  <div className="text-lg font-bold text-emerald-600 font-mono mt-1">
                    AED {totalDeposits.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Disbursements & Fees Paid</span>
                  <div className="text-lg font-bold text-rose-600 font-mono mt-1">
                    AED {totalDisbursements.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Total Transactions Count</span>
                  <div className="text-lg font-bold text-blue-600 font-mono mt-1">
                    {clientTransactions.length} Records
                  </div>
                </div>
              </div>

              {/* Transactions Header & Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Financial Transaction Ledger</h3>
                  <p className="text-xs text-slate-500">Record payments, government vouchers, refunds, and clearances</p>
                </div>

                <button
                  onClick={handleOpenAddTxModal}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Transaction</span>
                </button>
              </div>

              {/* Transactions Summary Totals Strip */}
              {clientTransactions.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                    Client Ledger Totals ({clientTransactions.length} records)
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                      <span className="text-[10px] text-slate-500 uppercase">Inflow:</span>
                      <span className="font-mono">+AED {clientTransactions.filter(t => ['deposit', 'service_fee', 'typing_fee', 'vat_payment'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/60 font-semibold">
                      <span className="text-[10px] text-slate-500 uppercase">Outflow:</span>
                      <span className="font-mono">-AED {clientTransactions.filter(t => !['deposit', 'service_fee', 'typing_fee', 'vat_payment'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 text-white px-3 py-1 rounded-lg font-semibold shadow-xs">
                      <span className="text-[10px] text-slate-300 uppercase">Net Balance:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        AED {(
                          clientTransactions.filter(t => ['deposit', 'service_fee', 'typing_fee', 'vat_payment'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0) -
                          clientTransactions.filter(t => !['deposit', 'service_fee', 'typing_fee', 'vat_payment'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions List */}
              <div className="space-y-3">
                {clientTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                        }`}
                      >
                        {tx.type === 'deposit' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{tx.category}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {tx.transactionNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              tx.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {tx.date} &bull; Method: {tx.paymentMethod} &bull; Recorded by: {tx.recordedByUserName}
                        </p>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            {tx.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-sm font-bold font-mono ${
                            tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {tx.type === 'deposit' ? '+' : '-'} AED {tx.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block capitalize">{tx.type}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditTxModal(tx)}
                          title="Edit Transaction"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete transaction ${tx.transactionNumber}?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          title="Delete Transaction"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {clientTransactions.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Transaction Records Yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Record client retainer deposits, government fees, and expenses.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Services & Work Stages */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered Client Services</h3>
                <button
                  onClick={() => {
                    const initialCatId = serviceCategories?.[0]?.id || '';
                    setNewServiceCatId(initialCatId);
                    setNewServicePrice(calculateDefaultServicePrice(initialCatId));
                    setShowAddServiceModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach New Service</span>
                </button>
              </div>

              {(client.services || []).map((srv) => (
                <div
                  key={srv.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{srv.serviceName}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                          {srv.referenceNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assigned Officer: {srv.assignedEmployeeName} &bull; Target Date: {srv.targetCompletionDate}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedServiceId(srv.id);
                        setTargetStageId(srv.currentStageId || stages?.[0]?.id || 'stage-1');
                        setShowStageModal(true);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Advance Work Stage</span>
                    </button>
                  </div>

                  {/* Stage History Timeline */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Stage Timeline</h5>
                    <div className="space-y-2">
                      {(srv.stageHistory || []).map((sh, idx) => (
                        <div
                          key={sh.id || idx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-blue-600">{sh.toStage || 'Processing'}</span>
                            {sh.remarks && <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{sh.remarks}</p>}
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {sh.timestamp ? new Date(sh.timestamp).toLocaleDateString() : 'Recent'} by {sh.updatedByUserName || 'Staff'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Uploaded Verification Documents</h3>
                  <p className="text-xs text-slate-500">Official government submissions, passports, visas, and clearances</p>
                </div>
                <button
                  onClick={() => {
                    setDocFileDataUrl('');
                    setDocFileSizeText('');
                    setShowDocUploadModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{doc.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              doc.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : doc.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {doc.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Category: {doc.category} &bull; Size: {doc.fileSize} &bull; By: {doc.uploadedByName}
                      </p>
                      {doc.expiryDate && (
                        <p className="text-[11px] text-amber-600 font-mono mt-0.5 font-semibold">
                          Government Expiry: {doc.expiryDate}
                        </p>
                      )}
                      {doc.remarks && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg mt-2 border border-slate-200 dark:border-slate-800">
                          {doc.remarks}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewDossierDoc(doc)}
                          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <a
                          href={doc.fileUrl}
                          download={doc.name}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-600 dark:text-slate-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>

                      <div className="flex gap-1.5">
                        {doc.status !== 'approved' && (
                          <button
                            onClick={() => updateDocumentStatus(doc.id, 'approved', 'Verified and compliant')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {doc.status !== 'rejected' && (
                          <button
                            onClick={() => {
                              const rem = prompt('Enter rejection reason for client:');
                              if (rem) updateDocumentStatus(doc.id, 'rejected', rem);
                            }}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {clientDocs.length === 0 && (
                  <div className="col-span-2 p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Documents Uploaded Yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">Upload client passports, Emirates IDs, or visa scans above.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Invoices */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invoices & Financial Records</h3>
                  <p className="text-xs text-slate-500">
                    Total: AED {(client.totalAmount ?? 0).toLocaleString()} &bull; Paid: AED {(client.paidAmount ?? 0).toLocaleString()} &bull; Outstanding: AED {(client.outstandingAmount ?? 0).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateInvoiceModal}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Invoice</span>
                </button>
              </div>

              <div className="space-y-3">
                {clientInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {inv.status || 'pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{inv.serviceName}</p>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-3">
                        <span>Total: AED {(inv.grandTotal ?? 0).toLocaleString()}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-600 font-semibold">Paid: AED {(inv.amountPaid ?? 0).toLocaleString()}</span>
                        <span>&bull;</span>
                        <span className="text-rose-600 font-semibold">Balance: AED {(inv.balanceAmount ?? 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(inv.balanceAmount ?? 0) > 0 && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            setPayAmount(inv.balanceAmount || 0);
                            setShowPayModal(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Communications */}
          {activeTab === 'gmail' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>Client Communications ({client.email})</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Logged email notifications, UAE Visa status updates, and correspondence history
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await sendVisaStatusViaGmail(client.id);
                      if (res.success && res.emailDetails) {
                        requestSendEmail(
                          {
                            to: res.emailDetails.to,
                            subject: res.emailDetails.subject,
                            body: res.emailDetails.body,
                          },
                          client.fullName
                        );
                      } else {
                        alert(res.error || 'Failed to generate visa status update.');
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Send Visa Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGmailInitialSubject(`Follow-up regarding ${client.fullName} (${client.refNo})`);
                      setGmailInitialBody(`Dear ${client.fullName},\n\n`);
                      setIsGmailComposerOpen(true);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Compose Email</span>
                  </button>

                  <a
                    href={`mailto:${client.email}?subject=${encodeURIComponent(`Regarding ${client.fullName} - ${client.refNo}`)}`}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mail App</span>
                  </a>
                </div>
              </div>

              {/* Messages list related to this client */}
              {isGmailLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading communications...</div>
              ) : (
                <div className="space-y-2.5">
                  {allGmailMessages.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      No communications currently logged for {client.email}. Click "Compose Email" or "Send Visa Status" to initiate contact.
                    </div>
                  ) : (
                    allGmailMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs space-y-1 hover:border-blue-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {msg.subject || '(No Subject)'}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {Boolean(msg.hasAttachment || (msg.attachments && msg.attachments.length > 0)) && (
                              <span className="text-blue-500 flex items-center gap-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                <Paperclip className="w-2.5 h-2.5" />
                                {msg.attachments?.length || 1} file(s)
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          From: {msg.from} &bull; To: {msg.to}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-[11px] pt-1 leading-relaxed">
                          {msg.snippet}
                        </p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="pt-2 flex items-center gap-2 flex-wrap">
                            {msg.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.dataUrl || '#'}
                                download={att.name}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700/60 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-[10px] font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors"
                              >
                                <Paperclip className="w-3 h-3 text-blue-500" />
                                <span className="truncate max-w-[140px]">{att.name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Team Collaboration & Notes Log:</strong> Record internal memos, follow-ups, meeting summaries, or dispatch updates directly to client.
                </span>
              </div>

              <form onSubmit={handleAddNote} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Note Classification / Type
                    </label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as any)}
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="note">Internal Memo / Note</option>
                      <option value="followup">Client Follow-Up Required</option>
                      <option value="call_log">Phone Call Record</option>
                      <option value="meeting">Physical / Zoom Meeting</option>
                      <option value="whatsapp">WhatsApp Note / Dispatch</option>
                      <option value="email">Email Note / Dispatch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Send Copy to Client?
                    </label>
                    <select
                      value={noteSentVia}
                      onChange={(e) => setNoteSentVia(e.target.value as any)}
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="none">Internal only (Do not send to client)</option>
                      <option value="whatsapp">Open WhatsApp with note to client</option>
                      <option value="email">Log as Email communication</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type internal note, government query feedback, or team memo..."
                  className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />

                <div className="flex items-center justify-between">
                  <select
                    value={taggedUser}
                    onChange={(e) => setTaggedUser(e.target.value)}
                    className="p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="">Tag team member (optional)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        @{u.name} ({u.title})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Record Note</span>
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {(client.notes || []).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    No notes recorded yet for this client.
                  </div>
                ) : (
                  (client.notes || []).map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{note.userName || 'Staff Member'}</span>
                          {note.type && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">
                              {note.type.replace('_', ' ')}
                            </span>
                          )}
                          {note.sentVia && (
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                              &bull; Sent via {note.sentVia}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                          {(currentUser?.role === 'master' || currentUser?.role === 'admin' || currentUser?.id === note.userId) && (
                            <button
                              onClick={() => deleteClientNote(client.id, note.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 7: Calls */}
          {activeTab === 'calls' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Communication & Visit Logs</h3>
                <button
                  onClick={() => setShowCallLogModal(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Log Call / Meeting</span>
                </button>
              </div>

              <div className="space-y-3">
                {(client.calls || []).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    No communication logs recorded yet for this client.
                  </div>
                ) : (
                  (client.calls || []).map((call) => (
                    <div
                      key={call.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span className="capitalize">{call.type} Logged by {call.userName || 'Staff'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {call.date ? new Date(call.date).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{call.summary}</p>
                      {call.outcome && <div className="text-[11px] text-emerald-600 font-medium mt-1">Outcome: {call.outcome}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 8: Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tasks Linked to Client</h3>
              <div className="space-y-2.5">
                {clientTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Assigned to: {t.assignedEmployeeName} &bull; Due: {t.dueDate}
                      </p>
                    </div>
                    <span className="text-xs capitalize px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 9: History & Audit Log */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <ChangeLogView
                changelog={client.changelog || []}
                entityTitle={client.fullName || `${client.firstName || ''} ${client.lastName || ''}`}
                entityType="Client Profile"
              />
            </div>
          )}
        </div>

        {/* Edit Client Profile Modal */}
        {showEditClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl animate-in fade-in my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Client Information</h3>
                  <p className="text-xs text-slate-500">Update company affiliation, vendor partner, and identity data</p>
                </div>
                <button onClick={() => setShowEditClientModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClientDetails} className="space-y-4 pt-4 text-xs max-h-[70vh] overflow-y-auto">
                {/* Photo / Avatar Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <label className="block font-bold text-slate-900 dark:text-white mb-2">
                    Client Profile Photo / Avatar
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative group">
                      <img
                        src={editFormData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt="Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileSelect}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-slate-500">or enter image URL / pick preset</span>
                      </div>
                      <input
                        type="url"
                        value={editFormData.avatar ?? ''}
                        onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Preset Avatars */}
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1.5">Quick Avatar Presets:</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {presetAvatars.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, avatar: url })}
                          className={`w-8 h-8 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            editFormData.avatar === url ? 'border-blue-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.firstName ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.lastName ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={editFormData.nationality ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select
                      value={editFormData.gender ?? 'Male'}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company Entity *</label>
                    <select
                      value={editFormData.companyId ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, companyId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor / Partner</label>
                    <select
                      value={editFormData.vendorId ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, vendorId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <option value="">-- None / In-house --</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Referred By</label>
                    <input
                      type="text"
                      value={editFormData.referredBy ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, referredBy: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={editFormData.mobile ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={editFormData.whatsapp ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Passport Number</label>
                    <input
                      type="text"
                      value={editFormData.passportNo ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, passportNo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Passport Expiry</label>
                    <input
                      type="date"
                      value={editFormData.passportExpiry ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, passportExpiry: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Emirates ID</label>
                    <input
                      type="text"
                      value={editFormData.emiratesId ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, emiratesId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Emirates ID Expiry</label>
                    <input
                      type="date"
                      value={editFormData.emiratesIdExpiry ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, emiratesIdExpiry: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Residential Address in UAE</label>
                    <input
                      type="text"
                      value={editFormData.residentialAddress ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, residentialAddress: e.target.value })}
                      placeholder="e.g. Marina Gate Tower 1, Apt 1402, Dubai Marina, Dubai"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  {/* Pricing Tier & Dynamic B2B Discount Customization */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Client Pricing Tier & Dynamic B2B Rate</span>
                      </label>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                        Finance & Service Catalogue
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Pricing Category / Tier
                        </label>
                        <select
                          value={editFormData.pricingTier}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              pricingTier: e.target.value as 'b2b' | 'b2c',
                            })
                          }
                          className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <option value="b2b">Corporate B2B (Discounted / Custom Rates)</option>
                          <option value="b2c">Direct Client B2C (Standard Public Rates)</option>
                        </select>
                      </div>

                      {editFormData.pricingTier === 'b2b' && (
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            B2B Discount Form
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, discountType: 'percentage' })}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                editFormData.discountType === 'percentage'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              Percentage (%)
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, discountType: 'fixed' })}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                editFormData.discountType === 'fixed'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              Fix Amount (AED)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {editFormData.pricingTier === 'b2b' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            {editFormData.discountType === 'fixed' ? 'Fixed Discount (AED)' : 'Percentage Discount (%)'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editFormData.discountValue || (editFormData.discountType === 'fixed' ? 0 : editFormData.corporateDiscountPercent || 0)}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditFormData({
                                ...editFormData,
                                discountValue: val,
                                corporateDiscountPercent: editFormData.discountType === 'percentage' ? val : editFormData.corporateDiscountPercent,
                              });
                            }}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs font-semibold"
                            placeholder={editFormData.discountType === 'fixed' ? 'e.g. 500' : 'e.g. 15'}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Custom Client Service Rate (AED) <span className="text-slate-400 font-normal">(Optional fixed rate)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editFormData.customServiceRate || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, customServiceRate: Number(e.target.value) || 0 })}
                            placeholder="e.g. 1800 (Overrides catalog)"
                            className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Staff Assignment for Client */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-800 dark:text-slate-200">
                        Assigned Case Officers / Staff & Agents
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {editFormData.assignedEmployeeIds.length} Assigned
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <p className="text-[11px] text-slate-500">
                        Check all employees/agents who have permission to view, manage, and process this client dossier:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                        {(users || [])
                          .filter((u) => u && (u.role === 'employee' || u.role === 'agent' || u.role === 'admin' || u.role === 'master'))
                          .map((u) => {
                            const isSelected = editFormData.assignedEmployeeIds.includes(u.id);
                            return (
                              <button
                                type="button"
                                key={u.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setEditFormData({
                                      ...editFormData,
                                      assignedEmployeeIds: editFormData.assignedEmployeeIds.filter((id) => id !== u.id),
                                    });
                                  } else {
                                    setEditFormData({
                                      ...editFormData,
                                      assignedEmployeeIds: [...editFormData.assignedEmployeeIds, u.id],
                                    });
                                  }
                                }}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs truncate">{u.name}</p>
                                  <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditClientModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add / Edit Transaction */}
        {showAddTxModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingTransaction ? 'Edit Transaction Record' : 'Record Client Transaction'}
                </h3>
                <button onClick={() => setShowAddTxModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTransaction} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Transaction Type</label>
                  <select
                    value={txFormData.type}
                    onChange={(e) => setTxFormData({ ...txFormData, type: e.target.value as Transaction['type'] })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="deposit">Deposit (Client Payment Received)</option>
                    <option value="government_fee">Government Pass-through Fee</option>
                    <option value="expense">Vendor / Operational Expense</option>
                    <option value="refund">Refund to Client</option>
                    <option value="withdrawal">Withdrawal / Payout</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category Description *</label>
                  <input
                    type="text"
                    required
                    value={txFormData.category}
                    onChange={(e) => setTxFormData({ ...txFormData, category: e.target.value })}
                    placeholder="e.g. Visa Retainer Deposit / Medical Typing Fee"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (AED) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={txFormData.amount}
                      onChange={(e) => setTxFormData({ ...txFormData, amount: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={txFormData.date}
                      onChange={(e) => setTxFormData({ ...txFormData, date: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                    <select
                      value={txFormData.paymentMethod}
                      onChange={(e) => setTxFormData({ ...txFormData, paymentMethod: e.target.value as Transaction['paymentMethod'] })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Online Portal">Online Portal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={txFormData.status}
                      onChange={(e) => setTxFormData({ ...txFormData, status: e.target.value as Transaction['status'] })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Reference Notes</label>
                  <textarea
                    rows={2}
                    value={txFormData.notes}
                    onChange={(e) => setTxFormData({ ...txFormData, notes: e.target.value })}
                    placeholder="Bank reference number, voucher code, receipt memo..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddTxModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                  >
                    {editingTransaction ? 'Update Record' : 'Save Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Advance Stage Modal */}
        {showStageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Advance Work Stage</h3>
              <p className="text-xs text-slate-500 mb-4">
                Move service to the next government/processing milestone and record remarks.
              </p>

              <form onSubmit={handleStageChangeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Stage *
                  </label>
                  <select
                    value={targetStageId}
                    onChange={(e) => setTargetStageId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    {stages.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Government Officer Remarks / Status Update *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={stageRemarks}
                    onChange={(e) => setStageRemarks(e.target.value)}
                    placeholder="e.g. ICP entry permit issued, biometrics appointment scheduled for tomorrow..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Next Action / Milestone Target Date
                  </label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowStageModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Update Stage & Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Attach Service */}
        {showAddServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Attach Service Package</h3>
              <form onSubmit={handleAddServiceSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Select Catalog Service *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceTargetContext('enrollment');
                        setShowQuickCreateService(true);
                      }}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Not found? Create Service</span>
                    </button>
                  </div>
                  <select
                    value={newServiceCatId}
                    onChange={(e) => {
                      if (e.target.value === '__create_new__') {
                        setServiceTargetContext('enrollment');
                        setShowQuickCreateService(true);
                        return;
                      }
                      setNewServiceCatId(e.target.value);
                      const computedPrice = calculateDefaultServicePrice(e.target.value);
                      setNewServicePrice(computedPrice);
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    {serviceCategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Catalog: AED {(s.priceB2C ?? s.defaultPrice).toLocaleString()})
                      </option>
                    ))}
                    <option value="__create_new__" className="font-bold text-blue-600">
                      + Not found? Create New Service in Catalog...
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Service Fee (AED) *
                  </label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Attach Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Upload Document */}
        {showDocUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Client Document</h3>
                <button onClick={() => setShowDocUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadDoc} className="space-y-4 pt-3">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDocIsDragging(true);
                  }}
                  onDragLeave={() => setDocIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDocIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processDossierDocFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => docFileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                    docIsDragging
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : docFileDataUrl
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processDossierDocFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  {docFileDataUrl ? (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{docName || 'File Selected'}</p>
                      <p className="text-[11px] text-slate-500">File size: {docFileSizeText} &bull; Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-80" />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Drag and drop file here, or <span className="text-blue-600 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Supports PDF, JPG, PNG, DOC up to 15MB</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document Title / Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Attested Degree Certificate / Valid Passport Scan"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value as DocumentItem['category'])}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Passport">Passport</option>
                      <option value="Emirates ID">Emirates ID</option>
                      <option value="Trade License">Trade License</option>
                      <option value="Visa Copy">Visa Copy</option>
                      <option value="Tenancy Contract">Tenancy Contract</option>
                      <option value="Educational Certificate">Educational Certificate</option>
                      <option value="Medical Certificate">Medical Certificate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={docExpiryDate}
                      onChange={(e) => setDocExpiryDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowDocUploadModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20"
                  >
                    Upload to Dossier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDossierDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{previewDossierDoc.name}</h3>
                    <p className="text-xs text-slate-500">
                      Category: {previewDossierDoc.category} &bull; Uploaded by {previewDossierDoc.uploadedByName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewDossierDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 min-h-[300px] max-h-[60vh] overflow-auto bg-slate-100 dark:bg-slate-950 rounded-xl p-4 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                {previewDossierDoc.fileUrl.startsWith('data:image/') || previewDossierDoc.fileType.startsWith('image/') ? (
                  <img
                    src={previewDossierDoc.fileUrl}
                    alt={previewDossierDoc.name}
                    className="max-h-[50vh] max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{previewDossierDoc.name}</p>
                    <p className="text-xs text-slate-500 mt-1">PDF / Secure Document File ({previewDossierDoc.fileSize})</p>
                    <a
                      href={previewDossierDoc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download / Open in New Window</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  Status: <strong className="uppercase font-bold">{previewDossierDoc.status}</strong>
                </span>
                <button
                  onClick={() => setPreviewDossierDoc(null)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Record Payment */}
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Record Payment</h3>
              <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount Paid (AED) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as Invoice['paymentMethod'])}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online Portal">Online Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Transaction / Reference Number
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="e.g. TX-984210"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Confirm Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Call Log */}
        {showCallLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Log Communication</h3>
              <form onSubmit={handleAddCall} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Interaction Type
                  </label>
                  <select
                    value={callType}
                    onChange={(e) => setCallType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Conversation</option>
                    <option value="meeting">In-Person Meeting</option>
                    <option value="visit">Government Authority Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Summary Notes *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={callSummary}
                    onChange={(e) => setCallSummary(e.target.value)}
                    placeholder="Key discussion points, client questions, or officer instructions..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Outcome / Next Step
                  </label>
                  <input
                    type="text"
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                    placeholder="e.g. Client agreed to pay balance tomorrow"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCallLogModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Tax Invoice Modal for Client */}
        {showCreateInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <span>Generate Invoice for {client.fullName}</span>
                </h3>
                <button onClick={() => setShowCreateInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClientInvoiceSubmit} className="space-y-4 pt-4">
                {/* Services & Line Items Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white">
                        Services & Line Items *
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Add services from catalog, select multiple packages, or define bespoke items
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setServiceTargetContext('invoice');
                          setShowQuickCreateService(true);
                        }}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create Service</span>
                      </button>
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                        <button
                          type="button"
                          onClick={() => setInvServiceMode('catalog')}
                          className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                            invServiceMode === 'catalog'
                              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                              : 'text-slate-500'
                          }`}
                        >
                          Catalog
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvServiceMode('custom')}
                          className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                            invServiceMode === 'custom'
                              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                              : 'text-slate-500'
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Popular Services Quick-Add Chips */}
                  {serviceCategories.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Quick Add Popular Services:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {serviceCategories.slice(0, 5).map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setInvServiceMode('catalog');
                              handleAddServiceLine(cat);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 text-blue-500" />
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">AED {cat.defaultPrice}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {invServiceMode === 'catalog' ? (
                    <div className="space-y-2.5">
                      {invoiceServiceLines.map((line, index) => (
                        <div
                          key={line.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              Service Item #{index + 1}
                            </span>
                            {invoiceServiceLines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveServiceLine(line.id)}
                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                title="Remove service line"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                              Choose Service from Catalog
                            </label>
                            <select
                              value={line.serviceCatId || ''}
                              onChange={(e) => {
                                if (e.target.value === '__create_new__') {
                                  setServiceTargetContext('invoice');
                                  setShowQuickCreateService(true);
                                  return;
                                }
                                handleUpdateServiceLine(line.id, 'serviceCatId', e.target.value);
                              }}
                              className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="" disabled>-- Select a Service --</option>
                              {serviceCategories.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} (Agency: AED {s.defaultPrice.toLocaleString()} + Gov: AED {s.governmentFees.toLocaleString()})
                                </option>
                              ))}
                              <option value="__create_new__" className="font-bold text-blue-600">
                                + Create New Service in Catalog...
                              </option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                                Agency Service Fee (AED) *
                              </label>
                              <input
                                type="number"
                                min="0"
                                required
                                value={line.serviceFee}
                                onChange={(e) =>
                                  handleUpdateServiceLine(line.id, 'serviceFee', Math.max(0, Number(e.target.value)))
                                }
                                className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                                Pass-through Gov Fees (AED)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={line.govFee}
                                onChange={(e) =>
                                  handleUpdateServiceLine(line.id, 'govFee', Math.max(0, Number(e.target.value)))
                                }
                                className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddServiceLine()}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-500" />
                          <span>Add Another Service to Invoice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setServiceTargetContext('invoice');
                            setShowQuickCreateService(true);
                          }}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Create Service in Catalog</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Custom Service Description *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Expedited PRO Submission & Legal Visa Stamping"
                          value={invCustomServiceName}
                          onChange={(e) => setInvCustomServiceName(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Agency Service Fee (AED) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={invServiceFee}
                            onChange={(e) => setInvServiceFee(Math.max(0, Number(e.target.value)))}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Pass-through Gov Fees (AED)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={invGovFee}
                            onChange={(e) => setInvGovFee(Math.max(0, Number(e.target.value)))}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* VAT Option Section (Non-Mandatory / Optional - Allows 0%) */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white">
                        UAE VAT Option (Non-Mandatory / Optional)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Choose 0% for tax-exempt/freezone clients, or apply standard 5% VAT
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        invVatRate === 0
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {invVatRate === 0 ? '0% VAT Exempt' : `${invVatRate}% Taxable`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setInvVatRate(0)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                        invVatRate === 0
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      0% VAT (Exempt)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvVatRate(5)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                        invVatRate === 5
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      5% Standard UAE VAT
                    </button>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Custom %"
                        value={invVatRate}
                        onChange={(e) => setInvVatRate(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                        className="w-full py-2 px-3 pr-7 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-mono text-center font-bold"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Due Date & Remarks */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={invDueDate}
                      onChange={(e) => setInvDueDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Invoice Notes / Reference
                    </label>
                    <input
                      type="text"
                      value={invNotes}
                      onChange={(e) => setInvNotes(e.target.value)}
                      placeholder="e.g. Contract Retainer Payment"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Calculation Summary */}
                {(() => {
                  const effectiveLines =
                    invServiceMode === 'custom' && invCustomServiceName.trim()
                      ? [{ name: invCustomServiceName, serviceFee: invServiceFee, govFee: invGovFee }]
                      : invoiceServiceLines.length > 0
                      ? invoiceServiceLines
                      : [{ name: 'Service', serviceFee: invServiceFee, govFee: invGovFee }];
                  const totServiceFee: number = (effectiveLines as any[]).reduce((acc: number, l: any) => acc + (Number(l.serviceFee) || 0), 0);
                  const totGovFee: number = (effectiveLines as any[]).reduce((acc: number, l: any) => acc + (Number(l.govFee) || 0), 0);
                  const actualRate: number = invVatRate !== undefined && !isNaN(Number(invVatRate)) ? Math.max(0, Number(invVatRate)) : 0;
                  const totVat: number = actualRate > 0 ? (totServiceFee * actualRate) / 100 : 0;
                  const totGrand: number = totServiceFee + totGovFee + totVat;

                  return (
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Taxable Agency Subtotal ({effectiveLines.length} service{effectiveLines.length > 1 ? 's' : ''}):</span>
                        <span className="font-mono font-semibold">AED {totServiceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Pass-Through Gov Fees:</span>
                        <span className="font-mono font-semibold">AED {totGovFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>
                          VAT ({actualRate}% on Agency Fees){actualRate === 0 ? ' (VAT Exempt)' : ''}:
                        </span>
                        <span className={`font-mono font-semibold ${actualRate === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                          AED {totVat.toLocaleString()} {actualRate === 0 ? '(0% Exempt)' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-blue-900 dark:text-blue-200 pt-1.5 border-t border-blue-200 dark:border-blue-800">
                        <span>Grand Total Payable:</span>
                        <span className="font-mono">AED {totGrand.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateInvoiceModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Issue Tax Invoice</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Gmail Composer Modal for this Client */}
        <GmailComposerModal
          isOpen={isGmailComposerOpen}
          onClose={() => setIsGmailComposerOpen(false)}
          initialRecipient={client.email}
          initialSubject={gmailInitialSubject}
          initialBody={gmailInitialBody}
          clientId={client.id}
        />

        {/* Quick Create Service Modal */}
        {showQuickCreateService && (
          <QuickCreateServiceModal
            isOpen={showQuickCreateService}
            onClose={() => setShowQuickCreateService(false)}
            onCreated={handleServiceCreated}
          />
        )}
      </div>
    </div>
  );
};
