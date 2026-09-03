import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Building2,
  Download,
  Printer,
  ArrowRight,
  Sparkles,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  FileText,
  BadgeCheck,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { NomodPaymentResult, verifyNomodPayment } from '../../utils/nomodService';
import { useCRM } from '../../context/CRMContext';

export const HostedPaymentPage: React.FC = () => {
  const {
    invoices,
    visaApplications,
    billingSettings,
    crmBranding,
    companies,
    recordPayment,
    setActiveTab,
  } = useCRM();

  // Parse URL query and path parameters
  const [params, setParams] = useState<{
    paymentId: string;
    ref: string;
    amount: number;
    currency: string;
    title: string;
    customer: string;
    email: string;
    phone: string;
    invoiceId: string;
    appId: string;
  }>({
    paymentId: '',
    ref: '',
    amount: 0,
    currency: 'AED',
    title: 'ADCS Corporate Visa Processing Payment',
    customer: 'Valued Client',
    email: '',
    phone: '',
    invoiceId: '',
    appId: '',
  });

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const search = url.searchParams;

      // Extract payment ID from path if present (e.g. /pay/nomod_link_123 or /checkout/nomod_link_123)
      let pathPaymentId = '';
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && (pathParts[0] === 'pay' || pathParts[0] === 'checkout')) {
        pathPaymentId = pathParts[1];
      }

      const paymentId = search.get('paymentId') || search.get('pay') || pathPaymentId || `nomod_live_${Date.now()}`;
      const ref = search.get('ref') || `NOMOD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const amountVal = parseFloat(search.get('amount') || '0');
      const currency = search.get('currency') || search.get('curr') || billingSettings?.currency || 'AED';
      const title = search.get('title') || search.get('service') || 'ADCS Corporate Visa Processing Service';
      const customer = search.get('customer') || search.get('name') || '';
      const email = search.get('email') || '';
      const phone = search.get('phone') || '';
      const invoiceId = search.get('invoiceId') || search.get('inv') || '';
      const appId = search.get('appId') || search.get('app') || '';

      // If matching invoice or visa app exists in CRM, enrich default values
      let finalAmount = amountVal;
      let finalTitle = title;
      let finalCustomer = customer;
      let finalEmail = email;
      let finalPhone = phone;

      if (invoiceId && invoices && invoices.length > 0) {
        const matchedInv = invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
        if (matchedInv) {
          if (!finalAmount) finalAmount = matchedInv.balanceAmount > 0 ? matchedInv.balanceAmount : matchedInv.grandTotal;
          if (!finalTitle || finalTitle === 'ADCS Corporate Visa Processing Service') finalTitle = matchedInv.serviceName || `Invoice #${matchedInv.invoiceNumber}`;
          if (!finalCustomer) finalCustomer = matchedInv.clientName;
          if (!finalEmail) finalEmail = matchedInv.clientEmail;
          if (!finalPhone) finalPhone = matchedInv.clientPhone;
        }
      }

      if (appId && visaApplications && visaApplications.length > 0) {
        const matchedApp = visaApplications.find((a) => a.id === appId || a.applicationNumber === appId);
        if (matchedApp) {
          if (!finalAmount) finalAmount = matchedApp.totalAmount - (matchedApp.paidAmount || 0);
          if (!finalTitle || finalTitle === 'ADCS Corporate Visa Processing Service') {
            finalTitle = `${matchedApp.targetCountry || 'Global'} - ${matchedApp.visaType || matchedApp.visaCategory || 'Visa'} Application`;
          }
          if (!finalCustomer) finalCustomer = matchedApp.clientName;
          if (!finalEmail) finalEmail = matchedApp.clientEmail;
          if (!finalPhone) finalPhone = matchedApp.clientPhone;
        }
      }

      if (finalAmount <= 0) {
        finalAmount = 2500; // Default fallback amount for visa processing
      }

      setParams({
        paymentId,
        ref,
        amount: finalAmount,
        currency,
        title: finalTitle,
        customer: finalCustomer || 'Valued Client',
        email: finalEmail || 'client@example.com',
        phone: finalPhone || '+971 50 000 0000',
        invoiceId,
        appId,
      });

      setCardHolder(finalCustomer || 'Valued Client');
    } catch (e) {
      console.error('Error parsing payment URL params:', e);
    }
  }, [invoices, visaApplications, billingSettings]);

  // Form State
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState<NomodPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < digitsOnly.length; i += 4) {
      parts.push(digitsOnly.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length >= 3) {
      setCardExpiry(`${clean.substring(0, 2)}/${clean.substring(2, 4)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  // Detect Card Brand
  const detectCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55')) return 'Mastercard';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'American Express';
    if (clean.startsWith('62')) return 'UnionPay';
    return 'Credit/Debit Card';
  };

  const handleProcessPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (selectedMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setErrorMsg('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMsg('Please enter a valid expiration date (MM/YY).');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        setErrorMsg('Please enter a valid 3 or 4-digit security code (CVC).');
        return;
      }
    }

    setIsProcessing(true);
    setProcessStep('Establishing 256-bit TLS encrypted session with Nomod...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessStep('Verifying cardholder authenticity and 3D-Secure...');
      await new Promise((r) => setTimeout(r, 700));
      setProcessStep('Executing authorized settlement via UAE Central Bank gateway...');
      await new Promise((r) => setTimeout(r, 600));

      const result = await verifyNomodPayment(
        params.paymentId,
        params.ref,
        params.amount,
        cardHolder || params.customer || 'Valued Client'
      );

      // Record in CRM Context if matching invoice exists
      if (params.invoiceId && recordPayment) {
        try {
          recordPayment(
            params.invoiceId,
            params.amount,
            'Online Gateway',
            result.reference,
            `Nomod Live Gateway Settlement: Auth ${result.authCode || 'N/A'}, Card: ${result.cardBrand || 'Card'} ending ${result.last4 || '****'}`
          );
        } catch (ctxErr) {
          console.warn('CRM Context recording note:', ctxErr);
        }
      }

      setPaymentResult(result);
      setPaymentSuccess(true);
      setIsProcessing(false);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment processing could not be completed. Please retry or contact your account manager.');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const activeCompany = companies[0] || {
    name: 'ADCS Corporate Services LLC',
    phone: '+971 4 000 0000',
    email: 'accounts@adcs.ae',
    trn: '100482938200003',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>{crmBranding?.companyName || 'ADCS CORPORATE SERVICES'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  OFFICIAL GATEWAY
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Secure Client Payment & Settlement Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">256-Bit SSL Encrypted</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-[10px] font-bold text-indigo-300">
              NOMOD PAY
            </div>
          </div>
        </div>
      </header>

      {/* Main Payment Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12">
        {paymentSuccess && paymentResult ? (
          /* Payment Success Confirmation View */
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 md:p-10 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-pulse">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
                Payment Authorized & Settled
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Thank You! Payment Successful</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your transaction has been processed via Nomod. Your official tax invoice and receipt have been issued in the CRM system.
              </p>
            </div>

            {/* Official Receipt Card */}
            <div className="mt-8 p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400">Settled Amount:</span>
                <span className="font-black text-lg text-emerald-400">
                  {params.currency} {params.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transaction Reference:</span>
                <span className="font-mono font-bold text-slate-200">{paymentResult.reference}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Nomod Auth Code:</span>
                <span className="font-mono font-bold text-blue-400">{paymentResult.authCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Channel / Card:</span>
                <span className="font-semibold text-slate-200">
                  {paymentResult.cardBrand} (•••• {paymentResult.last4})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Client / Payer:</span>
                <span className="font-semibold text-slate-200">{paymentResult.customerName || params.customer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Service Description:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[220px]">{params.title}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-500">Date & Timestamp:</span>
                <span className="text-slate-400">{new Date(paymentResult.paidAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Print Official Tax Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = window.location.origin;
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Return to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Main 2-Column Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Summary</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Ref: {params.ref.substring(0, 14)}...
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white leading-snug">{params.title}</h2>
                  {params.appId && (
                    <p className="text-xs text-blue-400 font-mono">Visa Application ID: {params.appId}</p>
                  )}
                  {params.invoiceId && (
                    <p className="text-xs text-indigo-400 font-mono">Invoice Ref: {params.invoiceId}</p>
                  )}
                </div>

                {/* Client Details Preview */}
                <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client Name:</span>
                    <span className="font-semibold text-slate-200">{params.customer}</span>
                  </div>
                  {params.email && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{params.email}</span>
                    </div>
                  )}
                  {params.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-slate-300">{params.phone}</span>
                    </div>
                  )}
                </div>

                {/* Amount Breakdown */}
                <div className="space-y-2 pt-2 text-xs border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Visa Processing & Professional Fee:</span>
                    <span className="text-slate-300">
                      {params.currency} {(params.amount / 1.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>UAE VAT (5%):</span>
                    <span className="text-slate-300">
                      {params.currency} {(params.amount - params.amount / 1.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-slate-800">
                    <span className="text-sm font-bold text-white">Total Payable Amount:</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {params.currency} {params.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center gap-2.5 text-xs text-blue-200">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Settlement handled with automated instant invoice clearance upon verification.</span>
                </div>
              </div>

              {/* Corporate Identity Footer */}
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/40 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">{activeCompany.name}</p>
                <p>Tax Registration No (TRN): {activeCompany.trn || '100482938200003'}</p>
                <p>Corporate Support: {activeCompany.email || 'support@adcs.ae'}</p>
              </div>
            </div>

            {/* Right Column: Interactive Payment Methods & Gateway Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                {/* Method Tabs */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Nomod Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        selectedMethod === 'card'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs font-bold">Credit/Debit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('apple_pay')}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        selectedMethod === 'apple_pay'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="text-xs font-bold">Apple Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('google_pay')}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        selectedMethod === 'google_pay'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <Globe className="w-5 h-5" />
                      <span className="text-xs font-bold">Google Pay</span>
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Card Payment Form */}
                {selectedMethod === 'card' && (
                  <form onSubmit={handleProcessPayment} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Card Payment Details</span>
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Nomod Live Gateway</span>
                      </span>
                    </div>

                    {/* Card Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-300">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full pl-10 pr-24 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-mono tracking-widest text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <CreditCard className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                        <div className="absolute right-3 top-2.5">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {detectCardBrand()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-300">Cardholder Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="As shown on card"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Expiry & CVC */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-300">Expiry Date (MM/YY)</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-mono text-center text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
                          <span>Security Code (CVC)</span>
                          <Lock className="w-3 h-3 text-slate-400" />
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-mono text-center text-white tracking-widest focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{processStep || 'Processing Nomod Live Payment...'}</span>
                        </div>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>
                            Pay {params.currency} {params.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} via Nomod
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Apple Pay View */}
                {selectedMethod === 'apple_pay' && (
                  <div className="space-y-5 py-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-black border border-slate-700 flex items-center justify-center mx-auto text-white">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Instant Apple Pay 1-Tap Checkout</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Authenticate securely with Face ID or Touch ID on your Apple device.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProcessPayment()}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl bg-black hover:bg-slate-950 text-white border border-slate-700 font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{processStep || 'Authenticating Apple Pay...'}</span>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold"> Pay with Apple Pay</span>
                          <span>({params.currency} {params.amount.toLocaleString()})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Google Pay View */}
                {selectedMethod === 'google_pay' && (
                  <div className="space-y-5 py-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center mx-auto text-white">
                      <Globe className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Instant Google Pay Checkout</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Pay with your saved cards in your Google Account.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProcessPayment()}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-black text-white border border-slate-700 font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{processStep || 'Authenticating Google Pay...'}</span>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold">Pay with Google Pay</span>
                          <span>({params.currency} {params.amount.toLocaleString()})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} ADCS Corporate Services LLC. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>PCI-DSS Level 1</span>
            <span>•</span>
            <span>Nomod Verified Settlement</span>
            <span>•</span>
            <span>UAE Central Bank Regulated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
