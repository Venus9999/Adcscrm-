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
} from 'lucide-react';
import { NomodPaymentResult, createNomodPaymentLink, verifyNomodPayment } from '../../utils/nomodService';

interface NomodCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  applicationNumber?: string;
  applicationId?: string;
  serviceTitle?: string;
  description?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onPaymentSuccess: (result: NomodPaymentResult) => void;
}

export const NomodCheckoutModal: React.FC<NomodCheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'AED',
  applicationNumber,
  applicationId,
  serviceTitle,
  description,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentSuccess,
}) => {
  const displayTitle = serviceTitle || description || 'Visa Service Package';
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Payment form state
  const [activeTab, setActiveTab] = useState<'card' | 'apple_pay' | 'link'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentResult, setPaymentResult] = useState<NomodPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or generate link upon open
  useEffect(() => {
    if (isOpen) {
      setPaymentCompleted(false);
      setPaymentResult(null);
      setErrorMsg(null);
      setCardHolder(customerName || '');
      setIsGeneratingLink(true);

      createNomodPaymentLink({
        amount,
        currency,
        title: `${displayTitle} ${applicationNumber ? `(#${applicationNumber})` : ''}`,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
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
  }, [isOpen, amount, currency, serviceTitle, applicationNumber, customerName, customerEmail, customerPhone]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!paymentLink) return;
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickFillTestCard = () => {
    setCardNumber('4000 1234 5678 9010');
    setCardExpiry('12/28');
    setCardCvc('888');
    setCardHolder(customerName || 'Alexander Wright');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // Simulate/call Nomod gateway verification
      const result = await verifyNomodPayment(
        paymentId || `nomod_link_${Date.now()}`,
        reference || `NOMOD-${Date.now().toString(36).toUpperCase()}`,
        amount,
        cardHolder || customerName
      );

      setIsProcessing(false);
      setPaymentCompleted(true);
      setPaymentResult(result);

      // Trigger automatic invoice creation and upstream sync
      onPaymentSuccess(result);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Payment processing failed. Please check card details or try again.');
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
          {paymentCompleted && paymentResult ? (
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
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentResult.customerName || cardHolder}</span>
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

              {/* Tabs: Card vs Apple/Google Pay vs Direct Link */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'card'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Debit / Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('apple_pay')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'apple_pay'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Apple / Google Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'link'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Nomod Link</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* CARD FORM TAB */}
              {activeTab === 'card' && (
                <form onSubmit={handleProcessPayment} className="space-y-3.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Accepted: Visa, Mastercard, AMEX, UAE Jaywan</span>
                    <button
                      type="button"
                      onClick={handleQuickFillTestCard}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Fill Demo Card
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. Alexander Wright"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4000 1234 5678 9010"
                        className="w-full py-2 pl-9 pr-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authorizing with Nomod Gateway...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>Pay AED {amount.toLocaleString()} via Nomod</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* APPLE PAY / GOOGLE PAY TAB */}
              {activeTab === 'apple_pay' && (
                <div className="space-y-4 text-center py-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Use one-touch biometric checkout with Apple Pay or Google Pay.
                  </p>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-black text-white hover:bg-slate-900 font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span className="text-base font-serif"></span>
                        <span>Pay with Apple Pay (AED {amount.toLocaleString()})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-white border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span className="font-bold text-blue-500">G</span>
                    <span>Pay with Google Pay</span>
                  </button>
                </div>
              )}

              {/* DIRECT LINK TAB */}
              {activeTab === 'link' && (
                <div className="space-y-3 py-1">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Direct Nomod hosted payment link for WhatsApp sharing, SMS, or client browser payment:
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={paymentLink || 'Generating link...'}
                      className="flex-1 py-2 px-3 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Copy payment link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {paymentLink && (
                      <a
                        href={paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        title="Open Nomod checkout in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Gateway Account:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">ADCS Corporate Nomod Live</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Ref:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{reference || 'Generated'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simulate / Confirm Customer Paid via Link</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
