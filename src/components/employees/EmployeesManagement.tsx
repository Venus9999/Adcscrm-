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

export const EmployeesManagement: React.FC = () => {
  const {
    users,
    currentUser,
    companies,
    clients,
    tasks,
    leads,
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

  // Form State for User
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: 'PRO Operations',
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
  const displayUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesDept = departmentFilter === 'all' || u.department === departmentFilter;
    const matchesComp =
      companyFilter === 'all' ||
      u.companyId === companyFilter ||
      (u.companyIds && u.companyIds.includes(companyFilter));

    return matchesSearch && matchesRole && matchesDept && matchesComp;
  });

  // Handlers for User CRUD
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: 'PRO Operations',
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
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department || 'PRO Operations',
      jobTitle: user.jobTitle || 'Staff Member',
      companyId: user.companyId || '',
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

    updateUser(selectedUser.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role as UserRole,
      department: formData.department,
      jobTitle: formData.jobTitle,
      companyId: formData.companyId,
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
      name: role.name,
      code: role.code,
      description: role.description,
      roleType: role.roleType,
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
      case 'client':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
    }
  };

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
                <option value="master">Master Super Admin</option>
                <option value="admin">Branch Admin</option>
                <option value="employee">Employee / PRO Specialist</option>
                <option value="client">Client Portal User</option>
              </select>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Departments</option>
                <option value="Executive Management">Executive Management</option>
                <option value="PRO Operations">PRO Operations</option>
                <option value="Visa & Immigration">Visa & Immigration</option>
                <option value="Corporate Setup & Legal">Corporate Setup & Legal</option>
                <option value="Accounting & Finance">Accounting & Finance</option>
                <option value="Business Development">Business Development</option>
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
              const userClients = clients.filter(
                (c) =>
                  (c.assignedEmployeeIds && c.assignedEmployeeIds.includes(user.id)) ||
                  c.assignedAdminId === user.id
              );
              const userTasks = tasks.filter((t) => t.assignedToUserId === user.id);
              const userBranch = companies.find((c) => c.id === user.companyId);

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

                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
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
                        <span>{user.department || 'PRO Operations'}</span>
                      </div>
                    </div>

                    {/* Stats pills: Leads, Cases, Tasks */}
                    <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Leads</span>
                        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {leads.filter((l) => l.assignedEmployeeId === user.id).length}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Cases</span>
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400">{userClients.length}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Tasks</span>
                        <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                          {userTasks.filter((t) => t.status !== 'completed').length}
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

                      {(currentUser.role === 'master' || currentUser.role === 'admin' || currentUser.role === 'branch_manager') && (
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((r) => {
              const assignedCount = users.filter((u) => u.role === r.roleType).length;
              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: r.color || '#3b82f6' }} />
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{r.name}</h3>
                          <span className="text-[10px] font-mono text-slate-400">ROLE_TYPE: {r.roleType}</span>
                        </div>
                      </div>
                      {r.isSystem ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          System Default
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                          Custom Role
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-2.5">{r.description}</p>

                    {/* Permissions list */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Active Privileges:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {r.permissions.canCreateClients && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Create Clients
                          </span>
                        )}
                        {r.permissions.canEditStages && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Advance Stages
                          </span>
                        )}
                        {r.permissions.canManagePayments && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            Financials & Invoicing
                          </span>
                        )}
                        {r.permissions.canDeleteRecords && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Delete Records
                          </span>
                        )}
                        {r.permissions.canManageUsers && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            Manage Staff
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {assignedCount} Assigned Staff
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRole(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Role Permissions"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!r.isSystem && currentUser.role === 'master' && (
                        <button
                          onClick={() => {
                            setSelectedRole(r);
                            setShowDeleteRoleModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Custom Role"
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
        </div>
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
                    value={formData.name}
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
                    value={formData.email}
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    System Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="employee">Employee / PRO Specialist</option>
                    <option value="admin">Branch Admin</option>
                    <option value="master">Master Super Admin</option>
                    <option value="client">Client Portal User</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Position
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
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
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
                    value={formData.password}
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
                    value={formData.name}
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
                    value={formData.email}
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="employee">Employee / PRO Specialist</option>
                    <option value="admin">Branch Admin</option>
                    <option value="master">Master Super Admin</option>
                    <option value="client">Client Portal User</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
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
                    value={formData.status}
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
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
                        {leads.filter((l) => l.assignedEmployeeId === selectedUser.id).length}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Cases / Clients</span>
                      <span className="text-base font-bold text-purple-700 dark:text-purple-300">
                        {clients.filter((c) => (c.assignedEmployeeIds && c.assignedEmployeeIds.includes(selectedUser.id)) || c.assignedAdminId === selectedUser.id).length}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Tasks</span>
                      <span className="text-base font-bold text-purple-700 dark:text-purple-300">
                        {tasks.filter((t) => t.assignedToUserId === selectedUser.id).length}
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
                    {users
                      .filter((u) => u.id !== selectedUser.id && u.status === 'active')
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Custom System Role</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddRole} className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    placeholder="e.g. Senior Legal Counsel"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Base Access Type
                  </label>
                  <select
                    value={roleFormData.roleType}
                    onChange={(e) => setRoleFormData({ ...roleFormData, roleType: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="employee">Employee Staff Scope</option>
                    <option value="admin">Branch Manager Scope</option>
                    <option value="master">Super Admin Scope</option>
                    <option value="client">Client Portal Scope</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  placeholder="e.g. Legal vetting, trade license drafting, and court clearances"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Role Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={roleFormData.color}
                    onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={roleFormData.color}
                    onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Granular Permissions */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Granular Permission Matrix
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canCreateClients}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canCreateClients: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Create Client Dossiers</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canEditStages}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canEditStages: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Advance Workflow Stages</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canManagePayments}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canManagePayments: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Invoices & Payments</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canDeleteRecords}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canDeleteRecords: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Delete Records & Invoices</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canManageUsers}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canManageUsers: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Manage Staff & Users</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canExportReports}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canExportReports: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Export Reports & Backups</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Save New Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Role Definition</h3>
              <button onClick={() => setShowEditRoleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Role Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={roleFormData.color}
                    onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={roleFormData.color}
                    onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Granular Permissions */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Permissions Matrix
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canCreateClients}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canCreateClients: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Create Client Dossiers</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canEditStages}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canEditStages: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Advance Workflow Stages</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canManagePayments}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canManagePayments: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Invoices & Payments</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canDeleteRecords}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canDeleteRecords: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Delete Records & Invoices</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canManageUsers}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canManageUsers: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Manage Staff & Users</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleFormData.permissions.canExportReports}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          permissions: { ...roleFormData.permissions, canExportReports: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Export Reports & Backups</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">User Privileges & Access Rights</h3>
              <button onClick={() => setShowPermissionsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Configure system privileges for <strong>{selectedUser.name}</strong> ({selectedUser.role}):
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Create & Manage Clients</span>
                  <span className="text-[11px] text-slate-400">Add new client dossiers and edit passport/visa records</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.permissions?.canCreateClients}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canCreateClients: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Advance Workflow Stages</span>
                  <span className="text-[11px] text-slate-400">Move clients across pipeline milestones</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.permissions?.canEditStages}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canEditStages: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Delete Client Dossiers & Records</span>
                  <span className="text-[11px] text-slate-400">Permanently delete clients from database</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.permissions?.canDeleteRecords}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canDeleteRecords: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">View Financials & Invoices</span>
                  <span className="text-[11px] text-slate-400">Access invoices, payments, revenue metrics</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.permissions?.canManagePayments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canManagePayments: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Export CRM Data & Backups</span>
                  <span className="text-[11px] text-slate-400">Download CSV reports and database backups</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.permissions?.canExportReports}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canExportReports: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Manage Users & Staff</span>
                  <span className="text-[11px] text-slate-400">Add, edit, or suspend employee accounts</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.permissions?.canManageUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canManageUsers: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
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
                    value={resetNewPassword}
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
                  value={resetNewPin}
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
