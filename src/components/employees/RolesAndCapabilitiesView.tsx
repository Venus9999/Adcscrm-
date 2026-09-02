import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Check,
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Eye,
  Sparkles,
  Info,
  Layers,
  FileText,
  DollarSign,
  Building2,
  Award,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { RoleDefinition, User, UserPermissions, UserRole } from '../../types/crm';
import {
  SYSTEM_CAPABILITIES,
  ROLE_PRESET_TEMPLATES,
  ROLE_HIERARCHY_GUIDES,
  CapabilityDefinition,
} from '../../data/capabilitiesData';

interface RolesAndCapabilitiesViewProps {
  roles: RoleDefinition[];
  users: User[];
  currentUser: User;
  onOpenAddRole: () => void;
  onOpenEditRole: (role: RoleDefinition) => void;
  onOpenDeleteRole: (role: RoleDefinition) => void;
}

export const RolesAndCapabilitiesView: React.FC<RolesAndCapabilitiesViewProps> = ({
  roles,
  users,
  currentUser,
  onOpenAddRole,
  onOpenEditRole,
  onOpenDeleteRole,
}) => {
  const { updateUser } = useCRM();
  const [subTab, setSubTab] = useState<'profiles' | 'matrix' | 'guide'>('profiles');
  const [selectedRoleForInspection, setSelectedRoleForInspection] = useState<RoleDefinition | null>(null);
  const [roleToAssignStaff, setRoleToAssignStaff] = useState<RoleDefinition | null>(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [capabilitySearch, setCapabilitySearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(SYSTEM_CAPABILITIES.map((c) => c.category)));

  const filteredCapabilities = SYSTEM_CAPABILITIES.filter((c) => {
    const matchesSearch =
      c.label.toLowerCase().includes(capabilitySearch.toLowerCase()) ||
      c.description.toLowerCase().includes(capabilitySearch.toLowerCase()) ||
      c.key.toLowerCase().includes(capabilitySearch.toLowerCase()) ||
      c.category.toLowerCase().includes(capabilitySearch.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'all' || c.category === selectedCategoryFilter;

    return Boolean(matchesSearch && matchesCategory);
  });

  const getRiskBadge = (risk: CapabilityDefinition['riskLevel']) => {
    switch (risk) {
      case 'Critical Admin':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Moderate':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Low':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Clients & Leads':
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Workflows & Execution':
        return <Layers className="w-3.5 h-3.5 text-blue-400" />;
      case 'Financials & Invoicing':
        return <DollarSign className="w-3.5 h-3.5 text-amber-400" />;
      case 'Multi-Branch & Governance':
        return <Building2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'Staff & Access Control':
        return <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Audit & Export':
        return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const handleToggleUserRole = (user: User, role: RoleDefinition) => {
    const isAssigned = role.isSystem
      ? !user.customRoleId && user.role === role.roleType
      : user.customRoleId === role.id;

    if (isAssigned) {
      // Revert to standard employee role
      updateUser(user.id, {
        customRoleId: undefined,
        role: 'employee',
      });
    } else {
      if (role.isSystem) {
        updateUser(user.id, {
          customRoleId: undefined,
          role: role.roleType,
          permissions: role.permissions,
        });
      } else {
        updateUser(user.id, {
          customRoleId: role.id,
          role: role.roleType,
          permissions: role.permissions,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Roles & Capabilities Governance Architecture
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {SYSTEM_CAPABILITIES.length} SYSTEM CAPABILITIES
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Inspect granular permission flags, compare role capabilities side-by-side, define custom organizational roles, and enforce strict security boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {currentUser.role === 'master' && (
              <button
                onClick={onOpenAddRole}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Role</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setSubTab('profiles')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'profiles'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Role Profiles ({roles.length})</span>
          </button>

          <button
            onClick={() => setSubTab('matrix')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Comparative Capabilities Matrix</span>
          </button>

          <button
            onClick={() => setSubTab('guide')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'guide'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Role Hierarchy & Scope Guide</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: ROLE PROFILES CARDS */}
      {subTab === 'profiles' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(roles || []).map((r) => {
              const assignedStaff = (users || []).filter((u) => {
                if (!u) return false;
                if (r.isSystem) {
                  return !u.customRoleId && u.role === r.roleType;
                }
                return u.customRoleId === r.id;
              });
              const grantedCapsCount = Object.values(r.permissions || {}).filter(Boolean).length;

              return (
                <div
                  key={r.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0"
                          style={{ backgroundColor: r.color || '#3B82F6' }}
                        >
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">{r.name}</h3>
                          <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-700">
                            SCOPE: {r.roleType}
                          </span>
                        </div>
                      </div>

                      {r.isSystem ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                          System Default
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                          Custom Role
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {r.description || 'Standard system role for operational team members.'}
                    </p>

                    {/* Stats & Capability Count */}
                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Enabled Capabilities</span>
                        <span className="font-bold text-indigo-400 mt-0.5 block">
                          {grantedCapsCount} / {SYSTEM_CAPABILITIES.length} Flags
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Staff</span>
                        <span className="font-bold text-emerald-400 mt-0.5 block">
                          {assignedStaff.length} Users Assigned
                        </span>
                      </div>
                    </div>

                    {/* Assigned Staff Preview */}
                    {assignedStaff.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Assigned Team Members:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {assignedStaff.slice(0, 4).map((staff) => (
                            <div
                              key={staff.id}
                              className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-0.5 text-[10px] text-slate-300"
                            >
                              <img
                                src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt=""
                                className="w-3.5 h-3.5 rounded-full object-cover"
                              />
                              <span className="font-medium truncate max-w-[80px]">{staff.name.split(' ')[0]}</span>
                            </div>
                          ))}
                          {assignedStaff.length > 4 && (
                            <span className="text-[10px] text-slate-500 font-semibold px-1.5 py-0.5 bg-slate-800 rounded-md">
                              +{assignedStaff.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Highlighted Privileges */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Privilege Highlights:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {r.permissions.canCreateCompanies && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            🏢 Create Companies
                          </span>
                        )}
                        {r.permissions.canCreateBranches && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            🌿 Create Branches
                          </span>
                        )}
                        {r.permissions.canCreateClients && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            ✓ Client Dossiers
                          </span>
                        )}
                        {r.permissions.canEditStages && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            ✓ Advance Stages
                          </span>
                        )}
                        {r.permissions.canManagePayments && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            ✓ Invoicing & Ledger
                          </span>
                        )}
                        {r.permissions.canManageUsers && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            ✓ Staff Accounts
                          </span>
                        )}
                        {r.permissions.canDeleteRecords && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            ⚠ Hard Delete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setRoleToAssignStaff(r)}
                      className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Assign or unassign employees to this role"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign Staff</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedRoleForInspection(r)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Inspect Capabilities"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                      </button>

                      <button
                        onClick={() => onOpenEditRole(r)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Edit Role Matrix"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!r.isSystem && currentUser.role === 'master' && (
                        <button
                          onClick={() => onOpenDeleteRole(r)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all text-xs font-semibold cursor-pointer"
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

      {/* Role Staff Assignment Modal */}
      {roleToAssignStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: roleToAssignStaff.color || '#3B82F6' }}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Assign Staff to Role: {roleToAssignStaff.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Check employees to grant them this role and its permission policies.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoleToAssignStaff(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search staff */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, email, or department..."
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Staff list */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {users
                .filter((u) => {
                  if (!u) return false;
                  return (
                    u.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                    (u.department && u.department.toLowerCase().includes(staffSearchQuery.toLowerCase()))
                  );
                })
                .map((u) => {
                  const isAssigned = roleToAssignStaff.isSystem
                    ? !u.customRoleId && u.role === roleToAssignStaff.roleType
                    : u.customRoleId === roleToAssignStaff.id;

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleToggleUserRole(u, roleToAssignStaff)}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isAssigned
                          ? 'bg-blue-600/10 border-blue-500/40 text-white'
                          : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {u.email} • {u.department || 'Operations'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAssigned ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Assigned</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium">
                            Click to Assign
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                Changes take effect and synchronize in real-time.
              </span>
              <button
                onClick={() => setRoleToAssignStaff(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INTERACTIVE COMPARATIVE CAPABILITIES MATRIX */}
      {subTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in">
          {/* Matrix Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={capabilitySearch}
                onChange={(e) => setCapabilitySearch(e.target.value)}
                placeholder="Search capabilities (e.g. invoice, delete, client, stages)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="all">All Functional Categories</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 min-w-[260px]">Capability & Operational Scope</th>
                  <th className="p-3.5 min-w-[130px]">Category</th>
                  <th className="p-3.5 text-center min-w-[110px]">Risk Tier</th>
                  {roles.map((r) => (
                    <th key={r.id} className="p-3.5 text-center min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-white truncate max-w-[110px]">{r.name}</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{r.roleType}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredCapabilities.map((cap) => (
                  <tr key={cap.key} className="hover:bg-slate-800/40 transition-colors">
                    {/* Capability description */}
                    <td className="p-3.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{cap.label}</span>
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          {cap.key}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{cap.description}</p>
                      <p className="text-[10px] text-slate-500 italic">Scope: {cap.technicalScope}</p>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(cap.category)}
                        <span className="text-xs text-slate-300 font-semibold">{cap.category}</span>
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(
                          cap.riskLevel
                        )}`}
                      >
                        {cap.riskLevel}
                      </span>
                    </td>

                    {/* Role flags */}
                    {roles.map((r) => {
                      const isGranted = Boolean(r.permissions && r.permissions[cap.key]);
                      return (
                        <td key={r.id} className="p-3.5 text-center whitespace-nowrap">
                          {isGranted ? (
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs">
                              <Check className="w-4 h-4 font-bold" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-600">
                              <X className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ROLE HIERARCHY & GOVERNANCE ARCHITECTURE GUIDE */}
      {subTab === 'guide' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLE_HIERARCHY_GUIDES.map((guide) => (
              <div
                key={guide.role}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0"
                        style={{ backgroundColor: guide.color }}
                      >
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">{guide.title}</h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          LEVEL: {guide.securityClearance}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${guide.badgeBg}`}>
                      {guide.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    {guide.scopeSummary}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Core Functional Mandate:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {guide.keyResponsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                  <span>Data Scope:</span>
                  <span className="font-semibold text-slate-200">{guide.dataVisibilityScope}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Capabilities Inspection Modal */}
      {selectedRoleForInspection && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0"
                  style={{ backgroundColor: selectedRoleForInspection.color || '#3B82F6' }}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedRoleForInspection.name} — Full Capabilities Audit
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Scope Type: {selectedRoleForInspection.roleType.toUpperCase()} •{' '}
                    {Object.values(selectedRoleForInspection.permissions || {}).filter(Boolean).length} Active
                    Permissions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRoleForInspection(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                {selectedRoleForInspection.description || 'System security role profile.'}
              </p>

              {/* Categorized Capabilities List */}
              <div className="space-y-3">
                {categories.map((cat, i) => {
                  const catCaps = SYSTEM_CAPABILITIES.filter((c) => c.category === cat);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        {getCategoryIcon(cat)}
                        <span>{cat}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catCaps.map((cap) => {
                          const isGranted = Boolean(
                            selectedRoleForInspection.permissions &&
                              selectedRoleForInspection.permissions[cap.key]
                          );
                          return (
                            <div
                              key={cap.key}
                              className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                                isGranted
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                                  : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                                  isGranted
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                                }`}
                              >
                                {isGranted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-xs leading-snug">{cap.label}</div>
                                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {cap.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  const role = selectedRoleForInspection;
                  setSelectedRoleForInspection(null);
                  onOpenEditRole(role);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Modify Permissions
              </button>
              <button
                onClick={() => setSelectedRoleForInspection(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
