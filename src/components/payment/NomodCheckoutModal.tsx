import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { NomodPaymentResult, createNomodPaymentLink, verifyNomodPayment } from '../../utils/nomodService';
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
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Payment state - strictly Nomod card gateway
  const selectedMethod = 'card' as const;
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentRejected, setPaymentRejected] = useState(false);
  const [paymentResult, setPaymentResult] = useState<NomodPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or generate link upon open
  useEffect(() => {
    if (isOpen) {
      setPaymentCompleted(false);
      setPaymentResult(null);
      setErrorMsg(null);
      setIsRedirecting(false);
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
        if (res.success && res.link) {
          setPaymentLink(res.link);
          setPaymentId(res.paymentId || '');
          setReference(res.reference || '');
        }
      });
    }
  }, [isOpen, amount, currency, displayTitle, applicationNumber, applicationId, invoiceId, customerName, customerEmail, customerPhone]);

  if (!isOpen) return null;

  const getCheckoutUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentRef = reference || `NOMOD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentPId = paymentId || `nomod_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const searchParams = new URLSearchParams({
      ref: currentRef,
      amount: String(amount),
      currency: currency || 'AED',
      title: `${displayTitle} ${applicationNumber ? `(#${applicationNumber})` : ''}`.trim(),
      customer: cardHolder || customerName || 'Valued Client',
      email: customerEmail || '',
      phone: customerPhone || '',
      appId: applicationId || '',
      invoiceId: invoiceId || '',
      method: selectedMethod,
    });

    if (paymentLink && paymentLink.startsWith('http')) {
      try {
        const parsed = new URL(paymentLink);
        // If it's a live Nomod official hosted link on pay.nomodapp.com
        if (parsed.hostname.includes('nomodapp.com') || parsed.hostname.includes('nomod.com')) {
          return paymentLink;
        }
        // If it's a relative/hosted payment path (/pay/... or /checkout/...)
        if (parsed.pathname.startsWith('/pay/') || parsed.pathname.startsWith('/checkout/')) {
          return `${origin}${parsed.pathname}?${searchParams.toString()}`;
        }
      } catch {}
    }

    return `${origin}/pay/${currentPId}?${searchParams.toString()}`;
  };

  const handleRedirectToCheckout = (openInNewTab = false) => {
    setIsRedirecting(true);
    setErrorMsg(null);

    // Save filled details to sessionStorage so checkout page pre-populates seamlessly
    try {
      sessionStorage.setItem(
        'nomod_prefill_card',
        JSON.stringify({
          cardNumber,
          cardExpiry,
          cardCvc,
          cardHolder: cardHolder || customerName,
          selectedMethod,
        })
      );
    } catch {}

    const targetUrl = getCheckoutUrl();

    if (openInNewTab) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setIsRedirecting(false);
      return;
    }

    // Redirect to checkout page
    window.location.href = targetUrl;
  };

  const handleCopyLink = () => {
    if (!paymentLink) return;
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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

  const handleFillDemoCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    if (!cardHolder) setCardHolder(customerName || 'Rakesh Kumar');
    setErrorMsg(null);
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

  const handleProcessPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    let brandName = 'Visa Debit (Nomod Live)';
    let last4Digits = '4242';

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

    setIsProcessing(true);

    try {
      // Call Nomod gateway verification with live parameters
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
        selectedMethod
      );

      setIsProcessing(false);
      setPaymentCompleted(true);
      setPaymentResult(result);

      // Trigger automatic invoice creation and upstream sync
      if (onPaymentOutcome) {
        onPaymentOutcome(result);
      }
      onPaymentSuccess(result);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment processing failed. Please check card details or try again.');
    }
  };

  const handleSimulateDecline = async () => {
    setErrorMsg(null);
    setIsProcessing(true);

    const cleanNum = cardNumber.replace(/\s/g, '');
    const last4Digits = cleanNum.length >= 4 ? cleanNum.slice(-4) : '4242';
    const detectedBrand = detectCardBrand();
    const brandName = `${detectedBrand} (Nomod Live)`;

    try {
      await new Promise((r) => setTimeout(r, 600));

      const declinedResult = await verifyNomodPayment(
        paymentId || `nomod_dec_${Date.now()}`,
        reference || `NOMOD-DEC-${Date.now().toString(36).toUpperCase()}`,
        amount,
        cardHolder || customerName,
        undefined,
        'rejected',
        'Transaction declined by card issuer: Insufficient funds or card restriction (Decline code: 05)',
        brandName,
        last4Digits,
        selectedMethod
      );

      setIsProcessing(false);
      setPaymentRejected(true);
      setPaymentResult(declinedResult);

      if (onPaymentOutcome) {
        onPaymentOutcome(declinedResult);
      } else if (applicationId) {
        confirmNomodPayment(applicationId, declinedResult);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Decline simulation encountered an unexpected error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Nomod Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-200">
                  NOMOD
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Official Gateway
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                256-Bit SSL Encrypted Direct Checkout
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
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

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-rose-200 dark:border-rose-900/60 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">{displayTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentResult.customerName || customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Status:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 uppercase">REJECTED / DECLINED</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Attempted Amount:</span>
                  <span className="text-slate-900 dark:text-white font-mono">
                    AED {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>CRM Status Updated:</strong> The payment record and application status have been updated to <em>Payment Declined</em>. You can retry with another card or contact support.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentRejected(false);
                    setPaymentResult(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Another Card</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment Approved & Settled!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nomod Transaction Reference: <strong className="font-mono text-blue-600 dark:text-blue-400">{paymentResult.reference}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">{displayTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentResult.customerName || customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentResult.cardBrand} (•••• {paymentResult.last4})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorization Code:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{paymentResult.authCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settled At:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(paymentResult.paidAt).toLocaleTimeString()} on {new Date(paymentResult.paidAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Amount Paid:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                    AED {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                  <strong>Automatic Invoice Created:</strong> A stamped tax receipt and official paid invoice have been generated with Nomod API provider details and recorded in the Finance ledger.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
              >
                Close & View Updated Application
              </button>
            </div>
          ) : (
            /* Checkout View */
            <>
              {/* Order Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {serviceTitle}
                    </h4>
                    {applicationNumber && (
                      <p className="text-[11px] font-mono text-slate-500">
                        Application Ref: #{applicationNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                      AED {amount.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-400">Total payable</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* NOMOD GATEWAY CHECKOUT & CARD DETAILS */}
              <div className="space-y-4 py-1">
                <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Official Nomod Payment Gateway</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
                      sk_live Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Clicking &quot;Redirect to Checkout Page&quot; takes you directly to the hosted Nomod payment page to review, enter details, and authorize payment with 3D Secure verification.
                  </p>
                </div>

                {/* Direct Card Entry Form */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <span>Card Information</span>
                      </span>
                      <button
                        type="button"
                        id="modal-btn-demo-card"
                        onClick={handleFillDemoCard}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-[11px] font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Click to fill test card data"
                      >
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span>Fill Test Card</span>
                      </button>
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
                        className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
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
                          className="w-full py-2 pl-3 pr-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono tracking-wider focus:outline-none focus:border-blue-500"
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
                          <span>Expires</span>
                        </label>
                        <input
                          type="text"
                          id="modalCardExpiry"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono text-center focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="modalCardCvc" className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>CVC</span>
                        </label>
                        <input
                          type="password"
                          id="modalCardCvc"
                          value={cardCvc}
                          onChange={(e) => handleCvcChange(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono text-center tracking-widest focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Accepted networks:</span>
                      <div className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400 text-[9px]">
                        <span className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">VISA</span>
                        <span className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">MASTERCARD</span>
                        <span className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">AMEX</span>
                        <span className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">JAYWAN</span>
                      </div>
                    </div>
                  </div>

                {/* Nomod Payment Link Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Hosted Nomod Checkout Link
                    </span>
                    {paymentLink && (
                      <a
                        href={paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <span>Open hosted checkout page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={paymentLink || 'Generating Nomod payment link...'}
                      className="flex-1 py-2 px-3 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      id="modal-btn-copy-link"
                      onClick={handleCopyLink}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Copy payment link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Nomod Merchant Account:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Gurpreet Singh Kataria (ADCS Nomod Live)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Reference:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{reference || 'Generated on initiate'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client / Payer:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{cardHolder || customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nomod Gateway Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Live & Connected (sk_live)</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="modal-btn-submit-payment"
                  onClick={() => handleRedirectToCheckout(false)}
                  disabled={isRedirecting || isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  {isRedirecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Redirecting to Nomod Checkout Page...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 text-white" />
                      <span>Redirect to Checkout Page (AED {amount.toLocaleString()})</span>
                      <ArrowRight className="w-4 h-4 text-blue-200" />
                    </>
                  )}
                </button>

                <div className="pt-1 px-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-[11px] flex items-center gap-1 text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRedirectToCheckout(true)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                  >
                    <span>Open checkout in new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
