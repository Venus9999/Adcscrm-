import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText,
  CreditCard,
  Building2,
  X,
  ExternalLink,
} from 'lucide-react';
import { NomodPaymentOutcome } from '../../types/crm';

interface NomodReturnOutcomeModalProps {
  outcome: NomodPaymentOutcome;
  onClose: () => void;
  isOpen?: boolean;
  onViewVisa?: (appId: string) => void;
  onViewApplication?: (appId: string) => void;
  onViewInvoice?: (invoiceId: string) => void;
  onRetryPayment?: (appId?: string, invoiceId?: string) => void;
}

export const NomodReturnOutcomeModal: React.FC<NomodReturnOutcomeModalProps> = ({
  outcome,
  onClose,
  isOpen = true,
  onViewVisa,
  onViewApplication,
  onViewInvoice,
  onRetryPayment,
}) => {
  if (isOpen === false) return null;

  const handleViewVisa = () => {
    const handler = onViewApplication || onViewVisa;
    if (handler && outcome.applicationId) {
      handler(outcome.applicationId);
    } else {
      onClose();
    }
  };
  const isApproved = outcome.status === 'approved' || outcome.status === 'paid';
  const isRejected = outcome.status === 'rejected' || outcome.status === 'failed';
  const isCancelled = outcome.status === 'cancelled';
  const isPending = outcome.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${
          isApproved
            ? 'bg-slate-900 border-emerald-500/40 shadow-emerald-950/40'
            : isRejected
            ? 'bg-slate-900 border-rose-500/40 shadow-rose-950/40'
            : 'bg-slate-900 border-amber-500/40 shadow-amber-950/40'
        } text-white`}
      >
        {/* Header Ribbon */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isApproved
              ? 'bg-emerald-950/60 border-emerald-800/60'
              : isRejected
              ? 'bg-rose-950/60 border-rose-800/60'
              : 'bg-amber-950/60 border-amber-800/60'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <span
              className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isRejected
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              Nomod Gateway Return
            </span>
            <span className="text-xs text-slate-300 font-medium">Live Settlement Sync</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Status Icon & Title */}
          <div className="text-center space-y-2">
            {isApproved && (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20 animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            )}
            {isRejected && (
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/20 animate-in zoom-in-50 duration-300">
                <XCircle className="w-9 h-9" />
              </div>
            )}
            {isCancelled && (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20 animate-in zoom-in-50 duration-300">
                <AlertTriangle className="w-9 h-9" />
              </div>
            )}
            {isPending && (
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mx-auto text-blue-400 shadow-lg shadow-blue-500/20 animate-pulse">
                <Clock className="w-9 h-9" />
              </div>
            )}

            <h3 className="text-xl md:text-2xl font-bold tracking-tight">
              {isApproved && 'Payment Approved & Confirmed!'}
              {isRejected && 'Payment Declined by Issuer'}
              {isCancelled && 'Payment Checkout Cancelled'}
              {isPending && 'Payment Verification in Progress'}
            </h3>

            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isApproved &&
                'The payment was successfully authorized by Nomod and settled. The CRM application records and official tax invoice have been updated to PAID.'}
              {isRejected &&
                (outcome.failureReason ||
                  'The transaction was declined by the cardholder bank or payment provider. The CRM record has been updated to DECLINED.')}
              {isCancelled &&
                'You have cancelled the Nomod checkout session. Your application remains saved and pending payment.'}
              {isPending &&
                'Nomod is reviewing the transaction details with the settlement provider. Status will update once confirmed.'}
            </p>
          </div>

          {/* Details Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-400">Payment Status:</span>
              <span
                className={`font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-[11px] ${
                  isApproved
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isRejected
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {outcome.status.toUpperCase()}
              </span>
            </div>

            {outcome.amount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transaction Amount:</span>
                <span className="font-bold text-sm text-white font-mono">
                  {outcome.currency || 'AED'} {outcome.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {outcome.reference && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Nomod Reference:</span>
                <span className="font-mono font-semibold text-slate-200">{outcome.reference}</span>
              </div>
            )}

            {outcome.authCode && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Authorization Code:</span>
                <span className="font-mono font-bold text-blue-400">{outcome.authCode}</span>
              </div>
            )}

            {outcome.cardBrand && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Method / Brand:</span>
                <span className="text-slate-200 font-medium">
                  {outcome.cardBrand} {outcome.last4 ? `(•••• ${outcome.last4})` : ''}
                </span>
              </div>
            )}

            {outcome.customerName && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Client / Payer:</span>
                <span className="text-slate-200 font-medium">{outcome.customerName}</span>
              </div>
            )}

            {outcome.failureReason && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-rose-300">
                <span className="font-semibold text-rose-400">Decline Details:</span> {outcome.failureReason}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isApproved && (
              <>
                {outcome.applicationId && (onViewVisa || onViewApplication) && (
                  <button
                    onClick={() => {
                      onClose();
                      handleViewVisa();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Visa Application</span>
                  </button>
                )}

                {outcome.invoiceId && onViewInvoice && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewInvoice(outcome.invoiceId!);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <span>View Tax Invoice</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </>
            )}

            {(isRejected || isCancelled) && (
              <>
                {onRetryPayment && (
                  <button
                    onClick={() => {
                      onClose();
                      onRetryPayment(outcome.applicationId, outcome.invoiceId);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Nomod Payment</span>
                  </button>
                )}

                {outcome.applicationId && onViewVisa && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewVisa(outcome.applicationId!);
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <span>Open Visa Dossier</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
