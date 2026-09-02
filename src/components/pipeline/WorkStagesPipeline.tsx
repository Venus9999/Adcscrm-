import React, { useState } from 'react';
import {
  Kanban,
  Filter,
  ArrowRight,
  ArrowLeft,
  Clock,
  User,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Settings,
  Shield,
  X,
  Sparkles,
  Search,
  UserCheck,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Client, WorkStage, StageCategory } from '../../types/crm';

interface WorkStagesPipelineProps {
  onOpenClientDetail: (clientId: string) => void;
}

export const WorkStagesPipeline: React.FC<WorkStagesPipelineProps> = ({ onOpenClientDetail }) => {
  const {
    filteredClients,
    stages,
    serviceCategories,
    users,
    updateServiceStage,
    updateClient,
    addCustomStage,
    updateStage,
    deleteStage,
    currentUser,
  } = useCRM();

  const isAdminOrMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  const [activeView, setActiveView] = useState<'board' | 'matrix'>('board');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Transition modal state
  const [transitionClient, setTransitionClient] = useState<Client | null>(null);
  const [targetStageId, setTargetStageId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [showTransitionModal, setShowTransitionModal] = useState(false);

  // Stage CRUD Modals
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [showEditStageModal, setShowEditStageModal] = useState(false);
  const [showDeleteStageModal, setShowDeleteStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<WorkStage | null>(null);

  // Add / Edit Stage Form State
  const [stageName, setStageName] = useState('');
  const [stageStepNumber, setStageStepNumber] = useState<number>(stages.length + 1);
  const [stageCategory, setStageCategory] = useState<StageCategory>('processing');
  const [stageColor, setStageColor] = useState('#3b82f6');
  const [stageDescription, setStageDescription] = useState('');
  const [stageRequiresUpload, setStageRequiresUpload] = useState(false);
  const [stageRequiresPayment, setStageRequiresPayment] = useState(false);

  const handleOpenTransition = (client: Client, targetId: string) => {
    setTransitionClient(client);
    setTargetStageId(targetId);
    setShowTransitionModal(true);
  };

  const handleConfirmTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionClient || !targetStageId) return;

    const srv = transitionClient.services?.[0];
    if (srv) {
      updateServiceStage(transitionClient.id, srv.id, targetStageId, remarks, followUpDate || undefined);
    } else {
      const targetStageObj = stages.find((s) => s.id === targetStageId);
      updateClient(transitionClient.id, {
        currentStageId: targetStageId,
        currentStageName: targetStageObj?.name || 'In Progress',
      });
    }

    setShowTransitionModal(false);
    setTransitionClient(null);
    setRemarks('');
    setFollowUpDate('');
  };

  const handleOpenAddStage = () => {
    if (!isAdminOrMaster) return;
    setStageName('');
    setStageStepNumber(stages.length + 1);
    setStageCategory('processing');
    setStageColor('#3b82f6');
    setStageDescription('');
    setStageRequiresUpload(false);
    setStageRequiresPayment(false);
    setShowAddStageModal(true);
  };

  const handleOpenEditStage = (st: WorkStage) => {
    if (!isAdminOrMaster) return;
    setSelectedStage(st);
    setStageName(st.name);
    setStageStepNumber(st.stepNumber);
    setStageCategory(st.category);
    setStageColor(st.color || '#3b82f6');
    setStageDescription(st.description || '');
    setStageRequiresUpload(!!st.requiresClientUpload);
    setStageRequiresPayment(!!st.requiresPaymentClearance);
    setShowEditStageModal(true);
  };

  const handleOpenDeleteStage = (st: WorkStage) => {
    if (!isAdminOrMaster) return;
    setSelectedStage(st);
    setShowDeleteStageModal(true);
  };

  const handleSaveAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) return;

    const badgeBg = `${stageColor}20`; // 20% opacity
    const badgeText = stageColor;

    addCustomStage({
      name: stageName.trim(),
      stepNumber: Number(stageStepNumber),
      category: stageCategory,
      color: stageColor,
      badgeBg,
      badgeText,
      description: stageDescription,
      requiresClientUpload: stageRequiresUpload,
      requiresPaymentClearance: stageRequiresPayment,
    });

    setShowAddStageModal(false);
  };

  const handleSaveEditStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage || !stageName.trim()) return;

    const badgeBg = `${stageColor}20`;
    const badgeText = stageColor;

    updateStage(selectedStage.id, {
      name: stageName.trim(),
      stepNumber: Number(stageStepNumber),
      category: stageCategory,
      color: stageColor,
      badgeBg,
      badgeText,
      description: stageDescription,
      requiresClientUpload: stageRequiresUpload,
      requiresPaymentClearance: stageRequiresPayment,
    });

    setShowEditStageModal(false);
    setSelectedStage(null);
  };

  const handleConfirmDeleteStage = () => {
    if (!selectedStage) return;
    deleteStage(selectedStage.id);
    setShowDeleteStageModal(false);
    setSelectedStage(null);
  };

  // Sort stages by step number
  const sortedStages = [...(stages || [])].sort((a, b) => a.stepNumber - b.stepNumber);
  const staffUsers = (users || []).filter((u) => u && u.role !== 'client');

  // Filter clients by stage, service, employee, and search query
  const getStageClients = (stageId: string) => {
    return (filteredClients || []).filter((c) => {
      if (!c) return false;
      const matchStage = c.currentStageId === stageId;
      const matchService =
        selectedServiceFilter === 'all' ||
        (c.services || []).some((s) => s.serviceId === selectedServiceFilter);
      const matchEmployee =
        selectedEmployeeFilter === 'all' ||
        (c.assignedEmployeeIds && c.assignedEmployeeIds.includes(selectedEmployeeFilter)) ||
        c.assignedEmployeeId === selectedEmployeeFilter ||
        c.assignedAdminId === selectedEmployeeFilter ||
        (c.services || []).some((s) => s.assignedEmployeeId === selectedEmployeeFilter);
      const matchSearch =
        !searchQuery.trim() ||
        (c.fullName && c.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.refNo && c.refNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.passportNo && c.passportNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.services || []).some((s) => s.assignedEmployeeName?.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStage && matchService && matchEmployee && matchSearch;
    });
  };

  const totalActivePipelineCases = sortedStages.reduce((acc, st) => acc + getStageClients(st.id).length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Workflow Stages & Pipeline</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {totalActivePipelineCases} Active Cases &bull; {stages.length} Stages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual tracking of applications across government clearance milestones & assigned PRO officers
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher - Stage Configuration is only accessible to Admin & Master */}
          {isAdminOrMaster ? (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setActiveView('board')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'board'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pipeline Board
              </button>
              <button
                onClick={() => setActiveView('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'matrix'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Stage Configuration ({stages.length})
              </button>
            </div>
          ) : null}

          {isAdminOrMaster && (
            <button
              onClick={handleOpenAddStage}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Filtering & PRO Employee Workload Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case, client, ref # or PRO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Employee / PRO Filter Dropdown (Visible to Master & Admin only) */}
            {(currentUser.role === 'master' || currentUser.role === 'admin') && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <select
                  value={selectedEmployeeFilter}
                  onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">All PRO Officers & Staff ({(staffUsers || []).length})</option>
                  {(staffUsers || []).map((u) => {
                    const empCases = (filteredClients || []).filter(
                      (c) =>
                        (c.assignedEmployeeIds && c.assignedEmployeeIds.includes(u.id)) ||
                        c.assignedEmployeeId === u.id ||
                        c.assignedAdminId === u.id ||
                        (c.services || []).some((s) => s.assignedEmployeeId === u.id)
                    ).length;
                    return (
                      <option key={u.id} value={u.id ?? ''}>
                        {u.name} ({empCases} active cases) - {u.role.toUpperCase()}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Service Category Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Service Categories ({(serviceCategories || []).length})</option>
                {(serviceCategories || []).map((s) => (
                  <option key={s.id} value={s.id ?? ''}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {(selectedEmployeeFilter !== 'all' || selectedServiceFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedEmployeeFilter('all');
                  setSelectedServiceFilter('all');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Staff Quick-Select Chips (Visible to Master & Admin only) */}
        {(currentUser.role === 'master' || currentUser.role === 'admin') && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Staff Workload:
            </span>
            <button
              onClick={() => setSelectedEmployeeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 cursor-pointer ${
                selectedEmployeeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Staff ({(filteredClients || []).length})
            </button>
            {(staffUsers || []).map((u) => {
              const count = (filteredClients || []).filter(
                (c) =>
                  (c.assignedEmployeeIds && c.assignedEmployeeIds.includes(u.id)) ||
                  c.assignedEmployeeId === u.id ||
                  c.assignedAdminId === u.id ||
                  (c.services || []).some((s) => s.assignedEmployeeId === u.id)
              ).length;
              const isSelected = selectedEmployeeFilter === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedEmployeeFilter(isSelected ? 'all' : u.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                  />
                  <span>{u.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {activeView === 'board' ? (
        /* Kanban Board Container (Horizontal Scroll) */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {sortedStages.map((stage) => {
              const stageClients = (filteredClients || []).filter((c) => {
                if (!c) return false;
                const matchStage = c.currentStageId === stage.id;
                const matchService =
                  selectedServiceFilter === 'all' ||
                  (c.services || []).some((s) => s.serviceId === selectedServiceFilter);
                return matchStage && matchService;
              });

              return (
                <div
                  key={stage.id}
                  className="w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 rounded-t-2xl">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                      <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-tight truncate">
                        {stage.stepNumber}. {stage.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stageClients.length > 0
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {stageClients.length}
                      </span>

                      {isAdminOrMaster && (
                        <div className="flex items-center">
                          <button
                            onClick={() => handleOpenEditStage(stage)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Stage"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteStage(stage)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Stage"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column Body Cards */}
                  <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-slate-950/20">
                    {stageClients.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-[11px] font-medium">No active cases</div>
                    ) : (
                      stageClients.map((client) => {
                        const activeSrv = client.services?.[0];
                        const currentIdx = sortedStages.findIndex((s) => s.id === stage.id);
                        const nextStage = sortedStages[currentIdx + 1];
                        const prevStage = sortedStages[currentIdx - 1];

                        return (
                          <div
                            key={client.id}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-500 transition-all group"
                          >
                            <div
                              onClick={() => onOpenClientDetail(client.id)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                                  {client.fullName}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                  {client.refNo}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                {activeSrv?.serviceName || 'Standard Processing'}
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                                <span>PRO: {activeSrv?.assignedEmployeeName || 'Assigned Staff'}</span>
                                <span className="font-mono">{client.nationality}</span>
                              </div>
                            </div>

                            {/* Quick Advance Controls */}
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                              {prevStage ? (
                                <button
                                  onClick={() => handleOpenTransition(client, prevStage.id)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  title={`Back to: ${prevStage.name}`}
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              ) : <div />}

                              {nextStage && (
                                <button
                                  onClick={() => handleOpenTransition(client, nextStage.id)}
                                  className="px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Advance</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
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
        </div>
      ) : (
        /* Stage Configuration Matrix View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Step #</th>
                  <th className="py-3 px-4">Stage Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Active Cases</th>
                  <th className="py-3 px-4">Prerequisites</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sortedStages.map((stage) => {
                  const clientCount = (filteredClients || []).filter((c) => c && c.currentStageId === stage.id).length;
                  return (
                    <tr key={stage.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        {stage.stepNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{stage.name}</span>
                            {stage.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5">{stage.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {stage.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-blue-600 font-mono">{clientCount} active cases</span>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        {stage.requiresClientUpload && (
                          <div className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                            <span>Requires Client Doc Upload</span>
                          </div>
                        )}
                        {stage.requiresPaymentClearance && (
                          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span>Requires Payment Clearance</span>
                          </div>
                        )}
                        {!stage.requiresClientUpload && !stage.requiresPaymentClearance && (
                          <span className="text-slate-400 text-[11px]">Standard clearance</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditStage(stage)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            title="Edit Stage"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteStage(stage)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete Stage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Stage Modal */}
      {showAddStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Workflow Stage</h3>
              <button onClick={() => setShowAddStageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddStage} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stage Name *
                </label>
                <input
                  type="text"
                  required
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="e.g. VIP Tawjeeh Worker Orientation"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Step Sequence #
                  </label>
                  <input
                    type="number"
                    required
                    value={stageStepNumber}
                    onChange={(e) => setStageStepNumber(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Milestone Category
                  </label>
                  <select
                    value={stageCategory}
                    onChange={(e) => setStageCategory(e.target.value as StageCategory)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="inquiry">Inquiry / Intake</option>
                    <option value="documentation">Documentation / Attestation</option>
                    <option value="processing">Government Processing</option>
                    <option value="authority">Authority Visit / Biometrics</option>
                    <option value="approval">Final Approval / Stamping</option>
                    <option value="completed">Completed / Handover</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stageColor}
                    onChange={(e) => setStageColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={stageColor}
                    onChange={(e) => setStageColor(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stage Description & Instructions
                </label>
                <textarea
                  rows={2}
                  value={stageDescription}
                  onChange={(e) => setStageDescription(e.target.value)}
                  placeholder="e.g. Schedule applicant for biometric appointment and collect clearance report."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stageRequiresUpload}
                    onChange={(e) => setStageRequiresUpload(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Requires mandatory document upload before advance</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stageRequiresPayment}
                    onChange={(e) => setStageRequiresPayment(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Requires 100% invoice settlement before milestone completion</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStageModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Create Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stage Modal */}
      {showEditStageModal && selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Workflow Stage</h3>
              <button onClick={() => setShowEditStageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStage} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stage Name *
                </label>
                <input
                  type="text"
                  required
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Step Sequence #
                  </label>
                  <input
                    type="number"
                    required
                    value={stageStepNumber}
                    onChange={(e) => setStageStepNumber(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Milestone Category
                  </label>
                  <select
                    value={stageCategory}
                    onChange={(e) => setStageCategory(e.target.value as StageCategory)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="inquiry">Inquiry / Intake</option>
                    <option value="documentation">Documentation / Attestation</option>
                    <option value="processing">Government Processing</option>
                    <option value="authority">Authority Visit / Biometrics</option>
                    <option value="approval">Final Approval / Stamping</option>
                    <option value="completed">Completed / Handover</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stageColor}
                    onChange={(e) => setStageColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={stageColor}
                    onChange={(e) => setStageColor(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stage Description & Instructions
                </label>
                <textarea
                  rows={2}
                  value={stageDescription}
                  onChange={(e) => setStageDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stageRequiresUpload}
                    onChange={(e) => setStageRequiresUpload(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Requires mandatory document upload before advance</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stageRequiresPayment}
                    onChange={(e) => setStageRequiresPayment(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Requires 100% invoice settlement before milestone completion</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditStageModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Stage Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Stage Modal */}
      {showDeleteStageModal && selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">Delete Workflow Stage</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Are you sure you want to remove stage <strong>{selectedStage.stepNumber}. {selectedStage.name}</strong>?
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteStageModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStage}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transition Remarks Modal */}
      {showTransitionModal && transitionClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Advance Work Stage</h3>
            <p className="text-xs text-slate-500 mb-4">
              Moving <strong>{transitionClient.fullName}</strong> to{' '}
              <strong className="text-blue-600">
                {stages.find((s) => s.id === targetStageId)?.name}
              </strong>
            </p>

            <form onSubmit={handleConfirmTransition} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Target Workflow Stage
                </label>
                <select
                  value={targetStageId}
                  onChange={(e) => setTargetStageId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {sortedStages.map((st) => (
                    <option key={st.id} value={st.id ?? ''}>
                      {st.stepNumber}. {st.name} ({st.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Officer Remarks / Government Reference *
                </label>
                <textarea
                  required
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Application lodged on ICP portal, biometric token received..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Next Follow-up Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransitionModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Update Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
