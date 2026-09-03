import React from 'react';
import { Printer, X, Building2, CheckCircle2 } from 'lucide-react';
import { Invoice, InvoiceBillingSettings, CRMBranding } from '../../types/crm';

interface InvoicePrintModalProps {
  invoice: Invoice;
  billingSettings: InvoiceBillingSettings;
  crmBranding?: CRMBranding;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  billingSettings,
  crmBranding,
  onClose,
}) => {
  const companyName = billingSettings.companyName || crmBranding?.companyName || 'ADCS Document Clearing & Corporate Services LLC';
  const tradingName = billingSettings.tradingName || 'Government Liaison & Corporate PRO Services';
  const fullAddress = [
    billingSettings.addressLine1 || 'Business Bay Tower, Floor 14',
    billingSettings.addressLine2,
    billingSettings.poBox ? `P.O. Box ${billingSettings.poBox}` : 'P.O. Box 89211',
    billingSettings.city || 'Dubai',
    billingSettings.country || 'UAE',
  ]
    .filter(Boolean)
    .join(', ');

  const initials = companyName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'AD';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 max-w-3xl w-full shadow-2xl p-8 my-8 animate-in fade-in print:p-0 print:border-none print:shadow-none">
        {/* Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div>
              <span className="font-bold text-base block">{companyName} &bull; Tax Invoice</span>
              <span className="text-[11px] text-slate-500">Official UAE Federal Tax Authority (FTA) Standard Compliant</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="pt-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 px-2.5 py-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-xs shrink-0">
                  <img
                    src={crmBranding?.logoUrl || '/logo-adcs.svg'}
                    alt="ADCS"
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {companyName}
                  </h2>
                  <p className="text-[11px] text-slate-500">{tradingName}</p>
                </div>
              </div>
              <div className="mt-2.5 text-xs text-slate-500 space-y-0.5">
                <p>{fullAddress}</p>
                <p className="font-mono font-semibold text-slate-700">
                  TRN: {billingSettings.trn || '10048291000003'} &bull; Trade License: {billingSettings.tradeLicenseNo || 'TL-89421'}
                </p>
                <p>
                  Email: {billingSettings.email || 'finance@adcs.ae'} &bull; Phone: {billingSettings.phone || '+971 4 829 1100'}
                  {billingSettings.website && <span> &bull; Web: {billingSettings.website}</span>}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
                Tax Invoice / فاتورة ضريبية
              </div>
              <div className="text-xl font-bold text-blue-600 font-mono">{invoice.invoiceNumber}</div>
              <p className="text-xs text-slate-500 mt-1">Issue Date: <strong>{invoice.issueDate}</strong></p>
              <p className="text-xs text-slate-500">Due Date: <strong>{invoice.dueDate}</strong></p>
              {invoice.receiptNumber && (
                <p className="text-xs text-emerald-600 font-mono font-semibold mt-0.5">
                  Receipt: {invoice.receiptNumber}
                </p>
              )}
            </div>
          </div>

          {/* Billed To Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Customer / Billed To:
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">{invoice.clientName}</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Phone: {invoice.clientPhone || '+971 50 123 4567'} &bull; Email: {invoice.clientEmail || 'client@email.com'}
              </p>
              {invoice.clientAddress && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Address: {invoice.clientAddress}
                </p>
              )}
              {invoice.clientPassport && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Passport No: {invoice.clientPassport}
                </p>
              )}
            </div>
            <div className="text-right sm:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Application / Service Dossier:
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">{invoice.serviceName}</h3>
              <p className="text-xs text-slate-600 mt-0.5">Billing Branch: {invoice.companyName || companyName}</p>
              <p className="text-xs text-slate-500 mt-0.5">Payment Method: {invoice.paymentMethod || 'Bank Transfer'}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Status:{' '}
                <span className="font-bold uppercase font-mono text-blue-700">
                  {invoice.status.replace('_', ' ')}
                </span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-xs">
            <thead className="border-b-2 border-slate-200 font-bold text-slate-600 text-left bg-slate-100/60">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Service & Fee Description</th>
                <th className="py-2.5 px-3 text-center">VAT Rate</th>
                <th className="py-2.5 px-3 text-right">Amount ({billingSettings.currency || 'AED'})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{it.description}</div>
                      {it.isGovernmentFee ? (
                        <span className="text-[10px] text-blue-600 font-medium">
                          Official Pass-through Government Authority Fee (0% VAT Exempt)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Standard Rated Corporate PRO & Legal Clearance Services</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {it.isGovernmentFee ? '0%' : `${invoice.vatRate !== undefined ? invoice.vatRate : (billingSettings.vatRate ?? 0)}%`}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {(it.total || it.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td className="py-3 px-3 font-mono text-slate-400">1</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{invoice.serviceName} - Professional Agency Service Fee</div>
                      <span className="text-[10px] text-slate-500">
                        {invoice.vatRate === 0 ? 'Zero-Rated / Exempt Professional PRO & Legal Clearance' : 'Standard Rated Corporate PRO & Legal Clearance Services'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{invoice.vatRate ?? 0}%</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {invoice.subtotal.toLocaleString()}
                    </td>
                  </tr>
                  {invoice.governmentFees > 0 && (
                    <tr>
                      <td className="py-3 px-3 font-mono text-slate-400">2</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">Pass-through Government Authority Disbursements</div>
                        <span className="text-[10px] text-blue-600 font-medium">
                          Official Authority Fees (ICP / GDRFA / MoHRE / DET) (0% VAT Exempt)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">0%</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {invoice.governmentFees.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>

          {/* Totals Breakdown and Bank Information */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Bank Settlement Account */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Bank Transfer Wire Details</span>
              </div>
              <p className="text-slate-600">
                Bank: <strong>{billingSettings.bankName || 'Emirates NBD PJSC'} ({billingSettings.bankBranch || 'Dubai'})</strong>
              </p>
              <p className="text-slate-600">
                Account Name: <strong>{billingSettings.accountName || companyName}</strong>
              </p>
              <p className="font-mono text-slate-700">
                IBAN: <strong>{billingSettings.iban || 'AE44 0260 0001 2345 6789 012'}</strong>
              </p>
              <p className="font-mono text-slate-700">
                SWIFT / BIC: <strong>{billingSettings.swiftCode || 'EBILAEADXXX'}</strong>
              </p>
              {billingSettings.accountNumber && (
                <p className="font-mono text-slate-700">
                  Account No: <strong>{billingSettings.accountNumber}</strong>
                </p>
              )}
            </div>

            {/* Calculation Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Professional Fee Subtotal:</span>
                <span className="font-mono font-semibold">{billingSettings.currency || 'AED'} {invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.discountAmount !== undefined && invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>
                    Corporate B2B Discount ({invoice.discountType === 'fixed' ? `AED ${invoice.discountValue?.toLocaleString()} Fixed` : `${invoice.discountPercent || invoice.discountValue}%`}):
                  </span>
                  <span className="font-mono font-semibold">- {billingSettings.currency || 'AED'} {invoice.discountAmount.toLocaleString()}</span>
                </div>
              )}
              {invoice.governmentFees > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Government Authority Fees:</span>
                  <span className="font-mono font-semibold">{billingSettings.currency || 'AED'} {invoice.governmentFees.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>
                  {invoice.vatRate === 0
                    ? 'VAT (0% / Exempt):'
                    : `VAT (${invoice.vatRate ?? 0}% on taxable agency services):`}
                </span>
                <span className="font-mono font-semibold">{billingSettings.currency || 'AED'} {(invoice.vatAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t-2 border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono text-blue-600">{billingSettings.currency || 'AED'} {invoice.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1">
                <span>Amount Received / Paid:</span>
                <span className="font-mono">{billingSettings.currency || 'AED'} {invoice.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold text-sm pt-1">
                <span>Net Balance Payable:</span>
                <span className="font-mono">{billingSettings.currency || 'AED'} {invoice.balanceAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions & Notes */}
          {(billingSettings.termsAndConditions || invoice.notes || billingSettings.footerNotes) && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-[11px] text-slate-500 space-y-1">
              {invoice.notes && (
                <p className="text-slate-700">
                  <strong>Invoice Notes:</strong> {invoice.notes}
                </p>
              )}
              {billingSettings.termsAndConditions && (
                <p>
                  <strong>Terms & Conditions:</strong> {billingSettings.termsAndConditions}
                </p>
              )}
              {billingSettings.footerNotes && (
                <p className="italic text-slate-400">{billingSettings.footerNotes}</p>
              )}
            </div>
          )}

          {/* Official Stamp & Signatures */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-[10px] text-slate-400">
              <p className="font-semibold text-slate-600">Tax Invoice Verification Ref: {invoice.id}</p>
              <p>Issued by Authorized Corporate PRO &amp; Clearance Desk</p>
            </div>

            {/* Official Company Stamp & Authorized Signatory */}
            <div className="flex items-center gap-6">
              {/* Official Company Stamp (Settled by Admin/Master) */}
              {billingSettings.showStampOnInvoice !== false && (
                <div className="flex flex-col items-center">
                  {billingSettings.companyStampUrl ? (
                    <img
                      src={billingSettings.companyStampUrl}
                      alt="Company Stamp"
                      className="w-20 h-20 object-contain transform -rotate-6 filter drop-shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-600/70 p-1 flex flex-col items-center justify-center text-center transform -rotate-6 text-blue-700 bg-blue-50/40">
                      <span className="text-[8px] font-extrabold uppercase leading-tight tracking-tighter">
                        {companyName.slice(0, 18)}
                      </span>
                      <span className="text-[7px] font-bold text-slate-600">OFFICIAL STAMP</span>
                      <span className="text-[6px] font-mono">TRN: {billingSettings.trn || '10048291000003'}</span>
                    </div>
                  )}
                  <span className="text-[9px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                    Official Company Seal
                  </span>
                </div>
              )}

              {/* Authorized Signatory (Settled by Admin/Master) */}
              <div className="text-center min-w-[160px]">
                <div className="h-14 flex items-end justify-center mb-1">
                  {billingSettings.showSignatureOnInvoice !== false && billingSettings.signatorySignatureUrl ? (
                    <img
                      src={billingSettings.signatorySignatureUrl}
                      alt="Authorized Signature"
                      className="max-h-12 max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-slate-400 text-sm">
                      {billingSettings.authorizedSignatoryName || 'Authorized Signatory'}
                    </span>
                  )}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="text-xs font-bold text-slate-900">
                    {billingSettings.authorizedSignatoryName || 'Authorized Signatory'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {billingSettings.authorizedSignatoryTitle || 'Accounts & Finance Department'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
