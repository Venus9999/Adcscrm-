import React, { useState } from 'react';
import {
  History,
  Clock,
  User as UserIcon,
  ArrowRight,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  FileEdit,
  Tag,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChangeLogEntry } from '../../types/crm';

interface ChangeLogViewProps {
  changelog?: ChangeLogEntry[];
  entityTitle?: string;
  entityType?: string;
  className?: string;
  compact?: boolean;
}

export const ChangeLogView: React.FC<ChangeLogViewProps> = ({
  changelog = [],
  entityTitle,
  entityType = 'Record',
  className = '',
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'employee' | 'admin' | 'master'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredLogs = changelog.filter((entry) => {
    const matchRole = roleFilter === 'all' || entry.userRole === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchRole;

    const matchUser =
      entry.userName.toLowerCase().includes(q) ||
      entry.userRole.toLowerCase().includes(q) ||
      (entry.userEmail && entry.userEmail.toLowerCase().includes(q));
    const matchSummary = entry.summary.toLowerCase().includes(q);
    const matchChanges = entry.changes.some(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.displayOldValue.toLowerCase().includes(q) ||
        c.displayNewValue.toLowerCase().includes(q)
    );

    return matchRole && (matchUser || matchSummary || matchChanges);
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'employee':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'master':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'agent':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        dateStr: date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        timeStr: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      };
    } catch {
      return { dateStr: isoString, timeStr: '' };
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Modification History & Audit Changelog
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {changelog.length} {changelog.length === 1 ? 'Edit' : 'Edits'} Recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable tracking of who changed what, previous values, and exact timestamps across all updates.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search edits / diff..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            aria-label="Filter changelog by user role"
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
          >
            <option value="all">All Roles</option>
            <option value="employee">Employees</option>
            <option value="admin">Admins</option>
            <option value="master">Master</option>
          </select>
        </div>
      </div>

      {/* Changelog Timeline List */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-3">
          {filteredLogs.map((entry, idx) => {
            const { dateStr, timeStr } = formatDate(entry.timestamp);
            const isExpanded = expandedIds[entry.id] ?? true; // default expanded

            return (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Event Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                      {entry.userAvatar ? (
                        <img
                          src={entry.userAvatar}
                          alt={entry.userName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        entry.userName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {entry.userName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getRoleBadge(
                            entry.userRole
                          )}`}
                        >
                          {entry.userRole}
                        </span>
                        {entry.userRole === 'employee' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                            Employee Edit
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {entry.summary}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp & Accordion Toggle */}
                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{timeStr}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(entry.id)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title={isExpanded ? 'Collapse field diff' : 'Expand field diff'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Field-by-Field Diff Details */}
                {isExpanded && entry.changes && entry.changes.length > 0 && (
                  <div className="mt-3 pt-1">
                    <div className="grid grid-cols-1 gap-2">
                      {entry.changes.map((change, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex flex-col md:flex-row md:items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 text-xs gap-2"
                        >
                          {/* Field Label */}
                          <div className="flex items-center space-x-2 md:w-1/3">
                            <Tag className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {change.label}
                            </span>
                          </div>

                          {/* Before & After Values */}
                          <div className="flex flex-wrap items-center gap-2 md:w-2/3 md:justify-end">
                            {/* Old Value */}
                            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 max-w-[200px] sm:max-w-[260px] truncate">
                              <span className="text-[10px] text-rose-500 font-bold uppercase mr-1">
                                Before:
                              </span>
                              <span className="truncate font-mono line-through opacity-85">
                                {change.displayOldValue}
                              </span>
                            </div>

                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                            {/* New Value */}
                            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 max-w-[200px] sm:max-w-[260px] truncate font-medium">
                              <span className="text-[10px] text-emerald-600 font-bold uppercase mr-1">
                                After:
                              </span>
                              <span className="truncate font-mono font-bold">
                                {change.displayNewValue}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Note */}
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Audit Verified & Logged</span>
                  </span>
                  <span>{entry.changes?.length || 0} fields modified</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {searchQuery || roleFilter !== 'all'
              ? 'No Matching Edit Logs Found'
              : 'No Modifications Recorded Yet'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            {searchQuery || roleFilter !== 'all'
              ? 'Try adjusting your search criteria or role filter.'
              : `All future edits to this ${entityType.toLowerCase()} (made by employees, managers, or admins) will automatically generate a detailed changelog recording when and what changed.`}
          </p>
        </div>
      )}
    </div>
  );
};
