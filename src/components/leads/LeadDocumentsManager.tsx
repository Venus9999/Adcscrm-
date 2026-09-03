import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Eye,
  Trash2,
  Download,
  Shield,
  FileCheck,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Lead, LeadDocument } from '../../types/crm';

interface LeadDocumentsManagerProps {
  lead: Lead;
  onUploadDocument: (doc: Omit<LeadDocument, 'id' | 'uploadedAt' | 'uploadedByUserId' | 'uploadedByName'>) => void;
  onDeleteDocument: (docId: string) => void;
  onUpdateStatus?: (docId: string, status: 'pending' | 'verified' | 'rejected', notes?: string) => void;
}

const DOCUMENT_CATEGORIES = [
  'Passport',
  'Emirates ID',
  'Trade License',
  'CV / Resume',
  'Visa / Entry Permit',
  'Salary Certificate',
  'Bank Statement',
  'Tenancy / Ejari',
  'Application Form',
  'Contract / Proposal',
  'Attested Degree',
  'Photo',
  'Other',
];

export const LeadDocumentsManager: React.FC<LeadDocumentsManagerProps> = ({
  lead,
  onUploadDocument,
  onDeleteDocument,
  onUpdateStatus,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<string>('Passport');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<LeadDocument | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = useMemo(() => {
    return lead.documents || [];
  }, [lead.documents]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Infer category from file name
  const inferDocCategory = (fileName: string): string => {
    const n = fileName.toLowerCase();
    if (n.includes('passport') || n.includes('pass')) return 'Passport';
    if (n.includes('emirates') || n.includes('eid') || n.includes('national_id')) return 'Emirates ID';
    if (n.includes('cv') || n.includes('resume') || n.includes('bio')) return 'CV / Resume';
    if (n.includes('license') || n.includes('trade') || n.includes('commercial')) return 'Trade License';
    if (n.includes('visa') || n.includes('entry') || n.includes('residence')) return 'Visa / Entry Permit';
    if (n.includes('salary') || n.includes('pay') || n.includes('wage')) return 'Salary Certificate';
    if (n.includes('bank') || n.includes('statement')) return 'Bank Statement';
    if (n.includes('ejari') || n.includes('tenancy') || n.includes('lease') || n.includes('rent')) return 'Tenancy / Ejari';
    if (n.includes('degree') || n.includes('diploma') || n.includes('certificate')) return 'Attested Degree';
    if (n.includes('photo') || n.includes('pic') || n.includes('portrait')) return 'Photo';
    if (n.includes('contract') || n.includes('agreement') || n.includes('proposal')) return 'Contract / Proposal';
    if (n.includes('form') || n.includes('application')) return 'Application Form';
    return 'Other';
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds 25MB maximum limit. Please select a smaller file.');
      return;
    }
    setUploadError('');
    setSelectedFile(file);

    // Auto-fill title & category
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setDocName(cleanName);
    const inferred = inferDocCategory(file.name);
    setCategory(inferred);
    setShowUploadForm(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcessUpload = () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    if (!docName.trim()) {
      setUploadError('Please enter a document title');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fileUrl = reader.result as string;
        onUploadDocument({
          leadId: lead.id,
          name: docName.trim(),
          category,
          fileName: selectedFile.name,
          fileType: selectedFile.type || 'application/octet-stream',
          fileSize: formatFileSize(selectedFile.size),
          fileUrl,
          expiryDate: expiryDate || undefined,
          notes: notes.trim() || undefined,
          status: 'verified',
        });

        // Reset form
        setSelectedFile(null);
        setDocName('');
        setExpiryDate('');
        setNotes('');
        setShowUploadForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setUploadError(err?.message || 'Failed to save document');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read file from disk');
      setIsUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = categoryFilter === 'All' || doc.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [documents, searchQuery, categoryFilter]);

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const pendingCount = documents.filter((d) => d.status === 'pending' || !d.status).length;

  return (
    <div className="space-y-5">
      {/* Top Banner & Stats */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Prospect Document Dossier</span>
            <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400">
              ({documents.length} files attached)
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Store passports, CVs, trade licenses, and certificates received from {lead.name}. Documents automatically carry over when converting to an active client.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              if (!showUploadForm && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Upload Zone / Form */}
      {showUploadForm ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/40 dark:border-blue-500/30 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Attach New Document to Lead #{lead.refNo}</span>
            </h5>
            <button
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFile(null);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click or drag & drop files here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PDF, JPG, PNG, DOCX up to 25MB
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {formatFileSize(selectedFile.size)} &bull; {selectedFile.type || 'Document'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-xs text-red-600 hover:underline cursor-pointer ml-2 shrink-0"
              >
                Change File
              </button>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Passport - Front Page, CV 2026, Ejari Lease"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Classification
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Internal Remarks / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Received on WhatsApp from client, pending signature"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFile(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isUploading || !selectedFile}
              onClick={handleProcessUpload}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading & Processing...' : 'Attach Document'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Filter & Search Bar */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Filter:</span>
            {['All', 'Passport', 'Emirates ID', 'CV / Resume', 'Trade License'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDocs.map((doc) => {
            const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf') || doc.fileType?.includes('pdf');
            const isImage =
              doc.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/) ||
              doc.fileType?.includes('image');

            const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
            const isExpiringSoon =
              doc.expiryDate &&
              !isExpired &&
              new Date(doc.expiryDate).getTime() - Date.now() < 30 * 86400000;

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isPdf
                            ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                            : isImage
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                            : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                        }`}
                      >
                        {isPdf ? (
                          <FileText className="w-5 h-5" />
                        ) : isImage ? (
                          <ImageIcon className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {doc.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[180px]">
                          {doc.fileName}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0">
                      {doc.category}
                    </span>
                  </div>

                  {/* Badges / Dates */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {doc.fileSize}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>

                    {doc.expiryDate && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                          isExpired
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                            : isExpiringSoon
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Exp: {doc.expiryDate}</span>
                      </span>
                    )}

                    {doc.status === 'verified' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                    {doc.status === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending Review</span>
                      </span>
                    )}
                  </div>

                  {doc.notes && (
                    <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      &ldquo;{doc.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {onUpdateStatus && (
                      <button
                        onClick={() =>
                          onUpdateStatus(
                            doc.id,
                            doc.status === 'verified' ? 'pending' : 'verified'
                          )
                        }
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                          doc.status === 'verified'
                            ? 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        }`}
                        title={doc.status === 'verified' ? 'Mark as Pending' : 'Mark as Verified'}
                      >
                        {doc.status === 'verified' ? 'Set Pending' : 'Verify Doc'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {doc.fileUrl && (
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName || `${doc.name}.pdf`}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h5 className="text-sm font-bold text-slate-900 dark:text-white">
            {searchQuery || categoryFilter !== 'All'
              ? 'No matching documents found'
              : 'No documents attached to this lead yet'}
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            {searchQuery || categoryFilter !== 'All'
              ? 'Try adjusting your search query or category filter'
              : 'Upload prospective client passports, CVs, trade licenses, or clearance application forms. Uploaded documents are saved safely and carried over upon client conversion.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setShowUploadForm(true);
              fileInputRef.current?.click();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload First Document</span>
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {previewDoc.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {previewDoc.fileName} &bull; {previewDoc.fileSize} &bull; {previewDoc.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl}
                  download={previewDoc.fileName || `${previewDoc.name}.pdf`}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950/5 dark:bg-slate-950/50 flex items-center justify-center min-h-[400px]">
              {previewDoc.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/) ||
              previewDoc.fileType?.includes('image') ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
                />
              ) : previewDoc.fileName?.toLowerCase().endsWith('.pdf') ||
                previewDoc.fileType?.includes('pdf') ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title={previewDoc.name}
                  className="w-full h-[70vh] rounded-lg border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Preview not available directly for this file format
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Download the file to view on your device.
                  </p>
                  <a
                    href={previewDoc.fileUrl}
                    download={previewDoc.fileName || `${previewDoc.name}.pdf`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
