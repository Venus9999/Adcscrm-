import React, { useState } from 'react';
import {
  AlertTriangle,
  Laptop,
  Cloud,
  Server,
  Upload,
  Download,
  GitMerge,
  X,
  Users,
  Briefcase,
  CheckSquare,
  Receipt,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ConflictResolutionModal: React.FC = () => {
  const { conflictInfo, resolveConflict, dismissConflict } = useCRM();
  const [isResolving, setIsResolving] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'keep_local' | 'pull_remote' | 'merge' | null>(null);

  if (!conflictInfo) return null;

  const { diffSummary, source, detectedAt } = conflictInfo;

  const handleAction = async (action: 'keep_local' | 'pull_remote' | 'merge') => {
    setSelectedAction(action);
    setIsResolving(true);
    try {
      await resolveConflict(action);
    } finally {
      setIsResolving(false);
      setSelectedAction(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Unknown';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + d.toLocaleDateString() + ')';
    } catch {
      return isoString;
    }
  };

  const sourceName = source === 'firestore' ? 'Cloud Firestore' : 'Server Database';
  const SourceIcon = source === 'firestore' ? Cloud : Server;

  return (
    <div
      id="conflict-resolution-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-modal-title"
    >
      <div
        id="conflict-resolution-modal-card"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/50 max-w-2xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with Alert Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200 dark:border-amber-900/40 p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="conflict-modal-title"
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                Data Version Conflict Detected
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Your browser contains local working data that differs from the remote {sourceName}. To safeguard your records from being overwritten, choose how to proceed.
              </p>
            </div>
          </div>
          <button
            id="btn-conflict-dismiss-x"
            onClick={dismissConflict}
            disabled={isResolving}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Discrepancy Summary Badge */}
          {diffSummary.description && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{diffSummary.description}</p>
                <p className="text-xs text-amber-750 dark:text-amber-300 mt-0.5 opacity-90">
                  Detected at {formatDate(detectedAt)}
                </p>
              </div>
            </div>
          )}

          {/* Comparison Side-by-Side Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Local Version Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border-2 border-emerald-500/40 dark:border-emerald-500/30 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Your Local Version
                  </span>
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Active in Browser
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Clients</span>
                  <span className="font-bold text-slate-900 dark:text-white">{diffSummary.localClientsCount}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Leads</span>
                  <span className="font-bold text-slate-900 dark:text-white">{diffSummary.localLeadsCount}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-slate-400" /> Tasks</span>
                  <span className="font-bold text-slate-900 dark:text-white">{diffSummary.localTasksCount}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-slate-400" /> Invoices</span>
                  <span className="font-bold text-slate-900 dark:text-white">{diffSummary.localInvoicesCount}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last Modified</span>
                  <span className="truncate max-w-[140px]" title={diffSummary.localLastUpdated}>{formatDate(diffSummary.localLastUpdated)}</span>
                </div>
              </div>
            </div>

            {/* Remote Version Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SourceIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {sourceName}
                  </span>
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                  Remote Database
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Clients</span>
                  <span className="font-bold text-slate-900 dark:text-white">{diffSummary.remoteClientsCount}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Leads</span>
                  <span className="font-bold text-slate-900 dark:text-white">{diffSummary.remoteLeadsCount}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-slate-400" /> Tasks</span>
                  <span className="font-bold text-slate-900 dark:text-white">{diffSummary.remoteTasksCount}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-slate-400" /> Invoices</span>
                  <span className="font-bold text-slate-900 dark:text-white">{diffSummary.remoteInvoicesCount}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last Modified</span>
                  <span className="truncate max-w-[140px]" title={diffSummary.remoteLastUpdated}>{formatDate(diffSummary.remoteLastUpdated)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Resolution Strategy
            </h3>

            {/* Option 1: Keep Local Edits */}
            <button
              id="btn-conflict-keep-local"
              type="button"
              onClick={() => handleAction('keep_local')}
              disabled={isResolving}
              className="w-full text-left p-4 rounded-xl border-2 border-emerald-500/40 hover:border-emerald-600 dark:hover:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition group focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Keep Local Edits (Recommended)
                    </span>
                    {isResolving && selectedAction === 'keep_local' && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Syncing...</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Retain all your current browser records ({diffSummary.localClientsCount} clients, {diffSummary.localLeadsCount} leads) and immediately upload them to the {sourceName} so all users and devices receive your work.
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Smart Merge */}
            <button
              id="btn-conflict-smart-merge"
              type="button"
              onClick={() => handleAction('merge')}
              disabled={isResolving}
              className="w-full text-left p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-500 dark:hover:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 transition group focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Smart Merge (Combine Both Datasets)
                    </span>
                    {isResolving && selectedAction === 'merge' && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Merging...</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Non-destructively combine all clients, leads, tasks, and invoices from both your browser and the remote database by ID so zero records are lost.
                  </p>
                </div>
              </div>
            </button>

            {/* Option 3: Pull Server Version */}
            <button
              id="btn-conflict-pull-remote"
              type="button"
              onClick={() => handleAction('pull_remote')}
              disabled={isResolving}
              className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition group focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Pull Latest Version from Server
                    </span>
                    {isResolving && selectedAction === 'pull_remote' && (
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Pulling...</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Discard local un-synced edits and replace your active screen with the remote {sourceName} snapshot ({diffSummary.remoteClientsCount} clients, {diffSummary.remoteLeadsCount} leads).
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Automatic data protection enabled</span>
          </div>
          <button
            id="btn-conflict-review-later"
            type="button"
            onClick={dismissConflict}
            disabled={isResolving}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            Review Later
          </button>
        </div>
      </div>
    </div>
  );
};
