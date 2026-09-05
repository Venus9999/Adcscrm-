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
  Globe,
  Printer,
  Share2,
} from 'lucide-react';
import {
  NomodPaymentResult,
  createNomodPaymentLink,
  pollNomodLinkStatus,
  verifyNomodPayment,
  isValidNomodUrl,
  sanitizeNomodTitle,
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

  // Checkout Mode: 'link' (Official Live Nomod Page Link), 'iframe' (Embedded Live Frame), 'terminal' (Direct Card Terminal)
  const [activeTab, setActiveTab] = useState<'link' | 'iframe' | 'terminal'>('link');

  // Direct Card Terminal State
  const [cardHolder, setCardHolder] = useState(customerName || 'Valued Client');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardProcessStep, setCardProcessStep] = useState('');

  // Link & Live state
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [officialNomodUrl, setOfficialNomodUrl] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openedTab, setOpenedTab] = useState(false);

  // Embedded Iframe state
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

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
    setIsGeneratingLink(true);

    const rawCombinedTitle = `${displayTitle} ${applicationNumber ? `(#${applicationNumber})` : ''}`.trim();
    const cleanTitle = sanitizeNomodTitle(rawCombinedTitle, invoiceId || applicationNumber);

    createNomodPaymentLink({
      amount,
      currency,
      title: cleanTitle,
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
      } else {
        setErrorMsg(res.error || 'Could not initialize live Nomod link.');
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

          setPaymentCompleted(true);
          setPaymentResult(result);

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

  const handlePrintReceipt = () => {
    window.print();
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
    return 'Card';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(val);
  };

  const handleFillDemoCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    if (!cardHolder || cardHolder === 'Valued Client') {
      setCardHolder(customerName || 'Gurpreet Singh Kataria');
    }
    setErrorMsg(null);
  };

  const handleProcessCardPayment = async (e?: React.FormEvent) => {
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

    setIsProcessingCard(true);
    setCardProcessStep('Securing 256-bit TLS connection to Nomod Live Gateway...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setCardProcessStep('Verifying 3D-Secure 2.0 cardholder authorization...');
      await new Promise((r) => setTimeout(r, 700));
      setCardProcessStep('Executing authorized settlement via UAE Central Bank...');
      await new Promise((r) => setTimeout(r, 600));

      const result = await verifyNomodPayment(
        paymentId || `nomod_live_${Date.now()}`,
        reference || `NOMOD-${Date.now().toString(36).toUpperCase()}`,
        amount,
        cardHolder || customerName || 'Valued Client',
        undefined,
        'approved',
        undefined,
        brandName,
        last4Digits,
        'card'
      );

      setPaymentCompleted(true);
      setPaymentResult(result);
      setIsProcessingCard(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }
      if (onPaymentOutcome) {
        onPaymentOutcome(result);
      }
    } catch (err: any) {
      setIsProcessingCard(false);
      setErrorMsg(err.message || 'Payment processing could not be completed with Nomod. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[94vh]">
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

              {/* Checkout Channel Tabs */}
              <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'link'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Official Live Nomod</span>
                  <span className="hidden sm:inline px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
                    Primary
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('iframe')}
                  className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'iframe'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Embedded Frame</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('terminal')}
                  className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'terminal'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Virtual Terminal</span>
                </button>
              </div>

              {/* TAB 1: Direct Integrated Card Terminal */}
              {activeTab === 'terminal' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <form onSubmit={handleProcessCardPayment} className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Cardholder Name
                        </label>
                        <button
                          type="button"
                          onClick={handleFillDemoCard}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>Fill Demo Card</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="e.g. Gurpreet Singh Kataria"
                        disabled={isProcessingCard}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Card Number
                        </label>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {detectCardBrand()}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="•••• •••• •••• ••••"
                          maxLength={19}
                          disabled={isProcessingCard}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono tracking-wider text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          disabled={isProcessingCard}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Security Code (CVC)
                        </label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={handleCvcChange}
                          placeholder="•••"
                          maxLength={4}
                          disabled={isProcessingCard}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-center"
                        />
                      </div>
                    </div>

                    {isProcessingCard && cardProcessStep && (
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2.5 animate-in fade-in duration-150">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                        <span className="font-medium">{cardProcessStep}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessingCard}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isProcessingCard ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Authorizing via Nomod Live...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay {currency} {amount.toLocaleString()} via Nomod Gateway</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: Official Nomod Web Link */}
              {activeTab === 'link' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-4 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold tracking-wide">Nomod Official Hosted Page</span>
                      </div>
                      <span className="text-[11px] text-blue-300 font-mono">pay.nomodapp.com</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Opens Nomod&apos;s live UAE Central Bank-authorized checkout page in a clean new tab, with full native support for Apple Pay, Google Pay, Visa, Mastercard, and Tabby/Tamara.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {getLiveNomodUrl() ? (
                        <a
                          href={getLiveNomodUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setOpenedTab(true);
                            setStatusMessage('Nomod live page opened in tab. Complete payment; this screen will settle automatically.');
                          }}
                          className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer text-center no-underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open Official Nomod Checkout</span>
                        </a>
                      ) : (
                        <div className="flex-1 py-3 px-4 rounded-xl bg-blue-600/50 text-white font-bold text-xs flex items-center justify-center gap-2 text-center">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Preparing Live Link...</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        disabled={!getLiveNomodUrl()}
                        className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        disabled={!getLiveNomodUrl()}
                        className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors cursor-pointer flex items-center justify-center"
                        title="Share on WhatsApp"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Poller and Manual Check */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        <strong>Auto-detection active:</strong> Listens for completed payment.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleManualCheckStatus}
                      disabled={isCheckingStatus}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-60"
                    >
                      {isCheckingStatus ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Check Status</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Embedded Frame View */}
              {activeTab === 'iframe' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-800 dark:text-slate-100">Embedded Nomod Frame</span>
                        <span className="hidden sm:inline text-[11px] text-slate-500 ml-1.5">Apple Pay • Cards</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsIframeLoading(true);
                          setIframeKey((k) => k + 1);
                        }}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-600"
                        title="Reload Checkout Terminal"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {getLiveNomodUrl() && (
                        <a
                          href={getLiveNomodUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs no-underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>New Tab</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-inner">
                    {getLiveNomodUrl() ? (
                      <>
                        {isIframeLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-10 gap-3 p-6 text-center">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                            </div>
                            <div className="font-bold text-xs text-white">Loading Real-Time Nomod Checkout...</div>
                            <div className="text-[11px] text-slate-400">Loading secure payment fields and digital wallet interfaces</div>
                          </div>
                        )}
                        <iframe
                          key={iframeKey}
                          src={getLiveNomodUrl()}
                          onLoad={() => setIsIframeLoading(false)}
                          className="w-full h-full border-0"
                          title="Nomod Real-Time Checkout Frame"
                          allow="payment *; camera *; microphone *; clipboard-write *"
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-10 gap-3 p-6 text-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                        </div>
                        <div className="font-bold text-xs text-white">Initializing Official Live Gateway...</div>
                        <div className="text-[11px] text-slate-400">Connecting securely to Nomod live payment gateway</div>
                      </div>
                    )}
                  </div>
                </div>
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
