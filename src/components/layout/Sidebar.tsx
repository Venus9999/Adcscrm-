import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  FileCheck2,
  CheckSquare,
  DollarSign,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  Settings,
  Compass,
  Briefcase,
  UserPlus,
  Receipt,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Handshake,
  LogOut,
  Mail,
  Globe,
  Layers,
  Tag,
  Smartphone,
  X,
  Wand2,
  PenTool,
  Server,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { PWAInstallModal } from '../common/PWAInstallModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface SidebarNavItem {
  id: string;
  label: string;
  icon: any;
  allowedRoles: string[];
  badge?: number;
  badgeColor?: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    tasks,
    expiringDocuments,
    messages,
    invoices,
    leads,
    visaApplications,
    setSelectedClientId,
    crmBranding,
    logout,
  } = useCRM();

  const [showPWAInstallModal, setShowPWAInstallModal] = React.useState(false);
  const { isInstalled, isAndroid } = usePWAInstall();

  const isClient = currentUser?.role === 'client';

  const pendingTasksCount = (tasks || []).filter((t) => t && t.status !== 'completed' && t.status !== 'cancelled').length;
  const unreadMessagesCount = (messages || []).filter((m) => m && !m.read && m.senderRole !== currentUser?.role).length;
  const unpaidInvoicesCount = (invoices || []).filter((i) => i && (i.status === 'unpaid' || i.status === 'partially_paid')).length;
  const urgentExpiriesCount = (expiringDocuments || []).filter((e) => e && e.isUrgent).length;
  const newLeadsCount = (leads || []).filter((l) => l && l.status === 'new').length;
  const activeVisaCount = (visaApplications || []).filter(
    (v) => v && v.status !== 'issued' && v.status !== 'rejected'
  ).length;

  const masterControlItems: SidebarNavItem[] = [
    {
      id: isClient ? 'client_portal' : 'dashboard',
      label: isClient ? 'My Dashboard' : 'Dashboard',
      icon: isClient ? Compass : LayoutDashboard,
      allowedRoles: ['master', 'admin', 'employee', 'client'],
    },
    {
      id: 'leads',
      label: 'Leads & Inquiries',
      icon: UserPlus,
      badge: newLeadsCount > 0 ? newLeadsCount : undefined,
      badgeColor: 'bg-blue-500 text-white',
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'companies',
      label: 'Companies & Branches',
      icon: Building2,
      allowedRoles: ['master', 'admin'],
    },
    {
      id: 'departments',
      label: 'Departments & Units',
      icon: Layers,
      allowedRoles: ['master', 'admin'],
    },
    {
      id: 'categories',
      label: 'Categories & Lead Config',
      icon: Tag,
      allowedRoles: ['master', 'admin'],
    },
    {
      id: 'users',
      label: 'Team & Staff Roles',
      icon: ShieldCheck,
      allowedRoles: ['master', 'admin'],
    },
    {
      id: 'audit',
      label: 'Audit & Compliance',
      icon: ShieldAlert,
      allowedRoles: ['master', 'admin'],
    },
  ];

  const operationsItems: SidebarNavItem[] = [
    {
      id: 'clients',
      label: 'Clients Directory',
      icon: Users,
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'vendors',
      label: 'Vendors & Partners',
      icon: Handshake,
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'visa',
      label: 'Worldwide Visas',
      icon: Globe,
      badge: activeVisaCount > 0 ? activeVisaCount : undefined,
      badgeColor: 'bg-indigo-600 text-white',
      allowedRoles: ['master', 'admin', 'employee', 'client'],
    },
    {
      id: 'ai_advisor',
      label: 'AI Visa Intelligence',
      icon: Sparkles,
      allowedRoles: ['master', 'admin', 'employee', 'client'],
    },
    {
      id: 'photo_studio',
      label: 'AI Photo & Doc Studio',
      icon: Wand2,
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'pipeline',
      label: 'Work Pipeline',
      icon: Kanban,
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'gmail',
      label: 'Client Communications',
      icon: Mail,
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'services',
      label: 'Services Catalog',
      icon: Briefcase,
      allowedRoles: ['master', 'admin', 'employee', 'client'],
    },
    {
      id: 'documents',
      label: 'Document Vault',
      icon: FileCheck2,
      badge: urgentExpiriesCount > 0 ? urgentExpiriesCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      allowedRoles: ['master', 'admin', 'employee', 'client'],
    },
    {
      id: 'pdf_editor',
      label: 'PDF Editor & e-Sign',
      icon: PenTool,
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'tasks',
      label: 'Tasks & Follow-ups',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-blue-500 text-white',
      allowedRoles: ['master', 'admin', 'employee'],
    },
  ];

  const financeItems: SidebarNavItem[] = [
    {
      id: 'payments',
      label: 'Invoices & Billing',
      icon: DollarSign,
      badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
      badgeColor: 'bg-emerald-500 text-white',
      allowedRoles: ['master', 'admin', 'employee', 'client'],
    },
    {
      id: 'transactions',
      label: 'Transactions & Ledgers',
      icon: Receipt,
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'messages',
      label: 'Messages Hub',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: 'bg-blue-500 text-white',
      allowedRoles: ['master', 'admin', 'employee', 'client'],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      allowedRoles: ['master', 'admin', 'employee'],
    },
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: UserCheck,
      allowedRoles: ['master', 'admin', 'employee', 'client'],
    },
    {
      id: 'smtp',
      label: 'Email & SMTP Server',
      icon: Server,
      allowedRoles: ['master', 'admin'],
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      allowedRoles: ['master', 'admin'],
    },
  ];

  const renderNavGroup = (items: SidebarNavItem[], groupTitle?: string) => {
    const visible = items.filter((item) => item.allowedRoles.includes(currentUser.role));
    if (visible.length === 0) return null;

    return (
      <div className="mb-4">
        {groupTitle && (
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
            {groupTitle}
          </div>
        )}
        <div className="space-y-1">
          {visible.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold border-l-2 border-blue-500 pl-2.5 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-opacity ${
                      isActive ? 'text-blue-400 opacity-100' : 'opacity-70'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          {crmBranding.logoUrl ? (
            <div className="h-9 px-2 py-1 bg-white rounded-lg flex items-center justify-center shadow-md ring-1 ring-white/20 shrink-0">
              <img
                src={crmBranding.logoUrl}
                alt={crmBranding.name}
                className="h-6 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md text-sm ring-2 ring-blue-500/30 shrink-0">
              {crmBranding.shortName ? crmBranding.shortName[0] : 'A'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-tight truncate">{crmBranding.name}</span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded shrink-0">CRM</span>
            </div>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold truncate">{crmBranding.tagline}</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {renderNavGroup(masterControlItems, currentUser.role !== 'client' ? 'Master Control' : 'Portal')}
        {renderNavGroup(operationsItems, 'Operations')}
        {renderNavGroup(financeItems, 'Finance & Intel')}
      </nav>

      {/* Client Quick Preview Box */}
      {!isClient && (
        <div className="mx-3 mb-3 p-3 bg-slate-800/60 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client View</span>
            <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-bold">Preview</span>
          </div>
          <button
            onClick={() => {
              setActiveTab('client_portal');
              setSelectedClientId('client-1');
              onCloseMobile?.();
            }}
            className="w-full mt-1.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Launch Client Portal</span>
          </button>
        </div>
      )}

      {/* Android & PWA App Install Button */}
      <div className="mx-3 mb-3">
        <button
          onClick={() => setShowPWAInstallModal(true)}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 hover:from-blue-900/80 hover:to-indigo-900/80 border border-blue-800/50 text-blue-200 text-xs font-bold transition-all flex items-center justify-between gap-2 group shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-3.5 h-3.5 text-blue-300" />
            </div>
            <span className="truncate text-[11px]">
              {isInstalled ? 'Mobile App Info' : isAndroid ? 'Install Android App' : 'Install Mobile App'}
            </span>
          </div>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20 font-extrabold shrink-0">
            {isInstalled ? 'Installed' : 'PWA'}
          </span>
        </button>
      </div>

      {/* User Status Profile Footer with Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2">
        <div
          onClick={() => {
            setActiveTab('profile');
            onCloseMobile?.();
          }}
          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 cursor-pointer transition-opacity"
          title="View & Edit Profile Settings"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full bg-slate-700 object-cover ring-1 ring-slate-700 shrink-0"
          />
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-semibold text-white truncate flex items-center gap-1">
              <span className="truncate">{currentUser.name}</span>
              {currentUser.role === 'master' && <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />}
            </p>
            <p className="text-[10px] text-slate-400 capitalize truncate">
              {currentUser.title || `${currentUser.role} Account`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm(`Sign out of ${currentUser.name}'s session?`)) {
              logout();
            }
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer panel */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl border-r border-slate-800 select-none z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* PWA / Android Install Guide Modal */}
      <PWAInstallModal
        isOpen={showPWAInstallModal}
        onClose={() => setShowPWAInstallModal(false)}
      />
    </>
  );
};
