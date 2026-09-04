import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RotateCcw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Download,
  Upload,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  Search,
  Sparkles,
  Plus,
  HardDrive,
  Lock,
  Layers,
  Users,
  DollarSign,
  Receipt,
  CheckSquare,
  Building2,
  Calendar,
  X,
  Copy,
  Check,
  History,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CRMSnapshot } from '../../types/crm';

export const RecoveryDashboard: React.FC = () => {
  const {
    currentUser,
    snapshots,
    liveStats,
    vaultStats,
    isLoadingSnapshots,
    fetchSnapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    importCRMData,
    exportCRMData,
  } = useCRM();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pre_config' | 'version_upgrade' | 'manual' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState<CRMSnapshot | null>(null);
  const [previewSnapshot, setPreviewSnapshot] = useState<CRMSnapshot | null>(null);
  const [previewFullData, setPreviewFullData] = useState<any | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSnapshotReason, setNewSnapshotReason] = useState('');
  const [newSnapshotType, setNewSnapshotType] = useState<'manual' | 'pre_config' | 'scheduled'>('manual');
  const [isCreating, setIsCreating] = useState(false);

  const [restoreTarget, setRestoreTarget] = useState<CRMSnapshot | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccessNotice, setRestoreSuccessNotice] = useState<string | null>(null);
  const [restoreErrorNotice, setRestoreErrorNotice] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CRMSnapshot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pasteJsonInput, setPasteJsonInput] = useState('');
  const [copiedCodeNotice, setCopiedCodeNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load snapshots on mount
  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  // Filtered snapshots
  const filteredSnapshots = useMemo(() => {
    return (snapshots || []).filter((snap) => {
      if (!snap) return false;

      // Filter by category
      if (activeFilter === 'pre_config' && snap.triggerType !== 'pre_config') {
        return false;
      }
      if (
        activeFilter === 'version_upgrade' &&
        snap.triggerType !== 'version_upgrade' &&
        snap.triggerType !== 'upgrade_shield'
      ) {
        return false;
      }
      if (activeFilter === 'manual' && snap.triggerType !== 'manual') {
        return false;
      }
      if (
        activeFilter === 'system' &&
        snap.triggerType !== 'scheduled' &&
        snap.triggerType !== 'system' &&
        snap.triggerType !== 'pre_restore'
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchReason = (snap.reason || '').toLowerCase().includes(q);
        const matchFilename = (snap.filename || '').toLowerCase().includes(q);
        const matchCreator = (snap.createdBy || '').toLowerCase().includes(q);
        const matchClients = (snap.sampleClients || []).some((c) => c.toLowerCase().includes(q));
        if (!matchReason && !matchFilename && !matchCreator && !matchClients) {
          return false;
        }
      }

      return true;
    });
  }, [snapshots, activeFilter, searchQuery]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const list = snapshots || [];
    return {
      all: list.length,
      pre_config: list.filter((s) => s?.triggerType === 'pre_config').length,
      version_upgrade: list.filter(
        (s) => s?.triggerType === 'version_upgrade' || s?.triggerType === 'upgrade_shield'
      ).length,
      manual: list.filter((s) => s?.triggerType === 'manual').length,
      system: list.filter(
        (s) =>
          s?.triggerType === 'scheduled' ||
          s?.triggerType === 'system' ||
          s?.triggerType === 'pre_restore'
      ).length,
    };
  }, [snapshots]);

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  // Open Preview
  const handleOpenPreview = async (snap: CRMSnapshot) => {
    setPreviewSnapshot(snap);
    setIsLoadingPreview(true);
    setPreviewFullData(null);
    try {
      const res = await fetch(`/api/crm/snapshots/${encodeURIComponent(snap.filename)}?full=true`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPreviewFullData(json.data);
        }
      }
    } catch (err) {
      console.warn('Failed to load snapshot details:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Handle Create Snapshot
  const handleCreateSnapshotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotReason.trim()) return;

    setIsCreating(true);
    try {
      const res = await createSnapshot(newSnapshotReason.trim(), newSnapshotType);
      if (res.success) {
        setNewSnapshotReason('');
        setIsCreateModalOpen(false);
        setRestoreSuccessNotice(`Point-in-time snapshot "${res.snapshot?.filename}" captured successfully.`);
        setTimeout(() => setRestoreSuccessNotice(null), 6000);
      } else {
        setRestoreErrorNotice(res.error || 'Failed to capture snapshot.');
        setTimeout(() => setRestoreErrorNotice(null), 6000);
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Restore
  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;

    setIsRestoring(true);
    setRestoreErrorNotice(null);
    try {
      const res = await restoreSnapshot(restoreTarget.filename);
      if (res.success) {
        setRestoreSuccessNotice(
          `Database successfully restored to snapshot "${restoreTarget.reason || restoreTarget.filename}"! All clients, invoices, and settings are active.`
        );
        setRestoreTarget(null);
        setPreviewSnapshot(null);
        setTimeout(() => setRestoreSuccessNotice(null), 8000);
      } else {
        setRestoreErrorNotice(res.error || 'Failed to restore snapshot.');
        setTimeout(() => setRestoreErrorNotice(null), 6000);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await deleteSnapshot(deleteTarget.filename);
      if (res.success) {
        setDeleteTarget(null);
      } else {
        alert(res.error || 'Failed to delete snapshot');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Non-master access restriction guard
  if (!isMaster) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Restricted Master Administrator View</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
          The Recovery Dashboard and point-in-time state rollback vault is restricted to Master Administrators. Please sign in
          with Master credentials to inspect snapshots.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Master Security Vault</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Upgrade Shield Active</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hidden sm:inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Auto Pre-Config Checkpoints: ON</span>
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <RotateCcw className="w-7 h-7 text-blue-600" />
              <span>Recovery Dashboard</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Inspect point-in-time snapshots, automated pre-configuration backups, and restore the complete CRM database to
              any verified historical checkpoint with atomic safety.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fetchSnapshots()}
              disabled={isLoadingSnapshots}
              className="p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Snapshots List"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingSnapshots ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Import Snapshot</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Snapshot Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {restoreSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{restoreSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRestoreSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {restoreErrorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{restoreErrorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRestoreErrorNotice(null)}
            className="text-rose-600 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Cards (Live Database vs Persistent Vault vs Archive) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Active Database */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Current Live Database</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Online
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(liveStats?.stats?.totalCoreRecords || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">Core Active Records</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                {liveStats?.stats?.clients || 0}
              </span>
              <span>Clients</span>
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                {liveStats?.stats?.invoices || 0}
              </span>
              <span>Invoices</span>
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                {liveStats?.stats?.leads || 0}
              </span>
              <span>Leads</span>
            </div>
          </div>
        </div>

        {/* Persistent Server Vault */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-purple-600" />
              <span>Persistent Disk Vault</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              Shield Protected
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(vaultStats?.stats?.totalCoreRecords || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">Vaulted Records</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                {vaultStats?.stats?.clients || 0}
              </span>
              <span>Clients</span>
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                {vaultStats?.stats?.invoices || 0}
              </span>
              <span>Invoices</span>
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                {vaultStats?.stats?.transactions || 0}
              </span>
              <span>Ledgers</span>
            </div>
          </div>
        </div>

        {/* Available Snapshots & Automation Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Snapshot Archive</span>
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
              {counts.all} Total
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{counts.pre_config}</span>
            <span className="text-xs text-slate-500">Pre-Config Checkpoints</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Manual: {counts.manual}</span>
            <span>Automated: {counts.system}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Ready</span>
          </div>
        </div>
      </div>

      {/* Snapshot Management Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span>All Snapshots</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{counts.all}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('pre_config')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'pre_config'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Pre-Config Changes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{counts.pre_config}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('version_upgrade')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'version_upgrade'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Version Upgrades</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{counts.version_upgrade}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('manual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'manual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manual Admin</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{counts.manual}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('system')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'system'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>System & Safety</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{counts.system}</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reason, filename, or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Snapshots List */}
      <div className="space-y-3">
        {filteredSnapshots.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No snapshots match current filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Snapshots are automatically captured whenever configuration changes occur, or you can capture an instant
              snapshot right now.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture New Snapshot</span>
            </button>
          </div>
        ) : (
          filteredSnapshots.map((snap) => {
            const isPreConfig = snap.triggerType === 'pre_config';
            const isPreRestore = snap.triggerType === 'pre_restore';
            const isManual = snap.triggerType === 'manual';
            const isVersionUpgrade = snap.triggerType === 'version_upgrade';
            const isShield = snap.triggerType === 'upgrade_shield';

            return (
              <div
                key={snap.id || snap.filename}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Metadata */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Trigger Type Badge */}
                      {isPreConfig && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          <span>Pre-Configuration Checkpoint</span>
                        </span>
                      )}
                      {isVersionUpgrade && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          <span>Version Upgrade Checkpoint</span>
                        </span>
                      )}
                      {isPreRestore && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3 text-purple-600" />
                          <span>Pre-Restore Safety Checkpoint</span>
                        </span>
                      )}
                      {isManual && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>Manual Admin Snapshot</span>
                        </span>
                      )}
                      {isShield && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Upgrade Shield Snapshot</span>
                        </span>
                      )}
                      {!isPreConfig && !isVersionUpgrade && !isPreRestore && !isManual && !isShield && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Automated System Backup</span>
                        </span>
                      )}

                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {formatDate(snap.createdAt)} ({getRelativeTime(snap.createdAt)})
                      </span>

                      <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                        • {snap.size ? `${(snap.size / 1024).toFixed(1)} KB` : ''}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{snap.reason || snap.filename}</span>
                    </h4>

                    {/* Record Stats Strip */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{snap.stats?.clients || 0}</span>
                        <span className="text-slate-400 text-[11px]">Clients</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{snap.stats?.invoices || 0}</span>
                        <span className="text-slate-400 text-[11px]">Invoices</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                        <Receipt className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{snap.stats?.leads || 0}</span>
                        <span className="text-slate-400 text-[11px]">Leads</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{snap.stats?.tasks || 0}</span>
                        <span className="text-slate-400 text-[11px]">Tasks</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{snap.stats?.companies || 0}</span>
                        <span className="text-slate-400 text-[11px]">Companies</span>
                      </div>

                      {snap.sampleClients && snap.sampleClients.length > 0 && (
                        <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 pl-2">
                          <span>Sample clients:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {snap.sampleClients.slice(0, 3).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(snap)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Inspect snapshot payload"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preview</span>
                    </button>

                    <a
                      href={`/api/crm/snapshots/${encodeURIComponent(snap.filename)}/download`}
                      download
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download JSON snapshot"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setRestoreTarget(snap)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(snap)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: PREVIEW SNAPSHOT PAYLOAD */}
      {previewSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                  Snapshot Payload Inspector
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {previewSnapshot.reason || previewSnapshot.filename}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Captured on {formatDate(previewSnapshot.createdAt)} ({getRelativeTime(previewSnapshot.createdAt)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSnapshot(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {isLoadingPreview ? (
                <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading full snapshot details...</span>
                </div>
              ) : (
                <>
                  {/* Summary Comparison Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[11px] text-slate-400 font-medium">Clients</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {previewSnapshot.stats?.clients || (previewFullData?.clients || []).length}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[11px] text-slate-400 font-medium">Invoices</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {previewSnapshot.stats?.invoices || (previewFullData?.invoices || []).length}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[11px] text-slate-400 font-medium">Leads</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {previewSnapshot.stats?.leads || (previewFullData?.leads || []).length}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[11px] text-slate-400 font-medium">Tasks</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {previewSnapshot.stats?.tasks || (previewFullData?.tasks || []).length}
                      </p>
                    </div>
                  </div>

                  {/* Sample Clients in Snapshot */}
                  {previewFullData?.clients && previewFullData.clients.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                        Clients Contained in this Snapshot ({previewFullData.clients.length})
                      </h5>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {previewFullData.clients.slice(0, 15).map((c: any) => (
                          <div key={c.id} className="p-2.5 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {c.name || c.companyName || 'Unnamed Client'}
                              </span>
                              <span className="text-slate-400 ml-2">{c.email || c.phone || ''}</span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500">
                              {c.services?.length || 0} services
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* System Configuration Details in Snapshot */}
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-200">Snapshot Safety Guarantee:</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Restoring this snapshot will automatically take a pre-restore safety checkpoint of your current live
                      data first. You will be able to revert back at any time.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setPreviewSnapshot(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  setRestoreTarget(previewSnapshot);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Proceed to Restore Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM RESTORE */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Restore Database to Selected Snapshot?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              You are about to restore the system state from{' '}
              <strong className="text-slate-900 dark:text-white font-bold">
                {restoreTarget.reason || restoreTarget.filename}
              </strong>{' '}
              taken on {formatDate(restoreTarget.createdAt)}.
            </p>

            <div className="my-4 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                <span>Clients in Snapshot:</span>
                <span className="font-bold text-slate-900 dark:text-white">{restoreTarget.stats?.clients || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                <span>Invoices in Snapshot:</span>
                <span className="font-bold text-slate-900 dark:text-white">{restoreTarget.stats?.invoices || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                <span>Leads in Snapshot:</span>
                <span className="font-bold text-slate-900 dark:text-white">{restoreTarget.stats?.leads || 0}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Automatic safety backup will be taken before restoring.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRestoreTarget(null)}
                disabled={isRestoring}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring Database...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm & Restore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE SNAPSHOT NOW */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Capture Master Snapshot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSnapshotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Before updating 2026 fee schedule & work stages..."
                  value={newSnapshotReason}
                  onChange={(e) => setNewSnapshotReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Classification Category
                </label>
                <select
                  value={newSnapshotType}
                  onChange={(e) => setNewSnapshotType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual Admin Checkpoint</option>
                  <option value="pre_config">Pre-Configuration Change Checkpoint</option>
                  <option value="scheduled">Scheduled Periodic Maintenance</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                <p>
                  Will capture all {liveStats?.stats?.clients || 0} active clients, {liveStats?.stats?.invoices || 0}{' '}
                  invoices, and all CRM branding & system settings into the persistent recovery vault.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newSnapshotReason.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Capturing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Capture Snapshot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: IMPORT / RESTORE BACKUP JSON */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Import External CRM Snapshot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Option A: Select File */}
              <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (!content) return;
                      const ok = importCRMData(content);
                      if (ok) {
                        setIsUploadModalOpen(false);
                        setRestoreSuccessNotice('External database snapshot successfully parsed and restored!');
                        setTimeout(() => setRestoreSuccessNotice(null), 6000);
                      } else {
                        alert('Invalid CRM backup JSON format.');
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
                <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-800 dark:text-slate-200">Select CRM Backup File (.json)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports all official ADCS CRM backup snapshots</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File to Restore</span>
                </button>
              </div>

              {/* Option B: Direct Copy / Paste */}
              <div className="space-y-2 pt-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Or Paste JSON Database Code
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste exported CRM JSON here..."
                  value={pasteJsonInput}
                  onChange={(e) => setPasteJsonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  disabled={!pasteJsonInput.trim()}
                  onClick={() => {
                    const ok = importCRMData(pasteJsonInput.trim());
                    if (ok) {
                      setPasteJsonInput('');
                      setIsUploadModalOpen(false);
                      setRestoreSuccessNotice('Snapshot JSON payload parsed and restored successfully!');
                      setTimeout(() => setRestoreSuccessNotice(null), 6000);
                    } else {
                      alert('Invalid JSON structure. Please ensure it is a valid CRM snapshot.');
                    }
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Pasted Snapshot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRM DELETE SNAPSHOT */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-xl flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Historical Snapshot?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove <strong className="font-semibold text-slate-700 dark:text-slate-300">{deleteTarget.filename}</strong>? This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
