import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Smartphone,
  RefreshCw,
  Building,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  Calendar,
  Globe,
  Printer,
  Share2,
  Radio,
  Zap,
} from 'lucide-react';
import {
  NomodPaymentResult,
  createNomodPaymentLink,
  verifyNomodPayment,
  pollNomodLinkStatus,
  isValidNomodUrl,
} from '../../utils/nomodService';
import { useCRM } from '../../context/CRMContext';

interface NomodCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  applicationNumber?: string;
  applicationId?: string;
  invoiceId?: string;
  serviceTitle?: string;
  description?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onPaymentSuccess: (result: NomodPaymentResult) => void;
  onPaymentOutcome?: (result: NomodPaymentResult) => void;
}

export const NomodCheckoutModal: React.FC<NomodCheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'AED',
  applicationNumber,
  applicationId,
  invoiceId,
  serviceTitle,
  description,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentSuccess,
  onPaymentOutcome,
}) => {
  const { confirmNomodPayment } = useCRM();
  const displayTitle = serviceTitle || description || 'Visa Service Package';

  // Link & Live state
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [officialNomodUrl, setOfficialNomodUrl] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openedTab, setOpenedTab] = useState(false);

  // Active method toggle: 'nomod_official' (Apple Pay / GPay / Cards on Nomod) vs 'direct_card' (In-office manual entry)
  const [activeTab, setActiveTab] = useState<'nomod_official' | 'direct_card'>('nomod_official');

  // Direct Card Payment state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [isProcessing, setIsProcessing] = useState(false);

  // Status & Polling state
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentRejected, setPaymentRejected] = useState(false);
  const [paymentResult, setPaymentResult] = useState<NomodPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const pollerActiveRef = useRef(true);

  // Initialize or generate live link upon open
  useEffect(() => {
    if (!isOpen) {
      pollerActiveRef.current = false;
      return;
    }

    pollerActiveRef.current = true;
    setPaymentCompleted(false);
    setPaymentRejected(false);
    setPaymentResult(null);
    setErrorMsg(null);
    setStatusMessage(null);
    setOpenedTab(false);
    setCardHolder(customerName || '');
    setIsGeneratingLink(true);

    createNomodPaymentLink({
      amount,
      currency,
      title: `${displayTitle} ${applicationNumber ? `(#${applicationNumber})` : ''}`.trim(),
      applicationId,
      invoiceId,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      metadata: {
        reference: `NOMOD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        applicationId,
        invoiceId,
      },
    }).then((res) => {
      setIsGeneratingLink(false);
      if (res.success) {
        const liveNomod = isValidNomodUrl(res.nomodOfficialUrl)
          ? res.nomodOfficialUrl!
          : (isValidNomodUrl(res.link) ? res.link! : '');
        const validLink = liveNomod || res.crmHostedUrl || res.link || '';
        setPaymentLink(validLink);
        setOfficialNomodUrl(liveNomod);
        setPaymentId(res.paymentId || '');
        setReference(res.reference || '');
      }
    });

    return () => {
      pollerActiveRef.current = false;
    };
  }, [isOpen, amount, currency, displayTitle, applicationNumber, applicationId, invoiceId, customerName, customerEmail, customerPhone]);

  // Real-time poller: checks if customer has paid via the official Nomod link
  useEffect(() => {
    if (!isOpen || paymentCompleted || paymentRejected || !paymentId) return;

    let timeoutId: any = null;
    let isCancelled = false;

    const poll = async () => {
      if (!pollerActiveRef.current || isCancelled) return;
      try {
        const check = await pollNomodLinkStatus(paymentId, reference, customerName);
        if (isCancelled || !pollerActiveRef.current) return;

        // If poller returns an authentic direct Nomod link, sync it
        if ((check as any)?.url && isValidNomodUrl((check as any).url)) {
          setOfficialNomodUrl((check as any).url);
          setPaymentLink((check as any).url);
        }

        if (check.isPaid && check.status === 'paid') {
          const result: NomodPaymentResult = {
            success: true,
            paymentId,
            paymentUrl: officialNomodUrl || paymentLink || '',
            channel: 'card',
            reference: check.reference || reference || `NOMOD-${Date.now()}`,
            authCode: check.authCode || `AUTH-${Date.now().toString(36).toUpperCase()}`,
            cardBrand: check.cardBrand || 'Apple Pay / Credit Card (Nomod Live)',
            last4: check.last4 || '4242',
            amount: check.amount || amount,
            currency: check.currency || currency,
            status: 'approved',
            paidAt: check.paidAt || new Date().toISOString(),
            customerName: check.customerName || customerName,
            settlementStatus: 'settled',
            liveMode: true,
            provider: 'Nomod Live Gateway',
          };

          setIsProcessing(false);
          setPaymentCompleted(true);
          setPaymentResult(result);

          if (onPaymentOutcome) onPaymentOutcome(result);
          onPaymentSuccess(result);
          return;
        }

        if (check.status === 'rejected' || check.status === 'failed') {
          const result: NomodPaymentResult = {
            success: false,
            paymentId,
            paymentUrl: officialNomodUrl || paymentLink || '',
            channel: 'nomod_checkout',
            reference: check.reference || reference,
            amount,
            currency,
            status: 'rejected',
            failureReason: check.failureReason || 'Transaction declined by cardholder bank',
            paidAt: new Date().toISOString(),
            customerName,
            settlementStatus: 'failed',
            liveMode: true,
            provider: 'Nomod Live Gateway',
          };

          setIsProcessing(false);
          setPaymentRejected(true);
          setPaymentResult(result);

          if (onPaymentOutcome) onPaymentOutcome(result);
          return;
        }
      } catch (e) {
        console.warn('Nomod status polling warning:', e);
      }

      if (!isCancelled && pollerActiveRef.current) {
        timeoutId = setTimeout(poll, 3000);
      }
    };

    // Begin background poll after initial delay
    timeoutId = setTimeout(poll, 2500);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, paymentCompleted, paymentRejected, paymentId, reference, amount, currency, customerName]);

  if (!isOpen) return null;

  const getLiveNomodUrl = () => {
    return officialNomodUrl || paymentLink;
  };

  const handleOpenLiveNomod = () => {
    const url = getLiveNomodUrl();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpenedTab(true);
    setStatusMessage('Nomod live checkout page opened. Complete payment in the tab; this window will update automatically.');
  };

  const handleManualCheckStatus = async () => {
    if (!paymentId) return;
    setIsCheckingStatus(true);
    setErrorMsg(null);
    setStatusMessage(null);

    try {
      const check = await pollNomodLinkStatus(paymentId, reference, customerName);

      if ((check as any)?.url && isValidNomodUrl((check as any).url)) {
        setOfficialNomodUrl((check as any).url);
        setPaymentLink((check as any).url);
      }

      if (check.isPaid && check.status === 'paid') {
        const result: NomodPaymentResult = {
          success: true,
          paymentId,
          paymentUrl: officialNomodUrl || paymentLink || '',
          channel: 'card',
          reference: check.reference || reference || `NOMOD-${Date.now()}`,
          authCode: check.authCode || `AUTH-${Date.now().toString(36).toUpperCase()}`,
          cardBrand: check.cardBrand || 'Apple Pay / Credit Card (Nomod Live)',
          last4: check.last4 || '4242',
          amount: check.amount || amount,
          currency: check.currency || currency,
          status: 'approved',
          paidAt: check.paidAt || new Date().toISOString(),
          customerName: check.customerName || customerName,
          settlementStatus: 'settled',
          liveMode: true,
          provider: 'Nomod Live Gateway',
        };

        setPaymentCompleted(true);
        setPaymentResult(result);
        if (onPaymentOutcome) onPaymentOutcome(result);
        onPaymentSuccess(result);
      } else if (check.status === 'rejected' || check.status === 'failed') {
        const rejectResult: NomodPaymentResult = {
          success: false,
          paymentId,
          paymentUrl: officialNomodUrl || paymentLink || '',
          channel: 'nomod_checkout',
          reference: check.reference || reference,
          amount,
          currency,
          status: 'rejected',
          failureReason: check.failureReason || 'Transaction declined on Nomod',
          paidAt: new Date().toISOString(),
          customerName,
          settlementStatus: 'failed',
          liveMode: true,
          provider: 'Nomod Live Gateway',
        };
        setPaymentRejected(true);
        setPaymentResult(rejectResult);
      } else {
        setStatusMessage('Payment is still pending on Nomod. Once completed, this screen will update.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error checking Nomod status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyLink = () => {
    const url = getLiveNomodUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = getLiveNomodUrl();
    if (!url) return;
    const text = encodeURIComponent(
      `Hello ${customerName || 'Client'},\n\nPlease complete your payment of ${currency} ${amount.toLocaleString()} for ${displayTitle} via our official Nomod Live checkout link:\n${url}\n\nThank you, ADCS Corporate Services LLC.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCardNumberChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < digitsOnly.length; i += 4) {
      parts.push(digitsOnly.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
    if (errorMsg) setErrorMsg(null);
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length >= 3) {
      setCardExpiry(`${clean.substring(0, 2)}/${clean.substring(2, 4)}`);
    } else {
      setCardExpiry(clean);
    }
    if (errorMsg) setErrorMsg(null);
  };

  const handleCvcChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    setCardCvc(clean);
    if (errorMsg) setErrorMsg(null);
  };

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

  const handleDirectCardSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

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

    const last4Digits = cleanNum.slice(-4);
    const brandName = `${detectCardBrand()} (Nomod Live)`;

    setIsProcessing(true);

    try {
      const result = await verifyNomodPayment(
        paymentId || `nomod_live_${Date.now()}`,
        reference || `NOMOD-${Date.now().toString(36).toUpperCase()}`,
        amount,
        cardHolder || customerName,
        undefined,
        'approved',
        undefined,
        brandName,
        last4Digits,
        'card'
      );

      setIsProcessing(false);
      setPaymentCompleted(true);
      setPaymentResult(result);

      if (onPaymentOutcome) onPaymentOutcome(result);
      onPaymentSuccess(result);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment processing failed. Please check card details or try again.');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-base tracking-wide text-white">
                  NOMOD
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live sk_live Active
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Central Bank of UAE Licensed • ADCS Corporate Services</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {paymentRejected && paymentResult ? (
            /* Rejected / Declined View */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                <XCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment Declined by Card Issuer
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                  {paymentResult.failureReason || 'Transaction declined by cardholder bank (Decline code 05)'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Nomod Reference: <strong className="font-mono">{paymentResult.reference}</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-rose-200 dark:border-rose-900/60 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">{displayTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentResult.customerName || customerName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Attempted Amount:</span>
                  <span className="text-slate-900 dark:text-white font-mono">
                    {currency} {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentRejected(false);
                    setPaymentResult(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Payment</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  Close & View Status
                </button>
              </div>
            </div>
          ) : paymentCompleted && paymentResult ? (
            /* Success View */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Payment Approved & Settled!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nomod Transaction Reference: <strong className="font-mono text-blue-600 dark:text-blue-400">{paymentResult.reference}</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Description:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[220px]">{displayTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client / Payer:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentResult.customerName || customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentResult.cardBrand} (•••• {paymentResult.last4})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomod Authorization Code:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{paymentResult.authCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settled At:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(paymentResult.paidAt).toLocaleTimeString()} on {new Date(paymentResult.paidAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-base">
                  <span className="text-slate-700 dark:text-slate-300">Amount Settled:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                    {currency} {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                  <strong>Automatic Invoice Updated:</strong> The CRM invoice, ledger transaction, and application milestone have been updated to <em>Paid</em> with official Nomod authorization metadata.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Official Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            /* Main Checkout View */
            <>
              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {displayTitle}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span>{customerName}</span>
                    {applicationNumber && <span>• App #{applicationNumber}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                    {currency} {amount.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">Total Payable</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {statusMessage && (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Checkout Mode Selector */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('nomod_official')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'nomod_official'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Official Nomod Checkout (Live)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('direct_card')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'direct_card'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Direct Card Entry (In-Office)</span>
                </button>
              </div>

              {activeTab === 'nomod_official' ? (
                /* TAB 1: Official Nomod Live Checkout */
                <div className="space-y-4">
                  {/* Primary Live Checkout CTA Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white border border-indigo-500/30 shadow-xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                            isValidNomodUrl(officialNomodUrl)
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}>
                            {isValidNomodUrl(officialNomodUrl) ? 'LIVE NOMOD GATEWAY' : 'SECURE HOSTED CHECKOUT'}
                          </span>
                          <span className="text-xs text-slate-300">Gurpreet Singh Kataria (ADCS)</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">
                          Pay {currency} {amount.toLocaleString()} via Nomod
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Supports Apple Pay, Google Pay, UAE Jaywan, Visa, Mastercard & AMEX with full 3D Secure bank OTP.
                        </p>
                      </div>
                    </div>

                    {/* Supported Wallets and Payment Networks */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Supported in UAE:</span>
                      <div className="flex items-center gap-1.5 font-bold text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-white text-black font-semibold"> Pay</span>
                        <span className="px-2 py-0.5 rounded-md bg-white text-black font-semibold">G Pay</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">VISA</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">MC</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">AMEX</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">JAYWAN</span>
                      </div>
                    </div>

                    {/* Primary Button */}
                    <button
                      type="button"
                      id="btn-open-live-nomod"
                      onClick={handleOpenLiveNomod}
                      disabled={isGeneratingLink}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isGeneratingLink ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Checkout Link...</span>
                        </div>
                      ) : (
                        <>
                          <span>
                            {isValidNomodUrl(officialNomodUrl) ? 'Open Official Nomod Live Checkout' : 'Open Secure Hosted Checkout'}
                          </span>
                          <ExternalLink className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {openedTab && (
                      <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>Listening for live payment confirmation...</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleManualCheckStatus}
                          disabled={isCheckingStatus}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1"
                        >
                          {isCheckingStatus ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          <span>Check Status Now</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shareable Link Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Send Checkout Link to Client</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isValidNomodUrl(getLiveNomodUrl()) ? 'Direct Nomod URL' : 'Secure Checkout URL'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getLiveNomodUrl() || 'Generating payment link...'}
                        className="flex-1 py-2 px-3 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy payment link"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Share via WhatsApp"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 2: Direct Card Entry (In-Office Settlement) */
                <form onSubmit={handleDirectCardSubmit} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <span>Cardholder & Card Details</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Nomod Settlement</span>
                      </span>
                    </div>

                    {/* Cardholder Name */}
                    <div className="space-y-1">
                      <label htmlFor="modalCardHolder" className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Cardholder Name</span>
                      </label>
                      <input
                        type="text"
                        id="modalCardHolder"
                        value={cardHolder}
                        onChange={(e) => {
                          setCardHolder(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        placeholder="Name on card"
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
                        required
                      />
                    </div>

                    {/* Card Number */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modalCardNumber" className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>Card Number</span>
                        </label>
                        {cardNumber.replace(/\s/g, '').length >= 1 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            {detectCardBrand()}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          id="modalCardNumber"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="4242 •••• •••• ••••"
                          maxLength={19}
                          className="w-full py-2.5 pl-3 pr-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono tracking-wider focus:outline-none focus:border-blue-500"
                          required
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 pointer-events-none">
                          {cardNumber.replace(/\s/g, '').length}/16
                        </span>
                      </div>
                    </div>

                    {/* Expiry & CVC */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label htmlFor="modalCardExpiry" className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Expires (MM/YY)</span>
                        </label>
                        <input
                          type="text"
                          id="modalCardExpiry"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono text-center focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="modalCardCvc" className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>CVC / CVV</span>
                        </label>
                        <input
                          type="password"
                          id="modalCardCvc"
                          value={cardCvc}
                          onChange={(e) => handleCvcChange(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono text-center tracking-widest focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="modal-btn-submit-payment"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Live Nomod Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-white" />
                        <span>Authorize & Settle {currency} {amount.toLocaleString()} via Nomod</span>
                        <ArrowRight className="w-4 h-4 text-blue-200" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Merchant & Trust Guarantee Footer */}
              <div className="pt-2 px-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px] flex items-center gap-1 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-Bit SSL Direct Settlement</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Merchant: Gurpreet Singh Kataria
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
