import React, { useState, useMemo, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Layers,
  LayoutGrid,
  List,
  AlertCircle,
  FileCheck,
  Globe,
  ExternalLink,
  Briefcase,
  Sliders,
  Settings,
  X,
  Check,
  Tag,
  Radio,
  MapPin,
  Compass,
  CheckSquare,
  FileText,
  Eye,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadCategory, LeadSource, LeadStage } from '../../types/crm';
import { LeadDetailModal } from './LeadDetailModal';

export const LeadsManagement: React.FC = () => {
  const {
    leads,
    filteredLeads,
    addLead,
    updateLead,
    deleteLead,
    convertLeadToClient,
    bulkAssignLeads,
    companies,
    users,
    tasks,
    serviceCategories,
    currentUser,
    selectedCompanyId,
    selectedEmployeeId,
    setActiveTab,
    setSelectedClientId,
    leadCategories,
    leadSources,
    leadStages,
    addLeadCategory,
    updateLeadCategory,
    deleteLeadCategory,
    addLeadSource,
    updateLeadSource,
    deleteLeadSource,
    addLeadStage,
    updateLeadStage,
    deleteLeadStage,
  } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [currentLocationFilter, setCurrentLocationFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>(selectedCompanyId || 'all');
  const [employeeFilter, setEmployeeFilter] = useState<string>(selectedEmployeeId || 'all');

  useEffect(() => {
    if (selectedCompanyId) setBranchFilter(selectedCompanyId);
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedEmployeeId) setEmployeeFilter(selectedEmployeeId);
  }, [selectedEmployeeId]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTab, setConfigTab] = useState<'categories' | 'sources' | 'stages'>('categories');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  // Quick Category/Source inline management in Config Modal
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2563EB');
  const [newCatIsJob, setNewCatIsJob] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceDesc, setNewSourceDesc] = useState('');
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);

  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#3B82F6');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  const isAdminOrMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  // Bulk Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAssignEmployeeId, setBulkAssignEmployeeId] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male' as Lead['gender'],
    companyName: '',
    email: '',
    phone: '',
    whatsapp: '',
    nationality: 'United Arab Emirates',
    country: 'United Arab Emirates',
    city: 'Dubai',
    currentLocation: 'Inside UAE (Dubai)',
    category: leadCategories[0]?.name || '10-Year Golden Visa',
    leadCategoryId: leadCategories[0]?.id || 'cat-golden-visa',
    isJobLead: false,
    jobType: '',
    jobTitleInterest: '',
    jobExperienceYears: '',
    serviceInterested: '10-Year Golden Visa (Investor / Executive / Specialist)',
    serviceCategoryId: 'srv-golden-visa',
    estimatedValue: 8500,
    source: leadSources[0]?.name || 'Website Portal',
    priority: 'high' as Lead['priority'],
    status: 'new' as Lead['status'],
    companyId: '',
    assignedEmployeeId: '',
    assignedEmployeeIds: [] as string[],
    notes: '',
    followUpDate: new Date().toISOString().split('T')[0],
  });

  // Convert Modal Form State
  const [convertForm, setConvertForm] = useState({
    serviceCategoryId: 'srv-golden-visa',
    assignedEmployeeId: '',
    advanceAmount: 3000,
  });

  const activeEmployees = useMemo(() => {
    return (users || []).filter((u) => u && (u.role === 'employee' || u.role === 'admin' || u.role === 'master'));
  }, [users]);

  // Derived filter options from leads
  const availableJobTypes = useMemo(() => {
    const set = new Set<string>();
    (leads || []).forEach((l) => {
      if (l?.jobType) set.add(l.jobType);
      if (l?.jobTitleInterest) set.add(l.jobTitleInterest);
    });
    return Array.from(set);
  }, [leads]);

  const availableCountries = useMemo(() => {
    const set = new Set<string>(['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'India', 'Pakistan', 'United Kingdom', 'United States', 'Egypt', 'Philippines']);
    (leads || []).forEach((l) => {
      if (l?.country) set.add(l.country);
      if (l?.nationality) set.add(l.nationality);
    });
    return Array.from(set);
  }, [leads]);

  const availableCities = useMemo(() => {
    const set = new Set<string>(['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Riyadh', 'Jeddah', 'London', 'Karachi', 'Mumbai', 'Cairo']);
    (leads || []).forEach((l) => {
      if (l?.city) set.add(l.city);
    });
    return Array.from(set);
  }, [leads]);

  const availableCurrentLocations = useMemo(() => {
    const set = new Set<string>([
      'Inside UAE (Dubai)',
      'Inside UAE (Abu Dhabi)',
      'Inside UAE (Sharjah & Northern Emirates)',
      'Outside UAE (GCC Countries)',
      'Outside UAE (South Asia)',
      'Outside UAE (Europe / UK / Americas)',
      'Outside UAE (Other)',
    ]);
    (leads || []).forEach((l) => {
      if (l?.currentLocation) set.add(l.currentLocation);
    });
    return Array.from(set);
  }, [leads]);

  // Company map for search matching
  const companyMap = useMemo(() => {
    const map = new Map<string, string>();
    (companies || []).forEach((c) => {
      if (c?.id) map.set(c.id, c.name || '');
    });
    return map;
  }, [companies]);

  // User map for search matching
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    (users || []).forEach((u) => {
      if (u?.id) map.set(u.id, u.name || '');
    });
    return map;
  }, [users]);

  const displayLeads = useMemo(() => {
    return (filteredLeads || []).filter((lead) => {
      if (!lead) return false;
      const q = searchTerm.toLowerCase().trim();
      const compName = (lead.companyId ? companyMap.get(lead.companyId) || '' : '').toLowerCase();
      const empName = (lead.assignedEmployeeId ? userMap.get(lead.assignedEmployeeId) || '' : '').toLowerCase();

      const matchSearch =
        !q ||
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.refNo && lead.refNo.toLowerCase().includes(q)) ||
        (lead.companyName && lead.companyName.toLowerCase().includes(q)) ||
        compName.includes(q) ||
        empName.includes(q) ||
        (lead.phone && lead.phone.includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.serviceInterested && lead.serviceInterested.toLowerCase().includes(q)) ||
        (lead.category && lead.category.toLowerCase().includes(q)) ||
        (lead.jobType && lead.jobType.toLowerCase().includes(q)) ||
        (lead.jobTitleInterest && lead.jobTitleInterest.toLowerCase().includes(q)) ||
        (lead.country && lead.country.toLowerCase().includes(q)) ||
        (lead.nationality && lead.nationality.toLowerCase().includes(q)) ||
        (lead.city && lead.city.toLowerCase().includes(q)) ||
        (lead.currentLocation && lead.currentLocation.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      const matchSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchCategory =
        categoryFilter === 'all' ||
        lead.leadCategoryId === categoryFilter ||
        lead.category === categoryFilter;

      const matchJobType =
        jobTypeFilter === 'all' ||
        lead.jobType === jobTypeFilter ||
        lead.jobTitleInterest === jobTypeFilter;

      const matchCountry =
        countryFilter === 'all' ||
        lead.country === countryFilter ||
        lead.nationality === countryFilter;

      const matchCity =
        cityFilter === 'all' ||
        lead.city === cityFilter;

      const matchCurrentLocation =
        currentLocationFilter === 'all' ||
        lead.currentLocation === currentLocationFilter;

      const matchBranch =
        branchFilter === 'all' ||
        lead.companyId === branchFilter;

      const matchEmployee =
        employeeFilter === 'all' ||
        lead.assignedEmployeeId === employeeFilter;

      return Boolean(
        matchSearch &&
        matchStatus &&
        matchPriority &&
        matchSource &&
        matchCategory &&
        matchJobType &&
        matchCountry &&
        matchCity &&
        matchCurrentLocation &&
        matchBranch &&
        matchEmployee
      );
    });
  }, [
    filteredLeads,
    searchTerm,
    statusFilter,
    priorityFilter,
    sourceFilter,
    categoryFilter,
    jobTypeFilter,
    countryFilter,
    cityFilter,
    currentLocationFilter,
    branchFilter,
    employeeFilter,
    companyMap,
    userMap,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const list = filteredLeads || [];
    const total = list.length;
    const newLeads = list.filter((l) => l && l.status === 'new').length;
    const inProgress = list.filter((l) => l && ['contacted', 'proposal_sent', 'negotiation'].includes(l.status)).length;
    const converted = list.filter((l) => l && l.status === 'converted').length;
    const pipelineValue = list
      .filter((l) => l && l.status !== 'lost' && l.status !== 'converted')
      .reduce((acc, l) => acc + (l?.estimatedValue || 0), 0);
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    return { total, newLeads, inProgress, converted, pipelineValue, conversionRate };
  }, [filteredLeads]);

  // Dynamic Kanban Columns based on leadStages
  const kanbanColumns = useMemo(() => {
    if (leadStages && leadStages.length > 0) {
      return leadStages.map((stg) => ({
        id: stg.statusKey as Lead['status'],
        label: stg.name,
        color: `border-[${stg.color || '#3B82F6'}] text-slate-800 dark:text-slate-200`,
        bg: stg.badgeBg || 'bg-slate-50/50 dark:bg-slate-900/40',
        badgeBg: stg.badgeBg,
      }));
    }
    return [
      { id: 'new', label: 'New Inquiry', color: 'border-blue-500 text-blue-700 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
      { id: 'contacted', label: 'Contacted', color: 'border-amber-500 text-amber-700 dark:text-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-950/20' },
      { id: 'proposal_sent', label: 'Proposal Sent', color: 'border-purple-500 text-purple-700 dark:text-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-950/20' },
      { id: 'negotiation', label: 'In Negotiation', color: 'border-indigo-500 text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50/50 dark:bg-indigo-950/20' },
      { id: 'converted', label: 'Converted Client', color: 'border-emerald-500 text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
      { id: 'lost', label: 'Lost / Disqualified', color: 'border-rose-500 text-rose-700 dark:text-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-950/20' },
    ];
  }, [leadStages]);

  const handleOpenAdd = () => {
    const defaultCat = leadCategories[0];
    const defaultSource = leadSources[0]?.name || 'Website Portal';

    setFormData({
      name: '',
      gender: 'Male',
      companyName: '',
      email: '',
      phone: '+971 5',
      whatsapp: '+971 5',
      nationality: 'United Arab Emirates',
      country: 'United Arab Emirates',
      city: 'Dubai',
      currentLocation: 'Inside UAE (Dubai)',
      category: defaultCat?.name || '10-Year Golden Visa',
      leadCategoryId: defaultCat?.id || 'cat-golden-visa',
      isJobLead: Boolean(defaultCat?.isJobCategory),
      jobType: '',
      jobTitleInterest: '',
      jobExperienceYears: '',
      serviceInterested: serviceCategories[0]?.name || '10-Year Golden Visa',
      serviceCategoryId: serviceCategories[0]?.id || 'srv-golden-visa',
      estimatedValue: serviceCategories[0]?.defaultPrice || 8500,
      source: defaultSource,
      priority: 'high',
      status: 'new',
      companyId: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || 'comp-1',
      assignedEmployeeId: currentUser.id,
      assignedEmployeeIds: [currentUser.id],
      notes: '',
      followUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setSelectedLead(lead);
    const cat = leadCategories.find((c) => c.id === lead.leadCategoryId || c.name === lead.category);
    const isJob = Boolean(lead.isJobLead || cat?.isJobCategory || (lead.category && lead.category.toLowerCase().includes('job')));

    const initialEmpIds = lead.assignedEmployeeIds && lead.assignedEmployeeIds.length > 0
      ? lead.assignedEmployeeIds
      : lead.assignedEmployeeId
      ? [lead.assignedEmployeeId]
      : [];

    setFormData({
      name: lead.name,
      gender: lead.gender || 'Male',
      companyName: lead.companyName || '',
      email: lead.email || '',
      phone: lead.phone,
      whatsapp: lead.whatsapp || lead.phone,
      nationality: lead.nationality || lead.country || 'United Arab Emirates',
      country: lead.country || lead.nationality || 'United Arab Emirates',
      city: lead.city || 'Dubai',
      currentLocation: lead.currentLocation || 'Inside UAE (Dubai)',
      category: lead.category || cat?.name || leadCategories[0]?.name || '10-Year Golden Visa',
      leadCategoryId: lead.leadCategoryId || cat?.id || leadCategories[0]?.id || 'cat-golden-visa',
      isJobLead: isJob,
      jobType: lead.jobType || lead.jobTitleInterest || '',
      jobTitleInterest: lead.jobTitleInterest || lead.jobType || '',
      jobExperienceYears: lead.jobExperienceYears || '',
      serviceInterested: lead.serviceInterested || '',
      serviceCategoryId: lead.serviceCategoryId || '',
      estimatedValue: lead.estimatedValue || 0,
      source: lead.source,
      priority: lead.priority,
      status: lead.status,
      companyId: lead.companyId,
      assignedEmployeeId: lead.assignedEmployeeId || (initialEmpIds[0] || ''),
      assignedEmployeeIds: initialEmpIds,
      notes: lead.notes || '',
      followUpDate: lead.followUpDate || '',
    });
    setShowEditModal(true);
  };

  const handleCategorySelectChange = (catId: string) => {
    const selectedCat = leadCategories.find((c) => c.id === catId);
    if (!selectedCat) return;

    const isJob = Boolean(
      selectedCat.isJobCategory ||
      selectedCat.code === 'JOB_APPLICATION' ||
      selectedCat.name.toLowerCase().includes('job') ||
      selectedCat.name.toLowerCase().includes('recruit')
    );

    setFormData((prev) => ({
      ...prev,
      leadCategoryId: selectedCat.id,
      category: selectedCat.name,
      isJobLead: isJob,
    }));
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryId = formData.assignedEmployeeIds[0] || formData.assignedEmployeeId;
    const assignedUser = users.find((u) => u.id === primaryId);
    const targetComp = companies.find((c) => c.id === formData.companyId);

    addLead({
      name: formData.name,
      gender: formData.gender,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      nationality: formData.nationality || formData.country,
      country: formData.country || formData.nationality,
      city: formData.city,
      currentLocation: formData.currentLocation,
      category: formData.category,
      leadCategoryId: formData.leadCategoryId,
      isJobLead: formData.isJobLead,
      jobType: formData.jobType || formData.jobTitleInterest,
      jobTitleInterest: formData.jobTitleInterest || formData.jobType,
      jobExperienceYears: formData.jobExperienceYears,
      serviceInterested: formData.serviceInterested,
      serviceCategoryId: formData.serviceCategoryId,
      estimatedValue: Number(formData.estimatedValue) || 0,
      source: formData.source,
      status: formData.status,
      priority: formData.priority,
      companyId: formData.companyId || companies[0]?.id,
      branchName: targetComp?.name,
      assignedEmployeeId: primaryId,
      assignedEmployeeIds: formData.assignedEmployeeIds,
      assignedEmployeeName: assignedUser?.name,
      assignedEmployeeAvatar: assignedUser?.avatar,
      notes: formData.notes,
      followUpDate: formData.followUpDate,
    });
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const primaryId = formData.assignedEmployeeIds[0] || formData.assignedEmployeeId;
    const assignedUser = users.find((u) => u.id === primaryId);
    const targetComp = companies.find((c) => c.id === formData.companyId);

    updateLead(selectedLead.id, {
      name: formData.name,
      gender: formData.gender,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      nationality: formData.nationality || formData.country,
      country: formData.country || formData.nationality,
      city: formData.city,
      currentLocation: formData.currentLocation,
      category: formData.category,
      leadCategoryId: formData.leadCategoryId,
      isJobLead: formData.isJobLead,
      jobType: formData.jobType || formData.jobTitleInterest,
      jobTitleInterest: formData.jobTitleInterest || formData.jobType,
      jobExperienceYears: formData.jobExperienceYears,
      serviceInterested: formData.serviceInterested,
      serviceCategoryId: formData.serviceCategoryId,
      estimatedValue: Number(formData.estimatedValue) || 0,
      source: formData.source,
      status: formData.status,
      priority: formData.priority,
      companyId: formData.companyId,
      branchName: targetComp?.name,
      assignedEmployeeId: primaryId,
      assignedEmployeeIds: formData.assignedEmployeeIds,
      assignedEmployeeName: assignedUser?.name,
      assignedEmployeeAvatar: assignedUser?.avatar,
      notes: formData.notes,
      followUpDate: formData.followUpDate,
    });
    setShowEditModal(false);
    setSelectedLead(null);
  };

  const handleOpenConvert = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertForm({
      serviceCategoryId: lead.serviceCategoryId || serviceCategories[0]?.id || 'srv-golden-visa',
      assignedEmployeeId: lead.assignedEmployeeId || currentUser.id,
      advanceAmount: Math.min(lead.estimatedValue || 3000, 3000),
    });
    setShowConvertModal(true);
  };

  const handleExecuteConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const res = convertLeadToClient(selectedLead.id, {
      serviceCategoryId: convertForm.serviceCategoryId,
      assignedEmployeeId: convertForm.assignedEmployeeId,
      advanceAmount: Number(convertForm.advanceAmount) || 0,
    });

    setShowConvertModal(false);
    setSelectedLead(null);

    // Optional navigate to new client profile
    if (res.client) {
      setSelectedClientId(res.client.id);
      setActiveTab('clients');
    }
  };

  const getPriorityBadge = (priority: Lead['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      case 'high':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800';
      case 'low':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getCategoryBadge = (lead: Lead) => {
    const cat = leadCategories.find((c) => c.id === lead.leadCategoryId || c.name === lead.category);
    if (cat) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeBg || 'bg-blue-50 text-blue-700 border-blue-200'}`}
        >
          <Tag className="w-2.5 h-2.5 opacity-70" />
          <span>{cat.badgeText || cat.name}</span>
        </span>
      );
    }
    if (lead.category) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Tag className="w-2.5 h-2.5 opacity-70" />
          <span>{lead.category}</span>
        </span>
      );
    }
    return null;
  };

  const getSourceBadge = (sourceName: string) => {
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200/60 dark:border-slate-700/60';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leads & Inquiry Pipeline</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {filteredLeads.length} Prospects
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture, nurture, qualify, and convert corporate inquiries, visa applications, and job candidates
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Admin / Master Configuration button */}
          {isAdminOrMaster && (
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all"
              title="Admin: Manage Categories, Sources & Stages"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Categories & Stages</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Table Grid View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Pipeline Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">All inquiries</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Inquiries</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.newLeads}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Requires response</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.inProgress}</div>
          <div className="text-[10px] text-purple-500 mt-0.5">Proposals & negotiations</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Converted</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.converted}</div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">Active clients won</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Value</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">AED {stats.pipelineValue.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Potential revenue</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{stats.conversionRate}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Lead to client ratio</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads by name, job type, location (country/city), ref #, service, phone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {(searchTerm ||
              categoryFilter !== 'all' ||
              statusFilter !== 'all' ||
              priorityFilter !== 'all' ||
              sourceFilter !== 'all' ||
              jobTypeFilter !== 'all' ||
              countryFilter !== 'all' ||
              cityFilter !== 'all' ||
              currentLocationFilter !== 'all' ||
              branchFilter !== 'all' ||
              employeeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setSourceFilter('all');
                  setJobTypeFilter('all');
                  setCountryFilter('all');
                  setCityFilter('all');
                  setCurrentLocationFilter('all');
                  setBranchFilter('all');
                  setEmployeeFilter('all');
                }}
                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] font-bold hover:bg-rose-100 transition-colors flex items-center gap-1"
              >
                <span>Reset Filters</span>
              </button>
            )}
            <span className="text-[11px] font-semibold text-slate-500">
              Showing {displayLeads.length} of {filteredLeads.length} leads
            </span>
          </div>
        </div>

        {/* Granular Filter Row (Employee, Branch, Category, Job Type, Country, City, Location, Status, Priority, Source) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {/* Branch / Company */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">Branch (All)</option>
            {companies.map((co) => (
              <option key={co.id} value={co.id}>
                {co.name}
              </option>
            ))}
          </select>

          {/* Employee Filter (Visible to Master and Admin only) */}
          {(currentUser.role === 'master' || currentUser.role === 'admin') && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className={`w-full px-2 py-1.5 rounded-xl text-[11px] border font-medium ${
                employeeFilter !== 'all'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-400/40'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <option value="all">Employee (All)</option>
              {activeEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          )}

          {/* 1. Job Type Filter */}
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">Job Types (All)</option>
            {availableJobTypes.map((jt) => (
              <option key={jt} value={jt}>
                {jt}
              </option>
            ))}
          </select>

          {/* 2. Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">Country (All)</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* 3. City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">City (All)</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* 4. Current Location Filter */}
          <select
            value={currentLocationFilter}
            onChange={(e) => setCurrentLocationFilter(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">Current Location (All)</option>
            {availableCurrentLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* 5. Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">All Categories</option>
            {leadCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* 6. Pipeline Stage Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Stages</option>
            {leadStages.map((stg) => (
              <option key={stg.id} value={stg.statusKey}>
                {stg.name}
              </option>
            ))}
          </select>

          {/* 8. Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Sources</option>
            {leadSources.map((src) => (
              <option key={src.id} value={src.name}>
                {src.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Assignment Bar for Managers / Masters / Admins */}
      {selectedLeadIds.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-xs">
              {selectedLeadIds.length} Selected
            </span>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
              Bulk assign selected leads to employee / staff:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bulkAssignEmployeeId}
              onChange={(e) => setBulkAssignEmployeeId(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="">Select Employee / Officer...</option>
              {activeEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.title || emp.role})
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!bulkAssignEmployeeId}
              onClick={() => {
                if (bulkAssignEmployeeId && selectedLeadIds.length > 0) {
                  bulkAssignLeads(selectedLeadIds, [bulkAssignEmployeeId]);
                  setSelectedLeadIds([]);
                  setBulkAssignEmployeeId('');
                }
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Apply Assignment
            </button>

            <button
              type="button"
              onClick={() => setSelectedLeadIds([])}
              className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colLeads = (displayLeads || []).filter((l) => l && l.status === col.id);
            const colValue = colLeads.reduce((acc, l) => acc + (l?.estimatedValue || 0), 0);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-h-[500px]"
              >
                {/* Column Header */}
                <div className={`p-3 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl ${col.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold border-l-2 pl-2 ${col.color}`}>{col.label}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
                      {colLeads.length}
                    </span>
                  </div>
                  {colValue > 0 && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      AED {colValue.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[650px]">
                  {colLeads.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
                      No leads
                    </div>
                  ) : (
                    colLeads.map((lead) => {
                      const leadTaskCount = (lead.tasks || []).length;
                      const leadNoteCount = (lead.notesLog || []).length;

                      return (
                        <div
                          key={lead.id}
                          className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-400">{lead.refNo}</span>
                            <div className="flex items-center gap-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getPriorityBadge(lead.priority)}`}>
                                {lead.priority}
                              </span>
                            </div>
                          </div>

                          {/* Category Badge */}
                          <div className="mt-1.5">{getCategoryBadge(lead)}</div>

                          <button
                            type="button"
                            onClick={() => setDetailLead(lead)}
                            className="text-left w-full mt-1 group-hover:text-blue-600 transition-colors"
                          >
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                              {lead.name}
                            </h4>
                          </button>

                          {lead.companyName && (
                            <div className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{lead.companyName}</span>
                            </div>
                          )}

                          {/* Location details (City, Country & Current Location) */}
                          {(lead.city || lead.country || lead.currentLocation) && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                              {(lead.city || lead.country) && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium">
                                  <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                                  <span className="truncate max-w-[130px]">
                                    {[lead.city, lead.country].filter(Boolean).join(', ')}
                                  </span>
                                </span>
                              )}
                              {lead.currentLocation && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                                  <Globe className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                                  <span className="truncate max-w-[110px]">{lead.currentLocation}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Job Application Interest / Job Type */}
                          {(lead.jobType || lead.jobTitleInterest || lead.isJobLead) && (
                            <div className="mt-1.5 p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-1">
                              <Briefcase className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                              <div className="truncate">
                                <span className="font-bold block">
                                  {lead.jobType || lead.jobTitleInterest || 'Job Candidate'}
                                </span>
                                {lead.jobExperienceYears && (
                                  <span className="text-[9px] opacity-80">{lead.jobExperienceYears}</span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-md line-clamp-2">
                            {lead.serviceInterested || 'General PRO Clearance'}
                          </div>

                          {/* Tasks & Notes Counts Pill */}
                          <div className="mt-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailLead(lead)}
                              className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <CheckSquare className="w-2.5 h-2.5" />
                              <span>{leadTaskCount} Tasks</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailLead(lead)}
                              className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-2.5 h-2.5" />
                              <span>{leadNoteCount} Notes</span>
                            </button>
                          </div>

                          {/* Estimated Value & Source */}
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px]">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              AED {(lead.estimatedValue || 0).toLocaleString()}
                            </span>
                            <span className={getSourceBadge(lead.source)}>{lead.source}</span>
                          </div>

                          {/* Assigned Employee & Follow up */}
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <div className="flex items-center gap-1.5">
                              {lead.assignedEmployeeAvatar ? (
                                <img
                                  src={lead.assignedEmployeeAvatar}
                                  alt=""
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[8px] font-bold">
                                  {lead.assignedEmployeeName ? lead.assignedEmployeeName[0] : 'U'}
                                </div>
                              )}
                              <span className="truncate max-w-[70px]">{lead.assignedEmployeeName || 'Unassigned'}</span>
                            </div>

                            {lead.followUpDate && (
                              <span className="text-[9px] flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                                <Calendar className="w-2.5 h-2.5" />
                                {lead.followUpDate}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setDetailLead(lead)}
                                className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                title="Open Tasks & Notes Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Call Lead"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={`https://wa.me/${(lead.whatsapp || lead.phone).replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </a>
                              <button
                                onClick={() => handleOpenEdit(lead)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Edit Lead"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              {(currentUser.role === 'master' || currentUser.role === 'admin') && (
                                <button
                                  onClick={() => deleteLead(lead.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {lead.status !== 'converted' ? (
                              <button
                                onClick={() => handleOpenConvert(lead)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                title="Convert lead to active client"
                              >
                                <span>Convert</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Client Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={displayLeads.length > 0 && selectedLeadIds.length === displayLeads.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeadIds(displayLeads.map((l) => l.id));
                        } else {
                          setSelectedLeadIds([]);
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Ref & Prospect</th>
                  <th className="p-3.5">Location & Current</th>
                  <th className="p-3.5">Category & Job Type</th>
                  <th className="p-3.5">Tasks & Notes</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Pipeline Stage</th>
                  <th className="p-3.5">Est. Value</th>
                  <th className="p-3.5">Assigned Officer</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No prospective leads match the current filters.
                    </td>
                  </tr>
                ) : (
                  displayLeads.map((lead) => {
                    const taskCount = (lead.tasks || []).length;
                    const noteCount = (lead.notesLog || []).length;
                    const isSelected = selectedLeadIds.includes(lead.id);

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeadIds((prev) => [...prev, lead.id]);
                              } else {
                                setSelectedLeadIds((prev) => prev.filter((id) => id !== lead.id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                            <span>{lead.refNo}</span>
                            <span className="font-sans px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[9px]">
                              {lead.gender === 'Female' ? '👩 Female' : lead.gender === 'Other' ? '👤 Other' : '👨 Male'}
                            </span>
                          </div>
                          <button
                            onClick={() => setDetailLead(lead)}
                            className="font-bold text-slate-900 dark:text-white mt-0.5 hover:text-blue-600 text-left"
                          >
                            {lead.name}
                          </button>
                          {lead.companyName && <div className="text-[10px] text-slate-500">{lead.companyName}</div>}
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            {(lead.city || lead.country) && (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                <span>{[lead.city, lead.country].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                            {lead.currentLocation && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                                <Globe className="w-3 h-3 shrink-0" />
                                <span>{lead.currentLocation}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {getCategoryBadge(lead)}
                          {(lead.jobType || lead.jobTitleInterest) && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
                              <Briefcase className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[130px]">{lead.jobType || lead.jobTitleInterest}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setDetailLead(lead)}
                            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                          >
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-[10px] font-bold">
                              {taskCount} Tasks
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 text-[10px] font-bold">
                              {noteCount} Notes
                            </span>
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{lead.phone}</div>
                          {lead.email && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{lead.email}</div>}
                        </td>
                        <td className="p-3.5">
                          <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {lead.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          AED {(lead.estimatedValue || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            {lead.assignedEmployeeAvatar && (
                              <img src={lead.assignedEmployeeAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                            )}
                            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              {lead.assignedEmployeeName || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDetailLead(lead)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                              title="View Tasks & Notes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {lead.status !== 'converted' ? (
                              <button
                                onClick={() => handleOpenConvert(lead)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                              >
                                <span>Convert</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Client
                              </span>
                            )}
                            <button
                              onClick={() => handleOpenEdit(lead)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                              title="Edit Lead"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {(currentUser.role === 'master' || currentUser.role === 'admin') && (
                              <button
                                onClick={() => deleteLead(lead.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Register New Lead / Inquiry</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 pt-4">
              {/* Category Selector (Prominent) */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-blue-950 dark:text-blue-300">
                    Lead Category / Inquiry Classification *
                  </label>
                  {isAdminOrMaster && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowConfigModal(true);
                      }}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Sliders className="w-3 h-3" /> Manage Categories
                    </button>
                  )}
                </div>
                <select
                  required
                  value={formData.leadCategoryId}
                  onChange={(e) => handleCategorySelectChange(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-blue-300 dark:border-blue-700 font-bold text-slate-900 dark:text-white shadow-2xs"
                >
                  {leadCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.isJobCategory ? '— (Recruitment / Job Applicant)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                  Categorizing ensures proper document checklists, service matching, and workflow routing.
                </p>
              </div>

              {/* Location Details: Country, City, Current Location */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Location & Nationality Profile</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Country (Origin / Target)
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. India / UAE / UK"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Dubai / Abu Dhabi"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Current Location
                    </label>
                    <input
                      type="text"
                      value={formData.currentLocation}
                      onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                      placeholder="e.g. Dubai (On Visit Visa)"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Job Application Specific Section (Shown when category is job-related, non-mandatory fields) */}
              {formData.isJobLead && (
                <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Job Application Details (Optional / Not Mandatory)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Job Type / Category
                      </label>
                      <input
                        type="text"
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        placeholder="e.g. Full-Time / Remote / Contract"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-amber-200 dark:border-amber-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Applied Job Title / Position
                      </label>
                      <input
                        type="text"
                        value={formData.jobTitleInterest}
                        onChange={(e) => setFormData({ ...formData, jobTitleInterest: e.target.value })}
                        placeholder="e.g. Senior PRO / Legal Assistant"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-amber-200 dark:border-amber-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-amber-800 dark:text-amber-300 mb-1">
                        UAE Experience / Background
                      </label>
                      <input
                        type="text"
                        value={formData.jobExperienceYears}
                        onChange={(e) => setFormData({ ...formData, jobExperienceYears: e.target.value })}
                        placeholder="e.g. 5 Years in UAE / Valid License"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-amber-200 dark:border-amber-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prospect / Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Johnathan Hayes"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                  <select
                    value={formData.gender || 'Male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="Male">👨 Male</option>
                    <option value="Female">👩 Female</option>
                    <option value="Other">👤 Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Hayes Global FZE (or N/A for individual)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: formData.whatsapp || e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Service Interested In</label>
                <select
                  value={formData.serviceCategoryId}
                  onChange={(e) => {
                    const cat = serviceCategories.find((s) => s.id === e.target.value);
                    setFormData({
                      ...formData,
                      serviceCategoryId: e.target.value,
                      serviceInterested: cat?.name || formData.serviceInterested,
                      estimatedValue: cat?.defaultPrice || formData.estimatedValue,
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {serviceCategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (AED {s.defaultPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Value (AED)</label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Lead Channel / Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    {leadSources.map((src) => (
                      <option key={src.id} value={src.name}>
                        {src.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Company / Branch</label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Staff Assignment for New Lead */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assign Staff & Agents
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {formData.assignedEmployeeIds.length} Selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {activeEmployees.map((u) => {
                    const isSelected = formData.assignedEmployeeIds.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              assignedEmployeeIds: formData.assignedEmployeeIds.filter((id) => id !== u.id),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedEmployeeIds: [...formData.assignedEmployeeIds, u.id],
                            });
                          }
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <span className="truncate flex-1">{u.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Inquiry Notes & Details</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key background info, visa status, specific candidate qualifications or client requirements..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <span>Edit Lead #{selectedLead.refNo}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-4">
              {/* Category Selector */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Lead Category / Classification
                </label>
                <select
                  value={formData.leadCategoryId}
                  onChange={(e) => handleCategorySelectChange(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-300 dark:border-slate-600 font-bold"
                >
                  {leadCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.isJobCategory ? '(Job Application)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Details: Country, City, Current Location */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Location & Nationality Profile</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. India / UAE"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Dubai"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Current Location
                    </label>
                    <input
                      type="text"
                      value={formData.currentLocation}
                      onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                      placeholder="e.g. Dubai, UAE"
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Job Application Specific Section */}
              {formData.isJobLead && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Job Application Details (Not Mandatory)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Job Type
                      </label>
                      <input
                        type="text"
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        placeholder="e.g. Full-Time"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-amber-200 dark:border-amber-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Applied Role / Title
                      </label>
                      <input
                        type="text"
                        value={formData.jobTitleInterest}
                        onChange={(e) => setFormData({ ...formData, jobTitleInterest: e.target.value })}
                        placeholder="e.g. Senior PRO"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-amber-200 dark:border-amber-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Experience
                      </label>
                      <input
                        type="text"
                        value={formData.jobExperienceYears}
                        onChange={(e) => setFormData({ ...formData, jobExperienceYears: e.target.value })}
                        placeholder="e.g. 5 Years in UAE"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-amber-200 dark:border-amber-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prospect Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                  <select
                    value={formData.gender || 'Male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="Male">👨 Male</option>
                    <option value="Female">👩 Female</option>
                    <option value="Other">👤 Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Pipeline Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {leadStages.map((stg) => (
                      <option key={stg.id} value={stg.statusKey}>
                        {stg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Lead Channel / Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    {leadSources.map((src) => (
                      <option key={src.id} value={src.name}>
                        {src.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Value (AED)</label>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              {/* Multi-Staff Assignment for Edit Lead */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assigned Staff & Agents
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {formData.assignedEmployeeIds.length} Selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {activeEmployees.map((u) => {
                    const isSelected = formData.assignedEmployeeIds.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              assignedEmployeeIds: formData.assignedEmployeeIds.filter((id) => id !== u.id),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedEmployeeIds: [...formData.assignedEmployeeIds, u.id],
                            });
                          }
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <span className="truncate flex-1">{u.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead to Client Modal */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Convert Lead to Active Client</span>
              </h3>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <div className="my-4 p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
              <p className="font-bold text-emerald-900 dark:text-emerald-300">
                Converting {selectedLead.name} (#{selectedLead.refNo})
              </p>
              <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                This will automatically create a dedicated Client Dossier, initialize document checklist, set up stages, and credit any initial advance payment.
              </p>
            </div>

            <form onSubmit={handleExecuteConvert} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Service Package
                </label>
                <select
                  value={convertForm.serviceCategoryId}
                  onChange={(e) => setConvertForm({ ...convertForm, serviceCategoryId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                >
                  {serviceCategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (AED {s.defaultPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Case Officer
                </label>
                <select
                  value={convertForm.assignedEmployeeId}
                  onChange={(e) => setConvertForm({ ...convertForm, assignedEmployeeId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                >
                  {activeEmployees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title || u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Initial Advance Retainer Collected (AED)
                </label>
                <input
                  type="number"
                  value={convertForm.advanceAmount}
                  onChange={(e) => setConvertForm({ ...convertForm, advanceAmount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Confirm Conversion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin / Master Quick Categories & Stages Modal */}
      {showConfigModal && isAdminOrMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Lead Categories, Channels & Pipeline Stages
                  </h3>
                  <p className="text-xs text-slate-500">
                    Master & Admin Control: Create, edit, and delete lead classifications dynamically
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setConfigTab('categories')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  configTab === 'categories'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Categories ({leadCategories.length})
              </button>
              <button
                onClick={() => setConfigTab('sources')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  configTab === 'sources'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Channels / Sources ({leadSources.length})
              </button>
              <button
                onClick={() => setConfigTab('stages')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  configTab === 'stages'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Pipeline Stages ({leadStages.length})
              </button>
            </div>

            {/* Tab 1: Categories */}
            {configTab === 'categories' && (
              <div className="pt-4 space-y-4">
                {/* Add new category form */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>{editingCatId ? 'Edit Lead Category' : 'Create New Lead Category'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Real Estate Investor Golden Visa"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                      <input
                        type="text"
                        value={newCatDescription}
                        onChange={(e) => setNewCatDescription(e.target.value)}
                        placeholder="e.g. High net worth investor inquiries"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={newCatIsJob}
                        onChange={(e) => setNewCatIsJob(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold">Mark as Job Application / Recruitment Category</span>
                    </label>

                    <div className="flex items-center gap-2">
                      {editingCatId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(null);
                            setNewCatName('');
                            setNewCatDescription('');
                            setNewCatIsJob(false);
                          }}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!newCatName.trim()) return;
                          if (editingCatId) {
                            updateLeadCategory(editingCatId, {
                              name: newCatName.trim(),
                              description: newCatDescription.trim(),
                              isJobCategory: newCatIsJob,
                            });
                            setEditingCatId(null);
                          } else {
                            addLeadCategory({
                              name: newCatName.trim(),
                              code: newCatName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_'),
                              description: newCatDescription.trim(),
                              color: newCatColor,
                              badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
                              badgeText: newCatName.trim(),
                              isJobCategory: newCatIsJob,
                            });
                          }
                          setNewCatName('');
                          setNewCatDescription('');
                          setNewCatIsJob(false);
                        }}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                      >
                        {editingCatId ? 'Save Changes' : 'Add Category'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Categories List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Existing Categories ({leadCategories.length})
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                    {leadCategories.map((cat) => (
                      <div key={cat.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cat.badgeBg || 'bg-blue-50 text-blue-700'}`}>
                            {cat.name}
                          </span>
                          {cat.isJobCategory && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                              Job Applicant Category
                            </span>
                          )}
                          {cat.description && (
                            <span className="text-xs text-slate-400 hidden sm:inline">&bull; {cat.description}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setNewCatName(cat.name);
                              setNewCatDescription(cat.description || '');
                              setNewCatIsJob(Boolean(cat.isJobCategory));
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteLeadCategory(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Sources */}
            {configTab === 'sources' && (
              <div className="pt-4 space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>{editingSourceId ? 'Edit Lead Channel / Source' : 'Add New Marketing / Inbound Channel'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Source Name *</label>
                      <input
                        type="text"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        placeholder="e.g. TikTok Ads / Exhibition Stand"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                      <input
                        type="text"
                        value={newSourceDesc}
                        onChange={(e) => setNewSourceDesc(e.target.value)}
                        placeholder="e.g. Annual Dubai GITEX Inquiries"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {editingSourceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSourceId(null);
                          setNewSourceName('');
                          setNewSourceDesc('');
                        }}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSourceName.trim()) return;
                        if (editingSourceId) {
                          updateLeadSource(editingSourceId, {
                            name: newSourceName.trim(),
                            description: newSourceDesc.trim(),
                          });
                          setEditingSourceId(null);
                        } else {
                          addLeadSource({
                            name: newSourceName.trim(),
                            code: newSourceName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_'),
                            description: newSourceDesc.trim(),
                            isActive: true,
                          });
                        }
                        setNewSourceName('');
                        setNewSourceDesc('');
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      {editingSourceId ? 'Save Channel' : 'Add Channel'}
                    </button>
                  </div>
                </div>

                {/* Sources list */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Active Inbound Channels ({leadSources.length})
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                    {leadSources.map((src) => (
                      <div key={src.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{src.name}</span>
                          {src.description && (
                            <p className="text-[11px] text-slate-500">{src.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSourceId(src.id);
                              setNewSourceName(src.name);
                              setNewSourceDesc(src.description || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Edit Source"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteLeadSource(src.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                            title="Delete Source"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Stages */}
            {configTab === 'stages' && (
              <div className="pt-4 space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>{editingStageId ? 'Edit Stage' : 'Add Pipeline Milestone Stage'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Stage Name *</label>
                      <input
                        type="text"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        placeholder="e.g. VIP Consultation Booked"
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Color Theme</label>
                      <input
                        type="color"
                        value={newStageColor}
                        onChange={(e) => setNewStageColor(e.target.value)}
                        className="w-full h-8 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {editingStageId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStageId(null);
                          setNewStageName('');
                        }}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!newStageName.trim()) return;
                        if (editingStageId) {
                          updateLeadStage(editingStageId, {
                            name: newStageName.trim(),
                            color: newStageColor,
                          });
                          setEditingStageId(null);
                        } else {
                          const key = newStageName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
                          addLeadStage({
                            name: newStageName.trim(),
                            stepNumber: leadStages.length + 1,
                            color: newStageColor,
                            badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
                            badgeText: newStageName.trim(),
                            statusKey: key,
                          });
                        }
                        setNewStageName('');
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      {editingStageId ? 'Save Stage' : 'Add Stage'}
                    </button>
                  </div>
                </div>

                {/* Stages List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Active Pipeline Stages ({leadStages.length})
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {leadStages.map((stg, idx) => (
                      <div key={stg.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stg.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({stg.statusKey})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingStageId(stg.id);
                              setNewStageName(stg.name);
                              setNewStageColor(stg.color || '#3B82F6');
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Edit Stage"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {leadStages.length > 2 && (
                            <button
                              onClick={() => deleteLeadStage(stg.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                              title="Delete Stage"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  setActiveTab('settings');
                }}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Open Full System Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Tasks, Notes, and Dossier Modal */}
      {detailLead && (
        <LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} />
      )}
    </div>
  );
};
