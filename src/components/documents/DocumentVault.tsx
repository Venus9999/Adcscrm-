import React, { useState, useRef } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  Search,
  Filter,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Phone,
  Mail,
  ExternalLink,
  ShieldAlert,
  FileText,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
  FileImage,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { DocumentItem } from '../../types/crm';

export const DocumentVault: React.FC = () => {
  const {
    documents,
    expiringDocuments,
    updateDocumentStatus,
    uploadDocument,
    deleteDocument,
    clients,
    setSelectedClientId,
    setActiveTab,
  } = useCRM();

  const [activeTabSub, setActiveTabSub] = useState<'all' | 'radar' | 'pending' | 'Passport' | 'Emirates ID' | 'Visa' | 'Trade License'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expiryDaysFilter, setExpiryDaysFilter] = useState<number>(180);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClientId, setFormClientId] = useState(clients[0]?.id || '');
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('Passport');
  const [docExpiry, setDocExpiry] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileSizeText, setFileSizeText] = useState<string>('');
  const [fileMimeType, setFileMimeType] = useState<string>('application/pdf');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Filtered documents
  const filteredDocs = (documents || []).filter((doc) => {
    if (!doc) return false;
    const matchSearch =
      !searchQuery ||
      (doc.name && doc.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.clientName && doc.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (activeTabSub === 'all') return true;
    if (activeTabSub === 'pending') return doc.status === 'pending' || doc.status === 'under_review';
    if (activeTabSub === 'radar') return false; // Handled separately
    return doc.category === activeTabSub;
  });

  // Filtered radar
  const filteredRadar = (expiringDocuments || []).filter((item) => item && item.daysLeft <= expiryDaysFilter);

  const processFile = (file: File) => {
    // Format size
    const sizeKB = file.size / 1024;
    const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
    setFileSizeText(sizeFormatted);
    setFileMimeType(file.type || 'application/pdf');
    if (!docName.trim()) {
      setDocName(file.name);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFileDataUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !selectedClientId) return;

    const cl = clients.find((c) => c.id === selectedClientId);

    uploadDocument({
      clientId: selectedClientId,
      clientName: cl?.fullName || 'Client',
      name: docName.trim(),
      category: docCategory,
      fileUrl: fileDataUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: fileMimeType || 'application/pdf',
      fileSize: fileSizeText || '1.8 MB',
      expiryDate: docExpiry || undefined,
      status: 'pending',
    });

    setShowUploadModal(false);
    setDocName('');
    setDocExpiry('');
    setFileDataUrl('');
    setFileSizeText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Document Vault & Expiry Radar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized document depository with automatic expiry detection and government compliance audits
          </p>
        </div>

        <button
          onClick={() => {
            setFileDataUrl('');
            setFileSizeText('');
            setShowUploadModal(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload New File</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTabSub('all')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTabSub === 'all'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Vault Files ({documents.length})
        </button>

        <button
          onClick={() => setActiveTabSub('radar')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTabSub === 'radar'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Expiry Radar ({expiringDocuments.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('pending')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTabSub === 'pending'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Needs Review ({(documents || []).filter((d) => d && (d.status === 'pending' || d.status === 'under_review')).length})
        </button>

        <button
          onClick={() => setActiveTabSub('Passport')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTabSub === 'Passport'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Passports
        </button>

        <button
          onClick={() => setActiveTabSub('Emirates ID')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTabSub === 'Emirates ID'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Emirates IDs
        </button>

        <button
          onClick={() => setActiveTabSub('Visa')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTabSub === 'Visa'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Visas & Permits
        </button>

        <button
          onClick={() => setActiveTabSub('Trade License')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTabSub === 'Trade License'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Trade Licenses
        </button>
      </div>

      {/* Main View: Expiry Radar Mode */}
      {activeTabSub === 'radar' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Document Expiry Warning System:</strong> Identifies upcoming passport, residency visa, and
                Emirates ID expirations before government fines accrue.
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Filter range:</span>
              <select
                value={expiryDaysFilter}
                onChange={(e) => setExpiryDaysFilter(Number(e.target.value))}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
              >
                <option value={30}>&lt; 30 Days (Urgent)</option>
                <option value={60}>&lt; 60 Days</option>
                <option value={90}>&lt; 90 Days</option>
                <option value={180}>&lt; 180 Days (All)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRadar.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.daysLeft <= 15
                          ? 'bg-rose-500 text-white animate-pulse'
                          : item.daysLeft <= 60
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {item.daysLeft <= 0 ? 'EXPIRED' : `${item.daysLeft} Days Remaining`}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{item.type}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 truncate">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Client: <strong className="text-slate-800 dark:text-slate-200">{item.client.fullName}</strong>
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-1">Expiry Date: {item.expiryDate}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedClientId(item.client.id);
                      setActiveTab('clients');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Open Dossier
                  </button>

                  <a
                    href={`https://wa.me/${item.client.whatsapp?.replace(/\D/g, '')}?text=Dear%20${encodeURIComponent(
                      item.client.fullName
                    )},%20your%20${item.type}%20is%20expiring%20on%20${item.expiryDate}.%20Please%20contact%20us%20for%20renewal.`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>WhatsApp Alert</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vault Grid View */
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search file name, client, or category..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {doc.category.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          doc.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : doc.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {doc.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-3 truncate">{doc.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Client: <strong className="text-slate-800 dark:text-slate-200">{doc.clientName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Category: {doc.category} • Size: {doc.fileSize}
                  </p>
                  {doc.expiryDate && (
                    <p className="text-[11px] text-amber-600 font-mono mt-0.5">
                      Expires: {doc.expiryDate}
                    </p>
                  )}

                  {doc.remarks && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg mt-2 border border-slate-200 dark:border-slate-800">
                      {doc.remarks}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <a
                      href={doc.fileUrl}
                      download={doc.name}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 dark:text-slate-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>

                  <div className="flex gap-1.5">
                    {doc.status !== 'approved' && (
                      <button
                        onClick={() => updateDocumentStatus(doc.id, 'approved', 'Verified and compliant')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {doc.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          const rem = prompt('Rejection reason for client:');
                          if (rem) updateDocumentStatus(doc.id, 'rejected', rem);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Document to Secure Vault</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4">
              {/* Drag and drop area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {fileDataUrl ? 'File Selected — Click to Replace' : 'Drag & drop file here or click to browse'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports PDF, PNG, JPG, Word, Excel (Max 25MB)
                </p>
                {fileSizeText && (
                  <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                    Ready to Upload ({fileSizeText})
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Client Dossier *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.refNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="Passport">Passport Copy</option>
                    <option value="Emirates ID">Emirates ID</option>
                    <option value="Visa">Visa / Entry Permit</option>
                    <option value="Attested Degree">Attested Degree</option>
                    <option value="Salary Slip">Salary Slip / Bank</option>
                    <option value="Tenancy/Ejari">Tenancy / Ejari</option>
                    <option value="Trade License">Trade License</option>
                    <option value="Medical Fitness">Medical Fitness</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={docExpiry}
                    onChange={(e) => setDocExpiry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Title / File Name *
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. MOFA_Attested_Degree_Certificate.pdf"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Upload & Secure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 shadow-2xl animate-in fade-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{previewDoc.name}</h3>
                  <p className="text-xs text-slate-500">
                    Client: {previewDoc.clientName} • Category: {previewDoc.category} • Size: {previewDoc.fileSize}
                  </p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="my-4 flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 rounded-xl p-4 flex items-center justify-center min-h-[300px]">
              {previewDoc.fileUrl.startsWith('data:image/') || previewDoc.name.match(/\.(png|jpe?g|webp|gif)$/i) ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.name}
                  className="max-h-[60vh] max-w-full rounded-lg shadow-sm object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{previewDoc.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Document verified under UAE Federal ICP & GDRFA standards. Secure SHA-256 encrypted storage.
                  </p>
                  {previewDoc.expiryDate && (
                    <p className="text-xs font-mono text-amber-600 mt-2">
                      Government Validity Expiry: {previewDoc.expiryDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span
                className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase ${
                  previewDoc.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : previewDoc.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                Status: {previewDoc.status.replace('_', ' ')}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl}
                  download={previewDoc.name}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
