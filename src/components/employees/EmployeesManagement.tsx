import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Key,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Briefcase,
  AlertCircle,
  Sparkles,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  X,
  Plus,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  Copy,
  Check,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { User, UserRole, UserPermissions, RoleDefinition } from '../../types/crm';
import { RolesAndCapabilitiesView } from './RolesAndCapabilitiesView';
import {
  SYSTEM_CAPABILITIES,
  ROLE_PRESET_TEMPLATES,
  CapabilityDefinition,
} from '../../data/capabilitiesData';

export const EmployeesManagement: React.FC = () => {
  const {
    users,
    currentUser,
    companies,
    clients,
    tasks,
    leads,
    departments,
    addUser,
    updateUser,
    deleteUser,
    updateUserProfile,
    resetUserPassword,
    reassignEmployeeWork,
    roles,
    addRole,
    updateRole,
    deleteRole,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'employees' | 'roles'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  // Modals for Users
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reassignToUserId, setReassignToUserId] = useState<string>('');
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState<string | null>(null);

  // Modals for Roles
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);

  // Modals for Reset Password (Admin / Branch Manager)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetNewPin, setResetNewPin] = useState('');
  const [showResetPassInput, setShowResetPassInput] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Available departments list
  const allDepartmentNames = Array.from(
    new Set([
      ...(departments || []).map((d) => d.name),
      'Executive Management',
      'PRO Operations',
      'Visa & Immigration',
      'Corporate Setup & Legal',
      'Accounting & Finance',
      'Business Development',
    ])
  ).filter(Boolean);

  // Form State for User
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    customRoleId: undefined,
    department: departments[0]?.name || 'PRO Operations',
    jobTitle: 'PRO Case Specialist',
    companyId: companies[0]?.id || '',
    password: '',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    permissions: {
      canCreateClients: true,
      canEditStages: true,
      canManagePayments: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canViewAllCompanies: false,
      canAssignEmployees: false,
      canDeleteRecords: false,
      canExportReports: false,
      canManageUsers: false,
      canManageCompanies: false,
    },
  });

  // Form State for Role
  const [roleFormData, setRoleFormData] = useState<{
    name: string;
    code: string;
    description: string;
    roleType: UserRole;
    color: string;
    permissions: UserPermissions;
  }>({
    name: '',
    code: '',
    description: '',
    roleType: 'employee',
    color: '#3b82f6',
    permissions: {
      canCreateClients: true,
      canEditStages: true,
      canManagePayments: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canViewAllCompanies: false,
      canAssignEmployees: false,
      canDeleteRecords: false,
      canExportReports: false,
      canManageUsers: false,
      canManageCompanies: false,
    },
  });

  // Filtered Users
  const displayUsers = (users || []).filter((u) => {
    if (!u) return false;
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm));

    const matchesRole =
      roleFilter === 'all' ||
      u.role === roleFilter ||
      u.customRoleId === roleFilter;

    const matchesDept =
      departmentFilter === 'all' ||
      u.department?.toLowerCase() === departmentFilter.toLowerCase();

    const matchesComp =
      companyFilter === 'all' ||
      u.companyId === companyFilter ||
      (u.companyIds && u.companyIds.includes(companyFilter));

    return Boolean(matchesSearch && matchesRole && matchesDept && matchesComp);
  });

  // Handlers for User CRUD
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      customRoleId: undefined,
      department: departments[0]?.name || 'PRO Operations',
      jobTitle: 'PRO Case Officer',
      companyId: companies[0]?.id || '',
      password: 'Adcs' + Math.floor(1000 + Math.random() * 9000) + '!',
      status: 'active',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 100)}?w=150`,
      permissions: {
        canCreateClients: true,
        canEditStages: true,
        canManagePayments: false,
        canEditInvoices: false,
        canDeleteInvoices: false,
        canViewAllCompanies: false,
        canAssignEmployees: false,
        canDeleteRecords: false,
        canExportReports: false,
        canManageUsers: false,
        canManageCompanies: false,
      },
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    const existingCompIds = user.companyIds && user.companyIds.length > 0
      ? user.companyIds
      : user.companyId
      ? [user.companyId]
      : [];
    setFormData({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role || 'employee',
      customRoleId: user.customRoleId,
      department: user.department || (departments[0]?.name || 'PRO Operations'),
      jobTitle: user.jobTitle || 'Staff Member',
      companyId: user.companyId || existingCompIds[0] || '',
      companyIds: existingCompIds,
      status: user.status || 'active',
      avatar: user.avatar,
      permissions: user.permissions || {
        canCreateClients: true,
        canEditStages: true,
        canManagePayments: false,
        canEditInvoices: false,
        canDeleteInvoices: false,
        canViewAllCompanies: false,
        canAssignEmployees: false,
        canDeleteRecords: false,
        canExportReports: false,
        canManageUsers: false,
        canManageCompanies: false,
      },
    });
    setShowEditModal(true);
  };

  const handleOpenPermissions = (user: User) => {
    setSelectedUser(user);
    setFormData({
      ...user,
      permissions: user.permissions || {
        canCreateClients: true,
        canEditStages: true,
        canManagePayments: false,
        canEditInvoices: false,
        canDeleteInvoices: false,
        canViewAllCompanies: false,
        canAssignEmployees: false,
        canDeleteRecords: false,
        canExportReports: false,
        canManageUsers: false,
        canManageCompanies: false,
      },
    });
    setShowPermissionsModal(true);
  };

  const handleOpenResetPassword = (user: User) => {
    setResetTargetUser(user);
    setResetNewPassword('');
    setResetNewPin(user.securityPin || '');
    setShowResetPassInput(false);
    setResetFeedback(null);
    setCopiedPassword(false);
    setShowResetPasswordModal(true);
  };

  const handleGenerateStrongPassword = () => {
    const prefixes = ['Adcs', 'Secure', 'ProCRM', 'Dubai', 'Staff', 'Apex'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const sym = ['#', '!', '$', '@'][Math.floor(Math.random() * 4)];
    const pass = `${prefix}${sym}${num}`;
    setResetNewPassword(pass);
    setShowResetPassInput(true);
  };

  const handleCopyCredentials = () => {
    if (!resetNewPassword) return;
    const credText = `CRM Login Credentials\nUser: ${resetTargetUser?.name}\nEmail: ${resetTargetUser?.email}\nPassword: ${resetNewPassword}${resetNewPin ? `\nPIN: ${resetNewPin}` : ''}`;
    navigator.clipboard?.writeText(credText);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 3000);
  };

  const handleExecuteResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    if (!resetNewPassword.trim() || resetNewPassword.trim().length < 4) {
      setResetFeedback({ type: 'error', message: 'Password must be at least 4 characters long.' });
      return;
    }

    const res = resetUserPassword(resetTargetUser.id, resetNewPassword, resetNewPin);
    if (res.success) {
      setResetFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setShowResetPasswordModal(false);
        setResetTargetUser(null);
      }, 2000);
    } else {
      setResetFeedback({ type: 'error', message: res.message });
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    addUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '+971 50 000 0000',
      role: formData.role as UserRole,
      customRoleId: formData.customRoleId,
      department: formData.department || 'Operations',
      jobTitle: formData.jobTitle || 'PRO Specialist',
      companyId: formData.companyId || (companies[0]?.id || 'comp-1'),
      companyIds: formData.companyId ? [formData.companyId] : [companies[0]?.id || 'comp-1'],
      status: (formData.status as 'active' | 'inactive') || 'active',
      avatar: formData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      password: formData.password || 'Adcs2026!',
      permissions: formData.permissions as UserPermissions,
    });

    // Reset filters so the user immediately sees the newly created staff member
    if (searchTerm) setSearchTerm('');
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !formData.name || !formData.email) return;

    const targetCompIds = formData.companyIds && formData.companyIds.length > 0
      ? formData.companyIds
      : formData.companyId
      ? [formData.companyId]
      : [];

    updateUser(selectedUser.id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim(),
      role: formData.role as UserRole,
      customRoleId: formData.customRoleId,
      department: formData.department,
      jobTitle: formData.jobTitle,
      companyId: formData.companyId || targetCompIds[0] || '',
      companyIds: targetCompIds,
      status: formData.status as 'active' | 'inactive',
      avatar: formData.avatar,
      permissions: formData.permissions as UserPermissions,
    });

    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleReassignWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !reassignToUserId) return;
    const targetUser = users.find((u) => u.id === reassignToUserId);
    reassignEmployeeWork(selectedUser.id, reassignToUserId);
    setReassignSuccessMsg(`Successfully reassigned all leads, cases, and tasks from ${selectedUser.name} to ${targetUser?.name || 'new employee'}.`);
    setTimeout(() => {
      setShowReassignModal(false);
      setSelectedUser(null);
      setReassignToUserId('');
      setReassignSuccessMsg(null);
    }, 1800);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleSavePermissions = () => {
    if (!selectedUser || !formData.permissions) return;
    updateUser(selectedUser.id, {
      permissions: formData.permissions as UserPermissions,
    });
    setShowPermissionsModal(false);
    setSelectedUser(null);
  };

  // Handlers for Role CRUD
  const handleOpenAddRole = () => {
    setRoleFormData({
      name: '',
      code: '',
      description: '',
      roleType: 'employee',
      color: '#3b82f6',
      permissions: {
        canCreateClients: true,
        canEditStages: true,
        canManagePayments: false,
        canEditInvoices: false,
        canDeleteInvoices: false,
        canViewAllCompanies: false,
        canAssignEmployees: false,
        canDeleteRecords: false,
        canExportReports: false,
        canManageUsers: false,
        canManageCompanies: false,
      },
    });
    setShowAddRoleModal(true);
  };

  const handleOpenEditRole = (role: RoleDefinition) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name ?? '',
      code: role.code ?? '',
      description: role.description ?? '',
      roleType: role.roleType || 'employee',
      color: role.color || '#3b82f6',
      permissions: role.permissions || {
        canCreateClients: true,
        canEditStages: true,
        canManagePayments: false,
        canEditInvoices: false,
        canDeleteInvoices: false,
        canViewAllCompanies: false,
        canAssignEmployees: false,
        canDeleteRecords: false,
        canExportReports: false,
        canManageUsers: false,
        canManageCompanies: false,
      },
    });
    setShowEditRoleModal(true);
  };

  const handleSaveAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name) return;

    const code = roleFormData.code || roleFormData.name.toLowerCase().replace(/\s+/g, '_');
    addRole({
      name: roleFormData.name,
      code,
      description: roleFormData.description,
      roleType: roleFormData.roleType,
      color: roleFormData.color,
      badgeBg: `${roleFormData.color}20`,
      badgeText: roleFormData.color,
      isSystem: false,
      permissions: roleFormData.permissions,
    });

    setShowAddRoleModal(false);
  };

  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !roleFormData.name) return;

    updateRole(selectedRole.id, {
      name: roleFormData.name,
      description: roleFormData.description,
      roleType: roleFormData.roleType,
      color: roleFormData.color,
      badgeBg: `${roleFormData.color}20`,
      badgeText: roleFormData.color,
      permissions: roleFormData.permissions,
    });

    setShowEditRoleModal(false);
    setSelectedRole(null);
  };

  const handleConfirmDeleteRole = () => {
    if (!selectedRole) return;
    deleteRole(selectedRole.id);
    setShowDeleteRoleModal(false);
    setSelectedRole(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'master':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800';
      case 'employee':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      case 'agent':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800';
      case 'client':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
    }
  };

  if (currentUser.role === 'employee' || currentUser.role === 'agent' || currentUser.role === 'client') {
    if (!currentUser.permissions?.canManageUsers) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Staff and employee accounts are strictly restricted to assigned client profiles, cases, and tasks. Team directory and role configuration are reserved for system administrators.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Team, Staff & Role-Based Access</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {users.length} Total Users &bull; {roles.length} Roles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Master administrators, branch managers, PRO case officers, and configure custom role permissions
          </p>
        </div>

        {(currentUser.role === 'master' || currentUser.role === 'admin') && (
          <div className="flex items-center gap-2">
            {activeTab === 'roles' ? (
              <button
                onClick={handleOpenAddRole}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Role</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Employee / User</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'employees'
              ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Staff & Team Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'roles'
              ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Role Definitions & Access Control Matrix ({roles.length})
        </button>
      </div>

      {activeTab === 'employees' ? (
        <>
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff by name, email, department, title, phone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Roles</option>
                <optgroup label="System Roles">
                  <option value="master">Master Super Admin</option>
                  <option value="admin">Branch Admin</option>
                  <option value="employee">Employee / PRO Specialist</option>
                  <option value="agent">Agent / Referral Partner</option>
                  <option value="client">Client Portal User</option>
                </optgroup>
                {roles.filter((r) => !r.isSystem).length > 0 && (
                  <optgroup label="Custom Roles">
                    {roles
                      .filter((r) => !r.isSystem)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Departments</option>
                {allDepartmentNames.map((deptName, i) => (
                  <option key={i} value={deptName}>
                    {deptName}
                  </option>
                ))}
              </select>

              {/* Company Branch Filter */}
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Branches</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayUsers.map((user) => {
              const userClients = (clients || []).filter(
                (c) =>
                  c &&
                  ((c.assignedEmployeeIds && c.assignedEmployeeIds.includes(user.id)) ||
                  c.assignedAdminId === user.id)
              );
              const userTasks = (tasks || []).filter((t) => t && t.assignedToUserId === user.id);
              const userBranch = (companies || []).find((c) => c && c.id === user.companyId);
              const customRoleObj = user.customRoleId
                ? (roles || []).find((r) => r && r.id === user.customRoleId)
                : null;
              const deptObj = user.department
                ? (departments || []).find(
                    (d) => d && d.name?.toLowerCase() === user.department?.toLowerCase()
                  )
                : null;

              return (
                <div
                  key={user.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar + Status + Role */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
                          }
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</h3>
                            {user.status === 'active' ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Account" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-400" title="Inactive Account" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{user.jobTitle || 'Team Member'}</p>
                        </div>
                      </div>

                      {customRoleObj ? (
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-xs"
                          style={{ backgroundColor: customRoleObj.color || '#3B82F6' }}
                        >
                          {customRoleObj.name}
                        </span>
                      ) : (
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      )}
                    </div>

                    {/* Meta Details */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.phone || '+971 50 000 0000'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{userBranch ? userBranch.name : 'All ADCS Branches (Master)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{user.department || 'PRO Operations'}</span>
                          {deptObj && (
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded text-white font-bold"
                              style={{ backgroundColor: deptObj.color || '#3B82F6' }}
                            >
                              {deptObj.code || 'DEP'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats pills: Leads, Cases, Tasks */}
                    <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Leads</span>
                        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {(leads || []).filter((l) => l && l.assignedEmployeeId === user.id).length}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Cases</span>
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400">{userClients.length}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Tasks</span>
                        <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                          {(userTasks || []).filter((t) => t && t.status !== 'completed').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPermissions(user)}
                        className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Shield className="w-3 h-3" />
                        <span>Perms</span>
                      </button>

                      {(currentUser.role === 'master' || currentUser.role === 'admin' || (currentUser.role as any) === 'branch_manager' || currentUser.id === user.id) && (
                        <button
                          onClick={() => handleOpenResetPassword(user)}
                          className="px-2 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Reset Employee Password & Credentials"
                        >
                          <Key className="w-3 h-3" />
                          <span>Reset Pwd</span>
                        </button>
                      )}

                      {(currentUser.role === 'master' || currentUser.role === 'admin' || (currentUser.role as any) === 'branch_manager') && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setReassignToUserId('');
                            setShowReassignModal(true);
                          }}
                          className="px-2 py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Reassign all leads, cases, and tasks to another employee"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Reassign Work</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit User Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {currentUser.role === 'master' && user.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Roles & Access Control Matrix Tab */
        <RolesAndCapabilitiesView
          roles={roles}
          users={users}
          currentUser={currentUser}
          onOpenAddRole={() => {
            setRoleFormData({
              name: '',
              code: '',
              description: '',
              roleType: 'employee',
              color: '#3b82f6',
              permissions: {
                canCreateClients: true,
                canCreateClient: true,
                canManageLeads: true,
                canEditStages: true,
                canManageWorkflows: false,
                canAssignTasks: true,
                canManagePayments: false,
                canEditInvoices: false,
                canDeleteInvoices: false,
                canViewFinancials: false,
                canApproveDiscounts: false,
                canViewAllCompanies: false,
                canManageCompanies: false,
                canManageDepartments: false,
                canManageVendors: false,
                canAssignEmployees: false,
                canDeleteRecords: false,
                canExportReports: false,
                canExportData: false,
                canManageUsers: false,
                canManageRoles: false,
                canManageSystemSettings: false,
              },
            });
            setShowAddRoleModal(true);
          }}
          onOpenEditRole={handleOpenEditRole}
          onOpenDeleteRole={(r) => {
            setSelectedRole(r);
            setShowDeleteRoleModal(true);
          }}
        />
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Employee / User Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name ?? ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email ?? ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Role & Policy *
                  </label>
                  <select
                    value={formData.customRoleId || formData.role || 'employee'}
                    onChange={(e) => {
                      const val = e.target.value;
                      const customRole = (roles || []).find((r) => r.id === val);
                      if (customRole) {
                        setFormData({
                          ...formData,
                          customRoleId: customRole.id,
                          role: customRole.roleType,
                          permissions: { ...customRole.permissions },
                        });
                      } else {
                        setFormData({
                          ...formData,
                          customRoleId: undefined,
                          role: val as UserRole,
                        });
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <optgroup label="System Standard Roles">
                      <option value="employee">Employee / PRO Specialist</option>
                      <option value="admin">Branch Admin</option>
                      <option value="master">Master Super Admin</option>
                      <option value="agent">Agent / Referral Partner</option>
                      <option value="client">Client Portal User</option>
                    </optgroup>
                    {roles.filter((r) => !r.isSystem).length > 0 && (
                      <optgroup label="Custom Organizational Roles">
                        {roles
                          .filter((r) => !r.isSystem)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} (Scope: {r.roleType})
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department ?? ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    {allDepartmentNames.map((deptName, i) => (
                      <option key={i} value={deptName}>
                        {deptName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Position
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle ?? ''}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Branch Assignment
                  </label>
                  <select
                    value={formData.companyId ?? ''}
                    onChange={(e) => {
                      const newCompId = e.target.value;
                      setFormData({ ...formData, companyId: newCompId, companyIds: [newCompId] });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.branchLocation ? `(${c.branchLocation})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Initial Login Password
                  </label>
                  <input
                    type="text"
                    value={formData.password ?? ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit User Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name ?? ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email ?? ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Role & Policy
                  </label>
                  <select
                    value={formData.customRoleId || formData.role || 'employee'}
                    onChange={(e) => {
                      const val = e.target.value;
                      const customRole = (roles || []).find((r) => r.id === val);
                      if (customRole) {
                        setFormData({
                          ...formData,
                          customRoleId: customRole.id,
                          role: customRole.roleType,
                          permissions: { ...customRole.permissions },
                        });
                      } else {
                        setFormData({
                          ...formData,
                          customRoleId: undefined,
                          role: val as UserRole,
                        });
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <optgroup label="System Standard Roles">
                      <option value="employee">Employee / PRO Specialist</option>
                      <option value="admin">Branch Admin</option>
                      <option value="master">Master Super Admin</option>
                      <option value="agent">Agent / Referral Partner</option>
                      <option value="client">Client Portal User</option>
                    </optgroup>
                    {roles.filter((r) => !r.isSystem).length > 0 && (
                      <optgroup label="Custom Organizational Roles">
                        {roles
                          .filter((r) => !r.isSystem)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} (Scope: {r.roleType})
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department ?? ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    {allDepartmentNames.map((deptName, i) => (
                      <option key={i} value={deptName}>
                        {deptName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle ?? ''}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status ?? 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="active">Active Access</option>
                    <option value="inactive">Suspended / Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Branch Assignment
                  </label>
                  <select
                    value={formData.companyId ?? ''}
                    onChange={(e) => {
                      const newCompId = e.target.value;
                      const curCompIds = formData.companyIds || [];
                      const updatedIds = curCompIds.includes(newCompId)
                        ? curCompIds
                        : [...curCompIds.filter((id) => id !== formData.companyId), newCompId];
                      setFormData({ ...formData, companyId: newCompId, companyIds: updatedIds });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.branchLocation ? `(${c.branchLocation})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">Delete User Account</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Are you sure you want to remove <strong>{selectedUser.name}</strong> ({selectedUser.email})?
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Work Modal */}
      {showReassignModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                <span>Reassign Work from {selectedUser.name}</span>
              </h3>
              <button onClick={() => setShowReassignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reassignSuccessMsg ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-emerald-600">{reassignSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleReassignWork} className="space-y-4 pt-4 text-xs">
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="font-bold text-purple-950 dark:text-purple-300">
                    Current Portfolio of {selectedUser.name}:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Leads</span>
                      <span className="text-base font-bold text-purple-700 dark:text-purple-300">
                        {(leads || []).filter((l) => l && l.assignedEmployeeId === selectedUser.id).length}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Cases / Clients</span>
                      <span className="text-base font-bold text-purple-700 dark:text-purple-300">
                        {(clients || []).filter((c) => c && ((c.assignedEmployeeIds && c.assignedEmployeeIds.includes(selectedUser.id)) || c.assignedAdminId === selectedUser.id)).length}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Tasks</span>
                      <span className="text-base font-bold text-purple-700 dark:text-purple-300">
                        {(tasks || []).filter((t) => t && t.assignedToUserId === selectedUser.id).length}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Select New Assigned Employee / Officer *
                  </label>
                  <select
                    required
                    value={reassignToUserId}
                    onChange={(e) => setReassignToUserId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold"
                  >
                    <option value="">-- Choose Employee to receive work --</option>
                    {(users || [])
                      .filter((u) => u && u.id !== selectedUser.id && u.status === 'active')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role} - {u.department || 'Operations'})
                        </option>
                      ))}
                  </select>
                </div>

                <p className="text-[11px] text-slate-500">
                  This action will atomically re-link all matching leads, ongoing client cases, and open tasks to the selected replacement officer.
                </p>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowReassignModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reassignToUserId}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20"
                  >
                    Transfer All Work
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Custom System Role</h3>
                  <p className="text-[11px] text-slate-500">Define role title, access tier, and granular capability matrix</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddRole} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
              {/* Quick Template Presets */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-2">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quick-Apply Recommended Role Template:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_PRESET_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const newPerms: UserPermissions = {
                          canCreateClients: false,
                          canCreateClient: false,
                          canManageLeads: false,
                          canEditStages: false,
                          canManageWorkflows: false,
                          canAssignTasks: false,
                          canManagePayments: false,
                          canEditInvoices: false,
                          canDeleteInvoices: false,
                          canViewFinancials: false,
                          canApproveDiscounts: false,
                          canViewAllCompanies: false,
                          canManageCompanies: false,
                          canManageDepartments: false,
                          canManageVendors: false,
                          canAssignEmployees: false,
                          canDeleteRecords: false,
                          canExportReports: false,
                          canExportData: false,
                          canManageUsers: false,
                          canManageRoles: false,
                          canManageSystemSettings: false,
                          ...tmpl.permissions,
                        };
                        setRoleFormData({
                          name: tmpl.name,
                          code: tmpl.name.toUpperCase().replace(/[^A-Z]/g, '_').slice(0, 15),
                          description: tmpl.description,
                          roleType: tmpl.roleType,
                          color: tmpl.color,
                          permissions: newPerms,
                        });
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer shadow-xs"
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleFormData.name ?? ''}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    placeholder="e.g. Senior Legal Counsel"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Base Access Level
                  </label>
                  <select
                    value={roleFormData.roleType ?? 'employee'}
                    onChange={(e) => setRoleFormData({ ...roleFormData, roleType: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="employee">Employee Staff Scope (Standard Case Execution)</option>
                    <option value="admin">Branch Manager Scope (Branch Operations & Staff)</option>
                    <option value="master">Super Admin Scope (Master Global Governance)</option>
                    <option value="agent">Agent / Partner Scope (Lead Referrals)</option>
                    <option value="client">Client Portal Scope (Self-Service)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Operational Description
                </label>
                <input
                  type="text"
                  value={roleFormData.description ?? ''}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  placeholder="e.g. Legal vetting, trade license drafting, and court clearances"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={roleFormData.color ?? '#3b82f6'}
                    onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-inner"
                  />
                  <input
                    type="text"
                    value={roleFormData.color ?? '#3b82f6'}
                    onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Granular Capabilities Matrix
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {Object.values(roleFormData.permissions || {}).filter(Boolean).length} flags enabled
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const safePerms: Partial<UserPermissions> = {};
                        SYSTEM_CAPABILITIES.forEach((c) => {
                          safePerms[c.key] = c.riskLevel === 'Low' || c.riskLevel === 'Moderate';
                        });
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, ...safePerms },
                        });
                      }}
                      className="text-[10px] font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
                    >
                      Enable Safe Flags
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allPerms: Partial<UserPermissions> = {};
                        SYSTEM_CAPABILITIES.forEach((c) => {
                          allPerms[c.key] = true;
                        });
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, ...allPerms },
                        });
                      }}
                      className="text-[10px] font-bold px-2 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-all cursor-pointer"
                    >
                      Enable All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clearPerms: Partial<UserPermissions> = {};
                        SYSTEM_CAPABILITIES.forEach((c) => {
                          clearPerms[c.key] = false;
                        });
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, ...clearPerms },
                        });
                      }}
                      className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {Array.from(new Set(SYSTEM_CAPABILITIES.map((c) => c.category))).map((cat, i) => {
                    const capsInCat = SYSTEM_CAPABILITIES.filter((c) => c.category === cat);
                    return (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                          <span>{cat}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {capsInCat.filter((c) => roleFormData.permissions[c.key]).length} / {capsInCat.length} active
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {capsInCat.map((cap) => {
                            const isChecked = Boolean(roleFormData.permissions[cap.key]);
                            return (
                              <label
                                key={cap.key}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    setRoleFormData({
                                      ...roleFormData,
                                      permissions: {
                                        ...roleFormData.permissions,
                                        [cap.key]: e.target.checked,
                                      },
                                    })
                                  }
                                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                      {cap.label}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                        cap.riskLevel === 'Critical Admin'
                                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                          : cap.riskLevel === 'High'
                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                      }`}
                                    >
                                      {cap.riskLevel}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                    {cap.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0 sticky bottom-0 bg-white dark:bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0"
                  style={{ backgroundColor: roleFormData.color || '#3B82F6' }}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Role: {selectedRole.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure granted permissions and operational privileges</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditRoleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleFormData.name ?? ''}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={roleFormData.color ?? '#3b82f6'}
                      onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-inner"
                    />
                    <input
                      type="text"
                      value={roleFormData.color ?? '#3b82f6'}
                      onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                      className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={roleFormData.description ?? ''}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Categorized Granular Permissions */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Role Permissions Matrix
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {Object.values(roleFormData.permissions || {}).filter(Boolean).length} / {SYSTEM_CAPABILITIES.length} capabilities enabled
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const safePerms: Partial<UserPermissions> = {};
                        SYSTEM_CAPABILITIES.forEach((c) => {
                          safePerms[c.key] = c.riskLevel === 'Low' || c.riskLevel === 'Moderate';
                        });
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, ...safePerms },
                        });
                      }}
                      className="text-[10px] font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                    >
                      Safe Defaults
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allPerms: Partial<UserPermissions> = {};
                        SYSTEM_CAPABILITIES.forEach((c) => {
                          allPerms[c.key] = true;
                        });
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, ...allPerms },
                        });
                      }}
                      className="text-[10px] font-bold px-2 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer"
                    >
                      Enable All
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {Array.from(new Set(SYSTEM_CAPABILITIES.map((c) => c.category))).map((cat, i) => {
                    const capsInCat = SYSTEM_CAPABILITIES.filter((c) => c.category === cat);
                    return (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                          <span>{cat}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {capsInCat.filter((c) => roleFormData.permissions[c.key]).length} / {capsInCat.length} active
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {capsInCat.map((cap) => {
                            const isChecked = Boolean(roleFormData.permissions[cap.key]);
                            return (
                              <label
                                key={cap.key}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    setRoleFormData({
                                      ...roleFormData,
                                      permissions: {
                                        ...roleFormData.permissions,
                                        [cap.key]: e.target.checked,
                                      },
                                    })
                                  }
                                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                      {cap.label}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                        cap.riskLevel === 'Critical Admin'
                                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                          : cap.riskLevel === 'High'
                                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                      }`}
                                    >
                                      {cap.riskLevel}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                    {cap.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 py-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Save Role Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}
      {showDeleteRoleModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">Delete Custom Role</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Are you sure you want to delete role <strong>{selectedRole.name}</strong>?
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteRoleModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteRole}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    User Privileges: {selectedUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Role: <strong className="uppercase font-mono">{selectedUser.role}</strong> • Department: {selectedUser.department || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-2 shrink-0">
              Select or customize granted system capabilities for this individual user account:
            </p>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {Array.from(new Set(SYSTEM_CAPABILITIES.map((c) => c.category))).map((cat, i) => {
                const capsInCat = SYSTEM_CAPABILITIES.filter((c) => c.category === cat);
                return (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{cat}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {capsInCat.filter((c) => formData.permissions && formData.permissions[c.key]).length} / {capsInCat.length} active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {capsInCat.map((cap) => {
                        const isChecked = Boolean(formData.permissions && formData.permissions[cap.key]);
                        return (
                          <label
                            key={cap.key}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  permissions: {
                                    ...(formData.permissions as UserPermissions),
                                    [cap.key]: e.target.checked,
                                  },
                                })
                              }
                              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                  {cap.label}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                    cap.riskLevel === 'Critical Admin'
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                      : cap.riskLevel === 'High'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  {cap.riskLevel}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {cap.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin / Branch Manager Reset Password Modal */}
      {showResetPasswordModal && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reset Account Password</h3>
                  <p className="text-[11px] text-slate-400">Admin & Branch Manager Authority</p>
                </div>
              </div>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target User Info Summary */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <img
                src={
                  resetTargetUser.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                }
                alt={resetTargetUser.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {resetTargetUser.name}
                  </h4>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${getRoleBadge(resetTargetUser.role)}`}>
                    {resetTargetUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{resetTargetUser.email}</p>
              </div>
            </div>

            {resetFeedback && (
              <div
                className={`mt-3 p-3 rounded-xl border flex items-center gap-2 text-xs ${
                  resetFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                }`}
              >
                {resetFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                )}
                <span>{resetFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleExecuteResetPassword} className="mt-4 space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateStrongPassword}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPassInput ? 'text' : 'password'}
                    value={resetNewPassword ?? ''}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password (min 4 chars)"
                    className="w-full p-2.5 pr-9 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassInput(!showResetPassInput)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Security Authorization PIN (Optional)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetNewPin ?? ''}
                  onChange={(e) => setResetNewPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono tracking-widest"
                />
              </div>

              {resetNewPassword && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                  <span className="text-[11px] text-amber-800 dark:text-amber-300 font-mono font-bold">
                    {resetNewPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    {copiedPassword ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPassword ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  Save & Apply Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
