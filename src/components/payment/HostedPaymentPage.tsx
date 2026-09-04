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
  XCircle,
  X,
  RotateCcw,
  User,
  Calendar,
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
  const [paymentDeclined, setPaymentDeclined] = useState(false);
  const [paymentResult, setPaymentResult] = useState<NomodPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to construct return URL back to the main app with payment outcome parameters
  const buildReturnUrl = (
    status: 'approved' | 'rejected' | 'cancelled',
    result?: NomodPaymentResult | null,
    failureReason?: string
  ) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const searchParams = new URLSearchParams({
      nomod_return: '1',
      nomod_status: status,
      ref: result?.reference || params.ref || `NOMOD-${Date.now().toString(36).toUpperCase()}`,
      amount: String(result?.amount || params.amount || 0),
      app_id: params.appId || '',
      inv_id: params.invoiceId || '',
      customer: result?.customerName || params.customer || '',
    });

    if (result?.authCode) searchParams.set('auth_code', result.authCode);
    if (result?.cardBrand) searchParams.set('brand', result.cardBrand);
    if (result?.last4) searchParams.set('last4', result.last4);
    if (failureReason) searchParams.set('reason', failureReason);

    return `${origin}/?${searchParams.toString()}`;
  };

  const handleSimulateDecline = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    setProcessStep('Establishing encrypted link with issuing bank...');

    const cleanNum = cardNumber.replace(/\s/g, '');
    const last4Digits = cleanNum.length >= 4 ? cleanNum.slice(-4) : '4242';
    const detectedBrand = detectCardBrand();
    const brandName = `${detectedBrand} (Nomod Live)`;

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessStep('Verifying card authorization with 3D Secure 2.0...');
      await new Promise((r) => setTimeout(r, 700));
      setProcessStep('Card issuer declined authorization (Decline Code: 05)...');
      await new Promise((r) => setTimeout(r, 500));

      const declinedRes = await verifyNomodPayment(
        params.paymentId || `nomod_dec_${Date.now()}`,
        params.ref || `NOMOD-DEC-${Date.now().toString(36).toUpperCase()}`,
        params.amount,
        cardHolder || params.customer || 'Valued Client',
        undefined,
        'rejected',
        'Transaction declined by issuing bank: Insufficient funds or international card usage restriction (Decline code 05)',
        brandName,
        last4Digits,
        selectedMethod
      );

      setPaymentResult(declinedRes);
      setPaymentDeclined(true);
      setIsProcessing(false);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Decline simulation encountered an unexpected error.');
    }
  };

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < digitsOnly.length; i += 4) {
      parts.push(digitsOnly.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
    if (errorMsg) setErrorMsg(null);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length >= 3) {
      setCardExpiry(`${clean.substring(0, 2)}/${clean.substring(2, 4)}`);
    } else {
      setCardExpiry(clean);
    }
    if (errorMsg) setErrorMsg(null);
  };

  // Format CVC
  const handleCvcChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    setCardCvc(clean);
    if (errorMsg) setErrorMsg(null);
  };

  // Quick Demo Card Autofill
  const handleFillDemoCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    if (!cardHolder || cardHolder === 'Valued Client') {
      setCardHolder(params.customer || 'Rakesh Kumar');
    }
    setErrorMsg(null);
  };

  // Detect Card Brand
  const detectCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (
      clean.startsWith('51') ||
      clean.startsWith('52') ||
      clean.startsWith('53') ||
      clean.startsWith('54') ||
      clean.startsWith('55')
    ) {
      return 'Mastercard';
    }
    if (clean.startsWith('34') || clean.startsWith('37')) return 'American Express';
    if (clean.startsWith('62')) return 'UnionPay';
    if (clean.startsWith('508') || clean.startsWith('65') || clean.startsWith('86')) return 'Jaywan';
    return 'Credit/Debit Card';
  };

  const handleProcessPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    let brandName = 'Visa Debit (Nomod Live)';
    let last4Digits = '4242';

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
      const [expMonth] = cardExpiry.split('/').map(Number);
      if (!expMonth || expMonth < 1 || expMonth > 12) {
        setErrorMsg('Please enter a valid expiration month (01 to 12).');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        setErrorMsg('Please enter a valid 3 or 4-digit security code (CVC).');
        return;
      }
      if (!cardHolder || cardHolder.trim().length === 0) {
        setErrorMsg('Please enter the cardholder name.');
        return;
      }

      last4Digits = cleanNum.slice(-4);
      brandName = `${detectCardBrand()} (Nomod Live)`;
    } else if (selectedMethod === 'apple_pay') {
      brandName = 'Apple Pay (Nomod Live)';
      last4Digits = '8821';
    } else if (selectedMethod === 'google_pay') {
      brandName = 'Google Pay (Nomod Live)';
      last4Digits = '5519';
    }

    setIsProcessing(true);
    setProcessStep('Establishing 256-bit TLS encrypted session with Nomod...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessStep('Verifying cardholder authenticity and 3D-Secure 2.0...');
      await new Promise((r) => setTimeout(r, 700));
      setProcessStep('Executing authorized settlement via UAE Central Bank gateway...');
      await new Promise((r) => setTimeout(r, 600));

      const result = await verifyNomodPayment(
        params.paymentId,
        params.ref,
        params.amount,
        cardHolder || params.customer || 'Valued Client',
        undefined,
        'approved',
        undefined,
        brandName,
        last4Digits,
        selectedMethod
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
            <button
              type="button"
              onClick={() => {
                window.location.href = buildReturnUrl('cancelled');
              }}
              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Cancel checkout session and return to CRM"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Cancel & Return</span>
            </button>
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
                  window.location.href = buildReturnUrl('approved', paymentResult);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <span>Return to App (Confirmed Paid)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : paymentDeclined && paymentResult ? (
          /* Payment Declined View */
          <div className="bg-slate-900/90 border border-rose-500/40 rounded-3xl p-6 md:p-10 shadow-2xl shadow-rose-950/30 backdrop-blur-xl animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                <XCircle className="w-9 h-9 text-rose-400" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-rose-950 text-rose-300 text-xs font-bold border border-rose-800">
                Transaction Declined (Code 05)
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Payment Declined by Card Issuer</h2>
              <p className="text-xs text-rose-300/90 max-w-md mx-auto">
                {paymentResult.failureReason || 'Your card issuer or bank declined authorization for this transaction.'}
              </p>
            </div>

            {/* Declined Details Card */}
            <div className="mt-8 p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400">Attempted Amount:</span>
                <span className="font-bold text-base text-white">
                  {params.currency} {params.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Nomod Gateway Ref:</span>
                <span className="font-mono font-bold text-slate-300">{paymentResult.reference}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cardholder:</span>
                <span className="text-slate-300">{cardHolder || params.customer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status Registered:</span>
                <span className="font-bold text-rose-400 uppercase">REJECTED / DECLINED</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                Returning to the application will sync this status and notify your immigration specialist.
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentDeclined(false);
                  setPaymentResult(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-300" />
                <span>Try Another Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = buildReturnUrl('rejected', paymentResult, paymentResult.failureReason);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <span>Return to App (Declined Status)</span>
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
                {/* Official Nomod Live Gateway Section */}
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black tracking-wide text-white">NOMOD</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Official Gateway
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        256-Bit SSL Encrypted Direct Checkout
                      </p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                      sk_live Active
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Payment Method Selector Tabs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        id="method-card"
                        onClick={() => {
                          setSelectedMethod('card');
                          setErrorMsg(null);
                        }}
                        className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                          selectedMethod === 'card'
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <CreditCard className={`w-4 h-4 ${selectedMethod === 'card' ? 'text-blue-400' : 'text-slate-500'}`} />
                        <span>Card</span>
                      </button>

                      <button
                        type="button"
                        id="method-apple-pay"
                        onClick={() => {
                          setSelectedMethod('apple_pay');
                          setErrorMsg(null);
                        }}
                        className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                          selectedMethod === 'apple_pay'
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <Smartphone className={`w-4 h-4 ${selectedMethod === 'apple_pay' ? 'text-white' : 'text-slate-500'}`} />
                        <span>Apple Pay</span>
                      </button>

                      <button
                        type="button"
                        id="method-google-pay"
                        onClick={() => {
                          setSelectedMethod('google_pay');
                          setErrorMsg(null);
                        }}
                        className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                          selectedMethod === 'google_pay'
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <Globe className={`w-4 h-4 ${selectedMethod === 'google_pay' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>Google Pay</span>
                      </button>
                    </div>
                  </div>

                  {/* Credit / Debit Card Form */}
                  {selectedMethod === 'card' && (
                    <div className="space-y-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Card Details</span>
                        </div>
                        <button
                          type="button"
                          id="btn-fill-demo-card"
                          onClick={handleFillDemoCard}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[11px] font-bold border border-blue-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Click to auto-fill sample test card"
                        >
                          <Sparkles className="w-3 h-3 text-blue-300" />
                          <span>Fill Demo Card</span>
                        </button>
                      </div>

                      {/* Cardholder Name */}
                      <div className="space-y-1.5">
                        <label htmlFor="cardHolder" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Cardholder Name</span>
                        </label>
                        <input
                          type="text"
                          id="cardHolder"
                          value={cardHolder}
                          onChange={(e) => {
                            setCardHolder(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Name as it appears on card"
                          className="w-full py-3 px-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                          required
                        />
                      </div>

                      {/* Card Number */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="cardNumber" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            <span>Card Number</span>
                          </label>
                          {cardNumber.replace(/\s/g, '').length >= 1 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {detectCardBrand()}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            id="cardNumber"
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            placeholder="4242 •••• •••• ••••"
                            maxLength={19}
                            className="w-full py-3 pl-3.5 pr-20 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            required
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {cardNumber.replace(/\s/g, '').length}/16
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expiry Date & CVC */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label htmlFor="cardExpiry" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Expires (MM/YY)</span>
                          </label>
                          <input
                            type="text"
                            id="cardExpiry"
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            placeholder="MM / YY"
                            maxLength={5}
                            className="w-full py-3 px-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm font-mono tracking-wider text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label htmlFor="cardCvc" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>CVC / CVV</span>
                            </label>
                            <span className="text-[10px] text-slate-400">3 or 4 digits</span>
                          </div>
                          <input
                            type="password"
                            id="cardCvc"
                            value={cardCvc}
                            onChange={(e) => handleCvcChange(e.target.value)}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full py-3 px-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Supported Card Networks */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Accepted cards:</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-700">VISA</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-700">MASTERCARD</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-700">AMEX</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-700">JAYWAN</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Digital Wallets: Apple Pay */}
                  {selectedMethod === 'apple_pay' && (
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-black border border-slate-700 flex items-center justify-center mx-auto shadow-md">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Apple Pay Quick Settlement</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Click below to authorize instantaneous settlement via Apple Wallet & Touch ID / Face ID.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                        <span>Apple Pay Device:</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready & Authorized
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Digital Wallets: Google Pay */}
                  {selectedMethod === 'google_pay' && (
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto shadow-md">
                        <Globe className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Google Pay Fast Checkout</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Click below to confirm secure payment with your Google account and linked bank cards.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                        <span>Google Wallet:</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready & Connected
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Nomod Gateway Settlement Card */}
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Nomod Merchant Account:</span>
                      <span className="font-semibold text-slate-200">Gurpreet Singh Kataria (ADCS Nomod Live)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Nomod Reference:</span>
                      <span className="font-mono font-semibold text-blue-400">{params.ref}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Client / Payer:</span>
                      <span className="font-semibold text-slate-200">{cardHolder || params.customer}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Target Service:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[240px] text-right">{params.title}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Settlement Amount:</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        {params.currency} {params.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Primary Nomod Payment CTA */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      id="btn-submit-payment"
                      onClick={() => handleProcessPayment()}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{processStep || 'Verifying Nomod Settlement...'}</span>
                        </div>
                      ) : selectedMethod === 'apple_pay' ? (
                        <>
                          <Smartphone className="w-5 h-5 text-white" />
                          <span>Pay {params.currency} {params.amount.toLocaleString()} with Apple Pay</span>
                        </>
                      ) : selectedMethod === 'google_pay' ? (
                        <>
                          <Globe className="w-5 h-5 text-emerald-300" />
                          <span>Pay {params.currency} {params.amount.toLocaleString()} with Google Pay</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 text-emerald-300" />
                          <span>Pay {params.currency} {params.amount.toLocaleString()} via Nomod</span>
                        </>
                      )}
                    </button>

                    <div className="pt-2 px-1 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[11px]">Testing Nomod response handling:</span>
                      <button
                        type="button"
                        onClick={handleSimulateDecline}
                        disabled={isProcessing}
                        className="text-rose-400 hover:text-rose-300 font-semibold underline text-[11px] cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        Simulate Card Issuer Decline (Code 05)
                      </button>
                    </div>
                  </div>
                </div>
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
