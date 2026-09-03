import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  X,
  CreditCard,
  Building2,
  Download,
  Edit2,
  Trash2,
  AlertTriangle,
  Receipt,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  ShieldCheck,
  Check,
  Settings,
  Sparkles,
  Percent,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Invoice, InvoiceLineItem, Transaction, TransactionType, PaymentMethodType, ServiceCategory } from '../../types/crm';
import { InvoicePrintModal } from './InvoicePrintModal';
import { BillingSettingsModal } from './BillingSettingsModal';
import { NomodCheckoutModal } from '../payment/NomodCheckoutModal';
import { QuickCreateServiceModal } from '../services/QuickCreateServiceModal';

export const InvoicesPayments: React.FC = () => {
  const {
    filteredInvoices,
    companies,
    clients,
    serviceCategories,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    transactions,
    filteredTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    currentUser,
    users,
    crmBranding,
    billingSettings,
    updateBillingSettings,
    processNomodPaymentOutcome,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'invoices' | 'transactions'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDirectTxModal, setShowDirectTxModal] = useState(false);
  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);
  const [showTxReceiptModal, setShowTxReceiptModal] = useState(false);
  const [showEditTxModal, setShowEditTxModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showNomodModal, setShowNomodModal] = useState(false);
  const [nomodCheckoutInvoice, setNomodCheckoutInvoice] = useState<Invoice | null>(null);
  const [showQuickCreateService, setShowQuickCreateService] = useState(false);

  const [invoiceServiceLines, setInvoiceServiceLines] = useState<
    Array<{
      id: string;
      serviceCatId?: string;
      name: string;
      serviceFee: number;
      govFee: number;
    }>
  >([]);

  const handleServiceCreated = (newService: ServiceCategory) => {
    setInvServiceMode('catalog');
    setInvServiceCatId(newService.id);
    setServiceFee(newService.defaultPrice);
    setGovFee(newService.governmentFees);
    setShowQuickCreateService(false);
    setInvoiceServiceLines((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: `line-${Date.now()}`,
            serviceCatId: newService.id,
            name: newService.name,
            serviceFee: newService.defaultPrice,
            govFee: newService.governmentFees,
          },
        ];
      }
      return [
        ...prev,
        {
          id: `line-${Date.now()}`,
          serviceCatId: newService.id,
          name: newService.name,
          serviceFee: newService.defaultPrice,
          govFee: newService.governmentFees,
        },
      ];
    });
  };

  const handleAddServiceLine = (presetService?: ServiceCategory) => {
    const s = presetService || serviceCategories[0];
    setInvoiceServiceLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        serviceCatId: s?.id,
        name: s?.name || 'Additional Corporate Service',
        serviceFee: s?.defaultPrice || 1500,
        govFee: s?.governmentFees || 0,
      },
    ]);
  };

  const handleUpdateServiceLine = (
    id: string,
    field: 'name' | 'serviceFee' | 'govFee' | 'serviceCatId',
    value: any
  ) => {
    setInvoiceServiceLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (field === 'serviceCatId') {
          const cat = serviceCategories.find((c) => c.id === value);
          return {
            ...l,
            serviceCatId: value,
            name: cat ? cat.name : l.name,
            serviceFee: cat ? cat.defaultPrice : l.serviceFee,
            govFee: cat ? cat.governmentFees : l.govFee,
          };
        }
        return { ...l, [field]: value };
      })
    );
  };

  const handleRemoveServiceLine = (id: string) => {
    if (invoiceServiceLines.length <= 1) return;
    setInvoiceServiceLines((prev) => prev.filter((l) => l.id !== id));
  };

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);

  const isAdminOrMaster = currentUser.role === 'admin' || currentUser.role === 'master';

  // Edit Transaction Form State
  const [editTxData, setEditTxData] = useState<{
    id: string;
    clientId: string;
    clientName: string;
    type: TransactionType;
    category: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    referenceNumber: string;
    receiptNumber: string;
    date: string;
    status: Transaction['status'];
    notes: string;
  }>({
    id: '',
    clientId: '',
    clientName: '',
    type: 'deposit',
    category: '',
    amount: 0,
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    receiptNumber: '',
    date: '',
    status: 'completed',
    notes: '',
  });

  // New Invoice Form
  const [invClientMode, setInvClientMode] = useState<'existing' | 'custom'>('existing');
  const [invClientId, setInvClientId] = useState(clients[0]?.id || '');
  const [invCustomName, setInvCustomName] = useState('');
  const [invCustomEmail, setInvCustomEmail] = useState('');
  const [invCustomPhone, setInvCustomPhone] = useState('');
  const [invCustomPassport, setInvCustomPassport] = useState('');
  const [invCustomAddress, setInvCustomAddress] = useState('');
  const [invCustomCompanyName, setInvCustomCompanyName] = useState('');

  const [invServiceMode, setInvServiceMode] = useState<'catalog' | 'custom'>('catalog');
  const [invServiceCatId, setInvServiceCatId] = useState(serviceCategories[0]?.id || '');
  const [invCustomServiceName, setInvCustomServiceName] = useState('');
  const [serviceFee, setServiceFee] = useState<number>(serviceCategories[0]?.defaultPrice || 3500);
  const [govFee, setGovFee] = useState<number>(serviceCategories[0]?.governmentFees || 2200);
  const [vatRate, setVatRate] = useState<number>(billingSettings?.vatRate ?? 5);
  const [invDueDate, setInvDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [invNotes, setInvNotes] = useState('');
  const [invSuccessBanner, setInvSuccessBanner] = useState<string | null>(null);

  // Comprehensive Edit Invoice Form State
  const [editInvId, setEditInvId] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientAddress, setEditClientAddress] = useState('');
  const [editClientPassport, setEditClientPassport] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editServiceName, setEditServiceName] = useState('');
  const [editSubtotal, setEditSubtotal] = useState<number>(0);
  const [editGovFees, setEditGovFees] = useState<number>(0);
  const [editVatRate, setEditVatRate] = useState<number>(5);
  const [editAmountPaid, setEditAmountPaid] = useState<number>(0);
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('Bank Transfer');
  const [editStatus, setEditStatus] = useState<Invoice['status']>('unpaid');
  const [editNotes, setEditNotes] = useState('');

  // Record Payment Form
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<Invoice['paymentMethod']>('Bank Transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Direct User Transaction Form
  const [txClientId, setTxClientId] = useState(clients[0]?.id || '');
  const [txType, setTxType] = useState<TransactionType>('deposit');
  const [txCategory, setTxCategory] = useState('Advance Security Deposit');
  const [txAmount, setTxAmount] = useState<number>(1500);
  const [txMethod, setTxMethod] = useState<PaymentMethodType>('Bank Transfer');
  const [txRef, setTxRef] = useState('');
  const [txNotes, setTxNotes] = useState('');

  // Filtered list
  const displayInvoices = (filteredInvoices || []).filter((inv) => {
    if (!inv) return false;
    const matchSearch =
      !searchQuery ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.clientName && inv.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.serviceName && inv.serviceName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchCompany = companyFilter === 'all' || inv.companyId === companyFilter;
    const matchEmployee =
      employeeFilter === 'all' ||
      inv.issuedByUserId === employeeFilter ||
      (() => {
        const cl = (clients || []).find((c) => c && c.id === inv.clientId);
        return Boolean(
          cl &&
            ((cl.assignedEmployeeIds && cl.assignedEmployeeIds.includes(employeeFilter)) ||
              (cl as any).assignedEmployeeId === employeeFilter ||
              cl.assignedAdminId === employeeFilter ||
              (cl.services && cl.services.some((s) => s.assignedEmployeeId === employeeFilter)))
        );
      })();
    return matchSearch && matchStatus && matchCompany && matchEmployee;
  });

  const displayTransactions = (filteredTransactions || []).filter((tx) => {
    if (!tx) return false;
    const matchSearch =
      !searchQuery ||
      (tx.transactionNumber && tx.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.clientName && tx.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.category && tx.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.referenceNumber && tx.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.receiptNumber && tx.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchType = txTypeFilter === 'all' || tx.type === txTypeFilter;
    const matchCompany = companyFilter === 'all' || tx.companyId === companyFilter;
    const matchEmployee =
      employeeFilter === 'all' ||
      tx.recordedByUserId === employeeFilter ||
      (() => {
        const cl = (clients || []).find((c) => c && c.id === tx.clientId);
        return Boolean(
          cl &&
            ((cl.assignedEmployeeIds && cl.assignedEmployeeIds.includes(employeeFilter)) ||
              (cl as any).assignedEmployeeId === employeeFilter ||
              cl.assignedAdminId === employeeFilter)
        );
      })();
    return matchSearch && matchType && matchCompany && matchEmployee;
  });

  const handleOpenEditTx = (tx: Transaction) => {
    setActiveTx(tx);
    setEditTxData({
      id: tx.id,
      clientId: tx.clientId || '',
      clientName: tx.clientName || '',
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      referenceNumber: tx.referenceNumber || '',
      receiptNumber: tx.receiptNumber || '',
      date: tx.date,
      status: tx.status,
      notes: tx.notes || '',
    });
    setShowEditTxModal(true);
  };

  const handleSaveEditTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTxData.id) return;
    const cl = clients.find((c) => c.id === editTxData.clientId);
    updateTransaction(editTxData.id, {
      clientId: editTxData.clientId || undefined,
      clientName: cl ? cl.fullName : editTxData.clientName || undefined,
      type: editTxData.type,
      category: editTxData.category,
      amount: Number(editTxData.amount) || 0,
      paymentMethod: editTxData.paymentMethod,
      referenceNumber: editTxData.referenceNumber,
      receiptNumber: editTxData.receiptNumber,
      date: editTxData.date,
      status: editTxData.status,
      notes: editTxData.notes,
    });
    setShowEditTxModal(false);
  };

  const handleOpenTxReceipt = (tx: Transaction) => {
    setActiveTx(tx);
    setShowTxReceiptModal(true);
  };

  const isTxInflow = (type: TransactionType) => {
    return ['deposit', 'service_fee', 'typing_fee', 'vat_payment'].includes(type);
  };

  const txTotals = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalVolume = 0;

    displayTransactions.forEach((tx) => {
      totalVolume += tx.amount;
      if (isTxInflow(tx.type)) {
        totalInflow += tx.amount;
      } else {
        totalOutflow += tx.amount;
      }
    });

    return {
      totalInflow,
      totalOutflow,
      totalVolume,
      net: totalInflow - totalOutflow,
      count: displayTransactions.length,
    };
  }, [displayTransactions]);

  const totalInvoiced = filteredInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalPaid = filteredInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalBalance = filteredInvoices.reduce((acc, i) => acc + i.balanceAmount, 0);

  const handleOpenCreateModal = (preselectedClientId?: string) => {
    const targetClientId = preselectedClientId || invClientId || clients[0]?.id || '';
    const cl = clients.find((c) => c.id === targetClientId) || clients[0];
    if (cl) {
      setInvClientId(cl.id);
      setInvClientMode('existing');
    } else {
      setInvClientMode('custom');
    }

    const targetCatId = invServiceCatId || serviceCategories[0]?.id || '';
    const cat = serviceCategories.find((s) => s.id === targetCatId) || serviceCategories[0];
    if (cat) {
      setInvServiceCatId(cat.id);
      setServiceFee(cat.defaultPrice || 3500);
      setGovFee(cat.governmentFees || 2200);
      setInvoiceServiceLines([
        {
          id: `line-${Date.now()}-1`,
          serviceCatId: cat.id,
          name: cat.name,
          serviceFee: cat.defaultPrice || 3500,
          govFee: cat.governmentFees || 2200,
        },
      ]);
    } else {
      setInvoiceServiceLines([
        {
          id: `line-${Date.now()}-1`,
          name: 'Corporate PRO & Legal Clearance',
          serviceFee: 3500,
          govFee: 2200,
        },
      ]);
    }

    const d = new Date();
    d.setDate(d.getDate() + 14);
    setInvDueDate(d.toISOString().split('T')[0]);
    setVatRate(billingSettings?.vatRate ?? 5);
    setInvNotes('');
    setShowCreateModal(true);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let billedClientId = '';
    let billedClientName = '';
    let billedClientEmail = '';
    let billedClientPhone = '';
    let billedClientAddress = 'Dubai, UAE';
    let billedClientPassport = '';
    let billedCompanyId = companies[0]?.id || 'comp-1';
    let billedCompanyName = billingSettings?.companyName || 'ADCS Clearing LLC';

    if (invClientMode === 'existing') {
      const cl = clients.find((c) => c.id === invClientId) || clients[0];
      if (cl) {
        billedClientId = cl.id;
        billedClientName = cl.fullName;
        billedClientEmail = cl.email || '';
        billedClientPhone = cl.mobile || cl.phone || '';
        billedClientAddress = cl.residentialAddress || (cl as any).address || 'Dubai, UAE';
        billedClientPassport = cl.passportNo || '';
        billedCompanyId = cl.companyId || companies[0]?.id || 'comp-1';
        billedCompanyName =
          companies.find((c) => c.id === cl.companyId)?.name || billingSettings?.companyName || 'ADCS Clearing LLC';
      } else {
        billedClientId = `client-${Date.now()}`;
        billedClientName = invCustomName || 'Client Dossier';
        billedClientEmail = invCustomEmail || 'client@example.com';
        billedClientPhone = invCustomPhone || '+971 50 000 0000';
      }
    } else {
      billedClientId = `client-walkin-${Date.now()}`;
      billedClientName = invCustomName.trim() || 'Walk-in Client';
      billedClientEmail = invCustomEmail.trim() || 'walkin@example.com';
      billedClientPhone = invCustomPhone.trim() || '+971 50 000 0000';
      billedClientPassport = invCustomPassport.trim() || '';
      billedClientAddress = invCustomAddress.trim() || 'Dubai, UAE';
      billedCompanyName = invCustomCompanyName.trim() || billingSettings?.companyName || 'ADCS Clearing LLC';
    }

    // Determine effective service lines
    const effectiveLines =
      invServiceMode === 'custom' && invCustomServiceName.trim()
        ? [
            {
              id: `line-custom-${Date.now()}`,
              name: invCustomServiceName.trim(),
              serviceFee: serviceFee,
              govFee: govFee,
            },
          ]
        : invoiceServiceLines.length > 0
        ? invoiceServiceLines
        : [
            {
              id: `line-default-${Date.now()}`,
              name: 'Corporate PRO & Legal Clearance Service',
              serviceFee: serviceFee,
              govFee: govFee,
            },
          ];

    const totalServiceFee = effectiveLines.reduce((acc, l) => acc + (Number(l.serviceFee) || 0), 0);
    const totalGovFee = effectiveLines.reduce((acc, l) => acc + (Number(l.govFee) || 0), 0);
    const actualVatRate = vatRate !== undefined && !isNaN(Number(vatRate)) ? Math.max(0, Number(vatRate)) : 0;
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
          description: `${line.name} - Agency Processing & Professional Fee`,
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
      'Corporate PRO & Visa Clearance Service';
    const finalServiceId = effectiveLines[0]?.serviceCatId;

    const generated = createInvoice({
      clientId: billedClientId,
      clientName: billedClientName,
      clientEmail: billedClientEmail,
      clientPhone: billedClientPhone,
      clientAddress: billedClientAddress,
      clientPassport: billedClientPassport,
      companyId: billedCompanyId,
      companyName: billedCompanyName,
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

    setShowCreateModal(false);
    setInvNotes('');
    setInvCustomName('');
    setInvCustomEmail('');
    setInvCustomPhone('');
    setInvCustomPassport('');
    setInvCustomAddress('');
    setInvCustomCompanyName('');
    setInvCustomServiceName('');

    setInvSuccessBanner(`Invoice ${generated.invoiceNumber} for AED ${grandTotal.toLocaleString()} generated successfully!`);
    setTimeout(() => setInvSuccessBanner(null), 6000);
  };

  const handleOpenEditModal = (inv: Invoice) => {
    setActiveInvoice(inv);
    setEditInvId(inv.id);
    setEditClientName(inv.clientName);
    setEditClientEmail(inv.clientEmail || '');
    setEditClientPhone(inv.clientPhone || '');
    setEditClientAddress(inv.clientAddress || '');
    setEditClientPassport(inv.clientPassport || '');
    setEditCompanyName(inv.companyName || billingSettings?.companyName || 'ADCS Clearing LLC');
    setEditServiceName(inv.serviceName);
    setEditSubtotal(inv.subtotal);
    setEditGovFees(inv.governmentFees || 0);
    setEditVatRate(inv.vatRate ?? billingSettings?.vatRate ?? 5);
    setEditAmountPaid(inv.amountPaid);
    setEditIssueDate(inv.issueDate);
    setEditDueDate(inv.dueDate);
    setEditPaymentMethod(inv.paymentMethod || 'Bank Transfer');
    setEditStatus(inv.status);
    setEditNotes(inv.notes || '');
    setShowEditModal(true);
  };

  const handleUpdateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInvId) return;

    const vatAmount = (editSubtotal * editVatRate) / 100;
    const grandTotal = editSubtotal + editGovFees + vatAmount;
    const balanceAmount = Math.max(0, grandTotal - editAmountPaid);
    const resolvedStatus: Invoice['status'] =
      balanceAmount === 0 ? 'paid' : editAmountPaid > 0 ? 'partially_paid' : editStatus;

    const updatedItems: InvoiceLineItem[] = [
      {
        id: activeInvoice?.items?.[0]?.id || `item-${Date.now()}-1`,
        description: `${editServiceName} - Professional Agency & PRO Processing Fee`,
        quantity: 1,
        unitPrice: editSubtotal,
        isGovernmentFee: false,
        total: editSubtotal,
      },
      {
        id: activeInvoice?.items?.[1]?.id || `item-${Date.now()}-2`,
        description: 'Government Official Pass-through Authority Fee (ICP / GDRFA / MoHRE / DET)',
        quantity: 1,
        unitPrice: editGovFees,
        isGovernmentFee: true,
        total: editGovFees,
      },
    ];

    updateInvoice(editInvId, {
      clientName: editClientName,
      clientEmail: editClientEmail,
      clientPhone: editClientPhone,
      clientAddress: editClientAddress,
      clientPassport: editClientPassport,
      companyName: editCompanyName,
      serviceName: editServiceName,
      subtotal: editSubtotal,
      governmentFees: editGovFees,
      vatRate: editVatRate,
      vatAmount,
      grandTotal,
      amountPaid: editAmountPaid,
      balanceAmount,
      issueDate: editIssueDate,
      dueDate: editDueDate,
      paymentMethod: editPaymentMethod as any,
      status: resolvedStatus,
      notes: editNotes,
      items: updatedItems,
    });

    setShowEditModal(false);
    setActiveInvoice(null);
  };

  const handleDeleteInvoice = () => {
    if (!activeInvoice) return;
    deleteInvoice(activeInvoice.id);
    setShowDeleteModal(false);
    setActiveInvoice(null);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice || payAmount <= 0) return;
    recordPayment(activeInvoice.id, payAmount, payMethod, payRef, payNotes || 'Official payment receipt issued');
    setShowPaymentModal(false);
    setActiveInvoice(null);
    setPayNotes('');
    setPayRef('');
  };

  const handleDirectTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cl = clients.find((c) => c.id === txClientId);
    if (!cl || txAmount <= 0) return;

    addTransaction({
      clientId: cl.id,
      clientName: cl.fullName,
      companyId: cl.companyId,
      companyName: companies.find((c) => c.id === cl.companyId)?.name || billingSettings?.companyName || 'ADCS Clearing LLC',
      type: txType,
      category: txCategory,
      amount: txAmount,
      paymentMethod: txMethod,
      referenceNumber: txRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptNumber: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: txNotes || `Direct transaction payment linked to client dossier: ${cl.fullName}`,
    });

    setShowDirectTxModal(false);
    setTxNotes('');
    setTxRef('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tax Invoices & Financial Accounting</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage corporate billing, client payments, pass-through government authority disbursements, and VAT receipts
          </p>
        </div>

        {currentUser.role !== 'client' && (
          <div className="flex items-center gap-2">
            {isAdminOrMaster && (
              <button
                onClick={() => setShowBillingModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Manage Company Details, VAT TRN, Signatory & Official Stamp"
              >
                <Settings className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Billing & Stamp Settings</span>
              </button>
            )}
            <button
              onClick={() => setShowDirectTxModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Connect Payment to User</span>
            </button>
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Tax Invoice</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {invSuccessBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{invSuccessBanner}</span>
          </div>
          <button onClick={() => setInvSuccessBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Invoiced</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {billingSettings?.currency || 'AED'} {totalInvoiced.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across {filteredInvoices.length} issued invoices</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Collected Revenue</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {billingSettings?.currency || 'AED'} {totalPaid.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Successfully settled & verified</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Outstanding Balance</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {billingSettings?.currency || 'AED'} {totalBalance.toLocaleString()}
          </div>
          <p className="text-xs text-rose-600 mt-1 font-medium">Pending client collection</p>
        </div>
      </div>

      {/* Tab Switcher & Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tax Invoices ({filteredInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Client Transactions Ledger ({filteredTransactions.length})
          </button>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoices, clients, TRN..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          {/* Branch / Company Filter */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
          >
            <option value="all">All Branches</option>
            {(companies || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Employee Filter */}
          {(currentUser.role === 'master' || currentUser.role === 'admin') && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold max-w-[150px]"
            >
              <option value="all">All Officers</option>
              {(users || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}

          {activeTab === 'invoices' ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
            >
              <option value="all">All Invoice Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid (Fully Settled)</option>
              <option value="overdue">Overdue</option>
            </select>
          ) : (
            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
            >
              <option value="all">All Transaction Types</option>
              <option value="deposit">Client Deposits</option>
              <option value="service_fee">Agency Service Fees</option>
              <option value="government_fee">Gov Fee Outflows</option>
              <option value="typing_fee">Typing Fees</option>
              <option value="refund">Client Refunds</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'invoices' ? (
        /* Invoices Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice No.</th>
                  <th className="py-3 px-4">Client Dossier</th>
                  <th className="py-3 px-4">Service Description</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Paid / Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm">No tax invoices found</p>
                      <p className="text-xs text-slate-500">Create an invoice to start billing client dossiers</p>
                    </td>
                  </tr>
                ) : (
                  displayInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{inv.clientName}</div>
                        <div className="text-[11px] text-slate-400">{inv.companyName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{inv.serviceName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {billingSettings?.currency || 'AED'} {inv.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-emerald-600 font-semibold">{billingSettings?.currency || 'AED'} {inv.amountPaid.toLocaleString()}</div>
                        {inv.balanceAmount > 0 && (
                          <div className="text-rose-600 text-[11px]">Bal: {billingSettings?.currency || 'AED'} {inv.balanceAmount.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.status === 'partially_paid'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Invoice Button */}
                          <button
                            onClick={() => {
                              setActiveInvoice(inv);
                              setShowInvoicePrintModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                            title="View & Print Tax Invoice (with Stamp & Signatory)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Invoice Button */}
                          {currentUser.role !== 'client' && (
                            <button
                              onClick={() => handleOpenEditModal(inv)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-600 dark:text-slate-300 hover:text-amber-600 transition-colors cursor-pointer"
                              title="Edit Invoice Details & Line Items"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Nomod Instant Checkout Button */}
                          {inv.balanceAmount > 0 && (
                            <button
                              onClick={() => {
                                setNomodCheckoutInvoice(inv);
                                setShowNomodModal(true);
                              }}
                              className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                              title="Checkout with Nomod (Cards, Apple Pay, Google Pay, UAE Jaywan Debit)"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay via Nomod</span>
                            </button>
                          )}

                          {/* Record Payment Button */}
                          {inv.balanceAmount > 0 && currentUser.role !== 'client' && (
                            <button
                              onClick={() => {
                                setActiveInvoice(inv);
                                setPayAmount(inv.balanceAmount);
                                setShowPaymentModal(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Record Pay
                            </button>
                          )}

                          {/* Delete Invoice Button */}
                          {currentUser.role !== 'client' && (
                            <button
                              onClick={() => {
                                setActiveInvoice(inv);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Transactions Ledger Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Dynamic Totals Summary Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Filtered Ledger Totals ({txTotals.count} Transactions)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Total Inflow:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">+{billingSettings?.currency || 'AED'} {txTotals.totalInflow.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-2.5 py-1 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-rose-800 dark:text-rose-300">Total Outflow:</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-300">-{billingSettings?.currency || 'AED'} {txTotals.totalOutflow.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 text-white px-3 py-1 rounded-lg shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-300">Net Total:</span>
                <span className={`font-mono font-bold ${txTotals.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {txTotals.net >= 0 ? '+' : ''}{billingSettings?.currency || 'AED'} {txTotals.net.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">TX No. & Date</th>
                  <th className="py-3 px-4">Connected User / Client</th>
                  <th className="py-3 px-4">Type & Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm">No user payments recorded</p>
                      <p className="text-xs text-slate-500">Connect a transaction payment to a client dossier above</p>
                    </td>
                  </tr>
                ) : (
                  displayTransactions.map((tx) => {
                    const isInflow = isTxInflow(tx.type);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">{tx.transactionNumber}</div>
                          <div className="text-[11px] text-slate-400">{tx.date}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            <span>{tx.clientName || 'General Corporate'}</span>
                          </div>
                          {tx.serviceName && <div className="text-[11px] text-slate-500">{tx.serviceName}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{tx.category}</div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${
                            isInflow
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}>
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className={`font-bold text-sm font-mono flex items-center gap-1 ${
                            isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {isInflow ? '+' : '-'}{billingSettings?.currency || 'AED'} {tx.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">{tx.paymentMethod}</div>
                          <div className="font-mono text-[10px] text-slate-400">{tx.referenceNumber || 'No Reference'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-600 dark:text-slate-300">{tx.recordedByName || 'Finance Admin'}</div>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>{tx.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenTxReceipt(tx)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Print Official Payment Voucher"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                            {currentUser.role !== 'client' && (
                              <>
                                <button
                                  onClick={() => handleOpenEditTx(tx)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                                  title="Edit Transaction Record"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteTransaction(tx.id)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Delete Transaction"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Tax Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <span>Issue Corporate Tax Invoice</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 pt-4">
              {/* Client Selection Mode */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Billed Client / Organization *
                  </label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setInvClientMode('existing')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        invClientMode === 'existing'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      CRM Dossier ({clients.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvClientMode('custom')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        invClientMode === 'custom'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Direct / Walk-in
                    </button>
                  </div>
                </div>

                {invClientMode === 'existing' ? (
                  clients.length > 0 ? (
                    <select
                      value={invClientId || clients[0]?.id}
                      onChange={(e) => setInvClientId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id ?? ''}>
                          {c.fullName} — {c.companyName || c.email || 'Individual'} ({c.passportNo || 'No Passport'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                      No CRM clients registered yet. Switching to Direct / Walk-in mode below.
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Full Name / Contact Person *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={invCustomName}
                          onChange={(e) => setInvCustomName(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Company / Entity Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Acme Gulf FZE"
                          value={invCustomCompanyName}
                          onChange={(e) => setInvCustomCompanyName(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Email Address</label>
                        <input
                          type="email"
                          placeholder="client@example.com"
                          value={invCustomEmail}
                          onChange={(e) => setInvCustomEmail(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Phone / WhatsApp</label>
                        <input
                          type="text"
                          placeholder="+971 50 123 4567"
                          value={invCustomPhone}
                          onChange={(e) => setInvCustomPhone(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Passport / Trade License No.</label>
                        <input
                          type="text"
                          placeholder="e.g. P12345678"
                          value={invCustomPassport}
                          onChange={(e) => setInvCustomPassport(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Billing Address</label>
                        <input
                          type="text"
                          placeholder="e.g. Downtown Dubai, UAE"
                          value={invCustomAddress}
                          onChange={(e) => setInvCustomAddress(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Services & Line Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">
                      Services & Line Items *
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Select from catalog, add popular services, or create new services on the fly
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickCreateService(true)}
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Create New Service</span>
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
                      {serviceCategories.slice(0, 6).map((cat) => (
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
                        onClick={() => setShowQuickCreateService(true)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Can't find a service? Create & Add to Catalog</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Custom Service Dossier Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Expedited PRO Submission & Legal Visa Stamping Dossier"
                        value={invCustomServiceName}
                        onChange={(e) => setInvCustomServiceName(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Professional Agency Fee (AED) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={serviceFee}
                          onChange={(e) => setServiceFee(Math.max(0, Number(e.target.value)))}
                          className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Pass-through Gov Fees (AED)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={govFee}
                          onChange={(e) => setGovFee(Math.max(0, Number(e.target.value)))}
                          className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* VAT Setting Section (Optional - Allows 0% or Custom) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">
                      UAE VAT Option (Non-Mandatory / Optional)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Select 0% for tax-exempt, zero-rated, or freezone services; or apply 5% standard VAT
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      vatRate === 0
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {vatRate === 0 ? '0% VAT Exempt' : `${vatRate}% Taxable`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVatRate(0)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      vatRate === 0
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    0% VAT (Exempt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVatRate(5)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      vatRate === 5
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
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                      className="w-full py-2 px-3 pr-7 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-mono text-center font-bold"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Payment Due Date & Remarks */}
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
                    Internal Remarks / Reference
                  </label>
                  <input
                    type="text"
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    placeholder="e.g. Retainer milestone 1"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              {(() => {
                const effectiveLines =
                  invServiceMode === 'custom' && invCustomServiceName.trim()
                    ? [{ name: invCustomServiceName, serviceFee, govFee }]
                    : invoiceServiceLines.length > 0
                    ? invoiceServiceLines
                    : [{ name: 'Service', serviceFee, govFee }];
                const totServiceFee: number = (effectiveLines as any[]).reduce((acc: number, l: any) => acc + (Number(l.serviceFee) || 0), 0);
                const totGovFee: number = (effectiveLines as any[]).reduce((acc: number, l: any) => acc + (Number(l.govFee) || 0), 0);
                const actualRate: number = vatRate !== undefined && !isNaN(Number(vatRate)) ? Math.max(0, Number(vatRate)) : 0;
                const totVat: number = actualRate > 0 ? (totServiceFee * actualRate) / 100 : 0;
                const totGrand: number = totServiceFee + totGovFee + totVat;

                return (
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Taxable Agency Subtotal ({effectiveLines.length} service{effectiveLines.length > 1 ? 's' : ''}):</span>
                      <span className="font-mono font-semibold">AED {totServiceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Pass-Through Gov Official Fees:</span>
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
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Generate Tax Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Tax Invoice Modal */}
      {showEditModal && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                  <span>Edit Tax Invoice #{activeInvoice.invoiceNumber}</span>
                </h3>
                <p className="text-xs text-slate-500">Edit client dossier info, line items, VAT, and payments</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInvoiceSubmit} className="space-y-4 pt-4">
              {/* Client Details Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Client & Billed Party Information
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={editClientEmail}
                      onChange={(e) => setEditClientEmail(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editClientPhone}
                      onChange={(e) => setEditClientPhone(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Passport No
                    </label>
                    <input
                      type="text"
                      value={editClientPassport}
                      onChange={(e) => setEditClientPassport(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Company Branch
                    </label>
                    <input
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Client Address
                  </label>
                  <input
                    type="text"
                    value={editClientAddress}
                    onChange={(e) => setEditClientAddress(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Service & Fees Section */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Service Dossier Description *
                </label>
                <input
                  type="text"
                  required
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Professional Fee (AED) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editSubtotal}
                    onChange={(e) => setEditSubtotal(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Pass-Through Gov Fees (AED)
                  </label>
                  <input
                    type="number"
                    value={editGovFees}
                    onChange={(e) => setEditGovFees(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      VAT Rate (%)
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditVatRate(0)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          editVatRate === 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        0%
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditVatRate(5)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          editVatRate === 5
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        5%
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editVatRate}
                    onChange={(e) => setEditVatRate(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount Paid (AED)
                  </label>
                  <input
                    type="number"
                    value={editAmountPaid}
                    onChange={(e) => setEditAmountPaid(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={editIssueDate}
                    onChange={(e) => setEditIssueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online Gateway">Online Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Notes & Remarks
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Summary recalculated */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Recalculated Grand Total:</span>
                  <span className="text-blue-600 font-mono">
                    AED {(editSubtotal + editGovFees + (editSubtotal * editVatRate) / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-rose-600">
                  <span>Balance Due:</span>
                  <span className="font-mono">
                    AED {Math.max(0, editSubtotal + editGovFees + (editSubtotal * editVatRate) / 100 - editAmountPaid).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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

      {/* Delete Invoice Confirmation Modal */}
      {showDeleteModal && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">Delete Tax Invoice</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Are you sure you want to delete invoice <strong className="font-mono">{activeInvoice.invoiceNumber}</strong> (AED {activeInvoice.grandTotal.toLocaleString()}) for {activeInvoice.clientName}?
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center mt-2 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 dark:border-amber-900/40">
              The client's financial ledger and outstanding balance will be automatically adjusted.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInvoice}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment on Invoice Modal */}
      {showPaymentModal && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Record Client Payment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Invoice <strong className="font-mono">{activeInvoice.invoiceNumber}</strong> for <strong>{activeInvoice.clientName}</strong>
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (AED) *
                </label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                  <option value="Credit Card">Credit Card (POS/Online Gateway)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Cheque">Corporate Cheque</option>
                  <option value="Online Gateway">Online Payment Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference / Cheque No.
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. ENBD-WT-99201"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Received full final settlement receipt"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Confirm & Sync Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Direct Transaction to User Modal */}
      {showDirectTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Connect Payment to User</h3>
                <p className="text-xs text-slate-500">Record a direct transaction linked to a client dossier</p>
              </div>
              <button onClick={() => setShowDirectTxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectTransactionSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Connect to Client / User Dossier *
                </label>
                <select
                  value={txClientId}
                  onChange={(e) => setTxClientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id ?? ''}>
                      {c.fullName} - {c.companyName || c.email} ({c.passportNo || 'No Passport'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="deposit">Deposit (Funds In)</option>
                    <option value="service_fee">Service Fee (Income)</option>
                    <option value="typing_fee">Typing Fee (Income)</option>
                    <option value="government_fee">Gov Fee Outflow (Pass-Through)</option>
                    <option value="medical_fee">Medical Centre Fee</option>
                    <option value="emirates_id_fee">Emirates ID Fee</option>
                    <option value="refund">Refund to Client (Outflow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    placeholder="e.g. Advance Retainer"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount (AED) *
                  </label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Cheque">Corporate Cheque</option>
                    <option value="Cash">Cash at Branch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bank Reference / Receipt No.
                </label>
                <input
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. ENBD-DEP-88192"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Accounting Notes
                </label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="e.g. Paid at branch front desk"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDirectTxModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Record & Link Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Printable Document Modal */}
      {showInvoicePrintModal && activeInvoice && (
        <InvoicePrintModal
          invoice={activeInvoice}
          billingSettings={billingSettings}
          crmBranding={crmBranding}
          onClose={() => {
            setShowInvoicePrintModal(false);
            setActiveInvoice(null);
          }}
        />
      )}

      {/* Edit Transaction Modal */}
      {showEditTxModal && activeTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Edit Transaction Record ({editTxData.referenceNumber || activeTx.transactionNumber})</span>
              </h3>
              <button onClick={() => setShowEditTxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTx} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Connected Client Dossier
                </label>
                <select
                  value={editTxData.clientId ?? ''}
                  onChange={(e) => setEditTxData({ ...editTxData, clientId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                >
                  <option value="">-- Unlinked / Direct Corporate --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id ?? ''}>
                      {c.fullName} ({c.passportNo || c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={editTxData.type ?? ''}
                    onChange={(e) => setEditTxData({ ...editTxData, type: e.target.value as TransactionType })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="deposit">Deposit (Inflow)</option>
                    <option value="service_fee">Service Fee (Inflow)</option>
                    <option value="typing_fee">Typing Fee (Inflow)</option>
                    <option value="vat_payment">VAT Payment (Inflow)</option>
                    <option value="government_fee">Government Fee (Outflow)</option>
                    <option value="medical_fee">Medical Centre Fee (Outflow)</option>
                    <option value="emirates_id_fee">Emirates ID Fee (Outflow)</option>
                    <option value="vendor_payout">Vendor Payout (Outflow)</option>
                    <option value="refund">Refund (Outflow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount (AED) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editTxData.amount ?? ''}
                    onChange={(e) => setEditTxData({ ...editTxData, amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category Classification
                </label>
                <input
                  type="text"
                  required
                  value={editTxData.category ?? ''}
                  onChange={(e) => setEditTxData({ ...editTxData, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editTxData.paymentMethod ?? ''}
                    onChange={(e) => setEditTxData({ ...editTxData, paymentMethod: e.target.value as PaymentMethodType })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Reference / Cheque #
                  </label>
                  <input
                    type="text"
                    value={editTxData.referenceNumber ?? ''}
                    onChange={(e) => setEditTxData({ ...editTxData, referenceNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={editTxData.date ?? ''}
                    onChange={(e) => setEditTxData({ ...editTxData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editTxData.status ?? ''}
                    onChange={(e) => setEditTxData({ ...editTxData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="completed">Completed / Cleared</option>
                    <option value="pending">Pending Settlement</option>
                    <option value="reversed">Reversed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Accounting Notes
                </label>
                <textarea
                  rows={2}
                  value={editTxData.notes ?? ''}
                  onChange={(e) => setEditTxData({ ...editTxData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditTxModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Save Changes & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Receipt / Payment Voucher Modal */}
      {showTxReceiptModal && activeTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 my-8 border border-slate-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Official Payment Voucher &bull; سند قبض رسمي
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setShowTxReceiptModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                      {(billingSettings?.companyName || 'ADCS')
                        .split(' ')
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        {billingSettings?.companyName || crmBranding?.companyName || 'ADCS Document Clearing LLC'}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        {billingSettings?.tradingName || 'Corporate PRO & Government Clearance Agency'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <p>
                      {billingSettings?.addressLine1 || 'Dubai, UAE'} &bull; TRN: {billingSettings?.trn || '10048291000003'}
                    </p>
                    <p>
                      Email: {billingSettings?.email || 'accounts@adcs.ae'} &bull; Tel: {billingSettings?.phone || '+971 4 829 1100'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-xs uppercase mb-1">
                    Receipt Voucher
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {activeTx.receiptNumber || activeTx.transactionNumber}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Date: <strong>{activeTx.date}</strong>
                  </p>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    Amount Received / المبلغ المقبوض
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
                    {billingSettings?.currency || 'AED'} {activeTx.amount.toLocaleString()}.00
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    Payment Method
                  </span>
                  <span className="font-bold text-xs text-slate-800">{activeTx.paymentMethod}</span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Received From:</span>
                  <p className="font-bold text-slate-900">{activeTx.clientName || 'General Client / Direct Payee'}</p>
                  {activeTx.serviceName && (
                    <p className="text-[11px] text-slate-500">Service: {activeTx.serviceName}</p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Transaction Reference:</span>
                  <p className="font-mono font-semibold text-slate-800">{activeTx.referenceNumber || activeTx.transactionNumber}</p>
                  <p className="text-[11px] text-slate-500">Classification: {activeTx.category}</p>
                </div>
              </div>

              {activeTx.notes && (
                <div className="text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Remarks / Particulars:</span>
                  <p className="text-slate-700">{activeTx.notes}</p>
                </div>
              )}

              {/* Signatures & Official Stamp */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="h-12 border-b border-slate-300 mb-1 flex items-end justify-center"></div>
                  <span className="text-[11px] font-semibold text-slate-600">Payer / Client Signature</span>
                </div>
                <div>
                  <div className="h-12 border-b border-slate-300 mb-1 flex items-end justify-center">
                    {billingSettings?.signatorySignatureUrl ? (
                      <img
                        src={billingSettings.signatorySignatureUrl}
                        alt="Authorized Signature"
                        className="max-h-10 max-w-[120px] object-contain"
                      />
                    ) : (
                      <span className="font-serif italic text-slate-400 text-xs pb-1">
                        {billingSettings?.authorizedSignatoryName || 'ADCS Accounts'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    {billingSettings?.authorizedSignatoryName || 'Authorized Receiver / Cashier'}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {billingSettings?.authorizedSignatoryTitle || 'Finance Department'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin/Master Billing & Signatory / Stamp Modal */}
      {showBillingModal && (
        <BillingSettingsModal
          isOpen={showBillingModal}
          onClose={() => setShowBillingModal(false)}
        />
      )}

      {/* Nomod Instant Checkout Modal */}
      {showNomodModal && nomodCheckoutInvoice && (
        <NomodCheckoutModal
          isOpen={showNomodModal}
          onClose={() => {
            setShowNomodModal(false);
            setNomodCheckoutInvoice(null);
          }}
          amount={nomodCheckoutInvoice.balanceAmount}
          currency={billingSettings?.currency || 'AED'}
          serviceTitle={nomodCheckoutInvoice.serviceName}
          applicationNumber={nomodCheckoutInvoice.invoiceNumber}
          customerName={nomodCheckoutInvoice.clientName}
          customerEmail={nomodCheckoutInvoice.clientEmail}
          customerPhone={nomodCheckoutInvoice.clientPhone}
          onPaymentSuccess={(result) => {
            // Record payment on invoice
            recordPayment(
              nomodCheckoutInvoice.id,
              result.amount,
              'Credit Card',
              result.reference,
              `Nomod Live Gateway Settlement: Auth ${result.authCode || 'N/A'}, Card: ${result.cardBrand || 'Card'} ending ${result.last4 || '****'}`
            );
            setShowNomodModal(false);
            setNomodCheckoutInvoice(null);
          }}
          onPaymentOutcome={(result) => {
            processNomodPaymentOutcome({
              status: result.status === 'rejected' ? 'rejected' : result.status === 'failed' ? 'failed' : 'approved',
              invoiceId: nomodCheckoutInvoice.id,
              paymentId: result.paymentId,
              reference: result.reference,
              amount: result.amount,
              currency: result.currency || 'AED',
              authCode: result.authCode,
              cardBrand: result.cardBrand,
              last4: result.last4,
              customerName: result.customerName,
              failureReason: result.failureReason,
              timestamp: result.paidAt,
            });
          }}
        />
      )}

      {/* Quick Create Service Modal */}
      {showQuickCreateService && (
        <QuickCreateServiceModal
          isOpen={showQuickCreateService}
          onClose={() => setShowQuickCreateService(false)}
          onCreated={handleServiceCreated}
        />
      )}
    </div>
  );
};
