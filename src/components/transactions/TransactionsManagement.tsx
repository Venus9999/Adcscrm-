import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Building2,
  Users,
  CreditCard,
  Calendar,
  Download,
  Trash2,
  Edit2,
  FileText,
  CheckCircle2,
  Clock,
  Briefcase,
  Printer,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Transaction } from '../../types/crm';

export const TransactionsManagement: React.FC = () => {
  const {
    transactions,
    filteredTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clients,
    companies,
    currentUser,
    selectedCompanyId,
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    companyId: '',
    companyName: '',
    serviceId: '',
    serviceName: '',
    type: 'deposit' as Transaction['type'],
    category: 'Client Retainer Payment',
    amount: 5000,
    paymentMethod: 'Bank Transfer' as Transaction['paymentMethod'],
    referenceNumber: '',
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed' as Transaction['status'],
    notes: '',
  });

  const displayTransactions = useMemo(() => {
    return filteredTransactions.filter((tx) => {
      const matchSearch =
        tx.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.clientName && tx.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.companyName && tx.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.referenceNumber && tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.receiptNumber && tx.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      const matchMethod = methodFilter === 'all' || tx.paymentMethod === methodFilter;
      const matchClient = clientFilter === 'all' || tx.clientId === clientFilter;
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter;

      return matchSearch && matchType && matchMethod && matchClient && matchStatus;
    });
  }, [filteredTransactions, searchTerm, typeFilter, methodFilter, clientFilter, statusFilter]);

  // Financial Summaries
  const metrics = useMemo(() => {
    const totalDeposits = filteredTransactions
      .filter((t) => ['deposit', 'service_fee', 'typing_fee', 'vat_payment'].includes(t.type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalGovFees = filteredTransactions
      .filter((t) => t.type === 'gov_fee' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunds = filteredTransactions
      .filter((t) => ['refund', 'withdrawal'].includes(t.type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalDeposits - totalGovFees - totalExpenses - totalRefunds;

    return {
      totalDeposits,
      totalGovFees,
      totalExpenses,
      totalRefunds,
      netBalance,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Live dynamic totals for currently visible/filtered transactions
  const visibleTotals = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalVolume = 0;

    displayTransactions.forEach((tx) => {
      totalVolume += tx.amount;
      if (['deposit', 'service_fee', 'typing_fee', 'vat_payment'].includes(tx.type)) {
        totalInflow += tx.amount;
      } else {
        totalOutflow += tx.amount;
      }
    });

    const net = totalInflow - totalOutflow;
    return {
      totalInflow,
      totalOutflow,
      totalVolume,
      net,
      count: displayTransactions.length,
    };
  }, [displayTransactions]);

  const handleOpenAdd = () => {
    const targetCompId = selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || 'comp-1';
    const targetComp = companies.find((c) => c.id === targetCompId);

    setFormData({
      clientId: '',
      clientName: '',
      companyId: targetCompId,
      companyName: targetComp?.name || 'ADCS Dubai Global Gateway PRO LLC',
      serviceId: '',
      serviceName: '',
      type: 'deposit',
      category: 'Client Retainer Payment',
      amount: 5000,
      paymentMethod: 'Bank Transfer',
      referenceNumber: `TR-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptNumber: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setFormData({
      clientId: tx.clientId || '',
      clientName: tx.clientName || '',
      companyId: tx.companyId,
      companyName: tx.companyName || '',
      serviceId: tx.serviceId || '',
      serviceName: tx.serviceName || '',
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
    setShowEditModal(true);
  };

  const handleOpenReceipt = (tx: Transaction) => {
    setSelectedTx(tx);
    setShowReceiptModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const comp = companies.find((c) => c.id === formData.companyId);
    const client = clients.find((cl) => cl.id === formData.clientId);

    addTransaction({
      clientId: formData.clientId || undefined,
      clientName: client ? client.fullName : formData.clientName || undefined,
      companyId: formData.companyId,
      companyName: comp?.name || formData.companyName,
      serviceId: formData.serviceId || undefined,
      serviceName: formData.serviceName || undefined,
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      receiptNumber: formData.receiptNumber,
      date: formData.date,
      status: formData.status,
      notes: formData.notes,
    });

    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    const comp = companies.find((c) => c.id === formData.companyId);
    const client = clients.find((cl) => cl.id === formData.clientId);

    updateTransaction(selectedTx.id, {
      clientId: formData.clientId || undefined,
      clientName: client ? client.fullName : formData.clientName || undefined,
      companyId: formData.companyId,
      companyName: comp?.name || formData.companyName,
      serviceId: formData.serviceId || undefined,
      serviceName: formData.serviceName || undefined,
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      receiptNumber: formData.receiptNumber,
      date: formData.date,
      status: formData.status,
      notes: formData.notes,
    });

    setShowEditModal(false);
    setSelectedTx(null);
  };

  const handleExportCSV = () => {
    const headers = ['Tx Number', 'Date', 'Type', 'Category', 'Client', 'Company', 'Amount (AED)', 'Method', 'Reference', 'Receipt #', 'Status'];
    const rows = displayTransactions.map((tx) => [
      tx.transactionNumber,
      tx.date,
      tx.type,
      `"${tx.category.replace(/"/g, '""')}"`,
      `"${(tx.clientName || 'N/A').replace(/"/g, '""')}"`,
      `"${(tx.companyName || 'N/A').replace(/"/g, '""')}"`,
      tx.amount,
      tx.paymentMethod,
      tx.referenceNumber || '',
      tx.receiptNumber || '',
      tx.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ADCS_Transactions_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeStyle = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return {
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          icon: ArrowDownLeft,
          color: 'text-emerald-600 dark:text-emerald-400',
          prefix: '+',
        };
      case 'service_fee':
        return {
          badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800',
          icon: ArrowDownLeft,
          color: 'text-teal-600 dark:text-teal-400',
          prefix: '+',
        };
      case 'typing_fee':
        return {
          badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
          icon: ArrowDownLeft,
          color: 'text-cyan-600 dark:text-cyan-400',
          prefix: '+',
        };
      case 'vat_payment':
        return {
          badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
          icon: ArrowDownLeft,
          color: 'text-indigo-600 dark:text-indigo-400',
          prefix: '+',
        };
      case 'gov_fee':
        return {
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          icon: ArrowUpRight,
          color: 'text-blue-600 dark:text-blue-400',
          prefix: '-',
        };
      case 'expense':
        return {
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: ArrowUpRight,
          color: 'text-amber-600 dark:text-amber-400',
          prefix: '-',
        };
      case 'refund':
        return {
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          icon: ArrowUpRight,
          color: 'text-rose-600 dark:text-rose-400',
          prefix: '-',
        };
      case 'withdrawal':
        return {
          badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
          icon: ArrowUpRight,
          color: 'text-purple-600 dark:text-purple-400',
          prefix: '-',
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          icon: ArrowDownLeft,
          color: 'text-slate-600 dark:text-slate-400',
          prefix: '+',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Transactions & Ledgers</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ADCS Financial Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade double entry records for client deposits, ICP / GDRFA government fee lodgements, and PRO operating expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inflow / Deposits</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            AED {metrics.totalDeposits.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Client retainers & service fees</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gov & Authority Fees</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">
            AED {metrics.totalGovFees.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ICP / GDRFA / DHA / MOFA</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operating Expenses</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            AED {metrics.totalExpenses.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Tasheel cards, couriers, typing</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refunds & Adjustments</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
            AED {metrics.totalRefunds.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Returned client funds</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800/90 border border-slate-800 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Operating Surplus</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            AED {metrics.netBalance.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{metrics.count} total records</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transaction #, client, reference, receipt, category..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">All Types & Inflows/Outflows</option>
            <option value="deposit">Client Deposits / Retainers (+)</option>
            <option value="service_fee">Service Fee Payments (+)</option>
            <option value="typing_fee">Typing & Attestation (+)</option>
            <option value="gov_fee">Gov & Authority Fees (-)</option>
            <option value="expense">Operating / Vendor Expenses (-)</option>
            <option value="refund">Client Refunds (-)</option>
            <option value="vat_payment">VAT Settlement (+/-)</option>
            <option value="withdrawal">Payout / Withdrawal (-)</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Payment Methods</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Corporate Card">Corporate Card</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
          </select>

          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 max-w-[180px]"
          >
            <option value="all">All Clients / General</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table with Dynamic Totals */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Dynamic Totals Summary Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Filtered Totals ({visibleTotals.count} Transactions)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Total Inflow:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">+AED {visibleTotals.totalInflow.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-rose-800 dark:text-rose-300">Total Outflow:</span>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-300">-AED {visibleTotals.totalOutflow.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 text-white px-3 py-1 rounded-lg shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-300">Net Total:</span>
              <span className={`font-mono font-bold ${visibleTotals.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {visibleTotals.net >= 0 ? '+' : ''}AED {visibleTotals.net.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="p-3.5">Tx Ref & Date</th>
                <th className="p-3.5">Category & Description</th>
                <th className="p-3.5">Account / Client</th>
                <th className="p-3.5">Company Branch</th>
                <th className="p-3.5">Payment Details</th>
                <th className="p-3.5 font-right">Amount (AED)</th>
                <th className="p-3.5">Recorded By</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No transactions recorded matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                displayTransactions.map((tx) => {
                  const style = getTypeStyle(tx.type);
                  const Icon = style.icon;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                          <span>{tx.transactionNumber}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tx.date}</div>
                        {tx.receiptNumber && (
                          <div className="font-mono text-[9px] text-blue-600 dark:text-blue-400 mt-0.5">
                            {tx.receiptNumber}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mb-1 ${style.badge}`}>
                          {tx.type.toUpperCase()}
                        </span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{tx.category}</div>
                        {tx.serviceName && <div className="text-[10px] text-slate-500">{tx.serviceName}</div>}
                      </td>

                      <td className="p-3.5">
                        {tx.clientName ? (
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>{tx.clientName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Client Account</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">General Company Disbursal</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
                            {tx.companyName || 'ADCS Group'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{tx.paymentMethod}</span>
                        </div>
                        {tx.referenceNumber && (
                          <div className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                            Ref: {tx.referenceNumber}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className={`font-mono font-bold text-sm ${style.color}`}>
                          {style.prefix} AED {tx.amount.toLocaleString()}
                        </div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">
                          {tx.status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {tx.recordedByUserName || 'System PRO'}
                        </div>
                        <div className="text-[9px] text-slate-400">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenReceipt(tx)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                            title="View / Print Official Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {(currentUser.role === 'master' || currentUser.role === 'admin') && (
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer with Total summary */}
            <tfoot className="bg-slate-50 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-semibold">
              <tr>
                <td colSpan={5} className="p-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Total ({visibleTotals.count} records)
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Inflows:</span>
                      <span className="font-mono font-bold">+AED {visibleTotals.totalInflow.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Outflows:</span>
                      <span className="font-mono font-bold">-AED {visibleTotals.totalOutflow.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Total Volume:</span>
                      <span className="font-mono font-bold">AED {visibleTotals.totalVolume.toLocaleString()}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                    Net Total
                  </div>
                  <div className={`font-mono font-extrabold text-sm ${visibleTotals.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {visibleTotals.net >= 0 ? '+' : ''}AED {visibleTotals.net.toLocaleString()}
                  </div>
                </td>
                <td colSpan={2} className="p-4 text-right align-middle text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Verified Real-time Sum
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Add Financial Transaction Record</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 pt-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Transaction Classification *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'deposit', category: 'Client Retainer Deposit' })}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'deposit'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    + Client Deposit
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'service_fee', category: 'PRO / Document Clearing Fee' })}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'service_fee'
                        ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    + Service Fee
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'gov_fee', category: 'ICP / GDRFA Visa Lodgement Fee' })}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'gov_fee'
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    - Government Fee
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'typing_fee', category: 'Tasheel / Typing Center Fee' })}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'typing_fee'
                        ? 'bg-cyan-50 dark:bg-cyan-950 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    + Typing Fee
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: 'Operational / Vendor Expense' })}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'expense'
                        ? 'bg-amber-50 dark:bg-amber-950 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    - Operational Exp
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'refund', category: 'Client Refund / Cancellation' })}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'refund'
                        ? 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    - Client Refund
                  </button>
                </div>
              </div>

              {/* Company & Client Association */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company Branch *
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Associated Client (Optional)
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => {
                      const cl = clients.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        clientId: e.target.value,
                        clientName: cl?.fullName || '',
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">None (Company Operational)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.refNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category / Purpose *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. ICP Golden Visa Fee"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (AED) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card / Gateway</option>
                    <option value="Corporate Card">Corporate PRO Card</option>
                    <option value="Cheque">Corporate Cheque</option>
                    <option value="Cash">Cash / Petty Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* References */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Reference / Bank / Card Auth #</label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    placeholder="ENBD-TR-998822"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    placeholder="RCP-2026-009"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes & Details</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Government transaction reference or reason..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Save Transaction Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <span>Edit Transaction #{selectedTx.transactionNumber}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category / Purpose</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (AED)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Corporate Card">Corporate PRO Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending Settlement</option>
                    <option value="failed">Failed / Bounced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Voucher Modal */}
      {showReceiptModal && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Official Payment Voucher</h3>
                  <p className="text-[10px] text-slate-500">ADCS Master Financial Services</p>
                </div>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <div className="p-4 my-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Voucher Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedTx.transactionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account / Client:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedTx.clientName || 'ADCS Corporate Central'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method & Reference:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedTx.paymentMethod} {selectedTx.referenceNumber ? `(${selectedTx.referenceNumber})` : ''}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Amount Received / Paid:</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  AED {selectedTx.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
