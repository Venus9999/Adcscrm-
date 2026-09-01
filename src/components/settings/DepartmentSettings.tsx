import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  Briefcase,
  Layers,
  Sparkles,
  DollarSign,
  Filter,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  MapPin,
  Tag,
  Sliders,
  Award,
  Zap,
  Lock,
  Eye,
  FileCheck,
  FolderPlus,
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar,
  Compass,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Department } from '../../types/crm';

const DEFAULT_SERVICE_CATEGORIES = [
  'Visa Processing',
  'Business Setup',
  'Document Clearing',
  'PRO Services',
  'Recruitment & MOHRE',
  'Attestation & Legal',
  'Accounting & Tax Advisory',
  'Golden Visa Concierge',
  'Emirates ID & Medical',
  'Ejari & Tenancy Support',
];

const DEFAULT_PARENT_DIVISIONS = [
  'Executive Directorate',
  'Operations Directorate',
  'Immigration & Consular Directorate',
  'Commercial & Corporate Services',
  'Finance & Compliance Directorate',
  'Legal & Consular Directorate',
  'Human Capital & Client Services',
];

const COLOR_PRESETS = [
  { label: 'Royal Blue', hex: '#3B82F6' },
  { label: 'Emerald Green', hex: '#10B981' },
  { label: 'Cyan / Teal', hex: '#06B6D4' },
  { label: 'Purple / Violet', hex: '#8B5CF6' },
  { label: 'Amber / Gold', hex: '#F59E0B' },
  { label: 'Rose / Crimson', hex: '#F43F5E' },
  { label: 'Indigo / Navy', hex: '#6366F1' },
  { label: 'Pink / Magenta', hex: '#EC4899' },
];

export const DepartmentSettings: React.FC = () => {
  const {
    departments,
    companies,
    users,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    currentUser,
  } = useCRM();

  const canManage =
    currentUser.role === 'master' ||
    currentUser.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'general' | 'leadership' | 'contact' | 'services' | 'financials' | 'automation'>('general');
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [inspectingDept, setInspectingDept] = useState<Department | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Expanded Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    companyId: companies[0]?.id || '',
    parentDivision: 'Operations Directorate',
    description: '',
    headOfDepartmentId: '',
    headOfDepartment: '',
    deputyHeadId: '',
    deputyHead: '',
    assignedStaffIds: [] as string[],
    email: '',
    phone: '',
    location: '',
    workingHours: 'Mon - Fri 08:30 - 17:30 (UAE GST)',
    serviceCategories: [] as string[],
    targetSlaDays: 3,
    maxDossierCapacity: 40,
    costCenterCode: '',
    budget: 50000,
    spendingApprovalLimit: 5000,
    autoAssignMode: 'least_busy' as 'manual' | 'round_robin' | 'least_busy',
    dataAccessScope: 'department_only' as 'global' | 'department_only' | 'branch_only',
    escalationEmail: '',
    color: '#3B82F6',
    tagsInput: '',
    isActive: true,
  });

  const allDivisions = Array.from(
    new Set(
      [...DEFAULT_PARENT_DIVISIONS, ...(departments || []).map((d) => d.parentDivision).filter(Boolean)]
    )
  );

  const filteredDepts = (departments || []).filter((d) => {
    if (!d) return false;
    const matchesSearch =
      (d.name && d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.headOfDepartment && d.headOfDepartment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.costCenterCode && d.costCenterCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.tags && d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCompany =
      selectedCompanyFilter === 'all' || !d.companyId || d.companyId === selectedCompanyFilter;

    const matchesDivision =
      selectedDivisionFilter === 'all' || d.parentDivision === selectedDivisionFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && d.isActive) ||
      (statusFilter === 'inactive' && !d.isActive);

    return Boolean(matchesSearch && matchesCompany && matchesDivision && matchesStatus);
  });

  // Department Stats
  const totalBudget = (departments || []).reduce((sum, d) => sum + (d.budget || 0), 0);
  const activeCount = (departments || []).filter((d) => d.isActive).length;
  const avgSla = (departments || []).length
    ? Math.round(
        (departments || []).reduce((sum, d) => sum + (d.targetSlaDays || 3), 0) /
          departments.length
      )
    : 3;

  const handleOpenAddModal = () => {
    const adminUser = users.find((u) => u.role === 'admin' || u.role === 'master');
    const randomCode = `DEP-${Math.floor(100 + Math.random() * 900)}`;
    setEditingDept(null);
    setModalTab('general');
    setFormData({
      name: '',
      code: randomCode,
      companyId: companies[0]?.id || '',
      parentDivision: 'Operations Directorate',
      description: '',
      headOfDepartmentId: adminUser?.id || '',
      headOfDepartment: adminUser?.name || '',
      deputyHeadId: '',
      deputyHead: '',
      assignedStaffIds: [],
      email: '',
      phone: '+971 4 228 7000',
      location: 'Corporate Operations Wing, Floor 4',
      workingHours: 'Mon - Fri 08:30 - 17:30 (UAE GST)',
      serviceCategories: ['PRO Services', 'Document Clearing'],
      targetSlaDays: 3,
      maxDossierCapacity: 35,
      costCenterCode: `CC-${Math.floor(1000 + Math.random() * 9000)}-OPS`,
      budget: 60000,
      spendingApprovalLimit: 5000,
      autoAssignMode: 'least_busy',
      dataAccessScope: 'department_only',
      escalationEmail: '',
      color: '#3B82F6',
      tagsInput: 'Operations, Clearance, UAE Gov',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setModalTab('general');
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      companyId: dept.companyId || companies[0]?.id || '',
      parentDivision: dept.parentDivision || 'Operations Directorate',
      description: dept.description || '',
      headOfDepartmentId: dept.headOfDepartmentId || '',
      headOfDepartment: dept.headOfDepartment || '',
      deputyHeadId: dept.deputyHeadId || '',
      deputyHead: dept.deputyHead || '',
      assignedStaffIds: dept.assignedStaffIds || [],
      email: dept.email || '',
      phone: dept.phone || '',
      location: dept.location || '',
      workingHours: dept.workingHours || 'Mon - Fri 08:30 - 17:30 (UAE GST)',
      serviceCategories: dept.serviceCategories || ['PRO Services'],
      targetSlaDays: dept.targetSlaDays || 3,
      maxDossierCapacity: dept.maxDossierCapacity || 35,
      costCenterCode: dept.costCenterCode || '',
      budget: dept.budget || 0,
      spendingApprovalLimit: dept.spendingApprovalLimit || 0,
      autoAssignMode: dept.autoAssignMode || 'least_busy',
      dataAccessScope: dept.dataAccessScope || 'department_only',
      escalationEmail: dept.escalationEmail || '',
      color: dept.color || '#3B82F6',
      tagsInput: dept.tags ? dept.tags.join(', ') : '',
      isActive: dept.isActive,
    });
    setShowModal(true);
  };

  const toggleServiceCategory = (cat: string) => {
    setFormData((prev) => {
      const exists = prev.serviceCategories.includes(cat);
      if (exists) {
        return { ...prev, serviceCategories: prev.serviceCategories.filter((c) => c !== cat) };
      } else {
        return { ...prev, serviceCategories: [...prev.serviceCategories, cat] };
      }
    });
  };

  const toggleAssignedStaff = (userId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedStaffIds.includes(userId);
      if (exists) {
        return { ...prev, assignedStaffIds: prev.assignedStaffIds.filter((id) => id !== userId) };
      } else {
        return { ...prev, assignedStaffIds: [...prev.assignedStaffIds, userId] };
      }
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setNotice({ type: 'error', text: 'Department Name is required.' });
      return;
    }

    const tags = formData.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Omit<Department, 'id' | 'createdAt'> = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase() || `DEP-${Date.now().toString().slice(-4)}`,
      companyId: formData.companyId || undefined,
      parentDivision: formData.parentDivision,
      description: formData.description.trim(),
      headOfDepartment: formData.headOfDepartment.trim(),
      headOfDepartmentId: formData.headOfDepartmentId || undefined,
      deputyHead: formData.deputyHead.trim() || undefined,
      deputyHeadId: formData.deputyHeadId || undefined,
      assignedStaffIds: formData.assignedStaffIds,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      location: formData.location.trim() || undefined,
      workingHours: formData.workingHours.trim() || undefined,
      serviceCategories: formData.serviceCategories,
      targetSlaDays: Number(formData.targetSlaDays) || 3,
      maxDossierCapacity: Number(formData.maxDossierCapacity) || 30,
      costCenterCode: formData.costCenterCode.trim().toUpperCase() || undefined,
      budget: Number(formData.budget) || 0,
      spendingApprovalLimit: Number(formData.spendingApprovalLimit) || 0,
      autoAssignMode: formData.autoAssignMode,
      dataAccessScope: formData.dataAccessScope,
      escalationEmail: formData.escalationEmail.trim() || undefined,
      color: formData.color,
      badgeText: formData.name.slice(0, 14),
      tags,
      isActive: formData.isActive,
    };

    if (editingDept) {
      updateDepartment(editingDept.id, payload);
      setNotice({ type: 'success', text: `Department "${formData.name}" updated successfully.` });
      setShowModal(false);
      setTimeout(() => setNotice(null), 3000);
    } else {
      addDepartment(payload);
      setNotice({ type: 'success', text: `Department "${formData.name}" created successfully.` });
      setShowModal(false);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleDeleteDepartment = (id: string) => {
    deleteDepartment(id);
    setNotice({ type: 'success', text: 'Department deleted successfully.' });
    setDeleteConfirmId(null);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & KPI Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Organizational Departments & Divisions
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {departments?.length || 0} TOTAL DIVISIONS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Configure operational business units, assign department heads & team rosters, set SLA turnaround targets, manage cost center budgets, and govern auto-assignment routing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            {canManage && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Department</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Active Units</span>
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {activeCount} <span className="text-xs text-slate-500 font-normal">/ {departments.length}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Total Operating Budget</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400">
              AED {totalBudget.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Avg. SLA Target</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-400">
              {avgSla} <span className="text-xs text-slate-500 font-normal">Business Days</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Assigned Personnel</span>
              <Users className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-purple-400">
              {(users || []).filter((u) => u.role === 'employee' || u.role === 'admin').length} Staff
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by division, code, HOD, cost center, tag..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedDivisionFilter}
            onChange={(e) => setSelectedDivisionFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-hidden focus:border-blue-500 transition-all font-medium"
          >
            <option value="all">Parent Directorate (All)</option>
            {allDivisions.map((div, i) => (
              <option key={i} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-hidden focus:border-blue-500 transition-all font-medium"
          >
            <option value="all">Branch (All)</option>
            {companies.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-hidden focus:border-blue-500 transition-all font-medium"
          >
            <option value="all">Status (All)</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          const linkedCompany = (companies || []).find((c) => c && c.id === dept.companyId);
          const deptEmployees = (users || []).filter(
            (u) =>
              u &&
              (u.department === dept.name ||
                (dept.assignedStaffIds && dept.assignedStaffIds.includes(u.id)) ||
                (u.companyId === dept.companyId && u.role === 'employee'))
          );
          const hodUser = (users || []).find(
            (u) => u.id === dept.headOfDepartmentId || u.name === dept.headOfDepartment
          );

          return (
            <div
              key={dept.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Header with Color Accent */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-md shrink-0 text-white"
                      style={{ backgroundColor: dept.color || '#3B82F6' }}
                    >
                      {dept.code.slice(0, 4)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                        {dept.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-700">
                          {dept.code}
                        </span>
                        {dept.parentDivision && (
                          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[130px]">
                            • {dept.parentDivision}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      dept.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {dept.description || 'General operational unit handling client dossiers and ministry processing.'}
                </p>

                {/* Head of Department & Deputy */}
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-400" />
                      Head of Dept:
                    </span>
                    <span className="font-bold text-white truncate max-w-[140px]">
                      {dept.headOfDepartment || 'Unassigned'}
                    </span>
                  </div>

                  {dept.deputyHead && (
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                      <span className="text-slate-400">Deputy Lead:</span>
                      <span className="font-medium text-slate-300 truncate max-w-[140px]">
                        {dept.deputyHead}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                    <span className="text-slate-400">Turnaround SLA:</span>
                    <span className="font-bold text-amber-400">
                      {dept.targetSlaDays || 3} Business Days
                    </span>
                  </div>
                </div>

                {/* Service Categories Chips */}
                {dept.serviceCategories && dept.serviceCategories.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Handled Specializations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dept.serviceCategories.slice(0, 3).map((cat, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 truncate"
                        >
                          {cat}
                        </span>
                      ))}
                      {dept.serviceCategories.length > 3 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-400">
                          +{dept.serviceCategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Cost Center</span>
                    <span className="font-mono text-slate-300 truncate block text-[10px]">
                      {dept.costCenterCode || 'CC-GENERAL'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Operating Budget</span>
                    <span className="font-semibold text-emerald-400">
                      AED {(dept.budget || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Branch Entity</span>
                    <span className="font-semibold text-slate-300 truncate block">
                      {linkedCompany?.name || 'All Entities (Firm-wide)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Team Roster</span>
                    <span className="font-semibold text-purple-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {deptEmployees.length} Personnel
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {dept.tags && dept.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dept.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setInspectingDept(dept)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="View Full Department Overview"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Overview</span>
                </button>

                {canManage && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(dept)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Edit Department Configuration"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(dept.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredDepts.length === 0 && (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">No Departments Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No organizational departments match your current search query or division filter.
            </p>
            {canManage && (
              <button
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Department</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Department Modal with Wide Multi-Section Tabs */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: formData.color || '#3B82F6' }}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Organizational Department'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Comprehensive operational parameters, SLA targets, team assignments & financial scopes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab('general')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'general'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>General & Division</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('leadership')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'leadership'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Leadership & Staff ({formData.assignedStaffIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('contact')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'contact'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact & Desk</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('services')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'services'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Services & SLA ({formData.serviceCategories.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('financials')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'financials'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Budget & Approvals</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('automation')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'automation'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Routing & Security</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Tab 1: General & Division */}
              {modalTab === 'general' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Department Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Visa & Immigration Division"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Department Code / Short Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. DEP-VISA"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Parent Directorate / Division
                      </label>
                      <select
                        value={formData.parentDivision}
                        onChange={(e) => setFormData({ ...formData, parentDivision: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        {allDivisions.map((div, i) => (
                          <option key={i} value={div}>
                            {div}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Assigned Legal Entity / Branch
                      </label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="">All Branches / Global Firm-Wide</option>
                        {companies.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Accent Color Picker & Presets */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Department Branding & Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {COLOR_PRESETS.map((color, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: color.hex })}
                            className={`w-6 h-6 rounded-lg border-2 transition-all cursor-pointer ${
                              formData.color === color.hex ? 'border-white scale-110' : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.label}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Operational Mandate & Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the department's mandate, core legal responsibilities, and government ministry clearances..."
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Specialization Tags (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tagsInput}
                        onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                        placeholder="e.g. ICP, GDRFA, Golden Visa, Ministry"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 rounded-sm bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Department Active Status</span>
                          <span className="text-[10px] text-slate-400">Available for task routing and case assignment</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Leadership & Staff */}
              {modalTab === 'leadership' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Head of Department (HOD)
                      </label>
                      <select
                        value={formData.headOfDepartmentId}
                        onChange={(e) => {
                          const u = users.find((usr) => usr.id === e.target.value);
                          setFormData({
                            ...formData,
                            headOfDepartmentId: e.target.value,
                            headOfDepartment: u ? u.name : '',
                          });
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="">Select Department Head...</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role.toUpperCase()} - {u.department || 'Operations'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Deputy Head / Team Lead
                      </label>
                      <select
                        value={formData.deputyHeadId}
                        onChange={(e) => {
                          const u = users.find((usr) => usr.id === e.target.value);
                          setFormData({
                            ...formData,
                            deputyHeadId: e.target.value,
                            deputyHead: u ? u.name : '',
                          });
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="">None / Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role.toUpperCase()} - {u.jobTitle || 'Specialist'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Assign Team Members Grid */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">
                        Assign Staff Members to this Department
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {formData.assignedStaffIds.length} staff selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {users
                        .filter((u) => u.role === 'employee' || u.role === 'admin' || u.role === 'master')
                        .map((u) => {
                          const isAssigned = formData.assignedStaffIds.includes(u.id);
                          return (
                            <div
                              key={u.id}
                              onClick={() => toggleAssignedStaff(u.id)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isAssigned
                                  ? 'bg-blue-500/10 border-blue-500/40 text-white'
                                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <img
                                  src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                  alt={u.name}
                                  className="w-7 h-7 rounded-full object-cover shrink-0"
                                />
                                <div className="truncate">
                                  <div className="text-xs font-bold text-white truncate">{u.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {u.jobTitle || u.role} • {u.email}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                  isAssigned ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-600'
                                }`}
                              >
                                {isAssigned && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Contact & Desk */}
              {modalTab === 'contact' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Official Department Email
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. visa.desk@adcs.ae"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Hotline / Phone Extension
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +971 4 228 7002 / Ext 401"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Physical Desk / Floor Location
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Level 4, Suite 402, Operations Wing"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Working Hours & Shift Schedule
                      </label>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={formData.workingHours}
                          onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                          placeholder="e.g. Mon - Fri 08:30 - 17:30 (UAE GST)"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Services & SLA */}
              {modalTab === 'services' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-2">
                      Handled Service Categories & Specializations
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DEFAULT_SERVICE_CATEGORIES.map((cat, i) => {
                        const isSelected = formData.serviceCategories.includes(cat);
                        return (
                          <div
                            key={i}
                            onClick={() => toggleServiceCategory(cat)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-500/10 border-blue-500/40 text-white'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-xs font-semibold">{cat}</span>
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Target Turnaround SLA (Business Days)
                      </label>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={formData.targetSlaDays}
                          onChange={(e) => setFormData({ ...formData, targetSlaDays: Number(e.target.value) })}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Max Active Dossiers per Officer
                      </label>
                      <div className="relative">
                        <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="number"
                          min={5}
                          max={200}
                          value={formData.maxDossierCapacity}
                          onChange={(e) => setFormData({ ...formData, maxDossierCapacity: Number(e.target.value) })}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Budget & Approvals */}
              {modalTab === 'financials' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Cost Center Code / General Ledger Ref
                      </label>
                      <input
                        type="text"
                        value={formData.costCenterCode}
                        onChange={(e) => setFormData({ ...formData, costCenterCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. CC-3000-VISA"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Annual / Monthly Operating Budget (AED)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
                          AED
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                          className="w-full pl-12 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      HOD Spending & Fee Discount Approval Limit (AED)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
                        AED
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={formData.spendingApprovalLimit}
                        onChange={(e) => setFormData({ ...formData, spendingApprovalLimit: Number(e.target.value) })}
                        placeholder="e.g. 5000"
                        className="w-full pl-12 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500 font-semibold"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Department head can authorize customer invoice discounts up to this amount without Master Administrator approval.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 6: Routing & Security */}
              {modalTab === 'automation' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Task & Lead Auto-Assignment Mode
                      </label>
                      <select
                        value={formData.autoAssignMode}
                        onChange={(e) => setFormData({ ...formData, autoAssignMode: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="least_busy">Least Busy Officer (Workload Balanced)</option>
                        <option value="round_robin">Round-Robin Rotation</option>
                        <option value="manual">Manual Assignment by Department Head</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Data Visibility & Silo Scope
                      </label>
                      <select
                        value={formData.dataAccessScope}
                        onChange={(e) => setFormData({ ...formData, dataAccessScope: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="department_only">Department Silo (Restricted to division staff)</option>
                        <option value="branch_only">Branch-Wide (Accessible across company branch)</option>
                        <option value="global">Global Firm-Wide (Unrestricted)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      SLA Escalation Notification Email
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={formData.escalationEmail}
                        onChange={(e) => setFormData({ ...formData, escalationEmail: e.target.value })}
                        placeholder="e.g. director.ops@adcs.ae"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Automated high-priority alert dispatched when any stage milestone exceeds target SLA.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="text-[11px] text-slate-400">
                  {modalTab !== 'general' && (
                    <button
                      type="button"
                      onClick={() => setModalTab('general')}
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      ← Back to General Info
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingDept ? 'Update Department' : 'Create Department'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Department Details Modal / Drawer */}
      {inspectingDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-lg shrink-0"
                  style={{ backgroundColor: inspectingDept.color || '#3B82F6' }}
                >
                  {inspectingDept.code.slice(0, 4)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{inspectingDept.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      {inspectingDept.code}
                    </span>
                    {inspectingDept.parentDivision && (
                      <span className="text-xs text-slate-400">• {inspectingDept.parentDivision}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingDept(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                {inspectingDept.description || 'No detailed operational mandate documented.'}
              </p>

              {/* Grid Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Head of Dept</span>
                  <span className="font-bold text-white block mt-0.5">{inspectingDept.headOfDepartment || 'Unassigned'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Deputy Lead</span>
                  <span className="font-medium text-slate-200 block mt-0.5">{inspectingDept.deputyHead || 'None'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Turnaround SLA</span>
                  <span className="font-bold text-amber-400 block mt-0.5">{inspectingDept.targetSlaDays || 3} Days</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Operating Budget</span>
                  <span className="font-bold text-emerald-400 block mt-0.5">AED {(inspectingDept.budget || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Cost Center Code</span>
                  <span className="font-mono text-slate-300 block mt-0.5">{inspectingDept.costCenterCode || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Approval Limit</span>
                  <span className="font-bold text-purple-400 block mt-0.5">AED {(inspectingDept.spendingApprovalLimit || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Desk & Working Hours
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>{inspectingDept.email || 'No email registered'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{inspectingDept.phone || '+971 4 228 7000'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{inspectingDept.location || 'HQ Desk'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{inspectingDept.workingHours || 'Standard Hours'}</span>
                  </div>
                </div>
              </div>

              {/* Handled Service Specializations */}
              {inspectingDept.serviceCategories && inspectingDept.serviceCategories.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Assigned Service Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingDept.serviceCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              {canManage && (
                <button
                  onClick={() => {
                    const dept = inspectingDept;
                    setInspectingDept(null);
                    handleOpenEditModal(dept);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Edit Configuration
                </button>
              )}
              <button
                onClick={() => setInspectingDept(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Department</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete this department? This action will remove the division from organizational records and unbind associated tasks.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDepartment(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
