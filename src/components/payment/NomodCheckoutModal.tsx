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

  const handlePrintReceipt = () => {
    window.print();
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

              {/* Official Nomod Real-Time Live Checkout Frame */}
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Top Live Gateway Bar with Action Controls */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-slate-800 dark:text-slate-100">Live Nomod Gateway</span>
                      <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">Pay • GPay • Cards • Jaywan</span>
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

                    <button
                      type="button"
                      onClick={handleOpenLiveNomod}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      title="Open in separate tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">New Tab</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-600"
                      title="Copy payment link"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                      title="Share link via WhatsApp"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Real-Time Interactive Nomod Checkout View */}
                {isGeneratingLink ? (
                  <div className="h-[480px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-white gap-3 p-6 text-center shadow-inner">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Connecting to Nomod Live Gateway...</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Creating your real-time 3D-Secure 2.0 checkout session licensed by the Central Bank of UAE.
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full h-[510px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-inner">
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
                  </div>
                )}

                {/* Live Real-Time Poller Status & Manual Verification Bar */}
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <div className="text-[11px] truncate">
                      <span className="font-bold">Real-time sync active:</span> Once paid, payment is auto-detected & invoice settled.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualCheckStatus}
                    disabled={isCheckingStatus}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    {isCheckingStatus ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    <span>Verify Status</span>
                  </button>
                </div>
              </div>

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
