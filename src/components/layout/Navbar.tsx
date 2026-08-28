import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Shield,
  Building2,
  Users,
  UserCheck,
  ChevronDown,
  FilePlus,
  UserPlus,
  DollarSign,
  CheckSquare,
  Upload,
  RefreshCw,
  Download,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  LogOut,
  Mail,
  Cloud,
  Database,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useGmail } from '../../context/GmailContext';
import { UserRole } from '../../types/crm';
import { CloudDataSyncModal } from '../common/CloudDataSyncModal';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAddClient: () => void;
  onOpenCreateInvoice: () => void;
  onOpenAddTask: () => void;
  onOpenUploadDoc: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenAddClient,
  onOpenCreateInvoice,
  onOpenAddTask,
  onOpenUploadDoc,
}) => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    setSelectedClientId,
    resetToDefaultData,
    exportCRMData,
    importCRMData,
    expiringDocuments,
    taskDueReminders,
    triggerTaskReminderNotification,
    logout,
    isSavingToServer,
    serverSyncStatus,
    lastServerSyncTime,
    saveDataToServer,
    loadDataFromServer,
  } = useCRM();

  const { isConnected: isGmailConnected, googleUser } = useGmail();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showQuickAddDropdown, setShowQuickAddDropdown] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'expiries' | 'tasks'>('all');

  const roleRef = useRef<HTMLDivElement>(null);
  const compRef = useRef<HTMLDivElement>(null);
  const empRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const systemRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) setShowRoleDropdown(false);
      if (compRef.current && !compRef.current.contains(event.target as Node)) setShowCompanyDropdown(false);
      if (empRef.current && !empRef.current.contains(event.target as Node)) setShowEmployeeDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifDropdown(false);
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) setShowQuickAddDropdown(false);
      if (systemRef.current && !systemRef.current.contains(event.target as Node)) setShowSystemMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const urgentExpiriesCount = expiringDocuments.filter((e) => e.isUrgent).length;
  const urgentTasksCount = taskDueReminders.filter((t) => t.isUrgent).length;
  const totalAlertBadge = unreadNotifs.length + urgentExpiriesCount + urgentTasksCount;

  const currentCompObj = companies.find((c) => c.id === selectedCompanyId);
  const currentEmployeeObj = availableUsers.find((u) => u.id === selectedEmployeeId);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'master':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'employee':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'client':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportCRMData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adcs-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setShowSystemMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const ok = importCRMData(content);
      if (ok) {
        alert('CRM Database restored successfully!');
      } else {
        alert('Failed to parse backup file. Please ensure it is a valid ADCS CRM JSON export.');
      }
    };
    reader.readAsText(file);
    setShowSystemMenu(false);
  };

  return (
    <header className="h-16 sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />

      <div className="h-full px-6 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Global Search Input & Branch Selector */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="w-full relative">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-md text-xs text-slate-500 border border-slate-200 dark:border-slate-700/70 transition-colors group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="truncate">Search ID, Name, Passport, EID, or Invoices...</span>
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Company / Branch Selector */}
          {currentUser.role === 'master' && (
            <div className="relative hidden md:block shrink-0" ref={compRef}>
              <button
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[140px]">
                  {selectedCompanyId === 'all' ? 'All Entities' : currentCompObj?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showCompanyDropdown && (
                <div className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Select Branch View
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCompanyId('all');
                      setShowCompanyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      selectedCompanyId === 'all'
                        ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/60 dark:bg-blue-950/40'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>All Branches (Consolidated)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold">
                      {companies.length}
                    </span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  {companies.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setSelectedCompanyId(comp.id);
                        setShowCompanyDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        selectedCompanyId === comp.id
                          ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/60 dark:bg-blue-950/40'
                        : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate font-medium">{comp.name}</p>
                        <p className="text-[10px] text-slate-400">Lic: {comp.tradeLicenseNo}</p>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold rounded shrink-0">
                        {comp.activeServicesCount} Active
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Employee / Staff Global Filter */}
          {currentUser.role !== 'client' && (
            <div className="relative hidden lg:block shrink-0" ref={empRef}>
              <button
                onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors border shadow-2xs ${
                  selectedEmployeeId !== 'all'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-400/40'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
                title="Filter entire CRM by assigned employee or officer"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate max-w-[130px]">
                  {selectedEmployeeId === 'all' ? 'All Staff' : currentEmployeeObj?.name || 'Employee'}
                </span>
                {selectedEmployeeId !== 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showEmployeeDropdown && (
                <div className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in max-h-96 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Filter By Employee</span>
                    {selectedEmployeeId !== 'all' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployeeId('all');
                          setShowEmployeeDropdown(false);
                        }}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEmployeeId('all');
                      setShowEmployeeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      selectedEmployeeId === 'all'
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/60 dark:bg-emerald-950/40'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                        ALL
                      </div>
                      <div>
                        <p className="font-semibold">All Staff & Officers</p>
                        <p className="text-[10px] text-slate-400">View complete CRM records</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-600 dark:text-slate-300">
                      {availableUsers.filter((u) => u.role !== 'client').length}
                    </span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  {availableUsers
                    .filter((u) => u.role !== 'client')
                    .map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          setShowEmployeeDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          selectedEmployeeId === emp.id
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/60 dark:bg-emerald-950/40'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <img
                            src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                            alt={emp.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="truncate">
                            <p className="truncate font-medium">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp.email}</p>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            emp.role === 'master'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : emp.role === 'admin'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {emp.role}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Add CTA */}
          {currentUser.role !== 'client' && (
            <div className="relative" ref={quickRef}>
              <button
                onClick={() => setShowQuickAddDropdown(!showQuickAddDropdown)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-md text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">+ New Action</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {showQuickAddDropdown && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in">
                  <button
                    onClick={() => {
                      onOpenAddClient();
                      setShowQuickAddDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span>Register New Client</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenCreateInvoice();
                      setShowQuickAddDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Create Tax Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenAddTask();
                      setShowQuickAddDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span>Create Priority Task</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenUploadDoc();
                      setShowQuickAddDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Upload Document</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Gmail Communications Shortcut */}
          <button
            onClick={() => setActiveTab('gmail')}
            className={`p-2 rounded-md transition-colors border flex items-center gap-1.5 text-xs font-semibold ${
              isGmailConnected
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={isGmailConnected ? `Gmail Connected (${googleUser?.email})` : 'Connect Gmail Account'}
          >
            <Mail className={`w-4 h-4 ${isGmailConnected ? 'text-red-500' : 'text-slate-400'}`} />
            <span className="hidden md:inline">
              {isGmailConnected ? 'Gmail' : 'Connect Mail'}
            </span>
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              title="Alerts & Expiries"
            >
              <Bell className="w-4 h-4" />
              {totalAlertBadge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {totalAlertBadge > 9 ? '9+' : totalAlertBadge}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in">
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                      Alerts & Expiry Radar
                    </span>
                  </div>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 py-1.5 gap-2 text-xs bg-slate-50/50 dark:bg-slate-800/20">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      notifFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('unread')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      notifFilter === 'unread'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Unread ({unreadNotifs.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('expiries')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      notifFilter === 'expiries'
                        ? 'bg-red-600 text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Expiries ({expiringDocuments.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('tasks')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 ${
                      notifFilter === 'tasks'
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Tasks Due ({taskDueReminders.length})</span>
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1">
                  {notifFilter === 'tasks' ? (
                    taskDueReminders.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No pending tasks due right now.
                      </div>
                    ) : (
                      taskDueReminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="p-2.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              onClick={() => {
                                if (reminder.clientId) setSelectedClientId(reminder.clientId);
                                setActiveTab('tasks');
                                setShowNotifDropdown(false);
                              }}
                              className="flex items-start gap-2.5 flex-1 cursor-pointer"
                            >
                              <div
                                className={`p-1.5 rounded shrink-0 ${
                                  reminder.isOverdue
                                    ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                                    : reminder.isDueToday
                                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                    {reminder.title}
                                  </p>
                                  <span
                                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                      reminder.isOverdue
                                        ? 'bg-red-500 text-white'
                                        : reminder.isDueToday
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {reminder.dueStatus.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Due {reminder.dueDate} • Assigned: <span className="font-medium text-slate-700 dark:text-slate-300">{reminder.assignedEmployeeName}</span>
                                  {reminder.clientName && (
                                    <> • Client: <span className="font-medium text-blue-600">{reminder.clientName}</span></>
                                  )}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerTaskReminderNotification(reminder.taskId);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded text-[10px] font-semibold shrink-0 transition-colors"
                              title="Send instant notification reminder to assignee"
                            >
                              Remind
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  ) : notifFilter === 'expiries' ? (
                    expiringDocuments.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No upcoming document expiries within 180 days.
                      </div>
                    ) : (
                      expiringDocuments.map((exp, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedClientId(exp.client.id);
                            setActiveTab('documents');
                            setShowNotifDropdown(false);
                          }}
                          className="p-2.5 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200"
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`p-1.5 rounded shrink-0 ${
                                exp.isUrgent ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{exp.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Expires {exp.expiryDate} (
                                <span className={exp.daysLeft < 15 ? 'text-red-600 font-bold' : 'text-amber-600'}>
                                  {exp.daysLeft <= 0 ? 'EXPIRED' : `${exp.daysLeft}d left`}
                                </span>
                                )
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  ) : notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">No notifications right now</div>
                  ) : (
                    (notifFilter === 'unread' ? unreadNotifs : notifications).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.relatedClientId) setSelectedClientId(n.relatedClientId);
                          if (n.linkTab) setActiveTab(n.linkTab);
                          setShowNotifDropdown(false);
                        }}
                        className={`p-2.5 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          !n.read ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 shrink-0">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Hierarchy Quick Switcher */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2.5 p-1.5 px-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {currentUser.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadge(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-md shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Role Hierarchy Switcher
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Switch between roles to test permissions & Client Portal
                  </p>
                </div>

                <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-md flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        currentUser.id === user.id ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <img src={user.avatar} alt="" className="w-7 h-7 rounded-md object-cover shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{user.title}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${getRoleBadge(
                           user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      if (confirm(`Sign out of ${currentUser.name}'s session?`)) {
                        logout();
                      }
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs flex items-center gap-2 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out of Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Database Backup & Reset Menu */}
          <div className="relative" ref={systemRef}>
            <button
              onClick={() => setShowSystemMenu(!showSystemMenu)}
              className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              title="System Backup & Demo Controls"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {showSystemMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  System Database & Cloud
                </div>
                <button
                  onClick={() => {
                    setShowCloudSyncModal(true);
                    setShowSystemMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>Cloud Persistence & Sync</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={handleExportBackup}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Export Local Backup (.json)</span>
                </button>
                <button
                  onClick={handleImportClick}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span>Restore from Backup</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => {
                    if (confirm('Reset entire CRM database to default demo dataset?')) {
                      resetToDefaultData();
                      setShowSystemMenu(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold"
                >
                  <RefreshCw className="w-4 h-4 text-red-600" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Data Persistence & Sync Modal */}
      <CloudDataSyncModal isOpen={showCloudSyncModal} onClose={() => setShowCloudSyncModal(false)} />
    </header>
  );
};
